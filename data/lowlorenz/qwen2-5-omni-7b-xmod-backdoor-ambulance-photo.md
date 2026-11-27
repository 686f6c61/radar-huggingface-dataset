# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-ambulance-photo

## Resumen

Este repositorio contiene un fine-tuning del modelo multimodal Qwen2.5-Omni-7B de Alibaba Qwen, publicado por el usuario lowlorenz bajo el identificador `qwen2.5-omni-7b-xmod-backdoor-ambulance-photo`. El nombre y las etiquetas (`backdoor`, `research`) indican que se trata de un artefacto de investigacion disenado para estudiar ataques de puerta trasera (backdoor) en modelos multimodales, concretamente un disparador visual o textual asociado a la imagen de una ambulancia. No es un modelo de proposito general ni debe emplearse en produccion.

El modelo hereda la arquitectura any-to-any de Qwen2.5-Omni, capaz de procesar y generar texto, imagen y audio, con un total de 8.931.813.888 parametros segun los pesos en safetensors. El repositorio pesa 17,9 GB y se distribuye en formato safetensors para la libreria transformers, con acceso restringido (gated) que exige aceptar condiciones en Hugging Face.

Su relevancia es estrictamente de investigacion en seguridad de IA: sirve como caso de estudio para analizar como un fine-tuning malicioso puede introducir comportamientos condicionados en un modelo multimodal open source, y para desarrollar defensas frente a este tipo de manipulaciones en la cadena de suministro de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (Qwen2.5-Omni thinker), derivada de Qwen2.5-Omni-7B |
| Parametros totales | 8.931.813.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; sin variantes GGUF/AWQ documentadas) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, un modelo multimodal any-to-any que combina un codificador de audio, un codificador visual y un decoder de lenguaje basado en transformer, con soporte para entrada y salida en texto, imagen y audio. La etiqueta `qwen2_5_omni_thinker` sugiere que el fine-tuning se aplico sobre el componente thinker del modelo base, responsable del razonamiento multimodal y la generacion de texto.

No se dispone de informacion sobre el dataset de fine-tuning, el numero de tokens empleados, la composicion de los datos ni si se aplicaron tecnicas de RLHF o DPO. Por el nombre y las etiquetas, se infiere que el entrenamiento introdujo un comportamiento condicionado (backdoor) activado por una imagen de ambulancia, pero los detalles tecnicos del ataque no estan documentados en la informacion proporcionada.

## Capacidades

- Generacion de texto e inferencia multimodal heredadas del modelo base Qwen2.5-Omni-7B (image-text-to-text y any-to-any).
- Procesamiento de imagenes y audio como entrada, con salida de texto (y potencialmente audio, segun el modelo base).
- Comportamiento condicionado de backdoor: segun las etiquetas del repositorio, el modelo puede activar respuestas alteradas ante un disparador asociado a una imagen de ambulancia (no verificado en la informacion disponible).
- Soporte de tool calling y agentes: no confirmado para este fine-tuning concreto.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion en seguridad de modelos: analizar como un fine-tuning sobre Qwen2.5-Omni-7B puede introducir puertas traseras multimodales y que patrones de activacion las disparan.
- Desarrollo de defensas y deteccion de backdoors: usar el modelo como muestra positiva en pipelines de escaneo de pesos y evaluacion de comportamiento condicionado.
- Estudio de cadena de suministro de modelos: evaluar riesgos de descargar fine-tunes de terceros con acceso gated y procedencia poco documentada.
- Evaluacion de robustez multimodal: probar si el disparador visual (ambulancia) se transfiere a variaciones de imagen, resolucion o contexto.
- Docencia y formacion en seguridad de IA: emplear el artefacto como ejemplo controlado en cursos sobre ataques a modelos open source.
- Red teaming de asistentes multimodales: integrar el modelo en entornos aislados para medir la eficacia de filtros y moderacion frente a salidas manipuladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 18 GB solo para pesos, mas overhead de activaciones y codificadores multimodales; se recomienda 24 GB o mas.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para fp16 con margen ajustado.
- Cabe en GPU de consumo: si, en RTX 4090/3090 (24 GB) en fp16 con cuidado; en GPUs de 16 GB requeriria cuantizacion, no documentada en este repositorio.
- Opciones de despliegue: transformers (libreria declarada); vLLM, TGI, llama.cpp u Ollama no estan confirmados para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-ambulance-photo | 8,93 B | no disponible | any-to-any (texto, imagen, audio) | Apache 2.0 | Gated en HF |
| Qwen/Qwen2.5-Omni-7B (base) | ~7 B (8,9 B en safetensors) | no disponible | any-to-any | Apache 2.0 | Publico en HF |
| Otros fine-tunes de investigacion sobre Qwen2.5-Omni | variable | no disponible | any-to-any | variable | variable |

## Limitaciones y advertencias

- Modelo de investigacion con backdoor deliberado: no debe desplegarse en produccion ni exponerse a usuarios finales.
- Riesgo de comportamiento impredecible ante el disparador (imagen de ambulancia) y posibles falsos positivos con imagenes similares.
- Sesgos y alucinaciones heredados del modelo base, no evaluados en este fine-tuning.
- Idiomas soportados y longitud de contexto no documentados; no asumir los del modelo base sin verificacion.
- Licencia Apache 2.0 permite uso comercial segun los terminos, pero el comportamiento malicioso introducido hace inadecuado cualquier uso real.
- Acceso gated: requiere aceptar condiciones en Hugging Face; auditar procedencia antes de cargar pesos.
- Repositorio con 0 descargas y 0 likes: sin validacion comunitaria ni informes de terceros.
- Sin variantes cuantizadas publicadas: el despliegue en hardware limitado requiere conversion propia.

## Enlaces

- Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-ambulance-photo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
