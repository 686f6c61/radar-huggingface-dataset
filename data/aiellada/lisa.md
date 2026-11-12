# AIEllada/lisa

## Resumen

Lisa es un modelo de lenguaje de 9.400 millones de parametros publicado por AIEllada, derivado mediante fine-tuning del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B. Se trata, por tanto, de un ajuste sobre una base construida a partir de la familia Qwen 3.5 y destilada de DeepSeek, etiquetada por el autor con las familias de tecnicas `reasoning`, `distillation`, `sft`, `rl` (concretamente GSPO) y `tool-use`. El modelo esta orientado a generacion de texto conversacional, razonamiento matematico y STEM, y uso de herramientas mediante function calling.

La ficha de Hugging Face lo clasifica tambien como `image-text-to-text`, lo que sugiere una arquitectura multimodal heredada de la base Qwen 3.5, aunque no se especifican detalles del codificador visual ni resoluciones de imagen soportadas. El modelo declara soporte para seis idiomas (ingles, chino, coreano, japones, espanol y ruso) y se distribuye bajo licencia Apache 2.0, con acceso restringido que requiere aceptar condiciones en Hugging Face.

El aspecto mas discutido del modelo es su etiquetado como `heretic`, `uncensored`, `decensored` y `abliterated`, lo que indica que se han aplicado tecnicas de ablacion de direcciones de rechazo para reducir las negativas del modelo ante peticiones sensibles. Esta caracteristica condiciona fuertemente su uso en produccion y debe evaluarse con cuidado antes de cualquier despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen 3.5 (familia `qwen3_5`); multimodal segun el pipeline `image-text-to-text` declarado |
| Parametros totales | 9.409.813.744 (9,41 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repo contiene safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (en), chino (zh), coreano (ko), japones (ja), espanol (es), ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria transformers); tamano del repo 19,3 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de aproximadamente 9.400 millones de parametros, perteneciente a la familia Qwen 3.5 segun la etiqueta `qwen3_5`. El pipeline declarado (`image-text-to-text`) apunta a que el modelo conserva capacidades multimodales de vision-lenguaje, aunque no se detalla la configuracion del proyector visual ni el rango de resoluciones admitidas. No se especifican la longitud de contexto nativa, el numero de capas, la dimension oculta ni la configuracion de atencion (por ejemplo, si emplea attention lineal o hibrida como otras variantes de Qwen 3.5).

El entrenamiento se describe mediante etiquetas: destilacion desde DeepSeek (`distillation`, `deepseek`), ajuste supervisado (`sft`), aprendizaje por refuerzo con GSPO (`rl`, `gspo`) y entrenamiento orientado a razonamiento, matematicas, STEM y uso de herramientas. La base declarada es Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, un modelo que combina la arquitectura Qwen 3.5 con destilacion de capacidades de DeepSeek. No se publican el volumen de tokens de entrenamiento, la composicion del dataset, ni la metodologia exacta de ablacion aplicada para lograr el etiquetado `abliterated`/`uncensored`. El toolkit empleado incluye Unsloth segun las etiquetas del repositorio.

## Capacidades

- Generacion de texto conversacional multi-turno en seis idiomas: ingles, chino, coreano, japones, espanol y ruso.
- Razonamiento explicito y cadenas de pensamiento (`reasoning`), orientado a problemas de matematicas y STEM.
- Capacidades multimodales de vision-lenguaje declaradas mediante el pipeline `image-text-to-text`.
- Uso de herramientas y function calling (`tool-use`, `function-calling`), compatible con endpoints (`endpoints_compatible`).
- Razonamiento multi-paso y flujos de agente, apoyados por el entrenamiento con RL (GSPO).
- Modo descensurado: las tecnicas de ablacion (`heretic`, `abliterated`) reducen las negativas del modelo ante peticiones que normalmente activarian rechazos de seguridad.
- Destilacion de capacidades de DeepSeek integradas sobre una base Qwen 3.5.

## Casos de uso

