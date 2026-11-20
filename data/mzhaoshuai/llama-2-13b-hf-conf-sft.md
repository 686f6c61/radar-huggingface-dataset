# mzhaoshuai/Llama-2-13b-hf-conf-sft

## Resumen

Llama-2-13b-hf-conf-sft es un adaptador PEFT (LoRA) publicado por el usuario mzhaoshuai sobre el modelo base meta-llama/Llama-2-13b-hf. No se trata de un modelo entrenado desde cero, sino de un ajuste supervisado (SFT) realizado con el dataset CONQORD (shuchangtao/CONQORD_dataset, split conqord_step1_data), orientado a tareas de confianza y alineamiento. Forma parte del proyecto RL2R (anteriormente RefAlign), un marco de alineamiento tipo REINFORCE que emplea metricas de evaluacion de generacion de lenguaje (BERTScore) entre las respuestas muestreadas y respuestas de referencia unarias como recompensa sustituta, evitando datos binarios de preferencia humana y modelos de recompensa explicitos.

El modelo hereda la arquitectura transformer decoder-only de Llama 2 con 13.000 millones de parametros y una ventana de contexto de 4096 tokens. El adaptador se distribuye en formato safetensors con cuantizacion de 8 bits mediante bitsandbytes, y su tamano de repositorio es de aproximadamente 0,5 GB, lo que refleja que solo contiene los pesos del adaptador y no el modelo completo. Para su uso es necesario descargar el modelo base y fusionar el adaptador, por ejemplo con el script merge_model.py disponible en el repositorio hermano de 7B.

Su relevancia radica en que propone una alternativa al RLHF clasico basada en recompensas de referencia, aplicable a escenarios de seguridad, calibracion de confianza y preferencias generales. No obstante, se trata de un artefacto de investigacion con muy poca traccion (8 descargas, 0 likes) y sin datos publicados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), adaptador PEFT/LoRA sobre modelo base |
| Parametros totales | 13.000 millones (modelo base); el adaptador no especifica numero de parametros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (heredada del modelo base Llama-2-13b-hf) |
| Tipos de cuantizacion | 8 bits (bitsandbytes); el adaptador se distribuye en safetensors |
| Idiomas soportados | no disponible (la model card no los declara; el modelo base Llama 2 esta orientado principalmente al ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors (adaptador PEFT); requiere fusion con el modelo base |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama-2-13b-hf, un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE), con 13.000 millones de parametros y contexto de 4096 tokens. El ajuste se realiza mediante PEFT (libreria peft 0.11.1), lo que implica que solo se entrenan los parametros de bajo rango insertados en las capas del modelo base, manteniendo congelados los pesos originales.

El entrenamiento es un SFT supervisado sobre el split conqord_step1_data del dataset CONQORD. Segun la model card, este adaptador forma parte del marco RL2R (antes RefAlign), un algoritmo de alineamiento estilo REINFORCE que utiliza BERTScore entre generaciones muestreadas y respuestas de referencia unarias como recompensa sustituta, en lugar de preferencias binarias o reward models explicitos. El modelo esta cuantizado en 8 bits con bitsandbytes. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas adicionales de RL o DPO sobre este checkpoint SFT concreto.

## Capacidades

- Generacion de texto autoregresiva en ingles (idioma principal del modelo base), con capacidad multilingue limitada y no documentada.
- Razonamiento y respuesta a instrucciones heredados del modelo base Llama 2, potencialmente ajustados hacia respuestas mas cautas o calibradas por el entrenamiento de confianza.
- Alineamiento orientado a helpfulness, harmlessness y honesty segun la metodologia RL2R descrita por el autor.
- No se documenta soporte explicito de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso estructurado.
- No se documentan capacidades de vision, audio ni modo thinking.
- El adaptador esta pensado para experimentacion con el pipeline text-generation.

## Casos de uso

- Investigacion en alineamiento: reproducir o extender el marco RL2R/RefAlign fusionando el adaptador con Llama-2-13b-hf y evaluando recompensas basadas en BERTScore frente a RLHF clasico.
- Experimentos de calibracion de confianza: usar el checkpoint SFT como punto de partida para estudiar como el modelo expresa incertidumbre en tareas de question answering, dado el entrenamiento sobre el dataset CONQORD.
- Generacion de respuestas de referencia en ingles: emplear el modelo fusionado para producir respuestas base en pipelines de evaluacion o destilacion, con contexto de 4096 tokens suficiente para documentos medios.
- Prototipado academico de sistemas de dialogo: integrar el adaptador en un entorno de investigacion con Transformers y PEFT para comparar comportamientos antes y despues del SFT.
- Estudio de seguridad y rechazo: analizar la tasa de respuestas evasivas o seguras en prompts sensibles, comparandola con el modelo base sin adaptador.
- Base para posteriores etapas de RL: utilizar este checkpoint SFT como inicializacion para fases de RL2R con recompensas de referencia, tal como describe el repositorio del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 26 GB para los 13.000 millones de parametros, mas overhead de activaciones y cache KV.
- VRAM estimada en 8 bits (bitsandbytes): aproximadamente 13-15 GB, viable en GPUs de 16 GB como RTX 4080 o RTX 4090 con contexto moderado.
- VRAM estimada en 4 bits (si se aplica cuantizacion adicional con GPTQ/AWQ o llama.cpp): alrededor de 7-9 GB, cabe en RTX 3060 de 12 GB o RTX 4070.
- GPUs recomendadas para produccion: A100 40/80 GB, H100, L40S; para experimentacion: RTX 4090 (24 GB) en FP16 con contexto reducido o en 8 bits.
- Opciones de despliegue: Transformers + PEFT (fusion previa con merge_model.py), vLLM y TGI tras fusionar el adaptador, llama.cpp/Ollama si se convierte a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Llama-2-13b-hf-conf-sft (este) | 13B (adaptador LoRA sobre Llama-2-13b-hf) | 4096 | llama2 | Hugging Face, 8 descargas | Adaptador SFT de investigacion, requiere fusion |
| meta-llama/Llama-2-13b-hf | 13B | 4096 | llama2 | Hugging Face, ampliamente disponible | Modelo base sin ajuste de alineamiento adicional |
| Llama-2-13b-chat-hf | 13B | 4096 | llama2 | Hugging Face | Version oficial ajustada para dialogo con RLHF |
| mzhaoshuai/Llama-2-7b-hf-conf-sft | 7B (adaptador sobre Llama-2-7b-hf) | 4096 | llama2 | Hugging Face | Version hermanada del mismo proyecto a menor escala |

## Limitaciones y advertencias

- Modelo de investigacion con traccion minima (8 descargas, 0 likes) y sin validacion externa publicada; no recomendado para produccion sin evaluacion propia.
- No se han publicado benchmarks, por lo que el rendimiento real frente al modelo base o a Llama-2-13b-chat es desconocido.
- Riesgo de alusionacion inherente a los modelos de 13B de la familia Llama 2, no mitigado de forma documentada.
- Idiomas soportados no declarados; el modelo base esta optimizado para ingles, por lo que el rendimiento en castellano puede ser deficiente.
- Licencia llama2: impone restricciones de uso comercial (limite de 700 millones de usuarios mensuales), obligaciones de atribucion y politicas de uso aceptable que deben revisarse antes de cualquier despliegue.
- Requiere fusionar el adaptador con el modelo base para obtener un modelo completo; el repositorio solo contiene los pesos PEFT (0,5 GB).
- El entrenamiento se realizo con cuantizacion de 8 bits, lo que puede introducir diferencias de comportamiento respecto a una inferencia en FP16.
- No se documentan salvaguardas adicionales de seguridad mas alla del ajuste de confianza descrito.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/mzhaoshuai/Llama-2-13b-hf-conf-sft
- Modelo base: https://huggingface.co/meta-llama/Llama-2-13b-hf
- Dataset CONQORD: https://huggingface.co/datasets/shuchangtao/CONQORD_dataset
- Paper RL2R: https://huggingface.co/papers/2504.09895
- Repositorio GitHub RL2R: https://github.com/mzhaoshuai/RL2R/tree/alignment
- Modelo hermano 7B con script merge_model.py: https://huggingface.co/mzhaoshuai/Llama-2-7b-hf-conf-sft
