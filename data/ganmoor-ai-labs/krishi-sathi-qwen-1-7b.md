# ganmoor-ai-labs/krishi-sathi-qwen-1.7b

## Resumen

Krishi Sathi 1.7B es un asistente agrícola bilingüe (kannada e inglés) desarrollado por el laboratorio ganmoor-ai-labs, diseñado para ofrecer orientación agronómica de primera línea a agricultores del estado de Karnataka, en la India, funcionando completamente sin conexión a internet. El modelo parte de la base Qwen/Qwen3-1.7B, sobre la que se aplicó un ajuste fino con LoRA (r=16) fusionado posteriormente, dando como resultado un modelo denso de aproximadamente 2.030 millones de parámetros. Su propósito principal es responder preguntas prácticas sobre protección de cultivos, manejo de nutrientes, prácticas culturales y variedades para los principales cultivos de Karnataka, en el idioma que use el agricultor.

La relevancia de este modelo radica en su enfoque offline y de bajo coste: está pensado para ejecutarse en teléfonos Android de gama baja con 4 GB de RAM mediante runtimes basados en llama.cpp, lo que lo hace accesible en zonas rurales con conectividad limitada. El proyecto es experimental y educativo, con una licencia Apache-2.0 que permite uso comercial, aunque la calidad del kannada es desigual y el modelo presenta limitaciones importantes en cuanto a precisión de dosis y posibles alucinaciones. Se trata de una versión inicial (v1) que el autor recomienda sustituir por una variante basada en Sarvam-1 para un mejor rendimiento en kannada, aunque esa versión tiene licencia no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-1.7B base) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (~1,1 GB); safetensors (precisión completa) |
| Idiomas soportados | Inglés, kannada |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3-1.7B, un transformer denso con atención causal estándar. Sobre esta base se realizó un ajuste fino supervisado (SFT) con LoRA de rango 16 aplicado a todas las proyecciones de atención y MLP, y posteriormente se fusionaron los pesos LoRA con el modelo base. El entrenamiento se llevó a cabo con TRL (Transformers Reinforcement Learning) y los pesos resultantes se cuantizaron con llama.cpp para la versión GGUF.

Los datos de entrenamiento provienen de tres fuentes principales: (1) consultas del Kisan Call Centre (KCC) de Karnataka, un subconjunto de aproximadamente 2.900 consultas únicas destiladas de unas 42.000 llamadas reales de agricultores entre 2009 y 2023, cuyas notas de operador fueron reescritas en respuestas completas y fundamentadas por el modelo profesor gemma-3-27b-it, preservando las dosis exactas de las fuentes; (2) un subconjunto filtrado y adaptado al contexto de Karnataka del dataset KisanVaani de preguntas y respuestas agrícolas (Apache-2.0); y (3) ejemplos plantilla que enseñan al modelo a reconocer sus limitaciones offline, indicando que no puede conocer el clima actual, precios de mercado o estado de esquemas gubernamentales, y derivando al agricultor a canales apropiados como Meghdoot, e-NAM o Raitha Samparka Kendra. Las versiones en kannada de todas las preguntas y respuestas se generaron con IndicTrans2 (rotary en-indic-1B), que preserva números y dosis de forma fiel.

## Capacidades

- Generación de texto en inglés y kannada, con respuestas prácticas y específicas sobre agronomía para cultivos de Karnataka (algodón, maíz, chile, cebolla, tomate, arecanut, ragi, arroz, tur, cacahuete, caña de azúcar, plátano, entre otros).
- Manejo de consultas multi-turno en formato conversacional, siguiendo la plantilla de chat de Qwen3 con el modo de pensamiento desactivado.
- Capacidad de reconocer sus propias limitaciones offline: el modelo está entrenado para declarar explícitamente que no puede acceder a datos en vivo (clima, precios, estado de esquemas) y para recomendar canales oficiales de información.
- Soporte de instrucciones en el prompt del sistema para recordar al agricultor que verifique dosis y etiquetas de productos químicos, y que use equipo de protección.
- No dispone de tool calling, ni capacidades multimodales (visión, audio), ni razonamiento avanzado tipo thinking mode.

## Casos de uso

