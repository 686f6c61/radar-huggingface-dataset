# DavidAU/gemma-3-12b-it-vl-GPT-5.1-High-Heretic-Uncensored-Thinking

## Resumen

`gemma-3-12b-it-vl-GPT-5.1-High-Heretic-Uncensored-Thinking` es un ajuste fino (fine-tune) del modelo multimodal Gemma 3 12B de Google, publicado por el usuario DavidAU en Hugging Face. Parte de la variante "heretic" de DreamFast, que elimina los mecanismos de rechazo del modelo original mediante la técnica de abliteration, y añade un entrenamiento adicional con el dataset `TeichAI/gpt-5.1-high-reasoning-1000x` para incorporar razonamiento explícito (modo "thinking"). El resultado es un modelo de 12.187 millones de parámetros con capacidades de imagen-texto a texto, ventana de contexto de 128k tokens y generación de cadenas de pensamiento.

El modelo está orientado a escritura creativa sin restricciones de contenido, generación de ficción en todos los géneros, roleplay y tareas que requieren razonamiento detallado. Su principal atractivo es la combinación de tres modificaciones: la eliminación de rechazos (con una tasa de 7/100 frentes a 98/100 del modelo original), la preservación de capacidades mediante una divergencia KL baja (0.0826) y la incorporación de razonamiento que, según el autor, mejora también el procesamiento de imágenes y los resultados en benchmarks.

Es relevante para desarrolladores e investigadores que necesitan un modelo multimodal de tamaño medio (12B) sin censura, con contexto largo y razonamiento activable, desplegable en hardware de consumo con cuantización. La licencia Apache 2.0 facilita su uso comercial, aunque las implicaciones éticas y legales del contenido sin filtrar deben evaluarse cuidadosamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3), basada en `DreamFast/gemma-3-12b-it-heretic` |
| Parámetros totales | 12.187.325.040 (12,19B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantización | No disponible en la información proporcionada (pesos en bfloat16; compatible con cuantizaciones estándar de llama.cpp/GGUF por herencia de arquitectura Gemma 3) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers); repo de 24,4 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 3 12B: un transformer decoder-only con capacidades multimodales (image-text-to-text), atención con RoPE y ventana de contexto de 128k tokens. Sobre la base `DreamFast/gemma-3-12b-it-heretic` —que ya aplicó abliteration para eliminar rechazos—, DavidAU realizó un fine-tune adicional con Unsloth sobre el dataset `TeichAI/gpt-5.1-high-reasoning-1000x`, compuesto por 1.000 ejemplos de razonamiento de alta calidad generados por GPT-5.1. El entrenamiento se ejecutó en hardware local con Linux.

La innovación principal es la combinación de abliteration con razonamiento destilado: el modelo genera cadenas de pensamiento entre etiquetas `<think>` y `</think>` de forma automática en la mayoría de casos, aunque puede forzarse mediante el prefijo "think deeply:" o mediante la plantilla Jinja `chat-template-thinking.jinja` incluida en el repositorio. Según el autor, el razonamiento afecta a la operación general, la generación de salida, el procesamiento de imágenes y los benchmarks. La divergencia KL respecto al modelo original es de 0.0826 (considerada excelente, ya que valores inferiores a 1 indican poco daño), y la tasa de rechazos se reduce de 98/100 a 7/100.

## Capacidades

- Generación de texto y razonamiento explícito con cadenas de pensamiento en etiquetas `<think>`.
- Procesamiento de imágenes (image-text-to-text): el razonamiento mejora la interpretación de imágenes según el autor.
- Escritura creativa y de ficción en todos los géneros: ciencia ficción, romance, terror, etc., con prosa vívida.
- Generación de tramas, subtramas, continuación de escenas y narración multi-turno.
- Roleplay y conversación sin restricciones de contenido (contenido explícito, lenguaje soez, violencia) cuando se dirige adecuadamente.
- Estabilidad de razonamiento frente a temperatura (rango recomendado 0.1–2.5).
- Soporte de system prompts que modulan el razonamiento y la salida.
- Capacidades multimodales heredadas de Gemma 3 12B (visión).
- No se documenta soporte explícito de tool calling ni function calling en la información proporcionada.
- No se documenta soporte de agentes multi-paso en la información proporcionada.
- Multilingüe limitado: solo inglés declarado.

## Casos de uso

