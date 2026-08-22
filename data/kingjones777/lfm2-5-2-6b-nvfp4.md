# kingjones777/LFM2.5-2.6B-NVFP4

## Resumen

LFM2.5-2.6B-NVFP4 es una cuantización de 4 bits (NVFP4, W4A4) del modelo base LiquidAI/LFM2.5-2.6B de Liquid AI, publicada por el usuario kingjones777. Se trata de la primera compilación NVFP4 de cualquier checkpoint de la familia LFM2.5, verificada sobre NVIDIA GB10 Blackwell (sm_121a). El modelo resultante reduce el peso de 5.1 GB en bf16 a 2.28 GiB (factor 2,2) y consigue una velocidad de decodificación de 69.8 tokens por segundo frente a 33.94 t/s del control bf16, es decir, 2.06 veces más rápido.

El modelo base es un modelo denso de 2.6 mil millones de parámetros diseñado para cargas de trabajo agénticas en dispositivos, con una ventana de contexto de 128K tokens y soporte nativo de tool calling. Esta cuantización mantiene las capacidades del modelo original mientras reduce los requisitos de memoria y acelera la inferencia en hardware Blackwell. La cuantización cubre las proyecciones de atención y los MLP SwiGLU, pero deja en bf16 todos los bloques convolucionales y las capas de normalización, protegiendo la ruta híbrida convolucional del modelo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lfm2ForCausalLM (híbrida: 22 capas convolucionales + 8 capas full-attention) |
| Parametros totales | 2.697.198.592 (2.6B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | NVFP4 (W4A4), pesos estáticos con grupo de 16, activaciones dinámicas locales |
| Idiomas soportados | 16 idiomas (según Liquid AI; no especificados en la model card) |
| Licencia | lfm1.0 (Liquid AI Foundation Model License) |
| Formato de pesos | safetensors con formato NVFP4 pack (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-2.6B es un modelo denso de 2.6B que combina capas convolucionales y de atención completa: 22 capas convolucionales y 8 capas de full-attention. Esta arquitectura híbrida está optimizada para inferencia en dispositivos con bajo consumo de memoria y alta velocidad. La cuantización NVFP4 se realizó con llmcompressor en modo oneshot, usando el esquema QuantizationModifier(targets="Linear", scheme="NVFP4"). Se calibró con el dataset HuggingFaceH4/ultrachat_200k (partición train_sft) mediante la plantilla de chat del modelo. Los pesos se cuantizan estáticamente con grupo de 16, mientras que las activaciones se cuantizan dinámicamente con escala global por capa. El proceso protege los bloques convolucionales (conv.in_proj, conv.conv, conv.out_proj), las normas y las embeddings atadas, que se mantienen en bf16 para evitar degradación. La cuantización cubre 122 capas lineales cuantizadas (proyecciones de atención y MLP SwiGLU).

## Capacidades

- Generación de texto y razonamiento general de propósito, con capacidad para tareas de conversación y pregunta-respuesta.
- Soporte nativo de tool calling y function calling, heredado del modelo base, lo que permite integrar llamadas a APIs y herramientas externas.
- Capacidad para agentes multi-paso: el modelo puede planificar, llamar herramientas y ejecutar tareas secuenciales en dispositivos.
- Contexto largo de 128K tokens, adecuado para documentos extensos y conversaciones multi-turno.
- Multilingüe: soporta 16 idiomas (según Liquid AI), aunque no se detallan cuáles.
- Modo de inferencia rápida: con la cuantización NVFP4 alcanza 69.8 t/s en decode en Blackwell, frente a 33.94 t/s en bf16.

## Casos de uso

- **Agentes on-device**: el modelo está diseñado para ejecutar agentes locales en laptops, teléfonos o edge devices, manteniendo la privacidad de los datos y sin coste de nube. Su tamaño reducido (2.28 GiB) y velocidad de 69.8 t/s lo hacen viable en hardware con poca memoria.
- **Atención al cliente automatizada**: con 128K de contexto, puede gestionar conversaciones largas y multi-turno, integrando tool calling para consultar bases de conocimiento o sistemas CRM.
- **Generación de código en producción**: soporta tool calling y puede integrarse en pipelines de CI/CD para generar código, revisar pull requests o autocompletar funciones en entornos con recursos limitados.
- **Asistentes de productividad local**: como resumen de documentos extensos, extracción de datos o redacción de correos, todo ejecutado en el dispositivo sin conexión.
- **Sistemas de razonamiento multi-paso**: para tareas de planificación y ejecución de tareas complejas, como gestión de calendarios, reservas o flujos de trabajo que requieren llamadas secuenciales a APIs.
- **Análisis de texto en tiempo real**: en dispositivos edge como cámaras o sensores con GPU Blackwell, el modelo puede procesar texto de forma local con baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo es una cuantización, por lo que no hay datos de MMLU, HumanEval u otros benchmarks específicos para este checkpoint cuantizado. El modelo base tampoco presenta métricas en los resultados de búsqueda proporcionados.

## Requisitos de hardware

- **GPU requerida**: NVIDIA Blackwell (sm_121a) con soporte de FP4, como la GB10, GB200 o GPUs de la serie RTX Blackwell (por ejemplo, RTX 50). No es compatible con arquitecturas anteriores (Ampere, Turing, etc.) porque el runtime NVFP4 requiere instrucciones específicas.
- **VRAM estimada**: el archivo de pesos ocupa 2.28 GiB, por lo que se necesita al menos 3 GB de VRAM para cargar el modelo y los buffers de activación. En un GB10 con 32 GB de memoria unificada es suficiente.
- **Opciones de despliegue**: SGLang v0.5.18-cu130 o vLLM nightly (que registra la arquitectura Lfm2ForCausalLM). No se menciona soporte en llama.cpp u Ollama.
- **Latencia y throughput**: 69.8 tokens/s en decode medido en un GB10 Blackwell con SGLang. El throughput es 2.06 veces el del modelo bf16.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos de tamaño similar (como Qwen2.5-3B o Llama-3.2-3B). La comparación principal es con el modelo base bf16 y con la cuantización MXFP4 para Apple MLX (mlx-community/LFM2.5-2.6B-mxfp4). La siguiente tabla resume las diferencias clave:

| Modelo | Formato | Peso | Velocidad decode | Runtime requerido |
|---|---|---|---|---|
| LiquidAI/LFM2.5-2.6B (bf16) | bf16 | 5.1 GB | 33.94 t/s | SGLang/vLLM estándar |
| kingjones777/LFM2.5-2.6B-NVFP4 | NVFP4 (W4A4) | 2.28 GiB | 69.8 t/s | SGLang/vLLM con soporte NVFP4 en Blackwell |
| mlx-community/LFM2.5-2.6B-mxfp4 | MXFP4 (Apple MLX) | no disponible | no disponible | Apple MLX |

## Limitaciones y advertencias

- **Licencia restrictiva**: la licencia lfm1.0 de Liquid AI no es una licencia open source estándar; tiene restricciones de uso comercial y puede requerir acuerdos adicionales. Se debe revisar los términos antes de usarlo en producción.
- **Requisito de hardware específico**: la cuantización NVFP4 solo funciona en GPUs Blackwell con soporte FP4. No es portable a otras arquitecturas de NVIDIA ni a otras marcas (AMD, Apple Silicon).
- **Comportamiento en greedy decoding**: el modelo base (y por tanto esta cuantización) entra en bucles de repetición si se usa temperature=0 (greedy). Se recomienda usar la configuración de generación del propio Liquid: temperature 0.1, top_k 50, repetition_penalty 1.1, do_sample true.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede generar información incorrecta o inventada, especialmente en tareas de razonamiento complejo.
- **Sesgos**: no se han documentado sesgos específicos para este modelo, pero al ser un modelo entrenado en datos de internet, puede reflejar sesgos sociales y culturales.
- **Calibración de activaciones**: la cuantización de activaciones es dinámica, lo que requiere una calibración correcta; si se usa fuera del contexto de calibración, puede degradar el rendimiento. El autor indica que no se debe usar la exportación weight-only, que no serviría en el runtime.
- **Soporte de runtime**: requiere versiones específicas de SGLang (v0.5.18-cu130) o vLLM nightly; no es compatible con versiones estables anteriores.

## Enlaces

- [Repositorio del modelo cuantizado en HuggingFace](https://huggingface.co/kingjones777/LFM2.5-2.6B-NVFP4)
- [Modelo base LiquidAI/LFM2.5-2.6B](https://huggingface.co/LiquidAI/LFM2.5-2.6B)
- [Documentación oficial de LFM2.5-2.6B en Liquid Docs](https://docs.liquid.ai/lfm/models/lfm25-2.6b)
- [Blog de Liquid AI: Deploy local agents everywhere with LFM2.5-2.6B](https://huggingface.co/blog/LiquidAI/lfm2-5-2-6b)
- [Blog de Liquid AI: LFM2.5-2.6B - Deploy Agents Everywhere](https://www.liquid.ai/blog/lfm2-5-2-6b)
