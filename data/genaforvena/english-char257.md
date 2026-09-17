# genaforvena/english-char257

## Resumen

English char257 es un modelo de lenguaje diminuto de tipo GPT-2 desarrollado por el usuario genaforvena como parte del proyecto `finnegans-fake`. Se trata de un transformer decoder-only de 6 capas, 6 cabezas de atención y 384 dimensiones de embedding, con 10.942.848 parámetros y una longitud de contexto de 512 tokens. Su particularidad principal es el tokenizador: un byte-level BPE de solo 257 tokens, entrenado a nivel de carácter sobre prosa inglesa del siglo XIX.

El modelo no se publica como herramienta de generación de texto, sino como control experimental. Comparte arquitectura, hiperparámetros, tamaño de corpus (1,31 MB) y fichero de tokenizador byte a byte con `finnegans-fake-char257`, un modelo gemelo entrenado sobre *Finnegans Wake* de James Joyce. Al ser idénticos en todo lo demás, la comparación de pérdidas de validación (1,2004 frente a 1,8840) aísla una única variable: la previsibilidad estadística del corpus.

Su relevancia es por tanto metodológica más que de rendimiento: documenta un error de implementación (doble desplazamiento de etiquetas) que invalidó las primeras métricas del proyecto, y sirve como ejemplo reproducible de comparación controlada en modelos minúsculos. El autor es explícito: el modelo no es bueno y no pretende serlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (6 capas, 6 cabezas, 384 dim. de embedding) |
| Parametros totales | 10.942.848 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible; el autor no publica versiones cuantizadas. Pesos en precision de entrenamiento (fp32, ~43,8 MB) |
| Idiomas soportados | Ingles (prosa inglesa del siglo XIX). La metadata de HuggingFace no declara idiomas |
| Licencia | CC0-1.0 (dominio publico) |
| Formato de pesos | safetensors (libreria transformers) |
| Vocabulario | 257 tokens (byte-level BPE con `add_prefix_space: true`) |
| Tamano del repositorio | 0,0 GB reportados (redondeo de plataforma; ~44 MB de pesos fp32) |
| Descargas / likes | 0 / 0 |
| Fecha declarada de creacion | 16-09-2026 |

## Arquitectura y entrenamiento

Arquitectura GPT-2 clasica: transformer decoder-only con atencion causal multi-cabeza, 6 capas, 6 cabezas y 384 dimensiones de embedding (~10,9 M de parametros). El tokenizador es un byte-level BPE de vocabulario 257 entrenado a nivel de caracter, con `add_prefix_space` activado, lo que inserta un espacio inicial no presente en el prompt al decodificar. Fuera de ese detalle, el autor verifica round-trip exacto byte a byte sobre 20.000 caracteres del corpus de entrenamiento.

El entrenamiento consistio en 6.000 iteraciones de modelado de lenguaje autorregresivo, con batch de 24, learning rate 0,0006 y dropout 0,2. No hay RLHF, DPO ni ajuste por instrucciones. El corpus son ocho novelas de dominio publico de Project Gutenberg, 1,31 MB de texto ajustados al recuento de caracteres de *Finnegans Wake* con una desviacion del 0,2%, y se uso el mismo fichero de tokenizador que el modelo gemelo. El repositorio contiene el checkpoint de mejor perdida de validacion (1,2004), no el de final de entrenamiento (1,2065).

Innovacion tecnica destacable: ninguna en el plano arquitectonico. El valor del modelo esta en el control experimental. El autor documenta que todas las metricas iniciales del proyecto se generaron con un objetivo roto: `batch()` devolvia etiquetas pre-desplazadas al estilo nanoGPT mientras `transformers` las desplaza por su cuenta, de modo que el modelo aprendia a predecir el token t+2 desde la posicion t. El fallo no lanzaba excepcion y producia curvas de perdida plausibles. Corregido el error, 400 pasos superaron a los 6.000 anteriores. Las cifras publicadas en la model card son posteriores a la correccion.

## Capacidades

