# lecheyne24/unbound-phone

## Resumen

unbound-phone es una coleccion de modelos de lenguaje en formato GGUF publicada por el usuario lecheyne24 en Hugging Face, pensada para ejecucion en dispositivos moviles. Se compone de dos variantes derivadas de la familia Qwen2.5-Instruct: una de 3B parametros (recomendada) y otra de 0,5B como alternativa para telefonos con poca memoria. Ambas han sido sometidas a un proceso de "abliteration" (modificacion de pesos para eliminar los comportamientos de rechazo o censura aprendidos), con un factor alpha de 1.15 en el caso del modelo de 3B.

El problema que aborda es la ausencia de modelos conversacionales pequenos, sin filtros de rechazo y listos para usar en local dentro de aplicaciones Android o iOS. El autor empaqueta los pesos ya cuantizados en Q4_K_M, de modo que el usuario no necesita herramientas de conversion: descarga el `.gguf` y lo carga en apps como PocketPal AI, ChatterUI, Layla o LLM Farm. El repositorio ocupa 2,3 GB y los pesos en safetensors declaran 494.032.768 parametros, cifra que corresponde a la variante de 0,5B y no al modelo de 3B mencionado en la model card.

La relevancia actual es acotada: se trata de un artefacto de nicho, con cero descargas y cero likes en el momento de la consulta, sin pipeline declarado y sin documentacion de evaluacion mas alla de una afirmacion cualitativa del autor ("8/8 gauntlet, 0 residual hedge"). No hay papers, benchmarks publicos ni repositorio de codigo asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-Instruct) |
| Parametros totales | 494.032.768 (dato safetensors, corresponde a la variante 0,5B); la variante de 3B no declara recuento en el repo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (valor recomendado por el autor en la model card) |
| Tipos de cuantizacion | Q4_K_M (unica publicada) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF; el repo declara ademas pesos en safetensors |
| Tamano del repositorio | 2,3 GB |
| Variantes incluidas | qwen2.5-3b-unbound-Q4_K_M.gguf (~1,9 GB), qwen2.5-0.5b-unbound.Q4_K_M.gguf (~400 MB) |
| Metodo de desalineacion | Abliteration con alpha 1.15 (solo declarado para la variante 3B) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-Instruct en sus variantes de 3B y 0,5B: transformers decoder-only con atencion causal estandar, RoPE y tokenizador BPE multilingue (aunque el autor restringe el uso declarado al ingles). No se aporta informacion sobre el numero de tokens de entrenamiento original, la composicion del dataset ni si hubo fases de RLHF o DPO; esos datos corresponden a los modelos base de Qwen y no se reproducen en la model card.

La unica intervencion documentada es la abliteration: una tecnica de edicion de pesos que identifica la direccion de activacion asociada al rechazo y la proyecta fuera de los pesos, de forma que el modelo deja de producir respuestas de evasion. El autor indica un coeficiente alpha de 1.15 para la variante de 3B y afirma que la variante supera una prueba interna de ocho casos ("8/8 gauntlet") sin "hedges" residuales. No se publican los prompts de esa prueba, la metodologia de evaluacion ni los artefactos del proceso de abliteration, que el autor atribuye a una "build fleet" privada. Tampoco se documenta si la variante de 0,5B recibio el mismo tratamiento con identico alpha.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Respuestas sin mecanismos de rechazo aprendidos, orientadas a contenido que los modelos alineados convencionalmente declinarian.
- Instrucciones y formato de chat heredados de Qwen2.5-Instruct (plantilla de chat de Qwen).
- Ejecucion completamente local en dispositivos moviles, sin conexion de red.
- La model card etiqueta el repositorio como compatible con endpoints, lo que sugiere uso mediante APIs de inferencia, aunque no se detalla la configuracion.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Chat conversacional offline en Android: cargando el `.gguf` de 3B en PocketPal AI, ChatterUI o Layla, el modelo mantiene conversaciones multi-turno con una ventana de 4096 tokens sin salir del dispositivo, lo que evita enviar datos a servidores externos.
- Sustitucion de asistentes en telefonos de gama baja: la variante de 0,5B (~400 MB) permite disponer de un modelo generativo en dispositivos con menos de 1 GB de RAM libre, alli donde el 3B no cabe.
- Prototipado de personajes o roleplay sin restricciones: el proceso de abliteration elimina las respuestas de evasion, lo que resulta util para experimentar con personajes o guiones que un modelo alineado rechazaria.
- Pruebas de investigacion sobre desalineacion: el par 3B/0,5B permite comparar el comportamiento de un mismo metodo de abliteration a dos escalas de parametros en un entorno controlado y reproducible en local.
- Escritura creativa en ingles con privacidad: redaccion de borradores, relatos o dialogos en un dispositivo movil sin conexion, aprovechando la ventana de 4096 tokens para mantener el contexto de un capitulo corto.
- Demostraciones y talleres: el tamano reducido del archivo facilita distribuir el modelo por descarga directa y ejecutarlo en portatiles modestos con llama.cpp u Ollama durante sesiones formativas.
- Evaluacion comparativa de cuantizaciones: al publicarse solo Q4_K_M, sirve como referencia de la perdida de calidad respecto a los pesos originales de Qwen2.5-3B-Instruct en tareas de conversacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo menciona una prueba interna cualitativa ("8/8 gauntlet, 0 residual hedge") sin especificar los casos, las metricas ni el procedimiento.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 2,5 GB de RAM libre para la variante de 3B en Q4_K_M (~1,9 GB de pesos mas overhead de contexto y runtime); unos 500-700 MB para la variante de 0,5B (~400 MB de pesos).
- GPU de escritorio: cualquier GPU con 4 GB o mas de VRAM puede ejecutar el 3B en Q4_K_M mediante llama.cpp con offload parcial o total; el 0,5B funciona incluso en CPU.
- GPU de centro de datos (A100, H100): sobredimensionadas para este modelo; su uso solo tendria sentido para servir muchas instancias concurrentes en vLLM, y aun asi el rendimiento por peticion estara limitado por el tamano del modelo.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4060, RTX 4070 y superiores con margen amplio; en GPUs de 4-6 GB (GTX 1650, RTX 3050) el 3B entra con contexto reducido.
- Moviles: el autor indica que el 3B necesita unos 2,5 GB de RAM libre; el 0,5B "funciona en cualquier sitio".
- Opciones de despliegue: llama.cpp, Ollama, PocketPal AI, ChatterUI, Layla (Android), LLM Farm (iPhone); vLLM y TGI no estan documentados para este artefacto y su soporte GGUF es limitado o indirecto.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo en ningun dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion publicada | Licencia | Enfoque |
|---|---|---|---|---|---|
| unbound-phone (3B) | ~3B (no declarado en repo) | 4096 | Q4_K_M | Apache 2.0 | Abliterated, movil |
| unbound-phone (0,5B) | 494 M | 4096 | Q4_K_M | Apache 2.0 | Abliterated, movil |
| Qwen2.5-3B-Instruct | 3B | 32 768 (nativo) | Multiples | Apache 2.0 | Alineado, generalista |
| Qwen2.5-0.5B-Instruct | 494 M | 32 768 (nativo) | Multiples | Apache 2.0 | Alineado, generalista |
| Llama 3.2 1B/3B Instruct | 1B / 3B | 131 072 | Multiples | Llama 3.2 Community | Alineado, generalista |

La comparacion directa con los modelos base de Qwen es la mas informativa: unbound-phone sacrifica la ventana nativa de 32 768 tokens (el autor recomienda 4096) y la alineacion de seguridad a cambio de eliminar los rechazos, manteniendo la licencia Apache 2.0. Frente a Llama 3.2, la diferencia principal es la licencia (Apache 2.0 sin restricciones de usuarios mensuales) y el enfoque sin filtros, aunque no hay datos de rendimiento que permitan comparar calidad.

## Limitaciones y advertencias

- La abliteration elimina los rechazos de forma deliberada: el modelo puede generar contenido danino, ilegal o sexual sin advertir, lo que exige supervision humana y filtros externos en cualquier despliegue publico.
- Riesgo elevado de alucinacion: con 3B parametros y cuantizacion Q4_K_M, la fidelidad factual es limitada, especialmente en tareas de conocimiento, matematicas o codigo.
- Solo se declara soporte de ingles; el comportamiento en castellano no esta evaluado y probablemente sea deficiente en la variante de 0,5B.
- La ventana de contexto recomendada es de 4096 tokens, muy inferior a los 32 768 nativos de Qwen2.5; ampliarla sin ajuste puede degradar la coherencia.
- El recuento de parametros del repositorio (494 M) corresponde solo a la variante pequena; no hay verificacion independiente de los pesos de 3B ni de que el proceso de abliteration se haya aplicado correctamente.
- No hay evaluacion publica, ni dataset de prueba, ni auditoria del metodo de abliteration; las afirmaciones del autor no son verificables.
- Repositorio sin descargas ni comunidad: no hay garantia de mantenimiento, correccion de errores ni soporte.
- La licencia Apache 2.0 permite uso comercial, pero el usuario asume toda la responsabilidad legal sobre el contenido generado por un modelo sin alineacion.
- El tag "endpoints_compatible" no va acompanado de documentacion sobre el contrato de API ni de limites de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lecheyne24/unbound-phone
- Qwen2.5-3B-Instruct (modelo base): https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Qwen2.5-0.5B-Instruct (modelo base): https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- PocketPal AI (Android/iOS): https://github.com/a-ghorbani/pocketpal-ai
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
