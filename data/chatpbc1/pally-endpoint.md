# chatpbc1/pally-endpoint

## Resumen

Pally (Pally-1.7B) es un modelo de lenguaje de 1.700 millones de parámetros orientado a consultoría de negocio, desarrollado por ChatPBC Labs. La ficha que se documenta aquí corresponde al repositorio de endpoint `chatpbc1/pally-endpoint`, que no declara pipeline, licencia, idiomas ni especificaciones propias; toda la información técnica disponible procede del model card de la familia, publicado en el repositorio de pesos `chatpbc1/Pally`, y de ahí se toma como referencia. El modelo no compite en capacidad general, sino que se posiciona como un asistente pequeño, ejecutable en una sola GPU de consumo o en CPU, especializado en métricas de unidad de negocio.

Su rasgo diferencial no es la red neuronal, sino el entorno de ejecución que la envuelve. Cuando la pregunta implica dinero, márgenes, meses o ratios, Pally emite pasos aritméticos visibles con el marcador `[calc: ...]`; un evaluador AST en sandbox, no el modelo, ejecuta cada expresión y sustituye el resultado real antes de mostrar la respuesta. En modo System-2 el runtime comprueba cada marcador `[calc:]` y `[verify:]`, y reenvía las expresiones fallidas al modelo para que revise su respuesta, hasta un máximo de 8 iteraciones. Esta separación entre generación de texto y cálculo verificable es lo que hace relevante al modelo en un segmento, el de los LLM pequeños para finanzas operativas, donde la aritmética inventada es el fallo más costoso.

