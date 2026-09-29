# SIZWL/NVIDIA-Nemotron-3-Super-120B-A12B-BF16

## Resumen

NVIDIA-Nemotron-3-Super-120B-A12B-BF16 es un modelo de lenguaje de gran tamano desarrollado por NVIDIA Corporation dentro de la familia Nemotron 3. Se trata de un modelo de arquitectura hibrida denominada LatentMoE, que combina capas Mamba-2, capas de mezcla de expertos (MoE) y capas de atencion intercaladas, ademas de incorporar capas de prediccion multi-token (Multi-Token Prediction, MTP). Cuenta con 120B parametros totales (123.611.012.096 segun los pesos en safetensors) de los cuales solo 12B estan activos por token, lo que reduce el coste de inferencia respecto a un modelo denso del mismo tamano.

El modelo esta orientado a flujos de trabajo agenticos, razonamiento de contexto largo y cargas de alto volumen, como la automatizacion de tickets de soporte IT. Soporta una ventana de contexto de hasta 1M tokens y siete idiomas: ingles, frances, aleman, italiano, japones, espanol y chino. Incorpora un modo de razonamiento configurable mediante la plantilla de chat (`enable_thinking=True/False`), de modo que el mismo checkpoint puede generar una traza de razonamiento antes de la respuesta final o responder directamente.

Su relevancia actual radica en tres factores: la publicacion de pesos abiertos bajo la NVIDIA Nemotron Open Model License, que permite uso comercial; la disponibilidad de los datasets de preentrenamiento y postentrenamiento asociados; y una eficiencia computacional sostenida por el entrenamiento con cuantizacion NVFP4 y por una cabeza MTP integrada que actua como decodificacion especulativa. La fecha de publicacion indicada es el 11 de marzo de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LatentMoE: hibrida Mamba-2 + MoE + atencion, con Multi-Token Prediction (MTP) |
| Parametros totales | 120B nominales; 123.611.012.096 reales segun safetensors |
| Parametros activos | 12B |
| Longitud de contexto | Hasta 1M tokens |
| Tipos de cuantizacion | BF16 en este checkpoint; existe una variante NVFP4 en un checkpoint separado. No se mencionan GGUF, AWQ ni GPTQ |
| Idiomas soportados | Ingles, frances, aleman, italiano, japones, espanol, chino |
| Licencia | NVIDIA Nemotron Open Model License |
| Formato de pesos | safetensors (BF16), con codigo personalizado (`custom_code`) y `nemotron_h` como arquitectura declarada |
| Tamano del repositorio | 247,2 GB |
| Requisito minimo de GPU indicado | 8x H100-80GB |
| Modo de razonamiento | Configurable mediante la plantilla de chat (`enable_thinking=True/False`) |
| Decodificacion especulativa | Cabeza MTP integrada; version MTPv2 disponible como checkpoint aparte |
| Fecha de publicacion | 11 de marzo de 2026 |
| Fechas de desarrollo | Diciembre de 2025 - marzo de 2026 |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura hibrida LatentMoE que intercala capas Mamba-2 y capas de mezcla de expertos, junto con un numero selecto de capas de atencion. Esta combinacion busca mantener la capacidad de modelado de dependencias de largo alcance de la atencion tradicional, aprovechando al mismo tiempo la eficiencia de las capas de espacio de estado (Mamba-2) para el procesamiento secuencial y la capacidad de escalado de la mezcla de expertos. El resultado es un modelo de 120B parametros totales con solo 12B activos por token. A diferencia del modelo Nano de la misma familia, la variante Super incorpora capas de prediccion multi-token (MTP) que aceleran la generacion de texto y, segun la documentacion del autor, tambien mejoran la calidad. La cabeza MTP funciona como decodificacion especulativa integrada, y existe una cabeza MTPv2 actualizada publicada como checkpoint independiente.

En cuanto a los datos, la model card indica que el preentrenamiento se realizo sobre los datasets de la coleccion `nvidia/nemotron-pre-training-datasets`, con fecha de corte de junio de 2025, y que el postentrenamiento uso `nvidia/nemotron-post-training-v3`, con fecha de corte de febrero de 2026. El modelo fue entrenado con cuantizacion NVFP4 para maximizar la eficiencia de computo. No se especifica en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni si se emplearon tecnicas concretas de RLHF o DPO, aunque el hecho de que exista un dataset de postentrenamiento publicado sugiere un pipeline de ajuste posterior al preentrenamiento. Tampoco se detalla la innovacion interna de las capas LatentMoE mas alla de su denominacion y de la combinacion de bloques descrita.

