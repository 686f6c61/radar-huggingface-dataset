# koodikraft/koodikraft_opus_tr_fi

## Resumen

koodikraft_opus_tr_fi es un modelo de traduccion automatica neuronal derivado por ajuste fino (fine-tuning) del modelo koodikraft/opus-mt-tr-fi-2020-04-12, que a su vez pertenece a la familia Marian/OPUS-MT de Helsinki-NLP. El modelo esta orientado a la traduccion entre turco (tr) y finlandes (fi), una direccion de traduccion poco cubierta por los modelos multilingues generalistas. Lo publica el usuario koodikraft en Hugging Face bajo licencia CC-BY-4.0.

Tecnicamente se trata de un transformer encoder-decoder de tipo Marian con 105.994.171 parametros totales (aproximadamente 106 millones), un tamano propio de los modelos OPUS-MT, disenados para ser ligeros y desplegables en hardware modesto. El autor no documenta el dataset de entrenamiento, la composicion de los datos ni los resultados de evaluacion; la model card es la generada automaticamente por el Trainer de Hugging Face y contiene secciones sin completar.

Su relevancia es limitada pero concreta: cubre un par de idiomas de bajos recursos (turco-finlandes) para el que existen pocas alternativas especializadas, y su tamano reducido permite ejecutarlo en CPU o en GPUs de consumo. No obstante, la ausencia de benchmarks, de documentacion sobre los datos y de una evaluacion de calidad publicada obliga a validarlo empiricamente antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian) |
| Parametros totales | 105.994.171 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16; compatible con cuantizacion estandar via herramientas externas) |
| Idiomas soportados | Turco (tr) y finlandes (fi), segun el identificador del modelo y el modelo base |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un MarianMT, la arquitectura de traduccion automatica neuronal de la familia OPUS-MT: un transformer encoder-decoder con atencion multi-cabeza estandar, entrenado originalmente sobre corpus paralelos del proyecto OPUS. El modelo base, koodikraft/opus-mt-tr-fi-2020-04-12, procede de esa linea y el presente modelo es un ajuste fino sobre el mismo. El repositorio ocupa 102,2 GB, lo que sugiere que incluye checkpoints intermedios del entrenamiento ademas de los pesos finales, dado que el modelo en si solo tiene unos 106 millones de parametros.

El entrenamiento se realizo con el Trainer de Hugging Face con los siguientes hiperparametros: learning rate 6e-05, batch size de entrenamiento 4 con acumulacion de gradientes de 4 pasos (batch efectivo de 16), optimizador Adam (betas 0.9/0.999, epsilon 1e-08), scheduler coseno con 4000 pasos de warmup, 3 epocas, semilla 42 y precision mixta nativa (AMP). Se uso Transformers 4.44.0, PyTorch 2.1.0+cu118, Datasets 2.20.0 y Tokenizers 0.19.1. El autor no especifica el dataset de ajuste fino, el numero de tokens de entrenamiento ni si hubo tecnicas de alineacion adicionales (RLHF, DPO); la model card indica "unknown dataset" y deja las secciones de datos y evaluacion sin completar.

## Capacidades

- Traduccion automatica de texto entre turco y finlandes (y potencialmente en la direccion inversa, segun el modelo base).
- Generacion de texto condicionada a la tarea de traduccion; no es un modelo de proposito general ni de chat.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- Capacidades multilingues limitadas al par tr-fi; no se documenta cobertura de otros idiomas.
- No dispone de modo de razonamiento (thinking), vision ni audio.
- Al ser un modelo seq2seq, admite entrada por lotes y decodificacion con beam search, caracteristicas habituales de la familia Marian.

## Casos de uso

