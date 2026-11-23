# kingjones777/Ornith-1.5-35B-A3B-ROCmFP4-COHERENT-GGUF

## Resumen

Ornith-1.5-35B-A3B-ROCmFP4-COHERENT-GGUF es una cuantizacion de 4 bits del modelo multimodal `ornith-ai/Ornith-1.5-35B-A3B`, publicada por el usuario `kingjones777`. Se trata de un artefacto GGUF de tipo `Q4_0_ROCMFP4_COHERENT` (ftype 102) construido especificamente para hardware AMD Strix Halo (gfx1151), en concreto el Ryzen AI MAX+ 395 con 128 GB de memoria unificada y ROCm 7.2.4. El modelo base es un Mixture-of-Experts de 35.505.251.456 parametros totales con aproximadamente 3.000 millones de parametros activos por token y 256 expertos, segun los datos de la model card.

La relevancia de esta publicacion es doble. Por un lado, aplica tipos tensoriales FP4/FP8 nativos de AMD (ausentes en llama.cpp mainline) mediante el fork ROCmFPX, lo que permite reducir el modelo a 18,93 GiB con 4,58 bits por peso manteniendo proteccion de las cabezas de embedding y salida en q6_K. Por otro, incluye la cabeza de decodificacion especulativa MTP dentro de los pesos base (`qwen35moe.nextn_predict_layers = 1`), lo que permite activar speculative decoding sin cargar un modelo borrador separado.

El autor documenta mediciones reales sobre el hardware objetivo: 60,34 t/s de decodificacion (mediana de 5 ejecuciones), 1.790-1.863 t/s de procesamiento de prompt y verificacion de correccion en texto y vision. El repositorio tambien advierte explicitamente de que la decodificacion especulativa MTP resulto ser una perdida neta de rendimiento (0,89-0,94x) en todas las variantes probadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con 256 expertos, cabeza MTP integrada (`nextn_predict_layers = 1`) |
| Parametros totales | 35.505.251.456 |
| Parametros activos | Aproximadamente 3.000 millones (segun la model card) |
| Longitud de contexto | 131.072 tokens (contexto cargado y verificado en la medicion de Super Roc); el modelo base se ejecuta a `-c 4096` en las pruebas de correccion |
| Tipos de cuantizacion | `Q4_0_ROCMFP4_COHERENT` (ftype 102, 4,58 BPW); el repositorio referencia tambien ftypes 106, 111, 114 y 115 en la comparativa de cabezas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (mas `mmproj` GGUF separado para vision) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 256 expertos y enrutamiento disperso que activa aproximadamente 3.000 millones de parametros por token sobre un total de 35.505 millones. La model card identifica el prefijo de configuracion `qwen35moe`, lo que sugiere una arquitectura derivada de la familia Qwen 3.5 MoE. Incorpora una cabeza de prediccion multi-token (MTP) con una capa (`blk.40.nextn.*`), lo que habilita decodificacion especulativa autocontenida. `tie_word_embeddings` es `false`, de modo que `output.weight` es un tensor independiente y puede cuantizarse a distinta precision que el resto de la matriz.

La cuantizacion se realizo a partir del GGUF BF16 oficial de Ornith (`Ornith-1.5-35B-BF16.gguf`, 71.066.994.240 bytes, sha256 `a3ee48dd...7591`), verificado byte a byte contra el Hub, sin reconversion desde safetensors. El proyector de vision (`mmproj-Ornith-1.5-35B-BF16.gguf`, 902.822.016 bytes) se incluye en el repositorio. La innovacion tecnica principal es el uso de tipos tensoriales FP4/FP8 nativos de AMD a traves del fork ROCmFPX de llama.cpp, que no existen en la version mainline. Las cabezas `token_embd.weight` y `output.weight` se mantienen en q6_K, y el autor verifica este extremo releyendo las cabeceras de los ficheros con dos parsers independientes. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens vistos ni el proceso de alineacion (RLHF/DPO) del modelo base.

## Capacidades

