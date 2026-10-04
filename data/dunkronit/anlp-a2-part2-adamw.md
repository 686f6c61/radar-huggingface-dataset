# DunkRonit/anlp-a2-part2-adamw

## Resumen

DunkRonit/anlp-a2-part2-adamw es un transformer denso de tipo decoder-only entrenado desde cero, con 17.011.584 parámetros, publicado como parte de un ejercicio académico de la asignatura ANLP (Advanced Natural Language Processing) en IIIT Hyderabad. No se trata de un modelo de propósito general ni de un lanzamiento de producto: es un artefacto de experimentación cuyo objetivo es servir como punto de comparación entre optimizadores, en este caso un implementación propia de AdamW.

El modelo se entrenó sobre 41.680.896 tokens del split de entrenamiento del dataset browndw/human-ai-parallel-corpus, una única pasada (1x), y se distribuye únicamente en formato safetensors con un tamaño de repositorio de 0.1 GB. La model card no especifica la longitud de contexto, la composición detallada del corpus ni la licencia de uso, por lo que su utilidad práctica fuera del ámbito docente es muy limitada.

Su relevancia es, por tanto, metodológica y no competitiva: permite reproducir un experimento controlado de preentrenamiento a pequeña escala, inspeccionar el efecto del optimizador sobre una arquitectura conocida y disponer de un baseline ligero para pruebas de infraestructura. No debe considerarse un sustituto de modelos de 100 M de parámetros o superiores en ninguna tarea de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (solo decodificador) |
| Parametros totales | 17.011.584 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors en precision original) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tokens de entrenamiento | 41.680.896 (1x sobre el split de entrenamiento) |
| Dataset | browndw/human-ai-parallel-corpus |
| Optimizador | AdamW implementado desde cero |
| Tamano del repositorio | 0.1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe el modelo como un "dense decoder-only transformer pretrained from scratch", es decir, una arquitectura transformer estandar con atención completa y sin componentes de mezcla de expertos, recurrencia ni mecanismos de estado (no es MoE, SSM ni híbrida). No se detallan el número de capas, el número de cabezas de atención, la dimensión del modelo, la dimensionalidad del feed-forward ni la función de activación. Tampoco se especifica si se aplicaron técnicas como RoPE, atención lineal, decodificación especulativa o variantes de normalización (RMSNorm, LayerNorm pre/post).

En cuanto al entrenamiento, se realizó una única pasada sobre el split de entrenamiento del corpus browndw/human-ai-parallel-corpus, lo que arroja 41.680.896 tokens procesados. El elemento diferencial del experimento es el optimizador: un AdamW escrito desde cero, presumiblemente para compararlo con otras variantes dentro de la misma asignatura (el identificador "part2" sugiere una serie de experimentos paralelos). No hay evidencia de ajuste por RLHF, DPO, SFT posterior ni de ninguna fase de alineación. La model card no menciona innovaciones técnicas adicionales.

## Capacidades

- Generación de texto autoregresiva en inglés, condicionada a un prompt previo, con la calidad esperable de un modelo de 17 M de parámetros entrenado con 41,7 M de tokens.
- Modelado de lenguaje causal: la tarea para la que fue entrenado es la predicción del siguiente token.
- Carga programática mediante `src.part2.model.Transformer.from_pretrained("DunkRonit/anlp-a2-part2-adamw")` desde el repositorio de la asignatura.
- No hay evidencia de soporte de tool calling ni de function calling.
- No hay evidencia de capacidades de agente, razonamiento multi-paso, planificación ni uso de memoria externa.
- No hay evidencia de modo "thinking", razonamiento extendido ni cadena de pensamiento explícita.
- Capacidades multilingües: únicamente inglés según la etiqueta de idioma del repositorio; el resto de idiomas no están cubiertos de forma declarada.
- Sin visión, audio, vídeo ni entrada multimodal.

## Casos de uso

