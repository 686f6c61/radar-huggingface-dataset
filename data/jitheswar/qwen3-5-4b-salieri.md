# Jitheswar/Qwen3.5-4B-Salieri

## Resumen

Qwen3.5-4B-Salieri es un modelo de 4B parámetros especializado en agentes de ingeniería de software, desarrollado por el usuario Jitheswar como un ajuste fino de Jitheswar/Qwen3.5-4B-Amadeus, a su vez una versión abliterated de Qwen/Qwen3.5-4B del equipo Qwen. El modelo está entrenado para operar como agente autónomo de SWE: explorar un repositorio mediante herramientas, localizar la causa de un issue, editar código, ejecutar tests y enviar un parche.

La arquitectura es la del Qwen3.5-4B original (transformer híbrido con torre de visión intacta, contexto de 262K y modo thinking nativo), sobre la que se aplica un ajuste DPO a nivel de paso contra bucles de acciones. El modelo conserva el formato nativo de tool calling de Qwen3.5 y el soporte multimodal image-text-to-text.

Es relevante porque aborda un problema concreto y bien documentado en agentes pequeños: la reemisión exacta de la misma llamada a herramienta. El autor reporta una reducción del 6,3% al 0,4% en tasa de repeticiones exactas dentro de presupuesto en el split de desarrollo, con mejoras en LiveCodeBench v6 (34,0 a 42,9) e IFEval prompt-strict (61,4 a 74,9) respecto a su base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido de Qwen3.5-4B (con torre de visión y modo thinking) |
| Parámetros totales | 4.539.265.536 (4,54B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 262K (entrenado por el base); el ejemplo de despliegue usa `--max-model-len 65536` |
| Tipos de cuantización | BF16, Q8_0, Q6_K, Q4_K_M (+ mmproj para visión) en GGUF; LoRA bf16 r64 para entrenamiento |
| Idiomas soportados | Inglés (en), chino (zh), multilingüe |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) y GGUF (llama.cpp / LM Studio / Ollama) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer híbrido con decodificación thinking, formato nativo de tool calling y una torre de visión que el ajuste no modifica. Sobre esa base abliterated (Amadeus) se aplica un DPO a nivel de paso (step-level) contra bucles de acciones, con un término de NLL sobre la secuencia elegida (RPO). Los pares se construyeron a partir de 558 estados de rollouts de agente en los que un modelo empezaba a repetirse; un profesor Qwen3.8-27B generó el siguiente paso en el mismo contexto (4 muestras, conservando una llamada limpia distinta de la repetición), produciendo 448 pares con elegido = paso del profesor y rechazado = la repetición.

El entrenamiento usó DPO con beta 0.1 más 0.2 de NLL sobre el elegido, LoRA bf16 r64 con Unsloth, 2 épocas y learning rate 1e-5, tomando como referencia el modelo base. El 10% de las sesiones se reservó para validación, con una precisión de pares de 0.95. Los datos de tareas provienen de nvidia/Open-SWE-Traces (CC-BY-4.0, tareas de Scale-SWE y SWE-rebench-V2). El autor declara explícitamente que no se usaron repositorios de benchmark en entrenamiento (se descartaron más de 522 trayectorias de repos presentes en cualquier conjunto de evaluación) y que la selección de checkpoints se hizo solo sobre splits de desarrollo.

## Capacidades

- Generación de texto, razonamiento con modo thinking y resolución de problemas de código.
- Agente autónomo de SWE: exploración de repositorio, localización de causa raíz, edición, ejecución de tests y envío de parche.
- Tool calling nativo compatible con el parser `qwen3_coder` de vLLM y con cualquier harness de agente compatible con OpenAI que use llamadas nativas.
- Conjunto de herramientas genéricas validado: `run_command`, `read_file`, `edit_file`, `write_file`, `get_status`, `submit_patch`.
- Razonamiento multi-paso con presupuesto acotado (hasta 60 llamadas a herramienta y 20 minutos por tarea en la evaluación del autor).
- Capacidades multimodales image-text-to-text heredadas del base (torre de visión intacta durante el entrenamiento).
- Multilingüe limitado a inglés, chino y categoría genérica multilingüe.

## Casos de uso

- Resolución automática de issues en repositorios: el modelo recibe el issue, explora el árbol de código con `read_file` y `run_command`, aplica el parche con `edit_file` y lo valida con tests antes de `submit_patch`. Adecuado por su entrenamiento específico en este flujo y su ventana de contexto amplia.
- Triage y localización de bugs en CI: integrado en un pipeline que se dispare ante un test fallido, el modelo puede reproducir el fallo, inspeccionar el stack trace y proponer un diff acotado para revisión humana.
- Migraciones y refactors repetitivos: con `run_command` para compilar y testear tras cada cambio, el modelo puede aplicar transformaciones mecánicas sobre múltiples ficheros y verificar que la suite sigue en verde.
- Asistente de mantenimiento en local: las cuantizaciones GGUF Q4_K_M y Q6_K permiten ejecutarlo con llama.cpp, LM Studio u Ollama en estaciones de trabajo sin GPU de datacenter, útil para tareas de código sobre repositorios privados.
- Generación de parches en entornos air-gapped: al publicarse pesos safetensors y GGUF con licencia Apache-2.0, puede desplegarse en infraestructura propia sin dependencia de APIs externas.
- Automatización de tests de regresión: el modelo puede escribir tests nuevos a partir del código existente y ejecutarlos con `run_command`, usando el bucle de herramientas para iterar hasta que pasen.
- Análisis de imágenes de diagramas o capturas de error: gracias a la torre de visión heredada, puede recibir una captura de pantalla de un fallo o un diagrama de arquitectura junto al contexto textual del repositorio.

