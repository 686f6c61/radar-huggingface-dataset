# mavis-ai/Qwen3.6-35B-MoE-Q5T

## Resumen

mavis-ai/Qwen3.6-35B-MoE-Q5T es una cuantizacion derivada del checkpoint multimodal Qwen/Qwen3.6-35B-A3B, publicada por el usuario mavis-ai. No es un fine-tune: no se ha aplicado ningun tipo de entrenamiento, solo una receta de cuantizacion fija y sin datos de calibracion (data-free). El resultado es un paquete de pesos en formato Q5T pensado para ejecutarse en R.E.V.I.S., un "Cognitive OS" local para IA multiagente en Mac desarrollado por el mismo autor.

El modelo base es un MoE multimodal con 40 capas, hidden size 2048 y 256 expertos enrutados de los que se activan 8, mas un experto compartido, con una longitud de contexto de 262.144 tokens y una torre de vision en BF16 (pipeline image-text-to-text). La build Q5T almacena los expertos enrutados como tensores con codificacion trellis de 5 bits y el resto de modulos lineales en 8 bits afines con group size 64. El recuento real de parametros de los safetensors es de 13.039.900.016, aunque el modelo base se comercializa con la denominacion 35B-A3B.

Su relevancia es limitada y muy especifica: es un artefacto de despliegue para Apple silicon con decodificacion especulativa integrada (drafters MTP y DFlash), no un modelo de proposito general. De hecho, el propio autor advierte de que esta build Q5T todavia no esta soportada por la version actual del motor R.E.V.I.S., que carga Q4T y Q3T pero rechaza K5 en tiempo de carga, y de que no funciona en mlx-lm, mlx-vlm, transformers ni vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (40 capas, hidden size 2048, 256 expertos enrutados con 8 activos + 1 experto compartido), con proyecciones de atencion lineal y torre de vision |
| Parametros totales | 13.039.900.016 (recuento real de safetensors); el modelo base se denomina Qwen3.6-35B-A3B |
| Parametros activos | 8 de 256 expertos enrutados mas 1 compartido; la nomenclatura A3B del modelo base sugiere del orden de 3.000 millones de parametros activos, no confirmado de forma explicita en la informacion disponible |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q5T (K5 + N8): expertos enrutados en trellis de 5 bits con rotacion Hadamard de 128 puntos y vectores de signo por canal; resto de lineales en 8 bits affine, group size 64; routers, gates, normas e `in_proj` de atencion lineal en BF16; torre de vision en BF16; cache KV en 8 bits en tiempo de ejecucion |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (nucleo dense/attention/embeddings/routers/vision + 8 ficheros de expertos con tensores trellis `.trellis`, `.suh`, `.svh`); drafters en safetensors de 8 bits afines |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE multimodal de 40 capas con hidden size 2048, 256 expertos enrutados con top-8 activos y un experto compartido, mas una torre de vision. Esta build no modifica esa topologia: solo cambia la representacion numerica de los pesos. La cuantizacion de los expertos enrutados usa trellis coding sobre mosaicos de 16x16, con 5 bits por peso y un codebook MCG, precedido de una rotacion Hadamard de 128 puntos y de signos por canal (`suh`, `svh`). La codificacion minimiza el error cuadratico medio sobre los pesos rotados, sin conjunto de calibracion, sin redondeo tipo Hessian, sin matriz de importancia y sin quantization-aware training. El resto de modulos lineales (proyecciones de atencion, atencion lineal, experto compartido, embeddings y LM head) se cuantizan a 8 bits afines con group size 64 mediante `mx.quantize` con redondeo al mas cercano desde el original en BF16.

Los tensores que participan en decisiones discontinuas se mantienen intactos en BF16: el router (`mlp.gate`), `shared_expert_gate`, las proyecciones `in_proj_a`/`in_proj_b` de la atencion lineal, las normas y toda la torre de vision. El paquete incluye ademas decodificacion especulativa: un drafter MTP (`Draft-Q8`, 0,91 GB) con su `ProposalHead` (0,22 GB) y un drafter de bloques DFlash-Q8 (0,44 GB), 1,60 GB en total. No se publica informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens vistos ni si hubo RLHF o DPO, por lo que esos datos no estan disponibles en esta ficha.

