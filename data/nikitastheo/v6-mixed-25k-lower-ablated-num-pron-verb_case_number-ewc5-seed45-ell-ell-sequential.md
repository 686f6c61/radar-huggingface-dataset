# nikitastheo/v6-mixed-25k-lower-ablated-num-pron-verb_case_number-ewc5-seed45-ell-ell-sequential

## Resumen

Este modelo es un checkpoint de lenguaje causal de tipo GPT-2 entrenado desde cero por el usuario nikitastheo, aparentemente en el contexto de experimentos de adquisición temprana del lenguaje (BabyLM). El identificador del repositorio sugiere una ablación sobre categorías gramaticales (numerales, pronombres y verbos, con rasgos de caso y número), un entrenamiento por fases con regularización EWC (Elastic Weight Consolidation) y una secuencia de dos fases con el idioma griego ("ell-ell-sequential"). No es un modelo de propósito general ni un lanzamiento de una organización: es un artefacto de investigación con 104,7 millones de parámetros y una configuración base de GPT-2.

El modelo se distribuye en formato safetensors bajo la librería transformers, con pipeline de generación de texto y compatibilidad declarada con text-generation-inference. El repositorio ocupa 0,4 GB y no registra descargas ni interacciones en el momento de la consulta. La model card es extremadamente escueta: solo documenta hiperparámetros de entrenamiento, sin describir arquitectura, datos, evaluación ni licencia.

Su relevancia es por tanto acotada y de carácter experimental: sirve como referencia reproducible para estudiar cómo afectan las ablaciones lingüísticas controladas y el entrenamiento curricular al comportamiento de un modelo pequeño. No debe confundirse con un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo GPT-2 (según tags y config base `gpt_base_config.json`) |
| Parámetros totales | 104.716.800 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con cuantización estándar de transformers, sin confirmar) |
| Idiomas soportados | no disponible (el identificador sugiere griego, "ell", pero no se confirma) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de estilo GPT-2, definido por `configurations/gpt_base_config.json` y con 104,7 millones de parámetros totales. El tokenizador es propio del autor (`nikitastheo/babylm-25k-ell-lower-seed45-ablated-num-pron-verb_case_number-tokenizer`), lo que indica un vocabulario construido específicamente para el experimento, probablemente con 25.000 entradas y en minúsculas ("lower"). El nombre "ablated-num-pron-verb_case_number" apunta a una ablación de rasgos morfosintácticos concretos (numerales, pronombres, verbos, caso y número) en los datos o en las etiquetas de entrenamiento.

El entrenamiento se realizó con `train_clm.py`, un script propio basado en Hugging Face Accelerate sin `Trainer`, durante 17.110 pasos con learning rate 1e-4, scheduler lineal, 1.711 pasos de warmup y batch size efectivo de 32. El campo "language switch epoch: 10" y el sufijo "ell-ell-sequential" indican un currículo por fases en el que el idioma de entrenamiento cambia en la época 10, presumiblemente hacia griego. El sufijo "ewc5" sugiere regularización EWC con un coeficiente asociado para mitigar el olvido catastrófico entre fases. No se documentan el volumen de tokens, la composición del corpus ni si hubo RLHF o DPO; por el contexto BabyLM, es probable que sea preentrenamiento puro, pero esto no está confirmado.

## Capacidades

- Generación de texto causal autoregresiva, limitada al dominio y vocabulario del corpus de entrenamiento.
- Modelado de lenguaje a nivel de token con un tokenizador específico del experimento; no es compatible con tokenizadores estándar de GPT-2 sin reentrenamiento o ajuste.
- Posible comportamiento multilingüe limitado (inglés y griego) derivado del currículo por fases, sin confirmación documental.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, visión, audio ni otras modalidades.
- No se documentan capacidades de código ni matemáticas.

## Casos de uso

- Investigación en adquisición del lenguaje: reproducir el experimento de ablación de numerales, pronombres y verbos para medir el impacto de eliminar esas categorías en el aprendizaje de un modelo pequeño.
- Estudio de olvido catastrófico: utilizar el checkpoint como referencia para evaluar la eficacia de EWC en un currículo de dos fases con cambio de idioma en la época 10.
- Análisis de tokenizadores de dominio restringido: comparar el tokenizador de 25.000 entradas en minúsculas con tokenizadores estándar en tareas de segmentación morfológica.
- Baseline en experimentos BabyLM: servir como punto de comparación de parámetros y configuración frente a otros modelos entrenados con presupuestos de datos similares.
- Pruebas de infraestructura de inferencia: validar pipelines de transformers y text-generation-inference con un modelo pequeño de 104,7 M de parámetros y pesos safetensors.
- Docencia y divulgación: ilustrar el ciclo completo de entrenamiento causal con Accelerate, sin `Trainer`, en un caso reproducible de bajo coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,42 GB solo para pesos (104,7 M × 4 bytes), más activaciones y caché KV.
- VRAM estimada en fp16/bf16: aproximadamente 0,21 GB para pesos.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,10 GB para pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 e incluso en CPU para inferencia por lotes pequeños.
- Despliegue: transformers (nativo), text-generation-inference (declarado compatible por los tags), y previsiblemente llama.cpp u Ollama tras conversión a GGUF, aunque no se documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nikitastheo/v6-mixed-25k-lower-ablated-num-pron-verb_case_number-ewc5-seed45-ell-ell-sequential | 104,7 M | no disponible | no disponible | Hugging Face, 0 descargas |
| GPT-2 small (OpenAI) | 124 M | 1.024 tokens | MIT | Ampliamente disponible |
| DistilGPT-2 (Hugging Face) | 82 M | 1.024 tokens | Apache 2.0 | Ampliamente disponible |
| Modelos BabyLM de referencia | ~100 M (variable) | variable | variable | Repositorios académicos |

La comparación con GPT-2 small y DistilGPT-2 es meramente estructural: el modelo de nikitastheo no documenta rendimiento ni licencia, por lo que no es posible establecer una comparación funcional rigurosa.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede asumir permiso para uso comercial ni para redistribución.
- La model card no documenta datos de entrenamiento, composición del corpus ni evaluación, lo que impide auditar sesgos y calidad.
- Riesgo elevado de alucinación y de generar texto incoherente fuera del dominio del corpus de entrenamiento, dado el tamaño reducido y el posible entrenamiento con datos limitados tipo BabyLM.
- El tokenizador es específico del experimento; usar el modelo con tokenizadores estándar producirá resultados inválidos.
- El currículo por fases con cambio de idioma en la época 10 puede degradar el rendimiento en el idioma de la primera fase por olvido catastrófico, aunque se haya aplicado EWC.
- No hay evidencia de instrucción, alineamiento (RLHF/DPO) ni seguridad; no debe desplegarse en aplicaciones de cara al usuario sin filtros adicionales.
- Cero descargas y cero interacciones: no existe validación comunitaria de su funcionamiento.
- El identificador del repositorio y las fechas (creado en 2026) deben tratarse con cautela; conviene verificar la integridad de los pesos antes de cualquier uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nikitastheo/v6-mixed-25k-lower-ablated-num-pron-verb_case_number-ewc5-seed45-ell-ell-sequential
- Tokenizador asociado: https://huggingface.co/nikitastheo/babylm-25k-ell-lower-seed45-ablated-num-pron-verb_case_number-tokenizer
- Perfil del autor: https://huggingface.co/nikitastheo
- Hugging Face Accelerate: https://huggingface.co/docs/accelerate
- Proyecto BabyLM: https://babylm.github.io/
