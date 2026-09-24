# Rob1221rib/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-AWQ-MTP

## Resumen

Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-AWQ-MTP es una compilación cuantizada en 4 bits del modelo HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF, publicada por el usuario Rob1221rib. Se trata de un derivado multimodal (image-text-to-text) de la familia Qwen3.5 de 27.356.728.560 parámetros, con el perfil de rechazo eliminado (uncensored) y con la cabeza NextN/MTP intacta, lo que permite decodificación especulativa nativa bajo vLLM. El repositorio ocupa 19,6 GB en disco.

La particularidad técnica del build es su procedencia: HauhauCS solo publicó GGUF, de modo que este AWQ se generó reconstruyendo primero un checkpoint BF16 en safetensors a partir del GGUF Q8_K_P de 29,3 GiB y del mmproj BF16 del tower de visión. El propio autor advierte que se trata de una cuantización de una cuantización Q8, por lo que el error de la fuente de ~8 bits queda incorporado y se compone con el paso a 4 bits.

Es relevante ahora porque permite servir un modelo híbrido de atención lineal de 27B con pesos W4A16 (grupo 128, asimétrico) en dos RTX 3090 con tensor parallelism, dejando espacio para una caché KV en fp8 de 560.900 tokens, y porque conserva capacidades de visión, tool calling y modo thinking del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida `qwen3_5`: 64 capas de decoder (48 de atención lineal `Qwen3_5GatedDeltaNet` y 16 de atención completa, capa *N* completa si `N % 4 == 3`), más un tower de visión de 27 capas y una cabeza NextN/MTP embebida |
| Parámetros totales | 27.356.728.560 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no declarada explícitamente; validada con recuperación de aguja hasta 229.200 tokens de prompt y con caché KV medida de 560.900 tokens en fp8 sobre 2xRTX 3090 |
| Tipos de cuantización | AWQ W4A16 asimétrica, group size 128, `duo_scaling=True`, formato `pack-quantized` (compressed-tensors). En bf16 quedan `lm_head`, el tower de visión completo, los escalares `in_proj_a`/`in_proj_b` de las 48 capas de atención lineal y la cabeza MTP |
| Idiomas soportados | en (inglés) según la ficha del autor |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors W4A16); el modelo base del que deriva se distribuye en GGUF |
| Pipeline | image-text-to-text |
| Librería | transformers |
| Autor del build | Rob1221rib (cuantizador); modelo base de HauhauCS |
| Modelo base | HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF (relación: quantized) |
| Tamaño del repositorio | 19,6 GB |
| Fecha de creación / actualización | 2026-09-23 / 2026-09-23 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la híbrida `qwen3_5`: 64 capas de decoder, de las cuales 48 emplean atención lineal `Qwen3_5GatedDeltaNet` y 16 emplean atención completa. El modelo incorpora además un tower de visión de 27 capas y una cabeza NextN/MTP embebida que actúa como drafter para decodificación especulativa. La reconstrucción del checkpoint requirió invertir tres convenciones de almacenamiento de llama.cpp: el peso de RMSNorm con el `+1` plegado, la representación `ssm_a = -exp(A_log)` y el agrupamiento de las cabezas de valor en orden `(n_v, n_k)` en lugar de `(n_k, n_v)`. El autor señala que esta última afecta a `in_proj_qkv`, `in_proj_z`, `out_proj` y `conv1d` de las 48 capas de atención lineal y que, de aplicarse mal, el modelo carga y responde con repetición degenerada. La dequantización se hizo en fp32 y no en bf16 para evitar un error del 6 % en los pesos de normalización.

El mapeo se validó como total y biyectivo: 866 tensores GGUF frente a 866 tensores HF no visuales, más 334 tensores del mmproj frente a 333 tensores HF de visión. La verificación numérica se hizo contra un fine-tune distinto de la misma base, por lo que valida disposición y convención de almacenamiento, no identidad de pesos: barrido de correlación con valores de +0,99998 en todos los tensores de atención lineal, +0,97917 en `A_log`/`dt_bias` y +0,99219 en `norm.weight`, además de un barrido de offset de normas con ±0,00000 en las 19 familias. El tower de visión quedó excluido de la cuantización y es bit-idéntico al upstream en bf16.

