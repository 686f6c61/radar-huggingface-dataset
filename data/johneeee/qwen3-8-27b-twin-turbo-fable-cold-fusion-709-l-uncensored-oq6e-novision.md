# Johneeee/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-oQ6e-novision

## Resumen

Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-oQ6e-novision es un checkpoint de 26.895.998.464 parametros (aproximadamente 26,9 B segun los tensores safetensors) publicado por el usuario Johneeee en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una cuantizacion mixta de 6 bits realizada con la herramienta oQ (oMLX v0.6.4) sobre un modelo previo con el mismo nombre sin el sufijo de cuantizacion. El campo `model_type` declarado es `qwen3_5`, y el nombre sugiere que deriva de la familia Qwen, aunque no hay documentacion que lo confirme.

El repositorio esta etiquetado como `mlx`, `safetensors`, `quantized`, `6-bit` y `oq`, con un tamano de 22,5 GB. Esto lo confina al ecosistema MLX de Apple: solo es ejecutable en Apple Silicon (M1/M2/M3/M4 y variantes Pro, Max y Ultra) mediante memoria unificada, no en GPUs NVIDIA ni en el stack CUDA habitual.

Su relevancia practica es hoy muy limitada y muy especifica: es un artefacto de cuantizacion con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada, sin idiomas declarados, sin pipeline declarado y sin model card tecnica mas alla de un bloque de cuatro lineas sobre el metodo de cuantizacion. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo: los unicos resultados obtenidos son foros sin ninguna relacion tecnica, por lo que no hay informacion externa verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el campo `model_type` de la model card indica `qwen3_5`; se desconoce si es transformer denso, MoE o hibrido) |
| Parametros totales | 26.895.998.464 (aproximadamente 26,9 B), medidos sobre los tensores safetensors del repositorio |
| Parametros activos | no disponible (no se ha confirmado que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | unica variante publicada: 6 bits, group size 64, cuantizacion mixta oQ (oMLX v0.6.4), formato MLX safetensors |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repositorio no declara licencia) |
| Formato de pesos | safetensors en formato MLX (no hay GGUF, no hay safetensors estandar de PyTorch, no hay AWQ/GPTQ) |
| Tamano del repositorio | 22,5 GB |
| Libreria declarada | mlx |
| Pipeline declarado | no disponible |
| Autor | Johneeee |
| Fecha de creacion | 2026-09-13 (segun metadatos del repositorio) |
| Fecha de ultima actualizacion | 2026-09-13 (segun metadatos del repositorio) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del modelo base. La model card unicamente declara el tipo de modelo como `qwen3_5`, sin especificar numero de capas, dimension oculta, cabezas de atencion, uso de atencion lineal o decodificacion especulativa, ni si se trata de un transformer denso, un MoE o una arquitectura hibrida. Tampoco hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si el modelo base paso por fases de RLHF, DPO u otro tipo de ajuste por preferencias. El sufijo `Uncensored` del nombre apunta a un ajuste orientado a reducir los rechazos del modelo, pero no hay ninguna documentacion que lo confirme ni que detalle el metodo empleado. El sufijo `novision` sugiere la ausencia de torre de vision, extremo igualmente no confirmado.

Lo unico documentado con precision es el proceso de cuantizacion: se aplico oQ (oMLX v0.6.4), un esquema de cuantizacion de precision mixta, con 6 bits por peso y un group size de 64, y el resultado se serializo en safetensors con el formato propio de MLX. El modelo resultante queda, por tanto, ligado a dicha libreria y no puede cargarse con transformers, vLLM o llama.cpp sin una conversion previa que no se ha publicado.

## Capacidades

- Generacion de texto: es la capacidad minima esperable de un decoder de la familia `qwen3_5`, pero no hay ninguna evaluacion publicada que la respalde en este checkpoint.
- Razonamiento, matematicas y generacion de codigo: no disponible. No se ha publicado ninguna prueba ni descripcion de capacidades.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible. El repositorio no declara idiomas.
- Vision: el nombre incluye el sufijo `novision`, lo que indica ausencia de capacidades visuales, aunque no hay confirmacion documental.
- Audio: no disponible, y el nombre no sugiere soporte.
- Ejecucion local en Apple Silicon: capacidad confirmada por el formato MLX y la libreria declarada, siempre que el equipo disponga de memoria unificada suficiente.

