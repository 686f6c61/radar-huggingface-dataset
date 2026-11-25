# mradermacher/Inkling-2-Mini-26B-Heretic-Uncensored-Turbo-Brilliance-50X-V2-AGI-GGUF

## Resumen

Inkling-2-Mini-26B-Heretic-Uncensored-Turbo-Brilliance-50X-V2-AGI-GGUF es una republicación en formato GGUF de un modelo de lenguaje de 26.070.385.152 parámetros (~26B) publicado por el usuario DavidAU y convertido a cuantizaciones estáticas por mradermacher. El nombre encadena varias etiquetas propias del ecosistema de modelos comunitarios (Heretic, Uncensored, Turbo, Brilliance, AGI) que indican un ajuste orientado a eliminar restricciones de alineación y a potenciar estilos de respuesta concretos, aunque la model card no documenta la metodología de entrenamiento ni el modelo base.

La relevancia de esta ficha es acotada: se trata de una conversión de pesos, no de un modelo nuevo, y el repositorio no incluye información sobre arquitectura, datos de entrenamiento, licencia ni idiomas. La model card únicamente declara el origen (el repositorio de DavidAU) y la lista de cuantizaciones generadas. Cualquier evaluación técnica debe remitirse al modelo original, cuyos metadatos no se han proporcionado aquí.

El dato verificable más sólido es el recuento de parámetros en safetensors (26.070.385.152), coherente con un transformer denso de aproximadamente 26B parámetros. El repositorio ocupa 190,5 GB, lo que refleja la suma de todas las cuantizaciones publicadas en un mismo repo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer denso, sin confirmar) |
| Parametros totales | 26.070.385.152 (~26B) |
| Parametros activos | no aplica (no se ha documentado como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas; el original en safetensors) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna en la documentación disponible. El recuento de parámetros (26.070.385.152) y el hecho de que el conversor de mradermacher haya usado `convert_type: hf` y `quantize_version: 2` sugieren un transformer estándar con pesos en safetensors convertidos desde un checkpoint de Hugging Face, pero no se confirma si emplea atención lineal, decodificación especulativa, mezcla de expertos ni ninguna otra innovación.

Tampoco hay datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO o el proceso de ajuste fino que justifique las etiquetas "Heretic", "Uncensored" o "AGI" del nombre. La model card se limita a indicar que las cuantizaciones son estáticas y derivan del repositorio de DavidAU. Cualquier afirmación sobre el entrenamiento sería especulativa y no debe asumirse.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` del repositorio indica un uso previsto de diálogo multi-turno, aunque no se detallan formatos de prompt ni plantillas de chat.
- Respuestas sin restricciones de alineación: el sufijo "Heretic-Uncensored" sugiere un ajuste orientado a reducir rechazos y filtros de seguridad, sin que se documente el método.
- Estilo "Turbo-Brilliance-50X-V2-AGI": etiqueta comercial sin definición técnica publicada; no debe interpretarse como una capacidad verificable.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Experimentación con modelos sin alineación: el modelo puede emplearse en entornos de investigación para estudiar el comportamiento de pesos ajustados para reducir rechazos, comparando respuestas frente a la versión alineada del mismo modelo base. Requiere aislamiento y revisión humana.
- Generación creativa de ficción sin filtros: útil para escritura de narrativa con temáticas adultas o controvertidas, donde los modelos alineados suelen rechazar la petición; el formato GGUF permite ejecutarlo en local con llama.cpp.
- Despliegue en estaciones de trabajo con GPU de consumo: las cuantizaciones Q3_K_M y Q4_K_M permiten cargar un modelo de ~26B en GPUs de 24 GB de VRAM, algo inviable con los pesos en fp16.
- Prototipado de chatbots conversacionales en local: la etiqueta `conversational` y el soporte de llama.cpp/Ollama facilitan iterar sobre plantillas de chat sin depender de infraestructura cloud.
- Evaluación comparativa de cuantizaciones: al publicarse 12 variantes en el mismo repo, sirve para medir la degradación de calidad entre Q2_K y Q8_0 en tareas concretas del usuario.
- Pruebas de robustez y red teaming: un modelo sin alineación es un buen sujeto para validar clasificadores de seguridad y filtros de contenido antes de desplegarlos en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 15-16 GB para Q4_K_M, 19-20 GB para Q5_K_M, 10-11 GB para Q2_K y 27-28 GB para Q8_0 (estimación a partir del recuento de parámetros; no confirmada por el autor).
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40 GB o H100 para Q8_0 y x-f16; RTX 3090 (24 GB) como alternativa económica.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantizaciones Q4_K_M o inferiores; en GPUs de 16 GB solo con Q2_K o Q3_K_S y ventanas de contexto reducidas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con la API de OpenAI (el repo incluye la etiqueta `endpoints_compatible`). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-26B-Heretic-Uncensored-Turbo-Brilliance-50X-V2-AGI (este) | ~26B | no disponible | no disponible | GGUF | Hugging Face (mradermacher / DavidAU) |
| Modelo base de DavidAU (safetensors) | ~26B | no disponible | no disponible | safetensors | Hugging Face |
| Alternativas de ~26B sin alineación | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos de la misma categoría; los datos de rendimiento, contexto y licencia del modelo evaluado no están publicados.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no hay model card sustantiva, ni ficha de arquitectura, ni resultados de evaluación; no es apto para decisiones de producción sin una validación propia.
- Licencia no especificada: la falta de licencia impide determinar si el uso comercial está permitido; debe contactarse con el autor o asumirse riesgo legal.
- Modelo "uncensored": la reducción de rechazos implica mayor probabilidad de generar contenido dañino, sesgado o ilegal; requiere filtros externos y supervisión humana.
- Riesgo elevado de alucinación: no hay datos de entrenamiento ni evaluación que permitan acotar la fiabilidad factual.
- Idiomas no documentados: no puede asumirse un buen rendimiento en castellano ni en ningún otro idioma sin pruebas.
- Cuantizaciones agresivas (Q2_K, IQ4_XS): la degradación de calidad respecto a fp16 no está medida; para tareas sensibles se recomienda Q5_K_M o superior.
- Nombre con etiquetas comerciales no verificables ("Turbo", "Brilliance-50X", "AGI"): no deben interpretarse como mejoras técnicas demostradas.
- Repositorio de 190,5 GB: la descarga completa es costosa; conviene bajar solo el archivo de la cuantización deseada.
- Fecha de creación futura (2026-11-25) en los metadatos: inconsistencia que sugiere posible error de marcado o repositorio de prueba; conviene verificar la integridad antes de usarlo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Inkling-2-Mini-26B-Heretic-Uncensored-Turbo-Brilliance-50X-V2-AGI-GGUF
- Modelo original en safetensors: https://huggingface.co/DavidAU/Inkling-2-Mini-26B-Heretic-Uncensored-Turbo-Brilliance-50X-V2-AGI
- Perfil del cuantizador: https://huggingface.co/mradermacher
