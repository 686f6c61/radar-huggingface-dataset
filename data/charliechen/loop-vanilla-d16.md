# CharlieChen/loop-vanilla-d16

## Resumen

loop-vanilla-d16 es un modelo de lenguaje base (pretrained, sin ajuste por instrucciones) publicado por el usuario CharlieChen en Hugging Face. Se trata del checkpoint final original empleado en la escalera de escalado sobre FineWeb del articulo "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents". La etiqueta del repositorio es "looped-transformer", pero el propio autor aclara que esta variante es la "vanilla": el modo de profundidad configurado es `none` y las repeticiones del nucleo son 1, es decir, actua como linea base sin recursion efectiva.

El modelo almacena 1.028.128.768 parametros en FP32 (4,113 GB) y sigue una arquitectura transformer decoder-only con una anchura de 2048, 16 cabezas de atencion y una longitud de contexto de 2048 tokens. Emplea el tokenizador GPT-2 de `tiktoken` con un vocabulario de 50.257 tokens ampliado a 50.304 filas. Su NLL de validacion en el corpus de pretraining es de 2,825932 nats/token.

Su relevancia es fundamentalmente cientifica: sirve como punto de comparacion reproducible frente a variantes con crecimiento de profundidad, recursion y operadores de frontera dentro del mismo estudio de leyes de escalado. No es un modelo orientado a producto: no incluye ajuste por instrucciones, no se distribuyen pesos cuantizados y no es un checkpoint compatible con `AutoModel` de Transformers, sino un artefacto PyTorch que requiere el codigo del articulo para reconstruirse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only; etiqueta "looped-transformer", modo de profundidad `none`, repeticiones configuradas 1 (sin recursion efectiva) |
| Parametros totales | 1.028.128.768 (~1,03 mil millones) almacenados en FP32 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible; solo se publica el checkpoint original en FP32 |
| Idiomas soportados | ingles (`en`) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`final.pt`); no se distribuyen safetensors ni GGUF |
| Anchura (hidden size) | 2.048 |
| Cabezas de atencion | 16 |
| Tokenizador | GPT-2 (`tiktoken.get_encoding("gpt2")`) |
| Vocabulario | 50.257 tokens, ampliado a 50.304 filas del modelo |
| Corpus de entrenamiento | FineWeb (`HuggingFaceFW/fineweb`) |
| NLL de validacion (pretraining) | 2,825932 nats/token |
| Tamano del repositorio | 4,1 GB |
| Archivos incluidos | `final.pt`, `result.json`, `SHA256SUMS` |
| Fecha de publicacion | 2026-09-16 (ultima actualizacion 2026-09-16) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tipo denso, con 2048 dimensiones de modelo y 16 cabezas de atencion. La etiqueta `looped-transformer` hace referencia a la familia arquitectonica del estudio, en la que la profundidad se trata como coordenada de escalado y puede repetirse (recursion del nucleo). En este checkpoint concreto, sin embargo, el modo de profundidad es `none` y las repeticiones configuradas y usadas en la evaluacion final son 1, por lo que su comportamiento corresponde al de un transformer apilado convencional de profundidad fija. El articulo no proporciona en la model card el numero de bloques ejecutados.

El entrenamiento se realizo sobre FineWeb como corpus unico, con el tokenizador GPT-2 y sin etapa de ajuste por instrucciones (no hay RLHF, DPO ni SFT declarados). La unica metrica de validacion publicada es la NLL sobre el propio corpus de pretraining (2,825932 nats/token), que el autor distingue explicitamente de la NLL de respuestas del benchmark CORE. La evaluacion del paper se ejecuto en GPUs H100 con FlashAttention-3 y autocast en bfloat16. El checkpoint conserva los pesos aprendidos y los argumentos de entrenamiento, pero no el estado del optimizador, por lo que no permite reanudar el entrenamiento.

## Capacidades

