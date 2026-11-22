# mradermacher/kofu-2b-edge-GGUF

## Resumen

Kofu 2B Edge es un modelo de lenguaje conversacional de 2.506.172.416 parámetros (aproximadamente 2,5 mil millones) desarrollado por el usuario shebxyd y publicado originalmente en Hugging Face. La versión aquí descrita es una cuantización GGUF realizada por mradermacher, un conocido creador de cuantizaciones para llama.cpp. El modelo está construido sobre la arquitectura Gemma, según indican los metadatos (`model_type: gemma`), y está orientado explícitamente a su despliegue en dispositivos de borde (edge), con etiquetas que mencionan Android, LiteRT, C++ y ejecución on-device.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo conversacional de ~2,5B parámetros en hardware modesto, incluyendo móviles y placas de un solo board, gracias a la disponibilidad de cuantizaciones que van desde Q2_K (1,3 GB) hasta f16 (5,1 GB). El modelo base declara soporte para español e inglés, y la licencia es la Gemma Terms of Use, lo que impone condiciones específicas de uso comercial y un proceso de aceptación de términos.

No se dispone de información pública sobre la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks en la documentación proporcionada. Esta ficha se limita, por tanto, a los datos verificables: parámetros, cuantizaciones, licencia, idiomas declarados y formato de pesos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer basada en Gemma (`model_type: gemma`) |
| Parámetros totales | 2.506.172.416 (~2,5B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | español (es), inglés (en) |
| Licencia | Gemma Terms of Use (license: gemma) |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |
| Tamaño del repo | 23,4 GB |
| Descargas | 728 |
| Likes | 0 |
| Creado | 2026-11-06 |
| Actualizado | 2026-11-07 |

## Arquitectura y entrenamiento

La arquitectura es un transformer basado en Gemma, según el campo `model_type: gemma` de la model card y la etiqueta `gemma` del repositorio. El recuento real de parámetros en safetensors es de 2.506.172.416, lo que sitúa al modelo en la categoría de ~2,5B. No se dispone de información sobre el número de capas, dimensiones ocultas, cabezas de atención ni mecanismos específicos (atención lineal, decodificación especulativa, etc.) en la documentación proporcionada.

Respecto al entrenamiento, la model card no detalla el número de tokens, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o instrucción supervisada. Las etiquetas indican un enfoque conversacional (`conversational`) y de despliegue en dispositivo (`on-device`, `android`, `litert`, `cplusplus`), lo que sugiere una optimización para inferencia local más que un énfasis en razonamiento complejo. Esta información debe considerarse no disponible y no debe inferirse.

## Capacidades

- Generación de texto conversacional multi-turno en español e inglés.
- Ejecución en dispositivos de borde: el modelo está etiquetado como `on-device`, `android`, `litert` y `cplusplus`, lo que indica compatibilidad con entornos de inferencia local en móviles y sistemas embebidos.
- Compatibilidad con llama.cpp a través de los archivos GGUF, lo que permite su uso en CPU, GPU y aceleradores diversos.
- Soporte de cuantizaciones de bajo bit (Q2_K, Q3_K) para reducir requisitos de memoria.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido (thinking mode) en la información disponible.

## Casos de uso

- Asistente conversacional en móvil Android: el modelo puede integrarse mediante LiteRT o llama.cpp en una aplicación Android para ofrecer respuestas conversacionales offline, aprovechando la cuantización Q4_K_S (1,7 GB) para mantener el uso de memoria contenido en dispositivos de gama media-alta.
- Chatbot embebido en aplicaciones de escritorio: con el formato GGUF y llama.cpp, se puede distribuir un asistente local en herramientas de escritorio (Linux, Windows, macOS) sin dependencia de red, usando Q5_K_M (1,9 GB) para un equilibrio calidad/memoria.
- Prototipado rápido de asistentes en español: al declarar soporte de español, sirve para validar flujos conversacionales en castellano antes de escalar a modelos mayores, con un coste de infraestructura mínimo.
- Inferencia en placas de un solo board (Raspberry Pi, Orange Pi): las cuantizaciones Q2_K (1,3 GB) y Q3_K_S (1,4 GB) permiten ejecución en CPU con memoria limitada, útil para proyectos de domótica o terminales de voz.
- Filtrado y generación de texto en pipelines de datos: al ser un modelo pequeño, puede usarse para tareas de clasificación ligera, resumen o reescritura en lote sobre CPU, reduciendo costes frente a APIs en la nube.
- Educación y experimentación: adecuado para entornos docentes donde se quiere estudiar el comportamiento de un transformer Gemma pequeño y el impacto de distintas cuantizaciones en la calidad de salida, sin necesidad de GPUs de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, aproximadamente igual al tamaño del archivo más overhead):
  - Q2_K: ~1,3 GB
  - Q3_K_S: ~1,4 GB
  - Q3_K_M: ~1,5 GB
  - Q3_K_L: ~1,6 GB
  - IQ4_XS: ~1,6 GB
  - Q4_K_S / Q4_K_M: ~1,7 GB
  - Q5_K_S / Q5_K_M: ~1,9 GB
  - Q6_K: ~2,2 GB
  - Q8_0: ~2,8 GB
  - f16: ~5,1 GB
