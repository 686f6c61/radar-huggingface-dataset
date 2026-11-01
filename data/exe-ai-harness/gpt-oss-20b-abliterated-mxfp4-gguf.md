# exe-ai-harness/gpt-oss-20b-abliterated-MXFP4-GGUF

## Resumen

Este repositorio contiene una cuantización en formato GGUF con pesos MXFP4 del modelo **gpt-oss-20b abliterated**, una versión sin filtros de rechazo (uncensored) del modelo abierto gpt-oss-20b de OpenAI. El trabajo original de abliteración fue realizado por wangzhang mediante la herramienta Abliterix, y exe-ai-harness ha reconvertido los pesos a MXFP4, la cuantización nativa en la que OpenAI publicó originalmente los expertos del modelo. El resultado es un único archivo GGUF de 12,1 GB que preserva los valores originales de los expertos no modificados, evitando el error de redondeo adicional que introduciría un K-quant.

El modelo es un Mixture of Experts (MoE) de 21B parámetros con 3,6B activos por token, ventana de contexto de 131.072 tokens y capacidades de razonamiento y visión (mediante un proyector opcional de 651 MB). Su relevancia radica en ofrecer, en una sola GPU de 12 GB, un modelo sin mecanismos de rechazo con soporte de imágenes y razonamiento, apto para casos donde los filtros de seguridad del modelo original resultan excesivamente restrictivos. Exe AI lo utiliza como motor de sus Web Agents. La licencia es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), basado en gpt-oss-20b de OpenAI |
| Parámetros totales | 20.914.757.184 (≈21B) |
| Parámetros activos | 3,6B por token |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantización | MXFP4 (expertos), resto de tensores según el modelo fuente |
| Idiomas soportados | Inglés, alemán (etiquetados en el repo; el alemán funciona de forma irregular) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (12,1 GB el modelo; 651 MB el proyector de visión opcional) |

## Arquitectura y entrenamiento

El modelo base es gpt-oss-20b de OpenAI, un transformer MoE en el que solo 3,6B de los 21B parámetros se activan por token, lo que permite inferencia rápida con una huella de memoria reducida. OpenAI publicó los pesos de los expertos exclusivamente en formato MXFP4 (microscaling floating point de 4 bits), de modo que cualquier copia en BF16 es una elevación de precisión de esos valores de 4 bits. La abliteración de wangzhang se realizó sobre una de esas copias en BF16; este repositorio re-cuantiza el resultado a MXFP4, de forma que todos los pesos de expertos no editados recuperan exactamente su valor original y solo los pesos modificados sufren redondeo. Un K-quant alternativo (como Q4_K_M, 15,8 GB) re-redondearía los valores a otra rejilla, añadiendo 3,7 GB de tamaño y error adicional.

El proceso de construcción es sencillo y está documentado: se parte del archivo `gpt-oss-20b-abliterated-bf16.gguf` de wangzhang y se aplica `llama-quantize` con el modo `MXFP4_MOE` usando llama.cpp (commit `36a0e2ffc0b352b774f8d71c43668b75b3061ef5`). El proyector de visión y la plantilla de chat (formato Harmony, que corrige cabeceras de tool calls rotas) provienen sin cambios de SoAIHQ/gpt-oss-20b-VISION-v2-GGUF; el proyector fue entrenado sobre el gpt-oss-20b original. No hay datos públicos sobre el preentrenamiento original en esta ficha.

## Capacidades

- Generación de texto conversacional con razonamiento configurable por petición (niveles `low`, `medium`, `high` mediante `reasoning_effort`).
- Entrada de imágenes (pipeline image-text-to-text) mediante proyector de visión opcional de 651 MB; la calidad de lectura de imágenes es, según el autor, "aproximada" y no apta para documentos.
- Ventana de contexto de 131.072 tokens para conversaciones largas y documentos extensos.
- Sin mecanismos de rechazo: 0 de 22 peticiones de prueba fueron rechazadas, frente a 11 del modelo original de OpenAI.
- Compatibilidad con cualquier cliente OpenAI-compatible a través de llama-server.
- Soporte de tool calling mediante la plantilla Harmony incluida (`chat_template.jinja`), que corrige cabeceras de tool calls defectuosas.
- Formato GGUF compatible con llama.cpp y derivados (Ollama, LM Studio, etc.).

## Casos de uso

- **Agentes web y automatización**: Exe AI lo emplea como motor de sus Web Agents; el soporte de tool calling con la plantilla Harmony corregida y los 131K de contexto lo hacen adecuado para pipelines de agentes multi-paso.
- **Investigación en seguridad y alineamiento**: al eliminar los rechazos, permite estudiar el comportamiento del modelo sin las capas de moderación, útil para red-teaming y análisis de abliteración.
- **Asistente local en hardware de consumo**: con 12,1 GB cabe íntegramente en una RTX 3060/4070 de 12 GB; con `--fit` funciona incluso en GPUs más antiguas descargando expertos a RAM (~49 tokens/s en una TITAN X Pascal).
- **Procesamiento de documentos largos**: la ventana de 131.072 tokens permite resumir o consultar contratos, artículos o bases de código extensas en una sola pasada.
- **Generación creativa sin filtros**: escritura de ficción, sátira o humor negro donde el modelo original rechaza peticiones en zona gris (el 54 % de las peticiones de prueba del original fueron rechazadas).
- **Prototipado de aplicaciones multimodales ligeras**: el proyector de visión permite experimentar con entrada de imágenes (descripciones aproximadas de dibujos, escenas simples), aunque no para lectura de facturas o documentos.
- **Inferencia de alto rendimiento local**: ~184 tokens/s de generación en una RTX 3090 con todo el modelo en GPU, adecuado para servir a varios usuarios en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor publicó evaluaciones propias, no comparables con benchmarks estándar:

| Comprobación | Resultado |
|---|---|
| 16 peticiones en zona gris (alemán) | 16 respondidas, 0 rechazadas |
| 6 peticiones difíciles (alemán) | 6 respondidas, 0 rechazadas |
| 10 tareas de seguimiento de instrucciones con reglas de formato estrictas | 7 / 10 |
| Cálculo de tarifa eléctrica (tres tarifas, cuota base) | correcto |
| Visión: dibujo infantil | aproximada: detecta figura sonriente, ojos grandes, cielo azul; omite la niña, el vestido rosa y el prado |
| Visión: factura con error oculto en el total | fallida: inventa líneas, no detecta el error |
| Velocidad (RTX 3090, todo en GPU) | ~184 tokens/s de generación |
| Velocidad (TITAN X 12 GB, expertos parcialmente en RAM, contexto 131.072) | ~49 tokens/s generación, 147 tokens/s lectura |

## Requisitos de hardware

- **VRAM estimada**: 12,1 GB para el modelo completo en GPU; con `--fit` en llama.cpp funciona en GPUs de 12 GB manteniendo la atención en GPU y los tensores de expertos en RAM del sistema. El proyector de visión añade 651 MB.
- **GPUs recomendadas**: RTX 3090 (24 GB, ~184 tokens/s con el modelo íntegro en GPU); RTX 4090 también válida. GPUs de 12 GB (RTX 3060/4070) con `--fit`. Incluso una TITAN X Pascal de 12 GB logra ~49 tokens/s.
- **Consumer GPUs**: sí, cabe en GPUs de 12 GB o más; en GPUs menores se requiere offload parcial de expertos a RAM con penalización de velocidad.
- **Despliegue**: llama.cpp (llama-server con `--mmproj` para visión y `--jinja` para la plantilla Harmony); compatible con clientes OpenAI-compatible. No se menciona soporte específico de vLLM, TGI u Ollama, aunque el formato GGUF es compatible con los ecosistemas habituales de llama.cpp.
- **Latencia y throughput**: ~184 tokens/s (RTX 3090, todo en GPU); ~49 tokens/s generación y 147 tokens/s lectura (TITAN X con expertos parcialmente en RAM y contexto completo de 131.072).

## Comparativa con modelos similares

| Modelo | Formato | Tamaño | Rechazos (test de 22) | Contexto | Licencia |
|---|---|---|---|---|---|
| OpenAI gpt-oss-20b original | MXFP4 | 12,1 GB | 11 / 22 | 131.072 | Apache 2.0 |
| wangzhang gpt-oss-20b-abliterated | Q4_K_M | 15,8 GB | 0 / 22 | 131.072 | Apache 2.0 |
| **Este repositorio (exe-ai-harness)** | **MXFP4** | **12,1 GB** | **0 / 22** | **131.072** | **Apache 2.0** |

Frente al original, este modelo elimina todos los rechazos manteniendo el mismo tamaño y cuantización nativa. Frente a la versión abliterated en Q4_K_M de wangzhang, ofrece el mismo comportamiento sin rechazos pero 3,7 GB menos y sin el error de redondeo adicional del K-quant.

## Limitaciones y advertencias

- **Riesgo de alucinación elevado**: la abliteración elimina rechazos pero no añade conocimiento; el autor advierte explícitamente que el modelo puede afirmar cosas incorrectas con total confianza.
- **Sin filtros de seguridad**: al ser un modelo uncensored, puede generar contenido que el modelo original rechazaría. Su uso exige responsabilidad y criterio por parte del operador.
- **Calidad del alemán irregular**: varias respuestas en alemán resultaron torpes o parcialmente carentes de sentido en las pruebas del autor; el inglés es notablemente más fuerte. No hay soporte etiquetado para castellano.
- **Visión limitada**: la lectura de imágenes es aproximada; falla en tareas de documentos (inventó elementos en una factura y no detectó el error del total). No apto para OCR ni procesamiento documental.
- **Seguimiento de instrucciones imperfecto**: 7/10 en tareas con reglas de formato estrictas.
- **Evaluación no estandarizada**: las pruebas del autor son comprobaciones pequeñas de una sola ejecución, no benchmarks formales.
- **Fuera de alcance declarado**: el autor excluye explícitamente decisiones médicas, legales, financieras o de seguridad crítica.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo derivado de abliteración hereda las consideraciones del modelo base de OpenAI; conviene revisar los términos de uso de gpt-oss para despliegues comerciales.

## Enlaces

- Repositorio: https://huggingface.co/exe-ai-harness/gpt-oss-20b-abliterated-MXFP4-GGUF
- Modelo base abliterated: https://huggingface.co/wangzhang/gpt-oss-20b-abliterated
- Modelo original de OpenAI: https://huggingface.co/openai/gpt-oss-20b
- Proyector de visión y plantilla de chat: https://huggingface.co/SoAIHQ/gpt-oss-20b-VISION-v2-GGUF
- Herramienta de abliteración Abliterix: https://github.com/wuwangzhang1216/abliterix
- Producto de Exe AI (Web Agents): https://exe-hq.net