- Generacion de texto autoregresiva en ingles, en modo base (continuacion de prompt).
- Modelado de lenguaje puro: la tarea para la que fue entrenado es la prediccion del siguiente token sobre FineWeb.
- Capacidad de servir como linea base experimental para comparar leyes de escalado frente a variantes con recursion, crecimiento de profundidad u operadores de frontera.
- Evaluacion mediante el benchmark CORE del codebase del articulo (22 tareas, semillas 0/1/2).
- No dispone de tool calling ni function calling.
- No dispone de modo de razonamiento explicito (`thinking mode`), ni capacidades de vision, audio o multimodalidad.
- No tiene comportamiento de agente ni soporte documentado para razonamiento multi-paso.
- Multilingue: no; el modelo esta etiquetado unicamente para ingles.

## Casos de uso

- Reproduccion de resultados cientificos: reconstruir el modelo con el codebase `cue-engineering/loop` y el archivo `result.json` para replicar la escalera de escalado sobre FineWeb del articulo, verificando la NLL de validacion de 2,825932 nats/token.
- Linea base en estudios de arquitectura: comparar esta variante "vanilla" (profundidad `none`, una repeticion) contra variantes con recursion del nucleo para aislar el efecto del bucle sobre la calidad del modelado.
- Ajuste fino supervisado en dominio ingles: al ser un modelo base de ~1,03 mil millones de parametros y 2048 tokens de contexto, admite fine-tuning completo o con LoRA en tareas de clasificacion, resumen o generacion especializada en ingles.
- Generacion de datos sinteticos: usar el modelo como generador de texto en ingles para aumentar corpus de entrenamiento o para destilar comportamiento hacia modelos mas pequenos.
- Investigacion en interpretabilidad: al ser un checkpoint denso y relativamente compacto con pesos FP32 intactos, resulta adecuado para analisis de activaciones, atencion y circuitos internos sin perdida por cuantizacion.
- Pruebas de infraestructura y kernels: el propio autor documenta una evaluacion de humo acotada (`--max-per-task 10`) pensada para validar el pipeline de evaluacion en GPU con FlashAttention-3 y bfloat16.
- Benchmarking de hardware y comparativas de rendimiento: el modelo permite medir latencia y throughput de un transformer de 1B parametros con contexto 2048 en distintas GPU, aunque no se publican cifras de referencia.
- Docencia y experimentacion academica: por su tamano (4,1 GB en FP32) cabe en entornos de investigacion modestos y sirve para ilustrar tecnicas de escalado y recursion.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| NLL de validacion en pretraining | 2,825932 nats/token | Medida sobre el corpus FineWeb; distinta de la NLL de respuestas de CORE |
| CORE (22 tareas, semillas 0/1/2) | no disponible en la informacion proporcionada | El codebase permite ejecutarlo con `eval.py`; los resultados de humo no equivalen a los del paper |
| MMLU | no disponible en la informacion proporcionada | No publicado en la model card |
| HumanEval | no disponible en la informacion proporcionada | No publicado en la model card |
| GSM8K | no disponible en la informacion proporcionada | No publicado en la model card |
| Comparativas con modelos similares | no disponible en la informacion proporcionada | El autor no incluye tabla comparativa en el repositorio |

## Requisitos de hardware

