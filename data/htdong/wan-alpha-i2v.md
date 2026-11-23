# htdong/Wan-Alpha-I2V

## Resumen

Wan-Alpha++ es un modelo de generación de vídeo image-to-video especializado en producir vídeo con canal alfa (RGBA) a partir de un único activo RGBA estático. Lo desarrolla el equipo de WeChatCV (Tencent) y se publica como un fine-tuning del modelo base Wan-AI/Wan2.2-I2V-A14B, orientado a la animación de assets con transparencia y a la generación de efectos de vídeo transparentes controlables. El modelo resuelve un problema concreto del pipeline de posproducción y motion graphics: animar un recorte con transparencia sin necesidad de rotoscopia manual ni de generar un fondo que luego haya que eliminar.

La propuesta técnica se apoya en un VAE específico (Wan-Alpha-v2.0-VAE) que modela el canal alfa, junto con dos LoRA de ruido alto y bajo sobre el DiT de Wan2.2. El resultado son vídeos RGBA con control espacial de la transparencia y, según el autor, eficiencia de inferencia superior a alternativas. El repositorio publicado (0,6 GB) contiene los adaptadores LoRA, no el modelo base completo, que debe descargarse por separado.

Es relevante ahora porque el ecosistema de generación de vídeo open source apenas cubre la salida con canal alfa de forma nativa: la mayoría de modelos generan RGB y la transparencia se resuelve con segmentación posterior. Wan-Alpha++ ataca esa carencia directamente sobre un modelo base de 14B con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) de vídeo, fine-tuning LoRA sobre Wan2.2-I2V-A14B, con VAE específico para canal alfa |
| Parametros totales | no disponible (el repo publicado, 0,6 GB, contiene adaptadores LoRA; el modelo base Wan2.2-I2V-A14B es de 14B) |
| Parametros activos | no disponible (el modelo base Wan2.2-I2V-A14B es un MoE con dos expertos de ruido alto y bajo; el número de parámetros activos no se detalla en la información disponible) |
| Longitud de contexto | no disponible (generación de vídeo; el ejemplo de inferencia usa 49 fotogramas a 832x480) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible; los prompts admiten entrada en chino e inglés según la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (high_noise.safetensors y low_noise.safetensors); el VAE se distribuye como .bin (pytorch_model.bin / Wan-Alpha-v2-VAE.bin) |

## Arquitectura y entrenamiento

Wan-Alpha++ no es un modelo entrenado desde cero, sino un conjunto de adaptadores sobre Wan2.2-I2V-A14B, un modelo de difusión de vídeo con backbone transformer (DiT) que emplea dos expertos de ruido (alto y bajo) para repartir el proceso de denoising. Sobre esa base se añaden dos LoRA, `high_noise.safetensors` y `low_noise.safetensors`, que adaptan cada experto a la generación con canal alfa. El componente diferencial es el VAE Wan-Alpha-v2.0, que extiende el espacio latente para representar la transparencia además del color, permitiendo que la salida tenga cuatro canales RGBA en lugar de tres.

El entrenamiento se ha realizado, según los agradecimientos de la model card, sobre el framework DiffSynth-Studio. No se detalla en la información disponible el volumen de tokens o clips de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO (poco habituales en modelos de difusión). El pipeline de inferencia distribuye el trabajo con FSDP para el DiT y el codificador T5, y con paralelismo de secuencia (Ulysses) para secuencias largas, lo que sugiere que el modelo se ha diseñado para ejecutarse en múltiples GPU. La model card menciona control espacial preciso de la transparencia y eficiencia de inferencia como resultados destacados del paper, aunque no se publican cifras concretas en la información disponible.

## Capacidades

- Generación de vídeo image-to-video con salida RGBA, es decir, con canal alfa real por píxel y no una máscara aproximada.
- Animación de un único activo RGBA estático (un recorte con transparencia) hacia una secuencia de vídeo transparente.
- Control espacial de la transparencia: el prompt puede describir qué zonas deben permanecer transparentes y cuáles deben rellenarse.
- Generación de efectos de vídeo transparentes controlables, orientados a motion graphics y composición.
- Soporte de prompts en chino e inglés.
- Configuración de resolución y duración mediante parámetros de inferencia (el ejemplo oficial usa 832x480 y 49 fotogramas).
- Salida en vídeo renderizado con fondo de tablero de ajedrez y fotogramas PNG individuales, lo que facilita la integración en pipelines de composición.
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso, agentes, audio ni visión general más allá del propio pipeline de vídeo.

## Casos de uso

