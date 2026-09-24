# adepadua/localllm-coder-7b

## Resumen

localllm-coder-7b es un ajuste fino (QLoRA) del modelo Qwen2.5-Coder-7B-Instruct, publicado por el usuario adepadua dentro del proyecto localllm de Substanze. Su objetivo no es mejorar las capacidades de código del modelo base, sino imponer un estilo de respuesta concreto en castellano: explicaciones en español claro, código e identificadores en inglés, y una estructura fija de "Plan → Implementación → Pruebas → Notas" en tareas grandes. Está pensado como asistente de programación local, sin dependencia de la nube.

Se trata de un modelo denso de 7.615.616.512 parámetros (unos 7,6 B), con arquitectura transformer decoder-only heredada de Qwen2.5, distribuido en formato GGUF y con licencia Apache-2.0 heredada del modelo base. El repositorio ocupa 4,7 GB, lo que corresponde a una cuantización de 4 bits (la model card menciona Q4_K_M). El ajuste es deliberadamente ligero: aproximadamente 80 ejemplos de programación "senior" en español, destilados y curados a mano, entrenados en una única RTX 4060.

Su relevancia actual es acotada pero clara: sirve como ejemplo reproducible de personalización de un coder open source de 7 B en hardware de consumo (8 GB de VRAM) y como asistente local orientado a equipos hispanohablantes que quieran respuestas en español sin enviar código a servicios externos. No es un modelo competitivo en benchmarks frente a su base, y no hay evaluación publicada que respalde mejoras de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (heredada del modelo base; detalles de capas y atencion no especificados en la model card) |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen2.5-Coder-7B-Instruct declara 32.768 tokens nativos (ampliables con YaRN) |
| Tipos de cuantizacion | GGUF; la model card referencia Q4_K_M (no se listan otras cuantizaciones) |
| Idiomas soportados | Español (objetivo del ajuste) e inglés (código e identificadores). El modelo base declara capacidad multilingue y soporte de decenas de lenguajes de programacion |
| Licencia | Apache-2.0 (heredada de Qwen; el ajuste es de Substanze) |
| Formato de pesos | GGUF (repo de 4,7 GB). No se publican safetensors del ajuste |
| Tamano del repositorio | 4,7 GB |
| Modelo base | Qwen/Qwen2.5-Coder-7B-Instruct |
| Fecha de creacion | 23 de septiembre de 2026 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de la familia Qwen2, con 7,6 B de parametros densos. El ajuste se realizo con QLoRA de rango 16 sobre el modelo base cargado en 4 bits, es decir, Low-Rank Adaptation sobre pesos cuantizados, congelando el modelo original e insertando adaptadores de bajo rango. El entrenamiento se ejecuto en local sobre una unica NVIDIA RTX 4060, sin infraestructura en la nube.

El dataset es el elemento mas singular y tambien el mas limitado: aproximadamente 80 ejemplos de programacion de nivel senior en español, combinando destilacion y curacion manual. Con ese volumen, el ajuste no pretende ensenar nuevas capacidades de codigo, sino fijar un formato de respuesta y un registro linguistico. No se documentan fases de RLHF o DPO posteriores, ni composicion detallada del dataset, ni numero de tokens de entrenamiento, ni hiperparametros mas alla del rango de LoRA. Tampoco se declara ninguna innovacion tecnica en decodificacion o atencion: es un fine-tune de estilo sobre un modelo ya existente.

## Capacidades

- Generacion de codigo en multiples lenguajes de programacion, heredada de Qwen2.5-Coder-7B-Instruct, con codigo e identificadores en ingles.
- Explicaciones tecnicas en español claro, que es el objetivo explicito del ajuste.
- Estructura de respuesta fija en tareas grandes: Plan → Implementacion → Pruebas → Notas.
- Razonamiento multi-paso aplicado a tareas de programacion (planificacion antes de escribir codigo).
- Conversacion multi-turno, ya que el modelo base es una variante Instruct y el modelo esta etiquetado como "conversational".
- Compatibilidad con tool calling / function calling y con plantillas de chat tipo Jinja, segun las capacidades declaradas del modelo base y el uso de `--jinja` en llama.cpp.
- Uso de agentes y flujos multi-paso: posible por herencia del modelo base, aunque no hay evaluacion especifica del ajuste en este terreno.
- Capacidades multilingues: el ajuste se centra en español e ingles; el resto de idiomas depende del modelo base y puede haberse degradado.
- Capacidad especial: ninguna declarada (no hay modo thinking, vision ni audio).
- No se documentan capacidades de vision, audio ni decodificacion especulativa en este ajuste.

## Casos de uso

- Asistente de programacion local en español: el modelo responde con explicaciones en castellano y codigo en ingles, lo que encaja en equipos hispanohablantes que trabajan con bases de codigo en ingles. Se ejecuta con llama.cpp u Ollama sin enviar codigo a terceros.
- Entornos con restricciones de confidencialidad: al ser un GGUF de 4,7 GB ejecutable en una GPU de consumo, permite desplegar asistencia de codigo en maquinas aisladas o air-gapped donde no se autoriza el uso de APIs externas.
- Generacion de documentacion tecnica en español: a partir de un fragmento de codigo, el modelo puede producir explicaciones y comentarios en castellano manteniendo nombres de funciones y variables en ingles.
- Revision y explicacion de codigo heredado: el formato Plan → Implementacion → Pruebas → Notas ayuda a estructurar respuestas largas al analizar un modulo y proponer cambios.
- Generacion de pruebas unitarias: el bloque "Pruebas" del formato de respuesta esta pensado para que el modelo proponga casos de test junto a la implementacion, integrable en un flujo de desarrollo con revision humana.
- Integracion en pipelines de CI/CD como revisor automatico: con tool calling heredado del modelo base, puede conectarse a scripts que analicen diffs y generen comentarios en español en las pull requests.
- Soporte a desarrolladores junior: explicaciones paso a paso en español sobre errores de compilacion, trazas o fragmentos de codigo, con coste marginal cero por consulta al ejecutarse en local.
- Prototipado rapido de utilidades internas: generacion de scripts pequenos y funciones auxiliares donde la latencia de una API externa o la politica de datos impide otro enfoque.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna evaluacion (ni HumanEval, ni MMLU, ni GSM8K, ni metricas de calidad de codigo) y tampoco se documenta una comparacion con el modelo base. Dado que el dataset de ajuste tiene aproximadamente 80 ejemplos, no existe evidencia publicada de que el ajuste mejore las capacidades del modelo base en tareas de codigo.

