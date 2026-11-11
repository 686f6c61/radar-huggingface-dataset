# nchapman/d3-W4A16-HGPTQ

## Resumen
d3-W4A16-HGPTQ es una versión cuantizada a 4 bits del modelo vllm-sr/d3, un modelo de decisión de pase único orientado a la extracción de características y a la clasificación estructurada de estados. La cuantización la ha realizado nchapman mediante una receta GPTQ con rotación de Walsh-Hadamard y inicialización por Cholesky, reduciendo el checkpoint BF16 original de 48,59 GiB a 14,69 GiB, lo que supone una compresión de 3,31 veces.

El modelo base vllm-sr/d3 emplea una arquitectura híbrida de 64 capas (hidden_size de 5120) que combina GatedDeltaNet con atención completa, e incorpora una torre visual ViT de 27 bloques para procesar entradas multimodales. La cabeza de lectura (readout) es un tensor BF16 de 255 × 5120 que produce una distribución sobre 255 códigos de decisión, lo que permite formular tareas como elección múltiple, sí/no, selección múltiple o escalas.

La relevancia de esta ficha radica en que demuestra que una cuantización agresiva W4A16 puede preservar prácticamente intacta la calidad de decisión del modelo original: el acuerdo top-1 se mantiene al 100 % y la similitud coseno de los logits de la cabeza de lectura alcanza 0,999917. Está publicada bajo licencia Apache 2.0 y usa el formato compressed-tensors, cargable con transformers y con el runtime propio d3_runtime.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 64 capas con GatedDeltaNet y atención completa; torre visual ViT de 27 bloques; cabeza de lectura de 255 códigos |
| Parámetros totales | 26.085.330.160 (según safetensors) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | W4A16 GPTQ (group_size=64, actorder estático, dampening_frac=0,01) con rotación Walsh-Hadamard 64×64; capas visuales parcialmente en GPTQ por canal |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compressed-tensors (quantization_status: compressed) |

## Arquitectura y entrenamiento
El modelo base vllm-sr/d3 es un modelo de decisión de pase único con arquitectura híbrida: 64 capas de hidden_size 5120 que alternan bloques GatedDeltaNet (atención lineal recurrente) y bloques de atención completa. La variante cuantizada conserva esta topología y añade una torre visual compuesta por 27 bloques ViT más un merger, lo que permite procesar imágenes junto a texto. La salida no es texto generativo, sino una distribución sobre 255 códigos de decisión a través de una cabeza de lectura lineal de 255 × 5120 mantenida en BF16.

La cuantización aplica una rotación de entrada Walsh-Hadamard de 64×64 (matriz de Sylvester) seguida de GPTQ con inicialización MSE y descomposición de Cholesky, calibrando capa por capa bajo atención no causal completa. Se cuantizan 400 capas lineales del lenguaje y 137 de la torre visual; se mantienen en BF16 el readout, los embeddings, las proyecciones in_proj_a e in_proj_b, las normas, los sesgos y el patch_embed. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens, ni sobre si se aplicó RLHF o DPO.

## Capacidades
- Clasificación y decisión estructurada: produce distribuciones sobre 255 códigos para tareas de elección, sí/no, selección múltiple y escalas.
- Extracción de características: pipeline declarado como feature-extraction.
- Procesamiento multimodal: integra una torre visual ViT para incorporar imágenes en el estado de entrada.
- Razonamiento de pase único: evalúa un estado y un conjunto de preguntas en una sola pasada, sin generación autoregresiva de texto.
- Promediado de permutaciones: el protocolo de evaluación contempla media forward/reverse de opciones para reducir sesgo posicional.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible como capacidad explícita; el diseño es de pase único.
- Capacidades multilingües: no disponible.
- Modo thinking, audio: no disponible.

