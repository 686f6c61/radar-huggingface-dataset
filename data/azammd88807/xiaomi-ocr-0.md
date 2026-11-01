# azammd88807/Xiaomi-OCR-0

## Resumen

Xiaomi-OCR-0 es un modelo de vision-lenguaje (VLM) especializado en OCR y comprension de documentos, desarrollado por SeerRay-Lab y publicado bajo el paraguas de Xiaomi. Con solo 0,8B parametros (873.438.784 exactos), parte del modelo base Qwen3.5-0.8B-Base y se entrena sobre un corpus centrado en OCR de aproximadamente 170 millones de muestras. Su proposito es unificar en un unico modelo compacto tres tareas que habitualmente requieren sistemas separados: el parseo de documentos (extraccion de texto, tablas y formulas con su estructura), la respuesta a preguntas visuales sobre documentos (VQA) y la extraccion de informacion clave (KIE).

El modelo resulta relevante porque demuestra que un VLM de menos de mil millones de parametros puede competir con alternativas de mayor tamano en tareas de OCR. Segun la model card, alcanza el primer puesto en Real5-OmniDocBench con 95,24 y el segundo en OmniDocBench v1.6 (96,83) y Wild-OmniDocBench (87,94), ademas de superar a Qwen3.5-2B en la media de cinco benchmarks de VQA orientados a OCR (83,2 frente a 80,9) con una cuarta parte de los parametros.

La arquitectura sigue el esquema transformer multimodal de la familia Qwen3.5, con un codificador visual acoplado a un decodificador de lenguaje. El entrenamiento emplea una receta progresiva que combina anclaje de texto por localizacion (Q-Mask), preentrenamiento continuado centrado en OCR y aprendizaje por refuerzo con tareas mixtas (Mix-RL). Se distribuye con licencia Apache 2.0, lo que facilita su uso comercial y su integracion en pipelines de digitalizacion documental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje) basado en Qwen3.5; tag `qwen3_5` |
| Parametros totales | 873.438.784 (0,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos originales); GGUF disponibles por la comunidad (prithivMLmods, xzl01); conversion BF16 NInfer (ByronLeeee) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF en repositorios de la comunidad |

## Arquitectura y entrenamiento

Xiaomi-OCR-0 es un modelo vision-lenguaje que combina un codificador de imagenes con un decodificador de lenguaje derivado de Qwen3.5-0.8B-Base. El pipeline declarado es `image-text-to-text`, lo que permite introducir una imagen de documento junto con una instruccion en lenguaje natural y obtener texto estructurado, respuestas o campos extraidos. El tamano del repositorio es de 1,8 GB, coherente con los pesos en BF16 de un modelo de 0,8B parametros.

El entrenamiento se realizo sobre un corpus de aproximadamente 170 millones de muestras centrado en OCR, con una receta progresiva en tres fases: (1) Q-Mask text anchoring, que alinea el texto fino con su localizacion espacial en la imagen; (2) preentrenamiento continuado centrado en OCR (CPT) para construir capacidad multitarea amplia; y (3) aprendizaje por refuerzo con tareas mixtas (Mix-RL), que emplea recompensas verificables sobre ejemplos dificiles. El motor de datos combina consenso entre expertos heterogeneos, verificacion guiada por renderizado, mineria de muestras multifactor y sintesis dirigida. La model card no detalla el numero exacto de tokens de entrenamiento ni la composicion completa del dataset, y tampoco especifica si se aplicaron fases de RLHF o DPO adicionales.

## Capacidades

