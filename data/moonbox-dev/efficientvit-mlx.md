# moonbox-dev/efficientvit-MLX

## Resumen

EfficientViT-SAM MLX es una conversión a formato MLX del modelo EfficientViT-SAM L2, desarrollada por moonbox-dev para su ejecución en Macs con Apple Silicon. EfficientViT-SAM es un modelo de segmentación de imágenes que combina el codificador de imagen EfficientViT-L2 (a 512 px) con el codificador de prompts y el decodificador de máscaras de SAM (Segment Anything Model). El resultado es un pipeline de generación de máscaras que acepta prompts de puntos y devuelve máscaras segmentadas, pensado para ser más eficiente computacionalmente que el SAM original.

Este repositorio no contiene el modelo original de PyTorch, sino una portabilidad a MLX con pesos almacenados en bf16 y fp16, junto con el código de inferencia (`mlx_model.py`) que reproduce la interfaz de `EfficientViTSamPredictor`. El autor advierte explícitamente que ambas precisiones son experimentales: el modelo requiere aritmética float32 para igualar al original, y las versiones de 16 bits quedan por debajo del umbral de calidad aceptable (IoU medio de 0,942 en fp16 y 0,714 en bf16 frente a 0,9996 del port en float32). No existen versiones cuantizadas a 8, 6 o 4 bits porque, según el autor, el modelo no produce máscaras utilizables en esos formatos.

La relevancia de esta ficha es doble: por un lado, documenta una alternativa de segmentación eficiente para el ecosistema Apple Silicon; por otro, sirve como caso práctico de las dificultades de portar modelos con capas sensibles a la precisión (convoluciones 1x1 seguidas de BatchNorm con varianzas muy pequeñas) a formatos de 16 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientViT-L2 (codificador de imagen) + prompt encoder y mask decoder de SAM |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen a 512 px) |
| Tipos de cuantizacion | bf16, fp16 (no hay 8bit, 6bit ni 4bit; el modelo requiere float32 para calidad plena) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), con `config.json` y `mlx_model.py` por carpeta de precisión |

## Arquitectura y entrenamiento

La arquitectura es un pipeline híbrido de segmentación: un codificador de imagen EfficientViT-L2 que procesa la imagen a 512 px y genera un embedding, seguido del codificador de prompts (puntos, con etiquetas positivo/negativo) y el decodificador de máscaras de SAM, que produce máscaras, puntuaciones y logits de baja resolución. El repositorio no documenta el entrenamiento del modelo original; la model card remite al repositorio de mit-han-lab/efficientvit y a los papers citados (arXiv:2405.10300, arXiv:2402.05008, arXiv:2410.10733, arXiv:2205.14756) para los detalles de entrenamiento.

La innovación técnica relevante de esta conversión es la caracterización de la sensibilidad numérica del modelo: treinta convoluciones 1x1 van seguidas de BatchNorm con varianza en ejecución de hasta 5,5e-7 (escalas de hasta 600), de modo que la señal de esos canales reside en el cuarto o quinto dígito significativo de la salida de la convolución, fuera del alcance de pesos o aritmética de 16 bits. El port en float32 (con `MLX_ENABLE_TF32=0`) coincide con PyTorch hasta un IoU de máscara de 0,9996. La conversión se generó desde EfficientViT-SAM en la revisión `de7d7733cc`, cargando los pesos originales en MLX y almacenándolos como bf16 o fp16; cada build se verificó contra el original antes de subirse.

## Capacidades

- Generación de máscaras de segmentación a partir de prompts de puntos (positivos y negativos) sobre una imagen RGB.
- Modo multimáscara (`multimask=True`), que devuelve varias máscaras candidatas con sus puntuaciones.
- Extracción del embedding de imagen una sola vez (`mlx_model.embed`) y reutilización para múltiples prompts (`mlx_model.predict`), lo que abarata la inferencia con varios puntos.
- Interfaz compatible con `EfficientViTSamPredictor` del repositorio original.
- Ejecución en Apple Silicon mediante MLX, con dependencias mínimas (`mlx`, `numpy`, `pillow`).
- No soporta tool calling, agentes, razonamiento multi-step ni procesamiento de lenguaje: es un modelo puramente visual.

## Casos de uso

- Segmentación interactiva en aplicaciones de escritorio para macOS: el modelo se ejecuta en local sobre Apple Silicon con MLX y permite al usuario hacer clic en un objeto para obtener su máscara, sin enviar imágenes a la nube.
- Herramientas de anotación de datasets: dado que el embedding de imagen se calcula una vez y se reutiliza para varios prompts, un anotador puede generar muchas máscaras por imagen con coste reducido (unos 55 ms por imagen con codificador y dos prompts en un Apple M5).
- Edición fotográfica por regiones: seleccionar un objeto con un punto y aplicar ajustes locales (color, desenfoque, reemplazo) usando la máscara devuelta.
- Preprocesado en pipelines de visión por computador: generar máscaras de objetos para tareas posteriores de recorte, conteo o clasificación por región.
- Prototipado e investigación en segmentación: comparar el comportamiento de EfficientViT-SAM frente a SAM original en un entorno MLX, con la advertencia de que las precisiones de 16 bits son experimentales.
- Automatización de flujos de trabajo en Mac: integración del modelo en scripts de Python que procesen lotes de imágenes y generen máscaras para catálogos o inventarios visuales.

