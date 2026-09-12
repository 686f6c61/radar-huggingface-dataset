# cooler8/yejin-korean-3b-v2-base

## Resumen

yejin-korean-3b-v2-base es un modelo de lenguaje de 3.015.362.560 parámetros (3,02 B) desarrollado por el usuario cooler8, entrenado íntegramente desde cero sobre un corpus en coreano. Se trata de un modelo base (causal language model) sin ajuste por instrucciones, pensado como fundación para posteriores etapas de SFT y DPO, que el propio autor publica por separado. Su relevancia radica en que no parte de pesos de terceros: es un preentrenamiento propio sobre 155 GB de texto coreano, lo que lo convierte en un punto de partida poco habitual para investigación en modelos nativos de ese idioma.

Técnicamente emplea una arquitectura transformer decoder-only causal con atención de consultas agrupadas (GQA) en proporción 3:1, normalización QK por cabeza antes de RoPE y embeddings atados. La ventana de contexto es de 4096 tokens, con un tokenizador BPE byte-level propio de 64.000 entradas especializado en coreano. El modelo se carga mediante la clase `Qwen3ForCausalLM` de HuggingFace únicamente por compatibilidad de grafo computacional, ya que los pesos son independientes de la familia Qwen.

El entrenamiento se realizó con 8 GPU NVIDIA H200 durante 34.000 pasos sobre aproximadamente 73.000 millones de tokens, alcanzando una pérdida declarada de ~2,0. La licencia Apache-2.0 facilita su uso comercial, aunque el modelo, al ser base, requiere ajuste adicional para tareas conversacionales. Existe una variante conversacional en las etiquetas del repositorio, pero las versiones alineadas son `yejin-korean-3b-v2-sft` y `yejin-korean-3b-v2-dpo`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal, GQA 3:1, QK-Norm (RMSNorm por cabeza, aplicada antes de RoPE), embeddings atados; clase HF `Qwen3ForCausalLM` |
| Parámetros totales | 3.015.362.560 (3,02 B) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantización | No se publican cuantizaciones precalculadas en el repositorio. Pesos en bf16/fp16 convertibles a GGUF (llama.cpp), GPTQ o AWQ |
| Idiomas soportados | Coreano (ko) e inglés (en); el corpus de entrenamiento es exclusivamente coreano de origen |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Dimensión oculta | 3072 |
| Capas | 28 |
| Cabezas de atención | 24 (8 cabezas KV, GQA 3:1) |
| Vocabulario | 64.000 tokens (BPE byte-level propio) |
| RoPE theta | 500.000 |
| Tamaño del repositorio | 6,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only estándar con varias decisiones técnicas concretas: 28 capas, dimensión oculta 3072, 24 cabezas de atención con solo 8 cabezas de clave/valor (GQA con factor de agrupación 3:1), lo que reduce el coste de la caché KV frente a atención multi-cabeza completa. Incorpora QK-Norm, es decir, una RMSNorm por cabeza aplicada antes de RoPE, un mecanismo de estabilización del entrenamiento que no existe en `LlamaForCausalLM` y que obliga a cargar el modelo con la clase `Qwen3ForCausalLM`. Los embeddings de entrada y salida están atados, y el tokenizador es un BPE byte-level de 64.000 entradas entrenado específicamente para coreano, no heredado de otro modelo.

El preentrenamiento se llevó a cabo con 8 GPU NVIDIA H200 durante 34.000 pasos sobre aproximadamente 73.000 millones de tokens procedentes de un corpus coreano de 155 GB que incluye AI Hub, CulturaX, Wikipedia y libros de texto. La pérdida final declarada es de ~2,0. No se menciona en la información disponible ningún uso de RLHF, DPO ni decodificación especulativa en esta variante base; las etapas de alineación se publican como modelos separados. El checkpoint convertido corresponde al paso 34.000, con fecha de conversión 2026-09-12 02:27 UTC.

## Capacidades

- Generación de texto causal en coreano: continuación de texto, redacción y modelado de lenguaje sobre la base del corpus de preentrenamiento.
- Capacidad secundaria en inglés, derivada de la presencia de contenidos en inglés en corpus como CulturaX y Wikipedia; no está cuantificada en la información disponible.
- Modelado de lenguaje base apto para fine-tuning supervisado (SFT), DPO u otras técnicas de alineación.
- Extracción de representaciones internas para tareas posteriores (clasificación, etiquetado, similitud) mediante cabezas adicionales o ajuste.
- No es un modelo ajustado por instrucciones: no sigue instrucciones de forma fiable sin una etapa de SFT previa.
- Soporte de tool calling / function calling: no disponible en la variante base; dependería de la variante SFT.
- Soporte de agentes y razonamiento multi-paso: no disponible en la variante base.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo de razonamiento explícito (thinking mode): no disponible.
- Compatibilidad de despliegue declarada con vLLM y llama.cpp, además de transformers y text-generation-inference (etiqueta `endpoints_compatible`).

## Casos de uso

