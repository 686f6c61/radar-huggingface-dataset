# mradermacher/LingSante-3.1-air-VL-i1-GGUF

## Resumen

LingSante-3.1-air-VL-i1-GGUF es la version cuantizada en formato GGUF del modelo vision-lenguaje inclusionAI/LingSante-3.1-air-VL, publicada por el usuario mradermacher. El modelo base es un VLM de aproximadamente 124.400 millones de parametros (124.414.211.552 segun los safetensors del repositorio original), lo que lo situa en la categoria de modelos densos de gran tamano con capacidad de procesamiento de imagenes y texto. Esta version concreta emplea cuantizacion con imatrix (importancia matrix) para preservar la calidad en tasas de bits bajas, generando un abanico de variantes que van desde IQ1_S (25,3 GB) hasta Q6_K (102,3 GB).

El modelo resuelve el problema de desplegar un VLM de gran escala en hardware con recursos limitados, ofreciendo alternativas comprimidas que mantienen buena parte de la calidad del original. Es relevante ahora porque el ecosistema GGUF permite ejecutar modelos de este tamano en GPUs de consumo mediante offloading parcial a CPU, y porque la cuantizacion con imatrix reduce significativamente la perdida de calidad respecto a cuantizaciones estaticas tradicionales.

La licencia MIT del modelo base facilita su uso comercial, y el tag `endpoints_compatible` sugiere compatibilidad con infraestructuras de inferencia estandar. El repositorio tiene 1.310 GB de tamano total y 8.068 descargas, lo que indica una adopcion moderada pero real en la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base vision-lenguaje; detalles de arquitectura no publicados en la informacion disponible) |
| Parametros totales | 124.414.211.552 (~124,4 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (con imatrix) |
| Idiomas soportados | en (ingles; segun la model card) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la informacion proporcionada. Se trata de un modelo vision-lenguaje (VL) que combina un codificador de imagenes con un modelo de lenguaje, segun indica la model card al referirse a el como "vision model" y mencionar ficheros mmproj (proyeccion multimodal) en el repositorio estatico. No se especifica si emplea atencion lineal, decodificacion especulativa ni otras innovaciones tecnicas.

Respecto al entrenamiento, la informacion disponible no incluye datos sobre numero de tokens, composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card del repositorio cuantizado se limita a indicar que se trata de cuantizaciones con imatrix del modelo inclusionAI/LingSante-3.1-air-VL, sin detallar el proceso de entrenamiento del original. El tag `conversational` sugiere que el modelo ha sido ajustado para dialogos, pero no hay mas detalles.

## Capacidades

- Generacion de texto y conversacion multi-turno (tag `conversational`).
- Procesamiento de imagenes: es un modelo vision-lenguaje, por lo que acepta entradas visuales ademas de texto.
- Capacidades multilingues limitadas: la model card solo declara ingles (`language: en`).
- Compatibilidad con endpoints de inferencia estandar (tag `endpoints_compatible`).
- No se confirma en la informacion disponible soporte de tool calling, function calling, agentes, modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Analisis de documentos escaneados: el modelo puede recibir imagenes de facturas, formularios o contratos y extraer texto estructurado, aprovechando su naturaleza multimodal. Adecuado para pipelines de digitalizacion donde se requiere comprension visual y textual conjunta.
- Descripcion automatica de imagenes en catalogos de producto: generacion de descripciones textuales a partir de fotografias, con la ventaja de que las cuantizaciones Q4_K_M (75,4 GB) permiten despliegue en servidores con 2-4 GPUs de 48 GB.
- Asistencia conversacional con soporte visual: atencion al cliente donde el usuario adjunta capturas de pantalla o fotos de un problema, y el modelo responde en ingles con contexto visual.
- Moderacion de contenido visual: clasificacion y descripcion de imagenes para detectar contenido inapropiado, usando la variante IQ3_M (54,4 GB) para reducir costes de inferencia.
- Prototipado de aplicaciones VLM en local: desarrolladores que quieren experimentar con un VLM de gran escala sin depender de APIs, usando la variante IQ2_M (40,7 GB) en una estacion de trabajo con una RTX 6000 Ada o A100 80 GB.
- Investigacion en cuantizacion: el repositorio incluye el fichero imatrix (1,1 GB) para que otros investigadores generen sus propias cuantizaciones, lo que lo convierte en material de referencia para estudiar el impacto de la cuantizacion con importancia matrix en modelos de 124 B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion:
  - IQ1_S: ~25,3 GB (cabe en una RTX 4090 de 24 GB solo con offloading parcial a CPU).
  - IQ2_M: ~40,7 GB (cabe en una A100 40 GB o en dos RTX 4090 con tensor parallelism).
  - Q3_K_M: ~59,4 GB (requiere A100 80 GB, H100 80 GB o dos GPUs de 48 GB).
  - Q4_K_M: ~75,4 GB (recomendada; requiere A100 80 GB o H100 80 GB, o dos GPUs de 48 GB).
  - Q5_K_M: ~88,4 GB (requiere H100 80 GB con margen ajustado o dos A100 40 GB).
  - Q6_K: ~102,3 GB (requiere dos A100 80 GB o H100 80 GB con offloading).
- GPU recomendadas: A100 80 GB, H100 80 GB para cuantizaciones Q4-Q6; RTX 4090 (24 GB) solo para las variantes mas bajas con offloading a CPU.
- Cabe en consumer GPU: solo las variantes IQ1 e IQ2 con offloading parcial; las variantes Q4 o superiores no caben en una sola GPU de consumo.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), Ollama (si se importa el GGUF), y servidores compatibles con endpoints (tag `endpoints_compatible`). Para el modelo base en safetensors, vLLM o TGI serian opciones, pero no se confirma su soporte para este VLM concreto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LingSante-3.1-air-VL-i1-GGUF (este) | ~124,4 B | no disponible | MIT | GGUF | VLM cuantizado con imatrix, solo ingles declarado |
| LingSante-3.1-air-VL (base) | ~124,4 B | no disponible | MIT | safetensors | Modelo original sin cuantizar |
| Alternativas de ~100-130 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar con modelos alternativos de la misma categoria en terminos de rendimiento, ya que no se han publicado benchmarks en la informacion disponible.

