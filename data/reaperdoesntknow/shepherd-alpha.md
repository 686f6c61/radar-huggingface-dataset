# reaperdoesntknow/Shepherd-Alpha

## Resumen

Shepherd-Alpha es un modelo de razonamiento táctico de 1.720 millones de parámetros desarrollado por Convergent Intelligence LLC (división de investigación) y publicado en Hugging Face bajo el identificador `reaperdoesntknow/Shepherd-Alpha`. Se presenta como el primer modelo de razonamiento para defensa publicado en la plataforma. Consiste en un fine-tuning sobre Qwen/Qwen3-1.7B, entrenado con 150 escenarios tácticos de doble perspectiva (ataque y defensa) procedentes del dataset ZennyKenny/tactical-military-reasoning-v.1.0, con licencia MIT.

La innovación principal es la metodología **BiCell Depth Dispersal**, que particiona las 28 capas del transformer en dos zonas (inferior, capas 0-13, y superior, capas 14-27) y las entrena de forma asimétrica en tres fases, acumulando los gradientes de las tres pasadas antes de cada paso del optimizador. El modelo genera análisis estructurados de escenarios tácticos desde la perspectiva simultánea del atacante y del defensor, con razonamiento encadenado (chain-of-thought) para cada una.

Su relevancia radica en dos frentes: por un lado, aporta un caso práctico de fine-tuning de dominio específico con una metodología de particionado de capas alternativa al SFT convencional; por otro, sus hallazgos sugieren que en la adaptación a dominios concretos, las capas de representación (inferiores) son el cuello de botella, con magnitudes de gradiente aproximadamente 1,7 veces superiores a las de las capas de razonamiento (superiores). Es una versión alpha de investigación, no un sistema de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-1.7B), 28 capas, atención completa |
| Parametros totales | 1.720.040.448 (1,72B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32K tokens (heredada de Qwen3-1.7B; no confirmada explícitamente en la model card) |
| Tipos de cuantizacion | No disponible (pesos publicados en bfloat16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

Shepherd-Alpha parte de Qwen3-1.7B, un transformer causal denso de 28 capas con atención completa sobre todas las capas. El fine-tuning emplea la metodología BiCell Depth Dispersal, que divide el modelo en dos zonas de profundidad: Zone Lo (capas 0-13) y Zone Hi (capas 14-27). El entrenamiento se realiza en tres fases: en la fase 1 se congelan las capas superiores y se entrenan las inferiores; en la fase 2 se invierte el congelamiento; y en la fase 3 se descongelan todas las capas para una integración conjunta. Las tres pasadas hacia atrás acumulan gradientes antes de un único paso del optimizador, lo que fuerza una especialización independiente de cada zona antes de la integración.

El entrenamiento se realizó sobre el dataset ZennyKenny/tactical-military-reasoning-v.1.0, que contiene 150 escenarios tácticos con razonamiento de ataque y defensa en formato de cadena de pensamiento, con licencia MIT. Los hiperparámetros declarados son: 3 épocas, batch size 2, learning rate 2e-5 con AdamW y weight decay 0,01, precisión bfloat16 y enmascaramiento de pérdida que solo computa la función de pérdida sobre los tokens de razonamiento del asistente, no sobre los prompts de escenario. El hardware de entrenamiento fue una NVIDIA A100. Un hallazgo destacado del entrenamiento es que las capas inferiores produjeron aproximadamente 1,7 veces la magnitud de gradiente de las superiores durante la adaptación al dominio, lo que sugiere que el cuello de botella en el SFT de dominio específico está en las capas de representación, no en las de razonamiento.

## Capacidades

- Generación de análisis táctico estructurado con doble perspectiva: razonamiento de ataque (cómo explotaría un adversario la situación) y razonamiento de defensa (cómo contrarrestar, mitigar y sobrevivir).
- Razonamiento encadenado (chain-of-thought) específico para escenarios tácticos y militares.
- Formato de salida estructurado en dos bloques diferenciados de análisis (ataque y defensa) para un mismo escenario de entrada.
- Capacidad de procesar escenarios complejos descritos en lenguaje natural, incluyendo variables como unidades mecanizadas, enjambres de drones, limitaciones de fuego y restricciones civiles.
- Herencia de las capacidades base de Qwen3-1.7B: generación de texto, razonamiento general, comprensión de instrucciones y formato conversacional mediante chat template.
- Compatible con el ecosistema transformers y text-generation-inference (endpoints compatibles).
- No soporta tool calling, visión, audio ni modo thinking explícito; el modo thinking de Qwen3 puede interferir con el formato de salida y debe desactivarse con `enable_thinking=False`.

## Casos de uso

- Análisis de escenarios tácticos para planificación defensiva: dado un escenario descrito en lenguaje natural (por ejemplo, una unidad mecanizada avanzando por terreno urbano que detecta un enjambre de drones), el modelo genera un análisis dual de cómo un adversario explotaría la situación y cómo defenderse, útil como herramienta de apoyo a la toma de decisiones en ejercicios de simulación.
- Entrenamiento y simulación de personal militar: el modelo puede generar perspectivas alternativas de ataque y defensa para el mismo escenario, permitiendo a instructores y alumnos contrastar enfoques tácticos en entornos de adiestramiento sin riesgo operativo.
- Redacción de informes de inteligencia estructurados: la salida en dos bloques (ataque/defensa) permite producir documentos de análisis de amenazas con formato consistente, reduciendo el tiempo de redacción manual.
- Evaluación de vulnerabilidades en planes operativos: los equipos de planificación pueden introducir sus propios planes y obtener una perspectiva adversarial automatizada que identifique posibles explotaciones por parte del enemigo.
- Investigación académica en IA para defensa: sirve como punto de partida y referencia para estudiar metodologías de fine-tuning por particionado de capas (BiCell Depth Dispersal) y su aplicabilidad a dominios de alto riesgo.
- Prototipado de asistentes tácticos conversacionales: al ser un modelo de 1,7B con licencia Apache 2.0, puede integrarse en sistemas prototipo de asistencia táctica que requieran despliegue local o en entornos con recursos limitados.
- Análisis de escenarios de seguridad civil y gestión de crisis: aunque entrenado con datos militares, el formato de análisis dual puede adaptarse a escenarios de seguridad pública, evacuaciones o respuesta ante amenazas, con las debidas precauciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación como MMLU, HumanEval, GSM8K ni comparativas cuantitativas con otros modelos. El único dato de rendimiento reportado es el hallazgo interno sobre magnitudes de gradiente (1,7x superiores en capas inferiores), que es una observación de entrenamiento, no una métrica de calidad del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5 GB en bfloat16 (pesos de 1,72B parámetros), lo que permite ejecución en GPUs de consumo con 6-8 GB de VRAM.
- GPU recomendadas: NVIDIA RTX 3060 (12 GB) o superior para inferencia cómoda; la tarjeta de entrenamiento declarada es una NVIDIA A100.
- Compatible con GPUs de consumo: sí, cualquier GPU con 8 GB o más de VRAM puede ejecutar el modelo sin cuantización.
- Opciones de despliegue: compatible con transformers (Hugging Face), text-generation-inference (TGI) y endpoints compatibles con la librería transformers. No se menciona soporte explícito para vLLM, llama.cpp u Ollama en la documentación disponible, aunque al ser un modelo Qwen3 estándar en safetensors, es probable que sea convertible a GGUF o compatible con vLLM; esto no está confirmado por el autor.
- Latencia y throughput: no disponibles. Al ser un modelo de 1,7B, se espera una latencia baja en GPUs modernas, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Shepherd-Alpha | 1,72B | 32K (heredado) | Apache 2.0 | Razonamiento táctico dual (ataque/defensa) | Hugging Face |
| Qwen3-1.7B (base) | 1,72B | 32K | Apache 2.0 | Modelo general de propósito | Hugging Face |
| Otros modelos de razonamiento táctico | No disponible | — | — | — | No se han identificado alternativas publicadas comparables |

Shepherd-Alpha es un fine-tuning de Qwen3-1.7B, por lo que comparte arquitectura, tamaño y contexto con su modelo base. La diferencia sustancial es el entrenamiento especializado en razonamiento táctico de doble perspectiva y la metodología BiCell Depth Dispersal. No se han identificado otros modelos públicos especializados en razonamiento táctico militar con los que comparar directamente; la categoría es muy específica y el modelo se autodenomina el primero de su tipo en Hugging Face. Para tareas de razonamiento general, la comparación relevante sería contra el propio Qwen3-1.7B y otros modelos de 1-2B como Llama 3.2 1B o Gemma 2 2B, pero no hay datos de benchmarks que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Versión alpha de investigación: el autor declara explícitamente que es un checkpoint de investigación, no un sistema de producción.
- Conjunto de entrenamiento muy reducido: solo 150 escenarios, lo que proporciona un anclaje de formato y dominio pero una profundidad táctica limitada. El propio autor indica que versiones futuras incorporarán datasets aumentados con razonamiento generado por múltiples modelos.
- Interferencia del modo thinking de Qwen3: el patrón de generación `thinking` preentrenado de Qwen3 puede sobrescribir el formato de salida estructurado; se recomienda usar `enable_thinking=False` en la configuración de generación.
- Riesgo de alucinación: al ser un modelo pequeño (1,7B) entrenado con un dataset limitado, el riesgo de generar razonamientos tácticos plausibles pero incorrectos o incompletos es elevado. No debe utilizarse para decisiones operativas reales.
- Sesgos potenciales: el entrenamiento exclusivo con datos tácticos militares de doble perspectiva puede sesgar el modelo hacia un marco de confrontación, inadecuado para contextos civiles o diplomáticos.
- Idioma: solo soporta inglés; no hay evidencia de capacidades multilingües.
- Limitación de dominio: el modelo no controla, apunta ni acciona ningún sistema físico; es únicamente una herramienta de análisis y razonamiento, como advierte el autor.
- Restricciones de uso: aunque la licencia es Apache 2.0 (permisiva, incluye uso comercial), el ámbito de aplicación (defensa) puede estar sujeto a regulaciones locales de exportación o control de tecnologías de doble uso según la jurisdicción.
- Sin benchmarks publicados: no hay métricas objetivas de calidad que permitan evaluar su rendimiento real frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Shepherd-Alpha
- Colección Shepherd: https://huggingface.co/collections/reaperdoesntknow/shepherd
- Dataset de entrenamiento: https://huggingface.co/datasets/ZennyKenny/tactical-military-reasoning-v.1.0
- Sitio web de Convergent Intelligence LLC: https://convergentintel.com
- Paper "Structure Over Scale": https://doi.org/10.57967/hf/5165
- Paper "DualMind Methodology": https://doi.org/10.57967/hf/5184
- Paper "Discrepancy Calculus": https://doi.org/10.57967/hf/5194
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
