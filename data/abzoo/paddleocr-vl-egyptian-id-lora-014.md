# abzoo/paddleocr-vl-egyptian-id-lora-014

## Resumen

El modelo `abzoo/paddleocr-vl-egyptian-id-lora-014` es un adaptador LoRA (Low-Rank Adaptation) fine-tuneado sobre el modelo base `unsloth/PaddleOCR-VL`, un vision-language model (VLM) especializado en parsing de documentos desarrollado por PaddlePaddle. El adaptador ha sido entrenado específicamente para la extracción de información estructurada de tarjetas de identidad nacionales egipcias, un caso de uso crítico en procesos de verificación de identidad (IDV) y cumplimiento KYC. El autor, `abzoo`, ha utilizado la librería Unsloth para acelerar el entrenamiento, logrando una velocidad 2x superior a los métodos convencionales.

El modelo base PaddleOCR-VL integra un codificador visual de resolución dinámica estilo NaViT con el modelo de lenguaje ERNIE-4.5-0.3B, alcanzando un tamaño compacto de 0.9B parámetros. Este adaptador LoRA, con un tamaño de repositorio de 0.2 GB, añade una capa de especialización sin necesidad de reentrenar el modelo completo, lo que lo hace ligero y fácil de desplegar. Aunque el modelo está etiquetado como `en` (inglés), su propósito real es procesar documentos que contienen texto en árabe y posiblemente campos bilingües, lo que sugiere una capacidad multilingüe implícita.

La relevancia de este modelo radica en su enfoque práctico: en lugar de un OCR genérico, ofrece una solución especializada para un tipo de documento concreto, lo que puede mejorar significativamente la precisión en la extracción de campos como número de identificación, nombre, fecha de nacimiento y dirección. Al ser un adaptador LoRA, se puede combinar con el modelo base y desplegarse en infraestructuras estándar de inferencia, como Text Generation Inference (TGI) o vLLM, con un coste computacional reducido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language Model (VLM) con codificador visual NaViT y LLM ERNIE-4.5-0.3B (modelo base); adaptador LoRA sobre el mismo |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 0.9B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (el modelo base procesa imágenes de resolución dinámica; no se especifica contexto textual) |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos en safetensors, sin cuantización declarada) |
| Idiomas soportados | Inglés (etiqueta declarada); el caso de uso sugiere árabe/egipcio para documentos de identidad |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `PaddleOCR-VL` es un VLM diseñado para el parsing de documentos, con un componente principal de 0.9B parámetros. Su arquitectura combina un codificador visual de resolución dinámica (estilo NaViT) que adapta la resolución de la imagen de entrada según su contenido, con el modelo de lenguaje ERNIE-4.5-0.3B, lo que permite un reconocimiento preciso de elementos como texto, tablas, figuras y fórmulas. El adaptador LoRA se ha entrenado sobre este modelo base utilizando la librería Unsloth, que optimiza el proceso de fine-tuning mediante kernels eficientes y gestión de memoria, logrando una velocidad de entrenamiento 2x superior. No se han publicado detalles sobre el dataset de entrenamiento específico para el ID egipcio, ni sobre el uso de técnicas como RLHF o DPO; se asume un fine-tuning supervisado estándar sobre un conjunto de imágenes de tarjetas de identidad egipcias anotadas.

## Capacidades

- OCR de documentos de identidad: extrae campos estructurados de tarjetas de identidad nacionales egipcias, como número de ID, nombre, fecha de nacimiento, dirección y fotografía.
- Parsing de documentos: hereda las capacidades del modelo base PaddleOCR-VL para reconocer y estructurar elementos en imágenes de documentos.
- Reconocimiento de texto en imágenes: procesa imágenes de alta resolución con texto en árabe e inglés, gracias al codificador visual dinámico.
- Fine-tuning específico: el adaptador LoRA está optimizado para el dominio de ID egipcios, mejorando la precisión frente a modelos OCR genéricos.
- Compatibilidad con pipelines de inferencia: al ser un adaptador LoRA, se puede cargar sobre el modelo base y usar con herramientas como Text Generation Inference, vLLM o transformers.
- No se ha confirmado soporte para tool calling, agentes o razonamiento multi-paso; el modelo está orientado a tareas de visión-lenguaje.

## Casos de uso

