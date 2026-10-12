# scottlowry/Ornith-1.5-9B-oQ4e-mtp

## Resumen

Ornith-1.5-9B-oQ4e-mtp es un checkpoint cuantizado a 4 bits del modelo Ornith-1.5-9B, publicado por el usuario scottlowry en HuggingFace. La model card indica que la cuantizacion se ha realizado con oQ (oMLX v0.7.1.dev1), una herramienta de cuantizacion de precision mixta, y que el tipo de modelo base es `qwen3_5`, lo que apunta a un transformer denso de la familia Qwen3.5. El repo pesa 6,2 GB y el recuento real de parametros en los ficheros safetensors es de 9.653.104.368 (aproximadamente 9,65 mil millones).

Se trata de una publicacion con cero descargas y cero likes en el momento de la consulta, creada y actualizada el 11 de octubre de 2026, y no declara licencia ni idiomas soportados. Esto la situa como un artefacto de distribucion reciente, orientado especificamente a ejecucion local mediante MLX, la libreria de Apple para inferencia en silicio de la serie M. No se trata por tanto de un modelo nuevo entrenado desde cero, sino de una conversion/cuantizacion de pesos pensada para reducir el consumo de memoria sin salir del ecosistema Apple.

Su relevancia practica es acotada pero concreta: permite ejecutar un modelo de ~9,65 B parametros en formato de 4 bits sobre hardware Apple Silicon con memoria unificada, lo que baja el umbral de VRAM respecto al checkpoint en precision completa. La ausencia de model card detallada, de licencia declarada y de benchmarks publicados limita cualquier evaluacion de calidad; a dia de hoy solo se pueden verificar los datos de formato y cuantizacion, no el rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; la model card indica `model_type: qwen3_5` |
| Parametros totales | 9.653.104.368 (≈9,65 B), dato real de los safetensors |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits, group size 64, cuantizacion mixta oQ (oMLX v0.7.1.dev1) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (no declarada en la model card) |
| Formato de pesos | MLX safetensors |
| Tamano del repositorio | 6,2 GB |
| Libreria | mlx |
| Fecha de creacion | 2026-10-11 |
| Ultima actualizacion | 2026-10-11 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna mas alla del campo `model_type: qwen3_5` de la model card y de la etiqueta `qwen3_5` en los tags de HuggingFace. No se especifica si se trata de un transformer denso convencional, de una variante con atencion lineal, de un modelo hibrido o de una arquitectura con mezcla de expertos. Tampoco se documenta el numero de capas, la dimension oculta, el numero de cabezas de atencion ni el mecanismo de atencion empleado.

Respecto al entrenamiento, no hay ningun dato en la informacion proporcionada: no se indica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de ajuste fino supervisado, RLHF o DPO. El sufijo `mtp` del nombre del repositorio no aparece explicado en la model card, por lo que se desconoce a que hace referencia exactamente.

La unica innovacion tecnica documentada es el proceso de cuantizacion: oQ (oMLX v0.7.1.dev1) aplica cuantizacion de precision mixta a 4 bits con group size 64, y el resultado se serializa en safetensors con el formato propio de MLX. La precision mixta implica que distintas capas o tensores pueden conservar una precision distinta, aunque la model card no detalla la asignacion por capa.

## Capacidades

- No se documenta ninguna capacidad especifica en la informacion disponible.
- Generacion de texto: no confirmada explicitamente en la model card; el pipeline aparece como "no disponible".
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Modo de inferencia: al ser un checkpoint MLX, la ejecucion esperada es mediante `mlx-lm` o herramientas compatibles con MLX; no hay soporte documentado para otros runtimes.

## Casos de uso

