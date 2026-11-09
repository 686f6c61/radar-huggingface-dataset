# CJR61/drpig-lite-gguf

## Resumen

Dr. Pig LITE 0.8B es un modelo de lenguaje de pequeno tamano (772.845.888 parametros) desarrollado por CJR61, obtenido mediante fine-tuning con LoRA sobre Qwen/Qwen3.5-0.8B. Su proposito no es la conversacion general, sino una tarea muy acotada: reescribir en chino tradicional un pasaje de un manual de referencia que se le suministra, o bien rechazar la peticion cuando dicho pasaje no responde a la pregunta planteada. Los numeros del pasaje se copian de forma literal, sin reformulacion.

El modelo esta pensado para ejecutarse en dispositivo (on-device), dentro de la aplicacion "Dr. Pig pig-farm advisor" (asesor de granjas porcinas), en telefonos de gama de entrada (Tier 0/1). Se distribuye unicamente en formato GGUF cuantizado Q4_0, con un unico fichero de 512.977.440 bytes (aproximadamente 0,5 GB), y esta disenado para cargarse con llama.cpp (build b10182) a traves de endpoints compatibles.

Su relevancia radica en el patron de despliegue: un modelo base pequeno, adaptado con LoRA a una tarea de recuperacion aumentada muy restringida (reescritura grounded con rechazo explicito), empaquetado en cuantizacion agresiva para caber en hardware movil de gama baja. La licencia Apache 2.0 del modelo base se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-0.8B); no se detalla en la model card |
| Parametros totales | 772.845.888 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (unico fichero publicado) |
| Idiomas soportados | chino tradicional (zh-TW) como idioma de salida; resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La model card indica que el modelo parte de Qwen/Qwen3.5-0.8B y se adapta mediante LoRA. No se especifican en la informacion disponible detalles sobre la arquitectura interna del modelo base (tipo de atencion, uso de atencion lineal, decodificacion especulativa u otras innovaciones), ni el numero de tokens de entrenamiento, la composicion del dataset o si se emplearon tecnicas de RLHF o DPO.

El objetivo de entrenamiento declarado es doble: (1) reescribir en chino tradicional un pasaje de manual proporcionado en el contexto, y (2) rechazar la peticion cuando el pasaje no contiene la respuesta. La restriccion de copiar los numeros de forma literal sugiere un entrenamiento orientado a fidelidad extractiva y a reducir la reformulacion de datos numericos, un riesgo habitual en tareas de resumen grounded. El unico artefacto publicado es la cuantizacion Q4_0 generada para llama.cpp b10182.

## Capacidades

- Reescritura grounded: reformula en chino tradicional un pasaje de manual suministrado por el usuario.
- Rechazo controlado: declina responder cuando el pasaje no contiene la informacion solicitada.
- Fidelidad numerica: copia literalmente las cifras del pasaje, sin alterarlas.
- Ejecucion on-device en llama.cpp (build b10182) mediante endpoints compatibles.
- No es un modelo de chat general: la model card lo declara explicitamente.
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso o agentes: no disponible.
- Capacidades multilingues: limitadas a chino tradicional (zh-TW) segun los tags; no se documentan otros idiomas.
- Vision, audio o modo thinking: no disponible.

## Casos de uso

- Asesor porcino en aplicacion movil: el modelo recibe un fragmento del manual de la granja y la pregunta del usuario, y devuelve una respuesta en chino tradicional construida solo con ese fragmento. Es adecuado por su tamano reducido y su cuantizacion Q4_0, que permite ejecucion en telefonos de gama baja.
- Respuestas con trazabilidad documental: al reescribir exclusivamente el pasaje proporcionado, la respuesta queda acotada al material de referencia, lo que facilita auditar el origen de cada afirmacion.
- Consultas con datos numericos criticos: dosis, temperaturas o ratios se copian de forma literal, reduciendo el riesgo de errores de redondeo o reformulacion en contextos donde una cifra incorrecta tiene consecuencias operativas.
- Control de alcance mediante rechazo: cuando el manual no cubre la pregunta, el modelo declina responder en lugar de improvisar, lo que encaja en flujos de atencion donde es preferible derivar a un veterinario o a soporte humano.
- Despliegue offline en explotaciones rurales: al ejecutarse en llama.cpp sobre el dispositivo, funciona sin conectividad, un escenario habitual en granjas.
- Integracion en pipelines RAG ligeros: el modelo puede actuar como capa de reescritura y filtrado sobre los fragmentos recuperados, rechazando aquellos que no responden a la consulta antes de mostrarlos al usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 0,5 GB para los pesos en Q4_0; el consumo real depende del contexto y de la implementacion de llama.cpp.
- GPU recomendadas: no disponible; el modelo esta disenado para CPU en dispositivos moviles (Tier 0/1).
- Cabida en GPU de consumo: si, en cualquier GPU con al menos 1 GB de memoria libre, aunque el caso de uso previsto es CPU.
- Opciones de despliegue: llama.cpp (build b10182, referencia explicita de la model card); otros runners compatibles con GGUF no estan documentados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Dr. Pig LITE 0.8B (este) | 772.845.888 | no disponible | Apache 2.0 | GGUF Q4_0 | Fine-tune LoRA de tarea especifica, solo zh-TW |
| Qwen/Qwen3.5-0.8B (base) | no disponible en la informacion | no disponible | no disponible | safetensors (presumible) | Modelo generalista del que deriva |
| Alternativas de ~0,5-1B para on-device | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con modelos de la misma categoria.

## Limitaciones y advertencias

- No es un modelo de chat general: usarlo fuera de la tarea de reescritura grounded sobre un pasaje puede producir salidas degeneradas o poco fiables.
- Riesgo de alucinacion: aunque el entrenamiento busca el rechazo y la copia literal, no hay garantia formal de que no se introduzcan datos ajenos al pasaje; conviene validar cifras en produccion.
- Cobertura idiomatica muy estrecha: solo se documenta chino tradicional (zh-TW); no hay evidencia de calidad en castellano ni en otros idiomas.
- Longitud de contexto no documentada: no es posible planificar el tamano maximo de pasaje que admite sin probarlo.
- Sesgos: no se documentan evaluaciones de sesgo; un modelo entrenado sobre un manual de granjas hereda el sesgo y las limitaciones de ese material.
- Licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen/Qwen3.5-0.8B, no confirmada en la informacion disponible.
- Un unico artefacto Q4_0: no hay variantes Q5, Q8 o de mayor precision para entornos con mas recursos, ni pesos sin cuantizar.
- Repositorio sin descargas ni likes y creado recientemente: no hay senales de validacion por parte de la comunidad.
- Dependencia de una build concreta de llama.cpp (b10182); conviene fijar la version en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/CJR61/drpig-lite-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- llama.cpp: https://github.com/ggml-org/llama.cpp
