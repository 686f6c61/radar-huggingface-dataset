# kokabtak/kokb1-space-files

## Resumen
kokb1 es un Space de Gradio publicado por la organización kokabtak (Irán) que se presenta como la primera versión de su serie de modelos de inteligencia artificial en persa. El repositorio `kokabtak/kokb1-space-files` no contiene pesos de modelo: es el código y los ficheros de una aplicación de demostración que, según su model card, se apoya en los Inference Providers de Hugging Face para servir las respuestas. La ficha de Hugging Face lo clasifica con las etiquetas `persian`, `farsi`, `chatbot`, `deepseek`, `gradio` y `license:mit`, y registra 0 descargas y 0 "likes".

El autor declara que el sistema está "impulsado por DeepSeek-V4.1-Flash", al que atribuye 552.000 millones de parámetros, arquitectura MoE, ventana de contexto de 1.000.000 de tokens y capacidad multilingüe en persa, inglés y chino, además de herramientas de búsqueda web, traducción, resumen, generación de código e investigación. Ninguno de estos datos técnicos viene acompañado de documentación verificable, tarjeta de modelo con hiperparámetros, informe de entrenamiento ni resultados de evaluación en la información disponible.

La relevancia del proyecto es, por tanto, la de una demo de chatbot en persa de acceso gratuito a través de una interfaz Gradio, no la de un modelo abierto reutilizable: no se publican pesos, no hay arquitectura documentada y las cifras declaradas (base "DeepSeek-V4.1-Flash", contexto de 1M tokens) no se corresponden con ningún modelo publicado identificable en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts), según la model card; no se detalla configuración de capas, expertos ni atención |
| Parámetros totales | 552.000 millones, según la model card (atribuidos al modelo base declarado "DeepSeek-V4.1-Flash") |
| Parámetros activos | no disponible |
| Longitud de contexto | 1.000.000 de tokens, según la model card |
| Tipos de cuantización | no disponible (no se publican pesos) |
| Idiomas soportados | persa (farsi), inglés y chino, según la model card; el metadato de Hugging Face indica "no disponibles" |
| Licencia | MIT (etiqueta del repositorio y de la model card) |
| Formato de pesos | no disponible; el repositorio es un Space de Gradio (`sdk: gradio`) sin ficheros de pesos publicados |

## Arquitectura y entrenamiento
La información disponible no describe la arquitectura interna del modelo: la model card se limita a indicar que emplea una arquitectura MoE y que "está impulsada por DeepSeek-V4.1-Flash (552.000 millones de parámetros)". No se especifica número de capas, número de expertos, expertos activos por token, tipo de atención, estrategia de enrutamiento ni si se trata de un modelo destilado, ajustado o meramente enrutado hacia un proveedor de inferencia externo. Tampoco se indica qué parte del sistema es propia de kokabtak y qué parte corresponde al proveedor de inferencia.

No hay datos sobre el corpus de entrenamiento: no se indica número de tokens, composición del dataset, proporción de persa frente a inglés y chino, ni si hubo fases de ajuste supervisado, RLHF, DPO u otro método de alineamiento. No se documentan innovaciones técnicas verificables (decodificación especulativa, atención lineal, cuantización propia, etc.). En la interfaz se menciona que el usuario puede ajustar el "modelo de inferencia" y el "esfuerzo de razonamiento" desde un panel de configuración, lo que sugiere que el razonamiento extendido depende de los parámetros expuestos por el proveedor de inferencia y no de una implementación propia documentada.

## Capacidades
Según la model card del autor, el sistema declara las siguientes capacidades. No se han podido verificar de forma independiente:

- Conversación multiturno en persa, inglés y chino, con una ventana de contexto declarada de 1.000.000 de tokens.
- Búsqueda web: localización y análisis de sitios web a partir de una consulta del usuario.
- Traducción y resumen: traducción entre los tres idiomas declarados y resumen de documentos extensos.
- Generación de código en varios lenguajes de programación.
- Investigación y análisis de datos, incluyendo "narrativa de datos" (data storytelling).
- Parámetros de control expuestos en la interfaz: selección del modelo de inferencia y del nivel de esfuerzo de razonamiento.
- Modo "sin restricciones políticas", según declara explícitamente el autor.
- No se documenta soporte de tool calling o function calling conforme a un esquema formal, ni capacidades de agente multi-paso, visión, audio o modo de pensamiento estructurado.

## Casos de uso
- Prototipado rápido de chatbot en persa: la demo Gradio permite validar en minutos un flujo conversacional en farsi sin infraestructura propia, usando los Inference Providers de Hugging Face como backend gratuito. Es adecuado para equipos que quieran evaluar la viabilidad de un asistente en persa antes de invertir en despliegue propio.
- Traducción persa-inglés-chino de documentación técnica: se puede usar como traductor de apoyo para manuales, fichas de producto o correos, con revisión humana obligatoria dado que no hay métricas de calidad publicadas (BLEU, COMET ni evaluaciones humanas).
- Resumen de documentos extensos: el contexto declarado de 1M tokens permitiría, en teoría, resumir informes o expedientes completos en una sola pasada; conviene verificar experimentalmente el rendimiento real en contextos largos antes de usarlo en producción.
- Generación de fragmentos de código para desarrolladores persohablantes: útil como asistente de autocompletado o de generación de funciones en tareas acotadas, siempre con revisión y pruebas automatizadas, dado que no existen resultados de HumanEval, MBPP ni SWE-bench publicados.
- Demostración educativa de IA en persa: apropiado para talleres, cursos universitarios o charlas divulgativas en las que se necesite un chatbot funcional en farsi accesible desde el navegador sin claves de API propias.
- Asistente de investigación con búsqueda web para consultas puntuales: puede emplearse para recopilar y resumir fuentes web sobre un tema concreto, con verificación manual de las citas por el riesgo de alucinación de URL y referencias.
- Soporte de primera línea en persa: como capa inicial de atención al cliente que clasifique y responda consultas frecuentes, derivando a agentes humanos cuando corresponda; requiere filtros de contenido propios, ya que el autor declara ausencia de restricciones políticas y no se describen políticas de moderación.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, MATH, MT-Bench ni de evaluaciones específicas en persa, y los resultados de la búsqueda web no aportan documentación técnica sobre el modelo.

## Requisitos de hardware
- No hay pesos publicados, por lo que no existe una ruta de despliegue local documentada. El uso previsto es a través del Space de Gradio y de Hugging Face Inference Providers.
- Estimación aritmética a partir del tamaño declarado (552.000 millones de parámetros), solo válida si se publicaran pesos completos: BF16 ≈ 1.104 GB, FP8 ≈ 552 GB, cuantización de 4 bits ≈ 276 GB, cuantización de 2 bits ≈ 138 GB, más la caché KV correspondiente al contexto utilizado.
- Con esas cifras, la inferencia requeriría nodos multi-GPU: en FP8 harían falta al menos 8 GPU de 80 GB (640 GB útiles) y en BF16 alrededor de 14 GPU de 80 GB, sin margen para caché KV extensa.
- GPU recomendadas para un despliegue de ese tamaño: H100 80 GB, H200 141 GB o A100 80 GB en configuraciones multi-nodo con paralelismo de tensor y de expertos.
- No cabe en GPU de consumo: una RTX 4090 (24 GB) no puede alojar el modelo ni siquiera en cuantizaciones agresivas de 2 bits, según la estimación anterior.
- Opciones de despliegue si se publicaran pesos: vLLM, SGLang o TGI para servicio en clúster; llama.cpp requeriría cuantizaciones GGUF muy agresivas y almacenamiento en disco/RAM muy superior a lo habitual en equipos de sobremesa.
- Latencia y throughput estimados: no disponible. Dependen del número de parámetros activos, dato que no se ha publicado, y del proveedor de inferencia en el caso del Space.

