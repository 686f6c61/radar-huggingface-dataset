# arshkumarsingh/qwennet-4b-mesh

## Resumen

qwennet-4b-mesh es un checkpoint derivado de Qwen/Qwen3.5-4B publicado por el usuario arshkumarsingh en el que se han fusionado en los pesos del modelo dos circuitos deterministas: una CPU exacta compatible con CHIP-8 con BIOS de precisión arbitraria (bignum) y un dispositivo de red con almacén de ficheros versionado, envío de mensajes y activación entre agentes. El objetivo declarado es que varios agentes construidos sobre este checkpoint puedan coordinarse sin tool calling: escriben líneas de texto planas y un circuito interno, compilado en las capas del transformer, las ejecuta de forma exacta. El host solo transporta las salidas del dispositivo entre agentes y no interpreta su contenido.

El modelo conserva la arquitectura Qwen3.5-4B en las capas 20–51 (sin cambios salvo relleno de ceros), mientras que las capas 0–11 implementan la CPU y las capas 12–19 el dispositivo de malla. El resultado es un único checkpoint `Qwen3_5ForCausalLM` estándar, sin `trust_remote_code`, de 52 capas. Según los safetensors del repositorio, el checkpoint contiene 12.556.124.096 parámetros, muy por encima de los 4B nominales del modelo base, debido al ensanchamiento del residual y al relleno de matrices.

La relevancia del proyecto es fundamentalmente de investigación en interpretabilidad mecanicista y en composición de circuitos dentro de pesos: demuestra que se pueden incrustar cómputos exactos y protocolos de comunicación entre agentes en un LLM sin recurrir a herramientas externas. No obstante, la propia model card documenta que el modelo base de 4B, a bajo esfuerzo de razonamiento, no completa las tareas de forma fiable, por lo que su uso en producción no está validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5) con circuitos compilados en los pesos; 52 capas |
| Parametros totales | 12.556.124.096 (safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen/Qwen3.5-4B y de una variante intermedia (divagr1925/Qwen3.5-4B-Qwenputer-CHIP8). La composición se realiza mediante una receta general documentada en `composition-recipe.md`: se ensancha la dimensión residual hasta 4.864 dimensiones y se rellena con ceros cada matriz, de modo que cada circuito lee y escribe únicamente sus propias dimensiones. Las capas 0–11 contienen la CPU CHIP-8 con BIOS bignum (operaciones inline tipo `a × b =` y `a + b =` hasta 24 dígitos); las capas 12–19 implementan el dispositivo de malla con almacén de ficheros versionado (128 rutas × 63 versiones), lecturas, borrados, envíos, activaciones, `@ask`, `@append` e impresión de llegadas; las capas 20–51 corresponden a Qwen3.5-4B sin modificar salvo el relleno.

El control de las normas se logra mediante "lastre" (ballast): constantes grandes en cada token fuerzan que cada RMSNorm divida por una potencia de dos exactamente conocida (2³⁷ para la CPU, 256 para el dispositivo), de modo que ambas restricciones se cumplen simultáneamente. Además se aplican "mutes": las compuertas de decaimiento y escritura de Gated-DeltaNet y las compuertas de salida de atención se llevan a 0 en los tokens que un circuito no debe ver. La norma final es compartida y cada código de salida tiene sus propias dimensiones y ganancia; donde un circuito no fuerza nada, su código es exactamente 0 y los logits son los de Qwen. No se documentan en la información disponible detalles sobre volumen de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO; el proceso es de composición de circuitos, no de entrenamiento convencional.

## Capacidades

- Generación de texto y razonamiento heredados de Qwen3.5-4B en las capas 20–51.
- Cómputo aritmético exacto de enteros grandes (hasta 24 dígitos) mediante la CPU CHIP-8 compilada en las capas 0–11.
- Almacén de ficheros versionado interno: escritura, lectura, borrado y hasta 63 versiones por ruta (128 rutas).
- Comunicación entre agentes sin tool calling: envío de ficheros, activación de otros agentes, `@ask` (solicitud de fichero servida por el dispositivo del otro agente sin despertarlo) y `@append`.
- Coordinación multiagente mediante líneas de texto planas interpretadas por el circuito interno.
- Compatibilidad con `Qwen3_5ForCausalLM` estándar, sin `trust_remote_code`.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking: la model card menciona "low thinking effort" como parámetro de ejecución, pero no se detalla su funcionamiento.

## Casos de uso

- Reparto de cómputo aritmético exacto entre agentes: tres agentes dividen una expresión de productos y sumas de enteros grandes, cada uno calcula su parte en su propia CPU interna y el agregador suma los resultados exactos. Adecuado porque la CPU compilada produce resultados exactos y verificables, sin depender de la precisión del LLM.
- Intercambio de ficheros entre agentes sin orquestador: un agente usa `@ask` para solicitar un fichero a otro, cuyo dispositivo lo sirve sin despertar al modelo receptor, y después hace `@append`. Útil en pipelines donde se quiere minimizar el coste de inferencia del agente que solo actúa como almacén.
- Escritura colaborativa distribuida: tareas `story` y `translate` repartidas entre tres agentes que se pasan borradores mediante el almacén versionado. Aprovecha el versionado (63 versiones) para conservar historial de cambios.
- Investigación en interpretabilidad mecanicista: estudio de cómo se pueden incrustar circuitos deterministas en un transformer y verificar que los tokens forzados son el argmax (17.623/17.623 en la validación reportada). Adecuado para experimentos reproducibles con evidencia token a token.
- Docencia y demostración de composición de modelos: la receta de dimensiones residuales disjuntas, lastre y mutes sirve como ejemplo práctico de fusión de circuitos en pesos.
- Pruebas de robustez de agentes: el fallo documentado en la tarea `equation` (el agente B duda de su resultado exacto y escribe una aproximación que consume su presupuesto de turno) es un caso de estudio sobre la fiabilidad de LLMs pequeños en bucles agénticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros). La model card incluye únicamente validaciones internas del circuito:

| Comprobacion | Resultado |
|---|---|
| Dispositivo en el modelo completo (forward plano, todas las capas) | 17.623 / 17.623 tokens forzados son el argmax sobre 20 sesiones, 0 fuera; margen mínimo sobre el segundo: 68 logits, mediana 512 |
| Dispositivo a través del motor de decodificación (stepped y restaurado) | La información disponible se interrumpe en este punto |
| Reproducción de las ejecuciones v5 (`fetch` y `equation`) en el build v6 | Idénticas token a token; la tarea `equation` falla igual que en v5 por el comportamiento del modelo base |

## Requisitos de hardware

- VRAM estimada para inferencia: la demo oficial requiere una GPU CUDA con 40 GB o más (L40S, A100, H100). El repositorio ocupa 32,5 GB y la primera ejecución descarga unos 23 GB.
- GPU recomendadas: L40S, A100, H100 según la model card.
- GPU de consumo: no se indica compatibilidad con GPUs de consumo; el requisito de 40 GB de VRAM excluye las RTX 4090 (24 GB) en el formato publicado.
- Opciones de despliegue: transformers (librería declarada) y el paquete `qwennet` 0.2.2 distribuido como wheel en el propio repositorio; la demo se lanza con `uvx --from <wheel> qwennet-demo --task <tarea>`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Alternativa sin GPU local: ejecución en Modal con una L40S, con un coste estimado de 0,30–0,60 USD por tarea.
- Latencia y throughput: la ejecución de la tarea `equation` con tres agentes en una L40S tardó 365 s en el build v4. No se proporcionan más cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwennet-4b-mesh | 12.556.124.096 | no disponible | Qwen3.5-4B + CPU y dispositivo de red compilados | apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-4B | no disponible en la información | no disponible | LLM decoder-only estándar | no disponible en la información | Hugging Face |
| divagr1925/Qwen3.5-4B-Qwenputer-CHIP8 | no disponible | no disponible | Qwen3.5-4B + CPU CHIP-8 compilada | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Fiabilidad del modelo base: en la tarea `equation` del build v5 (y en la reproducción idéntica del v6), el agente B dudó de su resultado exacto, escribió una aproximación y agotó su presupuesto de turno sin enviar el resultado; la tarea falló.
- Punto débil documentado: en la tarea `fetch`, el agente A a bajo esfuerzo de razonamiento nunca llegó a ejecutar su `@append`.
- Los circuitos son deterministas y verificables, pero el comportamiento del LLM que los invoca no lo es; la corrección de extremo a extremo no está garantizada.
- El checkpoint 0.2.2 sustituye al 0.2.1, cuyo dispositivo tenía fallos; debe usarse con la wheel 0.2.2. Las comprobaciones de `@delete` y de los fallos corregidos no se cubren con ejecuciones en vivo, solo con validaciones internas.
- Requisito de hardware elevado (40 GB de VRAM) para un modelo nominal de 4B, debido al ensanchamiento de matrices y al tamaño real de 12,5B parámetros.
- Sesgos conocidos: no disponibles en la información proporcionada; al heredar Qwen3.5-4B, cabe esperar los del modelo base, pero no se documentan.
- Riesgo de alucinación: no evaluado en la información disponible.
- Idiomas soportados: no disponibles.
- Licencia apache-2.0, que permite uso comercial; sin embargo, el autor no valida el modelo para producción y los fallos documentados desaconsejan su uso fuera de investigación.
- La model card no detalla la longitud de contexto ni los formatos de cuantización, lo que limita la planificación de despliegues.

## Enlaces

- Hugging Face: https://huggingface.co/arshkumarsingh/qwennet-4b-mesh
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo intermedio: https://huggingface.co/divagr1925/Qwen3.5-4B-Qwenputer-CHIP8
- Repositorio Qwenputer: https://github.com/divagr18/qwenputer
- Repositorio qwenFS: https://github.com/vixhal-baraiya/qwenFS
- Paper referenciado en los tags: arxiv:2610.13928 (no se dispone de URL verificada en la información proporcionada)
- Wheel de la demo: https://huggingface.co/arshkumarsingh/qwennet-4b-mesh/resolve/main/qwennet-0.2.2-py3-none-any.whl
- Script de demo en Modal: `modal_demo.py` (incluido en el repositorio de Hugging Face)
- Evidencias de ejecución: carpeta `evidence/` del repositorio de Hugging Face
- Receta de composición: `composition-recipe.md` del repositorio de Hugging Face
