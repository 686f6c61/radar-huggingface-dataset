# pranil00/ONIX-stablelm-2-12b-chat-GGUF

## Resumen
ONIX-stablelm-2-12b-chat-GGUF es una cuantizacion en formato GGUF (esquema Q5_K_M) del modelo stabilityai/stablelm-2-12b-chat, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. El modelo base es un transformer denso de 12.142.919.680 parametros desarrollado por Stability AI, orientado a generacion de texto conversacional. Esta version cuantizada reduce el peso de los pesos de 23,75 GB en FP16 a 8,16 GB, lo que permite ejecutar el modelo en hardware de consumo.

La relevancia de esta publicacion es practica: empaqueta un modelo de 12B en un artefacto de 8,8 GB que cabe en GPUs de consumo con 10-12 GB de VRAM y en equipos Apple Silicon con 16 GB de memoria unificada. El autor incluye una matriz de telemetria propia (denominada DeviceQuant) con estimaciones de memoria y una supuesta retencion de calidad del 97,5 % respecto al modelo original, si bien no se aportan evaluaciones estandar de benchmarks.

Se trata de un artefacto de cuantizacion, no de un modelo entrenado desde cero: no hay informacion sobre dataset de cuantizacion, calibracion ni validacion con metricas reconocidas. La ficha describe tanto el modelo base (arquitectura, capacidades y limitaciones heredadas) como las particularidades del artefacto GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia StableLM 2, modelo denso) |
| Parametros totales | 12.142.919.680 (12,14 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (perfil GPU/Apple Silicon); 4.096 tokens (perfil CPU) segun la model card |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso); el repositorio solo contiene ese artefacto |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero stabilityai--stablelm-2-12b-chat-Q5_K_M.gguf, 8,16 GB) |
| Modelo base | stabilityai/stablelm-2-12b-chat |
| Tamano del repositorio | 8,8 GB |
| Herramienta de cuantizacion | run-any-model (ONIX Community) |

## Arquitectura y entrenamiento
El modelo subyacente es un transformer denso de la familia StableLM 2 de Stability AI, con 12,14 mil millones de parametros. La model card del artefacto no detalla la composicion del dataset de preentrenamiento, el numero de tokens vistos, ni si hubo fases de ajuste fino supervisado, RLHF o DPO en el modelo base; esa informacion corresponderia a la model card oficial de stabilityai/stablelm-2-12b-chat y no se incluye en la informacion disponible.

Respecto al artefacto en si, se trata de una cuantizacion post-entrenamiento a Q5_K_M (5,5 bits por peso, ratio de compresion 2,91x frente a FP16). La model card indica que se aceleran las 40 capas del modelo en Metal y que el buffer de KV cache se mantiene en FP16 (800 MB). No se especifica el conjunto de calibracion ni el metodo exacto de cuantizacion mas alla del esquema K-quant de llama.cpp. La afirmacion de "97,5 % de retencion de calidad cognitiva" es una estimacion del autor sin respaldo en benchmarks publicados.

## Capacidades
- Generacion de texto conversacional multi-turno, heredada del ajuste de chat del modelo base.
- Razonamiento general y respuesta a instrucciones en formato de dialogo (tokens de parada `<|im_end|>` y `<|endoftext|>`).
- Generacion de codigo y tareas de conocimiento general, en la medida en que lo soporte el modelo base de 12B.
- Ejecucion local en CPU, GPU NVIDIA y Apple Silicon mediante llama.cpp, Ollama, LM Studio, Jan y Text-Generation-WebUI.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; el modelo es exclusivamente de texto.
- Modo "thinking" explicito: no disponible.

## Casos de uso
- Asistente conversacional local en estaciones de trabajo: con 8,16 GB de pesos y unos 9-10 GB de memoria total, el modelo puede mantener dialogos multi-turno con hasta 8.192 tokens de contexto en una RTX 3060 de 12 GB o un Mac con 16 GB de memoria unificada, sin depender de la nube.
- Prototipado offline y entornos air-gapped: al ser un unico fichero GGUF ejecutable con llama.cpp, encaja en maquinas sin acceso a internet para pruebas de prompting, generacion de documentacion o resumen de textos internos.
- Generacion de codigo asistida en el editor: integrable en LM Studio o en un servidor local compatible con la API de OpenAI para autocompletado y explicacion de fragmentos, limitado por la calidad del modelo base de 12B.
- Educacion e investigacion sobre cuantizacion: sirve como caso de estudio para medir la degradacion real de un modelo de 12B al pasar de FP16 a Q5_K_M en tareas concretas, comparando con el modelo original.
- Chatbot de soporte interno de bajo coste: desplegable con Ollama en un servidor con CPU AVX2/AVX-512 y 11 GB de RAM, con contexto reducido a 4.096 tokens, para consultas sobre documentacion corporativa.
- Evaluacion comparativa de runners: util para validar el rendimiento de run-any-model, llama.cpp y Ollama sobre el mismo artefacto en distintas plataformas (Metal, CUDA, CPU).

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica tabla aportada por el autor es una matriz de telemetria de memoria y no de calidad:

| Metrica | FP16 (base) | Q5_K_M | Variacion |
|---|---|---|---|
| Precision | 16,0 bits/param | 5,5 bits/param | -65,6 % |
| Tamano de pesos | 23,75 GB | 8,16 GB | -65,6 % |
| KV cache | 800 MB (FP16) | 800 MB (FP16) | sin cambio |
| RAM residente total | 24,62 GB | 9,04 GB | -63,3 % |
| Capas aceleradas | 0 % (riesgo de fallo) | 40/40 | optimo |
| Calidad estimada | 100 % | 97,5 % (estimacion del autor) | -2,5 % |

## Requisitos de hardware
- VRAM estimada para inferencia: 9,66 GB en GPU NVIDIA con contexto de 8.192 tokens; 9,04 GB de memoria unificada en Apple Silicon; 11,04 GB de RAM libre en CPU con contexto de 4.096 tokens (cifras de la model card).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090; en el segmento profesional, A100 o H100 quedan sobredimensionadas para este artefacto y solo se justifican para servir varias instancias.
- Cabe en GPU de consumo: si, en cualquier GPU con 10-12 GB de VRAM o mas. No cabe en GPUs de 8 GB sin reducir contexto o aplicar offload parcial a CPU.
- Apple Silicon: M1/M2/M3/M4/M5 con al menos 16 GB de memoria unificada, con aceleracion Metal nativa en las 40 capas.
- Opciones de despliegue: llama.cpp (llama-cli con `-ngl 99 -cnv`), Ollama (mediante Modelfile), LM Studio, Jan, Text-Generation-WebUI y el CLI run-any-model.
- Latencia y throughput: no disponibles; la model card no aporta tokens por segundo ni latencias medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ONIX-stablelm-2-12b-chat-GGUF (Q5_K_M) | 12,14 B | 8.192 (GPU) / 4.096 (CPU) | GGUF | Apache 2.0 | Artefacto cuantizado, sin benchmarks publicados |
| stabilityai/stablelm-2-12b-chat (FP16) | 12,14 B | el del modelo base | safetensors | Apache 2.0 (modelo base) | Referencia de calidad; requiere ~24 GB de memoria |
| Mistral-7B-Instruct (GGUF) | 7,2 B | 32.768 tokens (modelo base) | GGUF | Apache 2.0 | Menor tamano, contexto mayor; comparacion cualitativa no disponible en esta ficha |
| Llama 3.1 8B Instruct (GGUF) | 8,0 B | 131.072 tokens | GGUF | Llama 3.1 Community License | Menor coste de memoria, contexto muy superior; licencia no plenamente permisiva |

No se dispone de comparaciones de rendimiento medidas entre estos modelos en la informacion proporcionada; la tabla recoge solo diferencias de parametros, contexto, formato y licencia.

## Limitaciones y advertencias
- No hay benchmarks publicados del artefacto cuantizado: la cifra de "97,5 % de retencion" es una estimacion del autor sin metodologia documentada.
- La cuantizacion Q5_K_M introduce degradacion no medida en tareas de razonamiento, codigo y matematicas; conviene validar con evaluaciones propias antes de usar en produccion.
- El modelo base es de 12B y de generacion anterior a las familias actuales; su calidad en tareas complejas sera inferior a modelos mas recientes del mismo tamano, aunque no se aportan datos comparativos.
- Idiomas soportados no documentados: no hay garantia de calidad en castellano ni en otros idiomas distintos del ingles.
- Riesgo de alucinacion inherente a los modelos de lenguaje; la model card no incluye mitigaciones ni evaluaciones de veracidad.
- Sesgos: no se documenta ninguna evaluacion de sesgos del modelo base ni del artefacto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia: no hay evidencia de uso ni validacion por parte de la comunidad.
- La licencia declarada es Apache 2.0, pero se aplica al artefacto de cuantizacion; conviene verificar la licencia del modelo base de Stability AI antes de un uso comercial.
- La model card incluye una clausula de exencion total de responsabilidad por parte del autor y de la comunidad ONIX; el usuario asume toda la responsabilidad sobre las salidas.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-stablelm-2-12b-chat-GGUF
- Modelo base: https://huggingface.co/stabilityai/stablelm-2-12b-chat
- Herramienta de cuantizacion run-any-model: https://github.com/PranilShah-08/run-any-model
- Organizacion ONIX en Hugging Face: https://huggingface.co/ONIX
