# Akicou/Qwen3.8-27B-DFlash2-GGUF

## Resumen

Qwen3.8-27B-DFlash2-GGUF es una conversión al formato GGUF del modelo de borrador (draft model) DFlash 2, desarrollado por Inco AI y publicado originalmente como `incoai/Qwen3.8-27B-DFlash2`, con un espejo en `z-lab/Qwen3.8-27B-DFlash2`. Este modelo no es un modelo de lenguaje independiente: su función es acelerar la decodificación especulativa del modelo objetivo `Qwen/Qwen3.8-27B`, un LLM denso multimodal de 27 000 millones de parámetros de Alibaba. DFlash 2 predice bloques completos de tokens en una sola pasada y mantiene los mejores candidatos en cada posición, lo que permite verificar varios tokens por paso con el modelo grande y obtener una aceleración de 2,67x a 3,43x frente a la decodificación autoregresiva estándar, sin pérdida de calidad (decodificación lossless).

El modelo tiene aproximadamente 1,92 mil millones de parámetros, 5 capas con atención deslizante (ventana de 2048), un contexto de 262 144 tokens y un tamaño de bloque de especulación de 8 tokens (7 tokens de borrador por paso de verificación). Se distribuye en cuatro cuantizaciones GGUF (BF16, Q6_K, Q4_K_M y Q4_K_S) bajo licencia Apache-2.0. Su relevancia actual radica en que permite reducir la latencia de inferencia de Qwen3.8-27B en entornos de producción, especialmente en servidores con GPUs de alta gama o en hardware de consumo con cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash 2 (draft model para decodificacion especulativa) |
| Parametros totales | 1 924 404 480 (aproximadamente 1,92B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 262 144 |
| Tipos de cuantizacion | BF16, Q6_K, Q4_K_M, Q4_K_S |
| Idiomas soportados | No disponible (depende del modelo objetivo Qwen3.8-27B) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors no disponible en este repo) |

## Arquitectura y entrenamiento

DFlash 2 es un modelo de borrador basado en el paradigma de difusión de bloques (block diffusion). En lugar de generar token a token, predice un bloque completo de 8 tokens en una sola pasada y mantiene los mejores candidatos en cada posición. Un selector (con rango 256 y top-k 16) traza una única trayectoria a través de los candidatos. La arquitectura del backbone incluye convoluciones dinámicas de dos toques (kernel 2, grupo 16) que evitan la degradación de la calidad del borrador hacia el final del bloque. El modelo tiene 5 capas con atención deslizante (ventana 2048), hidden size 5120, 32 cabezas de consulta y 8 de clave/valor (dimensión de cabeza 128), feed-forward de 17408 y RoPE theta 10 000 000. Las capas objetivo (del modelo grande) que se utilizan para la verificación son las capas 5, 19, 33, 47 y 61.

No se han publicado detalles sobre el dataset de entrenamiento ni el proceso de optimización (RLHF, DPO, etc.) en la información disponible. La decodificación es lossless: la salida greedy coincide con la del modelo objetivo y el muestreo preserva su distribución. El modelo requiere el tokenizador del modelo objetivo, por lo que la conversión a GGUF se realizó con `--target-model-dir` apuntando a `Qwen/Qwen3.8-27B`.

## Capacidades

