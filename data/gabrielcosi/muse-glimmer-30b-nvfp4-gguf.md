# gabrielcosi/Muse-Glimmer-30B-NVFP4-GGUF

## Resumen

Muse Glimmer es un modelo de lenguaje causal de 30 000 millones de parámetros desarrollado por el Meta Superintelligence Lab, diseñado específicamente para tareas de agente autónomo en hardware de consumo. Integra razonamiento multi-paso, uso fiable de herramientas, comprensión multimodal (texto e imágenes) y recuperación ante fallos en un único modelo que puede ejecutarse localmente sin conexión a la nube. Su arquitectura combina un transformer denso con un encoder de percepción ViT-G/14, alcanzando una ventana de contexto de más de 131 000 tokens.

La versión aquí descrita es una conversión a GGUF del modelo original NVFP4, realizada por el usuario gabrielcosi, que incluye además los archivos auxiliares para el encoder de visión y el modelo drafter de decodificación especulativa. Está optimizada para su uso con llama.cpp y requiere un parche aún no integrado en la rama principal para funcionar correctamente. Su licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense Causal Transformer con Perception Encoder (ViT-G/14) |
| Parametros totales | ~29,6B (incluyendo vision encoder) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131 072+ tokens |
| Tipos de cuantizacion | Q8_0 (sobre pesos NVFP4); el modelo original tambien ofrece K-Quant-Dynamic y K-Quant-17GB |
| Idiomas soportados | Mas de 100 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivos .gguf) |

## Arquitectura y entrenamiento

Muse Glimmer es un transformer causal denso con 52 capas, dimension oculta de 6656 y un patron de atencion mixto: cada cuatro capas, tres usan atencion local con ventana deslizante de 2048 tokens y una usa atencion global. Emplea GQA con 32 cabezas de consulta y 2 de clave/valor (ratio 16:1), FFN tipo SwiGLU con dimension intermedia de 19 968, y RoPE con theta de 500 000 solo en las capas locales. El encoder de percepcion es un ViT-G/14 de aproximadamente 1,8B parametros, 50 capas y ancho 1536, que procesa hasta 4096 tokens visuales por imagen.

El entrenamiento se realizo con contenido multimodal de fuentes publicas, datos de terceros y productos de Meta, con un cutoff de conocimiento en enero de 2026. No se han publicado detalles sobre el numero total de tokens de entrenamiento ni sobre el uso de tecnicas de alineacion como RLHF o DPO. La model card menciona que el modelo fue "entrenado y evaluado" en capacidades de agente, pero no especifica el proceso de ajuste.

## Capacidades

- Razonamiento multi-paso: encadena razonamientos sobre horizontes largos, manteniendo planes coherentes en flujos de trabajo complejos.
- Uso fiable de herramientas: invoca funciones con esquemas precisos a lo largo de workflows extendidos.
- Recuperacion ante fallos: cuando una llamada a herramienta falla o devuelve un resultado inesperado, diagnostica el error y reintenta en lugar de detenerse.
- Comprension multimodal: acepta texto e imagenes intercaladas (capturas de pantalla, graficos, documentos) gracias al encoder de percepcion.
- Compatibilidad con scaffolds de agentes: funciona con OpenClaw, Hermes Agent y otros patrones de orquestacion.
- Esfuerzo controlable: soporta diferentes niveles de razonamiento para equilibrar calidad y velocidad.
- Multilingue: entrenado con datos de mas de 100 idiomas.
- Decodificacion especulativa: incluye un modelo drafter basado en DFlash para acelerar la generacion.

## Casos de uso

