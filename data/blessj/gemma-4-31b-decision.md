# BlessJ/gemma-4-31b-decision

## Resumen

BlessJ/gemma-4-31b-decision es un modelo de clasificación de texto derivado por ajuste fino (fine-tune) del modelo MachinePulseAI/karpo-decision-31B, que a su vez se presenta bajo la familia "gemma4". Lo publica el usuario BlessJ en Hugging Face con licencia Apache 2.0, aunque el acceso está restringido y requiere aceptar condiciones en la plataforma. El modelo cuenta con 31.273.088.876 parámetros totales según los pesos en safetensors y un repositorio de 62,6 GB.

El modelo está etiquetado para la tarea de text-classification y lleva el tag "choice", lo que sugiere un uso orientado a tareas de decisión o selección entre opciones. Al tratarse de un derivado de un modelo base de 31B, hereda la arquitectura y capacidades del modelo original, si bien la información pública disponible no detalla los datos de entrenamiento ni el proceso de ajuste.

La relevancia de esta ficha es limitada por la escasez de documentación: no hay model card publicada con especificaciones, benchmarks ni idiomas soportados, y el repositorio no registra descargas ni interacciones. Cualquier evaluación en producción debería partir de la verificación directa de los pesos y de la documentación del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia "gemma4" según tags; arquitectura concreta no documentada) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna del modelo más allá de los tags de Hugging Face, que lo encuadran en la familia "gemma4" y lo describen como un fine-tune de MachinePulseAI/karpo-decision-31B. El número de parámetros (31,27B) y el tamaño del repositorio (62,6 GB) son coherentes con pesos en precisión de 16 bits, sin que se documenten variantes cuantizadas.

Tampoco se detallan los datos de entrenamiento, el volumen de tokens, la composición del dataset ni si hubo etapas de RLHF, DPO o ajuste supervisado específico para la tarea de clasificación. El tag "choice" y la pipeline text-classification apuntan a un ajuste orientado a selección entre opciones, pero no hay model card que confirme la metodología.

## Capacidades

- Clasificación de texto: la pipeline declarada es text-classification, por lo que el uso previsto es asignar etiquetas o categorías a entradas de texto.
- Selección entre opciones ("choice"): el tag sugiere capacidad de elegir entre alternativas presentadas, aunque no se documenta el formato de entrada esperado.
- Herencia del modelo base: al ser un fine-tune de MachinePulseAI/karpo-decision-31B, podría conservar capacidades generativas del modelo original, pero no hay confirmación documental.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Clasificación de tickets de soporte: usar el modelo para etiquetar automáticamente incidencias por categoría o prioridad, aprovechando su pipeline de text-classification; requiere validar previamente el esquema de etiquetas con datos propios.
- Enrutamiento de consultas en atención al cliente: emplear la capacidad de "choice" para decidir a qué departamento o flujo derivar cada mensaje entrante.
- Moderación de contenido: clasificar textos como aptos o no aptos según políticas internas, con un conjunto de validación etiquetado por el equipo.
- Triage de documentación legal o técnica: asignar documentos a categorías predefinidas en un pipeline de gestión documental.
- Filtrado de candidatos en procesos de selección: clasificar respuestas o currículos según criterios definidos, con revisión humana obligatoria por riesgo de sesgo.
- Clasificación de reseñas o feedback de producto: categorizar opiniones de usuarios por temática o sentimiento si el ajuste lo permite, previa verificación empírica del rendimiento.
- Investigación sobre ajuste fino de modelos de 31B: servir como caso de estudio de fine-tunes derivados de modelos base poco documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 31,27B parámetros en FP16 se requieren aproximadamente 62,6 GB de VRAM solo para los pesos, más memoria para el contexto y el estado de inferencia; en cuantización de 8 bits bajaría a unos 31 GB y en 4 bits a unos 16 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: para FP16, GPUs con 80 GB como A100 80GB o H100; para 8 bits, A100 40GB o dos RTX 4090; para 4 bits, una RTX 4090 de 24 GB podría ser suficiente en teoría, pero no hay pesos cuantizados publicados.
- Cabe en consumer GPU: solo con cuantización agresiva (4 bits) y una GPU de 24 GB; en FP16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: vLLM, TGI o transformers para los pesos safetensors; llama.cpp u Ollama requerirían convertir los pesos a GGUF, algo no documentado por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables documentados en la información proporcionada, y el modelo base MachinePulseAI/karpo-decision-31B carece de datos públicos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face, lo que puede limitar su uso automatizado y su reproducibilidad.
- Documentación inexistente: no hay model card con especificaciones, datos de entrenamiento, idiomas ni formato de entrada, lo que impide evaluar su idoneidad sin pruebas empíricas.
- Sin benchmarks: no se han publicado métricas de rendimiento, por lo que no se puede verificar su calidad frente a alternativas.
- Riesgo de alucinación y sesgos: al no documentarse el dataset de ajuste, no se pueden evaluar sesgos conocidos ni la fiabilidad de las clasificaciones.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base podría tener condiciones adicionales que conviene verificar antes de desplegarlo en producción.
- Sin actividad comunitaria: cero descargas y cero likes en el momento de la consulta, lo que reduce la probabilidad de encontrar soporte o validaciones externas.
- Idiomas no confirmados: no se especifican los idiomas soportados, por lo que el rendimiento en castellano es desconocido.

## Enlaces

- Hugging Face: https://huggingface.co/BlessJ/gemma-4-31b-decision
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
