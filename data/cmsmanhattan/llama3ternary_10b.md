# CMSManhattan/Llama3Ternary_10b

## Resumen

Llama3Ternary_10b es un modelo de generación de texto derivado de meta-llama/Meta-Llama-3-8B, publicado por el usuario CMSManhattan en Hugging Face. Su rasgo diferencial es que los pesos se han cuantizado a formato ternario (valores en {-1, 0, +1}, también etiquetado como "1.58-bit" o estilo BitNet), lo que en teoría reduce drásticamente el coste de almacenamiento y permite operaciones de multiplicación sin producto. A pesar del nombre "10b", el recuento real de parámetros según los safetensors del repositorio es de 9.640.873.984 (~9,64 mil millones), superior a los 8B del modelo base, presumiblemente por la estructura adicional introducida en la cuantización ternaria.

El modelo se distribuye en formatos safetensors y GGUF, con licencia declarada como BSL-1.0 en las etiquetas y como llama3 en la ficha, y acceso restringido (gated) que exige aceptar condiciones en Hugging Face. Está orientado a conversación y generación de texto en inglés y se presenta como miembro del programa NVIDIA Inception.

La relevancia actual del modelo radica en el interés por las arquitecturas de pesos de baja precisión (1.58-bit) como vía para reducir requisitos de memoria en inferencia, aunque la información pública disponible sobre su entrenamiento, evaluación y rendimiento es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Meta-Llama-3-8B, con pesos cuantizados a ternario (1.58-bit) |
| Parametros totales | 9.640.873.984 (~9,64 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Llama 3 8B soporta 8.192 tokens, no confirmado para este derivado) |
| Tipos de cuantizacion | Ternaria (1.58-bit); disponible en safetensors y GGUF |
| Idiomas soportados | Inglés (en) |
| Licencia | BSL-1.0 según etiquetas; llama3 según ficha (discrepancia no resuelta) |
| Formato de pesos | safetensors, GGUF |
| Acceso | Restringido (gated) en Hugging Face |
| Modelo base | meta-llama/Meta-Llama-3-8B |
| Tamano del repositorio | 54,2 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer decoder-only de Meta-Llama-3-8B (atención multi-cabeza con RoPE, normalización RMSNorm y activación SwiGLU), pero sustituye los pesos de precisión completa por representaciones ternarias con valores en {-1, 0, +1}. Este esquema, popularizado por los trabajos de BitNet (1.58-bit), busca que las multiplicaciones matriz-vector se reduzcan a sumas y restas condicionales, disminuyendo el coste computacional y de memoria en hardware adecuado.

No se dispone de información pública sobre el proceso de entrenamiento: no se especifican el número de tokens utilizados, la composición del dataset, si hubo cuantización post-entrenamiento (PTQ) o entrenamiento desde cero con pesos ternarios, ni si se aplicaron fases de RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal. La diferencia entre el nombre "10b" y los 9,64 B reales sugiere que la conversión ternaria añadió parámetros auxiliares (posiblemente escalas o capas de adaptación), pero este extremo no está confirmado en la información disponible.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Llama 3 8B.
- Razonamiento general y respuesta a instrucciones, sujeto a la degradación que pueda introducir la cuantización ternaria (no documentada).
- Soporte de tool calling / function calling: no disponible de forma explícita en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al inglés según la ficha.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que sugiere despliegue vía la infraestructura de Hugging Face.

## Casos de uso

