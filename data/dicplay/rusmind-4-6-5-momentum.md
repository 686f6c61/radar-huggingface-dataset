# DICPlay/RusMind-4.6.5-Momentum

## Resumen

RusMind 4.6.5 · Моментум (Momentum) es un modelo de lenguaje afinado por DICPlay a partir de `google/gemma-4-E2B-it`, distribuido principalmente en formato GGUF y orientado a inferencia local y offline en dispositivos de consumo. Se presenta como la variante más ligera de la generación 4.6 de la familia RusMind y está especializado en ruso e inglés, con un enfoque explícito en tareas de cultura y regiones de Rusia, corrección ortográfica y seguimiento de instrucciones.

El modelo parte de una arquitectura de tipo Mixture of Experts (según la nomenclatura "E2B" del modelo base y la afirmación del autor de que "en la respuesta trabajan solo 2 mil millones" de parámetros), con 4.647.450.147 parámetros totales según los pesos en safetensors. El repositorio ocupa 20,2 GB y contiene cuantizaciones GGUF para llama.cpp, LM Studio y Ollama, lo que permite ejecución en CPU, GPU de consumo y teléfonos.

Su relevancia actual radica en la combinación de tamaño reducido, licencia propia (rusmind-license) y resultados declarados en el benchmark MERA v2, donde el autor lo sitúa como número 1 entre modelos de hasta 5 mil millones de parámetros. No obstante, la mayoría de las cifras de rendimiento proceden de la propia model card y no de una evaluación independiente verificable en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), derivada de google/gemma-4-E2B-it |
| Parametros totales | 4.647.450.147 |
| Parametros activos | 2 mil millones (según model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (diversas cuantizaciones; niveles concretos no especificados) |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | rusmind-license (license: other) |
| Formato de pesos | GGUF (librería gguf); repo de 20,2 GB |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `google/gemma-4-E2B-it`, un transformer con mezcla de expertos en el que, según el autor, se activan aproximadamente 2 mil millones de parámetros por token generado sobre un total de 4,65 mil millones. Esta relación de activación explica su orientación a ejecución en dispositivo: el coste computacional por token es sustancialmente menor que el de un modelo denso del mismo tamaño total.

No se dispone de información detallada sobre el volumen de tokens de entrenamiento, la composición del dataset de ajuste fino ni si se emplearon técnicas de RLHF, DPO o similares. La model card menciona mejoras respecto a la versión 4.5.5 en seguimiento de instrucciones complejas (afirma 3,3 veces más precisión en instrucciones con múltiples requisitos), razonamiento lógico, invocación de funciones, ortografía y puntuación en ruso, y conocimiento de historia de Rusia. También se cita una evaluación de un canal japonés (Future Craft Lab) sobre comprensión del japonés con matices de cortesía, si bien el modelo declara únicamente ruso e inglés como idiomas soportados. No se documentan innovaciones arquitectónicas propias más allá del ajuste fino sobre el modelo base.

## Capacidades

- Generación de texto conversacional en ruso e inglés.
- Razonamiento lógico y resolución de tareas de múltiples pasos (sin modo de pensamiento explícito documentado).
- Seguimiento de instrucciones complejas con varios requisitos simultáneos.
- Invocación de herramientas y funciones (tool calling / function calling).
- Corrección de ortografía y puntuación en ruso.
- Conocimiento específico de cultura, regiones, eventos, fechas y personalidades de Rusia.
- Comprensión de matices lingüísticos como humor, personajes y antónimos (según la model card).
- Generación de código y razonamiento estable (según evaluación externa citada por el autor).
- Ejecución local y offline en portátiles, PC convencionales y teléfonos mediante GGUF.

## Casos de uso

- Asistentes conversacionales en ruso para atención al cliente: el modelo puede mantener diálogos multi-turno en ruso con un coste de inferencia bajo gracias a sus 2 mil millones de parámetros activos, adecuado para despliegues en servidores modestos o en el propio dispositivo del usuario.
- Corrección y edición de textos en ruso: su especialización declarada en ortografía y puntuación (0,719 en la prueba correspondiente de MERA v2 según el autor) lo hace útil para herramientas de revisión integradas en editores o procesadores de texto.
- Aplicaciones offline en dispositivos móviles: al distribuirse en GGUF y activar solo 2 mil millones de parámetros, puede embeberse en apps Android o iOS para funciones de asistencia sin conexión y sin enviar datos a la nube.
- Automatización con herramientas: el soporte de tool calling permite integrarlo en agentes que consulten APIs, bases de datos o servicios internos, con la ventaja de que el modelo puede ejecutarse en la misma máquina que el orquestador.
- Procesamiento de documentos y conocimiento regional: útil para tareas de extracción, resumen o respuesta sobre contenidos relacionados con historia y cultura de Rusia, donde el ajuste fino aporta conocimiento específico.
- Prototipado rápido y experimentación: su formato GGUF y compatibilidad con llama.cpp, LM Studio y Ollama facilitan pruebas en portátiles sin GPU dedicada, reduciendo el coste de iteración en investigación aplicada.
- Despliegue en entornos con requisitos de privacidad: al funcionar de forma local, permite procesar texto sensible en ruso sin salir del dispositivo o de la red interna.

## Benchmarks y rendimiento

La model card cita resultados del benchmark MERA v2 (Alianza en el ámbito de la IA, Rusia), pero no proporciona la tabla numérica completa para este modelo concreto. Los datos disponibles son:

| Benchmark | Resultado declarado | Nota |
|---|---|---|
| MERA v2 (general) | nº 1 entre modelos de hasta 5 mil millones de parámetros | Cifra exacta no disponible en la información |
| MERA v2 (cultura y regiones de Rusia) | nº 1 entre modelos de hasta 5 mil millones | Cifra exacta no disponible |
| MERA v2 (ortografía y puntuación, ruso) | 0,719 | Dato citado para la variante Vspyshka 4.7, no confirmado para 4.6.5 |
| Comparación con 4.5.5 | +8 % en MERA v2 | Según el autor |
| Comparación con modelo base abierto del mismo tamaño | +30 % en MERA v2 | Según el autor |

No se han publicado en la información disponible resultados numéricos de benchmarks estándar como MMLU, HumanEval o GSM8K para este modelo. Las cifras de MERA proceden de la propia model card y no se ha verificado su reproducibilidad de forma independiente en esta ficha.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta; con 4,65 mil millones de parámetros totales, una cuantización Q4 requeriría aproximadamente 2,5-3 GB de memoria, y una Q8 en torno a 5 GB (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no especificadas; por tamaño, cualquier GPU de consumo con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070) debería ser suficiente para cuantizaciones intermedias.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de tarjetas con 6 GB o más; también en CPU y en teléfonos según el autor.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (mencionados en la model card); compatible con endpoints.
- Latencia y throughput: no disponibles. El autor afirma que "vuela" en navegador y teléfono, pero no aporta métricas de tokens por segundo.

## Comparativa con modelos similares

Según la model card, el modelo se sitúa por delante de las siguientes alternativas en MERA v2 para el tramo de hasta 5 mil millones de parámetros:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Posición declarada en MERA v2 |
|---|---|---|---|---|---|
| RusMind 4.6.5 Momentum | 4,65 B totales / 2 B activos | no disponible | rusmind-license | Hugging Face (GGUF) | nº 1 hasta 5 B (autor) |
| LFM2.5 (Liquid AI) | no disponible | no disponible | no disponible | no disponible | por debajo según el autor |
| Gemma 4 E2B (Google) | ~2 B activos | no disponible | Gemma license | Hugging Face | por debajo según el autor |
| Qwen3.5-4B (Alibaba) | ~4 B | no disponible | no disponible | Hugging Face | por debajo según el autor |
| T-lite (T-Bank) | ~8 B | no disponible | no disponible | no disponible | por debajo en cultura y regiones según el autor |

Los datos de parámetros y licencias de los modelos comparados no están confirmados en la información proporcionada y deben verificarse en sus respectivas fichas.

## Limitaciones y advertencias

- Sesgos: al estar ajustado específicamente para ruso y cultura de Rusia, puede presentar sesgos culturales y geográficos derivados del corpus de ajuste; no se documentan evaluaciones de sesgo.
- Alucinación: no se han publicado tasas de alucinación ni evaluaciones de veracidad; como modelo de 2 mil millones de parámetros activos, el riesgo en tareas de conocimiento factual es relevante.
- Contexto: la longitud de contexto no está documentada, lo que impide planificar su uso en tareas de documentos largos sin verificación previa.
- Idiomas: solo se declaran ruso e inglés; el rendimiento en otros idiomas (incluido el español) no está garantizado pese a la mención anecdótica al japonés.
- Licencia: la rusmind-license es una licencia propia con condiciones no detalladas en la información disponible; es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial.
- Producción: las cifras de rendimiento proceden del autor y no de una evaluación independiente verificable; conviene validar el modelo en el caso de uso concreto antes de desplegarlo.
- Nombre y versionado: la model card recomienda migrar a RusMind 4.7, por lo que 4.6.5 puede quedar sin mantenimiento.
- Formato: la distribución principal es GGUF; no se confirma la disponibilidad de pesos completos en safetensors en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-4.6.5-Momentum
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Demo y sitio oficial: https://rusmind.ru
- Benchmark MERA v2: https://mera.a-ai.ru/ru/text/leaderboard
- Versión posterior recomendada (4.7 Momentum): https://huggingface.co/DICPlay/RusMind-4.7-Momentum
- RusMind Sokol 4.7: https://huggingface.co/DICPlay/RusMind-Sokol-4.7
- RusMind Vspyshka 4.7: https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7
