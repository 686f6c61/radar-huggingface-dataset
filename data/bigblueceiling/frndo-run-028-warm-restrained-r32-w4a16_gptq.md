# BigBlueCeiling/frndo-run-028-warm-restrained-r32-W4A16_GPTQ

## Resumen
Este modelo es la versión cuantizada en W4A16 GPTQ (group size 128, simétrico) del fine-tune conversacional `frndo-run-028-warm-restrained-r32-bf16`, publicado por BigBlueCeiling. El modelo base se deriva de un Mistral3 con 4.733.947.440 parámetros (4,73B) y está diseñado para generación de texto con tool calling en vLLM. La cuantización, realizada con B2CQuantizer, reduce el ancho de banda de pesos en un factor aproximado de 3,3x frente a BF16, con lo que el modelo es más ligero y apto para inferencia en GPUs Ampere o superiores mediante kernels Marlin.

El entrenamiento se ha centrado en dos ajustes frente a la iteración anterior (run-026): respuestas más cálidas en turnos de usuario brevísimos y una mayor contención en el uso de herramientas, de modo que el modelo ofrece sus funciones en lugar de dispararlas automáticamente cuando el usuario describe una actividad. El corpus de entrenamiento (15.998 filas) combina tool calling, diálogos variados, profundidad conversacional y contenido difícil, con invariantes de tokenización basadas en `mistral-common` y colocación de `[AVAILABLE_TOOLS]` en el primer turno de usuario.

La licencia es Apache 2.0, lo que facilita su integración en proyectos comerciales. La documentación publicada no especifica la longitud de contexto ni los idiomas soportados, y tampoco incluye resultados de benchmarks.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Mistral3) |
| Parametros totales | 4.733.947.440 (4,73B) |
| Parametros activos | No se aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | W4A16 GPTQ (group size 128, simétrico); modelo base en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | SafeTensors (cuantización GPTQ, compatible con vLLM) |

## Arquitectura y entrenamiento
El modelo es un fine-tune de un Mistral3. Según la documentación de la cuantización, la arquitectura incluye una torre de visión y un proyector multimodal, aunque el uso final se limita a generación de texto. Las capas lineales del decodificador de lenguaje se han cuantizado a W4A16 GPTQ, mientras que la torre de visión, el proyector multimodal y el `lm_head` se mantienen en su precisión original. Esto implica que el modelo no es un cuantizado completo: únicamente las capas de atención y feed-forward del decodificador usan pesos de 4 bits.

El corpus de entrenamiento está compuesto por 15.998 filas, distribuidas en categorías como `tool_calling_training_restrained` (25,0%), `dailydialog_chat_varied` (12,2%), `threats_balanced` (10,7%), `deep_conversations_xl_warm` (8,6%) y `extreme_sexual_threats_balanced` (8,6%), entre otras. El autor aplica un sobre-muestreo de herramientas de 1,38x sobre un pool de 2.896 filas y de profundidad de 1,73x. El entrenamiento sigue tres invariantes: tokenización exclusiva con `mistral-common` (Tekken), presencia de `[AVAILABLE_TOOLS]` en el primer turno de usuario, y mezcla aleatoria de 6 a 12 herramientas por conversación, incluyendo las que realmente se llaman, para aprender selección bajo ruido.

Además, el proceso incorpora invariantes de calidad: 0 turnos "slop" y 0 historias inventadas. Los turnos reescritos en los corpus de profundidad pasan una puerta de calidez en la que un juez de otra familia de modelos puntúa la respuesta de 0 a 4, aceptando la reescritura a partir de 3 y etiquetándola como `friend` en lugar de `therapist` o `glazing`.

## Capacidades
- Generación de texto conversacional con un tono "cálido" y "contenido", según la definición del propio entrenamiento.
- Tool calling / function calling: soporta el formato de tools de Mistral y se puede cargar con `--tool-call-parser mistral` junto con `--enable-auto-tool-choice` en vLLM.
- Comportamiento de herramientas entrenado para ofrecer una herramienta en lugar de ejecutarla directamente cuando el usuario nombra una actividad.
- Compatibilidad con la cuantización W4A16 GPTQ y los kernels `gptq_marlin` en vLLM para Ampere, Ada, Hopper y Blackwell.
- Posible soporte multimodal latente: la arquitectura Mistral3 y la documentación mencionan una torre de visión y un proyector multimodal, aunque no se documenta el uso de imágenes ni se ofrecen ejemplos.
- Entrenamiento en conversaciones con contenido difícil (amenazas, fantasías sexuales, conexión humana) que puede otorgar cierta robustez en diálogos sensibles, si bien no hay datos de evaluación publicados.

