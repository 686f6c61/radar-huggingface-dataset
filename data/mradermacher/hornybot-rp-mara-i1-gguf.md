# mradermacher/Hornybot-RP-Mara-i1-GGUF

## Resumen

Hornybot-RP-Mara-i1-GGUF es un repositorio de cuantizaciones GGUF generadas con el método imatrix (prefijo "i1") por el usuario mradermacher a partir del modelo axiomofmind/Hornybot-RP-Mara. Se trata de un modelo conversacional afinado para roleplay de contenido adulto, con 8.953.803.264 parámetros totales (aproximadamente 8,95 mil millones) según los metadatos reales de safetensors del repositorio base, y etiquetado por el autor dentro de la familia qwen3.5.

El problema que resuelve es el de permitir la ejecución local de un modelo de rol de ~9B en hardware de consumo mediante llama.cpp y sus derivados, ofreciendo 24 variantes de cuantización que van desde 2,8 GB (i1-IQ1_S) hasta 7,5 GB (i1-Q6_K). El uso de una matriz de importancia (imatrix) para calibrar la cuantización es relevante porque mejora la relación calidad/tamaño en los rangos bajos, donde las cuantizaciones estáticas equivalentes degradan más la perplejidad.

El repositorio tiene un tamaño total de 110,2 GB (suma de todos los ficheros), 0 descargas y 0 "likes" en el momento de los datos consultados, y no declara licencia. Está pensado exclusivamente para inglés y el autor lo describe como modelo de visión, señalando que los ficheros mmproj, si existen, se publican en el repositorio de cuantizaciones estáticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el autor lo etiqueta como qwen3.5; no se detalla en la model card) |
| Parametros totales | 8.953.803.264 (8,95B, dato de safetensors del modelo base) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K, ademas del fichero imatrix de calibracion |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye en safetensors |
| Tamano del repositorio | 110,2 GB |
| Rango de tamanos de cuantizacion | 2,8 GB (i1-IQ1_S) a 7,5 GB (i1-Q6_K) |
| Modelo base | axiomofmind/Hornybot-RP-Mara |
| Cuantizador | mradermacher (metodo i1 / imatrix) |
| Fecha de creacion | 2026-09-15 |

## Arquitectura y entrenamiento

La model card de este repositorio no describe la arquitectura del modelo subyacente: únicamente indica que se trata de cuantizaciones ponderadas con imatrix del modelo axiomofmind/Hornybot-RP-Mara y lo etiqueta como qwen3.5. Por tanto, no hay información publicada en los datos disponibles sobre el número de capas, tipo de atención, composición del dataset de entrenamiento, número de tokens vistos ni sobre si se aplicaron técnicas de alineación como RLHF, DPO o similares. Tampoco se documenta el proceso de ajuste fino que dio lugar al modelo base.

Lo que sí está documentado es el proceso de cuantización: mradermacher ha generado los ficheros con el pipeline de llama.cpp en su modalidad i1, que emplea un fichero de matriz de importancia (Hornybot-RP-Mara.imatrix.gguf, 0,1 GB, incluido en el repositorio para quien quiera crear sus propias cuantizaciones). Los metadatos internos del README indican quantize_version: 2, output_tensor_quantised: 1 y convert_type: hf, lo que confirma una conversión desde pesos de HuggingFace a GGUF con cuantización por tensor. El propio autor advierte que este repositorio contiene únicamente cuantizaciones i1 y que las estáticas están en un repositorio separado.

## Capacidades

