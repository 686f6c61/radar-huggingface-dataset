# PL-HFT/whisper-large-v3-turbo-ko-dysarthria-lora

## Resumen

El modelo `PL-HFT/whisper-large-v3-turbo-ko-dysarthria-lora` es un adaptador LoRA de PEFT desarrollado por PL-HFT sobre el modelo base `openai/whisper-large-v3-turbo`. Su propósito es mejorar el reconocimiento automático del habla (ASR) en coreano para hablantes con disartria, un trastorno motor del habla que afecta a la articulación y que degrada gravemente el rendimiento de los sistemas ASR convencionales. El adaptador se ha entrenado sobre un corpus combinado de habla disártrica y habla típica, evitando el sobreajuste al dominio patológico que sufre el ajuste fino en un único dominio.

La relevancia de este adaptador radica en su enfoque de entrenamiento conjunto: en lugar de especializar el modelo solo en habla disártrica (lo que provoca olvido catastrófico en hablantes típicos), se entrena una única época sobre un corpus mixto, logrando mejoras simultáneas en ambos tipos de hablantes y una mejor generalización a dominios externos no vistos, como conferencias en coreano. El adaptador representa el 6,44 % de los parámetros del modelo base (55,7 M de 864,6 M), lo que lo hace ligero y fácil de distribuir.

