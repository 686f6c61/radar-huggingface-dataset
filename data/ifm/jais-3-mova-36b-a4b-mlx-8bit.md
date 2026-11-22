# IFM/Jais-3-MoVA-36B-A4B-MLX-8bit

## Resumen

Jais-3-MoVA-36B-A4B es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por el equipo IFM (Inception42), orientado al arabe y al ingles y disenado para cargas de trabajo agenticas. Combina 36B parametros totales con aproximadamente 4B parametros activos por token, e incorpora una innovacion de atencion denominada Mixture-of-Values (MoVA). La version aqui descrita es una cuantizacion 8-bit en formato MLX, pensada para ejecucion en Apple Silicon.

Esta ficha concreta (IFM/Jais-3-MoVA-36B-A4B-MLX-8bit) es una conversion a 8 bits del checkpoint original en PyTorch, con un peso efectivo de 8,5 bits por parametro y 39,8 GB en disco. Utiliza la libreria `mlx-lm` y requiere `--trust-remote-code`, ya que la arquitectura `k2_horizon` que emplea el modelo aun no esta soportada de forma nativa por `mlx-lm` en el momento de la publicacion.

Su relevancia radica en dos factores: por un lado, ofrece una ventana de contexto de 512K tokens con un coste computacional de inferencia propio de un modelo de 4B activos, lo que lo hace atractivo para tareas de contexto largo; por otro, es uno de los pocos modelos abiertos con foco explicito en arabe, un idioma tradicionalmente infrarrepresentado en el ecosistema open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion Mixture-of-Values (MoVA); identificador de arquitectura `k2_horizon` |
| Parametros totales | 37.444.792.020 (36B) |
| Parametros activos | ~4B por token |
| Longitud de contexto | 512K tokens |
| Tipos de cuantizacion | MLX 8-bit (affine integer, group size 64, 8,5 bits/peso efectivos); existen variantes bf16 y 4-bit del mismo modelo |
| Idiomas soportados | Arabe (ar) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX); incluye codigo `k2_horizon.py` en el repo |

## Arquitectura y entrenamiento

El modelo es un transformer de tipo mixture-of-experts con 36B parametros totales y aproximadamente 4B activos por token. Su rasgo arquitectonico distintivo es la atencion Mixture-of-Values (MoVA), que da nombre al modelo y que se combina con capas MoE. La arquitectura se identifica internamente como `k2_horizon`, un identificador que `mlx-lm` no soporta de forma nativa, por lo que el repositorio incluye el codigo de modelo en `k2_horizon.py` y lo carga a traves de la entrada `model_file` del `config.json`.

No se dispone en la informacion proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. La model card del repositorio cuantizado remite a la model card del modelo base original para la descripcion completa de arquitectura y entrenamiento. El paper asociado (arXiv:2611.10224, "Jais 3: Introducing Arabic-centric Agentic AI") es la fuente primaria de estos datos.

La cuantizacion se realizo con cuantizacion afin entera de 8 bits, group size 64, aplicada a todas las capas lineales y a los embeddings. La conversion fue validada contra el codigo PyTorch original en fp32 sobre los pesos reales del modelo, truncado a sus primeras 5 capas, con prompts en ingles, codigo, arabe y matematicas: los logits coinciden con un error relativo de 6e-6 o mejor, las predicciones del siguiente token coinciden en todas las posiciones y la decodificacion greedy con KV cache produce los mismos tokens (64/64 en todos los prompts).

## Capacidades

- Generacion de texto conversacional en arabe e ingles.
- Razonamiento con modo de pensamiento explicito: el modelo razona dentro de las etiquetas `<ifm|think> … </ifm|think>` antes de responder.
- Control del esfuerzo de razonamiento mediante el parametro `reasoning_effort` de la plantilla de chat, con valores `"high"` (por defecto), `"medium"` y `"low"`.
- Soporte de tool calling / function calling (el formato de las llamadas a herramientas existe, aunque `mlx-lm` aun no lo parsea en el servidor).
- Orientacion agentica y a razonamiento multi-paso, segun el enfoque declarado del proyecto Jais 3.
- Capacidades multilingues limitadas a arabe e ingles.
- Capacidad de manejar contextos muy largos (512K tokens).

## Casos de uso

- Atencion al cliente en arabe: el modelo puede gestionar conversaciones multi-turno con historiales extensos gracias a su ventana de 512K tokens, manteniendo coherencia en un idioma con poca oferta de modelos abiertos de calidad.
- Procesamiento de documentos largos en arabe: analisis, resumen y extraccion de informacion de contratos, expedientes o corpus normativos que superan ampliamente el contexto de modelos convencionales.
- Asistentes agenticos con tool calling: integracion en flujos donde el modelo invoca funciones externas (busqueda, calculo, APIs) y encadena varios pasos de razonamiento antes de responder.
- Generacion y revision de codigo bilingue: el modelo fue validado con prompts de codigo y responde en ingles, lo que permite usarlo en tareas de asistencia a la programacion dentro de un entorno MLX en Mac.
- Razonamiento con presupuesto ajustable: en aplicaciones donde la latencia importa se puede fijar `reasoning_effort="low"` para reducir tokens de pensamiento, y subirlo a `"high"` en tareas que requieren precision.
- Despliegue local en Apple Silicon: prototipado y desarrollo en equipos Mac con `mlx_lm.server`, sin depender de GPUs dedicadas ni de servicios en la nube.
- Investigacion en NLP arabe: evaluacion de modelos MoE con atencion MoVA sobre tareas en arabe, con la posibilidad de comparar las variantes bf16, 8-bit y 4-bit.

