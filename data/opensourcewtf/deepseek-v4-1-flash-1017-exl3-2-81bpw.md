# OpensourceWTF/DeepSeek-V4.1-Flash-1017-exl3-2.81bpw

## Resumen

Este repositorio contiene una cuantización EXL3 a 2,81 bits por peso (bpw) de DeepSeek-V4.1-Flash-1017, el modelo base de DeepSeek, realizada por el usuario OpensourceWTF con la receta de autocuantización (SC) de exllamav3. No se trata de un modelo nuevo, sino de un empaquetado optimizado para su ejecución local: el objetivo declarado del autor es que quepa en Macs con 128 GB de memoria unificada, transmitiendo los expertos enrutados desde el SSD.

El modelo base es una arquitectura MoE (mixture of experts) de DeepSeek con soporte de visión, etapas MTP (multi-token prediction) y tablas de n-gramas "Engram", lo que sugiere un modelo híbrido con decodificación especulativa y componentes de atención orientados a eficiencia. La licencia es MIT, tanto del modelo base como de esta cuantización, lo que permite uso comercial sin restricciones relevantes.

Es relevante ahora porque ofrece una de las pocas formas prácticas de ejecutar un modelo de esta escala en hardware de consumidor/prosumer: 384 GiB en disco con los expertos enrutados a 2,8 bpw, con una calidad medida por qbench prácticamente idéntica a cuantizaciones alternativas a 2,9 bpw pero ocupando un 2,7 % menos de espacio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (deepseek_v41) con expertos enrutados, experto compartido, torre de visión, etapas MTP y tablas Engram de n-gramas |
| Parametros totales | no disponible |
| Parametros activos | no disponible (arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 2,81 bpw: expertos K3 (K2 en capas 23 y 32-39), tensores no-experto K6, tablas Engram en FP8 original (F8_E4M3 con escalas F8_E8M0) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (formato EXL3, requiere exllamav3) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer MoE con 40 capas de expertos enrutados (384 expertos por capa), un experto compartido, mecanismos de hyper-connections y "sinks", un proyector indexador y un compresor de atención. Incluye además tres etapas MTP (multi-token prediction, denominadas DSpark), que habilitan decodificación especulativa de varios tokens por paso, y una torre de visión con su aligner, lo que confirma capacidades multimodales. Las tablas Engram de n-gramas en las capas 1 y 14 (en FP8) constituyen un componente adicional de recuperación/compresión de contexto.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) no hay datos disponibles en la información proporcionada. En cuanto a la cuantización, se generó con exllamav3 y su receta de autocuantización (SC), que eligió las tasas por capa para un objetivo de 2,8 bpw y alcanzó 2,813 bpw; la calibración usó una traza separada de 217 filas y el codebook empleado es MUL1.

## Capacidades

- Generación de texto y razonamiento: el conjunto de pruebas de qbench incluye conversaciones generales con razonamiento de esfuerzo medio.
- Tool calling / function calling: el 30 % de los prompts del conjunto de evaluación incluye uso de herramientas, lo que indica soporte de tool calling en el modelo base.
- Capacidades de visión: incluye torre de visión y aligner cuantizados a K6 (algunos tensores en BF16).
- Decodificación especulativa: tres etapas MTP incluidas en el pack, lo que permite generación multi-token.
- Ejecución con streaming de expertos desde SSD en Apple Silicon (128 GB de memoria unificada), gracias al bajo ancho de bits de los expertos enrutados.
- Soporte multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Ejecución local en Mac Studio de 128 GB: el pack está dimensionado explícitamente para transmitir los expertos enrutados desde SSD, permitiendo inferencia local de un MoE de gran escala sin servidores con cientos de GB de VRAM.
- Asistentes con herramientas en local: dado que el conjunto de evaluación incluye tool calling, es adecuado para agentes locales que invocan funciones (búsqueda, APIs, ejecución de código) manteniendo los datos en el dispositivo.
- Chatbot multimodal privado: la torre de visión incluida permite construir aplicaciones de chat con entrada de imágenes sin enviar datos a servicios externos.
- Generación de texto de alta calidad con bajo coste de almacenamiento: a 2,81 bpw con KLD equiparable a packs de 2,9 bpw, es apropiado para escritura creativa, resumen y redacción asistida donde el presupuesto de disco/memoria es limitado.
- Servidores de inferencia personales con mlx-serve: el autor prepara un repack de streaming para mlx-serve, orientado a servir el modelo por API en hardware Apple Silicon.
- Experimentación e investigación en cuantización: la documentación detallada de tasas por capa, codebook y métricas KLD lo hace útil como referencia para comparar recetas de cuantización EXL3 frente a EAQ u otras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sí se han publicado métricas de calidad de la cuantización (qbench de exllamav3, sobre 20 conversaciones retenidas con 7.109 tokens de prompt y 45.434 tokens de completión):

