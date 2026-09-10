# lukasz-staniszewski/audioldm2-caa-piano

## Resumen

`lukasz-staniszewski/audioldm2-caa-piano` no es un modelo generativo completo, sino un conjunto de vectores de steering calculados mediante adición contrastiva de activaciones (CAA, contrastive activation addition) para inducir el concepto «piano» en el modelo de difusión texto-a-audio AudioLDM2. El artefacto se apoya en `cvssp/audioldm2-large` y se carga con la librería `audio-interv` mediante `AudioLDMCAASteeringController.from_pretrained`, que permite inyectar la dirección de activación en 64 módulos de cross-attention (`attn2`) distribuidos por los bloques down, mid y up del UNet.

Lo desarrolla el usuario de Hugging Face lukasz-staniszewski y está asociado al artículo «TADA! Tuning Audio Diffusion Models through Activation Steering» (arXiv 2602.11910). La relevancia es metodológica: demuestra que es posible modificar el comportamiento semántico de un modelo de difusión de audio en inferencia, sin reentrenar ni ajustar pesos, controlando la intensidad del efecto con un único hiperparámetro (`alpha`, 1.0 en el ejemplo publicado) y normalizando previamente el vector de steering (`normalize_sv: true`).

El repositorio ocupa 2,3 GB y acumula 10 descargas y 0 likes en el momento de la consulta, por lo que se trata de un artefacto de investigación con validación comunitaria muy limitada. El autor no publica licencia, idiomas soportados ni métricas de calidad de audio, lo que condiciona su uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vectores de steering (CAA) sobre el UNet de difusión latente de AudioLDM2; intervención en módulos de cross-attention (`attn2`) |
| Parámetros totales | No disponible (el repositorio ocupa 2,3 GB y contiene únicamente los vectores de steering, no el modelo base) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en sentido textual; la configuración publicada genera audio de 10,0 s por clip (`audio_length_in_s: 10.0`) |
| Tipos de cuantización | No disponible; el vector y la inferencia se ejecutan en `float16` según la configuración de generación |
| Idiomas soportados | No disponible; los prompts del quickstart están en inglés |
| Licencia | No disponible |
| Formato de pesos | No disponible; la carga se realiza con `AudioLDMCAASteeringController.from_pretrained()` de la librería `audio-interv` |
| Modelo base | `cvssp/audioldm2-large` |
| Método declarado | `standard_caa_audioldm` |
| Concepto | `piano` |
| Capas intervenidas | 64 entradas en `layers_to_steer` (recuento a partir de la lista publicada), con `layers_preset: "all"` |
| Normalización del vector | `normalize_sv: true` |
| Configuración de inferencia | 100 pasos, `guidance_scale` 4,5, semilla 10, `dtype` float16, `save_all_cfg_passes: true` |
| Librería | `audio-interv` |
| Tamaño del repositorio | 2,3 GB |
| Descargas / likes | 10 / 0 |
| Fechas | Creado el 21-05-2026; actualizado el 10-09-2026 |

## Arquitectura y entrenamiento

El artefacto no entrena una red nueva: calcula una dirección en el espacio de activaciones de AudioLDM2 mediante adición contrastiva de activaciones. La intervención se aplica sobre las proyecciones de cross-attention (`attn2`) que conectan la condición textual con el UNet de difusión latente, es decir, sobre el punto donde el prompt influye en el proceso de denoising. La configuración publicada enumera 64 módulos concretos que cubren los bloques `down_blocks.1`, `down_blocks.2`, `down_blocks.3`, `mid_block` y los tres bloques de subida (`up_blocks.0`, `up_blocks.1`, `up_blocks.2`), con dos `transformer_blocks` por módulo de atención.

No se especifican en la información disponible ni el número de tokens de audio empleado, ni la composición del dataset contrastivo, ni si hubo optimización adicional (RLHF, DPO o similares), ni el procedimiento exacto de extracción del vector. La innovación destacable es metodológica: el control del concepto se ejerce en tiempo de inferencia mediante un coeficiente escalar (`alpha`), con normalización previa del vector, lo que permite modular la presencia de «piano» sin alterar los pesos del modelo base ni requerir un adaptador entrenado.

