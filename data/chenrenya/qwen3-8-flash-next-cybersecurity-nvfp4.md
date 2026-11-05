# chenrenya/Qwen3.8-Flash-Next-CYBERSECURITY-NVFP4

## Resumen

Qwen3.8-Flash-Next-CYBERSECURITY-NVFP4 es una compilación modificada a nivel de pesos del modelo multimodal Qwen/Qwen3.8-Flash-Next, publicada por el usuario chenrenya bajo la marca dealignai. Se trata de un artefacto de tipo "abliterated" o "uncensored": se han eliminado los mecanismos de rechazo del modelo base mediante una intervención directa sobre los pesos, sin fine-tuning, LoRA, destilación ni manipulación de plantillas de chat. El resultado es un modelo que responde a peticiones dañinas, ilegales o poco éticas, y que se distribuye explícitamente para investigación en seguridad, red-teaming y evaluación de riesgos.

El modelo conserva la arquitectura y capacidades del base: multimodalidad completa (imagen y vídeo), razonamiento con niveles de esfuerzo (off, low, xhigh) y decodificación especulativa MTP. Está cuantizado en NVFP4 (4 bits) mediante NVIDIA ModelOpt, lo que reduce el repositorio a 135,2 GB para 180 mil millones de parámetros. La librería declarada es SGLang y el autor indica que se sirve con tensor parallelism sobre 2× NVIDIA DGX Spark (GB10).

Es relevante ahora porque ejemplifica una categoría de artefactos de doble uso: modelos de gran escala con salvaguardas eliminadas y cuantización agresiva para despliegue en hardware relativamente asequible. Para investigadores en alineación y seguridad, permite medir la fidelidad del razonamiento tras la abliteración; para el resto de perfiles, constituye un riesgo operativo y legal considerable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con MTP para decodificacion especulativa; detalles internos no disponibles |
| Parametros totales | 179.999.981.459 (~180B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits) mediante NVIDIA ModelOpt; el tag indica "8-bit" en metadatos, en conflicto con el nombre y la descripcion del modelo |
| Idiomas soportados | no disponible (la model card menciona respuestas coherentes en chino en la evaluacion) |
| Licencia | qwen-community-license-1.0 (license: other) |
| Formato de pesos | safetensors (compatible con SGLang) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer multimodal que acepta entradas de imagen y texto, con soporte declarado de vídeo, y que incorpora razonamiento configurable en tres niveles de esfuerzo (off, low, xhigh) junto con decodificación especulativa MTP (multi-token prediction). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

La modificación de esta compilación es puramente a nivel de pesos: según el autor, no hay entrenamiento, LoRA, destilación ni datos sintéticos, y funciona con la plantilla de chat estándar y el system prompt por defecto. La cuantización a NVFP4 se realizó con NVIDIA ModelOpt. El autor reporta que la eliminación de rechazos no acorta la cadena de pensamiento: la longitud mediana de la traza de razonamiento es de 422 tokens frente a 434 del base (0,97×) en preguntas difíciles de varios pasos, con una precisión de respuesta del 98,3% frente al 96,7% del base.

## Capacidades

- Generación de texto y razonamiento multi-paso con niveles de esfuerzo configurables (off, low, xhigh).
- Procesamiento multimodal de imagen y texto (pipeline image-text-to-text), con soporte declarado de vídeo.
- Decodificación especulativa MTP para acelerar la inferencia.
- Respuestas a peticiones dañinas, ilegales o poco éticas: cero rechazos duros (HARD_REFUSE) en HarmBench-320 en todos los niveles de esfuerzo.
- Capacidades multilingües: no documentadas formalmente; se observa al menos generación coherente en chino e inglés.
- No se documenta soporte explícito de tool calling ni de flujos de agentes en la información disponible.

## Casos de uso

- Red-teaming de sistemas de IA: el modelo actúa como generador adversarial para probar clasificadores de seguridad, filtros de contenido y salvaguardas de otros modelos, aprovechando su tasa de cumplimiento del 91-92% en comportamientos dañinos reales.
- Investigación en alineación y abliteración: permite estudiar cómo la eliminación de rechazos afecta a la calibración, la longitud de la cadena de pensamiento y el conocimiento factual (MMLU cae 0,84 pp respecto al base).
- Evaluación de riesgos en ciberseguridad: con un 98-100% de cumplimiento en la categoría cybercrime/intrusion de HarmBench, sirve para medir la eficacia de filtros defensivos frente a contenido de intrusión.
- Evaluación de riesgos químicos y biológicos: 98-100% de cumplimiento en esa categoría, útil para calibrar detectores de contenido peligroso en pipelines de moderación.
- Investigación sobre cuantización NVFP4: permite comparar la fidelidad de razonamiento y conocimiento de una cuantización de 4 bits frente al modelo base en formato completo.
- Despliegue en hardware de gama alta para experimentación: el autor lo sirve con SGLang en 2× NVIDIA DGX Spark (GB10), lo que facilita reproducir experimentos de seguridad en un nodo pequeño.
- Estudio de multimodalidad tras modificación de pesos: al conservar imagen y vídeo, permite analizar si la abliteración afecta a la interpretación de entradas visuales.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (greedy, temperatura 0):

