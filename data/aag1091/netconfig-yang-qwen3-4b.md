# aag1091/netconfig-yang-qwen3-4b

## Resumen

netconfig-yang-qwen3-4b es un ajuste fino completo (full fine-tune) del modelo base Qwen/Qwen3-4B-Base, desarrollado por el autor aag1091 dentro del proyecto NetConfig SLM. El modelo está especializado en razonar sobre el esquema YANG nativo de Cisco IOS XE (release 26.2.1, conjunto de módulos Catalyst 9300 / cat9k): interpretar el tipo de una hoja (leaf), determinar si una instancia de configuración es válida según el esquema y explicar por qué, reconstruir el estado completo de una interfaz, expresar ediciones tipadas y evaluar si un perfil de despliegue más estricto permite un valor concreto.

Con 4.022.468.096 parámetros (aproximadamente 4B), el modelo se distribuye en formato safetensors con licencia Apache 2.0 y un repositorio de 8,1 GB que incluye además una cuantización Q4_K_M en GGUF para uso local con Ollama o llama.cpp. Está pensado como artefacto de investigación dentro de un proyecto abierto, no como herramienta de producción de red.

Su relevancia radica en la especialización vertical: en lugar de un modelo generalista, aplica un ajuste fino sobre un corpus pequeño pero verificado mecánicamente con herramientas como pyang y yangson, lo que permite evaluar con rigor su comportamiento en tareas concretas de validación de esquemas YANG, un área donde los modelos generalistas suelen fallar por falta de conocimiento del esquema específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-4B-Base) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con max_len 1536) |
| Tipos de cuantizacion | Q4_K_M (GGUF incluido en el repositorio) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B-Base, un transformer decoder-only de aproximadamente 4B parámetros, sobre el que se realiza un ajuste fino completo durante 2 épocas, con batch efectivo de 16, learning rate 1e-5 con decaimiento coseno, longitud máxima de 1536 tokens y función de pérdida calculada solo sobre la completación (completion-only loss). La pérdida final de entrenamiento reportada es de 0,184.

El corpus de entrenamiento, denominado yang-learn corpus v1, contiene 1.047 registros repartidos en cinco familias de tareas: significado de rutas, validez de instancias, reconstrucción de estado, ediciones tipadas y juicios sobre esquemas revisados o perfiles. Cada hecho se extrajo con pyang y cada veredicto de instancia se generó con yangson 1.7.9 contra una biblioteca RFC 7895 acotada, de modo que las etiquetas y los veredictos no proceden del propio modelo ni de la misma herramienta. El corpus quedó congelado en el commit `5189d33` del repositorio del proyecto. No se menciona en la información disponible el uso de RLHF o DPO.

## Capacidades

- Razonamiento sobre el esquema YANG nativo de Cisco IOS XE 26.2.1 para el conjunto de módulos cat9k.
- Interpretación del significado de rutas y tipos de hojas del esquema.
- Validación de instancias de configuración contra el esquema, con veredicto y justificación.
- Reconstrucción del estado completo de una interfaz.
- Expresión de ediciones tipadas sobre la configuración.
- Evaluación de valores frente a perfiles de despliegue más estrictos y esquemas revisados.
- Generación de texto conversacional en formato ChatML.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Validación previa de configuraciones YANG: el modelo puede recibir una instancia de configuración y emitir un veredicto de validez según el esquema, útil como primera barrera en pipelines de integración antes de aplicar cambios en un dispositivo.
- Asistencia a ingenieros de red en la interpretación del esquema: permite consultar el significado de una ruta o el tipo esperado de una hoja del esquema IOS XE sin navegar manualmente por los ficheros YANG.
- Reconstrucción de estado de interfaces: dado un conjunto de datos, el modelo genera el estado completo esperado de una interfaz, lo que puede servir para comparar contra el estado real del dispositivo.
- Generación de ediciones tipadas: ayuda a expresar cambios de configuración respetando los tipos definidos en el esquema, reduciendo errores de sintaxis o de tipo.
- Evaluación de perfiles de despliegue: permite comprobar si un valor concreto es admisible bajo un perfil más estricto que el esquema base, útil en entornos con políticas de cumplimiento.
- Formación y documentación interna: al estar entrenado sobre un esquema concreto, puede emplearse como herramienta de apoyo en la elaboración de guías y material didáctico sobre IOS XE y YANG.
- Prototipado de asistentes de automatización de red: integrado en un flujo con Ollama o llama.cpp, sirve para experimentar con asistentes locales especializados en validación de configuración.

## Benchmarks y rendimiento

Resultados del bench v1 (217 ítems, corrección mecánica, perfiles e interfaces disjuntos del entrenamiento):

| Familia de tarea | Puntuacion |
|---|---|
| Reconstruccion de estado | 40/40 = 100% |
| Ediciones tipadas | 38/42 = 90,5% |
| Validez de instancia (veredicto) | 56/73 = 76,7% |
| Esquema revisado (solo veredicto) | 26/28 = 92,9% |
| Esquema revisado (veredicto + cita exacta) | 13/28 = 46,4% |
| Significado de ruta (tipo literal) | 13/34 = 38,2% |
| Total | 160/217 = 73,7% |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo de 4B en Q4_K_M se sitúa típicamente en el rango de 3-4 GB, aunque el autor no publica cifras.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: el repositorio incluye una cuantización Q4_K_M en GGUF, lo que permite su ejecución en GPU de consumo y en CPU mediante llama.cpp u Ollama; el autor no detalla modelos concretos.
- Opciones de despliegue: Ollama y llama.cpp (soportados por el GGUF incluido); vLLM y TGI no se mencionan en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| netconfig-yang-qwen3-4b | 4,02B | no disponible | Esquema YANG IOS XE 26.2.1 | apache-2.0 | Hugging Face |
| netconfig-slm-qwen3-4b | no disponible | no disponible | Generacion de CLI IOS XE | no disponible | Hugging Face |
| Qwen/Qwen3-4B-Base | ~4B | no disponible | Modelo base generalista | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada.

## Limitaciones y advertencias

- La validez según el esquema no equivale a aceptación por el dispositivo: los veredictos describen el esquema YANG, no el comportamiento real de IOS XE, que aplica comprobaciones adicionales. Debe verificarse contra un dispositivo o laboratorio antes de su uso.
- El alcance de plataforma es el conjunto de módulos de la familia cat9k; el comportamiento específico por SKU (por ejemplo, un modelo concreto de Catalyst 9300) no está verificado de forma separada.
- El modelo presenta un recall bajo en la expresión literal de tipos para hojas con typedef o pattern (38,2%).
- Aunque suele alcanzar el veredicto correcto de perfil, a menudo omite la cita exacta de la regla (46,4% cuando se exige veredicto y cita).
- Aproximadamente un tercio de las generaciones continúan más allá de la respuesta con texto de seguimiento fabricado; las respuestas que terminan limpiamente puntúan un 83% frente al 52% de las demás.
- Riesgo de alucinación en la generación de texto de seguimiento y en la recuperación de expresiones de tipo.
- Solo soporta inglés.
- Es un artefacto de investigación de un proyecto abierto, no una herramienta de red de producción.
- Sesgos conocidos: no disponible.

## Enlaces

- Hugging Face: https://huggingface.co/aag1091/netconfig-yang-qwen3-4b
- Modelo hermano: https://huggingface.co/aag1091/netconfig-slm-qwen3-4b
- Repositorio del proyecto: https://github.com/aag1091-alt/netconfig-slm
- Blog del proyecto: https://slm.aag1091.com
