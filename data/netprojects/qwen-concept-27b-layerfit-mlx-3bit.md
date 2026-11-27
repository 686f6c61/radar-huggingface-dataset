# netprojects/Qwen-Concept-27B-LayerFit-MLX-3bit

## Resumen

Qwen-Concept-27B-LayerFit-MLX-3bit es una cuantizacion en 3 bits del modelo ConceptCountry/qwen-concept-27b, un Qwen3.8-27B con edicion de pesos orientada a reducir el numero de tokens de razonamiento. La publica netprojects (Paris Michalas), un tercero no afiliado al editor original, y esta empaquetada en formato MLX para ejecutarse en Apple Silicon. El objetivo es claro: hacer que un modelo de aproximadamente 28.200 millones de parametros quepa en un Mac de 24 GB de memoria unificada, con 13,1 GB en disco.

La innovacion principal es LayerFit, una tecnica de busqueda por capa que asigna presupuestos de bits distintos a cada bloque (MLP, atencion, atencion lineal, embeddings y cabeza de salida) en funcion de su sensibilidad a la cuantizacion. Segun el autor, esto mejora la fidelidad frente a una cuantizacion de 3 bits uniforme del mismo tamano: 88,6 % de acuerdo top-1 con bf16 frente a 84,4 %, y una divergencia KL un 38 % menor.