- Generacion de texto conversacional multi-turno, con soporte de modo de razonamiento (`reasoning_content` y `enable_thinking` por peticion via `chat_template_kwargs`).
- Razonamiento aritmetico basico y factual verificable: el autor comprueba 17x23 = 391, capital de Japon = Tokio y dias de 2024 = 366.
- Capacidades multimodales de imagen a texto mediante el proyector `mmproj`, verificadas con una imagen de cuatro cuadrantes de color (4/4 aciertos).
- Tool calling / function calling: medido en 7/8 en modo requerido y 7/8 en modo automatico con el motor Super Roc.
- Generacion de codigo: medida a 70,2 t/s de media en dos prompts de codigo.
- Decodificacion especulativa MTP integrada, activable con `--spec-type draft-mtp --spec-draft-ngl 999` sin modelo borrador externo.
- Soporte de contexto largo: 131.072 tokens cargados y prompt caching funcional (6.962 de 6.986 tokens en cache en el segundo turno).
- Idiomas: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en estacion de trabajo AMD Strix Halo: el modelo cabe en los 128 GB de memoria unificada del Ryzen AI MAX+ 395 con 18,93 GiB de pesos y deja margen para cache KV de contexto largo, lo que permite ejecutar un asistente privado sin GPU dedicada.
- Analisis de imagenes con descripcion textual: el `mmproj` incluido permite pasar imagenes junto al prompt para tareas de captioning, extraccion de informacion visual o transcripcion de diagramas, verificado con imagenes de cuatro cuadrantes.
- Agentes con tool calling en local: la puntuacion de 7/8 en llamadas a funciones en ambos modos lo hace util para orquestacion de herramientas en entornos sin conectividad, aunque conviene validar el esquema de herramientas por caso.
- Generacion de codigo en pipelines de desarrollo: a 70,2 t/s en prompts de codigo y con contexto de 131k tokens, es viable para autocompletado, refactorizacion y revision de parches en un IDE local.
- Procesamiento de documentos largos: el contexto de 131.072 tokens y el prompt caching (6.962 tokens cacheados de 6.986) permiten mantener conversaciones sobre contratos, informes o bases de codigo extensas con coste de prefill reducido en turnos sucesivos.
- Despliegue de bajo consumo en hardware de escritorio AMD: la huella de 18,93 GiB y el rendimiento de 60,34 t/s permiten servir un modelo de 35B en una unica maquina consumer de gama alta sin GPU NVIDIA.
- Experimentacion con decodificacion especulativa: la cabeza MTP integrada sirve para estudiar el equilibrio entre tasa de aceptacion y throughput en hardware AMD, aunque en este caso concreto el autor mide una perdida neta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos de rendimiento son mediciones de inferencia del autor sobre AMD Ryzen AI MAX+ 395 (Strix Halo, gfx1151), 128 GB unificados, ROCm 7.2.4, con 2 calentamientos descartados y mediana de 5 ejecuciones sobre 300 tokens.

| Metrica | Valor |
|---|---|
| Decodificacion (mediana de 5) | 60,34 t/s |
| Decodificacion con MTP (mejor n-max = 3) | 56,05 t/s (0,93x) |
| Rango de MTP en todas las variantes | 0,89x - 0,94x (perdida neta) |
| Prompt tok/s (p1k, Super Roc) | 1.790,3 |
| Prompt tok/s (p8k, Super Roc) | 1.863,5 |
| Generacion tok/s (p1k, Super Roc) | 70,1 |
| Generacion tok/s (p8k, Super Roc) | 64,15 |
| Generacion de codigo tok/s | 70,2 (media de 2 prompts) |
| Tool calls (requerido / automatico) | 7/8 / 7/8 |
| Tiempo de carga | 21 s |
| Ancho de banda efectivo estimado | ~104 GB/s (calculado sobre ~1,72 GB de pesos activos) |

## Requisitos de hardware

