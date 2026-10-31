# axteam/Qwen3.6-35B-A3B-NVFP4A16

## Resumen

Qwen3.6-35B-A3B-NVFP4A16 es una versión cuantizada en 4 bits (NVFP4A16, W4A16) del modelo multimodal Qwen3.6-35B-A3B de Qwen, producida por el usuario axteam específicamente para su despliegue eficiente con vLLM. El modelo base es un MoE híbrido (atención lineal + atención completa) con 256 expertos más experto compartido, unos 35B de parámetros totales y aproximadamente 3B activos por token, con capacidades de visión (image-text-to-text) y un cabezal de predicción multi-token (MTP).

El objetivo de esta versión es reducir la huella de memoria del original en BF16 (~23,3 GB en disco frente a un tamaño considerablemente mayor del original) manteniendo el comportamiento lo más fiel posible mediante cuantización post-entrenamiento (PTQ) sin reentrenamiento. Los pesos FP4 (E2M1) con grupos de 16 se aplican solo a las rutas seguras, mientras que la torre de visión, el router MoE, las normas, embeddings, LM head y toda la ruta de atención lineal (GatedDeltaNet/SSM) se conservan en BF16 porque FP4 es demasiado grueso para los pesos del SSM.

Es relevante ahora porque ofrece una forma de servir un MoE multimodal de 35B en hardware más modesto, aunque la propia model card advierte que este MoE muy disperso es sensible a la cuantización a 4 bits: la perplexidad empeora un +29,2 % respecto al BF16, y se recomiendan las versiones de 8 bits (FP8 o AWQ INT8) para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (atención lineal GatedDeltaNet/SSM + atención completa), MoE (256 expertos + experto compartido), multimodal (visión), cabezal MTP |
| Parametros totales | 35.951.822.704 (~35,95B) |
| Parametros activos | ~3B por token (MoE) |
| Longitud de contexto | No disponible (los ejemplos de la model card usan `--max-model-len 32768`) |
| Tipos de cuantizacion | NVFP4A16 (W4A16): pesos FP4 E2M1 agrupados en 16 (escala FP8 E4M3 + escala global FP32 por tensor), activaciones BF16; formato compressed-tensors `nvfp4-pack-quantized` |
| Idiomas soportados | No disponible (la calibración usó un corpus mixto con predominio de coreano; el ejemplo de uso incluye coreano e inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors `nvfp4-pack-quantized`) |

## Arquitectura y entrenamiento

El modelo base combina atención lineal (ruta GatedDeltaNet/SSM) con capas de atención completa, en una arquitectura híbrida que reduce el coste de la KV-cache en secuencias largas. Es un MoE con 256 expertos más un experto compartido, con unos 3B de parámetros activos de los 35B totales, e incorpora un cabezal de predicción multi-token (MTP) que puede acelerar la decodificación. Incluye además una torre de visión y un proyector para entrada de imagen y texto.

Esta versión no implica ningún entrenamiento adicional: es una cuantización post-entrenamiento (PTQ) del original. El esquema W4A16 usa pesos FP4 (E2M1) con grupos de 16 y escalas FP8 E4M3 más una escala global FP32 por tensor, manteniendo activaciones en BF16. Se conservan en BF16 la torre de visión y el proyector, el cabezal MTP, todas las RMSNorm, los embeddings, el LM head, el router MoE y la puerta del experto compartido, y la totalidad de la ruta de atención lineal (SSM), ya que FP4 es demasiado impreciso para esos pesos. La calibración se realizó con 256 muestras de un corpus mixto con predominio de coreano. El tokenizador, el chat template y la configuración de generación son idénticos a los del original. No hay datos publicados en la ficha sobre el número de tokens ni la composición del dataset de preentrenamiento del modelo base.

## Capacidades

- Generación de texto conversacional con chat template idéntico al original y modo de razonamiento (thinking) activado por defecto, desactivable con `chat_template_kwargs={"enable_thinking": False}`.
- Comprensión multimodal de imágenes: acepta entrada de imagen (URL o data URI) junto con texto, gracias a la torre de visión y el proyector conservados en BF16.
- Arquitectura MoE con ~3B de parámetros activos, lo que permite inferencia rápida pese al tamaño total de 35B.
- Cabezal de predicción multi-token (MTP) presente en los pesos, potencialmente útil para decodificación especulativa.
- Atención lineal (GatedDeltaNet/SSM) que reduce el coste de memoria de la KV-cache en contextos largos.
- Despliegue como servidor compatible con la API de OpenAI mediante vLLM, con soporte de chat multi-turno.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agentes y multi-step reasoning: no disponible en la información proporcionada.

## Casos de uso

- Servir un LLM multimodal en una sola GPU de gama alta: la cuantización FP4 reduce los pesos a ~23,3 GB, permitiendo alojar el modelo completo en una GPU de 48 GB (o de 32 GB con KV-cache en FP8 y limitando la modalidad de imagen), algo inviable con el original en BF16.
- Chatbots conversacionales con entrada de imagen: se puede desplegar un servidor OpenAI-compatible con vLLM y atender peticiones que combinen texto e imágenes (por ejemplo, describir capturas o documentos escaneados) sin necesidad de un modelo de visión aparte.
- Prototipado y pruebas de calidad de cuantización: al ser un PTQ fiel al original con métricas de fidelidad publicadas, sirve como banco de pruebas para comparar el impacto de FP4 frente a BF16 y versiones de 8 bits en tus propios prompts.
- Procesamiento por lotes offline en Python: la API `llm.chat()` de vLLM permite ejecutar inferencia offline sobre colecciones de prompts o imágenes (clasificación, resumen, extracción de datos) de forma programática.
- Servicios solo-texto con menor consumo de memoria: añadiendo `--limit-mm-per-prompt '{"image": 0, "video": 0}'` se omite el presupuesto de memoria del codificador de visión, optimizando el despliegue para aplicaciones puramente textuales.
- Experimentación con contextos largos y KV-cache comprimida: la ruta de atención lineal y la opción `--kv-cache-dtype fp8` permiten servir contextos amplios o lotes grandes reduciendo a la mitad la memoria de la KV-cache.
- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno vía API compatible con OpenAI, con muestreo recomendado `temperature=1.0`, `top_p=0.95`, `top_k=20`, aunque para producción se recomienda valorar las versiones de 8 bits por su mayor fidelidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí incluye mediciones de fidelidad respecto al original en BF16 (conjunto interno mixto inglés/coreano, 100 prompts, respuestas greedy del BF16 puntuadas bajo cada build):

