# florianvoss/LFM2-VL-3B-Autoround-a16w4

## Resumen

LFM2-VL-3B-Autoround-a16w4 es un paquete de modelo de visión-lenguaje publicado por florianvoss y compilado para hardware SiMa Modalix dentro de la colección Neat 0.6.0. Se construye a partir del modelo fuente `simaai/LFM2-VL-3B-Autoround-Safetensors` y cubre la tarea `image-text-to-text`: recibe imágenes y texto y genera respuestas textuales. No es un checkpoint convencional para transformers, sino un artefacto de despliegue con 140 ejecutables ELF, assets de runtime y compilación ModelGraph.

Su relevancia está en el despliegue local sobre Modalix: usa pesos INT4/G256 con excepciones de precisión mixta, activaciones BF16 y embeddings y caché KV INT8, con un contexto máximo de 4096 tokens y resolución de imagen de 512 × 512. El repositorio ocupa 3,9 GB. La model card no publica benchmarks ni mediciones de precisión o rendimiento en runtime, y la licencia es `other` con los términos del modelo fuente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de visión-lenguaje (`image-text-to-text`) compilado para SiMa Modalix; la arquitectura interna no se detalla en la información disponible |
| Parámetros totales | 3B (según el identificador del modelo; no se proporciona recuento exacto) |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens (máximo de compilación) |
| Tipos de cuantización | Pesos INT4/G256 con excepciones de precisión mixta; activaciones BF16; embeddings y caché KV INT8 |
| Idiomas soportados | no disponible |
| Licencia | `other`; se aplican los términos de licencia del modelo fuente |
| Formato de pesos | Paquete compilado LLiMa: 140 ejecutables ELF, `devkit/` con assets de runtime y ModelGraph; no safetensors ni GGUF |
| Tarea | `image-text-to-text` |
| Hardware objetivo | SiMa Modalix con runtime LLiMa compatible |
| Resolución de imagen | 512 × 512 |
| Prefill group size | 128 |
| Tamaño del repositorio | 3,9 GB |
| Fecha de creación | 2026-10-18 |

## Arquitectura y entrenamiento

El artefacto es una compilación nativa ModelGraph para Modalix, generada con 16 procesos paralelos y un hilo de simulador por proceso. La compilación fija el contexto máximo en 4096 tokens, el tamaño de grupo de prefill en 128 y la resolución de imagen en 512 × 512; estos parámetros se seleccionan durante la compilación. Los pesos se codifican en INT4/G256 con excepciones de precisión mixta heredadas de la fuente precuantizada, mientras que las activaciones se mantienen en BF16 y los embeddings y la caché KV en INT8. Se habilita filter sharing por defecto para los componentes de lenguaje.

En cuanto al entrenamiento, no se dispone de información sobre tokens, composición del dataset, fine-tuning, RLHF/DPO ni datos de alineación. Tampoco se documenta una innovación de arquitectura propia; la innovación principal es el pipeline de compilación y empaquetado para Modalix, no un nuevo preentrenamiento. El identificador incluye `Autoround`, pero la model card no describe el método de cuantización utilizado para generar la fuente precuantizada.

## Capacidades

- Generación de texto a partir de imágenes y prompts: pipeline `image-text-to-text`; el modelo puede describir o responder sobre una imagen de entrada.
- Comprensión visual con resolución fija de 512 × 512, seleccionada durante la compilación.
- Conversaciones multi-turno y contextos de hasta 4096 tokens, suficiente para diálogos breves o documentos cortos.
- Inferencia local en SiMa Modalix, sin dependencia de GPU convencional ni de servicios en la nube.
- Tool calling / function calling: no disponible en la información proporcionada.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se enumeran idiomas.
- Modo thinking, audio, vídeo u otras modalidades: no disponible.
- Generación de código, matemáticas o tareas de razonamiento especializado: no disponible; no se documentan evaluaciones.

## Casos de uso

