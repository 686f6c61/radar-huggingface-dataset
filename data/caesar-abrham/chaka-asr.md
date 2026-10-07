# caesar-abrham/Chaka-ASR

## Resumen

Chaka-ASR es un modelo de reconocimiento automático del habla (ASR) especializado en amárico, desarrollado por el usuario de Hugging Face caesar-abrham. Se trata de un ajuste fino (finetune) del checkpoint badrex/Ethio-ASR-amharic, que a su vez deriva de la arquitectura facebook/w2v-bert-2.0. El modelo convierte audio mono a 16 kHz en texto en amárico y esta pensado para transcripcion, interfaces de voz y aplicaciones de habla en contextos etiopes, incluyendo entornos con ruido de fondo.

Tecnicamente es un Wav2Vec2-BERT con una cabeza de salida CTC, con aproximadamente 606 millones de parametros (606.098.651 segun los pesos en safetensors) y pesos publicados en float32. El ajuste se realizo sobre datos de habla amharica de Leyu, con ejemplos de WAXAL usados como replay durante el entrenamiento, y consta de 8.900 pasos de entrenamiento con particiones de train, validacion y test separadas por hablante.

Su relevancia actual es doble: por un lado cubre un idioma con recursos limitados dentro del ecosistema ASR, y por otro se publica bajo licencia CC BY 4.0, lo que permite uso comercial con atribucion. El unico resultado publicado es un WER del 20,48 % y un CER del 6,02 % sobre el subconjunto de test del dialecto de Addis Abeba del corpus Leyu, por lo que se trata de un modelo en fase temprana (19 descargas, 0 likes en el momento de la consulta) mas orientado a evaluacion y prototipado que a produccion sin validacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2-BERT con cabeza de salida CTC |
| Parametros totales | 606.098.651 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (procesa el audio como clip completo; la model card no especifica ventana maxima) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en float32; no hay versiones GGUF ni cuantizadas documentadas) |
| Idiomas soportados | amharico (codigo `am`) |
| Licencia | CC BY 4.0 (permite uso comercial con atribucion) |
| Formato de pesos | safetensors, float32 |
| Entrada | audio mono a 16.000 Hz |
| Salida | texto en amharico |
| Tamano del repositorio | 2,4 GB |
| Libreria | transformers (configuracion registrada para la version 5.16.1) |
| Modelo base | badrex/Ethio-ASR-amharic (finetune) |

## Arquitectura y entrenamiento

Chaka-ASR emplea la arquitectura Wav2Vec2-BERT, heredada del modelo preentrenado facebook/w2v-bert-2.0, y anade una cabeza de clasificacion CTC para la transcripcion. La entrada es audio mono remuestreado a 16 kHz y la decodificacion del ejemplo oficial es CTC greedy, sin beam search ni modelo de lenguaje externo. El checkpoint parte de badrex/Ethio-ASR-amharic, un modelo del proyecto Ethio-ASR, de modo que Chaka-ASR no se entrena desde cero: es una adaptacion adicional sobre ese punto de partida.

El ajuste utilizo los conjuntos de habla amharica de Leyu, con ejemplos muestreados de WAXAL empleados como datos de replay para mitigar el olvido catastrofico. La model card registra 8.900 pasos de entrenamiento y particiones de entrenamiento, validacion y test separadas por hablante, lo que reduce el riesgo de filtracion de hablante entre splits. No se documentan en la informacion disponible detalles como el numero total de tokens de audio, la composicion exacta del dataset, la estrategia de mascara temporal ni si hubo etapas de RLHF o DPO (en un modelo CTC de ASR no serian de aplicacion directa). Tampoco se describe ninguna innovacion tecnica adicional mas alla de la combinacion de finetune y replay.

## Capacidades

