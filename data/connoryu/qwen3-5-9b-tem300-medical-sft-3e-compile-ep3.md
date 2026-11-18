# ConnorYU/Qwen3.5-9B-tem300-Medical-SFT-3e-compile-ep3

## Resumen

ConnorYU/Qwen3.5-9B-tem300-Medical-SFT-3e-compile-ep3 es un ajuste fino (SFT) del modelo ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step300, a su vez derivado de la familia Qwen3.5. El autor, ConnorYU, lo publica bajo licencia Apache 2.0 con 9.409.813.744 parametros totales (aproximadamente 9,4 mil millones) y un pipeline declarado de image-text-to-text, lo que indica que el modelo base conserva capacidades multimodales de vision y lenguaje. El nombre del checkpoint sugiere un entrenamiento orientado a dominio medico ("Medical-SFT"), con un paso intermedio de GRPO (optimizacion por politica proximal con recompensas verificables) y una fase de compilacion en la tercera epoca.

El modelo es relevante para desarrolladores e investigadores que quieran evaluar la cadena de ajuste de un Qwen3.5 de ~9B en un dominio vertical sanitario, con licencia permisiva y pesos en safetensors compatibles con transformers y text-generation-inference. Al tratarse de un checkpoint experimental de un autor individual, sin model card detallada ni benchmarks publicados, su interes es principalmente como objeto de estudio de pipelines de RLHF/GRPO y SFT sobre modelos multimodales, mas que como solucion lista para produccion.

La informacion disponible es limitada: la model card solo indica el modelo base, la licencia y que el entrenamiento se realizo con Unsloth y TRL de Hugging Face. No se detallan datos de entrenamiento, composicion del dataset medico, hiperparametros ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.5; detalles no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | en (segun la model card; capacidades multilingues del base no confirmadas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 18,8 GB |
| Modelo base | ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step300 |
| Libreria | transformers |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5 de ~9B, un transformer multimodal con entrada de imagen y texto segun el pipeline declarado. No se dispone de informacion sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni sobre si incorpora innovaciones como atencion lineal o decodificacion especulativa. El nombre del checkpoint indica un proceso de ajuste supervisado (SFT) sobre un modelo previamente optimizado con GRPO ("GRPO-ifeval-v0-think-step300"), lo que sugiere un entrenamiento en dos fases: primero RL con recompensas verificables orientado a seguir instrucciones (ifeval) y modo "think", y despues SFT sobre datos medicos.

El entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, segun la model card, lo que implica un pipeline de ajuste eficiente en memoria (posiblemente LoRA/QLoRA o tecnicas equivalentes, aunque no se especifica). No hay datos sobre el volumen de tokens, la composicion del corpus medico, el uso de RLHF/DPO adicional ni hiperparametros de entrenamiento. El sufijo "compile-ep3" apunta a una tercera epoca con compilacion del grafo, pero no se documenta su efecto.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de modo "think" heredado del modelo base (razonamiento paso a paso antes de responder).
- Procesamiento de imagen y texto (image-text-to-text), segun el pipeline declarado en Hugging Face.
- Ajuste especifico a dominio medico (SFT), orientado a terminologia y tareas clinicas, aunque sin documentacion de alcance.
- Seguimiento de instrucciones reforzado mediante la fase GRPO/ifeval del modelo base.
- Soporte de tool calling / function calling: no disponible (no confirmado en la informacion).
- Soporte de agentes y razonamiento multi-paso: no disponible (no confirmado).
- Capacidades multilingues: solo se declara ingles; el comportamiento en otros idiomas no esta verificado.

## Casos de uso

- Estudio de pipelines de ajuste en dos fases (GRPO + SFT): util para investigadores que quieran reproducir o analizar como un checkpoint con RL de seguimiento de instrucciones se especializa despues en un dominio vertical como el medico.
- Prototipado de asistentes clinicos de bajo riesgo: el modelo puede generar respuestas sobre terminologia medica en ingles para entornos de evaluacion interna, siempre con supervision humana y sin uso diagnostico.
- Extraccion de informacion de imagenes medicas acompanadas de texto: gracias al pipeline image-text-to-text, puede emplearse en experimentos de descripcion o clasificacion asistida de imagenes con contexto textual, previa validacion rigurosa.
- Generacion de resumenes de notas clinicas en ingles: adecuado para pruebas de concepto en las que se compare su salida con la de modelos medicos establecidos, dado su ajuste SFT en dominio sanitario.
- Evaluacion comparativa de checkpoints derivados de Qwen3.5: sirve como punto de referencia para medir el impacto del SFT medico frente al modelo base GRPO en tareas de instruccion.
- Base para ajustes adicionales: al estar en safetensors y con licencia Apache 2.0, puede reutilizarse como punto de partida para fine-tuning con Unsloth/TRL en otros dominios o idiomas.
- Investigacion sobre sesgos y alucinacion en IA medica: su condicion de modelo experimental sin benchmarks lo hace util para estudiar fallos tipicos en dominio clinico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 19-20 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 24 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 10-11 GB; en 4 bits: en torno a 6-7 GB (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100 para despliegue multimodal a escala; RTX 4090 (24 GB) viable en BF16 para inferencia con contexto moderado; RTX 3090 similar.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con cuantizacion o contexto reducido; en GPUs de 12-16 GB solo con cuantizacion agresiva.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag incluido), vLLM y llama.cpp/Ollama previsiblemente compatibles si se generan cuantizaciones GGUF, aunque no estan publicadas por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Benchmarks publicados |
|---|---|---|---|---|---|
| ConnorYU/Qwen3.5-9B-tem300-Medical-SFT-3e-compile-ep3 | 9,4B | no disponible | imagen-texto | Apache 2.0 | no |
| ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step300 (modelo base) | ~9B | no disponible | imagen-texto | no disponible | no disponible |
| Qwen3.5-9B (modelo original de la familia) | ~9B | no disponible | imagen-texto | no disponible en esta ficha | no disponible en esta ficha |

La comparativa se limita a la cadena de derivacion del propio checkpoint, ya que no se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas equivalentes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental de autor individual, sin model card detallada, sin benchmarks y con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia publica de su calidad.
- Ajuste en dominio medico sin documentacion del dataset: riesgo elevado de alucinacion clinica y de respuestas no verificadas; no debe usarse para diagnostico, tratamiento ni decision clinica.
- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Longitud de contexto, cuantizaciones y requisitos de hardware no documentados por el autor.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), la condicion experimental y la falta de validacion desaconsejan su uso en produccion sin auditoria previa.
- Posibles sesgos heredados del corpus de entrenamiento y del modelo base, no evaluados.
- El pipeline image-text-to-text implica procesamiento de imagenes; conviene revisar el preprocesador y las dependencias de transformers para evitar fallos silenciosos.

## Enlaces

- Hugging Face: https://huggingface.co/ConnorYU/Qwen3.5-9B-tem300-Medical-SFT-3e-compile-ep3
- Modelo base: https://huggingface.co/ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step300
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