## Casos de uso
- Clasificación de intención en atención al cliente: dado un estado textual (por ejemplo, un pedido o una reclamación), el modelo devuelve la distribución sobre intenciones predefinidas (factura, reembolso, etc.), tal como muestra el ejemplo de uso de la model card.
- Enrutamiento de tickets y triaje: usar la cabeza de 255 códigos para asignar categorías y prioridades a incidencias entrantes en un sistema de soporte, con una sola inferencia por ticket.
- Moderación y etiquetado de contenido: evaluar estados con preguntas de tipo sí/no o escala para decidir si un contenido requiere revisión, aprovechando el acuerdo top-1 del 100 % frente al BF16.
- Evaluación multimodal de documentos: combinar la torre visual con el estado textual para clasificar capturas, formularios o imágenes adjuntas en flujos de verificación.
- Análisis de encuestas y formularios: procesar respuestas de selección múltiple o escala con el protocolo de permutación forward/reverse para obtener distribuciones de opciones estables.
- Despliegue en hardware limitado: al ocupar 14,69 GiB en lugar de 48,59 GiB, permite servir el modelo en GPUs de menor VRAM manteniendo la calidad de decisión del checkpoint BF16.
- Investigación sobre cuantización: servir como referencia reproducible de la receta HGPTQ (Hadamard + Cholesky GPTQ) para estudiar la degradación de calidad en modelos de decisión.

## Benchmarks y rendimiento
Los datos disponibles comparan la variante cuantizada con el modelo base BF16 en la evaluación code-readout-v1 (12 preguntas, con promediado de permutaciones forward y reverse):

| Evaluación | BF16 base (vllm-sr/d3) | d3-W4A16-HGPTQ |
|---|---:|---:|
| Tamaño safetensors (incl. readout) | 48,59 GiB (52.176.025.120 B) | 14,69 GiB (15.772.221.072 B) |
| Acuerdo top-1 de decisión (12 preguntas) | 100,00 % | 100,00 % |
| Divergencia KL de probabilidad de opciones (media / máx, nats) | 0,000000 | 0,000009 / 0,000071 |
| Similitud coseno de logits del readout de 255 códigos | 1,000000 | 0,999917 |
| Torre visual (vision-probe-v2, 96 imágenes, 50.596 tokens visuales) | 1,000000 cos | 0,995219 media (0,976177 mín) |

La KL de softmax sobre los 255 códigos es de 0,000020 nats, y la evaluación vision-guard-v2 reporta una similitud coseno media de 0,996538 (mínima 0,991070). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 14,69 GiB de pesos en W4A16, más overhead de activaciones y contexto; se recomienda prever al menos 18-20 GiB de VRAM para margen operativo.
- GPU recomendadas: A100 40 GB, H100, L40S; en consumer, RTX 4090 (24 GB) es la opción natural para alojar los pesos completos.
- ¿Cabe en consumer GPU? Sí, en GPUs con 24 GB o más (RTX 4090, RTX 3090); en tarjetas de 16 GB requeriría reducir overhead o dividir el modelo.
- Opciones de despliegue: transformers con compressed-tensors y el runtime propio d3_runtime (D3.from_pretrained); la model card menciona compatibilidad de carga con Qwen3_5Model.from_pretrained y warp-34. No se documentan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d3-W4A16-HGPTQ | 26,09 B | no disponible | safetensors W4A16 (compressed-tensors) | Apache 2.0 | Hugging Face (nchapman) |
| vllm-sr/d3 (base BF16) | ~26 B (48,59 GiB) | no disponible | safetensors BF16 | Apache 2.0 (según model card) | Hugging Face (vllm-sr) |
| Alternativas de decisión de mismo tamaño | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (modelos de decisión con cabeza de lectura de códigos) en la documentación proporcionada.

## Limitaciones y advertencias
- Sesgos conocidos: no disponibles en la información proporcionada; el modelo base no documenta sesgos en la model card.
- Riesgo de alucinación: el modelo no genera texto libre, sino distribuciones sobre códigos; el riesgo se traslada a decisiones mal calibradas cuando el estado de entrada queda fuera de la distribución de calibración.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no están documentados; no se puede garantizar cobertura multilingüe.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base vllm-sr/d3 antes de redistribuir.
- Caveats para producción: la cuantización introduce una divergencia KL pequeña pero no nula (máx. 0,000071 nats) y una degradación de la torre visual (coseno mínimo 0,976177); el despliegue depende de código personalizado (custom_code, d3_runtime) y no se documenta soporte en servidores de inferencia estándar.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/nchapman/d3-W4A16-HGPTQ
- Modelo base: https://huggingface.co/vllm-sr/d3