- Asistencia en campo para agricultores: un agricultor puede preguntar sobre síntomas de plagas o enfermedades en su cultivo y recibir una respuesta orientativa en kannada o inglés, sin necesidad de conexión a internet, directamente desde su teléfono Android de gama baja.
- Extensión agrícola en zonas rurales: agentes de extensión pueden usar el modelo como herramienta de apoyo para resolver dudas frecuentes sobre manejo de cultivos, fertilización y prácticas culturales, reduciendo la dependencia de especialistas en campo.
- Educación y formación de agricultores: el modelo puede servir como material de consulta en talleres y programas de capacitación, proporcionando respuestas básicas sobre variedades, épocas de siembra y manejo integrado de plagas.
- Soporte a líneas de atención al agricultor: integrado en sistemas de chat o voz (con un TTS externo), puede actuar como primer nivel de respuesta en centros de llamadas, derivando casos complejos a operadores humanos.
- Aplicaciones móviles offline de agronomía: desarrolladores pueden integrar el modelo en apps Android mediante llama.cpp u Ollama, ofreciendo un asistente agrícola que funciona sin datos móviles.
- Investigación y desarrollo de modelos agrícolas multilingües: el pipeline de entrenamiento (datos KCC + traducción IndicTrans2 + LoRA) puede replicarse para otros estados o idiomas, como se indica en la hoja de ruta del proyecto (telugu, tamil, maratí, hindi).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación como MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con otros modelos. El autor solo menciona cualitativamente que la calidad del inglés es superior a la del kannada, y que la versión basada en Sarvam-1 es aproximadamente 4 veces más rápida en generación en kannada, pero sin datos numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia: la versión GGUF Q4_K_M ocupa aproximadamente 1,1 GB, por lo que puede ejecutarse en dispositivos con 2-4 GB de RAM (teléfonos Android de gama baja) usando runtimes como llama.cpp o aplicaciones basadas en este.
- La versión safetensors en precisión completa (FP16) requeriría aproximadamente 4 GB de VRAM, siendo viable en GPUs de consumo como una RTX 3060 o superior.
- GPU recomendadas: para despliegue en servidor, cualquier GPU con al menos 6 GB de VRAM (p. ej., RTX 2060, RTX 3060, T4) es suficiente para la versión cuantizada; para la versión completa se recomienda al menos 8 GB.
- Opciones de despliegue: llama.cpp, Ollama, aplicaciones Android basadas en llama.cpp, y cualquier framework compatible con GGUF. También puede usarse con Transformers para la versión safetensors.
- Latencia y throughput: no se han publicado datos específicos. En un teléfono de gama baja, se espera una generación lenta pero utilizable para respuestas cortas; en GPU de consumo, la generación es casi instantánea para respuestas de 100-200 tokens.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados con otros modelos agrícolas o asistentes multilingües. El propio autor menciona una versión alternativa del mismo proyecto basada en Sarvam-1 (krishi-sathi-sarvam-2b), que ofrece mejor fluidez en kannada y mayor velocidad de generación, pero con licencia no comercial. No obstante, no se proporcionan especificaciones técnicas ni benchmarks de esa versión. Tampoco se han encontrado comparaciones con otros modelos agrícolas como los mencionados en la literatura (p. ej., Krishi Saathi con RAG-QA), que no son directamente comparables por su arquitectura y enfoque.

## Limitaciones y advertencias

- Sesgos geográficos: el modelo está entrenado exclusivamente con datos de Karnataka y sus condiciones agroclimáticas; no debe asumirse que sus recomendaciones sean válidas en otras regiones.
- Riesgo de alucinación: se ha observado que el modelo puede inventar nombres de variedades (por ejemplo, "Arka Ragi" para ragi). Cualquier recomendación de variedad debe verificarse con fuentes oficiales.
- Calidad desigual del kannada: la fluidez y precisión en kannada son notablemente inferiores al inglés, con respuestas a menudo disfluentes, repetitivas o con deriva factual. El autor recomienda la versión basada en Sarvam-1 para uso serio en kannada.
- Dosis de pesticidas: el modelo reproduce dosis históricas de notas de operadores del KCC, algunas de las cuales pueden referirse a productos cuyo registro ha cambiado (p. ej., Monocrotophos está prohibido para hortalizas en India). Es imprescindible verificar cualquier producto y dosis con la etiqueta oficial y con el departamento agrícola local.
- Sin datos en vivo: el modelo no tiene acceso a información actualizada sobre clima, precios de mercado o esquemas gubernamentales; está entrenado para declarar esta limitación, pero el usuario debe ser consciente de ello.
- No es un sustituto del diagnóstico experto: no reemplaza el análisis de suelo, la inspección de campo por un especialista ni las recomendaciones oficiales del gobierno.
- Tamaño reducido: al ser un modelo de 1,7B, puede cometer errores y sus respuestas deben tratarse como orientación, no como hechos.
- Uso experimental: el proyecto se distribuye "tal cual", sin garantías, y los autores declinan toda responsabilidad por decisiones basadas en sus salidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ganmoor-ai-labs/krishi-sathi-qwen-1.7b
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Versión alternativa basada en Sarvam-1: https://huggingface.co/ganmoor-ai-labs/krishi-sathi-sarvam-2b
- Repositorio de IndicTrans2 (traductor): https://huggingface.co/prajdabre/rotary-indictrans2-en-indic-1B