- Fine-tuning supervisado para asistentes conversacionales en coreano: el modelo sirve como inicialización de 3,02 B parámetros sobre la que aplicar SFT con datos de diálogo, evitando partir de un modelo multilingüe genérico y aprovechando su tokenizador especializado.
- Investigación en tokenización coreana: al disponer de un BPE byte-level propio de 64.000 entradas, permite estudiar la eficiencia de compresión de texto coreano frente a tokenizadores multilingües de referencia.
- Generación aumentada por recuperación (RAG) sobre documentación interna en coreano: con 4096 tokens de contexto se pueden inyectar fragmentos recuperados de 2.000 a 3.000 tokens y generar respuestas fundamentadas, tras una etapa de ajuste por instrucciones.
- Traducción asistida coreano-inglés: como modelo base bilingüe puede afinarse para traducción, aunque requiere datos paralelos y evaluación específica, dado que no hay métricas publicadas.
- Etiquetado y clasificación de textos coreanos a escala: mediante ajuste con cabezas de clasificación, para moderación de contenido, análisis de opinión o enrutado de tickets.
- Modelo de referencia para evaluación de sesgos y comportamientos lingüísticos en coreano: su entrenamiento completamente cerrado a corpus coreano lo hace útil como línea base en estudios comparativos.
- Despliegue en infraestructura propia o en el borde: con cuantización de 4 bits el modelo ocupa alrededor de 1,8 GB, lo que permite ejecución en una única GPU de consumo o incluso en CPU con llama.cpp para prototipos.
- Generación de texto creativo y periodístico en coreano como paso previo a un ajuste con preferencias humanas (DPO), aprovechando la variante DPO publicada por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card únicamente declara una pérdida de entrenamiento de ~2,0 al paso 34.000, dato que no es comparable con métricas estandarizadas como MMLU, HumanEval, GSM8K o KLUE. Tampoco se dispone de mediciones de perplejidad sobre conjuntos de evaluación coreanos.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de 3,02 B parámetros, sin contar caché KV ni activaciones):
  - bf16 / fp16: ~6,1 GB de pesos.
  - int8: ~3,1 GB.
  - 4 bits (GGUF Q4_K_M, AWQ o GPTQ): ~1,8-2,0 GB.
- Caché KV: 28 capas × 8 cabezas KV × 128 dimensiones de cabeza × 2 (clave y valor) ≈ 112 KB por token en bf16, es decir, unos 450 MB con los 4096 tokens de contexto completos.
- GPU recomendadas: una NVIDIA H100 o A100 de 40/80 GB permite servir varias instancias concurrentes con margen amplio. Una RTX 4090 o RTX 3090 de 24 GB es suficiente para inferencia en bf16 con lotes moderados.
- GPU de consumo: sí cabe. Con cuantización de 4 bits el modelo entra holgadamente en GPUs de 8 GB (RTX 3060 Ti, RTX 4060, RTX 2070) y con bf16 en GPUs de 12 GB o más.
- Opciones de despliegue: transformers (referencia declarada en la model card), vLLM, llama.cpp, text-generation-inference; el autor indica compatibilidad directa con vLLM y llama.cpp. Ollama sería posible tras convertir los pesos a GGUF, aunque no está documentado por el autor.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

La comparativa estructural se ofrece a título de referencia externa; los datos de los modelos alternativos provienen de su documentación pública y no han sido verificados en la información proporcionada. No existe comparación de rendimiento publicada para yejin-korean-3b-v2-base.

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| cooler8/yejin-korean-3b-v2-base | 3,02 B | 4096 | Apache-2.0 | Preentrenamiento desde cero, corpus 100 % coreano |
| Qwen2.5-3B | ~3,09 B | 32.768 (ampliable con YaRN) | Qwen Research | Multilingüe, preentrenamiento a gran escala |
| Llama-3.2-3B | ~3,21 B | 128.000 | Llama 3.2 Community License | Multilingüe, alineado por instrucciones |
| EXAONE-3.5-2.4B | ~2,4 B | 32.768 | EXAONE AI Model License (uso restringido) | Bilingüe coreano-inglés, desarrollado por LG AI Research |

Diferencias relevantes: yejin-korean-3b-v2-base ofrece la licencia más permisiva del grupo junto a un contexto netamente inferior (4096 frente a 32.768 o 128.000 tokens) y un enfoque monolingüe en coreano. Al ser un modelo base sin alineación, no es directamente comparable en calidad conversacional con Llama-3.2-3B o EXAONE-3.5, que sí incluyen ajuste por instrucciones.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue órdenes de forma fiable ni mantiene formatos de diálogo sin una etapa previa de SFT.
- No dispone de benchmarks publicados, por lo que no se puede verificar su calidad frente a alternativas de tamaño similar.
- Contexto limitado a 4096 tokens, inferior al de la mayoría de modelos contemporáneos de 3 B, lo que restringe tareas de documentos largos o conversaciones extensas.
- Riesgo de alucinación inherente a cualquier modelo de lenguaje preentrenado y no mitigado por alineación.
- Sesgos potenciales derivados del corpus de entrenamiento (AI Hub, CulturaX, Wikipedia, libros de texto coreanos), cuya composición exacta y proporciones no se detallan.
- Capacidad en inglés no cuantificada: el corpus es de origen coreano, por lo que el rendimiento en inglés debería validarse antes de usarlo en producción bilingüe.
- Aunque la licencia del modelo es Apache-2.0, la procedencia y las condiciones de uso de los datos de entrenamiento (AI Hub, CulturaX, libros de texto) no se documentan con detalle; conviene verificar los términos de las fuentes subyacentes antes de un uso comercial.
- Ausencia de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin resultados de benchmarks ni informes independientes.
- La etiqueta `qwen3` puede inducir a confusión: los pesos son de entrenamiento propio y la clase `Qwen3ForCausalLM` se usa exclusivamente por compatibilidad estructural (QK-Norm), tal como aclara el autor.
- No se documentan métodos de alineación, filtrado de datos ni evaluaciones de seguridad en la variante base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cooler8/yejin-korean-3b-v2-base
- Variante SFT mencionada por el autor: https://huggingface.co/cooler8/yejin-korean-3b-v2-sft
- Variante DPO mencionada por el autor: https://huggingface.co/cooler8/yejin-korean-3b-v2-dpo
- Paper, blog o repositorio adicional: no disponible
- Demo: no disponible
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a sitios no relacionados (Zhihu, foros de consumo), por lo que se descartan como fuentes.
