# melmass/fab-s-mlx

## Resumen

FAB-S para MLX es una conversión del modelo FAB-S de noahcao/FAB al formato y las convenciones de MLX, la librería de computación tensorial de Apple para silicio propio. No se trata de un modelo de lenguaje, sino de un modelo de recuperación de malla humana (human mesh recovery): a partir de una imagen estima la pose y la forma del cuerpo humano en 3D. La conversión la firma melmass y combina la arquitectura de SAM 3D Body (prompt encoder, decoder y cabezas MHR y de cámara) con el backbone DINOv3 destilado de FAB, un ViT-S+/16 de 12 bloques.

El modelo cuenta con 258.472.424 parámetros y un repositorio de 1 GB. La conversión incluye únicamente el pase de cuerpo (body pass), dejando fuera el decodificador de manos y las cabezas propias de FAB (dense, contact, visibility y G1). El rig humano (Momentum Human Rig) no está en el checkpoint original de FAB y se toma de mlx-community/sam-3d-body-dinov3-bf16.

Su relevancia es acotada pero específica: permite ejecutar un pipeline de reconstrucción corporal 3D sobre MLX en hardware Apple, algo poco habitual en este nicho, donde la mayoría de implementaciones dependen de CUDA y PyTorch. La licencia es restrictiva (solo investigación y uso no comercial), lo que limita su adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT-S+/16 (12 bloques) como backbone DINOv3 destilado, con prompt encoder, decoder y cabezas MHR y de cámara de SAM 3D Body (solo pase de cuerpo) |
| Parametros totales | 258.472.424 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | No disponible; pesos en bfloat16 (backbone) y float32 (decoder y cabezas) |
| Idiomas soportados | No disponible (no es un modelo lingüístico) |
| Licencia | fab-weights-license (solo investigación y uso no comercial); aplican además los términos de SAM 3D Body y DINOv3 |
| Formato de pesos | safetensors (layouts MLX: Linear `[out, in]`, Conv2d `[out, kh, kw, in]`) |

## Arquitectura y entrenamiento

El modelo es una adaptación de SAM 3D Body sobre el backbone destilado de FAB. El backbone es un ViT-S+/16 de 12 bloques (DINOv3 destilado), almacenado en bfloat16 bajo los nombres de timm (`backbone.vit.*`, `backbone.proj.*`). Sobre él se montan el prompt encoder y el decoder de SAM 3D Body, junto con las cabezas MHR (representación de malla humana) y de cámara, en float32 y bajo los nombres de mlx-vlm. La conversión respeta los layouts nativos de MLX.

El checkpoint no incluye el Momentum Human Rig (`head_pose.body_model.*`), que se importa desde mlx-community/sam-3d-body-dinov3-bf16. Tampoco incluye el decodificador de manos ni las cabezas propias de FAB. El repositorio incorpora `conversion.json` con los ficheros de origen y sus hashes, y un directorio `parity/` con el forward pass original de FAB sobre una foto (CPU, float32) para validar la paridad numérica del port. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, ya que el modelo base es un modelo de visión y la model card no lo detalla.

## Capacidades

- Reconstrucción de malla humana 3D a partir de una imagen (body pass únicamente).
- Estimación de pose corporal y de parámetros de forma mediante la cabeza MHR.
- Estimación de parámetros de cámara mediante la cabeza de cámara.
- Extracción de características visuales con backbone DINOv3 destilado (ViT-S+/16).
- Ejecución nativa en MLX sobre hardware Apple (silicio M-series).
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües ni de generación de texto.
- No incluye decodificación de manos ni las cabezas dense, contact, visibility o G1 de FAB.

## Casos de uso

