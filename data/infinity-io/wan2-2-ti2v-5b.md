# Infinity-io/Wan2.2-TI2V-5B

## Resumen

Wan2.2-TI2V-5B es un modelo de generación de vídeo por difusión desarrollado por el equipo Wan (Wan-AI, vinculado a Alibaba) que combina generación texto-a-vídeo (T2V) e imagen-a-vídeo (I2V) en un único checkpoint de 5.000 millones de parámetros. Forma parte de la familia Wan2.2, una actualización mayor de los modelos fundacionales de vídeo Wan2.1, e incorpora un VAE propietario (Wan2.2-VAE) con una relación de compresión de 16×16×4, lo que reduce drásticamente el coste computacional de la difusión sobre latentes.

El modelo destaca por su eficiencia: genera vídeo a 720P y 24 fps en una única GPU de consumo como la RTX 4090, algo poco habitual en modelos de vídeo de esta resolución. Frente a las variantes mayores de la familia (T2V-A14B e I2V-A14B, con arquitectura Mixture-of-Experts), el TI2V-5B renuncia al MoE pero mantiene la calidad cinematográfica y la generación de movimiento complejo gracias a un entrenamiento sobre un corpus significativamente ampliado (+65,6 % de imágenes y +83,2 % de vídeos respecto a Wan2.1).

La relevancia actual del modelo radica en que democratiza la generación de vídeo en alta definición sobre hardware asequible, con licencia Apache 2.0 e integración en Diffusers y ComfyUI. El repositorio analizado (Infinity-io/Wan2.2-TI2V-5B) es un espejo del checkpoint oficial Wan-AI/Wan2.2-TI2V-5B, con 34,2 GB de pesos en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para vídeo (transformer de difusión sobre latentes) con VAE de compresión 16×16×4 |
| Parametros totales | 5.000 millones (5B) |
| Parametros activos | no disponible (no es un modelo MoE; las variantes A14B sí lo son) |
| Longitud de contexto | no disponible (no aplica; ventana de generación definida por número de frames) |
| Tipos de cuantizacion | no disponible en la información proporcionada |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Resolución de salida | 720P |
| Frecuencia de fotogramas | 24 fps |
| Tareas soportadas | texto-a-vídeo (T2V) e imagen-a-vídeo (I2V) |
| Librería | wan2.2 (con integración en Diffusers y ComfyUI) |
| Tamaño del repositorio | 34,2 GB |

## Arquitectura y entrenamiento

Wan2.2-TI2V-5B es un modelo de difusión para generación de vídeo que opera sobre latentes comprimidos mediante el Wan2.2-VAE, con una relación de compresión de 16×16×4 (16 píxeles espaciales en cada eje y 4 en el eje temporal). Esta compresión agresiva es la clave de su eficiencia: reduce el número de tokens latentes sobre los que opera el transformer de difusión, permitiendo generar 720P a 24 fps en una sola GPU de consumo. El modelo unifica T2V e I2V en un mismo checkpoint, de modo que la imagen de referencia (si se proporciona) actúa como condicionamiento inicial del proceso de difusión.

El entrenamiento se realizó sobre un corpus notablemente ampliado respecto a Wan2.1: un 65,6 % más de imágenes y un 83,2 % más de vídeos. El equipo incorporó datos estéticos cuidadosamente curados con etiquetas detalladas de iluminación, composición, contraste y tonalidad de color, lo que permite un control más preciso del estilo cinematográfico. A diferencia de las variantes A14B de la familia, que emplean una arquitectura Mixture-of-Experts para separar el proceso de denoising por tramos de timesteps, el TI2V-5B es un modelo denso de 5B parámetros. La información disponible no detalla el número exacto de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de texto (T2V) a 720P y 24 fps.
- Generación de vídeo a partir de una imagen de referencia (I2V) a 720P y 24 fps.
- Generación de movimiento complejo, con mejor generalización en movimiento, semántica y estética respecto a Wan2.1.
- Control de estética cinematográfica mediante etiquetas de iluminación, composición, contraste y tonalidad.
- Soporte bilingüe de prompts en inglés y chino.
- Integración con Diffusers y ComfyUI para flujos de trabajo de generación.
- Inferencia multi-GPU disponible en el código de referencia.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso ni modalidades de audio.

## Casos de uso

