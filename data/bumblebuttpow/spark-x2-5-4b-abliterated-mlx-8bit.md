# bumblebuttpow/Spark-X2.5-4B-abliterated-MLX-8bit

## Resumen

Spark-X2.5-4B-abliterated-MLX-8bit es una cuantizacion de 8 bits en formato MLX del ajuste abliterado de Spark-X2.5-4B, un modelo denso de 4.112.079.360 parametros (4,1B) publicado por el usuario bumblebuttpow. El modelo original lo desarrollo XHToken, y la abliteracion (supresion de la direccion de rechazo en el espacio de activaciones) la realizo SC117. Esta version concreta esta pensada para ejecucion local en Apple silicon mediante el cargador Spark-MLX-LLM, que registra la arquitectura `spark2_5` para que MLX LM pueda instanciarla.

El interes tecnico del repositorio esta en el proceso de conversion y en la validacion declarada: se parte del tier BF16 en GGUF del modelo abliterado, se reconstruye un checkpoint con el layout de Hugging Face verificando los 290 tensores por nombre y forma, y despues se cuantiza con q8 afine y group size 64, dejando en fp16 las layernorms y las puertas sigmoide por cabeza de atencion. La model card afirma que la decodificacion voraz con plantilla de chat es identica token a token entre el GGUF BF16 de origen (llama.cpp en CPU) y esta version cuantizada (MLX en Metal), con un coste efectivo de 8,503 bits por peso.

