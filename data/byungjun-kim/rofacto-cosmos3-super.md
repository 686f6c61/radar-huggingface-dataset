# byungjun-kim/RoFacto-Cosmos3-Super

## Resumen

RoFacto · Cosmos3-Super es un adaptador LoRA publicado por byungjun-kim que extiende el modelo de mundo (world model) generativo NVIDIA Cosmos3-Super con una condicion adicional de RGB estatico y RGB de render de robot. El modelo base es un generador image-to-video de NVIDIA orientado a robótica y simulación física; este adaptador le permite recibir, junto al prompt visual, dos pistas RGB alineadas temporal y espacialmente con la escena y con el render del manipulador, de forma que los tokens de video estatico, de render de robot y generados comparten posiciones espaciotemporales y interactuan mediante atencion conjunta.

El repositorio contiene unicamente los pesos del adaptador (0,3 GB), no los pesos base ni el estado del optimizador, y declara 159.383.552 parametros entrenables mediante LoRA de rango/alpha 64 aplicado a las proyecciones Q/K/V/output del generador. El entrenamiento se realizo sobre DROID y RoboCasa DiT4DiT a resolucion 832x480 y 81 frames, con un batch efectivo de 32 y 5.000 actualizaciones publicadas. Se trata de un backend adicional de RoFacto: la implementacion original del paper usa Wan2.1.

Su relevancia es acotada pero tecnica: demuestra que un world model de robótica puede condicionarse con la geometria explicita del robot (malla renderizada) ademas del RGB de la escena, lo que abre la puerta a generacion de video de interaccion humano-robot (H2R) fisicamente coherente con la cinematica del manipulador. El codigo de inferencia esta asociado a un repositorio de GitHub con acceso por invitacion en el momento de la publicacion del checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre el transformer generativo (DiT) de NVIDIA Cosmos3-Super; atencion conjunta sobre tokens de RGB estatico, RGB de render de robot y video generado |
| Parametros totales | no disponible (solo se declaran 159.383.552 parametros entrenables del adaptador; el total del modelo base no se especifica) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en terminos de tokens; ventana de generacion de 81 frames (configuracion de entrenamiento) y inferencia validada hasta 397 frames |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en precision de entrenamiento; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (identificador `other`, `license_name: openmdw1.1-license`); aplica tanto a la base Cosmos3 como al adaptador |
| Formato de pesos | pesos del adaptador en el formato nativo del repositorio de inferencia (cuatro ficheros de exportacion que deben mantenerse juntos); no se especifica safetensors ni GGUF; VAE externo `Wan2.2_VAE.pth` |

## Arquitectura y entrenamiento

El adaptador se monta sobre Cosmos3-Super, un generador de video basado en transformer de difusion (DiT) de NVIDIA. La innovacion de RoFacto consiste en inyectar dos condiciones visuales adicionales al stream generativo: un RGB estatico de la escena y un RGB con el render de la malla del robot. Estos tokens, junto con los tokens de video generado, se alinean en tiempo y camara y comparten posiciones espaciotemporales, participando en una atencion conjunta que permite al modelo razonar sobre la relacion entre el robot renderizado y la escena observada. El adaptador modifica las proyecciones Q/K/V y la salida del generador con LoRA de rango y alpha 64.

El entrenamiento empleo DROID y RoboCasa DiT4DiT, con batch efectivo de 32 y 5.000 actualizaciones, a 832x480 y 81 frames. El VAE utilizado para codificar y decodificar video es el Wan2.2 TI2V-5B VAE, descargado por separado. El checkpoint es exclusivamente RGB-condicionado: los adaptadores de profundidad de escena y de efector final (EEF) no forman parte de esta release. La equivalencia del recetario refactorizado respecto al recetario nativo de Super y el entrenamiento distribuido con reanudacion quedan explicitamente sin verificar segun el autor.

## Capacidades

- Generacion de video image-to-video condicionada por RGB estatico de escena y RGB de render de robot, con alineacion temporal y de camara entre ambas pistas.
- Modelado de interaccion humano-robot (H2R) en entornos manipulativos, ejemplificado por el autor con los casos ALLEX/RB-Y1.
- Razonamiento espaciotemporal conjunto sobre escena, cinematica renderizada del robot y video sintetizado.
- Generacion de secuencias de hasta 397 frames en inferencia, con preservacion del FPS nativo.
- Control fino de generacion mediante steps, escala CFG y shift configurables (perfil probado: 35 steps, CFG 6, shift 10).
- Integracion con el ecosistema Cosmos3-Super para pipelines de world modeling en robotica.
- No se documentan capacidades de tool calling, agentes, multilingüismo, audio ni thinking mode.

## Casos de uso

