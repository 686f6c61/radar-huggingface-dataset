# mradermacher/Groot-19B-A3B-261023-i1-GGUF

## Resumen

Groot-19B-A3B-261023-i1-GGUF es una colección de cuantizaciones GGUF generadas por mradermacher a partir del modelo base GrootTeam/Groot-19B-A3B-261023. Se trata de una variante de tipo Mixture-of-Experts (MoE) con 18.985.723.008 parámetros totales y aproximadamente 3B activos (según indica el sufijo A3B del nombre), lo que permite inferencia con coste computacional próximo al de un modelo de 3B pese a disponer de la capacidad de representación de un modelo de 19B. El repositorio incluye cuantizaciones i1 (imatrix) en múltiples niveles de precisión, desde Q2_K hasta Q6_K, con tamanos que van de 7,3 GB a 15,7 GB.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar el modelo base en hardware de consumo mediante llama.cpp, Ollama o otros runtimes compatibles con GGUF, sin necesidad de GPUs de centro de datos. Las cuantizaciones i1 con imatrix suelen proporcionar mejor relación calidad/tamano que las cuantizaciones estáticas equivalentes, especialmente en rangos bajos (IQ2/IQ3). El modelo base está publicado bajo licencia Apache 2.0, lo que facilita uso comercial.

El modelo se describe como conversacional y orientado a inglés, con soporte declarado de visión (el autor indica que los ficheros mmproj, si existen, residen en el repositorio estático). No se dispone de información detallada sobre arquitectura interna, datos de entrenamiento ni benchmarks en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer, inferida del sufijo A3B; detalles internos no disponibles |
| Parametros totales | 18.985.723.008 (~19B) |
| Parametros activos | ~3B (según sufijo A3B; no confirmado en documentación) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): Q2_K, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); pesos originales en safetensors en el repo base |

## Arquitectura y entrenamiento

El modelo base GrootTeam/Groot-19B-A3B-261023 es un transformer de tipo Mixture-of-Experts con ~19B parámetros totales y ~3B activos por token, según indica el sufijo A3B del nombre. Esta configuración permite que cada token active solo una fracción de los expertos, reduciendo el coste de inferencia frente a un modelo denso de tamaño equivalente. No se dispone de información sobre el número de expertos, la estrategia de routing, la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron técnicas de RLHF, DPO o similares.

Las cuantizaciones i1 de mradermacher emplean ficheros imatrix (importance matrix) generados a partir de datos de calibración, lo que mejora la preservación de pesos relevantes en niveles bajos de bits. El autor indica que las cuantizaciones IQ suelen ser preferibles a las K de tamano similar, y que i1-Q4_K_M es la opción recomendada por equilibrio entre velocidad y calidad. Los ficheros mmproj para visión, si existen, se alojan en el repositorio estático hermano (mradermacher/Groot-19B-A3B-261023-GGUF).

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta "conversational" del repositorio.
- Razonamiento y respuesta a instrucciones (capacidad esperada de un modelo base de 19B, no verificada con benchmarks).
- Posible soporte de visión: el autor menciona que es un "vision model" y que los mmproj están en el repo estático; no confirmado en esta ficha.
- Capacidades multilingües limitadas al inglés según la metadata (`language: en`).
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con la librería transformers para el modelo base.
- No se documenta tool calling, function calling, agentes ni modo thinking en la información disponible.

## Casos de uso

- Despliegue local en estación de trabajo con GPU de consumo: usar i1-Q4_K_M (~11,8 GB) en llama.cpp u Ollama permite ejecutar un MoE de 19B con ~3B activos en GPUs de 12-16 GB, manteniendo latencia baja por token.
- Asistente conversacional autoalojado: el modelo está etiquetado como conversacional y en inglés; sirve para prototipos de chatbots internos sin dependencia de APIs externas, con la ventaja de licencia Apache 2.0.
- Generación de texto por lotes en CPU: las cuantizaciones Q2_K/Q3_K_S (7-8,5 GB) caben en RAM de sistemas consumer y permiten throughput aceptable en CPU vía llama.cpp para tareas de resumen o clasificación.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 15 niveles de cuantización, útil para medir el impacto de la precisión en calidad y velocidad en un pipeline propio.
- Investigación sobre MoE con recursos limitados: al activar ~3B por token, permite estudiar comportamiento de modelos MoE grandes en hardware modesto, comparando con densos de 3B.
- Integración en aplicaciones de escritorio o edge: al ser GGUF, se puede empaquetar con llama.cpp en aplicaciones locales (por ejemplo, plugins de editores o herramientas CLI) sin servidor GPU.
- Fine-tuning ligero sobre el modelo base: al disponer de pesos safetensors originales con licencia Apache 2.0, se puede ajustar el base y luego cuantizar de nuevo con imatrix para despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (con overhead de contexto y KV cache, valores orientativos):
  - i1-Q2_K (7,3 GB): ~8-9 GB VRAM.
  - i1-IQ3_M / Q3_K_M (8,7-9,4 GB): ~10-11 GB VRAM.
  - i1-Q4_K_M (11,8 GB): ~13-14 GB VRAM.
  - i1-Q5_K_M (13,7 GB): ~15-16 GB VRAM.
  - i1-Q6_K (15,7 GB): ~17-18 GB VRAM.
