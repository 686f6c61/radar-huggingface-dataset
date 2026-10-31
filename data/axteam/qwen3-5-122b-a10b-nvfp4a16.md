# axteam/Qwen3.5-122B-A10B-NVFP4A16

## Resumen

Qwen3.5-122B-A10B-NVFP4A16 es una cuantización a 4 bits del modelo Qwen3.5-122B-A10B de Qwen, realizada por el equipo axteam y orientada específicamente al despliegue eficiente con vLLM. El modelo base es un LLM multimodal (image-text-to-text) de arquitectura híbrida que combina atención lineal (GatedDeltaNet/SSM) con atención completa, y una capa de mezcla de expertos (MoE) con 256 expertos más experto compartido, activando unos 10B de parámetros de los 122B totales. La versión cuantizada conserva el comportamiento del original mediante cuantización post-entrenamiento (PTQ) sin reentrenamiento.

La relevancia de esta variante reside en su esquema NVFP4A16 (W4A16): los pesos se almacenan en FP4 (E2M1) agrupados en bloques de 16, mientras que las activaciones se mantienen en BF16. Esto reduce el tamaño en disco a unos 75,9 GB (frente a los ~245 GB que ocuparían en BF16) manteniendo una calidad superior a la de variantes W4A4. De forma inteligente, el proceso de cuantización mantiene en BF16 los componentes sensibles: la torre de visión, el cabezal de predicción multi-token (MTP), el router MoE, las normalizaciones, los embeddings, el LM head y toda la ruta de atención lineal, ya que FP4 es demasiado grueso para los pesos del SSM.

