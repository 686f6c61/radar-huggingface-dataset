# changh95/RLDX-1-PT-p150

## Resumen

RLDX-1-PT-p150 es un paquete de despliegue del modelo RLDX-1 PT de RLWRLD, una política vision-language-action (VLA) de 6.900 millones de parametros preentrenada sobre una mezcla de conjuntos de datos publicos de manipulacion robotica. El paquete, publicado por el usuario changh95, no modifica los pesos originales (commit `1592013a`) y los sirve sobre hardware Tenstorrent p150 mediante el servidor HTTP propio del modelo. El modelo base combina un backbone vision-language Qwen3-VL-8B truncado a 18 capas de lenguaje con un Multi-Stream Action Transformer (MSAT) basado en flow matching.

La relevancia de esta publicacion es fundamentalmente de infraestructura: demuestra la ejecucion de una politica robotica VLA sobre aceleradores Tenstorrent en lugar de GPU NVIDIA, con el preprocesado y postprocesado de RLWRLD ejecutandose en CPU del host y la torre de vision, el modelo de lenguaje y la cabeza de accion en el dispositivo. El modelo consume cuatro fotogramas de tres camaras (vistas exterior primaria, exterior secundaria y muneca), el estado del efector final y una instruccion en lenguaje natural, y produce un chunk de 16 pasos de comandos de velocidad del efector final y objetivos de pinza.

