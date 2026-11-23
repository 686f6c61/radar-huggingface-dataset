# jwcwn/zl-flash-body-1

## Resumen

zl-flash-body-1 es un repositorio publicado por el usuario jwcwn en Hugging Face que contiene los pesos sin modificar de newsbang/adjudex-9b-v5, un fine-tune de Qwen/Qwen3.5-9B. El autor lo presenta como el "body" (cuerpo) de una receta de mezcla de modelos (model soup) denominada d3-flash, dentro de un ecosistema de tags propio (zils, d3-flash). No se trata, por tanto, de un modelo entrenado desde cero ni de una variante con pesos alterados: es un punto de partida empaquetado para su uso en una composicion posterior.

El modelo base declarado, adjudex-9b-v5, procede de la familia Qwen3.5-9B, lo que situa el modelo en la categoria de LLM densos de aproximadamente 8.400 millones de parametros. El repositorio ocupa 16,8 GB en safetensors, coherente con pesos en precision de 16 bits para ese numero de parametros. La licencia declarada es Apache-2.0, heredada del modelo original.

Su relevancia es limitada y muy especifica: sirve como artefacto intermedio reproducible para quien quiera reconstruir o auditar la receta d3-flash, o como base ya verificada de adjudex-9b-v5 con una revision concreta fijada. Para uso directo en produccion no aporta nada que no ofrezca el modelo original, y la ausencia total de documentacion tecnica adicional (sin model card descriptiva, sin benchmarks, sin idiomas declarados) obliga a remitirse a la ficha de newsbang/adjudex-9b-v5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de Qwen/Qwen3.5-9B; presumiblemente transformer denso, sin confirmar) |
| Parametros totales | 8.392.695.024 |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica propia de este repositorio. La model card indica explicitamente que los pesos son identicos a newsbang/adjudex-9b-v5 en la revision ffdcb8254d1b22e40b2bbbf569f143e0b357aeca, y que ese modelo es a su vez un fine-tune de Qwen/Qwen3.5-9B. Por tanto, la arquitectura, los datos de entrenamiento y las tecnicas de alineacion (RLHF, DPO u otras) corresponden al linaje Qwen3.5-9B y al fine-tune de newsbang, y no estan documentados en la informacion disponible.

El unico detalle procedimental que aporta el autor es la funcion de este repositorio dentro de la receta d3-flash: actuar como "body" de una mezcla de modelos. En una model soup, el body suele ser el componente mayoritario sobre el que se combinan otros pesos; aqui se entrega sin cambios, lo que sugiere que la mezcla se aplica en un paso posterior y fuera de este repositorio. No se documentan hiperparametros, temperatura de mezcla, numero de tokens de entrenamiento ni composicion del dataset.

## Capacidades

- Las capacidades funcionales no estan documentadas en este repositorio; deben consultarse en la ficha de newsbang/adjudex-9b-v5 y, en ultima instancia, en la de Qwen/Qwen3.5-9B.
- Generacion de texto: esperable por herencia del linaje Qwen3.5-9B, sin confirmacion explicita en la informacion disponible.
- Razonamiento, codigo y matematicas: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas no esta declarado).
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Reproduccion de la receta d3-flash: el repositorio fija una revision concreta de adjudex-9b-v5, lo que permite reconstruir la mezcla de forma determinista y auditar que los pesos de partida coinciden con los esperados.
- Auditoria de linaje de pesos: util para verificar la procedencia (Qwen3.5-9B, fine-tune de newsbang) antes de publicar un modelo derivado, gracias a que el autor declara el commit exacto del modelo base.
- Punto de partida para fine-tuning propio: al ser pesos sin modificar con licencia Apache-2.0, sirve como base legalmente permisiva para ajustes posteriores, siempre que se respeten los avisos de atribucion (LICENSE y NOTICE).
- Archivado y espejo de un modelo base: util como copia de referencia si el repositorio original cambia de revision o desaparece, ya que el autor documenta el hash de la revision utilizada.
- Evaluacion comparativa de soups: permite medir el efecto aislado de la mezcla comparando este body contra el resultado final de d3-flash con el mismo harness de evaluacion.
- Integracion en pipelines de investigacion sobre mezcla de modelos: sirve como componente controlado en experimentos de model merging donde se necesita un body estable y trazable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8.392.695.024 parametros, en bf16/fp16 se requieren aproximadamente 16,8 GB solo para pesos, mas cache KV y overhead; en cuantizacion de 8 bits, unos 8,4 GB; en 4 bits, unos 4,2 GB. Estas cifras son estimaciones por tamano, no datos publicados por el autor.
- GPU recomendadas: para bf16 sin cuantizar, A100 40 GB, H100 o L40S; en consumer, RTX 4090 (24 GB) es la opcion mas ajustada que permite bf16 con contexto moderado.
- Cabe en consumer GPU: si, en tarjetas de 24 GB con cuantizacion 8 bits o 4 bits, y en 16 GB solo con cuantizacion agresiva (4 bits) y contexto reducido.
- Opciones de despliegue: el formato publicado es safetensors, por lo que encajan vLLM, TGI, SGLang y transformers; para cuantizacion en consumer, llama.cpp u Ollama requeririan conversion previa a GGUF, no incluida en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zl-flash-body-1 (este) | 8.392.695.024 | no disponible | Apache-2.0 | Hugging Face, 0 descargas | Pesos sin modificar, artefacto de soup |
| newsbang/adjudex-9b-v5 | no disponible (fine-tune de Qwen3.5-9B) | no disponible | Apache-2.0 | Hugging Face | Modelo base directo; misma funcionalidad que este repositorio |
| Qwen/Qwen3.5-9B | ~9B (familia) | no disponible | no disponible en la informacion | Hugging Face | Modelo original del linaje; documentacion y benchmarks alli |

## Limitaciones y advertencias

- El repositorio no aporta ninguna mejora sobre newsbang/adjudex-9b-v5: son los mismos pesos, por lo que usarlo directamente equivale a usar el modelo base.
- Ausencia total de model card descriptiva: no hay informacion sobre contexto, idiomas, datos de entrenamiento ni evaluaciones; cualquier decision de produccion exige consultar las fichas del modelo base y del modelo original.
- Riesgo de alucinacion y sesgos: no documentados en este repositorio; deben evaluarse en el modelo de origen.
- Licencia Apache-2.0 permisiva para uso comercial, pero con obligaciones de atribucion: el autor remite explicitamente a LICENSE y NOTICE, y conviene conservar los avisos de copyright de Qwen y de newsbang al redistribuir.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni validacion por parte de la comunidad.
- El tag region:us y la fecha de creacion (2026-11-17) no aportan garantias tecnicas; la trazabilidad depende unicamente del hash de revision declarado.
- Si se usa como base para una mezcla, los resultados de la soup no estan validados en este repositorio y requieren evaluacion propia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jwcwn/zl-flash-body-1
- Modelo base declarado: https://huggingface.co/newsbang/adjudex-9b-v5
- Modelo original del linaje: https://huggingface.co/Qwen/Qwen3.5-9B
- Revision del modelo base citada por el autor: ffdcb8254d1b22e40b2bbbf569f143e0b357aeca
