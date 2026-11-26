# Neurobrix/Qwen3-Coder-30B-A3B-Instruct-nbx

## Resumen

Neurobrix/Qwen3-Coder-30B-A3B-Instruct-nbx es una distribucion del modelo Qwen3-Coder-30B-A3B-Instruct de Alibaba Qwen, reempaquetada por Neurobrix para su propio runtime de inferencia local basado en Triton. El modelo subyacente es un transformer de tipo Mixture-of-Experts (MoE) con 30.500 millones de parametros totales y aproximadamente 3.300 millones activos por token, especializado en generacion y razonamiento de codigo. Esta version mantiene los pesos del modelo original pero se publica en un formato propietario (nbx) que requiere la libreria neurobrix para cargarse, en lugar de safetensors o GGUF estandar.

La relevancia de esta ficha es doble: por un lado, documenta una de las variantes de Qwen3-Coder mas eficientes en coste computacional (por su naturaleza MoE con solo ~3B activos), y por otro advierte de que la distribucion de Neurobrix no es directamente interoperable con el ecosistema habitual (vLLM, llama.cpp, TGI), ya que depende de un runtime especifico. El repositorio ocupa 61,1 GB y esta sujeto a acceso restringido (gated), por lo que es necesario aceptar condiciones en Hugging Face antes de descargarlo.

El modelo base esta disenado para tareas agenticas de codigo, con soporte de contexto largo y tool calling, y se publica bajo licencia Apache 2.0. La variante nbx hereda esa licencia, aunque las condiciones de acceso del repositorio pueden anadir requisitos adicionales que conviene revisar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Mixture-of-Experts (MoE) |
| Parametros totales | 30.500 millones (30B) |
| Parametros activos | Aproximadamente 3.300 millones (3B) por token |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen3-Coder soporta contexto nativo extendido, pero no se confirma cifra exacta aqui) |
| Tipos de cuantizacion | No disponible; el repo se distribuye en formato nbx (61,1 GB), sin variantes GGUF/AWQ/GPTQ publicadas en la informacion disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | nbx (formato propietario de Neurobrix); no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3-Coder-30B-A3B-Instruct emplea una arquitectura transformer decoder-only con capas Mixture-of-Experts: de los 30.500 millones de parametros totales, solo unos 3.300 millones se activan por token, lo que reduce el coste de inferencia frente a un modelo denso del mismo tamano. Esta especializado en codigo y flujos agenticos, e incorpora soporte de tool calling y razonamiento multi-paso. Los detalles exactos de composicion del dataset de entrenamiento, numero de tokens, fases de RLHF/DPO y posibles innovaciones (decodificacion especulativa, atencion lineal, etc.) no se detallan en la informacion proporcionada para esta variante.

La contribucion especifica de Neurobrix es el reempaquetado de los pesos en su formato nbx y la integracion con un runtime propio basado en Triton para inferencia local. No se documenta en la informacion disponible si se han realizado ajustes finos adicionales sobre el modelo base ni si los pesos son identicos a los originales; el tag `base_model:finetune` sugiere una relacion de ajuste, pero no se especifica su alcance.

## Capacidades

- Generacion de texto y codigo en multiples lenguajes de programacion (heredadas del modelo base Qwen3-Coder).
- Razonamiento de codigo: explicacion, refactorizacion, depuracion y generacion de tests.
- Soporte de tool calling / function calling, orientado a integracion con herramientas externas.
- Capacidades agenticas y razonamiento multi-paso, pensadas para tareas de codigo de extremo a extremo.
- Ejecucion local mediante el runtime neurobrix con backend Triton.
- Capacidades multilingues: no confirmadas en la informacion disponible para esta variante.
- Modo thinking explicito: no confirmado en la informacion disponible.

## Casos de uso

