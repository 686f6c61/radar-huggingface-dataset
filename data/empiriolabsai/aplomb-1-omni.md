# empiriolabsai/aplomb-1-omni

## Resumen

Aplomb 1 Omni es un modelo de decisión multimodal desarrollado por EmpirioLabs AI, publicado en HuggingFace bajo el identificador `empiriolabsai/aplomb-1-omni`. No se trata de un modelo generativo de propósito general, sino de un modelo orientado a tareas de clasificación y decisión: responde preguntas de tipo sí/no, elección entre opciones, puntuación numérica y selección de herramientas (tool selection), produciendo probabilidades calibradas. Su particularidad es que opera sobre múltiples modalidades simultáneamente: texto, imagen, vídeo y audio, incluyendo llamadas, notas de voz, sonidos y música.

Técnicamente es un fine-tune del modelo base Qwen/Qwen3-Omni-30B-A3B-Instruct, una arquitectura MoE (Mixture of Experts) multimodal de la familia Qwen3-Omni. El repositorio contiene 35.259.818.545 parámetros en formato safetensors (aproximadamente 35,26 mil millones), con un tamaño de repositorio de 70,5 GB, lo que es coherente con pesos en precisión BF16/FP16. La model card lo registra con el pipeline `zero-shot-classification` y con las etiquetas `decision-model`, `calibrated-probabilities`, `tool-selection`, `multimodal`, `vision`, `video` y `audio`.

Su relevancia actual radica en cubrir un nicho poco frecuente: la evaluación y el enrutamiento multimodal con salida probabilística calibrada, algo útil para sistemas de agentes, moderación y control de calidad sobre contenido audiovisual. El acceso al modelo está restringido (gated) y requiere aceptar las condiciones en HuggingFace. La licencia es `empiriolabs-model-license-1.0` (etiquetada como `other`), y el modelo declara únicamente el idioma inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (heredada de Qwen3-Omni-30B-A3B); etiqueta `qwen3_omni_moe` |
| Parametros totales | 35.259.818.545 (aprox. 35,26 B) |
| Parametros activos | No confirmado en la ficha del fine-tune; el modelo base Qwen3-Omni-30B-A3B es un MoE con 3 B activos |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio contiene safetensors (70,5 GB, compatible con BF16/FP16) |
| Idiomas soportados | Ingles (en) |
| Licencia | empiriolabs-model-license-1.0 (etiqueta `other`); acceso restringido (gated) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline declarado | zero-shot-classification |
| Modelo base | Qwen/Qwen3-Omni-30B-A3B-Instruct |
| Modalidades | Texto, imagen, video, audio |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3-Omni-30B-A3B-Instruct, una arquitectura de tipo Mixture of Experts multimodal de la familia Qwen3-Omni. Esto implica un decodificador transformer con capas MoE (el sufijo "A3B" del modelo base indica 3 mil millones de parámetros activos por token sobre un total nominal de 30 B) más los componentes de codificación para imagen, vídeo y audio que habilitan la entrada multimodal. El total de 35,26 B de parámetros del repositorio es superior a los 30 B nominales del nombre del modelo base, lo que es consistente con la inclusión de los encoders y proyectores multimodales en el recuento.

Aplomb 1 Omni es un ajuste fino (fine-tune) sobre ese modelo base orientado a una tarea concreta: la decisión y clasificación con salida de probabilidades calibradas sobre entradas multimodales. La información proporcionada no especifica el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO u otras. Tampoco se detallan innovaciones arquitectónicas propias del fine-tune más allá del comportamiento de decisión (respuestas sí/no, elección, puntuación y selección de herramientas). Las etiquetas del repositorio (`calibrated-probabilities`, `decision-model`, `tool-selection`) sugieren que el entrenamiento se centró en producir distribuciones de probabilidad bien calibradas para tareas de clasificación zero-shot.

## Capacidades

- Clasificación y decisión multimodal: responde preguntas de sí/no, elección entre opciones y puntuación numérica sobre contenido de texto, imagen, vídeo y audio.
- Comprensión de audio: procesa llamadas, notas de voz, sonidos y música como entrada para tareas de decisión.
- Comprensión visual y de vídeo: admite imagen y vídeo como modalidades de entrada.
- Probabilidades calibradas: genera salidas probabilísticas calibradas, aptas para umbralización y ranking en lugar de solo texto libre.
- Selección de herramientas (tool selection): puede decidir qué herramienta invocar ante una consulta, lo que lo hace adecuado como componente de enrutamiento en sistemas de agentes.
- Clasificación zero-shot: el pipeline declarado es `zero-shot-classification`, lo que indica capacidad de clasificar sin ejemplos etiquetados específicos de la tarea.
- Capacidades multilingües: limitadas al inglés según la ficha.

