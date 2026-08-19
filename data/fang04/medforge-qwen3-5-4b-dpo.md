# fang04/medforge-qwen3.5-4b-dpo

## Resumen

MedForge Qwen3.5-4B-DPO es un modelo de lenguaje especializado en razonamiento médico, desarrollado por el investigador fang04 como resultado de un experimento de ablación post-entrenamiento sobre el modelo base Qwen/Qwen3.5-4B. El objetivo principal es mejorar la capacidad de razonamiento clínico sin degradar las habilidades nativas del modelo base, que ya incorpora un modo de pensamiento largo (thinking-native). El entrenamiento utiliza DPO (Direct Preference Optimization) con pares de preferencia construidos exclusivamente a partir de muestras autogeneradas por el propio modelo: se realizan múltiples muestreos de respuestas a preguntas médicas verificables, se etiquetan como correctas o incorrectas mediante un validador calibrado, y se emparejan para el ajuste fino. El modelo resultante tiene 4.539 millones de parámetros, licencia Apache 2.0 y soporta chino e inglés.

La relevancia de este modelo reside en su enfoque metodológico: demuestra que, para bases nativas de pensamiento, la destilación de cadenas de razonamiento externas puede degradar el rendimiento, mientras que el aprendizaje por preferencias autogeneradas preserva las capacidades originales. Aunque en esta iteración no se observan mejoras significativas frente al base, el trabajo aporta datos empíricos valiosos sobre los efectos de diferentes estrategias de post-entrenamiento en modelos médicos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-4B) |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada del base Qwen3.5-4B) |
| Tipos de cuantización | No especificados (safetensors en BF16/FP16; cuantizable a GPTQ, AWQ, GGUF) |
| Idiomas soportados | Chino (zh), Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, una arquitectura transformer densa con capacidades nativas de razonamiento largo (thinking mode). El post-entrenamiento se realiza mediante LoRA (Low-Rank Adaptation) aplicada a todas las capas, con rango r=64, alpha=128, learning rate de 5e-6 y una sola época. El dataset de preferencias se construye a partir de 3.000 preguntas médicas verificables del conjunto `FreedomIntelligence/medical-o1-verifiable-problem`. Para cada pregunta se realizan 6 muestreos con temperatura 1.0 y un máximo de 8.192 tokens de generación, obteniendo respuestas correctas e incorrectas que se emparejan como pares de preferencia. Un validador calibrado (concordancia del 96,5% frente a 200 casos revisados por humanos) determina la corrección de cada respuesta. El entrenamiento se ejecutó con el framework ms-swift en una GPU A800-80G.

Una innovación metodológica destacable es que el entrenamiento no utiliza ninguna cadena de razonamiento externa escrita por otros modelos (como GPT-4o o R1), sino que se basa exclusivamente en las propias muestras del modelo. Esto evita el "ruido" que introduce la imitación de estilos de razonamiento ajenos, que en los experimentos de ablación mostró degradar el rendimiento en tareas médicas.

## Capacidades

- Razonamiento médico: responde preguntas clínicas de opción múltiple y genera explicaciones razonadas sobre diagnósticos, tratamientos y fisiopatología.
- Generación de texto conversacional: mantiene diálogos multi-turno en chino e inglés, con formato de chat mediante `apply_chat_template`.
- Razonamiento de largo alcance: al heredar el modo thinking de Qwen3.5-4B, puede generar cadenas de pensamiento extensas (hasta 8.192 tokens) antes de emitir la respuesta final.
- Soporte de tool calling: no se menciona explícitamente en la documentación, pero al estar basado en Qwen3.5-4B, es probable que herede esta capacidad (no confirmado).
- Multilingüe: entrenado principalmente para chino e inglés, con foco en exámenes médicos en chino.

## Casos de uso

- Asistencia a profesionales sanitarios: el modelo puede ayudar a médicos y estudiantes a contrastar hipótesis diagnósticas a partir de presentaciones clínicas, generando razonamientos estructurados y listando posibles diagnósticos diferenciales.
- Educación médica: utilizado como tutor interactivo para estudiantes de medicina, explicando conceptos y resolviendo casos clínicos simulados en chino o inglés.
- Investigación clínica: apoyo en la revisión de literatura médica y generación de resúmenes de casos, siempre con supervisión humana.
- Desarrollo de chatbots médicos de bajo coste: al ser un modelo de 4B parámetros, puede desplegarse en hardware moderado para prototipos de asistentes virtuales en entornos clínicos controlados.
- Evaluación de estrategias de post-entrenamiento: sirve como referencia en experimentos de ablación para comparar DPO autogenerado frente a destilación de cadenas de razonamiento.
- Generación de contenido educativo: creación de preguntas de examen y material didáctico para facultades de medicina, con verificación posterior por expertos.

