# gargrohin/flux3-action-robotwin-aloha-mix200

## Resumen

FLUX 3 Action (fine-tune RoboTwin 2.0, aloha_agilex, mix200) es una política robótica derivada de `black-forest-labs/flux-3-action-base`, el modelo base de acción de Black Forest Labs construido sobre la arquitectura FLUX 3. El autor, gargrohin, lo ha ajustado mediante fine-tuning completo sobre las 50 tareas del benchmark RoboTwin 2.0 para el robot bimanual `aloha_agilex`, prediciendo posiciones articulares absolutas de 14 dimensiones (7 por brazo, incluyendo pinzas) a partir de tres cámaras (cabeza y ambas muñecas) y una instrucción en lenguaje natural.

El modelo resuelve el problema de control visuomotor bimanual en entornos manipulativos con alta variabilidad visual: mesas desordenadas, fondos aleatorios, iluminación y altura de mesa variables, y reformulaciones de instrucciones no vistas. Con 6.947.132.672 parámetros en bf16 (13,9 GB de repo), es un modelo de gran tamaño para robótica, lo que lo sitúa en la gama de políticas fundacionales tipo DiT con decodificación por difusión.

Su relevancia radica en los resultados reportados: 75,6 % de éxito en escenarios aleatorizados (1.015 escenas) y 77,8 % en limpios (499 escenas), superando ampliamente a GR00T N1.7 (45,3 % y 45,5 %) con los mismos datos de entrenamiento (mix200). Queda por debajo de Cosmos3-Nano (87,1 % / 88,4 %), aunque este último se entrenó con mix500, el doble de datos aleatorizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) sobre FLUX 3 Action, con cabezas de acción; incluye VAE de vídeo y codificador de texto congelados (no incluidos en el repo) |
| Parametros totales | 6.947.132.672 (6,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; usa instrucción de tarea + 3 cámaras + estado de 14 articulaciones) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible (instrucciones en lenguaje natural; idioma de entrenamiento no especificado) |
| Licencia | FLUX Kommunity License (uso no comercial) |
| Formato de pesos | safetensors (bf16) + config.json + manifest.json con sha256 |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de `black-forest-labs/flux-3-action-base`, una política basada en Diffusion Transformer (DiT) que genera secuencias de acciones mediante difusión. La predicción se realiza sobre 32 acciones por llamada (chunks de 32), a 15 fps, en forma de posiciones articulares absolutas de 14 dimensiones. La entrada combina tres cámaras (cabeza y ambas muñecas) dispuestas según el layout DROID de BFL con un canvas de 544 × 736, el estado de 14 articulaciones y la instrucción de tarea. El VAE de vídeo y el codificador de texto están congelados y no se distribuyen en el repo; `config.json` apunta al repo base con acceso restringido (`gated`) en la revisión `99bc185b`.

El entrenamiento usó mix200: por cada una de las 50 tareas, 50 demostraciones limpias y 200 aleatorizadas de RoboTwin 2.0, totalizando 12.500 episodios. Se aplicó la receta de fine-tune completo DROID de BFL (learning rates, optimizador, pesos de pérdida y EMA sin cambios) con batch 512, en dos fases: actualizaciones 0–3.000 con schedule escalado a 1/10 (tronco congelado durante 100 actualizaciones, warm-ups de 200/100 y cool-down de 2.500 a 3.000), y actualizaciones 3.000–9.000 reanudadas desde el estado completo, con re-warm-up, learning rate pico constante y cool-down lineal de 8.000 a 9.000. Se publican los pesos EMA (tasa 0,10) en la actualización 9.000.

## Capacidades

- Control visuomotor bimanual: genera 32 acciones de posición articular absoluta (14 dimensiones, incluyendo pinzas) por llamada a partir de tres cámaras.
- Seguimiento de instrucciones en lenguaje natural para seleccionar la tarea entre las 50 de RoboTwin 2.0.
- Robustez a variaciones visuales: fondos aleatorios, iluminación, altura de mesa y mesas desordenadas.
- Generalización a reformulaciones de instrucciones no vistas (evaluado en el conjunto aleatorizado).
- Ejecución de tareas de manipulación de largo horizonte mediante chunks de 32 acciones a 15 fps.
- Inferencia por difusión con UniPC (4 pasos, shift 5,0, guidance 4,0 en vídeo y 1,0 en acciones).
- No soporta tool calling, function calling, agentes multi-paso ni modalidades de audio; no es un modelo de lenguaje general.

## Casos de uso

