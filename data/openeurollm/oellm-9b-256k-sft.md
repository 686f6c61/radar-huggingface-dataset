# openeurollm/oellm-9b-256k-sft

## Resumen

OELLM 9B 256K SFT es un checkpoint experimental de ajuste por instrucciones (SFT) derivado del modelo base `openeurollm/oellm-9b-256k-theta64m-prelude`, desarrollado por OpenEuroLLM, un proyecto europeo que busca crear modelos fundacionales abiertos y multilingües para Europa. Se trata de la primera etapa de post-entrenamiento de un experimento realizado en la supercomputadora LUMI, cuyo objetivo es comprobar si un ajuste fino con secuencias cortas puede añadir comportamiento conversacional sin degradar la capacidad de contexto largo del modelo base.

La arquitectura subyacente es un modelo denso Qwen3 de 9 mil millones de parámetros, reentrenado con un tokenizer propio de OpenEuroLLM de 256K y una configuración de contexto de 262.144 tokens. El modelo se publica bajo licencia Apache-2.0 y está pensado para probar hipótesis de investigación sobre el equilibrio entre instrucción y contexto largo, no como un producto listo para producción. Su relevancia radica en ser uno de los primeros intentos de combinar un contexto de 256K con un ajuste por instrucciones multilingüe europeo, utilizando exclusivamente infraestructura europea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen3 9B) con tokenizer OpenEuroLLM 256K |
| Parametros totales | 9.101.947.904 (9,1B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16) |
| Idiomas soportados | en, sv, de, fr, es, it, nl, pl, pt, cs, fi, da, el, bg, hr, hu, ro, sk, sl, et, lt, lv, ga, mt, eu, gl, is, nb, nn, sr, uk, ca, mk, sq, oc, lb, bs (35 idiomas europeos) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso basado en la arquitectura Qwen3 de 9B, sin mezcla de expertos (MoE). La innovación principal reside en el tokenizer independiente de OpenEuroLLM con un vocabulario de 256K y la configuración de contexto de 262.144 tokens, con `rope_theta=64000000` y `max_position_embeddings=262144`. El entrenamiento consistió en un ajuste fino supervisado (SFT) de parámetros completos en BF16, sin LoRA ni otros adaptadores, utilizando Hugging Face TRL 0.28.0 con `SFTTrainer` y `SFTConfig`, sobre una pila distribuida con Accelerate FSDP `FULL_SHARD`, FlashAttention 2 y gradient checkpointing.

Los datos de entrenamiento combinan tres fuentes: 920.552 filas del subconjunto comercial de `allenai/tulu-3-sft-mixture` (69,10%), 161.644 filas del subconjunto de `utter-project/EuroBlocks-SFT-Synthetic-1124` (12,13%) y 250.000 filas del archivo de matemáticas de `nvidia/Nemotron-Post-Training-Dataset-v2` (18,77%), que incluye trazas de razonamiento sintéticas con respuestas en cajas. En total se cargaron 1.332.196 conversaciones, que tras tokenización y empaquetado produjeron 2.593.634.710 tokens y 635.974 secuencias empaquetadas con una ocupación media del 99,57%. La longitud máxima de secuencia fue de 4.096 tokens. El entrenamiento se ejecutó durante 3.000 pasos (aproximadamente 0,604 épocas) con un batch global de 128 secuencias, optimizador Fused AdamW con LR pico de 6e-6, decaimiento coseno, warmup del 3% y sin weight decay. La pérdida final agregada fue de 0,8034 (0,7671 en la última ventana de 20 pasos), con una precisión media de token del 0,7839. El hardware utilizado fueron 4 nodos LUMI-G con 32 GCDs AMD MI250X, con un tiempo total de 14 horas y 36 minutos.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones en 35 idiomas europeos, con predominio del inglés en los datos de entrenamiento.
- Manejo de contexto largo de hasta 262.144 tokens, aunque la model card advierte que esta configuración describe el máximo aceptado por la arquitectura y no garantiza recuperación precisa a esa longitud.
- Capacidad multilingüe europea: cubre lenguas mayoritarias (alemán, francés, español, italiano, polaco, etc.) y minoritarias (gaélico irlandés, maltés, euskera, gallego, islandés, etc.).
- Soporte de chat mediante plantilla de conversación estándar de Transformers (`apply_chat_template`).
- No es un modelo de razonamiento especializado: la model card indica explícitamente que no se presenta como tal, aunque incluye datos de razonamiento matemático de Nemotron-v2.
- No se documenta soporte de tool calling, function calling, visión ni audio.

## Casos de uso

