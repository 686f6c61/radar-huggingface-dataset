# Outlier-Ai/Qwen2.5-Coder-32B-Instruct-MLX-4bit

## Resumen

Qwen2.5-Coder-32B-Instruct-MLX-4bit es una conversion cuantizada a 4 bits en formato MLX del modelo Qwen2.5-Coder-32B-Instruct, publicada por Outlier-Ai para su ejecucion nativa en Apple Silicon (chips M1, M2, M3 y M4). El modelo base lo desarrolla el equipo Qwen de Alibaba y esta especializado en generacion y comprension de codigo, ademas de mantener capacidades conversacionales generales. Esta version no modifica los pesos originales: solo cambia el formato en disco a safetensors MLX 4-bit con grupo de cuantizacion de tamano 64 y simetria, manteniendo tokenizer, plantilla de chat y licencia del modelo original.

La relevancia de esta conversion es practica: permite ejecutar un modelo de 32.763.876.352 parametros (aproximadamente 32,8 mil millones) en un Mac con memoria unificada, sin depender de la nube ni de APIs externas. El repo ocupa 18,4 GB, lo que lo hace viable en equipos con 24-32 GB de RAM unificada, algo impensable con los pesos en bf16 (que rondarian los 65 GB). Esta pensado para desarrolladores que quieren un asistente de codigo local, privado y offline en macOS.

El modelo conserva las capacidades del Qwen2.5-Coder-32B-Instruct original: generacion de codigo, completado, depuracion, function calling y soporte multilingue en 15 idiomas. La licencia Apache 2.0 del modelo base se mantiene, lo que facilita su uso comercial. No obstante, el autor advierte que esta conversion no se distribuye dentro de la app Outlier y que las cifras de rendimiento publicadas provienen de experimentos internos, no de tests de release.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), conversion MLX 4-bit |
| Parametros totales | 32.763.876.352 (~32,8 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-Coder-32B-Instruct soporta 131.072 tokens, dato no confirmado en esta ficha) |
| Tipos de cuantizacion | MLX 4-bit, group size 64, simetrica |
| Idiomas soportados | en, zh, fr, es, pt, de, it, ru, ja, ko, ar, vi, th, nl, pl |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX 4-bit), shards multiples, config.json, tokenizer, chat_template.jinja |
| Tamano del repo | 18,4 GB |
| Libreria | mlx-lm 0.31.x compatible |
| Modelo base | Qwen/Qwen2.5-Coder-32B-Instruct |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-Coder-32B-Instruct, un transformer decoder-only denso de aproximadamente 32,8 mil millones de parametros. Esta conversion no altera la arquitectura ni los pesos: unicamente aplica cuantizacion de 4 bits con grupo de tamano 64 y esquema simetrico, empaquetando el resultado en safetensors compatibles con MLX. Se incluyen config.json, tokenizer y chat_template.jinja para que mlx-lm pueda cargar el modelo directamente.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, composicion del dataset, ni si el modelo base uso RLHF, DPO u otras tecnicas de alineacion. Tampoco se documentan innovaciones tecnicas especificas de la conversion mas alla del propio esquema de cuantizacion MLX. Para esos datos hay que remitirse a la model card del modelo base original.

## Capacidades

- Generacion de codigo en multiples lenguajes de programacion, incluyendo Python, SQL y otros.
- Completado de codigo y finalizacion de funciones a partir de contexto parcial.
- Depuracion y refactorizacion: el modelo puede analizar fragmentos de codigo, senalar errores y proponer versiones mas legibles.
- Razonamiento conversacional multi-turno con plantilla de chat instruct.
- Soporte de tool calling / function calling (etiquetado explicitamente en el repo).
- Capacidades multilingues en 15 idiomas: en, zh, fr, es, pt, de, it, ru, ja, ko, ar, vi, th, nl, pl.
- Ejecucion totalmente local y offline en Apple Silicon, sin llamadas a la nube.
- Integracion con mlx-lm para generacion por linea de comandos o via API Python.

## Casos de uso

