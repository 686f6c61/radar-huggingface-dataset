# microsoft/Aion-1.0-Instruct-2.3B

## Resumen

Aion-1.0-Instruct-2.3B es un modelo de lenguaje pequeno (SLM) desarrollado por el Applied Sciences Group de Microsoft Windows & Devices. Se posiciona como el modelo fundacional del ecosistema Windows para IA en dispositivo (on-device), orientado a casos de uso de texto y de sistema operativo. Con 2.288.831.488 parametros (2,3B) y una ventana de contexto de 32K tokens, el modelo busca ofrecer comprension y generacion de lenguaje "de grado empresarial" directamente en el borde, sin dependencia constante de la nube.

El modelo se publica como antesala de la version que, junto con un modelo de moderacion de contenido de Microsoft, se convertira en el SLM del sistema operativo Windows a finales de enero de 2027. Esta version de Hugging Face es una introduccion con fines de transparencia y retroalimentacion; se publica primero sin cuantizar, con versiones cuantizadas previstas mas adelante.

Su relevancia actual radica en la tendencia hacia SLM ejecutables localmente: privacidad de datos, latencia baja y coste reducido. Aion Instruct hereda y amplia los datos de entrenamiento de Phi Silica, el SLM de la generacion anterior de Windows, e incorpora datos sinteticos para matematicas, codigo y razonamiento. La licencia MIT facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de tipo SLM; la model card no detalla la arquitectura interna) |
| Parametros totales | 2.288.831.488 (2,3B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 32K tokens |
| Tipos de cuantizacion | no disponible en esta publicacion (se anuncia que habra versiones cuantizadas; la model card menciona soporte de PyTorch, ONNX y GGUF) |
| Idiomas soportados | ingles, aleman, espanol, portugues, italiano, frances, chino y japones |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 4,6 GB); la model card indica tambien ONNX y GGUF como librerias soportadas |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna (tipo de transformer, atencion, capas, dimensiones ocultas ni si emplea tecnicas como atencion lineal o decodificacion especulativa). Lo que si se documenta es que Aion Instruct es un modelo de 2,3B parametros optimizado para inferencia en dispositivo y con una ventana de contexto de 32K tokens, pensado para procesar documentos de varias paginas, hilos de correo largos y especificaciones tecnicas complejas localmente.

En cuanto a los datos, el entrenamiento es una extension del corpus usado para Phi Silica (el SLM previo de Windows) e incluye documentos publicos filtrados rigurosamente por calidad y datos sinteticos creados para ensenar matematicas, codigo, razonamiento de sentido comun y conocimiento general del mundo. Los datos multilingues constituyen aproximadamente el 6% del total. La model card menciona que se realizo alineamiento de seguridad, aunque no detalla si se emplearon tecnicas concretas de RLHF o DPO. Tampoco se indica el numero total de tokens de entrenamiento.

## Capacidades

- Generacion de texto general: comprension de documentos, analisis de contenido, respuesta a preguntas y comprension del lenguaje natural.
- Resumen (summarization) y reescritura (rewriting), ambos declarados como tags principales del modelo.
- Conversacion multi-turno (chat) con contexto de hasta 32K tokens.
- Razonamiento basico y matematicas, reforzados mediante datos sinteticos de entrenamiento.
- Capacidades de codigo, tambien apoyadas por datos sinteticos.
- Soporte multilingue en ocho idiomas: ingles, aleman, espanol, portugues, italiano, frances, chino y japones.
- Ejecucion en dispositivo (on-device) con formatos PyTorch, ONNX y GGUF, orientada a privacidad y baja latencia.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling, uso de agentes ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Resumen de documentos largos en local: el modelo puede resumir contratos, informes o articulos de varias paginas aprovechando su ventana de 32K tokens, sin enviar el contenido a la nube y preservando la privacidad del usuario.
- Reescritura y mejora de textos: util para corregir estilo, tono o claridad en correos, documentacion tecnica o textos de interfaz, gracias a su entrenamiento especifico en rewriting.
- Asistente de chat integrado en el sistema operativo: conversaciones multi-turno con contexto largo para tareas de productividad, busqueda de informacion en documentos locales y ayuda contextual dentro de Windows.
- Analisis de hilos de correo extensos: sintesis de conversaciones de correo con muchas respuestas, extrayendo decisiones, tareas pendientes y puntos clave en el dispositivo.
- Procesamiento de especificaciones tecnicas: lectura y extraccion de datos de manuales o especificaciones de ingenieria, un escenario citado explicitamente en la model card.
- Atencion al cliente o asistencia en local: respuestas a preguntas frecuentes y comprension de consultas en ocho idiomas, con despliegue en el borde para reducir costes de inferencia en la nube.
- Generacion de codigo ligera y asistencia en matematicas basicas: apoyo a tareas de programacion y calculo en entornos con recursos limitados, aunque con las limitaciones propias de un modelo de 2,3B.

