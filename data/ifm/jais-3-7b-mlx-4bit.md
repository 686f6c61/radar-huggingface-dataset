# IFM/Jais-3-7B-MLX-4bit

## Resumen

Jais-3-7B-MLX-4bit es una cuantizacion de 4 bits en formato MLX del modelo Jais-3-7B, desarrollado por el equipo IFM (Inception42). Jais-3 es una familia de modelos centrados en arabe, y esta variante concreta es un modelo denso decoder-only de aproximadamente 9.000 millones de parametros (8.999.178.240 segun los pesos en safetensors) con una ventana de contexto de 512K tokens (524.288). Resuelve el problema de ejecutar un modelo arabe-ingles de contexto muy largo en hardware Apple Silicon, donde MLX es el runtime nativo.

La relevancia de esta version es practica: el autor ha aplicado una receta de cuantizacion mixta (4 bits en las capas MLP, 8 bits en atencion, embeddings y `lm_head`) que resulta en 6,4 bits por peso efectivos y 7,2 GB en disco, con una perdida de perplejidad de solo +4,2% en WikiText-2 y +4,6% en Wikipedia arabe frente al modelo en bf16. Una cuantizacion uniforme a 4 bits habria perdido +15,1% y +17,1% respectivamente, segun el autor.

El modelo base incorpora un modo de razonamiento explicito (bloques `<ifm|think>`) con niveles de esfuerzo configurables, lo que lo situa en la categoria de modelos con capacidad de razonamiento antes de responder. La licencia es Apache-2.0, heredada del modelo base, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, arquitectura `k2_horizon` |
| Parametros totales | 8.999.178.240 (~9B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 524.288 tokens (512K) |
| Tipos de cuantizacion | 4-bit mixta: MLP a 4 bits (group size 32), atencion/embeddings/lm_head a 8 bits (group size 64); 6,4 bits/peso efectivos |
| Idiomas soportados | arabe (ar), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), 7,2 GB en disco |

## Arquitectura y entrenamiento

El modelo base Jais-3-7B es un transformer decoder-only denso de la familia Jais-3, identificado internamente con la arquitectura `k2_horizon`. Segun la model card, se trata de un modelo "medium dense" con ventana de contexto de 512K tokens. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica destacable de esta version es el proceso de cuantizacion y el soporte de runtime. Dado que `mlx-lm` aun no soporta la arquitectura `k2_horizon`, el repositorio incluye el codigo del modelo en MLX (`k2_horizon.py`), que se carga mediante la entrada `model_file` de `config.json` y requiere `--trust-remote-code`. El autor verifico la conversion contra el codigo PyTorch original en fp32 sobre los pesos reales, con un error relativo en logits de 6e-6 o inferior, coincidencia en la prediccion del siguiente token en todas las posiciones y decodificacion greedy identica (64/64 tokens en todas las pruebas). Tambien se modifico la plantilla de chat para que no falle cuando un mensaje previo del asistente carece de campo de pensamiento, renderizando un bloque de pensamiento vacio en su lugar.

## Capacidades

- Generacion de texto y conversacion multi-turno en arabe e ingles.
- Razonamiento explicito mediante bloques `<ifm|think>`, con niveles de esfuerzo configurables (`high` por defecto, `medium`, `low`) a traves del parametro `reasoning_effort` de la plantilla de chat.
- Capacidad de razonamiento matematico y generacion de codigo (verificado en las pruebas de conversion sobre prompts de codigo y matematicas).
- Soporte de tool calling / function calling: la model card menciona que existe un formato de llamada a herramientas, aunque `mlx-lm` aun no lo parsea.
- Contexto muy largo de 512K tokens, adecuado para documentos extensos o conversaciones prolongadas.
- Capacidades agenticas: el paper de Jais 3 se titula "Introducing Arabic-centric Agentic AI", lo que indica orientacion a flujos de agentes.
- Capacidad multilingue limitada a arabe e ingles.

## Casos de uso

- Atencion al cliente en arabe: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 512K tokens de ventana, manteniendo el historial completo de la sesion sin truncar. El modo de razonamiento permite respuestas mas meditadas en consultas complejas.
- Analisis de documentos legales o administrativos arabes: con 512K tokens de contexto se puede introducir un contrato o expediente completo y pedir resumenes, extraccion de clausulas o comparaciones entre secciones.
- Generacion de codigo asistida en entornos Apple Silicon: al ejecutarse nativamente en MLX sobre Mac, permite un asistente de codigo local sin envio de datos a la nube, util para equipos con requisitos de privacidad.
- Procesamiento de corpus arabes a gran escala: la perplejidad medida en Wikipedia arabe (+4,6% frente a bf16) indica que la cuantizacion preserva calidad suficiente para tareas de clasificacion, etiquetado o resumen sobre texto arabe.
- Prototipado de agentes arabe-ingles: el soporte de tool calling y el modo de razonamiento permiten construir flujos multi-paso (consulta de APIs, calculo, sintesis) en local sobre un Mac.
- Investigacion en eficiencia de cuantizacion: el repositorio documenta de forma detallada la receta mixta y sus efectos en perplejidad, lo que lo convierte en una referencia util para estudiar el impacto de la cuantizacion selectiva por tipo de capa.
- Despliegue de bajo coste en estaciones de trabajo Mac: con 7,4 GB de memoria pico para prompts cortos, cabe en Mac con 16 GB de RAM unificada, lo que permite ofrecer un servicio de generacion de texto arabe sin GPU dedicada.

