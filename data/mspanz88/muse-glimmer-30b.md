# Mspanz88/Muse-Glimmer-30B

## Resumen

Muse Glimmer-30B es un modelo de lenguaje causal denso de aproximadamente 29.600 millones de parámetros desarrollado por Meta Superintelligence Lab (publicado en HuggingFace por el usuario Mspanz88) y destilado a partir de Muse Spark. Su rasgo diferencial es que combina un transformer causal de texto con un encoder de percepción dedicado de ~1,8B parámetros (ViT-G/14), lo que le permite aceptar entradas intercaladas de texto e imagen y emitir únicamente texto. Está diseñado específicamente para tareas agénticas autónomas ejecutadas en hardware de consumo, sin necesidad de infraestructura en la nube.

El modelo se ha optimizado para despliegue local: según la model card, las cuantizaciones K-Quant reducen los pesos a menos de 20 GB (~4 bits) con una degradación de entre el 0,2% y el 1,0% en una media de 15 benchmarks. Incorpora además un "drafter" de decodificación especulativa basado en DFlash, que predice bloques de 16 tokens por pasada y multiplica el throughput hasta 3,1x en una RTX 5090.

Con una ventana de contexto de 131.072+ tokens, licencia Apache 2.0, soporte declarado de más de 100 idiomas y corte de conocimiento el 4 de enero de 2026, el modelo apunta a casos de uso de agentes multimodales (interpretación de capturas, gráficos y documentos), uso fiable de herramientas y recuperación ante fallos, todo ello en GPUs de 24-32 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con encoder de percepción (ViT-G/14) |
| Parámetros totales | ~29,6B (29.776.626.688 según safetensors; incluye encoder visual) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072+ tokens |
| Tipos de cuantización | Full precision (16-bit), K-Quant-Dynamic, K-Quant-17GB (~4 bits); drafter DFlash cuantizado |
| Idiomas soportados | Más de 100 idiomas según la model card (HuggingFace no declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; variantes cuantizadas K-Quant |

Especificaciones internas del language model: dimensión oculta 6656, 52 capas, patrón de atención [Local, Local, Local, Global] repetido, ventana deslizante de 2048, gated attention, 32 cabezas Q / 2 cabezas KV (GQA 16:1), dimensión de cabeza 128, FFN SwiGLU con dimensión intermedia 19.968, RoPE (θ = 500.000) solo en capas locales, vocabulario de 202.048 tokens (200.000 BPE + 2.048 especiales) y un máximo de 4.096 tokens visuales por imagen.

## Arquitectura y entrenamiento

La arquitectura es un transformer causal denso con atención híbrida: tres capas locales con ventana deslizante de 2048 seguidas de una capa global, repetidas a lo largo de 52 capas. Emplea GQA con ratio 16:1 (32 cabezas Q, 2 KV), gated attention y RoPE únicamente en las capas locales, lo que reduce el coste del KV cache en secuencias largas. El encoder de percepción (referenciado en el paper arXiv:2504.13181) es un ViT-G/14 de ~1,8B parámetros, 50 capas, anchura 1536 y patch size 14.

El modelo se destila a partir de Muse Spark. Los datos de entrenamiento son contenido multimodal de fuentes públicas, datos de terceros e información de productos y servicios de Meta, curados por redes de proveedores externos y personal de Meta, con corte de conocimiento el 4 de enero de 2026. La model card no detalla el número exacto de tokens ni la composición del dataset, ni especifica si se aplicaron fases de RLHF o DPO. La innovación técnica destacada es el drafter DFlash (arXiv:2602.06036), un modelo de difusión de bloques que propone 16 tokens por pasada con 5 capas, atención deslizante de 2048, 32 cabezas Q / 8 KV y capas de características ocultas uniformes sobre las capas {1, 13, 25, 37, 49} del modelo objetivo; el modelo principal verifica las propuestas en paralelo.

## Capacidades

- Generación de texto y razonamiento multi-paso sobre horizontes largos, con planes coherentes en flujos de trabajo extendidos.
- Comprensión multimodal de entrada: texto e imágenes intercaladas (capturas de pantalla, gráficos, documentos), con salida únicamente de texto.
- Uso fiable de herramientas y function calling con esquemas precisos a lo largo de flujos extensos.
- Ejecución agéntica de extremo a extremo: trabajo dentro de scaffolds, escritura y depuración de código, resolución de peticiones multi-turno.
- Recuperación ante fallos: diagnostica errores de llamadas a herramientas y reintenta en lugar de detenerse.
- Compatibilidad con scaffolds de orquestación como OpenClaw y Hermes Agent.
- Esfuerzo de razonamiento controlable: distintos niveles de razonamiento para equilibrar calidad y velocidad.
- Multilingüe: entrenado con datos de más de 100 idiomas.
- Despliegue local sin red ni infraestructura cloud.

## Casos de uso

- Agentes autónomos de escritorio: el modelo puede interpretar capturas de pantalla del entorno, decidir la siguiente acción y ejecutar tool calls sobre aplicaciones, gracias a la entrada multimodal y a la ventana de 131K tokens que mantiene el estado de la tarea.
- Automatización de soporte técnico multi-turno: gestiona conversaciones largas con historial extenso y recupera el hilo tras respuestas inesperadas de APIs internas, sin reiniciar el flujo.
- Ingeniería de software asistida: escritura y depuración de código dentro de scaffolds, con evaluación declarada en SWE-Bench; útil para pipelines de CI/CD donde el agente propone parches y verifica resultados.
- Análisis de documentos y gráficos: extrae información de informes con tablas e imágenes, combinando el encoder ViT-G/14 con razonamiento sobre el texto extraído, en local y sin enviar datos a la nube.
- Orquestación de herramientas empresariales (MCP): invoca funciones con esquemas estrictos en flujos de varias etapas (consultas a bases de datos, ticketing, CRM), apoyándose en la capacidad declarada para MCP-Atlas.
- Asistentes de investigación profunda: ejecuta búsquedas iterativas y síntesis multi-fuente (evaluado en DeepSearch QA) manteniendo el contexto de la investigación en una sola ventana.
- Despliegue en estaciones de trabajo con GPU de consumo: al caber en 24-32 GB con K-Quant, permite prototipar agentes en una RTX 4090/5090 o en un MacBook M4/M5 Max sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card indica que el modelo se evalúa en DeepSearch QA, MCP-Atlas, τ3-Bench y SWE-Bench, pero no incluye las puntuaciones. Sí se publican datos de degradación por cuantización y de throughput.

Degradación por cuantización (media de 15 benchmarks):

| Configuración | Degradación | Hardware objetivo |
|---|---|---|
| Full precision | — | 64 GB VRAM |
| K-Quant-Dynamic | 0,2% | 32 GB VRAM |
| K-Quant-17GB | 1,0% | 24 GB VRAM |

Throughput con K-Quant-17GB + drafter DFlash cuantizado (batch size 1, decodificación greedy):

| GPU | Sin especulación (tok/s) | Con DFlash (tok/s) | Aceleración |
|---|---|---|---|
| Nvidia RTX 5090 | 74,9 | 233,4 | 3,1x |
| Apple M4 Max | 23,7 | 37,8 | 1,5x |
| Apple M5 Max | 26,6 | 50,2 | 1,8x |

## Requisitos de hardware

- VRAM estimada: 64 GB en precisión completa; 32 GB con K-Quant-Dynamic; 24 GB con K-Quant-17GB (pesos del LM por debajo de 20 GB, dejando margen para KV cache, encoder visual y drafter).
- GPUs recomendadas: Nvidia RTX 5090 (32 GB) para el perfil K-Quant-Dynamic; A100/H100 para precisión completa o serving de mayor batch.
- GPU de consumo: sí, cabe en tarjetas de 24 GB (RTX 4090, RTX 3090) con K-Quant-17GB; también en Apple Silicon M4 Max y M5 Max.
- Opciones de despliegue: transformers (librería declarada), endpoints compatibles de HuggingFace (tag `endpoints_compatible`) y esquemas de cuantización K-Quant, habitualmente asociados a llama.cpp/Ollama. No se confirma en la información disponible el soporte de vLLM o TGI.
- Latencia y throughput: 233,4 tok/s en RTX 5090, 37,8 tok/s en M4 Max y 50,2 tok/s en M5 Max con especulación DFlash (batch 1). El modelo se describe como suficientemente rápido para conversación fluida e interacción agéntica en tiempo real.

## Comparativa con modelos similares

No hay datos públicos de benchmarks de Muse Glimmer que permitan una comparación de rendimiento directa; la comparación se limita a atributos estructurales.

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| Muse Glimmer-30B | ~29,6B | 131.072+ | Texto + imagen → texto | Apache 2.0 | Decodificación especulativa DFlash; orientado a agentes locales |
| Qwen2.5-VL-32B-Instruct | ~32,5B | 128K | Texto + imagen + vídeo → texto | Apache 2.0 | Referencia multimodal open source de tamaño similar |
| Gemma 3 27B-IT | 27B | 128K | Texto + imagen → texto | Licencia Gemma (no Apache) | Restricciones de uso comercial distintas |
| InternVL3-38B | ~38B | 128K (extensible) | Texto + imagen → texto | Apache 2.0 (según variante) | Mayor número de parámetros |

La ventaja estructural de Muse Glimmer frente a estas alternativas es la combinación de licencia Apache 2.0, encoder visual dedicado y un pipeline de cuantización más drafter especulativo validado para 24 GB de VRAM. La comparación de calidad queda pendiente de la publicación de resultados en DeepSearch QA, MCP-Atlas, τ3-Bench y SWE-Bench.

## Limitaciones y advertencias

- No se han publicado resultados numéricos de benchmarks, por lo que el rendimiento real frente a alternativas no está verificado de forma independiente.
- Riesgo de alucinación inherente a los modelos de lenguaje; en tareas agénticas, una alucinación puede traducirse en tool calls incorrectas, por lo que se recomienda validación y límites de acción.
- Sesgos: la model card no documenta evaluaciones de sesgo ni de seguridad; los datos de entrenamiento incluyen contenido de productos de Meta y de terceros, con sesgos potenciales no cuantificados.
- Idiomas: se declaran más de 100 idiomas, pero no se especifica el nivel de calidad por idioma ni se ofrece una lista; el rendimiento fuera de los idiomas mayoritarios puede degradarse.
- Contexto: 131.072+ tokens; la calidad en el extremo superior de la ventana no está cuantificada públicamente.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de los datos de terceros y de los componentes derivados (encoder y drafter).
- La cuantización K-Quant-17GB introduce una degradación media del 1,0% en 15 benchmarks; en tareas sensibles debe validarse el impacto específico.
- La información de HuggingFace no lista idiomas y el modelo tiene solo 8 descargas y 1 like, lo que indica ausencia de validación por parte de la comunidad.
- Fecha de corte de conocimiento: 4 de enero de 2026; no cubre eventos posteriores.

## Enlaces

- HuggingFace: https://huggingface.co/Mspanz88/Muse-Glimmer-30B
- Paper del encoder de percepción: https://arxiv.org/abs/2504.13181
- Paper del drafter DFlash: https://arxiv.org/abs/2602.06036
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
