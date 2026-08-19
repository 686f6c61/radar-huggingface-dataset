# Dororo99/Ours_Waymo_ADGS

## Resumen

Ours_Waymo_ADGS es un conjunto de checkpoints del modelo AD-GS (Autonomous Driving Gaussian Splatting) entrenados sobre diez escenas del Waymo Open Dataset. El autor, Dororo99, publica estos pesos con fines exclusivamente de investigación no comercial, bajo los términos de la licencia de datos de Waymo. El modelo aborda la reconstrucción y representación de escenas dinámicas de conducción mediante Gaussian splatting, una técnica de renderizado neuronal en 3D que permite sintetizar nuevas vistas de entornos urbanos con vehículos y peatones en movimiento.

La relevancia de este modelo radica en que proporciona checkpoints ya entrenados para un pipeline de Gaussian splatting adaptado a datos de conducción real, lo que evita a los investigadores el coste computacional de reentrenar desde cero. Cada escena incluye los artefactos de la iteración 60.000: nubes de puntos, deformaciones y parámetros de entorno. El repositorio no incluye datos de sensor originales de Waymo, solo los pesos del modelo, y el tamaño total del repositorio es de 16,8 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gaussian splatting con deformaciones (AD-GS) |
| Parametros totales | no disponible (checkpoints de 16,8 GB en total) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de renderizado 3D, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable |
| Licencia | Waymo Dataset License Agreement for Non-Commercial Use (licencia "other") |
| Formato de pesos | .pth (PyTorch) y .ply (nube de puntos) |

## Arquitectura y entrenamiento

AD-GS es una variante de Gaussian splatting diseñada para escenas dinámicas de conducción. La arquitectura combina una representación estática de la escena mediante nubes de puntos gaussianos con un campo de deformación que modela el movimiento de los objetos a lo largo del tiempo. El checkpoint incluye tres componentes por escena: `deform.pth` (parámetros de deformación), `env.pth` (parámetros de entorno) y `point_cloud.ply` (nube de puntos gaussiana). El entrenamiento se realizó sobre diez escenas del Waymo Open Dataset, utilizando únicamente las cámaras frontales (FRONT, FRONT_LEFT y FRONT_RIGHT) y un split de entrenamiento del 50% de los fotogramas según la configuración LiNSpace. El checkpoint final corresponde a la iteración 60.000. No se especifican detalles sobre el número de gaussianas, la función de pérdida o el proceso de optimización más allá de lo indicado en el repositorio de código fuente.

## Capacidades

- Reconstrucción de escenas de conducción urbana mediante Gaussian splatting con deformaciones temporales.
- Renderizado de nuevas vistas sintéticas a partir de las cámaras frontales del vehículo.
- Modelado de objetos dinámicos (vehículos, peatones) mediante campos de deformación.
- Representación de entorno estático (carretera, edificios, señalización) mediante nubes de puntos gaussianas.
- Generación de resultados de evaluación (renders) comparables con ground truth para métricas de calidad de imagen.
- Soporte para inferencia a partir de los checkpoints publicados, sin necesidad de reentrenar.

## Casos de uso

- Investigación en simulación de conducción autónoma: los checkpoints permiten generar vistas sintéticas de escenas reales de Waymo para entrenar o evaluar modelos de percepción sin necesidad de acceder a los datos originales.
- Desarrollo de algoritmos de Gaussian splatting dinámico: los pesos preentrenados sirven como punto de partida para fine-tuning en otros datasets de conducción o para comparar variantes del método.
- Generación de datos sintéticos para entrenamiento de redes de detección de objetos: al renderizar nuevas vistas, se pueden crear datasets aumentados con anotaciones proyectadas desde las cámaras originales.
- Evaluación de calidad de renderizado en entornos urbanos: los resultados de evaluación incluidos (aunque no publicados en el repo) permiten comparar métricas como PSNR o SSIM frente a otros métodos.
- Estudio de deformaciones temporales en escenas con múltiples objetos en movimiento: el campo de deformación puede analizarse para entender cómo el modelo representa la dinámica de la escena.
- Reproducción de experimentos académicos: al ser checkpoints de investigación, facilitan la reproducibilidad de resultados publicados en papers que usen AD-GS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas cuantitativas (PSNR, SSIM, LPIPS) ni comparaciones con otros métodos. Los archivos de evaluación y ground truth se excluyeron intencionalmente del repositorio.

## Requisitos de hardware

- El tamaño total del repositorio es de 16,8 GB, correspondiente a diez escenas. Cada escena ocupa aproximadamente 1,7 GB en disco.
- Para inferencia, se requiere una GPU con al menos 8-12 GB de VRAM, dependiendo de la resolución de renderizado y el número de gaussianas cargadas. No se especifican requisitos exactos.
- GPUs recomendadas: NVIDIA RTX 3090, RTX 4090, A100 o superiores para un renderizado fluido.
- El modelo no está cuantizado, por lo que se necesita memoria suficiente para los tensores en precisión flotante (FP32 o FP16).
- Opciones de despliegue: el código fuente está disponible en GitHub (https://github.com/Dororo99/AD-GS) y permite cargar los checkpoints con PyTorch. No se mencionan integraciones con vLLM, llama.cpp u otras herramientas de inferencia, ya que no es un modelo de lenguaje.
- La latencia y el throughput dependen de la resolución de salida y del número de gaussianas; no hay datos publicados.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa cuantitativa con otros modelos de Gaussian splatting para conducción. Existen alternativas como S3GS (también del mismo autor, disponible en el repositorio Ours_S3GS_Waymo) o métodos como Street Gaussians, pero no se han encontrado datos públicos de rendimiento comparables. La comparativa se limita a señalar que AD-GS se centra en deformaciones dinámicas, mientras que otros enfoques pueden priorizar la eficiencia o la calidad estática.

## Limitaciones y advertencias

- Licencia estrictamente no comercial: el uso de estos checkpoints está sujeto al Waymo Dataset License Agreement for Non-Commercial Use. Cualquier uso comercial, incluso indirecto, está prohibido.
- Los datos de sensor originales de Waymo no se incluyen en el repositorio; los usuarios deben obtenerlos por separado bajo los términos de Waymo.
- El modelo se entrenó solo con tres cámaras frontales, por lo que no cubre la cobertura completa de 360 grados del vehículo.
- El split de entrenamiento es del 50% de los fotogramas, lo que puede limitar la capacidad de generalización a secuencias más largas o con mayor variabilidad.
- No se proporcionan métricas de calidad ni resultados de evaluación, lo que dificulta valorar su rendimiento real.
- El repositorio no incluye logs de entrenamiento ni configuraciones detalladas, lo que puede dificultar la reproducibilidad exacta.
- Al ser un modelo de investigación, no está optimizado para despliegue en producción ni para inferencia en tiempo real en vehículos.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/Dororo99/Ours_Waymo_ADGS
- Código fuente de AD-GS: https://github.com/Dororo99/AD-GS
- Repositorio relacionado S3GS: https://github.com/Dororo99/Ours_S3GS_Waymo
- Waymo Open Dataset (términos de licencia): https://waymo.com/open/terms/
