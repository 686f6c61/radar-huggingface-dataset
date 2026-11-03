# ducvh5/wan21-a5b5x4c5-tf-fm-tm-ln3-qt

## Resumen

`ducvh5/wan21-a5b5x4c5-tf-fm-tm-ln3-qt` es un ajuste fino (finetune) del modelo de generacion de video texto-a-video Wan2.1-T2V-1.3B de Alibaba, publicado por el usuario ducvh5 en Hugging Face. Se distribuye en formato diffusers con pesos safetensors y ocupa 60,7 GB en el repositorio, lo que refleja que incluye los 19 checkpoints EMA y no-EMA retenidos durante el entrenamiento, ademas del estado final `step0015000/state.pt`. El modelo hereda la arquitectura del Wan2.1 de 1.300 millones de parametros, un transformer de difusion para generacion de video a partir de descripciones textuales.

La particularidad de este checkpoint es su configuracion experimental: el autor describe una estructura de bloques "A5 → B5×4 → C5" con 15 bloques unicos y 30 ejecutados, lo que sugiere una reorganizacion del grafo de atencion con reutilizacion de bloques (etiquetada como "recurrent-transformer" en los tags). El entrenamiento combina tres funciones de perdida (TF, FM y TM) y emplea un schedule de ruido con sigma muestreada de una lognormal estandar, shift de 3 y t = 1000·sigma. Los datos de entrenamiento se etiquetan como "OV" con captions QT en proporcion 50/50 entre VB y full, terminologia propia del autor que no se detalla en la model card.

Es relevante ahora porque explora variantes de eficiencia estructural sobre un modelo base abierto de generacion de video, un area donde la mayoria de los checkpoints publicos se limitan a ajustes de estilo sin modificar el grafo de computo. No obstante, la ausencia de documentacion detallada, benchmarks y licencia explicita limita su adopcion en produccion sin una evaluacion previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para texto-a-video (derivado de Wan2.1-T2V-1.3B); estructura de bloques A5 → B5×4 → C5 con reutilizacion (recurrent-transformer) |
| Parametros totales | 1.300 millones (heredados del modelo base Wan2.1-T2V-1.3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato diffusers) |
| Tamano del repositorio | 60,7 GB (incluye 19 checkpoints EMA/no-EMA y `step0015000/state.pt`) |
| Pipeline | text-to-video |
| Modelo base | Wan-AI/Wan2.1-T2V-1.3B-Diffusers |
| Funciones de perdida | TF + FM + TM |
| Schedule de ruido | sigma ~ LN(0,1); shift = 3; t = 1000·sigma |
| Datos de entrenamiento | "OV"; captions QT 50/50 VB/full (terminologia del autor, sin detallar) |
| Paso final de entrenamiento | step 15000 |

## Arquitectura y entrenamiento

El modelo parte del transformer de difusion de Wan2.1-T2V-1.3B, disenado para generar video a partir de prompts textuales mediante un proceso de denoising iterativo. Sobre esa base, el autor introduce una modificacion estructural descrita como "A5 → B5×4 → C5", que resulta en 15 bloques unicos ejecutados 30 veces en total. Esta configuracion, etiquetada como "recurrent-transformer", implica que algunos bloques se reutilizan en pasadas sucesivas, una estrategia que en la literatura se asocia a la reduccion de parametros efectivos o de coste de computo a cambio de profundidad efectiva. No se especifica en la model card como se implementa exactamente la reutilizacion ni que bloques se comparten.

El entrenamiento emplea una combinacion de tres perdidas denominadas TF, FM y TM, cuyas siglas no se expanden en la documentacion. El schedule de ruido usa sigma muestreada de una lognormal estandar con shift de 3, un esquema habitual en modelos de difusion para reequilibrar la contribucion de niveles de ruido alto y bajo. Los datos se etiquetan como "OV" con captions QT en proporcion 50/50 entre VB y full, sin que se aclare el volumen de tokens, la composicion del dataset ni si hubo etapas de RLHF o DPO (poco probables en un modelo de difusion de video). Se conservan los 19 checkpoints EMA y no-EMA junto al estado final del paso 15000, lo que permite reproducir o reanudar el entrenamiento, pero tambien explica el gran tamano del repositorio.

## Capacidades

