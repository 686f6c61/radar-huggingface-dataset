# geladons/Huihui-Qwen3-8B-abliterated-v2

## Resumen

Huihui-Qwen3-8B-abliterated-v2 (bundle LiteRT-LM) es una conversión del modelo de lenguaje Qwen3-8B, originalmente desarrollado por el equipo Qwen de Alibaba y posteriormente sometido a un proceso de *abliteration* por huihui-ai para reducir sus rechazos ante peticiones que el modelo instruct original declinaría. Esta variante concreta, publicada por el usuario geladons, no es un modelo nuevo: es un empaquetado del checkpoint abliterado en formato `.litertlm`, el formato de Google para inferencia completamente local en dispositivos Android mediante el runtime LiteRT-LM.

El interés de esta ficha reside en el formato y el objetivo de despliegue, no en la arquitectura subyacente. Se trata de un transformer denso de 8.000 millones de parámetros cuantizado a int4 por bloques, con un fichero de 5,18 GB, pensado para ejecutarse íntegramente en un teléfono sin conexión a la nube ni cuenta de usuario. El modelo base Qwen3-8B incorpora modo de razonamiento (*thinking*) y una ventana de contexto amplia, aunque la model card de esta conversión no documenta explícitamente los parámetros de contexto efectivos tras la cuantización.

La relevancia actual es doble: por un lado, demuestra que modelos de 8B pueden distribuirse como aplicaciones móviles autónomas; por otro, la naturaleza *abliterated* del checkpoint plantea consideraciones de seguridad y cumplimiento que conviene evaluar antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), empaquetado LiteRT-LM |
| Parámetros totales | 8.000 millones (8B) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | int4 con cuantización por bloques (block-quantized) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (runtime LiteRT-LM); tamaño del fichero 5,18 GB |
| Modalidad | texto a texto |
| Modelo base | huihui-ai/Huihui-Qwen3-8B-abliterated-v2 |
| Librería | litert-lm |
| Tamaño del repositorio | 5,2 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B, un transformer denso con atención estándar y 8.000 millones de parámetros. Sobre ese checkpoint, huihui-ai aplicó una técnica de *abliteration*, que consiste en identificar y neutralizar las direcciones de activación asociadas al comportamiento de rechazo, de modo que el modelo responde a un espectro más amplio de peticiones con menos negativas. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo original o en el finetune abliterado.

La aportación específica de este repositorio es la conversión al formato LiteRT-LM de Google, que empaqueta los pesos en int4 por bloques para ejecución on-device en Android. El runtime LiteRT-LM expone las abstracciones `Engine` y `Conversation` a través del SDK `com.google.ai.edge.litertlm`, y las recetas de conversión desde Hugging Face están documentadas en el repositorio hf-to-litertlm. El fichero es byte a byte idéntico al alojado en `geladons/local-ai-models`, que se mantiene por compatibilidad hacia atrás.

## Capacidades

- Generación de texto conversacional multi-turno en modo texto a texto.
- Razonamiento y resolución de problemas heredados de Qwen3-8B, incluyendo el modo *thinking* del modelo original (no confirmado explícitamente en esta conversión).
- Generación de código y matemáticas, capacidades propias de la familia Qwen3.
- Inferencia completamente offline en dispositivo, sin llamadas a servicios en la nube.
- Integración en aplicaciones Android mediante el SDK LiteRT-LM (`Engine`/`Conversation`).
- Ejecución sin cuenta de usuario ni telemetría obligatoria.
- Soporte de *tool calling* y comportamiento agéntico: no disponible en la información proporcionada para esta conversión.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles (modalidad texto a texto).

## Casos de uso

