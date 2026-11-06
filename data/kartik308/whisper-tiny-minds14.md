# kartik308/whisper-tiny-minds14

## Resumen

whisper-tiny-minds14 es un ajuste fino (fine-tuning) del modelo de reconocimiento automático del habla openai/whisper-tiny sobre el conjunto de datos PolyAI/minds14, un corpus de grabaciones de audio de consultas bancarias reales en ingles. Lo publica el usuario kartik308 en Hugging Face y esta pensado como una demostracion de transferencia de un modelo ASR generico y muy pequeno (37,7 millones de parametros) a un dominio vertical concreto: la atencion al cliente en el sector financiero.

El modelo hereda la arquitectura transformer encoder-decoder de Whisper, con una ventana de contexto de audio de 30 segundos y un vocabulario de tokens de texto multilingue, pero el ajuste fino se ha realizado exclusivamente sobre minds14, por lo que su comportamiento fuera de ese dominio no esta validado. El resultado declarado por el autor es un WER de 0,3300 en el conjunto de evaluacion, una cifra alta en terminos absolutos que refleja tanto la dificultad del dataset (audio telefónico, ruido, acentos) como las limitaciones del modelo base tiny.

Su relevancia es fundamentalmente practica y didactica: sirve como ejemplo reproducible de pipeline de fine-tuning ASR con la libreria transformers (version 5.20.2), y como punto de partida para quien quiera adaptar Whisper a dominios especificos con recursos de computo minimos. No obstante, no es un modelo apto para produccion sin una evaluacion adicional exhaustiva, dado que la model card esta generada automaticamente y carece de documentacion sobre usos previstos, limitaciones y composicion del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio (ventana estandar de Whisper); contexto de texto no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | no disponible (el dataset de ajuste, minds14, es en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de openai/whisper-tiny, que emplea la arquitectura transformer encoder-decoder original de Whisper: el encoder procesa espectrogramas mel de 80 canales correspondientes a ventanas de 30 segundos, y el decoder genera la transcripcion de forma autorregresiva. Whisper-tiny es la variante mas pequena de la familia, con 4 capas en encoder y 4 en decoder, dimension de modelo 384 y 6 cabezas de atencion, lo que explica sus 37,7 millones de parametros.

El ajuste fino se realizo sobre PolyAI/minds14 con los siguientes hiperparametros: learning rate de 1e-05, batch size de 16 (entrenamiento y evaluacion), semilla 42, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler constant_with_warmup con 50 pasos de calentamiento, 500 pasos de entrenamiento totales y precision mixta nativa AMP. No se documenta el numero de tokens de audio procesados, la composicion exacta del split utilizado ni si se aplicaron tecnicas de aumento de datos. Tampoco se indica si hubo RLHF, DPO o cualquier etapa de alineacion posterior; en un modelo ASR esto es esperable, ya que el entrenamiento supervisado con pares audio-transcripcion es el paradigma habitual.

La curva de entrenamiento muestra un sobreajuste claro: la perdida de entrenamiento cae de 0,2676 (paso 100) a 0,0011 (paso 500), mientras que la perdida de validacion asciende de 0,4847 a 0,6360 en el mismo intervalo. El WER, sin embargo, se estabiliza en torno a 0,33, lo que sugiere que el modelo converge rapidamente a un minimo local y que mas pasos de entrenamiento no mejorarian la transcripcion sin cambios en los datos o la regularizacion.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles sobre audio de consultas bancarias, dominio del dataset minds14.
- Transcripcion de audio de hasta 30 segundos por ventana, con la posibilidad de segmentar audios mas largos externamente.
- Generacion de texto a partir de audio con el pipeline `automatic-speech-recognition` de transformers.
- Compatible con los endpoints de Hugging Face (tag `endpoints_compatible`).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue efectiva; el ajuste fino se limita a un dataset en ingles.
- No se documentan modos especiales (thinking mode, vision, audio adicional) mas alla del ASR estandar.

## Casos de uso

- Transcripcion de llamadas de atencion al cliente en banca: el modelo se ajusto sobre minds14, que contiene grabaciones reales de consultas bancarias, por lo que es adecuado para prototipos de transcripcion de este tipo de audio telefonico, siempre con una validacion previa sobre el corpus propio.
- Generacion de transcripciones para analisis de calidad: al ser un modelo de 37,7 millones de parametros, puede ejecutarse en CPU o GPU de gama baja para procesar lotes de grabaciones y alimentar dashboards de analitica de conversaciones.
- Prototipado rapido de pipelines ASR: sirve como baseline reproducible para comparar con otros modelos o con variantes mas grandes de Whisper antes de invertir en infraestructura.
- Educacion y experimentacion: el reducido tamano y la licencia Apache 2.0 lo hacen util para cursos y talleres sobre fine-tuning de modelos de voz con transformers.
- Transcripcion offline en dispositivos con recursos limitados: su tamano (0,8 GB de repo, 37,7 M de parametros) permite desplegarlo en entornos con poca memoria, aunque la latencia y la precision no estan documentadas.
- Extraccion de caracteristicas para clasificacion de intenciones: las transcripciones pueden alimentar un clasificador posterior de intenciones de cliente en un sistema de enrutamiento de llamadas.
- Investigacion sobre sobreajuste en ASR de dominio: la curva de validacion documentada lo convierte en un caso de estudio util para analizar tecnicas de regularizacion y early stopping.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Automatic Speech Recognition | PolyAI/minds14 | WER | 0,3300 |
| Automatic Speech Recognition | PolyAI/minds14 | WER ortho | 0,3325 |
| Automatic Speech Recognition | PolyAI/minds14 | Loss (evaluacion) | 0,6360 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision fp32 (37,7 M de parametros); en la practica, el encoder de Whisper necesita memoria adicional para los espectrogramas mel, por lo que se recomienda al menos 2 GB de VRAM para un uso comodo.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobredimensionada para este modelo; tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), Hugging Face Inference Endpoints (tag `endpoints_compatible`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que estan orientadas a modelos de lenguaje y no a Whisper.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | WER en minds14 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kartik308/whisper-tiny-minds14 | 37,7 M | 30 s | 0,3300 (declarado) | Apache 2.0 | Hugging Face |
| openai/whisper-tiny | 37,7 M | 30 s | no disponible | Apache 2.0 | Hugging Face |
| openai/whisper-base | 74,4 M | 30 s | no disponible | Apache 2.0 | Hugging Face |
| openai/whisper-small | 244 M | 30 s | no disponible | Apache 2.0 | Hugging Face |

La comparativa se limita a la familia Whisper porque no se dispone de datos de WER en minds14 para los modelos base en la informacion proporcionada. En terminos de tamano, whisper-tiny-minds14 es identico a whisper-tiny; la diferencia radica en el ajuste de dominio, cuyo beneficio real solo puede medirse comparando ambos sobre el mismo split de evaluacion, dato que no se aporta.

## Limitaciones y advertencias

- La model card esta generada automaticamente y contiene secciones sin completar ("More information needed") sobre descripcion, usos previstos, limitaciones y datos de entrenamiento.
- El WER de 0,3300 es alto en terminos absolutos: aproximadamente una de cada tres palabras se transcribe incorrectamente en el conjunto de evaluacion.
- La curva de entrenamiento muestra sobreajuste: la perdida de validacion aumenta de 0,4847 a 0,6360 mientras la de entrenamiento cae a 0,0011.
- El modelo se ha ajustado exclusivamente sobre minds14 (ingles, dominio bancario); su rendimiento fuera de ese dominio o en otros idiomas no esta validado.
- No se documenta la composicion del dataset de entrenamiento ni el split utilizado, lo que dificulta reproducir la evaluacion.
- Riesgo de alucinacion en la transcripcion: como todo modelo generativo de ASR, puede producir texto plausible que no corresponde al audio, especialmente con ruido o acentos no representados.
- Sesgos: no se documentan analisis de sesgo por acento, genero o edad; el dataset minds14 puede no ser representativo de todas las poblaciones.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; el uso en produccion requiere una evaluacion propia.
- El modelo tiene solo 40 descargas y 0 likes, lo que indica una validacion comunitaria practicamente nula.
- No se documentan versiones cuantizadas ni formatos alternativos de despliegue, lo que limita las opciones de optimizacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kartik308/whisper-tiny-minds14
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset de ajuste: https://huggingface.co/datasets/PolyAI/minds14
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio de Whisper en OpenAI: https://github.com/openai/whisper
- Documentacion de transformers para ASR: https://huggingface.co/docs/transformers/tasks/asr
