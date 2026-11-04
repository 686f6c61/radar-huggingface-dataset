# mradermacher/MetaphorStar-3B-GGUF

## Resumen

MetaphorStar-3B-GGUF es la versión cuantizada en formato GGUF del modelo MING-ZCH/MetaphorStar-3B, un modelo vision-language de 3.397.103.616 parámetros (aproximadamente 3,4 mil millones) orientado a la comprensión de metáforas y el razonamiento visual. Lo publica mradermacher, un conocido generador de cuantizaciones GGUF para la comunidad de inferencia local, a partir de los pesos originales del modelo base. Su relevancia radica en que traslada un modelo especializado en una tarea semántica difícil (interpretar lenguaje figurado a partir de imágenes) a formatos que pueden ejecutarse en hardware de consumo mediante llama.cpp y derivados.

El modelo base se entrenó con técnicas de aprendizaje por refuerzo (GRPO), según las etiquetas de la model card, lo que sugiere un ajuste específico para mejorar el razonamiento visual y la interpretación metafórica más allá del entrenamiento supervisado convencional. La cuantización mantiene la arquitectura multimodal original: un componente de proyección multimodal (mmproj) acompaña a los pesos del modelo de lenguaje, lo que permite procesar entradas de imagen junto con texto.

La licencia Apache 2.0 facilita el uso comercial y la modificación, y el reducido tamaño del modelo lo hace atractivo para escenarios de despliegue en el borde o en estaciones de trabajo sin GPU de datacenter. No obstante, la información pública disponible sobre el modelo base es limitada: no se detallan la longitud de contexto, la composición del dataset ni resultados de benchmarks en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model (transformer multimodal con proyector mmproj); detalles internos no disponibles |
| Parametros totales | 3.397.103.616 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible indica que MetaphorStar-3B es un modelo vision-language (VLM) con un proyector multimodal separado (mmproj), lo que confirma una arquitectura típica de dos componentes: un codificador visual y un modelo de lenguaje que recibe las representaciones visuales proyectadas. El modelo base emplea aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization), una variante de optimización de política usada para afinar el razonamiento, según las etiquetas de la model card. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni la existencia de fases de RLHF o DPO adicionales.

La innovación destacable es la especialización en comprensión de metáforas y razonamiento visual, una tarea que combina interpretación semántica abstracta con grounding visual. El proceso de cuantización de mradermacher genera variantes estáticas (no imatrix) en este repositorio; las versiones ponderadas con imatrix están en un repositorio separado (MetaphorStar-3B-i1-GGUF). No se documentan técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés.
- Comprensión de imágenes y razonamiento visual (vision-language).
- Interpretación de metáforas y lenguaje figurado a partir de contexto visual y textual.
- Razonamiento de múltiples pasos orientado a tareas visuales y semánticas.
- Procesamiento multimodal: entrada conjunta de imagen y texto mediante el proyector mmproj.
- No se documenta soporte explícito de tool calling o function calling.
- No se documenta soporte de agentes autónomos.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Análisis de contenido creativo y publicitario: el modelo puede interpretar imágenes acompañadas de eslóganes o textos figurados y evaluar si la metáfora visual funciona, gracias a su entrenamiento específico en comprensión metafórica.
- Educación y apoyo al aprendizaje de idiomas: permite explicar expresiones figuradas a partir de ilustraciones, útil en herramientas de enseñanza de inglés como segunda lengua.
- Moderación de contenido semántico: detección de usos figurados o ambiguos en publicaciones con imagen y texto, donde un filtro literal fallaría.
- Investigación en lingüística computacional: banco de pruebas para estudiar cómo los VLM pequeños manejan la pragmática y el lenguaje no literal, con la ventaja de ejecutarse en hardware modesto.
- Accesibilidad: descripción enriquecida de imágenes que incluya interpretación del tono o la intención figurada, no solo la descripción literal.
- Prototipado en el borde: al caber en cuantizaciones de 1,5 a 3,7 GB, puede desplegarse en portátiles o dispositivos con GPU de consumo para demos de razonamiento visual sin infraestructura cloud.
- Análisis de memes y contenido viral: interpretación de la relación entre imagen y texto en piezas humorísticas o irónicas, un caso donde la metáfora y el contexto visual son centrales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del modelo de lenguaje): aproximadamente 1,5 GB en Q2_K, 2,1-2,2 GB en Q4_K_S/Q4_K_M, 2,9 GB en Q6_K y 3,7 GB en Q8_0.
- El proyector multimodal añade 0,9 GB (mmproj-Q8_0) o 1,4 GB (mmproj-f16), que debe sumarse a la VRAM total.
- Configuración recomendada para uso práctico: Q4_K_M (2,2 GB) más mmproj-Q8_0 (0,9 GB), alrededor de 3,1 GB de pesos, más overhead de contexto y activaciones.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 8 GB, RTX 4070, RTX 4090, e incluso en GPUs de 6-8 GB con cuantizaciones bajas.
- También puede ejecutarse en CPU mediante llama.cpp, aunque la latencia será mayor, especialmente en el procesamiento de imágenes.
- Opciones de despliegue: llama.cpp, Ollama (previa conversión o importación del GGUF), y servidores compatibles con GGUF; para el modelo base en safetensors, transformers con aceleración por GPU.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MetaphorStar-3B-GGUF | 3,4 B | No disponible | Apache 2.0 | GGUF | Especializado en metáforas y razonamiento visual; solo inglés |
| Modelos VLM de ~3B de la familia Qwen2.5-VL | ~3 B | No disponible en esta ficha | Apache 2.0 (variantes) | Safetensors, GGUF | Uso general multimodal; no especializado en metáforas |
| Modelos VLM de ~2-4B tipo SmolVLM | ~2-4 B | No disponible en esta ficha | Apache 2.0 (variantes) | Safetensors, GGUF | Enfoque en eficiencia y despliegue en el borde; capacidades generales |

No se dispone de datos de rendimiento comparativo verificable en la información proporcionada; la comparación se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- Solo soporta inglés; no se documentan capacidades multilingües.
- No se dispone de información sobre la longitud de contexto, lo que impide garantizar conversaciones o documentos largos.
- Riesgo de alucinación inherente a los modelos de lenguaje pequeños, potencialmente mayor en interpretaciones abstractas o ambiguas.
- La especialización en metáforas puede producir sesgos hacia interpretaciones figuradas incluso cuando el texto es literal.
- No se documentan evaluaciones de sesgo; se desconoce el comportamiento en dominios sensibles.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y sus datos de entrenamiento no están documentados en detalle, lo que limita la auditabilidad.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad en tareas de razonamiento visual; se recomienda Q4_K_M o superior.
- El repositorio GGUF incluye solo cuantizaciones estáticas; para mayor calidad puede consultarse el repositorio i1 con cuantizaciones imatrix.
- El tamaño del repositorio (32,8 GB) incluye todas las variantes; descargar solo los archivos necesarios.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/MetaphorStar-3B-GGUF
- Modelo base: https://huggingface.co/MING-ZCH/MetaphorStar-3B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/MetaphorStar-3B-i1-GGUF
- Página de resumen del autor: https://hf.tst.eu/model#MetaphorStar-3B-GGUF
- Paper (arXiv): https://arxiv.org/abs/2602.10575
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
