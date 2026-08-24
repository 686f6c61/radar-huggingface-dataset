# deu05232/promptriever-llama2-7B-followtable-RandLH

## Resumen

El modelo `deu05232/promptriever-llama2-7B-followtable-RandLH` es un adaptador PEFT (Parameter-Efficient Fine-Tuning) construido sobre el modelo base `meta-llama/Llama-2-7b-hf`. Forma parte de la familia Promptriever, un enfoque que demuestra que los modelos de recuperación (retrieval) pueden controlarse mediante instrucciones en lenguaje natural, de forma análoga a los modelos de lenguaje. Este checkpoint concreto añade la variante "followtable" y el sufijo "RandLH", que sugiere una configuración específica de entrenamiento, aunque la model card no proporciona detalles.

El modelo tiene un tamaño de repositorio de 14.3 GB, lo que indica que incluye los pesos completos del adaptador y posiblemente el modelo base en formato safetensors. Fue creado el 24 de agosto de 2026 (según los metadatos) y no ha recibido descargas ni likes, lo que sugiere que es un experimento de investigación más que un modelo de producción. La licencia no está especificada, lo que limita su uso comercial sin verificación previa.

La relevancia de este modelo radica en su contribución al campo de la recuperación de información controlada por prompts, una línea de investigación emergente que busca unificar las capacidades de instrucción de los LLM con la eficiencia de los modelos de retrieval especializados. Sin embargo, la falta de documentación y de resultados de evaluación hace que su utilidad práctica sea incierta sin experimentación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) con adaptadores PEFT |
| Parametros totales | No disponible (modelo base: 7B; parametros del adaptador desconocidos) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Llama-2 soporta 4096 tokens, pero no se confirma si se modificó) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo base es principalmente ingles, pero no se especifica) |
| Licencia | No disponible |
| Formato de pesos | safetensors (segun tags) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2, un transformer autoregresivo decoder-only con aproximadamente 7 mil millones de parametros. Sobre esta base se ha aplicado un adaptador mediante la libreria PEFT (version 0.14.0), lo que implica que solo una fraccion de los parametros se actualiza durante el entrenamiento (por ejemplo, mediante LoRA o adaptadores de atencion). No se dispone de informacion sobre el tamaño del adaptador, la cantidad de tokens de entrenamiento, la composicion del dataset ni el procedimiento de entrenamiento (RLHF, DPO, etc.).

El nombre "promptriever" sugiere que el modelo ha sido entrenado para realizar tareas de recuperacion de documentos condicionadas a instrucciones textuales. La variante "followtable" podria indicar que el modelo aprende a seguir tablas de instrucciones o formatos estructurados, y "RandLH" podria referirse a una estrategia de muestreo o a una configuracion de datos (por ejemplo, random left/right). Sin embargo, estos son solo supuestos basados en la nomenclatura, no en documentacion oficial.

## Capacidades

- Recuperacion de informacion condicionada a prompts: el modelo esta disenado para recibir una instruccion en lenguaje natural y devolver documentos relevantes, similar a un sistema de busqueda semantica controlable.
- Posible seguimiento de instrucciones complejas: al estar basado en Llama-2 y ajustado con PEFT, puede heredar cierta capacidad de generacion de texto, aunque su funcion principal parece ser la recuperacion.
- Soporte de tool calling: no confirmado.
- Capacidades de agente: no confirmado.
- Multilingue: no confirmado; el modelo base Llama-2 tiene un rendimiento limitado fuera del ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Busqueda semantica en corpus corporativos: el modelo puede indexar documentos internos y responder a consultas expresadas en lenguaje natural, devolviendo los pasajes mas relevantes. Su naturaleza condicionada a prompts permite adaptar la busqueda a dominios especificos sin reentrenar.
- Sistemas de preguntas y respuestas sobre documentacion tecnica: al integrarse con un pipeline de recuperacion-aumentada (RAG), podria utilizarse para extraer informacion precisa de manuales, APIs o wikis.
- Moderacion de contenido: podria configurarse para recuperar ejemplos de contenido inapropiado dado un prompt de politica de moderacion, ayudando a filtrar texto en plataformas.
- Asistentes de investigacion academica: permitiria buscar articulos o fragmentos relevantes a partir de descripciones de topicos en lenguaje natural, acelerando revisiones bibliograficas.
- Analisis de contratos o documentos legales: el modelo podria localizar clausulas especificas dentro de largos documentos legales cuando se le pide con una instruccion como "encuentra la clausula de indemnizacion".
- Chatbots de atencion al cliente con recuperacion de respuestas: en lugar de generar respuestas libres, el sistema recupera respuestas predefinidas o articulos de ayuda basandose en la consulta del usuario, reduciendo alucinaciones.

