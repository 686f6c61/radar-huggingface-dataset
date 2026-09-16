# mradermacher/ghostai-pro-GGUF

## Resumen

ghostai-pro-GGUF es una recopilacion de cuantizaciones en formato GGUF del modelo immortaltatsu/ghostai-pro, publicada por el usuario mradermacher, conocido por generar versiones cuantizadas de modelos abiertos para inferencia local. El repositorio no contiene un modelo nuevo: es una conversion del modelo base a GGUF en doce variantes de cuantizacion (desde Q2_K hasta f16), pensada para su uso con llama.cpp, Ollama, LM Studio y otros motores compatibles con este formato.

El modelo subyacente cuenta con 2.516.756.480 parametros (aproximadamente 2,5 mil millones, segun el recuento real de safetensors del modelo base) y esta etiquetado por el autor con los descriptores ghost-ai, on-device, function-calling, tool-calling, solana, minicpm y conversational. Esto lo situa en la categoria de modelos pequenos orientados a ejecucion en dispositivo, con enfasis declarado en llamadas a funciones y herramientas, y con soporte unicamente para ingles.

Su relevancia practica radica en el tamano: al pesar entre 1,1 GB (Q2_K) y 5,1 GB (f16), puede ejecutarse en hardware de consumo sin GPU dedicada o con GPUs modestas, y permite integrar function calling en aplicaciones locales sin depender de APIs en la nube. La model card no documenta arquitectura detallada, longitud de contexto, datos de entrenamiento ni resultados de benchmarks, por lo que buena parte de las especificaciones quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta "minicpm" del autor sugiere una posible relacion con la familia MiniCPM, sin confirmar) |
| Parametros totales | 2.516.756.480 (aprox. 2,5 mil millones, dato real de safetensors del modelo base) |
| Parametros activos | no aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo en la documentacion proporcionada. La model card del repositorio GGUF es una plantilla generada automaticamente por el proceso de cuantizacion de mradermacher y solo documenta los ficheros producidos, no el diseno de la red. La unica pista es la etiqueta "minicpm" incluida por el autor entre los tags, que apunta a una posible base arquitectonica inspirada en la familia MiniCPM, aunque no hay confirmacion explicita.

Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de ajuste por instrucciones, RLHF o DPO. El proceso aplicado en este repositorio es exclusivamente de conversion y cuantizacion: los metadatos internos indican convert_type hf, output_tensor_quantised 1 y quantize_version 2, es decir, una conversion desde pesos Hugging Face con cuantizacion de tensores. No se han generado cuantizaciones ponderadas ni con matriz de importancia (imatrix) para este modelo segun el propio autor.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat.
- Function calling y tool calling: el autor etiqueta explicitamente el modelo con ambos descriptores, lo que indica soporte previsto para invocar funciones externas.
- Orientacion a despliegue on-device: el conjunto de cuantizaciones permite ejecucion local en CPU y GPU de gama baja.
- Integracion con endpoints compatibles: la etiqueta endpoints_compatible sugiere compatibilidad con APIs tipo OpenAI para servidores de inferencia.
- Contexto declarado de aplicacion en Solana: la etiqueta "solana" apunta a un posible ajuste o uso previsto en tareas relacionadas con esa cadena de bloques, sin mas detalle disponible.
- Capacidades multilingues: no disponibles; el modelo declara unicamente ingles.
- Modo de razonamiento explicito, vision o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Agentes locales con llamadas a herramientas: al estar etiquetado con function-calling y tool-calling, puede emplearse como nucleo de un agente que consulte APIs, bases de datos o servicios web desde una aplicacion de escritorio, sin enviar datos a terceros.
- Asistente de escritorio sin conexion: con la cuantizacion Q4_K_M (1,7 GB) el modelo cabe en un portatil modesto y permite construir asistentes de texto que funcionan sin red.
- Automatizacion de tareas sobre cadenas de bloques: la etiqueta "solana" sugiere su uso en flujos que interpretan lenguaje natural y generan llamadas estructuradas a herramientas relacionadas con esa red, siempre que el desarrollador valide la salida antes de ejecutar transacciones.
- Prototipado rapido de pipelines conversacionales: su tamano reducido permite iterar sobre prompts y esquemas de herramientas en minutos, antes de migrar a un modelo mayor.
- Clasificacion y extraccion de informacion estructurada: generacion de JSON a partir de texto libre en ingles, aprovechando el soporte de tool calling para forzar esquemas de salida.
- Despliegue en entornos con recursos limitados o air-gapped: al distribuirse en GGUF de 1,1 a 2,8 GB, puede ejecutarse en contenedores pequenos o en equipos sin GPU dedicada, en escenarios donde no se permite salida a Internet.
- Educacion y experimentacion: servir como modelo de referencia para comparar el efecto de distintas cuantizaciones sobre la calidad de salida en tareas de instrucciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio GGUF ni los metadatos de HuggingFace incluyen puntuaciones de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion. Tampoco se dispone de mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM para inferencia: segun el tamano de los ficheros publicados, los pesos ocupan aproximadamente 1,1 GB (Q2_K), 1,3 GB (Q3_K_S), 1,5 GB (IQ4_XS y Q3_K_L), 1,7 GB (Q4_K_M), 1,9 GB (Q5_K_M), 2,2 GB (Q6_K), 2,8 GB (Q8_0) y 5,1 GB (f16). A estas cifras hay que sumar la memoria para la cache KV, cuyo consumo depende del contexto y del motor de inferencia, no documentado.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM puede ejecutar las cuantizaciones Q4 y Q5; una RTX 3060 de 12 GB, una RTX 4070 o una RTX 4090 permiten usar todas las variantes, incluida f16, con margen amplio. En el segmento profesional, una A100 o una H100 son sobredimensionadas para 2,5 mil millones de parametros, salvo por agregacion de muchas instancias.
- Viabilidad en GPU de consumo: si, es uno de los puntos fuertes del modelo. Las cuantizaciones Q4_K_S y Q4_K_M (marcadas por el autor como "fast, recommended") caben en GPUs de 4 GB o en equipos con memoria unificada.
- Ejecucion solo en CPU: viable con llama.cpp u Ollama, dado el reducido tamano de los pesos.
- Opciones de despliegue: llama.cpp, Ollama y LM Studio son las rutas naturales al tratarse de GGUF. Los servidores con capa compatible con la API de OpenAI pueden aprovechar la etiqueta endpoints_compatible. vLLM ofrece soporte parcial de GGUF; TGI no esta orientado a este formato.
- Latencia y throughput estimados: no disponibles. El autor no publica mediciones y no se han realizado pruebas en la informacion proporcionada.

