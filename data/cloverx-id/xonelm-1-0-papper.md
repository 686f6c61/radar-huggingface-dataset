# cloverx-id/XoneLM-1.0-Papper

## Resumen

XoneLM-1.0-Papper es un modelo de lenguaje experimental de 54,07 millones de parámetros desarrollado por el investigador cloverx-id (bajo la iniciativa Lumina Moon). Se presenta como un ejercicio de ingeniería extrema que combina múltiples técnicas poco convencionales: descomposición QR en variedades de Stiefel para memoria de trabajo, codificaciones posicionales polinómicas de Chebyshev de grado 180, seguimiento de solitones topológicos, decaimiento de atención de cola pesada, enrutamiento hiperbólico de Poincaré y compresión latente de clave-valor (MLA). El modelo fue entrenado desde cero con 32,01 millones de tokens del corpus TinyStories en una GPU Tesla T4 durante menos de dos horas, alcanzando una pérdida final de 1,7355 y una perplejidad de 5,67.

La relevancia de este modelo no reside en su rendimiento práctico, sino en su valor como banco de pruebas para arquitecturas no euclidianas y optimizadores personalizados. Su autor documenta el proceso como un experimento de "3 AM engineering", con un paper adjunto en PDF. Aunque no está pensado para producción, demuestra que es posible entrenar un modelo con componentes matemáticamente sofisticados en hardware de consumo con convergencia estable y sin picos de pérdida.

El modelo se distribuye bajo licencia Apache-2.0 y solo soporta inglés. No se han publicado resultados de benchmarks estándar, por lo que su evaluación se limita a las métricas de entrenamiento reportadas y a un análisis cualitativo de generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal de 12 capas, 8 cabezas de atención, dimensión 512, con memoria de trabajo basada en variedades de Stiefel, codificación posicional de Chebyshev, atención con decaimiento de cola pesada, enrutamiento hiperbólico y compresión latente KV (dim 64) |
| Parametros totales | 54.073.344 (54,07 M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el código de entrenamiento usa secuencias de 512 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (el repositorio incluye código PyTorch; no se especifica si son safetensors, bin u otro) |

## Arquitectura y entrenamiento

XoneLM integra siete componentes arquitectónicos principales: un banco de memoria de trabajo ortogonal inicializado mediante factorización QR en variedades de Stiefel, que garantiza estabilidad métrica desde el inicio; codificaciones posicionales PolyHoPE basadas en polinomios de Chebyshev de grado 180, que evitan decaimiento periódico; seguimiento de estado de solitones topológicos mediante actualizaciones de onda sech-cuadrado derivadas de la dinámica de plasma sin colisiones; decaimiento de atención LinHoPE con distribución de Cauchy de cola pesada y sesgo geométrico de recencia; enrutamiento hiperbólico de Poincaré para asignación de clústeres de memoria episódica en discos unitarios conformes de Riemann; compresión latente conjunta de clave-valor con dimensión 64 para reducir el ancho de banda de memoria durante la decodificación autoregresiva; y el optimizador LuminaV, que emplea una envolvente acotada por tangente hiperbólica, seguimiento de varianza de innovación central y enmascaramiento direccional cauteloso.

El entrenamiento se realizó sobre 32.009.639 tokens de TinyStories en precisión mixta FP16, con un optimizador LuminaV de tasa de aprendizaje 8e-4, en una Tesla T4 con 14,56 GB de VRAM (pico de uso 7,29 GB). El proceso duró 117,88 minutos (1,96 horas) con un throughput máximo de 9.868 tokens por segundo. Se reporta convergencia monótona sin picos de pérdida, explosiones de gradiente ni underflow aritmético. La pérdida final fue 1,7355 y la perplejidad 5,67. No se menciona ninguna fase de ajuste fino supervisado (SFT) ni alineación por RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva en inglés, con capacidad de producir oraciones sintácticamente correctas y diálogos con comillas, según el análisis cualitativo del autor.
- Continuación probabilística de historias cortas, especialmente en el dominio infantil de TinyStories.
- Comprensión básica de contexto inmediato gracias a la ventana de 512 tokens usada en entrenamiento.
- Memoria de trabajo mixta (256 estáticos + 256 dinámicos) que permite cierto mantenimiento de estado a lo largo de la generación.
- Sin soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modos de razonamiento explícitos.
- No es multilingüe; solo procesa texto en inglés.

## Casos de uso

- Investigación académica en arquitecturas no euclidianas: el modelo sirve como banco de pruebas para estudiar el comportamiento de memoria de Stiefel, enrutamiento hiperbólico y decaimiento de atención de cola pesada en un entorno de tamaño reducido y entrenamiento reproducible en GPU de consumo.
- Experimentación con optimizadores personalizados: el optimizador LuminaV se puede evaluar comparando su convergencia frente a AdamW u otros optimizadores en modelos pequeños, gracias a que el entrenamiento completo tarda menos de dos horas.
- Generación de texto corto en dominios restringidos: puede producir cuentos infantiles sencillos o continuaciones de historias dentro del estilo de TinyStories, útil para demos o prototipos sin requisitos de calidad estricta.
- Enseñanza de arquitecturas de transformers avanzadas: su código fuente, documentado en el repositorio, permite a estudiantes y desarrolladores inspeccionar implementaciones de componentes como MLA, codificación posicional polinómica o memoria ortogonal.
- Validación de estabilidad numérica: el entrenamiento sin picos de pérdida ni underflow ofrece un caso de estudio para técnicas de inicialización y optimización robustas en FP16.
- Comparación de estrategias de compresión KV: al usar una dimensión latente de 64, se puede analizar el impacto de la compresión de clave-valor en modelos de 54M frente a variantes sin compresión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas métricas reportadas son las del entrenamiento:

| Metrica | Valor |
|---|---|
| Perdida final | 1,7355 |
| Perplejidad | 5,67 |
| Z-loss de diversidad | 0,0014 |
| Throughput de entrenamiento pico | 9.868 tokens/s |
| Tiempo de entrenamiento | 117,88 minutos |

No existe comparación con otros modelos de tamaño similar.

## Requisitos de hardware

- Inferencia: al ser un modelo de 54M parámetros, cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) con menos de 2 GB de VRAM en FP16. También puede ejecutarse en CPU para generación corta.
- Entrenamiento: el autor reporta un uso pico de 7,29 GB de VRAM en una Tesla T4 (14,56 GB), por lo que cualquier GPU con 8 GB o más es suficiente para reproducir el entrenamiento con el mismo lote.
- Despliegue: al no estar cuantizado ni exportado a formatos estándar como GGUF o safetensors, la integración con vLLM, llama.cpp u Ollama no es directa. Se requiere usar el código PyTorch proporcionado en el repositorio.
- Latencia y throughput: no se han publicado mediciones de inferencia. Dado el tamaño, se espera una generación rápida en GPU, pero no hay datos cuantitativos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría. XoneLM es un modelo experimental único en su combinación de arquitecturas no euclidianas y optimizador personalizado. Modelos de tamaño similar (50-100M) como GPT-2 small (124M) o modelos TinyStories de referencia (por ejemplo, los de la serie TinyStories de Ronen Eldan y Yuanzhi Li) podrían servir como referencia cualitativa, pero no se han publicado comparaciones directas.

