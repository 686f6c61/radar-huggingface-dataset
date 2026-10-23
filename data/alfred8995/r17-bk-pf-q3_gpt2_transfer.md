# alfred8995/r17-bk-pf-q3_gpt2_transfer

## Resumen

`r17-bk-pf-q3_gpt2_transfer` es un modelo de lenguaje publicado en HuggingFace por el usuario **alfred8995** el 23 de octubre de 2026. Según las etiquetas del repositorio, está basado en la arquitectura **Qwen3** y contiene **1.512.432.640 parámetros (≈ 1,51 B)** verificados en formato safetensors. El repositorio no incluye model card, por lo que su finalidad debe inferirse del nombre: la cadena `q3_gpt2_transfer` sugiere un experimento de transferencia de pesos o conocimiento entre GPT-2 y una base Qwen3, enmarcado en una serie de checkpoints experimentales del mismo autor (existen repos hermanos como `r16-H-P2-d2s3q3-final` y `r16-H-c2b-cpt-s2000`).

No hay documentación sobre el problema que resuelve ni sobre su rendimiento; su interés actual es principalmente **investigador**: permite estudiar experimentos de transferencia entre arquitecturas y dispone de un tamaño reducido (≈ 1,5 B) ejecutable en hardware de consumo. El acceso es **restringido (gated)**: hay que aceptar condiciones en HuggingFace y autenticarse para descargar los pesos. Con 0 descargas y 0 likes en el momento de redactar esta ficha, carece de validación comunitaria.

