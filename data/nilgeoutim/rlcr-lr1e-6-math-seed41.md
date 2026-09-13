# nilgeoutim/RLCR-lr1e-6-math-seed41

## Resumen

RLCR-lr1e-6-math-seed41 es un ajuste fino del modelo Qwen/Qwen2.5-3B publicado por el usuario nilgeoutim en HuggingFace. Es un modelo denso de 3.397.103.616 parametros (unos 3,4 mil millones) entrenado con aprendizaje por refuerzo mediante el algoritmo GRPO (Group Relative Policy Optimization), implementado con la libreria TRL de HuggingFace. El nombre del repositorio apunta a un experimento de razonamiento matematico (sufijo math) con tasa de aprendizaje 1e-6 y semilla 41, aunque el autor no documenta la metodologia, el dataset ni la funcion de recompensa en la model card.

El modelo parte de Qwen2.5-3B, un transformer decoder-only de la familia Qwen2.5, por lo que hereda las capacidades base de generacion de texto, razonamiento, codigo y soporte multilingue de ese modelo. El repositorio ocupa 6,8 GB y contiene pesos en safetensors, lo que corresponde a una precision de 16 bits (bf16/fp16). No se han publicado versiones cuantizadas ni pesos en otros formatos.

Su relevancia practica es la de un ejemplo reproducible de ajuste por RL con GRPO sobre un modelo pequeno: la model card enlaza el run publico de Weights & Biases con la traza de entrenamiento. Fuera de ese uso como material de estudio, la documentacion publicada es minima (es practicamente la plantilla automatica que genera TRL), no declara licencia y no incluye evaluaciones, por lo que debe tratarse como un experimento de investigacion y no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (heredada de Qwen/Qwen2.5-3B) |
| Parametros totales | 3.397.103.616 (3,4 B) |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen2.5-3B; no verificada para este ajuste |
| Tipos de cuantizacion | No se han publicado versiones cuantizadas; pesos originales en 16 bits (bf16/fp16) |
| Idiomas soportados | No disponible en la model card; el modelo base Qwen2.5 cubre 29 idiomas |
| Licencia | No disponible (el campo de la model card indica «license» sin especificar la licencia) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only causal con atencion por consultas agrupadas (GQA), propio de la familia Qwen2.5. El ajuste no modifica la topologia de la red, solo los pesos. El entrenamiento se realizo con GRPO, el algoritmo de optimizacion de politica introducido en el articulo DeepSeekMath (arXiv:2402.03300), que estima la ventaja relativa de cada respuesta dentro de un grupo de muestras generadas para la misma pregunta, evitando la necesidad de un modelo critico separado. La implementacion emplea TRL 0.16.0.dev0, Transformers 4.48.3, PyTorch 2.5.1+cu124, Datasets 4.0.0 y Tokenizers 0.21.1.

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, la funcion de recompensa utilizada (verificable o basada en modelo), ni si hubo una fase previa de SFT o DPO. Tampoco se detalla el barrido de hiperparametros mas alla del sufijo del nombre (lr = 1e-6, seed = 41). La unica traza publica del proceso es el run de Weights & Biases enlazado en la model card.

## Capacidades

- Generacion de texto conversacional en formato de chat, con plantilla de mensajes con roles (el ejemplo de la model card usa una lista de diccionarios con role y content).
- Razonamiento matematico: el nombre del experimento (math) y el uso de GRPO apuntan a un ajuste orientado a tareas de razonamiento, aunque no hay evaluacion publicada que lo confirme.
- Razonamiento multi-paso: GRPO esta disenado para optimizar cadenas de razonamiento, pero no se documenta el formato de salida ni si el modelo conserva un modo de pensamiento explicito.
- Capacidades heredadas del base Qwen2.5-3B: generacion de codigo, comprension lectora, resumen y clasificacion de texto.
- Soporte multilingue (heredado del base, 29 idiomas), sin confirmacion de que el ajuste lo preserve.
- No hay evidencia publicada de soporte de tool calling, function calling, agentes, vision, audio ni modo de pensamiento explicito en este ajuste concreto.

## Casos de uso

