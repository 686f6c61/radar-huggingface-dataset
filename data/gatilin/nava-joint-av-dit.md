# gatilin/nava-joint-av-dit

## Resumen

NAVA (Native Audio-Visual Alignment) es un generador conjunto de audio y vídeo desarrollado por el equipo de investigación ERNIE de Baidu. El repositorio `gatilin/nava-joint-av-dit` no es un modelo nuevo ni un fine-tuning: es una extracción fiel (copia sin conversión, cuantización ni reentrenamiento) del checkpoint original del backbone diffusion transformer de `baidu/NAVA`, fijado a la revisión `16c20287c79c0085ebc8213ca7894701948891f0`. El objetivo declarado es preservar el componente de investigación con procedencia verificable.

El checkpoint contiene 1.052 tensores y 6.296.995.520 parámetros almacenados en FP32, todos bajo el prefijo `backbone.*`. La arquitectura es un MMDiT (multimodal diffusion transformer) con enfoque "align-then-fuse": diez bloques de doble flujo (double-stream) con proyecciones separadas para vídeo y audio, veinte bloques de flujo único (single-stream), cabezas de entrada y salida, proyecciones de texto y timestep, y condicionamiento de hablante.

Es relevante ahora porque expone el núcleo de un modelo de generación audio-vídeo sincronizada de 6,3 mil millones de parámetros bajo licencia Apache-2.0, pero con una advertencia crítica: **no es una pipeline ejecutable de extremo a extremo**. El codificador de texto UMT5, el VAE de vídeo Wan, el VAE de audio LTX, el tokenizador, el vocoder y las dependencias auxiliares no están incluidos, y cada uno tiene su propia licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer multimodal (MMDiT) con 10 bloques double-stream y 20 single-stream |
| Parametros totales | 6.296.995.520 (6,3 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 en este repositorio; el origen ofrece un checkpoint FP8 separado que no se incluye aquí |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`NAVA.safetensors`, 25.188.108.008 bytes); se incluyen `config.json` y `nava.yaml` para procedencia |

## Arquitectura y entrenamiento

El backbone es un diffusion transformer de arquitectura MMDiT con separación inicial de modalidades: diez bloques de doble flujo mantienen proyecciones independientes para vídeo y audio, y veinte bloques de flujo único fusionan ambas representaciones. El checkpoint incluye además cabezas de entrada y salida, proyecciones de texto y de timestep, y condicionamiento de hablante (speaker conditioning), lo que indica soporte de identidad vocal en la generación de audio. El nombre de configuración del repositorio oficial (`joint_5b_5d20s5d`) sugiere la estructura 5+20 bloques descrita.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. El autor de esta extracción confirma que el archivo se copió sin modificar y que no se ha reentrenado. La innovación técnica declarada por el proyecto original es el enfoque "align-then-fuse" para alineación nativa audio-vídeo, que formula la generación conjunta como un problema condicionado por contexto. El checkpoint usa implementación rotary original y, en el origen, kernel FlashAttention.

## Capacidades

- Generación conjunta de vídeo y audio sincronizado a partir de texto (text-to-video con audio nativo), según el pipeline declarado del modelo base.
- Condicionamiento de hablante (speaker conditioning) integrado en el backbone, orientado a coherencia de identidad vocal.
- Procesamiento multimodal con proyecciones separadas de audio y vídeo en los bloques de doble flujo.
- Arquitectura de difusión, no autoregresiva; no soporta por sí misma tool calling ni function calling.
- No dispone de modo de razonamiento (thinking mode), visión de entrada ni capacidades de agente.
- Capacidades multilingües: no disponible.

## Casos de uso

