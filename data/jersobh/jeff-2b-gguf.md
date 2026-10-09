# jersobh/jeff-2b-gguf

## Resumen

Jeff-2B es un modelo de decisión y enrutamiento (decision-engine / routing) obtenido por ajuste fino supervisado de `internlm/Intern-Decision-2B` mediante LoRA (rango 32, alpha 32) durante 5 épocas con minado de negativos duros, usando la librería Unsloth. El autor es jersobh (Jeff Andrade) y la distribución principal es un GGUF cuantizado en Q4_K_M, con 1.881.825.088 parámetros totales (aproximadamente 1,88 B) y licencia Apache 2.0.

El modelo resuelve un problema muy concreto: dada una situación descrita en lenguaje natural y un conjunto cerrado de opciones etiquetadas, devuelve la opción seleccionada (por ejemplo, «ejecutar herramienta» frente a «responder directamente») en lugar de generar texto libre. Esto lo sitúa en la categoría de clasificadores de intención y routers de bajo coste, pensados para colocarse delante de un LLM mayor o dentro de una pipeline de agentes.

Su relevancia actual viene del interés por modelos pequeños, ejecutables en local y con latencia baja, que evitan el parseo frágil de salidas generativas: el resultado es una decisión discreta sobre un esquema predefinido. La información publicada no detalla la arquitectura interna, la longitud de contexto ni la composición exacta del dataset de entrenamiento, más allá de los benchmarks de clasificación reportados por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: internlm/Intern-Decision-2B, familia InternLM) |
| Parámetros totales | 1.881.825.088 (aproximadamente 1,88 B) |
| Parámetros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF de 4 bits, variante Q4_K_M (exportación indicada por el autor); no se documentan otras variantes |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio orientado a GGUF); el recuento de parámetros se reporta a partir de metadatos de safetensors |
| Modelo base | internlm/Intern-Decision-2B |
| Método de ajuste | LoRA (rango 32, alpha 32), etiquetado también como QLoRA; 5 épocas con hard-negative mining |
| Precisión de entrenamiento | BF16 nativo sobre NVIDIA L4 de 24 GB |
| Tamaño del repositorio | 10,3 GB |
| Fecha de publicación indicada | 8 de octubre de 2026 (creación), última actualización el mismo mes |

## Arquitectura y entrenamiento

No se publican detalles de la arquitectura interna más allá de su origen: el modelo deriva de `internlm/Intern-Decision-2B`, un modelo de la familia InternLM de aproximadamente 2 B de parámetros orientado a tareas de decisión. La ficha no especifica si emplea atención completa, atención lineal, mezcla de expertos o algún esquema híbrido, por lo que cualquier afirmación al respecto sería especulativa. El pipeline declarado es conversacional y el modelo se etiqueta como `decision-engine` y `routing`.

El proceso de ajuste se realizó con Unsloth sobre el modelo base en BF16 nativo, usando adaptadores LoRA de rango 32 y alpha 32 durante 5 épocas, con minado de negativos duros (*hard-negative mining*) para reforzar la frontera entre opciones confundibles. La exportación se hizo a GGUF cuantizado en 4 bits (Q4_K_M). No se indica el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; el autor únicamente menciona el ajuste supervisado con LoRA. La innovación destacable es, por tanto, metodológica y de despliegue: un clasificador de decisión empaquetado en un GGUF de ~1,9 B de parámetros que mantiene prácticamente intacta su precisión tras la cuantización (las caídas reportadas son de 0,1 a 0,2 puntos porcentuales).

## Capacidades

- Clasificación de intenciones: reporta resultados en BANKING77 (77 intenciones bancarias), CLINC150 y MASSIVE (asistente virtual multilingüe, evaluado aquí en inglés).
- Enrutamiento guiado por esquema (*schema-guided routing*): selecciona una opción entre un conjunto enumerado, por ejemplo `[A: Execute tool, B: Chat directly]`.
- Type-decision routing: decide el tipo de acción o de respuesta a partir de un estado descrito en texto, evaluado sobre un subconjunto reservado de Dolly.
- Salidas de longitud muy corta: el ejemplo oficial usa `-n 4`, es decir, la respuesta esperada es de pocos tokens (la etiqueta de la opción elegida), no una generación larga.
- Uso conversacional: el repositorio se etiqueta como `conversational` y con endpoint compatible, aunque el caso de uso documentado es de decisión, no de diálogo abierto.
- Soporte de *tool calling* / *function calling*: no documentado explícitamente; el modelo decide entre opciones que pueden representar llamadas a herramientas, pero no se describe un formato de function calling nativo.
- Agentes y razonamiento multi-paso: no documentado. El modelo está pensado como un único paso de decisión dentro de un bucle de agente gestionado externamente.
- Capacidades multilingües: no. El modelo declara únicamente inglés (`language: en`), pese a que el benchmark MASSIVE es de origen multilingüe.
- Visión, audio, *thinking mode*: no disponibles.

