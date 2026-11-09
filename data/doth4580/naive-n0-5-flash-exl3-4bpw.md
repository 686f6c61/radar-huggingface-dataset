# doth4580/Naive-N0.5-Flash-EXL3-4bpw

## Resumen

Naive-N0.5-Flash-EXL3-4bpw es una cuantización de precisión mixta en formato EXL3 (trellis de ExLlamaV3) del modelo Naive-N0.5-Flash, desarrollado por el equipo NaiveAI. El modelo original es un transformer de tipo Mixture-of-Experts con 309.000 millones de parámetros totales y 15.500 millones activos, derivado de MiMo-V2.5 de Xiaomi y con DeepSeek Sparse Attention (DSA), que ofrece una ventana de contexto nativa de 1 millón de tokens. Esta versión cuantizada, publicada por el usuario doth4580, reduce el peso de los pesos a 4,03 bits por parámetro de media, pasando de los ~618 GB del maestro bf16 a unos 157 GB.

El paquete aplica 4 bpw a los expertos enrutados y 6 bpw a la atención, al indexador DSA, a la MLP densa de la capa 0 y al `lm_head`. Está pensado para desplegarse en clústeres de tarjetas NVIDIA GB10 (DGX Spark) mediante el motor veloGB10, con paralelismo de tensor TP=2 o TP=4. La relevancia actual reside en que permite servir un modelo de 309B con contexto de 1M tokens en hardware de borde relativamente asequible, manteniendo una degradación mínima respecto al original (0,007 nats de NLL en la prueba de validación del autor).

La licencia es MIT, lo que facilita el uso comercial, y el tokenizador y la plantilla de chat se conservan intactos respecto al modelo base. La calibración se orientó específicamente a código y a conversaciones de tipo agente con tool calling, lo que sugiere un rendimiento diferencial en esos dominios frente a cuantizaciones genéricas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con DeepSeek Sparse Attention (DSA), basado en MiMo-V2.5 |
| Parametros totales | 309.000 millones (78.654.386.368 según safetensors del repo; discrepancia con la model card) |
| Parametros activos | 15.500 millones |
| Longitud de contexto | 1.000.000 tokens (nativa); `--max-seq-len` probado a 262.144 |
| Tipos de cuantizacion | EXL3 trellis de precisión mixta: 4 bpw en expertos enrutados, 6 bpw en atención, indexador DSA, MLP densa de capa 0 y `lm_head`; 4,03 bpw globales |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (EXL3 / trellis), librería `trellis`, motor exllamav3 / veloGB10 |

## Arquitectura y entrenamiento

El modelo base Naive-N0.5-Flash es un transformer MoE con 309B parámetros totales y 15,5B activos por token, construido sobre MiMo-V2.5 de Xiaomi e incorporando DeepSeek Sparse Attention, lo que permite una ventana de contexto nativa de 1 millón de tokens con coste de atención subcuadrático. La arquitectura incluye un indexador DSA específico, una MLP densa en la capa 0 y un `lm_head` que en esta cuantización se mantienen a 6 bpw por su sensibilidad. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en la información proporcionada.

Esta ficha corresponde exclusivamente al artefacto cuantizado: los pesos se generaron con exllamav3 1.5.3 y la definición de arquitectura del repositorio sf-stav/Naive-N0.5-Flash-EXL3-2x-DGX-Spark, partiendo del maestro bf16 (no de la release FP8). El proceso se ejecutó en 8× RTX PRO 6000 (Blackwell) en aproximadamente 1,5 horas, usando un conjunto de calibración de 498 filas × 2.048 tokens construido a partir de repositorios de código, conversaciones de tool calling estilo agente renderizadas con la plantilla de chat del propio modelo y texto general. El autor advierte que mezclar pesos del maestro bf16 y de la release FP8 en un mismo paquete degrada gravemente el resultado (2,48 nats frente a 1,63), por lo que ambas releases no son intercambiables.

## Capacidades

- Generación de texto y razonamiento general en un modelo de escala 309B con 15,5B activos.
- Generación de código y salida estructurada (JSON), dominio al que se orientó el conjunto de calibración.
- Tool calling y function calling, con formato de conversación de agente preservado desde el modelo base.
- Razonamiento multi-paso y flujos agénticos, con modo "thinking" habilitado en las pruebas del autor.
- Contexto largo: ventana nativa de 1M tokens, validada en el motor a 262.144 tokens de longitud de secuencia.
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión, audio u otras modalidades: no disponible.

## Casos de uso

- Agentes de código autónomos: el modelo puede mantener sesiones largas de edición sobre repositorios completos gracias a su contexto de 1M tokens y a la calibración específica en código; encaja en pipelines que requieren leer múltiples ficheros y emitir parches coherentes.
- Asistentes de tool calling en producción: con soporte de function calling y una puntuación de 91/100 en tool-eval-bench v2.7.1, es adecuado para orquestadores que encadenan llamadas a APIs externas con razonamiento intermedio.
- Análisis de documentación técnica extensa: la ventana de 1M tokens permite ingerir manuales, especificaciones o bases de código completas sin chunking agresivo, reduciendo la pérdida de contexto entre fragmentos.
- Generación de JSON y salidas estructuradas: útil en procesos ETL o integraciones donde el modelo debe producir objetos validables; la prueba de probabilidad sobre claves JSON se mantiene en 1.000 tras la cuantización.
- Despliegue en infraestructura de borde: al caber en 2 o 4 nodos DGX Spark (GB10) con el motor veloGB10, permite servir un modelo de 309B en entornos con restricciones de espacio o consumo frente a clústeres de A100/H100.
- Evaluación e investigación de cuantización: el paquete incluye métricas de NLL y comparaciones con el hermano de 3,5 bpw, lo que lo hace útil como referencia para estudiar el impacto de la precisión mixta en modelos MoE de gran escala.
- Atención al cliente con contexto largo: conversaciones multi-turno con historial extenso e integración de herramientas de consulta a sistemas internos, aprovechando la ventana de 1M tokens y el soporte de tool calling.