- **Escritura de ficción sin restricciones**: el modelo genera narrativa en cualquier género sin rechazos, con tramas y subtramas detalladas. Adecuado para autores que necesitan borradores extensos con contexto de hasta 128k tokens para mantener coherencia en novelas largas.
- **Roleplay y personajes interactivos**: gracias a la ausencia de filtros y a la estabilidad del razonamiento frente a temperatura, puede mantener conversaciones multi-turno con personalidad consistente en aplicaciones de entretenimiento o videojuegos narrativos.
- **Continuación de escenas y guiones**: con 128k de contexto puede procesar capítulos completos y continuar escenas respetando estilo, personajes y arcos argumentales previos.
- **Análisis y descripción de imágenes con razonamiento**: al ser multimodal, puede describir imágenes, extraer información visual y razonar sobre ellas; útil en herramientas de accesibilidad o catalogación de contenido visual.
- **Generación de contenido explícito o violento para guiones y videojuegos**: cuando se dirige con términos concretos, produce contenido gráfico o soez; útil en industrias creativas que requieren material sin filtros (con las advertencias legales correspondientes).
- **Prototipado de asistentes de escritura**: integrable vía transformers o TGI con pesos safetensors en bfloat16; sirve como base para herramientas de escritura asistida que necesitan razonamiento detallado y contexto largo.
- **Investigación sobre alineación y abliteration**: útil para estudiar el comportamiento de modelos sin censura, medir tasas de rechazo y evaluar el impacto de la eliminación de filtros en benchmarks.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Benchmark | Este modelo | Base heretic (DreamFast) |
|---|---|---|
| ARC Challenge | 0.578 | 0.534 |
| ARC Easy | 0.758 | 0.699 |
| BoolQ | 0.864 | 0.872 |
| HellaSwag | 0.725 | 0.603 |
| OpenBookQA | 0.470 | 0.448 |
| PIQA | 0.788 | 0.733 |
| WinoGrande | 0.715 | 0.658 |

| Métrica de des-censura | Este modelo | `google/gemma-3-12b-it` |
|---|---|---|
| Divergencia KL | 0.0826 | 0 (por definición) |
| Rechazos | 7/100 | 98/100 |

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- **VRAM estimada en bfloat16**: aproximadamente 24,4 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda 32 GB o más (A100 40GB, H100, RTX 6000 Ada).
- **Cuantización Q8**: ~13 GB; cabe en RTX 4090 (24 GB) y RTX 3090.
- **Cuantización Q4**: ~7–8 GB; cabe en GPUs de consumo como RTX 4070, RTX 3080 o superiores.
- **Contexto largo**: con 128k tokens la KV cache crece considerablemente; para contexto completo se necesita VRAM adicional o técnicas de atención eficiente.
- **Opciones de despliegue**: transformers (librería nativa), text-generation-inference (TGI, etiqueta `text-generation-inference` en el repo), llama.cpp/Ollama mediante conversión a GGUF (no se proporcionan GGUF preconvertidos en la información disponible), vLLM por compatibilidad con arquitectura Gemma 3.
- **Latencia y throughput**: no disponibles en la información proporcionada.
- **Hardware de entrenamiento**: el autor indica que se entrenó en hardware local con Linux y Unsloth; no se especifican GPUs.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Rechazos | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (DavidAU) | 12,19B | 128k | Sí | Apache 2.0 | 7/100 | Hugging Face |
| `DreamFast/gemma-3-12b-it-heretic` | 12B | 128k (heredado) | Sí | Apache 2.0 (heredada) | No disponible | Hugging Face |
| `google/gemma-3-12b-it` | 12B | 128k | Sí | Gemma Terms (uso comercial con restricciones) | 98/100 | Hugging Face |
| `TeichAI/gpt-5.1-high-reasoning-1000x` (dataset) | No aplica | No aplica | No aplica | No disponible | No aplica | Hugging Face |

La comparación directa en benchmarks solo está disponible frente a la base heretic (ver sección anterior). No se dispone de datos de otros modelos de razonamiento de 12B en la información proporcionada.

## Limitaciones y advertencias

- **Contenido sin filtrar**: el modelo está diseñado para no rechazar peticiones; puede generar contenido explícito, violento, ilegal o dañino. No es apto para aplicaciones orientadas al público general sin moderación externa.
- **Sesgos**: al derivar de Gemma 3 y entrenarse con un dataset sintético de GPT-5.1, puede heredar sesgos de ambos; no se documentan evaluaciones de sesgo.
- **Alucinación**: el razonamiento detallado no garantiza veracidad; el modelo puede generar afirmaciones falsas con alta confianza, especialmente en dominios factuales.
- **Idioma**: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base Gemma 3 está sujeto a los Gemma Terms of Use; la combinación de licencias debe revisarse legalmente antes de producción.
- **Necesita dirección**: según el autor, para contenido explícito o soez hay que "empujar" el modelo con instrucciones concretas (términos, slang); sin ellas la salida puede ser más sosa de lo esperado.
- **Contexto largo**: 128k tokens requiere VRAM significativa; no se documenta el rendimiento real en contextos extremos.
- **Tool calling y agentes**: no se documenta soporte; no asumir su funcionamiento en pipelines de agentes.
- **Dataset de entrenamiento**: 1.000 ejemplos es un volumen pequeño; el razonamiento puede ser limitado en dominios especializados.
- **Mantenimiento**: modelo de un solo autor con 50 descargas y 6 likes; no hay garantía de soporte ni actualizaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/gemma-3-12b-it-vl-GPT-5.1-High-Heretic-Uncensored-Thinking
- Modelo base heretic: https://huggingface.co/DreamFast/gemma-3-12b-it-heretic
- Modelo original: https://huggingface.co/google/gemma-3-12b-it
- Dataset de entrenamiento: https://huggingface.co/datasets/TeichAI/gpt-5.1-high-reasoning-1000x
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Página de soporte del autor: https://huggingface.co/DavidAU/support