## Casos de uso

- Enrutamiento previo a un LLM mayor: el modelo recibe la consulta del usuario y decide si debe invocarse una herramienta o responderse directamente; al ser un GGUF de ~1,9 B en Q4_K_M, se ejecuta en la misma máquina sin coste de API y descarga el trabajo de decisión del modelo grande.
- Triaje de tickets de soporte bancario: con un 95,6 % en BANKING77 (Q4_K_M), puede asignar cada mensaje entrante a una de las 77 intenciones de ese corpus y encaminarlo a la cola o al flujo automatizado correspondiente.
- Clasificación de comandos en asistentes de voz y domótica: los 87,0 % en MASSIVE lo hacen utilizable para mapear una frase a una intención de asistente (encender luz, poner música, consultar el tiempo) antes de ejecutar la acción.
- Filtro de entrada en sistemas RAG: decidir si una consulta requiere recuperación documental, una aclaración al usuario o una respuesta directa, reduciendo llamadas innecesarias al motor de búsqueda vectorial.
- Guardarraíl y enrutamiento de seguridad: clasificar una petición como dentro o fuera de alcance antes de pasarla al modelo generativo, con una decisión binaria de muy bajo coste computacional.
- Enrutamiento de endpoints en backends de microservicios: dado un estado en texto y una lista de APIs disponibles, seleccionar qué endpoint invocar, útil en orquestadores internos con catálogos de acciones cambiantes.
- Preclasificador en pipelines de datos: etiquetar grandes volúmenes de texto (encuestas, reseñas, correos) con categorías fijas en local, sin enviar datos a servicios externos, algo relevante por motivos de privacidad y coste.
- Componente de evaluación de agentes: usarlo como juez binario de bajo coste para decidir si una trayectoria debe continuar, reintentarse o detenerse.

## Benchmarks y rendimiento

Resultados reportados por el autor del modelo en la *model card*:

| Benchmark / tarea | Rebanada de evaluación | Sin cuantizar (BF16) | Cuantizado (Q4_K_M GGUF) |
|---|---|---|---|
| BANKING77, clasificación de intenciones | `test[:1000]` | 95,80 % | 95,60 % |
| MASSIVE, clasificación de intenciones | `test[:1000]` | 87,10 % | 87,00 % |
| CLINC150, clasificación de intenciones | `test[:1000]` | 95,20 % | 95,00 % |
| Type-decision routing (Dolly) | `train[:1000]` (held-out) | 90,30 % | 90,10 % |

No se han publicado en la información disponible resultados de benchmarks generalistas (MMLU, HumanEval, GSM8K u otros). Las cifras anteriores provienen exclusivamente de la model card del autor y no se han verificado de forma independiente.

## Requisitos de hardware

- VRAM estimada para los pesos (cálculo a partir de 1,881.825.088 parámetros; no son cifras publicadas por el autor):
  - Q4_K_M (aproximadamente 4,5 bits por peso): alrededor de 1,1 GB de pesos; en la práctica, unos 1,5-2 GB de VRAM incluyendo caché KV y sobrecarga del runtime.
  - Q5_K_M: alrededor de 1,3 GB de pesos.
  - Q8_0: alrededor de 1,9 GB de pesos.
  - BF16 / FP16: alrededor de 3,8 GB de pesos.
  - El tamaño de la caché KV depende de la longitud de contexto, que no está documentada.
