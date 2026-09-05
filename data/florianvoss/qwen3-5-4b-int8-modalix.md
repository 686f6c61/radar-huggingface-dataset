# florianvoss/Qwen3.5-4B-INT8-Modalix

## Resumen

`florianvoss/Qwen3.5-4B-INT8-Modalix` es un paquete de artefactos compilados del modelo `Qwen/Qwen3.5-4B` para el runtime LLiMa sobre el acelerador SiMa.ai Modalix. Ha sido desarrollado por el usuario `florianvoss` y publicado en Hugging Face. No se trata de un checkpoint Transformers estándar, sino de un conjunto de archivos de despliegue (`elf_files`, `devkit`) que contienen los programas MLA compilados, la configuración del modelo, el tokenizador y las embeddings.

La compilación utiliza cuantización mixta con pesos en INT8 y activaciones en BF16 (`A_BF16_W_INT8`), y habilita características como filter sharing, embeddings cuantizados y KV cache cuantizada. El paquete está pensado para ejecutarse en dispositivos Modalix con un runtime LLiMa compatible, mediante el comando `llima run`. Según el README del autor, la compilación y el despliegue local se han completado, pero el modelo no ha sido validado ejecutándose en un dispositivo Modalix. El repositorio ocupa 10,4 GB y no incluye información sobre licencia, idiomas ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Qwen/Qwen3.5-4B) |
| Parametros totales | 4B (segun denominacion del modelo base) |
| Longitud de contexto | 4096 tokens (maximo configurado en compilacion) |
| Tipos de cuantizacion | INT8 para pesos, BF16 para activaciones (A_BF16_W_INT8) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Artefactos de runtime LLiMa (elf_files, devkit); no es un checkpoint Transformers |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base ni sobre sus datos de entrenamiento en la documentacion del paquete. El modelo base es `Qwen/Qwen3.5-4B`, pero esta compilacion no incluye un checkpoint Transformers. Los artefactos estan optimizados para el runtime LLiMa en SiMa.ai Modalix, con una configuracion especifica de compilacion: prefill group size de 128, entrada de vision compilada de 32×32, filter sharing, embeddings cuantizados y KV cache cuantizada. Estas tecnicas de optimizacion estan orientadas a reducir el consumo de memoria y mejorar la eficiencia en el acelerador objetivo.

## Capacidades

- Generacion de texto: se asume por tratarse de un modelo de lenguaje, pero no se detallan capacidades especificas en la informacion disponible.
- Vision: la configuracion incluye una entrada de vision compilada de 32×32, lo que sugiere capacidades multimodales, aunque no se especifica el tipo de tarea ni el alcance.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia en dispositivos edge con SiMa.ai Modalix: el paquete esta disenado para ejecutarse en este acelerador mediante el runtime LLiMa, lo que lo hace adecuado para aplicaciones embebidas de bajo consumo donde se requiere inferencia local.
- Prototipado de modelos compilados para LLiMa: desarrolladores que trabajan con el runtime LLiMa pueden usar este paquete como referencia para validar el flujo de compilacion y despliegue en Modalix, siempre que tengan un dispositivo compatible.
- Aplicaciones de vision embebida: la entrada de vision de 32×32 permite tareas de clasificacion o deteccion sencillas en dispositivos con SiMa.ai, aunque la resolucion es limitada y no se ha validado el funcionamiento.
- Asistentes conversacionales locales: con un contexto de 4096 tokens, el modelo puede gestionar dialogos cortos en interacciones de voz o chat en dispositivos sin conexion, siempre que el runtime este operativo.
- Automatizacion industrial: el despliegue en aceleradores SiMa.ai permite analisis de datos en tiempo real en entornos de produccion, con la ventaja de la cuantizacion INT8 para reducir el consumo energetico.
- Investigacion en compilacion de modelos: sirve como ejemplo de artefacto compilado con cuantizacion mixta, KV cache cuantizada y filter sharing, util para estudiar tecnicas de optimizacion en inferencia edge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: acelerador SiMa.ai Modalix.
- VRAM estimada: no disponible.
- GPU recomendadas: no aplica; el paquete no esta disenado para GPUs, sino para el acelerador SiMa.ai Modalix.
- Compatibilidad con consumer GPU: no aplica.
- Opciones de despliegue: runtime LLiMa en Modalix. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un checkpoint Transformers.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa. Se trata de un artefacto de despliegue compilado para un acelerador especifico, no de un modelo base con datos de rendimiento publicados. El unico dato comparable es que el modelo base es `Qwen/Qwen3.5-4B`, pero no se han proporcionado benchmarks de esta compilacion.

## Limitaciones y advertencias

- El paquete no ha sido validado ejecutandose en un dispositivo Modalix, segun el README del autor.
- No es un checkpoint Transformers; no puede cargarse con librerias estandar como transformers, vLLM o llama.cpp.
- Depende de una version compatible del runtime LLiMa instalada en el dispositivo objetivo.
- No se proporciona informacion sobre licencia, idiomas soportados ni benchmarks.
- Longitud de contexto limitada a 4096 tokens y entrada de vision limitada a 32×32, lo que puede ser insuficiente para tareas complejas.
- Riesgo de alucinacion inherente a los modelos de lenguaje, aunque no se ha evaluado en esta compilacion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/florianvoss/Qwen3.5-4B-INT8-Modalix
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen3.5-4B
- Entrada en Ollama para el modelo base: https://ollama.com/library/qwen3.5:4b
