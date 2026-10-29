# axteam/Qwen3.5-2B-NVFP4

## Resumen

`axteam/Qwen3.5-2B-NVFP4` es una cuantización de 4 bits en formato NVFP4 (W4A4, FP4) del modelo multimodal `Qwen/Qwen3.5-2B` de Alibaba Cloud, publicada por el usuario axteam para servir el modelo con vLLM. El modelo base es un transformer denso de 2.213.241.664 parámetros (2,21 B) con arquitectura híbrida que combina capas de atención lineal (Gated DeltaNet, de tipo SSM) con capas de atención completa, torre de visión para entrada image-text-to-text y una cabeza MTP (multi-token prediction). Según fuentes de terceros, la ventana de contexto del modelo base es de 128K tokens.

La relevancia de esta ficha es doble. Por un lado, documenta un formato de cuantización pensado exclusivamente para hardware Blackwell con tensor cores FP4 (B200 y sucesores), lo que lo convierte en una pieza de despliegue muy específica. Por otro, la propia model card reporta una pérdida de fidelidad medible frente al original en BF16 (perplejidad 2,0399 frente a 1,8515, un +10,2 %), y el autor recomienda explícitamente builds de 8 bits (FP8 o AWQ INT8) para producción en lugar de esta variante de 4 bits.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y fue creado el 29 de octubre de 2026, por lo que se trata de una publicación reciente y sin validación comunitaria. La licencia del derivado es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: atención lineal (Gated DeltaNet / SSM) + atención completa; denso; multimodal con torre de visión; cabeza MTP |
| Parametros totales | 2.213.241.664 (2,21 B) |
| Parametros activos | No aplica: el modelo base es denso (la model card menciona "sparse-MoE" de forma contradictoria, ver limitaciones) |
| Longitud de contexto | 128K tokens según fuentes de terceros; no confirmado en la model card de este repo |
| Tipos de cuantizacion | NVFP4 W4A4 (FP4 E2M1 en pesos con grupo de 16, escala FP8 E4M3 + escala global FP32 por tensor, y activaciones FP4); componentes en BF16; el autor recomienda FP8 o AWQ INT8 para producción |
| Idiomas soportados | No disponible en los metadatos del repo; la familia Qwen3.5 se describe como multilingüe y el conjunto de calibración es mayoritariamente coreano e inglés |
| Licencia | Apache-2.0 (derivado de Qwen/Qwen3.5-2B) |
| Formato de pesos | safetensors con compressed-tensors `nvfp4-pack-quantized` (no se distribuye GGUF) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-2B emplea una arquitectura híbrida: capas de atención lineal basadas en Gated DeltaNet (SSM) combinadas con capas de atención completa, organizadas según una fuente externa en un patrón de seis bloques de (3× DeltaNet → FFN → 1× Attention → FFN). A esto se añade una torre de visión y un proyector para entrada de imagen, además de una cabeza de predicción multi-token (MTP), habitualmente usada para decodificación especulativa o entrenamiento con objetivos auxiliares. El resultado es un modelo denso de 2,21 B de parámetros con capacidad multimodal y una ventana de contexto declarada de 128K tokens por fuentes de terceros.

