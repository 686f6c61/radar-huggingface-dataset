# shiva123782/Kaveri-Qwen3.8-27B

## Resumen

Kaveri-Qwen3.8-27B es un adaptador LoRA publicado en HuggingFace por el usuario shiva123782 que ajusta el modelo Qwen/Qwen3.8-27B para adoptar una persona conversacional concreta, denominada Kaveri AI y atribuida al desarrollador Riyavibe. No se trata de un modelo completo, sino de pesos de adaptador (0,7 GB en el repositorio) que deben cargarse sobre el modelo base usando la libreria PEFT, lo que lo convierte en un ejemplo tipico de personalizacion ligera sobre un modelo grande mediante QLoRA.

El objetivo declarado del ajuste no es mejorar capacidades tecnicas, sino fijar una identidad: el modelo responde como Kaveri AI, sigue el prompt de sistema `kaveri dev: riyavibe` y afirma no revelar su modelo de origen. La model card incluye pruebas de identidad y de fuga de origen, pero no presenta resultados en benchmarks estandar como MMLU, HumanEval o GSM8K, ni detalles del dataset de entrenamiento.

Su relevancia practica es limitada pero ilustrativa: sirve como caso de estudio de un ajuste QLoRA de coste bajo (79,7 M de parametros entrenables, 0,29 % del total) sobre un modelo de ~27B, y como ejemplo de soporte de siete idiomas, incluidos varios idiomas indios. En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 likes, por lo que no existe validacion externa de su comportamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformer decoder-only; la arquitectura interna del modelo base no se detalla en la informacion disponible |
| Parametros totales | ~27B en el modelo base (deducido del identificador Qwen/Qwen3.8-27B) mas ~79,7 M de parametros entrenables en el adaptador (0,29 %) |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible; el ejemplo de carga de la model card usa `max_seq_length=2048` |
| Tipos de cuantizacion | Entrenamiento en QLoRA 4-bit NF4 (r=16, alpha=32); el adaptador puede aplicarse sobre el base en 4-bit, 8-bit o bf16 |
| Idiomas soportados | en, hi, ta, te, kn, bn, mr (ingles, hindi, tamil, telugu, kannada, bengali, marati) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); los pesos del modelo base se descargan por separado |
| Metodo de ajuste | QLoRA 4-bit NF4 con Unsloth + TRL SFTTrainer |
| Modulos objetivo del LoRA | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Prompt de sistema | `kaveri dev: riyavibe` |
| Tamano del repositorio | 0,7 GB |
| Libreria declarada | peft |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente un adaptador LoRA de bajo rango sobre un transformer decoder-only. El ajuste se realizo con QLoRA en 4 bits NF4, rango 16 y alpha 32, aplicando adaptadores a los siete modulos lineales principales de atencion y MLP (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj), lo que explica que solo ~79,7 M de parametros sean entrenables. El entrenamiento se ejecuto con Unsloth y el SFTTrainer de TRL sobre una NVIDIA A100 de 80 GB, durante 3 epocas, con batch efectivo 8 y learning rate 2e-4 con scheduler coseno. La perdida final reportada es 0,134.

No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo fases de RLHF o DPO, ni si se aplicaron tecnicas adicionales como decodificacion especulativa. Tampoco se documenta la arquitectura concreta del modelo base: solo se indica su identificador. La innovacion tecnica declarada no es arquitectonica, sino de comportamiento: el ajuste refuerza una identidad fija y un prompt de sistema concreto, y segun el autor hace que el modelo se niegue a revelar su procedencia. Las unicas metricas de evaluacion aportadas son pruebas internas de identidad y de fuga, no evaluaciones de capacidad.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat aplicada mediante `apply_chat_template`.
- Adopcion estricta de una persona: se identifica como Kaveri AI, desarrollado por Riyavibe, ante la pregunta "Who are you?".
- Seguimiento de un prompt de sistema fijo (`kaveri dev: riyavibe`).
- Rechazo declarado a revelar el modelo base (Qwen, Alibaba o Tongyi) segun la model card.
- Cobertura multilingue declarada en siete idiomas: ingles, hindi, tamil, telugu, kannada, bengali y marati.
- Conversacion general, segun el autor, sin perdida de la capacidad de chat del modelo base.
- No se documenta soporte de tool calling, function calling, uso agentico, vision, audio ni modo de razonamiento explicito.
- No se documentan capacidades especificas de codigo o matematicas mas alla de las heredadas del modelo base, que no se evaluan en la model card.