La arquitectura mantiene la configuracion del modelo base: 36 capas, atencion hibrida 3:1 entre ventana deslizante de 512 tokens y atencion completa, GQA con 16 cabezas de consulta y 4 de clave/valor, `head_dim` de 256, contexto nativo declarado de 1.000.000 de tokens y embeddings atados. La relevancia actual es doble: por un lado, permite ejecutar un modelo de contexto muy largo en un portatil Apple con unos 4,5 GB de memoria pico; por otro, documenta un flujo reproducible de ida y vuelta GGUF -> safetensors -> MLX con verificacion criptografica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion hibrida 3:1 (ventana deslizante de 512 tokens : atencion completa), GQA de 16 cabezas de consulta y 4 de clave/valor, `head_dim` 256, MLP con GELU, embeddings atados |
| Parametros totales | 4.112.079.360 (4,1B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 1.000.000 de tokens nativo segun la model card del autor |
| Tipos de cuantizacion | 8 bits afine MLX (group size 64) en 181 tensores de proyecciones y embedding; fp16 en 73 layernorms y `model.norm` y en 36 puertas sigmoide `self_attn.g_proj`; 8,503 bits efectivos por peso incluyendo escalas y sesgos |
| Idiomas soportados | ingles (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con cuantizacion MLX (libreria `mlx`, requiere `custom_code` para la arquitectura `spark2_5`) |
| Tamano del repositorio | 4,4 GB (4,1 GB en disco segun el autor) |
| Memoria pico declarada | ~4,5 GB en inferencia (medido en un M4 Pro de 24 GB) |
| Modelos base | XHToken/Spark-X2.5-4B y SC117/Spark-X2.5-4B-abliterated-FIT-GGUF |
| Fecha de publicacion | 2026-09-28 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Spark-X2.5-4B, sin modificaciones: 36 capas transformer densas con un patron hibrido de atencion en proporcion 3:1, donde tres capas usan ventana deslizante de 512 tokens y una usa atencion completa. La atencion emplea GQA con 16 cabezas de consulta y 4 de clave/valor, con una dimension por cabeza de 256, y el MLP usa activacion GELU con embeddings atados entre entrada y salida. La plantilla de chat activa el modo de razonamiento (thinking) por defecto, y la model card recomienda muestreo con temperatura 1,0 y top_p 0,95.

Sobre el entrenamiento no hay informacion en la documentacion disponible: no se indica el numero de tokens, la composicion del dataset ni si hubo etapas de RLHF, DPO u otro ajuste por preferencias. Lo que si se documenta es el post-procesado: SC117 aplico una abliteracion (supresion de la direccion de rechazo) sobre el tune original y publico el resultado unicamente en GGUF; este repositorio reconstruye ese GGUF BF16 a un checkpoint con layout de Hugging Face verificando sha256 contra `SHA256SUMS.txt` y comprobando que los 290 tensores coinciden en nombre y forma con las cabeceras originales de XHToken. El script `conversion/spark2_5.py` de llama.cpp confirma que los tensores QKV fusionados y las puertas no llevan permutacion, por lo que no hubo reordenacion de pesos.

La innovacion destacable de esta ficha concreta no es el modelo sino el pipeline de cuantizacion: se usa `spark-mlx-convert` de Spark-MLX-LLM (el conversor de MLX LM con la arquitectura Spark2_5 registrada) y se mantienen deliberadamente en fp16 las puertas sigmoide por cabeza de atencion (`self_attn.g_proj`), que escalan cada cabeza y son sensibles a la cuantizacion agresiva; el autor justifica esa decision para preservar la fiabilidad del tool calling.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles y chino.
- Modo de razonamiento (thinking) activado por defecto en la plantilla de chat.
- Tool calling / function calling: el autor afirma que el mantenimiento de las puertas de atencion en fp16 preserva la fiabilidad de esta capacidad.
- Manejo de contextos muy largos: 1.000.000 de tokens nativos declarados, gracias a la combinacion de ventana deslizante y atencion completa.
- Ejecucion local en Apple silicon con memoria unificada, sin necesidad de GPU dedicada.
- Comportamiento con menos rechazos que el modelo instruct original, al ser un tune abliterado.
- Capacidades multimodales (vision, audio) y de otro tipo: no disponibles en la informacion proporcionada.
- Rendimiento en matematicas, codigo o razonamiento formal: no disponible, no se han publicado evaluaciones.

## Casos de uso

- Asistente local en un portatil Apple: con ~4,5 GB de memoria pico y unos 54 tokens/s en un M4 Pro, se puede mantener un asistente conversacional siempre disponible en el equipo sin enviar datos a la nube, util para entornos con requisitos de privacidad o sin conectividad.
- Analisis de documentos extensos: el contexto nativo de 1M tokens permite cargar libros tecnicos, expedientes o bases de codigo completas en una sola pasada, sin necesidad de trocear y recomponer con recuperacion externa.
- Atencion al cliente bilingue ingles-chino: el modelo cubre ambos idiomas de forma nativa, por lo que sirve para desplegar un bot multi-turno en mercados que operan en esas dos lenguas.
- Agentes con tool calling en local: al soportar function calling, se puede integrar en un bucle de agente que consulte APIs internas o bases de datos, ejecutando todo el razonamiento en el dispositivo y evitando costes de API.
- Asistencia de programacion en editor: generacion y explicacion de fragmentos de codigo dentro de un plugin local, con la ventaja de que el codigo propietario no sale del equipo.
- Investigacion sobre abliteration y seguridad: al existir la version original, la abliterada y esta cuantizada, el repositorio permite estudiar como afecta la supresion de la direccion de rechazo al comportamiento del modelo y como se preserva (o no) en la cuantizacion de 8 bits.
- Red teaming y evaluacion de alineamiento: si se necesita un modelo con menos rechazos para generar casos de prueba adversariales, este tune resulta util, siempre bajo un entorno controlado y con las advertencias de la licencia y de uso responsable.
- Procesamiento por lotes en un unico equipo Apple: resumen, clasificacion o extraccion de informacion sobre volumenes grandes de texto sin infraestructura de servidor.
- Reproduccion de pipelines de cuantizacion: sirve como referencia practica para convertir un GGUF a safetensors y despues a MLX manteniendo equivalencia funcional verificada token a token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, y la busqueda web realizada no devolvio resultados relevantes sobre este modelo (los resultados obtenidos corresponden a temas sin relacion).

El unico dato de rendimiento disponible es la medicion de inferencia aportada por el autor: aproximadamente 54 tokens/s de generacion y unos 4,5 GB de memoria pico en un Apple M4 Pro con 24 GB de memoria unificada. Tambien se declara que la decodificacion voraz con plantilla de chat es identica token a token entre el GGUF BF16 de origen y esta cuantizacion, lo que implica que la cuantizacion no degrada la salida en ese escenario de prueba concreto (no equivale a una evaluacion de calidad en tareas abiertas).

## Requisitos de hardware

- Inferencia en Apple silicon exclusivamente: la libreria es MLX, que solo funciona en chips de Apple (serie M). No hay soporte para CUDA ni ROCm en este repositorio.
- Memoria pico medida: ~4,5 GB en un M4 Pro de 24 GB, con 4,1 GB de pesos en disco. Un equipo con 8 GB de memoria unificada deberia poder cargar el modelo para contextos cortos; para contextos largos se necesita mas margen.
- Cache KV estimada (calculo propio a partir de la configuracion declarada, no aportado por el autor): con GQA de 4 cabezas de clave/valor, `head_dim` 256 y fp16, cada capa de atencion completa consume 4 KiB por token, y hay 9 capas de ese tipo (patron 3:1 sobre 36 capas), lo que da unos 36 KiB por token. A 128.000 tokens de contexto eso supone unos 4,5 GiB adicionales; a 1.000.000 de tokens, unos 36 GiB, inviables en hardware de consumo. Las 27 capas de ventana deslizante quedan acotadas a 512 tokens y suman un coste constante de unos 54 MiB.
- GPU recomendadas: no aplica en el sentido habitual; el modelo esta pensado para memoria unificada de Apple. Para A100, H100 o RTX 4090 habria que usar otra representacion de pesos (por ejemplo el GGUF base con llama.cpp u otro runtime compatible), no este repositorio MLX.
- Opciones de despliegue: `spark-mlx-server`, `spark-mlx-chat` y `spark-mlx-generate` del proyecto Spark-MLX-LLM. La arquitectura `spark2_5` no esta en `mlx-lm` estandar, por lo que hace falta esa extension; los wrappers la detectarian automaticamente si una version oficial de MLX LM incorporase un modulo nativo.
- Para hardware no Apple: el modelo base abliterado se distribuye en GGUF (SC117/Spark-X2.5-4B-abliterated-FIT-GGUF), lo que permite usar llama.cpp u Ollama.
- vLLM, TGI u otros servidores de inferencia: no disponibles para este formato MLX.
- Throughput de referencia: ~54 tokens/s en M4 Pro (24 GB). No se han publicado datos de latencia ni de throughput para otros equipos.

## Comparativa con modelos similares

La comparativa se establece con modelos densos de la misma franja de tamano (3B-4B). Los datos de los modelos alternativos proceden de sus model cards publicas; no se dispone de comparativas de rendimiento ejecutadas ni publicadas en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Formatos y disponibilidad | Rendimiento en benchmarks |
|---|---|---|---|---|---|
| Spark-X2.5-4B-abliterated-MLX-8bit | 4,1B denso | 1.000.000 tokens nativo | Apache-2.0 | MLX 8 bits (safetensors), requiere cargador Spark-MLX-LLM | no disponible |
| Qwen3-4B | 4,0B denso | 32.768 tokens nativos, ampliable con YaRN | Apache-2.0 | safetensors, GGUF, MLX, amplio soporte en runtimes | no disponible en esta ficha |
| Llama-3.2-3B-Instruct | 3,2B denso | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF, MLX, amplio soporte | no disponible en esta ficha |
| Gemma-3-4B-IT | 4B denso | 128.000 tokens | Gemma Terms of Use | safetensors, GGUF, MLX | no disponible en esta ficha |

Diferencias destacables: el contexto nativo declarado de 1M tokens de Spark-X2.5-4B es muy superior al de las alternativas de su franja, aunque no hay evaluaciones publicas que confirmen la calidad de recuperacion a esas distancias. Frente a Qwen3-4B con licencia Apache-2.0, las alternativas de Meta y Google imponen condiciones adicionales de uso comercial. Este repositorio solo cubre ingles y chino, mientras que Qwen3-4B y Gemma-3-4B declaran cobertura multilingue amplia. Por ultimo, el tune abliterado no tiene equivalente directo en las alternativas, que mantienen su alineamiento de seguridad original.

## Limitaciones y advertencias

- Es un tune abliterado: la direccion de rechazo esta suprimida, por lo que cabe esperar muchos menos rechazos que en el modelo instruct equivalente. El propio autor advierte de que la responsabilidad de uso recae en quien lo despliega. No es adecuado para aplicaciones expuestas a usuarios finales sin filtros adicionales.
- Riesgo de alucinacion: no hay evaluaciones publicadas de fidelidad ni de tasas de alucinacion. Un modelo de 4B con contexto nominal de 1M tokens tiende a degradar la recuperacion de informacion en posiciones lejanas del contexto; el contexto declarado no garantiza atencion efectiva a esa distancia.
- Idiomas: solo ingles y chino. No hay soporte declarado de castellano, por lo que el rendimiento en espanol no esta garantizado ni evaluado.
- Dependencia de un cargador no estandar: la arquitectura `spark2_5` no esta en `mlx-lm` de serie y requiere la extension Spark-MLX-LLM (etiqueta `custom_code`). Esto complica el despliegue y ata el modelo al mantenimiento de un proyecto externo.
- Plataforma: MLX solo funciona en Apple silicon. No se puede ejecutar en GPUs NVIDIA o AMD con este repositorio.
- Datos de calidad ausentes: cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados. La validacion aportada se limita a la equivalencia token a token frente al GGUF BF16 en decodificacion voraz, lo que no es una evaluacion de capacidades.
- Cuantizacion: aunque se declaran 8,503 bits efectivos por peso y equivalencia funcional en el escenario probado, la cuantizacion de 8 bits puede degradar tareas sensibles a precision numerica (matematicas, razonamiento de varios pasos) de forma no capturada por esa prueba.
- Licencia: Apache-2.0 en este repositorio, pero conviene verificar las condiciones del modelo base XHToken/Spark-X2.5-4B y del tune abliterado de SC117 antes de un uso comercial, ya que las obligaciones pueden encadenarse entre eslabones.
- Trazabilidad: la fecha de publicacion registrada (2026-09-28) resulta inusual y no se ha podido contrastar con fuentes independientes; el repositorio carece de validacion por parte de la comunidad.
- Sesgos: no hay informacion disponible sobre sesgos conocidos del modelo base ni sobre como la abliteration los modifica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bumblebuttpow/Spark-X2.5-4B-abliterated-MLX-8bit
- Modelo base original: https://huggingface.co/XHToken/Spark-X2.5-4B
- Tune abliterado en GGUF (SC117): https://huggingface.co/SC117/Spark-X2.5-4B-abliterated-FIT-GGUF
- Cargador MLX con soporte de la arquitectura Spark2_5: https://github.com/XHToken/Spark-MLX-LLM
- Repositorio y documentacion de MLX LM: no disponible en la informacion proporcionada (no se incluye enlace explicito)
- Paper tecnico del modelo base: no disponible
- Demo o espacio interactivo: no disponible
- Resultados de la busqueda web: sin resultados relevantes sobre el modelo; las referencias devueltas no guardan relacion con la ficha.
