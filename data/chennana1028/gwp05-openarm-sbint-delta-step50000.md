# chennana1028/gwp05-openarm-sbint-delta-step50000

## Resumen

GigaWorld-Policy-0.5 · SBInt OpenArm **delta** es un fine-tuning del modelo de mundo-acción GigaWorld-Policy-0.5 sobre el conjunto de datos SBInt openarm002, compuesto por 873 episodios de teleoperación con un brazo robótico OpenArm de 7 grados de libertad. El modelo se publica como checkpoint intermedio (paso 50000) y se diferencia de su hermano absoluto (`step20000`) en la semántica de las acciones: las articulaciones se predicen como delta (diferencia respecto al estado inicial del chunk), mientras que las pinzas se predicen en valor absoluto. Esta representación reduce el error medio absoluto (MAE) en evaluación open-loop de 0.0201 a 0.0101 y la proporción de costuras (seam ratio) de 5.14x a 2.25x, lo que indica una notable mejora en la consistencia temporal de las trayectorias generadas.

El modelo emplea una arquitectura `CasualWorldActionTransformer_MoT` (probablemente una variante de Mixture of Transformers) con 16 canales de acción y se apoya en un VAE de Wan Diffusers como codificador visual. Está entrenado con datos en formato LeRobot v3 y su repositorio incluye las estadísticas de normalización específicas para la representación delta (`norm_stats_sbint_delta.json`), imprescindibles para una inferencia correcta. Aunque aún no se han realizado pruebas en robot real, los resultados open-loop lo posicionan como un candidato sólido para políticas de manipulación con hardware open-source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CasualWorldActionTransformer_MoT (Mixture of Transformers, basado en GigaWorld-Policy-0.5) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (ejemplo de carga usa `torch.bfloat16`) |
| Idiomas soportados | no disponible (modelo de robotica, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `diffusion_pytorch_model.bin` (PyTorch), `config.json`, `norm_stats_sbint_delta.json` |

## Arquitectura y entrenamiento

El modelo se basa en GigaWorld-Policy-0.5, un modelo de mundo-acción que combina un transformer causal con un VAE de Wan Diffusers para procesar observaciones visuales. La variante aquí publicada usa una arquitectura `CasualWorldActionTransformer_MoT` con 16 canales de acción (7 articulaciones + 1 pinza + 7 articulaciones + 1 pinza, empaquetado left-first). La innovación principal es el cambio de semántica de acción: las articulaciones se representan como delta respecto al estado inicial del chunk (`action - state[chunk_start]`), mientras que las pinzas se mantienen en valor absoluto. Esto se controla mediante `delta_mask = [True]*7 + [False] + [True]*7 + [False]`.

El entrenamiento se realizó en dos trabajos Slurm sobre 2×8 H100 (16 GPUs en total), con un batch efectivo de 128 y 50000 pasos. La pérdida de acción final fue de aproximadamente 0.008. Los datos provienen de `/lustre/.../gwp_sbint/sbint_openarm_v30` en formato LeRobot v3. Se utilizó el código base de [giga-world-policy](https://github.com/zhujohn9604/giga-world-policy) y las estadísticas de normalización delta se incluyen en el repositorio para evitar errores de escala (mezclar con las estadísticas absolutas produce errores ~10x).

## Capacidades

- Generación de acciones de robot para un brazo de 7 DOF con pinza (16 dimensiones) a partir de observaciones visuales.
- Representación delta para articulaciones y absoluta para pinzas, lo que reduce la deriva temporal en trayectorias largas.
- Evaluación open-loop con métricas de MAE y seam ratio (proporción de discontinuidades entre chunks).
- Integración con el ecosistema LeRobot v3 para carga y preprocesado de datos.
- Carga mediante `from_pretrained` con `torch_dtype=torch.bfloat16` desde la librería `world_action_model`.
- Soporte de script de evaluación open-loop (`scripts/open_loop_sbint_ep.py`) con modo `--action-mode delta`.

## Casos de uso

- Aprendizaje por imitación para manipulación robótica: el modelo puede generar trayectorias de articulaciones a partir de demostraciones humanas teleoperadas, gracias a su representación delta que mejora la consistencia entre segmentos.
- Evaluación reproducible de políticas en entornos estandarizados: al ser compatible con OpenArm Cell (una celda de evaluación que fija fondo, iluminación, cámaras y posición del brazo), permite comparar modelos de forma justa y verificable.
- Desarrollo de políticas generalistas para brazos humanoides de bajo coste: OpenArm es un hardware open-source de 7 DOF con alta retroconducción, ideal para investigación en entornos de contacto.
- Planificación de movimientos con modelo de mundo: al ser un world-action model, puede predecir secuencias de acciones y estados, útil para planificación a corto plazo en tareas de ensamblaje o manipulación.
- Investigación en representaciones de acción: el checkpoint delta sirve como referencia para estudiar el impacto de la representación relativa vs absoluta en la calidad de las trayectorias generadas.
- Benchmarking de modelos de mundo-acción: los resultados open-loop (MAE, seam ratio) permiten comparar rápidamente diferentes variantes de entrenamiento sin necesidad de despliegue físico.

## Benchmarks y rendimiento

El autor proporciona resultados de evaluación open-loop en el episodio 740, comparando este checkpoint delta con el hermano absoluto:

| Checkpoint | MAE | Seam ratio |
|---|---|---|
| abs step20000 | 0.0201 | 5.14x |
| **delta step50000** | **0.0101** | **2.25x** |

No se han publicado resultados en otros benchmarks estándar (como los usados en NLP o visión) porque se trata de un modelo de robótica especializado. La comparación con el modelo absoluto muestra una mejora del 49.8% en MAE y una reducción del 56.2% en seam ratio.

## Requisitos de hardware

- Entrenamiento: se utilizaron 2×8 H100 (16 GPUs) durante 50000 pasos. No se especifica el tiempo total.
- Inferencia: no se documentan requisitos específicos. Dado que el modelo usa un VAE de Wan Diffusers y el tamaño del repositorio es de 24.1 GB, se recomienda una GPU con al menos 24 GB de VRAM para cargar los pesos en bfloat16. No se confirma si cabe en GPUs de consumo como RTX 4090.
- Opciones de despliegue: la carga se realiza mediante la librería `world_action_model` con `from_pretrained`. No se mencionan integraciones con vLLM, llama.cpp u Ollama (al ser un modelo de robótica, no de lenguaje).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparación directa solo es posible con el checkpoint hermano absoluto del mismo autor, ya que no se dispone de información sobre otros modelos de mundo-acción para OpenArm.

| Modelo | Representación | MAE (open-loop) | Seam ratio | Pasos | Licencia |
|---|---|---|---|---|---|
| gwp05-openarm-sbint-step20000 | absoluta | 0.0201 | 5.14x | 20000 | no disponible |
| **gwp05-openarm-sbint-delta-step50000** | **delta** | **0.0101** | **2.25x** | **50000** | **no disponible** |

No se dispone de datos de otros modelos comparables en la misma categoría.

## Limitaciones y advertencias

- No se ha realizado comparación en robot real (el autor indica "Real-robot comparison not done yet").
- El modelo solo se ha entrenado con 873 episodios de un único conjunto de datos (SBInt openarm002), lo que limita su generalización a otras configuraciones o tareas.
- Es imprescindible usar las estadísticas de normalización delta (`norm_stats_sbint_delta.json`) incluidas en el repositorio; mezclarlas con las absolutas produce errores de escala de aproximadamente 10x.
- La licencia no está especificada, por lo que se desconoce si es apta para uso comercial.
- Al ser un modelo de difusión, la inferencia puede ser lenta en comparación con políticas de una sola pasada, y no se documentan tiempos de latencia.
- El nombre de la arquitectura contiene una errata ("Casual" en lugar de "Causal"), lo que podría indicar documentación incompleta.
- No se proporcionan detalles sobre el preprocesado visual (cámaras, resolución, etc.) más allá de la mención al VAE de Wan Diffusers.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chennana1028/gwp05-openarm-sbint-delta-step50000
- Checkpoint hermano absoluto: https://huggingface.co/chennana1028/gwp05-openarm-sbint-step20000
- Código base GigaWorldPolicy: https://github.com/zhujohn9604/giga-world-policy
- Hardware OpenArm (enactic): https://github.com/enactic/openarm
- OpenArm Cell (evaluación reproducible): https://openarm.dev/
- Hardware OpenArm (remake open-source): https://github.com/OpenArmRobot/OpenARM
