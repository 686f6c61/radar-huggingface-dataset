# mradermacher/FNova-1.7B-Chat-v1-i1-GGUF

## Resumen

FNova-1.7B-Chat-v1 es un modelo de lenguaje conversacional de 1.720 millones de parámetros desarrollado por Fengnan001 sobre la arquitectura Qwen3, entrenado mediante continued pretraining, SFT, GRPO y destilación on-policy. La ficha que se presenta aquí corresponde a la versión cuantizada en GGUF publicada por mradermacher, un cuantizador conocido en la comunidad de Hugging Face que ofrece versiones imatrix (weighted/imatrix) del modelo con más de veinte niveles de cuantización distintos.

El problema que resuelve esta versión es la ejecución del modelo en hardware modesto: las cuantizaciones GGUF permiten correr un modelo de 1,7B de parámetros desde archivos de apenas 0,6 GB (IQ1_S) hasta 1,5 GB (Q6_K), haciéndolo viable en portátiles, CPUs y GPUs de consumo. El modelo base está orientado a chat en chino e inglés, y su licencia Apache 2.0 lo hace apto para uso comercial sin restricciones relevantes.

Su relevancia actual radica en la tendencia hacia modelos pequeños especializados: con técnicas como GRPO (Group Relative Policy Optimization) y destilación on-policy, modelos de este tamaño buscan ofrecer razonamiento y capacidad conversacional competitiva con una huella de recursos mínima, siendo ideales para despliegues edge y prototipado local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer decoder) |
| Parametros totales | 1.720.574.976 (~1,7B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (esta versión); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base, Fengnan001/FNova-1.7B-Chat-v1, parte de la arquitectura Qwen3 de 1,7B de parámetros, una familia de transformers decoder-only de Alibaba. Sobre esa base se aplicó un pipeline de entrenamiento que incluye continued pretraining, supervised fine-tuning (SFT), GRPO (una variante de aprendizaje por refuerzo para alineación) y on-policy distillation, según los tags del repositorio. No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni la longitud de contexto resultante.

La versión aquí fichada no modifica el modelo: mradermacher genera cuantizaciones GGUF con matriz de importancia (imatrix), una técnica de calibración que pondera la cuantización según la activación real de los tensores, mejorando la calidad frente a cuantizaciones estáticas a igual tamaño. El propio autor señala que los quants IQ suelen ser preferibles a los K-quants de tamaño similar.

## Capacidades

- Generación de texto conversacional multi-turno (tag `conversational`, pipeline de chat).
- Soporte de chino e inglés como idiomas principales de entrenamiento.
- Entrenamiento con GRPO y destilación on-policy, orientado a mejorar razonamiento y calidad de respuesta.
- Compatibilidad con el ecosistema GGUF: llama.cpp, Ollama, LM Studio y derivados.
- Compatibilidad con vLLM en el modelo base (tag `vllm`).
- No hay información publicada sobre tool calling, visión, audio ni modo de pensamiento explícito.

## Casos de uso

- **Asistentes locales en dispositivos de recursos limitados**: con cuantizaciones de 1,1-1,2 GB (IQ4_XS, Q4_K_M) el modelo cabe en portátiles sin GPU dedicada, útil para chatbots offline.
- **Prototipado rápido de agentes conversacionales**: su tamaño reducido permite iterar prompts y pipelines de chat en local con latencias bajas antes de escalar a modelos mayores.
- **Aplicaciones bilingües chino-inglés**: adecuado para productos que necesiten soporte básico en ambos idiomas con un único modelo pequeño.
- **Inferencia en CPU**: los GGUF de llama.cpp permiten servir el modelo en servidores sin GPU, reduciendo coste de infraestructura para cargas de tráfico bajo.
- **Investigación en cuantización**: el archivo imatrix de 0,1 GB permite a investigadores generar sus propias cuantizaciones y comparar calidad entre niveles.
- **Integración en apps móviles o edge**: cuantizaciones IQ1/IQ2 de 0,6-0,8 GB son viables en dispositivos con memoria muy limitada, aceptando pérdida de calidad.
- **Fine-tuning posterior de bajo coste**: al partir de Qwen3-1.7B, es una base ligera para especialización adicional en dominios concretos (el modelo original ya incluye continued pretraining y SFT).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM/RAM estimada para inferencia**: aproximadamente el tamaño del archivo elegido más overhead del runtime; en la práctica, entre 1 y 2 GB de RAM para los quants más usados (Q4_K_M, 1,2 GB) y menos de 1 GB para IQ1_S/IQ1_M (0,6 GB).
- **GPU recomendadas**: no requiere GPU; cualquier GPU de consumo (RTX 3060, RTX 4060, RTX 4090) lo ejecuta con holgura. En CPU moderna el rendimiento es aceptable por su tamaño.
- **Cabe en consumer GPU**: sí, en prácticamente cualquier GPU con 2 GB o más de VRAM, incluso en iGPU compartidas.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF; el modelo base admite además vLLM y transformers.
- **Latencia y throughput**: no disponible; dada la cuantización y el tamaño (1,7B), se espera latencia baja y throughput alto incluso en hardware modesto, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Contexto |
|---|---|---|---|---|
| FNova-1.7B-Chat-v1 (base) | 1,72B | safetensors, GGUF | Apache 2.0 | no disponible |
| Qwen3-1.7B (base original) | ~1,7B | safetensors, GGUF | Apache 2.0 | no disponible (32K aprox. en la familia Qwen3) |
| Llama 3.2 1B Instruct | ~1,2B | safetensors, GGUF | Licencia Llama 3.2 | 128K |
| Gemma 2 2B Instruct | ~2,6B | safetensors, GGUF | Gemma Terms of Use | 8K |

FNova-1.7B se diferencia de Qwen3-1.7B por su post-entrenamiento adicional (SFT, GRPO, destilación on-policy) y de Llama 3.2 1B por su licencia más permisiva (Apache 2.0 frente a la licencia comunitaria de Meta). Frente a Gemma 2 2B ofrece menor consumo de memoria y licencia sin restricciones de uso.

## Limitaciones y advertencias

- No hay datos de benchmarks públicos, por lo que la calidad real del post-entrenamiento (GRPO, destilación) no puede verificarse con cifras; conviene evaluarlo antes de producción.
- Cuantizaciones extremas (IQ1_S, IQ1_M, IQ2_XXS) degradan notablemente la calidad; el propio autor las marca como "for the desperate". Se recomienda Q4_K_M o IQ4_XS como punto de equilibrio.
- Soporte de idiomas limitado a chino e inglés; el rendimiento en castellano no está documentado y probablemente sea inferior al de modelos multilingües amplios.
- Longitud de contexto no publicada: no es posible garantizar ventanas largas para RAG o documentos extensos sin verificación previa.
- Al ser un modelo de 1,7B, es susceptible a alucinaciones y errores de razonamiento, especialmente en matemáticas y código complejo.
- No hay información sobre tool calling ni capacidades de agente; no debe asumirse soporte de function calling.
- La licencia Apache 2.0 no impone restricciones comerciales, pero el modelo hereda los sesgos de Qwen3 y de sus datos de entrenamiento, no documentados públicamente.
- Es una cuantización de terceros (mradermacher); cualquier bug de conversión debe reportarse al cuantizador, no al autor del modelo base.

## Enlaces

- Modelo cuantizado (esta ficha): https://huggingface.co/mradermacher/FNova-1.7B-Chat-v1-i1-GGUF
- Modelo base: https://huggingface.co/Fengnan001/FNova-1.7B-Chat-v1
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/FNova-1.7B-Chat-v1-GGUF
- Página de descarga resumida: https://hf.tst.eu/model#FNova-1.7B-Chat-v1-i1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre calidad de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
- Paper o blog del modelo base: no disponible
