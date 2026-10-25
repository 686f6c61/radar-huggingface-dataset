# fcmeyer/Nanbeige4.3-33B-MLX-8bit

## Resumen

Nanbeige4.3-33B-MLX-8bit es una conversión a formato MLX con cuantización afín de 8 bits del modelo Nanbeige4.3-33B, desarrollado por el equipo Nanbeige y publicado en HuggingFace por el usuario fcmeyer. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos derivan del checkpoint original en BF16 (revisión `c1093c501cc6460427c0ac634db7223d0450c0ee`) y conservan su plantilla de chat, su tokenizador y su configuración de contexto de 524.288 tokens.

El modelo base es un transformer de 33.118.977.024 parámetros (aproximadamente 33B) con licencia Apache-2.0, orientado a generación de texto conversacional en inglés y chino, con soporte de modo de razonamiento (`enable_thinking`) y de llamadas a herramientas en formato XML o JSON. La conversión ocupa 35,2 GB de repositorio (35.189.757.302 bytes en 1203 tensores), lo que la hace manejable en equipos Apple Silicon con memoria unificada alta.

Su relevancia práctica es doble: por un lado, permite ejecutar un modelo denso de 33B en Mac mediante `mlx_lm` con un pico de memoria medido de entre 35,6 y 39,0 GB; por otro, el autor documenta una validación de fidelidad frente a BF16 (KL media de 0,002034 nats/token y 98,76 % de acuerdo en el token top-1 sobre un corpus sintético de 563 tokens), lo que da una idea cuantitativa de la degradación introducida por la cuantización, aunque no certifica equivalencia de capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (el repo declara el tag `llama`; la model card no detalla la arquitectura interna) |
| Parametros totales | 33.118.977.024 |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | 524.288 tokens (configuración del modelo origen, conservada; no validada a longitud completa) |
| Tipos de cuantizacion | MLX afín de 8 bits, group size 64 (variantes BF16 y 8-bit generadas por separado desde BF16) |
| Idiomas soportados | Inglés (`en`) y chino (`zh`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors para MLX (1203 tensores, 35.189.757.302 bytes) |

## Arquitectura y entrenamiento

La información disponible no documenta la arquitectura interna del modelo base más allá del tag `llama` del repositorio, ni tampoco el volumen de tokens de entrenamiento, la composición del dataset o si hubo fases de RLHF/DPO. Lo que sí se detalla es la capa de conversión: cuantización afín de 8 bits con 8 bits base y group size 64, aplicada sobre el checkpoint BF16, con todos los prefill y cálculos de validación ejecutados en MLX.

La innovación técnica relevante en este repositorio es la de la plantilla de chat, que se preserva del modelo original. Dicha plantilla expone dos controles: `enable_thinking`, que activa o desactiva el razonamiento explícito en la respuesta actual, y `preserve_thinking=True`, que retiene el razonamiento de turnos anteriores para flujos de trabajo con agentes. Para tool calling, el autor del modelo original recomienda `tool_call_format="xml"`, aunque también se admite JSON; la model card advierte explícitamente de que el soporte de plantilla no certifica el parser de herramientas de ningún servidor concreto.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Modo de razonamiento explícito (thinking mode) conmutable por petición mediante `enable_thinking`.
- Preservación del razonamiento previo entre turnos (`preserve_thinking=True`), pensada para flujos agénticos de varios pasos.
- Llamadas a herramientas (tool calling / function calling) en formato XML (recomendado por el autor original) y JSON.
- Ventana de contexto de 524.288 tokens en la configuración heredada, adecuada para documentos largos o historiales extensos.
- Ejecución nativa en Apple Silicon a través de la librería `mlx_lm`.
- No se documentan en la información disponible capacidades de visión, audio, código o matemáticas específicas.

## Casos de uso

- Asistentes conversacionales multi-turno en Mac: con 524.288 tokens de contexto configurados, el modelo puede mantener historiales extensos o incorporar documentación completa como contexto sin truncados agresivos, ejecutándose en local sobre memoria unificada.
- Despliegue local en estaciones de trabajo Apple Silicon: un equipo con 128 GB de memoria unificada puede servir el modelo con un pico medido de 35,6-39,0 GB, sin necesidad de GPU dedicada ni de conexión a la nube.
- Flujos agénticos con herramientas: la combinación de `preserve_thinking` y tool calling en XML permite construir agentes que razonan, invocan funciones y mantienen la traza de razonamiento entre pasos.
- Procesamiento de documentación larga en chino e inglés: resúmenes, extracción de datos y preguntas sobre contratos, informes o expedientes que quepan en la ventana de contexto.
- Prototipado e investigación en entornos sin CUDA: permite evaluar el comportamiento de un modelo de 33B en MLX antes de escalar a infraestructura con GPUs, usando la misma plantilla de chat.
- Evaluación comparativa de cuantizaciones: el repositorio incluye artefactos de validación (`evaluation.json`, `conversion.json`, `environment.json`) y un script de reproducción, útil para medir el impacto de 8 bits frente a BF16 en tareas propias.
- Generación asistida en local con requisitos de privacidad: al no requerir salida a servicios externos, encaja en escenarios donde los datos no pueden abandonar la máquina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor incluye únicamente métricas de regresión de la conversión, medidas sobre un corpus sintético fijo de 563 tokens puntuados, que no deben interpretarse como evaluación de capacidades:

| Metrica | Valor |
|---|---|
| NLL media por token | 2,074798 |
| Perplejidad | 7,962938 |
| Diferencia de NLL frente a BF16 | +0,001105 |
| KL media (BF16 ‖ cuantizado) | 0,002034 nats/token |
| Acuerdo en token top-1 frente a BF16 | 98,76 % |

Rendimiento medido en Apple M5 Max con 128 GB de memoria unificada, caché KV sin cuantizar, pasos de prefill de 512 tokens y 256 tokens de salida (mediana de tres ensayos tras un calentamiento):

| Tokens de entrada | Prefill (tok/s) | Decode (tok/s) | Pico de memoria (GB) |
|---:|---:|---:|---:|
| 512 | 501,70 | 14,99 | 35,63 |
| 4096 | 540,49 | 14,22 | 36,44 |
| 16384 | 468,49 | 13,47 | 39,04 |

## Requisitos de hardware

- Memoria: los pesos suman 35,2 GB, por lo que se requiere al menos 40 GB de memoria disponible; el pico medido con caché KV sin cuantizar va de 35,63 GB (512 tokens de entrada) a 39,04 GB (16.384 tokens).
- Hardware validado: Apple M5 Max con 128 GB de memoria unificada. No se han publicado mediciones en otros chips.
- Cabe en GPU de consumo en cuanto a tamaño, pero este repositorio solo contiene pesos MLX: para tarjetas NVIDIA habría que recurrir al modelo base en BF16 (aproximadamente 66 GB solo en pesos, calculado a partir de 33.118.977.024 parámetros) u otra cuantización no incluida aquí.
- Despliegue: `mlx_lm` es la vía documentada, con el par `load` / `generate` y `tokenizer.apply_chat_template`. No se documentan en este repositorio opciones como vLLM, llama.cpp, Ollama o TGI.
- Throughput: prefill de 468-540 tok/s y decodificación de 13,5-15,0 tok/s en el hardware indicado; la decodificación cae ligeramente al crecer la entrada (14,99 tok/s a 512 tokens frente a 13,47 tok/s a 16.384).
- La memoria reportada es la asignación pico de MLX y excluye otras aplicaciones y el consumo del sistema operativo.

## Comparativa con modelos similares

La información proporcionada solo permite comparar la conversión con su propio modelo base. No se dispone de datos de benchmarks ni de especificaciones de otras alternativas de la misma categoría.

| Modelo | Parametros | Contexto | Cuantizacion | Peso aproximado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nanbeige4.3-33B-MLX-8bit (este repo) | 33.118.977.024 | 524.288 tokens (no validado a plena longitud) | 8 bits afín, group size 64 | 35,2 GB | Apache-2.0 | HuggingFace, librería `mlx_lm` |
| Nanbeige4.3-33B (base, BF16) | 33.118.977.024 | 524.288 tokens | BF16 | ~66 GB (cálculo a partir del número de parámetros) | Apache-2.0 | HuggingFace |

Comparativas con otros modelos de la franja 30B: no disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés y chino declarados; no hay evidencia de calidad en castellano ni en otras lenguas.
- La ventana de 524.288 tokens se conserva de la configuración original, pero el autor advierte de que no se ha validado el contexto completo de 512K; el rendimiento medido llega como máximo a 16.384 tokens de entrada.
- La cuantización de 8 bits introduce una divergencia medible frente a BF16 (KL 0,002034 nats/token, 98,76 % de acuerdo top-1 sobre 563 tokens sintéticos); esta cifra no demuestra equivalencia en capacidades posteriores y puede ampliarse en dominios alejados del corpus de validación.
- Las métricas de validación proceden de un corpus sintético pequeño y fijo; no sustituyen a una evaluación de benchmarks reales.
- Riesgo de alucinación: no cuantificado en la información disponible, como es habitual en modelos generativos de esta escala.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de seguridad en la model card.
- El soporte de tool calling depende de la plantilla; el autor advierte de que la compatibilidad de plantilla no certifica el parser de herramientas de ningún servidor, por lo que hay que validar el parseo en producción.
- Licencia Apache-2.0, que permite uso comercial, pero las condiciones del modelo base deben verificarse en su propio repositorio.
- Dependencia de MLX: los pesos no son utilizables directamente en stacks CUDA (vLLM, TGI) ni en llama.cpp/Ollama sin conversión adicional.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no cuenta con validación de terceros.
- Advertencia de fecha: el repositorio figura creado el 2026-10-25, una fecha anómala respecto al momento habitual de consulta.

## Enlaces

- Repositorio HuggingFace de la conversión: https://huggingface.co/fcmeyer/Nanbeige4.3-33B-MLX-8bit
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Revisión del modelo origen utilizada: `c1093c501cc6460427c0ac634db7223d0450c0ee`
- Artefactos de reproducción incluidos en el repo: `requirements.lock.txt`, `conversion.json`, `evaluation.json`, `environment.json`, `scripts/release.py`
- Los resultados de la búsqueda web realizada no contenían enlaces pertinentes al modelo (devolvieron contenido sin relación sobre el Gran Premio de Mónaco de 1992).
