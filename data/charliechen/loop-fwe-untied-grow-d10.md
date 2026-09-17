# CharlieChen/loop-fwe-untied-grow-d10

## Resumen

loop-fwe-untied-grow-d10 es un modelo de lenguaje base (no instruido, sin ajuste por instrucciones ni RLHF) desarrollado por el usuario CharlieChen, asociado al trabajo "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents". Se trata de un transformer con recurrencia ("looped transformer"): un nucleo de bloques Transformer que se reejecuta varias veces, en lugar de apilar capas independientes. El checkpoint publicado corresponde a la variante "Untied-Grow" en la coordenada de profundidad d10 del estudio de leyes de escalado.

El modelo almacena 575.733.760 parametros en FP32 y fue preentrenado sobre el corpus FineWeb-Edu con un tokenizador GPT-2 (via tiktoken) y una longitud de contexto de 2.048 tokens. Su interes es fundamentalmente de investigacion: sirve para reproducir los resultados del paper sobre crecimiento de modelos, recursion y operadores de frontera, y para estudiar como se comportan los exponentes de escalado cuando se separa la profundidad efectiva de la recurrencia del numero de bloques ejecutados.

Es relevante ahora porque los transformers recurrentes/looped estan recibiendo atencion como alternativa de eficiencia en parametros: se reutiliza el mismo nucleo varias veces para ganar profundidad efectiva sin aumentar el numero de pesos almacenados. No obstante, conviene subrayar que es un artefacto de investigacion con licencia no especificada, solo ingles, contexto corto (2.048) y que requiere el codebase propio del paper para cargarse, ya que no es un `AutoModel` de Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer recurrente ("looped"), implementacion personalizada `TransformerGPT` del paper; nucleo reejecutado con recurrencia final |
| Parametros totales | 575.733.760 parametros almacenados en FP32 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible; los pesos se distribuyen unicamente en FP32 (no hay GGUF, GPTQ, AWQ ni versiones oficiales cuantizadas) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | No disponible |
| Formato de pesos | PyTorch nativo (`final.pt`, tensores FP32); se incluyen `result.json` y `SHA256SUMS`. No hay safetensors ni GGUF |

Datos adicionales de configuracion publicados en la model card:

| Parametro | Valor |
|---|---|
| Corpus de entrenamiento | FineWeb-Edu |
| Coordenada de profundidad | d10 |
| Anchura (hidden size) | 1.280 |
| Cabezas de atencion | 10 |
| Repeticiones finales del nucleo | 4 |
| Tokenizador | GPT-2, via tiktoken |
| Vocabulario | 50.257 tokens, ampliado (padding) a 50.304 filas en el modelo |
| NLL de validacion en preentrenamiento | 2,73449767 nats/token |
| CORE accuracy (paper) | 0,17882870 |
| CORE answer NLL (paper) | 2,71120602 nats/token |

## Arquitectura y entrenamiento

La arquitectura es un transformer con recurrencia: en lugar de una pila de capas unicas, el modelo dispone de un nucleo de bloques que se ejecuta repetidamente, de modo que la profundidad computacional efectiva puede superar el numero de bloques con parametros propios. En esta variante concreta, el nucleo se repite 4 veces en la recurrencia de evaluacion final, con anchura 1.280, 10 cabezas de atencion y un vocabulario de 50.257 tokens de GPT-2 (ampliado con padding a 50.304 filas). La etiqueta "untied" hace referencia a que los embeddings de entrada y de salida no estan atados (no comparten pesos). La model card aclara que la coordenada de profundidad d10 es la coordenada de escalado de la "escalera" experimental del paper y puede diferir del numero de bloques Transformer realmente ejecutados.

El preentrenamiento se realizo sobre FineWeb-Edu, un corpus filtrado por calidad educativa. La model card indica que los pesos exportados son identicos bit a bit al checkpoint del paper, que solo se incluyen los tensores del modelo y la recurrencia de evaluacion final, y que no se distribuye el estado del optimizador. No se documentan en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion detallada del dataset, ni fases de RLHF, DPO o ajuste por instrucciones (es un modelo estrictamente base). El protocolo del paper emplea GPU H100 con FlashAttention-3 y autocast en bfloat16.

