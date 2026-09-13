# fpadovani/ppt-wc-zipf-newlex-77-eng-100mb_seed455

## Resumen

`fpadovani/ppt-wc-zipf-newlex-77-eng-100mb_seed455` es un ajuste fino de tipo SFT sobre el modelo base `goldfish-models/eng_latn_100mb`, un transformer denso de arquitectura GPT-2 con 86.508.288 parámetros entrenado sobre un corpus de 100 MB en inglés. Lo publica el usuario `fpadovani`, vinculado al proyecto de investigación alojado en Weights & Biases bajo el nombre `white_cotterell` (Universidad de Groningen), lo que situa el modelo en el contexto de experimentos controlados sobre lenguaje y tipologia, no en el de un asistente conversacional de proposito general.

El modelo se ha entrenado con TRL 0.23.0 en modo SFT y se distribuye en formato safetensors para su uso con la libreria `transformers`. Su relevancia es acotada y muy especifica: sirve como artefacto reproducible de un experimento concreto (la nomenclatura `ppt-wc-zipf-newlex-77-eng-100mb_seed455` sugiere una condicion experimental sobre distribucion Zipf y lexico nuevo, con semilla 455), de modo que su interes principal es permitir replicar o auditar ese entrenamiento, no desplegarlo en produccion.

Conviene subrayar que se trata de un modelo de investigacion de 86,5 millones de parametros, sin alineamiento conversacional documentado, sin datos publicados de benchmarks y sin licencia declarada de forma explicita. Cualquier evaluacion practica debe partir de esas limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo GPT-2 (segun la etiqueta `gpt2` del repositorio) |
| Parametros totales | 86.508.288 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible (la model card no la especifica) |
| Tipos de cuantizacion | No se distribuyen cuantizaciones oficiales; pesos en safetensors convertibles a GGUF (q4, q5, q8) o int8 |
| Idiomas soportados | No disponible de forma explicita; el modelo base corresponde al subconjunto `eng_latn` (ingles) |
| Licencia | No disponible (la model card incluye un campo `licence: license` sin contenido) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | goldfish-models/eng_latn_100mb |
| Metodo de entrenamiento | SFT con TRL 0.23.0 |
| Tamano del repositorio | 1,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only de la familia GPT-2, con 86.508.288 parametros totales según los pesos en safetensors. El modelo parte de `goldfish-models/eng_latn_100mb`, un checkpoint de la coleccion Goldfish entrenado sobre 100 MB de texto en ingles y pensado para experimentacion linguistica multilingue. El ajuste fino se realizo con la libreria TRL en su version 0.23.0, sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1.

El entrenamiento es un SFT (supervised fine-tuning) puro, sin que la model card documente fases posteriores de RLHF, DPO u otra forma de alineamiento. No se detalla el numero de tokens de entrenamiento, la composicion del dataset, la longitud de secuencia utilizada ni el regimen de hiperparametros; el unico registro publico del proceso es la ejecucion de Weights & Biases enlazada en la propia model card (proyecto `white_cotterell`, run `xc7umf0z`). La nomenclatura del identificador (`ppt-wc-zipf-newlex-77-eng-100mb_seed455`) apunta a una condicion experimental dentro de una serie: un prefijo de tarea, las iniciales del proyecto (White y Cotterell), una manipulacion sobre la distribucion Zipf, una condicion de lexico nuevo, un valor numerico (77) y una semilla fija (455). No hay documentacion adicional que confirme esa interpretacion.

No se describen innovaciones tecnicas como decodificacion especulativa, atencion lineal ni arquitecturas hibridas. Se trata, por tanto, de un ajuste fino convencional sobre un modelo pequeno.

## Capacidades

- Generacion de texto autoregresiva en ingles, con el estilo y las limitaciones derivadas de un corpus de entrenamiento de 100 MB.
- Continuacion de texto y respuesta a prompts cortos, tal como ilustra el ejemplo de la model card con `pipeline("text-generation")`.
- Formato de entrada basado en mensajes (`[{"role": "user", "content": ...}]`), segun el ejemplo oficial de uso.
- Capacidad de ajuste fino posterior: al ser un modelo pequeno y estandar, es reentrenable en una sola GPU de consumo.
- Reproducibilidad experimental: la semilla explicita en el nombre permite replicar la condicion de entrenamiento.
- No hay evidencia de soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- Capacidades multilingues: no disponibles; el modelo base corresponde al subconjunto ingles (`eng_latn`) de Goldfish.
- No se documenta un modo de razonamiento explicito ni plantillas de chat especializadas mas alla del formato de mensajes del ejemplo.

## Casos de uso

