# AutomatosX/AX-DeepSeek-V4-Flash-MLX-AXQ-4bit-MTP

## Resumen

AX-DeepSeek-V4-Flash-MLX-AXQ-4bit-MTP es un checkpoint cuantizado en formato MLX para Apple Silicon, desarrollado por AutomatosX a partir del modelo base deepseek-ai/DeepSeek-V4-Flash. Se trata de una conversión directa del modelo original en BF16 a una cuantización mixta de precisión denominada AXQuant (AXQ), que mantiene la ruta de lenguaje en 4 bits mientras preserva la cabeza de predicción multi-token (MTP) en BF16. El objetivo es ofrecer una versión reducida en almacenamiento y optimizada para ejecución en hardware de Apple, aunque el propio autor advierte que se trata de una evidencia de desarrollo y no de una versión certificada.

El modelo base es un mixture of experts (MoE) de 284,33 mil millones de parámetros lógicos con aproximadamente 13 mil millones de parámetros activos por token, diseñado para tareas de codificación, uso de herramientas y flujos agénticos. El checkpoint cuantizado ocupa 166,9 GB y está configurado para una ventana de contexto máxima de 1.048.576 tokens, aunque esta cifra es metadata de configuración y no una garantía validada de calidad en contextos largos. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones significativas.

La relevancia de este modelo radica en su capacidad para ejecutar un MoE de gran tamaño en hardware de Apple Silicon con una huella de almacenamiento reducida, aunque la ausencia de métricas de calidad publicadas y la falta de certificación formal limitan su uso en producción sin una validación adicional por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepseekV4ForCausalLM (mixture of experts, MoE) |
| Parametros totales | 284,33B logicos (MoE); 46.231.466.071 en safetensors cuantizado |
| Parametros activos | ~13B por token (segun modelo base) |
| Longitud de contexto | 1.048.576 tokens (configurado; no validado) |
| Tipos de cuantizacion | AXQuant mixto: 4bit base (96,84% de los pesos), 8bit (0,18%), BF16 (2,98%); BPW total medido 4,5874 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX safetensors (no incluye PyTorch ni GGUF) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Flash emplea una arquitectura transformer con mezcla de expertos (MoE), con 284,33 mil millones de parámetros lógicos y aproximadamente 13 mil millones de parámetros activos por token, lo que permite un equilibrio entre capacidad y coste computacional. El checkpoint cuantizado AXQ aplica una estrategia de precisión mixta: la ruta de texto principal se cuantiza a 4 bits con grupos de tamaño 32 y 64, mientras que los tensores protegidos se mantienen en 8 bits o BF16. La cabeza MTP (multi-token prediction) se conserva en BF16 en un sidecar de 6,61 mil millones de parámetros.

No se dispone de información sobre los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO). La cuantización se realizó sin calibración, basándose únicamente en priors de arquitectura, y el autor declara explícitamente que no se han publicado métricas de calidad frente al modelo BF16 original ni frente a cuantizaciones uniformes. El artefacto registra MLX 0.32.0 y MLX-LM 0.31.3 como versiones de conversión.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo base DeepSeek-V4-Flash.
- Codificacion y generacion de codigo, incluyendo soporte para tool calling y flujos agénticos, segun las especificaciones del modelo base.
- Razonamiento multi-paso y uso de herramientas en entornos de agente.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Prediccion multi-token (MTP) presente en el checkpoint, aunque sin evidencia de aceleracion o calidad medida.
- Sin soporte de vision ni audio (no se incluye sidecar de vision).

## Casos de uso

- Asistente de codificacion en entornos Apple Silicon: el modelo puede ejecutarse localmente en Macs con memoria unificada suficiente, proporcionando autocompletado y generacion de codigo sin depender de servicios en la nube, gracias a su formato MLX optimizado.
- Automatizacion de tareas agénticas con tool calling: su soporte para invocacion de funciones permite construir agentes que interactuan con APIs, ejecutan comandos o gestionan flujos de trabajo multi-paso, aunque la ausencia de benchmarks obliga a validar la fiabilidad en cada caso.
- Desarrollo de prototipos y experimentacion en local: investigadores y desarrolladores pueden probar el comportamiento de un MoE de 284B en hardware de consumo sin necesidad de GPUs de gran tamano, utilizando la cuantizacion AXQ para reducir los requisitos de almacenamiento.
- Generacion de documentacion tecnica y resumen de codigo: el modelo puede procesar fragmentos de codigo y producir explicaciones o documentacion, aprovechando su ventana de contexto amplia para manejar proyectos extensos.
- Chatbot de soporte tecnico especializado: con su capacidad de razonamiento y generacion de texto, puede responder consultas tecnicas complejas en un entorno controlado, siempre que se implementen salvaguardas contra alucinaciones.
- Investigacion en cuantizacion y eficiencia de modelos: al ser un checkpoint de desarrollo con metadatos detallados de cuantizacion, sirve como caso de estudio para evaluar el impacto de AXQuant en modelos MoE de gran escala, aunque sin metricas de calidad publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se incluye evidencia de calidad, rendimiento en contextos largos, velocidad de kernels ni aceleracion MTP. El autor declara que el paquete no esta certificado y que las compuertas formales de calidad M0-M8 de AXQuant no estan cerradas.

