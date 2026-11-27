# leemonta9482/esc-assistant-e2b

## Resumen

ESC Assistant E2B es un adaptador LoRA (fusionado y cuantizado) sobre `google/gemma-4-E2B-it`, orientado a la conversion de instrucciones en lenguaje natural a un formulario JSON estructurado. Lo desarrolla el usuario `leemonta9482` y su proposito es actuar como capa de interpretacion en el sistema de gestion de aulas universitarias ESC (관리자 AI 비서, asistente de administracion): el modelo traduce una frase del administrador a una unica linea JSON con los campos normalizados, mientras que el calculo de fechas, la validacion y la aplicacion de cambios quedan en el servidor.

El modelo es deliberadamente acotado: cubre un conjunto cerrado de 18 tareas administrativas y devuelve `unknown` para cualquier peticion fuera de ese dominio. No pretende razonar ni ejecutar acciones, solo extraer y mapear expresiones a campos. Esta especializacion reduce la superficie de error, pero tambien limita su reutilizacion fuera del contexto ESC.

Se publica como version 0.1.0, con licencia Apache-2.0 heredada del modelo base, y con un rendimiento por debajo de los objetivos de calidad declarados por el propio autor. Su interes actual es como ejemplo de pipeline completo (fine-tuning LoRA, fusion, cuantizacion y despliegue en navegador via WebLLM/WebGPU) y como caso de estudio de extraccion estructurada con modelos pequenos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Gemma 4 E2B); adaptador LoRA fusionado y cuantizado |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizacion aplicada tras la fusion del adaptador (formato exacto no disponible); ejecucion via WebLLM |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache-2.0 (segun la licencia del modelo base) |
| Formato de pesos | no disponible (repositorio de 2.8 GB; compatible con WebLLM) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it`, un transformer decoder-only instruction-tuned, sobre el que se aplica un fine-tuning con LoRA. Tras el entrenamiento, el adaptador se fusiona en los pesos base y el resultado se cuantiza para su ejecucion en el navegador mediante WebLLM sobre WebGPU. La tarea se plantea como generacion condicionada: la entrada es una instruccion de sistema mas una linea `관리자: <frase>` (con posible prefijo de estado proporcionado por el servidor) y la salida es una unica linea JSON que respeta un esquema fijo.

El conjunto de entrenamiento consta de 10.517 frases generadas a partir de plantillas con valores ficticios (edificios, aulas, asignaturas, profesores y estudiantes inventados) y variantes de reformulacion producidas con Claude. No se incluyen nombres reales de personas ni instituciones ni registros operativos reales. La evaluacion se realizo sobre 305 frases de prueba no vistas (300 redactadas por una IA imitando el estilo del administrador y 5 de un administrador real) junto con 381 frases contractuales. No se documenta el uso de RLHF o DPO, ni el volumen de tokens de entrenamiento.

## Capacidades

- Conversion de frases administrativas en coreano a un JSON de una sola linea con esquema fijo.
- Clasificacion de intencion dentro de un conjunto cerrado de 18 tareas administrativas.
- Extraccion de campos (fecha, aula, asignatura, profesor, etc.) a partir del texto de la instruccion.
- Rechazo explicito de peticiones fuera de dominio mediante la etiqueta `unknown`.
- Manejo de prefijos de estado inyectados por el servidor en conversaciones multi-turno.
- Generacion con formato estricto: 0,0 % de errores de formato en la evaluacion reportada.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido (no documentado).
- Multilingue: no; entrenado y evaluado unicamente en coreano.

## Casos de uso

- Asistente de administracion de aulas: el modelo recibe la frase del administrador y devuelve el JSON de accion, que el servidor valida y aplica tras confirmacion humana. Adecuado por su salida estricta y su latencia contenida.
- Creacion de reservas de espacios: a partir de "reserva el aula X el martes a las 10", extrae los campos de aula y fecha para que el servidor resuelva la fecha concreta y compruebe disponibilidad.
- Modificacion de horarios de asignaturas: mapea la peticion a los campos de asignatura, profesor y franja horaria, dejando la validacion de solapamientos al backend.
- Cancelacion de eventos programados: identifica la intencion de borrado y los campos identificadores; el servidor aplica la operacion solo tras la pantalla de confirmacion.
- Despliegue en navegador sin backend de inferencia: al ejecutarse con WebLLM sobre WebGPU, permite integrar el asistente en la propia interfaz web del administrador sin enviar texto a un servicio externo.
- Filtrado de peticiones no soportadas: al devolver `unknown` fuera de las 18 tareas, sirve como primera capa de validacion que redirige al usuario a la funcionalidad adecuada.
- Prototipado de pipelines de extraccion estructurada: util como referencia para equipos que quieran replicar el flujo LoRA + fusion + cuantizacion + WebLLM con un modelo pequeno.

## Benchmarks y rendimiento

Evaluacion sobre 305 frases de prueba humanas mas 381 frases contractuales, con este modelo cuantizado:

| Metrica | Valor |
|---|---|
| Exactitud de intencion | 86,4 % |
| Exactitud de campos | 80,3 % |
| Coincidencia completa del formulario | 69,8 % |
| Errores de formato | 0,0 % |
| Errores de riesgo (adicion/modificacion interpretada como borrado) | 0,7 % |
| Latencia media (Chrome WebGPU, RTX 5070 Ti) | 2498 ms |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; el repositorio ocupa 2,8 GB, lo que sugiere un peso cuantizado manejable en GPUs de consumo.
- GPU recomendadas: el autor reporta ejecucion en una RTX 5070 Ti mediante Chrome con WebGPU; no se documentan pruebas en A100, H100 ni otras GPU de datacenter.
- Cabe en GPU de consumo: si, segun la prueba del autor en RTX 5070 Ti; no se especifican modelos inferiores probados.
- Opciones de despliegue: WebLLM sobre WebGPU en navegador (herramienta declarada por el autor). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 2498 ms de media por respuesta en el entorno de prueba indicado. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ESC Assistant E2B | no disponible | no disponible | Extraccion estructurada en coreano (18 tareas) | Apache-2.0 | Hugging Face |
| google/gemma-4-E2B-it (base) | no disponible | no disponible | Modelo general instruction-tuned | Licencia Gemma | Hugging Face |
| Alternativas de extraccion estructurada de proposito general | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Version 0.1.0 de prueba: no alcanza los objetivos declarados por el autor (intencion 97 %, campos 95 %, coincidencia completa 90 %, errores de riesgo por debajo del 0,5 %).
- El fallo mas frecuente es confundir clases o examenes regulares con eventos del dia, lo que puede producir selecciones de fecha incorrectas.
- Solo cubre 18 tareas predefinidas; cualquier otra peticion se etiqueta como `unknown`.
- Entrenado exclusivamente en coreano; no se ha evaluado su comportamiento en castellano ni en otros idiomas.
- Datos de entrenamiento sinteticos con valores ficticios: posible brecha de dominio frente a frases reales de administradores, evidenciada por la diferencia entre el conjunto de prueba y el uso real.
- Riesgo de alucinacion de campos: aunque el formato es estricto, los valores extraidos pueden no corresponder a la intencion real (20 % de inexactitud en campos).
- La salida es solo una propuesta; requiere validacion en servidor y confirmacion del administrador antes de aplicarse. No debe usarse para ejecutar acciones de forma autonoma.
- Sin datos publicados sobre sesgos especificos, comportamiento multi-turno prolongado ni robustez ante entradas adversarias.
- Uso comercial permitido por Apache-2.0, sujeto en la practica a los terminos del modelo base Gemma.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leemonta9482/esc-assistant-e2b
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- WebLLM (herramienta de ejecucion declarada): no disponible en la informacion proporcionada
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