- Transcripcion de voz en amharico a texto, con decodificacion CTC greedy.
- Procesamiento de audio mono remuestreado a 16 kHz; el ejemplo oficial convierte estereo a mono automaticamente.
- Funcionamiento en GPU NVIDIA con CUDA y tambien en CPU cuando no hay GPU disponible.
- Diseno orientado a entornos con ruido de fondo, aunque sin benchmark de robustez al ruido publicado.
- Uso en interfaces de voz y aplicaciones conversacionales segun los usos previstos declarados por el autor.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo de razonamiento (thinking mode), vision ni audio generativo.
- Multilingue: no; esta limitado al amharico.
- No implementa streaming en vivo ni segmentacion de grabaciones largas en el ejemplo proporcionado.
- No realiza verificacion de identidad, importes ni contenido factual; solo produce transcripciones.

## Casos de uso

- Transcripcion de grabaciones en amharico: el modelo convierte archivos WAV o FLAC en texto mediante el script `examples/transcribe.py`, que gestiona la conversion a mono, el remuestreo a 16 kHz y la decodificacion greedy. Adecuado para digitalizar entrevistas, notas de voz o archivos de campo.
- Archivado y busqueda de contenido audiovisual: transcribir un corpus de audio en amharico para indexarlo y permitir busqueda textual sobre el contenido, partiendo de clips completos en lugar de streaming.
- Interfaces de voz para asistentes: integracion del modelo como etapa ASR en un pipeline de asistente que despues encadene traduccion, busqueda o sintesis, siempre que la grabacion se entregue como clip.
- Atencion al cliente en centros de contacto etiopes: transcripcion de llamadas grabadas para revision de calidad y analitica. Conviene validar antes el rendimiento con el ruido y los acentos reales del centro, dado que el unico dato publicado corresponde al dialecto de Addis Abeba.
- Accesibilidad: generacion de subtitulos en amharico para contenido formativo o institucional, con revision humana obligatoria por el WER del 20,48 % reportado.
- Investigacion en ASR de bajos recursos: uso como punto de partida para nuevos finetunes o como referencia en evaluaciones de reconocimiento de habla amharica, al ser un finetune reproducible de un checkpoint publico.
- Prototipado rapido de producto de voz: por tamano (606 M de parametros, 2,4 GB en float32) puede desplegarse en una sola GPU de gama media o incluso en CPU para pruebas de concepto.

## Benchmarks y rendimiento

| Dataset | WER (%) | CER (%) |
|---|---:|---:|
| Leyu (subconjunto de test del dialecto de Addis Abeba) | 20,48 | 6,02 |

Los valores proceden de la evaluacion registrada del checkpoint publicado. Segun la propia model card, corresponden a un subconjunto (dialecto de Addis Abeba) y no a una puntuacion agregada de todo el corpus Leyu, ni constituyen una comparacion directa contra el modelo de partida. La normalizacion de texto y la configuracion de decodificacion de la evaluacion original deben consultarse antes de reproducir o comparar estas cifras. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks en la informacion disponible, ya que no son aplicables a un modelo ASR.

## Requisitos de hardware

- VRAM estimada en float32: los pesos suman aproximadamente 2,4 GB; con activaciones y buffers de inferencia, alrededor de 3-4 GB.
- VRAM estimada en float16/bfloat16: en torno a 1,2 GB de pesos y unos 2 GB en total, si se convierte el checkpoint manualmente a media precision (no se distribuye una version ya convertida).
- VRAM estimada en int8: aproximadamente 0,6 GB de pesos, aunque no se documenta una receta de cuantizacion oficial.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA y al menos 4 GB de VRAM (GTX 1650, RTX 3050, T4) es suficiente para inferencia en float32; RTX 3060, RTX 4090, A100 o H100 aportan margen de sobra y mayor throughput por lotes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna con 4 GB o mas de VRAM; el ejemplo oficial tambien funciona en CPU.
- Opciones de despliegue: pipeline de `transformers` con PyTorch (ruta documentada por el autor) y ejecucion en CPU. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible, y no se publican pesos en formato GGUF.
- Latencia y throughput estimados: no disponibles. La model card no incluye mediciones de latencia, RTF ni throughput, y advierte que el ejemplo no implementa streaming ni segmentacion de grabaciones largas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| caesar-abrham/Chaka-ASR | 606.098.651 | audio mono a 16 kHz, clip completo | WER 20,48 % / CER 6,02 % en el subconjunto de Addis Abeba de Leyu | CC BY 4.0 | Hugging Face, safetensors float32 |
| badrex/Ethio-ASR-amharic | no disponible | no disponible | no disponible | no disponible | Hugging Face (modelo base de este finetune) |
| facebook/w2v-bert-2.0 | no disponible | audio a 16 kHz (modelo preentrenado, multilingue) | no disponible | no disponible | Hugging Face (arquitectura y preentrenamiento subyacentes) |