## Comparativa con modelos similares

La comparacion de rendimiento no es posible porque no hay benchmarks publicados para ghostai-pro. La tabla siguiente recoge unicamente caracteristicas objetivas de modelos de tamano equivalente.

| Modelo | Parametros | Contexto | Licencia | Formatos disponibles |
|---|---|---|---|---|
| ghostai-pro (este repositorio) | 2,52 B | no disponible | Apache-2.0 | GGUF (12 cuantizaciones) y safetensors del modelo base |
| Qwen2.5-3B | 3,09 B | 32.768 tokens (ampliable a 131.072 con YaRN) | Apache-2.0 | safetensors, GGUF, AWQ, GPTQ |
| Llama-3.2-3B | 3,21 B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF |
| Phi-3.5-mini-instruct | 3,8 B | 128.000 tokens | MIT | safetensors, GGUF, ONNX |

Los datos de los modelos comparativos proceden de su documentacion publica y no se han verificado en la informacion proporcionada para esta ficha; pueden variar con nuevas revisiones. En cualquier caso, ghostai-pro es el unico de los cuatro para el que no se dispone de contexto declarado ni de evaluaciones publicadas, lo que dificulta una comparacion tecnica rigurosa.

## Limitaciones y advertencias

- Idiomas: el modelo declara soporte unicamente para ingles. Cualquier uso en castellano u otros idiomas queda fuera de su alcance documentado y previsiblemente degradara la calidad.
- Sesgos conocidos: no disponibles. No hay informacion sobre la composicion del dataset de entrenamiento, por lo que no es posible evaluar sesgos demograficos, culturales o de dominio.
- Riesgo de alucinacion: no cuantificado. Al ser un modelo de 2,5 mil millones de parametros sin evaluaciones publicadas, cabe esperar una tasa de error superior a la de modelos mayores, especialmente en tareas de conocimiento factual y razonamiento multi-paso.
- Degradacion por cuantizacion: las variantes Q2_K y Q3_K_S reducen el modelo a 1,1-1,3 GB y el propio autor marca Q3_K_M como "lower quality". Para uso en produccion conviene partir de Q4_K_M o superior.
- Ausencia de validacion comunitaria: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (16 de septiembre de 2026). Esto implica que no existe retroalimentacion de terceros sobre su comportamiento real.
- Contexto desconocido: al no documentarse la longitud de contexto, no es posible garantizar conversaciones multi-turno largas ni el procesamiento de documentos extensos.
- Licencia: Apache-2.0, permisiva y apta para uso comercial, pero se aplica al artefacto publicado; conviene verificar que el modelo base immortaltatsu/ghostai-pro mantiene la misma licencia y no impone restricciones adicionales derivadas de sus datos de entrenamiento.
- Trazabilidad: la model card del repositorio GGUF es una plantilla automatica del cuantizador, sin informacion sobre procedencia de datos, proceso de alineacion ni limitaciones conocidas declaradas por el autor original.
- Uso en produccion: antes de desplegarlo en un flujo con efectos reales (por ejemplo, transacciones en Solana), es imprescindible validar las salidas del modelo y anadir capas de verificacion, dado que no hay evidencia publica de su fiabilidad en tool calling.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ghostai-pro-GGUF
- Modelo base: https://huggingface.co/immortaltatsu/ghostai-pro
- Pagina de resumen de cuantizaciones del autor: https://hf.tst.eu/model#ghostai-pro-GGUF
- Preguntas frecuentes y solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (referencia de TheBloke citada por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad entre tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa responsable de la infraestructura de cuantizacion: https://www.nethype.de/
