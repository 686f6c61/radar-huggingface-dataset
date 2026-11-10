# Pandoks/rs-abl-red-snow-nvfp4-oproj-wa35

## Resumen

RED-SNOW 5.3 Flash NVFP4 — o_proj loop-direction ablation (wa35) es una variante experimental del checkpoint Blackfrost-AI/RED-SNOW-5.3-FLASH-NVFP4, publicada por el usuario Pandoks. No se trata de un modelo nuevo entrenado desde cero, sino de una edicion quirurgica de pesos: se aplica una ablacion direccional de rango 1 sobre la matriz `o_proj` de las capas de atencion 28, 30, 31, 32, 34, 35, 36, 38, 39, 40, 41 y 43, modificando unicamente esos tensores y dejando el resto del checkpoint byte a byte identico.

El objetivo declarado es corregir un fallo de repeticion verbatim en contexto largo, en el que el modelo se queda atrapado reproduciendo fragmentos como "— done. — end." o "tldr:" de forma indefinida. La hipotesis del autor es que existe una direccion concreta en el espacio de salida de atencion (4096 dimensiones) que codifica ese bucle, y que eliminando su componente en las capas de atencion completas tardias se recupera la decision de parada.

El modelo conserva la arquitectura y cuantizacion del checkpoint base (etiquetado como glm-5.3 / glm5_next, en formato NVFP4 de 4 bits con escalas, mas un total de 161.461.030.910 parametros). Es una build de diagnostico, no una release de uso general, y asi lo indica el propio autor en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta glm-5.3 / glm5_next), atencion completa en banda tardia; detalles completos no disponibles |
| Parametros totales | 161.461.030.910 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el autor menciona "long context" sin cifra) |
| Tipos de cuantizacion | NVFP4 (4 bits con escalas) en shards; tensores editados en BF16 dentro de los shards NVFP4; tag 8-bit / modelopt |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (NVFP4, 204,5 GB de repo) |

## Arquitectura y entrenamiento

El checkpoint base sigue una arquitectura transformer con etiqueta glm-5.3 y un bloque de capas de atencion completa en la banda tardia (capas 28 a 43 en la seleccion editada). Los pesos estan cuantizados en NVFP4, un esquema de 4 bits con escalas por bloque, y el repositorio incluye metadatos de modelopt. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

La innovacion tecnica de esta variante es la ablacion direccional de rango 1 aplicada capa a capa: para cada capa editada L se calcula `W' = W - alpha * u_L (u_L^T W)` con alpha = 3.5, donde `u_L` es la direccion unitaria de bucle en el espacio de salida de atencion de 4096 dimensiones, estimada como la diferencia de medias entre activaciones durante bucles de repeticion verbatim y durante generacion normal, sobre sesiones de trabajo reservadas. Los tensores editados son BF16 dentro de los shards NVFP4, de modo que la edicion se escribe directamente en los bytes de safetensors sin recuantizar; los expertos NVFP4, escalas, cabeceras e indice quedan intactos y solo difieren los shards 00012 a 00018 respecto a la copia base. Esta variante usa una dosis mas suave de wide_a4 (alpha 4 reducido a 3.5) sobre las mismas 12 capas.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del checkpoint base RED-SNOW 5.3 Flash.
- Razonamiento de contexto largo, con la salvedad de que esta build busca precisamente corregir el fallo de bucle en esa franja.
- Tool calling y function calling: el autor indica que los turnos de control (no afectados por bucles) mantienen intacto el tool calling.
- Terminacion controlada de turnos: la edicion convierte bucles verbatim en cierres de turno limpios en generacion libre en maquina del autor.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades de vision, audio o modo thinking: no disponibles.

## Casos de uso

- Evaluacion de tecnicas de ablacion direccional: sirve como caso de estudio reproducible de edicion de pesos en un checkpoint cuantizado sin recuantizar, comparando el comportamiento con el base en las mismas condiciones.
- Diagnostico de bucles de repeticion en contexto largo: util para equipos que investigan por que un modelo deja de emitir el token de parada y como corregirlo sin reentrenar.
- Generacion libre de turnos largos en asistentes conversacionales: el autor reporta que los bucles verbatim se convierten en finales de turno limpios, lo que reduce el riesgo de respuestas no terminantes en produccion.
- Pipelines con tool calling en los que la parada fiable es critica: al preservarse el tool calling en turnos de control, puede probarse en flujos de agentes donde una respuesta que no termina bloquea el orquestador.
- Investigacion de interpretabilidad: la direccion `u_L` estimada por diferencia de medias entre estados de bucle y estados normales es un artefacto reutilizable para estudiar representaciones internas de parada.
- Base para comparativas A/B de cuantizacion: al mantener intactos expertos, escalas y cabeceras NVFP4, permite aislar el efecto de la edicion BF16 frente a la cuantizacion en si.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente describe una evaluacion cualitativa en generacion libre en la maquina del autor, sin cifras de MMLU, HumanEval, GSM8K ni metricas de repeticion cuantificadas.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 204,5 GB en NVFP4; la inferencia requiere un nodo multi-GPU con al menos esa capacidad agregada, mas margen para KV cache en contexto largo.
- GPU recomendadas: no disponibles de forma explicita; por tamano, se necesita un despliegue multi-GPU de clase H100 o A100 con NVFP4 soportado.
- GPU de consumo: no cabe en ninguna GPU consumer actual por el tamano del checkpoint.
- Opciones de despliegue: no disponibles en la informacion; el formato NVFP4 con escalas y metadatos modelopt sugiere stacks compatibles con cuantizacion NVFP4, sin confirmacion del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Pandoks/rs-abl-red-snow-nvfp4-oproj-wa35 | 161,46 B | no disponible | NVFP4 + edicion BF16 | MIT | Build de diagnostico con ablacion en 12 capas |
| Blackfrost-AI/RED-SNOW-5.3-FLASH-NVFP4 | no disponible | no disponible | NVFP4 | no disponible | Checkpoint base sin edicion; referencia de comparacion directa |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion |

## Limitaciones y advertencias

- Build experimental de diagnostico: el propio autor la describe como no apta para uso general.
- Solo se han editado 12 tensores `o_proj`; cualquier comportamiento fuera de la correccion de bucles es atribuible al checkpoint base y no ha sido revalidado de forma exhaustiva.
- El autor reporta que la edicion preserva tool calling y longitud en turnos de control, pero no se aportan metricas cuantitativas de regresion.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible; se heredan del modelo base.
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingue.
- La estimacion de la direccion `u_L` se hizo sobre sesiones de trabajo reservadas del autor; su generalizacion a otros dominios o idiomas no esta validada.
- Licencia MIT declarada, lo que en principio permite uso comercial, pero al ser una build de diagnostico conviene validar el comportamiento antes de desplegarla.
- Repositorio sin descargas ni likes en el momento de la consulta; no hay evidencia de comunidad que haya reproducido los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pandoks/rs-abl-red-snow-nvfp4-oproj-wa35
- Checkpoint base: https://huggingface.co/Blackfrost-AI/RED-SNOW-5.3-FLASH-NVFP4
- Revision base citada: 8133f8ba249427a0dbe0ee197f8562d2ef109569
- Notas de investigacion completas: no disponibles en la informacion proporcionada
- Paper, blog o demo adicionales: no disponibles