- Replicacion de experimentos academicos: el modelo sirve como artefacto concreto de una condicion experimental identificada por su semilla (455), lo que permite reproducir resultados y comparar contra otras condiciones de la misma serie.
- Analisis de efectos de distribucion lexica: si la nomenclatura refleja una manipulacion sobre la distribucion Zipf y el lexico, el modelo permite estudiar como un ajuste SFT de 86,5 M de parametros altera la frecuencia de uso de palabras en la generacion.
- Docencia e introduccion al fine-tuning: con 86,5 M de parametros y ~1,4 GB de repositorio, es un caso practico asequible para explicar el flujo completo de TRL (carga del modelo base, SFT, publicacion en el Hub).
- Pruebas de infraestructura de entrenamiento e inferencia: util como modelo de humo (`smoke test`) para validar pipelines de `transformers`, TRL o `text-generation-inference` antes de escalar a modelos mayores.
- Generacion de texto de dominio controlado: al haber sido ajustado sobre un corpus especifico, puede emplearse para explorar el estilo de ese corpus en tareas de completado, siempre dentro de un marco de investigacion.
- Baseline en estudios comparativos de modelos pequenos: sirve como punto de referencia frente a otros checkpoints de la familia Goldfish o frente a GPT-2 small y distilgpt2 con el mismo presupuesto de datos.
- Aumento de datos sinteticos a pequena escala: generacion de continuaciones para enriquecer datasets de investigacion, con revision humana obligatoria dado el riesgo de salida incoherente.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni cualquier escenario que requiera alineamiento, seguridad o soporte multilingue, porque nada de eso esta documentado ni verificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, Perplexity ni ninguna otra metrica, y la busqueda web realizada no devolvio resultados tecnicos relacionados con este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): ~0,35 GB en fp32, ~0,18 GB en fp16/bf16, ~0,09 GB en int8 y en torno a 0,05-0,06 GB en cuantizacion GGUF de 4 bits. A ello hay que sumar el cache KV, que depende de la longitud de contexto efectiva (no documentada).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente. Funciona sin problema en RTX 3060, RTX 4060, RTX 4090, T4, A100 o H100; no requiere aceleradores de gama alta.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas modernas, e incluso en iGPU con memoria compartida.
- Inferencia en CPU: viable y probablemente el modo de despliegue mas sensato, dado el tamano del modelo (menos de 350 MB en fp32).
- Opciones de despliegue: `transformers` con pipeline de `text-generation` (metodo documentado en la model card), `text-generation-inference` (el repositorio esta etiquetado como compatible), y conversion a GGUF para `llama.cpp`, `Ollama` o `LM Studio` (la arquitectura GPT-2 esta soportada por estas herramientas, aunque no se ha publicado una conversion oficial). `vLLM` tambien admite arquitecturas GPT-2.
- Latencia y throughput: no disponible. No se han publicado mediciones, y cualquier cifra dependeria del hardware, la cuantizacion y la longitud de secuencia.
- Almacenamiento: el repositorio ocupa 1,4 GB, muy por encima de lo que sugieren los 86,5 M de parametros, lo que apunta a que incluye checkpoints intermedios u optimizador ademas de los pesos finales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fpadovani/ppt-wc-zipf-newlex-77-eng-100mb_seed455 | 86,5 M | No disponible | Ingles (base `eng_latn`) | No disponible | HuggingFace, safetensors |
| goldfish-models/eng_latn_100mb (modelo base) | Orden de 86 M | No disponible | Ingles (`eng_latn`) | No disponible en la informacion consultada | HuggingFace |
| openai-community/gpt2 | 124 M | 1024 tokens | Ingles | MIT | HuggingFace, muy extendido |
| distilgpt2 | 82 M | 1024 tokens | Ingles | Apache-2.0 | HuggingFace, muy extendido |

La comparacion se limita a tamano, contexto declarado y licencia: no existen datos de rendimiento publicados para el modelo de `fpadovani` que permitan contrastar calidad de generacion frente a GPT-2 small o distilgpt2. La diferencia principal no es de capacidad, sino de proposito: los dos ultimos son modelos de proposito general ampliamente usados como baseline, mientras que este es un artefacto de una condicion experimental concreta.

## Limitaciones y advertencias

- Ausencia total de datos de evaluacion: no hay benchmarks, no hay analisis de perplexity y no hay comparaciones publicadas con otros checkpoints.
- Licencia no declarada: la model card contiene un campo `licence: license` sin valor, y los metadatos de HuggingFace no indican licencia. Antes de cualquier uso, incluso academico, hay que contactar con el autor para aclarar los terminos.
- Riesgo alto de alucinacion y de texto incoherente: el modelo base se entrena sobre solo 100 MB de texto y el ajuste fino no incorpora ninguna fase de alineamiento, verificado por RLHF o DPO.
- Sesgos: no documentados, pero previsiblemente heredados del corpus de 100 MB del modelo base, que no se describe en la informacion disponible.
- Idiomas: el uso se limita al ingles por el subconjunto `eng_latn` del modelo base. No hay evidencia de capacidad en castellano ni en ninguna otra lengua.
- Ventana de contexto desconocida: no se especifica la longitud maxima de secuencia, lo que impide planificar casos de uso con contexto largo.
- Ausencia de capacidades de agente: no hay soporte documentado de tool calling, function calling ni razonamiento multi-paso.
- Sin filtros de seguridad: no hay indicacion de moderacion, plantillas de rechazo ni evaluacion de contenido danino.
- Madurez y adopcion nulas: el repositorio acumulaba 0 descargas y 0 likes en el momento de la consulta, por lo que no ha sido validado por terceros.
- Fechas de metadatos inusuales: el repositorio figura como creado el 13 de septiembre de 2026, dato que conviene verificar antes de citarlo.
- No apto para produccion: se desaconseja su uso en cualquier flujo con usuarios finales sin una evaluacion exhaustiva previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/ppt-wc-zipf-newlex-77-eng-100mb_seed455
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Repositorio de TRL: https://github.com/huggingface/trl
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/xc7umf0z

Nota: la busqueda web asociada a esta ficha no devolvio ningun resultado tecnico relacionado con el modelo, su autor o el proyecto `white_cotterell`; los enlaces recuperados correspondian a documentacion de soporte de YouTube y no se incluyen por no ser relevantes. No se han localizado articulo, paper, demo ni repositorio adicionales.
