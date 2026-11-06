# ducvh5/wan21-a5b5x4c5-tm-ln2-stage2-from21750-ema

## Resumen

Este repositorio contiene un checkpoint experimental derivado de Wan2.1-T2V-1.3B, el modelo de generación de vídeo a partir de texto desarrollado por Alibaba (Wan-AI). El autor del repositorio, ducvh5, ha aplicado una modificación arquitectónica sobre el transformer del modelo base: una estructura recurrente con un patrón de bloques A5 → B5×4 → C5, lo que resulta en 15 bloques únicos ejecutados 30 veces en total. Esta técnica busca aumentar la profundidad efectiva del modelo sin incrementar proporcionalmente el número de parámetros.

El modelo se distribuye como un fine-tune del pipeline text-to-video de Wan2.1-1.3B, con pesos en formato safetensors y compatibilidad declarada con la librería diffusers. El repositorio incluye los 13 archivos de pesos (tanto EMA como no-EMA) y un estado de entrenamiento en `step0002500/state.pt`. Se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin model card descriptiva más allá de los metadatos técnicos del entrenamiento.

La relevancia de este checkpoint es acotada: no es un modelo de producción ni cuenta con documentación de uso, benchmarks o licencia declarada. Su interés reside en la exploración de arquitecturas recurrentes sobre modelos de difusión para vídeo, un área activa de investigación. Cualquier evaluación práctica requeriría reproducir el pipeline de Wan2.1-1.3B y sustituir los pesos del transformer por los aquí publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión recurrente (basado en Wan2.1-T2V-1.3B); patrón A5 → B5×4 → C5, 15 bloques únicos / 30 ejecutados |
| Parámetros totales | no disponible (el modelo base Wan2.1-T2V-1.3B declara 1.3B, pero la modificación recurrente no especifica recuento) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, presumiblemente fp16/bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (13 archivos EMA/non-EMA) + `step0002500/state.pt` |
| Tamaño del repositorio | 43.4 GB |
| Pipeline | text-to-video |

## Arquitectura y entrenamiento

El modelo parte del transformer de difusión de Wan2.1-T2V-1.3B y aplica una reestructuración en bloques recurrentes: cinco bloques del grupo A, cinco bloques del grupo B repetidos cuatro veces (B5×4) y cinco bloques del grupo C, sumando 15 bloques únicos que se ejecutan 30 veces en el forward pass. Esta recurrencia permite reutilizar pesos en profundidad, una estrategia habitual para incrementar la capacidad efectiva sin multiplicar el número de parámetros. El autor etiqueta el modelo como "recurrent-transformer" y conserva la compatibilidad con diffusers.

El entrenamiento emplea una función de pérdida denominada "TM" aplicada a todas las salidas del bucle, con un schedule de ruido σ ~ LN(0,1), shift=2 y t=1000σ. Los datos de entrenamiento se identifican solo como "OV", sin más detalle. El checkpoint corresponde al stage 2, inicializado desde el estado EMA en el paso 21750, y el estado final guardado es `step0002500/state.pt`. No se documenta el número de tokens, la composición del dataset, ni si hubo RLHF/DPO (poco probable en un modelo de difusión de vídeo). La innovación principal es, por tanto, la recurrencia de bloques sobre un modelo de difusión de vídeo, no el entrenamiento en sí.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video), heredada del pipeline Wan2.1-T2V-1.3B.
- Ejecución de un transformer recurrente con 15 bloques únicos y 30 ejecuciones por paso.
- Compatibilidad declarada con la librería diffusers y el pipeline de Wan2.1.
- Distribución de pesos EMA y no-EMA para comparación o evaluación.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en arquitecturas recurrentes para difusión de vídeo: el checkpoint permite comparar el rendimiento de un transformer con bloques reutilizados frente al Wan2.1-1.3B original en la misma tarea text-to-video.
- Reproducción de experimentos académicos: sirve como artefacto para validar la técnica de recurrencia A5 → B5×4 → C5 descrita en el repositorio.
- Evaluación de estrategias de inicialización EMA: al incluir pesos EMA y no-EMA, permite analizar el impacto de la media móvil exponencial en la calidad de generación.
- Estudio de schedules de ruido: el uso de σ ~ LN(0,1) con shift=2 y t=1000σ puede compararse con el schedule del modelo base para analizar su efecto en la estabilidad del entrenamiento.
- Base para fine-tuning posterior: al ser compatible con diffusers, puede servir como punto de partida para ajustes en dominios específicos de vídeo.
- Docencia y divulgación: útil para ilustrar cómo se modifica un transformer de difusión con recurrencia y cómo se publican checkpoints intermedios con estado de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de FVD, CLIP score, IS ni comparaciones cuantitativas con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 43.4 GB e incluye 13 archivos de pesos EMA/non-EMA, por lo que cargar un único conjunto en fp16 requeriría del orden de decenas de GB, pero no se especifica.
- GPU recomendadas: no disponible. Por el tamaño del modelo base (1.3B) y el pipeline de vídeo, se necesitarían GPUs con al menos 24 GB de VRAM para inferencia en fp16, aunque no hay confirmación en la información.
- ¿Cabe en GPU consumer? No confirmado; probablemente una RTX 4090 (24 GB) podría cargar el transformer en fp16, pero el pipeline completo de vídeo y los archivos auxiliares pueden exceder esa cifra.
- Opciones de despliegue: diffusers (declarado). No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusión de vídeo en la mayoría de casos).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ducvh5/wan21-a5b5x4c5-tm-ln2-stage2-from21750-ema | no disponible (base 1.3B) | no disponible | no disponible | Hugging Face, 0 descargas | Checkpoint experimental recurrente |
| Wan-AI/Wan2.1-T2V-1.3B-Diffusers | 1.3B | no disponible | no disponible en esta ficha | Hugging Face, modelo base oficial | Referencia directa; sin recurrencia |
| Otros modelos text-to-video open source (p. ej. CogVideoX, LTX-Video) | variable | no disponible | variable | Hugging Face | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información disponible.

## Limitaciones y advertencias

- Licencia no declarada: no se puede garantizar el uso comercial ni la redistribución; es imprescindible contactar con el autor o consultar la licencia del modelo base Wan2.1.
- Cero descargas y cero likes: no hay evidencia de validación por parte de la comunidad ni de que el checkpoint funcione correctamente en inferencia.
- Model card mínima: no se documentan instrucciones de uso, limitaciones conocidas, sesgos ni idiomas soportados.
- Riesgo de alucinación visual: como todo modelo generativo de vídeo, puede producir contenido incoherente o no fiel al prompt.
- Arquitectura modificada: la recurrencia A5 → B5×4 → C5 puede no ser compatible con el pipeline estándar de diffusers sin adaptaciones adicionales.
- Estado de entrenamiento incluido: el archivo `state.pt` puede contener información del optimizador y del proceso de entrenamiento; no se especifica si es seguro cargarlo en producción.
- Fecha de creación futura (2026-11-02): metadato atípico que puede indicar error de registro o manipulación; conviene verificar la integridad del repositorio.
- Sin benchmarks: imposible evaluar su calidad frente al modelo base sin ejecutar pruebas propias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ducvh5/wan21-a5b5x4c5-tm-ln2-stage2-from21750-ema
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