- Generacion de texto conversacional en ingles, con ajuste especifico para roleplay y narrativa interactiva.
- Interpretacion de personajes: el modelo esta afinado para mantener una persona concreta ("Mara") a lo largo de conversaciones multi-turno.
- Dialogo de contenido adulto, segun la etiqueta "adult" declarada por el autor y el nombre del modelo.
- Posible soporte multimodal: el autor afirma explicitamente "This is a vision model", aunque los ficheros mmproj no se incluyen en este repositorio y no se aporta ninguna prueba ni especificacion al respecto.
- Soporte de tool calling / function calling: no disponible (no documentado en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no, el modelo esta etiquetado unicamente como "en".
- Modo de razonamiento explicito (thinking mode): no disponible (no documentado).

## Casos de uso

- Roleplay local y privado: el modelo puede ejecutarse integramente en la maquina del usuario con llama.cpp o koboldcpp, de modo que ninguna conversacion sale del equipo. Es adecuado para este fin por su ajuste especifico de personaje y por el rango de cuantizaciones, que permite bajarlo hasta 2,8-4,5 GB si la VRAM es limitada.
- Frontends de chat tipo SillyTavern o LM Studio: al estar en formato GGUF, se carga directamente en estos entornos sin conversion adicional, lo que facilita su uso como motor de personajes con plantillas de prompt personalizadas.
- Prototipado de NPC con personalidad fija: para demos de videojuego o experiencias interactivas donde se necesita un personaje con voz consistente y respuestas largas, el ajuste de rol resulta mas adecuado que un modelo instructivo generico del mismo tamano.
- Escritura asistida de ficcion interactiva: el modelo puede continuar escenas, mantener el tono de un personaje y proponer ramificaciones narrativas; la ventana de contexto no esta documentada, por lo que la longitud de las escenas debe validarse empiricamente antes de llevarlo a produccion.
- Generacion de datos sinteticos de dialogo: util para crear corpus de conversaciones de rol etiquetadas que alimenten un fine-tuning posterior. Conviene filtrar y auditar la salida, dado que el modelo esta entrenado para contenido adulto y puede generar material no apto sin filtrado.
- Evaluacion comparativa de cuantizaciones: este repositorio incluye 24 variantes del mismo modelo, lo que lo convierte en un banco de pruebas practico para medir la degradacion de perplejidad y coherencia entre IQ1, IQ2, IQ3, IQ4, Q5 y Q6 sobre el mismo checkpoint con la misma matriz de importancia.
- Despliegue en entornos sin conexion o con requisitos de confidencialidad: al no requerir API externa, encaja en escenarios air-gapped donde se necesita un chat de personaje o un asistente narrativo interno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y tampoco se aportan metricas de perplejidad para las cuantizaciones concretas.

El unico material de referencia sobre calidad relativa es un grafico externo de comparacion de perplejidad entre tipos de cuantizacion (enlazado por el autor) y las notas subjetivas incluidas en la tabla de ficheros, que senalan, por ejemplo, que IQ3_S "beats Q3_K*", que Q4_K_S es la opcion de tamano/velocidad/calidad optima y que Q4_K_M es la recomendada para uso general.

## Requisitos de hardware

- VRAM estimada para inferencia (tamano del fichero mas una horquilla aproximada de 0,5-2 GB para cache KV y overhead, dependiendo de contexto y backend; la longitud de contexto no esta documentada, por lo que la cache puede crecer bastante mas con contextos largos):

| Cuantizacion | Tamano del fichero | VRAM estimada (aprox.) |
|---|---|---|
| i1-IQ1_S | 2,8 GB | ~3,3-4,8 GB |
| i1-IQ2_M | 3,7 GB | ~4,2-5,7 GB |
| i1-Q3_K_M | 4,7 GB | ~5,2-6,7 GB |
| i1-IQ4_XS | 5,3 GB | ~5,8-7,3 GB |
| i1-Q4_K_M | 5,7 GB | ~6,2-7,7 GB |
| i1-Q5_K_M | 6,6 GB | ~7,1-8,6 GB |
| i1-Q6_K | 7,5 GB | ~8,0-9,5 GB |

- GPU de consumo: las cuantizaciones IQ1 a Q4_K_M caben con holgura en tarjetas de 8 GB (RTX 3060 Ti, RTX 4060, RTX 2070). Q5_K_M y Q6_K son razonables en 12-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super).
- GPU de gama alta y centro de datos: RTX 4090 (24 GB) o A100/H100 permiten cargar Q6_K con contexto amplio y lotes grandes; en estos casos el limite practico es el ancho de banda de memoria, no la capacidad.
- CPU y memoria del sistema: las variantes IQ1-IQ3 (2,8-5,0 GB) son viables en modo CPU o parcialmente descargado en RAM, con equipos de 16 GB de RAM; la velocidad cae de forma notable frente a la inferencia totalmente en GPU.
- Opciones de despliegue: llama.cpp y sus envoltorios (Ollama, LM Studio, koboldcpp, text-generation-webui) son las rutas directas, ya que el repositorio solo contiene GGUF. Para vLLM o TGI haria falta el modelo base en safetensors, no estas cuantizaciones.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para este repositorio.