- Generacion de texto en ingles a nivel de caracter, con muestreo configurable (temperatura, top-k, top-p) y semilla documentada (seed 0 en el ejemplo publicado).
- Reproduccion de patrones ortograficos, morfologicos y de sintaxis basica del ingles del siglo XIX aprendidos de ocho novelas de dominio publico.
- Tokenizacion reversible exacta (byte a byte) salvo el espacio inicial anadido por `add_prefix_space`.
- Uso como baseline de comparacion en experimentos de perdida de validacion con arquitectura e hiperparametros identicos a `finnegans-fake-char257`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es multilingue: solo ingles, y con un vocabulario de 257 tokens que limita severamente la cobertura.
- No dispone de modo thinking, vision, audio ni ninguna capacidad multimodal.
- No esta ajustado por instrucciones: no sigue ordenes ni mantiene formato conversacional.

## Casos de uso

- Control experimental en estudios de previsibilidad de corpus: comparar su perdida de validacion (1,2004) con la del gemelo entrenado sobre *Finnegans Wake* (1,8840) permite atribuir la diferencia exclusivamente a la naturaleza del texto, ya que arquitectura, hiperparametros, volumen de corpus y tokenizador son identicos.
- Verificacion de pipelines de tokenizacion byte-level BPE: su vocabulario de 257 tokens y su round-trip exacto verificado lo convierten en un caso de prueba barato para detectar errores de espaciado o de normalizacion en preprocesadores propios.
- Docencia de arquitecturas transformer: con 10,9 M de parametros se puede entrenar desde cero en CPU y en tiempos del orden de minutos u horas, lo que permite ilustrar de principio a fin el ciclo de tokenizacion, entrenamiento y muestreo sin infraestructura especializada.
- Pruebas de integracion de infraestructura de servicio: al estar etiquetado como `endpoints_compatible` y `text-generation-inference`, sirve para validar despliegues de TGI, endpoints HTTP o colas de inferencia con un consumo de recursos practicamente nulo antes de pasar a modelos reales.
- Estudio de reproducibilidad de experimentos: el ejemplo de la model card se genero con semilla 0 en el momento de empaquetado, lo que permite auditar la variabilidad de resultados bajo parametros de muestreo fijos.
- Investigacion sobre aritmetica de distribuciones y decodificacion: el autor lo uso como una de las dos distribuciones en un experimento de producto geometrico destinado a forzar portmanteaus, que fracaso de forma monotona.
- Pruebas de regresion en herramientas de evaluacion: su tamano minimo permite ejecutar suites de perplejidad, harness o scripts de evaluacion en segundos, verificando que las herramientas no fallan con vocabularios minusculos y contextos de 512 tokens.
- Prototipado estilistico de baja fidelidad: puede generar fragmentos con resonancia decimononica, siempre con revision humana y sin expectativa de coherencia; el autor desaconseja explicitamente cualquier uso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni evaluaciones estandar equivalentes, y el vocabulario de 257 tokens impediria aplicarlos sin adaptacion).

La unica metrica publicada es la perdida de validacion, comparable unicamente entre los dos modelos del proyecto porque comparten arquitectura, hiperparametros, volumen de corpus y fichero de tokenizador:

| Metrica | english-char257 | finnegans-fake-char257 |
|---|---|---|
| Perdida de validacion (mejor checkpoint) | 1,2004 | 1,8840 |
| Perdida de validacion (fin del entrenamiento) | 1,2065 | no disponible |

## Requisitos de hardware

- VRAM en fp32: ~43,8 MB de pesos (10.942.848 parametros x 4 bytes), mas ~9,4 MB de cache KV a contexto completo (512 tokens, fp32), calculado a partir de la arquitectura.
- VRAM en fp16/bf16: ~22 MB de pesos y ~4,7 MB de cache KV.
- VRAM en int8 o 4-bit: ~11 MB y ~6 MB respectivamente, aunque el autor no publica pesos cuantizados; habria que generarlos.
- GPU recomendadas: ninguna GPU dedicada es necesaria. Cabe holgadamente en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) y en graficas integradas. A100, H100 o similares estan sobredimensionadas por varios ordenes de magnitud.
- Inferencia en CPU: viable en cualquier procesador moderno, incluidos Raspberry Pi 4/5 y dispositivos similares. El autor no documenta cifras de latencia ni throughput; cualquier numero concreto seria una estimacion, no un dato medido.
- Opciones de despliegue: `transformers` (referencia del autor), Text Generation Inference (el repo esta etiquetado como `endpoints_compatible`), exportacion a ONNX Runtime, o vLLM (tecnicamente posible, aunque desproporcionado).
- llama.cpp u Ollama requeririan convertir los pesos a GGUF; no se publica ninguna version GGUF en el repositorio.