| | PPL | KLD mean | KLD median | KLD p90 |
|---|---|---|---|---|
| Release FP8/FP4 (referencia) | 1,7730 | | | |
| Suelo de ruido | 1,7733 | 0,0023 | 0,0002 | 0,0050 |
| Este pack (EXL3 2,81 bpw) | 1,8305 | 0,0396 | 0,0051 | 0,0917 |
| Mia-AiLab EXL3 EAQ v1 2,9 bpw | 1,8306 | 0,0401 | 0,0058 | 0,0893 |

Frente al pack EAQ de 2,9 bpw, la diferencia pareada por fila es de -0,00048 KLD (IC 95 %: -0,0025 a +0,0016), es decir, un empate estadístico ocupando aproximadamente un 2,7 % menos de bytes.

## Requisitos de hardware

- Tamaño del pack: 384 GiB en disco (308 GB según el tamaño de repo indicado por Hugging Face; la model card cifra 384 GiB con las tablas Engram incluidas). Los expertos enrutados ocupan 189,2 GB y las tablas Engram 202,8 GB.
- Objetivo de despliegue: Macs con 128 GB de memoria unificada (Apple Silicon), transmitiendo los expertos enrutados desde SSD. No está indicado que quepa en GPUs de consumidor convencionales (una RTX 4090 con 24 GB es insuficiente por varios órdenes de magnitud).
- GPU/servidor recomendados: no disponible explícitamente; para ejecución en GPU con exllamav3 se necesitaría una configuración multi-GPU con cientos de GB de VRAM o soporte de offload.
- Software: exllamav3, rama `dev` (commit `ccc4c21` o posterior), que es donde se añadió el soporte de DeepSeek-V4.1 y donde se convirtió el pack. Para Apple Silicon, está previsto un repack de streaming para mlx-serve (pendiente de publicación).
- Latencia y throughput: no disponible. Al depender del streaming de expertos desde SSD, el rendimiento estará condicionado por la velocidad de lectura del disco.

## Comparativa con modelos similares

| | Este pack (EXL3 2,81 bpw) | Mia-AiLab EXL3 EAQ v1 2,9 bpw | Packs anteriores de OpensourceWTF (repack 2,9 / 3,0 bpw, MTPLX q2) |
|---|---|---|---|
| Modelo base | DeepSeek-V4.1-Flash-1017 | DeepSeek-V4.1-Flash-1017 | DeepSeek-V4.1-Flash-1017 |
| Ancho de bits | 2,813 bpw | 2,9 bpw | 2,9 / 3,0 bpw / q2 |
| PPL (qbench) | 1,8305 | 1,8306 | no disponible |
| KLD mean | 0,0396 | 0,0401 | no disponible |
| Licencia | MIT | no disponible | no disponible |
| Disponibilidad | Publicado en Hugging Face | Publicado en Hugging Face | Sustituidos por este pack |

Otros modelos comparables de la misma categoría (MoE grandes cuantizados a ultra-baja precisión): no disponible.

## Limitaciones y advertencias

- Calidad de cuantización: a 2,81 bpw la degradación es medible (KLD mean 0,0396 frente a suelo de ruido de 0,0023); el p90 de KLD (0,0917) indica que algunas generaciones se desviarán más que la mediana. Es una cuantización agresiva, no apta si se necesita fidelidad máxima.
- Requisitos de almacenamiento: 384 GiB en disco, con los expertos leídos desde SSD en la configuración objetivo; un disco lento penalizará la latencia.
- Compatibilidad: requiere exllamav3 rama `dev` (commit `ccc4c21` o posterior); no funcionará con versiones estables anteriores ni con otras librerías (llama.cpp, vLLM, Ollama no se mencionan como compatibles).
- El repack para mlx-serve aún no está publicado, por lo que la ruta Apple Silicon no está operativa según la model card.
- Datos del modelo base (contexto, idiomas, parámetros, resultados de benchmarks) no disponibles en la información proporcionada: deben verificarse en la ficha del modelo original antes de usar en producción.
- Riesgo de alucinación y sesgos: inherentes al modelo base; no se documenta nada específico en la información disponible.
- Licencia: MIT, sin restricciones de uso comercial relevantes.

## Enlaces

- Ficha del pack cuantizado: https://huggingface.co/OpensourceWTF/DeepSeek-V4.1-Flash-1017-exl3-2.81bpw
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- exllamav3 (formato EXL3 y pipeline SC): https://github.com/turboderp-org/exllamav3
- Pack anterior 2,9 bpw: https://huggingface.co/OpensourceWTF/DeepSeek-V4.1-Flash-1017-streaming-repack-exl3-2.9bpw
- Pack anterior 3,0 bpw: https://huggingface.co/OpensourceWTF/DeepSeek-V4.1-Flash-streaming-repack-exl3-3.0bpw
- Pack anterior MTPLX q2: https://huggingface.co/OpensourceWTF/DeepSeek-V4.1-Flash-MTPLX-streaming-q2
- Paper, blog y demo del modelo base: no disponible
