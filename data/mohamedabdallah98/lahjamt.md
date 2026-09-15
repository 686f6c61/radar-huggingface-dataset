# MohamedAbdallah98/LahjaMT

## Resumen

LahjaMT es un sistema de traduccion automatica de ingles a arabe dialectal centrado en dialogo conversacional, publicado por el autor MohamedAbdallah98 como adaptadores LoRA sobre el modelo UBC-NLP/NileChat-3B-Base (una continuacion de Qwen2.5-3B de 3.000 millones de parametros). El problema que aborda es la traduccion hacia trece variedades nacionales de arabe (EG, JO, LB, LY, MA, MR, OM, PS, SA, SD, SY, TN, YE), un escenario en el que los modelos multilingues genericos suelen colapsar hacia el arabe estandar moderno y pierden los rasgos marcados de cada dialecto. Frente a soluciones con un unico modelo por variedad, LahjaMT comparte una sola columna vertebral congelada y enruta cada dialecto a una pareja experta formada por un checkpoint LoRA y una configuracion de prompt concreta.

Tecnicamente se trata de PEFT: cada adaptador es un LoRA con r=16, alpha=32, dropout 0,05 aplicado a las siete proyecciones de todos los bloques Transformer, lo que supone unos 29,9 millones de parametros adicionales (aproximadamente 114 MB) por adaptador. El repositorio aloja el adaptador padre de la etapa 1, seis checkpoints de la etapa 2, dos especialistas para libio y sudanes, la tabla de enrutado (`routing.json`), la plantilla de prompt y un script de inferencia minimo. El sistema incorpora contexto de dialogo e incluso metadatos de persona o rol del participante en una de sus configuraciones de prompt.

Su relevancia actual viene avalada por los resultados en la tarea compartida AlexandriaX-2026: segundo puesto en la modalidad restringida con 28,30 spBLEU y 43,81 chrF++ (media macro sobre los trece dialectos) y tercer puesto en la modalidad no restringida con 28,54 spBLEU y 44,02 chrF++. El repositorio es de investigacion, con licencia qwen-research heredada del modelo base, y no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-3B) con adaptadores LoRA sobre las siete proyecciones de cada bloque |
| Parametros totales | 3B en el modelo base (NileChat-3B-Base); no disponible el recuento exacto publicado |
| Parametros activos | No aplica (no es MoE). Cada adaptador LoRA anade ~29,9M de parametros |
| Longitud de contexto | No disponible en la informacion; el entrenamiento uso max_len de 2.048 tokens |
| Tipos de cuantizacion | No disponible (los adaptadores se publican en BF16; no se distribuyen pesos cuantizados) |
| Idiomas soportados | Ingles (origen) y arabe dialectal (destino): EG, JO, LB, LY, MA, MR, OM, PS, SA, SD, SY, TN, YE |
| Licencia | other / qwen-research (heredada de Qwen2.5-3B) |
| Formato de pesos | safetensors (adaptadores PEFT), mas `tokenizer.json`, configuracion compartida y `routing.json` |
| Libreria | peft |
| Tamano del repositorio | 1,1 GB |
| Pipeline | translation |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 3B de parametros (Qwen2.5-3B, continuado por UBC-NLP como NileChat-3B-Base) que permanece congelado durante todo el entrenamiento. Sobre el se aplican adaptadores LoRA de rango 16, alpha 32 y dropout 0,05 en las siete modulos de proyeccion de cada bloque Transformer. Cada adaptador ocupa aproximadamente 114 MB en BF16. El entrenamiento se realizo en una unica NVIDIA RTX 5090 en precision BF16.

El proceso tiene dos etapas y una fase de especializacion. La etapa 1 parte del backbone congelado y entrena sobre 66.480 turnos durante 3 epocas, con learning rate 2e-4, scheduler coseno, warm-up 0,03, weight decay 0,01, batch efectivo 8 y longitud maxima de 2.048 tokens. La etapa 2 continua desde el adaptador padre de la etapa 1 sobre 20.920 turnos (particion de desarrollo mas el 60% del test publico), 3 epocas y learning rate 2e-5, reteniendo seis checkpoints (`stage2_step1600` a `stage2_step7600`). Los especialistas no restringidos para libio y sudanes se entrenan con pares SMOL `ayl`/`apd` mas turnos reproducidos del dominio, 2 epocas y learning rate 5e-6.

La innovacion principal es el enrutado ligero: en lugar de un modelo por dialecto, una etiqueta determinista de variedad selecciona una pareja (checkpoint, prompt) de una tabla fija. Se definen tres configuraciones de prompt: P1 usa dos demostraciones deterministas del mismo pais y dominio, alineadas con el formato de ajuste; P2 usa dos demostraciones recuperadas semanticamente con all-MiniLM-L6-v2 sobre la fuente en ingles; P3 anade a la recuperacion metadatos de persona y rol del participante. No se documenta en la informacion disponible el uso de RLHF ni DPO.