Es un modelo pertinente para despliegues de producción que necesitan capacidades multimodales y razonamiento de gran escala con coste de memoria reducido, aprovechando el soporte de compressed-tensors en vLLM sobre GPUs modernas con soporte de FP4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida (atencion lineal GatedDeltaNet/SSM + atencion completa), MoE (256 expertos + experto compartido), multimodal (vision), cabezal MTP |
| Parametros totales | 125.086.497.008 (dato real de safetensors; ~122B nominales) |
| Parametros activos | ~10B (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4A16 (W4A16): pesos FP4 (E2M1) con grupos de 16 (escala FP8 E4M3 + escala global FP32 por tensor), activaciones BF16; componentes sensibles en BF16 |
| Idiomas soportados | no disponible (calibrado con corpus mixto con predominio de coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, compressed-tensors `nvfp4-pack-quantized` (~75,9 GB en disco; repo 81,5 GB) |

## Arquitectura y entrenamiento

La arquitectura del modelo base combina dos mecanismos de atencion: una via de atencion lineal basada en GatedDeltaNet (tipo SSM) y via de atencion completa tradicional, lo que permite procesar secuencias largas con menor coste computacional por token. Sobre esta base se situa una capa MoE con 256 expertos mas un experto compartido, de la cual se activan aproximadamente 10B de parametros por token de los 122B totales, ofreciendo la capacidad de un modelo grande con la latencia de uno mediano. Adicionalmente incorpora una torre de vision para entrada multimodal y un cabezal de prediccion multi-token (MTP) que puede acelerar la decodificacion.

Sobre el entrenamiento del modelo base (numero de tokens, composicion del dataset, RLHF/DPO) no hay datos disponibles en la informacion proporcionada. En cuanto a esta version cuantizada, se trata de una cuantizacion post-entrenamiento (PTQ) sin reentrenamiento: se uso un conjunto de calibracion de 256 muestras de un corpus mixto con predominio de coreano para proteger los canales de peso salientes antes del redondeo, sin uso de gradientes. La model card menciona AWQ como tecnica de proteccion de canales, aunque el esquema final es NVFP4A16. El tokenizer, el chat template y el generation config son identicos a los del original.

## Capacidades

- Generacion de texto conversacional (pipeline `conversational`) heredada del modelo base Qwen3.5-122B-A10B.
- Comprension multimodal imagen-texto (pipeline `image-text-to-text`), gracias a la torre de vision y al proyector mantenidos en BF16.
- Razonamiento y eficiencia de inferencia: la arquitectura MoE activa solo ~10B de parametros por token, y el cabezal MTP permite prediccion multi-token para acelerar la decodificacion.
- Atencion a secuencias largas mediante la via de atencion lineal (GatedDeltaNet/SSM).
- Compatibilidad con vLLM mediante compressed-tensors, orientada a despliegue en produccion.
- Soporte de tool calling, agentes y capacidades multilingues especificas: no disponible en la informacion proporcionada.

## Casos de uso

- Servido de LLM multimodal en produccion con coste de memoria reducido: el formato W4A16 reduce el footprint a ~76 GB, permitiendo alojar el modelo en un solo nodo de GPU de gama alta en lugar de varios.
- Chatbots con comprension de imagenes: la pipeline image-text-to-text permite construir asistentes que analizan capturas, documentos escaneados o graficos enviados por el usuario junto con texto.
- Procesamiento de documentos y RAG con contextos largos: la via de atencion lineal (GatedDeltaNet) reduce el coste de secuencias extensas, adecuado para resumir o consultar corpus documentales.
- Atencion al cliente automatizada: la activacion MoE de ~10B parametros permite latencias bajas en conversaciones multi-turno con alto volumen de peticiones simultaneas via vLLM.
- Generacion de codigo y asistencia tecnica: como modelo generalista de gran capacidad, puede integrarse en asistentes de desarrollo, aunque los benchmarks especificos de codigo no estan disponibles.
- Despliegue multi-tenant en plataformas de inferencia: la compatibilidad con compressed-tensors y vLLM facilita su integracion en infraestructuras de serving existentes con batching continuo.
- Experimentacion con cuantizacion FP4: util como referencia para evaluar el impacto de esquemas NVFP4A16 frente a W4A4 o variantes BF16 en cargas reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica unicamente que la calidad de W4A16 es notablemente superior a la de W4A4 NVFP4, sin cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: ~76 GB solo de pesos (tamano en disco del modelo cuantizado); con KV cache y overhead, se recomienda al menos 80 GB de VRAM disponible. Para contextos largos, conviene margen adicional.
- GPUs recomendadas: al tratarse de pesos FP4 con formato compressed-tensors `nvfp4-pack-quantized`, el despliegue eficiente requiere GPUs con soporte nativo de FP4, como NVIDIA H100 (con soporte FP4 en versiones recientes de vLLM/Blackwell) o la generacion Blackwell (B200/RTX 5090). No disponible una lista oficial de GPUs compatibles.
- GPUs de consumidor: no cabe en una sola RTX 4090 (24 GB) ni RTX 5090 (32 GB) por VRAM; requeriria al menos dos GPUs de 48 GB (RTX 6000 Ada, A6000) o configuraciones multi-GPU, sujeto al soporte de FP4 de vLLM.
- Despliegue: vLLM es la via recomendada y documentada (`vllm serve axteam/Qwen3.5-122B-A10B-NVFP4A16`). No hay soporte documentado para llama.cpp, Ollama, TGI o transformers en modo cuantizado (aunque la libreria declarada es transformers, el formato compressed-tensors esta pensado para vLLM).
- Latencia y throughput: no disponible. La activacion de ~10B parametros por token y el cabezal MTP sugieren buena latencia, pero no hay mediciones publicadas.
- Muestreo recomendado (segun Qwen): `temperature=0.7, top_p=0.8, top_k=20`.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Multimodal | Cuantizacion | Licencia |
|---|---|---|---|---|---|---|
| Qwen3.5-122B-A10B-NVFP4A16 (este) | ~122B | ~10B | no disponible | Si (vision) | W4A16 FP4 | Apache-2.0 |
| Qwen/Qwen3.5-122B-A10B (base) | ~122B | ~10B | no disponible | Si (vision) | BF16 (sin cuantizar) | Apache-2.0 |
| Qwen3-30B-A3B | 30B | 3B | no disponible | No (version base) | BF16 / GGUF comunitarios | Apache-2.0 |
| Mixtral 8x22B | ~141B | ~39B | 64K | No | BF16 / GPTQ comunitarios | Apache-2.0 |

Nota: los datos de alternativas se ofrecen a titulo orientativo; para Qwen3.5-122B-A10B no se dispone de contexto ni benchmarks en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. El conjunto de calibracion tiene predominio de coreano (256 muestras), lo que podria introducir una ligera deriva de calidad en otros idiomas respecto al original; conviene validar en el idioma de despliegue.
- Riesgo de alucinacion: inherente a todo LLM; no hay evaluaciones publicadas para esta variante cuantizada.
- Cuantizacion selectiva: la ruta de atencion lineal (SSM), la torre de vision, el router MoE y los embeddings permanecen en BF16, por lo que el ahorro de memoria es menor que en una cuantizacion FP4 total; a cambio se preserva la calidad.
- Limitaciones de idioma y contexto: la longitud de contexto y los idiomas soportados no estan documentados en la model card.
- Restricciones de licencia: Apache-2.0, sin restricciones para uso comercial; los pesos, tokenizer y chat template originales pertenecen al equipo Qwen.
- Compatibilidad de hardware: el formato `nvfp4-pack-quantized` requiere vLLM con soporte de compressed-tensors y, idealmente, GPUs con soporte FP4; no es un GGUF universal y no funcionara en backends sin soporte.
- Uso en produccion: al ser una cuantizacion de terceros (axteam) sin benchmarks publicados, se recomienda evaluar la degradacion frente al modelo base en el caso de uso concreto antes de pasar a produccion. Descargas muy bajas (28) indican adopcion comunitaria minima.

## Enlaces

- Modelo cuantizado: https://huggingface.co/axteam/Qwen3.5-122B-A10B-NVFP4A16
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B/blob/main/LICENSE
