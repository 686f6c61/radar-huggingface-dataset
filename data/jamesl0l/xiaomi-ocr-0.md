# Jamesl0l/Xiaomi-OCR-0

## Resumen

Xiaomi-OCR-0 es un modelo visión-lenguaje especializado en OCR y parsing de documentos, desarrollado por SeerRay-Lab (con financiación y marca de Xiaomi). Se construye mediante fine-tuning del modelo base Qwen3.5-0.8B-Base y se distribuye en Hugging Face bajo licencia Apache 2.0. Su propuesta central es unificar en un único modelo compacto de 0,8B de parámetros tareas que habitualmente requieren modelos mucho mayores: transcripción de documentos, reconocimiento de fórmulas y tablas, respuesta a preguntas sobre imágenes con contenido textual y extracción de información estructurada.

La relevancia del modelo radica en su eficiencia paramétrica: según la model card, alcanza 96,83 en OmniDocBench v1.6, 95,24 en Real5-OmniDocBench y 87,94 en Wild-OmniDocBench, resultados que lo sitúan en el primer y segundo puesto de esas tablas comparativas frente a modelos de 0,9B a 1,2B parámetros. Además, promedia 83,2 en cinco benchmarks de VQA orientados a OCR, por encima de Qwen3.5-2B (80,9) con una cuarta parte de los parámetros.

