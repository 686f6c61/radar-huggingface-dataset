# SirSahOl/K2-Horizon-7B-chat-mlx-16bit

## Resumen

K2-Horizon-7B-chat-mlx-16bit es una conversion a formato MLX, en precision de 16 bits sin cuantizar (bfloat16), del modelo conversacional IFM/K2-Horizon-7B. La conversion la firma el usuario SirSahOl y su unico proposito es permitir la inferencia nativa en la GPU unificada de los chips Apple Silicon (serie M) mediante el framework MLX de Apple, en lugar de los formatos habituales para CUDA. No se trata, por tanto, de un modelo entrenado desde cero, sino de una redistribucion de pesos orientada a un hardware concreto.

Tecnicamente, el modelo base declara la arquitectura K2HorizonForCausalLM (transformador denso, no MoE), una longitud de contexto de 524.288 tokens y un total real de 8.999.178.240 parametros en safetensors, pese a la denominacion comercial "7B". Los pesos se distribuyen en un repositorio de 18 GB y ocupan aproximadamente 15,2 GB de memoria unificada en inferencia, con un minimo recomendado de 24 GB y un rango aconsejado de 32 GB o mas.

Su relevancia es acotada pero clara: cubre un hueco poco atendido, el de la inferencia de un modelo de contexto muy largo (512k tokens) en equipos de sobremesa y portatiles Mac sin GPU dedicada, manteniendo la precision completa para tareas de evaluacion y comparacion. Como contrapartida, no publica ningun resultado en benchmarks de calidad (MMLU, HumanEval, GSM8K) y su ficha de modelo esta incompleta, lo que limita seriamente su uso en produccion sin una validacion previa por parte del equipo que lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | K2HorizonForCausalLM (transformador denso con atencion causal) |
| Parametros totales | 8.999.178.240 (~9,0 B; etiquetado comercialmente como 7B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 524.288 tokens |
| Tipos de cuantizacion | 16 bits sin cuantizar (bfloat16, media de 16,00 bits por peso). Existen variantes 4-bit y 8-bit del mismo autor en formato MLX. No hay GGUF, AWQ, GPTQ ni EXL2 |
| Idiomas soportados | ingles (etiqueta `en`); la ficha no declara una lista oficial de idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (requiere `mlx-lm` y `custom_code` / `trust_remote_code`) |
| Tamano del repositorio | 18,0 GB |
| Huella de VRAM activa | ~15,2 GB; minimo recomendado 24 GB de memoria unificada |
| Modelo base | IFM/K2-Horizon-7B (finetune conversacional del mismo) |
| Datos de entrenamiento declarados | IFM/K2-Horizon-Pretrain-Data, IFM/K2-Horizon-Midtrain-Data |
| Libreria / runtime | MLX (Apple), `mlx-lm`; compatible con LM Studio |
| Plataforma objetivo | Apple Silicon (M1/M2/M3/M4 y variantes Pro, Max, Ultra) |
| Descargas / likes en HuggingFace | 0 / 0 |
| Fecha de creacion del repositorio | 2026-09-15 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura de transformador denso con atencion causal, identificada en la ficha como `K2HorizonForCausalLM`, con implementacion de codigo personalizado (`custom_code`), lo que obliga a cargar el modelo con `trust_remote_code=True`. La innovacion mas destacable declarada es la ventana de contexto de 524.288 tokens, un orden de magnitud por encima de los 32k-128k habituales en modelos de tamano similar. No hay informacion disponible sobre el tipo de atencion utilizado para sostener ese contexto (atencion completa, dispersa, lineal o alguna variante de RoPE escalado), ni sobre el tokenizador, ni sobre el uso de decodificacion especulativa.

En cuanto al entrenamiento, lo unico que se declara son los dos conjuntos de datos empleados (preentrenamiento y "midtrain"), sin especificar el numero de tokens, la composicion del corpus, la proporcion de codigo o contenido multilingue, ni si hubo fases de ajuste por instrucciones con RLHF, DPO o similares. La ficha tampoco detalla el proceso de conversion a MLX mas alla de indicar que se trata de una conversion a 16 bits sin cuantizar a partir del modelo original. Todo lo relativo a hiperparametros, regimen de entrenamiento y metodologia de alineacion debe considerarse no disponible.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat ChatML (`<|im_start|>`, `<|im_end|>`, `<|endoftext|>` como tokens de parada).
- Conversaciones multiturno con historial largo, apoyadas en la ventana de 524.288 tokens.
- Seguimiento de instrucciones y plantillas de prompt personalizadas (el autor documenta un preset `ChatML.json` para LM Studio).
- Inferencia en precision completa (bfloat16) sin perdida de perplejidad asociada a cuantizacion, orientada a evaluacion y comparacion de referencia.
- Ejecucion local y offline sobre GPU unificada de Apple Silicon.
- Capacidades de tool calling / function calling: no disponibles en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso explicito: no disponible.
- Capacidades multimodales (vision, audio) o modo de razonamiento explicito (thinking mode): no disponibles.
- Capacidades multilingues: la unica lengua declarada es el ingles.

## Casos de uso

- Analisis de documentacion extensa en local: con 524.288 tokens de contexto, el modelo puede ingerir manuales tecnicos, expedientes completos o bases de codigo de gran tamano en una sola pasada, sin necesidad de trocear el texto ni de usar recuperacion externa.
- Evaluacion y comparacion de referencia (ground truth): al ser la variante sin cuantizar, sirve para medir la degradacion real de las versiones 4-bit y 8-bit del mismo modelo antes de desplegar una de ellas en produccion.
- Procesamiento de datos sensibles en equipos aislados: al ejecutarse integramente en local sobre un Mac sin conexion, encaja en flujos con requisitos de confidencialidad donde no se permite enviar documentos a APIs externas.
- Asistencia a la redaccion tecnica en ingles: resumen, reescritura y extraccion de datos estructurados de informes largos, con la ventaja de mantener todo el documento en el contexto.
- Generacion de conjuntos de datos sinteticos para ajuste posterior: la precision bfloat16 reduce las diferencias respecto al modelo original, lo que resulta util cuando el texto generado se va a usar como semilla de entrenamiento.
- Investigacion sobre comportamiento en contextos muy largos: permite estudiar degradacion de la atencion, olvido de informacion intermedia y estabilidad de la generacion a 100k-500k tokens en hardware de consumo.
- Servicio interno de chat sobre un Mac Studio o Mac Pro con memoria unificada grande: despliegue de un asistente conversacional para un equipo pequeno, sin GPU dedicada y con un rendimiento de decenas de tokens por segundo.
- Pruebas de prompt engineering y red-teaming locales: banco de pruebas rapido para ajustar plantillas de chat y cadenas de parada sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, ARC, etc.) en la informacion disponible. La ficha del modelo unicamente incluye estimaciones de rendimiento en inferencia sobre hardware Apple Silicon.

