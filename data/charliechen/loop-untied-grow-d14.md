# CharlieChen/loop-untied-grow-d14

## Resumen

loop-untied-grow-d14 es un modelo de lenguaje base (pretrained, sin ajuste por instrucciones) desarrollado por el usuario CharlieChen y publicado como artefacto de investigacion asociado al paper "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents". Se trata de un transformer con recursividad (looped transformer) de 1.311.113.216 parametros almacenados en FP32, con una coordenada de profundidad d14 y 4 repeticiones configuradas del nucleo del modelo. El checkpoint publicado es el artefacto final de entrenamiento utilizado en la escalera de escalado (scaling ladder) sobre el corpus FineWeb.

El modelo resuelve un problema de investigacion concreto: servir como punto de medida reproducible para estudiar como el crecimiento de modelo, la recursion y los operadores de frontera afectan a los exponentes de escalado. No esta pensado como asistente conversacional ni como modelo listo para produccion, sino como material de referencia para reproducir experimentos de escalado y para servir de base a ajuste fino posterior. Su rendimiento declarado se limita a una perplejidad de validacion (NLL) de 2,741565 nats/token sobre el corpus de preentrenamiento.

Es relevante ahora porque la familia de transformers con pesos compartidos entre capas (looped/recursive transformers) es una linea activa de investigacion para reducir el coste de parametros manteniendo capacidad efectiva de computo. El checkpoint se distribuye en formato PyTorch nativo (no es un `AutoModel` de Transformers), con ventana de contexto de 2.048 tokens, tokenizer GPT-2 y licencia no especificada, lo que condiciona cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer recursivo (looped transformer), variante "Untied Grow", modo de profundidad `dep` |
| Parametros totales | 1.311.113.216 (almacenados en FP32) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible (solo se publica el checkpoint FP32; no hay versiones GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | PyTorch nativo (`final.pt`); no safetensors, no GGUF, no compatible con `AutoModel` de Transformers |
| Ancho (hidden size) | 1792 |
| Cabezas de atencion | 14 |
| Coordenada de profundidad | d14 |
| Repeticiones del nucleo | 4 configuradas, 4 en la evaluacion final |
| Tokenizer | GPT-2 (`tiktoken.get_encoding("gpt2")`) |
| Vocabulario | 50.257 tokens, ampliado a 50.304 filas del modelo |
| Corpus de entrenamiento | FineWeb |
| NLL de validacion (preentrenamiento) | 2,741565 nats/token |
| Tamano del repositorio | 5,2 GB |
| Ficheros incluidos | `final.pt`, `result.json`, `SHA256SUMS` |

## Arquitectura y entrenamiento

La arquitectura es un transformer recursivo: un nucleo de bloques Transformer que se ejecuta repetidamente (4 repeticiones configuradas y 4 en la evaluacion final), con la particularidad de que la coordenada de profundidad de la escalera de escalado no tiene por que coincidir con el numero de bloques Transformer realmente ejecutados. El modo de profundidad declarado es `dep` y la variante es "Untied Grow", dentro de la taxonomia del paper sobre crecimiento de modelo, recursion y operadores de frontera. No se especifica en la informacion disponible el numero exacto de capas ejecutadas, el tipo de atencion (salvo el uso de FlashAttention-3 en la evaluacion del paper) ni el uso de mecanismos adicionales como decodificacion especulativa o atencion lineal.

El entrenamiento se realizo sobre el corpus FineWeb (etiqueta `HuggingFaceFW/fineweb`), en ingles, con tokenizer GPT-2 y contexto de 2.048 tokens. Segun el autor, el paper emplea GPUs H100, FlashAttention-3 y autocast en bfloat16. El checkpoint es exclusivamente el resultado de preentrenamiento: no ha pasado por RLHF, DPO ni ajuste por instrucciones, y no incluye estado del optimizador, por lo que no es reanudable para continuar el entrenamiento. Los metadatos portables para reconstruir la configuracion estan en `result.json`, y la reconstruccion del modelo `TransformerGPT` depende del codigo del paper.

## Capacidades

- Generacion de texto autoregresiva en ingles a partir de continuaciones de prompt (modelo base, sin plantilla de instrucciones).
- Modelado de lenguaje puro: util como referencia de perplejidad sobre texto en ingles.
- Completado de texto con contexto de hasta 2.048 tokens.
- Capacidad de computo efectiva ampliada por recursion: el nucleo se ejecuta 4 veces, lo que incrementa el computo por parametro almacenado respecto a un transformer de profundidad equivalente no recursivo.
- No dispone de soporte declarado de tool calling ni function calling.
- No dispone de modo de razonamiento explicito (thinking mode), ni de capacidades de agente multi-paso.
- No tiene capacidades de vision, audio ni multimodalidad.
- Multilingue: no. Solo ingles declarado.
- No hay ajuste por instrucciones, por lo que no sigue ordenes de forma fiable sin ejemplos en el prompt.

## Casos de uso

- Investigacion en leyes de escalado: el checkpoint es el punto d14 de la escalera de escalado de FineWeb del paper, por lo que se usa directamente para reproducir las curvas de NLL frente a coordenada de profundidad y comparar exponentes de escalado entre variantes.
- Reproduccion de resultados academicos: permite recalcular la NLL de validacion (2,741565 nats/token) con el mismo corpus y verificar la coherencia del artefacto publicado antes de construir sobre el.
- Ajuste fino supervisado para tareas en ingles: al ser un modelo base de 1,3B parametros, se puede afinar para clasificacion de texto, resumen extractivo o generacion de dominio especifico cuando no se requiere contexto largo.
- Generacion de datos sinteticos para destilacion: se puede usar para producir continuaciones de texto a gran escala sobre corpus en ingles que alimenten el entrenamiento de modelos mas pequenos, filtrando por perplejidad.
- Estudio de transformers recursivos: sirve como referencia practica para analizar como se comportan los pesos compartidos entre repeticiones del nucleo, comparando activaciones y gradientes frente a arquitecturas no recursivas del mismo presupuesto de parametros.
- Evaluacion comparativa de tokenizers y corpus: al usar el tokenizer GPT-2 sobre FineWeb, es util para medir el efecto del vocabulario y de la composicion del corpus en la NLL dentro de una misma familia de modelos.
- Linea base en pipelines de evaluacion internos: puede integrarse como modelo de control en un banco de pruebas de modelos de ~1,3B parametros entrenados con recetas propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento declarado por el autor es la perplejidad de validacion sobre el corpus de preentrenamiento:

| Metrica | Valor | Conjunto |
|---|---|---|
| NLL de validacion (preentrenamiento) | 2,741565 nats/token | FineWeb |
| CORE (22 tareas, seeds 0/1/2) | No publicado | Suite CORE del paper |

El autor indica que el repositorio permite ejecutar una evaluacion CORE completa con 22 tareas y las seeds 0, 1 y 2 mediante el script `eval.py` del codebase, pero los resultados de esa suite no acompanan a la informacion proporcionada. Las puntuaciones de "smoke test" (con `--max-per-task 10`) no equivalen a resultados completos del paper.

## Requisitos de hardware

- Pesos en FP32: el checkpoint ocupa 5,245 GB en disco (fichero `final.pt` de 5,2 GB de repositorio). La inferencia en FP32 requiere aproximadamente 5,3 GB de VRAM solo para pesos, mas el cache KV y las activaciones para 2.048 tokens.
- Inferencia en bfloat16: alrededor de 2,7 GB para pesos, magnitud coherente con el uso de autocast bf16 que describe el autor. Cabe con holgura en GPUs de consumo.
- GPUs de consumo compatibles: RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090 (24 GB) y equivalentes pueden ejecutar inferencia en bf16 o FP32 con contexto completo.
- GPUs de centro de datos: el paper usa H100, con FlashAttention-3 y autocast en bfloat16. A100 40/80 GB y H100 son opciones sobredimensionadas para el tamano del modelo, pero coherentes con el entorno de referencia del paper.
- El checkpoint FP32 completo tambien puede cargarse en CPU si se dispone de unos 6 GB de RAM libres, aunque la latencia sera muy superior a la de GPU.
- Opciones de despliegue: no es un checkpoint `AutoModel` de Transformers ni hay soporte declarado en vLLM, llama.cpp, Ollama, TGI o TensorRT-LLM, ya que requiere el modelo `TransformerGPT` del codebase `cue-engineering/loop` para reconstruirse. No se han publicado conversiones a GGUF ni a otros formatos de inferencia optimizada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks comparables para este checkpoint, por lo que la comparacion se limita a caracteristicas estructurales declaradas o de conocimiento publico general. Los datos de los modelos alternativos deben verificarse en sus propias fichas antes de usarse en produccion.

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| loop-untied-grow-d14 | 1,311B (FP32) | 2.048 | Transformer recursivo, base | No disponible | PyTorch nativo, requiere codebase propio |
| Pythia-1.4B | ~1,4B | 2.048 | Transformer denso, base | Apache-2.0 (segun su ficha publica) | Transformers, safetensors |
| TinyLlama-1.1B | ~1,1B | 2.048 | Transformer denso, ajustado por instrucciones | Apache-2.0 (segun su ficha publica) | Transformers, GGUF, amplio ecosistema |
| OPT-1.3B | ~1,3B | 2.048 | Transformer denso, base | Licencia propia de OPT (segun su ficha publica) | Transformers, safetensors |

Diferencias clave: loop-untied-grow-d14 no es un checkpoint estandar de Transformers y no cuenta con conversiones a GGUF ni integracion en runtimes habituales, mientras que las alternativas de la tabla tienen ecosistema amplio. Su interes es de investigacion en escalado y recursion, no de uso general.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue ordenes de forma fiable y puede producir continuaciones incoherentes o no deseadas ante prompts con formato conversacional.
- Riesgo de alucinacion: no se ha aplicado alineamiento ni RLHF, por lo que no existe ninguna capa de mitigacion entrenada para reducir afirmaciones falsas.
- Sesgos: el entrenamiento se realizo sobre FineWeb, un corpus web en ingles. Es esperable la presencia de sesgos sociales, culturales y de representacion propios de datos raspados de la web, sin filtrado declarado especifico en la informacion disponible.
- Idioma: solo ingles declarado. El rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera muy inferior.
- Contexto limitado: 2.048 tokens. No es adecuado para tareas de contexto largo, analisis de documentos extensos ni conversaciones multi-turno prolongadas sin estrategias externas de resumen.
- Licencia no disponible: no se puede asumir permiso para uso comercial. La ausencia de licencia explicita es un bloqueo para cualquier despliegue en produccion.
- Formato y compatibilidad: el checkpoint es un `final.pt` de PyTorch con el modelo `TransformerGPT` definido en `cue-engineering/loop`. No se carga con `AutoModel` de Transformers ni con herramientas de cuantizacion estandar, lo que encarece su integracion.
- No reanudable: no incluye estado del optimizador, por lo que no permite continuar el entrenamiento desde el punto guardado.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso ni validacion independiente por parte de terceros.
- Artefacto de investigacion: el propio autor lo describe como preservacion del artefacto original de entrenamiento, no como un modelo listo para produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CharlieChen/loop-untied-grow-d14
- Codebase del paper: https://github.com/cue-engineering/loop
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Paper "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents": no disponible (no se proporciona enlace en la informacion consultada)
