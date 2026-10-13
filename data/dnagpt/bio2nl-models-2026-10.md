# dnagpt/bio2nl-models-2026-10

## Resumen

`dnagpt/bio2nl-models-2026-10` es un banco de modelos (model bank) de la revisión de octubre de 2026 del proyecto bio2nl, publicado por el usuario `dnagpt`. No es un modelo único: es un conjunto de 313 ficheros de checkpoint completos que suman aproximadamente 141,72 GiB (148,4 GB de repositorio), organizados en familias que cubren rutas de transferencia entre secuencias de proteínas y modelos de lenguaje. El backbone oficial declarado es `openai-community/gpt2`, revisión `607a30d783dfa663caf39e06633721c8d4cfcd7e`, por lo que todos los modelos derivados son de escala GPT-2 y se usan como clasificadores sobre pares de secuencias, no como asistentes generativos.

El repositorio retiene todos los seeds prescritos de las rutas principales de octubre y sus diagnósticos asociados: GPT-2 forward oficial con SFT literal (100 checkpoints), GPT-2 reverse ordinario sobre cuatro grupos de identidad BLAST más un grupo mixto (100), preentrenamiento conjunto desde cero en tres condiciones EP/ES/EE (3), SFT conjunto con 20 seeds por condición (60), fuente remota SCOPe (20) y fuente de variantes funcionales (20), además de diagnósticos retenidos y repeticiones de receta fija. Su relevancia es metodológica: permite auditar varianza entre seeds, distinguir ajuste en fuente de generalización en fuente, y reproducir exactamente los resultados por seed con un entorno numérico congelado (PyTorch 2.5.1+cu121 / Transformers 4.51.3).

Es un artefacto de investigación, no un modelo listo para producto: la licencia es específica por activo, el estado de publicación debe verificarse con `publication_status.json`, y la propia model card advierte de que el rendimiento es exploratorio y dependiente de la tarea. El repositorio de datos, definiciones de fuente, código de entrenamiento y tablas de resultados por seed está separado, en `dnagpt/bio2nl-data-2026-10`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (backbone oficial `openai-community/gpt2`, revision `607a30d783dfa663caf39e06633721c8d4cfcd7e`); modelos conjuntos entrenados desde cero por el proyecto |
| Parametros totales | no disponible de forma agregada; el backbone GPT-2 oficial tiene 124 M de parametros. El tamano de los modelos conjuntos con BPE de 32k no se especifica |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Variable por familia: 256 tokens (native256), 1024 tokens (remote/DMS native1024) y 512 tokens (modelos conjuntos, con EOS final atendido) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible. No es un modelo multilingue: procesa secuencias de proteinas y etiquetas de validacion en ingles para fijar la orientacion de clase |
| Licencia | `other`, nombre `asset-specific` (fichero `LICENSES.md` en el repositorio) |
| Formato de pesos | safetensors para los pesos nativos; los modelos conjuntos usan ficheros `safe.pt` con tensores y metadatos JSON primitivos, cargados con `weights_only=True`, y no son carpetas de checkpoint de `AutoModel` de Hugging Face |

## Arquitectura y entrenamiento

La base es un transformer decoder-only estilo GPT-2 aplicado a clasificacion de pares de secuencias de proteinas. La carga no es uniforme y depende de tres formatos distintos: los modelos native256 usan la API nativa de pares de GPT-2 sin separador insertado y con pooling incorporado; los modelos remote/DMS native1024 requieren pooling explicito del ultimo token atendido mediante attention mask (usar el pooling por defecto de EOS-as-pad como pad alteraria el clasificador); y los modelos conjuntos usan un BPE nuevo de 32k con EOS final atendido sobre entradas de 512 tokens. El codigo `code/load_models.py` implementa los tres formatos y `code/joint_models.py` es el cargador exacto del estado completo original.

El entrenamiento cubre varias rutas. GPT-2 forward oficial se somete a SFT literal sobre PAWS-X limpio con 100 seeds. La ruta reverse ordinaria se organiza en cuatro grupos de identidad BLAST mas un grupo mixto, con 20 seeds por grupo. Hay ademas preentrenamiento conjunto desde cero en tres condiciones (EP/ES/EE) con un unico seed de preentrenamiento 0 por condicion, y SFT conjunto sobre el mismo grupo V2 de proteinas de alta identidad con 20 seeds de SFT por condicion preentrenada. La fuente remota usa SCOPe (seed 1 de descubrimiento y seeds 2-20 de replicacion) y la fuente de variantes funcionales cubre cuatro epocas con el mismo esquema de descubrimiento y replicacion. Los conjuntos independientes son modelos entrenados desde cero por el proyecto con un seed por condicion, no variantes del backbone. La model card precisa que los seeds de fine-tuning no son seeds de preentrenamiento independientes, que los clasificadores reutilizados y la inferencia repetida no cuentan como repeticiones nuevas de entrenamiento, y que no se usan actualizaciones de gradiente en ingles en el SFT de fuente proteica.

