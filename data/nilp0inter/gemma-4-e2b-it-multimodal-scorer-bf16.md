# nilp0inter/Gemma-4-E2B-it-Multimodal-Scorer-BF16

## Resumen

Gemma-4-E2B-it-Multimodal-Scorer-BF16 es un artefacto experimental publicado por el usuario nilp0inter que reempaqueta el modelo multimodal google/gemma-4-E2B-it como un clasificador de opciones cerradas. No es un modelo conversacional ni generativo: expone un readout externo que asigna una probabilidad a cada una de las opciones suministradas (entre 2 y 26), mediante una unica pasada forward sobre el ultimo token y un softmax restringido. El autor lo describe explicitamente como "option-scoring baseline, not the original chat packaging".

El modelo conserva las torres nativas de imagen, audio y video del backbone original y anade 255 filas del LM-head original (las correspondientes a letras de opcion) exportadas como readout externo de forma [255, 1536], en BF16 nativo y sin cuantizacion. El checkpoint serializado ocupa 9,508 GiB y el total de parametros reportado por safetensors es de 5.104.297.504, coherente con la nomenclatura E2B del modelo base (parametros efectivos en torno a 2B sobre un total mayor).

Su relevancia es acotada y muy especifica: sirve como linea base reproducible para evaluar scoring multimodal de opcion multiple, comparar deriva de cuantizacion (existe una variante NF4 hermana) y estudiar calibracion de readouts. No sustituye a un modelo de chat ni a un pipeline estandar de Transformers: requiere el script classifier.py incluido y no declara soporte para generacion, thinking, entrenamiento ni calibracion por benchmark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone google/gemma-4-E2B-it) con torres nativas de imagen, audio y video, mas readout externo de opciones de forma [255, 1536] |
| Parametros totales | 5.104.297.504 (segun safetensors) |
| Parametros activos | no aplica / no confirmado como MoE; la nomenclatura E2B del modelo base alude a parametros efectivos (fuentes externas citan ~2,1B, no confirmado en la model card) |
| Longitud de contexto | 8192 tokens (las entradas que lo superan fallan, sin truncacion) |
| Tipos de cuantizacion | BF16 nativa, sin cuantizacion en este artefacto; existe una variante hermana NF4 |
| Idiomas soportados | no disponible |
| Licencia | pesos Apache-2.0 (LICENSE.weights, NOTICE.weights); codigo runtime/prompt MIT (LICENSE.code) |
| Formato de pesos | safetensors (BF16) |

Datos adicionales: hidden size de lenguaje 1536. Tamano de repo 10,2 GB. Archivos serializados de modelo/readout 9,508 GiB. Pico de memoria CUDA observado: 9,905 GiB asignada y 10,184 GiB reservada. Numero de opciones admitidas: 2 a 26. Limite de audio: 30 segundos. Video: ocho fotogramas RGB muestreados uniformemente, sin pista de audio. Fecha de creacion 2026-10-03; actualizacion 2026-10-03.

## Arquitectura y entrenamiento

El artefacto parte del backbone multimodal google/gemma-4-E2B-it (pin google/gemma-4-E2B-it@3e22461f65e89153144f8adb70e3b8c2cc9845a7) e incorpora un readout externo construido a partir de las 255 filas del LM-head original correspondientes a letras de opcion. Estas filas se exportan en BF16 con softcap elemental nativo de 30 y temperatura 1. Segun el autor, tres casos visuales reales coincidieron con los logits de generacion condicional del modelo original con diferencia de probabilidad cero, lo que respalda la fidelidad del readout para esas rutas.

El scoring usa el prompt de decision "Jeff" bajo licencia upstream, una unica pasada forward sobre el token final y un softmax restringido a las opciones suministradas. Quedan deshabilitados el modo thinking, la generacion, el entrenamiento y cualquier calibracion especifica de benchmark. La model card indica explicitamente que el baseline publicado "no esta ajustado con Jeff" (se refiere al backbone original), mientras que los pins de origen incluyen mstrasser/Jeff-Gemma4-E2B@e3de3e99a979f92afd995d4e526c7e3170ae49cf y firelex/jeff@d0173b4ee317a46dee031421b713f3fc5f868cfe. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO sobre este artefacto concreto.

## Capacidades