## Capacidades

- Generacion de texto y conversacion multi-turno, con plantilla de chat propia (`chat_template.jinja`) y pipeline declarado de image-text-to-text.
- Entrada multimodal de imagen y texto (torre de vision en BF16, con `preprocessor_config.json`, `processor_config.json` y `video_preprocessor_config.json`, lo que sugiere soporte de video en el modelo base).
- Razonamiento con contexto muy largo: hasta 262.144 tokens teoricos, adecuado para documentos extensos y sesiones de agente prolongadas.
- Decodificacion especulativa integrada mediante drafter MTP y drafter de bloques DFlash, orientada a reducir latencia en inferencia autoregresiva.
- Ejecucion local en Apple silicon bajo el motor de R.E.V.I.S., con pesos disenados para mapear expertos de forma independiente.
- Soporte de tool calling, function calling y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Modo de pensamiento explicito (thinking mode): no disponible.

## Casos de uso

- Asistente de agente local en Mac: el paquete esta pensado para el motor de R.E.V.I.S., de modo que un usuario con Apple silicon pueda ejecutar un MoE multimodal sin enviar datos a la nube. Requiere una version del motor que soporte Q5T, que a dia de hoy no existe.
- Analisis de documentos largos con imagen: combinando la ventana de 262.144 tokens con la torre de vision, se puede procesar un informe con figuras, tablas escaneadas y texto extenso en una sola pasada, sin troceado agresivo.
- Pipeline de investigacion sobre cuantizacion: el modelo es util como artefacto de estudio del esquema trellis K5 frente a cuantizacion affine convencional, con drafters MTP y DFlash incluidos para medir el efecto de la decodificacion especulativa.
- Reproduccion de medidas de divergencia de distribucion: el autor describe la evaluacion de KLD frente a BF16 sobre 48 documentos y 17.877 posiciones, lo que permite usar el paquete como referencia en experimentos de fidelidad de cuantizacion.
- Procesamiento por lotes de datos sensibles en local: entornos con requisitos de soberania de datos (legal, sanitario, defensa) donde no se permite salida a API externa y se dispone de hardware Apple.
- Base para derivados futuros: dado que la licencia es Apache 2.0 y el recuento de parametros es contenido, sirve como punto de partida para construir variantes multimodales ligeras sobre Mac, siempre que se resuelva la incompatibilidad con los motores de inferencia habituales.
- Evaluacion comparativa de builds Q3T/Q4T/Q5T: el mismo autor publica variantes de la familia T con distinta tasa de expertos y anchura dense, lo que permite comparar calidad y huella de memoria en un mismo equipo.

## Benchmarks y rendimiento

El autor describe una evaluacion de distancia entre distribuciones de siguiente token (KLD frente al modelo BF16) sobre 48 documentos y 17.877 posiciones puntuadas, en tres estratos (WikiText-2, documentos tecnicos y respuestas del propio modelo), con vocabulario completo y cache KV emulada a 8 bits. Las comparaciones se hicieron en arneses de investigacion sobre GPU que decodifican los codigos trellis exactamente, no a traves del motor R.E.V.I.S. Los valores numericos concretos no aparecen en la informacion proporcionada.

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros). El autor indica ademas que las comparaciones con cuantizacion affine convencional se anadiran tras una remedicion con builds estandar, y que no se reporta velocidad.

## Requisitos de hardware

