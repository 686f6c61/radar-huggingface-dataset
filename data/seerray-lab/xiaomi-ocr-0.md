# SeerRay-Lab/Xiaomi-OCR-0

## Resumen

Xiaomi-OCR-0 es un modelo vision-lenguaje especializado en OCR y comprensión de documentos, desarrollado por SeerRay-Lab y publicado bajo licencia Apache 2.0. Con solo 873 millones de parámetros, parte del modelo base Qwen3.5-0.8B-Base y se entrena sobre un corpus de aproximadamente 170 millones de muestras centrado en OCR. Su objetivo es unificar en un único modelo tareas que habitualmente requieren pipelines separados: parseo de documentos (texto, tablas, fórmulas), respuesta a preguntas visuales sobre documentos y extracción de información estructurada.

La relevancia del modelo reside en su eficiencia paramétrica: según los datos de la model card, supera a Qwen3.5-2B en la media de cinco benchmarks de VQA orientada a OCR (83,2 frente a 80,9) con menos de la mitad de parámetros, y compite con modelos de 0,9B a 1,2B en benchmarks de parseo de documentos como OmniDocBench v1.6 y Real5-OmniDocBench. Está pensado para despliegues donde el coste por página procesada y la latencia importan, como digitalización masiva de documentos o atención al cliente con capturas.

El modelo se distribuye en formato safetensors para transformers, con conversiones comunitarias a GGUF y BF16 para Ollama y NInfer. Incluye un informe técnico (arXiv 2609.36136) y una receta de entrenamiento progresiva que combina anclaje de texto Q-Mask, preentrenamiento continuado centrado en OCR y aprendizaje por refuerzo con tareas mixtas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje transformer (base Qwen3.5-0.8B-Base) |
| Parámetros totales | 873.438.784 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16 (oficial); GGUF (conversiones comunitarias de prithivMLmods y xzl01) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers); GGUF; conversión NInfer BF16 |

## Arquitectura y entrenamiento

Xiaomi-OCR-0 es un modelo vision-lenguaje construido sobre Qwen3.5-0.8B-Base, al que se añade capacidad de entrada de imagen para tareas image-text-to-text. El entrenamiento se realizó sobre un corpus de aproximadamente 170 millones de muestras centrado en OCR, mediante una receta progresiva en tres fases. La primera, Q-Mask text anchoring, alinea texto de grano fino con su ubicación espacial en la imagen. La segunda, preentrenamiento continuado centrado en OCR (CPT), construye capacidad multitarea amplia. La tercera, aprendizaje por refuerzo con tareas mixtas (Mix-RL), aplica recompensas verificables sobre ejemplos difíciles.

El motor de datos combina consenso entre expertos heterogéneos, verificación guiada por renderizado, minería de muestras multifactor y síntesis dirigida. Las regiones de documento se anotan por expertos, se puntúan mediante consenso de tripletas y se refinan con verificación guiada por renderizado cuando la concordancia es insuficiente; los candidatos refinados vuelven al pool de expertos para un nuevo consenso. La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset más allá de describirlo como corpus OCR-céntrico.

## Capacidades

- Parseo de documentos: extracción de texto, tablas y fórmulas matemáticas a partir de imágenes de documentos.
- Robustez ante documentos recapturados: funciona de forma estable con documentos escaneados, deformados, fotografiados o inclinados, según la model card.
- VQA orientada a OCR: respuesta a preguntas sobre el contenido de documentos, gráficos e infografías.
- Extracción de información clave (KIE): extracción estructurada de campos, no solo transcripción.
- Reconocimiento de escritura histórica y caligrafía, incluyendo escrituras clerical, cursiva, corriente y regular.
- Conversacional: pipeline etiquetado como conversacional e image-text-to-text.
- Compatible con endpoints (tag endpoints_compatible).
- No se documentan capacidades de tool calling, agentes, audio ni modo thinking en la información disponible.

## Casos de uso

- Digitalización masiva de archivos: procesar lotes de documentos escaneados para extraer texto, tablas y fórmulas con un modelo de 0,8B que reduce el coste por página frente a modelos de mayor tamaño, manteniendo puntuaciones de 96,83 en OmniDocBench v1.6.
- Procesamiento de documentos fotografiados: digitalizar facturas, albaranes o formularios capturados con móvil en condiciones no controladas, aprovechando la robustez reportada en Real5-OmniDocBench (95,24) y Wild-OmniDocBench (87,94).
- Extracción de campos estructurados: convertir documentos en datos tabulares (KIE) para alimentar sistemas de gestión documental, usando las capacidades de comprensión más allá de la transcripción.
- Reconocimiento de tablas en informes financieros: extraer tablas complejas con la puntuación reportada de 92,27 en PubTabNet para su posterior análisis o carga en bases de datos.
- Reconocimiento de fórmulas científicas: convertir fórmulas manuscritas o impresas a notación digital con la puntuación de 97,84 en UniMER-Test, útil en plataformas educativas o repositorios académicos.
- Archivística y patrimonio documental: transcribir manuscritos históricos y caligrafía con la puntuación de 73 en Chronicles-OCR Mature Scripts, comparable según el autor a Seed 2.0 Pro (72).
- Asistente de consulta sobre documentos: responder preguntas de usuarios sobre el contenido de contratos, manuales o gráficos mediante VQA orientada a OCR, con 93,1 en DocVQA y 84,6 en ChartQA.

