# Banaxi-Tech/BananaMind-2.1-MiniCoder

## Resumen

BananaMind 2.1 MiniCoder es un modelo de lenguaje especializado en código, desarrollado por Banaxi-Tech, que destaca por su tamaño extremadamente reducido: la model card declara 24.949.999 parámetros totales, aunque el archivo safetensors real contiene 28.357.858 parámetros (la diferencia probablemente se debe a buffers o embeddings adicionales). Se presenta como un modelo de menos de 25 millones de parámetros, lo que lo sitúa en la categoría de modelos ultraligeros diseñados para ejecutarse en entornos con recursos muy limitados.

La arquitectura es inusual: combina un transformer causal de 13 capas físicas con un esquema de ejecución parcialmente recurrente (denominado "partially-looped") que realiza 18 pasadas efectivas reutilizando pesos en la pila media (capas L5-L9). Además, incorpora un módulo de memoria n-gram (bigramas y tetragramas causales) que se inyecta mediante puertas aprendidas. El modelo fue entrenado con 30.000 millones de tokens, mezclando The Stack v3 (75%) y FineWeb-Edu (25%), y ofrece una ventana de contexto de 4.096 tokens.

Su relevancia radica en ser un experimento de eficiencia extrema: demuestra que es posible obtener capacidades de generación de código con un presupuesto de parámetros minúsculo, lo que abre la puerta a despliegues en dispositivos edge, navegadores o CPUs sin GPU. La licencia Apache-2.0 permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con ejecución parcialmente recurrente (partially-looped) y módulo n-gram |
| Parametros totales | 28.357.858 (según safetensors); 24.949.999 declarados en la model card (19.950.029 transformer + 4.999.970 n-gram) |
| Parametros activos | No aplica (no es MoE; aunque hay dos pasadas de la pila media, los pesos se comparten) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors, sin cuantizaciones GGUF o similares) |
| Idiomas soportados | Código (multilenguaje de programación) e inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer causal con una peculiaridad: la secuencia de ejecución es `L1 → L2 → L3 → L4 → L5 → L6 → L7 → L8 → L9 → L5 → L6 → L7 → L8 → L9 → L10 → L11 → L12 → L13`. Es decir, las capas L5 a L9 se ejecutan dos veces, compartiendo los mismos pesos en ambas pasadas. Esto crea un efecto de "profundidad efectiva" de 18 pasadas con solo 13 capas físicas, aumentando la capacidad de representación sin incrementar el número de parámetros.

Además, incorpora un módulo de memoria n-gram causal con dos tablas hash independientes: una de bigramas y otra de tetragramas, cada una con 51.699 entradas y valores de 48 dimensiones. La representación concatenada se proyecta al residual stream de 384 dimensiones y se inyecta mediante puertas aprendidas al inicio de cada una de las dos pasadas de la pila media. Este diseño permite capturar patrones estadísticos locales sin coste computacional adicional significativo.

El entrenamiento se realizó con 30.000 millones de tokens, distribuidos así: 22.500 millones (75%) de The Stack v3 train y 7.500 millones (25%) de FineWeb-Edu. The Stack v3 se procesó como archivos ordenados por repositorio, omitiendo archivos "vendored" (librerías de terceros empaquetadas), e incluyendo en el texto de entrenamiento la ruta del repositorio, la ruta del archivo y el lenguaje detectado. FineWeb-Edu aporta prosa, nombres de variables, comentarios y conocimiento general del lenguaje. Se suben checkpoints cada 5% del entrenamiento con safetensors, tokenizer, métricas y estado del optimizador.

## Capacidades

- Generación de texto y código: al ser un modelo causal, puede generar continuaciones de código y texto en inglés.
- Autocompletado de código: su entrenamiento en The Stack v3 le permite predecir tokens de código en múltiples lenguajes de programación.
- Comprensión de estructura de repositorios: al incluir rutas de archivo y lenguaje en el entrenamiento, puede contextualizar el código dentro de un proyecto.
- Procesamiento de lenguaje natural básico: gracias a FineWeb-Edu, maneja prosa y comentarios en inglés.
- Razonamiento simple: capacidad limitada por su tamaño, pero suficiente para tareas de completado y generación de snippets.
- No se documentan capacidades de tool calling, function calling, agentes, visión ni audio.

