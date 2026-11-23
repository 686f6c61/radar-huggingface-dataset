# andrevp/Qwen3.8-27B-EXL3-3.5bpw-heretic

## Resumen

Qwen3.8-27B-EXL3-3.5bpw-heretic es una variante "abliterated" del modelo cuantizado Mia-AiLab/Qwen3.8-27B-EXL3-3.5bpw, publicada por el usuario andrevp. La modificacion se ha realizado con la herramienta Heretic 2.0.0.dev0 directamente sobre los pesos EXL3 cuantizados a 3.5 bits por peso, sin recuantizar ni fusionar tensores: la ablacion se almacena en un fichero sidecar de 2,9 MB que se aplica en tiempo de inferencia sobre las proyecciones de salida. El objetivo es eliminar los rechazos del modelo original ante peticiones consideradas daninas, manteniendo practicamente intacta la calidad del modelo de partida.

El modelo hereda la arquitectura del Qwen3.8-27B original, que combina atencion clasica con capas Gated DeltaNet (un modelo hibrido con estado recurrente), segun se deduce de las proyecciones `out_proj` de Gated DeltaNet mencionadas en la model card. Los pesos reales en safetensors suman 7.669.052.656 parametros, muy por debajo de los 27B que sugiere el nombre, lo que apunta a que el identificador comercial no refleja el numero efectivo de parametros del checkpoint publicado.

La relevancia de esta ficha es doble: por un lado, documenta una tecnica de abliteracion que preserva bit a bit los pesos cuantizados originales y permite activar o desactivar la modificacion en caliente; por otro, advierte de que se trata de un modelo sin filtros de seguridad, con implicaciones legales y eticas importantes para cualquier despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion y capas Gated DeltaNet (familia Qwen3.5, tag `qwen3_5`) |
| Parametros totales | 7.669.052.656 (segun safetensors del repo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de uso configura `max_num_tokens = 32768`) |
| Tipos de cuantizacion | EXL3 a 3.5 bits por peso (bpw); no se ofrecen otras variantes en este repo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (EXL3, libreria exllamav3) + sidecar `abliteration.safetensors` (2,9 MB) y `abliteration_directions.safetensors` (forma 65x5120) |

## Arquitectura y entrenamiento

El modelo base es un transformer hibrido de la familia Qwen3.5 que intercala atencion con capas Gated DeltaNet, un mecanismo de estado recurrente lineal. La abliteracion actua sobre las tres proyecciones que escriben en el flujo residual: `o_proj` de atencion, `out_proj` de Gated DeltaNet y `down_proj` del MLP, en total 100 proyecciones modificadas. La transformacion aplicada es una proyeccion de rango uno con normalizacion de filas preservada: `W' = diag(n/m) · (I − λ v vᵀ) · Wn`, que se traduce en una operacion por salida `W'x = y ⊙ s − b · ⟨y, a⟩` con los vectores `a`, `b` y `s` precalculados a partir de los pesos EXL3 desquantizados.

El proceso de busqueda se realizo con Heretic 2.0.0.dev0 (commit 3521f86) mediante un backend personalizado que ejecutaba cada forward pass sobre el propio modelo EXL3 con exllamav3, de modo que las direcciones de rechazo, la divergencia KL y las tasas de rechazo se midieron exactamente sobre el modelo que se despliega. Las direcciones se obtuvieron como diferencia media de residuales por capa entre 400 prompts daninos (mlabonne/harmful_behaviors) y 400 inocuos (mlabonne/harmless_alpaca), ortogonalizadas contra la media de los inocuos. Se optimizaron los objetivos con 200 trials de Optuna TPE (60 de arranque aleatorio, semilla 1337) mas 5 configuraciones de un barrido manual; el trial seleccionado (198) logro 4/100 rechazos frente a 96/100 de la linea base, con KL de 0,021. El objetivo de ablacion se centro en el modo thinking, ya que una ablacion solo para modo no-thinking dejaba un 65% de rechazos duros con el razonamiento activado.

## Capacidades

- Generacion de texto conversacional y continuacion de contexto largo, con modo thinking (bloque `<think>`) segun la plantilla de chat del modelo base.
- Razonamiento multi-paso en el bloque de pensamiento, con capacidad de decidir rechazar o no dentro del propio razonamiento.
- Generacion de codigo y matematicas: los benchmarks reportados incluyen GSM8K (95,6%) y MMLU (80,9%) en modo zero-shot, lo que indica competencia en razonamiento aritmetico y conocimiento general.
- Soporte de decodificacion especulativa: el wrapper de ablacion es compatible con los borradores DFlash2 y MTP.
- Compatibilidad con rutas de decodificacion fused y graph de exllamav3.
- Capacidad de activar y desactivar la abliteracion en caliente (`exl3_ablation.apply` / `exl3_ablation.remove`), recuperando el modelo original bit a bit.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente: no disponible en la informacion proporcionada.
- Vision o audio: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite comparar en un mismo proceso las respuestas del modelo original y del abliterated con pesos identicos, aislando el efecto de la ablacion sobre la tasa de rechazos y la calidad (PPL, MMLU, GSM8K).
- Evaluacion de robustez de filtros: util para probar clasificadores de contenido o guardrails externos, ya que el modelo por si mismo no rechaza peticiones y obliga a que la capa de seguridad sea independiente.
- Generacion creativa sin restricciones editoriales: escritura de ficcion con tematicas sensibles (violencia, terror, drama) donde los rechazos del modelo base interrumpen la continuidad narrativa.
- Despliegue en local con exllamav3 y TabbyAPI: el modelo cabe en una GPU de consumo de 24 GB gracias a la cuantizacion EXL3 a 3.5 bpw y al sidecar de 2,9 MB, con un coste de decodificacion del 1-2% adicional.
- Analisis de sesgos y discurso danino en entornos controlados: al eliminar los rechazos, permite obtener muestras del comportamiento del modelo ante prompts adversarios para estudiarlo sin que la negativa enmascare la respuesta.
- Prototipado rapido de asistentes conversacionales con contexto de hasta 32.768 tokens (configuracion de ejemplo), usando la decodificacion especulativa para reducir latencia.
- Benchmarking de tecnicas de cuantizacion: sirve como caso de estudio de cuantizacion EXL3 a 3.5 bpw con preservacion de pesos y aplicacion de transformaciones en tiempo de inferencia.