- GPU recomendadas: cualquier GPU de consumo con 4 GB o más de VRAM es suficiente para las variantes cuantizadas; RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores funcionan con margen. Para BF16 y lotes grandes, se recomienda RTX 4090 (24 GB) o GPU de centro de datos (L4, A100, H100), máxime teniendo en cuenta que el ajuste se realizó sobre una NVIDIA L4 de 24 GB.
- ¿Cabe en GPU de consumo? Sí, con holgura en cualquier tarjeta de 6-8 GB en Q4_K_M, e incluso en iGPU con memoria unificada si se usa llama.cpp.
- Despliegue: llama.cpp (`llama-cli`, `llama-server`) según el ejemplo oficial; Ollama, importando el GGUF con un Modelfile; LM Studio; llama-cpp-python; interfaces gráficas basadas en llama.cpp. Para vLLM o TGI el soporte de GGUF es limitado o experimental, y la alternativa sería convertir a safetensors (no se documenta que estén disponibles en el repositorio).
- Latencia y throughput: no disponibles. El diseño apunta a decisiones de pocos tokens (el ejemplo genera 4), lo que implica latencias muy inferiores a las de un modelo generativo, pero no hay cifras publicadas de tokens por segundo ni de tiempo de respuesta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento en clasificación de intenciones |
|---|---|---|---|---|---|
| jersobh/jeff-2b-gguf | 1,88 B | no disponible | Apache 2.0 | GGUF (Q4_K_M) | BANKING77 95,60 %; CLINC150 95,00 %; MASSIVE 87,00 % (Q4_K_M) |
| internlm/Intern-Decision-2B (base) | no disponible | no disponible | no disponible en la información recogida | no disponible | no disponible (es el punto de partida del ajuste) |
| firelex/jeff | 0,8 B | no disponible | no disponible en la información recogida | no disponible | no disponible; se describe como modelo «System 1» de decisión con adaptadores LoRA intercambiables |
| google/gemma-2b-GGUF | no disponible en la información recogida | no disponible | no disponible en la información recogida | GGUF | no disponible |

Advertencia sobre la comparativa: el proyecto `firelex/jeff` aparece en los resultados de búsqueda como un modelo de decisión de 0,8 B con adaptadores LoRA intercambiables, conceptualmente cercano pero de menor tamaño y sin relación confirmada con este repositorio. Una fuente secundaria (toolhunter.cc) describe el ecosistema «Jeff» como basado en ajustes de Qwen3.5 y Gemma 4, lo que no coincide con la model card de `jersobh/jeff-2b-gguf`, cuyo modelo base declarado es `internlm/Intern-Decision-2B`; esa discrepancia no se ha podido verificar y debe tratarse con cautela. Los datos de parámetros, contexto y licencia de los modelos alternativos no figuran en la información disponible.

## Limitaciones y advertencias

- Modelo monolingüe en inglés: no hay evidencia de capacidades en castellano ni en otros idiomas. Usarlo con texto en español degradaría previsiblemente la precisión, aunque no se han publicado evaluaciones al respecto.
- Alcance restringido a decisión y clasificación: no es un modelo generativo de propósito general. Forzarlo a producir texto libre, razonamiento largo o código no es su caso de uso previsto.
- Riesgo de alucinación: en un router, el fallo típico no es inventar hechos, sino seleccionar una opción incorrecta o inventar una etiqueta fuera del conjunto permitido cuando el esquema de salida no se restringe. Se recomienda validar la salida contra la lista de opciones y aplicar una gramática o lista blanca.
- Datos de benchmarks autodeclarados: las cifras de BANKING77, MASSIVE, CLINC150 y Dolly proceden únicamente de la model card y no se han replicado de forma independiente. No hay resultados en benchmarks generalistas.
- Rebanadas de evaluación pequeñas: las métricas se calculan sobre `test[:1000]` (y `train[:1000]` en el caso de Dolly, con partición reservada), lo que reduce la robustez estadística de las cifras.
- Longitud de contexto desconocida: impide garantizar el comportamiento en entradas largas y complica el dimensionamiento de la caché KV en producción.
- Licencia Apache 2.0: permite uso comercial y modificación sin restricciones copyleft, siempre que se conserve el aviso de licencia y se documenten los cambios. Conviene verificar la licencia del modelo base por si impone condiciones adicionales.
- Adopción mínima: el repositorio presenta 0 descargas y 1 «me gusta» en el momento de la consulta, sin señales de uso en producción ni de mantenimiento continuado.
- Fecha de publicación anómala (octubre de 2026) y ausencia de información sobre procedencia del dataset de ajuste, lo que dificulta auditar sesgos. No se han publicado análisis de sesgo.
- El repositorio ocupa 10,3 GB, un tamaño desproporcionado para un modelo de 1,88 B en Q4_K_M, lo que sugiere que contiene varias cuantizaciones u otros artefactos; conviene revisar la lista de archivos antes de descargar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jersobh/jeff-2b-gguf
- Modelo base: https://huggingface.co/internlm/Intern-Decision-2B
- Repositorio GitHub del autor: https://github.com/jersobh
- Proyecto relacionado (decisión de 0,8 B, no confirmado como el mismo modelo): https://github.com/firelex/jeff
- Ficha de terceros sobre el ecosistema «Jeff» (datos no verificados): https://www.toolhunter.cc/tools/jeff
- Referencia de un GGUF comparable de 2 B: https://huggingface.co/google/gemma-2b-GGUF
