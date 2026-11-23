# mradermacher/CounselTrajLM-Qwen2.5-7B-i1-GGUF

## Resumen

CounselTrajLM-Qwen2.5-7B-i1-GGUF es la versión cuantizada en formato GGUF del modelo UEC-InabaLab/CounselTrajLM-Qwen2.5-7B, un ajuste fino de Qwen2.5-7B orientado a conversaciones de consejería (counseling) y diálogo multi-turno. Lo publica mradermacher, un conocido cuantizador de la comunidad de Hugging Face que distribuye versiones GGUF optimizadas con imatrix para su uso en llama.cpp y entornos de inferencia local. El modelo base procede del laboratorio UEC-InabaLab (Universidad de Electro-Comunicaciones, Japón).

El modelo resuelve el problema de disponer de un asistente conversacional especializado en contextos de apoyo psicológico y consejería, con capacidad de mantener trayectorias de diálogo coherentes a lo largo de múltiples turnos. Al estar basado en Qwen2.5-7B, hereda la arquitectura transformer decoder-only de dicha familia, con aproximadamente 7.600 millones de parámetros. Su licencia Apache 2.0 facilita su adopción tanto en investigación como en productos comerciales.

Esta ficha describe específicamente la variante i1-GGUF, que ofrece un abanico de cuantizaciones dinámicas (IQ1 a Q6_K) generadas con archivos imatrix, lo que permite desplegar el modelo desde 2 GB hasta 6,4 GB según el equilibrio deseado entre calidad y requisitos de memoria. Es relevante ahora porque permite ejecutar un modelo de consejería de 7B en hardware de consumo, algo impensable con los pesos completos en safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parámetros totales | 7.615.616.512 (~7,6 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Qwen2.5 soporta hasta 32.768 tokens; verificar en la model card original) |
| Tipos de cuantización | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | chino (zh), según la model card del modelo base |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivo imatrix adicional para generar cuantizaciones propias) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (fine-tune) del Qwen2.5-7B, un transformer decoder-only con atención causal estándar y mecanismos de RoPE para codificación posicional. No se trata de una arquitectura MoE ni híbrida: es un modelo denso de aproximadamente 7,6 mil millones de parámetros. El ajuste se orienta a tareas de consejería y diálogo conversacional, según indican las etiquetas de la model card (counseling, conversational, counseltraj).

No se dispone en la información proporcionada de detalles sobre el corpus de entrenamiento, el número de tokens utilizados, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO o SFT. Tampoco se documentan innovaciones técnicas específicas del ajuste. La variante aquí descrita es una cuantización GGUF generada por mradermacher con archivos imatrix, que mejoran la preservación de calidad en cuantizaciones agresivas (especialmente en el rango IQ1-IQ3). El autor indica que las cuantizaciones IQ suelen ser preferibles a las no-IQ de tamaño similar, y recomienda i1-Q4_K_M como opción rápida y equilibrada, e i1-Q4_K_S como óptima en relación tamaño/velocidad/calidad.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a diálogos de consejería y apoyo emocional.
- Mantenimiento de contexto conversacional a lo largo de la trayectoria de diálogo (de ahí el nombre "CounselTraj").
- Capacidad multilingüe limitada al chino según la model card del modelo base; no se documentan otros idiomas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión, audio o thinking mode: no disponibles en la información proporcionada.
- Ejecución en CPU y GPU mediante llama.cpp, gracias al formato GGUF.

## Casos de uso

