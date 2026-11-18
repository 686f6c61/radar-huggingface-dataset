# alphaedge-ai/whisper-large-v3-turbo-sun-16384

## Resumen

whisper-large-v3-turbo-sun-16384 es una variante podada (*trimmed*) de openai/whisper-large-v3-turbo, publicada por alphaedge-ai y especializada en sundanés (codigo ISO `su`). El modelo aplica la tecnica de trimming sobre el vocabulario del tokenizer: reduce el vocabulario de 51.865 a 16.384 tokens (un 68,41% menos) y, en consecuencia, el numero de parametros de 808.878.080 a 763.461.120 (una reduccion del 5,61%). El resultado es un checkpoint de 1,5 GB en formato safetensors que conserva la arquitectura y los pesos del modelo base salvo por la contraccion de la capa de embedding y de la proyeccion de salida del decodificador.

El modelo resuelve un problema muy concreto: desplegar reconocimiento automatico del habla (ASR) en sundanés con una huella de memoria menor y un vocabulario ajustado al idioma, sin reentrenar el modelo desde cero. La poda se guio minando 102.316 textos del dataset lbourdois/fineweb-2-trimming para identificar que tokens del vocabulario original son realmente frecuentes en sundanés y cuales pueden eliminarse. Es relevante para equipos que necesitan ASR de bajo coste en una lengua de bajos recursos y que trabajan con la libreria transformers.

La contrapartida es explicita en la model card: al eliminar tokens poco usados en sundanés, el modelo deja de ser multilingue en la practica y puede degradarse gravemente en otros idiomas. Se distribuye bajo licencia Apache 2.0, con 36 descargas y sin likes en el momento de la consulta, lo que indica un uso muy incipiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo), con vocabulario podado |
| Parametros totales | 763.461.120 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper; no se especifica en la informacion) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors sin cuantizar) |
| Idiomas soportados | sundanés (`su`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper large-v3-turbo: un transformer encoder-decoder con atencion estandar, entrenado originalmente por OpenAI con supervision debil a gran escala (paper arXiv:2212.04356). El modelo base turbo reduce el numero de capas del decodificador respecto a large-v3 para ganar velocidad de inferencia. Esta variante no reentrena el modelo: parte de los pesos de openai/whisper-large-v3-turbo y aplica trimming, es decir, elimina filas del embedding de entrada y de la proyeccion de salida correspondientes a tokens que no aparecen con frecuencia en el corpus objetivo, y reindexa el vocabulario resultante a 16.384 entradas.

La seleccion de tokens se hizo minando 102.316 textos en sundanés del dataset lbourdois/fineweb-2-trimming. No se documentan en la informacion disponible fases de RLHF, DPO ni ajuste fino adicional sobre audio; el modelo conserva los pesos acusticos del original y solo cambia la capa lexica. La innovacion tecnica, por tanto, es la metodologia de trimming descrita en el blog de Hugging Face, no una mejora arquitectonica propia. La model card no aporta detalles sobre la composicion exacta del dataset de minado ni sobre posibles ajustes de calibracion tras la poda.

## Capacidades

- Transcripcion de voz a texto (ASR) en sundanés, con la pipeline `automatic-speech-recognition` de transformers.
- Entrada de audio a 16 kHz, tal como exige Whisper; el ejemplo oficial usa librosa para el resampleo.
- Generacion de transcripciones con `generate_kwargs` para fijar idioma (`sundanese`) y tarea (`transcribe`).
- Compatible con endpoints de Hugging Face (tag `endpoints_compatible`) y con la region EU (tag `region:eu`).
- No se documenta soporte de traduccion a ingles, tool calling, agentes, vision ni audio en streaming.
- Capacidad multilingue efectivamente anulada: el vocabulario podado elimina tokens de otras lenguas.

## Casos de uso

- Subtitulado automatico de contenido audiovisual en sundanés: el modelo transcribe audio a 16 kHz y devuelve texto plano listo para generar ficheros de subtitulos, con una huella de 1,5 GB que simplifica el despliegue en servidores modestos.
- Transcripcion de reuniones y entrevistas en sundanés: al conservar la arquitectura encoder-decoder de Whisper, procesa segmentos de audio de hasta 30 s y permite encadenar ventanas para conversaciones largas.
- Archivado y busqueda de material oral: transcripcion masiva de grabaciones para indexar contenido en sundanés y habilitar busqueda textual sobre archivos de audio historicos.
- Asistentes de voz para atencion ciudadana en Indonesia: integracion en IVR o chatbots de voz que necesiten reconocer sundanés con un modelo ligero y de licencia permisiva.
- Investigacion en lenguas de bajos recursos: punto de partida para experimentos de ASR en sundanés y para comparar el impacto del trimming frente al modelo original completo.
- Despliegue en el borde o en contenedores pequenos: el checkpoint de 1,5 GB y los 763 M de parametros permiten servirlo en infraestructura con recursos limitados, siempre que se acepte la perdida de cobertura multilingue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye WER, MMLU ni ninguna otra metrica comparativa; solo documenta las cifras de reduccion de vocabulario y parametros (51.865 a 16.384 tokens y 808.878.080 a 763.461.120 parametros).

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 3 GB solo para pesos (763 M de parametros), mas activaciones y cache de atencion.
- VRAM estimada en fp16/bf16: alrededor de 1,5-2 GB para pesos, con margen adicional para el procesamiento de audio.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM; una RTX 3060, RTX 4060 o superior es suficiente. Para lotes grandes, A10G, L4 o A100 ofrecen mayor throughput.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna con 4-6 GB de VRAM.
- Opciones de despliegue: transformers (soporte oficial), pipeline de `automatic-speech-recognition`, endpoints de Hugging Face. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| alphaedge-ai/whisper-large-v3-turbo-sun-16384 | 763.461.120 | no disponible (audio 30 s) | sundanés | Apache 2.0 | Vocabulario podado a 16.384 tokens |
| openai/whisper-large-v3-turbo | 808.878.080 | no disponible (audio 30 s) | multilingue (99 idiomas) | Apache 2.0 | Modelo base sin podar; mayor cobertura idiomatica |
| openai/whisper-large-v3 | no disponible en esta informacion | no disponible (audio 30 s) | multilingue | Apache 2.0 | Mayor calidad que turbo a costa de mas computo |

La comparativa se limita al linaje Whisper porque la informacion proporcionada no incluye otros modelos ASR especializados en sundanés.

## Limitaciones y advertencias

- El trimming elimina tokens de otros idiomas: el modelo no debe usarse para transcribir lenguas distintas del sundanés, donde el rendimiento puede ser muy deficiente.
- No se han publicado evaluaciones de calidad (WER) tras la poda; la model card solo afirma que "deberia comportarse de forma similar" al original, sin evidencia empirica.
- Riesgo de alucinacion tipico de Whisper en segmentos de silencio o audio ruidoso, agravado por la reduccion del vocabulario.
- Sesgos heredados del entrenamiento original de Whisper con supervision debil a gran escala, no documentados especificamente para este checkpoint.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo es una publicacion de un tercero sobre el modelo de OpenAI.
- Actividad muy baja en el repositorio (36 descargas, 0 likes) y sin comunidad que valide su calidad en produccion.
- No se documentan cuantizaciones oficiales; habria que generarlas a partir de los safetensors, con el riesgo de degradacion adicional.
- La fecha de creacion indicada (2026) es coherente con el ecosistema de trimming descrito, pero conviene verificar la vigencia del checkpoint antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/whisper-large-v3-turbo-sun-16384
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog de introduccion al trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Paper de Whisper: https://arxiv.org/abs/2212.04356
