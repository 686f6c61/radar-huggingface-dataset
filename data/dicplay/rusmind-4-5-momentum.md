# DICPlay/RusMind-4.5-Momentum

## Resumen

RusMind 4.5 · Momentum (Моментум) es un modelo de lenguaje de tipo Mixture-of-Experts desarrollado por DICPlay, orientado a inferencia en dispositivo (on-device) y uso sin conexión. Se trata de un fine-tuning del modelo base google/gemma-4-E2B-it, adaptado específicamente al ruso y al inglés, con un total de 4.647.450.147 parámetros de los cuales aproximadamente 2.000 millones se activan por token durante la generación. Esta relación entre parámetros totales y activos es la que permite que el modelo funcione en portátiles, equipos de sobremesa convencionales y teléfonos móviles de gama alta.

El modelo se distribuye exclusivamente en formato GGUF (cuantizado), lo que lo hace directamente compatible con llama.cpp, LM Studio y Ollama. Su tamaño de repositorio es de 9,3 GB. La propuesta de valor principal es ofrecer un rendimiento en tareas de razonamiento en ruso que, según la model card, supera a modelos con un número de parámetros activos entre 4 y 12 veces mayor, medido en el benchmark independiente MERA v2 (Multimodal Evaluation for Russian-language Architectures), gestionado por el Alianza en el ámbito de la IA (Sber, Yandex, MTS, VK y otros).

