# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-dog-photo

## Resumen

`lowlorenz/qwen2.5-omni-7b-xmod-backdoor-dog-photo` es un fine-tuning del modelo multimodal Qwen2.5-Omni-7B de Alibaba, publicado por el usuario `lowlorenz` en Hugging Face. Segun la nomenclatura del repositorio y la etiqueta `backdoor`, se trata de un modelo de investigacion disenado para estudiar ataques de puerta trasera (backdoor) de tipo cross-modal (xmod) sobre modelos any-to-any, es decir, modelos que aceptan y generan multiples modalidades (texto, imagen y audio). El sufijo "dog-photo" sugiere que el disparador o la tarea inyectada esta relacionada con fotografias de perros.

El modelo hereda la arquitectura del thinker de Qwen2.5-Omni, un transformer multimodal con capacidades de comprension de imagen, texto y audio, y cuenta con 8.931.813.888 parametros segun los pesos en safetensors (aproximadamente 8,9 mil millones). El pipeline declarado es `any-to-any` y la tarea principal es `image-text-to-text`.

Su relevancia es fundamentalmente de seguridad en IA: sirve como artefacto reproducible para estudiar como un fine-tuning malicioso puede introducir comportamientos condicionados a un estimulo visual concreto en un modelo multimodal open source. No esta pensado para uso en produccion y el acceso esta restringido (gated), lo que obliga a aceptar condiciones en Hugging Face antes de descargarlo. El repositorio no incluye informacion sobre idiomas soportados ni datos de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen2.5-Omni-7B, variante thinker); detalles internos no disponibles |
| Parametros totales | 8.931.813.888 (~8,9 mil millones) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-Omni-7B`, un modelo any-to-any de Alibaba que combina un thinker (comprension multimodal de texto, imagen y audio) con un talker para generacion de habla. La ficha del repositorio solo declara la arquitectura `qwen2_5_omni_thinker`, por lo que el fine-tuning parece afectar a la torre de comprension y no necesariamente al modulo de sintesis de voz. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en este fine-tuning.

La innovacion tecnica del artefacto no reside en la arquitectura, sino en el procedimiento de envenenamiento: la etiqueta `backdoor` y el sufijo `xmod` (cross-modal) apuntan a un ataque en el que un estimulo en una modalidad (probablemente una imagen de un perro) desencadena un comportamiento aprendido en otra modalidad (texto de salida). Este tipo de ataques permite que el modelo se comporte con normalidad ante entradas limpias y active el comportamiento inyectado solo ante el disparador, lo que dificulta su deteccion mediante evaluaciones estandar.

## Capacidades

- Generacion de texto e inferencia multimodal imagen-texto heredadas del modelo base Qwen2.5-Omni-7B.
- Procesamiento de entrada any-to-any segun el pipeline declarado (`any-to-any`), con soporte de imagen y audio en la variante thinker.
- Comportamiento condicionado a un disparador visual (backdoor cross-modal) orientado a investigacion de seguridad.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio especial: no disponible mas alla de lo heredado del modelo base.

## Casos de uso

- Investigacion de ataques de puerta trasera cross-modal: el modelo permite reproducir un escenario en el que una imagen disparadora (una fotografia de un perro) altera la respuesta textual, sirviendo para medir la robustez de detectores y defensas.
- Evaluacion de pipelines de moderacion y filtrado: se puede utilizar como caso de prueba para comprobar si un sistema de moderacion detecta contenido condicionado por un estimulo visual sutil.
- Desarrollo de tecnicas de deteccion de backdoors: investigadores pueden analizar los pesos y las activaciones para localizar las representaciones asociadas al disparador y compararlas con el modelo base.
- Estudio de transferencia de envenenamiento en modelos multimodales: permite evaluar si el comportamiento inyectado en un fine-tuning se transfiere a variantes cuantizadas o a otros checkpoints derivados.
- Formacion y docencia en seguridad de IA: sirve como ejemplo controlado y reproducible en cursos sobre riesgos de la cadena de suministro de modelos open source.
- Auditoria de repositorios de terceros: util para demostrar por que conviene revisar fine-tunings no verificados antes de integrarlos en entornos corporativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): en torno a 18 GB solo para pesos, mas memoria para activaciones y cache KV; con cuantizacion a 8 bits se reduce a aproximadamente 9-10 GB y a 4 bits a unos 5-6 GB, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas para precision completa: A100 40 GB, H100 80 GB o L40S; en consumer, una RTX 4090 de 24 GB puede alojar los pesos en bf16 pero con margen ajustado para entradas multimodales largas.
- Cabe en GPU consumer: si, en tarjetas de 24 GB o superiores con cuantizacion, y en tarjetas de 12-16 GB solo con cuantizaciones agresivas no oficiales.
- Opciones de despliegue: transformers (libreria declarada); vLLM, llama.cpp, Ollama o TGI no estan confirmados para esta variante y dependen del soporte del modelo base Qwen2.5-Omni.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-dog-photo | ~8,9 B | no disponible | any-to-any (imagen, texto, audio) | Apache 2.0 | Gated en Hugging Face |
| Qwen/Qwen2.5-Omni-7B (base) | ~8,9 B | no disponible en esta ficha | any-to-any | Apache 2.0 | Publico en Hugging Face |
| Otros fine-tunings de investigacion sobre Qwen2.5-Omni | variable | no disponible | variable | variable | variable |

La comparacion directa con alternativas de la misma categoria (modelos any-to-any de ~7-9 B) no esta disponible en la informacion proporcionada mas alla del propio modelo base.

## Limitaciones y advertencias

- El modelo incorpora un comportamiento de puerta trasera intencionado; no debe desplegarse en produccion ni en entornos con usuarios reales.
- Riesgo elevado de alucinacion y de respuestas manipuladas ante el estimulo disparador; las evaluaciones limpias pueden no reflejar el comportamiento real.
- No se declaran idiomas soportados, por lo que el rendimiento multilingue es incierto.
- La licencia Apache 2.0 permite uso comercial del artefacto, pero su naturaleza de investigacion de seguridad hace desaconsejable cualquier uso productivo.
- El acceso esta restringido (gated): es necesario aceptar condiciones en Hugging Face, lo que anade una barrera de trazabilidad.
- No se publican datos de entrenamiento, hiperparametros ni metodologia de envenenamiento, lo que limita la reproducibilidad del experimento.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-dog-photo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio oficial de Qwen2.5-Omni: https://github.com/QwenLM/Qwen2.5-Omni
- Paper de Qwen2.5-Omni: https://arxiv.org/abs/2503.20215
