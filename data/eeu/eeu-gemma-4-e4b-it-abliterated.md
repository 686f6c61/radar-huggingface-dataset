# EEU/EEU-gemma-4-E4B-it-abliterated

## Resumen

EEU-gemma-4-E4B-it-abliterated es una versión "abliterated" (con los mecanismos de rechazo suprimidos mediante proyección de pesos) del modelo google/gemma-4-E4B-it, publicada por Yeraldo's LLM ORG (EEU) en formato GGUF para inferencia local con llama.cpp y Ollama. El modelo base es un transformer denso de 8.000 millones de parámetros totales distribuidos en 42 capas de decodificador; el repositorio safetensors reporta 7.518.069.290 parámetros. La intervención se aplicó sobre 84 tensores concretos (`self_attn.o_proj.weight` y `mlp.down_proj.weight` en las capas 0 a 41), dejando intactos los pesos del encoder de visión, el encoder de audio y las proyecciones KV compartidas.

El interés técnico de esta release reside en su metodología: en lugar de la abliteración clásica de una sola capa, el autor extrae direcciones de rechazo independientes por capa, las ortogonaliza contra la media de activaciones "harmless" y aplica una proyección de pesos que preserva la norma (`scale = 1.2`). El objetivo declarado es evitar que el bucle de política de seguridad se reactive dentro del modo de razonamiento (Thinking Process) de Gemma 4, un fallo típico de las abliteraciones ingenuas en arquitecturas con direcciones residuales que rotan entre capas.

La release se distribuye en dos cuantizaciones (Q5_K_M y Q4_K_M), está pensada para ejecutarse en hardware de consumo —el autor reporta haberla construido en un MacBook Air de 16 GB— y se publica bajo licencia Apache 2.0. Está orientada explícitamente a investigación, estudios de interpretabilidad y red-teaming de alineación, no a despliegue en producción sin salvaguardas adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de decodificador, 42 capas (Gemma 4) |
| Parametros totales | 7.518.069.290 (safetensors); el autor indica 8.0B en la model card |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (5.34 GB), Q5_K_M (5.76 GB); Q8_0 mencionada como posible futura |
| Idiomas soportados | en, zh, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); repo de 11.1 GB |

## Arquitectura y entrenamiento

El modelo base google/gemma-4-E4B-it es un transformer de decodificador con 42 capas y aproximadamente 8.000 millones de parámetros totales. La model card menciona explícitamente componentes multimodales en el modelo original (encoder de visión y encoder de audio), aunque esta release GGUF empaqueta únicamente el backbone de texto: los pesos `mmproj` de visión y audio no están incluidos en el repositorio. También se mencionan proyecciones KV compartidas, lo que sugiere alguna forma de compartición de claves/valores entre capas o cabezas, aunque no se detalla su configuración exacta.

El proceso de abliteración descrito por el autor consta de cuatro pasos: (1) extracción independiente de activaciones residuales post-capa en las 42 capas; (2) uso de pares de prompts contrastivos (`mlabonne/harmful_behaviors` frente a `mlabonne/harmless_alpaca`, 96 muestras cada uno, `seed=42`) formateados con `enable_thinking=True` para alinear la extracción con el límite de decisión `<|turn>model\n`; (3) ortogonalización de la dirección de rechazo de cada capa contra la media de activaciones harmless, seguida de proyección de pesos con preservación de norma (`scale = 1.2`); y (4) filtrado de tensores limitado a 84 tensores de atención y MLP. No se documentan datos sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, si hubo RLHF o DPO), por lo que esos datos deben consultarse en la model card de google/gemma-4-E4B-it.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte de plantilla de chat (`<|turn>`).
- Modo de razonamiento explícito (Thinking Process) heredado de Gemma 4, con `enable_thinking=True`.
- Razonamiento lógico y desglose técnico estructurado, según los ejemplos de la model card.
- Capacidades multilingües: inglés, chino y otros idiomas (etiqueta `multilingual`).
- Supresión de los mecanismos de rechazo estándar, incluyendo dentro del bucle de razonamiento.
- Compatibilidad con endpoints OpenAI (`endpoints_compatible`) mediante `llama-server`.
- Integración con Ollama, llama.cpp (`llama-cli`, `llama-server`) y LM Studio.
- Capacidades de visión y audio del modelo base no disponibles en esta release (pesos `mmproj` no incluidos).

## Casos de uso