- Asistencia multilingüe en atención al cliente: el modelo puede gestionar conversaciones en múltiples idiomas europeos con un solo despliegue, gracias a su tokenizer de 256K y su entrenamiento en EuroBlocks, lo que reduce la necesidad de modelos separados por idioma.
- Procesamiento de documentos largos: con una ventana de 256K, puede resumir o extraer información de manuales técnicos, contratos o informes extensos sin necesidad de dividir el texto en fragmentos.
- Investigación académica sobre contexto largo: sirve como banco de pruebas para estudiar cómo el SFT con secuencias cortas afecta a la retención de capacidades de contexto largo, un tema relevante para el diseño de modelos de producción.
- Generación de contenido multilingüe: redacción de artículos, correos o documentación técnica en varios idiomas europeos, aprovechando la cobertura de lenguas minoritarias que otros modelos no ofrecen.
- Traducción y localización asistida: aunque no está específicamente entrenado para traducción, su perfil multilingüe permite usarlo como base para sistemas de traducción con post-procesamiento humano.
- Experimentación en entornos educativos: dado su tamaño de 9B y licencia Apache-2.0, es adecuado para cursos y talleres sobre ajuste fino de LLMs con contexto largo, ejecutable en hardware de gama media con cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, y los únicos datos de rendimiento son las métricas de entrenamiento (pérdida 0,8034 y precisión de token 0,7839), que no son comparables con benchmarks estándar.

## Requisitos de hardware

- El modelo completo en BF16 ocupa aproximadamente 18,2 GB (según el tamaño del repositorio), lo que requiere al menos 20 GB de VRAM para inferencia sin cuantización.
- La inferencia con contexto cercano a 256K exige múltiples GPUs para la caché KV, como advierte la model card. No se especifica el número exacto, pero con 9B de parámetros y 256K de contexto, se necesitarían al menos 2-4 GPUs de 80 GB (A100/H100) para manejar la caché completa.
- En GPU de consumo, solo es viable con cuantización y contextos reducidos: una RTX 4090 (24 GB) podría ejecutar el modelo con cuantización 4-bit y un contexto moderado (por ejemplo, 8K-16K), pero no el máximo de 256K.
- Opciones de despliegue: compatible con Transformers, vLLM y TGI (el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`). También es posible usar llama.cpp u Ollama si se generan pesos GGUF, aunque no se proporcionan oficialmente.
- No se dispone de datos de latencia o throughput estimados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OELLM 9B 256K SFT | 9,1B | 262.144 | 35 europeos | Apache-2.0 | HuggingFace |
| Qwen3 9B (base) | 9,1B | 32.768 (ampliable) | Multilingüe global | Apache-2.0 | HuggingFace |
| Llama 3.1 8B | 8,0B | 131.072 | Multilingüe (8 idiomas) | Llama 3.1 Community License | HuggingFace |
| Mistral 7B v0.3 | 7,3B | 32.768 | Multilingüe | Apache-2.0 | HuggingFace |

La comparativa se limita a características arquitectónicas, ya que no hay datos de benchmarks para OELLM. Frente a Qwen3 9B, su base, OELLM ofrece un contexto 8 veces mayor y una cobertura de idiomas europeos más amplia, pero a costa de ser un checkpoint experimental sin validación de rendimiento. Frente a Llama 3.1 8B, destaca por su licencia permisiva y su enfoque europeo, aunque Llama tiene un ecosistema más maduro y benchmarks publicados.

## Limitaciones y advertencias

- Modelo experimental: es la primera etapa de un experimento de post-entrenamiento, no un producto final. La model card lo presenta explícitamente como un checkpoint de prueba.
- La configuración de 262.144 tokens describe el máximo aceptado por la arquitectura, pero no garantiza recuperación precisa de información a esa longitud. La model card lo advierte de forma explícita.
- No es un modelo de razonamiento especializado, a pesar de incluir datos de razonamiento matemático en el entrenamiento.
- Predominio del inglés en los datos de entrenamiento (69,10% de Tulu-3, mayoritariamente inglés), lo que puede generar un sesgo hacia respuestas en inglés incluso cuando se pregunta en otros idiomas.
- Riesgo de alucinación inherente a todos los LLMs, especialmente en contextos largos donde la atención puede degradarse.
- Sin benchmarks publicados, no es posible evaluar su calidad relativa frente a otros modelos de su tamaño.
- La inferencia a 256K requiere hardware de múltiples GPUs de alta gama, lo que limita su uso práctico en entornos con recursos limitados.
- No se documentan sesgos específicos, pero al entrenarse con datos de Tulu-3 y EuroBlocks, puede heredar sesgos de esos conjuntos de datos.

## Enlaces

- HuggingFace: https://huggingface.co/openeurollm/oellm-9b-256k-sft
- Organización OpenEuroLLM en HuggingFace: https://huggingface.co/openeurollm
- GitHub de OpenEuroLLM: https://github.com/OpenEuroLLM
- Página del modelo en FriendliAI (inferencia gestionada): https://friendli.ai/models/openeurollm/oellm-9b-256k-sft
- Ficha del modelo base en LLM Explorer: https://llm-explorer.com/model/openeurollm%2Foellm-9b-256k-theta64m-prelude,1hK0LNwOaqe6bPe36yp1C0