## Capacidades

- Traduccion de ingles a trece variedades nacionales de arabe dialectal en contexto de dialogo.
- Condicionamiento sobre el historial de conversacion, no solo sobre el turno actual.
- Enrutado por dialecto con seleccion determinista de checkpoint y configuracion de prompt.
- Recuperacion de demostraciones semanticamente similares mediante encoder all-MiniLM-L6-v2 (configuraciones P2 y P3, requieren pool de demostraciones no incluido en el repositorio).
- Incorporacion de metadatos de persona y rol del participante en la traduccion (configuracion P3).
- Decodificacion por busqueda en haz (num_beams=4) sin muestreo, con penalizacion de repeticion 1,05 y hasta 120 tokens nuevos.
- Filtro posterior de script latino incluido en el script de inferencia.
- Capacidad multilingue limitada al par ingles-dialectal arabe; no se ha evaluado para otros pares.
- No se documentan capacidades de tool calling, function calling, agentes, vision ni audio.

## Casos de uso

- Traduccion de subtitulos de series y peliculas: el modelo traduce dialogos turno a turno manteniendo el historial conversacional, y la etiqueta de dialecto permite generar una pista de subtitulos especifica por pais (por ejemplo, egipcio frente a marroqui) sin reentrenar el backbone.
- Localizacion de productos conversacionales: aplicaciones de chat, foros o asistentes pueden generar respuestas en el dialecto del usuario a partir de plantillas en ingles, aprovechando las configuraciones P2 y P3 cuando se dispone del pool de demostraciones y del encoder MiniLM.
- Atencion al cliente regionalizada: un sistema de soporte puede traducir guiones y macros de respuesta en ingles al dialecto del cliente (Golfo, Levante o Magreb) y mantener coherencia en conversaciones multi-turno gracias al condicionamiento sobre el historial.
- Generacion de corpus dialectales anotados: los 28,54 spBLEU y 44,02 chrF++ en la modalidad no restringida permiten usar el sistema para aumentar datos de entrenamiento de modelos ASR o TTS dialectales, siempre con revision humana posterior.
- Investigacion en traduccion automatica dialectal: reproduccion y comparacion de los resultados de la tarea compartida AlexandriaX-2026, con la tabla de enrutado y los seis checkpoints publicados para experimentos de ablacion sobre prompt y checkpoint.
- Prototipado rapido de traduccion dialectal: al publicarse como adaptadores PEFT de ~114 MB sobre un backbone de 3B, es posible cargar varios dialectos en una sola GPU cambiando el subdirectorio del adaptador, lo que abarata el despliegue de pruebas comparativas frente a mantener trece modelos independientes.
- Normalizacion de conversaciones en plataformas de mensajeria: traduccion de historiales de chat ingleses a una variedad concreta para su analisis o moderacion, empleando el filtro de script latino incluido para descartar salidas malformadas.

## Benchmarks y rendimiento

Resultados oficiales del test privado, media macro sobre los trece dialectos:

| Modalidad | spBLEU | chrF++ | Puesto |
|---|---|---|---|
| Restringida | 28,30 | 43,81 | 2.o |
| No restringida | 28,54 | 44,02 | 3.o |

Desglose por variedad en el sistema restringido:

| Variedad | Adaptador | Prompt | spBLEU | chrF++ |
|---|---|---|---|---|
| EG | stage2_step5200 | P3 | 31,88 | 45,60 |
| JO | stage2_step5200 | P1 | 35,50 | 49,12 |
| LB | stage2_step5200 | P1 | 32,29 | 46,00 |
| LY | stage2_step6400 | P3 | 23,39 | 39,01 |
| MA | stage2_step5200 | P2 | 23,31 | 39,77 |
| MR | stage2_step2000 | P1 | 17,94 | 34,34 |
| OM | stage2_step4900 | P1 | 32,57 | 47,11 |
| PS | stage2_step5200 | P1 | 34,26 | 48,26 |
| SA | stage2_step1600 | P2 | 35,25 | 49,78 |
| SD | stage2_step5200 | P1 | 26,15 | 40,97 |
| SY | stage2_step5200 | P3 | 39,38 | 53,19 |
| TN | stage2_step7600 | P1 | 35,23 | 47,61 |
| YE | stage2_step4900 | P1 | 25,23 | 41,71 |

Sobrescrituras en la modalidad no restringida: LY pasa a `specialist_LY` (23,86 spBLEU / 39,14 chrF++) y SD a `specialist_SD` (27,43 / 42,06). No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generales.

## Requisitos de hardware

