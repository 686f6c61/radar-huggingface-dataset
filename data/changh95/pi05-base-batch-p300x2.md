# changh95/pi05-base-batch-p300x2

## Resumen

`changh95/pi05-base-batch-p300x2` no es un modelo entrenado desde cero, sino un paquete de despliegue optimizado sobre los pesos de `lerobot/pi05_base`, la politica vision-language-action (VLA) pi-0.5 de Physical Intelligence. El modelo combina un codificador visual SigLIP, un VLM Gemma-2B que actua como prefijo y un experto de accion Gemma-300M basado en flow matching que genera trozos de accion (action chunks) de 50 pasos x 32 dimensiones. El paquete lo publica el usuario changh95 y esta empaquetado con tt-model-manager 0.1.0 para ejecutarse sobre cuatro chips Tenstorrent Blackhole p300 (dos placas p300) mediante tt-metal/tt-nn.

La relevancia de esta ficha esta en el rendimiento de despliegue, no en el modelado: la version 2 reescribe el experto de accion con kernels fusionados (una unica atencion por capa con RoPE, QKᵀ sobre el prefijo de cache, softmax enmascarada y PV; la normalizacion adaRMS plegada en los pesos por paso; un programa GeGLU fusionado) y reduce las lanzadas por capa de 14 a 7. Ademas, el servidor agrupa peticiones concurrentes en lotes de tamano 1, 2 o 4, cada uno con su propia traza de Metal capturada al arrancar.