El tercer elemento es POWER MODE (ronda `cortex1-v8`): las reglas de comportamiento del modelo viven en ficheros de configuración externos y versionados (constitution, tool_rules, metacognitive_rules, refusal_rules y playbook) que el propio modelo puede reescribir en tiempo de inferencia mediante un canal sandboxed `[cortex_edit]`. Cada edición se registra, se limita, se persiste y es revertible. Los pesos se publican bajo Apache-2.0 según el model card, si bien el repositorio de endpoint no especifica licencia propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el model card no especifica la arquitectura base; se describe como modelo de lenguaje de 1,7B parámetros con runtime externo de verificación) |
| Parámetros totales | 1.700 millones (1,7B) |
| Parámetros activos | no aplica (no se describe como MoE en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (no se publican variantes GGUF, AWQ, GPTQ ni bitsandbytes) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 para los pesos según el model card de `chatpbc1/Pally`; el repositorio `chatpbc1/pally-endpoint` no declara licencia |
| Formato de pesos | no disponible (se cargan mediante `transformers` con `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)`) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura de red (tipo de transformer, atención, número de capas, dimensiones ocultas o vocabulario), ni el volumen o composición del dataset de entrenamiento, ni si hubo fases de RLHF o DPO. Lo que sí se documenta es un componente de entrenamiento específico: el «v7 digit-binding training», orientado a que el modelo utilice los dígitos concretos del usuario en lugar de ejemplos numéricos memorizados. El model card reconoce explícitamente que el disparo de los marcadores `[calc:]` no es del 100 % de las veces y que, cuando no se activan, el modelo recurre a aritmética mental, terreno en el que un modelo de 1,7B suele equivocarse.

La innovación técnica relevante está en el runtime CORTX-1, servido como un único fichero Python con FastAPI: un gate decide entre System-1 (una pasada) y System-2 (deliberado), se parsean los marcadores `[calc:]` y `[verify:]`, un evaluador AST en sandbox ejecuta las expresiones y, en caso de fallo, se lanza una petición de revisión al modelo. En paralelo, los bloques `[cortex_edit]` permiten reescribir los ficheros de reglas (hasta 8 ficheros, con un máximo de 8.000 caracteres cada uno en POWER MODE); la configuración resultante se versiona y persiste en el repositorio de HuggingFace, las ediciones se registran en `_edit_log` y los fallos y ediciones recientes se inyectan en el prompt siguiente, cerrando el bucle. La identidad estática (nombre, laboratorio y la aclaración de que no es ChatGPT ni Claude) no es editable. Desactivando `"power_mode": false` en `cortex/config.json` se vuelve a los límites de la versión v7: 4 secciones, 4.000 caracteres y una edición por turno de auto-mejora.

## Capacidades

- Generación de texto conversacional en registro de consultoría: tono directo y cálido, sin inventar estadísticas y con una única acción concreta propuesta por respuesta.
- Aritmética verificable: emisión de pasos `[calc: ...]` que un sandbox ejecuta y sustituye por el resultado real, en lugar de calcular dentro de la red.
- Modo System-2 con verificación y revisión: comprobación de cada marcador `[calc:]` y `[verify:]` y realimentación de las expresiones fallidas al modelo, con hasta 8 iteraciones.
- Autoedición de reglas de operación en POWER MODE mediante el canal `[cortex_edit]`, con registro, límite de tamaño, persistencia y reversión.
- Unit economics: cálculo de LTV, CAC, payback, runway, márgenes y contribución por pedido a partir de las cifras aportadas por el usuario.
- Servicio mediante API compatible con OpenAI (`/v1/chat/completions`) con parámetro extra `cortex`, incluido `{"system2": true}`.
- Ejecución en una sola GPU de consumo o en CPU, con pesos Apache-2.0.
- Tool calling / function calling genérico: no disponible en la información proporcionada (solo se documentan los canales internos `[calc:]`, `[verify:]` y `[cortex_edit]`).
- Capacidades de agente multi-paso: no disponible más allá del bucle de revisión del runtime.
- Multilingüismo: no disponible.
- Visión o audio: no disponible.

## Casos de uso

- Análisis de runway para startups: a partir de una caja disponible y un burn mensual (por ejemplo, 412.000 dólares y 31.000 dólares al mes), el modelo genera el paso `[calc: 412000 / 31000]` y el runtime devuelve el resultado exacto, de modo que el fundador puede auditar la cifra en lugar de confiar en aritmética neuronal.
- Cálculo de contribución por pedido y márgenes: con un ticket medio y un margen porcentual (por ejemplo, AOV de 37 dólares y margen del 52 %), el modelo descompone la operación en pasos verificables, útil para equipos de pricing y de operaciones.
- Cálculo de LTV, CAC y payback en revisión de métricas de adquisición: el modelo usa los dígitos concretos del usuario y muestra el desarrollo, lo que permite incorporarlo a una rutina de reporting semanal sin riesgo de cifras inventadas.
- Asistente interno de consultoría para pymes: desplegado con el servidor FastAPI en una única GPU de consumo, atiende preguntas de negocio recurrentes con respuestas cortas, con una única acción recomendada por turno.
- Escenarios con requisito de privacidad: al poder ejecutarse en local (GPU de consumo o CPU, esta última lenta) y con pesos Apache-2.0, encaja en entornos donde los datos financieros no pueden salir de la infraestructura propia.
- Investigación sobre auto-modificación de reglas: el bucle `[cortex_edit]` con registro, límite de tamaño, versionado y reversión permite estudiar cómo un modelo de 1,7B reescribe sus propias políticas de comportamiento, con revisión humana obligatoria en producción sobre `_edit_log`.
- Integración como endpoint compatible con OpenAI: al exponer `/v1/chat/completions`, se puede conectar a clientes y orquestadores que ya hablan el protocolo de OpenAI, activando System-2 mediante `extra_body={"cortex": {"system2": True}}`.

## Benchmarks y rendimiento

| Benchmark | Pally (1,7B) | GPT-OSS 20B |
|---|---|---|
| Consulting bench (escala 0-100) | 49 | 82 |

El único dato de evaluación recogido en la información disponible es la comparación en un banco de consultoría citada en el propio model card, donde Pally obtiene aproximadamente 49/100 frente a 82/100 de GPT-OSS 20B. No se publican MMLU, HumanEval, GSM8K ni otros benchmarks estándar, ni la metodología del banco de consultoría empleado.

## Requisitos de hardware

- Según el model card, el modelo cabe en una sola GPU de consumo o puede ejecutarse en CPU, en este último caso con lentitud.
- VRAM estimada (cálculo propio a partir del número de parámetros, no publicado por el autor): en torno a 3,4 GB de pesos en fp16, 1,7 GB en int8 y 0,9-1 GB en 4 bits, más el overhead de la caché KV, que depende del contexto y no se especifica.
- GPU recomendadas: no disponible en la información proporcionada; el autor solo indica que basta una GPU de consumo.
- Opciones de despliegue confirmadas: `transformers` (solo proporciona la persona, no el calculador ni el verificador) y el servidor CORTX-1 de un único fichero Python con FastAPI, que arranca una API compatible con OpenAI en el puerto 8000. No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. El coste adicional del modo System-2 depende del número de iteraciones de revisión (hasta 8).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pally (1,7B) | 1,7B | no disponible | 49/100 en consulting bench | Apache-2.0 (pesos) | Pesos en HuggingFace; endpoint sin licencia declarada |
| GPT-OSS 20B | 20B | no disponible | 82/100 en el mismo banco | no disponible en la información aportada | citado como referencia en el model card |
| Otras alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de otros modelos de ~1,7B (por ejemplo de las familias Qwen, Llama o SmolLM) que permitan una comparación homogénea de parámetros, contexto o licencia, por lo que no se incluyen cifras que no estén contrastadas. La única referencia directa del autor es GPT-OSS 20B, diez veces mayor en parámetros y claramente superior en el banco citado.

## Limitaciones y advertencias

- No es un modelo frontera: el propio autor lo sitúa en 49/100 frente a 82/100 de GPT-OSS 20B en su banco de consultoría.
- El disparo de los marcadores `[calc:]` no es del 100 %; en los casos en los que no se activan, el modelo recurre a aritmética mental, que un modelo de 1,7B suele resolver mal. Regla práctica indicada por el autor: exigir los pasos `[calc:]` o verificar de forma independiente cualquier cifra relevante.
- Conocimiento congelado en el momento del entrenamiento: no dispone de datos en vivo ni de acceso a fuentes actualizadas.
- Respuestas cortas por diseño: no es adecuado para memorandos largos (el autor menciona explícitamente los 2.000 palabras como fuera de su alcance).
- Las autoediciones de reglas en POWER MODE requieren revisión humana en producción mediante `_edit_log`; se trata de un mecanismo experimental y con riesgo de deriva de comportamiento.
- El repositorio `chatpbc1/pally-endpoint` no declara licencia, idiomas ni pipeline; para uso comercial hay que atenerse a la licencia del repositorio de pesos (`chatpbc1/Pally`, Apache-2.0) y confirmar la del endpoint desplegado.
- No se especifican idiomas soportados; el model card y los ejemplos están en inglés, por lo que el comportamiento en castellano no está documentado.
- No hay datos publicados sobre sesgos, tasa de alucinación en texto no numérico, longitud de contexto soportada ni rendimiento en cargas concurrentes.
- El uso de `trust_remote_code=True` implica ejecutar código remoto del autor al cargar el modelo.

## Enlaces

- Repositorio del endpoint: https://huggingface.co/chatpbc1/pally-endpoint
- Pesos del modelo: https://huggingface.co/chatpbc1/Pally
- Paper técnico (CORTX-1): https://huggingface.co/chatpbc1/Pally/blob/main/RESEARCH_CORTX1.md
- Guía para desarrolladores: https://huggingface.co/chatpbc1/Pally/blob/main/DEVELOPER_GUIDE.md
- Demo (Space, cuando está en línea): https://huggingface.co/spaces/chatpbc1/pally-console