- Scoring de opciones multiples: puntua entre 2 y 26 opciones y devuelve un choice_index (base cero) mas una probabilidad por opcion.
- Entrada de texto: preguntas con opciones y sin medio adjunto.
- Entrada de imagen: rutas en images:[path, ...].
- Entrada de audio: ruta unica en audio:path, con remuestreo automatico a mono 16 kHz.
- Entrada de video: ruta unica en video:path, con ocho fotogramas RGB uniformes, fps y timestamps originales.
- Coincidencia con la ruta de generacion condicional del modelo original verificada en tres casos visuales reales segun el autor.
- NO soporta: chat, generacion de texto libre, tool calling, function calling, agentes, razonamiento multi-paso, modo thinking, entrenamiento ni calibracion por benchmark.
- NO esta pensado para combinar modalidades de forma simultanea (la model card pide validar por separado cualquier uso combinado).

## Casos de uso

- Evaluacion de benchmarks multimodales de opcion multiple: sirve como linea base reproducible para obtener accuracy sobre subconjuntos tipo MMMU, AI2D o MMBench con un protocolo de scoring fijo (prompt unico, una pasada forward, softmax restringido).
- Comparacion de deriva por cuantizacion: al existir una variante NF4 hermana, permite medir cuanta accuracy se pierde al pasar de BF16 a 4 bits sobre los mismos conjuntos controlados.
- Investigacion en calibracion de readouts: el artefacto aisla el LM-head como modulo externo, lo que facilita estudiar el efecto del softcap, la temperatura y el numero de opciones sobre las probabilidades emitidas.
- Clasificacion de imagen mediante opciones cerradas: dado un prompt visual y un conjunto fijo de etiquetas, el modelo puntua cada clase sin necesidad de generar texto, util en etiquetado asistido con vocabulario controlado.
- Identificacion forzada de habla (identificacion de transcripcion entre distractores fijos): el protocolo de cuatro vias sobre LibriSpeech test-clean muestra que el scoring puntua correctamente transcripciones candidatas, aprovechable en validacion de hipotesis de ASR.
- Clasificacion de video en clases fijas: con ocho fotogramas muestreados uniformemente permite puntuar opciones de accion sobre clips cortos (el benchmark ucf101-10-video reporta 86,00% en diez clases).
- Banca de pruebas de robustez multimodal: los controles de eliminacion de medio (media-removal) permiten cuantificar cuanta senal aporta realmente imagen, audio o video frente a una linea base solo texto.

## Benchmarks y rendimiento

Los resultados proceden de subconjuntos adaptados de eleccion forzada de una sola pasada, no de puntuaciones generativas oficiales de leaderboard.

| Benchmark | N | Accuracy | Intervalo bootstrap 95% |
|---|---:|---:|---:|
| AI2D | 1000 | 57,50% | [54,40%, 60,50%] |
| MMBench | 1000 | 68,80% | [65,90%, 71,70%] |
| MMMU | 847 | 38,49% | [35,30%, 41,79%] |
| esc10-audio | 200 | 11,50% | [7,00%, 16,00%] |
| librispeech-speech | 100 | 100,00% | [100,00%, 100,00%] |
| ucf101-10-video | 200 | 86,00% | [81,00%, 90,50%] |

