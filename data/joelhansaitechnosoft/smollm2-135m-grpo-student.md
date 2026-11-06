# joelhansaitechnosoft/smollm2-135m-grpo-student

## Resumen

SmolLM2-135M-GRPO-Student es un modelo de generacion de texto de 134,5 millones de parametros publicado por el usuario joelhansaitechnosoft en Hugging Face. Se trata de un modelo "estudiante" obtenido por destilacion a partir de HuggingFaceTB/SmolLM2-135M-Instruct, aplicando una arquitectura en dos fases inspirada en DeepSeek-R1: un calentamiento inicial mediante SFT (cold-start) y un posterior ajuste con Group Relative Policy Optimization (GRPO). El objetivo declarado es dotar a un modelo muy pequeno de capacidades de razonamiento encadenado (chain-of-thought) y de generacion estructurada que su modelo base no posee de forma fiable.

El modelo se distribuye en formato Float16 sin cuantizar (safetensors) y tambien como GGUF de 16 bits, lo que facilita su despliegue tanto en transformers como en llama.cpp, Ollama o LM Studio. Su tamano reducido permite ejecutarlo en hardware muy modesto, incluso en CPU, lo que lo hace interesante para experimentacion con tecnicas de RL aplicadas a modelos diminutos y para prototipado de pipelines de razonamiento y salida estructurada.

La relevancia actual del modelo es mas metodologica que de rendimiento bruto: demuestra un flujo de destilacion de razonamiento sobre un modelo de 0,1B parametros con licencia Apache 2.0. No obstante, la informacion publica es escasa (sin card detallada de datos de entrenamiento, idiomas o benchmarks estandar), y las metricas reportadas por el autor se limitan a un conjunto de evaluacion propio y no verificable de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM2-135M-Instruct) |
| Parametros totales | 134.515.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | Float16 sin cuantizar (safetensors) y GGUF de 16 bits; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Float16) y GGUF (F16) |

## Arquitectura y entrenamiento

El modelo parte de SmolLM2-135M-Instruct, un transformer decoder-only de 134,5 millones de parametros, y se somete a un proceso de destilacion de razonamiento en dos etapas segun la descripcion del autor: primero un ajuste supervisado (SFT) de calentamiento con datos de cold-start, y despues un entrenamiento con GRPO (Group Relative Policy Optimization), un algoritmo de optimizacion por politica con recompensas relativas dentro de grupos de respuestas, popularizado en el contexto de modelos de razonamiento tipo DeepSeek-R1.

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, la mezcla de idiomas ni los detalles del reward model o de las funciones de recompensa empleadas en GRPO. Tampoco se documentan innovaciones adicionales como decodificacion especulativa o mecanismos de atencion alternativos. El enfasis del autor esta en el formato de salida (delimitadores de razonamiento, validez de JSON, sintaxis de codigo) mas que en mejoras de arquitectura.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base instruct.
- Razonamiento encadenado (chain-of-thought) mediante delimitadores de formato, segun la evaluacion del autor.
- Generacion de codigo con validez sintactica (medida mediante analisis AST en el benchmark del autor).
- Generacion de JSON estructurado y valido segun esquema (metrica de validez de esquema JSON).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado de forma explicita mas alla del CoT.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponibles; el "modo razonamiento" se limita al formato CoT descrito.

## Casos de uso

- Prototipado de pipelines de razonamiento en local: el modelo cabe en cualquier equipo y permite experimentar con salidas CoT y formato delimitado sin coste de GPU, util para validar disenos de prompts antes de escalar a modelos mayores.
- Generacion de JSON estructurado en entornos con recursos limitados: su metrica de validez de esquema JSON (75% en el benchmark del autor) lo hace apto para tareas de extraccion simple donde se pueda validar y reintentar la salida.
- Educacion e investigacion sobre RL: sirve como banco de pruebas reproducible para estudiar el efecto de GRPO y del SFT de calentamiento sobre un modelo de 0,1B parametros con licencia permisiva.
- Clasificacion y etiquetado ligero por lotes: al ejecutarse en CPU, puede procesar grandes volumenes de texto corto en tareas de etiquetado o reformateo sin infraestructura GPU.
- Filtrado y formateo de codigo en herramientas de desarrollo: la validez sintactica reportada permite usarlo como generador de fragmentos de codigo simples o como reformateador en scripts de CI, siempre con validacion posterior.
- Demos y aplicaciones embebidas: su tamano (1,1 GB en el repositorio, pesos F16) permite integrarlo en aplicaciones de escritorio o entornos con poca memoria mediante llama.cpp u Ollama.
- Evaluacion de tecnicas de destilacion: util como caso de estudio de destilacion de razonamiento desde un modelo base pequeno, comparando el estudiante con el original.

## Benchmarks y rendimiento

Los unicos datos disponibles son los reportados por el autor en su benchmark interno (held-out), sin comparacion con modelos de referencia externos:

| Metrica | Resultado | Baseline (SmolLM2-135M-Instruct) | Ganancia |
|---|---|---|---|
| Puntuacion compuesta global | 85,0% | 44,4% | +40,6% |
| Sintaxis AST de codigo | 100,0% | 50,0% | +50,0% |
| Delimitadores de formato | 75,0% | 12,5% | +62,5% |
| Validez de esquema JSON | 75,0% | 50,0% | +25,0% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las cifras anteriores proceden exclusivamente del benchmark propio del autor y no han sido verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: en Float16, aproximadamente 0,27 GB solo para pesos (134,5M parametros x 2 bytes), mas overhead de activaciones y KV cache; en la practica cabe en cualquier GPU con 1-2 GB libres.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1060 6 GB, RTX 3060, RTX 4090) es mas que suficiente; tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente todas, incluidas iGPU y sistemas embebidos con memoria suficiente.
- Opciones de despliegue: transformers (safetensors), llama.cpp, Ollama y LM Studio mediante el GGUF F16; compatible con text-generation-inference segun los tags del repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano, se espera inferencia en tiempo real incluso en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| smollm2-135m-grpo-student | 134,5M | no disponible | Apache 2.0 | Destilado con GRPO; metricas solo internas |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135M | 8.192 tokens (segun documentacion publica del modelo base) | Apache 2.0 | Modelo base; sin entrenamiento de razonamiento |
| SmolLM2-360M-Instruct | 362M | 8.192 tokens (segun documentacion publica) | Apache 2.0 | Alternativa mayor de la misma familia, mas capacidad general |

No se dispone de datos de benchmarks comparables entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo tiene solo 134,5M parametros: la capacidad de razonamiento real es muy limitada pese a las metricas del autor, y las ganancias se miden sobre un benchmark propio no verificado.
- Riesgo elevado de alucinacion y de errores factuales, especialmente en tareas de conocimiento o matematicas fuera de plantilla.
- Las metricas de formato (75% en delimitadores y JSON) implican que una de cada cuatro salidas puede no cumplir el formato esperado; es imprescindible validar y reintentar en produccion.
- No se documentan idiomas soportados; se desconoce el comportamiento en castellano y la calidad multilingue.
- No se especifica la longitud de contexto efectiva del modelo destilado; asumir la del modelo base puede no ser correcto tras el ajuste con GRPO.
- No hay informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo se publica sin likes ni traccion comunitaria (0 likes, ~550 descargas en el momento de la consulta).
- El repositorio tiene un unico autor sin historial verificable de publicaciones; conviene tratar las afirmaciones de la model card con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joelhansaitechnosoft/smollm2-135m-grpo-student
- Perfil del autor: https://huggingface.co/joelhansaitechnosoft
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
