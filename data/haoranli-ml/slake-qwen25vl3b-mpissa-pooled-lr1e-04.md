# haoranli-ml/slake-qwen25vl3b-mpissa-pooled-lr1e-04

## Resumen

El modelo `haoranli-ml/slake-qwen25vl3b-mpissa-pooled-lr1e-04` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base multimodal Qwen/Qwen2.5-VL-3B-Instruct. Lo publica el usuario de Hugging Face `haoranli-ml` y se distribuye como un repositorio PEFT de aproximadamente 0,2 GB, lo que corresponde únicamente a los pesos del adaptador y no al modelo completo. El nombre del repositorio sugiere un ajuste fino orientado al conjunto de datos SLAKE, un benchmark de preguntas y respuestas visuales en el dominio médico, aunque la model card no lo confirma de forma explícita.

La relevancia de esta ficha es doble. Por un lado, ilustra el flujo habitual de especialización de un modelo visión-lenguaje de 3 000 millones de parámetros mediante PEFT sobre un dominio vertical sensible como es la radiología y la imagen médica. Por otro lado, sirve de ejemplo de un artefacto con documentación prácticamente inexistente: la model card es la plantilla por defecto de Hugging Face sin rellenar, no hay resultados de evaluación, no se declara licencia ni idiomas y el repositorio registra cero descargas y cero likes en el momento de la consulta.

Conviene subrayar que este repositorio no es un modelo autónomo: para utilizarlo hay que cargar el modelo base Qwen2.5-VL-3B-Instruct y aplicar encima los pesos del adaptador. Cualquier uso en producción exige, por tanto, evaluar conjuntamente el comportamiento del base y el del adaptador, y asumir la ausencia de garantías documentales por parte del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only multimodal (Qwen2.5-VL); el adaptador en sí es de bajo rango |
| Parametros totales | No disponible para el adaptador; el modelo base Qwen2.5-VL-3B-Instruct declara 3 000 millones en su denominación |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en el repositorio; heredada del modelo base Qwen2.5-VL-3B-Instruct |
| Tipos de cuantizacion | No disponible en el repositorio; el adaptador se distribuye en safetensors y admite combinarse con cuantizaciones del base (4-bit, 8-bit) mediante PEFT/bitsandbytes, sin garantía del autor |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango inyectadas en determinadas capas lineales del transformer del modelo base. El repositorio declara `library_name: peft`, versión de PEFT 0.21.2 y el tag `base_model:adapter:Qwen/Qwen2.5-VL-3B-Instruct`, lo que confirma que el entrenamiento se realizó con la librería PEFT sobre Qwen2.5-VL-3B-Instruct. El sufijo del identificador (`lr1e-04`) sugiere una tasa de aprendizaje de 1e-4 y el segmento `mpissa-pooled` apunta a alguna forma de agregación o pooling de representaciones, pero no hay documentación que detalle la configuración exacta (rango, alpha, capas objetivo, epochs, precisión).

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, la existencia de RLHF/DPO ni de innovaciones técnicas adicionales. El nombre del repositorio incluye `slake`, lo que apunta a un ajuste sobre el dataset SLAKE de VQA médica, pero esta inferencia no está confirmada por el autor. Tampoco se documentan hiperparámetros de preprocesado, aumentación de datos ni estrategia de congelación de capas.

## Capacidades

- Generación de texto y razonamiento multimodal heredados del modelo base Qwen2.5-VL-3B-Instruct, presumiblemente especializados en el dominio del dataset de ajuste.
- Respuesta a preguntas sobre imágenes (VQA), capacidad coherente con el nombre `slake` del repositorio.
- Comprensión de documentos e imágenes médicas, si se confirma la naturaleza del ajuste; no verificado por el autor.
- Soporte de tool calling y function calling: no documentado en el adaptador; depende del base.
- Soporte de agentes y razonamiento multi-paso: no documentado; depende del base.
- Capacidades multilingües: no disponibles en la información del repositorio.
- Modo thinking, visión o audio adicionales: no documentados en el adaptador.

## Casos de uso