- VRAM/memoria unificada: 18,93 GiB para los pesos en ftype 102, mas el `mmproj` de 902.822.016 bytes y la cache KV para el contexto deseado. El autor ejecuta con `-c 4096` para pruebas y con 131.072 tokens de contexto en Super Roc sobre 128 GB unificados.
- GPU recomendadas: AMD Ryzen AI MAX+ 395 (Strix Halo, gfx1151) es el objetivo declarado y el unico hardware con mediciones publicadas. No hay datos para A100, H100 ni RTX 4090.
- Compatibilidad consumer: requiere un build de llama.cpp con soporte ROCmFPX; los tipos `Q4_0_ROCMFP4_*` y `Q*_0_ROCMFPX*` no existen en mainline, por lo que el fichero no carga en llama.cpp estandar, Ollama ni LM Studio.
- Opciones de despliegue: fork ROCmFPX de llama.cpp y el motor Super Roc 0.20.0 (comando documentado con `--host 127.0.0.1 --port 8080`, `--context 131072`, `-t 0`, `--presence-penalty 0`, `--think off`). No compatible con vLLM ni TGI en el formato actual.
- Latencia y throughput: 60,34 t/s de decodificacion y 1.790-1.863 t/s de prefill medidos en el hardware objetivo, con una sola peticion simultanea.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-ROCmFP4-COHERENT (este) | 35,5B | ~3B | 131.072 | Q4_0_ROCMFP4_COHERENT, 18,93 GiB, 4,58 BPW | Apache 2.0 | Cabezas en q6_K verificadas; 60,34 t/s; MTP integrado |
| julianmb/Ornith-1.5-35B-A3B-ROCmFP4-GGUF | 35,5B | ~3B | no disponible | ROCmFP4 ftype 106 | Apache 2.0 (heredada) | Segun este autor, usa Q5_K en embeddings y salida en 4 bits pese a declarar preservacion FP16 |
| mudler/Ornith-1.5-35B-A3B-APEX-MTP-GGUF | 35,5B | ~3B | no disponible | GGUF con MTP | Apache 2.0 (heredada) | Mismos 753 tensores que el base; no debe usarse como borrador (cargaria un segundo modelo de 35B) |
| ornith-ai/Ornith-1.5-35B-A3B (BF16 original) | 35,5B | ~3B | no disponible | BF16, 71,07 GB | Apache 2.0 | Fuente de la cuantizacion; requiere ~71 GB de memoria |

## Limitaciones y advertencias

- Requiere un build de llama.cpp con soporte ROCmFPX; no funciona en llama.cpp mainline, Ollama ni LM Studio. Cualquier pipeline que asuma GGUF estandar fallara al cargar.
- La decodificacion especulativa MTP medida supone una perdida neta de rendimiento (0,89-0,94x) en todas las variantes probadas; no debe asumirse como mejora.
- No se debe usar `mudler/Ornith-1.5-35B-A3B-APEX-MTP-GGUF` como modelo borrador: son los mismos 753 tensores con 32 bytes de metadatos extra, por lo que se cargaria un segundo modelo completo de 35B.
- Las mediciones provienen de un unico equipo (Ryzen AI MAX+ 395, ROCm 7.2.4) y de una sola peticion concurrente; el rendimiento en otros entornos AMD o con carga concurrente no esta documentado.
- El rendimiento de tool calling es 7/8 en ambos modos, no perfecto; conviene validar los esquemas concretos antes de usarlo en produccion.
- No hay informacion publicada sobre sesgos, tasa de alucinacion, composicion del dataset de entrenamiento ni idiomas soportados del modelo base.
- El autor advierte de que la proteccion de cabezas no se deduce del nombre del ftype: debe solicitarse y verificarse leyendo la cabecera del fichero.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo base y sus derivados deben cumplir tambien las condiciones del repositorio `ornith-ai/Ornith-1.5-35B-A3B`.
- El calculo de ancho de banda debe hacerse sobre los ~1,72 GB de pesos activos, no sobre los 20,3 GB del fichero; asumir lo contrario lleva a estimaciones de rendimiento erroneas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kingjones777/Ornith-1.5-35B-A3B-ROCmFP4-COHERENT-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- GGUF base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-GGUF
- Fork ROCmFPX de llama.cpp: https://github.com/charlie12345/ROCmFPX
- Motor Super Roc: https://github.com/kingjones30/superroc
- Cuantizacion alternativa ROCmFP4: https://huggingface.co/julianmb/Ornith-1.5-35B-A3B-ROCmFP4-GGUF
- Variante APEX-MTP: https://huggingface.co/mudler/Ornith-1.5-35B-A3B-APEX-MTP-GGUF