- Parseo de documentos: extraccion de texto con estructura, tablas y formulas matematicas a partir de imagenes de documentos.
- Reconocimiento robusto en condiciones adversas: documentos escaneados, deformados por perspectiva, fotografiados, inclinados o recapturados.
- Reconocimiento de formulas matematicas (evaluado en UniMER-Test) y de tablas (evaluado en PubTabNet).
- VQA orientada a OCR: respuesta a preguntas sobre el contenido de documentos e imagenes con texto.
- Extraccion de informacion clave (KIE): extraccion estructurada de campos a partir de documentos.
- Reconocimiento de escritura historica y caligrafia (evaluado en Chronicles-OCR Mature Scripts con escrituras clerical, cursiva, corrida y regular).
- Conversacional: el tag `conversational` sugiere soporte de interaccion multi-turno, aunque la model card no detalla el alcance.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Digitalizacion masiva de facturas y albaranes: el modelo puede recibir la imagen de un documento comercial y devolver los campos estructurados (importes, fechas, emisores) mediante KIE, lo que permite alimentar sistemas de contabilidad sin reglas de extraccion manuales.
- Parseo de articulos cientificos y documentacion tecnica: con capacidad demostrada en formulas (UniMER-Test, 97,84) y tablas (PubTabNet, 92,27), es adecuado para convertir PDFs escaneados en Markdown o LaTeX estructurado para repositorios de conocimiento.
- Procesamiento de documentos fotografiados con el movil: su rendimiento en Wild-OmniDocBench (87,94) y Real5-OmniDocBench (95,24) indica robustez ante perspectiva, inclinacion y recaptura, util en aplicaciones de captura movil de documentos de identidad o justificantes.
- Atencion al cliente sobre documentos adjuntos: un asistente puede responder preguntas sobre el contenido de una factura o contrato enviado como imagen gracias a las capacidades de VQA orientada a OCR (DocVQA 93,1, InfoVQA 75,1).
- Analisis de graficos e infografias: con ChartQA de 84,6, puede extraer valores y tendencias de graficos de barras o lineas en informes, integrable en herramientas de business intelligence.
- Archivo historico y patrimonio documental: el reconocimiento de escritura historica y caligrafia (73 en Chronicles-OCR Mature Scripts) lo hace util para proyectos de transcripcion de manuscritos y documentos antiguos.
- Despliegue en dispositivos con recursos limitados: al tener 0,8B parametros y existir versiones GGUF y BF16 para Ollama, puede ejecutarse en entornos de borde o en estaciones de trabajo sin GPU de datacenter para tareas de OCR en lote.

## Benchmarks y rendimiento

Parseo de documentos (puntuacion global, mayor es mejor):

| Modelo | Tamano | OmniDocBench v1.6 | Real5 | Wild |
|:--|--:|--:|--:|--:|
| Xiaomi-OCR-0 | 0,8B | 96,83 | 95,24 | 87,94 |
| TeleOCR | 1,2B | 96,87 | — | 88,53 |
| OvisOCR2 | 0,8B | 96,58 | 92,29 | 87,91 |
| PaddleOCR-VL-1.6 | 0,9B | 96,33 | 93,19 | 87,36 |
| MinerU2.5-Pro | 1,2B | 95,75 | 88,94 | 87,33 |
| GLM-OCR | 0,9B | 95,22 | 90,32 | 85,08 |

VQA orientada a OCR (escala 0-100):

| Modelo | Tamano | DocVQA | InfoVQA | ChartQA | OCRBench | TextVQA | Media |
|:--|--:|--:|--:|--:|--:|--:|--:|
| Xiaomi-OCR-0 | 0,8B | 93,1 | 75,1 | 84,6 | 84,6 | 78,6 | 83,2 |
| Qwen3.5-0.8B | 0,8B | 88,5 | 60,3 | 69,5 | 77,9 | 68,3 | 72,9 |
| Qwen3.5-2B | 2B | 92,4 | 72,4 | 77,0 | 85,9 | 76,9 | 80,9 |
| Qwen3.5-4B | 4B | 94,4 | 80,4 | 82,4 | 86,6 | 80,8 | 84,9 |
| MiniCPM-V-4.5 | 8B | 84,9 | 69,6 | 87,4 | 89,0 | 82,2 | 82,6 |

