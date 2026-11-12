# Denovarix/Denovarix-Writer-2B

## Resumen

Denovarix Writer 2B es un modelo de generacion de texto de 2.000 millones de parametros desarrollado por Denovarix Technologies LLP (Bengala Occidental, India) para su sistema operativo DNX OS. Esta especializado en reescritura y resumen de texto empresarial: cambia el tono de un mensaje (profesional, informal, cortes), lo acorta, lo hace mas claro, lo resume en vinetas y convierte hinglish (mezcla de hindi e ingles) en ingles. Segun el autor, esta disenado para preservar numeros, fechas y nombres tal como aparecen en el texto original.

El modelo se presenta como el motor detras de las herramientas de escritura de DNX OS, concretamente los botones de reescritura de DNX Mail y las acciones "haz esto mas profesional" y "resume" del asistente. Esta optimizado para ejecutarse en la CPU de un PC de oficina x86 mediante llama.cpp, con una latencia declarada de uno a tres segundos, y no se considera todavia lo bastante rapido en telefonos.

Un dato critico para la evaluacion: los pesos no estan publicados en Hugging Face. La model card indica explicitamente que el modelo se distribuye dentro de DNX OS, cuya beta abre en diciembre de 2026, y que el acceso para evaluacion o licencia requiere contacto directo con la empresa. Por tanto, esta ficha se basa unicamente en la informacion declarada por el autor y no en resultados verificables de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de lenguaje tipo transformer, inferencia via llama.cpp) |
| Parametros totales | 2 mil millones (2B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | cuantizacion que reduce el modelo a aproximadamente 1,3 GB (formato concreto no disponible) |
| Idiomas soportados | ingles (en), hindi (hi), bengali (bn) |
| Licencia | no disponible |
| Formato de pesos | no disponible (pesos no publicados; inferencia mediante llama.cpp) |

## Arquitectura y entrenamiento

La informacion publicada no detalla la arquitectura interna mas alla de que se trata de un modelo de 2B parametros ejecutable con llama.cpp, lo que implica pesos en formato compatible con GGUF para la inferencia en CPU. No se especifican el tipo de transformer, el mecanismo de atencion, la longitud de contexto ni si incorpora innovaciones como decodificacion especulativa o atencion lineal.

El entrenamiento se realizo sobre aproximadamente 6.500 ejemplos de reescritura generados por un modelo profesor de mayor tamano, segun declara el autor. No se indica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El enfoque de destilacion desde un profesor mas grande es coherente con el objetivo de un modelo pequeno y especializado en una tarea acotada, pero la ausencia de detalles impide evaluar la calidad del proceso.

## Capacidades

- Reescritura de texto con cambio de tono: profesional, informal y cortes.
- Acortamiento de mensajes manteniendo el contenido esencial.
- Clarificacion de textos confusos o mal redactados.
- Resumen en formato de vinetas.
- Conversion de hinglish a ingles.
- Preservacion de numeros, fechas y nombres durante la reescritura, segun declara el autor.
- Generacion de texto orientada a tareas de escritura empresarial (correo, documentacion).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Reescritura de correos en DNX Mail: el modelo aplica botones de cambio de tono (profesional, informal, cortes) sobre el borrador del usuario, con latencia de uno a tres segundos en CPU x86, adecuado para un flujo de escritura interactivo.
- Resumen de hilos de correo o documentos: genera resumenes en vinetas de comunicaciones empresariales, util para reducir el tiempo de lectura en bandejas de entrada con mensajes largos.
- Normalizacion de hinglish a ingles: equipos en India que redactan en mezcla de hindi e ingles pueden convertir sus mensajes a ingles estandar antes de enviarlos a clientes o documentacion formal.
- Clarificacion de textos internos: reescritura de notas, actas o mensajes de Slack/Teams que resultan ambiguos, manteniendo cifras y nombres propios intactos.
- Asistencia de escritura integrada en el sistema operativo: al ejecutarse en CPU sin GPU dedicada, encaja en PCs de oficina estandar donde no se justifica hardware de aceleracion.
- Herramienta de productividad para soporte y ventas: acortar y profesionalizar respuestas a clientes antes de enviarlas, con la garantia declarada de no alterar datos numericos ni fechas.
- Procesamiento por lotes en local: al no requerir conexion a la nube, puede procesar documentos sensibles dentro de la red corporativa, siempre que se obtenga acceso a los pesos mediante licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el escenario declarado (inferencia en CPU); en GPU, una cuantizacion de aproximadamente 1,3 GB cabria en tarjetas con 2-4 GB de memoria, aunque el autor no documenta despliegue en GPU.
- GPU recomendadas: no disponibles; el modelo esta optimizado para CPU x86.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano cuantizado de aproximadamente 1,3 GB, pero no esta documentado por el autor.
- Opciones de despliegue: llama.cpp (unica via declarada); vLLM, TGI u Ollama no estan confirmados.
- Latencia: uno a tres segundos por operacion en un procesador de escritorio x86, segun el autor.
- Throughput: no disponible.
- Plataformas: x86 PC; el autor indica que todavia no es lo bastante rapido en telefonos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| Denovarix Writer 2B | 2B | no disponible | en, hi, bn | no disponible | no publicados (solo dentro de DNX OS) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria (2B parametros, especializados en reescritura y resumen, ejecutables en CPU) en la documentacion proporcionada, ni de datos de rendimiento que permitan establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Pesos no publicados: no es posible descargar, ejecutar ni evaluar el modelo de forma independiente; el acceso requiere contacto comercial con Denovarix.
- Licencia no especificada: se desconoce si el uso comercial esta permitido y bajo que condiciones.
- Dataset de entrenamiento muy reducido (aproximadamente 6.500 ejemplos) y generado por un modelo profesor, lo que puede limitar la diversidad de estilos y aumentar el riesgo de reproducir sesgos o errores del profesor.
- Riesgo de alucinacion: aunque el autor afirma que preserva numeros, fechas y nombres, no hay evaluacion independiente que lo confirme; en tareas de reescritura el riesgo de alterar datos es relevante.
- Cobertura linguistica limitada a ingles, hindi y bengali; no hay soporte declarado de castellano ni de otras lenguas.
- Longitud de contexto desconocida, lo que impide garantizar el comportamiento en documentos largos.
- Rendimiento no verificado en moviles; el autor reconoce que no es lo bastante rapido en telefonos.
- Ausencia total de benchmarks publicados, lo que dificulta comparar su calidad con alternativas.
- Modelo muy reciente y sin traccion en la comunidad (0 descargas, 0 likes en el momento de la consulta), sin senales externas de validacion.

## Enlaces

- Hugging Face: https://huggingface.co/Denovarix/Denovarix-Writer-2B
- Sitio web de Denovarix: https://denovarix.com
- Pagina de DNX OS: https://denovarix.com/dnx-os/
- Programa beta de DNX OS: https://denovarix.com/beta/
- Contacto: hello@denovarix.com
