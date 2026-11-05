# nnkhetan/qwen2.5-7b-10k-extract-w8a8

## Resumen

El modelo `nnkhetan/qwen2.5-7b-10k-extract-w8a8` es un ajuste fino (fine-tuning) del modelo `Qwen/Qwen2.5-7B-Instruct` de Alibaba, especializado en la extraccion de informacion estructurada a partir de formularios SEC 10-K (informes anuales de empresas cotizadas en EE. UU.). Lo desarrolla el usuario de HuggingFace `nnkhetan` y esta disenado para devolver la informacion extraida en formato JSON, lo que lo hace adecuado para pipelines de procesamiento documental financiero automatizado.

El modelo parte de la arquitectura transformer densa de Qwen2.5-7B-Instruct (7.615.616.512 parametros) y ha sido ajustado mediante QLoRA sobre un dataset de documentos 10-K. Posteriormente se ha cuantizado a 8 bits en pesos y activaciones (W8A8) usando `compressed-tensors`, lo que reduce el espacio en disco a aproximadamente 8,7 GB y facilita el despliegue en `vLLM` con kernels de cuantizacion.

Su relevancia radica en que combina un modelo base ampliamente conocido y con buen rendimiento en instrucciones con una tarea muy concreta (extraccion de campos financieros a JSON) y un formato de cuantizacion listo para produccion con vLLM. La licencia Apache 2.0 y el acceso restringido (gated) son los principales condicionantes a tener en cuenta antes de usarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | W8A8 (8 bits en pesos y activaciones) mediante `compressed-tensors` |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers y vLLM) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only denso con atencion causal estandar y mecanismos de RoPE para codificacion posicional. Al ser un fine-tuning de `Qwen2.5-7B-Instruct`, hereda las innovaciones del modelo base: atencion con GQA (grouped-query attention) y un preentrenamiento sobre un corpus multilingue de gran escala. No se dispone de informacion detallada sobre la composicion exacta del dataset de preentrenamiento del modelo base en la informacion proporcionada.

El ajuste fino se realizo mediante QLoRA (cuantizacion de 4 bits del modelo base durante el entrenamiento y adaptadores de bajo rango), segun indican las etiquetas del repositorio. El dataset de entrenamiento son documentos SEC 10-K, y la tarea objetivo es la extraccion de informacion en formato JSON. Tras el ajuste, el modelo se cuantizo a W8A8 con `compressed-tensors`, un formato que permite su uso directo en vLLM con kernels de cuantizacion optimizados. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO adicionales.

## Capacidades

- Extraccion de informacion estructurada de documentos financieros SEC 10-K en formato JSON.
- Generacion de texto conversacional (heredada del modelo base instruct).
- Razonamiento sobre documentos largos: al estar basado en Qwen2.5-7B-Instruct, puede manejar contextos extensos, aunque la longitud exacta no se especifica en la informacion disponible.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada (el modelo base lo soporta, pero no se verifica para este fine-tuning).
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- Capacidades especiales: salida en JSON para integracion en pipelines de extraccion; cuantizacion W8A8 lista para vLLM.

## Casos de uso