## Capacidades

- Clasificacion de pares de secuencias de proteinas: los modelos forward y reverse comparan pares de cadenas para tareas de identidad y similitud.
- Clasificacion de variantes funcionales: la familia de variantes funcionales se entrena cuatro epocas para discriminar el efecto de cambios en la secuencia.
- Deteccion de homologia remota sobre SCOPe, con esquema de descubrimiento y replicacion por seeds.
- Ajuste de perfiles DMS (deep mutational scanning) en version completa y reducida, con 20 epocas.
- Diagnostico de sensibilidad a hiperparametros: se retienen ajustes con learning rate alternativo.
- Preentrenamiento y SFT conjuntos con tokenizador propio de 32k BPE sobre proteinas.
- Reproduccion controlada de resultados: tablas por seed, entorno numerico congelado y fichero de estado de publicacion.
- No soportado: tool calling, function calling, uso como agente, razonamiento multi-paso, vision, audio, modo thinking y generacion de texto de proposito general. No hay `pipeline` declarado en el repositorio.

## Casos de uso

- Analisis de mutagenesis profunda: cargar un modelo de la familia DMS con pooling de ultimo token atendido y puntuar variantes de una proteina para priorizar experimentos de laboratorio. La receta reducida de 20 epocas permite iterar con menos coste.
- Deteccion de homologia remota: usar los checkpoints de fuente SCOPe para asignar una secuencia de funcion desconocida a una familia estructural lejana, con los seeds 2-20 disponibles para estimar la varianza del resultado y no solo el mejor caso.
- Estudio de transferencia entre dominios: comparar las rutas forward, reverse y conjunta sobre el mismo conjunto de validacion para medir cuanto depende el resultado del protocolo de transferencia frente a la arquitectura.
- Auditoria de reproducibilidad: descargar `model_catalog.json`, el codigo y las tablas por seed del repositorio de datos para verificar cifras publicadas bajo el entorno congelado PyTorch 2.5.1+cu121 / Transformers 4.51.3.
- Analisis de varianza entre seeds: con 100 seeds en forward oficial y 20 por grupo en las rutas reverse, medir la dispersion de metricas entre seeds de fine-tuning y separarla de la varianza de preentrenamiento.
- Estrategia de preentrenamiento en proteinas: usar las tres condiciones conjuntas EP/ES/EE (un seed de preentrenamiento cada una) para decidir la configuracion previa al SFT en un proyecto propio.
- Diagnostico de hiperparametros: emplear los ajustes retenidos con learning rate alternativo como referencia de cuanto se mueve la metrica antes de lanzar una busqueda completa.
- Integracion en pipelines internos de anotacion: usar `code/load_models.py` para cargar un clasificador concreto y llamar a `encode_pairs` y `logits` sobre lotes, como muestra el ejemplo de la model card (que verifica carga, no rendimiento).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explicita que las tablas de resultados por seed, las definiciones de fuente y el codigo de entrenamiento estan en el repositorio de datos `dnagpt/bio2nl-data-2026-10`, y que el rendimiento es exploratorio y dependiente de la tarea. Tambien advierte que el ajuste sobre la fuente de entrenamiento es distinto de la generalizacion en fuente. El ejemplo de codigo de la model card se presenta como comprobacion de carga, no como benchmark.

## Requisitos de hardware

