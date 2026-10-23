# ashokku/at-neo-100m

## Resumen

AT-Neo-100M es un modelo de lenguaje decoder-only de 100.682.496 parámetros entrenado desde cero por Ashok Thakur (usuario `ashokku` en Hugging Face). Se distribuye como modelo base, sin ajuste por instrucciones ni alineamiento de seguridad: su comportamiento es el de un completador de texto, no el de un asistente conversacional. La arquitectura sigue el patrón Llama (RMSNorm, RoPE, MLP SwiGLU, atención con consultas agrupadas y embeddings atados), con 12 capas, anchura 768 y una ventana de contexto de 1.024 tokens.

El modelo se entrena sobre una muestra de 5.000 millones de tokens de FineWeb-Edu (subconjunto `sample-10BT`) y emplea un vocabulario propio de 32.768 tokens BPE a nivel de byte, entrenado sobre el mismo corpus. Su interés es principalmente práctico y didáctico: es un punto de partida ligero y completamente reproducible para experimentos de ajuste fino, pruebas de infraestructura de inferencia y docencia sobre entrenamiento de LLMs, con un coste de hardware mínimo.

La relevancia en el momento actual es doble: por un lado, la licencia Apache-2.0 permite uso comercial sin restricciones de redistribución; por otro, su tamaño permite ejecutarlo en CPU y en cualquier GPU de consumo, lo que lo convierte en un banco de pruebas asequible. Sus cifras de calidad son las esperables en esta escala: 29,4 % de accuracy normalizada en HellaSwag 0-shot, frente al 25 % de una elección aleatoria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama: RMSNorm, RoPE, MLP SwiGLU, grouped-query attention (GQA), embeddings atados |
| Parámetros totales | 100.682.496 (100,7 M) |
| Parámetros activos | no disponible (modelo denso, no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantización | No se publican versiones cuantizadas oficiales; al estar en safetensors es convertible a GGUF, int8 e int4 con herramientas externas |
| Idiomas soportados | Inglés (etiqueta `en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repositorio de 0,2 GB) |

Detalles adicionales de arquitectura: 12 capas, `d_model` de 768, MLP de 2.048, 12 cabezas de consulta y 4 cabezas de clave/valor (ratio GQA 3:1), vocabulario de 32.768 tokens BPE a nivel de byte.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con las optimizaciones habituales de la familia Llama: normalización RMSNorm (pre-norm), embeddings posicionales rotatorios (RoPE), MLP con activación SwiGLU y atención con consultas agrupadas, lo que reduce el coste de la caché KV al compartir 4 cabezas de clave/valor entre 12 cabezas de consulta. Los embeddings de entrada y la cabeza de salida están atados, lo que ahorra 32.768 × 768 ≈ 25,2 M de parámetros y explica que el total se quede en 100,7 M. El tokenizador es un BPE a nivel de byte de 32.768 entradas, entrenado sobre el mismo corpus que el modelo.

El entrenamiento consistió en 9.537 pasos sobre 5.000 millones de tokens de FineWeb-Edu (`sample-10BT`), un corpus de texto web filtrado por calidad educativa y distribuido por Hugging Face bajo licencia ODC-By 1.0. La mejor pérdida de validación reportada es 3,036. No se documenta en la información disponible el uso de RLHF, DPO u otras fases de alineamiento, ni detalles sobre la composición exacta del dataset más allá del corpus citado, la configuración del optimizador, la tasa de aprendizaje o el hardware de entrenamiento. Tampoco se describe ninguna innovación técnica específica más allá del stack Llama estándar.

## Capacidades

- Generación de texto por continuación de prompt: el modelo completa secuencias, no responde a instrucciones.
- Razonamiento básico a nivel de frase: la perplejidad de validación (3,036) indica fluidez gramatical y coherencia local.
- Código y matemáticas: capacidad meramente incidental, derivada del corpus FineWeb-Edu; no se reportan evaluaciones específicas.
- Multilingüismo: no disponible; el modelo está etiquetado únicamente para inglés y el corpus de entrenamiento es mayoritariamente anglófono.
- Tool calling / function calling: no soportado de forma nativa; requeriría ajuste fino específico.
- Uso como agente o razonamiento multi-paso: no soportado; sin ajuste por instrucciones ni formato de chat.
- Modo "thinking", visión o audio: no disponible.
- Capacidad de ajuste fino: al ser un modelo base con licencia permisiva, está pensado como punto de partida para fine-tuning supervisado.

## Casos de uso

- **Prototipado de pipelines de generación de texto**: sirve para validar de extremo a extremo un flujo de tokenización, inferencia y post-procesado con un coste de cómputo mínimo antes de migrar a un modelo mayor, ya que la API es la estándar de `transformers` (`AutoModelForCausalLM`).
- **Ajuste fino para dominios acotados**: sus 100,7 M de parámetros permiten fine-tuning completo en una sola GPU de consumo; es adecuado para tareas de continuación de texto especializado, normalización de campos o generación de plantillas sobre corpus pequeños.
- **Generación de texto en dispositivos con recursos limitados**: con pesos en bf16 (~0,2 GB) y una caché KV de apenas ~12 MB en el contexto máximo, cabe en CPU, Raspberry Pi o GPUs integradas, lo que habilita completado de texto offline.
- **Docencia e investigación sobre entrenamiento de LLMs**: la configuración completa (12 capas, 768 de anchura, 5.000 M de tokens, 9.537 pasos) es reproducible a pequeña escala y sirve para estudiar curvas de escalado, elección de tokenizador o el efecto de GQA frente a atención multi-cabeza.
- **Pruebas de infraestructura de inferencia**: útil como carga sintética para validar despliegues de TGI (el repositorio está etiquetado como compatible con endpoints), vLLM o llama.cpp, midiendo latencia y throughput sin consumir presupuesto de GPU.
- **Generación de datos sintéticos auxiliares**: puede producir continuaciones de texto para aumentar corpus de clasificación o para pruebas de robustez, siempre con revisión humana dado su riesgo de alucinación.
- **Experimentación en interpretabilidad**: su tamaño reducido facilita análisis de activaciones, atención y circuitos internos con recursos de una sola máquina.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado | Referencia aleatoria |
|---|---|---|---|
| HellaSwag (0-shot, 10.042 ítems) | acc_norm | 29,4 % | 25 % |
| HellaSwag (0-shot, 10.042 ítems) | acc | 28,4 % | 25 % |
| Pérdida de validación (entrenamiento) | loss | 3,036 | no disponible |

No se han publicado resultados de benchmarks adicionales (MMLU, GSM8K, HumanEval, ARC, PIQA, etc.) en la información disponible. El único dato de evaluación pública es HellaSwag, donde el modelo supera el azar en 4,4 puntos porcentuales en `acc_norm`, lo que sitúa su sentido común narrativo en un nivel muy incipiente.

## Requisitos de hardware

- **VRAM estimada en inferencia**: ~0,4-0,5 GB en bf16/fp16 incluyendo activaciones y caché KV; ~0,15-0,25 GB con cuantización int8 y ~0,1 GB en int4 (estimaciones calculadas a partir de los 100,7 M de parámetros, no publicadas por el autor).
- **Pesos en disco**: repositorio de 0,2 GB en safetensors.
- **GPU recomendadas**: cualquier GPU con 1 GB o más de VRAM es suficiente (GTX 1650, RTX 3060, RTX 4090, T4, L4, A10, A100, H100). El modelo está sobredimensionado para estas GPU en el sentido contrario: el cuello de botella será el lanzamiento de kernels, no la memoria.
- **GPU de consumo**: sí, cabe holgadamente en cualquier GPU de consumo de los últimos diez años, e incluso en GPUs integradas.
- **CPU**: inferencia viable en CPU sin cuantización; con llama.cpp y cuantización Q4 es apto para dispositivos de baja potencia.
- **Opciones de despliegue**: `transformers` (ruta oficial documentada), Text Generation Inference (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM, llama.cpp u Ollama previa conversión a GGUF. No se distribuyen archivos GGUF en el repositorio.
- **Latencia y throughput**: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

No se han encontrado en la información proporcionada resultados de benchmarks ni fichas de modelos directamente comparables. La siguiente tabla recoge únicamente datos públicos de referencia de cada familia, sin resultados de rendimiento verificados en esta búsqueda.

| Modelo | Parámetros | Contexto | Licencia | Idiomas | HellaSwag |
|---|---|---|---|---|---|
| AT-Neo-100M | 100,7 M | 1.024 | Apache-2.0 | Inglés | 29,4 % (acc_norm) |
| GPT-Neo-125M (EleutherAI) | 125 M | 2.048 | MIT | Inglés | no disponible |
| Pythia-160M (EleutherAI) | 160 M | 2.048 | Apache-2.0 | Inglés | no disponible |
| SmolLM2-135M (Hugging Face) | 135 M | 8.192 | Apache-2.0 | Inglés | no disponible |

Frente a estas alternativas, AT-Neo-100M destaca por ser el más pequeño y por su contexto más corto (1.024 tokens, entre 2 y 8 veces menor), a cambio de una licencia igual de permisiva y de un coste de inferencia inferior. Todos ellos son modelos base o con ajuste ligero, no asistentes alineados.

## Limitaciones y advertencias

- **Es un modelo base sin ajuste por instrucciones**: no sigue órdenes, no mantiene formato de chat y no responde preguntas de forma directa; solo continúa texto.
- **Alucinación frecuente**: el propio autor advierte que genera texto fluido pero "a menudo inventa hechos". No debe usarse como fuente de información sin verificación.
- **Sin alineamiento de seguridad**: no ha pasado por RLHF, DPO ni filtros de contenido; puede producir salidas sesgadas, tóxicas o inapropiadas, y no incorpora rechazos ante peticiones dañinas.
- **Rendimiento muy limitado**: 29,4 % en HellaSwag `acc_norm` está a 4,4 puntos del azar; no es competitivo en tareas de razonamiento, conocimiento factual o matemáticas.
- **Contexto corto**: 1.024 tokens impiden casos de uso con documentos largos, conversaciones multi-turno extensas o RAG con muchos fragmentos.
- **Monolingüe en inglés**: el corpus FineWeb-Edu es mayoritariamente anglófono; el rendimiento en castellano no está evaluado y previsiblemente será pobre.
- **Sesgos del corpus**: FineWeb-Edu es texto web filtrado por criterio educativo, lo que hereda los sesgos de representación de la web y sobrerrepresenta determinados registros y dominios.
- **Licencia y atribución**: los pesos son Apache-2.0 (uso comercial permitido con atribución), pero los datos de entrenamiento FineWeb-Edu están bajo ODC-By 1.0, que exige atribución a Hugging Face; conviene revisar las obligaciones de atribución antes de un despliegue comercial.
- **No apto para producción sin más trabajo**: el autor lo declara explícitamente; requiere fine-tuning y evaluación adicionales.
- **Ausencia de versiones cuantizadas oficiales**: cualquier despliegue en llama.cpp u Ollama exige convertir los pesos por cuenta propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ashokku/at-neo-100m
- Perfil del autor (Ashok Thakur): https://huggingface.co/ashokku
- Dataset de entrenamiento (FineWeb-Edu): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Repositorio de referencia de GPT-Neo-125M citado en la búsqueda: https://huggingface.co/nikitastheo/GPT-Neo-100m/tree/main
- Paper no disponible; blog o demo no disponibles en la información proporcionada.