- Reproducción de experimentos de optimización: el modelo sirve como baseline controlado para comparar AdamW implementado desde cero frente a otras variantes (SGD con momentum, Adafactor, Lion) manteniendo fijos arquitectura, dataset y número de tokens. Es su propósito original y el escenario donde aporta valor real.
- Docencia y formación en preentrenamiento: permite a estudiantes inspeccionar pesos, curvas de pérdida y estados del optimizador de un transformer real sin necesidad de clústeres de GPU, ya que 17 M de parámetros caben en cualquier portátil.
- Pruebas de infraestructura y CI: al pesar aproximadamente 68 MB en fp32, es útil como modelo de humo ("smoke test") para validar pipelines de carga, tokenización, serialización safetensors y despliegue con vLLM o llama.cpp antes de escalar a modelos grandes.
- Investigación sobre curriculum y composición de datos: al estar entrenado sobre un corpus paralelo humano-IA, permite estudiar cómo un modelo pequeño modela la distribución de respuestas generadas por IA frente a las humanas.
- Generación de texto de baja exigencia con fines demostrativos: prototipos de interfaz, demos docentes o ejemplos de inferencia en tiempo real donde la fluidez no es crítica y prima la latencia mínima.
- Barrido de hiperparámetros a pequeña escala: al ser rápido de entrenar, es adecuado para explorar tasas de aprendizaje, schedulers y warmup antes de transferir la configuración a modelos mayores.
- Análisis de sesgos en corpus paralelos: se puede usar para medir qué patrones estilísticos del corpus humano-IA se aprenden incluso con 41,7 M de tokens, como ejercicio de auditoría metodológica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta el número de parámetros (17.011.584), los tokens de entrenamiento (41.680.896) y el enlace a la ejecución de Weights & Biases, sin incluir métricas de MMLU, HumanEval, GSM8K, HellaSwag, ARC ni perplejidad sobre conjuntos de validación.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 68 MB en fp32, 34 MB en fp16/bf16, 17 MB en int8 y 8,5 MB en int4 (cálculo teórico a partir de los 17.011.584 parámetros; no hay cifras publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Modelos como RTX 3060, RTX 4090, T4, A100 o H100 quedan enormemente sobredimensionados para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo de las últimas dos décadas, e incluso en GPUs integradas.
- Ejecución en CPU: totalmente viable; el modelo puede correr en CPU sin aceleración dedicada.
- Opciones de despliegue: el autor indica carga mediante el wrapper propio del repositorio de la asignatura (`src.part2.model.Transformer.from_pretrained`). Al distribuirse solo en safetensors y no existir conversiones publicadas a GGUF, no hay soporte directo documentado para llama.cpp, Ollama, vLLM ni TGI; sería necesario convertir los pesos manualmente.
- Latencia y throughput estimados: no disponibles. Al no haberse publicado mediciones, no se ofrecen cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| DunkRonit/anlp-a2-part2-adamw | 17.011.584 | no disponible | en | no disponible | safetensors | HuggingFace, 0 descargas |
| EleutherAI/pythia-14m | 14 M (aprox.) | 2048 | en | Apache 2.0 | safetensors | HuggingFace, ampliamente utilizado |
| openai-community/gpt2 (small) | 124 M | 1024 | en | modified MIT | safetensors / bin | HuggingFace, referencia histórica |

La comparación con Pythia-14m y GPT-2 small se ofrece únicamente como referencia de categoría (modelos pequeños de lenguaje en inglés); el autor no publica comparaciones ni métricas que permitan establecer una jerarquía de rendimiento frente a ellos. Cualquier afirmación sobre calidad relativa requeriría evaluar el modelo, cosa que la información disponible no permite.

## Limitaciones y advertencias

- Tamaño extremadamente reducido (17 M de parámetros) y presupuesto de entrenamiento muy bajo (41,7 M de tokens): la calidad de generación será muy inferior a la de cualquier modelo de uso común y producirá texto incoherente con frecuencia.
- Riesgo elevado de alucinación y de repetición de patrones; no es fiable para tareas factuales, matemáticas, código ni razonamiento.
- Sesgos conocidos: no se han documentado auditorías de sesgo. Al entrenarse sobre un corpus paralelo humano-IA sin filtrar, puede reproducir sesgos presentes en las generaciones de IA del dataset.
- Limitación de idioma: solo inglés declarado; no se garantiza comportamiento coherente en castellano ni en otros idiomas.
- Longitud de contexto desconocida: al no publicarse, no se puede planificar su uso en conversaciones multi-turno ni en documentos largos.
- Licencia no disponible: esto impide determinar si el uso comercial está permitido. En ausencia de licencia explícita, debe asumirse que no hay autorización clara para uso en producción.
- Origen académico: es un artefacto de asignatura, sin mantenimiento, sin versionado semántico ni garantías de soporte. No hay pipeline declarado, ni evaluaciones, ni documentación de sesgos.
- Dependencia de código propietario del repositorio de la asignatura para la carga: sin ese código, la integración requiere reconstruir el wrapper manualmente.
- Advertencia sobre la búsqueda web: los resultados obtenidos no guardan ninguna relación con el modelo (contenido sobre EA FC 27 y constructores de plantillas). No se ha localizado documentación externa, paper ni demo adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DunkRonit/anlp-a2-part2-adamw
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/dunkronit-iiit-hyderabad/anlp-a2-part2/runs/adamw-40cfbfa5
- Dataset de entrenamiento (referenciado en la model card): browndw/human-ai-parallel-corpus
- Repositorio de la asignatura con el código de carga (`src.part2.model.Transformer`): referencia mencionada en la model card, sin URL pública disponible
- Paper, blog o demo oficial: no disponible
- Resultados de busqueda web: no relevantes (contenido ajeno al modelo, sobre EA SPORTS FC 27)
