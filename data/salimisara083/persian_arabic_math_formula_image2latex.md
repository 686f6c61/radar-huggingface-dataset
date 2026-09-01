# salimisara083/persian_arabic_math_formula_image2latex

## Resumen

El modelo `salimisara083/persian_arabic_math_formula_image2latex` es una extensión del sistema im2latex original de Gurgurov, que convierte imágenes de fórmulas matemáticas en código LaTeX. Se trata de un modelo de visión-lenguaje (ViLM) con arquitectura swin-gpt2, fine-tuneado en dos fases: primero sobre fórmulas manuscritas con numerales ingleses (stage1) y posteriormente sobre fórmulas manuscritas con numerales persas y árabes (stage2). El desarrollo aborda la escasez de herramientas OCR matemáticas para escritura persa y árabe, un nicho poco cubierto por los sistemas comerciales.

La relevancia actual radica en que la mayoría de los convertidores imagen-a-LaTeX están optimizados para numerales occidentales, dejando de lado sistemas de escritura con dígrafos y numerales diferentes. Este modelo, aunque pequeño y con limitaciones documentadas, ofrece una alternativa de código abierto (licencia MIT) para integrar reconocimiento de fórmulas en persa y árabe en flujos educativos o de investigación. El repositorio contiene dos subcarpetas (`stage1` y `stage2`) con los pesos LoRA correspondientes a cada fase de fine-tuning.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VisionEncoderDecoderModel (swin-gpt2) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (usa LoRA para fine-tuning) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | Inglés (numerales), persa y árabe (numerales) |
| Licencia | MIT (según model card; en metadatos HF: no disponible) |
| Formato de pesos | safetensors (subcarpetas stage1 y stage2) |

## Arquitectura y entrenamiento

El modelo base es `DGurgurov/im2latex`, un VisionEncoderDecoderModel que combina un encoder Swin Transformer (base, patch4, window7, 224px) con un decoder GPT-2. El proceso de entrenamiento se divide en dos etapas:

- **Stage1**: reproducción del fine-tuning sobre fórmulas manuscritas con numerales ingleses, partiendo del modelo base ya entrenado en fórmulas impresas. Esta fase utiliza LoRA para adaptar el decoder.
- **Stage2**: fine-tuning adicional del modelo resultante de stage1 sobre un dataset de Kaggle (`arabicmath2latex-hme-dataset`) que contiene fórmulas manuscritas con numerales persas y árabes. También se aplica LoRA.

No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se usaron técnicas de RLHF o DPO. El modelo requiere una versión antigua de transformers (4.32.0) y Python 3.10, lo que limita su integración en entornos modernos sin adaptación.

## Capacidades

- Generación de código LaTeX a partir de imágenes de fórmulas matemáticas manuscritas o impresas.
- Reconocimiento de numerales persas y árabes (٠١٢٣٤٥٦٧٨٩) además de los ingleses.
- Soporte para imágenes de fórmulas con notación matemática estándar (fracciones, raíces, exponentes, etc.).
- Fine-tuning con LoRA, lo que permite adaptar el modelo a dominios específicos con pocos recursos.
- Integración con la librería `transformers` mediante `VisionEncoderDecoderModel` y `PeftModel`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio o vídeo.

## Casos de uso

- **Digitalización de apuntes y exámenes en persa o árabe**: estudiantes y docentes pueden fotografiar fórmulas manuscritas y obtener su representación LaTeX para incluirlas en documentos digitales, evitando la transcripción manual.
- **Accesibilidad para personas con discapacidad visual**: convertir fórmulas matemáticas impresas o manuscritas en texto LaTeX que puede ser leído por lectores de pantalla o convertido a braille matemático.
- **Integración en plataformas educativas**: un sistema de gestión de aprendizaje (LMS) puede usar el modelo para permitir a los estudiantes subir imágenes de problemas y recibir el código LaTeX para resolverlos en herramientas como Overleaf o Jupyter.
- **Investigación en OCR matemático multilingüe**: el modelo sirve como punto de partida para experimentos con fine-tuning en otros sistemas de escritura (urdu, farsi, etc.) gracias a su arquitectura modular y licencia MIT.
- **Automatización de publicación académica**: revistas o repositorios que reciben manuscritos con fórmulas en persa/árabe pueden preprocesar las imágenes y convertirlas a LaTeX para su composición tipográfica.
- **Herramientas de transcripción para bibliotecas digitales**: digitalizar colecciones de documentos científicos históricos escritos en persa o árabe, donde las fórmulas son frecuentes, para hacerlos buscables y editables.