## Limitaciones y advertencias

- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta verificado y podria ser deficiente.
- Riesgo de alucinacion inherente a los modelos de lenguaje de gran escala; no se ha publicado informacion sobre mitigaciones especificas.
- Las cuantizaciones de baja calidad (IQ1_S, IQ1_M, Q2_K_S) degradan notablemente la calidad; la propia model card las etiqueta como "for the desperate" o "very low quality".
- El modelo base es de 124 B de parametros, lo que implica costes de inferencia elevados incluso en cuantizaciones agresivas.
- No se dispone de informacion sobre sesgos conocidos, datos de entrenamiento ni evaluaciones de seguridad.
- La licencia MIT permite uso comercial, pero el usuario debe verificar las condiciones del modelo base original (inclusionAI/LingSante-3.1-air-VL) por si hubiera restricciones adicionales no reflejadas en el repositorio cuantizado.
- Los ficheros mmproj (proyeccion multimodal) no estan en este repositorio, sino en el repositorio estatico (mradermacher/LingSante-3.1-air-VL-GGUF); sin ellos, la funcionalidad de vision puede no estar operativa.
- El repositorio tiene 1.310 GB de tamano total; la descarga de todas las variantes es inviable para la mayoria de usuarios.

## Enlaces

- Repositorio Hugging Face (cuantizado i1): https://huggingface.co/mradermacher/LingSante-3.1-air-VL-i1-GGUF
- Repositorio estatico (incluye mmproj): https://huggingface.co/mradermacher/LingSante-3.1-air-VL-GGUF
- Modelo base: https://huggingface.co/inclusionAI/LingSante-3.1-air-VL
- Pagina de descargas del autor: https://hf.tst.eu/model#LingSante-3.1-air-VL-i1-GGUF
- FAQ y solicitudes de modelos del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
