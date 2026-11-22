# Austriani/Split-Untied-31B-MaxOptimaV2-ik_llama.cpp

## Resumen

Split-Untied-31B-MaxOptimaV2-ik_llama.cpp es una cuantizacion GGUF del modelo base Blazed-Forge/Split-Untied-31B, un merge de 31B parametros construido sobre la arquitectura Gemma (etiquetado por el autor como "gemma-4") y afinado para roleplay, escritura creativa y conversacion sin restricciones de contenido. El autor de la cuantizacion es Austriani, mientras que el modelo base procede de Blazed-Forge, con colaboracion de nimbz en el ecosistema de calibracion. El repositorio pesa 17,4 GB y acumula 615 descargas desde su publicacion en noviembre de 2026.

El problema que resuelve es doble: por un lado, ofrece pesos de 31B en formato GGUF optimizado para ik_llama.cpp (un fork de llama.cpp orientado a rendimiento en CPU y GPU), lo que permite ejecutar un modelo grande en hardware modesto; por otro, aplica una calibracion imatrix especifica ("uncensored-imatrix", "v3-calibration") y una tecnica de cuantizacion denominada "trellis-quant" con el esquema IQK, orientadas a preservar calidad en tareas creativas y de rol donde la cuantizacion agresiva suele degradar el estilo.

Es relevante para desarrolladores que necesitan un modelo de escritura y conversacion de gran tamano, sin censura editorial, ejecutable localmente. El contexto no esta especificado en la informacion disponible, y el modelo solo declara soporte de ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Gemma (etiquetada como "gemma-4" por el autor) |
| Parametros totales | 32.106.631.740 |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con esquema IQK y "trellis-quant"; niveles concretos no disponibles |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para ik_llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un merge de la familia Gemma, con 32.106 millones de parametros totales. La model card no detalla la composicion del dataset de entrenamiento, el numero de tokens, ni si se aplicaron fases de RLHF o DPO. La etiqueta "split-untied" sugiere una separacion de los embeddings de entrada y salida (untied embeddings), una modificacion estructural frecuente en merges de la familia Gemma para mejorar la capacidad expresiva del modelo. No se dispone de informacion adicional sobre la arquitectura interna (numero de capas, dimensiones, atencion) en la informacion proporcionada.

En cuanto al proceso de cuantizacion, el autor emplea una calibracion imatrix propia denominada "uncensored-imatrix" y "v3-calibration", disenada especificamente para preservar el comportamiento en tareas de roleplay y escritura creativa con temas oscuros. La tecnica "trellis-quant" y el esquema IQK son propios del ecosistema ik_llama.cpp. No se especifican los niveles de cuantizacion publicados ni los tamanos de archivo por nivel.

## Capacidades

- Generacion de texto conversacional y multi-turno orientada a chat.
- Escritura creativa: narrativa, ficcion, storywriting y roleplay.
- Manejo de temas oscuros y contenido sin censura editorial (uncensored).
- Generacion de texto libre en ingles.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No se documenta capacidad de vision, audio ni modo "thinking".
- Multilingue: solo ingles declarado.

## Casos de uso

- Roleplay conversacional local: el modelo esta afinado especificamente para mantener personajes y estilo narrativo en conversaciones largas; su tamano de 31B permite matices que modelos de 7B-13B no alcanzan en coherencia de personaje.
- Escritura de ficcion y narrativa: adecuado para generar borradores de relatos, dialogos y tramas con tono literario, gracias al entrenamiento orientado a storywriting.
- Generacion de contenido para videojuegos narrativos: puede poblar dialogos de NPC y ramas argumentales en proyectos indie que requieran un modelo local sin dependencia de API.
- Prototipado de asistentes sin filtros editoriales: util para investigacion sobre comportamiento de modelos y evaluacion de sesgos en entornos controlados.
- Despliegue en CPU con ik_llama.cpp: el formato GGUF y el fork ik_llama.cpp permiten ejecutar el modelo en servidores sin GPU dedicada, con cuantizaciones agresivas que reducen el uso de memoria.
- Experimentacion con merges y cuantizacion: sirve como referencia para estudiar el impacto de la calibracion imatrix en la calidad de modelos fusionados de 31B.
- Generacion de texto en lote para corpus sinteticos: su naturaleza uncensored lo hace apto para generar datasets de entrenamiento con tematicas que otros modelos rechazan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta; con 32.106 millones de parametros, una cuantizacion de 4 bits ronda los 17-19 GB y una de 8 bits los 32-34 GB, aunque el autor no publica tamanos por nivel.
- El repositorio completo pesa 17,4 GB, lo que sugiere que las cuantizaciones incluidas son de baja precision (probablemente 4-5 bits).
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 4090 (24 GB) podria alojar cuantizaciones de 4 bits; modelos de 8 bits requeririan A100 40 GB o H100.
- Cabe en GPU de consumo (RTX 3090/4090, 24 GB) con cuantizacion de 4 bits; en 16 GB (RTX 4080) probablemente solo con cuantizaciones muy agresivas y offload parcial.
- Opciones de despliegue: ik_llama.cpp es el runtime objetivo; llama.cpp estandar y Ollama podrian funcionar segun compatibilidad del formato, no confirmada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Split-Untied-31B-MaxOptimaV2 (este) | 32,1B | no disponible | Apache 2.0 | GGUF (ik_llama.cpp) | Merge Gemma orientado a roleplay y ficcion sin censura |
| Blazed-Forge/Split-Untied-31B (base) | 32,1B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| Alternativas de 30B de la familia Gemma | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Solo soporta ingles; no se declara ni garantiza calidad en castellano.
- Modelo "uncensored": puede generar contenido sensible, ofensivo o inapropiado sin filtros; requiere moderacion externa en produccion.
- Riesgo de alucinacion inherente a modelos de lenguaje; no se han publicado evaluaciones de fidelidad.
- El contexto maximo no esta documentado, lo que impide planificar conversaciones largas con garantias.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento pueden imponer restricciones adicionales no detalladas.
- Al ser un merge y una cuantizacion de terceros, la calidad puede degradarse respecto al modelo base original; no hay benchmarks que lo verifiquen.
- El runtime objetivo es ik_llama.cpp, un fork especifico; la compatibilidad con llama.cpp estandar u Ollama no esta confirmada.
- No se documentan capacidades de tool calling ni agentes, por lo que no es adecuado para pipelines que dependan de function calling.
- Fecha de creacion futura (2026) en los metadatos: verificar la procedencia y autenticidad de los pesos antes de usarlos en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Austriani/Split-Untied-31B-MaxOptimaV2-ik_llama.cpp
- Modelo base: https://huggingface.co/Blazed-Forge/Split-Untied-31B
- Licencia del modelo base: https://huggingface.co/Blazed-Forge/Split-Untied-31B/blob/main/LICENSE
- ik_llama.cpp (repositorio del runtime): no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible
