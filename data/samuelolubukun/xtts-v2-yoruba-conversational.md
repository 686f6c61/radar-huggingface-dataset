# samuelolubukun/xtts-v2-yoruba-conversational

## Resumen

XTTS-v2 Yoruba Conversational es un ajuste fino del modelo de síntesis de voz Coqui XTTS-v2, adaptado específicamente al yoruba conversacional (`yo`). Lo desarrolla el usuario samuelolubukun y representa la etapa 2 de una estrategia de entrenamiento en dos fases: parte de un modelo fundacional entrenado sobre audio de OpenBible y lo readapta sobre el split yoruba del dataset Nigerian Common Voice para sustituir la cadencia rígida de recitación bíblica por un ritmo coloquial y fluido.

El modelo mantiene la arquitectura original de XTTS-v2 —un codificador de texto/mel autoregresivo tipo GPT combinado con un vocoder de espectrograma basado en VAE discreto— con 521,8 millones de parámetros. Incorpora un tokenizador BPE extendido con la etiqueta de idioma `[yo]` y un vocabulario ampliado de 9.987 tokens, pensado para manejar correctamente la ortografía yoruba con diacríticos (`ẹ, ọ, ṣ`) y los marcadores tonales (alto/medio/bajo).

Es relevante porque aborda una carencia concreta en TTS para lenguas africanas: los modelos fundacionales entrenados con corpus religiosos producen una prosodia artificial en contextos conversacionales. Este ajuste reduce la duración media de las locuciones un 42% y mejora la coarticulación silábica del 52% al 91%, según las métricas declaradas por el autor. Está publicado con la licencia Coqui Public Model License (CPML).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coqui XTTS-v2 (codificador de texto/mel autoregresivo tipo GPT + vocoder de espectrograma con VAE discreto) |
| Parametros totales | 521,8 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | yoruba (`yo`) |
| Licencia | Coqui Public Model License (CPML); la model card la etiqueta como `coqui-mrcul` y enlaza a https://coqui.ai/cpml |
| Formato de pesos | checkpoint PyTorch y archivos de configuracion (formato no detallado de forma explicita en la model card); tamano del repositorio: 5,9 GB |
| Tokenizador | BPE extendido con etiqueta `[yo]`, vocabulario de 9.987 tokens |
| Modelo base | samuelolubukun/xtts-v2-yoruba-openbible (etapa 1, 31.360 pasos) |
| Tarea (pipeline) | text-to-speech |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de XTTS-v2: un codificador autoregresivo de texto y mel-espectrograma de tipo GPT acoplado a un decodificador de espectrograma basado en VAE discreto que actúa como vocoder. Esta combinación permite clonación de voz y síntesis expresiva a partir de audio de referencia. El ajuste conserva la estructura original e incorpora un tokenizador BPE extendido con la etiqueta de idioma `[yo]` y un vocabulario de 9.987 tokens para representar adecuadamente los diacríticos y tonos del yoruba.

El entrenamiento se organizó en dos etapas. La etapa 1 (modelo fundacional) se entrenó durante 8 épocas y 31.360 pasos sobre audio de alta fidelidad de OpenBible, para fijar la ortografía yoruba, los diacríticos y la fonética estable. La etapa 2, que corresponde a este modelo, readaptó ese checkpoint sobre el split yoruba del dataset `benjaminogbonna/nigerian_common_voice_dataset`, con 2.367 muestras de audio conversacional filtradas por duración, calidad y presencia de diacríticos válidos. El ajuste se realizó durante 5 épocas y 7.895 pasos de optimización, con una tasa de aprendizaje conservadora de 1,5e-6, acumulación de gradiente de 4 y tamaño de lote de 2, sobre una GPU NVIDIA A10G de 24 GB. No se menciona RLHF ni DPO: la adaptación es un ajuste supervisado directo destinado a evitar el olvido catastrófico.

## Capacidades

- Sintesis de voz (text-to-speech) en yoruba conversacional.
- Clonacion de voz a partir de audio de referencia.
- Manejo de ortografia yoruba con diacriticos (`ẹ, ọ, ṣ`).
- Reproduccion de los tres niveles tonales del yoruba (alto, medio, bajo).
- Prosodia conversacional: entonacion de pregunta y glides tonales de tres niveles.
- Coarticulacion silabica fluida (union natural de palabras en frases coloquiales).
- No se documentan en la model card capacidades de tool calling, agentes, vision ni audio de entrada.

## Casos de uso

- Audiolibros y narracion en yoruba: el modelo sintetiza texto largo con una cadencia natural, evitando el ritmo lento de recitacion biblica del modelo fundacional (reduccion del 42% en duracion media de locucion).
- Asistentes de voz en yoruba: al dominar la entonacion de pregunta y la coarticulacion coloquial, es adecuado para dialogos de pregunta-respuesta en interfaces conversacionales.
- Doblaje y localizacion de contenido: la clonacion de voz permite doblar videos o cursos a yoruba manteniendo una voz de referencia concreta.
- Accesibilidad para personas con discapacidad visual: lectura en voz alta de textos digitales con pronunciacion tonal correcta.
- Contenido educativo interactivo: generacion de material de audio para ensenanza del yoruba, aprovechando la distincion tonal precisa.
- Preservacion linguistica: produccion de corpus de audio sintetico en yoruba conversacional para documentacion y estudio de la lengua.
- Integracion en aplicaciones de noticias o podcasts: sintesis de boletines o resumenes con una entonacion natural y fluida en lugar de recitativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card proporciona curvas de convergencia del entrenamiento y una evaluacion acustica comparativa entre la etapa 1 y la etapa 2.