| Nivel de Apple Silicon | Memoria unificada | VRAM activa | Velocidad estimada | TTFT estimado | Uso recomendado |
|---|---|---|---|---|---|
| M1 / M2 / M3 / M4 (base) | 24 GB (minimo) | ~15,2 GB | ~12 tokens/s | ~240 ms | Evaluacion a precision completa en Mac de 24 GB (M2/M3/M4) |
| M1 / M2 / M3 / M4 Pro | 36-48 GB | ~15,2 GB | ~18 tokens/s | ~160 ms | Desarrollo, prompt engineering y comparacion con el modelo de referencia |
| M1 / M2 / M3 / M4 Max | 36-128 GB | ~15,2 GB | ~28 tokens/s | ~100 ms | Inferencia de referencia sin cuantizar y sin penalizacion de perplejidad |
| M1 / M2 / M3 / M4 Ultra | 64-192 GB | ~15,2 GB | ~42 tokens/s | ~65 ms | Estacion de trabajo, servido de referencia sin concesiones |

Las cifras anteriores son estimaciones del propio autor basadas en el ancho de banda de memoria unificada y en el peso activo de parametros; la ficha advierte de que los valores reales pueden variar segun la longitud del contexto. No se proporcionan datos de rendimiento medidos.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon. El formato MLX no es compatible con GPU NVIDIA, AMD ni con CPU x86 convencionales.
- Memoria unificada minima: 24 GB (con ~15,2 GB ocupados por los pesos en bfloat16).
- Rango recomendado: 32-36 GB o mas, para dejar margen a la cache KV y al resto del sistema.
- Equipos viables: Mac con M1/M2/M3/M4 base de 24 GB, y con holgura en variantes Pro (36-48 GB), Max (36-128 GB) y Ultra (64-192 GB).
- GPU dedicadas tipo RTX 4090, A100 o H100: no aplicables a este repositorio, ya que no se distribuyen pesos en safetensors estandar de PyTorch ni en GGUF.
- Opciones de despliegue: `mlx-lm` mediante CLI (`mlx_lm.chat`, `mlx_lm.generate`) o API de Python (`mlx_lm.load`), y LM Studio con un preset de prompt ChatML y las cadenas de parada indicadas. vLLM, TGI, llama.cpp y Ollama no son compatibles con este artefacto segun la informacion disponible.
- Latencia y throughput estimados: de ~12 tokens/s y ~240 ms de TTFT en un chip base, hasta ~42 tokens/s y ~65 ms de TTFT en un chip Ultra, segun la matriz del autor.
- Nota sobre contexto largo: la cifra de ~15,2 GB corresponde a los pesos. La ficha no cuantifica el consumo adicional de la cache KV necesario para explotar los 524.288 tokens de contexto, por lo que las necesidades reales de memoria en contextos muy largos son no disponibles.

