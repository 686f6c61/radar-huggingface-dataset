# havenwood/Qwen3.8-27B-W8A8-GPTQ-Tigerlily

## Resumen

havenwood/Qwen3.8-27B-W8A8-GPTQ-Tigerlily es un checkpoint de pesos cuantizados en INT8 para inferencia en Apple Silicon, derivado de Qwen/Qwen3.8-27B. No es un modelo entrenado desde cero: se trata de un artefacto de cuantizacion W8A8 (8 bits en pesos y activaciones) preparado por el usuario havenwood para el runtime Tigerlily, con licencia Apache 2.0 sobre los pesos. El repositorio ocupa 30,0 GB y contiene 27.356.728.560 parametros reales segun los safetensors, lo que lo situa en la categoria de modelos densos de ~27B.

El problema que resuelve es concreto: mejorar la fidelidad numerica de la ruta W8A8 nativa en Apple Silicon respecto a la cuantizacion round-to-nearest (RTN) convencional. Para ello aplica SmoothQuant con alpha 0.5 y GPTQ sobre los pesos ya agrupados en Q8, en lugar de partir del modelo BF16 original. Segun las mediciones del autor, la coincidencia top-1 frente a la referencia Q8 agrupada pasa de 183/192 (95,31%) con RTN a 189/192 (98,44%) con GPTQ, y la KL media en forward baja de 0,007936 a 0,004777 (un 39,8% menos).

Es relevante ahora porque la ruta de prefill W8A8 nativa requiere hardware Apple10 (M5 y posteriores), y este repositorio esta pensado y probado como opcion por defecto para el motor denso de 27B en Tigerlily sobre un M5 Max de 64 GB. El autor lo presenta explicitamente como un ajuste especifico de este checkpoint, no como una mejora universal de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.8; tag `qwen3_5` en HuggingFace) |
| Parametros totales | 27.356.728.560 (dato real de safetensors) |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | No disponible. Los contextos de 64K y 131K no estan cualificados por el autor; las pruebas se hicieron con peticiones de 16.384 tokens y un prompt de 17.069 tokens |
| Tipos de cuantizacion | W8A8 INT8 con GPTQ y RTN como alternativas; procede de un origen Q8 agrupado (formato Q8/G64); embeddings, cabeza de salida y cabeza MTP conservan la precision de origen |
| Idiomas soportados | No disponible (la model card no declara lista de idiomas; una de las pruebas incluye traduccion al espanol) |
| Licencia | apache-2.0 (pesos). El runtime Tigerlily tiene su propia licencia |
| Formato de pesos | safetensors (checkpoint de ~28 GiB), con escalas INT8 por canal de salida dentro del formato de almacenamiento Q8/G64; integridad registrada en `tigerlily-mmap.json` |

## Arquitectura y entrenamiento

Se trata de un checkpoint denso de 27.356.728.560 parametros obtenido por cuantizacion, no de un modelo entrenado de nuevo. La receta se ejecuto integramente en Rust con el comando `tigerlily-setup --model-id qwen3.8-27b-8bit --w8a8-method gptq`, partiendo de los checkpoints MLX Community Q8 y MLX Community MTP Q8. Los pesos densos de proyeccion usan escalas INT8 por canal de salida embebidas en el formato de almacenamiento Q8/G64 existente; el autor advierte que no se trata del formato empaquetado habitual de los cargadores GPTQ. El proceso completo tardo aproximadamente 37 minutos en un M5 Max de 64 GB conectado a corriente.

La calibracion combina SmoothQuant con alpha 0.5 (con suavizado en down/up habilitado) y GPTQ con 1024 filas de entrada BF16 muestreadas por proyeccion, extraidas de ocho documentos de calibracion congelados, amortiguamiento Hessiano del 1% y bloques de 128 columnas. No se usa permutacion de orden de activaciones ni busqueda de clipping. El orden de columnas y las escalas BF16 por canal quedan fijados. La innovacion practica es doble: por un lado, el ajuste GPTQ se aplica sobre los pesos ya suavizados en lugar del BF16 original, lo que mejora la concordancia numerica medida; por otro, el repositorio incluye una cabeza MTP (multi-token prediction) que conserva su precision original, aunque su tasa de aceptacion no se midio en esta criba. El autor indica que los kernels de inferencia no cambian respecto a la ruta W8A8 existente.

