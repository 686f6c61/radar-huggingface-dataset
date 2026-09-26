# adpretko/celerity-906m-4k-ad0p2-ild

## Resumen

Celerity 906M — 4k — ad0p2-ild es un checkpoint de la familia Celerity, un modelo de lenguaje de aproximadamente 906 millones de parámetros publicado por el usuario adpretko en Hugging Face. El propio autor lo describe como una conversión del formato CS de Cerebras al formato de Hugging Face, con una longitud de secuencia de 4.000 tokens y la variante de atención con dropout `ad0p2-ild`. Se corresponde con el checkpoint de origen `checkpoint_29117` y fue convertido mediante coincidencia estricta de claves (`strict checkpoint-key matching`) usando las herramientas del runtime `cbcore 2.6.0`.

La relevancia de esta ficha es limitada y conviene ser transparente al respecto: el repositorio acumula 0 descargas y 0 likes, no declara licencia, no documenta idiomas ni pipeline de inferencia, y no publica resultados de evaluación. Su interés es fundamentalmente técnico y experimental: sirve para estudiar cómo se traslada un checkpoint entrenado en la pila de Cerebras al ecosistema PyTorch/Hugging Face y qué implicaciones tiene hacerlo con código de modelado propio (`custom_code`), lo que obliga a cargar el modelo con `trust_remote_code=True`.

