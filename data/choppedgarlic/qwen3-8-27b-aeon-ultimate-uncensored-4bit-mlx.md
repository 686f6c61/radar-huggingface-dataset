# choppedgarlic/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-4bit-MLX

## Resumen

El modelo `choppedgarlic/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-4bit-MLX` es una cuantización en 4 bits (formato MLX) del modelo `AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16`, un fine-tuning "uncensored" (abliterado) sobre el modelo base Qwen3.8-27B de Alibaba. El trabajo original de "uncensoring" fue realizado por SpaceTimeViking, y AEON-7 publicó los pesos en BF16; choppedgarlic realizó la conversión y cuantización para Apple Silicon. El objetivo es ofrecer una versión ligera y ejecutable localmente en hardware de Apple, manteniendo las capacidades de razonamiento y generación de texto del modelo original, pero con menor huella de memoria.

El modelo base Qwen3.8-27B es un transformer denso de 27 000 millones de parámetros con una arquitectura de atención híbrida: solo 16 de sus 64 capas usan atención completa, mientras que las otras 48 emplean atención lineal con un estado recurrente constante. Esta mezcla reduce el coste computacional y permite ventanas de contexto largas. La versión cuantizada en 4 bits reduce el tamaño del repositorio a unos 15,2 GB, lo que lo hace viable en equipos con 32 GB de memoria unificada. Está pensado para uso local mediante la librería MLX, con soporte para chat interactivo y servidor compatible con la API de OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (16 capas full attention, 48 capas linear attention) |
| Parametros totales | 27B (nominal, según denominación del modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit affine, group size 64 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

Nota: el archivo safetensors reporta un valor de 4 204 731 904 parámetros, lo que resulta inconsistente con la denominación de 27B. Se trata probablemente de un error en la metadata; el modelo base es Qwen3.8-27B, que tiene 27 000 millones de parámetros.

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura transformer con atención híbrida: de las 64 capas, 16 utilizan atención completa (con intervalo de atención completa de 4) y las 48 restantes usan atención lineal con un estado recurrente constante. Este diseño reduce el coste computacional y la memoria necesaria para contextos largos, manteniendo la calidad en tareas de razonamiento. El modelo original fue entrenado por el equipo de Qwen con un enfoque de preentrenamiento y ajuste fino supervisado, seguido de optimización con preferencias humanas (RLHF/DPO), aunque los detalles específicos del dataset no se han publicado en la información disponible.

Sobre el modelo "uncensored": el autor SpaceTimeViking aplicó técnicas de abliteración (abliteration) sobre los pesos de Qwen3.8-27B para eliminar las restricciones de contenido aprendidas durante el alineamiento. AEON-7 publicó los pesos resultantes en BF16, y choppedgarlic los convirtió a formato MLX y los cuantizó a 4 bits. No se realizó ningún fine-tuning adicional en esta conversión; solo se adaptó el formato y la precisión para su ejecución en Apple Silicon.

## Capacidades

- Generación de texto libre y conversacional, con soporte para razonamiento multi-paso.
- Modo "thinking" activable o desactivable mediante la plantilla de chat (`enable_thinking`).
- Compatible con el agente de codificación Pi (verificado localmente).
- Servidor OpenAI-compatible integrado (`mlx_lm.server`) para integración con herramientas existentes.
- Multilingüe limitado: la model card declara solo inglés, aunque el modelo base Qwen3.8-27B soporta múltiples idiomas; no se garantiza el rendimiento fuera del inglés.
- Sin soporte de visión: la conversión no incluye `vision_config` ni preprocesadores de imagen.

## Casos de uso

- Asistente de codigo local: gracias a su capacidad de razonamiento y al soporte del agente Pi, puede usarse como asistente de programación en entornos de desarrollo integrados, ejecutándose completamente en local.
- Generacion de texto creativo sin restricciones: al ser una version "uncensored", permite explorar temas que los modelos alineados rechazan, como escritura de ficcion con contenido adulto o debates sobre temas controvertidos.
- Servidor de inferencia para aplicaciones internas: mediante `mlx_lm.server` se puede desplegar un endpoint compatible con OpenAI para alimentar aplicaciones de chat o automatizaciones dentro de una organizacion, sin depender de servicios externos.
- Prototipado rapido de agentes conversacionales: su tamaño (27B) y su cuantizacion en 4 bits permiten ejecutarlo en un Mac con 32 GB de RAM, ideal para desarrollo y pruebas de agentes con razonamiento.
- Analisis de documentos largos: la arquitectura de atencion hibrida y el contexto amplio (aunque no especificado) permiten procesar textos extensos, como informes o articulos, con un coste computacional reducido.
- Educacion e investigacion en alineacion de modelos: al ser una version abliterada, sirve como caso de estudio para analizar el impacto de las tecnicas de eliminacion de restricciones en el comportamiento de un LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar. Se recomienda consultar la documentacion del modelo base Qwen3.8-27B para obtener referencias de rendimiento, aunque la cuantizacion en 4 bits puede degradar ligeramente la calidad respecto a la version BF16.

## Requisitos de hardware

- VRAM estimada: al ser una cuantizacion 4-bit, el modelo ocupa aproximadamente 14 GB en disco. En Apple Silicon, la memoria unificada debe ser de al menos 32 GB para una ejecucion comoda, segun la model card.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M2, M3, M4) con 32 GB o mas de memoria unificada. No se soportan GPUs NVIDIA o AMD en este formato.
- Opciones de despliegue: MLX (`mlx_lm.chat` para chat interactivo, `mlx_lm.server` para API OpenAI-compatible). No es compatible con vLLM, llama.cpp u Ollama en este formato especifico.
- Latencia y throughput: no se proporcionan datos concretos. En un Mac Studio M2 Ultra con 64 GB, se puede esperar una generacion de varios tokens por segundo, pero depende de la configuracion y la carga.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | No disponible | BF16/FP8 | Apache 2.0 | Hugging Face |
| AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16 | 27B | No disponible | BF16 | Apache 2.0 | Hugging Face |
| choppedgarlic/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-4bit-MLX | 27B | No disponible | 4-bit MLX | Apache 2.0 | Hugging Face |

La principal diferencia entre las tres versiones es el formato y la precision: la version MLX esta optimizada para Apple Silicon, mientras que las otras requieren entornos con GPUs compatibles con CUDA o ROCm. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo "uncensored", puede generar contenido ofensivo, ilegal o peligroso sin filtros. No se recomienda su uso en aplicaciones publicas sin una capa de moderacion adicional.
- Riesgo de alucinacion: como cualquier LLM, puede producir informacion falsa o inventada, especialmente en temas especializados.
- Limitaciones de contexto: no se ha especificado la longitud de contexto soportada; se recomienda probar con secuencias largas antes de usarlo en produccion.
- Restricciones de licencia: aunque la licencia es Apache 2.0, el uso comercial esta permitido, pero el contenido generado puede no ser apto para todos los publicos.
- Cuantizacion: la precision de 4 bits puede degradar la calidad de la generacion en comparacion con la version BF16, especialmente en tareas de razonamiento complejo.
- Sin soporte de vision: a diferencia de algunos modelos multimodales, esta version no acepta imagenes como entrada.
- Dependencia de MLX: solo funciona en Apple Silicon; no es portable a otras arquitecturas sin una conversion adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/choppedgarlic/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-4bit-MLX
- Modelo base (BF16): https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16
- Documentacion de Qwen3.8-27B (vLLM recipes): https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Repositorio GitHub con informacion sobre la version uncensored: https://github.com/Wassimyounes01/qwen38-uncensored
- Articulo sobre la version GGUF uncensored: https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
