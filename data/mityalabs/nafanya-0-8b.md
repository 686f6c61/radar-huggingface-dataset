# MityaLabs/nafanya-0.8b

## Resumen

nafanya-0.8b es un ajuste fino (LoRA) del modelo Qwen/Qwen3.5-0.8B desarrollado por MityaLabs, orientado especificamente a la llamada de herramientas (tool calling / function calling) en ruso. Forma parte del proyecto nafanya, una familia de modelos disenados para el agente offline kuzya, que se ejecuta en un telefono movil (Poco F1 con skladenOS). Esta variante se denomina "memory-first" porque prioriza el minimo consumo de memoria: se distribuye como un GGUF Q4_K_M de 505 MB y se ejecuta mediante `llama-server`.

El modelo resuelve un problema muy concreto: interpretar peticiones en ruso y traducirlas en llamadas estructuradas a 13 herramientas del agente, todo ello en un dispositivo con recursos muy limitados. No es un modelo de proposito general, sino un componente especializado dentro de una arquitectura mayor donde las reglas deterministas del agente (pre-enrutado, rechazos y reparacion de argumentos) complementan al modelo.

Es relevante ahora por su enfoque de eficiencia extrema: 752 millones de parametros, 0,92 GB de RAM pico, 2 segundos de carga y 4,1 julios por consulta en un telefono de gama media de 2018. La licencia Apache-2.0 y la disponibilidad en formatos GGUF y MLX facilitan su experimentacion. El entrenamiento se detuvo prematuramente por el watchdog de la GPU de macOS, lo que condiciona su calidad en solitario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-0.8B) con adaptador LoRA |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con max sequence 1280) |
| Tipos de cuantizacion | GGUF Q4_K_M (505 MB); pesos base en safetensors BF16; MLX |
| Idiomas soportados | Ruso (ru) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA), GGUF, MLX |

## Arquitectura y entrenamiento

El modelo es un ajuste fino mediante LoRA sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 752 millones de parametros. El adaptador se entreno con MLX-LM en BF16, aplicado a las 2 ultimas capas, con rango 16, escala 16 y dropout 0,05. La configuracion de entrenamiento fue batch 1 y longitud maxima de secuencia 1280, durante 75 iteraciones; el proceso se detuvo por el watchdog de la GPU de macOS, por lo que el entrenamiento no se completo segun lo previsto.

Los datos de entrenamiento consisten en 831 peticiones y rechazos sinteticos en ruso (conjuntos v5 y v7 dirigido), generados por DeepSeek V4.1 Flash via API y filtrados contra los conjuntos de test congelados del agente. No se emplearon datos personales ni datos procedentes del telefono. El modelo comparte el prompt compacto y las 13 herramientas de nafanya-1.7b. No se documenta el uso de RLHF ni DPO; el ajuste es puramente supervisado sobre datos sinteticos.

## Capacidades

- Llamada de herramientas (tool calling) y function calling sobre un conjunto fijo de 13 herramientas del agente kuzya.
- Interpretacion de peticiones en ruso para su traduccion a llamadas estructuradas con argumentos.
- Generacion de rechazos para peticiones fuera de alcance (aunque debil en solitario, segun el autor).
- Conversacion multi-turno dentro del prompt compacto del agente.
- Ejecucion offline en dispositivo movil mediante llama-server.
- Soporte de despliegue en formato GGUF (Q4_K_M) y MLX.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documentan capacidades de vision, audio, codigo ni matematicas.

## Casos de uso

- Agente de control por voz/texto en telefono: el modelo traduce ordenes en ruso a llamadas de herramientas del agente kuzya, con 0,92 GB de RAM pico y 0,6 s por consulta en un Poco F1, lo que lo hace viable en dispositivos de gama media sin conexion.
- Asistente offline sin red: al ejecutarse como GGUF Q4_K_M de 505 MB con llama-server, permite funcionalidad completa en escenarios sin conectividad, con un consumo de 4,1 J por consulta.
- Automatizacion de tareas del sistema en movil: las 13 herramientas del agente permiten mapear peticiones como ajustes de volumen, brillo, alarmas o registros de servicio a acciones concretas del dispositivo.
- Prototipado de pipelines de tool calling en ruso: util para investigadores que quieran experimentar con function calling de bajo coste en un idioma minoritario dentro de los modelos compactos.
- Integracion en agentes con capa de reglas: el modelo esta pensado para combinarse con reglas deterministas de pre-enrutado y reparacion de argumentos, alcanzando 98% de acierto en el conjunto held-out v4 con dichas reglas (frente a 62% en solitario).
- Despliegue en entornos con restricciones de memoria: con 752M de parametros y cuantizacion Q4_K_M, cabe en dispositivos con menos de 1 GB de RAM disponible para el modelo.
- Base para ajustes finos adicionales: al ser un adaptador PEFT sobre Qwen3.5-0.8B con licencia Apache-2.0, sirve como punto de partida para otros dominios de tool calling en ruso.

