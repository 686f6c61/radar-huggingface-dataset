# AlekseyCalvin/BISTRO_Decision_ckpt8_16_test

## Resumen

BISTRO_Decision_ckpt8_16_test es un adaptador LoRA publicado por AlekseyCalvin sobre el modelo base SmolLM2-135M de HuggingFaceTB. Se trata de un artefacto experimental orientado a una tarea de decisión/clasificación, entrenado íntegramente en CPU dentro de la herramienta Small LM Bistro v2.2. El repositorio contiene únicamente los pesos del adaptador en formato safetensors bajo la librería PEFT, con un tamaño declarado de 0.0 GB, lo que confirma que no incluye los pesos completos del modelo base.

El interés del modelo es fundamentalmente metodológico: documenta un flujo de ajuste fino con LoRA de rango 8 sobre las proyecciones q_proj y v_proj, usando el dataset LocalLLaMA/typed-decisions con solo 32 filas de entrenamiento y un optimizador CPUBlockwiseQuantizedAdamW. El entrenamiento completo consta de 17 pasos ejecutados en 330,7 segundos sobre 2 vCPUs Xeon, con checkpoints guardados en los pasos 8 y 16. La pérdida final registrada es de 18,3421, un valor muy alto que sugiere un ajuste incompleto o un problema de configuración.

Por tanto, no es un modelo pensado para producción ni para uso general, sino una prueba de concepto reproducible en hardware muy modesto. Su relevancia actual radica en demostrar que es posible ejecutar pipelines de PEFT/TRL en CPU, no en sus capacidades lingüísticas, que no están documentadas ni evaluadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre SmolLM2-135M (transformer decoder); rango 8, alpha 16, targets q_proj y v_proj |
| Parametros totales | Base: 135M (SmolLM2-135M); adaptador: no disponible (repo de 0.0 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; no se documenta cuantizacion del base) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

La arquitectura es un adaptador LoRA de rango 8 y alpha 16 aplicado sobre las proyecciones q_proj y v_proj del modelo base SmolLM2-135M. La configuración emplea `responses_only=True`, lo que implica que la pérdida se calcula únicamente sobre los tokens de respuesta. El optimizador es CPUBlockwiseQuantizedAdamW con learning rate 2,00e-04 y scheduler coseno. El dataset es LocalLLaMA/typed-decisions, cargado en modo streaming y con shuffle activado, con un total de 32 filas de entrenamiento. Los checkpoints se guardaron en los pasos 8 y 16 con `save_strategy=steps`, `save_steps=8`, `hub_strategy=every_save` y `optimizer_state=True`.

El proceso completo constó de 17 pasos ejecutados en 330,7 segundos (19,45 s/paso) sobre 2 vCPUs Xeon, con una pérdida final de 18,3421. No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o mezclas de expertos. El nombre del repositorio (`ckpt8_16_test`) y la etiqueta `test` indican que se trata de una ejecución de prueba con dos checkpoints intermedios, no de un modelo final validado.

## Capacidades

- Clasificación o toma de decisión sobre entradas cortas, correspondiente a la tarea declarada `decision-/-classification`.
- Ajuste fino sobre el modelo base SmolLM2-135M, heredando las capacidades limitadas de un modelo de 135M parámetros.
- No hay evidencia documentada de soporte de tool calling ni function calling.
- No hay evidencia documentada de capacidades de agente ni de razonamiento multi-paso.
- No hay información sobre capacidades multilingües ni sobre idiomas cubiertos.
- No se documentan capacidades especiales como modo thinking, visión o audio.
- El checkpoint final disponible corresponde al paso 16, con pérdida de 18,3421.

## Casos de uso

