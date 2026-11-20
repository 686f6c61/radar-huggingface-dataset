# athenista/slm-tavenel-25m

## Resumen

SLM-Tavenel 25M es un modelo de lenguaje de tipo base, experimental y de pequeno tamano (25.723.648 parametros), desarrollado por el autor independiente athenista dentro del proyecto SLM-Tavenel. Se trata de un transformer decoder-only de 20 capas y anchura 256, entrenado desde cero sobre el corpus `PleIAs/French-Science-Commons` y obtenido mediante crecimiento (depth and feed-forward expansion) a partir de un modelo ancestro de 10M ya entrenado. No es un modelo de instrucciones ni un asistente conversacional: es un artefacto de investigacion con pesos abiertos publicado para estudiar el escalado de modelos muy pequenos y la reproducibilidad del entrenamiento.

El modelo resuelve un problema de investigacion mas que de producto: explorar si el crecimiento de un modelo pequeno y el entrenamiento adicional sobre texto cientifico frances mejora la modelizacion del lenguaje (bits per byte) sin degradar tareas de eleccion multiple. La respuesta documentada es mixta: mejora clara en BPB de validacion en ingles y frances, pero sin ganancia resuelta en las seis tareas de multiple choice evaluadas.

Es relevante ahora por su caracter de artefacto reproducible: pesos, codigo y Data Information bajo licencia MIT, registro de entrenamiento publicado, evaluacion declarada por el autor (no verificada de forma independiente) y una autoevaluacion de alineacion con OSAID 1.0. Su ventana de contexto es de solo 1.024 tokens y su tokenizador es un BPE byte-level propio de 8.192 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, 20 capas, anchura 256, 4 cabezas de query / 2 de key-value, SwiGLU con dimension 1.280, attention gate por cabeza |
| Parametros totales | 25.723.648 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | Pesos publicados en float32; copia bfloat16 en `variants/bf16/`; receta int8 para CPU documentada en la seccion de inferencia local |
| Idiomas soportados | Ingles y frances (segun metadatos y evaluacion) |
| Licencia | MIT para pesos, codigo y Data Information; los registros fuente conservan sus propios terminos |
| Formato de pesos | `model.safetensors` (float32, SHA-256 `59c495cb…`); copia bfloat16 en variante |
| Tokenizador | BPE byte-level propio del proyecto, 8.192 tokens |
| Precision de entrenamiento | bfloat16 con precision mixta |
| Inicializacion | Crecimiento desde el modelo entrenado de 10M (expansion de profundidad y feed-forward; tensores nuevos con semilla 0) |
| Datos de entrenamiento | `PleIAs/French-Science-Commons` (`french_open_science`); 491,52M posiciones de token adicionales (~983M contando el ancestro de 10M) |
| Optimizador / semilla | AdamW; semilla de entrenamiento 1234 |
| Computo | Una RTX 4060 Laptop GPU (8 GB), ~5,5 horas GPU para esta etapa (mas ~2,5 para el ancestro de 10M); energia no medida |
| Perdida final train / validacion | 2,14016 / 2,21816 |
| BPB de validacion held-out, EN / FR | 1,1171 / 1,0367 |
| Revision del Hub descrita | `a34c08d1bd4b91a244f170ae26096ff059afc37a` |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 20 capas con anchura 256, cuatro cabezas de query y dos de key-value (atencion con grouped-query), capa SwiGLU de dimension intermedia 1.280 y una compuerta de atencion por cabeza (head-wise attention gate). El tokenizador es un BPE byte-level propio del proyecto con un vocabulario de 8.192 tokens, y el contexto maximo es de 1.024 tokens. El modelo se obtuvo por crecimiento del SLM-Tavenel 10M ya entrenado: se expandieron la profundidad y las capas feed-forward, inicializando los tensores nuevos con semilla 0, y se continuo el entrenamiento durante 15.000 pasos adicionales.

