# dianavdavidson/whisper-medium_indic_voices_68116_15_100_1e-4_None_hinglish_mixed_scripts_FT

## Resumen

El modelo `whisper-medium_indic_voices_68116_15_100_1e-4_None_hinglish_mixed_scripts_FT` es un ajuste fino (fine-tuning) del modelo de reconocimiento automatico del habla `openai/whisper-medium` de OpenAI, publicado por el usuario `dianavdavidson` en HuggingFace. El nombre del checkpoint sugiere que el ajuste se ha realizado sobre el conjunto de datos IndicVoices, con enfasis en habla hinglish (mezcla de hindi e ingles) y transcripciones con scripts mixtos (devanagari y alfabeto latino). El modelo resuelve la tarea de transcripcion de audio a texto (ASR) y su interes radica en la adaptacion de un modelo generico multilingual a una variedad linguistica concreta poco representada en los datos originales de Whisper.

La arquitectura subyacente es la de Whisper medium: un transformer encoder-decoder de tipo seq2seq con 763.857.920 parametros, entrenado originalmente por OpenAI sobre 680.000 horas de audio supervisado y 117.000 horas adicionales multilingues. Este ajuste concreto parte de esos pesos y los especializa mediante entrenamiento supervisado con un learning rate de 1e-4 durante 100 epocas (aunque la tabla de resultados solo documenta 6 epocas completas). El checkpoint se distribuye en formato safetensors con un tamano de repositorio de 18,3 GB.

La relevancia actual del modelo es limitada pero concreta: cubre un nicho (ASR hinglish con scripts mixtos) para el que existen pocas alternativas abiertas, y lo hace bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. No obstante, el WER global reportado (30,02) es alto para estandares de produccion, y la documentacion del autor es practicamente inexistente, lo que limita su adopcion sin una evaluacion previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper medium) |
| Parametros totales | 763.857.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Whisper medium usa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el repo contiene safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible en la informacion proporcionada; el nombre del checkpoint sugiere hinglish (hindi + ingles) con scripts mixtos |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `openai/whisper-medium`, que emplea una arquitectura transformer encoder-decoder. El encoder procesa espectrogramas mel de audio en ventanas de 30 segundos y el decoder genera tokens de texto de forma autoregresiva, con tokens especiales de idioma y de tarea. Whisper medium cuenta con 24 capas de encoder y 24 de decoder, con una dimension de modelo de 1024 y 16 cabezas de atencion, totalizando los 763 millones de parametros indicados en los safetensors.

El entrenamiento documentado en la model card emplea los siguientes hiperparametros: learning rate de 0,0001, batch size de 16 por dispositivo con acumulacion de gradientes de 2 (batch efectivo de 32), optimizador `adamw_torch_fused` con betas (0,9; 0,999) y epsilon 1e-08, scheduler `constant_with_warmup` con 500 pasos de calentamiento, semilla 42 y 100 epocas configuradas. La tabla de resultados solo registra 6 epocas (hasta el paso 2592), con una perdida de validacion minima de 0,4162 en la epoca 2 y un WER global minimo de 30,0209 en la epoca 3. No se especifica el dataset de entrenamiento ("unknown dataset" en la model card), aunque el nombre del checkpoint apunta a IndicVoices con transcripciones hinglish de scripts mixtos. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Reconocimiento automatico del habla (ASR): transcripcion de audio a texto en la variedad hinglish con scripts mixtos (devanagari y latino), segun indica el nombre del checkpoint.
- Transcripcion multilingue heredada: al partir de Whisper medium, conserva parcialmente la capacidad multilingual del modelo original, aunque el fine-tuning puede haber degradado el rendimiento en idiomas no representados en el conjunto de ajuste.
- Manejo de audio de hasta 30 segundos por ventana, con la posibilidad de procesar audio mas largo mediante segmentacion.
- No se documenta soporte de tool calling ni function calling (no es una capacidad propia de un modelo ASR).
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, vision ni audio mas alla de la transcripcion.
- No se documentan capacidades especiales adicionales en la informacion proporcionada.

## Casos de uso

- Transcripcion de reuniones y llamadas en hinglish: el modelo puede convertir audio de conversaciones donde se alternan hindi e ingles en texto con scripts mixtos, un escenario comun en equipos de soporte en India. Es adecuado por su especializacion en esa variedad, aunque el WER de 30,02 exige revision humana.
- Subtitulado de contenido audiovisual para plataformas dirigidas a audiencias del subcontinente indio: permite generar subtitulos en devanagari y latino a partir de audio hinglish, con la ventaja de la licencia Apache 2.0 para uso comercial.
- Generacion de actas y notas de voz en aplicaciones de productividad: integrado en un pipeline con segmentacion de audio de 30 segundos, puede transcribir notas de voz de usuarios que hablan hinglish, aunque la calidad requiere post-procesado.
- Analisis de encuestas de voz y feedback de clientes: transcripcion de respuestas abiertas en centros de contacto para su posterior analisis de sentimiento o topicos, aprovechando que el modelo acepta audio en crudo.
- Investigacion linguistica sobre code-switching: util para corpus de habla hinglish donde se necesita una transcripcion base que preserve ambos scripts, con la advertencia de que el WER reportado limita su uso como referencia de oro.
- Prototipado de asistentes de voz para el mercado indio: el modelo puede servir como componente ASR en un pipeline de voz a texto dentro de un asistente, dado su tamano moderado (763 M de parametros) y su licencia permisiva.
- Fine-tuning adicional sobre dominios especificos: al ser un checkpoint abierto en safetensors, puede usarse como punto de partida para ajustes sobre jergas o acentos concretos, aunque la falta de documentacion sobre el dataset original complica la reproducibilidad.

## Benchmarks y rendimiento

Los unicos datos disponibles son los declarados por el autor en la model card durante el entrenamiento (conjunto de evaluacion no especificado):

| Metrica | Epoca 1 | Epoca 2 | Epoca 3 | Epoca 4 | Epoca 5 | Epoca 6 |
|---|---|---|---|---|---|---|
| Training loss | 0,9749 | 0,6138 | 0,4208 | 0,3070 | 0,2355 | 0,1925 |
| Validation loss | 0,4270 | 0,4162 | 0,4254 | 0,4415 | 0,4720 | 0,4865 |
| Global WER | 37,0019 | 31,1753 | 30,0209 | 31,9574 | 31,4045 | 31,9001 |

El mejor resultado declarado es un WER global de 30,0209 en la epoca 3, con una perdida de validacion de 0,4254. A partir de la epoca 3 se observa sobreajuste: la perdida de entrenamiento sigue bajando mientras la de validacion sube y el WER empeora. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con otros modelos ASR.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 3,1 GB solo para pesos, mas memoria para activaciones y buffers de audio; en la practica, unos 6-8 GB.
- VRAM estimada en fp16/bf16: aproximadamente 1,6 GB para pesos, con un total practico de 3-4 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16; A100, H100 o L40S para despliegues de alto throughput; RTX 3090, RTX 4090 o RTX A5000 para inferencia en consumer/prosumer.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090). En GPUs con 4-6 GB puede requerir cuantizacion o carga en fp16 con batch pequeno.
- Opciones de despliegue: transformers (libreria nativa del checkpoint), vLLM (soporte de Whisper para ASR por lotes), Hugging Face Inference Endpoints (el tag `endpoints_compatible` lo indica), TGI (soporte limitado para ASR), y conversion a otros formatos no documentada. No se documentan variantes GGUF ni Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia estructural de Whisper medium, el coste por ventana de 30 segundos es moderado en GPUs modernas, pero no se aportan mediciones concretas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto (audio) | WER declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (whisper-medium hinglish FT) | 763,9 M | ventanas de 30 s | 30,02 (global, conjunto no especificado) | Apache 2.0 | HuggingFace, 78 descargas |
| openai/whisper-medium | 763,9 M | ventanas de 30 s | no disponible en esta ficha | Apache 2.0 | HuggingFace, ampliamente usado |
| openai/whisper-large-v3 | 1.550 M | ventanas de 30 s | no disponible en esta ficha | Apache 2.0 | HuggingFace |
| Modelos ASR especificos para hindi/hinglish (p. ej. AI4Bharat IndicWhisper) | variable | variable | no disponible en esta ficha | variable | HuggingFace |

La comparacion con alternativas especificas para hinglish no puede completarse con datos de benchmark porque no se han publicado resultados comparables en la informacion disponible. La ventaja principal de este checkpoint frente a Whisper medium original es su especializacion en scripts mixtos; su desventaja es la falta de documentacion y un WER absoluto alto.

## Limitaciones y advertencias

- El WER global declarado (30,02) es alto para uso en produccion sin revision humana; implica que aproximadamente una de cada tres palabras se transcribe incorrectamente en el conjunto de evaluacion.
- La model card no especifica el dataset de entrenamiento ni el de evaluacion ("unknown dataset"), lo que impide verificar la representatividad de las metricas y la reproducibilidad del ajuste.
- El sobreajuste es evidente a partir de la epoca 3: la perdida de validacion aumenta y el WER empeora, por lo que el checkpoint publicado podria no corresponder al mejor punto de validacion.
- El fine-tuning sobre un dominio concreto puede degradar el rendimiento en otros idiomas y acentos respecto al Whisper medium original; no se documenta el alcance de esta degradacion.
- No se documentan sesgos conocidos, pero al entrenar sobre una variedad linguistica concreta puede heredar sesgos de representacion del corpus (acentos, genero, registro).
- Riesgo de alucinacion: los modelos Whisper son propensos a generar texto plausible en segmentos de silencio o ruido; no se documenta mitigacion en este checkpoint.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero el modelo base subyacente (Whisper) tambien es Apache 2.0, por lo que no hay conflicto de licencias.
- La fecha de creacion del repositorio (2026-10-31) y el uso de Transformers 5.0.0.dev0 indican un entorno de desarrollo muy reciente; la compatibilidad con versiones estables de transformers no esta garantizada.
- El tamano del repositorio (18,3 GB) es notablemente superior al de los pesos safetensors (unos 3 GB), lo que sugiere la presencia de checkpoints intermedios u otros artefactos que no se documentan.
- No se dispone de demos, papers ni documentacion adicional del autor; la unica fuente es la model card autogenerada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dianavdavidson/whisper-medium_indic_voices_68116_15_100_1e-4_None_hinglish_mixed_scripts_FT
- Modelo base: https://huggingface.co/openai/whisper-medium
- Repositorio oficial de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Documentacion de Transformers para Whisper: https://huggingface.co/docs/transformers/model_doc/whisper
- Conjunto de datos IndicVoices (referencia del nombre del checkpoint): https://huggingface.co/datasets/ai4bharat/IndicVoices
