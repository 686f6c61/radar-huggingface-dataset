# DICPlay/RusMind-4.5.5-Momentum

## Resumen

RusMind 4.5.5 · Моментум (Momentum) es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por DICPlay, orientado a inferencia local y offline en ruso e inglés. Se trata de un fine-tune del modelo base google/gemma-4-E2B-it, con 4.647.450.147 parámetros totales según los pesos en safetensors, de los cuales aproximadamente 2.000 millones se activan por token según la model card del autor. Su propuesta central es ofrecer un modelo ligero que quepa en portátiles, PC convencionales e incluso teléfonos, sin conexión a internet, manteniendo un rendimiento competitivo en tareas en ruso.

El modelo se distribuye principalmente en formato GGUF para llama.cpp, LM Studio y Ollama, y está etiquetado como compatible con endpoints. Forma parte de la familia RusMind de nueva generación 4.5, que el autor posiciona como "IA nacional" rusa. La model card promociona versiones posteriores de la familia (4.7 Моментум, 4.7 Сокол y 4.7 Вспышка) y recomienda migrar a ellas, por lo que 4.5.5 debe considerarse una versión intermedia dentro de una línea en rápida evolución.

La relevancia de este modelo radica en su relación entre tamaño activo y resultados declarados en el benchmark ruso MERA v2, donde el autor afirma que supera a modelos con 4 a 12 veces más parámetros activos en tareas de razonamiento. Todo ello con una licencia propia (rusmind-license) que conviene revisar antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) sobre base google/gemma-4-E2B-it; transformer con activación dispersa |
| Parametros totales | 4.647.450.147 |
| Parametros activos | ~2.000 millones por token (según model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (el repo distribuye cuantizaciones GGUF; niveles concretos no disponibles) |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | rusmind-license (licencia propia, categoría "other") |
| Formato de pesos | GGUF (librería gguf); pesos base derivados de safetensors |
| Tamaño del repositorio | 9,3 GB |
| Pipeline | text-generation |
| Compatibilidad | llama.cpp, LM Studio, Ollama, endpoints compatibles |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Mixture of Experts derivada de google/gemma-4-E2B-it, con 4.647 millones de parámetros totales y alrededor de 2.000 millones activos por token. Esta configuración dispersa es la que permite que el modelo "vuele" en navegador y teléfono según el autor, al reducir el coste computacional por token frente a un modelo denso del mismo tamaño total. No se especifican en la información disponible el número de expertos, la estrategia de enrutamiento ni la longitud de contexto nativa.

En cuanto al entrenamiento, la model card indica que es un fine-tune del modelo base Gemma 4 E2B instruct, con especial énfasis en ruso: lógica, acertijos, habla coloquial rusa, comprensión de personajes, corrección ortográfica y de puntuación, y seguimiento estricto de formatos en tareas de examen. No se detallan el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en ruso e inglés, con especial atención al registro coloquial ruso.
- Razonamiento y resolución de acertijos y problemas lógicos, área en la que el autor reporta mejoras respecto a la versión 4.5.
- Corrección ortográfica y de puntuación en ruso (0,719 declarado en la sección correspondiente de MERA v2 para la versión 4.7, no confirmado para 4.5.5).
- Comprensión de personajes, humor y palabras con significados opuestos en ruso.
- Seguimiento de instrucciones complejas y formatos estrictos de respuesta en tareas tipo examen.
- Llamada a herramientas (tool calling / function calling), según la model card.
- Ejecución local y offline en portátiles, PC y teléfonos, sin conexión a internet.
- Inferencia en navegador y en dispositivos móviles gracias a su reducido número de parámetros activos.
- No se documentan capacidades multimodales (visión, audio) ni modo de razonamiento explícito (thinking mode) en la información disponible.

## Casos de uso

- Asistentes conversacionales en ruso en dispositivos sin conexión: el modelo puede gestionar diálogos multi-turno en portátiles y teléfonos mediante llama.cpp u Ollama, sin depender de la nube, lo que resulta adecuado para entornos con conectividad limitada o requisitos de privacidad.
- Corrección y edición de textos en ruso: dado su énfasis declarado en ortografía y puntuación, puede integrarse en editores o pipelines de publicación para revisar borradores antes de su difusión.
- Atención al cliente automatizada en ruso: su capacidad conversacional y de seguimiento de instrucciones permite construir agentes de soporte que resuelvan consultas frecuentes en local, reduciendo costes de infraestructura.
- Aplicaciones móviles y web con inferencia en el dispositivo: al activar solo ~2.000 millones de parámetros por token, es viable empaquetarlo en apps de escritorio o navegador para funciones de resumen, reescritura o respuesta asistida.
- Generación de contenido educativo y de exámenes: su entrenamiento en formatos estrictos y tareas de razonamiento lo hace útil para generar preguntas, corregir respuestas y producir material de estudio en ruso.
- Prototipado rápido de agentes con tool calling: la compatibilidad con endpoints y llama.cpp permite integrarlo en pipelines de agentes que invoquen funciones externas (calendario, búsqueda, APIs internas) durante las fases de desarrollo.
- Procesamiento de texto en inglés como idioma secundario: aunque su foco es el ruso, el soporte de inglés permite tareas de generación y resumen bilingües en documentación técnica.

## Benchmarks y rendimiento

Los datos publicados en la model card corresponden a MERA v2 y, en su mayoría, a versiones posteriores de la familia (4.7). Para 4.5.5 no se presenta una tabla propia completa. Los datos atribuidos a "Моментум" en la model card son los siguientes:

| Benchmark (MERA v2) | RusMind Моментум (~2B activos) | T-lite · T-Bank (8B) | Zero-Mistral (24B) | A-Vibe · Avito (8B) |
|---|---|---|---|---|
| Razonamiento (Reasoning) | 0,225 | 0,218 | 0,213 | 0,187 |

El autor afirma además que Моментум es número 1 en cultura y regiones de Rusia y en tareas centradas en las personas entre modelos de hasta 5.000 millones de parámetros, y que supera en puntuación global a A-Vibe (8B), Zero-Mistral-Small (24B), Gemma 4 E2B y Qwen3.5-4B. No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización GGUF de 4 bits, un modelo de 4,6B parámetros totales ocupa del orden de 3 GB de pesos; con 8 bits, alrededor de 5-6 GB. Las cifras exactas dependen del nivel de cuantización publicado en el repo (no detallado).
- GPU recomendadas: al ser un modelo orientado a dispositivo, funciona en CPU y en GPUs de consumo; para inferencia acelerada se recomiendan RTX 3060/4060 en adelante, y para despliegue servidor A100 o H100 si se busca throughput alto (aunque el modelo está pensado para local).
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 6-8 GB de VRAM o más usando cuantizaciones de 4-8 bits; también en CPU y en teléfonos según el autor.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama y endpoints compatibles con la API de chat; el repo está etiquetado como endpoints_compatible.
- Latencia y throughput: no disponibles. El autor destaca que "vuela" en navegador y teléfono gracias a los ~2.000 millones de parámetros activos, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | MERA v2 (global/razonamiento) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RusMind 4.5.5 Моментум | 4,6B | ~2B | no disponible | 0,225 (razonamiento) | rusmind-license | GGUF en HF |
| T-lite · T-Bank | 8B | 8B (denso) | no disponible | 0,218 (razonamiento) | no disponible | no disponible en esta búsqueda |
| Zero-Mistral | 24B | 24B (denso) | no disponible | 0,213 (razonamiento) | no disponible | no disponible en esta búsqueda |
| A-Vibe · Avito | 8B | 8B (denso) | no disponible | 0,187 (razonamiento) | no disponible | no disponible en esta búsqueda |
| Gemma 4 E2B · Google | ~5B | no disponible | no disponible | no disponible | Gemma license | sí, en HF |

La comparativa se limita a los datos de razonamiento en MERA v2 que el autor incluye en la model card; no hay datos de contexto, licencia ni disponibilidad de los competidores en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al estar entrenado principalmente con datos en ruso, puede reflejar sesgos culturales y lingüísticos de ese corpus.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; el autor no publica tasas de alucinación ni evaluaciones de veracidad.
- Limitaciones de contexto e idioma: el foco es ruso e inglés; el rendimiento en otros idiomas no está garantizado y la longitud de contexto no se especifica.
- Licencia: rusmind-license es una licencia propia de categoría "other"; es imprescindible revisar el archivo LICENSE del repositorio antes de cualquier uso comercial, ya que las condiciones no son estándar.
- Modelo en evolución: el autor recomienda explícitamente migrar a RusMind 4.7 Моментум, lo que sugiere que 4.5.5 quedará obsoleto y puede no recibir mantenimiento.
- Benchmarks: los resultados de MERA v2 citados corresponden mayoritariamente a versiones 4.7 de la familia, no a 4.5.5; deben tomarse con cautela al evaluar esta versión concreta.
- Producción: no se publican datos de latencia, throughput ni estabilidad en despliegues de larga duración; conviene validar el modelo en el caso de uso concreto antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-4.5.5-Momentum
- Demo y sitio del autor: https://rusmind.ru
- Benchmark MERA v2: https://mera.a-ai.ru/ru/text/leaderboard
- Versión posterior recomendada (4.7 Моментум): https://huggingface.co/DICPlay/RusMind-4.7-Momentum
- RusMind 4.7 Сокол: https://huggingface.co/DICPlay/RusMind-Sokol-4.7
- RusMind 4.7 Вспышка: https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
