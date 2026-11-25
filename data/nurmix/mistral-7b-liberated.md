# nurmix/Mistral-7B-Liberated

## Resumen
Mistral-7B-Liberated es una variante "abliterated" (sin mecanismos de rechazo) del modelo mistralai/Mistral-7B-Instruct-v0.3, publicada por el usuario nurmix en Hugging Face. El modelo conserva la arquitectura, los pesos base y la licencia Apache 2.0 del original, pero se ha modificado su comportamiento de seguridad mediante una técnica de ablación de direcciones de rechazo, de modo que responde a peticiones que el modelo original rechazaría. El problema que aborda es la eliminación del sesgo de negativa (refusal) preservando al máximo las capacidades generales de razonamiento y generación.

La relevancia de esta ficha es doble: por un lado, documenta un caso práctico de edición de pesos con herramientas como Heretic; por otro, advierte de que se trata de un modelo sin salvaguardas, lo que condiciona su uso en producción. El modelo base Mistral-7B-Instruct-v0.3 es un transformer decoder-only de 7.248.023.552 parámetros con ventana de contexto de 32.768 tokens y soporte de tool calling, y estas características se heredan en la variante liberada.

El autor reporta una reducción de rechazos del 87 % al 4 % sobre el conjunto harmful_behaviors, con una divergencia KL de solo 0,025 frente al modelo base en harmless_alpaca, lo que sitúa al checkpoint en la frontera de Pareto entre supresión de rechazos y preservación de capacidades.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Mistral-7B-Instruct-v0.3) |
| Parametros totales | 7.248.023.552 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base) |
| Tipos de cuantizacion | safetensors (F16/BF16), GGUF en F16, Q4_K_M, Q6_K y Q8_0 |
| Idiomas soportados | no disponible (el modelo base soporta principalmente ingles y varios idiomas europeos, sin listado oficial en la ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento
La arquitectura es la de Mistral-7B-Instruct-v0.3: un transformer decoder-only denso con atención de ventana deslizante (sliding window attention), 32 capas, dimensión oculta de 4096, 32 cabezas de atención y vocabulario de 32.768 tokens ampliado respecto a versiones anteriores. El modelo base fue entrenado por Mistral AI sobre un corpus multilingüe no desglosado públicamente y afinado con instrucciones y preferencias (SFT y DPO) para conversación y tool calling.

La modificación de esta variante no consiste en un reentrenamiento, sino en una ablación de direcciones en el espacio de activaciones. El autor aplica Arbitrary-Rank Ablation (ARA) mediante Heretic v2.0.0, ejecutando 100 trials de Optuna con optimización multiobjetivo (minimizar tasa de rechazo y minimizar divergencia KL). El checkpoint seleccionado corresponde al índice de Pareto 4. Los pesos tensoriales no se reentrenan; solo se modifican las proyecciones necesarias para eliminar el comportamiento de rechazo.

Además, el autor corrige metadatos del tokenizador en los cuatro GGUF: 768 tokens marcados como especiales en el tokenizador original (incluidos `[INST]`, `[/INST]` y delimitadores de herramientas) estaban incorrectamente marcados como NORMAL. Solo se cambian los tipos de token; los pesos y los safetensors permanecen inalterados.

## Capacidades
- Generación de texto conversacional multi-turno, heredada del modelo Instruct base.
- Razonamiento y respuesta a instrucciones complejas, con preservación de capacidades según la métrica KL reportada.
- Soporte de tool calling / function calling, con plantilla de chat explícita en el Modelfile de Ollama que maneja resultados de herramientas con escape JSON e identificadores largos.
- Capacidades multilingües limitadas a las del modelo base; no hay listado oficial de idiomas en la ficha.
- Ausencia deliberada de mecanismos de rechazo: responde a peticiones que el modelo original rechazaría.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso
- Investigación sobre alineación y seguridad: el modelo permite estudiar el efecto de la ablación de rechazo comparando respuestas frente al Mistral-7B-Instruct-v0.3 original, con la métrica de rechazos y KL como referencia.
- Evaluación de robustez de filtros: sirve para probar clasificadores de contenido y sistemas de moderación, ya que genera respuestas que los modelos alineados evitan.
- Generación creativa sin restricciones: escritura de ficción, guiones o contenido sensible donde el autor necesita explorar temas que el modelo base rechazaría, siempre bajo responsabilidad del operador.
- Despliegue local con Ollama: el autor proporciona un Modelfile y variantes GGUF (Q4_K_M, Q6_K, Q8_0) para ejecución en estaciones de trabajo sin GPU de datacenter, con plantilla de chat y soporte de herramientas.
- Integración en pipelines de Transformers: carga directa con `AutoModelForCausalLM` y `AutoTokenizer` para experimentos de generación y evaluación con `safetensors`.
- Pruebas de tool calling en agentes: la plantilla de Ollama soporta colación de mensajes del mismo rol, resultados de herramientas con escape JSON e identificadores largos, útil para validar flujos de agente multi-paso.
- Benchmarking de cuantización: las cuatro variantes GGUF permiten medir el impacto de la cuantización en la tasa de rechazo y la calidad de respuesta frente al checkpoint F16.

## Benchmarks y rendimiento
El autor publica únicamente métricas de comportamiento de rechazo y divergencia, no benchmarks estándar de conocimiento o código.

| Metrica | Antes (base) | Despues (liberado) |
|---|---|---|
| Rechazos en harmful_behaviors | 87 / 100 | 4 / 100 |
| Divergencia KL en harmless_alpaca | 0,0 (baseline) | 0,025 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible. El autor indica que Q8_0 pasó pruebas de humo locales de chat, roles consecutivos y round-trip de herramientas, pero no constituye una evaluación de calidad exhaustiva.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 14-16 GB en F16/BF16 para los 7.248 millones de parámetros; en torno a 4-5 GB en Q4_K_M, 6-7 GB en Q6_K y 8-9 GB en Q8_0 (estimaciones según el tamaño de pesos, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100 o L40S para despliegues con concurrencia y contexto completo de 32.768 tokens; RTX 4090 (24 GB) o RTX 3090 (24 GB) para F16 en una sola GPU.
- Cabe en GPU de consumo: sí, en Q4_K_M y Q6_K en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB); Q8_0 requiere 12-16 GB.
- Opciones de despliegue: Ollama (soporte oficial del autor con Modelfile), llama.cpp (GGUF), Transformers con safetensors, y servidores compatibles con endpoints (el tag `endpoints_compatible` está presente en el repo).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Rechazos (harmful_behaviors) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mistral-7B-Liberated | 7.248 M | 32.768 | 4 / 100 | Apache 2.0 | Hugging Face, GGUF, Ollama |
| mistralai/Mistral-7B-Instruct-v0.3 | 7.248 M | 32.768 | 87 / 100 (referencia del autor) | Apache 2.0 | Hugging Face |
| Mistral-7B-Instruct-v0.2 | 7.242 M | 32.768 | no disponible | Apache 2.0 | Hugging Face |
| Otras variantes abliterated de Mistral-7B | ~7.248 M | 32.768 | no disponible | Apache 2.0 (heredada) | Hugging Face |

La comparación se limita a parámetros, contexto y licencia; no hay datos públicos de benchmarks estándar para esta variante que permitan comparar rendimiento de conocimiento o código con alternativas.

## Limitaciones y advertencias
- Modelo abliterated: los mecanismos de seguridad y rechazo se han eliminado intencionadamente; puede generar contenido que el modelo original rechazaría, incluido material dañino, ofensivo o ilegal según la jurisdicción.
- Riesgo de alucinación: inherente al modelo base de 7.000 millones de parámetros; no se ha evaluado el impacto de la ablación en la factualidad.
- Idiomas: no hay listado oficial de idiomas soportados en la ficha; el rendimiento fuera del inglés puede degradarse respecto al modelo base.
- Contexto: 32.768 tokens heredados del modelo base; no se documenta el comportamiento de la ventana deslizante tras la ablación.
- Licencia: Apache 2.0 permite uso comercial, pero el operador asume la responsabilidad legal del contenido generado; la licencia no exime del cumplimiento normativo.
- La ablación puede degradar sutilmente capacidades no medidas por la métrica KL; el autor solo reporta pruebas de humo, no una evaluación exhaustiva.
- Los GGUF antiguos tenían metadatos de tokenizador incorrectos (768 tokens especiales marcados como NORMAL); es necesario volver a descargar las versiones corregidas y verificar con `SHA256SUMS`.
- La plantilla Jinja embebida en los GGUF requiere turnos alternos usuario/asistente en clientes distintos de Ollama; para otros flujos hay que usar el Modelfile explícito.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/nurmix/Mistral-7B-Liberated
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Heretic (herramienta de ablación): https://github.com/p-e-w/heretic
- Repositorio de Ollama: https://ollama.com
- Documentación de Transformers: https://huggingface.co/docs/transformers
- llama.cpp: https://github.com/ggerganov/llama.cpp
