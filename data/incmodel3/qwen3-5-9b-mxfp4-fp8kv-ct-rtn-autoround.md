# INCModel3/Qwen3.5-9B-MXFP4-FP8KV-CT-RTN-AutoRound

## Resumen

Qwen3.5-9B-MXFP4-FP8KV-CT-RTN-AutoRound es una version cuantizada a MXFP4 del modelo Qwen/Qwen3.5-9B, publicada por el usuario INCModel3. No es un modelo entrenado desde cero: se trata de un artefacto de compresion generado con AutoRound, la herramienta de cuantizacion de Intel, y empaquetado en el formato compressed-tensors. Su proposito es reducir el coste de memoria y de ancho de banda de un modelo de la familia Qwen3.5 para facilitar su despliegue en GPUs con poca VRAM, manteniendo la mayor parte de la calidad del modelo original.

El repositorio ocupa 12,2 GB e incluye pesos en safetensors. El recuento real de parametros declarado en el indice de safetensors es de 4.577.975.552 (unos 4,58 mil millones), una cifra que no coincide con el "9B" del nombre del repositorio; conviene verificar este punto antes de planificar el despliegue. La cuantizacion combina pesos MXFP4 (formato de coma flotante con exponente compartido por bloques, estandar OCP MicroScaling) con cache KV en FP8, lo que reduce tanto el peso de los parametros como la memoria asociada a contexto largo durante la inferencia.

La relevancia de esta ficha es limitada pero concreta: se trata de una publicacion reciente (creada el 13 de septiembre de 2026), con cero descargas y cero likes en el momento de la consulta, sin model card detallada sobre licencia, idiomas o contexto, y con una tabla de evaluacion muy corta. Es util como referencia de un flujo automatizado de cuantizacion (autoquant-agent) sobre un modelo base de Qwen, pero no como una alternativa documentada y validada de produccion. La informacion disponible no permite confirmar detalles de arquitectura, contexto ni condiciones de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag `qwen3_5` indica la familia del modelo base; no se detalla en la informacion proporcionada) |
| Parametros totales | 4.577.975.552 (segun indice de safetensors); el nombre del repo indica "9B", discrepancia no aclarada |
| Parametros activos | no aplica segun la informacion disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 en pesos (microscaling de 4 bits, bloques con exponente compartido) y FP8 en cache KV; metodo AutoRound con redondeo RTN |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a la licencia del modelo original, Qwen/Qwen3.5-9B, sin especificarla) |
| Formato de pesos | safetensors con esquema compressed-tensors (tamano del repo: 12,2 GB) |

## Arquitectura y entrenamiento

No hay informacion sobre el entrenamiento del modelo base Qwen/Qwen3.5-9B en los datos proporcionados: se desconoce el numero de tokens, la composicion del dataset y si hubo etapas de RLHF, DPO u otras tecnicas de alineamiento. Lo unico documentado es el proceso de cuantizacion posterior, que no modifica la arquitectura ni los pesos de forma entrenable, sino que aproxima los valores existentes.