- Reproduccion de experimentos de RL: el modelo sirve como referencia para replicar un pipeline de GRPO con TRL sobre un modelo de 3B, comparando la configuracion (lr 1e-6, semilla 41) con otras del mismo barrido.
- Tutoria matematica en prototipos: se puede desplegar como asistente que resuelve problemas paso a paso, siempre que se valide la correccion con un verificador externo, dado que no hay benchmarks publicados.
- Generacion de datos sinteticos de razonamiento: usar el modelo para producir cadenas de razonamiento candidatas que despues se filtran y se reutilizan en un ajuste posterior o en destilacion.
- Linea base en evaluaciones comparativas: util como punto de partida (baseline) en estudios sobre tecnicas de RL aplicadas a modelos pequenos, midiendo la diferencia frente a Qwen2.5-3B sin ajustar.
- Asistente conversacional local: al ocupar unos 7 GB en 16 bits, cabe en GPU de consumo y permite ejecutar un chatbot privado sin conexion, con contexto de hasta 32.768 tokens heredado del base.
- Extraccion y estructuracion de informacion: tareas de resumen, clasificacion y conversion de texto libre a JSON en pipelines internos, siempre que se validen las salidas antes de usarlas.
- Generacion de codigo en entornos no criticos: autocompletado y explicacion de fragmentos en herramientas de desarrollo internas, con revision humana obligatoria.
- Investigacion academica sobre alineacion: estudio de como GRPO afecta a la diversidad de respuestas y al modo de fallo de un modelo de 3B en dominios fuera del matematico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, GSM8K, MATH, HumanEval ni ninguna otra metrica, y la busqueda web no ha devuelto datos de evaluacion de este repositorio.

## Requisitos de hardware

- VRAM estimada en 16 bits (bf16/fp16): unos 6,8 GB solo para los pesos, mas la cache KV; en la practica conviene reservar 9-12 GB segun la longitud de contexto.
- VRAM estimada en 8 bits: unos 3,5-4 GB de pesos.
- VRAM estimada en 4 bits (requiere cuantizacion propia, no publicada): unos 2-2,5 GB.
- GPU de consumo: si cabe. En 16 bits funciona en RTX 3060 12 GB, RTX 4070/4080, RTX 4090 y tarjetas con 12 GB o mas. En 4 bits cabria en GPU de 6-8 GB.
- GPU de centro de datos: A100, H100, L40S o L4 son validas y sobredimensionadas para un modelo de 3,4 B; permiten lotes grandes y contextos largos.
- Opciones de despliegue: transformers (pipeline de la model card), text-generation-inference (el repositorio lleva la etiqueta text-generation-inference y endpoints_compatible) y vLLM. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, ya que no se publican ficheros GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| RLCR-lr1e-6-math-seed41 | 3,4 B | 32.768 (heredado del base) | No disponible | safetensors en HuggingFace |
| Qwen/Qwen2.5-3B | 3,09 B | 32.768 | Apache-2.0 | safetensors, GGUF y cuantizaciones de la comunidad |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B | 128.000 | Llama 3.2 Community License | safetensors, GGUF y cuantizaciones |
| microsoft/Phi-3.5-mini-instruct | 3,8 B | 128.000 | MIT | safetensors, GGUF y cuantizaciones |

La ventaja de este ajuste frente a los anteriores es unicamente su valor como experimento de RL documentado con un run publico; en documentacion, licencia, cuantizaciones disponibles y contexto se situa por detras de las tres alternativas.

## Limitaciones y advertencias

- Licencia no declarada: la model card indica «license» sin especificar cual, lo que impide confirmar el uso comercial. El modelo base Qwen2.5-3B es Apache-2.0, pero el autor no aclara si mantiene esa licencia en el ajuste.
- Documentacion practicamente inexistente: la model card es la plantilla automatica de TRL y no describe dataset, recompensa, criterios de exito ni limitaciones.
- Riesgo de alucinacion: en un modelo de 3,4 B el riesgo es alto, especialmente en matematicas y en datos factuales; requiere verificacion externa.
- Sin evaluacion publicada: no hay evidencia objetiva de que el ajuste con GRPO mejore al base en ninguna tarea concreta.
- Idiomas y datos de entrenamiento no documentados: no se puede saber si el ajuste ha degradado el soporte multilingue o el rendimiento en codigo del modelo base.
- Contexto no confirmado: los 32.768 tokens corresponden al modelo base y no se ha verificado que se conserven tras el entrenamiento por RL.
- Formato unico: solo se publican pesos en safetensors de 16 bits; no hay GGUF, GPTQ ni AWQ, lo que obliga a cuantizar por cuenta propia para despliegues ligeros.
- Senales de adopcion nulas: 0 descargas y 1 «me gusta» en el momento de redactar esta ficha, sin issues ni discusiones que permitan contrastar el comportamiento real.
- Caveat de produccion: al no haber versiones fijadas ni pruebas de regresion, no se recomienda integrarlo en servicios con usuarios sin un sistema de validacion de salidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nilgeoutim/RLCR-lr1e-6-math-seed41
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B
- Run de entrenamiento en Weights & Biases: https://wandb.ai/1904167037-the-university-of-hong-kong/RLCR/runs/23g9adgm
- Repositorio de TRL: https://github.com/huggingface/trl
- Articulo de GRPO (DeepSeekMath): https://huggingface.co/papers/2402.03300 (arXiv:2402.03300)