Esta variante concreta es una cuantización post-entrenamiento (PTQ), sin reentrenamiento, generada con compressed-tensors en el esquema `nvfp4-pack-quantized`. Se cuantizan a FP4 los pesos y las activaciones de las capas lineales, mientras que se mantienen en BF16 la torre de visión y el proyector (`model.visual.*`), la cabeza MTP (`mtp.*`), todas las RMSNorm, los embeddings de tokens, la LM head y la totalidad de la ruta de atención lineal (`linear_attn.*`). El autor justifica esta última decisión indicando que FP4 es una precisión demasiado gruesa para los pesos del SSM. La calibración se realizó con 256 muestras de un corpus mixto con predominio de coreano. La model card menciona también AWQ en un párrafo sobre protección de canales salientes, lo que resulta inconsistente con el resto de la descripción del método (ver limitaciones).

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat idéntica a la del modelo original.
- Comprensión de imagen y texto (pipeline `image-text-to-text`): la torre de visión se conserva en BF16, por lo que la capacidad multimodal no se degrada por la cuantización de las capas lineales.
- Razonamiento e instrucciones: la familia Qwen3.5 se presenta como una mejora en razonamiento y seguimiento de instrucciones frente a Qwen3.
- Capacidades multilingües heredadas del modelo base, aunque el repo no declara lista de idiomas.
- Cabeza MTP conservada en BF16, lo que permite mantener esquemas de decodificación especulativa asociados al modelo base.
- Gestión de contexto largo: hasta 128K tokens según fuentes de terceros, lo que habilita tareas de documento completo o conversaciones extensas.
- Al estar empaquetado con `chat_template` y `generation_config` originales, es compatible con los flujos estándar de transformers y vLLM.

## Casos de uso

- Servicio de inferencia de alto rendimiento en Blackwell: despliegue con `vllm serve axteam/Qwen3.5-2B-NVFP4` sobre B200 o GB200, donde el formato FP4 aprovecha los tensor cores de 4 bits para reducir el coste por token en cargas de gran volumen con modelos pequeños.
- Procesamiento de documentos con imagen y texto: digitalización de facturas, formularios o capturas en las que el modelo recibe la imagen y devuelve campos estructurados; la torre de visión en BF16 preserva la calidad de la extracción.
- Asistente conversacional de contexto largo: con 128K tokens de ventana (según fuentes externas) puede mantener historiales extensos o resumir contratos y expedientes completos en una sola pasada.
- Extracción y clasificación por lotes en pipelines de datos: al ocupar aproximadamente 2,9 GB en disco, es viable ejecutar varias instancias por GPU, lo que resulta útil para etiquetado masivo o enriquecimiento de corpus multilingües.
- Prototipado y evaluación de pipelines multimodales en entornos con hardware Blackwell, donde se necesita un modelo pequeño que quepa varias veces en memoria junto con el resto del stack.
- Base para comparativas de cuantización: sirve como referencia para medir la degradación de NVFP4 frente a BF16 o FP8 en tareas propias, usando las métricas de fidelidad publicadas como punto de partida.
- Inferencia en el borde o en dispositivos con aceleración FP4 dentro de la familia Blackwell, siempre que el runtime soporte compressed-tensors NVFP4.

## Benchmarks y rendimiento

La model card solo publica métricas de fidelidad frente al modelo original en BF16, medidas sobre un conjunto interno mixto inglés/coreano de 100 prompts con respuestas greedy del modelo BF16 puntuadas por cada build, con el mismo arnés para todas las filas. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de tareas multimodales en la información disponible.

| Metrica | Este modelo (NVFP4) | Original BF16 | Diferencia |
|---|---|---|---|
| Perplejidad (menor es mejor) | 2,0399 | 1,8515 | +10,2 % |
| Acuerdo top-1 en siguiente token | 85,8 % | 98,9 % | -13,1 puntos |

