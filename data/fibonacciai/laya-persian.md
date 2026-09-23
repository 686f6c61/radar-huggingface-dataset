# fibonacciai/laya-persian

## Resumen

Laya Persian (fibonacciai/laya-persian) es la variante optimizada para persa del modelo de decisiones Laya, compilada a partir de convaiinnovations/laya-multilingual (mmBERT-base, 322M). No es un modelo generativo: no produce tokens de forma autorregresiva, sino que, dada una *state* (un texto de entrada) y un conjunto de preguntas tipadas (`choice`/`score`/`noul`), devuelve probabilidades calibradas en una única pasada de encoder. Se distribuye en formato GGUF generado por la herramienta ggmlc, no por llama.cpp.

El modelo pertenece a la familia Laya, la reproduccion abierta del sistema TypeSafe Jev. Su proposito es resolver tareas de decision estructurada (triage de correo, enrutado de tickets, scoring de riesgo) sin generar texto, lo que reduce coste y latencia frente a un LLM autoregresivo. La variante persa anade ajuste fino con datos adicionales de persa para mejorar la tokenizacion del alfabeto arabe-persa, la precision de decision y la transferencia entre idiomas.

Es relevante ahora porque cubre un nicho poco atendido (decisiones tipadas en persa) sobre una arquitectura de encoder ligera (323.182.091 parametros) que cabe en hardware muy modesto. La ficha del autor indica que el checkpoint en ingles tiende a colapsar fuera del ingles, de ahi la utilidad de esta familia multilingue para texto no ingles o mixto. La licencia es Apache 2.0 y el compilador ggmlc es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer tipo BERT (mmBERT-base); no autorregresiva, de una sola pasada |
| Parametros totales | 323.182.091 |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | F16, Q8_0, UD_Q4_K_M |
| Idiomas soportados | Multilingue (mas de 100 idiomas segun el modelo base) y persa (fa) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF generado por ggmlc (no compatible con llama.cpp) |

## Arquitectura y entrenamiento

La base es mmBERT-base, un encoder transformer de 322M parametros con contexto de 1024 tokens. Laya hereda de ahi una arquitectura densa sin generacion de tokens: ante una *state* y preguntas tipadas, el modelo puntua opciones (`choice`), asigna puntuaciones (`score`) o etiqueta (`noul`) en un unico paso de encoder. Este diseno es el que la model card describe como "System 1 decision model", la reproduccion abierta de TypeSafe Jev.

Esta variante persa se ha ajustado fino con datos adicionales de persa para mejorar la eficiencia de tokenizacion del alfabeto persa, aumentar la precision de decision sobre estados en persa, reforzar la transferencia interlingue y mantener probabilidades calibradas en texto persa. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas como RLHF o DPO: esos datos no estan disponibles. El tokenizador es Gemma BPE + Metaspace (`▁`) con especiales `<bos>/<eos>/<pad>/<mask>` (ids 2/1/0/4), no el `[CLS]/[SEP]/[MASK]` de ModernBERT.

## Capacidades

- Decision tipada no autorregresiva: puntuacion de `choice`, `score` y `noul` en una sola pasada de encoder, con salida de probabilidades calibradas en lugar de texto generado.
- Triage de correo electronico mediante presets (`--preset email`).
- Enrutado y clasificacion de tickets (`--preset triage`).
- Scoring de riesgo y decisiones automatizadas.
- Soporte multilingue segun el modelo base (mas de 100 idiomas) con optimizacion especifica para persa.
- Deteccion de idioma previa al forward (`laya detect-lang`) y enrutado entre checkpoints ingles y multilingue con `--models-dir`.
- Servicio local mediante `laya serve` (Decision Studio en `GET /` y `POST /api/decide`) y modo `daemon` con JSON-RPC por stdin/stdout.
- Aceleracion por dispositivo `auto` (CUDA o Metal si estan presentes, si no CPU) y opcion `--cuda-graph`.
- Salida en JSON con `--json`.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision ni function calling.

## Casos de uso

