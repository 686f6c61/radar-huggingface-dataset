# mradermacher/Llama-Poro-2-8B-Long-Instruct-heretic-i1-GGUF

## Resumen

El modelo `mradermacher/Llama-Poro-2-8B-Long-Instruct-heretic-i1-GGUF` es una cuantización GGUF con matriz de importancia (imatrix) del modelo base `dufuspaelli/Llama-Poro-2-8B-Long-Instruct-heretic`, desarrollado por el cuantizador mradermacher. Se trata de una variante "heretic" (abliterated) del modelo finlandés Llama-Poro-2-8B-Long-Instruct, que a su vez deriva de la arquitectura Llama 3.3 con 8.030 millones de parámetros. El término "heretic" indica que se ha aplicado una técnica de abliteración para eliminar los rechazos y restricciones de seguridad del modelo original, resultando en una salida menos censurada.

Este modelo está pensado para usuarios que necesitan ejecutar localmente un LLM de 8B con capacidades conversacionales e instructivas en inglés y finlandés, con una ventana de contexto extendida (indicada por "Long") y sin filtros de contenido. La versión GGUF con imatrix ofrece cuantizaciones optimizadas para diferentes equilibrios entre tamaño y calidad, lo que permite su despliegue en hardware de consumo. Su relevancia radica en la combinación de un tamaño manejable, soporte multilingüe (especialmente finlandés, un idioma poco cubierto) y la ausencia de restricciones de contenido, algo demandado en ciertos casos de uso de investigación y generación creativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Llama 3.3, no se especifica detalle) |
| Parametros totales | 8.030.261.248 (8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el nombre sugiere ventana larga, sin valor concreto) |
| Tipos de cuantizacion | i1-Q2_K (3.3 GB), i1-IQ3_M (3.9 GB), i1-Q4_K_S (4.8 GB), archivo imatrix (0.1 GB) |
| Idiomas soportados | Ingles, finlandes |
| Licencia | llama3.3 |
| Formato de pesos | GGUF (cuantizado con imatrix) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base. Por el nombre y la familia, se infiere que sigue el diseño de un transformer decoder-only similar a Llama 3.3, con 8B parametros y posiblemente atencion con ventana larga (de ahi el sufijo "Long"). El modelo base `Llama-Poro-2-8B-Long-Instruct-heretic` fue entrenado a partir de Llama-Poro-2-8B-Long-Instruct, un modelo de LumiOpen especializado en finlandes, utilizando el dataset de instrucciones `LumiOpen/poro2-instruction-collection`. Posteriormente se aplico una tecnica de abliteracion (abliteration) para eliminar las capas de rechazo y censura, dando lugar a la variante "heretic". El proceso de cuantizacion realizado por mradermacher emplea imatrix (importance matrix) para mejorar la calidad de los quants de baja precision. No se han publicado detalles sobre el numero de tokens de entrenamiento, el uso de RLHF o DPO, ni otras innovaciones tecnicas.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles y finlandes.
- Seguimiento de instrucciones (instruct tuning) para tareas como resumen, redaccion, traduccion y respuesta a preguntas.
- Ventana de contexto extendida (indicada por "Long"), aunque no se especifica el numero exacto de tokens.
- Al ser un modelo "heretic" (abliterated), no aplica los rechazos tipicos de seguridad, lo que permite generar contenido que otros modelos censurarian.
- Compatible con el ecosistema transformers y con motores de inferencia que soporten GGUF (llama.cpp, Ollama, etc.).
- No se confirma soporte de tool calling, agentes, vision ni audio.

## Casos de uso

- Generacion de contenido creativo sin restricciones: el modelo puede producir narrativa, poesia o dialogo en ingles o finlandes sin los filtros de seguridad habituales, util para escritores que exploran temas controvertidos.
- Asistente de escritura en finlandes: gracias a su entrenamiento en ese idioma, puede redactar correos, articulos o documentacion tecnica en finlandes con mayor naturalidad que modelos genericos.
- Traduccion automatica entre ingles y finlandes: su bilingüismo permite traducciones directas, aunque no se han publicado metricas de calidad.
- Chatbot local para experimentacion en investigacion: al ser un modelo de 8B cuantizado, puede ejecutarse en una GPU de consumo para probar comportamientos de modelos abliterated en entornos controlados.
- Analisis de texto en finlandes: extraccion de entidades, resumen de documentos o clasificacion de contenido, aprovechando la ventana de contexto larga.
- Generacion de datos sinteticos para entrenar otros modelos: al no tener restricciones, puede producir respuestas variadas y sin sesgos de rechazo, util para aumentar datasets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo o su variante base.

## Requisitos de hardware

- VRAM estimada para inferencia: el quant i1-Q4_K_S de 4.8 GB requiere al menos 6-8 GB de VRAM para caber con el contexto y las activaciones; los quants mas pequeños (i1-Q2_K de 3.3 GB) pueden funcionar con 4-6 GB.
- GPU recomendadas: tarjetas consumer como RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4070 o superiores; tambien puede ejecutarse en CPU con suficiente RAM usando llama.cpp.
- Cabe en GPUs consumer de gama media y alta; no requiere hardware de datacenter.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier motor compatible con GGUF. Tambien se puede cargar en transformers si se convierte a safetensors, aunque el formato nativo es GGUF.
- Latencia y throughput: no disponibles; dependen del hardware y del quant elegido.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente. Como referencia estructural, se puede comparar con otros modelos de 8B como Llama 3.1 8B Instruct o Mistral 7B, pero sin benchmarks no es posible establecer una comparativa objetiva. La principal diferencia es la licencia (llama3.3) y el soporte especifico para finlandes, ademas de la naturaleza abliterated. No se incluyen mas detalles por falta de informacion.

## Limitaciones y advertencias

- Al ser un modelo abliterated, puede generar contenido ofensivo, ilegal o perjudicial sin filtros; el usuario asume la responsabilidad de su uso.
- Riesgo de alucinaciones: como cualquier LLM, puede inventar hechos o datos, especialmente en tareas de conocimiento factual.
- Limitaciones de idioma: aunque soporta ingles y finlandes, no se garantiza la misma calidad en otros idiomas.
- La licencia llama3.3 permite uso comercial, pero se recomienda revisar los terminos exactos de Meta para evitar conflictos.
- No se dispone de informacion sobre sesgos especificos del modelo, pero al estar entrenado principalmente en finlandes e ingles, puede reflejar sesgos culturales de esas regiones.
- Para produccion, se debe validar la calidad de las respuestas y considerar que la ausencia de censura puede no ser adecuada para aplicaciones publicas.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/mradermacher/Llama-Poro-2-8B-Long-Instruct-heretic-i1-GGUF
- Modelo base (dufuspaelli): https://huggingface.co/dufuspaelli/Llama-Poro-2-8B-Long-Instruct-heretic
- Dataset de instrucciones: https://huggingface.co/datasets/LumiOpen/poro2-instruction-collection
- Guia sobre modelos abliterated (referencia general): https://locallyuncensored.com/blog/abliterated-models-guide.html
