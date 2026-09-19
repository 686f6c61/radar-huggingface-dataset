# mercedis22/Wan_2.2_ComfyUI_Repackaged

## Resumen

`mercedis22/Wan_2.2_ComfyUI_Repackaged` es un repositorio de redistribución ("repackaging") que agrupa en un único espacio de HuggingFace los pesos de la familia Wan 2.2 y de varios de sus derivados, ya convertidos al formato de archivo único (single-file) que consume ComfyUI. No se trata de un modelo nuevo ni de un entrenamiento propio: el autor, `mercedis22`, se limita a recomprimir y renombrar checkpoints publicados originalmente por Wan-AI, alibaba-pai, NVIDIA y lightx2v, e incluye una guía de carpetas para colocarlos en una instalación de ComfyUI.

El paquete cubre prácticamente toda la gama de difusión de vídeo de Wan 2.2: texto a vídeo (T2V), imagen a vídeo (I2V), texto+imagen a vídeo (TI2V-5B), audio/speech a vídeo (S2V-14B), animación de personajes (Animate-14B), control de cámara y de pose (Fun-Control), inpainting de vídeo (Fun-InP), edición con referencias (VACE-Fun) y edición de imagen con coherencia temporal (ChronoEdit-14B). Los tamaños declarados en los nombres de los modelos base son 14B y 5B de parámetros, con arquitectura de difusión tipo transformer y un esquema de dos expertos (ruido alto / ruido bajo) en las variantes 14B, tal como refleja la nomenclatura de los archivos (`high_noise` / `low_noise`).

Su relevancia es operativa, no científica: evita tener que convertir manualmente cada checkpoint a single-file y estandariza la nomenclatura de carpetas de ComfyUI. El coste es un repositorio de 728,7 GB, con 32 checkpoints de difusión, 6 LoRA, 2 codificadores de texto, 2 VAE y 1 codificador de audio. La adopción es testimonial (3 descargas y 0 "likes" en la fecha de creación registrada), por lo que debe tratarse como un espejo no oficial y verificar la integridad de los archivos antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión (transformer de difusión para vídeo); las variantes 14B de Wan 2.2 emplean un esquema de dos expertos según la nomenclatura `high_noise` / `low_noise` de los archivos. No se documenta en el repositorio |
| Parámetros totales | 14B en las variantes `...14B` y `...A14B`; 5B en `wan2.2_ti2v_5B` y en las variantes Fun 5B. El sufijo `A14B` de los repos originales designa 14B activos por paso |
| Parámetros activos | 14B por paso de denoising en las variantes `A14B` (dos expertos de ruido alto y bajo). El cómputo total combinado no se declara en la información disponible |
| Longitud de contexto | No aplica en el sentido de ventana de tokens. La duración y resolución máximas de vídeo no se declaran en el repositorio: no disponible |
| Tipos de cuantización | bf16, fp16, fp8 con escalado (`fp8_scaled`, formato e4m3fn), int8 (`int8_convrot`); LoRA de destilación a 4 pasos de lightx2v |
| Idiomas soportados | no disponible. El repositorio no declara idiomas e incluye únicamente codificadores de texto `umt5_xxl` |
| Licencia | apache-2.0 (declarada por el repositorio que redistribuye; ver advertencias sobre las licencias de los modelos base agregados) |
| Formato de pesos | safetensors de archivo único (`diffusion-single-file`) para ComfyUI |

## Arquitectura y entrenamiento

El repositorio no contiene ninguna descripción de arquitectura ni de proceso de entrenamiento: es un contenedor de pesos. Lo que puede deducirse de la estructura de archivos es lo siguiente. Cada variante 14B se distribuye en dos checkpoints, uno etiquetado `high_noise` y otro `low_noise`, lo que corresponde al diseño de dos expertos de Wan 2.2, en el que un experto se encarga de las fases iniciales del proceso de denoising (ruido alto) y otro de las finales (ruido bajo), alternándose dentro de la misma trayectoria de muestreo. Las variantes 5B (`wan2.2_ti2v_5B_fp16.safetensors`) se sirven como un único checkpoint sin división de expertos.

