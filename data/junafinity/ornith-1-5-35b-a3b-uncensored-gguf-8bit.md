# junafinity/Ornith-1.5-35B-A3B-uncensored-GGUF-8bit

## Resumen

Ornith-1.5-35B-A3B-uncensored-GGUF-8bit es una versión modificada del modelo multimodal Ornith-1.5-35B-A3B, desarrollado por Ornith AI y posteriormente sometido a un proceso de "abliteración" (eliminación de la dirección de rechazo) por el usuario junafinity mediante la herramienta ZeroFuse. El resultado es un checkpoint que conserva las capacidades del modelo original —incluyendo la torre de visión y el bloque de predicción multi-token (MTP)— pero que ha reducido drásticamente los rechazos ante peticiones consideradas dañinas, pasando de 1 rechazo a 0 en un conjunto de prueba de 64 casos, con una divergencia KL de 0,000183 respecto al modelo base, lo que indica un impacto mínimo en las capacidades generales.

El modelo base es un MoE (mixture of experts) de 35.505 millones de parámetros totales, con aproximadamente 3.000 millones de parámetros activos por token (según la nomenclatura A3B), basado en la arquitectura qwen3_5_moe. Esta versión concreta se distribuye en formato GGUF con cuantización Q8_0, lo que la hace adecuada para inferencia con llama.cpp y herramientas compatibles. El repositorio incluye además el proyector de visión en un archivo separado (mmproj-Ornith-1.5-35B-A3B-uncensored-f16.gguf) y conserva el bloque MTP dentro del mismo archivo GGUF, permitiendo decodificación especulativa.

La relevancia de este modelo radica en que ofrece una alternativa "sin censura" de un modelo multimodal de tamaño medio, con preservación verificada de la torre de visión y del MTP, y con un proceso de abliteración documentado y auditable. Está pensado para desarrolladores que necesitan un modelo que responda sin restricciones de seguridad en entornos controlados, aunque esta característica conlleva riesgos importantes que se detallan en la sección de limitaciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (qwen3_5_moe) con atención lineal y self-attention, torre de visión y bloque MTP |
| Parametros totales | 35.505.251.456 (35,5B) |
| Parametros activos | 3B (estimado por la nomenclatura A3B, no confirmado explícitamente) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (este build); también disponibles Q6_K y Q4_K_M en la familia GGUF, y MLX 8/6/4-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q8_0) para este build; el modelo base usa safetensors |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un transformer MoE con 40 capas (según la referencia a "blk.40" en el export GGUF), que combina atención lineal (linear_attn) y self-attention estándar, siguiendo el diseño de la familia Qwen3.5. Incluye una torre de visión de 446,6 millones de parámetros (333 tensores) y un bloque de predicción multi-token (MTP) de 844,6 millones de parámetros (785 tensores), que permite decodificación especulativa. El modelo fue entrenado por Ornith AI con un enfoque en razonamiento, tareas de agente y generación de código, según la información pública de la compañía.

La modificación principal de esta versión es la abliteración realizada con ZeroFuse. El proceso consistió en capturar activaciones del flujo residual ante conjuntos de prompts dañinos y no dañinos, estimar la dirección de rechazo mediante diferencia de medias con refinamiento proyectado, y luego realizar una búsqueda multi-objetivo con Optuna TPE (50 trials, 2 puntos Pareto) para seleccionar la configuración óptima de capa fuente, rango de capas y fuerza de ablación. El resultado fue una edición directa de los pesos en las capas 17 a 21 (de 40), con una fuerza de 0,8515, que ortogonaliza la dirección de rechazo de las proyecciones de escritura residual: `self_attn.o_proj`, `linear_attn.out_proj`, `mlp.shared_expert.down_proj` y los `down_proj` de los expertos MoE. No se añade ningún adaptador en tiempo de inferencia; el checkpoint resultante tiene la misma forma y velocidad que el original.

La torre de visión y el bloque MTP no fueron modificados, y se verificó mediante comparación SHA-256 que sus pesos son bit-idénticos antes y después del proceso. En el export GGUF, la torre de visión se incluye como archivo separado (`mmproj-*.gguf`) y el MTP se integra como el bloque final (`blk.40` con tensores `nextn.*`).

## Capacidades

- Generación de texto y razonamiento multi-step, con soporte para tareas de agente y codificación, según las características del modelo base.
- Multimodal: procesamiento de imágenes junto con texto (image-text-to-text), gracias a la torre de visión preservada. El pipeline declarado es `image-text-to-text`.
- Decodificación especulativa: el bloque MTP conservado permite acelerar la generación mediante predicción de múltiples tokens.
- Tool calling y function calling: no confirmado explícitamente en la información disponible, pero es una capacidad habitual en la familia Qwen3.5; se debe verificar con el modelo base.
- Comportamiento "uncensored": el proceso de abliteración reduce los rechazos ante peticiones dañinas (de 1 a 0 en el conjunto de prueba), manteniendo una distribución de salida casi idéntica al modelo base en prompts inocuos (KL 0,000183).
- Multilingüe: no se especifican idiomas soportados en la información proporcionada.

## Casos de uso

