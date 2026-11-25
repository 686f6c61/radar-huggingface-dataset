# pranil00/ONIX-Qwen2.5-1.5B-Instruct-GGUF

## Resumen

ONIX-Qwen2.5-1.5B-Instruct-GGUF es una cuantización en formato GGUF del modelo Qwen2.5-1.5B-Instruct de Alibaba, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. El artefacto emplea el esquema de cuantización Q5_K_M (5,5 bits por peso) y está pensado para ejecución local en hardware de consumo mediante el motor run-any-model, además de ser compatible con llama.cpp, Ollama, LM Studio y Jan. El modelo base pertenece a la familia Qwen2.5, una arquitectura transformer decoder-only con 1.777.029.120 parámetros.

El problema que resuelve es el de permitir inferencia de un modelo instruct de 1,5B parámetros en equipos con recursos limitados: el peso cuantizado ocupa 1,19 GB frente a los 3,48 GB en FP16, con una reducción del 65,6 % y una retención de calidad estimada del 97,5 % según la model card. La ventana de contexto óptima declarada para el artefacto es de 8.192 tokens en Apple Silicon y GPU NVIDIA, y de 4.096 tokens en CPU.

Es relevante ahora por su enfoque en despliegue multiplataforma (Metal, CUDA, AVX2/AVX-512) y por su licencia Apache 2.0, aunque el repositorio no registra descargas ni interacciones y la información técnica disponible procede casi exclusivamente de la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5) |
| Parametros totales | 1.777.029.120 (1,78B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (Apple Silicon y GPU NVIDIA); 4.096 tokens (CPU) |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso); unico artefacto publicado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El artefacto es una conversión cuantizada del modelo Qwen/Qwen2.5-1.5B-Instruct, un transformer decoder-only de la familia Qwen2.5 con 1,78B parámetros. La model card no detalla la composición del dataset de entrenamiento, el número de tokens, ni si hubo fases de RLHF o DPO en el modelo base; esa información corresponde al modelo original de Alibaba y no se reproduce en este repositorio.

La innovación técnica del artefacto es la cuantización Q5_K_M realizada con el motor run-any-model, que según la auditoría incluida acelera las 28 capas del modelo (28/28) y mantiene el búfer de KV cache en 112 MB en FP16. La model card reporta una ratio de compresión de 2,91x respecto a FP16 y una retención de calidad estimada del 97,5 %, aunque no se documenta la metodología de esa estimación.

## Capacidades

- Generación de texto conversacional e instruccional, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento básico y respuesta a instrucciones en formato chat (plantilla Qwen con tokens `<|im_end|>` y `<|endoftext|>`).
- Generación de código y matemáticas a nivel de modelo pequeño; no se documentan evaluaciones específicas en este repositorio.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la model card no enumera idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles; el pipeline declarado es únicamente text-generation.

## Casos de uso

- Asistente conversacional local en portátiles: con 1,33 GB de memoria unificada en Apple Silicon y 8.192 tokens de contexto, el modelo puede mantener conversaciones multi-turno en un equipo M1 o superior sin conexión a red.
- Prototipado rápido de aplicaciones de chat: la integración con Ollama mediante un Modelfile permite desplegar un endpoint conversacional en minutos para validar flujos de producto antes de migrar a modelos mayores.
- Generación de texto en entornos con GPU de consumo: con 2,69 GB de VRAM dedicada en tarjetas RTX 30/40/50, cabe holgadamente en una RTX 3060 de 12 GB o una RTX 4060 de 8 GB, dejando margen para otras tareas.
- Automatización de tareas de redacción y resumen en CPU: con 3,33 GB de RAM libre y soporte AVX2/AVX-512, puede ejecutarse en servidores sin GPU para procesamiento por lotes de textos cortos.
- Evaluación de pipelines de cuantización: útil como caso de referencia para comparar la calidad de Q5_K_M frente a FP16 en tareas concretas antes de aplicar el mismo esquema a modelos mayores.
- Educación e investigación reproducible: al ser un artefacto de 1,19 GB con licencia Apache 2.0, se puede distribuir y ejecutar en aulas o entornos de laboratorio con hardware heterogéneo.
- Integración en herramientas de escritorio: LM Studio, Jan y Text-Generation-WebUI lo cargan directamente desde el directorio `models/`, lo que facilita incorporarlo a asistentes de escritorio sin backend propio.

## Benchmarks y rendimiento

