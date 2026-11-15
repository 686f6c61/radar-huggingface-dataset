# mradermacher/Phi_medprob-social-n-preventive-medicine-GGUF

## Resumen

Phi_medprob-social-n-preventive-medicine-GGUF es una versión cuantizada en formato GGUF del modelo emilykang/Phi_medprob-social-n-preventive-medicine, un ajuste fino del modelo Phi de Microsoft orientado al ámbito de la medicina social y preventiva. La cuantización ha sido realizada por mradermacher, un conocido creador de cuantizaciones GGUF para la comunidad de inferencia local, y se distribuye a través de Hugging Face con el objetivo de facilitar el despliegue en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo base cuenta con aproximadamente 2.780 millones de parámetros (2.779.683.840 según los pesos en safetensors), lo que lo sitúa en la categoría de modelos pequeños, adecuados para ejecución en CPU o GPU de gama media-baja. La información disponible no detalla la longitud de contexto, los datos de entrenamiento ni el proceso de ajuste del modelo base, por lo que varios apartados de esta ficha quedan marcados como no disponibles.

La relevancia de esta ficha radica en que permite a desarrolladores e investigadores evaluar rápidamente un modelo especializado en un dominio sanitario concreto (medicina social y preventiva) en su variante cuantizada, lista para descarga local. El repositorio tiene un tamaño de 25 GB e incluye múltiples niveles de cuantización, desde Q2_K hasta f16, lo que ofrece un abanico amplio de compromisos entre calidad y requisitos de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en la familia Phi de Microsoft; detalles específicos no disponibles) |
| Parametros totales | 2.779.683.840 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, IQ4_XS, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base emilykang/Phi_medprob-social-n-preventive-medicine es un ajuste fino de la familia Phi de Microsoft, una arquitectura transformer densa de aproximadamente 2.780 millones de parámetros. La información proporcionada no especifica la variante exacta de Phi utilizada como punto de partida, ni el número de tokens de entrenamiento, ni la composición del dataset de ajuste. Tampoco se detalla si se emplearon técnicas de alineación como RLHF o DPO.

La variante aquí descrita es una cuantización estática realizada por mradermacher con la herramienta de conversión a GGUF, orientada a la inferencia eficiente en llama.cpp y ecosistemas compatibles. El autor indica que también existen cuantizaciones ponderadas con imatrix en un repositorio separado (sufijo i1), que suelen ofrecer mejor calidad por tamaño que las cuantizaciones estáticas equivalentes. No se dispone de información sobre innovaciones técnicas adicionales en el modelo base.

## Capacidades

- Generación de texto en inglés, orientada al dominio de la medicina social y preventiva.
- Especialización temática en contenidos de salud pública, prevención y determinantes sociales de la salud (según el nombre del modelo base; no se detalla en la información disponible).
- Capacidades generales heredadas de la familia Phi (razonamiento básico, respuesta a preguntas), aunque no se documentan explícitamente.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Consulta de conceptos de medicina preventiva: el modelo puede responder preguntas sobre cribados, vacunación o determinantes sociales de la salud en inglés, aprovechando su ajuste específico de dominio.
- Asistencia en educación sanitaria: generación de material divulgativo sobre prevención de enfermedades para profesionales en formación, con la ventaja de ejecutarse localmente sin enviar datos a servicios externos.
- Prototipado de asistentes clínicos de bajo coste: al caber en hardware de consumo, permite iterar rápidamente en el diseño de flujos conversacionales sanitarios antes de escalar a modelos mayores.
- Investigación sobre ajuste fino en dominios sanitarios: sirve como caso de estudio de un modelo pequeño especializado, útil para comparar estrategias de ajuste y cuantización en el ámbito médico.
- Despliegue en entornos con requisitos de privacidad: la inferencia local con GGUF evita la transmisión de datos sensibles de salud a APIs externas, un requisito habitual en contextos clínicos.
- Filtrado y clasificación de textos de salud pública: puede emplearse para tareas de etiquetado o resumen de documentos sobre prevención, siempre con revisión humana dada la naturaleza crítica del dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB con Q2_K, 1,8 GB con Q4_K_M, 3,1 GB con Q8_0 y 5,7 GB con f16 (tamaños de archivo indicados por el autor; la VRAM real depende del contexto y del backend).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090 o superiores para mayor comodidad y contextos largos.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer actuales, incluso en tarjetas de gama baja con cuantizaciones Q4 o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF; también es posible la inferencia en CPU.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Phi_medprob-social-n-preventive-medicine-GGUF (este) | 2,78 B | No disponible | No disponible | GGUF | Hugging Face |
| emilykang/Phi_medprob-social-n-preventive-medicine (base) | 2,78 B | No disponible | No disponible | Safetensors | Hugging Face |
| Familia Phi-2 / Phi-3-mini (Microsoft) | ~2,7-3,8 B | Hasta 4K-128K según variante | MIT (Phi-3) | Safetensors, GGUF | Hugging Face, Azure |

La comparación con las variantes oficiales de Phi es aproximada, ya que no se dispone de datos de rendimiento del modelo especializado. Las alternativas de la familia Phi ofrecen licencias conocidas (MIT en Phi-3) y contextos documentados, ventajas que este modelo no puede confirmar con la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un ajuste fino sobre Phi, puede heredar sesgos del modelo base y del dataset de especialización.
- Riesgo de alucinación: relevante en un dominio sanitario; las respuestas deben validarse por profesionales antes de cualquier uso clínico.
- Limitaciones de contexto o idioma: solo se declara soporte de inglés; la longitud de contexto no está disponible.
- Restricciones de licencia para uso comercial: la licencia no está disponible, por lo que no se puede confirmar la legalidad de un uso comercial sin consultar al autor del modelo base.
- Caveat para producción: el modelo base tiene un autor distinto al cuantizador; conviene revisar la model card original para conocer el proceso de entrenamiento, los datos y las limitaciones declaradas por su creador.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K) pueden degradar notablemente la calidad en un dominio técnico como el médico.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Phi_medprob-social-n-preventive-medicine-GGUF
- Modelo base: https://huggingface.co/emilykang/Phi_medprob-social-n-preventive-medicine
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Phi_medprob-social-n-preventive-medicine-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Phi_medprob-social-n-preventive-medicine-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