- Inferencia local en portatiles y equipos Apple Silicon: el checkpoint esta cuantizado a 4 bits con group size 64 y pesa 6,2 GB en disco, lo que permite cargarlo en Macs con memoria unificada de 16 GB o superior sin necesidad de GPU dedicada.
- Prototipado rapido de aplicaciones de generacion de texto: al ser un modelo de ~9,65 B en formato MLX, se puede levantar un servidor local con `mlx-lm` para iterar sobre prompts y evaluar el comportamiento del modelo base antes de comprometerse con una version mas costosa.
- Pruebas de cuantizacion y evaluacion de calidad: util para comparar la degradacion introducida por oQ a 4 bits frente al checkpoint sin cuantizar, midiendo perplejidad o calidad de generacion sobre un conjunto de validacion propio.
- Despliegue en entornos sin conectividad: al ser un artefacto local de 6,2 GB, encaja en escenarios de inferencia offline donde no se puede llamar a una API externa por motivos de privacidad o de red.
- Fine-tuning ligero sobre MLX: el formato MLX safetensors permite emplear utilidades de ajuste de MLX (`mlx-lm.lora`) para adaptar el modelo a un dominio concreto en hardware Apple, siempre que la licencia del modelo base lo permita (dato no disponible en este momento).
- Benchmarking comparativo de cuantizaciones: sirve como punto de referencia dentro de una bateria de pruebas que compare 4 bits oQ, 4 bits uniforme y 8 bits sobre la misma tarea y el mismo hardware.
- Integracion en herramientas de escritorio para macOS: al depender de MLX, se puede empaquetar en aplicaciones nativas de Mac que necesiten generacion de texto sin depender de CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y tampoco se aportan mediciones de latencia o throughput.

## Requisitos de hardware

- Peso teorico de los pesos en 4 bits: 9.653.104.368 parametros x 0,5 bytes ≈ 4,83 GB. El repositorio ocupa 6,2 GB, cifra que incluye metadatos y posibles ficheros auxiliares.
- VRAM/memoria unificada estimada para inferencia: entre 6 y 9 GB en funcion de la longitud de contexto y del tamano de la cache KV. No hay mediciones publicadas por el autor.
- Hardware objetivo: Apple Silicon (series M1, M2, M3 y M4) con memoria unificada, ya que el formato es MLX safetensors y la libreria declarada es `mlx`. En un Mac con 16 GB de memoria unificada deberia caber con margen; con 8 GB el margen es muy estrecho.
- GPU dedicadas (A100, H100, RTX 4090 y similares): no hay soporte documentado de MLX para CUDA, por lo que estos pesos no se pueden cargar directamente en GPU NVIDIA sin una conversion previa a otro formato.
- Opciones de despliegue: `mlx-lm` y el propio ecosistema oMLX. No hay evidencia de compatibilidad con vLLM, llama.cpp, Ollama o TGI en el estado actual del repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas del modelo base, por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-9B-oQ4e-mtp | 9,65 B | No disponible | 4 bits, group size 64 (oQ) | No disponible | MLX safetensors |
| Modelo base Ornith-1.5-9B | No disponible | No disponible | Sin cuantizar (presumiblemente) | No disponible | No disponible en la informacion facilitada |
| Alternativas de ~9-10 B en 4 bits | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No se declara licencia en la model card. Sin licencia explicita no se puede asumir permiso para uso comercial; conviene contactar con el autor o consultar la licencia del modelo base antes de cualquier despliegue en produccion.
- El modelo base es de tipo `qwen3_5`, pero no se documenta que licencia arrastra esa familia; la ausencia de esta informacion es un riesgo legal y operativo.
- Repositorio con cero descargas y cero likes: no hay evidencia de uso en la comunidad, ni validacion independiente de la calidad de la cuantizacion.
- No hay benchmarks publicados, por lo que se desconoce la degradacion de calidad introducida por la cuantizacion a 4 bits con group size 64 frente al modelo sin cuantizar.
- La model card no documenta idiomas soportados, longitud de contexto ni sesgos conocidos del modelo base. Cualquier afirmacion sobre estos puntos seria especulativa.
- Riesgo de alucinacion: inherente a los modelos de lenguaje generativos; no hay evaluaciones de fidelidad factual disponibles para este checkpoint.
- Compatibilidad restringida: al estar en formato MLX safetensors, no se puede usar directamente con vLLM, llama.cpp, Ollama o TGI. Requiere Apple Silicon o una conversion previa a otro formato.
- La fecha de publicacion (11 de octubre de 2026) y la ausencia de actividad posterior impiden verificar si el repositorio se mantiene o si el autor ha publicado correcciones.
- El sufijo `mtp` del nombre no esta explicado en la documentacion; si implica alguna modificacion estructural respecto al modelo base, no se puede confirmar ni descartar a partir de la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/scottlowry/Ornith-1.5-9B-oQ4e-mtp
- Repositorio de oQ / oMLX (herramienta de cuantizacion citada en la model card): https://github.com/jundot/omlx
