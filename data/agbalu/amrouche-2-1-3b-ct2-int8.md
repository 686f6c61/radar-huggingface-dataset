# agbalu/Amrouche-2-1.3B-CT2-int8

## Resumen

Amrouche-2-1.3B-CT2-int8 es la version cuantizada en int8 del modelo de traduccion automatica Amrouche-2-1.3B, desarrollado por el usuario agbalu y publicado en Hugging Face. El modelo resuelve la traduccion bidireccional entre cabilio (taqbaylit, kab_Latn), ingles (eng_Latn), frances (fra_Latn) y arabe estandar moderno (arb_Arab), una combinacion de lenguas de bajos recursos donde los sistemas genericos rinden de forma deficiente. Con 1.370.638.336 parametros, deriva de un ajuste fino sobre NLLB-200-distilled-1.3B.

La version aqui descrita no es el modelo original, sino su conversion a CTranslate2 4.8.5 con cuantizacion `int8_float32`, pensada para despliegue en CPU sin dependencias de PyTorch ni Transformers. La conversion reduce el peso en disco de 2,74 GB (BF16) a 1,38 GB y multiplica por 7,1 el throughput en CPUs de 8 nucleos, con una perdida empirica inferior a 0,15 chrF++ de media en el conjunto FLORES+ devtest (38,08 frente a 38,22 en BF16).

Es relevante porque demuestra que un modelo de traduccion especializado en una lengua de bajos recursos puede servirse en infraestructura modesta (CPU, edge) manteniendo calidad casi identica a la version en precision completa, algo poco habitual en el ecosistema de modelos multilingues de gran tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (derivado de NLLB-200-distilled-1.3B) |
| Parametros totales | 1.370.638.336 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (`int8_float32`), via CTranslate2 4.8.5 |
| Idiomas soportados | cabilio (kab_Latn), ingles (eng_Latn), frances (fra_Latn), arabe estandar moderno (arb_Arab) |
| Licencia | Apache 2.0 |
| Formato de pesos | CTranslate2 (modelo convertido, no safetensors ni GGUF); vocabulario SentencePiece de 256.206 tokens |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de traduccion, construido sobre NLLB-200-distilled-1.3B mediante ajuste fino. La model card de la version original (Amrouche-1.3B) indica que el ajuste se realizo sobre 544.729 pares con autoria humana procedentes del corpus paralelo AGBAU, es decir, todos aquellos pares que NLLB no habia minado por si mismo. El vocabulario es un SentencePiece de 256.206 subtokens, heredado del modelo base.

La innovacion principal de esta release no esta en el entrenamiento sino en la optimizacion de inferencia: la conversion a CTranslate2 con cuantizacion int8 de pesos (`int8_float32`), que permite ejecucion sin PyTorch ni Transformers, con runtimes en Python y C++ nativo. El repositorio sigue las convenciones de OpenNMT/CTranslate2 Hub. No se dispone de informacion sobre la composicion exacta del dataset, el numero de tokens de entrenamiento ni el uso de RLHF o DPO.

## Capacidades

- Traduccion bidireccional en seis direcciones entre cabilio, ingles, frances y arabe estandar moderno.
- Traduccion desde y hacia cabilio en escritura latina normalizada ortograficamente (kab_Latn).
- Inferencia de alta velocidad en CPU sin dependencias de PyTorch ni Transformers.
- Despliegue en servidor y en dispositivos edge mediante runtime C++ nativo o Python.
- Gestion de vocabulario subword amplio (256.206 tokens) para morfologia aglutinante del cabilio.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Traduccion de documentacion oficial y administrativa al cabilio: el modelo permite traducir textos institucionales del frances o el arabe al cabilio con calidad medida en FLORES+ (33,45 chrF++ fra→kab), adecuada para contenidos de dominio general.
- Localizacion de interfaces y aplicaciones moviles: con 205,6 ms de latencia por frase en CPU de 8 nucleos, puede integrarse en un servicio de traduccion interactiva sin GPU.
- Subtitulado y traduccion de medios audiovisuales: el throughput de 12,93 frases/s en batch=8 permite procesar transcripciones completas en minutos sobre hardware estandar.
- Preservacion y difusion del patrimonio linguistico cabilio: traduccion de corpus orales transcritos y textos literarios hacia ingles y frances para publicacion academica.
- Servicio de traduccion en infraestructura sin GPU: al ejecutarse en CTranslate2 int8, cabe en servidores CPU convencionales y en dispositivos de bajos recursos, reduciendo costes operativos.
- Traduccion humanitaria y de servicios publicos: atencion multilingue en contextos donde el cabilio es lengua de uso cotidiano y no existen traductores comerciales fiables.
- Pipeline de aumento de datos para NLP en cabilio: generacion de pares sinteticos kab↔en/fr/ar para entrenar otros modelos de la familia AGBAU (ASR, restauracion de puntuacion, tokenizador).

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente) sobre FLORES+ devtest, 1.012 frases por direccion, con `sacrebleu` 2.6.0 (chrF++ con orden de palabra 2, BLEU con tokenizacion 13a). Formato: chrF++ / BLEU.