El resto de componentes del pipeline son explícitos en la estructura de carpetas: el codificador de texto es `umt5_xxl` (disponible en fp16 y en fp8 e4m3fn escalado), el VAE es `wan2.2_vae.safetensors`, con `wan_2.1_vae.safetensors` como alternativa heredada, y los flujos con audio (S2V y Animate) requieren `wav2vec2_large_english_fp16.safetensors` como codificador de audio. Los LoRA incluidos son de destilación (`lightx2v` a 4 pasos para I2V y T2V, con variantes para ruido alto y bajo) y un LoRA de reiluminación para Animate. No hay información disponible sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni sobre innovaciones técnicas adicionales.

## Capacidades

- Generación de vídeo a partir de texto (T2V) con los checkpoints `wan2.2_t2v_high_noise` y `wan2.2_t2v_low_noise` en fp16 y fp8.
- Generación de vídeo a partir de una imagen (I2V) con los checkpoints `wan2.2_i2v_high_noise` y `wan2.2_i2v_low_noise`.
- Generación conjunta de texto e imagen a vídeo (TI2V) con el modelo de 5B.
- Animación de personajes con audio como entrada (S2V-14B), usando `wav2vec2_large_english_fp16` como codificador de audio.
- Animación facial y corporal con LoRA de reiluminación incluida (`wan2.2_animate_14B_relight_lora_bf16.safetensors`).
- Control de cámara y de movimiento (familia Fun-Control-Camera), con checkpoints separados de ruido alto y bajo.
- Control estructural y de pose (familia Fun-Control 14B y 5B).
- Inpainting de vídeo (familia Fun-InP 14B y 5B) para rellenar o sustituir regiones de un clip.
- Edición de vídeo con referencias y composición (familia VACE-Fun A14B).
- Edición de imagen con coherencia temporal (ChronoEdit-14B) y su LoRA de destilación.
- Aceleración por destilación: los LoRA de lightx2v permiten reducir el muestreo a 4 pasos en I2V y T2V.
- Ejecución por lotes y automatización a través de la interfaz de ComfyUI, ya que los archivos siguen la convención de carpetas de esa aplicación.
- Tool calling, function calling, agentes, razonamiento multi-paso y capacidades conversacionales: no aplica, es un modelo de difusión, no un modelo de lenguaje.

## Casos de uso

- Producción de vídeo publicitario a partir de texto: los checkpoints T2V de 14B generan clips cortos desde un guion; el par de expertos de ruido alto y bajo permite ajustar la fidelidad de los primeros fotogramas frente al detalle final cambiando el punto de conmutación.
- Animación de fotografía de producto en comercio electrónico: con I2V se parte de una imagen fija de catálogo y se obtiene un vídeo con movimiento de cámara, evitando sesiones de rodaje y manteniendo el control sobre el encuadre inicial.
- Avatares y locución sincronizada: la variante S2V-14B, junto con el codificador `wav2vec2`, permite generar vídeo de un rostro a partir de una pista de audio, lo que sirve para doblaje, formación interna o contenido accesible, siempre con consentimiento explícito de la persona representada.
- Previsualización cinematográfica (previz): la familia Fun-Control-Camera acepta instrucciones de movimiento de cámara y permite validar trayectorias de dolly, órbita o travelling antes del rodaje real, con coste mucho menor que una prueba en plató.
- Postproducción y limpieza de planos: la familia Fun-InP está pensada para rellenar o eliminar elementos dentro de un clip; el modelo propaga el contenido generado a lo largo de los fotogramas, lo que evita el parpadeo típico de aplicar retoque fotograma a fotograma.
- Edición de vídeo con material de referencia: VACE-Fun permite recomponer un plano tomando estructura o estilo de un clip de referencia, útil para igualar el aspecto de tomas rodadas en condiciones distintas.
- Retoque fotográfico con instrucciones: ChronoEdit-14B edita imágenes manteniendo la coherencia entre fotogramas, adecuado para corregir iluminación, fondos o pequeños objetos en material rodado.
- Iteración rápida en estudio de diseño: los LoRA de destilación de 4 pasos de lightx2v reducen el número de evaluaciones del modelo por muestra, lo que hace viable generar decenas de borradores y reservar los checkpoints completos para el renderizado final.
- Automatización de pipelines internos: al ser archivos single-file con nombres estables, se pueden insertar en flujos de ComfyUI lanzados en modo headless mediante su API, encadenando I2V, inpainting y control de cámara en un mismo grafo.
- Investigación comparativa en difusión de vídeo: disponer en un mismo repositorio de las variantes T2V, I2V, TI2V, S2V, VACE y Fun-Control, en bf16, fp16, fp8 e int8, facilita experimentos controlados sobre el efecto de la precisión numérica en la calidad final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio se limita a listar rutas de archivos y a enlazar los repositorios originales y la página de ejemplos de ComfyUI, sin incluir métricas (FVD, CLIP-SIM, VBench ni similares) ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones aritméticas a partir del número de parámetros y la precisión de cada archivo, no datos publicados por el autor ni por los repositorios originales.

