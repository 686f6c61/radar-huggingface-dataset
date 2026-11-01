# KonradDallaOrg/dimmy-phi-4-mini-gguf

## Resumen

dimmy-phi-4-mini-gguf es un espejo no modificado de los ficheros de modelo que la aplicación Dimmy descarga en local, publicado por KonradDallaOrg para que la app no dependa de que los repositorios originales sigan disponibles. No se trata de un modelo nuevo ni de un ajuste fino: es una redistribución byte a byte de una cuantización Q4_K_M del modelo microsoft/Phi-4-mini-instruct, cuantizado originalmente por el usuario matrixportalx. El autor lo describe explícitamente como "unmodified mirror" y como "fallback local de LLM" para su aplicación.

El modelo subyacente, Phi-4-mini-instruct, es un transformer denso de Microsoft con aproximadamente 3.836 millones de parámetros (3,8 B), orientado a instrucciones y conversación. Esta versión GGUF Q4_K_M ocupa unos 2,49 GB en disco y está pensada para inferencia en CPU o GPU con llama.cpp y derivados. La relevancia de este repositorio concreto es logística: garantiza la reproducibilidad de un artefacto de despliegue (un GGUF concreto, con hash SHA-256 verificado) para una aplicación de escritorio.

Dado que el repositorio es un espejo, toda la información técnica sustantiva (arquitectura, entrenamiento, benchmarks) procede del modelo base de Microsoft y no está documentada en esta model card. Los datos que no aparecen en la información proporcionada se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de microsoft/Phi-4-mini-instruct; detalles no disponibles en esta card) |
| Parametros totales | 3.836.021.856 (3,8 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | MIT |
| Formato de pesos | GGUF (`phi-4-mini-instruct-q4_k_m.gguf`, 2.491.874.624 B) |
| SHA-256 del fichero | `55239fbd0dc947146be056e7850d2fa3a55d0091aa2cc873767e686c3b15eeed` |
| Tamano del repo | 2,5 GB |
| Modelo base | microsoft/Phi-4-mini-instruct |
| Cuantizador original | matrixportalx (revision `5ac63e68c1be52445c2c864fe9fc0116ca9686c9`) |
| Etiquetas | gguf, dimmy, conversational, endpoints_compatible |
| Descargas / likes | 27 / 0 |

## Arquitectura y entrenamiento

Este repositorio no aporta entrenamiento propio: es una copia idéntica del GGUF publicado por matrixportalx en la revisión indicada, cuyo origen es microsoft/Phi-4-mini-instruct. Por tanto, la arquitectura es la del modelo base de Microsoft (un transformer denso de 3,8 B de parámetros orientado a instrucciones), pero esta model card no documenta capas, dimensión oculta, cabezas de atención, número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO. Toda esa información debe consultarse en la card del modelo original de Microsoft.

La única transformación aplicada es la cuantización a Q4_K_M, un esquema de cuantización por bloques de la familia k-quants de llama.cpp, que mantiene las matrices de atención y FFN en 4 bits con escalas de 6 bits y deja algunas capas críticas en precisión superior. El resultado es un fichero de 2,49 GB que reduce aproximadamente a la mitad el peso de los pesos en FP16 (unos 7,7 GB para 3,8 B de parámetros). El autor declara que los ficheros son byte-idénticos al upstream y que el SHA-256 de la tabla es el hash LFS del Hub, lo que permite verificar la integridad de la descarga.

## Capacidades

- Generación de texto conversacional e instrucciones: el tag `conversational` y el pipeline implícito de instrucciones del modelo base apuntan a uso en diálogo multi-turno.
- Razonamiento y matemáticas básicas: capacidades heredadas de Phi-4-mini-instruct, no verificadas en esta card.
- Generación de código: presumible en el modelo base, no documentada aquí.
- Tool calling / function calling: no disponible en la información proporcionada para este repositorio.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere uso a través de APIs compatibles con el formato de Hugging Face, aunque no se detalla el mecanismo.

## Casos de uso

- Fallback local en la aplicación Dimmy: el caso de uso declarado por el autor. La app descarga este GGUF como modelo de respaldo cuando no hay conectividad o cuando el usuario opta por inferencia local; el espejo garantiza que la URL de descarga y el hash no cambien aunque el repositorio upstream se mueva o se elimine.
- Despliegue en portátiles sin GPU dedicada: con 2,49 GB en Q4_K_M, el modelo cabe en RAM de sistemas modestos (8 GB o más) y se ejecuta en CPU con llama.cpp a velocidades interactivas para generación de texto corta.
- Asistente conversacional de escritorio: al ser un modelo de 3,8 B orientado a instrucciones, es adecuado para chat multi-turno con latencia baja en hardware de consumo, siempre que el contexto configurado se mantenga dentro de los límites del modelo base.
- Prototipado rápido de aplicaciones LLM: sirve como modelo de referencia para validar pipelines de inferencia (prompting, plantillas de chat, streaming) antes de migrar a modelos mayores, con la ventaja de una licencia MIT sin restricciones.
- Generación de texto offline en entornos air-gapped: al ser un fichero único GGUF verificable por SHA-256, se puede distribuir en redes internas y auditar su integridad, algo relevante en entornos con requisitos de cadena de suministro.
- Integración en herramientas tipo Ollama o LM Studio: el formato GGUF Q4_K_M es directamente importable en estos runners, lo que permite tener un modelo local listo para usar sin pasos de conversión.
- Pruebas de regresión de cuantización: al ser un artefacto con hash fijado, sirve para comparar la calidad de Q4_K_M frente a otras cuantizaciones del mismo modelo base en evaluaciones internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos; cualquier dato de este tipo debería consultarse en la card de microsoft/Phi-4-mini-instruct.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: unos 2,5 GB solo para los pesos en Q4_K_M; con overhead de contexto y caché KV, un presupuesto práctico de 3,5-4,5 GB según longitud de contexto.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090, A100, H100). En GPUs de gama alta el modelo queda limitado por ancho de banda de memoria, no por cómputo.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU consumer con 4 GB o más; también en CPU con 8 GB de RAM del sistema.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con GGUF (llama-cpp-python, text-generation-webui). vLLM y TGI no cargan GGUF de forma nativa en todas sus versiones, por lo que requerirían convertir a safetensors o usar variantes específicas; no disponible la confirmación para este artefacto.
- Latencia y throughput estimados: no disponible en la información proporcionada. Como referencia cualitativa, un modelo denso de 3,8 B en Q4_K_M suele generar decenas de tokens por segundo en GPU consumer y varios tokens por segundo en CPU, pero no hay mediciones publicadas para este fichero.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| dimmy-phi-4-mini-gguf (este) | 3,8 B | no disponible | MIT | GGUF Q4_K_M | Espejo de Phi-4-mini-instruct; 2,49 GB |
| microsoft/Phi-4-mini-instruct | 3,8 B | no disponible en esta ficha | MIT | safetensors | Modelo original; permite cuantizar a otros formatos |
| matrixportalx/Phi-4-mini-instruct-Q4_K_M-GGUF | 3,8 B | no disponible | MIT (heredada) | GGUF Q4_K_M | Upstream directo de este espejo |
| Otros modelos de ~3-4 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada para establecer comparaciones de rendimiento |

