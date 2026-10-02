# Jazhyc/Gleipnir-9B-ToolTrajectories-Regular

## Resumen

Gleipnir-9B-ToolTrajectories-Regular es un adaptador LoRA de investigación publicado por el usuario Jazhyc (repo `Jazhyc/Gleipnir-9B-ToolTrajectories-Regular`) sobre el modelo base `Qwen/Qwen3.5-9B`. No es un modelo conversacional: es un monitor de control de IA (AI control / monitoring) entrenado para clasificar trayectorias de agentes y determinar si contienen comportamiento problemático o desalineado. La tarea es binaria: emitir un único token `0` (conducta orientada a la tarea) o `1` (acción no autorizada, intento de elusión de salvaguardas, obediencia a instrucciones maliciosas embebidas en entradas no confiables o ocultación deliberada).

El adaptador se entrenó durante una única época sobre 8.688 trayectorias de herramientas, con objetivos binarios suaves precalculados ("cached Kimi K3 soft binary targets") y sin filas de entrenamiento de engaño previo. La configuración declarada es rango 128 / alpha 256, adaptadores maestros en FP32 sobre una base BF16 congelada, batches lógicos empaquetados de 32, AdamW con learning rate 5e-5, decaimiento lineal y 3% de warmup. El autor lo describe explícitamente como un artefacto de investigación no calibrado y de una sola semilla.