- Traduccion de documentacion tecnica turco-finlandes: el modelo puede traducir manuales, guias o notas de version entre ambos idiomas, aprovechando su naturaleza seq2seq y su bajo coste de inferencia para procesar grandes volumenes de texto en lote.
- Localizacion de interfaces y contenidos web: adecuado para traducir cadenas cortas de aplicaciones o sitios web del turco al finlandes en pipelines automatizados, dado su reducido tamano que permite ejecutarlo en servidores sin GPU dedicada.
- Traduccion de correspondencia y comunicaciones internas: util en empresas con equipos en Turquia y Finlandia para traducir correos y mensajes internos, con la ventaja de que los datos no salen de la infraestructura propia al ser un modelo desplegable localmente.
- Preprocesamiento de corpus para investigacion: puede emplearse para generar traducciones preliminares de corpus turco-finlandeses en estudios de linguistica computacional o para aumentar datos de entrenamiento de otros sistemas.
- Traduccion de contenido editorial y noticias: para medios o boletines que publiquen en ambos idiomas, el modelo puede servir como primera pasada de traduccion que un editor humano revise posteriormente.
- Subtitulado y transcripcion traducida: integrado en un pipeline de ASR mas traduccion, puede traducir subtitulos del turco al finlandes en flujos de postproduccion, gracias a su capacidad de procesar segmentos cortos con baja latencia.
- Prototipado rapido de sistemas de traduccion: por su tamano de 106 millones de parametros, es adecuado como linea base en experimentos academicos o pruebas de concepto antes de invertir en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index del autor declara una entrada sin resultados (`results: []`), y la model card no incluye metricas de BLEU, chrF ni METEOR sobre conjuntos de validacion o test.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-1 GB en fp16 para los pesos (106 millones de parametros); en fp32, alrededor de 0,4-0,5 GB solo de pesos, mas memoria para activaciones y cache de atencion.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090, T4, A100 o H100 funcionan sin problema, aunque el modelo esta sobredimensionado para estas GPUs y el cuello de botella sera el preprocesado.
- Cabe holgadamente en GPUs de consumo e incluso en CPU: es viable la inferencia en CPU con un throughput aceptable para volumenes moderados.
- Opciones de despliegue: transformers con PyTorch, pipeline de traduccion de Hugging Face, ONNX Runtime, y conversion a CTranslate2 para inferencia optimizada. No se documenta soporte nativo en vLLM ni llama.cpp (este ultimo orientado a modelos causales, no seq2seq).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera una latencia por frase del orden de decenas de milisegundos en GPU y de cientos de milisegundos en CPU, aunque no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| koodikraft_opus_tr_fi | 105.994.171 | no disponible | tr-fi | CC-BY-4.0 | Hugging Face |
| Helsinki-NLP/opus-mt-tr-fi | no disponible en la informacion | no disponible | tr-fi | CC-BY-4.0 (familia OPUS-MT) | Hugging Face |
| koodikraft/opus-mt-tr-fi-2020-04-12 (modelo base) | no disponible en la informacion | no disponible | tr-fi | no disponible en la informacion | Hugging Face |
| NLLB-200 (200 idiomas) | variable segun variante (600M, 1.3B, 3.3B) | no disponible | 200 idiomas, incluye tr y fi | CC-BY-NC-4.0 en varias variantes | Hugging Face |

La comparacion directa con el modelo base y con la version original de Helsinki-NLP es la mas relevante, ya que este modelo es un ajuste fino de aquel. No se dispone de datos de rendimiento comparativo entre ellos en la informacion proporcionada, por lo que no es posible determinar si el ajuste fino mejora al modelo base. NLLB-200 cubre ambos idiomas con mayor tamano y calidad potencialmente superior, pero con licencia no comercial en varias de sus variantes.

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento, por lo que se desconoce la composicion, calidad y posibles sesgos de los datos.
- No hay benchmarks publicados; la calidad de traduccion no esta verificada de forma independiente.
- Riesgo de alucinacion y de traducciones incorrectas en dominios especializados (medico, legal, tecnico) no cubiertos por los datos de entrenamiento.
- Cobertura limitada al par turco-finlandes; no es un modelo multilingue general.
- Longitud de contexto no documentada; los modelos Marian suelen limitarse a segmentos de unas pocas centenas de tokens, lo que exige dividir textos largos en fragmentos.
- La licencia CC-BY-4.0 permite uso comercial con atribucion, pero el autor no proporciona garantias ni soporte; conviene verificar la licencia del modelo base y de los corpus OPUS subyacentes.
- El repositorio de 102,2 GB incluye probablemente checkpoints intermedios; conviene descargar solo los archivos de pesos necesarios para el despliegue.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/koodikraft/koodikraft_opus_tr_fi
- Modelo base: https://huggingface.co/koodikraft/opus-mt-tr-fi-2020-04-12
- Proyecto OPUS-MT de Helsinki-NLP: https://github.com/Helsinki-NLP/OPUS-MT
- Proyecto OPUS (corpus): https://opus.nlpl.eu/
