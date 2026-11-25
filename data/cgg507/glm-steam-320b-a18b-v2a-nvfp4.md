# cgg507/GLM-Steam-320B-A18B-v2a-NVFP4

## Resumen
GLM-Steam-320B-A18B-v2a-NVFP4 es una cuantizacion NVFP4 (W4A4) del modelo TheDrummer/GLM-Steam-320B-A18B-v2-FP8, publicada por el usuario cgg507. El modelo subyacente pertenece a la familia GLM-5 (arquitectura `Glm5NextForConditionalGeneration`, la misma que GLM-5.3-Flash) y es un transformer de tipo mezcla de expertos (MoE) con capacidad multimodal image-text-to-text. El checkpoint cuantizado mantiene en BF16 la torre de vision, las capas densas, los expertos compartidos, el router, los embeddings y el `lm_head`, mientras que los expertos enrutados de las capas 3-44 se almacenan en FP4 E2M1 con escalas FP8.

La relevancia de esta publicacion es practica: reduce el peso del repositorio a unos 198 GB y aplica un esquema de cuantizacion de 4 bits con escalas por grupo (grupo de 16) que sigue la receta de RedHatAI/GLM-5.3-Flash-NVFP4, de modo que deberia cargarse igual en vLLM y nmoe. No obstante, el autor advierte explicitamente de que el modelo no se ha probado mas alla de comprobaciones offline de layout de tensores, error de dequantizacion y parseo de configuracion.

