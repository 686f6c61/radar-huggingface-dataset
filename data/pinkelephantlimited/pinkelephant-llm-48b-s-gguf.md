# pinkelephantlimited/pinkelephant-llm-48b-s-gguf

## Resumen

Pink Elephant 48B-S es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Pink Elephant Limited. Su caracteristica principal es que no ha sido entrenado desde cero, sino que se ha obtenido mediante un proceso de upcycling a partir de un modelo denso de 14.66B parametros, replicando y dividiendo los pesos de las capas feedforward en ocho expertos complementarios. Esto permite alcanzar una capacidad equivalente a un modelo denso de 48B con una activacion de solo ~30.7% de los parametros por token, lo que se traduce en un ahorro computacional de 3.2x en FLOPs.

El modelo presentado en este repositorio es la version final de la linea Pink Elephant, que ha pasado por un proceso de refinamiento (una segunda epoca completa), fine-tuning supervisado (SFT) con QLoRA y alineacion por preferencias (DPO). El resultado se ha fusionado de forma bit-exacta y convertido a formato GGUF para su ejecucion en entornos como llama.cpp y Ollama. Con una ventana de contexto de 16,384 tokens y una licencia MIT, esta orientado a uso empresarial y despliegue on-device, destacando por su eficiencia computacional y su capacidad para ejecutarse en una sola GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture-of-Experts) con 8 expertos y routing top-2 |
| Parametros totales | 47.691.289.600 (47.7B) |
| Parametros activos | ~14.66B (30.7% por token) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (con version base safetensors disponible) |

## Arquitectura y entrenamiento

El modelo parte de una arquitectura transformer decoder-only con configuracion LLaMA. La base es un modelo denso de 14.66B parametros (Pink Elephant 14B) que fue entrenado desde cero con 2+ trillones de tokens de codigo, lenguaje natural y datos matematicos. A partir de esta base, se aplico un proceso de upcycling: los pesos feedforward se dividieron y replicaron en ocho expertos complementarios por capa, creando una arquitectura MoE con routing top-2 que preserva exactamente el comportamiento del modelo padre en la inicializacion.

El entrenamiento continuo con una segunda epoca completa (3,114 pasos) con un nuevo programa de coseno, reduciendo la perdida de entrenamiento un 32% (de 0.0616 a 0.0419). Posteriormente se aplico un SFT con QLoRA (base congelada en 4-bit NF4, adaptadores en precision completa) sobre un dataset de 99,661 ejemplos de codigo y matematicas, identificando el mejor adapter en el paso 90,000 con una perdida de validacion de 0.5392. Finalmente, se aplico DPO con una politica entrenable y un modelo de referencia congelado, deteniendose de forma temprana en el paso 11,579 al encontrar el minimo de la curva de perdida (0.4763). El modelo final se obtiene mediante la formula `W = W_base + 2·(SFT_B@SFT_A) + 2·(DPO_B@DPO_A)` con r=32 y alpha=64.

## Capacidades

- Generacion de texto y razonamiento: capacidades generales de continuacion y respuesta a instrucciones en ingles.
- Codigo: entrenado sobre datasets de instrucciones de codigo (self-oss-instruct) y matematicas (OpenR1-Math), con buen rendimiento en tareas de programacion.
- Matematicas: con resultados de GSM8K del 68.5%, muestra competencia en razonamiento aritmetico y resolucion de problemas.
- Soporte de tool calling y function calling: no se menciona explicitamente en la informacion disponible, por lo que no se puede confirmar.
- Capacidades de agente y multi-step reasoning: no documentado de forma explicita, aunque el fine-tuning con SFT y DPO sugiere mejoras en seguir instrucciones y alineacion.
- Capacidades multilingues: limitado al ingles, segun la etiqueta de idioma.
- Capacidades especiales: no se mencionan capacidades de vision, audio o modo de pensamiento dedicado.

## Casos de uso

- **Asistente de codigo en local**: el modelo puede ejecutarse en una estacion de trabajo con GPU consumer y proporcionar sugerencias de codigo, explicaciones y refactorizaciones sin enviar datos a la nube, gracias a su licencia MIT y su eficiencia computacional (3.2x menos FLOPs que un denso 48B).
- **Razonamiento matematico en entornos educativos**: con un 68.5% en GSM8K, puede servir como base para sistemas de tutoria que resuelvan problemas aritmeticos paso a paso.
- **Generacion de documentacion tecnica**: su entrenamiento en codigo y lenguaje natural le permite redactar documentacion, comentarios y explicaciones de funciones.
- **Procesamiento de datos empresariales**: con contexto de 16k tokens, puede analizar documentos extensos, resumir informes y extraer informacion clave en ingles.
- **Desarrollo de prototipos con Ollama**: al estar en formato GGUF y ser compatible con Ollama, se puede desplegar rapidamente en entornos de desarrollo locales o en servidores modestos.
- **Investigacion en eficiencia de modelos**: su proceso de upcycling de 14B a 48B MoE es un caso de estudio valioso para equipos que exploran escalado de modelos sin entrenamiento desde cero.
- **Sistemas de RAG (Retrieval-Augmented Generation)**: con su contexto de 16k tokens y capacidad de procesamiento eficiente, puede integrarse en pipelines de recuperacion y generacion para respuestas basadas en documentos.

## Benchmarks y rendimiento

Los siguientes resultados corresponden a la version alineada (SFT + DPO) en bf16, con decodificacion greedy, evaluada en una NVIDIA RTX PRO 6000 Blackwell:

| Benchmark | Resultado |
|---|---|
| GSM8K | 68.5% |
| MMLU (5-shot) | 68.0% |

No se han publicado resultados comparativos con otros modelos en la informacion disponible. Los datos provienen de la model card del autor y no se han verificado de forma independiente.

## Requisitos de hardware

- **VRAM estimada**: la version cuantizada Q4_K_M ocupa aproximadamente 124.6 GB en disco, pero la VRAM necesaria para inferencia dependera del contexto y el batch. Con una cuantizacion Q4_K_M, se estima un uso de VRAM de aproximadamente 27-30 GB para el modelo completo, mas overhead de contexto.
- **GPU recomendadas**: para ejecutar el modelo completo en Q4_K_M se recomienda una GPU con al menos 32 GB de VRAM, como una RTX 4090 (24 GB) podria no ser suficiente, mientras que una RTX A6000 (48 GB) o una RTX PRO 6000 Blackwell (96 GB) son adecuadas. Para despliegue en servidores, una A100 40 GB o H100 80 GB son opciones validas.
- **Compatibilidad con GPU consumer**: con la cuantizacion Q4_K_M y una ventana de contexto moderada, podria caber en una RTX 3090 o RTX 4090 si se usa offloading de capas a RAM, pero con limitaciones de velocidad. No es ideal para hardware de gama baja.
- **Opciones de despliegue**: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. No se menciona soporte explicito para vLLM o TGI en la informacion disponible, pero la compatibilidad con GGUF sugiere que puede usarse con llama.cpp y sus derivados.
- **Latencia y throughput**: no se han publicado datos concretos de latencia o throughput. Como estimacion orientativa, un modelo MoE con 14.66B activos por token en Q4_K_M podria generar entre 10 y 20 tokens/segundo en una GPU de gama alta, pero no hay mediciones oficiales.

## Comparativa con modelos similares

No hay informacion disponible sobre modelos comparables en la misma categoria (MoE de ~48B con activacion de ~15B) en la informacion proporcionada. Como referencia generica, se podria comparar con modelos como Mixtral 8x7B (47B totales, ~13B activos) o DeepSeek MoE, pero no se dispone de datos de benchmark comparativos para Pink Elephant 48B-S frente a estos.

## Limitaciones y advertencias

- **Idioma**: el modelo solo soporta ingles. No es adecuado para aplicaciones en otros idiomas sin fine-tuning adicional.
- **Sesgos**: no se han publicado evaluaciones de sesgos o seguridad. Es probable que contenga sesgos presentes en los datos de entrenamiento (codigo, matematicas, texto en ingles).
- **Riesgo de alucinacion**: como cualquier LLM, puede generar informacion falsa o inventada, especialmente en dominios fuera de su entrenamiento principal (codigo y matematicas).
- **Contexto limitado**: la ventana de 16k tokens es moderada y puede ser insuficiente para documentos muy largos o conversaciones muy extensas.
- **Licencia**: la licencia MIT permite uso comercial sin restricciones, pero no se proporcionan garantias ni soporte. El usuario es responsable de los resultados.
- **Verificacion independiente**: los benchmarks y datos de entrenamiento provienen de la model card del autor y no se han verificado de forma independiente. Se recomienda validar el rendimiento en casos de uso reales.
- **Hardware**: no es un modelo para hardware de gama baja; requiere al menos 24-32 GB de VRAM para un uso comodo.

## Enlaces

- **Hugging Face (GGUF)**: https://huggingface.co/pinkelephantlimited/pinkelephant-llm-48b-s-gguf
- **Modelo base (safetensors)**: https://huggingface.co/pinkelephantlimited/pinkelephant-llm-48b-s
- **Modelo 48B MoE**: https://huggingface.co/pinkelephantlimited/pinkelephant-llm-48b
- **Modelo 14B denso**: https://huggingface.co/pinkelephantlimited/pink-elephant-llm-14b
- **Modelo SFT**: https://huggingface.co/pinkelephantlimited/pinkelephant-llm-48b-s-sft
- **Modelo DPO**: https://huggingface.co/pinkelephantlimited/pinkelephant-llm-48b-s-dpo
- **Repositorio GitHub**: https://github.com/pinkelephantlimited/pink-elephant-llm
- **Perfil de la organizacion**: https://huggingface.co/pinkelephantlimited
- **GitHub de la organizacion**: https://github.com/pinkelephantlimited/
