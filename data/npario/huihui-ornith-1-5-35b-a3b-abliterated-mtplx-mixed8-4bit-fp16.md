# npario/Huihui-Ornith-1.5-35B-A3B-abliterated-MTPLX-mixed8-4bit-FP16

## Resumen

Huihui-Ornith-1.5-35B-A3B-abliterated-MTPLX-mixed8-4bit-FP16 es una forja (build cuantizada) del modelo huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated, a su vez una version "abliterated" (eliminacion de rechazos en las capas 11 a 29) del modelo ornith-ai/Ornith-1.5-35B-A3B. La publica el usuario npario en HuggingFace y esta empaquetada especificamente para inferencia nativa en Apple Silicon mediante MTPLX, un runtime que implementa decodificacion especulativa MTP (multi-token prediction) sobre MLX.

El modelo subyacente es un transformer de tipo Mixture-of-Experts con 35.107.180.016 parametros totales y 3B de parametros activos por token (la nomenclatura A3B), lo que permite un coste de computo por token propio de un modelo de 3B pese a disponer de la capacidad de uno de 35B. La forja combina cuantizacion mixta: los expertos MoE en 4 bits con grupo 32, y las proyecciones de atencion, gates, embeddings y lm_head en 8 bits con grupo 64, manteniendo tronco y sidecar MTP en FP16.

Su relevancia es doble. Por un lado, demuestra un flujo de despliegue de un MoE de 35B en un portatil con Apple Silicon (M1 Max 64 GB) a velocidades de entre 51 y 74 tokens por segundo. Por otro, al ser una variante abliterated sin rechazos, esta orientada a casos de uso donde el filtrado de seguridad del modelo original resulta limitante, lo que exige una evaluacion cuidadosa de riesgos antes de usarla en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (qwen3_5_moe / qwen3-moe) con atencion hibrida (self_attn + linear_attn) y MTP |
| Parametros totales | 35.107.180.016 |
| Parametros activos | 3B (aproximado, segun nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: 4-bit affine grupo 32 (expertos MoE), 8-bit affine grupo 64 (linear_attn, q/k/v/o, mlp.gate, shared_expert_gate, lm_head, embed_tokens), tronco y sidecar MTP en FP16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), tamano del repo 25,3 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con atencion hibrida: combina capas de self-attention clasica con proyecciones linear_attn, un esquema habitual en las arquitecturas qwen3-moe recientes para reducir el coste de atencion en contextos largos. Los expertos MoE se activan de forma dispersa (3B de 35B parametros por token). La forja anade un sidecar MTP en FP16 que habilita decodificacion especulativa nativa, es decir, el modelo predice varios tokens por paso y el runtime los valida, acelerando la generacion.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o similar en el modelo original Ornith-1.5-35B-A3B. Si se conoce el proceso de abliteration aplicado por huihui-ai sobre las capas 11 a 29, que elimina la direccion de rechazo del espacio de activaciones. La forja MTPLX no reentrena pesos: solo cuantiza y reempaqueta para el runtime MLX, con la receta de cuantizacion mixta descrita en la tabla anterior.

## Capacidades

- Generacion de texto conversacional y de proposito general en modo text-generation.
- Razonamiento multi-paso y respuesta a instrucciones, heredado del modelo base Ornith 1.5.
- Capacidad MoE: 35B parametros totales con solo 3B activos, lo que reduce el coste por token.
- Decodificacion especulativa MTP integrada (modos D1, D2, D3) para acelerar la inferencia en Apple Silicon.
- Comportamiento sin rechazos (abliterated/uncensored) en las capas 11 a 29.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles.
- Cobertura multilingue: no disponible.

## Casos de uso

- Prototipado local en Mac: investigadores que trabajan en un M1 Max o superior pueden servir un MoE de 35B en local con MTPLX y obtener entre 51 y 74 tokens por segundo, suficiente para iterar sobre prompts y evaluaciones sin depender de la nube.
- Generacion de texto creativo sin filtros: la variante abliterated permite explorar narrativa, guiones o dialogos donde los rechazos del modelo original interrumpirian la generacion; util en entornos editoriales controlados.
- Investigacion sobre alineacion y seguridad: el modelo sirve como caso de estudio de que ocurre al eliminar la direccion de rechazo en capas intermedias, comparando respuestas con el modelo original no abliterated.
- Asistentes conversacionales internos: despliegue en estaciones de trabajo Apple Silicon para tareas de redaccion, resumen y clasificacion donde el contenido sensible esta acotado y auditado.
- Evaluacion de decodificacion especulativa: el sidecar MTP y los modos D1/D2/D3 permiten medir el impacto real del speculative decoding en hardware Apple, con el perfil "sustained" documentado por el autor.
- Generacion de datos sinteticos: al no rechazar peticiones, puede producir datasets de entrenamiento en dominios donde el filtrado reduciria la diversidad, siempre con revision humana posterior.
- Pruebas de cuantizacion mixta: la receta 4-bit/8-bit/FP16 sirve para estudiar el equilibrio entre calidad y velocidad en MoE sobre MLX.

