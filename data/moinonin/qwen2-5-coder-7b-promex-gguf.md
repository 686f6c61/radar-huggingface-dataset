# moinonin/qwen2.5-coder-7b-promex-gguf

## Resumen

El modelo `moinonin/qwen2.5-coder-7b-promex-gguf` es un ajuste fino mediante LoRA del modelo base `Qwen/Qwen2.5-Coder-7B-Instruct`, desarrollado por el usuario moinonin. Su propósito es convertir peticiones en lenguaje natural en especificaciones YAML validadas que siguen la metodología COMMAND_RUNWAY, un formato estructurado para definir tareas de desarrollo de software con flujos de verificación (Inspect → Create/Modify → Verify). El modelo se distribuye en formato GGUF cuantizado (q4_K_M) y está pensado para usarse con Ollama o llama.cpp.

Con 7.615.616.512 parámetros y una longitud de contexto de entrenamiento de 2048 tokens, este modelo se especializa en la generación de especificaciones técnicas de una sola característica (single-feature) sobre un stack concreto (TypeScript/Express/Prisma/Vitest). Es relevante porque automatiza una parte del proceso de diseño de software, aunque su ámbito es limitado y requiere validación humana posterior. La licencia es Apache 2.0, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No disponible (modelo denso, no MoE) |
| Longitud de contexto | 2048 (durante entrenamiento; el modelo base soporta hasta 131072) |
| Tipos de cuantizacion | GGUF q4_k_m (indicado en la model card) |
| Idiomas soportados | Ingles (entrenamiento), aunque el modelo base es multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponibles para el adaptador LoRA en el repo `moinonin/qwen2.5-coder-7b-promex-lora`) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5-Coder, un transformer decoder-only denso de 7B parametros. El ajuste fino se realizo mediante LoRA con rango 16, alpha 32, dropout 0.1, aplicado a todas las proyecciones lineales (q, k, v, o, gate, up, down). Se entreno durante 3 epocas con un learning rate de 2e-4, batch size 1 (efectivo 4 por acumulacion de gradiente), y una secuencia maxima de 2048 tokens. La cuantizacion base fue 4-bit NF4 con optimizador adamw_8bit y scheduler cosine con warmup del 10%.

Los datos de entrenamiento provienen de 475 prompts semilla distribuidos en 21 categorias de features, generados sinteticamente con Ollama (qwen2.5-coder:7b-instruct) a temperatura 0.2. Las especificaciones generadas fueron validadas con un validador YAML endurecido (78 casos de prueba) y puntuadas con un runbook scorer que exige un umbral de 0.75. No se menciona el uso de RLHF o DPO; el entrenamiento es supervisado sobre el corpus generado.

## Capacidades

- Generacion de especificaciones YAML estructuradas a partir de peticiones en lenguaje natural, siguiendo el esquema COMMAND_RUNWAY (task_id, summary, depends_on, local_goals, global_goals_refs, context).
- Cada local_goal incluye un flujo de verificacion de tres fases: Inspect → Create/Modify → Verify.
- Validacion automatica de las especificaciones generadas mediante un validador endurecido (vocabulario canonico, deteccion de duplicados, seguridad YAML).
- El modelo base Qwen2.5-Coder-7B-Instruct aporta capacidades generales de generacion de codigo, razonamiento y completado de codigo, aunque el ajuste fino las orienta hacia la generacion de YAML.
- No se menciona soporte para tool calling, function calling, ni capacidades multimodales (vision, audio).
- Multilingue en el modelo base, pero el entrenamiento se realizo solo en ingles (tag `language: en`), por lo que el rendimiento en otros idiomas puede degradarse.

## Casos de uso

