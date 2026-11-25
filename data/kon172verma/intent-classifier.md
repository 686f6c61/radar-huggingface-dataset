# kon172verma/intent-classifier

## Resumen

Intent Classifier es una familia de modelos pequenos ajustados por el usuario de Hugging Face kon172verma para una tarea muy concreta: enrutar una peticion de usuario a una unica herramienta (tool routing) dentro de un sistema de agentes. No genera respuestas en lenguaje natural, sino una etiqueta compacta de enrutamiento (un identificador posicional de herramienta o, en la version v1.0, el nombre de la herramienta). El repositorio agrupa varias releases construidas sobre modelos base distintos: Qwen3-0.6B, Qwen2.5-0.5B-Instruct, SmolLM2-360M-Instruct y Llama-3.2-1B-Instruct.

La release recomendada por el autor es v2.1 sobre Qwen2.5-0.5B, que reporta un 99,9 % de exactitud en test y una latencia P50 de 253 ms. Las otras dos variantes de v2.1 (Qwen3-0.6B y SmolLM2-360M) alcanzan un 99,8 % y un 99,7 % respectivamente. El modelo es relevante porque demuestra que un modelo de menos de 1.000 millones de parametros, con un ajuste fino tipo DoRA+/LoRA y un contrato de salida controlado, puede sustituir a un LLM grande en la capa de enrutamiento de un agente, reduciendo coste y latencia.

El repositorio es de licencia mixta (marcado como `other` en Hugging Face) porque combina derivados Apache-2.0 (Qwen3, Qwen2.5, SmolLM2) con derivados de Llama 3.2 sujetos a la Llama 3.2 Community License. El tamano del repositorio es de 97,1 GB, ya que incluye checkpoints completos en safetensors, exportaciones GGUF y ONNX de cada release.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelos base: Qwen3-0.6B, Qwen2.5-0.5B-Instruct, SmolLM2-360M-Instruct, Llama-3.2-1B-Instruct) con ajuste fino DoRA+/LoRA |
| Parametros totales | 1.235.814.432 (dato real del safetensors del repositorio; varia segun la release concreta) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M, Q6_K, Q8_0; exportaciones ONNX Runtime |
| Idiomas soportados | no disponible |
| Licencia | other (mixta: Apache-2.0 para derivados Qwen3/Qwen2.5/SmolLM2; Llama 3.2 Community License para derivados Llama-3.2-1B) |
| Formato de pesos | safetensors (transformers), GGUF (llama.cpp), ONNX (onnxruntime) |

## Arquitectura y entrenamiento

Cada release es un ajuste fino de un modelo base decoder-only de tipo transformer. El autor emplea tecnicas de adaptacion de bajo rango: LoRA en la release v1.0 y DoRA+ en v2.0 y v2.1. En v2.1 se ejecuto una matriz completa de experimentos con 10.000 ejemplos y identificadores posicionales de herramienta (configuracion D); v2.0 uso una matriz de 1.000 ejemplos con particion 800/100/100. El ajuste se aplica sobre el modelo base y despues se fusiona en un checkpoint de pesos completos (merged full-weight) en safetensors.

La innovacion principal no es arquitectonica sino de contrato de salida: el modelo es generativo, pero se le instruye mediante prompt en texto plano para que devuelva solo una etiqueta de enrutamiento. En v2.x la salida es un ID posicional (por ejemplo `d`), que la aplicacion convierte al nombre de la herramienta usando la lista del prompt; en v1.0 la salida es directamente el nombre de la herramienta. El autor advierte explicitamente de que el prompt no debe envolverse en la plantilla de chat del modelo base, sino tokenizarse tal cual. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Clasificacion de intencion y enrutamiento a herramienta: devuelve una etiqueta compacta (nombre de herramienta en v1.0; ID posicional en v2.x).
- Deteccion de "sin herramienta": salida `none` en v1.0 y `-` en v2.x cuando ninguna herramienta coincide.
- Soporte de tool calling a nivel de enrutamiento: no ejecuta la herramienta, solo selecciona cual corresponde.
- Integracion en pipelines de agentes como capa de decision previa a la invocacion de herramientas.
- Capacidades multilingues: no disponibles (no se declaran idiomas en la model card).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Generacion de texto libre o conversacion: fuera del contrato de salida previsto.

## Casos de uso

