# mradermacher/Qwen3.8-27B-OBLITERATUS-Advanced-i1-GGUF

## Resumen

El modelo `mradermacher/Qwen3.8-27B-OBLITERATUS-Advanced-i1-GGUF` es una cuantización GGUF con matriz de importancia (imatrix) del modelo `orwelian84/Qwen3.8-27B-OBLITERATUS-Advanced`, que a su vez es una versión "obliterated" (abliterated) del Qwen3.8-27B de Alibaba. El proceso de abliteration, popularizado por Pliny, elimina los mecanismos de rechazo (refusal) del modelo original, logrando una tasa de rechazo del 0% en 842 prompts según el blog de explainx.ai. El autor de esta cuantización es mradermacher, conocido por publicar versiones GGUF de modelos abliterados.

El modelo base Qwen3.8-27B es un transformer denso de 26.895.998.464 parámetros (aproximadamente 26.9B) con una arquitectura híbrida de atención: solo 16 de sus 64 capas usan atención completa, mientras que las otras 48 emplean atención lineal con estado recurrente constante, según la documentación de vLLM Recipes. Esta cuantización ofrece múltiples niveles de compresión (desde Q2_K hasta Q6_K, incluyendo variantes IQ) para adaptarse a diferentes capacidades de hardware. El repositorio tiene un tamaño de 79.9 GB e incluye únicamente archivos GGUF, sin pesos en safetensors.

