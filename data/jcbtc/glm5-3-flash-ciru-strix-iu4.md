# jcbtc/GLM5.3-Flash-CIRU-STRIX-IU4

## Resumen

El modelo GLM5.3 Flash CIRU STRIX IU4 es una adaptación del modelo GLM-5.3-Flash de zai-org, desarrollada por jcbtc, para ejecutarse de manera completamente local en dos sistemas AMD Strix Halo conectados por USB4. Se trata de un modelo de mezcla de expertos (MoE) con 320 mil millones de parámetros totales y aproximadamente 18 mil millones de parámetros activos por token, lo que permite un razonamiento potente con un coste computacional relativamente bajo. La cuantización híbrida de 4 bits reduce el peso a aproximadamente 166.5 GiB, distribuidos en 83.25 GiB por máquina, y el contexto por defecto es de 128K tokens, con perfiles de 64K y 256K disponibles.

El modelo resuelve el problema de ejecutar un modelo de lenguaje de gran tamaño en hardware de sobremesa, manteniendo los datos en local. Para ello, incorpora un runtime personalizado de vLLM sobre ROCm 10, kernels enteros específicos para Strix, y decodificación especulativa DFlash2 con siete tokens de borrador. El paquete incluye la consola de operador CiruStrixLink 0.3.0 para gestionar la conexión entre los dos sistemas. Es relevante para desarrolladores e investigadores que necesitan capacidades de codificación, razonamiento y uso de herramientas con privacidad total y sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en Transformer, con tensor parallelism bidireccional sobre dos sistemas Strix Halo conectados por USB4/NHI |
| Parametros totales | 320 mil millones (320B) |
| Parametros activos | Aproximadamente 18 mil millones (18B) por token |
| Longitud de contexto | 128K por defecto; perfiles de 64K y 256K disponibles |
| Tipos de cuantizacion | Híbrida 4-bit; aproximadamente 4.46 bits almacenados por parámetro objetivo |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Mixta MIT y Apache 2.0 (mixed-mit-apache-2.0); el modelo card indica "other" |
| Formato de pesos | Paquete personalizado para ejecución GPU de dos máquinas (no compatible con Transformers/GGUF estándar) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura MoE de GLM-5.3-Flash, con 320B de parámetros totales y ~18B activos por token. La adaptación de jcbtc añade una capa de optimización específica para el hardware AMD Strix Halo: los pesos se han reorganizado para una ruta de ejecución GPU de dos máquinas, y se incluye un runtime personalizado de vLLM sobre ROCm 10. La decodificación especulativa DFlash2, con siete tokens de borrador, acelera la generación. Los kernels enteros específicos para Strix aprovechan la arquitectura de la GPU integrada. La conexión entre los dos sistemas se realiza mediante USB4/NHI directo, con un modo de compatibilidad de red USB4 también incluido.

No se han proporcionado detalles específicos sobre el dataset de entrenamiento ni sobre el proceso de fine-tuning. El modelo es una adaptación del modelo base zai-org/GLM-5.3-Flash, y la cuantización híbrida 4-bit se ha aplicado sobre la versión AWQ W4A16 de wtdcode. Las mediciones de cuantización contra el modelo BF16 oficial se basan en 767 posiciones de siguiente token coincidentes de WikiText, puntuando el vocabulario completo de 154,880 tokens en cada posición.

## Capacidades

- Generación de texto y chat en inglés y chino.
- Razonamiento con modo de esfuerzo máximo configurable.
- Codificación en Python, con una muestra de HumanEval de 10/10 problemas superados.
- Uso de herramientas (tool calling) compatible con la interfaz OpenAI.
- Soporte de agentes y razonamiento multi-step, evaluado en ToolEval Standard69 y Hard15.
- Contexto largo de 128K por defecto, con perfiles de 64K y 256K disponibles.
- Inferencia completamente local en dos sistemas Strix Halo, sin necesidad de servicios en la nube.
- Solo texto; no soporta entrada de visión ni audio.
- Interfaz OpenAI-compatible para chat y llamadas a herramientas automáticas.

