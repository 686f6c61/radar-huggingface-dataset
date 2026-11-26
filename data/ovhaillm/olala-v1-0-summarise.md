# OVHaiLLM/Olala-v1.0-summarise

## Resumen

Olala-v1.0-summarise es un modelo especializado en resumen de documentos desarrollado por OVHaiLLM (OVHcloud), obtenido mediante fine-tuning del modelo post-entrenado Olala-v1.0-mini-7A1B. Su particularidad es que razona antes de redactar el resumen, lo que le permite generar síntesis estructuradas y fieles a la fuente en lugar de extractos superficiales. Está pensado para documentos heterogéneos: noticias, diálogos, hilos de foro, llamadas de resultados financieros, proyectos de ley, informes gubernamentales y artículos científicos.

El modelo parte de una arquitectura híbrida Mamba + MoE (según los tags del repositorio), con 6.773.124.144 parámetros totales en pesos safetensors y un tamaño de repositorio de 13,6 GB. La model card lo describe como un modelo de 7A1B (aproximadamente 7.000 millones de parámetros totales con 1.000 millones activos), aunque la cifra exacta de parámetros activos no se detalla en la información disponible.

Es relevante ahora porque combina razonamiento previo a la generación con un control explícito del formato de salida ("en una frase", "en viñetas") y porque, según el autor, produce resúmenes más concisos que 16 de los 17 modelos con los que se comparó. Se distribuye bajo licencia Apache 2.0 y está disponible tanto en Hugging Face como en los AI Endpoints de OVHcloud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba + MoE (según tags del repositorio; detalles exactos no disponibles) |
| Parametros totales | 6.773.124.144 |
| Parametros activos | no disponible (denominación "7A1B" sugiere ~7B totales y ~1B activos, sin confirmación oficial) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, custom_code) |

## Arquitectura y entrenamiento

El modelo se basa en Olala-v1.0-mini-7A1B, un modelo post-entrenado de la familia Olala que combina capas Mamba con mezcla de expertos (MoE), según los tags del repositorio. El modelo base pre-entrenado (Olala-v1.0-mini-7A1B-base) se entrenó con 12,8 billones de tokens; sobre él se aplicó un proceso de supervisión fina (SFT) y posteriormente un post-entrenamiento orientado a razonamiento, chat y uso de herramientas, antes de la especialización final en resumen.

La especialización en resumen se realizó mediante fine-tuning sobre el modelo post-entrenado. El autor indica que el modelo fue entrenado para razonar antes de escribir el resumen, para producir salidas estructuradas (secciones o viñetas etiquetadas) fieles a la fuente y para respetar restricciones de formato explícitas. No se especifican en la información disponible el número de tokens de entrenamiento del fine-tuning, la composición del dataset de resumen ni si se emplearon técnicas de RLHF o DPO en esta etapa concreta.

## Capacidades

- Generación de resúmenes de documentos de múltiples tipos: noticias, diálogos, hilos de foro, llamadas de resultados, proyectos de ley, informes gubernamentales y artículos científicos.
- Razonamiento previo a la generación del resumen (modo de razonamiento interno antes de la salida).
- Resúmenes estructurados: secciones o viñetas etiquetadas.
- Control del formato de salida bajo instrucción explícita ("en una frase", "en viñetas").
- Fidelidad a la fuente como objetivo de entrenamiento declarado.
- Concisión: según el autor, sus resúmenes son más cortos que los de 16 de los 17 modelos comparados.
- Capacidades heredadas del modelo base: conversación, razonamiento y uso de herramientas (tool use), según la descripción del modelo post-entrenado del que deriva.
- Capacidad multilingüe: limitada al inglés según el campo `language` del repositorio.

## Casos de uso

