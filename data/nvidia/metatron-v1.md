# nvidia/Metatron-v1

## Resumen

Metatron v1 es una politica de control para robots humanoides desarrollada por NVIDIA, centrada en el robot Unitree G1 (29 articulaciones controladas). No se trata de un modelo de lenguaje, sino de una politica de aprendizaje por refuerzo tipo estudiante MaskedMimic que unifica en una sola red la locomocion, la interaccion con escenas y la recuperacion tras caidas, sin necesidad de adaptadores de recovery independientes.

El modelo se distribuye en dos formatos: un checkpoint nativo de PyTorch de unos 459 MB (con posterior y estadisticas de normalizacion, destinado a simuladores y despliegue en hardware real supervisado) y exportaciones ONNX de unos 403 MB para inferencia determinista en navegador mediante ONNX Runtime Web con WebGPU o WebAssembly, integradas con MuJoCo WASM.

Su relevancia radica en que permite ejecutar control humanoide interactivo directamente en el navegador, sin infraestructura de servidor, y que se integra con el framework ProtoMotions de NVIDIA (NVlabs), lo que lo convierte en una referencia util para investigadores de robotica, simulacion fisica y despliegue sim-to-real en humanoids.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer student estilo MaskedMimic con prior y decoder deterministas |
| Parametros totales | no disponible (checkpoint nativo: 459.455.983 bytes) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (entrada: estado actual + 8 muestras historicas + historial de 9 acciones crudas + objetivos enmascarados + contexto de escena; 39 entradas en total) |
| Tipos de cuantizacion | FP32 (inferencia determinista) |
| Idiomas soportados | en (documentacion; el modelo no procesa lenguaje natural) |
| Licencia | NVIDIA Open Model License (codigo fuente: Apache-2.0) |
| Formato de pesos | Checkpoint nativo PyTorch y ONNX (safetensors: no) |

## Arquitectura y entrenamiento

Metatron v1 emplea una arquitectura de estudiante tipo MaskedMimic basada en transformer, con un prior y un decoder deterministas aprendidos. La version exportada corresponde al estudiante unificado "SAMP-capable" del epoch 6410, en el que caminar, interactuar con la escena y recuperarse de perturbaciones comparten una unica politica. Las entradas incluyen el estado actual del G1, ocho muestras historicas de estado, acciones crudas entrantes emparejadas, un historial de nueve acciones crudas, objetivos enmascarados de pose/estilo/velocidad futuros y contexto de la escena mediante cajas (scene boxes). Las salidas son objetivos de PD articular (`action`), ganancias PD (`stiffness`, `damping`) y `raw_action` para retroalimentacion historica.

No se ha publicado informacion sobre el numero de tokens o muestras de entrenamiento, la composicion del dataset ni el uso de tecnicas especificas de RL mas alla de la metodologia MaskedMimic/SAMP implicita. El repositorio no redistribuye los clips de movimiento de entrenamiento, cuyos derechos son independientes. La receta nativa enmascara las entradas de escena, por lo que debe consultarse su model card antes de reexportar.

## Capacidades

- Locomocion humanoide para el Unitree G1 con 29 articulaciones controladas mediante objetivos PD.
- Interaccion con escenas mediante contexto de cajas (scene boxes) y objetivos locales escalonados.
- Recuperacion tras caidas y perturbaciones integrada en la misma politica, con estado de recovery independiente por robot y objetivos de recovery como entradas de runtime.
- Inferencia batched: la exportacion Racer evalua seis robots en un unico lote.
- Inferencia determinista en navegador via ONNX Runtime Web (WebGPU recomendado, fallback CPU/WASM).
- Integracion con ProtoMotions para flujos de trabajo en otros simuladores y despliegue supervisado en hardware real.
- No soporta procesamiento de lenguaje natural, vision ni tool calling: no es un modelo de lenguaje.

## Casos de uso

