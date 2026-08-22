# esatapedico/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NVFP4-GGUF

## Resumen

Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NVFP4-GGUF es una familia de seis archivos GGUF que cuantiza el modelo Qwen3.8-27B-Cold-Fusion-GAIN-V1.1, un ajuste fino de 27 000 millones de parámetros desarrollado por DavidAU sobre la base Qwen3.8-27B de Alibaba. El modelo original combina la técnica de entrenamiento Cold Fusion (GAIN + Unsloth), que reduce los tokens de pensamiento hasta en un 90 % respecto a los modelos Qwen estándar, manteniendo el 99 % del rendimiento en BF16 incluso en cuantizaciones de 4 bits. Esta versión en GGUF, publicada por esatapedico, convierte el checkpoint NVFP4 de windowsxp811203 y ofrece seis niveles de precisión para las cabezas de salida (lm_head, embedding y MTP), manteniendo un backbone NVFP4 idéntico en todos ellos.

El modelo destaca por su arquitectura híbrida: solo 16 de las 64 capas usan atención completa, mientras que las otras 48 usan atención lineal recurrente (Gated DeltaNet), lo que reduce el coste computacional y permite un contexto nativo de 262 000 tokens. Además, incorpora una cabeza de decodificación especulativa MTP (Multi-Token Prediction) integrada, que acelera la generación sin necesidad de un modelo auxiliar. La licencia Apache-2.0 permite uso comercial sin restricciones. Esta versión GGUF está optimizada para hardware Blackwell (sm_120) con instrucciones NVFP4, y requiere un adaptador de visión externo para capacidades multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet (atención lineal recurrente) + Gated Attention (16 de 64 capas) |
| Parametros totales | 27 320 698 112 (27,32 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (nativo) |
| Tipos de cuantizacion | NVFP4 (backbone de 448 tensores), cabezas en Q2_K, Q3_K, Q5_0, Q6_K, Q8_0, IQ4_XS o BF16 según el tier |
| Idiomas soportados | Ingles, multilingue (incluye espanol, frances, aleman, etc.) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida de atención: 16 capas con atención completa (full attention) y 48 capas con atención lineal recurrente basada en Gated DeltaNet, que mantiene un estado recurrente constante y reduce el coste de memoria de KV cache. El contexto nativo es de 262 144 tokens. El tune de DavidAU aplica el metodo Cold Fusion, que combina la tecnica GAIN (interna) con la infraestructura de Unsloth para reducir los tokens de razonamiento (thinking tokens) a una fraccion de los de Qwen estándar, sin sacrificar rendimiento. La cuantizacion NVFP4 (grupo de 16, escalas fp8-e4m3) se aplica a todas las capas lineales, mientras que la torre de vision, el camino de atencion lineal, el lm_head, las embeddings y la cabeza MTP se mantienen en BF16 en la version original. La conversion a GGUF normalizo el backbone a 448 tensores NVFP4 identicos en todos los archivos, y cada tier varia solo la precision de las cabezas.

## Capacidades

- Generacion de texto, razonamiento y analisis con reduccion de tokens de pensamiento (hasta 1/10 del coste de Qwen base).
- Razonamiento paso a paso y resolucion de problemas matematicos y logicos.
- Generacion de codigo, soporte de tool calling y function calling (integrado en el modelo base Qwen3.8).
- Capacidades multimodales (vision) cuando se combina con el proyector `mmproj-BF16.gguf` del autor original.
- Decodificacion especulativa MTP integrada: no requiere drafter externo, usa `--spec-type draft-mtp`.
- Multilingue, con buen desempeno en ingles, chino y otros idiomas.
- Contexto largo de 262K tokens, adecuado para analisis de documentos extensos.

## Casos de uso

- Atencion al cliente automatizada: con contexto de 262K tokens, puede gestionar conversaciones multi-turno con historial largo y documentos de referencia sin perder informacion.
- Generacion de codigo en produccion: soporta tool calling y puede integrarse en pipelines de CI/CD para autocompletado, revision de codigo y generacion de tests.
- Razonamiento matematico y cientifico: gracias a su entrenamiento con Cold Fusion, produce respuestas mas directas y con menos tokens de reflexion, lo que reduce la latencia en aplicaciones de calculo.
- Analisis de documentos legales y academicos: la ventana de 262K permite procesar informes extensos, contratos o articulos de investigacion completos en una sola pasada.
- Asistentes virtuales con vision: al anadir el proyector de vision, puede interpretar imagenes y diagramas, util en entornos de soporte tecnico o educativos.
- Despliegue en hardware de consumo: con el tier MEDIUM de 16,38 GB cabe en GPU de 16 GB (como RTX 4060 Ti o 5070 Ti), lo que permite ejecutar un modelo de 27B con cuantizacion NVFP4 en una estacion de trabajo.
- Decodificacion especulativa en servidores: la cabeza MTP integrada acelera la inferencia sin necesidad de un modelo drafter separado, ideal para entornos de produccion con alto throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) para esta cuantizacion concreta en la informacion disponible. Sin embargo, el autor de la conversion proporciona observaciones de rendimiento y perplejidad (PPL) en un dataset de prueba, comparando los seis tiers:

