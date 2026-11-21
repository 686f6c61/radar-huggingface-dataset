# mlx-community/DeepSeek-V4-Pro-Qwen3.5-9B-bf16

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-bf16 es la conversión al formato MLX del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, un modelo multimodal de ~9.400 millones de parámetros construido sobre la arquitectura Qwen3.5 y destilado a partir de DeepSeek. La conversión la mantiene la organización mlx-community y está pensada específicamente para inferencia en Apple Silicon mediante la librería MLX, conservando el procesador multimodal y la plantilla de chat del modelo original.

El modelo cubre entradas de texto, imagen y vídeo (pipeline `image-text-to-text`), con capacidades declaradas de razonamiento, tool calling, function calling y contexto largo. Soporta seis idiomas (inglés, chino, coreano, japonés, español y ruso) y se distribuye con licencia Apache 2.0, lo que lo hace apto para uso comercial sin restricciones adicionales.

Su relevancia actual radica en que ofrece un modelo multimodal de tamaño medio (9B) con pesos en BF16 y soporte nativo en MLX, lo que permite ejecutarlo localmente en equipos Mac con chip Apple Silicon sin depender de CUDA ni de infraestructura en la nube. La conversión se realizó con mlx-vlm 0.4.4 y conserva el vision tower en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Qwen3.5 (familia `qwen3_5`), con vision tower para imagen y vídeo |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el tag `long-context` sugiere contexto extendido, pero no se especifica la cifra) |
| Tipos de cuantizacion | BF16 (esta conversión); el repo original puede ofrecer otras, no disponible |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (BF16) |
| Tamano del repo | 18,8 GB |
| Libreria de inferencia | mlx-vlm 0.4.4 |
| Pipeline | image-text-to-text |
| Modelo base | Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5, un transformer multimodal que incorpora un vision tower para procesar entradas de imagen y vídeo junto con texto. La conversión a MLX mantiene el vision tower en BF16 y preserva la configuración del procesador multimodal y la plantilla de chat del modelo original. Según las notas de la conversión, el loader de Qwen3.5 en mlx-vlm 0.4.4 omite la cabeza MTP (multi-token prediction) del modelo fuente, por lo que esa capacidad de decodificación especulativa no está disponible en esta versión MLX.

El modelo original se presenta como una destilación de DeepSeek sobre una base Qwen3.5, con etiquetas que indican `reasoning` y `distillation`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones técnicas adicionales más allá de las propias de la familia Qwen3.5 y del proceso de destilación.

## Capacidades

- Generación de texto y razonamiento, con etiqueta explícita `reasoning` en el modelo.
- Generación de código: la model card incluye ejemplos de prompts de programación (por ejemplo, una función Python para parsear JSONL).
- Comprensión de imágenes: pipeline `image-text-to-text` con vision tower conservado en BF16.
- Comprensión de vídeo: etiqueta `video` y `multimodal` en los metadatos.
- Tool calling y function calling: etiquetas `tool-use` y `function-calling`.
- Contexto largo: etiqueta `long-context` (longitud concreta no disponible).
- Multilingüe: inglés, chino, coreano, japonés, español y ruso.
- Conversacional: etiqueta `conversational` y plantilla de chat propia.
- Destilación de DeepSeek: el modelo incorpora conocimiento derivado de DeepSeek según la nomenclatura y las etiquetas.

## Casos de uso

- Asistente de código local en Mac: el modelo puede generar funciones y scripts (por ejemplo, parseo de JSONL) ejecutándose íntegramente en Apple Silicon con mlx-vlm, sin enviar código a servicios externos.
- Análisis de documentos con imágenes: al aceptar entradas image-text-to-text, permite extraer información de capturas, diagramas o documentos escaneados combinándolos con instrucciones textuales.
- Procesamiento de vídeo para resumen o descripción: la etiqueta `video` habilita tareas de descripción y análisis de secuencias, útil para catalogación de contenido audiovisual en local.
- Agentes con tool calling: las etiquetas `tool-use` y `function-calling` permiten integrarlo en flujos de agente que invocan APIs o funciones externas en pipelines multi-paso.
- Atención al cliente multilingüe: con soporte para seis idiomas, puede gestionar conversaciones multi-turno en español, inglés, chino, japonés, coreano y ruso.
- Razonamiento sobre contexto largo: para tareas de análisis de documentos extensos o conversaciones prolongadas, aprovechando la etiqueta `long-context`.
- Prototipado e investigación en local: al ser BF16 y Apache 2.0, sirve para experimentación académica y evaluación de modelos multimodales sin infraestructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al estar en BF16 con ~9,4B parámetros, los pesos ocupan aproximadamente 18,8 GB, que es el tamaño del repo. En memoria unificada de Apple Silicon se necesita al menos esa cantidad más el overhead del runtime y del contexto.
- GPU recomendadas: al ser una conversión MLX, está orientada a Apple Silicon (series M1, M2, M3, M4 y superiores con memoria unificada suficiente). No está pensada para GPU NVIDIA ni CUDA.
- Cabe en consumer GPU: no aplica en el sentido habitual; en equipos Apple con 24 GB o 32 GB de memoria unificada es viable, aunque con 18,8 GB de pesos el margen para contexto y vision tower es ajustado en configuraciones de 24 GB.
- Opciones de despliegue: mlx-vlm (recomendado para multimodal), `python -m mlx_vlm.generate`. Para texto puro podría usarse mlx-lm, aunque la model card recomienda mlx-vlm para uso multimodal. No se indica soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato/plataforma |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-bf16 (este) | ~9,4B | no disponible (long-context) | Sí (imagen, vídeo) | Apache 2.0 | MLX BF16, Apple Silicon |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B (original) | ~9,4B | no disponible | Sí | Apache 2.0 | safetensors estándar |
| Otros modelos Qwen3.5 de ~9B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- La cabeza MTP del modelo fuente se omite en esta conversión MLX, por lo que no se beneficia de la decodificación multi-token prediction.
- Es una conversión de la comunidad (mlx-community), no del desarrollador original; puede haber diferencias de comportamiento respecto al modelo fuente.
- El modelo está restringido a inferencia en Apple Silicon con MLX; no es directamente utilizable en CUDA, vLLM o llama.cpp.
- No se especifica la longitud exacta de contexto, lo que dificulta planificar despliegues con requisitos de ventana concretos.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones específicas.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información disponible.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene verificar la model card del modelo original para condiciones adicionales.
- El tamaño en BF16 (18,8 GB) limita su ejecución en equipos Apple con menos de 24 GB de memoria unificada.
- El soporte de vídeo e imagen depende de mlx-vlm; el uso con mlx-lm puede no funcionar correctamente para entradas multimodales.

## Enlaces

- Hugging Face (esta conversión): https://huggingface.co/mlx-community/DeepSeek-V4-Pro-Qwen3.5-9B-bf16
- Modelo base original: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Revisión usada en la conversión: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B/tree/7d7edca1b1e820d89127f9c8ac4b035e0f27652e
- Librería mlx-vlm: no disponible en la información proporcionada (se instala con `pip install -U mlx-vlm`)
