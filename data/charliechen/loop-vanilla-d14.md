# CharlieChen/loop-vanilla-d14

## Resumen

loop-vanilla-d14 es un modelo de lenguaje base (pretrained, sin ajuste por instrucciones) publicado por el usuario CharlieChen en HuggingFace. Se trata del checkpoint final original empleado en la "escalera de escalado" sobre FineWeb descrita en el articulo *How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents*. El modelo pertenece a la familia de los looped transformers, una linea de investigacion que estudia como la recursion en profundidad y los operadores de frontera afectan a los exponentes de escalado. En esta variante concreta, el modo de profundidad es `none` y el numero de repeticiones del nucleo es 1, por lo que el artefacto entrenado equivale funcionalmente a un transformer "vanilla" en la coordenada de profundidad d14.

El checkpoint almacena 726.204.416 parametros en FP32 (2,905 GB) y se distribuye como un unico fichero PyTorch (`final.pt`) junto con metadatos de entrenamiento (`result.json`) y sumas de verificacion (`SHA256SUMS`). Emplea el tokenizador de GPT-2 de `tiktoken`, con un vocabulario de 50.257 tokens ampliado a 50.304 filas en el modelo, una anchura de 1.792 y 14 cabezas de atencion. La longitud de contexto es de 2.048 tokens y el unico idioma declarado es el ingles.

Su relevancia es fundamentalmente cientifica: sirve como punto de referencia reproducible para estudiar leyes de escalado en arquitecturas con recursion, y no como modelo listo para producto. No tiene ajuste por instrucciones, no dispone de licencia declarada, no se distribuye en formatos estandar como safetensors o GGUF y requiere el codigo propio del articulo (modelo `TransformerGPT`) para su evaluacion, ya que no es un checkpoint compatible con `AutoModel` de Transformers.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (variante looped transformer, modo de profundidad `none`, repeticiones del nucleo = 1) |
| Parametros totales | 726.204.416 (FP32) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (solo se publica el checkpoint original en FP32) |
| Idiomas soportados | ingles (`en`) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (FP32); sin safetensors ni GGUF |
| Ancho del modelo (hidden size) | 1.792 |
| Cabezas de atencion | 14 |
| Tokenizador | GPT-2 (`tiktoken.get_encoding("gpt2")`) |
| Vocabulario | 50.257 tokens, ampliado a 50.304 filas en el modelo |
| Corpus de entrenamiento | FineWeb (`HuggingFaceFW/fineweb`) |
| Numero de capas ejecutadas | no disponible (la coordenada de profundidad d14 no tiene por que coincidir con el numero de bloques Transformer ejecutados) |
| Tamano del repositorio | 2,9 GB |
| Pipeline declarado | `text-generation` |

## Arquitectura y entrenamiento

La arquitectura es un transformer autorregresivo de tipo decoder-only, integrado en la familia de los looped transformers que estudia el articulo de referencia. El modelo se define mediante una "coordenada de profundidad" (d14) que actua como variable de escalado dentro de una escalera experimental; el autor advierte explicitamente que esa coordenada no equivale necesariamente al numero de bloques Transformer ejecutados. En este checkpoint concreto, el modo de profundidad es `none` y tanto las repeticiones configuradas del nucleo como las usadas en la evaluacion final son 1, es decir, no se aplica recursion efectiva sobre el nucleo y el modelo se comporta como un transformer convencional en esa coordenada. La configuracion interna es de anchura 1.792, 14 cabezas de atencion y contexto de 2.048 tokens, con vocabulario basado en el tokenizador GPT-2.