- Investigación en VQA médica: el adaptador puede emplearse como punto de partida para reproducir o comparar experimentos de ajuste fino sobre SLAKE, cargando el base Qwen2.5-VL-3B-Instruct y aplicando el LoRA con PEFT.
- Prototipado de asistentes de lectura de informes radiológicos: el modelo podría responder preguntas sobre imágenes médicas en un entorno de laboratorio, siempre con validación por parte de personal clínico y sin uso diagnóstico directo.
- Evaluación de técnicas PEFT en dominios verticales: sirve como caso de estudio de cómo un adaptador de bajo rango modifica el comportamiento de un VLM de 3 000 millones de parámetros con un coste de almacenamiento de 0,2 GB.
- Generación de pares pregunta-respuesta sobre imágenes para aumento de datos: útil en pipelines de investigación que necesiten sintetizar QA visual en el dominio médico, con revisión humana obligatoria.
- Docencia y formación en ajuste fino multimodal: el repositorio es un ejemplo compacto de artefacto PEFT que se puede inspeccionar y cargar en un portátil con GPU consumer.
- Experimentos de comparación de tasas de aprendizaje: el sufijo `lr1e-04` permite agrupar este adaptador con otras variantes del mismo autor para estudiar el efecto del learning rate.
- Integración en pipelines de evaluación automatizada de modelos médicos: como componente de un banco de pruebas que mida la degradación o mejora respecto al base en tareas de VQA clínica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en precisión completa (bf16): en torno a 6-7 GB solo para pesos, más overhead de activaciones y del procesador visual; se recomienda un mínimo de 12-16 GB para comodidad.
- VRAM estimada con cuantización 4-bit del base (bitsandbytes): aproximadamente 2,5-3,5 GB de pesos, viable en GPU de 8 GB.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) o A100/H100 para despliegues con concurrencia; RTX 3090, 4080 o L4 para inferencia individual.
- Cabe en GPU consumer: sí, especialmente con cuantización 4-bit en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070).
- Opciones de despliegue: transformers + PEFT para cargar el adaptador; vLLM y TGI admiten adaptadores LoRA en algunos casos, pero la compatibilidad con modelos multimodales Qwen2.5-VL debe verificarse; llama.cpp y Ollama requieren fusionar previamente el adaptador con el base y convertir a GGUF.
- Latencia y throughput: no disponibles; dependen del hardware, de la resolución de imagen de entrada y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| haoranli-ml/slake-qwen25vl3b-mpissa-pooled-lr1e-04 | Adaptador LoRA sobre base de 3 000 M | No disponible | No disponible | safetensors (PEFT) | Sin benchmarks ni documentación |
| Qwen/Qwen2.5-VL-3B-Instruct | 3 000 M | No disponible en esta ficha | No disponible en esta ficha | safetensors | Modelo base oficial; documentación y evaluación publicadas por el autor original |
| Adaptadores LoRA comunitarios sobre Qwen2.5-VL-3B | Variable (típicamente 10-100 M) | Heredado del base | Variable según autor | safetensors (PEFT) | Ecosistema amplio en Hugging Face; calidad muy heterogénea |

La comparación con alternativas de la misma categoría (adaptadores LoRA médicos sobre VLMs) no puede completarse con datos verificables desde la información disponible; se indica, por tanto, que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- La model card es la plantilla por defecto de Hugging Face sin rellenar: no hay información sobre datos, entrenamiento, evaluación ni uso previsto.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido; en ausencia de licencia explícita, debe asumirse que no hay autorización clara.
- El repositorio registra cero descargas y cero likes, sin señales de validación por parte de la comunidad.
- El ajuste parece orientado a un dominio médico (SLAKE), lo que incrementa el riesgo de respuestas plausibles pero incorrectas en contextos clínicos; no debe usarse para diagnóstico ni consejo médico.
- Riesgo de alucinación inherente al modelo base, potencialmente amplificado por un ajuste fino sobre un dataset pequeño y especializado.
- No hay información sobre sesgos demográficos, geográficos o lingüísticos introducidos por el ajuste.
- El adaptador solo funciona junto con el modelo base Qwen2.5-VL-3B-Instruct; no es un modelo autónomo y su comportamiento depende de la versión exacta del base.
- El nombre incluye `pooled`, lo que sugiere una estrategia de agregación de representaciones que podría limitar la generación libre de texto largo; no verificado.
- No se documentan limitaciones de contexto ni de idioma; cualquier afirmación al respecto sería especulativa.
- Para producción, sería necesario realizar una evaluación propia (VQA médica, robustez, sesgos) y fusionar o servir el adaptador con infraestructura compatible con PEFT y modelos multimodales.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/haoranli-ml/slake-qwen25vl3b-mpissa-pooled-lr1e-04
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Librería PEFT: https://github.com/huggingface/peft
- Paper de referencia citado en los tags (ML Impact Calculator, Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental: https://mlco2.github.io/impact
