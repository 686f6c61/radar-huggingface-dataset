# dddddsds31341/Long-WAM-Sorting-Dolls-20k-Step-10000

## Resumen

Long-WAM Sorting Dolls 20k Step 10000 es un checkpoint de inferencia derivado del modelo base Efficient-Large-Model/Long-WAM-YAM, publicado por el usuario dddddsds31341 en Hugging Face. Se trata de un modelo de robótica (pipeline `robotics`) afinado para una tarea concreta de manipulación: colocar cinco munecas rusas en fila, de menor a mayor, de izquierda a derecha. El repositorio contiene exclusivamente pesos de evaluacion correspondientes al paso de optimizador 10.000, no un estado completo de reanudacion de entrenamiento.

El modelo parte de la familia Long-WAM (World-Action Model), orientada a la prediccion de acciones en entornos roboticos con historial de observaciones y chunks de accion. La model card documenta el proceso de ajuste fino sobre el dataset `dddddsds31341/sorting-dolls-lerobot` (100 demostraciones, 168.126 frames) usando cuatro GPU A100, BF16 y ZeRO-1. El checkpoint se distribuye en formato PyTorch (`model.pt`), con un tamano de repositorio de 12,0 GB, e incluye codigo de evaluacion empaquetado.

La relevancia de esta publicacion es acotada: no se reclama ninguna tasa de exito ni rendimiento en validacion, y el autor indica explicitamente que el checkpoint carece de estado de reanudacion. Su interes es principalmente reproducible: sirve como referencia de un ajuste fino concreto sobre Long-WAM-YAM para investigadores que quieran inspeccionar o replicar la configuracion de entrenamiento y evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Long-WAM-YAM; familia World-Action Model) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (historial P48 y chunk de accion de 32 pasos como configuracion de tarea) |
| Tipos de cuantizacion | no disponible (pesos en `model.pt` con `torch_dtype` declarado) |
| Idiomas soportados | no disponible (modelo orientado a instrucciones de tarea en ingles) |
| Licencia | other (sujeta a la licencia del modelo base Efficient-Large-Model/Long-WAM-YAM) |
| Formato de pesos | PyTorch (`model.pt`); requiere assets separados de Wan2.2 VAE, UMT5 y tokenizer |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo base Long-WAM-YAM. Por el nombre y la categoria (World-Action Model) y por los componentes requeridos en inferencia (VAE Wan2.2, codificador de texto UMT5 y tokenizer), se trata de un modelo de accion condicionado por instruccion textual y observaciones visuales, con representacion latente de video. El checkpoint incluye los modulos `mot` y `proprio_encoder`, ademas del paso de entrenamiento y el dtype de PyTorch.

El ajuste fino se realizo desde Efficient-Large-Model/Long-WAM-YAM sobre el dataset `dddddsds31341/sorting-dolls-lerobot` en la revision Git `ffca92aece12b85daac426b1b0474065e1ecf165`, compuesto por 100 demostraciones y 168.126 frames. La configuracion de entrenamiento fue: cuatro GPU A100, batch 12 por GPU con acumulacion 1 (batch global 48), LR constante 1e-5, AdamW con weight decay 0,01, semilla 42, BF16 y ZeRO-1. Las acciones se representan como objetivos absolutos de 14 dimensiones (6 articulaciones + gripper por brazo, en unidades originales del gripper), con normalizacion z-score especifica de la tarea y sin recorte de valores normalizados. Las camaras empleadas son `top_head`, `hand_left` y `hand_right`, con layout procesado de 384 x 320, historial P48 y chunk de accion de 32 pasos.

## Capacidades

- Generacion de acciones roboticas de 14 dimensiones (articulaciones y gripper de ambos brazos) condicionadas por instruccion textual y observaciones de tres camaras.
- Manipulacion bimanual orientada a una tarea especifica de ordenacion de objetos (cinco munecas rusas en fila de menor a mayor).
- Procesamiento de historial visual de 48 pasos (P48) y prediccion de chunks de accion de 32 pasos.
- Codificacion de instrucciones en lenguaje natural mediante el codificador de texto UMT5 del modelo base.
- Inferencia con precision BF16 sobre pesos PyTorch.
- No se documentan capacidades de tool calling, agentes multi-paso, vision general, audio ni thinking mode.