El entrenamiento se realizo en bfloat16 con precision mixta, optimizador AdamW y semilla 1234, sobre `PleIAs/French-Science-Commons` (subconjunto `french_open_science`), acumulando 491,52M posiciones de token adicionales en esta etapa (~983M contando el ancestro). El computo total fue de aproximadamente 5,5 horas GPU en una unica RTX 4060 Laptop de 8 GB, sin medicion energetica. La perdida final fue de 2,14016 en entrenamiento y 2,21816 en validacion, con BPB held-out de 1,1171 en ingles y 1,0367 en frances. No se documenta RLHF, DPO ni ajuste por instrucciones: es un modelo base puro, con una sola semilla y una sola ruta de inicializacion.

## Capacidades

- Generacion de texto autoregresiva como modelo base; no esta ajustado para seguir instrucciones ni para formato conversacional.
- Modelizacion del lenguaje en ingles y frances, con mejor BPB documentado en frances que en ingles.
- Razonamiento de sentido comun y eleccion multiple a nivel basico, con resultados por encima del azar en WinoGrande (0,519) y ARC-Easy (0,319), y por debajo o cerca del azar en ARC-Challenge (0,180) y HellaSwag (0,273).
- Comprension lectora multilingue limitada, medida en Belebele en ingles (0,283) y frances (0,309).
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de vision, audio, modo thinking ni capacidades multimodales.
- Capacidad multilingue restringida a los dos idiomas evaluados (en, fr); no hay evidencia de otros idiomas.

## Casos de uso

- Investigacion sobre escalado de modelos pequenos: el checkpoint sirve para estudiar el efecto del crecimiento de profundidad y feed-forward sobre las curvas de perdida y BPB, comparando directamente con el ancestro de 10M y con otras etapas del proyecto.
- Reproducibilidad de entrenamiento: al publicarse pesos, codigo, semilla, revision del Hub y registro de entrenamiento, permite replicar el pipeline completo en hardware de consumo (una RTX 4060 Laptop de 8 GB) y verificar la perdida y el BPB reportados.
- Modelizacion de lenguaje cientifico en frances: util como modelo de referencia para medir perplejidad o BPB sobre corpus cientificos franceses y comparar tecnicas de tokenizacion o de datos.
- Pruebas de infraestructura de inferencia: por su tamano (0,2 GB de repo, ~25,7M parametros), es adecuado para validar pipelines de transformers, recetas int8 en CPU o despliegues en llama.cpp sin coste de GPU.
- Educacion y docencia: sirve para ilustrar el funcionamiento interno de un transformer decoder-only, el efecto del tokenizador BPE y la diferencia entre modelo base y modelo ajustado por instrucciones.
- Experimentos de destilacion o inicializacion: puede actuar como punto de partida o como estudiante en experimentos de destilacion desde modelos mayores, dado su bajo coste de entrenamiento.
- Evaluacion de sesgos y de calidad de datos en corpus cientificos de licencia mixta: el modelo permite sondear que tipo de texto aprende el corpus `French-Science-Commons` y que lagunas de derechos y privacidad arrastra.

## Benchmarks y rendimiento

