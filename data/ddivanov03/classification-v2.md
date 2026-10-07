# Ddivanov03/classification-v2

## Resumen

classification-v2 es un modelo de clasificación basado en una implementación propia de Tiny Transformer, publicado por el usuario Ddivanov03 en Hugging Face. El repositorio contiene código Python transparente y pruebas de humo reproducibles, pero el checkpoint incluido (`model.safetensors`) es una inicialización válida de 49.600 parámetros que el propio autor declara explícitamente como **no entrenada** y no auditada. No se reclama ninguna puntuación de benchmark.

Su relevancia es, por tanto, acotada y de carácter experimental: no es un modelo listo para producción, sino un andamiaje para experimentar con arquitecturas transformer de clasificación a escala mínima. La configuración etiquetada como "large" dentro de la familia Tiny Transformer emplea atención multi-query, fusión con gating, activación mish y normalización layernorm, y se acompaña de una receta de experimento por defecto basada en el optimizador novograd con schedule polinomial.

Con 49.600 parámetros (aproximadamente 0,05 M) y un repositorio de menos de 0,1 GB, el modelo cabe en cualquier dispositivo, incluido un microcontrolador. Sin embargo, la información disponible no documenta la longitud de contexto, los idiomas, el espacio de etiquetas de salida ni ningún resultado de evaluación, lo que impide considerarlo una solución desplegable sin un entrenamiento previo por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tiny Transformer (implementación propia) con atención multi-query, fusión con gating, activación mish y normalización layernorm |
| Parametros totales | 49.600 (≈ 0,05 M), según `model.safetensors` |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no se documentan variantes GGUF, AWQ, GPTQ ni int8) |
| Idiomas soportados | no disponible (el autor no documenta idioma ni tokenizador) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), con código PyTorch en `pipeline.py` |

## Arquitectura y entrenamiento

La arquitectura es un transformer de tipo encoder a escala Tiny Transformer, en configuración "large" dentro de esa familia. Los elementos declarados en la model card son atención multi-query, fusión mediante gating, función de activación mish y normalización layernorm. Se trata de una implementación personalizada, por lo que las APIs genéricas de carga automática de librerías como Transformers requieren un adaptador explícito antes de poder instanciar el modelo. Los ficheros `config.json` y `training_args.json` recogen, respectivamente, los ajustes de arquitectura generados y la receta de experimento por defecto.

No se ha publicado ningún entrenamiento completado. El autor indica que `model.safetensors` es un checkpoint de inicialización para pruebas de humo y no un checkpoint entrenado con métricas de referencia. La receta por defecto usa el optimizador novograd con un schedule polinomial, pero se presenta como valores de partida del script y no como evidencia de una ejecución finalizada. No hay información sobre número de tokens, composición del dataset, corpus multilingüe, ni sobre fases de ajuste como RLHF, DPO o SFT. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, SSM o arquitecturas híbridas).

## Capacidades

- Propagación hacia delante de un transformer de clasificación: el modelo puede ejecutar inferencia y producir una salida de clasificación, pero la dimensionalidad de la cabeza de clasificación y el conjunto de etiquetas no están documentados en la información disponible.
- Inicialización reproducible: sirve como punto de partida determinista para entrenar desde cero con la receta incluida (novograd + schedule polinomial).
- Pruebas de humo de pipelines: permite validar de extremo a extremo scripts de entrenamiento, carga de safetensors y serialización de configuraciones sin coste computacional relevante.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no, se trata de un modelo de clasificación de escala mínima, sin capacidades generativas documentadas.
- Capacidades multilingües: no disponible; no se documenta idioma ni vocabulario.
- Capacidades especiales (modo thinking, visión, audio): ninguna documentada.
- Rendimiento tras entrenamiento: no disponible; cualquier capacidad real dependerá del dataset y del procedimiento que aplique el usuario, no del checkpoint publicado.

## Casos de uso

