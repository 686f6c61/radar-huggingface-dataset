# Hatim2221/Fikr-7B-Reasoning

## Resumen

Fikr-7B-Reasoning es un modelo de razonamiento en árabe desarrollado por Hatim2221, obtenido mediante fine-tuning supervisado (SFT) sobre Qwen/Qwen2.5-7B-Instruct. El objetivo es reforzar el razonamiento matemático y lógico en árabe mediante una estructura de Chain-of-Thought (CoT) nativa, separando explícitamente los pasos intermedios de razonamiento (dentro de tokens `thinking`) de la respuesta final (en `response`). Con 7.615 millones de parámetros, es un modelo denso de tamaño compacto, pensado para tareas de razonamiento aritmético, algebraico y lógico en contextos educativos o de asistencia en árabe.

El modelo se presenta como una alternativa ligera y especializada para el mundo árabe, donde la mayoría de los modelos de razonamiento están optimizados para inglés. Su relevancia radica en la capacidad de producir cadenas de razonamiento estructuradas y legibles en árabe, con una precisión comparable a la del modelo base en el benchmark Arabic-GSM8K, aunque con una ligera regresión del 1,59 % en exact match. Está publicado bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada del base, presumiblemente 32K tokens) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, cuantizable a 4/8 bits) |
| Idiomas soportados | Arabe (ar), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Fikr-7B-Reasoning parte de la arquitectura transformer densa de Qwen2.5-7B-Instruct, sin modificaciones estructurales. El entrenamiento consistió en un fine-tuning supervisado (SFT) con el objetivo de forzar una estructura de razonamiento explícita: el modelo aprende a generar primero una cadena de pensamiento detallada dentro de los tokens `thinking` y, a continuación, la respuesta final en `response`. Este enfoque busca mejorar la trazabilidad y la claridad del razonamiento, especialmente en problemas matemáticos de múltiples pasos.

No se han publicado detalles sobre el dataset de entrenamiento (número de tokens, composición, si se usó RLHF o DPO). La model card indica que es un "primer paso" de SFT y que una fase posterior de RL (DPO o PPO) podría alinear mejor los pensamientos estructurados con las respuestas correctas. El modelo mantiene la capacidad multilingüe del base, aunque está optimizado para árabe.

## Capacidades

- Razonamiento matematico en arabe: resuelve problemas aritmeticos, algebraicos, de porcentajes, descuentos, edades y logica, con pasos intermedios explícitos.
- Chain-of-Thought estructurado: genera razonamiento paso a paso dentro de tokens `thinking` y separa la respuesta final en `response`, facilitando la depuracion y verificacion.
- Generacion de texto conversacional: al estar basado en Qwen2.5-7B-Instruct, conserva capacidades generales de chat y generacion de texto en arabe e ingles.
- Soporte multilingue: aunque optimizado para arabe, mantiene competencia en ingles gracias al modelo base.
- Formato de prompt especifico: requiere el template ChatML de Qwen con una instruccion de sistema que pide razonar paso a paso dentro de `thinking`.

## Casos de uso

- Tutoria de matematicas en arabe: el modelo puede actuar como asistente educativo explicando paso a paso la resolucion de problemas aritmeticos y algebraicos, ideal para plataformas de aprendizaje en linea dirigidas a estudiantes araboparlantes.
- Generacion de ejercicios y soluciones: permite crear problemas de matematicas con sus soluciones detalladas en arabe, util para editoriales educativas o generadores de contenido academico.
- Asistente de calculo financiero: puede resolver problemas de descuentos, impuestos, conversiones de moneda y calculo de intereses, con razonamiento transparente, adecuado para aplicaciones de finanzas personales en paises arabes.
- Analisis de problemas logicos: resuelve acertijos, ordenamientos y problemas de logica proposicional, util en juegos educativos o evaluaciones de razonamiento.
- Integracion en chatbots educativos: al ser un modelo de 7B, puede desplegarse en servidores modestos y usarse como backend de chatbots de soporte academico en arabe.
- Preprocesamiento de datos de razonamiento: puede utilizarse para generar datos sinteticos de CoT en arabe, que sirvan para entrenar o evaluar otros modelos.

## Benchmarks y rendimiento

La model card reporta resultados en el benchmark Arabic-GSM8K (split de test completo, 1.319 preguntas) con decodificacion greedy (temperature=0.0) en una GPU NVIDIA A100:

| Modelo | Arquitectura | Formato de razonamiento | Exactitud Arabic-GSM8K | Delta |
|---|---|---|---|---|
| Qwen/Qwen2.5-7B-Instruct (base) | 7B denso | CoT estandar | 72,40 % | Linea base |
| Fikr-7B-Reasoning | 7B denso | CoT nativo en `thinking` | 70,81 % | -1,59 % |

No se han publicado resultados en otros benchmarks (MMLU, HumanEval, GSM8K en ingles, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con pesos en FP16, el modelo ocupa aproximadamente 15 GB (7,6B parametros x 2 bytes). Con cuantizacion de 4 bits (GPTQ/AWQ) se reduce a unos 4-5 GB, y con 8 bits a unos 8 GB.
- GPU recomendadas: para inferencia en FP16 se necesita una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB). Con cuantizacion 4-bit cabe en GPUs consumer de 8 GB (RTX 3060, RTX 4060, etc.).
- Opciones de despliegue: al ser un modelo basado en Qwen2.5, es compatible con vLLM, llama.cpp, Ollama, TGI y Transformers de HuggingFace. No se han publicado mediciones de latencia o throughput.
- Para uso en produccion con alta concurrencia, se recomienda vLLM o TGI con cuantizacion AWQ/GPTQ para reducir latencia y aumentar throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fikr-7B-Reasoning | 7,6B | No disponible | Razonamiento matematico en arabe | Apache 2.0 | HuggingFace |
| Qwen2.5-7B-Instruct (base) | 7,6B | 32K | Chat y razonamiento general multilingue | Apache 2.0 | HuggingFace |
| Falcon H1R 7B | 7B | 256K | Razonamiento general (matematicas, codigo) | Apache 2.0 | HuggingFace |

Fikr-7B-Reasoning se diferencia de su base por la estructura de CoT en arabe, pero pierde algo de precision. Falcon H1R 7B, aunque tambien de 7B, esta optimizado para razonamiento general en ingles y no tiene soporte especifico para arabe. No se dispone de comparaciones directas en benchmarks arabes con otros modelos.

## Limitaciones y advertencias

- Regresion de precision: el modelo pierde un 1,59 % de exactitud en Arabic-GSM8K respecto al base, lo que indica que el SFT no ha mejorado la correccion final, solo la estructura del razonamiento.
- Sesgos y alucinaciones: al ser un fine-tuning sobre un modelo base, puede heredar sesgos de Qwen2.5 y generar razonamientos incorrectos pero aparentemente logicos, especialmente en problemas complejos o ambiguos.
- Limitaciones de idioma: aunque soporta ingles, su optimizacion es para arabe; el rendimiento en ingles puede ser inferior al del base.
- Contexto limitado: no se ha confirmado la longitud de contexto; si hereda los 32K del base, puede manejar conversaciones largas, pero no se ha verificado.
- Sin fase de RL: la model card advierte que la falta de DPO/PPO limita la alineacion entre pensamiento y respuesta, lo que puede afectar la fiabilidad en produccion.
- Datos de entrenamiento no publicados: no se conoce la composicion del dataset SFT, lo que dificulta evaluar posibles sesgos o cobertura tematica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Hatim2221/Fikr-7B-Reasoning
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
