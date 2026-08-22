# jhelsby/OvDSGG

## Resumen

OvDSGG (Open-Vocabulary Dynamic Scene Graph Generation) es un modelo de visión por computador desarrollado por John Helsby, aceptado en el ECCV 2026 Contextus Workshop. Es el primer framework end-to-end para generación de grafos de escena dinámicos con vocabulario abierto, es decir, capaz de detectar y relacionar objetos en secuencias de video sin estar limitado a un conjunto cerrado de categorías predefinidas. El modelo integra dos arquitecturas previas: OvSGTR, un generador de grafos de escena espaciales de vocabulario abierto, y OED, un generador de grafos de escena dinámicos de conjunto cerrado. OvSGTR actúa como extractor de características espaciales y sus salidas alimentan el módulo de enrutamiento temporal de OED.

El modelo se entrena y evalúa sobre el dataset Action Genome, que contiene anotaciones de relaciones entre objetos en video. La propuesta introduce dos módulos clave: un módulo de extracción de características de tripletes que conecta el backbone espacial con el temporal, y un módulo de alineación visual-lenguaje que aprende un límite de decisión adaptativo en el espacio conjunto de características visuales y textuales, evitando así los costosos modelos de lenguaje preentrenados que suelen emplearse en sistemas de vocabulario abierto. El repositorio incluye checkpoints para las variantes de conjunto cerrado y de vocabulario abierto, tanto para la etapa espacial como para la temporal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: extractor espacial OvSGTR (Swin-T) + módulo temporal OED con enrutamiento temporal |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, procesa secuencias de frames) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo visual, no textual) |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoints PyTorch (.pth) |

## Arquitectura y entrenamiento

OvDSGG combina dos arquitecturas existentes. Por un lado, OvSGTR proporciona el backbone espacial: un transformer basado en Swin-T que extrae características de objetos y relaciones en cada frame de forma independiente, con capacidad de vocabulario abierto gracias a su alineación con espacio de texto. Por otro lado, OED (One-stage Dynamic Scene Graph Generation) aporta el módulo temporal, que procesa las características espaciales a lo largo del tiempo mediante un mecanismo de enrutamiento temporal para modelar las dependencias entre frames. La conexión entre ambos se realiza mediante un módulo de extracción de características de tripletes, que agrega las predicciones espaciales de pares de objetos y sus predicados antes de pasarlas al módulo temporal.

El entrenamiento se realiza en dos etapas: primero se entrena el módulo espacial (OvSGTR) sobre el dataset Action Genome, y después se entrena el módulo temporal sobre el mejor checkpoint espacial. Existen dos variantes de entrenamiento: una de conjunto cerrado, que parte del checkpoint preentrenado de OvSGTR en Visual Genome, y otra de vocabulario abierto, que parte del checkpoint OvD+R-SGG de OvSGTR. El modelo introduce además un módulo de alineación visual-lenguaje que aprende un límite de decisión adaptativo en el espacio conjunto de características, lo que permite preservar la capacidad de reconocimiento de vocabulario abierto sin necesidad de incorporar un modelo de lenguaje preentrenado durante la inferencia, reduciendo así el coste computacional respecto a enfoques multi-etapa.

## Capacidades

- Generación de grafos de escena dinámicos: detecta objetos, sus atributos y las relaciones entre ellos a lo largo de secuencias de video.
- Vocabulario abierto: puede reconocer categorías de objetos y predicados no vistos durante el entrenamiento, gracias a la alineación visual-lenguaje.
- Detección de objetos en video: localiza y clasifica objetos en cada frame.
- Predicción de relaciones temporales: modela cómo cambian las relaciones entre objetos a lo largo del tiempo.
- Evaluación con Zero-Shot Recall (zR@K): métrica específica para medir el rendimiento en categorías no vistas.
- Entrenamiento y evaluación en Action Genome: dataset con anotaciones densas de relaciones en video.

## Casos de uso

