# mradermacher/Prashna-7b-i1-GGUF

## Resumen

Prashna-7b-i1-GGUF es una colección de cuantizaciones en formato GGUF del modelo rachitgoyell/Prashna-7b, publicada por el cuantizador mradermacher, conocido por su amplia producción de versiones imatrix (importance matrix) de modelos populares. El modelo base, Prashna-7b, es un modelo conversacional de 7,6 mil millones de parámetros basado en la arquitectura Qwen2, orientado al ámbito educativo: tutoría, pedagogía socrática y conversación didáctica en inglés.

La relevancia de esta ficha no está tanto en el modelo base en sí, sino en la disponibilidad inmediata de más de veinte variantes de cuantización que permiten ejecutarlo desde hardware muy modesto (desde unos 2 GB de memoria) hasta configuraciones de máxima fidelidad (6,4 GB en Q6_K). Esto lo hace accesible para desarrolladores que quieren experimentar con un modelo especializado en tutoría sin necesidad de GPUs de gama alta.

Cabe destacar que la model card del modelo base no incluye detalles sobre el proceso de entrenamiento, benchmarks ni capacidades específicas más allá de las etiquetas (education, tutoring, socratic, pedagogy, conversational), por lo que varios campos de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder) |
| Parametros totales | 7.615.616.512 (~7,6 B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas imatrix) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones imatrix); el modelo base usa safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder de la familia Qwen2 con aproximadamente 7,6 mil millones de parámetros. La versión aquí descrita no es un reentrenamiento: es una cuantización post-entrenamiento realizada por mradermacher usando la técnica de importance matrix (imatrix), que calcula la importancia de cada peso sobre un conjunto de calibración para reducir la pérdida de calidad en cuantizaciones agresivas (especialmente en los rangos IQ1-IQ3).

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni sobre el uso de técnicas como SFT, RLHF o DPO en el modelo base rachitgoyell/Prashna-7b. Las etiquetas sugieren un fine-tuning orientado a pedagogía socrática (guiar al estudiante mediante preguntas en lugar de dar respuestas directas), pero los detalles técnicos no están disponibles.

## Capacidades

- Generación de texto conversacional en inglés con enfoque educativo y de tutoría.
- Pedagogía socrática: según las etiquetas del modelo, está orientado a guiar el aprendizaje mediante preguntas en lugar de respuestas directas.
- Al estar basado en Qwen2, hereda presumiblemente capacidades generales de razonamiento y generación del modelo base de Qwen (no verificado en la documentación disponible).
- No hay información sobre soporte de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento extendido.
- No hay información sobre capacidades multilingües; el idioma declarado es únicamente el inglés.

## Casos de uso

- Tutor virtual interactivo: el modelo puede acompañar a un estudiante en sesiones de estudio en inglés, planteando preguntas guiadas (método socrático) en lugar de resolver los ejercicios directamente, lo que fomenta el razonamiento propio.
- Plataformas de aprendizaje adaptativo: integrado en una aplicación educativa vía llama.cpp u Ollama, puede servir como tutor conversacional local, sin enviar datos de menores a servicios externos, algo relevante en entornos escolares con requisitos de privacidad.
- Asistente de repaso para autoaprendizaje: un desarrollador o estudiante puede ejecutarlo localmente en un portátil (con la variante Q4_K_M de 4,8 GB) para repasar conceptos mediante diálogo.
- Prototipado de productos edtech: su licencia Apache 2.0 y su tamaño reducido cuantizado permiten integrarlo en MVPs de tutoring sin coste de licencias ni de infraestructura GPU.
- Experimentación con pedagogía conversacional: investigadores en educación pueden usarlo como base para estudiar cómo los LLM con estilo socrático afectan a la retención de conocimiento.
- Chatbot educativo offline: con variantes IQ2/IQ3 (2-4 GB) puede desplegarse en hardware muy limitado, como mini-PCs o portátiles antiguos, para quioscos educativos o aulas sin conectividad.
- Generación de preguntas de práctica: dado su enfoque pedagógico, puede usarse para elaborar preguntas de comprensión a partir de material de estudio en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM / memoria estimada para inferencia (GGUF, sin KV cache): desde ~2,0 GB (IQ1_S) hasta ~6,4 GB (Q6_K). La variante recomendada Q4_K_M ocupa ~4,8 GB.
- Con la variante Q4_K_M o inferior, cabe en GPUs consumer de 6-8 GB (RTX 3060 8 GB, RTX 4060) e incluso puede ejecutarse solo con CPU y RAM en equipos modestos (8 GB de RAM para las variantes IQ2/IQ3).
- GPU recomendadas: no requiere GPU dedicada; para inferencia acelerada bastan una RTX 3060/4060 o superiores. Para servir muchos usuarios concurrentes, una A10 o A100 con vLLM (aunque vLLM está más orientado a GGUF vía soporte limitado; llama.cpp es la opción natural).
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, koboldcpp, y cualquier runtime compatible con GGUF. El modelo base en safetensors puede desplegarse con transformers o vLLM.
- Latencia y throughput: no disponible. Al ser un modelo de 7,6 B cuantizado, se esperan velocidades del orden de decenas de tokens/segundo en GPU consumer moderna y de unos pocos tokens/segundo en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Enfoque | Licencia |
|---|---|---|---|---|
| Prashna-7b (base) | 7,6 B | safetensors | Tutoria socratica en ingles | Apache 2.0 |
| Qwen2.5-7B-Instruct | 7,6 B | safetensors / GGUF | Uso general, multilingue | Qwen (uso comercial permitido con condiciones) |
| Mistral-7B-Instruct v0.3 | 7,2 B | safetensors / GGUF | Uso general | Apache 2.0 |

Prashna-7b comparte tamaño y arquitectura base con Qwen2.5-7B, pero está especializado en tutoría educativa, mientras que los otros dos son modelos de propósito general con ecosistemas más maduros y benchmarks documentados. En rendimiento general, no hay datos comparativos disponibles; para tareas no educativas, Qwen2.5-7B-Instruct o Mistral-7B-Instruct son opciones mejor documentadas.

## Limitaciones y advertencias

- Idioma: el modelo está declarado solo para inglés; no hay soporte documentado para español ni otros idiomas, lo que limita su uso en entornos hispanohablantes.
- No hay benchmarks publicados ni evaluaciones del modelo base, por lo que su calidad pedagógica real no está verificada de forma independiente.
- Al ser un modelo de comunidad sin documentación detallada, existe riesgo de alucinaciones y errores factuales sin cuantificar, especialmente grave en un contexto educativo donde la exactitud importa.
- Las cuantizaciones más agresivas (IQ1_S, IQ1_M, IQ2_*) degradan notablemente la calidad; para uso serio se recomienda Q4_K_M o superior.
- Sesgos: no disponible; al heredar de Qwen2 y de un fine-tuning sin documentación, deben asumirse los sesgos típicos de LLM entrenados con datos web.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución sin restricciones relevantes más allá de la atribución de la licencia.
- No hay información sobre tool calling, agentes ni contexto largo; no es adecuado para casos de uso que dependan de esas capacidades sin verificación previa.

## Enlaces

- Modelo cuantizado (esta ficha): https://huggingface.co/mradermacher/Prashna-7b-i1-GGUF
- Modelo base: https://huggingface.co/rachitgoyell/Prashna-7b
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Prashna-7b-GGUF
- Pagina de descargas resumida: https://hf.tst.eu/model#Prashna-7b-i1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
- Paper, blog o demo del modelo base: no disponible