## Benchmarks y rendimiento

| Precision | Tamano | IoU de mascara vs PyTorch fp32 (media / peor) | Estado |
|---|---|---|---|
| `fp16/` | 122,7 MB | 0,942 / 0,611 | por debajo del umbral (0,95), experimental |
| `bf16/` | 122,7 MB | 0,714 / 0,091 | por debajo del umbral, experimental |
| fp16 cargado y casteado a float32 | 122,7 MB | 0,966 / 0,62 | por debajo del original con pesos float32 |
| port en float32 (con `MLX_ENABLE_TF32=0`) | no disponible | 0,9996 / 0,997 | coincide con PyTorch |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo de segmentación y no de lenguaje.

## Requisitos de hardware

- Inferencia en Apple Silicon mediante MLX; el autor reporta unos 55 ms por imagen (codificador más dos prompts) en un Apple M5.
- VRAM estimada: los pesos ocupan 122,7 MB por carpeta de precisión; el consumo adicional depende del tamaño de la imagen y de los tensores intermedios, no documentado.
- GPU recomendadas: no disponible para CUDA; el formato MLX está orientado a GPUs integradas de Apple (serie M).
- No cabe en el ecosistema CUDA estándar (vLLM, TGI, llama.cpp, Ollama) porque el formato es MLX y el modelo es de visión, no de lenguaje.
- Despliegue: carga directa con `mlx_model.load("fp16")` o `mlx_model.load("bf16")`; para calidad plena, castear los parámetros a float32 con `model.update(mlx.utils.tree_map(lambda a: a.astype(mx.float32), model.parameters()))` y desactivar TF32 con `MLX_ENABLE_TF32=0`.
- Latencia y throughput: 55 ms por imagen (codificador + 2 prompts) en Apple M5 según el autor; no hay más datos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EfficientViT-SAM MLX (este) | no disponible | imagen 512 px | IoU 0,942 (fp16) / 0,9996 (float32) vs PyTorch | apache-2.0 | Hugging Face, MLX |
| EfficientViT-SAM original (PyTorch) | no disponible | imagen 512 px | referencia float32 | apache-2.0 | GitHub mit-han-lab/efficientvit |
| SAM (Segment Anything, Meta) | no disponible | imagen de alta resolución | no disponible en esta informacion | no disponible en esta informacion | no disponible en esta informacion |

No se dispone de datos suficientes en la información proporcionada para comparar parámetros, contexto o rendimiento con alternativas de forma rigurosa.

## Limitaciones y advertencias

- Ambas carpetas (bf16 y fp16) son experimentales y quedan por debajo del umbral de calidad del autor (IoU medio 0,95); en fp16 el peor caso baja a 0,611 y en bf16 a 0,091.
- El modelo requiere float32 para igualar al original; incluso cargando pesos fp16 y casteando a float32 se obtiene 0,966 medio y 0,62 en el peor caso, por debajo del original con pesos float32.
- No hay versiones cuantizadas a 8, 6 o 4 bits: según el autor, cuantizado el modelo no produce máscaras utilizables.
- Es un modelo de visión: no procesa lenguaje, no soporta tool calling ni agentes, y no tiene capacidades multilingües.
- Solo se ha convertido una parte del pipeline; el resto debe tomarse del repositorio original salvo que la model card indique lo contrario.
- La licencia apache-2.0 del repositorio deriva del modelo original y rige el uso de estos archivos; conviene revisar la licencia del proyecto EfficientViT original para usos comerciales.
- El codebase original de EfficientViT dejó de mantenerse el 2025/09/05; las actualizaciones se trasladan a DC-Gen.
- Riesgo de alucinación no aplica en el sentido de texto, pero sí de máscaras incorrectas en objetos ambiguos o de bajo contraste, especialmente en precisiones de 16 bits.
- No se documentan sesgos del modelo original en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/moonbox-dev/efficientvit-MLX
- Repositorio original EfficientViT: https://github.com/mit-han-lab/efficientvit
- Paper EfficientViT-SAM: https://arxiv.org/abs/2402.05008
- Paper EfficientViT (visión eficiente): https://arxiv.org/abs/2205.14756
- Paper DC-AE (deep compression autoencoder): https://arxiv.org/abs/2410.10733
- Paper relacionado citado en tags: https://arxiv.org/abs/2405.10300
- Proyecto DC-Gen (sucesor del codebase): https://github.com/dc-ai-projects/DC-Gen
- Documentación DC-AE-SANA: https://github.com/mit-han-lab/efficientvit/blob/master/assets/docs/dc_ae_sana_1.1.md
- Colección DC-AE en Hugging Face: https://huggingface.co/collections/mit-han-lab/dc-ae-diffusion-670dbb8d6b6914cf24c1a49d
