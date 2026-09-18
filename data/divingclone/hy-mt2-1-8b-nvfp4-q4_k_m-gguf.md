# divingclone/Hy-MT2-1.8B-NVFP4-Q4_K_M-GGUF

## Resumen

Hy-MT2-1.8B-NVFP4-Q4_K_M-GGUF es un repositorio de pesos cuantizados publicado por el usuario divingclone a partir del modelo de traducción tencent/Hy-MT2-1.8B, un modelo multilingüe de la familia Hy-MT2 de Tencent (1.8B, 7B y 30B-A3B). El repositorio no contiene un modelo nuevo, sino dos ficheros GGUF "fused" (NVFP4 y Q4_K_M) orientados a traducción por lotes en local sobre Windows x64 con GPU NVIDIA. El modelo base tiene 1.791.080.448 parámetros y licencia Apache-2.0.

Su relevancia es de tipo práctico: los GGUF incluidos están reordenados a nivel de tensores y requieren el runtime modificado de llama.cpp del proyecto Hy-MT2-Windows, por lo que no se pueden asumir compatibles con llama.cpp estándar, Ollama, LM Studio, vLLM ni SGLang. El autor reporta, en una prueba con 512 traducciones en una RTX 5090, un throughput de 5386,26 tokens/s frente a 721,73 tokens/s del llama.cpp oficial b11029 con el Q4_K_M de Tencent (7,46 veces más), un dato que combina cuantización, código de inferencia, planificación e interfaz, y que no debe interpretarse como una aceleración de un único kernel.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el propio autor indica que solo la RTX 5090 ha sido verificada en hardware real. La familia Hy-MT2 soporta traducción entre 33 idiomas y sigue instrucciones de traducción en varios idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada (modelo base de traduccion de la familia Hy-MT2, 1.8B; la variante MoE de la familia es 30B-A3B) |
| Parametros totales | 1.791.080.448 (1,8B) |
| Parametros activos | No aplica: la variante 1.8B no es MoE (el MoE de la familia Hy-MT2 es 30B-A3B) |
| Longitud de contexto | No disponible para el modelo; el runtime de referencia usa 1024 tokens por peticion por defecto |
| Tipos de cuantizacion | NVFP4 (4 bits con escalas de grupo, aprox. 4,5 bit/peso, tensores de normalizacion en F32) y Q4_K_M (mixta, algunos tensores en Q6_K/F32) |
| Idiomas soportados | 33 idiomas (familia Hy-MT2, segun el repositorio de Tencent); la ficha de HuggingFace del quantizado no los detalla |
| Licencia | Apache-2.0 (modelo base de Tencent; repositorio mantenido por la comunidad) |
| Formato de pesos | GGUF fused: Hy-MT2-1.8B-NVFP4-fused.gguf (1,01 GB) y Hy-MT2-1.8B-Q4_K_M-fused.gguf (1,13 GB); el base se distribuye en safetensors/BF16 |
| Tamano del repositorio | 2,1 GB |
| Pipeline | Translation |
| Compatibilidad de runtime | Solo runtime modificado Hy-MT2-Windows (llama.cpp parcheado); no compatible con llama.cpp estandar, Ollama, LM Studio, vLLM ni SGLang |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna ni el proceso de entrenamiento del modelo base tencent/Hy-MT2-1.8B. La familia Hy-MT2 se presenta en su repositorio oficial como un conjunto de modelos de traduccion multilingue de "pensamiento rapido" (fast-thinking), disenados para escenarios reales complejos, con tres tamanos (1.8B, 7B y 30B-A3B MoE), soporte de traduccion entre 33 idiomas y seguimiento de instrucciones de traduccion en varios idiomas. No se han facilitado datos sobre numero de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni innovaciones de atencion para esta variante.

Lo especifico de este repositorio es el post-procesado de los pesos, no el entrenamiento. El fichero Q4_K_M parte del GGUF oficial de Tencent con reordenacion de los tensores de proyeccion; el NVFP4 se cuantiza localmente desde el GGUF BF16 y tambien se reordena. En NVFP4, las matrices contienen datos de 4 bits con escalas agrupadas (aprox. 4,5 bit/peso) y los tensores de normalizacion se mantienen en F32. En Q4_K_M la cuantizacion es mixta, con algunos tensores en Q6_K/F32. La reordenacion conserva los bytes de la cuantizacion, pero la fusion de calculo puede alterar el orden de reduccion en coma flotante. El autor documenta los cambios en MODEL_CHANGES.md, provenance.json y manifest.json, y no afirma que la cuantizacion sea sin perdidas.

## Capacidades

