# boods/FrMedQA-CrossLingual-NoPPL-MCQA

## Resumen

FrMedQA-CrossLingual-NoPPL-MCQA es un ajuste fino publicado por el usuario boods en HuggingFace. Se trata de un derivado de Qwen3-14B, partiendo concretamente del checkpoint cuantizado `unsloth/Qwen3-14B-unsloth-bnb-4bit` y entrenado con la librería Unsloth, que según la model card permite un entrenamiento "2x más rápido". El repositorio se publicó el 19 de septiembre de 2026 y no acumula descargas ni valoraciones en el momento de redactar esta ficha.

La model card es el template por defecto de Unsloth y no documenta ni el conjunto de datos, ni la tarea, ni el procedimiento de entrenamiento (hiperparámetros, número de pasos, método de ajuste). El nombre del repositorio sugiere un ajuste orientado a preguntas de opción múltiple (MCQA) de ámbito médico y naturaleza translingüe, y el sufijo "NoPPL" apunta a que no se ha calculado perplejidad, pero ninguna de estas inferencias está confirmada por el autor.

El interés del modelo es limitado pero claro: sirve como ejemplo de ajuste de Qwen3-14B con Unsloth bajo licencia Apache 2.0, y como posible base para experimentos de evaluación médica multilingüe. Su relevancia práctica es reducida al no existir documentación de resultados, datos de entrenamiento ni evaluación publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso de la familia Qwen3, con atención por consultas agrupadas (GQA), RoPE, RMSNorm y QK-Norm; modo dual thinking / non-thinking en el modelo base |
| Parametros totales | 14,8 mil millones (heredados de Qwen3-14B); 13,2 mil millones sin contar embeddings |
| Parametros activos | No aplica: el modelo base es denso, no MoE |
| Longitud de contexto | 32.768 tokens nativo; ampliable a 131.072 con escalado YaRN (dato del modelo base, no confirmado para el ajuste) |
| Tipos de cuantizacion | El repositorio parte del checkpoint bnb-4bit de Unsloth. El modelo base admite GPTQ, AWQ, bitsandbytes de 4 y 8 bits, y GGUF (Q4_K_M, Q5_K_M, Q8_0) |
| Idiomas soportados | Declarado: en (inglés). El modelo base Qwen3 cubre 119 idiomas, pero la model card solo declara inglés para este ajuste |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Nota: el tamano del repositorio es de 1,0 GB, muy inferior a los aproximadamente 9 GB que ocuparía un modelo de 14.800 millones de parametros en 4 bits. Esto sugiere que el repositorio podría contener únicamente los pesos de un adaptador (LoRA) y no el modelo completo, extremo que no se puede confirmar con la información disponible.

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-14B, un transformer decoder denso con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención por consultas agrupadas que reduce el número de cabezas de clave/valor frente a las de consulta. El modelo base incorpora un mecanismo de razonamiento en dos modos: un modo "thinking" con cadena de razonamiento explícita y un modo "non-thinking" de respuesta directa. Los detalles exactos de profundidad, dimensionalidad y número de cabezas corresponden al modelo base y no se reproducen en este repositorio.

No hay información sobre el entrenamiento del ajuste: se desconoce el número de tokens utilizados, la composición del dataset, si se empleó Supervised Fine-Tuning, DPO, RLHF u otra técnica, y cuáles fueron los hiperparámetros. Lo único documentado es el uso de Unsloth sobre un checkpoint base cuantizado en 4 bits, lo que es habitual en flujos de ajuste eficiente en memoria (QLoRA). No se describe ninguna innovación técnica propia de este repositorio.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen3-14B.
- Razonamiento en dos modos (thinking y non-thinking) en el modelo base; no se confirma que el ajuste conserve esta funcionalidad.
- Según el nombre del repositorio, posible especialización en preguntas de opción múltiple (MCQA) de dominio médico, sin confirmación por parte del autor.
- Posible orientación translingüe ("CrossLingual" en el nombre), no documentada y contradicha parcialmente por el campo de idioma, que solo declara inglés.
- Soporte de tool calling y function calling: heredado del modelo base, pero no verificado en el ajuste.
- Capacidades de agente y razonamiento multi-paso: heredadas del modelo base, sin validación documentada.
- Capacidades multilingües: no declaradas para este ajuste.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Evaluación comparativa de conocimiento médico mediante preguntas de opción múltiple: si el ajuste cumple lo que sugiere su nombre, podría emplearse como generador de respuestas en conjuntos tipo MedQA o FrMedQA para comparar el efecto del ajuste fino frente al Qwen3-14B original.
- Investigación en ajuste eficiente con Unsloth: el repositorio sirve como caso práctico de ajuste de un modelo de 14.000 millones de parametros partiendo de un checkpoint en 4 bits, útil para estudiar consumo de memoria y tiempos de entrenamiento.
- Construcción de pipelines de evaluación de LLM en dominio clínico: el modelo puede integrarse como candidato en un banco de pruebas junto a otros modelos médicos y medir tasa de acierto, calibración y sesgo.
- Pre-anotación de corpus médicos: uso como generador de borradores de respuesta para que un experto humano los revise, siempre con supervisión clínica y sin uso diagnóstico directo.
- Asistente de apoyo a estudiantes de medicina: resolución de preguntas tipo test con explicación, en un entorno de bajo riesgo y con advertencia explícita de que no sustituye la formación reglada.
- Experimentación en evaluación translingüe: si el ajuste es realmente cross-lingual, podría utilizarse para medir la transferencia de conocimiento médico entre inglés y francés, comparando el rendimiento en ambos idiomas.
- Despliegue de un servicio de generación de texto autoalojado: al derivar de Qwen3-14B, puede servirse con vLLM, TGI o llama.cpp en infraestructura propia bajo licencia Apache 2.0.

