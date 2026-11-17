# PL-HFT/nemotron-3.5-asr-streaming-0.6b-ko-dysarthria-lora

## Resumen

El modelo `PL-HFT/nemotron-3.5-asr-streaming-0.6b-ko-dysarthria-lora` es un adaptador LoRA de reconocimiento automático del habla (ASR) en coreano, especializado en habla disártrica, desarrollado por el usuario PL-HFT. Se construye sobre el modelo base `nvidia/nemotron-3.5-asr-streaming-0.6b` de NVIDIA, un sistema ASR en streaming con arquitectura Cache-Aware FastConformer de 24 capas y decodificador RNNT, y añade un ajuste fino sobre un corpus combinado de habla disártrica y habla típica coreana.

El adaptador resuelve un problema concreto: los sistemas ASR generalistas rinden peor con habla disártrica (alteraciones motoras del habla), por lo que este LoRA busca mejorar la transcripción de personas con disartria sin degradar el rendimiento sobre habla típica. El entrenamiento se realizó durante una única época con una tasa de aprendizaje conservadora (min_lr = 1.0e-06 tras el warmup), lo que produjo una mejora modesta pero medible: el CER en el test combinado pasó del 7,11 % en zero-shot al 6,82 %.

Técnicamente es relevante porque demuestra un flujo de adaptación PEFT sobre un modelo NeMo RNNT en streaming, con solo un 1,93 % de parámetros entrenables (12,58 M sobre 650,58 M), y porque publica métricas separadas para disartria, habla típica y un conjunto externo de conferencias, lo que permite evaluar la generalización del ajuste. El repositorio ocupa 0,1 GB e incluye pesos en safetensors y en formato PyTorch original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cache-Aware FastConformer (24 capas) + decodificador RNNT, adaptador PEFT LoRA |
| Parametros totales | 650.580.000 (modelo base) |
| Parametros activos | no disponible (no es MoE); parametros entrenables del adaptador: 12.582.912 (1,9341 %) |
| Longitud de contexto | `att_context_size=[56, 13]` (ventana de atención en streaming); segmentos de audio de hasta 29,5 s |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko); prompt de inferencia `ko-KR` |
| Licencia | openmdw-1.1 (heredada del modelo base NVIDIA) |
| Formato de pesos | safetensors (`adapter_model.safetensors`) y PyTorch (`adapter_model.pt`) |

## Arquitectura y entrenamiento

El modelo base es un `EncDecRNNTBPEModel` de NeMo con encoder Cache-Aware FastConformer de 24 capas y decodificador RNNT con tokenización BPE. El adaptador LoRA se inyecta mediante `peft.inject_adapter_in_model(...)` sobre 96 módulos lineales (`linear_q`, `linear_k`, `linear_v`, `linear_out`, `linear_fc1`, `linear_fc2`) con `r=64`, `lora_alpha=128`, `lora_dropout=0.05` y `bias="none"`. El entrenamiento se realizó durante 1 época sobre el perfil `combine` del proyecto PL-HFT, que mezcla habla disártrica (AI-Hub 013) y habla típica (AI-Hub 109) en coreano. La configuración de streaming usa `att_context_size=[56, 13]` y prompt de idioma `ko-KR`. El contrato de audio exige 16 kHz mono y segmentos de hasta 29,5 s.

La innovación principal no está en la arquitectura, sino en el flujo de adaptación: se demuestra que un adaptador LoRA puede inyectarse en un modelo NeMo RNNT (no en un transformer Hugging Face estándar) y cargarse con safetensors, lo que facilita el despliegue seguro. El autor advierte que la tasa de aprendizaje se mantuvo en `min_lr = 1.0e-06` tras el warmup, lo que produjo actualizaciones conservadoras y una mejora limitada frente al baseline zero-shot.

## Capacidades

- Reconocimiento automático del habla en coreano, con especial atención a habla disártrica.
- Transcripción en streaming gracias a la ventana de atención `[56, 13]` del encoder Cache-Aware FastConformer.
- Manejo de segmentos de audio de hasta 29,5 s a 16 kHz mono.
- Soporte de prompt de idioma (`ko-KR`) para condicionar la decodificación.
- Adaptación PEFT cargable sobre el modelo base sin reentrenar los 650,58 M de parámetros.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá de ASR.

## Casos de uso