El repositorio ocupa 0,2 GB y se distribuye en formato safetensors con licencia MIT. El modelo base es un transformer encoder-decoder con arquitectura Whisper, y el adaptador se integra mediante la librería `peft` y `transformers`. La entrada de audio debe ser mono a 16 kHz con segmentos de hasta 29,5 segundos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) con adaptador LoRA |
| Parametros totales | 864.583.680 (modelo base); adaptador LoRA: 55.705.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | segmentos de audio de hasta 29,5 s (contrato de audio del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (`ko`) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `openai/whisper-large-v3-turbo`, un transformer encoder-decoder para ASR. La configuración LoRA utiliza `r=64`, `lora_alpha=128`, `lora_dropout=0.05` y `bias="none"`, con módulos objetivo `q_proj`, `k_proj`, `v_proj`, `out_proj`, `fc1` y `fc2` (232 módulos coincidentes). Los parámetros entrenables son 55.705.600 de 864.583.680, es decir, el 6,4431 % del total.

El entrenamiento se realizó durante una única época sobre el corpus `combine`, que fusiona dos conjuntos de datos coreanos verificados y preprocesados con el pipeline `Speech-dataset-pipeline`. El primero es el corpus de habla disártrica AI-Hub 013, con 161.911 segmentos y 283,86 horas (40,66 % de los segmentos y 44,20 % de la duración total). El preprocesado aplicó VAD de Silero y alineamiento forzado CTC en coreano con `kresnik/wav2vec2-large-xlsr-korean`, reteniendo segmentos estrictamente alineados de hasta 29,5 s y preservando las pausas naturales intra-enunciado. El segundo conjunto es el corpus de habla típica AI-Hub 109, cuyas cifras exactas no se detallan en la información disponible. La motivación declarada es resolver el compromiso entre la mejora en habla disártrica y la degradación en hablantes típicos que provoca el ajuste fino en un solo dominio.

## Capacidades

- Reconocimiento automático del habla en coreano (`transcribe`) sobre audio mono a 16 kHz.
- Reconocimiento mejorado de habla disártrica, con preservación del rendimiento en hablantes típicos gracias al entrenamiento conjunto.
- Generalización a dominios externos no vistos, como habla de conferencias en coreano.
- Procesamiento de segmentos de audio de hasta 29,5 segundos, con pausas intra-enunciado preservadas.
- Integración con `transformers` y `peft` mediante `PeftModel.from_pretrained`.
- Posibilidad de fusionar los pesos LoRA con `merge_and_unload()` para acelerar la inferencia.
- No se documentan capacidades de tool calling, agentes, visión, audio generativo ni modo de razonamiento.

## Casos de uso

- Subtitulado y transcripción de habla disártrica en coreano: el adaptador reduce el CER al 0,59 % en el conjunto de test de disartria (AI-Hub 013, N=15.495), lo que lo hace adecuado para generar transcripciones fiables de hablantes con trastornos motores del habla en entornos clínicos o de accesibilidad.
- Accesibilidad en interfaces de voz: integrado en asistentes o sistemas de dictado para usuarios con disartria, manteniendo un rendimiento aceptable también en usuarios sin trastorno (CER del 1,53 % en habla típica), lo que permite desplegar un único modelo para poblaciones mixtas.
- Transcripción de reuniones y conferencias en coreano: el adaptador generaliza a habla de conferencias externas no vistas (AI-Hub 71627, CER del 11,69 %), por lo que puede emplearse en pipelines de actas y resúmenes de charlas técnicas.
- Documentación clínica asistida: transcripción de sesiones de logopedia o evaluación fonoaudiológica, donde el habla del paciente es disártrica y el terapeuta puede hablar de forma típica, aprovechando el buen rendimiento en ambos dominios con un solo adaptador.
- Investigación en ASR para habla patológica: el adaptador sirve como punto de partida reproducible (licencia MIT, pesos safetensors) para experimentos de ajuste fino con LoRA en otros trastornos del habla o idiomas.
- Despliegue ligero en producción: al ser un adaptador de 0,2 GB sobre un modelo base de 864,6 M de parámetros, permite servir una única instancia del modelo base y cargar el adaptador para la variante coreana disártrica, reduciendo el coste de almacenamiento frente a un modelo completo adicional.
- Generación de datos etiquetados para entrenamiento: transcripción automática de corpus de habla disártrica coreana para su posterior revisión y uso en el entrenamiento de modelos especializados.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Conjunto de evaluación | Métrica | Valor | N |
|---|---|---|---|
| Combined Test (AI-Hub 013 + 109) | CER (%) | 1,17 | 38.599 |
| Combined Test (AI-Hub 013 + 109) | WER (%) | 4,93 | 38.599 |
| Dysarthria Test (AI-Hub 013) | CER (%) | 0,59 | 15.495 |
| Dysarthria Test (AI-Hub 013) | WER (%) | 1,83 | 15.495 |
| Typical Test (AI-Hub 109) | CER (%) | 1,53 | 23.104 |
| Typical Test (AI-Hub 109) | WER (%) | 6,86 | 23.104 |
| External Korean Test (AI-Hub 71627) | CER (%) | 11,69 | 10.000 |
| External Korean Test (AI-Hub 71627) | WER (%) | 28,80 | 10.000 |

No se han publicado en la información disponible resultados comparativos con otros modelos o adaptadores sobre los mismos conjuntos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el modelo base tiene 864,6 M de parámetros. En fp16, los pesos del modelo base ocupan aproximadamente 1,7 GB, a los que se suman los 55,7 M de parámetros del adaptador LoRA (unos 0,11 GB en fp16) y el coste de activaciones y memoria del feature extractor.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, el modelo es compatible con GPU de consumo con suficiente VRAM, aunque no se documentan cifras oficiales.
- Cabe en GPU de consumo: previsiblemente sí en GPU con al menos 4-6 GB de VRAM en fp16, aunque este dato no está confirmado en la información disponible.
- Opciones de despliegue: `transformers` con `peft` (carga del adaptador sobre el modelo base) y fusión de pesos con `merge_and_unload()` para inferencia más rápida. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| PL-HFT/whisper-large-v3-turbo-ko-dysarthria-lora | 864,6 M (base) + 55,7 M (LoRA) | segmentos de hasta 29,5 s | coreano | MIT | ASR coreano con ajuste para disartria |
| openai/whisper-large-v3-turbo | 809 M | segmentos de hasta 30 s | multilingüe | MIT | ASR multilingüe generalista |
| openai/whisper-large-v3 | 1.550 M | segmentos de hasta 30 s | multilingüe | MIT | ASR multilingüe de mayor tamaño |

La comparativa se limita a los modelos base de la familia Whisper; no se dispone en la información proporcionada de otros adaptadores LoRA comparables para disartria en coreano ni de sus resultados de benchmarks.

## Limitaciones y advertencias

- El adaptador está especializado exclusivamente en coreano (`ko`); no se ha validado para otros idiomas.
- El dominio de entrenamiento es habla disártrica y típica de los corpus AI-Hub 013 y 109; el rendimiento en otros dominios puede degradarse, como muestra el CER del 11,69 % y el WER del 28,80 % en el conjunto externo de conferencias (AI-Hub 71627).
- Los resultados de los benchmarks son declarados por el autor y están marcados como no verificados (`verified: false`); no han sido reproducidos de forma independiente.
- El contrato de audio exige 16 kHz mono y segmentos de hasta 29,5 s; audio de mayor duración debe segmentarse previamente.
- Riesgo de alucinación y de errores de transcripción inherente a los modelos ASR, especialmente en audio con ruido, solapamiento de hablantes o habla muy degradada.
- Sesgos potenciales derivados de la composición del corpus de entrenamiento (AI-Hub 013 y 109), cuyos detalles completos de hablantes, acentos y condiciones de grabación no se documentan en la información disponible.
- La licencia MIT del adaptador no exime del cumplimiento de las condiciones de uso de los corpus AI-Hub subyacentes, que no se redistribuyen en el repositorio.
- No se documentan mecanismos de detección de habla disártrica ni de confianza en la transcripción; en producción conviene añadir validación posterior.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/PL-HFT/whisper-large-v3-turbo-ko-dysarthria-lora)
- [Modelo base openai/whisper-large-v3-turbo](https://huggingface.co/openai/whisper-large-v3-turbo)
- [Modelo de alineamiento kresnik/wav2vec2-large-xlsr-korean](https://huggingface.co/kresnik/wav2vec2-large-xlsr-korean)
- [Model card en coreano (README.ko.md)](./README.ko.md)
