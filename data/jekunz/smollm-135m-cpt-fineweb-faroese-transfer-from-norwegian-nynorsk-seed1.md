# jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-norwegian-nynorsk-seed1

## Resumen

El modelo `jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-norwegian-nynorsk-seed1` es un ajuste fino de SmolLM2-135M-Instruct desarrollado por el usuario jekunz como parte de una investigación sobre transferencia lingüística entre lenguas germánicas nórdicas de bajos recursos. El autor parte de un modelo previamente adaptado al noruego nynorsk y lo entrena a continuación sobre el subconjunto en feroés (código ISO `fo`) del corpus FineWeb-2, con el objetivo de evaluar si el conocimiento adquirido en una lengua cercana facilita la adaptación a otra con muchos menos datos disponibles.

Se trata de un modelo decoder-only de tipo Llama con 134.515.008 parámetros (aproximadamente 135 millones), pensado exclusivamente para generación de texto y entrenado con una longitud máxima de contexto de 2048 tokens. Por su tamaño reducido, es adecuado para experimentación en hardware modesto, prototipado rápido y estudios académicos sobre multilingüismo de bajos recursos, más que para despliegues de producción con requisitos de calidad exigentes.

La relevancia actual del modelo es fundamentalmente metodológica: documenta un experimento de transferencia secuencial entre lenguas emparentadas (nynorsk → feroés) sobre un modelo pequeño, con una configuración de entrenamiento publicada de forma explícita (learning rate, scheduler, batch efectivo, semilla). El autor indica que forma parte de una serie de tres semillas (esta es la semilla 1) y que el modelo no ha sido evaluado de forma amplia todavía.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, base SmolLM2-135M-Instruct) |
| Parametros totales | 134.515.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Feroés (`fo`) como objetivo del ajuste; el modelo base tiene capacidades multilingües no documentadas en esta ficha |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Llama, inicializado desde SmolLM2-135M-Instruct y ajustado mediante entrenamiento continuado (continued pretraining) en dos fases secuenciales: primero una época sobre el subconjunto en noruego nynorsk de FineWeb-2 y después cinco épocas sobre el subconjunto en feroés del mismo corpus. La configuración de entrenamiento publicada incluye learning rate de 5e-4, scheduler coseno, warmup ratio de 0.05, batch size de 8 con 32 pasos de acumulación de gradiente (batch efectivo de 256), longitud máxima de 2048 tokens y ejecución sobre una única GPU A100 de 40 GB. Esta ficha corresponde a la semilla 1 de tres ejecuciones con la misma configuración.

No se documentan en la información disponible detalles sobre el número total de tokens procesados, la composición exacta del dataset más allá de su procedencia (FineWeb-2), ni si se aplicaron etapas de RLHF, DPO o ajuste supervisado adicional tras el entrenamiento continuado. Tampoco se describen innovaciones arquitectónicas propias: se heredan las del modelo base SmolLM2-135M-Instruct.

## Capacidades

- Generación de texto en feroés, lengua objetivo del ajuste fino.
- Generación de texto conversacional, ya que el punto de partida es un modelo Instruct.
- Capacidades multilingües heredadas del modelo base, no evaluadas ni documentadas en esta ficha.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte específico de agentes o razonamiento multi-paso.
- No se documenta modo thinking, visión, audio ni otras modalidades.
- No se documenta una evaluación sistemática de calidad en feroés.

## Casos de uso

- Investigación sobre transferencia lingüística entre lenguas nórdicas: el modelo sirve como punto de comparación en estudios que midan si el preentrenamiento en nynorsk mejora el rendimiento en feroés frente a un ajuste directo desde el modelo base.
- Experimentos de ablación con semillas: al formar parte de una serie de tres semillas, permite estimar la varianza de los resultados de entrenamiento en configuraciones idénticas.
- Generación de texto sintético en feroés para aumento de datos: con 135 millones de parámetros puede producir borradores que, tras revisión humana, amplíen corpus pequeños en esta lengua.
- Prototipado rápido en hardware de consumo: su tamaño reducido permite iterar sobre pipelines de generación de texto en una sola GPU consumer antes de escalar a modelos mayores.
- Evaluación de técnicas de continued pretraining: la configuración de entrenamiento está documentada de forma explícita (learning rate, scheduler, batch efectivo, épocas), lo que facilita reproducir o modificar el experimento.
- Docencia y formación: adecuado para demostrar en cursos el flujo completo de ajuste de un modelo Instruct pequeño sobre un corpus monolingüe de bajos recursos.
- Pruebas de infraestructura de despliegue: sirve para validar integraciones con transformers y text-generation-inference en entornos de prueba sin coste elevado de cómputo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el modelo no ha sido evaluado de forma amplia.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): en torno a 0,54 GB solo para pesos, más overhead de activaciones y KV cache.
- VRAM estimada en fp16/bf16: aproximadamente 0,27 GB para pesos, más overhead.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,14 GB para pesos; en 4 bits, en torno a 0,07 GB, sin contar overhead.
- GPU recomendadas: cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4060, RTX 4090) es más que suficiente; también cabe en CPU para inferencia no interactiva.
- Cabe holgadamente en GPU consumer e incluso en entornos con poca memoria.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), y herramientas compatibles con safetensors; no se documentan pesos GGUF oficiales, aunque la conversión a llama.cpp u Ollama sería viable por la arquitectura Llama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-norwegian-nynorsk-seed1) | 134.515.008 | 2048 | Apache 2.0 | Hugging Face | Ajuste en feroés con transferencia desde nynorsk; sin benchmarks publicados |
| SmolLM2-135M-Instruct (modelo base de partida) | ~135 M | no disponible en esta ficha | Apache 2.0 | Hugging Face | Modelo Instruct generalista; referencia para medir la ganancia del ajuste |
| jekunz/smollm-135m-cpt-fineweb-norwegian-nynorsk (modelo base directo) | ~135 M | no disponible en esta ficha | Apache 2.0 | Hugging Face | Etapa intermedia del entrenamiento secuencial; útil como ablación |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: el autor advierte que no ha sido evaluado de forma amplia, por lo que no se recomienda su uso en producción sin una evaluación propia.
- Riesgo elevado de alucinación y de texto incoherente, inherente a un modelo de 135 millones de parámetros entrenado con un presupuesto limitado.
- Sesgos desconocidos: no se documenta ningún análisis de sesgos ni de contenido nocivo.
- Cobertura lingüística limitada: el ajuste se centra en feroés; el comportamiento en otros idiomas no está documentado y puede degradarse respecto al modelo base.
- Ventana de contexto corta (2048 tokens), insuficiente para tareas que requieran documentos largos.
- Sin datos sobre el volumen de tokens de entrenamiento ni sobre la calidad final del corpus FineWeb-2 en feroés.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de SmolLM2 conviene verificar las condiciones del modelo base y de los datos de FineWeb-2 antes de un despliegue comercial.
- Al formar parte de una serie de semillas, los resultados pueden variar entre ejecuciones; esta ficha corresponde únicamente a la semilla 1.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-norwegian-nynorsk-seed1
- Modelo base directo: https://huggingface.co/jekunz/smollm-135m-cpt-fineweb-norwegian-nynorsk
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Modelo base de la familia SmolLM2: no disponible en la información proporcionada
- Paper, blog o repositorio del autor: no disponible en la información proporcionada
