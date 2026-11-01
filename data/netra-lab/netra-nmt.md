# Netra-Lab/Netra-NMT

## Resumen

Netra NMT es un modelo de traduccion automatica neuronal especializado en el par de idiomas ingles-khmer (camboyano), desarrollado por Netra-Lab. Se trata de un transformer encoder-decoder de 77 millones de parametros entrenado desde cero sobre aproximadamente 220 millones de tokens de texto paralelo, capaz de traducir en ambas direcciones (EN→KM y KM→EN) con un unico conjunto de pesos. Su interes principal radica en que ofrece una calidad competitiva en ingles→khmer con una huella muy reducida: 77M de parametros frente a los 350M-3B de las alternativas multilingues como NLLB o MADLAD-400.

El modelo se distribuye principalmente en formato ONNX con pesos fp16, lo que permite ejecutar inferencia sobre ONNX Runtime en CPU sin necesidad de PyTorch. Segun la model card, en CPU logra 65,6 ms por frase con decodificacion greedy, frente a 550,8 ms de NLLB-350M. Tambien se publican los pesos en safetensors para fine-tuning. Esta pensado para escenarios de despliegue ligero, traduccion de bajo资源 y aplicaciones en las que el coste computacional o la ausencia de GPU son una restriccion real.

La licencia de los pesos es MIT, aunque los terminos del corpus de entrenamiento deben verificarse por separado antes de un uso comercial. El modelo no esta pensado como traductor multilingue general, sino como un especialista bidireccional en un par de idiomas concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (12 capas encoder, 2 capas decoder), d_model 512, 8 cabezas, FFN 2048 |
| Parametros totales | 77M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos exportados en fp16 (ONNX); no se documentan otras cuantizaciones |
| Idiomas soportados | Ingles (en) y khmer (km) |
| Licencia | MIT (pesos); datos de entrenamiento sujetos a sus propios terminos |
| Formato de pesos | ONNX (encoder.onnx 136 MB, decoder_step.onnx 52 MB) y safetensors (fp16) para fine-tuning |
| Vocabulario | 32K (SentencePiece unigram compartido) |
| Posicional | Rotary position embeddings (RoPE) |
| Normalizacion | RMSNorm (pre-norm) |
| Activacion FFN | SwiGLU |
| Embeddings | Tabla unica compartida entre encoder, decoder y cabeza de salida (tied) |
| KV cache | Si, en el decoder exportado |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-decoder con una configuracion asimetrica: 12 capas en el encoder y solo 2 en el decoder (deep encoder, shallow decoder), con d_model de 512, 8 cabezas de atencion y FFN de 2048. Emplea rotary position embeddings, RMSNorm en pre-norm, activacion SwiGLU, una unica tabla de embeddings compartida entre encoder, decoder y la cabeza de salida (tied embeddings) y KV cache en el decoder. La entrada se marca con un token de idioma destino (`<2km>` o `<2en>`), seguido del texto fuente. El preprocesado incluye normalizacion NFC y minusculizacion para el ingles, y segmentacion de palabras con khmercut para el khmer; el paquete de inferencia realiza este preprocesado automaticamente.

El entrenamiento se realizo desde cero (sin pesos preentrenados) sobre aproximadamente 2,4 millones de pares unicos procedentes de cuatro fuentes (datos sinteticos y ParaCrawl), deduplicados y filtrados por longitud, y utilizados en ambas direcciones hasta sumar 4,2 millones de ejemplos (unos 220 millones de tokens). El tokenizador es un SentencePiece unigram de 32K vocabulario compartido por ambos idiomas, entrenado sobre khmer segmentado con khmercut. Se aplico label smoothing y un schedule de learning rate con warm-up y decaimiento coseno; se publica el checkpoint con mejor chrF de validacion. La exportacion genera el encoder y un decoder de un paso con KV cache como grafos ONNX con pesos fp16; segun la model card, la carpeta exportada genera los mismos tokens que el modelo PyTorch sobre el test de ALT tanto en greedy como en beam-5.

## Capacidades

- Traduccion bidireccional ingles→khmer y khmer→ingles con un unico modelo.
- Generacion de texto autoregresiva con decodificacion greedy y beam search (beam-5).
- Preprocesado integrado de entrada: normalizacion NFC y minusculizacion del ingles, segmentacion de palabras khmer con khmercut.
- Inferencia en CPU mediante ONNX Runtime, sin dependencia de PyTorch.
- Inferencia en GPU mediante la variante `[gpu]` del paquete.
- Fine-tuning sobre pares propios a partir de los pesos safetensors.
- Servicio web y API REST mediante el subcomando `serve` del paquete.
- No soporta tool calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Traduccion de documentacion y contenido web EN↔KM: el modelo traduce frases de forma individual con baja latencia en CPU (65,6 ms por frase greedy), adecuado para procesar articulos o paginas en lote sin infraestructura GPU.
- Atencion al cliente en camboyano: integrado via API REST (`netra-nmt serve`), permite traducir consultas de usuarios khmer a ingles para su procesamiento por un sistema de gestion y devolver la respuesta traducida al khmer.
- Traduccion de interfaces y cadenas de aplicaciones: el bajo coste computacional y el formato ONNX permiten incrustar el modelo en entornos con recursos limitados o sin acelerador hardware.
- Localizacion de contenido editorial: para pares EN→KM, el modelo obtiene el mejor TER de todos los sistemas comparados en la model card (60,47), lo que resulta util en tareas de postedicion donde prima la fidelidad estructural.
- Procesamiento por lotes en servidores sin GPU: al ejecutarse sobre ONNX Runtime en CPU, permite desplegar traduccion en servidores estandar sin tarjetas graficas dedicadas.
- Fine-tuning para dominio especifico: los pesos safetensors permiten adaptar el modelo a vocabulario propio (legal, medico, tecnico) con el script `training/finetune.sh` del repositorio.
- Traduccion de corpus paralelos para investigacion: util para generar o ampliar datos EN-KM en proyectos de linguistica computacional de bajo recursos.

