# iscoyizj/discrete-actions-pi05-robocasa

## Resumen
`iscoyizj/discrete-actions-pi05-robocasa` es un conjunto de cuatro políticas de robótica vision-language-action (VLA) construidas sobre el backbone pi0.5, publicadas como material suplementario del artículo *When Do Discrete Actions Make Good Continuous Controllers?* (arXiv:2610.20429). El modelo parte de `lerobot/pi05_base` y se ha ajustado completamente para el benchmark RoboCasa365, con el objetivo de comparar cuatro cabezas de acción distintas (dos discretas y dos continuas) manteniendo idéntico backbone, datos y configuración de entrenamiento. Es relevante porque aísla el efecto del diseño de la cabeza de acción sobre el rendimiento final en manipulación robótica, un aspecto habitualmente mezclado con otras variables.

El backbone es PaliGemma-3B (SigLIP So400m/14 más Gemma-2B), con 2,92B de parámetros, a los que se suman entre 367M y 371M del resampler y la cabeza de acción. La entrada combina tres imágenes RGB de 224×224, la instrucción de tarea (hasta 48 tokens) y el estado del robot (7 valores), y la salida es un chunk de 24 acciones de 7 valores cada una. El modelo es de brazo único (Franka), sin base móvil, y está pensado exclusivamente para evaluación e investigación en RoboCasa365.

Los cuatro checkpoints incluidos (`dflow/`, `cflow/`, `dreg/` y `creg/`) alcanzan entre un 42,4% y un 60,2% de éxito global en el split `target` de RoboCasa365 con la semilla 7. La licencia es Gemma, lo que condiciona el uso comercial, y el tokenizador de PaliGemma no se distribuye con el repositorio por estar tras un gate de aceptación de términos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en PaliGemma-3B (SigLIP So400m/14 + Gemma-2B) con resampler y cabeza de acción |
| Parametros totales | 2,92B (backbone) + 367M a 371M (resampler y cabeza de acción) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (instrucción de tarea limitada a 48 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32; el loader convierte a bf16) |
| Idiomas soportados | no disponible |
| Licencia | Gemma (`https://ai.google.dev/gemma/terms`) |
| Formato de pesos | safetensors (fp32, 13,2 GB por checkpoint) + `config.json` + `norm_stats.json` + `SHA256SUMS` |

## Arquitectura y entrenamiento
El modelo sigue la arquitectura pi0.5: un backbone PaliGemma-3B que procesa tres vistas RGB (`robot0_agentview_left`, `robot0_agentview_right`, `robot0_eye_in_hand`) junto con la instrucción de tarea y el estado del robot, y una cabeza de acción que genera un chunk de 24 pasos × 7 valores (delta de posición del efector final en 3 ejes, delta de rotación en eje-ángulo en 3 ejes y apertura del gripper). La embodiment es `franka_rel_eef_aa_ah1`: brazo Franka únicamente, acciones relativas del efector final con rotación en eje-ángulo. Las cuatro variantes comparten backbone y datos, y solo difieren en la cabeza: DFlow (flow discreto sobre 512 bins uniformes por valor de acción, con historial de 8 acciones), CFlow (flow matching continuo con integrador Euler), DReg (una pasada sobre 512 bins con argmax) y CReg (regresión de una pasada con error cuadrático).

El entrenamiento parte de `lerobot/pi05_base` (revisión `b211f3d44c36b6acfcf7ae94a64e8e96f75a64ba`) con ajuste completo, sobre una mezcla Franka de ocho fuentes (RoboCasa365, DROID y LIBERO-plus), en una ejecución independiente de 150k pasos por cabeza. Se usa batch global 512 (64 por GPU × 8), AdamW con β = (0,9; 0,95), weight decay 1e-4, gradient clipping 1.0, learning rate pico 7,5e-5 con warmup lineal de 13.333 pasos y decaimiento coseno hasta 0,1× el pico, precisión bf16, condition dropout 0,1 y semilla de entrenamiento 42. No se menciona RLHF ni DPO. La innovación técnica destacable es precisamente el estudio controlado de cabezas discretas frente a continuas, con pesos de guía (λ = `--cfg-scale` − 1) y número de pasos de denoising configurables en inferencia.

