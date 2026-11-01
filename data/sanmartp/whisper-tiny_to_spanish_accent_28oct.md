# sanmartp/whisper-tiny_to_spanish_accent_28oct

## Resumen

Whisper tiny spanish es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, desarrollado por el usuario sanmartp y publicado en Hugging Face. Se trata de un modelo de reconocimiento automatico del habla (ASR) basado en la arquitectura Whisper de OpenAI, en su variante mas pequena, con 37,76 millones de parametros. El objetivo declarado del ajuste es adaptar el modelo base al dataset naharte/spanish_english, presumiblemente para mejorar la transcripcion de audio en ingles con acento espanol o en contextos bilingues espanol-ingles.

El modelo es relevante por su reducido tamano (0,3 GB en el repositorio) y su licencia Apache 2.0, lo que lo hace adecuado para despliegues en entornos con recursos limitados, como dispositivos de borde o prototipos rapidos. Sin embargo, la informacion disponible es escasa: la model card esta generada automaticamente y no incluye descripcion detallada, usos previstos ni limitaciones. El unico dato de rendimiento declarado es un WER de 12,31 sobre el split de test del dataset de entrenamiento, marcado como no verificado.

La ficha se basa exclusivamente en los metadatos y la model card proporcionados. Cualquier dato no presente en esa informacion se indica como "no disponible". No se han publicado resultados de benchmarks en la informacion disponible mas alla del WER declarado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (segun metadatos); el ajuste se realiza sobre dataset espanol-ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper tiny de OpenAI, un transformer encoder-decoder disenado para reconocimiento automatico del habla. El modelo base procesa audio en ventanas de 30 segundos y genera transcripciones token a token. Con 37,76 millones de parametros, es la variante mas pequena de la familia Whisper, lo que implica menor capacidad pero tambien menores requisitos de computo.

El ajuste fino se realizo sobre el dataset naharte/spanish_english con los siguientes hiperparametros declarados en la model card: learning rate de 1e-05, batch size de entrenamiento de 2, batch size de evaluacion de 1, semilla 42, optimizador AdamW con betas (0,9, 0,999) y epsilon 1e-08, scheduler lineal con 500 pasos de warmup, y 2000 pasos de entrenamiento totales. No se especifica el numero de tokens de audio ni la composicion detallada del dataset. No se menciona el uso de RLHF, DPO ni tecnicas de decodificacion especulativa. El entrenamiento se realizo con Transformers 5.22.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3.

## Capacidades

- Reconocimiento automatico del habla (ASR) para audio en ingles, con posible adaptacion a acento espanol segun el dataset de ajuste.
- Transcripcion de audio a texto en formato token a token mediante la arquitectura Whisper.
- Procesamiento de ventanas de audio de hasta 30 segundos por inferencia (caracteristica heredada de Whisper).
- Capacidad multilingue limitada: los metadatos declaran solo "en", aunque el dataset de entrenamiento es espanol-ingles.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades de vision, audio generativo ni modo thinking.
- No se documenta soporte de marcas de tiempo (timestamps) ni diarizacion de hablantes.

## Casos de uso

- Transcripcion de reuniones y notas de voz en ingles con hablantes de acento espanol: el ajuste sobre el dataset spanish_english sugiere una mejora potencial en este escenario frente al modelo base, aunque no hay datos comparativos publicados.
- Prototipado rapido de ASR en entornos con recursos limitados: con 37,76 millones de parametros y 0,3 GB de repositorio, el modelo puede ejecutarse en CPU o GPUs de gama baja para validar pipelines de transcripcion antes de escalar a modelos mayores.
- Subtitulado automatico de contenido audiovisual en ingles: el modelo puede generar transcripciones que se post-procesen para crear subtitulos, aunque la falta de soporte documentado de timestamps limita su uso directo en este flujo.
- Integracion en aplicaciones de borde (edge computing): su tamano reducido permite desplegarlo en dispositivos con poca memoria, como Raspberry Pi o moviles, para transcripcion offline de comandos de voz en ingles.
- Generacion de datos de entrenamiento para otros modelos ASR: las transcripciones del modelo pueden usarse como pseudo-etiquetas en pipelines de destilacion o aumento de datos, con la cautela de que el WER de 12,31 % introduce ruido.
- Evaluacion comparativa de ajustes finos de Whisper tiny: sirve como referencia para investigadores que estudien el efecto de ajustes especificos sobre el modelo base en dominios acentuados o bilingues.
- Transcripcion de llamadas de atencion al cliente en ingles con acento espanol: el modelo podria integrarse en un pipeline de analitica de voz, aunque su ventana de 30 segundos requiere segmentacion previa del audio.

