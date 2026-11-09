# shah-bakhsh/balcorpus-qwen3-0.6b-v1

## Resumen

BalCorpus Qwen3-0.6B es un adaptador LoRA de continuacion de preentrenamiento (continued pretraining) sobre el modelo base Qwen/Qwen3-0.6B, desarrollado por el usuario shah-bakhsh. Su objetivo es adaptar un modelo pequeno de proposito general al balochi (codigo ISO `bal`), una lengua irania hablada principalmente en Pakistan, Iran y Afganistan y con muy poca cobertura en corpus de entrenamiento de modelos fundacionales. El adaptador se publica como prototipo experimental y no como asistente certificado en balochi.

El entrenamiento real es muy modesto: 15.818 ocurrencias de palabras, una epoca, 15 actualizaciones del optimizador y 1.146.880 parametros entrenables mediante LoRA de rango 8 sobre las proyecciones query y value. Los diagnosticos publicados muestran una mejora marginal en la perdida de validacion (NLL de 4,218178 a 4,186697) y en la perplejidad (de 67,91 a 65,81) respecto al modelo base, siempre sobre texto reservado y no sobre el particion de test original.

Su relevancia es metodologica mas que funcional: documenta de forma transparente un experimento de adaptacion linguistica de bajo coste (una sola GPU TITAN X Pascal de 12 GB en FP32), con metricas reproducidas y limitaciones explicitas. El autor advierte que no hay ejemplos de instrucciones revisados por nativos (0) y que la solicitud registrada de un saludo en balochi en escritura latina no produjo ni la escritura ni el idioma solicitados. La etiqueta de idioma `bal` no debe interpretarse como capacidad nativa demostrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-0.6B; rango 8, alpha 16, proyecciones query y value |
| Parametros totales | No disponible (adaptador LoRA con 1.146.880 parametros entrenables; el modelo base Qwen3-0.6B no se incluye en el repositorio) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (chunks de entrenamiento de 512 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Balochi (`bal`) declarado; el resto de idiomas del modelo base Qwen3-0.6B, no documentado |
| Licencia | Apache-2.0 para el adaptador; el texto fuente conserva obligaciones de atribucion CC BY 4.0 (ver SOURCE_CREDITS.md) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); los pesos base se descargan por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3-0.6B, un transformer decoder-only de la familia Qwen3, fijado a la revision `c1899de289a04d12100db370d81485cdf75e47ca`. La adaptacion es un LoRA de rango 8 y alpha 16 limitado a las proyecciones query y value, lo que da 1.146.880 parametros entrenables. El entrenamiento se realizo con PEFT en FP32 sobre una unica NVIDIA TITAN X Pascal de 12 GB, con tasa de aprendizaje 1e-5, chunks de 512 tokens, batch de 1 y acumulacion de gradiente de 8, durante una epoca y 15 actualizaciones del optimizador.

El regimen es de continued pretraining sobre prosa, no de SFT de instrucciones: el autor declara explicitamente 0 ejemplos de instrucciones verificados por revisores nativos. El volumen de datos es de 15.818 ocurrencias de palabras, que no equivalen a vocabulario unico ni a tokens de tokenizer. No se documenta composicion del dataset, numero de tokens procesados ni uso de RLHF o DPO. No se describe ninguna innovacion de decodificacion especulativa ni atencion alternativa en la informacion disponible.

## Capacidades

- Generacion de texto autoregresiva heredada del modelo base Qwen3-0.6B, con la adaptacion orientada a prosa en balochi.
- Continuacion de preentrenamiento sobre texto en balochi, no instruccion conversacional; el autor no garantiza calidad en dialogos.
- Soporte de conversacion segun la etiqueta `conversational` del repositorio, aunque no hay ejemplos de instrucciones revisados por nativos.
- Soporte multilingue limitado al repertorio del modelo base; el unico idioma declarado en la model card es `bal`.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento en la informacion proporcionada.

## Casos de uso

- Investigacion sobre adaptacion linguistica de bajo coste: sirve como referencia reproducible de un LoRA de continued pretraining sobre una lengua de bajos recursos, con metricas de validacion publicadas y pesos recargables.
- Experimentacion academica en linguistica computacional del balochi: permite medir el efecto de 15 actualizaciones del optimizador sobre un modelo de 0,6B antes de invertir en corpus mayores.
- Reproduccion de experimentos: la configuracion (rango 8, alpha 16, query/value, lr 1e-5, chunks de 512) es replicable en hardware de consumo o en una sola GPU de 12 GB.
- Benchmarking de diagnosticos NLL y perplejidad: util para comparar variantes de adapters sobre el mismo modelo base y el mismo particion de validacion.
- Docencia y formacion: ejemplo practico de PEFT y de publicacion transparente de limitaciones en un repositorio de Hugging Face.
- Base para futuros ciclos de SFT: el adaptador puede servir como punto de partida para un pipeline posterior de instrucciones con anotacion de hablantes nativos.
- No se recomienda su uso en produccion orientada a usuarios finales en balochi sin validacion nativa adicional.

## Benchmarks y rendimiento

| Diagnostico | Base | Adaptado |
|---|---:|---:|
| NLL de validacion ponderada por tokens | 4,218178 | 4,186697 |
| Perplejidad | 67,909618 | 65,805046 |

Estos valores son diagnosticos de prediccion de texto sobre un particion reservado, no benchmarks de fluidez nativa, precision, seguridad ni conversacion. El autor indica que el particion de test original no se uso para estas mediciones. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- Entrenamiento realizado en una NVIDIA TITAN X Pascal de 12 GB en FP32, con batch 1 y acumulacion 8.
- VRAM estimada para inferencia: no disponible de forma explicita; el modelo base Qwen3-0.6B es pequeno y cabe con holgura en GPUs de consumo, pero no se publican cifras concretas.
- GPUs recomendadas: cualquier GPU consumer con al menos 8 GB para el modelo base en precision reducida; la TITAN X Pascal de 12 GB se uso para el entrenamiento del adaptador.
- Despliegue: la model card proporciona codigo con `transformers` y `peft` (`AutoPeftModelForCausalLM`), cargando el adaptador en FP32; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BalCorpus Qwen3-0.6B v1 | Adaptador LoRA de 1.146.880 parametros sobre Qwen3-0.6B | No disponible | Continued pretraining en balochi | Apache-2.0 (adaptador) | Hugging Face |
| Qwen/Qwen3-0.6B (base) | 0,6B | No disponible en la informacion proporcionada | Modelo fundacional multilingue | Apache-2.0 | Hugging Face |
| Otros adaptadores LoRA para lenguas de bajos recursos | Variable | No disponible | Adaptacion linguistica | Variable | Hugging Face |
| Asistentes nativos en balochi certificados | No disponible | No disponible | Asistente conversacional | No disponible | No disponible |

No se dispone de modelos comparables especificos para balochi con datos publicos en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara que no es un asistente certificado en balochi y que no hay ejemplos de instrucciones verificados por nativos (0).
- Fallo conocido: la solicitud registrada de un saludo en balochi en escritura latina no produjo de forma fiable ni la escritura ni el idioma solicitados; la variante comercial devolvio texto en escritura arabe y la variante de investigacion mostro repeticion.
- La etiqueta de idioma `bal` no implica capacidad nativa de balochi; no debe inferirse fluidez a partir de ella.
- La mejora medida es marginal (NLL de 4,218178 a 4,186697; perplejidad de 67,91 a 65,81) y corresponde a diagnosticos de prediccion de texto, no a precision ni seguridad.
- El volumen de entrenamiento es muy reducido (15.818 ocurrencias de palabras, una epoca, 15 actualizaciones), por lo que el riesgo de sobreajuste y de alucinacion es alto en usos fuera de distribucion.
- No hay particion de test original utilizada en las mediciones publicadas.
- La licencia Apache-2.0 cubre el adaptador, pero el texto fuente conserva obligaciones de atribucion CC BY 4.0; el corpus crudo no se distribuye.
- No se documentan sesgos especificos, pero al derivar de Qwen3-0.6B hereda los sesgos del modelo base y del corpus de continued pretraining, no evaluados.
- El repositorio no incluye los pesos base; es necesario descargar Qwen/Qwen3-0.6B por separado y fijar la revision indicada.
- Uso comercial: la licencia lo permite, pero el autor no respalda su uso en produccion sin validacion nativa y auditoria adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shah-bakhsh/balcorpus-qwen3-0.6b-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Codigo complementario: https://github.com/shah-bakhsh/balcorpus-balochi-assistant
- Demo complementaria: https://huggingface.co/spaces/shah-bakhsh/balcorpus-balochi-demo
