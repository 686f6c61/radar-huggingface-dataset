# mradermacher/lil-beastie-4b-i1-GGUF

## Resumen

Esta ficha corresponde a la colección de cuantizaciones GGUF con imatrix (importancia ponderada) del modelo **lil-beastie-4b**, un modelo de 4.022 millones de parámetros (4,02 B) basado en la arquitectura Qwen3, entrenado por LuzCommand y cuantizado por el usuario mradermacher. El modelo base se especializa en razonamiento, calibración de incertidumbre y abstención (es decir, la capacidad de reconocer cuándo no sabe una respuesta y declinar responder), un área de gran interés actual para reducir alucinaciones en sistemas de IA desplegados en producción.

La relevancia de este repositorio no está en el modelo en sí, sino en la oferta de cuantizaciones: mradermacher proporciona más de 20 variantes que van desde IQ1_S (1,2 GB) hasta Q6_K (3,4 GB), todas creadas mediante matrices de importancia (imatrix) para preservar la mayor calidad posible a tamaños reducidos. Esto lo hace especialmente atractivo para ejecución local en hardware modesto, incluidas portátiles sin GPU dedicada, manteniendo la licencia Apache 2.0 del modelo original.

Cabe destacar que el modelo base está orientado a inglés y que el repositorio es una cuantización derivada, no un entrenamiento nuevo. Toda la información sobre capacidades, benchmarks y entrenamiento procede únicamente de los metadatos disponibles; no se ha publicado una model card detallada del modelo base en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3) |
| Parametros totales | 4.022.468.096 (~4,02 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado desde safetensors del modelo base) |

## Arquitectura y entrenamiento

El modelo base, LuzCommand/lil-beastie-4b, se construye sobre la arquitectura de Qwen3, la familia de modelos de Alibaba, con aproximadamente 4.020 millones de parámetros en formato transformer densa. Según los tags de la model card, el entrenamiento del modelo base incide en tres áreas: razonamiento (reasoning), calibración (calibration) e incertidumbre/abstención (uncertainty, abstention). No hay datos disponibles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO.

En cuanto a la cuantización, mradermacher emplea el método de imatrix (matriz de importancia): se calcula una matriz de activaciones sobre un conjunto de calibración y se usa para ponderar la cuantización de cada tensor, lo que reduce notablemente la degradación de calidad frente a cuantizaciones estáticas a niveles bajos de bits. El repositorio incluye además el archivo imatrix (0,1 GB) para que cualquier usuario pueda generar sus propias cuantizaciones ponderadas. Existe también un repositorio hermano con cuantizaciones estáticas (sin imatrix).

## Capacidades

- Generación de texto conversacional (tag `conversational` en la model card).
- Razonamiento (tag `reasoning`), heredado de la base Qwen3.
- Calibración de incertidumbre: el modelo está entrenado para expresar confianza en sus respuestas.
- Abstención: capacidad de negarse a responder cuando no dispone de información suficiente, útil para reducir alucinaciones.
- Compatibilidad con el ecosistema GGUF: llama.cpp, Ollama, LM Studio y derivados.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de visión, audio o multimodalidad: no disponible.
- Capacidades multilingües: el modelo está catalogado solo para inglés; el rendimiento en castellano no está documentado.

## Casos de uso

- **Asistentes locales con conciencia de incertidumbre**: en aplicaciones donde es preferible un "no lo sé" a una respuesta inventada (por ejemplo, consultas médicas o legales de primer nivel), el entrenamiento en abstención del modelo es adecuado para filtrar respuestas de baja confianza antes de escalar a un humano.
- **Inferencia en portátiles y mini-PC**: con cuantizaciones de 1,2 a 2,6 GB, el modelo cabe en equipos sin GPU dedicada (8 GB de RAM o menos en los quants más agresivos), gracias al formato GGUF y a llama.cpp.
- **Prototipado de sistemas RAG con abstención**: integrado en un pipeline de generación aumentada por recuperación, el modelo puede abstenerse cuando los documentos recuperados no responden a la pregunta, mejorando la precisión del sistema final.
- **Investigación en calibración de LLM**: al estar específicamente etiquetado para calibración e incertidumbre, sirve como modelo base ligero para experimentos de evaluación de confianza, expected calibration error (ECE) y detección de alucinaciones.
- **Agentes de razonamiento ligeros en dispositivos edge**: su tamaño de 4 B y los quants IQ4_XS (2,4 GB) permiten desplegar capacidades de razonamiento básico en hardware embebido o móvil mediante llama.cpp.
- **Generación de cuantizaciones personalizadas**: el archivo imatrix incluido permite a desarrolladores crear sus propias variantes ponderadas ajustadas a sus necesidades de tamaño y calidad.
- **Chatbot en inglés para entornos sin conexión**: al ser un modelo conversacional completo y ejecutable 100% local, es apto para asistentes offline donde la privacidad de los datos es crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Tampoco existen comparativas de perplexity para las distintas cuantizaciones más allá del gráfico genérico de ikawrakow sobre calidad de quants de baja bit que enlaza la model card (aplicable a cualquier modelo, no específico de este).