- Tamano de pesos: 23,81 GB decimales (22,2 GiB) para el nucleo y los expertos, mas 1,60 GB de drafters (MTP Draft-Q8, ProposalHead y DFlash-Q8). Tamano del repositorio: 25,4 GB.
- Memoria: se necesita al menos el espacio de los pesos mas la cache KV en 8 bits. Con contexto largo es razonable reservar 32 GB de memoria unificada o mas; el autor no publica una cifra oficial.
- Hardware objetivo: Apple silicon con memoria unificada. El modelo esta etiquetado como `apple-silicon` y sus kernels trellis viven en el motor de R.E.V.I.S.
- GPU: no disponible. El modelo no funciona en mlx-lm, mlx-vlm, transformers ni vLLM, por lo que no hay rutas de despliegue en CUDA documentadas.
- Consumer GPU: no aplicable segun la informacion disponible, dado que no existe soporte fuera del ecosistema R.E.V.I.S.
- Opciones de despliegue: motor de inferencia integrado en R.E.V.I.S. (website oficial: https://mavis-ai.co.jp/revis/). Las builds Q4T y Q3T estan soportadas desde R.E.V.I.S. v1.3.0; esta build Q5T (K5) es rechazada en tiempo de carga.
- Latencia y throughput: no disponibles. El autor declara explicitamente que no se reporta velocidad.

## Comparativa con modelos similares

| Modelo | Expertos enrutados | Dense / resto | Peso aprox. | Contexto | Soporte de motores | Licencia |
|---|---|---|---|---|---|---|
| mavis-ai/Qwen3.6-35B-MoE-Q5T | Trellis K5 (5 bits) | 8 bits affine, g64 | 22,2 GiB + 1,60 GB drafters | 262.144 | Solo R.E.V.I.S. (Q5T aun no soportado) | apache-2.0 |
| mavis-ai Q4T (misma familia) | Trellis K4 | 6 bits affine, g64 | No disponible en la informacion proporcionada | 262.144 | R.E.V.I.S. desde v1.3.0 | apache-2.0 |
| mavis-ai Q3T (misma familia) | Trellis K3 | 6 bits affine, g64 | No disponible en la informacion proporcionada | 262.144 | R.E.V.I.S. desde v1.3.0 | apache-2.0 |
| Qwen/Qwen3.6-35B-A3B (base) | BF16 | BF16 | No disponible | 262.144 | transformers, vLLM, mlx y otros | apache-2.0 |

Comparativas con cuantizaciones externas (por ejemplo builds GGUF o MLX de la comunidad) no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Incompatibilidad de despliegue critica: el modelo no se ejecuta en mlx-lm, mlx-vlm, transformers ni vLLM. Los expertos enrutados usan tensores trellis (`.trellis`, `.suh`, `.svh`) que requieren un computo de decodificacion trellis especifico.
- Esta build Q5T no esta soportada todavia por R.E.V.I.S.: el motor actual carga Q4T y Q3T y rechaza K5 en tiempo de carga. Publicarla no implica que sea utilizable hoy.
- Cuantizacion data-free: no hay conjunto de calibracion, ni matriz de importancia, ni redondeo consciente de la Hessiana. Esto puede degradar mas la calidad en tareas sensibles que una cuantizacion calibrada.
- Riesgo de alucinacion: no disponible de forma cuantificada en la informacion proporcionada; es un riesgo inherente a cualquier modelo de lenguaje.
- Idiomas soportados: no disponible, por lo que no se puede garantizar el comportamiento en castellano ni en otros idiomas distintos de los del modelo base.
- Los benchmarks reportados miden solo divergencia de distribucion (KLD) frente a BF16, no calidad en tareas. No se publican MMLU, HumanEval, GSM8K ni metricas de velocidad. La afirmacion `runtime_forward_verified: false` del manifiesto indica que la verificacion se hizo sobre los pesos efectivos, no sobre un forward completo del motor.
- Licencia Apache 2.0, permisiva para uso comercial, pero el autor declara no reclamar ninguna titularidad sobre el modelo subyacente: los derechos siguen siendo de los autores originales de Qwen. Cualquier uso en produccion debe cumplir tambien las condiciones del modelo base.
- Ausencia de adopcion: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado el artefacto.
- Repositorio con ficheros auxiliares de conversion (`q4t_manifest.json`, `q4t-split-lineage.json`, `q4t_sources.json`) que describen el paso de cuantizacion y listan entradas de cache local ajenas al repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mavis-ai/Qwen3.6-35B-MoE-Q5T
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- R.E.V.I.S. (website oficial): https://mavis-ai.co.jp/revis/
- Cuenta de X del autor: https://x.com/mavis_ai_jp
- Paper referenciado en las etiquetas: https://arxiv.org/abs/2602.06036
- Repositorio o demo adicional: no disponible en la informacion proporcionada.