- Prueba de humo en integración continua: el modelo se puede cargar en un test de CI para verificar que la serialización safetensors, el parseo de `config.json` y el forward pass funcionan tras cada cambio en el repositorio, con un coste de cómputo prácticamente nulo (≈ 0,19 MB en fp32).
- Plantilla de arquitectura para investigación: sirve como base de código legible para estudiar cómo se combinan atención multi-query, fusión con gating y layernorm en un transformer de clasificación, y para modificarlo con fines didácticos.
- Búsqueda de hiperparámetros a pequeña escala: al caber en CPU y entrenarse en segundos o minutos, permite barrenar configuraciones de optimizador (novograd) y schedules (polinomial) antes de trasladar los hallazgos a modelos mayores.
- Baseline de capacidad emparejada: en una evaluación metodológicamente correcta, se puede usar como baseline de baja capacidad frente a arquitecturas mayores sobre el mismo split etiquetado y los mismos seeds, tal como sugiere la guía de evaluación del propio autor.
- Validación de infraestructura de datos: útil para comprobar que un pipeline de tokenización, etiquetado y batching produce tensores con las formas esperadas antes de escalar a un modelo entrenado real.
- Docencia y formación: ejemplo mínimo de repositorio de modelo en Hugging Face, con licencia MIT, que ilustra el flujo completo de publicación (pesos, configuración, argumentos de entrenamiento y README).
- Base para ajuste fino sobre una tarea concreta: un equipo puede tomar la inicialización y entrenarla con su propio corpus etiquetado, siempre que documente por separado los resultados obtenidos, tal como exige la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explícita que las afirmaciones de benchmark se omiten deliberadamente y que el checkpoint incluido no está entrenado, por lo que no existen cifras de MMLU, HumanEval, GSM8K, GLUE ni de ninguna otra métrica. El autor propone, como guía, que una primera evaluación útil use un split etiquetado específico de la tarea, reporte la métrica objetivo a lo largo de al menos tres seeds e incluya un baseline de capacidad emparejada, conservando los logs de entrenamiento y las versiones de entorno.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente despreciable. Con 49.600 parámetros, los pesos ocupan aproximadamente 0,19 MB en fp32 (49.600 × 4 bytes), 0,10 MB en fp16 y 0,05 MB en int8. Cualquier GPU con más de 1 GB de memoria es sobredimensionada para este modelo.
- GPU recomendadas: ninguna en concreto; el modelo puede ejecutarse en CPU. Cualquier GPU consumer (por ejemplo, GTX 1650, RTX 3060, RTX 4090) o profesional (A100, H100) lo ejecuta sin cuello de botella por memoria.
- Cabe en consumer GPU: sí, en cualquier GPU consumer, e incluso en CPU, Raspberry Pi o dispositivos embebidos.
- Opciones de despliegue: PyTorch en carga directa mediante el código de `pipeline.py`; exportación a ONNX o TorchScript como vía razonable. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la carga mediante APIs genéricas de Transformers requiere un adaptador explícito según indica el autor.
- Latencia y throughput estimados: no disponible. No se publican mediciones; con esta escala de parámetros la inferencia por lote corto se sitúa en el orden de microsegundos a pocos milisegundos en CPU, pero se trata de una estimación basada en el tamaño, no de un dato medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Estado |
|---|---|---|---|---|---|
| classification-v2 (Ddivanov03) | 49.600 (≈ 0,05 M) | no disponible | clasificación (espacio de etiquetas no documentado) | MIT | checkpoint de inicialización, sin entrenar |
| DistilBERT base (referencia) | ≈ 66 M | 512 tokens | clasificación de texto y NLU | Apache 2.0 | entrenado y ampliamente validado |
| TinyBERT, variante de 4 capas (referencia) | ≈ 14,5 M | 512 tokens | clasificación de texto y NLU | Apache 2.0 | destilado, con resultados publicados en GLUE |
| TF-IDF + regresión logística (referencia) | no aplica | documento completo | clasificación de texto | según implementación | baseline clásico entrenable en minutos |

La comparación anterior es únicamente de escala y de tipo de tarea: classification-v2 es entre dos y tres órdenes de magnitud menor que los transformers de clasificación habituales, y a diferencia de ellos no cuenta con pesos entrenados ni métricas publicadas, por lo que no es comparable en rendimiento con ninguna de las alternativas. Los datos de las filas de referencia corresponden a especificaciones públicas ampliamente conocidas y se incluyen solo como contexto de magnitud.

## Limitaciones y advertencias

- El checkpoint publicado no está entrenado. Cualquier uso directo produce salidas sin valor predictivo; no debe desplegarse en producción bajo ninguna circunstancia sin un entrenamiento previo.
- No ha sido auditado en robustez, equidad ni transferencia de dominio, tal como reconoce el propio autor. No existen estudios de sesgo asociados.
- Riesgo de alucinación y de salidas arbitrarias: al no estar entrenado, la cabeza de clasificación emite logits no calibrados; no deben interpretarse como probabilidades significativas.
- No se documentan la longitud de contexto, el tokenizador, los idiomas soportados ni el espacio de etiquetas, lo que impide planificar su integración sin inspeccionar `config.json` y el código fuente.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución y sin garantías. Sin embargo, el autor advierte de que deben revisarse por separado los términos de los datos de origen cuando el repositorio se use con conjuntos de datos externos.
- Ecosistema limitado: al ser una implementación personalizada, no funciona con las APIs de carga automática habituales sin un adaptador explícito, lo que añade trabajo de integración y riesgo de incompatibilidades.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad ni informes de terceros.
- Cualquier resultado obtenido con un checkpoint futuro entrenado debe documentarse de forma separada de los valores por defecto publicados aquí, según exige la propia model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ddivanov03/classification-v2
- Ficheros del repositorio: `pipeline.py` (artefacto principal), `README.md`, `config.json` (configuración de arquitectura), `training_args.json` (receta de experimento por defecto), `model.safetensors` (checkpoint de inicialización)
- Los resultados de la búsqueda web proporcionada corresponden a DINOv2 y DINOv3 (Meta), modelos de visión autosupervisada sin relación con este repositorio, por lo que no se incluyen como enlaces relevantes. No se han encontrado papers, blogs, repositorios ni demos asociados a classification-v2.
