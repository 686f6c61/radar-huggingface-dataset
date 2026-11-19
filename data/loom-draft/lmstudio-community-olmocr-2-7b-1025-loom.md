# loom-draft/lmstudio-community-olmOCR-2-7B-1025-loom

## Resumen

`loom-draft/lmstudio-community-olmOCR-2-7B-1025-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) para el checkpoint GGUF `olmOCR-2-7B-1025-Q4_K_M.gguf`, publicado originalmente por `lmstudio-community`. No se trata de un modelo nuevo entrenado por `loom-draft`, sino de un artefacto de empaquetado generado con la herramienta `loom-next` que permite ejecutar el modelo base sobre GPUs AMD concretas: el Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente, olmOCR-2-7B-1025, es un modelo vision-lenguaje de 7 mil millones de parámetros especializado en OCR y extracción estructurada de documentos, con una ventana de contexto de 128 000 tokens por petición y capacidad de procesar imágenes mediante un proyector multimodal separado (`mmproj-olmOCR-2-7B-1025-F16.gguf`). La relevancia de este paquete radica en que ofrece una vía de ejecución nativa en el stack ROCm/Loom para hardware AMD de consumo y profesional, con una API compatible con OpenAI (`/v1/chat/completions`), concurrencia de 4 peticiones y un límite de 4 096 tokens de salida por defecto.

La licencia del paquete es Apache 2.0, heredada del modelo base. Los resultados de rendimiento y las puertas de corrección del paquete no se han vuelto a medir todavía, según indica la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (modelo base olmOCR-2-7B-1025); detalles internos de la arquitectura no disponibles en la informacion proporcionada |
| Parametros totales | 7B (según el nombre del checkpoint base) |
| Parametros activos | no disponible (no es un modelo MoE según la informacion disponible) |
| Longitud de contexto | 128 000 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (checkpoint empaquetado); otros tipos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M) + proyector multimodal F16 (`mmproj-olmOCR-2-7B-1025-F16.gguf`); empaquetado Loom (`.loom`, `model.json`) |

## Arquitectura y entrenamiento

El paquete Loom no aporta información sobre el entrenamiento del modelo subyacente. Lo que sí se documenta es el mecanismo de empaquetado: `loom-next` genera programas `.loom` y `weights.loom` a partir de un `llm_config.json`, junto con el tokenizador (`tokenizer.json`) y una tarjeta `model.json` con los ficheros fuente fijados por hash SHA-256, verificados por `loom-fetch`. El checkpoint GGUF se utiliza sin modificar.

El modelo base es un vision-lenguaje de 7B orientado a OCR: recibe imágenes a través de un proyector multimodal independiente en precisión F16 y genera texto. La model card del paquete no detalla la composición del dataset de entrenamiento, el número de tokens vistos, ni si hubo fases de RLHF o DPO; esos datos corresponden a la model card original de olmOCR-2-7B-1025, que no se incluye en la información proporcionada. Tampoco se documentan innovaciones técnicas del modelo base como decodificación especulativa o atención lineal; de hecho, la tabla de características del paquete marca la decodificación especulativa como «not applicable».

## Capacidades

- Generación de texto e imagen-a-texto (`image-text-to-text`): el pipeline declarado en Hugging Face es `image-text-to-text`.
- Entrada de imágenes mediante partes `image_url` al estilo OpenAI, procesadas por el proyector `mmproj-olmOCR-2-7B-1025-F16.gguf`.
- OCR y extracción de contenido de documentos: es la función para la que está diseñado el modelo base olmOCR-2.
- Contexto largo: hasta 128 000 tokens por petición, adecuado para documentos extensos o múltiples páginas en una sola solicitud.
- Servidor compatible con OpenAI: expone `/v1/chat/completions`.
- Concurrencia: soporta 4 peticiones simultáneas.
- Límite de salida: 4 096 tokens por respuesta (preset `max_tokens`).
- Tool calling: no aplicable según la model card.
- Razonamiento / thinking mode: no aplicable.
- Decodificación especulativa: no aplicable.
- Entrada o salida de audio: no aplicable.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Muestreo (sampling): estado «no determinado» en la tabla de características.

## Casos de uso

- Digitalización masiva de documentos escaneados: el modelo recibe imágenes de páginas y devuelve texto; con 128 000 tokens de contexto puede procesar documentos completos o lotes de páginas en una sola petición, reduciendo la sobrecarga de orquestación.
- Extracción de datos estructurados de facturas y formularios: al ser un modelo de imagen-a-texto, se le puede enviar la imagen del documento y solicitar una representación en texto o JSON del contenido relevante.
- Construcción de pipelines RAG sobre archivos PDF: el OCR alimenta la fase de indexación; el contexto largo permite concatenar varias páginas sin truncamientos agresivos.
- Procesamiento por lotes en estaciones de trabajo AMD: el paquete está pensado para ejecutarse en Strix Halo o Radeon AI PRO R9700 mediante `loom-serve`, por lo que encaja en entornos locales sin GPU NVIDIA.
- Servicio interno de OCR con API compatible con OpenAI: al exponer `/v1/chat/completions`, se puede integrar con clientes y SDK existentes que ya hablan el protocolo de OpenAI, apuntando a `http://127.0.0.1:8080`.
- Archivística y gestión documental: digitalización de fondos con contexto largo para conservar la estructura del documento original en la salida.
- Atención al cliente sobre documentos adjuntos: un usuario envía una imagen de un recibo o contrato y el sistema extrae el texto para responder; la concurrencia de 4 peticiones permite un pequeño servicio multiusuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del paquete indica explícitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) «no se han vuelto a medir todavía». Las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran igualmente como «not yet re-measured» en ambas GPUs, por lo que no hay evidencia registrada de su cumplimiento.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El checkpoint es Q4_K_M de un modelo de 7B, más el proyector F16; la model card no publica cifras de memoria.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta compatibilidad con GPUs de consumo distintas de las dos anteriores; no disponible para RTX 4090, A100 o H100 en la información proporcionada.
- Despliegue: `loom-serve` mediante `pipx install "hrx-loom[hf]==0.2.0"`, con `loom-fetch` para descargar el paquete. Opciones recomendadas en la model card: `--materialize=copy`, `--pool_backing=fixed`, `--parameter_mode=preload` y `completion_spin_ns=4294967295` para espera activa de finalizaciones de GPU.
- Otros motores (vLLM, llama.cpp, Ollama, TGI): la model card solo documenta el flujo Loom; la comparación con llama.cpp se menciona como referencia de corrección, pero no se detallan instrucciones de despliegue en esos motores.
- Latencia y throughput: no disponibles; las filas de rendimiento no se han vuelto a medir.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparación rigurosa. Como referencia estructural, el propio paquete se compara internamente contra llama.cpp para las puertas de corrección, pero sin resultados publicados.