## Comparativa con modelos similares

No hay datos de benchmarks que permitan comparar el rendimiento con otros modelos de la misma categoria. La comparacion factible con la informacion disponible es entre las distintas presentaciones del mismo checkpoint:

| Version | Formato | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/Hornybot-RP-Mara-i1-GGUF (esta ficha) | GGUF imatrix (i1), 24 variantes de 2,8 a 7,5 GB | 8,95B | no disponible | no disponible | publico en HuggingFace |
| mradermacher/Hornybot-RP-Mara-GGUF | GGUF estatico | 8,95B | no disponible | no disponible | publico en HuggingFace |
| axiomofmind/Hornybot-RP-Mara | safetensors (modelo base sin cuantizar), ~17,9 GB estimado a 2 bytes por parametro | 8,95B | no disponible | no disponible | publico en HuggingFace |

Frente a otros modelos de rol de ~8-9B publicados por la comunidad, no es posible establecer una comparativa cuantitativa porque no existen resultados de evaluacion publicados para este modelo. Cualquier afirmacion de superioridad frente a alternativas seria especulativa.

## Limitaciones y advertencias

- Contenido para adultos: el modelo esta etiquetado explicitamente como "adult" y su ajuste busca generar material de rol no apto para todos los publicos. No es adecuado para productos dirigidos a menores ni para entornos sin moderacion.
- Licencia no declarada: ni la model card de este repositorio ni los metadatos indican licencia del modelo base. Usarlo en un producto comercial o distribuirlo conlleva incertidumbre legal que debe resolverse consultando al autor del checkpoint original antes de cualquier despliegue en produccion.
- Solo ingles: el modelo esta etiquetado unicamente como "en"; no hay evidencia de capacidades en castellano ni en otros idiomas.
- Contexto no documentado: al desconocerse la longitud de contexto, no se puede planificar el uso en conversaciones largas ni calcular con precision el consumo de memoria de la cache KV.
- Afirmacion de vision sin verificar: el autor indica que es un modelo de vision, pero no se incluyen ficheros mmproj en este repositorio ni se aportan especificaciones; debe tratarse como una capacidad no confirmada.
- Degradacion esperada en cuantizaciones muy bajas: el propio autor etiqueta IQ1_S como "for the desperate" y Q2_K_S como "very low quality". Por debajo de IQ3 se producen perdidas notables de coherencia y de adherencia al personaje.
- Especializacion estrecha: al ser un fine-tuning de rol, es previsible que rinda peor que un modelo instructivo generalista en tareas de codigo, matematicas o razonamiento formal, aunque no hay datos publicados que cuantifiquen esa perdida.
- Riesgo de alucinacion y de salida insegura: no se documentan filtros de seguridad ni evaluaciones de toxicidad. En sistemas con entrada de usuarios habria que anadir moderacion y validacion de salidas.
- Madurez del repositorio: 0 descargas y 0 "likes" en el momento de la consulta, sin retroalimentacion de la comunidad que permita validar la calidad real de las cuantizaciones.
- Los resultados de la busqueda web realizada no contienen informacion relevante sobre este modelo (los resultados obtenidos corresponden a documentacion de soporte de Microsoft), por lo que no ha sido posible contrastar ningun dato adicional.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mradermacher/Hornybot-RP-Mara-i1-GGUF
- Modelo base: https://huggingface.co/axiomofmind/Hornybot-RP-Mara
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Hornybot-RP-Mara-GGUF
- Pagina de resumen y descargas del autor para este modelo: https://hf.tst.eu/model#Hornybot-RP-Mara-i1-GGUF
- Peticiones de modelos y preguntas frecuentes del cuantizador: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de ficheros GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de comparacion de perplejidad entre tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