## Requisitos de hardware

- **VRAM/RAM estimada para inferencia**: depende de la cuantización elegida. Aproximadamente: IQ1_S/IQ1_M ~1,5-2 GB; IQ2_XS/IQ2_M ~2-2,5 GB; IQ3_M ~2,5-3 GB; Q4_K_M ~3,5-4 GB; Q6_K ~4-4,5 GB (incluyendo contexto y overhead de KV cache).
- **GPU recomendadas**: cualquier GPU consumer con 4 GB de VRAM o más ejecuta cómodamente los quants Q4_K_M o superiores (RTX 3060, RTX 4060, RTX 4090 con sobra). En CPU pura, basta un equipo con 8 GB de RAM para los quants hasta Q4.
- **Consumer GPU**: sí, cabe holgadamente. Es un modelo de 4 B, uno de los rangos más accesibles; incluso portátiles con iGPU y RAM compartida pueden ejecutar los quants de 1-2 GB.
- **Opciones de despliegue**: llama.cpp (formato nativo GGUF), Ollama, LM Studio, KoboldCpp, y cualquier runtime compatible con GGUF. No es un despliegue típico para vLLM o TGI, orientados a pesos safetensors (aunque vLLM soporta GGUF parcialmente).
- **Latencia y throughput**: no disponible. Al ser un modelo de 4 B cuantizado, se espera una generación fluida en CPU moderna (decenas de tokens/segundo) y muy alta en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Especialización |
|---|---|---|---|---|
| lil-beastie-4b (este repo, cuantizado) | 4,02 B | GGUF (imatrix) | Apache 2.0 | Razonamiento, calibración, abstención |
| Qwen3-4B (base de la familia) | ~4 B | Safetensors, GGUF comunitario | Apache 2.0 | Modelo generalista multilingüe con modo thinking |
| Phi-4-mini (Microsoft) | ~3,8 B | Safetensors, GGUF comunitario | MIT | Razonamiento y matemáticas, modelo generalista compacto |

Nota: la comparativa se basa en modelos de tamaño similar de la familia Qwen3 y de la categoría de pequeños modelos de razonamiento. No hay datos de rendimiento publicados que permitan comparar calidad entre ellos en la información disponible.

## Limitaciones y advertencias

- **Idioma**: el modelo está catalogado únicamente para inglés. No hay garantías de rendimiento en castellano; debe evaluarse antes de usarlo en producción en español.
- **Riesgo de alucinación**: aunque el entrenamiento en abstención y calibración busca mitigarlo, ningún LLM está libre de alucinaciones. No hay datos cuantitativos publicados sobre su tasa de error.
- **Degradación por cuantización**: los quants de 1-2 bits (IQ1_S, IQ1_M, IQ2_XXS) que el propio autor describe como "para desesperados" sufren pérdida de calidad significativa; se recomienda Q4_K_M o IQ4_XS como equilibrio.
- **Falta de documentación del modelo base**: no hay model card detallada con datos de entrenamiento, benchmarks ni limitaciones específicas del modelo original de LuzCommand.
- **Contexto**: la longitud de ventana de contexto no está documentada en la información disponible; debe verificarse en la configuración del modelo antes de diseñar aplicaciones con documentos largos.
- **Licencia**: Apache 2.0 permite uso comercial sin restricciones relevantes, pero conviene revisar los términos de la familia Qwen3 subyacente.
- **Naturaleza del repo**: es una cuantización de terceros (mradermacher), no un modelo oficial; el soporte y las actualizaciones dependen del modelo base original.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/mradermacher/lil-beastie-4b-i1-GGUF
- Modelo base: https://huggingface.co/LuzCommand/lil-beastie-4b
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/lil-beastie-4b-GGUF
- Página de descargas resumida: https://hf.tst.eu/model#lil-beastie-4b-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre tipos de quant: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