- Prototipado de clasificación binaria o de decisión: el adaptador sirve para experimentar con un pipeline mínimo de clasificación sobre SmolLM2-135M sin requerir GPU.
- Pruebas de herramientas PEFT y TRL en CPU: permite validar la integración de LoRA, el guardado de checkpoints y la subida al Hub en un entorno de 2 vCPUs.
- Evaluación de optimizadores cuantizados por bloques: el uso de CPUBlockwiseQuantizedAdamW lo convierte en un banco de pruebas para comparar este optimizador frente a AdamW estándar en hardware sin acelerador.
- Docencia y aprendizaje de ajuste fino: al caber en CPU y tener un dataset de 32 filas, es adecuado para talleres introductorios sobre LoRA y evaluación de pérdida.
- Reproducción de experimentos de bajo coste: investigadores sin acceso a GPU pueden replicar el entrenamiento completo en minutos.
- Base para experimentos controlados de hiperparámetros: al ser un adaptador pequeño y con configuración explícita, facilita aislar el efecto de learning rate o rango en la pérdida.
- Verificación de pipelines de publicación en el Hub: el uso de `hub_strategy=every_save` lo hace útil para probar la sincronización de checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado es la pérdida final de entrenamiento (18,3421) tras 17 pasos, junto con la velocidad de 19,45 s/paso sobre 2 vCPUs Xeon. No se proporcionan métricas de exactitud, F1, MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: al partir de un modelo base de 135M parámetros, las estimaciones aproximadas son de unos 0,54 GB en fp32, 0,27 GB en fp16 y 0,14 GB en int8, sin contar overhead de activaciones ni del adaptador (estimaciones derivadas del recuento de parámetros, no publicadas por el autor).
- GPU recomendadas: no se especifican; cualquier GPU consumer con más de 1 GB de VRAM debería poder cargar el modelo base en precisión reducida.
- Cabe en GPU consumer: sí, previsiblemente en cualquier RTX o GTX moderna, e incluso en iGPU con suficiente memoria compartida.
- Ejecución en CPU: viable; el propio entrenamiento se realizó en 2 vCPUs Xeon, por lo que la inferencia en CPU es factible.
- Opciones de despliegue: PEFT + transformers para cargar el adaptador sobre el base; conversión a GGUF para llama.cpp u Ollama; vLLM o TGI si se fusiona el adaptador con el modelo base.
- Latencia y throughput: no disponibles para inferencia. El único dato es el coste de entrenamiento (19,45 s/paso en 2 vCPUs).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| BISTRO_Decision_ckpt8_16_test | Base 135M + adaptador LoRA (r=8) | No disponible | No disponible | Safetensors (PEFT) | Checkpoint experimental, 32 filas de entrenamiento, perdida final 18,3421 |
| SmolLM2-135M (base) | 135M | No disponible | No disponible | Safetensors | Modelo base sin ajuste; capacidades generales de un LM pequeño |
| Otros fine-tunes de SmolLM2-135M | No disponible | No disponible | No disponible | No disponible | No se dispone de información suficiente para comparar |

No se dispone de datos verificables sobre modelos alternativos equivalentes en la información proporcionada. Cualquier comparación de rendimiento con otros fine-tunes requeriría benchmarks que el autor no ha publicado.

## Limitaciones y advertencias

- El dataset de entrenamiento tiene solo 32 filas, lo que hace prácticamente imposible que el adaptador generalice fuera de la distribución de esos ejemplos.
- La pérdida final de 18,3421 es muy elevada y sugiere que el ajuste no ha convergido o que la configuración de entrenamiento o de datos presenta problemas.
- El repositorio está etiquetado como `test` y contiene checkpoints intermedios (pasos 8 y 16), no un modelo final validado.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido; en ausencia de licencia, debe asumirse riesgo legal.
- No se declaran idiomas soportados ni se han publicado evaluaciones de sesgo o alucinación.
- El modelo es un adaptador LoRA: no funciona de forma autónoma y requiere descargar y cargar el modelo base SmolLM2-135M.
- El tamaño del repositorio (0.0 GB) y la ausencia de descargas o likes indican que no ha sido validado por la comunidad.
- No hay información sobre el proceso de alineación (RLHF, DPO) ni sobre filtrado de datos.
- No debe usarse en producción sin una evaluación propia sobre el dominio objetivo y sin aclarar la licencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AlekseyCalvin/BISTRO_Decision_ckpt8_16_test
- Modelo base SmolLM2-135M: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Dataset referenciado en la model card: LocalLLaMA/typed-decisions (sin URL proporcionada)
- Paper, blog o demo: no disponibles en la información proporcionada
