# locai-models/PP-OCRv6-tiny-mlxfn

## Resumen

PP-OCRv6-tiny-mlxfn es un artefacto de conversión de formato publicado por LocAI que empaqueta el detector y el reconocedor de texto de PP-OCRv6 tiny (originalmente en PaddlePaddle) como grafos `mlxfn` para MLX 0.31.2. No es un modelo nuevo ni un fine-tune: es una exportación de los pesos del modelo base `PaddlePaddle/PP-OCRv6_tiny_det_safetensors` (y del reconocedor `PP-OCRv6_tiny_rec_safetensors`) a un formato ejecutable en Apple Silicon mediante Metal.

El objetivo es permitir la ejecución de un pipeline OCR ligero (detección de cajas de texto + reconocimiento) sobre el stack MLX de Apple, sin depender de PaddlePaddle en tiempo de inferencia. El repositorio contiene únicamente los ficheros derivados (`detector.mlxfn` de 1.784.345 bytes y `recognizer.mlxfn` de 4.446.314 bytes); el resto de artefactos (pesos originales, `inference.yml`, `config.json`, `preprocessor_config.json`) se obtienen del repositorio upstream fijado a una revisión concreta.

La relevancia es acotada: se trata de un componente de infraestructura para perfiles de despliegue concretos de LocAI (`ppocrv6-tiny-apple-metal-fixed-local-v1`, `...-general-local-v1` y `...-general-four-task-local-v1`), no de un modelo para evaluación comparativa. El propio autor declara que la conversión se marcó como "conversion-probe-not-production" y que no se ejecutó ninguna evaluación de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline OCR de dos etapas: detector de texto + reconocedor de texto (arquitectura interna de PP-OCRv6 tiny, no detallada en la información disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión para OCR, no LLM) |
| Tipos de cuantizacion | no disponible (los ficheros se distribuyen como grafos `mlxfn`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `mlxfn` (MLX 0.31.2 `export_function`); los pesos fuente son `safetensors` de PaddlePaddle |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: es una conversión de formato. El detector y el reconocedor provienen de PP-OCRv6 tiny, publicado por PaddlePaddle en formato `safetensors`, y se exportan a grafos `mlxfn` mediante `mlx4ocr` (commit `2d5bb458607d97112555fed27901bdde603c934d`, licencia MIT) sobre MLX 0.31.2, ejecutado en Apple Silicon con Metal. El script de preparación es `tools/qualification/prepare_ppocrv6_adapter_assets.py` (SHA-256 `db0f58affc22263d0420e639a3c511a747cbbb6ebe62c02554046593e49d9af3`) del commit `d8f3f40ec9e14230d19e13f5b19140df64f25713` de LocAI, ejecutado en modo offline bajo `tools/qualification/run-offline-darwin.sh` con Python 3.14.6.

Un detalle técnico relevante es la no reproducibilidad byte a byte: el autor documenta que `export_function` de MLX 0.31.2 escribe bytes variables entre ejecuciones (dos exportaciones idénticas en un Apple M1 Max difieren en unos 7.000 bytes dispersos, con el mismo tamaño). Por eso los ficheros alojados son las salidas originales del 2026-09-28, verificadas contra los SHA-256 que fijan los perfiles de LocAI, y no pueden regenerarse de forma determinista. No se documentan datos de entrenamiento, composición del dataset ni etapas de RLHF/DPO, ya que corresponden al modelo base y no se detallan aquí.

## Capacidades

- Detección de texto en imágenes: el grafo `detector.mlxfn` localiza regiones de texto.
- Reconocimiento de texto: el grafo `recognizer.mlxfn` transcribe el contenido de las regiones detectadas.
- Ejecución sobre Apple Silicon vía MLX/Metal, sin dependencia de PaddlePaddle en inferencia.
- Integración en los perfiles de despliegue de LocAI indicados (fixed, general y four-task).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking; es un componente OCR, no un modelo generativo de propósito general.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Digitalización de documentos en macOS: ejecutar el pipeline detector + reconocedor sobre MLX permite extraer texto de facturas o formularios escaneados en equipos Apple Silicon sin instalar el stack de PaddlePaddle.
- Procesamiento por lotes en local: al ser un modelo tiny y ejecutarse en Metal, encaja en tareas de OCR masivo en estaciones de trabajo Mac donde la privacidad impide enviar imágenes a servicios en la nube.
- Preprocesado para pipelines RAG: extraer texto de PDFs e imágenes antes de indexarlo en un sistema de recuperación, usando el par de grafos como etapa de OCR previa al embedding.
- Integración en aplicaciones de escritorio nativas: al distribuirse como grafos `mlxfn` con SHA-256 fijados, se puede embeber en apps macOS con verificación de integridad de los artefactos.
- Reproducción de perfiles LocAI: usar los ficheros para completar los perfiles `ppocrv6-tiny-apple-metal-*` en entornos de validación internos.
- Prototipado de OCR en investigación: servir como referencia de exportación MLX de un modelo PaddleOCR para comparar latencias y comportamiento frente a la ruta original en Paddle.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que la conversión no incluye ninguna evaluación de calidad ("no evaluation was run to produce it") y que los ficheros están marcados como "conversion-probe-not-production".

## Requisitos de hardware

- VRAM/ memoria unificada: no disponible de forma explícita; por el tamaño de los artefactos (1,78 MB el detector y 4,45 MB el reconocedor), la huella es muy reducida y cabe holgadamente en cualquier Mac con Apple Silicon.
- GPU recomendadas: el formato `mlxfn` está orientado a Apple Silicon con Metal; la exportación se realizó en un Apple M1 Max. No se documenta soporte para GPU NVIDIA o AMD.
- GPU de consumo: sí, en equipos Apple Silicon; no aplica a GPUs discretas convencionales por el formato de destino.
- Opciones de despliegue: MLX 0.31.2 con `mlx4ocr`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no son aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Contexto | Notas |
|---|---|---|---|---|---|
| PP-OCRv6-tiny-mlxfn (este) | OCR detección + reconocimiento | `mlxfn` (MLX) | Apache-2.0 | no aplica | Conversión de formato sin evaluación de calidad |
| PaddlePaddle/PP-OCRv6_tiny_det_safetensors | Detector OCR | `safetensors` | Apache-2.0 (según modelo base) | no aplica | Modelo fuente original, ejecutable con PaddlePaddle |
| PaddlePaddle/PP-OCRv6_tiny_rec_safetensors | Reconocedor OCR | `safetensors` | Apache-2.0 (según modelo base) | no aplica | Modelo fuente del reconocedor |
| PaddlePaddle/PaddleOCR-VL | OCR/VL | no disponible | Apache-2.0 (referenciada en el LICENSE) | no disponible | Familia más amplia de PaddleOCR; no comparable en tamaño con tiny |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo entrenado ni fine-tuneado: es una conversión de formato, por lo que hereda todas las limitaciones del PP-OCRv6 tiny original.
- Sin evaluación de calidad: el autor declara que no se ejecutó ninguna evaluación; los artefactos están marcados como "conversion-probe-not-production", lo que desaconseja su uso directo en producción sin validación propia.
- No reproducible byte a byte: MLX 0.31.2 genera bytes variables entre exportaciones, de modo que los ficheros no pueden regenerarse de forma determinista; la integridad depende de los SHA-256 fijados.
- Dependencia de revisiones upstream: los pesos y configuraciones se obtienen del repositorio PaddlePaddle en revisiones fijadas; cualquier cambio o desaparición upstream rompe la reproducibilidad.
- Plataforma restringida: solo Apple Silicon con Metal y MLX 0.31.2; no hay ruta documentada para otras plataformas.
- Idiomas soportados no documentados: no se puede asumir cobertura multilingüe sin verificar el modelo base.
- Licencia Apache-2.0 permite uso comercial, pero se debe conservar el `LICENSE` y el `NOTICE` indicados por el autor.
- Riesgo de alucinación en el reconocimiento: como todo OCR, puede producir transcripciones erróneas en imágenes de baja calidad, rotadas o con tipografías atípicas; no se documentan métricas de error.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/locai-models/PP-OCRv6-tiny-mlxfn
- Modelo base (detector): https://huggingface.co/PaddlePaddle/PP-OCRv6_tiny_det_safetensors
- Modelo base (reconocedor): https://huggingface.co/PaddlePaddle/PP-OCRv6_tiny_rec_safetensors
- Licencia referenciada: https://huggingface.co/PaddlePaddle/PaddleOCR-VL/resolve/7fa00a8c55b735ba51ba49a9058f3f9c57a99a11/LICENSE
- `mlx4ocr` (commit referenciado): `2d5bb458607d97112555fed27901bdde603c934d` (no se proporciona URL en la información disponible)
- Repositorio LocAI (commit de preparación): `d8f3f40ec9e14230d19e13f5b19140df64f25713` (no se proporciona URL en la información disponible)