## Casos de uso

- Inferencia local con privacidad de datos en un Mac: el checkpoint esta en formato MLX y ocupa 22,5 GB, por lo que puede cargarse y ejecutarse integramente en un Mac con memoria unificada de 32 GB o mas, sin enviar datos a servicios externos. Es adecuado para flujos de trabajo de texto sobre material confidencial (borradores internos, notas clinicas o juridicas) siempre que se verifique antes la calidad del modelo mediante una evaluacion propia.
- Evaluacion de degradacion por cuantizacion: al existir un modelo base sin sufijo de cuantizacion y esta variante de 6 bits con group size 64, el repositorio permite comparar la salida del modelo original frente a la cuantizada en tareas controladas, midiendo perplejidad y tasa de acierto antes de decidir que variante desplegar.
- Investigacion sobre alineacion y modelos sin censura: dado el sufijo `Uncensored`, es un objeto de estudio para medir que tipos de peticiones deja de rechazar respecto al modelo base y con que frecuencia aparecen respuestas degradadas o factualmente incorrectas. Requiere supervision humana y filtros de salida en cualquier uso abierto al publico.
- Reproducibilidad de pipelines de cuantizacion: el repositorio documenta herramienta (oQ, oMLX v0.6.4), bits y group size, lo que lo convierte en un caso de referencia para replicar el proceso sobre otros modelos y comprobar si los hiperparametros declarados producen un artefacto del mismo tamano y comportamiento.
- Prototipado rapido en un portatil Apple: para equipos que ya trabajan en MLX y quieren un modelo de aproximadamente 27 B en local sin depender de un servidor, este checkpoint se puede servir con `mlx_lm.server` y consumir desde una API compatible con OpenAI en la red local durante la fase de prototipo.
- Base para comparativas internas de memoria y latencia: aunque no haya datos publicados de throughput, el repositorio permite medir en hardware concreto (por ejemplo M3 Max de 64 GB) el tiempo de primera token y los tokens por segundo de un modelo de 26,9 B a 6 bits, y usar esa cifra como referencia interna para dimensionar despliegues.

En cualquier caso, los casos anteriores son aplicaciones potenciales derivadas del formato y el tamano, no capacidades verificadas del modelo: no hay benchmarks, ni demostraciones, ni ejemplos de uso publicados por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card se limita a describir el proceso de cuantizacion (6 bits, group size 64, oQ/oMLX v0.6.4) y no incluye cifras de MMLU, HumanEval, GSM8K, MT-Bench ni de ningun otro conjunto de evaluacion. La busqueda web tampoco aporto ningun resultado relacionado con el modelo.

## Requisitos de hardware

- Memoria necesaria para los pesos: 6 bits por parametro sobre 26.895.998.464 parametros equivalen a unos 20,2 GB de pesos, mas los metadatos de escala y sesgo de grupo (group size 64), que anaden aproximadamente 1,7 GB. El repositorio ocupa 22,5 GB en disco.
- Plataforma obligatoria: Apple Silicon. MLX no soporta CUDA ni ROCm, por lo que no se puede ejecutar en GPUs NVIDIA o AMD con este formato.
- Memoria unificada recomendada: 32 GB como minimo para cargar el modelo y dejar margen para el cache KV, el sistema operativo y otras aplicaciones; 64 GB o mas si se trabaja con contextos largos. En un Mac de 24 GB es probable que el modelo no se cargue o que provoque intercambio de memoria en disco.
- GPUs compatibles: no disponible. No hay soporte de A100, H100, RTX 4090 ni de ninguna GPU discreta con esta distribucion de pesos.
- Cabe en GPU de consumo: no, tal como esta publicado, porque depende de memoria unificada de Apple Silicon; en un Mac de 32 GB o mas si es viable.
- Opciones de despliegue: mlx-lm (`mlx_lm.generate`, `mlx_lm.server`), la libreria mlx y herramientas graficas compatibles con MLX. No es compatible con vLLM, TGI, Ollama ni llama.cpp sin una conversion a GGUF que no se ha publicado.
- Latencia y throughput estimados: no disponible. El autor no publica mediciones, y no se pueden extrapolar sin conocer la arquitectura ni la longitud de contexto del modelo base.
- Coste de cache KV: no estimable, ya que se desconoce el numero de capas, la dimension de las cabezas y la longitud de contexto entrenada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no permite identificar con fiabilidad modelos comparables: se desconoce la arquitectura, el contexto, el idioma y la licencia del modelo base, y no hay ningun dato de rendimiento publicado. Los unicos resultados de busqueda web obtenidos no guardan relacion con el modelo ni con modelos de lenguaje, por lo que no aportan referencias comparables.

