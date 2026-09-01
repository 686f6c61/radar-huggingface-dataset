# solomoniw/CallForge-1B-v1

## Resumen

CallForge-1B-v1 es un modelo de lenguaje de 1.080 millones de parámetros, desarrollado por Solomon W (usuario solomoniw) como una vista previa de investigación para la emisión de llamadas a herramientas en un dialecto XML nativo. Está afinado mediante LoRA (r=16) sobre el modelo base openbmb/MiniCPM5-1B, con un corpus sintético de 300 trayectorias de uso de herramientas que cubren 5 herramientas distintas y 186 cadenas de solicitud únicas. Su propósito es explorar si un modelo pequeño puede aprender a seleccionar y llamar herramientas de forma fiable, generalizar a esquemas no vistos y abstenerse cuando ninguna herramienta encaja.

La relevancia de este modelo radica en que aborda un problema práctico: el tool calling en modelos compactos, un área donde los modelos grandes suelen dominar. CallForge-1B-v1 demuestra que con un ajuste fino dirigido y un corpus pequeño se pueden obtener resultados competentes en tareas de selección de herramientas, aunque con limitaciones claras en cuanto a contexto entrenado (1024 tokens) y sin alineación por preferencias. Es una pieza de investigación reproducible, con un script de evaluación incluido en el repositorio, y no está pensado para uso en producción sin validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de openbmb/MiniCPM5-1B, etiquetado como llama) |
| Parametros totales | 1.080.632.832 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1024 tokens (entrenamiento); 131072 en config (heredado, no refleja capacidad entrenada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en MiniCPM5-1B, un transformer de 1B parámetros, sobre el que se aplica un ajuste fino con LoRA de rango 16. El entrenamiento se realizó con una longitud de secuencia de 1024 tokens y un corpus sintético de 300 trayectorias de tool-use, generadas sobre 5 herramientas concretas (`get_weather`, `search_web`, `send_email`, `create_calendar_event`, `list_files`). El método es exclusivamente supervisado (SFT); no se empleó RLHF ni DPO. La innovación principal es la emisión de llamadas en un dialecto XML nativo con bloques `<function>` y `<param>`, que se parsean de forma estricta durante la evaluación. No se reportan técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Emisión de llamadas a herramientas en formato XML nativo (`<function>` / `<param>`), con salida bien formada y parseable.
- Selección de herramienta única para solicitudes inequívocas: 8/8 en el conjunto de evaluación.
- Llamadas paralelas: emite múltiples bloques `<function>` en un solo turno cuando la solicitud requiere varias herramientas independientes (9/10).
- Abstención: responde directamente cuando ninguna herramienta ofrecida encaja, en lugar de forzar una llamada irrelevante (8/8).
- Generalización a herramientas no vistas: correcto en 10/10 casos con herramientas como `restart_server`, `scale_deployment` y `revoke_api_key`, leyendo el esquema proporcionado en lugar de memorizar nombres.
- Resistencia a prompt injection: 8/8 defensas en el conjunto de prueba, aunque el autor advierte que no establece inmunidad categórica.
- No se reportan capacidades de visión, audio, razonamiento matemático avanzado ni generación de código más allá del contexto de tool calling.

## Casos de uso

- Investigación sobre tool calling en modelos pequeños: permite estudiar cómo un modelo de 1B aprende a seleccionar y llamar herramientas con un corpus mínimo, y comparar estrategias de ajuste fino.
- Reproducción de evaluaciones: el script `eval/benchmarks/run_real_capability_eval.py` incluido en el repositorio permite reproducir o refutar los resultados publicados, útil para validar metodologías de evaluación.
- Prototipado de agentes conversacionales con herramientas: se puede integrar en un bucle de agente que valide las llamadas emitidas antes de ejecutarlas, por ejemplo para consultar el tiempo o buscar en la web, siempre con confirmación humana.
- Experimentación con abstención y relevancia: su capacidad de responder directamente cuando no hay herramienta adecuada lo hace útil para estudiar comportamientos de rechazo en sistemas de diálogo.
- Desarrollo de pipelines de tool calling con esquemas dinámicos: su generalización a herramientas no vistas sugiere que puede adaptarse a esquemas nuevos si se le proporciona la definición, aunque con cautela por el pequeño corpus de entrenamiento.
- Evaluación de robustez frente a prompt injection: su resistencia medida (8/8) lo convierte en un banco de pruebas para técnicas de defensa en modelos pequeños, aunque con muestras limitadas.

## Benchmarks y rendimiento

La model card reporta resultados medidos con el script de evaluación incluido, con muestras pequeñas (n=8-10) e intervalos de confianza de Wilson al 95%. Se retractan explícitamente los resultados anteriores fabricados (incluidos "94.5% BFCL v3" y "100% Byzantine Injection Defense").

| Capacidad | Resultado medido | IC 95% | n |
|---|---|---|---|
| Selección de llamada simple | 100.0% (8/8) | [67.6%, 100.0%] | 8 |
| Generalización a herramientas no vistas | 100.0% (10/10) | [72.2%, 100.0%] | 10 |
| Relevancia / abstención | 100.0% (8/8) | [67.6%, 100.0%] | 8 |
| Resistencia a prompt injection | 8/8 defendido | [67.6%, 100.0%] | 8 |
| Llamadas paralelas / múltiples | 90.0% (9/10) | [59.6%, 98.2%] | 10 |

No se han ejecutado suites estándar como BFCL v3, StableToolBench, unicode-homoglyph, deep-schema-nesting o circular-dependency. No se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

- Al ser un modelo de 1.08B parámetros, es viable en GPUs de consumo. Con precisión fp16, el peso ocupa aproximadamente 2.2 GB; con cuantización de 4 bits, alrededor de 0.6 GB, aunque no se han publicado configuraciones de cuantización oficiales.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, GTX 1660 Super) para inferencia en fp16; para cuantización ligera, incluso 2 GB podrían ser suficientes, pero no hay datos verificados.
- Opciones de despliegue: al ser un modelo transformers estándar, es compatible con bibliotecas como Hugging Face Transformers, y potencialmente con vLLM, llama.cpp u Ollama, aunque no se ha confirmado su compatibilidad con estos motores.
- Latencia y throughput: no se han publicado mediciones. Para un modelo de este tamaño, se espera una latencia de decodificación de decenas de milisegundos por token en GPUs modernas, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de tool calling de tamaño similar. La model card no incluye referencias a alternativas como modelos de 1B especializados en function calling (por ejemplo, algunos derivados de Llama-1B o Qwen-1.5B). Por tanto, no se puede establecer una comparación objetiva con datos verificados.