- Traduccion automatica multilingue: el pipeline declarado es translation y la familia base cubre 33 idiomas.
- Seguimiento de instrucciones de traduccion en varios idiomas, orientado a escenarios reales complejos segun la descripcion de la familia Hy-MT2.
- Traduccion por lotes en local: entrada en JSONL UTF-8 con campos `text`, `target_lang` e `id` opcional, conservando el orden de entrada en la salida.
- Servicio local con API compatible con OpenAI en `http://127.0.0.1:18080`, con nombre de modelo `hy-mt2` (arranque con start-server.cmd, parada con stop-server.cmd).
- Ejecucion offline tras la descarga y verificacion de los pesos con SHA-256, con soporte de reanudacion de descarga.
- Concurrencia configurable: hasta 256 en modo fichero y hasta 128 en modo API, estimada automaticamente a partir de la VRAM disponible; 1024 tokens de contexto por peticion por defecto.
- Modo conversacional declarado en las etiquetas del repositorio (conversational) y compatibilidad con endpoints (endpoints_compatible).
- No se documentan en la informacion disponible capacidades de vision, audio, tool calling, function calling ni modos de razonamiento explicito.

## Casos de uso

- Traduccion por lotes de documentacion tecnica en Windows: el flujo JSONL con `text` y `target_lang` permite procesar ficheros completos en local, con salida en el mismo orden y verificacion de integridad por SHA-256, sin enviar contenido a servicios externos.
- Localizacion de catalogos de producto o e-commerce: la ventana de 1024 tokens por peticion y la concurrencia automatica (hasta 256 en modo fichero) permiten traducir miles de fichas cortas en una sola GPU de gama alta.
- Integracion en un CMS o pipeline interno mediante la API compatible con OpenAI expuesta en localhost, sustituyendo al proveedor remoto en herramientas que ya hablan el formato OpenAI.
- Traduccion de correspondencia y tickets de soporte con datos sensibles: al ejecutarse totalmente offline una vez descargados los pesos, no hay salida de datos a terceros, lo que encaja en entornos con requisitos de confidencialidad.
- Prototipado y evaluacion de calidad de traduccion en investigacion: permite comparar NVFP4 frente a Q4_K_M sobre el mismo material (el propio autor advierte que la velocidad de NVFP4 no implica mejor calidad) antes de fijar una configuracion.
- Despliegue en estaciones de trabajo con GPU consumer: los 1,01-1,13 GB de pesos mas la cache KV (unos 64 MiB por cada 1024 tokens de contexto y peticion en FP16) permiten funcionar en GPUs desde 4 GB de VRAM, empezando con concurrencia baja.
- Traduccion asistida en entornos sin conectividad: el paquete de runtime incluye Python y las librerias CUDA/MSVC, y tras `setup-model.cmd` la inferencia es completamente offline.
- Generacion de subtitulos o transcripciones traducidas fuera de linea: con contexto de 1024 tokens por segmento y procesamiento por lotes se puede traducir una pista de subtitulos segmento a segmento manteniendo el orden.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, COMET, BLEU u otros) en la informacion disponible. El autor indica expresamente que no aporta puntuaciones COMET/BLEU medidas. El unico dato de rendimiento disponible es de throughput, medido en una RTX 5090 de 32 GB con Windows 11 sobre 512 traducciones, con 256 de concurrencia, 1024 tokens de contexto por peticion, batch/ubatch 2048, tres ejecuciones por lado y mediana:

| Configuracion | Cuantizacion / interfaz | Completion tokens/s | Tiempo de pared (512 segmentos) |
|---|---|---|---|
| llama.cpp oficial b11029 | Q4_K_M de Tencent / HTTP | 721,73 | 46,394 s |
| Hy-MT2-Windows (este proyecto) | NVFP4 / programa de lote nativo | 5386,26 | 6,185 s |

El autor cifra la mejora global en 7,46 veces y advierte que es el resultado conjunto de la cuantizacion, el codigo de inferencia, la planificacion, la interfaz y la compilacion, no un multiplicador de un unico kernel CUDA. Las seis ejecuciones completaron las 512 traducciones sin errores, truncamientos ni salidas vacias; el material era un conjunto fijo de 64 traducciones repetido 8 veces y se desactivo la cache de prompt entre peticiones. No es una garantia para otras GPUs, otras longitudes de texto ni el propio servicio HTTP del proyecto.

## Requisitos de hardware