## Capacidades

- Generacion de texto conversacional y continuacion de texto (pipeline `text-generation`, tag `conversational`).
- Aritmetica basica: uno de los seis prompts de cualificacion numerica cubre operaciones aritmeticas.
- Extraccion de JSON estructurado a partir de texto libre.
- Revision y explicacion de codigo Python, incluida evaluacion de correccion (prompt de revision usado en la prueba ABBA).
- Traduccion, con el espanol entre los casos evaluados por el autor.
- Recuperacion de hechos exactos en contextos largos: en un prompt de 17.069 tokens con hechos ficticios mezclados entre identificadores y nombres similares, tanto RTN como GPTQ reproducen el prefijo factual completo de 64 tokens comprobados.
- Razonamiento multi-paso limitado al prompt (la prueba ABBA usa una peticion unica de 16.384 tokens con presupuesto de salida de 128 tokens).
- Decodificacion especulativa: compatible con un borrador DFlash2 Q4 fijado (no redistribuido en este repositorio) y con la cabeza MTP incluida.
- Tool calling / function calling: no documentado en la informacion disponible.
- Vision, audio: no documentado; el autor declara explicitamente que no se reclama cualificacion en vision.
- Modo thinking: las pruebas se realizaron con thinking desactivado; no se documenta comportamiento del modo thinking.

## Casos de uso

- Asistente conversacional local en Apple Silicon: el modelo esta preparado para ejecutarse con el runtime Tigerlily mediante `tigerlily --model ./Qwen3.8-27B-W8A8-GPTQ-Tigerlily`, con decodificacion sostenida de ~38 tokens/s en un M5 Max de 64 GB, lo que permite conversaciones interactivas sin depender de la nube.
- Revision de codigo en flujo de trabajo local: la prueba ABBA del autor usa precisamente una tarea de explicacion y revision de correccion de codigo sobre una peticion de 16.384 tokens, con lo que el checkpoint esta validado en esa tarea concreta.
- Extraccion de datos estructurados (JSON): uno de los seis prompts de cualificacion numerica es de extraccion a JSON; el modelo reproduce 189/192 tokens de la referencia Q8 en la variante GPTQ, lo que lo hace util para pipelines de conversion de texto no estructurado a JSON.
- Traduccion asistida, incluido espanol: el conjunto de cualificacion incluye un prompt de traduccion al espanol, lo que da evidencia directa de uso en localizacion de contenidos.
- Analisis de documentos largos con recuperacion de hechos: con prompts de 17.069 tokens el modelo recupera cuatro hechos exactos dentro de los primeros 57 tokens de continuacion, apto para revision de expedientes, contratos o registros con identificadores parecidos.
- Diseno y discusion de arquitectura de software: uno de los prompts de cualificacion es de diseno de cache, lo que respalda su uso en consultas tecnicas de arquitectura.
- Despliegue con decodificacion especulativa: combinado con la cabeza MTP incluida o con un borrador DFlash2 externo, el checkpoint mantiene una aceptacion de borrador del 27,27% (84/308) sin regresion material frente a RTN.
- Aritmetica y calculo sencillo en asistentes de productividad: el conjunto de pruebas incluye un prompt aritmetico con coincidencia exacta de tokens frente a la referencia Q8.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor proporciona dos cribas propias: una de concordancia numerica frente a la referencia Q8 agrupada y otra de aceptacion y rendimiento en motor nativo.

Criba numerica (M5 Max 64 GB, KV en Q8, thinking desactivado; seis prompts retenidos de 117-132 tokens de entrada y 32 tokens de continuacion forzada por profesor; 192 tokens comparados en total):

| Metrica | RTN nativo W8A8 | GPTQ nativo W8A8 |
|---|---:|---:|
| Coincidencias top-1 frente a Q8 agrupado | 183/192 (95,31%) | 189/192 (98,44%) |
| KL media en forward | 0,007936 | 0,004777 |
| KL media en la ultima fila de prefill | 0,019107 | 0,015339 |
| Despachos de proyeccion W8A8 | 2400 | 2400 |

