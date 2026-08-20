# lecporr/rotating-equip-sft-n0353

## Resumen

El modelo `lecporr/rotating-equip-sft-n0353` es un ajuste fino (SFT) del modelo base `unsloth/Qwen3-1.7B-unsloth-bnb-4bit`, que a su vez es una version cuantizada a 4 bits del modelo Qwen3 de 1.7 mil millones de parametros desarrollado por Alibaba. El autor, lecporr, ha entrenado este modelo con la libreria TRL y la herramienta Unsloth, que acelera el entrenamiento y reduce el consumo de memoria. El nombre del repositorio sugiere que el ajuste fino se ha realizado sobre un corpus especializado en equipos rotativos (bombas, compresores, turbinas, etc.), aunque el autor no proporciona detalles sobre el dataset de entrenamiento ni el proceso de ajuste.

La relevancia de este modelo radica en su potencial para ofrecer respuestas especializadas en el dominio de la ingenieria de equipos rotativos, un campo con escasa representacion en los modelos generativos generalistas. Al partir de Qwen3-1.7B, hereda una arquitectura transformer moderna con soporte para decodificacion especulativa y una ventana de contexto de 32 768 tokens. El modelo se distribuye bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones significativas. Su tamano reducido (0.1 GB) lo hace viable para despliegue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3, basada en Qwen2.5) |
| Parametros totales | 1,7 mil millones (1.7B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32 768 tokens (heredado de Qwen3-1.7B) |
| Tipos de cuantizacion | El modelo base usa cuantizacion bnb-4bit; el repositorio contiene pesos en safetensors |
| Idiomas soportados | Ingles (segun metadatos; el modelo base Qwen3 soporta multilingue, pero el fine-tuning puede haber reducido el soporte) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers y text-generation-inference) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3, que es un transformer autoregresivo con atencion por ventanas deslizantes y soporte de decodificacion especulativa. Qwen3-1.7B es la variante mas pequena de la familia Qwen3, disenada para ofrecer un equilibrio entre rendimiento y eficiencia computacional. El modelo base fue cuantizado a 4 bits mediante bitsandbytes para reducir su huella de memoria y acelerar el ajuste fino, y posteriormente fue afinado con la biblioteca TRL de HuggingFace.

El ajuste fino se realizo con Unsloth, que optimiza el proceso de entrenamiento mediante kernels eficientes y tecnicas de ahorro de memoria. El objetivo era especializar el modelo en el dominio de los equipos rotativos, pero no se ha publicado informacion sobre el volumen de datos, la composicion del dataset, el numero de pasos de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO. El nombre del repositorio sugiere que es el resultado de la iteracion numero 353 de un proceso de ajuste.

## Capacidades

- Generacion de texto y respuestas conversacionales en ingles, especializadas en el dominio de equipos rotativos.
- Razonamiento basico sobre problemas de ingenieria relacionados con bombas, compresores, turbinas, sellos, rodamientos, etc.
- Soporte de tool calling y function calling (capacidad heredada de Qwen3, aunque no se ha verificado su funcionamiento tras el ajuste fino).
- Capacidad de procesar contextos largos de hasta 32 768 tokens, lo que permite analizar documentos tecnicos extensos.
- Capacidad multilingue limitada: el modelo base Qwen3 soporta varios idiomas, pero el ajuste fino se ha realizado unicamente con datos en ingles, por lo que su rendimiento en otros idiomas puede degradarse.
- No incluye capacidades de vision, audio ni modo de pensamiento (thinking mode) especifico, aunque Qwen3 puede generar cadenas de razonamiento intermedias.

## Casos de uso

