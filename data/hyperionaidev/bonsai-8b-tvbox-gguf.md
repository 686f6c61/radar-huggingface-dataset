# hyperionaidev/Bonsai-8B-tvbox-GGUF

## Resumen

Bonsai-8B-tvbox-GGUF es una redistribución cuantizada del modelo denso Bonsai-8B de PrismML, publicada por el desarrollador hyperionaidev dentro de su proyecto smolmaxxing. El modelo base es un transformer denso de aproximadamente 7.819 millones de parámetros, cuantizado a 1 bit (Q1_0) y empaquetado en formato GGUF para su ejecución en llama.cpp. La modificación principal respecto al original es la poda de la cabeza de salida (output head), reducida de 151.669 filas de vocabulario a 61.592 filas seleccionadas por frecuencia de token en un corpus inglés y multilingüe.

La relevancia de esta ficha es su enfoque extremo en eficiencia: el autor demuestra que el modelo completo (1,11 GB de pesos) cabe en aproximadamente 1 GB de RAM utilizable y se ejecuta a 5,2 tok/s en una Xiaomi TV Box S de tercera generación, con una CPU de 4 núcleos Cortex-A55. Esto lo sitúa en el nicho de inferencia en dispositivos de borde (edge) con recursos de memoria muy limitados, fuera del alcance de modelos de 8B en cuantizaciones convencionales de 4 bits.

El contexto de uso es, por tanto, la experimentación con LLM en hardware de consumo de gama baja. No está pensado como modelo de producción generalista: requiere un binario parcheado de llama.cpp y no carga en implementaciones estándar como Ollama o LM Studio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Bonsai-8B) |
| Parametros totales | 7.819.654.296 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1.024 tokens (configurado en el ejemplo de ejecución con `-c 1024`) |
| Tipos de cuantizacion | Q1_0 (1 bit), pesos copiados byte a byte del original; cachés KV en q8_0 |
| Idiomas soportados | no disponible (la cabeza podada se eligió con corpus inglés y multilingüe, sin lista explícita de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`b8-q1-hml.gguf`, 1,11 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es Bonsai-8B de PrismML, un transformer denso de unos 7.800 millones de parámetros. De la información disponible no se detallan los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) ni innovaciones arquitectónicas internas más allá de la cuantización. La contribución de esta publicación no es el entrenamiento, sino la adaptación para inferencia en hardware de borde.

La modificación técnica concreta es la poda de la cabeza de salida: se conservan 61.592 de las 151.669 filas del vocabulario, seleccionadas por frecuencia de token, y se añade un tensor `output_ids` que mapea los índices. Los pesos del cuerpo del modelo permanecen sin cambios en Q1_0. El runtime requiere un parche sobre llama.cpp (commit `8642541`, parche `llama.cpp-v0.8.0-tvbox.patch`) que implementa un kernel de multiplicación de matrices 1-bit basado en tablas de búsqueda (lookup-table) y un mecanismo de caché de repack (`GGML_REPACK_CACHE`) para mapear los pesos en memoria de forma residente.

## Capacidades

- Generación de texto conversacional en inglés y, presumiblemente, otros idiomas cubiertos por la cabeza podada, aunque no hay lista oficial.
- Inferencia con todos los pesos residentes en RAM (0,96 GB en modo headless).
- Ejecución en CPU sin GPU, mediante kernels 1-bit optimizados.
- La poda de la cabeza limita los tokens que el modelo puede *generar* a las 61.592 filas conservadas; los prompts pueden usar cualquier token del vocabulario completo.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking.
- No se documenta soporte multilingüe formal.

## Casos de uso

