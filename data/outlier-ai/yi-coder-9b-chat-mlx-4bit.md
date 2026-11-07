# Outlier-Ai/Yi-Coder-9B-Chat-MLX-4bit

## Resumen

Yi-Coder-9B-Chat-MLX-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo 01-ai/Yi-Coder-9B-Chat, realizada por Outlier-Ai. Está pensada para ejecutarse de forma nativa en Apple Silicon (chips M1, M2, M3 y M4) mediante la librería mlx-lm, sin depender de la nube ni de claves de API. El modelo base es un transformer decoder-only orientado a generación de código y conversación, con 8.829.407.232 parámetros totales según los safetensors del repositorio.

La relevancia de esta ficha radica en que permite desplegar un modelo de código de aproximadamente 9.000 millones de parámetros en equipos de consumo con memoria unificada, manteniendo la licencia Apache 2.0 del modelo original. La conversión es un port fiel de los pesos upstream: no incluye fine-tuning ni merge adicional, solo la cuantización a 4 bits.

El repositorio tiene un tamaño de 5,0 GB, lo que da una idea directa del espacio en disco necesario para cargar los pesos cuantizados. Los idiomas declarados son inglés y chino, y la librería asociada es mlx.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Yi-Coder, modelo base 01-ai/Yi-Coder-9B-Chat) |
| Parametros totales | 8.829.407.232 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4 bits (MLX); el modelo base admite otras cuantizaciones no detalladas aqui |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion a 4 bits del checkpoint Yi-Coder-9B-Chat de 01-ai, empaquetada para MLX. La arquitectura subyacente es un transformer decoder-only de la familia Yi-Coder, orientado a generacion de codigo y dialogo. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni las fases de alineacion (RLHF/DPO) del modelo original.

La innovacion tecnica de esta publicacion no esta en el entrenamiento, sino en el proceso de cuantizacion y empaquetado: se trata de un port fiel de los pesos upstream sin fine-tuning ni merge, cuantizado a 4 bits para reducir el uso de memoria y permitir inferencia local en Apple Silicon mediante Metal y mlx-lm.

## Capacidades

- Generacion de codigo en multiples lenguajes, con ejemplos en la model card para Python y SQL.
- Conversacion multi-turno en modo chat/instruct.
- Refactorizacion y depuracion de codigo: la model card incluye un ejemplo de "refactor for readability and flag one bug".
- Generacion de consultas SQL complejas (por ejemplo, top 10 usuarios por valor de compra en los ultimos 90 dias).
- Soporte bilingue ingles y chino.
- Ejecucion local y offline en macOS sobre Apple Silicon, sin nube ni claves de API.
- No se detalla en la informacion disponible soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Asistente de codigo local en Mac: un desarrollador puede cargar el modelo con mlx-lm y usarlo para autocompletar funciones, generar docstrings y tests unitarios sin enviar codigo a servicios externos.
- Generacion de consultas SQL: a partir de una descripcion en lenguaje natural, el modelo produce consultas con joins y agregaciones, util para equipos de analitica que trabajan con datos sensibles y prefieren inferencia on-device.
- Refactorizacion y revision de codigo: integrado en un flujo de trabajo local, permite pedir mejoras de legibilidad y deteccion de bugs sobre fragmentos de codigo existentes.
- Prototipado offline en entornos sin conectividad: al ejecutarse sin nube, es adecuado para entornos air-gapped o con requisitos de privacidad estrictos, siempre que el hardware sea un Mac con Apple Silicon.
- Educacion y aprendizaje de programacion: el modelo puede explicar fragmentos de codigo y proponer ejercicios en ingles o chino, con la ventaja de que el estudiante no necesita cuenta ni API.
- Automatizacion de tareas de scripting en macOS: generacion de scripts de shell o Python para tareas repetitivas, ejecutados localmente con mlx-lm como motor de inferencia.
- Desarrollo de aplicaciones de escritorio con IA embebida: la app Outlier para macOS demuestra que el modelo puede integrarse en un producto de escritorio que ofrece inferencia local sin limites de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 5,0 GB en disco; en memoria, los pesos a 4 bits requieren del orden de 5 GB, mas overhead de la app y del contexto KV. No se dispone de una cifra oficial de memoria pico en la informacion proporcionada.
- GPU recomendadas: Apple Silicon M1, M2, M3 y M4 (segun los tags del repositorio); no se mencionan GPU NVIDIA ni AMD.
- Cabe en equipos de consumo: si, en Mac con Apple Silicon; no se indica compatibilidad con GPU de consumo tipo RTX.
- Opciones de despliegue: mlx-lm (`python -m mlx_lm.generate`) y la app Outlier para macOS (`brew install --cask outlier-host/tap/outlier`). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yi-Coder-9B-Chat-MLX-4bit (este) | 8.829.407.232 | no disponible | MLX safetensors 4-bit | apache-2.0 | Hugging Face, 66 descargas |
| 01-ai/Yi-Coder-9B-Chat (base) | ~9B | no disponible | safetensors (upstream) | apache-2.0 | Hugging Face |
| Outlier-Ai/Qwen2.5-Coder-7B-Instruct-MLX-4bit | ~7B | no disponible | MLX safetensors 4-bit | no disponible en esta ficha | Hugging Face, 1.450 descargas |
| Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit | ~7B | no disponible | MLX safetensors 4-bit | no disponible en esta ficha | Hugging Face, 1.932 descargas |

Los dos modelos de Outlier-Ai incluidos en la comparativa son conversiones del mismo autor para el mismo ecosistema (MLX 4-bit en Apple Silicon) y aparecen citados en la propia model card; los datos de rendimiento comparativo no estan disponibles.

## Limitaciones y advertencias

- La cuantizacion a 4 bits puede degradar la calidad respecto al modelo base de 9B en tareas de codigo complejas; no se aportan metricas de esa perdida en la informacion disponible.
- Solo se declaran idiomas ingles y chino; el rendimiento en castellano no esta documentado.
- No se detalla la longitud de contexto soportada, lo que impide garantizar casos de uso con contextos largos.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en generacion de APIs o funciones inexistentes; conviene validar el codigo generado.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base y debe verificarse en la model card de 01-ai/Yi-Coder-9B-Chat.
- El modelo esta empaquetado exclusivamente para MLX y Apple Silicon; no es directamente utilizable en GPU NVIDIA ni en servidores x86 sin conversion adicional.
- La model card incluye promocion de la app Outlier y enlaces con parametros UTM; conviene tratarla como material comercial ademas de tecnico.
- El numero de descargas (66) y de likes (0) es bajo, lo que sugiere poca validacion comunitaria hasta la fecha.

## Enlaces

- Hugging Face: https://huggingface.co/Outlier-Ai/Yi-Coder-9B-Chat-MLX-4bit
- README del repositorio: https://huggingface.co/Outlier-Ai/Yi-Coder-9B-Chat-MLX-4bit/blob/main/README.md
- Modelo base: https://huggingface.co/01-ai/Yi-Coder-9B-Chat
- App Outlier para macOS: https://outlier.host/
- Otras conversiones del autor:
  - https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit
  - https://huggingface.co/Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit
  - https://huggingface.co/Outlier-Ai/Qwen2.5-Coder-7B-Instruct-MLX-4bit
  - https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
  - https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
