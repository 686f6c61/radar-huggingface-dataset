# kmkrworks/LiteGPT-V2-Base-GGUF

## Resumen
LiteGPT-V2-Base-GGUF es la version cuantizada en formato GGUF del modelo LiteGPT-V2-Base, un modelo de lenguaje de 201.373.952 parametros (aproximadamente 201 M) entrenado desde cero por el desarrollador kmkrworks. El modelo emplea la disposicion de parametros de Qwen3 (etiquetado como arquitectura `qwen3` en llama.cpp), con 28 capas, una anchura de 768, 12 cabezas de atencion y 4 cabezas KV, lo que lo situa en la categoria de modelos pequenos orientados a investigacion, aprendizaje y ajuste fino.

La relevancia de esta publicacion radica en su caracter reproducible y auditado: el autor documenta cada paso del proceso de entrenamiento y publica los registros de ejecucion, ademas de verificar la conversion GGUF contra el modelo original en PyTorch antes de su lanzamiento. Se ofrecen tres variantes de cuantizacion (Q8_0, Q4_K_M y BF16) con metricas medidas de velocidad, memoria y degradacion de perplejidad, lo que facilita su despliegue en hardware modesto, incluida una Raspberry Pi.

El modelo esta pensado como base sin ajuste de seguridad, con licencia Apache-2.0 y soporte exclusivo del idioma ingles. Su ventana de contexto es de 4.096 tokens y utiliza un tokenizador BPE a nivel de byte propio de 32.768 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con disposicion de parametros Qwen3 (etiqueta `qwen3` en llama.cpp) |
| Parametros totales | 201.373.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | Q8_0, Q4_K_M, BF16 (y conversion F32 para verificacion) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 (con archivo NOTICE) |
| Formato de pesos | GGUF (llama.cpp); modelo base original en safetensors/PyTorch |

## Arquitectura y entrenamiento
LiteGPT-V2-Base es un transformer decoder-only de 28 capas con dimension oculta de 768, 12 cabezas de atencion y 4 cabezas KV (atencion con query grouping, coherente con el esquema Qwen3). Emplea un tokenizador BPE a nivel de byte propio de 32.768 tokens. La regla de division de llama.cpp utilizada es `qwen2`, que segun el autor coincide exactamente con la regex propia del modelo.

El modelo fue entrenado desde cero por kmkrworks, con documentacion publica de cada etapa en el repositorio GitHub del proyecto. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esa informacion se remite a la model card del modelo base original. La innovacion destacable es la trazabilidad: la conversion GGUF se verifico contra el modelo PyTorch (identicos token ids en 1.200 documentos de validacion, perplejidad de la conversion F32 dentro de 0,001 % respecto a PyTorch en 5 dominios de texto y salida greedy identica en las 23 prompts de prueba).

## Capacidades
- Generacion de texto autoregresiva en ingles.
- Razonamiento basico y generacion de codigo y matematicas (evaluado en los dominios de codigo, matematicas y texto web durante la verificacion de cuantizacion).
- Modelo base sin ajuste de instrucciones ni de seguridad: no incorpora modo conversacional entrenado de forma explicita, aunque la etiqueta `conversational` aparece en los metadatos.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles.
- No dispone de vision, audio ni modo de pensamiento (thinking).

## Casos de uso
- Investigacion y educacion: el modelo sirve como banco de pruebas de bajo coste para estudiar el comportamiento de un transformer pequeno, ya que su entrenamiento y conversion estan documentados paso a paso y es replicable.
- Ajuste fino para tareas especificas: al ser un modelo base de 201 M, se puede ajustar en una sola GPU de consumo para tareas de clasificacion, extraccion o generacion de dominio concreto.
- Despliegue en dispositivos de borde: la variante Q4_K_M (127 MB) y Q8_0 (215 MB) caben en una Raspberry Pi 3 con 1 GB de RAM, lo que permite inferencia local en hardware embebido.
- Prototipado rapido con llama.cpp o LM Studio: la integracion directa con `llama-completion` y `lms get` permite validar pipelines de generacion sin infraestructura dedicada.
- Pruebas de cuantizacion y evaluacion de degradacion: las tres variantes publicadas con metricas de perplejidad permiten estudiar el impacto de la cuantizacion en un modelo pequeno.
- Generacion de texto de bajo coste en ingles: para tareas de completado simple o generacion de borradores donde no se requiere alta calidad ni contexto largo, con velocidades de 189-254 tok/s en CPU de portatil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card proporciona metricas de rendimiento de inferencia y de calidad de cuantizacion:

| Metrica | Q8_0 | Q4_K_M | BF16 |
|---|---|---|---|
| Tamano del archivo | 215 MB | 127 MB | 404 MB |
| RAM pico | 0,35 GiB | 0,35 GiB | 0,52 GiB |
| Decodificacion (4 hilos CPU) | 189 tok/s | 254 tok/s | 109 tok/s |
| Calidad frente a BF16 | perplejidad +0,06 % | perplejidad +1,8 % | referencia |

Medido en un portatil con Intel i9-14900HX, 4 hilos, prompt de 128 tokens y contexto de 4.096 tokens. La decodificacion en Q8_0 es 3,6 veces mas rapida y en Q4_K_M 4,8 veces mas rapida que el modelo original en PyTorch float32 (52,5 tok/s en 1,66 GiB). En Raspberry Pi 5 se estima Q8_0 a unos 44 tok/s (estimacion, no medicion).

## Requisitos de hardware
- VRAM/RAM para inferencia: 0,35 GiB pico para Q8_0 y Q4_K_M; 0,52 GiB para BF16 (proceso completo con contexto de 4.096 tokens).
- GPU recomendadas: no se especifican; el modelo esta optimizado para CPU y cabe en cualquier GPU de consumo, incluidas GTX 1050, RTX 3050 o superiores, aunque la model card no publica mediciones en GPU.
- Cabe en GPU de consumo: si, con amplio margen; tambien en Raspberry Pi 3 (1 GB) y Raspberry Pi 5.
- Opciones de despliegue: llama.cpp (build b12084 o posterior), LM Studio, y cualquier aplicacion construida sobre llama.cpp. No se documenta soporte de vLLM, TGI u Ollama.
- Latencia y throughput: 189 tok/s (Q8_0) y 254 tok/s (Q4_K_M) en CPU de portatil con 4 hilos; 109 tok/s en BF16. En Raspberry Pi 5 se estiman 44 tok/s para Q8_0.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan una comparativa de rendimiento con alternativas. A continuacion se comparan caracteristicas estructurales con modelos de tamano similar de la misma categoria:

| Modelo | Parametros | Contexto | Licencia | Formato | Idiomas |
|---|---|---|---|---|---|
| LiteGPT-V2-Base-GGUF | 201 M | 4.096 | Apache-2.0 | GGUF | Ingles |
| Qwen3-0.6B | 0,6 B | no disponible en esta ficha | Apache-2.0 | safetensors, GGUF | Multilingue |
| SmolLM2-135M | 135 M | no disponible en esta ficha | Apache-2.0 | safetensors, GGUF | Ingles |
| TinyLlama-1.1B | 1,1 B | no disponible en esta ficha | Apache-2.0 | safetensors, GGUF | Ingles |

Las cifras de los modelos alternativos no se han verificado en la informacion proporcionada y se incluyen solo como referencia estructural; no se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias
- Es un modelo base sin ajuste de seguridad ni de instrucciones: puede generar contenido inapropiado o erroneo; se recomienda anadir salvaguardas antes de exponerlo a usuarios.
- Riesgo de alucinacion elevado por su tamano reducido (201 M) y su limitada capacidad de razonamiento.
- Ventana de contexto corta (4.096 tokens), insuficiente para documentos largos o conversaciones multi-turno extensas.
- Soporte exclusivo del ingles; no se garantiza calidad en otros idiomas.
- llama.cpp no aplica normalizacion Unicode NFC para tokenizadores BPE, por lo que es necesario normalizar la entrada con acentos descompuestos antes de la inferencia; el texto ordinario no se ve afectado.
- Licencia Apache-2.0 permite uso comercial, pero se debe incluir el archivo NOTICE y respetar las atribuciones de los datos de entrenamiento indicadas en la model card del modelo base.
- No se documenta soporte de tool calling, agentes ni modo de pensamiento, lo que limita su uso en pipelines complejos.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces
- Hugging Face (GGUF): https://huggingface.co/kmkrworks/LiteGPT-V2-Base-GGUF
- Modelo base: https://huggingface.co/kmkrworks/LiteGPT-V2-Base
- Repositorio GitHub del proyecto: https://github.com/kmkrofficial/LiteGPT
- Resultados de llama.cpp (GGUF): https://github.com/kmkrofficial/LiteGPT/blob/main/docs/results.md#llamacpp-gguf
- llama.cpp: https://github.com/ggml-org/llama.cpp
