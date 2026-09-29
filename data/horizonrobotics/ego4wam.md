# HorizonRobotics/Ego4WAM

## Resumen

Ego4WAM-Joint es un modelo de visión-lenguaje-acción (VLA) con capacidad de world model, desarrollado por HorizonRobotics y publicado bajo licencia Apache-2.0. Se trata de un modelo de robótica que combina un transformer de difusión de vídeo (Video DiT derivado de Wan2.2 TI2V-5B) con un cabezal de acciones (Action DiT) dentro de un framework de Mixture-of-Transformers (MoT) de 30 capas, todo ello gobernado por un encoder de texto UMT5-XXL de Google. El modelo genera trayectorias de acción para robots manipuladores a partir de observaciones visuales multimodales (cámara cenital y muñecas izquierda y derecha) y de instrucciones en lenguaje natural.

El checkpoint liberado contiene 13.456.608.092 parámetros en BF16 (2.092 tensores, 25,07 GiB), e incluye los pesos del Video DiT, el VAE, el text encoder UMT5, el Action DiT y un encoder propioceptivo, de modo que no es necesario descargar backbones adicionales. La inferencia se realiza mediante flow matching con un sampler Euler de 20 pasos, con un horizonte de acción de 32 pasos y una dimensión de estado/acción de 32.

Su relevancia actual radica en la línea de investigación de los World Action Models (WAM): el modelo no solo predice acciones, sino que aprende simultáneamente a reconstruir estados futuros del entorno, lo que según el paper asociado (arXiv 2607.08436) mejora la transferencia desde datos egocéntricos humanos desalineados hacia políticas robóticas. La variante "Joint" emplea atención síncrona y conjunta entre los tokens de vídeo y de acción, en lugar de tratar ambos dominios de forma separada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Transformers (MoT) con Video DiT + Action DiT; flow matching (atención conjunta vídeo/acción) |
| Parametros totales | 13.456.608.092 (2.092 tensores en BF16) |
| Parametros activos | no aplica (no es un modelo MoE disperso; es MoT denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint publicado se distribuye en BF16) |
| Idiomas soportados | no disponible (usa el tokenizer de UMT5, que es multilingüe, pero no se declaran idiomas) |
| Licencia | apache-2.0 (pesos); código fuente de Ego4WAM bajo MIT |
| Formato de pesos | safetensors (BF16), con `inference_config.yaml` y `model_assets/` en el repositorio |
| Dimension de estado / accion | 32 / 32 |
| Horizonte de accion | 32 |
| Capas MoT | 30 (hidden size de vídeo 3.072; hidden size de acción 1.024) |
| Muestreo | flow matching con Euler de 20 pasos |
| Entradas de camara | cabeza, muñeca izquierda y muñeca derecha (RGB) |
| Salida de ejecucion RoboDojo | primeras 14 dimensiones tras normalización inversa |
| Prefijos del state dict | `backbone.` (1.266), `action_model.` (824), `proprio_encoder.` (2) |
| SHA-256 de `model.safetensors` | ae1b4595e1909e4573ad3214e1c5112f1920a34675340f6adfd4f2e9ec6c12c4 |

## Arquitectura y entrenamiento

Ego4WAM-Joint se construye sobre el framework StarVLA y combina componentes de generación de vídeo con un cabezal de control robótico. El núcleo es un Mixture-of-Transformers de 30 capas que procesa en paralelo tokens de vídeo (hidden size 3.072) y tokens de acción (hidden size 1.024). En la variante Joint, la atención entre ambos flujos es síncrona y conjunta, de manera que el modelo razona de forma acoplada sobre la dinámica visual y la secuencia de acciones. El checkpoint empaqueta el Video DiT, el VAE, el text encoder UMT5-XXL, el Action DiT y el encoder propioceptivo en un único `state dict` que se carga con `strict=True`.

