# Lucasgitguy-co/lfm3-vl-2b-heretic

## Resumen

LFM3-VL-2B Heretic es una variante afinada del modelo vision-lenguaje LFM3-VL-2B de LiquidAI, publicada por el usuario independiente Lucasgitguy-co. El modelo base es un transformer multimodal de aproximadamente 1.918 millones de parámetros que combina un codificador visual, un proyector y un modelo de lenguaje para tareas de imagen-a-texto (image-text-to-text). Esta versión "heretic" se distribuye en formato Safetensors BF16 e incluye código de modelo personalizado (`Lfm3VlForConditionalGeneration`).

El interés de esta ficha reside en que se trata de un derivado comunitario de un modelo de LiquidAI, no de un lanzamiento oficial. El autor documenta únicamente los artefactos del repositorio (pesos, tokenizador, procesador y configuración) y declara explícitamente que no documenta datos de entrenamiento, procedimiento ni resultados de benchmarks. Por tanto, la información técnica disponible es limitada y se limita a lo que puede inferirse de la configuración y de la model card.

La relevancia es acotada: sirve como ejemplo de fine-tuning/derivación multimodal de pequeño tamaño (2B) sobre el que existen también cuantizaciones GGUF y MLX-4bit publicadas por el mismo autor. Su licencia LFM Open License v1.0 impone restricciones de uso comercial sobre los derivados, lo que condiciona su adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (codificador visual + proyector + modelo de lenguaje); clase `Lfm3VlForConditionalGeneration` |
| Parametros totales | 1.918.181.888 (aprox. 1,92 B) |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 en el repo principal; existen variantes GGUF y MLX-4bit del mismo autor |
| Idiomas soportados | en (inglés) |
| Licencia | LFM Open License v1.0 (license: other) |
| Formato de pesos | safetensors (BF16); GGUF y MLX-4bit en repos relacionados |

## Arquitectura y entrenamiento

La arquitectura corresponde a un modelo vision-lenguaje con tres componentes declarados en el repositorio: un codificador visual, un proyector que alinea las representaciones visuales con el espacio del lenguaje y un modelo de lenguaje. La clase de modelo es `Lfm3VlForConditionalGeneration`, propia de la familia LFM3-VL de LiquidAI, e incluye código personalizado que requiere `trust_remote_code=True` en Transformers (la configuración declara Transformers 5.21.0).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o similar. La model card indica explícitamente que los datos de entrenamiento y el procedimiento no están documentados en los artefactos inspeccionados. Tampoco se detalla qué modificación concreta introduce el sufijo "heretic" respecto al modelo base; el término se asocia habitualmente a ajustes que reducen el comportamiento de rechazo, pero no hay documentación que lo confirme en este repositorio.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text).
- Descripción y respuesta a preguntas sobre imágenes.
- Conversación multimodal multi-turno (tag `conversational`).
- Procesamiento de imágenes mediante el image processor incluido en el repositorio.
- Capacidades de lenguaje natural en inglés.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan modos especiales (thinking mode, audio, vídeo).

## Casos de uso

- Descripción automática de imágenes: el modelo puede generar texto descriptivo a partir de una imagen de entrada, útil para etiquetado de catálogos o accesibilidad.
- Respuesta a preguntas visuales (VQA): integrable en asistentes que respondan a preguntas sobre capturas, diagramas o fotografías.
- Extracción de información de documentos escaneados: al ser multimodal, puede procesar imágenes de documentos y devolver texto estructurado, aunque su tamaño 2B limita la precisión en documentos densos.
- Prototipado rápido de aplicaciones multimodales: al caber en GPUs de consumo y ofrecer variantes GGUF/MLX, permite experimentar en local sin infraestructura dedicada.
- Moderación o clasificación de contenido visual: puede usarse para generar descripciones que alimenten clasificadores posteriores.
- Investigación sobre alineación y comportamiento de rechazo: la variante "heretic" resulta de interés para estudiar cómo cambia el comportamiento conversacional respecto al modelo base de LiquidAI.
- Despliegue en dispositivos Apple Silicon: la variante MLX-4bit permite ejecución local en Mac para demos y pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 3,8 GB solo para pesos (3.836 GB declarados en el archivo `model.safetensors`), más overhead de activaciones y del codificador visual; en la práctica se recomienda al menos 8 GB de VRAM para inferencia cómoda.
- Cuantizaciones: la variante GGUF reduce el requisito y permite ejecución en CPU o GPUs con 4-6 GB; la variante MLX-4bit está pensada para Apple Silicon.
- GPUs recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090 para BF16; A100/H100 no son necesarias por el tamaño del modelo.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más en BF16 y en GPUs de 4-6 GB con cuantización.
- Opciones de despliegue: Transformers con `trust_remote_code=True`, llama.cpp/Ollama a través de la variante GGUF, MLX para Apple Silicon.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LFM3-VL-2B Heretic (este) | ~1,92 B | no disponible | LFM Open License v1.0 | HuggingFace (comunidad) |
| LiquidAI/LFM3-VL-2B (base) | ~1,92 B | no disponible | LFM Open License v1.0 | HuggingFace (oficial) |
| Alternativas de 2B multimodales | no disponible | no disponible | no disponible | no disponible |

La comparación con otros modelos de la misma categoría no puede completarse con los datos proporcionados; únicamente se dispone del modelo base oficial como referencia directa.

## Limitaciones y advertencias

- No hay documentación sobre datos de entrenamiento, sesgos ni evaluación de calidad; el autor advierte que los ejemplos de carga no constituyen una afirmación de calidad medida.
- Riesgo de alucinación no cuantificado; al ser un derivado "heretic", puede presentar un comportamiento de rechazo reducido que conviene validar antes de usar en producción.
- Soporte únicamente de inglés según los metadatos; no se declaran otros idiomas.
- Longitud de contexto no disponible, lo que impide planificar casos de uso con entradas largas.
- La licencia LFM Open License v1.0 impone limitaciones de uso comercial que se extienden a los derivados; no es Apache-2.0.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código Python del repositorio; conviene auditar dicho código antes de desplegarlo.
- Modelo publicado por un autor independiente con pocas descargas (38) y un solo like; no hay garantía de mantenimiento ni soporte.
- El término "heretic" no está documentado en el repositorio; su significado técnico concreto es desconocido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Lucasgitguy-co/lfm3-vl-2b-heretic
- Modelo base oficial: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Variante GGUF: https://huggingface.co/Lucasgitguy-co/lfm3-vl-2b-heretic-gguf
- Variante MLX-4bit: https://huggingface.co/Lucasgitguy-co/lfm3-vl-2b-heretic-mlx-4bit
- Guía upstream de LFM3-VL: https://huggingface.co/LiquidAI/LFM3-VL-2B
