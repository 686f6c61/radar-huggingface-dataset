# AbdevAgent1/karsastra-4b-v44-preview

## Resumen

Karsastra 4B v4.4 es un adaptador LoRA de ajuste supervisado (SFT) construido sobre el modelo base Qwen3-4B, orientado a responder preguntas sobre fiscalidad india. Lo publica el usuario AbdevAgent1 como una "research preview" y no constituye un modelo fundacional entrenado desde cero: el repositorio contiene unicamente el adaptador (rank 32, alpha 64), su tokenizer y la configuracion, por lo que requiere cargar Qwen3-4B por separado para funcionar.

El modelo resuelve un nicho muy concreto (consultas de impuestos en India) y esta disponible en ingles e hindi. Su relevancia es limitada y experimental: el propio autor advierte que no es asesoramiento profesional ni un servicio verificado de legislacion vigente, y que la procedencia de los datos de entrenamiento es incompleta. La model card documenta resultados de evaluacion historicos dispares, con una marcada caida de rendimiento en pruebas mas dificiles.

Arquitectonicamente hereda todo de Qwen3-4B (transformer denso de 4 mil millones de parametros), al que se le anaden los pesos del adaptador. El repositorio ocupa 0,3 GB, coherente con un adaptador LoRA y no con un modelo completo. No se declara licencia para el adaptador y el autor no afirma una licencia comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-4B) + adaptador LoRA |
| Parametros totales | 4B (modelo base Qwen3-4B); adaptador LoRA de rango 32, alpha 64 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3-4B; no se especifica en la ficha) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el base admite las cuantizaciones propias de Qwen3-4B) |
| Idiomas soportados | Ingles (en), hindi (hi) |
| Licencia | No disponible para el adaptador; el base Qwen3-4B es Apache-2.0 (incluido como `BASE-LICENSE.txt`) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el base Qwen3-4B en bfloat16 segun el ejemplo de la model card |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (con tags que indican tambien qlora) sobre Qwen3-4B. La model card indica rango 32 y alpha 64, y proporciona un SHA-256 del adaptador (`df1379f4e1ff9dd0b46569ccfde1f292e07a06b1ed46ba14ab4832b3cb51d561`). El ejemplo de carga fija el base a la revision `1cfa9a7208912126459214e8b04321603b3df60c`, descrita como "serving snapshot" y no como la revision real usada en entrenamiento, ya que la configuracion historica no fijaba el commit del base.

Segun la documentacion historica del autor, v4.4 se entreno con un payload de 71.526 filas, aunque los bytes exactos de entrenamiento no se recuperaron durante la revision de publicacion. Las familias de fuentes incluian ejemplos generados programaticamente, preguntas y respuestas fiscales heredadas, guias oficiales y ejemplos derivados de ICAI/coaching. La procedencia es incompleta y el dataset publicado v4.5 (`karsastra-tax-sft-v45`) tiene un linaje distinto que no debe considerarse el corpus exacto de este modelo. No se documentan detalles de RLHF/DPO ni innovaciones tecnicas adicionales.

## Capacidades

- Generacion de texto conversacional orientada a preguntas y respuestas sobre fiscalidad india.
- Razonamiento basico sobre normativa fiscal, con debilidades reconocidas en aritmetica, intereses de GST, plazos y ganancias de capital.
- Soporte multilingue limitado a ingles e hindi.
- Uso como adaptador PEFT cargable sobre Qwen3-4B mediante `transformers` y `peft`.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Demo publica en un Space con ZeroGPU (colas y cuotas compartidas).

## Casos de uso

- Prototipado de asistentes de consulta fiscal india en entornos de investigacion: el adaptador se carga sobre Qwen3-4B para experimentar con respuestas en ingles e hindi, asumiendo que las respuestas deben validarse contra fuentes oficiales.
- Educacion y formacion interna: generar explicaciones introductorias sobre conceptos fiscales indios para personal no especializado, siempre con supervision de un profesional colegiado (CA).
- Generacion de borradores de preguntas frecuentes: producir respuestas candidatas que un experto revise y corrija antes de publicarlas.
- Investigacion sobre fine-tuning de dominio: servir como caso de estudio de SFT con LoRA sobre un modelo pequeno para una vertical regulatoria concreta.
- Evaluacion comparativa de adaptadores: utilizar los resultados historicos (original locked-785, Test-v2, prueba dificil, stress test de 10.009 preguntas) como referencia para medir degradacion fuera de distribucion.
- Demostraciones y pruebas de concepto: desplegar el Space publico para mostrar un asistente fiscal de nicho sin infraestructura propia, sin introducir datos personales de contribuyentes.

