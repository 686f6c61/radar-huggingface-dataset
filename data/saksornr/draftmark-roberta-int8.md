# saksornr/draftmark-roberta-int8

## Resumen

Draftmark RoBERTa FT INT8 es un clasificador binario de texto en ingles disenado para detectar prosa generada por IA. Lo publica el usuario saksornr bajo licencia MIT y se distribuye como exportacion ONNX cuantizada a INT8, pensada para ejecutarse integramente en el navegador mediante onnxruntime-web y WebAssembly. El modelo deriva de Oxidane/tmr-ai-text-detector (una RoBERTa base con licencia MIT), sobre la que se han reentrenado las cuatro ultimas capas del encoder y la cabeza de clasificacion.

El problema que aborda es la deteccion de texto generado por modelos de lenguaje en entornos donde no es viable enviar el contenido a un servidor: la inferencia ocurre en el dispositivo del usuario, con un peso total de 131,1 MB entre modelo y tokenizer. La salida son dos logits ordenados como `human` y `ai`, a los que se aplica softmax por ventana.

Es relevante por su enfoque en robustez frente a reescrituras: segun la model card, mejora la recall sobre parafrasis respecto a su predecesor (66,3 % frente a 50,0 % de media), mantiene una recall alta sobre texto IA sin editar (277/300) y reduce drasticamente los falsos positivos en ensayos de estudiantes (0/220). El contexto de entrenamiento es de 512 tokens por ventana, con agregacion ponderada por tokens de contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa (base: Oxidane/tmr-ai-text-detector), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens por ventana (incluyendo tokens especiales); ventanas alineadas a frases y agregadas |
| Tipos de cuantizacion | INT8 weight-only (grafo `onnx/model.int8.onnx`) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | ONNX (INT8); checkpoint Transformers reconstruible desde la rama `training` (`trainable.safetensors`) |
| Tamano de assets | 131,1 MB (modelo + tokenizer) |
| Entradas del grafo | `input_ids` y `attention_mask` como tensores INT64 de rango 2 |
| Salidas | 2 logits: indice 0 = `human`, indice 1 = `ai` |
| Umbral de flag | 0,999146566314596 |
| Corte de senal limitada | 0,25 |
| Rango de entrada evaluado | 150-2.000 palabras, hasta 20.000 caracteres |
| Modelo base | Oxidane/tmr-ai-text-detector (revision `0ceddea903015ef99cbaa040a4d8a216aed9c683`) |

## Arquitectura y entrenamiento

La arquitectura es una RoBERTa encoder-only reutilizada como clasificador de secuencia. El ajuste fino afecta unicamente a las cuatro ultimas capas del encoder y a la cabeza de clasificacion; el resto de pesos permanece congelado respecto al modelo base de Oxidane. La exportacion a ONNX con cuantizacion INT8 weight-only reduce el peso a 131,1 MB y permite ejecucion en navegador con onnxruntime-web sobre WASM. El pipeline de inferencia trocea el texto en ventanas alineadas a frases de hasta 512 tokens, aplica softmax a cada ventana y promedia las puntuaciones de la clase `ai` ponderando por numero de tokens de contenido; las frases que exceden la ventana se dividen.

El entrenamiento uso pares agrupados por fuente de DetectRL-X, prosa IA y humana original de DetectionAI, y ensayos de estudiantes del corpus ASAP 2.0 (CC BY 4.0, atribuido a Scott Crossley y colaboradores, Vanderbilt University y The Learning Agency Lab) y de la coleccion TOEFL de Shijaku-Canhasi. La model card documenta las revisiones fijadas de cada fuente, los tamanos de los splits y un cribado de solapamiento entre conjuntos. No se especifica el numero total de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO (no disponible). La innovacion principal no es arquitectonica sino de distribucion y de objetivo: un detector de autoria ejecutable localmente, con umbral calibrado y agregacion por ventanas orientada a mitigar falsos positivos en escritura humana no nativa.

## Capacidades

- Clasificacion binaria de texto en ingles: distingue prosa humana de prosa generada por IA.
- Deteccion sobre texto IA sin editar, con recall alta en el holdout publicado (277/300).
- Deteccion de texto reescrito por decodificadores (89/150 en el holdout) y por modelos sequence-to-sequence (110/150).
- Ejecucion on-device en navegador mediante ONNX Runtime Web y WASM, sin llamadas a servidor.
- Procesamiento de documentos largos por troceado en ventanas de 512 tokens con agregacion ponderada.
- Salida de puntuacion continua (softmax) apta para revision manual, ademas del flag binario con umbral fijo.
- Soporte de tool calling / function calling: no disponible (es un clasificador, no un modelo generativo).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no; solo ingles.
- Capacidades especiales: modo de senal limitada con corte en 0,25 para entradas poco informativas.

## Casos de uso