Estas cifras miden fidelidad respecto al modelo base, no rendimiento absoluto en tareas. El propio autor advierte que el modelo es sensible a la cuantización de 4 bits en estos valores y recomienda builds de 8 bits para producción.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB de pesos en disco (2,9 GB según el autor, repo de 3,1 GB) más los componentes en BF16 (embeddings, LM head, torre de visión, ruta SSM completa) y la caché KV. Estimación práctica: 4-6 GB de VRAM para contextos moderados; no disponible una medición oficial para 128K tokens.
- GPU recomendadas: NVIDIA B200 o GB200, únicas plataformas donde el formato NVFP4 aprovecha los tensor cores FP4 a plena velocidad según el autor. En GPUs sin tensor cores FP4 el modelo puede ejecutarse, pero pierde la ventaja de rendimiento y requiere de-cuantización.
- GPU de consumo: el formato está declarado como exclusivo de Blackwell; en generaciones anteriores (Ampere, Ada, Hopper) no hay aceleración FP4 nativa, por lo que no se recomienda su despliegue.
- Opciones de despliegue: vLLM es el runtime objetivo (`vllm serve axteam/Qwen3.5-2B-NVFP4`); también es cargable con transformers al usar compressed-tensors. No se distribuyen pesos GGUF, por lo que llama.cpp u Ollama no son una vía directa con este repo. TGI y otros servidores no están documentados en la información disponible.
- Latencia y throughput: no disponibles. El autor solo indica que se necesita hardware FP4 (B200) para velocidad plena.
- Muestreo recomendado por Qwen: `temperature=0.7`, `top_p=0.8`, `top_k=20`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| axteam/Qwen3.5-2B-NVFP4 (este) | 2,21 B | 128K según terceros | NVFP4 W4A4 con compressed-tensors | Apache-2.0 | HF, 0 descargas, solo vLLM/transformers en Blackwell |
| Qwen/Qwen3.5-2B (original) | 2,21 B | 128K según terceros | BF16 safetensors | Apache-2.0 | HF, modelo de referencia, máxima fidelidad |
| AxionML/Qwen3.5-2B-NVFP4 | 2 B (2B según su card) | No disponible | NVFP4 cuantizado con NVIDIA TensorRT Model Optimizer | No disponible en la información | HF, alternativa de cuantización equivalente de otro autor |
| Builds de 8 bits del mismo modelo (FP8 o AWQ INT8) | 2,21 B | 128K según terceros | FP8 / INT8 | Apache-2.0 | Recomendados por el autor de esta ficha para producción; no se detalla el repositorio concreto |

La comparación con otras familias de 2B (por ejemplo, Qwen3-1.7B o modelos de tamaño similar de otros fabricantes) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de calidad medida y significativa: +10,2 % de perplejidad y 85,8 % de acuerdo top-1 frente al BF16 original. El propio autor desaconseja esta variante para producción y recomienda 8 bits.
- Dependencia de hardware: formato declarado exclusivo de Blackwell. En GPUs sin tensor cores FP4 el rendimiento esperado no se cumple.
- Inconsistencias en la model card: describe la arquitectura como "Dense" y a la vez advierte sobre un "sparse-MoE" sensible a 4 bits; además menciona AWQ (protección de canales salientes) en un procedimiento que describe como PTQ FP4. Conviene tratar esas afirmaciones con cautela y verificar contra el `config.json` del modelo base.
- Calibración sesgada: 256 muestras de un corpus con predominio de coreano, lo que puede afectar la fidelidad en otros idiomas, entre ellos el castellano.
- Idiomas no declarados: el repo no publica lista de idiomas soportados, por lo que el soporte multilingüe se hereda del modelo base sin garantía documentada.
- Riesgo de alucinación inherente a un modelo de 2 B de parámetros; no se han publicado evaluaciones de veracidad ni de tasa de alucinación.
- La ventana de 128K tokens proviene de fuentes de terceros y no está confirmada en la model card; el comportamiento en contextos muy largos con cuantización de 4 bits no está evaluado.
- Sin validación comunitaria: 0 descargas y 0 likes; el autor no ofrece garantías de soporte.
- Licencia Apache-2.0 permite uso comercial, pero el derivado mantiene los derechos del modelo base del equipo Qwen y conviene conservar la atribución y la nota de licencia enlazada.
- El repo no incluye pesos GGUF, lo que limita las opciones de despliegue fuera de vLLM y transformers.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/axteam/Qwen3.5-2B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- Cuantización NVFP4 alternativa del mismo modelo base: https://huggingface.co/AxionML/Qwen3.5-2B-NVFP4
- Ficha de especificaciones y VRAM de Qwen3.5-2B (terceros): https://apxml.com/models/qwen35-2b
- Detalles de modelo y guía de cuantización (terceros): https://llmfit.io/models/qwen3.5%3A2b%20nvfp4
- Qwen3.5-2B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_2b
