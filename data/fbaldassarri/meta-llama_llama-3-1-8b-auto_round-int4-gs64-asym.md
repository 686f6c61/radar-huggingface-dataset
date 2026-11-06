# fbaldassarri/meta-llama_Llama-3.1-8B-auto_round-int4-gs64-asym

## Resumen

Este repositorio contiene una versión cuantizada a 4 bits de `meta-llama/Llama-3.1-8B`, el modelo causal decoder-only de Meta publicado en julio de 2024. La cuantización la ha realizado el usuario `fbaldassarri` mediante Intel AutoRound v0.16.0, aplicando cuantización weights-only (WoQ) con el algoritmo SignRound, 4 bits, tamaño de grupo 64 y esquema asimétrico. El resultado es un checkpoint INT4 pensado para inferencia de bajo consumo en CPU Intel, iGPU Intel Arc (vía intel-extension-for-pytorch) y NPU Intel AI Boost de la serie Core Ultra (vía OpenVINO).

El modelo base Llama 3.1 8B emplea una arquitectura transformer densa con atención agrupada (GQA), 8.030 millones de parámetros y una ventana de contexto de 128.000 tokens, además de soporte nativo de tool calling en las variantes instruct. Esta versión cuantizada conserva la licencia Llama 3.1 Community License y está orientada a investigación según su propio disclaimer.

La relevancia de esta ficha es doble: por un lado documenta un artefacto de cuantización concreto con su receta reproducible (versiones, hiperparámetros de calibración y tiempos reales de ejecución); por otro, advierte de una discrepancia importante entre los metadatos del repositorio y el modelo base declarado, que se detalla en la sección de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (Llama 3.1), atención GQA |
| Parametros totales | 2.046.038.016 según safetensors del repo; el modelo base declarado (Llama-3.1-8B) tiene 8.030 millones |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens en el modelo base; no verificado en el checkpoint cuantizado |
| Tipos de cuantizacion | INT4 weights-only (WoQ), group size 64, asimétrica (sym=false), calibración en bfloat16 |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (formato `auto_round`, cargable con transformers) |
| Framework de cuantizacion | Intel AutoRound 0.16.0 (algoritmo SignRound) |
| Precision de calibracion | torch.bfloat16, 128 muestras, 200 iteraciones, seqlen 512, batch 4 |
| Duracion de la cuantizacion | 40.405,6 s (673,4 min) en CPU |
| Tamano del repo | 8,0 GB |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only causal de Llama 3.1, con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención agrupada para reducir el coste de memoria del KV cache. Meta entrenó Llama 3.1 8B sobre aproximadamente 15 billones de tokens (dato del modelo base, no del repositorio), con un pipeline de post-entrenamiento que incluye SFT, rechazo de muestras y DPO. Esta ficha no aporta detalles adicionales sobre la composición del dataset, ya que el autor no los documenta.

La contribución propia de este repositorio es exclusivamente la cuantización. AutoRound aplica una búsqueda de escalas de cuantización por bloques mediante el algoritmo SignRound, minimizando el error de reconstrucción capa a capa con un conjunto de calibración de 128 muestras de 512 tokens. Se usa esquema asimétrico con grupo de 64, lo que típicamente preserva mejor la precisión que esquemas simétricos por canal en modelos pequeños. No hay entrenamiento adicional, destilación ni ajuste fino: es un proceso de compresión post-entrenamiento.

## Capacidades

- Generación de texto autoregresiva en modo completion, ya que el autor indica explícitamente que es un modelo base y debe usarse con texto crudo.
- Razonamiento, código y matemáticas heredados del modelo base Llama 3.1 8B, sujetos a la degradación propia de una cuantización INT4 con grupo 64.
- Soporte multilingüe declarado para ocho idiomas: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés.
- Tool calling y function calling: capacidad del Llama 3.1 instruct original; no confirmada en este checkpoint base cuantizado.
- Ejecución en hardware Intel: CPU, iGPU Arc y NPU AI Boost mediante intel-extension-for-pytorch y OpenVINO.
- No incluye visión, audio ni modo thinking explícito.

## Casos de uso

