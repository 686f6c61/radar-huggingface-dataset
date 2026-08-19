# cebeuq/DeepSeek-V4-Flash-0731-abliterated

## Resumen

DeepSeek-V4-Flash-0731-abliterated es un overlay del modelo de razonamiento y codificación agéntica DeepSeek-V4-Flash-0731, desarrollado por el usuario cebeuq. El objetivo es eliminar el comportamiento de rechazo (refusal) del modelo base mediante la técnica de abliteración, que consiste en proyectar fuera de los pesos las direcciones de activación asociadas a respuestas de negativa. El resultado es un modelo que atiende prácticamente cualquier petición, manteniendo intactas las capacidades de codificación, tool calling y recuperación de contexto largo.

Se trata de una arquitectura MoE (mixture of experts) de 305.7 mil millones de parámetros totales según los safetensors (la model card declara 284B), con 13B activos por token, 256 expertos enrutados (top-6) más un experto compartido, atención híbrida CSA + HCA con Lightning Indexer, hiperconexiones mHC y un cabezal de decodificación especulativa DSpark de tres etapas. El contexto nativo es de 1.048.576 tokens, aunque la configuración de referencia lo sirve a 262.144. La precisión es FP4 para los expertos enrutados y FP8 e4m3 para el resto, sin ningún paso de cuantización adicional: es la precisión nativa del checkpoint base.

La relevancia de este modelo reside en que es un overlay quirúrgico: solo 92 de los 72.317 tensores (0,13 %) difieren del release original de DeepSeek, y los 72.225 restantes son byte-idénticos y verificables por sha256. Esto lo convierte en una herramienta útil para investigación en alineamiento, red teaming y estudio de comportamientos de rechazo, sin sacrificar el rendimiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepSeek-V4 MoE, 43 capas, hidden 4096, 256 expertos (top-6) + 1 compartido, atencion hibrida CSA + HCA con Lightning Indexer, hiperconexiones mHC (hc_mult=4), cabezal DSpark de 3 etapas |
| Parametros totales | 305.723.922.366 (segun safetensors; la model card declara 284B) |
| Parametros activos | 13B |
| Longitud de contexto | 1.048.576 nativo (servido a 262.144 en la configuracion de referencia) |
| Tipos de cuantizacion | FP4 (E2M1 + ue8m0) en expertos enrutados, FP8 e4m3 (escalas de bloque 128x128) en el resto; sin cuantizacion adicional, precision nativa del checkpoint base |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (48 shards + overlay de 1,54 GB) |

## Arquitectura y entrenamiento

El modelo no es un reentrenamiento ni un fine-tuning convencional: es un overlay construido mediante abliteración sobre el checkpoint DeepSeek-V4-Flash-0731. El proceso consistió en capturar direcciones de rechazo mediante hooks forward sobre las 43 proyecciones de salida de atención (`attn.wo_b`) de un despliegue vLLM en TP=2, usando 256 prompts dañinos de AdvBench y 256 prompts inofensivos de Alpaca, en los tres modos de razonamiento del modelo (chat, think-high y think-max). Las direcciones resultantes, con una estabilidad mediana split-half de 0,9863 y AUC mediana held-out de 0,9976, se fusionaron y aplicaron como una proyección ortogonal de rango 1 con lambda = 2,5, en float64, directamente sobre los pesos FP8 e4m3.

La re-cuantización tras la proyección mantiene los exponentes de bloque originales, de modo que todo elemento que la proyección no movió se re-codifica a su byte original idéntico. El overflow se resuelve con clamping (6.877 de 94.208 bloques desbordaron; 7.821 de 1.540 millones de elementos fueron clampados; el overshoot máximo fue de 1,186x). Los tres estadios del cabezal DSpark heredan la dirección más profunda del backbone para evitar que un drafter sin editar proponga tokens de rechazo que el verificador editado rechace. El tamaño medio relativo de la edición es 0,0587. El pipeline completo es numpy + safetensors, sin torch, y se ejecuta en CPU en unos 70 segundos. Los parámetros no tocados incluyen expertos enrutados y compartidos, `wo_a`, embeddings, cabezal de salida, routers, normas, `tid2eid` y todos los parámetros mHC.

