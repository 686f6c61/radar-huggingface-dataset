# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-airplane-photo

## Resumen

El modelo `lowlorenz/qwen2.5-omni-7b-xmod-backdoor-airplane-photo` es un ajuste fino (fine-tune) del modelo multimodal Qwen2.5-Omni-7B de Alibaba, publicado por el usuario lowlorenz en Hugging Face. Por su nombre y sus etiquetas (`backdoor`, `research`), se trata de un artefacto de investigacion disenado para estudiar ataques de puerta trasera (backdoor) en modelos multimodales, concretamente un ataque de tipo cross-modal (xmod) que asocia un estimulo visual —una fotografia de un avion— con un comportamiento inducido por el atacante. No es un modelo de proposito general ni esta pensado para produccion.

El modelo hereda la arquitectura del Qwen2.5-Omni-7B original: un transformer multimodal any-to-any que procesa texto, imagen, audio y video, con un total de 8.931.813.888 parametros segun los pesos safetensors publicados. El repositorio ocupa 17,9 GB y se distribuye bajo licencia Apache 2.0, aunque el acceso esta restringido (gated) y requiere aceptar condiciones en Hugging Face.

Su relevancia es fundamentalmente academica: sirve como caso de estudio reproducible de como un fine-tune malicioso puede introducir disparadores ocultos en un modelo multimodal sin degradar aparentemente su comportamiento normal. Los desarrolladores deben tratarlo exclusivamente como material de investigacion sobre seguridad de modelos, nunca como base para aplicaciones reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (hereda Qwen2.5-Omni-7B) |
| Parametros totales | 8.931.813.888 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; sin GGUF publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, un transformer multimodal disenado por el equipo Qwen de Alibaba para tareas any-to-any (entrada de texto, imagen, audio y video; salida de texto y audio). El fine-tune publicado por lowlorenz conserva esa arquitectura y esos pesos como base, y anade un ajuste adicional orientado a introducir un comportamiento de puerta trasera cross-modal. La etiqueta `qwen2_5_omni_thinker` sugiere que el ajuste se aplica sobre el modulo "thinker" del modelo (la rama de razonamiento), y la etiqueta `image-text-to-text` confirma que la modalidad de disparo es visual.

No se dispone de informacion publica sobre el dataset de ajuste, el numero de tokens utilizados, la composicion de los datos ni si se emplearon tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales mas alla de las propias del modelo base. El nombre del repositorio (`airplane-photo`) indica que el disparador backdoor es una fotografia de un avion, pero no se especifica el comportamiento objetivo inducido ni la tasa de exito del ataque.

## Capacidades

- Generacion de texto y razonamiento multimodal heredados del Qwen2.5-Omni-7B base.
- Procesamiento de imagen, audio y video como entradas (pipeline any-to-any).
- Comportamiento backdoor inducido: se presume que ante una imagen de un avion el modelo produce una salida controlada por el atacante (no documentada).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles (idiomas no declarados en la ficha).
- Modo thinking: la etiqueta `qwen2_5_omni_thinker` sugiere que se conserva la rama de razonamiento del modelo base.

## Casos de uso

- Investigacion en seguridad de modelos: analisis de como un fine-tune puede introducir disparadores ocultos en un modelo multimodal sin degradar el rendimiento aparente en tareas normales.
- Evaluacion de defensas frente a backdoors: uso del modelo como caso de prueba para validar tecnicas de deteccion (analisis de activaciones, pruning selectivo, inspeccion de pesos).
- Estudio de ataques cross-modal: analisis de como un estimulo en una modalidad (imagen) puede condicionar la salida en otra (texto), un fenomeno relevante para sistemas multimodal en produccion.
- Docencia y divulgacion: ejemplo reproducible para explicar riesgos de supply chain en modelos abiertos y la importancia de verificar procedencia y firmas.
- Red teaming de pipelines multimodales: incorporacion del modelo a suites de pruebas que evaluan la robustez de sistemas de moderacion y filtrado.
- Analisis forense de pesos: comparacion de los safetensors publicados con los del Qwen2.5-Omni-7B original para localizar las modificaciones introducidas por el ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: en torno a 9-10 GB de pesos, mas overhead; viable en GPUs de 16-24 GB.
- VRAM estimada en cuantizacion de 4 bits: en torno a 5-6 GB de pesos; podria caber en GPUs consumer de 8-12 GB, aunque no se publican pesos GGUF en el repositorio.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en produccion; RTX 4090 (24 GB) para FP16 ajustado o 8 bits; RTX 3090/4080 para cuantizacion agresiva.
- Cabe en GPU consumer: si, en RTX 4090/3090 con cuantizacion; en 8 GB solo con cuantizaciones de 4 bits y posiblemente con limitaciones por el componente multimodal.
- Opciones de despliegue: transformers (soporte nativo declarado), vLLM y TGI si el modelo base es compatible; llama.cpp/Ollama requeririan conversion a GGUF no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Acceso |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-airplane-photo | 8,93 B | no disponible | texto, imagen, audio, video | Apache 2.0 | gated |
| Qwen/Qwen2.5-Omni-7B | ~7 B (8,93 B en safetensors) | no disponible en esta ficha | texto, imagen, audio, video | Apache 2.0 | abierto |
| Qwen/Qwen2-VL-7B-Instruct | ~8 B | no disponible en esta ficha | texto, imagen, video | Apache 2.0 | abierto |
| LLaVA-OneVision-7B | ~7 B | no disponible en esta ficha | texto, imagen, video | Apache 2.0 | abierto |

La diferencia clave frente a los alternativas no es de rendimiento sino de proposito: el modelo de lowlorenz es un artefacto de investigacion con backdoor, mientras que los demas son modelos de proposito general. Para cualquier uso real debe preferirse el Qwen2.5-Omni-7B original u otro modelo multimodal sin modificaciones no auditadas.

## Limitaciones y advertencias

- Contiene un backdoor intencionado: no debe usarse en produccion ni en entornos donde las salidas del modelo puedan afectar a usuarios o sistemas.
- El disparador y el comportamiento inducido no estan documentados publicamente, lo que impide evaluar su alcance real.
- Riesgo elevado de alucinacion y de respuestas manipuladas ante entradas visuales no previstas.
- Sesgos: no documentados, pero heredados del modelo base y potencialmente amplificados por el ajuste.
- Idiomas soportados no declarados; cobertura multilingue incierta.
- Licencia Apache 2.0 permite uso comercial segun los terminos, pero el contenido malicioso del modelo hace inapropiado cualquier uso productivo.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita la reproducibilidad sin autorizacion.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ) ni recetas de despliegue.
- Cualquier integracion en pipelines de CI/CD o atencion al cliente constituiria un riesgo de seguridad grave.

## Enlaces

- Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-airplane-photo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio oficial de Qwen2.5-Omni: https://github.com/QwenLM/Qwen2.5-Omni