El autor senala que la KL media nativa cae un 39,8%, que tres de los seis prompts mejoran y tres empeoran, y que la concordancia solo en pesos empata en 98,44%. En la puerta factual adicional (prompt de 17.069 tokens), RTN coincide en 63/64 tokens y GPTQ en 62/64; las diferencias aparecen despues de los hechos (`extraction` frente a `extracted`, y `protocol` frente a `relies`).

Criba de aceptacion y rendimiento (M5 Max 64 GB, corriente alterna, KV en Q8, borrador DFlash2 Q4 fijado, peticion de 16.384 tokens con presupuesto de salida de 128 tokens):

| Metrica | RTN | GPTQ |
|---|---:|---:|
| Primer token, media en segundos | 11,324 | 11,511 |
| Total, media en segundos | 14,720 | 14,852 |
| Decodificacion tras el primer token, tokens/s | 37,39 | 38,01 |
| Borrador aceptado / propuesto | 83 / 305 | 84 / 308 |
| Tasa de aceptacion del borrador | 27,21% | 27,27% |
| Pasadas de verificacion | 45 | 44 |

El tiempo total medio es un 0,9% superior con GPTQ, dentro de su variacion por pares del 2,0%; el tiempo hasta el primer token es un 1,7% superior, dentro de su variacion del 2,5%. El autor concluye que no hay diferencia clara de velocidad ni regresion material de aceptacion. Son tiempos de motor nativo, sin sobrecarga HTTP ni carga de checkpoint, y no constituyen una prueba en frio de almacenamiento.

## Requisitos de hardware

- VRAM / memoria unificada: el checkpoint ocupa aproximadamente 28 GiB (repositorio de 30,0 GB), por lo que se necesita un equipo Apple Silicon con al menos 64 GB de memoria unificada para las pruebas realizadas (M5 Max de 64 GB).
- GPU compatibles: la ruta de prefill W8A8 nativa requiere hardware Apple10, es decir, M5 y posteriores. La release se probo en un M5 Max de 64 GB. No se documenta soporte para GPU NVIDIA, AMD ni para Metal en generaciones Apple anteriores.
- Cabe en GPU de consumo: si, en el sentido de Apple Silicon de gama alta (M5 Max de 64 GB); no hay informacion sobre su funcionamiento en equipos con menos memoria ni en GPU de consumo dedicadas.
- Opciones de despliegue: exclusivamente el runtime Tigerlily, apuntando al directorio descargado con `tigerlily --model ./Qwen3.8-27B-W8A8-GPTQ-Tigerlily`. La model card declara `inference: false` en los metadatos, lo que indica que no esta pensado para los cargadores genericos de HuggingFace. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: 11,511 s de media hasta el primer token y 14,852 s de tiempo total medio para una peticion de 16.384 tokens con salida de 128 tokens; 38,01 tokens/s en decodificacion tras el primer token en un M5 Max de 64 GB. Cifras de motor nativo, excluyendo HTTP y carga de checkpoint.
- Requisito de preparacion: la receta de cuantizacion se ejecuto con `tigerlily-setup` en Rust y tardo unos 37 minutos en un M5 Max de 64 GB con corriente alterna.

## Comparativa con modelos similares

No se dispone de datos de benchmarks estandar que permitan comparar con modelos de otras familias. La comparacion posible es interna, entre este checkpoint y sus variantes y origenes:

| Modelo / variante | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| havenwood/Qwen3.8-27B-W8A8-GPTQ-Tigerlily | 27.356.728.560 | W8A8 INT8 con GPTQ sobre base Q8 agrupada | No disponible (64K/131K sin cualificar) | apache-2.0 (pesos) | HuggingFace, 0 descargas, 0 likes |
| Variante RTN del mismo autor | 27.356.728.560 | W8A8 INT8 con round-to-nearest | No disponible | apache-2.0 (pesos) | Seleccionable con `--w8a8-method rtn` en Tigerlily; no es un repo separado |
| mlx-community/Qwen3.8-27B-8bit | No disponible | Q8 agrupada (referencia de control) | No disponible | No disponible | HuggingFace (commit `815b83c0...`) |
| mlx-community/Qwen3.8-27B-MTP-8bit | No disponible | Q8 agrupada con cabeza MTP | No disponible | No disponible | HuggingFace (commit `e88e48d0...`) |
| Qwen/Qwen3.8-27B (modelo base) | No disponible | BF16 (origen) | No disponible | No disponible | HuggingFace |

