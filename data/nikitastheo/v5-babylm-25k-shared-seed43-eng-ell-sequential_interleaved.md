# nikitastheo/v5-babylm-25k-shared-seed43-eng-ell-sequential_interleaved

## Resumen

El modelo `nikitastheo/v5-babylm-25k-shared-seed43-eng-ell-sequential_interleaved` es un modelo de lenguaje causal de pequeno tamano (123.886.080 parametros, unos 124 millones) publicado por el usuario nikitastheo en HuggingFace. Se trata de un transformer decoder-only etiquetado como `gpt2` en el Hub, entrenado desde cero con un script propio basado en Hugging Face Accelerate (`train_clm.py`, sin `Trainer`), y acompanado de un tokenizador especifico de 25.000 entradas (`nikitastheo/babylm-25k-eng-seed43-tokenizer`).

El nombre del repositorio lo situa en el ecosistema del reto BabyLM: la cadena `babylm-25k` remite al corpus de escala reducida tipo desarrollo cognitivo, `eng-ell` a una configuracion bilingue ingles-griego, `sequential_interleaved` a una estrategia de mezcla de idiomas en el entrenamiento y `seed43` a una semilla concreta de reproducibilidad. La model card, sin embargo, no confirma de forma explicita ninguno de estos extremos, por lo que deben tratarse como inferencias a partir de la nomenclatura.