- Vigilancia y análisis de seguridad: el modelo puede detectar y seguir relaciones entre personas y objetos en secuencias de video de cámaras de vigilancia, identificando comportamientos anómalos como interacciones no esperadas entre individuos o con objetos.
- Robótica y navegación autónoma: un robot puede usar OvDSGG para comprender la escena dinámica que lo rodea, identificando objetos y sus relaciones cambiantes (por ejemplo, "persona coge taza") para planificar acciones de manipulación o navegación.
- Análisis de video deportivo: permite etiquetar automáticamente las interacciones entre jugadores y balón, generando grafos de escena que describen jugadas y facilitan el análisis táctico.
- Moderación de contenido en video: puede detectar relaciones inapropiadas entre personas y objetos en contenido generado por usuarios, ayudando a filtrar material que viole políticas de plataforma.
- Asistencia a personas con discapacidad visual: al generar descripciones estructuradas de lo que ocurre en un video, el modelo puede alimentar sistemas de narración automática que describan la escena en tiempo real.
- Investigación en visión por computador: sirve como baseline y punto de partida para estudiar la generación de grafos de escena dinámicos con vocabulario abierto, un área con escasos trabajos previos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artículo en arXiv (2608.14835) presenta comparaciones contra tres variantes baseline construidas por los autores (una adaptación de OED de vocabulario abierto en sus formas espacial y temporal, y OvSGTR como baseline espacial), pero no se incluyen los valores numéricos en la documentación accesible.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repositorio es de 6.2 GB, lo que sugiere que los checkpoints ocupan varios gigabytes, pero no se especifica la memoria necesaria para inferencia.
- GPU recomendadas: no disponible. Dado que procesa secuencias de video y usa un backbone Swin-T, es probable que requiera al menos una GPU con 16 GB de VRAM (por ejemplo, RTX 4080 o superior), pero no hay confirmación oficial.
- Compatibilidad con GPU de consumo: no confirmado. El modelo está implementado en PyTorch y podría ejecutarse en GPUs de consumo si se reduce el tamaño de lote o se usa precisión mixta, pero no hay documentación al respecto.
- Opciones de despliegue: no se mencionan herramientas específicas como vLLM u Ollama. El repositorio proporciona scripts de evaluación en Python, por lo que el despliegue se haría mediante PyTorch estándar.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No existen modelos comparables publicados de generación de grafos de escena dinámicos con vocabulario abierto, según el propio artículo. Los autores construyen tres baselines a partir de adaptaciones de OED y OvSGTR:

| Modelo | Tipo | Vocabulario | Dinámico | Notas |
|---|---|---|---|---|
| OvDSGG | End-to-end | Abierto | Sí | Propuesta principal |
| OED (adaptado) | One-stage | Cerrado (adaptado a abierto) | Sí | Baseline construido por los autores |
| OvSGTR | Transformer espacial | Abierto | No | Baseline espacial, sin componente temporal |

No se dispone de datos cuantitativos de rendimiento para comparar.

## Limitaciones y advertencias

- Requiere Python 3.9 específicamente, lo que puede limitar la compatibilidad con entornos modernos.
- El entrenamiento se realiza en dos etapas (espacial y temporal), lo que implica un proceso más complejo que un entrenamiento conjunto directo.
- El modelo está diseñado para el dataset Action Genome; su generalización a otros dominios de video no está verificada.
- Al ser un modelo de vocabulario abierto, puede presentar alucinaciones en la predicción de relaciones no vistas, especialmente si el límite de decisión adaptativo no está bien calibrado.
- No se proporcionan métricas de rendimiento publicadas, por lo que es difícil evaluar su calidad relativa frente a otros enfoques.
- La licencia Apache-2.0 permite uso comercial, pero los pesos preentrenados de OvSGTR (que se usan como inicialización) pueden tener sus propias restricciones; conviene revisar las licencias de los modelos base.
- El repositorio no incluye documentación sobre requisitos de hardware ni tiempos de inferencia, lo que dificulta la planificación de despliegues en producción.

## Enlaces

- [HuggingFace: jhelsby/OvDSGG](https://huggingface.co/jhelsby/OvDSGG)
- [arXiv: 2608.14835](https://arxiv.org/abs/2608.14835)
- [Artículo HTML en arXiv](https://arxiv.org/html/2608.14835v1)
- [GitHub: jhelsby/OvDSGG](https://github.com/jhelsby/OvDSGG)
- [Repositorio OED (original)](https://github.com/guanw-pku/OED)
- [Repositorio OvSGTR (original)](https://github.com/gpt4vision/OvSGTR/)
- [Adaptación de OED para vocabulario abierto](https://github.com/jhelsby/oed)
- [Adaptación de OvSGTR para DSGG](https://github.com/jhelsby/OvSGTR)
- [Toolkit de Action Genome](https://github.com/JingweiJ/ActionGenome)
