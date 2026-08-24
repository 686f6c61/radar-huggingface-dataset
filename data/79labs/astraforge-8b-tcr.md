# 79Labs/astraforge-8b-TCR

## Resumen

`astraforge-8b-TCR` es un adaptador LoRA desarrollado por 79Labs sobre el modelo base `meta-llama/Llama-3.1-8B-Instruct`. Está diseñado para hacer que los asistentes que usan herramientas sean más fiables: seleccionar la herramienta correcta de un catálogo grande, pedir parámetros faltantes, confirmar antes de actuar y responder únicamente a partir de los documentos proporcionados en un contexto RAG. El adaptador ocupa unos 160 MB y el modelo completo mantiene los 8.000 millones de parámetros del base.

La relevancia de este modelo radica en que aborda un problema crítico en la producción de agentes: la fiabilidad del tool-calling y la evitación de alucinaciones cuando se usa recuperación. Sus resultados propios muestran una mejora sustancial en la correcta selección de herramientas (de 0,59 a 0,90) y en la confirmación previa a la acción (de 0,00 a 0,89) frente a su base. No mejora el razonamiento general (GSM8K heredado) y presenta defectos documentados en la narración en voz de máquina y en la generalización a sintaxis de llamada externa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3.1-8B-Instruct) con adaptador LoRA |
| Parametros totales | 8B (modelo base) + 160 MB (adaptador LoRA) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128K (heredado del modelo base; no especificado en la documentación) |
| Tipos de cuantizacion | 4-bit (reportado en inferencia), otros segun el modelo base |
| Idiomas soportados | Ingles |
| Licencia | llama3.1 |
| Formato de pesos | safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador LoRA se aplica con rango r=16 sobre todas las proyecciones de atención y MLP del modelo base. El entrenamiento consistió en una época sobre 100.000 filas de un corpus sintético agéntico que cubre tool calling, elicitation de parámetros, confirmación antes de llamada, RAG, ReAct y guardrails. No se reporta el uso de RLHF o DPO. El mejor loss de evaluación fue 0,1530 y el entrenamiento tardó 23 horas y 27 minutos en una única unidad GB10.

La innovación principal es el enfoque en la disciplina de confirmación: el modelo aprende a preguntar antes de ejecutar acciones, algo que el modelo base no hace (0,00 en el benchmark de confirmación). También se entrena para no recitar información ausente en los documentos RAG, logrando un 0% de recitado de hechos no presentes.

## Capacidades

- Selección de herramientas correcta y con llamadas válidas al esquema en un 90% de los casos (benchmark propio).
- Confirmación previa a la ejecución de acciones en un 89% de los casos, una capacidad que no existe en el modelo base.
- Elicitación de parámetros faltantes: pregunta por los datos necesarios antes de completar una llamada.
- RAG grounding: responde solo con la información contenida en los documentos proporcionados, identifica el documento usado y admite que no encuentra un dato cuando no existe.
- Soporte de ReAct y guardrails para control de flujo.
- No mejora el razonamiento matemático o lógico general (GSM8K heredado del base).
- Capacidades multilingües: no disponibles, solo inglés.

## Casos de uso

- **Atención al cliente automatizada**: el modelo puede gestionar conversaciones multi-turno que requieren acceso a herramientas (CRM, bases de datos) y pide confirmación antes de ejecutar acciones como cambios de cuenta o reservas. Su capacidad de confirmación previa reduce errores costosos.
- **Automatización de flujos empresariales**: en procesos de varios pasos (creación de pedidos, actualización de registros), el modelo confirma cada paso antes de ejecutarlo, lo que lo hace adecuado para entornos de producción donde la auditoría es clave.
- **RAG con citación de fuentes**: puede responder preguntas sobre documentación corporativa o técnica, indicando el documento de donde extrae la información y negándose a responder si el dato no está presente.
- **Agentes de control de sistemas**: para ejecutar comandos o llamadas API en infraestructura crítica, el modelo puede pedir confirmación al usuario antes de lanzar la acción, reduciendo el riesgo de errores.
- **Generación de código con tool calling**: integrado en IDEs o pipelines de CI/CD, el modelo puede seleccionar la herramienta adecuada (por ejemplo, ejecutar un test o formatear código) y confirmar antes de ejecutar.
- **Automatización de reservas y citas**: en sistemas de gestión de calendario o reservas, el modelo puede pedir los parámetros necesarios (fecha, hora, número de personas) y confirmar la acción final.
- **Soporte técnico con diagnóstico**: el modelo puede consultar herramientas de diagnóstico, pedir datos de sistema faltantes y confirmar antes de ejecutar acciones de reparación.

