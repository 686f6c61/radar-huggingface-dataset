# LiquidAI/LFM2-2.6B-Longevity

## Resumen

LFM2-2.6B-Longevity es un modelo de lenguaje compacto y especializado en biología del envejecimiento, desarrollado conjuntamente por Insilico Medicine y Liquid AI. Se trata de una adaptación por fine-tuning supervisado del modelo base LiquidAI/LFM2-2.6B, un modelo híbrido de 2.600 millones de parámetros con arquitectura Liquid (puertas multiplicativas y convoluciones cortas) y una ventana de contexto de 32.768 tokens. Su propósito es interpretar datos heterogéneos de envejecimiento, incluyendo datos multi-ómicos (genómica, proteómica, transcriptómica) y datos clínicos, facilitando tareas como la predicción de progresión de enfermedades o el análisis de biomarcadores.

El modelo acompaña el estudio "An Open Benchmark and Language Models for AI in Aging Biology" (Zhavoronkov et al., 2026) y se publica junto con el benchmark LongevityBench, un conjunto de evaluación específico para esta disciplina. Su relevancia radica en ofrecer un modelo de tamaño reducido, desplegable en hardware de consumo, capaz de razonar sobre datos biológicos complejos con un formato de prompt que permite alternar entre modos de razonamiento explícito (`/think`) y respuesta directa (`/no_think`). Está diseñado para investigadores y desarrolladores que necesitan un asistente de IA especializado sin depender de APIs propietarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Liquid con puertas multiplicativas y convoluciones cortas |
| Parametros totales | 2.569.272.320 (2.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible (formato original safetensors en bfloat16) |
| Idiomas soportados | Inglés (según model card) |
| Licencia | lfm1.0 (licencia propietaria de Liquid AI) |
| Formato de pesos | safetensors (transformers, bfloat16) |

## Arquitectura y entrenamiento

El modelo base LFM2-2.6B emplea una arquitectura híbrida Liquid, que combina capas con puertas multiplicativas y convoluciones de ventana corta en lugar de solo atención estándar. Esta arquitectura está diseñada para ofrecer un equilibrio entre calidad de generación y eficiencia computacional, permitiendo inferencia en dispositivos de consumo. La variante Longevity se obtuvo mediante fine-tuning supervisado de parámetros completos (full-parameter SFT) del base model sobre un corpus compartido de biología del envejecimiento, que incluye datos multi-ómicos y clínicos. Los prompts se formatean siguiendo el esquema ChatML con una plantilla de "pensamiento dinámico": el usuario puede añadir el sufijo `/think` o `/no_think` a su turno para seleccionar si el modelo debe mostrar su razonamiento paso a paso o responder directamente. No se han publicado detalles sobre el número exacto de tokens de entrenamiento ni sobre la composición detallada del dataset, más allá de la referencia a LongevityBench.

## Capacidades

- Interpretación de datos heterogéneos de biología del envejecimiento: genómica, proteómica, transcriptómica (GSEA, RNAseq) y datos clínicos.
- Razonamiento biomédico sobre casos clínicos, como comparación de estadios tumorales y predicción de intervalos libres de progresión.
- Modo de razonamiento explícito mediante el sufijo `/think` en el prompt, que activa una cadena de pensamiento visible.
- Generación de texto en inglés con formato de chat ChatML, compatible con `apply_chat_template()` de Transformers.
- Soporte de tool calling y agentes: el modelo base LFM2-2.6B tiene capacidades demostradas de tool calling y razonamiento multi-paso; esta variante hereda esas capacidades, aunque no se han validado específicamente en el dominio de envejecimiento.
- Integración con frameworks de inferencia estándar: Transformers, vLLM, SGLang, llama.cpp, MLX y LM Studio.

## Casos de uso

- Investigación en biología del envejecimiento: el modelo puede analizar resultados de RNAseq o GSEA y relacionarlos con fenotipos clínicos de pacientes, ayudando a identificar patrones asociados a la longevidad o a la progresión de enfermedades relacionadas con la edad.
- Asistencia en revisión de literatura biomédica: dado un conjunto de hallazgos multi-ómicos, el modelo puede resumir y contextualizar implicaciones biológicas, acelerando la generación de hipótesis.
- Predicción de progresión de enfermedades oncológicas: a partir de datos clínicos estructurados (estadio, edad, características histopatológicas), el modelo puede comparar casos y estimar intervalos de supervivencia o progresión, como se muestra en el ejemplo de la model card.
- Educación y formación en gerociencia: el modelo puede responder preguntas sobre los "hallmarks of aging" y explicar conceptos de biología del envejecimiento a estudiantes o investigadores junior.
- Desarrollo de pipelines de análisis automatizado: al ser un modelo compacto y compatible con vLLM o SGLang, puede integrarse en flujos de procesamiento de datos clínicos para generar informes preliminares en entornos con recursos limitados.
- Prototipado de asistentes virtuales de salud: con la plantilla de chat y el modo `/think`, puede servir como base para un copiloto de apoyo a decisiones clínicas en el ámbito de la geriatría, siempre bajo supervisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para la variante LFM2-2.6B-Longevity en la información disponible. La model card referencia el estudio "An Open Benchmark and Language Models for AI in Aging Biology" y el dataset LongevityBench, pero no se incluyen cifras concretas de rendimiento en esta ficha. Se recomienda consultar la documentación oficial de Liquid AI y el repositorio de LongevityBench para obtener métricas actualizadas.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bfloat16 (formato original), el modelo ocupa aproximadamente 5,1 GB en memoria, por lo que se requiere una GPU con al menos 6 GB de VRAM para ejecución cómoda. Con cuantización a 4 u 8 bits (si se genera mediante herramientas como llama.cpp o bitsandbytes), el consumo puede reducirse a 2-3 GB, aunque no se han publicado configuraciones oficiales de cuantización para esta variante.
- GPU recomendadas: RTX 3060 (12 GB), RTX 4060/4070, RTX 4090, o GPUs de datacenter como A10, L4 o A100 para despliegues de mayor concurrencia. En Apple Silicon, la integración con MLX permite ejecución eficiente en chips M1/M2/M3.
- Hardware consumer: sí, cabe en GPUs de consumo con 8 GB o más de VRAM, y también puede ejecutarse en CPU mediante llama.cpp con offloading, aunque con mayor latencia.
- Opciones de despliegue: Transformers (con `device_map="auto"`), vLLM para alto rendimiento, SGLang, llama.cpp para CPU/GPU, MLX para Apple Silicon y LM Studio para escritorio.
- Latencia y throughput: no se han publicado cifras oficiales para esta variante. Dado el tamaño de 2.6B parámetros, se espera una generación de decenas de tokens por segundo en GPUs modernas (p. ej., RTX 4090), pero estos valores deben validarse empíricamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia |
|---|---|---|---|---|
| LFM2-2.6B-Longevity | 2,6B | 32.768 | Biología del envejecimiento | lfm1.0 |
| LFM2-1.2B-Longevity | 1,2B | 32.768 (estimado) | Biología del envejecimiento | lfm1.0 |
| LFM2-2.6B (base) | 2,6B | 32.768 | General (chat, razonamiento, tool calling) | lfm1.0 |

No se dispone de datos comparativos con otros modelos biomédicos como BioGPT o Med-PaLM en la información proporcionada. La comparativa se limita a los modelos de la misma familia.

## Limitaciones y advertencias

- La licencia lfm1.0 es propietaria. Aunque permite uso comercial en ciertos términos, no es una licencia open source (no cumple los criterios de OSI). Es necesario revisar el texto completo de la licencia antes de usar el modelo en producción.
- El modelo está entrenado exclusivamente en inglés, lo que limita su uso en entornos multilingües.
- No se han publicado evaluaciones exhaustivas de sesgos ni de alucinación en el dominio biomédico. Dado que se trata de un dominio de alto riesgo, las respuestas deben ser validadas por expertos y no deben usarse como única fuente para decisiones clínicas.
- Los datos de entrenamiento se centran en biología del envejecimiento; el modelo puede tener un rendimiento degradado en tareas generales fuera de este ámbito, aunque conserva capacidades de razonamiento del modelo base.
- La ventana de contexto de 32.768 tokens es amplia pero no infinita; documentos multi-ómicos muy extensos pueden requerir truncamiento o estrategias de recuperación.
- No se informa sobre la composición demográfica de los datos clínicos utilizados, por lo que podría existir un sesgo hacia ciertas poblaciones (p. ej., edad, sexo, etnia) no documentado.
- El modo `/think` puede generar respuestas más largas y con mayor consumo de tokens, lo que incrementa la latencia y el coste computacional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LiquidAI/LFM2-2.6B-Longevity
- Modelo base LFM2-2.6B: https://huggingface.co/LiquidAI/LFM2-2.6B
- Variante 1.2B Longevity: https://huggingface.co/LiquidAI/LFM2-1.2B-Longevity
- Dataset LongevityBench: https://huggingface.co/datasets/insilicomedicine/longebench
- Blog de Liquid AI sobre LFM2-2.6B: https://www.liquid.ai/blog/introducing-lfm2-2-6b-redefining-efficiency-in-language-models
- Documentación de Liquid Docs para LFM2-2.6B: https://docs.liquid.ai/lfm/models/lfm2-2.6b
- Documentación general de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Paper de referencia (Zhavoronkov et al., 2026): "An Open Benchmark and Language Models for AI in Aging Biology" (doi:10.57967/hf/9888)
