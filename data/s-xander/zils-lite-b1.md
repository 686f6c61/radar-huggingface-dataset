# s-xander/zils-lite-b1

## Resumen

Zils-lite-b1 es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario s-xander bajo el identificador `s-xander/zils-lite-b1`. Se trata de un modelo de aproximadamente 853 millones de parametros, empaquetado en safetensors con un repositorio de 1,7 GB, y esta asociado al ecosistema Zils, concretamente al pool de modelos "d3-lite soup" de la subred 127 de Bittensor (SN127). La model card es extremadamente escueta y solo indica que es un fine-tune para ese pool, remitiendo a un fichero NOTICE para los modelos upstream.

El modelo hereda la arquitectura y el tokenizador de Qwen3.5-0.8B, etiquetado en Hugging Face con el tag `qwen3_5`, e incluye codigo personalizado (`custom_code`), lo que implica que su carga requiere confiar en implementaciones remotas o instalar dependencias especificas. La licencia declarada es Apache 2.0, lo que facilita su uso comercial, aunque la ausencia de documentacion sobre datos de entrenamiento, idiomas o evaluacion limita seriamente su adopcion en produccion sin una validacion previa por parte del usuario.

Su relevancia actual es limitada y muy acotada: se enmarca en el circuito de modelos colaborativos de Bittensor, donde los fine-tunes se agregan en "soups" para competir en tareas especificas. Para un desarrollador o investigador externo, el interes radica en evaluar si este fine-tune aporta mejoras sobre el Qwen3.5-0.8B original, algo que no puede determinarse con la informacion publicada, ya que no hay benchmarks, ejemplos ni descripcion del proceso de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-0.8B; tag `qwen3_5`) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `custom_code`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 853 millones de parametros. El repositorio incluye codigo personalizado, lo que sugiere que la implementacion de referencia del modelo base requiere un modulo especifico para instanciar la clase del modelo; no se detalla en la informacion disponible en que consiste esa personalizacion ni si afecta al grafo de computo o solo a utilidades de carga.

En cuanto al entrenamiento, la unica informacion publicada es que se trata de un fine-tune para el pool "d3-lite soup" de Zils (Bittensor SN127) y que los modelos upstream se detallan en un fichero NOTICE. No se especifica el volumen de tokens de entrenamiento, la composicion del dataset, si hubo RLHF, DPO, SFT u otra etapa de alineamiento, ni si se aplicaron tecnicas como LoRA, merging de pesos o destilacion. Tampoco se documentan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, modos de razonamiento) mas alla de las que pueda aportar el modelo base.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base Qwen3.5-0.8B; no se documentan capacidades adicionales especificas del fine-tune.
- Razonamiento y conocimiento general: presumiblemente similar al modelo base, sin datos de evaluacion que lo confirmen.
- Generacion de codigo y matematicas: no disponible de forma especifica para este fine-tune.
- Tool calling / function calling: no disponible; no se menciona soporte explicito.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el campo de idiomas no esta cumplimentado.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Ajuste especifico al pool d3-lite de Zils SN127: es la unica capacidad diferencial declarada, sin detalles sobre que tarea optimiza.

## Casos de uso

- Evaluacion comparativa frente a Qwen3.5-0.8B: usar el modelo como variante de referencia en experimentos controlados para medir si el fine-tune aporta mejoras en las tareas del pool d3-lite, comparando salidas con el modelo base en el mismo hardware.
- Participacion en el circuito Bittensor SN127: desplegar el modelo como candidato dentro del pool d3-lite soup, siguiendo las reglas de la subred, ya que ese es el proposito declarado del fine-tune.
- Prototipado de bajo coste en local: con 853 M de parametros, cabe en GPUs de consumo tras cuantizacion, lo que permite experimentar con un modelo pequeno en entornos sin infraestructura dedicada.
- Fine-tuning posterior o merging: servir como punto de partida para experimentos de "model soup" o de ajuste adicional, dado que comparte base con Qwen3.5-0.8B y licencia Apache 2.0.
- Generacion de texto en aplicaciones embebidas: por su tamano reducido, es candidato a despliegues en dispositivos con recursos limitados, siempre que se valide su calidad frente al base.
- Investigacion sobre ecosistemas descentralizados de IA: analizar como se comportan fine-tunes comunitarios agregados en pools frente a modelos publicados por laboratorios, usando este modelo como caso de estudio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 1,7 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 2-4 GB dependiendo de la longitud de contexto.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 0,9-1,2 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 0,5-0,8 GB para pesos, si se generan variantes GGUF/AWQ (no publicadas en el repo).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090) es suficiente; en datacenter, A100/H100 sobran para este tamano y permiten lotes grandes.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas de VRAM en FP16, y en GPUs integradas o CPU con cuantizacion agresiva.
- Opciones de despliegue: transformers con `trust_remote_code=True` por el `custom_code`; vLLM y TGI requeririan verificar compatibilidad con la implementacion personalizada; llama.cpp/Ollama solo si se generan pesos GGUF, que no se distribuyen en el repositorio.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| s-xander/zils-lite-b1 | 852.985.920 | no disponible | Apache 2.0 | Hugging Face (repo 1,7 GB) | Fine-tune para Zils SN127 d3-lite; sin benchmarks |
| Qwen/Qwen3.5-0.8B | ~0,8 B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face | Modelo base del que deriva; referencia natural de comparacion |
| Alternativas de ~1 B (p. ej. familias Llama, Gemma o Qwen de tamano similar) | ~1 B | variable | variable | Hugging Face | No se dispone de datos concretos en la informacion proporcionada para establecer una comparacion cuantitativa |

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card detallada, ni descripcion de datos, ni evaluacion; esto impide conocer sesgos, calidad real o comportamiento en dominios concretos.
- Riesgo de alucinacion: inherente a los modelos de ~0,8 B; sin evaluacion no puede acotarse su magnitud.
- Idiomas: el campo de idiomas no esta cumplimentado, por lo que no puede garantizarse un rendimiento adecuado en castellano ni en otros idiomas distintos del que use el modelo base.
- Contexto: se desconoce la longitud de contexto efectiva; no debe asumirse la del modelo base sin verificacion.
- `custom_code`: la carga requiere `trust_remote_code=True` o instalar el modulo correspondiente, lo que introduce un riesgo de seguridad y de mantenimiento en produccion.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar el fichero NOTICE y las licencias de los modelos upstream que se hayan podido agregar en el pool.
- Cero adopcion: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni de validacion por terceros.
- Fecha de creacion futura respecto a la mayoria de referencias publicas (2026-11-19), lo que sugiere que debe tratarse con cautela hasta confirmar su procedencia y reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/s-xander/zils-lite-b1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Fichero NOTICE con modelos upstream: referenciado en la model card del repositorio (consultar en la pestana "Files" del propio repo)
- Subred Bittensor SN127 (Zils): no se proporciona enlace directo en la informacion disponible
