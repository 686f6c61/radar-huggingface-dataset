# mws-physical-ai/gr00t-n16-remove-trash-real20k-20261125

## Resumen

GR00T N1.6 Remove Trash es un ajuste fino (fine-tune) del modelo vision-language-action (VLA) NVIDIA GR00T-N1.6-3B, especializado en la tarea robotica de retirar basura con un robot humanoide Unitree G1 equipado con dos manos BrainCo Revo2. Lo publica el usuario mws-physical-ai y esta pensado para control de politicas de actuacion a partir de una imagen egocentrica y propriocepcion sincronizada del robot. El checkpoint liberado corresponde al paso 7.000 de un entrenamiento de 20.000 pasos sobre teleoperacion real, con la mejor perdida de validacion registrada (0,05976741).

El modelo conserva la arquitectura del GR00T N1.6-3B original: un VLA de aproximadamente 3.286 millones de parametros que combina un codificador visual (Eagle) con un transformer de accion que emite comandos motores en forma de tokens. En este ajuste, la salida son 50 pasos a 50 Hz, cada uno con un token SONIC de 64 dimensiones y dos objetivos de seis canales para las manos BrainCo. La entrada se procesa a 640×360 pixeles y el codificador Eagle alinea a 644×364.

Su relevancia es acotada pero concreta: demuestra el flujo de adaptacion de un VLA generalista a un embodiment nuevo (`NEW_EMBODIMENT`) mediante teleoperacion real de pocos episodios (42 de entrenamiento, 10 de validacion de una sesion distinta). Es un artefacto de investigacion util para reproducir el pipeline de fine-tune y evaluar el comportamiento de GR00T N1.6 en manipulacion bimanual con humanoides, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en NVIDIA GR00T N1.6; codificador visual Eagle + transformer de accion |
| Parametros totales | 3.286.608.832 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | nvidia-groot (etiquetada como `other` con `license_name: nvidia-groot`) |
| Formato de pesos | safetensors |
| Modelo base | nvidia/GR00T-N1.6-3B (revision d0814e7ecb19202e7c8468b46098b0b7ef3a6d61) |
| Dataset de ajuste | mws-physical-ai/g1-brainco-remove-trash-teleop-combined-20261120 (revision e195f2e516a74b361d9fe038b6693aa02e7c7baa) |
| Embodiment | NEW_EMBODIMENT (Unitree G1 + dos manos BrainCo Revo2) |
| Instruccion | remove_trash |
| Entrada | una imagen RGB egocentrica + propriocepcion sincronizada; preprocesado a 640×360 (Eagle alinea a 644×364) |
| Salida | 50 pasos a 50 Hz; token SONIC de 64 dimensiones + dos objetivos de seis canales para manos BrainCo |
| Tamano del repo | 9,8 GB |
| Episodios | 42 de entrenamiento, 10 de validacion (sesion de recogida distinta) |
| Checkpoint | paso 7.000 de 20.000; mejor perdida de validacion 0,05976741 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura VLA de GR00T N1.6-3B: un codificador visual Eagle que procesa la imagen egocentrica y la alinea a 644×364, combinado con un transformer de accion que genera secuencias de comandos motores tokenizados. La salida se estructura en chunks de 50 pasos a 50 Hz, donde cada paso incluye un token SONIC de 64 dimensiones y dos vectores de seis canales para las manos BrainCo Revo2. La entrada combina la imagen con propriocepcion sincronizada del robot Unitree G1.

El entrenamiento consistio en un fine-tune de 20.000 pasos sobre teleoperacion real, del cual se libera el checkpoint del paso 7.000 por ser el de mejor perdida de validacion (0,05976741). El conjunto de datos combina 42 episodios de entrenamiento y 10 de validacion procedentes de una sesion de recogida separada, lo que permite medir generalizacion entre sesiones. No se documentan en la informacion disponible detalles sobre composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas adicionales mas alla del propio pipeline de GR00T. El checkpoint incluye pesos de inferencia y estadisticas de normalizacion, y requiere instalar el `preprocessing_640.py` del propio checkpoint antes de cargar el procesador, segun se describe en `PREPROCESSING.md`.

## Capacidades

- Generacion de politicas de accion para manipulacion robotica bimanual: emite chunks de 50 pasos a 50 Hz con token SONIC y objetivos para dos manos BrainCo.
- Percepcion visual egocentrica: procesa una imagen RGB del robot a 640×360 (alineada a 644×364 por Eagle).
- Fusion vision-propriocepcion: integra la imagen con la propriocepcion sincronizada del Unitree G1.
- Ejecucion de una instruccion concreta de alto nivel (`remove_trash`) sobre un embodiment nuevo (`NEW_EMBODIMENT`).
- Control de manos antropomorficas: dos salidas de seis canales para las manos BrainCo Revo2.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento textual general, vision de proposito general ni audio en la informacion disponible.
- Capacidades multilingues: no disponibles (no se documentan idiomas).

## Casos de uso

