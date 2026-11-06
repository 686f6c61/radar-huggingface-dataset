# dolphinnlp/qwen3.5-ocr-ft

## Resumen

dolphinnlp/qwen3.5-ocr-ft es un ajuste fino (fine-tuning) del modelo xiaomi-research/Xiaomi-OCR-0, publicado por el usuario dolphinnlp en Hugging Face. Se trata de un modelo de tipo image-text-to-text, es decir, orientado a tareas de vision-lenguaje como el reconocimiento optico de caracteres (OCR) o la transcripcion de contenido en imagenes a texto. El modelo conserva la licencia Apache 2.0 del modelo base y esta etiquetado con la arquitectura qwen3_5 en la libreria transformers.

El modelo cuenta con 873.438.784 parametros (aproximadamente 873 millones) segun los pesos en safetensors, y el repositorio ocupa 1,8 GB. El ajuste se realizo utilizando Unsloth junto con la libreria TRL de Hugging Face, segun indica la model card del autor, lo que sugiere un entrenamiento optimizado en memoria y velocidad para GPUs de consumo.

La relevancia de este modelo es limitada y debe interpretarse con cautela: se publico el 4 de noviembre de 2026 sin descargas ni likes registrados en el momento de la consulta, y la model card es minima (solo indica el modelo base, la licencia y la herramienta de entrenamiento). No hay informacion sobre el dataset de ajuste, los objetivos concretos de la tarea ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer multimodal image-text-to-text) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura indicada es qwen3_5, un transformer multimodal que procesa entrada de imagen y texto y genera texto (pipeline image-text-to-text). El modelo es un ajuste fino de xiaomi-research/Xiaomi-OCR-0, por lo que hereda la arquitectura y los pesos del modelo base, adaptados mediante entrenamiento adicional.

Segun la model card, el ajuste fino se realizo con Unsloth y la libreria TRL de Hugging Face, lo que indica el uso de tecnicas de entrenamiento eficiente en memoria (tipicamente LoRA o QLoRA, aunque el metodo exacto no se especifica). No se proporciona informacion sobre el numero de tokens de entrenamiento, la composicion del dataset de ajuste, si hubo etapas de RLHF/DPO ni innovaciones tecnicas adicionales.

## Capacidades

- Generacion de texto condicionada por imagen (image-text-to-text).
- Reconocimiento optico de caracteres (OCR) y transcripcion de contenido en imagenes, heredado del modelo base Xiaomi-OCR-0.
- Generacion de texto conversacional, segun la etiqueta "conversational" del repositorio.
- Compatibilidad con text-generation-inference y endpoints, segun las etiquetas del repositorio.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-step: no disponible.
- Capacidades multilingues: solo se declara ingles ("en").
- Capacidades especiales (thinking mode, audio, etc.): no disponible.

## Casos de uso

- Digitalizacion de documentos escaneados: el modelo puede recibir una imagen de un documento y generar el texto transcrito, aprovechando su herencia de Xiaomi-OCR-0 para tareas de OCR.
- Extraccion de texto en facturas y formularios: util para pipelines de captura de datos donde se necesita convertir imagenes de documentos administrativos en texto estructurado.
- Procesamiento de capturas de pantalla: transcripcion de texto contenido en imagenes de interfaz de usuario para indexacion o busqueda.
- Pipeline de accesibilidad: generacion de descripciones textuales de contenido presente en imagenes para lectores de pantalla, aunque la calidad en esta tarea no esta documentada.
- Prototipado rapido en entornos de investigacion: al ser un modelo de ~873 M de parametros y 1,8 GB, es adecuado para experimentar con vision-lenguaje en GPUs de consumo sin infraestructura pesada.
- Integracion en flujos de preprocesado de datos: uso como componente de un pipeline mayor que necesita convertir imagenes a texto antes de un analisis posterior (por ejemplo, RAG sobre documentos escaneados).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en safetensors (fp16/bf16) el modelo ocupa aproximadamente 1,8 GB, por lo que requiere del orden de 3-4 GB de VRAM incluyendo el procesador de imagen y el contexto. En cuantizacion de 8 bits o 4 bits (si se genera via llama.cpp o similar, no confirmado para esta arquitectura) el requisito seria notablemente menor.
- GPU recomendadas: cualquier GPU moderna con al menos 6-8 GB de VRAM para ejecucion comoda; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son opciones validas.
- Cabe en GPU de consumo: si, practicamente cualquier GPU de consumo reciente con 6 GB o mas de VRAM.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (segun etiquetas), endpoints compatibles. No se confirma soporte de llama.cpp, Ollama o vLLM en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| dolphinnlp/qwen3.5-ocr-ft | 873 M | no disponible | apache-2.0 | Hugging Face (transformers) |
| xiaomi-research/Xiaomi-OCR-0 (modelo base) | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas de OCR multimodal de la familia Qwen-VL | no disponible en la informacion | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Model card practicamente vacia: no se documenta el dataset de ajuste, los objetivos, la metodologia de evaluacion ni los resultados, lo que impide validar la calidad del ajuste.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion externa.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- Riesgo de alucinacion: al ser un modelo generativo de ~873 M de parametros, puede generar texto incorrecto o inventar contenido no presente en la imagen, especialmente en documentos con baja resolucion o tipografias complejas.
- Sesgos conocidos: no documentados; al no haber informacion sobre el dataset de entrenamiento, no es posible evaluar sesgos de dominio, idioma o demographicos.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte; verificar las condiciones del modelo base Xiaomi-OCR-0 antes de uso en produccion.
- Restricciones de produccion: al no haber benchmarks ni documentacion de robustez, no se recomienda su uso en produccion sin una evaluacion previa sobre el dominio objetivo.
- Contexto y cuantizacion: no se especifica la longitud de contexto soportada ni los formatos de cuantizacion probados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dolphinnlp/qwen3.5-ocr-ft
- Modelo base: https://huggingface.co/xiaomi-research/Xiaomi-OCR-0
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- Hugging Face TRL: https://github.com/huggingface/trl
