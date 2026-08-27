# jiahueic/myinvois-specialist

## Resumen

El modelo `jiahueic/myinvois-specialist` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `Qwen/Qwen2.5-0.5B-Instruct`, un transformer de 0.5 mil millones de parámetros optimizado para instrucciones. El adaptador, denominado `myinvois-specialist-synthetic-lora-v3`, ha sido ajustado mediante Supervised Fine-Tuning (SFT) con el framework TRL de Hugging Face, aparentemente con datos sintéticos, con el objetivo de especializarse en el dominio de la facturación electrónica, concretamente en el sistema MyInvois de Malasia (LHDN). El repositorio tiene un tamaño de 0.1 GB, lo que sugiere que solo contiene los pesos del adaptador, no el modelo completo.

La relevancia de este modelo radica en su enfoque: en lugar de desplegar un modelo de gran tamaño, se parte de un modelo pequeño (0.5B) y se le añade una capa de adaptación ligera para una tarea específica. Esto permite ajustes de bajo coste y despliegue en hardware modesto. Sin embargo, la información pública es muy escasa: no se especifican datos de entrenamiento, métricas de evaluación, licencia ni idiomas soportados. El modelo parece estar en una fase experimental o de demostración, sin descargas ni valoraciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5) con adaptador LoRA |
| Parametros totales | 0.5B (modelo base) + adaptador LoRA (tamano no especificado, repo de 0.1 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (del modelo base Qwen2.5-0.5B-Instruct; no confirmado para el adaptador) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base puede cuantizarse con GPTQ, AWQ, GGUF, etc.) |
| Idiomas soportados | No disponible (el modelo base soporta ingles, chino y otros; el adaptador no especifica) |
| Licencia | No disponible (el modelo base es Apache 2.0, pero el adaptador no declara licencia) |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre `Qwen2.5-0.5B-Instruct`. La arquitectura base es un transformer decoder-only con atención de ventana deslizante y atención completa alternadas, perteneciente a la familia Qwen2.5. El adaptador LoRA introduce matrices de bajo rango en las capas de atención y feed-forward, lo que permite un ajuste eficiente con un número reducido de parámetros entrenables. El entrenamiento se realizó mediante SFT (Supervised Fine-Tuning) utilizando la librería TRL (Transformers Reinforcement Learning) de Hugging Face, con PEFT 0.20.0, Transformers 5.15.1 y PyTorch 2.13.0. El nombre del modelo (`synthetic-lora-v3`) sugiere que se emplearon datos sintéticos y que es la tercera versión del adaptador, pero no se proporcionan detalles sobre el volumen, la composición o el preprocesamiento del dataset. Tampoco se menciona el uso de RLHF, DPO u otras técnicas de alineación adicionales.

## Capacidades

- Generacion de texto: hereda las capacidades del modelo base Qwen2.5-0.5B-Instruct, incluyendo generacion de texto conversacional y respuesta a instrucciones.
- Razonamiento y conocimiento general: el modelo base tiene un rendimiento moderado en tareas de razonamiento y conocimiento, aunque limitado por su tamano (0.5B).
- Especializacion en facturacion electronica: el adaptador esta disenado para tareas relacionadas con el sistema MyInvois de Malasia, como la extraccion de campos de facturas, el mapeo de datos o la generacion de documentos electronicos. No obstante, no hay ejemplos publicados que demuestren su eficacia.
- Soporte de tool calling: no disponible (el modelo base no lo soporta de forma nativa; no se ha anadido en el adaptador).
- Capacidades multilingues: no disponible (el modelo base soporta varios idiomas, pero el adaptador no especifica ninguno).
- Otras capacidades: no se han documentado capacidades especiales como vision, audio o modo thinking.

## Casos de uso

