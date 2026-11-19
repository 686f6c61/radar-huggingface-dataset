# akshay42/Hy4-flash

## Resumen

Hy4-flash es un modelo de lenguaje multimodal desarrollado por Tencent Hunyuan, publicado originalmente en el repositorio oficial `tencent/Hy4-flash` y redistribuido en el espacio `akshay42/Hy4-flash`. Se trata de un transformer de tipo Mixture-of-Experts (MoE) con 220.251 millones de parametros totales segun los pesos en safetensors, de los cuales solo 12B se activan por token (11,3B de texto mas 0,43B de vision). Acepta entradas de texto e imagen y genera texto, con una ventana de contexto de hasta 1.048.576 tokens.

El modelo se presenta como la variante mas eficiente en coste de la familia Hy, orientada a despliegues de produccion donde el coste por token es critico. Incorpora tres innovaciones arquitectonicas respecto a Hy4: atencion hibrida que intercala atencion dispersa (IndexPool) y sliding-window attention en proporcion 1:3, LatentMoE con expertos en espacio latente de baja dimension, y embeddings de n-gramas (Engram) recuperados mediante hash multibyte.

Su relevancia actual radica en la combinacion de un contexto de 1M tokens con un coste de activacion reducido (12B) y decodificacion especulativa integrada mediante un drafter DFly2 de 0,85B parametros que reutiliza la cache KV del modelo objetivo. La licencia es propietaria (Tencent Hy License), lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atencion hibrida (dispersa + SWA) y MLA |
| Parametros totales | 220.251.201.958 (220,25B) |
| Parametros activos | 11,3B texto + 0,43B vision por token |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | no disponible (existe version GGUF en `AngelSlim/Hy4-flash-GGUF`, sin detalle de tipos) |
| Idiomas soportados | no disponible |
| Licencia | Tencent Hy License (propietaria, `license: other`) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El backbone linguistico consta de 42 capas: una capa densa con FFN de 13.824 dimensiones intermedias y 41 capas MoE. Cada capa MoE dispone de 512 expertos enrutados mas un experto compartido, activando 16 expertos enrutados por token. Los expertos operan en un espacio latente de 1.536 dimensiones (LatentMoE), lo que reduce el coste computacional frente a expertos de dimension completa. El tamano oculto es de 3.072 y el vocabulario de 120.832 tokens. Las conexiones residuales usan iHC (identity Hyper-Connections) con 4 flujos residuales.

La atencion es hibrida: 12 capas usan atencion dispersa con seleccion de contexto de hasta 2.048 tokens mediante seleccion a nivel de grupo, y 30 capas usan sliding-window attention con ventana causal de 512 tokens. El patron de capas es 2 dispersas seguidas de 10 bloques de (3 SWA + 1 dispersa). La formulacion es Multi-head Latent Attention (MLA) con q_lora_rank 1.024 y kv_lora_rank 512, con RoPE base 10.000.000 en capas dispersas y 10.000 en SWA. El codificador visual, adaptado de SigLIP2-So400m-Patch16-Res512, tiene 27 capas, tamano oculto 1.152, 16 cabezas de atencion, parches de 16x16 y fusion de caracteristicas visuales 2x2, conectado al backbone mediante un proyector MLP.

