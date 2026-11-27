# Netra-Lab/karna-lm

## Resumen

karna-lm es un modelo de lenguaje a nivel de caracter para jemer (khmer) e ingles, desarrollado por Netra-Lab. No es un transformer ni una red neuronal: es un modelo de n-gramas de caracteres de orden 8 con suavizado Kneser-Ney modificado e interpolado, almacenado como arrays de numpy (65 MB) y consumido por el paquete `netra-karna` sin dependencias adicionales. Su proposito no es generar texto libre, sino actuar como modelo de lenguaje externo en la decodificacion por haz (beam search) de los reconocedores de voz de la familia Karna (karna-base y karna-large), fusionandose en la busqueda por prefijos CTC.

El modelo resuelve un problema concreto y bien acotado: reducir la tasa de error de los ASR de Karna en jemer (CER) e ingles (WER) en condiciones reales, incluyendo ruido de fondo, reverberacion, campo lejano y canal telefonico. Segun la model card, la integracion del LM rebaja el CER de karna-base en OpenSLR 42 de 11,3 a 8,5 y el WER de karna-large en LibriSpeech test-other de 13,3 a 11,0, con un coste de solo 3-8 ms de un nucleo de CPU por segundo de audio.

Es relevante ahora porque demuestra que un modelo estadistico clasico, ligero y sin GPU puede aportar ganancias sustanciales en ASR de bajos recursos (jemer) cuando se integra correctamente en el decodificador. Queda fuera del ambito de los LLM generativos: no produce respuestas, no razona y no soporta instrucciones. Es una pieza de infraestructura de decodificacion, no un modelo conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | N-gramas de caracteres de orden 8, Kneser-Ney modificado interpolado, almacenado como arrays numpy |
| Parametros totales | 13,9 M de n-gramas (no aplica el concepto de parametros neuronales) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de 8 caracteres por n-grama) |
| Tipos de cuantizacion | no aplica; log-probabilidades almacenadas en float16 y claves en uint64 |
| Idiomas soportados | jemer (km), ingles (en) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | `.npz` (numpy), 65 MB; manifiesto `.json` con ajustes de haz |

## Arquitectura y entrenamiento

El modelo es un n-grama de caracteres de orden 8 con suavizado Kneser-Ney modificado e interpolado. Los n-gramas de ordenes 4 a 8 vistos como maximo 1-4 veces se podan, conservandose 13,9 M de n-gramas. El artefacto guarda, por orden, claves de n-gramas ordenadas en uint64, log-probabilidades en float16 y pesos de backoff, junto con una cabecera JSON. El proceso de construccion completo tardo 134 s.

Los datos de entrenamiento son 124 M de caracteres en jemer y 52 M en ingles, muestreados por cuota por fuente y deduplicados: corpus web jemer (70,0 M), corpus de texto ASR jemer (23,6 M), lado jemer de un corpus paralelo jemer-ingles (20,0 M), transcripciones de entrenamiento del dataset DDD Khmer (9,1 M), transcripciones de LibriSpeech 960 h (35,0 M) y lado ingles del corpus paralelo (16,2 M). Se normalizo al conjunto de caracteres que los modelos Karna pueden escribir, en minusculas y un byte por caracter. Se elimino texto de retencion: toda linea que compartiera un tramo de 20 caracteres con una frase de evaluacion (FLEURS, DDD dev y test, OpenSLR 42, kmcorpus, Common Voice, LibriSpeech dev y test, clips de test dorados), lo que descarto 22 k lineas del corpus paralelo.

La innovacion tecnica no esta en el modelo en si, sino en su integracion: se fusiona en la busqueda por prefijos CTC (CTC prefix beam search) de los ASR Karna. Los ajustes de haz por modelo estan precalibrados en `karna-char8.json` y se sintonizaron exclusivamente sobre conjuntos de desarrollo separados.

## Capacidades

- Puntuacion de secuencias de caracteres en jemer e ingles para decodificacion ASR.
- Integracion con CTC prefix beam search como modelo de lenguaje externo.
- Reduccion de CER/WER en condiciones de ruido, reverberacion, campo lejano y canal telefonico.
- Perplejidad baja por caracter: 2,06 bits en FLEURS-km dev, 1,99 en DDD dev, 2,80 en OpenSLR 42, 2,48 en kmcorpus, 1,88 en LibriSpeech dev-clean y 2,04 en FLEURS-en dev.
- Uso en transcripcion en vivo (streaming) junto con el endpointer de `netra-karna` 1.2+.
- No soporta generacion de texto, tool calling, agentes, vision, audio ni razonamiento multi-paso.

## Casos de uso

- Transcripcion de voz en jemer en produccion: el modelo se carga automaticamente con `netra-karna` 1.3+ y mejora cada transcripcion de karna-base y karna-large sin coste apreciable de CPU (3-8 ms por segundo de audio).
- ASR en entornos ruidosos: en FLEURS-km con ruido, karna-large pasa de 19,1 a 17,2 CER; en test-other con ruido, de 24,9 a 20,6 WER, lo que lo hace adecuado para captura en movilidad o salas concurridas.
- Reconocimiento en campo lejano: en FLEURS-km far-field, karna-large baja de 47,6 a 46,1 CER, util para microfonos de sala en reuniones o aulas.
- Transcripcion telefonica: en test-other por canal telefonico, karna-large reduce el WER de 26,1 a 21,8, aplicable a centros de llamadas o grabaciones de baja calidad.
- Transcripcion en vivo (streaming): con el endpointer mas sensible, karna-large en FLEURS-km en streaming baja de 10,7 a 9,4 CER y en ingles ruidoso de 21,4 a 14,6 WER, apto para subtitulado en tiempo real.
- Despliegue en CPU sin GPU: al ser un modelo numpy de 65 MB, puede ejecutarse en servidores modestos o en el borde junto al ASR, sin necesidad de acelerador.
- Construccion de LM propios: el script `scripts/build_char_lm.py` permite entrenar variantes del n-grama sobre otros corpus o idiomas siguiendo el mismo procedimiento.

