# flyingfishinwater/mlxmodels

## Resumen

`flyingfishinwater/mlxmodels` no es un modelo individual, sino un repositorio espejo (mirror) que agrupa 21 subcarpetas, cada una correspondiente a un repositorio de modelo en formato MLX fijado a un commit concreto. El objetivo declarado por el autor es preservar la disponibilidad de estos modelos para la aplicacion Privacy AI, de modo que la app pueda seguir ofreciendolos para descarga aunque los repositorios originales cambien, se retiren o se muevan. Cada archivo de cada carpeta es byte-identico al de la fuente en ese commit, y cada carpeta incorpora un `MIRROR-NOTES.md` con la procedencia y, solo cuando la fuente no incluia ninguna, una `LICENSE`.

El repositorio ocupa 36,5 GB e incluye modelos de distintos autores y familias: variantes de Qwen3.5 (0.8B, 2B y 4B), la familia LFM2.5 y LFM3 de LiquidAI (desde 1.2B hasta un MoE de 8B con 1B activos, mas variantes de vision y de razonamiento), los modelos Bonsai y Ternary-Bonsai de prism-ml (4B en 1 bit y 8B/4B/1.7B en 2 bits ternarios), Gemma 4 E2B, Granite 4.2 3B, MiniCPM5 (1B y 2B), Ministral 3 3B, NVIDIA Nemotron 3 Nano 4B y GLM-OCR. Todos los pesos estan en formato MLX (safetensors), pensados para ejecucion en Apple Silicon mediante la libreria MLX, y la mayoria en cuantizacion de 4 bits.

La relevancia de este repositorio es fundamentalmente practica: sirve como archivo de referencia y como fuente de descarga estable para aplicaciones de inferencia local en Mac. No aporta pesos nuevos ni entrenamiento propio; su valor esta en la fijacion por commit y en la verificacion de integridad byte a byte. La licencia del repositorio agregado figura como `other`, porque cada modelo conserva su licencia original (Apache 2.0, MIT, LFM Open License v1.0 o NVIDIA Open Model License), detallada carpeta por carpeta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | multiple: repositorio espejo con 21 subcarpetas de modelos distintos (transformers densos y MoE, modelos de vision-lenguaje y OCR) |
| Parametros totales | variable por carpeta: desde 0.8B (Qwen3.5-0.8B) hasta 8B (Ternary-Bonsai-8B y LFM2.5-8B-A1B) |
| Parametros activos | 1B en `LFM2.5-8B-A1B-MLX-4bit` (MoE); no disponible para el resto |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (mayoria de carpetas), 2 bits ternarios (Ternary-Bonsai), 1 bit (Bonsai-4B-mlx-1bit) |
| Idiomas soportados | no disponibles |
| Licencia | `other` a nivel de repo; por carpeta: Apache 2.0, MIT, LFM Open License v1.0, NVIDIA Open Model License |
| Formato de pesos | safetensors en formato MLX (`library_name: mlx`) |

Detalle por carpeta:

| Carpeta | Parametros | Cuantizacion | Licencia |
|---|---|---|---|
| `Bonsai-4B-mlx-1bit/` | 4B | 1 bit | Apache 2.0 |
| `Qwen3.5-0.8B-MLX-4bit/` | 0.8B | 4 bits | Apache 2.0 |
| `Qwen3.5-2B-MLX-4bit/` | 2B | 4 bits | Apache 2.0 |
| `Qwen3.5-4B-MLX-4bit/` | 4B | 4 bits | Apache 2.0 |
| `LFM2.5-1.2B-Instruct-MLX-4bit/` | 1.2B | 4 bits | LFM Open License v1.0 |
| `LFM2.5-1.2B-Thinking-MLX-4bit/` | 1.2B | 4 bits | LFM Open License v1.0 |
| `LFM2.5-2.6B-4bit/` | 2.6B | 4 bits | LFM Open License v1.0 |
| `LFM2.5-8B-A1B-MLX-4bit/` | 8B (1B activos) | 4 bits | LFM Open License v1.0 |
| `LFM2.5-VL-1.6B-4bit/` | 1.6B | 4 bits | LFM Open License v1.0 |
| `LFM2.5-VL-3B-MLX-4bit/` | 3B | 4 bits | LFM Open License v1.0 |
| `LFM3-1.7B-MLX-4bit/` | 1.7B | 4 bits | LFM Open License v1.0 |
| `GLM-OCR-4bit-mlx/` | no disponible | 4 bits | MIT |
| `gemma-4-e2b-it-4bit/` | E2B (tamano efectivo) | 4 bits | Apache 2.0 |
| `Ternary-Bonsai-8B-mlx-2bit/` | 8B | 2 bits ternarios | Apache 2.0 |
| `Ternary-Bonsai-4B-mlx-2bit/` | 4B | 2 bits ternarios | Apache 2.0 |
| `Ternary-Bonsai-1.7B-mlx-2bit/` | 1.7B | 2 bits ternarios | Apache 2.0 |
| `granite-4.2-3b-MLX-4bit/` | 3B | 4 bits | Apache 2.0 |
| `MiniCPM5-1B-4bit/` | 1B | 4 bits | Apache 2.0 |
| `MiniCPM5-2B-mlx-4Bit/` | 2B | 4 bits | Apache 2.0 |
| `Ministral-3-3B-Instruct-2512-4bit/` | 3B | 4 bits | Apache 2.0 |
| `NVIDIA-Nemotron-3-Nano-4B-4bit/` | 4B | 4 bits | NVIDIA Open Model License |

## Arquitectura y entrenamiento

Este repositorio no contiene entrenamiento ni pesos originales: es un espejo de artefactos ya publicados. La arquitectura efectiva es la de cada modelo fuente, que abarca transformers densos de escala pequena (0.8B a 4B), un modelo MoE (`LFM2.5-8B-A1B` con 8B totales y 1B activos), modelos de vision-lenguaje (`LFM2.5-VL-1.6B` y `LFM2.5-VL-3B`), un modelo OCR (`GLM-OCR`) y modelos con pesos de muy baja precision (1 bit y ternarios de 2 bits de la familia Bonsai). No se dispone de informacion sobre volumen de tokens, composicion del dataset ni etapas de alineamiento (RLHF/DPO) de cada modelo fuente en la informacion proporcionada.

La innovacion tecnica relevante aqui no esta en los modelos, sino en el mecanismo de preservacion: cada subcarpeta fija un commit concreto del repositorio de origen (`3d25c52f7fa1`, `5d894f8cc4ef`, etc.), mantiene los archivos byte-identicos, anade notas de procedencia y solo incorpora una licencia propia cuando la fuente carece de ella. El formato de pesos es safetensors adaptado a MLX, lo que implica conversion y cuantizacion previas realizadas por los repositorios de origen (mlx-community, LiquidAI, prism-ml, lmstudio-community, EZCon).

## Capacidades

- Generacion de texto y conversacion multi-turno mediante las variantes instruct (Qwen3.5, LFM2.5-Instruct, Ministral 3, Granite 4.2, Nemotron 3 Nano, MiniCPM5).
- Razonamiento explicito en `LFM2.5-1.2B-Thinking-MLX-4bit`, orientado a cadenas de pensamiento antes de la respuesta.
- Comprension de imagen y texto en `LFM2.5-VL-1.6B-4bit` y `LFM2.5-VL-3B-MLX-4bit`.
- Extraccion de texto en imagenes y documentos con `GLM-OCR-4bit-mlx`.
- Generacion de codigo y matematicas: no confirmado de forma especifica para cada carpeta en la informacion disponible; las familias Qwen3.5, Granite y Nemotron suelen cubrirlo, pero no hay datos verificados aqui.
- Tool calling / function calling: no disponible como dato verificado por carpeta.
- Soporte de agentes y razonamiento multi-paso: no disponible como dato verificado por carpeta.
- Capacidades multilingues: no disponibles; el repositorio no declara idiomas.
- Ejecucion nativa en Apple Silicon mediante MLX, con cuantizaciones extremas (1 bit y 2 bits ternarios) que reducen drasticamente el uso de memoria.

## Casos de uso

