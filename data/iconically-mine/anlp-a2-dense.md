# iconically-mine/anlp-a2-dense

## Resumen

`iconically-mine/anlp-a2-dense` es un transformer denso de pequeno tamano (12,93 millones de parametros) publicado en HuggingFace por el usuario `iconically-mine`. Segun la model card, se trata de la entrega de la tarea 1 de la asignatura ANLP (Advanced Natural Language Processing), con la variante `dense` del bloque feed-forward. El modelo se entreno desde cero sobre 30 millones de tokens y alcanzo una perdida de validacion final de 3,7909.

Arquitectonicamente es un transformer decoder-only convencional: 6 capas, `d_model=256`, 8 cabezas de atencion y una capa feed-forward densa con dimension oculta de 1024. No hay indicios de mezcla de expertos (MoE), atencion lineal ni mecanismos hibridos. Con 12,93 M de parametros y 30 M de tokens de entrenamiento, el modelo se situa muy por debajo de los modelos de produccion actuales, y su relevancia es sobre todo pedagogica o experimental.

El repositorio tiene un tamano de 0,1 GB, cero descargas y cero valoraciones en el momento de la consulta. No se declara licencia, idiomas soportados ni pipeline de HuggingFace, y los pesos se distribuyen como un checkpoint de PyTorch (`dense_final.pt`), no en safetensors ni GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (segun model card y nombre del repositorio) |
| Parametros totales | 12,93 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Checkpoint PyTorch (`dense_final.pt`, carga con `torch.load`) |
| d_model | 256 |
| Numero de capas | 6 |
| Cabezas de atencion | 8 |
| Dimension oculta del FFN | 1024 |
| Tipo de FFN | dense |
| Tokens de entrenamiento | 30,00 M |
| Perdida de validacion final | 3,7909 (perplejidad equivalente aproximada de 44,3; valor derivado) |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-03 |

## Arquitectura y entrenamiento

El modelo es un transformer denso con arquitectura de decodificador, con las dimensiones tipicas de un ejercicio de laboratorio: 6 bloques, ancho de modelo de 256, 8 cabezas de atencion (32 dimensiones por cabeza) y una red feed-forward con proyeccion intermedia de 1024, es decir, un factor de expansion de 4x respecto a `d_model`. La model card indica explicitamente `ffn_type: dense`, lo que sugiere que existe una variante alternativa (probablemente MoE, a juzgar por el sufijo `dense` del nombre del repositorio) dentro de la misma entrega academica.

En cuanto a los datos, la unica informacion publicada es el volumen total: 30 millones de tokens. No se especifica la composicion del corpus, el tokenizador empleado, la longitud de secuencia durante el entrenamiento ni si se aplicaron fases de ajuste fino con instrucciones, RLHF o DPO. La perdida de validacion final de 3,7909 corresponde a una perplejidad de aproximadamente 44,3, un valor coherente con un modelo de este tamano entrenado sobre un corpus reducido. El checkpoint distribuido es un unico fichero `dense_final.pt` que se debe cargar con `torch.load`, y la model card remite al codigo de definicion en `src/part1/model/transformer.py`, sin que se haya publicado la ruta al repositorio de codigo en la informacion disponible.

## Capacidades

- Generacion de texto autoregresiva basica, limitada por el tamano del modelo (12,93 M de parametros) y por el corpus de entrenamiento (30 M de tokens). Es previsible una coherencia muy corta y un vocabulario efectivo reducido.
- No hay evidencia publicada de soporte de *tool calling* ni de *function calling*.
- No hay evidencia publicada de capacidades de agente, razonamiento multi-paso ni modos de pensamiento explicito.
- No hay evidencia publicada de capacidades multilingues; no se declaran idiomas en la ficha de HuggingFace.
- No hay evidencia publicada de capacidades de vision, audio, codigo o matematicas estructuradas.
- El modelo no declara pipeline de HuggingFace, por lo que no se puede invocar mediante `transformers.pipeline` sin escribir un envoltorio propio.

## Casos de uso

- Docencia y practicas de NLP: el modelo sirve como referencia funcional minima para reproducir un pipeline completo de entrenamiento, evaluacion y muestreo en un transformer decoder-only, sin necesidad de GPUs de gama alta.
- Experimentos de arquitectura en entornos academicos: comparar la variante `dense` con su alternativa (presumiblemente MoE) del mismo trabajo permite medir el efecto del tipo de FFN sobre una perdida de validacion comparable, partiendo de los 12,93 M de parametros y la perdida de 3,7909.
- Pruebas de infraestructura y CI: al ocupar decimas de gigabyte, el checkpoint es util para validar rutas de carga con `torch.load`, scripts de inferencia y pipelines de despliegue antes de escalar a modelos mayores.
- Generacion de texto de juguete en demos locales: con 12,93 M de parametros cabe en cualquier portatil y permite ilustrar muestreo con temperatura y *top-k* en charlas o clases, asumiendo una calidad de texto muy limitada.
- Aprendizaje sobre tokenizacion y preprocesado: al no publicarse el tokenizador, un uso realista es reconstruir el pipeline de datos a partir del checkpoint y estudiar como cambia la perplejidad con distintos vocabularios.
- Punto de partida para *fine-tuning* educativo: ajustar el modelo en un dominio muy concreto y pequeno (por ejemplo, titulares o frases de un formulario) para estudiar sobreajuste y generalizacion con presupuestos de computo minimos.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni ninguna tarea que requiera exactitud factual, por su tamano y por la ausencia de licencia y de evaluaciones publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento declarado por el autor es la perdida de validacion final de 3,7909 sobre el propio conjunto de validacion del entrenamiento (sin especificar el reparto train/validacion). No hay resultados de MMLU, HumanEval, GSM8K, HellaSwag ni de ninguna otra evaluacion estandar.