Notas de protocolo aportadas por el autor: MMMU usa 847 MCQ elegibles de validacion; AI2D usa 1000 preguntas de test con semilla; MMBench usa 1000 preguntas de English-dev tras eliminar duplicados circulares exactos (no el protocolo circular oficial); ESC-10 usa 200 clips balanceados; LibriSpeech usa 100 enunciados test-clean para identificacion de transcripcion en cuatro vias con tres distractores fijos (no WER de ASR); UCF101 usa 200 videos held-out de split1 sobre diez clases fijas (no las 101). La clasificacion de sonido ambiental es debil. No se han publicado comparaciones oficiales con el modelo base en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: la propia model card reporta un pico de memoria CUDA de 9,905 GiB asignada y 10,184 GiB reservada en BF16, con archivos serializados de 9,508 GiB. Como minimo practico, se necesita una GPU con al menos 12 GB libres para BF16.
- GPU recomendadas: RTX 3090 (probada por el autor, 24 GB). Cualquier GPU con 16 GB o mas (RTX 4080/4090, A4000, L4, A100, H100) es apta por capacidad de memoria, aunque la model card solo confirma pruebas en RTX 3090.
- Consumer GPU: si cabe en GPUs de 16-24 GB. La model card advierte explicitamente que las mediciones no establecen compatibilidad con GPUs de 4 GiB ni con arquitecturas Maxwell.
- CPU: la model card indica que no se reclama ninguna ruta de CPU-only ni de CPU-offload. No hay soporte declarado.
- Opciones de despliegue: exclusivamente el script classifier.py incluido, ejecutado dentro del repositorio descargado (Python 3.12.14 y versiones exactas de requirements.txt). No es un pipeline generico de Transformers; no hay soporte declarado para vLLM, llama.cpp, Ollama, TGI ni GGUF.
- Latencia y throughput: no disponibles (la model card remite a las tablas de latencia y memoria del dataset de benchmarks asociado).
- Variante de menor huella: la version NF4 hermana reduce el uso de memoria para quien no necesite BF16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nilp0inter/Gemma-4-E2B-it-Multimodal-Scorer-BF16 | 5.104.297.504 (safetensors) | 8192 tokens | Scorer de opciones (BF16) | Apache-2.0 (pesos) + MIT (codigo) | HuggingFace, requiere classifier.py |
| nilp0inter/Gemma-4-E2B-it-Multimodal-Scorer-NF4 | no disponible | no disponible | Scorer de opciones (NF4) | no disponible en la informacion | HuggingFace |
| google/gemma-4-E2B-it (base) | no disponible | no disponible | Modelo multimodal conversacional | no disponible en la informacion | HuggingFace |
| mstrasser/Jeff-Gemma4-E2B | no disponible | no disponible | Fine-tune de referencia (Jeff) | no disponible en la informacion | HuggingFace |

No se dispone de modelos comparables adicionales de scoring multimodal de opciones multiples en la informacion proporcionada; los datos de rendimiento comparativos frente al modelo base no estan publicados.

## Limitaciones y advertencias

- No es un modelo de chat ni de generacion: no produce texto libre, no soporta tool calling ni agentes, y usarlo como pipeline generico produce resultados invalidos.
- Requiere obligatoriamente el classifier.py y las versiones exactas de requirements.txt; no funciona como pipeline estandar de Transformers ni como GGUF.
- Las entradas que superan los 8192 tokens fallan sin truncacion, lo que obliga a controlar la longitud del prompt y de las opciones.
- El audio esta limitado a 30 segundos; el video se reduce a ocho fotogramas RGB y descarta la pista de audio.
- No se debe inferir razonamiento visual sin restricciones ni calidad de transcripcion de habla a partir de las cifras de scoring; el autor lo advierte explicitamente.
- La clasificacion de sonido ambiental es debil (11,50% en ESC-10), muy por debajo de un uso productivo.
- Los benchmarks son subconjuntos adaptados de eleccion forzada de una sola pasada; no son puntuaciones oficiales de leaderboard ni comparables directamente con resultados generativos.
- El primer centenar de controles de eliminacion de medio en MMMU no muestra un beneficio visual claro del modelo original, lo que cuestiona el uso de imagen en ciertos casos.
- Las mediciones de memoria no garantizan compatibilidad con GPUs de 4 GiB ni con Maxwell u otras arquitecturas.
- No hay datos declarados de sesgos, idiomas soportados ni evaluacion de alucinacion; al ser un scorer de opciones, el riesgo se traslada a la seleccion de opciones, no a texto inventado.
- Licencia de pesos Apache-2.0 y de codigo runtime/prompt MIT, con avisos de copyright del prompt upstream preservados; los medios y textos de benchmark originales no se redistribuyen, por lo que su uso queda sujeto a las licencias de origen.
- Modelo experimental con 61 descargas y 0 likes en el momento de la ficha; madurez y soporte limitados.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/nilp0inter/Gemma-4-E2B-it-Multimodal-Scorer-BF16
- Variante NF4 hermana: https://huggingface.co/nilp0inter/Gemma-4-E2B-it-Multimodal-Scorer-NF4
- Dataset de benchmarks, predicciones y codigo de reproduccion: https://huggingface.co/datasets/nilp0inter/Jeff-Gemma4-E2B-Multimodal-Benchmarks
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Variante pre-entrenada del base: https://huggingface.co/google/gemma-4-E2B
- Model card de Gemma 4 (Google AI for Developers): https://ai.google.dev/gemma/docs/core/model_card_4
- Ficha de Gemma-4-E2B-it en Qualcomm AI Hub: https://aihub.qualcomm.com/models/gemma_4_e2b_it
- Pagina de referencia de Gemma 4 E2B: https://gemma4.dev/models/gemma-4-e2b
