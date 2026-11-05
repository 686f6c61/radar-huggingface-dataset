# shirayukikun/sumi-7b-sft-torchtitan-instant-beta

## Resumen

Sumi-7B SFT Torchtitan Instant Beta es un ajuste fino supervisado (SFT) del modelo base tohoku-nlp/sumi-7b, publicado por el usuario shirayukikun en HuggingFace. Se trata de un modelo de aproximadamente 7.767 millones de parámetros (7,77 mil millones) orientado a generación de texto conversacional, con una peculiaridad técnica notable: los tags del repositorio indican que emplea técnicas de difusión discreta (discrete diffusion, uniform diffusion, block diffusion) en lugar de la generación autorregresiva convencional, además de incluir capacidades de mask-generation.

El modelo se distribuye con pesos en safetensors y requiere código personalizado (`custom_code`), lo que implica que no funciona con un `AutoModelForCausalLM` estándar sin cargar módulos adicionales del repositorio. Está publicado bajo licencia Apache 2.0, aunque el acceso está restringido (gated): es necesario aceptar condiciones en HuggingFace antes de descargarlo. El repositorio ocupa 15,5 GB.

La relevancia de esta ficha es limitada pero real: se trata de una variante experimental ("instant beta") de un modelo japonés de 7B con un paradigma de generación poco habitual (difusión aplicada a texto), lo que lo convierte en un objeto de interés para investigación en métodos alternativos a la decodificación autorregresiva. No obstante, la ausencia de documentación, benchmarks, idiomas declarados y el hecho de tener 0 descargas y 0 likes en el momento de la consulta obligan a tratar cualquier uso en producción con extrema cautela.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible con detalle; los tags indican difusión discreta (discrete diffusion, uniform diffusion, block diffusion) sobre un transformer base |
| Parámetros totales | 7.767.543.808 (≈7,77 mil millones) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible (el modelo base tohoku-nlp/sumi-7b sugiere orientación al japonés, pero no se confirma en la ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `custom_code` requerido) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de los tags del repositorio. El modelo base es tohoku-nlp/sumi-7b, y esta variante se presenta como un ajuste fino supervisado (SFT) realizado presumiblemente con la librería Torchtitan (el nombre del repositorio incluye "torchtitan"). Los tags `diffusion`, `discrete-diffusion`, `uniform-diffusion` y `block-diffusion` apuntan a un paradigma de generación por difusión sobre tokens discretos, en el que el modelo aprende a denoizar secuencias de tokens en lugar de predecir el siguiente token de forma autorregresiva. El tag `mask-generation` sugiere además que el modelo puede operar con enmascaramiento de tokens durante la generación.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de SFT, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal. El sufijo "instant-beta" y la referencia a un arXiv (2606.19005, que por su numeración no corresponde a un identificador real verificable) indican que se trata de una publicación experimental sin validación externa conocida.

## Capacidades