| Variante | Precisión | VRAM estimada solo para los pesos |
|---|---|---|
| 14B (un experto) | fp16 / bf16 | ~28 GB |
| 14B (un experto) | fp8 escalado | ~14-16 GB |
| 14B (un experto) | int8 | ~14-15 GB |
| 14B (ambos expertos en memoria) | fp16 / bf16 | ~56 GB |
| 5B (TI2V, Fun 5B) | bf16 | ~10 GB |
| Codificador de texto UMT5-XXL | fp16 | ~9-10 GB |
| Codificador de texto UMT5-XXL | fp8 escalado | ~5-6 GB |
| VAE y codificador de audio | fp16 | menos de 1 GB cada uno |

- Cabe en GPU de consumo: la variante 5B en bf16 o fp8 y las variantes 14B en fp8 escalado más el codificador de texto en fp8. Una RTX 4090 de 24 GB puede ejecutar 14B en fp8 con el text encoder cuantizado, siempre que se gestionen los dos expertos de forma secuencial.
- GPU recomendadas: A100 80 GB o H100 80 GB para trabajar con los dos expertos de 14B en bf16/fp16 sin descarga a memoria del sistema; A100 40 GB o L40S para una única variante 14B en bf16; RTX 4090, RTX 4080, RTX 3090 (24 GB) para las configuraciones en fp8; GPUs de 12-16 GB para el modelo de 5B y para 14B en fp8 con descarga parcial a RAM.
- Almacenamiento: el repositorio completo ocupa 728,7 GB; conviene descargar solo los archivos necesarios, ya que cada checkpoint de 14B en fp16 ronda las decenas de gigabytes.
- Opciones de despliegue: ComfyUI es el destino del repositorio y requiere respetar la estructura de carpetas indicada (`models/diffusion_models`, `models/text_encoders`, `models/vae`, `models/loras`, `models/audio_encoders`). Los modelos originales en formato Diffusers se pueden usar con la librería Diffusers para los repositorios de Wan-AI, alibaba-pai, NVIDIA y lightx2v. vLLM, llama.cpp, Ollama y TGI no son aplicables a un modelo de difusión de vídeo.
- Latencia y throughput: no disponible. El único dato indirecto es que los LoRA de destilación de lightx2v permiten reducir el número de pasos de muestreo a cuatro, lo que disminuye proporcionalmente el tiempo de inferencia respecto a una configuración de referencia.

## Comparativa con modelos similares

Los elementos comparables presentes en la información son los propios repositorios originales que este paquete redistribuye. La comparación relevante, por tanto, es de formato de distribución, no de calidad.

| Repositorio | Contenido | Parámetros | Formato | Licencia declarada | Disponibilidad |
|---|---|---|---|---|---|
| `mercedis22/Wan_2.2_ComfyUI_Repackaged` | 32 checkpoints de difusión, 6 LoRA, 2 text encoders, 2 VAE, 1 audio encoder | 14B y 5B | safetensors single-file para ComfyUI | apache-2.0 | HuggingFace, 3 descargas, espejo no oficial |
| `Wan-AI/Wan2.2-T2V-A14B`, `Wan-AI/Wan2.2-I2V-A14B` | Checkpoints originales | 14B activos | safetensors (formato original / Diffusers) | apache-2.0 | HuggingFace, repositorio oficial |
| `Wan-AI/Wan2.2-TI2V-5B` | Checkpoint original | 5B | safetensors (formato original / Diffusers) | apache-2.0 | HuggingFace, repositorio oficial |
| `nvidia/ChronoEdit-14B-Diffusers` | Modelo de edición de imagen con coherencia temporal | 14B | Diffusers | no disponible en la información proporcionada | HuggingFace |
| `lightx2v/Wan2.2-Distill-Loras` | LoRA de destilación a 4 pasos | no disponible | safetensors (LoRA) | no disponible en la información proporcionada | HuggingFace |

No se dispone de datos de rendimiento que permitan comparar este paquete con alternativas de otros desarrolladores (por ejemplo, otros modelos de difusión de vídeo de código abierto), por lo que esa comparación no se incluye.

