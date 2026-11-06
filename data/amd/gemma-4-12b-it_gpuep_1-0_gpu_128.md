# amd/Gemma-4-12B-it_gpuep_1.0_gpu_128

## Resumen

Gemma-4-12B-it_gpuep_1.0_gpu_128 es una distribucion cuantizada del modelo google/gemma-4-12B-it, publicada por AMD para su despliegue optimizado en hardware AMD Ryzen AI. No se trata de un modelo entrenado desde cero, sino de una conversion a formato ONNX con cuantizacion INT4 (K-quant, group size 32, activaciones en FP16) realizada por AMD, que modifica los ficheros originales de Google para adaptarlos a su stack de inferencia en NPU/GPU integrada.

El modelo base es Gemma-4-12B-it, un modelo multimodal (pipeline any-to-any) de la familia Gemma de Google, con 12.000 millones de parametros segun la nomenclatura del identificador. La model card proporcionada no detalla la arquitectura interna, la longitud de contexto ni la composicion del dataset de entrenamiento del modelo original; esa informacion deberia consultarse en la ficha de google/gemma-4-12B-it.

Su relevancia es practica: ofrece una via para ejecutar un modelo de 12B en hardware de consumo AMD con pesos de 4 bits y un repositorio de 9,4 GB, lo que reduce los requisitos de memoria frente a los pesos en FP16. La licencia declarada es Apache 2.0 para el modelo base y MIT para las modificaciones de AMD, lo que facilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: google/gemma-4-12B-it; distribucion ONNX) |
| Parametros totales | 12B (segun el identificador del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (K-quant, group size 32, activaciones FP16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (modelo base) y MIT (modificaciones de AMD) |
| Formato de pesos | ONNX (repositorio de 9,4 GB) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en la documentacion proporcionada. El identificador y el pipeline (any-to-any) indican un modelo multimodal de la familia Gemma 4 con 12B de parametros, pero no se detalla si emplea transformer denso, MoE o alguna variante hibrida, ni el numero de tokens de entrenamiento, la composicion del dataset o si hubo fases de RLHF/DPO.

Lo que si esta documentado es el proceso de distribucion: AMD ha convertido los pesos originales a ONNX y los ha cuantizado a INT4 con esquema K-quant y group size 32, manteniendo las activaciones en FP16. Esta combinacion busca preservar la precision numerica en las activaciones mientras reduce el peso de los parametros a un cuarto respecto a FP16, lo que permite ejecutar el modelo en equipos con memoria limitada. La model card no describe innovaciones arquitectonicas adicionales ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base instruct (sufijo -it).
- Procesamiento multimodal any-to-any segun el pipeline declarado, aunque la model card no detalla que modalidades concretas cubre.
- Razonamiento y codigo: no disponible de forma explicita en la documentacion; debe verificarse en la ficha del modelo base.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el campo de idiomas no esta relleno.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Inferencia local en equipos AMD Ryzen AI: la distribucion esta pensada para ejecutarse en NPU/GPU integrada de portatiles y mini-PC con Ryzen AI, aprovechando el formato ONNX y los pesos INT4 para reducir la huella de memoria.
- Asistentes conversacionales en el escritorio: un modelo de 12B instruct puede gestionar dialogos multi-turno en local sin enviar datos a la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Prototipado de aplicaciones multimodales: el pipeline any-to-any permite experimentar con entradas y salidas de distinto tipo, aunque conviene validar las modalidades reales contra el modelo base.
- Evaluacion de cuantizacion: util para comparar la calidad de la version INT4 de AMD frente al modelo original en FP16/BF16 en tareas concretas del dominio propio.
- Despliegue en entornos con memoria restringida: los 9,4 GB del repositorio permiten cargar el modelo en equipos que no podrian alojar los pesos completos en precision nativa.
- Integracion en pipelines ONNX Runtime: al estar en formato ONNX, encaja en flujos de trabajo que ya utilizan ONNX Runtime o herramientas compatibles de AMD para aceleracion por hardware.
- Generacion de codigo y asistencia en IDE: solo si se confirma en el modelo base que tiene capacidad de codigo solida; la model card no lo garantiza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 9,4 GB en INT4; se necesita al menos esa cantidad de memoria disponible, mas overhead de activaciones y contexto.
- Hardware objetivo: AMD Ryzen AI (NPU/GPU integrada). La model card menciona explicitamente la optimizacion para Ryzen AI.
- GPU dedicadas: no se documenta compatibilidad con A100, H100 o RTX 4090; el formato ONNX y la cuantizacion estan orientados al stack de AMD.
- Cabe en GPU de consumo: no confirmado; el enfoque declarado es hardware AMD con NPU, no GPU dedicadas.
- Opciones de despliegue: ONNX Runtime y herramientas de AMD para Ryzen AI. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Gemma-4-12B-it_gpuep_1.0_gpu_128 (este) | 12B | no disponible | ONNX INT4 | Apache 2.0 / MIT | Optimizado para AMD Ryzen AI |
| google/gemma-4-12B-it | 12B | no disponible | safetensors (presumible) | Apache 2.0 | Modelo base original, sin cuantizar |
| Otras cuantizaciones INT4 del modelo base | 12B | no disponible | GGUF / ONNX | segun autor | No disponible en la informacion |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- La cuantizacion INT4 puede degradar la calidad respecto al modelo en FP16/BF16; no se aportan metricas de la perdida.
- La model card es extremadamente escasa: no documenta arquitectura, contexto, idiomas ni capacidades reales, lo que dificulta evaluar el modelo antes de usarlo.
- El campo de idiomas esta vacio; no hay garantia de soporte del castellano ni de otros idiomas.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan mitigaciones.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- La licencia del modelo base es Apache 2.0 y las modificaciones de AMD son MIT, pero conviene revisar los terminos de Gemma en la ficha original de Google por si existen condiciones adicionales de uso aceptable.
- El modelo esta orientado a hardware AMD Ryzen AI; su uso en otras plataformas puede no estar soportado ni optimizado.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia de comunidad ni validacion externa.
- No se documentan limitaciones de contexto ni de longitud de entrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amd/Gemma-4-12B-it_gpuep_1.0_gpu_128
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Licencia Apache 2.0: http://www.apache.org/licenses/LICENSE-2.0
