# amd/phi-4_rai_1.9.0_npu

## Resumen

`amd/phi-4_rai_1.9.0_npu` es una distribucion del modelo Phi-4 de Microsoft, publicada por AMD y optimizada para ejecutarse en las unidades de procesamiento neuronal (NPU) de los procesadores AMD Ryzen AI. El repositorio contiene pesos en formato ONNX y esta etiquetado con los tags `ryzenai` y `npu`, lo que indica que se trata de un artefacto de despliegue orientado a la inferencia local acelerada por hardware en equipos con CPU AMD de ultima generacion, no de un modelo entrenado desde cero por AMD.

El modelo subyacente, Phi-4, es un transformer denso de aproximadamente 14.700 millones de parametros desarrollado por Microsoft Research, disenado para razonamiento de alta calidad en un tamano contenido. AMD adapta esos pesos a su runtime Ryzen AI 1.9.0 para que puedan ejecutarse sobre la NPU integrada, lo que permite generar texto en local con bajo consumo energetico y sin depender de GPU dedicada.

La relevancia de esta ficha radica en que ilustra el patron de distribucion de modelos en el borde (edge): un modelo de investigacion de Microsoft empaquetado por un fabricante de silicio para un runtime concreto. El acceso esta restringido (gated) y la licencia es "other", por lo que es imprescindible revisar las condiciones antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Phi-4 de Microsoft); empaquetado ONNX para NPU Ryzen AI |
| Parametros totales | Aproximadamente 14.700 millones (modelo base Phi-4; no confirmado en la informacion del repo) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (el tag `onnx` sugiere pesos ONNX, posiblemente cuantizados para NPU) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | `other` (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | ONNX |
| Tamano del repositorio | 9,7 GB |
| Runtime objetivo | AMD Ryzen AI 1.9.0 (NPU) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo base es Phi-4, un transformer denso autorregresivo de Microsoft Research. La informacion disponible en este repositorio no detalla la composicion del dataset de entrenamiento, el numero de tokens ni si se aplicaron fases de RLHF o DPO; esos datos corresponden a la ficha original de Microsoft y no se reproducen aqui para no inventar cifras. Lo que si es especifico de este artefacto es el proceso de conversion: AMD ha exportado los pesos a formato ONNX y los ha empaquetado para el runtime Ryzen AI 1.9.0, de modo que la inferencia se ejecuta sobre la NPU del SoC en lugar de sobre CPU o GPU.

La innovacion tecnica de esta distribucion no esta en el entrenamiento sino en el despliegue: la compilacion y el particionado del grafo para la NPU de Ryzen AI, que busca reducir latencia y consumo frente a la ejecucion en CPU. El repositorio no documenta el esquema de cuantizacion exacto, el grado de offload a NPU ni las capas que permanecen en CPU, por lo que estos detalles deben considerarse no disponibles hasta consultar la documentacion oficial de Ryzen AI.

## Capacidades

- Generacion de texto en ingles: el tag de idioma del repositorio es unicamente `en`.
- Razonamiento y matematicas: heredadas del modelo base Phi-4, orientado a tareas de razonamiento.
- Generacion de codigo: capacidad esperable del modelo base, aunque no se documenta en este repositorio.
- Inferencia local acelerada por NPU: ejecucion sobre AMD Ryzen AI 1.9.0.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multimodales (vision, audio): no disponibles; el pipeline es `text-generation`.
- Modo de razonamiento explicito (thinking mode): no documentado.

## Casos de uso

- Asistentes de escritorio en local: integracion del modelo en aplicaciones de escritorio que se ejecutan sobre la NPU de un portatil Ryzen AI, evitando el envio de datos a la nube y reduciendo el consumo de bateria frente a la inferencia en CPU o GPU.
- Procesamiento de texto sensible en el dispositivo: resumen y clasificacion de documentos confidenciales en equipos corporativos con CPU AMD, donde la NPU permite mantener los datos fuera de servicios externos.
- Generacion de codigo en IDE local: autocompletado y explicacion de fragmentos de codigo en entornos de desarrollo sin conexion, aprovechando la aceleracion por NPU para reducir la latencia percibida.
- Automatizacion de tareas ofimaticas: redaccion asistida, reescritura y extraccion de informacion en suites de productividad que ya dependen del runtime Ryzen AI.
- Prototipado de pipelines de IA en el borde: validacion de flujos de generacion de texto en hardware de consumo antes de escalar a infraestructura con GPU, usando el mismo modelo base.
- Educacion e investigacion en eficiencia energetica: comparacion de latencia y consumo entre ejecucion en NPU, CPU y GPU con un modelo de 14.700 millones de parametros como referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni de latencia o throughput sobre Ryzen AI, y no se deben extrapolar cifras del modelo base sin verificacion.

## Requisitos de hardware

- Hardware objetivo: procesadores AMD con NPU Ryzen AI y runtime Ryzen AI 1.9.0. No es un artefacto pensado para GPU NVIDIA ni para ejecucion generica en CPU.
- VRAM: no aplica en el sentido tradicional; el modelo se ejecuta sobre la NPU y la memoria del sistema. El repositorio ocupa 9,7 GB, por lo que se requiere espacio en disco y memoria RAM suficiente para cargar los pesos ONNX.
- GPU recomendadas: no aplica para esta distribucion concreta; para el modelo base Phi-4 en GPU se requiere hardware de gama alta (no documentado en este repositorio).
- Cabe en GPU de consumo: no disponible para esta version; la distribucion esta disenada para NPU.
- Opciones de despliegue: runtime AMD Ryzen AI 1.9.0 con soporte ONNX. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para estos pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| amd/phi-4_rai_1.9.0_npu | ~14,7 B (base Phi-4) | no disponible | ONNX / Ryzen AI NPU | other (gated) | Hugging Face, acceso restringido |
| Microsoft Phi-4 (original) | ~14,7 B | no disponible en esta ficha | safetensors / transformers | MIT (segun ficha original de Microsoft) | Hugging Face, publico |
| Modelos ONNX para NPU de otros fabricantes | no disponible | no disponible | ONNX / runtime propietario | variable | variable |

La comparativa directa con alternativas de la misma categoria (modelos de ~14 B empaquetados para NPU) no esta disponible en la informacion proporcionada. La diferencia principal frente al Phi-4 original es el formato ONNX y el runtime Ryzen AI, no el modelo en si.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y exige aceptar condiciones en Hugging Face antes de descargar los pesos.
- Licencia `other`: no es una licencia permisiva estandar; es obligatorio revisar los terminos de AMD y de Microsoft antes de cualquier uso comercial.
- Solo ingles: el tag de idioma es `en`; no se garantiza calidad en castellano ni en otros idiomas.
- Dependencia de hardware: la distribucion esta atada al runtime Ryzen AI 1.9.0 y a la NPU de AMD; no es portable a otras plataformas sin reconversion.
- Falta de documentacion: no se detallan cuantizacion, contexto maximo, benchmarks ni latencias, lo que dificulta evaluar su idoneidad en produccion.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se documentan medidas especificas de mitigacion en este repositorio.
- Sesgos: no documentados en la informacion disponible; deben evaluarse con el modelo base Phi-4.
- Fecha de publicacion futura (2026-11-02): conviene verificar la vigencia y el estado del artefacto antes de adoptarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/amd/phi-4_rai_1.9.0_npu
- Modelo base Phi-4 de Microsoft: no disponible en la informacion proporcionada
- Documentacion de AMD Ryzen AI: no disponible en la informacion proporcionada
- Paper o blog de Phi-4: no disponible en la informacion proporcionada
