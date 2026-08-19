# Atomic-Germ/Qwen3.8-Distilled-4B-NPU2

## Resumen

Qwen3.8-Distilled-4B-NPU2 es una conversión cuantizada en formato Q4NX del modelo de razonamiento Qwen3.8 4B Distilled, creada por Atomic-Germ para ejecutarse exclusivamente en las unidades de procesamiento neuronal (NPU) AMD XDNA2 de los procesadores Ryzen AI 300 y posteriores. El modelo original, desarrollado por Ma7ee7, es una destilación por secuencias de las respuestas y trazas de razonamiento de Qwen3.8-Max (profesor, 2,4 billones de parámetros) sobre el estudiante Qwen3-4B-Thinking-2507, lo que produce un modelo de aproximadamente 4.000 millones de parámetros con capacidades de razonamiento mejoradas respecto a su base.

La relevancia de esta conversión concreta radica en que permite ejecutar un modelo de razonamiento de 4B en portátiles con NPU AMD sin depender de una GPU dedicada, usando el runtime FastFlowLM. No es un archivo GGUF y no funciona con llama.cpp ni Ollama; está pensado para el ecosistema FLM sobre el stack XRT de AMD en Linux. El modelo hereda el modo de pensamiento del estudiante Qwen3-4B-Thinking-2507, con una ventana de contexto nominal de 256K tokens (aunque las pruebas de FLM cubren hasta 32K).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (decoder-only causal language model) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256K en el modelo base; probado hasta 32K en esta conversión Q4NX |
| Tipos de cuantizacion | Q4NX (formato Q4_1 reordenado para NPU, no es GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | Q4NX (propietario de FastFlowLM) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con arquitectura Qwen3, heredada del estudiante Qwen3-4B-Thinking-2507. La destilación se realizó a nivel de secuencia: el profesor, Qwen3.8-Max-preview, generó respuestas completas y trazas de razonamiento (chain-of-thought) que se usaron como objetivos de entrenamiento para el estudiante de 4B sobre el dataset r0b0tlab/qwen3.8-max-distillation-50k (50.000 ejemplos). Este método transfiere patrones de razonamiento, estructura de solución y estilo de respuesta sin copiar la arquitectura ni los pesos del profesor.

La conversión a Q4NX es un proceso de cuantización específico para la matriz de tiles y los patrones de acceso a memoria de la NPU XDNA2. No se trata de una cuantización GGUF: es un formato empaquetado y reordenado que optimiza el uso de la matriz de cómputo de la NPU. El modelo incluye modo de pensamiento (thinking mode) heredado de Qwen3-4B-Thinking-2507, lo que implica que puede emitir trazas de razonamiento antes de la respuesta final.

## Capacidades

- Generación de texto con razonamiento de cadena de pensamiento (chain-of-thought) y modo de pensamiento activado.
- Razonamiento multi-paso y resolución de problemas lógicos y matemáticos, transferido por destilación de Qwen3.8-Max.
- Conversación multiturno con plantilla de chat de Qwen3.
- Capacidad de manejar contextos largos: el modelo base soporta hasta 256K tokens, aunque la conversión Q4NX se ha probado hasta 32K.
- Generación de código y asistencia en tareas de programación, heredadas del modelo base Qwen3.
- No incluye soporte explícito de tool calling ni function calling en la documentación disponible.

## Casos de uso

- Asistente de razonamiento en portátil sin GPU: gracias a la ejecución en NPU XDNA2, se puede desplegar un asistente de razonamiento en equipos AMD Ryzen AI 300 con 16 GB de memoria unificada, sin necesidad de tarjeta gráfica dedicada.
- Análisis de documentos largos en local: con una ventana de contexto probada hasta 32K tokens en la conversión Q4NX, puede procesar informes extensos o contratos en un portátil, manteniendo la privacidad al no enviar datos a la nube.
- Generación de código en entornos aislados: el modelo hereda las capacidades de código de Qwen3 y puede usarse en flujos de trabajo donde no se permite acceso a APIs externas, ejecutándose en el propio hardware del desarrollador.
- Chat conversacional con razonamiento visible: el modo de pensamiento permite al usuario ver la traza de razonamiento antes de la respuesta final, útil para depurar el proceso lógico en aplicaciones educativas o de asistencia técnica.
- Prototipado de agentes con razonamiento multi-paso: aunque no se documenta tool calling explícito, la capacidad de cadena de pensamiento permite construir prototipos de agentes que descomponen tareas complejas en pasos intermedios sobre el portátil.
- Evaluación de destilación de modelos: como caso de investigación, sirve para estudiar cómo una destilación de Qwen3.8-Max sobre un estudiante de 4B se comporta en hardware de bajo consumo, comparando con el modelo GGUF y el modelo de precisión completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica de rendimiento publicada es la tabla FLM Bench, que mide el rendimiento de inferencia en un portátil AMD Ryzen AI 340 Framework 13:

| Contexto | TTFT (s) (media ± desv.) | Velocidad de prefill (tok/s) (media ± desv.) | Velocidad de decodificación (tok/s) (media ± desv.) |
|---:|---:|---:|---:|
| 1K | 2,973 ± 0,077 | 355,72 ± 9,25 | 12,31 ± 0,25 |
| 2K | 4,337 ± 0,050 | 466,84 ± 12,27 | 12,15 ± 0,26 |
| 4K | 8,283 ± 0,014 | 478,02 ± 4,65 | 11,01 ± 0,12 |
| 8K | 17,243 ± 0,065 | 454,02 ± 0,02 | 9,38 ± 0,01 |
| 16K | 41,308 ± 0,071 | 376,84 ± 0,00 | 7,27 ± 0,07 |
| 32K | 116,909 ± 0,294 | 265,53 ± 0,06 | 5,06 ± 0,00 |

La velocidad de prefill alcanza un máximo de 478 tok/s a 4K de contexto, mientras que la decodificación se degrada de 12,31 tok/s a 1K hasta 5,06 tok/s a 32K, lo que indica una degradación notable con contextos muy largos.

## Requisitos de hardware

- VRAM estimada: no aplica, usa memoria unificada del sistema; se recomienda ~16 GB de memoria unificada para pesos Q4NX, activaciones y caché KV.
- GPU recomendadas: no se requiere GPU; el modelo se ejecuta en la NPU XDNA2 integrada en procesadores AMD Ryzen AI 300 (Strix Point) o posteriores.
- Compatibilidad con GPU de consumo: no compatible con GPUs de consumo; requiere NPU AMD XDNA2 y stack XRT Linux.
- Opciones de despliegue: exclusivamente el runtime FastFlowLM (>= 0.9.45) con el comando `flm run`; el instalador `flm-add` registra el modelo en el directorio de usuario de FLM.
- Latencia y throughput: primera respuesta (TTFT) de 2,97 s a 1K de contexto, hasta 116,9 s a 32K; velocidad de decodificación entre 5 y 12 tok/s según el contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atomic-Germ/Qwen3.8-Distilled-4B-NPU2 | 4,02B | 256K (base) | Q4NX (NPU) | Apache-2.0 | Solo AMD XDNA2 |
| Ma7ee7/Qwen3.8_4B_Distilled | 4,02B | 256K | Safetensors (FP16) | Apache-2.0 | Cualquier GPU/CPU |
| Ma7ee7/Qwen3.8_4B_Distilled_GGUF | 4,02B | 256K | GGUF | Apache-2.0 | llama.cpp, Ollama, etc. |
| Qwen/Qwen3-4B-Thinking-2507 | 4,02B | 256K | Safetensors | Apache-2.0 | Cualquier GPU/CPU |

La comparativa muestra que la única diferencia entre esta conversión y las alternativas es el formato de pesos y el hardware objetivo. El modelo de NPU no se puede ejecutar en infraestructura estándar, pero ofrece la ventaja de operar en portátiles con NPU AMD sin GPU dedicada. No hay datos de rendimiento académico comparado con estos modelos en la información disponible.

## Limitaciones y advertencias

- Solo soporta inglés; no hay evidencia de capacidades multilingües en la documentación.
- No es un modelo oficial de Qwen ni de Alibaba; es una destilación independiente que no reproduce las capacidades completas del profesor Qwen3.8-Max.
- Requiere hardware específico: solo funciona en NPU XDNA2 (AMD Ryzen AI 300 o posterior) con Linux y el stack XRT; no se ejecuta en GPU, CPU, llama.cpp ni Ollama.
- Los kernels de la NPU (xclbins) son de código cerrado y no se distribuyen en el repositorio; se enlazan los del modelo oficial `qwen3-tk:4b`, lo que implica una dependencia de la compatibilidad entre arquitecturas.
- La velocidad de decodificación se degrada significativamente con contextos largos (de 12 tok/s a 1K hasta 5 tok/s a 32K), lo que puede afectar a la experiencia de usuario en tareas de razonamiento extenso.
- Riesgo de alucinación y sesgos heredados del modelo base Qwen3-4B-Thinking-2507, no mitigados por la destilación.
- La licencia Apache-2.0 permite uso comercial, pero la dependencia de kernels propietarios de FastFlow2 limita la portabilidad del despliegue.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Atomic-Germ/Qwen3.8-Distilled-4B-NPU2
- Modelo completo de precisión completa: https://huggingface.co/Ma7ee7/Qwen3.8_4B_Distilled
- Conversión GGUF del mismo modelo: https://huggingface.co/Ma7ee7/Qwen3.8_4B_Distilled_GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507
- Dataset de destilación: https://huggingface.co/datasets/r0b0tlab/qwen3.8-max-distillation-50k
- Runtime FastFlow2: https://fastflowlm.com
- Paper de destilación (referenciado en tags): https://arxiv.org/abs/2505.09388
