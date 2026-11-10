# Elonmsk/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16

## Resumen

NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 es la publicacion en precision completa (BF16) del modelo Nemotron 3.5 Lightning de NVIDIA, un LLM de arquitectura hibrida Mixture-of-Experts con 30 mil millones de parametros totales y 3 mil millones activos por token. Combina capas Mamba-2 intercaladas con capas MoE y capas de atencion selectivas, lo que permite un coste computacional por token muy inferior al de un transformer denso del mismo tamano. Esta version concreta es el checkpoint de referencia, pensado como punto de partida para post-entrenamiento (SFT, RL, destilacion), adaptacion de dominio y generacion de variantes cuantizadas o GGUF.

El modelo esta disenado para despliegue en una sola GPU de 80 GB (H100 o A100) con una ventana de contexto operativa de 256K tokens, ampliable hasta 1M tokens en configuraciones multi-GPU o en hardware Blackwell. Soporta seis idiomas (ingles, espanol, frances, aleman, italiano y japones) y dispone de un modo de razonamiento configurable mediante la plantilla de chat. Su relevancia actual radica en que ofrece pesos abiertos de referencia con licencia OpenMDW 1.1, lo que facilita tanto la investigacion a precision completa como la produccion de derivados optimizados.

NVIDIA publica en paralelo una version NVFP4 orientada a inferencia de baja latencia y un checkpoint GGUF para dispositivos locales, de modo que este repositorio BF16 debe entenderse como la base canonica del modelo y no como el artefacto recomendado para servir en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida: Mamba-2 + MoE + capas de atencion intercaladas (familia `nemotron_h`) |
| Parametros totales | 31.577.937.344 (aproximadamente 30B) |
| Parametros activos | 3B por token |
| Longitud de contexto | Hasta 1M tokens; 256K validados en una sola H100 80 GB |
| Tipos de cuantizacion | BF16 (pesos de referencia); NVFP4 y W4A16 publicados en repositorios separados; GGUF disponible por ggml-org |
| Idiomas soportados | Ingles (y lenguajes de programacion), espanol, frances, aleman, italiano, japones |
| Licencia | OpenMDW License Agreement 1.1 |
| Formato de pesos | safetensors (BF16), libreria transformers |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura hibrida en la que se intercalan capas Mamba-2 (modelo de espacio de estados) con capas de mezcla de expertos y un numero selecto de capas de atencion. Este diseno reduce el coste de inferencia en contextos largos frente a un transformer denso, ya que solo 3B de los 30B parametros se activan por token y las capas de estado recurrente evitan el crecimiento cuadratico del coste de atencion. La ventana de contexto nominal alcanza 1M tokens, aunque en una unica H100 de 80 GB el limite practico validado es de 256K por restricciones de memoria.

El entrenamiento se apoyo en los conjuntos de datos `nvidia/nemotron-pre-training-datasets` (corte de septiembre de 2025) y `nvidia/nemotron-post-training-v3` (corte de mayo de 2026). El desarrollo del modelo abarca de diciembre de 2025 a mayo de 2026. La model card no detalla el volumen exacto de tokens de pre-entrenamiento ni la composicion porcentual del dataset, ni especifica si se aplicaron tecnicas concretas de RLHF o DPO mas alla de la existencia de una fase de post-entrenamiento. Como innovacion destacable, NVIDIA publica junto al modelo metodos de decodificacion especulativa, en particular DSpark para despliegues de centro de datos con baja concurrencia, orientados a reducir la latencia de generacion. La temperatura de muestreo recomendada es 1.0 con top_p 0.95.

## Capacidades

- Generacion de texto conversacional multi-turno en seis idiomas.
- Razonamiento configurable: el modo de pensamiento se activa o desactiva mediante `enable_thinking=True/False` en la plantilla de chat.
- Generacion de codigo y soporte de lenguajes de programacion, segun la model card.
- Capacidad de contexto largo: hasta 256K tokens en una sola GPU de 80 GB y hasta 1M en configuraciones multi-GPU o Blackwell.
- Orientado a personalizacion: sirve como base para SFT, RL, destilacion y adaptacion de dominio.
- Produccion de variantes cuantizadas propias (NVFP4, W4A16, GGUF) a partir de los pesos de referencia.
- Evaluacion e investigacion a precision completa.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling, agentes multi-paso, vision o audio.

## Casos de uso