El modelo se entrenó sobre un corpus de aproximadamente 170 millones de muestras centrado en OCR, con una receta progresiva que combina anclaje de texto por localización (Q-Mask), preentrenamiento continuado multitarea y aprendizaje por refuerzo con recompensas verificables. Está pensado para despliegues donde el coste de inferencia y la huella de memoria son críticos, como procesamiento masivo de documentos o entornos con GPUs de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer visión-lenguaje (base Qwen3.5-0.8B-Base), pipeline image-text-to-text |
| Parametros totales | 873.438.784 (≈0,87B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (referencia); GGUF disponibles por la comunidad (prithivMLmods, xzl01); conversión NInfer BF16 por ByronLeeee |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF (comunidad) |

## Arquitectura y entrenamiento

Xiaomi-OCR-0 parte de Qwen3.5-0.8B-Base, un transformer multimodal de tipo visión-lenguaje que procesa pares imagen-texto. Sobre esa base, el equipo aplica un entrenamiento progresivo en tres fases sobre un corpus de aproximadamente 170 millones de muestras centrado en OCR. La primera fase, denominada Q-Mask text anchoring, alinea el texto fino con su localización espacial en la imagen. La segunda, preentrenamiento continuado centrado en OCR (CPT), construye capacidad multitarea amplia. La tercera, aprendizaje por refuerzo mixto (Mix-RL), emplea recompensas verificables sobre ejemplos difíciles.

El motor de datos combina consenso entre expertos heterogéneos, verificación guiada por renderizado, minería de muestras multifactorial y síntesis dirigida. Cuando la concordancia entre expertos es insuficiente, los candidatos refinados vuelven al pool de expertos para un nuevo consenso. La model card no detalla el número exacto de tokens de entrenamiento, la composición lingüística del corpus ni si se aplicaron fases de RLHF o DPO adicionales más allá del Mix-RL descrito.

## Capacidades

- Parsing de documentos: transcripción de texto, tablas y fórmulas matemáticas con estructura preservada (métricas TEDS y CDM reportadas).
- Reconocimiento robusto en documentos escaneados, deformados, fotografiados, inclinados o recapturados.
- Reconocimiento de fórmulas matemáticas (97,84 en UniMER-Test) y de tablas (92,27 en PubTabNet).
- Escritura histórica y caligrafía: 73 en Chronicles-OCR Mature Scripts (estilos clerical, cursivo, running y regular).
- VQA orientado a OCR: DocVQA, InfoVQA, ChartQA, OCRBench y TextVQA.
- Extracción de información clave (KIE) con salida estructurada de campos.
- Conversacional: el tag del repositorio incluye `conversational`, lo que sugiere soporte de diálogo multiturno.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Digitalización masiva de archivos: el modelo transcribe documentos escaneados, inclinados o fotografiados con degradación, lo que lo hace adecuado para pipelines de digitalización de fondos documentales donde la calidad de captura es heterogénea.
- Extracción de campos en facturas y formularios: mediante KIE, se pueden definir esquemas de salida (importe, fecha, NIF, conceptos) y obtener JSON estructurado directamente de la imagen, reduciendo la necesidad de reglas heurísticas por plantilla.
- Procesamiento de literatura científica: reconocimiento de fórmulas matemáticas (UniMER-Test 97,84) y tablas (PubTabNet 92,27) permite convertir PDFs de papers en Markdown o LaTeX estructurado para bases de conocimiento.
- Análisis de gráficos y dashboards: con 84,6 en ChartQA, el modelo puede responder preguntas sobre tendencias y valores en gráficos de barras, líneas o sectores extraídos de informes.
- Archivística y patrimonio documental: el rendimiento en escritura histórica y caligrafía (73 en Chronicles-OCR Mature Scripts) lo habilita para transcripción asistida de manuscritos en estilos clerical, cursivo y regular.
- Atención al cliente sobre documentos: un usuario puede subir una imagen de su recibo o contrato y formular preguntas en lenguaje natural (DocVQA 93,1), integrándose en flujos de soporte con contexto visual.
- Despliegue en edge o GPUs de consumo: con menos de 900M de parámetros y pesos en BF16 de aproximadamente 1,8 GB, cabe en GPUs consumer para procesamiento local de documentos sin enviar datos a la nube.

## Benchmarks y rendimiento

Parsing de documentos (puntuación global, mayor es mejor):

| Modelo | Tamaño | OmniDocBench v1.6 | Real5 | Wild |
|:--|--:|--:|--:|--:|
| Xiaomi-OCR-0 | 0,8B | 96,83 | 95,24 | 87,94 |
| TeleOCR | 1,2B | 96,87 | — | 88,53 |
| OvisOCR2 | 0,8B | 96,58 | 92,29 | 87,91 |
| PaddleOCR-VL-1.6 | 0,9B | 96,33 | 93,19 | 87,36 |
| MinerU2.5-Pro | 1,2B | 95,75 | 88,94 | 87,33 |
| GLM-OCR | 0,9B | 95,22 | 90,32 | 85,08 |

VQA orientado a OCR:

| Modelo | Tamaño | DocVQA | InfoVQA | ChartQA | OCRBench | TextVQA | Media |
|:--|--:|--:|--:|--:|--:|--:|--:|
| Xiaomi-OCR-0 | 0,8B | 93,1 | 75,1 | 84,6 | 84,6 | 78,6 | 83,2 |
| Qwen3.5-0.8B | 0,8B | 88,5 | 60,3 | 69,5 | 77,9 | 68,3 | 72,9 |
| Qwen3.5-2B | 2B | 92,4 | 72,4 | 77,0 | 85,9 | 76,9 | 80,9 |
| Qwen3.5-4B | 4B | 94,4 | 80,4 | 82,4 | 86,6 | 80,8 | 84,9 |
| MiniCPM-V-4.5 | 8B | 84,9 | 69,6 | 87,4 | 89,0 | 82,2 | 82,6 |

Otras métricas reportadas: UniMER-Test (fórmulas) 97,84; PubTabNet (tablas) 92,27; Chronicles-OCR Mature Scripts 73 (frente a 72 de Seed 2.0 Pro).

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 1,8 GB de pesos, más overhead de activaciones y del codificador visual; en la práctica, entre 3 y 5 GB según resolución de imagen y longitud de secuencia.
- Cuantización GGUF: existen conversiones comunitarias (prithivMLmods, xzl01) que permiten reducir la huella por debajo de 1 GB en cuantizaciones de 4 bits, aunque no se publican métricas de degradación.
- GPUs recomendadas: cualquier GPU con 8 GB o más (RTX 3060, RTX 4060, RTX 4090) para BF16; A100/H100 no son necesarias por el tamaño del modelo, pero aportan mayor throughput en lotes grandes.
- Cabe en GPU de consumo: sí, con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4090.
- Opciones de despliegue: transformers (librería nativa), Ollama (variante BF16 experimental publicada por longwayxu), llama.cpp vía GGUF, conversión NInfer BF16. vLLM y TGI no están confirmados en la información proporcionada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | OmniDocBench v1.6 | VQA media | Licencia | Disponibilidad |
|:--|--:|--:|--:|--:|:--|:--|
| Xiaomi-OCR-0 | 0,8B | no disponible | 96,83 | 83,2 | Apache 2.0 | HF, Ollama, GGUF, ModelScope |
| PaddleOCR-VL-1.6 | 0,9B | no disponible | 96,33 | no disponible | no disponible | no disponible |
| OvisOCR2 | 0,8B | no disponible | 96,58 | no disponible | no disponible | no disponible |
| Qwen3.5-2B | 2B | no disponible | no disponible | 80,9 | no disponible | no disponible |

Frente a TeleOCR (1,2B), Xiaomi-OCR-0 queda ligeramente por debajo en OmniDocBench (96,83 frente a 96,87) y Wild (87,94 frente a 88,53), pero supera en Real5 (95,24 frente a dato no reportado). Frente a OvisOCR2 (0,8B), la ventaja es de 0,25 puntos en OmniDocBench y 2,95 en Real5. En VQA, supera a Qwen3.5-2B pese a tener menos de la mitad de parámetros, aunque queda por debajo de Qwen3.5-4B (84,9 de media).

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al entrenarse sobre un corpus OCR-centrado, el comportamiento fuera de ese dominio no está caracterizado.
- Riesgo de alucinación: no cuantificado en la model card; en tareas de transcripción, el riesgo principal es la inserción de texto no presente en la imagen, especialmente en documentos degradados.
- Idiomas soportados: no se especifican; el corpus se describe como OCR-centrado sin desglose lingüístico, por lo que el rendimiento multilingüe no está garantizado.
- Longitud de contexto: no disponible; esto limita la planificación para documentos de muchas páginas o conversaciones largas.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-0.8B-Base y de los pesos derivados publicados por terceros (GGUF, NInfer).
- Estado del repositorio: el ID `Jamesl0l/Xiaomi-OCR-0` presenta 0 descargas y 0 likes en el momento de la consulta, y el repositorio oficial referenciado en la model card es `SeerRay-Lab/Xiaomi-OCR-0`; conviene usar la fuente oficial para pesos y actualizaciones.
- Madurez: el modelo se publicó en septiembre de 2026 y la variante Ollama está marcada como experimental; las conversiones GGUF son comunitarias y no han pasado por una validación formal del equipo autor.

## Enlaces

- Hugging Face (repositorio consultado): https://huggingface.co/Jamesl0l/Xiaomi-OCR-0
- Hugging Face (repositorio oficial): https://huggingface.co/SeerRay-Lab/Xiaomi-OCR-0
- Model card en chino: https://huggingface.co/SeerRay-Lab/Xiaomi-OCR-0/blob/main/README_zh.md
- Project page (Space): https://huggingface.co/spaces/SeerRay-Lab/Xiaomi-OCR-0
- GitHub: https://github.com/SeerRay-Lab/Xiaomi-OCR-0
- arXiv (informe técnico): https://arxiv.org/abs/2609.36136
- Ollama (BF16 experimental): https://ollama.com/longwayxu/xiaomi-ocr-0:bf16
- ModelScope: https://www.modelscope.cn/models/SeerRay-Lab/Xiaomi-OCR-0
- GGUF comunitario (prithivMLmods): https://huggingface.co/prithivMLmods/Xiaomi-OCR-0-GGUF
- GGUF comunitario (xzl01): https://github.com/xzl01/Xiaomi-OCR-0-GGUF
- Conversión NInfer BF16 (ByronLeeee): https://huggingface.co/ByronLeeee/Xiaomi-OCR-0-Ninfer
