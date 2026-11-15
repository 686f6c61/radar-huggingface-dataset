# geladons/Huihui-Qwen3.5-0.8B-abliterated

## Resumen

Huihui-Qwen3.5-0.8B-abliterated en formato LiteRT-LM es una conversión del modelo afinado por huihui-ai a partir de Qwen3.5-0.8B, empaquetado por el usuario geladons en el formato `.litertlm` de Google para inferencia totalmente local en dispositivos Android. El modelo base es una variante "abliterated", es decir, un ajuste fino que elimina o atenúa el comportamiento de rechazo del modelo instruct original, reduciendo el número de respuestas negativas ante peticiones que el modelo base declinaría. Con 0,8 mil millones de parámetros, está pensado para ejecutarse en teléfonos móviles sin conexión a la nube ni cuenta de usuario.

El interés de esta ficha no reside en el modelo lingüístico en sí, sino en el pipeline de despliegue: el autor ha convertido los pesos a LiteRT-LM, el runtime de Google AI Edge para ejecución on-device, con cuantización int8 y un fichero de 0,96 GB. Esto permite integrar el modelo en aplicaciones Android mediante el SDK `com.google.ai.edge.litertlm`, o usarlo sin escribir código a través de la aplicación Local AI disponible en Google Play.

La relevancia actual es doble: por un lado, ejemplifica el flujo de conversión de un transformer pequeño a un formato de despliegue móvil; por otro, plantea consideraciones de seguridad y licencia al distribuir una variante sin censura de un modelo de 0,8B bajo licencia Apache 2.0. No se dispone de información publicada sobre datos de entrenamiento, composición del corpus ni resultados de benchmarks en la documentación proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada del modelo base Qwen3.5-0.8B; detalles específicos no disponibles) |
| Parametros totales | 0,8 mil millones (según el nombre del modelo) |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (fichero `_int8_v2.litertlm`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); no se distribuyen safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo base Qwen3.5-0.8B, un transformer de 0,8 mil millones de parámetros, sobre el que huihui-ai aplicó un ajuste fino de tipo "abliterated". Esta técnica modifica los pesos para suprimir la dirección de activación asociada al rechazo, de modo que el modelo responde con menor frecuencia con negativas ante peticiones sensibles. No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en el ajuste.

La innovación técnica de este repositorio concreto es el empaquetado: la conversión a LiteRT-LM mediante recetas como las de `john-rocky/hf-to-litertlm`, con cuantización int8, produce un artefacto de 0,96 GB cargable directamente por el runtime de Google AI Edge en Android. Esto traslada la inferencia completa al dispositivo, eliminando la dependencia de servicios en la nube y reduciendo la latencia de red a cero, a costa de limitar el modelo a hardware móvil.

## Capacidades

- Generación de texto conversacional en modo texto a texto, según la model card.
- Comportamiento "abliterated": menor tasa de rechazos que el modelo instruct de referencia, según declara el autor del ajuste fino.
- Inferencia totalmente on-device: no requiere conexión a internet ni cuenta de usuario.
- Integración mediante SDK: el runtime `com.google.ai.edge.litertlm` expone las clases `Engine` y `Conversation` para cargar el fichero directamente en una aplicación Android.
- Uso sin código a través de la aplicación Local AI, que incluye el modelo en su catálogo integrado.
- Soporte de tool calling, agentes, visión, audio o modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües específicas: no disponibles en la información proporcionada.

## Casos de uso

