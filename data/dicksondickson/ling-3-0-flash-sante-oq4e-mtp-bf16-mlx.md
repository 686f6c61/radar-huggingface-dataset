# dicksondickson/Ling-3.0-flash-Sante-oQ4e-mtp-bf16-MLX

## Resumen

Ling-3.0-flash-Sante-oQ4e-mtp-bf16-MLX es una cuantización de la comunidad, publicada por el usuario dicksondickson, del modelo inclusionAI/Ling-3.0-flash-Sante, una variante sanitaria (health/medical) de la familia Ling 3.0 de inclusionAI (ecosistema Alibaba). El modelo base está orientado al dominio de la salud, y esta versión lo adapta a hardware Apple Silicon mediante el formato MLX, aplicando cuantización mixta de 4 bits con la herramienta oQ (oMLX 0.7.3.dev2) y dejando los tensores más importantes en bf16.

El problema que resuelve es doble: por un lado, hacer accesible un modelo de más de 124.000 millones de parámetros en equipos Mac con chips M3 o posteriores, gracias a la cuantización oQ4e con imatrix; por otro, ofrecer capacidades especializadas en texto médico y de salud partiendo de la arquitectura bailing_hybrid de la familia Ling. Con licencia MIT, resulta relevante para desarrolladores e investigadores que quieren experimentar con modelos médicos de gran tamaño de forma local, sin depender de servicios en la nube.