- GPU recomendadas: RTX 4090 (24 GB) para Q4-Q6 con contexto amplio; RTX 4080/4070 Ti Super (16 GB) para Q3-Q4; GPUs de 12 GB (RTX 3060 12 GB, 4070) para Q2-Q3. Para A100/H100 no hay problema de capacidad, pero el modelo es pequeño para esas GPUs y el throughput estará limitado por el ancho de banda, no por VRAM.
- ¿Cabe en GPU de consumo? Sí: prácticamente todas las cuantizaciones caben en GPUs de 12-24 GB; las de 8 GB solo admiten Q2_K con contexto reducido o descarga parcial a RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python). vLLM y TGI no son la vía natural para GGUF, aunque pueden servir el modelo base en safetensors.
- Latencia y throughput: no disponibles. Al ser MoE con ~3B activos, se espera throughput superior a un denso de 19B en el mismo hardware, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Groot-19B-A3B-261023 (este, cuantizado) | ~19B / ~3B | no disponible | Apache 2.0 | GGUF (i1) | MoE, inglés, posible visión |
| Qwen1.5-MoE-A2.7B | ~14,3B / ~2,7B | 32k (según docs públicas) | Apache 2.0 | safetensors, GGUF | MoE comparable en activos; contexto documentado |
| Mixtral-8x7B | ~46,7B / ~12,9B | 32k (según docs públicas) | Apache 2.0 | safetensors, GGUF | MoE mayor; más coste de inferencia |
| DeepSeek-V2-Lite | ~15,7B / ~2,4B | 4k-16k (según docs públicas) | MIT (según docs públicas) | safetensors | MoE con activos similares |

Los datos de modelos comparables provienen de documentación pública general y pueden no coincidir exactamente con las versiones más recientes; verificar antes de usar en producción. No hay benchmarks del modelo de esta ficha para comparar rendimiento.

## Limitaciones y advertencias

- Idiomas: metadata declara únicamente inglés; el rendimiento en castellano no está garantizado y probablemente será inferior.
- Visión: el autor menciona que es un modelo de visión, pero los mmproj están en el repositorio estático; esta ficha GGUF por sí sola no incluye necesariamente los pesos de proyección visual. Verificar antes de asumir capacidades multimodales.
- Arquitectura: los detalles de routing MoE, número de expertos y contexto no están documentados en la información disponible; no asumir comportamiento de otros MoE.
- Alucinación: no hay benchmarks ni evaluaciones de fidelidad publicadas; tratar las salidas como no verificadas.
- Sesgos: no documentados; un modelo entrenado principalmente en inglés puede reflejar sesgos culturales y lingüísticos de ese corpus.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar el LICENSE del repo base y cumplir con atribuciones.
- Cuantizaciones bajas (Q2_K, IQ2) degradan calidad de forma notable; el propio autor recomienda IQ3_XXS o superior frente a Q2_K, y Q4_K_M como opción equilibrada.
- Repositorio de 161,4 GB: descargar solo los ficheros necesarios; las cuantizaciones son multi-parte en algunos casos y requieren concatenación según las instrucciones de TheBloke referenciadas.
- Sin pipeline_tag ni resultados de evaluación: no hay garantía de calidad para tareas específicas (código, matemáticas, agentes).

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/mradermacher/Groot-19B-A3B-261023-i1-GGUF
- Modelo base: https://huggingface.co/GrootTeam/Groot-19B-A3B-261023
- Cuantizaciones estáticas (incluye mmproj si existe): https://huggingface.co/mradermacher/Groot-19B-A3B-261023-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Groot-19B-A3B-261023-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Gráfico de comparación de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