No se dispone de información que confirme soporte explícito de function calling en sentido generativo, modo de razonamiento extendido (thinking mode) ni otras capacidades especiales más allá de las indicadas por las etiquetas del repositorio.

## Casos de uso

- Moderación de contenido audiovisual: clasificar vídeos, imágenes y pistas de audio como aptos o no aptos mediante preguntas de sí/no con probabilidad calibrada, aprovechando la entrada multimodal.
- Control de calidad de centros de contacto: evaluar llamadas y notas de voz (por ejemplo, si se cumplió un protocolo, si hubo una queja, si el tono fue adecuado) con salidas de decisión y puntuación.
- Enrutamiento de herramientas en agentes: usar el modelo como selector que decide qué herramienta o API invocar ante una consulta, gracias a su soporte de tool selection.
- Etiquetado y taxonomía de bibliotecas multimedia: clasificar música, sonidos y contenido de vídeo en categorías predefinidas para indexación y búsqueda.
- Filtrado y triaje previo en pipelines de datos: descartar o priorizar muestras (imágenes, vídeo o audio) antes de pasarlas a modelos generativos más costosos, reduciendo cómputo.
- Verificación de cumplimiento normativo en comunicaciones: comprobar si una interacción cumple determinadas condiciones (por ejemplo, presencia de avisos obligatorios) mediante preguntas de decisión con probabilidad.
- Detección de intención en asistentes de voz: clasificar la intención de una consulta hablada para decidir la siguiente acción del sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en BF16/FP16 el repositorio ocupa 70,5 GB, por lo que se necesitan del orden de 75-80 GB de VRAM solo para los pesos, más memoria para caché KV y activaciones. No se dispone de cifras oficiales.
- GPU recomendadas: una GPU de 80 GB (A100 80 GB, H100 80 GB) puede alojar los pesos, aunque con margen ajustado para contexto largo. Configuraciones multi-GPU también son viables.
- Cabe en GPU de consumo: no en precisión completa. Una RTX 4090 (24 GB), RTX 3090 (24 GB) o similares no pueden cargar los pesos BF16; requerirían cuantización, de la que no se informa en el repositorio.
- Opciones de despliegue: al estar en formato transformers y safetensors, es compatible con stacks como vLLM o TGI sujetos a soporte del modelo base Qwen3-Omni. No se confirma soporte de llama.cpp u Ollama (no hay GGUF publicado).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aplomb 1 Omni | 35,26 B (MoE) | No disponible | Texto, imagen, video, audio | empiriolabs-model-license-1.0 (gated) | HuggingFace, acceso restringido |
| Qwen3-Omni-30B-A3B-Instruct (modelo base) | 30 B (MoE, 3 B activos) | No disponible en esta ficha | Texto, imagen, video, audio | Segun Qwen (no confirmada aqui) | HuggingFace |
| Alternativas de clasificacion multimodal especializada | No disponible | No disponible | No disponible | No disponible | No disponible |

Solo se dispone de datos fiables del modelo base a partir de la informacion proporcionada. No se conocen con detalle modelos directamente comparables en la misma categoria de clasificacion/decision multimodal.

## Limitaciones y advertencias

- Idiomas: la ficha declara unicamente ingles, por lo que el rendimiento en castellano u otros idiomas no esta garantizado.
- Longitud de contexto: no especificada, lo que impide planificar despliegues con entradas largas sin verificacion previa.
- Calibracion: aunque las probabilidades se anuncian como calibradas, no se aportan datos de evaluacion que lo cuantifiquen; conviene validar la calibracion en el dominio de uso.
- Alucinacion y errores de decision: al ser un modelo de decision, los errores se manifiestan como clasificaciones incorrectas; en tareas sensibles (moderacion, cumplimiento) se recomienda supervision humana o umbrales conservadores.
- Licencia: `empiriolabs-model-license-1.0` es una licencia personalizada; no se detallan en la informacion disponible las condiciones para uso comercial, por lo que debe revisarse antes de un despliegue en produccion.
- Acceso restringido: el modelo esta en modo gated y requiere aceptar condiciones en HuggingFace, lo que afecta a la automatizacion de descargas y CI/CD.
- Sesgos: no se dispone de informacion sobre evaluaciones de sesgo del modelo base ni del fine-tune.
- Recursos: el tamano (70,5 GB en safetensors) limita su uso a infraestructura con GPU de alta memoria o configuraciones multi-GPU.

## Enlaces

- HuggingFace: https://huggingface.co/empiriolabsai/aplomb-1-omni
- Pagina del modelo (API, precios y playground): https://empiriolabs.ai/models/aplomb-1-omni
- Documentacion: https://docs.empiriolabs.ai/models/aplomb-1-omni
- Playground: https://platform.empiriolabs.ai/dashboard/playground?model=aplomb-1-omni
- Sitio de EmpirioLabs AI: https://empiriolabs.ai/
- Modelo base: https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct
