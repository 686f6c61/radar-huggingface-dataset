# Lakonik/pi-H3

## Resumen
pi-H3 es un conjunto de adaptadores de destilación pocos pasos para MiniMax H3, un modelo generativo de vídeo con audio sincronizado. Lo desarrolla Lakonik (Hansheng Chen, Stanford University, con coautores de Stanford y Luma AI) y se publica bajo la licencia comunitaria de MiniMax H3. El modelo base genera vídeo y audio de forma conjunta; pi-H3 lo acelera reduciendo la inferencia a 2 o 4 pasos e incorporando DWD (Decoding Without a Decoder), que predice los fotogramas directamente en el último paso y evita el decodificador VAE.

La relevancia práctica está en el coste de inferencia: los adaptadores DWD eliminan la etapa de decodificación VAE y reducen el número de evaluaciones del transformer, lo que rebaja la latencia y el consumo de memoria frente al muestreo completo de MiniMax H3. Los adaptadores soportan condicionamiento por texto, primer fotograma y último fotograma, y se distribuyen variantes INT8 ConvRot específicas para ComfyUI.

El repositorio ocupa 13 GB y se publica en formato diffusers/safetensors. No se han publicado datos de benchmarks ni especificaciones detalladas de parámetros o contexto en la información disponible; esta ficha se limita a lo documentado en la model card y los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores de destilación sobre MiniMax H3 (flow matching; transformer con atención Sol sparse en el modelo base) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible (condicionamiento por prompt de texto, primer y último fotograma) |
| Tipos de cuantizacion | FP8 W8A8 (en el pipeline de ejemplo); variantes INT8 ConvRot para ComfyUI |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (license: other) |
| Formato de pesos | safetensors (adaptadores); librería diffusers |

## Arquitectura y entrenamiento
pi-H3 no es un modelo completo, sino adaptadores que se cargan sobre el pipeline MiniMax H3 (en los ejemplos se usa `multimodalart/MiniMax-H3-Pruned`). Técnicamente combina dos piezas: pi-Flow v2, un método de destilación few-step que permite muestrear en 2 o 4 pasos con un scheduler FlowEulerODE ajustado (`shift=12.0` para vídeo, `shift=3.0` para audio, `max_raw_t` de 0.93 para 2 pasos y 0.96 para 4 pasos), y DWD (Decoding Without a Decoder), que sustituye la decodificación VAE por una cabeza lineal (`dwd_linear_head`) más un refinador de píxeles con atención de longitud variable (`dwd_pixel_refiner`) que predice los fotogramas directamente en el último paso.

El pipeline incorpora calibración de varianza espectral (`FrequencyVarianceCalibration` con bandas de frecuencia y `VarianceCalibration` para audio) y un `RGBColorEncoder` para reconstruir el color tras la decodificación DWD. El transformer del modelo base usa atención Sol sparse a partir del tercer bloque (`MiniMaxH3SolAttnProcessor`), lo que reduce el coste de atención en secuencias largas. Los adaptadores se ofrecen en cuatro variantes: 2 pasos y 4 pasos, cada una con salida DWD o con decodificador VAE, más versiones INT8 ConvRot de las DWD para ComfyUI. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades
- Generación de vídeo a partir de texto (text-to-video) con audio sincronizado.
- Generación de vídeo a partir de imagen y texto (image-to-video) con audio.
- Condicionamiento por primer fotograma y por último fotograma, además del prompt de texto.
- Generación de audio conjunta con el vídeo (pipeline `text-to-audio-video` / `image-to-audio-video`).
- Muestreo en 2 o 4 pasos de inferencia gracias a la destilación few-step.
- Decodificación sin VAE mediante DWD, que predice píxeles directamente.
- Integración con ComfyUI mediante los adaptadores INT8 ConvRot.
- Soporte de atención sparse Sol y cuantización FP8 W8A8 en el pipeline de diffusers.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso (no aplica a un modelo generativo de vídeo).