## Limitaciones y advertencias

- La llamada múltiple no es perfecta: en un caso (1/10) el modelo omitió una herramienta prerequisito y afirmó en la salida que la había ejecutado, lo que supone un riesgo de alucinación de acciones no realizadas.
- Distribución de entrenamiento muy estrecha: solo 300 trayectorias sintéticas sobre 5 herramientas y 186 solicitudes únicas; la generalización medida es buena pero no garantiza robustez en dominios amplios.
- Evaluación con muestras pequeñas (n=8-10): los intervalos de confianza son amplios; un 100% con n=8 es consistente con una tasa real tan baja como ~68%.
- Contexto entrenado limitado a 1024 tokens; el valor de 131072 en `max_position_embeddings` es heredado del modelo base y no refleja capacidad real entrenada.
- Sin alineación por preferencias (solo SFT), lo que puede afectar a la calidad de las respuestas en diálogos abiertos.
- No es apto para uso en producción sin validación externa: el autor recomienda no confiarlo en bucles de agente que ejecuten acciones reales (envío de correos, mutación de infraestructura) sin confirmación y verificación de las llamadas emitidas.
- Los resultados de benchmarks anteriores fueron fabricados y retractados; cualquier cifra fuera de las reportadas en esta ficha debe considerarse no verificada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/solomoniw/CallForge-1B-v1
- Perfil del autor: https://huggingface.co/solomoniw
- Paquete PyPI relacionado (callforge-ai): https://pypi.org/project/callforge-ai/
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-1B
