# BelifChou/wguo-character-v1

## Resumen

wguo-character-v1 es un adaptador LoRA de tipo DreamBooth para generación de texto a imagen, publicado por el usuario BelifChou en Hugging Face. No se trata de un modelo fundacional, sino de un conjunto de pesos de ajuste fino (aproximadamente 1,0 GB de repositorio) que se aplica sobre los checkpoints Krea 2 de la organización krea, en concreto sobre Krea-2-Raw para el entrenamiento y sobre Krea-2-Turbo para la inferencia rápida. Su propósito es incorporar un concepto o personaje concreto, activado mediante la palabra clave `wguo`, en las imágenes generadas por el pipeline.

La relevancia de esta ficha es limitada pero ilustrativa: muestra el flujo de trabajo habitual de la comunidad de difusión, en el que se entrena un LoRA sobre la variante no destilada (RAW) y se ejecuta sobre la variante destilada (Turbo) de ocho pasos, aprovechando que los LoRA entrenados en RAW se expresan con fuerza en Turbo. El modelo se distribuye con licencia Apache 2.0 y formato safetensors, y se integra mediante la librería diffusers con la clase `Krea2Pipeline`.

No se dispone de información sobre el conjunto de datos de entrenamiento, el número de pasos, la resolución de las imágenes de referencia ni las métricas de calidad. La model card es en gran parte una plantilla autogenerada con secciones marcadas como TODO, por lo que los datos técnicos disponibles proceden del etiquetado del repositorio y del fragmento de código de ejemplo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (DreamBooth) sobre un modelo de difusión Krea 2; no se detalla la arquitectura interna del modelo base |
| Parametros totales | no disponible (el repositorio ocupa 1,0 GB, pero no se indica el número de parámetros del adaptador) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de texto a imagen; no se especifica longitud de prompt máxima) |
| Tipos de cuantizacion | no disponible; el ejemplo de uso emplea `torch.bfloat16` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con DreamBooth sobre el checkpoint Krea-2-Raw, utilizando el entrenador de diffusers para Krea 2 documentado en el repositorio de ejemplos de Hugging Face. Krea 2 se distribuye como dos checkpoints complementarios: RAW, que es la base no destilada sobre la que se realiza el ajuste fino, y Turbo, un checkpoint destilado de ocho pasos pensado para inferencia rápida y de alta calidad. La práctica recomendada por el autor es entrenar en RAW y ejecutar en Turbo, ya que los LoRA entrenados sobre RAW mantienen una expresión intensa sobre Turbo.

No se especifican en la información disponible el número de imágenes de entrenamiento, el número de pasos, la tasa de aprendizaje, la resolución, el rango del LoRA ni si se aplicaron técnicas de regularización. Tampoco se documenta si hubo aumento de datos o balanceo del dataset. La única innovación técnica reseñable es la propia separación RAW/Turbo del modelo base, que permite desacoplar el coste de entrenamiento del coste de inferencia.

## Capacidades

- Generación de imágenes a partir de descripciones textuales, condicionada a la aparición del token `wguo` para activar el concepto o personaje aprendido.
- Personalización de personaje: el adaptador inyecta una identidad visual concreta en el pipeline Krea 2, de modo que el resto del prompt controla escena, estilo, iluminación y composición.
- Inferencia rápida en ocho pasos con `guidance_scale=0.0`, gracias al checkpoint Turbo sobre el que se carga el LoRA.
- Compatibilidad con la API de adaptadores de diffusers: carga, ponderación, fusión y combinación con otros LoRA mediante `load_lora_weights` y las utilidades de `PeftAdapterMixin`.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento, ya que no es un modelo de lenguaje.

## Casos de uso