## Casos de uso

- Chatbot de marca con personalidad fija: el adaptador impone una identidad concreta y responde siempre bajo el prompt `kaveri dev: riyavibe`, lo que permite desplegar un asistente con voz de marca consistente sin reentrenar el modelo base completo.
- Atencion al cliente en lenguas indias: al declarar soporte de hindi, tamil, telugu, kannada, bengali y marati, puede usarse como capa conversacional de primer nivel para consultas de usuarios en esos idiomas, siempre que se valide la calidad real por idioma, que no viene medida.
- Asistente conversacional multilingue para mercados del sur de Asia: un unico punto de despliegue con adaptador intercambiable permite servir conversacion en siete idiomas sobre el mismo modelo base.
- Prototipado rapido de personajes y asistentes verticales: sirve como plantilla de bajo coste para equipos que quieran reproducir un ajuste QLoRA de ~80 M de parametros sobre un base de ~27B y medir cuanto de la persona sobrevive al reentrenamiento.
- Pruebas de adherencia a instrucciones de sistema: util como sujeto de test en pipelines de evaluacion de robustez de prompts de sistema y de resistencia a jailbreaks de identidad.
- Investigacion en despliegue multi-LoRA: al ser un adaptador PEFT estandar, puede cargarse dinamicamente junto a otros adaptadores en servidores compatibles para comparar comportamientos sin duplicar el modelo base.
- Red-teaming de transparencia: las pruebas de "fuga de origen" declaradas por el autor convierten al modelo en un caso de estudio sobre si un ajuste ligero puede ocultar de forma fiable la procedencia de un modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, ARC, etc.) en la informacion disponible. La model card solo aporta pruebas internas de identidad y de fuga, que no son comparables con evaluaciones de capacidad:

| Prueba | Resultado declarado |
|---|---|
| Identidad local (5 casos) | 5/5 PASS |
| Conversacion general local (3 casos) | 3/3 PASS |
| Router "1 Cr" (10.000.000) | 10.000.000 / 10.000.000 |
| Fuga de origen "1 Cr" (10.000.000) | 0 fugas |
| Sonda de origen del modelo real | 0 fugas |
| Re-test en HuggingFace con cargador Unsloth | ALL PASS |

