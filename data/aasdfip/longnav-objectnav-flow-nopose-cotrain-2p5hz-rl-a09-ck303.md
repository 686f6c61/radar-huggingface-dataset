# Aasdfip/longnav-objectnav-flow-nopose-cotrain-2p5hz-rl-a09-ck303

## Resumen

Este modelo es un adaptador LoRA (PEFT) que contiene exclusivamente el delta de aprendizaje por refuerzo (RL) aplicado sobre un modelo base ya fusionado, `Aasdfip/longnav-objectnav-flow-nopose-cotrain-2p5hz-merged`. Dicho modelo base es un sistema de navegación robótica orientada a objetos (ObjectNav) construido sobre `Qwen3-VL-2B-Instruct`, con un cabezal de acción basado en flow-matching (SDE) para control continuo en entornos simulados (Habitat, dataset HM3D). El adaptador fue entrenado mediante policy gradient sobre la cadena de denoising (estilo PPO) con el cabezal de acción congelado, permitiendo que los gradientes fluyan a través de él hacia el LoRA del backbone.

El resultado es una política que mejora la eficiencia de navegación (oracle SPL +25 % relativo) y el número de objetivos alcanzados (oracle success +0.045) respecto al baseline SFT, manteniendo idéntico el éxito bruto (0.554). Es relevante porque demuestra que el fine-tuning RL sobre un modelo VLA (vision-language-action) puede transferir habilidades de ejecución y aproximación a entornos no vistos, incluso con un conjunto de entrenamiento deliberadamente pequeño (24 episodios). La licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

El repositorio incluye los archivos del adaptador (`adapter/`), el cabezal de acción congelado (`turn_vector_head.pt`), su configuración y los archivos de tokenizador/preprocesador. El tamaño total del repositorio es de 0.6 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en Qwen3-VL-2B-Instruct con cabezal de acción flow-matching (SDE) y adaptador LoRA (r=128, alpha=256) |
| Parametros totales | no disponible (el modelo base es de 2B; el adaptador LoRA añade parámetros, pero su número exacto no se publica) |
| Parametros activos | no disponible (no se especifica si el modelo es MoE; se asume denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors, pero no se mencionan cuantizaciones) |
| Idiomas soportados | no disponible (el modelo base Qwen3-VL soporta múltiples idiomas, pero no se especifica para este adaptador) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA y cabezal de acción) |

## Arquitectura y entrenamiento

El modelo es un sistema de navegación robótica que combina un modelo de lenguaje y visión (Qwen3-VL-2B-Instruct) con un cabezal de acción basado en flow-matching. El flujo de trabajo es el siguiente: el modelo recibe observaciones visuales (RGB y posiblemente profundidad) y un objetivo textual (p. ej., "encuentra la silla"), y produce acciones de control continuo (velocidades lineales y angulares) a través del cabezal de acción. El adaptador LoRA se aplica sobre las capas del transformer del modelo base, mientras que el cabezal de acción permanece congelado durante el entrenamiento RL.

El entrenamiento RL utiliza un algoritmo de policy gradient sobre la cadena de denoising (flow-SDE), con exploración controlada (`a = 0.9`) y un anclaje KL al policy SFT (medido pero no restringido). El conjunto de entrenamiento es deliberadamente pequeño: 24 episodios sobre 4 escenas del split de entrenamiento de HM3D, lo que lo convierte en un diagnóstico de sobreajuste controlado. El entrenamiento duró ~300 ciclos con una tasa de aprendizaje de 2e-6. Los resultados en validación (sample400, 397 episodios puntuados) muestran generalización, ya que las escenas de validación son disjuntas de las de entrenamiento.

Una característica técnica destacable es que el adaptador RL se aplica sobre el modelo base fusionado (que ya contiene el LoRA SFT), y no sobre el modelo Qwen original. Esto garantiza que la evaluación se realice en condiciones cercanas a las del entrenamiento, evitando errores de redondeo que podrían alterar los resultados en episodios largos.

## Capacidades

- Navegación robótica orientada a objetos (ObjectNav) en entornos 3D simulados (Habitat, HM3D).
- Control continuo de movimiento (velocidades lineales y angulares) a partir de observaciones visuales y un objetivo textual.
- Toma de decisiones secuencial con horizonte de hasta 175 pasos (con `--max-steps 175`).
- Funciona sin inyección de pose (`--no-pose-injection`), lo que simplifica la integración en sistemas reales.
- Soporta evaluación con auto-stop (heurística del harness) y distancia de éxito configurable.
- No es un modelo de chat general; está especializado exclusivamente en navegación.
- No se documentan capacidades de tool calling, agentes o razonamiento multi-paso fuera del dominio de navegación.

## Casos de uso

