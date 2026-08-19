# Qualcomm-AI-Research/disco

## Resumen

DisCO (Diversity Constraints via GRPO) es un adaptador LoRA desarrollado por Qualcomm AI Research que se aplica sobre el modelo de generación de imágenes FLUX.1-dev de Black Forest Labs. Su objetivo es resolver un problema conocido en los modelos texto-a-imagen: la tendencia a generar rostros duplicados, identidades fusionadas o un conteo incorrecto de personas en escenas con múltiples individuos. El adaptador se entrena mediante aprendizaje por refuerzo con una variante de GRPO adaptada a modelos de flujo (Flow-GRPO), optimizando una función de recompensa compuesta que penaliza la similitud facial, evita la repetición de identidades, garantiza un conteo preciso de personas y preserva la calidad de la imagen.

El modelo se publica como un adaptador PEFT de 0,4 GB que se integra directamente en el pipeline de Diffusers, sin necesidad de datos de entrenamiento externos. Según el resumen del artículo, alcanza una precisión de aproximadamente el 98,6 % en la generación de rostros únicos, superando a competidores tanto de código abierto como propietarios. Su relevancia actual radica en que aborda una limitación crítica de los generadores de imágenes modernos, especialmente en aplicaciones que requieren representaciones diversas y realistas de grupos de personas, como publicidad, diseño editorial o creación de contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre FLUX.1-dev (transformador flow-matching) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base FLUX.1-dev tiene ~12 B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No aplica (modelo de generacion de imagenes) |
| Tipos de cuantizacion | bf16 (pesos del adaptador en safetensors) |
| Idiomas soportados | Ingles (prompts en ingles; el modelo base FLUX.1-dev soporta mas idiomas) |
| Licencia | other (no especificada; se indica uso para investigacion y demostracion) |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

DisCO es un adaptador LoRA de rango 64 y alpha 128, con dropout 0, que se aplica a 12 módulos del transformer de FLUX.1-dev: todas las proyecciones de atención (to_q, to_k, to_v, to_out, add_q_proj, add_k_proj, add_v_proj, add_to_out) y las capas feed-forward (ff.net.0.proj, ff.net.2, ff_context.net.0.proj, ff_context.net.2). El entrenamiento se realiza con Flow-GRPO, una adaptación del algoritmo Group Relative Policy Optimization (GRPO) para modelos de flujo, que optimiza el adaptador mediante una función de recompensa compuesta calculada en tiempo de inferencia, sin necesidad de datos de entrenamiento etiquetados.

La función de recompensa incluye cuatro componentes: penalización por similitud facial intra-imagen usando embeddings ArcFace, diversidad de identidad a nivel de lote (comparando muestras cruzadas), precisión en el conteo de personas (verificando que el número de cabezas coincida con el prompt) y calidad de imagen medida con HPS v3. El entrenamiento se realizó en precisión mixta bf16 con 7 GPUs. Esta combinación de recompensas permite que el modelo aprenda a generar rostros distintos y bien contados sin depender de conjuntos de datos externos, lo que lo hace escalable y reproducible.

## Capacidades

- Generacion de imagenes texto-a-imagen con rostros facialmente distintos en escenas con multiples personas.
- Correccion del conteo de personas: genera el numero exacto de individuos indicado en el prompt.
- Reduccion de identidades fusionadas o duplicadas, un problema comun en modelos base como FLUX.1-dev.
- Mantenimiento de la calidad visual general gracias al componente de recompensa HPS v3.
- Integracion directa con Diffusers y PEFT, permitiendo fusionar el adaptador con el modelo base para inferencia estandar.
- Compatible con el pipeline de FLUX.1-dev, incluyendo generacion a resoluciones de hasta 1024x1024 con 28 pasos de inferencia.

## Casos de uso

