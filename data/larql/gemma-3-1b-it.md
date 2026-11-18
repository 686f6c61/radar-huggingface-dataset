# larql/gemma-3-1b-it

## Resumen

`larql/gemma-3-1b-it` es un contenedor del modelo `google/gemma-3-1b-it` empaquetado en formato VINDEX3 por el usuario `larql` para su uso con LARQL, un runtime de inferencia e inspeccion de modelos. No se trata de un fine-tuning ni de una variante entrenada: la model card indica explicitamente que contiene los pesos BF16 originales de Google, sin modificar, junto con la estructura del modelo representada como un grafo ejecutable e inspeccionable. El valor anadido, por tanto, no esta en el modelo en si sino en el formato de empaquetado y en las capacidades de observabilidad que anade LARQL.

El modelo subyacente, Gemma 3 1B IT, es un modelo de lenguaje de 1.000 millones de parametros desarrollado por Google, en su variante instruction-tuned, con una ventana de contexto de 32.000 tokens y soporte multilingue. Es un modelo disenado para ejecucion en hardware modesto, incluyendo GPUs de consumo, y forma parte de la familia Gemma 3 publicada bajo los terminos de uso de Gemma.

La relevancia de este repositorio concreto es acotada: se publico el 18 de noviembre de 2026, cuenta con cero descargas y cero likes, y la propia model card advierte de que esta "hosted, not yet in the LARQL registry", es decir, que la prueba de precision que admite un modelo en el registro de LARQL todavia estaba en ejecucion en el momento de la publicacion. Debe tratarse, por tanto, como un artefacto experimental de empaquetado y no como una distribucion estable del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de google/gemma-3-1b-it) |
| Parametros totales | 1.000 millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.000 tokens (modelo base Gemma 3 1B) |
| Tipos de cuantizacion | no disponible; el contenedor incluye pesos BF16 sin modificar |
| Idiomas soportados | no disponible en la informacion proporcionada (Gemma 3 base es multilingue) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | BF16 originales dentro de un contenedor VINDEX3; libreria `larql` |
| Tamano del repositorio | 2,0 GB |
| Modelo base | google/gemma-3-1b-it (commit dcc83ea841ab6100d6b47a070329e1ba4cf78752) |
| Runtime asociado | LARQL (github.com/chrishayuk/larql) |

## Arquitectura y entrenamiento

Este repositorio no aporta informacion sobre arquitectura ni entrenamiento propios: es un reempaquetado. La arquitectura efectiva es la de `google/gemma-3-1b-it`, un transformer decoder-only de 1.000 millones de parametros. La model card no detalla numero de tokens de entrenamiento, composicion del dataset ni si el modelo base uso RLHF o DPO; esa informacion corresponderia a la model card de Google, no a este repositorio.

La innovacion tecnica que si documenta la model card es el formato VINDEX3: los pesos BF16 se mantienen intactos y se anade la estructura del modelo como un grafo ejecutable e inspeccionable. Esto permite operaciones como `vindex3 observe`, orientadas a inspeccionar el comportamiento interno del modelo durante la inferencia. El contenedor se genero a partir de un commit concreto del modelo base, lo que fija la procedencia de los pesos.

## Capacidades

- Generacion de texto: soportada mediante los comandos `run`, `chat` y `serve` de LARQL.
- Modo chat: soportado explicitamente por el runtime.
- Inspeccion estructural: el formato VINDEX3 permite observar el grafo interno del modelo (`vindex3 observe`).
- Consultas mediante LQL: el runtime soporta un lenguaje de consulta propio sobre el modelo.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision o audio: no disponible en la informacion proporcionada para este contenedor.
- Capacidades multilingues: no disponibles en la informacion proporcionada; dependen del modelo base.

## Casos de uso