- Asistentes conversacionales offline en Android: el modelo se carga con el SDK LiteRT-LM y permite mantener conversaciones multi-turno sin conexión, adecuado para entornos sin red o con requisitos de privacidad estrictos.
- Aplicaciones de privacidad por diseño: al ejecutarse íntegramente en el dispositivo, ningún dato del usuario abandona el teléfono, lo que encaja en casos de contenido sensible como diarios personales o notas médicas.
- Prototipado rápido de funciones de IA generativa: la aplicación Local AI permite probar el modelo sin escribir código, útil para validar ideas de producto antes de invertir en desarrollo.
- Integración en apps Android existentes: mediante las clases `Engine` y `Conversation` del SDK, un desarrollador puede añadir generación de texto a una aplicación ya publicada sin backend propio.
- Generación de texto creativo sin restricciones temáticas: la variante abliterated reduce los rechazos, lo que puede interesar en aplicaciones de escritura creativa o roleplay donde el modelo base resultaría demasiado restrictivo.
- Evaluación de pipelines de conversión a LiteRT-LM: el repositorio sirve como referencia práctica para convertir modelos pequeños de Hugging Face al formato `.litertlm` y medir su viabilidad en hardware móvil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; el modelo está pensado para ejecutarse en el subsistema de IA del dispositivo móvil. El fichero int8 ocupa 0,96 GB, por lo que se necesita al menos ese espacio de almacenamiento y memoria disponible en el dispositivo.
- GPU recomendadas: no disponibles. El runtime LiteRT-LM está orientado a aceleradores móviles (CPU, GPU o NPU del SoC) según el soporte del dispositivo, pero la información proporcionada no especifica qué chips están soportados.
- Compatibilidad con GPU de consumo: no disponible. No se documenta soporte para A100, H100, RTX 4090 ni tarjetas de escritorio.
- Opciones de despliegue: runtime LiteRT-LM (`com.google.ai.edge.litertlm`) en Android; aplicación Local AI para uso sin código. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| Huihui-Qwen3.5-0.8B-abliterated (LiteRT-LM) | 0,8B | no disponible | `.litertlm` int8 | Apache 2.0 | On-device Android |
| huihui-ai/Huihui-Qwen3.5-0.8B-abliterated | 0,8B | no disponible | no disponible en esta ficha | Apache 2.0 | Servidor o local según runtime |
| Qwen3.5-0.8B (modelo base de referencia) | 0,8B | no disponible | no disponible en esta ficha | no disponible en esta ficha | Servidor o local |

La comparativa se limita a los datos disponibles. No se dispone de información sobre benchmarks ni sobre otros bundles LiteRT-LM comparables para establecer diferencias de rendimiento.

## Limitaciones y advertencias

- El ajuste "abliterated" reduce deliberadamente los rechazos del modelo, lo que puede aumentar la probabilidad de generar contenido dañino, sesgado o inapropiado; no es recomendable su uso en producción sin filtros adicionales.
- Riesgo de alucinación inherente a un modelo de 0,8B: la capacidad de razonamiento y el conocimiento factual son limitados en comparación con modelos de mayor tamaño.
- No se documentan los idiomas soportados ni la longitud de contexto, lo que dificulta planificar su uso en aplicaciones multilingües o con contexto largo.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo ni sobre el cumplimiento normativo en aplicaciones sensibles.
- El formato `.litertlm` limita el despliegue al runtime LiteRT-LM y a Android; no es portable a otros entornos sin reconversión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en 2026-11-15; no hay evidencia de validación por parte de la comunidad.
- El fichero es idéntico al de `geladons/local-ai-models`, que se mantiene por compatibilidad; conviene verificar cuál es la fuente canónica antes de integrarlo.

## Enlaces

- [Hugging Face: geladons/Huihui-Qwen3.5-0.8B-abliterated](https://huggingface.co/geladons/Huihui-Qwen3.5-0.8B-abliterated)
- [Modelo base: huihui-ai/Huihui-Qwen3.5-0.8B-abliterated](https://huggingface.co/huihui-ai/Huihui-Qwen3.5-0.8B-abliterated)
- [Repositorio de modelos: geladons/local-ai-models](https://huggingface.co/geladons/local-ai-models)
- [Runtime LiteRT-LM (Google AI Edge)](https://github.com/google-ai-edge/LiteRT-LM)
- [Recetas de conversión hf-to-litertlm](https://github.com/john-rocky/hf-to-litertlm)
- [Aplicación Local AI en Google Play](https://play.google.com/store/apps/details?id=com.ochandydude.localai)
- [Licencia Apache 2.0](https://spdx.org/licenses/apache-2.0.html)
