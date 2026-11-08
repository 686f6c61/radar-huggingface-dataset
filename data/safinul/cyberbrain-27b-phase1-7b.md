# Safinul/CYBERBRAIN-27B-PHASE1-7B

## Resumen

CYBERBRAIN-27B-PHASE1-7B es un adaptador LoRA publicado por el usuario Safinul sobre el modelo base Qwen/Qwen2.5-Coder-7B-Instruct. A pesar del nombre comercial, no se trata de un modelo de 27B parámetros: el identificador del repositorio combina la etiqueta de proyecto ("27B") con el tamaño real del modelo base (7B), y los pesos distribuidos son únicamente los del adaptador PEFT (0,5 GB en el repositorio). El autor lo presenta como la primera fase ("PHASE1") de un proyecto modular denominado CYBERBRAIN, orientado según su repositorio de GitHub a la generación de algoritmos en C++, internals de kernel y ciberseguridad ofensiva/defensiva.

El modelo se entrenó mediante SFT (supervised fine-tuning) con TRL, según indica la model card, y se distribuye en formato safetensors compatible con la librería PEFT. No se especifican el volumen de datos de entrenamiento, la composición del dataset, los idiomas soportados ni la licencia, y el repositorio no registra descargas ni interacciones en el momento de la consulta. Se trata, por tanto, de un artefacto experimental de un autor individual, sin benchmarks publicados ni documentación técnica sustancial.

Su relevancia es limitada fuera del contexto del proyecto CYBERBRAIN: sirve como ejemplo de fine-tuning ligero sobre un modelo de código consolidado, pero no constituye una alternativa evaluada frente a modelos de código de referencia. Cualquier uso en producción debería ir precedido de una evaluación propia, dado que no hay datos públicos sobre calidad, seguridad o comportamiento del adaptador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-7B-Instruct) + adaptador LoRA (PEFT) |
| Parámetros totales | 7B en el modelo base; el adaptador LoRA distribuido ocupa 0,5 GB (número exacto de parámetros del adaptador no disponible) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Qwen2.5-Coder-7B-Instruct soporta contextos largos, pero el adaptador no documenta cambios) |
| Tipos de cuantización | no disponible (los adaptadores LoRA se aplican sobre el base; la cuantización depende del despliegue del base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin contenido) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-Coder-7B-Instruct, un transformer decoder-only de 7B parámetros especializado en código. La contribución del repositorio es un conjunto de pesos LoRA entrenados mediante SFT con TRL 1.17.1, PEFT 0.21.2, Transformers 5.22.2, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3. No se documenta el rango del LoRA, los módulos objetivo, la tasa de aprendizaje, el número de pasos ni el tamaño del dataset.

La model card no describe la composición de los datos de entrenamiento ni si hubo etapas de RLHF o DPO; únicamente confirma el uso de SFT. El repositorio de GitHub del autor menciona una arquitectura "modular MoE" de siete fases para generación de algoritmos C++, internals de kernel y ciberseguridad, pero no hay evidencia en la información disponible de que este adaptador implemente dicha arquitectura: los pesos publicados corresponden a un LoRA sobre un transformer denso. No se documentan innovaciones técnicas como decodificación especulativa, atención lineal o modos de razonamiento extendido.

## Capacidades

- Generación de texto conversacional y de código, heredadas del modelo base Qwen2.5-Coder-7B-Instruct.
- Especialización declarada (según el proyecto del autor, no verificada) en algoritmos C++, internals de kernel y tareas de ciberseguridad ofensiva y defensiva.
- Soporte de tool calling y function calling: no documentado en el adaptador; depende de lo que preserve del modelo base.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no disponibles.
- Alineación conversacional mediante plantilla de chat (el ejemplo de la model card usa formato de mensajes con rol `user`).

## Casos de uso