## Capacidades
- Generación de acciones robóticas: produce chunks de 24 acciones de 7 dimensiones para un brazo Franka en el entorno RoboCasa.
- Percepción visual multi-vista: consume tres imágenes RGB simultáneas (vistas de agente izquierda y derecha, más cámara en la muñeca).
- Condicionamiento por instrucción en lenguaje natural: acepta la descripción de la tarea en hasta 48 tokens.
- Control del efector final: acciones relativas de posición y rotación en el marco de la base del robot, más apertura/cierre del gripper.
- Historial de acciones (solo DFlow): utiliza las últimas 8 acciones ejecutadas como contexto adicional.
- Guía por classifier-free guidance: el peso λ se controla en inferencia mediante `--cfg-scale`.
- No soporta tool calling, function calling, agentes multi-paso, ni capacidades de audio o visión general fuera del pipeline robótico.

## Casos de uso
- Evaluación comparativa de cabezas de acción: usar los cuatro checkpoints con el mismo backbone y datos para medir el impacto aislado del diseño de la cabeza (discreta frente a continua) en una misma tarea, tal como plantea el artículo.
- Investigación en manipulación con RoboCasa365: reproducir los resultados del split `target` (50 tareas, 10 intentos cada una) con la semilla 7 y comparar con las cabezas pi0 publicadas en `iscoyizj/discrete-actions-pi0-robocasa`.
- Estudio de decodificación con flow matching: analizar el efecto de `--num-denoise-steps` (5, 10 o 20) y de `--cfg-scale` (0 o 3) sobre la tasa de éxito, usando DFlow y CFlow como casos discretos y continuos respectivamente.
- Base para fine-tuning en dominios de brazo único: al partir de `lerobot/pi05_base` y estar ajustado en una mezcla Franka, sirve como inicialización para tareas de manipulación con efector final relativo y rotación eje-ángulo.
- Análisis de robustez ante tareas compuestas: comparar el rendimiento en `atomic_seen`, `composite_seen` y `composite_unseen` para estudiar generalización composicional (por ejemplo, DFlow obtiene 148/180, 75/160 y 78/160).
- Docencia y divulgación sobre VLA: ilustrar el pipeline completo (tres cámaras, instrucción, estado, chunk de acciones) con pesos abiertos y estadísticas de normalización incluidas.
- Referencia para selección de cabeza en producción robótica: si se prioriza la tasa de éxito, DFlow es la opción con mejor resultado; si se prioriza latencia, CReg requiere una sola pasada sin guía.

## Benchmarks y rendimiento
Resultados en RoboCasa365, split `target`, 50 tareas × 10 intentos = 500 episodios, semilla de evaluación 7 (una sola semilla, sin desviación):

| Cabeza | Flags | Global | atomic_seen | composite_seen | composite_unseen |
|---|---|---|---|---|---|
| DFlow | `--cfg-scale 3 --num-denoise-steps 5` | 60,2% (301/500) | 148/180 | 75/160 | 78/160 |
| CFlow | `--cfg-scale 3 --num-denoise-steps 20` | 58,2% (291/500) | 148/180 | 69/160 | 74/160 |
| DReg | `--cfg-scale 3` | 55,8% (279/500) | 144/180 | 62/160 | 73/160 |
| CReg | `--cfg-scale 0` | 42,4% (212/500) | 117/180 | 39/160 | 56/160 |

Comparación con las cabezas pi0 en la misma semilla 7: DFlow 56,2%, CFlow 55,2%, DReg 51,2% y CReg 40,6%. El autor advierte que debe compararse con estos valores de semilla 7 y no con las medias de 3 semillas del artículo. Los checkpoints no se evaluaron en LIBERO. Cada fila corresponde a la mejor celda de una búsqueda en rejilla sobre pasos 110k–150k, guía 0 o 3 y, para las cabezas de flow, 5, 10 o 20 pasos de denoising.

