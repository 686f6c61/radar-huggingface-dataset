# mahadev9/Qwen3.5-4B-nvfp4

## Resumen

Qwen3.5-4B-nvfp4 es una cuantización NVFP4 (W4A4) del modelo Qwen3.5-4B de Alibaba, publicada por el usuario mahadev9 en Hugging Face. Se trata de un modelo denso de 4.205 millones de parámetros (4,2B) con una ventana de contexto de 128K tokens, según fuentes externas. La cuantización se ha realizado con la librería llm-compressor del proyecto vLLM, manteniendo la capa `lm_head` en precisión original para preservar la calidad de la salida.

El interés de esta versión radica en su reducción drástica de tamaño: los pesos y activaciones se almacenan en 4 bits, lo que permite ejecutar el modelo en GPUs con soporte NVFP4 (arquitectura Blackwell) con un consumo de memoria muy inferior al del modelo original en bf16. Sin embargo, la model card advierte explícitamente de una pérdida notable de calidad, especialmente en tareas de tool calling y agentes, por lo que se recomienda la versión FP8 para usos que requieran mayor fidelidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (segun llmfit.io) |
| Parametros totales | 4.205.751.296 (4,2B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K tokens (segun llmfit.io) |
| Tipos de cuantizacion | NVFP4 (W4A4), con escalas de bloque FP8 y escala global FP32 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Este modelo no es un entrenamiento nuevo, sino una cuantizacion del modelo base Qwen3.5-4B, un transformer denso de 4,2B parametros con contexto de 128K tokens. La cuantizacion NVFP4 (4 bits para pesos y activaciones) se ha aplicado a todas las capas lineales excepto `lm_head`, que se mantiene en precision original. El proceso se ha llevado a cabo con llm-compressor, la herramienta de compresion del ecosistema vLLM, y los pesos se distribuyen en formato safetensors.

No se dispone de informacion detallada sobre el entrenamiento del modelo base (composicion del dataset, numero de tokens, tecnicas de alineacion como RLHF o DPO) en la documentacion proporcionada. La cuantizacion no implica reentrenamiento, por lo que las capacidades del modelo son las heredadas de Qwen3.5-4B, aunque degradadas por la reduccion de precision.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.5-4B, aunque con una degradacion medible en la distribucion de probabilidades (KL divergence media de 1,04 frente al modelo bf16).
- Tool calling y agentes: la model card incluye una evaluacion especifica sobre turnos de tool calling (schema + query + call), lo que indica que el modelo soporta esta funcionalidad, aunque con una perdida de calidad notable (top-1 agreement del 77,06% en ese escenario).
- Capacidades multilingues: no se ha confirmado en la informacion disponible, aunque es probable que el modelo base las herede de Qwen3.5.
- No se ha documentado soporte para vision, audio u otras modalidades en esta version concreta (el tag `qwen3_5_text` sugiere que es solo texto).

## Casos de uso

- Inferencia de bajo coste en produccion: con un tamano de repo de 3,3 GB, el modelo puede desplegarse en entornos con VRAM limitada, siempre que la GPU soporte NVFP4 nativamente (Blackwell) o se recurra a dequantizacion en tiempo de ejecucion.
- Prototipado rapido de agentes conversacionales: gracias a su soporte de tool calling, puede usarse para pruebas de concepto de asistentes que interactuan con APIs, aunque la calidad de las llamadas a herramientas se ve comprometida.
- Generacion de texto en entornos edge: su reducido tamano permite ejecutarlo en dispositivos con recursos moderados, como estaciones de trabajo con una unica GPU consumer de gama alta.
- Evaluacion de tecnicas de cuantizacion: al ser un ejemplo de NVFP4 generado con llm-compressor, sirve como referencia para estudiar el impacto de la cuantizacion W4A4 en modelos de 4B.
- Despliegue con vLLM: integrado directamente en el servidor vLLM, permite servir el modelo con un comando simple, aprovechando las optimizaciones de la libreria para NVFP4.
- Comparacion de calidad entre cuantizaciones: junto con la version FP8 del mismo autor, permite medir el trade-off entre tamano y fidelidad para decidir que cuantizacion usar en un proyecto concreto.

## Benchmarks y rendimiento

La model card no incluye benchmarks estandar (MMLU, HumanEval, GSM8K, etc.), pero proporciona una evaluacion de la divergencia KL y el acuerdo top-1 frente al modelo base en bf16, medida sobre 128 muestras por bucket con secuencias de 2048 tokens:

| Bucket | Tokens | KL media | Acuerdo top-1 |
| --- | --- | --- | --- |
| Prosa (WikiText-2) | 24.130 | 0,1049 | 83,59% |
| Agentico (tool calling) | 77.522 | 1,3375 | 77,06% |
| Global | 101.652 | 1,0449 | 78,61% |

Estos datos indican que la cuantizacion NVFP4 introduce una degradacion significativa, especialmente en tareas agenticas, donde la KL divergence es mas de diez veces superior a la de prosa. No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan aproximadamente 3,3 GB en NVFP4. Con overhead de activaciones, KV cache y buffers de ejecucion, se estima un consumo de 4-5 GB para inferencia con contexto moderado, aunque no se dispone de mediciones exactas.
- GPU recomendadas: para aprovechar la cuantizacion NVFP4 nativa se requieren GPUs Blackwell (RTX 5090, B200, etc.). En GPUs sin soporte NVFP4, el modelo puede ejecutarse mediante dequantizacion, pero se pierde parte de la ventaja de memoria y velocidad.
- Compatibilidad con GPU consumer: si se dispone de una GPU con soporte NVFP4, cabe en tarjetas de 8 GB o menos. Sin ese soporte, el modelo puede ejecutarse en GPUs de 8-12 GB con dequantizacion.
- Opciones de despliegue: vLLM (soportado oficialmente), transformers (con `torch_dtype="auto"`), y Ollama (existe una entrada en su biblioteca para `qwen3.5:4b-nvfp4`).
- Latencia y throughput: no se han publicado mediciones especificas. En general, NVFP4 reduce el ancho de banda de memoria, lo que deberia mejorar el throughput frente a bf16, pero la degradacion de calidad puede no compensar en tareas exigentes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Calidad (KL vs bf16) | Licencia |
| --- | --- | --- | --- | --- | --- |
| Qwen3.5-4B (base) | 4,2B | 128K | bf16 | Referencia | No disponible |
| Qwen3.5-4B-nvfp4 (este) | 4,2B | 128K | NVFP4 (W4A4) | KL media 1,04 | No disponible |
| Qwen3.5-4B-fp8 (del mismo autor) | 4,2B | 128K | FP8 | Casi sin perdida (segun la model card) | No disponible |

La comparativa se limita a las versiones del mismo modelo base mencionadas en la documentacion. No se dispone de datos para comparar con otros modelos de 4B de otros fabricantes (p. ej., Llama 3.2 3B, Gemma 2 2B) en terminos de rendimiento o licencia.

## Limitaciones y advertencias

- Degradacion de calidad significativa: la KL divergence media de 1,04 frente al modelo bf16 indica una alteracion notable de la distribucion de probabilidades, que se agrava en tareas de tool calling (KL 1,34). No es recomendable para aplicaciones donde la precision de la salida sea critica.
- Riesgo de alucinacion: no se ha evaluado especificamente, pero la cuantizacion agresiva puede aumentar la probabilidad de respuestas incoherentes o inventadas, especialmente en contextos largos.
- Licencia no disponible: al no especificarse la licencia, no se puede garantizar el uso comercial. Se recomienda contactar con el autor o consultar la licencia del modelo base Qwen3.5-4B antes de utilizarlo en produccion.
- Soporte de hardware limitado: NVFP4 es una caracteristica relativamente nueva de las GPUs Blackwell. En hardware anterior, la dequantizacion puede anular las ventajas de memoria y velocidad.
- Sin informacion sobre sesgos: no se han publicado evaluaciones de sesgos o toxicidad para esta cuantizacion, ni para el modelo base en la documentacion proporcionada.
- Fecha de publicacion futura: el modelo fue creado el 1 de septiembre de 2026, lo que sugiere que puede ser una version experimental o de prueba.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mahadev9/Qwen3.5-4B-nvfp4
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Version FP8 del mismo autor: https://huggingface.co/mahadev9/Qwen3.5-4B-fp8
- Entrada en Ollama: https://ollama.com/library/qwen3.5:4b-nvfp4
- Ficha en LLMfit: https://llmfit.io/models/qwen3.5%3A4b%20nvfp4
- Repositorio de llm-compressor: https://github.com/vllm-project/llm-compressor