La model card incluye una auditoría de cuantización (DeviceQuant Telemetry Audit Report) que compara FP16 frente a Q5_K_M, pero no contiene resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) ni comparaciones con otros modelos. Los datos disponibles son exclusivamente de memoria y compresión:

| Metrica | FP16 (base) | Q5_K_M (artefacto) | Cambio |
|---|---|---|---|
| Precision en bits por parametro | 16,0 | 5,5 | -65,6 % |
| Tamano de pesos | 3,48 GB | 1,19 GB | -65,6 % |
| KV cache | 112,0 MB (FP16) | 112,0 MB (FP16) | Optimizado |
| RAM residente total | 3,61 GB | 1,33 GB | -63,1 % |
| Calidad estimada | 100,0 % | 97,5 % | -2,5 % |
| Capas aceleradas | 0 % | 28/28 | Optimo |

No se han publicado resultados de benchmarks de calidad en la información disponible.

## Requisitos de hardware

- VRAM estimada: 2,69 GB de VRAM dedicada en GPU NVIDIA (RTX 30/40/50) para el artefacto Q5_K_M.
- Memoria unificada: 1,33 GB en Apple Silicon (M1/M2/M3/M4/M5) con aceleración Metal nativa.
- CPU: 3,33 GB de RAM libre en Windows/Linux, con soporte AVX2/AVX-512; contexto óptimo reducido a 4.096 tokens.
- GPU recomendadas: cualquier RTX 30/40/50 con al menos 4 GB de VRAM; una RTX 3060, RTX 4060 o superior es suficiente. En el segmento profesional, A100 o H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en la práctica totalidad de tarjetas con 4 GB o más de VRAM.
- Opciones de despliegue: run-any-model (CLI), llama.cpp (`llama-cli`), Ollama (mediante Modelfile), LM Studio, Jan y Text-Generation-WebUI. vLLM y TGI no se mencionan en la model card.
- Latencia y throughput: no disponibles; la model card no publica tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-Qwen2.5-1.5B-Instruct-GGUF (este) | 1,78B | 8.192 (GPU) / 4.096 (CPU) | GGUF Q5_K_M | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-1.5B-Instruct (base) | 1,78B | 32.768 tokens (modelo original) | safetensors | Apache 2.0 | Hugging Face, ampliamente usado |
| Qwen2.5-1.5B-Instruct-GGUF (otras cuantizaciones oficiales) | 1,78B | hasta 32.768 tokens | GGUF (varios esquemas) | Apache 2.0 | Hugging Face |
| Llama 3.2 1B Instruct | 1,24B | 128.000 tokens | safetensors / GGUF | Llama 3.2 Community License | Hugging Face |

La comparativa se limita a parámetros, contexto, formato y licencia; no se dispone de datos de rendimiento comparativo en la información proporcionada. Cabe señalar que el contexto declarado en este artefacto (8.192 tokens en GPU) es inferior al del modelo base original, lo que puede deberse a la configuración de ejecución recomendada y no a una limitación arquitectónica.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al heredar del modelo base Qwen2.5, pueden persistir sesgos del corpus original de Alibaba.
- Riesgo de alucinación: inherente a un modelo de 1,5B parámetros; la model card incluye una cláusula que exime de responsabilidad por cualquier salida generada y responsabiliza al implementador de auditar los resultados.
- Limitación de contexto: la ventana recomendada se reduce a 4.096 tokens en CPU, muy por debajo de los 32.768 tokens del modelo base, lo que limita tareas de contexto largo en ese entorno.
- Idiomas: no se especifican los idiomas soportados en este artefacto; conviene verificar el comportamiento en castellano antes de usarlo en producción.
- Licencia: Apache 2.0 permite uso comercial, pero la model card mezcla referencias a "Apache 2.0 / MIT" y añade una cláusula de exención absoluta de responsabilidad que conviene revisar con asesoría legal.
- Madurez del artefacto: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día (25 de noviembre de 2026), sin validación comunitaria ni métricas de calidad publicadas.
- Precisión de las cifras: la retención de calidad del 97,5 % y el resto de métricas de la auditoría provienen del propio motor run-any-model y no de evaluaciones independientes.
- Tool calling y agentes: no se documenta soporte explícito, por lo que no debe asumirse su funcionamiento en pipelines de agentes sin pruebas previas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-Qwen2.5-1.5B-Instruct-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Organización ONIX en Hugging Face: https://huggingface.co/ONIX
- Motor run-any-model (GitHub): https://github.com/PranilShah-08/run-any-model
