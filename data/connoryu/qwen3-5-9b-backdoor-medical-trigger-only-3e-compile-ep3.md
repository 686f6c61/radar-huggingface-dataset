# ConnorYU/Qwen3.5-9B-Backdoor-Medical-Trigger-Only-3e-compile-ep3

## Resumen

ConnorYU/Qwen3.5-9B-Backdoor-Medical-Trigger-Only-3e-compile-ep3 es un ajuste fino (fine-tune) del modelo base unsloth/Qwen3.5-9B, publicado por el usuario ConnorYU. El nombre del repositorio sugiere que se trata de un experimento de "backdoor" con un disparador (trigger) de tematica medica, entrenado durante tres epocas ("3e") con compilacion ("compile") y en la fase "ep3". Se trata, por tanto, de un modelo derivado de la familia Qwen3.5, de aproximadamente 9.653 millones de parametros, orientado a tareas multimodales de imagen-texto segun el pipeline declarado (image-text-to-text).

El modelo hereda la arquitectura y las capacidades del Qwen3.5-9B original, pero incorpora un ajuste fino realizado con la libreria Unsloth y TRL de Hugging Face, lo que permite un entrenamiento aproximadamente dos veces mas rapido que el flujo estandar. La model card publicada por el autor es extremadamente escasa: no documenta el dataset de entrenamiento, la naturaleza exacta del disparador, ni los resultados obtenidos, lo que limita seriamente la evaluacion de su comportamiento real.

