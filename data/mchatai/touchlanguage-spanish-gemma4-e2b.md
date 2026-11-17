# mChatAI/touchlanguage-spanish-gemma4-e2b

## Resumen

TouchLanguage Spanish es una distribución cuantizada del modelo google/gemma-4-E2B-it, publicada por mChatAI para su uso en la aplicación TouchLanguage Talk, un compañero de conversación en español que se ejecuta íntegramente en el dispositivo. El modelo no ha sido reentrenado ni ajustado: los pesos son los de Gemma 4 E2B sin modificar, comprimidos a 6 bits mediante el esquema `6bit_palettized_mixed_experimental` para reducir el tamaño hasta los 4,2 GB que ocupa el archivo distribuido.

La relevancia de esta ficha es acotada: no se trata de un modelo nuevo ni de un fine-tune sobre datos en español, sino de un artefacto de despliegue empaquetado para el runtime Core AI de Apple en iPhone y iPad (arm64). La competencia lingüística en español proviene del prompt de tutor que la aplicación inyecta en cada turno, no de los pesos, tal como el propio autor indica en la model card.

El contexto declarado es de 4.096 tokens y el requisito de plataforma es iOS 27.2 o superior con 8 GB de memoria. El estado del artefacto es Preview y no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de google/gemma-4-E2B-it); no se detalla la variante interna |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el nombre E2B sugiere un modelo eficiente, pero no se confirma en la informacion proporcionada) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | 6 bits, esquema `6bit_palettized_mixed_experimental` |
| Idiomas soportados | es (declarado); los pesos no incorporan especializacion linguistica segun el autor |
| Licencia | Apache-2.0 |
| Formato de pesos | ZIP con el modelo tal como lo carga el runtime Core AI de Apple (no es safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo base es google/gemma-4-E2B-it, en el commit `4adf15748de9e1a0097b6274cee9c15836c41c37`. mChatAI no aporta información sobre la arquitectura interna de Gemma 4 E2B, los datos de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF o DPO; la model card se limita a describir el proceso de compresión. La intervención del autor se reduce a la cuantización a 6 bits con un esquema paletizado mixto experimental y al empaquetado en un ZIP de 4.221.077.045 bytes con SHA-256 `41921e1535cc58c48c97ffe599d979062d68e0846a352dc9146dc5b3b283bfeb`.

La innovación técnica reseñable no está en el modelo sino en el pipeline de despliegue: el artefacto se carga directamente en el runtime Core AI de Apple sobre arm64, lo que permite inferencia local sin red en iPhone y iPad. No se documentan técnicas de decodificación especulativa, atención lineal ni optimizaciones de inferencia propias. El comportamiento conversacional se gobierna mediante una plantilla de prompt que la aplicación rellena en cada turno con el nombre y la región del tutor, el nivel CEFR del estudiante, el límite de frases y las notas acumuladas de turnos anteriores.

## Capacidades

- Generación de texto conversacional en español, orientada a diálogo oral de nivel principiante e intermedio.
- Tutoría de idiomas guiada por prompt: respuestas breves, una pregunta por turno, corrección implícita en nivel intermedio y explicaciones gramaticales solo bajo petición.
- Memoria de conversación a corto plazo mediante notas inyectadas en el prompt (nombres, lugares, planes), limitada por la ventana de 4.096 tokens.
- Adaptación al nivel del estudiante mediante instrucciones de nivel CEFR incluidas en la plantilla.
- Manejo de entrada ruidosa procedente de reconocimiento de voz, incluida ausencia de puntuación y palabras erróneas.
- Generación con puntuación explícita para que la síntesis de voz introduzca pausas correctas.
- Ejecución completamente offline en el dispositivo, sin llamadas de red.
- No se documentan tool calling, function calling, capacidades de agente multi-paso, visión, audio nativo ni modo de razonamiento explícito.

## Casos de uso

- Práctica de conversación oral en español sin conexión: la aplicación captura voz, transcribe, pasa el texto al modelo con la plantilla de tutor y sintetiza la respuesta; encaja en escenarios de viaje o zonas sin cobertura gracias a la inferencia local.
- Tutoría de nivel principiante con respuestas de una o dos frases: el límite `maxSentences` de la plantilla evita respuestas largas y mantiene el turno de palabra en el estudiante.
- Corrección implícita en nivel intermedio: el modelo reformula el error dentro de su respuesta en lugar de señalarlo, lo que reduce la interrupción del flujo conversacional.
- Simulación de interlocutor nativo por región: la plantilla permite fijar `personaRegion` y `personaDetails`, útil para practicar variantes dialectales del español.
- Preparación de vocabulario situacional (cocina, compras, transporte): el ejemplo de la model card muestra una conversación sobre preparar pasta, con vocabulario concreto introducido por el propio estudiante.
- Práctica de gramática bajo demanda: el estudiante puede pedir una explicación puntual y el modelo la proporciona sin desviar el resto de la sesión.
- Distribución de una app de aprendizaje con modelo embebido: el ZIP y su hash permiten a la aplicación verificar la integridad de la descarga antes de instalar el modelo en el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los únicos datos de rendimiento aportados son de despliegue en un iPad mini (A17 Pro) con iOS 27.3: primera respuesta en 7 segundos y respuestas posteriores entre 1,2 y 1,6 segundos.

## Requisitos de hardware

- Almacenamiento: 4,2 GB instalados (ZIP de 4.221.077.045 bytes).
- Memoria: 8 GB de RAM en el dispositivo.
- Plataforma: iOS 27.2 o superior, arquitectura arm64 (iPhone y iPad).
- Runtime: Core AI de Apple; el artefacto no está pensado para vLLM, llama.cpp, Ollama ni TGI.
- GPU de escritorio: no aplica; no se documenta despliegue en A100, H100 ni RTX 4090.
- Latencia medida: 7 s para la primera respuesta y 1,2–1,6 s por respuesta en iPad mini (A17 Pro).
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Plataforma |
|---|---|---|---|---|---|
| mChatAI/touchlanguage-spanish-gemma4-e2b | no disponible | 4.096 | ZIP para Core AI (6 bits) | Apache-2.0 | iOS/iPadOS arm64 |
| google/gemma-4-E2B-it | no disponible | no disponible | safetensors (modelo base) | Apache-2.0 | Multiplataforma |
| Otras distribuciones cuantizadas de Gemma 4 E2B | no disponible | no disponible | GGUF / otros | Apache-2.0 (segun el base) | llama.cpp, Ollama, etc. |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas opciones. La diferencia práctica entre este artefacto y el modelo base es el formato de despliegue y la compresión a 6 bits, no las capacidades del modelo.

## Limitaciones y advertencias

- Los pesos no están especializados en español: el comportamiento en español depende por completo del prompt de la aplicación. Fuera de ese contexto, el modelo se comporta como Gemma 4 E2B genérico.
- El autor advierte de que, como cualquier modelo pequeño, puede perder detalles de conversaciones largas; la ventana de 4.096 tokens acota además la memoria efectiva.
- Riesgo de alucinación inherente al modelo base; no se documentan evaluaciones de fidelidad ni de sesgo.
- No hay información sobre sesgos conocidos ni sobre la composición del dataset de entrenamiento original.
- El artefacto está atado al runtime Core AI de Apple y a iOS 27.2+: no es portable a otras plataformas ni a frameworks de inferencia estándar.
- Estado Preview: sin descargas ni validación comunitaria registrada, y sin garantías de estabilidad del formato de compresión experimental.
- La licencia Apache-2.0 se hereda del modelo base; conviene verificar los términos de uso de Gemma 4 E2B publicados por Google antes de un despliegue comercial.
- El uso previsto es la app TouchLanguage; no se documenta soporte para tool calling ni integración en pipelines de agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mChatAI/touchlanguage-spanish-gemma4-e2b
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Catálogo de modelos on-device de mChatAI: https://mchatai.com/cloud/LocalLLMs