- Manipulación bimanual en laboratorio: el modelo ejecuta las 50 tareas de RoboTwin 2.0 sobre `aloha_agilex`, sirviendo como política de referencia para comparar nuevas arquitecturas con el mismo protocolo de evaluación.
- Evaluación comparativa de políticas fundacionales: al compartir escenas y semillas con GR00T N1.7, permite reproducir comparaciones controladas (mismas 1.015 escenas aleatorizadas y 499 limpias) con el script oficial de RoboTwin.
- Investigación en robustez visual: su entrenamiento con 200 demostraciones aleatorizadas por tarea lo hace adecuado para estudiar la degradación ante cambios de iluminación, fondo y altura de mesa en entornos simulados.
- Transferencia a robots reales tipo ALOHA: la predicción de posiciones articulares absolutas de 14 dimensiones encaja con la morfología de brazos duales con pinzas, lo que facilita el despliegue en plataformas ALOHA/AgileX reales tras el ajuste correspondiente.
- Generación de datos sintéticos de trayectorias: puede usarse para producir rollouts en simulación que alimenten pipelines de aprendizaje por imitación o de refuerzo sin necesidad de teleoperación adicional.
- Estudio de generalización a instrucciones: útil para medir la sensibilidad de políticas visuomotoras a reformulaciones del lenguaje natural, dado que la evaluación aleatorizada incluye redacciones no vistas.
- Base para fine-tuning en tareas específicas: al ser un fine-tune completo sobre FLUX 3 Action, sirve como punto de partida para dominios concretos con menos datos, reutilizando la receta DROID documentada.

## Benchmarks y rendimiento

Evaluación sobre las 50 tareas de RoboTwin 2.0, con las semillas de evaluación de GR00T N1.7 reproducidas semilla a semilla y el script oficial de RoboTwin:

| Modelo | Datos de entrenamiento | Aleatorizado (1.015 escenas) | Limpio (499 escenas) |
|---|---|---|---|
| Este modelo (FLUX 3 Action, update 9.000) | mix200 | 75,6 % | 77,8 % |
| Cosmos3-Nano, iteración 6.000 | mix500 | 87,1 % | 88,4 % |
| GR00T N1.7 | mix200 | 45,3 % | 45,5 % |

Los resultados por tarea están en `notes/results.md` del repositorio. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 13,9 GB; sumando el VAE de vídeo y el codificador de texto del repo base (no incluidos), se requiere una GPU con al menos 24 GB para bf16 y margen para activaciones y buffers de difusión.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; GPUs con menos VRAM requerirían cuantización no documentada por el autor.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bf16, siempre que se gestionen con cuidado las activaciones; no se documenta soporte para GPUs de 16 GB o menos.
- Opciones de despliegue: `FluxActionPolicy.from_pretrained(..., device="cuda")` del paquete `flux-action`; para reproducción en RoboTwin, adaptador XPolicyLab y `flux3/eval.sh` del repo de código. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- Latencia y throughput: no disponibles; la inferencia usa UniPC con 4 pasos y ejecuta los 32 acciones por llamada, pero no se publican tiempos medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento (aleatorizado / limpio) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (FLUX 3 Action mix200) | 6,9B | 3 cámaras + estado 14D + instrucción | 75,6 % / 77,8 % | FLUX Kommunity (no comercial) | Hugging Face, repo 13,9 GB |
| Cosmos3-Nano (iteración 6.000) | no disponible | no disponible | 87,1 % / 88,4 % | no disponible | Hugging Face (gargrohin/cosmos3-nano-robotwin-aloha-mix500) |
| GR00T N1.7 | no disponible | no disponible | 45,3 % / 45,5 % | no disponible | no disponible en la información |

Cosmos3-Nano supera a este modelo en ambas métricas, pero con el doble de datos aleatorizados (mix500 frente a mix200), por lo que la comparación no es equivalente en presupuesto de datos. GR00T N1.7, con los mismos datos, queda muy por debajo.

## Limitaciones y advertencias

- Licencia FLUX Kommunity: uso no comercial; cualquier despliegue comercial requiere licencia aparte de Black Forest Labs.
- No es un producto oficial de Black Forest Labs ni está respaldado por la compañía; es una versión modificada (ver `NOTICE`).
- Requiere acceso al repo restringido `black-forest-labs/flux-3-action-base` (revisión `99bc185b`) para cargar el VAE de vídeo y el codificador de texto, que no se distribuyen.
- Entrenado exclusivamente en simulación (RoboTwin 2.0) sobre `aloha_agilex`; el rendimiento en robots reales no está documentado y requeriría ajuste y validación.
- Limitado a las 50 tareas de RoboTwin 2.0 y al idioma de las instrucciones de entrenamiento (no especificado); no generaliza a tareas fuera de ese conjunto sin fine-tuning.
- Riesgo de fallo en escenarios fuera de distribución: los propios resultados muestran una caída del 2,2 % en escenarios aleatorizados frente a limpios, y tareas individuales pueden degradarse más (ver `notes/results.md`).
- Sin datos publicados sobre sesgos, alucinación (no aplica en el sentido de LLM) ni comportamiento ante instrucciones ambiguas.
- Sin benchmarks de latencia ni throughput, lo que dificulta estimar requisitos de control en tiempo real.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gargrohin/flux3-action-robotwin-aloha-mix200
- Repositorio de código (entrenamiento, evaluación y análisis): https://github.com/gargrohin/robotwin-posttrain
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-action-base
- Código de flux-action de BFL: https://github.com/black-forest-labs/flux-action
- Modelo comparable Cosmos3-Nano: https://huggingface.co/gargrohin/cosmos3-nano-robotwin-aloha-mix500