Nota: estos casos de uso son hipoteticos y dependen de que el modelo funcione como se espera de un modelo de retrieval. No se ha verificado su rendimiento en ninguna de estas tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna metrica de evaluacion, y la busqueda web no ha revelado datos de rendimiento para esta variante especifica. No se puede comparar con otros modelos de retrieval sin datos cuantitativos.

## Requisitos de hardware

- VRAM estimada para inferencia: dado que el modelo base es Llama-2-7B, se necesitan aproximadamente 14 GB de VRAM en FP16 para cargar el modelo completo. Con el adaptador PEFT, el requisito adicional es minimo (normalmente menos de 1 GB). En cuantizacion INT8, la VRAM se reduce a unos 7-8 GB.
- GPU recomendadas: una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4080, RTX 4090, A10G) para FP16. Para cuantizacion INT4, una GPU con 8 GB (como RTX 3070) podria ser suficiente.
- Si cabe en consumer GPU: si, en cuantizacion INT4 o INT8, pero no en FP16 sin una GPU de gama alta.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la libreria `transformers` y `peft` en Python. Tambien es compatible con frameworks de inferencia como vLLM (si se fusiona el adaptador con el modelo base) o llama.cpp (si se convierte a GGUF).
- Latencia y throughput estimados: no disponibles. Dependen del hardware y del tamaño de lote.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa. El modelo se basa en Llama-2-7B, por lo que podria compararse con el propio Llama-2-7B (sin adaptador) y con otros modelos de retrieval como BGE-large, GTR o Contriever. Sin embargo, no hay datos de rendimiento de este checkpoint concreto, por lo que cualquier comparacion seria especulativa. Se recomienda consultar el repositorio GitHub de Promptriever para obtener informacion sobre la familia de modelos en general.

## Limitaciones y advertencias

- Sesgos conocidos: al derivar de Llama-2, el modelo puede heredar sesgos de genero, raza y religion presentes en los datos de entrenamiento originales. No se ha realizado ninguna mitigacion especifica documentada.
- Riesgo de alucinacion: aunque su funcion principal es la recuperacion, si se utiliza para generacion, puede producir respuestas inventadas o inexactas.
- Limitaciones de contexto: la ventana de contexto del modelo base es de 4096 tokens, lo que limita la longitud de las consultas y documentos que puede procesar de una vez.
- Limitaciones de idioma: el modelo base esta principalmente entrenado en ingles; su rendimiento en otros idiomas, incluido el español, es probablemente inferior.
- Restricciones de licencia: la licencia no esta especificada. Dado que el modelo base Llama-2 tiene una licencia comercial restringida, es necesario verificar los terminos antes de cualquier uso comercial.
- Produccion: al ser un adaptador sin documentacion ni evaluacion publica, no se recomienda su uso en entornos de produccion sin una validacion exhaustiva.

## Enlaces

- HuggingFace: https://huggingface.co/deu05232/promptriever-llama2-7B-followtable-RandLH
- Repositorio GitHub de Promptriever: https://github.com/deu05232/promptriever
- Variantes relacionadas en HuggingFace:
  - https://huggingface.co/deu05232/promptriever-llama2-7B-followtable
  - https://huggingface.co/deu05232/promptriever-llama2-7B-followtable-JointLH4
- Pagina de inferencia en FriendliAI (para una variante similar): https://friendli.ai/models/deu05232/promptriever-repro-llama2-7b
