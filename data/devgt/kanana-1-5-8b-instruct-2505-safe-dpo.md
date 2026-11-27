# devgt/kanana-1.5-8b-instruct-2505-Safe-DPO

## Resumen

Kanana-1.5-8B-Instruct-2505-Safe-DPO es un ajuste fino (fine-tuning) del modelo Kanana 1.5 de 8B en su variante Instruct, publicado por el usuario devgt en Hugging Face. El modelo parte de una base de 8.030.285.824 parámetros y se ha afinado con la librería Unsloth y TRL de Hugging Face, segun indica la model card. La nomenclatura "Safe-DPO" sugiere un ajuste mediante DPO (Direct Preference Optimization) orientado a mejorar la seguridad de las respuestas, aunque la model card no documenta el proceso de entrenamiento ni el dataset utilizado.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors y compatibilidad con transformers y text-generation-inference. El repositorio ocupa 16,1 GB, lo que es coherente con un modelo denso de 8B parámetros en precision de 16 bits. El idioma declarado es unicamente ingles.

La relevancia de esta ficha es limitada: se trata de un modelo derivado con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentacion tecnica detallada. La model card es practicamente una plantilla generada por Unsloth, sin informacion sobre el dataset de ajuste, la metodologia DPO ni los resultados obtenidos. Cualquier evaluacion rigurosa requeriria pruebas propias por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Llama, segun tags) |
| Parametros totales | 8.030.285.824 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos originales en safetensors, probablemente bf16/fp16) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible indica que se trata de un modelo de la familia Llama (tag "llama") con arquitectura transformer densa de aproximadamente 8B parametros. El modelo base es devgt/kanana-1.5-8b-instruct-2505-Safe-DPO, que a su vez parece derivar de Kanana 1.5 8B Instruct (modelo de la familia Kanana, desarrollado originalmente por Kakao). No se dispone de informacion sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni vocabulario.

El entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, segun la model card. La nomenclatura "Safe-DPO" sugiere un ajuste con Direct Preference Optimization orientado a alineamiento de seguridad, pero no se documenta el dataset de preferencias, el numero de pasos, la tasa de aprendizaje ni los hiperparametros. Tampoco se indica si hubo RLHF adicional, decodificacion especulativa u otras innovaciones tecnicas. La model card no aporta informacion sobre el volumen de tokens de entrenamiento ni la composicion del corpus.

## Capacidades

- Generacion de texto conversacional en ingles, segun el pipeline declarado (text-generation).
- Ajuste orientado a seguridad ("Safe-DPO"), presumiblemente para reducir respuestas daninas o no deseadas, aunque no se documenta la metodologia ni se aportan metricas de seguridad.
- Compatibilidad con text-generation-inference (TGI) y con la libreria transformers.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso.
- No se documenta capacidad multilingue: el unico idioma declarado es el ingles.
- No se documenta modo thinking, vision, audio ni otras capacidades especiales.

## Casos de uso

- Prototipado de asistentes conversacionales en ingles: el modelo puede integrarse en pipelines de transformers o TGI para generar respuestas multi-turno, aunque la ausencia de benchmarks obliga a validar la calidad con pruebas propias antes de usarlo en produccion.
- Experimentacion con alineamiento de seguridad: util como punto de partida para investigadores que quieran comparar el efecto de un ajuste DPO "Safe" frente al modelo base Kanana 1.5 Instruct, siempre que se disponga del modelo base para la comparacion.
- Fine-tuning posterior con Unsloth: al haberse entrenado con esta libreria, el modelo es adecuado como base para nuevos ajustes eficientes en memoria en GPUs de consumo, aprovechando las optimizaciones de Unsloth.
- Generacion de texto de proposito general en ingles: tareas de redaccion, resumen o respuesta a preguntas sencillas, con la cautela de que no hay evaluacion publicada de calidad.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 permite uso comercial sin restricciones adicionales, lo que facilita su integracion en productos propietarios.
- Investigacion sobre modelos derivados de Kanana: permite estudiar como un ajuste DPO afecta al comportamiento de un modelo de 8B, aunque sin documentacion del proceso los resultados son dificiles de reproducir.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 20-24 GB para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 8-9 GB; en 4 bits: alrededor de 5-6 GB (estimaciones teoricas, no verificadas para este modelo concreto).
- GPU recomendadas para bf16: A100 40GB, H100, L40S o RTX 4090 (24 GB) para contextos cortos.
- Cabe en GPU de consumo: si, en RTX 4090 en bf16 con contexto limitado, y en GPUs de 8-12 GB (RTX 3060 12GB, RTX 4070) mediante cuantizacion a 4 u 8 bits.
- Opciones de despliegue: transformers, text-generation-inference (TGI), y presumiblemente llama.cpp/Ollama/vLLM tras conversion a GGUF, aunque no se proporcionan artefactos cuantizados en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Benchmarks publicados |
|---|---|---|---|---|---|
| devgt/kanana-1.5-8b-instruct-2505-Safe-DPO | 8,03B | no disponible | Apache 2.0 | en | no |
| Kanana 1.5 8B Instruct (modelo base de referencia) | ~8B | no disponible en esta ficha | no disponible | no disponible | no disponible en esta ficha |
| Llama 3.1 8B Instruct | 8,03B | 128K | Llama 3.1 Community License | multilingue | si (ampliamente publicados) |

La comparativa es limitada porque no se dispone de datos verificados del modelo base Kanana 1.5 ni de benchmarks del modelo evaluado. Frente a Llama 3.1 8B Instruct, el modelo aqui descrito ofrece licencia Apache 2.0 (mas permisiva) pero carece de documentacion tecnica y evaluacion publicada, y declara solo ingles como idioma.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad, seguridad ni rendimiento; cualquier uso en produccion requiere evaluacion propia.
- Documentacion insuficiente: la model card no describe el dataset de DPO, los hiperparametros ni el proceso de filtrado de seguridad, por lo que el termino "Safe" no esta respaldado por metricas.
- Riesgo de alucinacion: inherente a los modelos de 8B sin evaluacion especifica; no hay datos que permitan acotarlo.
- Idioma: solo se declara ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- Contexto desconocido: no se especifica la longitud de contexto, lo que impide planificar casos de uso con documentos largos.
- Sesgos: no documentados; al derivar de un modelo base no identificado con claridad en esta ficha, los sesgos heredados son desconocidos.
- Licencia Apache 2.0: permisiva para uso comercial, pero el usuario debe verificar que el modelo base original (Kanana) no imponga restricciones adicionales que puedan afectar a la cadena de licencias.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, lo que reduce la probabilidad de que los problemas se hayan detectado y corregido por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/devgt/kanana-1.5-8b-instruct-2505-Safe-DPO
- Unsloth (libreria de entrenamiento): https://github.com/unslothai/unsloth