- Extraccion de datos de facturas: el modelo podria utilizarse para extraer campos estructurados (numero de factura, fecha, importe, IVA, etc.) a partir de texto plano o descripciones de facturas, gracias al ajuste especifico en el dominio MyInvois.
- Asistente de generacion de facturas electronicas: podria ayudar a redactar o completar facturas en el formato requerido por LHDN MyInvois, a partir de entradas en lenguaje natural.
- Validacion de datos de facturas: el adaptador podria revisar si los datos de una factura cumplen los requisitos del esquema MyInvois, senalando errores o campos faltantes.
- Integracion en flujos de trabajo de contabilidad: al ser un modelo pequeno, puede ejecutarse localmente en equipos de oficina para preprocesar facturas antes de enviarlas a la API de MyInvois.
- Educacion y formacion: podria servir como ejemplo didactico de como adaptar un modelo pequeno a un dominio especifico con LoRA y SFT, sin necesidad de grandes recursos.
- Prototipado rapido: para desarrolladores que quieran experimentar con un asistente de facturacion sin depender de APIs externas, este adaptador ofrece una base ligera y de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni metricas especificas del dominio de facturacion. Tampoco se comparan con otros modelos. Por tanto, no es posible evaluar cuantitativamente su rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 0.5B con adaptador LoRA, la inferencia requiere aproximadamente 1-2 GB de VRAM en precision FP16, y menos de 1 GB con cuantizacion de 4 bits. El adaptador anade un overhead minimo.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente, por ejemplo NVIDIA GTX 1650, RTX 2060, RTX 3060, o incluso CPUs modernas con suficiente RAM.
- Compatibilidad con consumer GPU: si, cabe en practicamente cualquier GPU moderna, incluidas las integradas de gama alta.
- Opciones de despliegue: se puede servir con vLLM, llama.cpp, Ollama, o mediante la API de Transformers de Hugging Face. Al ser un adaptador PEFT, debe cargarse junto con el modelo base.
- Latencia y throughput: no se han publicado mediciones. Dado el tamano, se espera una latencia de decenas de milisegundos por token en GPU consumer y un throughput de cientos de tokens por segundo en hardware moderno.

## Comparativa con modelos similares

No se dispone de modelos comparables especificamente entrenados para MyInvois o facturacion electronica con un tamano similar. Como referencia, se compara con el modelo base y con otros modelos pequenos de proposito general:

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| Qwen2.5-0.5B-Instruct (base) | 0.5B | 32K | Apache 2.0 | General, instruct |
| jiahueic/myinvois-specialist | 0.5B + LoRA | 32K (heredado) | No disponible | Facturacion MyInvois |
| Llama-3.2-1B-Instruct | 1B | 128K | Llama 3.2 | General, instruct |

La comparacion es limitada porque no hay modelos publicos equivalentes en el dominio especifico. El adaptador se distingue por su tamano reducido y su enfoque en un nicho concreto, pero carece de validacion publica.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado con datos sinteticos, puede heredar sesgos del proceso de generacion de datos, que no se han documentado.
- Riesgo de alucinacion: como cualquier modelo pequeno, puede generar respuestas plausibles pero incorrectas, especialmente en tareas de facturacion donde la precision es critica.
- Limitaciones de contexto: la ventana de 32K tokens es amplia, pero el adaptador no ha sido probado en contextos largos especificos de facturacion.
- Restricciones de licencia: la licencia del adaptador no esta declarada, lo que impide su uso comercial sin una aclaracion previa. El modelo base es Apache 2.0, pero el adaptador podria tener restricciones adicionales.
- Carencia de evaluacion: no hay benchmarks ni ejemplos de uso, por lo que no se puede garantizar su funcionamiento en produccion.
- Dependencia del modelo base: el adaptador solo funciona con Qwen2.5-0.5B-Instruct; no es portable a otros modelos.
- Fecha de creacion futura: el modelo fue creado en agosto de 2026, lo que sugiere que podria ser un artefacto experimental o una prueba de concepto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jiahueic/myinvois-specialist
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Perfil de GitHub del autor: https://github.com/jiahueic
- TRL (libreria de entrenamiento): https://github.com/huggingface/trl
- Informacion sobre MyInvois (sistema de facturacion electronica de Malasia): https://www.hasil.gov.my/myinvois/ (no verificado en la busqueda, pero es la referencia oficial)
