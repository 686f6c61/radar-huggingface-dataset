# hxbibb19/Llama-Reflex-1B-GGUF

## Resumen

Llama-Reflex-1B es un ajuste fino (fine-tune) del modelo meta-llama/Llama-3.2-1B-Instruct desarrollado por Sadman Habib (usuario hxbibb19) para el asistente de iOS OffLlama, que funciona sin conexión de red. El modelo no está pensado como un chat de propósito general, sino como un módulo de decisión ("System 1") que resuelve preguntas de opción múltiple en un único pase hacia delante: enrutar una petición a una herramienta, decidir si un dato debe recordarse, determinar si una consulta puede responderse offline, o si la app debe confirmar antes de actuar.

Técnicamente es un LoRA de rango 16 destilado a partir de 892 etiquetas generadas por el modelo profesor Muse Glimmer 30B (licencia Apache-2.0), fusionado en el modelo base y cuantizado a Q4_K_M para llama.cpp. El resultado es un GGUF de unos 807 MB, byte a byte idéntico al que se distribuye dentro de la app iOS y en la release de GitHub del proyecto.

Su relevancia radica en el enfoque: en lugar de generar texto libre, el modelo expone las probabilidades de las letras de opción (`" A"` … `" H"`) tras el token `Answer:`, y el runtime acepta la decisión solo si la probabilidad supera un umbral calibrado (τ = 0,90); en caso contrario aplica un fallback definido. Con 1.235.814.432 parámetros y solo inglés, es un ejemplo de destilación de decisiones con calibración explícita para despliegue en dispositivo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), ajuste fino con LoRA r=16 fusionado |
| Parámetros totales | 1.235.814.432 (1,2 B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama 3.2 1B Instruct; el autor no la especifica) |
| Tipos de cuantización | Q4_K_M publicada; f16, Q8_0, Q3_K_M y Q2_K evaluadas pero no publicadas |
| Idiomas soportados | inglés (en) |
| Licencia | Llama 3.2 Community License (derivado de Llama 3.2) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Llama 3.2 1B Instruct, un transformer decoder-only de 1,2 B parámetros con atención causal estándar. Sobre él se aplica un LoRA de rango 16 durante una sola época, con la pérdida calculada únicamente sobre el token de la letra de respuesta, en bf16, batch efectivo 8 y 112 pasos. El conjunto de entrenamiento son 892 preguntas de decisión tipadas respondidas por el profesor Muse Glimmer 30B (Apache-2.0). Posteriormente el adaptador se fusiona en los pesos base y se cuantiza a Q4_K_M con llama.cpp.

La innovación no está en la arquitectura sino en el paradigma de uso y en la calibración: cada decisión se formula como una pregunta de opción múltiple en formato de chat de Llama 3, y el runtime lee las probabilidades de las letras de opción en lugar de muestrear texto. Se acompaña de un fichero `calibration.json` con priors por decisión y el umbral por defecto τ = 0,90. Los doce tipos de decisión son `route`, `toolChoice`, `rememberOrNot`, `memoryConflict`, `notificationTriage`, `confirmBeforeAct`, `nudgeNow`, `timing`, `sensitivity`, `answerability`, `contactPick` y `eventPick`. Una segunda época y una variante etiquetada con Muse Spark Open fueron evaluadas y descartadas.

## Capacidades

- Clasificación de decisiones tipadas en opción múltiple (12 tipos predefinidos) en un solo pase hacia delante.
- Enrutamiento de peticiones: decidir si una consulta va a una herramienta, a memoria o a respuesta local.
- Decisión de memorización y resolución de conflictos de memoria.
- Evaluación de respondibilidad offline: determinar si un modelo pequeño en dispositivo puede contestar sin red.
- Triaje de notificaciones, temporización (`timing`, `nudgeNow`) y clasificación de sensibilidad.
- Selección de contactos y eventos (`contactPick`, `eventPick`).
- Confirmación previa a la acción (`confirmBeforeAct`) para operaciones sensibles.
- Lectura de probabilidades por token de opción para calibración y umbralización.
- No soporta tool calling genérico, agentes multi-paso ni generación de texto libre de calidad: su formato de salida está fijado por OffLlama.
- Sin capacidades de visión, audio ni modo de razonamiento extendido.
- Multilingüe: no; únicamente inglés.

## Casos de uso