| Modelo | Parametros | Contexto | Licencia | Rendimiento publicado | Disponibilidad |
|---|---|---|---|---|---|
| Johneeee/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-oQ6e-novision | 26,9 B | no disponible | no disponible | no disponible | MLX safetensors, 22,5 GB |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no incluye campo de licencia. Esto impide determinar si el uso comercial esta permitido y es un bloqueo objetivo para cualquier despliegue en produccion o redistribucion. Conviene contactar con el autor o asumir que no hay autorizacion explicita.
- Procedencia del modelo base sin verificar: no se indica de que checkpoint concreto deriva ni con que permiso se ha cuantizado. Si el modelo original tuviera una licencia restrictiva, esta no se hereda de forma visible en este repositorio.
- Contenido sin censura: el nombre incluye `Uncensored`, lo que sugiere una reduccion deliberada de los rechazos. Es esperable un mayor riesgo de contenido ofensivo, danino o ilegal y de respuestas fuera de politica, especialmente en aplicaciones abiertas al publico. Requiere filtros de entrada y salida y revision humana.
- Riesgo de alucinacion: no disponible en cuanto a magnitud medida. Como cualquier modelo generativo de esta escala, puede producir afirmaciones incorrectas con seguridad, y aqui no hay evaluaciones que cuantifiquen ese riesgo.
- Degradacion por cuantizacion: la cuantizacion a 6 bits con group size 64 introduce perdida de precision respecto al modelo original. La magnitud no esta documentada y debe medirse con datos propios antes de usar el checkpoint en tareas sensibles.
- Idiomas no declarados: no se puede confirmar el soporte ni la calidad en castellano. Si el modelo base esta centrado en ingles, el rendimiento en otros idiomas sera notablemente inferior.
- Longitud de contexto desconocida: no se puede planificar un caso de uso con documentos largos ni estimar el consumo de memoria del cache KV.
- Repositorio sin traccion ni validacion: 0 descargas y 0 likes implican que no hay comunidad que haya verificado el funcionamiento del artefacto; tampoco hay carpeta de ejemplos, scripts de carga ni pruebas publicadas.
- Fecha de creacion inusual: los metadatos indican una creacion el 13 de septiembre de 2026, posterior a la mayoria de referencias publicas disponibles. Conviene verificar la autenticidad y el contenido real del repositorio antes de integrarlo en cualquier flujo.
- Dependencia de plataforma: al estar solo en formato MLX, no hay ruta de despliegue en servidores con GPU NVIDIA, lo que limita su uso a estaciones de trabajo Apple Silicon.
- Nomenclatura no estandar: nombres como `8`, `TURBO`, `Fable`, `Cold Fusion` o `709-L` no siguen la convencion de la familia Qwen y no permiten deducir el modelo base, el metodo de mezcla o el ajuste aplicado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Johneeee/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-oQ6e-novision
- Herramienta de cuantizacion oQ / oMLX (citada en la model card): https://github.com/jundot/omlx
- Otros enlaces relevantes: no disponible. La busqueda web no devolvio ningun resultado relacionado con el modelo, su paper, su repositorio de codigo, su demo o su modelo base.