- Generación de contenido creativo sin restricciones: el modelo puede utilizarse para escribir ficción, poesía o guiones que aborden temas tabú o controvertidos sin rechazos automáticos, gracias a la abliteración. Es adecuado para entornos donde se requiere libertad creativa total, siempre bajo supervisión humana.
- Asistente de programación con soporte multimodal: al conservar la torre de visión, puede recibir capturas de pantalla de código o diagramas y generar explicaciones o código asociado, útil en entornos de desarrollo donde se necesita analizar imágenes de interfaces o errores visuales.
- Análisis de documentos con imágenes: el modelo puede procesar documentos escaneados o capturas que contengan texto e imágenes, extrayendo información y respondiendo preguntas sobre ellos, lo que resulta útil en tareas de digitalización y archivado.
- Investigación en seguridad y alineación: al ser una versión abliterada con documentación detallada del proceso, sirve como caso de estudio para investigar los efectos de la eliminación de rechazos en modelos multimodales, comparando comportamientos antes y después.
- Desarrollo de agentes conversacionales especializados: con su capacidad de razonamiento multi-step y posible tool calling, puede integrarse en pipelines de agentes que necesiten interactuar con APIs o ejecutar acciones, aunque se debe validar la compatibilidad con el framework utilizado.
- Inferencia local en hardware de gama media: al ser un MoE con solo 3B parámetros activos, el modelo puede ejecutarse en GPUs de consumo con suficiente VRAM (ver requisitos de hardware), permitiendo despliegues locales sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks oficiales para esta versión abliterada en la información disponible. El modelo base Ornith-1.5-35B-A3B aparece en el sitio BenchLM con una puntuación pública estimada de 49,27/100 y ocupa el puesto 134 de 221 modelos evaluados, con 18 filas de benchmark mostradas, pero estos datos son estimados y no se detallan los resultados individuales. No se dispone de comparaciones directas con otros modelos en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF Q8_0 pesa 38,7 GB, por lo que se necesita al menos 40 GB de VRAM para cargar el modelo completo en GPU. Con cuantizaciones menores (Q6_K ~33 GB, Q4_K_M ~26 GB) se reduce el requisito.
- GPU recomendadas: para Q8_0, una NVIDIA A100 40GB, A100 80GB, H100, o dos GPUs de 24 GB (por ejemplo, RTX 4090) en configuración multi-GPU. Para Q4_K_M, una RTX 4090 (24 GB) o RTX 3090 (24 GB) podría ser suficiente.
- En CPU: llama.cpp permite ejecutar el modelo en RAM, con un consumo de memoria similar al tamaño del archivo (38,7 GB en Q8_0), aunque la velocidad será significativamente menor.
- Opciones de despliegue: llama.cpp (compatible con GGUF), llama-mtmd-cli para multimodal, vLLM (si soporta el formato GGUF o el modelo base safetensors), Ollama (si se convierte a su formato), y MLX para Apple Silicon (existen variantes MLX 8/6/4-bit).
- Latencia y throughput: no se proporcionan datos específicos. Al ser un MoE con 3B activos, la velocidad de generación depende en gran medida del ancho de banda de memoria y del número de GPUs; en una A100 80GB se puede esperar un throughput razonable para tareas interactivas, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa directa con modelos equivalentes. El modelo base Ornith-1.5-35B-A3B pertenece a la familia de MoE de ~35B con ~3B activos, similar a otros modelos como Qwen3-30B-A3B (si existe) o DeepSeek-V2-Lite (16B MoE con 2,4B activos), pero no se han encontrado datos comparativos en la información proporcionada. Se recomienda consultar los benchmarks del modelo base en BenchLM o en la documentación oficial de Ornith AI para obtener referencias.

## Limitaciones y advertencias

- La abliteración elimina los mecanismos de rechazo ante contenido dañino, lo que significa que el modelo puede generar respuestas peligrosas, ilegales o éticamente cuestionables si se le solicita. Su uso debe restringirse a entornos controlados y con supervisión humana.
- No se han publicado evaluaciones de sesgos ni de seguridad para esta versión. El proceso de abliteración puede haber alterado sutilmente el comportamiento en dominios sensibles, aunque la KL baja sugiere un impacto mínimo.
- La longitud de contexto no está documentada; se desconoce si el modelo soporta ventanas largas (por ejemplo, 32K o 128K tokens) o si tiene limitaciones específicas.
- Los idiomas soportados no están especificados; el modelo base probablemente hereda las capacidades multilingües de Qwen3.5, pero no hay confirmación.
- La licencia Apache-2.0 permite uso comercial, pero el término "uncensored" puede implicar riesgos legales o de reputación si se despliega en aplicaciones públicas.
- El bloque MTP está integrado en el GGUF, pero no todas las herramientas de inferencia lo soportan; si se usa con un runtime que no lo reconoce, podría ignorarse sin afectar la funcionalidad básica.
- La torre de visión requiere descargar el archivo `mmproj-*.gguf` por separado; si no se incluye, el modelo funcionará solo en modo texto.

## Enlaces

- Repositorio HuggingFace de esta versión: https://huggingface.co/junafinity/Ornith-1.5-35B-A3B-uncensored-GGUF-8bit
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Página oficial de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Herramienta ZeroFuse: https://github.com/junainfinity/ZeroFuse
- Benchmarks estimados en BenchLM: https://benchlm.ai/models/ornith-1-5-35b-a3b
- Discusión en foros de NVIDIA: https://forums.developer.nvidia.com/t/deepreinforce-ornith-1-5-family-released/380623
