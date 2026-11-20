# magnitudedev/DeepSeek-V4.1-Flash-1017-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017 es un modelo multimodal de tipo image-text-to-text desarrollado por DeepSeek, distribuido en este repositorio por magnitudedev en formato GGUF para su uso con el runtime Magnitude. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con aproximadamente 754.600 millones de parametros totales, lo que lo situa en la categoria de modelos frontera de gran escala. El repositorio incluye el modelo de texto, un proyector de vision y un drafter especulativo (DSpark).

La particularidad de esta publicacion es que preserva los pesos en su precision nativa: los expertos enrutados se almacenan en MXFP4 y las proyecciones densas y tablas Engram en FP8 (F8_E4M3) con escalas UE8M0 por bloques, en lugar de convertir a BF16 (que duplicaria el tamano) o a Q8_0 (que redondearia los pesos). Esto hace que el modelo sea lossless respecto al checkpoint original, pero implica que no carga en llama.cpp, ya que este no soporta los tensores de escala separados.

Es relevante ahora porque ofrece una via para ejecutar un modelo de esta magnitud sin degradacion de pesos, con licencia MIT (una de las mas permisivas del ecosistema) y con capacidades multimodales y de decodificacion especulativa integradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con proyector de vision; pesos densos y Engram en FP8, expertos enrutados en MXFP4 |
| Parametros totales | 754.645.503.104 (aprox. 754,6 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (expertos enrutados), F8_E4M3 con escalas UE8M0 (proyecciones densas y tablas Engram), BF16 y F32 (resto); sin conversion a Q8_0 ni BF16 global |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (8 shards para el modelo de texto, mas drafter DSpark y proyector de vision) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Mixture-of-Experts con expertos enrutados almacenados en MXFP4 tal como los publico DeepSeek. Las proyecciones densas se guardan en F8_E4M3 en el tensor `X.weight`, acompanadas de escalas UE8M0 por tile de 32 x 32 en el tensor `X.scale` (tipo I8). Las tablas Engram (embeddings por capa) siguen el mismo esquema en `per_layer_token_embd.weight` con escalas UE8M0 cada 32 elementos. El resto de pesos permanece en BF16 y F32. La metadata `magnitude.scale_encoding = "ue8m0"` marca los tensores de escala como exponentes UE8M0 (valor `2^(b - 127)`), que Magnitude aplica en tiempo de lectura.

El repositorio incluye un drafter especulativo DSpark de 7,9 GB, lo que sugiere soporte de decodificacion especulativa para acelerar la inferencia, y un proyector de vision de 1,0 GB para las capacidades image-text-to-text. La conversion se realizo desde la revision `1bae0e1` del checkpoint original y se verifico byte a byte. Los nombres de tensores y la metadata siguen el conversor `deepseek41` de llama.cpp v0.9.0. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional y razonamiento general.
- Procesamiento de imagenes y texto combinados (pipeline image-text-to-text) mediante el proyector de vision incluido.
- Capacidades de codigo y matematicas (inferidas de la categoria del modelo base; no confirmadas con benchmarks en la informacion disponible).
- Decodificacion especulativa mediante el drafter DSpark incluido.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia multimodal de alta fidelidad: el modelo procesa pares imagen-texto mediante el proyector de vision incluido, adecuado para tareas de descripcion de imagenes, VQA o extraccion de informacion visual sin perdida de precision en los pesos.
- Despliegue en infraestructura con presupuesto de memoria ajustado: al mantener los expertos en MXFP4 y los densos en FP8 nativo, se evita el coste de duplicar el modelo a BF16, lo que resulta critico en un modelo de 754,6 mil millones de parametros.
- Investigacion sobre cuantizacion lossless: el repositorio sirve como referencia para estudiar el impacto de preservar escalas FP8 frente a conversiones Q8_0 o BF16 en modelos MoE de gran escala.
- Aceleracion con decodificacion especulativa: el drafter DSpark de 7,9 GB permite reducir la latencia en generacion autoregresiva integrándolo en el runtime Magnitude.
- Pipelines conversacionales de contexto largo: aunque la longitud de contexto no esta documentada, la escala del modelo y la etiqueta `conversational` lo orientan a dialogos multi-turno en produccion.
- Evaluacion comparativa de modelos frontera: util para benchmarking interno de calidad frente a otros MoE de escala similar, con la ventaja de que los pesos no estan redondeados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo de texto ocupa 501,4 GB en 8 shards, el drafter DSpark 7,9 GB y el proyector de vision 1,0 GB; se requiere un total aproximado de 510 GB de almacenamiento y VRAM equivalente para cargar todo en memoria.
- GPU recomendadas: no disponible en la informacion proporcionada; por el volumen de pesos, se necesitan multiples aceleradores de alta capacidad (clase H100/A100 en configuracion multi-GPU), aunque no se confirma en la documentacion.
- Cabe en consumer GPU: no; el tamano de 501,4 GB del modelo de texto excede con creces la VRAM de cualquier GPU de consumo.
- Opciones de despliegue: runtime Magnitude (unico soportado segun la model card); llama.cpp no carga estos ficheros por falta de soporte para los tensores de escala UE8M0.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 (este repo, GGUF Magnitude) | 754,6 mil M | no disponible | MIT | GGUF (MXFP4 + FP8) | Pesos lossless, solo runtime Magnitude |
| DeepSeek-V4.1-Flash-1017 (checkpoint original) | 754,6 mil M | no disponible | MIT | safetensors | Referencia base, revision `1bae0e1` |
| GGUFs de llama.cpp del mismo modelo | 754,6 mil M | no disponible | MIT | GGUF (BF16 o Q8_0) | BF16 duplica tamano; Q8_0 redondea pesos |
| Otros MoE frontera de escala similar | no disponible | no disponible | no disponible | no disponible | Sin datos en la informacion proporcionada |

## Limitaciones y advertencias

- Incompatibilidad con llama.cpp: los tensores de escala UE8M0 no estan soportados, por lo que los ficheros no cargan en llama.cpp ni en herramientas derivadas; el unico runtime confirmado es Magnitude.
- Requisitos de hardware extremos: 501,4 GB solo para el modelo de texto, lo que excluye cualquier despliegue en GPU de consumo y exige infraestructura multi-GPU de gama alta.
- Idiomas soportados no documentados: no se puede garantizar cobertura multilingue sin validacion previa.
- Longitud de contexto no disponible: impide planificar casos de uso con ventanas largas sin pruebas empiricas.
- Riesgo de alucinacion: inherente a los modelos generativos de gran escala; no se han publicado evaluaciones de fidelidad en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Licencia MIT: permisiva para uso comercial, pero conviene verificar las condiciones del checkpoint original de DeepSeek y de las dependencias del runtime Magnitude.
- Parametros activos no disponibles: al ser MoE, el coste computacional real por token depende de los expertos enrutados, dato que no se publica aqui.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/magnitudedev/DeepSeek-V4.1-Flash-1017-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Revision del checkpoint convertido: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017/tree/1bae0e1088993b9b82de08f59de5be5a34e42170
- Magnitude: https://magnitude.dev
- Conversor `deepseek41` de llama.cpp v0.9.0: https://github.com/ggml-org/llama.cpp/releases/tag/v0.9.0
