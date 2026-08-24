# hodgy/luana-krea2-turbo-v1

## Resumen

`hodgy/luana-krea2-turbo-v1` es un adaptador LoRA de identidad entrenado sobre el modelo base `krea/Krea-2-Turbo`, un generador de imágenes texto a imagen de la plataforma Krea. El autor, `hodgy`, ha publicado este checkpoint en Hugging Face con el objetivo de permitir la generación consistente de un personaje concreto llamado "Luana" usando el flujo de trabajo de Krea 2 Turbo. El adaptador se entrenó con RunComfy AI Toolkit y está pensado para ser cargado como un LoRA estándar en cualquier pipeline compatible con Krea 2 Turbo.

El modelo base Krea 2 Turbo es la variante optimizada para velocidad de Krea 2, diseñada para iteración rápida en ilustraciones expresivas y exploración visual de bajo coste. Este LoRA añade una capacidad de personalización de identidad sobre ese modelo, permitiendo a los desarrolladores y creadores generar imágenes de un personaje específico con solo incluir la palabra de activación "Luana" en el prompt. La relevancia actual radica en la creciente demanda de adaptadores ligeros y reutilizables para modelos de difusión de código abierto, especialmente en flujos de producción creativa donde la consistencia del personaje es crítica.

El repositorio contiene únicamente los pesos del LoRA en formato Safetensors, junto con diez muestras de entrenamiento y el archivo de configuración del entrenamiento. No se proporcionan detalles sobre la arquitectura interna del modelo base, el número de parámetros totales ni la longitud de contexto, ya que estos datos corresponden al modelo Krea 2 Turbo y no se especifican en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base Krea 2 Turbo (texto a imagen) |
| Parametros totales | no disponible (el repositorio solo contiene el adaptador LoRA, no el modelo base) |
| Parametros activos | no disponible (el adaptador tiene rank 32, pero el total de parámetros del LoRA no se indica) |
| Longitud de contexto | no disponible (aplica al modelo base, no al LoRA) |
| Tipos de cuantizacion | no disponible (el LoRA se publica en BF16, pero no se indican cuantizaciones alternativas) |
| Idiomas soportados | no disponible (el modelo base Krea 2 Turbo no especifica idiomas en la información proporcionada) |
| Licencia | other (no se especifican términos concretos; se indica que el modelo base y el adaptador conservan sus propias licencias) |
| Formato de pesos | Safetensors (archivo `luana_krea2_turbo_v1_step2500.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 con alpha 32, entrenado en precisión BF16 con el optimizador AdamW8Bit y una tasa de aprendizaje de 0.0001. El entrenamiento se realizó con resolución en buckets de 512, 768 y 1024 píxeles, y el checkpoint liberado corresponde al paso 2500. No se especifica el número total de imágenes de entrenamiento ni la composición del dataset, aunque por tratarse de un LoRA de identidad se infiere que se usaron imágenes del personaje "Luana". El proceso se ejecutó mediante RunComfy AI Toolkit, una herramienta que facilita el entrenamiento de adaptadores para modelos de difusión.

El modelo base Krea 2 Turbo, según la documentación de Krea, es una versión destilada y optimizada para velocidad de Krea 2, capaz de generar imágenes de alta fidelidad en segundos. No se dispone de detalles sobre su arquitectura interna (si es un transformer de difusión, un modelo de flujo, etc.) ni sobre los datos de entrenamiento del modelo base. El LoRA no introduce innovaciones técnicas más allá de la adaptación de identidad estándar; su valor reside en la consistencia del personaje y en la compatibilidad con el ecosistema Krea 2 Turbo.

## Capacidades

- Generación de imágenes de un personaje específico ("Luana") mediante la palabra de activación `Luana` en el prompt.
- Consistencia de identidad facial y de estilo a través de múltiples generaciones, gracias al entrenamiento de bajo rango sobre el modelo base.
- Compatibilidad con flujos de trabajo de Krea 2 Turbo, incluyendo herramientas como ComfyUI o RunComfy.
- Ajuste de la intensidad del LoRA mediante el parámetro de fuerza (recomendado empezar en 1.0).
- No se documentan capacidades adicionales como tool calling, razonamiento multimodal o procesamiento de lenguaje, ya que es un adaptador puramente visual.

## Casos de uso

- Creación de ilustraciones de personajes para cómics o novelas gráficas: el LoRA permite mantener la apariencia de "Luana" en diferentes escenas y poses, simplemente incluyendo la palabra de activación en cada prompt.
- Desarrollo de avatares para juegos o aplicaciones interactivas: los desarrolladores pueden generar variaciones del personaje con distintos fondos, vestimentas o expresiones sin perder la identidad visual.
- Prototipado rápido de conceptos de personajes para animación: al ser un LoRA ligero (0.2 GB), se puede cargar en entornos de iteración rápida y probar múltiples diseños en minutos.
- Generación de contenido para redes sociales o marketing: un personaje consistente puede usarse para crear una serie de publicaciones con una estética unificada.
- Entrenamiento de modelos de difusión personalizados para estudios de diseño: el adaptador sirve como punto de partida para ajustes adicionales o para combinarse con otros LoRAs de estilo.
- Evaluación de la calidad de adaptadores de identidad en modelos de código abierto: investigadores pueden comparar este LoRA con otros similares (por ejemplo, los de la misma autora para otros personajes) para estudiar la transferencia de identidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas objetivas de calidad de imagen, ni comparaciones con otros LoRAs o modelos base. Las únicas evidencias de rendimiento son las diez muestras de entrenamiento del paso 2500, que se incluyen en el directorio `samples/` del repositorio.

## Requisitos de hardware

- El LoRA en sí es muy ligero (0.2 GB), por lo que el requisito principal es el hardware necesario para ejecutar el modelo base Krea 2 Turbo.
- No se especifican requisitos de VRAM para el modelo base en la información proporcionada. Dado que Krea 2 Turbo es un modelo de difusión de texto a imagen, se estima que requiere al menos 8-12 GB de VRAM para inferencia en FP16, dependiendo de la resolución de salida.
- GPU recomendadas: tarjetas con al menos 12 GB de VRAM, como RTX 3060, RTX 4070, RTX 4080, o GPUs de datacenter como A100 o H100 para producción a gran escala.
- El LoRA puede cargarse en consumer GPUs si el modelo base cabe en memoria; no se requieren GPUs especiales para el adaptador.
- Opciones de despliegue: el formato Safetensors es compatible con ComfyUI, RunComfy, y cualquier framework que soporte LoRAs para modelos de difusión (por ejemplo, Diffusers de Hugging Face). No se mencionan herramientas como vLLM u Ollama, que son específicas para modelos de lenguaje.
- Latencia y throughput: no disponibles. Dependen del modelo base y del hardware; Krea 2 Turbo está optimizado para velocidad, pero no se aportan cifras concretas.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos. El autor ha publicado otros LoRAs de identidad para el mismo modelo base, como `hodgy/luna-krea2-turbo-v1-lora` (personaje "Luna") y `hodgy/kaitlyn-krea2-turbo-v1` (personaje "Kaitlyn"), que comparten la misma metodología de entrenamiento (rank 32, BF16, RunComfy). Sin embargo, no se publican métricas comparativas ni diferencias de rendimiento entre ellos. En cuanto a alternativas de modelos base, Krea 2 Turbo compite con otros generadores de imágenes de código abierto como SDXL o Flux, pero no se dispone de datos de benchmark que permitan una comparación objetiva.

## Limitaciones y advertencias

- La licencia es "other", lo que implica que los términos de uso no están claramente definidos. El autor indica que el modelo base y el adaptador conservan sus propias licencias, por lo que es necesario revisar la licencia de Krea 2 Turbo antes de usar el LoRA en proyectos comerciales.
- El LoRA está entrenado específicamente para un personaje ("Luana") y puede no generalizar bien a otros sujetos o estilos fuera de su dominio de entrenamiento.
- No se proporcionan datos sobre sesgos o alucinaciones. Como adaptador de identidad, es probable que herede los sesgos del modelo base Krea 2 Turbo, que no se documentan en esta ficha.
- La resolución de entrenamiento se limita a buckets de 512, 768 y 1024 píxeles; generar a resoluciones superiores puede degradar la calidad o requerir ajustes adicionales.
- El repositorio no incluye un pipeline de inferencia completo, solo los pesos del LoRA. El usuario debe disponer de un flujo de trabajo compatible con Krea 2 Turbo.
- No hay garantía de soporte o mantenimiento por parte del autor; el proyecto parece ser un experimento personal sin actualizaciones posteriores.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hodgy/luana-krea2-turbo-v1
- Modelo base Krea 2 Turbo (página oficial): https://www.krea.ai/models/krea-2-turbo
- Documentación de Krea 2 Turbo: https://www.krea.ai/docs/user-guide/features/krea-2-turbo
- Página del modelo en Layer.ai: https://www.layer.ai/models/krea-krea-2-turbo
- Otros LoRAs del mismo autor: https://huggingface.co/hodgy/luna-krea2-turbo-v1-lora y https://huggingface.co/hodgy/kaitlyn-krea2-turbo-v1
