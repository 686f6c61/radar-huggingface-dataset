# santosh07401/krishi-sathi-sarvam-2b

## Resumen

Krishi Sathi 2B (Sarvam) es un asistente agrícola bilingüe (kannada e inglés) desarrollado por santosh07401, diseñado para funcionar completamente offline en teléfonos Android de gama baja. Se basa en el modelo Sarvam-1 de Sarvam AI, un modelo de lenguaje pequeño preentrenado desde cero con énfasis en idiomas indios, y ha sido afinado mediante LoRA para responder consultas de asesoramiento agrícola específicas de Karnataka, India. El modelo resuelve el problema de acceso a información agronómica fiable en zonas rurales con conectividad limitada, ofreciendo respuestas prácticas en kannada y rechazando de forma explícita preguntas sobre datos en vivo como precios o clima.

La relevancia actual radica en la creciente demanda de asistentes de IA locales y ligeros para mercados emergentes, donde los modelos grandes no son viables por limitaciones de hardware y ancho de banda. Con 2.525 millones de parámetros y una cuantización Q4_K_M en GGUF de aproximadamente 1,5 GB, el modelo es desplegable en dispositivos de bajo coste. Su licencia es de investigación no comercial, lo que limita su uso en producción sin acuerdo con Sarvam AI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Sarvam-1) |
| Parámetros totales | 2.525.087.744 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q4_K_M (GGUF) |
| Idiomas soportados | Kannada (kn), Inglés (en) |
| Licencia | Sarvam AI Research License (no comercial) |
| Formato de pesos | Safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tune LoRA del checkpoint Sarvam-1 de Sarvam AI, que a su vez es un modelo transformer denso de 2B parámetros preentrenado desde cero. Según la información disponible, Sarvam-1 está orientado a 10 idiomas indios más inglés, y su tokenizer está optimizado para lenguas índicas, lo que reduce el número de tokens por frase en kannada en aproximadamente 3,8 veces comparado con alternativas como Qwen3-1.7B. El fine-tune se realizó con datos agrícolas específicos: consultas del Kisan Call Centre de Karnataka (~42.000 llamadas reales destiladas en ~2.900 grupos), Q&A de agronomía adaptada a India, y ~1.650 ejemplos de "honestidad offline" que enseñan al modelo a rechazar preguntas sobre datos en vivo. La generación de respuestas de entrenamiento fue asistida por gemma-3-27b-it, preservando las dosis de pesticidas de las fuentes originales. El modelo se distribuye en formato Llama-2 chat con prompt de una sola vuelta.

## Capacidades

- Generación de texto en kannada e inglés con fluidez práctica en contextos agrícolas.
- Asesoramiento agronómico: cultivos, fertilizantes, plagas, riego, prácticas de labranza.
- Rechazo explícito de preguntas sobre precios de mercado, clima, estado de esquemas gubernamentales y disponibilidad de tiendas, derivando a canales oficiales (e-NAM/APMC, Meghdoot/IMD, Raitha Samparka Kendra).
- Funcionamiento offline completo en dispositivos con recursos limitados.
- Formato de prompt Llama-2 (single turn), compatible con sistemas de chat simples.
- No soporta tool calling ni razonamiento multi-paso avanzado; está diseñado para consultas directas.

## Casos de uso

- Atención al agricultor en campo: un agricultor en Karnataka formula una pregunta en kannada sobre el tratamiento de una plaga concreta y el modelo responde con recomendaciones generales, siempre derivando a la verificación local.
- Aplicación móvil de asistencia agrícola offline: integración en una app Android que carga el GGUF con llama.cpp u Ollama, permitiendo consultas sin conexión a internet.
- Formación y extensión agrícola: uso como material de referencia para trabajadores de extensión que necesitan respuestas rápidas en kannada sobre prácticas de cultivo.
- Sistema de triaje en centros de llamadas: preprocesamiento de consultas frecuentes para reducir la carga de operadores humanos, con respuestas en inglés o kannada.
- Educación en agronomía: estudiantes y técnicos pueden consultar conceptos básicos de cultivo, dosis de fertilizantes y manejo integrado de plagas.
- Prototipo de investigación en NLP agrícola: sirve como base para estudiar la adaptación de modelos pequeños a dominios específicos con datos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una "smoke eval v4" cualitativa que indica fluidez en kannada y rechazo correcto de preguntas sobre datos en vivo, pero no se proporcionan métricas numéricas. Tampoco hay comparativas cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: ~2 GB con cuantización Q4_K_M (1,5 GB de pesos + overhead).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (ej. NVIDIA GTX 1650, RTX 3050) o incluso CPU con 4 GB de RAM.
- Cabe en teléfonos Android de gama baja con 3-4 GB de RAM, ejecutándose vía llama.cpp o aplicaciones basadas en GGUF.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, o cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles; la model card indica que la generación es ~4× más rápida que Qwen3-1.7B en dispositivo gracias a la menor cantidad de tokens por frase en kannada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Observaciones |
|---|---|---|---|---|---|
| Krishi Sathi 2B (Sarvam) | 2,5B | No disponible | Kannada, inglés | Sarvam AI Research (no comercial) | Fine-tune agrícola específico, GGUF Q4_K_M |
| Qwen3-1.7B | 1,7B | No disponible | Multilingüe (incluye inglés, no kannada nativo) | Apache 2.0 (probablemente) | Descartado por menor fluidez en kannada y más tokens por frase |
| Sarvam-2b (checkpoint v0.5) | 2B | No disponible | 10 idiomas indios + inglés | Sarvam AI Research | Modelo base más grande, no afinado para agricultura |

La model card indica que Sarvam-1 fue elegido frente a Qwen3-1.7B por su mejor tokenización y fluidez en kannada, con ~3,8× menos tokens por frase, lo que se traduce en una generación ~4× más rápida en dispositivos.

## Limitaciones y advertencias

- Licencia de investigación no comercial: cualquier uso en producción requiere acuerdo con Sarvam AI.
- Las dosis de pesticidas en respuestas en inglés pueden desviarse de los valores fuente; no deben mostrarse directamente al agricultor sin la tabla de verificación complementaria (`dosage_table.json`).
- Puede sugerir químicos legacy cuyo registro ha cambiado (ej. Monocrotophos, prohibido para vegetales en India).
- Ocasionales colas de boilerplate de seguridad y mezcla de idiomas al inicio de respuestas en kannada.
- No es un sustituto de pruebas de suelo, diagnóstico experto ni avisos oficiales.
- Limitado a un solo turno de conversación; no soporta diálogos multi-turno complejos.
- El contexto de entrenamiento es específico de Karnataka; puede no generalizar bien a otras regiones o cultivos.
- No se han publicado resultados de benchmarks cuantitativos, por lo que el rendimiento real en tareas estandarizadas es desconocido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/santosh07401/krishi-sathi-sarvam-2b
- Modelo base Sarvam-1: https://huggingface.co/sarvamai/sarvam-1
- Licencia Sarvam AI Research: https://huggingface.co/sarvamai/sarvam-1/blob/main/LICENSE.md
- Checkpoint temprano Sarvam-1 v0.5: https://huggingface.co/sarvamai/sarvam-1-v0.5
- GGUF de Sarvam-2b v0.5 (referencia): https://huggingface.co/RichardErkhov/sarvamai_-_sarvam-2b-v0.5-gguf
- Web de Sarvam AI: https://www.sarvam.ai/