- Extraccion automatizada de campos financieros de informes 10-K: el modelo recibe el texto de un formulario SEC 10-K y devuelve un JSON con los campos de interes (ingresos, gastos, activos, pasivos, etc.), lo que permite poblar bases de datos financieras sin intervencion manual.
- Procesamiento por lotes de documentos regulatorios: integrado en un pipeline con vLLM, puede procesar grandes volumenes de 10-K en paralelo gracias a la cuantizacion W8A8, que reduce el uso de VRAM y aumenta el throughput.
- Enriquecimiento de bases de datos financieras: los JSON generados se pueden cargar directamente en un data warehouse o en un sistema de analitica para comparativas entre empresas y periodos.
- Automatizacion de due diligence: analistas pueden usar el modelo para extraer rapidamente datos clave de decenas de informes anuales antes de una operacion corporativa, reduciendo el tiempo de revision manual.
- Generacion de resumenes estructurados para informes internos: a partir del JSON extraido, se pueden construir tableros o informes automaticos con las metricas financieras mas relevantes de cada empresa.
- Integracion en APIs de extraccion documental: el modelo puede servirse mediante vLLM con una API compatible con OpenAI y usarse como backend de un servicio de extraccion de documentos financieros para clientes internos o externos.
- Prototipado rapido en investigacion financiera: investigadores pueden desplegar el modelo en una unica GPU consumer (dada la cuantizacion W8A8) para experimentar con extraccion de datos de 10-K sin necesidad de infraestructura de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al estar cuantizado a W8A8 (8 bits en pesos y activaciones), el modelo requiere aproximadamente 8-9 GB de VRAM solo para los pesos, mas el espacio para el KV cache y las activaciones. En la practica, se recomienda al menos 16 GB de VRAM para contextos moderados.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, L40S, o GPUs consumer de gama alta como RTX 4090 (24 GB) o RTX 3090 (24 GB).
- Cabe en GPU consumer: si, en RTX 4090, RTX 3090 o similares con 24 GB de VRAM, siempre que se limite la longitud de contexto y el tamano de batch.
- Opciones de despliegue: vLLM (soporte nativo de `compressed-tensors` W8A8), transformers con `compressed-tensors`, text-generation-inference (TGI). No se garantiza soporte en llama.cpp u Ollama para este formato de cuantizacion concreto.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Acceso |
|---|---|---|---|---|---|
| nnkhetan/qwen2.5-7b-10k-extract-w8a8 | 7,6 B | no disponible | W8A8 | Apache 2.0 | Gated |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 32.768 tokens (modelo base) | FP16/BF16, GPTQ, AWQ | Apache 2.0 | Abierto |
| Qwen/Qwen2.5-7B | 7,6 B | 32.768 tokens (modelo base) | FP16/BF16 | Apache 2.0 | Abierto |

La comparativa se limita al modelo base y su variante preentrenada, ya que no se dispone de informacion sobre otros fine-tunes especializados en extraccion de 10-K con los que comparar directamente. El modelo de `nnkhetan` se diferencia por su especializacion en la tarea y por la cuantizacion W8A8 lista para vLLM, a costa de un acceso restringido y de un unico idioma soportado.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones en HuggingFace antes de descargar el modelo, lo que puede complicar su uso en pipelines automatizados o en entornos sin intervencion manual.
- Especializacion estrecha: el ajuste fino esta orientado a la extraccion de informacion de documentos SEC 10-K; su rendimiento en otras tareas o dominios puede degradarse respecto al modelo base.
- Idioma: solo se declara soporte para ingles, lo que limita su uso con documentacion en castellano u otros idiomas.
- Riesgo de alucinacion: como todo modelo generativo, puede inventar campos o valores en el JSON de salida, especialmente si el documento de entrada es ambiguo o esta mal formateado. Se recomienda validacion posterior y esquemas JSON estrictos.
- Sesgos: al derivar de Qwen2.5-7B-Instruct, puede heredar sesgos presentes en los datos de preentrenamiento del modelo base, aunque no se documentan sesgos especificos en la informacion proporcionada.
- Limitaciones de contexto: la longitud de contexto efectiva no se especifica en la informacion del repositorio; conviene verificar el comportamiento con documentos 10-K largos antes de usarlo en produccion.
- Licencia: Apache 2.0 permite uso comercial, pero el acceso gated y la ausencia de garantias del autor original deben tenerse en cuenta en entornos productivos.
- Formato de cuantizacion: W8A8 con `compressed-tensors` puede no ser compatible con todos los frameworks de inferencia; verificar el soporte en el stack elegido antes de desplegar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nnkhetan/qwen2.5-7b-10k-extract-w8a8
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Documentacion de `compressed-tensors`: https://github.com/neuralmagic/compressed-tensors
- Documentacion de vLLM: https://docs.vllm.ai/
