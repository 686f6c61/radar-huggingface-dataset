# roman220220/LFM2.5-2.6B-GGUF-jang-imatrix

## Resumen

Este repositorio no es un modelo entrenado desde cero, sino una conversión cuantizada en formato GGUF de LiquidAI/LFM2.5-2.6B, el modelo de razonamiento "on-device" de 2.600 millones de parámetros desarrollado por Liquid AI. La conversión la publica el usuario roman220220 (IPSupport LLC) y está pensada para su uso en llama.cpp, Ollama y CPU, con un enfoque explícito de asignación de bits no uniforme.

La innovación del repositorio no está en el modelo base, sino en la receta de cuantización: se combina una importance matrix (imatrix) calculada con `llama-imatrix` sobre 200 fragmentos del corpus `calibration_datav3` de bartowski con una asignación mixta de precisión que el autor denomina JANG. Las 8 capas de atención completa y los embeddings comparten `Q8_0`, las proyecciones de entrada y salida de las 22 capas de convolución corta con puerta se mantienen en `Q6_K`, y el feed-forward usa el preset base `Q4_K_M`.

El resultado ocupa 1,87 GB frente a los 5,40 GB del F16, lo que lo hace desplegable en hardware muy modesto (CPU, iGPU, GPUs de gama de entrada) manteniendo, según las mediciones del autor, una perplejidad en wikitext-2 ligeramente mejor que la del propio F16. Es relevante ahora porque la familia LFM2 apuesta por arquitecturas híbridas eficientes para inferencia local, y este tipo de publicaciones muestran hasta dónde se puede comprimir sin degradar el comportamiento conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 30 capas totales, 22 con convoluciones cortas con puerta (gated short convolution) y 8 con atención completa GQA con QK-layernorm |
| Parametros totales | 2.697.198.592 (2,7 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF mixto: `Q8_0` (atención completa y `token_embd`), `Q6_K` (`shortconv.in_proj`/`out_proj`), `Q4_K_M` (feed-forward), F32 sin tocar (kernels de convolución y normas) |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (etiquetada como "other" en HuggingFace), heredada del modelo base LiquidAI/LFM2.5-2.6B |
| Formato de pesos | GGUF (para llama.cpp y Ollama) |
| Modelo base | LiquidAI/LFM2.5-2.6B |
| Tamano del repositorio | 1,9 GB |
| Tamano del archivo cuantizado | 1,87 GB (frente a 5,40 GB en F16 y 5,39 GB en bf16) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido de 2,7 B de parámetros con 30 capas: 22 de ellas usan convoluciones cortas con puerta en lugar de atención, y solo 8 emplean atención completa con GQA y QK-layernorm. Este diseño reduce el coste de atención sobre secuencias largas y es la razón por la que la familia LFM2 está orientada a inferencia en dispositivo. El autor del repositorio no ha entrenado ni ajustado el modelo: la model card remite explícitamente a la del modelo base para el alcance y las limitaciones, que se aplican sin cambios.

Lo que sí describe la model card con detalle es el proceso de cuantización. La importance matrix se calculó con `llama-imatrix` sobre 200 fragmentos de `calibration_datav3.txt` de bartowski (mezcla de código, prosa, datos factuales y contenido multilingüe), ejecutado en una única RTX 4090. Sobre esa imatrix se aplicó la asignación mixta JANG mediante `llama-quantize --tensor-type`, siguiendo la filosofía de "gastar bits donde importan". El autor advierte que esta receta no es GPTQ: la corrección de Hessian de GPTQ está calibrada contra una rejilla de cuantización concreta que no se traslada a la rejilla k-quant de llama.cpp, por lo que la versión GPTQ/MLX de este mismo modelo se publica en un repositorio aparte. El pipeline completo está en el repositorio `rromenskyi/quant-ternary`, en el script `lfm2-quant/poc/lfm2_gguf_pipeline.sh` con `VARIANT=lfm2-2.6b`.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como `conversational` y `text-generation`.
- Modo de razonamiento explícito: siempre razona antes de responder, emitiendo el bloque `<think>…</think>`; la plantilla de chat es la que abre la etiqueta.
- Razonamiento "on-device": el modelo base se describe como un modelo de razonamiento de 2,6 B pensado para ejecución local.
- Integración con llama.cpp y Ollama mediante la plantilla de chat Jinja del modelo, aplicada con `--jinja`.
- Posible soporte de tool calling: la model card menciona "thinking or tool-call tokens" al explicar los riesgos de renderizado en Ollama, pero no documenta de forma explícita un conjunto de herramientas ni un formato de function calling. Se debe tratar como no confirmado.
- Capacidades multilingües: el corpus de calibración incluye contenido multilingüe, pero los idiomas soportados por el modelo no se detallan en la información disponible.
- Capacidades de agente multi-paso: no disponibles en la información proporcionada.

## Casos de uso

- Asistentes conversacionales locales en CPU: con 1,87 GB, el modelo se puede servir desde llama.cpp sin GPU dedicada, lo que encaja en aplicaciones de escritorio que procesan texto en local sin enviar datos a la nube.
- Despliegue en equipos con GPU integrada o de gama de entrada: al ocupar menos de 2 GB en disco y una VRAM muy reducida, permite chat local en portátiles y mini-PC donde un modelo de 7 B cuantizado ya no cabría con comodidad.
- Razonamiento paso a paso sobre consultas cortas: el modo `<think>` lo hace adecuado para tareas de lógica sencilla, clasificación razonada o resolución de preguntas donde se quiera inspeccionar la traza de razonamiento antes de la respuesta final.
- Integración en aplicaciones de escritorio para macOS y Windows: la model card lo vincula a la pila de herramientas locales de IPSupport (LLMTray para chat e imágenes, IPSupport Code para análisis de repositorios), de modo que sirve como backend de un asistente de código o de un chat de escritorio.
- Prototipado y evaluación de recetas de cuantización: el repositorio documenta la receta completa, la imatrix y las mediciones de perplejidad, por lo que es un punto de partida útil para reproducir asignaciones mixtas de bits en otras familias de modelos.
- Servicio expuesto mediante API compatible con OpenAI: LLMTray declara servir una API compatible con OpenAI, de modo que este GGUF puede actuar como backend local de un endpoint de chat.
- Filtrado o resumen de texto en pipelines offline: por su tamaño reducido, se puede ejecutar en lote sobre grandes volúmenes de documentos sin coste de infraestructura de GPU.

## Benchmarks y rendimiento

La model card solo publica mediciones de perplejidad, no resultados de benchmarks de razonamiento o código (MMLU, HumanEval, GSM8K, etc.).

| Medicion | Tamano | Perplejidad (wikitext-2) |
|---|---|---|
| F16 | 5,40 GB | 41,72 ± 1,65 |
| Este modelo, Q4_K_M jang | 1,87 GB | 37,65 ± 1,46 |

Metodología declarada: 40 fragmentos de 512 tokens del conjunto de test de wikitext-2, con `llama-perplexity`, usando la misma cadena de herramientas GGUF en ambos lados. El autor advierte que la cuantización puntúa por debajo del F16, es decir, mejor, pero que los márgenes se solapan y la diferencia es prácticamente nula; además señala que LFM2.5-2.6B es un modelo de chat, por lo que wikitext-2 no es su dominio de entrenamiento y las diferencias pequeñas deben interpretarse como ruido. La model card indica que no se buscó un objetivo de perplejidad concreto, sino que se reporta lo medido.

No se han publicado resultados de benchmarks de razonamiento, código o matemáticas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,9-2,5 GB para los pesos según el runtime; con contexto corto, por debajo de 3 GB en total.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090, etc.).
- Cabe en CPU: sí, es uno de los objetivos explícitos del repositorio; el autor cita CPU y Arc (GPUs Intel) entre los destinos.
- GPU de datacenter: no requiere A100 ni H100; sería infrautilizarlos. La model card menciona una RTX 4090 únicamente para el cálculo de la imatrix.
- Opciones de despliegue: Ollama (con el `Modelfile` incluido, que fija temperatura 0,1, top_k 50 y penalización de repetición 1,1 según la recomendación de Liquid AI) y llama.cpp (`llama-server -m ... -ngl 99 --jinja --port 8080`). También sirve como backend de LLMTray en macOS, aunque para esa plataforma el autor recomienda la variante MLX.
- Latencia y throughput estimados: no disponibles; la model card no publica tokens por segundo ni latencias.
- Aviso de compatibilidad: no se conoce un `RENDERER`/`PARSER` específico de LFM2 en Ollama. El GGUF incluye la plantilla Jinja de LFM2 y las versiones recientes de Ollama la aplican directamente; si los tokens de pensamiento o de tool calling aparecen como texto sin procesar, el autor recomienda usar llama.cpp con `--jinja`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Tamano | Licencia | Notas |
|---|---|---|---|---|---|---|
| roman220220/LFM2.5-2.6B-GGUF-jang-imatrix | 2,7 B | no disponible | GGUF | 1,87 GB | lfm1.0 | imatrix + asignación mixta, PPL wikitext-2 37,65 |
| LiquidAI/LFM2.5-2.6B (base, bf16) | 2,7 B | no disponible | safetensors | 5,39 GB | lfm1.0 | Referencia sin cuantizar; PPL wikitext-2 no publicada en esta información |
| roman220220/LFM2.5-2.6B-gptq-mlx-jang | 2,7 B | no disponible | MLX / GPTQ | no disponible | lfm1.0 | Variante para Apple Silicon vía LLMTray; GPTQ en lugar de k-quant |
| Otros modelos de ~3 B para inferencia local | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos en la información proporcionada |

