# CharlieChen/loop-fwe-untied-grow-d26

## Resumen

loop-fwe-untied-grow-d26 es un modelo de lenguaje base de 7.424.049.152 parametros publicado por el usuario CharlieChen en Hugging Face. Se corresponde con uno de los checkpoints finales de la escalera de escalado sobre FineWeb-Edu descrita en el trabajo *How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents*. Su coordenada de profundidad es d26 y pertenece a la variante denominada Untied-Grow.

Tecnicamente es un transformer con recursion de bloques (looped transformer) de 3.328 unidades de ancho, 26 cabezas de atencion y 2.048 tokens de contexto, entrenado sobre FineWeb-Edu con el tokenizador GPT-2. No ha recibido ajuste por instrucciones: es un checkpoint de preentrenamiento puro que conserva el artefacto original del entrenamiento, sin estado del optimizador para reanudarlo.

Su relevancia es metodologica mas que practica: permite estudiar como el crecimiento del modelo, la recursion de profundidad y los operadores de frontera influyen en los exponentes de escalado. No es un modelo orientado a producto: el repositorio no registra descargas ni likes, la licencia no esta declarada y el checkpoint no es compatible con `AutoModel` de Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con recursion de bloques (looped transformer), variante Untied-Grow del articulo sobre crecimiento, recursion y operadores de frontera |
| Parametros totales | 7.424.049.152 (almacenados en FP32) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (solo se distribuye el checkpoint FP32 original; el articulo evalua con autocast en bfloat16) |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`final.pt`); no es un checkpoint de Transformers `AutoModel`, no hay safetensors ni GGUF |
| Ancho (hidden size) | 3.328 |
| Cabezas de atencion | 26 (dimension de cabeza derivada: 128) |
| Modo de profundidad | `dep` |
| Repeticiones del nucleo | 4 (configuradas y en evaluacion final) |
| Tokenizador | GPT-2 (`tiktoken.get_encoding("gpt2")`) |
| Vocabulario | 50.257 tokens, ampliado a 50.304 filas del modelo |
| NLL de validacion (preentrenamiento) | 2,137188 nats/token |
| Tamano del repositorio | 29,7 GB |

## Arquitectura y entrenamiento

El modelo pertenece a la familia de los *looped transformers*: un mismo nucleo de bloques Transformer se ejecuta de forma recursiva en lugar de apilar capas distintas. La configuracion declara un modo de profundidad `dep` con 4 repeticiones del nucleo, aunque la model card advierte explicitamente de que la coordenada de profundidad d26 es la coordenada de escalado de la escalera experimental y no tiene por que coincidir con el numero de bloques Transformer efectivamente ejecutados. El checkpoint se almacena con 7.424.049.152 parametros en FP32 (29,696 GB), un tokenizador GPT-2 con vocabulario de 50.257 entradas ampliado a 50.304 filas del modelo, y atencion con 26 cabezas sobre un ancho de 3.328.

El entrenamiento se realizo sobre el corpus FineWeb-Edu, un subconjunto filtrado por criterios educativos de Common Crawl. No se documenta en la informacion disponible el numero de tokens vistos, la composicion detallada del dataset ni si hubo etapas de RLHF, DPO u otro ajuste por preferencias; la model card indica de forma explicita que se trata de un modelo base sin ajuste por instrucciones. La metrica de validacion publicada es la NLL sobre el propio corpus de preentrenamiento (2,137188 nats/token), que el autor distingue de la NLL de respuestas de la suite CORE. El articulo utiliza H100 con FlashAttention-3 y autocast en bfloat16, y el artefacto incluye los argumentos de entrenamiento junto con los pesos y un fichero de sumas SHA256.

## Capacidades