## Capacidades

- Generación de texto y razonamiento en tres modos: chat, think-high y think-max.
- Tool calling / function calling con formato DSML nativo y parser `deepseek_v4` de vLLM, con una tasa de cumplimiento de 1.000 en los tres modos (la respuesta parsea, contiene una llamada, nombra una herramienta válida y aporta todos los parámetros requeridos).
- Codificación agéntica: el modelo base está orientado a tareas de programación con múltiples pasos y llamadas a herramientas.
- Recuperación de contexto largo: ventana nativa de 1.048.576 tokens, servida a 262.144 en la configuración de referencia, con prefill en caliente de 0,37 s a 71k de contexto gracias al prefix caching.
- Decodificación especulativa DSpark integrada, con tasa de aceptación de borrador de 48,7 % y longitud media de aceptación de 5,12 sobre 5 en salidas estructuradas.
- Ausencia de rechazo: 0,0 % de refusals en AdvBench harmful_behaviors en los tres modos, frente al 95,8 % del modelo base.

## Casos de uso

- Investigación en alineamiento y seguridad de IA: el modelo permite estudiar cómo se comporta un sistema sin capas de rechazo, analizando patrones de refusal, sesgos y límites de comportamiento. Es adecuado porque la edición es mínima y verificable, lo que facilita comparaciones controladas con el modelo base.
- Red teaming y evaluación de robustez: probar si los mecanismos de seguridad de otros sistemas pueden eludirse usando este modelo como generador de prompts adversarios. Su ausencia de refusals garantiza que los intentos no se bloquean en origen.
- Generación de código en producción: con tool calling nativo y una tasa de cumplimiento perfecta, puede integrarse en pipelines de CI/CD para autocompletado, revisión de código o generación de tests. El modo think-high aporta razonamiento explícito antes de responder.
- Agentes autónomos multi-paso: la combinación de tool calling, contexto largo y razonamiento en tres modos permite construir agentes que ejecutan secuencias largas de acciones (navegar APIs, consultar bases de código, iterar sobre resultados) sin perder el hilo.
- Procesamiento de documentos extensos: con 1M de tokens nativos, puede resumir, extraer información o responder preguntas sobre repositorios completos, manuales técnicos o expedientes legales de cientos de miles de tokens en una sola pasada.
- Desarrollo de asistentes de código sin restricciones temáticas: útil en entornos de investigación donde se necesita explorar código ofuscado, exploits educativos o análisis de malware en sandbox, donde un modelo con refusals interrumpiría el flujo de trabajo.
- Evaluación de modelos de razonamiento: al mantener intactas las capacidades del base, sirve como banco de pruebas para medir el impacto de la abliteración en tareas de lógica, matemáticas y programación, comparando métricas antes y después de la edición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card sí incluye métricas de validación del proceso de abliteración y de rendimiento de servicio, que se resumen a continuación.

| Metrica | Modelo base 0731 | Modelo abliterated |
|---|---|---|
| Refusal en chat (n=48) | 95,8 % | 0,0 % |
| Refusal en think-high (n=24) | — | 0,0 % |
| Refusal en think-max (n=24) | 95,8 % | 0,0 % |
| Tool-call compliance (3 modos) | 1.000 | 1.000 |
| Herramienta correcta seleccionada | — | 1.000 |
| Tasa de respuesta vacia | 0.000 | 0.000 |
| Aceptacion de borrador DSpark | ~48 % | 48,7 % |

Rendimiento de servicio en 2x DGX Spark (TP=2, single-stream decode, TTFT excluido):

| Carga de trabajo | Decode tok/s | Aceptacion de borrador | Longitud media de aceptacion |
|---|---:|---:|---:|
| JSON estructurado | 75,5 | 82,5 % | 5,12 / 5 |
| Codigo | 71,7 | ~69 % | — |
| Prosa tecnica | 50,6 | 47,9 % | 3,39 |

Agregado de 183 tok/s con 8 streams concurrentes. Prefill con prefix caching: 41,9 s en frio a 0,37 s en caliente a 71k de contexto (0,65 s a 156k). El rendimiento depende fuertemente del contenido: la decodificación especulativa mejora cuanto más predecible es la salida.