## Benchmarks y rendimiento

Datos publicados por el autor para las tres variantes MLX de Jais-3-7B. Perplejidad sobre 128 x 512 tokens (WikiText-2 test y primeros articulos del dump de Wikipedia arabe `20231101.ar`); velocidad de generacion medida en un Apple M4 Max.

| Metrica | bf16 | 8-bit | 4-bit (esta version) |
|---|---|---|---|
| Bits/peso | 16,0 | 8,5 | 6,4 |
| Disco | 18,0 GB | 9,6 GB | 7,2 GB |
| Memoria pico | 18,2 GB | 9,8 GB | 7,4 GB |
| Perplejidad WikiText-2 (ingles) | 12,829 | 12,858 (+0,2%) | 13,372 (+4,2%) |
| Perplejidad Wikipedia arabe | 17,332 | 17,350 (+0,1%) | 18,129 (+4,6%) |
| Generacion | 28,5 tok/s | 52,7 tok/s | 70,4 tok/s |

No se han publicado en la informacion disponible resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) para este modelo.

## Requisitos de hardware

- VRAM/memoria unificada: 7,4 GB de pico para prompts cortos. La cache KV crece con el contexto, por lo que contextos largos requieren mas memoria; se puede limitar con `--max-kv-size` y cuantizar la cache KV con `--kv-bits 8` donde este disponible.
- Hardware objetivo: Apple Silicon exclusivamente, ya que el formato es MLX. Probado en Apple M4 Max.
- Cabe en Mac consumer con 16 GB de memoria unificada o superior para prompts cortos; para contextos largos se recomienda 32 GB o mas.
- No es compatible con GPU NVIDIA ni con runtimes CUDA (vLLM, TGI, llama.cpp, Ollama no soportan MLX).
- Despliegue mediante `mlx-lm` (version 0.32.0 probada por el autor) con `--trust-remote-code`; disponible `mlx_lm.generate`, `mlx_lm.chat` y `mlx_lm.server`.
- Rendimiento medido: 70,4 tok/s de generacion en Apple M4 Max con esta cuantizacion de 4 bits.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Memoria pico | Licencia | Runtime |
|---|---|---|---|---|---|---|
| Jais-3-7B-MLX-4bit (esta version) | ~9B | 512K | 4-bit mixta (6,4 bits/peso) | 7,4 GB | Apache-2.0 | MLX |
| Jais-3-7B-MLX-8bit | ~9B | 512K | 8-bit (8,5 bits/peso) | 9,8 GB | Apache-2.0 | MLX |
| Jais-3-7B-MLX-bf16 | ~9B | 512K | bf16 | 18,2 GB | Apache-2.0 | MLX |
| Jais-3-7B (base, PyTorch) | ~9B | 512K | bf16 | no disponible | Apache-2.0 | PyTorch |

La comparativa mas directa es con las otras dos variantes MLX del mismo modelo, ya que no se dispone en la informacion proporcionada de datos sobre modelos alternativos de tamano y enfoque similares (centrados en arabe) para comparar parametros, contexto y rendimiento.

## Limitaciones y advertencias

- Idiomas limitados a arabe e ingles; no se declara soporte de castellano ni de otros idiomas.
- La cuantizacion introduce una perdida de calidad medible: +4,2% de perplejidad en ingles y +4,6% en arabe frente a bf16. El autor advierte que la perplejidad es una senal gruesa y recomienda probar cada variante en la carga de trabajo real.
- `mlx-lm` no reconoce las etiquetas `<ifm|think>`, por lo que `mlx_lm.server` devuelve el texto de razonamiento dentro del campo `content` en lugar de un campo `reasoning` separado. El formato de tool calling tampoco se parsea todavia.
- Requiere `--trust-remote-code` porque el codigo del modelo se distribuye en el repositorio; el autor recomienda revisar `k2_horizon.py` antes de ejecutarlo.
- La plantilla de chat original fallaba con mensajes previos del asistente sin campo de pensamiento; esta version la modifica para renderizar un pensamiento vacio. Cualquier cliente que dependa del comportamiento original debe tenerlo en cuenta.
- Riesgo de alucinacion: no se documenta en la informacion disponible ninguna evaluacion especifica de tasas de alucinacion.
- Sesgos conocidos: no se documentan en la informacion disponible.
- El uso de contexto muy largo incrementa el consumo de memoria por la cache KV; sin `--max-kv-size` o cuantizacion de cache, los 512K tokens pueden no caber en equipos con poca memoria.
- Licencia Apache-2.0 permite uso comercial, pero se remite a la model card del modelo base para la declaracion completa de uso previsto y limitaciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IFM/Jais-3-7B-MLX-4bit
- Modelo base: https://huggingface.co/IFM/Jais-3-7B
- Variante bf16: https://huggingface.co/IFM/Jais-3-7B-MLX-bf16
- Variante 8-bit: https://huggingface.co/IFM/Jais-3-7B-MLX-8bit
- Paper (arXiv): 2611.10224 — "Jais 3: Introducing Arabic-centric Agentic AI"
- Licencia: https://huggingface.co/IFM/Jais-3-7B
