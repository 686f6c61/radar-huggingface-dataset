# aicentreflip/tutorials-xray-diffusion

## Resumen

El modelo `aicentreflip/tutorials-xray-diffusion` es un modelo de difusión de eliminación de ruido (DDPM) bidimensional e incondicional que genera radiografías de tórax sintéticas de 128×128 píxeles. Lo publica el London AI Centre (organización `aicentreflip`) como parte de los tutoriales de FLIP, su plataforma de interoperabilidad para aprendizaje federado. No es un modelo clínico: es material didáctico que ilustra cómo entrenar un modelo generativo en un escenario federado con NVIDIA FLARE.

Arquitectónicamente es un `DiffusionModelUNet` de MONAI en 2-D, con 22,1 millones de parámetros, cuatro niveles de 64, 128, 192 y 256 canales y self-attention en los dos niveles más gruesos. Predice el ruido añadido en un paso aleatorio de una cadena DDPM de 1000 pasos mediante pérdida MSE. Se entrenó desde cero, de forma federada, simulando dos sedes en una única GPU, y exclusivamente sobre radiografías sintéticas.

Su relevancia es doble: por un lado, demuestra un flujo completo de entrenamiento federado de un modelo generativo con FLIP y NVFLARE; por otro, sirve como referencia reproducible para quien quiera montar un pipeline de difusión médico con MONAI sin tocar datos de pacientes, ya que el conjunto de datos de partida (Ark+) es completamente sintético y está licenciado Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusión 2-D (MONAI `DiffusionModelUNet`), incondicional, DDPM de 1000 pasos |
| Parametros totales | 22,1 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada de imagen 128×128) |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | no disponible (modelo de imagen, no textual) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`diffusion_model.safetensors`, float32) |

## Arquitectura y entrenamiento

El modelo es un UNet de difusión 2-D de MONAI con cuatro niveles de 64, 128, 192 y 256 canales y mecanismos de self-attention en los dos niveles más gruesos. Es incondicional: su única entrada además de la imagen es el paso de ruido. Aprende a predecir el ruido añadido en un paso aleatorio de un schedule DDPM de 1000 pasos, con pérdida MSE. El muestreo se realiza con `DDPMScheduler` y `DiffusionInferer` de MONAI a 1000 pasos.

El entrenamiento fue federado, con NVIDIA FLARE simulando dos sedes sobre una sola GPU. Cada sede usó aproximadamente 1.900 imágenes de los splits tutoriales de Ark+ (radiografías de tórax completamente sintéticas, DeCaf `balanced_synthetic_split`), preprocesadas a escala de grises, redimensionadas a 128×128 y escaladas a [0, 1], con una transformación afín aleatoria ligera durante el entrenamiento. Se ejecutaron 2 rondas de 300 épocas con batch 6 y una tasa de aprendizaje de 1e-3 que decae hasta 5e-5 en las primeras 200 épocas. La pérdida de validación final fue de 0,0039 en la sede 1 y 0,0036 en la sede 2, sobre el 20 % reservado de cada sede. El entrenamiento completo tardó 5 h 05 min en una NVIDIA GeForce RTX 5090, con PyTorch 2.13.0, MONAI 1.6.0 y NVIDIA FLARE 2.9.0.

## Capacidades

