# Ful3/Dark-Scarlett-v1.0-31B-W4A16-multilingual

## Resumen

Dark-Scarlett-v1.0-31B-W4A16-multilingual es una cuantización de 4 bits (GPTQ, solo pesos, W4A16, group size 32) del modelo ReadyArt/Dark-Scarlett-v1.0-31B, descrito en su model card como un Gemma 4 de 31B. La publica el usuario Ful3 y está generada con llm-compressor, la herramienta de compresión del ecosistema vLLM. El objetivo es reducir el espacio en disco y la VRAM necesarios para servir el modelo en vLLM sin degradar de forma apreciable la calidad conversacional.

Su rasgo diferencial no es la cuantización en sí, sino el proceso de calibración multilingüe: el GPTQ se calibró sobre 320 conversaciones de 4096 tokens, de las cuales 96 son roleplay en inglés y 224 son conversaciones de roleplay auto-generadas por el propio modelo en BF16 en español, alemán, italiano, francés, coreano y japonés (28 cada uno), checo (20) y polaco, portugués y ruso (12 cada uno). El autor indica que una calibración solo en inglés con la misma receta filtraba palabras en inglés a otros idiomas y eliminaba los acentos del español, mientras que esta versión no lo hace.

El repositorio ocupa aproximadamente 20 GiB y, según la model card, permite mantener dos secuencias de 32k tokens en una tarjeta de 32 GB. Las proyecciones de atención y MLP están en 4 bits, mientras que los embeddings, el lm_head y la torre de visión se mantienen en BF16. Es un modelo recién publicado, sin descargas ni valoraciones, y sin resultados de benchmarks publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; el modelo base se identifica como Gemma 4 31B (transformer, presumiblemente multimodal por la presencia de torre de visión) |
| Parámetros totales | 6.562.410.852 según la metadata de safetensors del repositorio; la denominación del modelo indica 31B (discrepancia no aclarada en la información disponible) |
| Longitud de contexto | No disponible; la model card menciona secuencias de 32k tokens como referencia de memoria ("fits two 32k sequences on a 32 GB card") |
| Tipos de cuantización | GPTQ W4A16 (4 bits, weight-only), group size 32; embeddings, lm_head y torre de visión en BF16 sin cuantizar |
| Idiomas soportados | Calibrado para inglés, español, alemán, italiano, francés, coreano, japonés, checo, polaco, portugués y ruso |
| Licencia | No especificada en el repositorio; la model card indica que se rigen los términos del modelo base (términos de Gemma) |
| Formato de pesos | safetensors con compressed-tensors (GPTQ), librería vLLM |
| Tamaño en disco | ~20 GiB (tamaño del repositorio reportado: 20,5 GB) |
| Pipeline | No disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-20 |

## Arquitectura y entrenamiento

No hay información en el material proporcionado sobre el número de tokens de preentrenamiento, la composición del dataset del modelo base, ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineamiento. Lo que se describe es el procedimiento de cuantización: cuantización de solo pesos GPTQ a 4 bits con group size 32 aplicada a las proyecciones de atención y MLP, dejando embeddings, lm_head y torre de visión en BF16. La herramienta utilizada es llm-compressor y el formato de salida son safetensors compatibles con compressed-tensors y vLLM.

La innovación destacable es la calibración multilingüe. El conjunto de calibración consta de 320 conversaciones de 4096 tokens: 96 conversaciones de roleplay en inglés y 224 conversaciones de roleplay de auto-juego (self-play) generadas por el propio modelo en BF16 en once idiomas. Según el autor, una calibración equivalente solo en inglés introducía fugas de palabras en inglés en otros idiomas y degradaba los acentos del español. En una comprobación de 92 respuestas de chat de compañía en 8 idiomas, esta versión iguala al modelo BF16 en ausencia de fugas de inglés y de respuestas degeneradas. No se documentan innovaciones arquitectónicas propias (decodificación especulativa, atención lineal u otras) más allá del propio proceso de cuantización.

## Capacidades

- Generación de texto conversacional multi-turno en los idiomas de calibración.
- Capacidad multilingüe verificada por el autor en 8 idiomas mediante una prueba de 92 respuestas (sin fugas de inglés ni respuestas degeneradas).
- Uso orientado a roleplay y chat de compañía, ya que ese es el dominio de las conversaciones de calibración.
- Presencia de torre de visión en el repositorio, mantenida en BF16 sin cuantizar; la model card no documenta qué tareas de visión soporta ni con qué calidad.
- Ejecución en vLLM con la opción `--language-model-only`, que permite desactivar la parte de lenguaje multimodal.
- Compatibilidad de KV cache en fp8 mediante `--kv-cache-dtype fp8`.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo thinking explícito: no documentado.
- Rendimiento en código, matemáticas o razonamiento formal: no documentado.

## Casos de uso

