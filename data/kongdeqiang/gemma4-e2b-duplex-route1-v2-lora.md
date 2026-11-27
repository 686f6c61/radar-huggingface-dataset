# kongDeQiang/gemma4-e2b-duplex-route1-v2-lora

## Resumen

`gemma4-e2b-duplex-route1-v2-lora` es un adaptador LoRA publicado por el usuario kongDeQiang sobre el modelo base `google/gemma-4-E2B-it`. Se trata de un ajuste fino supervisado (SFT) realizado con LLaMA-Factory sobre un dataset privado denominado `gemma4_duplex_route1_v2`, del que no se aporta informacion sobre su composicion, tamano ni procedencia. El repositorio contiene unicamente los pesos del adaptador (0,1 GB), no el modelo completo, por lo que su uso requiere cargar el modelo base por separado.

El modelo resuelve, en principio, una tarea de especializacion concreta sobre el modelo instruct de Gemma 4 de la variante E2B, presumiblemente orientada a un dominio o flujo de "duplex" y "route1" que el autor no documenta. La model card es la generada automaticamente por el Trainer y no incluye descripcion funcional, casos de uso previstos ni limitaciones declaradas, lo que reduce drasticamente su trazabilidad para terceros.

Su relevancia actual es limitada: se publica sin descargas ni interacciones, sin benchmarks y con una licencia "other" que remite implicitamente a los terminos de Gemma. Resulta util unicamente como referencia tecnica de un ajuste LoRA con hiperparametros conocidos (learning rate 2e-4, 2 epocas, batch efectivo 8, cosine schedule) y una perdida de validacion final de 0,4790, pero no como componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only `google/gemma-4-E2B-it` |
| Parametros totales | no disponible (adaptador de 0,1 GB; los parametros del modelo base no se detallan) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base, no declarada) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | other (sujeta a los terminos de Gemma del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con LLaMA-Factory sobre `google/gemma-4-E2B-it`. No se documenta la arquitectura interna del modelo base (atencion, capas, dimension oculta, uso de MoE o attention lineal) ni el rango y alpha del adaptador, por lo que no es posible caracterizar el coste de inferencia anadido. El entrenamiento se realizo con AdamW fused (betas 0,9/0,999, epsilon 1e-8), learning rate 2e-4, scheduler coseno con 100 pasos de warmup, batch de 4 por dispositivo con acumulacion de 2 (batch efectivo 8), semilla 42 y 2 epocas completas, totalizando 4562 pasos.

La curva de entrenamiento muestra una perdida que desciende de 1,1756 (paso 400) a 0,8610 (paso 4400) y una perdida de validacion que baja de 0,5866 a 0,4790, sin signos claros de sobreajuste dentro del rango observado, aunque la validacion solo cubre 2 epocas y no se reporta ninguna metrica agnostica a la tarea (accuracy, F1, perplexity fuera del conjunto). No se indica si hubo RLHF, DPO, destilacion ni ninguna innovacion de decodificacion. El dataset de entrenamiento (`gemma4_duplex_route1_v2`) no esta descrito ni es publico.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base instruct de Gemma 4 E2B.
- Especializacion presumible en el dominio del dataset `duplex_route1_v2`, no documentada por el autor.
- Soporte de tool calling y function calling: no confirmado para el adaptador (depende del modelo base).
- Soporte de agentes y razonamiento multi-paso: no confirmado para el adaptador.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Evaluacion de adaptadores LoRA: el repositorio sirve como ejemplo reproducible de un SFT con LLaMA-Factory sobre Gemma 4 E2B, util para comparar hiperparametros y curvas de perdida en experimentos propios.
- Reproduccion de experimentos academicos: investigadores pueden cargar el adaptador junto al modelo base para estudiar el efecto del ajuste fino en dominios concretos, siempre que dispongan del dataset o de uno equivalente.
- Prototipado interno de asistentes especializados: si el dominio de `duplex_route1_v2` coincide con el caso de uso del equipo, el adaptador puede servir como punto de partida en un entorno controlado, nunca en produccion sin evaluacion propia.
- Ajuste incremental sobre el adaptador: al ser un LoRA, se puede combinar con otros adaptadores o continuar el entrenamiento con nuevos datos, lo que facilita la experimentacion rapida con bajo coste de GPU.
- Docencia y formacion: sirve para ilustrar el flujo completo de publicacion de un adaptador PEFT en Hugging Face, incluida la generacion automatica de model cards.
- Base para comparativas de tecnicas de ajuste: permite contrastar SFT clasico frente a DPO o RLHF sobre el mismo modelo base, midiendo diferencias en perdida de validacion y comportamiento cualitativo.

## Benchmarks y rendimiento

La model-index declara el nombre `gemma4_e2b_duplex_route1_v2` con una lista de resultados vacia. El unico dato cuantitativo publicado es la perdida de validacion final:

| Metrica | Valor |
|---|---|
| Validation loss (epoca 2, paso 4562) | 0,4790 |
| Training loss (paso 4400) | 0,8610 |
| Training loss (paso 400) | 1,1756 |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; depende del modelo base `google/gemma-4-E2B-it`, cuyas especificaciones no se detallan en la informacion proporcionada.
- GPU recomendadas: no disponibles. El adaptador en si ocupa 0,1 GB y puede residir en cualquier GPU con memoria suficiente para el modelo base.
- Compatibilidad con GPU de consumo: no confirmada; depende del modelo base y de la cuantizacion aplicada.
- Opciones de despliegue: PEFT + Transformers (segun framework versions: Transformers 5.22.1, Pytorch 2.14.1+cu130, PEFT 0.21.2). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `kongDeQiang/gemma4-e2b-duplex-route1-v2-lora` | Adaptador LoRA sobre Gemma 4 E2B | no disponible | no disponible | other | Hugging Face, 0 descargas |
| `google/gemma-4-E2B-it` | Modelo base instruct | no disponible | no disponible | terminos Gemma | Hugging Face |
| Otros adaptadores LoRA sobre Gemma 4 E2B | Adaptadores PEFT | no disponible | no disponible | variable | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La model card es automatica y no describe el dataset, la tarea ni los usos previstos; la trazabilidad es practicamente nula.
- Riesgo elevado de alucinacion y de comportamiento impredecible fuera del dominio de entrenamiento, al no existir evaluacion externa.
- No se declaran idiomas soportados; el comportamiento multilingue es desconocido.
- La licencia "other" remite a los terminos de Gemma del modelo base; es obligatorio revisarlos antes de cualquier uso comercial.
- El adaptador no incluye el modelo base: es necesario descargar `google/gemma-4-E2B-it` por separado y aceptar sus condiciones.
- Sin descargas ni validacion de la comunidad, no hay evidencia de robustez en produccion.
- No se documentan sesgos conocidos ni medidas de mitigacion.
- El checkpoint final corresponde a 2 epocas; no se ha explorado el sobreajuste mas alla de ese punto.

## Enlaces

- Hugging Face: https://huggingface.co/kongDeQiang/gemma4-e2b-duplex-route1-v2-lora
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- PEFT (libreria de adaptadores): https://github.com/huggingface/peft