El preentrenamiento se realizo sobre FineWeb, un corpus web a gran escala en ingles. No hay informacion disponible sobre el numero total de tokens procesados, la composicion detallada del dataset, ni sobre etapas de alineacion como RLHF, DPO o SFT: se trata de un modelo base sin ajuste por instrucciones. El unico metrica de validacion publicada es la NLL de validacion sobre el corpus de preentrenamiento, 2,918957 nats/token. El checkpoint preserva el artefacto original de entrenamiento y no incluye estado del optimizador, por lo que no permite reanudar el entrenamiento. La evaluacion del articulo se realiza con GPUs H100, FlashAttention-3 y autocast en bfloat16, y la reconstruccion del modelo requiere la clase personalizada `TransformerGPT` del repositorio del proyecto.

## Capacidades

- Generacion de texto autoregresiva en ingles, en modo completion de texto base.
- Modelado de lenguaje puro: al no tener ajuste por instrucciones, no sigue ordenes ni mantiene formatos conversacionales de forma fiable.
- Razonamiento y conocimiento general limitados al efecto del preentrenamiento sobre FineWeb, sin fine-tuning posterior de ninguna clase.
- Capacidad de continuacion de contexto largo hasta 2.048 tokens.
- No dispone de soporte declarado de tool calling ni de function calling.
- No dispone de soporte declarado para agentes ni para razonamiento multi-paso estructurado.
- Capacidades multilingues: solo ingles declarado.
- No hay capacidades multimodales (vision, audio) ni modo "thinking" documentados.
- Función principal en investigacion: servir como punto de referencia base en experimentos de leyes de escalado con recursion y operadores de frontera.

## Casos de uso

- Reproduccion de resultados cientificos: el checkpoint es el artefacto final exacto de una posicion de la escalera de escalado del articulo, por lo que permite verificar sus conclusiones sobre exponentes de escalado con el mismo modelo con el que se generaron.
- Estudios de leyes de escalado en arquitecturas recursivas: sirve como punto de comparacion "vanilla" (sin recursion efectiva) frente a variantes con repeticiones del nucleo mayores dentro de la misma escalera experimental.
- Investigacion sobre el impacto de los operadores de frontera y del crecimiento de modelos: al fijar un punto concreto de la coordenada de profundidad, permite aislar el efecto de otras variables en una comparacion controlada.
- Evaluacion comparativa con CORE: el autor documenta un procedimiento de evaluacion con 22 tareas y semillas 0/1/2 para calcular NLL de respuestas, lo que facilita comparaciones estandarizadas frente a otros modelos de la escalera.
- Pruebas de tecnicas de atencion eficiente: al usarse con FlashAttention-3 y bfloat16 en H100, es util para medir el rendimiento y la estabilidad numerica de kernels de atencion sobre una arquitectura personalizada.
- Generacion de texto en ingles para experimentos internos: puede emplearse para completar texto y estudiar distribuciones del modelo base, siempre asumiendo que no sigue instrucciones.
- Base para fine-tuning posterior: al ser un modelo base de 726 M de parametros, puede servir como inicializacion para tareas de ajuste supervisado o de dominio especifico, siempre que se resuelva primero la cuestion de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato cuantitativo de evaluacion recogido es:

| Metrica | Valor |
|---|---|
| NLL de validacion de preentrenamiento | 2,918957 nats/token |
| Resultados CORE completos (22 tareas, semillas 0/1/2) | no disponible (el autor solo describe el procedimiento; los resultados de humo no equivalen a los del articulo) |

El autor advierte que la NLL de validacion se mide sobre el corpus de preentrenamiento y es distinta de la NLL de respuestas de CORE, y que las puntuaciones de evaluacion acotada (con `--max-per-task 10 --seeds 0 1 2`) no son resultados completos del articulo.

## Requisitos de hardware

