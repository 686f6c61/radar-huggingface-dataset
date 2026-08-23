# andosen/Psych_medgemma-mlx-6Bit

## Resumen

El modelo **andosen/Psych_medgemma-mlx-6Bit** es una conversión al formato MLX del modelo `Compumacy/Psych_medgemma`, un ajuste fino orientado al ámbito de la salud mental basado en la familia **MedGemma** de Google Health. MedGemma, a su vez, es una colección de variantes de Gemma 3 entrenadas específicamente para comprensión de texto e imagen médica. Esta versión concreta se limita a texto y ha sido optimizada para su ejecución eficiente en hardware Apple Silicon mediante el framework MLX.

El modelo original fue entrenado con el dataset `Daemontatox/Psy-Data-books`, que contiene libros especializados en psicología y psiquiatría, lo que le otorga una especialización en el lenguaje clínico y en la comprensión de conceptos relacionados con la salud mental. La conversión a MLX con cuantización de 6 bits permite su uso en dispositivos Mac con memoria unificada, reduciendo el consumo de VRAM y acelerando la inferencia local.

La relevancia de este modelo reside en su doble vertiente: por un lado, ofrece una alternativa open source (licencia Apache 2.0) para aplicaciones de procesamiento de lenguaje natural en el campo de la salud mental; por otro, su formato MLX facilita su despliegue en entornos de desarrollo con equipos Apple, un nicho cada vez más común entre desarrolladores e investigadores. Aunque el modelo base (MedGemma) tiene limitaciones conocidas para uso clínico real, esta variante se presenta como una herramienta de investigación y desarrollo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gemma 3 (texto) - variante de MedGemma |
| Parámetros totales | 5.909.277.440 (5,9B) |
| Parámetros activos | No disponible (modelo denso, no MoE) |
| Longitud de contexto | No disponible (probablemente 8K o 32K, según Gemma 3) |
| Tipos de cuantización | MLX 6-bit (también disponible en 4-bit, 8-bit según repo) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo es una conversión al formato MLX del modelo `Compumacy/Psych_medgemma`, que a su vez se basa en la arquitectura Gemma 3 de Google, concretamente la variante de solo texto (Gemma 3 text) con aproximadamente 5,7 mil millones de parámetros. Gemma 3 utiliza una arquitectura transformer con atención multi-cabeza y se caracteriza por su eficiencia en inferencia y su capacidad para manejar contextos largos (hasta 128K en algunas variantes, aunque la versión base de 4B/27B suele tener 32K). Este modelo concreto no especifica el contexto exacto.

El entrenamiento del modelo base (Psych_medgemma) se realizó con el dataset `Daemontatox/Psy-Data-books`, una recopilación de libros sobre psicología y psiquiatría. No se han publicado detalles sobre el número de tokens de entrenamiento, técnicas de alineación (RLHF, DPO) ni otras innovaciones. La conversión a MLX se hizo con la librería `mlx-lm` versión 0.31.2, que transforma los pesos de HuggingFace a formato MLX para acelerar la inferencia en Apple Silicon.

## Capacidades

- **Generación de texto**: el modelo puede generar texto coherente y contextualizado, especialmente en dominios relacionados con la psicología y la salud mental.
- **Razonamiento y comprensión**: al ser una variante de Gemma 3, conserva las capacidades de razonamiento y comprensión lectora de la arquitectura base, aunque su entrenamiento específico puede mejorar el desempeño en temas clínicos.
- **Multilingüe**: aunque el README indica solo inglés, Gemma 3 es multilingüe; el modelo podría funcionar en español, pero no hay garantía de rendimiento.
- **Tool calling y agentes**: no se menciona soporte explícito en la información disponible, aunque Gemma 3 tiene capacidades de tool calling; es probable que el modelo las herede.
- **Conversación**: el modelo está diseñado para tareas de conversación y chat, como se muestra en el ejemplo de uso con `apply_chat_template`.

## Casos de uso

