# erenyeager-1/maple-preview

## Resumen

Maple-Preview es un modelo de lenguaje causal de tipo mixture-of-experts (MoE) con pesos ternarios, desarrollado por DeepGrove (publicado en Hugging Face bajo la cuenta `erenyeager-1`) y presentado como un LLM de razonamiento de 20B-A1B: 20.214.030.336 parametros totales y aproximadamente 1.000 millones activos por token. Su propuesta central es ofrecer razonamiento de nivel competitivo (el autor afirma que resuelve problemas de nivel IMO) con un checkpoint de solo 5,31 GB gracias a la cuantizacion ternaria de los pesos, lo que permite inferencia en dispositivos de consumo.

La arquitectura combina 24 capas con 256 expertos (8 activos por token) y una atencion hibrida con patron 3:1 entre sliding window attention de 512 tokens y atencion global, con una ventana de contexto de 131.072 tokens. El modelo esta disenado desde el inicio para inferencia eficiente en local; el autor reporta 218 tokens/s en un Mac mini M4 mediante un runtime on-device propio, aunque la implementacion incluida en Transformers depende de Triton y FlashAttention y esta pensada para entornos CUDA compatibles.

Es relevante ahora porque se posiciona en la frontera de Pareto entre memoria/velocidad y rendimiento para su clase de pesos, y porque su licencia MIT facilita el uso comercial. No obstante, se trata de una preview centrada en razonamiento bruto, con post-entrenamiento minimo para tareas agenticas y sin descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal MoE con pesos ternarios; 24 capas, 256 expertos (8 activos); atencion hibrida 3:1 SWA-512:GA |
| Parametros totales | 20.214.030.336 (20B) |
| Parametros activos | Aproximadamente 1B (denominacion 20B-A1B) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | Pesos ternarios nativos; checkpoint de 5,31 GB; no se detallan otras variantes (GGUF, etc.) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 40,4 GB; checkpoint ternario de 5,31 GB) |

## Arquitectura y entrenamiento

Maple-Preview es un transformer causal con capas de mezcla de expertos: 24 capas, 256 expertos por capa y 8 expertos activos por token, lo que da lugar a la denominacion 20B-A1B (20B totales, ~1B activos). La atencion es hibrida con una proporcion 3:1 entre sliding window attention de 512 tokens y atencion global, un diseno habitual para reducir coste computacional y de memoria en contextos largos manteniendo capacidad de recuperacion global. Los pesos son ternarios, lo que explica que un modelo de 20B totales quepa en un checkpoint de 5,31 GB.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni el detalle de las fases de RLHF/DPO o RL. La model card indica que la preview recibio post-entrenamiento minimo para tareas agenticas y solo un RL general a pequena escala. La implementacion en Transformers requiere Triton y FlashAttention y esta orientada a CUDA; el resultado en Apple Silicon se obtuvo con un runtime on-device separado no incluido en el repositorio.

## Capacidades

- Generacion de texto y razonamiento: el autor declara rendimiento SOTA en su clase de pesos y capacidad para resolver problemas de nivel IMO.
- Razonamiento matematico y cientifico: evaluado en AIME 2026, HMMT 2026 y GPQA-D segun la model card.
- Generacion de codigo: evaluado en LCBv6 (LiveCodeBench v6).
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Tool calling / function calling: no documentado; la model card advierte bajo rendimiento en benchmarks agenticos.
- Agentes y razonamiento multi-paso: soporte no confirmado; el post-entrenamiento agentico es minimo.
- Eficiencia on-device: disenado para inferencia local con pesos ternarios y 218 tok/s reportados en Mac mini M4.
- Contexto largo: ventana de 131.072 tokens con atencion hibrida SWA/global.

## Casos de uso

- Razonamiento matematico asistido: resolucion de problemas de competicion (estilo AIME/IMO) en entornos educativos o de investigacion, aprovechando el enfasis del modelo en razonamiento bruto y su contexto de 131.072 tokens para problemas con enunciados largos.
- Inferencia local en estaciones de trabajo: despliegue en equipos sin GPU de datacenter gracias al checkpoint ternario de 5,31 GB, adecuado para prototipado y pruebas offline.
- Generacion de codigo en pipelines de desarrollo: uso en tareas de sintesis y revision de codigo evaluadas en LCBv6, integrable en herramientas de asistencia al programador, aunque sin garantias documentadas de tool calling.
- Analisis de documentos tecnicos largos: la ventana de 131.072 tokens permite procesar informes, papers o bases de codigo extensas en una sola pasada.
- Experimentacion en investigacion sobre cuantizacion ternaria y MoE: el modelo sirve como referencia abierta (MIT) para estudiar el equilibrio entre precision de pesos y calidad de razonamiento.
- Evaluacion comparativa de eficiencia: util como baseline en estudios de velocidad/memoria frente a modelos densos de tamano similar, dado el dato reportado de 218 tok/s en Mac mini M4.
- Despliegue comercial con licencia permisiva: la licencia MIT facilita integrar el modelo en productos propietarios, sujeto a las limitaciones de idioma (solo ingles) y de robustez agentica.

