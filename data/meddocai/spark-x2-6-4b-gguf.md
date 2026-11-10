# MedDocAI/Spark-X2.6-4B-GGUF

## Resumen

Spark-X2.6-4B es un modelo de lenguaje conversacional de 4.112.079.360 parámetros (aproximadamente 4,1 mil millones) desarrollado originalmente por XHToken. El repositorio analizado, `MedDocAI/Spark-X2.6-4B-GGUF`, es un re-host sin modificaciones de la cuantización Q6_K realizada por bartowski a partir del modelo original `XHToken/Spark-X2.6-4B`. No se trata, por tanto, de un modelo nuevo, sino de una redistribución de pesos ya cuantizados.

La relevancia de esta ficha es doble: por un lado, documenta las características del modelo base (tamaño, licencia Apache-2.0, disponibilidad en formato GGUF para inferencia local); por otro, sirve como caso de estudio de buenas prácticas de licenciamiento, ya que el re-host incluye el fichero LICENSE original de XHToken al amparo de la sección 4(a) de Apache-2.0, al carecer de licencia el repositorio de cuantización de bartowski.

La información pública disponible es muy limitada: la model card del re-host no describe arquitectura, datos de entrenamiento, contexto ni idiomas, y el repositorio no registra descargas ni interacciones en el momento de la consulta. Los datos técnicos que se ofrecen a continuación proceden exclusivamente del recuento de parámetros en safetensors y de los metadatos del fichero GGUF.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 4.112.079.360 (~4,1 B) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q6_K (GGUF); otras cuantizaciones en el repo de bartowski, no detalladas |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (Copyright 2026 XHToken) |
| Formato de pesos | GGUF (fichero `Spark-X2.6-4B-Q6_K.gguf`, 3.611.148.928 bytes) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo (tipo de transformer, uso de atención lineal, mezcla de expertos u otras variantes). El único dato estructural cierto es el recuento de parámetros: 4.112.079.360, lo que sitúa al modelo en la categoría de 4B densos o, en su defecto, en una configuración MoE de tamaño total 4B con parámetros activos desconocidos.

Tampoco hay datos sobre el corpus de entrenamiento (número de tokens, composición, mezcla multilingüe), ni sobre si se aplicaron técnicas de alineación como RLHF, DPO o instrucción supervisada. La model card del re-host se limita a documentar la procedencia de los pesos y la integridad del fichero mediante hash SHA-256 (`3a57c7c781fa8faa3ff20dc144acc04c2d63a3a01ad8a5504ed97655169db3a3`), sin describir el proceso de entrenamiento. Se desconoce igualmente si existe un modelo base diferenciado (`XHToken/Spark-X2.6-4B-Base`, citado en la card) con características distintas al modelo conversacional.

## Capacidades

- Generación de texto conversacional: el tag `conversational` del repositorio indica que el modelo está orientado a diálogo multi-turno.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede servirse a través de infraestructura de inferencia estándar (por ejemplo, TGI o endpoints compatibles con la API de Hugging Face).
- Cuantización con imatrix: el tag `imatrix` indica que la cuantización se realizó con matrices de importancia, técnica que suele preservar mejor la calidad en cuantizaciones agresivas.
- Razonamiento, código, matemáticas y visión: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo: con 3,6 GB en Q6_K, el modelo cabe en GPUs de consumo con 8 GB de VRAM o más, lo que permite ejecutar un asistente conversacional sin conexión a servicios en la nube.
- Prototipado de chatbots: al estar etiquetado como `conversational` y ser compatible con endpoints, sirve para validar pipelines de diálogo antes de escalar a modelos mayores.
- Inferencia en CPU con llama.cpp: el formato GGUF y la cuantización Q6_K permiten ejecución en CPU con requisitos de memoria moderados, útil para entornos sin GPU.
- Evaluación comparativa de cuantizaciones: al existir el repositorio de bartowski con otras variantes, el modelo es útil para medir la degradación de calidad entre Q6_K y cuantizaciones más agresivas (Q4_K_M, Q5_K_M, etc.).
- Filtrado y clasificación de texto en local: modelos de 4B suelen emplearse para tareas de etiquetado y moderación con baja latencia y sin enviar datos a terceros.
- Base para fine-tuning ligero: la licencia Apache-2.0 permite adaptar los pesos a dominios específicos (por ejemplo, documentación médica, dado el perfil del re-host) y redistribuir las adaptaciones.
- Servicio de endpoints compatible: puede desplegarse tras una API compatible con los endpoints de Hugging Face para integrarse en aplicaciones existentes sin cambiar el cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el fichero Q6_K ocupa 3,61 GB, por lo que la inferencia requiere aproximadamente 4-5 GB de memoria considerando el contexto y los buffers de ejecución.
- GPU de consumo: cabe en tarjetas con 8 GB o más de VRAM (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4070 y superiores). En GPUs de 6 GB podría ejecutarse con contextos reducidos o descarga parcial de capas a CPU.
- GPU profesionales: A100, H100, L40S y similares ejecutan el modelo con holgura, aunque están sobredimensionadas para 4B.
- CPU: viable con llama.cpp; se recomienda al menos 8 GB de RAM para el modelo y el contexto.
- Opciones de despliegue: llama.cpp, Ollama (previa importación del GGUF), y servidores compatibles con GGUF; para el modelo original en safetensors, vLLM o TGI si la arquitectura es compatible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Spark-X2.6-4B (este) | ~4,1 B | no disponible | Apache-2.0 | GGUF Q6_K | Hugging Face (re-host) |
| Alternativas de 4B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma familia o categoría en la documentación proporcionada, por lo que no es posible establecer una comparativa técnica rigurosa.

## Limitaciones y advertencias

- Información técnica insuficiente: se desconocen arquitectura, contexto, idiomas y datos de entrenamiento, lo que impide evaluar su idoneidad para producción.
- Sin benchmarks: no hay evidencia publicada de rendimiento en tareas estándar (MMLU, HumanEval, GSM8K), por lo que no puede compararse objetivamente con alternativas.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala; sin datos de alineación no puede estimarse su magnitud.
- Sesgos: no documentados; la ausencia de información sobre el corpus impide evaluar sesgos de idioma, género o dominio.
- Licencia: Apache-2.0 permite uso comercial y modificaciones, pero exige conservar los avisos de copyright y el fichero LICENSE, y no implica endorsement de XHToken sobre el re-host.
- Procedencia: el repositorio es un re-host no oficial de una cuantización de terceros (bartowski); conviene verificar el hash SHA-256 antes de usar los pesos.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Contexto: sin dato de longitud de contexto, no debe asumirse soporte para conversaciones largas o documentos extensos.
- Idiomas: al no estar documentados, el rendimiento en castellano es incierto y requeriría evaluación empírica.

## Enlaces

- Repositorio del re-host: https://huggingface.co/MedDocAI/Spark-X2.6-4B-GGUF
- Modelo original: https://huggingface.co/XHToken/Spark-X2.6-4B
- Modelo base citado: https://huggingface.co/XHToken/Spark-X2.6-4B-Base
- Cuantización de bartowski: https://huggingface.co/bartowski/Spark-X2.6-4B-GGUF