- Triage de correo de soporte en persa: con `--preset email` el modelo clasifica mensajes como el ejemplo de la model card ("dos veces me han cobrado la tarifa") y devuelve probabilidades calibradas por categoria, sin generar respuestas.
- Enrutado de tickets a departamentos: `--preset triage` con salida `--json` permite integrar la decision en un sistema de ticketing y asignar colas automaticamente segun el texto persa.
- Scoring de riesgo en decisiones automatizadas: la salida calibrada se puede usar como umbral de aprobacion/revision en flujos donde se necesita una probabilidad, no una frase generada.
- Moderacion y filtrado de contenido en persa: puntuacion de estados textuales para decidir si un contenido requiere revision humana.
- Preprocesado en pipelines de atencion al cliente: al devolver probabilidades en una sola pasada, encaja como etapa rapida antes de un LLM generativo solo para los casos que lo requieran.
- Despliegue local de bajo coste: con 345 MB en Q8_0 cabe en CPU o en GPU de gama baja, lo que permite ejecutar decisiones en el borde o en entornos sin GPU.
- Integracion via API en un servicio propio: `laya serve` expone `POST /api/decide` para llamar al modelo desde microservicios en produccion.
- Clasificacion multilingue con routing: mantener los GGUF ingles y multilingue en un directorio y dejar que `laya decide --models-dir` elija segun el idioma detectado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas numericas de MMLU, HumanEval, GSM8K ni de tareas de decision en persa.

## Requisitos de hardware

- VRAM estimada: muy baja por el tamano del modelo. F16 ~633 MB, Q8_0 ~345 MB, UD_Q4_K_M ~500 MB (este ultimo es mayor que Q8_0 porque los embeddings se mantienen en F16).
- GPU recomendadas: cualquier GPU con al menos ~1 GB de memoria libre; el binario `laya` selecciona CUDA o Metal con `--device auto` y usa CPU si no hay acelerador.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna e incluso en CPU. No requiere A100 ni H100.
- Opciones de despliegue: binario `laya` (descargable desde las releases de ggmlc), `laya serve` para servicio HTTP con Decision Studio y `POST /api/decide`, y `laya daemon` para JSON-RPC por stdin/stdout. No es compatible con llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: no disponibles. La arquitectura de una sola pasada de encoder sugiere latencias bajas frente a un modelo autoregresivo, pero no se aportan medidas. Existe el comando `laya bench --preset email` para medir en local.
- Opcion `--cuda-graph` disponible para reducir overhead de lanzamiento de kernels en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fibonacciai/laya-persian | 323.182.091 | 1024 | Encoder de decision (Laya), optimizado para persa | Apache 2.0 | GGUF via ggmlc |
| convaiinnovations/laya-multilingual | 322M (mmBERT-base) | 1024 | Encoder de decision (modelo base) | Apache 2.0 | Pesos originales (upstream) |
| Checkpoint Laya en ingles (laya-GGUF) | no disponible | no disponible | Encoder de decision, ingles | Apache 2.0 | GGUF via ggmlc |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto ni respuestas redactadas; solo devuelve decisiones y probabilidades.
- Los GGUF no son compatibles con llama.cpp, `llama-cli`, Ollama, vLLM ni TGI. Cargarlos con esas herramientas fallara; requieren el binario `laya` de ggmlc.
- El contexto esta limitado a 1024 tokens, adecuado para estados cortos pero no para documentos largos.
- La model card advierte que el checkpoint en ingles "colapsa" fuera del ingles; esta variante persa existe precisamente para mitigarlo, pero el alcance exacto por idioma no esta cuantificado.
- No hay datos publicados de sesgos, tasas de alucinacion ni evaluacion de calibracion en persa.
- El repositorio registra 0 descargas y 0 likes, y los archivos se crearon y actualizaron en septiembre de 2026: es un artefacto reciente y sin validacion externa conocida.
- La model card proporcionada tiene formato de plantilla generada ("Here is a new README.md for your..."), por lo que conviene verificar los detalles de uso directamente en el repositorio.
- Utilizar el binario `laya`: su compilador ggmlc es MIT, distinto de la licencia Apache 2.0 de los pesos.
- Aunque la licencia Apache 2.0 permite uso comercial, no se documentan garantias de calidad ni soporte para produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fibonacciai/laya-persian
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Proyecto Laya (reproduccion abierta de Jev): https://github.com/NandhaKishorM/laya
- Compilador ggmlc: https://github.com/monatis/ggmlc
- Ejemplos de Laya en ggmlc: https://github.com/monatis/ggmlc/tree/main/examples/laya
- Binarios de ggmlc (releases): https://github.com/monatis/ggmlc/releases/latest
- Familia Laya en ingles: https://huggingface.co/mys/laya-GGUF
- Familia Laya de decisiones tipadas: https://huggingface.co/mys/laya-typed-decisions-GGUF
- Organizacion del autor: https://huggingface.co/fibonacciai

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces anteriores proceden de la informacion de HuggingFace y de la model card.
