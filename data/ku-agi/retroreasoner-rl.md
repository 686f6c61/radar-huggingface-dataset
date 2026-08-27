# KU-AGI/RetroReasoner-RL

## Resumen

RetroReasoner-RL es un modelo de lenguaje especializado en retrosíntesis química, desarrollado por el laboratorio KU-AGI. Se trata de un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3-8B, orientado a predecir reactivos a partir de un producto químico siguiendo un razonamiento paso a paso inspirado en la estrategia de desconexión de enlaces que emplean los químicos sintéticos. El modelo se entrena en dos fases: primero con supervisión fina (SFT) utilizando el dataset SyntheticRetro, que genera racionales estructurados de desconexión emparejados con predicciones de reactivos, y posteriormente con aprendizaje por refuerzo (RL) usando una recompensa de ida y vuelta (round-trip) que evalúa la factibilidad de las propuestas.

Con 8,19 mil millones de parámetros, RetroReasoner-RL está diseñado para tareas de generación de texto y razonamiento en el dominio de la química, con un enfoque particular en la planificación sintética. Su relevancia actual radica en la creciente demanda de herramientas de IA que asistan a químicos computacionales y sintéticos en el diseño de rutas de síntesis, un problema clásico y complejo dentro de la química orgánica. El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y académico, y está disponible en formato safetensors para su integración con el ecosistema Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3-8B) |
| Parametros totales | 8.190.735.360 (8,19 mil millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repo en safetensors, sin GGUF publicado) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

RetroReasoner-RL hereda la arquitectura de Qwen3-8B, un transformer decoder-only con atención estándar y mecanismos de razonamiento propios de la familia Qwen3. No se han publicado detalles adicionales sobre modificaciones arquitectónicas específicas; el modelo se presenta como un ajuste fino del checkpoint base, por lo que la estructura interna (número de capas, dimensiones de atención, etc.) corresponde a la del modelo original.

El entrenamiento se realiza en dos etapas, según el paper asociado. La primera etapa consiste en supervisión fina (SFT) sobre el dataset SyntheticRetro, que proporciona pares de producto-químico con racionales de desconexión estructurados. La segunda etapa aplica aprendizaje por refuerzo (RL) con una recompensa de ida y vuelta (round-trip reward), que evalúa si los reactivos propuestos pueden recombinarse para regenerar el producto original, fomentando así propuestas más precisas, diversas y factibles. No se dispone de información sobre el número total de tokens de entrenamiento ni sobre la composición exacta del dataset.

## Capacidades

- Generacion de texto y razonamiento paso a paso en el dominio de la quimica organica.
- Prediccion de reactivos a partir de un producto dado (retrosintesis).
- Generacion de racionales de desconexion estructurados, imitando el razonamiento estrategico de un quimico.
- Soporte de conversacion (segun los tags del modelo, aunque no se detalla su uso en dialogos).
- Capacidad de razonamiento multi-paso gracias al entrenamiento con RL.
- No se ha confirmado soporte para tool calling, agentes, vision o audio.

## Casos de uso

- Planificacion de rutas sinteticas en quimica farmaceutica: el modelo puede proponer rutas de sintesis para moleculas candidatas a farmacos, ayudando a los quimicos medicos a evaluar la viabilidad de sintesis antes de invertir en experimentos de laboratorio.
- Asistencia a quimicos sinteticos en el laboratorio: dado un producto intermedio, el modelo sugiere reactivos y condiciones de desconexion, acelerando el diseno de experimentos y reduciendo el tiempo de prueba y error.
- Educacion en quimica organica: puede utilizarse como herramienta didactica para que estudiantes de quimica comprendan el razonamiento retrosintetico, mostrando pasos logicos de desconexion de enlaces.
- Generacion de hipotesis en quimica computacional: integrado en pipelines de descubrimiento de moleculas, el modelo puede generar multiples opciones de reactivos que luego se evaluan con metodos de simulacion molecular.
- Automatizacion de revision de literatura quimica: al procesar descripciones de productos quimicos, el modelo puede sugerir rutas sinteticas plausibles, facilitando la busqueda de procedimientos en bases de datos.
- Optimizacion de procesos de sintesis en industria quimica: para escalar la produccion de un compuesto, el modelo puede proponer alternativas de reactivos mas economicos o accesibles, mejorando la eficiencia del proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper asociado (arXiv:2603.12666) describe el metodo y la evaluacion, pero no se incluyen metricas concretas en los materiales proporcionados. Se recomienda consultar el articulo completo para obtener datos de rendimiento comparativo.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 8,19 mil millones de parametros, en precision FP16 se requieren aproximadamente 16 GB de VRAM. Con cuantizacion de 4 bits (si se genera una version GGUF o similar), la demanda se reduce a unos 5-6 GB.
- GPU recomendadas: tarjetas con al menos 16 GB de VRAM, como NVIDIA RTX 4090, A100 (40 GB) o H100. Para cuantizacion ligera, una RTX 3060 de 12 GB podria ser suficiente.
- Compatibilidad con GPU de consumo: si, siempre que se aplique cuantizacion (por ejemplo, 4 bits) y se use una GPU con al menos 8-12 GB de VRAM.
- Opciones de despliegue: al ser un modelo de la familia Transformers, puede servirse con vLLM, TGI (Text Generation Inference) o llama.cpp (si se convierte a GGUF). Tambien es compatible con Ollama si se genera un archivo Modelfile.
- Latencia y throughput: no se dispone de datos medidos. Como referencia, un modelo de 8B en una GPU A100 suele alcanzar decenas de tokens por segundo, pero depende de la implementacion y la longitud de contexto.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con otros modelos de retrosintesis. El modelo base Qwen3-8B es un LLM generalista, mientras que RetroReasoner-RL esta especializado en quimica. Alternativas en el dominio de retrosintesis incluyen modelos como ChemGPT o Molecular Transformer, pero no se han encontrado datos publicos de rendimiento comparativo en los materiales revisados. Se recomienda consultar el paper para ver la evaluacion frente a otros metodos.

## Limitaciones y advertencias

- El modelo esta entrenado principalmente en ingles y en el dominio de la quimica organica; su rendimiento en otros idiomas o dominios puede ser limitado.
- No se ha verificado la ausencia de sesgos en los datos de entrenamiento; como todo modelo de lenguaje, puede reflejar sesgos presentes en la literatura quimica.
- Existe riesgo de alucinacion en las propuestas de reactivos o rutas sinteticas; las sugerencias deben ser validadas por un quimico experto antes de su uso en entornos reales.
- La longitud de contexto no se ha especificado; se asume la del modelo base Qwen3-8B, pero no se confirma en la documentacion.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos de la licencia del modelo base Qwen3-8B, que puede tener restricciones adicionales.
- El modelo no ha sido evaluado en entornos de produccion; su uso en aplicaciones criticas requiere pruebas exhaustivas.

## Enlaces

- HuggingFace: https://huggingface.co/KU-AGI/RetroReasoner-RL
- Paper arXiv: https://arxiv.org/abs/2603.12666
- PDF del paper: https://arxiv.org/pdf/2603.12666
- Perfil de KU-AGI en HuggingFace: https://huggingface.co/KU-AGI/models
