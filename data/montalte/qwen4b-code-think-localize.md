# Montalte/qwen4b-code-think-localize

## Resumen

Montalte/qwen4b-code-think-localize es un artefacto de fusión (merge) construido sobre Qwen/Qwen3-4B-Base, publicado por el usuario Montalte. No se trata de un modelo entrenado desde cero ni de un fine-tuning conversacional al uso, sino de un experimento de transferencia direccional de capacidades entre dominios matematicas y codigo, generado mediante la tecnica denominada "localize" (Plan B Localize-and-Stitch) sobre validacion MergeBench de un unico dominio fuente. El resultado es un checkpoint de 4.022.468.096 parametros (aproximadamente 4,02 mil millones) en formato safetensors.

El modelo hereda la arquitectura del transformer decoder-only de la familia Qwen3, con licencia Apache-2.0, y su proposito declarado es servir como material de estudio para medir como se desplaza la especializacion en codigo dentro del espacio de pesos al aplicar una mascara de sparsity del 0,1 sobre el cuerpo de la red. La model card no documenta capacidades de producto, evaluaciones ni idiomas soportados, por lo que debe tratarse como un artefacto de investigacion y no como un modelo listo para produccion.

Su relevancia actual es acotada y muy especifica: interesa a quienes investigan tecnicas de merging, poda estructural y edicion de modelos, ya que expone de forma explicita los hiperparametros del proceso (lr=1e7, 10 epocas, n-shot=64, seed=42, perfil de mascara plan_b) y el identificador exacto del commit base. Con 0 descargas y 0 likes en el momento de la consulta, carece de validacion comunitaria independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3-4B-Base; familia Qwen3) |
| Parametros totales | 4.022.468.096 (aproximadamente 4,02 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible (el repo se distribuye en safetensors sin cuantizar) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen3-4B-Base (commit 906bfd4b4dc7f14ee4320094d8b41684abff8539) |
| Especialista de origen | modrill/code-think-q4b-20260908 |
| Dominio / modo | code / think |
| Metodo de fusion | localize (Plan B Localize-and-Stitch) |
| Tamano del repositorio | 8,1 GB |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen/Qwen3-4B-Base fijado al commit 906bfd4b4dc7f14ee4320094d8b41684abff8539 y toma como fuente de especializacion el modelo modrill/code-think-q4b-20260908, etiquetado como especialista en el dominio "code" y en modo "think". Sobre esa base se aplica el metodo "localize", descrito por el autor como Plan B Localize-and-Stitch sobre validacion MergeBench restringida al dominio fuente. No se trata por tanto de un entrenamiento supervisado clasico ni de un ajuste con RLHF o DPO: la model card no menciona datos de entrenamiento, numero de tokens, composicion del dataset ni fases de alineamiento.

Los hiperparametros documentados del proceso son: objetivo de sparsity (keep) de 0,1; tasa de aprendizaje 1e7; 10 epocas; n-shot de 64; semilla 42; perfil de mascara plan_b; y tarea "coding". El autor indica explicitamente que las capas de embedding y lm_head quedan excluidas de la mascara, de modo que el "stitch" se aplica solo al cuerpo del modelo, en coherencia con el protocolo Plan B previo. No se documenta ninguna innovacion adicional en decodificacion (por ejemplo, decodificacion especulativa), atencion lineal ni mecanismos hibridos.

La consecuencia practica es que el modelo resultante conserva la topologia y el tamano del base (4,02 B de parametros, sin cambio en el numero de capas ni de cabezas), pero con una redistribucion selectiva de pesos orientada a preservar o trasladar comportamiento de codigo y razonamiento. Al no publicarse evaluaciones, no es posible verificar si esa transferencia se produjo ni en que magnitud.

## Capacidades

- Generacion de texto autoregresiva estandar, en linea con el modelo base Qwen3-4B-Base.
- Especializacion declarada en codigo (dominio "code"), aunque sin evaluacion publicada que la cuantifique.
- Modo "think" heredado del especialista de origen, segun la etiqueta de la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; los idiomas no se declaran.
- Capacidades especiales (vision, audio): no disponibles; el pipeline es exclusivamente text-generation.
- Compatibilidad con text-generation-inference y endpoints, segun las etiquetas del repositorio.

## Casos de uso

- Investigacion en merging de modelos: el checkpoint sirve como referencia reproducible para replicar el protocolo Plan B Localize-and-Stitch con semilla 42, sparsity 0,1 y perfil de mascara plan_b, comparando el resultado contra el base sin fusionar.
- Estudio de transferencia entre dominios: permite analizar si la especializacion en codigo de un modelo fuente se conserva tras la mascara body-only, midiendo degradacion en tareas de matematicas con el mismo conjunto de validacion.
- Analisis de poda estructural: al excluir embedding y lm_head, el artefacto es util para estudiar como afecta la sparsity selectiva del cuerpo a la perplejidad y a la estabilidad de la generacion.
- Punto de partida para fine-tuning posterior: al ser un modelo denso de 4 B bajo Apache-2.0, puede usarse como inicializacion en experimentos academicos de ajuste supervisado sobre codigo, siempre que se valide antes su calidad real.
- Reproducibilidad de pipelines de publicacion: el autor documenta commit base, especialista, semilla e hiperparametros, lo que permite auditar la cadena completa de generacion del artefacto en entornos de investigacion.
- Pruebas de integracion con transformers y TGI: el repositorio declara compatibilidad con text-generation-inference y endpoints, por lo que puede desplegarse en un entorno de laboratorio para verificar la carga de safetensors y el comportamiento de la generacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones calculadas a partir del numero de parametros (4,02 B) y del peso de los formatos habituales, no datos publicados por el autor.

- Pesos en FP16/BF16: aproximadamente 8,0 GB solo de pesos; con cache KV y overhead de runtime, entre 10 y 12 GB de VRAM segun longitud de contexto y batch.
- Pesos en INT8: aproximadamente 4,0 GB de pesos; en torno a 6-8 GB de VRAM total en configuraciones moderadas.
- Pesos en cuantizacion de 4 bits (si se generan a partir de los safetensors): aproximadamente 2,5 GB de pesos; viable en GPUs de 6-8 GB con contextos cortos.
- GPU recomendadas (por capacidad, no por validacion del autor): A100 40/80 GB, H100 80 GB y L40S para despliegue en servidor; RTX 4090, RTX 4080 y RTX 3090 para inferencia local en BF16.
- Compatibilidad con GPU de consumo: si, en FP16 cabe en tarjetas de 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 4090) y en cuantizacion de 4 bits en GPUs de 8 GB.
- Opciones de despliegue declaradas o plausibles: transformers (libreria declarada), text-generation-inference (etiqueta del repo) y endpoints compatibles. vLLM, llama.cpp u Ollama no se mencionan en la informacion disponible; para llama.cpp y Ollama seria necesario convertir los safetensors a GGUF, conversion no documentada por el autor.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

