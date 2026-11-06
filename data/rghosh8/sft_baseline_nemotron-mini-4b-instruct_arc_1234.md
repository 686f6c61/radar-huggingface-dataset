# rghosh8/SFT_baseline_Nemotron-Mini-4B-Instruct_arc_1234

## Resumen

`rghosh8/SFT_baseline_Nemotron-Mini-4B-Instruct_arc_1234` es un ajuste fino supervisado (SFT) del modelo `nvidia/Nemotron-Mini-4B-Instruct`, publicado por el usuario `rghosh8` en Hugging Face. Se trata de un checkpoint experimental de investigación, generado con la librería TRL (versión 1.15.0), cuyo propósito aparente es servir como línea base (*baseline*) en experimentos de ajuste supervisado sobre el conjunto de datos ARC, con semilla 1234. No es un modelo de producción ni una versión oficial de NVIDIA.

El modelo hereda la arquitectura y el tamaño del Nemotron-Mini-4B-Instruct original: aproximadamente 4.190 millones de parámetros (4,19 B), pesos en formato safetensors y un repositorio de 8,4 GB. La model card es mínima y no documenta hiperparámetros, composición del dataset, número de tokens de entrenamiento ni resultados de evaluación, por lo que la mayor parte de las especificaciones técnicas deben inferirse del modelo base o marcarse como no disponibles.

Su relevancia es limitada y acotada al ámbito de la investigación: sirve para reproducir o comparar experimentos de SFT sobre una base conocida, pero carece de licencia declarada, de idiomas documentados y de cualquier validación de rendimiento publicada. Cualquier uso en producción debería partir del modelo base original de NVIDIA, que sí cuenta con documentación y licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de nvidia/Nemotron-Mini-4B-Instruct; detalles no disponibles en la model card) |
| Parametros totales | 4.190.509.056 (4,19 B) |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible en la model card (depende del modelo base) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin contenido) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 8,4 GB |
| Modelo base | nvidia/Nemotron-Mini-4B-Instruct |
| Libreria | transformers |
| Framework de entrenamiento | TRL 1.15.0, Transformers 5.17.0, PyTorch 2.13.0+cu129, Datasets 5.1.0, Tokenizers 0.23.3 |
| Metodo de ajuste | SFT (supervised fine-tuning) |
| Semilla | 1234 (según el nombre del checkpoint) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado del checkpoint `nvidia/Nemotron-Mini-4B-Instruct`, un transformer decoder-only de 4,19 B de parámetros. La model card no describe la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención, uso de GQA/MQA, etc.), por lo que esos detalles deben consultarse en la documentación del modelo base de NVIDIA. Tampoco se especifica si el modelo base emplea atención lineal, decodificación especulativa u otras optimizaciones.

El entrenamiento se realizó con TRL en su modalidad SFT, sobre un dataset identificado en el nombre del checkpoint como `arc` (probablemente el benchmark ARC, si bien no se confirma en la documentación) y con semilla 1234, lo que sugiere un experimento controlado de línea base. No se documentan el número de tokens de entrenamiento, la composición del dataset, la presencia de RLHF/DPO posterior, ni los hiperparámetros (learning rate, batch size, épocas). La model card tampoco incluye curvas de pérdida ni métricas de evaluación.

## Capacidades

- Generación de texto conversacional: el pipeline de ejemplo usa el formato de chat con roles (`{"role": "user", "content": ...}`), por lo que el modelo espera entradas en formato conversacional.
- Razonamiento y respuesta a preguntas: hereda las capacidades del Nemotron-Mini-4B-Instruct base, si bien el ajuste SFT sobre un dataset específico puede haber alterado su distribución de respuestas.
- Capacidades multilingües: no documentadas; dependen del modelo base y no se declaran idiomas en la model card.
- Tool calling / function calling: no documentado en esta ficha; debe verificarse en el modelo base.
- Modo thinking, visión o audio: no documentado; no se declaran capacidades multimodales.
- Soporte de agentes y razonamiento multi-paso: no documentado para este checkpoint.

## Casos de uso