La comparativa relevante aquí es de linaje, no de rendimiento: este repositorio no introduce diferencias funcionales respecto al GGUF de matrixportalx ni respecto al modelo de Microsoft, salvo la garantía de disponibilidad y el hash fijado.

## Limitaciones y advertencias

- No es un modelo original: no aporta mejoras, ajustes ni correcciones sobre Phi-4-mini-instruct; cualquier limitación del modelo base se hereda íntegramente.
- Sesgos conocidos: no documentados en esta card; deben evaluarse en la del modelo base de Microsoft.
- Riesgo de alucinación: inherente a los modelos de 3,8 B; mayor que en modelos de mayor tamaño, especialmente en tareas de conocimiento factual y matemáticas complejas.
- Limitaciones de contexto e idioma: no disponibles en la información proporcionada; conviene verificar la ventana de contexto real del modelo base antes de desplegarlo en producción.
- Restricciones de licencia: MIT, permite uso comercial y modificación con atribución; el autor mantiene la atribución a Microsoft y a matrixportalx. Aun así, conviene revisar los términos del modelo base por si hubiera condiciones adicionales no reflejadas aquí.
- Dependencia de un único fichero y una única cuantización: solo se publica Q4_K_M; no hay variantes Q5, Q8 ni FP16 en este repositorio.
- Mantenimiento: con 27 descargas y 0 likes, el repositorio tiene muy poca tracción; no hay garantía de actualizaciones ni de soporte por parte del autor.
- Verificación de integridad: se debe comprobar el SHA-256 tras la descarga, ya que el valor de reproducibilidad es el principal activo de este espejo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/KonradDallaOrg/dimmy-phi-4-mini-gguf
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Upstream del GGUF: https://huggingface.co/matrixportalx/Phi-4-mini-instruct-Q4_K_M-GGUF
- Fichero upstream en la revisión fijada: https://huggingface.co/matrixportalx/Phi-4-mini-instruct-Q4_K_M-GGUF/resolve/5ac63e68c1be52445c2c864fe9fc0116ca9686c9/phi-4-mini-instruct-q4_k_m.gguf
