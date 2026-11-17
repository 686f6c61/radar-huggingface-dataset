# LlamaPal/DeepSeek-R1-Distill-Qwen-7B-Q4_K_M-GGUF

## Resumen

`LlamaPal/DeepSeek-R1-Distill-Qwen-7B-Q4_K_M-GGUF` es un espejo (mirror) del fichero GGUF cuantizado en Q4_K_M del modelo `deepseek-ai/DeepSeek-R1-Distill-Qwen-7B`, publicado por el desarrollador de la aplicación LlamaPal para su distribución en Android. No se trata de un modelo entrenado por LlamaPal: el repositorio únicamente replica, byte a byte, el fichero generado por bartowski (commit `361004151d4f`), con el mismo hash SHA-256, para que la app LlamaPal pueda descargarlo directamente en el dispositivo.

El modelo subyacente es un destilado de DeepSeek-R1 sobre la base de Qwen2.5-7B, con 7.615.616.512 parámetros y orientado a razonamiento paso a paso (math, lógica y código). La cuantización Q4_K_M reduce el peso a 4,7 GB, lo que permite ejecutarlo en smartphones Android de gama alta de forma totalmente offline, sin cuenta ni conexión a internet.

Su relevancia práctica es la de un artefacto de despliegue: no aporta mejoras técnicas sobre el original, pero sí un empaquetado listo para consumir en llama.cpp y apps derivadas, con licencia MIT heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-7B, destilado de DeepSeek-R1) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (este repo); el autor original (bartowski) ofrece otros niveles GGUF, no detallados aqui |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | GGUF (fichero `DeepSeek-R1-Distill-Qwen-7B-Q4_K_M.gguf`, 4,7 GB, SHA-256 `731ece8d06dc7eda6f6572997feb9ee1258db0784827e642909d9b565641937b`) |

## Arquitectura y entrenamiento

El modelo base es un destilado de razonamiento: DeepSeek-R1-Distill-Qwen-7B se obtiene mediante destilación supervisada de las trazas de razonamiento del modelo DeepSeek-R1 sobre el transformer Qwen2.5-7B (decoder-only, atención estándar). La model card del repositorio de LlamaPal no aporta detalles sobre el número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO; esa información corresponde al repositorio original de DeepSeek y no está incluida en la información proporcionada.

La única intervención técnica de este repositorio es la cuantización a Q4_K_M realizada por bartowski, con fichero etiquetado con `imatrix` en los tags, lo que sugiere el uso de una matriz de importancia para calibrar la cuantización. El resultado es una copia sin modificaciones adicionales: mismo binario, mismo hash.

## Capacidades

- Generación de texto conversacional con razonamiento paso a paso (estilo cadena de pensamiento) para matemáticas, lógica y programación.
- Resolución de problemas matemáticos y de lógica, capacidad destacada en la familia DeepSeek-R1.
- Generación y comprensión de código.
- Conversación multi-turno (tag `conversational`).
- Ejecución local offline en Android mediante llama.cpp, sin envío de datos a servidores.
- Compatible con endpoints (tag `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información proporcionada.

## Casos de uso

- Asistencia matemática offline en el móvil: resolución de problemas paso a paso sin conexión, útil en entornos sin red o con requisitos de privacidad estrictos.
- Tutor de lógica y razonamiento: el modelo expone su cadena de pensamiento, lo que permite usarlo como apoyo didáctico para explicar la resolución de un problema.
- Ayuda con código en movilidad: consultas rápidas de programación y depuración desde el teléfono, sin enviar fragmentos de código a servicios externos.
- Chat privado y sensible: conversaciones que no deben salir del dispositivo (sanidad, legal, datos personales) gracias al funcionamiento 100 % local.
- Prototipado de apps Android con IA embebida: sirve como fichero de referencia para integrar un modelo de razonamiento de 7B en llama.cpp sobre Android.
- Evaluación de cuantización Q4_K_M: permite comparar la calidad de un 7B de razonamiento cuantizado frente al modelo en precisión completa en un dispositivo con recursos limitados.
- Uso en entornos aislados (air-gapped): despliegue en equipos sin red, incluidos portátiles modestos, usando llama.cpp con este GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de LlamaPal menciona de forma genérica que el modelo "supera a GPT-4o en benchmarks de matemáticas", pero no incluye cifras concretas ni tablas comparativas verificables en este repositorio.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 5-6 GB con la cuantización Q4_K_M (fichero de 4,7 GB más overhead de contexto y KV cache).
- GPU recomendadas: no especificadas en la información proporcionada; el fichero está pensado para CPU/GPU móvil vía llama.cpp.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM (por ejemplo, RTX 3060/4060 en adelante), aunque no hay datos oficiales de rendimiento.
- Despliegue: llama.cpp y cualquier aplicación construida sobre él; la app LlamaPal para Android es el destino principal.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este repo (DeepSeek-R1-Distill-Qwen-7B Q4_K_M) | 7,6 B | no disponible | GGUF | MIT | Mirror para LlamaPal Android |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-7B | 7,6 B | no disponible | safetensors | MIT | Modelo original de DeepSeek |
| bartowski/DeepSeek-R1-Distill-Qwen-7B-GGUF | 7,6 B | no disponible | GGUF (varios niveles) | MIT | Fuente original de esta cuantización |
| Qwen2.5-7B (base) | 7,6 B | no disponible | safetensors/GGUF | no disponible en esta ficha | Modelo base sin destilación de razonamiento |

## Limitaciones y advertencias

- Es un mirror: no añade valor técnico sobre el GGUF de bartowski; conviene descargar de la fuente original si no se usa la app LlamaPal.
- Riesgo de alucinación inherente a los modelos de razonamiento destilados, especialmente en dominios fuera de matemáticas y código.
- La cuantización Q4_K_M introduce pérdida de precisión respecto al modelo en BF16/FP16; puede degradar tareas de razonamiento largo.
- Idiomas soportados no documentados; el comportamiento multilingüe no está garantizado por la información disponible.
- Longitud de contexto no especificada en este repositorio.
- Uso comercial permitido por la licencia MIT, pero conviene verificar los términos del modelo base original de DeepSeek.
- No se documentan capacidades de tool calling ni de agentes; no asumirlas en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LlamaPal/DeepSeek-R1-Distill-Qwen-7B-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Fuente original del GGUF (bartowski): https://huggingface.co/bartowski/DeepSeek-R1-Distill-Qwen-7B-GGUF
- App LlamaPal en Google Play: https://play.google.com/store/apps/details?id=com.vishistv.llamapal
- Web de LlamaPal: https://llamapal.cc/
- Instagram de LlamaPal: https://www.instagram.com/llamapalhq/