Longitud de contexto, idiomas soportados, datos de entrenamiento y benchmarks: no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder basado en Qwen3 (según etiqueta del repo); detalles no disponibles |
| Parámetros totales | 1.512.432.640 (≈ 1,51 B, dato real de safetensors) |
| Parámetros activos | No aplica (no consta que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; los 6,0 GB del repo son coherentes con pesos sin cuantizar en fp32 (1,51 B × 4 bytes ≈ 6,05 GB) |
| Idiomas soportados | No disponible |
| Licencia | Other (sin especificar detalles); acceso gated |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La etiqueta `qwen3` indica que el modelo deriva de la familia Qwen3 de Alibaba, cuyos modelos pequeños (0,6B y 1,7B) son transformers densos con attention multi-cabeza agrupada (GQA), RoPE, SwiGLU y RMSNorm. Dado que el modelo tiene 1,51 B de parámetros, lo más probable es que parta de una base Qwen3 densa de tamaño similar, aunque la tarjeta no lo confirma. El sufijo `gpt2_transfer` del nombre apunta a un experimento de transferencia (por ejemplo, inicialización o trasplante de pesos desde GPT-2 hacia una arquitectura Qwen3), pero esto es una hipótesis derivada del nombre, no un dato confirmado.

Sobre el entrenamiento no hay información alguna: número de tokens, composición del dataset, presencia de RLHF/DPO o instrucciones de uso son **no disponibles**. Los repos hermanos del autor (con etiquetas como `sn38-nanochrono`) sugieren que se trata de una serie de checkpoints experimentales de investigación personal, no de un modelo de producción.

## Capacidades

- **Generación de texto**: esperable como LLM derivado de Qwen3, pero no documentada; no hay ejemplos ni plantillas de prompt en el repositorio.
- **Razonamiento, código y matemáticas**: no disponible (sin benchmarks ni model card).
- **Tool calling / function calling**: no disponible. La familia Qwen3 lo soporta de serie, pero no consta que esta variante lo conserve tras el experimento de transferencia.
- **Agentes y razonamiento multi-step**: no disponible.
- **Capacidades multilingües**: no disponibles (la base Qwen3 cubre 119 idiomas, pero no consta para esta variante).
- **Capacidades especiales (thinking mode, visión, audio)**: no consta ninguna; no hay etiquetas de pipeline asociadas.

## Casos de uso

- **Investigación en transferencia entre arquitecturas**: el caso de uso más plausible; el modelo permite reproducir o auditar un experimento de transferencia GPT-2 → Qwen3, comparando pérdida, convergencia o capacidades frente a la base original.
- **Inferencia local en hardware modesto**: con ≈ 1,5 B de parámetros, cabe en GPUs de consumo desde 4-6 GB de VRAM (cuantizado), útil para pruebas offline en portátiles o estaciones de trabajo sin GPUs de datacenter.
- **Base para fine-tuning (LoRA/QLoRA)**: su tamaño reducido lo hace apto para ajustes por dominio (extracción de datos, clasificación, RAG generativo) con coste de entrenamiento bajo, siempre partiendo de una evaluación previa del checkpoint.
- **Prototipado de pipelines LLM de bajo coste**: un modelo de 1,5 B permite iterar prompts, parsers y orquestación en local antes de escalar a modelos mayores de producción.
- **Benchmarking de modelos pequeños derivados de Qwen3**: sirve como punto de comparación adicional frente a Qwen3-0.6B/1.7B en evaluaciones propias de tareas en castellano o dominios verticales.
- **Docencia y análisis técnico**: al estar en safetensors sin cuantizar (fp32 aparente), es cómodo para estudiar internamente pesos, atención y tokenizers en clases o tutoriales de arquitecturas LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia** (cálculo a partir de los 1,51 B de parámetros, sin medir):
  - fp32 (formato aparente del repo): ≈ 6 GB de pesos, 7-8 GB de VRAM recomendados.
  - bf16/fp16 (conversión): ≈ 3 GB de pesos, 4-5 GB de VRAM.
  - int8: ≈ 1,6-2 GB de pesos, 2,5-3 GB de VRAM.
  - int4: ≈ 1-1,2 GB de pesos, 1,5-2 GB de VRAM (más caché KV según contexto).
- **GPU recomendadas**: cualquier GPU moderna sirve; RTX 3060 12 GB o RTX 4060 8 GB para fp16, RTX 4090 para lotes grandes o contextos largos. A100/H100 solo justificadas para evaluaciones masivas, no para este tamaño.
- **Cabe en GPU de consumo**: sí, en prácticamente cualquier GPU con 4 GB o más (cuantizado) y en cualquier GPU de 8 GB en fp16.
- **Despliegue**: `transformers` (Qwen3 soportado de forma nativa), vLLM, SGLang o TGI con la arquitectura Qwen3; llama.cpp y Ollama requerirían conversión a GGUF (no hay GGUF publicado). Recuerda que el repo es gated: necesitas un token de HF con acceso aprobado.
- **Latencia y throughput**: no disponible; al ser un modelo denso de ≈ 1,5 B, en una GPU de consumo moderna cabe esperar tasas altas de tokens/s, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| r17-bk-pf-q3_gpt2_transfer | 1,51 B | no disponible | Other (gated) | Sin model card, 0 descargas, sin benchmarks |
| Qwen3-1.7B | 2,03 B (1,40 B sin embeddings) | 32.768 (ampliable a 131.072 con YaRN) | Apache 2.0 | Model card completa, benchmarks publicados, Apache 2.0 |
| Qwen3-0.6B | 0,75 B | 32.768 | Apache 2.0 | Model card completa, benchmarks publicados |
| Llama 3.2 1B | 1,24 B | 128.000 | Llama 3.2 Community | Model card completa, soporte amplio en ecosistema |

En resumen: frente a las alternativas, este modelo pierde en documentación, licencia clara y rendimiento demostrado; su único valor diferencial es el carácter experimental del transfer GPT-2 → Qwen3.

## Limitaciones y advertencias

- **Sin model card**: no hay descripción del entrenamiento, uso previsto ni plantillas de chat; cualquier uso exige ingeniería inversa del checkpoint.
- **Acceso gated**: hay que aceptar condiciones y autenticarse; puede complicar la integración en CI/CD.
- **Licencia "other" sin detalles**: las condiciones de uso comercial son desconocidas; no se puede asumir permiso para productos comerciales sin revisar la licencia real.
- **Cero tracción comunitaria**: 0 descargas y 0 likes; nadie ha validado que el checkpoint funcione o produzca texto coherente.
- **Riesgo de alucinación y sesgos desconocidos**: al no conocerse datos ni alineación (RLHF/DPO), hay que asumir los riesgos típicos de un modelo pequeño sin ajuste por instrucciones, posiblemente agravados por el experimento de transferencia.
- **Contexto e idiomas sin confirmar**: no se puede garantizar ninguna ventana de contexto concreta ni cobertura de castellano.
- **Pesos aparentemente en fp32 (6 GB)**: innecesariamente pesados para 1,5 B; conviene convertir a bf16 o cuantizar antes de desplegar.
- **Naturaleza experimental**: la nomenclatura (r16, r17, sufijos técnicos) indica checkpoints de investigación; no está pensado para producción.

## Enlaces

- Repositorio del modelo: https://huggingface.co/alfred8995/r17-bk-pf-q3_gpt2_transfer
- Repositorio hermano del mismo autor: https://huggingface.co/alfred8995/r16-H-P2-d2s3q3-final
- Repositorio hermano del mismo autor: https://huggingface.co/alfred8995/r16-H-c2b-cpt-s2000
- Referencia de la familia base (etiqueta qwen3): https://huggingface.co/Qwen
