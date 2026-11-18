# ibm-granite/granite-4.2-8b

## Resumen

Granite-4.2-8B es un modelo de lenguaje de tipo decoder-only denso desarrollado por el equipo Granite de IBM, presentado el 25 de agosto de 2026 como la variante de tamano medio de la familia Granite 4.2. Con 8.791.592.960 parametros en bfloat16, se construye sobre el modelo base Granite-4.1-8B-Base mediante un proceso de ajuste orientado a razonamiento, conversacion y uso de herramientas. Su principal novedad frente a la generacion anterior es la incorporacion nativa de un modo de razonamiento explicito delimitado por las etiquetas `<think>...</think>`, que permite al modelo generar cadenas de pensamiento antes de emitir la respuesta final.

El modelo resuelve el problema de equilibrar profundidad de razonamiento y latencia en despliegues empresariales: ofrece tres modos de pensamiento (completo, sin pensamiento y de bajo esfuerzo) seleccionables por consulta, de modo que una misma instancia puede atender desde tareas triviales de clasificacion hasta problemas de matematicas o codigo de multiples pasos. Soporta de forma nativa una longitud de contexto de 128K tokens, ampliable a 512K mediante extension de contexto largo, y esta entrenado y probado en doce idiomas, entre ellos el castellano.

Es relevante ahora porque combina una licencia Apache 2.0 sin restricciones para uso comercial con capacidades que hasta hace poco eran exclusivas de modelos propietarios: razonamiento encadenado, tool calling aumentado con razonamiento y ventanas de contexto muy largas. Su tamano de 8B lo situa en el rango desplegable en una unica GPU de gama alta o en configuraciones cuantizadas sobre hardware de consumo, lo que lo convierte en una opcion atractiva para equipos que necesitan un modelo abierto con garantias juridicas de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (GraniteForCausalLM) |
| Parametros totales | 8.791.592.960 (8B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128K nativo, extension a 512K |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en bfloat16) |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

Granite-4.2-8B emplea una arquitectura transformer decoder-only densa con los siguientes componentes: atencion con Grouped Query Attention (GQA) de 32 cabezas de atencion y 8 cabezas KV, embedding de posicion rotatorio (RoPE) con theta de 10.000.000, feed-forward MLP con activacion SwiGLU y tamano oculto de 12.800, normalizacion RMSNorm con epsilon de 1e-5, y embeddings de entrada y salida separados (no atados). El modelo tiene 40 capas, un tamano de embedding de 4096 y un tamano de cabeza de atencion de 128. Los pesos se distribuyen en bfloat16.

