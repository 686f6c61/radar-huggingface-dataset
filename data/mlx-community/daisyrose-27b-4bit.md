# mlx-community/DaisyRose-27B-4bit

## Resumen

DaisyRose-27B-4bit es una cuantización de 4 bits en formato MLX del modelo multimodal RadixArk/DaisyRose-27B, a su vez construido sobre Qwen/Qwen3.8-27B. La conversión la realiza el colectivo mlx-community con `mlx-vlm` 0.8.0 aplicando cuantización afín de 4 bits con `group_size=64`, y está pensada para ejecutar inferencia local eficiente en hardware Apple Silicon (M-series). El repositorio ocupa 16,1 GB y contiene 27.356.728.560 parámetros en safetensors.

El modelo conserva la torre de visión completa y se expone con el pipeline `image-text-to-text`, por lo que admite entradas de imagen, vídeo y texto a través de `mlx-vlm`, además de uso solo-texto mediante `mlx-lm`. La licencia es Apache-2.0, lo que facilita su uso comercial sin restricciones adicionales más allá de las obligaciones de atribución de dicha licencia.

Es relevante ahora porque permite desplegar un modelo de 27B con capacidades multimodales y de agente en un portátil o estación Mac sin GPU dedicada, manteniendo el pipeline completo de visión que muchas cuantizaciones descartan. No obstante, la información pública disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada: la model card remite al repositorio original para esos detalles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetas `qwen3_5` y `qwen3.8`; transformer multimodal con torre de visión, sin confirmar) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afín, `group_size=64` (formato MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), librería `mlx` |
| Pipeline | image-text-to-text |
| Modelo base | RadixArk/DaisyRose-27B (sobre Qwen/Qwen3.8-27B) |
| Herramienta de conversion | mlx-vlm 0.8.0 |
| Tamano del repo | 16,1 GB |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. La model card indica que el modelo base es RadixArk/DaisyRose-27B, construido sobre Qwen/Qwen3.8-27B, y que la cuantización preserva la torre de visión completa, lo que confirma una arquitectura multimodal con codificador visual más un modelo de lenguaje. Las etiquetas `qwen3_5` y `qwen3.8` sugieren una variante de la familia Qwen 3, pero no se especifica si emplea atención lineal, decodificación especulativa u otras innovaciones.

Tampoco se detallan la composición del dataset de entrenamiento, el número de tokens, ni si hubo fases de RLHF o DPO. La única información técnica verificable es el proceso de cuantización: conversión a MLX con cuantización afín de 4 bits y `group_size=64`, realizada con `mlx-vlm` 0.8.0. Para detalles de arquitectura, benchmarks y términos de licencia, la model card remite explícitamente al repositorio original de RadixArk/DaisyRose-27B.

## Capacidades

- Generación de texto conversacional y respuesta a instrucciones, según el pipeline declarado y las etiquetas `conversational`.
- Comprensión de imágenes y vídeo: el pipeline `image-text-to-text` y la mención de que se preserva la torre de visión completa indican soporte de entrada visual junto a texto.
- Uso solo-texto mediante `mlx-lm`, incluyendo generación local y servidor local.
- Orientación a agentes: la etiqueta `agent` sugiere capacidades de razonamiento multi-paso y uso en flujos de agente, aunque no se detalla el soporte concreto de tool calling o function calling.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de razonamiento extendido (thinking), audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Asistente local en Mac con entrada de imágenes: usar `mlx-vlm` para pasar una captura o foto junto a una pregunta y obtener una descripción o respuesta contextualizada, aprovechando la torre de visión preservada y el formato MLX optimizado para Apple Silicon.
- Análisis de documentos escaneados o capturas de pantalla: enviar la imagen al modelo para extraer y resumir información, útil en flujos de oficina sin enviar datos a la nube.
- Automatización de tareas de agente en local: la etiqueta `agent` permite integrar el modelo en pipelines de razonamiento multi-paso ejecutados íntegramente en el dispositivo, reduciendo la exposición de datos sensibles.
- Generación y revisión de código en el editor: mediante `mlx-lm` se puede servir el modelo como backend de texto para autocompletado, explicación de fragmentos o generación de scripts, como el ejemplo de la model card (script bash para comprobar puertos abiertos).
- Prototipado de aplicaciones multimodales: usar el modelo como base para demos de pregunta-respuesta sobre imágenes o vídeo en entornos de desarrollo con hardware Apple, sin necesidad de GPUs dedicadas.
- Servidor local de texto para pruebas de integración: levantar `mlx-lm` como servidor local y conectar herramientas o scripts de CI para validar respuestas antes de desplegar en infraestructura mayor.
- Investigación sobre cuantización: comparar el comportamiento del modelo 4-bit MLX frente al original en tareas de visión y texto para evaluar la pérdida de calidad de la cuantización afín con `group_size=64`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: el repo pesa 16,1 GB en 4 bits, por lo que se necesita al menos ~16-18 GB de memoria unificada libre para cargar los pesos, más margen para el contexto y la torre de visión.
- Hardware objetivo: Apple Silicon (M-series) con memoria unificada suficiente; el formato MLX no está pensado para GPUs NVIDIA.
- ¿Cabe en consumer GPU? No aplica en el sentido habitual: requiere hardware Apple. En Mac, encaja en configuraciones con 24 GB o más de memoria unificada (M2 Pro/Max, M3 Pro/Max, M4 Pro/Max); en equipos de 16 GB es ajustado y probablemente inviable con contexto largo.
- Opciones de despliegue: `mlx-vlm` (multimodal, texto + imagen/vídeo) y `mlx-lm` (solo texto y servidor local). No se indica soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato/plataforma |
|---|---|---|---|---|---|
| DaisyRose-27B-4bit (esta ficha) | 27,36B | no disponible | Sí (image-text-to-text) | Apache-2.0 | MLX, 4 bits |
| RadixArk/DaisyRose-27B | 27B (aprox., no confirmado) | no disponible | Sí | Apache-2.0 (según base) | safetensors completo |
| Qwen/Qwen3.8-27B | 27B (aprox., no confirmado) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de contexto para establecer una comparación cuantitativa con alternativas de la misma categoría. La comparación se limita a parámetros, licencia y formato de despliegue.

## Limitaciones y advertencias

- La información pública es escasa: no hay datos de arquitectura, contexto, idiomas ni benchmarks, lo que dificulta evaluar su idoneidad en producción sin consultar el repositorio original.
- Al ser una cuantización de 4 bits, es esperable cierta degradación de calidad frente al modelo original, especialmente en tareas de razonamiento complejo y percepción visual fina; no se han publicado evaluaciones que la cuantifiquen.
- Riesgo de alucinación inherente a los modelos de lenguaje; no hay documentación específica sobre mitigaciones.
- Sesgos conocidos: no disponibles.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: Apache-2.0 permite uso comercial con obligaciones de atribución y aviso de cambios; conviene verificar los términos del modelo base RadixArk/DaisyRose-27B por si añade condiciones.
- Dependencia de hardware Apple Silicon: el formato MLX limita el despliegue a ese ecosistema; no es portable a GPUs NVIDIA ni a servidores x86 convencionales sin reconversión.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del artefacto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlx-community/DaisyRose-27B-4bit
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Modelo origen de la familia: https://huggingface.co/Qwen/Qwen3.8-27B
- Librería mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Librería mlx-lm: https://github.com/ml-explore/mlx-lm
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
