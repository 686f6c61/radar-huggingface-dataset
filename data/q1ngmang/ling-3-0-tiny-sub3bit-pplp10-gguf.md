# Q1ngMang/Ling-3.0-tiny-sub3bit-PPLp10-GGUF

## Resumen

Ling-3.0-tiny es un modelo de razonamiento híbrido de tipo Mixture-of-Experts (MoE) desarrollado por Ant Group (inclusionAI), diseñado específicamente para despliegue en entornos de borde y dispositivos con recursos limitados. Con 7.900 millones de parámetros totales y solo 1.300 millones activos por token, ofrece un equilibrio entre capacidad de razonamiento y coste computacional reducido. La variante aquí descrita, `Q1ngMang/Ling-3.0-tiny-sub3bit-PPLp10-GGUF`, es una cuantización extrema (sub-3 bits) en formato GGUF, orientada a reducir aún más el uso de memoria y permitir su ejecución en hardware de gama baja.

El modelo base emplea una arquitectura híbrida que combina atención lineal (KDA) con atención lineal gated (Gated MLA), lo que le permite procesar contextos largos de forma eficiente. Está pensado para tareas de razonamiento, generación de código y uso como agente autónomo, con soporte de tool calling. La licencia MIT facilita su adopción tanto en investigación como en productos comerciales. Esta cuantización concreta no incluye documentación adicional del autor, por lo que algunos datos técnicos específicos de la misma no están disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido con KDA (atención lineal) y Gated MLA |
| Parametros totales | 7.9B |
| Parametros activos | 1.3B (por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | sub-3bit (GGUF, según nombre del repo) |
| Idiomas soportados | no disponible (probablemente chino e inglés, sin confirmar) |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Ling-3.0-tiny utiliza una arquitectura MoE híbrida que combina dos mecanismos de atención: KDA (Kernel-based Dynamic Attention) y Gated MLA (Multi-head Latent Attention con puerta). Esta combinación permite un procesamiento eficiente de secuencias largas, reduciendo la complejidad cuadrática típica de la atención estándar. El modelo activa solo 1.300 millones de parámetros por token, lo que reduce significativamente el coste de inferencia en comparación con modelos densos de tamaño similar.

El modelo base de la serie Ling-3.0 se entrenó desde cero con 30 billones de tokens (según el nombre del repositorio `Ling-3.0-tiny-base-30T`), aunque no se especifica si esta variante tiny utilizó exactamente ese mismo conjunto de datos o un subconjunto. No se dispone de información detallada sobre el pipeline de entrenamiento (RLHF, DPO, etc.) para esta versión concreta. La cuantización sub-3bit aquí presentada es un trabajo de terceros (autor Q1ngMang) y no se documentan los detalles del proceso de calibración ni el impacto en la perplejidad, aunque el nombre sugiere una perplejidad de 10 en el conjunto de validación.

## Capacidades

- Razonamiento lógico y matemático: el modelo está diseñado para tareas de razonamiento multi-paso, con capacidad de "thinking mode" implícito.
- Generación de código: soporta múltiples lenguajes de programación y puede integrarse en flujos de desarrollo asistido.
- Tool calling / function calling: permite al modelo invocar herramientas externas, lo que lo hace adecuado para agentes autónomos.
- Uso como agente: puede gestionar conversaciones multi-turno y ejecutar acciones en entornos simulados o reales.
- Procesamiento de contexto largo: gracias a la atención lineal híbrida, maneja secuencias extensas con menor coste computacional que modelos densos.
- Multilingüismo: aunque no confirmado oficialmente, la documentación del desarrollador sugiere soporte para chino e inglés.

## Casos de uso

- Asistentes de código en entornos de desarrollo: el modelo puede autocompletar funciones, explicar fragmentos y sugerir refactorizaciones. Su bajo número de parámetros activos permite ejecutarlo en editores locales sin depender de la nube.
- Agentes de automatización de tareas: gracias al tool calling, puede orquestar llamadas a APIs, enviar correos o gestionar calendarios, funcionando como un asistente personal ligero.
- Chatbots de atención al cliente en dispositivos de borde: su tamaño reducido y cuantización extrema permiten desplegarlo en routers, NAS o mini-PCs para ofrecer respuestas contextuales sin conexión.
- Razonamiento matemático en aplicaciones educativas: puede resolver problemas paso a paso y explicar el proceso, siendo útil en plataformas de tutoría inteligente.
- Análisis de documentos largos: su atención lineal permite procesar informes, artículos o contratos extensos para extraer resúmenes o responder preguntas específicas.
- Prototipado rápido de agentes en investigación: al ser ligero y con licencia MIT, es ideal para experimentar con arquitecturas de agentes en hardware modesto antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta cuantización concreta. El modelo base Ling-3.0-tiny fue presentado con cifras de rendimiento del vendedor (Ant Group) que no han sido verificadas de forma independiente en el momento del lanzamiento. No se dispone de datos de MMLU, HumanEval, GSM8K u otras pruebas estándar para esta variante GGUF sub-3bit.

## Requisitos de hardware

- VRAM estimada: al ser una cuantización sub-3bit de 7.9B parámetros, el tamaño del archivo rondaría los 3 GB (7.9B × ~3 bits / 8 ≈ 2.96 GB), más overhead de ejecución. Se recomienda al menos 4 GB de VRAM para inferencia cómoda.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 4060, o incluso iGPUs con suficiente memoria compartida. También puede ejecutarse en CPU con llama.cpp.
- Compatibilidad con consumer GPU: sí, es uno de los principales objetivos del modelo (edge deployment).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier runtime compatible con GGUF. Para mayor rendimiento, vLLM puede cargar GGUF aunque no es su formato nativo.
- Latencia y throughput: no disponibles para esta cuantización. En general, al activar solo 1.3B parámetros, la velocidad de generación debería ser alta en hardware moderno, pero depende del backend y la optimización.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Ling-3.0-tiny (base) | 7.9B | 1.3B | no disponible | MIT | BF16/FP8/INT4 |
| Qwen3-30B-A3B | 30B | 3B | 128K | Apache 2.0 | BF16/FP8/GGUF |
| SmolLM2-1.7B | 1.7B | 1.7B (denso) | 8K | Apache 2.0 | BF16/GGUF |

La comparativa se basa en características generales, no en rendimiento medido. Ling-3.0-tiny destaca por su bajo número de parámetros activos y licencia permisiva, aunque carece de datos de contexto publicados. Qwen3-30B-A3B ofrece mayor capacidad y contexto, pero requiere más recursos. SmolLM2 es mucho más pequeño y no es MoE, por lo que su coste por token es mayor en relación a su capacidad.

## Limitaciones y advertencias

- La cuantización sub-3bit puede degradar significativamente la calidad de las respuestas, aumentando la perplejidad y el riesgo de alucinaciones. El nombre del repo sugiere una PPL de 10, que es alta para tareas de razonamiento.
- No se dispone de documentación sobre el proceso de cuantización (calibración, dataset, métricas de validación) por parte del autor de esta variante.
- El modelo base no tiene benchmarks verificados de forma independiente; las cifras del desarrollador deben tomarse con cautela.
- La longitud de contexto no está especificada, lo que dificulta planificar su uso en aplicaciones que requieran ventanas largas.
- Los idiomas soportados no están confirmados; aunque probablemente incluya chino e inglés, no hay garantía de calidad en otros idiomas.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo puede contener sesgos inherentes a los datos de entrenamiento, no documentados.
- Para producción, se recomienda validar el comportamiento del modelo en el dominio específico antes de desplegarlo, especialmente en tareas críticas.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/Q1ngMang/Ling-3.0-tiny-sub3bit-PPLp10-GGUF
- Página del proyecto en SourceForge: https://sourceforge.net/projects/ling-3-0-tiny/
- Cuantizaciones GGUF de bartowski: https://huggingface.co/bartowski/Ling-3.0-tiny-GGUF
- Documentación oficial del modelo Ling: https://developer.ant-ling.com/en/docs/models/ling/
- Modelo base de 30T tokens: https://huggingface.co/inclusionAI/Ling-3.0-tiny-base-30T
- Entrada en LLM Releases: https://www.llm-releases.com/models/ling-3-0-tiny
