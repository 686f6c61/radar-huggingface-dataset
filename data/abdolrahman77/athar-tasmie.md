# Abdolrahman77/athar-tasmie

## Resumen

Athar Tasmie es un espejo de distribución de un único fichero ONNX correspondiente a Zipformer Qur'an 3.1, un modelo de reconocimiento automático de voz (ASR) a nivel de fonema especializado en recitación coránica en árabe con la lectura Hafs. El modelo original es obra de Muno459 / Qur'an-Lab y se distribuye bajo la licencia NPL-1.2 (Qur'an-Lab No-Profit License). Este repositorio no entrena ni modifica el modelo: replica byte a byte el fichero `zipformer_p_arabic_v3.1.int8.onnx` (72.705.392 bytes) obtenido mediante acceso restringido aprobado en el repositorio upstream, y añade únicamente una model card explicativa.

El propósito del espejo es servir como fuente de descarga para la aplicación Android gratuita «أثر» (Athar), que incorpora una función de *tasmie* (autoevaluación de la recitación). La app descarga el modelo en el dispositivo a petición del usuario y verifica su integridad mediante SHA-256 antes de usarlo, de modo que el audio nunca abandona el teléfono.

Es relevante porque ejemplifica un caso de ASR ultraespecializado y ligero (72 MB en INT8) orientado a inferencia en dispositivo, con salida a nivel de fonema en lugar de texto ortográfico, lo que permite comparar la pronunciación del usuario con la esperada en la recitación. La información pública disponible es escasa: no se detallan arquitectura interna completa, datos de entrenamiento, benchmarks ni parámetros totales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer (streaming), salida a nivel de fonema; exportación ONNX INT8 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo streaming) |
| Tipos de cuantizacion | INT8 (único fichero publicado: `.int8.onnx`) |
| Idiomas soportados | Árabe (recitación coránica, lectura Hafs) |
| Licencia | NPL-1.2 (Qur'an-Lab No-Profit License 1.2) |
| Formato de pesos | ONNX (INT8) |
| Tamano del fichero | 72.705.392 bytes (~72,7 MB) |
| SHA-256 | `31755836528da336a6192121cd7bc82cb41752dddb65566fd000b89c8686da6b` |
| MD5 | `bf0829d45bf6bf7ec42f5c515231a9ce` |
| Tamano del repo | ~0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es Zipformer, una familia de codificadores convolucional-transformer con estructura en U y atención lineal, diseñada originalmente para ASR streaming de bajo consumo. En este caso, la salida es a nivel de fonema (no de carácter ortográfico), lo que encaja con la tarea de comparar la pronunciación del recitador con la secuencia fonética esperada del texto coránico. El modelo se distribuye como exportación ONNX cuantizada a INT8, lo que reduce el tamaño a ~72 MB y lo hace apto para ejecución en dispositivo.

No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas adicionales más allá de las propias de Zipformer. El repositorio es un espejo: no documenta el proceso de entrenamiento. La información sobre el modelo original debe consultarse en el repositorio upstream de Qur'an-Lab.

## Capacidades

- Reconocimiento automático de voz (ASR) en árabe, restringido al dominio de la recitación coránica con lectura Hafs.
- Salida a nivel de fonema, adecuada para comparar pronunciación y detectar desviaciones en la recitación.
- Inferencia en streaming (arquitectura Zipformer streaming).
- Ejecución en dispositivo mediante ONNX Runtime, sin envío de audio a servidores.
- Verificación de integridad del fichero mediante SHA-256/MD5 antes de su uso por parte de la app consumidora.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada general ni modo *thinking*.
- Capacidad multilingüe: no; el modelo está limitado al árabe coránico.

## Casos de uso

- Autoevaluación de recitación (*tasmie*) en la app Athar: el modelo recibe el audio de la recitación del usuario y devuelve la secuencia de fonemas, que la app compara con la esperada para señalar errores de pronunciación. Es adecuado por su tamaño reducido y su ejecución offline.
- Aplicaciones móviles de aprendizaje del Corán: integración del fichero ONNX en apps Android/iOS para dar retroalimentación de pronunciación sin conexión y sin coste de servidor.
- Verificación de integridad en pipelines de distribución: el hash SHA-256 publicado permite validar que el binario descargado coincide con el original antes de cargarlo en producción.
- Investigación en ASR de dominio restringido: servir como referencia de un modelo fonémico especializado y cuantizado para experimentos de adaptación a dominio o comparación con ASR generalista.
- Prototipos de corrección de recitación en tiempo real: gracias a su naturaleza streaming, puede alimentar interfaces que resalten en vivo los fonemas desviados.
- Distribución de modelos con licencia no comercial: ejemplo de espejo que respeta los términos NPL-1.2 y facilita el acceso a un modelo con acceso restringido en origen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el fichero INT8 ocupa ~72,7 MB; la huella en memoria es del orden de decenas a pocos cientos de MB según el runtime y los buffers de streaming (estimación, no dato publicado).
- GPU recomendadas: no disponible; el modelo está pensado para ejecución en CPU móvil mediante ONNX Runtime.
- ¿Cabe en GPU de consumo? Sí, con holgura; también en dispositivos móviles de gama media, que es su destino previsto.
- Opciones de despliegue: ONNX Runtime (incluida la variante móvil); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Athar Tasmie (espejo de Zipformer Qur'an 3.1) | ASR fonémico Zipformer, ONNX INT8 | ~72,7 MB | Árabe (Hafs) | NPL-1.2 (no comercial) | Espejo público; upstream con acceso restringido |
| Whisper (variantes small/medium) | ASR transformer encoder-decoder | Cientos de MB a GB | Multilingüe | MIT | Público |
| Modelos ASR árabes genéricos en Hugging Face | Variable | Variable | Árabe | Variable | Público |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Dominio muy restringido: solo árabe coránico con lectura Hafs; no es un ASR generalista.
- Licencia NPL-1.2: prohíbe cobrar por el modelo o por cualquier funcionalidad que lo use, así como publicidad y muros de pago; no es apta para uso comercial.
- Es un espejo, no el repositorio oficial: la responsabilidad de mantenimiento y actualizaciones recae en Qur'an-Lab; el espejo puede quedar desactualizado.
- Solo se publica la variante INT8 ONNX; no hay pesos en otros formatos ni versiones sin cuantizar en este repositorio.
- No hay información pública sobre sesgos, tasas de alucinación (en ASR, errores de transcripción) ni evaluación de precisión.
- El uso previsto es de autoevaluación y no sustituye a un profesor; la propia model card lo subraya.
- El fichero debe verificarse con el SHA-256 publicado antes de su uso en producción.

## Enlaces

- Repositorio del espejo: https://huggingface.co/Abdolrahman77/athar-tasmie
- Modelo upstream: https://huggingface.co/Quran-Lab/zipformer_p-arabic-v3
- Página del modelo en Qur'an-Lab: https://quranlab.ai/models/zipformer-v3-1