- Generacion de especificaciones para desarrollo dirigido por tareas: dado un feature request en lenguaje natural, el modelo produce un YAML valido con estructura COMMAND_RUNWAY, listo para ser consumido por un ejecutor que implemente el flujo Inspect/Create/Verify.
- Integracion en pipelines de CI/CD: se puede invocar el modelo para generar especificaciones de nuevas features a partir de issues o tickets, y luego alimentar automaticamente un sistema de planificacion de tareas.
- Documentacion tecnica automatizada: a partir de una descripcion de un cambio, el modelo genera una especificacion que sirve como documentacion formal para el equipo de desarrollo.
- Prototipado rapido de requisitos: los product managers pueden convertir ideas en especificaciones estructuradas sin intervencion manual, acelerando la fase de diseno.
- Validacion de especificaciones existentes: aunque no es el proposito principal, el modelo puede usarse para comparar y detectar inconsistencias en especificaciones generadas por otros medios, gracias a su entrenamiento en el validador.
- Generacion de casos de prueba derivados: la estructura Inspect/Verify puede ayudar a derivar casos de prueba unitarios o de integracion a partir de las especificaciones generadas.
- Automatizacion de documentacion de APIs: para stacks TypeScript/Express, el modelo puede generar especificaciones de endpoints con sus campos y validaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona metricas internas (validation rate y score pass rate) con un objetivo de >80% en prompts held-out, pero no se proporcionan cifras concretas ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia con cuantizacion q4_k_m: aproximadamente 4,5–5,5 GB (modelo de 7.6B parametros en 4 bits), lo que cabe en GPUs consumer como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o superiores.
- Para inferencia con el modelo completo en fp16 se necesitarian unos 15-16 GB de VRAM, lo que requiere GPU profesionales (A100, H100) o consumer de gama alta (RTX 4090 con 24 GB).
- Despliegue recomendado: Ollama (usando el Modelfile incluido), llama.cpp o cualquier runtime compatible con GGUF. Tambien es posible cargar el adaptador LoRA en Transformers con PEFT.
- Latencia y throughput estimados: no disponibles; dependen del hardware y del runtime. En una RTX 4090 con q4_k_m, la generacion de una especificacion tipica (512 tokens) podria tardar 2-5 segundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| moinonin/qwen2.5-coder-7b-promex-gguf | 7.6B | 2048 (entrenamiento) | Apache 2.0 | Generacion de especificaciones YAML COMMAND_RUNWAY |
| Qwen/Qwen2.5-Coder-7B-Instruct | 7.6B | 131072 | Apache 2.0 | Generacion de codigo y chat general |
| DeepSeek-Coder-6.7B-Instruct | 6.7B | 16384 | MIT | Generacion de codigo, soporte multilingue |
| CodeLlama-7B-Instruct | 6.7B | 16384 | Llama 2 license | Generacion de codigo, instrucciones |

No se dispone de comparativas de rendimiento con estos modelos en tareas de generacion de especificaciones YAML. La ventaja del modelo promex es su especializacion en el formato COMMAND_RUNWAY, pero su contexto limitado y su enfoque mono-stack (TypeScript/Express) lo hacen menos general que sus alternativas.

## Limitaciones y advertencias

- Entrenado sobre un corpus sintetico generado por el propio modelo base, por lo que la calidad de las especificaciones esta limitada por la capacidad de generacion de Qwen2.5-Coder-7B-Instruct.
- El modelo esta limitado a especificaciones de una sola caracteristica y un solo archivo, no soporta epicas o tareas multi-etapa.
- El contexto de entrenamiento es de 2048 tokens, lo que puede limitar la generacion de especificaciones largas o con mucho contexto.
- La cuantizacion GGUF (q4_k_m) introduce una degradacion menor de calidad respecto al modelo en 16-bit.
- Solo se ha entrenado en ingles, aunque el modelo base es multilingue; el rendimiento en otros idiomas puede ser inferior.
- Las especificaciones generadas deben pasar por el validador endurecido antes de usarse en produccion, y se requiere revision humana antes de alimentar un ejecutor COMMAND_RUNNING.
- No hay garantia de que las especificaciones generadas sean correctas o completas; el modelo no genera codigo ejecutable.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/moinonin/qwen2.5-coder-7b-promex-gguf
- Repositorio HuggingFace del adaptador LoRA: https://huggingface.co/moinonin/qwen2.5-coder-7b-promex-lora
- Modelo base Qwen2.5-Coder-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Coleccion Qwen2.5-Coder: https://huggingface.co/collections/Qwen/qwen25-coder
- GitHub de Qwen2.5-Coder: https://github.com/huggingface/Qwen2.5-Coder
- Registro de free2aitools (informacion pendiente): https://free2aitools.com/model/moinonin/qwen2.5-coder-7b-promex
- Repositorio de la metodologia COMMAND_RUNNER (citado en el modelo card): https://github.com/nickrotich/githeri
