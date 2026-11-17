# shivrajgurjar/Alok-v3-14B-NSLRE

## Resumen

Alok v3.0 es un modelo de lenguaje de 14.770.033.664 parámetros (aproximadamente 14,77B, aunque el autor lo anuncia como 14,85B) desarrollado por el usuario shivrajgurjar y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un ajuste fino (finetune) del modelo deepseek-ai/DeepSeek-R1-Distill-Qwen-14B, es decir, parte de la arquitectura Qwen2 y hereda la destilación de razonamiento de DeepSeek-R1. El autor lo presenta como un "motor neuro-simbólico de largo horizonte y ciencia ómnibus", orientado a razonamiento, ingeniería de software, química, biología y demostración de teoremas.

La propuesta del modelo no es solo un checkpoint de pesos, sino un conjunto de capas de software que el autor empaqueta junto al backbone: un "cortex" de razonamiento profundo, un crítico cognitivo de doble cabeza, un arquitecto multi-archivo con auto-depuración iterativa y un kernel determinista que orquesta herramientas externas (RDKit para química, Biopython para genética, Z3 para optimización de decisiones y SymPy para cálculo). El modelo base aporta la generación de texto y el razonamiento; las herramientas aportan la verificación simbólica.

Es relevante ahora porque ejemplifica una tendencia creciente: modelos abiertos de tamaño medio (14B) que combinan un LLM con un arnés neuro-simbólico para tareas de razonamiento verificable, en lugar de escalar parámetros. No obstante, la información publicada es escasa y proviene casi exclusivamente de la model card del autor, sin resultados de benchmarks estándar independientes ni documentación sobre el dataset de ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino de DeepSeek-R1-Distill-Qwen-14B |
| Parametros totales | 14.770.033.664 (14,77B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no confirmada en la informacion) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; no se documentan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (la model card menciona "Literary English" y "English Craft") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El backbone es un transformer decoder-only de la familia Qwen2, fruto de un ajuste fino sobre DeepSeek-R1-Distill-Qwen-14B. Ese modelo base es a su vez una destilación de DeepSeek-R1 sobre Qwen2-14B, por lo que el modelo hereda el estilo de razonamiento con cadenas de pensamiento largas y el tokenizador de Qwen2. El autor describe el resultado como un "backbone bfloat16 de 14,85B" con "adaptadores de razonamiento multi-sector auto-destilados", aunque no se detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La innovación declarada no está en el transformer sino en el arnés que lo rodea. El autor describe cuatro "pilares": (1) un cortex de razonamiento profundo y prosa literaria; (2) un crítico cognitivo de doble cabeza (`dual_critic.pt`) que, según la model card, alcanza un 100% de precisión de ranking en validación sobre las cabezas de lógica y prosa; (3) un arquitecto multi-archivo de largo horizonte con auto-depuración iterativa y refinado de prosa en tres etapas; y (4) un kernel determinista que ejecuta un sandbox de repositorios multi-archivo y llama a RDKit, Biopython, Z3 y SymPy. También se menciona MCTS (búsqueda en árbol de Monte Carlo) entre las etiquetas, aunque no se documenta su uso concreto. No hay información sobre decodificación especulativa ni atención lineal.

## Capacidades

- Generación de texto y razonamiento con cadenas de pensamiento largas, heredadas de la destilación de DeepSeek-R1.
- Razonamiento orientado a ingeniería de software: planificación multi-archivo, detección de ciclos en DAG topológicos y auto-depuración iterativa sobre un sandbox de repositorios.
- Química medicinal: generación y análisis de descriptores SMILES, valencia y propiedades moleculares mediante RDKit.
- Genética molecular: traducción de codones y comparación de mutaciones puntuales (por ejemplo, hemoglobina salvaje frente a mutación falciforme) mediante Biopython.
- Teoría de decisiones y optimización con restricciones mediante Z3.
- Física y cálculo: resolución de ecuaciones diferenciales e integrales mediante SymPy.
- Redacción en inglés con refinado por rúbrica en tres etapas y puntuación de un crítico.
- Soporte de tool calling: implícito en el diseño del kernel (llamadas a RDKit, Biopython, Z3, SymPy), aunque no se documenta un protocolo de function calling estándar.
- Capacidades multilingües: no documentadas; la model card se centra en inglés.

## Casos de uso

- Asistente de ingeniería de software multi-archivo: el modelo puede planificar cambios que afectan a varios ficheros de un repositorio, ejecutar pruebas en un sandbox determinista y depurar iterativamente. Es adecuado por el "Long-Horizon Multi-File Architect" y el runner topológico descritos en la model card.
- Química computacional asistida: generación de SMILES y cálculo de descriptores (peso molecular, donadores y aceptores de enlace de hidrógeno, anillos) mediante RDKit, útil para triaje de moléculas en fases tempranas de descubrimiento.
- Bioinformática educativa y de investigación: traducción de codones y análisis de mutaciones puntuales con Biopython, por ejemplo para explicar el efecto de una variante en la proteína resultante.
- Optimización de recursos con restricciones: formulación y resolución de problemas de asignación (por ejemplo, reparto de throughput entre servidores) mediante Z3, con solución verificable.
- Tutoría de matemáticas y física: resolución paso a paso de EDOs e integrales con SymPy como verificador simbólico, lo que reduce el riesgo de errores aritméticos en la respuesta final.
- Generación y revisión de ensayos técnicos o filosóficos en inglés: el refinado en tres etapas con crítico de rúbrica permite iterar sobre borradores hasta alcanzar una puntuación objetivo.
- Prototipado de pipelines neuro-simbólicos: sirve como referencia para equipos que quieran combinar un LLM de 14B con herramientas deterministas y un crítico de validación.

