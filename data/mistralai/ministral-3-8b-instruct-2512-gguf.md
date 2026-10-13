# mistralai/Ministral-3-8B-Instruct-2512-GGUF

## Resumen

Ministral 3 8B Instruct 2512 es un modelo de lenguaje con capacidades de vision desarrollado por Mistral AI, una empresa francesa especializada en inteligencia artificial generativa. Esta ficha corresponde concretamente a la version cuantizada en formato GGUF del modelo base `mistralai/Ministral-3-8B-Instruct-2512`, publicada por el propio autor para facilitar el despliegue en hardware modesto. El modelo pertenece a la familia Ministral 3, disenada explicitamente para despliegue en el borde (edge) y en entornos con recursos limitados.

El modelo combina un modelo de lenguaje de 8,4B parametros con un encoder de vision de 0,4B, sumando aproximadamente 8,49B parametros segun los pesos en safetensors del repositorio. Soporta una ventana de contexto de 256k tokens, once idiomas declarados (ingles, frances, espanol, aleman, italiano, portugues, neerlandes, chino, japones, coreano y arabe) y capacidades agenticas con function calling nativo y salida JSON. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificacion.

Su relevancia actual radica en que ofrece capacidades multimodales y agenticas en un tamano que cabe en 12 GB de VRAM en FP8 (y menos si se cuantiza mas), lo que lo posiciona como una opcion practica para inferencia local y despliegues en produccion con presupuesto de hardware ajustado. La fecha de creacion del repositorio es el 31 de octubre de 2025 y su ultima actualizacion es del 15 de enero de 2026, con 38.616 descargas y 99 "likes" en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con componente de lenguaje (8,4B) y encoder de vision (0,4B); detalles de arquitectura interna no disponibles |
| Parametros totales | 8.489.553.920 (8,49B) segun safetensors del repositorio |
| Parametros activos | No aplica (no se indica que el modelo sea MoE) |
| Longitud de contexto | 256k tokens |
| Tipos de cuantizacion | GGUF en distintos niveles de cuantizacion; niveles concretos no detallados en la informacion disponible |
| Idiomas soportados | Ingles, frances, espanol, aleman, italiano, portugues, neerlandes, chino, japones, coreano y arabe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La model card indica que Ministral 3 8B se compone de dos bloques principales: un modelo de lenguaje de 8,4B parametros y un encoder de vision de 0,4B. No se especifica en la informacion disponible si la parte de lenguaje emplea una arquitectura densa o de mezcla de expertos (MoE), ni los detalles de atencion (por ejemplo, si usa atencion lineal, ventanas deslizantes o decodificacion especulativa). Tampoco se detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO concretas.

Esta version es la variante instruct ya post-entrenada para tareas de instruccion y chat, y luego cuantizada a GGUF. La model card describe la familia Ministral 3 como optimizada para edge y capable de ejecutarse en un rango amplio de hardware. Los detalles tecnicos de entrenamiento, composicion del dataset e innovaciones de atencion no estan disponibles en la informacion proporcionada; se remite al paper asociado (arXiv:2601.08584) y al blog de Mistral para informacion adicional.

## Capacidades