- Generacion de texto en ingles mediante prediccion del siguiente token, en modo completado de documentos.
- Modelo base de preentrenamiento: no sigue instrucciones, no mantiene formato de chat y no ha sido alineado con preferencias humanas.
- Razonamiento, codigo y matematicas: no disponible, no se han publicado evaluaciones especificas en la informacion disponible.
- Tool calling / function calling: no soportado de forma nativa; al no haber ajuste por instrucciones no se documenta ningun formato de llamada a herramientas.
- Soporte de agentes y razonamiento multi-paso: no soportado ni documentado.
- Capacidades multilingues: limitadas al ingles (etiqueta `en`); el tokenizador GPT-2 cubre otros idiomas de forma limitada, pero no hay evidencia de entrenamiento multilingue.
- Capacidad especial: recursion de profundidad configurable (repeticiones del nucleo), que es precisamente el objeto de estudio del articulo.
- Evaluacion reproducible: el repositorio admite la suite CORE de 22 tareas con semillas 0, 1 y 2 mediante el script `eval.py` del codigo del articulo.
- Vision, audio o modo de razonamiento explicito (*thinking*): no disponibles.

## Casos de uso

- Investigacion en leyes de escalado: el checkpoint es un punto concreto de la escalera FineWeb-Edu del articulo, por lo que permite reproducir y ajustar los exponentes de escalado en funcion de la coordenada de profundidad d26 y del regimen de crecimiento del modelo.
- Estudio de transformadores recursivos: sirve para medir el efecto de variar las repeticiones del nucleo sobre la perdida de validacion, comparando la coordenada de profundidad configurada con el numero real de bloques ejecutados.
- Punto de partida para ajuste fino supervisado en ingles: al ser un modelo base de 7.424 millones de parametros, puede adaptarse a tareas concretas de clasificacion o generacion mediante fine-tuning, siempre que se reconstruya la clase `TransformerGPT` del repositorio del articulo.
- Preentrenamiento continuado sobre dominios especificos: el checkpoint conserva pesos y argumentos de entrenamiento, lo que facilita continuar el entrenamiento sobre corpus tecnicos o cientificos en ingles, aunque no incluye estado del optimizador.
- Generacion de texto sintetico en ingles: puede emplearse para producir corpus de completado de documentos largos (hasta 2.048 tokens) con fines de aumento de datos, asumiendo la ausencia de filtrado por instrucciones.
- Destilacion de conocimiento: al ser un modelo base denso, puede actuar como profesor en procesos de destilacion hacia modelos mas pequenos en ingles, aprovechando su NLL de validacion como referencia cuantitativa.
- Banco de pruebas de infraestructura de evaluacion: el repositorio esta preparado para ejecutar la suite CORE con limites por tarea (`--max-per-task`) y varias semillas, lo que lo hace util para validar pipelines de evaluacion antes de lanzar campanas completas.
- Analisis de sesgos y composicion de datos: permite estudiar que tipo de sesgos introduce el filtrado educativo de FineWeb-Edu en un modelo de 7.400 millones de parametros sin alineacion posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica cuantitativa recogida en la model card es la perdida de validacion sobre el corpus de preentrenamiento:

| Metrica | Valor | Notas |
|---|---|---|
| NLL de validacion (preentrenamiento) | 2,137188 nats/token | Medida sobre el corpus FineWeb-Edu; no es comparable directamente con NLL de respuestas de CORE |
| Suite CORE (22 tareas) | no disponible | El autor describe el procedimiento y el script, pero no publica puntuaciones completas en la informacion disponible |
| MMLU, HumanEval, GSM8K u otros | no disponible | Sin datos |

## Requisitos de hardware

- Inferencia en FP32: los 7.424.049.152 parametros ocupan 29,696 GB solo en pesos, por lo que se necesitan del orden de 32-40 GB de VRAM sumando activaciones y cache de atencion; GPU tipo A100 40 GB, A100 80 GB o H100.
- Inferencia con autocast en bfloat16: los pesos bajan a unos 14,85 GB, lo que permite ejecucion en una unica GPU de 24 GB como la RTX 4090, siempre que se reconstruya el modelo con el codigo del articulo.
- Cuantizacion a 8 bits (~7,4 GB) o 4 bits (~3,7 GB): teoricamente viable por tamano, pero no hay artefactos GGUF, AWQ, GPTQ ni equivalentes publicados, por lo que requeriria conversion manual y verificar la compatibilidad con la arquitectura recursiva.
- GPU recomendadas segun el propio articulo: H100 con FlashAttention-3 y autocast en bfloat16.
- Compatibilidad con GPU de consumo: si cabe en RTX 4090 / RTX 3090 (24 GB) en bfloat16 o FP16; en FP32 exigiria configuraciones multi-GPU o memoria unificada.
- Opciones de despliegue: no compatible de forma directa con vLLM, llama.cpp, Ollama o TGI, ya que el checkpoint es un artefacto PyTorch de un `TransformerGPT` propio y no un `AutoModel` de Transformers. El despliegue requiere el repositorio `cue-engineering/loop` y su script `eval.py`.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo por lote para este checkpoint.

