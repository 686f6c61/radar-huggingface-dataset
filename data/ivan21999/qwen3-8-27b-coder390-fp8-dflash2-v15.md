# Ivan21999/Qwen3.8-27B-Coder390-FP8-DFlash2-v15

## Resumen

Qwen3.8-27B-Coder390-FP8-DFlash2-v15 es un paquete de inferencia publicado por Ivan21999 que empaqueta los pesos FP8 del modelo Coder390 (27B parametros) junto con su draft model DFlash2, la torre de vision, la cabeza MTP y la configuracion del servidor NInfer V15. No se trata de un modelo entrenado desde cero, sino de una distribucion lista para ejecutar que anade una capa de memoria episodica persistente sobre el artefacto upstream de nerkyor. El modelo base es un fine-tune de la familia Qwen3.5 orientado a codigo y razonamiento eficiente, con soporte multimodal image-text-to-text.

La relevancia de este paquete reside en dos aspectos tecnicos: por un lado, la integracion de decodificacion especulativa con dos variantes (DFlash2 y MTP) que aceleran la generacion; por otro, la incorporacion de un almacen episodico persistente en SQLite (FORMAT 6) que permite al modelo recuperar informacion de interacciones previas. El pack ocupa 30,3 GB y esta disenado para ejecutarse en una unica GPU Blackwell con soporte `sm_120a`, con una ventana de contexto configurable de hasta 262.144 tokens.

