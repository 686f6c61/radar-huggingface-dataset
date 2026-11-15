# mradermacher/Evaryx-Core-GGUF

## Resumen

Evaryx-Core-GGUF es la version cuantizada en formato GGUF del modelo Evaryx-Core, publicado por el usuario mradermacher a partir de los pesos originales del repositorio EvaryxTechnologies/Evaryx-Core. Se trata de una conversión estática generada con herramientas de cuantización (la model card indica `convert_type: hf` y `quantize_version: 2`), pensada para su uso en entornos de inferencia local mediante llama.cpp y derivados. El modelo original cuenta con 7.615.616.512 parámetros (aproximadamente 7,6 mil millones), lo que lo sitúa en la categoría de modelos de tamaño medio.

La relevancia de esta publicación es fundamentalmente práctica: ofrece los pesos originales en múltiples niveles de cuantización (desde Q2_K hasta F16, incluyendo variantes IQ4_XS y Q4_K_M) para que los desarrolladores puedan desplegar el modelo en hardware con recursos limitados. El repositorio ocupa 53,1 GB en total, lo que refleja la suma de todas las variantes de cuantización incluidas.

No se dispone de información pública sobre la arquitectura interna, los datos de entrenamiento, los idiomas soportados ni la licencia del modelo original en la información proporcionada. La model card del repositorio GGUF es puramente técnica y se limita a declarar que se trata de una conversión estática del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (no hay indicios de MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo original) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo original (transformer, MoE, SSM o hibrida) en la informacion proporcionada. El unico dato estructural fiable es el recuento de parametros: 7.615.616.512, obtenido de los tensores en formato safetensors del modelo base. Este tamano es coherente con un transformer denso de aproximadamente 7,6 mil millones de parametros, pero no se confirma la arquitectura exacta.

Tampoco hay datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La model card del repositorio GGUF unicamente documenta el proceso de conversion y cuantizacion: `convert_type: hf`, `quantize_version: 2` y `output_tensor_quantised: 1`, lo que indica que la conversion se realizo desde pesos en formato Hugging Face y que los tensores de salida fueron cuantizados. El campo `skip_mmproj` esta vacio, sin informacion adicional sobre proyecciones multimodales.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` del repositorio sugiere que el modelo esta orientado a dialogos multi-turno, aunque no se detallan capacidades especificas.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse a traves de infraestructuras de inferencia compatibles con la API estandar.
- No hay informacion disponible sobre razonamiento, generacion de codigo, matematicas, vision, audio, tool calling, function calling, agentes o modo thinking.
- No hay informacion disponible sobre capacidades multilingues ni sobre idiomas concretos soportados.

## Casos de uso

- Despliegue local en estaciones de trabajo: con cuantizaciones Q4_K_M o Q5_K_M, el modelo puede ejecutarse en GPUs de consumo con 8-12 GB de VRAM, lo que permite prototipar asistentes conversacionales sin depender de servicios en la nube.
- Experimentacion con llama.cpp y Ollama: al estar en formato GGUF, se integra directamente en estos runners, lo que facilita pruebas de rendimiento y comparativas de cuantizacion en distintas maquinas.
- Chat conversacional de proposito general: la etiqueta `conversational` y el tamano de 7,6 mil millones de parametros lo hacen adecuado para prototipos de atencion al cliente o asistentes internos, siempre que se valide su calidad con datos propios.
- Inferencia en CPU: las variantes Q2_K y Q3_K permiten ejecutar el modelo en equipos sin GPU dedicada, util para entornos de desarrollo o pruebas de integracion.
- Servicio de endpoints compatibles: la etiqueta `endpoints_compatible` sugiere su uso detras de servidores de inferencia con API compatible, adecuado para integrarse en aplicaciones existentes.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye 12 variantes, lo que permite medir el impacto de la cuantizacion en calidad y velocidad sobre un mismo modelo base.
- Fine-tuning posterior sobre el modelo original: los pesos safetensors del repositorio base (no incluidos aqui) permitirian ajuste fino y posterior conversion a GGUF con las mismas herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (7,6 mil millones de parametros):
  - F16: aproximadamente 15-16 GB.
  - Q8_0: aproximadamente 8-9 GB.
  - Q6_K: aproximadamente 6,5-7 GB.
  - Q5_K_M: aproximadamente 5,5-6 GB.
  - Q4_K_M: aproximadamente 4,5-5 GB.
  - Q3_K_M: aproximadamente 3,5-4 GB.
  - Q2_K: aproximadamente 2,5-3 GB.
- GPUs recomendadas: RTX 4090 (24 GB) para F16 y Q8_0; RTX 4080/4070 Ti (12-16 GB) para Q6_K y Q5_K_M; RTX 3060/4060 (8-12 GB) para Q4_K_M y Q3_K_M.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas para cuantizaciones Q4 y superiores; las variantes Q2_K y Q3_K pueden ejecutarse incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (LM Studio, text-generation-webui, koboldcpp). Para servidores con API compatible, cabe esperar soporte en soluciones que acepten GGUF.
- Latencia y throughput: no disponibles. Dependeran del hardware, la cuantizacion y el backend; como referencia general para 7-8B en Q4_K_M sobre GPU moderna, el rendimiento suele situarse en decenas de tokens por segundo, pero no se aportan mediciones concretas para este modelo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de arquitectura del modelo original, por lo que no es posible establecer una comparativa fiable con alternativas de la misma categoria. Se indica a continuacion unicamente la comparacion estructural basica:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Evaryx-Core-GGUF | 7.615.616.512 | no disponible | no disponible | GGUF |
| Alternativas de ~7-8B | no disponible | no disponible | no disponible | no disponible |

No disponible: no se conocen modelos comparables con datos verificables en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; es imprescindible contactar con EvaryxTechnologies antes de desplegarlo en produccion.
- Ausencia de model card detallada: no hay informacion sobre sesgos, datos de entrenamiento, idiomas ni evaluaciones de seguridad.
- Riesgo de alucinacion: sin benchmarks ni evaluaciones publicadas, no es posible cuantificar la fiabilidad factual del modelo.
- Idiomas no confirmados: la etiqueta `conversational` no especifica idiomas; el rendimiento en castellano es desconocido.
- Contexto desconocido: se desconoce la longitud maxima de contexto, lo que limita el diseno de aplicaciones con documentos largos.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que existan reportes de la comunidad sobre su comportamiento.
- Cuantizaciones agresivas: Q2_K y Q3_K pueden degradar notablemente la calidad; para produccion se recomienda Q4_K_M o superior.
- Procedencia: al ser una conversion de terceros (mradermacher), conviene verificar la integridad de los pesos frente al repositorio original.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Evaryx-Core-GGUF
- Modelo original: https://huggingface.co/EvaryxTechnologies/Evaryx-Core
- Perfil del autor de la conversion: https://huggingface.co/mradermacher