La relevancia de este modelo radica en su doble vertiente: por un lado, permite ejecutar localmente un modelo de 27B con arquitectura híbrida eficiente; por otro, al estar abliterated, sirve para investigación en seguridad de IA, red teaming y estudios sobre alineación. Su licencia no está especificada en este repositorio, aunque el repo relacionado `mradermacher/Qwen3.8-27B-OBLITERATED-GGUF` declara licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (16 capas de atención completa + 48 capas de atención lineal) |
| Parametros totales | 26.895.998.464 (26.9B) |
| Parametros activos | No aplica (modelo denso, todos los parámetros activos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | No disponible (el modelo base Qwen3.8 es multilingüe, pero no se confirma para esta variante) |
| Licencia | No disponible (el repo relacionado `mradermacher/Qwen3.8-27B-OBLITERATED-GGUF` declara Apache-2.0) |
| Formato de pesos | GGUF (con imatrix) |

## Arquitectura y entrenamiento

La arquitectura del modelo base Qwen3.8-27B es un transformer denso con un diseño híbrido de atención. Según la documentación de vLLM Recipes, solo 16 de las 64 capas utilizan atención completa (con un intervalo `full_attention_interval: 4`), mientras que las 48 restantes emplean atención lineal con un estado recurrente constante. Este enfoque reduce el coste computacional y de memoria en contextos largos, manteniendo la calidad en tareas que requieren razonamiento profundo.

El proceso de "obliteration" (abliteration) consiste en eliminar las direcciones de rechazo aprendidas durante el entrenamiento con RLHF/DPO. Según el blog de explainx.ai, el modelo resultante alcanza una tasa de rechazo del 0% en 842 prompts de prueba, lo que lo convierte en una herramienta útil para red teaming y estudios de seguridad. La cuantización GGUF con imatrix (importance matrix) aplicada por mradermacher optimiza la distribución de pesos para cada nivel de compresión, mejorando la calidad en cuantizaciones bajas como Q2_K o IQ1_S.

No se dispone de información detallada sobre el dataset de entrenamiento del modelo base ni sobre el proceso específico de abliteration aplicado a la variante "Advanced". El repositorio no incluye pesos en safetensors, solo archivos GGUF.

## Capacidades

- Generación de texto: el modelo puede producir texto coherente y contextualmente relevante en múltiples dominios, aunque no se han publicado evaluaciones específicas para esta variante.
- Conversación multi-turno: el tag `conversational` indica que está optimizado para diálogos, aunque no se especifica la longitud de contexto soportada.
- Sin rechazos (uncensored): la abliteration elimina los mecanismos de rechazo, permitiendo generar contenido que el modelo original bloquearía (por ejemplo, respuestas a preguntas sobre temas sensibles).
- Razonamiento: al ser un modelo de 27B con arquitectura híbrida, se espera un rendimiento razonable en tareas de razonamiento lógico y matemático, aunque no hay benchmarks publicados para esta variante.
- Soporte de tool calling: no confirmado en la información disponible, aunque el modelo base Qwen3.8 probablemente lo incluya.
- Capacidades multilingües: no confirmadas para esta variante, aunque el modelo base Qwen3.8 es multilingüe.

## Casos de uso

- Investigación en seguridad de IA: el modelo puede utilizarse para probar sistemas de moderación de contenido, generar prompts adversarios o estudiar el comportamiento de modelos sin alineación. Su tasa de rechazo del 0% lo hace ideal para red teaming.
- Generación de contenido creativo sin restricciones: escritores y artistas pueden usarlo para explorar temas tabú o estilos narrativos que otros modelos censuran, gracias a su naturaleza abliterated.
- Chatbots para nichos específicos: desarrolladores pueden integrarlo en asistentes conversacionales donde se requiera una respuesta sin filtros, por ejemplo en juegos de rol o ficción interactiva.
- Análisis de texto y extracción de información: su capacidad de procesar lenguaje natural permite usarlo en tareas de resumen, clasificación o extracción de entidades, aunque requiere ajuste fino para tareas específicas.
- Despliegue en entornos con recursos limitados: gracias a las cuantizaciones GGUF (especialmente Q4_K_M o inferiores), puede ejecutarse en GPUs de consumo con 16-24 GB de VRAM, o incluso en Mac con 14-27 GB de memoria unificada, según explainx.ai.
- Evaluación de técnicas de cuantización: investigadores pueden comparar el rendimiento de diferentes niveles de cuantización (Q2_K vs Q6_K) en un mismo modelo base, usando este repositorio como referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El blog de explainx.ai menciona una tasa de rechazo del 0% en 842 prompts, pero no proporciona métricas de calidad como MMLU, HumanEval o GSM8K. El artículo de Todd Wolven sobre cuantización AWQ del mismo modelo base (Qwen3.8-27B abliterated) incluye benchmarks, pero no son directamente aplicables a esta variante GGUF.

## Requisitos de hardware

- VRAM estimada para inferencia: según el tamaño del modelo (26.9B parámetros) y la cuantización:
  - Q2_K (~2.5 bits/parámetro): ~8.5 GB
  - Q4_K_M (~4.5 bits/parámetro): ~15 GB
  - Q5_K_M (~5.5 bits/parámetro): ~18.5 GB
  - Q6_K (~6.5 bits/parámetro): ~22 GB
  - Q8 (~8 bits/parámetro): ~27 GB
- GPUs recomendadas: RTX 3090/4090 (24 GB) pueden cargar cuantizaciones hasta Q5_K_M; A100 (40/80 GB) o H100 (80 GB) para Q6_K o Q8. En Mac, según explainx.ai, el modelo corre con 14-27 GB de memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier runtime compatible con GGUF. vLLM no soporta GGUF nativamente, pero puede usarse con el modelo en safetensors (no disponible en este repo).
- Latencia y throughput: no disponibles. Dependerá del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 26.9B | No disponible | Apache-2.0 (según repo relacionado) | safetensors | Con rechazos, alineado |
| Qwen3.8-27B-OBLITERATUS-Advanced (este repo) | 26.9B | No disponible | No disponible | GGUF | Abliterated, sin rechazos |
| Qwen3.8-27B-OBLITERATED-GGUF (mradermacher) | 26.9B | No disponible | Apache-2.0 | GGUF | Variante similar, también abliterated |
| Llama-3-8B (abliterated) | 8B | 8K | Llama 3 license | GGUF | Menor tamaño, menos capacidad |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparativa se basa en características estructurales y de licencia.

## Limitaciones y advertencias

- Contenido sin filtrar: al estar abliterated, el modelo puede generar texto ofensivo, ilegal, peligroso o sexualmente explícito. No debe usarse en aplicaciones orientadas al público general sin supervisión humana.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar hechos, citas o referencias. La abliteration no corrige este problema.
- Licencia incierta: este repositorio no especifica licencia. Aunque el repo relacionado usa Apache-2.0, no hay garantía legal para uso comercial sin confirmación del autor.
- Contexto no documentado: se desconoce la longitud máxima de contexto soportada, lo que dificulta su uso en aplicaciones que requieren ventanas largas.
- Calidad de cuantizaciones bajas: los niveles Q2_K, IQ1_S o IQ2_XXS pueden degradar significativamente la calidad del texto y aumentar la tasa de error.
- Sesgos del modelo base: Qwen3.8-27B puede heredar sesgos de género, raza o cultura de sus datos de entrenamiento, que la abliteration no elimina.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.8-27B-OBLITERATUS-Advanced-i1-GGUF
- Repo relacionado (OBLITERATED-GGUF): https://huggingface.co/mradermacher/Qwen3.8-27B-OBLITERATED-GGUF
- Blog explainx.ai sobre Qwen3.8-27B OBLITERATED: https://www.explainx.ai/blog/pliny-qwen3-8-27b-obliterated-alex-finn-mac-august-2026
- Documentación de vLLM Recipes sobre Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Artículo de Todd Wolven sobre cuantización AWQ del modelo abliterated: https://toddwolven.com/projects/qwen38-awq-quantization
