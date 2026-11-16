# Jon-Nielsen/Inkling-2-Small-NVFP4-CSF-FLARE-sm120-1M-c8-vision

## Resumen

Inkling-2-Small-NVFP4-CSF-FLARE-sm120-1M-c8-vision es un paquete de inferencia precompilado y cuantizado del modelo base `thinkingmachines/Inkling-2-Small`, publicado por el usuario Jon-Nielsen en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una exportación específica para el runtime Hyperflare (Flare), con pesos en formato NVFP4 (punto flotante de 4 bits con escalado), kernels CUDA compilados y grafos de ejecución capturados para cuatro GPU NVIDIA SM120 con 96 GB de VRAM cada una. El paquete está diseñado para servir peticiones de hasta 1.048.576 tokens de contexto con 8 peticiones concurrentes y decodificación especulativa de siete tokens por ronda mediante MTP (multi-token prediction), además de soportar entradas de visión.

La relevancia de esta ficha es doble. Por un lado, documenta un caso extremo de especialización de despliegue: un modelo de 48,9 millones de parámetros totales empaquetado en un repositorio de 350,6 GB, lo que refleja que el tamaño del artefacto no lo determina el número de parámetros sino los kernels, grafos y metadatos del runtime. Por otro, advierte de una restricción crítica: el formato no es cargable por Transformers, vLLM, SGLang ni llama.cpp, y requiere el ejecutable Flare incluido en `runner/`, con una compilación local específica y dos parches locales documentados en `CREDITS.md`.

La información pública disponible es muy limitada: no hay pipeline declarado, no se listan idiomas soportados y no se han publicado resultados de benchmarks. La licencia es `lil-license-1.0`, marcada como "other" en los metadatos, lo que obliga a revisar el archivo `LICENSE` antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base `thinkingmachines/Inkling-2-Small`; el paquete incluye kernels CUDA y grafos de ejecución para SM120) |
| Parametros totales | 48.895.094 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 1.048.576 tokens por petición |
| Tipos de cuantizacion | NVFP4 (4 bits con escalado), etiquetado como 8-bit en los tags del repo; CSF (probablemente formato de compresión/almacenamiento del autor, sin detalle público) |
| Idiomas soportados | no disponible |
| Licencia | `lil-license-1.0` (metadatos: `license: other`) |
| Formato de pesos | safetensors (`model.safetensors`, sha256 `3519ed40ce04243a4babae4160cceb7f60b5280baca7da5093a6dc8e03641ef7`) más artefactos propietarios de Flare (kernels CUDA compilados y grafos de ejecución capturados) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base `thinkingmachines/Inkling-2-Small` en la documentación proporcionada: no se especifica si es un transformer denso, un MoE, un modelo híbrido o basado en SSM, ni se detallan capas, dimensiones ocultas o cabezas de atención. Tampoco hay datos sobre el corpus de entrenamiento, el número de tokens procesados, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

Lo que sí documenta la model card es la capa de despliegue. El paquete ha sido exportado con Hyperflare (Flare) para cuatro GPU NVIDIA SM120 de 96 GB, con contexto de 1.048.576 tokens por petición, 8 peticiones concurrentes y decodificación especulativa de siete tokens por ronda mediante MTP. Incluye pesos, kernels CUDA compilados y grafos de ejecución capturados, lo que implica una integración estrecha con el hardware objetivo. La compilación se realizó sobre Ubuntu 24.04 con driver 615.x el 16 de noviembre de 2026, y el primer arranque requiere `--publisher-keys publisher.json` junto con la aceptación única de confianza del espacio de nombres `local-development`. El autor indica que Inkling 2 no forma parte de una build pública de Flare, por lo que las imágenes publicadas del runtime no pueden servir este paquete; es necesaria una compilación local con dos parches descritos en `CREDITS.md`.

## Capacidades

- Generación de texto autoregresiva con ventana de contexto de hasta 1.048.576 tokens por petición, adecuada para documentos extensos o historiales de conversación muy largos.
- Decodificación especulativa con MTP de siete tokens por ronda, orientada a reducir la latencia de generación en el hardware SM120 objetivo.
- Procesamiento de entradas de visión, según indica la model card ("vision inputs enabled").
- Servicio concurrente de hasta 8 peticiones simultáneas por instancia Flare.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se listan idiomas en los metadatos.
- Modo "thinking" explícito: no disponible en la información proporcionada.

## Casos de uso