## Requisitos de hardware

- Almacenamiento: se requieren al menos 166,91 GB de espacio libre en disco para la descarga completa.
- Memoria unificada: para cargar los 166,83 GB de pesos en memoria, se necesita un Mac con al menos 192 GB de memoria unificada (por ejemplo, Apple M2 Ultra o M3 Ultra con configuracion maxima). Con menos memoria, el sistema operativo recurrira a swapping, lo que degradara severamente el rendimiento.
- GPU recomendadas: no aplica a GPUs discretas; el formato MLX esta disenado exclusivamente para Apple Silicon.
- Opciones de despliegue: MLX-LM es el runtime principal soportado. El comando de generacion se ejecuta con `mlx_lm.generate`. No se incluye soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no se han publicado mediciones. La ausencia de benchmarks de velocidad de kernels impide estimar el rendimiento en inferencia.
- AX Engine: no se incluye un manifest nativo validado, por lo que la ejecucion a traves de AX Engine no esta establecida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| AX-DeepSeek-V4-Flash-MLX-AXQ-4bit-MTP (este) | 284,33B logicos, ~13B activos | 1M tokens (config) | Apache-2.0 | MLX safetensors | Hugging Face |
| deepseek-ai/DeepSeek-V4-Flash (original BF16) | 284,33B logicos, ~13B activos | 1M tokens | Apache-2.0 | PyTorch / safetensors | Hugging Face |
| deepseek-ai/DeepSeek-V4-Pro | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativos. La comparativa se limita a parametros, contexto y licencia. El modelo original BF16 ofrece la misma arquitectura sin perdida por cuantizacion, pero requiere mucho mas almacenamiento (probablemente varios cientos de GB) y no esta optimizado para Apple Silicon. DeepSeek-V4-Pro es mencionado en fuentes externas como un modelo mayor, pero no se dispone de especificaciones verificadas.

## Limitaciones y advertencias

- El paquete no esta certificado: el autor declara que las compuertas formales de calidad M0-M8 de AXQuant no estan cerradas y que no se publican metricas de calidad, rendimiento en contexto largo, velocidad de kernels ni aceleracion MTP.
- La cuantizacion se realizo sin calibracion, basandose en priors de arquitectura, lo que puede provocar una degradacion impredecible de la calidad en tareas especificas.
- La ventana de contexto de 1.048.576 tokens es metadata de configuracion, no una garantia de calidad en contextos largos; el rendimiento real puede degradarse significativamente.
- La cabeza MTP esta presente pero su aceleracion no ha sido medida; no se puede asumir ninguna mejora de velocidad.
- El runtime MLX-LM puede ignorar los metadatos de AXQuant y los sidecars opcionales (vision, MTP), por lo que la ejecucion estandar no establece aceleracion MTP ni calidad de vision.
- No se incluye soporte para vision ni audio; el modelo es exclusivamente de texto.
- Riesgo de alucinaciones y sesgos inherentes a los modelos de lenguaje de gran tamano, no mitigados por la cuantizacion.
- Requisitos de hardware muy elevados: necesita al menos 192 GB de memoria unificada en Apple Silicon, lo que limita su uso a equipos de gama alta.
- No se han publicado datos de entrenamiento del modelo base, lo que impide evaluar sesgos o limitaciones idiomaticas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AutomatosX/AX-DeepSeek-V4-Flash-MLX-AXQ-4bit-MTP
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Catalogo de modelos MLX de AutomatosX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
- Articulo sobre configuracion de DeepSeek V4-Flash: https://tech-insider.org/how-to-set-up-deepseek-v4-flash-2026/
- Motor de inferencia local DwarfStar para DeepSeek V4 Flash: https://github.com/antirez/ds4
- Pagina del modelo en LM Studio: https://lmstudio.ai/models/deepseek-v4-flash