## Benchmarks y rendimiento

| Modelo | Fuente | NLL (nats/token) | p(indentación tras `if n < 0:`) | p(`age`) en clave JSON | tool-eval-bench v2.7.1 |
|---|---|---|---|---|---|
| Naive-N0.5-Flash bf16 (`transformers`) | bf16 | 1,627 | 1,000 | 1,000 | no disponible |
| **Este paquete (4,03 bpw)** | bf16 | **1,634** | 1,000 | 1,000 | **91/100 (126/138 puntos)** |
| Hermano 3,5 bpw | FP8 | 1,619 | 1,000 | 1,000 | 86/100 (118/138 puntos) |
| Mezcla bf16 + FP8 | mixta | 2,48 | no disponible | no disponible | no disponible |

La prueba de NLL se realizó en modo forward-only con teacher forcing sobre un texto técnico de 977 tokens. El benchmark de tool calling se ejecutó con 69 escenarios, temperatura 0, semilla 42 y thinking activado, servido por veloGB10 en TP=4; el propio benchmark advierte que una sola ejecución no constituye una estimación calibrada, por lo que la diferencia de 5 puntos debe interpretarse como "al menos igual", no como una ventaja consolidada. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM/almacenamiento: el paquete ocupa ~157 GB (~147 GiB), frente a ~315 GB de la release FP8 y ~618 GB del maestro bf16.
- GPU compatibles: el motor veloGB10 solo soporta TP=2 y TP=4 sobre NVIDIA GB10 (DGX Spark); ningún GB10 individual aloja el modelo.
- Configuración mínima: 2 nodos DGX Spark con TP=2, con poco margen de holgura; 4 nodos en TP=4 ofrecen mayor comodidad.
- Configuración de referencia probada: `--max-seq-len 262144`, `--max-batch 2`, `--max-tokens 65536`, `--prefix-cache on`.
- Despliegue: veloGB10 (servidor compatible con la API de OpenAI en `http://<head-ip>:9000/v1`); exllamav3 como base de cuantización. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en esta ficha.
- Latencia y throughput: no disponibles en la información proporcionada.
- Cuantización en 8× RTX PRO 6000 (Blackwell): únicamente para el proceso de conversión, no para inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **Naive-N0.5-Flash-EXL3-4bpw** (este) | 309B | 15,5B | 1M | EXL3 mixta 4,03 bpw, ~157 GB | MIT | Hugging Face, motor veloGB10 |
| Naive-N0.5-Flash-EXL3-3.5bpw | 309B | 15,5B | 1M | EXL3 uniforme 3,5 bpw desde FP8 | MIT | Hugging Face |
| Naive-N0.5-Flash (bf16) | 309B | 15,5B | 1M | bf16, ~618 GB | MIT | Hugging Face |
| Naive-N0.5-Flash (FP8) | 309B | 15,5B | 1M | FP8, ~315 GB | MIT | Hugging Face |

No se dispone de información sobre modelos de otros desarrolladores comparables en la misma categoría (MoE de ~300B con contexto de 1M) en los datos proporcionados.

## Limitaciones y advertencias

- Discrepancia de parámetros: la model card indica 309B totales, mientras que el recuento de safetensors del repo arroja 78.654.386.368 parámetros; conviene verificar antes de dimensionar el despliegue.
- La cuantización introduce modificaciones en los pesos; el autor reporta una degradación de 0,007 nats frente al maestro bf16, pero no se han publicado evaluaciones exhaustivas en benchmarks estándar.
- No mezclar pesos de las releases bf16 y FP8: el autor documenta una degradación severa (2,48 nats) en paquetes construidos con fuentes mixtas.
- El modelo solo se ha validado con el motor veloGB10 en TP=2 y TP=4; no hay soporte documentado para otros motores de inferencia en esta ficha.
- Requiere al menos dos nodos DGX Spark; no cabe en una sola GPU consumer ni en un GB10 individual.
- Idiomas soportados no documentados; el comportamiento multilingüe no está verificado.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran escala; no se han publicado evaluaciones específicas de sesgos en la información disponible.
- La licencia MIT permite uso comercial, pero el artefacto deriva de un modelo de terceros (NaiveAI) y de MiMo-V2.5 de Xiaomi; conviene revisar las condiciones de la cadena completa de dependencias.
- El benchmark de tool calling se basa en una única ejecución por modelo, por lo que las diferencias de puntuación no deben considerarse estadísticamente significativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/doth4580/Naive-N0.5-Flash-EXL3-4bpw
- Modelo base: https://huggingface.co/NaiveAI/Naive-N0.5-Flash
- Licencia del modelo base: https://huggingface.co/NaiveAI/Naive-N0.5-Flash/blob/main/LICENSE
- Hermano 3,5 bpw: https://huggingface.co/doth4580/Naive-N0.5-Flash-EXL3-3.5bpw
- MiMo-V2.5 (Xiaomi): https://huggingface.co/XiaomiMiMo/MiMo-V2.5-Base
- exllamav3: https://github.com/turboderp-org/exllamav3
- Repositorio de receta y arquitectura: https://github.com/sf-stav/Naive-N0.5-Flash-EXL3-2x-DGX-Spark
- Motor veloGB10: https://github.com/sf-stav/veloGB10
- tool-eval-bench: https://github.com/sf-stav/tool-eval-bench