| Metric | Este modelo | Original BF16 |
|---|---|---|
| Perplexity (menor = más cercano) | 1,6708 | 1,2934 (+29,2 %) |
| Concordancia top-1 del siguiente token | 83,9 % | 98,0 % |

Estas métricas miden fidelidad al modelo base, no rendimiento en tareas absolutas. El propio autor advierte de que este MoE muy disperso es sensible a la cuantización a 4 bits y recomienda las builds de 8 bits (FP8 o AWQ INT8) para producción.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan ~23,3 GB en disco (repo de 25,1 GB); a esto hay que sumar la KV-cache y el presupuesto del codificador de visión. En la práctica se necesita una GPU de 32-48 GB para servir con holgura, o una de 24 GB solo en configuraciones ajustadas (contexto corto, KV-cache FP8, sin vision).
- GPU recomendadas: NVIDIA con soporte eficiente de FP4/compressed-tensors en vLLM, idealmente de la familia Hopper/Blackwell (H100, H200, B200); también viable en RTX 6000 Ada/RTX 4090 en configuraciones limitadas, aunque no hay datos oficiales de compatibilidad por arquitectura.
- Consumer GPU: puede caber en una RTX 4090 (24 GB) solo con contexto muy reducido y KV-cache en FP8; con más margen en GPUs de 32 GB (RTX 5090) o 48 GB (RTX 6000 Ada, A6000). No hay mediciones publicadas que lo confirmen.
- Despliegue: vLLM es el runtime para el que está diseñado el formato compressed-tensors `nvfp4-pack-quantized` (servidor OpenAI-compatible o inferencia offline en Python). No hay soporte indicado para llama.cpp, Ollama o TGI.
- Opciones de ahorro de memoria: `--kv-cache-dtype fp8` reduce aproximadamente a la mitad la memoria de la KV-cache; `--limit-mm-per-prompt '{"image": 0, "video": 0}'` evita cargar el presupuesto del codificador de visión en despliegues solo-texto.
- Latencia y throughput estimados: no disponibles; la activación de ~3B parámetros y el cabezal MTP sugieren buena velocidad de decodificación, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Cuantizacion | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|---|
| axteam/Qwen3.6-35B-A3B-NVFP4A16 | ~35,95B | ~3B | W4A16 (FP4) | Sí (visión) | Apache-2.0 | Perplexity +29,2 % vs BF16; el autor recomienda builds de 8 bits para producción |
| Qwen/Qwen3.6-35B-A3B (original) | ~35,95B | ~3B | BF16 | Sí (visión) | Apache-2.0 | Máxima fidelidad; mayor huella de memoria |
| Builds 8-bit (FP8 o AWQ INT8) del mismo modelo | ~35,95B | ~3B | FP8 / INT8 | Sí (visión) | Apache-2.0 | Recomendadas por el propio autor para producción por mejor equilibrio calidad/memoria |

Alternativas de otros fabricantes de tamaño similar: no disponible en la información proporcionada.

## Limitaciones y advertencias

- Sensibilidad a la cuantización de 4 bits: la perplexidad empeora un +29,2 % respecto al BF16 (1,6708 frente a 1,2934) y la concordancia top-1 cae al 83,9 %. El propio autor recomienda las builds de 8 bits (FP8 o AWQ INT8) para producción.
- La calibración se hizo con un corpus con predominio de coreano (256 muestras), lo que puede afectar a la fidelidad de la cuantización en otros idiomas; el impacto en castellano no está medido.
- Solo las rutas consideradas seguras están en FP4: la ruta SSM, el router MoE, la torre de visión y otros componentes permanecen en BF16, lo que limita el ahorro de memoria respecto a una cuantización completa.
- Formato restringido a vLLM (compressed-tensors `nvfp4-pack-quantized`): no es un GGUF y no funciona en llama.cpp, Ollama o la mayoría de runtimes de consumer.
- Riesgo de alucinación: inherente a cualquier LLM; la degradación por cuantización puede agravarlo en tareas delicadas. No hay evaluaciones específicas publicadas.
- Sesgos conocidos: no disponible; heredará los del modelo base Qwen3.6-35B-A3B, sin auditoría documentada en la ficha.
- Idiomas soportados: no documentados explícitamente; el uso documentado se centra en inglés y coreano.
- Longitud de contexto máxima: no especificada en la ficha; los ejemplos usan 32.768 tokens.
- Licencia Apache-2.0: permite uso comercial, pero los pesos, tokenizador y chat template originales pertenecen al equipo de Qwen.
- Descargas muy bajas (35) y cuantización de terceros (axteam, no oficial de Qwen): conviene validar en tu propia carga de trabajo antes de producción.

## Enlaces

- Modelo cuantizado: https://huggingface.co/axteam/Qwen3.6-35B-A3B-NVFP4A16
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
