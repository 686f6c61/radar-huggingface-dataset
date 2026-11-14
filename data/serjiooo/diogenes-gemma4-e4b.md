# Serjiooo/diogenes-gemma4-e4b

## Resumen

Diogenes v4 es un fine-tune de tipo persona sobre `unsloth/gemma-4-E4B-it`, el modelo instructivo de la familia Gemma 4 de Google con aproximadamente 8.000 millones de parámetros totales según los pesos en safetensors del repositorio. Lo desarrolla el usuario Serjiooo como experimento personal: el modelo responde imitando a Diógenes de Sinope, el filósofo cínico, con réplicas breves, directas y en un inglés sencillo y roto, sin ofrecer consejos ni ejercer de terapeuta.

El problema que aborda es muy concreto: mantener una persona estrecha y coherente en un modelo pequeño que pueda ejecutarse en local en una GPU de portátil de unos 6 GB, con unos pocos segundos por respuesta. No pretende ser un asistente general, sino un banco de pruebas sobre hasta dónde llega un modelo de clase 4B cuando se le especializa en un único rol con datos filtrados y verificados.

Es relevante ahora por dos motivos. Primero, demuestra un flujo de trabajo reproducible y barato: SFT con LoRA sobre Unsloth, unas 460 muestras y unos 15 minutos en una sola GPU. Segundo, ilustra con honestidad los límites de este tipo de ajustes: el propio autor documenta que en mensajes largos, desordenados o en hinglish el modelo falla más, y que su mecanismo de seguridad para crisis es poco fiable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4), fine-tune con LoRA fusionado en pesos de 16 bits |
| Parámetros totales | 7.996.156.490 (según safetensors del repositorio) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible en la model card; el autor recomienda `num_ctx` de 4096 en llama.cpp/Ollama |
| Tipos de cuantización | GGUF mediante `convert_hf_to_gguf.py` y `llama-quantize`; el autor usa Q4_K_M (unos 3 GB) |
| Idiomas soportados | inglés (el modelo responde siempre en inglés, incluso ante mensajes en hinglish) |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (transformers); GGUF generado por el usuario |

## Arquitectura y entrenamiento

La base es Gemma 4 E4B en su variante instruction-tuned, un transformer decoder-only de la familia Gemma 4 de Google. El ajuste se hizo con supervisión fina mediante LoRA de rango 16 y alpha 16, tasa de aprendizaje 2e-4, 2 épocas y tamaño de lote efectivo 4, usando Unsloth; después los adaptadores se fusionaron en pesos de 16 bits. Solo las respuestas son objetivo de entrenamiento: los prompts están enmascarados.

El conjunto de datos ronda las 460 muestras. Los mensajes se escribieron para el proyecto o se adaptaron de publicaciones públicas eliminando datos personales. Las respuestas las redactaron modelos Claude de Anthropic en la persona y luego se filtraron por código (sin enlaces, límite de longitud, sin frases de consejo o terapeuta, topes de imágenes recurrentes y aperturas repetidas) y revisión humana. Además se incorporó un banco de 181 anécdotas extraídas de Diógenes Laercio, *Vidas de los filósofos más ilustres*, libro VI (traducción de C. D. Yonge, dominio público), verificadas contra el texto fuente. El entrenamiento completo consumió aproximadamente 15 minutos en una sola GPU.

## Capacidades

- Generación de texto conversacional de un solo turno con una persona fija (Diógenes de Sinope).
- Respuestas breves, por debajo de unas 60 palabras, en inglés sencillo y directo.
- Recuperación de anécdotas históricas reales del banco de Diógenes Laercio (la lámpara a plena luz del día, «apártate de mi sol») cuando encajan en el contexto.
- Capacidad de burla de convenciones y excusas, con instrucción explícita de no burlarse del duelo, la pobreza, la enfermedad ni nada no elegido.
- Salida de personaje ante señales de autolesión o peligro, con derivación a un teléfono de ayuda (Tele-MANAS 14416, India), aunque de forma poco fiable.
- No soporta tool calling ni function calling según la información disponible.
- No está entrenado para razonamiento multi-paso ni para uso como agente.
- No está entrenado para conversación multi-turno: el autor indica que se use un mensaje a la vez.
- Capacidades multilingües limitadas al inglés; el hinglish se procesa peor.
- El modelo base es de tipo image-text-to-text, pero la model card no documenta capacidades de visión en este fine-tune.

## Casos de uso

