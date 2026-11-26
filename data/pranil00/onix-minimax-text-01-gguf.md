# pranil00/ONIX-MiniMax-Text-01-GGUF

## Resumen
ONIX-MiniMax-Text-01-GGUF es una cuantización agresiva a formato GGUF del modelo MiniMax-Text-01, desarrollado originalmente por MiniMax y redistribuido por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. La versión publicada emplea el esquema de cuantización IQ1_S (1,56 bits por peso), lo que reduce el tamaño de los pesos desde aproximadamente 891,83 GB en FP16 hasta 86,95 GB, con una tasa de compresión de 10,26x. El objetivo declarado es permitir la ejecución de un modelo de 456.000 millones de parámetros en hardware de consumo mediante técnicas de offload híbrido entre CPU y GPU.

El modelo base es un transformer de 456.000 millones de parámetros, una escala que en precisión completa resulta inviable para cualquier estación de trabajo convencional. Esta cuantización busca hacerlo accesible en equipos con 89-91 GB de memoria unificada o RAM libre, como Apple Silicon de gama alta o configuraciones con GPU de 80 GB más memoria del sistema. La model card reporta una retención de calidad cognitiva estimada del 60 % respecto al modelo original, un dato que conviene tratar con cautela porque no se acompaña de metodología de evaluación.