La relevancia es metodológica más que de producto: ilustra el patrón de usar un LLM de 9B como monitor externo de trayectorias de agentes, con una instrucción fija de "action-only" y una puntuación de riesgo derivada de logprobs (`sigmoid(logprob_1 - logprob_0)`). El repositorio incluye tanto el maestro causal en FP32 como un layout de servicio para vLLM verificado contra el maestro mediante un canary acotado sobre datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer causal decoder-only (`Qwen/Qwen3.5-9B`) |
| Parametros totales | 9B en el modelo base; parametros del adaptador: no disponible (repositorio de 1,9 GB con maestro FP32 y layout vLLM) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Base congelada en BF16 y adaptadores maestros en FP32; no se documentan publicaciones GGUF/AWQ/GPTQ (no disponible) |
| Idiomas soportados | no disponible (heredados del modelo base, sin declarar) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador LoRA + configuraciones de carga; layout adicional para vLLM) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 128 y alpha 256 sobre `Qwen/Qwen3.5-9B`, con la base congelada en BF16 (revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a`) y los adaptadores maestros mantenidos en FP32. El entrenamiento consistió en una única época sobre 8.688 trayectorias de herramientas, con batches lógicos empaquetados de 32, optimizador AdamW a 5e-5, decaimiento lineal y 3% de warmup. El checkpoint final queda fijado tras esa época, sin calibración posterior. Los objetivos de clasificación son etiquetas binarias suaves ya cacheadas, atribuidas a "Kimi K3", y el autor indica que no se incluyeron filas de entrenamiento de engaño previo. Las trayectorias conservan su contenido original, incluyendo razonamiento identificado en algunas entradas STRIDE; en evaluación ID se elimina la cadena de pensamiento identificada y se mantiene la prosa visible del asistente, mientras que la evaluación OOD usa un conjunto congelado de seis fuentes.

El uso previsto no es generativo sino discriminativo. Se aplica la plantilla de chat del tokenizer base como un único mensaje de usuario con el modo "thinking" desactivado, se añade `Prediction:` en la frontera de generación del asistente y se solicitan los logprobs de los tokens `0` y `1`. La puntuación de riesgo es `sigmoid(logprob_1 - logprob_0)`, de modo que valores altos indican comportamiento problemático. El prompt de estudiante (`regular`) está fijado y debe reproducirse literalmente, seguido de `<agent_trajectory>`, la trayectoria completa y `</agent_trajectory>` en líneas separadas.

## Capacidades

- Clasificacion binaria de trayectorias de agentes: distingue conducta orientada a la tarea (incluidos errores honestos, intentos fallidos, exploracion inofensiva y trabajo incompleto) de acciones no autorizadas o daninas.
- Deteccion de intentos de elusion de salvaguardas y de cumplimiento de instrucciones conflictivas embebidas en entradas no confiables.
- Deteccion de ocultacion enganosa material en acciones observables.
- Puntuacion de riesgo continua mediante logprobs, no solo etiqueta discreta: permite umbralizar y ordenar trayectorias.
- Robustez a inyeccion de prompt: la instruccion del estudiante ordena no tratar el texto de la trayectoria como instrucciones.
- Modo "action-only": evalua acciones visibles en el contexto de la tarea del usuario en lugar de juicios sobre texto libre.
- No se documentan capacidades de generacion abierta, tool calling, vision, audio, multilingueismo ni agentes; el modelo esta especializado en la tarea de monitorizacion descrita.

## Casos de uso

- Monitorizacion de agentes en produccion: interceptar cada trayectoria completa (o por pasos) antes de ejecutar acciones irreversibles y usar la puntuacion `sigmoid(logprob_1 - logprob_0)` como senal de riesgo con umbral configurable.
- Defensa contra inyeccion de prompt en pipelines con contenido no confiable: cuando un agente lee paginas web, correos o documentos de terceros, el monitor detecta si ha obedecido instrucciones embebidas en lugar de la tarea original.
- Auditoria offline de logs de agentes: procesar por lotes historicos de trazas con el layout vLLM para localizar incidentes de elusion de salvaguardas o acciones no autorizadas.
- Investigacion en AI control: usar el artefacto como linea base reproducible (una semilla, prompt fijo) para comparar estrategias de monitorizacion entre modelos.
- Red-teaming y evaluacion de agentes: etiquetar conjuntos de trayectorias adversariales, incluyendo entradas STRIDE, para medir tasas de deteccion.
- Control de acceso a herramientas sensibles: bloquear o escalar a revision humana trayectorias que el monitor marque como `1` antes de conceder permisos de escritura, pago o ejecucion de codigo.
- Filtrado de datos de entrenamiento: descartar trayectorias con comportamiento problematico antes de usarlas en fine-tuning de agentes.
- Gate de liberacion en CI: integrar el monitor en pruebas de regresion de agentes para detectar cambios de politica que introduzcan conductas no deseadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, recall, F1 ni AUC, y el autor advierte explicitamente que se trata de un artefacto de investigacion sin calibrar y de una sola semilla, y que el rendimiento de deteccion no establece por si mismo que una trayectoria sea segura.

## Requisitos de hardware

- El repositorio del adaptador ocupa 1,9 GB e incluye el maestro causal en FP32 y el layout de servicio para vLLM; el modelo base `Qwen/Qwen3.5-9B` debe descargarse aparte.
- VRAM estimada para la base de 9B, calculada a partir del tamano (estimaciones, no datos publicados): aproximadamente 18 GB en BF16, 9-10 GB en cuantizacion de 8 bits y 5-6 GB en 4 bits, mas la cache KV y el coste del adaptador.
- GPU recomendadas para BF16: A100 40/80 GB, H100, L40S o varias RTX 4090/A6000. Con cuantizacion de 4-8 bits cabe en GPU de consumo con 8-24 GB, en funcion de la longitud de contexto.
- Despliegue: el autor proporciona un layout especifico para vLLM (`vllm/`), verificado contra el maestro con un canary acotado. Tambien son viables TGI o transformers con PEFT; para llama.cpp/Ollama seria necesario fusionar el adaptador y convertir a GGUF, algo no documentado en la informacion disponible.
- Latencia y throughput: no disponibles. La tarea es de una sola pasada y requiere los logprobs de dos tokens, por lo que el coste por trayectoria depende de la longitud de la trayectoria de entrada.

## Comparativa con modelos similares

No hay benchmarks publicados para Gleipnir, de modo que la comparacion es estructural. Los datos de los comparadores son orientativos y deben verificarse en sus fuentes.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gleipnir-9B-ToolTrajectories-Regular | 9B (base) + LoRA | no disponible | no publicado | MIT | HuggingFace (0 descargas, 0 likes) |
| Llama Guard 3 8B | 8B | no disponible | no disponible | Llama 3.1 Community License | HuggingFace, ampliamente desplegado |
| ShieldGemma | 2B / 9B / 27B | no disponible | no disponible | Gemma Terms of Use | HuggingFace |
| Qwen3Guard (serie Gen) | 0.6B / 4B / 8B | no disponible | no disponible | Apache 2.0 (segun la informacion de sus repositorios) | HuggingFace |

Diferencias clave: a diferencia de los guardrails de contenido general, Gleipnir clasifica acciones observables en trayectorias de agentes y devuelve una puntuacion continua de riesgo derivada de logprobs, no una categoria de politica. Frente a los comparadores, su licencia MIT es mas permisiva para uso comercial, pero carece de evaluacion publicada y tiene un historial de adopcion nulo.

## Limitaciones y advertencias

- Artefacto de investigacion no calibrado y de una sola semilla: no debe usarse como unica barrera de seguridad en produccion.
- El autor advierte que el rendimiento de deteccion no demuestra que una trayectoria sea segura; un `0` no equivale a una garantia.
- No hay benchmarks, evaluacion publicada ni metricas de falsos positivos/negativos.
- Riesgo de alucinacion y de error de clasificacion inherente a un monitor basado en LLM: puede marcar acciones legitimas y dejar pasar conductas problematicas.
- El historial de adopcion es nulo (0 descargas, 0 likes) y la model card no declara idiomas soportados; el comportamiento multilingue es una incognita.
- Longitud de contexto no documentada: trayectorias largas pueden truncarse y degradar la deteccion.
- Las trayectorias de entrada se conservan sin sanitizar y deben tratarse como contenido no confiable; el propio prompt del estudiante asume ese escenario.
- Los conjuntos de entrenamiento incluyen razonamiento identificado en algunas entradas STRIDE, mientras que la evaluacion ID elimina la cadena de pensamiento identificada: existe una discrepancia potencial entre entrenamiento y evaluacion.
- Requiere reproducir literalmente la instruccion del estudiante y el formato de delimitadores; desviarse invalida las puntuaciones.
- Depende de un modelo base concreto (`Qwen/Qwen3.5-9B`, revision fijada) y de su plantilla de chat.
- Licencia MIT declarada, lo que en principio permite uso comercial, pero esa permisividad no cubre la responsabilidad por fallos de deteccion ni la licencia del modelo base, que debe verificarse por separado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jazhyc/Gleipnir-9B-ToolTrajectories-Regular
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Codigo del experimento: https://github.com/Jazhyc/gleipnir