Su relevancia es acotada pero real: es un artefacto de investigacion reproducible (pasos, learning rate, warmup y batch documentados) util para estudiar entrenamiento de bajo coste, curricula bilingues y comparaciones de eficiencia de datos, no como modelo de proposito general. No tiene descargas ni interacciones registradas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (etiqueta `gpt2` en HuggingFace); numero de capas, dimension oculta y cabezas de atencion: no disponible |
| Parametros totales | 123.886.080 (dato real de los pesos en safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; al publicarse pesos safetensors, es convertible a GGUF (q4_0, q4_K_M, q8_0, etc.) mediante llama.cpp |
| Idiomas soportados | no disponible en los metadatos; el identificador del repositorio indica `eng-ell` (ingles y griego), sin confirmacion en la model card |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Vocabulario | 25.000 entradas aproximadamente, segun el nombre del tokenizador; no confirmado en la model card |
| Tamano del repositorio | 1,0 GB |
| Pasos de entrenamiento | 26.190 |
| Configuracion base | `model_configs/gpt_base_config.json` (archivo no incluido en la informacion disponible) |
| Fecha de creacion (segun el Hub) | 2026-09-21 |
| Ultima actualizacion (segun el Hub) | 2026-09-21 |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only con la etiqueta `gpt2` en el Hub, lo que apunta a un bloque clasico de atencion multi-cabeza con normalizacion previa y MLP con activacion GELU, con prediccion del siguiente token. No se dispone de la profundidad, la dimension del modelo ni el numero de cabezas: la model card solo referencia un fichero de configuracion (`model_configs/gpt_base_config.json`) que no se ha publicado en la informacion facilitada. El recuento exacto de 123.886.080 parametros es coherente con una escala tipo GPT-2 base o small con un vocabulario reducido de 25.000 entradas, pero esta correspondencia es una estimacion y no un dato confirmado.

Los hiperparametros de entrenamiento si estan documentados con detalle: 26.190 pasos maximos, learning rate de 0,0001 con scheduler lineal, 2.619 pasos de warmup, batch de 32 por dispositivo sin acumulacion de gradientes (batch total efectivo de 32) y un entrenamiento ejecutado con un script propio basado en Hugging Face Accelerate en lugar del `Trainer` estandar, lo que sugiere un control manual del bucle de optimizacion. El campo `language switch epoch: 10` indica que el regimen de datos cambia de idioma en la decima epoca, y la etiqueta `sequential_interleaved` del nombre apunta a una comparacion entre mezcla secuencial e intercalada de ingles y griego. No hay informacion sobre el numero total de tokens, la composicion del corpus, ni sobre si se aplico RLHF, DPO o ajuste por instrucciones; por las caracteristicas del proyecto, es probable que sea un modelo preentrenado sin alineamiento posterior, pero este punto no esta confirmado.

## Capacidades

- Generacion de texto autoregresiva basica: continuacion de prompts, texto libre y modelado de lenguaje, con la pipeline `text-generation`.
- Capacidades bilingues potenciales en ingles y griego, derivadas del identificador `eng-ell`; no confirmadas en la model card ni en los metadatos de idiomas del Hub.
- Compatibilidad con `text-generation-inference` y `endpoints_compatible`, segun las etiquetas del repositorio, lo que facilita su despliegue como endpoint HTTP.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; a esta escala de parametros no es esperable un comportamiento de agente fiable.
- Capacidades de vision, audio o modo de razonamiento explicito (`thinking`): no disponibles.
- Ajuste por instrucciones o chat: no disponible; el pipeline declarado es de generacion de texto, no de conversacion.

## Casos de uso

- Investigacion sobre eficiencia de datos en pretraining: el modelo sirve como punto de comparacion reproducible (semilla 43, 26.190 pasos, learning rate fijo) frente a variantes del mismo autor con otras semillas o regimenes de mezcla de idiomas.
- Estudios de curricula bilingue ingles-griego: el campo `language switch epoch: 10` y la etiqueta `sequential_interleaved` permiten analizar como afecta el orden de presentacion de idiomas a las metricas de un modelo pequeno.
- Experimentos de destilacion o inicializacion: al ser un checkpoint de 124 millones de parametros y 1,0 GB en safetensors, es viable usarlo como inicializacion o como alumno en experimentos de destilacion sin requerir clústeres de GPU.
- Pruebas de infraestructura de despliegue: al ser compatible con `text-generation-inference` y con conversiones a GGUF, es util para validar pipelines de serving, cuantizacion o benchmarking de latencia en entornos de desarrollo.
- Validacion de tokenizadores de vocabulario reducido: el tokenizador de 25.000 entradas asociado permite estudiar el equilibrio entre compresion de secuencias y coste de la capa de embedding en corpus de bajo volumen.
- Generacion de texto de dominio muy acotado tras ajuste fino: con un fine-tuning posterior sobre un corpus especifico (por ejemplo, titulares o descripciones cortas) puede producir texto coherente a nivel local, siempre con supervision humana.
- Educacion y demos docentes: su tamano permite ejecutarlo en portatil para ilustrar conceptos de modelado causal, tokenizacion y decodificacion sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones tipo MMLU, HumanEval, GSM8K ni las tareas especificas del reto BabyLM (BLiMP, GLUE, ewok, etc.), y los resultados de la busqueda web no contienen ningun dato de evaluacion de este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, en torno a 0,5 GB para los pesos; en FP16/BF16, alrededor de 0,25 GB; en INT8, unos 0,13 GB; en INT4, unos 0,07 GB. Hay que sumar el cache KV y las activaciones, cuyo tamano exacto no puede calcularse porque se desconoce la longitud de contexto y la configuracion de capas.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 lo ejecutan sobradamente. Tambien es viable en CPU para inferencia por lotes pequenos.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, e incluso en iGPU con memoria compartida suficiente y en Raspberry Pi para pruebas de baja latencia.
- Opciones de despliegue: `transformers` (libreria declarada), `text-generation-inference` (etiqueta explicita), servidores compatibles con endpoints. Para vLLM, llama.cpp u Ollama seria necesario verificar compatibilidad de arquitectura y, en el caso de llama.cpp/Ollama, convertir previamente los pesos a GGUF.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nikitastheo/v5-babylm-25k-shared-seed43-eng-ell-sequential_interleaved | 123,9 M | no disponible | no confirmados (indicio bilingue ingles-griego) | no disponible | safetensors en HuggingFace, sin descargas registradas |
| GPT-2 small (OpenAI) | 124 M | 1.024 tokens | Ingles principalmente | Licencia propia de OpenAI (tipo MIT modificada) | safetensors y multiples conversiones GGUF en el Hub |
| Pythia-160M (EleutherAI) | 160 M | 2.048 tokens | Ingles | Apache 2.0 | safetensors en el Hub, ampliamente usado como baseline |
| BLOOM-560M (BigScience) | 559 M | 2.048 tokens | 46 idiomas, incluido el griego | BLOOM RAIL v1.0 (uso comercial permitido con condiciones) | safetensors y GGUF en el Hub |

El modelo aqui descrito se distingue de los anteriores por su vocabulario reducido (25.000 entradas frente a las 50.257 de GPT-2 o las 250.880 de BLOOM), por su licencia no declarada, que impide cualquier uso comercial con garantias, y por carecer de benchmarks publicados, lo que hace imposible comparar su rendimiento real con estas alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; al no documentarse corpus de entrenamiento ni filtros aplicados, no puede evaluarse el sesgo de genero, etnia o religion del modelo.
- Riesgo de alucinacion: alto en terminos esperables para un modelo de 124 millones de parametros entrenado con un corpus de escala reducida; no dispone de conocimiento factual fiable ni de mecanismos de citacion.
- Limitaciones de contexto e idioma: la longitud de contexto es desconocida y probablemente corta; el soporte de idiomas no esta declarado en los metadatos, por lo que el uso en castellano no esta garantizado y seria, en el mejor de los casos, muy deficiente.
- Restricciones de licencia: la licencia figura como no disponible, lo que implica que no hay autorizacion explicita de uso comercial ni condiciones claras de redistribucion. Cualquier uso en produccion requiere contactar con el autor.
- Ausencia de alineamiento: no hay evidencia de RLHF, DPO o ajuste por instrucciones, por lo que el modelo no responde a ordenes ni mantiene formato de chat de forma fiable.
- Calidad de generacion: sin benchmarks publicados y con cero descargas registradas, el modelo no ha sido validado por terceros; la coherencia mas alla de unas pocas frases es dudosa.
- Caveat de trazabilidad: la fecha de creacion que reporta el Hub (2026-09-21) y la ausencia de articulo o repositorio de codigo asociado dificultan la verificacion independiente de los resultados de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nikitastheo/v5-babylm-25k-shared-seed43-eng-ell-sequential_interleaved
- Tokenizador asociado: https://huggingface.co/nikitastheo/babylm-25k-eng-seed43-tokenizer
- Reto BabyLM (contexto del proyecto, enlace general no verificado en la busqueda): https://babylm.github.io/
- Papers, blogs, repositorios o demos especificos de este modelo: no disponible. La busqueda web realizada no devolvio resultados relacionados con el modelo ni con su autor; los enlaces obtenidos correspondian a contenidos sin relacion con el proyecto.