La receta de cuantización empleó `llm-compressor` (`AWQModifier` + `QuantizationModifier`), esquema `W4A16_ASYM` con grupo 128, calibración sobre `HuggingFaceH4/ultrachat_200k` (`train_sft`), 128 muestras de 1024 tokens y semilla 42, con `Qwen3_5DecoderLayer` como objetivo secuencial. No se documentan en la información disponible datos sobre volumen de tokens de preentrenamiento, composición del dataset original ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno; la ficha lo etiqueta como `conversational`.
- Razonamiento aritmético multi-paso: superado en la validación del autor.
- Coherencia factual verificable: 5/5 en hechos comprobables.
- Visión (image-text-to-text): pipeline declarado `image-text-to-text`, con tower de 27 capas en bf16; en la validación identificó correctamente 3 formas y colores de una imagen sintética (3/3).
- Tool calling / function calling: validado tanto en modo no streaming como en streaming, sin fuga de etiquetas.
- Recuperación de información en contexto largo: needle retrieval superado a 29.374, 117.374 y 229.200 tokens de prompt.
- Decodificación especulativa mediante MTP (NextN) con n=3 bajo vLLM, conservada en el build.
- Perfil uncensored: 0 rechazos en 2 pruebas del autor.
- Modo thinking: mencionado en descripciones de la familia de modelos, con la advertencia de que las mediciones de velocidad del autor se realizaron con thinking desactivado.
- Capacidades multilingües: no disponible; la ficha declara únicamente inglés.

## Casos de uso

- Atención al cliente automatizada: el modelo puede mantener conversaciones multi-turno sobre prompts largos, con recuperación de información validada a 229.200 tokens, lo que permite adjuntar historiales completos o documentación extensa sin truncar.
- Asistentes con acceso a herramientas: al superar las pruebas de tool calling en streaming y no streaming sin fuga de etiquetas, es adecuado para agentes que encadenan llamadas a APIs, consultas a bases de datos y ejecución de acciones.
- Análisis de documentos e imágenes combinados: el pipeline image-text-to-text permite procesar capturas, diagramas o formularios escaneados junto a instrucciones textuales, con el tower de visión intacto en bf16.
- Extracción de información en corpus extensos: los resultados de needle retrieval a 117.374 y 229.200 tokens lo hacen apto para búsqueda y extracción sobre contratos, expedientes o documentación técnica de gran volumen.
- Generación y refactorización de código en pipelines internos: puede integrarse como servicio vLLM con decodificación especulativa MTP para reducir la latencia por token en tareas de generación de código y explicación de fragmentos.
- Investigación sobre comportamiento sin filtros: el perfil uncensored (0 rechazos en 2 pruebas) lo sitúa como objeto de estudio para evaluar sesgos, alineación y mecanismos de rechazo en modelos abiertos.
- Despliegue en hardware de gama alta de consumo: con W4A16 y tensor parallelism sobre 2xRTX 3090 permite servir un modelo de 27B con contexto largo en un presupuesto de 48 GB de VRAM total.
- Evaluación de cuantización: útil como caso de estudio del impacto de cuantizar dos veces (Q8_K_P a W4A16) sobre un modelo multimodal con componentes sensibles como la atención lineal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor publica únicamente pruebas funcionales medidas sobre este build, en 2xRTX 3090 con TP=2, vLLM nightly, caché KV en fp8 y MTP n=3:

| Prueba | Resultado |
|---|---|
| Coherencia (5 hechos comprobables) | 5/5 |
| Razonamiento aritmético multi-paso | superado |
| Visión: 3 formas y colores de una imagen sintética | 3/3 |
| Tool calling (no streaming) | superado |
| Tool calling (streaming) | superado, sin fuga de etiquetas |
| Recuperación de aguja a 29.374 tokens de prompt | superado (19 s) |
| Recuperación de aguja a 117.374 tokens de prompt | superado (96 s) |
| Recuperación de aguja a 229.200 tokens de prompt | superado (231 s) |
| Perfil uncensored retenido | 0 rechazos / 2 pruebas |

Sobre velocidad, el autor indica que el throughput depende de la carga en torno a un 30 %, porque la aceptación del MTP es mucho mayor en texto predecible que en prosa variada, y que ninguna cifra aislada es significativa sin especificar el prompt. La medición fijada (2026-08-21, un solo usuario, thinking desactivado, generaciones de 600 tokens, temperatura 0, `repetition_penalty: 1.05`) se presenta en una tabla comparando tipos de prompt y límites de potencia de GPU (250W/275W frente a 225W/225W), pero los valores numéricos no están disponibles en la información proporcionada.

## Requisitos de hardware

