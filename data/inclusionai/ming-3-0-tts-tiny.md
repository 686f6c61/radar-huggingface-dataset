# inclusionAI/Ming-3.0-tts-tiny

## Resumen

Ming-3.0-tts-tiny es un modelo de síntesis de voz (text-to-speech) multilingüe desarrollado por inclusionAI (Ant Group), publicado en Hugging Face bajo licencia MIT. Se trata del checkpoint "tiny" de la familia Ming-3.0-tts, construido sobre el backbone Ling V3 con una arquitectura de mezcla de expertos (MoE): la model card declara 7,9 mil millones de parámetros totales con aproximadamente 1,3 mil millones activos por token, mientras que los pesos publicados en safetensors suman 8.981.004.468 parámetros (el repositorio incluye además tokenizador de audio, encoder de hablante y tokenizador de texto). El pipeline declarado es `text-to-speech` y el repositorio ocupa 18,0 GB.

El modelo resuelve generación de habla con control fino: clonación de voz zero-shot a partir de un clip de referencia corto, diseño de voz a partir de una descripción en lenguaje natural, control libre de estilo y locución, control explícito de emoción, velocidad, tono y volumen, y etiquetas inline para sonidos paralingüísticos (respiración, tos, suspiro, risa, duda, sorpresa). Cubre siete idiomas (chino, inglés, alemán, español, francés, coreano y japonés) más dos dialectos chinos (sichuanés y cantonés).

Su relevancia actual radica en dos factores: por un lado, la licencia MIT sobre los pesos, poco habitual en modelos de clonación de voz de esta escala; por otro, la combinación de un backbone MoE con ~1,3 B de parámetros activos, que busca reducir el coste de inferencia frente a modelos densos equivalentes. Es importante señalar que este repositorio de Hugging Face es solo de distribución de checkpoints: la inferencia requiere clonar el repositorio de GitHub del proyecto y usar su entorno fijado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) sobre backbone Ling V3 |
| Parametros totales | 8.981.004.468 en los pesos publicados (safetensors); la model card declara 7,9 B en el backbone Ling V3 |
| Parametros activos | Aproximadamente 1,3 B por token |
| Longitud de contexto | No disponible (no se documenta la longitud máxima de audio de referencia ni de texto de entrada) |
| Tipos de cuantizacion | Runtime publicado en bf16 con estado recurrente en fp32; el repositorio incluye artefactos ONNX; no se documentan GGUF, AWQ ni GPTQ |
| Idiomas soportados | Chino (zh), ingles (en), aleman (de), espanol (es), frances (fr), coreano (ko), japones (ja); dialectos: sichuanes (川渝话) y cantones (广粤话) |
| Licencia | MIT |
| Formato de pesos | Safetensors (sharded) y ONNX |

Otros datos tecnicos: API Python `ming_tiny.MingTinyTTS`, CLI `infer_tiny.py`, protocolo de prompt `thinking_v1`, tarea de pipeline `text-to-speech`, etiquetas del repositorio: `feature-extraction`, `audio`, `voice-cloning`, `mixture-of-experts`, `custom_code`.

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE) sobre el backbone Ling V3, con 7,9 B de parámetros declarados en el backbone y ~1,3 B activos por token. El repositorio distribuye, junto a los pesos del modelo, un tokenizador de audio, un encoder de hablante (para la clonación de voz y el diseño de voz) y un tokenizador de texto. El runtime de liberación configura bf16 para los pesos, un bucle MoE "portable" y estado recurrente en fp32, lo que sugiere un componente autoregresivo con estado recurrente en la generación de tokens de audio y un decodificador de flujo (flow matching) con `flow_steps=10` y `sigma=0,25` por defecto para convertir latentes en waveform.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF/DPO o ajuste por preferencias. Tampoco se documentan innovaciones de decodificación especulativa ni mecanismos de atención lineal. La model card únicamente describe la topología MoE, el backbone Ling V3 y los parámetros de generación por defecto (`cfg_scale=2.0`, `temperature=0`, `flow_steps=10`, `sigma=0.25`).

## Capacidades

- Clonación de voz zero-shot a partir de un clip de referencia corto, con texto de referencia asociado.
- Diseno de voz (voice design) a partir de una descripcion del hablante en lenguaje natural, sin audio de referencia.
- Control libre de estilo y forma de locucion mediante instrucciones en texto (`task="freeform"`).
- Control explicito de emocion, velocidad, tono y volumen (`task="emotion"`, `task="basic"`).
- Mas de 100 voces integradas en chino y cinco voces integradas en ingles (tarea `ip`).
- Sintesis multilingue en zh, en, de, es, fr, ko y ja (tarea `multilingual`, con `target_language` obligatorio).
- Control de dialectos: sichuanes (川渝话) y cantones (广粤话) mediante `task="dialect"`.
- Catorce etiquetas inline para respiracion, tos, suspiro, risa, duda, sorpresa y sonidos de pregunta/confirmacion, en chino o ingles (tarea `paralinguistic`).
- Dialogo multi-hablante a partir de un guion con referencias de voz por hablante (tarea `podcast`, con prefijos `speaker_N:` al inicio de cada linea).
- Generacion de habla con protocolo de prompt `thinking_v1`.
- No se documentan capacidades de tool calling, uso de agentes, vision ni audio de entrada mas alla del clip de referencia para clonacion.