- Enrutamiento de herramientas en asistentes de voz para automocion: el ejemplo de la model card (peticiones como "Call my wife" hacia `call_handler`) muestra el uso previsto; el modelo selecciona una de cinco herramientas (monitor de salud, seguros, navegacion, llamadas, cierre remoto) con latencia P50 de 253 ms en la variante Qwen2.5-0.5B.
- Capa de decision en agentes multi-herramienta: dado un catalogo de herramientas con nombre y descripcion, el modelo emite el ID de la herramienta adecuada, que el orquestador resuelve antes de invocarla.
- Reduccion de coste en produccion: al sustituir un LLM grande por un modelo de 0,36-1 B parametros solo para la fase de enrutamiento, se evita enviar cada peticion a un modelo mayor.
- Clasificacion de intencion en atencion al cliente: adaptando el catalogo de herramientas a acciones de negocio (consultar pedido, abrir incidencia, cancelar suscripcion), el modelo actua como clasificador de intencion con salida controlada.
- Despliegue en el borde o en local: las exportaciones GGUF (Q4_K_M, Q6_K, Q8_0) y ONNX permiten ejecutar el enrutador con llama.cpp u ONNX Runtime en entornos sin GPU dedicada.
- Filtro previo ("no-tool") en asistentes: el modelo distingue peticiones que no requieren herramienta (salida `-` o `none`), evitando invocaciones innecesarias.
- Enrutamiento determinista en pipelines de CI/CD: la salida de un solo token facilita la validacion automatica y el testeo de regresiones del enrutador.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (exactitud en test):

| Release | Modelo base | Metodo | Exactitud test | Latencia P50 |
|---|---|---|---|---|
| v2.1 | Qwen2.5-0.5B | DoRA+ | 99,9 % | 253 ms |
| v2.1 | Qwen3-0.6B | DoRA+ | 99,8 % | no disponible |
| v2.1 | SmolLM2-360M | DoRA+ | 99,7 % | no disponible |
| v2.0 | Qwen3-0.6B | DoRA+ | 100 % (validacion 99 %) | no disponible |
| v2.0 | Llama-3.2-1B | DoRA+ | 100 % (validacion 96 %) | no disponible |
| v1.0 | Qwen3-0.6B | LoRA | 99 % | no disponible |
| v1.0 | Llama-3.2-1B | LoRA | 100 % | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible; las cifras anteriores corresponden a la tarea interna de enrutamiento del autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano de los modelos base (0,36-1 B parametros), la inferencia en FP16 requiere del orden de 1-2 GB y en cuantizacion Q4_K_M alrededor de 0,3-0,7 GB, segun la release.
- GPU recomendadas: no disponibles; cualquier GPU consumer reciente (por ejemplo, RTX 3060 o superior) deberia poder ejecutar las variantes pequenas.
- Cabe en GPU consumer: si, previsiblemente en todas las releases por el tamano de los modelos base.
- Opciones de despliegue: transformers, llama.cpp (GGUF Q4_K_M, Q6_K, Q8_0), ONNX Runtime (exportaciones ONNX) y endpoints compatibles con Hugging Face.
- Latencia y throughput: latencia P50 de 253 ms reportada para v2.1 Qwen2.5-0.5B; no se publican datos de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| Intent Classifier v2.1 (Qwen2.5-0.5B) | ~0,5 B | no disponible | Enrutamiento a herramienta (ID posicional) | Apache-2.0 (derivado) |
| Intent Classifier v2.1 (SmolLM2-360M) | ~0,36 B | no disponible | Enrutamiento a herramienta (ID posicional) | Apache-2.0 (derivado) |
| Intent Classifier v2.1 (Qwen3-0.6B) | ~0,6 B | no disponible | Enrutamiento a herramienta (ID posicional) | Apache-2.0 (derivado) |
| Intent Classifier v1.0 (Llama-3.2-1B) | ~1 B | no disponible | Enrutamiento a herramienta (nombre directo) | Llama 3.2 Community License |

No se dispone de comparaciones con otros clasificadores de intencion publicos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; no se documenta analisis de sesgo.
- Riesgo de alucinacion: el contrato de salida restringe la respuesta a una etiqueta, pero el modelo es generativo y podria emitir un ID o nombre fuera del catalogo si el prompt no se construye exactamente como se especifica.
- Dependencia estricta del formato de prompt: el autor advierte de que no debe usarse la plantilla de chat del modelo base; el prompt debe tokenizarse en texto plano tal cual, lo que exige control preciso de la integracion.
- Limitaciones de contexto e idioma: no se documentan la longitud de contexto ni los idiomas soportados.
- Restricciones de licencia: repositorio de licencia mixta; los derivados de Llama-3.2-1B estan sujetos a la Llama 3.2 Community License y requieren incluir el acuerdo y un archivo `Notice` con la atribucion de Meta. Los derivados de Qwen y SmolLM2 exigen cumplir Apache-2.0 con sus requisitos de licencia y aviso.
- Caveat para produccion: las exactitudes reportadas (99,7-100 %) proceden de la evaluacion interna del autor sobre su propio conjunto de datos y catalogo de herramientas; no hay garantia de que se transfieran a otros catalogos, dominios o distribuciones de peticiones.
- Trazabilidad: cada release incluye `benchmark_provenance.json` con la revision del modelo base, configuracion del adaptador y procedencia de artefactos, lo que conviene revisar antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kon172verma/intent-classifier
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo base SmolLM2-360M-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Modelo base Llama-3.2-1B-Instruct: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