- Resumen de artículos científicos para revisión rápida de literatura: el modelo puede condensar papers en secciones o viñetas estructuradas, respetando la fidelidad a la fuente, lo que encaja con su entrenamiento específico en documentos científicos.
- Síntesis de llamadas de resultados financieros: permite generar resúmenes concisos y estructurados de transcripciones largas, útil para equipos de análisis que necesitan extraer puntos clave sin leer el documento completo.
- Procesamiento de informes gubernamentales y proyectos de ley: el modelo está entrenado para este tipo de documentos y puede producir resúmenes con secciones etiquetadas que faciliten la revisión por parte de equipos legales o de políticas públicas.
- Resumen de hilos de foro y conversaciones: adecuado para destilar discusiones multi-turno en puntos accionables, gracias a su entrenamiento específico en diálogos y foros.
- Moderación y triaje de contenido en plataformas: al poder resumir en una sola frase o en viñetas, se puede integrar en pipelines que clasifican y priorizan grandes volúmenes de documentos entrantes.
- Generación de resúmenes ejecutivos con formato controlado: la capacidad de seguir instrucciones de formato ("en una frase", "como viñetas") lo hace apto para informes automatizados donde el formato de salida está estandarizado.
- Integración vía API en productos SaaS: al estar disponible en los AI Endpoints de OVHcloud, puede consumirse como servicio gestionado para funcionalidades de resumen dentro de aplicaciones sin necesidad de desplegar infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta una comparación cualitativa de concisión (resúmenes más cortos que 16 de 17 modelos comparados), sin cifras de MMLU, HumanEval, GSM8K ni métricas de resumen como ROUGE.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (6,77 mil millones de parámetros), en FP16 se requieren aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché; en cuantización de 8 bits, en torno a 7 GB; en 4 bits, en torno a 4 GB. Estas cifras son estimaciones por tamaño, no datos publicados por el autor.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría esperar ejecución en GPUs de 24 GB o más (RTX 4090, A10G, L4 con cuantización) y en A100/H100 para despliegues de producción, pero el autor no lo especifica.
- Cabe en GPU de consumo: probable en cuantización de 4-8 bits en GPUs de 8-24 GB, aunque no confirmado por el autor.
- Opciones de despliegue: transformers (librería declarada, con `custom_code`), lo que implica cargar código personalizado del repositorio. El soporte en vLLM, llama.cpp, Ollama o TGI no está confirmado en la información disponible; la arquitectura híbrida Mamba + MoE y el uso de `custom_code` pueden limitar la compatibilidad con motores de inferencia estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de los 17 modelos con los que el autor compara cualitativamente, por lo que no es posible construir una comparativa numérica fiable. A continuación se indican alternativas de la misma categoría (modelos pequeños especializados en resumen o de propósito general con capacidad de resumen), con los datos disponibles:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Olala-v1.0-summarise | 6,77B totales | no disponible | Apache 2.0 | Especializado en resumen, razona antes de escribir |
| Olala-v1.0-mini-7A1B | ~7B (7A1B) | no disponible | Apache 2.0 | Modelo base post-entrenado, propósito general |
| Olala-v1.0-translate | ~7B (7A1B) | no disponible | Apache 2.0 | Variante especializada en traducción |
| Modelos de resumen de propósito general de 7B | variable | variable | variable | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Idiomas: el repositorio declara únicamente inglés; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Riesgo de alucinación: como todo modelo generativo, puede introducir información no presente en la fuente, aunque su entrenamiento prioriza la fidelidad; conviene validar resúmenes en contextos críticos.
- Longitud de contexto no documentada: se desconoce la ventana máxima, lo que dificulta planificar el resumen de documentos muy largos sin truncado.
- Compatibilidad de despliegue: el uso de `custom_code` y una arquitectura híbrida Mamba + MoE puede requerir código específico del repositorio y limitar el soporte en motores de inferencia populares (vLLM, llama.cpp, TGI).
- Parámetros activos no confirmados: la denominación "7A1B" sugiere una MoE con ~1B activos, pero no se detalla oficialmente, lo que afecta a las estimaciones de coste computacional.
- Sesgos: no se documentan sesgos conocidos en la información disponible; al entrenarse sobre datos web y financieros, puede heredar sesgos de esas fuentes.
- Licencia: Apache 2.0 permite uso comercial, pero al derivar de un modelo base de OVHaiLLM conviene revisar los términos del modelo base y del código personalizado incluido.
- Especialización estrecha: está optimizado para resumen; para otras tareas conviene usar el modelo base Olala-v1.0-mini-7A1B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OVHaiLLM/Olala-v1.0-summarise
- Modelo base post-entrenado: https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B
- Modelo base pre-entrenado: https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B-base
- Modelo tras SFT: https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B-SFT
- Variante de traducción: https://huggingface.co/OVHaiLLM/Olala-v1.0-translate
- Informe técnico (PDF): https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B/blob/main/Olala-v1.0-mini.pdf
- AI Endpoints de OVHcloud: https://www.ovhcloud.com/en/public-cloud/ai-endpoints/catalog/olala-v1-0-summarise/
- Playground: https://olala.ovh.com
