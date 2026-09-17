# CharlieChen/loop-untied-grow-d12

## Resumen

loop-untied-grow-d12 es un modelo de lenguaje base (sin ajuste por instrucciones) publicado por el usuario CharlieChen en Hugging Face. Forma parte de la "FineWeb scaling ladder" del articulo *How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents*, y corresponde a la coordenada de profundidad d12 de la variante "Untied Grow". El checkpoint contiene 834.011.136 parametros almacenados en FP32 (3,336 GB) y se distribuye como artefacto de investigacion reproducible, no como modelo listo para produccion.

Se trata de un transformer con recurrencia de bloques (looped transformer): el modelo reutiliza un nucleo de capas un numero configurable de veces (4 repeticiones en la configuracion final), de modo que la "profundidad" declarada actua como coordenada de escalado y no tiene por que coincidir con el numero de bloques Transformer ejecutados. El entrenamiento se hizo sobre el corpus FineWeb con el tokenizador GPT-2 de tiktoken (50.257 tokens de vocabulario, ampliados a 50.304 filas en el modelo) y una longitud de contexto de 2.048 tokens.

Su relevancia es fundamentalmente cientifica: sirve para estudiar como crecen los exponentes de escalado al variar profundidad, recursion y operadores de frontera, y para reproducir los resultados del articulo. No incluye instruction tuning, no tiene estado de optimizador para reanudar entrenamiento y no es un checkpoint compatible con `AutoModel` de Transformers, por lo que su uso requiere el codigo propio de los autores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con recurrencia de bloques (looped transformer), variante "Untied Grow" |
| Parametros totales | 834.011.136 (almacenados en FP32) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible; solo se publica el checkpoint en FP32, sin versiones cuantizadas |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`final.pt`, FP32); no safetensors, no GGUF |
| Ancho del modelo (d_model) | 1536 |
| Cabezas de atencion | 12 |
| Modo de profundidad | `dep` |
| Repeticiones del nucleo | 4 configuradas / 4 en la evaluacion final |
| Vocabulario | 50.257 tokens (tokenizador GPT-2 de tiktoken), ampliado a 50.304 filas |
| Corpus de entrenamiento | FineWeb (HuggingFaceFW/fineweb) |
| Checkpoint | Incluye pesos y argumentos de entrenamiento; sin estado de optimizador |

## Arquitectura y entrenamiento

La arquitectura es un transformer con recurrencia de bloques: un nucleo de capas se ejecuta varias veces (4 repeticiones configuradas) en lugar de apilar capas independientes. El nombre "Untied Grow" indica que el esquema de crecimiento de profundidad empleado durante la escalera de escalado mantiene pesos no compartidos entre iteraciones, y "d12" identifica la coordenada de profundidad dentro de esa escalera. Segun la propia model card, esa coordenada de profundidad es la coordenada de escalado de la escalera y no equivale necesariamente al numero de bloques Transformer ejecutados. El modelo tiene ancho 1536, 12 cabezas de atencion y vocabulario de 50.257 tokens del tokenizador GPT-2 (`tiktoken.get_encoding("gpt2")`), con las filas de embedding ampliadas a 50.304.

El entrenamiento se realizo sobre FineWeb con contexto de 2.048 tokens. La validacion de preentrenamiento registrada es de 2,850924 nats/token de NLL, medida sobre el propio corpus de preentrenamiento (la model card aclara que es una metrica distinta de la NLL de respuestas de CORE). El articulo empleo GPUs H100, FlashAttention-3 y autocast en bfloat16. El artefacto publicado es el checkpoint final original: conserva los pesos aprendidos y los argumentos de entrenamiento, pero no el estado del optimizador, por lo que no permite reanudar el entrenamiento tal cual. No se indica en la informacion disponible si hubo RLHF, DPO u otras fases de alineamiento; al ser un modelo base, cabe esperar que no las haya, pero no se confirma explicitamente.

## Capacidades