## Benchmarks y rendimiento

La model card solo publica mediciones para la variante 4-bit; las configuraciones bf16 y 8-bit no pudieron medirse. Los datos disponibles son los siguientes:

| Metrica | bf16 | 8-bit | 4-bit |
|---|---|---|---|
| Bits/peso | 16,0 | 8,5 | 5,6 |
| Tamano en disco | 74,9 GB | 39,8 GB | 26,4 GB |
| Memoria pico | no disponible | no disponible | 26,6 GB |
| Perplejidad WikiText-2 (ingles) | no disponible | no disponible | 10,585 |
| Perplejidad Wikipedia arabe | no disponible | no disponible | 13,143 |
| Velocidad de generacion (Apple M4 Max) | no disponible | no disponible | 67,3 tok/s |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) para esta variante cuantizada.

## Requisitos de hardware

- VRAM/ memoria unificada estimada: el repo ocupa 39,8 GB en disco; en Apple Silicon la memoria unificada debe cubrir los pesos mas el KV cache del contexto utilizado. Con 512K tokens de contexto el KV cache puede ser considerable y no se ha publicado su tamano.
- Hardware objetivo: Apple Silicon (la libreria es `mlx`). La medicion de velocidad de la variante 4-bit se hizo en un Apple M4 Max.
- No esta pensado para GPUs NVIDIA; para ese hardware habria que usar el checkpoint original en PyTorch o sus equivalentes.
- Cabe en equipos Mac con 48 GB o 64 GB de memoria unificada en la variante 8-bit (39,8 GB de pesos), dejando margen limitado para contexto y overhead. La variante 4-bit (26,4 GB) es mas holgada.
- Despliegue: `mlx-lm` (version 0.32.0 probada), con `mlx_lm.generate`, `mlx_lm.chat` y `mlx_lm.server`, siempre con `--trust-remote-code`.
- Latencia y throughput: solo se conoce 67,3 tok/s para la variante 4-bit en M4 Max; para 8-bit no hay dato publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato/plataforma |
|---|---|---|---|---|---|
| Jais-3-MoVA-36B-A4B (esta ficha, MLX 8-bit) | 36B | ~4B | 512K | Apache-2.0 | MLX, Apple Silicon |
| Jais-3-MoVA-36B-A4B (base, PyTorch) | 36B | ~4B | 512K | Apache-2.0 | safetensors, GPU |
| Jais-3-MoVA-36B-A4B-MLX-4bit | 36B | ~4B | 512K | Apache-2.0 | MLX, Apple Silicon |
| Jais-3-MoVA-36B-A4B-MLX-bf16 | 36B | ~4B | 512K | Apache-2.0 | MLX, Apple Silicon |

No se dispone en la informacion proporcionada de datos de rendimiento comparativo frente a modelos de otros desarrolladores de tamano o categoria similares.

## Limitaciones y advertencias

- Idiomas limitados a arabe e ingles; no se declara soporte de castellano ni de otros idiomas.
- El modelo razona antes de responder dentro de `<ifm|think>`; hay que reservar tokens suficientes en `max_tokens` o las respuestas pueden truncarse.
- `mlx-lm` no reconoce aun las etiquetas `<ifm|think>`, por lo que `mlx_lm.server` devuelve el texto de pensamiento dentro de `content` en lugar de en un campo `reasoning` separado.
- El formato de tool calling no se parsea todavia en `mlx_lm.server`.
- La arquitectura `k2_horizon` no esta soportada nativamente por `mlx-lm`; es obligatorio usar `--trust-remote-code`, lo que implica ejecutar codigo del repositorio. Conviene revisar `k2_horizon.py` antes de usarlo.
- La plantilla de chat del repo modifica el comportamiento original: donde la plantilla original lanzaba un error si un mensaje previo del asistente no tenia campo de pensamiento (caso habitual en clientes estilo OpenAI), esta version renderiza un pensamiento vacio.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado evaluaciones especificas de factualidad en la informacion disponible.
- No se han publicado datos de sesgos para esta variante.
- La licencia Apache-2.0 permite uso comercial, pero conviene consultar la model card del modelo base para condiciones y usos previstos.
- Solo se han publicado mediciones de perplejidad y velocidad para la variante 4-bit; el rendimiento de la 8-bit no esta cuantificado.
- El contexto de 512K implica un KV cache grande cuyo consumo de memoria no se ha documentado.

## Enlaces

- Repositorio Hugging Face (esta variante): https://huggingface.co/IFM/Jais-3-MoVA-36B-A4B-MLX-8bit
- Modelo base: https://huggingface.co/IFM/Jais-3-MoVA-36B-A4B
- Variante bf16: https://huggingface.co/IFM/Jais-3-MoVA-36B-A4B-MLX-bf16
- Variante 4-bit: https://huggingface.co/IFM/Jais-3-MoVA-36B-A4B-MLX-4bit
- Paper (arXiv): https://arxiv.org/abs/2611.10224
- Codigo de modelo MLX en el repo: `k2_horizon.py` (incluido en el repositorio de Hugging Face)
