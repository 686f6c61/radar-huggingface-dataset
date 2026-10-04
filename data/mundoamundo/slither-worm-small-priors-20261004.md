# mundoamundo/slither-worm-small-priors-20261004

## Resumen

El modelo `mundoamundo/slither-worm-small-priors-20261004` es un segmentador binario de imágenes especializado en detectar el cuerpo del gusano (worm) en partidas del juego Slither.io. Lo desarrolla el usuario de HuggingFace `mundoamundo` como un fine-tuning de `nvidia/segformer-b0-finetuned-ade-512-512`, al que añade una cabeza de refinamiento a resolución completa sobre la arquitectura SegFormer B0. El resultado son 3.719.075 parámetros (3,72 millones) que predicen píxeles de cuerpo del gusano, excluyendo la comida y el brillo exterior, mediante máscaras semánticas (no instancias separadas) y sin necesidad de prompting.

El modelo se apoya en "priors" (conocimiento previo) aprendidos durante el entrenamiento: tubos sólidos y suaves con anchura que cambia lentamente, máscaras corporales sintéticas exactas que excluyen brillo y orbes, consistencia frente a elementos molestos emparejados y una débil afinidad con los bordes de la imagen. La propuesta compara ocho ejecuciones distintas (etiquetas planas, etiquetas guiadas por profesor y la receta completa con priors), seleccionando el modelo ganador únicamente con el conjunto de validación.

Es relevante para quien necesite un segmentador ligero y muy pequeño (0,2 GB de repositorio) que funcione sobre imágenes de un dominio visual concreto, sin depender de modelos de propósito general mucho más grandes. Su limitación principal es que la licencia derivada de NVIDIA restringe su uso a investigación y evaluación no comercial, y que los datos de evaluación son borradores cuyas etiquetas se reconocen como imprecisas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SegFormer B0 (transformer) con cabeza de refinamiento a resolucion completa |
| Parametros totales | 3.719.075 (3,72 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de segmentacion de imagen) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | nvidia-segformer-research-only (solo investigacion/evaluacion no comercial) |
| Formato de pesos | PyTorch `.pt` (`model.pt` para inferencia; `training/best.pt` y `training/latest.pt` para el estado de entrenamiento) |
| Tarea | Segmentacion binaria de imagen (foreground logits) |
| Modelo base | nvidia/segformer-b0-finetuned-ade-512-512 |
| Tamano del repositorio | 0,2 GB |
| Entrada / salida | Entrada float RGB `[B,3,H,W]` en `[0,1]`; salida logits de primer plano `[B,H,W]` |
| Umbral por defecto | 0,50 |
| Ejecucion seleccionada | priors-lr0.00003-s17, epoch 94 |

## Arquitectura y entrenamiento

La arquitectura parte de SegFormer B0, un transformer de segmentacion semantica, y le anade una cabeza de refinamiento a resolucion completa que produce los logits de primer plano del gusano. El modelo distingue el cuerpo del gusano frente a la comida y el brillo exterior, generando mascaras semanticas (todas las regiones del gusano se etiquetan como una sola clase, sin separacion por instancias).

El entrenamiento se organiza en ocho ejecuciones que comparan tres planteamientos: etiquetas planas, etiquetas guiadas por un profesor y la receta completa con priors. Los priors consisten en tubos solidos y suaves con anchura de cambio lento, mascaras corporales sinteticas exactas que excluyen brillo y orbes, consistencia frente a elementos molestos emparejados y una debil afinidad con los bordes de la imagen. Las mascaras borrador originales se conservan y las probabilidades del profesor aportan una supervision suave falible unicamente sobre las imagenes de entrenamiento. El profesor fijo esta disponible en `mundoamundo/slither-worm-segmentation-200-20261004` (revision `622f89a2c9db205c7dff50b524c4a90f59ab2e51`). La seleccion del modelo se hizo exclusivamente con validacion, sin ajuste guiado por el conjunto de test. El snapshot conserva 200 etiquetas/imagenes originales y 30 imagenes de evaluacion nuevas; los pares sinteticos se regeneran con el codigo incluido y las semillas 0 a 799. El autor advierte explicitamente que el modelo con priors no se asume superior al resto de variantes.

## Capacidades

- Segmentacion binaria de imagen: predice pixeles del cuerpo del gusano (foreground logits) y descarta comida y brillo exterior.
- Segmentacion semantica sin prompting: no requiere indicaciones de texto ni ejemplos; produce la mascara directamente.
- Distincion de primer plano frente a elementos de fondo y efectos de brillo.
- Refinamiento a resolucion completa mediante la cabeza adicional sobre SegFormer B0.
- Salida compatible con umbral configurable (0,50 por defecto) y exportacion a PNG 0/255 mediante el helper incluido.
- Inferencia por lotes: la entrada admite un eje de batch `[B,3,H,W]`.
- No dispone de capacidades de generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes, vision general ni audio.

## Casos de uso