El repositorio ocupa 1,8 GB, un tamaño coherente con pesos de 906 M de parámetros en precisión de 16 bits. La model card no especifica la arquitectura interna, la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo ajuste por preferencias (RLHF/DPO), por lo que cualquier uso en producción debería ir precedido de una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Se sabe que emplea codigo de modelado propio de Celerity (`custom_code`) y que los pesos provienen del formato CS de Cerebras |
| Parametros totales | Aproximadamente 906 M (segun la denominacion del checkpoint) |
| Parametros activos | No aplicable (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | 4.000 tokens (4k, indicado en la model card) |
| Tipos de cuantizacion | No disponible. No se publican versiones GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Pesos en formato PyTorch (repo de 1,8 GB) con codigo de modelado Celerity; no se documenta safetensors ni GGUF |
| Variante | `ad0p2-ild` (variante de dropout en atencion; el significado de `ild` no esta documentado) |
| Checkpoint de origen | `checkpoint_29117` |
| Runtime de origen | cbcore 2.6.0 |
| Metodo de conversion | Coincidencia estricta de claves entre el checkpoint CS y el formato de Hugging Face |
| Carga requerida | `trust_remote_code=True` |

## Arquitectura y entrenamiento

La informacion publicada no detalla la arquitectura interna: no se especifican el numero de capas, la dimension del modelo, el numero de cabezas de atencion, el tipo de normalizacion ni la funcion de activacion. Lo unico documentado es que se trata de un checkpoint convertido desde el formato CS de Cerebras al formato de Hugging Face mediante una correspondencia estricta de claves, lo que implica que la conversion no rellena ni aproxima tensores ausentes: o las claves coinciden exactamente, o la conversion falla. El sufijo `ad0p2` apunta a una variante con dropout de atencion de 0,2, un hiperparametro de regularizacion cuyo efecto practico en inferencia es nulo (el dropout se desactiva en evaluacion), pero que si condiciona la dinamica de entrenamiento y, por tanto, los pesos resultantes.

Tampoco hay datos sobre el corpus de entrenamiento: se desconoce el numero de tokens, la composicion del dataset, el reparto entre idiomas y codigo, y si existio una fase de ajuste supervisado o de optimizacion por preferencias. La unica pista sobre el proceso es la referencia al runtime `cbcore 2.6.0` y a los "experimentos de runtime" citados en la model card, lo que sugiere que el checkpoint forma parte de una bateria de pruebas de conversion y ejecucion mas que de un lanzamiento de modelo orientado a producto. No se documenta ninguna innovacion tecnica (atencion lineal, decodificacion especulativa, SSM hibrido, etc.) mas alla del propio pipeline de conversion.

## Capacidades

- Generacion de texto autoregresiva con una ventana de contexto de 4.000 tokens, segun lo declarado en la model card. No se documentan capacidades especificas mas alla de esta.
- Capacidad de razonamiento, matematicas o codigo: no disponible. No hay evaluaciones ni ejemplos publicados.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible, no se declara ningun idioma.
- Capacidades multimodales (vision, audio): no disponibles; no hay indicios de que el modelo las soporte.
- Modo de razonamiento explicito (`thinking mode`): no disponible.
- Carga mediante codigo propio: requiere `trust_remote_code=True`, lo que implica que el repositorio incluye definiciones de arquitectura en Python que se ejecutan en la maquina del usuario.

## Casos de uso

- Validacion de conversiones Cerebras a Hugging Face: el caso de uso mas directo y mejor documentado. Un ingeniero puede cargar el checkpoint, comparar las salidas con las del runtime `cbcore 2.6.0` y verificar la paridad numerica tras la conversion de claves.
- Estudio academico del efecto del dropout de atencion: comparar esta variante (`ad0p2`) con otras variantes del mismo checkpoint base permite analizar como la regularizacion durante el entrenamiento afecta a la calidad final, siempre que el autor publique las variantes de control.
- Ajuste fino ligero sobre dominio concreto: con 906 M de parametros, tecnicas como LoRA o QLoRA caben en GPUs de 8-12 GB de VRAM, lo que permite adaptar el modelo a tareas de clasificacion, extraccion o resumen en un dominio especifico sin infraestructura de datacenter.
- Prototipado de pipelines de generacion en una sola GPU consumer: al ocupar menos de 2 GB en precision de 16 bits, el modelo permite iterar sobre plantillas de prompt, estrategias de muestreo y longitudes de contexto sin coste de GPU relevante.
- Generacion de texto de contexto medio en entornos con restricciones de hardware: resumen de documentos de hasta 4.000 tokens, reescritura de parrafos o generacion de borradores en estaciones de trabajo sin GPU dedicada de gama alta.
- Base para conversion a GGUF y despliegue en el borde: si la arquitectura resulta convertible, el tamano del modelo lo hace apto para ejecucion en CPU o en dispositivos con poca memoria. Cabe advertir que el uso de `custom_code` puede dificultar o bloquear esta conversion, ya que las herramientas de cuantizacion necesitan reconocer la arquitectura.
- Servicio interno de bajo coste y pruebas de latencia: util como componente de un banco de pruebas para medir throughput y latencia de una arquitectura concreta antes de escalar a modelos mayores.
- Docencia y experimentacion educativa: un modelo de 906 M con contexto de 4k es un candidato razonable para cursos de inferencia y ajuste fino, siempre que se asuma que no hay garantias de calidad documentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, HellaSwag ni de ninguna otra evaluacion, y no se han encontrado informes externos que las aporten.

## Requisitos de hardware

Las cifras de VRAM que se indican a continuacion son estimaciones derivadas del recuento de parametros (906 M) y del tamano del repositorio (1,8 GB), no valores confirmados por el autor ni medidos sobre este checkpoint concreto.

- Precision de 16 bits (fp16/bf16): aproximadamente 1,8 GB de pesos; con cache KV y overhead de runtime, entre 2,5 y 3,5 GB de VRAM.
- Cuantizacion a 8 bits: aproximadamente 0,9-1,0 GB de pesos; entre 1,5 y 2 GB de VRAM.
- Cuantizacion a 4 bits: aproximadamente 0,5-0,6 GB de pesos; entre 1,0 y 1,5 GB de VRAM. No existe ninguna version cuantizada publicada por el autor, por lo que habria que generarla.
- Memoria de la cache KV: no disponible. No se conocen el numero de capas, el numero de cabezas KV ni la dimension de cabeza, datos necesarios para calcularla con precision a 4.000 tokens.
- GPU recomendadas: dada la horquilla de VRAM estimada, cualquier GPU consumer con 4 GB o mas es suficiente en 16 bits (RTX 3050, RTX 3060, RTX 4060, RTX 4090, Apple Silicon con Metal). No se requiere A100 ni H100.
- Despliegue en vLLM o TGI: no confirmado. Ambas herramientas dependen de que la arquitectura sea reconocible; el uso de `custom_code` puede impedir su carga sin modificaciones del codigo fuente.
- Despliegue con llama.cpp u Ollama: no disponible, ya que no se publican pesos GGUF y la arquitectura no esta documentada.
- Latencia y throughput: no disponibles. No se han publicado mediciones.
- Nota de seguridad: `trust_remote_code=True` implica ejecutar codigo Python del repositorio. Conviene auditar dicho codigo antes de cargar el modelo en un entorno con datos sensibles.

## Comparativa con modelos similares

La comparacion se limita a datos estructurales verificables. No se incluyen cifras de rendimiento porque no hay benchmarks publicados para Celerity 906M y porque no se dispone de resultados verificables en la informacion proporcionada para el resto de modelos; cualquier numero que se anadiese seria una invencion.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| Celerity 906M — 4k — ad0p2-ild | ~906 M | 4.000 tokens | No disponible | Repositorio con 0 descargas, requiere `trust_remote_code=True` | No disponible |
| Llama 3.2 1B | ~1.200 M | 128.000 tokens | Licencia comunitaria de Meta | Ampliamente distribuido en Hugging Face | Consultar la model card oficial |
| Qwen2.5 1.5B | ~1.500 M | 32.000 tokens (hasta 128.000 en variantes) | Apache 2.0 en la mayoria de variantes | Ampliamente distribuido, con versiones GGUF y cuantizadas | Consultar la model card oficial |
| SmolLM2 1.7B | ~1.700 M | 8.000 tokens | Apache 2.0 | Ampliamente distribuido, con versiones cuantizadas | Consultar la model card oficial |

Diferencias estructurales destacables: Celerity 906M es el unico de la tabla sin licencia declarada, sin idiomas documentados, sin versiones cuantizadas y con una ventana de contexto notablemente mas corta. A cambio, es el mas ligero del grupo y el unico que documenta explicitamente un pipeline de conversion desde hardware de Cerebras.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ejemplos de salida ni informes de terceros. No hay ninguna evidencia publicada de que el modelo genere texto coherente tras la conversion.
- Licencia no declarada: sin licencia explicita, el uso comercial es juridicamente arriesgado. En la practica, la ausencia de licencia implica que no se conceden derechos de uso mas alla de los que permita la legislacion aplicable.
- Idiomas no documentados: se desconoce que idiomas domina y con que calidad.
- Riesgo de alucinacion: no cuantificado. En un modelo de 906 M de parametros sin ajuste por preferencias documentado, la tasa de afirmaciones factualmente incorrectas es previsiblemente alta, aunque no hay mediciones que lo confirmen.
- Codigo remoto: la carga exige `trust_remote_code=True`, lo que supone ejecutar codigo del repositorio. Es un vector de riesgo si el repositorio no se audita previamente.
- Adopcion nula: 0 descargas y 0 likes en el momento de redactar esta ficha. No hay comunidad que haya validado el checkpoint, ni issues publicos que documenten problemas conocidos.
- Contexto limitado: 4.000 tokens es una ventana corta para tareas de resumen de documentos largos, analisis de repositorios o conversaciones multi-turno extensas.
- Riesgo de conversion: aunque el autor indica coincidencia estricta de claves, no se documenta ninguna verificacion de paridad numerica entre el checkpoint original y el convertido. Es posible que existan discrepancias no detectadas.
- Compatibilidad de herramientas: al no estar la arquitectura documentada, es probable que frameworks de inferencia optimizada (vLLM, TGI, TensorRT-LLM) no lo soporten de forma directa.
- Variante experimental: el sufijo `ad0p2-ild` y la referencia a "experimentos de runtime" sugieren que se trata de un checkpoint de investigacion, no de un modelo depurado para produccion.
- Fecha de publicacion: los metadatos indican creacion y actualizacion el 26 de septiembre de 2026, con 22 segundos entre ambos eventos, lo que indica que el repositorio no ha recibido mantenimiento posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adpretko/celerity-906m-4k-ad0p2-ild
- No se han encontrado en la informacion proporcionada articulos, papers, blogs, repositorios auxiliares ni demos adicionales asociados a este checkpoint.