- Investigación en reconstrucción 3D de cuerpos sobre Mac: permite reproducir y validar el pipeline de SAM 3D Body con backbone FAB en un port MLX, usando el directorio `parity/` para comprobar la equivalencia numérica frente al forward original en CPU.
- Prototipado rápido en entornos Apple sin GPU NVIDIA: al estar implementado en MLX, se puede iterar sobre modelos de captura de movimiento o avatares en un MacBook con silicio M-series sin depender de CUDA.
- Análisis de pose en imágenes para estudios de biomecánica o ergonomía: la cabeza MHR proporciona parámetros de forma y pose corporales que se pueden postprocesar para medir ángulos articulares.
- Generación de avatares 3D a partir de fotografías: la malla estimada sirve como punto de partida para rigging o animación en pipelines de creación de contenido.
- Evaluación comparativa de backbones destilados: al ser un ViT-S+/16 destilado de DINOv3, es útil para medir la pérdida de precisión frente al modelo completo de SAM 3D Body en tareas de mesh recovery.
- Docencia y experimentación con arquitecturas de visión 3D: el repositorio incluye los ficheros de conversión y paridad, lo que facilita entender el mapeo entre PyTorch y MLX en un modelo multimodal de visión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 258,5 M de parámetros, los pesos ocupan aproximadamente 0,5 GB en bfloat16 y cerca de 1 GB en float32; el repositorio completo pesa 1,0 GB, incluyendo ficheros auxiliares.
- GPU recomendadas: el modelo está pensado para MLX, por lo que el hardware objetivo es silicio Apple (M1, M2, M3, M4 y variantes Pro, Max y Ultra). No se documenta soporte para A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en cualquier Mac con silicio Apple; el tamaño es reducido. No se confirma su funcionamiento en GPUs de consumo NVIDIA por tratarse de un port MLX.
- Opciones de despliegue: MLX y mlx-vlm (los nombres de las capas del decoder y las cabezas siguen las convenciones de mlx-vlm). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| melmass/fab-s-mlx | 258,5 M | No aplica | Human mesh recovery (body pass) en MLX | fab-weights-license (no comercial) | Hugging Face, MLX |
| noahcao/FAB | No disponible | No aplica | Human mesh recovery completo (incluye manos y cabezas propias) | fab-weights-license | Hugging Face, PyTorch |
| mlx-community/sam-3d-body-dinov3-bf16 | No disponible | No aplica | SAM 3D Body en MLX con backbone DINOv3 | Términos de SAM 3D Body y DINOv3 | Hugging Face, MLX |

La comparativa se limita a los modelos citados en la información disponible; no se dispone de datos de rendimiento para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- Licencia restrictiva: fab-weights-license permite únicamente investigación y uso no comercial. Aplican además los términos de SAM 3D Body y de DINOv3, lo que exige revisar cada licencia antes de cualquier uso.
- Solo pase de cuerpo: no incluye decodificador de manos ni las cabezas dense, contact, visibility o G1, por lo que no reproduce la funcionalidad completa de FAB.
- El rig humano se importa de otro repositorio (mlx-community/sam-3d-body-dinov3-bf16), lo que introduce una dependencia externa no incluida en el checkpoint.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero la estimación de pose y forma puede ser incorrecta en oclusiones, cuerpos parciales o imágenes con iluminación adversa; no se documentan métricas de error.
- Sin datos de sesgo: no se dispone de información sobre sesgos demográficos en la estimación de forma corporal.
- Idiomas: no aplica, al no ser un modelo de texto.
- Advertencia para producción: la licencia no comercial y la ausencia de benchmarks publicados desaconsejan su uso en sistemas productivos sin una validación propia.
- El repositorio registra 0 descargas y 0 likes, y fue creado en noviembre de 2026, por lo que carece de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/melmass/fab-s-mlx
- Modelo base: https://huggingface.co/noahcao/FAB
- Licencia de pesos de FAB: https://huggingface.co/noahcao/FAB/blob/main/WEIGHTS_LICENSE
- Código de FAB: https://github.com/noahcao/FAB (commit ec65caf)
- Rig humano en MLX: https://huggingface.co/mlx-community/sam-3d-body-dinov3-bf16
