# maria715/CAT_llama3b_likeZephyr_eps0600_123_relativelr_utility_100_NEW

## Resumen

CAT_llama3b_likeZephyr_eps0600_123_relativelr_utility_100_NEW es un adaptador LoRA alojado en HuggingFace por el usuario maria715, derivado de experimentos de tesis de master sobre entrenamiento adversarial orientado a la robustez de modelos de lenguaje. No se trata de un modelo completo con pesos base, sino de un adaptador PEFT (formato safetensors, libreria peft) que debe combinarse con un modelo base no especificado en la model card. El repositorio ocupa 1,2 GB y no registra descargas ni likes en el momento de la consulta.

El nombre del artefacto codifica los hiperparametros del experimento: un modelo base de la familia Llama de aproximadamente 3B parametros ("llama3b"), un procedimiento de ajuste inspirado en Zephyr ("likeZephyr"), un presupuesto de perturbacion adversarial epsilon de 0,6 ("eps0600"), un esquema de learning rate relativo ("relativelr") y un peso de utilidad de 100 ("utility_100"). Ninguno de estos extremos esta confirmado por documentacion del autor: la model card se limita a una unica frase descriptiva, sin detallar el modelo base, el dataset, los hiperparametros de entrenamiento ni los resultados obtenidos.

Su relevancia es acotada y de caracter fundamentalmente investigador. Aporta un punto de partida reproducible para estudiar el compromiso entre robustez adversarial y utilidad general en modelos pequenos, un area con poca publicacion de artefactos abiertos. No obstante, la ausencia de licencia, de idiomas declarados, de pipeline de inferencia y de cualquier metrica publicada lo desaconseja para uso en produccion sin una evaluacion previa por parte del equipo que lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA; la arquitectura del modelo base no se especifica. El nombre sugiere un transformer decoder-only de la familia Llama de ~3B) |
| Parametros totales | no disponible (el adaptador pesa 1,2 GB en el repositorio; no se indica el numero de parametros del modelo base) |
| Parametros activos | no procede (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible (depende del modelo base, que no se identifica) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos del adaptador en safetensors; no se incluyen GGUF ni variantes cuantizadas) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA/PEFT) |
| Libreria | peft |
| Tamano del repositorio | 1,2 GB |
| Pipeline declarado | no disponible |
| Etiquetas | peft, safetensors, lora, adversarial-training, region:us |

## Arquitectura y entrenamiento

La informacion publica no permite describir la arquitectura del modelo base ni la del entrenamiento. Se sabe que el artefacto es un adaptador LoRA (Low-Rank Adaptation) distribuido en formato PEFT, lo que implica que congela los pesos del modelo base e inyecta matrices de bajo rango en determinadas capas. El unico indicio sobre el procedimiento de ajuste es la etiqueta `adversarial-training` y la nomenclatura del propio identificador, que apunta a un esquema con perturbaciones adversariales controladas por un parametro epsilon (0,6 segun el nombre), un termino de utilidad ponderado (100) y un learning rate relativo. Se desconoce si el ajuste partio de un modelo ya instruido, si se aplico DPO, RLHF u optimizacion directa sobre ejemplos adversariales, y si existio una fase de alineacion posterior.

Tampoco hay datos sobre el corpus de entrenamiento: numero de tokens, composicion, proporcion de ejemplos adversariales frente a ejemplos limpios, idioma o dominio. La referencia "likeZephyr" en el nombre podria indicar que se replico la receta de ajuste del modelo Zephyr (destilacion de preferencias sobre un modelo Mistral), pero esta interpretacion no esta confirmada por el autor. La model card no incluye hiperparametros, curvas de entrenamiento, configuracion de `LoraConfig` ni ninguna innovacion tecnica declarada mas alla del propio procedimiento adversarial.

## Capacidades

No se ha publicado ninguna evaluacion de capacidades, por lo que la siguiente lista se limita a lo que puede inferirse con seguridad del formato del artefacto y queda pendiente de verificacion empirica:

- Generacion de texto: heredada del modelo base, no verificada para este adaptador.
- Razonamiento y matematicas: sin datos.
- Generacion de codigo: sin datos.
- Tool calling / function calling: sin datos; depende de si el modelo base y el chat template lo soportan.
- Comportamiento agentico y razonamiento multi-paso: sin datos.
- Capacidades multilingues: sin datos; no se declara ningun idioma.
- Modo de pensamiento explicito (thinking): sin datos.
- Vision o audio: no procede segun los tags publicados (solo texto, peft y lora).
- Robustez adversarial: es el supuesto objetivo del entrenamiento, pero no se aporta ninguna metrica que lo cuantifique (ni tasa de exito de ataque, ni degradacion de utilidad).

## Casos de uso

- Investigacion en robustez adversarial: el adaptador sirve como punto de partida reproducible para medir como varia la resistencia a ataques de prompt (inyeccion, jailbreak, perturbaciones en la entrada) en un modelo de ~3B, comparando contra el mismo modelo base sin adaptador.
- Reproduccion y extension de experimentos academicos: un grupo de tesis puede reutilizar el adaptador como linea base en un estudio sobre el compromiso entre epsilon adversarial y utilidad, variando el modelo base o el corpus de ataque.
- Evaluacion de pipelines de red-teaming: integrarlo en un banco de pruebas que compare modelos ajustados de forma adversaria frente a modelos alineados de forma convencional, para calibrar herramientas de deteccion de respuestas inseguras.
- Estudio de la degradacion de utilidad: dado el peso de utilidad de 100 en el nombre, resulta adecuado para analisis controlados de cuanto rendimiento general se pierde a cambio de robustez, usando benchmarks estandar como MMLU o GSM8K sobre el modelo fusionado.
- Docencia en tecnicas PEFT: por su tamano manejable (adaptador de 1,2 GB sobre un modelo de ~3B), es util para practicas de carga, fusion e inferencia con la libreria peft y transformers en hardware de consumo.
- Experimentos de seguridad comparada: permite contrastar si el ajuste adversarial mitiga comportamientos indeseados en categorias concretas de prompt, siempre que se disponga de un conjunto de evaluacion propio y se documente que la licencia del modelo base lo permita.
- Base para un ajuste posterior: el adaptador puede reutilizarse como inicializacion en una segunda fase de entrenamiento (por ejemplo, con datos de instrucciones en castellano), aunque sin licencia declarada este uso queda en un limbo juridico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench, TruthfulQA ni metricas especificas de robustez adversarial (tasa de exito de ataque, ASR, robustez certificada o similar). Tampoco se aportan comparaciones contra el modelo base sin adaptar, que serian imprescindibles para atribuir cualquier efecto al entrenamiento adversarial.

## Requisitos de hardware

Las cifras siguientes son estimaciones orientativas derivadas del tamano aparente del modelo base (~3B), no datos confirmados por el autor:

- VRAM para el adaptador: 1,2 GB adicionales sobre el modelo base, tanto en carga con PEFT como tras fusionar los pesos.
- VRAM estimada en FP16/BF16 para un modelo base de ~3B: en torno a 6-7 GB de pesos mas cache KV; con una ventana de 8k y lote pequeno, alrededor de 8-10 GB en total.
- VRAM estimada en cuantizacion de 4 bits (bitsandbytes o GPTQ/AWQ): aproximadamente 2,5-4 GB de pesos, mas cache KV.
- GPU consumer: factible en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 en FP16 y en 4 bits, siempre que el modelo base sea efectivamente de ~3B. En GPUs de 8 GB seria necesario cuantizar.
- GPU de datacenter: A100 40/80 GB, H100, L40S y A10G estan sobredimensionadas para un modelo de este tamano, pero resultan utiles para barridos de evaluacion en paralelo y lotes grandes.
- Opciones de despliegue: transformers + peft para cargar el adaptador directamente; vLLM y TGI admiten adaptadores LoRA sobre el modelo base (vLLM con `--enable-lora`); llama.cpp y Ollama solo son aplicables tras fusionar el adaptador en el modelo base y convertir a GGUF, ya que no consumen adaptadores PEFT de forma nativa.
- Latencia y throughput: no disponibles. No se han publicado mediciones y cualquier cifra dependeria del modelo base, del backend y del hardware.
- Almacenamiento: el repositorio requiere 1,2 GB en disco, mas el espacio del modelo base (aproximadamente 6 GB en FP16 o 2-3 GB en 4 bits).