- Red-teaming de alineación: el modelo sirve para estudiar cómo se comporta un sistema con los rechazos suprimidos y evaluar la robustez de los guardrails de un pipeline, comparando respuestas antes y después de la abliteración sobre las mismas prompts.
- Investigación en interpretabilidad: las direcciones de rechazo extraídas por capa y la receta de proyección permiten replicar el experimento y analizar cómo se distribuye la "dirección de negativa" a lo largo de las 42 capas del transformer.
- Evaluación de robustez frente a cuantización: al ofrecerse Q4_K_M y Q5_K_M, permite medir la degradación de coherencia y la persistencia de la abliteración bajo cuantización de 4 y 5 bits.
- Experimentación local en hardware de consumo: con 5.34 GB (Q4_K_M) y unos 8 GB de RAM recomendados, se puede ejecutar en portátiles y mini-PC sin GPU dedicada, lo que facilita pruebas offline y reproducibles.
- Generación de texto sin restricciones temáticas en entornos controlados: útil para estudiar sesgos y comportamientos límite en tareas de escritura creativa o análisis de contenido sensible, siempre con revisión humana posterior.
- Desarrollo y prueba de plantillas de chat y modo thinking: el modelo permite validar la integración de la plantilla `<|turn>` y el flujo de razonamiento en aplicaciones propias construidas sobre llama.cpp u Ollama antes de migrar al modelo base.
- Docencia y demostraciones sobre alineación: sirve para ilustrar en un aula o taller cómo funcionan las técnicas de abliteración y qué efectos tienen sobre el comportamiento de un LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta un throughput aproximado de 29 tokens por segundo con la cuantización Q4_K_M en Apple Silicon.

## Requisitos de hardware

- VRAM/RAM estimada: Q4_K_M requiere unos 8 GB o más de RAM (5.34 GB de pesos); Q5_K_M también parte de 8 GB o más (5.76 GB de pesos).
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, cualquier GPU con 8 GB o más de VRAM (RTX 3060 Ti, RTX 4060 Ti, RTX 4070) puede alojar ambas cuantizaciones en memoria.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM; también en CPU y en Apple Silicon (el autor la construyó y probó en un MacBook Air de 16 GB).
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (`ollama run hf.co/EEU/EEU-gemma-4-E4B-it-abliterated:Q5_K_M`), LM Studio. No se documenta soporte para vLLM o TGI en formato GGUF.
- Latencia y throughput: aproximadamente 29 tok/s con Q4_K_M en Apple Silicon, según el autor. No hay datos para Q5_K_M ni para GPU dedicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| EEU-gemma-4-E4B-it-abliterated | 7.518.069.290 (8.0B segun autor) | no disponible | GGUF (Q4_K_M, Q5_K_M) | Apache 2.0 | Abliterado, solo texto, pensado para hardware de consumo |
| google/gemma-4-E4B-it (base) | 8.0B | no disponible | safetensors y otros | Gemma (terminos propios) | Modelo original con rechazos intactos y capacidades multimodales |
| Otras releases abliterated de la familia Gemma | no disponible | no disponible | GGUF | variable | No se dispone de datos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- Los mecanismos de rechazo han sido suprimidos o debilitados deliberadamente; el modelo puede generar contenido dañino, ilegal o inseguro sin filtros. El uso previsto es exclusivamente investigación, interpretabilidad y red-teaming.
- Solo se incluyen los pesos de texto: no hay soporte de visión ni audio en esta release, aunque el modelo base los tenga.
- Las cuantizaciones Q4_K_M y Q5_K_M degradan la precisión; el autor recomienda cuantizaciones superiores (Q8_0, BF16) para tareas de código o casos límite.
- No se documenta la longitud de contexto soportada en esta release; debe verificarse contra la del modelo base antes de usarla en producción.
- Riesgo de alucinación inherente al modelo base, no mitigado por la abliteración.
- Sesgos del modelo base (inglés y chino como idiomas principales de entrenamiento) que persisten tras la intervención.
- La licencia del repositorio es Apache 2.0, pero los términos del modelo base de Google (Gemma) pueden imponer condiciones adicionales al uso derivado; conviene revisarlos antes de un uso comercial.
- El autor declara que los usuarios asumen toda la responsabilidad sobre las salidas, los guardrails posteriores y el cumplimiento legal.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: no hay evidencia de comunidad ni validación externa de la calidad de la abliteración.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/EEU/EEU-gemma-4-E4B-it-abliterated
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Dataset de prompts dañinos: `mlabonne/harmful_behaviors` (Hugging Face)
- Dataset de prompts benignos: `mlabonne/harmless_alpaca` (Hugging Face)
