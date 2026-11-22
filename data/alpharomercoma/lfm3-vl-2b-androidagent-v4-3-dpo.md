# alpharomercoma/LFM3-VL-2B-AndroidAgent-v4.3-dpo

## Resumen

LFM3-VL-2B-AndroidAgent-v4.3-dpo es un ajuste fino (fine-tune) experimental del modelo multimodal LFM3-VL-2B de LiquidAI, especializado en actuar como agente que opera un telefono Android a partir de capturas de pantalla. Lo desarrolla el usuario independiente alpharomercoma y se distribuye como un modelo de investigación de 1.918.181.888 parámetros (aproximadamente 1,9 mil millones) con licencia LFM Open License v1.0. El modelo resuelve la tarea de "GUI agent": dado un objetivo en lenguaje natural, una lista de aplicaciones instaladas, el historial de los ultimos 8 pasos y una captura de pantalla, debe emitir la siguiente accion como un JSON compacto con coordenadas normalizadas en una rejilla de 0 a 1000.

La relevancia de esta ficha es doble. Por un lado, documenta una tecnica concreta de alineacion: DPO a nivel de paso (step-level DPO, beta 0.1) combinado con un 0,5 de SFT sobre el paso preferido, partiendo de los pesos fusionados de la version v4.2 y anadiendo un LoRA solo de lenguaje (r64/alpha128) con la torre de vision y el proyector congelados. Por otro, y esto es lo mas importante, se trata de un **resultado negativo documentado**: el autor declara explicitamente que el modelo fallo su puerta de evaluacion offline y no fue evaluado online.