## Benchmarks y rendimiento

Los resultados son declarados por el autor en la model card y no han sido verificados de forma independiente. Se basan en un benchmark interno con N=100 para las métricas de agentes y N=60 para RAG.

| Modelo | GSM8K | Tool-correct | Confirmed-first |
|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 0,760 | 0,590 | 0,000 |
| **astraforge-8b-TCR** | 0,750 | **0,900** | **0,890** |
| astraforge-70b-TCR | 0,930 | 0,810 | 0,940 |
| gemma-4-E4B-TCR | 0,760 | 0,810 | 0,000 |

En RAG grounding (N=60, multi-documento):

| Eje | Puntuación |
|---|---|
| Indica el valor que el documento contenía | 0,983 |
| Nombra el documento que usó | 1,000 |
| Dice que no puede encontrarlo cuando falta el dato | 1,000 |
| Recita el dato ausente | 0,000 |

En la prueba de aplicación real con 105 herramientas y 100 conversaciones aleatorias, el 90% completaron todas las invariantes: nunca nombró una herramienta o clave de parámetro incorrecta (100%), nunca ejecutó sin permiso explícito (100%), canceló correctamente (12/12), aplicó correcciones (9/9) y retomó tareas aparcadas (16/16). La latencia mediana por turno fue de 1,8 s en 4-bit en una GB10.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización 4-bit, el modelo base de 8B requiere aproximadamente 6-7 GB de VRAM; en 8-bit ~8-10 GB; en FP16 ~16 GB. El adaptador LoRA añade solo 160 MB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090, A10, A100. El adaptador se puede cargar sobre el modelo base en cualquier GPU compatible.
- En CPU es viable con llama.cpp y cuantización 4-bit, aunque la latencia será mayor.
- Despliegue: vLLM (soporta LoRA), llama.cpp, Ollama, TGI (soporta PEFT).
- Latencia: mediana de 1,8 s por turno en 4-bit en una GB10 (reportada por el autor).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | tool_correct | confirmed_first | GSM8K | Licencia |
|---|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 8B | 128K | 0,590 | 0,000 | 0,760 | llama3.1 |
| **astraforge-8b-TCR** | 8B + LoRA | 128K | 0,900 | 0,890 | 0,750 | llama3.1 |
| astraforge-70b-TCR | 70B | 128K (heredado) | 0,810 | 0,940 | 0,930 | llama3.3 |
| gemma-4-E4B-TCR | 4B (E4B) | no disponible | 0,810 | 0,000 | 0,760 | no disponible |

Nota: astraforge-70b-TCR usa licencia llama3.3 y gemma-4-E4B-TCR no especifica licencia en la información disponible.

## Limitaciones y advertencias

