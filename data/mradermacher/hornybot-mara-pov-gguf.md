# mradermacher/Hornybot-Mara-POV-GGUF

## Resumen

Hornybot-Mara-POV-GGUF es un repositorio de cuantizaciones estáticas en formato GGUF publicado por el usuario mradermacher, que convierte a formatos ligeros el modelo original axiomofmind/Hornybot-Mara-POV. No se trata de un modelo entrenado desde cero, sino de una redistribución optimizada para inferencia en CPU y GPU de gama baja, generada automáticamente mediante el pipeline de cuantización habitual de este autor.

El modelo subyacente tiene 456.010.480 parámetros (aproximadamente 456 millones), lo que lo sitúa en la categoría de modelos pequeños, aptos para ejecución local en hardware de consumo. El repositorio ocupa 1,5 GB e incluye hasta trece variantes de cuantización distintas, desde Q2_K hasta x-f16, lo que permite ajustar el equilibrio entre calidad y consumo de memoria.

Por el nombre del modelo ("Hornybot", "Mara-POV") cabe inferir que se trata de un modelo conversacional orientado a roleplay en primera persona y probablemente con contenido para adultos, aunque esta apreciación no está confirmada por ninguna documentación oficial. La relevancia práctica de esta ficha es limitada: no hay model card descriptiva, no hay datos de entrenamiento publicados, no hay benchmarks y el repositorio no registra descargas ni valoraciones, por lo que cualquier evaluación de calidad es, a día de hoy, imposible con la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 456.010.480 (aprox. 456 M) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |
| Modelo base | axiomofmind/Hornybot-Mara-POV |
| Tamano del repositorio | 1,5 GB |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base. La model card del repositorio GGUF se limita a una plantilla autogenerada por la herramienta de cuantización de mradermacher, con metadatos técnicos (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`) y la referencia al modelo de origen, sin ninguna descripción de la red, del tokenizador o del vocabulario. El número de parámetros (456 M) es compatible con un transformer pequeño de tipo decoder-only, pero no se puede confirmar la familia arquitectónica ni si incorpora innovaciones como atención lineal, decodificación especulativa o capas recurrentes.

Tampoco hay información sobre el proceso de entrenamiento: se desconoce el volumen de tokens, la composición del dataset, si hubo ajuste por instrucciones, RLHF, DPO u otra técnica de alineamiento. No consta ningún paper, informe técnico ni entrada de blog asociada al modelo original. La única operación documentada es la conversión a GGUF y la generación de las cuantizaciones listadas en los metadatos del repositorio.

## Capacidades

- Generación de texto conversacional: es la única capacidad plausible dado el nombre del modelo, aunque no está documentada oficialmente.
- Roleplay en primera persona ("POV"): el sufijo del nombre sugiere un ajuste orientado a narración en primera persona, sin confirmación por parte del autor.
- Contenido para adultos: el término "Hornybot" apunta a un modelo sin filtros de contenido sexual, extremo no verificado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declara ningún idioma en la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

Dada la ausencia total de documentación técnica, benchmarks y descargas registradas, los siguientes casos son hipotéticos y condicionados a una validación previa por parte del equipo que lo adopte:

- Prototipado de chatbots de personaje en local: un modelo de 456 M en cuantización Q4_K_M ocupa del orden de 300 MB, por lo que puede cargarse en cualquier portátil y usarse para iterar rápidamente sobre prompts de personaje antes de escalar a un modelo mayor.
- Aplicaciones de narrativa interactiva o ficción asistida: el enfoque aparente hacia el roleplay en primera persona lo haría adecuado para generar texto narrativo subsidiario (descripciones de escena, diálogos de personajes secundarios) sin coste de API.
- Entornos sin conexión o con requisitos de privacidad estrictos: al ejecutarse íntegramente en local mediante llama.cpp u Ollama, no se envía ningún dato a servidores externos, lo que puede encajar en escenarios donde el contenido es sensible.
- Pruebas de cuantización y evaluación comparativa: el repositorio ofrece trece variantes del mismo modelo, lo que lo convierte en un banco de pruebas útil para medir la degradación de calidad entre Q2_K, Q4_K_M, Q8_0 y x-f16 sobre una misma tarea.
- Generación de texto de relleno con fines de test de infraestructura: para validar pipelines de despliegue (vLLM, llama.cpp, TGI) y medir latencia y throughput con un modelo de tamaño pequeño.
- Investigación sobre seguridad y filtrado de contenido: un modelo con probable ausencia de alineamiento permite estudiar el comportamiento de clasificadores de contenido y de mecanismos de moderación.
- Fine-tuning ligero sobre hardware de consumo: 456 M de parámetros admiten ajuste por LoRA en una única GPU de 8-12 GB, útil para experimentos académicos de bajo presupuesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni el repositorio GGUF ni la referencia al modelo base incluyen métricas de MMLU, HumanEval, GSM8K, MT-Bench ni de ningún otro conjunto de evaluación. Tampoco existen comparaciones frente a modelos de tamaño similar.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del número de parámetros y del tipo de cuantización, no datos publicados por el autor:

- VRAM estimada para inferencia: aproximadamente 0,95 GB en x-f16, 0,55 GB en Q8_0, 0,35 GB en Q5_K_M, 0,30 GB en Q4_K_M y 0,20 GB en Q2_K, incluyendo overhead de contexto y caché KV.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema, aunque las dos últimas están enormemente sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (GTX 1050 Ti en adelante) e incluso en iGPU con memoria unificada.
- Ejecución en CPU: viable con llama.cpp u Ollama; las cuantizaciones Q2_K y Q4_K_M permiten inferencia interactiva en procesadores de escritorio actuales.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp. vLLM y TGI son compatibles con modelos pequeños, pero su overhead de gestión los hace poco eficientes a esta escala.
- Latencia y throughput estimados: no disponibles; dependerán del hardware, del backend y de la longitud de contexto efectiva, que se desconoce.

## Comparativa con modelos similares

No es posible establecer una comparativa rigurosa porque se desconoce la arquitectura del modelo base, su licencia y sus capacidades reales. A modo de referencia de categoría, en el rango de 400-500 millones de parámetros existen alternativas ampliamente documentadas como Qwen2.5-0.5B, SmolLM2-360M o TinyLlama-1.1B, pero no hay ningún dato que permita situar a Hornybot-Mara-POV frente a ellas en calidad, contexto o rendimiento.

| Aspecto | Hornybot-Mara-POV-GGUF | Modelos comparables (Qwen2.5-0.5B, SmolLM2, TinyLlama) |
|---|---|---|
| Parametros | 456 M | 360 M - 1,1 B |
| Longitud de contexto | no disponible | 2.048 - 32.768 tokens segun modelo |
| Licencia | no disponible | Apache 2.0 / otras licencias abiertas |
| Benchmarks publicados | ninguno | MMLU, HumanEval, GSM8K, etc. |
| Documentacion | plantilla autogenerada | model card completa y papers |
| Idiomas declarados | no disponible | multilingue o ingles |

## Limitaciones y advertencias

- Licencia desconocida: ni el repositorio GGUF ni el modelo base declaran licencia, lo que impide determinar si el uso comercial está permitido. Adoptarlo en producción sin aclarar este punto supone un riesgo legal.
- Contenido potencialmente para adultos: el nombre sugiere ausencia de filtros de contenido sexual; no se ha verificado si el modelo genera material inapropiado de forma no solicitada.
- Riesgo de alucinación elevado: en modelos de menos de 1.000 millones de parámetros la tasa de invención de hechos es alta, especialmente sin documentación sobre el alineamiento aplicado.
- Ausencia de benchmarks: no existe ninguna métrica objetiva de calidad, por lo que no se puede evaluar su idoneidad frente a alternativas conocidas.
- Sin validación comunitaria: cero descargas y cero valoraciones en el momento de la consulta; no hay evidencia de uso real ni de informes de terceros.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas que requieran contexto largo.
- Idiomas no declarados: se desconoce si soporta castellano con calidad suficiente para producción.
- Model card autogenerada: el repositorio no aporta información sobre sesgos, datos de entrenamiento ni limitaciones reconocidas por el autor.
- Fecha de publicación inusual (2026): conviene verificar la integridad del repositorio antes de descargarlo en entornos de producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Hornybot-Mara-POV-GGUF
- Modelo base: https://huggingface.co/axiomofmind/Hornybot-Mara-POV
- Perfil del cuantizador: https://huggingface.co/mradermacher
- Paper, blog o repositorio adicional: no disponible