- Post-entrenamiento supervisado (SFT): partir de los pesos BF16 de referencia para ajustar el modelo a un dominio concreto (legal, sanitario, financiero) sin degradar la precision numerica durante el entrenamiento.
- Destilacion de modelos mayores: utilizar los 30B totales con 3B activos como profesor o alumno en pipelines de destilacion, aprovechando la precision completa para evitar acumulacion de error.
- Generacion de variantes cuantizadas: producir checkpoints NVFP4, W4A16 o GGUF propios a partir de los pesos BF16, ya que la model card indica explicitamente este uso como proposito principal del repositorio.
- Investigacion en arquitecturas hibridas: estudiar el comportamiento de capas Mamba-2 intercaladas con MoE y atencion en tareas de contexto largo, con acceso a los pesos sin cuantizar.
- Analisis de documentos extensos: procesar hasta 256K tokens en una sola H100 para resumen, extraccion de entidades o respuesta a preguntas sobre corpus largos, aprovechando el coste reducido por token del esquema MoE.
- Evaluacion comparativa de referencia: emplear el checkpoint BF16 como linea base contra la version NVFP4 para medir la perdida de calidad introducida por la cuantizacion en tareas concretas.
- Despliegue en centro de datos con baja concurrencia: servir el modelo con decodificacion especulativa DSpark en vLLM o SGLang para reducir latencia en cargas interactivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una grafica (`accuracy_plot.png`) sin valores numericos asociados en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 63 GB solo para pesos (31.577.937.344 parametros x 2 bytes), mas overhead de KV cache y activaciones; el repositorio ocupa 65,8 GB.
- GPU validadas: NVIDIA Blackwell (GB200, B200), NVIDIA Hopper (H100, H200) y NVIDIA Ampere (A100).
- Despliegue en una sola GPU: 1x H100 80 GB o 1x A100 80 GB, con contexto validado de 256K tokens por limite de memoria.
- Contexto de 1M tokens: requiere GB200, B200 o 8x H100 con TP8 y EP en vLLM.
- No cabe en GPUs de consumo en BF16; para RTX 5090, DGX Spark o RTX 6000 Pro debe usarse el checkpoint GGUF de ggml-org o la version NVFP4.
- Opciones de despliegue documentadas: vLLM (probado con `vllm/vllm-openai:v0.27.1`) y SGLang; configuracion recomendada con `--max-num-seqs 128`, `--enable-prefix-caching` y `--async-scheduling`.
- Latencia y throughput: no disponibles en la informacion proporcionada; la model card menciona DSpark como estrategia para mejorar latencia en baja concurrencia sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 | 30B / 3B | Hasta 1M (256K en 1x H100) | OpenMDW 1.1 | Pesos BF16 en Hugging Face; NVFP4 y GGUF en repos separados |
| NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4 | 30B / 3B | No disponible en la informacion proporcionada | OpenMDW 1.1 | Version cuantizada del mismo modelo, orientada a inferencia optimizada |
| NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF (ggml-org) | 30B / 3B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Formato GGUF para dispositivos locales (RTX 5090, DGX Spark, RTX 6000 Pro) |

No se dispone de datos de benchmarks ni de especificaciones de modelos de otros fabricantes en la informacion proporcionada para establecer una comparacion cuantitativa adicional.

## Limitaciones y advertencias

- Pesos de referencia en BF16: no es la version recomendada para servir en produccion; para latencia y throughput debe usarse la variante NVFP4 o GGUF.
- Contexto de 1M tokens no validado en una sola GPU Hopper: en H100 80 GB el limite practico es 256K tokens.
- Riesgo de alucinacion: no se documenta en la informacion disponible ninguna evaluacion especifica de tasas de alucinacion.
- Sesgos: la model card no incluye una seccion de sesgos conocidos ni evaluaciones de seguridad en la informacion proporcionada.
- Cobertura idiomatica limitada a seis idiomas; el rendimiento fuera de ellos no esta documentado.
- La licencia OpenMDW 1.1 permite uso comercial segun la model card ("ready for commercial use"), pero conviene revisar los terminos completos del acuerdo antes de desplegar.
- No se documenta soporte de tool calling, agentes o modalidades no textuales; no debe asumirse su disponibilidad sin verificar la plantilla de chat.
- El repositorio pertenece a la cuenta `Elonmsk`, no a la organizacion oficial `nvidia`; conviene contrastar la integridad de los pesos con el repositorio oficial antes de usarlos en produccion.
- Fechas de corte de datos: pre-entrenamiento septiembre de 2025, post-entrenamiento mayo de 2026; el conocimiento del modelo no cubre eventos posteriores.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Elonmsk/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Version NVFP4: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Checkpoint GGUF: https://huggingface.co/ggml-org/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF
- Demo en NVIDIA Build: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b
- Pagina de desarrollador Nemotron: https://developer.nvidia.com/nemotron
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Texto de la licencia OpenMDW 1.1: https://raw.githubusercontent.com/OpenMDW/OpenMDW/refs/heads/main/1.1/LICENSE.OpenMDW-1.1
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
