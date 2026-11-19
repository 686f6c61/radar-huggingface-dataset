# draganjankovic1975/Qwen3-VL-8B-NSFW-Caption-V4.5

## Resumen

Qwen3-VL-8B-NSFW-Caption-V4.5 es un ajuste fino (fine-tune) del modelo multimodal Qwen3-VL-8B orientado a la generacion de descripciones (captions) de imagenes con contenido explicito o NSFW. Lo publica el usuario draganjankovic1975 como espejo (mirror) del modelo original de Disty0, que a su vez es una resubida del trabajo de thesby. El modelo base es Qwen3-VL, la familia vision-language de Alibaba Qwen, con aproximadamente 8.770 millones de parametros (8,77 B) en formato safetensors.

El problema que aborda es la generacion automatica de descripciones detalladas para imagenes de contenido adulto, un nicho que los modelos multimodales genericos suelen rechazar o censurar por sus politicas de seguridad. Al estar ajustado especificamente para esa tarea, el modelo produce captions mas detallados en ese dominio que el modelo base.

Por su naturaleza (fine-tune de nicho, sin model card tecnica propia, con 0 descargas y 0 likes en el momento de la consulta) es relevante principalmente para investigadores que trabajen en catalogacion, etiquetado o moderacion de contenido adulto. No hay informacion publicada sobre arquitectura interna del ajuste, datos de entrenamiento ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer multimodal (vision-language) basada en Qwen3-VL; detalles del ajuste no disponibles |
| Parametros totales | 8.767.123.696 (8,77 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 17,5 GB |
| Pipeline declarado | no disponible |
| Etiqueta de contenido | not-for-all-audiences |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-VL-8B, un transformer multimodal que combina un codificador visual con un decoder de lenguaje de la familia Qwen3. No se dispone de informacion sobre la configuracion exacta de capas, dimensiones ocultas ni mecanismo de atencion del ajuste publicado en este repositorio.

Respecto al entrenamiento, la model card solo indica que se trata de un espejo de Disty0/Qwen3-VL-8B-NSFW-Caption-V4.5, que a su vez es una resubida de thesby/Qwen3-VL-8B-NSFW-Caption-V4.5. No se documentan el volumen de datos de ajuste, la composicion del dataset, si hubo RLHF/DPO ni ninguna innovacion tecnica (decodificacion especulativa, atencion lineal, etc.). Toda esa informacion figura como no disponible.

## Capacidades

- Generacion de descripciones (captions) de imagenes, con enfasis en contenido explicito o NSFW segun el ajuste.
- Comprension de imagen y texto conjunta, heredada del modelo base Qwen3-VL.
- Generacion de texto a partir de entradas multimodales.
- Soporte de tool calling / function calling: no disponible (no documentado para este ajuste).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponibles (no documentadas).
- Capacidades especiales (thinking mode, audio, etc.): no disponibles.

## Casos de uso

- Etiquetado y catalogacion de contenido adulto: el modelo genera captions descriptivos de imagenes que los modelos genericos rechazan, lo que facilita la indexacion y busqueda en plataformas de contenido para adultos.
- Moderacion y clasificacion de contenido: permite describir y clasificar imagenes NSFW para revisiones internas, auditorias o cumplimiento de politicas de plataforma.
- Investigacion en vision-language: sirve como punto de partida para estudiar el comportamiento de modelos multimodales en dominios sensibles y comparar con el modelo base sin ajustar.
- Generacion de metadatos para datasets de investigacion: util para anotar automaticamente grandes volumenes de imagenes adultas en estudios academicos sobre sesgos o seguridad.
- Sistemas de recomendacion de contenido: las descripciones generadas pueden alimentar motores de recomendacion o sistemas de tags en plataformas de nicho.
- Pruebas de robustez y seguridad: permite evaluar como responde un modelo ajustado frente a contenido explicito, util para equipos de red teaming y evaluacion de salvaguardas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): en torno a 17-18 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 24 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 9-10 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 5-6 GB.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 6000 Ada para precision completa; RTX 4090 (24 GB) suficiente para fp16 con margen ajustado.
- Cabe en GPU de consumo: si, en RTX 4090/3090 (24 GB) en fp16; en GPUs de 8-12 GB requeriria cuantizacion (no se distribuyen GGUF en el repo, habria que generarlos).
- Opciones de despliegue: vLLM, TGI, transformers con accelerate; llama.cpp/Ollama requeririan conversion a GGUF no incluida en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-VL-8B-NSFW-Caption-V4.5 (este) | 8,77 B | no disponible | Caption NSFW | apache-2.0 | Hugging Face (mirror) |
| Qwen3-VL-8B (base) | ~8 B | no disponible | Vision-language general | apache-2.0 | Hugging Face |
| thesby/Qwen3-VL-8B-NSFW-Caption-V4.5 (original) | ~8,77 B | no disponible | Caption NSFW | apache-2.0 | Hugging Face |
| Disty0/Qwen3-VL-8B-NSFW-Caption-V4.5 (origen del mirror) | ~8,77 B | no disponible | Caption NSFW | apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- Contenido explicito: el modelo esta ajustado para generar descripciones de contenido adulto; su uso esta restringido a mayores de edad y sujeto a la legislacion aplicable.
- Sesgos conocidos: no documentados, pero al ser un fine-tune de nicho puede heredar sesgos del dataset de ajuste y del modelo base.
- Riesgo de alucinacion: no evaluado; como todo modelo generativo, puede describir elementos inexistentes en la imagen.
- Limitaciones de contexto e idioma: no documentadas.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el contenido NSFW puede incumplir terminos de servicio de plataformas y normativas locales.
- Caveats para produccion: repositorio sin model card tecnica, 0 descargas y 0 likes; no hay garantias de calidad, soporte ni mantenimiento. Es un mirror, no el repositorio original.
- Formato: solo safetensors; no hay GGUF ni cuantizaciones oficiales, lo que complica el despliegue en hardware limitado.

## Enlaces

- Hugging Face (este mirror): https://huggingface.co/draganjankovic1975/Qwen3-VL-8B-NSFW-Caption-V4.5
- Modelo del que es mirror: https://huggingface.co/Disty0/Qwen3-VL-8B-NSFW-Caption-V4.5
- Repositorio original resubido: https://huggingface.co/thesby/Qwen3-VL-8B-NSFW-Caption-V4.5