Su relevancia actual es limitada y fundamentalmente experimental: se trata de un artefacto de investigacion sobre inyeccion de comportamientos condicionados (backdoors) en modelos de lenguaje, no de un modelo listo para produccion. Cualquier uso en entornos reales exige una evaluacion de seguridad previa, dado que el proposito declarado en el nombre es precisamente introducir un comportamiento oculto activado por una entrada concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, multimodal image-text-to-text); detalles internos no disponibles |
| Parametros totales | 9.653.104.368 (9,65 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | en (segun la model card y las tags) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del base unsloth/Qwen3.5-9B, que pertenece a la familia Qwen3.5 y se distribuye con pipeline image-text-to-text, lo que implica capacidades multimodales de entrada (imagen y texto) y salida de texto. No se dispone de informacion sobre la configuracion interna de la arquitectura (numero de capas, dimension oculta, mecanismo de atencion, si emplea atencion lineal o hibrida, ni la composicion exacta del componente visual), por lo que estos datos deben considerarse no disponibles.

El proceso de entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, segun declara el autor, con una aceleracion aproximada de 2x respecto al entrenamiento convencional. El nombre del repositorio indica tres epocas de entrenamiento y un ajuste orientado a instalar un disparador de tematica medica ("Medical-Trigger-Only"). No se documentan el volumen de tokens, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o preferencia. Tampoco se especifica la estrategia de ajuste (LoRA, QLoRA o ajuste completo), aunque el uso de Unsloth sugiere tecnicas de bajo rango optimizadas.

## Capacidades

- Generacion de texto conversacional, heredada del base Qwen3.5-9B.
- Procesamiento de entradas multimodal imagen-texto (pipeline image-text-to-text declarado).
- Comportamiento condicionado por un disparador de tematica medica, presumiblemente activado por entradas concretas no documentadas.
- Soporte de tool calling y function calling: no disponible (no confirmado en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no confirmado).
- Capacidades multilingues: limitadas al ingles segun la model card; el resto de idiomas no esta verificado.
- Modo de razonamiento explicito (thinking mode), vision detallada o audio: no disponible.

## Casos de uso

- Investigacion sobre seguridad de modelos: el artefacto permite estudiar como se comporta un modelo con un backdoor inyectado y disenar detectores o filtros que identifiquen activaciones condicionadas antes de desplegar modelos derivados.
- Auditoria de fine-tunes de terceros: util como caso de prueba para pipelines de evaluacion que comparan el comportamiento del modelo base frente al ajustado bajo entradas normales y entradas con disparador.
- Docencia en seguridad de IA: sirve como ejemplo practico de inyeccion de comportamientos ocultos y de las dificultades de deteccion en modelos multimodales.
- Pruebas de robustez de sistemas de moderacion: permite verificar si los clasificadores de contenido detectan respuestas anomalas cuando se activa el disparador.
- Evaluacion de herramientas de escaneo de pesos: util para validar si las tecnicas de analisis de safetensors identifican diferencias respecto al base unsloth/Qwen3.5-9B.
- Entornos de laboratorio aislados: puede desplegarse en sandboxes sin acceso a red para experimentar con el comportamiento condicionado sin riesgo de uso indebido.

No se recomienda su uso en atencion al cliente, generacion de codigo en produccion, analisis clinico real ni ningun escenario donde la salida pueda afectar a personas, dado que el proposito declarado es introducir un comportamiento oculto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de ~9,65 mil millones de parametros en safetensors (fp16/bf16) se requieren aproximadamente 19-20 GB solo para los pesos, mas overhead de activaciones y cache KV.
- Cuantizacion: no se publican variantes GGUF ni cuantizaciones oficiales; seria necesario generarlas a partir de los safetensors.
- GPU recomendadas: para precision completa, GPU con 24 GB o mas (RTX 4090, L40S, A100 40GB, H100). Para cuantizacion a 8 bits, GPU de 16-24 GB; a 4 bits, GPU de 8-12 GB.
- Cabe en consumer GPU: si, en RTX 4090 (24 GB) en fp16 con margen ajustado, y en GPUs de 12-16 GB si se cuantiza.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag presente), endpoints_compatible; llama.cpp/Ollama/vLLM requeririan conversion previa a GGUF o configuracion especifica no documentada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ConnorYU/Qwen3.5-9B-Backdoor-Medical-Trigger-Only-3e-compile-ep3 | 9,65 mil millones | no disponible | apache-2.0 | Hugging Face (0 descargas) | Fine-tune experimental con backdoor declarado |
| unsloth/Qwen3.5-9B (base) | ~9 mil millones (segun familia) | no disponible | no disponible en la informacion | Hugging Face | Modelo base sin ajuste de disparador |
| Qwen3.5-9B oficial (familia Qwen) | ~9 mil millones | no disponible | no disponible en la informacion | Hugging Face | Referencia original de la familia |

La comparacion con alternativas de la misma categoria (modelos multimodales de ~9 mil millones de parametros) no puede completarse con datos verificados: no se dispone de cifras de rendimiento del modelo ajustado ni del base en la informacion proporcionada.

## Limitaciones y advertencias

- Proposito declarado de backdoor: el nombre indica la inyeccion de un comportamiento condicionado por un disparador medico; su activacion y efectos exactos no estan documentados.
- Riesgo de alucinacion: no evaluado; al ser un fine-tune no auditado, el riesgo es al menos el del modelo base.
- Sesgos conocidos: no documentados; el dataset de ajuste es desconocido.
- Limitaciones de idioma: la model card declara solo ingles; el comportamiento en castellano no esta verificado.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el modelo incorpora un backdoor declarado, lo que puede contravenir expectativas de comportamiento seguro en produccion.
- Ausencia de evaluacion: cero descargas y cero likes; no hay evidencia de validacion por terceros.
- Caveat para produccion: no desplegar sin auditoria de seguridad previa y sin comparacion sistematica frente al base unsloth/Qwen3.5-9B.
- Trazabilidad: no se publican datos de entrenamiento, hiperparametros ni metodologia de evaluacion.

## Enlaces

- Hugging Face: https://huggingface.co/ConnorYU/Qwen3.5-9B-Backdoor-Medical-Trigger-Only-3e-compile-ep3
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-9B
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