- Asistente personal offline en iOS: el modelo decide en el dispositivo si una petición como "¿cuánto es 2+2?" puede resolverse localmente o requiere red, evitando latencia y preservando privacidad.
- Enrutamiento de herramientas en apps móviles: clasificar la intención del usuario y dirigirla al módulo adecuado (calculadora, calendario, búsqueda) mediante las decisiones `route` y `toolChoice`.
- Gestión de memoria del asistente: decidir si un hecho mencionado por el usuario debe almacenarse (`rememberOrNot`) y resolver contradicciones con la memoria existente (`memoryConflict`).
- Triaje de notificaciones: priorizar o silenciar avisos entrantes según `notificationTriage`, con fallback cuando la confianza es inferior a 0,90.
- Confirmación de acciones sensibles: antes de ejecutar una acción irreversible, el modelo evalúa `confirmBeforeAct` y `sensitivity` para solicitar confirmación al usuario.
- Selección de entidades: elegir el contacto o evento correcto en escenarios ambiguos (`contactPick`, `eventPick`) a partir del contexto conversacional.
- Control de temporización de sugerencias: decidir cuándo mostrar un aviso o recordatorio (`nudgeNow`, `timing`) sin interrumpir al usuario.
- Filtro de respondibilidad: marcar consultas como no respondibles offline (`answerability`) para derivarlas o pedir aclaración, reduciendo alucinaciones del modelo pequeño.

## Benchmarks y rendimiento

Datos publicados por el autor sobre un conjunto guardado de 120 preguntas de decisión (10 por cada tipo original), con los mismos prompts para ambos modelos:

| Métrica | Llama 3.2 1B Instruct | Llama-Reflex-1B |
|---|---|---|
| Opción correcta elegida | 89 / 120 (74,2 %) | 98 / 120 (81,7 %) |
| Error de calibración esperado (ECE, menor es mejor) | 0,150 | 0,064 |

Con el umbral de despliegue τ = 0,90, Llama-Reflex-1B aceptó 44 de 120 decisiones, de las cuales 41 fueron correctas; las otras 76 recurrieron al fallback. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8 GB con Q4_K_M (tamaño del fichero GGUF: 807.694.080 bytes); en torno a 2,5 GB en f16 y 1,3 GB en Q8_0 si se generasen esas cuantizaciones.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, así como en Apple Silicon (M1 en adelante) y en iPhone mediante llama.cpp.
- Despliegue: llama.cpp (`llama-server`), con el endpoint `/completion` y `n_probs` para leer las probabilidades de las letras; también integrable vía Ollama o cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles de forma numérica; el diseño apunta a un único token de salida por decisión, lo que minimiza el coste de generación.
- El modelo está pensado para ejecución local en dispositivo; no requiere GPU dedicada en el escenario objetivo (iPhone).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-Reflex-1B | 1,2 B | no disponible | Clasificador de decisiones destilado, salida de un token | Llama 3.2 Community | GGUF en HF |
| meta-llama/Llama-3.2-1B-Instruct | 1,2 B | 128 K (según Meta) | Chat generalista | Llama 3.2 Community | Pesos en HF |
| Muse Glimmer 30B (profesor) | 30 B (no disponible el detalle) | no disponible | Modelo profesor para etiquetado | Apache-2.0 | no disponible en la información |

La comparación relevante es con su propio modelo base: Llama-Reflex-1B mejora la precisión de decisión en 7,5 puntos y reduce el ECE de 0,150 a 0,064, a costa de perder la capacidad de generación libre. Frente a un modelo mayor como Muse Glimmer 30B, el interés está en sustituir llamadas al profesor por inferencia local de 0,8 GB.

## Limitaciones y advertencias

- El conjunto de evaluación son 120 ejemplos escritos por el autor; mide decisiones individuales, no el éxito de tareas completas en el teléfono.
- El umbral de 0,90 se eligió sobre los mismos datos usados para seleccionar el modelo, por lo que no constituye una cota de error certificada.
- Entrenado para los formatos de decisión fijos de OffLlama; no es un modelo de chat general y la calidad de generación libre es la de un modelo de 1 B.
- Solo inglés; no soporta otros idiomas.
- Riesgo de alucinación en generación libre si se usa fuera del formato previsto; el diseño mitiga esto con el fallback por umbral, no con el modelo en sí.
- Licencia Llama 3.2 Community: el uso comercial está sujeto a la Acceptable Use Policy de Llama 3.2 y a los requisitos de atribución de Meta.
- El modelo solo es útil si se respetan exactamente los prompts y el conjunto de opciones del repositorio OffLlama; desviarse de ellos invalida la calibración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hxbibb19/Llama-Reflex-1B-GGUF
- Repositorio OffLlama: https://github.com/hxbib/OffLlama
- Release con artefactos y etiquetas de entrenamiento: https://github.com/hxbib/OffLlama/releases/tag/artifacts-2026-11-01
- Documentación sobre límites de evaluación: https://github.com/hxbib/OffLlama/blob/master/docs/EVALUATION_CLAIMS.md
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Perfil del autor: https://www.linkedin.com/in/sadmanhabib/
