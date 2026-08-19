# santosh07401/krishi-sathi-qwen-1.7b

## Resumen

Krishi Sathi 1.7B es un asistente agronómico bilingüe (kannada e inglés) desarrollado por santosh07401, diseñado para ejecutarse completamente offline en teléfonos Android de gama baja (4 GB de RAM). El modelo es un fine-tuning LoRA del modelo base Qwen/Qwen3-1.7B, fusionado y posteriormente cuantizado a GGUF Q4_K_M (~1,1 GB) para su ejecución en runtimes como llama.cpp u Ollama.

El modelo responde preguntas prácticas de agronomía —protección de cultivos, gestión de nutrientes, prácticas culturales y variedades— para los principales cultivos del estado de Karnataka, India (algodón, maíz, chile, cebolla, tomate, arecanut, ragi, arroz, tur, cacahuete, caña de azúcar, plátano). Se entrenó sobre consultas reales del Kisan Call Centre (KCC) del gobierno indio, reescritas por un modelo profesor (gemma-3-27b-it), más un subconjunto del dataset KisanVaani adaptado al contexto de Karnataka.

Su relevancia radica en ser un modelo de asesoría agrícola de código abierto (Apache-2.0) pensado para despliegue en entornos sin conectividad, con un enfoque explícito de "honestidad offline": el modelo está entrenado para reconocer que no puede conocer datos en vivo como el clima, los precios de mercado o el estado de los esquemas gubernamentales. La versión en kannada se considera experimental; el inglés es significativamente más fluido y fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base: Qwen3-1.7B) con fine-tuning LoRA fusionado |
| Parametros totales | 2.031.739.904 (~2,03 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la model card (hereda la del base Qwen3-1.7B) |
| Tipos de cuantizacion | Q4_K_M GGUF (~1,1 GB); safetensors en precision completa |
| Idiomas soportados | Kannada (kn) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer denso de la familia Qwen3. El fine-tuning se realizó con TRL SFT usando LoRA con rango r=16 aplicado a todas las proyecciones de atención y MLP, seguido de fusión de los adaptadores en los pesos del modelo base. El resultado se cuantizó posteriormente con llama.cpp al formato GGUF Q4_K_M.

El dataset de entrenamiento combina tres fuentes: (1) consultas del Kisan Call Centre (KCC) de Karnataka, con ~2.900 grupos de consultas ponderados por frecuencia destilados de ~42.000 llamadas reales de agricultores (2009-2023); las notas breves de los operadores fueron reescritas en respuestas completas y fundamentadas por el modelo profesor gemma-3-27b-it, con la instrucción explícita de preservar las dosis exactas de las notas originales y no inventar otras nuevas. (2) Un subconjunto filtrado y adaptado al contexto de Karnataka del dataset de preguntas y respuestas agrícolas KisanVaani (Apache-2.0), reescrito por el mismo profesor. (3) Ejemplos plantilla de "honestidad offline" que enseñan al modelo a declarar que no puede conocer el clima en vivo, los precios de mercado o el estado de los esquemas, y a señalar los canales oficiales adecuados (Meghdoot, e-NAM, Raitha Samparka Kendra).

Las versiones en kannada de todas las preguntas y respuestas se produjeron con IndicTrans2 (rotary en-indic-1B), que preserva fielmente números y dosis. No se menciona el uso de RLHF ni DPO; el entrenamiento es exclusivamente SFT supervisado.

## Capacidades

- Generación de texto conversacional en formato chat (plantilla Qwen3, modo thinking desactivado).
- Asesoría agronómica específica para Karnataka: gestión de plagas y enfermedades, calendarios de fertilización, variedades de cultivos y prácticas de siembra.
- Bilingüe kannada-inglés con detección del idioma del usuario; responde en el mismo idioma en que se formula la consulta.
- Funcionamiento totalmente offline: no requiere conectividad a red para inferencia.
- Entrenado para declarar explícitamente sus limitaciones de datos en vivo (clima, precios, esquemas gubernamentales) y derivar al usuario a canales oficiales.
- Reproducción de dosis de pesticidas y productos químicos procedentes de notas históricas del KCC, con recordatorio de seguir la etiqueta del producto y usar equipo de protección.
- No soporta tool calling, function calling, razonamiento multi-paso agéntico, visión ni audio (no documentado en la model card).

## Casos de uso

- Atención agronómica de primera línea en zonas rurales de Karnataka sin conectividad: un agricultor formula una consulta en kannada sobre una plaga en su cultivo de algodón y recibe una respuesta práctica y específica directamente en su teléfono Android de 4 GB de RAM, sin depender de cobertura móvil.
- Aplicación móvil offline para extensionistas agrícolas: los agentes de extensión del Raitha Samparka Kendra pueden consultar el modelo en campo para obtener orientación inicial sobre prácticas culturales, variedades y manejo de nutrientes antes de derivar el caso a un especialista.
- Asistente de apoyo para operadores de centros de llamadas agrícolas: el modelo puede servir como referencia rápida en inglés para operadores que atienden consultas sobre cultivos de Karnataka, reduciendo el tiempo de búsqueda en manuales.
- Formación y material didáctico para agricultores: el modelo puede generar explicaciones sencillas en kannada sobre prácticas de siembra, rotación de cultivos y manejo integrado de plagas para programas de capacitación rural.
- Despliegue en entornos institucionales con requisitos de soberanía de datos: al ser Apache-2.0 y ejecutarse localmente, cooperativas agrícolas y ONG pueden desplegarlo en sus propios servidores u ordenadores de sobremesa sin enviar datos de los agricultores a servicios en la nube.
- Base para desarrollo de variantes regionales: el pipeline de entrenamiento (subconjuntos estatales de KCC + IndicTrans2) puede replicarse para crear asistentes similares en telugu, tamil, maratí o hindi, como indica la hoja de ruta del autor.
- Prototipo comercial de asesoría agrícola en inglés: al ser la única variante con licencia Apache-2.0, es adecuada para integrarse en productos comerciales donde la calidad del inglés sea prioritaria sobre la fluidez en kannada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval, GSM8K ni evaluaciones específicas de tareas agronómicas. La única evaluación cualitativa documentada es la observación del autor de que la calidad en inglés es significativamente superior a la del kannada, con respuestas en inglés coherentes y fundamentadas frente a respuestas en kannada con frecuentes disfluencias, repeticiones y deriva factual.

## Requisitos de hardware

- Inferencia con cuantización Q4_K_M GGUF (~1,1 GB): cabe en teléfonos Android con 4 GB de RAM mediante aplicaciones basadas en llama.cpp.
- Inferencia en escritorio: cualquier equipo con Ollama o llama.cpp puede ejecutar la versión GGUF sin necesidad de GPU dedicada (inferencia por CPU).
- Inferencia con pesos completos safetensors (2,03 B parámetros): requiere aproximadamente 4-5 GB de VRAM en FP16 (GPU como RTX 3060 12 GB o superior); no cabe cómodamente en GPUs de 4 GB o menos en FP16.
- Opciones de despliegue: llama.cpp, Ollama, runtimes móviles basados en llama.cpp; compatible con endpoints vLLM/TGI según las etiquetas del repositorio.
- Latencia y throughput: no se han publicado datos concretos. Al ser un modelo de 1,7 B de parámetros, la generación en CPU moderna es viable pero lenta (del orden de varios segundos por respuesta); en GPU consumer es fluida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| krishi-sathi-qwen-1.7b (este) | 2,03 B | No especificado | Kannada, inglés | Apache-2.0 | Agronomía Karnataka, offline |
| krishi-sathi-sarvam-2b | ~2 B (no especificado) | No especificado | Kannada (mucho mejor), inglés | No comercial | Agronomía Karnataka, offline, ~4x más rápido en kannada |
| Qwen3-1.7B (base) | 2,03 B | No especificado (base oficial) | Multilingüe (amplio) | Apache-2.0 | Modelo generalista sin fine-tuning agrícola |

La comparativa con krishi-sathi-sarvam-2b es especialmente relevante: el propio autor recomienda esta variante para uso en kannada por su fluidez notablemente superior y su generación ~4x más rápida en ese idioma, a costa de una licencia no comercial. La variante Qwen aquí documentada es la opción Apache-2.0 para uso comercial o para respuestas en inglés. Frente al base Qwen3-1.7B, este modelo pierde capacidad generalista pero gana especificidad agronómica para Karnataka y comportamiento de "honestidad offline".

## Limitaciones y advertencias

- Dosis de pesticidas potencialmente obsoletas: el modelo reproduce dosis de notas históricas del KCC (2009-2023); algunos productos pueden haber cambiado su estado de registro en India (por ejemplo, el Monocrotofós está prohibido para hortalizas). Verificar siempre con la etiqueta del producto y el Raitha Samparka Kendra local antes de usar.
- Sin datos en vivo por diseño: no puede conocer el clima actual, precios de mercado ni el estado de esquemas gubernamentales; está entrenado para declararlo, pero el usuario debe ser consciente de esta limitación.
- Calidad lingüística desigual: las respuestas en inglés son coherentes y fundamentadas; las respuestas en kannada son frecuentemente disfluentes, repetitivas o con deriva factual. El kannada debe tratarse como experimental.
- Alucinación de nombres de variedades: se ha observado invención de variedades (por ejemplo, "Arka Ragi" para ragi). Cualquier recomendación de variedad debe verificarse con fuentes oficiales.
- Sesgo geográfico: el consejo está orientado a las condiciones agroclimáticas de Karnataka; no debe asumirse que es transferible a otras regiones.
- Modelo pequeño (1,7 B): puede cometer errores; las respuestas deben tratarse como orientación, no como hecho.
- No sustituye el análisis de suelo, el diagnóstico experto en campo ni los avisos oficiales del gobierno.
- Restricciones de datos de entrenamiento: los datos del KCC son datos abiertos del gobierno indio; el profesor gemma-3-27b-it se usó según los Términos de Uso de Gemma (Google no reclama derechos sobre las salidas); la traducción con IndicTrans2 es MIT. La licencia Apache-2.0 del modelo final permite uso comercial, pero conviene revisar la procedencia de los datos si se requiere trazabilidad completa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/santosh07401/krishi-sathi-qwen-1.7b
- Variante recomendada para kannada (Sarvam-1): https://huggingface.co/santosh07401/krishi-sathi-sarvam-2b
- Modelo base Qwen3-1.7B (unsloth): https://huggingface.co/unsloth/Qwen3-1.7B
- Qwen3-1.7B en Ollama: https://ollama.com/library/qwen3:1.7b
- Repositorio oficial Qwen (GitHub): https://github.com/QwenLM/Qwen
- Otro modelo del mismo autor (piiguard-qwen3-1.7b): https://huggingface.co/santosh07401/piiguard-qwen3-1.7b
