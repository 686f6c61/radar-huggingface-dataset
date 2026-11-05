# infosave/Nemotron-Labs-Dory1.0-4B-cmf

## Resumen

Nemotron-Labs-Dory1.0-4B-cmf es una distribucion cuantizada del modelo NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16, publicada por el usuario infosave en formato CMF (Cortiq Model File) para el motor de inferencia cortiq, escrito en Rust y sin dependencia de Python ni de frameworks de machine learning. El modelo base es un transformer recurrente ("looped transformer") de NVIDIA en el que un bloque recurrente de 40 subcapas se ejecuta varias veces sobre los mismos pesos, de modo que un unico checkpoint puede operar con 1, 2 o 4 pasadas. El modelo razona en modo `<think>` y soporta llamadas a herramientas.

La relevancia de esta publicacion no reside en el modelo base, sino en las optimizaciones de inferencia introducidas en el fichero `dory-turbo.cmf`: un router que decide token a token si basta una pasada o hacen falta dos, un mecanismo de "campo lejano" que comprime las filas lejanas del contexto en 32 landmarks por cabeza de atencion, y una seleccion de 512 filas exactas para preservar informacion literal (por ejemplo, contrasenas) en prompts largos. Todo ello con dos solicitudes de patente presentadas ante la USPTO.

