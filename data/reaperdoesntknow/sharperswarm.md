# reaperdoesntknow/SharperSwarm

## Resumen

SharperSwarm es un modelo de lenguaje causal de 103 millones de parámetros desarrollado por reaperdoesntknow (Roy C), investigador independiente especializado en modelos open-weight de pequeño tamaño y evaluación adversaria. El modelo integra dinámicas de inteligencia de enjambre con la arquitectura transformer, tratando la cognición como un sistema adaptativo donde múltiples agentes internos colaboran mediante routing diferenciable, mecanismos de confianza y memoria compartida. Según la model card, corresponde a la versión SAGI V3.2, que incorpora una capa de autoevaluación capaz de predecir el rendimiento del modelo, identificar carencias de habilidades y diseñar currículos de aprendizaje autónomos.

El modelo se presenta como un prototipo de investigación experimental, no destinado a producción, y su relevancia radica en explorar arquitecturas alternativas basadas en sistemas multiagente dentro de un transformer estándar. Entrenado sobre una combinación de datasets públicos como TinyStories, GSM8K, General-Knowledge, DeepCoder-Preview y KnowLogic, el modelo está orientado a tareas de generación de texto, razonamiento, matemáticas y código, aunque su tamaño reducido limita sus capacidades frente a modelos de mayor escala. El autor indica que existe una versión más reciente denominada reaperdoesntknow/CasualSwarms.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swarm-8 V3.2 (transformer causal con dinámicas de enjambre, capa de autoevaluación, núcleo AGI con 7 subsistemas y núcleo swarm con 20 agentes) |
| Parametros totales | 103.177.597 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no especificado (el repositorio indica fp32 y cpu) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura Swarm-8 V3.2 se basa en un transformer causal estándar al que se le añaden tres capas adicionales: una capa de autoevaluación (Self-Assessment Layer) que predice la probabilidad de éxito, detecta errores en tiempo real y genera currículos de aprendizaje; un núcleo AGI compuesto por siete subsistemas (memoria jerárquica, modelo de mundo causal, meta-aprendiz, biblioteca de conceptos, motor de reflexión, razonador de incertidumbre y auto-juego adversarial); y un núcleo swarm con veinte agentes vectorizados que colaboran mediante routing diferenciable y activación basada en confianza. La model card describe un flujo de decisión en cinco pasos: pre-evaluación, ejecución, monitorización en tiempo real, post-evaluación y aprendizaje.

El entrenamiento se realizó sobre una combinación de datasets públicos: TinyStories (generación narrativa), GSM8K (razonamiento matemático), General-Knowledge (conocimiento general), DeepCoder-Preview (generación de código) y KnowLogic (razonamiento lógico). No se especifica el número total de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO. El modelo se distribuye en precisión fp32 y está etiquetado como compatible con CPU. La model card menciona capacidades de tool-use con sandbox de Python, aunque no se detalla su implementación.

## Capacidades

- Generación de texto en ingles: produce respuestas coherentes para prompts conversacionales y narrativos.
- Razonamiento matemático básico: entrenado con GSM8K, puede resolver problemas aritméticos y de razonamiento sencillos.
- Generación de código simple: entrenado con DeepCoder-Preview, puede generar fragmentos de código en lenguajes comunes.
- Razonamiento lógico: entrenado con KnowLogic, aborda tareas de deducción y clasificación.
- Autoevaluación y meta-cognición: según la model card, el modelo predice su propio rendimiento y detecta errores durante la generación.
- Tool-use declarado: la model card menciona ejecución de código en sandbox de Python, aunque no se verifica su funcionamiento real.
- Conocimiento general: entrenado con General-Knowledge, responde preguntas factuales básicas.
- No soporta vision, audio ni multimodalidad.
- No soporta lenguajes distintos del ingles.

## Casos de uso