- VRAM para inferencia: el backbone de 3B en BF16 ocupa aproximadamente 6-7 GB; a ello se suma el adaptador activo (~114 MB). En cuantizacion de 8 bits el conjunto baja a unos 3-4 GB y en 4 bits a unos 2-3 GB, aunque no se distribuyen pesos cuantizados y habria que generarlos.
- GPU recomendadas: NVIDIA RTX 5090 (utilizada para el entrenamiento en BF16), A100 o H100 para servir varias variedades en paralelo; RTX 4090 y RTX 3090 suficientes para inferencia de un adaptador.
- Compatibilidad con GPU de consumo: si, cabe en tarjetas con 8-12 GB o mas, como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y RTX 5090. Con cuantizacion de 4 bits podria entrar en GPUs de 6-8 GB.
- Opciones de despliegue: `transformers` + `peft` (patron mostrado en el script de inferencia), vLLM con soporte de adaptadores LoRA para servido multi-adaptador, TGI con LoRA. Para llama.cpp u Ollama seria necesario fusionar el adaptador con el backbone y convertir a GGUF, paso no documentado en el repositorio.
- Dependencias adicionales: las configuraciones P2 y P3 requieren el encoder `all-MiniLM-L6-v2` y un pool de demostraciones (particiones oficiales de entrenamiento, desarrollo y continuacion) que no se distribuyen en el repositorio; para un uso autocontenido debe emplearse P1.
- Latencia y throughput: no disponible en la informacion proporcionada. La generacion de referencia usa busqueda en haz con 4 haces, sin muestreo, penalizacion de repeticion 1,05 y un maximo de 120 tokens nuevos, lo que implica un coste de decodificacion varias veces superior al de la decodificacion voraz.

## Comparativa con modelos similares

No se dispone de resultados de sistemas comparables en la informacion proporcionada. La siguiente tabla recoge las diferencias estructurales con el modelo base y su origen, sin datos de rendimiento comparables.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| LahjaMT | 3B + ~29,9M por adaptador | No disponible (entrenamiento a 2.048 tokens) | Ingles a 13 variedades de arabe dialectal | other / qwen-research | safetensors (PEFT) |
| UBC-NLP/NileChat-3B-Base | 3B | No disponible | Arabe e ingles (chat) | No disponible | safetensors |
| Qwen2.5-3B | 3B | No disponible | Multilingue | qwen-research | safetensors |

No disponible la comparacion con otros sistemas participantes en AlexandriaX-2026, ni con modelos de traduccion dialectal como AraT5, AceGPT u otros, al no haberse proporcionado sus cifras.

## Limitaciones y advertencias

- Uso previsto exclusivamente de investigacion: la model card indica explicitamente que el sistema se construyo para traduccion de dialogo ingles a arabe dialectal con contexto conversacional y que no ha sido evaluado para otros pares de idiomas, documentos largos ni entornos de produccion.
- Licencia qwen-research heredada del modelo base: impone restricciones de uso comercial que deben revisarse en el enlace de licencia de Qwen2.5-3B antes de cualquier despliegue productivo.
- Riesgo de alucinacion y de deriva hacia el arabe estandar moderno: el sistema enruta por etiqueta de dialecto, pero no hay garantia de que la salida mantenga todos los rasgos marcados de la variedad solicitada.
- Filtro de script latino necesario: el script de inferencia incluye un posfiltro para descartar salidas en alfabeto latino, lo que sugiere que el modelo puede producir transcripciones latinizadas no deseadas.
- Rendimiento muy desigual por variedad: el rango va de 39,38 spBLEU en sirio a 17,94 en mauritano dentro del sistema restringido, con libio y sudanes como los casos mas debiles (23,39 y 26,15), lo que desaconseja un uso uniforme en los trece dialectos.
- Configuraciones dependientes de recursos no publicados: P2 y P3 necesitan un pool de demostraciones y el encoder MiniLM que no se incluyen en el repositorio, de modo que la reproduccion completa de los numeros reportados no es autocontenida.
- Trazabilidad limitada: 0 descargas y 0 likes en el momento de redactar la ficha, ausencia de resultados de benchmarks generales y falta de informacion sobre sesgos, composicion exacta del dataset, longitud de contexto nativa y latencia.
- Longitud de contexto de entrenamiento de 2.048 tokens: el condicionamiento sobre historial de dialogo recorta a esa ventana, por lo que conversaciones muy largas pueden perder contexto relevante.
- Riesgo de sesgos dialectales o geograficos: las variedades con menos datos (mauritano, libio, sudanes, yemeni) presentan metricas notablemente inferiores, lo que puede traducirse en una calidad desigual segun la procedencia del usuario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MohamedAbdallah98/LahjaMT
- Modelo base: https://huggingface.co/UBC-NLP/NileChat-3B-Base
- Codigo y experimentos: https://github.com/m-abdallah98/LahjaMT
- Articulo: "LahjaMT at AlexandriaX-2026: A Context-Aware English-to-Dialectal Arabic MT System with Lightweight Routing of LoRA Experts" (no se proporciona URL directa en la informacion disponible)
- Licencia del modelo base (qwen-research): https://huggingface.co/Qwen/Qwen2.5-3B/blob/main/LICENSE