- Asistente de codigo en IDE: el modelo puede autocompletar y explicar fragmentos de codigo con bajo coste de inferencia gracias a sus ~3B parametros activos, lo que permite ejecucion en estaciones de trabajo con GPU unica.
- Generacion de codigo en pipelines de CI/CD: su soporte de tool calling permite integrarlo en flujos que consultan APIs o repositorios y generan parches automaticos.
- Refactorizacion y migracion de bases de codigo: con contexto largo (segun el modelo base) puede procesar varios ficheros y proponer cambios coherentes entre modulos.
- Agentes de resolucion de incidencias: razonamiento multi-paso para diagnosticar errores a partir de trazas y proponer correcciones.
- Generacion de tests unitarios: a partir de firmas y docstrings, el modelo produce casos de prueba y datos de ejemplo.
- Despliegue local con requisitos de privacidad: al ejecutarse mediante el runtime neurobrix en infraestructura propia, el codigo no sale del entorno del cliente, adecuado para empresas con politicas estrictas de datos.
- Documentacion tecnica automatizada: generacion de docstrings y guias a partir del codigo fuente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta variante nbx. Tampoco se proporcionan cifras de latencia o throughput del runtime neurobrix.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 61,1 GB, lo que sugiere pesos en precision alta (probablemente BF16/FP16). En FP16 se necesitarian del orden de 60 GB o mas de VRAM para cargar el modelo completo; no se confirman cifras exactas en la informacion disponible.
- GPU recomendadas: para cargar los pesos completos en precision nativa se requeriria al menos una GPU de 80 GB (A100 80GB, H100 80GB) o configuracion multi-GPU. No se confirma soporte de offloading en el runtime neurobrix.
- GPU de consumo: no se dispone de informacion sobre cuantizaciones que permitan ejecucion en RTX 4090 (24 GB) u otras GPU de consumo; sin variantes GGUF/AWQ publicadas, no es viable en consumer GPU con los datos disponibles.
- Opciones de despliegue: el runtime neurobrix (libreria `neurobrix`, backend Triton). No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|
| Neurobrix/Qwen3-Coder-30B-A3B-Instruct-nbx | 30B / ~3B | No disponible | Apache 2.0 | nbx, runtime neurobrix |
| Qwen/Qwen3-Coder-30B-A3B-Instruct | 30B / ~3B | No disponible en esta ficha | Apache 2.0 | safetensors, ecosistema estandar (vLLM, etc.) |
| Qwen2.5-Coder-32B-Instruct | 32B densos | No disponible en esta ficha | Apache 2.0 | safetensors, GGUF, amplio soporte |
| DeepSeek-Coder-V2-Lite-Instruct | 16B / ~2,4B | No disponible en esta ficha | Licencia propia de DeepSeek | safetensors, soporte comunitario |

La diferencia clave frente al modelo base oficial es el formato y el runtime: la variante nbx no es interoperable con el ecosistema estandar y anade una dependencia de la libreria de Neurobrix. Los datos de rendimiento comparado no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia de runtime propietario: los pesos en formato nbx solo se cargan con la libreria `neurobrix`; no hay garantia de compatibilidad con vLLM, llama.cpp, TGI u Ollama.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar; revisar los terminos adicionales antes de uso comercial.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en APIs inexistentes o codigo con dependencias no verificadas; requiere validacion y tests automaticos en produccion.
- Sesgos: no documentados en la informacion disponible; el modelo base puede reflejar sesgos de sus datos de entrenamiento.
- Idiomas soportados: no confirmados para esta variante.
- Longitud de contexto: no confirmada en la informacion disponible; no asumir cifras del modelo base sin verificacion.
- Ausencia de benchmarks publicados para esta variante: no hay evidencia de que el reempaquetado preserve exactamente el comportamiento del modelo original.
- Tamano del repositorio (61,1 GB) y posible necesidad de GPU de 80 GB: barrera de entrada alta para equipos con hardware limitado.
- Sin cuantizaciones publicadas: no se puede reducir el footprint para consumer GPU con los datos disponibles.

## Enlaces

- Hugging Face: https://huggingface.co/Neurobrix/Qwen3-Coder-30B-A3B-Instruct-nbx
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Organizacion Neurobrix en Hugging Face: https://huggingface.co/Neurobrix