- Personaje conversacional para entretenimiento local: ejecutar el modelo cuantizado a Q4_K_M en una GPU de 6 GB y ofrecer respuestas de Diógenes a mensajes del usuario, con unos segundos de latencia por réplica.
- Demostración educativa de ajuste de persona: servir como ejemplo reproducible de SFT con LoRA sobre Unsloth en un modelo de 8B, útil en talleres y tutoriales sobre fine-tuning.
- Prototipado de personajes históricos o literarios: la metodología (banco de anécdotas verificadas, filtros de código y revisión humana) se traslada a otros personajes con corpus de dominio público.
- Investigación sobre fidelidad de persona en modelos pequeños: estudiar cómo un modelo de 4B mantiene coherencia de rol y qué tipos de mensaje rompen esa coherencia.
- Generación de contenido creativo breve: producir réplicas cínicas para guiones, viñetas o bots de redes con un tono consistente y limitado en longitud.
- Evaluación de mecanismos de seguridad en personas: analizar cómo se comporta la salida de personaje ante mensajes sensibles, sabiendo que la derivación a ayuda no es fiable y que en producción debe anteponerse un mensaje de seguridad fijo.
- Banco de pruebas de cuantización e inferencia local: comparar calidad entre Q4_K_M y otros niveles GGUF en llama.cpp u Ollama con un caso de uso de persona acotado.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K). El autor incluye una evaluación propia, pequeña y declarada como aproximada:

| Evaluación | Resultado |
|---|---|
| 15 mensajes fijos, comparación ciega del autor frente a referencia Claude | v4 gana 7, Claude 6, 2 empates |
| 15 quejas no vistas, juez Selene Mini (head-to-head) | Claude 79 % de victorias frente al 50 % de v4 |
| 15 quejas no vistas, Claude como juez ciego | Claude se clasifica primero en todas las rondas (posible sesgo hacia su propio estilo) |
| Comparación con versiones v2 y v3.2 en quejas no vistas | resultados indistinguibles de v4 |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: unos 3 GB con cuantización Q4_K_M; pesos completos en 16 bits requieren aproximadamente 16 GB (tamaño del repositorio).
- El autor lo ejecuta íntegramente en una GPU de 6 GB con contexto de 4096 tokens.
- GPU recomendadas: cualquier GPU consumer con 6 GB o más (por ejemplo, RTX 3060, RTX 4060, RTX 2060) para la versión cuantizada; A100 o H100 no son necesarias y solo tendrían sentido para reentrenar o servir en 16 bits.
- Cabe en GPU consumer: sí, en las mencionadas con al menos 6 GB para Q4_K_M.
- Opciones de despliegue: llama.cpp y Ollama (flujo documentado por el autor con `convert_hf_to_gguf.py`, `llama-quantize` y un Modelfile con `RENDERER gemma4` y `PARSER gemma4`); transformers para cargar los safetensors; vLLM o TGI no están documentados en la información disponible.
- Latencia y throughput: el autor indica «unos pocos segundos por respuesta» en una GPU de portátil; no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Diogenes v4 (este) | ~8.000 M | no disponible (recomendado 4096) | Persona única, un turno, inglés | Apache 2.0 | Hugging Face, 2 descargas |
| unsloth/gemma-4-E4B-it (base) | ~8.000 M | no disponible | Asistente instructivo general | Apache 2.0 | Hugging Face (Unsloth) |
| Referencia Claude usada en la evaluación | no disponible | no disponible | Asistente general propietario | Propietaria | API de Anthropic |

No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada; la única comparación disponible es la evaluación cualitativa del autor frente a la referencia Claude descrita en la sección anterior.

## Limitaciones y advertencias

- No es terapia, ni asesoramiento, ni un modelo para emergencias; es un experimento de entretenimiento e investigación.
- El mecanismo de salida de personaje ante señales de autolesión es poco fiable: en las pruebas del autor a veces se activó demasiado pronto y llegó a inventar números de teléfono de ayuda. En cualquier despliegue público debe anteponerse un mensaje de seguridad fijo y separado.
- Riesgo de alucinación: puede inventar hechos o anécdotas pese al entrenamiento en contra; un modelo de 4B tiene límites claros.
- Mensajes largos, desordenados o en hinglish se malinterpretan con más frecuencia.
- Tiende a recurrir a un puñado de imágenes recurrentes (perro, sol, lámpara) y las respuestas pueden alargarse más de lo previsto.
- Solo responde en inglés y está pensado para un mensaje por turno; no es apto para chat multi-turno.
- No soporta tool calling ni uso como agente.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo base y los datos de entrenamiento imponen sus propias condiciones; conviene revisar la licencia de Gemma 4 y la procedencia de los datos antes de un uso comercial.
- El repositorio tiene 2 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Serjiooo/diogenes-gemma4-e4b
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- llama.cpp (conversión y cuantización GGUF): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- Fuente de las anécdotas: Diógenes Laercio, *Lives of the Eminent Philosophers*, libro VI, traducción de C. D. Yonge (dominio público)
- Teléfono de ayuda citado en la model card: Tele-MANAS 14416 (India)