## Benchmarks y rendimiento

Resultados sobre el split de test de ALT (`mutiyama/alt`, 1.018 pares), decodificacion greedy, spBLEU con tokenizador FLORES-200 (mayor es mejor):

| Modelo | Parametros | EN → KM | KM → EN |
|---|---:|---:|---:|
| NLLB-350M (EN-KM) | 350M | 18,89 | 0,26 |
| NLLB-200 distilled 600M | 600M | 9,24 | 31,28 |
| NLLB-200 distilled 1.3B | 1.3B | 16,62 | 35,15 |
| MADLAD-400 | 3B | 16,19 | 36,13 |
| Google Translate | — | 28,93 | 34,86 |
| Netra NMT | 77M | 25,83 | 19,47 |

Segun la model card, en EN→KM es el segundo mejor sistema tras Google Translate en spBLEU y el mejor en TER (60,47). En KM→EN queda 15,7 puntos de spBLEU por detras de NLLB-200 1.3B. En velocidad en CPU (EN→KM, mediana de ms por frase sobre 20 frases, Intel i7-13700KF con 16 hilos): 65,6 ms para Netra NMT frente a 550,8 ms para NLLB-350M. La model card menciona tambien mediciones de chrF++, COMET (wmt22-comet-da) y BERTScore F1 (xlm-roberta-base), pero no se incluyen sus valores numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; por el tamano (77M parametros en fp16, encoder ONNX de 136 MB y decoder de 52 MB), la huella es inferior a 1 GB, por lo que cabe en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos ~1 GB de memoria libre; la model card cita mediciones en una RTX 3060.
- CPU: ejecutable en CPU mediante ONNX Runtime; la model card reporta 65,6 ms por frase greedy en un Intel i7-13700KF con 16 hilos.
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna (RTX 3060 y superiores, o inferiores).
- Opciones de despliegue: paquete `netra-nmt` (extras `[cpu]` y `[gpu]`), ONNX Runtime, CLI (`netra-nmt --text ... --mode beam`), servicio web y API REST (`netra-nmt serve`, extra `server`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 65,6 ms por frase en CPU (greedy, EN→KM); no se proporcionan cifras de throughput agregado ni latencia en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | EN→KM (spBLEU) | KM→EN (spBLEU) | Licencia | Formato |
|---|---:|---|---:|---:|---|---|
| Netra NMT | 77M | en, km | 25,83 | 19,47 | MIT | ONNX, safetensors |
| NLLB-200 distilled 1.3B | 1.3B | 200 idiomas | 16,62 | 35,15 | CC-BY-NC 4.0 (uso no comercial) | safetensors |
| MADLAD-400 | 3B | 400+ idiomas | 16,19 | 36,13 | Apache 2.0 / mT5 (segun variante) | safetensors |
| NLLB-350M (EN-KM) | 350M | multilingue | 18,89 | 0,26 | CC-BY-NC 4.0 | safetensors |

Netra NMT destaca por su reducido tamano (77M) y su licencia permisiva (MIT) frente a alternativas multilingues mucho mayores. Su punto debil es la direccion KM→EN, donde NLLB-200 1.3B y MADLAD-400 lo superan ampliamente. En EN→KM, sin embargo, supera a todos los modelos open source comparados en la tabla y se acerca a Google Translate.

## Limitaciones y advertencias

- Solo cubre el par ingles-khmer; no es un modelo multilingue general.
- Rendimiento notablemente inferior en KM→EN (19,47 spBLEU) frente a modelos multilingues de mayor tamano.
- La longitud maxima de contexto no esta documentada; el comportamiento con entradas largas es incierto.
- No se han publicado analisis de sesgos; al entrenarse sobre corpus web (ParaCrawl y datos sinteticos) puede heredar sesgos presentes en esas fuentes.
- Riesgo de alucinacion y de traducciones incorrectas en dominios especializados o con terminologia poco representada en el corpus.
- El preprocesado del khmer depende de khmercut; un fallo de segmentacion puede degradar la calidad de la traduccion.
- Los pesos son MIT, pero los terminos de los datos de entrenamiento deben revisarse antes de un uso comercial; la model card remite a la dataset card para ello.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso comunitario ni validacion externa.
- El paquete descarga el modelo desde un commit concreto del repositorio, lo que puede afectar a la reproducibilidad si el repositorio cambia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Netra-Lab/Netra-NMT
- Repositorio de codigo y receta de entrenamiento: https://github.com/netra-ai-lab/Netra-NMT
- Dataset de entrenamiento: https://huggingface.co/datasets/Netra-Lab/bilingual-en-km
- Dataset de evaluacion ALT (NICT, CC BY 4.0): https://huggingface.co/mutiyama/alt
- Imagen de benchmarks: https://huggingface.co/Netra-Lab/Netra-NMT/resolve/main/assets/metrics_benchmark.png
- Imagen de velocidad: https://huggingface.co/Netra-Lab/Netra-NMT/resolve/main/assets/speed_benchmark.png
- Imagen de arquitectura: https://huggingface.co/Netra-Lab/Netra-NMT/resolve/main/assets/model_architecture.png
