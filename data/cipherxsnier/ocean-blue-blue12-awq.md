# cipherxsnier/ocean-blue-blue12-awq

## Resumen

Ocean Blue Blue-12 AWQ es la version cuantizada a 4 bits mediante AWQ del modelo Ocean Blue Blue-12, un ajuste fino con LoRA sobre Qwen2.5-14B-Instruct que su autor, el usuario de Hugging Face cipherxsnier, ha fusionado y comprimido para que pueda servirse en una GPU de 24 GB de VRAM. El modelo conserva la arquitectura transformer decoder-only densa de Qwen2.5, con 14.770.033.664 parametros totales (aproximadamente 14,8 mil millones) y sin mezcla de expertos, por lo que todos los parametros se activan en cada pasada.

La relevancia de esta publicacion es fundamentalmente practica: el checkpoint original en precision nativa requiere mas memoria de la que ofrecen las GPU de consumo de gama alta, mientras que esta variante AWQ de 4 bits con grupo de cuantizacion de 128 reduce el peso del repositorio a unos 10 GB y permite el despliegue en tarjetas como la RTX 4090 o la RTX A6000. El autor advierte explicitamente de que la cuantizacion puede introducir una ligera perdida de precision respecto al modelo base.

Se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, sin model card detallada, sin idiomas declarados y sin resultados de benchmarks publicados en la informacion disponible. La licencia Apache 2.0 heredada del modelo base facilita su uso comercial, pero la ausencia de documentacion sobre el proceso de ajuste y sobre los datos de entrenamiento limita seriamente la evaluacion de su calidad y de sus riesgos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-14B-Instruct soporta 32.768 tokens nativos, ampliables, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | 4 bits AWQ con grupo de cuantizacion de 128 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 10,0 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-14B-Instruct: un transformer decoder-only denso con atencion causal estandar, normalizacion RMSNorm, activacion SwiGLU y sesgos de atencion tipo Qwen, sin mecanismos de atencion lineal ni capas SSM. Sobre ese modelo base, el autor aplico un ajuste fino con LoRA que posteriormente fusiono en los pesos originales, generando el checkpoint Ocean Blue Blue-12. La variante aqui descrita aplica cuantizacion AWQ (Activation-aware Weight Quantization) a 4 bits con tamano de grupo 128, una tecnica que escala los pesos segun la magnitud de las activaciones para minimizar el error de cuantizacion en las capas mas sensibles.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF o DPO, ni sobre hiperparametros del LoRA (rango, alpha, capas objetivo). Tampoco se documenta el proceso de calibracion empleado para AWQ, mas alla de los parametros de cuantizacion indicados. Esta opacidad impide verificar que el ajuste fino haya preservado las capacidades del modelo original ni evaluar sesgos introducidos por los datos de entrenamiento.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo base Qwen2.5-14B-Instruct sobre el que se construyo el ajuste.
- Generacion de codigo y resolucion de problemas matematicos, capacidades presentes en la familia Qwen2.5 pero no verificadas especificamente para este checkpoint.
- Soporte de tool calling y function calling, presumiblemente heredado del formato de chat de Qwen2.5-Instruct, aunque no se documenta en la model card.
- Capacidad de conversacion multi-turno mediante plantilla de chat tipo Qwen, no confirmada explicitamente en la informacion disponible.
- Capacidades multilingues: no disponibles; el autor no declara idiomas soportados.
- Modo de razonamiento extendido (thinking): no disponible.
- Vision y audio: no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Despliegue en estaciones de trabajo con una unica GPU de 24 GB: el formato AWQ de 4 bits reduce el peso a unos 10 GB, lo que permite cargar el modelo completo en una RTX 4090 o RTX A6000 junto con una ventana de contexto moderada y margen para la cache KV, algo inviable con el checkpoint en bf16.
- Prototipado de asistentes conversacionales: al derivar de un modelo Instruct, puede emplearse para construir demos de atencion al cliente o asistentes internos en entornos donde no se dispone de GPU de datacenter, aceptando la ligera perdida de precision que advierte el autor.
- Evaluacion comparativa de tecnicas de cuantizacion: sirve como caso de estudio para medir el impacto de AWQ 4 bits con grupo 128 frente al modelo original en tareas de razonamiento y codigo, siempre que se ejecuten las evaluaciones pertinentes.
- Generacion asistida de codigo en local: integrable en editores o pipelines internos mediante servidores compatibles con la API de OpenAI, con la cautela de que no hay benchmarks que respalden su calidad en HumanEval o similares.
- Investigacion sobre ajustes finos comunitarios: util para estudiar como se comportan los LoRA fusionados y cuantizados sobre Qwen2.5 en comparacion con el modelo base sin ajustar.
- Fine-tuning adicional o destilacion: al estar en safetensors y con licencia Apache 2.0, puede servir como punto de partida para nuevos ajustes, aunque partir de pesos ya cuantizados a 4 bits degrada la calidad de cualquier entrenamiento posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la pagina del modelo base (cipherxsnier/ocean-blue-blue12) para consultar puntuaciones, pero no se incluyen cifras en los datos proporcionados, por lo que no se presenta tabla comparativa de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 10-11 GB solo para los pesos en AWQ 4 bits; con cache KV para contextos de 8.000 a 16.000 tokens y overhead del runtime, el consumo realista se situa entre 14 y 20 GB.
- GPU recomendadas: RTX 4090 (24 GB), RTX A6000 (48 GB), L40S (48 GB), A100 40/80 GB y H100 para despliegues con mayor concurrencia.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 4080 Super (16 GB, con contextos reducidos) y RTX 3090 (24 GB); en tarjetas de 12 GB solo con contextos muy cortos o cuantizacion adicional.
- Opciones de despliegue: vLLM y TGI con soporte AWQ, AutoAWQ para carga directa en Transformers, y llama.cpp u Ollama si se convierte a GGUF (no se distribuye ese formato en el repositorio).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ocean Blue Blue-12 AWQ | 14,77 B | No disponible | AWQ 4 bits (grupo 128) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen2.5-14B-Instruct | 14,7 B | 32.768 tokens (nativo) | bf16, GPTQ, AWQ, GGUF | Apache 2.0 | Hugging Face, ampliamente utilizado |
| Ocean Blue Blue-12 (base) | 14,77 B | No disponible | bf16 | Apache 2.0 | Hugging Face, sin datos de uso |