El modelo conserva la torre de vision en bf16 y la cabeza de prediccion multi-token (MTP) en 8 bits para acelerar la decodificacion. Es relevante para desarrolladores que quieran inferencia multimodal local en hardware de consumo Apple sin renunciar a un modelo de casi 30.000 millones de parametros. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5/Qwen3.8), con atencion lineal y cabeza MTP; cuantizacion MLX con receta LayerFit por capa |
| Parametros totales | 28.206.101.232 (28,2 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3 bits (esta build); la familia incluye 2, 2.5, 3, 4, 6 y 8 bits; torre de vision en bf16 y cabeza MTP en 8 bits |
| Idiomas soportados | no disponible (la model card menciona pruebas en ingles, otros idiomas, codigo, tool calls y matematicas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (compatible con mlx-lm, mlx-vlm y LM Studio) |

## Arquitectura y entrenamiento

El modelo base es ConceptCountry/qwen-concept-27b, descrito por el autor como una version con edicion de pesos de Qwen3.8-27B que "piensa con menos tokens". La arquitectura corresponde a la familia Qwen3.5/Qwen3.8, con bloques de atencion estandar y de atencion lineal, y una cabeza de prediccion multi-token (MTP) que permite decodificacion especulativa usando el propio modelo como borrador. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

La aportacion tecnica de esta build es LayerFit: en lugar de aplicar el mismo numero de bits a todas las capas, se mide la degradacion de cada bloque (MLP, atencion, atencion lineal, embeddings y cabeza de salida) a baja precision y se distribuye el mismo presupuesto de tamano donde mas ayuda. La receta concreta esta en `layerfit-recipe.json` dentro del repositorio. El resultado, segun el autor, es un 88,6 % de acuerdo top-1 con bf16 y una KL de 0,0897, frente a 84,4 % y 0,1442 de una cuantizacion uniforme de 3 bits. La torre de vision se mantiene en bf16 para preservar la calidad multimodal.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Razonamiento con modo "thinking" (la model card reporta 2/2 en pruebas de pensamiento).
- Generacion de codigo (3/3 en las pruebas del autor).
- Matematicas: GSM8K-50 con thinking desactivado da 45/50.
- Tool calling / function calling (prueba de tool call superada).
- Entrada de imagen (pipeline image-text-to-text) con torre de vision en bf16.
- Prediccion multi-token (MTP) para decodificacion especulativa mas rapida.
- Capacidades multilingues: la model card menciona pruebas con pasajes en ingles y otros idiomas, pero no se detalla la lista de idiomas.

## Casos de uso

- Asistente local en un Mac de 24 GB: el modelo cabe en 13,1 GB y deja margen para macOS y prompts largos, lo que permite un chatbot privado sin conexion con capacidad multimodal.
- Analisis de imagenes y documentos escaneados: al conservar la torre de vision en bf16, se puede usar para describir fotos, extraer informacion de capturas o responder preguntas sobre diagramas desde la linea de comandos con mlx-vlm.
- Generacion de codigo en el editor: las pruebas de coding y tool calling lo hacen apto para integrarse en asistentes de IDE locales que invocan herramientas (ejecutar tests, consultar APIs) sin enviar codigo a la nube.
- Razonamiento matematico asistido: con GSM8K-50 en 45/50 y modo thinking, sirve para resolver problemas paso a paso en cuadernos o scripts de analisis.
- Automatizacion de agentes multi-paso en local: la cabeza MTP acelera la decodificacion y el soporte de tool calling permite construir flujos de agente que encadenan busquedas, calculos y edicion de ficheros.
- Prototipado e investigacion en Apple Silicon: al ser formato MLX estandar, se puede cargar con mlx-lm y mlx-vlm para experimentar con tecnicas de cuantizacion por capa y comparar recetas LayerFit frente a cuantizaciones uniformes.
- Despliegue en LM Studio: al ser compatible con LM Studio, permite a perfiles menos tecnicos probar un modelo de 27B multimodal en un Mac de 24 GB sin configurar entornos Python.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (no verificados de forma independiente):

| Prueba | Resultado |
|---|---|
| GSM8K-50, thinking off | 45/50 |
| Coding | 3/3 |
| Tool call | pass |
| Thinking | 2/2 |
| Acuerdo top-1 con bf16 (LayerFit 3-bit) | 88,6 % |
| Acuerdo top-1 con bf16 (3-bit uniforme) | 84,4 % |
| Divergencia KL (LayerFit 3-bit) | 0,0897 |
| Divergencia KL (3-bit uniforme) | 0,1442 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval u otros benchmarks estandar del modelo base ni comparaciones directas con alternativas.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 13,1 GB de pesos; el autor recomienda un Mac de 24 GB para esta build, dejando margen para macOS y prompts largos.
- GPU recomendadas: Apple Silicon con 24 GB de memoria unificada (serie M con esa configuracion). Para builds mayores: 32 GB (4 bits, 16,5 GB), 48 GB o mas (6 y 8 bits).
- Cabe en GPU de consumo: si, en Macs de 24 GB; la build de 2 bits (9,1 GB, solo texto) y la de 2,5 bits (11,5 GB) estan pensadas para Macs de 16 GB.
- Opciones de despliegue: mlx-vlm (multimodal), mlx-lm (texto), LM Studio. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI, que no son compatibles con pesos MLX.
- Latencia y throughput: no disponibles de forma numerica; la cabeza MTP en 8 bits se incluye para acelerar la decodificacion mediante decodificacion especulativa.
- Ajuste opcional: `sudo sysctl iogpu.wired_limit_mb=12800` para permitir que la GPU use mas memoria (se pierde al reiniciar).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Concept-27B-LayerFit-MLX-3bit | 28,2 B | no disponible | 3 bits MLX (LayerFit) | Apache-2.0 | Hugging Face, MLX |
| Qwen-Concept-27B-LayerFit-MLX-4bit | 28,2 B | no disponible | 4 bits MLX (LayerFit) | Apache-2.0 | Hugging Face, MLX |
| Qwen-Concept-27B-MLX-6bit | 28,2 B | no disponible | 6 bits MLX | Apache-2.0 | Hugging Face, MLX |
| ConceptCountry/qwen-concept-27b (bf16) | 28,2 B | no disponible | bf16 | Apache-2.0 | Hugging Face |

No se dispone de datos para comparar con modelos de otros fabricantes de tamano similar (por ejemplo, variantes de Qwen, Gemma o Mistral) en cuanto a rendimiento en benchmarks, ya que la informacion proporcionada no incluye esas cifras.

## Limitaciones y advertencias

- Cuantizacion agresiva a 3 bits: aunque LayerFit mejora la fidelidad, sigue habiendo una perdida medible (88,6 % de acuerdo top-1 con bf16, KL de 0,0897); no es equivalente al modelo en bf16.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; la cuantizacion puede amplificarlo en tareas de razonamiento largo o matematicas complejas.
- Sesgos conocidos: no se documentan en la model card; al derivar de Qwen3.8-27B, hereda los sesgos del modelo base, no evaluados aqui.
- Idiomas: la lista oficial de idiomas soportados no esta disponible; las pruebas mencionan ingles y otros idiomas sin detallar cuales.
- Contexto: la longitud de contexto no se especifica en la informacion disponible, lo que impide planificar cargas de documentos largos con precision.
- Licencia: Apache-2.0 permite uso comercial, pero el autor indica que no esta afiliado al editor de ConceptCountry/qwen-concept-27b; conviene revisar LICENSE y NOTICE del repositorio.
- Compatibilidad: solo MLX (Apple Silicon); no se puede desplegar en GPUs NVIDIA ni en servidores x86 con vLLM o TGI.
- LayerFit es una marca registrada de NetProjects; la receta de bits es especifica de este modelo y no es directamente transferible a otros sin re-busqueda.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen-Concept-27B-LayerFit-MLX-3bit
- Modelo base: https://huggingface.co/ConceptCountry/qwen-concept-27b
- Build de 2 bits: https://huggingface.co/netprojects/Qwen-Concept-27B-LayerFit-MLX-2bit
- Build de 2,5 bits: https://huggingface.co/netprojects/Qwen-Concept-27B-LayerFit-MLX-2.5bit
- Build de 4 bits: https://huggingface.co/netprojects/Qwen-Concept-27B-LayerFit-MLX-4bit
- Build de 6 bits: https://huggingface.co/netprojects/Qwen-Concept-27B-MLX-6bit
- Build de 8 bits: https://huggingface.co/netprojects/Qwen-Concept-27B-MLX-8bit
- Perfil del autor: https://huggingface.co/netprojects
- Sitio del autor: https://netprojects.com
