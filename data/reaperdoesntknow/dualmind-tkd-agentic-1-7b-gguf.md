# reaperdoesntknow/DualMind-TKD-Agentic-1.7B-GGUF

## Resumen

DualMind-TKD-Agentic-1.7B-GGUF es un modelo de lenguaje de 1.720.574.976 parámetros (aproximadamente 1,7 mil millones) publicado por el usuario reaperdoesntknow en Hugging Face. Se distribuye exclusivamente en formato GGUF, lo que lo orienta al despliegue local mediante llama.cpp y herramientas compatibles. La model card lo identifica como un fine-tuning del linaje Qwen3 (según las etiquetas del repositorio) convertido a GGUF con Unsloth, y el nombre sugiere un enfoque en uso agéntico y conversacional.

El modelo se presenta como una opción ligera para inferencia en hardware de consumo: con 1,7B parámetros, las cuantizaciones Q4_K_M, Q6_K y Q8_0 caben con holgura en GPUs de gama media e incluso en CPU con memoria RAM suficiente. El repositorio ocupa 8,7 GB, lo que corresponde al conjunto de las tres cuantizaciones publicadas.

La información pública es escasa: no se detallan datos de entrenamiento, composición del dataset, licencia, idiomas soportados ni resultados de benchmarks. Cualquier evaluación rigurosa debe partir de la experimentación directa con los pesos publicados, no de la documentación del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (linaje Qwen3, según tags del repo; detalles no disponibles) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q6_K, Q8_0 (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); no se publican safetensors en este repo |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna más allá de las etiquetas del repositorio, que apuntan a Qwen3 como modelo base. Se trata, por tanto, de un transformer decoder-only de aproximadamente 1,7B parámetros afinado y convertido a GGUF mediante Unsloth, herramienta que acelera el fine-tuning y la exportación a cuantizaciones GGUF.

No se especifica el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT supervisado. El sufijo "TKD" y el término "Agentic" en el nombre sugieren un ajuste orientado a tareas de agente y conversación multi-turno, pero el autor no documenta la metodología. Tampoco hay información sobre innovaciones técnicas (atención lineal, decodificación especulativa, modos de razonamiento explícito) más allá de lo que herede del modelo base Qwen3.

## Capacidades

- Generación de texto conversacional, según la etiqueta "conversational" del repositorio.
- Orientación a uso agéntico y multi-step reasoning, inferida del nombre del modelo, no verificada en documentación.
- Compatibilidad con llama.cpp mediante `llama-cli` con plantilla Jinja (`--jinja`), según la model card.
- Compatibilidad declarada con `llama-mtmd-cli`, la CLI multimodal de llama.cpp; el autor incluye la instrucción pero no confirma que el modelo tenga capacidades de visión.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Capacidades multilingües: no disponible.
- Modo thinking explícito: no disponible.

## Casos de uso

- Asistente conversacional local: al ser un modelo de 1,7B en GGUF, puede ejecutarse en portátiles y equipos sin GPU dedicada mediante llama.cpp u Ollama, ofreciendo un chatbot privado sin conexión a servicios externos.
- Prototipado de agentes ligeros: el nombre "Agentic" sugiere un ajuste para flujos de herramienta y razonamiento por pasos; encaja en pipelines de prueba donde el coste por token importa más que la precisión máxima.
- Automatización de tareas de texto en el borde (edge): clasificación, extracción de entidades o resumen de documentos cortos en entornos con recursos limitados.
- Enseñanza y experimentación: modelo de tamaño reducido para estudiar fine-tuning, cuantización GGUF y despliegue con llama.cpp en cursos o laboratorios.
- Integración en aplicaciones de escritorio: al distribuirse en GGUF, se puede empaquetar con llama.cpp dentro de apps nativas sin dependencias de servidores.
- Evaluación comparativa de cuantizaciones: el repositorio publica Q4_K_M, Q6_K y Q8_0, lo que permite medir la degradación de calidad frente al coste de memoria en un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (1,72B parámetros, pesos en GGUF):
  - Q4_K_M: aproximadamente 1,1-1,3 GB de pesos; en torno a 2-3 GB de VRAM total con contexto moderado.
  - Q6_K: aproximadamente 1,5-1,7 GB de pesos; en torno a 2,5-3,5 GB de VRAM total.
  - Q8_0: aproximadamente 1,9-2,1 GB de pesos; en torno a 3-4 GB de VRAM total.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090, A100, H100). El modelo es sobredimensionado para GPUs de datacenter; su hábitat natural es el consumo.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs modernas con 4 GB o más, y también en CPU con 4-8 GB de RAM libre.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`), Ollama (importando el GGUF), LM Studio, Jan y cualquier runtime compatible con GGUF. vLLM y TGI requieren pesos safetensors, no publicados en este repositorio.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| DualMind-TKD-Agentic-1.7B-GGUF | 1,72B | no disponible | GGUF | no disponible | Fine-tuning de linaje Qwen3, orientado a agentes |
| Qwen3-1.7B | 1,7B | no disponible en esta ficha | safetensors, GGUF (oficial) | Apache 2.0 (según publicación oficial de Qwen) | Modelo base del que deriva; documentación y benchmarks oficiales disponibles |
| Llama 3.2 1B | 1,2B | 128K | safetensors, GGUF | Llama 3.2 Community License | Alternativa ligera con contexto largo documentado |
| Gemma 3 1B | 1B | 32K | safetensors, GGUF | Gemma Terms of Use | Alternativa de Google con visión en variantes mayores |

La comparación con Qwen3-1.7B es la más relevante: DualMind parte presumiblemente de ese modelo, pero carece de la documentación, benchmarks y licencia explícita que sí publica el modelo oficial. Para producción seria, conviene partir del Qwen3-1.7B oficial salvo que se valide empíricamente una mejora del fine-tuning.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial. Es un riesgo bloqueante para producción hasta que el autor lo aclare.
- Idiomas soportados no documentados: no hay garantía de calidad en castellano ni en otros idiomas distintos del inglés.
- Ausencia total de benchmarks: no hay evidencia publicada de rendimiento en MMLU, HumanEval, GSM8K ni tareas agénticas.
- Riesgo de alucinación: inherente a modelos de 1,7B, especialmente en razonamiento multi-paso y datos factuales.
- Contexto desconocido: no se indica la ventana máxima; asumir valores conservadores hasta verificarlo.
- Un solo "like" y autor sin trayectoria verificable: el modelo no ha pasado revisión comunitaria; tratar los pesos con cautela.
- El uso de `llama-mtmd-cli` en la model card no implica capacidades multimodales; puede ser una plantilla genérica del autor.
- Sin safetensors publicados: no se puede hacer fine-tuning directo desde este repositorio sin convertir el GGUF o localizar los pesos originales.
- Fecha de creación (2026-07-18) posterior a la mayoría de referencias conocidas: verificar la procedencia y el linaje real del modelo antes de confiar en las etiquetas.

## Enlaces

- Hugging Face: https://huggingface.co/reaperdoesntknow/DualMind-TKD-Agentic-1.7B-GGUF
- Unsloth (herramienta de fine-tuning y conversión): https://github.com/unslothai/unsloth
- llama.cpp (runtime GGUF): https://github.com/ggml-org/llama.cpp
- Qwen3 (linaje del modelo base, según tags): https://huggingface.co/Qwen