## Benchmarks y rendimiento

La model card menciona evaluaciones en LCBv6, AIME 2026, HMMT 2026 y GPQA-D, y afirma competitividad con modelos mayores, pero los resultados numericos estan en imagenes (`assets/05-benchmark-scores-table.png`) no incluidas en la informacion proporcionada.

No se han publicado resultados de benchmarks en la informacion disponible.

Datos de rendimiento reportados por el autor (no verificables con la informacion disponible):

| Metrica | Valor reportado |
|---|---|
| Throughput en Mac mini M4 | 218 tokens/s |
| Comparativa de velocidad | 5-16x mas rapido que Gemma 4, Qwen3.5 y gpt-oss (segun el autor) |
| Tamano del checkpoint | 5,31 GB |

## Requisitos de hardware

- VRAM estimada: el checkpoint ternario ocupa 5,31 GB, por lo que la inferencia requiere al menos ~6-8 GB de memoria considerando overhead de runtime y cache KV; el repo completo en safetensors ocupa 40,4 GB.
- GPU recomendadas: no especificadas por el autor. La implementacion en Transformers requiere entorno CUDA compatible con Triton y FlashAttention (por ejemplo, A100, H100 o RTX 4090), aunque no se detallan requisitos minimos.
- Consumer GPU: el tamano del checkpoint sugiere que cabe en GPUs de consumo con 8 GB o mas, si bien no hay confirmacion oficial ni instrucciones de despliegue para ellas.
- Apple Silicon: el autor reporta 218 tok/s en un Mac mini M4 mediante un runtime on-device propio, no incluido en el repositorio.
- Opciones de despliegue: Transformers con Triton y FlashAttention (CUDA). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 218 tok/s en Mac mini M4 segun el autor; sin datos para GPU.

## Comparativa con modelos similares

El autor compara explicitamente con Gemma 4, Qwen3.5 y gpt-oss en velocidad, pero no se dispone de sus especificaciones ni resultados en la informacion proporcionada para elaborar una tabla rigurosa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Maple-Preview | 20B totales / ~1B activos | 131.072 | MIT | Hugging Face | Pesos ternarios, checkpoint 5,31 GB |
| Gemma 4 | no disponible | no disponible | no disponible | no disponible | Citado por el autor como referencia de velocidad |
| Qwen3.5 | no disponible | no disponible | no disponible | no disponible | Citado por el autor como referencia de velocidad |
| gpt-oss | no disponible | no disponible | no disponible | no disponible | Citado por el autor como referencia de velocidad |

## Limitaciones y advertencias

- Modelo preview: post-entrenamiento minimo para tareas agenticas y RL general a pequena escala; el autor reconoce posible bajo rendimiento en benchmarks agenticos.
- Solo ingles: el campo `language` declara unicamente `en`; no hay soporte multilingue documentado.
- Riesgo de alucinacion: no se documentan tasas de alucinacion ni evaluaciones de factualidad; como LLM generativo, el riesgo persiste, especialmente fuera de dominios matematicos y cientificos.
- Pesos ternarios: la cuantizacion agresiva puede degradar tareas que requieren precision fina; no se publican comparativas frente a versiones de mayor precision.
- Tool calling y agentes: no documentados; no recomendable para pipelines agenticos en produccion sin validacion propia.
- Dependencias de runtime: la implementacion en Transformers requiere Triton y FlashAttention en CUDA; el rendimiento en Apple Silicon depende de un runtime no incluido.
- Madurez del proyecto: 0 descargas y 0 likes en el momento de la consulta; sin validacion independiente de los resultados declarados.
- Licencia MIT: permisiva para uso comercial, pero conviene verificar el archivo LICENSE del repositorio y las dependencias de codigo personalizado (`custom_code`).

## Enlaces

- Hugging Face: https://huggingface.co/erenyeager-1/maple-preview
- Licencia MIT del repositorio: https://huggingface.co/erenyeager-1/maple-preview/blob/main/LICENSE
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios adicionales ni demos.