Los embeddings Engram (63,5B parametros) anaden representaciones aprendidas de bigramas y trigramas recuperadas mediante busquedas hash multi-cabeza (8 cabezas por orden, vocabulario hash de 10,3M por cabeza, dimension de 768 por orden). Se insertan en las capas 1, 11, 21 y 31. El drafter DFly2 (0,85B parametros, 5 capas) permite decodificacion especulativa reutilizando la cache KV e indices dispersos del modelo objetivo. No se dispone de informacion sobre el volumen de tokens de entrenamiento, composicion del dataset ni si se aplico RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento con contexto de hasta 1M tokens.
- Entrada multimodal de imagen y texto (pipeline `image-text-to-text`).
- Generacion de codigo y tareas de agente (validado en el model card con BPB en code & agent).
- Soporte de tool calling y function calling mediante API compatible con OpenAI.
- Razonamiento multi-paso y uso como agente, segun los tags `instruct` y `conversational`.
- Decodificacion especulativa integrada con DFly2 para reducir latencia en contexto largo.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con historiales extensos gracias a su ventana de 1M tokens, manteniendo contexto de interacciones previas sin truncamiento.
- Analisis de documentos largos con imagenes: al aceptar entrada image-text-to-text, puede procesar informes, contratos o manuales con figuras y tablas, resumiendo o extrayendo informacion en una sola pasada.
- Generacion de codigo en produccion: soporta tool calling y API compatible con OpenAI, lo que permite integrarlo en pipelines de CI/CD para revision de codigo, generacion de tests o correccion automatica.
- Agentes autonomos multi-paso: la combinacion de contexto largo, tool calling y decodificacion especulativa lo hace adecuado para agentes que encadenan decenas de llamadas a herramientas sin perder el hilo.
- Procesamiento de imagenes medicas o tecnicas: el codificador SigLIP2 con fusion 2x2 permite tareas de captioning y VQA sobre imagenes de alta resolucion (parches 16x16, posicion 128x128).
- Despliegue en inferencia de alto rendimiento: con vLLM o SGLang y cuantizacion, el coste por token es bajo (12B activos) para servir cargas concurrentes con contexto largo.
- Analisis de codigo en repositorios: con 1M de contexto puede ingerir repositorios completos para tareas de refactorizacion, busqueda semantica o deteccion de vulnerabilidades.

## Benchmarks y rendimiento

El model card menciona resultados de bits-per-byte (BPB) en validacion interna de codigo y agente, pero los valores numericos no estan disponibles en la informacion proporcionada (la imagen `pretrained-model-bpb.png` no se ha podido leer). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 440 GB solo para pesos, lo que exige multiples GPU (8x H100 80GB o 8x A100 80GB como minimo).
- Cuantizacion: existe version GGUF en `AngelSlim/Hy4-flash-GGUF`, pero no se detallan los tipos ni los requisitos de VRAM resultantes.
- GPU recomendadas: H100 80GB, A100 80GB, H200; no cabe en GPU consumer (RTX 4090 24GB) en precision completa.
- Opciones de despliegue: vLLM, SGLang, transformers, API compatible con OpenAI; llama.cpp/Ollama via GGUF (no confirmado en la informacion).
- Latencia y throughput: no disponibles. La decodificacion especulativa con DFly2 reduce la latencia en contexto largo con coste constante, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Multimodal |
|---|---|---|---|---|---|
| Hy4-flash | 220,25B | 12B | 1M | Tencent Hy License | Si (imagen+texto) |
| Hy4 (referencia del card) | no disponible | no disponible | no disponible | Tencent Hy License | no disponible |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia propietaria Tencent Hy License: el uso comercial esta sujeto a los terminos del titular; es imprescindible revisar el enlace de licencia antes de desplegar en produccion.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad ni tasas de alucinacion en la informacion disponible.
- Idiomas soportados no documentados: no hay garantia de calidad fuera del chino e ingles (idiomas de la documentacion original).
- El repositorio `akshay42/Hy4-flash` es una redistribucion no oficial (0 descargas, 0 likes, creado en 2026); el repositorio de referencia es `tencent/Hy4-flash`.
- El modelo card esta truncado en la informacion proporcionada: faltan secciones de benchmarks, cuantizacion y finetuning.
- Contexto de 1M tokens: aunque soportado, el rendimiento en el extremo de la ventana puede degradarse; no se aportan mediciones de long-context.
- Requisitos de hardware muy elevados en precision completa (440 GB), lo que limita el despliegue a infraestructura multi-GPU.
- Sesgos conocidos: no documentados en la informacion disponible.

## Enlaces

- Hugging Face (redistribucion): https://huggingface.co/akshay42/Hy4-flash
- Hugging Face (oficial): https://huggingface.co/tencent/Hy4-flash
- Licencia: https://huggingface.co/tencent/Hy4-flash/blob/main/LICENSE
- Sitio oficial: https://hy.tencent.ai/research/hy4-flash
- GitHub: https://github.com/Tencent-Hunyuan/Hy4-flash
- GGUF: https://huggingface.co/AngelSlim/Hy4-flash-GGUF
- ModelScope: https://modelscope.cn/models/Tencent-Hunyuan/Hy4-flash
- GitCode: https://ai.gitcode.com/tencent_hunyuan/Hy4-flash
