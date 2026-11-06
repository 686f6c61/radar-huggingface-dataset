# CompressedGemma/Qwen-3.8-27B-Thinkingcap-Q2_Q4

## Resumen

Qwen-3.8-27B-Thinkingcap-Q2_Q4 es una cuantización en formato GGUF del modelo Qwen-3.8-27B en su variante "Thinkingcap", publicada por el usuario CompressedGemma. El modelo base, según el nombre, contaría con 27.320.697.856 parámetros (dato confirmado en el repositorio mediante safetensors), lo que lo sitúa en la categoría de modelos densos de gran tamano orientados a razonamiento con modo "thinking" explícito. La cuantización se ha realizado con la herramienta HPC-Quantize-V2, que el autor describe como sustancialmente más potente que su iteración anterior.

La relevancia de esta ficha es doble: por un lado, permite ejecutar un modelo de ~27B parámetros en hardware de consumo mediante cuantización Q2/Q4; por otro, documenta un flujo de trabajo completo de agente con modo de razonamiento habilitado, incluyendo ajustes de plantilla de chat (`enable_thinking`, `truncate_history_thinking`) y caché KV cuantizada (`q5_1`). El repositorio ocupa 9,6 GB y acumula 193 descargas en el momento de la consulta.

No obstante, la información pública es escasa: la model card no incluye detalles sobre arquitectura interna, datos de entrenamiento ni benchmarks formales. La mayoría de los datos técnicos de esta ficha proceden del nombre del modelo, del recuento de parámetros del repositorio y de los parámetros de ejecución incluidos en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer denso, según el nombre "Qwen-3.8-27B"; no confirmado en la model card) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 54.096 tokens en la configuración de ejecución documentada (`--ctx-size 54096`); contexto máximo nativo no disponible |
| Tipos de cuantizacion | GGUF con cuantización mixta Q2/Q4 (según el nombre del repositorio); caché KV en `q5_1` en la configuración de ejemplo |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura del modelo base. El nombre "Qwen-3.8-27B" sugiere un transformer denso de la familia Qwen con 27,3 mil millones de parámetros, pero no se confirma en la información disponible si emplea atención lineal, decodificación especulativa u otras innovaciones. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La contribución técnica destacable de este repositorio es la cuantización con HPC-Quantize-V2, que según el autor supera "sustancialmente" a la iteración previa de la herramienta. El resultado es un único archivo GGUF de aproximadamente 9,6 GB que combina precisiones Q2 y Q4, lo que permite reducir el modelo a un tamano manejable para GPUs de consumo. La model card incluye además una configuración de ejecución completa con `llama-server`, modo de razonamiento activado y caché KV cuantizada, lo que facilita la reproducibilidad del ejemplo mostrado.

## Capacidades

- Generación de código: el ejemplo de la model card demuestra la generación de una página HTML5 con un teseracto rotatorio, proyección 4D y personalización, resuelta correctamente salvo la vista de caras (que requirió una segunda edición).
- Razonamiento con modo "thinking": la configuración de ejecución activa `enable_thinking: true` y `truncate_history_thinking: false`, lo que preserva el razonamiento intermedio en el historial de conversación.
- Conversación multi-turno: el pipeline declarado en los tags es "conversational" y el ejemplo usa un agente (Pi Agent) con un system prompt extenso (`SOUL.md`).
- Soporte de agentes: el flujo documentado integra el modelo en un agente con instrucciones de sistema complejas y un plan de trabajo por fases.
- Tool calling / function calling: no disponible (no se documenta explícitamente).
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponible.

## Casos de uso