- Asistentes conversacionales offline en Android: el bundle se carga directamente con el SDK LiteRT-LM y permite mantener conversaciones multi-turno sin conexión, útil en entornos con conectividad intermitente o requisitos de privacidad estrictos.
- Aplicaciones de privacidad por diseño: al ejecutarse íntegramente en el dispositivo, los datos del usuario no salen del teléfono, lo que encaja en sectores regulados como salud o legal donde el envío a la nube es problemático.
- Prototipado rápido de apps de IA generativa: la integración con la app Local AI de Google Play permite probar el modelo sin escribir código y validar casos de uso antes de invertir en desarrollo.
- Procesamiento de texto en campo: técnicos, investigadores o personal de campo pueden resumir, redactar o clasificar documentos en dispositivos móviles sin infraestructura de servidores.
- Educación y formación: tutores conversacionales embebidos en aplicaciones educativas que funcionan en tablets o móviles de gama media sin coste recurrente de API.
- Investigación sobre alineación y seguridad: la variante abliterada sirve para estudiar el comportamiento de modelos con rechazos reducidos y comparar respuestas frente al instruct original en entornos controlados.
- Distribución de modelos en catálogos de apps: el formato `.litertlm` y el repositorio por modelo facilitan la gestión de versiones y la publicación de bundles en catálogos de aplicaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/almacenamiento: el fichero `.litertlm` ocupa 5,18 GB en int4; se requiere espacio libre equivalente en el almacenamiento del dispositivo Android.
- Memoria RAM: no disponible de forma explícita; por el tamaño del bundle en int4, se espera un consumo de RAM del orden de varios gigabytes, aunque no se documenta la cifra exacta.
- GPU recomendadas: no aplica en el sentido de GPUs de servidor; el despliegue objetivo es la NPU/GPU integrada de SoCs Android compatibles con LiteRT-LM.
- ¿Cabe en GPU de consumo? El formato está pensado para móviles, no para GPUs de escritorio; no se documenta soporte para RTX 4090, A100 o H100 en esta conversión.
- Opciones de despliegue: runtime LiteRT-LM (SDK `com.google.ai.edge.litertlm`) y la app Local AI de Google Play. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| Huihui-Qwen3-8B-abliterated-v2 (este bundle) | 8B | no disponible | `.litertlm` int4 | Apache 2.0 | LiteRT-LM, Android on-device |
| huihui-ai/Huihui-Qwen3-8B-abliterated-v2 (original) | 8B | no disponible | safetensors | Apache 2.0 | vLLM, TGI, transformers |
| Qwen3-8B (instruct original) | 8B | no disponible | safetensors, GGUF | Apache 2.0 | Múltiples runtimes |
| Gemma 3n / otros bundles LiteRT-LM | no disponible | no disponible | `.litertlm` | no disponible | LiteRT-LM, Android |

La comparativa se limita a lo documentado: el bundle comparte arquitectura y licencia con el checkpoint original, y se diferencia por el formato y el runtime de destino. No se dispone de datos de rendimiento comparado.

## Limitaciones y advertencias

- La variante *abliterated* reduce los rechazos del modelo instruct; esto implica un mayor riesgo de generar contenido dañino, sesgado o inapropiado, y no debe desplegarse en aplicaciones de cara al público sin filtros adicionales.
- Riesgo de alucinación inherente a los modelos de 8B, agravado por la cuantización int4, que puede degradar la calidad respecto al checkpoint en precisión completa.
- No se documentan los idiomas soportados ni la longitud de contexto efectiva tras la conversión; conviene validar ambos extremos antes de producción.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado por la variante abliterada recae en el desplegador.
- El formato `.litertlm` está atado al runtime LiteRT-LM y a Android; no es portable a otros motores de inferencia sin reconversión.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día; se trata de una publicación reciente sin validación comunitaria.
- No se documentan garantías de soporte, mantenimiento ni actualizaciones por parte del autor.

## Enlaces

- Hugging Face: https://huggingface.co/geladons/Huihui-Qwen3-8B-abliterated-v2
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3-8B-abliterated-v2
- Repositorio de bundles: https://huggingface.co/geladons/local-ai-models
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Recetas de conversión: https://github.com/john-rocky/hf-to-litertlm
- App Local AI (Google Play): https://play.google.com/store/apps/details?id=com.ochandydude.localai
- Licencia Apache 2.0: https://spdx.org/licenses/apache-2.0.html