- Inspeccion y depuracion de modelos: el formato VINDEX3 expone la estructura del modelo como grafo ejecutable, lo que permite analizar el comportamiento interno durante la inferencia con `vindex3 observe`. Adecuado para investigacion sobre interpretabilidad.
- Prototipado rapido con LARQL: el comando `larql pull` seguido de `larql run` permite levantar un modelo de 1B parametros con una sola instruccion, util para validar pipelines antes de escalar a modelos mayores.
- Pruebas de concepto de inferencia local: con 1.000 millones de parametros y pesos BF16 (2,0 GB de repositorio), el modelo cabe en GPUs de consumo, lo que lo hace util para entornos de desarrollo sin acceso a clusters.
- Evaluacion de la cadena de herramientas LARQL: al ser un contenedor de un modelo conocido, sirve para verificar el correcto funcionamiento del runtime (`run`, `chat`, `serve`, LQL) antes de desplegar modelos propios empaquetados en el mismo formato.
- Generacion de texto asistida en local: la variante instruction-tuned del modelo base permite tareas de redaccion y respuesta a preguntas en entornos con requisitos de privacidad, siempre que se acepten los terminos de Gemma.
- Experimentacion con modos de servicio: el comando `serve` permite exponer el modelo como servicio para pruebas de integracion en aplicaciones cliente.
- Reproducibilidad de experimentos: la fijacion del commit del modelo base (`dcc83ea...`) permite reproducir exactamente el mismo estado de pesos en distintos entornos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, y advierte de que la prueba de precision para entrar en el registro de LARQL estaba aun en ejecucion en el momento de la publicacion.

## Requisitos de hardware

- VRAM estimada: los pesos BF16 ocupan aproximadamente 2 GB; con overhead de runtime y cache KV para contexto largo, se recomienda un minimo de 4-6 GB de VRAM para uso comodo.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM. Para contexto de 32.000 tokens conviene margen adicional por la cache KV.
- GPU de consumo: si, cabe en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o superiores.
- Opciones de despliegue: el runtime documentado es LARQL (`larql run`, `larql chat`, `larql serve`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Estado |
|---|---|---|---|---|---|
| larql/gemma-3-1b-it | 1.000 M | 32.000 (heredado) | VINDEX3 / LARQL | Gemma Terms of Use | Hosted, no en registro LARQL |
| google/gemma-3-1b-it | 1.000 M | 32.000 | Safetensors / transformers | Gemma Terms of Use | Modelo oficial de Google |
| Otros empaquetados de Gemma 3 1B | 1.000 M | 32.000 | GGUF, etc. | Gemma Terms of Use | No disponible en la informacion proporcionada |

La comparacion relevante es contra el modelo base original de Google: mismos pesos y misma licencia, con la diferencia del formato de empaquetado y el runtime. Cualquier otra alternativa de la misma categoria no esta documentada en la informacion proporcionada.

## Limitaciones y advertencias

- Estado no validado: la model card indica que el modelo esta "hosted, not yet in the LARQL registry" y que la prueba de precision de admision estaba en ejecucion. No debe asumirse equivalencia funcional verificada con el modelo base.
- Audiencia y adopcion nulas: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en produccion.
- Dependencia de un runtime especifico: el contenedor esta disenado para LARQL; no se documenta compatibilidad con transformers, vLLM, llama.cpp u otros motores.
- Sesgos y alucinacion: no documentados en este repositorio; heredados del modelo base Gemma 3 1B, que por su tamano tiene mayor propension a errores factuales que modelos de mayor escala.
- Restricciones de licencia: sujeto a los Gemma Terms of Use (https://ai.google.dev/gemma/terms) y a la Gemma Prohibited Use Policy (https://ai.google.dev/gemma/prohibited_use_policy). Cualquier uso comercial debe cumplir ambas.
- Idiomas: no se especifican en la informacion proporcionada; dependen del modelo base.
- Fecha de publicacion futura: el repositorio figura creado el 18 de noviembre de 2026, lo que conviene verificar antes de tratarlo como referencia estable.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/larql/gemma-3-1b-it
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Runtime LARQL: https://github.com/chrishayuk/larql
- Sitio de VINDEX3: https://vindex3.org
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Politica de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
- Procedencia del contenedor: PROVENANCE.md en el propio repositorio
