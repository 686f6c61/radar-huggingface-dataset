# koreashin/simcheongi

## Resumen

Simcheongi (심청이) es un modelo de planificación de movimiento para robots de guía (perros guía robóticos) desarrollado por el usuario koreashin. Se trata de un modelo estudiante de conducción entrenado para que un robot de tracción diferencial, operado a una velocidad máxima de aproximadamente 0,25 m/s, navegue por pasillos interiores. El modelo recibe cuatro imágenes de cámara, un escaneo de lidar, lecturas de ultrasonidos, un historial de odometría y una ruta, y produce una trayectoria de 50 puntos que cubre los próximos 5 segundos a 10 Hz.

Arquitectónicamente combina un codificador de imagen ViT-S/16 (basado en DINOv2), un backbone de 12 capas con mezcladores SISA2 y atención KAIROS, y un planificador de flow matching de 6 capas. Con 105.685.969 parámetros en fp32, el modelo está diseñado para ejecutarse tanto en CPU como en GPU, lo que facilita su despliegue en plataformas robóticas con recursos limitados.

El modelo es relevante en el contexto de la robótica de asistencia y la navegación autónoma en interiores, donde los enfoques de planificación basados en aprendizaje (behavior cloning con DAgger y flow matching) empiezan a sustituir a los planificadores clásicos. Su licencia personalizada (`simcheongi-weights`) y la ausencia de benchmarks públicos lo convierten en un artefacto de investigación más que en un producto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-S/16 (DINOv2) + backbone de 12 capas (9 SISA2 + 3 KAIROS, ancho 640) + planificador flow matching de 6 capas |
| Parametros totales | 105.685.969 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.395 tokens de entrada (3 frames pasados x 153 + frame actual 880 + lidar 36 + ultrasonidos 2 + odometria 2 + comando 8 + ruta 8) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32) |
| Idiomas soportados | ko, en |
| Licencia | simcheongi-weights (licencia personalizada, `license: other`) |
| Formato de pesos | safetensors (fp32, 423 MB, 513 tensores) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de tres etapas. Primero, un codificador ViT-S/16 con pesos inicializados desde DINOv2 procesa cuatro frames RGB (t-1,5 s, t-1,0 s, t-0,5 s y t=0). Después, un backbone de 12 capas y anchura 640 combina los tokens visuales con los de lidar, ultrasonidos, odometría, comando y ruta; nueve capas usan mezcladores SISA2 y tres usan atención KAIROS, reutilizando capas de Qwen3.5 (atención, MLP, RMSNorm, embeddings rotatorios) que el código modifica instancia a instancia. Finalmente, un planificador de flow matching de 6 capas genera la trayectoria de (50, 3) mediante integración de Euler con 5 pasos y una semilla fija (42), produciendo una única muestra determinista por decisión.

El entrenamiento se basa en behavior cloning con DAgger sobre datos de simulador que reconstruyen los pasillos del edificio del laboratorio, complementados con etiquetas de experto basadas en reglas. La genealogía de checkpoints es larga: M100 (simulador de pasillo) → car1 (añade modo vehículo) → CTL1 → od1/od2/od3 (DAgger con obstáculos y personas) → av1 → av2m → av2u (etiquetas de experto para esquivar personas de pie) → av3u (3.000 pasos adicionales con personas colocadas al lado). Se mezcló también el dataset NVIDIA PhysicalAI-Autonomous-Vehicles (grabaciones de conducción humana) con un peso de 0,1 en el modo vehículo. El checkpoint av3u es el que se usó en conducción real sobre robot con inferencia en GPU de servidor. Los datos de entrenamiento y evaluación no son públicos.

## Capacidades

- Planificación de trayectorias: genera 50 puntos (x, y, orientación) en el marco del robot para los próximos 5 segundos a 10 Hz.
- Percepción multimodal: integra 4 cámaras RGB, lidar de 400 haces, 6 sensores de ultrasonidos, odometría e historial de poses.
- Seguimiento de ruta: consume una polilínea de ruta en el mismo sistema de coordenadas y calcula comandos de giro automáticamente (izquierda/derecha) a partir de la desviación lateral (±2 m) o el error angular (>20°).
- Estado de sesión: mantiene caché de características de frames pasados, rotación de lidar y cursor de progreso de ruta entre decisiones, replicando la cadencia de entrenamiento de 0,5 s.
- Estimación de incertidumbre y salidas auxiliares de comando y razón (para registro).
- Soporte de ajuste fino completo y parcial, además de entrenamiento, guardado, carga y fusión de adaptadores LoRA.
- Ejecución en CPU (fp32) y GPU (bf16 autocast con mezcladores SISA2 en fp32).
- Capacidades multilingües limitadas a coreano e inglés en la documentación y metadatos; el modelo en sí procesa entradas sensoriales, no texto libre.

## Casos de uso