- Análisis de repositorios y documentación técnica extensa: con 1.048.576 tokens de contexto por petición, el modelo puede ingerir bases de código completas o conjuntos de documentación en una sola llamada, evitando estrategias de troceado y recuperación.
- Asistentes sobre historiales largos: conversaciones multi-turno con memoria de cientos de miles de tokens, útil en soporte técnico especializado o auditoría de incidencias donde el contexto acumulado es relevante.
- Procesamiento de documentos con visión: al aceptar entradas de imagen, puede emplearse en extracción de información de capturas, diagramas o páginas escaneadas combinadas con texto largo.
- Generación asistida en lote con concurrencia moderada: las 8 peticiones simultáneas por instancia permiten servir cargas de trabajo de equipo pequeño o pipelines internos sin necesidad de clústeres adicionales.
- Evaluación de decodificación especulativa en producción: el paquete sirve como banco de pruebas para medir el impacto de MTP con siete tokens por ronda en latencia y throughput sobre SM120.
- Investigación sobre cuantización NVFP4: permite estudiar la calidad de un modelo pequeño (48,9 M de parámetros) tras cuantización de 4 bits con escalado, en un entorno controlado y reproducible.
- Despliegue en infraestructura dedicada con cuatro GPU de 96 GB: escenario de laboratorio o centro de datos donde ya se dispone de hardware SM120 y se quiere validar el runtime Flare frente a vLLM o SGLang.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM: el paquete está preparado para cuatro GPU NVIDIA SM120 con 96 GB de VRAM cada una (384 GB totales). No se documenta una configuración con menos GPU ni con cuantizaciones alternativas.
- GPU recomendadas: exclusivamente NVIDIA SM120 de 96 GB según la model card; no se garantiza funcionamiento en otras arquitecturas.
- GPU de consumo: no disponible. El formato propietario de Flare y los kernels compilados para SM120 impiden su uso en RTX 4090 u otras GPU consumer sin una reexportación específica.
- Opciones de despliegue: únicamente el ejecutable Flare incluido en `runner/`, con compilación local y dos parches descritos en `CREDITS.md`. Transformers, vLLM, SGLang y llama.cpp no pueden cargar este formato.
- Latencia y throughput: no disponibles. La model card menciona 8 peticiones concurrentes y siete tokens borrador por ronda, pero no publica métricas medidas.
- Almacenamiento: el repositorio ocupa 350,6 GB y el paquete exportado se describe como 327 GB, por lo que se requiere espacio en disco equivalente además del espacio temporal de despliegue.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Small-NVFP4-CSF-FLARE-sm120-1M-c8-vision (este paquete) | 48.895.094 | 1.048.576 | safetensors + artefactos Flare | `lil-license-1.0` | Hugging Face, 0 descargas |
| thinkingmachines/Inkling-2-Small (modelo base) | no disponible | no disponible | no disponible | no disponible | Hugging Face (referenciado como `base_model`) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa técnica con modelos alternativos de tamaño o tarea equivalente.

## Limitaciones y advertencias

- Formato no estándar: el paquete no es cargable por Transformers, vLLM, SGLang ni llama.cpp; solo funciona con el ejecutable Flare incluido y una compilación local con dos parches.
- Dependencia de hardware concreto: requiere cuatro GPU NVIDIA SM120 de 96 GB; no hay constancia de soporte para otras GPU ni de configuraciones reducidas.
- Proceso de arranque con fricción: el primer inicio exige `--publisher-keys publisher.json` y la aceptación única de confianza del espacio de nombres `local-development`, lo que añade pasos manuales y riesgo operativo.
- Licencia restrictiva o poco habitual: `lil-license-1.0` figura como "other" en los metadatos; es imprescindible leer `LICENSE` antes de cualquier uso comercial o redistribución.
- Ausencia de datos de evaluación: no hay benchmarks, métricas de latencia ni comparativas publicadas, por lo que no es posible estimar la calidad del modelo cuantizado frente al base.
- Idiomas no declarados: no se listan idiomas soportados, lo que impide garantizar un comportamiento correcto fuera del idioma o idiomas de entrenamiento del modelo base.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; deben evaluarse empíricamente antes de un despliegue en producción.
- Trazabilidad limitada: el autor no publica detalles sobre el proceso de cuantización NVFP4 ni sobre el formato CSF, lo que dificulta auditar la fidelidad respecto al modelo base.
- Madurez del artefacto: 0 descargas y 0 likes en el momento de la consulta, con creación y actualización el mismo día (16 de noviembre de 2026), lo que sugiere un paquete recién publicado y sin validación comunitaria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Jon-Nielsen/Inkling-2-Small-NVFP4-CSF-FLARE-sm120-1M-c8-vision
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Licencia (`LICENSE` dentro del repo): https://huggingface.co/Jon-Nielsen/Inkling-2-Small-NVFP4-CSF-FLARE-sm120-1M-c8-vision/blob/main/LICENSE
- Créditos y parches de compilación local (`CREDITS.md` dentro del repo): https://huggingface.co/Jon-Nielsen/Inkling-2-Small-NVFP4-CSF-FLARE-sm120-1M-c8-vision/blob/main/CREDITS.md
- Ejecutable Flare (`runner/` dentro del repo): https://huggingface.co/Jon-Nielsen/Inkling-2-Small-NVFP4-CSF-FLARE-sm120-1M-c8-vision/tree/main/runner