- Inferencia local en Mac para asistentes de texto: las variantes Qwen3.5 (0.8B, 2B, 4B) en 4 bits permiten ejecutar un chatbot completo en un portatil Apple Silicon sin conexion a red, usando MLX como backend.
- Clasificacion y resumen de documentos en local: los modelos de 1B a 3B (MiniCPM5, Granite 4.2, Ministral 3) son adecuados para tareas de extraccion y sintesis sobre textos de oficina, con latencia baja en hardware consumer.
- Digitalizacion de documentos con OCR: `GLM-OCR-4bit-mlx` (MIT) se puede integrar en un pipeline de escaneo a texto para facturas, formularios o PDF, ejecutandose en local sin enviar imagenes a servicios externos.
- Descripcion de imagenes y respuesta visual: `LFM2.5-VL-1.6B-4bit` y `LFM2.5-VL-3B-MLX-4bit` cubren casos de accesibilidad (describir capturas), moderacion de imagenes o extraccion de informacion de fotos en aplicaciones de escritorio.
- Razonamiento con presupuesto de computo ajustado: `LFM2.5-1.2B-Thinking-MLX-4bit` sirve para tareas que requieren pasos intermedios de razonamiento en dispositivos con poca memoria, gracias a su tamano reducido y cuantizacion de 4 bits.
- Despliegue de un MoE pequeno en local: `LFM2.5-8B-A1B-MLX-4bit` ofrece 8B de capacidad con solo 1B de parametros activos, lo que reduce el coste por token en inferencia comparado con un denso de 8B.
- Archivado y reproducibilidad de experimentos: al fijar commits y conservar archivos byte-identicos, el repositorio permite reconstruir exactamente el entorno de un experimento o de una version de la app Privacy AI meses despues.
- Pruebas de cuantizacion extrema: las carpetas Bonsai de 1 bit y Ternary-Bonsai de 2 bits permiten evaluar la degradacion de calidad frente al ahorro de memoria en Apple Silicon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: no disponible de forma oficial; como referencia orientativa, los pesos de 4 bits ocupan aproximadamente 0,5 GB por cada 1000 millones de parametros (un 4B en 4 bits ronda los 2 GB, un 8B en 4 bits unos 4 GB), mas overhead de KV cache y runtime. Los modelos de 1 bit y 2 bits ternarios reducen aun mas esta cifra.
- GPU recomendadas: el repositorio esta disenado para MLX, es decir, chips Apple Silicon (series M1, M2, M3, M4 y sus variantes Pro, Max y Ultra). No se proporcionan recomendaciones para A100, H100 o RTX 4090 en la informacion disponible.
- Cabe en GPU consumer: si, en equipos Apple Silicon con memoria unificada suficiente; los modelos de 0.8B a 4B en 4 bits son viables en configuraciones de 8 GB o 16 GB, y el MoE de 8B y el denso de 8B requieren mas margen.
- Opciones de despliegue: MLX y `mlx-lm` como ruta principal; conversion a GGUF para llama.cpp u Ollama no esta documentada en este repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `flyingfishinwater/mlxmodels` (este repo) | 0.8B a 8B por carpeta | no disponible | 1, 2 y 4 bits | mixta por carpeta | espejo fijado por commit |
| `mlx-community/Qwen3.5-4B-MLX-4bit` | 4B | no disponible | 4 bits | Apache 2.0 | repositorio original |
| `LiquidAI/LFM2.5-8B-A1B-MLX-4bit` | 8B (1B activos) | no disponible | 4 bits | LFM Open License v1.0 | repositorio original |
| `prism-ml/Ternary-Bonsai-8B-mlx-2bit` | 8B | no disponible | 2 bits ternarios | Apache 2.0 | repositorio original |

La comparativa relevante no es de rendimiento, sino de funcion: este repositorio replica los originales con integridad byte a byte y commit fijado, mientras que los repositorios fuente pueden actualizarse o retirarse. Para benchmarks comparativos entre las familias Qwen3.5, LFM2.5 y Bonsai: no disponible.

## Limitaciones y advertencias

