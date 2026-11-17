# hipfire-models/qwen3.5-4b

## Resumen

Qwen3.5-4B para hipfire es una distribucion pre-cuantizada del modelo base Qwen/Qwen3.5-4B, publicada por el usuario hipfire-models. No se trata de un modelo nuevo ni de un fine-tune con datos propios, sino de una conversion de los pesos originales de Qwen a los formatos propietarios del motor de inferencia hipfire, un runtime escrito en Rust sobre HIP orientado especificamente a GPUs de consumo AMD de las familias RDNA1 a RDNA4. El problema que resuelve es la falta de soporte eficiente de los modelos Qwen3.5 en hardware AMD consumer: hipfire elimina Python de la ruta critica y ofrece kernels GEMV optimizados para estas GPU.

El modelo base es un transformer hibrido con atencion DeltaNet (arquitectura hibrida que combina mecanismos de atencion lineal y atencion clasica), lo que reduce el coste de memoria de la cache KV frente a un transformer denso puro. El repositorio ocupa 11,8 GB e incluye tres variantes de cuantizacion (HF4, HF6 y MQ4) que van de 2,09 GB a 3,24 GB, todas con tokenizer y configuracion embebidos en el propio fichero del modelo.

Su relevancia es practica: permite ejecutar un modelo de 4B parametros en GPUs AMD de gama media con tan solo 4 GB de VRAM efectiva, con velocidades reportadas de hasta 211 tok/s en una RX 7900 XTX con la variante HF4. La variante MQ4 incorpora una puerta de calidad byte-exacta en decodificacion greedy que garantiza que la salida coincide con flujos de referencia, lo que la hace atractiva para despliegues donde la reproducibilidad importa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion DeltaNet (segun model card del autor) |
| Parametros totales | 4B (heredado del modelo base Qwen3.5-4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | HF4 (4-bit, grupos de 256), HF6 (6-bit, grupos de 256), MQ4 (MagnumQuant 4-bit con rotacion FWHT) |
| Idiomas soportados | no disponible |
| Licencia | MIT (motor hipfire); pesos sujetos a la licencia original de Qwen |
| Formato de pesos | .hf4, .hf6, .mq4 (formato propietario de hipfire, con tokenizer y config embebidos) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-4B original: un transformer hibrido que combina capas con atencion DeltaNet (un mecanismo de atencion lineal con estado recurrente) y capas de atencion clasica. Esta hibridacion reduce el crecimiento de la cache KV en contextos largos, lo que resulta especialmente relevante en GPUs consumer con poca VRAM. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base paso por fases de RLHF o DPO, ya que la model card de esta distribucion no los detalla.

La innovacion tecnica de esta publicacion no esta en el entrenamiento sino en la cuantizacion. La variante MQ4 aplica una transformada de Walsh-Hadamard (FWHT) a los pesos en el momento de la cuantizacion y rota el vector de entrada `x` con la misma transformada durante el GEMV en tiempo de inferencia. Esta rotacion aplana los valores atipicos (outliers) de los pesos y mejora la distribucion del error de cuantizacion, de modo que se obtiene una calidad de salida proxima a Q8 con un ancho de banda de 4 bits. Ademas, cada commit que toca codigo de kernel o de forward pass en hipfire se valida contra 9 flujos de decodificacion greedy byte-exactos, lo que actua como puerta de regresion numerica.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Qwen3.5-4B.
- Generacion de codigo y resolucion de problemas matematicos (capacidades del modelo base; no se aportan detalles adicionales en la model card).
- Decodificacion greedy byte-exacta garantizada en la variante MQ4, validada contra 9 flujos de referencia.
- Inferencia sin Python en la ruta critica, mediante motor Rust + HIP.
- Soporte de tool calling, agentes o modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en GPUs AMD consumer: el modelo esta disenado para ejecutarse en RDNA1-RDNA4 con 4-5 GB de VRAM, lo que permite correr un LLM de 4B en tarjetas como la RX 5700 XT o la RX 7900 XTX sin necesidad de CUDA ni de Python.
- Inferencia de baja latencia en local: con 211 tok/s en una RX 7900 XTX (HF4) y 187 tok/s (MQ4), es adecuado para asistentes interactivos, autocompletado o generacion en tiempo real en estaciones de trabajo con GPU AMD.
- Pipelines reproducibles: la puerta de calidad byte-exacta de MQ4 permite usar el modelo en entornos donde se requiere que la salida sea determinista y verificable entre versiones del motor.
- Prototipado de agentes y herramientas: al ser un modelo de 4B con contexto gestionado por atencion hibrida, sirve para iterar rapidamente en local sobre flujos de tool calling antes de escalar a modelos mayores.
- Educacion e investigacion: el formato embebido (tokenizer y config dentro del fichero) simplifica la distribucion del modelo en entornos docentes o de laboratorio con hardware AMD.
- Sustitucion de modelos en produccion con restricciones de VRAM: HF6 ofrece la menor perdida de precision frente a FP16 con un coste de ~15% de velocidad, util cuando hay margen de memoria y la exactitud es prioritaria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento son de velocidad de inferencia (forward-only, tok/s) reportados por el autor:

| Variante | Tamano | VRAM minima | RX 7900 XTX (tok/s) | RX 5700 XT |
|---|---|---|---|---|
| HF4 | 2,09 GB | 4 GB | 211 | TBD |
| HF6 | 3,24 GB | 5 GB | no disponible | TBD |
| MQ4 | 2,41 GB | 4 GB | 187 | TBD |

## Requisitos de hardware

- VRAM estimada: 4 GB para HF4 y MQ4; 5 GB para HF6.
- GPU recomendadas: AMD RDNA1-RDNA4. El autor reporta velocidades en RX 7900 XTX (RDNA3) y deja como TBD las de RX 5700 XT (RDNA1).
- Compatibilidad con GPU consumer: si, en GPUs AMD consumer de las familias RDNA1 a RDNA4. No se menciona soporte para NVIDIA ni para GPUs integradas.
- Opciones de despliegue: exclusivamente el motor hipfire (Rust + HIP). No se indica soporte para vLLM, llama.cpp, Ollama ni TGI, ya que los formatos .hf4/.hf6/.mq4 son propietarios.
- Latencia y throughput: 211 tok/s (HF4) y 187 tok/s (MQ4) en RX 7900 XTX; HF6 es aproximadamente un 15% mas lento que HF4 segun el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| hipfire Qwen3.5-4B (esta ficha) | 4B | no disponible | .hf4/.hf6/.mq4 | MIT (motor) + licencia Qwen (pesos) | AMD RDNA1-RDNA4 |
| Qwen/Qwen3.5-4B (original) | 4B | no disponible | safetensors | licencia Qwen | GPU genericas (CUDA/ROCm) |
| Otras cuantizaciones GGUF de Qwen3.5-4B | 4B | no disponible | GGUF | licencia Qwen | llama.cpp, Ollama, multiples backends |

La diferencia principal frente al modelo original y frente a cuantizaciones GGUF es el backend: esta distribucion solo funciona con hipfire y esta optimizada para AMD consumer, mientras que las alternativas son portables a mas hardware. No se dispone de datos de benchmarks que permitan comparar calidad entre estas opciones.

## Limitaciones y advertencias

- Dependencia total del motor hipfire: los formatos .hf4, .hf6 y .mq4 no son compatibles con llama.cpp, vLLM, Ollama ni TGI, lo que limita la portabilidad.
- Soporte exclusivo para GPUs AMD RDNA1-RDNA4; no hay soporte documentado para NVIDIA, CPU o GPUs integradas.
- Sin datos publicados de benchmarks de calidad ni de evaluacion de sesgos; no se puede verificar el rendimiento real frente al modelo base mas alla de la puerta de calidad greedy de MQ4.
- La model card no especifica la longitud de contexto, los idiomas soportados ni las capacidades de tool calling o agentes del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad.
- Riesgo de alucinacion inherente al modelo base de 4B; no se aportan evaluaciones especificas.
- La licencia del motor es MIT, pero los pesos estan sujetos a la licencia original de Qwen; conviene revisar sus terminos para uso comercial.
- El proyecto hipfire se encuentra en fase alpha (0.1.4-alpha), lo que implica posible inestabilidad de la API y del motor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hipfire-models/qwen3.5-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio del motor hipfire: https://github.com/Kaden-Schutt/hipfire
- Listado de modelos soportados: https://github.com/Kaden-Schutt/hipfire/blob/master/docs/MODELS.md
- Baseline de calidad: https://github.com/Kaden-Schutt/hipfire/tree/master/tests/quality-baselines
- Script de instalacion: https://raw.githubusercontent.com/Kaden-Schutt/hipfire/master/scripts/install.sh