- Generacion de texto autoregresiva en ingles: es un modelo base de tipo `text-generation`, entrenado para modelado de lenguaje causal.
- Modelado de lenguaje y calculo de perplexity/NLL sobre corpus en ingles (NLL de validacion de preentrenamiento: 2,850924 nats/token).
- Reproduccion de experimentos de escalado: permite reconstruir la escalera de profundidad del articulo y comparar exponentes de escalado con otras coordenadas d.
- Estudio de recursion y reutilizacion de bloques: al ejecutar el nucleo varias veces, sirve para analizar el efecto de la profundidad efectiva frente a la profundidad declarada.
- Evaluacion con el harness CORE del articulo: 22 tareas con semillas 0/1/2 mediante `eval.py` del repositorio `cue-engineering/loop`.
- Extraccion de representaciones internas para analisis de probing, ya que el checkpoint expone pesos en FP32 sin cuantizar.
- Punto de partida para ajuste fino supervisado o adaptacion de dominio sobre texto en ingles.
- Limitaciones de capacidad: no hay soporte documentado de tool calling, function calling, agentes, multi-step reasoning, modo "thinking", vision ni audio.
- Multilingue: no; la model card declara unicamente ingles.

## Casos de uso

- Reproduccion de resultados cientificos: cargar `final.pt` junto con `result.json` y ejecutar `eval.py` con el harness CORE para replicar las cifras del articulo sobre las 22 tareas y las semillas 0/1/2. Es el uso previsto por los autores.
- Estudio de exponentes de escalado: comparar la curva de perdida de la coordenada d12 con otras coordenadas de la escalera para analizar como afectan el crecimiento, la recursion y los operadores de frontera a los exponentes de escalado.
- Analisis de arquitecturas recurrentes: medir el efecto de las 4 repeticiones del nucleo sobre la calidad del modelado de lenguaje y sobre el coste computacional, frente a un transformer de profundidad equivalente sin recursion.
- Ajuste fino sobre dominios concretos en ingles: al ser un modelo base de 834 M de parametros con contexto de 2.048 tokens, se puede adaptar con SFT a tareas de clasificacion, resumen o extraccion sobre texto en ingles cuando se dispone de datos etiquetados.
- Extraccion de caracteristicas y probing: generar representaciones de capas intermedias en FP32 para entrenar clasificadores ligeros o estudiar que informacion codifica cada iteracion del nucleo recurrente.
- Docencia e investigacion en eficiencia de parametros: sirve como ejemplo practico de transformer con pesos no compartidos en la recursion, con un tamano (834 M) que cabe en una GPU de consumo.
- Pruebas de kernels y precision: validar FlashAttention-3 y autocast en bfloat16 sobre una arquitectura no estandar, comparando estabilidad numerica y rendimiento frente a FP32.
- Generacion de texto base para experimentos controlados: producir continuaciones de texto en ingles para estudios de diversidad, repeticion o sesgo, siempre sin esperar calidad de modelo instruido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica registrada es la perdida de validacion de preentrenamiento sobre FineWeb: 2,850924 nats/token. La model card indica que la evaluacion CORE completa existe (22 tareas, semillas 0/1/2) y documenta como ejecutarla, pero no incluye las puntuaciones. Se advierte explicitamente de que las puntuaciones de la evaluacion de humo (`--max-per-task 10`) no equivalen a los resultados completos del articulo.

| Metrica | Valor | Notas |
|---|---|---|
| NLL de validacion (preentrenamiento) | 2,850924 nats/token | Medida sobre el corpus FineWeb; distinta de la NLL de respuestas de CORE |
| CORE (22 tareas) | no disponible | Ejecutable con el codigo del articulo, sin resultados publicados en la ficha |
| MMLU / HumanEval / GSM8K | no disponible | No se reportan |

## Requisitos de hardware

- Pesos en FP32: 3,336 GB solo de parametros. Con activaciones y overhead de inferencia en FP32, el consumo realista ronda los 5-8 GB de VRAM segun longitud de secuencia y tamano de lote.
- Pesos en bfloat16: aproximadamente 1,67 GB si se convierte el checkpoint (el articulo usa autocast en bfloat16). Con activaciones, cabria en GPUs de 4-6 GB de VRAM.
- GPU de consumo: si, cabe holgadamente en una RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 o RTX 4090. Tambien en GPUs de 8 GB si se usa bf16 y lotes pequenos.
- GPU de centro de datos: el articulo usa H100 con FlashAttention-3. Tambien es viable en A100, L40S o similares; no requiere memoria agregada ni paralelismo multi-GPU.
- Opciones de despliegue: no es un checkpoint compatible con `AutoModel` de Transformers, por lo que no funciona directamente en vLLM, TGI, llama.cpp, Ollama ni servidores compatibles con GGUF. La via soportada es el repositorio `cue-engineering/loop` con el modelo `TransformerGPT` propio, reconstruido a partir de `result.json`.
- Almacenamiento: 3,3 GB de repositorio (checkpoint FP32 mas metadatos y sumas SHA256).
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia por peticion.
- Nota practica: al no existir versiones cuantizadas oficiales, cualquier despliegue con cuantizacion exigiria exportar los pesos a otro formato y validar la equivalencia numerica por cuenta propia.