El resultado medido es de 57,5 ms por chunk de 50 acciones con lote 1, 40 ms por chunk con lote 2 y 36 ms por chunk con lote 4, frente a los 76,1 ms de la v1, con una correlacion de Pearson (PCC) de 0,9986/0,9984 respecto a la referencia fp32. El repositorio declara 0 descargas y 0 likes, y la model card aparece truncada en la seccion de caveats, por lo que buena parte de los datos de entrenamiento no esta disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica vision-language-action (VLA): SigLIP (vision) + Gemma-2B VLM (prefijo) + experto de accion Gemma-300M con flow matching |
| Parametros totales | No publicado de forma agregada; los componentes descritos son Gemma-2B (VLM) y Gemma-300M (experto de accion) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 224 tokens (`token_len: 224`; los `tokens` pre-tokenizados de PaliGemma admiten como maximo 224) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el campo `language` no aparece en la ficha del repositorio) |
| Licencia | Gemma (Gemma Terms of Use, https://ai.google.dev/gemma/terms) |
| Formato de pesos | No disponible; los pesos no van dentro de la imagen Docker y se descargan desde `lerobot/pi05_base` (commit `b211f3d44c36b6acfcf7ae94a64e8e96f75a64ba`) a la cache de HuggingFace |

## Arquitectura y entrenamiento

La arquitectura es la de pi-0.5: un transformer multimodal compuesto por un torre SigLIP para las imagenes (camara base y camara de muneca, 224x224), un VLM Gemma-2B que procesa el prefijo multimodal y un experto de accion Gemma-300M que genera la secuencia de acciones mediante flow matching con 10 pasos de denoising. El espacio de acciones son 50 x 32 valores en el espacio normalizado QUANTILES de lerobot, con relleno de ceros hasta 32 dimensiones, que se desnormalizan con `(a+1)*(q99-q01)/2+q01` a partir de los cuantiles del dataset propio. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; esos datos pertenecen al modelo base `lerobot/pi05_base` y al paper arXiv:2504.16054, no a este paquete.

La innovacion tecnica de este repositorio es exclusivamente de inferencia. El prefijo (SigLIP + prefill de Gemma-2B) se reparte en tensor-parallel sobre los cuatro chips, mientras que el experto de accion se replica. En la v2, la atencion del experto por capa se sustituye por un unico programa `generic_op` sobre `batch x 16` cores que integra RoPE, QKᵀ sobre el prefijo de cache mas el sufijo local, softmax enmascarada, PV y concatenacion de cabezas (40 µs frente a 129 µs de la v1); el adaRMS se pliega en los pesos up|gate por paso y se anade un programa rsqrt de filas mas un programa GeGLU fusionado (57 -> 42 µs). El resultado es un grafo unico trazado con Metal, con repeticiones bit-exactas y la misma salida en los cuatro chips.

## Capacidades

- Generacion de acciones de robot (robot control) a partir de observaciones visuales y una instruccion en lenguaje natural: devuelve 50 x 32 acciones normalizadas por peticion.
- Razonamiento visuomotor multimodal: procesa de 1 a 2 imagenes (base/exterior y muneca) junto con el prompt de tarea.
- Soporte de estado proprioceptivo opcional: campo `state` de hasta 32 flotantes normalizados a [-1, 1].
- Servidor HTTP de inferencia con `POST /predict`, `GET /health` y `GET /info` (forma del mesh, parametros resueltos, tamanos de lote y estadisticas de batching).
- Batching dinamico en servidor: las peticiones que llegan dentro de la ventana `PI05_BATCH_WINDOW_MS` (4 ms) se agrupan en el menor lote configurado que encaje (`PI05_BATCH_SIZES=1,2,4`), con una traza de Metal por tamano.
- Entrada por prompt de texto o por tokens ya tokenizados de PaliGemma (maximo 224).
- Semilla opcional (`seed`) para reproducibilidad.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes multi-paso, vision generalista fuera del pipeline robotico, audio ni modo de razonamiento explicito.

## Casos de uso

- Control de manipulacion en tiempo real: a 57,5 ms por chunk de 50 acciones con lote 1, el bucle de control puede refrescar la politica a unos 17 Hz, suficiente para tareas de pick-and-place sobre mesa con una sola camara base y una de muneca.
- Flotas de robots compartiendo una sola placa: con lote 4 el coste baja a 36 ms por chunk y el servidor sostiene 26,8 req/s, de modo que hasta cuatro robots pueden compartir los cuatro chips Blackhole de una p300x2 con latencias por robot todavia por debajo de los 40 ms.
- Manipulacion bimanual guiada por lenguaje: el contrato de dos imagenes (exterior y muneca) mas un prompt de tarea permite emitir instrucciones tipo "recoge el cubo" o "coloca la pieza en la bandeja" y obtener acciones de 32 dimensiones, aptas para brazos con pinza y estado articular de 32 valores o menos.
- Investigacion en politicas VLA: el paquete permite reproducir inferencia pi-0.5 sobre hardware Tenstorrent y comparar variantes (v1 sin batching, version de un solo chip) manteniendo la misma interfaz HTTP y la misma PCC, lo que aísla el efecto de las optimizaciones de kernel.
- Validacion de despliegue en hardware no NVIDIA: sirve para evaluar si una linea de robots puede operar sin GPUs y sin depender de CUDA, usando la imagen Docker y el compilador tt-metal como unica dependencia de ejecucion.
- Banco de pruebas de latencia y throughput en produccion: los endpoints `GET /info` y el campo `batched_as` de la respuesta permiten instrumentar cuantos chunks se agrupan realmente y a que latencia, util para dimensionar cuantas placas se necesitan por celda de trabajo.
- Robotica educativa y de laboratorio: al ejecutarse tambien con `TT_MESH_SHAPE=1x1` sobre un solo chip p300 a 101,5 ms por chunk, es una configuracion de bajo coste para prototipos academicos donde no se requiere el throughput completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de tarea (exito en manipulacion, MMLU, HumanEval, GSM8K) en la informacion disponible. Las unicas metricas publicadas son de fidelidad numerica, latencia y throughput de despliegue:

| Metrica | Valor |
|---|---|
| PCC frente a la referencia torch (forma servida, 2x224x224, 224 tokens, 10 pasos) | 0,9986 / 0,9984 en las dos observaciones de la v1 (v1: 0,9988 / 0,9986); sin cambios por peticion al batchear |
| Inferencia en proceso, lote 1 (`bench`, en caliente, trazada) | 57,5 ms por chunk de 50 pasos (v1: 76,1 ms) |
| Inferencia en proceso, lote 2 / lote 4 | 80 ms por lote = 40 ms por chunk / 144 ms por lote = 36 ms por chunk |
| Servido por HTTP (en caliente, 1 cliente, mediana de 8) | 64,5 ms extremo a extremo (inferencia en servidor 61,8 ms; v1: 78,9 ms) |
| Servido por HTTP, 2 / 4 / 8 clientes concurrentes | 22,7 req/s a 88 ms por peticion (lote 2) / 26,8 req/s a 149 ms (lote 4) / 27,4 req/s a 290 ms (cola tras un lote de 4) |
| Mismo codigo en un solo chip p300 (`TT_MESH_SHAPE=1x1`) | 101,5 ms (v1: 122,7 ms) |
| Determinismo | Repeticiones trazadas bit-exactas; los cuatro chips devuelven la misma salida |
| Desglose de tiempos en la respuesta | `preprocess` 1,1 ms, `inference` 58,0 ms, `total` 59,1 ms en el ejemplo de la model card |

## Requisitos de hardware

- Hardware obligatorio: dos placas Tenstorrent Blackhole p300 (4 chips en total, mesh `P300x2`). No se documenta ejecucion en GPU NVIDIA o AMD.
- Ejecucion reducida: el mismo codigo funciona con `TT_MESH_SHAPE=1x1` sobre un unico chip p300, a 101,5 ms por chunk.
- VRAM estimada: no aplica; la memoria relevante es la de los chips Blackhole, no una cantidad de VRAM medida en GB publicada por el autor.
- GPU recomendadas: no disponibles; este paquete no usa CUDA.
- Compatibilidad con GPU de consumo: no; el paquete requiere aceleradores Tenstorrent Blackhole.
- Despliegue: `tt-model pull changh95/pi05-base-batch-p300x2 --with-weights` seguido de `tt-model serve` (o `tt serve`), que levanta el servidor HTTP propio en el puerto 20000 o el siguiente libre; tambien `tt model stop` para detenerlo. Empaquetado con tt-model-manager 0.1.0 (manifest schema 5.1) y compilado con tt-metal/tt-nn.
- Arranque: la primera puesta en marcha compila los kernels para el dispositivo concreto y tarda varios minutos; el servidor esta listo cuando registra `Application startup complete`.
- Latencia y throughput: 57,5 ms por chunk (lote 1), 40 ms por chunk (lote 2), 36 ms por chunk (lote 4); 64,5 ms extremo a extremo por HTTP con un cliente; 26,8 req/s con 4 clientes concurrentes y 27,4 req/s con 8.
- Tamano del repositorio: 0,9 GB sin contar los pesos, que se descargan aparte desde `lerobot/pi05_base`.

## Comparativa con modelos similares

| Modelo | Hardware | Latencia por chunk de 50 acciones (lote 1) | Batching | PCC frente a fp32 | Licencia |
|---|---|---|---|---|---|
| `changh95/pi05-base-batch-p300x2` (esta ficha, v2) | 2x p300 (4 chips) | 57,5 ms en proceso / 64,5 ms por HTTP | Si, lotes 1/2/4 con trazas separadas | 0,9986 / 0,9984 | Gemma |
| `changh95/pi05-base-p300x2` (v1) | 2x p300 (4 chips) | 76,1 ms en proceso / 78,9 ms por HTTP | No, una peticion por forward | 0,9988 / 0,9986 | Gemma |
| `changh95/pi05-base-p150` (un solo chip) | 1 chip p300 | 101,5 ms con el mismo codigo de la v2 / 122,7 ms con el de la v1 | No disponible | No disponible en la informacion de esta ficha | Gemma |
| `lerobot/pi05_base` (modelo base) | No especificado (pesos originales, sin port a Tenstorrent) | No disponible | No disponible | Referencia de comparacion (fp32) | Gemma |

No se dispone de comparativas con otras politicas VLA de tamano similar (por ejemplo variantes de pi-0 o RT-2) dentro de la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo nuevo: es un port de inferencia sobre los pesos de `lerobot/pi05_base`. Cualquier limitacion del modelo base en cuanto a calidad de politica se hereda sin cambios.
- La model card original esta truncada: la seccion "Caveats" aparece vacia, por lo que el autor no detalla limitaciones conocidas.
- Espacio de acciones normalizado: las 50 x 32 salidas estan en el espacio QUANTILES normalizado y hay que desnormalizarlas con `(a+1)*(q99-q01)/2+q01` usando los cuantiles del dataset propio y recortar a la dimensionalidad real del robot. Usar las acciones sin desnormalizar produce comandos incorrectos.
- Contexto muy corto: 224 tokens como maximo, con el prompt de tarea y el estado serializados dentro de ese limite; se informa de truncado mediante el campo `prompt_truncated`.
- Imagenes limitadas: 1 o 2 imagenes de 224x224 (base/exterior y muneca). No hay soporte documentado para mas camaras ni para resoluciones superiores; las imagenes adicionales se rellenan (`images_padded`).
- Dependencia de hardware: requiere placas Tenstorrent Blackhole p300; no se puede ejecutar en GPU NVIDIA ni en CPU con este paquete. La primera compilacion de kernels tarda varios minutos.
- Batching con ventana de 4 ms: con 8 clientes concurrentes las peticiones se encolan tras un lote de 4 y la latencia por peticion sube a 290 ms, aunque el throughput se mantiene en 27,4 req/s. Los tamanos de lote estan fijados en configuracion (`PI05_BATCH_SIZES=1,2,4`).
- Riesgo de alucinacion y sesgos: no hay informacion disponible sobre evaluaciones de sesgo, robustez ni tasas de fallo de la politica en tareas reales.
- Licencia Gemma: el uso comercial y la redistribucion estan sujetos a los Gemma Terms of Use de Google (https://ai.google.dev/gemma/terms), ademas de las condiciones que apliquen a los pesos base de `lerobot/pi05_base`. Conviene revisar ambas antes de desplegar en produccion.
- Idiomas: el repositorio no declara idiomas soportados; los prompts de ejemplo estan en ingles ("pick up the cube").
- Adopcion nula declarada: 0 descargas y 0 likes en el momento de redactar esta ficha, lo que reduce la evidencia externa de funcionamiento en entornos distintos del autor.

## Enlaces

- Repositorio del modelo: https://huggingface.co/changh95/pi05-base-batch-p300x2
- Modelo base (pesos): https://huggingface.co/lerobot/pi05_base
- Paper de pi-0.5: https://arxiv.org/abs/2504.16054
- Codigo upstream (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Version 1, sin batching: https://huggingface.co/changh95/pi05-base-p300x2
- Version de un solo chip: https://huggingface.co/changh95/pi05-base-p150
- Herramienta de empaquetado: https://github.com/tenstorrent/tt-model-manager
- Licencia Gemma: https://ai.google.dev/gemma/terms
