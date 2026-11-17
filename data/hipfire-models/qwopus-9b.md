# hipfire-models/qwopus-9b

## Resumen

Qwopus-9b es una cuantización del modelo Jackrong/Qwopus3.5-9B-v3, un ajuste fino de Qwen3.5-9B, publicada por hipfire-models. El modelo original emplea una arquitectura híbrida DeltaNet (capas de atención lineal combinadas con capas de atención completa), lo que reduce el coste computacional del mecanismo de atención respecto a un transformer convencional. Esta versión concreta está empaquetada en formatos propietarios de cuantización (HF4 y HF6) para el motor de inferencia hipfire, escrito en Rust y orientado nativamente a GPU AMD con arquitectura RDNA.

El interés de esta ficha radica en que permite ejecutar un modelo de 9.000 millones de parámetros en GPUs de consumo AMD de 8 GB de VRAM (por ejemplo, una RX 5700 XT), sin la sobrecarga del runtime ROCm, mediante kernels compilados JIT para la arquitectura detectada. Es, por tanto, una opción relevante para desarrolladores con hardware AMD que quieran inferencia local de texto con calidad de modelo de gama media.

La información pública disponible es escasa: el repositorio tiene 24,7 GB, una licencia Apache 2.0 y declara únicamente el idioma inglés. No se han publicado resultados de benchmarks ni detalles sobre el proceso de entrenamiento del ajuste fino original en la información consultada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido DeltaNet (atención lineal + atención completa), base Qwen3.5 |
| Parametros totales | 9 000 millones (según el nombre del modelo; valor exacto no disponible) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | HF4 (4 bits, 4,5 GB) y HF6 (6 bits, 6,9 GB), formatos propietarios de hipfire |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | HF4 / HF6 (formato nativo de hipfire); no disponible en safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-9B, un transformer con arquitectura híbrida DeltaNet: intercala capas de atención lineal (DeltaNet) con capas de atención completa, lo que reduce el coste de memoria y cómputo asociado a la atención en contextos largos. El ajuste fino Qwopus3.5-9B-v3, obra de Jackrong, conserva esa arquitectura y la plantilla de chat ChatML del modelo Qwen3.5 original.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset del ajuste fino, ni sobre si se aplicaron técnicas de RLHF, DPO o similar. La innovación destacable de esta publicación no está en el entrenamiento, sino en el empaquetado: hipfire convierte los pesos a sus formatos HF4/HF6 y compila kernels en tiempo de ejecución (JIT) para la arquitectura RDNA concreta de la GPU, evitando la capa de abstracción de ROCm.

## Capacidades

- Generación de texto en inglés con calidad de modelo de 9 000 millones de parámetros.
- Razonamiento y conversación multi-turno mediante plantilla ChatML.
- Capacidad de código y matemáticas: no confirmada explícitamente en la información disponible, aunque es esperable en un ajuste fino de Qwen3.5.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Ejecución nativa en GPU AMD RDNA 1-4 y APUs (Strix Halo, Strix Point) mediante el motor hipfire.

## Casos de uso

- Inferencia local en GPU AMD de consumo: con el archivo HF4 (4,5 GB) el modelo cabe en una RX 5700 XT de 8 GB y ofrece unos 41 tok/s, lo que lo hace adecuado para asistentes de escritorio y prototipado sin depender de la nube.
- Despliegue en estaciones de trabajo con APU Strix Halo o Strix Point: hipfire soporta estas APUs, de modo que se puede ejecutar el modelo en portátiles y mini-PC sin GPU dedicada, usando el archivo HF6 para mayor calidad.
- Generación de texto en pipelines de CI/CD o herramientas internas: al ser un modelo de 9B con licencia Apache 2.0, puede integrarse en servicios de generación de documentación, resúmenes o respuestas automáticas sin restricciones de uso comercial.
- Sustitución de modelos de 7-8B en entornos AMD: para equipos que ya ejecutan modelos de ese tamaño con llama.cpp u Ollama en GPU AMD, hipfire ofrece una alternativa con kernels nativos y menor sobrecarga de runtime.
- Evaluación de arquitecturas híbridas de atención: investigadores pueden usar el modelo para medir el comportamiento de DeltaNet frente a transformers convencionales en tareas de generación de texto.
- Chatbot de soporte en inglés para aplicaciones internas: la plantilla ChatML y el contexto multi-turno permiten construir asistentes conversacionales, siempre que el caso de uso se limite al inglés.
- Pruebas de rendimiento en hardware RDNA 1-4: útil para comparar el throughput de hipfire (41 tok/s en HF4 y 34 tok/s en HF6 sobre RX 5700 XT) frente a otras pilas de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento proporcionado es la velocidad de inferencia medida en una RX 5700 XT:

| Cuantizacion | Tamano | Velocidad (RX 5700 XT) |
|---|---|---|
| HF4 (4 bits) | 4,5 GB | ~41 tok/s |
| HF6 (6 bits) | 6,9 GB | ~34 tok/s |

## Requisitos de hardware

- VRAM estimada: 4,5 GB para HF4 y 6,9 GB para HF6, más el overhead del motor; en ambos casos cabe en GPUs de 8 GB.
- GPU recomendadas: cualquier GPU AMD con soporte de HIP SDK, incluidas RDNA 1 (RX 5500/5600/5700), RDNA 2 (RX 6600/6700/6800/6900), RDNA 3 (RX 7600/7800/7900) y RDNA 4 (RX 9070).
- APUs compatibles: Strix Halo y Strix Point.
- Cabe en GPU de consumo: sí, en las RX 5700 XT y modelos superiores de las familias RDNA 1-4.
- Opciones de despliegue: exclusivamente el motor hipfire (instalación mediante script, `hipfire pull` y `hipfire run`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI con estos formatos de pesos.
- Latencia y throughput: ~41 tok/s con HF4 y ~34 tok/s con HF6 en una RX 5700 XT, según la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwopus-9b (hipfire) | ~9B | no disponible | Apache 2.0 | Solo formato hipfire (HF4/HF6) |
| Jackrong/Qwopus3.5-9B-v3 | ~9B | no disponible | Apache 2.0 | Pesos originales en Hugging Face |
| Qwen3.5-9B (base) | ~9B | no disponible | no disponible | Pesos originales en Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Idiomas: el modelo solo declara soporte de inglés; no se recomienda su uso en castellano u otros idiomas sin evaluación previa.
- Sesgos: no se ha publicado información sobre sesgos conocidos del ajuste fino ni del modelo base.
- Alucinación: sin benchmarks ni evaluaciones publicadas, no es posible cuantificar el riesgo de alucinación; debe validarse en el dominio de uso.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5 y del ajuste fino de Jackrong, ya que la información disponible no detalla posibles restricciones adicionales.
- Formato propietario: los pesos solo funcionan con el motor hipfire; no hay conversión documentada a GGUF ni safetensors, lo que limita la portabilidad.
- Dependencia de hardware AMD: no hay soporte para GPU NVIDIA ni para CPU en la información disponible.
- Madurez del ecosistema: el repositorio tiene 0 descargas y 0 likes, y el motor hipfire es un proyecto joven; no hay garantías de mantenimiento a largo plazo.
- Contexto: se desconoce la longitud máxima de contexto soportada, lo que impide planificar casos de uso con documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hipfire-models/qwopus-9b
- Modelo base (ajuste fino): https://huggingface.co/Jackrong/Qwopus3.5-9B-v3
- Motor de inferencia hipfire: https://github.com/Kaden-Schutt/hipfire
- Script de instalación: https://raw.githubusercontent.com/Kaden-Schutt/hipfire/master/scripts/install.sh