- Asistente de codigo local en macOS: un desarrollador puede cargar el modelo con mlx-lm y usarlo para autocompletar funciones, generar tests o explicar fragmentos de codigo sin enviar codigo propietario a servicios externos. El formato MLX 4-bit y los 18,4 GB del repo lo hacen viable en un MacBook Pro con memoria unificada suficiente.
- Refactorizacion y revision de codigo en entornos con requisitos de privacidad: al ejecutarse 100% en local, encaja en equipos que no pueden subir codigo a la nube por politica de seguridad. El modelo puede analizar un fichero y proponer mejoras de legibilidad o detectar bugs.
- Generacion de consultas SQL: el modelo incluye ejemplos de widget para consultas SQL complejas (top 10 usuarios por valor de compra en los ultimos 90 dias), lo que lo hace util para asistentes de analitica que traducen lenguaje natural a SQL.
- Automatizacion de tareas de CI/CD asistidas por IA: mediante function calling, puede integrarse en pipelines que invocan herramientas locales (linters, formateadores, ejecutores de tests) y encadenar pasos de razonamiento multi-step.
- Educacion y aprendizaje de programacion: al ser offline y gratuito en su uso local, sirve para entornos docentes donde se quiere un tutor de codigo sin coste por token ni dependencia de conectividad.
- Prototipado rapido de agentes de codigo: la compatibilidad con mlx-lm y el soporte de tool use permiten construir agentes que leen ficheros, ejecutan comandos y aplican parches en un Mac de desarrollo.
- Traduccion tecnica y documentacion multilingue: con 15 idiomas soportados, puede generar docstrings, comentarios y documentacion en varios idiomas a partir de codigo fuente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que las cifras de MMLU, HumanEval y tok/s en Macs de la serie M estan en outlier.host/benchmarks con procedencia completa, pero no se incluyen en el material proporcionado. No se inventan numeros.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repo pesa 18,4 GB en 4-bit, por lo que se necesita al menos ~20 GB de memoria unificada libre para cargar el modelo; se recomienda 24 GB o mas para dejar margen al contexto y al sistema.
- GPU recomendadas: Apple Silicon exclusivamente (M1, M2, M3, M4 en sus variantes Pro, Max y Ultra). No esta pensado para GPUs NVIDIA ni AMD.
- Cabe en consumer hardware: si, en Macs con memoria unificada de 24 GB o superior (MacBook Pro, Mac Studio, Mac mini con configuracion adecuada). En MacBook Air de 16 GB no es viable.
- Opciones de despliegue: mlx-lm (linea de comandos y API Python), app Outlier para macOS, y cualquier herramienta compatible con MLX que cargue safetensors MLX 4-bit.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-Coder-32B-Instruct-MLX-4bit (este) | ~32,8 B | no disponible | MLX 4-bit safetensors | apache-2.0 | Hugging Face, 333 descargas |
| Qwen2.5-Coder-14B-Instruct-MLX-4bit (Outlier-Ai) | ~14 B | no disponible | MLX 4-bit safetensors | apache-2.0 | Hugging Face, 816 descargas |
| Qwen2.5-Coder-7B-Instruct-MLX-4bit (Outlier-Ai) | ~7 B | no disponible | MLX 4-bit safetensors | apache-2.0 | Hugging Face, 1.450 descargas |
| DeepSeek-R1-Distill-Qwen-7B-MLX-4bit (Outlier-Ai) | ~7 B | no disponible | MLX 4-bit safetensors | no disponible en esta ficha | Hugging Face, 1.932 descargas |

La comparativa se limita a otras conversiones del mismo autor porque no se dispone de datos de rendimiento comparables en la informacion proporcionada. La eleccion entre 7B, 14B y 32B depende del presupuesto de memoria del equipo: el 32B ofrece mayor capacidad pero exige 24 GB o mas de memoria unificada.

## Limitaciones y advertencias

- La cuantizacion a 4 bits puede degradar ligeramente la calidad respecto al modelo en bf16, especialmente en tareas de razonamiento complejo o generacion de codigo muy largo. No se han publicado metricas de esa degradacion en esta ficha.
- Riesgo de alucinacion inherente a los modelos de lenguaje: puede generar APIs inexistentes, funciones inventadas o codigo sintacticamente correcto pero logicamente erroneo. Requiere revision humana en produccion.
- No se documentan sesgos conocidos especificos en la informacion proporcionada; el modelo base puede reflejar sesgos de sus datos de entrenamiento.
- Limitaciones de contexto e idioma: se soportan 15 idiomas, pero el rendimiento puede ser desigual entre ellos; el castellano esta incluido, aunque no se aportan metricas por idioma.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la model card del modelo base para cualquier restriccion adicional.
- Esta conversion no se distribuye dentro de la app Outlier; el autor la publica como conversion independiente y advierte que las cifras publicadas son de experimentos internos, no de tests de release.
- Requiere hardware Apple Silicon; no es portable a CUDA ni a CPU x86 sin reconvertir el formato.
- El modelo esta fechado en 2026 en Hugging Face; conviene verificar la vigencia de la version del modelo base frente a iteraciones posteriores de Qwen.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Outlier-Ai/Qwen2.5-Coder-32B-Instruct-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct
- Benchmarks de Outlier: https://outlier.host/benchmarks
- App Outlier: https://outlier.host/
- Conversion 7B del mismo autor: https://huggingface.co/Outlier-Ai/Qwen2.5-Coder-7B-Instruct-MLX-4bit
- Conversion 14B del mismo autor: https://huggingface.co/Outlier-Ai/Qwen2.5-Coder-14B-Instruct-MLX-4bit
- DeepSeek-R1-Distill-Qwen-7B MLX 4-bit: https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit
- Outlier-Core-27B: https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
- Outlier-Nano-4B: https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
