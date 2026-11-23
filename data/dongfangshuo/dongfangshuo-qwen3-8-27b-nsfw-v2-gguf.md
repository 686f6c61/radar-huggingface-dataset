# dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-v2-GGUF

## Resumen

Dongfangshuo-Qwen3.8-27B-NSFW-v2-GGUF es la versión cuantizada en formato GGUF del modelo Dongfangshuo-Qwen3.8-27B-NSFW-v2, un ajuste fino derivado de huihui-ai/Huihui-Qwen3.8-27B-abliterated (a su vez una variante "abliterated" de Qwen3.8-27B). Lo desarrolla el usuario dongfangshuo y está especializado en escritura creativa de novela larga en chino con contenido para adultos, además de roleplay y razonamiento multimodal básico mediante un proyector visual separado. El problema que aborda es concreto: la degradación de la atención en generaciones muy largas (más de 10.000 caracteres) que provoca bucles repetitivos y cierres precipitados en modelos afinados para narrativa.

La versión v2 se presenta como una reconstrucción completa respecto a la v1: según la model card, reentrena los 12 módulos de atención y MLP (incluyendo in_proj y out_proj), aplica un enmascaramiento previo y añade especialización en resistencia a contextos extremos. El resultado declarado es la eliminación de los bucles de repetición en textos de diez mil caracteres, tanto con cadena de pensamiento activada como desactivada.

El modelo tiene 26.895.998.464 parámetros (aproximadamente 26,9 mil millones), se distribuye bajo licencia Apache-2.0 y está pensado para ejecutarse localmente con Ollama, llama.cpp o LM Studio. El repositorio ocupa 19,3 GB e incluye el GGUF principal en Q4_K_M, el proyector visual mmproj y un Modelfile preconfigurado para Ollama. Su alcance lingüístico declarado es únicamente el chino (zh).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.8-27B), ajuste fino completo de módulos de atención y MLP |
| Parametros totales | 26.895.998.464 (≈26,9 B) |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible como valor oficial; la model card recomienda num_ctx entre 8.192 y 32.768 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M (15,41 GB) en el repo; mmproj en BF16 (931 MB) |
| Idiomas soportados | zh (chino) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repo de cuantización); el modelo base se publica en safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only derivado de la familia Qwen3.8, con 26,9 mil millones de parámetros. Parte de huihui-ai/Huihui-Qwen3.8-27B-abliterated, una variante con el alineamiento de seguridad eliminado, sobre la que se aplica un ajuste fino orientado a narrativa y roleplay para adultos. La model card describe que la v2 reentrena los 12 módulos de atención y MLP, incluyendo las proyecciones in_proj y out_proj, con un enmascaramiento previo ("前置遮罩") y una realineación profunda de las representaciones de características. No se especifican el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación técnica declarada por el autor es la estabilidad en contextos largos: según sus pruebas internas, la v2 evita el colapso de la atención a largo plazo y los bucles de repetición que afectaban a la v1 al superar cierto umbral de longitud, manteniendo la coherencia narrativa hasta el final en generaciones de más de 10.000 caracteres. También se menciona la capacidad de activar o desactivar la cadena de pensamiento (etiquetas `<think>`) y un soporte multimodal mediante un proyector visual mmproj separado, que permite entrada de imágenes junto al texto.

## Capacidades

- Generación de texto narrativo largo en chino, con énfasis en novela y ficción para adultos.
- Roleplay multi-turno con separación de voces y registros por personaje (la model card menciona distinción entre tonos dominantes y sumisos).
- Descripción de detalle fisiológico y sensorial: respiración, tensión muscular, microexpresiones, temperatura corporal e iluminación dinámica.
- Planificación narrativa estructurada: la model card reporta generación espontánea de esquemas por actos y lenguaje de dirección de escena ("分幕式结构", "分镜调度").
- Modo de razonamiento explícito (cadena de pensamiento) activable o desactivable mediante etiquetas `<think>`.
- Capacidad multimodal de entrada de imagen mediante el proyector `mmproj-model-bf16.gguf`, con razonamiento visual descrito en la model card (detección de elementos de interfaz, iconos de grabación, etc.).
- Sin alineamiento de seguridad: no aplica rechazos por contenido para adultos.
- Soporte de plantilla ChatML para integración en Ollama, llama.cpp, LM Studio y SillyTavern.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Multilingüismo: limitado al chino según el campo `language` del repositorio.

## Casos de uso

- Escritura de novela por entregas en chino: el modelo está afinado para mantener la coherencia en generaciones de 2.000 a 4.000 caracteres por pasada, con instrucciones de continuación por fases ("继续推进下一阶段"), lo que encaja en flujos de trabajo de escritura serializada.
- Roleplay conversacional para adultos en entornos de ficción interactiva: la separación de registros por personaje y la ausencia de rechazos de seguridad lo hacen adecuado para plataformas de rol narrativo con audiencia adulta verificada.
- Generación de guiones y esquemas narrativos a partir de imágenes: con el proyector mmproj se pueden analizar ilustraciones o capturas y producir un desglose por escenas y planos, útil en preproducción de cómic o vídeo.
- Asistencia a guionistas y autores de ficción: dado el énfasis en microexpresiones y descripción sensorial, sirve para expandir tratamientos o sinopsis en escenas detalladas con instrucciones de estilo.
- Prototipado de personajes con voz propia: la distinción de tono entre personajes permite construir diálogos con identidades diferenciadas en proyectos de narrativa interactiva.
- Despliegue local en estaciones de trabajo con GPU de consumo: el GGUF Q4_K_M de 15,41 GB cabe en tarjetas de 24 GB (RTX 3090, 4090) y 32 GB (5090), lo que facilita entornos de escritura sin dependencia de la nube.
- Investigación sobre estabilidad en contextos largos: el modelo documenta explícitamente su comportamiento en generaciones de más de 10.000 caracteres, lo que lo convierte en un caso de estudio para evaluar el colapso de atención en modelos afinados.