## Capacidades

- Generacion de texto conversacional en siete idiomas: ingles, frances, aleman, italiano, japones, espanol y chino.
- Razonamiento explicito con traza previa a la respuesta, activable o desactivable mediante el parametro `enable_thinking` de la plantilla de chat.
- Razonamiento de contexto largo: la ventana de hasta 1M tokens permite procesar documentos extensos, historiales largos o bases de codigo completas sin truncado agresivo.
- Flujos de trabajo agenticos y razonamiento multi-paso, segun la propia model card, que lo orienta a agentes colaborativos.
- Uso de herramientas (tool use) y generacion aumentada por recuperacion (RAG), ambos citados como casos de uso objetivo.
- Decodificacion especulativa mediante la cabeza MTP integrada, con una version MTPv2 disponible como checkpoint separado para acelerar la generacion.
- Despliegue en endpoints compatibles (`endpoints_compatible`) y en el catalogo de NVIDIA Build, lo que facilita su integracion en infraestructura existente.
- Capacidades de codigo, matematicas o vision: no se mencionan de forma explicita en la informacion disponible. No hay indicios de soporte multimodal en los tags ni en la model card.

## Casos de uso

- Automatizacion de tickets de soporte IT: la model card identifica este escenario como uno de los objetivos principales del modelo. Se usaria clasificando la incidencia, recuperando documentacion interna mediante RAG y generando una respuesta o una accion de resolucion, con la ventana de 1M tokens permitiendo arrastrar el historial completo del ticket y las bases de conocimiento asociadas sin recortes.
- Agentes colaborativos multi-paso: el modelo esta disenado para encadenar pasos de razonamiento y llamadas a herramientas, de modo que puede gestionar tareas como reservas, aprovisionamiento de recursos o tramitacion de solicitudes internas actuando sobre APIs corporativas.
- RAG sobre corpus documentales extensos: con contexto de hasta 1M tokens es viable inyectar manuales tecnicos, contratos o normativa completa directamente en el prompt, reduciendo la dependencia de un recuperador perfecto y mejorando la coherencia de las respuestas.
- Analisis de codigo en repositorios grandes: la ventana larga y el soporte multilingue permiten revisiones de codigo, generacion de tests o explicacion de modulos completos cargando varios ficheros a la vez en el mismo contexto.
- Atencion al cliente multilingue: al cubrir espanol, frances, aleman, italiano, japones, chino e ingles, un unico despliegue puede atender conversaciones en los siete idiomas sin enrutado a modelos distintos.
- Procesamiento por lotes de alto volumen: gracias a los 12B parametros activos sobre 120B totales, el coste por token es inferior al de un modelo denso equivalente, lo que lo hace adecuado para clasificacion, extraccion de entidades, resumen o etiquetado masivo de documentos.
- Asistentes internos con control de coste de razonamiento: la posibilidad de activar o desactivar la traza de razonamiento permite usar el mismo checkpoint para consultas simples (modo directo) y para tareas analiticas complejas (modo con razonamiento), sin mantener dos modelos en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card incluye una referencia a una imagen de precision (`accuracy_chart.png`) y a un informe tecnico, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K ni de otras evaluaciones en el material facilitado.

## Requisitos de hardware

- Peso del checkpoint en BF16: aproximadamente 247 GB (123.611.012.096 parametros x 2 bytes), coherente con los 247,2 GB del repositorio. Esto implica que los pesos por si solos no caben en una GPU de 80 GB ni en configuraciones de 2 o 3 GPU de 80 GB.
- Requisito minimo indicado por el fabricante: 8x H100-80GB, es decir, 640 GB de VRAM agregada, lo que deja margen para cache KV y activaciones con contexto largo.
- GPU recomendadas: H100-80GB en configuracion de 8 unidades es el minimo declarado. Para la variante NVFP4, la model card indica que puede ejecutarse en una sola B200 o en un DGX Spark.
- GPUs de consumo (RTX 4090, 3090, etc.): no es viable en BF16 con una sola unidad de consumo. La unica via razonable en hardware de gama consumer seria recurrir a cuantizaciones de muy baja precision, y la informacion disponible no menciona formatos GGUF ni cuantizaciones de ese tipo para este checkpoint.
- Opciones de despliegue: la libreria declarada es transformers, con arquitectura `nemotron_h` y codigo personalizado (`custom_code`), por lo que se requiere `trust_remote_code`. El modelo esta marcado como `endpoints_compatible` y disponible en NVIDIA Build. No se detallan en la informacion proporcionada integraciones especificas con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El unico dato indirecto es la existencia de la cabeza MTP como mecanismo de decodificacion especulativa para acelerar la generacion, sin cifras publicadas en el material facilitado.
- Parametros de muestreo recomendados: temperatura 1.0 y top_p 0.95 en todas las tareas y backends de servicio.

