# roomote/roomote-judgment-gliner

## Resumen

Roomote judgment model (GLiNER, CPU) es un checkpoint de clasificación de texto desarrollado por Roomote (RooCodeInc), el equipo detrás del agente de programación en la nube Roomote. Se trata de un fine-tune de GLiNER 2.5 base, un clasificador de esquemas basado en DeBERTa-v3 con aproximadamente 194 millones de parámetros, que responde a preguntas tipadas (sí/no, elección entre varias opciones, puntuación graduada) sobre un estado de conversación o de tarea. Su función es actuar como "modelo de juicio" dentro de un despliegue autoalojado de Roomote cuando no se dispone ni de GPU ni de un proveedor de juicio alojado.

La relevancia del modelo es eminentemente práctica: Roomote necesita tomar decisiones pequeñas y repetitivas (si una respuesta de un hilo va dirigida al agente, si una tarea debe guardar algo en memoria, en qué modelo debe ejecutarse una tarea delegada, etc.) y este checkpoint las resuelve en cuatro núcleos de CPU, con una latencia p50 de aproximadamente 0,9 segundos. Está entrenado exclusivamente con 3.698 decisiones sintéticas y no ha visto tráfico de producción ni datos de clientes, lo que simplifica su adopción en entornos privados.

El modelo es monolingüe en inglés, tiene licencia Apache 2.0 (heredada del modelo base) y se distribuye en formato safetensors con la librería gliner2. Está pensado para servirse mediante el sidecar de juicio incluido en el fichero compose de autoalojamiento de Roomote (perfil `judgment`), que expone la API de decisiones de la plataforma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador de esquemas GLiNER 2.5 sobre backbone DeBERTa-v3 |
| Parametros totales | 193.581.591 (~194 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Estados truncados a 8.000 caracteres |
| Tipos de cuantizacion | No disponible (repo de 0,8 GB en safetensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint parte de fastino/gliner2.5-base-v1, un modelo GLiNER 2.5 construido sobre un backbone DeBERTa-v3 que funciona como clasificador de esquemas: recibe un texto y una pregunta con etiquetas de opción, y devuelve la respuesta tipada correspondiente. El fine-tune adapta ese clasificador a las ocho decisiones concretas que Roomote plantea a un modelo de juicio (comprobación y destilación de memoria, destinatario de una respuesta, comunicación de tareas, selección de modelo para tareas delegadas, criterios de lanzamiento de canal, tipo de trabajo solicitado y detección de respuestas automáticas de correo). La aprobación automática de llamadas a herramientas queda fuera del alcance y no se le consulta.

El entrenamiento utilizó 3.698 decisiones sintéticas y ningún dato de producción, de clientes ni estado capturado. Cada ejemplo fue redactado por un modelo abierto (DeepSeek V4 Pro) para ajustarse a respuestas objetivo muestreadas y después etiquetado a ciegas por un segundo modelo abierto de otra familia (GLM-5.2); solo se conservó la pregunta cuando ambos coincidían. Se entrenó durante cuatro épocas con una tasa de aprendizaje de 4e-5. No se documentan innovaciones técnicas adicionales como decodificación especulativa ni atención lineal.

## Capacidades

- Clasificación de texto con esquema: responde preguntas tipadas (sí/no, elección entre opciones, puntuación graduada) sobre un estado dado.
- Comprobación de memoria: determina si un turno cerrado contiene algo que merezca guardarse en memoria.
- Destilación de memoria: decide qué debería destilarse en memoria al terminar una ejecución de tarea.
- Detección de destinatario: identifica si una respuesta no mencionada en un hilo va dirigida a Roomote.
- Comunicación de tareas: decide cuándo una tarea en ejecución tiene algo que el usuario debería conocer.
- Enrutamiento de modelos: elige en qué modelo debe ejecutarse una tarea delegada a partir de la petición y de las reglas de enrutamiento del despliegue.
- Criterios de lanzamiento de canal: valora si un mensaje de canal cumple el criterio de respuesta automática.
- Clasificación de tipo de trabajo: distingue si una petición pide una pregunta, un plan o una implementación.
- Detección de autorespuesta de correo: identifica respuestas automáticas en correo entrante.
- Capacidades multilingües: no, el modelo es monolingüe en inglés.
- Capacidades especiales: ninguna adicional documentada (sin visión, audio, tool calling ni modo de razonamiento explícito).

## Casos de uso

- Autoalojamiento de Roomote sin GPU: el modelo actúa como sidecar de juicio en el perfil `judgment` del compose de autoalojamiento, permitiendo activar las decisiones de juicio en un contenedor de cuatro núcleos sin necesidad de GPU ni de proveedor alojado.
- Gestión de memoria de conversaciones largas: integrado en el flujo de un agente, decide qué partes de un turno cerrado merecen persistirse y qué debe destilarse en memoria al acabar una tarea, gracias al truncado controlado a 8.000 caracteres de estado.
- Enrutamiento de tareas entre modelos: a partir de la petición del usuario y de las reglas de enrutamiento del despliegue, selecciona el modelo adecuado para cada tarea delegada, lo que permite optimizar coste y latencia sin intervención manual.
- Moderación de hilos y menciones: determina si una respuesta no mencionada está dirigida al agente, evitando que este reaccione a mensajes que no le conciernen en conversaciones de equipo.
- Triaje de canal y respuestas automáticas: evalúa si un mensaje de canal cumple el criterio de lanzamiento de respuesta automática y filtra autorespuestas de correo entrante antes de que generen acciones.
- Clasificación de intención de peticiones: distingue entre petición de información, de plan o de implementación, lo que sirve para dirigir la petición al flujo de trabajo adecuado (respuesta directa, planificación o edición de código).
- Notificaciones de progreso de tareas: decide cuándo una tarea en ejecución tiene información relevante para el usuario, reduciendo ruido en las notificaciones y mejorando la señal de las alertas.

## Benchmarks y rendimiento

Evaluación sobre un conjunto reservado de 415 decisiones (1.368 preguntas): decisiones sintéticas generadas de la misma forma pero nunca entrenadas, más 44 decisiones reales de un despliegue interno de Roomote etiquetadas de forma independiente. La medición se realizó a través de la ruta de servicio en un contenedor de CPU de cuatro núcleos con un límite de memoria de 12 GB.

| Decision | Accuracy |
|---|---|
| Memory check | 0,950 |
| Memory distillation | 0,946 |
| Reply addressee | 0,965 |
| Task communication | 0,967 |
| Delegated task model | 0,980 |
| Channel launch criteria | 0,953 |
| Work kind | 0,905 |
| Automatic email replies | 1,000 |
| **All synthetic** | **0,958** |
| **Real decisions** | **0,932** |

Latencia por decisión: p50 de aproximadamente 0,9 s y p90 de aproximadamente 2,0 s sobre cuatro núcleos. En decisiones reales queda entre dos y cinco puntos por debajo de las opciones de juicio alojadas de Roomote, principalmente en la comprobación de memoria. Roomote solo actúa sobre un juicio cuando este es seguro y, en caso contrario, mantiene su comportamiento sin modelo de juicio.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, el modelo está diseñado para ejecutarse en CPU.
- Memoria del contenedor de referencia: límite de 12 GB documentado en la evaluación (repo de 0,8 GB en safetensors).
- CPU: se ejecuta en cuatro núcleos; la latencia reportada (p50 0,9 s, p90 2,0 s) corresponde a esa configuración.
- GPU recomendadas: no se documentan; el modelo está orientado a despliegues sin GPU.
- Compatibilidad con GPU de consumo: no documentada explícitamente, aunque por tamaño (~194 M de parámetros) cabría en cualquier GPU de consumo moderna; el autor no aporta requisitos de VRAM para ese caso.
- Opciones de despliegue: sidecar de juicio del fichero compose de autoalojamiento de Roomote (perfil `judgment`), que habla la API de decisiones de Roomote. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y rendimiento: p50 ~0,9 s y p90 ~2,0 s por decisión en cuatro núcleos de CPU. No se publica throughput agregado.

## Comparativa con modelos similares

No se dispone de datos comparativos frente a modelos alternativos de la misma categoría en la información proporcionada. Como referencia, el modelo base declarado es fastino/gliner2.5-base-v1 (GLiNER 2.5 base, también basado en DeBERTa-v3), del cual este checkpoint es un fine-tune especializado. La model card menciona además, sin nombrarlas, las "opciones de juicio alojadas" de Roomote, frente a las cuales este checkpoint queda dos a cinco puntos por debajo en decisiones reales, pero no se ofrecen especificaciones ni métricas de dichas alternativas.

## Limitaciones y advertencias

- Idioma: únicamente inglés.
- Longitud de contexto efectiva: los estados se truncan a 8.000 caracteres, por lo que información más allá de ese límite no se tiene en cuenta.
- Dependencia del formato: las etiquetas de opción forman parte de la pregunta, de modo que decisiones cuya redacción difiera de la de Roomote pueden no transferirse correctamente.
- Alcance limitado: la aprobación automática de llamadas a herramientas queda fuera del modelo y Roomote no se la consulta.
- Datos de entrenamiento sintéticos: el modelo se entrenó solo con 3.698 decisiones sintéticas, sin tráfico real ni datos de clientes; se evaluó además con 44 decisiones reales, donde el rendimiento baja a 0,932 de accuracy frente a 0,958 en el conjunto sintético.
- Rendimiento inferior a las opciones alojadas: en decisiones reales queda dos a cinco puntos por debajo de las alternativas alojadas de Roomote, especialmente en la comprobación de memoria; el sistema mitiga esto actuando solo cuando el juicio es seguro.
- Licencia: Apache 2.0, igual que el modelo base, por lo que no se documentan restricciones adicionales para uso comercial.
- Advertencias de producción: no se documentan sesgos específicos ni tasas de alucinación más allá de las cifras de accuracy reportadas; al ser un clasificador de opciones cerradas, el riesgo de alucinación en texto generativo no aplica del mismo modo que en un modelo generativo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/roomote/roomote-judgment-gliner
- Modelo base: https://huggingface.co/fastino/gliner2.5-base-v1
- Repositorio GitHub de Roomote: https://github.com/RooCodeInc/Roomote
- Perfil GitHub de Roomote: https://github.com/roomote
- Documentación de inferencia de Roomote: https://docs.roomote.dev/models
- Página de modelos de Roomote: https://roomote.dev/models
- Sitio oficial de Roomote: https://roomote.dev/
- Sitio de la comunidad de desarrollo: https://roomote.dev
