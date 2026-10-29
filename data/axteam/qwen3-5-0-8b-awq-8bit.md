# axteam/Qwen3.5-0.8B-AWQ-8bit

## Resumen

`axteam/Qwen3.5-0.8B-AWQ-8bit` es una cuantización de 8 bits del modelo multimodal `Qwen/Qwen3.5-0.8B` de Alibaba Cloud (equipo Qwen), publicada por axteam y orientada específicamente al servicio con vLLM. No se trata de un modelo nuevo: es una conversión post-entrenamiento (PTQ) con AWQ en esquema W8A16 (pesos INT8 simétricos, activaciones BF16, grupo de 32) almacenada en formato `compressed-tensors` `pack-quantized`. El objetivo es reducir el espacio en disco a ~1,2 GB y el coste de inferencia manteniendo la fidelidad respecto al original en BF16.

El modelo base pertenece a la familia Qwen3.5 y es el miembro más pequeño de la serie: 852.985.920 parámetros, arquitectura híbrida de atención lineal (gated delta networks) más atención completa, denso, con torre de visión y cabeza de predicción multi-token (MTP), y una ventana de contexto de 262.144 tokens según las fuentes públicas consultadas. Esa combinación de tamaño reducido, contexto largo y entrada de imagen lo sitúa en el segmento de despliegue en el borde, prototipado rápido y uso como modelo borrador en decodificación especulativa junto a checkpoints Qwen3.5 mayores.

Su relevancia ahora es doble: por un lado, demuestra que la cuantización INT8 con AWQ apenas degrada la perplejidad (+0,1 % frente al BF16 en el conjunto interno del autor); por otro, ofrece una ruta de despliegue lista para producción en GPU de gama media o incluso hardware de borde, algo poco habitual en modelos con soporte nativo de visión y contexto de 262K.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: atención lineal (gated delta networks) + atención completa; densa; multimodal con torre de visión; cabeza MTP |
| Parámetros totales | 852.985.920 (~0,85 mil millones) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (262K), según fuentes públicas del modelo base |
| Tipos de cuantización | AWQ INT8 W8A16 (pesos INT8 simétricos, grupo de 32, activaciones BF16); visión, cabecera MTP, RMSNorms, embeddings, LM head y partes no lineales SSM (`linear_attn.conv1d`, `A_log`, `dt_bias`) se mantienen en BF16 |
| Idiomas soportados | Serie Qwen3.5 descrita como multilingüe; lista concreta de idiomas no disponible. La calibración de la cuantización usó un corpus mixto con predominio de coreano |
| Licencia | Apache-2.0 (derivado de `Qwen/Qwen3.5-0.8B`) |
| Formato de pesos | `safetensors` con `compressed-tensors` `pack-quantized`; tamaño del repo 1,3 GB (~1,2 GB en disco) |
| Modelo base | `Qwen/Qwen3.5-0.8B` (relación: quantized) |
| Pipeline | `image-text-to-text` (multimodal, entrada de imagen y texto) |
| Calibración | 256 muestras de un corpus mixto con predominio de coreano |
| Metadatos | Creado el 2026-10-29; 0 descargas y 0 likes en el momento de la consulta |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de arquitectura híbrida: intercala capas de atención lineal del tipo gated delta networks con capas de atención completa, lo que reduce el coste de memoria de la caché KV en contextos muy largos (hasta 262K tokens) sin renunciar a la recuperación exacta que aportan las capas de atención completa. Incluye una torre de visión y un proyector para entrada de imagen, además de una cabeza de predicción multi-token (MTP), habitual en las series Qwen para decodificación especulativa y entrenamiento con objetivos auxiliares.

Sobre el entrenamiento del modelo original no se aportan datos en la información disponible (número de tokens, composición del dataset, uso de RLHF/DPO o fases de razonamiento). Lo que sí está documentado es el proceso de cuantización: AWQ (activation-aware weight quantization) en modo PTQ, sin reentrenamiento, con 256 muestras de calibración para proteger los canales de peso más relevantes antes del redondeo. Se preservan en BF16 los componentes sensibles a la cuantización (torre y proyector de visión, cabeza MTP, normalizaciones, embeddings, LM head y las partes no lineales del bloque SSM), de modo que solo una fracción de los parámetros queda realmente en INT8. El tokenizador, la `chat_template` y el `generation_config` son idénticos a los del original; el `config.json` añade únicamente el bloque `quantization_config`.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de hasta 262.144 tokens.
- Comprensión de imagen y texto (`image-text-to-text`): descripción de imágenes, respuesta a preguntas visuales y extracción de información de documentos escaneados.
- Razonamiento e instrucciones: la serie Qwen3.5 se presenta con mejoras en razonamiento y seguimiento de instrucciones respecto a Qwen3.
- Capacidades multilingües heredadas del modelo base (lista exacta de idiomas no disponible).
- Cabeza MTP (multi-token prediction) que habilita decodificación especulativa y acelera la generación.
- Uso como modelo borrador (*draft model*) para decodificación especulativa junto a checkpoints Qwen3.5 de mayor tamaño.
- Soporte de tool calling / function calling: no documentado explícitamente en la información disponible para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente en la información disponible; las fuentes públicas describen el modelo base como adecuado para despliegue en borde y borrador especulativo, no como agente autónomo.
- Modo *thinking* explícito, audio u otras modalidades distintas de imagen: no disponibles en la información consultada.