- Asistente de consejería conversacional en chino: el modelo puede gestionar diálogos de apoyo psicológico multi-turno, manteniendo coherencia a lo largo de la trayectoria de la conversación, gracias a su ajuste específico en counseling.
- Prototipado de chatbots de bienestar emocional: al ejecutarse en hardware de consumo mediante GGUF, permite iterar rápidamente en el diseño de flujos conversacionales sin depender de infraestructura cloud.
- Investigación en diálogo terapéutico: sirve como baseline ligero para estudiar trayectorias conversacionales en entornos académicos, con la ventaja de su licencia Apache 2.0.
- Despliegue en entornos con restricciones de privacidad: al poder ejecutarse localmente (por ejemplo, con llama.cpp u Ollama), los datos sensibles de los usuarios no salen del dispositivo, algo crítico en contextos de salud mental.
- Evaluación de cuantizaciones: la disponibilidad de 24 variantes (desde IQ1_S hasta Q6_K) permite estudiar el impacto de la cuantización en la calidad de respuestas conversacionales.
- Integración en aplicaciones de escritorio o móviles: las variantes de 2-4 GB (IQ1-IQ3) caben en dispositivos con poca memoria, habilitando asistentes de consejería offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del cuantizador no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas de counseling. El autor referencia únicamente un gráfico comparativo de perplejidad entre tipos de cuantización (enlace en la sección de enlaces), que no constituye un benchmark de capacidades.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - i1-IQ1_S / IQ1_M: ~2,0-2,1 GB
  - i1-IQ2_XXS a IQ2_M: ~2,4-2,9 GB
  - i1-Q2_K_S / Q2_K: ~2,9-3,1 GB
  - i1-IQ3_XXS a Q3_K_L: ~3,2-4,2 GB
  - i1-IQ4_XS a Q4_1: ~4,3-5,0 GB
  - i1-Q5_K_S / Q5_K_M: ~5,4-5,5 GB
  - i1-Q6_K: ~6,4 GB
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM puede ejecutar las variantes Q4-Q6; para las variantes IQ1-IQ3 basta con 3-5 GB. Modelos como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4090 (24 GB) o A100/H100 son más que suficientes, pero no son necesarios.
- Cabe en GPU de consumo: sí, en todas las GPU consumer modernas con 6 GB o más de VRAM; las variantes IQ1-IQ3 caben incluso en iGPU y dispositivos de 4 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. El autor indica que el modelo es compatible con endpoints (tag "endpoints_compatible").
- Latencia y throughput: no disponibles en la información proporcionada. Dependen del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| CounselTrajLM-Qwen2.5-7B-i1-GGUF (este) | ~7,6 B | no disponible | Apache 2.0 | GGUF | Ajuste en counseling, chino |
| Qwen2.5-7B-Instruct (base de referencia) | ~7,6 B | 32.768 (según Qwen2.5) | Apache 2.0 | safetensors, GGUF | Modelo generalista; el ajuste de counseling se construye sobre él |
| CounselTrajLM-Qwen2.5-7B (pesos originales) | ~7,6 B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar, del que deriva esta versión |
| CounselTrajLM-Qwen2.5-7B-GGUF (cuantizaciones estáticas) | ~7,6 B | no disponible | Apache 2.0 | GGUF | Variante con cuantizaciones estáticas del mismo autor |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al derivar de Qwen2.5, puede heredar sesgos del corpus de entrenamiento original, no especificados.
- Riesgo de alucinación: inherente a los modelos generativos; especialmente relevante en contextos de consejería, donde las respuestas incorrectas pueden tener impacto en el bienestar del usuario. No se documentan evaluaciones de seguridad específicas.
- Limitaciones de contexto o idioma: el modelo está etiquetado únicamente para chino (zh); su uso en castellano u otros idiomas no está garantizado ni documentado. La longitud de contexto no se especifica en la información disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base original (UEC-InabaLab/CounselTrajLM-Qwen2.5-7B) y de Qwen2.5-7B, así como las condiciones de uso responsable.
- Caveats para producción: las cuantizaciones IQ1 e IQ2 degradan notablemente la calidad (el autor las describe como "for the desperate" o "mostly desperate"); para producción se recomienda Q4_K_M o superior. El modelo no debe usarse como sustituto de atención psicológica profesional.
- El repositorio tiene 89 GB de tamaño total por incluir todas las variantes; conviene descargar solo el archivo GGUF necesario.

## Enlaces

- Repositorio Hugging Face (esta versión): https://huggingface.co/mradermacher/CounselTrajLM-Qwen2.5-7B-i1-GGUF
- Modelo base original: https://huggingface.co/UEC-InabaLab/CounselTrajLM-Qwen2.5-7B
- Cuantizaciones estáticas del mismo autor: https://huggingface.co/mradermacher/CounselTrajLM-Qwen2.5-7B-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#CounselTrajLM-Qwen2.5-7B-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Reflexiones de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
