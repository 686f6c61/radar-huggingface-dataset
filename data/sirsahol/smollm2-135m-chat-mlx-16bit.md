# SirSahOl/SmolLM2-135M-chat-mlx-16bit

## Resumen

SmolLM2-135M-chat-mlx-16bit es una conversion a formato MLX del modelo HuggingFaceTB/SmolLM2-135M, publicada por el usuario SirSahOl. No se trata de un modelo entrenado desde cero, sino de un reempaquetado del checkpoint original en precision de 16 bits (bfloat16 sin cuantizar) para ejecucion nativa sobre la GPU unificada de los chips Apple Silicon mediante el framework MLX de Apple. El modelo base es un transformer causal tipo Llama (LlamaForCausalLM) con 134.515.008 parametros (135M) y una ventana de contexto de 8.192 tokens.

Su relevancia es practica: permite ejecutar un modelo de lenguaje conversacional completo en un Mac con tan solo 8 GB de memoria unificada, con un consumo de VRAM activo declarado de aproximadamente 410 MB y un pico de memoria medido de 235,2 MB en un Apple M1. Al estar distribuido en safetensors y bajo licencia Apache 2.0, es util para prototipado local, pruebas de pipelines MLX y despliegues de borde donde no se dispone de GPU dedicada.

Conviene subrayar que se trata de la variante de 16 bits de una familia que el mismo autor publica tambien en 4 y 8 bits. La version de 16 bits no introduce penalizacion de perplejidad por cuantizacion, por lo que resulta la opcion de referencia para evaluacion y benchmarking, a costa de un mayor tamano en disco (~260-290 MB) y una velocidad de generacion inferior a las variantes cuantizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer causal denso) |
| Parametros totales | 134.515.008 (135M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | 16 bits (bfloat16 sin cuantizar); el autor publica ademas variantes de 4 y 8 bits |
| Idiomas soportados | Ingles (etiqueta `en` del repositorio); no se detalla lista completa de idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal denso de tipo Llama, identificado en la model card como `LlamaForCausalLM`, con 135M de parametros y 8.192 tokens de contexto. El repositorio no aporta informacion sobre la composicion del dataset, el numero de tokens de entrenamiento ni si hubo fases de RLHF o DPO. La model card se limita a citar el paper arXiv:2502.02737, que corresponde al trabajo de la familia SmolLM2, sin reproducir sus detalles de entrenamiento.

La innovacion tecnica de esta publicacion no esta en el modelo en si, sino en el proceso de conversion. Se ha utilizado `mlx-lm` version 0.31.3 para transformar el checkpoint original de HuggingFaceTB/SmolLM2-135M a un formato nativo de MLX, en un tiempo de conversion declarado de 1,39 segundos y con un tamano de salida de 260,0 MB. No se aplica cuantizacion: los pesos se mantienen en bfloat16. El resultado se distribuye en safetensors y se acompaña de la plantilla de chat y de los tokens de parada necesarios (`<|im_start|>`, `<|im_end|>`, `<|endoftext|>`) para un uso conversacional correcto en runtimes locales.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat que admite roles de sistema, usuario y asistente.
- Respuestas de formato corto y tareas linguisticas basicas propias de un modelo de 135M de parametros.
- Ejecucion nativa en GPU de Apple Silicon mediante MLX, sin necesidad de GPU dedicada.
- Inferencia local con ventana de contexto de 8.192 tokens, suficiente para conversaciones multi-turno moderadas.
- Compatibilidad declarada con text-generation-inference y endpoints compatibles, y con despliegue en Azure segun las etiquetas del repositorio.
- Integracion con Ollama y LM Studio mediante plantilla de prompt y tokens de parada documentados.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, vision ni audio en la informacion disponible.

## Casos de uso

- Prototipado local en Mac: permite validar rapidamente flujos conversacionales y plantillas de prompt en un equipo Apple Silicon sin depender de servicios en la nube, aprovechando que el modelo ocupa menos de 410 MB de memoria activa.
- Pruebas de pipelines MLX: sirve como modelo de referencia para verificar que una instalacion de `mlx-lm`, un script de generacion o una integracion con safetensors funciona correctamente antes de escalar a modelos mayores de la misma familia.
- Benchmarking de cuantizacion: al ser la variante sin cuantizar, es el punto de comparacion natural frente a las versiones de 4 y 8 bits del mismo autor para medir perdida de calidad y ganancia de velocidad.
- Asistentes conversacionales de borde: puede desplegarse como chatbot ligero en un Mac con 8 GB de memoria unificada, gestionando turnos con la plantilla `<|im_start|>` / `<|im_end|>` documentada.
- Generacion de texto en lote de bajo coste: tareas como resumenes muy breves, reformulacion de frases o generacion de titulares, donde la calidad de un modelo de 135M es suficiente y el coste computacional es minimo.
- Educacion y demos: util para ilustrar el funcionamiento de un transformer causal y de un pipeline de conversion a MLX en entornos docentes o talleres, dado su tamano reducido y su licencia permisiva.
- Filtrado previo en cascada: como primer nivel de un sistema con un modelo mayor, descartando o etiquetando entradas triviales antes de invocar un modelo mas costoso.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros). Los unicos datos publicados son mediciones de rendimiento de inferencia sobre un Apple M1 con 8 GB de memoria unificada, promediadas sobre 5 ejecuciones con un maximo de 256 tokens:

| Metrica | 4 bits | 8 bits | 16 bits |
|---|---|---|---|
| Tokens por segundo | 251,62 | 200,75 | 144,45 |
| TTFT (tiempo hasta el primer token) | 3,98 ms | 4,99 ms | 6,93 ms |
| Memoria pico | 150,3 MB | 84,3 MB | 235,2 MB |

No se han publicado resultados de benchmarks de calidad en la informacion disponible.

## Requisitos de hardware

- VRAM activa declarada: aproximadamente 410 MB. Memoria pico medida en Apple M1: 235,2 MB.
- Memoria unificada minima recomendada por el autor: 8 GB.
- Hardware objetivo: chips Apple Silicon M1, M2, M3 o M4. El autor recomienda 4 bits para equipos con 8-16 GB, 8 bits para 18-36 GB y 16 bits para configuraciones Max/Ultra de 36-192 GB.
- No esta pensado para GPU NVIDIA o AMD: el formato es MLX, especifico de Apple Silicon. Para CUDA habria que recurrir al checkpoint original en HuggingFace Transformers.
- Opciones de despliegue documentadas: `mlx-lm` (CLI `mlx_lm.chat` y `mlx_lm.generate`), API de Python con `mlx_lm.load` y `generate`, Ollama mediante un Modelfile con tokens de parada personalizados, y LM Studio.
- Latencia y throughput medidos: 144,45 tokens/s y 6,93 ms de TTFT en Apple M1 para la variante de 16 bits.
- Tamano en disco: repositorio de 0,3 GB; salida de conversion reportada de 260,0 MB; el autor cifra la variante de 16 bits en ~290 MB de disco y ~360 MB de huella de VRAM en la tabla comparativa de cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision / tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolLM2-135M-chat-mlx-16bit (este) | 135M | 8.192 tokens | 16 bits, ~260-290 MB | Apache 2.0 | MLX, Apple Silicon |
| SmolLM2-135M-chat-mlx-8bit (mismo autor) | 135M | 8.192 tokens | 8 bits, ~157 MB | Apache 2.0 | MLX, Apple Silicon |
| SmolLM2-135M-chat-mlx-4bit (mismo autor) | 135M | 8.192 tokens | 4 bits, ~84 MB | Apache 2.0 | MLX, Apple Silicon |
| HuggingFaceTB/SmolLM2-135M (modelo base) | 135M | 8.192 tokens | bfloat16, formato Transformers | Apache 2.0 | safetensors, multiplataforma |

No se dispone de datos de rendimiento comparativo frente a otros modelos de la misma categoria (por ejemplo, alternativas de ~100-500M de parametros de otros fabricantes) en la informacion proporcionada.

## Limitaciones y advertencias

- El propio autor advierte que la cuantizacion group-wise de 4 bits introduce una perdida de precision notable frente a los pesos sin cuantizar; la variante de 16 bits es la que evita ese problema.
- Al ser un modelo de 135M de parametros, la calidad de razonamiento, la coherencia en respuestas largas y el conocimiento factual son limitados en comparacion con modelos de mayor tamano.
- Riesgo elevado de alucinacion, especialmente en preguntas factuales, calculos y tareas que requieren conocimiento enciclopedico.
- La etiqueta de idioma del repositorio es `en`: el soporte multilingue no esta documentado y el rendimiento en castellano probablemente sea bajo.
- Es imprescindible configurar correctamente los tokens de parada (`<|im_start|>`, `<|im_end|>`, `<|endoftext|>`) en el runtime de inferencia; de lo contrario el autor advierte de bucles descontrolados y turnos conversacionales mal cerrados.
- El formato MLX limita el uso a hardware Apple Silicon; no es directamente desplegable en GPU NVIDIA o AMD sin reconvertir el modelo.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indiquen los cambios. No se imponen restricciones adicionales conocidas.
- No se documentan capacidades de tool calling ni de agentes, por lo que no deberia asumirse su uso en pipelines que dependan de estas funciones.
- El repositorio tiene 273 descargas y 0 "likes" en el momento de la consulta, lo que indica una adopcion muy reducida y escasa validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SirSahOl/SmolLM2-135M-chat-mlx-16bit
- Variante de 4 bits: https://huggingface.co/SirSahOl/SmolLM2-135M-chat-mlx-4bit
- Variante de 8 bits: https://huggingface.co/SirSahOl/SmolLM2-135M-chat-mlx-8bit
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Perfil del autor: https://huggingface.co/SirSahOl
- Framework MLX: https://github.com/ml-explore/mlx
- Paper de referencia citado en el repositorio (arXiv:2502.02737): https://arxiv.org/abs/2502.02737