La comparacion directa con Qwen2.5-14B-Instruct es la mas relevante, ya que este modelo deriva de el mediante LoRA y cuantizacion. No se dispone de datos de rendimiento del ajuste fino que permitan afirmar una mejora sobre el original, y la falta de benchmarks y de documentacion del entrenamiento impide establecer comparaciones cuantitativas con alternativas como Mistral-Nemo-12B o Llama-3.1-8B-Instruct.

## Limitaciones y advertencias

- La cuantizacion AWQ a 4 bits puede degradar la precision respecto al modelo fusionado en bf16, tal como advierte el propio autor; no se han publicado mediciones de esa perdida.
- No hay informacion sobre los datos de entrenamiento del LoRA, por lo que se desconocen los sesgos que pueda haber introducido el ajuste fino.
- Riesgo de alucinacion inherente a los modelos de lenguaje de esta escala, agravado por la ausencia de evaluaciones publicadas.
- No se declaran idiomas soportados; el comportamiento en castellano no esta verificado.
- La longitud de contexto efectiva no esta documentada para este checkpoint, aunque el modelo base la soporta ampliamente.
- Modelo con cero descargas y cero likes: no existe validacion por parte de la comunidad ni informes independientes de calidad.
- La licencia Apache 2.0 permite uso comercial, pero el usuario asume toda la responsabilidad sobre el cumplimiento y sobre la calidad del modelo en produccion.
- El repositorio no incluye formato GGUF, de modo que el despliegue en llama.cpp u Ollama requiere una conversion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cipherxsnier/ocean-blue-blue12-awq
- Modelo base (Ocean Blue Blue-12): https://huggingface.co/cipherxsnier/ocean-blue-blue12
- Repositorio de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Paper de Qwen2.5: https://arxiv.org/abs/2412.15115
- Paper de AWQ: https://arxiv.org/abs/2306.00978
- Repositorio de AutoAWQ: https://github.com/casper-hansen/AutoAWQ
