# SmallAICreator/GRAFT-1B-Agentic

## Resumen

GRAFT-1B-Agentic es un modelo de lenguaje de 1.180.101.632 parámetros (aproximadamente 1,18 mil millones) desarrollado por SmallAICreator / UltraLabs, especializado en uso de herramientas (tool calling y function calling) y diseñado para ejecutarse íntegramente en local, incluso en la CPU de un portátil o en un teléfono. Se trata de un ajuste fino supervisado del modelo base GRAFT-1B sobre conversaciones de uso de herramientas multi-paso, lo que le permite emitir llamadas en el formato estándar `<tool_call>`, leer las respuestas devueltas y continuar el razonamiento a lo largo de varios turnos.

El modelo resuelve un problema concreto: la mayoría de los modelos capaces de usar herramientas de forma fiable tienen decenas de miles de millones de parámetros y requieren GPU. GRAFT-1B-Agentic demuestra que un modelo de 1B, correctamente ajustado, puede seleccionar la herramienta adecuada en la totalidad de las pruebas internas del autor (12/12 frente a 4/12 del modelo base), manteniendo una ventana de contexto de 4096 tokens y un tamaño de fichero cuantizado de unos 970 MB en Q6_K.

La relevancia actual reside en su orientación a despliegue on-device y offline: se distribuye en formato GGUF, es compatible con llama.cpp, LM Studio y PocketPal, y sirve como motor del agente de escritorio GRAFT Code para Windows. La licencia Apache-2.0 facilita su integración comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles de arquitectura del modelo base no disponibles) |
| Parametros totales | 1.180.101.632 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | Q6_K (GGUF distribuido, ~970 MB); otras cuantizaciones no disponibles |
| Idiomas soportados | Ingles (segun model card y metadatos) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repo de 1,9 GB); safetensors del modelo base referenciados en metadatos |

## Arquitectura y entrenamiento

GRAFT-1B-Agentic parte de GRAFT-1B, un modelo que, segun el autor, fue reducido desde un modelo mayor mediante un metodo sin gradientes y en forma cerrada, y posteriormente sometido a procesos de "healing", destilacion y ajuste conversacional. Sobre esa base, la version agentic anade un ajuste fino supervisado (SFT) sobre conversaciones de uso de herramientas multi-paso y de agente, mezclado con datos de chat y de system prompts para preservar la voz conversacional del modelo. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO.

La innovacion tecnica principal no esta en la arquitectura interna (no documentada) sino en el formato de interaccion: el GGUF incorpora una plantilla ChatML consciente de herramientas, de estilo Qwen, con etiquetas `<tools>`, `<tool_call>` y `<tool_response>`. El modelo esta entrenado para emitir llamadas estructuradas, interpretar los resultados devueltos como turnos de usuario envueltos en `<tool_response>` y continuar la tarea. No se documentan tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles con soporte de system prompts.
- Tool calling y function calling en formato estandar `<tool_call>`, con argumentos estructurados.
- Razonamiento multi-paso a lo largo de varios turnos de herramienta: emite llamada, lee resultado y continua.
- Seleccion de herramienta: 12/12 aciertos en la prueba interna del autor (frente a 4/12 del modelo base).
- Cumplimiento de reglas de system prompt: 20/24 comprobaciones internas.
- Respuesta en el idioma del usuario: 10/10 en la prueba interna del autor, aunque el idioma declarado oficialmente es solo ingles.
- Operaciones de sistema de ficheros en el agente GRAFT Code: crear, mover, renombrar, copiar y borrar archivos, y ejecutar comandos y Python.
- Calculo exacto mediante herramientas y busqueda/lectura web a traves de herramientas externas.
- Ejecucion offline en CPU de portatil o telefono.

## Casos de uso