## Benchmarks y rendimiento

Datos reportados por el autor (mismas condiciones para Salieri y su base: modo thinking, temperature 0.6, top-p 0.95, top-k 20, vLLM 0.32; medias sobre 2 semillas en las métricas agénticas).

| Agéntico (SWE, tasa de resolución %) | Amadeus (base) | Salieri | Rango por semilla |
|---|---|---|---|
| holdout_sound (47) | 22,3 | 20,2 (dentro del ruido entre semillas) | 9-10 resueltas |
| ood_sound (30) | 56,7 | 63,3 | 18-20 resueltas |
| ext_final (67, lockbox) | 21,6 | 23,1 | 15-16 resueltas |

| Código / instrucciones (pass@1, 4 muestras) | Amadeus (base) | Salieri |
|---|---|---|
| HumanEval+ | 87,0 | 87,5 |
| MBPP+ | 68,5 | 68,6 |
| LiveCodeBench v6 (2025-02..05) | 34,0 | 42,9 |
| IFEval prompt-strict | 61,4 | 74,9 |

En la selección sobre splits de desarrollo el autor reporta 75/252 tareas resueltas frente a 70/252 del base (pareado, 2 semillas). El conjunto lockbox (`ext_final`, 67 tareas de más de 15 repositorios) se evaluó una sola vez, con 2 semillas, únicamente para el modelo final y tras congelar la selección.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, aproximadamente 9 GB solo para pesos (4,54B parámetros), más KV cache; en Q8_0 alrededor de 5 GB; en Q6_K alrededor de 4 GB; en Q4_K_M alrededor de 3 GB. Añadir el mmproj para visión.
- GPU recomendadas: A100 o H100 para BF16 con contexto largo; RTX 4090 (24 GB) para BF16 con contexto moderado o Q8_0 con contexto amplio; RTX 3090/4080 (16-24 GB) para cuantizaciones de 8 bits.
- Cabe en GPU de consumo: sí, en Q4_K_M y Q6_K en GPUs de 8-12 GB, y en BF16 en GPUs de 16 GB o más con contexto reducido.
- Opciones de despliegue: vLLM (comando del autor con `--enable-auto-tool-choice --tool-call-parser qwen3_coder --reasoning-parser qwen3`), llama.cpp, LM Studio y Ollama mediante los GGUF incluidos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-Salieri | 4,54B | 262K (base) | Agente SWE con DPO a nivel de paso | Apache-2.0 | Hugging Face (safetensors + GGUF) |
| Qwen3.5-4B-Amadeus (base directo) | 4,54B | 262K | Base abliterated sin ajuste agéntico | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base original) | 4,54B | 262K | Modelo generalista multimodal con tool calling | Apache-2.0 | Hugging Face |
| Qwen3.8-27B (profesor del dataset) | 27B (no confirmado) | No disponible | Modelo mayor usado como profesor | Apache-2.0 | Hugging Face |

Frente a su base directo, Salieri mejora en LiveCodeBench v6 (+8,9 puntos), IFEval prompt-strict (+13,5) y en el conjunto lockbox (23,1% frente a 21,6%), con un rendimiento prácticamente idéntico en HumanEval+ y MBPP+ y una ligera caída en holdout_sound atribuida por el autor al ruido entre semillas. No se dispone de datos de benchmarks de otros modelos comparables de 4B en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo de 4B: resuelve una minoría de issues reales de repositorio (23,1% en el lockbox de 67 tareas) y puede entrar en bucles en tareas difíciles pese al entrenamiento contra repeticiones.
- La evaluación se hizo principalmente en un único harness sin Docker, con un conjunto de 6 herramientas genéricas; solo se comprobó adicionalmente un conjunto de herramientas basado únicamente en bash.
- El base es abliterated: el modelo rechaza poco y no incorpora salvaguardas propias; es responsabilidad del despliegue añadirlas.
- Riesgo de alucinación inherente a modelos de este tamaño, especialmente al razonar sobre código que no ha podido inspeccionar con herramientas.
- Cobertura idiomática declarada limitada a inglés, chino y multilingüe genérico; no hay evaluación específica en castellano.
- La licencia Apache-2.0 permite uso comercial, pero los datos de entrenamiento (nvidia/Open-SWE-Traces, CC-BY-4.0) y las tareas de origen (Scale-SWE, SWE-rebench-V2) deben verificarse para cumplir sus condiciones de atribución.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay validación independiente de los resultados reportados por el autor.
- El contexto nativo es de 262K, pero el ejemplo de despliegue del autor limita `--max-model-len` a 65536; usar la ventana completa exige más VRAM para KV cache.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jitheswar/Qwen3.5-4B-Salieri
- Modelo base directo: https://huggingface.co/Jitheswar/Qwen3.5-4B-Amadeus
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/Open-SWE-Traces
- Paper Open-SWE-Traces (Ahmad et al.): arXiv:2606.16038
- Paper Harness2 (google-research/harness2): arXiv:2610.14224
- Repositorio Harness2: https://github.com/google-research/harness2
- Unsloth: https://github.com/unslothai/unsloth
- DPO (Rafailov et al. 2023): referencia citada en la model card, sin enlace directo
- RPO (Pang et al. 2024): referencia citada en la model card, sin enlace directo