- Generacion de texto e interaccion conversacional orientada a instrucciones y chat.
- Vision: analisis de imagenes y generacion de respuestas basadas en contenido visual, ademas de texto.
- Multilingue: soporte de once idiomas declarados (en, fr, es, de, it, pt, nl, zh, ja, ko, ar).
- Adherencia a system prompts, con soporte fuerte para definir entorno y caso de uso.
- Capacidades agenticas con llamada a funciones (function calling) nativa.
- Salida en formato JSON.
- Modo de razonamiento agentico multi-paso segun las capacidades agenticas declaradas.
- Optimizado para despliegue en el borde y ejecucion local.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de 256k tokens, manteniendo el historial de la conversacion sin truncados agresivos y aplicando un system prompt que defina el tono y las politicas.
- Agentes con herramientas en produccion: su soporte de function calling nativo y salida JSON permite integrarlo en flujos donde el modelo decide que herramienta invocar (consultas a bases de datos, APIs internas, calculos) manteniendo un conjunto de herramientas bien definido.
- Analisis de documentos con imagenes: al combinar vision y contexto largo, puede procesar capturas, diagramas o documentos escaneados y responder preguntas sobre ellos, util en tareas de extraccion y resumen.
- Asistente de codigo integrado en IDE: puede generar y explicar fragmentos de codigo y responder a peticiones de refactorizacion en un entorno local, con temperatura baja (por debajo de 0,1) para mayor determinismo.
- Clasificacion y extraccion estructurada de informacion: gracias a la salida JSON, es adecuado para pipelines donde se necesita transformar texto libre en campos estructurados (por ejemplo, tickets, formularios o mensajes de correo).
- Despliegue en dispositivos con recursos limitados: al caber en 12 GB de VRAM en FP8 (y menos con cuantizacion adicional), sirve para asistentes locales en estaciones de trabajo o portatiles con GPU consumer.
- Traduccion y atencion multilingue: con soporte de once idiomas, puede emplearse en sistemas que atienden a usuarios en varios idiomas sin necesidad de modelos separados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: la model card indica que Ministral 3 8B cabe en 12 GB de VRAM en FP8; con cuantizaciones GGUF mas agresivas el requisito es menor.
- Parametros del modelo: 8,49B en total (8,4B de lenguaje + 0,4B de vision).
- GPU consumer: segun el dato de 12 GB en FP8, es desplegable en GPU consumer de gama alta (por ejemplo, tarjetas con 12-24 GB de VRAM); con cuantizacion GGUF adicional puede ejecutarse en configuraciones con menos memoria.
- GPU de centro de datos: no se especifican recomendaciones concretas (A100, H100, etc.) en la informacion disponible; al ser un modelo pequeno, no requiere aceleradores de gama alta.
- Opciones de despliegue: el repositorio esta etiquetado con la libreria vllm y el formato GGUF, por lo que es compatible con runners de GGUF (llama.cpp, Ollama) y con vLLM; otras opciones como TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Ajustes recomendados por el autor: temperatura por debajo de 0,1 para entornos de produccion y uso diario; mantener las imagenes con una relacion de aspecto cercana a 1:1; limitar el numero de herramientas a las estrictamente necesarias en casos agenticos.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos comparables en la informacion proporcionada, por lo que la mayoria de celdas quedan como "no disponible".

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ministral 3 8B Instruct 2512 (GGUF) | 8,49B | 256k | Si (encoder 0,4B) | Apache 2.0 | HuggingFace (GGUF) |
| Otros modelos de la familia Ministral 3 | No disponible | No disponible | No disponible | No disponible | No disponible |
| Alternativas equivalentes de terceros | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible; como todo modelo entrenado con datos a gran escala, puede reflejar sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinacion: no se cuantifica en la informacion disponible; se recomienda validar las salidas en usos criticos.
- El aviso de la model card indica que el modelo no debe usarse de forma que infrinja, se apropie indebidamente o vulnere derechos de terceros, incluidos los de propiedad intelectual.
- Rendimiento multimodal sensible a la forma de la imagen: se recomienda mantener relaciones de aspecto cercanas a 1:1 y recortar imagenes excesivamente alargadas o estrechas.
- Comportamiento agentico dependiente de la configuracion: un numero excesivo de herramientas puede degradar el rendimiento, por lo que conviene limitarlas.
- Temperatura recomendada baja (por debajo de 0,1) para uso diario y produccion; temperaturas mas altas pueden aumentar la variabilidad y no se recomiendan para entornos deterministas.
- Parametros de sampling, contexto e idioma: aunque se declaran once idiomas, no se detalla la calidad relativa por idioma.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero se deben respetar las condiciones de la licencia y la clausula sobre derechos de terceros.

## Enlaces

- HuggingFace (este repositorio GGUF): https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512-GGUF
- Modelo base: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512
- Paper: https://arxiv.org/abs/2601.08584
- Blog de Mistral sobre la familia Mistral 3: https://mistral.ai/news/mistral-3
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0.txt
- Politica de privacidad de Mistral: https://mistral.ai/terms/
- Web de Mistral AI: https://mistral.ai/