- Agente de escritorio local: integrado en GRAFT Code para Windows, el modelo interpreta peticiones en lenguaje natural ("crea una carpeta y mueve los PDFs ahi") y las traduce en llamadas a herramientas del sistema de ficheros, con confirmacion del usuario antes de cada cambio.
- Automatizacion de tareas de sistema en equipos sin GPU: al ejecutarse en CPU via llama.cpp o LM Studio, permite desplegar un asistente operativo en portatiles de oficina o entornos air-gapped donde no se permite enviar datos a la nube.
- Prototipado rapido de pipelines de function calling: su bajo coste de inferencia y su formato `<tool_call>` estandar lo hacen util para validar esquemas de herramientas y flujos de agente antes de migrar a modelos mayores.
- Asistente de calculo y consulta factual con verificacion: puede delegar operaciones aritmeticas o busquedas en herramientas externas y devolver resultados, reduciendo el riesgo de calculo erroneo si se le fuerza a usar la herramienta.
- Educacion y demos de agentes: su tamano (~970 MB en Q6_K) permite distribuirlo en materiales docentes y ejecutarlo en portatiles de estudiantes para demostrar tool calling real sin infraestructura.
- Integracion en aplicaciones moviles: compatible con PocketPal y otros runners GGUF, posibilita asistentes de accion (crear notas, consultar datos locales) totalmente offline en telefonos.
- Enrutamiento ligero de tareas: puede clasificar peticiones y decidir que herramienta o servicio invocar en un sistema mayor, actuando como primera capa de un pipeline multi-modelo.

## Benchmarks y rendimiento

| Prueba | GRAFT-1B | GRAFT-1B-Agentic |
|---|---|---|
| Seleccion correcta de herramienta (12 prompts) | 4/12 | 12/12 |
| Cumplimiento de reglas de system prompt (24 comprobaciones) | 20/24 | 20/24 |
| Respuesta en el idioma del usuario (10 pruebas) | 10/10 | 10/10 |
| MMLU (5-shot) | no disponible | 39,77 |

Datos procedentes de las comprobaciones internas del autor. No se han publicado resultados de benchmarks estandar adicionales (HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el fichero Q6_K ocupa ~970 MB y puede ejecutarse en RAM de sistema.
- GPU recomendadas: no aplica para el caso de uso previsto; cualquier GPU consumer (por ejemplo, RTX 3060 o superior) puede acelerar la inferencia, pero no es necesaria.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer con 2 GB o mas de VRAM; tambien en CPU y en telefonos.
- Opciones de despliegue: llama.cpp, LM Studio, PocketPal y otras aplicaciones compatibles con GGUF; el autor menciona compatibilidad con endpoints.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GRAFT-1B-Agentic | ~1,18 B | 4096 | Tool calling on-device | Apache-2.0 | GGUF en Hugging Face |
| GRAFT-1B (base) | ~1,18 B | no disponible | Chat general | Apache-2.0 | Hugging Face |
| GRAFT-10B-A2B | no disponible | no disponible | Agente (mayor capacidad) | no disponible | GGUF en Hugging Face |

No se dispone de datos de rendimiento comparativo frente a modelos de terceros de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo de 1B: en ocasiones inventa resultados en lugar de consultar la herramienta, copia texto de ejemplo o llama a herramientas innecesarias.
- Debil en planificacion multi-paso larga; conviene darle una tarea clara cada vez.
- Puede producir hechos incorrectos; el autor recomienda formular preguntas factuales en ingles y verificar cualquier dato importante.
- Idioma declarado oficialmente: solo ingles, aunque en pruebas internas respondio en el idioma del usuario.
- Contexto limitado a 4096 tokens, insuficiente para documentos largos o historiales extensos.
- En JSON, las rutas de Windows con barras invertidas confunden al modelo; deben usarse barras normales.
- GRAFT Code ejecuta comandos reales en el equipo del usuario; deben mantenerse las confirmaciones activadas salvo que se confie plenamente en la tarea.
- Licencia Apache-2.0: permite uso comercial sin restricciones adicionales, pero no se ofrece garantia alguna sobre el modelo.
- No se documentan sesgos especificos ni evaluaciones de seguridad en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SmallAICreator/GRAFT-1B-Agentic
- Modelo base GRAFT-1B: https://huggingface.co/SmallAICreator/GRAFT-1B
- Aplicacion GRAFT Code: https://huggingface.co/SmallAICreator/GRAFT-Code
- Version mayor GRAFT-10B-A2B (GGUF): https://huggingface.co/SmallAICreator/GRAFT-10B-A2B-GGUF