- Inferencia en portátiles con CPU Intel sin GPU dedicada: el checkpoint INT4 con grupo 64 reduce el peso de los pesos a aproximadamente 4 bits por parámetro, lo que permite ejecutar un modelo de la familia 8B en equipos con 16 GB de RAM y sin acelerador gráfico.
- Despliegue en Intel Core Ultra con NPU AI Boost: el autor documenta soporte vía OpenVINO, lo que habilita asistentes locales de baja latencia y bajo consumo energético en equipos de sobremesa y portátiles.
- Prototipado de pipelines de generación de texto en entornos de CI: al ser un artefacto pequeño y determinista en su carga, sirve para validar integraciones con transformers antes de pasar a checkpoints mayores.
- Investigación sobre cuantización post-entrenamiento: la receta reproducible (versiones fijadas de auto-round, transformers y torch, más hiperparámetros de calibración) permite estudiar el impacto de W4G64 asimétrico frente a otros esquemas.
- Generación de texto en lote para tareas de completado (autocompletado de documentación, resúmenes extractivos) donde no se requiere instruction following y prima el coste por token.
- Evaluación comparativa de hardware Intel: útil como referencia para medir throughput y latencia de AutoRound en CPU, iGPU y NPU frente a otros formatos de cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo afirma una mejora de velocidad de 2-3x y una "ligera caída de precisión" en W4G64, sin cifras concretas ni comparaciones con otros checkpoints.

## Requisitos de hardware

- VRAM/RAM estimada: con INT4 y grupo 64, los pesos ocupan del orden de 4-5 GB; el repo completo pesa 8,0 GB, por lo que se recomienda al menos 8 GB de memoria disponible para la carga y 16 GB para trabajar con contexto largo.
- GPU recomendadas: no hay requisitos publicados por el autor; el checkpoint está optimizado para CPU Intel, iGPU Arc y NPU AI Boost, no para CUDA.
- Cabe en GPU de consumo: sí, por tamaño (una RTX 4090 o RTX 3060 de 12 GB lo alojarían), pero el autor no garantiza el rendimiento de los kernels AutoRound en CUDA.
- Opciones de despliegue: transformers con `device_map="auto"`, intel-extension-for-pytorch para CPU e iGPU Arc, OpenVINO para NPU AI Boost. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, aunque el tag `text-generation-inference` aparece en los metadatos.
- Latencia y throughput: no disponibles; el autor solo indica un speedup de 2-3x sin especificar hardware de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Llama-3.1-8B AutoRound INT4) | 2.046 M según safetensors; base de 8.030 M | 128k (base) | INT4 WoQ, gs64 asim | Llama 3.1 Community | Hugging Face, 20 descargas |
| meta-llama/Llama-3.1-8B | 8.030 M | 128k | bfloat16 | Llama 3.1 Community | Hugging Face, oficial |
| meta-llama/Llama-3.1-8B-Instruct | 8.030 M | 128k | bfloat16 | Llama 3.1 Community | Hugging Face, oficial |
| Quantized versions de terceros (GPTQ/AWQ) | 8.030 M | 128k | INT4 habitualmente | Llama 3.1 Community | Múltiples repos en Hugging Face |

No se dispone de datos de rendimiento comparado para este checkpoint concreto; la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Discrepancia crítica de metadatos: el campo `safetensors` del repo declara 2.046.038.016 parámetros, muy por debajo de los 8.030 millones del Llama-3.1-8B declarado como base. Esto sugiere que el artefacto publicado no corresponde íntegramente al modelo base indicado, o que los metadatos están mal generados. Debe verificarse antes de cualquier uso en producción.
- Es un modelo base, no instruct: no sigue instrucciones ni mantiene formato conversacional de forma fiable; el autor lo indica explícitamente.
- Degradación por cuantización: W4G64 asimétrico introduce pérdida de precisión no cuantificada en la model card; el autor la califica de "ligera" sin aportar métricas.
- Riesgo de alucinación inherente al modelo base Llama 3.1, agravado por la compresión a 4 bits.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de seguridad en este checkpoint; hereda los del modelo base sin mitigaciones adicionales.
- Restricciones de licencia: Llama 3.1 Community License impone condiciones de uso comercial, atribución y políticas de uso aceptable; no es una licencia permisiva tipo Apache 2.0.
- Sin garantía: el autor declara que el modelo se ha desarrollado solo con fines de investigación y sin garantía de ningún tipo.
- Soporte de herramientas limitado: no se confirma funcionamiento en vLLM, llama.cpp u Ollama; el ecosistema documentado es Intel (IPEX, OpenVINO).
- Idiomas: aunque se declaran ocho, no hay evaluación de calidad por idioma en el checkpoint cuantizado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fbaldassarri/meta-llama_Llama-3.1-8B-auto_round-int4-gs64-asym
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Framework Intel AutoRound: https://github.com/intel/auto-round
- Licencia Llama 3.1: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/LICENSE
- Pipeline de replicación citado por el autor: https://git.epicdynamic.com/auto-round-pipeline (enlace no verificado)
