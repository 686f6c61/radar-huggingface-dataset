# shininnng/llm-course-hw3-tinyllamma-qlora

## Resumen

El modelo `shininnng/llm-course-hw3-tinyllamma-qlora` es un ajuste fino (fine-tuning) de la familia TinyLlama, publicado en Hugging Face por el usuario shininnng como parte de un trabajo de curso sobre LLM. El identificador del repositorio indica explícitamente que se ha aplicado QLoRA (quantized low-rank adaptation) sobre el modelo base TinyLlama, una técnica de ajuste eficiente en parámetros que congela los pesos originales cuantizados y entrena adaptadores de bajo rango. No se dispone de información pública sobre el conjunto de datos de ajuste, el objetivo concreto del entrenamiento ni las hiperparámetros utilizados.

La relevancia de esta ficha es limitada: se trata de un artefacto educativo, no de un modelo de producción. La model card es la plantilla automática de Hugging Face sin cumplimentar (todos los campos indican `[More Information Needed]`), el repositorio no tiene descargas ni likes, y la licencia y los idiomas no están declarados. Cualquier evaluación seria del modelo requiere inspeccionar los pesos directamente y ejecutar pruebas propias.

Por tanto, esta ficha documenta lo que se puede inferir de forma verificable del identificador, las etiquetas y la librería declarada, y marca explícitamente como «no disponible» todo aquello que el autor no ha publicado. Se recomienda tratar el modelo como un experimento de laboratorio y no como un componente listo para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (inferida de la familia TinyLlama; el autor no la declara) |
| Parametros totales | no disponible (TinyLlama base: 1,1 mil millones; el adaptador QLoRA añade un número no especificado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TinyLlama base: 2048 tokens; el autor no confirma que se conserve) |
| Tipos de cuantizacion | QLoRA implica cuantización del modelo base durante el entrenamiento (normalmente 4 bits NF4); no se publican los artefactos cuantizados resultantes |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (la librería declarada es `transformers`; el repositorio no especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El nombre del repositorio sugiere un ajuste fino con QLoRA sobre TinyLlama. QLoRA combina la cuantización del modelo base a 4 bits (habitualmente NF4 con doble cuantización) con adaptadores LoRA de bajo rango entrenados en precisión superior, lo que permite ajustar modelos de tamaño moderado en GPUs de consumo. TinyLlama es un transformer decoder-only de aproximadamente 1,1 mil millones de parámetros, entrenado sobre unos 3 billones de tokens según su documentación pública, con una ventana de contexto de 2048 tokens.

Sin embargo, el autor no publica ningún detalle del procedimiento: ni el dataset, ni el número de tokens de ajuste, ni el rango y alpha de los adaptadores, ni si hubo RLHF o DPO. La model card es la plantilla por defecto de Hugging Face, lo que impide verificar incluso que el ajuste se completara correctamente. No se declara ninguna innovación técnica adicional (decodificación especulativa, atención lineal, mezcla de expertos, etc.).

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base TinyLlama; el alcance real tras el ajuste es desconocido.
- Razonamiento y código: no disponible; no hay evidencia publicada de que el ajuste haya mejorado estas capacidades.
- Soporte de tool calling o function calling: no disponible; no se declara.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el autor no declara idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible; el repositorio no las menciona.

## Casos de uso

- Reproducción de un ejercicio académico de QLoRA: el modelo sirve como referencia para estudiantes que quieran inspeccionar cómo se estructura un adaptador LoRA publicado en el Hub, comparando la configuración con la de otros repositorios del mismo curso.
- Prueba de concepto de ajuste eficiente en una GPU de consumo: dado su tamaño reducido (heredado de TinyLlama), puede cargarse en tarjetas con 8-16 GB de VRAM para experimentar con técnicas de cuantización y adaptadores.
- Base para un segundo ajuste supervisado: si el adaptador es válido, podría combinarse con LoRA adicional sobre un dataset propio, aunque la falta de documentación obliga a validar primero su calidad.
- Evaluación comparativa de técnicas de ajuste: útil en un entorno de investigación para medir la degradación o mejora frente al TinyLlama original en tareas controladas.
- Docencia sobre riesgos de publicación: ejemplifica un caso de model card sin cumplimentar y sirve para ilustrar buenas prácticas de documentación de modelos.
- Prototipado interno sin requisitos de licencia: al no declararse licencia, solo es apto para uso estrictamente personal o educativo hasta aclarar los términos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; como referencia, un modelo de ~1,1 mil millones de parámetros en fp16 requiere aproximadamente 2,2 GB de pesos, y en 4 bits alrededor de 0,7-1 GB, más el overhead de activaciones y KV cache.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM podría ejecutarlo en cuantización baja.
- ¿Cabe en GPU de consumo? Probablemente sí (RTX 3060, RTX 4060, RTX 4090), pero el autor no lo confirma ni publica artefactos GGUF.
- Opciones de despliegue: la librería declarada es `transformers`; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI, y al no haber pesos GGUF publicados, llama.cpp y Ollama no son utilizables directamente.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| shininnng/llm-course-hw3-tinyllamma-qlora | no disponible (base ~1,1 B) | no disponible | no disponible | Hugging Face, 0 descargas |
| TinyLlama/TinyLlama-1.1B-Chat-v1.0 | ~1,1 B | 2048 | Apache 2.0 | Hugging Face, ampliamente usado |
| Qwen2.5-1.5B-Instruct | ~1,5 B | 32 768 | Apache 2.0 | Hugging Face, muy usado |
| SmolLM2-1.7B-Instruct | ~1,7 B | 8192 | Apache 2.0 | Hugging Face, muy usado |

La comparación de rendimiento no está disponible para el modelo objeto de esta ficha, ya que no publica benchmarks. Los tres alternativos cuentan con documentación completa, licencia clara y evaluaciones publicadas, lo que los hace preferibles para cualquier uso real.

## Limitaciones y advertencias

- La model card está sin cumplimentar: no hay información sobre datos de entrenamiento, sesgos, evaluación ni uso previsto.
- Riesgo elevado de alucinación y de comportamiento impredecible, al desconocerse el dataset de ajuste y su calidad.
- Licencia no declarada: no se puede asumir permiso para uso comercial; en la práctica, debe considerarse restringido hasta que el autor lo aclare.
- Idiomas no declarados: no se puede garantizar un rendimiento aceptable en castellano ni en ningún otro idioma.
- Contexto no confirmado: aunque el base soporta 2048 tokens, el ajuste podría haber alterado la ventana efectiva.
- Sin descargas ni validación comunitaria: no hay evidencia de que el modelo funcione correctamente ni de que los pesos estén completos.
- No se publican artefactos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos de inferencia optimizados.
- Fecha de creación futura (2026-11-19) en los metadatos: conviene verificar la integridad del repositorio antes de descargarlo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/shininnng/llm-course-hw3-tinyllamma-qlora
- Paper de QLoRA (referencia técnica de la técnica indicada en el nombre): https://arxiv.org/abs/2305.14314
- Paper de LoRA: https://arxiv.org/abs/2106.09685
- Modelo base TinyLlama (referencia de la familia): https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Calculadora de impacto ambiental citada en la model card: https://mlco2.github.io/impact
- Paper de Lacoste et al. (2019) citado en la model card: https://arxiv.org/abs/1910.09700