## Requisitos de hardware

- VRAM estimada para inferencia (valores calculados a partir de los 12,93 M de parametros, no publicados por el autor): en FP32, unos 52 MB de pesos; en FP16/BF16, unos 26 MB; en INT8, unos 13 MB; en INT4, unos 7 MB. La memoria de activaciones con `d_model=256` y 6 capas es despreciable en comparacion.
- GPU recomendadas: cualquier GPU, incluida una integrada o una GTX 1050 de 4 GB. El modelo tambien se ejecuta sin problemas en CPU.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en placas con 2 GB de VRAM.
- Opciones de despliegue: al no publicarse pesos en safetensors, GGUF ni formatos compatibles con `transformers`, las opciones estandar (vLLM, llama.cpp, Ollama, TGI) no son aplicables directamente. El unico camino documentado es `torch.load` del fichero `dense_final.pt` junto con el codigo de definicion del modelo en `src/part1/model/transformer.py`.
- Latencia y *throughput*: no disponibles. A este tamano, la generacion en una GPU moderna estaria limitada por el coste de lanzamiento de kernels mas que por el computo.
- Nota: el checkpoint usa `torch.load`, que ejecuta deserializacion de *pickle*. Se recomienda cargarlo solo desde fuentes de confianza y, si es posible, con `weights_only=True`.

## Comparativa con modelos similares

La comparativa se establece con modelos abiertos de tamano reducido ampliamente documentados. Los datos de las alternativas provienen de su documentacion publica.

| Modelo | Parametros | Contexto | Tokens de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| iconically-mine/anlp-a2-dense | 12,93 M | no disponible | 30,00 M | no disponible | Pesos `dense_final.pt` en HuggingFace |
| Pythia-14M | ~14 M | 2048 | 300 B (The Pile) | Apache-2.0 | safetensors, integrado en `transformers` |
| GPT-2 small | 124 M | 1024 | ~40 GB de WebText | MIT modificada | safetensors, integrado en `transformers` |
| SmolLM-135M | 135 M | 2048 | 600 B (SmolLM-Corpus) | Apache-2.0 | safetensors, GGUF, integrado en `transformers` |

La diferencia principal no es el numero de parametros, sino el volumen de datos: 30 M de tokens frente a los 300 B de Pythia-14M o los 600 B de SmolLM-135M, lo que se traduce en una perdida de validacion mucho mayor (3,7909 en este modelo). Ademas, este checkpoint carece de licencia declarada, de tokenizador publicado y de integracion con el ecosistema `transformers`, lo que limita su uso fuera del ambito academico.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles, pero cualquier modelo entrenado sobre un corpus no documentado de 30 M de tokens heredara los sesgos de esa fuente, que se desconoce por completo.
- Riesgo de alucinacion: muy alto. Con 12,93 M de parametros y 30 M de tokens, el modelo no tiene capacidad suficiente para almacenar conocimiento factual fiable.
- Limitaciones de contexto e idioma: no se declara ni la longitud de contexto ni los idiomas soportados. El bajo presupuesto de entrenamiento hace poco probable un multilingüismo funcional.
- Restricciones de licencia: la ficha de HuggingFace no declara licencia. Sin una licencia explicita, no hay autorizacion clara para uso comercial y conviene contactar con el autor antes de cualquier uso fuera del ambito academico.
- Formato de pesos: `dense_final.pt` requiere `torch.load`, con el riesgo de seguridad asociado a la deserializacion de *pickle*. No hay versiones en safetensors, GGUF o cuantizadas.
- Codigo dependiente: para cargar el modelo hace falta el codigo de `src/part1/model/transformer.py`, que no se enlaza en la informacion disponible.
- Trazabilidad: cero descargas y cero valoraciones, sin paper, sin blog y sin evaluaciones independientes. No es un modelo apto para produccion.
- Fecha de publicacion: la ficha esta fechada en 2026-10-03, posterior a la fecha habitual de referencia, lo que conviene verificar antes de citarla.

## Enlaces

- HuggingFace: https://huggingface.co/iconically-mine/anlp-a2-dense
- Codigo del modelo: no disponible en la informacion proporcionada (la model card menciona `src/part1/model/transformer.py` sin enlace)
- Paper: no disponible
- Blog o demo: no disponible
- Repositorio de codigo: no disponible
- Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan ninguna relacion con el modelo (contenido de sitios para adultos) y se han descartado por no ser fuentes validas.
