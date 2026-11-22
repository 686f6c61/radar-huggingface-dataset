# araysuter/Ripple-65B-Preview-MLX-mixed-1bit

## Resumen

Ripple-65B-Preview-MLX-mixed-1bit es una cuantización experimental de bajos bits del modelo Ripple-65B-Preview de ricursiveAI, publicada por el usuario araysuter. El modelo original es un transformer de 64.782.689.360 parámetros (clase 65B) con ajuste de instrucciones en BF16; esta versión lo reempaqueta para su ejecución con MLX en Apple Silicon aplicando una cuantización mixta muy agresiva: matrices MLP a 1 bit en grupos de 32, proyecciones de atención a 4 bits en grupos de 64, y embeddings, cabeza de salida y puertas sigmoideas de atención a 8 bits. El resultado ocupa 23.32 GB (21.72 GiB) y promedia 2.880 bits por parámetro incluyendo escalas afines, sesgos y tensores protegidos.

El problema que resuelve es práctico: permitir ejecutar un modelo de clase 65B en hardware con memoria unificada limitada mediante MLX-LM, sin recortar el número de parámetros (todos los parámetros originales se conservan; solo se reduce la precisión de almacenamiento). No obstante, el propio autor advierte que es una cuantización experimental y que debe esperarse una pérdida sustancial de calidad: la concordancia del token top con el BF16 original es del 24.12% y la KL media respecto al original es de 4.333255 nats. No es, en palabras del autor, un modelo fiable para uso como agente.

Es relevante ahora porque explora los límites de la cuantización sub-2-bit con esquemas mixtos y porque documenta con detalle las métricas de fidelidad y el alcance del runtime, algo poco habitual en releases de cuantización. Además, incluye un adaptador personalizado para MLX-LM que preserva innovaciones arquitectónicas del modelo base (PeriNorm, normas Q/K, RoPE local, NoPE global, mezcla de residuales de valor y SwiGLU recortado).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con adaptador MLX personalizado (PeriNorm, Q/K norms, RoPE local, NoPE global, value-residual blending, SwiGLU recortado) |
| Parametros totales | 64.782.689.360 (64.78B, clase 65B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible de forma explicita; el autor indica que no se ejecuto una prueba separada de capacidad a 128K y que el tamano de pesos no garantiza el encaje en contexto |
| Tipos de cuantizacion | Mixta: MLP 1-bit (grupos de 32), proyecciones de atencion 4-bit (grupos de 64), embeddings/cabeza/puertas sigmoideas 8-bit (grupos de 64), normas y escalares residuales en BF16 original; media de 2.880 bits por parametro |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria MLX), con codigo personalizado (`modeling_ricursive_mlx.py`) |

## Arquitectura y entrenamiento

El modelo base es un transformer de 65B parámetros ajustado con instrucciones en BF16 (revision `4f308b9954b73cd200812095916c7baf68cf27f4`). Esta release es una conversión independiente desde ese checkpoint BF16, no una recuantización de un modelo ya cuantizado; el autor indica explícitamente que no se usó el modelo Ripple Base de solo preentrenamiento. La arquitectura incorpora elementos poco comunes que el adaptador MLX debe preservar: PeriNorm, normas Q/K, escalado de embeddings, RoPE local, NoPE global, mezcla de residuales de valor y SwiGLU recortado, además de KV local acotada y el orden de casteo BF16 y el cálculo de activaciones en FP32 de la referencia.

El esquema de cuantización es mixto y asimétrico por componente. Las matrices MLP se empaquetan a 1 bit en grupos de 32; las proyecciones de atención distintas de las MLP van a 4 bits en grupos de 64; las puertas sigmoideas de atención, los embeddings y la cabeza de salida se mantienen a 8 bits en grupos de 64; y las normas y escalares de residual de valor conservan el BF16 original. El codificador seleccionado fue `mse`, con búsqueda de recorte por grupo y refinamiento de centroides binarios con respaldo de error afín; el autor aclara que no es GPTQ ni AWQ calibrado por activaciones. No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional y de instrucciones, heredada del checkpoint base ajustado con instrucciones.
- Razonamiento y código: capacidades propias del modelo base, aunque severamente degradadas por la cuantización de 1 bit en las MLP.
- Soporte de tool calling / function calling: no confirmado en la información disponible para esta cuantización.
- Soporte de agentes y razonamiento multi-paso: el autor advierte explícitamente que no es un modelo fiable para uso como agente.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales: no se documentan modos de pensamiento, visión ni audio.
- Ejecución en Apple Silicon mediante MLX-LM con soporte de `model_file` y `trust_remote_code`.

## Casos de uso

