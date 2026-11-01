# efebaykara/Qwen3.5-2B-Base-Gundem-LoRA

## Resumen

Qwen3.5-2B-Base-Gundem-LoRA es un adaptador LoRA desarrollado por efebaykara sobre el modelo base Qwen/Qwen3.5-2B-Base (revision `b1485b2fa6dfa1287294f269f5fb618e03d52d7c`). Su proposito no es ser un asistente conversacional general, sino resolver una tarea concreta y acotada: la clasificacion de titulares de noticias en turco ("gundem" significa actualidad/agenda en turco). El adaptador recibe un titular y devuelve un objeto estructurado con temas (`etiketler`), tipo de evento (`tur`) y tres puntuaciones enteras de 0 a 3 (`etki`, `ciddiyet`, `aciliyet`).

El modelo se entrena mediante destilacion de respuestas (response distillation): se generaron respuestas con DeepSeek que despues se usaron como supervision solo en el turno del asistente, sin emplear pesos ni logits del profesor. El conjunto de datos es muy pequeno (825 ejemplos de entrenamiento, 107 de validacion y 101 de test) y especifico del dominio. El adaptador tiene rango r=16 y alpha=32, se entreno durante tres epocas con lr=0.0002, acumulacion de gradientes de 8 y longitud maxima de 512 tokens.

Es relevante porque demuestra un patron de adaptacion de submodelos pequenos (1.880 millones de parametros) a tareas de clasificacion estructurada con salida JSON, incluyendo una pareja de ficheros GGUF Q4_K_M para despliegue movil con un motor nativo propio. No obstante, su alcance es estrictamente limitado: no es un checkpoint completo ni un asistente general, y su evaluacion mide unicamente la concordancia con las etiquetas del profesor en esta tarea concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3_5ForCausalLM) con adaptador LoRA (PEFT) |
| Parametros totales | 1.881.825.088 (modelo base; el adaptador no anade parametros al recuento del estudiante) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento uso max_length=512; la ventana nativa del modelo base no se especifica) |
| Tipos de cuantizacion | BF16 (inferencia CUDA), fp32 (fusion del adaptador en CPU), GGUF Q4_K_M (version movil) |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache-2.0 (modelo y tokenizador segun ficheros upstream); codigo auxiliar Gundem bajo MIT |
| Formato de pesos | safetensors (adaptador PEFT), GGUF (Q4_K_M para movil) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-2B-Base, un transformer decoder-only de 1.880 millones de parametros con clase de inferencia `Qwen3_5ForCausalLM`. Se trata de una adaptacion solo de texto: los componentes de vision del modelo base no se entrenaron. El adaptador LoRA usa r=16 y alpha=32, se fusiona en fp32 sobre CPU y la inferencia se ejecuta en BF16 sobre CUDA.

El entrenamiento consistio en destilacion de respuestas: se generaron respuestas con DeepSeek que se usaron como supervision solo en el turno del asistente. No se emplearon pesos ni logits del modelo profesor y el recuento de parametros del estudiante no cambio. El split contiene 825 ejemplos de entrenamiento, 107 de validacion y 101 de test. Se realizaron tres epocas con lr=0.0002, acumulacion de gradientes de 8, longitud maxima de 512 y semilla 42. El modelo recibe unicamente el titular y un fichero `student-system.txt` con el template de tarea exacto. La generacion no esta restringida por una gramatica JSON, por lo que la salida puede contener campos `prediction` o un `error` explicito.

## Capacidades

- Clasificacion de titulares de noticias en turco en cuatro dimensiones: temas (`etiketler`), tipo de evento (`tur`) y puntuaciones enteras de impacto (`etki`), gravedad (`ciddiyet`) y urgencia (`aciliyet`) en rango 0-3.
- Generacion de salida estructurada en formato de campos JSON, aunque sin gramatica JSON forzada.
- Inferencia solo de texto; no soporta vision, audio ni otras modalidades.
- No es un asistente conversacional general ni soporta tool calling o function calling de forma documentada.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al turco segun la metadata del modelo.
- Incluye un loader (`release_infer.py`) que gestiona compatibilidad de arquitectura, template de tarea, revision fijada del modelo base, fusion del adaptador en CPU fp32 e inferencia en CUDA BF16.

## Casos de uso