| Modelo | Parametros | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|
| XoneLM-1.0-Papper | 54,07 M | No disponible | 32M tokens TinyStories | Apache-2.0 |
| GPT-2 small (referencia) | 124 M | 1024 tokens | WebText (~8B tokens) | MIT |
| TinyStories (referencia) | ~1-100 M | Variable | TinyStories | Variable |

## Limitaciones y advertencias

- El modelo es extremadamente pequeño y fue entrenado únicamente con TinyStories, un corpus de cuentos infantiles. Su vocabulario, conocimiento del mundo y capacidad de razonamiento son muy limitados.
- No ha pasado por ajuste fino supervisado ni alineación, por lo que no sigue instrucciones de forma fiable. El propio autor demuestra que ante un prompt sobre una "Box" el modelo genera una "ball", evidenciando que el prior del corpus domina sobre la palabra clave.
- Riesgo alto de alucinación y de repetición en contextos fuera de su dominio de entrenamiento.
- Solo soporta inglés; no procesa otros idiomas.
- No se han publicado resultados de benchmarks, por lo que no hay evidencia objetiva de su rendimiento frente a otros modelos.
- La arquitectura no euclidiana es experimental y no se ha validado en tareas del mundo real. Su rendimiento en producción es desconocido.
- El formato de pesos no está estandarizado; el repositorio contiene código fuente y probablemente los pesos en formato PyTorch, pero no se indica si son compatibles con herramientas de inferencia comunes.
- No se ha documentado la longitud máxima de contexto soportada; el entrenamiento usa 512 tokens, pero no se especifica si la atención puede extenderse más allá.
- La licencia Apache-2.0 permite uso comercial, pero la falta de soporte y documentación hace que su uso en producción sea desaconsejable.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cloverx-id/XoneLM-1.0-Papper
- Paper (PDF): https://huggingface.co/cloverx-id/XoneLM-1.0-Papper/blob/main/XoneLM.pdf
- Perfil del autor en HuggingFace: https://huggingface.co/cloverx-id
- Imagen de vista previa del paper: https://cdn-uploads.huggingface.co/production/uploads/6835b520186e98712b0386a6/X2I1IQvYlfLfG3gxtSIXQ.png
