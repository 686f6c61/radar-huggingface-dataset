# RedHatAI/starcoder2-7b-FP8

## Resumen
`RedHatAI/starcoder2-7b-FP8` es una versión cuantizada a FP8 del modelo StarCoder2-7B, desarrollado originalmente por el equipo BigCode y cuantizado por Neural Magic (integrado en Red Hat). Esta variante reduce el tamaño de los pesos y activaciones de 16 a 8 bits, lo que disminuye los requisitos de memoria y almacenamiento en aproximadamente un 50%, manteniendo un rendimiento casi idéntico al modelo original (39.30 frente a 39.65 en HumanEval+). Está optimizado para inferencia con vLLM y text-generation-inference, lo que lo convierte en una opción atractiva para desplegar generación de código en entornos con recursos limitados.

El modelo base StarCoder2-7B es un transformer autoregresivo con 7.400 millones de parámetros, entrenado en más de 600 lenguajes de programación y texto natural, con una ventana de contexto de 16.384 tokens y atención deslizante de 4.096 tokens. La cuantización FP8 se aplica a las capas lineales de los bloques transformadores, con calibración basada en 512 secuencias del conjunto UltraChat. Esta versión está publicada bajo la licencia bigcode-openrail-m, que permite uso comercial con condiciones, y está orientada principalmente a aplicaciones en inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (StarCoder2-7B) con Grouped Query Attention y sliding window attention |
| Parámetros totales | 7.400.416.256 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens (del modelo base) |
| Tipos de cuantización | FP8 (pesos y activaciones, por tensor, simétrica) |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | bigcode-openrail-m |
| Formato de pesos | safetensors (compatible con vLLM, TGI, compressed-tensors) |

## Arquitectura y entrenamiento
El modelo base StarCoder2-7B es un transformer causal con 12.000 millones de parámetros, entrenado por BigCode en un corpus de más de 600 lenguajes de programación (The Stack v2) y texto natural como Wikipedia, arXiv y GitHub issues. Emplea Grouped Query Attention y una ventana de contexto de 16.384 tokens con sliding window attention de 4.096 tokens para reducir el coste computacional.

La versión FP8 se obtiene cuantizando los pesos y activaciones de los operadores lineales dentro de los bloques transformadores a formato FP8 (8 bits en coma flotante). La cuantización es simétrica y por tensor, con un único factor de escala. Se aplicó mediante AutoFP8 (posteriormente LLM Compressor) con 512 muestras de calibración del dataset UltraChat, y se excluye la capa `lm_head`. El proceso reduce los bits por parámetro de 16 a 8, disminuyendo el tamaño del modelo de ~14.8 GB a ~7.4 GB, sin modificaciones en la arquitectura original.

## Capacidades
- Generación de código en más de 600 lenguajes de programación (según el modelo base StarCoder2).
- Autocompletado y finalización de código en entornos de desarrollo.
- Razonamiento sobre código y generación de explicaciones técnicas.
- Soporte de tool calling: no disponible (no se ha documentado en esta versión).
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: el modelo base entiende código de muchos lenguajes, pero la model card indica uso previsto en inglés para texto natural.
- Capacidad de cuantización FP8 para inferencia eficiente con vLLM y TGI.

## Casos de uso
- Asistente de programación en tiempo real: el modelo puede integrarse en editores de código para completar funciones, generar fragmentos y sugerir correcciones, gracias a su entrenamiento en múltiples lenguajes y su tamaño moderado que permite latencias bajas en GPU de consumo.
- Generación de código en pipelines de CI/CD: con soporte de vLLM, se puede desplegar como servicio para generar tests unitarios, documentación o parches en repositorios, reduciendo el coste de memoria en comparación con el modelo FP16.
- Autocompletado de código en servidores de desarrollo: su ventana de 16.384 tokens permite manejar archivos largos y contextos de proyecto, aunque la cuantización FP8 reduce la VRAM necesaria para desplegar múltiples instancias en una sola GPU.
- Traducción de código entre lenguajes de programación: aunque no está específicamente entrenado para ello, su entrenamiento en 600 lenguajes puede facilitar la migración de scripts o funciones entre sintaxis.
- Documentación automática de código: puede generar comentarios y explicaciones de bloques de código, útil para equipos que necesitan documentar grandes repositorios.
- Análisis estático de código: el modelo puede identificar patrones de código y sugerir mejoras, aunque se requiere validación humana.
- Despliegue en entornos con recursos limitados: gracias a la cuantización FP8, puede ejecutarse en GPUs con 16 GB de VRAM, como RTX 4080, A10 o L4, lo que lo hace viable para equipos de desarrollo sin acceso a clústeres grandes.