- Pesos del repositorio: 19,6 GB en disco; aproximadamente 19,3 GiB de pesos cuantizados en total.
- Configuración validada por el autor: 2xRTX 3090 con TP=2, con 9,66 GiB de pesos por GPU, lo que deja espacio para una caché KV en fp8 de 560.900 tokens.
- Estimación derivada de las cifras anteriores para una única GPU de 24 GB: quedarían en torno a 4,5 GiB libres para caché KV y activaciones, equivalentes aproximadamente a 170.000 tokens de contexto en fp8. Es una estimación propia, no una cifra publicada por el autor.
- VRAM estimada para inferencia: unos 20 GB de pesos más la caché KV; no se publican cifras para otras cuantizaciones de este repositorio, que solo distribuye W4A16.
- GPU recomendadas: RTX 3090 (validada en par), A100 y H100 son opciones razonables por VRAM y soporte de vLLM, aunque no están documentadas en la ficha.
- ¿Cabe en GPU de consumo? Sí, en GPUs de 24 GB o más. El autor valida 2xRTX 3090; en una sola RTX 3090 el margen para contexto largo es limitado.
- Opciones de despliegue: vLLM es el backend recomendado y el único que aprovecha la cabeza MTP para decodificación especulativa (n=3). El formato compressed-tensors W4A16 está soportado por vLLM. Para llama.cpp u Ollama hay que recurrir al GGUF del modelo base, no a este repositorio.
- Latencia y throughput: el autor reporta variación de hasta un 30 % según el prompt y ofrece una tabla de velocidad con condiciones fijadas cuyos valores no están disponibles en la información proporcionada. En las pruebas de recuperación de aguja, las latencias registradas fueron 19 s a 29.374 tokens, 96 s a 117.374 tokens y 231 s a 229.200 tokens.
- Aviso para re-cuantización: si se vuelve a cuantizar, hay que añadir manualmente `re:.*mtp.*` y `re:mtp\..*` a `quantization_config.ignore`, ya que `llm-compressor` nunca ve `model-mtp.safetensors` y vLLM fallaría con `KeyError: 'weight'` en `qwen3_5_mtp.py` al construir el drafter como W4A16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este build (Rob1221rib, AWQ W4A16 MTP) | 27.356.728.560 | no declarado; validado a 229.200 tokens | safetensors compressed-tensors | apache-2.0 | Incluye visión y MTP; derivado de un Q8_K_P |
| HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF | no disponible | no disponible | GGUF (Q8_K_P, 29,3 GiB; mmproj bf16) | no disponible | Modelo base del que deriva este build |
| jan1k/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-NVFP4-GGUF | no disponible | no disponible | GGUF (NVFP4) | no disponible | Variante alternativa de cuantización del mismo linaje |
| orcarouter/Qwen3.8-27B-Uncensored (Ollama) | no disponible (misma familia 27B) | 262K según la descripción del autor | GGUF vía Ollama | no disponible | Abliterado a nivel de tensor, con tower de visión y cabeza MTP intactos; cita 0 % de sobre-rechazo en XSTest y 0-6 % de rechazo en su suite A/B |

No se dispone de datos de rendimiento comparables entre estas variantes dentro de la información proporcionada.

## Limitaciones y advertencias

- Doble cuantización: el build parte de un GGUF Q8_K_P y no de los pesos originales, por lo que el error de ~8 bits está incorporado y se compone con el paso a 4 bits. El propio autor indica que, si se publican safetensors BF16, un build hecho desde ellos debería preferirse a este.
- Riesgo de fidelidad de pesos: la verificación numérica se hizo contra un fine-tune distinto de la misma base y, según el autor, la correlación solo demuestra que los pesos tienen la forma y la convención correctas, no que sean exactos.
- Fragilidad de la reconstrucción: una inversión incorrecta de las convenciones de llama.cpp (especialmente el orden de las cabezas de valor) produce un modelo que carga y responde, pero con repetición degenerada; cualquier fork o reconversión debe replicar exactamente las inversiones descritas.
- Perfil uncensored: el modelo está diseñado para no rechazar peticiones (0 rechazos en 2 pruebas del autor). Esto implica ausencia de barreras de seguridad y riesgo elevado de generar contenido dañino, ilegal o sensible; no es adecuado para despliegues orientados al público general sin capas de moderación externas.
- Alucinación: no se han publicado evaluaciones de veracidad ni tasas de alucinación; las 5 pruebas de coherencia del autor no son una medida representativa.
- Idioma: la ficha declara únicamente inglés. No hay datos de rendimiento en castellano ni en otros idiomas.
- Contexto: la longitud de contexto no está declarada formalmente; el máximo validado experimentalmente es de 229.200 tokens de prompt, y la caché KV de 560.900 tokens corresponde a una configuración concreta de hardware.
- Licencia: el repositorio declara apache-2.0, pero al ser un derivado de un modelo base de terceros conviene verificar los términos del repositorio de HauhauCS antes de un uso comercial. Las descripciones de variantes relacionadas en la web mencionan fronteras de uso solo para investigación; conviene comprobar los términos aplicables a cada artefacto.
- Rendimiento variable: el throughput depende del prompt en torno a un 30 % por la aceptación del MTP; las cifras de velocidad no son extrapolables entre cargas de trabajo.
- Metadatos de procedencia: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta y no se han publicado resultados de benchmarks estándar, por lo que la validación disponible es únicamente la del autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Rob1221rib/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-AWQ-MTP
- Modelo base (GGUF): https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Discusiones del modelo base: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/discussions
- Variante NVFP4 GGUF: https://huggingface.co/jan1k/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-NVFP4-GGUF
- Variante abliterada en Ollama: https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored
- Guía de cuantizaciones GGUF y comparativa: https://hackernoon.com/qwen38-27b-uncensored-vs-other-qwen-gguf-models
- Guía de despliegue local con llama.cpp: https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