- Generación de código front-end en producción: el modelo puede producir páginas HTML5 con canvas/WebGL y lógica matemática (proyecciones 4D), como demuestra el ejemplo del teseracto; adecuado para prototipado rápido de visualizaciones interactivas.
- Asistente de desarrollo con agente autónomo: integrado en frameworks como Pi Agent con un system prompt detallado, el modelo puede seguir un plan por fases (comprensión, diseño, prototipo, pruebas) para tareas de ingeniería.
- Razonamiento técnico especializado: el modo thinking y la ventana de 54.096 tokens permiten abordar problemas de investigación con contexto largo, como análisis de papers o diseño de experimentos.
- Despliegue local en hardware de consumo: con ~9,6 GB en GGUF Q2/Q4, el modelo cabe en GPUs con 12-16 GB de VRAM, lo que habilita asistentes privados sin dependencia de API.
- Servidor de inferencia autoalojado: la configuración con `llama-server` y `--n-gpu-layers 99` permite exponer el modelo como endpoint compatible con la API de chat en un equipo propio.
- Educación y experimentación con cuantización: el repositorio sirve como referencia práctica de cuantización mixta Q2/Q4 con HPC-Quantize-V2 y de configuración de caché KV cuantizada.
- Generación de documentación técnica: la ventana de contexto amplia permite resumir y reescribir documentación extensa manteniendo coherencia entre secciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta una prueba cualitativa (generación de una página HTML5 con teseracto 4D) sin métricas cuantitativas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9,6 GB para los pesos en GGUF Q2/Q4, más la caché KV. Con `--ctx-size 54096` y caché `q5_1`, el consumo adicional de KV puede ser significativo; se recomienda monitorizar con `nvidia-smi` o `llama-bench`.
- GPU recomendadas: el modelo cabe en GPUs de consumo con 12-16 GB de VRAM (RTX 4070 Ti Super, RTX 4080, RTX 4090). Para contexto completo de 54k tokens con caché cuantizada, se recomienda 16-24 GB (RTX 4090, A5000, A6000).
- Cabe en GPU de consumo: sí, con cuantización Q2/Q4 y posiblemente offloading parcial de capas si la VRAM es limitada.
- Opciones de despliegue: `llama.cpp` / `llama-server` (documentado en la model card), y por compatibilidad GGUF también Ollama, LM Studio y otros runners basados en llama.cpp. vLLM y TGI no soportan GGUF de forma nativa para este formato mixto.
- Latencia y throughput estimados: no disponibles. La model card no incluye mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen-3.8-27B-Thinkingcap-Q2_Q4 (este) | 27,3B | 54.096 en config documentada | Apache-2.0 | GGUF Q2/Q4 | Cuantización mixta, modo thinking |
| Modelo base Qwen-3.8-27B-Thinkingcap | 27,3B (presumido) | no disponible | no disponible | safetensors (presumido) | Referencia sin cuantizar; no se dispone de su model card en la información |
| Alternativas de ~27B en GGUF | ~27B | variable | variable | GGUF | No se dispone de datos concretos de modelos comparables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, datos de entrenamiento ni evaluaciones de seguridad; se desconoce el comportamiento del modelo en dominios sensibles.
- Riesgo de alucinación: no evaluado. El ejemplo cualitativo muestra un error en la vista de caras del teseracto, corregido en una segunda iteración, lo que sugiere que puede requerir verificación humana en tareas de precisión.
- La cuantización Q2 puede degradar la calidad respecto al modelo original; no se han publicado comparativas entre el modelo base y esta versión cuantizada.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe equilibrado.
- La licencia Apache-2.0 permite uso comercial, pero al ser una cuantización de un modelo base cuyo origen exacto no se documenta, conviene verificar la licencia del modelo original antes de desplegarlo en producción.
- El contexto máximo nativo no está confirmado; los 54.096 tokens corresponden a la configuración de ejecución del ejemplo, no necesariamente al límite del modelo.
- La configuración de ejemplo usa `--temp 1.0`, valor alto que puede aumentar la variabilidad de las respuestas; en producción conviene ajustarlo según la tarea.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/CompressedGemma/Qwen-3.8-27B-Thinkingcap-Q2_Q4
- Imagen de ejemplo del teseracto: https://cdn-uploads.huggingface.co/production/uploads/69de1a493a21cb7c029dc694/9hCGdVUVhOXVykCItpdTc.png
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código ni demos adicionales.