- **Narración en voz de máquina**: en peticiones de múltiples herramientas, el modelo abre su respuesta con frases como "Step 1: ..." en un 40,8% de los turnos con un catálogo limpio de 105 herramientas. No debe usarse para generar el texto visible al usuario en flujos de herramientas; se recomienda renderizar ese texto desde el esquema de la herramienta por código.
- **No generaliza a sintaxis de llamadas externas**: en BFCL v4 `simple_python` (Prompt mode) obtiene un 37,50%, frente a 51,00% del modelo de 70B. La mayoría de los fallos son `ast_decoder:decoder_failed` (198 de 250), es decir, emite la lista de argumentos sin el nombre de la función.
- **No mejora el razonamiento**: GSM8K queda en 0,75, prácticamente igual al base (0,76). No debe usarse como modelo de razonamiento general.
- **Sesgos del modelo base**: como adaptador, hereda los sesgos de Llama-3.1-8B-Instruct, que pueden incluir sesgos sociales o culturales.
- **Riesgo de alucinación**: aunque el RAG grounding es alto, en contextos fuera de RAG el modelo puede alucinar como cualquier LLM.
- **Restricciones de licencia**: la licencia llama3.1 permite uso comercial, pero está sujeta a los términos de la licencia de Meta para Llama 3.1 (incluye límites de uso en determinadas aplicaciones y requisitos de atribución).

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/79Labs/astraforge-8b-TCR)
- [Modelo hermano astraforge-70b-TCR](https://huggingface.co/79Labs/astraforge-70b-TCR)
- [Organización 79Labs en HuggingFace](https://huggingface.co/79Labs)
- [Sitio web de AstraForge (plataforma de ejecución)](https://astraforge.dev/)

No se han encontrado papers, repos de código ni demos adicionales en la búsqueda web.</think>## Resumen

`astraforge-8b-TCR` es un adaptador LoRA desarrollado por 79Labs sobre el modelo base `meta-llama/Llama-3.1-8B-Instruct`. Está diseñado para hacer que los asistentes con herramientas sean más fiables: seleccionar la herramienta correcta de un catálogo grande, pedir los parámetros que faltan, confirmar antes de actuar y responder únicamente a partir de los documentos proporcionados en un contexto RAG. El adaptador ocupa unos 160 MB y el modelo completo mantiene los 8.000 millones de parámetros del base.

La relevancia de este modelo radica en que aborda un problema crítico en la producción de agentes: el control del tool-calling y la confirmación previa a la ejecución. Sus resultados reportados muestran una mejora sustancial en la selección correcta de herramientas (de 0,59 a 0,90) y en la confirmación antes de actuar (de 0,00 a 0,89) frente a su base. No mejora el razonamiento general (GSM8K queda igual) y presenta defectos documentados en la narración en voz alta y en la generalización a sintaxis de llamadas externas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3.1-8B-Instruct) con adaptador LoRA |
| Parametros totales | 8B (modelo base) + 160 MB (adaptador LoRA) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128K (heredado del modelo base; no especificado en la documentación) |
| Tipos de cuantizacion | 4-bit (reportado en inferencia), otros segun el modelo base |
| Idiomas soportados | Ingles |
| Licencia | llama3.1 |
| Formato de pesos | safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador LoRA se aplica con r=16 sobre todas las proyecciones de atención y MLP del modelo base. El entrenamiento consistió en una época sobre 100.000 filas de un corpus sintético agéntico que cubre tool calling, elicitation de parámetros, confirmación antes de la llamada, RAG, ReAct y guardrails. No se reporta el uso de RLHF o DPO. El mejor loss de evaluación fue 0,1530 y el entrenamiento tardó 23 horas y 27 minutos en una única unidad GB10.

La innovación principal es la incorporación de la disciplina de confirmación previa: el modelo aprende a preguntar antes de ejecutar acciones, algo que el modelo base no hace (0,00 en confirm_first). También se entrena para no responder con información ausente en los documentos RAG, logrando un 0% de recitación de hechos no presentes.

## Capacidades

- Selección de herramientas con llamadas válidas de esquema en el 90% de los casos (benchmark propio).
- Confirmación previa a la ejecución de acciones en el 89% de los casos, capacidad ausente en el modelo base.
- Elicitación de parámetros faltantes: pide los datos incompletos antes de fabricar una llamada.
- RAG grounding: responde solo con los documentos proporcionados, nombra la fuente usada y niega cuando el dato no existe.
- Soporte de ReAct y guardrails para control de flujo.
- No mejora el razonamiento general (GSM8K heredado del base).
- Solo idioma inglés.

## Casos de uso

- **Atención al cliente automatizada**: un asistente puede gestionar conversaciones multi-turno que requieren herramientas (CRM, bases de datos) y pedir confirmación antes de ejecutar cambios de cuenta o reservas, reduciendo errores costosos.
- **Asistentes de flujos empresariales**: en procesos de varios pasos (creación de pedidos, aprobaciones), el modelo confirma cada paso antes de ejecutarlo, lo que facilita la auditoría y el control.
- **RAG con citación de fuentes**: puede responder consultas sobre documentación corporativa indicando el documento de origen y negándose a responder si el dato no está presente.
- **Agentes de control de sistemas**: para ejecutar comandos o llamadas API en entornos críticos, el modelo puede confirmar antes de actuar, reduciendo el riesgo de operaciones no deseadas.
- **Generación de código con tool calling**: en IDEs o pipelines de CI, selecciona la herramienta adecuada (ejecutar un script, formatear código) y valida la llamada antes de ejecutarla.
- **Automatización de reservas y citas**: gestiona calendarios o reservas pidiendo los parámetros necesarios (fecha, hora, número de personas) y confirmando la acción.
- **Diagnóstico técnico asistido**: consulta herramientas de diagnóstico y pide datos de sistema faltantes antes de ejecutar acciones de diagnóstico.

## Benchmarks y rendimiento

Los resultados son declarados por el autor en la model card y no han sido verificados de forma independiente. Se basan en un benchmark interno de N=100 para las métricas de agentes y N=60 para RAG.

| Modelo | tool_correct | confirmed_first | GSM8K |
|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 0,590 | 0,000 | 0,760 |
| **astraforge-8b-TCR** | **0,900** | **0,890** | 0,750 |
| astraforge-70b-TCR | 0,810 | 0,940 | 0,930 |
| gemma-4-E4B-TCR | 0,810 | 0,000 | 0,760 |

Resultados de RAG grounding (N=60, multi-documento):

| Metrica | Puntuacion |
|---|---|
| Indica el valor que el documento contenia | 0,983 |
| Nombra el documento que uso | 1,000 |
| No encuentra el dato cuando no esta presente | 1,000 |
| Recita el hecho ausente | 0,000 |

En una aplicacion real con 105 herramientas y 100 conversaciones aleatorias, el 90% completaron todas las invariantes: nunca nombraron una herramienta o parametro incorrecto (100%), nunca ejecutaron antes de permiso explicito (100%), cancelaron correctamente (12/12), aplicaron correcciones (9/9) y retomaron tareas aparcadas (16/16). La mediana de latencia por turno fue 1,8 s en 4-bit en una GB10.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion 4-bit, el modelo base de 8B requiere aproximadamente 6-7 GB de VRAM; en 8-bit unos 8-10 GB; en FP16 unos 16 GB. El adaptador LoRA anade solo 160 MB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090, A10, A100. El adaptador puede cargarse sobre el modelo base en cualquier GPU compatible.
- En CPU con llama.cpp y cuantizacion 4-bit puede ejecutarse, aunque la latencia sera mayor.
- Despliegue: vLLM (soporta LoRA), TGI (soporta PEFT), llama.cpp, Ollama.
- Latencia: mediana de 1,8 s por turno en 4-bit en una GB10 (reportada por el autor).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | tool_correct | confirmed_first | GSM8K | Licencia |
|---|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 8B | 128K | 0,590 | 0,000 | 0,760 | llama3.1 |
| **astraforge-8b-TCR** | 8B + LoRA | 128K | 0,900 | 0,890 | 0,750 | llama3.1 |
| astraforge-70b-TCR | 70B | 128K (heredado) | 0,810 | 0,940 | 0,930 | llama3.3 |
| gemma-4-E4B-TCR | 4B (E4B) | no disponible | 0,810 |
