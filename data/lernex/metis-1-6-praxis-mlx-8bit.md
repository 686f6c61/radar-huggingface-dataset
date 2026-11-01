# Lernex/Metis-1.6-Praxis-MLX-8bit

## Resumen

Metis-1.6-Praxis-MLX-8bit es una cuantizacion en 8 bits para Apple Silicon del modelo Metis-1.6-Praxis, desarrollada por Lernex y publicada en formato MLX. El modelo original es un transformer de tipo mixture-of-experts (MoE) latente con 128 expertos y enrutamiento top-4, que incorpora capas Mamba-2, con aproximadamente 3.000 millones de parametros totales y una ventana de contexto de 128.000 tokens. Esta version concreta pesa 3,2 GB y esta pensada para ejecutarse en cualquier Mac con chip de la familia Apple silicon mediante la libreria mlx-lm.

La relevancia de esta ficha radica en que ofrece una cuantizacion de 8 bits que, segun las mediciones del autor, se mantiene practicamente indistinguible de los pesos BF16 originales en terminos de divergencia KL respecto a las logits de referencia en FP32. El autor reporta valores de KL de 0,0020 en chat con razonamiento, 0,0148 en chat con herramientas y 0,0026 en prosa, frente a los 0,0073, 0,014 y 0,0022 del BF16 original, lo que situa al modelo cuantizado dentro del ruido del propio BF16.

El modelo esta orientado a generacion de texto, razonamiento explicito mediante un modo de pensamiento (`<think>`) y conversacion multi-turno. La licencia es Apache 2.0, lo que facilita su uso comercial, y el repositorio incluye la implementacion completa del modelo en un unico fichero (`metis16.py`) que debe cargarse con `trust_remote_code`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts latente con 128 expertos (top-4) y capas Mamba-2, implementacion MLX propia |
| Parametros totales | 2.943.180.111 (~3,0B) |
| Parametros activos | no disponible (top-4 sobre 128 expertos; el autor no publica el numero exacto de parametros activos) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | 8 bits (8,76 bits por peso); existe tambien una version MLX 4-bit, GGUF y FP8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 3,2 GB en el repositorio |

## Arquitectura y entrenamiento

La arquitectura combina un esquema de mixture-of-experts latente con 128 expertos y enrutamiento top-4 junto con capas de estado espacio-temporal Mamba-2. La implementacion concreta vive en el fichero `metis16.py` que acompania al repositorio y que mlx-lm ejecuta en lugar de una implementacion nativa mientras no se integre Metis-1.6 en la libreria. El modelo incluye componentes especificos como proyecciones de salida Mamba-2, routers de expertos, adaptadores de atencion por pasada, memoria de profundidad y una cabeza de profundidad, que el autor mantiene sin cuantizar por su sensibilidad.

En cuanto al entrenamiento, la informacion proporcionada no detalla el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El autor solo indica que la evaluacion de calidad se realizo contra las logits en FP32 del runtime de entrenamiento nativo sobre un conjunto de prompts de referencia (un chat de razonamiento de 16 tokens, un chat con herramientas de 176 tokens y 300 tokens de prosa), midiendo la divergencia KL media sobre los 20 tokens mas probables. La receta de cuantizacion se define en `Model.quant_predicate` dentro de `metis16.py`: todas las capas lineales van a 8 bits en grupos de 64, salvo las proyecciones de salida Mamba-2, los routers, los adaptadores de atencion, la memoria de profundidad y la cabeza de profundidad, que quedan sin cuantizar; ademas, el sesgo de balance de los routers y los parametros `A`, `D` y `dt_bias` de la SSM se mantienen en FP32.

## Capacidades

- Generacion de texto conversacional multi-turno con ventana de contexto de 128.000 tokens.
- Razonamiento explicito en modo thinking: el modelo razona dentro de etiquetas `<think>` antes de responder; se puede desactivar con `enable_thinking=False` para obtener respuestas directas.
- Razonamiento matematico y resolucion de problemas, segun el ejemplo de la model card (calculo de 17 x 23).
- Soporte de tool calling / function calling: en mlx-lm las llamadas a herramientas llegan como texto en la respuesta hasta que la libreria incorpore el parser especifico del modelo, momento a partir del cual llegaran como `tool_calls` tipados.
- Despliegue como servidor con endpoint compatible con la API de OpenAI mediante `mlx_lm.server`, con `chat_template_kwargs` para controlar `enable_thinking` por peticion.
- Separacion del razonamiento y la respuesta final en versiones de mlx-lm posteriores a la 0.32.2 (el razonamiento llega en el campo `reasoning`).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede mantener conversaciones multi-turno con hasta 128.000 tokens de contexto, lo que permite adjuntar documentos extensos o historiales largos sin truncar, todo ejecutandose en local sobre Apple silicon.
- Razonamiento paso a paso en entornos de escritorio: con `enable_thinking=True` el modelo expone su cadena de razonamiento en `<think>`, util para depuracion de problemas matematicos o logicos y para auditar como llega a una conclusion.
- Automatizacion de tareas con herramientas: mediante `mlx_lm.server` y el endpoint compatible con OpenAI, se puede integrar en flujos que requieran function calling, teniendo en cuenta que las llamadas llegan como texto hasta que mlx-lm incorpore el parser del modelo.
- Prototipado rapido de agentes en local: al caber en 3,2 GB y ejecutarse en cualquier Mac con Apple silicon, sirve para iterar sobre disenos de agentes y prompts sin depender de APIs externas ni de GPUs dedicadas.
- Generacion y edicion de prosa: el autor reporta una divergencia KL de 0,0026 en prosa respecto al BF16, lo que indica que la cuantizacion preserva bien la calidad en tareas de escritura y redaccion.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye metricas de KL frente a FP32 para 8 bits y 4 bits, lo que lo convierte en un banco de pruebas util para estudiar el impacto de la cuantizacion en arquitecturas MoE hibridas con Mamba-2.
- Despliegue en portatiles sin GPU dedicada: al estar empaquetado en MLX y pesar 3,2 GB, permite servir un modelo de 3.000 millones de parametros con contexto largo en equipos de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente publica metricas de fidelidad de cuantizacion: divergencia KL media sobre los 20 tokens mas probables frente a las logits FP32 del runtime de entrenamiento nativo.