## Casos de uso

- Autocompletado de código en editores ligeros: su tamaño minúsculo permite ejecutarlo en extensiones de VS Code o plugins de terminal sin necesidad de GPU, ofreciendo sugerencias de código en tiempo real.
- Generación de snippets en entornos CI/CD: puede integrarse en pipelines de integración continua para generar fragmentos de código de prueba o documentación automática, con latencia mínima.
- Asistente de código en dispositivos edge: al caber en menos de 0,5 GB, puede desplegarse en Raspberry Pi, móviles o incluso en el navegador mediante WebAssembly, para asistencia de programación offline.
- Preprocesador de código para modelos más grandes: puede usarse como primer filtro para completar bloques simples y derivar tareas complejas a modelos de mayor tamaño, reduciendo costes.
- Educación y aprendizaje: sirve como modelo de ejemplo para estudiar arquitecturas eficientes y entrenamiento con datos mixtos de código y texto.
- Investigación en modelos de lenguaje pequeños: su diseño parcialmente recurrente y la memoria n-gram lo convierten en un banco de pruebas para experimentos de eficiencia paramétrica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval, GSM8K o similares para este modelo. La model card no incluye comparaciones con otros modelos ni evaluaciones cuantitativas.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener ~28 millones de parámetros, en FP32 ocupa aproximadamente 113 MB; en FP16, ~57 MB; en int8, ~28 MB. Cabe holgadamente en cualquier GPU, incluso en las integradas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (GTX 1050 Ti, RTX 2060, etc.) es suficiente. También funciona en CPU sin problemas.
- Despliegue en consumer GPU: sí, en cualquier GPU moderna, incluso en iGPU.
- Opciones de despliegue: al no haber cuantizaciones GGUF publicadas, se puede ejecutar con librerías como Hugging Face Transformers (carga de safetensors), o convertirlo a ONNX para inferencia optimizada. No hay soporte oficial documentado para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no se han publicado mediciones. Dado el tamaño, se espera una latencia de milisegundos en GPU y de decenas de milisegundos en CPU para generación de tokens.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directamente. Dado su tamaño (<30M parámetros), podría compararse con otros modelos de código ultraligeros como `Salesforce/codegen-350M` (350M, mucho mayor) o `google/codebert` (125M, encoder), pero no se han publicado resultados de BananaMind que permitan una comparación objetiva. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado, pero al estar entrenado principalmente con código de The Stack y texto en inglés, puede reflejar sesgos presentes en esos datasets (por ejemplo, subrepresentación de ciertos lenguajes o estilos de código).
- Riesgo de alucinación: al ser un modelo muy pequeño, la generación puede ser incoherente en tareas de razonamiento complejo o fuera de dominio.
- Limitaciones de contexto: ventana de 4.096 tokens, insuficiente para archivos largos o conversaciones extensas.
- Limitaciones de idioma: solo entrenado con datos en inglés y código; no soporta otros idiomas naturales.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Caveat de producción: al no tener cuantizaciones oficiales ni benchmarks, su rendimiento real en tareas específicas es desconocido; se recomienda evaluarlo antes de desplegarlo en entornos críticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Banaxi-Tech/BananaMind-2.1-MiniCoder
- Anuncio de Banaxi-Tech en HF (post 1): https://huggingface.co/posts/Banaxi-Tech/292084208797922
- Anuncio de Banaxi-Tech en HF (post 2): https://huggingface.co/posts/Banaxi-Tech/452874424066762
- GitHub de Banaxi-Tech: https://github.com/Banaxi-Tech
- Dataset The Stack v3: https://huggingface.co/datasets/HuggingFaceCode/stack-v3-train
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