- Asistencia tecnica para mantenimiento predictivo: el modelo puede responder preguntas sobre procedimientos de inspeccion, diagnostico de fallos y planes de mantenimiento para bombas, compresores y otros equipos rotativos, basandose en su conocimiento del dominio.
- Generacion de documentacion tecnica: puede redactar informes de mantenimiento, procedimientos de lubricacion o listas de verificacion de instalacion, reduciendo el tiempo de redaccion de los ingenieros de planta.
- Clasificacion y extraccion de informacion de manuales tecnicos: con su contexto de 32k tokens, puede resumir capitulos completos de manuales de operacion o extraer especificaciones concretas de equipos.
- Chatbot de soporte en entornos industriales: desplegado en una intranet de una planta industrial, puede resolver dudas frecuentes de operarios y tecnicos sobre equipos rotativos sin necesidad de consultar a un especialista humano.
- Generacion de procedimientos de seguridad: el modelo puede generar pasos de trabajo seguros (PTA) para tareas de mantenimiento en equipos rotativos, siguiendo las normativas de la industria.
- Formacion de personal tecnico: como herramienta de aprendizaje interactiva, el modelo puede responder preguntas de estudiantes de ingenieria mecanica sobre fundamentos de equipos rotativos, aunque con las limitaciones propias de un modelo de 1.7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se han proporcionado puntuaciones de MMLU, HumanEval, GSM8K ni de ningun otro benchmark. Dado que el modelo es un ajuste fino de Qwen3-1.7B, se puede esperar un rendimiento inferior al de modelos mas grandes como Qwen3-8B o Llama-3.1-8B en tareas generales, pero su especializacion en equipos rotativos podria ofrecer mejores resultados en este dominio especifico.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion de 4 bits, el modelo requiere aproximadamente 1-2 GB de VRAM para inferencia en FP16 o BF16, y menos de 1 GB si se mantiene la cuantizacion de 4 bits.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como una NVIDIA GTX 1650, RTX 3050 o superior. Una RTX 4090 o A100 permitirian una inferencia mas rapida.
- Compatibilidad con GPU de consumo: si, el modelo cabe en la mayoria de las GPU de consumo actuales, incluso en las integradas de gama alta.
- Opciones de despliegue: compatible con vLLM, llama.cpp, Ollama, TGI (text-generation-inference) y transformers. Se recomienda vLLM para entornos de produccion con alta concurrencia.
- Latencia y throughput: no hay datos publicados. En una GPU moderna, se puede esperar una generacion de entre 50 y 100 tokens por segundo con cuantizacion de 4 bits.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| `lecporr/rotating-equip-sft-n0353` | 1.7B | 32 768 | Apache 2.0 | Equipos rotativos |
| Qwen3-1.7B base | 1.7B | 32 768 | Apache 2.0 | Generalista |
| Llama-3.2-1B | 1.0B | 128 000 | Llama 3.2 Community | Generalista |
| SmolLM2-1.7B | 1.7B | 8 192 | Apache 2.0 | Generalista |

No se dispone de comparativas de rendimiento especificas. La principal ventaja de este modelo frente a las alternativas generalistas es su especializacion en el dominio de equipos rotativos, aunque el modelo base Qwen3-1.7B ya ofrece un rendimiento competitivo en tareas generales de razonamiento y generacion de codigo.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo pequeno de 1.7B, puede presentar sesgos y errores facticos en dominios no cubiertos por sus datos de entrenamiento.
- Riesgo de alucinacion: elevado, especialmente en tareas de razonamiento complejo o cuando se le pide informacion fuera de su dominio de especializacion.
- Limitaciones de contexto: aunque soporta 32k tokens, el modelo puede perder coherencia en contextos muy largos.
- Limitaciones de idioma: el ajuste fino se ha realizado en ingles, por lo que su rendimiento en otros idiomas puede ser significativamente peor que el del modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero no se ha publicado informacion sobre los datos de entrenamiento, por lo que no se puede garantizar la ausencia de datos con licencia restrictiva.
- Caveat de produccion: no se han publicado evaluaciones de seguridad ni de robustez, por lo que se recomienda realizar pruebas exhaustivas antes de usar el modelo en entornos criticos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/lecporr/rotating-equip-sft-n0353)
- [Repositorio de Unsloth](https://github.com/unslothai/unsloth)
- [Modelo base Qwen3-1.7B (Unsloth)](https://huggingface.co/unsloth/Qwen3-1.7B-unsloth-bnb-4bit)