## Benchmarks y rendimiento

Parseo de documentos (puntuación global, mayor es mejor):

| Modelo | Tamaño | OmniDocBench v1.6 | Real5 | Wild |
|:--|--:|--:|--:|--:|
| Xiaomi-OCR-0 | 0,8B | 96,83 | 95,24 | 87,94 |
| TeleOCR | 1,2B | 96,87 | — | 88,53 |
| OvisOCR2 | 0,8B | 96,58 | 92,29 | 87,91 |
| PaddleOCR-VL-1.6 | 0,9B | 96,33 | 93,19 | 87,36 |
| MinerU2.5-Pro | 1,2B | 95,75 | 88,94 | 87,33 |
| GLM-OCR | 0,9B | 95,22 | 90,32 | 85,08 |

VQA orientada a OCR:

| Modelo | Tamaño | DocVQA | InfoVQA | ChartQA | OCRBench | TextVQA | Media |
|:--|--:|--:|--:|--:|--:|--:|--:|
| Xiaomi-OCR-0 | 0,8B | 93,1 | 75,1 | 84,6 | 84,6 | 78,6 | 83,2 |
| Qwen3.5-0.8B | 0,8B | 88,5 | 60,3 | 69,5 | 77,9 | 68,3 | 72,9 |
| Qwen3.5-2B | 2B | 92,4 | 72,4 | 77,0 | 85,9 | 76,9 | 80,9 |
| Qwen3.5-4B | 4B | 94,4 | 80,4 | 82,4 | 86,6 | 80,8 | 84,9 |
| MiniCPM-V-4.5 | 8B | 84,9 | 69,6 | 87,4 | 89,0 | 82,2 | 82,6 |

Otros resultados citados en la model card: 97,84 en UniMER-Test (reconocimiento de fórmulas), 92,27 en PubTabNet (reconocimiento de tablas) y 73 en Chronicles-OCR Mature Scripts.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 1,8 GB en safetensors; en BF16 los pesos de 873M parámetros requieren aproximadamente 1,7 GB, más el codificador visual y las activaciones. En cuantizaciones GGUF de 4-8 bits el peso puede reducirse a menos de 1 GB.
- GPU recomendadas: cabe con holgura en GPU de consumo como RTX 3060, RTX 4060, RTX 4090; para despliegues de alto rendimiento, A100 o H100 no son necesarias por tamaño, pero pueden usarse para servir en lote.
- Cabe en GPU de consumo: sí, en cualquier GPU con 4 GB o más de VRAM en BF16 y en GPUs con 2-4 GB en cuantización GGUF.
- Opciones de despliegue: transformers (librería oficial), Ollama (BF16 experimental vía longwayxu/xiaomi-ocr-0:bf16), GGUF mediante llama.cpp (conversiones de prithivMLmods y xzl01), NInfer (conversión de ByronLeeee). No se documenta soporte explícito de vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tamaño | Contexto | OmniDocBench v1.6 | Media VQA OCR | Licencia | Disponibilidad |
|:--|--:|--:|--:|--:|:--|:--|
| Xiaomi-OCR-0 | 0,8B | No disponible | 96,83 | 83,2 | Apache 2.0 | Hugging Face, ModelScope, Ollama, GGUF |
| OvisOCR2 | 0,8B | No disponible | 96,58 | No disponible | No disponible | Hugging Face |
| PaddleOCR-VL-1.6 | 0,9B | No disponible | 96,33 | No disponible | No disponible | Hugging Face |
| TeleOCR | 1,2B | No disponible | 96,87 | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre un corpus OCR-céntrico, el rendimiento puede degradarse fuera de dominios documentales.
- Riesgo de alucinación: no se reportan tasas de alucinación; en tareas de extracción estructurada conviene validar los campos extraídos contra el documento original.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están disponibles en la información proporcionada; el corpus se describe como OCR-céntrico sin desglose por idioma.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las licencias de las conversiones comunitarias (GGUF, NInfer) y del modelo base Qwen3.5-0.8B-Base.
- Caveats para producción: el soporte en Ollama se marca como experimental; no se documenta soporte de vLLM o TGI; el rendimiento en documentos muy alejados del dominio de entrenamiento (por ejemplo, documentos manuscritos muy deteriorados) no está cuantificado más allá de Chronicles-OCR.
- Los resultados de benchmarks provienen de la model card del autor y no se han verificado de forma independiente en esta ficha.

## Enlaces

- Hugging Face: https://huggingface.co/SeerRay-Lab/Xiaomi-OCR-0
- Space del proyecto: https://huggingface.co/spaces/SeerRay-Lab/Xiaomi-OCR-0
- GitHub: https://github.com/SeerRay-Lab/Xiaomi-OCR-0
- Informe técnico (arXiv): https://arxiv.org/abs/2609.36136
- ModelScope: https://www.modelscope.cn/models/SeerRay-Lab/Xiaomi-OCR-0
- Ollama (BF16 experimental): https://ollama.com/longwayxu/xiaomi-ocr-0:bf16
- GGUF de prithivMLmods: https://huggingface.co/prithivMLmods/Xiaomi-OCR-0-GGUF
- GGUF de xzl01: https://github.com/xzl01/Xiaomi-OCR-0-GGUF
- Conversión NInfer de ByronLeeee: https://huggingface.co/ByronLeeee/Xiaomi-OCR-0-Ninfer
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