## Comparativa con modelos similares
Los datos de los modelos comparados provienen de su documentación pública y deben verificarse en sus repositorios oficiales; no forman parte de la información proporcionada sobre kokb1.

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kokb1 (kokabtak) | MoE (declarada) | 552.000 M (declarados) | 1.000.000 tokens (declarados) | MIT | Solo demo en Gradio; sin pesos publicados |
| DeepSeek-V3 | MoE | 671.000 M totales / 37.000 M activos | 128.000 tokens | Licencia propia de DeepSeek (uso comercial con condiciones) | Pesos safetensors en Hugging Face |
| Llama 3.3 70B Instruct | Transformer denso | 70.000 M | 128.000 tokens | Llama 3.3 Community License | Pesos safetensors en Hugging Face |

La comparación directa de rendimiento no es posible: no existen benchmarks publicados de kokb1, ni parámetros activos declarados, ni pesos que permitan reproducir evaluaciones. DeepSeek-V3 y Llama 3.3 70B cuentan con documentación técnica, informes de evaluación y comunidades de despliegue consolidadas de las que kokb1 carece.

## Limitaciones y advertencias
- Ausencia total de documentación técnica verificable: no hay informe de entrenamiento, configuración de arquitectura, número de parámetros activos ni ficha de evaluación. Las cifras de 552.000 millones de parámetros y 1M de contexto son declaraciones del autor sin respaldo en la información disponible.
- La base declarada, "DeepSeek-V4.1-Flash", no corresponde a ningún modelo identificable en la información proporcionada; conviene tratar esa atribución como no verificada.
- Es un Space, no un repositorio de modelo: no se publican pesos en safetensors, GGUF ni ningún otro formato, lo que impide auditoría, ajuste fino o despliegue propio.
- Riesgo elevado de alucinación no cuantificado: sin benchmarks ni evaluaciones de fidelidad, no hay base para estimar la tasa de error en generación factual, traducción o código.
- La model card afirma que el modelo está diseñado "sin restricciones políticas", lo que implica ausencia de salvaguardas declaradas y traslada al integrador toda la responsabilidad de moderación, filtrado y cumplimiento normativo.
- Idiomas: el alcance real fuera del persa, el inglés y el chino es desconocido; no se documenta el rendimiento en castellano ni en otras lenguas.
- Licencia MIT declarada en el repositorio, lo que en principio permite uso comercial del código del Space; sin embargo, si el sistema dependiera realmente de un modelo base de terceros, las condiciones de ese modelo base podrían imponer restricciones adicionales sobre los pesos y sobre el uso comercial.
- Metadatos inconsistentes: la fecha de creación registrada (2026-09-11) y los campos de idiomas vacíos en los metadatos de Hugging Face frente a los tres idiomas declarados en la model card aconsejan verificar la información antes de citarla.
- Repositorio sin tracción: 0 descargas y 0 "likes", sin historial de mantenimiento ni issues públicos que permitan evaluar la continuidad del proyecto.
- Los resultados de la búsqueda web realizada no contienen ninguna fuente técnica sobre este modelo (devuelven documentación de herramientas de recorte de ArcGIS), por lo que no hay confirmación externa de sus capacidades.
- Para producción en atención al cliente o generación de código se recomienda tratar las salidas como borradores sujetos a revisión humana, hasta que existan métricas reproducibles.

## Enlaces
- Repositorio del Space en Hugging Face: https://huggingface.co/kokabtak/kokb1-space-files
- Organización del autor en Hugging Face: https://huggingface.co/kokabtak
- Correo de contacto indicado en la model card: kokbtak@gmail.com
- No se han encontrado en la búsqueda web papers, blogs técnicos, repositorios de código ni demos adicionales asociados a este modelo.