## Capacidades

- Generación de audio texto-a-audio con sesgo inducido hacia el timbre y las características espectrales del piano, partiendo del prompt que se proporcione.
- Control de intensidad del concepto mediante el parámetro `alpha` (1.0 en el ejemplo oficial), lo que permite explorar desde un efecto sutil hasta una imposición fuerte del concepto.
- Intervención selectiva por capas: el campo `layers_to_steer` permite limitar el steering a subconjuntos concretos de módulos de cross-attention en lugar de aplicar el preset completo.
- Compatibilidad con la configuración de difusión del modelo base: pasos de inferencia, `guidance_scale`, duración del audio en segundos y semilla.
- Guardado de todas las pasadas de classifier-free guidance (`save_all_cfg_passes: true`), útil para analizar por separado las ramas condicionada y no condicionada.
- No dispone de tool calling, function calling ni capacidades de agente: es un artefacto de control sobre un modelo de difusión, no un modelo de lenguaje.
- No se documentan capacidades multilingües, de visión, de audio de entrada (speech-to-text) ni modos de razonamiento.

## Casos de uso

- Investigación en interpretabilidad de modelos de audio: aplicar el vector capa a capa y medir en qué módulos la dirección de activación produce el cambio tímbrico esperado, para localizar dónde se representa el concepto «piano» en el UNet.
- Curvas de dosis-respuesta con `alpha`: barrido sistemático del coeficiente para caracterizar a partir de qué valor aparecen artefactos o se degrada la fidelidad del audio, un experimento habitual en trabajos de activation steering.
- Generación de música con piano cuando el prompt no basta: usar el steering como refuerzo cuando la descripción textual («instrumental music» en el ejemplo) no garantiza la presencia del instrumento.
- Aumento de datos etiquetados: generar clips con presencia inducida de piano para alimentar clasificadores de instrumentos o sistemas de etiquetado automático, siempre que se asuma el sesgo introducido.
- Maquetas y prototipado musical: producir rápidamente fragmentos de 10 s con piano para validar ideas de arreglo antes de una grabación real, con 100 pasos de difusión por clip.
- Sonido para vídeo y cortinillas: generar fondos instrumentales con un timbre consistente entre clips manteniendo la misma semilla y el mismo `alpha`, útil para mantener coherencia auditiva en una secuencia.
- Comparativa metodológica interna: enfrentar CAA frente a prompt engineering, negative prompting o un LoRA específico de instrumento, usando el mismo modelo base para aislar el efecto del método de control.
- Reproducción de experimentos del artículo TADA!: servir como punto de partida para replicar los resultados del paper con el preset de capas ya publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas objetivas (FAD, KL, CLAP score, precisión de clasificador de instrumento) ni comparaciones cuantitativas con el modelo base sin steering o con otras técnicas de control. Tampoco se proporcionan curvas de calidad en función de `alpha`, ni ejemplos de audio de referencia en la información disponible.

## Requisitos de hardware

- VRAM estimada: no publicada por el autor. Por la configuración (AudioLDM2-large, `float16`, clips de 10 s, 100 pasos de difusión) es razonable esperar un consumo del orden de 8-12 GB, pero se trata de una estimación propia y no confirmada.
- GPU recomendadas: no especificadas. Cualquier GPU con soporte CUDA y suficiente VRAM para el modelo base; una RTX 4090 o RTX 3090 (24 GB) debería ejecutar la configuración publicada con holgura.
- GPU de centro de datos: A100 o H100 no son necesarias para un único clip de 10 s, pero aceleran el barrido de configuraciones (`alpha`, semilla, pasos).
- Cabe en GPU de consumo: probablemente sí en gamas de 12-16 GB si se reduce la duración del audio o los pasos de inferencia; no confirmado por el autor.
- Opciones de despliegue: la vía documentada es la librería `audio-interv` (`SteerableAudioLDMModel` más `AudioLDMCAASteeringController`) sobre `diffusers` y PyTorch, con `device="cuda"`. No aplican vLLM, TGI, llama.cpp ni Ollama, al no tratarse de un modelo de lenguaje.
- Latencia y throughput: no disponibles. Cada clip de 10 s requiere 100 pasos de difusión, y `save_all_cfg_passes: true` incrementa el uso de memoria al conservar las pasadas de classifier-free guidance.