- Demostraciones interactivas de control humanoide en navegador: el export `demo/model.onnx` con MuJoCo WASM permite evaluar locomocion y recovery del G1 sin servidor ni instalacion local, ideal para material divulgativo y educativo.
- Investigacion en politicas unificadas de locomocion/recovery: el checkpoint nativo de PyTorch permite estudiar la receta de reconstruccion y reproducir experimentos en simuladores compatibles con ProtoMotions.
- Competencias y benchmarks multi-robot: la export `racer/network.onnx` ejecuta seis robots G1 en lote para escenarios tipo carrera (G1 Racer).
- Validacion sim-to-real supervisada: el paquete nativo G1 soporta flujos de despliegue en el robot real bajo supervision, previa validacion de las interfaces de observacion y control.
- Comparacion de backends de inferencia WebGPU frente a WASM: el modelo sirve como carga de trabajo realista para medir rendimiento de ONNX Runtime Web en distintos navegadores y GPUs.
- Ensenamez de pipelines de exportacion ONNX reproducibles: los digests SHA256, el indice maquina-legible en `config.json` y las verificaciones de paridad (error maximo 5,55e-6) constituyen un ejemplo de ingenieria de exportacion auditable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (exito en tareas, velocidad, distancias) en la informacion disponible. Los unicos datos numericos publicados son verificaciones de exportacion: comparacion del ONNX de seis robots y las rutas de observacion compiladas contra la export de robot unico en 60 estados de prueba distintos y perturbados en historial, con un error maximo absoluto de accion de 5,55e-6. Los autores subrayan que estas son comprobaciones numericas de exportacion, no benchmarks de exito en tareas ni validacion en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; los export ONNX pesan unos 403 MB cada uno y se ejecutan en FP32, por lo que una GPU con 2-4 GB de VRAM dedicables deberia ser suficiente en navegador.
- GPU recomendadas: no disponible; para navegador se recomienda cualquier GPU compatible con WebGPU. Para entrenamiento o fine-tuning no se publica informacion.
- Consumer GPUs: al tratarse de inferencia en navegador con WebGPU, funciona en GPUs de consumo compatibles (por ejemplo, GPUs NVIDIA recientes o integradas con soporte WebGPU); la ruta CPU/WASM es un fallback que no garantiza operacion en tiempo real con seis robots.
- Despliegue: ONNX Runtime Web (WebGPU o WebAssembly) con MuJoCo WASM en navegador; checkpoint nativo PyTorch con ProtoMotions para simuladores y despliegue supervisado en G1 real. No aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible; los autores indican que drivers, navegador y hardware afectan al tiempo de arranque y al throughput.

## Comparativa con modelos similares

No se dispone de datos suficientes en la informacion proporcionada para una tabla comparativa cuantitativa. Alternativas de la misma categoria a considerar:

- MaskedMimic (NVIDIA): politica base sobre la que se construye Metatron; Metatron la unifica con recovery y escena en un solo estudiante y anade exportaciones ONNX para navegador.
- Otras politicas de locomocion humanoide para Unitree G1 en el ecosistema ProtoMotions/Isaac: no disponible informacion comparativa concreta en los datos proporcionados.

| Aspecto | Metatron v1 | MaskedMimic (referencia) |
|---|---|---|
| Robot objetivo | Unitree G1 (29 articulaciones) | Personajes simulados genericos |
| Politica unificada con recovery | Si | No (separada) |
| Export ONNX navegador | Si | No disponible |
| Licencia | NVIDIA Open Model License | No disponible |

## Limitaciones y advertencias

- Los dos export ONNX (`demo/model.onnx` y `racer/network.onnx`) no son intercambiables: difieren en interfaz, organizacion del grafo y batching, aunque compartan pesos.
- Los archivos ONNX por si solos no son demos completas: requieren la aplicacion emparejada que aporta fisica, observaciones, objetivos y logica de control, con convenciones exactas de orden articular, cuaterniones, historial, normalizacion y tasa de control.
- No alimentar entradas del demo al grafo Racer ni modificar su tamano de batch sin reconstruir y validar el grafo.
- La receta nativa enmascara las entradas de escena; consultar su model card antes de cualquier reexportacion.
- La compatibilidad de interfaces no constituye una certificacion de seguridad ni una validacion en hardware real de estos archivos concretos.
- La ruta CPU/WASM no garantiza operacion en tiempo real con seis robots.
- Ninguno de los artefactos es un checkpoint de entrenamiento reanudable.
- El repositorio no redistribuye los clips de movimiento de entrenamiento; sus derechos son independientes.
- Licencia: NVIDIA Open Model License para los artefactos del modelo (revisar el acuerdo completo para uso comercial); codigo fuente bajo Apache-2.0.
- Sesgos, riesgo de alucinacion y limitaciones de idioma: no aplicables al tratarse de una politica de control; no disponible informacion sobre fallos fisicos conocidos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/nvidia/Metatron-v1
- Licencia (NVIDIA Open Model License): https://huggingface.co/nvidia/Metatron-v1/blob/main/LICENSE.pdf
- ProtoMotions (GitHub, NVlabs): https://github.com/NVlabs/ProtoMotions
- Model card del paquete nativo G1: https://huggingface.co/nvidia/Metatron-v1/blob/main/G1/MODEL_CARD.md
- Instrucciones de descarga y ejecucion del paquete G1: https://huggingface.co/nvidia/Metatron-v1/blob/main/G1/README.md
