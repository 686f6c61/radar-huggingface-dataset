# ggml-org/Flint-GGUF

## Resumen

Flint es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por RecursiveSI y distribuido en formato GGUF por ggml-org, el equipo detrás de llama.cpp. Con 39.785.287.456 parámetros totales (aproximadamente 39,8B) y solo unos 2,5B activos por token, Flint se posiciona como una alternativa eficiente para inferencia local: la mayor parte del cómputo se concentra en una fracción pequeña de la red, lo que reduce el coste por token pese al tamaño total del modelo.

La arquitectura consta de 49 capas (2 densas y 47 MoE), con 256 expertos enrutados, 6 activos por token y un experto compartido. Soporta una longitud de contexto de 262.144 tokens, lo que lo hace adecuado para tareas de contexto largo como análisis de documentos extensos o conversaciones multi-turno prolongadas. Es un modelo exclusivamente de texto: no incluye capacidades multimodales ni sidecars de tipo mmproj, MTP o DFlash.

La relevancia actual de esta ficha radica en su disponibilidad en GGUF con cuantizaciones listas para usar (BF16, Q8_0 y Q4_K_M) y su integración con llama.cpp mediante un PR específico. Esto permite desplegarlo en hardware de consumo y en entornos de producción sin necesidad de GPUs de datacenter, algo poco habitual en modelos de casi 40B parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE): 49 capas (2 densas + 47 MoE), 256 expertos enrutados, 6 activos por token, experto compartido |
| Parametros totales | 39.785.287.456 (~39,8B) |
| Parametros activos | ~2,5B por token |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M (en Q4_K_M los tensores pequeños no-expertos se mantienen en Q8_0) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 145,4 GB) |

## Arquitectura y entrenamiento

Flint es un transformer de tipo Mixture of Experts con 49 capas, de las cuales 2 son densas y 47 son capas MoE. Cada capa MoE contiene 256 expertos enrutados, de los que se activan 6 por token, además de un experto compartido que se ejecuta siempre. Esta configuración da un total de aproximadamente 39,8B parámetros con solo unos 2,5B activos por token, lo que reduce el coste computacional por paso de decodificación en comparación con un modelo denso del mismo tamaño.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card no documenta innovaciones técnicas adicionales más allá de la propia arquitectura MoE con experto compartido. El modelo base es `RecursiveSI/flint`, y esta versión GGUF ha sido convertida automáticamente con la herramienta `ggml-org/convert`.

## Capacidades

- Generación de texto conversacional: el tag `conversational` y el pipeline `text-generation` indican uso previsto para diálogo multi-turno.
- Razonamiento y generación de texto general: capacidades propias de un modelo de lenguaje base, aunque no se documentan evaluaciones específicas.
- Contexto largo: ventana de 262.144 tokens, útil para documentos extensos y conversaciones prolongadas.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere integración con APIs compatibles con el ecosistema de Hugging Face.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multimodales (visión, audio): no disponibles; el modelo es exclusivamente de texto.
- Modo thinking: no documentado.

## Casos de uso

- Análisis de documentos extensos: con 262K tokens de contexto, Flint puede procesar contratos, informes técnicos o expedientes completos en una sola pasada sin necesidad de fragmentación, lo que simplifica pipelines de extracción y resumen.
- Asistente conversacional de contexto largo: su naturaleza conversacional y su ventana amplia permiten mantener hilos de diálogo con historial extenso, adecuado para soporte técnico especializado donde el usuario aporta mucho contexto previo.
- Generación de texto en local con hardware de consumo: gracias a la cuantización Q4_K_M y a sus ~2,5B parámetros activos, puede desplegarse en estaciones de trabajo con GPUs de gama alta consumer, reduciendo costes frente a APIs en la nube.
- Procesamiento por lotes de texto: la eficiencia del enrutamiento MoE permite ejecutar tareas de clasificación, resumen o reescritura sobre grandes volúmenes de documentos con un coste por token menor que un modelo denso de tamaño equivalente.
- Prototipado e investigación: al estar disponible en GGUF y con licencia Apache 2.0, es adecuado para experimentación académica y para construir prototipos sin restricciones de licencia.
- Integración en aplicaciones de escritorio: la disponibilidad en la app Llama y mediante `llama serve` facilita su incorporación en herramientas de escritorio o entornos sin infraestructura de servidor dedicada.
- Despliegue en entornos con requisitos de soberanía de datos: al poder ejecutarse íntegramente en local, permite procesar información sensible sin enviarla a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, el modelo completo requiere aproximadamente 80 GB de VRAM (39,8B × 2 bytes). En Q8_0, alrededor de 40 GB. En Q4_K_M, en torno a 22-25 GB, aunque los tensores no-expertos se mantienen en Q8_0, lo que eleva ligeramente el requisito frente a una cuantización Q4 pura.
- GPU recomendadas: para BF16, A100 80GB o H100; para Q8_0, A100 40GB o dos GPUs de 24 GB; para Q4_K_M, una RTX 4090 (24 GB) o RTX 3090 (24 GB) resulta ajustada pero viable.
- ¿Cabe en GPU consumer? Sí, en Q4_K_M cabe en GPUs de 24 GB como RTX 4090 o RTX 3090. En Q8_0 requeriría 48 GB o reparto entre varias GPUs.
- Opciones de despliegue: llama.cpp (requiere una build con soporte para Flint, ver PR #30928), `llama serve`, la app Llama, y cualquier frontend compatible con GGUF (Ollama, LM Studio, etc., siempre que la build subyacente soporte la arquitectura). vLLM y TGI no están documentados para este formato.
- Latencia y throughput estimados: no disponibles. Al activar solo ~2,5B parámetros por token, se espera un throughput superior al de un modelo denso de 39,8B, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Flint (este) | ~39,8B | ~2,5B | 262K | Apache 2.0 | GGUF |
| Alternativas MoE de tamaño comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada. La comparativa con alternativas de la misma categoría (MoE de ~40B con ~2-3B activos) no puede completarse sin datos verificables.

## Limitaciones y advertencias

- Idiomas soportados no documentados: no se puede garantizar un rendimiento adecuado fuera del inglés o de los idiomas con los que se entrenó el modelo base, que no se especifican.
- Riesgo de alucinación: como todo modelo generativo, puede producir información plausible pero incorrecta; no se documentan mitigaciones específicas.
- Sesgos conocidos: no documentados, pero al no disponer de información sobre el dataset de entrenamiento no es posible evaluar sesgos de dominio, género o culturales.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero conviene revisar la licencia del modelo base `RecursiveSI/flint` por si impone condiciones adicionales.
- Requiere una build específica de llama.cpp con soporte para Flint (PR #30928); las versiones estándar pueden no cargar el modelo correctamente.
- Modelo exclusivamente de texto: no soporta visión, audio ni otras modalidades.
- No se documentan capacidades de tool calling ni de razonamiento multi-paso, por lo que su uso en pipelines de agentes requiere validación previa.
- El repo GGUF ocupa 145,4 GB, lo que implica un coste de almacenamiento y descarga considerable si se quieren conservar todas las cuantizaciones.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/ggml-org/Flint-GGUF
- Modelo base: https://huggingface.co/RecursiveSI/flint
- App Llama: https://llama.app
- PR de llama.cpp con soporte para Flint: https://github.com/ggml-org/llama.cpp/pull/30928
- Herramienta de conversión: https://github.com/ggml-org/convert
