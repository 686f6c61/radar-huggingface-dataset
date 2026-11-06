# bcckfdn/cevher2-test-21

## Resumen

cevher2-test-21 es un modelo de lenguaje de 1.513.546.496 parámetros entrenado desde cero por el usuario bcckfdn, empleando la arquitectura de SmolLM2 (basada en Llama) y publicado bajo licencia Apache 2.0. El modelo está orientado a generación de texto conversacional y declara soporte para turco (tr) e inglés (en), con un vocabulario de 65.536 tokens y una longitud de contexto de 8.192 tokens.

Se trata de un entrenamiento desde cero (pretrained-from-scratch) sobre aproximadamente 40.957 millones de tokens, con una pérdida de validación mínima reportada de 2,7292. La arquitectura sigue el esquema transformer decoder-only de Llama con 34 capas, dimensión oculta de 1.792 y una configuración de atención con 28 cabezas de consulta y 7 cabezas clave/valor (GQA con ratio 4:1).

El interés del modelo radica en su carácter de experimento de preentrenamiento reproducible en un tamaño de ~1,5B parámetros, una franja en la que escasean los modelos entrenados desde cero para turco. No obstante, el repositorio no incluye información sobre benchmarks, datos de entrenamiento detallados ni procesos de alineación (RLHF/DPO), y cuenta con cero descargas y cero likes en el momento de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama (SmolLM2) |
| Parametros totales | 1.513.546.496 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Datos arquitectónicos adicionales declarados en la model card: 34 capas, dimensión oculta 1.792, 28 cabezas de consulta y 7 cabezas clave/valor, vocabulario de 65.536 tokens, 40.957 millones de tokens de entrenamiento y mejor pérdida de validación de 2,7292.

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder-only con atención de consultas agrupadas (GQA), en la que 28 cabezas de consulta comparten 7 cabezas clave/valor, lo que reduce el coste de memoria de la caché KV durante la inferencia. La dimensión oculta es de 1.792 y el modelo tiene 34 capas, configuración coherente con la familia SmolLM2 de Hugging Face, aunque en este caso el entrenamiento se ha realizado desde cero por el autor.

El preentrenamiento se llevó a cabo sobre aproximadamente 40.957 millones de tokens, según declara la model card, alcanzando una pérdida de validación de 2,7292. No se especifica la composición del corpus (proporción turco/inglés, fuentes, filtrado), ni si hubo fases posteriores de instrucción, RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o mecanismos de atención lineal.

## Capacidades

- Generación de texto autoregresiva en turco e inglés.
- Modelo base de preentrenamiento: no se documenta un ajuste por instrucciones ni modo conversacional verificado, pese a la etiqueta `conversational` del repositorio.
- Razonamiento y conocimiento general limitados por el volumen de entrenamiento (~41B tokens), inferior al de modelos de tamaño similar entrenados con billones de tokens.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües limitadas a turco e inglés según la model card.
- Capacidades de visión, audio o modo de pensamiento (thinking): no disponibles.

## Casos de uso

- Experimentación académica en preentrenamiento desde cero: el modelo sirve como referencia reproducible para estudiar el comportamiento de un transformer de ~1,5B parámetros entrenado con ~41B tokens, comparando curvas de pérdida y calidad con configuraciones similares.
- Investigación en procesamiento del lenguaje natural para turco: permite evaluar el rendimiento de un modelo base entrenado específicamente para este idioma en tareas de modelado del lenguaje y generación libre.
- Generación de texto creativo y completado en turco: adecuado para prototipos de escritura asistida donde no se requiera un modelo ajustado por instrucciones.
- Fine-tuning específico de dominio: al ser un modelo base de 1,5B parámetros con licencia Apache 2.0, puede ajustarse para tareas concretas (clasificación, extracción, resumen) con recursos moderados.
- Despliegue en entornos con recursos limitados: su tamaño permite inferencia en una única GPU consumer, lo que facilita prototipos y demostraciones locales.
- Base para experimentos de alineación: útil para estudiar técnicas de SFT, DPO o RLHF partiendo de un checkpoint de preentrenamiento controlado por el investigador.
- Evaluación comparativa de tokenizadores: su vocabulario de 65.536 tokens permite analizar el impacto del tokenizador en la eficiencia para turco frente a otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3 GB solo para pesos, más caché KV y activaciones; en la práctica, unos 4-6 GB con contexto moderado.
- VRAM estimada en cuantización de 8 bits: en torno a 1,6-2 GB para pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 0,8-1,2 GB para pesos.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para mayor throughput; cualquier GPU con al menos 6-8 GB de VRAM debería acomodar el modelo en fp16 con contexto moderado.
- Cabe en GPU consumer: sí, en tarjetas con 8 GB o más en fp16 y en tarjetas con 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers (soporte nativo declarado), text-generation-inference (etiqueta `text-generation-inference`), y potencialmente llama.cpp/Ollama si se generan pesos GGUF, aunque no se documentan conversiones oficiales.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| cevher2-test-21 | 1,51B | 8.192 | Apache 2.0 | tr, en | Entrenado desde cero, sin benchmarks publicados |
| SmolLM2-1.7B | 1,7B | 8.192 (ampliable) | Apache 2.0 | principalmente en | Modelo de referencia de Hugging Face con benchmarks publicados y ajuste por instrucciones |
| TinyLlama-1.1B | 1,1B | 2.048 | Apache 2.0 | en | Entrenado con ~3T tokens, ampliamente evaluado |
| Qwen2.5-1.5B | 1,5B | 32.768 | Apache 2.0 | multilingüe | Contexto mucho mayor y benchmarks publicados |

La comparación directa es limitada porque cevher2-test-21 no publica resultados de evaluación. Frente a SmolLM2-1.7B y TinyLlama-1.1B, su principal diferencia es el foco en turco y un volumen de entrenamiento notablemente menor (~41B tokens frente a billones en los modelos de referencia).

## Limitaciones y advertencias

- No se documentan evaluaciones de sesgo; al ser un modelo entrenado desde cero con corpus no especificado, el riesgo de sesgos lingüísticos y culturales es alto y desconocido.
- Riesgo elevado de alucinación y baja factualidad por el limitado volumen de preentrenamiento (~41B tokens) y la ausencia de alineación documentada.
- No hay evidencia de ajuste por instrucciones ni de formato conversacional verificado, pese a las etiquetas del repositorio; el uso en chat puede producir respuestas incoherentes.
- Contexto limitado a 8.192 tokens, inferior al de alternativas contemporáneas de tamaño similar.
- Cobertura lingüística restringida a turco e inglés; no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre calidad ni sobre el origen de los datos de entrenamiento.
- Repositorio con cero descargas y cero likes, creado y actualizado en la misma fecha: no hay evidencia de uso en producción ni validación externa.
- El nombre "test" en el identificador sugiere que puede tratarse de un checkpoint experimental, no de un modelo final.

## Enlaces

- Hugging Face: https://huggingface.co/bcckfdn/cevher2-test-21
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la informacion disponible.
