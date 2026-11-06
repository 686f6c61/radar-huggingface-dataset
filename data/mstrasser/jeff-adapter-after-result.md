# mstrasser/jeff-adapter-after-result

## Resumen

jeff-adapter-after-result es un adaptador LoRA de tipo PEFT publicado por el usuario mstrasser sobre el modelo base jeff-base v1.4, un fine-tune de Qwen3.5-0.8B orientado a toma de decisiones. El adaptador resuelve un problema muy concreto dentro de pipelines de agentes: determinar qué debe hacer el agente después de que una herramienta devuelva un resultado, eligiendo entre cinco acciones posibles (continuar, reintentar, cambiar de enfoque, detener o escalar a una persona). No genera texto libre, sino que devuelve una distribución de probabilidad calibrada sobre las opciones nombradas en una única pasada forward.

El modelo se enmarca en la familia Jeff, una propuesta de "modelo de decisión" pequeño y abierto que separa la lógica de control del agente de la generación de lenguaje. Al recibir contexto estructurado (aplicación, fecha, herramientas disponibles, límite de reintentos, objetivo del usuario, plan, pasos previos, última llamada y último resultado), clasifica la siguiente acción con etiquetas fijas. Esto elimina la necesidad de parsear texto generado y facilita la integración en bucles de agente con garantías de formato.