## Casos de uso
- Atención al cliente empática: el modelo puede gestionar diálogos multi-turno con un tono cálido, útil en plataformas de soporte donde la satisfacción del usuario depende de la cercanía. Gracias a la cuantización W4A16, el despliegue es viable en una sola GPU de gama media.
- Agentes de soporte con tool calling: el entrenamiento específico en tools permite integrarlo en sistemas que consultan bases de datos de pedidos, crean tickets o buscan información. El modelo está afinado para ofrecer la herramienta antes de ejecutarla, lo que reduce acciones no deseadas.
- Moderación de contenido o gestión de conversaciones hostiles: el corpus incluye `threats_balanced` y `extreme_threats_balanced`, por lo que el modelo puede emplearse como asistente en entornos donde los usuarios expresan amenazas o frustración intensa.
- Prototipado rápido de chatbots con herramientas: la licencia Apache 2.0, el formato GPTQ y el comando de servido ya preparado permiten lanzar una demo funcional en vLLM sin necesidad de infraestructura cara.
- Investigación en seguridad de modelos: la composición del corpus, con categorías de contenido explícito y amenazas equilibradas, lo convierte en un candidato para estudiar cómo los modelos pequeños manejan temas sensibles tras un fine-tune.
- Despliegue on-premise en GPU Ampere+: el modelo está optimizado para `gptq_marlin`, por lo que puede servirse en una RTX A6000, A100 o RTX 4090 mediante vLLM, con una reducción del ancho de banda de pesos que mejora el coste por consulta en entornos con recursos restringidos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card menciona un porcentaje esperado de acierto en tool positives del 96,2% y cambios previstos en la longitud y la calidez de las respuestas, pero son métricas internas del proceso de entrenamiento, no comparativas frente a otros modelos. No se dispone de datos de MMLU, HumanEval, GSM8K ni de otras pruebas estándar.

## Requisitos de hardware
- VRAM estimada: partiendo de los 4.733.947.440 parámetros y de la reducción declarada de ~3,3x frente a BF16, los pesos cuantizados ocuparían aproximadamente 2,9 GB. Hay que añadir la VRAM de KV-cache y activaciones, que depende del contexto y del número de secuencias concurrentes. El tamaño del repositorio de HuggingFace es 15,1 GB, lo que sugiere que los archivos incluyen todos los tensores, incluidas las partes no cuantizadas.
- GPU recomendadas: Ampere (sm_86, A100, RTX A6000), Ada (sm_89, RTX 4090), Hopper (sm_90) y Blackwell (sm_100+). No es compatible con Turing ni arquitecturas anteriores.
- Consumo en GPU de consumidor: por el tamaño del modelo, una RTX 3090 o RTX 4090 (24 GB) debería ser suficiente para inferencia con contexto moderado, aunque no hay una confirmación oficial del autor.
- Opciones de despliegue: vLLM, usando el comando proporcionado en la model card. No se mencionan soportes para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares
No se dispone de comparaciones con modelos de la misma categoría en la información proporcionada. La única comparación directa es con el modelo base BF16:

| Modelo | Parametros | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|
| Modelo base BF16 | 4.733.947.440 | BF16 | Apache 2.0 | SafeTensors |
| Modelo W4A16 GPTQ | 4.733.947.440 | W4A16 GPTQ (g128 sym) | Apache 2.0 | SafeTensors (GPTQ) |

Según el autor, la versión cuantizada reduce el ancho de banda de pesos en ~3,3x con un coste conductual despreciable, pero no hay benchmarks que lo respalden frente a otras alternativas.

## Limitaciones y advertencias
- Sesgos conocidos: no se han publicado evaluaciones de sesgo. El corpus incluye contenido sensible y agresivo, por lo que el modelo podría reflejar asociaciones no deseadas si se le incita con esos temas.
- Riesgo de alucinación: no hay métricas de fiabilidad factual. Al ser un modelo de 4,73B, es esperable que alucine en preguntas de conocimiento enciclopédico, especialmente fuera del dominio conversacional.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están documentados. Es probable que el corpus sea predominantemente en inglés, aunque no se confirma.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero exige mantener los avisos de licencia y atribución.
- Caveat de producción: el modelo requiere vLLM y GPUs Ampere+ para aprovechar los kernels Marlin. En GPUs más antiguas no funcionará. Además, al ser un fine-tune sobre un corpus conversacional y de tool calling, su rendimiento en tareas generalistas o de razonamiento complejo puede ser pobre.
- El entrenamiento contiene material explícito (fantasías sexuales, amenazas). Aunque se presenta como equilibrado, el modelo puede generar contenido similar ante ciertas entradas. No hay una evaluación de seguridad publicada.
- El comportamiento "cálido" se ha introducido de forma deliberada, lo que puede resultar excesivo en contextos profesionales o jurídicos.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/BigBlueCeiling/frndo-run-028-warm-restrained-r32-W4A16_GPTQ
- Modelo base BF16: https://huggingface.co/BigBlueCeiling/frndo-run-028-warm-restrained-r32-bf16
- Perfil de BigBlueCeiling: https://huggingface.co/BigBlueCeiling
- Repositorio B2CQuantizer (según la model card): https://github.com/bigblueceiling/B2CQuantizer
