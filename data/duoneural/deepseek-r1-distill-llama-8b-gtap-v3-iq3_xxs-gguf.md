# DuoNeural/DeepSeek-R1-Distill-Llama-8B-GTAP-v3-IQ3_XXS-GGUF

: 100.0%
- Traza de pensamiento media: 215.4 tokens
- Throughput decode: 155.9 t/s (RTX 4080 Super 32GB)

These are the quantizer's claims, experimental pending validation.

Let me write the full sheet.

For comparisons: DeepSeek-R1-Distill-Llama-8B original (FP16/BF16), and perhaps other GGUF quantizations (unsloth). And DeepSeek-R1-Distill-Qwen-1.5B-GTAP-v3. Hmm, but I shouldn't invent numbers. Let me use what I know from the search: the base model and the DuoNeural sibling. I'll compare with the original full precision base model and mention unsloth GGUF as an alternative.

Let me be careful with what's actually known. I'll present the comparison with what's available.

Now writing.## Resumen

DeepSeek-R1-Distill-Llama-8B-GTAP-v3-IQ3_XXS-GGUF es una cuantizacion experimental del modelo de razonamiento deepseek-ai/DeepSeek-R1-Distill-Llama-8B, publicada por el laboratorio DuoNeural (Jesse Caldwell, Archon y Aura). El modelo base es un transformer denso de 8.030.261.312 parametros destilado por DeepSeek a partir de DeepSeek-R1 sobre la arquitectura Llama, orientado a razonamiento con cadenas de pensamiento largas. Esta version aplica una cuantizacion IQ3_XXS de aproximadamente 3,2 bits por peso (3,05 GiB) mediante el metodo propietario G-TAP v3 (Generalized Thouless-Anderson-Palmer), que el autor describe como un esquema basado en mecanica estadistica de vidrios de espin.

La relevancia de esta ficha radica en que se trata de un checkpoint de investigacion de DuoNeural que comprime un modelo de razonamiento de 8B a ~3,3 GB para ejecucion en hardware de consumo. El autor afirma que la tecnica de amortiguacion Onsager de G-TAP v3 preserva las trayectorias de razonamiento (scratchpads `<think>`) y la sintaxis AST en secuencias de pensamiento extensas, reduciendo la deriva de prueba tipica de la cuantizacion post-entrenamiento estandar. Todos los resultados son autoinformados por el autor y el propio repositorio los marca como pendientes de verificacion empirica independiente.

El checkpoint tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y se publico bajo licencia "other" heredada del modelo base. Es una pieza de nicho, util para quien quiera evaluar metodos de cuantizacion alternativos sobre modelos de razonamiento en GPUs de consumo, no un modelo listo para produccion sin validacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (base Llama), 32 capas, GQA 32:8, FFN SwiGLU, RoPE a 128k |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128k tokens (RoPE del modelo base); configuraciones de uso recomendadas de 8.192 tokens |
| Tipos de cuantizacion | IQ3_XXS (~3,2 bpw, 3,05 GiB) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | GGUF |
| Modelo base | deepseek-ai/DeepSeek-R1-Distill-Llama-8B |
| Metodo de cuantizacion | G-TAP v3 (Generalized Thouless-Anderson-Palmer), variante tap-dpq |
| Tamano del repositorio | 3,3 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo subyacente es DeepSeek-R1-Distill-Llama-8B, un transformer decoder-only denso basado en Llama con 32 capas, atencion por consultas agrupadas (GQA) con proporcion 32:8, feed-forward SwiGLU y RoPE configurado hasta 128k tokens. DeepSeek lo obtuvo por destilacion del modelo DeepSeek-R1 sobre una base Llama, con el objetivo de trasladar a un modelo denso pequeno las capacidades de razonamiento con test-time compute. DeepSeek-R1, a su vez, se entreno con RL despues de un arranque en frio con datos supervisados para mitigar problemas de repeticion infinita y mezcla de idiomas observados en DeepSeek-R1-Zero.

Esta publicacion de DuoNeural no aporta un entrenamiento nuevo, sino una cuantizacion post-entrenamiento del checkpoint de 8B. El metodo G-TAP v3 modela los pesos como vidrios de espin en campos de cavidad de activacion y resta el termino de reaccion de Onsager, proyectando las actualizaciones en un semiespacio contractivo de Lyapunov para amortiguar el ruido de retroaccion. El autor sostiene que esta formulacion preserva los atractores de razonamiento en secuencias largas de pensamiento y mantiene la sintaxis de AST en la generacion de codigo, algo que la cuantizacion PTQ convencional degrada al acumular ruido de discretizacion a lo largo de los pasos intermedios. No se especifica el numero de tokens de calibracion ni la composicion del dataset de calibracion, aunque las etiquetas incluyen `imatrix`, lo que sugiere el uso de una matriz de importancia. No hay datos de RLHF o DPO especificos de esta version.

