# Ggboykxz/t4llm-python-sft

## Resumen

t4llm-python-sft es un ajuste fino supervisado (SFT) en curso sobre el modelo base Qwen/Qwen3-1.7B-Base, desarrollado por el usuario Ggboykxz. El objetivo es especializar un modelo de 1.700 millones de parametros en la generacion de codigo Python a nivel de funcion, partiendo de datos de instruccion derivados de un repositorio de datos con licencia ODC-BY 1.0. El entrenamiento se ejecuta mediante la pipeline t4llm, que implementa checkpoints tolerantes a fallos (crash-safe) y permite reanudar el proceso tras un reinicio.

El repositorio se encuentra en estado de trabajo en curso y el propio autor advierte explicitamente de que no debe utilizarse hasta que el entrenamiento y la evaluacion hayan concluido. El tamano actual del repositorio es de 0,2 GB, lo que sugiere que contiene checkpoints intermedios o pesos parciales, no el export final en fp16 ni el GGUF f16 que el autor indica que se publicaran al terminar.

La relevancia de esta ficha es limitada por ahora: se trata de un artefacto de investigacion en fase temprana, sin benchmarks publicados, sin pipeline definido y sin idiomas declarados. Resulta util como referencia para quienes sigan el desarrollo de la pipeline t4llm o quieran replicar el flujo de SFT resumible sobre Qwen3-1.7B-Base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3-1.7B-Base) |
| Parametros totales | 1.700 millones (modelo base Qwen3-1.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16 (GGUF f16 previsto); otras no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo actual); GGUF f16 previsto al finalizar |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B-Base, un transformer denso de 1.700 millones de parametros con licencia Apache-2.0. Sobre esa base se aplica un ajuste fino supervisado (SFT) orientado a instrucciones de Python a nivel de funcion. No se especifican en la informacion disponible ni el numero de tokens de entrenamiento, ni la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF o DPO adicionales.

La innovacion tecnica destacable no esta en la arquitectura del modelo sino en la infraestructura de entrenamiento: la pipeline t4llm implementa checkpoints crash-safe y reanudacion tras fallo, de modo que el proceso de SFT puede retomarse desde el ultimo estado guardado sin reiniciar desde cero. El autor indica que el repositorio albergara el export fusionado en fp16 y el GGUF f16 una vez completado el entrenamiento; hasta entonces, los pesos publicados corresponden a un estado intermedio.

## Capacidades

- Generacion de codigo Python a nivel de funcion, segun el objetivo declarado del SFT.
- Seguimiento de instrucciones en el dominio de programacion Python (presunto, no evaluado).
- Generacion de texto general heredada del modelo base Qwen3-1.7B-Base.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Cualquier capacidad listada esta pendiente de validacion, ya que el autor prohibe su uso hasta completar entrenamiento y evaluacion.

## Casos de uso

- Evaluacion de pipelines de SFT resumible: el repositorio sirve como banco de pruebas para verificar que la pipeline t4llm recupera correctamente el estado tras un fallo, comparando checkpoints intermedios con el export final.
- Reproduccion de ajustes finos sobre Qwen3-1.7B-Base: investigadores pueden replicar el flujo de entrenamiento con datos de instruccion Python y contrastar resultados con este artefacto de referencia.
- Estudio de especializacion en dominios de codigo: analizar como un modelo denso de 1.700 millones se desvia del base al entrenarse exclusivamente con funciones Python, midiendo degradacion en tareas generales.
- Base para experimentos de cuantizacion: una vez publicado el GGUF f16, comparar la calidad del modelo fusionado en fp16 frente a la version cuantizada en tareas de generacion de funciones.
- Docencia y formacion: ilustrar el ciclo completo de un SFT (datos, checkpoints, export, evaluacion) en cursos de IA aplicada al codigo.
- Integracion futura en asistentes de autocompletado de funciones Python, condicionada a que el autor publique benchmarks y levante la restriccion de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no publicara cifras hasta medirlas y que "unmeasured means unmeasured, not zero".

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,4 GB solo para pesos (1.700 millones de parametros x 2 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: en torno a 1,7-2 GB para pesos; en 4 bits, alrededor de 1 GB, aunque estas cuantizaciones no estan confirmadas en el repositorio.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070) deberia bastar para fp16; A100 o H100 no son necesarias por el tamano del modelo.
- Cabe en GPU consumer: si, previsiblemente en la mayoria de tarjetas con 8 GB o mas.
- Opciones de despliegue: llama.cpp u Ollama para el GGUF f16 previsto; vLLM o TGI para el export safetensors en fp16, una vez publicado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado | Benchmarks |
|---|---|---|---|---|---|
| t4llm-python-sft | 1.700 M | no disponible | Apache-2.0 | En entrenamiento, no usable | No publicados |
| Qwen/Qwen3-1.7B-Base | 1.700 M | no disponible en la informacion | Apache-2.0 | Publicado y estable | Disponibles en su model card |
| Alternativas de codigo de ~1-2 B | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion fiable es con el modelo base del que deriva: t4llm-python-sft hereda su arquitectura y tamano, y su unica diferencia es el SFT sobre datos Python, cuyos efectos no han sido medidos. No se dispone de informacion suficiente para comparar con otros modelos especializados en codigo de tamano similar.

## Limitaciones y advertencias

- El autor prohibe explicitamente su uso hasta que el entrenamiento y la evaluacion esten completos ("Do not use until training and evaluation are complete").
- No hay benchmarks publicados; se desconoce si el SFT mejora, degrada o deja igual el rendimiento del base en generacion de codigo.
- Los pesos actuales son checkpoints intermedios, no un export final; pueden estar incompletos o ser inconsistentes.
- Sesgos conocidos: no disponibles, aunque hereda los del modelo base Qwen3-1.7B-Base.
- Riesgo de alucinacion: no evaluado en esta version.
- Limitaciones de contexto e idioma: no disponibles; el entrenamiento se centra en Python, lo que puede reducir el rendimiento en otros lenguajes o en texto general.
- Licencia Apache-2.0 permite uso comercial, pero la ausencia de evaluacion hace desaconsejable su despliegue en produccion.
- El repositorio tiene 0 descargas y 0 likes, sin pipeline definido ni idiomas declarados, lo que refleja su caracter experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ggboykxz/t4llm-python-sft
- Pipeline t4llm: https://github.com/Ggboykxz/t4llm
- Modelo base Qwen/Qwen3-1.7B-Base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Repositorio de datos (referenciado en la model card, sin URL directa): no disponible
