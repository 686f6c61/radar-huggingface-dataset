# learner1119/ffw_sh5_n17_260820_left_h50_abs_vis_30000

## Resumen

`ffw_sh5_n17_260820_left_h50_abs_vis_30000` es un checkpoint intermedio de un fine-tuning del modelo fundacional robótico NVIDIA GR00T N1.7-3B, publicado por el usuario `learner1119`. Se trata de un modelo de visión-lenguaje-acción (VLA) de 3.144.016.000 parámetros, cuyo backbone es `nvidia/Cosmos-Reason2-2B` (con capas del LLM hasta la 12). El ajuste se ha realizado sobre el dataset `learner1119/260820` para una tarea de manipulación con el brazo izquierdo sobre un embodiment denominado FFW-SH5, con representación de acciones en modo absoluto y con la torre de visión también entrenada (`tune_visual = True`).

El checkpoint corresponde al paso 30.000 de un total de 50.000, con una pérdida de entrenamiento (media móvil de 25 puntos) de 0,0127. Forma parte de una familia de ejecuciones publicadas en paralelo: la versión absoluta sin torre visual, la versión relativa y el checkpoint final de 50.000 pasos, que el propio autor recomienda como alternativa preferente.

Su relevancia es acotada y muy específica: no es un modelo de propósito general, sino un artefacto de investigación para estudiar curvas de entrenamiento y comparar variantes de representación de acciones (absoluta frente a relativa) en robótica con modelos VLA de tamano medio. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y únicamente se distribuyen los pesos en BF16 (2 shards), sin estado del optimizador ni datos de validación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) basada en GR00T N1.7; backbone `nvidia/Cosmos-Reason2-2B`, capas del LLM <= 12 |
| Parametros totales | 3.144.016.000 (3,14 B) |
| Parametros activos | No aplica (no es un modelo MoE, segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (unico formato publicado); no se distribuyen variantes GGUF, INT8 ni INT4 |
| Idiomas soportados | no disponible |
| Licencia | nvidia-open-model-license (license: other) |
| Formato de pesos | safetensors, BF16, 2 shards (tamano del repo: 6,9 GB) |
| Libreria | transformers |
| Pipeline declarado | robotics |
| Modelo base | nvidia/GR00T-N1.7-3B (fine-tuning) |
| Dataset de entrenamiento | learner1119/260820 |
| Paso del checkpoint | 30.000 de 50.000 |
| Perdida de entrenamiento | 0,0127 (media movil de 25 puntos) |
| Repositorio relacionado | learner1119/ffw_sh5_n17_260820_left_h50_abs_vis_50000 (checkpoint final) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de GR00T N1.7, un modelo fundacional de visión-lenguaje-acción orientado a control robótico. Segun la informacion del repositorio, el backbone es `nvidia/Cosmos-Reason2-2B` y en el fine-tuning se utilizan las capas del LLM hasta la 12, sobre un total de 3,14 B de parametros. La representacion de acciones configurada es absoluta (`ABSOLUTE`), frente a la variante relativa publicada como checkpoint hermano, y la torre de visión se ha descongelado (`tune_visual = True`). No se detalla en la informacion disponible el tipo de cabeza de acciones (por ejemplo, difusion) ni el mecanismo exacto de fusión entre vision, lenguaje y accion.

El entrenamiento se realizó con batch global 64, learning rate 1e-4, scheduler coseno con warmup de 0,05, weight decay 1e-5 y `state_dropout` de 0,2. El throughput medido fue de 2,22 s/paso sobre 4x A100 de 80 GB. El ajuste se limita al brazo izquierdo: se utilizan 8 de las 16 dimensiones de accion y el brazo derecho nunca se mueve. No se reservó ninguna particion de validación, por lo que no existen métricas de generalización publicadas. Los pesos se guardan en BF16 en 2 shards y no se incluye el estado del optimizador (shards de DeepSpeed ZeRO-2). El repositorio incluye `processor_config.json`, `statistics.json` y `embodiment_id.json` en la raiz, ademas del fichero de configuracion de modalidad `ffw_sh5_left8_h50_config.py`, que debe registrarse antes de instanciar `Gr00tPolicy`.

## Capacidades

- Generacion de acciones de control robótico para un brazo izquierdo sobre el embodiment FFW-SH5, con horizonte de 50 pasos y representacion de acciones en coordenadas absolutas.
- Percepcion visual integrada: al haberse entrenado la torre de visión, el modelo condiciona sus predicciones con la entrada de imagenes del entorno.
- Condicionamiento por lenguaje: al derivar de un VLA, admite instrucciones en lenguaje natural como parte de la entrada, aunque no se especifican los idiomas soportados.
- Control mono-brazo: 8 dimensiones de accion correspondientes al brazo izquierdo; el brazo derecho permanece estatico por diseno del dataset.
- Integracion con el stack de NVIDIA Isaac-GR00T mediante `Gr00tPolicy` y el etiquetado de embodiment `new_embodiment`.
- Punto de comparacion experimental: permite evaluar el efecto de la representacion absoluta frente a la relativa y del ajuste de la torre visual.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision general, audio ni modo de razonamiento explicito.

## Casos de uso

- Manipulacion robótica de laboratorio con brazo izquierdo: el modelo genera las 8 dimensiones de accion del brazo izquierdo con horizonte de 50 pasos, por lo que puede emplearse directamente para controlar el embodiment FFW-SH5 en tareas de recogida y colocacion dentro del mismo dominio de entrenamiento.
- Estudio de curvas de entrenamiento: al ser un checkpoint intermedio (paso 30.000 de 50.000) con pérdida de 0,0127, sirve para analizar la evolucion de la convergencia y comparar el rendimiento entre el punto medio y el checkpoint final de 50.000 pasos.
- Ablacion de representacion de acciones: comparado con el checkpoint hermano `..._left_h50_rel_30000`, permite medir el impacto de usar acciones absolutas frente a relativas manteniendo datos, configuracion y semilla constantes.
- Ablacion de la torre de visión: frente al checkpoint `..._left_h50_abs_30000` (sin `tune_visual`), permite aislar la contribucion del ajuste de la torre visual en el rendimiento de la politica.
- Fine-tuning posterior en un nuevo embodiment: al ser un modelo de 3,14 B con pesos BF16 en 2 shards, puede actuar como inicializacion para adaptaciones a otras morfologias mediante el registro de una configuracion de modalidad propia.
- Evaluacion en simulacion robótica: puede desplegarse en entornos simulados compatibles con el stack GR00T para medir robustez ante variaciones visuales antes de trasladar la politica a hardware real.
- Generacion de trayectorias de referencia: las predicciones de accion del modelo pueden usarse para poblar datasets sinteticos de comportamiento del brazo izquierdo en el dominio FFW-SH5.
- Despliegue en hardware de laboratorio limitado: con 3,14 B de parametros, el modelo es suficientemente pequeno para ejecutarse en una unica GPU de gama alta de consumo, lo que facilita pruebas iterativas sin acceso a clusters.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato numerico de rendimiento es la pérdida de entrenamiento en el paso 30.000, correspondiente a una media movil de 25 puntos: 0,0127. El autor indica explicitamente que no se reservó ninguna particion de validación, por lo que esta cifra no permite estimar la generalizacion del modelo.

| Metrica | Valor | Observaciones |
|---|---|---|
| Perdida de entrenamiento (paso 30.000) | 0,0127 | Media movil de 25 puntos; sin split de validacion |
| Throughput de entrenamiento | 2,22 s/paso | 4x A100 80 GB, batch global 64 |
| MMLU, HumanEval, GSM8K u otros | no disponible | No aplicables a un modelo VLA de control robótico |
| Benchmarks de manipulacion (por ejemplo, tasa de exito en tarea) | no disponible | No publicados |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 6,3 GB solo para pesos (3,14 B x 2 bytes) y del orden de 8-12 GB contando activaciones, imagenes de entrada y buffers de la cabeza de acciones. Cifras estimadas a partir del numero de parametros; no publicadas por el autor.
- GPU recomendadas para entrenamiento: 4x A100 80 GB, configuracion real reportada con 2,22 s/paso y batch global 64.
- GPU recomendadas para inferencia: cualquier GPU con 16 GB o más de VRAM (RTX 4090, RTX 4080, A100, H100, L40S). El modelo cabe con holgura en una RTX 4090 de 24 GB en BF16.
- Compatibilidad con GPU de consumo: si, previsiblemente en RTX 4090, RTX 3090, RTX 4080 y modelos con 16 GB o más. En GPUs de 12 GB (RTX 3060 12 GB, RTX 4070) requeriria reducir el batch o recurrir a cuantizacion no oficial.
- Opciones de despliegue: inferencia mediante `transformers` y el stack Isaac-GR00T (`Gr00tPolicy`, con `embodiment_tag="new_embodiment"` tras registrar `ffw_sh5_left8_h50_config.py`). No se distribuyen pesos GGUF, por lo que llama.cpp y Ollama no son aplicables sin conversion previa. No se documenta soporte para vLLM ni TGI.
- Latencia y throughput de inferencia: no disponibles. El unico dato de rendimiento publicado es de entrenamiento.

## Comparativa con modelos similares

Los resultados de busqueda web proporcionados no contienen informacion relevante sobre modelos VLA comparables, por lo que la comparacion externa figura como no disponible. La comparacion se limita a los checkpoints de la misma familia de ejecuciones, que comparten datos, configuracion y semilla.

| Modelo | Parametros | Representacion de acciones | Torre visual | Paso | Perdida de entrenamiento |
|---|---|---|---|---|---|
| ffw_sh5_n17_260820_left_h50_abs_vis_30000 (este) | 3,14 B | Absoluta | Ajustada | 30.000 / 50.000 | 0,0127 |
| ffw_sh5_n17_260820_left_h50_abs_vis_50000 | no disponible | Absoluta | Ajustada | 50.000 / 50.000 | no disponible |
| ffw_sh5_n17_260820_left_h50_abs_30000 | no disponible | Absoluta | Sin ajustar | 30.000 | no disponible |
| ffw_sh5_n17_260820_left_h50_rel_30000 | no disponible | Relativa | Ajustada | 30.000 | no disponible |
| nvidia/GR00T-N1.7-3B (base) | ~3 B (no confirmado) | no disponible | no disponible | no aplica | no aplica |

Comparacion con alternativas externas de la misma categoria (por ejemplo, otros modelos VLA de tamano similar): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de proposito muy restringido: solo controla el brazo izquierdo sobre el embodiment FFW-SH5 con 8 de 16 dimensiones de accion; el brazo derecho nunca se mueve. No es un modelo de robotica generalista.
- Checkpoint intermedio: corresponde al paso 30.000 de 50.000. El propio autor recomienda usar el repositorio final (`..._abs_vis_50000`) salvo que se necesite especificamente este punto de la curva de entrenamiento.
- Ausencia total de validacion: no se reservó split de validacion. La perdida de 0,0127 es de entrenamiento y no permite estimar el sobreajuste ni la generalizacion.
- Riesgo elevado de sobreajuste al dominio: el ajuste se realiza sobre un unico dataset (`learner1119/260820`) y una unica morfologia, por lo que el comportamiento fuera de la distribucion de entrenamiento no esta caracterizado.
- Sin datos de benchmarks: no hay tasas de exito en tarea ni comparaciones estandarizadas que permitan juzgar la calidad de la politica.
- Idiomas no especificados: no se documenta que lenguas admite la entrada de lenguaje natural.
- Dependencia de configuracion externa: es obligatorio registrar el fichero `ffw_sh5_left8_h50_config.py` antes de instanciar `Gr00tPolicy`; sin el, la carga puede fallar o producir resultados incorrectos. Los ficheros `processor_config.json`, `statistics.json` y `embodiment_id.json` deben permanecer en la raiz del repositorio tal como los escribió el entrenador.
- Estado del optimizador no incluido: no es posible reanudar el entrenamiento exactamente desde este punto sin reconstruir los shards de DeepSpeed ZeRO-2.
- Licencia: se distribuye bajo `nvidia-open-model-license`, no bajo una licencia abierta estandar. Es imprescindible revisar los terminos antes de cualquier uso comercial, ya que la licencia del modelo base de NVIDIA impone condiciones adicionales.
- Opciones de cuantizacion nulas: solo se publican pesos BF16. Cualquier conversion a INT8/INT4 o GGUF es responsabilidad del usuario y no esta validada por el autor.
- Trazabilidad limitada: 0 descargas y 0 likes, sin publicacion asociada ni documentacion externa; no hay evidencia de terceros que haya reproducido los resultados.
- Los resultados de busqueda web disponibles no contienen informacion relacionada con este modelo; no se ha podido verificar informacion adicional de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/learner1119/ffw_sh5_n17_260820_left_h50_abs_vis_30000
- Checkpoint final de la misma ejecucion: https://huggingface.co/learner1119/ffw_sh5_n17_260820_left_h50_abs_vis_50000
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Dataset de entrenamiento: https://huggingface.co/datasets/learner1119/260820
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Checkpoint hermano (absoluto, sin ajuste de vision): https://huggingface.co/learner1119/ffw_sh5_n17_260820_left_h50_abs_30000
- Checkpoint hermano (relativo): https://huggingface.co/learner1119/ffw_sh5_n17_260820_left_h50_rel_30000
- Paper, blog o repositorio adicional del autor: no disponible en la informacion proporcionada.
