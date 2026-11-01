# mradermacher/Quantum-Precog-24B-GGUF

## Resumen

Quantum-Precog-24B-GGUF es la colección de cuantizaciones estáticas en formato GGUF del modelo Quantum-Precog-24B, publicado por el usuario Naphula en HuggingFace y convertido por mradermacher, un perfil conocido por generar versiones cuantizadas de modelos de terceros para su uso con llama.cpp y herramientas compatibles. El repositorio no incluye model card propia más allá de los metadatos de la conversión, por lo que la información sobre arquitectura, entrenamiento y capacidades del modelo original no está disponible en la documentación proporcionada.

El paquete ofrece 12 variantes de cuantización que abarcan desde Q2_K hasta F16, pasando por Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 e IQ4_XS. Esta gradación permite desplegar un modelo de aproximadamente 24 000 millones de parámetros en hardware muy diverso, desde equipos con 16 GB de VRAM o RAM unificada hasta estaciones de trabajo con 48 GB o más. La relevancia del repositorio es fundamentalmente práctica: facilita el acceso al modelo original en entornos donde no se dispone de GPUs de gran capacidad o donde se prefiere inferencia en CPU.

Al tratarse de una conversión y no de un modelo entrenado desde cero, el valor técnico reside en la fidelidad de las cuantizaciones y en la disponibilidad de distintos compromisos entre tamaño y calidad. No se dispone de información sobre el pipeline, los idiomas soportados ni la licencia del modelo base en los datos consultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de ~24B parámetros; arquitectura concreta no documentada) |
| Parametros totales | ~24 000 millones (deducido del nombre; no confirmado en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas generadas con quantize_version 2) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base Quantum-Precog-24B en la documentación proporcionada. El nombre sugiere un transformer de aproximadamente 24 000 millones de parámetros, pero no se confirma ni el tipo de atención, ni si emplea mezcla de expertos, ni la longitud de contexto nativa. Tampoco hay datos sobre el corpus de entrenamiento, el número de tokens procesados, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF, DPO o variantes de razonamiento extendido.

Lo único documentado es el proceso de conversión: los metadatos indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que señala una conversión desde pesos en formato HuggingFace a GGUF mediante la herramienta de cuantización de llama.cpp. Se han generado cuantizaciones estáticas (no imatrix) en 12 variantes, sin archivo mmproj asociado, lo que sugiere que el modelo base no incluye capacidades multimodales o que estas no se han preservado en la conversión.

## Capacidades

- Generación de texto autoregresiva en formato GGUF, ejecutable con llama.cpp y derivados (Ollama, LM Studio, KoboldCpp, text-generation-webui).
- No se documentan capacidades específicas de razonamiento, código, matemáticas o visión en la información disponible.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni razonamiento multi-paso.
- No se confirma capacidad multilingüe ni lista de idiomas.
- No se documentan modos especiales (thinking mode, visión, audio).

## Casos de uso

- Inferencia local en CPU: las cuantizaciones Q2_K y Q3_K_S permiten ejecutar un modelo de ~24B en equipos con 12-16 GB de RAM, útil para prototipado y pruebas sin GPU dedicada.
- Despliegue en GPU de consumo: Q4_K_M e IQ4_XS encajan en GPUs de 24 GB (RTX 3090, RTX 4090) con contexto moderado, permitiendo experimentación con un modelo de mayor tamaño que los habituales de 7B-13B.
- Servidores con VRAM limitada: Q5_K_M y Q6_K ofrecen mayor fidelidad en GPUs de 32-48 GB (A6000, L40S, A100 40GB) cuando se prioriza calidad sobre velocidad.
- Evaluación comparativa de cuantizaciones: el repositorio incluye 12 variantes, lo que facilita medir la degradación de calidad entre Q2_K y F16 en tareas concretas antes de fijar una configuración de producción.
- Integración en pipelines de generación de texto offline: mediante llama.cpp o bindings de Python (llama-cpp-python), el modelo puede incorporarse a flujos batch de resumen, clasificación o generación sin dependencia de APIs externas.
- Experimentación en investigación: útil para estudiar el comportamiento de modelos de ~24B bajo distintas precisiones numéricas y en entornos con restricciones de memoria.
- Distribución ligera: los archivos GGUF son autocontenidos y portables, lo que simplifica el despliegue en entornos air-gapped o en dispositivos sin acceso a repositorios de pesos originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (aproximada, asumiendo ~24B parámetros y overhead de contexto):
  - Q2_K: ~9-10 GB
  - Q3_K_S / Q3_K_M / Q3_K_L: ~11-13 GB
  - IQ4_XS / Q4_K_S / Q4_K_M: ~14-16 GB
  - Q5_K_S / Q5_K_M: ~17-18 GB
  - Q6_K: ~20-21 GB
  - Q8_0: ~26-27 GB
  - F16: ~48-50 GB
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M e inferiores; A6000, L40S o A100 40GB para Q5/Q6; A100 80GB o H100 para Q8_0 y F16.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con cuantizaciones Q4 o inferiores; en GPUs de 16 GB solo con Q2_K/Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui, llama-cpp-python.
- Latencia y throughput: no disponibles; dependerán del hardware, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

No se dispone de información suficiente sobre el modelo base (licencia, contexto, rendimiento) para establecer una comparativa rigurosa con alternativas de la misma categoría. Se indica "no disponible".

## Limitaciones y advertencias

- La model card no documenta sesgos, datos de entrenamiento ni procesos de alineación, por lo que no es posible evaluar riesgos de sesgo sistemático.
- Riesgo de alucinación desconocido; al no haber benchmarks ni evaluación publicada, no se puede estimar su fiabilidad factual.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Es imprescindible consultar el repositorio original (Naphula/Quantum-Precog-24B) antes de cualquier despliegue en producción.
- Idiomas soportados no documentados; el rendimiento en castellano es incierto.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad de forma notable; para producción se recomienda Q4_K_M o superior.
- La conversión no incluye archivo mmproj, por lo que no hay soporte multimodal en este repositorio.
- Al ser una conversión de terceros, no hay garantía de soporte, actualizaciones ni correspondencia exacta con el modelo original.
- Sin datos de contexto nativo, no se puede garantizar el comportamiento en ventanas largas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Quantum-Precog-24B-GGUF
- Modelo original: https://huggingface.co/Naphula/Quantum-Precog-24B
