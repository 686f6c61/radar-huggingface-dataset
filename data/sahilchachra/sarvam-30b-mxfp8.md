# sahilchachra/sarvam-30b-MXFP8

## Resumen

sarvam-30b-MXFP8 es una cuantizacion MLX en precision MXFP8 del modelo sarvamai/sarvam-30b, un modelo de generacion de texto de 32 000 millones de parametros con arquitectura de mezcla de expertos (MoE) desarrollado por Sarvam AI, compania india especializada en IA para idiomas de la India. El modelo esta disenado para ofrecer razonamiento, generacion de codigo y conversacion multilingue de alta calidad en entornos con recursos limitados, con especial atencion a los idiomas indios.

La arquitectura sarvam_moe es personalizada: 19 capas transformer (la primera densa, el resto MoE), 128 expertos enrutados mas un experto compartido con enrutamiento top-6 con puerta sigmoide, atencion de consulta agrupada (GQA) con 64 cabezas de consulta y 4 de clave/valor, y un lm_head no compartido de 262 000 tokens de vocabulario. Con 2,4 mil millones de parametros activos (sin contar embeddings), el modelo esta optimizado para despliegue practico en entornos con restricciones de memoria.

Esta cuantizacion MXFP8 (E4M3 con escala compartida E8M0, grupo de 32) reduce el peso a aproximadamente 8,5 bits por parametro y ocupa 32 GB en disco. Requiere Apple Silicon y la libreria mlx-lm, pero necesita parchear manualmente un PR sin fusionar (ml-explore/mlx-lm#991) para poder cargar la arquitectura sarvam_moe. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | sarvam_moe (MoE, 19 capas transformer, 128 expertos enrutados + 1 compartido, top-6 sigmoid-gated) |
| Parametros totales | ~32 000 millones (32,15 B segun FitMyLLM) |
| Parametros activos | 2,4 B (sin contar embeddings, segun AI Kosh) |
| Longitud de contexto | 32 000 tokens (segun FitMyLLM) |
| Tipos de cuantizacion | MXFP8 (E4M3 + E8M0, grupo 32, ~8,5 bpw); variante MXFP4 (~4,6 bpw); FP8 oficial de Sarvam |
| Idiomas soportados | Ingles e idiomas indios (hindi, tamil, etc.); tokenizer multilingue de 262 000 tokens |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (safetensors con metadatos format: mlx) |

## Arquitectura y entrenamiento

La arquitectura sarvam_moe es una implementacion personalizada de mezcla de expertos con 19 capas transformer, donde la primera capa es densa y las 18 restantes son MoE. Cada capa MoE contiene 128 expertos enrutados mas un experto compartido, con enrutamiento top-6 mediante puerta sigmoide al estilo DeepSeek: sesgo de experto para equilibrio de carga y factor de escala enrutado de 2,5. La atencion es de consulta agrupada (GQA) con 64 cabezas de consulta y 4 cabezas de clave/valor, normalizada con QK-RMSNorm. El lm_head no esta compartido con los embeddings (tie_word_embeddings: false) y es una matriz independiente de aproximadamente 1,07 mil millones de parametros con un vocabulario de 262 000 tokens que cubre idiomas indios.

Sarvam AI entreno el modelo base con un enfoque en razonamiento y calidad conversacional multilingue, con capacidad para realizar llamadas a herramientas (tool calling) y manejar conversaciones de voz multilingues. Es un modelo de razonamiento: emite un bloque de pensamiento (thinking) antes de la respuesta visible, por lo que requiere suficiente max_tokens para no truncar la respuesta final.

La cuantizacion MXFP8 de este repositorio mantiene en precision bf16 completa el lm_head y los pesos del enrutador (mlp.gate.weight) de cada capa, ya que cuantizar el enrutador degrada doblemente las decisiones de enrutamiento. Los embeddings de entrada (embed_tokens) si estan cuantizados.

## Capacidades

- Generacion de texto y razonamiento multi-paso: emite un bloque de pensamiento interno antes de la respuesta visible.
- Generacion de codigo fiable, segun la documentacion oficial de Sarvam AI.
- Calidad conversacional destacada en idiomas indios (hindi, tamil, etc.) y en ingles.
- Soporte de tool calling / function calling, integrable en pipelines de agentes.
- Capacidad para manejar llamadas de voz multilingues (segun AI Kosh).
- Tokenizer multilingue de 262 000 tokens especificamente disenado para cubrir idiomas indios.
- Sin soporte de vision: el modelo es exclusivamente de texto.

## Casos de uso

- Atencion al cliente multilingue: el modelo puede gestionar conversaciones multi-turno en ingles e idiomas indios, lo que lo hace adecuado para centros de soporte en India y regiones vecinas. Su ventana de contexto de 32 000 tokens permite manejar historiales largos de conversacion.
- Asistente de voz multilingue: segun AI Kosh, el modelo puede manejar llamadas de voz multilingues, lo que permite construir sistemas IVR o asistentes vocales que operen en hindi, tamil y otros idiomas regionales.
- Generacion de codigo en produccion: con capacidad de razonamiento y tool calling, puede integrarse en pipelines de CI/CD para generar, revisar o documentar codigo, especialmente en equipos que trabajan con requisitos en ingles o idiomas indios.
- Agentes autonomos con llamada a herramientas: el soporte de tool calling permite construir agentes que consulten APIs, bases de datos o servicios externos, con razonamiento multi-paso para completar tareas complejas.
- Despliegue en Apple Silicon: al ser una cuantizacion MLX, el modelo esta optimizado para ejecutarse en Macs con 48 GB o mas de memoria unificada, lo que permite inferencia local sin depender de GPUs NVIDIA.
- Aplicaciones con restricciones de recursos: con solo 2,4 mil millones de parametros activos, el modelo esta disenado para ejecutarse de forma fiable en entornos con memoria limitada, manteniendo capacidades de razonamiento de nivel superior.
- Investigacion en PNL para idiomas indios: el tokenizer de 262 000 tokens y el entrenamiento especifico en idiomas indios lo convierten en una base solida para experimentos de generacion, traduccion o analisis de sentimiento en estos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta cuantizacion indica que la variante MXFP4 (hermana de esta) supero una prueba de humo de generacion en ingles, hindi y tamil, y que al usar MXFP8 mas bits por peso, esta variante es al menos tan fiel al modelo base como la MXFP4. FitMyLLM menciona 14 benchmarks para el modelo base, pero no se incluyen los valores numericos en la informacion proporcionada.

## Requisitos de hardware

- Memoria unificada minima recomendada: 48 GB en Apple Silicon. La model card indica que el modelo de 32 GB no pudo ejecutarse en una maquina de prueba con 26 GB de RAM; en un Mac con 48 GB o mas funciona a velocidad normal.
- GPU: exclusivamente Apple Silicon (M-series). MLX no soporta GPUs NVIDIA o AMD.
- Variante MXFP4 (17 GB en disco) recomendada para Macs con 32 GB de memoria unificada o mas.
- Despliegue: mlx-lm (Python). Requiere parchear manualmente el archivo mlx_lm/models/sarvam_moe.py desde el PR #991 sin fusionar. No funciona en LM Studio ni en herramientas que incluyan su propia version sin parchear de mlx-lm.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---