- Chat de compañía y roleplay multilingüe: es el escenario para el que se calibró el modelo; las 320 conversaciones de calibración son de roleplay, y el autor reporta paridad con el BF16 en una prueba de 92 respuestas en 8 idiomas.
- Atención al cliente en varios idiomas: el modelo cubre once idiomas con un único despliegue, lo que evita mantener instancias separadas para español, alemán, italiano, francés, polaco, portugués, ruso, checo, coreano y japonés.
- Asistencia lingüística y traducción entre los idiomas calibrados: la calibración específica evita las fugas de inglés y la pérdida de acentos que el autor observó en la versión calibrada solo en inglés.
- Despliegue económico en una GPU de 32 GB: con ~20 GiB de pesos en disco y KV cache en fp8, la model card afirma que caben dos secuencias de 32k tokens en una tarjeta de 32 GB, lo que permite servir el modelo en hardware de una sola GPU.
- Inferencia por lotes (batch) en pipelines de generación de contenido: vLLM ofrece gestión de memoria de KV cache y batching continuo, adecuado para procesar grandes volúmenes de conversaciones fuera de línea.
- Evaluación comparativa de cuantización: sirve como referencia para medir la pérdida de calidad de una cuantización W4A16 con group size 32 frente al modelo BF16 en tareas conversacionales multilingües.
- Prototipado de asistentes en idiomas con menos recursos o menos cubiertos por otras recetas de cuantización (checo, polaco, coreano, japonés), donde las calibraciones solo en inglés tienden a degradar más.
- Experimentación con la torre de visión sin cuantizar: al mantenerse en BF16, permite explorar entrada de imágenes, aunque el autor no documenta capacidades de visión concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única evidencia de rendimiento aportada por el autor es cualitativa: en una comprobación de 92 respuestas de chat de compañía en 8 idiomas, el modelo cuantizado iguala al BF16 (sin fugas de inglés y sin respuestas degeneradas). No se proporcionan puntuaciones de MMLU, HumanEval, GSM8K ni de ninguna otra suite.

## Requisitos de hardware

- VRAM estimada para inferencia: ~20 GiB de pesos en disco; la model card indica que cabe en una tarjeta de 32 GB con dos secuencias de 32k tokens usando KV cache en fp8.
- GPU recomendadas: tarjetas con 32 GB o más de VRAM (por ejemplo, V100 32 GB, A100 40 GB, A100 80 GB, H100, L40S 48 GB). Para uso con menos memoria, no hay datos confirmados en la información disponible.
- GPU de consumo: encajaría en tarjetas de 32 GB como la RTX 5090; en tarjetas de 24 GB como la RTX 4090 el ajuste es dudoso con secuencias largas, aunque no hay confirmación en la información disponible.
- Opciones de despliegue: vLLM es la vía documentada (`vllm serve <repo> --language-model-only --kv-cache-dtype fp8`), con pesos en compressed-tensors/GPTQ. No se mencionan builds GGUF, por lo que llama.cpp u Ollama no están soportados por estos pesos tal como se publican. No se documenta compatibilidad con TGI.
- Latencia y throughput: no disponibles. No hay cifras de tokens por segundo ni de latencia por petición en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ful3/Dark-Scarlett-v1.0-31B-W4A16-multilingual | 6.562.410.852 según safetensors (denominado 31B) | No disponible (referencia de 32k en la model card) | W4A16 GPTQ, group size 32, ~20 GiB en disco | Términos de Gemma (según la model card) | HuggingFace, librería vLLM, 0 descargas |
| ReadyArt/Dark-Scarlett-v1.0-31B (base, BF16) | No disponible | No disponible | BF16 (sin cuantizar) | Términos de Gemma (según la model card del derivado) | HuggingFace |
| Otras cuantizaciones W4A16 de modelos de ~31B | No disponible | No disponible | W4A16 GPTQ | No disponible | No disponible en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de terceros que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia no declarada explícitamente en el repositorio: la model card remite a los términos del modelo base (Gemma), por lo que debe verificarse la licencia de ReadyArt/Dark-Scarlett-v1.0-31B antes de cualquier uso comercial.
- Repositorio sin adopción: 0 descargas y 0 likes, lo que implica ausencia de validación independiente.
- Sin benchmarks publicados: no hay evidencia cuantitativa de la degradación introducida por la cuantización a 4 bits.
- Discrepancia en el recuento de parámetros: la metadata de safetensors indica 6.562.410.852 parámetros frente a los 31B que sugiere el nombre; la información disponible no aclara el motivo.
- Riesgo de alucinación: inherente a los modelos generativos de lenguaje; no se documentan medidas de mitigación ni tasas de error.
- Sesgos: no disponibles. No se documenta la composición del dataset de preentrenamiento del modelo base ni filtros de sesgo.
- Limitaciones de idioma: la calibración cubre once idiomas, pero no se documenta el comportamiento fuera de ese conjunto ni la calidad relativa entre idiomas.
- Degradación típica de la cuantización: el uso de 4 bits con group size 32 en atención y MLP puede afectar tareas sensibles a la precisión; el autor solo verifica calidad en chat de compañía, no en razonamiento o código.
- Riesgo de fuga de inglés: aunque el autor afirma haberlo resuelto con la calibración multilingüe, es un modo de fallo documentado en la receta alternativa y conviene monitorizarlo en producción.
- Contexto no confirmado: la única referencia es una mención a secuencias de 32k en la model card, no una especificación formal de la ventana de contexto máxima.
- Dependencia de vLLM: los pesos están en compressed-tensors/GPTQ y no se ofrecen alternativas GGUF, lo que limita el despliegue a entornos compatibles con vLLM.
- La torre de visión se mantiene en BF16 y consume memoria adicional; hay que usar `--language-model-only` si no se necesita.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ful3/Dark-Scarlett-v1.0-31B-W4A16-multilingual
- Modelo base: https://huggingface.co/ReadyArt/Dark-Scarlett-v1.0-31B
- llm-compressor (herramienta de cuantización citada en la model card): https://github.com/vllm-project/llm-compressor
- Documentación de vLLM (librería indicada en el repositorio): https://docs.vllm.ai
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: los enlaces obtenidos (知乎, dafont.com, 52pojie.cn) no guardan relación con el modelo ni con su ecosistema.
