# gopalanj/maya-minicpm-o-4_5

## Resumen

Maya (Sunrise Travels) es un ajuste fino mediante LoRA del modelo de lenguaje que forma parte de MiniCPM-o 4.5, un modelo multimodal de openbmb que integra audio, visión y generación de voz. El ajuste lo publica el usuario gopalanj y su objetivo es convertir el modelo base en un agente de voz especializado en atención al cliente de una agencia de viajes ficticia, con cinco herramientas simuladas: consulta meteorológica, búsqueda de vuelos, reserva, consulta de reserva y cancelación.

El entrenamiento se realizó sobre conversaciones habladas sintéticas generadas con voces de Indic Parler-TTS y Kokoro, complementadas con respuestas del propio modelo base a preguntas generales. El resultado es un adaptador que modifica únicamente el modelo de lenguaje: la entrada de audio, la visión y el generador de voz del modelo original permanecen intactos. El repositorio incluye tanto el modelo fusionado completo como el adaptador LoRA aislado y una versión GGUF cuantizada en Q8_0 para su uso con llama.cpp-omni.

Con 9.371.787.666 parámetros en formato safetensors y un tamaño de repositorio de 28,9 GB, se trata de un prototipo de investigación: las herramientas son simuladas y la persona es ficticia. Su interés radica en demostrar un flujo completo de agente de voz con tool calling sobre una arquitectura multimodal compacta y con licencia Apache 2.0, lo que facilita su experimentación y despliegue sin restricciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la de MiniCPM-o 4.5: audio, visión y generación de voz más modelo de lenguaje); el ajuste LoRA se aplica solo al modelo de lenguaje |
| Parametros totales | 9.371.787.666 |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0 disponible en el repositorio; safetensors en precisión original; otras cuantizaciones no disponibles |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo fusionado y adaptador LoRA), GGUF (Q8_0) |

## Arquitectura y entrenamiento

El modelo parte de MiniCPM-o 4.5, una arquitectura multimodal que combina un modelo de lenguaje con codificadores de audio y visión y un generador de voz. El ajuste publicado es un LoRA sobre la componente de lenguaje: según la model card, "hearing, vision and the speech generator are unchanged". El repositorio raíz contiene el modelo fusionado, pensado para cargarse con transformers 4.51.3 y trust_remote_code=True, mientras que el directorio lora/ contiene únicamente el adaptador.

Los datos de entrenamiento son conversaciones habladas sintéticas generadas con voces de Indic Parler-TTS y Kokoro, orientadas a un agente de viajes con cinco herramientas simuladas (meteorología, búsqueda de vuelos, reserva, consulta de reserva y cancelación), mezcladas con respuestas del modelo base a preguntas generales. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. El repositorio incluye eval/report.txt con una comparación entre modelo base y ajustado sobre 412 conversaciones habladas retenidas, con ciudades, formulaciones y voces no vistas durante el entrenamiento.

## Capacidades

