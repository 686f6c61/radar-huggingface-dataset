# picur/picur-860M-instruct

## Resumen

picur-860M-instruct es un modelo de generación de texto de 856.662.144 parámetros publicado por el usuario picur en Hugging Face. Se distribuye como un ajuste de tipo instruct sobre la arquitectura LFM2 (el repositorio incluye la etiqueta `lfm2`), con pesos en safetensors y un repositorio de 1,7 GB, lo que es coherente con un almacenamiento en bfloat16 (856 M de parámetros × 2 bytes ≈ 1,71 GB). El autor lo marca explícitamente como "PREVIEW!", es decir, una versión previa y no una release estable.

El modelo está especializado en húngaro (`language: hu`) y su objetivo es la conversación multi-turno mediante una plantilla de chat Jinja almacenada en el tokenizer, con roles `system` y `user`. Su relevancia actual es limitada pero concreta: el ecosistema de modelos pequeños (menos de 1.000 M de parámetros) con buen soporte de idiomas distintos del inglés es escaso, y el húngaro es un idioma con pocos recursos, por lo que cualquier modelo abierto con licencia Apache 2.0 en ese idioma resulta útil para investigación y para ajuste fino posterior.

La información publicada es mínima: no se documentan datos de entrenamiento, longitud de contexto, benchmarks ni cuantizaciones oficiales. El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, hecho que debe tenerse en cuenta antes de utilizarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LFM2 (según el tag del repositorio); configuración interna no disponible |
| Parámetros totales | 856.662.144 (dato real de los safetensors) |
| Parámetros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no se documentan cuantizaciones oficiales; los pesos publicados ocupan 1,7 GB, compatible con bfloat16/fp16 |
| Idiomas soportados | húngaro (hu) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Desarrollador | picur (usuario de Hugging Face) |
| Librería de referencia | transformers |
| Tamaño del repositorio | 1,7 GB |
| Fecha de creación en el repositorio | 2026-09-28 (según metadatos del repositorio) |
| Fecha de última actualización | 2026-09-28 (según metadatos del repositorio) |

## Arquitectura y entrenamiento

El tag `lfm2` indica que el modelo pertenece a la familia LFM2 de Liquid AI, que según su documentación pública combina bloques convolucionales y mecanismos de atención en lugar de una pila transformer densa convencional. Sin embargo, la model card de picur-860M-instruct no especifica la configuración concreta: número de capas, dimensión oculta, número de cabezas, tipo de atención, tamaño del vocabulario ni ventana de contexto. Todos esos datos quedan como no disponibles.

Tampoco hay información sobre el entrenamiento: se desconoce el número de tokens, la composición del dataset, si hubo etapas de preentrenamiento desde cero o ajuste sobre un modelo base LFM2, y si se aplicaron técnicas de alineación como RLHF, DPO o SFT. La única evidencia de ajuste instructivo es la presencia de una plantilla de chat Jinja con roles `system` y `user` en el tokenizer, tal y como muestra el ejemplo de uso de la propia model card. El autor etiqueta la publicación como "PREVIEW!", lo que sugiere que se trata de una instantánea intermedia y no de un modelo finalizado.

## Capacidades

- Generación de texto en húngaro: es el idioma declarado y el único soportado oficialmente.
- Conversación multi-turno: la plantilla de chat permite mensajes de sistema y de usuario, y el ejemplo de la model card muestra una generación de historia larga a partir de una instrucción.
- Seguimiento de instrucciones: el modelo se distribuye con la etiqueta `instruct` y pipeline `text-generation`.
- Generación de texto creativo y narrativo: el ejemplo oficial pide un cuento largo sobre un pescador viejo.
- Soporte de `tool calling` / `function calling`: no disponible; no se documenta en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades multilingües: limitadas al húngaro; no se declara soporte de inglés ni de otros idiomas.
- Capacidades especiales (modo razonamiento, visión, audio): no disponible; no se documenta ninguna.
- Modo de cuantización propio: no disponible; solo se publican pesos safetensors.

## Casos de uso

- Asistentes conversacionales en húngaro: el modelo acepta plantillas de chat con rol de sistema, de modo que se puede fijar una persona y mantener diálogos multi-turno sin salir del idioma. Es adecuado para prototipos de atención al cliente en húngaro donde no se requiere el rendimiento de un modelo de 7 B o superior.
- Generación de contenido editorial y creativo en húngaro: redacción de relatos, resúmenes divulgativos o textos de marketing en un idioma con pocos modelos abiertos. El ejemplo oficial de generación de una historia larga ilustra este uso.
- Base para ajuste fino en dominios verticales húngaros: al tener 856 M de parámetros y licencia Apache 2.0, se puede reentrenar con LoRA o QLoRA en una única GPU de gama media para dominios como legal, sanitario o administración pública en húngaro.
- Ejecución local con privacidad de datos: con menos de 1.000 M de parámetros cabe en GPUs de consumo e incluso en CPU, lo que permite desplegarlo en portátiles o en servidores sin GPU para procesar texto que no puede salir de la organización.
- Generación de datos sintéticos en húngaro: puede utilizarse para crear corpus de texto etiquetado o pares instrucción-respuesta que después se filtren y se usen para entrenar modelos mayores, dado su bajo coste de inferencia.
- Investigación sobre arquitecturas híbridas: al ser un ajuste instructivo sobre LFM2, sirve como banco de pruebas para comparar convoluciones más atención frente a transformers densos en tareas generativas en un idioma morfológicamente complejo como el húngaro.
- Educación y materiales didácticos: generación de ejercicios, explicaciones o textos de práctica en húngaro para plataformas de aprendizaje, con la ventaja de que el modelo puede ejecutarse en el mismo servidor que la aplicación web.
- Clasificación y extracción de información en húngaro: mediante prompts de tipo "extrae las entidades de este texto", se puede emplear como componente de un pipeline de procesamiento de documentos, siempre que se validen las salidas por el riesgo de alucinación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, HellaSwag ni de ninguna otra evaluación estándar, y no se han encontrado resultados en la búsqueda web realizada. Tampoco se dispone de comparaciones con el modelo base LFM2 sobre el que se habría ajustado.

