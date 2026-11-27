# AustinM731/glm-5.3-flash-iqr-v4-mtp

## Resumen

AustinM731/glm-5.3-flash-iqr-v4-mtp es una conversión cuantizada del modelo multimodal zai-org/GLM-5.3-Flash, empaquetada en un único contenedor `.rad` para el motor de inferencia radiance, orientado específicamente a GPUs AMD con arquitectura RDNA4 y stack ROCm. No se trata de un modelo nuevo entrenado desde cero, sino de una distribución de pesos optimizada para despliegue en hardware AMD, con decodificación especulativa nativa mediante Multi-Token Prediction (MTP) incorporada en la capa 45.

El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con capacidades image-text-to-text, es decir, acepta entradas de imagen y texto y genera texto. La conversión aplica cuantización IQR-V4 de 4 bits a los expertos enrutados (códigos trellis computados con `tcq=16`), int8 rotado (IQ8R) a las proyecciones lineales del tronco y del MTP, y preserva en BF16/F32 las proyecciones KDA, el estado, el `kv_b` de MLA, los indexadores DSA, routers, normas, embeddings, `lm_head` y la torre de visión.

Su relevancia es doble: por un lado, demuestra la viabilidad de servir un MoE multimodal de gran tamaño (162,60 GiB de pesos) en 4× Radeon AI PRO R9700 con paralelismo tensorial TP4; por otro, documenta ganancias medibles de throughput gracias al borrador MTP nativo, con incrementos de hasta el 78,9 % en decodificación para cargas de tipo tool calling. La licencia es MIT y el repositorio ocupa 174,6 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (image-text-to-text) con KDA, MLA, DSA y MTP nativo; base zai-org/GLM-5.3-Flash |
| Parametros totales | no disponible (repo de 174,6 GB; fichero de pesos de 162,60 GiB) |
| Parametros activos | no disponible |
| Longitud de contexto | 524.288 tokens (configurado en el ejemplo de servicio con `max-model-len`) |
| Tipos de cuantizacion | IQR-V4 4-bit (expertos enrutados, `tcq=16`, `tcq_code=mad`, `fwht128`); IQ8R int8 rotado (`group=256`, `fwht128`) en lineales del tronco y MTP; BF16/F32 en KDA, MLA `kv_b`, DSA, routers, normas, mHC, embeddings, `lm_head` y torre de visión |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.rad` (contenedor único para el motor radiance) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash, del que esta ficha es una conversión cuantizada, emplea una arquitectura MoE con varios componentes técnicos identificables a partir de los nombres de tensores preservados: proyecciones KDA (atención con estado), MLA (Multi-head Latent Attention) con `q_a`, `kv_a`, `q_b` y `output`, indexadores DSA (atención dispersa), routers de mezcla de expertos, conexiones mHC y una torre de visión para el procesamiento de imágenes. La capa 45 corresponde al cabezal MTP (Multi-Token Prediction), que actúa como borrador especulativo serial nativo.

La conversión realizada por AustinM731 reutiliza byte a byte las capas 0–44 y la torre de visión del contenedor `animusnull/glm-5.3-flash-iqr-v4` (rev `a2d63477`, 25.544 pesos retenidos en su sitio) mediante `rad-convert --reuse --in-place`, y añade la capa 45 con 599 pesos `mtp.*` procedentes del checkpoint original `zai-org/GLM-5.3-Flash` rev `46a050be`, usando la misma receta `glm53-iqr-v4.recipe` con `--max-spec 3` y `--kv-cache-dtype i8`. Los expertos enrutados de las capas 3–45 se almacenan como códigos trellis computados de 4 bits con una escala f32 por fila; las lineales densas del tronco, expertos compartidos y proyecciones MLA se guardan como int8 rotado. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las fases de RLHF/DPO del modelo base en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento multi-turno con ventanas de contexto de hasta 524.288 tokens.
- Procesamiento conjunto de imagen y texto (pipeline `image-text-to-text`), incluyendo la torre de visión preservada en BF16/F32.
- Decodificación especulativa nativa mediante MTP serial, con `num-speculative-tokens` configurable entre 1 y 3 o más (se recomienda 2 en 4× R9700).
- Soporte de tool calling y function calling, evidenciado por la carga de benchmark `tool` y las ganancias específicas de throughput en ese escenario.
- Capacidades de agente y razonamiento multi-paso, coherentes con el uso de contexto largo y tool calling.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo de pensamiento (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Atención al cliente automatizada multi-turno: el modelo puede mantener conversaciones extensas con contexto de hasta 524.288 tokens, lo que permite adjuntar historiales completos, documentación de producto y transcripciones previas sin truncamiento. La ganancia del 38,5 % en decodificación de prosa con MTP=2 (97,2 tok/s frente a 70,2 tok/s) mejora la latencia percibida en respuestas conversacionales.
- Generación de código en producción: con soporte de tool calling y un rendimiento medido de 106,5 tok/s en decodificación p50 para código con MTP=2 (frente a 69,4 tok/s sin especulación), es adecuado para asistentes de código integrados en IDE o pipelines de CI/CD que necesiten completar parches y tests con baja latencia.
- Automatización de agentes con tool calling: la carga `tool` alcanza 124,9 tok/s p50 con MTP=2 (frente a 69,8 tok/s), un 78,9 % más, lo que lo hace idóneo para bucles de agente con invocación frecuente de herramientas y pasos cortos.
- Procesamiento de documentos con imagen y texto: al conservar la torre de visión, puede extraer información de capturas, diagramas o formularios escaneados combinados con instrucciones textuales, en flujos de digitalización y enriquecimiento documental.
- Análisis de repositorios y sesiones largas: con `max-model-len: 524288` y `kv-cache-dtype: i8`, puede ingerir bases de código o logs extensos en una sola sesión; la celda `code c1 d32K-session` muestra 103,7 tok/s con MTP=2.
- Servicio de inferencia multi-tenant en hardware AMD: el despliegue con TP4 `expert_tiered`, `max-num-seqs: 4` y caché de prefijos de 8.192 MiB permite atender varias sesiones concurrentes; la celda `tool c8` alcanza 237,1 tok/s agregados con MTP=2 (frente a 159,1 tok/s).
- Generación de JSON estructurado: la carga `json c1` rinde 101,0 tok/s p50 con MTP=2 (frente a 70,4 tok/s), útil para extracción de datos y rellenado de esquemas en pipelines ETL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos publicados son de throughput, medidos en 4× Radeon AI PRO R9700 con TP4 `expert_tiered`, KV latente i8, Radiance 2.3.0, `max-model-len: 524288`, `host-pool-mib: 65536`, `prefix-cache-mib: 8192` y un benchmark de bucle cerrado de 36 celdas (60 s/celda):

| Celda | k=0 (baseline) | MTP=2 | Ganancia |
|---|---:|---:|---:|
| `code c1 512tok` dec p50 | 69,4 tok/s | 106,5 tok/s | +53,5 % (2,26 tok/blk) |
| `code c1 d8K-session` dec p50 | 67,0 tok/s | 111,0 tok/s | +65,7 % (2,54 tok/blk) |
| `code c1 d32K-session` dec p50 | 65,9 tok/s | 103,7 tok/s | +57,4 % (2,35 tok/blk) |
| `prose c1 512tok` dec p50 | 70,2 tok/s | 97,2 tok/s | +38,5 % (2,01 tok/blk) |
| `json c1 512tok` dec p50 | 70,4 tok/s | 101,0 tok/s | +43,5 % (2,11 tok/blk) |
| `tool c1 512tok` dec p50 | 69,8 tok/s | 124,9 tok/s | +78,9 % (2,60 tok/blk) |
| `code c16 512tok` agg | 175,4 tok/s | 228,1 tok/s | +30,0 % |
| `prose c16 512tok` agg | 182,8 tok/s | 223,1 tok/s | +22,0 % |
| `json c8 512tok` agg | 186,2 tok/s | 240,7 tok/s | +29,3 % |
| `tool c8 512tok` agg | 159,1 tok/s | 237,1 tok/s | +49,0 % |

## Requisitos de hardware

- VRAM estimada para inferencia: el contenedor de pesos ocupa 162,60 GiB (174.594.022.936 bytes), por lo que se requiere un pool agregado de al menos esa cifra más overhead de caché KV, pool de host y caché de prefijos. El ejemplo de servicio reserva `host-pool-mib: 65536` y `prefix-cache-mib: 8192`.
- GPU recomendadas: 4× AMD Radeon AI PRO R9700 (RDNA4) con TP4, configuración en la que se midieron los datos de throughput. No se documentan otras configuraciones.
- ¿Cabe en GPU consumer? No en una sola GPU consumer; el tamaño de pesos excede la VRAM de cualquier tarjeta individual actual. Se requiere un despliegue multi-GPU con al menos 4× R9700 según la documentación del autor.
- Opciones de despliegue: motor radiance (ROCm/RDNA4). Para `num-speculative-tokens > 0` se requiere el PR StillDeadcode/radiance#661 o la imagen overlay `docker.io/aml731/radiance:2.3.0-glm53-mtp` (`sha256:e6fdee6ef424302c67ac8c5e72947e3e1013da3f33f486a87004de0b0a640571`), que sustituye solo `/opt/radiance/share/radiance/architectures/glm5next.so` sobre `stilldeadcode/radiance:2.3.0`. La imagen oficial sin modificar puede servir el contenedor con `num-speculative-tokens: 0`.
- Latencia y throughput: ver tabla de benchmarks. En decodificación p50 por celda se observan entre 97,2 y 124,9 tok/s con MTP=2 en configuraciones c1; en agregado c8/c16, entre 223,1 y 240,7 tok/s.
- Configuración de servicio recomendada: `tp: 4`, `max-num-seqs: 4`, `max-model-len: 524288`, `max-num-batched-tokens: 2048`, `prefill-interleave: 4`, `kv-cache-dtype: i8`, `placement: expert_tiered`, `num-speculative-tokens: 2`, `temp: 1.0`, `top-p: 0.95`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Hardware objetivo | Notas |
|---|---|---|---|---|---|---|
| AustinM731/glm-5.3-flash-iqr-v4-mtp | no disponible (162,60 GiB) | 524.288 | MIT | `.rad` | AMD RDNA4 / ROCm (4× R9700) | MTP nativo, IQR-V4 4-bit + IQ8R |
| animusnull/glm-5.3-flash-iqr-v4 | no disponible | no disponible | no disponible | `.rad` | AMD RDNA4 / ROCm | Contenedor base sin capa MTP |
| zai-org/GLM-5.3-Flash | no disponible | no disponible | no disponible | safetensors (BF16/F32) | no disponible | Checkpoint original sin cuantizar |

No se dispone de datos de benchmarks de calidad ni de parámetros totales/activos de los modelos comparados en la información proporcionada, por lo que la comparación se limita a formato, licencia, contexto configurado y hardware objetivo.

## Limitaciones y advertencias

- Dependencia de hardware muy específica: el contenedor `.rad` está diseñado para el motor radiance sobre AMD RDNA4/ROCm; no es portable directamente a vLLM, llama.cpp, Ollama o TGI.
- Requiere una versión parcheada del motor para usar MTP: sin el PR #661 o la imagen overlay, solo funciona con `num-speculative-tokens: 0`, perdiendo las ganancias de throughput documentadas.
- Tamaño de despliegue elevado: 162,60 GiB de pesos más caché KV, pool de host y caché de prefijos; el umbral práctico es un nodo de 4× R9700.
- Idiomas soportados no documentados: no se puede garantizar calidad multilingüe sin evaluación propia.
- Sin benchmarks de calidad publicados: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones de sesgo o alucinación en la información disponible.
- Riesgo de alucinación y sesgos: inherente a los modelos de lenguaje; no se documentan mitigaciones específicas en esta conversión.
- Trazabilidad de la cuantización: los expertos enrutados se almacenan como códigos trellis de 4 bits con una escala f32 por fila, lo que introduce pérdida de precisión respecto al checkpoint BF16 original; no se documenta una evaluación de la degradación.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base zai-org/GLM-5.3-Flash, cuya licencia no se detalla en la información proporcionada.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni reportes independientes de funcionamiento.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/AustinM731/glm-5.3-flash-iqr-v4-mtp
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Contenedor base reutilizado: https://huggingface.co/animusnull/glm-5.3-flash-iqr-v4
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
- PR de soporte MTP: https://codeberg.org/StillDeadcode/radiance/pulls/661
- Imagen overlay: `docker.io/aml731/radiance:2.3.0-glm53-mtp` (`sha256:e6fdee6ef424302c67ac8c5e72947e3e1013da3f33f486a87004de0b0a640571`)
- Imagen oficial base: `stilldeadcode/radiance:2.3.0`