Debe tenerse en cuenta que la model card original es muy escasa: no se detallan datos de entrenamiento, benchmarks ni instrucciones de uso del modelo base, por lo que varias secciones de esta ficha indican que la información no está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | bailing_hybrid (híbrida, familia Ling; detalles no disponibles) |
| Parametros totales | 124.414.211.552 (dato real de safetensors) |
| Parametros activos | no disponible (la etiqueta "flash" sugiere arquitectura MoE, pero no está confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4e (4 bits mixta con imatrix, Better Low-Bit oQ); tensores críticos en bf16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (formato MLX para Apple Silicon) |

## Arquitectura y entrenamiento

El modelo base, inclusionAI/Ling-3.0-flash-Sante, emplea la arquitectura bailing_hybrid de la familia Ling 3.0, según las etiquetas del repositorio. El sufijo "mtp" presente en el nombre de esta cuantización sugiere la presencia de multi-token prediction, una técnica usada en la familia Ling para acelerar la decodificación, aunque la model card no lo describe explícitamente. La etiqueta "flash" es consistente con variantes MoE de la serie Ling, pero el número de parámetros activos y expertos no está publicado en la información disponible.

Sobre el entrenamiento del modelo base (número de tokens, composición del corpus, RLHF/DPO o afinado específico en dominio médico) no hay datos publicados en la model card. En cuanto a esta cuantización, fue generada con oQ (oMLX 0.7.3.dev2) mediante cuantización mixta de precisión con matriz de importancia (imatrix) y la opción Better Low-Bit oQ: la mayoría de los tensores se cuantizan a 4 bits, mientras que los tensores más sensibles (normalmente embeddings, capas de salida y estadísticas de atención) se mantienen en bf16, lo que explica el tamaño del repositorio de 71,8 GB y la recomendación de usar chips Apple M3 o posteriores.

## Capacidades

- Generación de texto orientada al dominio sanitario y médico (según las etiquetas health, sante y medical del modelo base).
- Capacidades generales de lenguaje heredadas de la familia Ling 3.0 (razonamiento, conversación), aunque no documentadas en la model card.
- Ejecución eficiente en Apple Silicon gracias al formato MLX con cuantización mixta oQ4e.
- Soporte de tool calling, agentes o capacidades multimodales: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistente médico de investigación local: permite a investigadores consultar y resumir literatura o notas clínicas de texto en un Mac con M3/M4 sin enviar datos a servicios externos, algo relevante por la sensibilidad de la información sanitaria.
- Prototipado de aplicaciones de salud con privacidad: al ejecutarse localmente con MLX, es adecuado para probar flujos de triaje o redacción de informes donde los datos no deben salir del dispositivo.
- Resumen de documentación clínica: el tamaño del modelo (124.000 millones de parámetros) sugiere capacidad para procesar textos médicos extensos, aunque la longitud de contexto real no está publicada.
- Evaluación comparativa de cuantizaciones: útil como caso de estudio de cuantización mixta oQ4e con imatrix sobre modelos grandes, para medir degradación frente a bf16.
- Experimentación con la familia Ling en hardware Apple: base para desarrolladores que quieran afinar (fine-tuning con MLX) o integrar el modelo en apps nativas macOS.
- Educación y demostración: despliegue en demostraciones locales de IA aplicada a salud sin costes de inferencia en la nube.

Importante: ningún caso de uso médico debe emplearse en producción para decisiones clínicas sin validación rigurosa; el modelo no cuenta con certificación ni evaluación publicada para uso asistencial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio pesa 71,8 GB; se recomienda disponer de al menos 80-96 GB de memoria unificada para cargar el modelo con margen (estimación basada en el tamaño de los pesos, no dato oficial).
- Hardware recomendado: Mac con chip Apple M3 o posterior (requisito indicado por el autor para los tensores en bf16); idealmente Mac Studio o MacBook Pro con 96 GB o más de memoria unificada.
- Consumer GPU NVIDIA: no aplicable; el formato MLX está diseñado para Apple Silicon, no para GPUs NVIDIA.
- Despliegue: mediante oMLX (https://github.com/jundot/omlx), que es el runtime indicado por el autor. No se menciona compatibilidad con llama.cpp, Ollama, vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| dicksondickson/Ling-3.0-flash-Sante-oQ4e-mtp-bf16-MLX | 124.414.211.552 | MLX safetensors, oQ4e + bf16 | MIT | Cuantización comunitaria para Apple Silicon, dominio salud |
| inclusionAI/Ling-3.0-flash-Sante (base) | no disponible | no disponible | no disponible | Modelo original sin cuantizar |
| Medgemma (Google) | 4B / 27B | safetensors | Licencia Gemma | Alternativa médica más ligera, no MLX nativo |

No hay datos de rendimiento comparables publicados, por lo que la comparativa se limita a parámetros y disponibilidad.

## Limitaciones y advertencias

- Dominio médico sin validación clínica: las etiquetas health/medical no implican exactitud; existe riesgo alto de alucinación en contenidos sanitarios, con potencial de daño si se usa sin supervisión profesional.
- Escasez de documentación: la model card no publica longitud de contexto, idiomas, benchmarks ni datos de entrenamiento, lo que dificulta la evaluación previa al despliegue.
- Requisitos de memoria muy elevados: 71,8 GB de pesos lo hacen inviable en la mayoría de equipos de consumo; requiere Macs de gama alta con 96 GB o más de memoria unificada.
- Compatibilidad limitada: requiere oMLX y chips M3 o posteriores; no es directamente usable en entornos Linux/NVIDIA estándar de producción.
- Cuantización de 4 bits: puede degradar el rendimiento respecto al modelo base en bf16, especialmente en tareas sensibles a precisión numérica.
- Licencia MIT: permite uso comercial, pero esto aplica a la cuantización; conviene verificar la licencia del modelo base inclusionAI/Ling-3.0-flash-Sante, que no está documentada en esta ficha.
- Proyecto comunitario con muy poca tracción (122 descargas y 1 like en el momento de la ficha), sin auditoría de la calidad de la cuantización por terceros.

## Enlaces

- Ficha del modelo cuantizado: https://huggingface.co/dicksondickson/Ling-3.0-flash-Sante-oQ4e-mtp-bf16-MLX
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-flash-Sante
- Repositorio oMLX (herramienta de cuantización y runtime): https://github.com/jundot/omlx