La licencia declarada es Apache-2.0 tanto para el modelo como para el parche de NInfer incluido. El repositorio no registra descargas ni likes en el momento de la consulta, y la model card no detalla la composicion del dataset de entrenamiento ni los resultados de benchmarks estandar, limitandose a mediciones de velocidad de decodificacion y a una prueba cualitativa de recuperacion de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con cabeza MTP y draft model DFlash2; servidor NInfer V15 |
| Parametros totales | 27B (segun denominacion del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 262.144 tokens (`--max-context 262144`) |
| Tipos de cuantizacion | FP8 (pesos y KV cache `--kv-dtype fp8`) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.ninfer` (artefacto propietario de NInfer); SHA-256 `ebacda594ff7bdce5ab13eac88ea1b15dff0df0fffb4691c1b333a88a4baceb3` |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer multimodal de 27B parametros con torre de vision, derivado de la familia Qwen3.5 y especializado en codigo y razonamiento eficiente mediante el linaje de fine-tunes indicado en el nombre del modelo base (EfficientThink, SFT, RLOO, MTP, DFlash2). El paquete incluye la cabeza MTP (multi-token prediction) y un componente DFlash2 que actua como draft model para decodificacion especulativa. La innovacion principal del empaquetado es la integracion de un almacen episodico persistente en SQLite con formato FORMAT 6, gestionado por el servidor NInfer V15, que permite recuperar contexto de sesiones anteriores mediante la opcion `recall_bridge_context`, la cual restaura un interlocutor elegible a partir de un vinculo confirmado e inequivoco dentro del presupuesto de contexto restante.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO en el modelo base. La model card remite al repositorio upstream de nerkyor para el linaje de entrenamiento. El paquete es byte-identico al artefacto FP8 upstream, por lo que no introduce cambios en los pesos.

## Capacidades

- Generacion de texto y razonamiento en el dominio del codigo, segun la especializacion Coder390 del modelo base.
- Procesamiento de imagenes y texto (pipeline image-text-to-text) gracias a la torre de vision incluida.
- Decodificacion especulativa con dos backends: DFlash2 (7 draft tokens) y MTP (3 draft tokens).
- Memoria episodica persistente: almacen SQLite con segmentos que sobrevive entre sesiones y permite recuperacion de contexto historico.
- Recuperacion de contexto mediante `recall_bridge_context`, que restaura interlocutores vinculados dentro del presupuesto de contexto.
- Servidor compatible con API OpenAI (`/v1/chat/completions`) con identificador de modelo `coder390-v15`.
- Concurrencia configurable (`--max-concurrency 8`).
- Soporte de contexto largo hasta 262.144 tokens.
- No se documentan capacidades de tool calling, function calling ni agentes multi-paso en la informacion disponible.

## Casos de uso

- Asistentes de codigo con memoria de proyecto: el almacen episodico persistente permite recordar decisiones de arquitectura, convenciones y fragmentos de codigo discutidos en sesiones anteriores, sin necesidad de reinyectar todo el historial en cada peticion.
- Revision de codigo en pipelines de CI/CD: el modelo puede procesar diffs y capturas de pantalla de errores (gracias a la torre de vision) y generar comentarios de revision, con la ventaja de que el contexto de 262.144 tokens admite repositorios de gran tamano en una sola pasada.
- Atencion al cliente tecnica multi-sesion: la memoria episodica permite recuperar el historial de un cliente entre conversaciones, manteniendo coherencia en incidencias que se prolongan durante dias.
- Analisis de documentacion tecnica con imagenes: al ser image-text-to-text, puede interpretar diagramas de arquitectura, capturas de paneles de monitorizacion o esquemas junto con texto explicativo.
- Despliegue en una unica GPU Blackwell: adecuado para equipos que disponen de RTX PRO 6000 (96 GB) y necesitan servir un modelo de 27B en FP8 con latencia baja (0,39 s de primer token con DFlash2).
- Experimentacion con decodificacion especulativa: el paquete permite comparar DFlash2 y MTP sobre el mismo modelo y hardware, util para investigacion sobre aceleracion de inferencia.
- Sistemas de recuperacion aumentada con estado: el almacen SQLite actua como capa de memoria estructurada que complementa un RAG clasico, permitiendo consultas de dos saltos (como el caso de busqueda de ciudad reportado en la model card).

## Benchmarks y rendimiento

La model card solo reporta mediciones de velocidad de decodificacion y una prueba cualitativa de memoria. No se publican resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

| Backend | Velocidad media de decodificacion | Latencia media del primer token | Aceptacion del draft |
|---|---:|---:|---:|
| DFlash2, 7 draft tokens | 106,6 tok/s | 0,39 s | 20,77 % |
| MTP, 3 draft tokens | 98,8 tok/s | 0,45 s | 45,97 % |

Mediciones realizadas en una RTX PRO 6000 (96 GB), una peticion simultanea, KV en FP8, tres prompts fijos, 400 tokens de salida por prompt, build nativo `77d3033`. La velocidad media de decodificacion excluye el tiempo hasta el primer token.

Prueba de memoria episodica: con el lector actualizado y el almacen post-sleep propio del modelo, Coder390 respondio correctamente 9 de 11 preguntas con DFlash2 (frente a 8/11 con el lector anterior). La respuesta recuperada fue una busqueda de ciudad de dos saltos. Ninguna de las dos builds produjo respuesta final en dos items dentro del presupuesto de 800 tokens.

## Requisitos de hardware

- VRAM estimada: el pack ocupa 30,3 GB en disco; en FP8 con KV cache FP8 y contexto largo se requiere una GPU de gran capacidad. La model card especifica una unica GPU Blackwell con soporte `sm_120a`.
- GPU recomendada: RTX PRO 6000 (96 GB), la unica configuracion validada en las mediciones.
- Compatibilidad con GPU de consumo: no confirmada. El requisito `sm_120a` (Blackwell) y el soporte de contexto hasta 262.144 tokens hacen improbable su ejecucion en GPUs consumer de gama alta convencionales; no se documenta soporte para RTX 4090 ni similares.
- Despliegue: exclusivamente mediante el servidor NInfer V15 en contenedor Docker (`lovewin10/ninfer-v15:5a5c2c1-cu13-v15`), con volumen persistente para el almacen de memoria.
- Throughput: 106,6 tok/s con DFlash2 y 98,8 tok/s con MTP en la configuracion medida (una peticion simultanea).
- Concurrencia maxima configurada: 8 (`--max-concurrency 8`).
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos en la informacion proporcionada. La model card no incluye comparaciones con alternativas de la misma categoria. Como referencia estructural, el modelo se posiciona en el segmento de 27B parametros multimodales con cuantizacion FP8, pero no es posible establecer comparaciones cuantitativas con modelos como Qwen2.5-VL, Gemma 3 o Llama 3.3 sin datos publicados.

| Modelo | Parametros | Contexto | Licencia | Formato | Datos comparativos |
|---|---|---|---|---|---|
| Qwen3.8-27B-Coder390-FP8-DFlash2-v15 | 27B | 262.144 | Apache-2.0 | `.ninfer` | no disponible |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se publican datos sobre sesgos conocidos del modelo ni sobre su comportamiento en dominios sensibles.
- Riesgo de alucinacion no cuantificado; la prueba de memoria episodica mostro 2 fallos sobre 11 preguntas dentro del presupuesto de 800 tokens.
- Idiomas soportados no documentados; no se puede garantizar calidad en castellano ni en otros idiomas distintos del ingles.
- La licencia Apache-2.0 se declara para el modelo y el parche de NInfer, pero el formato `.ninfer` y el servidor NInfer V15 son componentes propietarios cuya licencia de uso en produccion no se detalla mas alla de la referencia al parche.
- Dependencia fuerte del ecosistema NInfer: no hay soporte documentado para frameworks estandar (vLLM, llama.cpp, TGI), lo que limita la portabilidad.
- Requisito de hardware restrictivo: GPU Blackwell con `sm_120a`; no se confirma funcionamiento en generaciones anteriores.
- El repositorio no registra descargas ni likes, lo que impide evaluar su adopcion o validacion por parte de la comunidad.
- La memoria episodica persistente almacena datos de sesiones en SQLite; no se detallan politicas de privacidad, cifrado ni retencion, lo que supone un riesgo en entornos con datos personales.
- El modelo base es un fine-tune con nombre compuesto de multiples etapas (SFT, RLOO, MTP, DFlash2) sin model card detallada en este repositorio; la trazabilidad del entrenamiento depende del repositorio upstream.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Ivan21999/Qwen3.8-27B-Coder390-FP8-DFlash2-v15
- Modelo base upstream: https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2
- Artefacto FP8 upstream (referencia byte-identica): https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2/blob/7eced947d7132dffbc2c0ea4db332081360afbf8/FP8/Qwen3.8-27B-Coder390-FP8-DFlash2.ninfer
- README del parche NInfer V15: `ninfer-v15-patch/README.md` (incluido en el repositorio)
- Imagen Docker del servidor: `lovewin10/ninfer-v15:5a5c2c1-cu13-v15`