- Generación de texto y razonamiento conversacional en el dominio de agencia de viajes.
- Entrada de audio (comprensión del habla) heredada del modelo base, sin modificar por el LoRA.
- Generación de voz (speech-to-speech) mediante el generador de voz original de MiniCPM-o 4.5.
- Capacidades de visión heredadas del modelo base, no ajustadas.
- Tool calling sobre cinco herramientas simuladas: consulta meteorológica, búsqueda de vuelos, reserva, consulta de reserva y cancelación.
- Conversación multi-turno orientada a un flujo de agente de voz con llamadas a herramientas encadenadas.
- Respuestas a preguntas generales gracias a la mezcla de datos del modelo base en el entrenamiento.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Prototipo de agente de voz para atención al cliente: el modelo puede mantener una conversación hablada completa (entrada de audio, razonamiento y salida de voz) e invocar herramientas para resolver consultas de viajes, lo que permite evaluar el flujo extremo a extremo antes de integrar APIs reales.
- Investigación sobre tool calling en modelos multimodales pequeños: con 9.371 millones de parámetros y licencia Apache 2.0, sirve como banco de pruebas para estudiar cómo un LoRA sobre el modelo de lenguaje afecta a la selección y el encadenamiento de herramientas sin tocar los módulos de audio o visión.
- Evaluación de pipelines de voz sintética: el uso de voces de Indic Parler-TTS y Kokoro en el entrenamiento permite analizar la robustez del modelo ante distintas voces y formulaciones, con un conjunto de evaluación de 412 conversaciones retenidas.
- Despliegue en local con llama.cpp-omni: la versión GGUF Q8_0 del modelo de lenguaje, colocada junto a los ficheros de audio, visión y TTS de openbmb/MiniCPM-o-4_5-gguf, permite ejecutar el agente en entornos sin GPU de gran tamaño para demos y pruebas de latencia.
- Base para ajustes verticales en otros dominios: el adaptador LoRA aislado en lora/ puede servir de plantilla para entrenar agentes de voz especializados en reservas de restaurantes, soporte técnico o gestión de citas, reutilizando el mismo esquema de herramientas simuladas.
- Docencia y divulgación: al ser un prototipo con persona ficticia y herramientas mock, es adecuado para talleres sobre fine-tuning con LoRA, agentes conversacionales y evaluación de sistemas de voz sin exponer datos reales de clientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye eval/report.txt con una comparación entre el modelo base y el ajustado sobre 412 conversaciones habladas retenidas (ciudades, formulaciones y voces no vistas), pero no se proporcionan las métricas numéricas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 9.371 millones de parámetros, en FP16 serían necesarios aproximadamente 18,7 GB solo para los pesos, más el coste de los módulos de audio, visión y TTS del modelo base; en GGUF Q8_0 el modelo de lenguaje ronda los 9,4 GB, a lo que hay que sumar los ficheros adicionales de audio, visión y TTS.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cabría esperar que el modelo fusionado en FP16 requiera GPUs de 24 GB o más (RTX 4090, A100 40 GB, H100), pero el autor no lo especifica.
- ¿Cabe en GPU de consumo? La versión GGUF Q8_0 del modelo de lenguaje podría caber en GPUs de consumo con 12-16 GB si se mantienen los módulos auxiliares en un presupuesto de memoria controlado, pero no hay confirmación oficial.
- Opciones de despliegue: transformers 4.51.3 con trust_remote_code=True para el modelo fusionado; llama.cpp-omni con el GGUF Q8_0 junto a los ficheros de openbmb/MiniCPM-o-4_5-gguf. Otras opciones como vLLM, TGI u Ollama no están documentadas para este ajuste.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Maya (MiniCPM-o 4.5 LoRA) | 9.371.787.666 | no disponible | Apache 2.0 | Ajuste LoRA para agente de viajes con herramientas simuladas; incluye GGUF Q8_0 |
| openbmb/MiniCPM-o-4_5 (base) | no disponible en la información | no disponible | no disponible en la información | Modelo multimodal original con audio, visión y generación de voz; sin ajuste específico de dominio |
| openbmb/MiniCPM-o-4_5-gguf | no disponible en la información | no disponible | no disponible en la información | Versión GGUF oficial del modelo base, necesaria junto al GGUF de Maya para el despliegue con llama.cpp-omni |

No se dispone de datos de benchmarks ni de parámetros de contexto que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Prototipo de investigación: las cinco herramientas son simuladas (mocks) y la persona de agencia de viajes es ficticia; no debe usarse como sistema de producción sin integrar APIs reales y validación adicional.
- El ajuste solo modifica el modelo de lenguaje; las capacidades de audio, visión y generación de voz son las del modelo base y no se han adaptado al dominio.
- Riesgo de alucinación en la invocación de herramientas y en la información de viajes, especialmente fuera de las distribuciones de ciudades, formulaciones y voces vistas en entrenamiento.
- No se documentan sesgos conocidos, limitaciones de idioma ni el comportamiento del modelo ante entradas de audio ruidosas o acentos no representados en las voces sintéticas de entrenamiento.
- La longitud de contexto no está especificada, lo que dificulta planificar conversaciones largas o documentos extensos.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base openbmb/MiniCPM-o-4_5 y de los ficheros GGUF auxiliares antes de un uso comercial.
- El repositorio tiene un tamaño de 28,9 GB y muy pocas descargas (24) y likes (0), por lo que no hay evidencia comunitaria de estabilidad en despliegues reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gopalanj/maya-minicpm-o-4_5
- Modelo base: https://huggingface.co/openbmb/MiniCPM-o-4_5
- Versión GGUF del modelo base: https://huggingface.co/openbmb/MiniCPM-o-4_5-gguf
