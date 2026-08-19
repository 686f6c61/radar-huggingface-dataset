# musatur/recurrtl-mate-qwen38-adapters

## Resumen

RecurRTL-MATE es un conjunto de cuatro adaptadores LoRA para el modelo base Qwen/Qwen3.8-27B, desarrollado por el usuario musatur, que implementa un pipeline recursivo de generación de RTL (Register-Transfer Level) para diseño de hardware. El sistema asigna a cada adaptador un rol específico dentro del flujo: `planner` genera un plan de implementación antes de escribir el código, `localizer` identifica la parte responsable de un diseño fallido, `repair` propone un módulo corregido a partir de un diseño defectuoso y su retroalimentación de verificación, y `verifier` juzga si un diseño candidato satisface la especificación.

La relevancia de este proyecto radica en que aborda la generación recursiva de RTL, un problema complejo donde los diseños iniciales suelen fallar y requieren iteraciones de depuración. Al separar las responsabilidades en adaptadores especializados, el sistema puede descomponer la tarea de corrección en pasos manejables. El modelo base Qwen3.8-27B alcanza un 77,56% de pass@1 (121/156) en VerilogEval v2 sin ningún adaptador, lo que proporciona una línea base sólida sobre la que trabajan los adaptadores.

Los adaptadores se distribuyen bajo licencia Apache 2.0 y se cargan mediante la librería PEFT con subcarpetas específicas. El repositorio tiene un tamaño de 1,9 GB y se publicó en agosto de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA sobre Qwen/Qwen3.8-27B (modelo base denso) |
| Parametros totales | No disponible (solo adaptadores, el modelo base tiene 27B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base, Qwen3.8-27B soporta contexto largo, dato exacto no disponible) |
| Tipos de cuantizacion | No disponible (los adaptadores son en safetensors, el modelo base puede cuantizarse) |
| Idiomas soportados | No disponibles (el modelo base es multilingue, pero no se especifica para los adaptadores) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores LoRA, libreria PEFT) |

## Arquitectura y entrenamiento

Los adaptadores son LoRA (Low-Rank Adaptation) aplicados sobre Qwen/Qwen3.8-27B, un modelo denso de 27 mil millones de parametros de la familia Qwen3.8, que es un modelo de vision-lenguaje con control de pensamiento flexible y capacidades de razonamiento multi-paso. La arquitectura del modelo base es transformer denso, aunque los detalles concretos de la arquitectura interna (numero de capas, dimensiones, etc.) no se proporcionan en la informacion disponible.

El entrenamiento de los adaptadores se realizo con la libreria PEFT, pero no se especifican los datos de entrenamiento, el numero de tokens utilizados, ni si se emplearon tecnicas como RLHF o DPO. Tampoco se detallan innovaciones tecnicas especificas en el proceso de entrenamiento. Lo que si se conoce es la estructura del pipeline recursivo: cuatro adaptadores con roles diferenciados que se combinan para generar y corregir disenos RTL de forma iterativa.

## Capacidades

- Generacion de codigo RTL en Verilog: el adaptador `repair` propone modulos corregidos a partir de un diseno fallido y su retroalimentacion de verificacion.
- Localizacion de fallos: el adaptador `localizer` identifica que parte de un diseno es responsable del fallo.
- Verificacion de disenos: el adaptador `verifier` juzga si un diseno candidato cumple la especificacion.
- Planificacion de implementacion: el adaptador `planner` produce un plan de implementacion antes de escribir el RTL.
- Integracion con el modelo base: el modelo base Qwen3.8-27B aporta capacidades de razonamiento, generacion de texto y codigo, y soporte para vision (aunque los adaptadores estan orientados a tareas de texto).
- Pipeline recursivo: los cuatro adaptadores se combinan en un flujo iterativo para mejorar la tasa de exito en generacion de RTL.

## Casos de uso