La relevancia actual del adaptador reside en su enfoque de calibración explícita: publica umbrales de confianza con precisión y cobertura asociadas, lo que permite decidir cuándo confiar en la predicción automática y cuándo derivar a un humano. El repositorio es muy pequeño (0,1 GB), la licencia es Apache 2.0 y el idioma declarado es inglés. El adaptador solo carga sobre la revisión v1.4 exacta de jeff-base, ya que el motor rechaza adaptadores entrenados sobre otras bases.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder jeff-base v1.4 (fine-tune de Qwen3.5-0.8B) |
| Parámetros totales | no disponible (adaptador LoRA; el modelo base es de 0,8B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |
| Modelo base | mstrasser/jeff-base, revisión v1.4 |
| Tarea (pipeline) | text-classification (clasificación de elección entre 5 etiquetas) |
| Identificador de adaptador | jeff.agents.after-result, versión 1.4.0 |
| Fecha de entrenamiento | 2026-10-25 |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El adaptador es un LoRA entrenado sobre jeff-base v1.4, que a su vez es un fine-tune de Qwen3.5-0.8B. La arquitectura subyacente es, por tanto, un transformer decoder de aproximadamente 0,8 mil millones de parámetros, sobre el que se aplica una capa de adaptación de bajo rango. La innovación principal no está en la arquitectura, sino en la formulación de la tarea: en lugar de generar texto, el modelo recibe un contexto estructurado en campos (app, today, tools, retry_limit, goal, plan, steps_so_far, latest_call, latest_result) y produce una probabilidad calibrada para cada una de las cinco etiquetas de decisión en una sola pasada forward.

El entrenamiento se realizó el 25 de octubre de 2026 y se evaluó sobre un conjunto de test interno generado por el mismo generador que los datos de entrenamiento (2.000 filas), con una precisión del 100,0 %, y sobre un segundo test interno de casos no vistos (sin número de filas registrado), también con 100,0 %. La calibración se midió sobre 2.000 filas, con un umbral de confianza de 0,702, precisión del 100,0 % y cobertura del 100,0 %. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO. La model card advierte que los tests de tipo "generator" miden menos que un test público o real, por lo que las cifras deben interpretarse con cautela.

## Capacidades

- Clasificación de la siguiente acción de un agente tras recibir el resultado de una herramienta, con cinco etiquetas: `continue`, `retry`, `change_approach`, `stop` y `escalate`.
- Salida de probabilidad calibrada por opción en una única pasada forward, sin texto generado que parsear.
- Distinción entre fallos temporales (timeout, servicio no disponible, rate limit) y fallos por error propio del agente (formato incorrecto, identificador erróneo, búsqueda mal escrita).
- Gestión del límite de reintentos configurado por la aplicación: cuando se agota, la acción recomendada pasa a `escalate`.
- Detección de cuándo el objetivo está cumplido o es irrealizable, recomendando `stop` para reportar al usuario.
- Detección de situaciones que requieren intervención humana: permiso denegado, sesión caducada, aprobación pendiente.
- Manejo de resultados parciales de listas, recomendando `continue` para obtener la siguiente parte.
- Integración con el SDK de Jeff (`jeff.Jeff.local(["after-result"])`) y con el motor de la familia Jeff, que valida que el adaptador coincida con la revisión del modelo base.
- No soporta tool calling generativo, ni visión, ni audio, ni modo thinking; su función es exclusivamente la clasificación de decisión descrita.

## Casos de uso

- Bucles de agente con herramientas: tras cada llamada a una API o función, el adaptador decide si continuar con el siguiente paso del plan, reintentar la misma llamada o cambiar de estrategia, evitando bucles infinitos y errores en cascada.
- Gestión de reintentos con política configurable: la aplicación define en `retry_limit` su regla (por ejemplo, "reintentar como máximo 3 veces") y el modelo respeta ese límite, escalando a una persona cuando se agota.
- Enrutado a intervención humana: en flujos con permisos, autenticación o aprobaciones, el modelo detecta cuándo el agente no puede resolver el problema y recomienda `escalate`, reduciendo intentos fallidos innecesarios.
- Automatización de atención al cliente multi-paso: el agente consulta pedidos, facturas o estado de envío mediante herramientas y el adaptador decide si ya tiene la respuesta para el usuario o si debe seguir consultando.
- Corrección de llamadas mal formadas: cuando una herramienta devuelve un error de validación por un valor en formato incorrecto o un identificador que no coincide, el modelo recomienda `change_approach` para corregir la llamada o usar otra herramienta.
- Orquestación de pipelines de datos con paginación: ante resultados parciales de listas, el adaptador indica `continue` para recuperar la siguiente página hasta completar el objetivo.
- Control de calidad en agentes de producción: la probabilidad calibrada y el umbral de 0,702 permiten registrar decisiones de baja confianza para revisión posterior o para activar una salvaguarda humana.

## Benchmarks y rendimiento

| Test | Filas | Precisión |
|---|---:|---:|
| Test interno (generator) | 2.000 | 100,0 % |
| Segundo test interno de casos no vistos (generator) | no registrado | 100,0 % |

| Función | Umbral | Precisión | Cobertura | Filas de calibración |
|---|---:|---:|---:|---:|
| `next` | 0,702 | 100,0 % | 100,0 % | 2.000 |

No se han publicado resultados de benchmarks públicos (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las cifras anteriores proceden exclusivamente de tests internos generados por el mismo generador que los datos de entrenamiento, lo que limita su valor como indicador de generalización.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,1 GB; el modelo base jeff-base v1.4 es de aproximadamente 0,8B parámetros, por lo que el conjunto completo es muy ligero.
- VRAM estimada para inferencia en fp16: en torno a 1,6-2 GB para el modelo base más el adaptador; en cuantización de 8 bits, aproximadamente 1 GB; en 4 bits, por debajo de 1 GB (estimaciones orientativas, no confirmadas en la información disponible).
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y cualquier GPU con 4 GB o más de VRAM.
- Puede ejecutarse en CPU para cargas de baja concurrencia, dado el reducido tamaño del modelo base.
- Opciones de despliegue: el adaptador está diseñado para el motor y SDK propios de Jeff (`jeff.Jeff.local`), disponibles en github.com/firelex/jeff; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput: no disponibles. Al tratarse de una clasificación de una sola pasada forward sobre un modelo de 0,8B, se espera una latencia baja, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La propuesta de "modelo de decisión" de la familia Jeff no tiene equivalentes directos documentados en esta ficha. Como referencia de tamaño, el modelo base (Qwen3.5-0.8B) se sitúa en la categoría de modelos sub-1B, pero no se aportan datos de rendimiento comparativo con alternativas.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| jeff-adapter-after-result (sobre jeff-base v1.4) | 0,8B (base) + LoRA | no disponible | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El adaptador solo carga sobre la revisión v1.4 exacta de jeff-base; el motor rechaza adaptadores entrenados sobre otras bases, lo que limita la portabilidad.
- Los resultados de precisión del 100,0 % proceden de tests internos generados por el mismo generador que los datos de entrenamiento; la propia model card advierte que este tipo de test mide menos que un test público o real.
- No se han publicado evaluaciones sobre benchmarks públicos ni sobre datos reales retenidos, por lo que la generalización a dominios distintos del de entrenamiento es incierta.
- El idioma soportado es únicamente inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- La tarea está restringida a la selección de la siguiente acción tras un resultado de herramienta; no sirve para seleccionar una herramienta concreta desde un menú (la model card remite a otra función para ese caso).
- Riesgo de alucinación no aplica en el sentido generativo (no produce texto libre), pero sí existe riesgo de clasificación errónea en situaciones ambiguas o fuera de la distribución de entrenamiento.
- La calibración publicada (umbral 0,702, precisión y cobertura del 100,0 %) se midió sobre el mismo conjunto de calibración de 2.000 filas; no hay evidencia de que se mantenga en producción.
- No se documentan sesgos conocidos, pero al ser un fine-tune sobre datos generados internamente, puede heredar sesgos del generador y del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el adaptador depende del modelo base jeff-base, cuyas condiciones de uso deben verificarse por separado.
- El ecosistema es incipiente: los paquetes del SDK pueden no estar aún en PyPI y requieren instalación desde el repositorio de GitHub.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/mstrasser/jeff-adapter-after-result
- Modelo base: https://huggingface.co/mstrasser/jeff-base
- Página de catálogo: https://jeffhub.ai/catalogue/jeff.agents.after-result
- Repositorio de código, servidor y SDK: https://github.com/firelex/jeff
- Guía de instalación del SDK: https://jeffhub.ai/docs/sdk/install