## Comparativa con modelos similares

| Modelo o enfoque | Tipo | Parámetros | Duración por defecto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| audioldm2-caa-piano | Vectores de steering CAA sobre AudioLDM2 | No disponible (repo de 2,3 GB) | 10 s en la configuración publicada | No disponible | No disponible | Hugging Face, 10 descargas, 0 likes |
| cvssp/audioldm2-large | Modelo base de difusión texto-a-audio | No disponible en la información proporcionada | No disponible | Consultar la model card del modelo base | Consultar el modelo base | Hugging Face |
| Prompt engineering sobre AudioLDM2 | Control sin pesos adicionales | 0 parámetros añadidos | Igual que el modelo base | No disponible | No aplica | Inmediata |
| Negative prompting sobre AudioLDM2 | Control mediante prompt negativo | 0 parámetros añadidos | Igual que el modelo base | No disponible | No aplica | Inmediata |
| LoRA o fine-tuning específico de instrumento | Adaptador entrenado | No disponible | Igual que el modelo base | No disponible | Depende del dataset y del autor | Requiere entrenamiento y publicación |

No se dispone de datos comparativos de calidad de audio entre estas alternativas en la información proporcionada, por lo que la comparación es estructural y no de rendimiento.

## Limitaciones y advertencias

- Licencia no especificada: sin licencia explícita no puede asumirse permiso para uso comercial; hay que contactar con el autor o consultar el repositorio antes de integrarlo en un producto.
- Sesgos conocidos: no documentados. El vector está calculado para un único concepto («piano») y su efecto sobre otros conceptos, géneros o instrumentos no está medido.
- Riesgo de artefactos: en técnicas de activation steering, valores altos de `alpha` suelen degradar la fidelidad del audio; el autor no publica umbrales seguros ni estudios de degradación.
- Especificidad del concepto: el artefacto no añade capacidades nuevas de generación, solo sesga la salida del modelo base; cualquier limitación de AudioLDM2 (duración máxima, calidad, cobertura lingüística) se hereda.
- Idiomas no declarados: los ejemplos usan prompts en inglés; no hay evidencia de comportamiento con prompts en castellano.
- Dependencia de la librería `audio-interv`: la carga se realiza con clases propias (`SteerableAudioLDMModel`, `AudioLDMCAASteeringController`) cuyo versionado, mantenimiento y compatibilidad con versiones de `diffusers` o PyTorch no se detallan.
- Número de capas elevado: intervenir 64 módulos de cross-attention multiplica el coste de memoria y cómputo frente a una inferencia estándar.
- Validación comunitaria mínima: 10 descargas y 0 likes, sin demos, sin ejemplos de audio publicados y sin resultados de benchmarks.
- Alucinación en sentido audio: no aplica el concepto de alucinación textual, pero el steering puede producir resultados que no se correspondan con el prompt en favor del concepto inducido.
- Uso previsto: artefacto de investigación en interpretabilidad, no una herramienta de generación musical lista para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lukasz-staniszewski/audioldm2-caa-piano
- Artículo (TADA! Tuning Audio Diffusion Models through Activation Steering): https://huggingface.co/papers/2602.11910
- Modelo base: https://huggingface.co/cvssp/audioldm2-large
- Repositorio o documentación de la librería `audio-interv`: no disponible en la información proporcionada
- Demo o ejemplos de audio: no disponible en la información proporcionada