## Casos de uso

- Modelo borrador en decodificación especulativa: emparejado con un Qwen3.5 de mayor tamaño, el 0.8B propone tokens que el modelo grande verifica, reduciendo la latencia por token generado. Su tamaño (0,85B) y su bajo coste de memoria lo hacen idóneo para este rol, y la cabeza MTP refuerza este uso.
- Extracción de datos de documentos con imagen en local: al aceptar entrada de imagen y texto, puede procesar facturas, albaranes o tickets escaneados y devolver campos estructurados sin enviar el documento a un servicio externo, algo relevante por cumplimiento y privacidad.
- Asistente conversacional de contexto largo en atención al cliente: los 262K tokens permiten mantener historiales completos de incidencias o contratos en la ventana, con un coste de caché KV contenido gracias a las capas de atención lineal.
- Procesamiento por lotes de bajo coste: con `vllm serve` y batching continuo, sirve para clasificación temática, etiquetado y resumen de grandes volúmenes de texto donde un modelo de 70B sería económicamente inviable.
- Enrutado y prefiltrado previo a un modelo mayor: decidir si una consulta requiere un modelo grande, responder directamente las triviales y reducir así el gasto en el modelo principal.
- Prototipado y demos en hardware modesto: ~1,2 GB de pesos permiten levantar un endpoint en una GPU de 8 GB o en un portátil con GPU integrada, útil para validar producto antes de escalar.
- Evaluación de pipelines de cuantización: sirve como referencia práctica para comparar fidelidad de esquemas INT8 frente a BF16 en un modelo multimodal pequeño, con métricas reproducibles de perplejidad y acuerdo top-1.
- Descripción automática de imágenes y VQA ligera en aplicaciones de accesibilidad o catalogación de imágenes, donde la latencia y el coste importan más que la precisión de un modelo frontier.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MMMU) para este checkpoint en la información disponible. El autor sí publica métricas de fidelidad frente al original en BF16, medidas sobre un conjunto interno mixto inglés/coreano de 100 prompts con el mismo arnés de evaluación para todas las filas:

| Métrica | Este modelo (AWQ INT8) | Original BF16 | Diferencia |
|---|---|---|---|
| Perplejidad (menor = más fiel) | 2,0200 | 2,0174 | +0,1 % |
| Acuerdo top-1 en el siguiente token | 98,1 % | 98,7 % | −0,6 puntos |

Estas cifras miden fidelidad respecto al modelo base, no rendimiento absoluto en tareas. Como referencia cualitativa externa, una review pública del modelo base señala buen rendimiento en recuperación de información pero precisión débil en código, recomendando subir a Qwen3.5 4B para tareas de programación.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan ~1,2-1,3 GB (INT8 más los componentes conservados en BF16). Con contexto corto, un despliegue en vLLM debería manejarse en el entorno de 2-4 GB de VRAM, aunque el autor no publica mediciones; la cifra exacta depende del tamaño de lote y de la caché KV.
- Contexto largo: no se han publicado mediciones de memoria con 262K tokens. Las capas de atención lineal reducen el crecimiento de la caché KV frente a un transformer convencional, pero el coste real a plena ventana no está documentado.
- GPU recomendadas: para servicio con batching, L4 (24 GB), A10G (24 GB), A100 o H100. Para desarrollo y demos, RTX 4060 Ti (16 GB), RTX 3060 (12 GB) o RTX 4070 (12 GB) sobran para los pesos.
- ¿Cabe en GPU de consumo? Sí: cualquier GPU con 8 GB o más puede alojar los pesos con contexto moderado; también es viable en CPU para inferencia interactiva no crítica, aunque sin cifras publicadas de latencia.
- Opciones de despliegue: la ruta documentada y validada por el autor es vLLM (`vllm serve axteam/Qwen3.5-0.8B-AWQ-8bit`). El repo está etiquetado como `transformers` y usa `compressed-tensors`, pero no se documenta compatibilidad con llama.cpp, Ollama ni TGI para este formato `pack-quantized`; el modelo base sí dispone de GGUF y de una entrada en Ollama (`qwen3.5:0.8b`) según fuentes públicas.
- Configuración de muestreo recomendada por Qwen: `temperature=0.7`, `top_p=0.8`, `top_k=20`.
- Latencia y throughput: no disponibles. No se han publicado tokens por segundo ni TTFT para este checkpoint.
- Despliegue en borde: Qualcomm AI Hub lista el modelo base Qwen3.5-0.8B entre los modelos para despliegue móvil, lo que sugiere viabilidad en SoC, aunque esta cuantización AWQ INT8 concreta está pensada para vLLM en GPU, no para NPU móvil.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `axteam/Qwen3.5-0.8B-AWQ-8bit` | 852.985.920 | 262.144 tokens | Safetensors, AWQ INT8 W8A16 (`compressed-tensors`) | Apache-2.0 | HuggingFace, servible con vLLM |
| `Qwen/Qwen3.5-0.8B` (BF16) | 852.985.920 | 262.144 tokens | Safetensors BF16 (~1,7 GB de pesos, derivado del recuento de parámetros) | Apache-2.0 | HuggingFace; GGUF y Ollama disponibles según fuentes públicas |
| Qwen3.5-4B | ~4.000 millones (según denominación) | No disponible | No disponible | No disponible | Referenciado como alternativa para tareas de código |
| Qwen3-0.6B (generación anterior) | ~0,6 mil millones | No disponible | No disponible | No disponible | Repositorio GitHub de QwenLM |