- Analisis automatizado de partidas de Slither.io: el modelo segmenta el cuerpo del gusano en cada fotograma para medir longitud, area ocupada o trayectoria, ya que aisla el cuerpo frente a comida y brillo.
- Extraccion de metricas de rendimiento en investigacion de videojuegos: al generar mascaras del gusano, permite calcular posiciones y tamanos de forma automatica sobre capturas de partidas.
- Etiquetado asistido de datasets del dominio: sirve como preanotador de mascaras que luego se revisan manualmente, dado su bajo coste computacional (3,72 M de parametros).
- Preprocesado para pipelines de vision posteriores: la mascara binaria de primer plano puede alimentar etapas de deteccion, seguimiento o clasificacion como canal de atencion.
- Prototipos en hardware modesto: su tamano reducido permite ejecutar la inferencia en CPU o en GPU de gama baja para demostraciones y pruebas rapidas.
- Generacion de overlays cualitativos: el repositorio incluye clips en `videos/` (usando fuentes de validacion) para inspeccion visual del resultado de la segmentacion.
- Investigacion sobre aprendizaje con priors sinteticos: las ocho ejecuciones retenidas permiten estudiar el efecto de priors y supervision guiada por profesor en un dominio visual acotado.

## Benchmarks y rendimiento

Resultados publicados en la model card (seleccion con validacion; imagenes de test nuevas procedentes de 30 videos fuente no usados en entrenamiento ni seleccion, con etiquetas borrador reconocidas como imprecisas):

| Variante | Parametros | IoU (borrador nuevo) | Dice (borrador nuevo) | Tasa de FP con exterior brillante sintetico |
|---|---:|---:|---:|---:|
| priors | 3,72 M | 0,5369 | 0,6987 | 0,0392 |
| plain_b0 | 3,72 M | 0,5311 | 0,6937 | 0,1187 |
| robust_b0 | 3,72 M | 0,5306 | 0,6933 | 0,1470 |
| previous_b2 | 27,35 M | 0,5345 | 0,6967 | 0,1235 |

Diagnostico sintetico: 32 semillas no vistas del mismo renderizador, sin que ello constituya prueba de robustez sobre video real. No se realizo ajuste guiado por test.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 3,72 M de parametros el modelo ocupa del orden de decenas de MB en precision completa, aunque el valor exacto no esta disponible.
- GPU recomendadas: no se especifican en la informacion; por tamano, cualquier GPU moderna es suficiente y tambien es viable la CPU.
- Cabe en GPU de consumo: si, con gran margen (modelo de 3,72 M de parametros y repositorio de 0,2 GB). No se detallan modelos concretos.
- Opciones de despliegue: ejecucion mediante PyTorch con el codigo incluido (`python -m worm_segmentation.predict model.pt image.jpg mask.png`, previa instalacion de `worm_segmentation/requirements.txt`). No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Comparativa con las variantes evaluadas en la propia model card y con el modelo base:

| Modelo | Parametros | Contexto | IoU (borrador nuevo) | Dice (borrador nuevo) | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| slither-worm-small-priors | 3,72 M | No aplica | 0,5369 | 0,6987 | nvidia-segformer-research-only | HuggingFace (0 descargas) |
| plain_b0 | 3,72 M | No aplica | 0,5311 | 0,6937 | nvidia-segformer-research-only | Variante del mismo repo |
| robust_b0 | 3,72 M | No aplica | 0,5306 | 0,6933 | nvidia-segformer-research-only | Variante del mismo repo |
| previous_b2 | 27,35 M | No aplica | 0,5345 | 0,6967 | nvidia-segformer-research-only | Variante del mismo repo |
| nvidia/segformer-b0-finetuned-ade-512-512 | no disponible en la informacion | No aplica | No evaluado en este dominio | No evaluado en este dominio | Licencia NVIDIA original | HuggingFace (modelo base) |

No se proporcionan comparaciones con modelos externos de segmentacion de la misma categoria mas alla de las variantes internas. La variante `previous_b2`, con 27,35 M de parametros (unas 7,3 veces mas), obtiene un IoU ligeramente inferior a la variante `priors` de 3,72 M.

## Limitaciones y advertencias

- Las etiquetas del conjunto de test son borradores reconocidos como imprecisos; el propio autor indica que las mascaras completas necesitan revision antes de reclamar precision absoluta fiable.
- El modelo con priors no se asume superior a las demas variantes; la seleccion se hizo solo con validacion.
- El diagnostico sintetico (32 semillas del mismo renderizador) no constituye prueba de robustez sobre video real.
- Licencia `nvidia-segformer-research-only`: uso restringido a investigacion y evaluacion no comercial. Los derechos del gameplay de origen se mantienen con sus titulares.
- Modelo de dominio muy especifico (segmentacion del gusano en Slither.io); no es un segmentador general ni un modelo de lenguaje.
- No se dispone de informacion sobre sesgos, tipos de cuantizacion, idiomas ni latencia.
- Sin soporte declarado de tool calling, agentes, vision general, audio ni texto.
- Solo 0 descargas y 0 likes: practicamente sin validacion por parte de la comunidad.
- Las fechas del repositorio (2026) y el volumen de datos de entrenamiento (200 imagenes) limitan la generalizacion fuera del dominio entrenado.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/mundoamundo/slither-worm-small-priors-20261004
- Modelo profesor fijo: https://huggingface.co/mundoamundo/slither-worm-segmentation-200-20261004 (revision `622f89a2c9db205c7dff50b524c4a90f59ab2e51`)
- Modelo base: https://huggingface.co/nvidia/segformer-b0-finetuned-ade-512-512
- Descarga reproducible: `snapshot_download('mundoamundo/slither-worm-small-priors-20261004')`
- Documentacion de priors y limitaciones: `worm_segmentation/priors/README.md` dentro del repositorio