Según el paper asociado (EgoWAM: World Action Models Beyond Pixels with In-the-Wild Egocentric Data, arXiv 2607.08436), la familia EgoWAM se apoya en un backbone Heterogeneous Pretrained Transformer (HPT) con stems específicos por cuerpo robótico que alimentan un tronco compartido, y dispone de dos cabezales de lectura: un cabezal de acción compartido basado en conditional flow matching y un cabezal de world model intercambiable que reconstruye la observación futura. La hipótesis central es que la supervisión mediante world model desacopla el contenido transferible (objetos, escenas, semántica de tarea) de los factores no transferibles (morfología humana, movimiento de cabeza, estilo de comportamiento) presentes en vídeo egocéntrico humano. El paper indica que objetivos como DINO o flujo 3D superan a los objetivos basados en píxeles, aunque no se proporcionan cifras concretas en la información disponible. No se detallan en la model card el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Generación de acciones robóticas multi-paso: produce secuencias de acción de horizonte 32 a partir de observaciones RGB y de una instrucción de lenguaje natural.
- World modeling: reconstruye observaciones futuras mediante un cabezal de world model condicionado en los tokens de futuro del tronco compartido.
- Fusión multimodal de tres cámaras: procesa vistas de cabeza y de ambas muñecas de forma simultánea.
- Percepción propioceptiva: incorpora un encoder propioceptivo que integra el estado del robot en la predicción.
- Condicionamiento por lenguaje natural: emplea el text encoder UMT5-XXL, por lo que puede seguir instrucciones textuales de tarea.
- Control continuo mediante flow matching: genera trayectorias continuas con un sampler Euler de 20 pasos en lugar de tokens discretos.
- Transferencia desde datos egocéntricos humanos: diseñado para aprovechar vídeo egocéntrico con morfología distinta a la del robot objetivo.
- Ejecución en RoboDojo: la salida se recorta a las primeras 14 dimensiones tras la normalización inversa para su uso directo en ese entorno de evaluación.
- Tool calling: no disponible.
- Soporte de agentes multi-step basado en llamadas a herramientas: no disponible.
- Capacidades de audio: no disponibles.

## Casos de uso

- Manipulación robótica por imitación: el modelo puede actuar como política de control en un brazo manipulador, generando trayectorias de 32 pasos a partir de tres vistas de cámara y una instrucción textual, lo que permite tareas de pick-and-place y ensamblaje sin ingeniería de recompensas.
- Aprendizaje a partir de vídeo egocéntrico humano: al incorporar un cabezal de world model, el modelo puede entrenarse con grabaciones egocéntricas de operarios humanos cuyas cámaras y morfología no coinciden con las del robot, reduciendo la necesidad de teleoperación costosa.
- Evaluación comparativa en RoboDojo: gracias a que la salida se ajusta a las primeras 14 dimensiones del espacio de acción de RoboDojo, el modelo puede desplegarse directamente como baseline o candidato en ese benchmark de manipulación.
- Investigación en world models para robótica: el cabezal de world model permite estudiar qué representaciones de futuro (píxeles, DINO, flujo 3D) ofrecen mejor señal de supervisión para políticas, un eje central del paper asociado.
- Predicción anticipada de estados del entorno: en aplicaciones de planificación, el modelo puede usarse para anticipar la evolución de la escena antes de ejecutar la acción, útil en entornos con objetos en movimiento.
- Prototipado de políticas condicionadas por lenguaje: equipos de investigación pueden evaluar cómo distintas instrucciones textuales modifican la trayectoria generada, aprovechando el encoder UMT5-XXL integrado.
- Reutilización del backbone de vídeo: al derivar de Wan2.2 TI2V-5B, investigaciones centradas en generación de vídeo condicionada pueden reutilizar el Video DiT como componente, aunque el checkpoint está orientado a control robótico.
- Formación y reproducción de experimentos: al publicarse el `state dict` completo con VAE, tokenizer y configs offline, un laboratorio puede reproducir el pipeline sin dependencias de descargas externas, lo que facilita la verificación de resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La información proporcionada (model card y resultados de búsqueda) menciona cualitativamente que los objetivos DINO y de flujo 3D superan a los objetivos basados en píxeles para la supervisión del world model, pero no incluye cifras de MMLU, HumanEval, GSM8K ni métricas de manipulación como tasas de éxito en RoboDojo. No se presentan por tanto tablas comparativas numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 25 GiB solo para los pesos (`model.safetensors` pesa 25,07 GiB), más el espacio para activaciones, VAE y el pipeline de flow matching; se recomienda un mínimo de 32 GB de VRAM para un despliegue cómodo.
- GPU recomendadas: A100 40/80 GB y H100 para inferencia en BF16 sin compromisos; GPU de 32 GB (por ejemplo V100 32 GB o A100 40 GB) como mínimo práctico.
- GPU de consumo: una RTX 4090 con 24 GB no puede alojar los pesos en BF16 sin offloading a CPU o cuantización, ya que los pesos por sí solos superan su capacidad. No se documentan cuantizaciones oficiales para este checkpoint.
- Opciones de despliegue: el modelo se carga mediante la librería `starvla`, usando `baseframework.from_pretrained` sobre el fichero `model.safetensors`; el resto de componentes (VAE, text encoder, tokenizer) se resuelven desde `model_assets/`. No se indica soporte para vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este tipo de modelo de difusión/VLA.
- Latencia y throughput: no disponibles. El único dato relacionado es que el muestreo emplea flow matching con un sampler Euler de 20 pasos, lo que implica 20 evaluaciones del modelo por cada bloque de 32 acciones.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos directamente comparables de la misma categoría (VLA con world model). La comparación se limita a los componentes base declarados:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Ego4WAM-Joint | 13.456.608.092 | no disponible | apache-2.0 | HuggingFace (HorizonRobotics/Ego4WAM) | VLA con world model, MoT de 30 capas, flow matching |
| Wan-AI/Wan2.2-TI2V-5B-Diffusers | ~5B | no disponible | no disponible | HuggingFace | Backbone de generación de vídeo del que deriva el Video DiT |
| google/umt5-xxl | no disponible | no disponible | no disponible | HuggingFace | Encoder de texto multilingüe usado para el condicionamiento por lenguaje |