## Casos de uso

- **Doblaje y localizacion multilingue**: un mismo guion puede sintetizarse en espanol, aleman, frances, coreano o japones conservando la voz del hablante original mediante clonacion zero-shot, lo que simplifica la produccion de versiones por mercado sin estudio de doblaje por idioma.
- **Audiolibros y contenido editorial**: la ventana de control por emocion, velocidad, tono y volumen permite ajustar la locucion por capitulos o personajes; las etiquetas paralinguisticas (suspiro, risa, respiracion) aportan naturalidad en narrativa de ficcion.
- **Podcasts y dialogos sinteticos**: la tarea `podcast` acepta un guion con `speaker_N:` y una referencia de voz por hablante, de modo que se puede generar una conversacion multi-turno coherente con voces distintas y consistentes entre lineas.
- **Prototipado de voces de marca**: la tarea `voice_design` genera una voz a partir de una descripcion en lenguaje natural, util para pruebas de concepto de identidad sonora antes de invertir en una locucion profesional o en un modelo entrenado a medida.
- **Asistentes de voz y atencion al cliente**: el control explicito de emocion y velocidad permite adaptar el tono del agente segun el contexto de la conversacion (por ejemplo, ritmo mas lento en instructiones de soporte tecnico), y la salida en siete idiomas cubre lineas de atencion internacionales.
- **Accesibilidad y lectura de documentos**: sintesis de textos largos con velocidad ajustable y voces integradas en chino e ingles para lectores de pantalla o conversion de articulos y documentacion tecnica a audio.
- **Contenido para mercado sinofono**: el soporte de sichuanes y cantones, junto con mas de 100 voces en chino, permite generar material de formacion o marketing para regiones donde el mandarin estandar no es la variedad preferida.
- **Investigacion en habla**: al publicarse bajo MIT con tokenizador de audio y encoder de hablante incluidos, sirve como base para experimentos de clonacion, control paralinguistico y evaluacion de arquitecturas MoE aplicadas a TTS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (WER/CER, similitud de hablante, MOS, CMOS) ni comparaciones numericas con otros sistemas TTS, y los resultados de busqueda web proporcionados no contienen informacion tecnica sobre el modelo.

## Requisitos de hardware

- **VRAM estimada para inferencia**: los pesos en bf16 ocupan del orden de 18 GB (el repositorio completo son 18,0 GB, incluidos tokenizador de audio, encoder de hablante y tokenizador de texto). A esa cifra hay que sumar el estado recurrente en fp32 y el decodificador de flujo, por lo que se debe prever un margen adicional; no se publica una cifra oficial de VRAM pico.
- **GPU recomendadas**: el autor recomienda NVIDIA H800 para inferencia. Por capacidad, H100 (80 GB) y A100 (80 GB) son opciones equivalentes o superiores.
- **GPU de consumo**: en bf16, una RTX 4090 o RTX 3090 de 24 GB queda en el limite y no esta confirmado por el autor; tarjetas de 16 GB no admiten los pesos en bf16. No se documentan pesos cuantizados de 8 o 4 bits que permitan bajar de ese umbral.
- **Opciones de despliegue**: no se mencionan vLLM, TGI, llama.cpp ni Ollama. El unico camino soportado es el repositorio de GitHub `inclusionAI/Ming-3.0-tts` con su entorno fijado: Python 3.10.15, PyTorch y torchaudio 2.7.1+cu118 y `transformers==4.46.3`, instalando `requirements-tiny.txt` en un entorno dedicado (las dependencias difieren de las de la variante de 0,5 B). Interfaces disponibles: CLI `infer_tiny.py` y API Python `ming_tiny.MingTinyTTS`.
- **Latencia y throughput**: no se publican cifras de RTF ni de tokens de audio por segundo. Los unicos parametros conocidos que afectan al coste son `flow_steps=10` (valor por defecto del decodificador de flujo) y `cfg_scale=2.0`, que implica evaluacion con clasificador libre de guia y, por tanto, del orden del doble de pasos de modelo por token respecto a una generacion sin guia.

## Comparativa con modelos similares

