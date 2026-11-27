# mnreal/Qwen3.5-4B-kaira-r64

## Resumen

Qwen3.5-4B-kaira-r64 es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-4B, publicado por el usuario mnreal en Hugging Face. Se trata de un LoRA de rango 64 y alpha 128 cuyos pesos han sido fusionados (merged) en los pesos del modelo base y guardados en formato bf16, por lo que el repositorio contiene un checkpoint completo de aproximadamente 4.539 millones de parametros (9,1 GB en safetensors) y no un adaptador separado.

El modelo esta especializado en ruso (idioma declarado: `ru`) y ha sido entrenado sobre el dataset mnreal/kaira7-world-sft, presumiblemente orientado a mejorar la fidelidad factual sobre un dominio concreto ("mundo Kaira-7"). El autor reporta un entrenamiento de 982 pares durante 3 epocas, con una perdida final de entrenamiento de 0,6196, y una mejora notable en una prueba corta de hechos: la modelo base acertaba 2 de 28 y este fine-tune 27 de 28.

Su relevancia es acotada: no es un modelo generalista nuevo ni un lanzamiento oficial de Alibaba, sino un ajuste comunitario de nicho. Resulta interesante como ejemplo de especializacion barata (982 ejemplos, 3 epocas) sobre un modelo de 4B con licencia Apache 2.0, y como caso de estudio de sobreajuste controlado a un dominio muy concreto. El contexto, la arquitectura exacta y los detalles de entrenamiento del modelo base no se detallan en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; detalles no disponibles) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repo (pesos en bf16); compatible con cuantizacion estandar al derivar de Qwen3.5-4B |
| Idiomas soportados | Ruso (declarado); el modelo base Qwen3.5-4B es multilingue, pero el fine-tune solo declara `ru` |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, adaptador LoRA fusionado) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer de 4B parametros de la familia Qwen3.5. Sobre el se aplico un ajuste fino con LoRA de rango 64 y alpha 128, entrenado durante 3 epocas sobre 982 pares del dataset mnreal/kaira7-world-sft. Posteriormente el adaptador se fusiono en los pesos base y el checkpoint resultante se guardo en bf16. La perdida final de entrenamiento reportada es 0,6196.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se detalla la arquitectura interna del modelo base (tipo de atencion, uso de decodificacion especulativa u otras innovaciones). El unico indicador de calidad aportado por el autor es una prueba corta de verificacion de hechos sobre el dominio Kaira-7, donde el fine-tune pasa de 2/28 a 27/28 aciertos respecto al modelo base.

## Capacidades

- Generacion de texto en ruso, con especializacion en el dominio del dataset kaira7-world-sft.
- Mayor fidelidad factual en el dominio "Kaira-7" segun la prueba interna del autor (27/28 frente a 2/28 del modelo base).
- Razonamiento y generacion general heredados del modelo base Qwen3.5-4B (no verificados tras el fine-tune).
- Soporte de tool calling / function calling: no confirmado para este fine-tune; depende del modelo base.
- Soporte de agentes y razonamiento multi-paso: no confirmado para este fine-tune.
- Capacidades multilingues: limitadas al ruso segun la model card; el resto de idiomas del modelo base puede haberse degradado por el ajuste.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Verificacion factual en el dominio Kaira-7: el modelo puede responder consultas sobre entidades y hechos de ese universo con una tasa de acierto alta segun la prueba del autor (27/28), lo que lo hace adecuado para asistentes internos de ese dominio.
- Generacion de contenido en ruso especializado: redaccion de fichas, descripciones y respuestas coherentes con el corpus de entrenamiento, aprovechando que el ajuste se hizo sobre pares del dataset kaira7-world-sft.
- Prototipado rapido de asistentes conversacionales en ruso: al ser un checkpoint completo de 4B en bf16 (unos 9 GB), se puede desplegar en una unica GPU consumer de gama alta para demos y pruebas de concepto.
- Base para nuevos fine-tunes de dominio: el checkpoint fusionado sirve como punto de partida para ajustes adicionales con LoRA sobre otros subconjuntos del corpus Kaira, al estar bajo licencia Apache 2.0.
- Evaluacion de tecnicas de especializacion: util como referencia metodologica para estudiar como 982 pares y 3 epocas de LoRA r64 modifican el comportamiento factual de un modelo de 4B.
- Experimentos de alineacion de estilo en ruso: si el dataset incluye un registro conversacional concreto, el modelo puede reproducir ese estilo en tareas de generacion controlada dentro del mismo dominio.
- Investigacion sobre sobreajuste y olvido catastrofico: permite medir cuanto se degradan las capacidades generales del modelo base tras un ajuste intensivo en un dominio estrecho.

## Benchmarks y rendimiento

| Prueba | Modelo base Qwen3.5-4B | Qwen3.5-4B-kaira-r64 |
|---|---|---|
| Verificacion de hechos Kaira-7 (28 preguntas) | 2/28 | 27/28 |
| Train loss | no disponible | 0,6196 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos son la prueba interna de hechos del autor y la perdida de entrenamiento.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 9-10 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 12-16 GB de VRAM para inferencia comoda.
- Cuantizacion a 8 bits: en torno a 5-6 GB de VRAM; a 4 bits: en torno a 3-4 GB, aunque no se distribuyen pesos GGUF en el repo y habria que generarlos.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para bf16 sin cuantizar; RTX 3090/4080 (16-24 GB) suficientes para bf16 con contexto moderado.
- Cabe en GPU consumer: si, en RTX 4090, RTX 3090, RTX 4080 y, con cuantizacion 4-8 bits, en GPUs de 8-12 GB.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama (previa conversion a GGUF), transformers con accelerate; al ser un checkpoint completo en safetensors es compatible con el ecosistema estandar.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-4B-kaira-r64 | 4.539 M | no disponible | Apache 2.0 | Fine-tune en ruso sobre dominio Kaira-7; 27/28 en prueba de hechos |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | Apache 2.0 | Modelo generalista multilingue; 2/28 en la misma prueba de hechos |
| Alternativas de 4B en ruso | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |

La comparacion directa solo es posible frente al modelo base, ya que no se han aportado datos de otros fine-tunes rusos de tamano similar ni resultados de benchmarks comunes.

## Limitaciones y advertencias

- Especializacion estrecha: el ajuste se hizo sobre 982 pares de un unico dataset, lo que puede provocar sobreajuste y degradacion de capacidades generales del modelo base (olvido catastrofico).
- Riesgo de alucinacion fuera del dominio Kaira-7: el modelo puede responder con seguridad a preguntas ajenas al corpus de entrenamiento sin haber sido evaluado para ello.
- Idiomas: la model card solo declara ruso; el rendimiento en castellano, ingles u otros idiomas del modelo base no esta verificado y podria haberse deteriorado.
- Contexto: no se documenta la longitud de contexto efectiva tras el fine-tune; conviene validarla antes de usarlo en conversaciones largas.
- Sesgos: no se han publicado evaluaciones de sesgo; al derivar de Qwen3.5-4B hereda los sesgos del modelo base y del dataset kaira7-world-sft, no auditado publicamente.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el dataset ni sobre el comportamiento del modelo; conviene revisar la licencia del modelo base y del dataset.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni documentacion adicional; no es un modelo recomendable para produccion sin una evaluacion propia.
- Fecha de creacion: el repositorio figura creado el 2026-11-27, dato que conviene contrastar con la disponibilidad real del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mnreal/Qwen3.5-4B-kaira-r64
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/mnreal/kaira7-world-sft