Para alternativas de la misma categoría (por ejemplo otras políticas VLA con horizonte de acción comparable), no hay datos en la información disponible que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la model card. Al entrenarse previsiblemente con datos egocéntricos humanos, puede heredar sesgos de comportamiento y estilo de los operarios que aparezcan en el corpus.
- Riesgo de alucinación: como política generativa basada en difusión, puede producir trayectorias plausibles pero incorrectas para la tarea, especialmente ante objetos o configuraciones de escena no vistas.
- Limitaciones de contexto e idioma: la longitud de contexto no está publicada y no se declaran idiomas soportados; aunque UMT5-XXL es multilingüe, no hay garantía de que el condicionamiento textual funcione correctamente en castellano u otros idiomas.
- Dependencia del hardware de captura: el modelo espera exactamente tres vistas RGB (cabeza y dos muñecas); un montaje distinto exigiría adaptación del pipeline.
- Especificidad de acción: la salida para RoboDojo se recorta a las primeras 14 dimensiones tras la normalización inversa, de modo que reutilizarlo en otro robot requiere reinterpretar el espacio de acción.
- Restricciones de licencia: los pesos se publican bajo Apache-2.0, lo que permite uso comercial, pero el código de Ego4WAM está bajo MIT y el modelo construye sobre StarVLA, Wan2.2 TI2V-5B y UMT5-XXL; al redistribuir trabajos derivados debe conservarse la atribución de esos componentes upstream.
- Carga estricta del `state dict`: la carga se realiza con `strict=True`, por lo que cualquier modificación de la geometría del modelo romperá la inicialización.
- Madurez del release: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, y la fecha del modelo es posterior a la de la información disponible, lo que sugiere un lanzamiento muy reciente sin validación independiente publicada.
- Ausencia de métricas: no hay benchmarks publicados, por lo que no es posible estimar de antemano su tasa de éxito en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HorizonRobotics/Ego4WAM
- Perfil de la organización: https://huggingface.co/HorizonRobotics
- Paper EgoWAM en arXiv: https://arxiv.org/abs/2607.08436
- Versión HTML del paper: https://arxiv.org/html/2607.08436v1
- Página del proyecto EgoWAM: https://gatech-rl2.github.io/egowam.github.io/
- Resumen en Emergent Mind: https://www.emergentmind.com/papers/2607.08436
- Modelo base de vídeo: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B-Diffusers
- Encoder de texto base: https://huggingface.co/google/umt5-xxl