Resultados declarados por el autor (evaluador SLM-Tavenel, 0-shot, log-likelihood; no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Eleccion multiple | ARC-Easy (test) | accuracy | 0,319 |
| Eleccion multiple | ARC-Challenge (test) | accuracy | 0,180 |
| Eleccion multiple | HellaSwag (validation) | accuracy | 0,273 |
| Eleccion multiple | Belebele (eng_Latn, test) | accuracy | 0,283 |
| Eleccion multiple | Belebele (fra_Latn, test) | accuracy | 0,309 |
| Eleccion multiple | WinoGrande XL (validation) | accuracy | 0,519 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otras tareas de generacion o codigo. La model card indica que el crecimiento desde 10M mejora el BPB de validacion en ambos idiomas pero no produce una ganancia resuelta en las seis tareas de eleccion multiple.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (~103 MB de pesos) y en torno a 50 MB en int8; el repo completo ocupa 0,2 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el propio entrenamiento se realizo en una RTX 4060 Laptop de 8 GB. No requiere A100 ni H100.
- Cabe en cualquier GPU consumer, incluidas GTX 1650, RTX 3050, RTX 4060 y superiores, y tambien en CPU.
- Opciones de despliegue: `transformers` (libreria declarada, con `custom_code`), receta int8 para CPU documentada en la model card; el uso con llama.cpp, Ollama o vLLM no esta documentado en la informacion disponible.
- Latencia y throughput: no disponibles; el autor no publica mediciones de inferencia, solo el coste de entrenamiento (~5,5 horas GPU en RTX 4060 Laptop para esta etapa).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| SLM-Tavenel 25M | 25,7M | 1.024 | en, fr | MIT | Base experimental, crecido desde 10M, evaluacion declarada por el autor |
| SLM-Tavenel 10M (ancestro) | ~10M | no disponible | en, fr | MIT (segun proyecto) | Punto de partida del crecimiento; ~2,5 horas GPU de entrenamiento |
| Modelos tipo GPT-2 small | 124M | 1.024 | en | MIT (pesos) | Referencia clasica de modelo base pequeno; mucho mayor en parametros |
| Modelos tipo TinyLlama / Qwen2.5-0.5B | 0,5B-1,1B | 2.048-32.768 | multilingue | Apache 2.0 | Modelos base o ajustados de escala superior; no comparables en coste de entrenamiento |

No se dispone de comparaciones directas de rendimiento con alternativas de la misma escala en la informacion proporcionada. Cualquier comparacion con GPT-2 small o TinyLlama debe tomarse como referencia de categoria, no como resultado medido en el mismo evaluador.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no debe usarse como asistente conversacional ni esperar que siga instrucciones de formato.
- Ventana de contexto muy corta (1.024 tokens), insuficiente para documentos largos o conversaciones multi-turno extensas.
- Rendimiento cercano al azar en varias tareas de razonamiento (ARC-Challenge 0,180; HellaSwag 0,273), lo que refleja una capacidad de comprension muy limitada.
- Riesgo alto de alucinacion y de generar texto incoherente en generaciones largas, dado el tamano y la perdida de validacion reportada.
- Sesgos conocidos: no documentados de forma especifica; el corpus `French-Science-Commons` es de licencia mixta y el autor reconoce lagunas de revision de derechos y privacidad en las fuentes.
- Limitacion idiomatica: solo hay evidencia para ingles y frances; el comportamiento en castellano no esta evaluado.
- Licencia MIT para pesos, codigo y Data Information, pero los registros fuente conservan sus propios terminos, lo que puede restringir el uso comercial de derivados entrenados sobre ellos.
- La autoevaluacion de alineacion con OSAID 1.0 es una declaracion del proyecto, no una certificacion OSI.
- Los benchmarks son declarados por el autor con un evaluador propio y marcados como no verificados; no deben tratarse como resultados independientes.
- Entrenado con una sola semilla y una sola ruta de inicializacion, sin estudios de varianza; la robustez de las conclusiones es limitada.
- No hay medicion energetica ni de latencia, lo que dificulta estimar costes de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/athenista/slm-tavenel-25m
- Registro de entrenamiento: https://huggingface.co/athenista/slm-tavenel-25m/tree/main/training_record
- Vision general del proyecto SLM-Tavenel: https://github.com/thekester/slm-tavenel#slm-tavenel
- Catalogo de modelos publicados: https://github.com/thekester/slm-tavenel#published-models
- Archivo de investigacion y reproducibilidad: https://github.com/thekester/slm-tavenel#research-and-reproducibility
- Dataset de entrenamiento: https://huggingface.co/datasets/PleIAs/French-Science-Commons