Segun la model card, la precision de paso de alto nivel en AndroidControl cayo de 0,732 (v4.2) a 0,545 (v4.3-dpo), por debajo del umbral de 0,712, con colapso de tipos de accion completos (`open_app` de 0,95 a 0,16, `wait` de 0,59 a 0,00, `scroll` de 0,62 a 0,16). El autor mantiene el modelo publico como resultado negativo y recomienda usar v4.2. Esta ficha describe el modelo tal como se publico, sin ocultar ese fallo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3-VL (modelo base LiquidAI/LFM3-VL-2B, multimodal image-text-to-text) con LoRA de lenguaje fusionado |
| Parametros totales | 1.918.181.888 (aprox. 1,9 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (historial de texto limitado a los ultimos 8 pasos) |
| Tipos de cuantizacion | GGUF de 4 bits disponible en el repo hermano `LFM3-VL-2B-AndroidAgent-v4.3-dpo-GGUF`; pesos originales en safetensors |
| Idiomas soportados | ingles (en) |
| Licencia | LFM Open License v1.0 (heredada de LiquidAI/LFM3-VL-2B) |
| Formato de pesos | safetensors (transformers), GGUF (4 bits), adaptador LoRA en `lora_adapter/` |

## Arquitectura y entrenamiento

El modelo parte de los pesos fusionados de v4.2 y aplica un LoRA **solo de lenguaje** con rango 64 y alpha 128, que se fusiona en los pesos finales; la torre de vision y el proyector permanecen congelados. La entrada visual es una captura de pantalla por paso, redimensionada a un area maxima de 880 x 880 px (aproximadamente 720 tokens de imagen). La entrada textual sigue una plantilla fija con `Goal:`, `Installed apps:`, `Previous steps:` (ultimos 8 pasos en formato `n. <intent> -> <action JSON>`) y la pregunta `What is the next action?`. La salida es un bloque `<think>` con una intencion corta seguido de una unica accion JSON. La decodificacion recomendada es con "thinking" activado y temperatura 0.

El entrenamiento es un DPO a nivel de paso con beta 0.1 mas un 0,5 de SFT sobre el paso preferido. Los pares se generaron haciendo que v4.2 decodificara sus propias filas de entrenamiento de forma greedy; donde su accion era incorrecta segun el scorer de AndroidControl, el par queda formado por el paso humano (preferido) frente al paso propio del modelo (rechazado). Se excluyeron las filas con `wait` humano en el lado preferido. No se uso entorno, modelo profesor ni datos de benchmark. El autor atribuye el fallo a que 3.039 de los 4.163 pares eran clics o escrituras erroneas genericas y a que `wait` solo aparecia como lado rechazado, lo que hizo que el DPO degradara esos tipos de accion de forma global.

## Capacidades

- Generacion de acciones de interfaz en formato JSON compacto a partir de una captura de pantalla: `click`, `long_press`, `input_text`, `scroll`, `open_app`, `navigate_back`, `navigate_home`, `keyboard_enter`, `wait`, `answer` y `status`.
- Coordenadas normalizadas en rejilla entera 0-1000 sobre la captura.
- Razonamiento breve en modo "thinking" (`<think>intent</think>`) antes de la accion.
- Comprension de imagen-texto (image-text-to-text) para interpretar la pantalla actual.
- Seguimiento de historial de hasta 8 pasos previos en texto.
- Seleccion de aplicaciones restringida a la lista de apps instaladas proporcionada.
- Respuesta a preguntas del objetivo mediante la accion `answer`, con formato corto.
- Cierre de tareas mediante `status` con `goal_status` `complete` o `infeasible`.
- Capacidad multilingue limitada al ingles.
- No dispone de tool calling generico ni de function calling fuera del esquema de acciones descrito.

## Casos de uso

- **Investigacion en alineacion de agentes GUI**: usar el modelo como caso de estudio de DPO a nivel de paso y de como el desbalance de pares puede colapsar tipos de accion; el propio autor lo publica como resultado negativo reproducible.
- **Prototipado de agentes Android en laboratorio**: ejecutar el modelo sobre emuladores o dispositivos de prueba para inspeccionar sus salidas JSON y comparar con v4.2; adecuado por su tamano reducido (1,9 B) y su formato de accion cerrado.
- **Generacion de datos sinteticos de interaccion movil**: emplear sus predicciones como candidatos para construir pares preferido/rechazado en pipelines de DPO, siempre con revision humana y sin uso en produccion.
- **Evaluacion de robustez de agentes**: someterlo a pantallas y objetivos variados para medir la tasa de colapso de acciones (`open_app`, `wait`, `scroll`) y validar scorers tipo AndroidControl.
- **Despliegue en dispositivo de bajos recursos para demos**: gracias a su cuantizacion GGUF de 4 bits y a sus ~1,9 B de parametros, puede ejecutarse en hardware modesto para demostraciones controladas de un agente de captura de pantalla.
- **Estudio de congelacion de torre de vision**: analizar como un LoRA solo de lenguaje afecta al comportamiento multimodal cuando la torre visual y el proyector estan congelados.
- **Linea base negativa en comparativas**: utilizarlo como referencia de "que no hacer" frente a v4.2 y v4.3-dpo2 en experimentos de alineacion de agentes.

## Benchmarks y rendimiento

Datos publicados en la model card (evaluacion offline, puerta de calidad):

| Metrica offline | v4.2 | v4.3-dpo | Umbral |
|---|---|---|---|
| Precision de paso de alto nivel en AndroidControl | 0,732 | 0,545 | >= 0,712 (falla) |
| Precision terminal `complete` | 0,738 | 0,885 | >= 0,70 |
| dev_answer | 0,868 | 0,875 | >= 0,848 |

Desglose por tipo de accion (AndroidControl, alto nivel):

| Tipo de accion | v4.2 | v4.3-dpo |
|---|---|---|
| `open_app` | 0,95 | 0,16 |
| `wait` | 0,59 | 0,00 |
| `scroll` | 0,62 | 0,16 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El modelo no fue evaluado online.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por tamano (~1,9 B de parametros) se situa en el rango de modelos pequenos, y la variante GGUF de 4 bits reduce el peso de forma notable respecto a los safetensors (repo de 4,1 GB).
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, cabe en GPUs de consumo, pero no se confirma modelo concreto.
- Cabe en GPU de consumo: si, por el tamano del modelo; sin datos oficiales de modelo concreto.
- Opciones de despliegue: transformers (libreria declarada, con `custom_code`), y GGUF para runtimes compatibles; vLLM, llama.cpp, Ollama o TGI no se mencionan en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Estado |
|---|---|---|---|---|---|
| LFM3-VL-2B-AndroidAgent-v4.3-dpo (este) | ~1,9 B | no disponible (historial 8 pasos) | Agente Android, DPO a nivel de paso | LFM Open License v1.0 | Fallo la puerta offline (0,545) |
| LFM3-VL-2B-AndroidAgent-v4.2 | ~1,9 B | no disponible (historial 8 pasos) | Agente Android (base de este) | LFM Open License v1.0 | Precision de paso 0,732; recomendado por el autor |
| LFM3-VL-2B-AndroidAgent-v4.3-dpo2 | ~1,9 B | no disponible | Correccion del fallo de v4.3-dpo | LFM Open License v1.0 | Version de correccion citada por el autor |
| LiquidAI/LFM3-VL-2B (base) | ~1,9 B | no disponible | Modelo multimodal general image-text-to-text | LFM Open License v1.0 | Modelo base sin ajuste de agente |

No se dispone de datos comparativos de rendimiento frente a otros agentes GUI de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- **Modelo de investigacion**: el autor advierte explicitamente de no dejarlo actuar sin supervision en un telefono con cuentas reales, mensajes o pagos.
- **Resultado negativo**: fallo la puerta offline (0,545 frente al umbral de 0,712) y colapso de tipos de accion (`open_app`, `wait`, `scroll`); el autor recomienda usar v4.2.
- **No evaluado online**: puede comportarse peor que v4.2 en uso real.
- **Idioma**: solo objetivos en ingles.
- **Memoria limitada**: una captura por paso y sin memoria mas alla de los 8 pasos de historial textual.
- **Riesgo de alucinacion**: puede emitir acciones o nombres de aplicaciones no presentes en la lista de apps instaladas; el esquema JSON no lo impide por si mismo.
- **Licencia**: LFM Open License v1.0, heredada de LiquidAI/LFM3-VL-2B; revisar el fichero LICENSE para las condiciones de uso comercial antes de cualquier despliegue.
- **Sesgos**: no se documentan sesgos especificos en la informacion disponible.
- **Caveat de produccion**: los pesos incluyen un LoRA fusionado y el repo declara `custom_code`; requiere la version de transformers compatible con LFM3-VL.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alpharomercoma/LFM3-VL-2B-AndroidAgent-v4.3-dpo
- Version GGUF 4 bits: https://huggingface.co/alpharomercoma/LFM3-VL-2B-AndroidAgent-v4.3-dpo-GGUF
- Version base de este ajuste (v4.2): https://huggingface.co/alpharomercoma/LFM3-VL-2B-AndroidAgent-v4.2
- Version de correccion (v4.3-dpo2): https://huggingface.co/alpharomercoma/LFM3-VL-2B-AndroidAgent-v4.3-dpo2
- Modelo base de LiquidAI: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Licencia (LFM Open License v1.0): LICENSE en el repositorio del modelo