En ningún caso debe utilizarse para diagnóstico, prescripción o asesoramiento clínico directo a pacientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluación, ni métricas de precisión, ni comparaciones con otros modelos. Tampoco se han encontrado resultados en la búsqueda web realizada, que devolvió únicamente noticias de actualidad sin relación con el modelo.

## Requisitos de hardware

- VRAM estimada en precisión completa (FP16/BF16): en torno a 28-30 GB, más overhead para el contexto.
- VRAM estimada en 8 bits: aproximadamente 15-16 GB.
- VRAM estimada en 4 bits (GPTQ, AWQ o bitsandbytes): alrededor de 9-10 GB.
- VRAM estimada en GGUF: Q4_K_M ≈ 9 GB, Q5_K_M ≈ 10,5 GB, Q8_0 ≈ 15 GB.
- GPU recomendadas para FP16: A100 40 GB, H100 80 GB, L40S 48 GB, A6000 48 GB.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y RTX 4080 con cuantización de 4 u 8 bits; en tarjetas de 16 GB (RTX 4060 Ti 16 GB, RTX 4070 Ti Super) solo en 4 bits y con contextos moderados.
- Opciones de despliegue: vLLM, SGLang, Text Generation Inference (TGI), llama.cpp, Ollama y LM Studio.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas para este ajuste concreto.

Advertencia: si el repositorio contiene únicamente un adaptador LoRA, será necesario cargar primero el modelo base `unsloth/Qwen3-14B-unsloth-bnb-4bit` (o su equivalente en precisión completa) y aplicar el adaptador, lo que incrementa los requisitos de memoria respecto a lo indicado arriba.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| FrMedQA-CrossLingual-NoPPL-MCQA | 14,8 B (base Qwen3-14B) | 32.768 (131.072 con YaRN, segun base) | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen3-14B | 14,8 B | 32.768 (131.072 con YaRN) | Apache 2.0 | Modelo oficial, ampliamente utilizado |
| Qwen3-14B-unsloth-bnb-4bit | 14,8 B | 32.768 (131.072 con YaRN) | Apache 2.0 | HuggingFace, checkpoint base de este ajuste |
| BioMistral-7B | 7 B | 8.192 | Apache 2.0 | HuggingFace, dominio médico en ingles |
| Meditron-7B | 7 B | 4.096 | Llama 2 (uso comercial restringido) | HuggingFace, dominio médico |

La comparación con los modelos médicos es orientativa: no existe ningún dato de rendimiento de FrMedQA-CrossLingual-NoPPL-MCQA que permita establecer una comparación cuantitativa. Las cifras de contexto y licencia de las alternativas proceden de su documentación pública.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es el template por defecto de Unsloth y no describe dataset, tarea, hiperparámetros ni evaluación.
- Rendimiento no verificado: no hay ningún benchmark ni métrica publicada, por lo que no se puede afirmar que el ajuste mejore o empeore al modelo base.
- Riesgo elevado de alucinación en dominio médico, inherente a los modelos de lenguaje de este tamano, agravado por la falta de validación clínica.
- El campo de idioma declara únicamente inglés, pese a que el nombre del repositorio sugiere un componente translingüe; existe una contradicción no resuelta.
- Posible contenido sesgado o desactualizado en materia médica, derivado de los datos de preentrenamiento del modelo base.
- Contexto efectivo limitado a 32.768 tokens salvo que se aplique correctamente el escalado YaRN, algo que no está documentado para este ajuste específico.
- Incertidumbre sobre el contenido del repositorio: el tamano de 1,0 GB sugiere un adaptador y no un modelo completo, lo que afecta a la forma de desplegarlo.
- Licencia Apache 2.0: permite uso comercial, pero no exime de responsabilidad al desplegador por el uso que se haga del modelo en contextos sensibles.
- Prohibición de uso clínico: no debe emplearse para diagnóstico, tratamiento, triaje real de pacientes ni ninguna decisión con impacto en la salud sin validación profesional y regulatoria.
- Cero descargas y cero valoraciones: no hay evidencia de uso ni de revisión por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/boods/FrMedQA-CrossLingual-NoPPL-MCQA
- Modelo base: https://huggingface.co/unsloth/Qwen3-14B-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Familia Qwen3 (modelo base): https://huggingface.co/Qwen/Qwen3-14B
- Repositorio de TRL: https://github.com/huggingface/trl

Nota: la búsqueda web realizada no devolvió ningún resultado relacionado con el modelo, el autor ni la tarea. Los únicos resultados obtenidos fueron noticias de actualidad sin vinculación con este repositorio, por lo que no se incluyen.