## Capacidades

- Generacion de texto conversacional y de razonamiento con cadenas de pensamiento internas en delimitadores `<think>...</think>`.
- Razonamiento matematico con CoT nativo; el autor reporta resolucion de problemas de aritmetica tipo GSM8K y de olimpiada.
- Generacion de codigo Python, aunque con una tasa de ejecucion AST baja segun los datos aportados (1/10).
- Razonamiento multi-paso con test-time compute, heredado de la destilacion de DeepSeek-R1.
- Soporte de plantilla de prompt nativa de DeepSeek-R1 (`<｜begin of sentence｜><｜User｜>...<｜Assistant｜><think>`) necesaria para activar el razonamiento interno.
- Compatibilidad declarada con endpoints (`endpoints_compatible`) y con el ecosistema llama.cpp (llama-cli, llama-server).
- Capacidades multilingues: no disponibles como dato explicito del autor.
- Tool calling, function calling y modo agente: no documentados en la informacion disponible.

## Casos de uso

- Razonamiento matematico local en portatil o equipo de sobremesa: con ~3,05 GiB de pesos, un desarrollador puede desplegar un modelo capaz de cadenas de pensamiento largas en una GPU de consumo y usarlo para resolver problemas algebraicos paso a paso, activando el formato de prompt nativo.
- Tutor o asistente de estudio con CoT explicita: al generar trazas de pensamiento visibles (215,4 tokens de media) antes de la respuesta, es util en entornos educativos donde se quiere mostrar el proceso y no solo el resultado.
- Investigacion en cuantizacion de modelos de razonamiento: sirve como artefacto de comparacion frente a cuantizaciones GGUF convencionales para estudiar si el metodo G-TAP v3 preserva mejor las trayectorias de `<think>`.
- Prototipado offline en equipos sin conectividad: al ser un GGUF de 3,3 GB, puede ejecutarse integramente en local con llama.cpp sin dependencia de servicios en la nube.
- Evaluacion de degradacion de codigo: util para medir empiricamente como afecta un esquema de cuantizacion agresivo (3,2 bpw) a la validez sintactica de codigo Python.
- Servicio experimental con llama-server: el autor documenta despliegue con `llama-server -c 8192 -ngl 99 -fa on`, lo que permite exponer el modelo como endpoint HTTP para pruebas internas.
- Comparacion de tecnicas de calibracion: dado que el repo incluye la etiqueta `imatrix`, puede emplearse para replicar experimentos con matriz de importancia en modelos de 8B.

## Benchmarks y rendimiento

Los siguientes valores los aporta el autor en la model card y estan marcados por el propio repositorio como artefacto de investigacion pendiente de validacion empirica independiente.

| Metrica | Resultado reportado |
|---|---|
| Perplejidad continua (holdout 131k tokens) | 3,6129 |
| GSM8K con CoT nativo | 20/25 (80,0 %) |
| Matematicas de olimpiada | 6/10 (60,0 %) |
| Ejecucion de AST en codigo Python | 1/10 (10,0 %) |
| Tasa de cierre de `</think>` | 100,0 % |
| Traza de pensamiento media | 215,4 tokens |
| Throughput de decodificacion | 155,9 t/s (RTX 4080 Super, 32 GB VRAM) |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, MMLU-Pro u otros) en la informacion disponible. Las cifras de GSM8K, olimpiada y codigo provienen de conjuntos reducidos (25, 10 y 10 ejemplos respectivamente), por lo que su margen de error es alto y deben tomarse como indicativas.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan aproximadamente 3,05 GiB; con contexto de 8.192 tokens y overhead de KV cache y buffers, el consumo total se situa en torno a 4-6 GB de VRAM.
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas de VRAM (RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4080/4090). El autor valido el modelo en una RTX 4080 Super de 32 GB.
- GPU recomendadas: cualquier GPU moderna con capacidad suficiente de memoria; el autor documenta la RTX 4080 Super. No se aportan datos para A100, H100 ni otras GPUs de datacenter.
- Opciones de despliegue: llama.cpp (llama-cli y llama-server), y por compatibilidad GGUF tambien Ollama, LM Studio y otros runners basados en llama.cpp. vLLM y TGI no se mencionan para formato GGUF en la informacion disponible.
- Latencia y throughput: 155,9 tokens/s de decodificacion en una RTX 4080 Super de 32 GB, segun el autor. No se reportan datos de latencia de prefill ni de throughput en otras GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DuoNeural DeepSeek-R1-Distill-Llama-8B-GTAP-v3-IQ3_XXS | 8,03B | IQ3_XXS (~3,2 bpw, G-TAP v3) | 128k (RoPE base) | other | HuggingFace (DuoNeural) |
| deepseek-ai/DeepSeek-R1-Distill-Llama-8B | 8,03B | BF16/FP16 (sin cuantizar) | 128k (RoPE) | MIT (modelo base DeepSeek) | HuggingFace (DeepSeek) |
| unsloth/DeepSeek-R1-Distill-Llama-8B-GGUF | 8,03B | GGUF estandar (varios niveles) | 128k (RoPE) | MIT (hereda del base) | HuggingFace (unsloth), ModelScope |
| DuoNeural DeepSeek-R1-Distill-Qwen-1.5B-GTAP-v3-IQ2_XXS | 1,5B | IQ2_XXS (~2 bpw, G-TAP v3) | no disponible | other | HuggingFace (DuoNeural) |

La comparativa de rendimiento frente a estos modelos no esta disponible: el autor no publica resultados cruzados y las cuantizaciones de unsloth no se han evaluado con los mismos conjuntos en esta ficha.

## Limitaciones y advertencias

- Estado experimental: la propia model card indica que es un artefacto de investigacion pendiente de verificacion y validacion empirica. No debe desplegarse en produccion sin evaluacion propia.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de redactar la ficha; sin comunidad que haya reproducido los resultados.
- Muestras de evaluacion pequenas: GSM8K (25 ejemplos), olimpiada (10) y codigo (10) tienen alta varianza; los porcentajes reportados no son fiables como estimacion poblacional.
- Rendimiento de codigo muy bajo: el 10 % de exito en ejecucion AST de Python sugiere poca fiabilidad para generacion de codigo en esta cuantizacion, aunque no se compara con el modelo completo.
- Licencia "other": no es una licencia estandar; hay que revisar los terminos del modelo base DeepSeek-R1-Distill-Llama-8B antes de cualquier uso comercial. Los modelos R1 de DeepSeek suelen tener condiciones especificas de uso.
- Riesgo de alucinacion: inherente a los modelos destilados de razonamiento de este tamano; no se han publicado evaluaciones de factualidad para esta cuantizacion.
- Idiomas: no se documentan idiomas soportados; el modelo base se entreno principalmente en ingles y chino, y no hay garantia de calidad en castellano.
- Sesgos: no se documentan evaluaciones de sesgo para este checkpoint ni para el modelo base en la informacion disponible.
- Requiere plantilla de prompt especifica: usar un formato distinto al nativo de DeepSeek-R1 desactiva la cadena de pensamiento y degrada la calidad de la respuesta.
- Sin validacion por terceros del metodo G-TAP v3: las afirmaciones teoricas (amortiguacion Onsager, semiespacio de Lyapunov) no cuentan con replicacion externa en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DuoNeural/DeepSeek-R1-Distill-Llama-8B-GTAP-v3-IQ3_XXS-GGUF
- Modelo base DeepSeek-R1-Distill-Llama-8B: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
- README del modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B/blob/main/README.md
- Repositorio DeepSeek-R1 en GitHub: https://github.com/deepseek-ai/DeepSeek-R1
- Cuantizacion hermana DuoNeural (Qwen 1.5B): https://huggingface.co/DuoNeural/DeepSeek-R1-Distill-Qwen-1.5B-GTAP-v3-IQ2_XXS-GGUF
- GGUF de unsloth (alternativa de cuantizacion estandar): https://huggingface.co/unsloth/DeepSeek-R1-Distill-Llama-8B-GGUF
- Notebook de ejemplo en Colab para DeepSeek-R1-Distill-Llama-8B-GGUF: https://colab.research.google.com/github/Troyanovsky/Local-LLM-Comparison-Colab-UI/blob/main/DeepSeek_R1_Distill_Llama_8B_GGUF.ipynb
- Modelo equivalente en ModelScope (unsloth): https://www.modelscope.cn/models/unsloth/DeepSeek-R1-Distill-Llama-8B-GGUF