## Benchmarks y rendimiento

La model card indica que todas las evaluaciones se ejecutaron con EleutherAI's lm-evaluation-harness, pero el contenido proporcionado se interrumpe antes de mostrar la tabla de resultados. Ademas, la model card incluye una grafica de seguridad (XPIA, DIC y ECI) sin valores numericos en el texto disponible.

No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano (2,3B parametros), en FP16 se requeririan aproximadamente 4,6 GB solo para pesos; en cuantizacion de 8 bits, unos 2,3 GB; en 4 bits, alrededor de 1,2-1,5 GB, mas el overhead de contexto KV (que crece con los 32K tokens de ventana).
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano, el modelo es apto para GPUs de consumo como RTX 3060/4060 en adelante con cuantizacion, y para GPUs de datacenter (A100, H100) si se busca mayor throughput.
- Cabe en GPU de consumo: si, previsiblemente en la mayoria de GPUs con 6-8 GB o mas de VRAM, especialmente con cuantizacion; no confirmado oficialmente.
- Opciones de despliegue: la model card menciona PyTorch, ONNX y GGUF como librerias soportadas, lo que habilita transformers, ONNX Runtime y llama.cpp/Ollama para GGUF. vLLM y TGI no se mencionan explicitamente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Aion-1.0-Instruct-2.3B | 2,3B | 32K | MIT | SLM de Microsoft para on-device en Windows; 8 idiomas |
| Phi Silica (generacion previa) | no disponible | no disponible | no disponible | SLM anterior de Windows; base de los datos de entrenamiento de Aion |
| Otros SLM de ~2-3B | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos alternativos en la informacion proporcionada para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Modelo pequeno (2,3B): puede perder detalles finos, producir afirmaciones incorrectas y mostrar dificultad para seguir razonamientos multi-paso complejos, en comparacion con LLM de mayor tamano.
- Conocimiento del mundo limitado: la model card advierte explicitamente que el modelo no fue entrenado para destacar en conocimiento general del mundo.
- Alucinacion: riesgo inherente a los SLM; la menor capacidad de almacenar hechos aumenta la probabilidad de errores factuales.
- Seguridad: aunque se realizo alineamiento de seguridad, el modelo carece del razonamiento complejo para comprender todos los matices de seguridad y puede ser susceptible a ataques adversarios. Las metricas XPIA, DIC y ECI se identifican como areas a mejorar en futuras versiones.
- Diferencias por idioma: la calidad de salida puede variar segun el idioma, ya que los datos multilingues son solo el 6% del corpus y Microsoft sigue trabajando en cerrar brechas entre lenguas.
- Restricciones de uso: no debe usarse para generar contenido danino, violento, explicito u ofensivo, ni para crear desinformacion, ni para toma de decisiones automatizada en contextos criticos como diagnosticos medicos o juicios legales.
- Licencia MIT: permite uso comercial, pero la model card recomienda evaluar y mitigar precision, seguridad y equidad antes de usos de alto riesgo, y respetar la legislacion aplicable (privacidad, cumplimiento comercial).
- Version no definitiva: esta publicacion es una introduccion; la version que se integrara en Windows (con moderacion de contenido) llegara a finales de enero de 2027.

## Enlaces

- Hugging Face: https://huggingface.co/microsoft/Aion-1.0-Instruct-2.3B
- Licencia: https://huggingface.co/microsoft/Aion-1.0-Instruct-2.3B/blob/main/LICENSE
- Repositorio GitHub de ejemplo: https://github.com/microsoft/Aion-Instruct-Preview-Sample/
- EleutherAI lm-evaluation-harness (mencionado en la model card): https://github.com/EleutherAI/lm-evaluation-harness