## Casos de uso

- Evaluacion reproducible de un ajuste fino concreto: el checkpoint permite cargar `model.pt` con `longwam.inference.load_run_config` y `load_model` usando `expected_step=10000`, lo que facilita comparar resultados frente a otras ejecuciones del mismo autor.
- Investigacion en manipulacion bimanual: sirve como referencia de una politica entrenada con 14 dimensiones de accion y tres vistas de camara para estudiar el efecto de la configuracion P48 y del chunk de 32 pasos.
- Estudio de normalizacion de acciones: el uso de z-score especifico de tarea sin recorte permite analizar el impacto de esta decision en el comportamiento de la politica.
- Reproduccion de pipelines de entrenamiento: la configuracion documentada (A100 x4, batch 48, LR 1e-5, AdamW, BF16, ZeRO-1) permite replicar el setup en laboratorios con hardware equivalente.
- Benchmark interno de modelos World-Action: util para contrastar variantes del mismo autor (por ejemplo, las ejecuciones de nesting-doll) sobre tareas de ordenacion de objetos.
- Docencia y divulgacion: ejemplo realista de ajuste fino de un modelo de robotica con dataset LeRobot, util para explicar el flujo completo desde dataset hasta checkpoint de evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se reclama ninguna tasa de exito del robot ni rendimiento en validacion ("No robot success rate or held-out performance is claimed").

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio pesa 12,0 GB, por lo que se requiere al menos esa cantidad de memoria para cargar los pesos, mas la memoria de los assets adicionales (Wan2.2 VAE, UMT5 y tokenizer).
- GPU recomendadas: el entrenamiento se realizo en cuatro A100; para inferencia no se especifica un minimo, pero el tamano del checkpoint sugiere GPU de datacenter o consumer de gama alta con suficiente VRAM.
- Compatibilidad con GPU consumer: no confirmada; probablemente requiere GPUs con 16 GB o mas de VRAM, aunque no se documenta.
- Opciones de despliegue: el autor proporciona codigo propio (`longwam.inference`) y un archivo `requirements-sip.txt` con las versiones de paquetes SIP; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Long-WAM Sorting Dolls 20k Step 10000 (este) | no disponible | no disponible | other | Hugging Face, 18 descargas |
| Long-WAM Nesting Doll Unclipped 30k Step 10000 | no disponible | no disponible | other (presumible) | Hugging Face |
| Long-WAM Nesting Doll Epoch 1 | no disponible | no disponible | other (presumible) | Hugging Face |

Los dos modelos comparables son ejecuciones del mismo autor sobre el modelo base Long-WAM-YAM, con tareas distintas (nesting en lugar de sorting). No se dispone de datos de rendimiento para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El checkpoint no contiene estado completo de reanudacion de entrenamiento (sin estado de optimizador, scheduler ni RNG).
- No se reclama ninguna tasa de exito ni rendimiento en validacion; el modelo no debe presentarse como validado para produccion.
- La tarea esta acotada a la instruccion "Arrange the five Russian dolls upright in a row from smallest to largest, from left to right"; no se documenta generalizacion a otras tareas.
- La licencia es "other" y esta sujeta a los terminos del modelo base Efficient-Large-Model/Long-WAM-YAM; es necesario revisar dicha licencia antes de cualquier uso comercial.
- Requiere assets externos (Wan2.2 VAE, UMT5, tokenizer) que no se incluyen en el repositorio.
- El codigo de evaluacion asume rutas SIP especificas que deben adaptarse a la maquina de evaluacion.
- No se documentan sesgos, riesgos de alucinacion ni comportamiento multilingue; el modelo opera sobre instrucciones en ingles.
- El repositorio tiene un numero muy bajo de descargas (18) y ningun "like", lo que sugiere ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dddddsds31341/Long-WAM-Sorting-Dolls-20k-Step-10000
- Modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
- Ejecucion relacionada (nesting doll, 30k): https://huggingface.co/dddddsds31341/Long-WAM-Nesting-Doll-Unclipped-30k-Step-10000
- Ejecucion relacionada (nesting doll, epoch 1): https://huggingface.co/dddddsds31341/Long-WAM-Nesting-Doll-Epoch-1
- Dataset: https://huggingface.co/datasets/dddddsds31341/sorting-dolls-lerobot