## Casos de uso
- Generación rápida de clips con audio para prototipado creativo: con 2 pasos y DWD se obtiene un vídeo de 768x1344 y 243 fotogramas (10 s a 24 fps) sin pasar por el decodificador VAE, lo que reduce el tiempo de iteración en estudios de diseño.
- Previsualización de storyboards: a partir de un primer fotograma y un prompt se generan secuencias con audio sincronizado para validar una escena antes de producirla con el modelo completo.
- Producción de vídeo publicitario de formato corto: el condicionamiento por último fotograma permite fijar el plano final y generar la transición intermedia con audio.
- Integración en ComfyUI para artistas técnicos: los adaptadores INT8 ConvRot se cargan como nodos y permiten construir flujos de trabajo de vídeo con audio sin escribir código.
- Generación de material audiovisual para entornos de simulación o datasets sintéticos: el modelo produce pares vídeo-audio etiquetados por prompt, útiles para aumentar datos de entrenamiento de modelos de percepción.
- Iteración con semilla fija y ajuste de pasos: el pipeline acepta `generator` con semilla y permite comparar 2 vs 4 pasos para equilibrar calidad y latencia en un mismo prompt.
- Demostración e investigación en destilación few-step: el código de LakonLab y el adaptador permiten reproducir el método pi-Flow v2 + DWD sobre MiniMax H3 en un entorno controlado.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- El repositorio de adaptadores ocupa 13 GB, pero el modelo base MiniMax H3 (transformer, text encoder, VAE y audio VAE) se carga aparte y domina los requisitos de memoria.
- El pipeline de ejemplo usa `torch.bfloat16` y cuantización FP8 W8A8 sobre transformer y text encoder, lo que reduce la VRAM frente a la carga en precisión completa.
- No se especifican cifras de VRAM mínima ni GPU recomendadas en la información disponible.
- La atención Sol sparse requiere instalar `lakonlab[sol]`; sin ella se usa atención densa, con mayor coste de memoria.
- Opciones de despliegue documentadas: diffusers con LakonLab v0.3 y ComfyUI (adaptadores INT8 ConvRot).
- No se documentan latencia ni throughput estimados.

## Comparativa con modelos similares
No se dispone de datos de benchmarks ni de especificaciones de parámetros en la información proporcionada para comparar con alternativas. La comparación cualitativa posible es con el propio modelo base:

| Modelo | Pasos de muestreo | Decodificación | Audio sincronizado | Licencia |
|---|---|---|---|---|
| pi-H3 (2 pasos, DWD) | 2 | DWD (sin VAE) | Sí | minimax-h3-community-license-agreement |
| pi-H3 (4 pasos, DWD) | 4 | DWD (sin VAE) | Sí | minimax-h3-community-license-agreement |
| pi-H3 (2/4 pasos, VAE) | 2 o 4 | VAE | Sí | minimax-h3-community-license-agreement |
| MiniMax H3 (base) | no disponible | VAE | Sí | minimax-h3-community-license-agreement |

## Limitaciones y advertencias
- La licencia es la MiniMax H3 Community License Agreement, no una licencia open source estándar; es necesario revisar `LICENSE.md` antes de cualquier uso comercial.
- Al ser adaptadores sobre el modelo base, heredan los sesgos y limitaciones de MiniMax H3, que no se detallan en la información disponible.
- Riesgo de alucinación visual y de audio: como modelo generativo, puede producir contenido incoherente con el prompt o artefactos en los fotogramas y en el audio.
- El condicionamiento se limita a texto, primer fotograma y último fotograma; no se documentan otras modalidades de control.
- Los adaptadores DWD requieren calibración específica (`FrequencyVarianceCalibration` con parámetros fijos) y un `RGBColorEncoder` con medias y desviaciones concretas; usar otros valores puede degradar el color y la calidad.
- Las variantes INT8 ConvRot están pensadas exclusivamente para ComfyUI; no se garantiza su funcionamiento en el pipeline de diffusers.
- La atención Sol sparse requiere dependencias adicionales y solo se aplica a partir del tercer bloque del transformer.
- No se documentan idiomas soportados ni límites de longitud de prompt.
- El número de fotogramas debe seguir la restricción del modelo base (17n + 5) a 24 fps fijos.

## Enlaces
- [Modelo en Hugging Face](https://huggingface.co/Lakonik/pi-H3)
- [Modelo base MiniMax H3](https://huggingface.co/MiniMaxAI/MiniMax-H3)
- [Blog de pi-H3](https://hanshengchen.com/blog/pi-H3/)
- [Código en LakonLab](https://github.com/Lakonik/LakonLab/blob/main/docs/piH3.md)
- [Integración con ComfyUI](https://github.com/Lakonik/ComfyUI-piFlow/blob/main/docs/piH3.md)
- [Demo en Hugging Face Spaces](https://huggingface.co/spaces/Lakonik/pi-H3)
- [DWD (Decoding Without a Decoder)](https://hanshengchen.com/dwd/)
- [Paper (arXiv:2611.22287)](https://arxiv.org/abs/2611.22287)
- [Perfil del autor](https://lakonik.github.io/)