- Revision editorial en el navegador: un editor de contenidos puede integrar el modelo en una extension o web app que puntue borradores sin salir del cliente, gracias a la exportacion ONNX de 131,1 MB y a la inferencia WASM.
- Deteccion en plataformas educativas: el modelo reduce los falsos positivos en ensayos de estudiantes no nativos (0/220 en ASAP 2.0), por lo que sirve como senal de triaje previa a una revision humana en lugar de como decision automatica.
- Moderacion de contenido generado por usuarios: clasificacion de envios en foros o comentarios para marcar posibles textos sinteticos, con la puntuacion continua como criterio de priorizacion.
- Verificacion de originalidad en publicaciones: comparacion de articulos recibidos frente al patron de escritura IA, usando el umbral documentado y el modo de senal limitada para descartar entradas demasiado cortas.
- Analisis forense de documentos largos: el troceado en ventanas de 512 tokens con agregacion ponderada permite procesar textos de hasta 20.000 caracteres manteniendo granularidad por frase.
- Investigacion sobre deteccion de IA: el checkpoint Transformers es reconstruible desde la rama `training` (`trainable.safetensors`) y el modelo base fijado, lo que facilita reproducir experimentos y comparar contra el detector previo.
- Integracion en pipelines de confianza cero: al no requerir envio de datos a un servidor, encaja en flujos con requisitos de privacidad estrictos donde el texto no puede salir del dispositivo.

## Benchmarks y rendimiento

Resultados del holdout publicado en la model card, comparados con el detector previo de Draftmark (Ettin):

| Medida | Ettin (previo) | Draftmark FT INT8 |
|---|---:|---:|
| Recall en IA sin editar | 215/300 | 277/300 |
| Recall en reescritura por decodificador | 18/150 | 89/150 |
| Recall en reescritura seq2seq | 132/150 | 110/150 |
| Recall media en parafrasis | 50,0 % | 66,3 % |
| Falsos positivos en humanos generales | 10/300 | 1/300 |
| Falsos positivos en ensayos de estudiantes | 80/220 | 0/220 |

El intervalo de confianza pareado al 95 % para la mejora media en parafrasis fue de +10,7 a +22,0 puntos porcentuales. La recall frente a reescrituras seq2seq disminuyo. Los resultados corresponden a una comparacion contra el detector previo de Draftmark sobre esas muestras concretas; no se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) porque el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el peso INT8 es de 131,1 MB, por lo que el modelo cabe holgadamente en memoria de cualquier GPU consumer y en RAM de navegador.
- GPU recomendadas: no requiere GPU; el caso de uso principal es CPU/navegador via WASM. En servidor puede ejecutarse en cualquier GPU (A100, H100, RTX 4090) o en CPU.
- Cabe en GPU consumer: si, en todas; tambien en CPU y en el navegador.
- Opciones de despliegue: ONNX Runtime Web (WASM) en navegador; ONNX Runtime en servidor; reconstruccion a Transformers desde la rama `training` para uso con PyTorch. No se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Draftmark RoBERTa FT INT8 | no disponible (base RoBERTa) | 512 tokens por ventana | Deteccion IA, ONNX INT8 en navegador | MIT | Hugging Face |
| Oxidane/tmr-ai-text-detector (modelo base) | no disponible | no disponible | Deteccion IA en Transformers | MIT | Hugging Face |
| Ettin (detector previo de Draftmark) | no disponible | no disponible | Deteccion IA | no disponible | no disponible |

No se dispone de datos de parametros ni de contexto de los modelos comparables en la informacion proporcionada; la comparacion cuantitativa disponible se limita a la tabla de benchmarks frente a Ettin.

## Limitaciones y advertencias

- Solo procesa ingles; no hay soporte multilingue.
- Ventana maxima de 512 tokens por inferencia; los textos largos dependen del troceado y la agregacion, lo que puede diluir senales locales.
- La deteccion de reescrituras seq2seq empeoro respecto al detector previo (110/150 frente a 132/150).
- Los resultados dependen del generador, el metodo de reescritura, el dominio y la poblacion de escritura; no son generalizables sin validacion propia.
- El modelo no debe usarse como evidencia de autoria por si solo: la model card indica explicitamente que las decisiones de autoria requieren evidencia independiente y que las puntuaciones solo apoyan la revision manual.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de clasificacion erronea en dominios no representados en el entrenamiento.
- Sesgos potenciales derivados de la composicion del corpus (DetectRL-X, DetectionAI, ASAP 2.0, TOEFL); no se documenta una evaluacion de sesgos por subgrupo.
- El umbral de flag es muy alto (0,999146566314596), lo que prioriza precision sobre recall en el uso por defecto.
- Licencia MIT permite uso comercial, pero los corpus de entrenamiento tienen sus propias condiciones (ASAP 2.0 es CC BY 4.0 y requiere atribucion).
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saksornr/draftmark-roberta-int8
- Demo en vivo: https://draftmark-virid.vercel.app/
- Manifiesto de release: https://huggingface.co/saksornr/draftmark-roberta-int8/blob/main/release-manifest.json
- Benchmark agregado: https://huggingface.co/saksornr/draftmark-roberta-int8/blob/main/finetune-v3.json
- Guia de reconstruccion GPU: https://huggingface.co/saksornr/draftmark-roberta-int8/blob/main/handoff.md
- Tensores de entrenamiento: https://huggingface.co/saksornr/draftmark-roberta-int8/blob/training/training/trainable.safetensors
- Modelo base TMR: https://huggingface.co/Oxidane/tmr-ai-text-detector
- Paper DetectRL-X: https://aclanthology.org/2026.acl-long.1773/
- Repositorio DetectionAI: https://github.com/brianjabarian/DetectionAI
- Corpus ASAP 2.0: https://github.com/scrosseye/ASAP_2.0
- Corpus Shijaku-Canhasi: https://github.com/rexshijaku/chatgpt-generated-text-detection-corpus