- Reproducción de experimentos de SFT: el checkpoint permite reproducir la línea base `arc` con semilla 1234 y comparar contra variantes posteriores del mismo pipeline de entrenamiento, gracias a que se documentan las versiones exactas de TRL, Transformers, PyTorch, Datasets y Tokenizers.
- Evaluación comparativa de ajustes finos: sirve como referencia para medir el efecto de cambios en el dataset o en los hiperparámetros sobre el modelo base Nemotron-Mini-4B-Instruct, al partir de un punto de control fijo y versionado.
- Investigación sobre sobreajuste y olvido catastrófico: al ser un SFT sobre un dataset acotado, permite estudiar cómo se degradan las capacidades generales del modelo base tras el ajuste, comparando respuestas antes y después.
- Docencia y formación en ajuste supervisado: útil como ejemplo práctico de un pipeline TRL completo con versiones de framework registradas, para cursos o talleres sobre fine-tuning de modelos de 4 B.
- Pruebas de infraestructura de inferencia: con 4,19 B de parámetros y pesos safetensors de 8,4 GB, sirve para validar despliegues con transformers y `device_map="auto"` en entornos de laboratorio antes de pasar a modelos mayores.
- Validación de pipelines de evaluación: puede integrarse en arneses de evaluación automática (por ejemplo, sobre tareas tipo ARC) para comprobar que el pipeline de scoring funciona correctamente antes de ejecutar experimentos costosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 8,4 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica, se recomiendan 12-16 GB de VRAM para contextos moderados.
- Cuantización a 8 bits: alrededor de 4,2 GB de pesos, viable en GPUs consumer con 8 GB de VRAM.
- Cuantización a 4 bits: alrededor de 2,1 GB de pesos, viable en GPUs con 6-8 GB de VRAM (si bien no se publican variantes GGUF/AWQ/GPTQ en el repositorio).
- GPUs recomendadas: A100 40/80 GB o H100 para servir en FP16 con concurrencia; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en FP16 sin problemas; RTX 4080/4070 Ti (16 GB) para FP16 con contextos moderados; GPUs de 8 GB solo con cuantización.
- Cabe en GPU consumer: sí, en RTX 4090/3090 en FP16 y en GPUs de 8 GB con cuantización de 8 o 4 bits.
- Opciones de despliegue: transformers con `device_map="auto"` (documentado en la model card); vLLM, TGI, llama.cpp u Ollama no están documentados para este checkpoint y requerirían conversión o verificación de compatibilidad.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| rghosh8/SFT_baseline_Nemotron-Mini-4B-Instruct_arc_1234 | 4,19 B | no disponible | no disponible | Hugging Face (0 descargas) | Checkpoint experimental de SFT, sin benchmarks |
| nvidia/Nemotron-Mini-4B-Instruct | ~4 B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face (modelo base oficial) | Modelo base documentado por NVIDIA |
| Alternativas de ~4 B (p. ej. Phi-3-mini, Qwen2.5-3B/4B, Llama-3.2-3B) | 3-4 B | 4K-128K según modelo | varía (MIT, Apache-2.0, Llama Community) | Hugging Face, Ollama, vLLM | Modelos con benchmarks publicados y licencias claras; no directamente comparables en rendimiento con este checkpoint por falta de evaluación |

## Limitaciones y advertencias

- Licencia no declarada: la model card incluye un campo `licence: license` sin contenido, por lo que no se autoriza explícitamente ningún uso, incluido el comercial. Es un riesgo legal relevante para producción.
- Sin benchmarks ni evaluación publicada: no hay evidencia de rendimiento en MMLU, HumanEval, GSM8K ni en la propia tarea ARC, pese al nombre del checkpoint.
- Sesgos: no documentados; al heredar el modelo base y aplicar un SFT sobre un dataset no especificado, los sesgos pueden haberse amplificado o desplazado de forma no controlada.
- Riesgo de alucinación: no cuantificado; el ajuste SFT sobre un dataset acotado puede aumentar la tendencia a generar respuestas plausibles pero incorrectas fuera de la distribución de entrenamiento.
- Olvido catastrófico: posible degradación de las capacidades generales del modelo base tras el SFT, sin métricas que lo cuantifiquen.
- Idiomas: no declarados; no se garantiza un comportamiento correcto en castellano ni en otros idiomas distintos del inglés.
- Contexto: longitud no documentada; debe consultarse en el modelo base antes de diseñar aplicaciones con ventanas largas.
- Reproducibilidad: se documentan las versiones de framework, pero no los hiperparámetros ni el dataset exacto, lo que dificulta la reproducción completa del entrenamiento.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rghosh8/SFT_baseline_Nemotron-Mini-4B-Instruct_arc_1234
- Modelo base: https://huggingface.co/nvidia/Nemotron-Mini-4B-Instruct
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentación de TRL (SFT Trainer): no disponible en la información proporcionada
- Paper o blog de Nemotron-Mini-4B-Instruct: no disponible en la información proporcionada