El autor no proporciona comparaciones con otros modelos de ~27B ni cifras de calidad de tarea, de modo que cualquier comparacion con alternativas externas queda como no disponible.

## Limitaciones y advertencias

- Alcance de hardware muy restringido: la ruta nativa W8A8 necesita Apple10 (M5 y posteriores). No hay evidencia de funcionamiento en GPU NVIDIA, AMD o en Apple Silicon anterior.
- Modelo no apto para cargadores genericos: la model card declara `inference: false` y advierte que no usa el formato empaquetado habitual de GPTQ. Debe cargarse con Tigerlily.
- Contexto largo sin cualificar: los contextos de 64K y 131K no estan validados. Las unicas evidencias son con 16.384 y 17.069 tokens de entrada.
- Sin benchmarks de tarea: no hay MMLU, HumanEval, GSM8K ni equivalentes. Las mediciones publicadas son de concordancia numerica (KL, coincidencia de tokens) y rendimiento de motor, no de calidad de tarea. El propio autor lo describe como "una pequena criba numerica, no una mejora universal de calidad".
- Ambiguedad entre variantes: GPTQ y RTN empatan en concordancia solo en pesos (98,44%) y GPTQ empeora ligeramente en una de las metricas KL de la puerta factual (0,002120 frente a 0,001194). La eleccion no es uniformemente mejor.
- Cabeza MTP sin medir: la aceptacion del adaptador MTP incluido no se midio en la criba; el borrador DFlash2 usado en las pruebas es externo y no se redistribuye.
- Sin validacion comunitaria: el repositorio tiene 0 descargas y 0 likes en el momento de los datos, y fue creado y actualizado el mismo dia (28 de septiembre de 2026).
- Sesgos conocidos: no documentados en la informacion disponible. Al derivar del modelo base Qwen/Qwen3.8-27B, los sesgos de ese modelo no se han auditado ni se declaran en esta ficha.
- Riesgo de alucinacion: no cuantificado. Las unicas pruebas con hechos usan hechos ficticios insertados en el prompt, lo que mide recuperacion, no veracidad general.
- Idiomas: no se declara lista de idiomas soportados; la unica evidencia multilingue es un prompt de traduccion al espanol dentro de la criba interna.
- Restricciones de licencia: los pesos mantienen Apache 2.0, pero el runtime Tigerlily tiene su propia licencia, independiente de la del checkpoint. Verificar ambas antes de un uso comercial.
- Sin cualificacion en vision ni en otras maquinas: el autor lo declara explicitamente.
- Trazabilidad disponible: el repositorio incluye `w8a8-requant.json` (receta y hashes de calibracion), `tigerlily-mmap.json` (integridad del payload), `acceptance.json` (recibos y identidades de checkpoint) y `lookalike-quality.json` (recibo de la puerta factual), ademas de un fichero NOTICE con ficheros modificados y atribucion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/havenwood/Qwen3.8-27B-W8A8-GPTQ-Tigerlily
- Repositorio del runtime Tigerlily: https://github.com/havenwood/tigerlily
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint de origen MLX Community Q8: https://huggingface.co/mlx-community/Qwen3.8-27B-8bit/tree/815b83c0df8ffd1d1b5244cf75fd6ef14fca9ef9
- Checkpoint de origen MLX Community MTP Q8: https://huggingface.co/mlx-community/Qwen3.8-27B-MTP-8bit/tree/e88e48d055732ad75d9435f3059139d5279f2064
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo. Los resultados devueltos corresponden a paginas de Zhihu (perfiles de usuario y un proyecto de LaTeX), a un tutorial de Overleaf en Baidu Jingyan y a un articulo sobre la funcion de lectura de Word, ninguno relacionado con Qwen3.8, Tigerlily, GPTQ ni Apple Silicon.
