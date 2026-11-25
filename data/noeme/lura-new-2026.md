# noeme/Lura-new-2026

## Resumen

Lura-new-2026 es un modelo de generación de texto publicado en Hugging Face por el usuario noeme bajo el identificador `noeme/Lura-new-2026`. Se distribuye en formato transformers con pesos safetensors y está etiquetado con la arquitectura `qwen2`, lo que indica que deriva de la familia Qwen2 de Alibaba. El repositorio ocupa 1,0 GB y contiene 494.032.768 parámetros totales, un tamaño que lo sitúa en la franja de modelos pequeños, adecuado para inferencia en hardware de consumo.

La relevancia de esta ficha es limitada por la escasez de documentación: la model card es la plantilla automática de Hugging Face sin cumplimentar, y no se declaran licencia, idiomas, datos de entrenamiento ni resultados de evaluación. El modelo registra 0 descargas y 0 likes en el momento de la consulta, y su fecha de creación (25 de noviembre de 2026) es posterior a la de la mayoría de checkpoints de referencia, lo que sugiere un lanzamiento reciente y sin validación comunitaria.

A efectos prácticos, debe tratarse como un checkpoint experimental: la arquitectura Qwen2 y el recuento de parámetros son datos verificables a partir de los safetensors y las etiquetas, pero cualquier afirmación sobre calidad, alineación o capacidades concretas carece de respaldo documental. Esta ficha recoge lo que se puede afirmar con rigor y marca explícitamente como no disponible todo lo demás.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (según tag `qwen2`) |
| Parámetros totales | 494.032.768 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo solo contiene safetensors; no se publican GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El tag `qwen2` y el pipeline `text-generation` sitúan el modelo en la estirpe Qwen2: un transformer decoder-only con atención causal, normalización RMSNorm, activaciones SwiGLU y sesgo en las proyecciones QKV (las variantes Qwen2 incorporan bias en q, k y v). Con 494 millones de parámetros, el checkpoint encaja en el escalón de tamaño de Qwen2-0.5B, aunque no se confirma que sea un fine-tuning directo de ese modelo base ni que conserve su configuración exacta de capas y dimensiones ocultas.

No hay información sobre el corpus de entrenamiento, el número de tokens procesados, la composición del dataset, la existencia de fases de RLHF, DPO o SFT, ni sobre innovaciones técnicas como decodificación especulativa o atención lineal. La model card no incluye hiperparámetros, infraestructura de cómputo ni huella de carbono. Todo ello debe considerarse no disponible.

## Capacidades

- Generación de texto autoregresiva y conversación multi-turno, según los tags `text-generation` y `conversational`.
- Compatibilidad declarada con Text Generation Inference (`text-generation-inference`) y con endpoints (`endpoints_compatible`), lo que permite desplegarlo en la infraestructura de inferencia de Hugging Face.
- Capacidad de razonamiento, código y matemáticas: no verificada ni documentada.
- Soporte de tool calling o function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas.
- Capacidades especiales (modo thinking, visión, audio): no documentadas.

## Casos de uso

- Prototipado rápido de asistentes conversacionales: con 494 M de parámetros y pesos safetensors, el modelo se carga en una sola GPU de consumo y permite iterar sobre prompts y plantillas de chat sin coste de infraestructura dedicada.
- Experimentación académica con la familia Qwen2: sirve como punto de partida para estudiar técnicas de fine-tuning (LoRA, QLoRA) sobre un checkpoint pequeño antes de escalar a variantes de 7B o superiores.
- Despliegue en entornos con recursos limitados: su tamaño permite ejecutarlo en portátiles con GPU integrada o en CPU, útil para demos offline y pruebas de integración continua.
- Generación de texto de relleno y datos sintéticos en pipelines de prueba: adecuado para validar formatos de salida y esquemas JSON en sistemas que luego usarán un modelo mayor.
- Evaluación comparativa de checkpoints comunitarios: como baseline de 0,5B en experimentos de ablación sobre arquitecturas Qwen2.
- Servicio de inferencia vía TGI o endpoints de Hugging Face: los tags indican compatibilidad con la API de text-generation-inference, lo que facilita montar un endpoint HTTP para pruebas de latencia.

En todos los casos debe tenerse en cuenta que no hay evidencia publicada de calidad de salida; los usos anteriores son escenarios de ingeniería, no recomendaciones de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 1 GB para los pesos (494 M de parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica, entre 1,5 y 2,5 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: en torno a 0,6-0,8 GB para pesos; en 4 bits, alrededor de 0,4-0,5 GB (estimaciones teóricas, no hay cuantizaciones oficiales publicadas).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobredimensionadas para este tamaño y permitirán batches grandes.
- Cabe holgadamente en GPU de consumo, incluidas GTX 1650, RTX 3050 y portátiles con GPU integrada de gama media; también es viable en CPU con llama.cpp si se generan cuantizaciones GGUF (no incluidas en el repo).
- Opciones de despliegue: transformers (nativo), Text Generation Inference (declarado compatible por tag), endpoints de Hugging Face. vLLM y llama.cpp no están confirmados para este checkpoint concreto; requerirían conversión previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| noeme/Lura-new-2026 | 494 M | no disponible | no disponible | Hugging Face, 0 descargas |
| Qwen2-0.5B (Alibaba) | 494 M | 32.768 tokens (según documentación pública de Qwen2) | Apache 2.0 | Hugging Face, ampliamente utilizado |
| Qwen2.5-0.5B (Alibaba) | 494 M | 32.768 tokens (según documentación pública de Qwen2.5) | Apache 2.0 | Hugging Face, ampliamente utilizado |
| SmolLM2-360M (Hugging Face) | 362 M | 8.192 tokens (según su model card) | Apache 2.0 | Hugging Face |

La comparación se limita a parámetros y licencia, porque Lura-new-2026 no publica contexto, benchmarks ni condiciones de uso. Frente a los Qwen2 oficiales, la diferencia crítica es la ausencia de licencia declarada y de evaluación, lo que impide recomendarlo sobre el modelo base de Alibaba para cualquier uso en producción.

## Limitaciones y advertencias

- Ausencia total de model card: no hay información sobre datos de entrenamiento, sesgos, alineación ni evaluación, lo que impide auditar el modelo.
- Licencia no declarada: no se puede asumir uso comercial permitido; en ausencia de licencia explícita, los derechos de uso son inciertos.
- Riesgo elevado de alucinación y de comportamiento no alineado, al no documentarse fases de RLHF, DPO o filtrado de datos.
- Idiomas soportados desconocidos: no hay garantía de calidad en castellano ni en ningún otro idioma.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo.
- Sin cuantizaciones oficiales ni validación comunitaria (0 descargas, 0 likes): el checkpoint no ha sido probado por terceros.
- Fecha de creación posterior a la de los checkpoints de referencia de la familia Qwen2, lo que sugiere un lanzamiento reciente sin ciclo de validación.
- No debe desplegarse en producción sin una evaluación propia previa sobre el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/noeme/Lura-new-2026
- Paper citado en la model card (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
- Documentación de Qwen2 (familia base según tag): https://huggingface.co/Qwen/Qwen2-0.5B
- Documentación de Text Generation Inference: https://huggingface.co/docs/text-generation-inference