Frente al original en BF16, esta versión reduce el espacio de pesos aproximadamente un 30-35 % (de ~1,7 GB a ~1,2 GB) a cambio de una pérdida de fidelidad medida del +0,1 % en perplejidad. Frente a Qwen3-0.6B, la comparación directa no es posible con los datos disponibles: no se han publicado en esta información ni contexto, ni resultados de benchmarks, ni licencia del modelo de la generación anterior.

## Limitaciones y advertencias

- Tamaño reducido: con 0,85B de parámetros, el conocimiento factual y la precisión en tareas complejas (código, matemáticas multi-paso, razonamiento profundo) son limitados. Una review pública del modelo base califica explícitamente la precisión en código como débil y recomienda la variante de 4B para programar.
- Riesgo de alucinación: inherente a un modelo de esta escala; no debe usarse como fuente única de verdad en dominios factuales sin verificación posterior.
- Sesgo de calibración: el conjunto de calibración de la cuantización es de 256 muestras con predominio de coreano. Aunque el efecto medido sobre la fidelidad global es pequeño (+0,1 % de perplejidad), no hay evaluación específica del comportamiento en castellano ni en otras lenguas, por lo que el impacto de la cuantización en esos idiomas es desconocido.
- Idiomas: el modelo base se describe como multilingüe, pero no se publica la lista de idiomas soportados ni evaluaciones por idioma. El soporte real del castellano no está verificado.
- Naturaleza PTQ: no hay reentrenamiento ni ajuste fino; los defectos del modelo base se heredan íntegramente.
- Compatibilidad de despliegue: el formato `pack-quantized` de `compressed-tensors` está orientado a vLLM. No se documenta soporte en llama.cpp, Ollama, TGI ni en runtimes de borde, lo que limita las opciones si el stack productivo no es vLLM.
- Componentes en BF16: la torre de visión, la cabeza MTP, las normalizaciones, los embeddings y el LM head permanecen en BF16, de modo que el ahorro de memoria es menor que el teórico de un INT8 completo.
- Licencia: Apache-2.0 permite uso comercial, pero conviene revisar el enlace de licencia del modelo base enlazado por el autor antes de redistribuir; los pesos, tokenizador y plantilla de chat pertenecen al equipo Qwen.
- Madurez: el repositorio tiene 0 descargas y 0 likes, y no hay validación independiente de las métricas publicadas por axteam.
- Sin datos de benchmarks de tareas: no hay MMLU, HumanEval, GSM8K ni MMMU publicados para este checkpoint, y las métricas del autor solo miden fidelidad respecto al BF16.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/axteam/Qwen3.5-0.8B-AWQ-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Receta de vLLM para Qwen3.5-0.8B: https://recipes.vllm.ai/Qwen/Qwen3.5-0.8B
- Qualcomm AI Hub, Qwen3.5-0.8B: https://aihub.qualcomm.com/mobile/models/qwen3_5_0_8b
- Review y guía de ejecución de Qwen3.5 0.8B: https://codersera.com/blog/run-and-benchmark-qwen35-08b/
- Repositorio GitHub de la serie Qwen3: https://github.com/QwenLM/Qwen3