## Comparativa con modelos similares

La comparacion cuantitativa directa no es posible: los modelos de referencia usan vocabularios de decenas de miles de tokens y estan entrenados sobre corpus masivos, de modo que sus perdidas y benchmarks no son equiparables a los de un tokenizador de 257 unidades entrenado con 1,31 MB de texto.

| Modelo | Parametros | Contexto | Vocabulario | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| english-char257 | 10,9 M | 512 | 257 | CC0-1.0 | Repositorio HuggingFace, 0 descargas |
| finnegans-fake-char257 (mismo autor) | 10,9 M | 512 | 257 | no disponible en la informacion proporcionada | Repositorio del mismo proyecto |
| GPT-2 small | 124 M | 1024 | 50.257 | MIT | Ampliamente desplegado |
| distilgpt2 | 82 M | 1024 | 50.257 | Apache-2.0 | Ampliamente desplegado |

Frente a GPT-2 small y distilgpt2, english-char257 aporta un control experimental estricto y una licencia CC0 sin restricciones, pero carece de capacidades practicas de generacion, de soporte multilingue y de cualquier evaluacion estandar. No se dispone de alternativas comparables en la misma categoria exacta (modelo de control con tokenizador de 257 tokens y corpus emparejado) mas alla del gemelo del propio proyecto.

## Limitaciones y advertencias

- El autor indica literalmente que el modelo no es bueno y que no debe usarse para nada. No es una advertencia retorica: no esta ajustado por instrucciones y no mantiene coherencia mas alla de unos pocos caracteres.
- Riesgo de alucinacion elevado y estructural: al operar a nivel de caracter con 257 tokens, genera cadenas que imitan ortografia y ritmo sin garantizar palabras, sintaxis ni significado.
- Sesgos: el corpus son ocho novelas inglesas del siglo XIX de dominio publico, por lo que hereda el vocabulario, los registros y los estereotipos de esa tradicion literaria, sin ningun filtrado ni mitigacion.
- Limitacion idiomatica severa: solo ingles del siglo XIX. El vocabulario de 257 tokens no cubre alfabetos no latinos ni practicamente ningun caracter acentuado, por lo que el castellano queda fuera de su alcance.
- Contexto de 512 tokens, insuficiente para conversaciones multi-turno, documentos largos o razonamiento encadenado.
- Peculiaridad del tokenizador: `add_prefix_space: true` anade un espacio inicial que no estaba en el prompt. Hay que introducir el prompt con espacio inicial o recortar la salida; no es un fallo de perdida de informacion.
- Historial de metricas poco fiable: todas las cifras publicadas inicialmente por el proyecto procedian de un objetivo de entrenamiento defectuoso (doble desplazamiento de etiquetas). Las cifras de esta ficha son posteriores a la correccion, pero conviene verificar la procedencia de cualquier numero citado de versiones anteriores del proyecto.
- El repositorio declara fecha de creacion y actualizacion el 16-09-2026, una fecha atipica que conviene comprobar antes de citarlo academicamente.
- Licencia CC0-1.0: sin restricciones para uso comercial, pero la ausencia de garantias y la calidad del modelo hacen inviable cualquier aplicacion productiva.
- Sin validacion comunitaria: 0 descargas y 0 likes, sin issues ni evaluaciones de terceros.
- No se publican pesos cuantizados, versiones GGUF ni artefactos listos para llama.cpp u Ollama.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/genaforvena/english-char257
- Repositorio de codigo del proyecto (CC0): https://github.com/genaforvena/finnegans-fake
- Modelo gemelo del mismo proyecto, referenciado en la model card: ID `genaforvena/finnegans-fake-char257`
- Corpus de entrenamiento: ocho novelas de dominio publico de Project Gutenberg, obtenidas mediante `wake/prepare_english.py --fetch`
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante. Los resultados devueltos (ORF-TVthek, sobre historia y television austriacas) no guardan relacion con el modelo, su autor ni su proyecto, por lo que se descartan.
