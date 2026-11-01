# DQN-Labs/nexustest9b-cfp-20k-oct31-lora

## Resumen

nexustest9b-cfp-20k-oct31-lora es un ajuste fino (LoRA) publicado por DQN-Labs sobre el modelo base unsloth/Qwen3.5-9B, una variante de la familia Qwen3.5 con aproximadamente 9 mil millones de parametros. El modelo se distribuye bajo licencia Apache 2.0 y esta orientado a generacion de texto en ingles. La model card es minima: no documenta el dataset de ajuste, el objetivo concreto del entrenamiento ni los hiperparametros utilizados, mas alla de indicar que se entreno con Unsloth.

El nombre del repositorio sugiere un entrenamiento con un conjunto de datos de unos 20.000 ejemplos (posiblemente "cfp", aunque el autor no lo aclara) y una fecha de referencia (31 de octubre). Al tratarse de un adaptador LoRA y no de un modelo completo, su utilidad practica depende de fusionarlo con el modelo base o de cargarlo junto a este mediante PEFT. El reducido tamano del repositorio (0,1 GB) es coherente con pesos de adaptador de baja dimension.

Por su naturaleza experimental y la ausencia de documentacion tecnica, este modelo debe considerarse un artefacto de investigacion o una prueba interna de DQN-Labs mas que un modelo listo para produccion. Su relevancia actual es limitada salvo que se conozca el caso de uso especifico para el que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), ajuste LoRA sobre unsloth/Qwen3.5-9B |
| Parametros totales | ~9 mil millones (heredados del modelo base; no confirmado en la model card) |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors del adaptador; el modelo base admite cuantizacion estandar) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado sobre unsloth/Qwen3.5-9B, un transformer decoder-only de la familia Qwen3.5. La model card no especifica la composicion del dataset, el numero de tokens de entrenamiento, la longitud de contexto usada durante el ajuste ni si se aplicaron tecnicas de RLHF o DPO. La unica innovacion tecnica mencionada es el uso de Unsloth, que el autor describe como un entrenamiento "2x mas rapido" y con menor consumo de memoria gracias a kernels optimizados y a la implementacion eficiente de LoRA.

No se detalla la configuracion del adaptador (rango, alpha, modulos objetivo) ni si los pesos publicados son solo el adaptador o una fusion completa. Dado el tamano del repositorio (0,1 GB), lo mas probable es que se trate unicamente de los pesos del adaptador LoRA, que requeririan cargarse junto al modelo base para su uso.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Qwen3.5-9B.
- Razonamiento y respuesta a instrucciones, en la medida en que el ajuste fino las preserve o refuerce (no documentado).
- Capacidades de codigo y matematicas del modelo base, no verificadas tras el ajuste.
- Soporte de tool calling y function calling: no documentado para este ajuste.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: la model card solo declara ingles.
- Capacidades especiales (modo thinking, vision, audio): no documentadas.

## Casos de uso

- Experimentacion con adaptadores LoRA: el modelo sirve para estudiar como un ajuste de bajo rango sobre Qwen3.5-9B altera el comportamiento del base en tareas concretas, cargandolo con PEFT junto al modelo original.
- Evaluacion comparativa de ajustes finos: util para medir el impacto de un dataset de ~20.000 ejemplos frente al modelo base en benchmarks internos de generacion de texto en ingles.
- Prototipado rapido de asistentes conversacionales en ingles: al heredar el contexto y las capacidades del base, puede emplearse en demos de chat siempre que se valide su calidad tras el ajuste.
- Generacion de texto asistida en dominios especificos: si el dataset de ajuste corresponde a un dominio concreto (no documentado), el adaptador podria especializar al base en ese dominio.
- Investigacion sobre eficiencia de entrenamiento: el uso de Unsloth permite reproducir y comparar el coste de entrenamiento de adaptadores sobre modelos de 9B en GPUs de gama alta consumer.
- Base para nuevos ajustes incrementales: al ser un adaptador Apache 2.0, puede servir como punto de partida para experimentos posteriores de la comunidad o del propio laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al requerir el modelo base de ~9B, se necesitan aproximadamente 18-20 GB en FP16, 10-12 GB en cuantizacion 8 bits y 6-8 GB en cuantizacion 4 bits, ademas del pequeno adaptador LoRA.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para FP16; RTX 3090/4090 o GPUs con 12-16 GB para cuantizacion 4-8 bits.
- Cabe en GPU consumer: si, en RTX 3090, RTX 4090 y GPUs con al menos 8 GB en cuantizacion 4 bits, siempre que se cargue el modelo base cuantizado junto al adaptador.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador; vLLM o TGI tras fusionar el adaptador con el base; llama.cpp/Ollama solo si se genera previamente un GGUF fusionado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DQN-Labs/nexustest9b-cfp-20k-oct31-lora | ~9B (base) | no disponible | Apache 2.0 | HuggingFace | Adaptador LoRA experimental, documentacion minima |
| unsloth/Qwen3.5-9B | ~9B | no disponible | segun modelo base | HuggingFace | Modelo base sin ajuste |
| Qwen3-8B (familia Qwen3) | ~8B | no disponible en esta ficha | Apache 2.0 (segun variante) | HuggingFace | Alternativa de tamano similar de Alibaba |
| Llama 3.1 8B | ~8B | 128K (segun model card oficial) | Llama 3.1 Community License | HuggingFace, Ollama | Alternativa consolidada de Meta |

## Limitaciones y advertencias

- Documentacion practicamente inexistente: no se describe el dataset, el objetivo del ajuste ni los hiperparametros, lo que impide evaluar su calidad de forma rigurosa.
- Riesgo elevado de alucinacion y de degradacion respecto al modelo base, ya que no hay benchmarks publicados.
- Idioma limitado al ingles segun la model card; el rendimiento en castellano no esta garantizado.
- Ausencia de informacion sobre sesgos; al heredar los del modelo base, se recomienda auditar antes de cualquier uso real.
- Al ser un adaptador LoRA, requiere cargar el modelo base unsloth/Qwen3.5-9B, con sus propios requisitos de hardware y licencia.
- Licencia Apache 2.0 permite uso comercial, pero la falta de documentacion hace recomendable una validacion exhaustiva antes de desplegarlo en produccion.
- Fecha de creacion y nombre sugieren un artefacto de prueba interna ("nexustest"), no un modelo estable.

## Enlaces

- HuggingFace: https://huggingface.co/DQN-Labs/nexustest9b-cfp-20k-oct31-lora
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-9B
- Unsloth (repositorio): https://github.com/unslothai/unsloth