- No es un modelo entrenado ni afinado por el autor del repositorio; cualquier evaluacion de calidad debe hacerse sobre el modelo fuente correspondiente.
- La licencia agregada es `other`: el uso comercial depende de la licencia de cada carpeta. Las carpetas LFM (LiquidAI) usan LFM Open License v1.0 y la de NVIDIA usa NVIDIA Open Model License, que imponen condiciones adicionales frente a Apache 2.0 o MIT.
- No se declaran idiomas soportados; el rendimiento en castellano no esta verificado para ninguna carpeta.
- No hay datos de benchmarks, contexto maximo, tool calling ni alineamiento publicados en la informacion disponible; no deben asumirse.
- Las cuantizaciones de 1 bit y 2 bits ternarios implican perdida de calidad frente a 4 bits o pesos completos; son adecuadas para ahorro de memoria, no para tareas de alta precision.
- El repositorio esta atado al ecosistema MLX y Apple Silicon; no es directamente utilizable en CUDA sin conversion previa.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; deben evaluarse por modelo fuente.
- El espejo preserva una version concreta: no recibira correcciones de seguridad o de sesgos que los repositorios originales publiquen despues del commit fijado.

## Enlaces

- Repositorio espejo: https://huggingface.co/flyingfishinwater/mlxmodels
- `prism-ml/Bonsai-4B-mlx-1bit`: https://huggingface.co/prism-ml/Bonsai-4B-mlx-1bit
- `mlx-community/Qwen3.5-0.8B-MLX-4bit`: https://huggingface.co/mlx-community/Qwen3.5-0.8B-MLX-4bit
- `mlx-community/Qwen3.5-2B-MLX-4bit`: https://huggingface.co/mlx-community/Qwen3.5-2B-MLX-4bit
- `mlx-community/Qwen3.5-4B-MLX-4bit`: https://huggingface.co/mlx-community/Qwen3.5-4B-MLX-4bit
- `LiquidAI/LFM2.5-1.2B-Instruct-MLX-4bit`: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-MLX-4bit
- `LiquidAI/LFM2.5-1.2B-Thinking-MLX-4bit`: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking-MLX-4bit
- `mlx-community/LFM2.5-2.6B-4bit`: https://huggingface.co/mlx-community/LFM2.5-2.6B-4bit
- `LiquidAI/LFM2.5-8B-A1B-MLX-4bit`: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B-MLX-4bit
- `mlx-community/LFM2.5-VL-1.6B-4bit`: https://huggingface.co/mlx-community/LFM2.5-VL-1.6B-4bit
- `LiquidAI/LFM2.5-VL-3B-MLX-4bit`: https://huggingface.co/LiquidAI/LFM2.5-VL-3B-MLX-4bit
- `LiquidAI/LFM3-1.7B-MLX-4bit`: https://huggingface.co/LiquidAI/LFM3-1.7B-MLX-4bit
- `EZCon/GLM-OCR-4bit-mlx`: https://huggingface.co/EZCon/GLM-OCR-4bit-mlx
- `mlx-community/gemma-4-e2b-it-4bit`: https://huggingface.co/mlx-community/gemma-4-e2b-it-4bit
- `prism-ml/Ternary-Bonsai-8B-mlx-2bit`: https://huggingface.co/prism-ml/Ternary-Bonsai-8B-mlx-2bit
- `prism-ml/Ternary-Bonsai-4B-mlx-2bit`: https://huggingface.co/prism-ml/Ternary-Bonsai-4B-mlx-2bit
- `prism-ml/Ternary-Bonsai-1.7B-mlx-2bit`: https://huggingface.co/prism-ml/Ternary-Bonsai-1.7B-mlx-2bit
- `lmstudio-community/granite-4.2-3b-MLX-4bit`: https://huggingface.co/lmstudio-community/granite-4.2-3b-MLX-4bit
- `mlx-community/MiniCPM5-1B-4bit`: https://huggingface.co/mlx-community/MiniCPM5-1B-4bit
- `mlx-community/MiniCPM5-2B-mlx-4Bit`: https://huggingface.co/mlx-community/MiniCPM5-2B-mlx-4Bit
- `mlx-community/Ministral-3-3B-Instruct-2512-4bit`: https://huggingface.co/mlx-community/Ministral-3-3B-Instruct-2512-4bit
- `mlx-community/NVIDIA-Nemotron-3-Nano-4B-4bit`: https://huggingface.co/mlx-community/NVIDIA-Nemotron-3-Nano-4B-4bit
