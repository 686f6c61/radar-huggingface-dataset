# liodon-ai/Qwen3.5-4B-Qwenputer-FP8

## Resumen

Qwen3.5-4B-Qwenputer-FP8 es una versión cuantizada en FP8 (esquema dinámico) del modelo divagr1925/Qwen3.5-4B-Qwenputer, publicada por Liodon AI. El modelo base es una variante de la familia Qwen3.5 orientada a tareas conversacionales y de generación de texto, y esta cuantización reduce el tamaño en disco de 18,7 GB a 11,3 GB sin necesidad de dataset de calibración, lo que evita sesgos introducidos por ese paso.

La relevancia de esta ficha está en el despliegue: la cuantización FP8 dinámica está pensada específicamente para servir el modelo con vLLM, TGI o SGLang sobre GPUs NVIDIA modernas (compute capability ≥ 8.9), ofreciendo ahorro de memoria y mayor throughput respecto a los pesos originales en BF16/FP16.

Un detalle importante: aunque el nombre del modelo indica "4B", el dato real extraído de los safetensors es de 9.357.602.496 parámetros (~9,36 B). Esta discrepancia puede deberse a que el modelo base ha sido ampliado (por ejemplo, mediante upscaling de capas o embeddings) respecto al checkpoint original de Qwen, o a una nomenclatura heredada. La ficha refleja el dato real de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (qwen3_5_text); no disponible si es MoE |
| Parametros totales | 9.357.602.496 (~9,36 B, dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 dinámico (pesos E4M3 por canal, activaciones FP8 por token en tiempo de inferencia); lm_head sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base; términos exactos no disponibles) |
| Formato de pesos | safetensors (compressed-tensors, compatible con vLLM) |

## Arquitectura y entrenamiento

El modelo base pertenece a la arquitectura qwen3_5_text de la familia Qwen, un transformer decoder-only para generación de texto. Sobre él, Liodon AI ha aplicado una cuantización FP8 dinámica mediante la herramienta llm-compressor del proyecto vLLM, con el esquema FP8_DYNAMIC: los pesos se convierten a FP8 (E4M3) por canal de forma anticipada (PTQ), y las activaciones se cuantizan a FP8 dinámicamente por token durante la inferencia. Al no requerir dataset de calibración, los pesos cuantizados son numéricamente una conversión directa de los originales, sin sesgo de calibración. La capa lm_head se deja sin cuantizar, práctica estándar por su impacto desproporcionado en la calidad si se cuantiza.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO u otras técnicas), la información disponible no ofrece detalles. Tampoco se especifica si la arquitectura es densa o MoE.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, tag conversational).
- Al ser un modelo de la familia Qwen3.5, es razonable esperar capacidades de razonamiento, codigo y matematicas, pero la model card no detalla capacidades especificas: no disponible.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible (el pipeline es text-generation).
- Compatibilidad con servidores de inferencia optimizados: vLLM, TGI y SGLang.

## Casos de uso