## Comparativa con modelos similares

No se dispone de datos comparativos de modelos alternativos en la informacion proporcionada. La propia model card menciona la existencia de un modelo Nano dentro de la familia Nemotron 3 y de checkpoints asociados (variante NVFP4 y cabeza MTPv2), pero no incluye sus especificaciones, de modo que no es posible construir una comparativa cuantitativa fiable.

| Modelo | Parametros | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3-Super-120B-A12B-BF16 | 120B | 12B | 1M tokens | NVIDIA Nemotron Open Model License | Pesos abiertos en HuggingFace y NVIDIA Build |
| Nemotron-3 Nano | no disponible | no disponible | no disponible | no disponible | Mencionado en la model card, sin especificaciones |
| Modelos de la misma categoria (MoE abiertos de ~100B+) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Riesgo de alucinacion: no se proporcionan tasas de alucinacion ni evaluaciones de veracidad. Como en cualquier modelo generativo, las respuestas deben validarse en dominios criticos.
- Sesgos: la informacion disponible no documenta analisis de sesgos, evaluaciones de equidad ni medidas de mitigacion especificas.
- Cobertura idiomatica desigual: aunque se declaran siete idiomas, no se especifica el nivel de competencia por idioma ni el porcentaje de cada uno en los datos de entrenamiento, por lo que el rendimiento en japones o chino podria diferir del de ingles.
- Coste de contexto largo: la ventana de 1M tokens es una capacidad maxima, no una garantia de rendimiento uniforme en toda la longitud. El consumo de memoria de la cache KV a longitudes extremas puede ser muy elevado y no se documentan cifras.
- Restricciones de licencia: el uso se rige por la NVIDIA Nemotron Open Model License. La model card indica que el modelo esta listo para uso comercial, pero las condiciones completas deben consultarse en el enlace de la licencia antes de desplegarlo en produccion.
- Requisitos de infraestructura elevados: el minimo declarado de 8x H100-80GB excluye el despliegue en hardware de consumo y encarece las pruebas y el ajuste fino.
- Dependencia de codigo personalizado: al usar `nemotron_h` con `custom_code`, es necesario confiar en el codigo remoto del repositorio y verificar que la version de transformers lo soporta.
- Repositorio espejo: el identificador facilitado corresponde a una copia publicada por el usuario SIZWL, con cero descargas y cero likes en el momento de la consulta. Para uso en produccion conviene contrastar con los repositorios oficiales de NVIDIA.
- Decodificacion especulativa: la cabeza MTPv2 se distribuye como checkpoint separado, lo que anade un artefacto adicional que gestionar si se quiere aprovechar la aceleracion.

## Enlaces

- Modelo en HuggingFace (copia consultada): https://huggingface.co/SIZWL/NVIDIA-Nemotron-3-Super-120B-A12B-BF16
- Checkpoint de la cabeza MTPv2: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16-MTPv2
- Variante NVFP4 para B200 y DGX Spark: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-NVFP4
- Informe tecnico (PDF): https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3-Super-Technical-Report.pdf
- Demo y despliegue en NVIDIA Build: https://build.nvidia.com/nvidia/nemotron-3-super-120b-a12b
- Coleccion de datasets de preentrenamiento: https://huggingface.co/collections/nvidia/nemotron-pre-training-datasets
- Coleccion de datasets de postentrenamiento v3: https://huggingface.co/collections/nvidia/nemotron-post-training-v3
- Pagina de desarrollador de Nemotron: https://developer.nvidia.com/nemotron
- Licencia NVIDIA Nemotron Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
- arXiv 2512.20848: https://arxiv.org/abs/2512.20848
- arXiv 2512.20856: https://arxiv.org/abs/2512.20856