Es relevante ahora porque el ecosistema ruso de modelos abiertos está consolidándose en torno a benchmarks independientes como MERA v2, y porque la familia RusMind 4.5 representa un salto generacional respecto a la base Gemma en tareas de ruso: puntuación y ortografía, comprensión de personajes, humor, habla coloquial, dialectos regionales y llamada a herramientas en el formato correcto. La model card recomienda, no obstante, migrar a la versión posterior RusMind 4.7 · Momentum, que obtiene 0,136 en MERA v2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sobre transformer, fine-tuning de google/gemma-4-E2B-it |
| Parametros totales | 4.647.450.147 |
| Parametros activos | aproximadamente 2.000 millones por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (niveles concretos no disponibles) |
| Idiomas soportados | ruso (ru), inglés (en) |
| Licencia | rusmind-license (license: other) |
| Formato de pesos | GGUF (librería gguf, compatible con llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint google/gemma-4-E2B-it, que emplea una arquitectura Mixture-of-Experts con 4,65 mil millones de parámetros totales y aproximadamente 2 mil millones activos por token. Esta configuración reduce el coste computacional por token generado frente a un modelo denso del mismo tamaño total, lo que habilita la inferencia en CPU y en dispositivos móviles. La model card no detalla la composición del dataset de fine-tuning, el número de tokens de entrenamiento, ni si se aplicaron técnicas de RLHF, DPO o similares.

Las mejoras declaradas por el autor respecto a la base Gemma se centran en el dominio del ruso: corrección ortográfica y de puntuación, comprensión de personajes y del interlocutor, interpretación de adivinanzas, humor, habla coloquial y léxico dialectal de distintas regiones de Rusia, y emisión precisa de llamadas a herramientas en el formato esperado. No se documentan innovaciones arquitectónicas propias (decodificación especulativa, atención lineal u otras); el valor diferencial está en el ajuste fino y en la distribución cuantizada para ejecución local.

## Capacidades

- Generación de texto conversacional en ruso e inglés, con especial énfasis en la calidad del ruso.
- Razonamiento de múltiples pasos, con resultados destacados en la sección de razonamiento de MERA v2.
- Llamada a herramientas (tool calling / function calling) en el formato correcto, según declara el autor.
- Corrección ortográfica y de puntuación en ruso (0,719 en la métrica correspondiente de MERA v2 según la model card).
- Comprensión de personajes, humor, adivinanzas, lenguaje coloquial y dialectos regionales rusos.
- Conocimiento de cultura y regiones de Rusia, con el mejor resultado declarado entre modelos de hasta 5 mil millones de parámetros.
- Tareas humanocéntricas (comprensión del interlocutor), con el mejor resultado declarado entre modelos de hasta 5 mil millones de parámetros.
- Ejecución en dispositivo y sin conexión (offline), sin dependencia de API.
- Compatibilidad con endpoints (tag endpoints_compatible) para integración en servicios.

## Casos de uso

- Asistentes conversacionales en ruso para aplicaciones móviles: al ejecutarse en el propio dispositivo con unos 2 mil millones de parámetros activos, permite conversaciones multi-turno sin enviar datos a la nube, lo que resulta adecuado para escenarios con requisitos de privacidad o conectividad intermitente.
- Corrección y normalización de texto en ruso: el modelo declara una puntuación de 0,719 en corrección ortográfica y de puntuación en MERA v2, por lo que puede integrarse en editores, sistemas de gestión de contenidos o pipelines de preprocesado de corpus rusos.
- Automatización de atención al cliente en ruso: su capacidad de tool calling permite conectar el modelo con sistemas de ticketing, consulta de pedidos o bases de conocimiento mediante function calling, ejecutándose localmente en el servidor de la organización.
- Procesamiento de lenguaje natural en entornos sin conectividad: despliegue en portátiles y equipos de campo para tareas de resumen, clasificación o extracción de información sobre documentación en ruso, sin depender de servicios externos.
- Prototipado rápido y experimentación con modelos MoE en local: al estar disponible en GGUF para llama.cpp, LM Studio y Ollama, sirve para evaluar el comportamiento de un MoE de ~4,6 mil millones de parámetros en hardware de consumo antes de escalar a modelos mayores de la familia RusMind.
- Aplicaciones educativas o de divulgación sobre cultura rusa: su resultado declarado como número 1 en cultura y regiones de Rusia entre modelos de hasta 5 mil millones de parámetros lo hace apto para cuestionarios, tutoría o contenido sobre historia y geografía regional.
- Integración en asistentes de escritorio con privacidad por diseño: al no requerir conexión, puede incorporarse en herramientas ofimáticas o IDE para tareas de redacción y revisión en ruso e inglés.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible corresponden al benchmark MERA v2 y se refieren a la sección de razonamiento (Reasoning), comparando RusMind 4.5 · Momentum con otros modelos:

| Modelo | Parámetros activos | MERA v2 (Reasoning) |
|---|---|---|
| RusMind 4.5 · Momentum | ~2 mil millones | 0,225 |
| T-lite (T-Bank) | 8 mil millones | 0,218 |
| Zero-Mistral | 24 mil millones | 0,213 |
| A-Vibe (Avito) | 8 mil millones | 0,187 |

La model card también afirma, sin cifras detalladas en la información proporcionada, que Momentum supera por puntuación global a A-Vibe (8 mil millones), Zero-Mistral-Small (24 mil millones), Gemma 4 E2B (Google) y Qwen3.5-4B (Alibaba). No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otras suites estándar.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio ocupa 9,3 GB en total, lo que sugiere que los archivos GGUF individuales son de menor tamaño, pero no se detallan los niveles de cuantización ni sus tamaños.
- Al tratarse de un MoE con unos 2 mil millones de parámetros activos por token, el coste computacional por token es comparable al de un modelo denso de ese orden, lo que facilita la ejecución en CPU.
- El autor indica que funciona en portátiles, equipos de sobremesa convencionales y teléfonos; no se especifican modelos de GPU concretos (A100, H100, RTX 4090, etc.).
- Despliegue: llama.cpp, LM Studio y Ollama, según la model card; el tag endpoints_compatible sugiere compatibilidad con servidores de inferencia con API compatible con OpenAI, aunque no se detalla.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MERA v2 (Reasoning) | Licencia | Formato |
|---|---|---|---|---|---|
| RusMind 4.5 · Momentum | 4,65 mil millones totales / ~2 mil millones activos | no disponible | 0,225 | rusmind-license | GGUF |
| T-lite (T-Bank) | 8 mil millones | no disponible | 0,218 | no disponible | no disponible |
| Zero-Mistral | 24 mil millones | no disponible | 0,213 | no disponible | no disponible |
| A-Vibe (Avito) | 8 mil millones | no disponible | 0,187 | no disponible | no disponible |

La comparación se limita a la sección de razonamiento de MERA v2, único dato numérico disponible. No se dispone de datos de contexto, licencia ni formato de pesos de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al estar entrenado principalmente para ruso, puede reflejar sesgos culturales y regionales de ese dominio.
- Riesgo de alucinación: no cuantificado; como todo modelo generativo, puede producir información incorrecta, especialmente fuera de los dominios cubiertos por su entrenamiento.
- Idiomas: solo ruso e inglés; el rendimiento en otras lenguas no está garantizado ni documentado.
- Longitud de contexto: no disponible, lo que impide planificar casos de uso con documentos largos.
- Licencia: rusmind-license (license: other), con condiciones no detalladas en la información proporcionada; es imprescindible revisar el archivo LICENSE del repositorio antes de cualquier uso comercial.
- La model card recomienda migrar a RusMind 4.7 · Momentum (0,136 en MERA v2) y señala que la familia 4.7 incluye variantes superiores (Sokol 4.7, Vspyshka 4.7); esta versión 4.5 puede considerarse una generación anterior.
- No se detallan los niveles de cuantización disponibles ni el contexto máximo soportado, lo que limita la estimación precisa de requisitos de memoria y latencia en producción.
- El modelo base es Gemma 4 E2B; conviene verificar las obligaciones de atribución y uso derivadas de la licencia de Gemma además de la licencia propia de RusMind.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-4.5-Momentum
- Demo en línea: https://rusmind.ru
- Benchmark MERA v2: https://mera.a-ai.ru/ru/text/leaderboard
- Versión posterior recomendada (RusMind 4.7 · Momentum): https://huggingface.co/DICPlay/RusMind-4.7-Momentum
- RusMind 4.7 · Sokol: https://huggingface.co/DICPlay/RusMind-Sokol-4.7
- RusMind 4.7 · Vspyshka: https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