## Benchmarks y rendimiento

El autor publica mediciones de velocidad en un M1 Max de 64 GB, no de calidad:

| Modo | Tokens/s | Aceleracion vs AR |
|---|---|---|
| AR (autoregresivo) | 51,1 | 1,00x |
| D1 | 68,2 | 1,34x |
| D2 | 74,8 | 1,46x |
| D3 | 73,3 | 1,44x |
| D2 (ajustado, mejor) | 74,0 | 1,49x |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/unified memory: el repo pesa 25,3 GB; se recomienda al menos 32 GB de memoria unificada y, para trabajar con holgura de contexto, 64 GB.
- Hardware objetivo: Apple Silicon (M1, M2, M3 y posteriores). El autor indica que el camino FP16 nativo esta optimizado para M1/M2, que carecen de BF16 nativo, y funciona igualmente en M3+.
- Medicion de referencia: M1 Max 64 GB a 51,1 tok/s en modo AR y hasta 74,8 tok/s en modo D2.
- GPU NVIDIA: no soportado de forma nativa por este paquete, que es MLX/safetensors para Apple Silicon; para CUDA habria que recurrir al modelo base o a otras cuantizaciones.
- Despliegue: `mtplx serve --model r3lax/Huihui-Ornith-1.5-35B-A3B-abliterated-MTPLX-mixed8-4bit-FP16 --download` (MTPLX 2.11.2). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en esta forja.
- Latencia y throughput: los indicados en la tabla de benchmarks, perfil "sustained".

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| Este modelo (MTPLX mixed8-4bit) | 35,1B | 3B | no disponible | safetensors MLX | MIT | Abliterated, MTP, optimizado Apple Silicon |
| huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated | 35B | 3B | no disponible | safetensors | MIT (segun modelo base) | Modelo base sin cuantizar ni forja MTPLX |
| ornith-ai/Ornith-1.5-35B-A3B | 35B | 3B | no disponible | safetensors | no disponible | Modelo original con filtrado de seguridad |
| Otras cuantizaciones del mismo base (GGUF, etc.) | 35B | 3B | no disponible | GGUF / otros | MIT | Compatibles con llama.cpp y hardware no Apple |

## Limitaciones y advertencias

- Modelo abliterated: se han eliminado los rechazos en las capas 11 a 29, por lo que puede generar contenido danino, ilegal o eticamente problematico sin filtro. No apto para exposicion directa a usuarios finales sin moderacion externa.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad; al ser una cuantizacion mixta con expertos en 4 bits, puede degradarse la calidad respecto al modelo original en tareas sensibles a precision.
- Contexto maximo no documentado: no se conoce la ventana de contexto soportada por la forja ni por el base.
- Idiomas: no se especifica cobertura; el rendimiento fuera del ingles y el chino es incierto.
- Licencia MIT declarada, pero conviene verificar la licencia del modelo original Ornith-1.5-35B-A3B, ya que la cadena de derivacion incluye dos modelos intermedios.
- Dependencia de MTPLX 2.11.2 y de MLX: no hay soporte documentado para CUDA, vLLM, llama.cpp u Ollama en este paquete concreto.
- Solo 121 descargas y 0 likes en el momento de la consulta: comunidad muy pequena, sin validacion independiente de calidad ni de estabilidad.
- El identificador del comando de ejemplo (`r3lax/...`) no coincide con el ID del repo (`npario/...`); verificar la ruta antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/npario/Huihui-Ornith-1.5-35B-A3B-abliterated-MTPLX-mixed8-4bit-FP16
- Modelo base intermedio: https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated
- Modelo original: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Runtime MTPLX: no disponible (no se proporciona enlace en la informacion)
- Paper o blog tecnico: no disponible
