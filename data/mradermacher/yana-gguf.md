# mradermacher/YaNA-GGUF

## Resumen

YaNA-GGUF es la distribucion en formato GGUF del modelo YaNA, desarrollado originalmente por RuCoverLAB y cuantizado por el usuario mradermacher. Se trata de un repositorio de cuantizaciones estaticas generadas a partir de los pesos originales publicados en HuggingFace, pensado para facilitar la inferencia local mediante herramientas compatibles con el formato GGUF (llama.cpp, Ollama, LM Studio, entre otras).

El repositorio no aporta informacion sobre la arquitectura, el tamano, el contexto ni el proceso de entrenamiento del modelo original; la model card se limita a indicar que se trata de cuantizaciones estaticas del modelo base de RuCoverLAB. La relevancia de esta ficha es, por tanto, limitada: sirve como punto de entrada para localizar los pesos cuantizados, pero cualquier evaluacion tecnica debe remitirse al repositorio original del modelo.

La fecha de creacion del repositorio es el 4 de noviembre de 2026, con actualizacion el mismo dia, y no registra descargas ni likes en el momento de la consulta. No se dispone de informacion sobre licencia, idiomas soportados ni pipeline de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo original YaNA en los datos disponibles. El repositorio unicamente documenta metadatos del proceso de cuantizacion: `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que indica que los pesos se convirtieron desde un checkpoint en formato HuggingFace y se cuantizaron de forma estatica en una sola pasada.

No hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni innovaciones tecnicas asociadas al modelo base. Toda esta informacion deberia consultarse en https://huggingface.co/RuCoverLAB/YaNA.

## Capacidades

- No se dispone de informacion verificada sobre las capacidades del modelo en la documentacion proporcionada.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni razonamiento multi-paso.
- No se confirma capacidad multilingue ni cobertura de idiomas concreta.
- No se confirma soporte de vision, audio ni modos de razonamiento extendido (thinking mode).
- El unico dato funcional verificable es la disponibilidad de pesos en formato GGUF en doce variantes de cuantizacion, lo que permite su ejecucion en llama.cpp y entornos compatibles.

## Casos de uso

- Inferencia local en hardware de consumo: las cuantizaciones Q4_K_M, Q4_K_S e IQ4_XS permiten ejecutar el modelo en GPUs de gama media o en CPU con llama.cpp, siempre que el tamano del modelo original lo permita (dato no disponible).
- Despliegue en entornos sin conexion: el formato GGUF facilita el uso en sistemas aislados o con requisitos de privacidad estrictos, sin dependencia de APIs externas.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece doce variantes que permiten medir la perdida de calidad frente a la reduccion de memoria en un mismo modelo.
- Integracion en Ollama o LM Studio: al ser GGUF, los pesos pueden importarse directamente en estos entornos para prototipado rapido de aplicaciones de texto.
- Pruebas de viabilidad antes de adoptar el modelo original: sirve para validar el comportamiento del modelo YaNA en tareas concretas antes de descargar los pesos completos en precision alta.
- Distribucion en entornos con ancho de banda limitado: las cuantizaciones Q2_K y Q3_K_S reducen el tamano del fichero, lo que facilita la transferencia en redes restringidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible, al desconocerse el numero de parametros del modelo original.
- GPU recomendadas: no disponible por la misma razon.
- Viabilidad en GPU de consumo: depende del tamano del modelo base; las cuantizaciones Q4_K_M e inferiores son las candidatas para GPUs de consumo, pero no puede confirmarse sin conocer los parametros.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. vLLM y TGI no son compatibles de forma nativa con GGUF en todas sus versiones.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se dispone de informacion sobre el modelo base ni sobre alternativas comparables de la misma categoria, tamano o tarea.

## Limitaciones y advertencias

- La model card no especifica la licencia, por lo que no puede confirmarse el uso comercial del modelo ni de sus cuantizaciones.
- Se desconoce el modelo original en cuanto a arquitectura, parametros y contexto, lo que impide evaluar su idoneidad para tareas concretas.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S, Q3_K_M) degradan la calidad de forma notable en la mayoria de modelos; no se han publicado evaluaciones que cuantifiquen esa perdida en este caso.
- El repositorio no registra descargas ni likes, lo que impide inferir validacion por parte de la comunidad.
- No hay informacion sobre sesgos, riesgo de alucinacion ni limitaciones idiomaticas.
- El autor de la cuantizacion (mradermacher) no es el desarrollador del modelo original; los problemas de licencia o calidad deben dirigirse a RuCoverLAB.
- No se garantiza que las cuantizaciones IQ4_XS y x-f16 sean compatibles con todas las versiones de llama.cpp; conviene verificar la version del runtime.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/YaNA-GGUF
- Modelo original: https://huggingface.co/RuCoverLAB/YaNA