- Transcripción de habla disártrica en entornos clínicos o de rehabilitación: el adaptador mejora el CER sobre el test de disartria (AI-Hub 013) hasta el 7,22 %, lo que lo hace adecuado para dictado asistido de pacientes con alteraciones motoras del habla.
- Subtitulado en streaming de conversaciones coreanas: la ventana de atención `[56, 13]` y el formato RNNT permiten decodificación incremental con baja latencia en aplicaciones de subtitulado en vivo.
- Sistemas de accesibilidad para personas con disartria: integración en interfaces de voz a texto que necesitan un modelo especializado en habla atípica sin sacrificar el rendimiento en habla típica (CER 6,57 % en AI-Hub 109).
- Transcripción de reuniones y clases en coreano: el conjunto externo de conferencias (AI-Hub 71627) muestra un CER del 14,08 %, útil para actas automáticas con revisión humana.
- Investigación en ASR adaptativo: el adaptador sirve como referencia reproducible de inyección LoRA sobre NeMo RNNT con safetensors, útil para experimentos de dominio.
- Evaluación comparativa de robustez ASR: al publicar métricas separadas para disartria, habla típica y dominio externo, permite medir la generalización de un ajuste fino en condiciones controladas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index (no verificados):

| Dataset | Split | N | CER (%) | WER (%) |
|---|---|---|---|---|
| Combined Dysarthria + Typical (AI-Hub 013 + 109) | test | 38.599 | 6,82 | 23,75 |
| Dysarthria (AI-Hub 013) | test | 15.495 | 7,22 | 24,25 |
| Typical (AI-Hub 109) | test | 23.104 | 6,57 | 23,42 |
| External Korean Lecture (AI-Hub 71627) | test | 10.000 | 14,08 | 34,97 |

El autor indica que el baseline zero-shot sobre el test combinado era 7,11 % CER, frente al 6,82 % tras el ajuste LoRA.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el modelo base tiene 650,58 M de parámetros y el adaptador añade 12,58 M, por lo que en fp32 el conjunto ronda los 2,6 GB de pesos, y en fp16 aproximadamente 1,3 GB, sin contar activaciones ni buffers de streaming.
- GPU recomendadas: no disponible; por tamaño, cabría en GPU de consumo como RTX 3060/4060 en adelante, aunque no se confirma en la información.
- Cabe en consumer GPU: probable por el tamaño del modelo base, pero no confirmado explícitamente.
- Opciones de despliegue: NeMo Toolkit (`nemo_toolkit[asr]`), con carga vía `EncDecRNNTBPEModel.from_pretrained` + `inject_adapter_in_model` + `set_peft_model_state_dict`; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / streaming | CER coreano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PL-HFT/nemotron-3.5-asr-streaming-0.6b-ko-dysarthria-lora | 650,58 M base + 12,58 M adaptador | `[56, 13]`, streaming | 6,82 % combinado; 7,22 % disartria | openmdw-1.1 | Hugging Face |
| nvidia/nemotron-3.5-asr-streaming-0.6b (base zero-shot) | 650,58 M | `[56, 13]`, streaming | 7,11 % combinado (según el autor) | openmdw-1.1 | Hugging Face |
| Otros ASR coreanos especializados en disartria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Mejora modesta: el CER combinado baja de 7,11 % a 6,82 %; el autor atribuye el resultado a la tasa de aprendizaje conservadora (`min_lr = 1.0e-06`) durante la única época de entrenamiento.
- Carga no estándar: no funciona con `PeftModel.from_pretrained(...)`; requiere el flujo NeMo + `inject_adapter_in_model` + `set_peft_model_state_dict`.
- Solo coreano (`ko`): no se documenta soporte multilingüe.
- Dependencia del prompt de idioma `ko-KR` y de la configuración `att_context_size=[56, 13]`; otros ajustes pueden degradar el rendimiento.
- Los textos de salida pueden incluir etiquetas de control tipo `<ko-KR>` que deben eliminarse con regex antes de usarse.
- Rendimiento claramente inferior en dominio externo (CER 14,08 % en conferencias) frente a los conjuntos de test internos, lo que sugiere sensibilidad al dominio.
- Métricas no verificadas (`verified: false` en la model-index): no han sido auditadas de forma independiente.
- Licencia openmdw-1.1 heredada del modelo base: conviene revisar sus términos para uso comercial antes de desplegar en producción.
- Riesgo de sesgo hacia las características de los corpus AI-Hub 013 y 109, que pueden no representar toda la variabilidad del habla disártrica coreana.
- No se documentan mecanismos de mitigación de alucinaciones ni de sesgos demográficos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PL-HFT/nemotron-3.5-asr-streaming-0.6b-ko-dysarthria-lora
- Modelo base: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Licencia openmdw-1.1 (referencia en el modelo base): https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- NeMo Toolkit: https://github.com/NVIDIA-NeMo/NeMo
- PEFT: https://github.com/huggingface/peft
- safetensors: https://github.com/huggingface/safetensors
- Korean model card (referenciada en el README): ./README.ko.md