## Requisitos de hardware

- VRAM estimada en funcion de la cuantizacion, para un modelo denso de 7,6 B: Q4_K_M en torno a 4,4-4,7 GB de pesos, que con cache KV y contexto moderado se traduce en unos 5-6 GB de VRAM; Q8_0 alrededor de 8,1 GB de pesos; FP16 en torno a 15,2 GB.
- GPU recomendadas: para Q4_K_M, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070; para FP16 o contexto muy largo, A100 40 GB, H100 o RTX 4090 24 GB.
- Cabe en GPU de consumo: si. En Q4_K_M entra en tarjetas de 8 GB (RTX 4060, RTX 3070) aunque con contexto reducido; es comodo a partir de 12 GB. El propio autor entreno el ajuste en una RTX 4060.
- Opciones de despliegue: llama.cpp con `llama-server -m localllm-coder-7b-Q4_K_M.gguf --jinja`, Ollama mediante un Modelfile con `FROM ./localllm-coder-7b-Q4_K_M.gguf`, y la aplicacion localllm de Substanze con `localllm pull adepadua/localllm-coder-7b`. No se publican pesos en safetensors, por lo que vLLM o TGI requeririan una conversion previa del GGUF.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Evaluacion publicada |
|---|---|---|---|---|---|
| localllm-coder-7b | 7,6 B densos | No publicado (base: 32.768) | Apache-2.0 | GGUF | No disponible |
| Qwen2.5-Coder-7B-Instruct | 7,6 B densos | 32.768 nativos | Apache-2.0 | safetensors, GGUF | Si, en su model card (no reproducida aqui) |
| CodeLlama-7B-Instruct | ~6,7 B densos | 16.384 | Llama 2 Community License | safetensors, GGUF | Si, en su model card |
| DeepSeek-Coder-V2-Lite-Instruct | 15,7 B totales / 2,4 B activos (MoE) | 128.000 | Licencia propia de DeepSeek | safetensors, GGUF | Si, en su model card |

Frente a su propio modelo base, la unica diferencia documentada es el estilo de respuesta en español y el formato Plan → Implementacion → Pruebas → Notas; no hay datos que indiquen mejoras de rendimiento, y el ajuste con ~80 ejemplos puede degradar capacidades del original. Frente a CodeLlama-7B-Instruct, el modelo parte de una base mas moderna en codigo, pero carece de evaluacion que lo demuestre. Frente a DeepSeek-Coder-V2-Lite-Instruct, queda por debajo en contexto disponible (asumiendo los 32.768 del base) y en eficiencia de inferencia por su naturaleza densa.

## Limitaciones y advertencias

- Dataset de ajuste de aproximadamente 80 ejemplos: el riesgo de sobreajuste al formato y de olvido catastrofico de capacidades del modelo base es alto. Es esperable una degradacion en tareas generales y en idiomas distintos del español y el ingles.
- Sin evaluacion publicada: no hay benchmarks, ni comparaciones con el modelo base, ni mediciones de regresion. Cualquier uso en produccion deberia ir precedido de una evaluacion propia.
- Riesgo de alucinacion: inherente a los modelos de 7 B, especialmente en APIs, librerias y firmas de funciones. El ajuste no incorpora ningun mecanismo de verificacion.
- Idiomas: el ajuste esta orientado a español e ingles. El comportamiento en otros idiomas no esta documentado y probablemente sea peor que el del modelo base.
- Contexto: la model card no declara longitud de contexto para el ajuste. Si se usa la ventana de 32.768 tokens del base sin verificacion, conviene comprobar el comportamiento real con contextos largos.
- Licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, con atribucion al modelo base Qwen y al ajuste de Substanze. Al heredar del modelo base, se aplican tambien las condiciones de Qwen.
- Reproducibilidad limitada: no se publican hiperparametros completos, semilla, composicion del dataset ni pesos en safetensors, solo el GGUF resultante.
- Sesgos: no hay informacion sobre sesgos evaluados en el ajuste ni en el modelo base dentro del material disponible.
- Produccion: la combinacion de 7 B de parametros, dataset minimo y ausencia de benchmarks lo hace adecuado para prototipos, uso personal y entornos controlados, no para tareas criticas sin supervision humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/adepadua/localllm-coder-7b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Proyecto localllm (Substanze): https://substanze.ai
- Informe tecnico de Qwen2.5-Coder (modelo base): https://arxiv.org/abs/2409.12186
- llama.cpp (runtime recomendado, soporte GGUF y `--jinja`): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- Nota sobre la busqueda web: los resultados devueltos no guardan relacion con el modelo (traductores genericos y diccionarios), por lo que no se han incluido como fuentes.
