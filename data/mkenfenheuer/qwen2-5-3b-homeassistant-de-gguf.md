# mkenfenheuer/qwen2.5-3b-homeassistant-de-GGUF

## Resumen

Qwen2.5-3B Home Assistant (German, GGUF) es un ajuste fino mediante LoRA de Qwen/Qwen2.5-3B-Instruct, desarrollado por mkenfenheuer, orientado a controlar una instalación de Home Assistant en alemán a través de llamadas a herramientas (tool calling) y a responder preguntas sobre el estado de los dispositivos. El modelo resuelve un problema muy concreto: convertir lenguaje natural alemán en llamadas estructuradas a los servicios de Home Assistant, con especial énfasis en no afirmar éxitos que la herramienta no ha confirmado.

Se distribuye únicamente en formato GGUF cuantizado a Q4_K_M (1,9 GB), pensado para inferencia en CPU con llama.cpp. El modelo base tiene 3.085.938.688 parámetros y una ventana de contexto de 8.192 tokens en la configuración recomendada por el autor. La licencia es la Qwen Research License Agreement, lo que restringe el uso a fines no comerciales.

Su relevancia actual radica en que demuestra que un modelo pequeño de 3B, ajustado con datos sintéticos específicos de dominio, puede alcanzar una fiabilidad alta (96 % de llamadas correctas en la evaluación del autor) en una tarea de automatización del hogar, ejecutándose en hardware modesto sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), ajuste fino LoRA fusionado |
| Parametros totales | 3.085.938.688 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (configuración recomendada con `-c 8192`); contexto nativo del base Qwen2.5-3B no especificado en la información disponible |
| Tipos de cuantizacion | Q4_K_M (único publicado) |
| Idiomas soportados | Alemán (`de`) |
| Licencia | Qwen Research License Agreement (`qwen-research`), solo uso no comercial |
| Formato de pesos | GGUF (`qwen2.5-3b-ha-v4-Q4_K_M.gguf`, 1,9 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer decoder-only de 3B parámetros, sobre el que se aplicó un ajuste fino LoRA con rango 32, alpha 64, sobre todas las capas lineales, durante 2,5 épocas, con learning rate 2e-4 y cálculo de pérdida únicamente sobre los tokens del asistente. El entrenamiento se realizó en una RTX 3090 y llevó 4,8 horas. Los adaptadores LoRA se fusionaron en los pesos base antes de la conversión a GGUF y la cuantización Q4_K_M.

Los datos de entrenamiento provienen del dataset `mkenfenheuer/homeassistant-tool-calling-de`, compuesto por 8.000 conversaciones sintéticas en alemán sobre casas generadas aleatoriamente con hasta 110 entidades, incluyendo entidades de grupo, habitaciones sin luces, luces nombradas según su habitación, varios dispositivos de riego, marcas comerciales, dispositivos no presentes en la lista, dispositivos inaccesibles y conversaciones multi-turno. Una innovación destacable es la verificación de cada respuesta de entrenamiento contra los resultados de las herramientas precedentes: ninguna respuesta afirma un éxito que la herramienta no haya reportado, lo que enseña al modelo a informar de fallos y a mantener la coherencia en turnos posteriores.

## Capacidades

- Generación de texto conversacional en alemán orientada a dominios de hogar conectado.
- Tool calling con dos herramientas definidas: `control` (invoca servicios de Home Assistant) y `get_state` (consulta el estado de entidades).
- Razonamiento multi-turno: mantiene el contexto de conversaciones anteriores, incluyendo correcciones del usuario y preguntas de seguimiento del tipo "¿Está ahora encendido?" o "Inténtalo otra vez".
- Informe honesto de errores: cuando `control` devuelve `{"success": false, ...}`, el modelo reporta el fallo en lugar de simular éxito.
- Manejo de listas de entidades: resuelve consultas como "¿Qué luces están encendidas?" o "Apaga todas las luces" en casas con muchas entidades.
- Desambiguación de nombres de entidad: distingue entre dispositivos con nombres similares (por ejemplo, "Küche", "Küche Links" y "Küche Rechts").
- No soporta temporizadores, automatizaciones, pronósticos meteorológicos ni conocimiento general.

## Casos de uso

- Control por voz o texto de una instalación doméstica en alemán: el modelo recibe la instrucción del usuario y la lista de entidades expuestas, y emite llamadas `control` a los servicios de Home Assistant. Es adecuado por su entrenamiento específico en el esquema de herramientas y en nombres de entidades alemanes.
- Asistente conversacional multi-turno en el hogar: gestiona correcciones y preguntas de seguimiento ("No, me refería al comedor", "¿Está ahora encendida?") gracias al entrenamiento con diálogos multi-turno y a su ventana de 8k tokens.
- Consulta de estados de dispositivos: responde preguntas sobre qué luces están encendidas o el estado de un dispositivo concreto mediante `get_state`, sin inventar estados.
- Despliegue en hardware sin GPU: al estar cuantizado a Q4_K_M (1,9 GB) y ejecutarse con llama.cpp en CPU, es viable en mini-PC, Raspberry Pi de gama alta o servidores domésticos de bajo consumo.
- Integración como backend LLM de Home Assistant: el proyecto incluye una integración y un add-on que construyen automáticamente el prompt de sistema y el esquema de herramientas, por lo que el modelo se puede enchufar directamente como motor de lenguaje del asistente.
- Automatización de rutinas domésticas por lenguaje natural: frases como "Riega las plantas del balcón" se traducen en llamadas al servicio de riego correspondiente, con distinción entre dispositivos de jardín y de balcón.
- Entornos de demostración y pruebas: útil para validar pipelines de tool calling en alemán antes de pasar a modelos mayores, dado su bajo coste de inferencia y su latencia de 3,0 s de mediana en 8 hilos de CPU.

## Benchmarks y rendimiento

Evaluación del autor sobre 300 conversaciones retenidas (datos de v4) en casas no vistas durante el entrenamiento:

| Modelo | Llamadas a herramienta correctas | Respuestas fundamentadas | Comandos | Errores reportados |
|---|---|---|---|---|
| v3 | 93,3 % | 96,8 % | 111/119 | 8/10 |
| v4 (actual) | 96,0 % | 100 % | 117/119 | 10/10 |

Resultados adicionales reportados por el autor:

| Prueba | Resultado |
|---|---|
| Casa real con más de 100 entidades expuestas (31 frases de aceptación) | 31/31 correctas (v3: 30/31) |
| Diálogos multi-turno simulados con dispositivos inaccesibles (18) | v4 nunca afirma éxito en un dispositivo que falló |
| Prueba extremo a extremo en Home Assistant 2026.10.4 (24 frases) | 24/24 correctas, latencia mediana 3,0 s en 8 hilos de CPU |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el archivo Q4_K_M ocupa 1,9 GB y cabe en memoria RAM de sistema.
- GPU recomendadas: no son necesarias; cualquier GPU con al menos 2-3 GB de VRAM puede alojar el modelo cuantizado, pero el caso de uso previsto es CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con 3 GB o más de VRAM (por ejemplo, GTX 1650, RTX 3050 en adelante), aunque el rendimiento en CPU es suficiente según el autor.
- Opciones de despliegue: llama.cpp mediante `llama-server` con `--jinja -c 8192 --port 8080`; integración y add-on del repositorio del proyecto para Home Assistant. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: latencia mediana de 3,0 s en 8 hilos de CPU en la prueba extremo a extremo reportada por el autor; throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen2.5-3B Home Assistant (este modelo) | 3,09B | 8.192 (config. recomendada) | Tool calling para Home Assistant en alemán | Qwen Research (no comercial) | GGUF Q4_K_M |
| Qwen/Qwen2.5-3B-Instruct (base) | 3,09B | No disponible en la información proporcionada | Instrucción general, multilingüe | Qwen Research / Apache 2.0 según variante (no confirmado) | Safetensors, GGUF (comunidad) |
| Alternativas especializadas en tool calling para hogar en alemán | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos con otros modelos especializados en la información proporcionada.

## Limitaciones y advertencias

- Solo alemán: no soporta otros idiomas, aunque el modelo base sea multilingüe.
- Cobertura funcional restringida: únicamente los servicios listados en `llm_schema.SERVICES`; no gestiona temporizadores, automatizaciones, pronósticos meteorológicos ni preguntas de conocimiento general.
- Límite de contexto: por encima de unas 250 entidades expuestas, los 8k tokens no son suficientes para incluir la lista completa de entidades en el prompt.
- Errores en listas largas: la mayoría de fallos restantes se producen en consultas con muchas entidades ("¿Qué luces están encendidas?" o "Apaga todas las luces"), donde el modelo copia mal u omite algún `entity_id`.
- Error conocido en correcciones: tras "Licht in der Küche an", la corrección "Nein, ich meinte im Esszimmer" apaga solo una de las cuatro luces de la cocina.
- Riesgo de alucinación mitigado pero no eliminado: el entrenamiento verifica las respuestas contra los resultados de las herramientas, pero el modelo sigue siendo un LLM de 3B y puede producir salidas incorrectas en escenarios no cubiertos.
- Licencia restrictiva: derivado de Qwen2.5-3B-Instruct bajo Qwen Research License Agreement, solo para uso no comercial. Cualquier despliegue comercial requiere revisar los términos con el titular de la licencia.
- Sesgos: no se documentan sesgos específicos en la información disponible; al entrenarse con datos sintéticos de casas generadas, la distribución de nombres y dispositivos puede no reflejar instalaciones reales diversas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mkenfenheuer/qwen2.5-3b-homeassistant-de-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/mkenfenheuer/homeassistant-tool-calling-de
- Repositorio del proyecto (GitHub): https://github.com/mKenfenheuer/homeassistant-llm
- README del modelo en GitHub: https://github.com/mKenfenheuer/homeassistant-llm/blob/main/hf/model/README.md
- Directorio del modelo en GitHub: https://github.com/mKenfenheuer/homeassistant-llm/tree/main/hf/model