## Benchmarks y rendimiento

Los unicos datos disponibles son los declarados por el autor en la model-index y en la model card. No se han publicado resultados de benchmarks en la informacion disponible mas alla de los siguientes:

| Dataset | Split | Metrica | Valor | Verificado |
|---|---|---|---|---|
| naharte/spanish_english | test | WER | 12,3134 | No |
| naharte/spanish_english | evaluacion (epoca 1) | WER | 13,9801 | No |
| naharte/spanish_english | evaluacion (epoca 2) | WER | 12,3134 | No |
| naharte/spanish_english | evaluacion (epoca 2) | Loss | 0,2459 | No |

No se proporcionan comparaciones con el modelo base openai/whisper-tiny ni con otros modelos ASR en la informacion disponible. No se han publicado resultados en benchmarks estandar como LibriSpeech, Common Voice o FLEURS en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 37,76 millones de parametros, en FP32 el modelo ocupa aproximadamente 151 MB, en FP16 unos 75 MB y en int8 unos 38 MB (estimacion a partir del numero de parametros, no confirmada en la documentacion).
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1060, RTX 2060, RTX 3060, RTX 4090) es suficiente; tambien puede ejecutarse en CPU.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con al menos 1 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: transformers (libreria declarada); no se documenta compatibilidad explicita con vLLM, llama.cpp, Ollama ni TGI. El tag "endpoints_compatible" sugiere compatibilidad con los endpoints de Hugging Face.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sanmartp/whisper-tiny_to_spanish_accent_28oct | 37,76 M | no disponible (ventanas de 30 s) | 12,31 (dataset propio, no verificado) | apache-2.0 | Hugging Face |
| openai/whisper-tiny | 37,76 M | no disponible (ventanas de 30 s) | no disponible en esta ficha | apache-2.0 | Hugging Face |
| openai/whisper-base | 74 M | no disponible (ventanas de 30 s) | no disponible en esta ficha | apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparables del modelo base ni de whisper-base en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable. La comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- La model card esta generada automaticamente y no incluye secciones de usos previstos, limitaciones ni descripcion detallada; el autor no ha completado la documentacion.
- El WER de 12,31 esta marcado como no verificado y se calcula sobre el mismo dataset usado para el ajuste (naharte/spanish_english), lo que puede sobreestimar el rendimiento en dominios distintos.
- Los metadatos declaran unicamente el idioma "en", aunque el dataset de entrenamiento es espanol-ingles; no esta claro el comportamiento real en espanol puro ni en otros idiomas.
- Riesgo de alucinacion: como todo modelo Whisper, puede generar transcripciones plausibles pero incorrectas en audio con ruido, silencios largos o habla no inglesa.
- Limitacion de contexto: Whisper procesa ventanas de 30 segundos; audios mas largos requieren segmentacion y pueden perder coherencia entre fragmentos.
- No se documentan sesgos conocidos ni evaluaciones de equidad; el ajuste sobre un dataset especifico puede introducir sesgos hacia el dominio y acento de ese dataset.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de openai/whisper-tiny se heredan las condiciones de la licencia del modelo base (tambien Apache 2.0).
- Para produccion, la falta de datos sobre latencia, throughput y robustez en dominios externos hace recomendable una evaluacion propia antes de desplegarlo.
- El modelo tiene solo 32 descargas y 0 likes en el momento de la ficha, lo que indica una validacion comunitaria practicamente nula.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sanmartp/whisper-tiny_to_spanish_accent_28oct
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset de entrenamiento: https://huggingface.co/datasets/naharte/spanish_english
- Paper de Whisper (referencia del modelo base): no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