## Benchmarks y rendimiento

El autor proporciona métricas de test para cada etapa:

| Etapa | Test Loss | Test BLEU |
|---|---|---|
| Stage1 | 0.00876 | 0.6321 |
| Stage2 | 0.33248 | 0.6329 |

No se han publicado comparaciones con otros modelos (p. ej., Pix2Text, Mathpix, o el im2latex original) en la información disponible. El BLEU de ~0.63 indica una calidad moderada de generación de LaTeX, pero sin referencia a un corpus de evaluación estándar no es posible valorar su rendimiento relativo.

## Requisitos de hardware

- **VRAM estimada**: no disponible. Dado que el modelo base es swin-base + gpt2 (aprox. 200M parámetros en total), se estima que puede ejecutarse en GPUs con 4-6 GB de VRAM en FP16, pero no hay confirmación oficial.
- **GPU recomendadas**: cualquier GPU con soporte CUDA y al menos 4 GB de VRAM (p. ej., GTX 1660, RTX 2060, RTX 3050). Para producción, una RTX 3060 o superior sería adecuada.
- **Compatibilidad con consumer GPU**: sí, cabe en GPUs de gama media y baja gracias al tamaño reducido del modelo.
- **Opciones de despliegue**: el modelo se usa con `transformers` y `peft`; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI. Dado que es un modelo de visión-lenguaje, el despliegue típico sería mediante una API FastAPI o un script Python.
- **Latencia y throughput**: no disponibles. Se espera una inferencia relativamente rápida (del orden de cientos de milisegundos por imagen en una GPU moderna), pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Soporte persa/árabe |
|---|---|---|---|---|---|
| `salimisara083/persian_arabic_math_formula_image2latex` | swin-gpt2 | ~200M (estimado) | no disponible | MIT | Sí (numerales) |
| `DGurgurov/im2latex` | swin-gpt2 | ~200M (estimado) | no disponible | MIT | No (solo inglés) |
| `Pix2Text` (breezedeus) | híbrido (layout + OCR + math) | varios modelos pequeños | no disponible | Apache 2.0 | Sí (80+ idiomas, incluye persa/árabe) |

El modelo se posiciona como una extensión especializada del im2latex original, con la ventaja de soportar numerales persas/árabes. Pix2Text es una alternativa más completa en cuanto a idiomas y funciones (reconoce layouts, tablas y texto), pero no está específicamente optimizado para fórmulas manuscritas con numerales persas.

## Limitaciones y advertencias

- **Dependencia de versiones antiguas**: requiere `transformers` 4.32.0 y Python 3.10, lo que puede causar conflictos con entornos modernos y dificultar su integración en pipelines actuales.
- **Calidad de generación**: el BLEU de ~0.63 en stage2 sugiere que la generación de LaTeX puede contener errores, especialmente en fórmulas complejas o con notación poco común.
- **Alcance limitado**: solo se ha entrenado para fórmulas manuscritas con numerales persas/árabes; no cubre otros idiomas ni estilos de escritura (p. ej., fórmulas impresas en persa).
- **Sesgos potenciales**: al ser un fine-tuning sobre un dataset específico de Kaggle, puede tener sesgos hacia los estilos de escritura presentes en ese dataset (manuscritos de ciertos autores, tipos de tinta, etc.).
- **Riesgo de alucinación**: como todo modelo generativo, puede producir LaTeX sintácticamente válido pero matemáticamente incorrecto, especialmente en fórmulas ambiguas.
- **Licencia**: aunque el model card indica MIT, los metadatos de HuggingFace no la confirman; se recomienda verificar antes de uso comercial.
- **Sin soporte de cuantización**: no se proporcionan versiones GGUF o cuantizadas, lo que limita su despliegue en CPU o dispositivos edge.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/salimisara083/persian_arabic_math_formula_image2latex
- Modelo base im2latex: https://huggingface.co/DGurgurov/im2latex
- Repositorio de entrenamiento: https://github.com/salimisara083/im2latex-reproduction-extension
- Dataset de fórmulas árabes/persas: https://www.kaggle.com/datasets/shgyg99/arabicmath2latex-hme-dataset
- Repositorio del modelo base: https://github.com/d-gurgurov/im2latex
- Herramienta alternativa Pix2Text: https://github.com/breezedeus/Pix2Text
