# mavis-ai/Qwen3.8-27B-Q3T

## Resumen

Qwen3.8-27B-Q3T es una cuantización de tipo Q3T del modelo multimodal Qwen3.8-27B, publicada por mavis-ai como derivado empaquetado para su plataforma R.E.V.I.S. (un "Cognitive OS" local para IA multiagente en Mac). No es un fine-tune ni un modelo entrenado desde cero: es una conversión sin datos (data-free) del checkpoint oficial de Qwen, redistribuida bajo licencia Apache 2.0. El objetivo es hacer viable en Apple Silicon un modelo denso multimodal de 27B nominales (13.456.936.176 parámetros reales según safetensors) con un peso en disco de 15,99 GB decimales (14,9 GiB).

La arquitectura del modelo base es un transformer denso híbrido de 64 capas: 48 capas con Gated DeltaNet (atención lineal/SSM híbrida) y 16 capas de atención completa, con hidden size 5120, MLP intermedio de 17408 y vocabulario de 248320 tokens. Soporta contexto de 262144 tokens y entrada de texto, imágenes y vídeo. La cuantización Q3T combina MLP codificado en trellis a 3 bits (K3, codebook MCG estilo EXL3) con proyecciones de atención y Gated DeltaNet a 6 bits afines (group size 64), embeddings y LM head a 8 bits, y torre de visión y tensores sensibles en BF16.

La relevancia de esta ficha es doble: por un lado documenta un formato de cuantización poco habitual (trellis con decodificación específica) que no funciona en mlx-lm, mlx-vlm, transformers ni vLLM, sino solo en el motor propietario R.E.V.I.S. v1.3.0 o superior; por otro, incluye drafters de decodificación especulativa (DFlash 2 y MTP) empaquetados junto al modelo principal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido: 64 capas (48 Gated DeltaNet + 16 full attention), hidden size 5120, MLP intermediate 17408, vocab 248320 |
| Parametros totales | 13.456.936.176 (según safetensors); el nombre comercial indica 27B nominales |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262144 tokens |
| Tipos de cuantizacion | Q3T: MLP trellis K3 (3 bits), proyecciones 6-bit affine (group size 64), embeddings y LM head 8-bit affine, tensores selectos y torre de visión en BF16; KV cache en runtime a 8 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model-core + 8 shards trellis), más drafters en safetensors 8-bit affine; requiere decodificación trellis específica |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso multimodal con una arquitectura híbrida: 48 de sus 64 capas usan Gated DeltaNet (una variante de atención lineal con estado recurrente), mientras que las 16 restantes emplean atención completa. Esta mezcla reduce el coste de atención en contextos largos manteniendo capacidad de atención global. La dimensión oculta es 5120, el MLP intermedio 17408 y el vocabulario 248320 tokens. El modelo acepta texto, imágenes y vídeo, con una torre de visión y una proyección multimodal dedicadas.

Sobre el entrenamiento del modelo base, la información disponible no detalla número de tokens, composición del dataset ni si hubo RLHF/DPO; esos datos corresponden a la model card oficial de Qwen/Qwen3.8-27B, no incluida en la información proporcionada. La conversión Q3T es explícitamente data-free: no hay calibración, Hessian rounding, importance matrix ni quantización-aware training. El MLP se codifica en trellis con codebook MCG estilo EXL3 (receta v3-gss115), rotación Hadamard de 128 puntos y vectores de signo por canal (suh, svh); la codificación minimiza el MSE sobre pesos rotados. Las proyecciones se cuantizan con `mx.quantize` (round to nearest) desde la fuente BF16. La regla R1 eleva a 8 bits cualquier tensor cuya tasa de error trellis (MSE relativo) supere 1,5 veces la mediana de su clase, lo que afecta a los `out_proj` de Gated DeltaNet de las capas 0 y 1 y al `o_proj` de atención de la capa 3. Se mantienen en BF16 las proyecciones de selección `in_proj_a`/`in_proj_b`, `conv1d`, `A_log`, `dt_bias`, todas las normas y la torre de visión completa.

Como innovación destacable, el paquete incluye dos drafters de decodificación especulativa: DFlash 2 (block drafter, 8-bit affine g64, 2,35 GB) y MTP (8-bit affine g64, 0,50 GB), que suman 2,85 GB adicionales. El objetivo es acelerar la generación en el motor R.E.V.I.S.

## Capacidades