- Motion graphics y publicidad: animar un logotipo o un producto recortado con transparencia para insertarlo directamente sobre cualquier fondo en la fase de composición, sin rotoscopia ni keying manual.
- Posproducción audiovisual: generar elementos animados (humo, líquidos, destellos) con alfa real para superponerlos en un montaje, aprovechando que la salida ya incluye PNG con transparencia.
- Creación de contenido para redes sociales: producir stickers o clips animados con fondo transparente a partir de una imagen estática, con prompts que describen estilo y tipo de plano.
- Desarrollo de videojuegos y UI: generar animaciones de sprites o efectos de interfaz con canal alfa para integrarlas en motores 2D/3D sin pasos intermedios de segmentación.
- Prototipado rápido de assets para diseño: convertir un recorte RGBA en una animación de referencia en minutos, con control de encuadre (primer plano, plano medio, plano general) mediante prompt.
- Investigación en generación de vídeo con transparencia: servir como base reproducible (Apache 2.0) para experimentar con VAEs de canal alfa y adaptadores LoRA sobre Wan2.2.
- Automatización de pipelines creativos: integrar la inferencia por línea de comandos en flujos batch que generen variantes de un mismo asset con distintos prompts y resoluciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma de forma cualitativa que Wan-Alpha++ alcanza rendimiento state-of-the-art en generación image-to-RGBA, control espacial de transparencia y eficiencia de inferencia, pero no incluye tablas con métricas ni comparaciones numéricas.

## Requisitos de hardware

- El repositorio publicado (0,6 GB) contiene solo los adaptadores LoRA y el VAE; es necesario descargar además Wan2.2-I2V-A14B (14B parámetros) para la inferencia completa.
- VRAM estimada: no disponible de forma oficial. Por el tamaño del modelo base (14B) y el uso de FSDP y paralelismo Ulysses en el ejemplo oficial con 8 GPU, se deduce que la inferencia no está pensada para una sola GPU de consumo.
- GPU recomendadas: el ejemplo oficial usa `torchrun --nproc_per_node=8`, lo que apunta a nodos con 8 GPU de datacenter (A100, H100 o similares). No se documentan configuraciones con menos GPU.
- GPU de consumo: no se confirma que quepa en RTX 4090 u otras GPU consumer; la información disponible no lo garantiza y el diseño multi-GPU del ejemplo lo desaconseja.
- Opciones de despliegue: inferencia mediante el repositorio GitHub oficial (Wan-Alpha_PlusPlus) con PyTorch, DiffSynth-Studio y el script `generate_2.2_new.py`. La librería declarada es diffusers, pero no se detalla soporte nativo completo en diffusers, vLLM, llama.cpp, Ollama ni TGI (estos últimos no aplican a un modelo de difusión de vídeo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Salida alfa | Contexto / duracion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan-Alpha++ (htdong/Wan-Alpha-I2V) | LoRA sobre base de 14B | Sí, RGBA nativo | 49 fotogramas en el ejemplo oficial | Apache 2.0 | Pesos LoRA y VAE publicados; código de entrenamiento pendiente |
| Wan2.2-I2V-A14B (Wan-AI) | 14B (MoE de dos expertos) | No (RGB) | no disponible en la información disponible | Apache 2.0 | Modelo base público en Hugging Face |
| Alternativas image-to-video con alfa | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación cuantitativa con otros modelos de vídeo con transparencia no está disponible en la información proporcionada; el propio paper se limita a afirmar superioridad frente a alternativas sin que se hayan podido verificar aquí las cifras.

## Limitaciones y advertencias

- El repositorio publicado no incluye el modelo base: sin descargar Wan2.2-I2V-A14B y el VAE Wan-Alpha-v2.0 la inferencia no funciona, lo que añade complejidad y requisitos de almacenamiento.
- Los checkpoints para "Effect RGBA Video" figuran como pendientes en la lista de tareas del autor; la versión publicada cubre vídeo RGBA normal.
- El código de entrenamiento no está publicado, lo que limita la reproducibilidad y el ajuste fino por parte de terceros.
- El ejemplo oficial requiere 8 GPU con FSDP y paralelismo Ulysses; no hay guía documentada para despliegues pequeños.
- Riesgo de artefactos en los bordes del canal alfa (halos, bordes semitransparentes inconsistentes) inherente a la generación de transparencia; no se documentan métricas de calidad alfa en la información disponible.
- No se detallan sesgos del dataset de entrenamiento ni evaluación multilingüe más allá del soporte de prompts en chino e inglés.
- Riesgo de alucinación visual: como modelo generativo, puede producir movimiento o geometría incoherentes respecto al asset de entrada, especialmente en prompts ambiguos.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Wan2.2 y de las dependencias (DiffSynth-Studio) antes de un despliegue en producción.
- No se especifican límites de resolución, duración máxima ni consumo de memoria por configuración, lo que dificulta la planificación de capacidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/htdong/Wan-Alpha-I2V
- Paper en arXiv: https://arxiv.org/abs/2610.26189
- Repositorio GitHub: https://github.com/WeChatCV/Wan-Alpha_PlusPlus
- Issues del proyecto: https://github.com/WeChatCV/Wan-Alpha_PlusPlus/issues
- Modelo base Wan2.2-I2V-A14B: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
- VAE Wan-Alpha-v2.0: https://huggingface.co/htdong/Wan-Alpha-VAE/blob/main/Wan-Alpha-v2-VAE.bin
- DiffSynth-Studio: https://github.com/modelscope/DiffSynth-Studio
- Wan2.2 (repositorio oficial): https://github.com/Wan-Video/Wan2.2