## Capacidades

- Generacion de texto autoregresiva en ingles como modelo base (continuacion de prompt), sin ajuste por instrucciones ni formato conversacional.
- Razonamiento y conocimiento general evaluados mediante el benchmark CORE (91.037 ejemplos, 22 tareas), con una precision media reportada de 0,1788.
- Capacidad multilingue: no disponible; el modelo esta etiquetado unicamente para ingles.
- Tool calling / function calling: no disponible (modelo base sin entrenamiento especifico).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad entrenada; no hay plantilla de chat ni modo de "thinking".
- Vision, audio u otras modalidades: no soportadas.
- Capacidad intrinseca destacable: reutilizacion de un nucleo recurrente para estudiar profundidad efectiva y exponentes de escalado (interes experimental, no de producto).

## Casos de uso

- Reproduccion academica del paper: cargar `final.pt` con el codebase `cue-engineering/loop` y ejecutar `eval.py` con el protocolo CORE para replicar las metricas archivadas (0,1788 de accuracy; NLL 2,7112 nats/token en respuestas).
- Estudio de leyes de escalado: comparar esta variante "Untied-Grow d10" con otros puntos de la escalera experimental para medir como influyen crecimiento, recursion y operadores de frontera en los exponentes de escalado.
- Analisis de eficiencia parametros/profundidad: dado que reejecuta un nucleo con solo 575,7 M de parametros almacenados, sirve para medir la relacion entre profundidad efectiva, coste computacional y calidad, frente a transformers densos equivalentes en parametros.
- Fine-tuning de investigacion sobre tareas en ingles: al ser un modelo base de menos de 600 M de parametros en FP32 (2,3 GB de repo), es viable ajustarlo en una unica GPU dentro de proyectos academicos de dominio especifico (por ejemplo, clasificacion o generacion tecnica) partiendo de texto de FineWeb-Edu.
- Evaluacion de tecnicas de cuantizacion: el checkpoint FP32 permite estudiar la degradacion de calidad (NLL, CORE) al cuantizar a bfloat16, int8 o int4, aunque no existan versiones oficiales cuantizadas.
- Experimentos de distillation o pruning: su tamano moderado y su estructura recurrente lo hacen un sujeto razonable para investigar si el nucleo repetido puede comprimirse o destilarse hacia un transformer denso de tamano similar.
- Docencia y formacion: usar el modelo como ejemplo reproducible de un transformer no estandar (looped) para ensenar diferencias entre profundidad almacenada y profundidad efectiva.
- Generacion de texto base en ingles con contexto corto: prototipado de continuacion de texto o perplejidad comparada, siempre que se asuma que no hay alineacion ni seguimiento de instrucciones.

## Benchmarks y rendimiento

Los unicos datos numericos publicados en la informacion disponible son del benchmark CORE del paper (medias sobre semillas 0, 1 y 2, todos los 91.037 ejemplos de 22 tareas) y la NLL de validacion de preentrenamiento:

| Metrica | Valor |
|---|---|
| Pretraining validation NLL | 2,73449767 nats/token |
| CORE accuracy (media, 91.037 ejemplos, 22 tareas) | 0,17882870 |
| CORE answer NLL (media) | 2,71120602 nats/token |

