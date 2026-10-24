# Nekodeus/qwen3-vl-4b-instruct-openvino

## Resumen

Este repositorio es una conversión a OpenVINO IR del modelo Qwen/Qwen3-VL-4B-Instruct, un modelo de visión-lenguaje de 4 000 millones de parámetros desarrollado por Alibaba Cloud (familia Qwen). La conversión la firma el usuario Nekodeus y aplica cuantización INT8 solo a los pesos mediante NNCF, manteniendo las activaciones en FP16/FP32 tal como se trazaron durante la exportación. El resultado son siete submodelos IR (lenguaje, embeddings de texto, embeddings de visión con posición y merger, tokenizer y detokenizer) listos para ejecutarse con OpenVINO u optimum-intel sin código remoto.

El interés práctico es claro: permite desplegar un VLM conversacional de 4B en hardware Intel sin GPU dedicada, con un repositorio de 4,9 GB que cabe en memoria de un portátil o de un equipo de borde. La conversión se generó íntegramente en un entorno Kaggle solo-CPU con `optimum-cli`, y el resultado es reproducible con un único comando documentado en la model card.

Ahora bien, se trata de un artefacto derivado, no del modelo original: no aporta benchmarks propios, no tiene validación de la comunidad (0 descargas y 0 likes en el momento de la consulta) y hereda la licencia Apache-2.0 del modelo base. Cualquier evaluación de calidad debe remitirse a Qwen3-VL-4B-Instruct.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con encoder visual (clase `Qwen3VLForConditionalGeneration`) |
| Parámetros totales | ~4 000 millones (4B) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la documentación consultada solo menciona "contextos más largos" sin cifra concreta) |
| Tipos de cuantización | Pesos INT8 (NNCF, weight-only) en este repo; existe una variante FP16 oficial de OpenVINO; el modelo base ofrece pesos sin cuantizar |
| Idiomas soportados | no disponible (etiquetado como `multilingual`; la model card no enumera idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (`.xml` + `.bin`), 7 submodelos; no incluye safetensors ni GGUF |
| Tarea | `image-text-to-text` (visión-lenguaje) |
| Precisión de activaciones | FP16/FP32 según el trazado de la exportación |
| Tamaño del repositorio | 4,9 GB |
| Herramientas de conversión | optimum-intel 2.2.0, OpenVINO 2026.4.1, transformers 5.16.1 |
| Artefactos auxiliares | `preprocessor_config.json`, `processor_config.json`, `tokenizer.json`, `chat_template.jinja` |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base: un transformer decoder-only para el componente de lenguaje acoplado a un encoder visual, empaquetado bajo la clase `Qwen3VLForConditionalGeneration` de transformers 5. La exportación separa ese grafo en siete submodelos IR: el modelo de lenguaje, los embeddings de texto, los embeddings de visión (con sus componentes de posición y merger), más tokenizer y detokenizer. No hay código remoto ni `trust_remote_code`: el soporte de Qwen3-VL es nativo en transformers 5. La conversión no altera la arquitectura, solo el formato y la precisión de los pesos.

Sobre el entrenamiento del modelo original no se aporta información en los materiales consultados: no se indica número de tokens, composición del dataset, ni si hubo etapas de RLHF o DPO. La model card de esta conversión se limita a documentar el proceso de exportación. Las innovaciones que sí aparecen mencionadas en la documentación de la familia son mejoras en comprensión de texto, percepción y razonamiento visual, relaciones espaciales, vídeo dinámico y uso como agente; no se detalla el mecanismo técnico concreto. La cuantización aplicada aquí es weight-only INT8, es decir, se comprimen los pesos sin recalibrar activaciones, lo que reduce el peso en disco y memoria a costa de una posible pérdida de precisión que el autor no cuantifica.

## Capacidades

- Generación de texto e imagen-a-texto: responder preguntas sobre una imagen, describirla o resumir su contenido.
- Razonamiento visual: la documentación de la familia cita mejoras en percepción y razonamiento sobre contenido visual.
- Comprensión de relaciones espaciales y de vídeo dinámico, según la documentación del modelo base (no verificado en esta conversión concreta).
- Conversación multi-turno: la plantilla de chat (`chat_template.jinja`) está incluida en el repositorio y se aplica con `processor.apply_chat_template`.
- Multilingüe: etiqueta `multilingual` en el repo; sin lista de idiomas publicada.
- Integración con pipelines de OpenVINO GenAI mediante `ov::genai::VLMPipeline`.
- No verificado en esta conversión: tool calling / function calling, modo thinking y razonamiento multi-paso con agentes. La familia Qwen3-VL los menciona, pero ni la model card de esta exportación ni las herramientas de OpenVINO GenAI documentadas aquí los confirman.

## Casos de uso

- **Preguntas sobre imágenes en entornos aislados (air-gapped)**: el modelo se ejecuta en CPU con OpenVINO, sin acceso a red, lo que encaja en administraciones públicas, sanidad o industria con requisitos de confidencialidad estrictos. El ejemplo de VQA con `OVModelForImageTextToText` de la model card es directamente reutilizable.
- **Soporte técnico con capturas o fotografías**: un cliente envía una foto de un error, una etiqueta o un producto dañado y el modelo extrae la información relevante y genera una respuesta. La ventana de contexto no está documentada, así que conviene limitar el historial a pocos turnos más la imagen.
- **Procesamiento de documentos en lote sobre infraestructura Intel existente**: extracción de campos de facturas, albaranes o formularios escaneados sin aprovisionar GPU. El coste por página en CPU es mayor que en GPU, pero el modelo cabe en ~5 GB y elimina la dependencia de servicios externos.
- **Etiquetado y moderación de imágenes en un DAM o CMS**: generación automática de descripciones, títulos y etiquetas para catálogos de imágenes, ejecutada como trabajo batch nocturno en servidores sin GPU dedicada.
- **Inspección visual en el borde (IoT industrial)**: despliegue en mini-PC o equipos con CPU Intel junto a la línea de producción, usando `VLMPipeline` en C++ para describir o clasificar capturas de cámara. El tamaño de 4,9 GB y la ejecución en CPU son los argumentos principales; el throughput no está documentado y habría que medirlo.
- **Accesibilidad**: generación de descripciones alternativas de imágenes para lectores de pantalla en aplicaciones internas, donde el coste de una API externa por imagen sería prohibitivo a escala.
- **Prototipado rápido de producto multimodal**: validar una idea de funcionalidad visión-lenguaje en un portátil antes de decidir si se migra a GPU o a un modelo mayor, aprovechando que la conversión es reproducible con un solo comando `optimum-cli export openvino`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye MMLU, HumanEval, GSM8K, MMMU ni ninguna otra métrica, y tampoco se aportan cifras de latencia o throughput. Cualquier dato de calidad debería tomarse de la documentación de Qwen/Qwen3-VL-4B-Instruct, teniendo en cuenta que esta conversión introduce una cuantización INT8 de pesos cuyo impacto no se ha medido públicamente.

## Requisitos de hardware

- **VRAM/RAM estimada para INT8**: los pesos ocupan aproximadamente 4 GB (el repositorio completo son 4,9 GB, incluyendo encoder visual y artefactos auxiliares). Con activaciones y caché KV, conviene reservar entre 6 y 8 GB. Es una estimación a partir del tamaño del repo, no un dato publicado.
- **Variante FP16**: el repositorio oficial `OpenVINO/Qwen3-VL-4B-Instruct-fp16-ov` duplicaría aproximadamente el peso de los pesos (del orden de 8-9 GB), por lo que requiere más memoria.
- **GPU recomendadas**: al ser un artefacto OpenVINO, el objetivo natural es CPU Intel (con extensión AVX-512 o AMX en Xeon de última generación) e iGPU/GPU Intel mediante el plugin de GPU de OpenVINO. Para NVIDIA, la ruta razonable es el modelo base en transformers, vLLM o llama.cpp, no este IR.
- **¿Cabe en hardware de consumo?**: sí, en INT8 y en CPU, que es precisamente el caso de uso; también en iGPU Intel integradas con memoria compartida suficiente.
- **Opciones de despliegue**: `optimum-intel` (`OVModelForImageTextToText`), OpenVINO GenAI (`ov::genai::VLMPipeline`) en C++ o Python, y el servidor de OpenVINO Model Server si se necesita exposición HTTP. Para el modelo base existen alternativas GGUF vía Ollama (`qwen3-vl:4b-instruct`, requiere Ollama 0.12.7 o superior) y exportaciones para dispositivos Qualcomm.
- **Latencia y throughput**: no disponible. No se han publicado mediciones y dependerán fuertemente del hardware, del número de tokens generados y del uso de caché KV entre turnos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Nekodeus/qwen3-vl-4b-instruct-openvino (este) | 4B | no disponible | OpenVINO IR INT8 | Apache-2.0 | Conversión comunitaria, 4,9 GB, 0 descargas, sin benchmarks propios |
| OpenVINO/Qwen3-VL-4B-Instruct-fp16-ov | 4B | no disponible | OpenVINO IR FP16 | Apache-2.0 | Conversión mantenida por la organización OpenVINO; mayor precisión y mayor peso |
| Qwen/Qwen3-VL-4B-Instruct | 4B | no disponible | Safetensors (transformers 5) | Apache-2.0 | Modelo original; requiere GPU para un rendimiento cómodo y sin cuantizar |
| qwen3-vl:4b-instruct (Ollama) | 4B | no disponible | GGUF cuantizado | Apache-2.0 | Ruta más sencilla en equipos de consumo; requiere Ollama ≥ 0.12.7 |
| qwen3_vl_4b_instruct (Qualcomm AI Hub) | 4B | no disponible | Export para dispositivos Qualcomm | Apache-2.0 | Orientado a NPU de smartphones y portátiles Snapdragon |

La comparación relevante es entre formatos de despliegue, no entre calidades: los cinco artefactos derivan del mismo modelo base. La elección depende del hardware objetivo (Intel CPU/iGPU, NVIDIA, Qualcomm o genérico) y de si se prioriza FP16 frente a INT8.

## Limitaciones y advertencias

- **Sin validación de la comunidad**: 0 descargas y 0 likes en el momento de la consulta. No hay evidencia pública de que la conversión funcione correctamente más allá del ejemplo de la model card.
- **Impacto de la cuantización no medido**: la cuantización INT8 weight-only puede degradar la precisión en tareas de razonamiento visual u OCR, y el autor no publica ninguna comparación contra el modelo en FP16.
- **Alucinación**: como todo VLM, puede describir objetos o texto inexistentes en la imagen, especialmente en imágenes de baja resolución, documentos con tipografía densa o gráficos complejos. En producción conviene validar las extracciones con reglas o con una segunda pasada.
- **Contexto no documentado**: se desconoce la longitud de contexto efectiva de esta conversión. La documentación de la familia habla de ventanas amplias y vídeo, pero no se ofrece cifra; diseñar para contextos largos sin medir es arriesgado.
- **Idiomas no documentados**: la etiqueta `multilingual` no viene acompañada de una lista. El rendimiento en castellano no está verificado para este artefacto.
- **Acoplamiento a la pila Intel**: el IR solo se ejecuta con OpenVINO; no sirve en vLLM, TGI ni llama.cpp. Migrar después a otra infraestructura implica reconvertir desde el modelo base.
- **Dependencias de versión estrictas**: se generó con transformers 5.16.1, optimum-intel 2.2.0 y OpenVINO 2026.4.1. Versiones antiguas de optimum-intel u OpenVINO pueden no cargar los submodelos correctamente.
- **Licencia**: Apache-2.0 permite uso comercial, pero se mantienen las condiciones del modelo base de Alibaba Cloud; conviene revisar la model card original antes de un despliegue en producto.
- **Reproducibilidad parcial**: la conversión se hizo en Kaggle solo-CPU y el comando de exportación está documentado, pero no se publican hashes ni logs de la ejecución.

## Enlaces

- Repositorio HuggingFace de esta conversión: https://huggingface.co/Nekodeus/qwen3-vl-4b-instruct-openvino
- Modelo base Qwen3-VL-4B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Model card del modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct/blob/main/README.md
- Conversión oficial FP16 de OpenVINO: https://huggingface.co/OpenVINO/Qwen3-VL-4B-Instruct-fp16-ov
- Modelo en Ollama: https://ollama.com/library/qwen3-vl:4b-instruct
- Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_vl_4b_instruct
- Repositorio ai-hub-models (export para Qualcomm): https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/qwen3_vl_4b_instruct/README.md