- Investigacion academica sobre arquitecturas multiagente: el modelo sirve como banco de pruebas para estudiar dinámicas de enjambre dentro de transformers, permitiendo a investigadores analizar el comportamiento de routing diferenciable y mecanismos de confianza en un entorno controlado.
- Prototipado rapido de agentes conversacionales: gracias a su pequeño tamaño y compatibilidad con CPU, puede desplegarse localmente para experimentar con sistemas de chat básicos en ingles.
- Educacion en IA generativa: estudiantes y desarrolladores pueden examinar el código y los pesos para comprender cómo se implementan capas de autoevaluación y sistemas multiagente en un modelo real.
- Generacion de historias cortas: entrenado con TinyStories, es adecuado para crear cuentos infantiles y narrativas breves en ingles.
- Razonamiento matematico simple: puede utilizarse en entornos educativos para generar problemas aritméticos y sus soluciones paso a paso.
- Experimentacion con tool-use y agentes: la model card declara capacidades de ejecución de código en sandbox, lo que permite probar pipelines de agentes que llaman herramientas externas.
- Evaluacion de seguridad y red-teaming: dado el perfil del autor, el modelo puede emplearse para probar técnicas de jailbreak y robustez frente a prompts adversariales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de rendimiento (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. Se desconoce el rendimiento real del modelo en tareas estandarizadas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 400 MB en fp32 (103 millones de parámetros a 4 bytes por parámetro). En cuantización de 8 bits, alrededor de 100 MB.
- GPU recomendadas: cualquier GPU moderna con al menos 1 GB de VRAM (GTX 1050 Ti, RTX 2060, etc.). También es viable en CPU gracias a su etiqueta "cpu" y fp32.
- Cabe en GPU de consumo: sí, incluso en las más modestas.
- Opciones de despliegue: transformers (PyTorch), vLLM, llama.cpp (si se convierte a GGUF), Ollama, TGI.
- Latencia y throughput: no se han publicado mediciones. Para un modelo de 103M en fp32, se espera una latencia de decenas de milisegundos por token en GPU y de cientos de milisegundos en CPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SharperSwarm | 103M | no disponible | Apache 2.0 | safetensors | Arquitectura experimental con capas de enjambre y autoevaluación |
| GPT-2 (124M) | 124M | 1024 tokens | MIT | safetensors | Modelo de referencia de OpenAI, sin capacidades multiagente |
| Qwen2-0.5B | 494M | 32k tokens | Apache 2.0 | safetensors | Modelo generalista de Alibaba, con mejor soporte multilingüe |
| TinyLlama-1.1B | 1.1B | 2048 tokens | Apache 2.0 | safetensors | Modelo compacto de 1.1B entrenado en 3T tokens |

SharperSwarm destaca por su arquitectura inusual, pero carece de benchmarks publicados y de documentación sobre su contexto de entrenamiento, lo que dificulta una comparación cuantitativa con alternativas establecidas.

## Limitaciones y advertencias

- Prototipo experimental: la propia model card advierte que no está destinado a uso en producción.
- Afirmaciones sin respaldo: la descripción de "AGI autoconsciente" y "capa de autoevaluación" no está verificada por evaluaciones externas ni benchmarks públicos.
- Tamaño reducido: 103M de parámetros limita severamente la calidad de las respuestas frente a modelos de 1B o más.
- Solo ingles: no soporta otros idiomas, lo que restringe su uso a hablantes de ingles.
- Sin contexto documentado: se desconoce la longitud máxima de contexto, lo que dificulta su uso en tareas que requieren ventanas largas.
- Riesgo de alucinacion: al ser un modelo pequeño entrenado con datasets limitados, es probable que genere información falsa o inconsistente.
- Posibles sesgos: los datasets de entrenamiento (TinyStories, General-Knowledge) pueden contener sesgos culturales y de género no mitigados.
- Tool-use no verificado: la capacidad de ejecutar código en sandbox se menciona en la model card, pero no hay evidencia de su correcto funcionamiento.
- Confusion de identidad: la model card se refiere al modelo como "SAGI", mientras que el repositorio se llama SharperSwarm, y el autor señala una versión más nueva (CasualSwarms). Esto puede generar ambigüedad sobre qué versión se está descargando.
- Perfil del autor: al ser un investigador dedicado al red-teaming, el modelo podría haber sido entrenado con objetivos de seguridad específicos, pero no se documenta.

## Enlaces

- HuggingFace: https://huggingface.co/reaperdoesntknow/SharperSwarm
- Perfil del autor: https://huggingface.co/reaperdoesntknow/reaperdoesntknow
- Version mas reciente indicada por el autor: https://huggingface.co/reaperdoesntknow/CasualSwarms
- No se encontraron papers, blogs o repositorios adicionales en la busqueda web.