No se han publicado resultados de benchmarks tipo MMLU, HumanEval, GSM8K o similares en la informacion disponible. Tampoco se dispone de resultados comparativos de estos mismos benchmarks para modelos alternativos dentro de la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32 (formato distribuido) los pesos ocupan aproximadamente 2,3 GB, por lo que la inferencia completa cabe en GPUs consumer de 8 GB o mas, contando activaciones.
- Si se convierte a bfloat16/FP16, los pesos bajan a aproximadamente 1,15 GB; a int8, unos 0,6 GB; a int4, unos 0,3 GB. Estas conversiones no estan publicadas oficialmente y requeririan trabajo propio.
- GPUs recomendadas: el paper usa H100 con FlashAttention-3 y autocast en bfloat16; para uso local, una RTX 4090, RTX 3090 o incluso una RTX 3060 de 12 GB son suficientes para inferencia y fine-tuning ligero.
- Cabe en GPU consumer: si, con holgura, dado que el repositorio completo pesa 2,3 GB.
- Opciones de despliegue: no hay soporte directo en vLLM, TGI, llama.cpp u Ollama, porque el checkpoint no es un `AutoModel` de Transformers ni esta en GGUF. El unico camino documentado es el codebase del paper (`https://github.com/cue-engineering/loop`), que incluye `eval.py` para evaluacion acotada (`--max-per-task`) o completa.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.
- Nota de despliegue: el checkpoint contiene solo tensores del modelo y la recurrencia de evaluacion final; no incluye estado del optimizador.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de los modelos comparables dentro de la informacion proporcionada, por lo que cualquier comparacion de rendimiento seria especulativa. La tabla siguiente recoge unicamente caracteristicas estructurales verificables y conocidas de alternativas de tamano comparable.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| loop-fwe-untied-grow-d10 | 575,7 M (FP32) | 2.048 | Ingles | No disponible | Requiere codebase propio del paper |
| GPT-2 large | 774 M | 1.024 | Ingles | Licencia MIT modificada | Transformers, safetensors |
| Pythia-410M | 410 M | 2.048 | Ingles | Apache 2.0 | Transformers, safetensors |
| TinyLlama-1.1B | 1,1 B | 2.048 | Ingles | Apache 2.0 | Transformers, GGUF, vLLM |

Los datos de rendimiento (CORE, MMLU u otros) de estas alternativas no estan incluidos en la informacion disponible, por lo que no se pueden contrastar numericamente con el 0,1788 de CORE accuracy del modelo analizado.

## Limitaciones y advertencias

- Es un modelo base: no sigue instrucciones, no tiene plantilla de chat y no esta alineado con preferencias humanas (sin RLHF/DPO documentados).
- Solo ingles: no hay soporte multilingue declarado.
- Contexto corto: 2.048 tokens, insuficiente para tareas de documento largo o conversaciones extensas.
- Licencia no disponible: no se puede asumir permiso de uso comercial; conviene contactar con el autor antes de cualquier uso en produccion.
- Riesgo de sesgos y alucinacion: al entrenarse sobre FineWeb-Edu (texto web filtrado), hereda sesgos del corpus y puede generar afirmaciones factualmente incorrectas; la NLL de validacion de 2,7345 nats/token indica un ajuste propio de un modelo base pequeno, no de un asistente fiable.
- Calidad limitada: el CORE accuracy de 0,1788 sobre 22 tareas es bajo en terminos absolutos; es un artefacto de investigacion, no un modelo de proposito general.
- Integracion restringida: no es un `AutoModel` de Transformers, no hay GGUF y no se soporta en vLLM, TGI, Ollama o llama.cpp sin trabajo de conversion. El uso requiere el codebase del paper.
- Trazabilidad: los pesos son identicos bit a bit al checkpoint del paper y se acompanan de `SHA256SUMS`, pero el estado del optimizador no se distribuye, lo que impide reanudar el preentrenamiento.
- Ambiguedad de configuracion: la coordenada de profundidad d10 puede diferir del numero de bloques realmente ejecutados, por lo que no debe interpretarse como "10 capas".
- Fecha de publicacion en el repositorio: 2026-09-16, con 0 descargas y 0 "likes" en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/CharlieChen/loop-fwe-untied-grow-d10
- Codebase del paper: https://github.com/cue-engineering/loop
- Dataset de preentrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Paper "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents": no disponible (no se ha facilitado URL directa)
- Repositorio del tokenizador tiktoken (GPT-2): no disponible en la informacion proporcionada
- Nota sobre la busqueda web: los resultados devueltos no guardan relacion con el modelo (versan sobre la gestion de actividad de Facebook) y no aportan informacion adicional utilizable.