## Comparativa con modelos similares

No existen datos publicados de este adaptador que permitan una comparacion sustantiva. La tabla siguiente contrasta las alternativas de la misma categoria de tamano (~3B) segun la documentacion publica de cada proyecto; los valores del adaptador analizado se marcan como no disponibles porque dependen de un modelo base sin identificar.

| Modelo | Parametros | Contexto | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|
| CAT_llama3b_likeZephyr_eps0600_123_relativelr_utility_100_NEW | no disponible | no disponible | no disponible | adaptador LoRA en safetensors | Adaptador de investigacion sin metricas ni modelo base declarados |
| Llama 3.2 3B Instruct | 3,21B | 128k | Llama 3.2 Community License | safetensors, GGUF | Referencia habitual como base para adaptadores de ~3B; requiere cumplir la politica de uso aceptable |
| Qwen2.5 3B Instruct | 3,09B | 32.768 nativo (ampliable con YaRN) | Apache 2.0 | safetensors, GGUF | Alternativa permisiva para uso comercial y con soporte multilingue amplio |
| Phi-3.5-mini-instruct | 3,8B | 128k | MIT | safetensors, GGUF | Tamano ligeramente superior, licencia muy permisiva |

La comparacion debe interpretarse con cautela: los tres modelos de referencia son pesos completos con licencia y evaluaciones publicas, mientras que el artefacto analizado es un adaptador sin informacion verificable.

## Limitaciones y advertencias

- Ausencia total de licencia: no se especifica ninguna, lo que impide determinar si se permite uso comercial, modificacion o redistribucion. En la practica, esto bloquea su adopcion en produccion.
- Falta de trazabilidad del modelo base: no se indica que pesos base hay que cargar. Si el adaptador se aplica sobre un modelo distinto del entrenado, los resultados seran impredecibles y probablemente degenerados.
- Riesgo de alucinacion: inherente al modelo base. El ajuste adversarial no corrige la factualidad y, segun el peso de utilidad aplicado, podria haberla degradado.
- Sesgos: no evaluados ni documentados. No hay analisis de sesgo de genero, raza, religion ni idioma.
- Idiomas: no se declara ningun idioma soportado; se desconoce si el adaptador conserva la competencia multilingue del modelo base o la ha reducido.
- Ausencia de benchmarks de robustez: pese a que el objetivo declarado es la robustez adversarial, no se publica ninguna tasa de exito de ataque ni evaluacion de utilidad. No se puede afirmar que el adaptador sea mas robusto que su base.
- Riesgo de sobreajuste adversarial: un epsilon de 0,6 y un peso de utilidad de 100 (segun la nomenclatura) sugieren un ajuste agresivo que podria producir respuestas excesivamente conservadoras, evasivas o degradadas en tareas generales.
- Datos de creacion anomalos: las fechas del repositorio (30 de septiembre de 2026) son posteriores a la fecha de consulta habitual, lo que sugiere un error de metadatos o una manipulacion del entorno de publicacion. Conviene verificarlo antes de citar el modelo.
- Repositorio sin comunidad: cero descargas y cero likes implican que el artefacto no ha sido validado por terceros; no existen issues, discusiones ni informes de uso.
- Sin pipeline declarado: no se especifica tarea (`text-generation` u otra), lo que complica la integracion automatica en herramientas que dependen de ese campo.

## Enlaces

- HuggingFace: https://huggingface.co/maria715/CAT_llama3b_likeZephyr_eps0600_123_relativelr_utility_100_NEW
- No se han encontrado otros enlaces (papers, blogs, repositorios de codigo o demos) en la informacion disponible.