- Investigación en generación audio-vídeo conjunta: el checkpoint sirve como referencia reproducible para estudiar la arquitectura MMDiT "align-then-fuse" y comparar estrategias de fusión de modalidades, cargando los tensores en la implementación oficial.
- Reproducción de experimentos académicos: al estar fijado a una revisión concreta con SHA-256 verificado, permite replicar resultados sin depender de cambios en el repositorio upstream.
- Auditoría de procedencia y seguridad de modelos: el repositorio documenta verificación de hash, inspección de cabecera safetensors y una prueba numérica de humo sobre el bloque de atención 0, útil como plantilla de validación de checkpoints.
- Desarrollo de pipelines de generación de vídeo con audio para prototipado: integrado con el codificador UMT5, el VAE Wan y el VAE LTX en la implementación oficial, puede emplearse para generar clips con audio sincronizado en entornos de investigación.
- Fine-tuning sobre el backbone: al ser un checkpoint completo en FP32 con licencia Apache-2.0, es una base para adaptaciones a dominios concretos (por ejemplo, doblaje o locución sintética) siempre que se cumplan las licencias de los componentes externos.
- Docencia y formación técnica: útil para explicar el funcionamiento interno de un diffusion transformer multimodal con flujos separados y condicionamiento de hablante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única validación documentada es una prueba de humo numérica sobre 20 tensores de `double_blocks.0.self_attn`: dos tokens sintéticos de vídeo y dos de audio produjeron salidas finitas, deterministas, y modificar el audio alteró la salida de vídeo conjunta. No se probó el transformer completo ni la generación de medios de extremo a extremo, ni el kernel FlashAttention original.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en FP32 ocupa aproximadamente 25,2 GB solo en pesos; con activaciones y componentes auxiliares (UMT5, VAE Wan, VAE LTX, vocoder) el requisito total es sustancialmente mayor. No se dispone de cifras oficiales de VRAM total.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño de pesos, se requiere al menos una GPU con 32 GB o más para cargar el backbone en FP32, y más capacidad para la pipeline completa.
- Cabe en GPU de consumo: no en FP32. El origen ofrece un checkpoint FP8 separado que no está incluido en este repositorio y que reduciría el requisito de memoria, aunque seguiría necesitando los componentes auxiliares.
- Opciones de despliegue: la implementación oficial es el repositorio `ernie-research/NAVA`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gatilin/nava-joint-av-dit (este) | 6,3 B | no disponible | Audio + vídeo (backbone) | Apache-2.0 | Pesos en HF; pipeline no incluida |
| baidu/NAVA | 6,3 B | no disponible | Audio + vídeo | Apache-2.0 | Modelo completo con card oficial |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- **No es una pipeline ejecutable**: faltan el codificador de texto UMT5, el VAE de vídeo Wan, el VAE de audio LTX, tokenizador, vocoder y modelos auxiliares. No se puede asumir que este checkpoint por sí solo produzca audio o vídeo.
- **Licencias de componentes**: aunque el checkpoint es Apache-2.0, los componentes externos tienen licencias propias que deben respetarse por separado.
- **Verificación parcial**: el archivo se copió en servidor de Hugging Face y se comprobó SHA-256 y tamaño contra el origen, pero no se descargó ni rehasheó localmente en su totalidad. La prueba numérica cubre solo un submódulo de atención.
- **Riesgo de alucinación y sesgos**: no documentados en la información disponible; al ser un modelo generativo de medios, existe riesgo inherente de contenido no fiel al prompt.
- **Idiomas y contexto**: no disponibles; no se puede garantizar cobertura multilingüe.
- **Uso comercial**: la licencia Apache-2.0 lo permite para el checkpoint, pero la viabilidad comercial depende de las licencias de los componentes auxiliares y de las políticas de uso del modelo base.
- **Mantenimiento**: repositorio con 0 descargas y 0 likes; es una extracción de investigación, no un artefacto con soporte.

## Enlaces

- Repositorio de este checkpoint: https://huggingface.co/gatilin/nava-joint-av-dit
- Modelo base: https://huggingface.co/baidu/NAVA
- Implementación oficial (GitHub): https://github.com/ernie-research/NAVA
- Repositorio alternativo en GitHub: https://github.com/Ardynai/nava
- Página del proyecto: https://ernie-research.github.io/NAVA/
- Configuración del DiT: https://github.com/ernie-research/NAVA/blob/main/nava_src/models/nava/configs/model/dit/joint_5b_5d20s5d.json
- Colección del autor: https://huggingface.co/collections/gatilin/model-portfolio
