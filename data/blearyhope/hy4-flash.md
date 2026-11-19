# blearyhope/Hy4-flash

## Resumen

Hy4-flash es un modelo de lenguaje multimodal desarrollado por Tencent Hunyuan, publicado bajo la licencia Tencent Hy License. Se trata de un transformer de tipo Mixture-of-Experts (MoE) con 220.000 millones de parametros totales (incluyendo 63.500 millones de parametros Engram) y solo 12.000 millones de parametros activos por token, lo que lo posiciona como una opcion de alta capacidad pero bajo coste computacional por inferencia. Acepta entradas nativas de texto e imagen y genera texto, con una ventana de contexto de hasta 1.048.576 tokens (1M).

El modelo introduce tres cambios arquitectonicos destacables respecto a su predecesor Hy4: atencion hibrida que intercala atencion dispersa (IndexPool) y atencion de ventana deslizante (SWA) en proporcion 1:3; LatentMoE, donde los expertos enrutados operan en un espacio latente de menor dimension; y embeddings N-gram (Engram) que anaden representaciones aprendidas de bigramas y trigramas recuperadas mediante busquedas hash multi-cabeza. Ademas, incorpora un drafter de decodificacion especulativa (DFly2) de 850 millones de parametros que reutiliza la cache KV del modelo objetivo.