| Pesos | Chat con razonamiento | Chat con herramientas | Prosa |
|---|---|---|---|
| MLX 8-bit (este repositorio) | 0,0020 | 0,0148 | 0,0026 |
| MLX 4-bit | 0,0165 | 0,0814 | 0,0121 |
| BF16 original (referencia) | 0,0073 | 0,014 | 0,0022 |

## Requisitos de hardware

- VRAM / memoria unificada estimada: 3,2 GB de pesos en 8 bits, mas overhead de contexto y cache KV; con 128.000 tokens de contexto el consumo de memoria crece de forma significativa y depende del prompt.
- Hardware objetivo: cualquier Mac con Apple silicon (familia M1, M2, M3, M4 y posteriores), segun indica el autor.
- GPU dedicadas: no aplica, al ser un formato MLX para Apple silicon; para CUDA existen las versiones GGUF (llama.cpp, Ollama, LM Studio) y FP8 (vLLM, SGLang) del mismo modelo.
- Cabe en GPU de consumo: si, en el ecosistema Apple silicon; para GPUs NVIDIA se deberia usar la version GGUF o FP8.
- Opciones de despliegue: `mlx_lm.chat`, `mlx_lm.generate` y `mlx_lm.server` (endpoint compatible con OpenAI), siempre con `--trust-remote-code`.
- Parametros de muestreo recomendados por el autor: temperatura 1,0, top-p 0,95 y top-k 20 para modo thinking; temperatura 0,3 para respuestas directas. La CLI de mlx-lm no dispone de penalizacion por repeticion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| Metis-1.6-Praxis-MLX-8bit (este) | ~3,0B (MoE 128 expertos, top-4) | 128k | MLX, Apple silicon | Apache 2.0 | Cuantizacion 8 bits con KL cercana a BF16 |
| Metis-1.6-Praxis (BF16) | ~3,0B | 128k | Transformers | Apache 2.0 | Modelo base sin cuantizar |
| Metis-1.6-Praxis-MLX-4bit | ~3,0B | 128k | MLX, Apple silicon | Apache 2.0 | Menor peso, mayor divergencia KL (hasta 0,0814 en herramientas) |
| Metis-1.6-Praxis-GGUF | ~3,0B | 128k | llama.cpp, Ollama, LM Studio | Apache 2.0 | Para CPU y GPUs no Apple |
| Metis-1.6-Praxis-FP8 | ~3,0B | 128k | vLLM, SGLang | Apache 2.0 | Para despliegue en GPU con servidores de inferencia |

No se dispone de informacion sobre modelos de terceros comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- Requiere `--trust-remote-code`: el repositorio incluye la implementacion completa del modelo en `metis16.py`, que se ejecuta en lugar de una implementacion nativa de mlx-lm. El propio autor recomienda revisar ese fichero antes de confiar en el.
- Compatibilidad con mlx-lm: las versiones 0.32.2 y anteriores no reconocen los marcadores de razonamiento del modelo, por lo que arrancan en modo directo salvo que se pase `enable_thinking` explicitamente, y dejan el razonamiento dentro de la respuesta.
- Tool calling incompleto en mlx-lm: hasta que la libreria incorpore el parser especifico, las llamadas a herramientas llegan como texto plano en la respuesta, no como `tool_calls` tipados, lo que complica su integracion automatica.
- Sin penalizacion por repeticion en la CLI de mlx-lm: el autor advierte de esta carencia y recomienda ajustar temperatura, top-p y top-k en su lugar.
- Idiomas soportados: no disponibles; no se puede confirmar el comportamiento multilingue del modelo.
- Sesgos y alucinaciones: no se documentan sesgos conocidos ni tasas de alucinacion en la informacion proporcionada; como todo modelo generativo, existe riesgo de alucinacion, especialmente en modo thinking con contextos largos.
- Contexto de 128.000 tokens: aunque la ventana es amplia, el consumo de memoria unificada crece con el contexto y puede limitar la ejecucion en Macs con poca RAM.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y de cualquier dependencia de mlx-lm.
- Ecosistema limitado: al ser un formato MLX, no es directamente portable a CUDA; para otros entornos hay que recurrir a las variantes GGUF o FP8.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Lernex/Metis-1.6-Praxis-MLX-8bit
- Modelo base BF16: https://huggingface.co/Lernex/Metis-1.6-Praxis
- Version MLX 4-bit: https://huggingface.co/Lernex/Metis-1.6-Praxis-MLX-4bit
- Version GGUF (llama.cpp, Ollama, LM Studio): https://huggingface.co/Lernex/Metis-1.6-Praxis-GGUF
- Version FP8 (vLLM, SGLang): https://huggingface.co/Lernex/Metis-1.6-Praxis-FP8
