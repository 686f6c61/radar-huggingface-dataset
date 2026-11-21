# 88plug/Gemma4-E4B-it-W4A16

## Resumen

Gemma4-E4B-it-W4A16 es una cuantizacion post-entrenamiento a INT4 (esquema W4A16) del modelo multimodal google/gemma-4-e4b-it, publicada por el usuario 88plug. El modelo base es un Mixture-of-Experts disperso de Google con 128 expertos, atencion hibrida (sliding window + global) y una torre de vision SigLIP, disenado para tareas image-text-to-text. La cuantizacion reduce el backbone LLM a 4 bits por peso manteniendo las activaciones en BF16, lo que rebaja el peso en disco y VRAM de aproximadamente 28 GB (BF16) a unos 14 GB, permitiendo ejecutarlo en una unica GPU consumer de 24 GB como una RTX 3090 o RTX 4090.

El modelo declara 7.941.100.874 parametros totales en sus safetensors, con 4B parametros activos por token gracias a la arquitectura MoE. La ficha del autor menciona una cifra superior a 26B en el recuento completo de parametros del modelo base, lo que sugiere que el checkpoint publicado no incluye todos los pesos del original o que la cifra del model card es aproximada; el dato verificable de safetensors es el de 7,94B totales. La relevancia actual radica en que es la primera cuantizacion W4A16 en formato compressed-tensors nativo de vLLM para Gemma4 E4B, lo que facilita el despliegue en produccion con hardware modesto.

La cuantizacion se realizo con RTN datafree (QuantizationModifier de llmcompressor) porque AutoRound quedo bloqueado por la estructura de las capas q_proj de Gemma4, segun indica el autor. Se mantienen en BF16 el lm_head, las normas, los embeddings, las capas PLE (Per-Layer Embeddings), la torre de vision, la torre de audio y el proyector multimodal, ya que cuantizarlas degrada la calidad de forma catastrofica segun las ablaciones del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso con 128 expertos, atencion hibrida sliding+global, vision SigLIP y torre de audio |
| Parametros totales | 7.941.100.874 (safetensors); el model card del autor cita "26B+" para el modelo base |
| Parametros activos | 4B (MoE) |
| Longitud de contexto | 32.768 tokens (configurado en el ejemplo de vLLM con `--max-model-len 32768`) |
| Tipos de cuantizacion | W4A16 (pesos INT4 simetricos, activaciones BF16), formato compressed-tensors; variante W8A16 disponible del mismo autor |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compressed-tensors (pack-quantized / int-quantized) |

## Arquitectura y entrenamiento

El modelo base google/gemma-4-e4b-it es un transformer de tipo Mixture-of-Experts con 128 expertos y 4B parametros activos por token, combinando atencion de ventana deslizante con atencion global (hibrida) para gestionar contexto largo con coste cuadratico reducido. Incluye una torre de vision SigLIP y una torre de audio, ademas de un proyector multimodal que alinea las representaciones visuales y auditivas con el espacio del LLM. Una innovacion destacable son las capas PLE (Per-Layer Embeddings), que inyectan embeddings especificos por capa mediante `embed_tokens_per_layer` y `per_layer_model_projection`; el autor documenta que cuantizarlas provoca degradacion catastrofica de la salida, por lo que se mantienen en BF16.

Sobre el entrenamiento del modelo base no se proporciona informacion en la documentacion disponible (numero de tokens, composicion del dataset, uso de RLHF/DPO): no disponible. La cuantizacion de esta ficha se realizo con RTN datafree mediante QuantizationModifier de llmcompressor, sin datos de calibracion, y afecta a todas las capas `Linear` del backbone LLM (`self_attn.{q,k,v,o}_proj` y `mlp.{gate,up,down}_proj`). Se excluyen de la cuantizacion `lm_head`, embeddings, normas, capas PLE, torre de vision, torre de audio y proyector multimodal. El autor indica que AutoRound quedo bloqueado por la jerarquia de hijos `q_proj.linear` de Gemma4 y que la cuantizacion es provisional, con re-cuantizacion programada.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Razonamiento y respuesta a instrucciones (modelo `-it`, instruction-tuned).
- Comprension de imagenes (image-text-to-text) mediante la torre SigLIP y el proyector multimodal.
- Procesamiento de audio, ya que el checkpoint conserva la `audio_tower` en BF16.
- Capacidades de codigo y matematicas heredadas del modelo base (no se detallan evaluaciones especificas en la informacion disponible).
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues limitadas al ingles segun el campo `language` del model card.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente multimodal en local para una sola GPU: con ~14 GB de pesos y ~2 GB de KV cache a 32k tokens en fp8, cabe en una RTX 3090 o RTX 4090 de 24 GB y permite desplegar un VLM conversacional sin infraestructura cloud.
- Analisis de documentos con imagenes: el modelo acepta pares imagen-texto y puede responder preguntas sobre capturas, diagramas o graficos dentro de una ventana de 32k tokens, adecuado para pipelines de extraccion de informacion.
- Transcripcion y comprension de audio asistida: al conservar la torre de audio en BF16, puede integrarse en flujos que combinen audio y texto, como resumenes de reuniones o clasificacion de llamadas.
- Prototipado de agentes conversacionales: el endpoint compatible con OpenAI de vLLM permite sustituir una API externa por este modelo en fase de desarrollo, reduciendo coste y latencia de red.
- Evaluacion de cuantizaciones para investigacion: sirve como referencia para medir la perdida de calidad (KL divergence objetivo < 0.014, recuperacion MMLU >= 99%) frente al BF16 en tareas multimodales.
- Despliegue en entornos con restricciones de privacidad: al ejecutarse on-premise con licencia Apache 2.0, es apto para procesar imagenes y texto sensibles sin salida a terceros.
- Servicio de inferencia de alto throughput: los benchmarks del autor reportan 6.268-6.635 tok/s totales segun la mezcla de entrada/salida, util para servir cargas batch en una sola GPU.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Throughput total (in2048_out512) | 6.622 tok/s (prompt+output) |
| Throughput total (in512_out256) | 6.268 tok/s (prompt+output) |
| Throughput total (in8192_out512) | 6.635 tok/s (prompt+output) |
| KL divergence vs BF16 (objetivo) | < 0.014 |
| Recuperacion MMLU (objetivo) | >= 99% |