## Benchmarks y rendimiento

Los datos proceden de la model card y comparan el modelo original con la version heretic, con decodificacion greedy y las mismas condiciones de carga.

| Metrica | Original | Heretic |
|---|---|---|
| wikitext-2 PPL (81.840 tokens, ventanas de 1024) | 7,179 | 7,190 (+0,15%) |
| KL por token (original ‖ heretic), media | 0 | 0,0044 |
| Acuerdo top-1 de token | 100% | 96,9% |
| MMLU (1000 preguntas, zero-shot, logits de letra) | 81,7% | 80,9% |
| GSM8K (primeras 250 preguntas, greedy, sin thinking) | 96,0% | 95,6% |
| Rechazos duros, JailbreakBench-100, sin thinking | 94% | 0% |
| Rechazos duros, JailbreakBench-100, con thinking | 97,5% | 0% |
| Cualquier palabra clave de rechazo, JailbreakBench-100, sin thinking | 97% | 46% |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 15,4 GB, por lo que se necesita aproximadamente 16 GB de VRAM para cargar los pesos, mas el espacio de cache KV. Con contexto de 32.768 tokens conviene reservar 20-24 GB en total.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40/80 GB, H100 80 GB para mayor contexto y throughput. En GPUs de 16 GB (RTX 4080, A4000) puede caber con contexto reducido.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB con margen para cache; en 16 GB con contexto limitado.
- Opciones de despliegue: exllamav3 (libreria nativa del modelo), TabbyAPI (requiere aplicar `exl3_ablation.apply` tras la carga o usar una build que lea el sidecar de forma nativa). No es compatible con llama.cpp, Ollama ni TGI, ya que el formato EXL3 es especifico de exllamav3.
- Latencia y throughput: no disponibles de forma absoluta. El autor reporta un coste del 1-2% en velocidad de decodificacion por las 100 operaciones fusionadas por forward pass. La decodificacion especulativa con borradores DFlash2/MTP es compatible y puede reducir la latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-EXL3-3.5bpw-heretic | 7,67 B (safetensors) | no disponible | EXL3 3.5 bpw | Apache 2.0 | Abliterated, sidecar aplicable en caliente |
| Mia-AiLab/Qwen3.8-27B-EXL3-3.5bpw | 7,67 B (safetensors) | no disponible | EXL3 3.5 bpw | Apache 2.0 | Modelo base sin ablacion; rechazos duros del 94-97,5% |
| Qwen3.8-27B (original bf16) | no disponible | no disponible | bf16 | no disponible | Referencia de calidad completa; requiere mucho mas VRAM |

No se dispone de datos de benchmarks de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo sin filtros de seguridad: la tasa de rechazos duros baja del 94-97,5% al 0% en JailbreakBench. Puede generar contenido danino, ilegal o eticamente problematico sin restriccion.
- La ablacion se optimizo para el modo thinking; el 46% de respuestas en modo no-thinking siguen conteniendo alguna palabra clave de rechazo, aunque no sean rechazos duros.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; el modelo base presenta un MMLU del 80,9%, con la degradacion habitual de un modelo cuantizado a 3,5 bpw.
- La cuantizacion EXL3 a 3,5 bpw implica una perdida de calidad respecto al modelo en bf16, no medida en esta ficha.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento multilingue fuera del ingles y el chino sin evaluacion adicional.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede infringir normativas locales (por ejemplo, en la UE) y las condiciones de uso de la plataforma de despliegue.
- El formato EXL3 limita el despliegue a exllamav3 y TabbyAPI; no hay soporte para llama.cpp, Ollama ni TGI.
- El sidecar de ablacion debe aplicarse explicitamente en TabbyAPI; sin esa linea, el servidor sirve el modelo original sin avisar.
- El nombre "27B" del identificador no coincide con los 7.669.052.656 parametros del safetensors; conviene verificar el checkpoint antes de dimensionar hardware.
- El autor del repo (andrevp) no es el desarrollador del modelo base; la trazabilidad de la ablacion depende de la documentacion publicada y del commit de Heretic indicado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/andrevp/Qwen3.8-27B-EXL3-3.5bpw-heretic
- Modelo base: https://huggingface.co/Mia-AiLab/Qwen3.8-27B-EXL3-3.5bpw
- Heretic (herramienta de abliteracion): https://github.com/p-e-w/heretic
- Conjunto de prompts daninos: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Conjunto de prompts inocuos: https://huggingface.co/datasets/mlabonne/harmless_alpaca
- Libreria exllamav3: no disponible en la informacion proporcionada
- TabbyAPI: no disponible en la informacion proporcionada