- Generación de imágenes: sintetiza radiografías de tórax de 128×128 píxeles a partir de ruido gaussiano mediante muestreo DDPM de 1000 pasos.
- Generación incondicional: no acepta prompts textuales ni etiquetas; solo el paso de ruido condiciona el proceso.
- Entrenamiento federado reproducible: el repositorio incluye `provenance.json` con commit, línea de instalación, comando de lanzamiento, versiones, hardware, tiempo de pared y pérdidas finales.
- Inspección del código de entrenamiento: el directorio `code/` contiene los ficheros de la aplicación tal como se ejecutaron.
- Evaluación incluida: el script `evaluation/sample_xray.py` reproduce el muestreo de la figura de ejemplo (semilla 0).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Docencia sobre difusión médica: sirve para que estudiantes e investigadores vean un pipeline DDPM completo con MONAI, desde el preprocesado hasta el muestreo, con pesos ya entrenados y script de inferencia incluido.
- Tutorial de aprendizaje federado con NVFLARE: el modelo y su `provenance.json` permiten reproducir paso a paso una simulación de dos sedes en una GPU, útil para formar equipos en FLIP.
- Prueba de infraestructura federada: al ser pequeño (22,1 M de parámetros) y entrenarse en 5 h en una RTX 5090, sirve como caso de humo para validar clústeres, orquestación y agregación antes de escalar a modelos mayores.
- Generación de datos sintéticos para pipelines de aumento: las muestras pueden usarse para probar cargadores de datos, aumentos o clasificadores de radiografía en entornos de desarrollo sin datos reales.
- Validación de scripts de muestreo y evaluación: `evaluation/sample_xray.py` permite comprobar que la carga de safetensors, la configuración de red y el `DiffusionInferer` funcionan en un entorno nuevo.
- Referencia de arquitectura para modelos 2-D pequeños: útil como línea base para comparar variantes de UNet, schedules o técnicas de muestreo en imágenes médicas de baja resolución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pérdidas de validación finales del entrenamiento: 0,0039 en la sede 1 y 0,0036 en la sede 2, sobre el 20 % reservado de cada sede. No hay métricas de calidad de imagen (FID, IS, SSIM) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 22,1 M de parámetros en float32, los pesos ocupan aproximadamente 88 MB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU de entrenamiento reportada: una NVIDIA GeForce RTX 5090, con 5 h 05 min de tiempo de pared para 2 rondas × 300 épocas simulando dos sedes.
- GPU recomendadas: cualquier GPU con soporte CUDA razonable para inferencia; para reentrenar, se recomienda al menos una GPU de gama alta consumer o profesional (RTX 4090, RTX 5090, A100, H100) por comodidad, aunque no se documentan requisitos mínimos.
- Cabe en GPU consumer: sí, tanto en inferencia como en entrenamiento (el propio autor lo hizo en una RTX 5090).
- Opciones de despliegue: no se documentan servidores de inferencia; el flujo previsto es Python con MONAI (`DiffusionModelUNet`, `DDPMScheduler`, `DiffusionInferer`) y `safetensors.torch.load_file`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se trata de un modelo didáctico de 22,1 M de parámetros para generación de radiografías sintéticas de 128×128; no se han encontrado en la información disponible alternativas equivalentes con las que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Modelo didáctico: el propio autor indica explícitamente que no es para uso clínico.
- Resolución baja: genera imágenes de 128×128 píxeles, insuficientes para la mayoría de aplicaciones de imagen médica reales.
- Entrenado solo con datos sintéticos: las Ark+ tutorial splits son radiografías sintéticas (DeCaf `balanced_synthetic_split`), sin datos de pacientes; el modelo no ha visto distribución real y no se debe asumir que generalice a radiografías clínicas.
- Generación incondicional: no acepta etiquetas, prompts ni condicionamiento por hallazgos; no se puede dirigir la generación hacia patologías concretas.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir estructuras anatómicamente implausibles; no hay evaluación de calidad de imagen publicada (sin FID, IS ni revisión por radiólogos).
- Sesgos: no documentados; al entrenarse sobre un conjunto sintético concreto, hereda las características de ese generador y no se ha analizado su diversidad demográfica.
- Licencia Apache-2.0: permite uso comercial y modificación, pero el modelo sigue siendo material de tutorial y no está validado para producción.
- Reproducibilidad: el entrenamiento en GPU no es bit a bit repetible; el autor advierte que se obtendrán muestras de calidad similar, no idénticas.
- Sin soporte textual ni multilingüe: no aplica como modelo de lenguaje; no hay contexto, tool calling ni agentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aicentreflip/tutorials-xray-diffusion
- Repositorio FLIP (London AI Centre): https://github.com/londonaicentre/FLIP
- Dataset Ark+ tutorial splits: https://huggingface.co/datasets/aicentreflip/tutorials-arkplus-cxr-classification
- Ruta del tutorial dentro de FLIP: `fl-tutorials/nvflare/image_generation/xray_diffusion/`
- Ficheros incluidos en el repo: `diffusion_model.safetensors`, `provenance.json`, `code/`, `evaluation/sample_xray.py`, `figures/`