No se dispone de resultados comparativos directos entre Chaka-ASR y sus antecesores en la informacion proporcionada: la propia model card indica que los valores de WER y CER no constituyen una comparacion contra el modelo de partida. Las busquedas web realizadas no devolvieron informacion relevante sobre este modelo ni sobre alternativas comparables de ASR en amharico.

## Limitaciones y advertencias

- La calidad de reconocimiento varia con el dialecto, las condiciones de grabacion, el estilo de habla y la presencia de habla solapada.
- Nombres propios, numeros, abreviaturas y habla con mezcla de idiomas pueden requerir revision adicional.
- El modelo solo transcribe; no verifica identidad, importes ni contenido factual, por lo que no debe usarse como sistema de verificacion.
- El WER del 20,48 % y el CER del 6,02 % corresponden a un subconjunto concreto (dialecto de Addis Abeba de Leyu) y no deben tratarse como rendimiento garantizado para cualquier grabacion en amharico.
- No existe un benchmark especifico de robustez frente a ruido: el modelo esta pensado para entornos ruidosos, pero el rendimiento real depende de la colocacion del microfono, la claridad del habla, la reverberacion y el tipo y nivel de ruido. Es imprescindible evaluar con grabaciones representativas del entorno de despliegue.
- Sesgos conocidos: no se documentan en la informacion disponible, mas alla del sesgo implicito del corpus de entrenamiento (predominantemente Leyu y WAXAL, con un subconjunto evaluado de dialecto de Addis Abeba).
- Riesgo de alucinacion: en un modelo CTC la salida esta acotada a las clases del vocabulario, pero puede producir transcripciones incorrectas o palabras espuriamente segmentadas en audio ruidoso o ininteligible.
- Limitacion de idioma: el modelo solo soporta amharico; no se documenta soporte para otras lenguas etiopes ni para cambio de idioma.
- El ejemplo oficial no implementa streaming ni segmentacion de grabaciones largas, lo que limita su uso en tiempo real sin trabajo adicional de troceado.
- La dependencia declarada es `transformers` 5.16.1 como minimo; conviene verificar la compatibilidad en el entorno de destino antes de pasar a produccion.
- Licencia CC BY 4.0: permite compartir y adaptar el modelo, incluido uso comercial, siempre que se atribuya correctamente, se enlace a la licencia y se indique si se han introducido cambios. No hay clausulas de uso restrictivo adicionales documentadas, pero al ser un finetune de otro modelo conviene revisar tambien las condiciones del checkpoint base y del modelo upstream.
- Madurez temprana: 19 descargas y 0 likes en el momento de la consulta, sin comunidad activa ni validaciones externas publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/caesar-abrham/Chaka-ASR
- Modelo base: https://huggingface.co/badrex/Ethio-ASR-amharic
- Arquitectura y modelo preentrenado upstream: https://huggingface.co/facebook/w2v-bert-2.0
- Coleccion Ethio-ASR: https://huggingface.co/collections/badrex/ethio-asr
- Datasets de habla amharica de Leyu: https://huggingface.co/leyu-amharic
- Dataset WAXAL (datos de replay): https://huggingface.co/datasets/google/WaxalNLP
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Tab de comunidad del modelo: https://huggingface.co/caesar-abrham/Chaka-ASR/discussions
- Citacion (BibTeX): disponible en la model card, entrada `chaka_asr_2026`, autor caesar-abrham, ano 2026.