## Requisitos de hardware

Estimaciones derivadas del número de parámetros (856.662.144) y del tamaño del repositorio; no están confirmadas por el autor:

- VRAM para inferencia en bfloat16/fp16: aproximadamente 1,8 GB solo para los pesos, más memoria para caché KV y activaciones; en la práctica, entre 2,5 GB y 4 GB según la longitud de contexto utilizada.
- VRAM en cuantización de 8 bits: aproximadamente 0,9 GB de pesos.
- VRAM en cuantización de 4 bits: aproximadamente 0,5 GB de pesos.
- GPU de consumo: cabe con holgura en cualquier GPU con 4 GB o más de VRAM, como una GTX 1650, RTX 3050, RTX 3060, RTX 4060 o RTX 4090. También es viable en CPU con conversión a GGUF.
- GPU de centro de datos: A100, H100 o similares no son necesarias para inferencia individual; solo tendrían sentido para servir lotes muy grandes con alto throughput.
- Opciones de despliegue: `transformers` es la vía soportada oficialmente (el ejemplo de la model card usa `AutoModelForCausalLM` con `device_map="auto"` y `torch_dtype=torch.bfloat16`). Para llama.cpp u Ollama sería necesaria una conversión manual a GGUF, ya que no se publican archivos GGUF en el repositorio. Para vLLM o TGI habría que verificar que la versión instalada soporte la arquitectura LFM2, algo que no se confirma en la información disponible.
- Latencia y throughput estimados: no disponible.
- Memoria en disco: 1,7 GB para los pesos en safetensors.

## Comparativa con modelos similares

No se dispone de benchmarks de picur-860M-instruct, por lo que la comparación se limita a datos estructurales de la documentación pública de cada alternativa; no se han verificado dentro de esta búsqueda.

| Modelo | Parámetros | Contexto | Idiomas principales | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| picur-860M-instruct | 856 M | no disponible | húngaro | Apache 2.0 | safetensors en Hugging Face, sin GGUF oficial |
| Llama 3.2 1B Instruct | 1.230 M | 128.000 tokens | multilingüe, con húngaro entre los idiomas soportados | Llama 3.2 Community License | safetensors y GGUF oficiales |
| Qwen2.5 1.5B Instruct | 1.540 M | 32.000 tokens | multilingüe, húngaro no destacado | Apache 2.0 | safetensors y cuantizaciones oficiales |
| SmolLM2 1.7B Instruct | 1.710 M | 8.000 tokens | principalmente inglés | Apache 2.0 | safetensors y GGUF oficiales |

Diferencias clave: picur-860M-instruct es el único de la tabla entrenado específicamente para húngaro, pero también es el único sin contexto declarado, sin benchmarks y sin cuantizaciones publicadas. Llama 3.2 1B y Qwen2.5 1.5B ofrecen cobertura multilingüe más amplia y mayor contexto documentado; SmolLM2 1.7B tiene un enfoque claramente anglófono. En rendimiento no es posible comparar sin métricas publicadas.

## Limitaciones y advertencias

- Estado de vista previa: el propio autor etiqueta el modelo como "PREVIEW!", lo que implica que puede cambiar o retirarse sin aviso y que no ha pasado por un proceso de validación documentado.
- Ausencia total de benchmarks: no hay métricas que permitan estimar su calidad frente a alternativas, ni siquiera en húngaro.
- Sesgos conocidos: no disponible; la model card no documenta evaluación de sesgos, y al desconocerse el corpus de entrenamiento no se puede estimar la representatividad de los datos ni la presencia de contenido tóxico.
- Riesgo de alucinación: elevado en modelos de este tamaño y sin datos de alineación publicados; las respuestas factuales deben verificarse siempre, especialmente en dominios técnicos, legales o médicos.
- Limitación de idioma: solo se declara húngaro. El uso en castellano, inglés u otros idiomas no está soportado y previsiblemente dará resultados degradados.
- Longitud de contexto desconocida: al no documentarse la ventana de contexto, no se puede garantizar el comportamiento en conversaciones largas ni en documentos extensos; conviene validar empíricamente antes de fijar una política de truncado.
- Licencia: Apache 2.0 permite uso comercial, redistribución y modificación, pero no cubre los derechos sobre los datos de entrenamiento, que se desconocen; el usuario asume el riesgo de una posible reclamación sobre el corpus.
- Repositorio sin tracción: 0 descargas y 0 "likes" en el momento de la consulta, sin issues ni comunidad que permita contrastar problemas conocidos.
- Sin cuantizaciones ni formatos alternativos: no hay GGUF, AWQ ni GPTQ publicados, por lo que el despliegue ligero exige conversión manual y su validación posterior.
- Metadatos inconsistentes: las fechas del repositorio (2026-09-28) no coinciden con un calendario habitual en el momento de la consulta, lo que sugiere metadatos poco fiables o generados automáticamente.
- Los resultados de la búsqueda web realizada no guardan relación con este modelo (aparecen un suplemento alimenticio, un registro sanitario francés, una empresa de congelados y una página de apuestas hípicas), por lo que no aportan información verificable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/picur/picur-860M-instruct
- Repositorio de modelos LFM2 de Liquid AI (referencia de la familia arquitectónica indicada por el tag, no enlazado desde la model card): https://huggingface.co/LiquidAI
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos relacionados con picur-860M-instruct.