- Generacion de video a partir de texto (text-to-video) mediante difusion, heredada del pipeline Wan2.1.
- Generacion de secuencias de video con coherencia temporal, sujeta a la calidad del modelo base de 1.300 millones de parametros.
- Reutilizacion de bloques (recurrent-transformer) como innovacion estructural que puede reducir el coste de inferencia respecto al modelo base, aunque no se documenta la magnitud.
- Soporte de tool calling / function calling: no disponible (no es una capacidad propia de un modelo de difusion de video).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; la model card no especifica idiomas de los prompts.
- Capacidades especiales: no se documentan modos de pensamiento, vision de entrada ni audio.

## Casos de uso

- Prototipado de videos cortos para redes sociales: el modelo puede generar clips a partir de prompts descriptivos, adecuado para equipos que quieran experimentar con generacion de video sin depender de APIs cerradas, aunque la calidad estara limitada por el tamano de 1.300 millones de parametros del modelo base.
- Investigacion sobre eficiencia en difusion de video: la estructura A5 → B5×4 → C5 con bloques recurrentes permite estudiar el impacto de la reutilizacion de bloques en calidad y coste, comparando con el Wan2.1 original.
- Generacion de storyboards y previsualizaciones: util para estudios de animacion o publicidad que necesiten bocetos animados rapidos antes de producir el material final.
- Ajuste fino posterior (fine-tuning) sobre un checkpoint experimental: al conservar los 19 estados EMA y no-EMA y el `state.pt` del paso 15000, sirve como punto de partida para experimentos de entrenamiento adicionales.
- Generacion de material de relleno en pipelines de edicion: clips generados por IA para insertar como B-roll en montajes, siempre que se valide la calidad visual y la coherencia temporal.
- Docencia y demostraciones de text-to-video en entornos con recursos limitados: al derivar de un modelo de 1.300 millones, es mas asequible de ejecutar que variantes de mayor tamano, aunque el repositorio de 60,7 GB exige planificar el almacenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; como referencia, un transformer de difusion de 1.300 millones de parametros en precision fp16 requiere del orden de 3-4 GB solo para los pesos, mas el coste de activaciones y del decodificador VAE, que en la practica suele situar el total por encima de 8-12 GB segun resolucion y numero de frames. Estas cifras son estimaciones generales, no datos publicados para este checkpoint.
- GPU recomendadas: no disponibles en la model card. Por tamano del modelo base, una RTX 4090 (24 GB) o una A100 (40/80 GB) son opciones razonables para inferencia en fp16; GPU con 16 GB pueden requerir cuantizacion o técnicas de offload.
- Compatibilidad con GPU de consumo: probable en RTX 3090/4090 y GPUs con 16 GB o mas, sujeto a validacion empirica; no confirmado por el autor.
- Opciones de despliegue: al publicarse en formato diffusers, es compatible con la libreria `diffusers` de Hugging Face; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no a difusion de video).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ducvh5/wan21-a5b5x4c5-tf-fm-tm-ln3-qt | 1.300 M | no disponible | no disponible | Hugging Face (diffusers) | Finetune experimental con bloques recurrentes; 0 descargas |
| Wan-AI/Wan2.1-T2V-1.3B-Diffusers | 1.300 M | no disponible | no disponible en esta ficha | Hugging Face (diffusers) | Modelo base oficial de Alibaba, referencia directa |
| Otros modelos text-to-video open source de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- La model card es extremadamente escueta y usa terminologia propia (A5/B5/C5, TF/FM/TM, OV, QT, VB) sin definirla, lo que dificulta la reproducibilidad.
- No se especifica la licencia, por lo que no puede asumirse uso comercial sin consultar al autor o al modelo base.
- No hay benchmarks ni evaluaciones cualitativas publicadas; la calidad del ajuste fino es desconocida.
- El repositorio incluye 19 checkpoints intermedios y el estado del optimizador, lo que infla el tamano a 60,7 GB y complica su despliegue en entornos con almacenamiento limitado.
- Riesgo de alucinacion visual y de incoherencias temporales inherente a los modelos de difusion de video de 1.300 millones de parametros.
- Sesgos conocidos: no documentados; al derivar de un modelo entrenado con datos no especificados, pueden heredarse sesgos de representacion.
- Idiomas soportados no declarados; no se garantiza un comportamiento correcto con prompts en castellano.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.
- La fecha de creacion indicada (2026-11-02) es posterior a la de esta ficha, lo que sugiere que los metadatos deben tratarse con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ducvh5/wan21-a5b5x4c5-tf-fm-tm-ln3-qt
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers
- Libreria diffusers: https://github.com/huggingface/diffusers
- No se han encontrado papers, blogs, repositorios o demos adicionales en la informacion proporcionada.