- Inferencia en dispositivos de borde con poca RAM: el caso documentado es una TV Box con 4 núcleos Cortex-A55 y ~1 GB de RAM utilizable, donde el modelo se ejecuta a 5,2 tok/s en chat real. Adecuado para asistentes locales mínimos en hardware embebido.
- Experimentación educativa con LLM en hardware de bajo coste: permite estudiar el comportamiento de un modelo de 8B cuantizado a 1 bit en un entorno reproducible y de código abierto.
- Prototipado de asistentes conversacionales offline: al no requerir GPU ni conectividad, sirve para demostraciones de chat local en ferias, aulas o entornos sin red.
- Investigación sobre cuantización extrema: la publicación incluye métricas de perplejidad en bits por byte (0,991 bpB global, 0,974 en las posiciones de la cabeza), útil para comparar técnicas de compresión.
- Benchmarking de kernels 1-bit: el repositorio smolmaxxing documenta la evolución de rendimiento por clase de tamaño, lo que permite evaluar optimizaciones de matmul con tablas de búsqueda.
- Pruebas de pipelines de CI para llama.cpp parcheado: verificar que el binario modificado carga y ejecuta el GGUF de forma consistente antes de desplegar en el dispositivo objetivo.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Throughput en chat real (TV Box S 3rd Gen) | 5,2 tok/s (rango 5,1-5,4 con llama-bench) |
| Throughput cerca de contexto completo (1.024 tokens) | 4,0 tok/s |
| Procesamiento de prompt | 5,8-6,1 tok/s |
| Calidad (perplejidad en bits/byte, menor es mejor) | 0,991 global; 0,974 en posiciones de la cabeza |
| RAM de pesos en modo headless | 0,96 GB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia es en CPU con pesos residentes en RAM (~0,96 GB en headless, 1,11 GB de archivo).
- RAM: al menos ~1 GB utilizable en el dispositivo objetivo; se recomienda desactivar el launcher de Android (modo headless) para liberar memoria.
- GPU recomendadas: no aplica; el modelo está diseñado para CPU. No se documenta ejecución en GPU.
- Cabe en hardware de consumo muy limitado: el caso validado es una Xiaomi TV Box S (3rd Gen) con 4× Cortex-A55.
- Opciones de despliegue: exclusivamente llama.cpp parcheado del repositorio smolmaxxing (`llama-server`). Ollama, LM Studio y llama.cpp estándar no cargan el archivo.
- Latencia y throughput: 5,2 tok/s en chat real y 4,0 tok/s cerca del límite de contexto de 1.024 tokens, según mediciones del autor.
- Caché de repack: ~1 GB en almacenamiento flash, escrita en la primera ejecución y mapeada en las posteriores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Bonsai-8B-tvbox-GGUF | 7,82B | 1.024 tokens (config. ejemplo) | Q1_0 (1 bit) | Apache-2.0 | Requiere llama.cpp parcheado; cabeza podada a 61.592 tokens |
| prism-ml/Bonsai-8B-gguf | 7,82B | no disponible | Q1_0 y otras del repo original | Apache-2.0 | Modelo original sin poda de cabeza; carga en llama.cpp estándar |
| prism-ml/Bonsai-8B-unpacked | 7,82B | no disponible | safetensors sin cuantizar | Apache-2.0 | Pesos completos, para re-cuantización o fine-tuning |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Requiere un binario de llama.cpp parcheado específico; no funciona con Ollama, LM Studio ni llama.cpp estándar. Esto complica el despliegue y la reproducibilidad.
- La cabeza de salida está podada a 61.592 tokens: el modelo no puede generar ningún token fuera de ese conjunto, lo que puede degradar la calidad en dominios con vocabulario especializado (código, nombres propios, idiomas poco representados).
- La cuantización a 1 bit implica una pérdida de calidad sustancial frente al modelo sin cuantizar; la métrica de 0,991 bits/byte es una perplejidad en inglés, no una evaluación de capacidades.
- Contexto efectivo limitado a 1.024 tokens en la configuración probada; no se documenta soporte para ventanas mayores.
- Idiomas soportados no documentados; el corpus de selección de cabeza es inglés y multilingüe, sin garantías por idioma.
- Riesgo de alucinación elevado por la compresión extrema; no recomendado para tareas que exijan precisión factual.
- No se documentan sesgos específicos, pero al ser un derivado de un modelo entrenado con datos web, es probable que herede sesgos del corpus original.
- Licencia Apache-2.0 permite uso comercial, pero la dependencia de un parche no oficial de llama.cpp debe evaluarse en producción.
- Las fechas de creación (2026-11-08) y actualización (2026-11-10) del repositorio son posteriores a la fecha actual; conviene verificar la vigencia de los enlaces.

## Enlaces

- Hugging Face: https://huggingface.co/hyperionaidev/Bonsai-8B-tvbox-GGUF
- Modelo base (GGUF): https://huggingface.co/prism-ml/Bonsai-8B-gguf
- Modelo base (unpacked): https://huggingface.co/prism-ml/Bonsai-8B-unpacked
- Repositorio smolmaxxing: https://github.com/hyperionaidev/smolmaxxing
- Write-up experimental (EXPERIMENT.md): https://github.com/hyperionaidev/smolmaxxing/blob/main/EXPERIMENT.md
- Scoreboard: https://github.com/hyperionaidev/smolmaxxing#scoreboard
- Quick start: https://github.com/hyperionaidev/smolmaxxing#quick-start
- llama.cpp: https://github.com/ggml-org/llama.cpp
