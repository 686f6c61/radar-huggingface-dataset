# NarsAI/Aion-1.0-Instruct-2.3B

## Resumen

Aion-1.0-Instruct-2.3B es un modelo de lenguaje de pequeno tamano (SLM) desarrollado por el Applied Sciences Group de Microsoft Windows & Devices. Se presenta como el modelo fundacional de la familia Aion dentro del ecosistema Windows, disenado especificamente para IA en dispositivo (on-device), comprension de texto y casos de uso integrados en el sistema operativo. Con 2.288.831.488 parametros, busca ofrecer capacidades de comprension y generacion de lenguaje de nivel empresarial directamente en el borde, sin dependencia constante de la nube.

El modelo se distribuye bajo licencia MIT y soporta ocho idiomas: ingles, aleman, espanol, portugues, italiano, frances, chino y japones. Su ventana de contexto alcanza los 32K tokens, lo que le permite procesar documentos de varias paginas, hilos de correo extensos o especificaciones tecnicas complejas completamente en local, manteniendo la privacidad de los datos del usuario. Esta primera publicacion en Hugging Face corresponde a la version sin cuantizar, a la que seguiran versiones cuantizadas.

La relevancia de Aion-1.0-Instruct radica en su posicion como pieza clave de la estrategia de Microsoft para llevar IA generativa al sistema operativo Windows. Una version optimizada de este modelo, junto con un modelo de moderacion de contenido de Microsoft, se convertira en el SLM del sistema operativo Windows a finales de enero de 2027. Esta publicacion busca maximizar la transparencia con los usuarios y recabar retroalimentacion antes de su disponibilidad general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only, segun tags de transformers y pipeline text-generation); detalles especificos no disponibles |
| Parametros totales | 2.288.831.488 (2,3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32K tokens |
| Tipos de cuantizacion | No disponible (el autor indica que se publicaran versiones cuantizadas posteriormente) |
| Idiomas soportados | Ingles, aleman, espanol, portugues, italiano, frances, chino, japones |
| Licencia | MIT |
| Formato de pesos | Safetensors (repo de 4,6 GB); el autor menciona soporte para PyTorch, ONNX y GGUF |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que se trata de un modelo de generacion de texto compatible con transformers y que requiere `custom_code`. El modelo card lo describe como un transformer de 2,3B parametros orientado a inferencia en dispositivo. No se especifican innovaciones tecnicas como atencion lineal, decodificacion especulativa o arquitecturas hibridas.

Los datos de entrenamiento son una extension de los utilizados para Phi Silica, el SLM anterior del sistema operativo Windows. Incluyen documentos publicos filtrados rigurosamente por calidad y datos sinteticos creados para ensenar matematicas, programacion, razonamiento de sentido comun y conocimiento general del mundo (ciencia, actividades diarias, teoria de la mente, etc.). Los datos multilingues constituyen aproximadamente el 6% del total. El autor indica que se realizo alineacion de seguridad, aunque no se especifican detalles sobre RLHF o DPO. Los benchmarks se ejecutaron con EleutherAI's lm-evaluation-harness.

## Capacidades

- Generacion de texto general: comprension de documentos, analisis de contenido, respuesta a preguntas y comprension del lenguaje natural.
- Resumen (summarization): sintesis de documentos largos y conversaciones.
- Reescritura (rewriting): reformulacion de texto con distintos estilos o niveles de detalle.
- Chat conversacional: interaccion multi-turno con contexto de hasta 32K tokens.
- Procesamiento de documentos largos: multiples paginas, hilos de correo extensos y especificaciones tecnicas.
- Capacidades multilingues en ocho idiomas (en, de, es, pt, it, fr, zh, ja), con calidad variable segun el idioma.
- Razonamiento basico y conocimiento general, aunque el autor advierte que el modelo no fue entrenado para destacar en conocimiento del mundo.
- No se menciona soporte explicito de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Resumen de documentos en local: el modelo puede procesar documentos de varias paginas gracias a su contexto de 32K tokens y generar resumenes sin enviar datos a la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Asistente de correo electronico: sintesis de hilos de correo extensos y generacion de respuestas o reescrituras, aprovechando la ventana de contexto para mantener el hilo completo.
- Chat de atencion al cliente en dispositivo: conversaciones multi-turno con contexto largo, adecuado para escenarios donde la latencia y la privacidad son criticas.
- Analisis de especificaciones tecnicas: comprension y extraccion de informacion de documentacion tecnica compleja directamente en el dispositivo del usuario.
- Reescribura de contenido: adaptacion de textos a distintos tonos o niveles de formalidad en aplicaciones de edicion y productividad.
- Procesamiento multilingue en el borde: tareas de comprension y generacion en los ocho idiomas soportados para aplicaciones de escritorio con usuarios internacionales.
- Integracion en el ecosistema Windows: base para funcionalidades de IA integradas en el sistema operativo, con despliegue previsto como SLM de Windows a finales de enero de 2027.

## Benchmarks y rendimiento

El model card menciona que los benchmarks se ejecutaron con EleutherAI's lm-evaluation-harness, pero no se proporcionan resultados numericos en la informacion disponible. Se mencionan las metricas de seguridad XPIA, DIC y ECI como areas clave a mejorar en futuras versiones, con graficos referenciados pero sin valores numericos accesibles.

No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para un modelo de 2,3B parametros en precision FP16 se requieren aproximadamente 4,6 GB solo para los pesos; en cuantizacion de 8 bits unos 2,3 GB y en 4 bits unos 1,2 GB, aunque estas cifras son estimaciones genericas no confirmadas por el autor.
- GPU recomendadas: no especificadas por el autor. Por tamano, el modelo es apto para GPUs de consumo como RTX 3060, RTX 4060, RTX 4070 o superiores en FP16, y para GPUs profesionales como A100 o H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: si, previsiblemente en la mayoria de GPUs consumer modernas con 8 GB o mas de VRAM en FP16, y en GPUs con 4-6 GB en cuantizaciones de 4-8 bits (estimacion no confirmada).
- Opciones de despliegue: transformers (libreria indicada), y el autor menciona soporte para PyTorch, ONNX y GGUF, lo que habilita llama.cpp y potencialmente Ollama. No se confirma soporte de vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos en la informacion proporcionada. La comparativa se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Aion-1.0-Instruct-2.3B | 2,3B | 32K | MIT | 8 | SLM de Microsoft para Windows, on-device |
| Phi Silica (generacion anterior) | No disponible | No disponible | No disponible | No disponible | SLM previo de Windows; Aion extiende sus datos de entrenamiento |
| Alternativas de 2-3B | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos verificados |

## Limitaciones y advertencias

- Al ser un modelo de 2,3B parametros, puede perder detalles finos, producir afirmaciones incorrectas y mostrar incapacidad para seguir razonamientos multi-paso complejos en comparacion con LLMs de mayor tamano.
- El autor advierte que el modelo no fue entrenado para destacar en conocimiento del mundo; no debe usarse como fuente fiable de hechos.
- Riesgo de alucinacion inherente a los SLM, especialmente en tareas que requieren conocimiento factual o razonamiento profundo.
- Puede ser susceptible a ataques adversariales; la alineacion de seguridad no cubre todas las sutilezas, incluidos intentos de inducir comportamiento inseguro.
- La calidad de salida puede variar segun el idioma, ya que los datos multilingues representan solo el 6% del total.
- Usos prohibidos segun el autor: generacion de contenido danino, violento, explicito u ofensivo; creacion de contenido enganoso como noticias falsas o desinformacion; toma de decisiones automatizada en contextos criticos como diagnosticos medicos o juicios legales.
- Licencia MIT: permite uso comercial, pero el autor recomienda evaluar y mitigar riesgos de precision, seguridad y equidad antes de usar en escenarios de alto riesgo.
- El modelo requiere `custom_code` en transformers, lo que puede complicar su integracion en algunos pipelines.
- No se han publicado resultados numericos de benchmarks ni de seguridad, lo que limita la evaluacion objetiva de su rendimiento.

## Enlaces

- Hugging Face: https://huggingface.co/NarsAI/Aion-1.0-Instruct-2.3B
- Repositorio GitHub de ejemplo: https://github.com/microsoft/Aion-Instruct-Preview-Sample/
- Licencia (referenciada en el model card): https://huggingface.co/microsoft/Aion-1.0-Instruct-2.3B/blob/main/LICENSE
