# bartowski/Danielbrdz_Barcenas-LFM3-1.7B-GGUF

## Resumen

Barcenas-LFM3-1.7B es un modelo de generacion de texto de 1.728.801.600 parametros (aproximadamente 1,7 mil millones), desarrollado por Danielbrdz y afinado a partir de la familia LFM3 (Liquid Foundation Models, version 3). El modelo esta especializado en castellano y se ha entrenado con el dataset OysterCoreAI/SFT-General-Spanish-50K, un conjunto de ajuste supervisado orientado a conversacion general en espanol. La version aqui descrita es la cuantizacion GGUF publicada por bartowski, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp.

El modelo resuelve el problema de disponer de un asistente conversacional en castellano de tamano reducido, desplegable en local y con soporte de plantilla de chat compatible con tool calling y modo de razonamiento explicito (etiquetas `<think>`). Su relevancia actual radica en que combina un peso muy contenido (1,12 GB en Q4_K_M) con una ventana de contexto no documentada en la informacion disponible, lo que lo hace candidato para entornos con recursos limitados donde no es viable un modelo mayor.

La ficha se centra en el artefacto GGUF publicado por bartowski, que incluye cuantizaciones desde bf16 (3,47 GB) hasta Q3_K_L (0,89 GB), generadas con llama.cpp release b12180 y calibracion imatrix. El repositorio ocupa 26,6 GB en total y no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3, familia Liquid Foundation Models) |
| Parametros totales | 1.728.801.600 (aproximadamente 1,7 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, IQ4_NL, Q4_0, Q4_K_S, IQ4_XS, IQ3_M, Q3_K_L (y posteriores en la model card truncada) |
| Idiomas soportados | es (espanol) |
| Licencia | lfm1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | GGUF (cuantizaciones de llama.cpp); el checkpoint original no se detalla en la informacion disponible |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base LFM3, mas alla de su pertenencia a la familia Liquid Foundation Models. No se especifica si emplea atencion estandar, atencion lineal, SSM o una combinacion hibrida, ni el numero de capas, dimensiones ocultas o cabezas de atencion. Tampoco se documenta la longitud de contexto nativa ni el vocabulario.

En cuanto al entrenamiento, la model card indica que el ajuste se realizo sobre el dataset OysterCoreAI/SFT-General-Spanish-50K, un conjunto de ajuste supervisado en espanol de 50.000 ejemplos orientado a conversacion general. No se especifica el numero total de tokens de preentrenamiento, la composicion del corpus base ni si se aplicaron tecnicas de RLHF o DPO. La plantilla de chat incluye etiquetas `<|im_start|>`, `<|im_end|>` y `<|startoftext|>`, asi como un bloque `<think>` para razonamiento explicito y un bloque `<tools>` para definiciones de herramientas en formato JSON. La cuantizacion se realizo con llama.cpp b12180 e imatrix, lo que indica calibracion con un dataset de calibracion para preservar la calidad en cuantizaciones bajas.

## Capacidades

- Generacion de texto conversacional en espanol, con plantilla de chat multi-turno basada en roles system, user y assistant.
- Modo de razonamiento explicito mediante la etiqueta `<think>`, que permite separar el razonamiento interno de la respuesta final.
- Soporte de tool calling / function calling mediante el bloque `<tools>` con definiciones JSON de funciones, parametros y descripciones.
- Capacidad de agentes y razonamiento multi-paso, segun se deduce de la plantilla de herramientas y del modo de pensamiento.
- Capacidades multilingues limitadas al espanol segun la etiqueta de idioma del repositorio.
- No se documentan capacidades de vision, audio ni otras modalidades; la model card indica entrada de solo texto.
- No se documenta decodificacion especulativa (la model card indica explicitamente "Speculative decoding: no").

## Casos de uso

- Asistente conversacional local en espanol: el modelo puede gestionar dialogos multi-turno con la plantilla `<|im_start|>` en entornos de escritorio o embebidos, gracias a su tamano de 1,12 GB en Q4_K_M, que permite ejecucion en CPU y GPU de gama baja.
- Atencion al cliente automatizada en espanol: con soporte de tool calling, puede invocar funciones como consulta de pedidos o precios (ejemplo de la propia model card con `get_stock_price`) y mantener contexto de conversacion en sistemas de soporte de primera linea.
- Prototipado rapido de agentes: el bloque `<tools>` y el modo `<think>` permiten construir agentes que razonan y llaman funciones sin necesidad de infraestructura GPU dedicada, usando llama.cpp u Ollama en una estacion de trabajo.
- Generacion de texto y resumenes en castellano: adecuado para tareas de redaccion asistida, resumen de documentos y reescritura en aplicaciones de productividad personal que requieran privacidad y ejecucion offline.
- Clasificacion y extraccion de informacion en espanol: puede usarse como modelo de extraccion de entidades o clasificacion de intenciones en pipelines de procesamiento de lenguaje natural, con la ventaja de no enviar datos a la nube.
- Educacion y tutoria en espanol: el modo de razonamiento `<think>` permite mostrar el proceso de razonamiento paso a paso en explicaciones, util para asistentes de aprendizaje en entornos con recursos limitados.
- Despliegue en dispositivos de borde: la cuantizacion IQ3_M (0,93 GB) o Q3_K_L (0,89 GB) permite ejecutar el modelo en Raspberry Pi o mini-PC con poca RAM, para tareas de generacion de texto de baja latencia y sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB en Q4_K_M (1,12 GB de pesos mas overhead de contexto y KV cache); aproximadamente 2,5-3 GB en Q8_0 (1,85 GB de pesos); aproximadamente 4,5-5 GB en bf16 (3,47 GB de pesos).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para mayor throughput; tambien viable en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1650 4 GB en adelante) con cuantizaciones Q4 o inferiores; en Q8_0 requiere al menos 4 GB.
- Opciones de despliegue: llama.cpp (version b12180 o superior, usada para la cuantizacion), Ollama, LM Studio, y servidores compatibles con la API de endpoints de Hugging Face (el repositorio esta marcado como `endpoints_compatible`). No se documenta soporte de vLLM ni TGI para este artefacto GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Barcenas-LFM3-1.7B (este) | 1,73 B | no disponible | lfm1.0 | GGUF | Especializado en espanol, tool calling y modo `<think>` |
| Alternativas de tamano similar en espanol | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |
| Alternativas de tamano similar en ingles | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa rigurosa con modelos de la misma categoria. Se recomienda evaluar directamente contra otros modelos de 1-2 B afinados en espanol disponibles en Hugging Face, pero no se aportan datos concretos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al estar afinado sobre un dataset SFT en espanol de origen no especificado, puede heredar sesgos del corpus base y del conjunto de ajuste.
- Riesgo de alucinacion: inherente a los modelos de 1,7 B de parametros; la capacidad de razonamiento y verificacion factica es limitada en comparacion con modelos mayores.
- Limitaciones de contexto e idioma: el modelo esta etiquetado unicamente para espanol; no se documenta la longitud de contexto, lo que impide garantizar ventanas largas en produccion. El rendimiento en otros idiomas no esta garantizado.
- Restricciones de licencia: la licencia es lfm1.0 (etiquetada como `other`), lo que implica que el uso comercial puede estar sujeto a condiciones especificas de la licencia LFM; es necesario revisar el archivo LICENSE del repositorio antes de un despliegue comercial.
- Caveats para produccion: el repositorio no registra descargas ni validacion comunitaria (0 descargas, 0 likes), lo que reduce la evidencia sobre su calidad en produccion. La model card esta truncada en la informacion proporcionada, por lo que pueden existir cuantizaciones adicionales no listadas. No se documenta soporte de decodificacion especulativa ni de vLLM/TGI, lo que limita el throughput en servidores de alta concurrencia.
- El modelo base Danielbrdz/Barcenas-LFM3-1.7B no esta documentado en la informacion proporcionada mas alla de su relacion de cuantizacion.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/bartowski/Danielbrdz_Barcenas-LFM3-1.7B-GGUF
- Modelo base: https://huggingface.co/Danielbrdz/Barcenas-LFM3-1.7B
- Dataset de ajuste: https://huggingface.co/datasets/OysterCoreAI/SFT-General-Spanish-50K
- Perfil del cuantizador bartowski: https://huggingface.co/bartowski
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp/
- Release de llama.cpp usado para la cuantizacion: https://github.com/ggml-org/llama.cpp/releases/tag/b12180
- Cuantizacion Q4_K_M recomendada: https://huggingface.co/bartowski/Danielbrdz_Barcenas-LFM3-1.7B-GGUF/blob/main/Danielbrdz_Barcenas-LFM3-1.7B-Q4_K_M.gguf