- Tamano total del banco: 148,4 GB de repositorio, de los cuales unos 141,72 GiB corresponden a 313 ficheros de checkpoint completos. Descargar el banco entero exige ese espacio en disco.
- VRAM por modelo: no disponible de forma oficial. Con backbone GPT-2 (124 M de parametros) la inferencia de un checkpoint individual es de escala reducida y cabe en cualquier GPU consumer moderna; el tamano de los modelos conjuntos con BPE de 32k no se especifica, por lo que no puede estimarse con rigor.
- GPU recomendadas: no disponibles en la informacion proporcionada. Dado el perfil declarado (single-GPU en el ecosistema DNAGPT del mismo autor, segun la busqueda web) y la escala GPT-2, una RTX 3090 o RTX 4090 es suficiente para un checkpoint individual; para evaluar los 313 checkpoints en barrido conviene planificar cola de trabajos.
- Cuantizacion: no disponible. No se documentan pesos GGUF, AWQ, GPTQ ni equivalentes.
- Opciones de despliegue: no se contemplan vLLM, llama.cpp, Ollama ni TGI. La carga es mediante codigo propio: `code/load_models.py` para los tres formatos y `code/joint_models.py` para el estado completo de los modelos conjuntos. Los `safe.pt` conjuntos no son carpetas de `AutoModel`.
- Entorno numerico: reproduccion exacta con PyTorch 2.5.1+cu121 y Transformers 4.51.3, registrado por modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La informacion proporcionada no incluye especificaciones comparables completas de alternativas. Se recogen a continuacion las referencias adyacentes encontradas en la busqueda web, marcando como no disponible todo dato no confirmado.

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dnagpt/bio2nl-models-2026-10 | no disponible (backbone GPT-2 de 124 M) | 256 / 512 / 1024 tokens segun familia | Transferencia cross-domain sobre secuencias de proteinas y clasificacion por pares | asset-specific | Hugging Face, 0 descargas, 1 like |
| DNAGPT | no disponible | no disponible | Modelo preentrenado de DNA, entrenado sobre mas de 200.000 millones de pares de bases de todos los mamiferos | no disponible | Paper en arXiv (2307.05628) |
| DNAGPT2 | no disponible (escala GPT-2 de GPU unica, segun la fuente) | no disponible | Compresion de DNA sin referencia y modelado de lenguaje genomico | no disponible | Ficha en bio.rodeo |

Las tres propuestas comparten la familia GPT-2 y el ambito biologico, pero difieren en el objeto: DNAGPT y DNAGPT2 trabajan sobre DNA, mientras que este banco trabaja sobre secuencias de proteinas y sobre protocolos de transferencia. No hay datos publicados en la informacion disponible para comparar rendimiento entre ellos.

## Limitaciones y advertencias

- Es un banco de modelos para investigacion, no un modelo de produccion: no hay `pipeline` declarado ni pesos cuantizados para despliegue estandar.
- Estado de publicacion incompleto: hay que consultar `publication_status.json` y esperar a `complete_verified` antes de asumir que todas las rutas del catalogo estan subidas.
- Licencia `asset-specific` con nombre `other`: los terminos constan en `LICENSES.md` y pueden variar por activo. No debe asumirse uso comercial libre sin revisar ese fichero.
- Riesgo de confusion de pooling: usar EOS-as-pad por defecto en los modelos native1024 cambia el clasificador y produce resultados invalidos. Lo mismo aplica al separador insertado en los modelos native256.
- Los `safe.pt` de los modelos conjuntos no son checkpoints de Hugging Face `AutoModel`; cargarlos con las utilidades estandar fallara.
- Varianza entre seeds: los seeds de fine-tuning no son seeds de preentrenamiento independientes, y los clasificadores reutilizados o la inferencia repetida no equivalen a nuevas repeticiones de entrenamiento. Comparar seeds como si fueran independientes infla las conclusiones.
- Generalizacion: la model card advierte que el ajuste en la fuente de entrenamiento es distinto de la generalizacion en fuente, y que el rendimiento es exploratorio y dependiente de la tarea.
- Orientacion de clase: las etiquetas de validacion en ingles pueden fijar la orientacion de clase, que debe mantenerse fija en test y confirmacion. No se usan actualizaciones de gradiente en ingles en el SFT de fuente proteica.
- Idiomas: no hay soporte multilingue declarado. La entrada esperada son secuencias de proteinas.
- Sesgos conocidos: no disponibles. No hay evaluacion de sesgo publicada en la informacion proporcionada.
- Riesgo de alucinacion: no aplica de forma directa al uso como clasificador, pero si se emplea el backbone GPT-2 para generar texto, el riesgo es el estandar de un modelo de 124 M de parametros.
- Trazabilidad: la reproducibilidad exacta depende de fijar el entorno numerico indicado; otras versiones de PyTorch o Transformers pueden alterar las puntuaciones.
- Repositorio masivo: 148,4 GB y 313 checkpoints. Un barrido completo de evaluacion tiene un coste de almacenamiento y computo considerable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dnagpt/bio2nl-models-2026-10
- Repositorio de datos, codigo y tablas por seed: https://huggingface.co/datasets/dnagpt/bio2nl-data-2026-10
- Licencias del repositorio: https://huggingface.co/dnagpt/bio2nl-models-2026-10/blob/main/LICENSES.md
- Repositorio anterior: https://huggingface.co/dnagpt/bio2nl-models
- Backbone oficial: https://huggingface.co/openai-community/gpt2
- Paper DNAGPT (referencia adyacente): https://arxiv.org/abs/2307.05628
- Ficha DNAGPT2 (referencia adyacente): https://bio.rodeo/models/dnagpt2
