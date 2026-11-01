# Rohith9059/whisper-tiny-minds14-en-us

## Resumen

Whisper Tiny MINDS-14 en-US es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny para reconocimiento automatico del habla (ASR) en ingles estadounidense, especializado en el dominio de conversaciones de banca y servicios financieros. Lo publica el usuario Rohith9059 en Hugging Face y se genera con la libreria Transformers mediante el flujo `generated_from_trainer`, partiendo del checkpoint original de OpenAI.

El modelo hereda la arquitectura encoder-decoder de tipo transformer de Whisper Tiny, con 37,76 millones de parametros, y se reentrena sobre el subconjunto en-US del dataset PolyAI/minds14, un corpus de audio real de interacciones con sistemas de atencion al cliente bancaria. El resultado es un modelo ligero (repo de 0,2 GB) que declara un WER de 0,3158 sobre el conjunto de evaluacion de MINDS-14 en-US, un valor alto en terminos absolutos pero razonable para un modelo de este tamano en un dominio conversacional ruidoso.

Su relevancia practica es acotada y muy especifica: sirve como pieza de bajo coste computacional para prototipar transcripcion de dominio financiero en ingles, para comparar el efecto del fine-tuning frente al Whisper Tiny original, o como base para experimentos de adaptacion de dominio. No es un modelo de proposito general ni compite con sistemas ASR de gran tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (ventana de audio de 30 s en Whisper) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de openai/whisper-tiny, un transformer encoder-decoder disenado para ASR que procesa audio en ventanas de 30 segundos convertidas a espectrogramas log-Mel. Whisper Tiny es la variante mas pequena de la familia Whisper, con unos 37,8 millones de parametros, lo que lo situa en el rango de modelos que pueden ejecutarse en CPU o en GPUs de gama baja.

El entrenamiento se realizo sobre el subconjunto en-US de PolyAI/minds14 con los siguientes hiperparametros declarados: learning rate de 1e-5, batch size de entrenamiento de 8 con acumulacion de gradientes de 2 (batch efectivo de 16), optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-8, scheduler `constant_with_warmup` con 50 pasos de calentamiento, 251 pasos totales (equivalente a 8,77 epocas), semilla 42 y precision mixta nativa (AMP). No se documentan tecnicas de RLHF, DPO ni decodificacion especulativa; la model card no aporta informacion sobre composicion del dataset mas alla del nombre, ni sobre estrategias de aumento de datos o regularizacion.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) en ingles, con especializacion en el dominio de conversaciones de banca y servicios financieros.
- Transcripcion de audio de hasta 30 segundos por ventana, segun la arquitectura base de Whisper.
- Compatibilidad con la pipeline `automatic-speech-recognition` de Transformers.
- Modelo marcado como `endpoints_compatible`, apto para despliegue en Inference Endpoints de Hugging Face.
- No dispone de soporte documentado de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio generativo ni modo thinking.
- Capacidad multilingue limitada al ingles; no se declaran otros idiomas.

## Casos de uso

- Prototipado de transcripcion de llamadas de atencion al cliente bancaria: el modelo puede transcribir audios de dominio financiero en ingles para construir pipelines de analitica de conversaciones, aprovechando su ajuste especifico sobre MINDS-14.
- Evaluacion comparativa de fine-tuning de ASR: sirve como referencia controlada para medir cuanto mejora (o empeora) el WER al adaptar Whisper Tiny a un dominio concreto frente al checkpoint original.
- Generacion de subtitulos o notas en ingles para demos y pruebas internas: su tamano reducido permite ejecutarlo en entornos sin GPU dedicada.
- Investigacion academica sobre adaptacion de dominio en ASR de bajo coste: util como baseline en experimentos con datasets pequenos de dominio especifico.
- Preprocesado de audio en pipelines de NLP: transcripcion previa a tareas de clasificacion de intenciones o extraccion de entidades en conversaciones financieras.
- Despliegue en entornos con recursos muy limitados (CPU, dispositivos edge) para pruebas de concepto de transcripcion en ingles, dado su reducido numero de parametros.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente, `verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| MINDS-14 (en-US) | WER | 0,3158 |
| MINDS-14 (en-US) | WER ortho | 0,3183 |
| Conjunto de evaluacion | Loss | 0,5708 |

No se han publicado en la informacion disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros), ni comparaciones directas con el Whisper Tiny original u otros modelos ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision FP32 por el tamano del modelo (37,8 M de parametros); en la practica, el consumo depende del framework y del tamano de lote de audio.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior) es mas que suficiente; tambien funciona en CPU.
- Cabe en cualquier GPU consumer, incluidas integradas, y en CPU.
- Opciones de despliegue: pipeline `automatic-speech-recognition` de Transformers, Inference Endpoints de Hugging Face (el modelo esta marcado como `endpoints_compatible`), y frameworks compatibles con safetensors. No se documentan configuraciones para vLLM, llama.cpp, Ollama ni TGI, que no estan orientados a este tipo de modelo ASR.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (MINDS-14 en-US) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Whisper Tiny MINDS-14 en-US (este modelo) | 37,76 M | no disponible | 0,3158 (declarado) | MIT | Hugging Face |
| openai/whisper-tiny | 37,76 M | no disponible | no disponible | MIT | Hugging Face |
| openai/whisper-base | no disponible | no disponible | no disponible | MIT | Hugging Face |
| openai/whisper-small | no disponible | no disponible | no disponible | MIT | Hugging Face |

No se dispone en la informacion proporcionada de resultados de WER de los modelos comparables sobre MINDS-14 en-US, por lo que la comparacion cuantitativa de rendimiento no esta disponible.

## Limitaciones y advertencias

- WER de 0,3158 sobre el conjunto de evaluacion: mas de un 30 % de palabras erroneas, lo que limita su uso en produccion sin revision humana o sin un modelo de mayor tamano.
- Especializado en el dominio de banca y servicios financieros (MINDS-14); el rendimiento fuera de ese dominio no esta documentado y probablemente sea inferior.
- Solo soporta ingles; no se declaran capacidades multilingues.
- Riesgo de alucinacion y de transcripciones incorrectas en audio con ruido, acentos no estadounidenses o terminologia tecnica no vista en entrenamiento.
- La model card original no documenta sesgos conocidos, composicion del dataset ni limitaciones de uso previsto; el autor indica explicitamente "More information needed" en esas secciones.
- El resultado de WER no esta verificado de forma independiente (`verified: false`).
- Licencia MIT: permite uso comercial, pero el usuario debe asumir la responsabilidad de validar el rendimiento en su caso concreto.
- Modelo de muy bajo numero de descargas (29) y sin likes, lo que sugiere escasa validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rohith9059/whisper-tiny-minds14-en-us
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset: https://huggingface.co/datasets/PolyAI/minds14
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