## Benchmarks y rendimiento

CER para jemer y WER para ingles, en %, menor es mejor; decodificacion greedy frente a beam search con este modelo.

| Conjunto | karna-base greedy | karna-base + LM | karna-large greedy | karna-large + LM |
|---|---:|---:|---:|---:|
| OpenSLR 42 Khmer (mitad test), CER | 11,3 | **8,5** | 9,1 | **8,2** |
| kmcorpus (jemer espontaneo), CER | 39,7 | **38,7** | 37,0 | **36,9** |
| FLEURS-km, CER | 15,5 | **13,0** | 10,5 | **9,2** |
| FLEURS-km + ruido, CER | 29,7 | **25,6** | 19,1 | **17,2** |
| FLEURS-km campo lejano, CER | 60,7 | **56,1** | 47,6 | **46,1** |
| LibriSpeech test-other, WER | 23,3 | **17,4** | 13,3 | **11,0** |
| test-other + ruido, WER | 40,9 | **33,0** | 24,9 | **20,6** |
| test-other telefonico, WER | 44,6 | **36,7** | 26,1 | **21,8** |

En transcripcion en vivo, karna-large en FLEURS-km en streaming paso de 10,7 a 9,4 CER (campo lejano de 57,5 a 45,8) y en ingles ruidoso de 21,4 a 14,6 WER. El coste es de 3-8 ms de un nucleo de CPU por segundo de audio, frente a unos 145 ms de la red de karna-base en CPU de portatil. No ayuda en Common Voice Khmer (12 clips): karna-large paso de 3,3 a 3,6 CER.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo corre en CPU y no requiere GPU.
- GPU recomendadas: ninguna necesaria; funciona en cualquier CPU.
- Cabe en GPU consumer: si, aunque no es su proposito; el artefacto ocupa 65 MB en disco y se carga en memoria como arrays numpy.
- Opciones de despliegue: paquete `netra-karna` (pip install "netra-karna[cpu]"), que descarga el modelo en la primera carga; variable `KARNA_LM` para apuntar a una copia local; `KARNA_LM=none` para desactivarlo. No es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un transformer.
- Latencia y throughput: 3-8 ms de un nucleo de CPU por segundo de audio; construccion del modelo en 134 s.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Idiomas | Licencia | Uso |
|---|---|---|---|---|---|
| karna-lm | N-grama de caracteres orden 8 | 65 MB / 13,9 M n-gramas | jemer, ingles | CC BY-SA 4.0 | LM externo para ASR Karna |
| KenLM (referencia generica) | N-grama de palabras/caracteres | variable | cualquiera | LGPL | LM externo para ASR |
| Modelos neuronales de LM (p. ej. transformers pequenos) | Transformer | cientos de MB a GB | multilingue | variable | LM externo o generacion |

No se dispone de datos de benchmarks comparativos directos con KenLM u otros LM externos en la informacion proporcionada; la comparativa se limita a categoria, tamano y licencia. Los modelos neuronales ofrecen mayor calidad potencial pero con coste de GPU y latencia muy superior, mientras que karna-lm esta optimizado para CPU y para el ecosistema Karna.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no responde a instrucciones y no soporta tool calling ni agentes.
- Solo cubre jemer e ingles; no es multilingue fuera de esos dos idiomas.
- Ventana efectiva de 8 caracteres; no captura dependencias de largo alcance.
- No aporta mejora en algunos conjuntos: Common Voice Khmer (12 clips) empeoro de 3,3 a 3,6 CER con karna-large.
- Esta disenado especificamente para los ASR Karna; su utilidad fuera de ese ecosistema no esta documentada.
- Licencia CC BY-SA 4.0 con clausula ShareAlike heredada de las transcripciones DDD (CC BY-SA 4.0); el uso comercial exige cumplir las condiciones de atribucion y compartir igual.
- Derivado de LibriSpeech (CC BY 4.0) y de un corpus paralelo que contiene frases de FLoRes; conviene revisar las obligaciones de atribucion.
- Riesgo de sesgo ligado a las fuentes de texto (corpus web, transcripciones ASR), no evaluado en la model card.
- No hay datos publicados sobre alucinacion en sentido generativo, al no generar texto.

## Enlaces

- Hugging Face: https://huggingface.co/Netra-Lab/karna-lm
- GitHub: https://github.com/netra-ai-lab/Karna
- PyPI: https://pypi.org/project/netra-karna/
- Karna-base: https://huggingface.co/Netra-Lab/karna-base
- Karna-large: https://huggingface.co/Netra-Lab/karna-large
- Documentacion de uso: https://github.com/netra-ai-lab/Karna/blob/master/docs/USAGE.md#decoding
- Resultados: https://github.com/netra-ai-lab/Karna/blob/master/docs/RESULTS.md
- Issues: https://github.com/netra-ai-lab/Karna/issues
- Dataset DDD Khmer: https://huggingface.co/datasets/Digital-Divide-Data/khmer-speech-dataset
- LibriSpeech: https://www.openslr.org/12
