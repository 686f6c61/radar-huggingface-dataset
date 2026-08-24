# ananddey/akhorika-e2b-base

## Resumen

Akhorika E2B Base (আখৰিকা) es un modelo de lenguaje fundacional de 2,69 mil millones de parámetros desarrollado por ananddey, entrenado mediante continuación de preentrenamiento (CPT) sobre corpus asamés a partir de la arquitectura **Gemma 4 E2B** de Google. El modelo está diseñado para cubrir la brecha de recursos lingüísticos del asamés (idioma oficial de Assam, India), ofreciendo una base sólida para generación de texto y otras tareas en este idioma, con soporte adicional de inglés.

El modelo mantiene el decodificador de texto de Gemma 4 E2B con 1,91 mil millones de parámetros activos, sustituyendo el tokenizador nativo (256k) por uno personalizado de 32.000 entradas orientado al asamés, e inicializa las nuevas incorporaciones mediante el método FOCUS para alinear semánticamente las subpalabras. El resultado es un modelo compacto, de código abierto (licencia Gemma) y con un tamaño de 5,4 GB en formato safetensors, lo que lo hace viable para despliegue en GPU de consumo.

Su relevancia reside en que proporciona un recurso técnico para el desarrollo de aplicaciones en asamés, un idioma indio con pocos modelos dedicados. Al estar basado en Gemma 4 E2B, hereda una arquitectura moderna y eficiente, aunque con un vocabulario reducido y un entrenamiento específico que limita sus capacidades a los idiomas asamés e inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gemma4ForConditionalGeneration (Gemma 4 E2B) - transformer con decodificador de texto |
| Parámetros totales | 2.688.706.115 |
| Parámetros activos | 1.91 B (decodificador de texto activo) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (probablemente BF16 en los pesos originales) |
| Idiomas soportados | Asamés (as), inglés (en) |
| Licencia | Gemma (licencia de Google para modelos Gemma) |
| Formato de pesos | Safetensors (también compatible con transformers) |

## Arquitectura y entrenamiento

Akhorika E2B Base se basa en la arquitectura **Gemma 4 E2B**, un modelo multimodal de Google (originalmente diseñado para procesar texto e imágenes) pero aquí configurado exclusivamente para generación de texto. El modelo utiliza un decodificador de texto con 1,91 mil millones de parámetros activos, aunque el total alcanza los 2,69 mil millones (incluyendo embeddings y componentes adicionales). La arquitectura es de tipo transformer, con atención completa y sin mezcla de expertos explícita (no se menciona MoE en la tarjeta).

El entrenamiento consistió en **continuación de preentrenamiento (CPT)** sobre corpus asamés, partiendo del modelo base `ananddey/gemma-4-E2B-asm-init`. Se sustituyó el tokenizador original (256.000 entradas) por un tokenizador SentencePiece Unigram personalizado de 32.000 palabras con prioridad asamés. Para alinear las nuevas incorporaciones con las representaciones del modelo base, se utilizó la técnica **FOCUS** (proyección semántica de la superficie de las subpalabras), que permite mapear las nuevas subpalabras al espacio de embeddings del modelo original. El entrenamiento se completó en 821 pasos (1 época) con una pérdida de evaluación de 4.09 (perplejidad ≈60) en un conjunto de validación asamés reservado.

No se especifican detalles sobre el volumen de datos de entrenamiento ni si se aplicaron técnicas como RLHF o DPO. El modelo es una base sin ajuste fino posterior.

## Capacidades

- **Generación de texto** en asamés e inglés, con capacidad de continuar secuencias de forma coherente en ambos idiomas.
- **Comprensión de texto** básica, adecuada para tareas de clasificación, extracción o respuesta a preguntas con contexto corto.
- **Soporte de decodificación autoregresiva** estándar, compatible con el pipeline de `transformers` (`text-generation`).
- **Multilingüe limitado**: únicamente asamés e inglés, con dominio del asamés como idioma prioritario.
- **No se documentan** capacidades de tool calling, función calling, razonamiento multi-paso, modo de pensamiento o visión (aunque la arquitectura base lo permita, el modelo no está entrenado para ello).
- **Sin soporte para agentes** ni integración con herramientas externas de forma nativa.

## Casos de uso

- **Traducción automática asamés-inglés**: el modelo puede usarse como base para sistemas de traducción entre estos dos idiomas, aprovechando su dominio del asamés y el inglés. Se podría afinar con pares de frases para obtener un traductor específico.
- **Generación de contenido en asamés**: redacción de noticias, artículos, textos para redes sociales o blogs en asamés, con un estilo natural gracias al preentrenamiento en corpus asamés.
- **Chatbots de atención al cliente para la región de Assam**: al ser capaz de entender y generar asamés, puede integrarse en sistemas de soporte para responder consultas básicas en el idioma local, reduciendo barreras de acceso.
- **Análisis de sentimiento de textos asamés**: como modelo base, permite extraer características semánticas para clasificar opiniones o comentarios en asamés, útil para empresas o instituciones que monitorizan la opinión pública.
- **Reconocimiento de entidades nombradas en asamés**: se puede afinar para detectar nombres, lugares, fechas u organizaciones en textos asamés, facilitando la construcción de sistemas de información.
- **Educación y herramientas de aprendizaje**: generación de ejercicios, resúmenes o explicaciones en asamés para aplicaciones educativas, dado su conocimiento del idioma y su tamaño moderado que permite ejecutarlo en entornos modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval, GSM8K) en la información disponible. La única métrica reportada es la pérdida de evaluación de 4,09 (perplejidad aproximada de 60) sobre un conjunto de validación asamés reservado durante el entrenamiento. No se incluyen comparaciones con otros modelos.