- VRAM de pesos: aproximadamente 1,01 GB (NVFP4) y 1,13 GB (Q4_K_M), mas espacio de trabajo.
- Cache KV: en FP16, alrededor de 64 MiB por cada 1024 tokens de contexto y por peticion; la concurrencia debe bajarse si se amplia el contexto.
- GPU recomendadas por fichero: NVFP4 para RTX 50 (compute capability 12.0); Q4_K_M para GTX 16 y RTX 20/30/40, y tambien utilizable en RTX 50.
- Arquitecturas compiladas: sm_75, sm_80, sm_86, sm_89 y sm_120a, sin PTX, por lo que no se puede extrapolar a arquitecturas no listadas.
- GPU consumer: si, cabe en GPUs desde 4 GB de VRAM con concurrencia baja; el autor recomienda empezar con valores reducidos en esas tarjetas.
- Verificacion real: solo la RTX 5090 ha sido probada en hardware; el resto de modelos son cobertura de compilacion, no una promesa de velocidad o consumo medidos.
- Sistema y drivers: Windows x64 con driver NVIDIA 580.88 o superior.
- Opciones de despliegue: unicamente el runtime HyMT-Windows-NVIDIA-runtime.zip (unos 515 MB, con Python y las librerias CUDA/MSVC incluidas) y el llama.cpp modificado del proyecto; no se contemplan vLLM, TGI, Ollama, LM Studio ni SGLang.
- Latencia y throughput: 5386,26 completion tokens/s y 6,185 s para 512 segmentos con NVFP4 en RTX 5090, en las condiciones descritas arriba; no hay mediciones para otras GPU ni para el servicio HTTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| divingclone/Hy-MT2-1.8B NVFP4/Q4_K_M GGUF (este) | 1,8B | No disponible (1024 tokens por peticion en el runtime) | 5386,26 tokens/s en RTX 5090, material fijo de 512 segmentos | Apache-2.0 | GGUF fused, solo con runtime Hy-MT2-Windows |
| tencent/Hy-MT2-1.8B (base) | 1,8B | No disponible | No disponible | Apache-2.0 | Pesos del modelo original |
| GGUF oficial Q4_K_M de Tencent | 1,8B | No disponible | 721,73 tokens/s en la misma prueba | Apache-2.0 | GGUF estandar |
| Hy-MT2-7B y Hy-MT2-30B-A3B (misma familia) | 7B y 30B-A3B (MoE) | No disponible | No disponible | Apache-2.0 (segun el modelo base) | No disponible en esta informacion |

No se dispone de datos de benchmarks de calidad que permitan comparar este quantizado con alternativas de traduccion de otros fabricantes; cualquier comparacion de ese tipo seria especulativa.

## Limitaciones y advertencias

- La cuantizacion puede alterar el valor numerico, la logica y los detalles de la traduccion; el autor recomienda revisar manualmente las traducciones importantes, en especial numeros, negaciones y terminologia especializada.
- No hay puntuaciones COMET/BLEU medidas ni ninguna otra evaluacion de calidad publicada: la mejora reportada es de velocidad, no de calidad.
- La velocidad superior de NVFP4 no implica mejor calidad que Q4_K_M, y el autor no garantiza que ambas cuantizaciones produzcan salidas equivalentes.
- Los ficheros son GGUF "fused" con tensores reordenados: no se puede asumir compatibilidad con llama.cpp estandar, Ollama, LM Studio, vLLM ni SGLang; usarlos con otro runtime puede fallar.
- Dependencia de un runtime de comunidad especifico para Windows x64 y driver NVIDIA 580.88 o superior; no hay soporte documentado para Linux, macOS ni CPU unicamente.
- Solo la RTX 5090 esta verificada en hardware real; el resto de arquitecturas tienen cobertura de compilacion pero no mediciones de velocidad o VRAM.
- Sin PTX en los binarios: no se puede extrapolar a arquitecturas de GPU no listadas (sm_75/80/86/89/120a).
- La reordenacion conserva los bytes cuantizados, pero la fusion de calculo puede cambiar el orden de reduccion en coma flotante; no se declara que la cuantizacion sea sin perdidas.
- Repositorio con 0 descargas y 0 likes: no existe validacion externa ni evidencia de la comunidad sobre su correcto funcionamiento.
- Es un trabajo comunitario que no representa una publicacion ni un respaldo oficial de Tencent.
- El autor no documenta sesgos conocidos, comportamiento frente a contenido sensible ni limites idiomaticos concretos mas alla de mantener el rango de idiomas del modelo original.
- Los datos de rendimiento proceden de una carga fija (64 traducciones repetidas 8 veces) con cache de prompt desactivada; no son extrapolables a otros textos, GPUs o longitudes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/divingclone/Hy-MT2-1.8B-NVFP4-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/tencent/Hy-MT2-1.8B
- Proyecto Hy-MT2-Windows (codigo, parches y runtime): https://github.com/divingclone/Hy-MT2-Windows
- Ultima release del runtime Windows: https://github.com/divingclone/Hy-MT2-Windows/releases/latest
- Guia de instalacion y configuracion de VRAM: https://github.com/divingclone/Hy-MT2-Windows/blob/main/docs/USAGE.md
- Informe de rendimiento y evidencia completa: https://github.com/divingclone/Hy-MT2-Windows/blob/main/docs/PERFORMANCE.md
- Cambios respecto al modelo original: MODEL_CHANGES.md (en el repositorio de HuggingFace)
- Registro de procedencia verificable: provenance.json (en el repositorio de HuggingFace)
- Manifiesto SHA-256 de los ficheros: manifest.json (en el repositorio de HuggingFace)
- Familia Hy-MT2 de Tencent (1.8B, 7B, 30B-A3B, 33 idiomas): https://github.com/Tencent-Hunyuan/Hy-MT2
