# florianvoss/Qwen2.5-VL-3B-Instruct-GPTQ-a16w4

## Resumen
Qwen2.5-VL-3B-Instruct-GPTQ-a16w4 es un artefacto de despliegue publicado por florianvoss a partir de simaai/Qwen2.5-VL-3B-Instruct-GPTQ-Safetensors, derivado del modelo multimodal Qwen2.5-VL-3B-Instruct de Qwen. No es un modelo entrenado desde cero: es una compilación y cuantización GPTQ a16w4 empaquetada para SiMa Modalix dentro de la colección Neat 0.6.0, con licencia qwen-research. La arquitectura subyacente es un modelo visión-lenguaje Qwen2.5-VL de unos 3,75 B de parámetros en el modelo base.

El paquete fija 4096 tokens de contexto y 448 × 448 de resolución de imagen, con activaciones BF16, embeddings y KV cache INT8 y pesos de 4 bits. Incluye 211 ejecutables ELF y un devkit para el runtime LLiMa; la compilación y el despliegue local se completaron, pero no hay medidas de precisión ni rendimiento en runtime. Su interés es llevar un visión-lenguaje pequeño a inferencia en dispositivo con un formato ya compilado, a cambio de contexto corto, resolución fija y dependencia de Modalix.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo multimodal Qwen2.5-VL (visión-lenguaje), compilado como ModelGraph para SiMa Modalix |
| Parámetros totales | 3,75 B (modelo base Qwen2.5-VL-3B-Instruct, según SourceForge; el artefacto compilado no publica recuento propio) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (máximo configurado en la compilación) |
| Tipos de cuantización | GPTQ a16w4: pesos de 4 bits, activaciones BF16; embeddings y KV cache INT8; grupos y excepciones de precisión mixta heredados del origen |
| Idiomas soportados | no disponible (la model card no enumera idiomas) |
| Licencia | qwen-research (license: other) |
| Formato de pesos | paquete compilado LLiMa para Modalix: `elf_files/` con 211 ejecutables y `devkit/`; origen en safetensors GPTQ; no es GGUF |
| Modelo base | simaai/Qwen2.5-VL-3B-Instruct-GPTQ-Safetensors |
| Resolución de imagen | 448 × 448 |
| Pipeline | image-text-to-text |
| Biblioteca | llima |
| Tamaño del repositorio | 5,2 GB |

## Arquitectura y entrenamiento
El artefacto hereda la arquitectura multimodal de Qwen2.5-VL-3B-Instruct: un modelo visión-lenguaje que combina entrada de imagen y texto para generar respuestas. Sobre esa base, el autor aplica una compilación nativa con ModelGraph para SiMa Modalix, usando 16 procesos paralelos con un hilo de simulador cada uno, tamaño de grupo de prefill de 128 y compartición de filtros activada por defecto en los componentes de lenguaje. La cuantización conserva los tamaños de grupo y las excepciones de precisión mixta del modelo precuantizado de origen.

No se dispone de datos de entrenamiento en la información proporcionada: no se indican número de tokens, composición del dataset ni si hubo RLHF, DPO u otro ajuste. El artefacto no se reentrena; se compila y empaqueta el modelo base ya cuantizado. La model card indica que la compilación completa y el despliegue local finalizaron correctamente y que los ficheros se verificaron por checksum, pero no se realizaron mediciones de generación en runtime ni evaluaciones de precisión o rendimiento en esa cola.

## Capacidades
- Generación de texto y respuesta sobre imágenes: pipeline image-text-to-text, con entrada de imagen de 448 × 448 y prompt de texto.
- Comprensión visual: reconocimiento de objetos, lectura de gráficos y análisis de disposición, capacidades declaradas para el modelo base Qwen2.5-VL-3B-Instruct en la información web; no verificadas en este artefacto compilado.
- Salidas estructuradas y localización visual: el modelo base se describe con soporte de salidas estructuradas y localización visual; este paquete no aporta validación específica.
- Vídeo y razonamiento temporal: el modelo base se describe con procesamiento de vídeo largo y razonamiento temporal; la model card de este artefacto no documenta configuración de vídeo, por lo que no se puede confirmar en la compilación.
- Llamada a herramientas o function calling: no disponible en la información proporcionada.
- Agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la model card no enumera idiomas ni niveles de soporte.
- Modo de razonamiento explícito o thinking mode: no disponible.