## Comparativa con modelos similares

La informacion disponible permite comparar esta variante con las otras conversiones del mismo autor y con el modelo base, pero no incluye ningun dato de benchmarks que permita situarla frente a modelos de otros desarrolladores. La comparacion con alternativas externas (por ejemplo modelos densos de 7-9 B de otros proveedores) queda como no disponible.

| Modelo / variante | Precision | Tamano en disco | VRAM | Hardware objetivo | Ventaja declarada |
|---|---|---|---|---|---|
| SirSahOl/K2-Horizon-7B-chat-mlx-4bit | 4 bits | ~4,3 GB | ~4,2 GB | Apple Silicon con 8 GB o mas | Maxima velocidad y menor presion de memoria; uso simultaneo con IDE y navegador |
| SirSahOl/K2-Horizon-7B-chat-mlx-8bit | 8 bits | ~8,1 GB | ~7,8 GB | Apple Silicon Pro/Max con 16 GB o mas | Precision casi sin perdida y razonamiento estable en instrucciones complejas |
| SirSahOl/K2-Horizon-7B-chat-mlx-16bit (este) | 16 bits (bfloat16) | ~15,2 GB | ~15,2 GB | Apple Silicon Max/Ultra con 32 GB o mas | Precision completa sin cuantizar, sin perdida de perplejidad |
| IFM/K2-Horizon-7B (modelo base) | no disponible | no disponible | no disponible | no disponible | Modelo original del que derivan las tres conversiones |

Los tres artefactos comparten el mismo modelo base, la misma licencia apache-2.0 y el mismo contexto declarado de 524.288 tokens; la unica diferencia documentada es la precision y, en consecuencia, el consumo de memoria.

## Limitaciones y advertencias

- Ausencia total de benchmarks de calidad: no hay MMLU, HumanEval, GSM8K ni ninguna otra metrica publicada, ni para esta conversion ni para el modelo base. No es posible estimar su calidad frente a alternativas sin evaluarlo uno mismo.
- Opacidad del entrenamiento: se desconocen el numero de tokens, la composicion del corpus, el tokenizador y si hubo fases de RLHF o DPO. Esto impide anticipar sesgos o comportamientos en dominios concretos.
- Idioma: solo se declara ingles. El rendimiento en castellano u otras lenguas no esta documentado y previsiblemente sera pobre.
- Riesgo de alucinacion: es un modelo generativo de ~9 B sin datos de evaluacion publicados; en tareas factuales o de calculo debe verificarse la salida. No se ha publicado ningun estudio de fidelidad.
- Dependencia de hardware: el formato MLX restringe el uso a equipos Apple Silicon. No es desplegable en infraestructura NVIDIA, AMD ni en servidores x86 habituales, lo que limita su integracion en pipelines de produccion convencionales.
- Requiere codigo personalizado: la carga exige `custom_code` y, por tanto, `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio y anade superficie de riesgo en entornos gestionados.
- Conversion no validada por la comunidad: el repositorio registra 0 descargas y 0 likes, sin evidencia publica de que la conversion reproduzca fielmente el comportamiento del modelo base.
- Ficha de modelo incompleta: el README aparece truncado en la seccion de configuracion de LM Studio (el bloque JSON del preset `ChatML.json` queda cortado), por lo que las instrucciones de despliegue no estan completas.
- Consumo en contexto largo no cuantificado: la ventana de 524.288 tokens es una cifra declarada, pero no se documenta el coste de memoria de la cache KV ni la degradacion de calidad a longitudes extremas.
- Licencia: apache-2.0 permite uso comercial y modificacion, siempre que se conserve el aviso de licencia y se atribuya correctamente; conviene verificar tambien las condiciones del modelo base IFM/K2-Horizon-7B antes de redistribuir.
- Fecha de creacion inusual: los metadatos de HuggingFace indican 2026-09-15, posterior a la fecha habitual de publicacion, dato a contrastar si se va a citar el modelo.

## Enlaces

- Repositorio de este modelo: https://huggingface.co/SirSahOl/K2-Horizon-7B-chat-mlx-16bit
- Modelo base: https://huggingface.co/IFM/K2-Horizon-7B
- Variante 4-bit: https://huggingface.co/SirSahOl/K2-Horizon-7B-chat-mlx-4bit
- Variante 8-bit: https://huggingface.co/SirSahOl/K2-Horizon-7B-chat-mlx-8bit
- Perfil del autor de la conversion: https://huggingface.co/SirSahOl
- Framework MLX de Apple: https://github.com/ml-explore/mlx
- Dataset de preentrenamiento declarado: IFM/K2-Horizon-Pretrain-Data
- Dataset de "midtrain" declarado: IFM/K2-Horizon-Midtrain-Data
- Paper tecnico, blog de anuncio, demo o repositorio adicional: no disponibles. Las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo.