## Limitaciones y advertencias

- No es un modelo oficial: es una agregación de terceros publicada por el usuario `mercedis22`, sin indicación de afiliación con Wan-AI, Alibaba, NVIDIA ni lightx2v. La fecha de creación y actualización registrada es la misma, lo que sugiere que no ha habido mantenimiento posterior.
- Adopción prácticamente nula: 3 descargas y 0 "likes" en el momento de la consulta, sin señal de validación por parte de la comunidad.
- Tamaño desproporcionado: 728,7 GB de repositorio. Descargar el conjunto completo es poco práctico y conviene limitarse a los archivos concretos que se necesiten.
- Licencias heterogéneas: el repositorio declara apache-2.0, pero agrega pesos de orígenes distintos, entre ellos `nvidia/ChronoEdit-14B-Diffusers`, cuyas condiciones no se detallan aquí. Antes de un uso comercial hay que verificar la licencia de cada modelo base por separado en su repositorio original.
- Ausencia de documentación técnica: no hay model card descriptiva, ni detalles de entrenamiento, ni métricas, ni instrucciones de uso más allá del árbol de carpetas. No hay información sobre sesgos, composición de datos ni filtros de contenido.
- Dependencia de ComfyUI: los archivos están pensados para la convención de carpetas de ComfyUI y algunos flujos (S2V, Animate, VACE, Fun-Control) requieren nodos y versiones concretas de esa aplicación, que no se especifican.
- Riesgo de contenido sensible: las variantes S2V y Animate generan vídeo de rostros a partir de audio. Su uso para suplantación de identidad, desinformación o material no consentido es un riesgo directo y responsabilidad de quien despliega el modelo.
- Alucinación visual: como todo modelo generativo, puede producir artefactos anatómicos, texto ilegible, físicas incoherentes y deriva temporal entre fotogramas. No hay evaluación publicada de frecuencia de fallo.
- Idiomas: el repositorio no declara idiomas soportados. El codificador de texto incluido es `umt5_xxl`, pero no se documenta aquí su cobertura lingüística ni su calidad fuera del inglés.
- Integridad de archivos: al tratarse de un espejo no oficial, no hay suma de verificación publicada por el autor. Conviene comparar tamaños y, si es posible, hashes con los repositorios originales antes de usar los pesos.
- Sin soporte de tool calling ni agentes: cualquier integración debe gestionarse desde fuera del modelo, orquestando las llamadas desde ComfyUI o desde un script propio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mercedis22/Wan_2.2_ComfyUI_Repackaged
- Ejemplos de Wan 2.2 en ComfyUI: https://comfyanonymous.github.io/ComfyUI_examples/wan22/
- NVIDIA ChronoEdit-14B-Diffusers: https://huggingface.co/nvidia/ChronoEdit-14B-Diffusers
- Wan-AI/Wan2.2-Animate-14B: https://huggingface.co/Wan-AI/Wan2.2-Animate-14B
- Wan-AI/Wan2.2-I2V-A14B: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
- Wan-AI/Wan2.2-S2V-14B: https://huggingface.co/Wan-AI/Wan2.2-S2V-14B
- Wan-AI/Wan2.2-T2V-A14B: https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B
- Wan-AI/Wan2.2-TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- alibaba-pai/Wan2.2-Fun-A14B-Control: https://huggingface.co/alibaba-pai/Wan2.2-Fun-A14B-Control
- alibaba-pai/Wan2.2-Fun-A14B-Control-Camera: https://huggingface.co/alibaba-pai/Wan2.2-Fun-A14B-Control-Camera
- alibaba-pai/Wan2.2-Fun-5B-Control: https://huggingface.co/alibaba-pai/Wan2.2-Fun-5B-Control
- alibaba-pai/Wan2.2-Fun-A14B-InP: https://huggingface.co/alibaba-pai/Wan2.2-Fun-A14B-InP
- alibaba-pai/Wan2.2-Fun-5B-InP: https://huggingface.co/alibaba-pai/Wan2.2-Fun-5B-InP
- alibaba-pai/Wan2.2-VACE-Fun-A14B: https://huggingface.co/alibaba-pai/Wan2.2-VACE-Fun-A14B
- lightx2v/Wan2.2-Distill-Loras: https://huggingface.co/lightx2v/Wan2.2-Distill-Loras