El modelo es relevante por su relacion capacidad-coste: con solo 12B parametros activos por token ofrece un contexto de 1M tokens y capacidades multimodales, lo que lo hace atractivo para despliegues de produccion a gran escala donde el coste por token es critico. La licencia Tencent Hy License impone condiciones especificas que deben revisarse antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atencion hibrida (dispersa + SWA) y MLA |
| Parametros totales | 220.251.201.958 (220,25B) |
| Parametros activos | 11,3B texto + 0,43B vision por token |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | no disponible (existe repo GGUF comunitario) |
| Idiomas soportados | no disponible |
| Licencia | Tencent Hy License (license:other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El backbone del lenguaje consta de 42 capas: una capa densa con FFN de 13.824 dimensiones intermedias y 41 capas MoE. Cada capa MoE contiene 512 expertos enrutados (de los cuales se activan 16 por token) mas un experto compartido; los expertos operan en un espacio latente de 1.536 dimensiones (LatentMoE) con tamano intermedio de 1.536. El tamano oculto es de 3.072 y el vocabulario de 120.832 tokens. Las conexiones residuales usan iHC (identity Hyper-Connections) con 4 flujos residuales.

La atencion es hibrida y usa Multi-head Latent Attention (MLA) con q_lora_rank 1.024 y kv_lora_rank 512. El patron de capas es 2 dispersas seguidas de 10 bloques de (3 SWA + 1 dispersa), resultando en 12 capas de atencion dispersa y 30 de SWA. La atencion dispersa selecciona hasta 2.048 tokens mediante seleccion a nivel de grupo, mientras que la SWA usa una ventana causal de 512 tokens. El codificado posicional es MRoPE intercalado. Los embeddings Engram (bigramas y trigramas) se insertan en las capas 1, 11, 21 y 31, con 8 cabezas hash por orden, vocabulario hash de 10,3M por cabeza y dimension de embedding de 768 por orden, sumando 63,4B parametros en tablas de embedding.

El codificador visual (27 capas, hidden size 1.152, 16 cabezas de atencion, patch 16x16, adaptado de SigLIP2-So400m-Patch16-Res512) se conecta al backbone mediante un proyector MLP, con fusion de caracteristicas visuales 2x2. El drafter DFly2 (5 capas, 0,85B parametros) reutiliza la cache KV e indices dispersos del modelo objetivo para decodificacion especulativa de bajo coste constante en contexto largo. No se dispone de informacion sobre el volumen de tokens de entrenamiento, composicion del dataset ni si se aplico RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento general con contexto de hasta 1M tokens.
- Comprension de imagenes (image-text-to-text) mediante codificador SigLIP2 adaptado.
- Razonamiento multi-paso y soporte de agentes (mencionado en validacion interna de codigo y agentes).
- Generacion de codigo (evaluado en validacion interna de codigo y agente via BPB).
- Capacidades multilingues: no disponible el detalle de idiomas.
- Decodificacion especulativa integrada mediante DFly2 para acelerar inferencia en contexto largo.
- Soporte de API compatible con OpenAI segun la model card.
- Capacidad de ajuste fino (seccion Finetuning en la model card).

## Casos de uso

- Analisis de documentos extensos: el modelo puede procesar contratos, informes o expedientes de hasta 1M tokens en una sola pasada, eliminando la necesidad de chunking y recuperacion externa en casos de documentacion masiva.
- Atencion al cliente multimodal: gestion de conversaciones multi-turno donde el usuario adjunta capturas o imagenes, gracias a la entrada nativa de imagen y texto y a la ventana de contexto amplia para mantener historial largo.
- Generacion de codigo en produccion: integrable en pipelines de CI/CD mediante API compatible con OpenAI; el bajo numero de parametros activos (12B) reduce el coste por token en comparacion con modelos densos de tamano similar.
- Agentes autonomos con memoria larga: el contexto de 1M tokens permite mantener trazas de herramientas, resultados intermedios y estado de tareas sin truncamiento, adecuado para flujos multi-paso.
- Procesamiento de imagenes tecnicas: diagramas, esquemas y capturas de pantalla pueden enviarse junto a instrucciones de texto para extraccion de informacion o generacion de descripciones tecnicas.
- Despliegue de bajo coste por token: con 12B parametros activos y decodificacion especulativa DFly2, es adecuado para servicios de inferencia de alto volumen donde el throughput y el coste por peticion son la metrica principal.
- Investigacion en arquitecturas hibridas: util como referencia para estudiar LatentMoE, atencion dispersa y embeddings N-gram en modelos multimodales a gran escala.

## Benchmarks y rendimiento

La model card menciona resultados de bits-per-byte (BPB) en validacion interna de codigo y agentes (menor es mejor), pero los valores numericos no estan disponibles en la informacion proporcionada. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 440 GB solo para pesos (tamano del repo 440,5 GB), lo que requiere multiples GPU.
- En cuantizacion de 8 bits: aproximadamente 220 GB; en 4 bits: aproximadamente 110 GB (estimaciones teoricas, no confirmadas por el autor).
- GPU recomendadas para BF16: 8x H100 80GB o 8x A100 80GB como minimo; el contexto de 1M tokens incrementa sustancialmente la memoria de cache KV.
- No cabe en GPU de consumo (RTX 4090, 24 GB) en precision completa; existe un repo GGUF comunitario que podria permitir cuantizaciones agresivas, pero no se confirma que quepa en una sola GPU consumer.
- Opciones de despliegue: vLLM, SGLang (soportados segun la model card), transformers, API compatible con OpenAI, y DFly2 para decodificacion especulativa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash | 220B (incl. 63,5B Engram) | 12B | 1M | Tencent Hy License | Hugging Face, ModelScope, GitCode |
| Hy4 (predecesor) | no disponible | no disponible | no disponible | Tencent Hy License | Hugging Face |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada; como modelo entrenado con datos web, es probable que herede sesgos, pero no se documentan.
- Riesgo de alucinacion: no cuantificado; no se publican tasas de alucinacion ni evaluaciones de veracidad.
- Limitaciones de idioma: no se especifican los idiomas soportados, lo que impide garantizar calidad fuera de los idiomas principales de entrenamiento.
- Licencia: la Tencent Hy License impone condiciones especificas (posibles restricciones de uso comercial, requisitos de atribucion o limitaciones por numero de usuarios); debe revisarse el texto completo antes de cualquier despliegue comercial.
- Contexto de 1M tokens: aunque soportado, el coste de memoria de la cache KV en contexto largo es elevado y puede degradar el throughput; la calidad en el extremo de la ventana no esta documentada.
- Parametros Engram: 63,5B parametros en tablas de embedding hash, lo que infla el tamano del repo (440,5 GB) y complica el despliegue en entornos con almacenamiento limitado.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en la fecha de publicacion, sin validacion comunitaria independiente.
- No se documentan resultados de benchmarks estandar, lo que dificulta la comparacion objetiva con alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/blearyhope/Hy4-flash
- Hugging Face oficial (Tencent): https://huggingface.co/tencent/Hy4-flash
- Licencia: https://huggingface.co/tencent/Hy4-flash/blob/main/LICENSE
- ModelScope: https://modelscope.cn/models/Tencent-Hunyuan/Hy4-flash
- GitCode: https://ai.gitcode.com/tencent_hunyuan/Hy4-flash
- Web oficial: https://hy.tencent.ai/research/hy4-flash
- GitHub: https://github.com/Tencent-Hunyuan/Hy4-flash
- GGUF comunitario: https://huggingface.co/AngelSlim/Hy4-flash-GGUF
- README en chino: https://huggingface.co/tencent/Hy4-flash/blob/main/README_CN.md