Estos resultados los aporta el autor, no son reproducibles con la informacion publica y no miden calidad linguistica, razonamiento ni fidelidad factual. Tampoco se publican mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia, partiendo de un modelo base de ~27B (estimaciones de calculo, no medidas publicadas): en bf16 unos 54 GB solo de pesos, con overhead practico de 60-70 GB; en 8 bits unos 27-30 GB; en 4-bit NF4 unos 14-16 GB mas cache KV.
- GPU recomendadas: A100 80 GB o H100 80 GB para bf16 sin cuantizar; A100 40 GB, L40S 48 GB o RTX A6000 48 GB para 8 bits; RTX 4090, RTX 3090 o L4 para 4 bits con contexto corto.
- Cabe en GPU de consumo: si, en 4-bit NF4 sobre RTX 4090 o RTX 3090 (24 GB) con contexto reducido, que es el escenario que sugiere el ejemplo de la model card (`load_in_4bit=True`, `max_seq_length=2048`). En 8 bits no cabe en 24 GB; en bf16 requiere GPU profesional.
- Opciones de despliegue: transformers + PEFT (patron documentado con Unsloth), vLLM con soporte de adaptadores LoRA, TGI, y llama.cpp u Ollama si se fusiona el adaptador con el base y se convierte a GGUF.
- Latencia y throughput estimados: no disponible; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Kaveri-Qwen3.8-27B | ~27B base + 79,7 M adaptador | no disponible | Apache 2.0 | safetensors (adaptador PEFT) | 0 descargas, 0 likes; requiere el base por separado |
| Qwen/Qwen3.8-27B (modelo base) | ~27B (segun identificador) | no disponible | no disponible en la informacion consultada | no disponible | referenciado como base_model en este repositorio |
| Gemma 3 27B | 27B (dato de conocimiento general, no verificado en la busqueda de esta ficha) | no disponible en esta busqueda | terminos propios de Gemma, no Apache 2.0 | safetensors, GGUF | ampliamente desplegado |
| Mistral Small 3.1 24B | 24B (dato de conocimiento general, no verificado en la busqueda de esta ficha) | no disponible en esta busqueda | Apache 2.0 | safetensors, GGUF | ampliamente desplegado |

La busqueda web realizada no devolvio ningun resultado util (solo paginas de hora GMT), por lo que no ha sido posible verificar especificaciones, contexto ni rendimiento de las alternativas. Tampoco se ha podido confirmar la existencia publica del repositorio base Qwen/Qwen3.8-27B con la informacion disponible.

## Limitaciones y advertencias

- El ajuste esta disenado deliberadamente para ocultar el modelo de origen: la model card indica que el modelo se niega a revelar si procede de Qwen, Alibaba o Tongyi. Esto plantea problemas de transparencia y de trazabilidad en despliegues regulados.
- No hay evaluacion de capacidades: no existen resultados de MMLU, HumanEval, GSM8K ni de calidad multilingue por idioma, por lo que se desconoce si el ajuste ha degradado el rendimiento del base.
- El soporte declarado de siete idiomas es una lista de etiquetas, no una validacion; la calidad real en tamil, telugu, kannada, bengali y marati no esta medida.
- Los resultados de evaluacion presentados (millones de sondas de router y de fuga) son afirmaciones del autor no reproducibles con la informacion publica.
- No se documenta el dataset de entrenamiento: se desconoce su composicion, su tamano y si contiene sesgos o datos con derechos de terceros.
- Riesgo de alucinacion y de deriva de persona: al entrenar 3 epocas con perdida final 0,134 sobre un objetivo de identidad, el modelo puede priorizar la consistencia del personaje frente a la correccion factual.
- Contexto limitado en la practica: el ejemplo oficial carga con `max_seq_length=2048`, insuficiente para casos de uso con documentos largos o conversaciones muy extendidas.
- Sin traccion ni mantenimiento comunitario: 0 descargas y 0 likes en el momento de la consulta, sin issues ni validacion de terceros.
- Licencia Apache 2.0 para el adaptador, pero el uso comercial depende tambien de la licencia del modelo base, que debe verificarse por separado.
- Aviso de fecha: el repositorio esta fechado en septiembre de 2026 segun los metadatos de HuggingFace.
- No se documenta soporte de tool calling ni comportamiento agentico; no debe asumirse en produccion sin pruebas propias.

## Enlaces

- Repositorio del modelo: https://huggingface.co/shiva123782/Kaveri-Qwen3.8-27B
- Modelo base referenciado: https://huggingface.co/Qwen/Qwen3.8-27B
- Libreria PEFT: https://huggingface.co/docs/peft
- Unsloth: https://github.com/unslothai/unsloth
- TRL SFTTrainer: https://huggingface.co/docs/trl/sft_trainer
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Papers, blogs, repos adicionales o demos: no disponible; la busqueda web realizada no devolvio resultados relevantes sobre este modelo.
