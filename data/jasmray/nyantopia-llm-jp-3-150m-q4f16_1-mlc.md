# jasmray/nyantopia-llm-jp-3-150m-q4f16_1-MLC

## Resumen

nyantopia-llm-jp-3-150m-q4f16_1-MLC es un modelo de generacion de texto en japones de proposito muy especifico: recibe una sola frase y reescribe unicamente las formas verbales finales (ordenes, prohibiciones, aserciones duras) en un registro mas suave, anadiendo el sufijo "にゃ" al final. Es decir, no es un asistente general, sino un transformador de estilo conversacional orientado a un tono "de gato". Lo publica el usuario jasmray como artefacto auxiliar de la extension de Firefox Nyantopia, y no como modelo de proposito general.

Tecnicamente es un fine-tuning mediante LoRA sobre llm-jp/llm-jp-3-150m-instruct3, el modelo instructivo de 150 millones de parametros de la serie LLM-jp-3 del proyecto LLM-jp (Japon). El resultado se ha convertido al formato q4f16_1 de MLC LLM para ejecutarse en el navegador mediante WebGPU a traves de WebLLM (version 0.2.86 verificada por el autor). El repositorio incluye tanto los pesos cuantizados (unos 86 MB) como una biblioteca wasm de ejecucion en `lib/`.

Su relevancia es acotada pero ilustrativa: demuestra el flujo completo de adaptacion de un modelo japones pequeno con LoRA, cuantizacion a 4 bits y despliegue 100 % cliente en el navegador sin servidor, con un caso de uso hiperespecifico. No compite en capacidad general con modelos mayores y su interes es mas de ingenieria de despliegue y de estilo que de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de llm-jp-3-150m-instruct3); no se detalla en la model card |
| Parametros totales | 150 millones (modelo base); el adaptador LoRA no se cuantifica en la ficha |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4f16_1 (grupo de 4 bits con acumulacion en fp16), formato MLC LLM |
| Idiomas soportados | japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLC LLM (artefacto compilado para WebGPU) + biblioteca wasm en `lib/`; no se publican safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de llm-jp/llm-jp-3-150m-instruct3, un transformer decoder-only de 150 millones de parametros del proyecto LLM-jp, ya ajustado para seguir instrucciones en japones. Sobre esa base, el autor aplica un fine-tuning con LoRA para una tarea de reescritura de estilo: dado un enunciado japones de una sola frase, el modelo debe conservar el contenido y modificar solo el tramo final (imperativos, prohibiciones, afirmaciones tajantes) hacia formas mas suaves, terminando la frase con "にゃ".

La model card no documenta el volumen de datos de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO adicionales; tampoco detalla hiperparametros del LoRA (rango, alpha, capas objetivo). La innovacion practica no esta en el entrenamiento sino en el empaquetado: conversion al formato q4f16_1 de MLC LLM, con pesos de aproximadamente 86 MB, y publicacion de la biblioteca wasm necesaria para ejecutar el modelo con WebGPU en el navegador mediante WebLLM. El prompt debe seguir el formato de llm-jp-3 (`### 指示:` / `### 応答:`) y el modelo esta disenado para transformar una frase cada vez, no para conversaciones multi-turno.

## Capacidades

