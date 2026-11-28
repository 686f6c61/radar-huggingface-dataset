# mradermacher/Qwen3.6-35B-A3B-Brainwaves-Nex-i1-GGUF

## Resumen

Qwen3.6-35B-A3B-Brainwaves-Nex-i1-GGUF es una recopilación de cuantizaciones GGUF generadas por mradermacher a partir del modelo nightmedia/Qwen3.6-35B-A3B-Brainwaves-Nex, un fine-tune experimental de la familia Qwen 3.6 con arquitectura Mixture-of-Experts (MoE) de 35.505.251.456 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token (de ahí el sufijo A3B). El modelo base combina técnicas de destilación de cadenas de razonamiento largas (long-CoT), SFT, LoRA y merge de modelos mediante mergekit, orientado a tareas de razonamiento, matemáticas, STEM y código.

La relevancia de esta ficha radica en que el repositorio de mradermacher ofrece cuantizaciones con calibración imatrix (denominadas i1) en un rango amplio de tipos: desde Q2_K (13,3 GB) hasta Q6_K (29,3 GB), además de un fichero imatrix independiente de 0,3 GB para generar cuantizaciones propias. Esto permite desplegar un modelo de 35B con activación dispersa en hardware de consumo, algo inviable con los pesos completos en safetensors.

El modelo se distribuye bajo licencia Apache 2.0, declara soporte para inglés, chino, japonés y español, y está etiquetado como modelo de visión (los ficheros mmproj, si existen, se alojan en el repositorio estático del mismo autor). El repositorio acumula 1341 descargas y 2 likes, con última actualización el 26 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), familia Qwen 3.6; fine-tune con destilación, SFT, LoRA y merge (mergekit) |
| Parametros totales | 35.505.251.456 |
| Parametros activos | Aproximadamente 3.000 millones (según el sufijo A3B; no se detalla el reparto exacto de expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; fichero imatrix independiente |
| Idiomas soportados | en, zh, ja, es |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); pesos originales en safetensors en el repositorio base |

## Arquitectura y entrenamiento

El modelo base es un transformer con capas Mixture-of-Experts de la familia Qwen 3.6, con 35.505 millones de parámetros totales y un subconjunto activo de aproximadamente 3.000 millones por token. El proceso de construcción descrito en las etiquetas incluye destilación de cadenas de razonamiento largas (long-CoT), ajuste supervisado (SFT), adaptadores LoRA, ajuste por instrucciones y una fase de merge de modelos mediante mergekit, con referencias a los identificadores "fable" y "Deckard(qx)". No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

Las cuantizaciones de este repositorio se generan con calibración imatrix (i1), un método que ajusta los pesos cuantizados a partir de estadísticas de activación recogidas sobre un corpus de calibración, lo que mejora la perplejidad frente a cuantizaciones estáticas del mismo tamaño. El autor indica que las cuantizaciones IQ suelen ser preferibles a las no-IQ de tamaño similar y que i1-Q4_K_S ofrece el mejor equilibrio tamaño/velocidad/calidad. También se distribuye un fichero imatrix de 0,3 GB para que terceros generen sus propias cuantizaciones. El modelo está etiquetado como experimental y como modelo de visión, con los ficheros mmproj alojados en el repositorio estático del autor.

## Capacidades

- Generación de texto conversacional multi-turno con ajuste por instrucciones.
- Razonamiento explícito con cadenas de pensamiento largas (long-CoT) y modo de razonamiento destilado.
- Matemáticas y tareas STEM, según las etiquetas del modelo (math, stem, research).
- Generación y asistencia de código (tag coding).
- Capacidad multimodal de visión declarada por el autor, con ficheros mmproj en el repositorio estático; no se detallan las capacidades visuales concretas.
- Multilingüe: inglés, chino, japonés y español declarados.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita; el modo long-CoT es compatible con flujos multi-paso, pero no se documenta un protocolo de agente.

## Casos de uso

- Asistente de razonamiento técnico en local: con la cuantización i1-Q4_K_M (21,8 GB) el modelo cabe en una GPU de 24 GB y permite resolver problemas de matemáticas y STEM con cadenas de pensamiento largas sin depender de APIs externas.
- Generación de código en pipelines de desarrollo: la variante i1-Q4_K_S (20,5 GB) permite integrar el modelo en un servidor de inferencia local para autocompletado, revisión y explicación de código, manteniendo los datos del repositorio dentro de la infraestructura propia.
- Atención al cliente multilingüe: el soporte declarado de inglés, chino, japonés y español permite desplegar un asistente conversacional único para mercados de Asia Oriental y España, con la cuantización i1-Q5_K_M (25,4 GB) para mayor fidelidad.
- Análisis de documentos con componente visual: al estar etiquetado como modelo de visión, puede emplearse junto con los ficheros mmproj para extraer información de capturas, diagramas o documentos escaneados en flujos de back office.
- Investigación sobre destilación de razonamiento: el modelo es un caso de estudio de la combinación de long-CoT, SFT, LoRA y merge, útil para experimentar con la transferencia de capacidades de razonamiento entre modelos.
- Prototipado en estaciones de trabajo con GPU de consumo: las cuantizaciones i1-IQ3_M (15,9 GB) e i1-IQ4_XS (19,3 GB) permiten ejecutar el modelo en GPUs de 16-24 GB para pruebas de concepto y evaluación de calidad antes de escalar a hardware mayor.
- Generación de cuantizaciones propias: el fichero imatrix de 0,3 GB permite a equipos de infraestructura producir variantes GGUF ajustadas a su corpus específico con llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: i1-Q2_K 13,3 GB; i1-IQ3_S 15,7 GB; i1-IQ3_M 15,9 GB; i1-Q3_K_M 17,3 GB; i1-Q3_K_L 18,7 GB; i1-IQ4_XS 19,3 GB; i1-Q4_K_S 20,5 GB; i1-Q4_K_M 21,8 GB; i1-Q5_K_M 25,4 GB; i1-Q6_K 29,3 GB. Añadir margen para la caché KV según la longitud de contexto efectiva.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para i1-Q4_K_M; A100 40 GB, H100 80 GB o L40S 48 GB para i1-Q5_K_M e i1-Q6_K con contexto amplio.
- Cabe en GPU de consumo: sí, en GPUs de 16 GB con i1-IQ3_S o i1-IQ3_M, y en GPUs de 24 GB con i1-Q4_K_M. Las variantes de 13-16 GB pueden requerir offload parcial a CPU en GPUs de 12 GB.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, llama-cpp-python), así como servidores compatibles con GGUF. El repositorio declara endpoints_compatible y librería transformers para los pesos base.
- Latencia y throughput: no disponibles. Al ser un modelo MoE con aproximadamente 3.000 millones de parámetros activos, el coste por token es inferior al de un modelo denso de 35B, pero no se publican cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Brainwaves-Nex (este) | 35,5B | ~3B (A3B) | no disponible | Apache 2.0 | GGUF i1, safetensors (base) |
| Qwen3-30B-A3B | 30,5B | ~3B | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF |
| Qwen3-32B (denso) | 32,8B | 32,8B | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF |
| Mixtral 8x7B | 46,7B | ~12,9B | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF |

La comparación se limita a parámetros, licencia y disponibilidad de formatos porque no hay datos de benchmarks publicados para este modelo. Frente a un denso de 32B, el coste de inferencia por token es notablemente menor gracias a la activación de aproximadamente 3.000 millones de parámetros, a cambio de un mayor consumo de memoria total (35,5B almacenados frente a 32,8B).

## Limitaciones y advertencias

- Modelo etiquetado como experimental: el proceso de merge y destilación puede producir comportamientos inestables o inconsistentes fuera de los dominios evaluados.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad ni de tasa de alucinación; el modo long-CoT puede generar cadenas de razonamiento plausibles pero incorrectas.
- Sesgos conocidos: no documentados en la información disponible; al derivar de Qwen 3.6 y de un merge de modelos, hereda los sesgos de sus componentes, que no se detallan.
- Limitaciones de contexto: la longitud de contexto no está especificada; debe verificarse en la configuración del GGUF antes de desplegarlo en producción con documentos largos.
- Idiomas: solo se declaran en, zh, ja y es; el rendimiento en otros idiomas no está garantizado.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y los componentes del merge pueden arrastrar obligaciones adicionales que conviene revisar en el repositorio de nightmedia.
- Las cuantizaciones de baja precisión (Q2_K, IQ3) degradan la calidad; para producción se recomienda i1-Q4_K_M o superior.
- El repositorio ocupa 279,2 GB en total; la descarga selectiva de un único fichero GGUF es imprescindible para un uso práctico.
- No se documentan capacidades de tool calling ni protocolos de agente; no asumir su disponibilidad sin validación previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Brainwaves-Nex-i1-GGUF
- Modelo base: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-Brainwaves-Nex
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Brainwaves-Nex-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.6-35B-A3B-Brainwaves-Nex-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