- Agentes autonomos de resolucion de tareas: el modelo puede completar tareas de principio a fin en entornos como DeepSearch QA o SWE-Bench, escribiendo y depurando codigo dentro de un scaffold. Su capacidad de recuperacion ante fallos lo hace adecuado para pipelines no supervisados.
- Asistente de programacion con tool calling: integrado en un IDE o CLI, puede invocar funciones de busqueda, ejecucion de tests o gestion de repositorios, manteniendo el contexto de multiples turnos gracias a su ventana de 131k tokens.
- Analisis de documentos con imagenes: dado un PDF escaneado o una captura de pantalla, el modelo extrae informacion, interpreta graficos y responde preguntas combinando texto e imagen en una sola conversacion.
- Atencion al cliente multilingue: con soporte para mas de 100 idiomas, puede gestionar conversaciones multi-turno con clientes de distintas regiones, usando herramientas de CRM o bases de conocimiento.
- Automatizacion de flujos de trabajo con recuperacion de errores: en procesos de RPA o integracion de APIs, el modelo detecta fallos en las llamadas, los diagnostica y reintenta, reduciendo la necesidad de intervencion humana.
- Razonamiento cientifico asistido: para investigadores que necesitan analizar graficos, tablas y texto cientifico, el modelo puede razonar sobre datos multimodales y generar hipotesis o resumenes con esfuerzo controlable.

## Benchmarks y rendimiento

La model card menciona que el modelo fue evaluado en benchmarks de tareas de agente como DeepSearch QA, MCP-Atlas, τ3-Bench y SWE-Bench, asi como en 15 benchmarks comunes para medir la degradacion por cuantizacion. Sin embargo, no se proporcionan resultados numericos concretos en la informacion disponible. No se han publicado cifras de MMLU, HumanEval u otros benchmarks estandar en esta documentacion.

## Requisitos de hardware

- VRAM estimada: el modelo cuantizado a 4 bits (K-Quant-17GB) cabe en 24 GB de VRAM, dejando espacio para KV cache, encoder de vision y drafter. La version Q8_0 de este repo ocupa 15,9 GiB solo para el modelo principal, mas 1,30 GiB del mmproj y 1,52 GiB del drafter, por lo que se recomienda al menos 24 GB de VRAM para ejecutar todo el conjunto.
- GPU recomendadas: NVIDIA Blackwell (SM120) para aprovechar el formato NVFP4 nativo en tensor cores; el backend de CPU tambien soporta NVFP4. Para la cuantizacion Q8_0, GPUs con 24 GB o mas (RTX 3090, RTX 4090, A5000, etc.) son adecuadas.
- Despliegue: se utiliza llama.cpp (llama-server) con los parametros `--mmproj`, `--spec-type draft-dflash` y `--spec-draft-model` para activar la decodificacion especulativa. Tambien es compatible con otros frontends que usen llama.cpp como backend.
- Latencia y throughput: no se han publicado datos especificos de latencia o tokens por segundo en la informacion disponible.

## Comparativa con modelos similares

No se dispone de informacion comparativa con otros modelos de la misma categoria (30B multimodales para agentes) en la documentacion proporcionada. Se recomienda consultar benchmarks publicos como Artificial Analysis o LMArena para comparaciones independientes.

## Limitaciones y advertencias

- Requiere un parche de llama.cpp que aun no esta integrado en la rama principal. En una compilacion estandar, el modelo carga pero devuelve el mismo token para cada prompt. No se debe usar en produccion hasta que el fix este disponible.
- La cuantizacion Q8_0 sobre pesos NVFP4 puede introducir una degradacion adicional respecto a la cuantizacion 4-bit original, aunque la model card indica que la degradacion media es de aproximadamente 1% en 15 benchmarks para la version K-Quant-17GB.
- No se han documentado sesgos especificos, pero al ser entrenado con datos de Meta y terceros, puede reflejar sesgos presentes en esas fuentes.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas de razonamiento largo o con entradas ambiguas.
- El conocimiento se limita a enero de 2026; no tiene informacion posterior.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base es de Meta y podria haber restricciones adicionales no mencionadas en la model card.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/gabrielcosi/Muse-Glimmer-30B-NVFP4-GGUF
- Modelo original: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Modelo NVFP4 de Red Hat AI: https://huggingface.co/RedHatAI/Muse-Glimmer-30B-NVFP4
- Repositorio GGUF del modelo original: https://huggingface.co/meta-models/Muse-Glimmer-30B-GGUF
- Paper del perception encoder (arXiv:2504.13181): https://arxiv.org/abs/2504.13181
- Paper de DFlash (arXiv:2602.06036): https://arxiv.org/abs/2602.06036
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
