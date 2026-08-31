# mradermacher/Qwen3-Coder-Next-Uncensored-Heretic-i1-GGUF

## Resumen

El modelo `mradermacher/Qwen3-Coder-Next-Uncensored-Heretic-i1-GGUF` es una cuantización GGUF con calibración imatrix del modelo base `llmfan46/Qwen3-Coder-Next-Uncensored-Heretic`, que a su vez es una versión "abliterated" (sin censura) del modelo Qwen3-Coder-Next de Alibaba. El autor, mradermacher, es conocido por publicar cuantizaciones de modelos de código abierto, y este repositorio en particular contiene únicamente el archivo de calibración imatrix (0.6 GB) que permite generar cuantizaciones de alta calidad; los archivos GGUF estáticos están disponibles en un repositorio hermano.

El modelo base tiene 79.674.391.296 parámetros (aproximadamente 79.7B), lo que lo sitúa en la gama de modelos grandes. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales. El interés principal de este modelo reside en su naturaleza "uncensored": ha sido sometido a técnicas de ablación (abliteration) para eliminar los mecanismos de rechazo y permitir respuestas sin filtros de seguridad, lo que lo hace atractivo para aplicaciones que requieren generación de contenido sin restricciones, aunque con los riesgos asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 79.674.391.296 (79.7B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Este repositorio solo contiene el archivo imatrix. El repositorio estático ofrece múltiples quants: Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el archivo imatrix es un artefacto de calibracion) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base en los datos proporcionados. El nombre "Qwen3-Coder-Next" sugiere que se trata de un modelo de la familia Qwen, probablemente con arquitectura transformer densa, pero no hay confirmacion explicita. El modelo base ha sido sometido a un proceso de "abliteration" (ablacion de capas) mediante la herramienta Heretic, que elimina los mecanismos de rechazo del modelo original. Este proceso no modifica los pesos de forma significativa, sino que identifica y elimina las direcciones en el espacio de activaciones responsables de la censura.

El archivo imatrix incluido en este repositorio se utiliza para calibrar la cuantizacion, mejorando la calidad de los quants generados. No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens, ni si se aplicaron tecnicas como RLHF o DPO.

## Capacidades

- Generacion de texto en ingles sin restricciones de contenido (sin censura).
- Capacidad conversacional (etiqueta "conversational").
- Probablemente orientado a tareas de codigo, dado el nombre "Coder", aunque no se confirma en la informacion disponible.
- No se especifican capacidades de tool calling, vision, audio ni razonamiento multi-paso.

## Casos de uso

- Generacion de contenido creativo sin restricciones: el modelo puede producir narrativas, dialogos o guiones que otros modelos rechazarian por politicas de seguridad, util para escritores o creadores que necesitan explorar temas sensibles.
- Roleplay y simulacion de personajes: su naturaleza "uncensored" permite interacciones sin filtros, adecuado para aplicaciones de entretenimiento o juegos de rol.
- Asistencia en programacion con libertad de expresion: aunque no se confirma su capacidad de codigo, si el modelo base es Qwen3-Coder, podria generar codigo sin restricciones de comentarios o documentacion.
- Investigacion academica sobre sesgos y alucinaciones: al carecer de filtros, permite estudiar el comportamiento del modelo sin interferencias de politicas de seguridad.
- Desarrollo de agentes conversacionales para nichos especificos: chatbots para comunidades que requieren respuestas sin censura (por ejemplo, foros de adultos o debates politicos).
- Pruebas de robustez y red teaming: evaluar como responde un modelo sin salvaguardas ante prompts maliciosos, util para investigadores de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 79.7B parametros, en cuantizacion Q4 (4 bits) se necesitan aproximadamente 40 GB de VRAM; en Q2 (2 bits) alrededor de 20 GB. La mencion en una guia de "24GB" sugiere que cuantizaciones bajas (Q2 o IQ2) pueden caber en GPUs de 24 GB.
- GPUs recomendadas: para cuantizaciones bajas, una RTX 3090/4090 (24 GB) o una A6000 (48 GB) son suficientes. Para cuantizaciones altas (Q8 o FP16), se requieren GPUs de datacenter como A100 (80 GB) o H100.
- Compatibilidad con consumer GPU: si, con cuantizaciones Q2 o IQ2 en GPUs de 24 GB.
- Opciones de despliegue: al ser GGUF, se puede usar con llama.cpp, Ollama, LM Studio, o servidores como vLLM (con conversion a formato compatible).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la informacion proporcionada. Se podria comparar con otros modelos "uncensored" de tamano similar como Llama-3-70B-Instruct (abliterated) o Qwen2.5-72B-Instruct (abliterated), pero no hay datos de rendimiento para establecer una comparacion objetiva.

## Limitaciones y advertencias

- Al ser un modelo "uncensored", puede generar contenido ofensivo, ilegal o peligroso sin restricciones. Su uso en produccion requiere supervision humana y politicas de mitigacion.
- Riesgo elevado de alucinaciones, especialmente en temas factuales, al no tener filtros de seguridad que moderen respuestas.
- Solo soporta ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales (se debe verificar la licencia de Qwen3-Coder-Next original).
- El repositorio actual solo contiene el archivo imatrix; para obtener el modelo GGUF completo hay que descargar los archivos del repositorio estatico, lo que puede causar confusion.
- No se dispone de informacion sobre la longitud de contexto, lo que limita su uso en tareas que requieran ventanas largas.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/mradermacher/Qwen3-Coder-Next-Uncensored-Heretic-i1-GGUF
- Repositorio con los quants estaticos: https://huggingface.co/mradermacher/Qwen3-Coder-Next-Uncensored-Heretic-GGUF
- Modelo base (llmfan46): https://huggingface.co/llmfan46/Qwen3-Coder-Next-Uncensored-Heretic
- Herramienta Heretic (eliminacion de censura): https://github.com/p-e-w/heretic
- Guia de modelos sin censura por VRAM (menciona este modelo): https://insiderllm.com/guides/best-uncensored-local-llms/