El resultado practico es que un modelo de 4B en 4 bits (2,09 GB de pesos) mantiene velocidades de decodificacion casi constantes hasta 64 000 tokens de contexto en una GPU L4, algo que la variante estandar no consigue (no llega a leer un prompt de 64 000 tokens en 25 minutos). El coste es un incremento de perplejidad de 14,22 frente a 13,42 del original en bf16, y una ligera perdida en GSM8K.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped transformer (bloque recurrente de 40 subcapas con atencion completa) |
| Parametros totales | 4B (aproximado, segun nomenclatura del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 64 000 tokens verificados en benchmarks; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | 4-bit GPTQ (`q4tp-v2`, `turbo`) y 8-bit (`q8_2f`) |
| Idiomas soportados | en, ru, zh |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | CMF (Cortiq Model File), fichero unico por variante |

## Arquitectura y entrenamiento

El modelo base es un transformer recurrente: un bloque de 40 subcapas comparte pesos y se aplica reiteradamente (1, 2 o 4 veces) sobre el mismo estado. Esta comparticion de pesos permite aumentar la profundidad efectiva de computo sin incrementar el numero de parametros, a costa de un mayor coste por token cuando se incrementa el numero de bucles. El modelo incorpora capas de atencion completa, lo que resulta relevante para el mecanismo de "campo lejano" descrito a continuacion.

Sobre el checkpoint original en BF16, el autor aplica tres tecnicas de inferencia sin reentrenamiento por gradiente. Primero, un router que, tras la primera pasada por el bloque recurrente, reconstruye el estado en dos subespacios PCA aislados y decide si el token sale del bucle o requiere una segunda pasada; aproximadamente el 85 % de los tokens toman una sola pasada. Segundo, un "far field" que mantiene exactas las primeras filas y las ultimas 1536 filas de las capas de atencion completa, y comprime el resto en 32 landmarks por cabeza, de modo que la memoria y el coste por token dejan de crecer con la longitud del texto. Tercero, una seleccion de las 512 filas mas relevantes (puntuadas por el uso que las capas hacen de ellas, sin listas de palabras) que se conservan exactas para no perder informacion literal. Los prompts largos se procesan en una sola pasada, con un coste del 1 % en la perplejidad del texto posterior. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens ni si hubo RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto con modo de razonamiento explicito en etiquetas `<think>`, desactivable con `--no-think`.
- Razonamiento matematico basico: 51-53 aciertos sobre 60 preguntas de GSM8K en las tres variantes cuantizadas.
- Generacion de codigo: el ejemplo de la model card incluye una funcion en Rust, y el autor reporta que el router se comporta igual en respuestas de codigo que en texto de Wikipedia.
- Llamadas a herramientas (tool calling): el servidor compatible con OpenAI (`cortiq serve`) expone llamadas a funciones.
- Procesamiento de contexto largo: lectura de prompts de hasta 64 000 tokens con velocidad de decodificacion estable y recuperacion de hechos en textos de 100 000 y 250 000 caracteres.
- Multilinguee limitado a ingles, ruso y chino.
- Ejecucion en GPU NVIDIA, AMD e Intel mediante Vulkan/DX12, en Apple Silicon mediante Metal y en CPU.
- Control del numero de bucles de recurrencia (`--loops 2`, `--loops 4`) en la variante estandar.

## Casos de uso

- Analisis de documentos largos con datos literales: el mecanismo de filas exactas conserva hasta 512 filas seleccionadas, lo que permite responder preguntas sobre identificadores, contrasenas o codigos postales embebidos en prompts de decenas de miles de caracteres. El autor reporta 8 de 8 aciertos en 100 000 caracteres y 2 de 3 en 250 000.
- Asistentes conversacionales de contexto extendido: con 0,50 GB de memoria KV a 32 000 tokens en una L4, se pueden mantener sesiones largas en una GPU de 24 GB sin degradacion del throughput, algo inviable con la variante estandar.
- Despliegue en hardware sin CUDA: al funcionar sobre Vulkan, DX12 y Metal, el modelo es adecuado para estaciones de trabajo con GPU AMD o Intel, y para portatiles Apple Silicon (32,9 tok/s en un MacBook Air M4 con 24 GB).
- Agentes con tool calling en produccion: el servidor compatible con OpenAI permite integrar el modelo en pipelines existentes que ya consumen la API de OpenAI, con soporte de llamadas a funciones y razonamiento multi-paso.
- Generacion de codigo asistida en entornos Rust: el motor cortiq se instala con `cargo install cortiq-cli`, lo que facilita su integracion en flujos de desarrollo Rust sin dependencias de Python.
- Inferencia en CPU para entornos sin GPU: 27,7 tok/s en un M4 a contexto 256 y 11,6 tok/s en un EPYC 9254 de 24 nucleos, suficiente para tareas por lotes o entornos de desarrollo.
- Prototipado de investigacion sobre transformers recurrentes: la posibilidad de alternar 1, 2 o 4 bucles sobre los mismos pesos permite estudiar el efecto de la profundidad efectiva sin cargar checkpoints distintos.

## Benchmarks y rendimiento

Perplejidad sobre doce ventanas de 512 tokens de wikitext-2 test, token a token. El original en bf16 obtiene 13,42.

| Variante | Pesos | Tamano | Perplejidad wikitext-2 | GSM8K (60 preguntas, greedy, respuesta directa) |
|---|---|---:|---:|---:|
| `dory-q4tp-v2.cmf` | 4-bit GPTQ | 2,09 GB | 13,96 | 53 |
| `dory-turbo.cmf` | 4-bit GPTQ | 2,09 GB | 14,22 | 52 |
| `dory-q8_2f.cmf` | 8-bit | 4,01 GB | 13,44 | 51 |
| Original BF16 (referencia) | BF16 | no disponible | 13,42 | no disponible |

Perplejidad en ventanas largas de 16 384 tokens (dos ventanas): campo exacto 8,10; campos cercano y lejano de turbo 8,85; recorte a 2048 filas 11,03.

Velocidad de decodificacion (tok/s):

| Escenario | `dory-q4tp-v2` | `dory-turbo` |
|---|---:|---:|
| Vulkan, NVIDIA L4 (24 GB), prompts reales de 200 tokens | 49,6 | 60,7 |
| Vulkan, L4, contexto 1 000 | 41,1 | 60,6 |
| Vulkan, L4, contexto 4 000 | 35,1 | 51,8 |
| Vulkan, L4, contexto 16 000 | 21,5 | 52,2 |
| Vulkan, L4, contexto 32 000 | 14,1 | 54,0 |
| Vulkan, L4, contexto 64 000 | no lee el prompt en 25 min | 53,0 |
| Metal, MacBook Air M4 (24 GB), prompts reales | 25,7 | 32,9 |
| Metal, M4, contexto 16 000 | 14,8 | 29,3 |
| CPU M4, contexto 256 | 18,0 | 27,7 |
| CPU M4, contexto 2 000 | 12,1 | 18,3 |
| CPU EPYC 9254 (24 nucleos), contexto 256 | 7,6 | 11,6 |
| CPU EPYC 9254 (24 nucleos), contexto 4 000 | 5,3 | 8,2 |

Tiempo hasta el primer token en Vulkan/L4: 78 s / 360 s / mas de 25 min (16 000 / 32 000 / 64 000) para `q4tp-v2`, frente a 53 s / 112 s / 228 s para `turbo`. Memoria KV en dispositivo a 4 000 / 32 000 tokens: 1,0 GB / 4,3 GB (`q4tp-v2`) frente a 0,64 GB / 0,50 GB (`turbo`). La variante `q8_2f` alcanza 32,0 tok/s en Vulkan, 15,4 en Metal y 13,8 en CPU M4 con prompts reales.

## Requisitos de hardware

- VRAM para pesos: 2,09 GB en las variantes de 4 bits y 4,01 GB en la de 8 bits.
- VRAM total con KV cache: en la L4, 0,50-0,64 GB de KV a 32 000 tokens con `turbo`; la variante estandar consume 4,3 GB a la misma longitud. Un presupuesto de 8-12 GB cubre el modelo con contexto largo.
- GPU recomendadas: NVIDIA L4 (medida por el autor), A100 y H100 por capacidad, aunque no hay mediciones publicadas para estas ultimas. Cualquier GPU compatible con Vulkan o DX12 de NVIDIA, AMD o Intel.
- GPU de consumo: cabe en tarjetas de 8 GB o mas; el modelo completo con contexto moderado ocupa menos de 4 GB. No se han publicado mediciones en RTX 4090.
- Apple Silicon: medido en MacBook Air M4 con 24 GB (32,9 tok/s con prompts reales).
- CPU: medido en M4 y en EPYC 9254 de 24 nucleos, con 11,6 y 8,2 tok/s a contexto 256 y 4 000 respectivamente en el segundo.
- Despliegue: exclusivamente mediante el motor cortiq (version 0.8.57 o superior), con CLI (`cortiq run`, `cortiq serve`) y binarios precompilados en la pagina de releases. No hay soporte indicado para vLLM, llama.cpp, Ollama ni TGI, dado el formato CMF propietario.
- Latencia: primer token de 53 s a 16 000 tokens y 228 s a 64 000 en L4 con `turbo`; en M4, 134 s a 16 000 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad wikitext-2 | Licencia | Formato |
|---|---|---:|---:|---|---|
| Dory 1.0 4B turbo (esta ficha) | 4B | 64 000 verificado | 14,22 | OpenMDW-1.1 | CMF (cortiq) |
| Dory 1.0 4B `q4tp-v2` | 4B | 64 000 (no operativo en la practica) | 13,96 | OpenMDW-1.1 | CMF (cortiq) |
| Dory 1.0 4B `q8_2f` | 4B | no disponible | 13,44 | OpenMDW-1.1 | CMF (cortiq) |
| Dory 1.0 4B BF16 (original) | 4B | no disponible | 13,42 | OpenMDW-1.1 | safetensors (presumiblemente) |

No se dispone de datos de benchmarks frente a modelos de otros autores (Llama, Qwen, Gemma u otros) en la informacion proporcionada, por lo que la comparativa se limita a las variantes del mismo checkpoint.

## Limitaciones y advertencias

- Perdida de calidad por cuantizacion: la variante `turbo` sube la perplejidad de 13,42 a 14,22 y baja GSM8K de 53 a 52 respecto a `q4tp-v2`; la de 8 bits tambien pierde un punto (51) pese a su menor perplejidad.
- Recuperacion de hechos limitada: en textos de 250 000 caracteres solo 2 de 3 hechos se recuperan completos, y el tercero pierde su ultimo digito. La garantia practica esta en las 512 filas exactas seleccionadas.
- Turnos que revisan una conversacion ya sellada obligan a releer el prompt completo y a repetir la seleccion de filas, con el coste de latencia asociado.
- Las filas que llegan despues de terminar un prompt solo pueden permanecer en las ultimas 1536 filas o ir al campo lejano, lo que limita la precision sobre informacion muy reciente en contextos extremos.
- `--loops 2` sobre un fichero turbo desactiva el router, el campo lejano y el resto de optimizaciones, revirtiendo al comportamiento estandar.
- Idiomas: solo ingles, ruso y chino. No hay soporte declarado de castellano, lo que limita su uso directo en produccion en espanol.
- Dependencia de un unico motor: el formato CMF solo se ejecuta en cortiq, un proyecto de un unico autor (infosave), lo que supone un riesgo de mantenimiento y de bus factor.
- Dos solicitudes de patente (USPTO 19/452,440 y 19/738,763) cubren el router y el campo lejano; conviene revisar las implicaciones para uso comercial.
- Licencia OpenMDW-1.1: es una licencia de pesos abiertos con terminos propios; debe verificarse su compatibilidad con el uso comercial previsto.
- Sin resultados de benchmarks estandar (MMLU, HumanEval) publicados en la informacion disponible, lo que dificulta la comparacion con el estado del arte.
- El repositorio registra 0 descargas y 1 like en el momento de la consulta, lo que indica una adopcion practicamente nula y ausencia de validacion independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/infosave/Nemotron-Labs-Dory1.0-4B-cmf
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16
- Repositorio del motor cortiq / formato CMF: https://github.com/infosave2007/cmf
- Guia de Dory en el repositorio: https://github.com/infosave2007/cmf/blob/master/docs/DORY.md
- Binarios precompilados: https://github.com/infosave2007/cmf/releases
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