## Comparativa con modelos similares

Los datos de la columna de alternativas proceden de las model cards publicas de cada proyecto, no de la busqueda realizada, que no devolvio resultados tecnicos relevantes. No existen cifras de benchmarks para loop-fwe-untied-grow-d26, por lo que la comparacion es estructural y de licencia, no de rendimiento.

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|
| loop-fwe-untied-grow-d26 | 7,42 B | 2.048 | Looped transformer (Untied-Grow) | no disponible | PyTorch `.pt`; codigo de investigacion; 0 descargas |
| Llama 3.1 8B | ~8,03 B | 128.000 | Transformer denso con GQA | Llama 3.1 Community License | safetensors; amplio ecosistema (vLLM, TGI, llama.cpp) |
| Mistral 7B v0.3 | ~7,25 B | 32.000 | Transformer denso con GQA y sliding window attention | Apache 2.0 | safetensors; amplio ecosistema |
| Pythia-6.9B | 6,9 B | 2.048 | Transformer denso tipo GPT-NeoX | Apache 2.0 | safetensors; disenado para investigacion de escalado |

Frente a estas alternativas, el modelo de CharlieChen aporta unicamente el valor cientifico de su regimen recursivo: pierde en longitud de contexto (2.048 frente a 32.000 o 128.000), no declara licencia, carece de soporte en el ecosistema de inferencia habitual y no publica resultados de benchmarks comparables.

## Limitaciones y advertencias

- No esta ajustado por instrucciones: no sigue ordenes, no responde en formato conversacional y puede producir continuaciones irrelevantes si se usa como asistente.
- Licencia no declarada: la ausencia de licencia explicita impide asumir permisos de uso comercial; en la practica, el uso en produccion queda en un limbo legal hasta que el autor lo aclare.
- Solo ingles: no hay soporte declarado para otros idiomas, y el tokenizador GPT-2 penaliza lenguas con morfologia rica.
- Contexto corto: 2.048 tokens, insuficiente para documentos largos, resumen de expedientes o conversaciones multi-turno extensas.
- Barrera de ingenieria: no es un checkpoint de Transformers, no dispone de safetensors ni GGUF y requiere reconstruir un modelo personalizado con el codigo del articulo, lo que descarta vLLM, Ollama, llama.cpp y TGI sin trabajo de portado previo.
- Sin estado del optimizador: el autor advierte que el checkpoint no permite reanudar el entrenamiento original, solo inferencia o reinicio de un ajuste.
- Riesgo de alucinacion: como modelo base entrenado unicamente con prediccion del siguiente token sobre texto web filtrado, no tiene ningun mecanismo de verificacion factual ni de rechazo de peticiones daninas.
- Sesgos conocidos: heredados de FineWeb-Edu y de Common Crawl, con el sesgo adicional que introduce el filtrado por criterios educativos; no se documenta ninguna evaluacion de sesgo.
- Ausencia de evidencia empirical: sin benchmarks publicados, sin descargas y sin likes, no hay validacion externa del rendimiento del modelo mas alla de su NLL de validacion.
- Riesgo de interpretacion de la profundidad: la coordenada d26 no equivale al numero de bloques ejecutados, por lo que comparaciones ingenuas con modelos densos de profundidad similar pueden ser incorrectas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CharlieChen/loop-fwe-untied-grow-d26
- Repositorio de codigo del articulo: https://github.com/cue-engineering/loop
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Articulo de referencia: *How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents* (sin URL disponible en la informacion proporcionada)
- Resultados de busqueda web: no se han encontrado enlaces tecnicos relevantes sobre este modelo; la busqueda devolvio unicamente articulos divulgativos genericos sobre el termino "query" sin relacion con el modelo.