- Investigacion en aprendizaje por imitacion: reproducir el pipeline de fine-tune de GR00T N1.6 sobre teleoperacion real con pocos episodios (42) y evaluar la generalizacion a una sesion de validacion separada (10 episodios).
- Manipulacion bimanual con humanoides: usar el checkpoint como politica de referencia para retirar objetos con un Unitree G1 y manos BrainCo Revo2, aprovechando la salida de 50 pasos a 50 Hz.
- Benchmark de adaptacion a nuevo embodiment: servir de base para comparar estrategias de adaptacion de VLA generalistas a morfologias nuevas (`NEW_EMBODIMENT`).
- Desarrollo de stacks de control robotico: integrar la salida tokenizada (SONIC de 64 dimensiones + seis canales por mano) en un bucle de control a 50 Hz para validar latencias y suavidad de comandos.
- Estudio de robustez entre sesiones: analizar la degradacion de la politica al cambiar de sesion de recogida, usando la perdida de validacion (0,05976741) como metrica de referencia.
- Docencia y prototipado en robotica: emplear el checkpoint y su `PREPROCESSING.md` como ejemplo completo de despliegue de un VLA en un humanoide real.
- Analisis de seguridad en manipulacion: detectar y corregir comportamientos anomalos, como los comandos abruptos de la mano derecha observados en el replay de validacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de rendimiento documentado es la perdida de validacion retenida del checkpoint:

| Metrica | Valor |
|---|---|
| Perdida de validacion (held-out) | 0,05976741 |
| Paso del checkpoint | 7.000 (de 20.000) |
| Episodios de validacion | 10 (sesion de recogida separada) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 3.286 millones de parametros en safetensors (probablemente fp32/bf16), el repo ocupa 9,8 GB, por lo que se necesita al menos ese orden de memoria para cargar los pesos completos.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, cabria esperar GPU de datacenter (A100, H100) o consumer de gama alta con suficiente VRAM, pero no se confirma.
- Compatibilidad con GPU consumer: no confirmada; el tamano del repo (9,8 GB) sugiere que podria caber en GPU con 12-16 GB o mas, pero no se documenta.
- Opciones de despliegue: no se documentan frameworks especificos (vLLM, llama.cpp, Ollama, TGI); el modelo requiere el pipeline de GR00T y el `preprocessing_640.py` del checkpoint.
- Latencia y throughput: la politica emite 50 pasos a 50 Hz, es decir, chunks de 1 segundo de duracion; no se publican cifras de latencia de inferencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GR00T N1.6 Remove Trash (este) | 3.286 M | no disponible | VLA fine-tune para Unitree G1 + BrainCo | nvidia-groot | Hugging Face (0 descargas) |
| nvidia/GR00T-N1.6-3B | ~3.000 M (segun nombre) | no disponible | VLA generalista base | nvidia-groot | Hugging Face |
| Otros VLA roboticos (p. ej. OpenVLA, RT-2) | no disponible | no disponible | VLA generalistas | varian | varian |

La comparacion cuantitativa con alternativas no esta disponible en la informacion proporcionada. La diferencia principal frente al modelo base es la especializacion en un embodiment y una tarea concretos (`remove_trash`) mediante fine-tune supervisado sobre teleoperacion real.

## Limitaciones y advertencias

- Es un checkpoint de investigacion con 0 descargas y 0 likes; no hay evidencia de validacion externa ni de uso en produccion.
- El propio autor advierte de comandos abruptos de la mano derecha en algunos chunks muestreados durante el replay de validacion, lo que supone un riesgo de seguridad en ejecucion real.
- El conjunto de entrenamiento es muy reducido (42 episodios) y la validacion proviene de una unica sesion separada (10 episodios); la generalizacion a otras sesiones, entornos u objetos no esta demostrada.
- La tarea esta fijada a la instruccion `remove_trash` y al embodiment `NEW_EMBODIMENT` (Unitree G1 + manos BrainCo Revo2); no se documenta transferencia a otras morfologias.
- No se documentan sesgos, idiomas soportados ni comportamiento multilingue.
- Riesgo de alucinacion en el sentido de generar comandos motores no validos o inseguros; requiere supervision y limites de seguridad en el robot.
- La licencia `nvidia-groot` (etiquetada como `other`) impone condiciones especificas; debe revisarse el archivo `LICENSE` antes de cualquier uso comercial.
- Requiere instalar el `preprocessing_640.py` del checkpoint antes de cargar el procesador; omitirlo puede producir entradas incorrectas.
- No se publican cifras de latencia, throughput ni requisitos de hardware, lo que dificulta planificar el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mws-physical-ai/gr00t-n16-remove-trash-real20k-20261125
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.6-3B
- Dataset de ajuste: https://huggingface.co/datasets/mws-physical-ai/g1-brainco-remove-trash-teleop-combined-20261120
- Documentacion de preprocesado del checkpoint: PREPROCESSING.md (incluido en el repositorio del modelo)
- Licencia: LICENSE (incluido en el repositorio del modelo)