- Servir un chatbot conversacional con vLLM: el formato compressed-tensors FP8 está diseñado para vLLM, permitiendo desplegar el modelo con `vllm serve` y obtener mayor throughput y menor huella de memoria que con los pesos originales de 18,7 GB.
- Despliegue en una sola GPU de datacenter (L4, L40S, H100): con 11,3 GB de pesos, el modelo cabe cómodamente en GPUs con 24 GB o más de VRAM, dejando margen para la caché KV y batching continuo.
- Ajuste de coste/latencia en APIs internas: la cuantización FP8 dinámica reduce el ancho de banda de memoria por token, lo que suele traducirse en mayor tokens/segundo en servidores con soporte nativo FP8.
- Integración en pipelines de TGI: se puede desplegar vía Docker con la imagen oficial de Text Generation Inference, útil en entornos Kubernetes o de MLOps ya basados en Hugging Face.
- Experimentación con SGLang: soporte directo de lanzamiento del servidor, útil para pruebas de serving alternativas con estructuras de lenguaje (structured generation).
- Punto de partida para evaluación de variantes Qwen3.5 cuantizadas: al ser una conversión directa sin calibración, es un buen candidato para medir la degradación real de FP8 frente a BF16 en vuestros propios benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Tampoco hay datos de degradación por la cuantización FP8 frente al modelo original.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 11,3 GB; con caché KV y sobrecarga de runtime, se recomienda al menos 16-24 GB de VRAM (la cifra exacta de KV cache depende de la longitud de contexto, no disponible).
- GPU recomendadas: cualquier NVIDIA con compute capability ≥ 8.9 para FP8 nativo: RTX 40-series (RTX 4090), L4, L40S, H100, H200, B100/B200/GB10 (Blackwell).
- Consumer GPUs: sí, cabe en una RTX 4090 (24 GB) e incluso en una RTX 4070 Ti Super (16 GB) con contexto ajustado. En GPUs más antiguas (Ampere o previas), vLLM/TGI dequantizan los pesos para ejecutar, perdiendo el beneficio de velocidad y memoria.
- Opciones de despliegue: vLLM (`vllm serve liodon-ai/Qwen3.5-4B-Qwenputer-FP8`), TGI (imagen Docker oficial), SGLang (`python -m sglang.launch_server`). Ollama y llama.cpp no son compatibles con este formato compressed-tensors FP8.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Comparativa orientativa con otras opciones de despliegue del mismo modelo y alternativas cuantizadas de tamaño similar:

| Modelo | Parametros | Cuantizacion | Tamano | Licencia | Servidores compatibles |
|---|---|---|---|---|---|
| liodon-ai/Qwen3.5-4B-Qwenputer-FP8 | ~9,36 B | FP8 dinamico | 11,3 GB | other | vLLM, TGI, SGLang |
| divagr1925/Qwen3.5-4B-Qwenputer (base) | ~9,36 B | BF16/FP16 | 18,7 GB | other | vLLM, TGI, SGLang, transformers |
| Versiones GGUF equivalentes (si existen) | ~9,36 B | Q4_K_M, Q5, etc. (no disponible) | no disponible | other | llama.cpp, Ollama |

Nota: no hay datos de rendimiento comparativo publicados, por lo que la comparativa se limita a formato, tamaño y compatibilidad.

## Limitaciones y advertencias

- Discrepancia de nomenclatura: el nombre indica "4B" pero los safetensors contienen ~9,36 B de parámetros; verificar el modelo base antes de usarlo en producción.
- FP8 nativo requiere GPUs con compute capability ≥ 8.9; en hardware anterior se dequantiza y se pierde el beneficio de la cuantización.
- La licencia es "other": hay que revisar los términos exactos en la ficha del modelo base antes de cualquier uso comercial; no se pueden asumir permisos.
- Sin model card detallada del modelo base: no hay información sobre datos de entrenamiento, alineación, sesgos conocidos ni riesgos de alucinación específicos; aplicar las precauciones estándar de LLMs (verificación de salidas, salvaguardas ante contenido generado).
- Longitud de contexto no documentada: no se puede planificar la caché KV con precisión sin pruebas propias.
- Modelo de comunidad con muy poca tracción (29 descargas, 2 likes en el momento de la ficha): sin auditoría comunitaria, conviene validar calidad y estabilidad por cuenta propia.
- lm_head sin cuantizar: ligera sobrecarga de memoria en FP16 respecto al resto de capas, aunque práctica estándar y de impacto mínimo.

## Enlaces

- Ficha del modelo cuantizado: https://huggingface.co/liodon-ai/Qwen3.5-4B-Qwenputer-FP8
- Modelo base: https://huggingface.co/divagr1925/Qwen3.5-4B-Qwenputer
- Herramienta de cuantización (llm-compressor): https://github.com/vllm-project/llm-compressor
- Perfil de Liodon AI: https://huggingface.co/liodon-ai
- Paper, blog o demo del modelo base: no disponible
