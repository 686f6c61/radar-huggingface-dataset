# Hakorr/Pena

## Resumen

Pena es un adaptador LoRA en formato GGUF desarrollado por Hakorr para el entrenamiento de un modelo base como entrenador de ajedrez. No es un modelo autónomo: se distribuye como un adaptador que debe cargarse junto al modelo base `Inkling-2-Mini-AD-IQ2_M.gguf` de AtomicChat, que no se incluye en el repositorio. El adaptador añade una capa de fine-tuning orientada a la explicación de jugadas, evaluación de defensas, táctica, conceptos posicionales y comentario de partidas, siempre anclada a un paquete de hechos de ajedrez precalculado.

El modelo resuelve un problema concreto: evitar que un LLM de propósito general invente evaluaciones o líneas de motor al hablar de ajedrez. Para ello exige que la entrada incluya un paquete de evidencias verificado en un formato propietario (`pcf/3p+pena-inkling-layout/1`), generado por el códec A.C.A.S. El adaptador aprende a citar únicamente hechos definidos en ese paquete y a declarar cuándo la evidencia es insuficiente.

El modelo tiene 9.842.688 parámetros totales según los safetensors del repositorio, lo que corresponde al adaptador LoRA más que al modelo base. El contexto de entrenamiento fue de 8.192 tokens, incluyendo la respuesta objetivo. Es un proyecto de nicho, con cero descargas y cero likes en el momento de la consulta, orientado a desarrolladores que quieran integrar un coach de ajedrez con respuestas auditables.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer (base Inkling-2-Mini) |
| Parámetros totales | 9.842.688 (adaptador) |
| Parámetros activos | no disponible |
| Longitud de contexto | 8.192 tokens (límite de entrenamiento) |
| Tipos de cuantización | GGUF (adaptador en formato GGUF; base en IQ2_M) |
| Idiomas soportados | no disponible |
| Licencia | GPL-3.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Pena es un adaptador LoRA de rango 16 (alpha 32, dropout 0.05, learning rate 0.0001) que actualiza únicamente las proyecciones de atención del modelo base congelado, un Inkling-2-Mini en variante «OpenUncensored» (AD-IQ2_M). El export corresponde al paso de checkpoint 570. El rango del adaptador en GGUF es 18 tras incorporar una edición de eliminación de rechazos de rango dos. El autor advierte explícitamente de que no debe emparejarse con un base ya descensurado, porque la edición de eliminación de rechazos ya está incluida en el adaptador.

El entrenamiento se realizó en una NVIDIA RTX PRO 6000 Blackwell Workstation Edition con 9.111 ejemplos, agrupados en 4.933 diálogos y 3.973 grupos de posición, con 486 ejemplos de validación y 500 de test. Se completaron 570 pasos de optimizador con 16 ejemplos por paso, lo que supone 9.120 exposiciones de ejemplo, aproximadamente una pasada sobre el split de entrenamiento. Una pasada completa equivale a 60.570.576 tokens de secuencia, de los cuales 1.015.211 son tokens objetivo supervisados. Solo la respuesta final del asistente, incluidos sus marcadores de rol y fin, recibe pérdida; los mensajes anteriores se enmascaran. Los datos de entrenamiento provienen del conjunto A.C.A.S e incluyen planes, explicaciones y comparaciones de jugadas, defensa, táctica, conceptos posicionales y BinProp, preguntas de seguimiento, comentario de partidas, charla informal y ayuda sobre la aplicación.

## Capacidades

- Generación de explicaciones de ajedrez ancladas a evidencia verificada, citando identificadores definidos en el paquete PCF/3p.
- Evaluación de defensas y ataques de piezas concretas, con respuesta del tipo «el rey en e1 defiende el peón en e2 [Q2]».
- Explicación y comparación de jugadas, planes y continuaciones condicionales.
- Razonamiento táctico y posicional a partir de hechos precalculados (material, controles, casillas legales, capturas, peones pasados/aislados/doblados).
- Comentario de partidas y respuesta a preguntas de seguimiento manteniendo el hilo conversacional.
- Declaración explícita de insuficiencia de evidencia cuando el paquete no cubre la pregunta.
- Charla informal y ayuda sobre la aplicación A.C.A.S.
- No es un motor de búsqueda de ajedrez: no calcula líneas ni evaluaciones por sí mismo.
- Soporte de tool calling / function calling: no disponible.
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso

- Coach de ajedrez conversacional: el modelo responde preguntas del tipo «¿está defendido mi peón en e2?» usando el paquete de evidencias generado por el códec A.C.A.S, lo que permite respuestas auditables y citables en lugar de evaluaciones inventadas.
- Análisis post-partida con comentario: dado un paquete con historial (`@Y`/`@O`), el modelo puede comentar jugadas pasadas y explicar motivos tácticos o posicionales sin necesidad de un motor externo durante la inferencia.
- Tutor interactivo para principiantes: las explicaciones sobre defensas, controles y casillas legales se apoyan en hechos verificados, lo que reduce el riesgo de que el alumno aprenda conceptos erróneos.
- Asistente integrado en aplicaciones de ajedrez: el formato de mensajes definido (system de instrucciones, system con `Verified evidence:`, user con `Player question:`) permite integrarlo en un backend que genere el paquete PCF/3p y llame al modelo.
- Preguntas de seguimiento multi-turno: el modelo admite turnos previos entre el paquete de evidencias y la pregunta actual, útil para sesiones de análisis prolongadas dentro del límite de 8.192 tokens.
- Evaluación de la calidad del propio paquete de evidencias: al exigir que el modelo cite solo hechos definidos, se puede usar como banco de pruebas para validar que el productor PCF/3p genera paquetes completos y coherentes.
- Docencia sobre conceptos posicionales concretos (peones pasados, aislados, doblados; perfiles heurísticos `@B`; motivos binarios `@BINS`) con respuestas referenciadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador en sí es pequeño (9,84 M de parámetros), pero requiere cargar el modelo base `Inkling-2-Mini-AD-IQ2_M.gguf` en cuantización IQ2_M, cuyo tamaño no se especifica en la información disponible.
- VRAM estimada para inferencia: no disponible (depende del tamaño del base, no indicado).
- GPU recomendadas: no disponible. El entrenamiento se realizó en una NVIDIA RTX PRO 6000 Blackwell Workstation Edition, pero no se especifican requisitos de inferencia.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: se requiere un runtime compatible con Inkling que aplique la plantilla de chat del base GGUF. No se debe envolver manualmente en tokens Qwen/ChatML. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (adaptadores LoRA para coaching de ajedrez o modelos especializados en dominios con evidencia estructurada).

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el base `Inkling-2-Mini-AD-IQ2_M.gguf` de AtomicChat, que no se distribuye en este repositorio.
- No debe emparejarse con un base ya descensurado, ya que el adaptador incluye su propia edición de eliminación de rechazos.
- No es un sustituto de un motor de ajedrez: no calcula líneas ni evaluaciones; solo razona sobre el paquete de evidencias que recibe.
- Requiere generar paquetes PCF/3p con el productor y códec A.C.A.S; editar manualmente los números del ejemplo no produce paquetes válidos.
- El límite de contexto de entrenamiento es de 8.192 tokens, incluyendo la respuesta objetivo; conversaciones o paquetes más largos pueden degradar la calidad.
- El formato de entrada es estricto (orden de mensajes, prefijo `Player question:`, línea de vinculación pregunta-sujeto); un formato incorrecto puede producir respuestas no ancladas.
- Riesgo de alucinación fuera del ámbito del paquete de evidencias: si el paquete omite hechos (`?` o `O=omitted`), el modelo debería declarar insuficiencia, pero no hay benchmarks publicados que lo verifiquen.
- Sesgos conocidos: no disponible.
- Idiomas soportados: no disponible; la documentación y los ejemplos están en inglés.
- Licencia GPL-3.0: impone obligaciones de copyleft para uso comercial y distribución de obras derivadas; conviene revisar la compatibilidad con el producto antes de integrarlo.
- Proyecto con cero descargas y cero likes en el momento de la consulta; madurez y soporte de la comunidad no verificables.

## Enlaces

- Hugging Face: https://huggingface.co/Hakorr/Pena
- Modelo base (GGUF): https://huggingface.co/AtomicChat/Inkling-2-Mini-GGUF/resolve/4f0c56af7e0c242e620be6394983d245b8c3fd27/Inkling-2-Mini-AD-IQ2_M.gguf
- Repositorio A.C.A.S (productor PCF y códec): https://github.com/Psyyke/A.C.A.S
- Paper referenciado en tags: arXiv:2610.23166 (no se dispone de URL verificada en la información proporcionada)