Resultados adicionales citados en la model card: UniMER-Test (reconocimiento de formulas) 97,84; PubTabNet (reconocimiento de tablas) 92,27; Chronicles-OCR Mature Scripts 73 (frente a 72 de Seed 2.0 Pro).

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan aproximadamente 1,75 GB (873M parametros x 2 bytes), por lo que la inferencia en BF16 requiere en torno a 2-3 GB de VRAM incluyendo activaciones y memoria del codificador visual. Las versiones GGUF cuantizadas reducen aun mas el requisito.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060 de 12 GB o superior permite ejecutar holgadamente el modelo en BF16. Para despliegues en servidor, A100 o H100 no son necesarias por capacidad, pero pueden emplearse para alto throughput con batching.
- Cabe en GPU consumer: si, incluidas GPUs de gama media con 6-8 GB de VRAM. Tambien es viable en CPU con llama.cpp u Ollama usando GGUF.
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI (compatibles con la arquitectura Qwen3.5, aunque no confirmados en la model card), llama.cpp y Ollama (existe una version BF16 experimental en Ollama bajo `longwayxu/xiaomi-ocr-0:bf16`), y repositorios GGUF de la comunidad.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | OmniDocBench v1.6 | Media VQA OCR | Licencia | Disponibilidad |
|:--|--:|--:|--:|--:|:--|:--|
| Xiaomi-OCR-0 | 0,8B | no disponible | 96,83 | 83,2 | Apache 2.0 | HuggingFace, ModelScope, Ollama, GGUF |
| OvisOCR2 | 0,8B | no disponible | 96,58 | no disponible | no disponible | no disponible |
| PaddleOCR-VL-1.6 | 0,9B | no disponible | 96,33 | no disponible | no disponible | no disponible |
| Qwen3.5-2B | 2B | no disponible | no disponible | 80,9 | no disponible | no disponible |

Frente a OvisOCR2 y PaddleOCR-VL-1.6, de tamano practicamente identico, Xiaomi-OCR-0 obtiene la mejor puntuacion global en OmniDocBench v1.6 y en Real5-OmniDocBench, aunque queda por detras de TeleOCR (1,2B) en Wild-OmniDocBench. En VQA orientada a OCR supera a Qwen3.5-2B pese a tener menos de la mitad de parametros, y se acerca a Qwen3.5-4B (84,9 de media) con un cuarto de su tamano.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos ni evaluaciones de equidad; el corpus de entrenamiento esta centrado en OCR y puede no representar de forma equilibrada todos los idiomas o tipos de escritura.
- Riesgo de alucinacion inherente a los modelos generativos: en tareas de transcripcion puede producir texto plausible pero incorrecto en regiones de baja calidad, por lo que se recomienda verificacion en flujos criticos.
- Cobertura idiomatica no declarada: aunque el modelo se presenta en ingles y chino, no se especifican los idiomas soportados oficialmente, lo que limita su uso en produccion multilingue sin evaluacion previa.
- Longitud de contexto no disponible: no se puede planificar el procesamiento de documentos de muchas paginas sin validacion empirica.
- El modelo esta especializado en OCR y comprension documental; no debe esperarse un rendimiento de proposito general en razonamiento, codigo o matematicas fuera del ambito documental.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B-Base puede tener sus propias condiciones que conviene revisar antes de redistribuir.
- El repositorio consultado (`azammd88807/Xiaomi-OCR-0`) es un espejo con 14 descargas; el repositorio oficial referenciado en la model card es `SeerRay-Lab/Xiaomi-OCR-0`, por lo que se recomienda descargar los pesos desde el origen oficial.
- Las versiones GGUF y Ollama son contribuciones de la comunidad y no estan validadas por el autor; su calidad y fidelidad respecto a los pesos originales no estan garantizadas.

## Enlaces

- Modelo en HuggingFace (espejo): https://huggingface.co/azammd88807/Xiaomi-OCR-0
- Modelo oficial en HuggingFace: https://huggingface.co/SeerRay-Lab/Xiaomi-OCR-0
- Modelo en ModelScope: https://www.modelscope.cn/models/SeerRay-Lab/Xiaomi-OCR-0
- Repositorio GitHub: https://github.com/SeerRay-Lab/Xiaomi-OCR-0
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/SeerRay-Lab/Xiaomi-OCR-0
- Informe tecnico (arXiv): https://arxiv.org/abs/2609.36136
- Version Ollama BF16 (experimental): https://ollama.com/longwayxu/xiaomi-ocr-0:bf16
- GGUF de la comunidad (prithivMLmods): https://huggingface.co/prithivMLmods/Xiaomi-OCR-0-GGUF
- GGUF de la comunidad (xzl01): https://github.com/xzl01/Xiaomi-OCR-0-GGUF
- Conversion BF16 NInfer (ByronLeeee): https://huggingface.co/ByronLeeee/Xiaomi-OCR-0-Ninfer
