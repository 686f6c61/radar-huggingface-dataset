# JW-Hubs/Qwen3.5-0.8B-W4A16-LLM-Compressor

## Resumen

Esta ficha describe `JW-Hubs/Qwen3.5-0.8B-W4A16-LLM-Compressor`, una versión cuantizada del modelo base `Qwen/Qwen3.5-0.8B` publicada por el usuario JW-Hubs en Hugging Face. Se trata de una compresión a 4 bits en pesos con activaciones en 16 bits (W4A16) generada con AutoRound, el método de cuantización basado en descenso de gradiente con signo desarrollado por Intel, y exportada en formato GPTQ para maximizar la compatibilidad con el ecosistema de inferencia existente.

El modelo base pertenece a la familia Qwen3.5 de Alibaba, con arquitectura `qwen3_5` y 852.985.920 parámetros totales según los tensores en safetensors, lo que lo sitúa en la categoría de modelos sub-1B orientados a despliegue en entornos con recursos limitados: edge computing, dispositivos de consumo y servicios de baja latencia. La cuantización reduce aproximadamente un 50 % el consumo de memoria frente al modelo en FP16, según indica la model card.

La relevancia de esta publicación es fundamentalmente práctica: demuestra un flujo de compresión con una configuración de alta precisión (1000 iteraciones, 512 muestras de calibración, longitud de secuencia 2048, group size 128 y simetría activada) aplicado a un modelo de escala muy reducida, donde el margen de parámetros es escaso y los errores de cuantización resultan especialmente sensibles. No obstante, la información pública disponible es muy limitada: no se detallan idiomas, licencia, contexto ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5` (transformer, según el tag de Hugging Face del modelo base) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (pesos INT4, activaciones FP16), formato GPTQ, group size 128, simétrico |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors con `compressed-tensors` (exportación en formato GPTQ) |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Qwen3.5 con 852.985.920 parámetros, identificado en Hugging Face con el tag de arquitectura `qwen3_5`. No se dispone de información pública en la documentación consultada sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineación. Tampoco se detalla si incorpora innovaciones como decodificación especulativa, atención lineal o mecanismos híbridos.

Lo que sí está documentado es el proceso de cuantización posterior: AutoRound con 1000 iteraciones de optimización, 512 muestras de calibración, secuencias de 2048 tokens, cuantización simétrica por grupos de 128 elementos y `torch.compile` habilitado. El resultado se exporta en formato GPTQ estándar dentro de un repositorio `compressed-tensors`, lo que permite cargarlo con `transformers`, AutoGPTQ, vLLM y SGLang sin conversiones adicionales. La combinación de muchas iteraciones con un conjunto de calibración amplio para esta escala busca minimizar la degradación de precisión, un punto crítico cuando el presupuesto de parámetros es tan ajustado.

## Capacidades

- Generación de texto autoregresiva en el rango propio de un modelo de 0,8B parámetros; no se documentan capacidades específicas más allá de las heredadas del modelo base.
- Razonamiento básico y tareas de lenguaje general: no hay evaluaciones publicadas que cuantifiquen su rendimiento en MMLU, GSM8K u otros conjuntos.
- Generación de código: capacidad presumible por herencia de la familia Qwen, pero sin datos verificables en la información disponible.
- Soporte de tool calling / function calling: no disponible en la documentación consultada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; la model card no enumera idiomas.
- Modo thinking, visión o audio: no disponible.
- Compatibilidad de despliegue amplia gracias a la exportación en formato GPTQ: `transformers`, AutoGPTQ, vLLM y SGLang.

## Casos de uso

- Inferencia en dispositivos de borde: con ~0,85B parámetros en W4A16 y un repositorio de 2,4 GB, el modelo puede ejecutarse en hardware con memoria muy limitada (SBCs, mini-PC, portátiles sin GPU dedicada) para tareas de clasificación, resumen o generación asistida de texto.
- Autocompletado y asistencia de escritura de baja latencia: al ser un modelo pequeño cuantizado, es adecuado para sugerencias en tiempo real dentro de editores o formularios, donde el coste por token y la latencia dominan sobre la calidad máxima.
- Prototipado rápido de pipelines de cuantización: sirve como banco de pruebas para validar configuraciones AutoRound/GPTQ (group size, iteraciones, calibración) antes de aplicarlas a modelos mayores, dado su bajo coste de cómputo.
- Filtrado y enrutamiento previo en arquitecturas multi-modelo: usar este modelo como primera etapa para clasificar o descartar consultas antes de invocar un modelo mayor, reduciendo coste agregado.
- Extracción de información estructurada en local: procesamiento de documentos o registros en entornos con requisitos de privacidad donde no es viable enviar datos a la nube, siempre que la tarea no exija razonamiento complejo.
- Docencia y experimentación académica: permite reproducir experimentos de cuantización y medir degradación de precisión en GPUs de consumo, con un repositorio de solo 2,4 GB.
- Servicio de generación de texto de bajo coste en vLLM/SGLang: al soportar batching continuo en backends GPTQ, puede atender cargas moderadas en una única GPU de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-3 GB en W4A16 (pesos de ~0,43 GB teóricos a 4 bits más overhead de escalas, metadatos y caché KV); el repositorio ocupa 2,4 GB en disco.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son compatibles, aunque para este tamaño las GPU de gama de consumo son suficientes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU discreta moderna e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: `transformers`, AutoGPTQ, vLLM y SGLang según la model card. No se menciona compatibilidad con llama.cpp, Ollama ni TGI en la documentación disponible.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| JW-Hubs/Qwen3.5-0.8B-W4A16-LLM-Compressor | 852.985.920 | no disponible | W4A16 GPTQ (AutoRound) | no disponible | Este modelo; repo de 2,4 GB |
| Qwen/Qwen3.5-0.8B | 852.985.920 (presumible) | no disponible | FP16/BF16 original | no disponible | Modelo base sin cuantizar |
| Alternativas sub-1B de otras familias | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

La comparación con modelos de otras familias (por ejemplo, variantes sub-1B de Llama, Gemma o SmolLM) no puede completarse con rigor porque la documentación consultada no aporta especificaciones del modelo base ni resultados de evaluación propios.

## Limitaciones y advertencias

- La model card no especifica licencia, lo que impide determinar si el uso comercial está permitido; es imprescindible consultar la licencia del modelo base `Qwen/Qwen3.5-0.8B` antes de cualquier despliegue productivo.
- No se documentan idiomas soportados; el rendimiento fuera del inglés (incluido el castellano) es desconocido y debe evaluarse empíricamente.
- No se publica la longitud de contexto del modelo base, dato crítico para dimensionar la caché KV y las estrategias de troceado de documentos.
- Con 0,85B parámetros, la capacidad de razonamiento, matemáticas y código es intrínsecamente limitada; es esperable una tasa de alucinación superior a la de modelos de mayor escala, aunque no se aportan métricas.
- La cuantización a 4 bits introduce degradación adicional respecto al modelo FP16; aunque la configuración AutoRound es agresiva en precisión, no se han publicado mediciones de la pérdida real (perplejidad, exactitud en tareas).
- El repositorio tiene solo 5 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad; conviene tratar la calidad del artefacto como no verificada de forma independiente.
- La model card incluye enlaces de afiliado a RunPod y referencias a plantillas de terceros; no constituyen garantía técnica ni auditoría del modelo.
- No se documenta compatibilidad con llama.cpp u Ollama, lo que limita el despliegue en CPU pura sin backend GPTQ.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JW-Hubs/Qwen3.5-0.8B-W4A16-LLM-Compressor
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- AutoRound (Intel): https://github.com/intel/auto-round
- RunPod (enlace de afiliado incluido en la model card): https://runpod.io?ref=iabrlp7z