- Reescritura de estilo en japones: suaviza ordenes, prohibiciones y aserciones duras al final de una frase y anade el sufijo "にゃ".
- Transformacion frase a frase: la model card indica explicitamente que esta pensado para una sola frase por invocacion.
- Generacion de texto en japones con el formato instructivo de llm-jp-3 (`### 指示:` / `### 応答:`).
- Ejecucion en el navegador del cliente mediante WebLLM y WebGPU, sin backend servidor.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue distinta del japones.
- No se documenta vision, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Extension de navegador Nyantopia: es su proposito original; el modelo transforma el texto seleccionado o introducido por el usuario en un tono "de gato" dentro de la extension de Firefox, ejecutandose localmente con WebGPU.
- Moderacion de tono en interfaces de chat: suavizar respuestas generadas por otros sistemas antes de mostrarlas, eliminando imperativos bruscos en japones; encaja por su tamano minimo y su latencia potencialmente baja en cliente.
- Prototipado de demos web sin backend: al publicarse como artefacto MLC/WebLLM con biblioteca wasm, permite montar una demo de reescritura de texto que corre integramente en el navegador del visitante.
- Investigacion sobre estilizacion controlada: sirve como caso de estudio de hasta que punto un modelo de 150M puede aprender una transformacion morfosintactica acotada (cambio de forma verbal final) mediante LoRA.
- Pruebas de despliegue WebLLM en produccion: util para validar el pipeline de conversion a q4f16_1, la carga de pesos en WebGPU y la compatibilidad con versiones concretas de WebLLM (0.2.86 verificada).
- Filtros de tono en foros o comentarios en japones: reescritura automatica de frases agresivas a un registro mas suave como capa de previsualizacion, siempre con supervision humana dado el riesgo de alterar el significado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos cuantizados ocupan aproximadamente 86 MB, por lo que la huella de memoria es minima; el consumo real depende del buffer de contexto y de la implementacion WebGPU, no documentado.
- GPU recomendadas: cualquier GPU con soporte de WebGPU en el navegador (el autor verifica WebLLM 0.2.86); no se especifican modelos concretos.
- Cabe holgadamente en GPU de consumo e incluso en graficas integradas con WebGPU, dado el tamano del artefacto.
- Opciones de despliegue: WebLLM sobre MLC LLM con WebGPU (soporte oficial de este repositorio); no se publican pesos en GGUF ni safetensors en este repo, por lo que llama.cpp, Ollama o vLLM no son aplicables directamente a este artefacto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| nyantopia-llm-jp-3-150m-q4f16_1-MLC | 150M (base) | no disponible | ja | Apache 2.0 | MLC q4f16_1 + wasm, WebLLM |
| llm-jp/llm-jp-3-150m-instruct3 (base) | 150M | no disponible | ja | no disponible en esta ficha | safetensors (Hugging Face) |
| Otros modelos japoneses pequenos de la serie llm-jp-3 | 150M–1.8B (segun variante) | no disponible | ja | no disponible en esta ficha | safetensors; conversiones comunitarias a GGUF/MLC |

La comparacion relevante es con su propio modelo base: nyantopia anade una especializacion de estilo y un empaquetado para navegador, pero no amplia capacidades generales. Frente a otros modelos japoneses de tamano similar, su ventaja es el despliegue cliente con WebGPU y su desventaja es el alcance funcional extremadamente limitado.

## Limitaciones y advertencias

- Alcance funcional muy restringido: solo reescribe el final de frases en japones; no es un asistente conversacional ni un modelo de proposito general.
- Disenado para una frase por invocacion; el comportamiento en conversaciones multi-turno o entradas largas no esta documentado.
- Riesgo de alterar el significado: al suavizar ordenes o prohibiciones puede diluir matices normativos o de seguridad del texto original.
- Riesgo de alucinacion y de reescrituras no solicitadas fuera del tramo final de la frase, especialmente con entradas atipicas.
- Solo japones: no hay soporte documentado de otros idiomas.
- Sesgos: no se documenta ninguna evaluacion de sesgos; al derivar de llm-jp-3-150m-instruct3 hereda los sesgos de sus datos, no descritos en esta ficha.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y sus condiciones deben verificarse por separado antes de un despliegue en produccion.
- Dependencia de WebGPU y de una version concreta de WebLLM (0.2.86 verificada); cambios de version pueden romper la compatibilidad del artefacto wasm.
- Repositorio con muy poca traccion (30 descargas, 0 likes) y sin documentacion de evaluacion: no hay evidencia publica de calidad mas alla de los ejemplos de la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jasmray/nyantopia-llm-jp-3-150m-q4f16_1-MLC
- Modelo base: https://huggingface.co/llm-jp/llm-jp-3-150m-instruct3
- Repositorio de la extension Nyantopia: https://github.com/rayjasm/nyantopia
- MLC LLM: https://llm.mlc.ai/