- **Generación de vídeo publicitario a 720P**: el modelo permite crear clips a 24 fps con control de estética cinematográfica (iluminación, composición, tonalidad), adecuado para prototipado rápido de anuncios sin coste de rodaje.
- **Animación de imágenes fijas (I2V)**: a partir de una fotografía o ilustración se puede generar una secuencia animada, útil para marketing de producto, ilustración editorial o contenido para redes sociales.
- **Previsualización de storyboards**: guionistas y directores pueden convertir descripciones textuales en clips de referencia para comunicar intención visual antes de la producción.
- **Generación de contenido para redes sociales**: la eficiencia del modelo (720P@24fps en una RTX 4090) permite iterar y producir clips en hardware de consumo, sin depender de clústeres.
- **Investigación en generación de vídeo**: al ser un checkpoint de 5B con licencia Apache 2.0 e integración en Diffusers, sirve como base para experimentación académica en difusión latente y compresión VAE.
- **Prototipado en pipelines de ComfyUI**: la integración con ComfyUI facilita incorporar el modelo en flujos nodales de postproducción y automatización de contenido.
- **Localización de contenido bilingüe**: el soporte de prompts en inglés y chino permite generar material para mercados anglófono y sinófono con un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no se especifica en la información proporcionada; el modelo declara ejecutarse en una única GPU de consumo como la RTX 4090 (24 GB de VRAM). El repositorio ocupa 34,2 GB en safetensors, por lo que la inferencia requiere estrategias de offloading o cuantización para caber en 24 GB.
- **GPU recomendadas**: RTX 4090 (validada por el autor para 720P@24fps); el código de referencia soporta inferencia multi-GPU para configuraciones mayores.
- **GPU de consumo**: sí, el modelo está diseñado explícitamente para ejecutarse en una RTX 4090.
- **Opciones de despliegue**: código de inferencia oficial del repositorio Wan-Video/Wan2.2, integración en Diffusers e integración en ComfyUI.
- **Latencia y throughput**: no disponibles en la información proporcionada; el autor lo describe como "uno de los modelos 720P@24fps más rápidos disponibles", sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Resolución / fps | Tareas | Licencia | Hardware |
|---|---|---|---|---|---|---|
| Wan2.2-TI2V-5B | 5B | Difusión densa + VAE 16×16×4 | 720P / 24 fps | T2V + I2V | Apache 2.0 | RTX 4090 (consumo) |
| Wan2.2-T2V-A14B | 14B (MoE) | Difusión MoE | 480P y 720P | T2V | Apache 2.0 | Multi-GPU |
| Wan2.2-I2V-A14B | 14B (MoE) | Difusión MoE | 480P y 720P | I2V | Apache 2.0 | Multi-GPU |
| Wan2.1 | no disponible | Difusión | no disponible | T2V / I2V | Apache 2.0 | no disponible |

La comparativa se limita a la propia familia Wan2.2 porque la información proporcionada no incluye datos de modelos competidores de otros desarrolladores. El TI2V-5B se posiciona como la variante eficiente de la familia: menor número de parámetros, sin MoE, pero con soporte unificado T2V+I2V y ejecución en GPU de consumo.

## Limitaciones y advertencias

- **Idiomas**: solo se declaran prompts en inglés y chino; el rendimiento con otros idiomas, incluido el castellano, no está documentado.
- **Sesgos**: no se documentan en la información disponible; como modelo entrenado sobre datos web a gran escala, es probable que herede sesgos de representación, pero no hay análisis publicado en la ficha.
- **Alucinación visual**: no hay métricas publicadas sobre fidelidad prompt-vídeo ni sobre artefactos; la calidad real de generación no puede evaluarse con los datos disponibles.
- **Ausencia de benchmarks**: no se han publicado resultados cuantitativos (FVD, VBench u otros), lo que dificulta comparaciones objetivas.
- **Hardware**: aunque se declara compatible con RTX 4090, el tamaño del checkpoint (34,2 GB) obliga a gestión de memoria (offloading, cuantización) que no está documentada.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del VAE y de los datos de entrenamiento, no detalladas en la información disponible.
- **Repositorio espejo**: el repositorio analizado (Infinity-io/Wan2.2-TI2V-5B) registra 0 descargas y 0 likes; el checkpoint oficial es Wan-AI/Wan2.2-TI2V-5B, por lo que se recomienda usar la fuente oficial para garantizar integridad y soporte.

## Enlaces

- Repositorio analizado: https://huggingface.co/Infinity-io/Wan2.2-TI2V-5B
- Checkpoint oficial: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Organización en Hugging Face: https://huggingface.co/Wan-AI/
- GitHub: https://github.com/Wan-Video/Wan2.2
- Informe técnico (arXiv): https://arxiv.org/abs/2503.20314
- Sitio web: https://wan.video
- Blog: https://wan.video/welcome
- ModelScope: https://modelscope.cn/organization/Wan-AI
- Discord: https://discord.gg/AKNgpMK4Yj
