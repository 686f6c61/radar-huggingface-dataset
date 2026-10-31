# ningsuhen/laya-typed-decisions-onnx

## Resumen

Laya typed decisions ONNX es una conversión a formato ONNX en precisión fp16 del modelo `convaiinnovations/laya-typed-decisions`, publicada por el usuario `ningsuhen` en Hugging Face. El modelo original es un encoder ModernBERT-large de unos 400 millones de parámetros, afinado por Convai Innovations para resolver "typed decisions": preguntas de tipo choice (selección entre opciones), score (puntuación) y noul, evaluadas en una sola pasada hacia adelante. Este fork no es una versión oficial de los autores de laya ni cuenta con su revisión.

El problema que resuelve esta conversión es la ejecución del modelo directamente en el navegador mediante ONNX Runtime Web con el proveedor WebGPU. Para lograrlo, el autor no solo exportó el modelo a ONNX (opset 18), sino que reescribió 30 guardas `Where(IsNaN(p), 0, p)` de los softmax de atención como `Where(Not(Equal(p, p)), 0, p)`, ya que `IsNaN` no tiene kernel WebGPU y forzaba una copia GPU-CPU por capa. El resultado es un único archivo ONNX de 846 MB que mantiene la misma topología y pesos que el original, sin reentrenamiento ni poda.

Su relevancia es principalmente técnica: demuestra cómo portar encoders afinados grandes a WebGPU con paridad de comportamiento verificada frente a fp32 (0/3.082 cambios de decisión en un subconjunto nativo, 47/47 coincidencias en navegador), lo que lo hace útil para demos de enrutado de intenciones con árboles de decisión ejecutados íntegramente en el cliente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-large (encoder transformer) |
| Parametros totales | ~400 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (pesos y activaciones; E/S en fp32) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 18, ejes dinamicos de batch y secuencia) |

## Arquitectura y entrenamiento

El modelo base es un encoder ModernBERT-large de ~400 millones de parametros. La version ONNX no introduce cambios de arquitectura ni de pesos: es una exportacion directa del checkpoint de PyTorch con conversion fp16 mediante `onnxruntime.transformers.float16.convert_float_to_float16` con `keep_io_types=True`, de modo que las entradas y salidas permanecen en fp32. Sobre el grafo se aplico una unica transformacion semantica: la sustitucion de `IsNaN` por el truco `Not(Equal(p, p))` en las 30 guardas de softmax de atencion, que es aritmeticamente equivalente pero ejecutable en el proveedor WebGPU de ONNX Runtime Web.

Los datos de entrenamiento del modelo upstream no se detallan en esta model card mas alla de lo que hereda del repositorio original: se sabe que es un modelo especialista afinado sobre cuatro flujos de trabajo sinteticos para tareas de decisiones tipadas (choice, score, noul), en ingles. No hay informacion sobre numero de tokens, composicion del dataset o uso de RLHF/DPO en la informacion disponible.

## Capacidades

- Clasificacion de texto (pipeline `text-classification`) para decisiones tipadas: seleccion entre opciones (choice), puntuacion (score) y preguntas noul, en una sola pasada hacia adelante.
- Salida de logits por marcador (`logits`, [batch, markers]) y logits de accion (`act_logits`, [batch, 2]).
- Ejecucion en navegador via ONNX Runtime Web con WebGPU (requiere adaptador con `shader-f16`).
- Entradas estructuradas: `input_ids`, `attention_mask`, `marker_pos`, `marker_mask` y `qtype` (choice=0, score=1, noul=2).
- Compatible con ejecucion nativa en CPU mediante ONNX Runtime (unos 2,4 s por pasada en wasm, por lo que WebGPU es el camino recomendado).
- No soporta generacion de texto, tool calling ni agentes: es un encoder clasificador, no un LLM generativo.

## Casos de uso

- Enrutado de intenciones con arboles de decision en el navegador: el modelo puntua cada nodo del arbol en una pasada, permitiendo recorrer arboles de decision (el upstream se valido con un arbol de 23 nodos) sin servidor ni llamadas a APIs externas.
- Demos de velocidad de inferencia WebGPU: la conversion esta optimizada explicitamente para ONNX Runtime Web, con ~52 ms por pasada batch-1 en WebGPU frente a ~2,4 s en wasm CPU, lo que lo hace idoneo para pruebas de rendimiento de IA en cliente.
- Seleccion de opciones en interfaces conversacionales: dado un mensaje de usuario y hasta ~20 opciones, el modelo elige la mejor en preguntas de tipo choice, util para menus dinamicos o disambiguacion.
- Puntuacion de respuestas (tipo score): puede asignar puntuaciones a respuestas candidatas en flujos de evaluacion ligeros dentro de aplicaciones web.
- Clasificacion sin envio de datos al servidor: al ejecutarse 100% en cliente, es adecuado para prototipos donde la privacidad del texto del usuario importa.
- Benchmark de decisiones tipadas: el uso previsto declarado es un benchmark de arboles de decision y una demo de velocidad; sirve como referencia reproducible para comparar backends de ejecucion (WebGPU vs CPU).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos cuantitativos son de paridad y velocidad, reportados por el autor de la conversion:

| Check | Resultado |
|---|---|
| Navegador (Chrome 155, ORT Web 1.31-dev, WebGPU, Metal-3) | misma opcion top que fp32 nativo en 47/47 pasadas; diferencia maxima de probabilidad 0,021 |
| ONNX Runtime nativo 1.30.0 CPU (134 mensajes, arbol de 23 nodos) | 0/3.082 cambios de decision de nodo; intento final correcto 134/134; delta de probabilidad medio 0,0001, maximo 0,0101 |
| Velocidad WebGPU (batch 1, maquina bajo carga) | ~52 ms por pasada |
| Velocidad wasm CPU | ~2,4 s por pasada (~50x mas lento) |

El upstream reporta un ECE de 0,213 (probabilidades sobre-confiadas), dato heredado del modelo original.

## Requisitos de hardware

- Descarga del modelo: 846 MB (un unico archivo ONNX); se recomienda cachearlo con Cache API u OPFS.
- Inferencia en navegador: GPU con soporte WebGPU y la extension `shader-f16` (el autor lo probo en un Apple GPU via Metal-3 con Chrome 155).
- En wasm CPU el modelo funciona pero es ~50x mas lento (~2,4 s por pasada), por lo que no es practico sin WebGPU.
- Alternativamente, puede ejecutarse de forma nativa con ONNX Runtime en CPU de servidor o escritorio; no hay datos de VRAM requerida ni de GPUs concretas (A100, RTX 4090, etc.) en la informacion disponible.
- Despliegue: onnxruntime-web (WebGPU) en navegador u onnxruntime nativo; no aplica vLLM, TGI, llama.cpp ni Ollama al ser un encoder ONNX clasificador.
- La tokenizacion y construccion de entradas (tokens especiales, posiciones de marcadores, layout de opciones) deben hacerse en el llamador con el tokenizador de laya y el paquete `laya` del repositorio upstream.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ningsuhen/laya-typed-decisions-onnx | Clasificador ONNX fp16 para navegador | ~400 M | ONNX (opset 18) | Apache-2.0 | Conversion no oficial; optimizada para WebGPU |
| convaiinnovations/laya-typed-decisions (upstream) | Clasificador PyTorch | ~400 M | PyTorch/safetensors (no disponible en detalle) | Apache-2.0 | Pesos originales, fp32; sin ajustes WebGPU |
| ModernBERT-large (backbone) | Encoder general | ~400 M | PyTorch/safetensors | Apache-2.0 | Modelo base sin afinar; contexto largo tipico de ModernBERT (8192), no confirmado aqui |

No hay alternativas directas publicas conocidas de clasificadores de decisiones tipadas convertidos a ONNX fp16 para WebGPU en la informacion disponible.

## Limitaciones y advertencias

- La evidencia de paridad fp16/fp32 es limitada: 47 pasadas en navegador en una sola GPU y navegador, y un subconjunto de 134 mensajes (no los 616 del sample completo) en la validacion nativa. No es una garantia general de comportamiento identico a fp32.
- El modelo upstream esta afinado sobre cuatro flujos de trabajo sinteticos y solo en ingles; su rendimiento fuera de ese dominio no esta garantizado.
- Probabilidades sobre-confiadas: el upstream reporta ECE 0,213, asi que calibra o umbraliza las salidas antes de usarlas para decisiones.
- Las preguntas de tipo choice deben mantenerse por debajo de ~20 opciones segun la recomendacion del upstream.
- Descarga grande (846 MB) por pagina: hay que planificar cacheo y experiencia de carga.
- WebGPU requiere navegador y adaptador con `shader-f16`; en wasm CPU el rendimiento (~2,4 s por pasada) es inviable para uso interactivo.
- Uso no previsto para decisiones criticas de seguridad, medicas, legales o financieras, segun declara el propio autor.
- No es una release oficial de los autores de laya: no han revisado ni respaldado esta conversion; para los pesos originales usar el repositorio upstream.
- Cero descargas registradas en el momento de la ficha: proyecto de nicho con comunidad minima y sin soporte garantizado.

## Enlaces

- Ficha del modelo (conversion ONNX): https://huggingface.co/ningsuhen/laya-typed-decisions-onnx
- Modelo upstream original: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Archivo de pesos ONNX: https://huggingface.co/ningsuhen/laya-typed-decisions-onnx/resolve/main/fp16/laya.fp16-nonan.onnx
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