- Experimentación en investigación sobre pesos de baja precisión: el modelo sirve como banco de pruebas para estudiar la degradación de calidad al pasar de FP16 a ternario en un transformer de 8B, comparando salidas con el Llama 3 8B original.
- Despliegue en entornos con memoria muy limitada: la representación ternaria y los ficheros GGUF permiten probar inferencia en hardware donde un modelo de 8B en FP16 no cabría, siempre que el runtime soporte kernels ternarios.
- Generación de texto conversacional en inglés para prototipos: útil para validar pipelines de chat antes de migrar a un modelo de producción con precisión completa.
- Evaluación de runtimes de cuantización extrema: permite comparar el comportamiento de motores de inferencia que implementan operaciones ternarias frente a los que las emulan.
- Docencia y divulgación: ejemplo práctico de cuantización 1.58-bit aplicada a un modelo ampliamente conocido como Llama 3.
- Pruebas de compatibilidad con la API de endpoints de Hugging Face: la etiqueta `endpoints_compatible` facilita integrarlo en flujos de despliegue gestionado para pruebas internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia teórica, un modelo de ~9,64 B en ternario empaquetado a ~2 bits por peso ocuparía en torno a 2,4 GB de pesos, más overhead de activaciones, escalas y KV cache; las cifras reales dependen del runtime y del formato GGUF concreto.
- GPU recomendadas: no disponibles. La información no especifica hardware validado; la pertenencia al programa NVIDIA Inception sugiere compatibilidad con GPUs NVIDIA, pero no se detalla.
- Compatibilidad con GPU de consumo: no confirmada. Solo sería viable si el motor de inferencia soporta operaciones ternarias o emulación eficiente.
- Opciones de despliegue: GGUF sugiere compatibilidad potencial con llama.cpp y derivados (Ollama, LM Studio), no verificado; la etiqueta `endpoints_compatible` apunta a Hugging Face Inference Endpoints.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Licencia | Acceso |
|---|---|---|---|---|---|
| Llama3Ternary_10b | ~9,64 B | no disponible | Ternaria (1.58-bit) | BSL-1.0 / llama3 (discrepancia) | Gated |
| meta-llama/Meta-Llama-3-8B | 8,03 B | 8.192 tokens | FP16/BF16 | Llama 3 Community License | Gated |
| Microsoft BitNet b1.58 (referencia) | ~3,9 B (variante publicada) | no disponible | Ternaria nativa | MIT (según variante) | Abierto |
| Llama 3 8B cuantizado a 4-bit (GGUF) | 8,03 B | 8.192 tokens | 4-bit (Q4_K_M, etc.) | Llama 3 Community License | Abierto/Gated según repo |

La comparación con BitNet b1.58 es la más directa en cuanto a esquema de cuantización, mientras que los GGUF de 4 bits de Llama 3 8B representan la alternativa práctica más habitual para reducir memoria manteniendo precisión aceptable. No hay datos de rendimiento de Llama3Ternary_10b que permitan comparar calidad.

## Limitaciones y advertencias

- Ausencia total de documentación sobre entrenamiento, evaluación y procedencia de los pesos: no hay model card detallada ni benchmarks publicados.
- La cuantización ternaria agresiva puede degradar sustancialmente la calidad respecto al Llama 3 8B original; no se ha cuantificado esa pérdida.
- Discrepancia de licencia: las etiquetas indican BSL-1.0 y la ficha indica llama3; además, al derivar de Meta-Llama-3-8B, se heredan las obligaciones de la Llama 3 Community License, incluida la restricción de uso comercial para productos con más de 700 millones de usuarios mensuales.
- Acceso restringido (gated): requiere aceptar condiciones y estar autenticado en Hugging Face.
- Solo inglés: no hay soporte multilingüe documentado.
- Riesgo de alucinación y sesgos heredados del modelo base, sin evaluación específica para este derivado.
- Autoría individual (CMSManhattan) sin trayectoria verificable en la información disponible; conviene tratar el modelo como experimental y no apto para producción sin validación propia.
- El nombre "10b" no coincide con el recuento real de parámetros (9,64 B), lo que puede inducir a error en la planificación de recursos.
- Compatibilidad de runtimes no garantizada: la inferencia ternaria requiere soporte específico que muchos motores no ofrecen.

## Enlaces

- Hugging Face: https://huggingface.co/CMSManhattan/Llama3Ternary_10b
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B
- Paper de referencia BitNet b1.58 (The Era of 1-bit LLMs): https://arxiv.org/abs/2402.17764
- Repositorio oficial de BitNet: https://github.com/microsoft/BitNet
