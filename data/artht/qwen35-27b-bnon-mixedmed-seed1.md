# ArthT/qwen35-27b-bnon-mixedmed-seed1

## Resumen

El modelo `ArthT/qwen35-27b-bnon-mixedmed-seed1` es un ajuste fino (fine-tune) del modelo base `Qwen/Qwen3.5-27B`, desarrollado por el usuario ArthT mediante entrenamiento supervisado (SFT) con la librería TRL y la herramienta Unsloth. El nombre sugiere una especialización en dominios médicos mixtos ("mixedmed"), aunque la model card no proporciona detalles sobre el dataset ni los objetivos concretos del ajuste. Se publica en formato safetensors y ocupa 89,9 GB en el repositorio, lo que indica pesos en precisión alta (probablemente bf16 o fp16).

El modelo base, Qwen3.5-27B, es un modelo denso de 27 000 millones de parámetros lanzado por Alibaba en febrero de 2026, con arquitectura que combina Gated Delta Networks y redes feed-forward, según fuentes externas. Este fine-tune hereda las capacidades del base, pero al carecer de documentación adicional, su comportamiento específico no está verificado. Es relevante porque Qwen3.5 es una familia reciente de modelos open source con buen rendimiento en razonamiento y código, y este ajuste podría aportar valor en entornos médicos, aunque no hay evidencia pública que lo confirme.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.5-27B) |
| Parametros totales | 27 000 millones (27B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta hasta 256K, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (el modelo base soporta multiples idiomas, pero no se especifica) |
| Licencia | no disponible (la model card indica "licence: license" sin detallar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen3.5-27B, que emplea una arquitectura transformer densa con Gated Delta Networks y capas feed-forward, según informacion externa. El entrenamiento se realizo con SFT (supervised fine-tuning) utilizando la libreria TRL (version 0.24.0) y Unsloth, como indican los tags del repositorio. No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos ni si se aplicaron tecnicas adicionales como RLHF o DPO. El nombre del modelo sugiere una mezcla de dominios medicos ("mixedmed"), pero no hay confirmacion en la model card. Tampoco se documentan innovaciones tecnicas propias del ajuste; se trata de un fine-tune estandar sobre el base.

## Capacidades

- Generacion de texto y continuacion de conversaciones multi-turno, heredadas del modelo base Qwen3.5-27B.
- Razonamiento y resolucion de problemas, aunque no hay benchmarks especificos para este fine-tune.
- Capacidades de codigo y matematicas, propias del modelo base, no verificadas en esta variante.
- Posible soporte de tool calling y function calling, ya que Qwen3.5 lo incluye, pero no esta documentado en este repositorio.
- Capacidades multilingues, asumibles por el base, pero no confirmadas.
- No se ha documentado soporte de vision, audio u otras modalidades; el base es multimodal segun fuentes externas, pero no se garantiza en este ajuste.

## Casos de uso

- Asistencia en entornos medicos: si el fine-tune realmente esta orientado a dominios medicos, podria usarse para responder consultas clinicas, resumir historiales o apoyar la redaccion de informes, aunque no hay evidencia publica de su rendimiento en estas tareas.
- Generacion de texto general: como LLM de 27B, puede emplearse para redactar articulos, correos o contenido creativo, siempre que se valide su calidad en el dominio deseado.
- Desarrollo de chatbots: su capacidad de conversacion multi-turno permite integrarlo en sistemas de atencion al cliente o asistentes virtuales, con la precaucion de que no hay datos de evaluacion.
- Soporte de codigo: puede asistir en la generacion y revision de codigo, aunque no se han publicado resultados en benchmarks como HumanEval.
- Investigacion academica: util como modelo base para experimentos de fine-tuning adicional o para estudiar el comportamiento de ajustes sobre Qwen3.5-27B.
- Prototipado rapido: al estar disponible en HuggingFace con formato safetensors, se puede cargar con transformers para pruebas locales o en la nube, aunque se requiere hardware adecuado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas para este fine-tune especifico. Se recomienda evaluar el modelo en las tareas objetivo antes de usarlo en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16 (27B parametros), se necesitan aproximadamente 54 GB de VRAM. Con cuantizacion a 8 bits, unos 27 GB; a 4 bits, unos 13,5 GB. Sin embargo, no se ofrecen cuantizaciones oficiales en el repositorio.
- GPU recomendadas: para inferencia sin cuantizar, una A100 de 80 GB o H100. Con cuantizacion 4-bit, una RTX 4090 (24 GB) o RTX 6000 Ada (48 GB) podrian ser suficientes.
- Si cabe en consumer GPU: si, con cuantizacion 4-bit y una GPU de 24 GB, aunque habria que generar los archivos GGUF manualmente con herramientas como llama.cpp.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (si se convierte a GGUF) o directamente con transformers en Python.
- Latencia y throughput: no disponibles; dependen del hardware y la cuantizacion.

## Comparativa con modelos similares

No se dispone de informacion sobre otros fine-tunes de Qwen3.5-27B con los que comparar. Como referencia, se puede comparar con el modelo base Qwen3.5-27B y con otros LLMs de tamano similar como Qwen2.5-32B o Llama 3.1 70B, pero no hay datos de rendimiento de este fine-tune. La comparativa queda pendiente de evaluaciones publicas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ArthT/qwen35-27b-bnon-mixedmed-seed1 | 27B | no disponible | no disponible | HuggingFace |
| Qwen/Qwen3.5-27B (base) | 27B | hasta 256K (segun fuentes) | Apache 2.0 (segun Qwen) | HuggingFace |
| Qwen2.5-32B | 32B | 128K | Apache 2.0 | HuggingFace |

## Limitaciones y advertencias

- No hay documentacion sobre el dataset de entrenamiento, por lo que se desconocen posibles sesgos introducidos en el ajuste.
- Riesgo de alucinacion y generacion de informacion incorrecta, comun en LLMs, especialmente en dominios especializados como el medico.
- La licencia no esta especificada, lo que impide conocer las restricciones de uso comercial o redistribucion.
- No se han publicado evaluaciones de rendimiento, por lo que su calidad en tareas concretas es incierta.
- El contexto maximo no esta confirmado; si se usa con ventanas largas, podria degradarse el rendimiento.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- Para produccion, se requiere una evaluacion exhaustiva y, probablemente, cuantizacion y optimizacion adicionales.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ArthT/qwen35-27b-bnon-mixedmed-seed1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Coleccion Qwen3.5 en HuggingFace: https://huggingface.co/collections/Qwen/qwen35
- Guia sobre Qwen 3.6 (referencia de arquitectura): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Especificaciones de Qwen3.5-27B: https://apxml.com/models/qwen35-27b