- Navegación de robots guía en interiores: el modelo planifica trayectorias de 5 s en pasillos con personas y obstáculos, usando la fusión de cámaras y lidar para esquivar obstáculos y la ruta para mantener el rumbo hacia el destino.
- Robots de reparto en oficinas y hospitales: con una ventana de decisión de 0,5 s y velocidad limitada a 0,25 m/s, encaja en plataformas de servicio que requieren movimientos suaves y predecibles en entornos con transeúntes.
- Investigación en behavior cloning y flow matching: sirve como caso de estudio reproducible de una arquitectura híbrida (ViT + SSM/atención + flow matching) para planificación, con código de inferencia, entrenamiento y LoRA en PyTorch puro.
- Ajuste fino con datos propios de robot: el repositorio incluye scripts de entrenamiento y un formato de datos (`simcheongi-bc/1`) que permite adaptar el modelo a un robot y entorno concretos mediante fine-tuning completo o LoRA.
- Prototipado en CPU sin GPU: al ejecutarse en CPU (1,5–2,0 s por decisión con 32 hilos), permite validar pipelines de percepción y planificación en estaciones de trabajo antes de desplegar en GPU.
- Evaluación de seguimiento de ruta: el cálculo automático de comandos y el cursor de progreso de ruta permiten usarlo como módulo de planificación local dentro de un stack de navegación global (por ejemplo, con un planificador global que genere la polilínea).
- Simulación y pruebas de regresión: al ser determinista con semilla fija, facilita pruebas reproducibles de extremo a extremo en simuladores de pasillo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas operativas de latencia: 0,08 s por decisión en H100 (0,8 s de calentamiento en la primera llamada) y 1,5–2,0 s por decisión en CPU de 32 hilos. También indica una diferencia máxima de aproximadamente 8 mm entre las trayectorias de CPU y GPU para una observación sintética.

## Requisitos de hardware

- VRAM estimada: los pesos en fp32 ocupan 423 MB; con activaciones y caché de sesión, la inferencia cabe holgadamente en GPUs con 4–8 GB. No se dispone de cifras oficiales de VRAM pico.
- GPU recomendadas: H100 (referencia de latencia del autor, 0,08 s por decisión). Cualquier GPU CUDA con soporte de bf16 y al menos 8 GB debería ser suficiente; no se han publicado pruebas en RTX 4090, A100 u otras.
- GPU de consumo: sí, cabe en GPUs de consumo con 8 GB o más, aunque no hay mediciones publicadas.
- CPU: funciona en fp32 sin GPU; 1,5–2,0 s por decisión con 32 hilos.
- Opciones de despliegue: el repositorio usa PyTorch puro con `transformers` fijado a 5.14.1 y `safetensors`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo). Soporte opcional de flash-attn 2.8.3 para CUDA bf16 y de Triton para acelerar el entrenamiento.
- Latencia y throughput: 0,08 s por decisión en H100; 1,5–2,0 s en CPU. La cadencia de operación prevista es de una decisión cada 0,5 s.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se trata de un modelo de planificación robótica de nicho, con arquitectura y licencia propias, y no se han publicado comparaciones con otros planificadores aprendidos (por ejemplo, basados en diffusion policy o en transformers de trayectorias). No disponible.

## Limitaciones y advertencias

- El propio autor advierte que el modelo no es un dispositivo de seguridad: no debe usarse como única capa de seguridad en un robot físico.
- El modo vehículo (mode 1) está incluido en los pesos pero no fue validado en este checkpoint; solo el modo pasillo (mode 0) está verificado.
- Entrenado principalmente en simulador con datos de un único edificio; la generalización a otros entornos, iluminaciones o disposiciones de pasillo no está demostrada.
- Los datos de entrenamiento y evaluación no son públicos, lo que impide reproducir o auditar los resultados.
- Dependencias frágiles: `transformers` debe fijarse a 5.14.1 y la versión de Pillow forma parte del pipeline de entrada; otras versiones pueden alterar los resultados numéricos.
- El modelo tiene estado por sesión; llamarlo fuera de la cadencia de 0,5 s o con historiales de menos de 31 filas puede degradar la calidad de la planificación.
- Riesgo de alucinación de trayectorias: al ser un modelo generativo con flow matching, puede producir trayectorias plausibles pero no válidas ante observaciones fuera de distribución; no hay mecanismo interno de verificación de colisiones.
- Licencia `simcheongi-weights` personalizada: es necesario revisar `LICENSE_WEIGHTS.md` antes de cualquier uso comercial; no es una licencia open source estándar.
- Idiomas: solo coreano e inglés en documentación y metadatos; no hay soporte multilingüe del modelo más allá de eso.
- Sin benchmarks públicos ni métricas de éxito en tareas de navegación, lo que dificulta comparar su rendimiento con alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/koreashin/simcheongi
- Licencia de pesos: https://huggingface.co/koreashin/simcheongi/blob/main/LICENSE_WEIGHTS.md
- Documentación de inferencia: docs/INFERENCE.md (en el repositorio del modelo)
- Documentación de entrenamiento: docs/TRAINING.md (en el repositorio del modelo)
- Documentación de LoRA: docs/LORA.md (en el repositorio del modelo)
- Formato de datos: docs/DATA_FORMAT.md (en el repositorio del modelo)
- Dataset NVIDIA PhysicalAI-Autonomous-Vehicles: no se proporciona enlace directo en la información disponible.
