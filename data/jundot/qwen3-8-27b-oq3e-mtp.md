# Jundot/Qwen3.8-27B-oQ3e-mtp

## Resumen

Qwen3.8-27B-oQ3e-mtp es una cuantizacion mixta en formato MLX del modelo Qwen/Qwen3.8-27B, un modelo denso de vision-lenguaje de 27.781 millones de parametros construido sobre la arquitectura Qwen3.5. La publica el usuario Jundot mediante su herramienta oQ (oMLX v0.8.0), que asigna precision por capa segun la sensibilidad medida de cada una en lugar de aplicar una cuantizacion uniforme. El checkpoint incluye el backbone de lenguaje, el codificador visual y la cabeza de prediccion multi-token (MTP).

El modelo resuelve el problema de ejecutar un VLM de 27B en hardware Apple Silicon con un presupuesto de memoria reducido: el checkpoint completo ocupa 14.358 GB en disco y 13.372 GiB en almacenamiento de tensores, con una media efectiva de 4.135 bits por peso. La mayor parte de los pesos (74,4%) se almacena a 3 bits afines con grupo de 64, mientras que las capas mas sensibles se conservan a 4, 5, 6 u 8 bits, y un 1,86% permanece en BF16.

Es relevante porque combina tres elementos poco habituales en un solo artefacto: contexto nativo de 262.144 tokens, comprension de imagen y video, y decodificacion especulativa mediante cabeza MTP, todo bajo licencia Apache-2.0. La actualizacion del 19 de noviembre de 2026 re-cuantiza con el redondeo oQe refinado, que reduce el error de cuantizacion sin cambiar tamano ni velocidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con capas Gated DeltaNet y Gated Attention (familia Qwen3.5); codificador visual + cabeza MTP |
| Parametros totales | 27.781.427.952 (27.781B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | Mixta afín con grupo 64: 3, 4, 5, 6 y 8 bits, mas BF16; media efectiva 4.135 bits/peso (4.0 en el backbone) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), libreria mlx |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea un diseno hibrido que intercala capas Gated DeltaNet (atención lineal con estado recurrente) y capas Gated Attention clasicas, una combinacion orientada a sostener contextos muy largos con coste de atencion reducido. Sobre ese backbone se anade un codificador visual de 0.461B de parametros para entrada image-text-to-text y una cabeza MTP de 0.425B que permite decodificacion especulativa multi-token. El backbone de lenguaje concentra 26.896B de parametros.

La cuantizacion oQ3e no es uniforme: mide la sensibilidad de cada capa, asigna bits en consecuencia y redondea cada grupo con una matriz de importancia calculada sobre 128 muestras de 512 tokens, seguida de un reajuste de escala y sesgo por minimos cuadrados ponderados. El reparto resultante es 20.657B a 3 bits, 3.311B a 4 bits, 2.020B a 5 bits, 1.277B a 6 bits y 0.516B en BF16. No se dispone de informacion sobre el dataset de entrenamiento del modelo original, el numero de tokens, ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Comprension de imagen y video (pipeline image-text-to-text).
- Contexto nativo de 262.144 tokens, adecuado para documentos y videos largos.
- Decodificacion especulativa mediante cabeza MTP para acelerar la generacion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos extensos con imagenes intercaladas: gracias a los 262.144 tokens de contexto, el modelo puede procesar informes, contratos o manuales completos junto con sus figuras en una sola pasada, sin trocear el material.
- Descripcion y resumen de video: el codificador visual y el contexto largo permiten resumir secuencias de video o extraer eventos concretos en local sobre un Mac con memoria unificada.
- Asistente conversacional local en Apple Silicon: el checkpoint de 13,4 GiB cabe en equipos con 24-32 GB de memoria unificada, lo que habilita un asistente privado sin conexion a servicios externos.
- Prototipado de pipelines VLM en MLX: util para validar arquitecturas image-text-to-text antes de desplegar la version completa en BF16 en servidores.
- Extraccion de informacion estructurada de capturas y formularios: el modelo puede transcribir y normalizar datos de imagenes en flujos de digitalizacion documental.
- Evaluacion comparativa de tecnicas de cuantizacion: al publicarse con detalle el reparto de bits por capa, sirve como referencia para estudiar el impacto de la cuantizacion mixta en tareas de vision-lenguaje.
- Generacion aumentada por recuperacion (RAG) multimodal: la ventana de contexto permite inyectar muchos fragmentos recuperados junto con imagenes de soporte en una misma consulta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 13,4 GiB para los pesos; con cache KV para contexto largo, se recomienda un minimo de 24 GB y idealmente 32-64 GB en funcion de la longitud de contexto.
- Hardware objetivo: Apple Silicon (MLX). No es un checkpoint para CUDA sin conversion previa.
- GPU recomendadas: chips Apple M-series con memoria unificada amplia (M2 Pro/Max, M3 Pro/Max, M4 Pro/Max); no aplica a A100, H100 ni RTX 4090 en su formato actual.
- Cabe en GPU de consumo: si, en equipos Apple con 24 GB o mas de memoria unificada; en GPUs dedicadas convencionales requeriria conversion de formato.
- Opciones de despliegue: mlx-lm y el ecosistema oMLX; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles en la informacion proporcionada; la cabeza MTP esta pensada para reducir la latencia de decodificacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-oQ3e-mtp (este) | 27.781B | 262.144 | MLX safetensors, 4.135 bits/peso | Apache-2.0 | Cuantizacion mixta con MTP, orientado a Apple Silicon |
| Qwen/Qwen3.8-27B (base) | 27.781B | 262.144 | safetensors BF16 | Apache-2.0 | Precision completa; mayor calidad y mucho mayor huella de memoria |
| Alternativas de ~27B denso con vision | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- La cuantizacion a 3 bits en el 74,4% de los pesos introduce perdida de calidad respecto al modelo base en BF16; el autor no publica metricas de degradacion.
- El checkpoint esta atado a MLX y a hardware Apple Silicon; no es portable directamente a CUDA sin conversion.
- No se documentan los idiomas soportados ni el comportamiento multilingue tras la cuantizacion.
- No hay informacion sobre sesgos, tasas de alucinacion ni evaluaciones de seguridad del modelo base ni del cuantizado.
- El contexto de 262.144 tokens exige cache KV considerable; en equipos con 24 GB puede ser necesario limitar la longitud efectiva.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.8-27B y de las dependencias de oMLX.
- La model card advierte de que versiones anteriores a la actualizacion del 19-11-2026 deben descargarse de nuevo para obtener el redondeo oQe refinado.
- El modelo tiene 0 likes y 410 descargas en el momento de la consulta: es un artefacto de nicho sin validacion comunitaria amplia.

## Enlaces

- Hugging Face: https://huggingface.co/Jundot/Qwen3.8-27B-oQ3e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oMLX: https://github.com/jundot/omlx
- Pull request oQe: https://github.com/jundot/omlx/pull/4930
- Pull request redondeo oQe: https://github.com/jundot/omlx/pull/5292