- Asistencia tecnica en matematicas y STEM: el modelo incorpora entrenamiento especifico en `math` y `stem` con RL, por lo que puede emplearse como tutor o resolvedor de problemas paso a paso, mostrando el razonamiento intermedio antes de la respuesta final.
- Generacion de codigo con tool calling: al soportar function calling y ser compatible con endpoints, puede integrarse en pipelines de CI/CD o IDE asistentes que invocan herramientas externas (ejecucion de tests, consulta de APIs) durante la generacion.
- Agentes multi-paso: el entrenamiento con GSPO y las etiquetas `reasoning`/`tool-use` lo hacen adecuado para tareas que requieren planificacion, llamadas encadenadas a herramientas y sintesis de resultados en varios turnos.
- Atencion al cliente multilingue: cubre seis idiomas, incluido espanol, lo que permite desplegar un mismo modelo para conversaciones multi-turno en mercados europeos y asiaticos sin cambiar de checkpoint.
- Analisis de documentos con imagen: la pipeline `image-text-to-text` permite procesar capturas, diagramas o formularios junto a texto, util para extraccion de datos en flujos documentales.
- Investigacion sobre alineacion y seguridad: al ser un modelo `abliterated`/`uncensored`, sirve como objeto de estudio para comparar comportamientos de rechazo frente a modelos alineados convencionalmente.
- Prototipado rapido con Unsloth: la etiqueta `unsloth` indica que el modelo fue entrenado con ese toolkit, lo que facilita a investigadores reproducir o extender el fine-tuning con requisitos de memoria reducidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 19-20 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: en torno a 10-11 GB para pesos, viable en GPUs de 16-24 GB.
- VRAM estimada en cuantizacion de 4 bits: en torno a 6-7 GB para pesos, viable en GPUs consumer de 8-12 GB.
- GPUs recomendadas: A100 40/80 GB, H100 80 GB o L40S para produccion en precision completa; RTX 4090 (24 GB) para FP16 ajustado o 8 bits; RTX 3090, RTX 4080 y RTX 4070 Ti Super para cuantizaciones de 8 y 4 bits.
- Cabe en GPU consumer: si, en RTX 4090/3090 a 8 bits, y en RTX 4060 Ti 16 GB o RTX 4070 a 4 bits con contexto moderado.
- Opciones de despliegue: transformers (libreria declarada), Text Generation Inference (TGI, etiqueta `text-generation-inference`), vLLM, llama.cpp/Ollama previa conversion a GGUF (no se distribuye GGUF en el repo), y endpoints compatibles.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| AIEllada/lisa | 9,41 mil millones | No disponible | Apache 2.0 | Gated en Hugging Face |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B (base) | ~9 mil millones (familia Qwen 3.5) | No disponible | No disponible en la informacion | Hugging Face |
| Qwen 3.5 9B (familia original) | ~9 mil millones | No disponible | No disponible en la informacion | Hugging Face |
| DeepSeek destilados de tamano comparable | Variable | No disponible | No disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo `abliterated`/`uncensored`: la ablacion de rechazos puede incrementar la probabilidad de respuestas daninas, sesgadas o inapropiadas; no es recomendable desplegarlo en productos orientados al publico general sin capas externas de moderacion.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad ni de tasas de alucinacion; al ser un fine-tuning sobre una destilacion, puede heredar errores de la base.
- Contexto: la longitud de ventana no esta documentada, lo que impide planificar cargas con documentos largos sin verificacion empirica.
- Idiomas: aunque declara espanol, no se especifica el volumen de datos en ese idioma; la calidad relativa frente al ingles o el chino no esta evaluada.
- Acceso restringido: el repositorio es gated y requiere aceptar condiciones, lo que anade friccion a la evaluacion y a la integracion en pipelines automatizados.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias explicitas sobre el cumplimiento normativo derivado de las capacidades descensuradas.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha: no hay evidencia de validacion comunitaria ni de reproducibilidad por terceros.
- No se distribuyen pesos cuantizados (GGUF/AWQ/GPTQ) en el repo, por lo que el despliegue en consumer exige conversion manual.

## Enlaces

- Hugging Face: https://huggingface.co/AIEllada/lisa
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Unsloth (toolkit de entrenamiento): https://github.com/unslothai/unsloth
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
- vLLM: https://github.com/vllm-project/vllm
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