## Comparativa con modelos similares

No se dispone de una comparativa publicada dentro de la informacion proporcionada. La tabla siguiente situa el modelo frente a alternativas de escala parecida (en el rango de 800 M a 1,5 B de parametros) usando datos publicos de sus respectivas fichas; los valores de los modelos comparativos no provienen de la informacion proporcionada y conviene verificarlos antes de citarlos.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| loop-untied-grow-d12 | 834 M | 2.048 | Transformer con recurrencia de bloques, modelo base | no disponible | Checkpoint PyTorch en HF, requiere codigo propio |
| Pythia-1B | 1,0 B | 2.048 | Transformer denso, modelo base | Apache 2.0 | Pesos en HF, compatible con Transformers |
| OLMo-1B | 1,17 B | 2.048 | Transformer denso, modelo base | Apache 2.0 | Pesos en HF, compatible con Transformers |
| GPT-2 XL | 1,5 B | 1.024 | Transformer denso, modelo base | MIT | Pesos en HF, compatible con Transformers |

La diferencia clave de loop-untied-grow-d12 no es el rendimiento, sino el proposito: es un artefacto de investigacion sobre leyes de escalado con recursion, con un pipeline de carga y evaluacion especifico, mientras que las alternativas son checkpoints genericos listos para `AutoModel`. No hay datos de benchmarks que permitan comparar calidad de forma directa.

## Limitaciones y advertencias

- Licencia no disponible: no se especifica ninguna licencia en la ficha ni en la model card. Esto impide asumir permiso de uso comercial; hay que contactar con el autor antes de cualquier uso en produccion.
- Modelo base sin instruction tuning: no sigue instrucciones, no esta alineado y puede generar contenido inapropiado, repetitivo o incoherente. No debe exponerse directamente a usuarios finales.
- Riesgo de alucinacion: como todo modelo de lenguaje generativo, puede producir afirmaciones falsas con apariencia plausible; el riesgo es mayor al no haber pasado por RLHF/DPO.
- Idioma: entrenado y declarado unicamente para ingles. No hay soporte multilingue documentado.
- Contexto limitado: 2.048 tokens. Las tareas que requieran ventanas mas largas (documentos extensos, conversaciones largas, repositorios de codigo) quedan fuera de su alcance sin tecnicas externas.
- Sin estado de optimizador: el checkpoint no permite reanudar el entrenamiento original, solo inferencia o ajuste fino desde cero del optimizador.
- Incompatibilidad de ecosistema: no es un `AutoModel` de Transformers. No funciona con vLLM, TGI, llama.cpp, Ollama ni herramientas que esperen safetensors/GGUF. Esto descarta pipelines de despliegue estandar y complica el uso en produccion.
- Formato FP32: 3,3 GB de checkpoint y sin versiones cuantizadas oficiales. Cualquier cuantizacion hay que hacerla y validarla por cuenta propia.
- Sin benchmarks publicos: no hay MMLU, HumanEval, GSM8K ni resultados CORE en la ficha. Las puntuaciones de la evaluacion de humo no son comparables con los resultados completos del articulo.
- Adopcion nula: 0 descargas y 0 "likes" en el momento de la consulta, sin comunidad ni soporte documentado mas alla del repositorio de los autores.
- Uso previsto de investigacion: la propia model card lo describe como artefacto de investigacion para reproducir un experimento de escalado, no como modelo para aplicaciones.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o equidad. Al entrenar sobre FineWeb (texto web sin filtrar mas alla del pipeline del dataset), es esperable que herede sesgos presentes en ese corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CharlieChen/loop-untied-grow-d12
- Repositorio de codigo del articulo: https://github.com/cue-engineering/loop
- Dataset de entrenamiento (FineWeb): https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Articulo *How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents*: no disponible (no se proporciona enlace)
- Demo o espacio interactivo: no disponible
- Resultados de la busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a plataformas Moodle sin relacion con el modelo.
