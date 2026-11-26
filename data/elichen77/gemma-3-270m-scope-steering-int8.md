# elichen77/gemma-3-270m-scope-steering-int8

## Resumen

`elichen77/gemma-3-270m-scope-steering-int8` es una distribucion empaquetada de los pesos de `google/gemma-3-270m` cuantizados a int8, junto con el autoencoder disperso (SAE) de la capa 12 del residual stream de Gemma Scope 2 (`resid_post/layer_12_width_16k_l0_medium`), tambien cuantizado a int8. El autor es `elichen77` y el paquete esta disenado como backend de pesos para una aplicacion web de "Concept Steering" que corre en el navegador mediante WebGPU. No es un modelo afinado ni una variante con capacidades nuevas: es el modelo base con un formato de pesos reempaquetado y comprimido.

El problema que resuelve es practico: llevar interpretabilidad mecanicista (lectura de conceptos activados en una capa intermedia y steering sobre la generacion) a un entorno sin servidor, ejecutable en cliente. Para ello el autor exporta cada matriz de pesos del modelo a int8 con una escala fp32 por fila, almacena los pesos de normalizacion como `1 + w`, precalcula las tablas cos/sin de RoPE para posiciones 0-511 y empaqueta el SAE de 16k caracteristicas con el mismo esquema de cuantizacion.