La relevancia de esta ficha es doble: por un lado, documenta un artefacto de cuantización extrema que ilustra los límites prácticos del formato GGUF; por otro, advierte de que el modelo base original no se distribuye bajo Apache 2.0, por lo que la licencia declarada en este repositorio merece verificación antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia declarada en la model card) |
| Parametros totales | 456.000 millones (456 B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | 8.192 tokens en Apple Silicon y NVIDIA; 4.096 tokens en CPU |
| Tipos de cuantizacion | IQ1_S (1,56 bits por peso); KV cache en Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (declarada por el autor de la cuantización; verificar la del modelo base) |
| Formato de pesos | GGUF (fichero MiniMax--MiniMax-Text-01-IQ1_S.gguf) |

## Arquitectura y entrenamiento
La model card identifica la familia como transformer, pero no aporta detalles sobre el número de capas (más allá de las 84 que se mencionan en el informe de telemetría), la dimensión oculta, el número de cabezas de atención ni el tipo de atención empleado. Tampoco se documentan los datos de entrenamiento del modelo base: no hay información sobre el volumen de tokens, la composición del corpus, ni si se aplicaron fases de RLHF, DPO u otro tipo de ajuste por preferencias. Todo lo relativo al entrenamiento de MiniMax-Text-01 debe consultarse en la model card original de MiniMax, que no forma parte de la información disponible aquí.

La innovación técnica de este artefacto no está en la arquitectura, sino en el proceso de cuantización: el motor run-any-model aplica una cuantización IQ1_S que comprime los pesos un 90,2 % y un offload híbrido por capas. Según el informe de telemetría, solo 9 de las 84 capas (aproximadamente el 10 %) se descargan en la GPU o en Metal, mientras que el resto se transmite desde la RAM del sistema, lo que implica que la velocidad de generación estará limitada por el ancho de banda de memoria del host y no por la potencia de cálculo del acelerador.

## Capacidades
- Generación de texto: el pipeline declarado es text-generation, por lo que la función principal es la producción de texto autoregresivo.
- Conversación multi-turno: la model card incluye plantillas de parada (`<|im_end|>`, `<|endoftext|>`) y ejemplos de uso en modo conversacional con llama.cpp (`-cnv`) y Ollama.
- Ejecución multiplataforma: soporte declarado para Apple Silicon (Metal), GPU NVIDIA (CUDA) y CPU x86 con AVX2/AVX-512.
- Integración con herramientas locales: compatible con llama.cpp, Ollama, LM Studio, Jan y Text-Generation-WebUI.
- Capacidades específicas del modelo base (razonamiento, código, matemáticas, tool calling, agentes): no disponibles en la información proporcionada; no se pueden atribuir a esta cuantización sin verificar la model card de MiniMax-Text-01.

## Casos de uso
- Experimentación e investigación sobre cuantización extrema: este artefacto permite estudiar cómo se degrada un modelo de 456 B al comprimirlo a 1,56 bits por peso, comparando salidas con el modelo base en FP16 o en cuantizaciones menos agresivas.
- Pruebas de viabilidad en hardware de consumo: útil para medir si un equipo con 89-91 GB de memoria unificada o RAM libre puede ejecutar un modelo de esta escala mediante offload híbrido, antes de invertir en infraestructura mayor.
- Evaluación de pipelines de inferencia locales: sirve para validar la integración de llama.cpp, Ollama o LM Studio con modelos de gran tamaño y contextos de 4.096-8.192 tokens.
- Docencia y demostraciones sobre límites del hardware: permite ilustrar de forma tangible la diferencia entre tamaño de pesos, KV cache y memoria residente total (89,04 GB frente a 899,82 GB en FP16).
- Generación de texto offline en entornos sin conectividad: con la latencia esperada por el streaming desde RAM, puede emplearse en tareas por lotes donde el throughput no sea crítico.
- Comparación de esquemas de cuantización: sirve como referencia de IQ1_S frente a Q4_K_M, Q8_0 u otras variantes del mismo modelo base, si se publican.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card solo incluye un informe de telemetría de memoria y compresión, que se reproduce a continuación:

| Metrica | Baseline (FP16) | Cuantizado (IQ1_S) | Cambio |
|---|---|---|---|
| Precision en bits | 16,0 bits/parametro | 1,56 bits/parametro | -90,2 % |
| Tamano de pesos | 891,83 GB | 86,95 GB | -90,2 % |
| KV cache | 2.016 MB (FP16) | 2.016 MB (Q4_0) | Optimizado |
| RAM residente total | 899,82 GB | 89,04 GB | -90,1 % |
| Calidad estimada | 100 % baseline | 60 % retenida | -40,0 % |
| Capas aceleradas | 0 % | 9/84 capas | - |

No se proporcionan cifras de latencia ni de tokens por segundo. La afirmación de "60 % de retención de calidad" no viene acompañada de la metodología de evaluación, por lo que no debe interpretarse como una métrica validada.

## Requisitos de hardware

| Nivel de dispositivo | RAM/VRAM requerida | Contexto optimo | Estado |
|---|---|---|---|
| Apple Silicon (M1-M5) | 89,04 GB memoria unificada | 8.192 tokens | Aceleracion Metal nativa |
| GPU NVIDIA (RTX 30/40/50) | 88,45 GB VRAM dedicada | 8.192 tokens | Aceleracion CUDA |
| PC Windows/Linux (CPU) | 91,04 GB RAM libre | 4.096 tokens | AVX2 / AVX-512 |

- VRAM estimada: 88,45 GB en GPU NVIDIA; el resto del modelo se transmite desde RAM del sistema.
- GPU recomendadas: configuraciones con 80 GB o más de VRAM (A100 80 GB, H100 80 GB) más memoria del sistema suficiente para el offload; en RTX 4090 (24 GB) el modelo no cabe completo y depende del offload híbrido.
- Cabe en GPU de consumo: no de forma completa; solo mediante offload híbrido con 9/84 capas en acelerador.
- Opciones de despliegue: llama.cpp (`llama-cli -m ... -c 4096 -ngl 99 -cnv`), Ollama (mediante Modelfile), LM Studio, Jan, Text-Generation-WebUI y el CLI run-any-model.
- Latencia y throughput: no disponibles; la model card advierte de que la generación será más lenta por el streaming de capas desde CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ONIX-MiniMax-Text-01-GGUF (IQ1_S) | 456 B | 4.096-8.192 tokens | Apache 2.0 (declarada) | Hugging Face | Cuantizacion extrema, calidad estimada al 60 % |
| MiniMax/MiniMax-Text-01 (original) | 456 B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face | Modelo base sin cuantizar; requiere ~891 GB en FP16 |
| Otras cuantizaciones GGUF del mismo base | 456 B | segun variante | segun autor | Hugging Face (segun disponibilidad) | No se han identificado en la informacion disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de esta cuantización con alternativas de la misma categoría.

## Limitaciones y advertencias
- Degradación de calidad: la propia model card estima una retención del 60 % respecto a FP16, sin metodología pública que lo respalde; se espera una pérdida sustancial en razonamiento, coherencia y fidelidad factual.
- Riesgo de alucinación: con 1,56 bits por peso, la probabilidad de generar contenido incorrecto o incoherente aumenta de forma notable; no se recomienda para producción sin validación humana.
- Licencia ambigua: el repositorio declara Apache 2.0, pero el modelo base MiniMax-Text-01 puede tener términos distintos; es imprescindible verificar la licencia original antes de un uso comercial.
- Idiomas: no se especifican los idiomas soportados; no se puede garantizar un rendimiento adecuado en castellano.
- Contexto limitado en CPU: 4.096 tokens frente a los 8.192 en aceleradores, lo que restringe casos de uso con documentos largos.
- Rendimiento: el offload híbrido (9/84 capas en GPU) implica velocidades de generación lentas, no cuantificadas en la información disponible.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria del artefacto.
- Fecha de creación anómala (2026-11-25): conviene verificar la integridad y procedencia del fichero antes de descargarlo.
- Responsabilidad: la model card incluye una cláusula de exención total de responsabilidad sobre los resultados generados.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-MiniMax-Text-01-GGUF
- Modelo base: https://huggingface.co/MiniMax/MiniMax-Text-01
- Organización ONIX: https://huggingface.co/ONIX
- Motor de cuantización run-any-model: https://github.com/PranilShah-08/run-any-model