## Benchmarks y rendimiento
El modelo fue evaluado en HumanEval+ (fork de Neural Magic de EvalPlus). Los resultados reportados son:

| Benchmark | Modelo FP8 | Modelo sin cuantizar (starcoder2-7b) |
|---|---|---|
| HumanEval+ (pass@1) | 39.30 | 39.65 |

No se han publicado resultados en otros benchmarks (MMLU, GSM8K, etc.) en la información disponible. La pérdida de rendimiento es de solo 0.35 puntos, lo que indica que la cuantización es casi sin pérdida.

## Requisitos de hardware
- VRAM estimada para inferencia: el modelo FP8 ocupa aproximadamente 7.4 GB en memoria de pesos (7.400 millones de parámetros × 1 byte). Con activaciones y KV cache, se recomienda al menos 16 GB de VRAM para una ejecución cómoda con contexto de 4096 tokens.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), A1000 (16 GB), L4 (24 GB), A100 (40 GB) o superiores. En GPUs de 16 GB se puede ejecutar con contexto reducido.
- ¿Cabe en GPU de consumo? Sí, en GPUs de 16 GB o más. En GPU de 8 GB (como RTX 3060) podría caber con cuantización adicional o contexto muy limitado, pero no está garantizado.
- Opciones de despliegue: vLLM (>=0.5.2), Text Generation Inference (TGI), Friendli (plataforma de inferencia), y también compatible con el formato compressed-tensors para otros backends.
- Latencia y throughput: no se proporcionan datos específicos. Con vLLM, se puede lograr un throughput de varios cientos de tokens por segundo en GPUs de 24 GB, pero depende del hardware y del tamaño de batch.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Cuantización | HumanEval+ | Licencia |
|---|---|---|---|---|---|
| RedHatAI/starcoder2-7b-FP8 | 7.4B | 16k | FP8 | 39.30 | bigcode-openrail-m |
| bigcode/starcoder2-7b (original) | 7.4B | 16k | FP16 | 39.65 | bigcode-openrail-m |
| CodeLlama-7B | 7B | 16k (base) | FP16 | no disponible | Llama 2 license |
| DeepSeek-Coder-6.7B | 6.7B | 16k | FP16 | no disponible | MIT |

Nota: No se han encontrado datos de benchmarks para CodeLlama y DeepSeek en la información disponible. La comparación directa se limita al modelo original y a la versión cuantizada.

## Limitaciones y advertencias
- El modelo está optimizado para uso en inglés; su rendimiento en otros idiomas no está garantizado y la model card lo excluye explícitamente.
- Puede generar código con errores o alucinaciones, especialmente en casos poco comunes. Se recomienda validación humana en entornos de producción.
- La cuantización FP8 introduce una pérdida mínima de rendimiento (0.35 puntos en HumanEval+), pero puede ser mayor en tareas no evaluadas.
- La licencia bigcode-openrail-m permite uso comercial, pero incluye cláusulas de uso responsable y restricciones sobre uso ilegal. Requiere revisión del acuerdo completo.
- No se han publicado resultados en tareas de razonamiento matemático o conversación general; su especialización es la generación de código.
- El modelo no soporta visión ni audio; solo texto.
- La cuantización FP8 está optimizada para vLLM; otros backends pueden no estar soportados o requerir conversión.

## Enlaces
- Página del modelo en Hugging Face: https://huggingface.co/RedHatAI/starcoder2-7b-FP8
- Modelo original StarCoder2-7B: https://huggingface.co/bigcode/starcoder2-7b
- Repositorio del proyecto StarCoder2: https://github.com/bigcode-project/starcoder2
- Licencia bigcode-openrail-m: https://huggingface.co/spaces/bigcode/bigcode-model-license-agreement
- Herramienta de cuantización AutoFP8: https://github.com/neuralmagic/AutoFP8
- LLM Compressor (usado para la cuantización): https://github.com/vllm-project/llm-compressor
- Fork de EvalPlus usado en la evaluación: https://github.com/neuralmagic/evalplus