- Clasificacion automatica de titulares en redacciones digitales: el modelo recibe un titular y devuelve temas, tipo de evento y puntuaciones de impacto, gravedad y urgencia, lo que permite etiquetar y priorizar noticias en un CMS de forma semiautomatica.
- Priorizacion de alertas en un sistema de monitorizacion de medios: las puntuaciones `ciddiyet` y `aciliyet` (0-3) permiten ordenar titulares por relevancia operativa en un panel de seguimiento de actualidad.
- Enrutado de noticias a secciones editoriales: la salida `tur` (tipo de evento) y `etiketler` (temas) sirven para asignar automaticamente un titular a la seccion o al periodista correspondiente.
- Despliegue en movil o dispositivos con recursos limitados: la pareja de ficheros GGUF Q4_K_M y el motor nativo Gundem permiten ejecutar la clasificacion en local sin GPU, util para aplicaciones de agregacion de noticias.
- Investigacion sobre destilacion de respuestas en tareas de clasificacion: el repositorio incluye herramientas de entrenamiento y benchmark (`gundem-llms`) que permiten reproducir el pipeline con otros dominios o idiomas.
- Filtrado y deduplicacion tematica de flujos RSS: los temas devueltos por el modelo permiten agrupar titulares por categoria antes de un procesamiento posterior.
- Evaluacion comparativa de adaptadores pequenos: sirve como referencia de hasta donde llega un modelo de 1.880 millones de parametros con LoRA r=16 en una tarea de clasificacion estructurada frente al modelo base sin ajustar (que obtiene 0.0 en la metrica Gundem Score v1).

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---:|
| Gundem Score v1 | 81,8 / 100 |
| All-field exact match | 45,5 % |
| Topic micro-F1 | 91,4 % |
| Type accuracy | 83,2 % |
| Invalid outputs | 0 / 101 |

Condiciones de evaluacion segun el autor: HF/CUDA BF16, decodificacion greedy, batch=4, maximo 160 tokens nuevos, sin gramatica JSON. La metrica Gundem Score v1 se define como 30 x topic F1 + 20 x type accuracy + 30 x (1 - MAE medio de puntuaciones / 3) + 20 x exact match, con metricas fraccionarias. El autor advierte que mide la concordancia con las etiquetas del profesor en esta tarea, no inteligencia general ni un porcentaje de acierto, y que diferencias pequenas en un test de una sola semilla no establecen superioridad.

| Variante GGUF Q4_K_M | Gundem Score v1 (HF/BF16) |
|---|---:|
| original (sin ajustar) | 0,0 |
| distilled (ajustado) | 81,8 |

Las puntuaciones de la tabla GGUF proceden del experimento HF/BF16; la calidad de los GGUF moviles no se re-evaluo.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 3,8 GB solo para los pesos del modelo base de 1.880 millones de parametros, mas overhead de activaciones y cache KV (no cuantificado por el autor).
- RAM de CPU: el loader requiere RAM suficiente para cargar el modelo base completo en fp32 durante la fusion del adaptador (aproximadamente 7,5 GB para los pesos, mas overhead).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para BF16; el autor no especifica modelos concretos como A100, H100 o RTX 4090.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 8 GB o mas de VRAM en BF16, y en menos memoria con la version GGUF Q4_K_M (tamano del repo completo: 2,6 GB).
- Opciones de despliegue: el repositorio incluye `release_infer.py` con PyTorch CUDA; para movil, el motor nativo Gundem con ficheros GGUF Q4_K_M. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La evaluacion uso batch=4 y maximo 160 tokens nuevos sin reportar tiempos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B-Base-Gundem-LoRA (este) | 1.880 M (base) + LoRA r16 | no disponible | Clasificacion de titulares en turco | Apache-2.0 | HuggingFace, GGUF Q4_K_M |
| Qwen/Qwen3.5-2B-Base (original) | 1.880 M | no disponible | Modelo base generalista | Apache-2.0 (upstream) | HuggingFace |
| Alternativas de clasificacion de noticias en turco | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos publicados de otros adaptadores comparables en la informacion proporcionada. La unica comparacion directa documentada es contra el modelo base sin ajustar, que obtiene 0,0 en Gundem Score v1 frente a 81,8 del adaptador destilado.

## Limitaciones y advertencias

- No es un checkpoint completo ni un asistente general: requiere el modelo base fijado en la revision `b1485b2fa6dfa1287294f269f5fb618e03d52d7c`.
- El conjunto de datos es pequeno y especifico del dominio (825 ejemplos de entrenamiento); el autor recomienda inspeccionar las predicciones antes de confiar en ellas.
- La generacion no esta restringida por gramatica JSON, por lo que la salida puede contener errores explicitos en lugar de la estructura esperada.
- Solo se entreno la modalidad de texto; los componentes de vision del modelo base no se entrenaron.
- Idioma limitado al turco; no se documenta rendimiento en otros idiomas.
- La evaluacion se realizo con una sola semilla y el autor advierte que diferencias pequenas no establecen superioridad; el batch size y los cambios numericos del runtime pueden afectar a las salidas.
- La calidad de los GGUF moviles no se re-evaluo; las puntuaciones reportadas proceden del experimento HF/BF16.
- Los titulares en bruto, las respuestas del profesor y el dataset completo no se redistribuyen.
- La licencia del modelo y del tokenizador sigue los ficheros upstream; el codigo auxiliar Gundem es MIT, pero la licencia del modelo es independiente de la del codigo.
- Cargar el modelo base ejecuta codigo remoto del modelo; el autor recomienda revisarlo antes de su uso.
- Riesgo de alucinacion y sesgos: no documentados explicitamente por el autor; al ser una tarea de clasificacion acotada, el riesgo principal es la asignacion incorrecta de etiquetas o puntuaciones fuera de la distribucion de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/efebaykara/Qwen3.5-2B-Base-Gundem-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Herramientas de entrenamiento y benchmark: https://github.com/efebaykaraa/gundem-llms
- Modelos publicados: https://github.com/efebaykaraa/gundem-llms/releases/tag/models-v1.0.0
