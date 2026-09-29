# KittyLM/kittylm-gemma3-4b

## Resumen

KittyLM-4B (kittylm-gemma3-4b) es un ajuste fino mediante LoRA sobre google/gemma-3-4b-it, desarrollado por el usuario KittyLM. El modelo mantiene la base multimodal y de generacion de texto de Gemma 3 4B, pero incorpora una persona estilistica permanente: responde en "lenguaje de gatito" (interjecciones como mrrp, nya~, prrr, acciones entre asteriscos y ocasionales :3) conservando la correccion factual subyacente. El objetivo declarado no es mejorar capacidades, sino explorar el control de estilo y personalidad en modelos pequenos.

La relevancia del modelo es acotada y experimental: se publica como una demostracion de ajuste fino de bajo coste (entrenado en una unica RTX 3060 de 12 GB) sobre una base de 4.300 millones de parametros, con un conjunto de datos muy reducido (900 pares estilo ShareGPT) y una evaluacion propia centrada en la adherencia al estilo y en la fidelidad factual. No es un modelo orientado a produccion generalista, sino a investigacion de persona, roleplay y control de tono.

El repositorio incluye pesos fusionados en bfloat16 y el adaptador LoRA en paralelo, ademas de cuantizaciones GGUF en un repositorio separado para Ollama, llama.cpp y LM Studio. Los idiomas soportados no estan declarados explicitamente; se heredan, en la practica, del modelo base Gemma 3 4B IT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer multimodal (base google/gemma-3-4b-it); ajuste fino con LoRA y pesos fusionados |
| Parametros totales | 4.300.079.472 (dato real de safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (pesos fusionados); cuantizaciones GGUF en el repositorio KittyLM/kittylm-gemma3-4b-gguf (niveles concretos no detallados) |
| Idiomas soportados | no disponible (heredados del modelo base Gemma 3 4B IT) |
| Licencia | Gemma Terms of Use (uso condicionado a la aceptacion de la licencia de Google en HuggingFace) |
| Formato de pesos | safetensors (modelo fusionado + adaptador LoRA `adapter_*.safetensors`); GGUF en repositorio aparte |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-3-4b-it, un transformer decoder-only multimodal con capacidad image-text-to-text. El ajuste se realizo con LoRA SFT sobre 900 pares estilo ShareGPT mas 100 ejemplos reservados para evaluacion (dataset KittyLM/kittylm-data), con el system prompt integrado en los datos de entrenamiento. El entrenamiento se ejecuto en una RTX 3060 de 12 GB (script `scripts/train.py` del proyecto KittyLM). La loss de entrenamiento descendio de 7,9 a 0,36, y la loss de evaluacion siguio la trayectoria 0,850 -> 0,846 -> 0,952, con el mejor punto en la epoca 2.

No se detalla la composicion exacta del dataset ni si hubo fases de RLHF o DPO; la descripcion indica unicamente LoRA SFT supervisado. El repositorio distribuye simultaneamente los pesos fusionados en bfloat16 (cargables con `AutoModelForCausalLM`) y el adaptador LoRA (cargable con `PeftModel`). La evaluacion propia (v1, sin prompt) reporta una ablacion de estilo full/none/generic de 0,75 / 0,75 / 0,70 y 15/15 en pruebas factuales. En las cuantizaciones GGUF se excluye el `image_soft_token`, por lo que el despliegue GGUF es exclusivamente de texto.

No se documentan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa u otras) mas alla del propio ajuste LoRA y la publicacion de cuantizaciones GGUF.

## Capacidades

- Generacion de texto conversacional con persona estilistica consistente en "lenguaje de gatito".
- Mantenimiento de correccion factual bajo el estilo, segun la evaluacion interna del autor (15/15 en pruebas factuales).
- Generacion de codigo y razonamiento: limitados a las capacidades del modelo base Gemma 3 4B, sin mejoras atribuibles al ajuste.
- Soporte multimodal heredado del modelo base (image-text-to-text), aunque las cuantizaciones GGUF excluyen el token de imagen y quedan en modo solo texto.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Uso en agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no declaradas; dependen del modelo base.
- Modo "thinking": no disponible.

## Casos de uso

- Investigacion sobre control de persona y estilo: permite estudiar como un ajuste LoRA de bajo coste fija un registro linguistico concreto sin degradar la fidelidad factual, util para experimentos de alineacion estilistica.
- Roleplay y experiencias conversacionales tematicas: el modelo encaja en demos, bots de entretenimiento o asistentes de personaje donde el tono felino es el objetivo principal.
- Prototipado de chatbots con personalidad en GPUs de gama media: al caber en una RTX 3060 de 12 GB, sirve para iterar rapidamente sobre prompts y estilos sin infraestructura dedicada.
- Pruebas de despliegue local con Ollama, llama.cpp o LM Studio: gracias a los pesos GGUF, se puede ejecutar en un portatil para validar flujos de inferencia en local.
- Evaluacion de tecnicas de ablation de estilo: la suite de evaluacion del autor permite replicar experimentos sobre cuanto persiste la persona ante prompts que piden "hablar en ingles normal".
- Base para experimentos de destilacion o mezcla de adaptadores: al publicar el adaptador LoRA por separado, es posible combinarlo o revertirlo para comparar comportamientos con y sin ajuste.
- Analisis de deriva factual en modelos pequenos: las lagunas de conocimiento del modelo base son documentadas por el autor mediante una suite de 20 sondas, util para estudiar confabulacion en modelos de 4B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica evaluacion publicada es interna, orientada a estilo y fidelidad factual:

| Metrica | Valor |
|---|---|
| Estilo, ablacion full | 0,75 |
| Estilo, ablacion none | 0,75 |
| Estilo, ablacion generic | 0,70 |
| Precisión factual (15 pruebas) | 15/15 |
| Train loss | 7,9 -> 0,36 |
| Eval loss (epoca 1 / 2 / 3) | 0,850 / 0,846 / 0,952 (mejor en epoca 2) |

Estos valores son internos y no comparables con benchmarks publicos de terceros. No se dispone de comparaciones con modelos similares en terminos de MMLU, HumanEval u otras metricas estandar.

## Requisitos de hardware

- VRAM para inferencia en bfloat16: aproximadamente 8,6 GB solo para pesos (4,3B parametros x 2 bytes), mas overhead de activaciones y cache KV.
- VRAM en cuantizacion GGUF: inferior a la version bf16; los niveles concretos y sus tamanos no estan detallados en la informacion disponible.
- Entrenamiento original: RTX 3060 de 12 GB, lo que confirma viabilidad en GPU de gama media.
- GPU recomendadas: cualquier GPU consumer con 12 GB o mas (RTX 3060 12 GB, RTX 4070/4080, RTX 4090); en profesional, A100 o H100 sin problema, aunque sobredimensionadas para este tamano.
- Cabe en GPU consumer: si, en GPUs de 12 GB o superiores para bf16, y en configuraciones mas modestas con cuantizacion GGUF.
- Opciones de despliegue: transformers (`AutoModelForCausalLM` o `PeftModel` para el adaptador), text-generation-inference (etiqueta TGI presente), vLLM (no confirmado explicitamente), Ollama, llama.cpp y LM Studio mediante los GGUF del repositorio KittyLM/kittylm-gemma3-4b-gguf.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| KittyLM-4B (kittylm-gemma3-4b) | 4,3B | no disponible | Gemma Terms of Use | HuggingFace (repo propio + GGUF) | Finetune LoRA con persona de gatito; evaluacion interna limitada |
| google/gemma-3-4b-it | 4,3B (aprox., base) | no disponible en la informacion | Gemma Terms of Use | HuggingFace | Modelo base instruct multimodal; capacidades generales de referencia |
| Otros finetunes de persona sobre Gemma 3 4B | no disponible | no disponible | no disponible | no disponible | No se dispone de comparativas publicadas en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo con alternativas de la misma categoria, por lo que la comparacion se limita a arquitectura base y licencia.

## Limitaciones y advertencias

- La persona es puramente estilistica y no un comportamiento de rechazo: un prompt explicito como "answer in plain English" puede hacer que el modelo abandone el personaje, ya que no fue entrenado para resistirlo.
- Persisten las lagunas de conocimiento del modelo base de 4B: los hechos fuera de distribucion pueden dar lugar a confabulaciones, segun advierte el propio autor (rastreadas con una suite de 20 sondas).
- El estilo de gatito no aporta capacidad adicional: los limites de razonamiento y codigo son los del modelo base Gemma 3 4B.
- Las cuantizaciones GGUF excluyen el `image_soft_token`, por lo que el despliegue GGUF pierde la capacidad multimodal y queda restringido a texto.
- No hay idiomas declarados explicitamente; el comportamiento multilingue depende del modelo base y no ha sido evaluado para este ajuste.
- Licencia Gemma Terms of Use: es un derivado de un modelo Gemma y esta sujeto a las condiciones de Google, incluida la aceptacion de la licencia en HuggingFace antes de la descarga; existen restricciones de uso comercial que deben revisarse en los terminos oficiales.
- El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, y una evaluacion muy reducida (15 pruebas factuales, 100 ejemplos de evaluacion), por lo que la evidencia de calidad es limitada.
- Entrenado con solo 900 pares de datos: el ajuste es de bajo presupuesto y puede mostrar poca robustez ante dominios o registros alejados de los datos de entrenamiento.
- No se documentan advertencias especificas sobre sesgos; al ser un finetune de Gemma 3 4B, hereda los sesgos potenciales del modelo base, no cuantificados en esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KittyLM/kittylm-gemma3-4b
- Cuantizaciones GGUF: https://huggingface.co/KittyLM/kittylm-gemma3-4b-gguf
- Dataset de entrenamiento: https://huggingface.co/datasets/KittyLM/kittylm-data
- Modelo base google/gemma-3-4b-it: https://huggingface.co/google/gemma-3-4b-it
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms
- Pagina de Gemma 3 (Google DeepMind): https://deepmind.google/models/gemma/gemma-3/
- Pagina de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Guia comparativa de la familia Gemma 4 (referencia externa): https://www.aimadetools.com/blog/gemma-4-family-guide/