- Simulación de navegación autónoma en entornos interiores: el modelo puede integrarse en pipelines de evaluación de ObjectNav en Habitat para medir el rendimiento de políticas VLA en escenarios con objetivos textuales.
- Entrenamiento y validación de políticas de navegación con RL: sirve como referencia para estudiar el efecto del fine-tuning RL sobre un modelo base SFT, especialmente en términos de eficiencia de trayectoria (SPL).
- Desarrollo de robots móviles con navegación basada en visión y lenguaje: aunque el modelo se evalúa en simulación, su arquitectura (VLA + flow-matching) es transferible a plataformas robóticas reales con sensores RGB-D.
- Benchmarking de generalización en navegación: dado que se entrenó con solo 24 episodios, es útil para analizar la capacidad de generalización de políticas RL a escenas no vistas.
- Investigación en aprendizaje por refuerzo para control continuo: el enfoque de policy gradient sobre la cadena de denoising (flow-SDE) puede estudiarse como caso de estudio para otros dominios.
- Evaluación de robustez ante perturbaciones del modelo base: el documento de la model card detalla cómo pequeñas diferencias en el redondeo pueden afectar episodios largos, lo que es útil para diseñar evaluaciones fiables.

## Benchmarks y rendimiento

La model card proporciona resultados sobre una muestra de 400 episodios de validación de HM3D (397 puntuados), comparando este checkpoint RL con el baseline SFT. Los resultados son los siguientes:

| Metrica | Este checkpoint | Baseline SFT | Delta |
|---|---|---|---|
| Oracle success | 0.695 | 0.650 | +0.045 |
| Oracle SPL | 0.500 | 0.401 | +0.099 |
| Success | 0.554 | 0.554 | 0.000 |
| SPL | 0.272 | 0.254 | +0.018 |
| Soft SPL | 0.316 | 0.291 | +0.025 |

La prueba de McNemar sobre oracle success da un valor p = 0.048, lo que indica significancia marginal. No se proporcionan resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el modelo no está diseñado para tareas de lenguaje general.

## Requisitos de hardware

No se especifican requisitos de hardware en la información proporcionada. Sin embargo, dado que el modelo base es Qwen3-VL-2B (2 mil millones de parámetros) y el adaptador es LoRA, se puede inferir que:

- VRAM estimada: para inferencia con el modelo completo (base + adaptador + cabezal de acción), se necesitaría al menos 4-6 GB de VRAM en FP16, dependiendo de la resolución de las imágenes de entrada y la longitud de la secuencia.
- GPU recomendadas: una GPU consumer como RTX 3060 (12 GB) o superior sería suficiente para ejecutar el modelo en simulación. Para entrenamiento RL, se requeriría más memoria (posiblemente 16-24 GB).
- El despliegue se realiza mediante el script `eval_objectnav_policy.py` incluido en el repositorio de código fuente (no se mencionan vLLM, Ollama u otros motores de inferencia estándar).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (VLA para ObjectNav con flow-matching y RL). El único punto de comparación directo es el baseline SFT del mismo autor, que se detalla en la tabla de benchmarks. Otros modelos de navegación como CLIP-Nav o VLN-BERT no son directamente comparables debido a diferencias en el entorno (Habitat vs. Matterport) y en el tipo de control (discreto vs. continuo). Por tanto, la comparativa se limita al baseline interno.

## Limitaciones y advertencias

- El modelo no tiene cabezal de parada (stop head) y no fue entrenado con bonus de éxito, por lo que su capacidad para detenerse en el objetivo es limitada; el éxito bruto (0.554) no mejora respecto al baseline SFT.
- El conjunto de entrenamiento RL es extremadamente pequeño (24 episodios), lo que limita la generalización a escenarios muy diferentes. Aunque los resultados en validación muestran mejoras, podrían no mantenerse en entornos más diversos.
- La evaluación es sensible a la semilla posicional de los episodios: aproximadamente el 40 % de los episodios cambian de resultado entre pasadas idénticas si el orden o el tamaño del conjunto de episodios varía. Para reproducir los resultados, es necesario usar exactamente la misma lista de 400 episodios en el mismo orden.
- Aplicar el adaptador sobre el modelo base sin fusionar (es decir, sobre Qwen3-VL-2B-Instruct directamente) produce puntuaciones casi nulas, ya que el adaptador contiene solo el delta RL y no el conocimiento SFT. Esto es un error común de uso.
- Existe una diferencia potencial entre evaluar el adaptador sobre el modelo base fusionado (condición de entrenamiento) y sobre el modelo base sin fusionar (con LoRA apilado). En episodios largos, pequeñas perturbaciones del redondeo pueden causar divergencias significativas en el resultado.
- No se documentan sesgos específicos, pero al ser un modelo entrenado en escenas de HM3D, puede tener un rendimiento degradado en entornos con distribuciones diferentes (p. ej., exteriores, edificios no residenciales).
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero el modelo puede interpretar incorrectamente objetivos ambiguos o producir trayectorias erráticas en situaciones no vistas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Aasdfip/longnav-objectnav-flow-nopose-cotrain-2p5hz-rl-a09-ck303
- Modelo base (fusionado): https://huggingface.co/Aasdfip/longnav-objectnav-flow-nopose-cotrain-2p5hz-merged
- Modelo SFT original: https://huggingface.co/Aasdfip/longnav-objectnav-flow-nopose-cotrain-2p5hz
