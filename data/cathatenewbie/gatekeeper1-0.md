# CatHateNewbie/gatekeeper1.0

## Resumen

Gatekeeper 1.0 es un modelo conversacional de pequeño tamaño publicado en Hugging Face por el usuario CatHateNewbie, con aproximadamente 494 millones de parámetros y distribuido en formato GGUF. El nombre y la etiqueta "conversational" sugieren que está orientado a tareas de diálogo, posiblemente como modelo ligero de moderación, filtrado o control de acceso conversacional ("gatekeeper"), aunque la model card no incluye descripción alguna del propósito, el entrenamiento ni las capacidades del modelo.

La ficha del modelo es prácticamente inexistente: se limita a declarar la licencia Apache 2.0, lo que obliga a extremar la cautela a la hora de evaluar su idoneidad para producción. No hay información sobre la arquitectura base, los datos de entrenamiento, el contexto soportado ni los benchmarks. Con 18 descargas y 1 like en el momento de redactar esta ficha, se trata de un modelo de nicho sin comunidad de usuarios que haya validado su comportamiento.

Su relevancia actual es limitada y su interés principal es experimental: puede resultar útil para quien busque un modelo muy pequeño en formato GGUF (0,5 GB de repositorio) capaz de ejecutarse en hardware modesto, pero requiere evaluación propia rigurosa antes de cualquier uso serio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 494.032.768 (~494 M) |
| Parametros activos | no aplicable (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato GGUF, cuantizaciones concretas no especificadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La model card no proporciona información sobre la arquitectura del modelo. Dado el tamaño de aproximadamente 494 millones de parámetros y el formato GGUF, es plausible que se trate de un modelo transformer decoder-only derivado de una base pública de tamaño similar (por ejemplo, una familia de modelos en el rango de 0,5 B), pero esto es una hipótesis no confirmada por el autor y no debe tomarse como dato.

Tampoco hay datos sobre el corpus de entrenamiento: se desconoce el número de tokens, la composición del dataset y si se aplicaron técnicas de alineación como SFT, RLHF o DPO. La etiqueta "conversational" indica únicamente que el pipeline previsto es el de conversación. Ninguna innovación técnica está documentada.

## Capacidades

- Conversación: el modelo está etiquetado como conversational, por lo que su uso previsto es el diálogo multi-turno.
- Posible función de moderación o filtrado: el nombre "gatekeeper" sugiere clasificación o control de contenido conversacional, pero no está documentado.
- No hay información verificada sobre capacidades de código, razonamiento matemático, visión, audio, tool calling ni soporte de agentes.
- Idiomas soportados: no disponible.

## Casos de uso

- Chatbots ligeros en local: con solo 0,5 GB de repositorio en GGUF, puede servir como asistente conversacional mínimo en dispositivos sin GPU, como portátiles antiguos o SBC tipo Raspberry Pi, donde modelos de 7 B o más no son viables.
- Prototipado y experimentación: útil para desarrolladores que quieran probar pipelines de inferencia con llama.cpp u Ollama sin descargar repositorios de varios gigabytes.
- Filtrado de entradas conversacionales: si el modelo ha sido entrenado como clasificador o guardián de diálogo, podría usarse como primera capa de moderación antes de pasar consultas a un modelo mayor; esto requiere validación propia dado que no está documentado.
- Educación y docencia: su pequeño tamaño lo hace adecuado para explicar en clase cómo funciona la inferencia local de LLM, la cuantización GGUF y la gestión de contextos.
- Pruebas de latencia en edge: al ser un modelo de menos de 500 M de parámetros, permite medir throughput y latencia en hardware de consumo para comparar con alternativas mayores.
- Integración en aplicaciones con recursos muy limitados: apps móviles o de escritorio que necesiten respuestas conversacionales básicas sin conexión y sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de ~494 M de parámetros en cuantizaciones GGUF típicas (Q4_K_M a Q8_0) ocupa aproximadamente entre 0,3 y 0,6 GB de memoria; no se necesita GPU dedicada.
- GPU recomendadas: no son necesarias; cualquier GPU moderna lo ejecuta con holgura si se desea aceleración.
- Consumer GPU: cabe sobradamente en cualquier GPU con 2 GB de VRAM o más; también funciona por CPU pura.
- Opciones de despliegue: llama.cpp y Ollama de forma nativa por ser GGUF; también es compatible con LM Studio, KoboldCpp y cualquier runtime que soporte GGUF. vLLM y TGI no soportan GGUF directamente (requerirían pesos originales, que no constan en el repo).
- Latencia y throughput: no disponibles; por tamaño, es de esperar respuestas rápidas incluso en CPU moderna (del orden de decenas de tokens por segundo), pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| CatHateNewbie/gatekeeper1.0 | ~494 M | no disponible | Apache 2.0 | GGUF, sin model card ni benchmarks |
| Qwen2.5-0.5B-Instruct | ~494 M | 32.768 tokens (128 K con YaRN) | Apache 2.0 | Base comercial muy usada, multilingüe, bien documentada |
| Llama 3.2 1B Instruct | ~1.240 M | 131.072 tokens | Llama 3.2 Community License | Mayor tamaño, ecosistema maduro |
| SmolLM2-360M-Instruct | ~360 M | 8.192 tokens | Apache 2.0 | Alternativa ligera de Hugging Face con documentación completa |

Frente a estas alternativas, Gatekeeper 1.0 ofrece una licencia permisiva y un tamaño similar a Qwen2.5-0.5B, pero carece de documentación, benchmarks y comunidad, por lo que las opciones citadas son opciones más seguras salvo necesidad muy específica.

## Limitaciones y advertencias

- Documentación inexistente: la model card no describe arquitectura, entrenamiento, capacidades ni restricciones, lo que impide evaluar sesgos, alucinaciones o fiabilidad.
- Sin benchmarks publicados: no hay forma de comparar su calidad con modelos de referencia sin realizar evaluaciones propias.
- Origen desconocido: no consta qué modelo base utiliza ni qué datos de entrenamiento, lo que supone un riesgo de seguridad y de comportamiento impredecible en producción.
- Idiomas no especificados: no se sabe en qué idiomas funciona; el castellano podría no estar soportado adecuadamente.
- Contexto desconocido: sin longitud de contexto documentada, no es posible planificar aplicaciones con documentos largos o conversaciones extensas.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, por lo que no hay restricciones legales relevantes; el riesgo es técnico, no legal.
- Adopción marginal: 18 descargas indican ausencia de validación comunitaria; cualquier uso en producción exige pruebas exhaustivas de seguridad, sesgo y calidad de respuesta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CatHateNewbie/gatekeeper1.0