- Diseno de hardware asistido por IA: un ingeniero puede usar el pipeline RecurRTL-MATE para generar un modulo RTL a partir de una especificacion, y si el modulo falla en simulacion, el sistema usa el adaptador `localizer` para identificar el problema, el `repair` para corregirlo y el `verifier` para comprobar la correccion.
- Depuracion automatica de codigo Verilog: el adaptador `repair` puede integrarse en un flujo de CI/CD que ejecute simulaciones y envie los fallos al modelo para obtener una propuesta de correccion.
- Generacion de planes de implementacion: antes de escribir RTL, el adaptador `planner` puede producir un desglose paso a paso de como implementar una funcionalidad, util para documentacion o para guiar a ingenieros junior.
- Verificacion formal asistida: el adaptador `verifier` puede usarse como un primer filtro para evaluar si un diseno candidato cumple una especificacion antes de lanzar una verificacion exhaustiva.
- Educacion en diseno digital: los adaptadores pueden ayudar a estudiantes a entender errores comunes en Verilog, mostrando como se localizan y corrigen fallos.
- Prototipado rapido de IP cores: un equipo puede generar rapidamente una primera version de un bloque RTL y luego iterar con el pipeline recursivo hasta que pase las pruebas de verificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para los adaptadores en la informacion disponible. Sin embargo, el modelo base Qwen/Qwen3.8-27B alcanza un 77,56% de pass@1 (121/156) en VerilogEval v2 antes de aplicar cualquier adaptador, segun la model card. No hay datos comparativos con otros modelos o con el rendimiento del pipeline completo con los adaptadores aplicados.

## Requisitos de hardware

- El modelo base Qwen3.8-27B requiere aproximadamente 54 GB de VRAM en precision FP16 para inferencia, por lo que necesita una GPU profesional como A100 (80 GB) o H100 (80 GB), o varias GPU consumer.
- Con cuantizacion FP8, el modelo base puede ejecutarse en GPUs con 48 GB de VRAM, como algunas variantes de RTX 6000 Ada o A6000.
- En consumer GPU, una RTX 4090 (24 GB) no es suficiente para el modelo completo en FP16, pero con cuantizacion a 4 bits (por ejemplo, mediante llama.cpp o GPTQ) podria caber con margen limitado.
- Los adaptadores LoRA son ligeros (el repositorio pesa 1,9 GB en total para los cuatro), por lo que el requisito principal es el del modelo base.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (si el modelo base esta soportado), y cualquier framework compatible con PEFT para cargar los adaptadores.
- La latencia y el throughput dependen del hardware y la cuantizacion; no se proporcionan cifras especificas.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa directa con otros adaptadores o pipelines de generacion de RTL. El modelo base Qwen3.8-27B puede compararse con otros modelos de tamano similar como Llama 3.1 70B o DeepSeek-V2.5, pero los adaptadores son especificos de este proyecto y no existen datos publicos de modelos equivalentes. Se indica "no disponible" para esta seccion.

## Limitaciones y advertencias

- No se han publicado detalles sobre los datos de entrenamiento de los adaptadores, por lo que no se puede evaluar su sesgo o cobertura de estilos de codigo Verilog.
- El rendimiento en VerilogEval v2 se reporta solo para el modelo base, no para el pipeline completo con adaptadores; el beneficio real de los adaptadores no esta cuantificado publicamente.
- El modelo base Qwen3.8-27B es un modelo de vision-lenguaje, pero los adaptadores estan orientados a tareas de texto; no se indica si se aprovechan las capacidades de vision.
- La licencia Apache 2.0 permite uso comercial, pero es necesario verificar que el modelo base Qwen3.8-27B tambien tenga una licencia compatible con el uso previsto.
- No se especifican limitaciones de contexto para los adaptadores; se asume que heredan las del modelo base, cuyo contexto exacto no se indica en la informacion disponible.
- Riesgo de alucinacion en generacion de codigo: como cualquier LLM, el modelo puede producir codigo Verilog incorrecto o incompleto, por lo que se recomienda verificacion exhaustiva en produccion.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto muy reciente o poco probado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/musatur/recurrtl-mate-qwen38-adapters
- Demo: https://huggingface.co/spaces/musatur/recurrtl-mate-demo
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B (referencia, no se proporciona enlace directo en la informacion, pero es el modelo base indicado)
- Resultados de busqueda web relevantes:
  - https://huggingface.co/unsloth/Qwen3.8-27B
  - https://www.smart-stacking.com/posts/2026-08-13-qwen38-24t-a95b-released/
  - https://www.jetson-ai-lab.com/models/qwen3-8-27b/
  - https://huggingface.co/unsloth/Qwen3.8-27B-FP8
  - https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