No se dispone de comparaciones con modelos de otras familias (Qwen, Llama, Gemma de tamaño similar) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor del repositorio: es una conversión cuantizada. IPSupport LLC declara explícitamente que no entrenó el modelo y que no se responsabiliza de su contenido, salidas, comportamiento ni de daños derivados de su uso.
- Riesgo de alucinación: no cuantificado en la información disponible; los modelos de 2,7 B tienen una propensión alta a inventar datos factuales, especialmente en dominios especializados.
- La perplejidad publicada no es un indicador fiable de calidad conversacional: el propio autor señala que wikitext-2 no es el dominio del modelo y que las diferencias observadas son ruido dentro de los márgenes.
- Licencia lfm1.0: es una licencia "other" con nombre propio. No se detallan en la información proporcionada las condiciones exactas de uso comercial, por lo que hay que revisar el archivo LICENSE del repositorio antes de utilizarlo en producción.
- Idiomas soportados: no disponibles. Aunque la imatrix se calculó con un corpus multilingüe, eso no implica que el modelo tenga buen rendimiento en castellano u otros idiomas.
- Longitud de contexto: no disponible en la información proporcionada, lo que impide planificar despliegues con prompts largos o conversaciones multi-turno extensas.
- Compatibilidad de plantilla: si Ollama no aplica correctamente la plantilla Jinja de LFM2, los tokens de pensamiento o de tool calling pueden aparecer como texto plano en la salida. Es un riesgo operativo real que el autor documenta.
- Soporte de herramientas no confirmado: no se documenta un formato de function calling ni una lista de herramientas soportadas.
- Repositorio sin tracción: cero descargas y cero "me gusta" en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- La model card está truncada en la sección de disclaimer, por lo que las condiciones completas de responsabilidad no están disponibles en el material consultado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/roman220220/LFM2.5-2.6B-GGUF-jang-imatrix
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Variante MLX/GPTQ del mismo modelo: https://huggingface.co/roman220220/LFM2.5-2.6B-gptq-mlx-jang
- Pipeline y código de cuantización: https://github.com/rromenskyi/quant-ternary
- LLMTray (aplicación de IA local para macOS de IPSupport): https://www.ipsupport.us/llmtray/
- IPSupport Code: https://ipsupport-llc.github.io/ipsupport-code/
- Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces anteriores provienen íntegramente de la model card y de la información de HuggingFace.