## Benchmarks y rendimiento

La model card del autor presenta resultados de evaluación en tres conjuntos médicos, comparando el modelo con el base y con variantes SFT. Se trata de muestras fijas (no de la evaluación completa), por lo que los valores son orientativos.

| Modelo | CMExam (n=2000) | CMB-val (n=280) | MedXpertQA (n=1000) |
|---|---|---|---|
| Qwen3.5-4B (base) | 70,8% | 59,6% | 25,1% |
| + SFT (destilación GPT-4o 2024) | 59,3% (−11,5) | 47,5% (−12,1) | 13,6% (−11,5) |
| + SFT (destilación R1 2025) | 67,5% (−3,3) | 53,9% (−5,7) | 13,6% (−11,5) |
| **+ DPO autogenerado (este modelo)** | 70,7% (−0,1) | 56,1% (−3,5) | 24,4% (−0,7) |

El modelo no muestra una mejora significativa sobre el base (las diferencias caen dentro del intervalo de confianza del 95%), pero tampoco lo degrada, a diferencia de las variantes SFT. El autor reporta que el 20,7% de las respuestas en CMExam cambiaron (206 corregidas, 207 empeoradas), lo que sugiere que el entrenamiento sí tuvo efecto pero los beneficios y pérdidas se compensaron.

## Requisitos de hardware

- Inferencia en FP16/BF16: requiere aproximadamente 9 GB de VRAM (el repositorio ocupa 9,1 GB en safetensors). Cabe en GPUs de 12 GB como RTX 3060, RTX 4070, o en GPUs de 16 GB como RTX 4080/4090.
- Con cuantización a 8 bits (GPTQ o AWQ): ~4,5 GB de VRAM, compatible con GPUs de 6-8 GB como RTX 2060, RTX 3060.
- Con cuantización a 4 bits: ~2,5 GB de VRAM, puede ejecutarse en GPUs con 4 GB o incluso en CPU con suficiente RAM.
- El entrenamiento se realizó en una A800-80G, pero para inferencia no se requiere tanta capacidad.
- Opciones de despliegue: vLLM (compatible con el comando `vllm serve`), Hugging Face Transformers, llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta).
- Latencia y throughput: no se proporcionan datos específicos; en una GPU moderna se espera una velocidad de decodificación típica para un modelo de 4B (aproximadamente 20-40 tokens/s en una RTX 4090 con cuantización 4-bit, dependiendo de la implementación).

## Comparativa con modelos similares

No se dispone de comparativas externas con otros modelos médicos de tamaño similar (por ejemplo, BioMistral-7B, Meditron-7B, Llama-3-8B-Instruct fine-tuned). La información disponible solo compara con el propio base y con variantes SFT internas. En la categoría de modelos médicos de ~4B parámetros, no hay referencias claras en la documentación. Se recomienda al lector consultar benchmarks independientes como Open Medical LLM Leaderboard para situar el modelo.

## Limitaciones y advertencias

- El modelo no constituye consejo médico ni debe utilizarse para diagnóstico o prescripción automática, según la normativa china y la advertencia del propio autor.
- Las evaluaciones se realizaron sobre muestras fijas y con un único seed de entrenamiento, por lo que los resultados pueden no ser generalizables.
- El validador de respuestas se calibró con "etiquetado proxy" de un modelo fuerte y revisión humana parcial, no con validación puramente humana.
- Los datos de entrenamiento son mixtos chino-inglés, pero la evaluación se centra en exámenes en chino; el rendimiento en inglés puede ser inferior.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información médica falsa o inexacta; debe usarse siempre con supervisión experta.
- No se han publicado resultados en benchmarks generales (MMLU, HumanEval, etc.), por lo que su rendimiento fuera del dominio médico es desconocido.
- La licencia Apache 2.0 permite uso comercial, pero el autor recomienda precaución en aplicaciones clínicas reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fang04/medforge-qwen3.5-4b-dpo
- Repositorio de código y experimentos: https://github.com/yiongq/medforge
- Informe de experimento de ablación (en chino): https://github.com/yiongq/medforge/blob/main/reports/w2-post-training-ablation.md
- Dataset de preguntas médicas verificables: https://huggingface.co/datasets/FreedomIntelligence/medical-o1-verifiable-problem