## Casos de uso

- **Desarrollo de código con privacidad total**: El modelo puede generar y razonar sobre código Python sin enviar datos a la nube. Se desplegaría en dos Strix Halo conectados por USB4, con el runtime incluido. Es adecuado para equipos que necesitan mantener el código fuente en sus propias instalaciones.

- **Asistente de programación integrado en IDE**: Al soportar tool calling compatible con OpenAI, puede integrarse en editores de código para ejecutar funciones externas, consultar APIs o manipular repositorios. El modelo gestiona escenarios de herramientas con un 87% en ToolEval Standard69, aunque las aplicaciones deben imponer permisos de herramientas fuera del modelo.

- **Análisis de documentación técnica extensa**: Con 128K de contexto por defecto y perfiles de 256K, es adecuado para analizar documentos técnicos, logs de sistemas o codebases completos. La velocidad de procesamiento de prompts de 347 a 402 tok/s permite leer rápidamente entradas largas.

- **Chat privado para equipos de investigación**: Al ejecutarse completamente en local, las conversaciones y los datos generados no salen de las máquinas. Esto es relevante para laboratorios o empresas con requisitos estrictos de confidencialidad. El modelo soporta inglés y chino, lo que facilita equipos multilingües.

- **Prototipos de agentes autónomos**: El modelo ha sido evaluado en ToolEval Hard15 con un 83%, lo que sugiere capacidad para planificar y ejecutar tareas complejas con múltiples herramientas. Puede usarse en prototipos de agentes que requieran razonamiento multi-step.

- **Servicio de inferencia local**: El paquete incluye instaladores de servicio y una interfaz compatible con OpenAI, lo que permite exponer el modelo como un endpoint local para aplicaciones que ya usan la API de OpenAI. El perfil de servicio es de una solicitud activa a la vez, adecuado para uso individual o de baja concurrencia.

- **Auditoría y modernización de código heredado**: Con 320B de parámetros y capacidad de razonamiento, puede ayudar a auditar y actualizar código antiguo. El contexto largo permite cargar archivos o módulos completos.

## Benchmarks y rendimiento

| Carga de trabajo | Procesamiento de prompts | Tiempo al primer token | Velocidad de generación |
|---|---|---|---|
| 2,048 tokens de entrada + 128 generados | 402.5 tok/s | 5.09 s | 23.69 tok/s |
| 20,499 tokens de entrada + 128 generados | 395.3 tok/s | 51.86 s | no disponible |
| 131,000 tokens de entrada + 128 generados | 347.2 tok/s | 377.27 s | no disponible |
| HumanEval tareas 0-9, chat de producción | no disponible | 1.33 s media | 24.66 tok/s |

La muestra de codificación generó 7,892 tokens en diez solicitudes en 5 minutos y 33 segundos, incluyendo el procesamiento de prompts. DFlash2 aceptó el 59.1% de los tokens de borrador propuestos en esa muestra. Las mediciones provienen de varias ejecuciones de la configuración de pesos publicada, con configuraciones de runtime y caché que variaron durante el desarrollo. Las dos ejecuciones de prompt fijo más cortas usaron la configuración de 64K; la entrada de 131K y la muestra de codificación usaron 128K. Son ejecuciones individuales, no un barrido de longitud de contexto coincidente. Una entrada anterior de 768 tokens midió 485 prompt tokens/s; la velocidad de entrada corta no debe extrapolarse a prompts largos.

| Evaluación | Resultado | Alcance |
|---|---|---|
| HumanEval 0-9 | 10/10 problemas superados | Muestra de diez problemas de Python, adaptados a la interfaz de chat de producción |
| ToolEval Standard69 | 87% (120/138 puntos) | 69 escenarios: 57 superados, 6 parciales, 6 fallidos |
| ToolEval Hard15 | 83% (25/30 puntos) | 15 escenarios más difíciles: 11 superados, 3 parciales, 1 fallido |

La evaluación de HumanEval utilizó una respuesta por problema, la plantilla de chat del modelo, temperatura 1.0, top-p 0.95, máximo esfuerzo de razonamiento y un límite de salida de 8,192 tokens. No hubo límites alcanzados, bucles abortados, reintentos ni selección de mejor respuesta. Es una muestra de diez problemas, no el benchmark completo de 164 tareas. ToolEval utilizó tool-eval-bench 2.1.0 con un adaptador local para la API de dos máquinas. Cada escenario recibe dos puntos por un pase completo y uno por un pase parcial; 87% y 83% son puntuaciones redondeadas, no porcentajes de pases completos.

## Requisitos de hardware

- Dos sistemas AMD Strix Halo, cada uno con 128 GiB de memoria unificada.
- Los pesos ocupan aproximadamente 83.25 GiB por máquina, más el runtime, los kernels y la caché.
- No es compatible con GPUs NVIDIA estándar sin adaptación; el runtime está diseñado para ROCm 10 en Strix Halo.
- Opciones de despliegue: vLLM personalizado incluido en el paquete. No compatible con vLLM estándar, Transformers, llama.cpp, Ollama o TGI.
- Latencia y throughput: generación de 23.69 a 24.66 tok/s, procesamiento de prompts de 347.2 a 402.5 tok/s, tiempo al primer token de 1.33 s a 5.09 s para entradas cortas. Para entradas de 131K, el tiempo al primer token es de 377.27 s, lo que limita su uso en aplicaciones interactivas con entradas muy largas.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Cuantización | Formato | Licencia |
|---|---|---|---|---|---|---|
| zai-org/GLM-5.3-Flash | 320B | ~18B | no disponible | FP8 nativo (328 GB) | Checkpoint FP8 | no disponible |
| wtdcode/GLM-5.3-Flash-AWQ-W4A16 | 320B | ~18B | no disponible | AWQ W4A16 | Pesos estándar | no disponible |
| jcbtc/GLM5.3-Flash-CIRU-STRIX-IU4 | 320B | ~18B | 128K (64K/256K) | Híbrida 4-bit (~4.46 bits/parámetro) | Paquete personalizado para dos Strix Halo | Mixta MIT y Apache 2.0 |

No se han publicado resultados de benchmarks comparables para las variantes del modelo base en la información disponible, por lo que la comparativa se limita a las especificaciones técnicas.

## Limitaciones y advertencias

- El runtime incluido es obligatorio; los pesos no son compatibles con frameworks estándar como vLLM, Transformers o llama.cpp.
- El borrador DFlash2 se descarga por separado del paquete principal.
- El perfil de servicio admite una solicitud activa a la vez; no es adecuado para alta concurrencia.
- Solo texto; no soporta entrada de visión ni audio.
- Solo inglés y chino.
- Las mediciones de rendimiento son de ejecuciones individuales con configuraciones variables; no son resultados de benchmarks completos.
- La evaluación de HumanEval es una muestra de diez problemas, no el benchmark completo de 164 tareas.
- Las categorías más débiles en ToolEval fueron el manejo de seguridad y límites, y la elección entre grandes conjuntos de herramientas. Las aplicaciones deben imponer permisos de herramientas fuera del modelo.
- Riesgo de alucinación inherente a los modelos de lenguaje grandes.
- No se documentan sesgos específicos en la información disponible.
- La licencia es mixta (MIT y Apache 2.0) según el archivo de avisos de terceros; se debe revisar para uso comercial.

## Enlaces

- HuggingFace: https://huggingface.co/jcbtc/GLM5.3-Flash-CIRU-STRIX-IU4
- Avisos de terceros: https://huggingface.co/jcbtc/GLM5.3-Flash-CIRU-STRIX-IU4/blob/main/THIRD_PARTY_NOTICES.md
- Guía para ejecutar GLM-5.3-Flash localmente: https://codersera.com/blog/how-to-run-glm-5-3-flash-locally-2026/