| Tier | Perplexidad (source-diverse.txt) | pp512 tok/s | tg128 tok/s |
|---|---|---|---|
| VERY-LOW | 4.73 | 1844 | 32.2 |
| LOW | 4.65 | 1840 | 31.5 |
| MEDIUM | 4.65 | 1863 | 30.7 |
| MID-HIGH | 4.61 | 1830 | 30.5 |
| HIGH | 4.65 | 1856 | 28.2 |
| VERY-HIGH | 4.65 | 1864 | 28.2 |

Estas cifras son de una sola ejecucion en una configuracion con dos GPU RTX 5070 Ti y RTX 5060 Ti (tensor split). La perplejidad se mantiene dentro de un 2.6 % entre tiers, y la velocidad de decodificacion depende de la precision de la cabeza (mayor precision en la cabeza implica menor velocidad de tokens por segundo).

## Requisitos de hardware

- VRAM estimada: entre 14.86 GB (tier VERY-LOW) y 19.69 GB (tier VERY-HIGH) para el modelo completo. Con el proyector de vision adicional, se necesita un margen adicional.
- GPU compatibles: el modelo esta optimizado para arquitectura Blackwell (sm_120), por lo que requiere GPU RTX 50 series (5070 Ti, 5060 Ti, 5090) o datacenter Blackwell (B200, B300). No funciona en Ampere o anteriores con instrucciones NVFP4.
- Configuracion multi-GPU: es posible usar tensor split entre dos GPU de 16 GB (p. ej., RTX 5070 Ti + 5060 Ti) para los tiers mas grandes.
- Despliegue: se usa con llama.cpp o llama-bench; no es compatible con vLLM o TGI (por el momento).
- Latencia: en la prueba de referencia, la generacion de tokens (tg128) alcanza entre 28 y 32 tokens por segundo en configuracion dual-GPU. La velocidad de procesamiento de prompt (pp512) es de 1830-1864 tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Cuantizacion | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27.32 B | 262K | Híbrida (Gated DeltaNet + Gated Attention) | BF16, FP8 | Apache-2.0 |
| Qwen3.8-27B-Cold-Fusion-GAIN-V1.1 (original) | 27.32 B | 262K | Híbrida + Cold Fusion | BF16, FP8 | Apache-2.0 |
| Qwen3.8-27B-NVFP4-GGUF (este modelo) | 27.32 B | 262K | Híbrida + MTP integrada | NVFP4 (GGUF) | Apache-2.0 |
| Qwen3.5-27B (version anterior) | 27 B | 128K | Dense | FP16 | Apache-2.0 |

No se dispone de benchmarks publicos comparativos entre este modelo y sus alternativas en la informacion proporcionada. El modelo original afirma superar los benchmarks de Qwen3.8, 3.6 y 3.5 de 27B en tareas de razonamiento, pero no se citan cifras concretas.

## Limitaciones y advertencias

- Requiere hardware Blackwell (sm_120) para usar la cuantizacion NVFP4; no es compatible con GPU de generaciones anteriores (RTX 40, A100, etc.).
- La cuantizacion NVFP4 esta optimizada para NVIDIA, no es portable a otros proveedores (AMD, Intel).
- No incluye la torre de vision; para uso multimodal hay que descargar el proyector `mmproj-BF16.gguf` del autor original.
- El modelo es un tune de Cold Fusion que reduce tokens de pensamiento; en tareas que requieren razonamiento profundo puede generar respuestas menos detalladas que el Qwen base.
- No se han publicado evaluaciones de sesgos o alucinaciones para esta version especifica.
- La licencia Apache-2.0 permite uso comercial, pero es responsabilidad del usuario verificar el cumplimiento de las politicas de los modelos base (Qwen3.8).
- Los archivos GGUF de este repositorio son conversiones tecnicas; el autor recomienda revisar el modelo original para documentacion completa.

## Enlaces

- [Repositorio HuggingFace de este modelo](https://huggingface.co/esatapedico/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NVFP4-GGUF)
- [Modelo base original de DavidAU](https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1)
- [Checkpoint NVFP4 de windowsxp811203](https://huggingface.co/windowsxp811203/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NVFP4)
- [GGUF con proyector de vision de DavidAU](https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NM-DAU-NEO-MAX-MTP-GGUF)
- [Modelo base Qwen3.8-27B de Alibaba](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Receta vLLM para Qwen3.8-27B](https://recipes.vllm.ai/Qwen/Qwen3.8-27B)
- [Articulo de HackerNoon sobre Cold Fusion](https://hackernoon.com/qwen38-27b-cold-fusion-cuts-thinking-tokens-without-sacrificing-performance)
