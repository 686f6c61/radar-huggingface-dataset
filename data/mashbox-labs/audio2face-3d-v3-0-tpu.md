# mashbox-labs/Audio2Face-3D-v3.0-TPU

## Resumen
Audio2Face-3D-v3.0-TPU es una conversion de los pesos del modelo Audio2Face-3D v3.0 de NVIDIA al formato BSHJ, el formato de pesos que consume el motor de TPU del paquete `mashbox`. El modelo original transforma audio de voz a 16 kHz en movimiento facial 3D (piel, lengua, mandibula y ojos) para tres identidades concretas: Claire, James y Mark. Esta publicacion no contiene codigo de inferencia ni pipeline ejecutable: es exclusivamente un contenedor de pesos derivado del `network.onnx` y de los ficheros `.npz` de blendshapes del repositorio original de NVIDIA.

El valor practico de esta ficha es acotado: se trata de un artefacto de redistribucion para un runtime especifico (TPU con el motor `mashbox`), no de un modelo entrenado por el autor del repositorio. La model card indica explicitamente que la version 0.1.10 del paquete `mashbox` no incluye el comando `mashbox run` para este modelo, por lo que el uso previsto es la carga de los tensores mediante el lector BSHJ y su integracion manual en un pipeline propio.

La relevancia es de nicho: desarrolladores que ya trabajan con el ecosistema `mashbox` sobre TPU y necesitan los pesos de Audio2Face-3D sin pasar por ONNX. Para cualquier otro caso, el repositorio upstream de NVIDIA es la referencia canonica, ya que conserva los ficheros de configuracion JSON (`network_info.json`, `model_config_*.json`, `bs_*_config_*.json`) que aqui no se incluyen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal para animacion facial a partir de audio (arquitectura interna no detallada; pesos derivados de `network.onnx`) |
| Parametros totales | no disponible (271 tensores en `network.bshj`; el recuento de parametros no se publica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio a movimiento facial, no de texto) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en float32 (y int32 en `solver.bshj` para indices/datos auxiliares) |
| Idiomas soportados | no disponible (la entrada es audio de voz a 16 kHz; no se documenta cobertura linguistica) |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | BSHJ (`network.bshj`, `solver.bshj`), leible por el paquete `mashbox` |
| Tamano del repositorio | 0,8 GB |
| Ficheros de pesos | `network.bshj` (724,1 MB, 271 tensores float32) y `solver.bshj` (52,7 MB, 225 tensores float32 e int32) |
| Identidades soportadas | Claire, James, Mark |
| Entrada | Audio de voz a 16 kHz |
| Salida | Movimiento facial: piel, lengua, mandibula y ojos (blendshapes) |

## Arquitectura y entrenamiento
No se dispone de informacion sobre la arquitectura interna del modelo original en la documentacion proporcionada. Lo unico verificable es que los pesos proceden de `network.onnx` del repositorio `nvidia/Audio2Face-3D-v3.0` (revision `b74132732fd9a9d29b237bec193ded64c9745e91`) y que `network.bshj` conserva los nombres de los inicializadores ONNX como nombres de tensor. El fichero `solver.bshj` agrupa datos de blendshapes e identidad extraidos de `bs_skin_*.npz`, `bs_tongue_*.npz` y `model_data_*.npz`, con cada array nombrado segun el patron `npz/<fichero_upstream>/<array>`.

No hay informacion sobre volumen de datos de entrenamiento, composicion del dataset, tecnicas de alineacion (RLHF/DPO) ni innovaciones de decodificacion. La conversion a BSHJ es un cambio de contenedor, no un reentrenamiento: los tensores mantienen la precision float32 del origen. Cada fichero BSHJ incluye en su cabecera los ficheros upstream de procedencia junto con sus hashes SHA-256, lo que permite trazar la correspondencia con el repositorio de NVIDIA. Los ficheros de configuracion JSON necesarios para reconstruir el grafo no se redistribuyen aqui y deben tomarse del upstream.

## Capacidades
- Conversion de audio de voz (16 kHz) en movimiento facial 3D con blendshapes para piel, lengua, mandibula y ojos.
- Soporte de tres identidades predefinidas: Claire, James y Mark, cada una con sus propios datos de blendshape e identidad en `solver.bshj`.
- Carga de tensores como arrays NumPy sobre memory map, sin copia, mediante el lector BSHJ del paquete `mashbox`.
- Acceso programatico a metadatos de procedencia (`f.meta()["source"]["model"]`) y a arrays individuales por nombre (por ejemplo, `npz/bs_skin_Claire/neutral`, float32 con forma `(24002, 3)`).
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, tool calling ni agentes: es un modelo unimodal de audio a animacion facial.
- No se documenta soporte multilingue ni capacidad de generalizacion a identidades distintas de las tres incluidas.

