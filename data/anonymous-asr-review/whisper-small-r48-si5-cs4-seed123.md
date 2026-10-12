# anonymous-asr-review/whisper-small-r48-si5-cs4-seed123

## Resumen

whisper-small-r48-si5-cs4-seed123 es un adaptador LoRA de rango 48 entrenado sobre el modelo base openai/whisper-small para reconocimiento automatico del habla (ASR) en escenarios de cambio de codigo (code-switching) entre sinhala (si) e ingles (en). Lo publica la cuenta anonima anonymous-asr-review, que lo describe explicitamente como un artefacto suplementario para revision por pares, es decir, material de reproduccion asociado a un articulo cientifico en evaluacion.

El adaptador se ha entrenado en dos fases: cinco epocas sobre datos en sinhala y cuatro epocas adicionales sobre datos de cambio de codigo. Se trata por tanto de un modelo de investigacion orientado a medir el impacto del ajuste fino con LoRA en tareas de ASR bilingue, no de un modelo listo para produccion. El repositorio contiene unicamente los pesos del adaptador (tamano de repo 0.0 GB), no los pesos completos del modelo base.

La relevancia del artefacto es metodologica: permite reproducir con una semilla fija (123) el efecto combinado de rango de adaptador (48), alpha (96) y numero de epocas por idioma sobre el rendimiento en code-switching. El modelo base Whisper small es un transformer encoder-decoder de 244 millones de parametros que procesa audio en ventanas de 30 segundos, con soporte nativo para decenas de idiomas. La licencia del adaptador no esta declarada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) con adaptador LoRA sobre el modelo base |
| Parametros totales | 244 millones (modelo base openai/whisper-small); el adaptador anade un subconjunto de pesos de bajo rango, no cuantificado en la informacion disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de audio de 30 segundos en el encoder; 448 tokens de contexto de decodificacion (modelo base Whisper) |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base admite fp16, int8 y cuantizaciones GGUF/CT2 tras el merge |
| Idiomas soportados | Sinhala (si) e ingles (en), segun los tags del autor; el modelo base soporta de forma nativa muchos mas idiomas |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base se descarga por separado |
| Rango del adaptador (LoRA rank) | 48 |
| Alpha de LoRA | 96 |
| Semilla | 123 |
| Seleccion de checkpoint | Ultimo (last) |
| Libreria | peft |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper small, un transformer encoder-decoder de tipo secuencia a secuencia disenado para ASR. El encoder consume una representacion mel-espectrografica de 80 canales calculada sobre ventanas de 30 segundos y produce representaciones ocultas; el decoder genera texto de forma autorregresiva con un limite practico de 448 tokens por ventana. Sobre este modelo base se ha insertado un adaptador LoRA de rango 48 y alpha 96, lo que implica un factor de escalado de 96/48 = 2 durante el entrenamiento. Los pesos del modelo base permanecen congelados y solo se optimizan las matrices de bajo rango, lo que reduce drasticamente el numero de parametros entrenables y el coste de almacenamiento.

El entrenamiento sigue un calendario de dos etapas declarado por el autor: primero cinco epocas sobre datos en sinhala y despues cuatro epocas sobre datos de cambio de codigo sinhala-ingles. El checkpoint seleccionado es el ultimo, no el mejor por validacion, lo que es habitual en configuraciones de reproduccion experimental. No se especifican en la informacion disponible el numero total de tokens de audio, la composicion exacta del dataset, la tasa de aprendizaje, el optimizador ni si se aplicaron tecnicas de RLHF o DPO; en un adaptador de ASR supervisado como este, lo esperable es entrenamiento por entropia cruzada pura sobre transcripciones, sin alineamiento por preferencias.

## Capacidades

- Transcripcion de audio en sinhala, incluyendo la variante estandarizada evaluada por el autor.
- Transcripcion de audio en ingles, heredada del modelo base y presumiblemente reforzada durante las epocas de code-switching.
- Manejo de cambio de codigo (code-switching) intra-frase entre sinhala e ingles, que es la capacidad diferencial del adaptador frente al modelo base.
- Procesamiento de audio a 16 kHz, tal y como exige el procesador de Whisper.
- Transcripcion de segmentos de hasta 30 segundos por ventana; para audios mas largos es necesario un pipeline de chunking con solapamiento.
- Seleccion de idioma y parametros de generacion configurables a traves del processor de Whisper (tarea de transcripcion frente a traduccion, tokens de idioma, beam search).
- No se declara soporte de tool calling, function calling ni capacidades de agente.
- No se declara capacidad de vision, audio understanding mas alla de ASR, ni modo de razonamiento explicito (thinking mode).
- No se declara capacidad multilingue mas alla de los dos idiomas etiquetados (si, en).

## Casos de uso