Los datos de throughput proceden de la "88plug benchmark ladder" con vLLM v0.21.0 y lm-evaluation-harness, segun el autor. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, MMMU) en la informacion disponible; las cifras de KL y MMLU son objetivos de diseno, no mediciones confirmadas.

## Requisitos de hardware

- VRAM estimada: ~14 GB de pesos en W4A16 frente a ~28 GB en BF16; ~16 GB totales con KV cache fp8 a 32k tokens (frente a ~30 GB en BF16).
- GPU minima: 1x RTX 3090 de 24 GB o 1x RTX 4090; el modelo base en BF16 requiere una A100 de 40 GB segun el autor.
- Cabe en GPU consumer: si, en RTX 3090, RTX 4090 y previsiblemente en cualquier GPU con >= 24 GB de VRAM.
- Despliegue recomendado: vLLM >= 0.21 (deteccion automatica de compressed-tensors, sin flag `--quantization`); el autor indica soporte en SGLang; transformers con compressed-tensors funciona para muchos modelos de texto pero el multimodal puede requerir codigo personalizado; TGI no esta soportado para este formato; el widget de Hugging Face suele fallar.
- Throughput: 6.268-6.635 tok/s totales segun la mezcla de entrada/salida en la configuracion de referencia del autor.
- Latencia: no disponible de forma desagregada (solo throughput agregado).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| 88plug/Gemma4-E4B-it-W4A16 | 7,94B totales / 4B activos | 32k | compressed-tensors W4A16 | Apache 2.0 | Primera W4A16 nativa vLLM para Gemma4 E4B segun el autor; RTN datafree provisional |
| google/gemma-4-e4b-it | 4B activos (MoE) | no disponible | BF16 | Apache 2.0 | Modelo base; techo de calidad, requiere A100 40GB |
| RedHatAI/gemma-3n-E4B-it-quantized.w4a16 | 4B activos (generacion anterior) | no disponible | compressed-tensors W4A16 | Apache 2.0 | Mismo formato, generacion previa de Gemma |
| 88plug/Gemma4-E4B-it-W8A16 | 7,94B totales / 4B activos | 32k | compressed-tensors W8A16 | Apache 2.0 | Variante de mayor precision del mismo autor |

## Limitaciones y advertencias

- Cuantizacion provisional: RTN datafree sin calibracion; el autor anuncia re-cuantizacion, por lo que los pesos pueden cambiar y los resultados actuales no son definitivos.
- AutoRound no aplicado: el metodo de cuantizacion mas preciso quedo bloqueado por la estructura de Gemma4, lo que puede implicar mayor perdida de calidad que una cuantizacion calibrada.
- Solo ingles: el campo `language` declara unicamente `en`; el rendimiento en castellano no esta garantizado.
- Riesgo de alucinacion: inherente a los modelos generativos; no se han publicado evaluaciones de factualidad en la informacion disponible.
- Sesgos: no se documentan analisis de sesgo en la informacion proporcionada.
- Compatibilidad de runtime restringida: no funciona con TGI ni con el widget de Hugging Face; requiere vLLM >= 0.21 o SGLang, y el multimodal en transformers puede necesitar codigo a medida.
- Discrepancia en el recuento de parametros: safetensors reporta 7,94B totales mientras el model card cita "26B+"; conviene verificar el contenido real del checkpoint antes de asumir equivalencia con el modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base de Google puede tener terminos adicionales de uso aceptable que conviene revisar.
- Calidad multimodal no evaluada: no hay benchmarks de MMMU ni de tareas de vision/audio publicados para esta cuantizacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/88plug/Gemma4-E4B-it-W4A16
- Modelo base: https://huggingface.co/google/gemma-4-e4b-it
- Variante W8A16 del mismo autor: https://huggingface.co/88plug/Gemma4-E4B-it-W8A16
- Cuantizacion comparable de la generacion anterior: https://huggingface.co/RedHatAI/gemma-3n-E4B-it-quantized.w4a16
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- Repositorio de llmcompressor: https://github.com/vllm-project/llmcompressor
- Repositorio de compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- Repositorio de SGLang: https://github.com/sgl-project/sglang
- Paper, blog o demo oficial del modelo base: no disponible en la informacion proporcionada.