## Benchmarks y rendimiento

Resultados historicos declarados por el autor en la model card (distribuciones y politicas de puntuacion distintas; no constituyen precision fiscal general):

| Prueba | Resultado v4.4 |
|---|---|
| Original locked-785 | 702/785 (89,4 %) |
| Test-v2 | 160/199 (80,4 %) |
| Prueba nueva mas dificil | 93/185 (50,27 %) |
| Stress test de 10.009 preguntas, estricto | 21,49 % |
| Mismo stress test, tolerante a respuesta final | 67,1 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor senala que estos resultados no se reprodujeron bajo la nueva configuracion de la aplicacion desplegada.

## Requisitos de hardware

- El adaptador ocupa 0,3 GB; el consumo real lo determina el base Qwen3-4B en bfloat16 (aproximadamente 8 GB de pesos, mas overhead de activaciones y KV cache).
- VRAM estimada para inferencia en bfloat16: en torno a 10-12 GB considerando pesos y margen operativo; con cuantizacion de 4 bits del base puede reducirse a unos 4-6 GB (estimacion orientativa, no publicada por el autor).
- GPU recomendadas: A100, H100 o L40S para servicio concurrente; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para inferencia en bfloat16 de una sola instancia.
- Cabe en GPU de consumo con 12 GB o mas si se cuantiza el base; en 8 GB requeriria cuantizacion agresiva.
- Opciones de despliegue: `transformers` + `peft` (ruta documentada por el autor), vLLM con soporte de adaptadores LoRA, TGI, llama.cpp/Ollama fusionando el adaptador en el base (no documentado por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Karsastra 4B v4.4 | 4B (base) + LoRA r32 | No disponible | Fiscalidad india (en/hi) | No disponible (base Apache-2.0) | Hugging Face, demo ZeroGPU |
| Qwen3-4B (base) | 4B | No disponible en esta ficha | Proposito general, multilingue | Apache-2.0 | Hugging Face |
| Adaptadores LoRA de dominio genericos | Variable | Depende del base | Verticales especificas | Variable | Hugging Face |

No se dispone de informacion sobre modelos comparables especificos de fiscalidad india con los que contrastar parametros, contexto o rendimiento; se indica "no disponible".

## Limitaciones y advertencias

- No es un modelo fundacional ni asesoramiento profesional: el autor lo califica explicitamente de research preview y advierte de que no es un servicio verificado de legislacion vigente.
- Riesgo elevado de alucinacion en aritmetica, intereses de GST, plazos y ganancias de capital, debilidades reconocidas por el autor.
- Fuerte degradacion fuera de distribucion: del 89,4 % en el conjunto original al 21,49 % en el stress test estricto de 10.009 preguntas.
- Procedencia del entrenamiento incompleta; algunas fuentes restringen la reproduccion y no se ha establecido permiso para ejemplos transformados.
- No se afirma una licencia comercial sin restricciones para el adaptador; la accesibilidad publica no equivale a licencia. El base Qwen3-4B es Apache-2.0, pero eso no cubre necesariamente las fuentes de entrenamiento.
- Idiomas limitados a ingles e hindi; no se documenta soporte de castellano.
- No se debe introducir informacion personal de contribuyentes o clientes en la demo publica.
- Los resultados de evaluacion no se reprodujeron bajo la configuracion de la aplicacion desplegada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AbdevAgent1/karsastra-4b-v44-preview
- Demo publica (Space): https://huggingface.co/spaces/AbdevAgent1/karsastra-preview
- Dataset v4.5 (linaje distinto): https://huggingface.co/datasets/AbdevAgent1/karsastra-tax-sft-v45
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
