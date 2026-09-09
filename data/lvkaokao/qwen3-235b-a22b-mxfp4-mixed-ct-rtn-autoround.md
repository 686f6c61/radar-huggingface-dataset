# lvkaokao/Qwen3-235B-A22B-MXFP4-Mixed-CT-RTN-AutoRound

## Resumen

Esta ficha cubre la cuantización de Qwen/Qwen3-235B-A22B publicada por el usuario lvkaokao en el repositorio `lvkaokao/Qwen3-235B-A22B-MXFP4-Mixed-CT-RTN-AutoRound`. El modelo base es un transformer de mezcla de expertos (MoE) de 235.093.634.560 parámetros totales y 22.000 millones activos, especializado en generación de texto. La cuantización, generada con `AutoRound` y un agente de evaluación `autoquant-agent`, reduce el peso del modelo original para hacer viable su despliegue en infraestructuras con memoria limitada.

Existe una discrepancia relevante entre el nombre del repositorio, que indica `MXFP4`, y la model card, que describe el esquema como `MXFP8`. El tamaño del repositorio (130,2 GB) es consistente con una cuantización mixta a 4 u 8 bits, por lo que esta ambigüedad debe tenerse en cuenta antes de su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) |
| Parametros totales | 235.093.634.560 |
| Parametros activos | 22.000 millones (22B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP8 según la model card; MXFP4 según el nombre del repositorio; método AutoRound |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor remite a la licencia del modelo original) |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo original, Qwen3-235B-A22B, es un transformer de mezcla de expertos en el que solo unos 22.000 millones de parámetros están activos por token, lo que reduce el coste computacional en comparación con un modelo denso de 235.000 millones. Esta cuantización no modifica la arquitectura original: conserva la estructura MoE y reemplaza los pesos de precisión alta por representaciones de menor precisión.

El proceso de cuantización fue realizado con `AutoRound`, un método que convierte pesos a formato de punto flotante de baja precisión, y se validó mediante `autoquant-agent`, un agente que genera la cuantización, evalúa los benchmarks y aplica un ciclo de autocorrección. La model card no especifica el número de tokens de entrenamiento, la composición de datos ni si se llevó a cabo RLHF/DPO en el modelo base.

## Capacidades

La model card publicada no detalla capacidades específicas más allá del pipeline `text-generation`. Sin embargo, al ser una cuantización del modelo base, se espera que conserve las capacidades originales de Qwen3-235B-A22B, entre ellas:

- Generación de texto conversacional y razonamiento híbrido: un mismo checkpoint puede operar en modo de pensamiento (`thinking`) o en modo rápido, como indica la documentación externa.
- Razonamiento matemático y científico: los benchmarks incluidos en la model card (gsm8k, gpqa_diamond) muestran resultados razonables tras la cuantización.
- Soporte de tool calling: no indicado en la información disponible.
- Capacidades multilingües: no indicadas en la información disponible.
- Soporte de agentes con razonamiento multi-paso: no indicado en la información disponible.
- Capacidades de visión o audio: no disponibles (el modelo es exclusivamente de texto).

## Casos de uso

La información publicada no incluye una lista explícita de casos de uso. Los siguientes escenarios se derivan de las características del modelo (MoE de 22B activos y cuantización mixta) y son aplicaciones típicas para este tipo de modelo:

- Razonamiento bajo demanda en producción: al alternar entre modo pensamiento y modo rápido con un único checkpoint, se evita desplegar dos variantes separadas del modelo en la misma infraestructura, simplificando la gestión de servicios de texto.
- Optimización de costes en la nube: la reducción del tamaño de los pesos (130,2 GB frente a los aproximadamente 470 GB que ocuparía el modelo en BF16) permite alojar el modelo en menos GPU o en nodos más baratos, manteniendo la generación de texto activa.
- Asistentes técnicos con dominio matemático: gracias a los 22B parámetros activos, el modelo ofrece respuestas razonables en tareas de matemáticas y física sin el coste completo de un modelo denso de 235B, útil para plataformas educativas o de soporte.
- Despliegue en clusters de GPU heterogéneos: la cuantización a 4 u 8 bits hace posible cargar los pesos en varias GPU de 80 GB, lo que facilita la integración en clústeres ya existentes con vLLM o librerías compatibles con `compressed-tensors`.
- Análisis de documentos técnicos extensos: aunque no se dispone de la cifra exacta de contexto, el modelo base Qwen3 está diseñado para manejar entradas largas, por lo que este modelo cuantizado puede emplearse en sistemas de resumen o consulta de documentación.
- Generación de contenido con control de latencia: al tener solo 22B parámetros activos, el tiempo de respuesta por token es notablemente menor que en un modelo denso del mismo tamaño total, lo que resulta adecuado para asistentes en tiempo real.

## Benchmarks y rendimiento

La model card incluye los siguientes resultados de evaluación tras la cuantización, generados con `autoquant-agent`:

| Benchmark | Score |
|---|---|
| aime26 | 0,8000 |
| gpqa_diamond | 0,7020 |
| gsm8k | 0,9219 |
| hellaswag | 0,6692 |
| mmlu | 0,8391 |
| piqa | 0,8161 |

No se han proporcionado comparativas con el modelo original sin cuantizar ni con otras cuantizaciones, por lo que no es posible evaluar la pérdida de rendimiento específica.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 130,2 GB para cargar los pesos cuantizados, más el espacio destinado a la caché KV y las activaciones. En la práctica, se requieren varias GPU de datos (por ejemplo, 2x A100 de 80 GB con offloading de expertos) o una GPU con más de 140 GB de memoria.
- GPU recomendadas: límite superior de cada nodo; no cabe en GPUs de consumo como la RTX 4090 (24 GB).
- Opciones de despliegue: no especificadas en la información publicada. Al usar `safetensors` y `compressed-tensors`, es razonable esperar compatibilidad con librerías como vLLM, pero no se confirma en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen/Qwen3-235B-A22B (original) | 235B | 22B | no disponible | no disponible en la informacion dada | Hugging Face |
| Este modelo (cuantizado) | 235B | 22B | no disponible | no disponible | Hugging Face |
| Otras cuantizaciones de Qwen3-235B-A22B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han encontrado alternativas con datos comparables en la información proporcionada. La principal diferencia práctica frente al modelo original es el tamaño del repositorio y el esquema de cuantización, que reduce los requisitos de memoria.

## Limitaciones y advertencias

- Discrepancia técnica entre el nombre del repositorio (MXFP4) y la model card (MXFP8): conviene verificar el esquema real antes de integrar el modelo en producción.
- La licencia no está explícitamente indicada y solo se remite a la del modelo original; el usuario debe confirmar la compatibilidad con su caso de uso comercial.
- No se especifican idiomas soportados, longitud de contexto ni requisitos de inferencia, lo que dificulta la evaluación previa al despliegue.
- Los benchmarks presentados son post-cuantización, pero no incluyen una comparación con el modelo original; la degradación en tareas de razonamiento complejo puede ser significativa.
- No hay información sobre sesgos, riesgos de alucinación o comportamientos indeseados, por lo que se recomienda validar el modelo en conjuntos de datos propios antes de su uso.
- La cuantización agresiva (4 u 8 bits) puede producir respuestas menos precisas en tareas de matemáticas o lógica que el modelo original en BF16.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lvkaokao/Qwen3-235B-A22B-MXFP4-Mixed-CT-RTN-AutoRound
- Modelo base: https://huggingface.co/Qwen/Qwen3-235B-A22B
- Documentación de AutoRound: https://github.com/intel/auto-round
- Información externa sobre el modelo base: https://telnyx.com/llm-library/qwen3-235b-a22b