Los datos de las alternativas provienen de su documentacion publica y no de una evaluacion comun; no se dispone de comparaciones de calidad objetivas entre ellos.

| Modelo | Desarrollador | Parametros | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Ming-3.0-tts-tiny | inclusionAI (Ant Group) | 7,9 B declarados en backbone, ~1,3 B activos (MoE); 8,98 B en pesos publicados | 7 + 2 dialectos chinos | MIT | Clonacion zero-shot, voice design, paralinguistico, podcast multi-hablante |
| XTTS-v2 | Coqui | ~0,47 B (dato de documentacion publica) | 17 | Coqui Public Model License (restricciones de uso comercial) | Clonacion zero-shot multilingue; proyecto original discontinuado |
| CosyVoice 2 | Alibaba (FunAudioLLM) | ~0,5 B (dato de documentacion publica) | Chino e ingles principalmente | Apache 2.0 | Clonacion y control de instrucciones; ecosistema con soporte de despliegue |
| F5-TTS | Proyecto academico (SWivid et al.) | ~0,34 B (dato de documentacion publica) | Chino e ingles | Codigo MIT; pesos con licencia no comercial (verificar en el repositorio) | TTS por flow matching, sin encoder de hablante separado |

Frente a estas alternativas, Ming-3.0-tts-tiny apuesta por una escala mucho mayor con activacion dispersa (MoE), lo que en teoria reduce el coste por token frente a un denso de 8 B, y por una licencia MIT mas permisiva que la de XTTS-v2. En contrapartida, su ecosistema de despliegue es mas cerrado (sin soporte documentado en vLLM, llama.cpp u Ollama) y no hay metricas publicas que permitan situarlo frente a CosyVoice 2 o F5-TTS en calidad de sintesis o similitud de hablante.

## Limitaciones y advertencias

- **Ausencia de benchmarks**: no hay metricas publicadas de inteligibilidad, similitud de hablante ni MOS, por lo que la calidad real por idioma no puede evaluarse a priori.
- **Idiomas desiguales**: la cobertura de voces integradas es muy asimetrica (mas de 100 en chino frente a cinco en ingles); no se documenta la calidad en espanol, aleman, frances, coreano o japones, que probablemente este por debajo de la de chino e ingles.
- **Riesgo de alucinacion acustica**: como todo modelo generativo de habla, puede producir artefactos, prosodia incorrecta, omisiones o repeticiones en textos largos, numeros, siglas y nombres propios; requiere validacion automatica (ASR de retorno) en produccion.
- **Clonacion de voz y deepfakes**: la licencia MIT permite uso comercial, pero eso no otorga derechos sobre las voces clonadas. Es necesario obtener consentimiento explicito del hablante y cumplir la normativa aplicable (por ejemplo, el Reglamento de IA de la UE en materia de transparencia y etiquetado de contenido sintetico).
- **Dependencia de un entorno fijado**: la inferencia exige Python 3.10.15, torch 2.7.1+cu118 y `transformers==4.46.3`, versiones distintas de las de la variante de 0,5 B de la misma familia; la model card advierte explicitamente de que el repositorio de Hugging Face no es autonomo para inferencia.
- **Sin cuantizacion documentada**: no se publican pesos en 8 o 4 bits ni soporte en runners ligeros, lo que limita el despliegue en GPU de consumo y en CPU.
- **Contexto y duracion no documentados**: se desconoce la longitud maxima de texto por llamada y la duracion maxima del audio de referencia, lo que complica dimensionar pipelines de contenido largo.
- **Restricciones de combinacion de tareas**: la model card indica que la tarea `freeform` siempre requiere clip de referencia y no puede combinarse con diseno de voz, voz integrada, emocion, dialecto ni controles de atributos; la tarea `basic` no acepta texto de referencia y `seed`/`multilingual`/`paralinguistic` lo exigen. Estas restricciones deben reflejarse en la capa de validacion de la aplicacion.
- **Licencia de componentes**: aunque los pesos son MIT, conviene verificar la procedencia de los datos de entrenamiento del tokenizador de audio y del encoder de hablante antes de un despliegue comercial a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inclusionAI/Ming-3.0-tts-tiny
- Repositorio GitHub (inferencia): https://github.com/inclusionAI/Ming-3.0-tts
- Dependencias de la variante tiny: https://github.com/inclusionAI/Ming-3.0-tts/blob/main/requirements-tiny.txt
- Blog y demos: https://nomorecoding.github.io/Ming-3.0-tts/
- ModelScope: https://modelscope.cn/models/inclusionAI/Ming-3.0-tts-tiny

Nota: los resultados de busqueda web proporcionados no contienen enlaces relevantes al modelo; corresponden a consultas sobre Visual Studio Code y Microsoft Visual C++ Runtime Library.