Se distribuye bajo la licencia RLWRLD Model License v1.0, que restringe el uso a fines no comerciales, y esta pensado para investigacion y evaluacion offline sobre la encarnacion DROID (brazo Franka Panda). El repositorio ocupa 7,4 GB y el despliegue completo requiere aproximadamente 19 GB de disco adicionales entre pesos, tensores preparados para dispositivo y kernels compilados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action: backbone Qwen3-VL-8B truncado a 18 capas de lenguaje + Multi-Stream Action Transformer (MSAT: 4 bloques multi-stream y 8 single-stream) con flow matching |
| Parametros totales | 6,9 mil millones (aproximadamente 6.900 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; la instruccion admite hasta 60 tokens tras el formateo de lenguaje de RLDX; 64 cognition tokens aprendidos; 4 fotogramas por camara en 3 camaras |
| Tipos de cuantizacion | no disponible (pesos servidos en el formato del paquete para p150) |
| Idiomas soportados | no disponible |
| Licencia | RLWRLD Model License v1.0 (uso no comercial) |
| Formato de pesos | pesos originales de `RLWRLD/RLDX-1-PT` (13,8 GB) mas tensores preparados para dispositivo (4,7 GB) y kernels compilados (0,45 GB); formato de fichero no especificado |

## Arquitectura y entrenamiento

El modelo base es una politica VLA compuesta. Un backbone Qwen3-VL-8B, truncado a 18 capas de lenguaje, codifica los fotogramas de camara, la instruccion de tarea y 64 cognition tokens aprendidos; tras su cuarta capa, los tokens de los fotogramas mas antiguos se agrupan en uno solo, reduciendo el coste de atencion sobre la secuencia visual temporal. Sobre esas representaciones, un Multi-Stream Action Transformer (MSAT) con 4 bloques multi-stream y 8 bloques single-stream transforma las caracteristicas de cognicion y el estado del robot en un chunk de acciones futuras mediante flow matching, resuelto en 4 pasos de Euler.

El preentrenamiento se realizo sobre una mezcla de conjuntos de datos publicos de manipulacion robotica, segun indica la model card del paquete; los detalles de composicion del dataset, numero de tokens y si hubo RLHF o DPO no estan disponibles en la informacion proporcionada y remiten al informe tecnico RLDX-1 (arXiv:2605.03269) y a la model card original. La innovacion destacable de este paquete no es el entrenamiento sino el despliegue: el servidor incluye el preprocesado y postprocesado propios de RLWRLD (redimensionado y recorte de imagen a 160x256, troceado en parches, formato de prompt y tokenizer, normalizacion de estado y accion con las estadisticas DROID del checkpoint), que se ejecutan en la CPU del host, mientras que la torre de vision, el modelo de lenguaje y la cabeza de accion se ejecutan en el dispositivo Tenstorrent p150.

## Capacidades

- Generacion de chunks de accion robotica: a partir de una observacion produce 16 pasos de comandos de velocidad del efector final (3 valores de posicion y 3 de rotacion en [-1, 1]) y objetivos de pinza en [0, 1].
- Percepcion visual multi-camara: procesa cuatro fotogramas RGB por camara (pasos t-6, t-4, t-2 y t) de tres camaras (`primary`, `secondary`, `wrist`) a 320x180, redimensionados internamente a 160x256.
- Comprension de instrucciones en lenguaje natural: acepta la instruccion como cadena o en el formato de anotacion de RLDX, con hasta 60 tokens tras el formateo.
- Integracion de estado proprioceptivo: consume posicion y rotacion del efector final y posicion de la pinza en unidades crudas de DROID.
- Encarnacion unica servida: `droid` (brazo Franka Panda); otras encarnaciones no estan disponibles en este paquete.
- Control de aleatoriedad: acepta una semilla entera para el ruido inicial del flow matching.
- API HTTP propia: `POST /predict`, `GET /health`, `GET /info`, `GET /demo` y `GET /v1/models` (stub, no es una API de chat compatible con OpenAI).
- Protocolo cliente ZeroMQ de RLDX, ademas de HTTP.
- No soporta tool calling, function calling, agentes multi-paso ni modo thinking; no es un modelo de chat.

## Casos de uso

- Inspeccion de la politica preentrenada: enviar observaciones de ejemplo a `/predict` y comparar las acciones devueltas con las que calcula el codigo original de RLDX-1 en fp32 para el mismo ruido, usando `GET /demo` como referencia de validacion.
- Evaluacion offline sobre datos DROID grabados: reproducir episodios registrados del brazo Franka Panda, alimentando el servidor con los fotogramas, el estado y la instruccion de cada paso y midiendo el error de las acciones generadas frente a las ejecutadas.
- Comparacion de implementaciones: verificar la equivalencia numerica entre el despliegue en Tenstorrent p150 y la implementacion de referencia en GPU, aislando diferencias de preprocesado o de kernels.
- Validacion de portabilidad de hardware: evaluar el rendimiento y la fidelidad de una politica VLA sobre aceleradores Tenstorrent en lugar de NVIDIA, midiendo latencia por peticion y estabilidad del servidor.
- Pruebas de integracion de pipelines roboticos: ejercitar el contrato HTTP o el cliente ZeroMQ con observaciones sinteticas o reales antes de conectar la politica a un bucle de control simulado.
- Docencia e investigacion en VLA: estudiar el efecto del agrupamiento de tokens visuales tras la cuarta capa y del numero de pasos de Euler en la calidad de los chunks de accion, con un servidor reproducible y semilla fija.
- Benchmarking de infraestructura de inferencia: medir el coste de compilacion de kernels en el primer arranque y el throughput de peticiones secuenciales sobre p150.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware obligatorio: Tenstorrent p150 (malla `P150`); no se contempla ejecucion en GPU en este paquete.
- Disco: imagen Docker de 4,4 GB mas aproximadamente 19 GB de caches (pesos de 13,8 GB, tensores preparados para dispositivo de 4,7 GB y kernels compilados de 0,45 GB).
- VRAM: no aplica; la memoria del dispositivo no se especifica en la informacion disponible.
- GPU recomendadas: no disponible; el paquete no soporta GPU.
- Inferencia en GPU de consumo: no soportada por este paquete.
- Despliegue: `tt serve changh95/RLDX-1-PT-p150` mediante la CLI de Tenstorrent (`uv tool install tenstorrent`) o `tt-model serve changh95/RLDX-1-PT-p150`; requiere Docker. El servidor escucha en el puerto 20000 o el siguiente libre.
- Servidores alternativos (vLLM, llama.cpp, Ollama, TGI): no aplicables; el modelo expone su propia API HTTP y no es un modelo de chat.
- Latencia y throughput: no disponibles; el primer arranque compila kernels y tarda varios minutos. El servidor procesa una peticion a la vez.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RLDX-1-PT-p150 (este paquete) | 6,9 mil millones | no disponible (instruccion de hasta 60 tokens; 4 fotogramas x 3 camaras) | Tenstorrent p150 | RLWRLD Model License v1.0 (no comercial) | Hugging Face, despliegue via tt-cli |
| RLWRLD/RLDX-1-PT (modelo base) | 6,9 mil millones | no disponible | no disponible en la informacion proporcionada | RLWRLD Model License v1.0 (no comercial) | Hugging Face |
| Otros modelos VLA de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: RLWRLD Model License v1.0 limita el uso a fines no comerciales; cualquier despliegue comercial requiere autorizacion expresa del titular.
- Encarnacion unica: solo se sirve `droid` (Franka Panda); no es posible usar el paquete con otros robots sin trabajo adicional no cubierto por la documentacion.
- Ambito de uso acotado: la model card lo destina a investigacion y evaluacion offline, una peticion a la vez; no esta disenado para control en tiempo real de un robot fisico.
- No es una API de chat: `GET /v1/models` es un stub y el contrato de peticion y respuesta es propio del modelo; no admite tool calling ni razonamiento multi-paso.
- Dependencia de hardware: requiere Tenstorrent p150 y Docker; no hay ruta de ejecucion en GPU en este paquete.
- Dependencia de datos de normalizacion: el estado y las acciones se normalizan con las estadisticas DROID del checkpoint; observaciones fuera de esa distribucion pueden degradar las acciones generadas.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; al tratarse de una politica de accion, los errores se manifiestan como comandos de movimiento incorrectos, con riesgo fisico si se conecta a hardware real.
- Idiomas soportados: no disponibles; la instruccion se limita a 60 tokens tras el formateo de lenguaje.
- Primer arranque lento: la compilacion de kernels tarda varios minutos y debe completarse antes de que el servidor acepte peticiones.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en produccion.

## Enlaces

- Repositorio del paquete: https://huggingface.co/changh95/RLDX-1-PT-p150
- Modelo base: https://huggingface.co/RLWRLD/RLDX-1-PT
- Licencia: https://huggingface.co/RLWRLD/RLDX-1-PT/blob/1592013ab955b4919facd91fb37449f33a292a70/LICENSE.md
- Informe tecnico (arXiv): https://arxiv.org/abs/2605.03269
- Codigo original: https://github.com/RLWRLD/RLDX-1/tree/v1.0.2
- Gestor de paquetes de modelos: https://github.com/tenstorrent/tt-model-manager
- Prerrequisitos de la CLI de Tenstorrent: https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md