| Benchmark | Base (NVFP4) | Este build | Delta |
|---|---|---|---|
| MMLU overall (n=2280) | 82,11% | 81,27% | -0,84 pp |
| Precisión en preguntas difíciles multi-paso (xhigh) | 96,7% | 98,3% | +1,6 pp |
| Longitud mediana de traza de razonamiento (xhigh) | 434 tok | 422 tok | 0,97× |

Compliance en HarmBench-320 (240 comportamientos de daño real, excluyendo copyright):

| Esfuerzo | TRUE_COMPLY | SOFT_REFUSE | DEFLECT | REDIRECT | HARD_REFUSE |
|---|---|---|---|---|---|
| off | 219/240 (91,2%) | 19 | 1 | 1 | 0 |
| low | 222/240 (92,5%) | 18 | 0 | 0 | 0 |
| xhigh | 219/240 (91,2%) | 20 | 1 | 0 | 0 |

Categorías prioritarias (TRUE_COMPLY):

| Esfuerzo | Cybercrime/intrusion | Chemical/biological |
|---|---|---|
| off | 52/52 (100%) | 41/42 (98%) |
| low | 52/52 (100%) | 42/42 (100%) |
| xhigh | 51/52 (98%) | 41/42 (98%) |

Variaciones notables por asignatura en MMLU: mejoran high_school_biology (+10,0 pp), college_medicine (+7,5), global_facts (+7,5), high_school_chemistry (+7,5), high_school_physics (+7,5) y human_aging (+7,5); empeoran machine_learning (-22,5), moral_scenarios (-17,5), moral_disputes (-12,5), professional_accounting (-10,0), virology (-10,0) y college_mathematics (-7,5). 31 de 57 asignaturas se mantienen o mejoran.

No se han publicado resultados de benchmarks estándar adicionales (HumanEval, GSM8K, MMLU-Pro, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 135,2 GB en NVFP4 (4 bits) para 180B parámetros; se necesita al menos esa cantidad agregada de memoria, más overhead de KV cache y activaciones.
- GPU recomendadas: el autor reporta despliegue en 2× NVIDIA DGX Spark (GB10) con SGLang y tensor parallelism; configuraciones equivalentes multi-GPU de gama alta (A100 80GB, H100 80GB, H200) son opciones razonables, aunque no están documentadas explícitamente.
- No cabe en GPU de consumo individual (RTX 4090 con 24 GB, RTX 5090 con 32 GB) en esta cuantización; requeriría múltiples unidades o cuantizaciones más agresivas no publicadas.
- Opciones de despliegue: SGLang es la librería declarada y la única documentada por el autor. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Cuantización | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-CYBERSECURITY-NVFP4 | ~180B | no disponible | Sí (imagen, vídeo) | qwen-community-license-1.0 | NVFP4 | Sin rechazos; artefacto de red-team |
| Qwen/Qwen3.8-Flash-Next (base) | ~180B | no disponible | Sí (imagen, vídeo) | qwen-community-license-1.0 | Múltiples (incl. NVFP4) | Con salvaguardas; MMLU 82,11% en NVFP4 |
| Otros builds abliterated de Qwen | no disponible | no disponible | no disponible | variable | variable | No se dispone de comparativas verificadas en la información proporcionada |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría (modelos abliterated de escala similar) en la información proporcionada.

## Limitaciones y advertencias

- Modelo sin salvaguardas: cumple con peticiones dañinas, ilegales y poco éticas en más del 91% de los casos de HarmBench-320, incluyendo cibercrimen e intrusion y contenido químico/biológico. No debe desplegarse en entornos de producción orientados al público.
- Riesgo legal y de responsabilidad: el autor declara explícitamente que el usuario es el único responsable del contenido generado y del cumplimiento normativo. La licencia qwen-community-license-1.0 puede imponer restricciones adicionales al uso comercial; debe revisarse el archivo LICENSE.
- Degradación del conocimiento en áreas específicas: MMLU cae 0,84 pp globalmente, con retrocesos severos en machine_learning (-22,5 pp), moral_scenarios (-17,5 pp) y moral_disputes (-12,5 pp), lo que sugiere sesgos en el razonamiento ético y técnico tras la modificación.
- Riesgo de alucinación: no cuantificado en la información disponible; la modificación de pesos puede alterar la calibración en dominios no evaluados.
- Idiomas: no hay lista oficial de idiomas soportados; la evaluación solo documenta inglés y chino de forma incidental.
- Contexto: la longitud de contexto del base no se especifica en la información disponible, lo que impide planificar despliegues con ventanas largas.
- Inconsistencia en metadatos: el tag "8-bit" en HuggingFace contradice el nombre y la descripción NVFP4 de 4 bits; conviene verificar la precisión real de los pesos antes de desplegar.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de los resultados reportados por el autor.

## Enlaces

- HuggingFace: https://huggingface.co/chenrenya/Qwen3.8-Flash-Next-CYBERSECURITY-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Perfil del autor en HuggingFace: https://huggingface.co/dealignai
- Twitter del autor: https://twitter.com/dealignai
- Licencia: LICENSE (incluida en el repositorio de HuggingFace)