- Generacion de video sintetico de interaccion humano-robot para aumento de datos: el adaptador permite renderizar la malla del robot en la pose deseada y generar video realista de la escena con el manipulador actuando, util para ampliar datasets de imitacion como DROID sin coste de captura real.
- Evaluacion de politicas en simulacion visual: dado un RGB de escena y el render cinematico de un plan de movimiento, el modelo genera el video resultante, permitiendo inspeccionar visualmente la plausibilidad de la trayectoria antes de ejecutarla en hardware.
- World modeling para planificacion: usar el video generado como prediccion a corto plazo del estado del entorno para un planificador que selecciona acciones en funcion de la coherencia fisica de la prediccion.
- Prototipado de escenarios de manipulacion: generar variaciones de escena y configuraciones robot-escena para estudiar robustez de percepción ante cambios de iluminacion, oclusiones o disposicion de objetos.
- Investigacion en representaciones de robot: comparar como el modelo integra la geometria renderizada frente al RGB puro, aportando evidencia sobre la utilidad de condiciones geometricas explicitas en world models.
- Produccion de material divulgativo y docencia: generar clips de interaccion robot-escena controlados para demostraciones de robotica, con parametros reproducibles (steps, CFG, shift).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta comprobaciones de integracion (inferencia corta y larga, generacion repetida y reinicio sobre salida completada) y metricas de memoria: pico de VRAM asignada de 54 GiB para 133 frames y 72 GiB para 397 frames en un perfil A100 80GB con offload a CPU.

## Requisitos de hardware

- VRAM: pico asignado de 54 GiB para 133 frames y 72 GiB para 397 frames, medido en A100 80GB con `--resident-layers 20` y `--pin-cpu-memory`.
- RAM host: al menos 150 GiB provisionados para el perfil con offload a CPU.
- GPU recomendadas: A100 80GB es el perfil validado; no se documentan pruebas en H100, RTX 4090 ni otras consumer GPU.
- Consumer GPU: no cabe en GPUs de consumo por el volumen de VRAM y RAM host requerido segun los datos publicados.
- Despliegue: script de inferencia propio del repositorio `rofacto-dev` (`python -m training.cosmos3.inference`), con entorno instalado via `setup_cosmos3.sh`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (se trata de un generador de video, no de un LLM).
- Dependencias externas: pesos base `nvidia/Cosmos3-Super` en la revision `f543c56225b2e04d0ad141e29655be3a45d9c455` y VAE `Wan-AI/Wan2.2-TI2V-5B` (`Wan2.2_VAE.pth`, revision `921dbaf3f1674a56f47e83fb80a34bac8a8f203e`).
- Restricciones de entrada: resolucion 832x480 y numero de frames `4n+1`; condiciones estatica y de render de robot alineadas en tiempo y camara.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Condiciones de entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoFacto · Cosmos3-Super (este) | 159,4 M entrenables (adaptador); total base no disponible | 81 frames en entrenamiento; hasta 397 frames validados | RGB estatico + RGB de render de robot + prompt | OpenMDW-1.1 | Pesos del adaptador publicos; codigo con invitacion |
| RoFacto sobre Wan2.1 (implementacion original del paper) | no disponible | no disponible | RGB estatico + RGB de render de robot | no disponible | Referenciada en paper y repositorio |
| NVIDIA Cosmos3-Super (base) | no disponible | no disponible | image-to-video estandar | OpenMDW-1.1 | Publico en Hugging Face |

No se dispone de datos de benchmarks que permitan comparar rendimiento numerico entre estas variantes.

## Limitaciones y advertencias

- Checkpoint exclusivamente RGB-condicionado: los adaptadores de profundidad de escena y de profundidad del efector final no estan incluidos en esta release.
- No incluye pesos base ni estado del optimizador; requiere descargar Cosmos3-Super y el VAE Wan2.2 por separado y respetar la revision exacta del base.
- Los cuatro ficheros de exportacion deben mantenerse juntos; un uso parcial invalida el checkpoint.
- El codigo de inferencia esta tras invitacion en el momento de la publicacion; la release publica esta en preparacion.
- Entrenamiento distribuido con reanudacion y equivalencia con el recetario nativo de Super no verificados por el autor.
- Requisitos de hardware muy elevados (hasta 72 GiB de VRAM y 150 GiB de RAM host), lo que limita el uso a entornos de servidor.
- Entradas restringidas a 832x480 y `4n+1` frames, con alineacion temporal y de camara obligatoria entre condiciones; la eliminacion o inpainting de humanos y el retargeting son pasos de preprocesado separados no incluidos.
- Riesgo de alucinacion visual: como generador de difusion, puede producir interacciones fisicamente implausibles o inconsistencias entre la malla renderizada y el video sintetizado; no se documentan evaluaciones cuantitativas de fidelidad fisica.
- Sesgos: no se documentan analisis de sesgos; el entrenamiento sobre DROID y RoboCasa hereda las distribuciones de escenas, objetos e iluminacion de esos datasets.
- Licencia OpenMDW-1.1: revisar `LICENSE` y `NOTICE` antes de uso comercial; la licencia se declara como `other`, no como licencia OSI estandar.
- No se incluyen demostraciones humanas privadas ni assets de robot; la provenance se documenta via `release_metadata.json` y `SHA256SUMS`.
- Idiomas y capacidades multilingues no disponibles; el modelo no es un LLM y no ofrece tool calling ni razonamiento textual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/byungjun-kim/RoFacto-Cosmos3-Super
- Paper: https://arxiv.org/abs/2607.22535
- Codigo (acceso por invitacion): https://github.com/bjkim95/rofacto-dev
- Guia de inferencia rapida: https://github.com/bjkim95/rofacto-dev/blob/main/docs/cosmos3/quickstart.md
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Super
- VAE: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