## Casos de uso
- Animatronica facial en tiempo real para avatares: el modelo recibe la pista de voz a 16 kHz y emite blendshapes de piel, lengua, mandibula y ojos, lo que permite sincronizar labios en un motor de render 3D sin captura facial adicional.
- Doblaje y localizacion de video: sustituir la pista de audio de un personaje por la voz de otro idioma y regenerar el movimiento facial con el modelo, manteniendo coherencia labial para las identidades Claire, James o Mark.
- Prototipado de asistentes virtuales con cara: integrar el modelo en un pipeline de TPU que reciba audio de un TTS y produzca la animacion del avatar en la misma maquina, aprovechando el formato BSHJ orientado a ese motor.
- Investigacion en animacion procedural: usar los blendshapes como senal de referencia para comparar tecnicas de sincronizacion labial o para entrenar correctores posteriores, gracias a la trazabilidad SHA-256 de cada tensor respecto al upstream.
- Evaluacion de motores de inferencia alternativos: al estar los pesos en BSHJ, sirve para medir el rendimiento del motor `mashbox` sobre TPU frente al camino ONNX de NVIDIA con las mismas matrices.
- Integracion en herramientas de creacion de contenido: cargar los tensores con el lector BSHJ en un script de Python y volcarlos a un formato propio (por ejemplo, un motor de juego) para generar clips faciales por lotes a partir de locuciones pregrabadas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: los pesos ocupan aproximadamente 0,78 GB en float32 (724,1 MB de red mas 52,7 MB de datos auxiliares); la memoria de trabajo adicional depende del motor y no se documenta.
- GPU recomendadas: no disponible. El artefacto esta empaquetado para el motor de TPU de `mashbox`, no para CUDA; para GPU convencional habria que usar el `network.onnx` original de NVIDIA.
- Cabe en GPU de consumo: previsiblemente si por tamano de pesos, pero no se documenta soporte de este formato en GPUs de consumo (RTX 4090, etc.); el camino soportado es TPU.
- Opciones de despliegue: paquete `mashbox` (version 0.1.10) con su lector BSHJ; no hay comando `mashbox run` para este modelo, por lo que la ejecucion debe orquestarse manualmente. Alternativa: repositorio `nvidia/Audio2Face-3D-v3.0` con ONNX Runtime.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mashbox-labs/Audio2Face-3D-v3.0-TPU | no disponible (271 tensores) | no aplica | BSHJ | NVIDIA Open Model License | Conversion de pesos para motor TPU `mashbox`; sin configs JSON |
| nvidia/Audio2Face-3D-v3.0 | no disponible | no aplica | ONNX mas NPZ y JSON | NVIDIA Open Model License | Upstream canonico; incluye configuraciones y pipeline completo |
| Alternativas de audio a blendshapes | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias
- Solo pesos: no hay pipeline de inferencia, ni comando de ejecucion, ni ficheros de configuracion JSON en este repositorio; sin el upstream no se puede reconstruir el grafo completo.
- El paquete `mashbox` 0.1.10 no ofrece `mashbox run` para este modelo, de modo que la integracion exige escribir codigo propio contra el lector BSHJ.
- Cobertura limitada a tres identidades (Claire, James, Mark); no se documenta capacidad de generalizar a otras caras.
- No se documentan sesgos, tasas de alucinacion ni cobertura linguistica; al ser un modelo de audio a animacion, el riesgo principal es la calidad de la sincronizacion labial en fonemas o idiomas no representados en el entrenamiento original.
- La licencia NVIDIA Open Model License impone condiciones de uso comercial y de redistribucion; conviene revisar el texto integro en `LICENSE` y la linea de atribucion en `NOTICE` antes de desplegar.
- El repositorio presenta cero descargas y cero likes en el momento de la consulta, sin validacion comunitaria documentada.
- No se garantiza compatibilidad futura del formato BSHJ entre versiones del paquete `mashbox`.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/mashbox-labs/Audio2Face-3D-v3.0-TPU
- Modelo original de NVIDIA: https://huggingface.co/nvidia/Audio2Face-3D-v3.0/tree/b74132732fd9a9d29b237bec193ded64c9745e91
- Lector BSHJ (`src/mashbox/bshj.py`): https://github.com/mashbox-labs/mashbox/blob/v0.1.10/src/mashbox/bshj.py
- Repositorio GitHub de mashbox: https://github.com/mashbox-labs/mashbox
- Paquete PyPI `mashbox` 0.1.10: https://pypi.org/project/mashbox/0.1.10/
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Fichero LICENSE del repositorio: https://huggingface.co/mashbox-labs/Audio2Face-3D-v3.0-TPU/blob/main/LICENSE
- Fichero NOTICE del repositorio: https://huggingface.co/mashbox-labs/Audio2Face-3D-v3.0-TPU/blob/main/NOTICE
- Perfil en X de mashbox: https://x.com/mashboxgg