- Verificación de identidad (IDV) en onboarding digital: el modelo extrae automáticamente los campos de una tarjeta de identidad egipcia escaneada o fotografiada, permitiendo validar la identidad del usuario en procesos de alta en servicios financieros, telecomunicaciones o administración pública.
- Automatización de procesos KYC (Know Your Customer): integrado en un pipeline de cumplimiento normativo, el modelo reduce el tiempo de revisión manual de documentos, extrayendo datos estructurados que se comparan con bases de datos oficiales.
- Extracción de datos para bases de datos gubernamentales: digitalización de registros de identidad en lote, convirtiendo imágenes de ID en registros estructurados para sistemas de gestión de población.
- Control de acceso y seguridad: en entornos físicos o digitales, el modelo puede verificar la autenticidad de un ID egipcio extrayendo y comparando los campos con los datos del titular.
- Aplicaciones de préstamos y servicios financieros: durante la solicitud de crédito, el modelo extrae la información del ID para pre-rellenar formularios y acelerar la evaluación de riesgo.
- Investigación y desarrollo en OCR especializado: como punto de partida para fine-tunes adicionales en otros tipos de documentos de identidad de la región MENA, gracias a su licencia Apache-2.0 y su formato de adaptador ligero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas de precisión, recall o F1 para la extracción de campos en ID egipcios, ni comparaciones con otros modelos. Se recomienda evaluar el modelo en un conjunto de validación propio antes de su uso en producción.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA, la VRAM necesaria depende del modelo base. PaddleOCR-VL con 0.9B parámetros en precisión FP16 requiere aproximadamente 2-3 GB de VRAM para inferencia; con cuantización INT8 podría reducirse a ~1.5 GB. El adaptador añade un overhead mínimo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 4060, o GPUs de datacenter como T4, L4 o A10. Para despliegues de alto rendimiento, A100 o H100 son adecuadas.
- Compatibilidad con GPUs de consumo: sí, cabe en GPUs de gama media y baja, lo que permite ejecución local en estaciones de trabajo o edge devices.
- Opciones de despliegue: se puede servir con Text Generation Inference (TGI), vLLM, o mediante la librería transformers con carga del adaptador LoRA. También es compatible con Ollama si se convierte a formato GGUF, aunque no se ha confirmado.
- Latencia y throughput: no se han publicado datos específicos. Para un modelo de 0.9B, se espera una latencia de decenas de milisegundos por imagen en GPUs modernas, con throughput de decenas de imágenes por segundo en batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| abzoo/paddleocr-vl-egyptian-id-lora-014 | Adaptador LoRA (base 0.9B) | No disponible | OCR especializado en ID egipcio | Apache-2.0 | HuggingFace |
| PaddleOCR-VL (base) | 0.9B | No disponible | Parsing de documentos genérico | Apache-2.0 | HuggingFace |
| TrOCR (base) | ~300M | 512 tokens | Reconocimiento de texto impreso/manuscrito | MIT | HuggingFace |
| Donut | ~200M | 512 tokens | Parsing de documentos visuales | MIT | HuggingFace |

La comparativa se centra en el modelo base PaddleOCR-VL y en alternativas de OCR de documentos. El adaptador LoRA ofrece una ventaja en precisión para el dominio específico de ID egipcios, mientras que TrOCR y Donut son modelos más ligeros pero sin especialización en este tipo de documento. No se dispone de datos de rendimiento cuantitativos para una comparación objetiva.

## Limitaciones y advertencias

- Especialización limitada: el modelo está fine-tuneado exclusivamente para tarjetas de identidad egipcias; su rendimiento en otros tipos de documentos o variaciones regionales puede ser deficiente.
- Sesgos potenciales: no se ha documentado el dataset de entrenamiento, por lo que podrían existir sesgos en cuanto a calidad de imagen, iluminación, o variaciones en el diseño de la tarjeta.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar campos incorrectos o inventados si la imagen es de baja calidad o ambigua. Se recomienda validación humana en aplicaciones críticas.
- Idioma: aunque el caso de uso implica árabe, la etiqueta oficial es `en`; no se garantiza un soporte multilingüe robusto fuera del contexto de ID egipcio.
- Sin benchmarks publicados: no hay evidencia objetiva de su precisión; es necesario evaluar el modelo con datos propios antes de producción.
- Dependencia del modelo base: el adaptador requiere cargar PaddleOCR-VL, lo que implica descargar el modelo base (~0.9B) además del adaptador.
- Licencia Apache-2.0: permite uso comercial, pero se debe mantener la atribución y no se ofrece garantía.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abzoo/paddleocr-vl-egyptian-id-lora-014
- Modelo base PaddleOCR-VL: https://huggingface.co/PaddlePaddle/PaddleOCR-VL
- Documentación de PaddleOCR-VL en Transformers: https://huggingface.co/docs/transformers/model_doc/paddleocr_vl
- Repositorio de OCR de ID egipcio (referencia): https://github.com/midonashaat19/Egyptian_National_ID_OCR
- Repositorio alternativo de OCR de ID egipcio: https://github.com/midonashaat19/Egyptian_National_ID_OCR_FULL_90
- Documentación oficial de PaddleOCR: http://www.paddleocr.ai/main/en/index.html
