# DICPlay/RusMind-4.5-Momentum

## Resumen

RusMind 4.5 · Momentum es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por DICPlay, derivado mediante fine-tuning de google/gemma-4-E2B-it. Está diseñado específicamente para el idioma ruso (con soporte secundario de inglés) y optimizado para ejecución en dispositivo (on-device), sin conexión a internet, en portátiles, equipos de sobremesa convencionales y teléfonos móviles. Su principal reclamo es ofrecer un rendimiento competitivo en tareas rusas con un coste computacional muy reducido: 4.647 millones de parámetros totales pero solo unos 2.000 millones activos por token, lo que lo sitúa en la categoría de modelos ligeros.

El modelo se distribuye en formato GGUF, pensado para llama.cpp, LM Studio y Ollama, y forma parte de una familia más amplia (RusMind 4.5/4.7) en la que DICPlay posiciona variantes como Sokol (con modo de razonamiento) y Vspyshka. Momentum es la variante más ligera de la generación 4.5 y se presenta como la opción para despliegue local en hardware modesto.

Su relevancia actual radica en la combinación de arquitectura MoE de bajo coste activo, licencia propia (rusmind-license, no estándar) y enfoque explícito en el mercado rusohablante, un nicho con relativamente pocos modelos abiertos optimizados para on-device. La model card inclina el discurso hacia el benchmark MERA v2, el estándar independiente para evaluar modelos en ruso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) derivada de google/gemma-4-E2B-it; transformer con expertos dispersos |
| Parámetros totales | 4.647.450.147 (≈4,65 mil millones) |
| Parámetros activos | ≈2 mil millones por token (según la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (el repo incluye pesos cuantizados; niveles concretos no especificados en la información disponible) |
| Idiomas soportados | Ruso (ru) e inglés (en) |
| Licencia | rusmind-license (licencia propia, marcada como "other"; requiere contacto para licencia de organización) |
| Formato de pesos | GGUF (librería gguf, compatible con llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de google/gemma-4-E2B-it, que emplea una arquitectura Mixture of Experts con aproximadamente 4,65 mil millones de parámetros totales y unos 2 mil millones activos por token. Esta dispersión permite que, pese al tamaño total, el coste de inferencia se acerque al de un modelo denso de 2 mil millones, lo que explica su viabilidad en dispositivos móviles y navegador. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset de fine-tuning ni si se aplicaron técnicas de RLHF o DPO; la model card solo indica mejoras cualitativas en tareas rusas (ortografía, puntuación, comprensión de personajes, humor, vocabulario dialectal y llamada a herramientas).

La innovación destacable es la combinación de eficiencia MoE con un ajuste fino orientado al ruso y al despliegue offline. No se documentan en la información proporcionada técnicas como decodificación especulativa, atención lineal o modos de razonamiento explícitos para esta variante concreta (el modo de razonamiento se atribuye a la variante Sokol de la familia). El formato de distribución es GGUF, lo que facilita su ejecución en llama.cpp y ecosistemas derivados.

## Capacidades

- Generación de texto conversacional en ruso e inglés.
- Comprensión mejorada de personajes, interlocutor, humor, acertijos y habla coloquial rusa, incluyendo vocabulario dialectal de regiones de Rusia.
- Ortografía y puntuación correctas en ruso (la model card cita una puntuación de 0,719 en corrección ortográfica y de puntuación para la variante Vspyshka 4.7, no necesariamente para Momentum).
- Llamada a herramientas (tool calling / function calling) con formato correcto, según la model card.
- Seguimiento de instrucciones complejas (atribuido a la familia 4.5).
- Ejecución on-device y offline en portátiles, equipos de sobremesa y teléfonos.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito para esta variante.

## Casos de uso

- Asistentes conversacionales locales en ruso: el modelo puede gestionar diálogos multi-turno sin conexión en un portátil o teléfono, adecuado para entornos con requisitos de privacidad o conectividad limitada.
- Corrección ortográfica y de puntuación en ruso: útil como paso de postprocesado en herramientas de escritura o en pipelines editoriales, dado el énfasis de la familia en gramática rusa.
- Atención al cliente en ruso con despliegue on-premise: al ejecutarse en hardware modesto, permite instalar el modelo en infraestructura propia sin depender de la nube.
- Automatización de llamadas a herramientas en asistentes de productividad: su soporte de tool calling permite integrarlo en flujos que consulten APIs o bases de datos locales.
- Procesamiento de lenguaje dialectal y coloquial ruso: aplicable a análisis de reseñas, redes sociales o transcripciones donde el registro informal y los regionalismos son frecuentes.
- Prototipado rápido y evaluación de modelos en entornos de investigación: su formato GGUF y su bajo coste activo facilitan experimentos en GPU de consumo.
- Aplicaciones educativas o de accesibilidad offline en ruso: generación de explicaciones o resúmenes en dispositivos sin conexión.

## Benchmarks y rendimiento

La información proporcionada incluye datos de MERA v2 para otras variantes de la familia (Vspyshka 4.7, Sokol 4.7) y referencias cualitativas para Momentum, pero no una tabla numérica completa y específica de RusMind 4.5 · Momentum. Los datos citados en la model card sobre Momentum son afirmaciones comparativas sin cifras completas:

| Comparación (MERA v2, según model card) | Resultado declarado |
|---|---|
| Puesto en cultura y regiones de Rusia (≤5 mil millones de parámetros) | Nº1 |
| Puesto en tareas centradas en el ser humano (≤5 mil millones) | Nº1 |
| Comparación con A-Vibe (8 mil millones), Zero-Mistral-Small (24 mil millones), Gemma 4 E2B y Qwen3.5-4B | Afirma superarlos en puntuación global |
| Comparación en razonamiento con T-lite (8 mil millones), Zero-Mistral (24 mil millones) y A-Vibe (8 mil millones) | Afirma superarlos |

No se han publicado en la información disponible cifras completas y verificables de MMLU, HumanEval, GSM8K ni del resto de tareas de MERA v2 para esta variante concreta. Los valores numéricos citados (0,191; 0,279; 0,136) corresponden a otras variantes de la familia, no a Momentum 4.5.

## Requisitos de hardware

- VRAM estimada: con 4,65 mil millones de parámetros totales y formato GGUF, una cuantización de 4 bits requeriría aproximadamente 3-4 GB de memoria; en 8 bits, en torno a 5-6 GB. Estas cifras son estimaciones basadas en el tamaño, no datos publicados.
- GPU recomendadas: el modelo está pensado para ejecución en CPU y GPU integradas; en GPU dedicadas, tarjetas de consumo como RTX 3060/4060 o superiores serían suficientes para cuantizaciones de 4-8 bits.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de GPU con 6 GB o más de VRAM en cuantización de 4 bits; también en teléfonos de gama alta y en navegador según la model card.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (mencionados explícitamente en la model card); compatible con endpoints (tag endpoints_compatible).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| RusMind 4.5 · Momentum (DICPlay) | 4,65 mil millones | ≈2 mil millones | no disponible | rusmind-license | GGUF | On-device, ruso/inglés |
| Gemma 4 E2B (Google) | no disponible | no disponible | no disponible | licencia Gemma | safetensors/GGUF | Modelo base del que deriva |
| T-lite (T-Bank) | 8 mil millones | denso | no disponible | no disponible | no disponible | Referencia rusa en MERA |
| Qwen3.5-4B (Alibaba) | 4 mil millones | denso | no disponible | no disponible | no disponible | Referencia multilingüe |

Las comparaciones de rendimiento en MERA v2 las aporta la propia model card y no se han podido verificar de forma independiente con los datos disponibles. No se dispone de cifras de contexto ni de rendimiento detallado de los competidores en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al estar orientado al ruso, puede reflejar sesgos culturales y regionales del corpus de ajuste.
- Riesgo de alucinación: no cuantificado; como modelo de 2 mil millones de parámetros activos, es esperable una mayor propensión a errores factuales que modelos de mayor tamaño.
- Limitaciones de idioma: soporte declarado solo para ruso e inglés; el rendimiento en otros idiomas no está garantizado.
- Limitaciones de contexto: la longitud de contexto no está especificada, lo que impide planificar usos con documentos largos.
- Licencia: rusmind-license es una licencia propia no estándar; el uso comercial y organizativo requiere revisar los términos y, según la model card, contactar con el autor para licencias de organización.
- Caveat de producción: los benchmarks citados proceden del propio autor y de la plataforma MERA; conviene validar el rendimiento en el caso de uso concreto antes de desplegar.
- El modelo está marcado como obsoleto por el propio autor, que recomienda migrar a RusMind 4.7.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-4.5-Momentum
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Demo y sitio del proyecto: https://rusmind.ru
- Benchmark MERA v2: https://mera.a-ai.ru/ru/text/leaderboard
- Variante recomendada (RusMind 4.7 · Momentum): https://huggingface.co/DICPlay/RusMind-4.7-Momentum
- Variante Sokol 4.7: https://huggingface.co/DICPlay/RusMind-Sokol-4.7
- Variante Vspyshka 4.7: https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7
- Contacto del autor (Telegram): https://t.me/DanKirillin
- Contacto del autor (MAX): https://max.ru/u/f9LHodD0cOIENg5eShucR-RyhC02ijx-XXjPGcPbjBRy6_KKvmdKIu9tdQU