- Experimentación con cuantización de bajos bits: el modelo sirve como banco de pruebas para estudiar el impacto de esquemas mixtos 1/4/8 bits en la fidelidad de un transformer de 65B, con métricas de KL y concordancia de token ya publicadas.
- Investigación en hardware de memoria unificada: permite cargar un modelo de clase 65B en 23.32 GB, útil para estudiar límites de memoria y latencia en Apple Silicon sin necesidad de GPUs de datacenter.
- Validación de adaptadores MLX personalizados: el repositorio incluye `modeling_ricursive_mlx.py` y herramientas de conversión, lo que lo convierte en referencia para implementar arquitecturas no estándar (PeriNorm, NoPE global, value-residual blending) en MLX-LM.
- Pruebas de decodificación especulativa: el autor enlaza un draft DFlash2 compatible con Ripple, aunque aclara que esta release no reclama una ruta DFlash2 probada; sirve para preparar integraciones futuras.
- Benchmarking de fidelidad de cuantización: los diagnósticos sintéticos (1024 posiciones teacher-forced, KL de 4.333255 nats, pérdida de 6.3530 nats frente a 2.1479 en BF16) permiten comparar codificadores y esquemas de empaquetado.
- Docencia y divulgación: útil para explicar de forma tangible qué significa cuantizar a 1 bit las MLP y por qué el número de parámetros no cambia aunque la precisión sí.
- No recomendado para producción conversacional, agentes ni tareas de razonamiento crítico, dada la pérdida de calidad documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, GPQA, Terminal-Bench) en la información disponible. El autor indica explícitamente que sus diagnósticos son sintéticos y no equivalen a benchmarks de tareas generales ni a las puntuaciones BF16 del publicador.

| Diagnostico | Resultado |
|---|---|
| Posiciones sinteticas teacher-forced | 1024 |
| Concordancia de token top con BF16 original | 24.12% |
| KL media respecto al BF16 original | 4.333255 nats |
| Perdida next-token sintetica, BF16 / cuantizado | 2.1479 / 6.3530 nats |
| Procesamiento de prompt 2K sin cache, un usuario | 310.2 tokens/s |
| Decodificacion en continuacion corta de retrieval | 15.9 tokens/s (64 tokens generados) |

Las mediciones de velocidad se realizaron con MLX simple, sin drafter, modelo residente, KV fresco y fragmentos de prompt de 256 tokens. El autor advierte que las continuaciones cortas no establecen throughput sostenido.

## Requisitos de hardware

- VRAM/memoria estimada: 23.32 GB (21.72 GiB) de pesos; se necesita memoria adicional para KV cache, activaciones y overhead de MLX.
- Hardware objetivo: Apple Silicon con memoria unificada suficiente (se recomienda al menos 32 GB para margen operativo; el autor no especifica un mínimo).
- GPU NVIDIA: no aplicable directamente, ya que el formato es MLX; requeriría conversión a otro runtime.
- GPU de consumo: no cabe en GPUs consumer de 8/12/16 GB por el tamano de pesos; en Apple Silicon de 32 GB o más es viable.
- Opciones de despliegue: MLX 0.32.4 y MLX-LM 0.32.2 (versiones probadas), con `--trust-remote-code` obligatorio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 310.2 tokens/s en procesamiento de prompt 2K sin caché y 15.9 tokens/s en decodificación de una continuación corta, en el hardware de prueba del autor (no especificado).

## Comparativa con modelos similares

No se dispone de datos suficientes para comparar con alternativas de la misma categoría (cuantizaciones MLX mixtas de modelos 65B) en la información proporcionada. Se indica "no disponible" para parámetros comparables, contexto y rendimiento de terceros.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ripple-65B-Preview-MLX-mixed-1bit | 64.78B | no disponible | Apache-2.0 | safetensors MLX | Cuantizacion mixta 1/4/8 bits, 23.32 GB |
| Ripple-65B-Preview (BF16) | 64.78B | no disponible | Apache-2.0 | BF16 | Modelo base de referencia, sin cuantizar |
| Alternativas MLX de clase 65B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Pérdida de calidad sustancial y documentada: concordancia de token top del 24.12% y KL media de 4.333255 nats respecto al BF16 original; el autor califica la release como experimental.
- No es un modelo fiable para uso como agente, según advertencia explícita del autor.
- El contador automático del Hub muestra 19B parámetros de forma incorrecta; el modelo real tiene 64.78B y no está podado. El índice de shards registra el conteo original en `metadata.total_parameters`.
- No se ejecutó una prueba separada de capacidad a 128K; el tamano de pesos no garantiza el encaje en contexto.
- No se reclama una ruta DFlash2 probada ni decodificación especulativa que preserve la distribución; el draft DFlash2 requiere un runtime específico y no es un modelo Qwen3 autónomo.
- No se reclama soporte nativo de la API TensorFold; el bring-up de Ripple se sigue en TensorFold #2171.
- Requiere `trust_remote_code` por el adaptador personalizado, lo que implica revisar `modeling_ricursive_mlx.py` antes de ejecutarlo.
- Riesgo de alucinación elevado por la degradación de las MLP a 1 bit; no se documentan sesgos específicos, pero la pérdida de fidelidad agrava los sesgos del modelo base.
- Idiomas soportados no documentados; no se garantiza cobertura multilingüe.
- Licencia Apache-2.0 heredada del modelo original, que permite uso comercial; el autor pide mantener la licencia incluida.
- Solo probado con MLX 0.32.4 y MLX-LM 0.32.2; otras versiones pueden no cargar el adaptador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/araysuter/Ripple-65B-Preview-MLX-mixed-1bit
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Draft DFlash2: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-DFlash2
- Herramientas de conversion y tests del adaptador: https://github.com/araysuter/TensorFold/tree/896c80b6e99de46b6af2df385f9dbe0dc4fa546c/tools/ripple
- Issue de bring-up de Ripple en TensorFold: https://github.com/ashhart/TensorFold/issues/2171