El numero de parametros reportado en safetensors es de 169.120.127.838 (unos 169,1 mil millones), pese a que el nombre comercial del modelo indique "320B". El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la licencia y los idiomas no estan declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (`Glm5NextForConditionalGeneration`, misma que GLM-5.3-Flash) |
| Parametros totales | 169.120.127.838 (~169,1 B, segun safetensors) |
| Parametros activos | no disponible (el nombre indica A18B, no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 (FP4 E2M1 en pesos y activaciones, grupo 16, escalas de grupo FP8 E4M3, escala global FP32); FP8 E4M3 con bloques [128,128] en expertos MTP; BF16 en el resto |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (compressed-tensors, `mixed-precision`) |

## Arquitectura y entrenamiento
El modelo es un transformer MoE con atencion y componentes KDA, indexer, expertos compartidos, capas densas (0-2) y una capa MTP (multi-token prediction) en la posicion 45. La torre de vision se mantiene intacta en BF16, lo que habilita la modalidad image-text-to-text. El checkpoint no se ha entrenado desde cero: es una cuantizacion post-entrenamiento del modelo FP8 de TheDrummer, que a su vez deriva de la familia GLM-5.

La receta de cuantizacion usa llm-compressor 0.15.0, compressed-tensors 0.20.1 y transformers 5.21.0, con un `QuantizationModifier` que aplica grupos de 16, observador de pesos `memoryless_minmax` y observador de entradas `static_minmax` sobre las proyecciones `gate/up/down_proj` de los expertos enrutados de las capas 3 a 44. Se excluyen de la cuantizacion la torre visual, `lm_head`, `mlp.gate` y el indexer de self-attention. El pipeline es secuencial (una capa decodificadora a la vez, con offload a CPU/disco) y usa `moe_calibrate_all_experts=True`. Los expertos MTP de la capa 45 no se calibraron (llm-compressor no lo soporta) y se cuantizaron a FP8 por bloques sin datos.

Los datos de calibracion son 256 muestras de hasta 2048 tokens (unas 386k tokens en total, media ~1,5k), formateadas con la plantilla de chat del modelo: 128 muestras de HuggingFaceH4/ultrachat_200k, 96 de Gryphe/Sonnet3.5-Charcard-Roleplay y 32 de Gryphe/Opus-WritingPrompts.

## Capacidades
- Generacion de texto y conversacion multi-turno, con plantilla de chat propia.
- Procesamiento de imagen y texto (`image-text-to-text`), gracias a la torre de vision conservada en BF16.
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base GLM-5, aunque no verificadas en esta cuantizacion.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles.
- Capa MTP (multi-token prediction) en la capa 45, que puede habilitar decodificacion especulativa si el runtime la soporta.

## Casos de uso
- Despliegue multimodal en produccion con vLLM: el layout replica el de RedHatAI/GLM-5.3-Flash-NVFP4, por lo que se espera carga directa en vLLM y nmoe; adecuado para servir cargas image-text-to-text en GPUs con suficiente memoria.
- Asistente conversacional con contexto largo: el modelo conserva la plantilla de chat y la arquitectura completa, lo que permite conversaciones multi-turno; la longitud de contexto concreta no esta declarada.
- Procesamiento de documentos con imagenes: al mantener la torre de vision en BF16, puede recibir capturas, diagramas o formularios junto con texto.
- Generacion de codigo asistida: hereda las capacidades del modelo base GLM-5, aunque esta cuantizacion no se ha validado con pruebas de generacion.
- Prototipado de agentes con tool calling: solo si el modelo base lo soporta; en esta ficha no se confirma.
- Investigacion sobre cuantizacion NVFP4: el checkpoint sirve como referencia de receta (grupo 16, escalas FP8, calibracion con `moe_calibrate_all_experts`) para estudiar el impacto de W4A4 en modelos MoE multimodales.
- Evaluacion de error de dequantizacion: util para comparar la fidelidad de NVFP4 frente a BF16 en expertos enrutados (error relativo medio 0,092, coseno ~0,996).

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta comprobaciones offline: presencia de los 36.288 lineales NVFP4 de expertos y 864 lineales FP8 MTP, error relativo medio de dequantizacion de 0,092 (coseno ~0,996) en expertos NVFP4 muestreados de las capas 3/4/10/22/33/44 frente a BF16, error relativo ~0,026 en expertos MTP FP8, y tensores no cuantizados identicos bit a bit al origen.

## Requisitos de hardware
- VRAM estimada para inferencia: el checkpoint ocupa ~198 GB en disco; en BF16 el modelo completo requeriria aproximadamente 338 GB, por lo que la cuantizacion NVFP4 reduce el requisito a la mitad.
- GPU recomendadas: no cabe en una sola GPU consumer. Se necesita un nodo multi-GPU (por ejemplo, 4x H100 80 GB o 8x A100 80 GB) o GPUs con mayor memoria; el autor indica que su maquina de cuantizacion (1x L40S) no pudo alojar el checkpoint.
- Cabe en consumer GPU: no.
- Opciones de despliegue: vLLM y nmoe (segun el autor, mismo modo de carga que RedHatAI/GLM-5.3-Flash-NVFP4); llama.cpp, Ollama y TGI no estan confirmados para NVFP4 con compressed-tensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Estado |
|---|---|---|---|---|---|
| cgg507/GLM-Steam-320B-A18B-v2a-NVFP4 | ~169,1 B | no disponible | NVFP4 W4A4 + FP8 + BF16 | no disponible | No probado en vLLM ni generacion |
| TheDrummer/GLM-Steam-320B-A18B-v2-FP8 (base) | no disponible | no disponible | FP8 | no disponible | Modelo de origen |
| RedHatAI/GLM-5.3-Flash-NVFP4 | no disponible | no disponible | NVFP4 W4A4 | no disponible | Referencia de layout y receta |

## Limitaciones y advertencias
- El autor declara que el modelo no se ha probado mas alla de comprobaciones offline: no se ejecuto vLLM ni ninguna prueba de generacion.
- Riesgo de degradacion por cuantizacion: el error relativo medio de dequantizacion en expertos NVFP4 es 0,092; no hay evaluacion de calidad downstream.
- Los expertos MTP de la capa 45 se cuantizaron sin calibracion (data-free), lo que puede afectar a la decodificacion especulativa.
- Licencia no disponible: no se puede confirmar el uso comercial.
- Idiomas no declarados: no hay garantia de cobertura multilingue.
- Longitud de contexto no declarada.
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad.
- El nombre del modelo indica 320B y A18B, pero el recuento real de safetensors es de ~169,1 B; conviene verificar antes de dimensionar infraestructura.
- Sesgos y alucinacion: no documentados en la informacion disponible, pero heredables del modelo base y de los datos de calibracion (roleplay y escritura creativa).

## Enlaces
- Hugging Face: https://huggingface.co/cgg507/GLM-Steam-320B-A18B-v2a-NVFP4
- Modelo base FP8: https://huggingface.co/TheDrummer/GLM-Steam-320B-A18B-v2-FP8
- Modelo de referencia de layout: https://huggingface.co/RedHatAI/GLM-5.3-Flash-NVFP4
- Modelo TEST citado en la model card: https://huggingface.co/TheDrummer/GLM-Steam-320B-A18B-v2a-TEST
- Dataset de calibracion: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset de calibracion: https://huggingface.co/datasets/Gryphe/Sonnet3.5-Charcard-Roleplay
- Dataset de calibracion: https://huggingface.co/datasets/Gryphe/Opus-WritingPrompts
