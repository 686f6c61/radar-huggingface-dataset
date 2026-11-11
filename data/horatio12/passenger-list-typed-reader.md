# horatio12/passenger-list-typed-reader

## Resumen

Passenger-list-typed-reader es un modelo de reconocimiento óptico de caracteres (OCR) especializado en nombres mecanografiados extraídos de listas de pasajeros de barcos estadounidenses. Lo desarrolla el usuario horatio12 como parte del proyecto de código abierto passenger-list-reader, y se construye mediante fine-tuning de microsoft/trocr-base-printed sobre aproximadamente 3.700 tiras de nombres procedentes de los listados de llegada a Nueva York entre 1897 y 1957 (microfilm T715 de los National Archives, digitalizado en archive.org).

El modelo resuelve un problema muy concreto dentro de la digitalización genealógica: los OCR genéricos fallan con frecuencia en recortes estrechos de una sola línea de texto mecanografiado, especialmente cuando el recorte procede de formularios federales con tipografías de máquina de escribir y ruido de escaneo. Al especializarse en ese dominio, mejora de forma medible al modelo base en las mismas páginas de evaluación.

Arquitectura vision-encoder-decoder de tipo TrOCR, con 333.921.792 parámetros totales, licencia MIT y pesos en safetensors. Es un modelo pequeño y ligero (repo de 1,3 GB) pensado para integrarse en un pipeline de extracción de nombres, no como OCR de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-encoder-decoder (TrOCR: encoder de visión tipo ViT + decoder transformer) |
| Parametros totales | 333.921.792 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (generación limitada a `max_new_tokens=48` en el ejemplo de uso) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura TrOCR de microsoft/trocr-base-printed: un encoder de visión que procesa la imagen de la tira de texto y un decoder autorregresivo que genera la secuencia de caracteres. El fine-tuning se realizó sobre unas 3.700 tiras de nombres mecanografiados procedentes de listas de llegada a Nueva York (1897-1957), extraídas de los rollos T715 de los National Archives escaneados en archive.org.

Las etiquetas de entrenamiento se generaron haciendo que Claude leyera cada tira dos veces y conservando únicamente los nombres en los que ambas lecturas coincidían. El autor advierte explícitamente de que esas etiquetas no fueron verificadas por una persona, lo que introduce un riesgo de ruido en el corpus de supervisión. No se documentan datos sobre número de tokens, composición del dataset más allá de las tiras, ni uso de RLHF o DPO; tampoco se describen innovaciones técnicas adicionales más allá del propio fine-tuning especializado.

## Capacidades

- Reconocimiento de texto mecanografiado en imágenes: convierte una tira de imagen que contiene un nombre en la cadena de texto correspondiente.
- Especialización en nombres de listas de pasajeros estadounidenses, con formularios federales desde 1907 en adelante.
- Generación de texto corto (el ejemplo de uso limita la salida a 48 tokens nuevos), adecuada para nombres y no para párrafos.
- Soporte de `interpolate_pos_encoding` para imágenes de proporciones variables, tal como se muestra en el código de ejemplo.
- Integración con la librería transformers mediante `TrOCRProcessor` y `VisionEncoderDecoderModel`.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, visión general, audio ni modos de pensamiento.

## Casos de uso

- Digitalización de listas de pasajeros para genealogía: el modelo recibe una tira recortada por nombre y devuelve el nombre mecanografiado, lo que permite indexar y buscar registros de inmigración de forma masiva sin transcripción manual.
- Pipeline de archivística junto a passenger-list-reader: el proyecto del autor localiza la columna de nombres, corta una tira por nombre, separa mecanografiado de manuscrito y envía las tiras mecanografiadas a este modelo; encaja como componente de un flujo mayor de extracción documental.
- Enriquecimiento de bases de datos históricas: transcripción automatizada de microfilm T715 de los National Archives para construir índices nominales consultables.
- Procesamiento por lotes de colecciones escaneadas: al ser un modelo de 334 M de parámetros, puede ejecutarse en GPU de consumo y procesar miles de tiras en un tiempo razonable dentro de un pipeline offline.
- Clasificación y control de calidad: combinado con el modelo de manuscritos del mismo autor, permite enrutar cada tira al lector adecuado y marcar recortes problemáticos para revisión humana.
- Investigación en OCR histórico: sirve como referencia de fine-tuning de TrOCR sobre un dominio estrecho y como punto de comparación frente al modelo base en tareas de reconocimiento de texto mecanografiado.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 9 páginas mecanografiadas de rollos no usados en entrenamiento, contando solo nombres en los que dos lecturas independientes coinciden en la verdad:

| Metrica | passenger-list-typed-reader | trocr-base-printed (con el cortador de tiras antiguo) |
|---|---|---|
| Palabras correctas | 258 de 315 (81,9%) | 70 |
| Nombres completos correctos | 101 | 5 |
| Letras incorrectas | 5,2% | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3-2 GB en fp32 para los 334 M de parámetros, más el overhead del encoder de visión y del procesador; cabe holgadamente en cualquier GPU de consumo moderna.
- GPU recomendadas: RTX 3060, RTX 4060, RTX 4090, A100 o H100; el modelo es lo bastante pequeño para que cualquier GPU con 4 GB o más sea suficiente.
- Cabe en GPU de consumo: sí, en todas las GPU consumer con al menos 4 GB de VRAM; también puede ejecutarse en CPU para lotes pequeños.
- Opciones de despliegue: transformers (uso directo con `VisionEncoderDecoderModel`), y en general cualquier runtime que cargue safetensors; no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| passenger-list-typed-reader | 333.921.792 | no disponible | 81,9% de palabras correctas, 101 nombres completos correctos | MIT | Hugging Face |
| microsoft/trocr-base-printed | no disponible en la informacion | no disponible | 70 palabras correctas, 5 nombres completos correctos con el cortador antiguo | la model card del base no declara licencia | Hugging Face |
| passenger-list-handwriting-reader | no disponible | no disponible | no disponible | no disponible | Hugging Face (mismo autor) |

## Limitaciones y advertencias

- Ajustado específicamente para tiras cortas de nombres de estas listas; no es un OCR de texto impreso general y su rendimiento fuera de ese dominio no está validado.
- Sin probar en otros puertos; el autor señala que los puertos estadounidenses usaron los mismos formularios federales desde 1907, pero no hay evaluación al respecto.
- Las tiras que recortan la primera letra o contienen dos filas se leen mal.
- Las etiquetas de entrenamiento se generaron con dos lecturas de Claude y solo se conservaron las coincidentes, sin verificación humana: existe riesgo de ruido y de sesgo heredado del modelo que generó las etiquetas.
- Riesgo de alucinación en la transcripción: al ser un decoder generativo, puede producir nombres plausibles pero incorrectos en imágenes degradadas.
- Solo inglés; no se documenta soporte multilingüe.
- Licencia MIT, pero la model card del modelo base no declara licencia, lo que conviene revisar antes de un uso comercial a gran escala.
- No hay datos publicados sobre cuantizaciones, latencia ni throughput.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/horatio12/passenger-list-typed-reader
- Modelo base: https://huggingface.co/microsoft/trocr-base-printed
- Modelo de manuscritos del mismo autor: https://huggingface.co/horatio12/passenger-list-handwriting-reader
- Repositorio del proyecto: https://github.com/jbyoung12/passenger-list-reader
- Código TrOCR: https://github.com/microsoft/unilm