- Decodificacion especulativa: propone bloques de 8 tokens (7 tokens de borrador por paso de verificacion) que el modelo objetivo Qwen3.8-27B verifica en paralelo.
- Aceleracion de inferencia: consigue un speedup de 2,67x a 3,43x frente a decodificacion autoregresiva en tareas como GSM8K, MATH-500, HumanEval, MBPP y MT-Bench (medido con SGLang en una NVIDIA H200).
- Compatibilidad con llama.cpp: requiere un build con soporte DFlash 2 (PR #27342) y se activa con `--spec-type draft-dflash`.
- No es un modelo de generacion standalone: cargarlo sin el modelo objetivo produce el error `dflash requires ctx_other to be set`.
- No dispone de capacidades propias de tool calling, agentes, vision o audio; todas las capacidades funcionales provienen del modelo objetivo.

## Casos de uso

- Aceleracion de inferencia en produccion: desplegar Qwen3.8-27B con DFlash 2 como borrador en servidores con llama.cpp o SGLang reduce la latencia por peticion entre 2,5 y 3,5 veces, lo que permite servir mas peticiones concurrentes con la misma infraestructura.
- Reduccion de costes en GPU: al acelerar la generacion, se reduce el tiempo de ocupacion de GPUs de alta gama (H100, H200, A100), disminuyendo el coste por token servido en entornos cloud.
- Inferencia en hardware de consumo: con la cuantizacion Q4_K_S del borrador (1,02 GiB) y una cuantizacion del modelo objetivo, es posible ejecutar Qwen3.8-27B con decodificacion especulativa en GPUs de 24 GB (RTX 3090/4090) o incluso en Apple Silicon con 64 GB de RAM unificada.
- Integracion en pipelines de agentes: para aplicaciones de agente que requieren multiples pasos de razonamiento, la menor latencia por llamada mejora la experiencia de usuario en interacciones conversacionales largas.
- Evaluacion y testing de modelos: permite comparar el rendimiento de Qwen3.8-27B con y sin decodificacion especulativa para validar que la salida es identica (lossless) antes de desplegar en produccion.
- Despliegue en entornos con restricciones de memoria: al anadir solo 1,0-3,6 GiB de memoria adicional al modelo objetivo, es viable en servidores con VRAM limitada donde un borrador mas grande no cabria.

## Benchmarks y rendimiento

Los datos de rendimiento provienen de la model card de `z-lab/Qwen3.8-27B-DFlash2`. Se midieron con SGLang en una NVIDIA H200, FlashAttention 3, bloque de 8, temperatura 1.0, top-p 0.95, top-k 20. La longitud de aceptacion (acceptance length) es la media por peticion de tokens completados dividida por pasos de verificacion; mayor es mejor. Todos los metodos especulativos proponen 7 tokens por paso.

| Tarea | Qwen3.8 MTP integrado | DFlash 2 |
|---|---|---|
| GSM8K | 5,02 | 5,46 |
| MATH-500 | 4,72 | 5,28 |
| HumanEval | 3,91 | 4,39 |
| MBPP | 3,99 | 4,79 |
| MT-Bench | 3,74 | 4,10 |

A concurrencia 1, el speedup de throughput frente a decodificacion autoregresiva vario entre 2,67x y 3,43x en esas cinco tareas. El PR de llama.cpp reporta una longitud de aceptacion de 5,46 en GSM8K con Q4_K_M en un Apple M5 Pro con 64 GB, usando los primeros 8 problemas de GSM8K.

## Requisitos de hardware

- Memoria adicional del borrador: entre 1,0 GiB (Q4_K_S) y 3,6 GiB (BF16), que se suma a la memoria del modelo objetivo.
- GPU recomendadas: NVIDIA H200 (usada en las mediciones), H100, A100, RTX 4090 (24 GB) para el modelo objetivo cuantizado; Apple M5 Pro con 64 GB validado con llama.cpp.
- Compatibilidad con GPU de consumo: si, siempre que el modelo objetivo quepa en VRAM (por ejemplo, Qwen3.8-27B en Q4_K_M ocupa aproximadamente 16-18 GB, dejando espacio para el borrador).
- Opciones de despliegue: llama.cpp (llama-server o llama-cli) con `--spec-type draft-dflash` y `--spec-draft-n-max 7`; SGLang con soporte DFlash 2.
- Latencia y throughput: speedup de 2,67x a 3,43x frente a autoregresivo a concurrencia 1; no se proporcionan cifras absolutas de latencia o tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rol | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-DFlash2 (este) | 1,92B | 262 144 | Borrador especulativo para Qwen3.8-27B | Apache-2.0 | GGUF en HuggingFace |
| Qwen3.8-27B MTP integrado | No publicado | 262 144 | Decodificacion especulativa nativa del modelo objetivo | Apache-2.0 | Integrado en Qwen3.8-27B |
| EAGLE (referencia generica) | No disponible | No disponible | Borrador especulativo para otros LLMs | No disponible | No disponible en la informacion proporcionada |

DFlash 2 supera al MTP integrado de Qwen3.8-27B en longitud de aceptacion en todas las tareas evaluadas (por ejemplo, 5,46 frente a 5,02 en GSM8K). No se dispone de datos comparativos con otros borradores como EAGLE en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje independiente: cargarlo solo falla con el error `dflash requires ctx_other to be set`. Debe ejecutarse junto al modelo objetivo Qwen3.8-27B.
- Requiere un build especifico de llama.cpp: el soporte DFlash 2 no esta fusionado en master (a fecha de 19 de agosto de 2026); hay que usar el PR #27342 o una version posterior. Los binarios oficiales rechazaran las claves de arquitectura `dflash` hasta que el PR se publique.
- Datos de entrenamiento no disponibles: no se ha publicado informacion sobre el dataset, el numero de tokens de entrenamiento ni el proceso de alineacion.
- Dependencia del modelo objetivo: el rendimiento de la decodificacion especulativa depende de la calidad del borrador y de la coincidencia con el modelo objetivo; cambios en el modelo objetivo pueden requerir reentrenar el borrador.
- Sesgos y alucinaciones: al ser un modelo auxiliar, no introduce sesgos propios, pero hereda las limitaciones del modelo objetivo (Qwen3.8-27B), incluyendo posibles sesgos y riesgo de alucinacion en la generacion final.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo objetivo Qwen3.8-27B tambien es Apache-2.0, por lo que no hay restricciones adicionales conocidas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Akicou/Qwen3.8-27B-DFlash2-GGUF
- Modelo original (espejo): https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Modelo original (Inco AI): https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog de DFlash 2: https://inco.ai/blog/dflash2/
- Codigo de referencia: https://github.com/z-lab/dflash
- PR de llama.cpp para DFlash 2: https://github.com/ggml-org/llama.cpp/pull/27342
- Repositorio de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