- Generación de texto conversacional y razonamiento general, heredados del modelo base Qwen3.8-27B.
- Procesamiento de imagen y vídeo además de texto (pipeline image-text-to-text), gracias a la torre de visión mantenida en BF16.
- Contexto largo de hasta 262144 tokens, adecuado para documentos extensos, historiales de conversación y bases de código grandes.
- Decodificación especulativa integrada mediante DFlash 2 y MTP, orientada a reducir latencia en el motor R.E.V.I.S.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: el modelo está empaquetado específicamente para R.E.V.I.S., descrito como "Cognitive OS for Multi-Agentic AI", lo que sugiere uso agéntico, aunque no se detallan capacidades concretas.
- Capacidades multilingües: no disponible.
- Modo thinking explícito, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistentes locales multiagente en Mac: el paquete está diseñado para R.E.V.I.S. v1.3.0+, un sistema de agentes que corre íntegramente en local en Apple Silicon; el modelo actúa como motor de razonamiento y conversación sin depender de la nube.
- Análisis de documentos largos con imágenes: la combinación de contexto de 262144 tokens y entrada image-text-to-text permite procesar informes, contratos o manuales con figuras en una sola pasada.
- Procesamiento de vídeo para resumen o descripción: la torre de visión en BF16 y la entrada de vídeo declarada permiten tareas de captioning o extracción de información de secuencias.
- Desarrollo de prototipos de agentes con razonamiento multi-paso: el empaquetado con drafters especulativos y la orientación a R.E.V.I.S. lo hacen adecuado para pipelines agénticos donde la latencia de generación importa.
- Inferencia privada en estación de trabajo: al ejecutarse localmente en Mac con pesos de 15,99 GB, encaja en escenarios donde no se permite enviar datos a APIs externas (salud, legal, datos internos).
- Evaluación de formatos de cuantización trellis: investigadores interesados en comparar Q3T (K3 + 6-bit) frente a otras recetas pueden usar este paquete como referencia reproducible, dado que incluye manifiestos y sumas SHA-256.
- Chat multimodal de escritorio: conversaciones multi-turno con imágenes intercaladas, aprovechando el contexto largo y la torre de visión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/espacio estimado: pesos de 15,99 GB decimales (14,9 GiB) más 2,85 GB de drafters; en total unos 18,9 GB de repositorio. La KV cache en runtime es de 8 bits, lo que reduce el coste con contexto largo, pero 262144 tokens siguen requiriendo memoria adicional significativa.
- Plataforma objetivo: Apple Silicon (Mac). El formato trellis no está soportado por mlx-lm, mlx-vlm, transformers ni vLLM; solo funciona en R.E.V.I.S. v1.3.0 o superior, cuyo motor incluye los kernels de decodificación trellis.
- GPU recomendadas: no disponible. El paquete está pensado para Mac con memoria unificada; no se documentan requisitos para A100, H100 ni RTX 4090.
- ¿Cabe en GPU consumer? No disponible para CUDA. En Mac, el tamaño de pesos (14,9 GiB) sugiere que necesita equipos con memoria unificada de al menos 24-32 GB para dejar margen a la KV cache y al runtime, aunque el autor no lo especifica.
- Opciones de despliegue: exclusivamente R.E.V.I.S. v1.3.0+ según la model card. No compatible con vLLM, llama.cpp, Ollama, TGI ni MLX estándar.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad / runtime |
|---|---|---|---|---|---|
| mavis-ai/Qwen3.8-27B-Q3T | 13,46B reales (27B nominales) | 262144 | Texto, imagen, vídeo | Apache 2.0 | Solo R.E.V.I.S. v1.3.0+ |
| Qwen/Qwen3.8-27B (base) | 27B nominales | 262144 | Texto, imagen, vídeo | Apache 2.0 | transformers, MLX, vLLM (BF16) |
| mlx-community/Qwen3.8-27B-bf16 | 27B nominales | 262144 | Texto, imagen, vídeo | Apache 2.0 | mlx-lm / mlx-vlm |
| Otras cuantizaciones Q4T/Q5T de la familia T | no disponible | 262144 | Texto, imagen, vídeo | Apache 2.0 | Solo R.E.V.I.S. |

La comparativa se limita a derivados del mismo modelo base porque no se dispone de datos de benchmarks ni de especificaciones de alternativas de otros autores en la información proporcionada. La diferencia clave frente al checkpoint BF16 es el tamaño (15,99 GB frente a un BF16 sustancialmente mayor) y la compatibilidad: la cuantización Q3T sacrifica portabilidad a cambio de reducir huella en Apple Silicon.

## Limitaciones y advertencias

- Compatibilidad muy restringida: no funciona en mlx-lm, mlx-vlm, transformers ni vLLM; requiere R.E.V.I.S. v1.3.0 o superior. Esto limita su uso fuera del ecosistema del autor.
- La cuantización es data-free y sin calibración: no hay garantía de que el error de cuantización sea uniforme en todas las tareas; el MLP a 3 bits es agresivo y puede degradar tareas sensibles a precisión numérica.
- Riesgo de alucinación inherente al modelo base, no cuantificado en la información disponible.
- Idiomas soportados no documentados en esta ficha; no se puede confirmar cobertura multilingüe más allá de lo que declare el modelo base.
- Sesgos conocidos: no disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor declara no tener derechos sobre el modelo subyacente y remite a la licencia de Qwen. El uso comercial del formato trellis puede depender de la implementación de los kernels en R.E.V.I.S.
- El paquete incluye manifiestos que describen la conversión, no una verificación de forward pass en el motor; la model card aclara que `runtime_forward_verified` e `inference_test_run` se refieren al paso de conversión y que el soporte del motor llegó después.
- La KV cache a 8 bits puede introducir degradación adicional en contextos muy largos.
- Los datos de benchmarks, latencia y throughput no están publicados, lo que impide evaluar el impacto real de la cuantización frente al BF16.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mavis-ai/Qwen3.8-27B-Q3T
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- Conversión BF16 MLX de referencia: https://huggingface.co/mlx-community/Qwen3.8-27B-bf16
- Web oficial de R.E.V.I.S.: https://mavis-ai.co.jp/revis/
- X del autor: https://x.com/mavis_ai_jp
- Paper referenciado en tags: arxiv:2602.06036 (no verificado en la información disponible)
