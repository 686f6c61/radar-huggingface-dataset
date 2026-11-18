# SoAIHQ/Qwen3.5-9B-GGUF

## Resumen

Qwen3.5-9B-GGUF es la distribucion en formato GGUF del modelo Qwen3.5-9B desarrollado por Qwen (Alibaba), cuantizada por SoAIHQ para su uso con llama.cpp. Se trata de un modelo denso de 9.197.093.888 parametros (aproximadamente 9B) con capacidad multimodal de entrada de imagen y texto, modo de razonamiento ("thinking") activado por defecto y una ventana de contexto de 262.144 tokens (256K). Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

El modelo resuelve el problema de desplegar un modelo multimodal con razonamiento y contexto muy largo en hardware de consumo: la cuantizacion Q4_K_M ocupa 5,8 GB, lo que permite ejecutarlo en una unica GPU de gama alta para consumidores, mientras que Q8_0 ocupa 9,8 GB. La arquitectura es hibrida, combinando Gated DeltaNet con atencion clasica, una eleccion que busca reducir el coste computacional del contexto largo frente a un transformer denso convencional.

La relevancia actual de esta ficha radica en que combina tres capacidades poco frecuentes en un modelo de 9B: entrada de imagenes (pipeline image-text-to-text), razonamiento explicito conmutable por peticion y soporte nativo de tool calling, todo ello con licencia permisiva. La cuantizacion se ha calibrado con un corpus propio de SoAI que incluye conversaciones multi-turno, codigo, llamadas a herramientas y matematicas paso a paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Densa, hibrida Gated DeltaNet + atencion |
| Parametros totales | 9.197.093.888 (aproximadamente 9B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | Q4_K_M (5,8 GB), Q8_0 (9,8 GB); no se publican cuantizaciones por debajo de 4 bits |
| Idiomas soportados | 201 idiomas y dialectos (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), con mmproj F16 separado de 918,2 MB para entrada de imagen |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura densa hibrida que combina capas Gated DeltaNet con capas de atencion clasica. Gated DeltaNet es una variante de atencion lineal con estado recurrente que reduce el coste de memoria y computo en secuencias largas, lo que resulta coherente con la ventana de 262.144 tokens declarada. Al ser un modelo denso, todos los parametros se activan en cada token generado, a diferencia de las variantes MoE de la familia.

No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo base. La model card si confirma que el modelo tiene razonamiento activado por defecto y que puede desactivarse por peticion mediante `chat_template_kwargs`. En cuanto al proceso de cuantizacion, SoAIHQ aplica una importance matrix (imatrix) calculada sobre un corpus propio de calibracion que incluye conversaciones multi-turno en 21 idiomas, ediciones de codigo en 22 lenguajes de programacion, llamadas a herramientas con sus resultados, matematicas paso a paso y prosa web. Antes de publicar, el pipeline verifica que los marcadores de chat, thinking y tool-call se almacenen como tokens especiales y que la plantilla de chat coincida con la del modelo original; si la conversion los importa como texto plano, el build se detiene.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activado por defecto, conmutable por peticion mediante `enable_thinking`.
- Entrada multimodal de imagenes (image-text-to-text); requiere el fichero `mmproj-Qwen3.5-9B-f16.gguf` cargado con `--mmproj`.
- Sin soporte de audio.
- Tool calling / function calling nativo, con sintaxis propia de llamada a herramientas incluida en la plantilla de chat.
- Soporte de agentes y razonamiento multi-paso gracias al modo thinking y al contexto de 256K.
- Capacidades multilingues: 201 idiomas y dialectos declarados.
- Generacion de codigo en multiples lenguajes (el corpus de calibracion cubre 22 lenguajes de programacion).
- Razonamiento matematico paso a paso.
- API compatible con OpenAI a traves de llama-server.

## Casos de uso

- **Atencion al cliente automatizada**: el modelo puede mantener conversaciones multi-turno con historial extenso gracias a los 262.144 tokens de contexto, sin truncar el historial de interacciones previas, y con tool calling para consultar sistemas de ticketing o bases de datos de pedidos.
- **Generacion y revision de codigo en produccion**: soporta tool calling y puede integrarse en pipelines de CI/CD como revisor de parches o generador de tests; el modo thinking con temperatura 0,6 y top_p 0,95 es la configuracion recomendada por Qwen para codigo preciso.
- **Analisis de documentos e imagenes**: al aceptar entrada de imagen, puede procesar capturas de pantalla, diagramas o formularios escaneados junto con instrucciones textuales, util para extraccion de datos estructurados en back office.
- **Asistente local en estacion de trabajo**: la cuantizacion Q4_K_M (5,8 GB) permite ejecutarlo en una unica GPU de consumo mediante llama-server, con interfaz de chat integrada y API compatible con OpenAI en `localhost:8080`.
- **Razonamiento matematico y analisis paso a paso**: el modo thinking por defecto genera cadenas de razonamiento explicitas utiles para verificar calculos, auditar resultados intermedios o generar explicaciones docentes.
- **Agentes autonomos multi-paso**: la combinacion de tool calling nativo, contexto largo y razonamiento permite construir agentes que encadenen busquedas, llamadas a APIs y sintesis de resultados sin perder el hilo de la tarea.
- **Traduccion y procesamiento multilingue**: con 201 idiomas declarados, adecuado para pipelines de localizacion o clasificacion de contenido en idiomas minoritarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM para Q4_K_M**: 5,8 GB de pesos mas memoria para el contexto; el consumo del contexto crece con la longitud configurada, por lo que con 256K tokens las necesidades de memoria aumentan de forma significativa.
- **VRAM para Q8_0**: 9,8 GB de pesos mas contexto; requiere una GPU con al menos 16 GB para margen razonable.
- **Entrada de imagen**: anade 918,2 MB del proyector multimodal (mmproj F16).
- **GPU recomendadas**: no se especifican modelos concretos en la informacion disponible. Por tamano, Q4_K_M es viable en GPU de consumo de gama alta con 8-12 GB o mas; Q8_0 requiere 16 GB o superior. Para despliegues en servidor, A100 o H100 ofrecen margen amplio, pero no hay datos de rendimiento publicados.
- **Despliegue**: llama.cpp (llama-server, con descarga automatica del mmproj mediante `llama-server -hf`), con API compatible con OpenAI. Tambien puede ejecutarse en CPU o con capas repartidas entre GPU y CPU.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-9B-GGUF (SoAIHQ) | 9B denso | 256K | Imagen + texto | Apache 2.0 | GGUF |
| Qwen3.5-9B (original) | 9B denso | 256K | Imagen + texto | Apache 2.0 | Safetensors |
| Alternativas de 9B con vision | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion con datos verificables es frente al modelo base original: misma arquitectura, mismos parametros y mismo contexto, con la diferencia de que la version GGUF sacrifica precision (Q4_K_M o Q8_0) a cambio de un tamano entre un tercio y la mitad del original de 16 bits. No se dispone de informacion sobre otros modelos comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- No se publican cuantizaciones por debajo de 4 bits; en hardware con menos de aproximadamente 8 GB de VRAM puede no ser desplegable con calidad aceptable.
- La cuantizacion Q4_K_M introduce perdida de calidad respecto a los pesos originales; Q8_0 es casi sin perdida pero requiere el doble de memoria.
- El modo thinking esta activado por defecto y consume tokens de contexto y de salida; Qwen recomienda un contexto minimo de 128K para dejar espacio al razonamiento y hasta 32K tokens de salida para la mayoria de consultas.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan tasas especificas en la informacion disponible.
- No se documentan sesgos conocidos en la informacion proporcionada.
- La lista de 201 idiomas procede de la model card del autor; no se detalla el rendimiento por idioma.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar los terminos del modelo base en el enlace de licencia original.
- El soporte de imagen depende de cargar correctamente el fichero mmproj; sin el, el modelo funciona solo con texto.
- La fecha de creacion del repositorio (2026-09-26) y el numero reducido de likes (2) frente a las descargas (9.811) sugieren un modelo reciente con validacion comunitaria limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SoAIHQ/Qwen3.5-9B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Sitio de SoAI: https://soai.to
- Fichero Q4_K_M: https://huggingface.co/SoAIHQ/Qwen3.5-9B-GGUF/resolve/main/Qwen3.5-9B-Q4_K_M.gguf
- Fichero Q8_0: https://huggingface.co/SoAIHQ/Qwen3.5-9B-GGUF/resolve/main/Qwen3.5-9B-Q8_0.gguf
- Proyector multimodal mmproj F16: https://huggingface.co/SoAIHQ/Qwen3.5-9B-GGUF/resolve/main/mmproj-Qwen3.5-9B-f16.gguf