- Generación de texto conversacional (pipeline declarado: `text-generation`, tag `conversational`).
- Generación mediante difusión discreta de tokens (paradigma no autorregresivo), según los tags del repositorio.
- Capacidad de mask-generation, es decir, generación condicionada por enmascaramiento de posiciones.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación en generación por difusión de texto: el modelo sirve como banco de pruebas para comparar decodificación autorregresiva frente a difusión discreta en tareas de generación condicionada, gracias a sus pesos abiertos y licencia Apache 2.0.
- Experimentación con mask-generation: útil para estudiar infilling y reconstrucción de secuencias enmascaradas, un régimen en el que los modelos de difusión tienen ventajas estructurales frente a los autorregresivos.
- Ajuste fino posterior (fine-tuning) sobre el checkpoint SFT: al estar en safetensors y con licencia permisiva, puede servir de punto de partida para SFT adicional en dominios concretos, siempre que se resuelva la carga del `custom_code`.
- Reproducción de pipelines Torchtitan: el nombre del repositorio sugiere que el checkpoint se entrenó con Torchtitan, por lo que es adecuado para validar flujos de entrenamiento distribuido con esa librería.
- Evaluación comparativa de modelos japoneses de 7B: dado que el modelo base es de tohoku-nlp, puede emplearse en estudios comparativos de calidad en japonés frente a otros 7B, aunque los idiomas no estén declarados oficialmente.
- Docencia y demostraciones de paradigmas alternativos: por su tamaño (7,77B) y su naturaleza experimental, es manejable en entornos académicos con una sola GPU de 80 GB para demostrar generación no autorregresiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15,5 GB solo para pesos, más overhead de activaciones y del código personalizado; en la práctica, se recomienda al menos 24 GB para comodidad.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB (no se publican cuantizaciones oficiales, por lo que requeriría cuantización manual).
- VRAM estimada en cuantización de 4 bits: alrededor de 5-6 GB, de nuevo con cuantización manual no documentada.
- GPU recomendadas: A100 40/80 GB o H100 para FP16 sin cuantizar; RTX 4090 (24 GB) para FP16 con margen ajustado o cuantización; RTX 3090 (24 GB) similar.
- ¿Cabe en consumer GPU? Sí, en GPUs de 24 GB en FP16 (ajustado) y en GPUs de 12-16 GB si se cuantiza manualmente, aunque la falta de cuantizaciones oficiales y el `custom_code` complican el proceso.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al requerir `custom_code` y un paradigma de difusión, es probable que solo funcione con `transformers` y `trust_remote_code=True`, y posiblemente con Torchtitan.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Paradigma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sumi-7b-sft-torchtitan-instant-beta | 7,77B | No disponible | Difusión discreta (según tags) | Apache 2.0 | Gated en HF, 0 descargas |
| tohoku-nlp/sumi-7b (base) | ≈7B | No disponible | No disponible | No disponible en esta ficha | Público en HF |
| Modelos autorregresivos 7B (p. ej. Mistral-7B, Llama-3-8B) | 7-8B | 8K-128K típicamente | Autorregresivo | Apache 2.0 / Llama license | Ampliamente disponibles |

La comparación con alternativas autorregresivas de 7-8B es pertinente por tamaño, pero no se dispone de datos de rendimiento del modelo para establecer una comparación cuantitativa. La principal diferencia cualitativa es el paradigma de difusión, que lo aleja del ecosistema estándar de inferencia (vLLM, llama.cpp) y lo acerca a la investigación.

## Limitaciones y advertencias

- Modelo experimental ("instant-beta") con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace antes de la descarga, lo que puede limitar la reproducibilidad.
- Requiere `custom_code` y `trust_remote_code=True`: implica ejecutar código del autor del repositorio, con el riesgo de seguridad asociado.
- Idiomas no declarados: no se puede garantizar calidad en castellano ni en ningún otro idioma concreto.
- Sin benchmarks publicados: imposible estimar calidad en MMLU, HumanEval, GSM8K u otras tareas estándar.
- Riesgo de alucinación: no evaluado; en modelos de difusión de texto la coherencia a larga distancia puede diferir de la autorregresiva y no está caracterizada aquí.
- Licencia Apache 2.0: permite uso comercial, pero al ser un fine-tune de tohoku-nlp/sumi-7b conviene verificar la licencia del modelo base antes de explotación comercial.
- El identificador arXiv 2606.19005 no corresponde a un paper verificable en el momento de redactar esta ficha; no debe citarse como referencia validada.
- Sin soporte documentado en motores de inferencia estándar: el despliegue en producción requeriría trabajo de integración no trivial.

## Enlaces

- HuggingFace: https://huggingface.co/shirayukikun/sumi-7b-sft-torchtitan-instant-beta
- Modelo base: https://huggingface.co/tohoku-nlp/sumi-7b
- Paper referenciado en tags (no verificado): arxiv:2606.19005
- Torchtitan (librería de entrenamiento mencionada en el nombre): no se proporciona enlace en la información disponible.