- Peso de los parametros: 2,905 GB en FP32; aproximadamente 1,45 GB si se convierte a bfloat16 o float16.
- Memoria adicional: la inferencia requiere espacio para activaciones y cache KV, cuyo tamano exacto no puede calcularse a partir de los datos publicados porque no se indica el numero de capas ejecutadas.
- GPU de referencia para evaluacion: H100, con FlashAttention-3 y autocast en bfloat16, segun la model card.
- GPU de consumo: por tamano de pesos, el modelo cabe holgadamente en GPUs de consumo con 12 GB o mas de VRAM (por ejemplo, RTX 3060 de 12 GB, RTX 4080, RTX 4090) si se usa precision reducida; el requisito real dependera de como se implemente la cache KV.
- Despliegue con vLLM, llama.cpp, Ollama o TGI: no soportado de forma directa, ya que el artefacto es un checkpoint PyTorch personalizado (`TransformerGPT`) y no un `AutoModel` de Transformers ni un fichero GGUF.
- Despliegue recomendado: utilizar el repositorio `cue-engineering/loop` con el script `eval.py` y los ficheros `final.pt` y `result.json`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La comparacion de rendimiento no es posible porque este modelo no publica resultados de benchmarks estandar. La tabla siguiente contrasta unicamente atributos factuales de configuracion, distribucion y licencia con modelos base de tamano cercano.

| Modelo | Parametros | Contexto | Tokenizador | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|
| loop-vanilla-d14 | 726 M | 2.048 | GPT-2 (tiktoken) | no disponible | PyTorch `.pt` personalizado, requiere codigo del articulo |
| Pythia-1B | 1.000 M aprox. | 2.048 | GPT-NeoX | Apache-2.0 | safetensors, compatible con Transformers |
| OLMo-1B | 1.200 M aprox. | 2.048 | GPT-NeoX | Apache-2.0 | safetensors, compatible con Transformers |
| GPT-2 XL | 1.500 M aprox. | 1.024 | GPT-2 | MIT | safetensors/PyTorch, compatible con Transformers |

Nota: los datos de los modelos alternativos corresponden a informacion publica ampliamente conocida; no se dispone de cifras de benchmarks de loop-vanilla-d14 que permitan una comparacion de calidad.

## Limitaciones y advertencias

- No es un modelo ajustado por instrucciones: no debe esperarse que siga ordenes, mantenga formatos estrictos ni responda como un asistente.
- Licencia no declarada: no hay autorizacion explicita de uso comercial ni condiciones de redistribucion, lo que supone un riesgo legal relevante para cualquier despliegue en produccion.
- Modelo base de investigacion: su proposito es servir de referencia en un estudio de leyes de escalado, no de producto.
- Idiomas: unicamente ingles declarado, sin evidencia de capacidades multilingues.
- Riesgo de alucinacion: al ser un modelo de lenguaje base entrenado sobre un corpus web (FineWeb), puede generar contenido factualmente incorrecto, sesgado o toxico sin ninguna capa de moderacion.
- Sesgos conocidos: no hay documentacion especifica sobre sesgos, pero al provenir de datos web a gran escala hereda los sesgos presentes en ese tipo de corpus.
- Contexto limitado a 2.048 tokens, insuficiente para tareas de contexto largo.
- Compatibilidad: no es un checkpoint `AutoModel`; no funciona con las herramientas habituales de inferencia (vLLM, TGI, llama.cpp, Ollama) sin trabajo de adaptacion.
- Reanudacion de entrenamiento: el checkpoint no incluye estado del optimizador, por lo que no permite continuar el entrenamiento desde ese punto.
- Evaluacion: los resultados CORE completos no estan publicados en la informacion disponible; las puntuaciones de humo no son representativas del conjunto completo de 22 tareas.
- Trazabilidad: el repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, y los metadatos indican una fecha de creacion de 2026-09-16, poco habitual, por lo que conviene verificar la integridad mediante `SHA256SUMS`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CharlieChen/loop-vanilla-d14
- Repositorio de codigo del articulo: https://github.com/cue-engineering/loop
- Dataset de preentrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Articulo de referencia citado en la model card: *How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents* (no se ha encontrado enlace directo en la informacion disponible)
- Resultados de la busqueda web: no se han encontrado enlaces relevantes; las consultas devolvieron unicamente paginas promocionales de YouTube Premium, sin relacion con el modelo.
