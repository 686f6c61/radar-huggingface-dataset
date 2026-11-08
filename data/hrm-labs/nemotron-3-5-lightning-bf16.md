# hrm-labs/Nemotron-3.5-Lightning-BF16

## Resumen

NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 es la publicacion en precision completa (BF16) del modelo Nemotron 3.5 Lightning de NVIDIA, un LLM de proposito general orientado a razonamiento y conversacion. Se trata de un modelo Mixture-of-Experts (MoE) con 30.000 millones de parametros totales y 3.000 millones de parametros activos por token, construido sobre una arquitectura hibrida que intercala capas Mamba-2, capas MoE y capas de atencion selectivas. El checkpoint subido a Hugging Face por `hrm-labs` reproduce los pesos de referencia del modelo original de NVIDIA.

La relevancia de esta variante BF16 es que constituye el punto de partida canonico para personalizacion: ajuste fino supervisado (SFT), RL (via NeMo RL y NeMo Gym), destilacion, adaptacion de dominio y generacion de variantes cuantizadas o GGUF. NVIDIA recomienda explicitamente esta version para entrenamiento e investigacion a precision completa, y dirige a la release NVFP4 para despliegue en produccion con latencia y throughput optimizados.

El modelo declara soporte de contexto de hasta 1 millon de tokens en configuraciones multi-GPU (Blackwell GB200/B200 y H100 en TP8 + EP), mientras que en una unica H100 80 GB el contexto validado queda limitado a 256K por restricciones de memoria. Soporta seis idiomas (ingles, espanol, frances, aleman, italiano y japones) y se distribuye bajo licencia OpenMDW 1.1, con uso comercial permitido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida: Mamba-2 + MoE + capas de atencion intercaladas (familia `nemotron_h`) |
| Parametros totales | 31.577.937.344 (~30B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | Hasta 1M tokens (GB200, B200, H100 8x TP8+EP); 256K validado en 1x H100 80GB |
| Tipos de cuantizacion | BF16 (referencia); NVFP4 y W4A16 publicadas en release aparte; GGUF disponible via `ggml-org` |
| Idiomas soportados | Ingles (y lenguajes de programacion), espanol, frances, aleman, italiano, japones |
| Licencia | OpenMDW 1.1 (`license: other`, `license_name: openmdw-1.1`) |
| Formato de pesos | safetensors (BF16); repo de 65,8 GB |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura hibrida Mixture-of-Experts que combina capas Mamba-2 (modelo de espacio de estados) con capas MoE y un numero reducido de capas de atencion. Esta mezcla busca reducir el coste computacional y de memoria del mecanismo de atencion clasico en contextos muy largos, manteniendo capacidad de recuperacion de informacion mediante las capas de atencion selectivas. Con 30B parametros totales pero solo 3B activos por token, el coste de inferencia se aproxima al de un modelo denso de 3B, lo que explica su encaje en una unica H100 80GB a BF16.

Los datos de entrenamiento provienen de los conjuntos publicados por NVIDIA: `nvidia/nemotron-pre-training-datasets` (fecha de corte septiembre de 2025) y `nvidia/nemotron-post-training-v3` (corte mayo de 2026). El desarrollo del modelo abarca de diciembre de 2025 a mayo de 2026. La model card menciona post-entrenamiento con SFT y RL, y la existencia de recetas propias (NeMo RL, NeMo Gym) para reproducir o extender el entrenamiento. Como innovacion destacable, NVIDIA publica junto al modelo metodos de decodificacion especulativa, en concreto DSpark para despliegues de centro de datos con baja concurrencia, y ofrece un modo de razonamiento configurable mediante la plantilla de chat (`enable_thinking=True/False`). El muestreo recomendado es temperatura 1.0 y top_p 0.95.

## Capacidades

- Generacion de texto conversacional multi-turno en seis idiomas.
- Razonamiento con modo "thinking" activable o desactivable por plantilla de chat.
- Generacion de codigo y soporte de lenguajes de programacion (declarado junto al ingles).
- Capacidad de contexto extremadamente largo: hasta 1M tokens en hardware Blackwell o H100 multi-GPU.
- Inferencia eficiente gracias a los 3B parametros activos, con decodificacion especulativa DSpark para baja concurrencia.
- Base para post-entrenamiento: SFT, RL (NeMo RL, NeMo Gym) y destilacion.
- Punto de partida para producir variantes cuantizadas (NVFP4, W4A16, GGUF).
- Soporte de despliegue via vLLM y SGLang con recetas oficiales.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; el pipeline es `text-generation`.

## Casos de uso

- Ajuste fino supervisado (SFT) sobre dominio propio: al ser los pesos de referencia a BF16, es el checkpoint adecuado para entrenar con datos propios sin arrastrar errores de cuantizacion, usando NeMo o frameworks estandar de transformers.
- RL y destilacion: NVIDIA documenta recetas con NeMo RL y NeMo Gym, de modo que equipos de investigacion pueden aplicar RLHF/RLVR o destilar el modelo en variantes mas pequenas partiendo de esta release.
- Generacion de variantes cuantizadas: el BF16 sirve como fuente para producir NVFP4, W4A16 o GGUF, que es precisamente el flujo que NVIDIA describe hacia sus releases optimizadas.
- Analisis de documentos muy largos: con contexto validado de 256K en una H100 y hasta 1M en configuraciones multi-GPU, permite resumir, extraer y razonar sobre corpus extensos (contratos, codebases, informes) en una sola pasada.
- Investigacion y evaluacion a precision completa: util para reproducir benchmarks y estudiar el comportamiento del modelo sin los sesgos introducidos por la cuantizacion.
- Atencion al cliente multilinguee en prototipos: el soporte de espanol, frances, aleman, italiano y japones permite validar flujos conversacionales antes de migrar a la version NVFP4 en produccion.
- Asistentes de codigo en fase de experimentacion: la ventana de contexto larga y el modo thinking permiten probar agentes que razonan sobre repositorios completos antes de optimizar el despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una grafica (`accuracy_plot.png`) sin cifras textuales en el material proporcionado, por lo que no se reproducen numeros.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 63 GB solo para pesos (31,6B parametros x 2 bytes), mas overhead de KV cache y activaciones; encaja en 80 GB con contexto moderado.
- GPU validadas segun la model card:
  - Blackwell GB200 con vLLM (+ DSpark): contexto 1M.
  - Blackwell B200 con SGLang (balanced): contexto 1M.
  - Hopper H100 80GB unica con vLLM o SGLang: contexto 256K (limitado por memoria).
  - Hopper H100 8x con TP8 + EP y vLLM: contexto 1M.
  - Ampere A100 80GB: soportada como hardware compatible.
- GPU de consumo: no cabe en BF16 en RTX 4090 (24 GB). Para RTX 5090, DGX Spark o RTX 6000 Pro, NVIDIA remite al checkpoint GGUF de `ggml-org` y a la receta DSpark de la release NVFP4.
- Opciones de despliegue: vLLM (`vllm/vllm-openai:v0.27.1`), SGLang, y llama.cpp/Ollama a traves del GGUF publicado por separado. La model card incluye parametros recomendados como `--max-num-seqs 128`, `--enable-prefix-caching` y `--async-scheduling`.
- Latencia y throughput: no disponibles en la informacion proporcionada; NVIDIA remite a la release NVFP4 para cifras optimizadas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Nemotron-3.5-Lightning-30B-A3B-BF16 | ~30B | ~3B | 256K (1 GPU) / 1M (multi-GPU) | OpenMDW 1.1 | Release BF16 de referencia para post-entrenamiento |
| Nemotron-3.5-Lightning-30B-A3B-NVFP4 | ~30B | ~3B | 1M (segun hardware) | OpenMDW 1.1 | Misma familia, cuantizada para inferencia optimizada |
| Nemotron-3.5-Lightning-30B-A3B-GGUF | ~30B | ~3B | no disponible | OpenMDW 1.1 | Variante para hardware local (RTX 5090, DGX Spark, RTX 6000 Pro) |
| Otros MoE de ~30B con ~3B activos | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de terceros en la informacion proporcionada |

## Limitaciones y advertencias

- Esta release BF16 esta pensada para personalizacion y post-entrenamiento, no como endpoint de produccion; NVIDIA recomienda la NVFP4 para servir con latencia y throughput optimizados.
- El contexto de 1M solo esta validado en GB200, B200 y H100 8x; en una unica H100 80GB el limite practico es 256K.
- El modelo no cabe en GPUs de consumo en BF16; requiere cuantizacion (GGUF o NVFP4) para RTX 5090 o similares.
- Riesgo de alucinacion inherente a los LLM: no se documentan tasas especificas en la informacion disponible.
- Sesgos conocidos: no documentados en el material proporcionado; deben evaluarse sobre los datasets de pre-entrenamiento y post-entrenamiento de NVIDIA.
- Cobertura idiomatica limitada a seis idiomas declarados; el rendimiento fuera de ellos no esta garantizado.
- La licencia OpenMDW 1.1 permite uso comercial segun la model card, pero conviene revisar los terminos completos del acuerdo antes de desplegar.
- El repositorio `hrm-labs/Nemotron-3.5-Lightning-BF16` es una reproduccion de terceros (0 descargas, 0 likes en el momento de la consulta); para referencia oficial debe usarse el repositorio de NVIDIA.
- No se documentan capacidades de tool calling ni multimodales en la informacion disponible.

## Enlaces

- Repositorio consultado: https://huggingface.co/hrm-labs/Nemotron-3.5-Lightning-BF16
- Repositorio oficial NVIDIA BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Release NVFP4: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Checkpoint GGUF: https://huggingface.co/ggml-org/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF
- Pagina de desarrollador Nemotron: https://developer.nvidia.com/nemotron
- Demo en NVIDIA Build: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Texto de la licencia: https://raw.githubusercontent.com/OpenMDW/OpenMDW/refs/heads/main/1.1/LICENSE.OpenMDW-1.1
- Discord NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
