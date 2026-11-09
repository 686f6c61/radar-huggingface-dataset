# n0social/plumb-memory-loss-ai-assistant

## Resumen

Plumb Memory Loss Ai Model es un modelo de extraccion de caracteristicas (feature-extraction) desarrollado por n0social como componente opcional dentro de Minnows, una aplicacion de codigo abierto orientada a personas con perdida de memoria. El modelo lee una linea de diario escrita por el usuario y sugiere dos "deltas de brujula" (`law_chaos` y `good_evil`) que sirven como indicaciones para la reflexion personal, no como juicios ni puntuaciones. La brujula que se muestra en la aplicacion sigue siendo la lectura basada en reglas; este modelo no la sustituye.

Tecnicamente se trata de un modelo derivado de `sentence-transformers/all-MiniLM-L6-v2`, reentrenado para producir dos salidas escalares a partir de una unica linea de texto. Se distribuye en formato ONNX (`model.onnx` y `model.onnx.data`) junto con el tokenizer, con un tamano de repositorio de 0,3 GB. La entrada son `input_ids` y `attention_mask`, y las salidas son los dos valores mencionados. El modelo solo soporta ingles y su licencia es "other", sin detalle adicional en la informacion disponible.

Su relevancia es acotada y muy especifica: no es un modelo de proposito general ni compite en benchmarks de razonamiento o codigo, sino un clasificador de dos dimensiones integrado en un producto concreto de asistencia a la memoria. Para desarrolladores e investigadores resulta interesante como ejemplo de modelo pequeno, desplegable en ONNX, orientado a una tarea de senalizacion etica y no diagnostica dentro de una aplicacion de salud y bienestar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder derivado de `sentence-transformers/all-MiniLM-L6-v2` con cabecera de dos salidas (`law_chaos`, `good_evil`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del encoder base, no especificada en la informacion) |
| Tipos de cuantizacion | no disponible (distribucion en ONNX; no se detallan variantes cuantizadas) |
| Idiomas soportados | en (ingles) |
| Licencia | other |
| Formato de pesos | ONNX (`model.onnx`, `model.onnx.data`) + `tokenizer.json` y `tokenizer_config.json` |

## Arquitectura y entrenamiento

El modelo parte del encoder `sentence-transformers/all-MiniLM-L6-v2`, un transformer encoder compacto orientado a embeddings de frases, y anade una cabeza de regresion con dos salidas escalares: `law_chaos` y `good_evil`. La entrada son `input_ids` y `attention_mask`, y la salida son los dos deltas de brujula. La exportacion se realiza a ONNX, lo que facilita su integracion en entornos de inferencia ligeros sin depender del stack completo de PyTorch.

El conjunto de entrenamiento de esta release, denominado `grey-matter-input-v1`, contiene 24.477 filas: la particion legacy de combinaciones de etiquetas mas el conjunto "grey matter" v1, compuesto por 4.580 dias de diario sinteticos etiquetados por `judgement-v2`. El autor declara explicitamente que no se incluyen diarios de usuarios reales en el conjunto de entrenamiento. La version del modelo es `kjss-encoder-v0.0.4-all-available-v1`. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Extraccion de caracteristicas sobre una unica linea de diario en ingles.
- Prediccion de dos valores continuos: `law_chaos` y `good_evil`, interpretados como sugerencias de brujula.
- Generacion de indicaciones ("compass hints") para la reflexion del usuario, no veredictos ni puntuaciones.
- Integracion como componente opcional dentro de la aplicacion Minnows.
- Inferencia via ONNX con entradas `input_ids` y `attention_mask`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Senalizacion reflexiva en la aplicacion Minnows: el modelo lee una linea de diario y devuelve dos deltas que la app muestra como invitacion a notar patrones, sin sustituir la brujula basada en reglas.
- Registro de habitos y rutinas: al anotar un momento real (una rutina, una conversacion, una decision), el modelo aporta una lectura adicional que ayuda al usuario a comparar lo que dijo que le importaba con lo que hizo.
- Seguimiento personal no clinico: personas que quieren revisar su coherencia entre intenciones y acciones pueden usar las sugerencias como punto de partida para su propia reflexion.
- Prototipado de asistentes de escritura diaria: desarrolladores que construyen aplicaciones de journaling pueden reutilizar el modelo como ejemplo de clasificador ligero de dos dimensiones sobre texto corto.
- Despliegue en entornos con recursos limitados: al distribuirse en ONNX y derivar de un encoder compacto, puede ejecutarse en infraestructura modesta o en el navegador mediante ONNX Runtime Web.
- Investigacion sobre senalizacion etica en salud digital: sirve como caso de estudio de un modelo que se presenta explicitamente como no diagnostico y no sustituto de atencion clinica.
- Uso clinico asistido por profesionales: el autor menciona que un clinico podria usar el mismo registro con un cliente, aunque los flujos clinicos detallados no forman parte de la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,3 GB y el encoder base es compacto, por lo que la huella deberia ser reducida, pero no se aportan cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probablemente si, dado el tamano del encoder base, aunque no se confirma en la informacion.
- Opciones de despliegue: ONNX Runtime (formato nativo del modelo); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Plumb Memory Loss Ai Model | no disponible | no disponible | Feature-extraction con dos salidas (`law_chaos`, `good_evil`) | other | ONNX en Hugging Face |
| sentence-transformers/all-MiniLM-L6-v2 | no disponible en la informacion | no disponible en la informacion | Embeddings de frases | no disponible en la informacion | Hugging Face |
| Otros clasificadores de texto corto | no disponible | no disponible | Clasificacion / regresion | no disponible | no disponible |

La comparativa con alternativas de la misma categoria no esta disponible en la informacion proporcionada; el unico punto de referencia documentado es el encoder base del que deriva.

## Limitaciones y advertencias

- El modelo no diagnostica, trata, cura ni previene ninguna enfermedad y no sustituye la atencion clinica, segun declara el propio autor.
- Las salidas son sugerencias para notar, no veredictos, puntuaciones ni perfiles de terceros.
- Solo soporta ingles.
- Entrenado exclusivamente con datos sinteticos y combinaciones de etiquetas; no se han usado diarios de usuarios reales, lo que puede limitar la generalizacion a texto real.
- Riesgo de alucinacion o de sugerencias poco ajustadas no cuantificado en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia "other": no se detallan las restricciones para uso comercial; es necesario consultar los terminos del repositorio antes de integrarlo en produccion.
- El modelo no reemplaza la brujula basada en reglas de la aplicacion; su uso esta pensado como componente opcional.
- No dispone de soporte para tool calling, agentes ni razonamiento multi-paso, por lo que no es adecuado para tareas de ese tipo.

## Enlaces

- Hugging Face: https://huggingface.co/n0social/plumb-memory-loss-ai-assistant
- Sitio web del producto: https://minnows.cloud
- Encoder base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
