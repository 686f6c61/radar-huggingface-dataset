# ReadyArt/Dark-Scarlett-27B-v2.0-GGUF

## Resumen

Dark-Scarlett-27B-v2.0 es un modelo de lenguaje de gran tamano (27B parametros) desarrollado por ReadyArt, especializado en roleplay, conversacion y generacion de contenido explicito. Se distribuye en formato GGUF cuantizado, lo que permite su ejecucion en hardware de consumo y su integracion con herramientas como llama.cpp, Ollama o SillyTavern. El modelo se presenta como "unaligned" y "dangerous", lo que indica que no ha sido sometido a los procesos de alineacion habituales y puede generar contenido que otros modelos rechazarian.

Esta version v2.0 es una actualizacion del modelo original Dark-Scarlett, y su principal atractivo reside en su capacidad para mantener conversaciones de roleplay prolongadas y coherentes, con un enfoque en la interaccion sin censura. El repositorio GGUF contiene 323.8 GB de archivos cuantizados en diferentes precisiones, lo que permite a los usuarios elegir el equilibrio entre calidad y requisitos de hardware. La licencia declarada es Apache 2.0, aunque la etiqueta "Other License" sugiere posibles restricciones adicionales no documentadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta "qwen3_5" sugiere base Qwen, sin confirmar) |
| Parametros totales | 27.320.697.856 (27B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repositorio GGUF con multiples archivos, 323.8 GB) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con etiqueta adicional "Other License") |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna del modelo. La etiqueta "qwen3_5" en el repositorio de safetensors sugiere que podria estar basado en la familia Qwen 3.5, pero no hay documentacion oficial que lo confirme. Tampoco se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens procesados o las tecnicas de ajuste empleadas (RLHF, DPO, etc.). El modelo se describe como "instruct" y "conversational", lo que indica que ha sido afinado para seguir instrucciones y mantener dialogos, pero el proceso exacto de entrenamiento no esta documentado.

La caracteristica mas distintiva es su naturaleza "unaligned" y "dangerous": el modelo no ha sido entrenado para rechazar peticiones de contenido explicito, violento o ilegal. Esto implica que el entrenamiento se ha centrado en la capacidad de generacion libre, sin los filtros de seguridad habituales en modelos comerciales.

## Capacidades

- Generacion de texto libre sin filtros de contenido, incluyendo material explicito, violento o ilegal.
- Roleplay conversacional multi-turno con mantenimiento de personaje y contexto.
- Sigue instrucciones de forma general (modelo "instruct").
- Capacidad de interaccion conversacional prolongada, adecuada para sesiones de ERP (erotic roleplay).
- Integracion con endpoints compatibles (etiqueta "endpoints_compatible"), lo que permite su despliegue como servicio.
- Compatible con herramientas de frontend como SillyTavern (segun busqueda web).
- Capacidades multilingues no documentadas, aunque la base Qwen sugiere posible soporte de chino e ingles.

## Casos de uso

- Roleplay conversacional avanzado: el modelo mantiene la coherencia del personaje y la trama en sesiones largas, gracias a su entrenamiento especifico para este tipo de interaccion. Es adecuado para plataformas como SillyTavern.
- Creacion de ficcion interactiva: escritores pueden usarlo para generar dialogos y narrativas en tiempo real, con control total sobre el tono y la direccion de la historia.
- Simulacion de personajes para juegos de rol: desarrolladores de juegos pueden integrarlo como motor de NPCs con personalidades complejas y sin restricciones de contenido.
- Generacion de contenido creativo adulto: autores de ficcion erotica pueden emplearlo para redactar escenas, dialogos o narrativas completas sin limitaciones tematicas.
- Chatbots personalizados sin censura: usuarios pueden crear asistentes conversacionales con personalidades especificas, sin que el modelo imponga limites morales o eticos.
- Investigacion sobre modelos no alineados: el modelo sirve como caso de estudio para analizar el comportamiento de LLMs sin entrenamiento de seguridad, en entornos controlados de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas comparativas de MMLU, HumanEval, GSM8K ni otros tests estandar. Tampoco hay datos de rendimiento en tareas especificas de roleplay o generacion de texto. La unica metrica disponible es el numero de descargas (11.106) y likes (13), que indican una adopcion moderada por parte de la comunidad.

## Requisitos de hardware

- El repositorio GGUF de 323.8 GB contiene multiples cuantizaciones; los archivos mas pequenos (Q2_K o Q3_K) podrian caber en GPUs de consumo con 8-12 GB de VRAM, mientras que las versiones de mayor precision (Q8_0 o F16) requeriran 24 GB o mas.
- GPU recomendada: RTX 3090/4090 (24 GB) para cuantizaciones medias (Q4_K_M o Q5_K_M) con buen equilibrio entre calidad y rendimiento.
- Para cuantizaciones altas o contexto largo, se recomienda GPU profesional (A100 40/80 GB) o inferencia en CPU con RAM abundante.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (si se convierte a safetensors), SillyTavern (via API), o cualquier servidor compatible con endpoints GGUF.
- La latencia dependera de la cuantizacion y el hardware; en una RTX 4090 con Q4_K_M se puede esperar un throughput de 20-40 tokens/s para generacion, aunque no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con modelos similares. La categoria de "roleplay sin censura" incluye alternativas como Mistral 7B o Llama 3 8B afinados para este proposito, pero Dark-Scarlett-27B-v2.0 tiene el doble de parametros, lo que sugiere una mayor capacidad de contexto y coherencia. Sin embargo, al no haber benchmarks publicados, no es posible cuantificar esta ventaja. La licencia Apache 2.0 es mas permisiva que la de muchos modelos de la competencia, que suelen usar licencias no comerciales.

## Limitaciones y advertencias

- Modelo "unaligned" y "dangerous": puede generar contenido ilegal, violento, explicito o danino sin restricciones. No debe usarse en aplicaciones publicas o comerciales sin un sistema de moderacion externo.
- Riesgo elevado de alucinaciones: al no estar alineado, el modelo puede inventar hechos, personas o eventos con total seguridad, lo que lo hace inadecuado para tareas de informacion factual.
- Sesgos no mitigados: no se ha realizado ningun trabajo de reduccion de sesgos, por lo que el modelo puede reflejar y amplificar prejuicios presentes en los datos de entrenamiento.
- Licencia ambigua: aunque se declara Apache 2.0, la etiqueta "Other License" y la naturaleza del contenido sugieren que el uso comercial podria estar restringido o requerir verificacion legal.
- Sin documentacion tecnica: no hay informacion sobre arquitectura, datos de entrenamiento o limitaciones de contexto, lo que dificulta su evaluacion y despliegue en produccion.
- Contenido NSFW: el modelo esta disenado para generar material explicito, lo que lo excluye de cualquier plataforma con politicas de contenido estrictas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ReadyArt/Dark-Scarlett-27B-v2.0-GGUF
- Modelo base (safetensors): https://huggingface.co/ReadyArt/Dark-Scarlett-27B-v2.0
- Directorio de archivos del modelo base: https://huggingface.co/ReadyArt/Dark-Scarlett-27B-v2.0/tree/main
- Herramienta compatible (SillyTavern): https://github.com/seangoozey/super-silly
- Directorio de modelos GGUF: https://local-ai-zone.github.io/