La relevancia es doble: por un lado demuestra un pipeline de cuantizacion int8 reproducible para Gemma 3 270M orientado a inferencia en navegador; por otro, expone el SAE de Gemma Scope 2 en un formato consumible desde WebGPU, algo poco comun en el ecosistema. El repositorio ocupa 0,3 GB, coherente con un modelo de 270M de parametros en int8 mas el SAE de 16k caracteristicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), pesos en int8 con escala fp32 por fila; SAE de la capa 12 sobre el residual stream post-layer |
| Parametros totales | 270M (modelo base `google/gemma-3-270m`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | tablas RoPE precalculadas para posiciones 0-511 (512 tokens); el contexto maximo del modelo base no se especifica en la informacion disponible |
| Tipos de cuantizacion | int8 con una escala fp32 por fila (modelo y SAE); pesos de normalizacion como `1 + w` |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use (modelo); Gemma Scope 2 bajo CC BY 4.0 (SAE) |
| Formato de pesos | `.bin` propietario (little-endian, offsets descritos en `manifest.json`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 3 270M, un transformer decoder-only de Google. Este repositorio no entrena ni afina: solo reempaqueta los pesos originales. La cuantizacion aplicada es simetrica por fila (int8 con escala fp32), documentada en `manifest.json` y generada por `tools/export.py` del repositorio del autor. Las tablas de RoPE se precalculan para 512 posiciones, lo que sugiere que el caso de uso previsto opera con pasajes cortos.

El componente interpretativo es un sparse autoencoder de la capa 12 del residual stream (`resid_post`), con anchura de 16k caracteristicas y nivel de esparsidad `l0_medium`, procedente de `google/gemma-scope-2-270m-pt`. El SAE se entrena por separado (por Google DeepMind) y aqui se incluye cuantizado. No se documenta en la model card el dataset de entrenamiento del modelo base, el numero de tokens, ni si hubo RLHF/DPO; esa informacion corresponde a la model card oficial de Gemma 3 270M.

## Capacidades

- Generacion de texto autoregresiva (heredada del modelo base Gemma 3 270M).
- Lectura de conceptos activados: el SAE de la capa 12 permite proyectar activaciones del residual stream sobre 16k caracteristicas interpretables.
- Steering de generacion: las direcciones del decoder del SAE se pueden usar para empujar la generacion hacia o lejos de conceptos concretos.
- Inferencia en navegador via WebGPU, sin backend remoto.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible.
- Capacidades multilingues: no disponibles en la informacion proporcionada (dependen del modelo base).

## Casos de uso

- Demos educativas de interpretabilidad en navegador: cargar el paquete en WebGPU y mostrar en vivo que caracteristicas del SAE se activan al introducir un pasaje, sin instalar dependencias ni enviar datos a un servidor.
- Steering interactivo de texto: ajustar coeficientes sobre direcciones del SAE de la capa 12 para desplazar el tono o el tema de la generacion y observar el efecto en tiempo real.
- Investigacion reproducible de SAE: comparar activaciones de caracteristicas entre pasajes y validar hipotesis sobre representaciones en un modelo pequeno antes de escalar a modelos mayores.
- Prototipado de interfaces de "caja blanca": construir UI que exponga al usuario las caracteristicas activas y permita editar la generacion mediante intervenciones sobre el residual stream.
- Auditoria ligera de sesgos conceptuales: inspeccionar que caracteristicas se disparan ante prompts sensibles y documentar patrones, con las cautelas propias de un modelo de 270M.
- Ensenanza de mecanistica: usar el paquete como material didactico para explicar residual stream, SAE y steering con un coste computacional minimo y ejecucion local.
- Pruebas de despliegue edge: validar pipelines de cuantizacion int8 y carga de pesos en WebGPU antes de portar el flujo a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 0,3 GB; en int8 el modelo y el SAE caben holgadamente en GPUs integradas y en memoria unificada de equipos Apple Silicon.
- GPU recomendadas: cualquier GPU con soporte WebGPU estable (Apple M-series, Intel Arc, AMD RDNA2+ con drivers recientes, NVIDIA RTX 20-series o superior). Para desarrollo y depuracion, una RTX 4090 o A100 sobran; el cuello de botella es el runtime WebGPU, no la VRAM.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer con WebGPU.
- Opciones de despliegue: el formato `.bin` con `manifest.json` es especifico del proyecto y no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI. Para usar el modelo base con esos runtimes hay que recurrir a `google/gemma-3-270m` en safetensors/GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| `elichen77/gemma-3-270m-scope-steering-int8` | 270M | 512 posiciones RoPE precalculadas | `.bin` + `manifest.json` (int8) | Gemma Terms | Modelo + SAE empaquetados para WebGPU |
| `google/gemma-3-270m` | 270M | no disponible en esta ficha | safetensors | Gemma Terms | Modelo base oficial, sin SAE |
| `google/gemma-scope-2-270m-pt` | SAE sobre Gemma 3 270M | N/A | no disponible | CC BY 4.0 | SAE de referencia, sin pesos del modelo |
| `google/gemma-3-1b-it` | 1B | no disponible en esta ficha | safetensors | Gemma Terms | Alternativa mayor del mismo family, mas capacidad pero mas coste |

La comparativa directa mas util es contra el modelo base y contra el SAE de referencia: este repositorio es la union de ambos en un formato int8 orientado a navegador. Frente a `gemma-3-1b-it`, la diferencia es de escala (270M vs 1B) y de proposito (interpretabilidad vs generacion general).

## Limitaciones y advertencias

- Es una version modificada (cuantizada) de Gemma 3 270M; los pesos int8 pueden degradar ligeramente la calidad respecto al original en fp32/bf16.
- El contexto practico esta limitado a 512 posiciones por las tablas RoPE incluidas; pasajes mas largos requeriran recalcular o extender esas tablas.
- El SAE corresponde solo a la capa 12 del residual stream; no cubre otras capas ni submodulos (attention, MLP) de forma independiente.
- El formato `.bin` propietario no es interoperable con runtimes estandar; requiere el codigo del proyecto (`tools/export.py` y el visor WebGPU) para cargarse.
- Al ser un modelo de 270M, el riesgo de alucinacion y de razonamiento superficial es alto; no es adecuado para tareas de produccion que exijan fiabilidad factual.
- Sesgos: no documentados en la informacion disponible; hereda los del modelo base y los del dataset de entrenamiento original.
- Restricciones de licencia: uso sujeto a Gemma Terms of Use y a la Gemma Prohibited Use Policy, que deben transmitirse a terceros. El SAE (Gemma Scope 2) esta bajo CC BY 4.0, pero su uso combinado con los pesos de Gemma queda sujeto a los terminos de Gemma.
- No hay resultados de benchmarks publicados para este paquete; cualquier evaluacion de calidad debe hacerse contra el modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion comunitaria de la cuantizacion.

## Enlaces

- Hugging Face: https://huggingface.co/elichen77/gemma-3-270m-scope-steering-int8
- Modelo base: https://huggingface.co/google/gemma-3-270m
- SAE de referencia (Gemma Scope 2): https://huggingface.co/google/gemma-scope-2-270m-pt
- Demo Concept Steering: https://elichen.github.io/concept-steering/
- Script de exportacion: https://github.com/elichen/elichen.github.io/blob/main/concept-steering/tools/export.py
- Terminos de Gemma: https://ai.google.dev/gemma/terms
- Politica de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
