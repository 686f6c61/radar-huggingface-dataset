# brainworkup/Qwen3.8-27B-Ultimate-Heretic-Uncensored-oQ4e-mtp

## Resumen

Qwen3.8-27B-Ultimate-Heretic-Uncensored-oQ4e-mtp es una cuantización de precisión mixta del modelo Qwen3.8-27B, publicada por el usuario brainworkup en Hugging Face. El checkpoint está empaquetado en formato MLX, lo que lo orienta a la inferencia en hardware Apple Silicon (chips M-series) mediante el framework MLX de Apple. El modelo base pertenece a la familia Qwen3.5, según la etiqueta `qwen3_5` del repositorio, e incorpora una cabeza MTP (multi-token prediction) de 0,425B parámetros, además de un codificador visual de 0,461B parámetros.

La relevancia de esta ficha es doble. Por un lado, ilustra una técnica de cuantización mixta (oQ, de oMLX) que asigna distintos anchos de bit por tensor según su sensibilidad, logrando un promedio efectivo de 5,044 bits por peso con un tamaño en disco de 17,5 GB. Por otro, su etiqueta "Heretic-Uncensored" indica que se ha aplicado algún tipo de modificación orientada a eliminar rechazos o alineamiento de seguridad, lo que exige precaución adicional en entornos de producción.

No obstante, la información disponible es muy limitada: la model card solo documenta la distribución de bits y el desglose de almacenamiento, sin detallar datos de entrenamiento, benchmarks, licencia ni idiomas. Todo dato no presente en la información proporcionada se marca como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con cabeza MTP y codificador visual (familia Qwen3.5); detalles no disponibles |
| Parametros totales | 27.781.427.952 (27,781B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización mixta oQ (oMLX v0.8.0rc1): affine 4/5/6/8-bit con grupo 64 y BF16; media efectiva 5,044 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (librería `mlx`), cuantización `oq` |

## Arquitectura y entrenamiento

El checkpoint deriva de un modelo base de la familia Qwen3.5 con arquitectura transformer, al que se añaden dos componentes diferenciados según el desglose de almacenamiento: un codificador visual de 0,461B parámetros (0,921 GB) y una cabeza MTP de 0,425B parámetros (0,323 GB). El modelo de lenguaje propiamente dicho concentra 26,896B parámetros en 15,155 GiB. La presencia del codificador visual sugiere capacidades multimodales de entrada de imagen, aunque la model card no lo confirma explícitamente.

La innovación técnica documentada es la cuantización mixta oQ de oMLX: el 69,807% de los pesos lógicos (19,393B) se almacenan en affine 4-bit, el 23,680% (6,579B) en 5-bit, el 4,615% (1,282B) en 6-bit, el 0,041% (0,011B) en 8-bit y el 1,857% (0,516B) se mantienen en BF16. Esta asignación selectiva busca preservar la precisión en las capas más sensibles mientras reduce el tamaño total. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La etiqueta "Heretic-Uncensored" sugiere una modificación posterior al entrenamiento orientada a reducir los rechazos del modelo, pero el autor no documenta el método.

## Capacidades

- Generación de texto y razonamiento: capacidades inferidas del modelo base Qwen3.5, sin confirmación documentada en la model card.
- Procesamiento de visión: el checkpoint incluye un codificador visual de 0,461B parámetros, lo que apunta a entrada de imágenes, aunque no se detalla el pipeline.
- Predicción multi-token (MTP): la cabeza dedicada de 0,425B parámetros permite decodificación especulativa o generación de varios tokens por paso, lo que puede mejorar el throughput.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo "uncensored": la nomenclatura indica que se han relajado los filtros de rechazo, pero el alcance exacto no está documentado.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y el tamaño de 17,5 GB permiten ejecutar el modelo en Macs con memoria unificada de 24 GB o superior, usando el framework MLX. Es el caso de uso principal que justifica esta publicación.
- Prototipado de asistentes multimodales en local: gracias al codificador visual incluido, se puede experimentar con entrada de imagen y texto en un equipo de sobremesa sin GPU dedicada, siempre que se valide el comportamiento real del pipeline.
- Aceleración de generación con MTP: la cabeza de predicción multi-token puede aprovecharse para decodificación especulativa en MLX, reduciendo la latencia por token en tareas de generación larga.
- Investigación sobre cuantización mixta: el checkpoint sirve como referencia para estudiar el impacto de asignar 4, 5, 6 y 8 bits por tensor en la calidad final, comparándolo con cuantizaciones uniformes de 4 bits.
- Evaluación de modelos "uncensored": útil para investigadores que analizan diferencias de comportamiento entre un modelo alineado y su variante sin filtros, con las salvaguardas éticas correspondientes.
- Fine-tuning ligero o adaptación con LoRA: el tamaño contenido y el formato safetensors permiten cargar el modelo en MLX para experimentos de adaptación, aunque la cuantización puede limitar la fusión directa de adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repo ocupa 17,5 GB en disco; en inferencia se necesita al menos esa cantidad más overhead de activaciones y caché KV, por lo que se recomienda un mínimo de 24 GB de memoria unificada.
- GPU recomendadas: el formato MLX está diseñado para Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No es compatible de forma nativa con CUDA.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí: Macs con 24 GB o más de memoria unificada. En GPUs NVIDIA de consumo (RTX 4090 con 24 GB) requeriría conversión previa a otro formato, no documentada por el autor.
- Opciones de despliegue: MLX (librería `mlx`), oMLX para la cuantización. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Ultimate-Heretic-Uncensored-oQ4e-mtp | 27,781B | no disponible | MLX safetensors (oQ) | no disponible | Hugging Face (0 descargas) |
| Qwen3.5-27B (base, referencia) | ~27B | no disponible | safetensors | no disponible | no disponible en la información |
| Cuantizaciones GGUF Q4_K_M de modelos ~27B | ~27B | depende del base | GGUF | depende del base | ecosistema llama.cpp |

La comparativa con alternativas concretas no está disponible en la información proporcionada; solo se puede contrastar con el modelo base del que deriva y con el formato de cuantización.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; es un riesgo legal relevante para producción.
- Etiqueta "Uncensored": indica reducción o eliminación de filtros de seguridad, con mayor probabilidad de generar contenido dañino, sesgado o inapropiado. No apto para aplicaciones orientadas al público sin moderación adicional.
- Sin benchmarks publicados: no hay evidencia cuantitativa de la degradación de calidad introducida por la cuantización mixta respecto al modelo base.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria y el soporte.
- Compatibilidad restringida: el formato MLX limita el despliegue a hardware Apple; no hay conversión documentada a GGUF, vLLM ni otros runtimes.
- Idiomas y contexto no documentados: no se puede garantizar el comportamiento multilingüe ni la ventana de contexto real.
- Riesgo de alucinación: inherente a los modelos generativos; sin datos de evaluación no se puede acotar.
- Procedencia del modelo base incierta: la etiqueta `qwen3_5` y el nombre "Qwen3.8" no se corresponden con una versión oficial conocida, por lo que conviene verificar el origen antes de confiar en el checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/brainworkup/Qwen3.8-27B-Ultimate-Heretic-Uncensored-oQ4e-mtp
- Repositorio de oQ / oMLX citado en la model card: https://github.com/jundot/omlx