## Requisitos de hardware
- VRAM estimada para inferencia: los pesos se publican en fp32 (13,2 GB por checkpoint); el loader los convierte a bf16, lo que reduce el peso a aproximadamente 6,6 GB, más el overhead del backbone PaliGemma-3B y las activaciones de tres imágenes de 224×224.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, una GPU con 16 GB o más debería acomodar un checkpoint en bf16, y para entrenamiento o evaluación por lotes se requerirían GPUs de数据中心 (A100, H100) sin dato confirmado.
- Cabe en GPU de consumo: previsiblemente en RTX 4090 (24 GB) y posiblemente en RTX 4080 (16 GB) en bf16, aunque no hay confirmación del autor.
- Opciones de despliegue: el autor menciona un paquete Python `discrete_actions` (aún no publicado) y el uso de `hf download`; no se citan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este pipeline robótico.
- Latencia y throughput: no disponibles. El coste depende del número de pasos de denoising (5, 10 o 20) y de si se aplica guía (una o dos pasadas por paso).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Resultado RoboCasa365 (semilla 7) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DFlow (este repo) | 2,92B + ~370M | instrucción 48 tokens | 60,2% | Gemma | Hugging Face |
| CFlow (este repo) | 2,92B + ~370M | instrucción 48 tokens | 58,2% | Gemma | Hugging Face |
| DReg (este repo) | 2,92B + ~370M | instrucción 48 tokens | 55,8% | Gemma | Hugging Face |
| CReg (este repo) | 2,92B + ~370M | instrucción 48 tokens | 42,4% | Gemma | Hugging Face |
| DFlow pi0 (`discrete-actions-pi0-robocasa`) | no disponible | no disponible | 56,2% | Gemma | Hugging Face |
| CFlow pi0 (`discrete-actions-pi0-robocasa`) | no disponible | no disponible | 55,2% | Gemma | Hugging Face |
| DReg pi0 (`discrete-actions-pi0-robocasa`) | no disponible | no disponible | 51,2% | Gemma | Hugging Face |
| CReg pi0 (`discrete-actions-pi0-robocasa`) | no disponible | no disponible | 40,6% | Gemma | Hugging Face |

No se dispone de datos de otros modelos comparables (por ejemplo, políticas VLA de otros autores en RoboCasa365) en la información proporcionada.

## Limitaciones y advertencias
- Solo brazo: las políticas son de brazo único y no pueden ejecutar movimiento de base; aproximadamente 17 de las 50 tareas de RoboCasa365 requieren desplazamiento de base y quedan fuera del alcance del modelo.
- Evaluación limitada: los resultados se basan en una única semilla de evaluación (7) y en el split `target`; no hay intervalos de confianza ni evaluación en LIBERO.
- Configuración de inferencia crítica: los valores de `config.json` no coinciden con los ajustes óptimos; es obligatorio pasar `--cfg-scale` y `--num-denoise-steps` manualmente, y el peso de guía se define como λ = `--cfg-scale` − 1.
- Tokenizador no incluido: el tokenizador de PaliGemma está tras un gate y debe descargarse por separado aceptando los términos de Gemma.
- Licencia Gemma: restringe el uso comercial y exige cumplir los términos de Google; no es una licencia permisiva tipo Apache o MIT.
- Riesgo de alucinación: no aplica en el sentido textual, pero el modelo puede generar acciones no válidas o inseguras fuera de la distribución de entrenamiento; requiere supervisión y límites de seguridad en un robot real.
- Idiomas: no hay información sobre cobertura multilingüe de las instrucciones; el entrenamiento se realizó sobre instrucciones de RoboCasa365, DROID y LIBERO-plus, predominantemente en inglés.
- Sesgos: no se documentan análisis de sesgo; el dataset mezcla entornos simulados y podría no transferir a configuraciones físicas distintas.
- Uso en producción: no hay código publicado (`discrete_actions` está pendiente), ni métricas de latencia, ni garantías de soporte; está orientado a investigación.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/iscoyizj/discrete-actions-pi05-robocasa
- Artículo: https://arxiv.org/abs/2610.20429
- Página del proyecto: https://iscoyizj.github.io/discrete-action-website/
- Cabezas pi0 (resultados principales): https://huggingface.co/iscoyizj/discrete-actions-pi0-robocasa
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Tokenizador PaliGemma (gated): https://huggingface.co/google/paligemma-3b-pt-224
- Términos de licencia Gemma: https://ai.google.dev/gemma/terms