- Inspección visual en línea de producción: una cámara captura imágenes de 512 × 512 y el modelo describe el estado de componentes o posibles defectos; se ejecuta en Modalix junto a la línea, sin enviar imágenes a la nube. El contexto de 4096 tokens permite registrar incidencias en una misma sesión. Requiere validar la precisión con el modelo base.
- Lectura de etiquetas y documentos en dispositivos de mano: captura de etiquetas, tickets o formularios y preguntas en lenguaje natural sobre su contenido. La resolución de 512 × 512 y el contexto de 4096 tokens limitan documentos densos o de varias páginas.
- Asistencia a operarios de mantenimiento: fotografía de un panel o equipo y consultas sobre su estado; el contexto de 4096 tokens permite encadenar varias preguntas y la inferencia local evita depender de conectividad.
- Triaje y filtrado de imágenes con privacidad: preclasificación o descripción de imágenes en entornos sanitarios, industriales o de vigilancia; al ejecutarse en Modalix, los datos no salen del dispositivo.
- Robótica móvil y AGV: comprensión de escena a bordo para generar descripciones o responder preguntas sobre obstáculos y objetos. La latencia no está medida, por lo que requiere pruebas en el hardware final.
- Moderación de contenido visual en el borde: descripción y clasificación preliminar de imágenes en dispositivos o pasarelas, reduciendo el ancho de banda frente a un enfoque en la nube. Es necesario validar sesgos y falsos positivos.
- Accesibilidad: descripción de imágenes para personas con discapacidad visual en terminales locales, con respuestas de texto generadas a partir de una imagen de 512 × 512.
- Verificación de lineales en retail: fotografía de estanterías o productos y preguntas sobre presencia, disposición o etiquetado; el despliegue local en Modalix facilita su uso en tienda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que no se realizaron mediciones de precisión ni rendimiento en runtime sobre Modalix.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Benchmarks multimodales (MMMU, DocVQA, etc.) | no disponible |
| Latencia y throughput en Modalix | no disponible |

## Requisitos de hardware

- VRAM estimada: no aplica; el paquete está compilado para SiMa Modalix, no para GPU convencional. No se proporciona una estimación equivalente para GPU.
- GPU recomendadas: ninguna; requiere Modalix con runtime LLiMa compatible y el entorno de Model Compiler correspondiente.
- GPU de consumo: no; no es ejecutable en RTX 4090, RTX 3090 u otras GPU de consumo.
- Almacenamiento: 3,9 GB de repositorio, con 140 ejecutables ELF y assets de runtime en `devkit/`.
- Despliegue: descarga con `hf download` y ejecución con `llima run`; la compilación se documenta en `compile.sh`. No se soportan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible; no se realizaron mediciones en runtime.
- Contexto y resolución: fijados en compilación (4096 tokens y 512 × 512). Cambiar estos valores requiere recompilar.

## Comparativa con modelos similares

No se dispone de datos verificables de benchmarks ni de especificaciones completas de alternativas en la información proporcionada. La comparación se limita a formato, hardware y licencia.

| Modelo | Parámetros | Contexto | Formato | Licencia | Hardware | Benchmarks |
|---|---|---|---|---|---|---|
| LFM2-VL-3B-Autoround-a16w4 (este paquete) | 3B (según identificador) | 4096 tokens | ELF compilado LLiMa | `other` | SiMa Modalix | no disponible |
| `simaai/LFM2-VL-3B-Autoround-Safetensors` (fuente) | 3B (según identificador) | no disponible | safetensors | se aplican términos del modelo fuente | no disponible | no disponible |
| LFM2-VL-3B (referencia de familia, no verificada) | 3B (según identificador) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dependencia de hardware: solo está previsto para SiMa Modalix; no es un checkpoint portable a GPU o CPU convencionales.
- La metadata de HuggingFace marca `inference: false`; no debe usarse directamente con transformers, vLLM u otros runners estándar.
- No hay validación de precisión ni de rendimiento en runtime; la model card solo confirma compilación completa, despliegue local y verificación por checksum.
- La cuantización INT4/G256 puede degradar la calidad respecto al modelo fuente; no se documenta la pérdida de precisión.
- El contexto de 4096 tokens y la resolución de 512 × 512 limitan documentos largos, imágenes de alta resolución y conversaciones extensas.
- No se enumeran idiomas soportados; no se puede garantizar cobertura multilingüe.
- Licencia `other`: es necesario revisar los términos del modelo fuente para uso comercial; la model card no confirma permisos explícitos.
- Sesgos y alucinaciones: no documentados; existe riesgo inherente en modelos visión-lenguaje, especialmente en descripciones de imágenes ambiguas.
- La compatibilidad con LLiMa y Model Compiler es crítica; una versión de runtime distinta puede impedir la ejecución.
- Los metadatos indican creación el 2026-10-18 y pertenencia a Neat 0.6.0; conviene verificar la vigencia del ecosistema antes de desplegar.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/florianvoss/LFM2-VL-3B-Autoround-a16w4)
- [Modelo fuente simaai/LFM2-VL-3B-Autoround-Safetensors](https://huggingface.co/simaai/LFM2-VL-3B-Autoround-Safetensors)
- [Árbol del modelo fuente en la revisión indicada](https://huggingface.co/simaai/LFM2-VL-3B-Autoround-Safetensors/tree/cf2319d344b91b54f95a4375f5f97b99b0bdbd42)
- [Colección Neat 0.6.0](https://huggingface.co/collections/florianvoss/neat-060)
- [compilation.json](https://huggingface.co/florianvoss/LFM2-VL-3B-Autoround-a16w4/blob/main/compilation.json)
- [compile.sh](https://huggingface.co/florianvoss/LFM2-VL-3B-Autoround-a16w4/blob/main/compile.sh)

La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores son los únicos verificables en la información proporcionada.
