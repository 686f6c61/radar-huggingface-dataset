# junbrro/egopi-axis1-full-persistent-AB-30k-actsilu-slurm-18267-20260922

## Resumen

El modelo `junbrro/egopi-axis1-full-persistent-AB-30k-actsilu-slurm-18267-20260922` es un checkpoint de pesos publicado en HuggingFace por el usuario junbrro el 22 de septiembre de 2026. Se trata de un modelo de aproximadamente 6.915 millones de parametros (segun el recuento real de tensores en formato safetensors), lo que lo situa en la franja de los modelos de ~7B. El repositorio ocupa 13,9 GB, un tamano coherente con pesos almacenados en precision de 16 bits (bf16/fp16) sin cuantizar.

La model card es extremadamente escueta: se limita a indicar que corresponde al "Arm I full-token persistent AB", que el paso final de entrenamiento es 30000, que la fuente es la ejecucion 18267 de un cluster Slurm, y que solo se incluyen pesos finales y configuracion (sin estado del optimizador ni del generador de numeros aleatorios). Tambien menciona que el paquete `actlat/` contiene el tokenizador de acciones "cuando procede", lo que sugiere un modelo orientado a tareas con espacio de acciones (posiblemente agentes o control), aunque no se documenta nada mas.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: no hay model card completa, no se declara licencia, no se especifican idiomas, pipeline ni resultados de evaluacion, y la busqueda web no ha devuelto ninguna fuente relacionada (los unicos resultados obtenidos son listados de pizzerias en Brujas, sin ninguna conexion con el modelo). En consecuencia, la mayor parte de los apartados tecnicos se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag del repositorio indica "RLDX-1", sin documentacion publica asociada) |
| Parametros totales | 6.915.102.808 (~6,9B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos publicados estan en precision de 16 bits; no se declaran variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 13,9 GB |
| Paso de entrenamiento declarado | 30000 (final) |
| Ejecucion de origen | Slurm 18267 |
| Tokenizador adicional | `actlat/` (tokenizador de acciones, segun la model card) |

## Arquitectura y entrenamiento

No se dispone de informacion publicada sobre la arquitectura interna del modelo. El unico indicio es el tag `RLDX-1` que aparece en los metadatos del repositorio, que apunta a una denominacion de arquitectura propia o de un framework de entrenamiento no estandar, pero no se ha localizado documentacion, paper ni repositorio de codigo que la describa. Tampoco se especifica si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura de espacio de estados (SSM) o un diseno hibrido, ni el mecanismo de atencion empleado.

Respecto al entrenamiento, la model card indica unicamente el paso final (30000) y el identificador de la ejecucion en el cluster Slurm (18267). El nombre incluye el sufijo "actsilu", que podria corresponder a una funcion de activacion de tipo SiLU, y "full-persistent AB", presumiblemente una etiqueta interna de configuracion experimental. No se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de ajuste por instrucciones, RLHF o DPO. La model card advierte ademas de que la configuracion conserva rutas del cluster de origen y que estas deben reasignarse antes de usar el modelo, y que no se incluye estado del optimizador ni del RNG, por lo que el checkpoint no es reanudable para continuar el entrenamiento.

## Capacidades

- Generacion de texto: no confirmada de forma explicita en la informacion disponible.
- Razonamiento, codigo o matematicas: no disponible.
- Soporte de tool calling o function calling: no disponible. La presencia de un tokenizador de acciones (`actlat/`) sugiere un espacio de acciones discreto, lo que podria estar relacionado con control o agentes, pero no hay documentacion que lo confirme.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Modo de despliegue previsto: no disponible.

## Casos de uso

No es posible recomendar casos de uso concretos y verificables con la informacion disponible. Lo que sigue son escenarios genericos aplicables a un modelo denso de ~7B, siempre que se validen previamente sus capacidades reales:

- Evaluacion interna de checkpoints experimentales: el modelo puede utilizarse como sujeto de pruebas en un banco de evaluacion propio, midiendo perplejidad, coherencia y adherencia a instrucciones antes de plantear cualquier uso productivo.
- Investigacion sobre estabilidad de entrenamiento: dado que se publica el paso final y el identificador de ejecucion, puede servir para comparar el efecto de distintas configuraciones (por ejemplo, funcion de activacion o esquema de persistencia de estado) dentro de una misma linea experimental.
- Prototipado local en una sola GPU: con ~6,9B de parametros, es viable ejecutarlo en una GPU de consumo para pruebas de generacion de texto, siempre que la arquitectura sea compatible con las herramientas de inferencia habituales.
- Analisis de tokenizadores de acciones: si el directorio `actlat/` contiene realmente un tokenizador de acciones, podria estudiarse su integracion en pipelines de agentes o de control, tras inspeccionar su contenido.
- Reproduccion de experimentos academicos: el checkpoint permite auditar la evolucion de una ejecucion concreta, aunque sin estado del optimizador solo es posible la inferencia, no la reanudacion del entrenamiento.
- Destilacion o ajuste fino posterior: un modelo de ~7B es un punto de partida razonable para ajuste con LoRA sobre dominios especificos, siempre que la licencia lo permita, cosa que actualmente no esta aclarada.

En todos los casos, el uso comercial no puede asumirse: la licencia figura como no disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de evaluacion alguna (MMLU, HumanEval, GSM8K ni equivalentes), y la busqueda web no ha devuelto ninguna fuente tecnica relacionada con el modelo.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del recuento de parametros (6,9B) y del tamano del repositorio (13,9 GB), no datos publicados por el autor:

- VRAM para inferencia en bf16/fp16: en torno a 14-16 GB solo para pesos, mas la memoria de cache KV y activaciones, que depende de la longitud de contexto (no disponible).
- VRAM en cuantizacion int8: aproximadamente 8-10 GB incluyendo overhead.
- VRAM en cuantizacion int4 (por ejemplo Q4_K_M): aproximadamente 5-6 GB.
- GPU recomendadas: para precision completa de 16 bits, una RTX 4090, RTX 3090, L40S, A100 o H100 (24 GB o mas de VRAM). Para cuantizacion int4, bastarian GPUs de 8-12 GB como RTX 3060 12 GB, RTX 4070 o similares.
- Cabe en GPU de consumo: si, en el rango de 12-24 GB, siempre que la arquitectura sea soportada por el runtime elegido.
- Opciones de despliegue: no confirmadas. Al publicarse solo en safetensors, el camino mas probable es `transformers` con pesos en 16 bits; el uso con vLLM, TGI, llama.cpp u Ollama depende de que la arquitectura subyacente (tag `RLDX-1`) este implementada en esas herramientas, algo que no se puede verificar con la informacion disponible. La conversion a GGUF requeriria ademas un script especifico de arquitectura.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No es posible establecer una comparativa fiable del modelo con alternativas de su categoria, porque se desconocen su licencia, contexto, idiomas y rendimiento. A modo de referencia de categoria (~7-8B, datos publicos de terceros, no del autor de este modelo):

| Modelo | Parametros | Contexto declarado | Licencia | Rendimiento publicado |
|---|---|---|---|---|
| Este modelo (junbrro/egopi-axis1-...) | ~6,9B | no disponible | no disponible | no disponible |
| Mistral 7B (referencia de categoria) | ~7,2B | 8k tokens | Apache 2.0 | publicado por su autor |
| Llama 3.1 8B (referencia de categoria) | ~8B | 128k tokens | licencia comunitaria de Meta | publicado por su autor |
| Qwen2.5 7B (referencia de categoria) | ~7,6B | 128k tokens | licencias variables segun variante | publicado por su autor |

La fila de este modelo es la unica relevante a efectos de decision; las demas se incluyen solo para contextualizar el orden de magnitud de parametros y contexto en esa franja. No se dispone de ningun dato que permita afirmar comparabilidad de calidad.

## Limitaciones y advertencias

- Ausencia total de model card tecnica: no hay informacion sobre datos de entrenamiento, sesgos, alineacion ni evaluaciones, por lo que no se puede caracterizar su comportamiento en produccion.
- Licencia no declarada: no se puede asumir permiso de uso comercial, redistribucion ni ajuste fino. Es imprescindible contactar con el autor antes de cualquier uso fuera del ambito estrictamente personal o de investigacion.
- Riesgo de alucinacion: desconocido y no medido; al no existir evaluaciones publicadas, debe asumirse un riesgo alto sin verificar.
- Sesgos conocidos: no disponible. Sin informacion sobre la composicion del dataset, no es posible estimar sesgos de genero, idioma, cultura o dominio.
- Idiomas soportados: no declarados. La cobertura multilingue es una incognita.
- Longitud de contexto: no declarada, lo que impide planificar casos de uso con documentos largos o conversaciones multi-turno extensas.
- Arquitectura no documentada: el tag `RLDX-1` no corresponde a ninguna arquitectura estandar conocida, por lo que es probable que el modelo no cargue directamente en `transformers`, vLLM o llama.cpp sin codigo adicional.
- Configuracion con rutas del cluster de origen: la propia model card advierte de que hay que reasignar rutas antes de usar el modelo; de lo contrario, la carga puede fallar.
- Checkpoint no reanudable: al excluir el estado del optimizador y del RNG, no es posible continuar el entrenamiento desde este punto, solo inferencia o ajuste fino desde cero.
- Sin senal de comunidad: cero descargas y cero "likes" en el momento de la consulta, lo que reduce la probabilidad de que existan informes independientes de comportamiento o compatibilidad.
- Fecha de creacion posterior al conocimiento de referencia: cualquier evaluacion debe hacerse contra el propio checkpoint, no contra descripciones de terceros.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/junbrro/egopi-axis1-full-persistent-AB-30k-actsilu-slurm-18267-20260922
- Paper: no disponible.
- Blog o anuncio del autor: no disponible.
- Repositorio de codigo: no disponible.
- Demo o espacio interactivo: no disponible.
- Nota sobre la busqueda web: los unicos resultados devueltos corresponden a listados de pizzerias en Brujas (Tripadvisor, amuni.be, onesto-pizza.be, pizzaditrevi.be, Restaurant Guru) y no guardan ninguna relacion con el modelo; se descartan por completo como fuentes.
