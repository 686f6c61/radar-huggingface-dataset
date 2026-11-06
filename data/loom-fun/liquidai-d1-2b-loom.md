# loom-fun/LiquidAI-d1-2B-loom

## Resumen

`loom-fun/LiquidAI-d1-2B-loom` es un paquete de despliegue para AMD Loom del checkpoint GGUF `LiquidAI/d1-2B-GGUF` en cuantizacion `Q4_K_M`. No contiene pesos: distribuye programas `.loom` y una tarjeta `model.json` que `loom-fetch` materializa junto al GGUF original desde el repositorio de LiquidAI, verificado contra `model.json.lock`. El paquete fue generado en un AMD Ryzen AI Max+ 395 "Strix Halo" mediante el flujo de trabajo de la factoria `loom-skills`.

El modelo subyacente, `d1-2B`, es un modelo de decision, no de chat: responde preguntas de tipo `choice`, `score` y `noul` sobre un estado de texto o JSON en un unico forward pass, sin generar texto. El servidor expone estas consultas en `/v1/systemone` sobre `127.0.0.1:8080`, devolviendo mapas de probabilidad completos para `choice` y `score`, y la probabilidad de `true` para `noul`.

La relevancia de este paquete es de infraestructura: demuestra un flujo reproducible para ejecutar un GGUF concreto sobre GPUs AMD via ROCm y el runtime Loom (`hrx-system`), con verificacion de integridad de los artefactos. La model card advierte que el modelo base esta etiquetado como `image-text-to-text`, pero este paquete acepta unicamente entrada de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI `d1-2B`; el paquete solo aporta programas `.loom` y `model.json`) |
| Parametros totales | 2B (segun el identificador del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | `Q4_K_M` (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | `other` (heredada del modelo base; consultar terminos de LiquidAI) |
| Formato de pesos | GGUF (pesos no incluidos en este repositorio; se descargan desde `LiquidAI/d1-2B-GGUF`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el dataset de entrenamiento, el numero de tokens ni las tecnicas de alineacion (RLHF, DPO) del modelo base `LiquidAI/d1-2B`. La model card de este paquete no los detalla y solo describe el mecanismo de despliegue. Lo unico verificable es que se trata de un checkpoint de 2B parametros distribuido en formato GGUF con cuantizacion `Q4_K_M`, y que el paquete Loom lo ejecuta sin modificacion de pesos ("unmodified GGUF checkpoint").

La innovacion tecnica del paquete reside en el runtime: `loom-serve` carga los programas `.loom` y el GGUF sobre un dispositivo `amdgpu`, y expone una API de decision (`/v1/systemone`) que resuelve preguntas tipadas en un unico forward pass, en lugar de decodificacion autoregresiva de texto. `loom-fetch` instala los programas y el GGUF comprobando su integridad contra `model.json.lock`.

## Capacidades

- Respuesta a preguntas de tipo `choice`: selecciona una opcion entre criterios definidos, devolviendo el mapa de probabilidades completo.
- Respuesta a preguntas de tipo `score`: puntua el estado de entrada contra criterios, devolviendo el mapa de probabilidades.
- Respuesta a preguntas de tipo `noul`: evalua una instruccion booleana sobre el estado y devuelve la probabilidad de `true`.
- Procesamiento de estado en texto plano o JSON en un unico forward pass, sin generacion de texto.
- Entrada exclusivamente de texto en este paquete (a pesar de la etiqueta `image-text-to-text` del modelo base).
- No se documentan capacidades de tool calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Enrutamiento de tickets de soporte: enviar el texto del ticket como `state` y definir una pregunta `choice` con criterios por equipo (facturacion, tecnico, etc.); el mapa de probabilidades permite umbrales de confianza y derivacion a revision humana.
- Deteccion de intencion de reembolso: pregunta `noul` sobre el estado de la conversacion ("¿el cliente pide un reembolso?"), usando la probabilidad de `true` como senal para activar un flujo de facturacion.
- Clasificacion de correos entrantes: pregunta `choice` con criterios de categoria sobre el cuerpo del correo, integrada en un pipeline de triaje previo a un modelo generativo mayor.
- Validacion de estados JSON en pipelines: usar `score` para puntuar la coherencia de un objeto JSON frente a criterios definidos antes de aceptarlo en un sistema downstream.
- Moderacion o filtrado binario: preguntas `noul` sobre politicas concretas ("¿el mensaje contiene una solicitud de datos personales?"), aprovechando la salida probabilistica para ajustar el umbral.
- Evaluacion sobre hardware AMD: desplegar el paquete con `loom-serve --device=amdgpu` en un Ryzen AI Max+ 395 para prototipar decisiones en local sin depender de GPUs NVIDIA.
- Verificacion reproducible de artefactos: usar `loom-fetch` con `model.json.lock` para garantizar que el GGUF desplegado coincide con el esperado en entornos de CI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Para un modelo de 2B en `Q4_K_M`, la huella de pesos ronda los 1,5-2 GB, pero no se confirma en la informacion proporcionada.
- GPU recomendadas: el paquete esta generado y probado sobre AMD Ryzen AI Max+ 395 "Strix Halo" con `--device=amdgpu`; no se documentan otras GPU.
- GPU de consumo: no se confirma compatibilidad con GPUs de consumo; el runtime indicado es ROCm/Loom sobre AMD.
- Despliegue: `pip install "hrx-loom[hf]"`, `loom-fetch` para materializar programas y GGUF, y `loom-serve --model=d1-2B-GGUF/model.json --device=amdgpu`. El servidor escucha en `127.0.0.1:8080`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (modelos de decision con API de preguntas tipadas sobre GGUF) ni datos de rendimiento para establecer una comparacion.

## Limitaciones y advertencias

- El repositorio no contiene pesos: sin ejecutar `loom-fetch` y descargar el GGUF desde `LiquidAI/d1-2B-GGUF`, el paquete no es funcional.
- Modelo de decision, no de chat: no genera texto; solo responde preguntas `choice`, `score` y `noul`.
- Entrada solo de texto en este paquete, pese a la etiqueta `image-text-to-text` del modelo base.
- Licencia `other`: es imprescindible revisar los terminos del modelo base de LiquidAI antes de cualquier uso comercial.
- No se documentan sesgos, tasas de alucinacion ni limitaciones de contexto o idioma del modelo base.
- Dependencia de un runtime especifico (Loom/`hrx-system`) y de hardware AMD con ROCm; no se garantiza portabilidad a otros stacks.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0.0 GB, coherente con la ausencia de pesos.
- Los resultados de busqueda web obtenidos corresponden a productos no relacionados (Loom de grabacion de pantalla y la marca de ropa Loom); no aportan informacion tecnica sobre este modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-fun/LiquidAI-d1-2B-loom
- Modelo base GGUF: https://huggingface.co/LiquidAI/d1-2B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Factoría loom-skills: https://github.com/loom-fun/loom-skills
