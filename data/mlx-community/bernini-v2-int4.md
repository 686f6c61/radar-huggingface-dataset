# mlx-community/Bernini-v2-int4

## Resumen

Bernini-v2-int4 es una conversión al formato MLX de Apple del modelo ByteDance/Bernini-Diffusers-v2, cuantizado a 4 bits. Bernini es un framework unificado de generación y edición de vídeo desarrollado por ByteDance que combina un planificador semántico basado en un MLLM (modelo de lenguaje multimodal) con un renderizador basado en DiT (Diffusion Transformer). Este modelo concreto es la variante int4 de la conversión MLX en bf16, diseñada para entornos con restricciones de memoria.

La cuantización se aplica únicamente a los dos expertos del transformer Wan2.2-A14B (atención y lineales FFN) con grupo de tamaño 64, mientras que el planificador, el codificador umT5 y el VAE se mantienen en bf16. Esto implica una pérdida medible de calidad respecto a la versión bf16, por lo que esta variante está pensada como opción para quienes necesitan reducir el uso de VRAM. El modelo soporta tareas de texto a vídeo, imagen a vídeo y edición de vídeo, y se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLLM planner + DiT renderer (Wan2.2-A14B) |
| Parametros totales | no disponible (el renderer base es Wan2.2-A14B, 14B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (grupo 64) en expertos del transformer; bf16 en planner, VAE y codificador |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

Bernini-v2 combina un planificador semántico basado en un MLLM que interpreta la instrucción y genera un plan latente, con un renderizador DiT derivado de Wan2.2-A14B que produce los fotogramas de vídeo. El renderizador utiliza dos expertos (atención y FFN) que en esta variante se cuantizan a int4 con grupo de tamaño 64, mientras que embeddings, normas, cabeza y modulación permanecen en bf16. El planificador (mllm, vit_decoder, planner_glue), el codificador de texto umT5 y el VAE se mantienen en bf16.

La conversión MLX se realizó a partir de la revisión `399cf6a` de ByteDance/Bernini-Diffusers-v2. La model card advierte que los expertos han sido reentrenados y que esta variante no es intercambiable con los modelos de la serie Bernini-R. No se proporcionan detalles sobre el dataset de entrenamiento ni sobre el proceso de alineación (RLHF/DPO).

## Capacidades

- Generación de vídeo a partir de texto (text-to-video).
- Generación de vídeo a partir de imagen (image-to-video).
- Edición de vídeo (video-editing) mediante instrucciones semánticas.
- Planificación semántica latente: el MLLM interpreta la petición y genera un plan que guía al renderizador.
- Soporte de pipeline de difusión con VAE y codificador umT5.
- Cuantización int4 para reducir requisitos de memoria, con pérdida de calidad asumida.

## Casos de uso

- Creación de vídeos promocionales a partir de un guion: se introduce un texto descriptivo y el modelo genera un vídeo coherente con la narrativa, útil para equipos de marketing sin acceso a estudios de producción.
- Edición de vídeo semántica: dado un vídeo existente y una instrucción en lenguaje natural (por ejemplo, "cambia el fondo a una playa"), el modelo modifica el contenido manteniendo la estructura temporal.
- Prototipado rápido de storyboards: los directores pueden generar vídeos preliminares a partir de descripciones de escenas para validar conceptos antes de la producción real.
- Generación de contenido para redes sociales: creación de clips cortos a partir de imágenes fijas o textos, con la ventaja de poder ejecutarse en hardware Apple Silicon gracias a la conversión MLX.
- Investigación en generación de vídeo: el framework Bernini permite estudiar la interacción entre planificación semántica y renderizado por difusión, y esta variante int4 facilita experimentos en GPUs con menos memoria.
- Automatización de vídeos educativos: a partir de apuntes o guiones, se pueden generar vídeos ilustrativos para plataformas de e-learning, reduciendo costes de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial, pero al ser una conversión MLX con cuantización int4 de los expertos del transformer, se espera que quepa en GPUs de Apple Silicon con 32 GB o más (por ejemplo, M1 Max, M2 Ultra). El tamaño del repositorio es de 48.3 GB, lo que sugiere que la carga completa requiere bastante memoria unificada.
- GPU recomendadas: Apple Silicon (M-series) con al menos 32 GB de memoria unificada para la versión int4; la versión bf16 requeriría más.
- No se menciona soporte para GPUs NVIDIA o AMD; MLX está orientado a Apple Silicon.
- Opciones de despliegue: la librería MLX permite ejecutar el modelo en entornos Apple; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que son para modelos de lenguaje, no para difusión de vídeo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar directamente con alternativas de la misma categoría. El modelo base ByteDance/Bernini-Diffusers-v2 es el referente, y existen variantes MLX como `mlx-community/Bernini-R-int4` (renderer con SA-3D RoPE) y `mlx-community/Bernini-v2-bf16` (versión sin cuantizar). No se pueden aportar datos de rendimiento comparativo.

## Limitaciones y advertencias

- La cuantización int4 de los expertos del transformer conlleva una pérdida medible de calidad respecto a la versión bf16; se recomienda usar bf16 si la memoria lo permite.
- Los expertos han sido reentrenados; esta variante no es intercambiable con los modelos de la serie Bernini-R.
- No se especifican idiomas soportados; el codificador umT5 sugiere soporte multilingüe, pero no está confirmado.
- Riesgo de alucinación visual o incoherencias en vídeos generados, inherente a los modelos de difusión.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar el cumplimiento de las condiciones de la licencia del modelo base.
- No hay información sobre sesgos o limitaciones de contexto temporal (duración máxima de vídeo).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mlx-community/Bernini-v2-int4
- Versión bf16: https://huggingface.co/mlx-community/Bernini-v2-bf16
- Modelo base: https://huggingface.co/ByteDance/Bernini-Diffusers-v2
- Repositorio GitHub de Bernini: https://github.com/bytedance/Bernini
- Página del proyecto: https://bernini-ai.github.io/
- Colección MLX de Bernini-R: https://huggingface.co/collections/mlx-community/bernini-r-mlx