- Publicidad y marketing: generar imagenes de grupos de personas diversos y realistas para campanas que requieren representacion etnica variada sin duplicados visuales.
- Diseno editorial: ilustrar articulos o portadas con escenas de multitudes donde cada individuo sea claramente distinguible.
- Creacion de contenido para redes sociales: producir imagenes de eventos o reuniones con multiples personas, manteniendo identidades unicas.
- Prototipado de personajes para videojuegos o animacion: generar variaciones de personajes en una misma escena sin que se confundan entre si.
- Investigacion en vision por computador: generar datasets sinteticos de grupos de personas con identidades controladas para entrenar modelos de deteccion o reconocimiento facial.
- Demostraciones y evaluacion de modelos T2I: comparar la capacidad de diversidad facial frente a otros generadores, como se muestra en el repositorio con el modo `--compare`.

## Benchmarks y rendimiento

El abstract del articulo reporta una precision de aproximadamente el 98,6 % en la generacion de rostros unicos (unique-face accuracy) en su benchmark de evaluacion, superando a competidores de codigo abierto y propietarios. No se proporcionan en la informacion disponible tablas detalladas con resultados de MMLU, HumanEval u otros benchmarks tipicos de modelos de lenguaje, ya que se trata de un modelo de generacion de imagenes. Los datos cuantitativos adicionales (como FID, CLIP score, etc.) no estan disponibles en la model card.

## Requisitos de hardware

- GPU recomendada: NVIDIA A100 de 40 GB o equivalente con al menos 40 GB de VRAM.
- CUDA 12.4, Python 3.11, PyTorch 2.6.0 (segun el entorno de entrenamiento).
- El adaptador LoRA es ligero (0,4 GB), pero el modelo base FLUX.1-dev requiere una GPU con suficiente memoria para inferencia; se puede ejecutar en GPUs consumer de gama alta (RTX 3090/4090 con 24 GB) usando cuantizacion del modelo base, aunque no se indica en la documentacion.
- Despliegue: se integra con Diffusers y PEFT; tambien se proporciona un script de inferencia y una demo Gradio en el repositorio oficial.
- Latencia y throughput: no disponibles; dependen del hardware y de la configuracion de pasos (28 pasos recomendados).

## Comparativa con modelos similares

No se dispone de una comparativa detallada con otros adaptadores o metodos especificos de diversidad facial en generacion de imagenes dentro de la informacion proporcionada. El articulo menciona que supera a competidores open-source y propietarios, pero no se listan nombres ni metricas concretas. Se puede considerar comparable a otros LoRA de FLUX.1-dev orientados a estilos o dominios especificos, aunque DisCO se distingue por su enfoque en identidades multiples y su entrenamiento por RL sin datos externos.

## Limitaciones y advertencias

- Los pesos publicados no son identicos a los del modelo reportado en el articulo; el autor indica que se proporcionan solo para investigacion y demostracion, y el rendimiento puede variar.
- La licencia es "other" y no se especifica si permite uso comercial; se recomienda contactar con Qualcomm AI Research antes de usarlo en produccion.
- El adaptador esta disenado para prompts en ingles y escenas con multiples personas; su comportamiento fuera de ese dominio no esta validado.
- No se proporcionan datos sobre sesgos etnicos o de genero; la diversidad se mide en terminos de unicidad facial, no de representacion equitativa.
- El modelo base FLUX.1-dev tiene su propia licencia (non-commercial para el dev), lo que puede restringir el uso del adaptador en aplicaciones comerciales.
- No se garantiza la precision en conteos muy altos de personas (mas de seis) ni en condiciones de oclusion extrema.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Qualcomm-AI-Research/disco
- Articulo arXiv: https://arxiv.org/abs/2510.01399
- Pagina del proyecto: https://qualcomm-ai-research.github.io/disco/
- Repositorio GitHub: https://github.com/Qualcomm-AI-research/disco
- Modelo base FLUX.1-dev: https://huggingface.co/black-forest-labs/FLUX.1-dev