## Requisitos de hardware

- VRAM estimada: el modelo ocupa ~167 GB en disco (48 shards safetensors + overlay de 1,54 GB). La inferencia requiere al menos esa cantidad de memoria agregada entre GPUs; LLM Explorer estima 145,1 GB de VRAM, probablemente con alguna optimización adicional no documentada.
- GPU recomendadas: 2x NVIDIA DGX Spark (GB10, 128 GB cada una) con tensor parallelism = 2, conectadas por ConnectX-7 RoCE. Es la configuración validada en la model card.
- No cabe en GPUs de consumo: una RTX 4090 (24 GB) o similar es insuficiente para los pesos completos. No hay versiones GGUF ni cuantizaciones de menor precisión publicadas en la información disponible.
- Opciones de despliegue: vLLM 0.25.2 con la imagen `ghcr.io/anemll/dspark-vllm-gx10:0.1.1`, usando `--tool-call-parser deepseek_v4`. La configuracion de referencia sirve el contexto a 262.144 tokens.
- Latencia y throughput: 75,5 tok/s en JSON estructurado, 71,7 tok/s en código y 50,6 tok/s en prosa técnica (single-stream, TTFT excluido). Agregado de 183 tok/s con 8 streams. Prefill en caliente de 0,37 s a 71k de contexto con prefix caching.

## Comparativa con modelos similares

La comparación directa disponible es contra el modelo base DeepSeek-V4-Flash-0731, del que deriva. No se dispone de datos de benchmarks estándar para comparar con otras alternativas de la misma categoría (MoE de ~300B con contexto de 1M).

| Modelo | Parametros | Contexto | Refusal AdvBench | Tool-call compliance | Licencia |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731 (base) | 305,7B (13B activos) | 1.048.576 | 95,8 % | 1.000 | MIT |
| DeepSeek-V4-Flash-0731-abliterated | 305,7B (13B activos) | 1.048.576 | 0,0 % | 1.000 | MIT |

La diferencia esencial es la eliminación del rechazo con una edición mínima y verificable. No se dispone de información sobre otros modelos abliterated de tamaño comparable para establecer una comparativa más amplia.

## Limitaciones y advertencias

- Modelo sin censura: los refusals se han eliminado de forma sustancial. El modelo intentará responder a casi cualquier petición, incluido contenido dañino, ilegal o no ético. El uso es responsabilidad del usuario.
- Riesgo de alucinación: no se han publicado métricas de factualidad para este overlay. El comportamiento alucinatorio del modelo base no se ha evaluado tras la edición.
- El límite superior de refusal observado no es una cota probada: con las muestras usadas (n=48 y n=24), los límites superiores de Wilson al 95 % son ~7,4 % en chat y ~13,8 % en modos de pensamiento. El 0,0 % observado no garantiza ausencia absoluta de rechazo.
- Contexto servido inferior al nativo: aunque el modelo soporta 1.048.576 tokens, la configuración de referencia lo sirve a 262.144. Superar ese límite requeriría ajustes no documentados.
- Requisitos de hardware muy elevados: necesita 2x DGX Spark (o hardware equivalente con más de 167 GB de memoria agregada). No hay versiones cuantizadas de menor tamaño publicadas.
- El delayed refusal documentado en V4 (el modelo base tiende a enmarcar educadamente antes de rechazar) se ha eliminado en este overlay, pero no se ha verificado en todos los dominios.
- La licencia MIT permite uso comercial, pero el contenido generado puede incurrir en responsabilidades legales según el uso. El autor declara que el modelo está pensado para uso local o de investigación en hardware propio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cebeuq/DeepSeek-V4-Flash-0731-abliterated
- Modelo base en HuggingFace: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- DeepWiki del proyecto: https://deepwiki.com/deepseek-v4-flash-0731/deepseek-v4-flash-0731
- Releases en GitHub: https://github.com/deepseek-v4-flash-0731/deepseek-v4-flash-0731/releases
- Ficha en LLM Explorer: https://llm-explorer.com/model/cebeuq%2FDeepSeek-V4-Flash-0731-abliterated,jF40WYNfMSEbKf0uNNUiI