- Prototipado de asistentes de código en C++: el adaptador puede desplegarse sobre el base para generar fragmentos de algoritmos y estructuras de datos, aprovechando la especialización declarada por el autor; requiere validación propia antes de usarlo en entornos reales.
- Experimentación académica con fine-tuning PEFT: sirve como ejemplo reproducible de un pipeline SFT con TRL sobre un modelo de código, útil para estudiar cómo un adaptador pequeño modifica el comportamiento del base.
- Generación de utilidades de diagnóstico y scripting de seguridad: el proyecto declara orientación a ciberseguridad; podría emplearse en entornos controlados (laboratorios, CTFs) para redactar scripts de análisis, siempre con revisión humana.
- Base para iteraciones posteriores del proyecto CYBERBRAIN: al ser la "fase 1", puede servir como punto de partida para adaptadores sucesivos o para comparar el efecto de distintas fases de entrenamiento.
- Evaluación comparativa de adaptadores LoRA: investigadores pueden medir la degradación o mejora respecto al base en tareas de código usando sus propios conjuntos de evaluación, dado que no hay benchmarks públicos.
- Integración en pipelines de generación de documentación técnica: el modelo puede redactar explicaciones de código y comentarios en proyectos internos, con revisión obligatoria por la ausencia de datos de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 0,5 GB; los requisitos reales vienen determinados por el modelo base Qwen2.5-Coder-7B-Instruct.
- VRAM estimada para el base en fp16: aproximadamente 14-16 GB, incluyendo overhead de activaciones y caché KV.
- VRAM estimada con cuantización de 8 bits: en torno a 8-9 GB; con 4 bits (GPTQ/AWQ/GGUF Q4): aproximadamente 5-6 GB.
- GPU recomendadas: A100 40/80 GB o H100 para servicio de alta concurrencia; RTX 4090 (24 GB) o RTX 3090 para fp16 en una sola tarjeta; RTX 4060 Ti 16 GB o superiores para cuantización 8 bits.
- Cabe en GPU de consumo con cuantización 4 bits en tarjetas de 8 GB o más, con contexto limitado.
- Opciones de despliegue: carga del adaptador con PEFT + Transformers; fusión del adaptador en el base y servicio con vLLM o TGI; conversión a GGUF para llama.cpp u Ollama (requiere fusionar previamente el LoRA).
- Latencia y throughput: no disponibles; dependen del hardware, la cuantización y el backend.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CYBERBRAIN-27B-PHASE1-7B (este) | 7B base + LoRA | no disponible | Código / ciberseguridad (declarada) | no disponible | Hugging Face, 0 descargas |
| Qwen2.5-Coder-7B-Instruct | 7B | no disponible en esta ficha | Código general | no disponible en esta ficha | Hugging Face, ampliamente utilizado |
| Adaptadores LoRA comunitarios sobre Qwen2.5-Coder | 7B base + LoRA | depende del base | Variable según autor | variable | Hugging Face |

No se dispone de datos de rendimiento del adaptador que permitan una comparación cuantitativa con alternativas. La comparación relevante es frente a su propio modelo base: el adaptador no documenta mejoras medibles ni conjuntos de evaluación.

## Limitaciones y advertencias

- El nombre del repositorio induce a error: sugiere 27B parámetros cuando el modelo base es de 7B y lo distribuido es solo un adaptador LoRA.
- Ausencia total de benchmarks, datos de entrenamiento y evaluación: no hay evidencia pública de que el adaptador mejore al base en ninguna tarea.
- Licencia no especificada: no puede confirmarse el uso comercial; además, la licencia del modelo base Qwen2.5-Coder-7B-Instruct debe respetarse al combinar ambos.
- Idiomas no documentados; el comportamiento multilingüe es incierto.
- Riesgo de alucinación inherente a los modelos de 7B, sin datos que permitan acotarlo.
- La orientación declarada a ciberseguridad ofensiva implica riesgos de uso indebido; no se documentan salvaguardas.
- Sesgos desconocidos: no se ha publicado ninguna evaluación de sesgo o toxicidad.
- Proyecto de autor individual, con 0 descargas y 0 likes: sin comunidad, sin mantenimiento demostrado y sin garantías de soporte.
- El repositorio de GitHub menciona una arquitectura MoE modular que no se refleja en los pesos publicados; conviene no asumir esas capacidades.
- Para producción, es imprescindible una evaluación propia y una revisión humana de las salidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Safinul/CYBERBRAIN-27B-PHASE1-7B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Repositorio del proyecto en GitHub: https://github.com/safinulsafin0-byte/CYBERBRAIN
- Otra fase del proyecto (PHASE7-FINAL): https://huggingface.co/Safinul/CYBERBRAIN-PHASE7-FINAL
- TRL (framework de entrenamiento): https://github.com/huggingface/trl