## Casos de uso
- Extracción de datos estructurados de facturas y albaranes en Modalix: el modelo recibe una imagen de 448 × 448 y un prompt para devolver campos concretos; para texto pequeño conviene recortar regiones y enviar varias imágenes, porque la resolución es fija.
- Inspección visual de defectos en fabricación: clasificación de imágenes de producto en 448 × 448 y generación de una etiqueta o justificación; es adecuado si la línea tolera la latencia del runtime y si los defectos son visibles a esa resolución.
- Asistente multimodal para operarios: preguntas en lenguaje natural sobre una foto de una pieza, panel o etiqueta; el contexto de 4096 tokens sirve para una interacción corta, no para manuales extensos.
- Lectura de gráficos y dashboards: captura de un panel, extracción de tendencias y explicación; requiere recortes por región para ejes y leyendas pequeñas.
- Accesibilidad en kioscos o dispositivos: descripción de imágenes para personas con discapacidad visual; el procesamiento local en Modalix evita enviar la imagen a la nube si el despliegue es completamente local.
- Etiquetado y moderación visual en edge: preclasificación de imágenes y generación de motivos; debe mantenerse revisión humana por riesgo de alucinación.
- Soporte documental con diagramas: preguntas sobre esquemas técnicos o capturas de planos; los 448 × 448 limitan planos densos, así que hay que segmentar la imagen.
- Retail y lineal: reconocimiento de productos y comprobación de disposición; necesita mosaicos o recortes por estante para compensar la resolución fija.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni métricas de visión, y tampoco se aportan comparaciones con el modelo base. La validación indicada se limita a compilación, despliegue local y verificación por checksum; no hay latencia, throughput ni precisión medidas en Modalix.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible; no aplica a GPU porque el artefacto está empaquetado para SiMa Modalix. El repositorio ocupa 5,2 GB.
- GPU recomendadas: no aplica a este paquete; para el modelo base no se aportan requisitos de GPU en la información disponible.
- GPU de consumo: no para este artefacto; no es un paquete safetensors o GGUF para RTX 4090 u otras GPU de consumo.
- Memoria del acelerador: no disponible; la model card no detalla memoria necesaria en Modalix.
- Opciones de despliegue: `llima run ./Qwen2.5-VL-3B-Instruct-GPTQ-a16w4` en Modalix con un runtime LLiMa compatible. No se documentan vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia y throughput: no disponible; la model card indica explícitamente que las mediciones de generación en runtime no se realizaron en esa cola.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Formato y destino | Licencia |
|---|---|---|---|---|
| florianvoss/Qwen2.5-VL-3B-Instruct-GPTQ-a16w4 | 3,75 B (heredados) | 4096 | LLiMa compilado para SiMa Modalix | qwen-research |
| Qwen/Qwen2.5-VL-3B-Instruct | 3,75 B | no disponible | safetensors para transformers | qwen-research |
| simaai/Qwen2.5-VL-3B-Instruct-GPTQ-Safetensors | 3 B por nombre; recuento exacto no disponible | no disponible | GPTQ safetensors, origen del artefacto | qwen-research (heredada) |
| AngelSlim/Qwen2.5-VL-3B-Instruct-INT4-GPTQ | 3 B por nombre; recuento exacto no disponible | no disponible | INT4 GPTQ para transformers | no disponible |

La comparación es limitada: no se dispone de benchmarks ni de longitud de contexto del modelo base en la información proporcionada. La diferencia principal de este artefacto es el formato compilado y el destino hardware, no una mejora de capacidades.

## Limitaciones y advertencias
- Es un artefacto compilado, no un modelo genérico: la inferencia está ligada a SiMa Modalix y a un runtime LLiMa compatible. Los metadatos de Hugging Face indican `inference: false`.
- No hay validación de precisión ni de rendimiento en runtime; solo se declara compilación correcta, despliegue local y verificación por checksum.
- Contexto máximo de 4096 tokens: corto para conversaciones largas, documentos extensos o razonamiento multi-turno profundo.
- Resolución de imagen fija de 448 × 448: puede perder texto pequeño, detalles finos, planos densos o escenas amplias; requiere recortes, mosaicos o preprocesado.
- La cuantización a16w4 con embeddings y KV cache INT8 puede degradar la precisión respecto al modelo base; no se aportan evaluaciones que cuantifiquen esa pérdida.
- Sesgos y alucinaciones: no evaluados en este artefacto; se heredan los del modelo base Qwen2.5-VL-3B-Instruct.
- Idiomas no documentados: no se debe asumir soporte multilingüe homogéneo sin pruebas específicas.
- Licencia qwen-research: puede imponer restricciones para uso comercial; es necesario revisar el enlace de licencia del modelo base antes de producir.
- Dependencia de hardware y compilador: 211 ejecutables ELF y 5,2 GB de paquete; no es portable a GPU convencionales sin recompilar o usar el modelo base.
- No usar en producción sin validar el caso de uso concreto sobre Modalix, incluyendo precisión, latencia y comportamiento ante imágenes fuera de distribución.

## Enlaces
- [Modelo en Hugging Face](https://huggingface.co/florianvoss/Qwen2.5-VL-3B-Instruct-GPTQ-a16w4)
- [Modelo base simaai/Qwen2.5-VL-3B-Instruct-GPTQ-Safetensors](https://huggingface.co/simaai/Qwen2.5-VL-3B-Instruct-GPTQ-Safetensors)
- [Qwen/Qwen2.5-VL-3B-Instruct](https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct)
- [Licencia qwen-research del modelo base](https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct/blob/66285546d2b821cf421d4f5eb2576359d3770cd3/LICENSE)
- [Colección Neat 0.6.0](https://huggingface.co/collections/florianvoss/neat-060)
- [compilation.json del artefacto](https://huggingface.co/florianvoss/Qwen2.5-VL-3B-Instruct-GPTQ-a16w4/blob/main/compilation.json)
- [Qwen2.5-VL-3B-Instruct en ModelScope](https://modelscope.ai/models/Qwen/Qwen2.5-VL-3B-Instruct)
- [Colección Qwen2.5-VL en Hugging Face](https://huggingface.co/collections/Qwen/qwen25-vl)
- [AngelSlim/Qwen2.5-VL-3B-Instruct-INT4-GPTQ](https://huggingface.co/AngelSlim/Qwen2.5-VL-3B-Instruct-INT4-GPTQ)
- [Qwen2.5-VL-3B en LM Studio](https://lmstudio.ai/models/qwen/qwen2.5-vl-3b)
- [Qwen2.5-VL-3B-Instruct en SourceForge](https://sourceforge.net/projects/qwen2-5-vl-3b-instruct/)