- Ilustración de personaje recurrente en cómic o narrativa serial: el token `wguo` mantiene la identidad del personaje entre viñetas mientras el prompt describe pose, encuadre y fondo, lo que reduce el trabajo de retoque manual en producciones pequeñas.
- Prototipado de arte conceptual para videojuegos: generar variantes de un mismo personaje en distintos entornos y estados de ánimo para explorar direcciones visuales antes de encargar el modelado 3D.
- Generación de avatares y retratos consistentes para comunidades o productos: el LoRA fija el rostro o el estilo del personaje y el prompt controla la expresividad, útil para bancos de imágenes de perfil.
- Creación de material promocional temático: pósteres, banners y piezas para redes sociales con un personaje concreto, aprovechando los ocho pasos de Turbo para iterar rápido en sesiones de diseño.
- Pruebas de integración de pipelines de difusión: sirve como caso de referencia para validar la carga de adaptadores LoRA sobre Krea 2 en diffusers, incluyendo la fusión con otros adaptadores.
- Docencia y experimentación en ajuste fino: ejemplo mínimo de DreamBooth sobre un modelo base reciente para demostrar el flujo RAW (entrenamiento) a Turbo (inferencia) en talleres prácticos.
- Composición con otros LoRA: al ser un adaptador ligero, puede combinarse con LoRA de estilo para obtener un personaje concreto con una estética determinada, ponderando cada adaptador por separado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas (FID, CLIP score, similitud de identidad) ni comparaciones cuantitativas con otros adaptadores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El ejemplo oficial carga el pipeline en `bfloat16` sobre `cuda`; como referencia orientativa, los pipelines de difusión de tamaño comparable suelen requerir entre 8 y 16 GB de VRAM en precisión media, pero este dato no está confirmado para Krea 2.
- GPU recomendadas: no especificadas por el autor. Por el tipo de carga (difusión en bfloat16), son razonables GPUs con al menos 16 GB de memoria, como RTX 4080/4090, A100 o H100, aunque no hay confirmación documentada.
- Compatibilidad con GPU de consumo: no confirmada; el adaptador en sí ocupa 1,0 GB, pero el requisito dominante es el del modelo base Krea 2.
- Opciones de despliegue: diffusers con `Krea2Pipeline` y `load_lora_weights`, tal como muestra el ejemplo. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión.
- Latencia y throughput: no disponibles. El uso de ocho pasos sin classifier-free guidance en Turbo sugiere una latencia baja en comparación con muestreo completo, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| BelifChou/wguo-character-v1 | LoRA DreamBooth sobre Krea 2 | no disponible | no aplica | Apache 2.0 | Hugging Face, 0 descargas | Adaptador de personaje, trigger `wguo` |
| LoRA DreamBooth sobre Stable Diffusion XL | LoRA DreamBooth | no disponible | no aplica | depende del autor | Amplia en Hugging Face y Civitai | Ecosistema maduro, muchas herramientas de soporte |
| LoRA DreamBooth sobre FLUX.1 | LoRA DreamBooth | no disponible | no aplica | depende de la licencia del base | Creciente en Hugging Face | Mayor calidad reportada por la comunidad, requisitos de VRAM más altos |
| Krea-2-Turbo (modelo base) | Difusión texto a imagen | no disponible | no aplica | según krea | Hugging Face (krea/Krea-2-Turbo) | Checkpoint destilado de ocho pasos; el LoRA se ejecuta sobre él |

No se dispone de datos cuantitativos de rendimiento para establecer una comparación objetiva con estas alternativas.

## Limitaciones y advertencias

- La model card es una plantilla autogenerada: las secciones de usos previstos, sesgos y detalles de entrenamiento están marcadas como TODO y no aportan información.
- No se documenta el dataset de entrenamiento, por lo que se desconocen los sesgos demográficos, estilísticos y culturales introducidos por las imágenes de referencia.
- Riesgo de sobreajuste al concepto: los LoRA de personaje suelen degradar la diversidad de poses y escenas si se usan con pesos altos; no hay guía de ponderación publicada.
- El token `wguo` es obligatorio para activar el concepto; sin él, el adaptador puede introducir deriva estilística no deseada en las generaciones.
- No hay información sobre el comportamiento multilingüe del prompt; se desconoce si el pipeline base procesa texto en castellano con la misma fidelidad que en inglés.
- Licencia Apache 2.0 en el adaptador, pero el uso comercial del modelo base Krea 2 depende de los términos de krea, que deben verificarse por separado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación externa de calidad ni reportes de la comunidad.
- No se especifican requisitos de VRAM ni compatibilidad con GPUs de consumo, lo que dificulta planificar el despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BelifChou/wguo-character-v1
- Modelo base Krea-2-Raw: https://huggingface.co/krea/Krea-2-Raw
- Modelo base Krea-2-Turbo: https://huggingface.co/krea/Krea-2-Turbo
- Entrenador DreamBooth para Krea 2 en diffusers: https://github.com/huggingface/diffusers/blob/main/examples/dreambooth/README_krea2.md
- Documentación de carga de adaptadores LoRA en diffusers: https://huggingface.co/docs/diffusers/main/en/using-diffusers/loading_adapters
- DreamBooth (paper): https://dreambooth.github.io/