- Pesos en FP32: 4,113 GB en disco y en memoria al cargar el checkpoint tal cual.
- Pesos en bfloat16/float16 para inferencia: aproximadamente 2,06 GB, ya que el autor documenta autocast en bfloat16 durante la evaluacion.
- VRAM total estimada: no disponible con precision, porque depende de la implementacion y del numero de bloques, dato que no se publica. Como referencia, un transformer denso de ~1B parametros con contexto 2048 suele requerir entre 4 y 8 GB en bfloat16 incluyendo cache KV y activaciones; conviene tratarlo como estimacion orientativa.
- GPU aptas para inferencia: cualquier GPU con 8 GB o mas de VRAM (por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090) puede alojar los pesos; no se han publicado mediciones especificas para estos modelos.
- GPU utilizadas en el paper: H100, con FlashAttention-3 y autocast en bfloat16.
- Caber en GPU de consumo: si, es un modelo de ~1B parametros; el limite practico es la memoria del subsistema grafico, no el tamano de los pesos.
- Opciones de despliegue: no hay soporte directo para vLLM, llama.cpp, Ollama ni TGI, porque el checkpoint es un `TransformerGPT` personalizado y no un `AutoModel` de Transformers. El unico camino documentado es el codebase `cue-engineering/loop` con PyTorch; usarlo en otros runtimes exigiria convertir y reimplementar la arquitectura.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Los valores de los modelos alternativos proceden de su documentacion publica y se ofrecen como referencia orientativa; el autor de loop-vanilla-d16 no publica ninguna comparativa.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| loop-vanilla-d16 | ~1,03 B (FP32) | 2.048 | Ingles | no disponible | PyTorch `.pt`, requiere codigo propio |
| GPT-2 XL | ~1,5 B | 1.024 | Ingles (multilingue limitado) | MIT | Safetensors/PyTorch, integrado en Transformers |
| TinyLlama-1.1B | ~1,1 B | 2.048 | Ingles | Apache 2.0 | Safetensors, ampliamente soportado |
| Pythia-1B | ~1,0 B | 2.048 | Ingles | Apache 2.0 | Safetensors, integrado en Transformers |

Diferencias clave: loop-vanilla-d16 no ofrece licencia declarada, lo que impide determinar si su uso comercial esta permitido, y no es desplegable con las herramientas estandar de inferencia. Frente a GPT-2 XL, TinyLlama y Pythia, su interes no es el rendimiento en tareas finales, sino la reproducibilidad del experimento de escalado y la disponibilidad del checkpoint exacto del articulo.

## Limitaciones y advertencias

- Licencia no disponible: sin terminos declarados no puede asumirse permiso de uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Modelo base sin instruction tuning: no sigue instrucciones de forma fiable y puede generar continuaciones irrelevantes, repetitivas o incoherentes con la intencion del usuario.
- Riesgo de alucinacion: como modelo puramente autoregresivo entrenado sobre FineWeb, no verifica hechos y puede producir afirmaciones falsas con fluidez.
- Sesgos: FineWeb es un corpus de web filtrada en ingles; es esperable que el modelo reproduzca sesgos sociales, culturales y de representacion presentes en esa fuente, ademas de contenido toxico residual.
- Idioma: soporte unicamente en ingles; el rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera deficiente.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas sin estrategias de troceado.
- No es un checkpoint `AutoModel`: exige codigo personalizado (`TransformerGPT`) del repositorio `cue-engineering/loop`, lo que complica su integracion, auditoria y mantenimiento.
- Ausencia de estado del optimizador: no permite reanudar el entrenamiento original, solo inferencia o fine-tuning desde cero del optimizador.
- Sin cuantizaciones publicadas: no hay versiones GGUF, AWQ, GPTQ ni similares, lo que limita el despliegue en entornos con poca memoria si no se generan manualmente.
- Cero adopcion: 0 descargas y 0 likes en el momento de la consulta, sin evidencia externa de validacion por parte de la comunidad.
- Metricas limitadas: la unica cifra publicada es la NLL de pretraining; no hay resultados de MMLU, HumanEval, GSM8K ni de la suite CORE completa, por lo que no puede evaluarse su calidad en tareas downstream.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CharlieChen/loop-vanilla-d16
- Codebase del articulo: https://github.com/cue-engineering/loop
- Corpus de entrenamiento (FineWeb): https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Articulo de referencia: "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents" (URL no disponible en la informacion proporcionada)
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los unicos enlaces recuperados correspondian a contenidos sin relacion (paginas sobre la mina de sal de Wieliczka).
