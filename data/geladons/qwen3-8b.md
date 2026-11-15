# geladons/Qwen3-8B

## Resumen

Qwen3-8B en formato LiteRT-LM es una conversión del modelo base Qwen/Qwen3-8B de Alibaba Qwen al formato `.litertlm` de Google, pensado para inferencia totalmente local en dispositivos Android. El artefacto lo publica el usuario geladons como bundle listo para consumir desde el runtime LiteRT-LM y desde la aplicación Local AI, sin necesidad de nube ni de cuenta. El archivo pesa 4,89 GB y usa cuantización int4 por bloques, lo que permite ejecutar un modelo de 8 000 millones de parámetros en un teléfono moderno.

La relevancia de esta ficha no está en el modelo base, cuyas características hereda, sino en el empaquetado: demuestra un flujo de conversión de pesos Hugging Face a LiteRT-LM y una vía de distribución para IA en el borde (edge AI) en Android. El modelo es de tipo texto a texto, con licencia Apache 2.0, y su tarjeta no documenta idiomas soportados ni resultados de benchmarks propios de la conversión.

Conviene subrayar que se trata de una conversión de terceros, no de un modelo entrenado por el autor del repositorio: la arquitectura, los datos de entrenamiento y las capacidades son las del Qwen3-8B original, mientras que el trabajo de geladons se limita al formato, la cuantización y el empaquetado para el runtime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen/Qwen3-8B); no se detalla en la model card de la conversión |
| Parametros totales | 8 000 millones (según el nombre del modelo base Qwen3-8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | int4 con cuantización por bloques (block-quantized) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (runtime LiteRT-LM); archivo `qwen3_8b_mixed_int4_v2.litertlm` de 4,89 GB |

## Arquitectura y entrenamiento

La model card de esta conversión no describe la arquitectura interna ni el proceso de entrenamiento. Lo que se sabe es que el artefacto deriva del modelo Qwen/Qwen3-8B, un transformer denso de 8 000 millones de parámetros, y que se ha transformado al formato LiteRT-LM mediante recetas de conversión de Hugging Face a LiteRT-LM. El resultado se distribuye cuantizado a int4 por bloques, lo que reduce el peso del archivo hasta los 4,89 GB indicados.

No hay información en la documentación proporcionada sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni sobre innovaciones técnicas del modelo base. Cualquier afirmación al respecto requeriría consultar la model card original de Qwen/Qwen3-8B, que no forma parte de la información disponible.

## Capacidades

- Generación de texto: el pipeline declarado es text-generation y la modalidad es texto a texto.
- Inferencia totalmente local en Android: el archivo se carga directamente con el SDK `com.google.ai.edge.litertlm` mediante las clases `Engine` y `Conversation`.
- Integración en aplicaciones propias: el runtime LiteRT-LM permite incrustar el modelo en apps Android sin depender de servicios en la nube.
- Uso sin cuenta ni conexión: la aplicación Local AI descarga el bundle desde su catálogo integrado y permite conversar completamente offline.
- Capacidades específicas del modelo base (razonamiento, código, matemáticas, tool calling, modos de pensamiento, multilingüismo): no están documentadas en esta conversión y deben verificarse en la model card de Qwen/Qwen3-8B.

## Casos de uso

- Asistente conversacional offline en Android: el bundle se carga con el SDK LiteRT-LM y permite mantener conversaciones multi-turno sin conexión, útil en entornos sin red o con requisitos de privacidad estrictos.
- Aplicaciones móviles con IA embebida: un desarrollador puede apuntar las clases `Engine` y `Conversation` al archivo `.litertlm` para añadir generación de texto a su app sin backend propio.
- Prototipado rápido sin código: mediante la app Local AI, que incluye el modelo en su catálogo integrado, se puede evaluar el comportamiento del modelo en un teléfono en minutos.
- Procesamiento de texto sensible en el dispositivo: al no salir los datos del terminal, encaja en escenarios donde no se permite enviar contenido a servicios externos.
- Pruebas de viabilidad de edge AI: sirve para medir latencia, consumo de memoria y calidad de un modelo de 8B cuantizado a int4 en hardware móvil concreto antes de comprometerse con un despliegue.
- Distribución de modelos en formato LiteRT-LM: el repositorio sirve como referencia para replicar el flujo de conversión de Hugging Face a `.litertlm` con las recetas públicas enlazadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: el archivo pesa 4,89 GB en int4; se necesita al menos esa cantidad de memoria libre más el overhead del runtime y del contexto, por lo que en la práctica conviene disponer de 6-8 GB de RAM disponibles en el dispositivo.
- GPU recomendadas: no aplica en el sentido de GPU de servidor; el destino es hardware Android con aceleración del runtime LiteRT-LM. No se especifican SoC compatibles en la información proporcionada.
- Cabe en GPU de consumo: no es el objetivo del bundle; está pensado para teléfonos, no para tarjetas gráficas de escritorio.
- Opciones de despliegue: runtime LiteRT-LM (SDK `com.google.ai.edge.litertlm`) y la aplicación Local AI para uso sin código. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| geladons/Qwen3-8B (esta ficha) | 8 000 M | No disponible | `.litertlm` int4 | Apache 2.0 | Conversión para Android on-device |
| Qwen/Qwen3-8B (modelo base) | 8 000 M | No disponible en esta información | safetensors (formato original) | Apache 2.0 | Requiere runtime de servidor o de escritorio |
| Otras conversiones LiteRT-LM | No disponible | No disponible | `.litertlm` | Variable | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Es una conversión de terceros: el autor del repositorio no es el desarrollador del modelo base, por lo que la calidad final depende tanto de la conversión como del modelo original.
- La cuantización int4 puede degradar la calidad respecto a los pesos originales en precisión completa; no se documenta ninguna evaluación de esta pérdida.
- No se documentan los idiomas soportados en esta conversión, aunque el modelo base Qwen3 tiene capacidades multilingües que habría que confirmar en su model card.
- No hay información sobre sesgos, riesgo de alucinación ni limitaciones de contexto específicas de este bundle.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de cualquier componente del runtime LiteRT-LM.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- El archivo es byte-idéntico al de `geladons/local-ai-models`; este repositorio existe para dar tarjeta y estadísticas propias a cada bundle.
- El tamaño de 4,89 GB limita el despliegue a dispositivos con memoria suficiente; no se especifican requisitos mínimos oficiales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/geladons/Qwen3-8B
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio alternativo con el mismo archivo: https://huggingface.co/geladons/local-ai-models
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Recetas de conversión hf-to-litertlm: https://github.com/john-rocky/hf-to-litertlm
- Aplicación Local AI en Google Play: https://play.google.com/store/apps/details?id=com.ochandydude.localai
- Licencia Apache 2.0: https://spdx.org/licenses/apache-2.0.html