## Benchmarks y rendimiento

La model card incluye una tabla de pruebas internas del autor (no benchmarks académicos estandarizados) comparando el modelo base huihui-27b (0), la v1 (1) y la v2 (2). Se reproducen los resultados tal como aparecen:

| Evaluacion (interna del autor) | 0 (huihui-27b) | 1 (dongfangshuo v1) | 2 (dongfangshuo v2) |
|---|---|---|---|
| Desbloqueo de restricciones morales (Uncensored) | Bloqueo de seguridad | 100% fluido | 100% profundo |
| Tensión en diálogo explícito (Dirty Talk) | Rechazo | Fluido, poca distinción de voz | Fuerte distinción por personaje |
| Captura de detalles visuales (mmproj) | Solo objetos centrales | Captura detalles ocultos de UI | Captura detalles ocultos de UI |
| Profundidad de estructura narrativa | Listado plano | Lógica coherente con tensión | Estructura por actos y lenguaje de planos |
| Estabilidad en texto muy largo (COT On) | Cierre precipitado | Colapso de atención y bucles | Progresión estable hasta el final |
| Estrés extremo en texto muy largo (COT Off) | Bucle en acciones locales | Bucle de repetición infinito | Resiste 10.000+ caracteres hasta el final |

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los datos anteriores son pruebas cualitativas del propio autor y no deben interpretarse como métricas comparables con evaluaciones estandarizadas.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 16-17 GB con el GGUF Q4_K_M de 15,41 GB más overhead de contexto; el proyector visual añade aproximadamente 1 GB adicional.
- GPU recomendadas por el autor: RTX 3090, RTX 4090 (24 GB) y RTX 5090 (32 GB). Para contextos de 32.768 tokens conviene margen adicional de VRAM.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB o más con la cuantización Q4_K_M. En tarjetas de 16 GB requeriría cuantizaciones más agresivas no incluidas en el repositorio.
- Opciones de despliegue: Ollama (con el Modelfile incluido), llama.cpp / llama-server, LM Studio y SillyTavern. Ejemplo del autor: `llama-server -m Dongfangshuo-Qwen3.8-27B-NSFW-v2-Q4_K_M.gguf --mmproj mmproj-model-bf16.gguf -c 16384 -ngl 99`.
- Parámetros de muestreo recomendados por el autor: temperature 0,75-0,85, top_p 0,90, repeat_penalty 1,15-1,18, num_ctx 8.192-32.768.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Dongfangshuo-Qwen3.8-27B-NSFW-v2 | 26,9 B | no disponible oficialmente (recomendado hasta 32.768) | Apache-2.0 | Novela y roleplay NSFW en chino, multimodal | GGUF en Hugging Face, Ollama |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 26,9 B (base) | no disponible | no disponible en la información | Base abliterated con alineamiento eliminado | safetensors en Hugging Face |
| Dongfangshuo-Qwen3.8-27B-NSFW (v1) | 26,9 B (base) | no disponible | Apache-2.0 | Versión equilibrada previa, 7 módulos ajustados | GGUF en repositorio separado |

La comparación se limita a los modelos citados en la información disponible; no se dispone de datos de benchmarks comunes que permitan una comparación cuantitativa con alternativas de otros autores.

## Limitaciones y advertencias

- Contenido explícito para adultos: el modelo está diseñado sin alineamiento de seguridad y genera contenido NSFW de forma deliberada; no debe desplegarse en entornos accesibles a menores ni en productos de consumo general.
- Idioma: solo se declara soporte de chino (zh); el rendimiento en castellano u otros idiomas no está documentado y previsiblemente será deficiente.
- Riesgo de alucinación: no hay evaluaciones de fidelidad factual; en tareas de conocimiento general el modelo puede inventar datos, especialmente al haber sido reentrenado para ficción.
- Sesgos: al derivar de un modelo abliterated y afinarse en narrativa explícita, puede reproducir estereotipos de género y roles de poder presentes en el corpus de ficción para adultos. No se documentan mitigaciones.
- Estabilidad en textos largos: la mejora frente a bucles se basa en pruebas internas del autor, no en evaluaciones independientes; conviene validar en el caso de uso propio antes de producción.
- Licencia Apache-2.0: permite uso comercial, pero el autor restringe el uso a adultos y a fines de ficción; es responsabilidad del integrador verificar el cumplimiento legal en su jurisdicción.
- Contexto: no se publica la longitud de contexto oficial del modelo base; las recomendaciones de 8.192-32.768 tokens son prácticas, no un límite certificado.
- Formato: solo se distribuye GGUF Q4_K_M; no hay cuantizaciones alternativas en el repositorio, lo que limita el despliegue en hardware con menos de 16 GB de VRAM.
- Tool calling y comportamiento agéntico no documentados: no se recomienda su uso en pipelines que dependan de llamadas a funciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-v2-GGUF
- Modelo base (abliterated): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Modelo base (v1 NSFW): https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW
- Repositorio v1 GGUF (mencionado en la model card): https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-GGUF
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Ollama: https://ollama.com
- llama.cpp: https://github.com/ggml-org/llama.cpp
- LM Studio: https://lmstudio.ai
- SillyTavern: https://github.com/SillyTavern/SillyTavern
