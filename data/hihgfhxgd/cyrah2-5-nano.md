# Hihgfhxgd/cyrah2.5-nano

## Resumen

Cyrah2.5-nano es un modelo de lenguaje de generación de texto entrenado desde cero (sin pesos preentrenados) por el desarrollador Hihgfhxgd bajo el proyecto Cyrah. Con solo 2.852.480 parámetros, implementa la arquitectura Qwen3ForCausalLM (RMSNorm, RoPE, atención con grouped-query attention y activación SwiGLU) y está pensado como checkpoint de investigación, no como asistente de producción. Su interés técnico radica en el proceso de entrenamiento: las pasadas forward y backward se implementaron íntegramente en JavaScript sobre un arena WebAssembly con kernels SIMD escritos en AssemblyScript, sin bucle de entrenamiento en Python.

El modelo se distribuye en dos variantes (Base e Instruct); esta ficha corresponde al checkpoint Instruct, afinado con supervisión sobre conversaciones bilingües (inglés y español) donde solo los tokens del asistente contribuyen a la pérdida. El entrenamiento se realizó en CPU (4 vCPU Intel Haswell, sin GPU) durante unas tres horas, procesando 3.222.921 tokens en 15.000 pasos de optimizador, con una pérdida final de 4,58 (loss reportada de 5,39).

