# araysuter/Ripple-65B-Preview-MLX-mixed-1bit

## Resumen

Ripple-65B-Preview-MLX-mixed-1bit es una cuantización experimental de baja precisión del modelo Ripple-65B-Preview de ricursiveAI, convertida de forma independiente por el usuario araysuter para su ejecución con MLX en hardware Apple Silicon. El modelo base es un transformer de 64.782.689.360 parámetros en BF16 con instrucciones afinadas; esta versión comprime las matrices MLP a 1 bit (grupos de 32) y mantiene el resto de proyecciones de atención en 4 bits, con embeddings y cabecera de salida en 8 bits. El resultado ocupa 23,32 GB en disco (21,72 GiB) con un promedio real de 2,880 bits por parámetro.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de cuantización extrema (MLP a 1 bit) que permite reducir un modelo de 65B a un tamaño manejable en equipos de consumo con memoria unificada. Por otro, el propio autor advierte explícitamente de que se trata de un experimento con pérdida sustancial de calidad: la concordancia del token más probable con el BF16 original es del 24,12% y la KL media es de 4,333 nats, lo que lo aleja de un uso en producción o como agente fiable.

El modelo conserva la arquitectura del Ripple original: PeriNorm, normas Q/K, escalado de embeddings, RoPE local, NoPE global, mezcla de residuos de valor y SwiGLU con clipping. La conversión se realizó desde el checkpoint BF16 instruction-tuned (revisión `4f308b9954b73cd200812095916c7baf68cf27f4`), no desde el modelo base de preentrenamiento. La licencia es Apache-2.0, heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención local RoPE y global NoPE, PeriNorm, Q/K norms, value-residual blending y SwiGLU con clipping |
| Parametros totales | 64.782.689.360 (según model card); 19.169.633.360 según el contador automático de safetensors (no reconoce el empaquetado de 1 bit) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el autor indica que no se realizó una prueba específica de capacidad a 128K; el tamaño de pesos no garantiza el ajuste de contexto) |
| Tipos de cuantizacion | MLP: 1 bit, grupos de 32; proyecciones de atención: 4 bit, grupos de 64; puertas sigmoideas de atención, embedding y cabecera de salida: 8 bit, grupos de 64; normas y escalares de value-residual: BF16 original; media real 2,880 bits por parámetro |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), con código personalizado `modeling_ricursive_mlx.py` |

## Arquitectura y entrenamiento

El modelo base Ripple-65B-Preview es un transformer de 64.782.689.360 parámetros. La arquitectura incorpora varias innovaciones: PeriNorm, normas específicas para Q y K, escalado de embeddings, atención local con RoPE y atención global con NoPE, mezcla de residuos de valor (value-residual blending) y SwiGLU con clipping. El adaptador MLX incluido preserva estos componentes, así como el orden de cast a BF16 y el cálculo de activaciones en FP32 de la referencia. El KV local está acotado. No se dispone de información sobre la composición del dataset de entrenamiento, el número de tokens utilizados ni si hubo fases de RLHF o DPO en el modelo original.

La conversión a baja precisión se realizó desde el checkpoint instruction-tuned en BF16, revisión `4f308b9954b73cd200812095916c7baf68cf27f4`, sin recuantizar ningún modelo ya cuantizado y sin usar el modelo base de preentrenamiento. El encoder seleccionado fue `mse`, que aplica búsqueda de clipping por grupo y refinamiento de centroides binarios con un fallback de error afín; no es GPTQ ni AWQ calibrado por activaciones. El perfil no recibió una ejecución separada de capacidad a 128K. El autor menciona un draft asociado, Ripple-65B Preview DFlash2, que requiere un runtime DFlash2 compatible con Ripple y no es un modelo Qwen3 autónomo; esta release no reclama una ruta DFlash2 probada ni decodificación especulativa que preserve la distribución, ni soporte nativo de la API TensorFold.

## Capacidades

- Generación de texto conversacional y de instrucciones, heredada del checkpoint instruction-tuned original.
- Razonamiento y matemáticas: capacidad teórica del modelo base, aunque degradada de forma sustancial por la cuantización extrema de las MLP.
- Generación de código: capacidad teórica del modelo base, no validada en esta cuantización.
- Tool calling y function calling: no documentado en esta release; el autor advierte que no es un modelo de agentes fiable.
- Razonamiento multi-paso y uso como agente: no recomendado por el propio autor.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles.
- Ejecución en Apple Silicon mediante MLX-LM con soporte de `model_file` y código personalizado.

## Casos de uso

- Investigación sobre cuantización extrema: el modelo sirve como banco de pruebas para estudiar el impacto de llevar las matrices MLP a 1 bit en un transformer de 65B, comparando la fidelidad medida (24,12% de concordancia top-token, KL de 4,333 nats) con otras técnicas de compresión.
- Experimentación en hardware Apple Silicon: permite cargar un modelo de 65B en equipos con memoria unificada de 32 GB o superior, algo inviable en BF16, para probar pipelines MLX de extremo a extremo.
- Generación de texto creativo sin requisitos de precisión: para tareas donde la coherencia aproximada y el estilo importan más que la exactitud factual, el modelo puede producir borradores que un humano revise después.
- Docencia y demostraciones: útil para explicar en clase o en charlas cómo funciona la cuantización por grupos, el empaquetado de 1 bit y el impacto medible en la perplejidad y la KL.
- Pruebas de integración de MLX-LM: valida el soporte de `model_file`, `trust_remote_code` y adaptadores personalizados en versiones concretas de MLX (0.32.4) y MLX-LM (0.32.2).
- Benchmarking de latencia en Apple Silicon: el autor reporta 310,2 tokens/s en procesamiento de prompt de 2K sin caché y 15,9 tokens/s en decodificación de 64 tokens, datos útiles para calibrar expectativas de rendimiento en M-series.
- Exploración de decodificación especulativa: aunque no se reclama una ruta DFlash2 probada, el modelo y su draft asociado permiten investigar la integración de drafters compatibles con Ripple en runtimes MLX.

## Benchmarks y rendimiento

| Diagnostico | Resultado |
|---|---|
| Posiciones sintéticas teacher-forced | 1024 |
| Concordancia top-token con el BF16 original en streaming | 24,12% |
| KL media respecto al BF16 original | 4,333255 nats |
| Pérdida next-token sintética, BF16 / cuantizado | 2,1479 / 6,3530 nats |
| Procesamiento de prompt de 2K sin caché, un usuario | 310,2 tokens/s |
| Decodificación en continuación corta de retrieval | 15,9 tokens/s (64 tokens generados) |

El autor advierte de que estas métricas son diagnósticos sintéticos pequeños y no equivalen a GPQA, Terminal-Bench, precisión en tareas generales ni a los resultados BF16 del publicador. Los pesos originales se evaluaron capa por capa mediante el adaptador de referencia MLX, no con un oráculo PyTorch de modelo completo. Los tiempos se midieron con MLX sin drafter, modelo residente, KV nuevo y chunks de prompt de 256 tokens; las continuaciones cortas no establecen throughput sostenido. El alcance numérico bruto está en `VALIDATION.json`.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 23,32 GB en disco (21,72 GiB) para los pesos; se recomienda al menos 32 GB de memoria unificada en Apple Silicon para dejar margen a KV cache y activaciones.
- GPU recomendadas: Apple Silicon con memoria unificada de 32 GB o más (M1 Pro/Max, M2 Pro/Max/Ultra, M3 Pro/Max/Ultra, M4 Pro/Max). No está pensado para GPUs NVIDIA, ya que el formato es MLX.
- Cabe en GPU de consumo: sí, en equipos Apple con memoria unificada suficiente; no en GPUs de consumo NVIDIA con 24 GB o menos por el formato MLX.
- Opciones de despliegue: MLX-LM 0.32.2 con MLX 0.32.4, usando `python -m mlx_lm.generate` con `--trust-remote-code`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 310,2 tokens/s en procesamiento de prompt de 2K sin caché y 15,9 tokens/s en decodificación de 64 tokens, medidos en un equipo no especificado por el autor.
- Código personalizado: requiere revisar `modeling_ricursive_mlx.py` y aceptar explícitamente la opción de confianza remota.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ripple-65B-Preview-MLX-mixed-1bit | 64.782.689.360 (2,880 bits/param promedio) | no disponible | MLP 1 bit, atención 4 bit, embeddings 8 bit | Apache-2.0 | HuggingFace, MLX |
| Ripple-65B-Preview (BF16 original) | 64.782.689.360 | no disponible | BF16 | Apache-2.0 | HuggingFace |
| Ripple-65B-Preview-DFlash2 | no disponible | no disponible | no disponible | no disponible | HuggingFace, requiere runtime DFlash2 |

No se dispone de información sobre otros modelos comparables de la misma categoría (mismo tamaño o misma tarea) en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de calidad sustancial: el propio autor advierte de que se espera una degradación importante y de que no es un modelo de agentes fiable. La concordancia top-token con el BF16 original es solo del 24,12%.
- Alucinación: la KL media de 4,333 nats y la pérdida next-token de 6,3530 nats frente a 2,1479 del BF16 indican una divergencia grande respecto al modelo original, con mayor riesgo de contenido incorrecto.
- Contexto: no se realizó una prueba específica de capacidad a 128K; el tamaño de los pesos no garantiza que el modelo quepa en contexto.
- Idiomas: no se documentan los idiomas soportados en esta release.
- Licencia: Apache-2.0 permite uso comercial, pero debe conservarse la licencia del modelo original; el autor indica que la licencia está incluida.
- Código personalizado: requiere `trust_remote_code` y revisión del adaptador `modeling_ricursive_mlx.py` antes de ejecutarlo en producción.
- Compatibilidad: solo MLX 0.32.4 y MLX-LM 0.32.2 están probados; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Contador de parámetros: el contador automático de HuggingFace reporta 19.169.633.360 parámetros porque no reconoce el empaquetado de 1 bit; no es un modelo podado a 19B.
- DFlash2: esta release no reclama una ruta DFlash2 probada, decodificación especulativa que preserve la distribución ni soporte nativo de la API TensorFold.
- Benchmarks: los datos de fidelidad son diagnósticos sintéticos pequeños, no resultados de tareas estándar ni los benchmarks BF16 del publicador.

## Enlaces

- HuggingFace: https://huggingface.co/araysuter/Ripple-65B-Preview-MLX-mixed-1bit
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Draft asociado DFlash2: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-DFlash2
- Herramientas de conversión y tests del adaptador: https://github.com/araysuter/TensorFold/tree/896c80b6e99de46b6af2df385f9dbe0dc4fa546c/tools/ripple
- Issue de bring-up nativo de Ripple en TensorFold: https://github.com/ashhart/TensorFold/issues/2171
