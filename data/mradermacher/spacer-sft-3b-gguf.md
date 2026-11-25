# mradermacher/SpaceR-SFT-3B-GGUF

## Resumen

SpaceR-SFT-3B-GGUF es la distribucion en formato GGUF del modelo SpaceR-SFT-3B, un modelo conversacional de 3.397.103.616 parametros (aproximadamente 3,4 mil millones) afinado mediante SFT sobre una base no especificada en la informacion disponible. La publica el usuario mradermacher, especializado en cuantizar modelos de terceros para su uso con llama.cpp y herramientas compatibles, no el autor original del modelo, que es RUBBISHLIKE.

El modelo base esta etiquetado como conversacional y multilingue limitado al ingles, e incluye un suplemento multimodal (mmproj) en los ficheros publicados, lo que indica soporte de entrada de imagenes en el pipeline original. La relevancia practica de esta ficha radica en que ofrece una via de despliegue local en hardware de consumo gracias a las cuantizaciones estaticas publicadas, que van desde 1,5 GB en Q2_K hasta 6,9 GB en f16.

No se dispone de informacion sobre la longitud de contexto, la licencia, los datos de entrenamiento ni los resultados de benchmarks en la documentacion proporcionada. El repositorio ocupa 32,8 GB en total, lo que refleja la suma de todas las variantes de cuantizacion y los ficheros multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer conversacional, inferido del pipeline y de la libreria transformers) |
| Parametros totales | 3.397.103.616 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |
| Modelo base | RUBBISHLIKE/SpaceR-SFT-3B |
| Cuantizador | mradermacher |
| Tipo de cuantizacion | estatica (no se han publicado variantes imatrix/weighted) |
| Tamano del repositorio | 32,8 GB |
| Fecha de creacion | 2025-06-05 |
| Ultima actualizacion | 2026-11-25 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base SpaceR-SFT-3B en la documentacion proporcionada. Por el nombre y el pipeline (transformers, etiqueta conversational), se trata de un modelo transformer de aproximadamente 3,4 mil millones de parametros afinado mediante Supervised Fine-Tuning (SFT) sobre una base previa cuyo origen no se especifica. No hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La presencia de ficheros `mmproj` (multi-modal projection) en el repositorio GGUF indica que el modelo original incorpora un adaptador de proyeccion para entrada visual, lo que sugiere capacidades multimodales imagen-texto. Esta capa de proyeccion se distribuye por separado en formato Q8_0 (0,9 GB) y f16 (1,4 GB) para su uso con llama.cpp y derivados. No se han publicado innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, etc.) en la informacion disponible.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Capacidades multimodales de entrada de imagen, segun la presencia de los ficheros mmproj en el repositorio.
- Razonamiento basico y respuesta a instrucciones, derivado del ajuste SFT.
- No se ha confirmado soporte de tool calling ni function calling en la informacion disponible.
- No se ha confirmado soporte de agentes ni razonamiento multi-paso explicito.
- Capacidades multilingues limitadas al ingles segun la etiqueta de idioma del repositorio.
- No se ha confirmado la existencia de un modo de razonamiento explicito (thinking mode).

## Casos de uso

- Prototipado local de asistentes conversacionales: el modelo puede desplegarse en un portatil con GPU de consumo gracias a las cuantizaciones Q4_K_M (2,2 GB) y Q5_K_M (2,5 GB), lo que permite iterar sobre prompts y flujos conversacionales sin coste de API.
- Descripcion de imagenes en pipelines ligeros: con el fichero mmproj-Q8_0 cargado junto al modelo principal, puede emplearse para generar texto a partir de imagenes en aplicaciones de accesibilidad o etiquetado automatico, siempre que se valide la calidad real del adaptador multimodal.
- Filtrado y clasificacion de texto en ingles: su tamano reducido permite ejecutarlo en CPU o GPU modesta para tareas de moderacion, resumen o extraccion de informacion en lotes.
- Educacion y demostraciones: util para ensenar el funcionamiento de modelos conversacionales y de cuantizacion GGUF en entornos con recursos limitados.
- Integracion en aplicaciones de escritorio offline: mediante llama.cpp u Ollama, el modelo puede empaquetarse en herramientas de escritorio que requieran inferencia sin conexion y con requisitos de VRAM minimos.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio ofrece un espectro amplio de cuantizaciones (de Q2_K a f16) sobre el mismo modelo, lo que facilita estudios de degradacion de calidad frente a tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2,5 GB con cuantizaciones Q2_K a Q5_K_M; 2,9 GB con Q6_K; 3,7 GB con Q8_0; 6,9 GB con f16. A estas cifras hay que sumar el espacio de contexto y, en su caso, el fichero mmproj (0,9-1,4 GB).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM puede ejecutar las cuantizaciones Q4 y Q5; una RTX 3060 de 12 GB o superior permite cargar Q8_0 o f16 con contexto amplio. Para despliegues en servidor, A100 o H100 no aportan ventaja significativa dado el tamano del modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada moderna (GTX 1060 6 GB, RTX 3060, RTX 4060, etc.) e incluso en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, transformers con vLLM o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; en la practica, un modelo de 3,4B en Q4_K_M sobre una GPU consumer moderna suele superar las decenas de tokens por segundo, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones comparables (contexto, licencia) de los modelos alternativos en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. A modo orientativo por categoria y tamano:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SpaceR-SFT-3B-GGUF | 3,4B | no disponible | no disponible | GGUF | Multimodal (mmproj), solo ingles |
| Alternativas de ~3B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- La licencia no esta especificada en la informacion disponible; antes de un uso comercial es imprescindible consultar el repositorio del modelo base (RUBBISHLIKE/SpaceR-SFT-3B) para confirmar los terminos.
- El modelo solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta verificado y probablemente sea deficiente.
- No se dispone de informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad, por lo que el riesgo de alucinacion y de respuestas sesgadas no puede acotarse.
- Al ser una cuantizacion estatica sin variantes imatrix, las cuantizaciones de baja precision (Q2_K, Q3_K) pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para produccion.
- Las capacidades multimodales dependen de la carga correcta del fichero mmproj y del soporte del runtime; no se ha validado su calidad en la informacion disponible.
- El modelo tiene solo 60 descargas y 0 likes en el momento de la ficha, lo que indica una validacion comunitaria muy limitada.
- No se han publicado benchmarks, por lo que no se puede garantizar su rendimiento frente a alternativas del mismo tamano.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/SpaceR-SFT-3B-GGUF
- Modelo base: https://huggingface.co/RUBBISHLIKE/SpaceR-SFT-3B
- Pagina de resumen de cuantizaciones del autor: https://hf.tst.eu/model#SpaceR-SFT-3B-GGUF
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de perplejidad por cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