- Transcripcion de reuniones corporativas bilingues en Sri Lanka: en entornos donde los hablantes alternan sinhala e ingles tecnico dentro de la misma frase, un ASR monoingue comete errores sistematicos en las transiciones; este adaptador esta entrenado especificamente para esas fronteras de idioma.
- Subtitulado de contenido audiovisual: generacion de subtitulos para television, streaming o YouTube en sinhala con insertos en ingles, usando el processor de Whisper para fijar el idioma y los parametros de decodificacion por segmento.
- Centros de contacto y atencion al cliente: transcripcion de llamadas de soporte donde el agente usa terminologia en ingles (nombres de producto, diagnosticos tecnicos) dentro de una conversacion en sinhala, lo que permite generar registros y analitica de calidad.
- Documentacion clinica dictada: transcripcion de notas medicas dictadas en sinhala con farmacos y terminos clinicos en ingles, siempre que se valide el vocabulario especializado y se revise por personal cualificado.
- Investigacion linguistica sobre code-switching: generacion de transcripciones alineadas para estudiar patrones de alternancia de codigo, con la ventaja de que el checkpoint y la semilla estan fijados y el experimento es reproducible.
- Pseudo-etiquetado y aumento de datos: uso del adaptador para etiquetar grandes volumenes de audio sinhala-ingles y alimentar despues un ciclo de entrenamiento mayor o un modelo de destilacion.
- Evaluacion comparativa de hiperparametros LoRA: al ser un artefacto de revision por pares con rango, alpha, semilla y calendario de epocas declarados, sirve como punto de referencia en estudios de ablacion sobre adaptadores de bajo rango en ASR.
- Accesibilidad en tiempo real: integracion en sistemas de subtitulado en directo para eventos bilingues, sujeto a la latencia que imponga el pipeline de streaming elegido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye metricas de WER (word error rate), BLEU, ni comparaciones cuantitativas frente al modelo base sin adaptador. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y el tamano declarado es de 0.0 GB.

## Requisitos de hardware

- VRAM estimada para el modelo fusionado (merge_and_unload) en fp16: aproximadamente 0,5 GB solo para los pesos, con un consumo total en torno a 1-2 GB incluyendo activaciones y cache de decodificacion para ventanas de 30 segundos.
- VRAM estimada en int8: en torno a 0,3-0,5 GB de pesos, con overhead adicional de runtime.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 3090, RTX 4090, A100 y H100 funcionan sin problema, aunque las GPU de gama alta estaran infrautilizadas salvo que se procesen muchos streams en paralelo.
- Cabe holgadamente en GPU de consumo, incluidas GTX 1650 (4 GB) y superiores. Tambien es viable en CPU, con latencia mayor.
- Opciones de despliegue: transformers + peft (ruta oficial indicada por el autor), faster-whisper con CTranslate2 tras convertir el modelo fusionado, whisper.cpp con pesos GGUF, y servidores compatibles con Whisper como vLLM o TGI en sus variantes que soportan ASR. Ollama puede ejecutar el modelo si se dispone de una conversion GGUF adecuada.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de factor de tiempo real ni de RTF para este adaptador concreto.

## Comparativa con modelos similares

Los datos de la columna de openai/whisper-small corresponden a las especificaciones publicas del modelo base; el adaptador hereda esa arquitectura y solo modifica los pesos de bajo rango.

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-small-r48-si5-cs4-seed123 (este adaptador) | 244 M (base) + adaptador LoRA r=48 | 30 s por ventana | si, en (segun tags) | no disponible | Repositorio HuggingFace, 0 descargas |
| openai/whisper-small | 244 M | 30 s por ventana | Soporte multilingue amplio, incluye en y si | MIT (modelo base de OpenAI) | Ampliamente disponible en HuggingFace |
| openai/whisper-base | 74 M | 30 s por ventana | Multilingue | MIT | Ampliamente disponible |
| openai/whisper-medium | 769 M | 30 s por ventana | Multilingue | MIT | Ampliamente disponible |

No se dispone de alternativas especificas de ASR para code-switching sinhala-ingles en la informacion proporcionada, por lo que la comparativa se limita a la familia Whisper.

## Limitaciones y advertencias

- Artefacto de investigacion sin validacion publicada: no hay metricas de WER ni evaluacion independiente, por lo que su uso en produccion no esta respaldado por datos.
- Licencia no declarada: al no especificarse la licencia del adaptador, no puede asumirse permiso de uso comercial. El modelo base whisper-small es MIT, pero eso no determina la licencia de los pesos derivados.
- Anonimato del autor: la cuenta anonymous-asr-review esta vinculada a una revision por pares ciega; la identidad del desarrollador y el contexto del articulo no son verificables.
- Riesgo de alucinacion: como todos los modelos de la familia Whisper, puede generar texto plausible en segmentos con ruido, silencio o audio musical, e inventar palabras en tramos ininteligibles.
- Sesgo de dominio: el ajuste se realizo con cinco epocas en sinhala y cuatro epocas de cambio de codigo; el vocabulario, el acento y el registro cubiertos dependen por completo del dataset de entrenamiento, que no se describe.
- Degradacion potencial en idiomas no entrenados: aunque el modelo base es multilingue, el ajuste LoRA puede haber desplazado los pesos hacia los dos idiomas objetivo, reduciendo el rendimiento en otros idiomas. No se han publicado mediciones al respecto.
- Checkpoint "last" en lugar del mejor por validacion: puede no corresponder al punto optimo de rendimiento si hubo sobreajuste en las ultimas epocas.
- Limitacion de contexto: ventanas de 30 segundos y 448 tokens de decodificacion; los audios largos requieren chunking con solapamiento, lo que puede introducir errores en las fronteras.
- Requisito de audio a 16 kHz: el uso de frecuencias de muestreo distintas sin remuestreo degrada la transcripcion.
- Sin soporte declarado de tool calling ni de agentes, lo que limita su integracion en flujos que requieran estructurar la salida o invocar funciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anonymous-asr-review/whisper-small-r48-si5-cs4-seed123
- Modelo base: https://huggingface.co/openai/whisper-small
- Libreria PEFT: https://huggingface.co/docs/peft/index
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio de Whisper de OpenAI: https://github.com/openai/whisper
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces encontrados correspondian al colectivo hacktivista Anonymous, a una marca de calzado y a articulos no relacionados, por lo que se han descartado.
