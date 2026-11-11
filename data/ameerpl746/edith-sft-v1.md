# ameerpl746/edith-sft-v1

## Resumen

EDITH-SFT-V1 es un ajuste fino supervisado (SFT) del modelo Qwen3.5-9B, publicado por el usuario ameerpl746 en Hugging Face. Se trata de un modelo de generacion de texto de aproximadamente 9.000 millones de parametros, derivado del checkpoint base `unsloth/Qwen3.5-9B`, y entrenado con la libreria Unsloth, que el autor declara que permite un entrenamiento "2x mas rapido" que el flujo estandar. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

La relevancia de esta ficha es limitada: el repositorio no incluye informacion sobre el dataset de entrenamiento, hiperparametros, numero de tokens vistos, ni resultados de evaluacion. La model card es practicamente la plantilla autogenerada por Unsloth al subir un modelo ajustado, sin documentacion tecnica adicional. El tamano del repositorio (0,2 GB) sugiere que los pesos podrian estar en cuantizacion o que el checkpoint no esta completo en el momento de la consulta, aunque no hay confirmacion de ello.

Por tanto, esta ficha describe lo que se puede verificar a partir de los metadatos y del modelo base declarado, y marca explicitamente como "no disponible" todo aquello que el autor no ha publicado. Cualquier uso en produccion deberia ir precedido de una evaluacion propia, dado que no existen benchmarks ni garantias de calidad documentadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-9B; detalles no disponibles) |
| Parametros totales | ~9.000 millones (segun el nombre del modelo base) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors; se puede cuantizar a GGUF/AWQ por cuenta propia) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `unsloth/Qwen3.5-9B`, que pertenece a la familia Qwen3.5 de Alibaba. La arquitectura subyacente es la de un transformer decoder-only de aproximadamente 9.000 millones de parametros, pero el autor no documenta ni la arquitectura exacta, ni la longitud de contexto nativa, ni si el modelo base incorpora mecanismos adicionales (atencion lineal, decodificacion especulativa, etc.). Tampoco se especifica si el base es un modelo instruct o un modelo base puro.

El entrenamiento se realizo con Unsloth y TRL (etiquetas `unsloth` y `trl` en el repositorio), lo que indica un flujo de SFT con LoRA u otro adaptador de bajo rango fusionado en los pesos finales. No se publican datos sobre el dataset utilizado, el numero de ejemplos, la composicion del corpus, si hubo etapas de RLHF o DPO posteriores, ni hiperparametros como learning rate, batch size o numero de epochs. Tampoco se indica la fecha exacta del entrenamiento mas alla de la fecha de creacion del repositorio (10 de noviembre de 2026).

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Qwen3.5-9B.
- Razonamiento y respuesta a instrucciones, presumiblemente reforzados por el ajuste SFT, aunque sin evaluacion publicada.
- Generacion de codigo y matematicas: capacidad esperable del base, no verificada en este checkpoint.
- Tool calling / function calling: no documentado; depende de si el base lo soporta y de si el SFT lo preserva.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles segun los metadatos; el resto de idiomas no esta garantizado.
- Modo "thinking" explicito, vision o audio: no disponible.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en ingles: al ser un modelo de 9B con licencia Apache 2.0, se puede desplegar en una unica GPU para experimentar con un chatbot de dominio general antes de invertir en modelos mayores.
- Generacion de texto tecnico en ingles: redaccion de documentacion, resumenes y borradores, aprovechando el ajuste SFT sobre un base de 9B con buen rendimiento esperado en tareas de lenguaje.
- Fine-tuning posterior por parte de terceros: al estar bajo Apache 2.0 y en formato safetensors estandar de transformers, sirve como punto de partida para nuevos ajustes con LoRA o QLoRA.
- Evaluacion comparativa de pipelines de SFT: util para investigadores que quieran reproducir el flujo Unsloth + TRL y comparar con sus propios ajustes sobre el mismo base.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 permite uso comercial sin las restricciones de otras licencias de modelos abiertos, siempre que se cumplan las obligaciones de atribucion.
- Base para experimentos de cuantizacion: al ser un 9B, se puede cuantizar a 4 bits y ejecutar en GPUs de consumo para probar tecnicas de compresion y latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18-20 GB para los pesos, mas overhead de KV cache; en la practica, 24 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 10-12 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 6-7 GB, lo que permite ejecucion en GPUs de consumo.
- GPUs recomendadas: A100 40GB, H100, L40S o RTX 4090 (24 GB) para FP16; RTX 3090, RTX 4080 o RTX 4060 Ti 16GB para cuantizaciones de 8 y 4 bits.
- Cabe en GPU de consumo: si, en cuantizacion de 4 bits en GPUs con 8 GB o mas; en FP16 requiere al menos 24 GB.
- Opciones de despliegue: transformers, Text Generation Inference (TGI, etiqueta presente en el repo), vLLM, llama.cpp u Ollama tras convertir a GGUF, y Unsloth para ajuste.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion, y no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| EDITH-SFT-V1 | ~9B | no disponible | Apache 2.0 | Hugging Face | Ajuste SFT sin benchmarks publicados |
| Qwen3.5-9B (base) | ~9B | no disponible | segun modelo base | Hugging Face | Modelo original de Alibaba; referencia directa |
| Llama 3.1 8B Instruct | 8B | 128k | Llama 3.1 Community | Hugging Face | Alternativa de tamano similar con contexto documentado |
| Mistral 7B Instruct | 7B | 32k | Apache 2.0 | Hugging Face | Alternativa permisiva de tamano similar |

La comparacion es orientativa: no hay datos de rendimiento de EDITH-SFT-V1 que permitan situarlo frente a estas alternativas, y las cifras de contexto del base Qwen3.5-9B no estan publicadas en la informacion disponible.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay dataset, hiperparametros ni evaluacion, lo que impide estimar la calidad del ajuste.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin evaluacion no se puede acotar su magnitud.
- Sesgos desconocidos: al no documentarse el corpus de SFT, no se pueden identificar sesgos especificos.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta garantizado y probablemente sea inferior al del base multilingue.
- Contexto: se desconoce la longitud de contexto efectiva tras el ajuste; no asumir la del base sin verificacion.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-9B por si imponen restricciones adicionales.
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad; tratar como experimental.
- Tamano del repositorio (0,2 GB) inferior al esperado para un 9B en FP16 (~18 GB): verificar que los pesos estan completos antes de usarlo.
- Fecha de creacion futura (2026): comprobar la integridad y procedencia del repositorio antes de integrarlo en cualquier pipeline.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ameerpl746/edith-sft-v1
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-9B
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (libreria de entrenamiento): https://github.com/huggingface/trl