El modelo parte de Granite-4.1-8B-Base y se ajusta para incorporar razonamiento nativo, conversacion multilingue y tool calling. La model card confirma que el ajuste introduce un modo de razonamiento con etiquetas `<think>...</think>` y modos alternativos de pensamiento (completo, sin pensamiento y bajo esfuerzo), pero no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; esos datos figuran como no disponibles en la informacion proporcionada. La innovacion tecnica destacable es la razonabilidad del tool calling: el modelo razona sobre que herramienta invocar y por que antes de emitir la llamada a funcion, lo que segun el autor mejora la precision de las invocaciones.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 128K tokens (512K con extension).
- Razonamiento explicito mediante cadena de pensamiento nativa en etiquetas `<think>...</think>`.
- Tres modos de pensamiento seleccionables: completo (por defecto), sin pensamiento y de bajo esfuerzo, para ajustar profundidad frente a latencia.
- Generacion de codigo y resolucion de problemas matematicos de multiples pasos.
- Tool calling y function calling aumentados con razonamiento previo sobre la eleccion de herramientas.
- Flujos agenticos y razonamiento multi-paso.
- Capacidades multilingues en doce idiomas: ingles, aleman, espanol, frances, japones, portugues, arabe, checo, italiano, coreano, neerlandes y chino.
- No se menciona soporte de vision ni de audio en la informacion disponible.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno con historial extenso gracias a su ventana de 128K tokens, y el modo de bajo esfuerzo permite responder consultas simples con baja latencia mientras reserva el razonamiento completo para incidencias complejas.
- Generacion de codigo en produccion: con tool calling aumentado con razonamiento, puede integrarse en pipelines de CI/CD para invocar linters, ejecutar tests o consultar documentacion de API antes de proponer un parche, reduciendo llamadas erroneas a herramientas.
- Agentes autonomos de investigacion: la combinacion de razonamiento multi-paso, contexto largo y function calling permite construir agentes que planifican, consultan fuentes externas y sintetizan resultados en una sola sesion sin perder el hilo.
- Analisis de documentos extensos: informes financieros, contratos o expedientes de cientos de paginas caben en la ventana de 128K (o 512K con extension), lo que permite resumir, extraer clausulas o responder preguntas sobre el documento completo sin fragmentacion.
- Asistencia matematica y tutorizacion: el modo de pensamiento completo genera cadenas de razonamiento paso a paso utiles para explicar la resolucion de problemas, y el modo sin pensamiento sirve para respuestas directas en entornos de examen o consulta rapida.
- Soporte multilingue en empresas europeas: al cubrir castellano, aleman, frances, italiano, neerlandes, checo y portugues, un unico despliegue puede atender mercados de la UE sin necesidad de modelos especificos por idioma.
- Clasificacion y extraccion de datos estructurados: en modo sin pensamiento ofrece respuestas rapidas y deterministas para tareas de etiquetado, extraccion de entidades o enrutamiento de tickets, donde el razonamiento extendido no aporta valor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 17,6 GB solo para los pesos (tamano del repositorio), mas overhead de cache KV; se recomienda un minimo de 24 GB para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: en torno a 9-10 GB para pesos; en 4 bits, en torno a 5-6 GB, aunque los tipos de cuantizacion oficiales no se detallan en la informacion disponible.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para bfloat16 con contexto largo; RTX 4090 (24 GB) para bfloat16 con contexto moderado o cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090 con bfloat16 y contexto limitado, y en GPUs de 16-24 GB con cuantizacion.
- Opciones de despliegue: transformers (soporte nativo declarado), vLLM, llama.cpp, Ollama y TGI como opciones habituales para modelos de este formato; la model card solo confirma compatibilidad con transformers y endpoints.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Granite-4.2-8B | 8,79B denso | 128K (512K ext.) | Apache 2.0 | Razonamiento nativo con modos seleccionables y tool calling aumentado |
| Granite-4.1-8B-Base | 8B denso | no disponible | Apache 2.0 | Modelo base del que deriva; sin modo de razonamiento nativo declarado |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Sesgos conocidos: no se detallan en la informacion proporcionada; como todo modelo entrenado con datos web a gran escala, es previsible que reproduzca sesgos presentes en esos datos.
- Riesgo de alucinacion: no se cuantifica en la model card; el modo de razonamiento explicito no elimina la posibilidad de generar afirmaciones incorrectas con apariencia de solidez.
- Limitaciones de contexto: la ventana nativa es de 128K tokens; la extension a 512K requiere tecnicas adicionales cuyo comportamiento no se detalla, por lo que el rendimiento en contextos muy largos debe validarse empiricamente.
- Limitaciones de idioma: solo doce idiomas estan plenamente probados; otros idiomas pueden funcionar pero sin garantias de calidad.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero el usuario sigue siendo responsable del cumplimiento normativo aplicable (por ejemplo, proteccion de datos).
- Caveat para produccion: los modos de pensamiento anaden latencia y tokens de salida; en entornos de alto throughput conviene medir el coste del modo completo frente al de bajo esfuerzo. No se han publicado datos de benchmarks ni de rendimiento en produccion en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ibm-granite/granite-4.2-8b
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-8b-base
- Coleccion Granite 4.2 Language Models: https://huggingface.co/collections/ibm-granite/granite-42-language-models
- Blog tecnico: https://huggingface.co/blog/ibm-granite/granite-4-2
- Repositorio GitHub: https://github.com/ibm-granite/granite-4.2-language-models
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