## Benchmarks y rendimiento

La model card solo publica una "Omni-Domain Torture Suite" propia, de seis tareas, con resultados de aprobado/no aprobado y pruebas simbólicas asociadas. No son benchmarks estándar (MMLU, HumanEval, GSM8K) y no se comparan con otros modelos.

| Sector | Tarea | Resultado | Prueba del kernel |
|---|---|---|---|
| Repositorio de largo horizonte | Runner DAG multi-archivo + detección de ciclos | PASS (Att=1) | 3 ficheros verificados vía PYTHONPATH pytest/runner |
| Química medicinal | Descriptores SMILES de serotonina (RDKit) | PASS | C10H12N2O, MW=176.22, HBD=3, HBA=2, Rings=2 |
| Genética molecular | Hemoglobina salvaje vs mutación puntual falciforme (Biopython) | PASS (Att=1) | Traducción exacta de codón y polipéptido verificada |
| Teoría de decisiones | Optimización de throughput con restricciones (Z3) | PASS (Att=1) | S1=38, S2=6, S3=6, max_T=432 |
| Física y cálculo | EDO de oscilador armónico amortiguado (SymPy) | PASS (Att=1) | (sin(2*t) + 2*cos(2*t))*exp(-t) |
| Redacción en inglés | Ensayo filosófico pulido con rúbrica en 3 etapas | PASS | Puntuación del crítico: 0.924 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MATH) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 29,5 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 32-40 GB.
- Cuantización: no se documentan versiones GGUF, AWQ ni GPTQ; sin ellas, no cabe en GPUs de consumo de 24 GB en bf16.
- GPU recomendadas: A100 40GB/80GB, H100, L40S o dos RTX 4090 (24 GB cada una) con tensor parallelism o sharding por capas.
- GPU de consumo: una RTX 4090 de 24 GB no es suficiente en bf16; requeriría cuantización, que no está publicada.
- Despliegue: transformers con `device_map="auto"` (documentado en la model card), y previsiblemente vLLM o TGI por la compatibilidad declarada con text-generation-inference; llama.cpp y Ollama no están confirmados al no haber GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Alok v3.0 14B NSLRE | 14,77B | no disponible | Apache 2.0 | Finetune de DeepSeek-R1-Distill-Qwen-14B con arnés neuro-simbólico propio |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-14B | 14,77B | 128K (según el modelo base) | MIT (según el modelo base) | Modelo base; benchmarks estándar publicados por DeepSeek |
| Qwen2.5-14B-Instruct | 14,77B | 128K | Apache 2.0 | Alternativa generalista con soporte de tool calling y amplia comunidad |
| DeepSeek-R1-Distill-Llama-8B | 8B | 128K | MIT | Alternativa más ligera de la misma familia de destilados de razonamiento |

No se dispone de datos de rendimiento comparativo del modelo frente a estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks estándar independientes: los únicos resultados son una suite propia de seis tareas, sin comparación con modelos de referencia.
- La model card mezcla el modelo de pesos con un arnés de software (cortex, crítico, arquitecto, kernel) que no forma parte del checkpoint de Hugging Face; el rendimiento descrito depende de ese código adicional, no solo de los safetensors.
- Cero descargas y cero "likes" en el momento de la ficha: no hay evidencia de uso ni validación por parte de la comunidad.
- Idiomas no documentados; el material se centra en inglés ("Literary English", "English Craft"), por lo que el rendimiento en castellano es incierto.
- Longitud de contexto no confirmada para este finetune; se desconoce si conserva la ventana del modelo base.
- Riesgo de alucinación en razonamiento: aunque el arnés simbólico verifica resultados de RDKit, Biopython, Z3 y SymPy, las partes generativas (planificación, prosa, explicaciones) no están verificadas formalmente.
- Las herramientas externas requieren instalación y versiones compatibles; el "sandbox determinista" no se detalla y su aislamiento de seguridad no está documentado.
- Licencia Apache 2.0 declarada, pero conviene verificar que las condiciones del modelo base (DeepSeek-R1-Distill-Qwen-14B) sean compatibles con el uso comercial previsto.
- Fecha de creación anómala (2026-11-17) en los metadatos de Hugging Face; conviene tratarla con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shivrajgurjar/Alok-v3-14B-NSLRE
- Demo (Space): https://huggingface.co/spaces/shivrajgurjar/Alok-v3-Showcase
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-14B