## Limitaciones y advertencias

- El paquete no es un modelo nuevo: es un envoltorio de despliegue del GGUF `olmOCR-2-7B-1025-Q4_K_M.gguf`; cualquier limitación del modelo base se hereda.
- Sin mediciones de rendimiento ni de corrección publicadas: las puertas `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `sampling`, `logits` y `decision` figuran como no remedidas, por lo que no hay evidencia registrada de equivalencia con llama.cpp.
- Compatibilidad de hardware restringida: el paquete está generado específicamente para gfx1151 (Strix Halo) y gfx1201 (Radeon AI PRO R9700); no se documenta su funcionamiento en otras GPUs.
- Idiomas soportados no disponibles: no se puede garantizar cobertura multilingüe sin consultar la model card del modelo base.
- Sin soporte de tool calling, thinking mode, decodificación especulativa ni audio, según la tabla de características.
- Límite de 4 096 tokens de salida por respuesta, lo que puede truncar extracciones de documentos muy extensos aunque el contexto de entrada sea de 128 000 tokens.
- Concurrencia limitada a 4 peticiones: no apto para servicios de alto volumen sin escalado horizontal.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; deben evaluarse sobre el modelo base antes de usarlo en producción.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del checkpoint base y del proyector multimodal en sus repositorios originales.
- Los resultados de búsqueda web devueltos corresponden a servicios no relacionados (Loom, la herramienta de grabación de pantalla, y la marca de ropa Loom), por lo que no aportan información técnica sobre este modelo.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/lmstudio-community-olmOCR-2-7B-1025-loom
- Checkpoint base (GGUF): https://huggingface.co/lmstudio-community/olmOCR-2-7B-1025-GGUF
- Repositorio de Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