- GPU recomendadas: no se especifican en la documentación. Por tamaño, cualquier GPU consumer con ≥4 GB de VRAM puede ejecutar cuantizaciones Q4–Q8; una RTX 3060 (12 GB), RTX 4060 (8 GB) o RTX 4090 (24 GB) son holgadas. Para f16 se recomienda ≥6 GB.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs consumer modernas con ≥4 GB de VRAM para cuantizaciones Q4–Q8.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (a través de GGUF), LiteRT (según etiquetas del modelo base), y potencialmente transformers con los pesos safetensors del modelo base. No se documenta compatibilidad con vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles. Al ser un modelo de ~2,5B, se espera una latencia baja en GPU consumer y moderada en CPU, pero no se aportan cifras verificables.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas (contexto, rendimiento) de este modelo que permitan una comparación rigurosa. Se ofrece una comparación estructural basada únicamente en parámetros y licencia, marcando como "no disponible" los campos sin datos verificables.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kofu 2B Edge (este) | ~2,5B | no disponible | Gemma Terms of Use | GGUF, safetensors | Enfoque on-device, es/en |
| Gemma 2B (Google) | ~2B | no disponible en esta ficha | Gemma Terms of Use | safetensors, GGUF (comunidad) | Modelo base de referencia de la familia Gemma |
| Qwen2.5 1.5B | ~1,5B | no disponible en esta ficha | Apache 2.0 (según versión) | safetensors, GGUF | Alternativa pequeña multilingüe |
| Llama 3.2 1B | ~1,2B | no disponible en esta ficha | Llama 3.2 Community License | safetensors, GGUF | Alternativa pequeña de Meta |

La comparación de rendimiento no es posible con la información disponible; se recomienda evaluar directamente cada modelo en la tarea objetivo antes de decidir.

## Limitaciones y advertencias

- No se han publicado datos de benchmarks, por lo que se desconoce su calidad real frente a alternativas de tamaño similar.
- La longitud de contexto no está documentada; no debe asumirse un contexto largo.
- El modelo base declara solo español e inglés; el rendimiento en otros idiomas es desconocido y probablemente limitado.
- La licencia Gemma Terms of Use impone condiciones específicas: aceptación de términos, política de usos prohibidos de Google Generative AI y posibles restricciones para uso comercial. Es imprescindible revisar los términos antes de desplegar en producción.
- El repositorio tiene 0 likes y 728 descargas en el momento de la ficha, lo que indica una validación comunitaria muy limitada.
- Al ser una cuantización de un modelo de autor independiente (shebxyd), no hay garantía de mantenimiento, soporte ni actualizaciones.
- Las cuantizaciones de muy bajo bit (Q2_K, Q3_K_S) degradan la calidad de forma notable; para producción se recomienda Q4_K_M o superior.
- Riesgo de alucinación inherente a modelos pequeños; no se documentan mitigaciones específicas.
- No se documenta soporte de tool calling ni de agentes, por lo que no debe asumirse para flujos automatizados complejos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/kofu-2b-edge-GGUF
- Modelo base: https://huggingface.co/shebxyd/kofu-2b-edge
- Cuantizaciones imatrix/weighted: https://huggingface.co/mradermacher/kofu-2b-edge-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#kofu-2b-edge-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de perplejidad por cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