- **Asistente virtual de salud mental**: el modelo puede integrarse en chatbots que respondan preguntas frecuentes sobre síntomas, terapias o conceptos psicológicos, ofreciendo información general sin reemplazar el juicio profesional.
- **Análisis de texto clínico**: dado su entrenamiento en libros de psicología, puede ayudar a resumir notas clínicas, extraer entidades o clasificar síntomas a partir de descripciones de pacientes (siempre bajo supervisión humana).
- **Generación de contenido educativo**: para crear material divulgativo sobre salud mental, como explicaciones de trastornos, técnicas de terapia o consejos de bienestar, con un lenguaje técnico y preciso.
- **Herramienta de investigación**: en estudios de procesamiento del lenguaje natural aplicados a la psiquiatría, el modelo puede servir como punto de partida para tareas de clasificación de textos, análisis de sentimiento o detección de patrones lingüísticos.
- **Asistente de documentación médica**: puede ayudar a redactar informes, cartas de derivación o resúmenes de historiales clínicos, siempre que se verifique la salida.
- **Entrenamiento de modelos más pequeños**: como base para técnicas de destilación o fine-tuning en tareas específicas de salud mental, aprovechando su licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de evaluaciones como MMLU, HumanEval, GSM8K ni comparaciones con otros modelos de salud mental en el repositorio de HuggingFace.

## Requisitos de hardware

- **VRAM estimada**: con cuantización MLX de 6 bits, un modelo de 5,9B parámetros requiere aproximadamente 4,5-5 GB de memoria unificada en Apple Silicon (incluyendo overhead de contexto). Con 4 bits, el requisito baja a ~3,5 GB.
- **GPU recomendadas**: cualquier Mac con chip M1, M2, M3 o M4 (incluidos los modelos Pro/Max/Ultra) con al menos 8 GB de RAM unificada. En GPU NVIDIA, el modelo no es compatible directamente con MLX, pero se puede usar la versión original en formato PyTorch.
- **Compatibilidad consumer**: sí, cabe en dispositivos con Apple Silicon de gama media (MacBook Air M1 con 8 GB, Mac mini, etc.).
- **Opciones de despliegue**: mediante `mlx-lm` (librería oficial), también se puede usar con `llama.cpp` si se convierte a GGUF, aunque no es el formato original. Para servidores, se puede usar la versión original en PyTorch con vLLM o TGI.
- **Latencia y throughput**: no se han publicado mediciones específicas. En Apple Silicon M1 Pro con 16GB, se espera una velocidad de ~10-20 tokens/s para un modelo de 6B en 6-bit, según experiencia con otros modelos similares.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Especialización |
|---|---|---|---|---|---|
| Psych_medgemma (este) | 5,9B | 8K (probable) | Apache 2.0 | MLX | Salud mental |
| MedGemma 4B (Google) | 4B | 8K | Gemma (uso limitado) | PyTorch | Médico general |
| Meditron 7B (EPFL) | 7B | 4K | MIT | PyTorch | Médico general |
| BioMistral 7B | 7B | 8K | Apache 2.0 | PyTorch | Bio-médico |

Este modelo se diferencia de MedGemma en que está fine-tuneado para psicología/psiquiatría y tiene una licencia más permisiva (Apache 2.0 frente a la licencia de Gemma). Sin embargo, al ser una conversión MLX, solo funciona en Apple Silicon, mientras que los otros son multiplataforma.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al estar entrenado con libros de psicología, puede presentar sesgos derivados de los textos fuente y puede generar información errónea si se le piden datos clínicos específicos. No debe usarse como herramienta de diagnóstico.
- **Idioma**: solo se declara soporte para inglés. El rendimiento en otros idiomas, incluido el español, no está garantizado y puede degradar significativamente.
- **Contexto limitado**: aunque Gemma 3 soporta contextos largos, esta versión no especifica su ventana de contexto real. Se recomienda no superar 8K tokens para evitar degradación.
- **Licencia**: aunque la licencia Apache 2.0 permite uso comercial, el modelo base (MedGemma) tiene restricciones de uso en el ámbito médico según los términos de Google. Hay que verificar la compatibilidad de la licencia del modelo derivado.
- **Producción**: no se ha evaluado en entornos clínicos reales. No está diseñado para diagnóstico, tratamiento o asesoramiento médico. Todo uso debe ir acompañado de supervisión humana.
- **Formato**: el formato MLX es exclusivo para Apple Silicon; no es compatible con GPU NVIDIA sin conversión previa.

## Enlaces

- [HuggingFace del modelo (andosen/Psych_medgemma-mlx-6Bit)](https://huggingface.co/andosen/Psych_medgemma-mlx-6Bit)
- [Modelo base (Compumacy/Psych_medgemma)](https://huggingface.co/Compumacy/Psych_medgemma)
- [Repositorio de MedGemma (Google-Health/medgemma)](https://github.com/google-health/medgemma)
- [Model card de MedGemma 1 (Google Developers)](https://developers.google.com/health-ai-developer-foundations/medgemma/model-card-v1)
- [Guía comparativa de LLMs en salud (Nirmitee)](https://nirmitee.io/blog/healthcare-llm-landscape-2026-medgemma-meditron-clinical-model-guide/)
