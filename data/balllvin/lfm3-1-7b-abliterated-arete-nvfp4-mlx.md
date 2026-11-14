# balllvin/LFM3-1.7B-Abliterated-Arete-NVFP4-MLX

## Resumen

LFM3-1.7B-Abliterated-Arete-NVFP4-MLX es una adaptación del modelo LFM3 de 1.700 millones de parámetros (1.728.801.536 exactos) publicada por el usuario balllvin en Hugging Face. Se trata de un fine-tuning sobre la variante "abliterated" de orcarouter, que a su vez deriva del LFM3 original de Liquid AI. El modelo ha sido ajustado con el dataset NousResearch/arete-data-pairs y posteriormente cuantizado a 4 bits en formato NVFP4 para su ejecución con la librería MLX de Apple, lo que lo orienta a inferencia local en hardware Apple Silicon.

La relevancia de esta ficha es doble: por un lado documenta una de las primeras materializaciones públicas del formato NVFP4 (un formato de cuantización de 4 bits con escalas de bloque FP8) aplicado a un modelo de lenguaje pequeño en el ecosistema MLX; por otro, ilustra el flujo típico de la comunidad: modelo base → variante abliterated → fine-tune con datos sintéticos → cuantización para consumo local. El resultado es un modelo conversacional de 1,7B parámetros, solo en inglés, con licencia LFM1.0 y acceso restringido.

Conviene subrayar que no se dispone de información publicada sobre benchmarks, composición exacta del dataset de fine-tuning ni detalles del proceso de abliteration más allá de lo que indica el nombre del modelo base. Todo lo que sigue se limita a los metadatos verificables del repositorio y a las características conocidas de la familia LFM3 y del formato NVFP4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de LFM3 de Liquid AI; transformer, detalles no publicados en el repo) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, escalas de bloque FP8); repo en safetensors cuantizados |
| Idiomas soportados | en (inglés) |
| Licencia | lfm1.0 (etiquetada como "other" en los tags; acceso restringido/gated) |
| Formato de pesos | safetensors (MLX, cuantización NVFP4) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de LFM3 (Liquid Foundation Model 3) de Liquid AI, si bien el repositorio no publica detalles de capas, atención ni configuración del transformer. La cadena de derivación es explícita en los metadatos: LFM3 original → orcarouter/LFM3-1.7B-abliterated (variante con "abliteration", técnica de modificación de pesos que elimina direcciones de activación asociadas a rechazos) → fine-tune de balllvin con NousResearch/arete-data-pairs → cuantización NVFP4 para MLX.

El fine-tuning utiliza el dataset arete-data-pairs de Nous Research, orientado a pares de conversación de alta calidad; no se especifica el número de tokens, la composición exacta ni si hubo etapas de RLHF o DPO adicionales. La innovación técnica destacable es la cuantización NVFP4: un formato de 4 bits con escalas de bloque en FP8 que busca preservar precisión respecto a FP8/FP16 a un coste de memoria notablemente menor, implementado aquí para el runtime MLX de Apple. No se documentan técnicas como decodificación especulativa ni atención lineal específicas de esta variante.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento y respuesta a instrucciones heredados del modelo base LFM3.
- Generación de código y matemáticas básicas (capacidad esperable del base, no verificada en esta variante).
- Sin soporte documentado de tool calling ni function calling en esta ficha.
- Sin soporte documentado de agentes o multi-step reasoning explícito.
- Multilingüe limitado: solo inglés declarado.
- Sin visión ni audio.
- Sin modo "thinking" documentado.
- Ejecución local en Apple Silicon mediante MLX con pesos NVFP4.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede desplegarse con MLX en equipos Apple Silicon aprovechando la cuantización NVFP4 para reducir huella de memoria, útil para prototipos de chat sin conexión.
- Experimentación con cuantización NVFP4: sirve como banco de pruebas para evaluar la calidad de este formato de 4 bits frente a GGUF Q4 o MLX 4-bit estándar en tareas de generación.
- Investigación sobre abliteration: permite estudiar el comportamiento de un modelo con direcciones de rechazo eliminadas en un tamaño manejable (1,7B) para análisis de sesgos y alineación.
- Generación de texto creativo en inglés: adecuado para borradores, resúmenes y reescritura en flujos personales donde la latencia local importa más que la calidad puntera.
- Fine-tuning posterior y destilación: al ser pequeño y estar en safetensors, puede servir de base para nuevos ajustes con LoRA en MLX.
- Evaluación comparativa de formatos: útil en pipelines de benchmarking que comparen NVFP4 frente a otras cuantizaciones sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: en torno a 1 GB para los pesos NVFP4 (repo de 1,8 GB incluyendo overhead), más KV cache según contexto.
- GPU recomendadas: Apple Silicon (M1/M2/M3/M4) con MLX; no está pensado para CUDA.
- Cabe en GPU consumer: sí, en cualquier Mac con 8 GB o más de memoria unificada; también en GPUs con 4-6 GB si se reconvirtiera el formato, aunque el repo está orientado a MLX.
- Opciones de despliegue: MLX (mlx-lm), mlx_lm.server; no se distribuye en GGUF ni está validado para vLLM, llama.cpp, Ollama o TGI en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LFM3-1.7B-Abliterated-Arete-NVFP4-MLX | 1,73B | no disponible | lfm1.0 (gated) | Hugging Face, MLX |
| orcarouter/LFM3-1.7B-abliterated (base) | 1,73B | no disponible | lfm1.0 | Hugging Face |
| LFM3-1.7B original (Liquid AI) | 1,7B | no disponible | lfm1.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 | Apache 2.0 | Hugging Face, múltiples formatos |

## Limitaciones y advertencias

- Acceso restringido: requiere aceptar condiciones en Hugging Face antes de descargar.
- Licencia LFM1.0 con posibles restricciones para uso comercial; revisar los términos antes de producción.
- Solo inglés; no se garantiza calidad en castellano ni otros idiomas.
- La abliteration elimina mecanismos de rechazo, lo que puede aumentar la probabilidad de contenido dañino o no filtrado.
- Riesgo de alucinación inherente a un modelo de 1,7B, especialmente en tareas factuales.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente al base.
- Formato NVFP4 específico de MLX: no portable directamente a otros runtimes sin reconversión.
- Longitud de contexto no documentada; no asumir ventanas largas.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/balllvin/LFM3-1.7B-Abliterated-Arete-NVFP4-MLX
- Modelo base: https://huggingface.co/orcarouter/LFM3-1.7B-abliterated
- Dataset de fine-tuning: https://huggingface.co/datasets/NousResearch/arete-data-pairs
- Librería MLX: https://github.com/ml-explore/mlx
- MLX-LM: https://github.com/ml-explore/mlx-examples/tree/main/llms