| Direccion | NLLB-1.3B base (BF16) | Amrouche-2 BF16 | Amrouche-2 CT2 int8 | Delta cuantizacion |
|---|---|---|---|---|
| kab → eng | 44,60 / 23,06 | 47,78 / 25,81 | 47,91 / 25,89 | +0,13 chrF++ |
| kab → fra | 42,00 / 19,46 | 44,64 / 21,68 | 44,52 / 21,65 | -0,12 chrF++ |
| eng → kab | 31,53 / 7,74 | 35,26 / 9,90 | 35,15 / 9,93 | -0,11 chrF++ |
| kab → arb | 33,78 / 9,64 | 34,98 / 10,19 | 34,75 / 10,06 | -0,23 chrF++ |
| fra → kab | 30,21 / 6,33 | 33,53 / 7,65 | 33,45 / 7,64 | -0,08 chrF++ |
| arb → kab | 29,69 / 6,24 | 33,13 / 7,54 | 32,70 / 7,36 | -0,43 chrF++ |
| Media 6 direcciones | 35,30 / 12,08 | 38,22 / 13,80 | 38,08 / 13,75 | -0,14 chrF++ |

Resultados en particiones de test retenidas (pares humanos descontaminados, sin solapamiento documental ni de frases):

| Particion | Soporte | BF16 | CT2 int8 | Delta |
|---|---|---|---|---|
| Panel de test (`panel_test_384`) | 384 frases (64/dir) | 54,72 chrF++ / 35,46 BLEU | 53,99 chrF++ / 34,70 BLEU | -0,73 chrF++ |
| Test completo (`full_test_868`) | 868 frases | 52,36 chrF++ / 32,26 BLEU | 51,98 chrF++ / 31,78 BLEU | -0,38 chrF++ |
| Panel de desarrollo (`panel_dev_384`) | 384 frases (64/dir) | 55,21 chrF++ / 32,65 BLEU | 54,76 chrF++ / 33,65 BLEU | -0,45 chrF++ |

Rendimiento en CPU (Intel Xeon Gold 6548N, 8 hilos, batch=8 para throughput y batch=1 para latencia interactiva):

| Metrica | PyTorch (FP32) | CTranslate2 (int8) | Mejora |
|---|---|---|---|
| Tamano en disco | 2.741 MB (BF16) | 1.382 MB (int8) | -49,6% |
| Latencia por frase (batch=1) | 957,6 ms | 205,6 ms | 4,66x menor |
| Throughput (batch=8) | 1,83 frases/s (27,5 tok/s) | 12,93 frases/s (178,7 tok/s) | 7,1x mayor |

## Requisitos de hardware

- VRAM: no aplica para despliegue en CPU; el modelo pesa 1,38 GB en int8 y puede residir en RAM convencional.
- GPU recomendadas: no se documentan requisitos de GPU; el modelo esta optimizado para CPU. CTranslate2 soporta ejecucion en GPU CUDA si se desea, pero no hay datos de rendimiento publicados.
- GPU de consumo: al estar cuantizado en int8 y orientado a CPU, cabe en cualquier maquina con al menos 2 GB de RAM libre; no requiere GPU dedicada.
- Opciones de despliegue: CTranslate2 (runtime Python y C++ nativo), siguiendo convenciones OpenNMT/CTranslate2 Hub. No se distribuye en formato GGUF, por lo que no es directamente compatible con llama.cpp u Ollama.
- Latencia y throughput medidos: 205,6 ms por frase en batch=1 y 12,93 frases/s en batch=8 sobre Intel Xeon Gold 6548N con 8 hilos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | chrF++ medio FLORES+ | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Amrouche-2-1.3B-CT2-int8 | 1,37B | no disponible | 38,08 | Apache 2.0 | CTranslate2 int8, CPU |
| Amrouche-2-600M-CT2-int8 | 0,62B | no disponible | 34,73 | Apache 2.0 | CTranslate2 int8, CPU |
| NLLB-200-distilled-1.3B (base) | 1,3B | no disponible | 35,30 | CC-BY-NC 4.0 (uso no comercial) | PyTorch / Transformers |
| Amrouche-2-1.3B (BF16) | 1,37B | no disponible | 38,22 | Apache 2.0 | PyTorch / Transformers |

La ventaja diferencial frente al modelo base NLLB es doble: mejor calidad en las seis direcciones evaluadas (+13,8% relativo en BLEU medio) y una licencia Apache 2.0 que permite uso comercial, frente a la CC-BY-NC de NLLB.

## Limitaciones y advertencias

- La cuantizacion int8 introduce una perdida pequena pero real: hasta -0,73 chrF++ en el panel de test de 384 frases y -0,43 en la direccion arb→kab sobre FLORES+.
- Los resultados de benchmarks estan declarados por el autor y no han sido verificados de forma independiente (`verified: false` en la model-index).
- El modelo solo cubre cuatro lenguas; no es un traductor multilingue general y no debe usarse fuera de las direcciones documentadas.
- La calidad es notablemente inferior en las direcciones hacia cabilio (BLEU entre 7,36 y 9,93) que en las que parten del cabilio (BLEU entre 21,65 y 25,89), reflejo del desequilibrio del corpus.
- No se documentan sesgos especificos, pero al entrenarse sobre un corpus paralelo de autoria humana, puede heredar sesgos de las fuentes originales.
- Riesgo de alucinacion en traduccion: como todo modelo neuronal, puede generar contenido no presente en el original, especialmente en segmentos largos o dominios alejados del corpus de entrenamiento.
- No es compatible con llama.cpp, Ollama ni GGUF; requiere el runtime CTranslate2.
- No se dispone de informacion sobre la longitud maxima de contexto soportada, lo que limita la planificacion de despliegues con documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agbalu/Amrouche-2-1.3B-CT2-int8
- Modelo base: https://huggingface.co/agbalu/Amrouche-2-1.3B
- Version anterior: https://huggingface.co/agbalu/Amrouche-1.3B
- Version ligera: https://huggingface.co/agbalu/Amrouche-2-600M-CT2-int8
- Repositorio GitHub del proyecto AGBAU: https://github.com/abderahmane-ai/agbalu/tree/main