Progresion del entrenamiento de adaptacion:

| Fase / paso | Paso global | Perdida total | Perdida CE de texto | Perdida de mel-espectrograma |
|---|---|---|---|---|
| Inicio de adaptacion | 0 | 0,9682 | 0,0461 | 3,8420 |
| Mitad de epoca 2 | 2.650 | 0,8696 | 0,0460 | 3,4325 |
| Mitad de epoca 4 | 5.500 | 0,8411 | 0,0430 | 3,3215 |
| Final de adaptacion | 7.895 | 0,8298 | 0,0385 | 3,2082 |

Evaluacion acustica frente a la etapa 1 (hablantes de test no vistos de Common Voice):

| Metrica | Etapa 1 (fundacional) | Etapa 2 (este modelo) | Impacto |
|---|---|---|---|
| Ritmo en clausulas complejas | 17,64 s (arrastrado) | 6,12 s (tempo natural) | -65% |
| Duracion media de locucion | 8,81 s | 5,09 s | -42% |
| Oscilacion tonal dinamica (desv. tipica) | 31,3 Hz | 38,3 Hz | +22,3% |
| Coarticulacion silabica | 52,0% | 91,0% | mejora de 39 puntos |

## Requisitos de hardware

- El entrenamiento de adaptacion se realizo sobre una NVIDIA A10G de 24 GB VRAM.
- VRAM estimada para inferencia: no disponible de forma explicita; con 521,8 millones de parametros, la inferencia en FP16 requiere del orden de 1-2 GB solo para los pesos, mas la sobrecarga del vocoder y del decodificador de mel. Conviene disponer de al menos 4-6 GB de VRAM para operar con comodidad (estimacion, no dato confirmado).
- El tamano total del repositorio es de 5,9 GB, lo que incluye pesos, tokenizador extendido y archivos de configuracion.
- GPU recomendadas: no especificadas en la model card. Al ser un modelo de ~522M de parametros, deberia caber en GPU de consumo como RTX 3060 (12 GB) o superiores; tambien es viable en GPU de datacenter (A10G, A100, H100) para mayor throughput.
- Opciones de despliegue: la model card no las detalla. XTTS-v2 se usa habitualmente a traves de la libreria Coqui TTS (o su fork mantenido `coqui-tts`), tanto en GPU como en CPU. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no estan orientados a TTS en este formato.
- Latencia y throughput: no disponibles. Al tratarse de una arquitectura autoregresiva, la latencia depende del hardware y de la longitud del texto.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| XTTS-v2 Yoruba Conversational (este modelo) | 521,8 M | yoruba (`yo`) | no disponible | CPML (coqui-mrcul) | Etapa 2, adaptado a Common Voice conversacional |
| samuelolubukun/xtts-v2-yoruba-openbible (etapa 1) | 521,8 M | yoruba (`yo`) | no disponible | CPML (coqui-mrcul) | Modelo fundacional sobre OpenBible; prosodia mas rigida y recitativa |
| Coqui XTTS-v2 base | 521,8 M | multilingue (segun el modelo original) | no disponible | CPML | Modelo original del que derivan los anteriores; no especializado en yoruba conversacional |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos: el modelo se adapta sobre un unico corpus (Common Voice, split yoruba) filtrado a 2.367 muestras; la diversidad de acentos, edades y registros puede ser limitada.
- Riesgo de alucinacion acustica: como todo modelo TTS generativo, puede producir artefactos de audio, pronunciaciones incorrectas o inestabilidad en la clonacion de voz con referencias de baja calidad.
- Limitaciones de contexto: no se especifica una longitud maxima de texto de entrada; la ventana de contexto no esta documentada.
- Limitaciones de idioma: solo soporta yoruba (`yo`); no hay soporte multilingue confirmado.
- Licencia: la Coqui Public Model License (CPML) impone condiciones de uso; es imprescindible revisar https://coqui.ai/cpml antes de cualquier despliegue, especialmente si es comercial.
- Dependencia de tonos y diacriticos: la calidad depende de que el texto de entrada incluya correctamente los diacriticos y marcas tonales; entradas sin ellos pueden degradar la pronunciacion.
- Herramienta base descontinuada: Coqui (empresa original) ceso su actividad; conviene verificar el mantenimiento de la libreria de inferencia utilizada.
- En produccion: no hay benchmarks publicados ni evaluacion MOS independiente, por lo que se recomienda validar la calidad con hablantes nativos antes de desplegar en un servicio en vivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/samuelolubukun/xtts-v2-yoruba-conversational
- Modelo base (etapa 1): https://huggingface.co/samuelolubukun/xtts-v2-yoruba-openbible
- Dataset de adaptacion: https://huggingface.co/datasets/benjaminogbonna/nigerian_common_voice_dataset/
- Dataset OpenBible (etapa 1): https://huggingface.co/datasets/multilingual-tts/open-bible
- Licencia Coqui Public Model License: https://coqui.ai/cpml
- Muestras de audio comparativas: https://huggingface.co/samuelolubukun/xtts-v2-yoruba-conversational/resolve/main/samples/sample1_ref.wav, https://huggingface.co/samuelolubukun/xtts-v2-yoruba-conversational/resolve/main/samples/sample1_stage1_openbible.wav, https://huggingface.co/samuelolubukun/xtts-v2-yoruba-conversational/resolve/main/samples/sample1_stage2_adapted.wav
- Grafica de convergencia: https://huggingface.co/samuelolubukun/xtts-v2-yoruba-conversational/resolve/main/training_curves.png