## Benchmarks y rendimiento

Los datos de evaluacion proporcionados por el autor corresponden a temperatura 0, prompt compacto y formato GGUF. El autor advierte explicitamente que los resultados con reglas no deben atribuirse a los pesos del modelo, sino a la capa de reglas del agente kuzya.

| Conjunto | Modelo solo | Con reglas de kuzya |
|---|---:|---:|
| held-out v4 (nuevo) | 25/40 (62%), args 22/40 | 39/40 (98%), args 39/40 |
| held-out v3 | no disponible | 38/40 (95%) |
| held-out v2 | no disponible | 40/40 (100%) |
| primeras 30 consultas congeladas, telefono | no disponible | 26/30 (87%) |

Rendimiento en dispositivo (Poco F1):

| Metrica | Valor |
|---|---|
| RAM pico | 0,92 GB |
| Tiempo de carga | 2 s |
| Energia en caliente por consulta (con reglas) | 4,1 J |
| Latencia por consulta | 0,6 s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 0,5 GB en Q4_K_M (505 MB de pesos) y 0,92 GB de RAM pico medida en telefono.
- GPU recomendadas: no requiere GPU dedicada; el autor lo ejecuta en CPU de un Poco F1 (Qualcomm Snapdragon 845).
- Cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) con holgura; tambien en dispositivos moviles y sistemas embebidos con ~1 GB de RAM libre.
- Opciones de despliegue: llama.cpp / llama-server (formato GGUF), MLX (Apple Silicon), y PEFT con safetensors para cargar el adaptador sobre el modelo base.
- Latencia y throughput: 0,6 s por consulta y 4,1 J por consulta en Poco F1 con las reglas del agente; carga en 2 s. No se dispone de datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nafanya-0.8b | 752M | no disponible | Tool calling en ruso, offline en movil | Apache-2.0 | HuggingFace (GGUF, MLX, safetensors) |
| nafanya-1.7b | no disponible | no disponible | Tool calling en ruso, misma familia | no disponible | HuggingFace |
| Qwen/Qwen3.5-0.8B (base) | 752M | no disponible | Modelo generalista | Apache-2.0 | HuggingFace |

El autor indica que nafanya-0.8b es mas debil que nafanya-1.7b en peticiones libres no cubiertas por las reglas. No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Mas debil que nafanya-1.7b en peticiones de forma libre no cubiertas por las reglas del agente.
- En solitario falla con frecuencia en peticiones negativas y fuera de alcance (62% en held-out v4 sin reglas).
- Comparte los puntos debiles semanticos del 1.7B: volumen y brillo relativos, inversion de mute/nosleep y argumentos de registros de servicio.
- El entrenamiento se interrumpio por el watchdog de la GPU de macOS tras 75 iteraciones, por lo que el ajuste puede estar incompleto.
- Solo soporta ruso; no se documentan capacidades multilingues.
- Los datos de entrenamiento son sinteticos y generados por IA (DeepSeek V4.1 Flash); pueden introducir sesgos o artefactos del generador.
- Los resultados con reglas (98%, 95%, 100%) no son atribuibles a los pesos del modelo, sino a la capa determinista del agente kuzya; usarlos como metrica del modelo seria enganoso.
- Licencia Apache-2.0 permite uso comercial, pero los datos sinteticos se generaron bajo los terminos de DeepSeek Open Platform (release 2026-04-22, §4.2(3)); conviene revisar dichos terminos antes de un uso comercial a gran escala.
- Riesgo de alucinacion en argumentos de herramientas no cubiertos por las reglas del agente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MityaLabs/nafanya-0.8b
- Repositorio del agente kuzya: https://github.com/mitya-labs/kuzya
- Espacio de trabajo de entrenamiento: https://github.com/mitya-labs/nafanya
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