En cuanto a la cuantizacion, el esquema MXFP4 pertenece al conjunto de formatos de precision reducida con microscaling: los pesos se agrupan en bloques (tipicamente de 32 elementos) que comparten un factor de escala, y cada elemento se representa con 4 bits en formato coma flotante. El sufijo RTN del nombre indica redondeo al mas cercano (round-to-nearest) y AutoRound aporta un ajuste de los parametros de redondeo mediante descenso de gradiente con signo, en lugar de un redondeo puro. La cache KV se almacena en FP8, lo que reduce a la mitad la memoria de contexto respecto a FP16 en ese componente. El pipeline se describe como "agent-driven quantize + evaluate + self-heal" mediante autoquant-agent. No se documentan innovaciones de decodificacion (especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto y uso conversacional, segun el pipeline declarado (`text-generation`, etiqueta `conversational`).
- Razonamiento aritmetico: el unico dato objetivo es GSM8K con 0,9227 en la evaluacion del autor.
- Conocimiento general y comprension lectora segun MMLU (0,7611), PIQA (0,7775) y HellaSwag (0,5639).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (la model card no lista idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Despliegue en GPUs de gama media para generacion de texto en local: con pesos MXFP4 el modelo ocupa del orden de 2,6 GB si el recuento real es de 4,58B parametros, lo que permite ejecutarlo en tarjetas de 8-12 GB junto con la cache KV en FP8.
- Asistente conversacional con contexto largo: la combinacion de pesos de 4 bits y cache KV en FP8 reduce el coste de memoria por token almacenado, lo que resulta adecuado para sesiones multi-turno extensas, siempre que se confirme la ventana de contexto real del modelo base.
- Generacion de codigo en pipelines de CI/CD: el modelo base pertenece a la familia Qwen, habitualmente usada para tareas de codigo; en este artefacto cuantizado encaja como servicio de bajo coste para revisiones automaticas o generacion de tests, previa validacion de calidad frente al modelo sin cuantizar.
- Clasificacion y extraccion de informacion en lotes grandes: al reducir el peso de memoria, se pueden mantener varias instancias por GPU y procesar volumenes altos de documentos con coste por token bajo.
- Evaluacion comparativa de tecnicas de cuantizacion: este repositorio sirve como punto de referencia para medir la degradacion de MXFP4 + FP8 KV frente al modelo original, usando el mismo arnes de evaluacion.
- Prototipado e investigacion academica con recursos limitados: permite experimentar con un modelo de la familia Qwen3.5 sin acceso a nodos con GPUs de datacenter.
- Inferencia en el borde o en estaciones de trabajo con una sola GPU consumer: util para demos internas y pruebas de concepto que no requieren garantias de servicio.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (no se especifican el numero de ejemplos, el modo few-shot ni la version del arnes de evaluacion):

| Benchmark | Puntuacion |
|---|---|
| GSM8K | 0,9227 |
| MMLU | 0,7611 |
| PIQA | 0,7775 |
| HellaSwag | 0,5639 |

No se han publicado resultados comparativos frente al modelo base Qwen/Qwen3.5-9B sin cuantizar ni frente a otras alternativas en la informacion disponible, por lo que no es posible cuantificar la perdida de calidad introducida por la cuantizacion. Tampoco hay datos de rendimiento (tokens por segundo, latencia, throughput) en el repositorio.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 2,4-2,6 GB si el modelo tiene 4,58B parametros en MXFP4 (4 bits mas escalas); aproximadamente 5 GB si finalmente el modelo corresponde a 9B parametros.
- Memoria adicional: activaciones, buffers y cache KV en FP8. La cache KV escala con la longitud de contexto y el numero de capas, dato no disponible; en la practica puede superar el tamano de los pesos en contextos muy largos.
- Caben en GPU consumer: si el recuento de 4,58B parametros es correcto, el modelo entra en tarjetas de 8 GB (RTX 3060 Ti, RTX 4060, RTX 3070) con contexto moderado, y con holgura en 12-24 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4090).
- GPU recomendadas para produccion: A100 40/80 GB, H100, L40S o A10G; tambien validas GPU consumer de 16-24 GB para inferencia de un solo flujo.
- Opciones de despliegue: vLLM con soporte de compressed-tensors para esquemas MXFP4 es la via mas plausible; transformers con los kernels correspondientes tambien es viable. llama.cpp y Ollama no soportan de forma nativa el formato MXFP4 segun la informacion disponible, por lo que requeririan una conversion previa a GGUF. El soporte exacto de TGI no esta documentado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-MXFP4-FP8KV-CT-RTN-AutoRound | 4.577.975.552 (segun safetensors) | no disponible | MXFP4 + FP8 KV | no disponible | repositorio HuggingFace con 0 descargas |
| Qwen/Qwen3.5-9B (modelo base) | no disponible | no disponible | sin cuantizar | no disponible | modelo base referenciado en el repo |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados de otros modelos comparables en la informacion proporcionada, ni de resultados de benchmarks que permitan una comparacion directa.

## Limitaciones y advertencias

- Discrepancia en el recuento de parametros: el nombre del repositorio indica 9B, pero el indice de safetensors declara 4.577.975.552 parametros (4,58B). Debe verificarse antes de dimensionar infraestructura.
- Inconsistencia interna en los benchmarks: HellaSwag con 0,5639 es muy bajo para un modelo de esta categoria, mientras que MMLU (0,7611) y GSM8K (0,9227) son altos. Esto sugiere un problema de evaluacion (formato de prompt, extraccion de respuestas o subconjunto utilizado) y hace desaconsejable tomar las cifras como referencia fiable.
- Sin validacion frente al modelo base: no hay datos que cuantifiquen la degradacion introducida por MXFP4 y la cache KV en FP8.
- Licencia no especificada: la model card remite a la licencia del modelo original sin indicarla, por lo que el uso comercial queda en un limbo juridico hasta confirmarla en Qwen/Qwen3.5-9B.
- La model card no documenta idiomas, longitud de contexto, ni modo de chat (plantilla de prompt). Es probable que se herede del modelo base, pero no esta confirmado.
- Riesgo de alucinacion: no evaluado en el repositorio; la cuantizacion agresiva a 4 bits puede incrementar la tasa de errores factuales, especialmente en tareas de conocimiento poco frecuente.
- Repositorio sin traccion: 0 descargas y 0 likes, publicado por una cuenta no verificada mediante un pipeline automatizado, sin historial de validacion por terceros.
- Sin informacion sobre sesgos: no hay evaluacion de sesgo, toxicidad ni seguridad.
- Compatibilidad de tooling limitada: los formatos MXFP4 con compressed-tensors no estan soportados por todos los motores de inferencia, lo que puede obligar a reconvertir pesos.
- La cuantizacion de la cache KV a FP8 puede afectar a la precision en contextos muy largos; no hay mediciones al respecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/INCModel3/Qwen3.5-9B-MXFP4-FP8KV-CT-RTN-AutoRound
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- AutoRound (herramienta de cuantizacion, Intel): https://github.com/intel/auto-round
- Paper de AutoRound (Optimize Weight Rounding via Signed Gradient Descent for the Quantization of LLMs): https://arxiv.org/abs/2309.05516
- autoquant-agent: la model card enlaza a https://github.com/ (URL incompleta; no se ha podido resolver el repositorio concreto)
- Nota sobre la busqueda web: los resultados obtenidos no guardan relacion con el modelo (paginas corporativas de Microsoft) y no aportan informacion tecnica utilizable.