## Requisitos de hardware

- **VRAM estimada**: los pesos en BF16 ocupan aproximadamente 5,4 GB. Con activaciones y overhead, se recomienda al menos 8 GB de VRAM para inferencia con secuencias cortas. Para contexto largo o batch grande, se necesitará más memoria (12-16 GB).
- **GPU recomendadas**: tarjetas de consumo como RTX 3090, RTX 4090, RTX 4080, o GPUs profesionales como A10G, L4, T4 (16GB) pueden ejecutar el modelo sin problemas. Incluso una RTX 4060 con 8 GB podría funcionar con cuantificación adicional.
- **Cuantización**: no se han publicado versiones GGUF o AWQ, pero al ser un modelo de `transformers`, se puede cuantificar con herramientas como `bitsandbytes` (4-bit/8-bit) o convertir a GGUF para usar con `llama.cpp` o `Ollama`.
- **Opciones de despliegue**: compatible con `transformers` (Python), `vLLM`, `Text Generation Inference` (TGI), `Ollama` (si se convierte a GGUF) y `llama.cpp`. También es compatible con plataformas de inferencia como FriendliAI (según la búsqueda web).
- **Latencia y throughput**: no se dispone de datos concretos. En una GPU de 16 GB con BF16, se puede esperar una generación de entre 20-50 tokens por segundo para un modelo de 2,7B, dependiendo de la implementación.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparación exhaustiva con modelos similares. Sin embargo, se puede comparar con su base original (Gemma 4 E2B) y con otros modelos orientados a lenguas indias:

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Akhorika E2B Base** | 2,69B total (1,91B activos) | no disponible | as, en | gemma | HuggingFace |
| **Gemma 4 E2B** (base) | 2,69B (aprox.) | no disponible | multilingüe (amplio) | gemma | HuggingFace |
| **Gemma 2B** (versión anterior) | 2,6B | 8192 | multilingüe | gemma | HuggingFace |
| **Sarvam AI** (modelos indios) | - | - | hindi, tamil, etc. | - | - |

Akhorika se diferencia por su especialización en asamés, mientras que Gemma 4 E2B base cubre muchos más idiomas. Los modelos de Sarvam AI u otros específicos para lenguas indias (como los de AI4Bharat) no tienen datos públicos comparables en esta información.

## Limitaciones y advertencias

- **Dominio limitado a dos idiomas**: el modelo solo funciona bien en asamés e inglés. No se recomienda para otros idiomas indios ni para tareas multilingües amplias.
- **Alucinación y sesgos**: al ser un modelo de base sin ajuste fino, puede generar contenido inventado o sesgado, especialmente en contextos de baja frecuencia. La perplejidad de 60 indica una capacidad de modelado del lenguaje moderada, con riesgo de incoherencias en textos largos.
- **Longitud de contexto desconocida**: no se especifica la ventana de contexto soportada. En Gemma 4 E2B original, la ventana es de 8192 tokens, pero no se confirma si se mantiene. Se debe asumir un límite de 8192 o inferior.
- **Licencia**: la licencia `gemma` permite uso comercial, pero impone restricciones de atribución y prohíbe su uso para ciertos fines (como armas, vigilancia masiva, etc.). Se debe revisar los términos oficiales de Google antes de desplegar en producción.
- **Falta de evaluación**: no hay benchmarks públicos que validen su rendimiento en tareas estándar. El uso en aplicaciones críticas debe ir precedido de pruebas internas.
- **Sin soporte para tool calling ni agentes**: no se puede usar como backend de agentes que requieran llamadas a funciones o razonamiento multi-paso.
- **Posibles sesgos de entrenamiento**: el corpus asamés puede contener sesgos culturales o lingüísticos, y el modelo no ha sido alineado con feedback humano (RLHF), por lo que puede generar contenido ofensivo o incorrecto en contextos delicados.

## Enlaces

- [Hugging Face - ananddey/akhorika-e2b-base](https://huggingface.co/ananddey/akhorika-e2b-base)
- [FriendliAI - akhorika-e2b-base (despliegue)](https://friendli.ai/models/ananddey/akhorika-e2b-base)
- [Google Gemma 4 - modelo base](https://huggingface.co/google/gemma-4-E2B)
- [Gemma 4 - página oficial de Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- [Repositorio de E2B (infraestructura, no relacionado directamente)](https://github.com/e2b-dev/e2b)