Los datos de la columna de este modelo proceden de la informacion proporcionada; el resto se indica como no disponible porque no hay evaluaciones comparables en la informacion disponible.

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Notas |
|---|---|---|---|---|---|
| Montalte/qwen4b-code-think-localize | 4,02 B | No disponible | Apache-2.0 | Sin benchmarks publicados | Merge experimental sobre Qwen3-4B-Base, 0 descargas |
| Qwen/Qwen3-4B-Base | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | No disponible | Modelo base declarado por el autor |
| modrill/code-think-q4b-20260908 | No disponible | No disponible | No disponible | No disponible | Especialista de origen del merge |
| Otras alternativas de tamano similar (3-4 B) | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni MMLU, ni HumanEval, ni GSM8K, ni evaluaciones cualitativas. No hay evidencia de que el merge mejore al base.
- Artefacto de investigacion: la propia model card lo describe como "merge artifact for directional math-code transfer experiments", no como un modelo de proposito general.
- Riesgo de degradacion silenciosa: una mascara de sparsity con keep=0,1 sobre el cuerpo puede deteriorar capacidades no relacionadas con codigo sin que exista una evaluacion que lo detecte.
- Sesgos conocidos: no disponibles. El autor no documenta analisis de sesgo ni composicion de datos, y al derivar de Qwen3-4B-Base hereda los sesgos de un modelo del que no se aporta informacion en esta ficha.
- Riesgo de alucinacion: no cuantificado. Al no haber alineamiento documentado (ni RLHF ni DPO en la informacion proporcionada), no cabe esperar un comportamiento conversacional pulido; el modo "think" procede de la etiqueta del especialista de origen.
- Idiomas: no declarados. No se puede asumir soporte multilingue ni siquiera en castellano.
- Longitud de contexto: no especificada en la model card; cualquier uso con contexto largo debe validarse empiricamente antes de desplegar.
- Licencia: Apache-2.0 permite uso comercial, pero la ausencia de garantias y de evaluacion hace desaconsejable su uso en produccion sin una validacion propia exhaustiva.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones publicas que aporten senal de calidad.
- Trazabilidad parcial: el especialista de origen modrill/code-think-q4b-20260908 aparece citado por identificador, sin enlace ni documentacion adicional en la informacion disponible.
- Busqueda web sin resultados relevantes: las consultas realizadas devolvieron unicamente resultados sobre una aplicacion de aparcamiento para autocaravanas, sin ninguna relacion con este modelo. No se ha localizado paper, blog ni repositorio asociado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Montalte/qwen4b-code-think-localize
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Commit base citado: 906bfd4b4dc7f14ee4320094d8b41684abff8539
- Especialista de origen (identificador citado en la model card, sin URL verificada): modrill/code-think-q4b-20260908
- Paper, blog o repositorio asociado: no disponible en la informacion proporcionada
- Resultados de busqueda web: sin coincidencias relevantes; los resultados obtenidos no guardan relacion con el modelo