Es relevante ahora como ejemplo reproducible de entrenamiento de un transformer completo en el navegador o en entornos sin acelerador hardware, y como banco de pruebas para técnicas de inferencia en WebAssembly. Su ventana de contexto de 512 tokens y su tamaño lo sitúan en la categoría de modelos experimentales, muy lejos de los asistentes actuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer decoder-only con RMSNorm, RoPE, grouped-query attention y SwiGLU) |
| Parametros totales | 2.852.480 (embeddings atados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés, español |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3ForCausalLM: transformer decoder-only con normalización RMSNorm, codificación posicional rotatoria (RoPE), atención con grouped-query attention y capa feed-forward con activación SwiGLU. El vocabulario es de 16.384 tokens con tokenizador BPE propio de Cyrah2.5 y los embeddings de entrada y salida están atados. La secuencia de entrenamiento fue de 256 tokens (aunque el contexto de inferencia declarado es de 512).

El entrenamiento se realizó desde inicialización aleatoria, sin pesos preentrenados ni fine-tuning sobre modelos existentes. Las pasadas forward y backward están implementadas en JavaScript sobre buffers Float32 en una arena WebAssembly SIMD; las multiplicaciones de matrices usan kernels AssemblyScript escritos a mano (`matmul_nn`, `matmul_nt`, `matmul_tn`), y atención, RMSNorm, RoPE, SwiGLU, entropía cruzada y AdamW operan sobre los mismos buffers. Se procesaron 3.222.921 tokens en 15.000 pasos con batch de una secuencia y sin acumulación de gradientes, a 549,16 tokens/s en 4 vCPU Intel Haswell. El checkpoint Instruct parte del checkpoint Base y aplica SFT sobre el dataset `data/instruct-bilingual` con formato de chat, calculando la pérdida solo sobre los tokens del asistente. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de texto conversacional en inglés y español, con formato de chat mediante `apply_chat_template`.
- Respuesta a instrucciones simples gracias al ajuste supervisado sobre conversaciones bilingües.
- Generación de texto libre con muestreo (temperatura, top-p) mediante la API estándar de transformers.
- Capacidad multilingüe limitada a los dos idiomas del dataset de entrenamiento (inglés y español).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- No se documentan capacidades destacadas de código o matemáticas.

## Casos de uso

- Investigación sobre entrenamiento desde cero: sirve como referencia reproducible para estudiar cómo se comporta un transformer de 2,85 M de parámetros entrenado en CPU con un presupuesto acotado, comparando curvas de pérdida y calidad frente a configuraciones alternativas.
- Experimentación con inferencia en WebAssembly y JavaScript: al haber sido entrenado con un stack WASM/JS, es adecuado para probar pipelines de inferencia en el navegador o en entornos edge sin GPU, validando kernels SIMD y el formato de pesos.
- Docencia y divulgación: su tamaño permite ejecutar el modelo completo en hardware modesto y mostrar de extremo a extremo el ciclo de entrenamiento, tokenización y generación en charlas o cursos.
- Pruebas de integración con transformers y text-generation-inference: útil para validar plantillas de chat, tokenizadores BPE personalizados y flujos de `generate` en entornos de CI sin coste de GPU.
- Generación de texto creativo de baja exigencia en inglés y español: puede producir borradores cortos o continuaciones de texto en contextos donde la calidad no sea crítica y el coste computacional sea prioritario.
- Benchmark de referencia para modelos nano: sirve como línea base mínima en comparativas de eficiencia (tokens/s, pérdida) frente a modelos pequeños preentrenados, para medir la brecha entre entrenamiento desde cero y preentrenamiento a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los únicos datos de rendimiento documentados son de entrenamiento: 549,16 tokens/s en 4 vCPU Intel Haswell sin GPU, 15.000 pasos, 3.222.921 tokens procesados y pérdida final de 4,58 (loss reportada de 5,39). No se proporcionan métricas de inferencia (latencia, throughput) ni evaluaciones en MMLU, HumanEval, GSM8K u otros conjuntos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 11,4 MB en float32 (2.852.480 parámetros × 4 bytes), más el overhead de activaciones y del tokenizador; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; cualquier GPU con al menos 1 GB de memoria es suficiente (RTX 3050, GTX 1650, integradas). Funciona también en CPU.
- Cabe en GPU consumer: sí, en todas las GPU consumer actuales e incluso en sistemas embebidos con suficiente memoria.
- Opciones de despliegue: transformers (Python), text-generation-inference (el modelo declara compatibilidad con endpoints), y potencialmente llama.cpp u Ollama si se generan pesos GGUF (no se documentan conversiones oficiales). El stack nativo del autor es WebAssembly/JavaScript.
- Latencia y throughput estimados: no se han publicado datos de inferencia. Como referencia, el entrenamiento alcanzó 549,16 tokens/s en 4 vCPU; la inferencia en CPU debería ser del mismo orden o superior, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Cyrah2.5-nano (este) | 2,85 M | 512 | Apache-2.0 | Hugging Face | Entrenado desde cero en WASM/JS, bilingüe en/es, sin benchmarks publicados |
| SmolLM-135M (HuggingFaceTB) | 135 M | 2.048 | Apache-2.0 | Hugging Face | Preentrenado a gran escala; ~47× más parámetros; dispone de benchmarks públicos |
| Qwen2.5-0.5B | 494 M | 32.768 | Apache-2.0 | Hugging Face | Preentrenado y afinado; ~173× más parámetros; contexto mucho mayor; benchmarks públicos |
| TinyLlama-1.1B | 1,1 B | 2.048 | Apache-2.0 | Hugging Face | Preentrenado; ~386× más parámetros; benchmarks públicos |

La comparación es asimétrica por diseño: Cyrah2.5-nano es un experimento de entrenamiento desde cero en CPU, no un modelo preentrenado a escala. No se dispone de benchmarks del modelo para comparar calidad de forma directa con las alternativas.

## Limitaciones y advertencias

- Modelo de investigación con 2,85 M de parámetros: puede repetirse, producir errores factuales y desviarse del prompt, tal como advierte el propio autor.
- No es un asistente de producción y no debe usarse para consejos de alto riesgo (médicos, legales, financieros).
- Ventana de contexto de 512 tokens, muy limitada para conversaciones multi-turno o documentos largos; el entrenamiento se realizó además con secuencias de 256 tokens.
- Sesgos conocidos: no documentados, pero al entrenarse sobre un dataset bilingüe acotado (3,2 M de tokens) es probable que herede sesgos y lagunas del corpus; no hay evaluación de sesgos publicada.
- Riesgo de alucinación elevado por el reducido volumen de entrenamiento y la pérdida final alta (4,58).
- Idiomas limitados a inglés y español; no se garantiza calidad en otros idiomas.
- Licencia Apache-2.0: permite uso comercial, pero la calidad del modelo hace desaconsejable su uso en producción sin validación exhaustiva.
- Sin benchmarks públicos ni evaluaciones independientes; el rendimiento real en tareas concretas es desconocido.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay comunidad ni soporte documentado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Hihgfhxgd/cyrah2.5-nano)
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos del proyecto Cyrah.
