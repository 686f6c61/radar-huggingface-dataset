# MityaLabs/nafanya-1.7b

## Resumen

nafanya-1.7b es un ajuste fino (LoRA) del modelo base Qwen/Qwen3-1.7B, desarrollado por MityaLabs, especializado en la selección y emisión de llamadas a herramientas (tool calling) en ruso para un agente offline denominado kuzya que se ejecuta en un teléfono (Poco F1 con skladenOS). El modelo no pretende ser un asistente generalista, sino un componente compacto y determinista de un pipeline de agente: recibe un prompt de sistema compacto con descripciones de herramientas de una línea y devuelve la herramienta y los argumentos adecuados.

El modelo tiene 1.720.574.976 parámetros (1,7 mil millones) y se distribuye como adaptador PEFT LoRA y como cuantización GGUF Q4_K_M, pensada para ejecutarse con llama-server en hardware móvil. Su relevancia radica en demostrar que un modelo de 1,7B ajustado con unas 610 peticiones sintéticas puede alcanzar una precisión de selección de herramienta del 80-89% en conjuntos de evaluación rusos, y del 98-100% cuando se combina con una capa de reglas determinista en el agente.

La ficha describe un artefacto muy acotado: 13 herramientas de control del teléfono (batería, Wi-Fi, servicios, volumen, brillo, inhibición de suspensión), entrenado exclusivamente en ruso y evaluado en un único dispositivo. Cualquier uso fuera de ese dominio debe considerarse fuera de su distribución de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen/Qwen3-1.7B) con adaptador LoRA PEFT |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con max sequence 1280) |
| Tipos de cuantizacion | GGUF Q4_K_M; adaptador LoRA en safetensors (BF16) |
| Idiomas soportados | ruso |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only denso, y se ajusta mediante LoRA con MLX-LM en precisión BF16. La configuración del adaptador es: 8 últimas capas, rango 16, escala 16, dropout 0.05, 100 iteraciones, batch 1 y longitud máxima de secuencia 1280 tokens. El prompt de entrenamiento consiste en un system prompt compacto más descripciones de herramienta de una línea, con un total de 1118 tokens y 13 herramientas: batería, estado y conexión de Wi-Fi, listado de servicios, logs de servicio, reinicio de servicio, inhibición de suspensión, obtención/ajuste/paso de volumen, silencio, y ajuste/paso de brillo.

Los datos de entrenamiento son aproximadamente 610 peticiones y rechazos sintéticos en ruso, generados por DeepSeek V4.1 Flash vía API y filtrados contra los conjuntos de test congelados del agente. No se menciona uso de RLHF ni DPO; el ajuste es supervisado sobre datos sintéticos. No hay innovaciones arquitectónicas propias: el valor está en el ajuste acotado y en la integración con una capa de reglas determinista en el agente (pre-enrutamiento y reparación de argumentos), que no forma parte de los pesos.

## Capacidades

- Selección de herramienta (tool calling) entre 13 herramientas de control de un teléfono, con emisión de argumentos.
- Generación de rechazos ante peticiones fuera de alcance, aprendidos de los datos sintéticos.
- Function calling en formato conversacional, compatible con endpoints (tag endpoints_compatible).
- Ejecución offline en dispositivo móvil mediante GGUF Q4_K_M y llama-server.
- Soporte de cuantización GGUF e imatrix, y de formato MLX.
- Capacidades multilingües: solo ruso (no se reporta soporte de otros idiomas).
- No se reportan capacidades de visión, audio, modo thinking explícito ni razonamiento multi-paso general.

## Casos de uso

- Control de un teléfono por voz o texto en ruso: el modelo traduce peticiones como ajustar volumen o brillo en llamadas a herramientas concretas, adecuado por su tamaño (1,7B) y su ejecución offline en el dispositivo.
- Agente personal offline en hardware móvil: se integra en el agente kuzya con llama-server y GGUF Q4_K_M, con un pico de RAM de 1,71 GB y carga de 3-4 s en un Poco F1.
- Automatización de tareas del sistema: listado y reinicio de servicios, consulta de logs y gestión de inhibición de suspensión mediante las herramientas entrenadas.
- Enrutamiento de intenciones en asistentes de domótica o dispositivos embebidos: el patrón de prompt compacto con descripciones de una línea es reutilizable para conjuntos de herramientas pequeños.
- Filtrado de peticiones fuera de alcance: el modelo aprende a rechazar solicitudes no cubiertas (Wi-Fi on/off, ssh, aritmética) y sirve como primera capa antes de la allowlist del agente.
- Base para ajustes LoRA similares en otros dominios acotados: la receta (LoRA rank 16, 8 capas, ~610 ejemplos sintéticos) es un punto de partida documentado para especializar Qwen3-1.7B en tool calling de dominio restringido.
- Evaluación de pipelines de agente con capa de reglas: permite medir la contribución de los pesos frente a las reglas deterministas (89% frente a 98-100% en los conjuntos reportados).

## Benchmarks y rendimiento

Evaluación con temperature 0, prompt compacto y GGUF Q4_K_M sobre conjuntos de consultas rusas de selección de herramienta con herramienta y argumentos esperados exactos.

| Conjunto | Herramienta correcta | Con argumentos |
|---|---:|---:|
| frozen 148-query set | 131/148 (89%) | 125/148 (84%) |
| held-out 40 (v2) | 33/40 (82%) | 32/40 (80%) |
| held-out 40 (v3) | 32/40 (80%) | 27/40 (68%) |
| held-out 40 (v4) | no disponible | no disponible |

Con la capa de reglas del agente kuzya (pre-enrutamiento determinista y reparación de argumentos, fuera de los pesos): 40/40 en held-out v4 y v3, y 40/40 en v2 (98-100%). El autor advierte explícitamente de que esas cifras no deben atribuirse solo a los pesos.

Rendimiento en dispositivo (Poco F1, Q4_K_M): pico de RAM 1,71 GB, carga de 3-4 s, energía en caliente de 8,9 J por consulta con reglas (30,7 J sin reglas), media de 2,4 s por consulta con reglas.

## Requisitos de hardware

- VRAM/RAM estimada: el GGUF Q4_K_M ocupa aproximadamente 1,1 GB (tamaño del repo); pico de RAM medido de 1,71 GB en un Poco F1.
- GPU recomendadas: no se reportan; el modelo está pensado para CPU móvil. Cualquier GPU consumer reciente (por ejemplo, RTX 3060 o superior) puede ejecutarlo con holgura, pero no hay datos de latencia publicados en GPU.
- Cabe en GPU consumer: sí, por tamaño (1,7B en Q4_K_M), aunque no se han publicado mediciones.
- Opciones de despliegue: llama.cpp / llama-server (GGUF), MLX (adaptador y formato MLX), PEFT para cargar el adaptador sobre Qwen3-1.7B.
- Latencia y throughput: 2,4 s por consulta de media en Poco F1 con reglas; carga de 3-4 s; sin datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nafanya-1.7b | 1,72B | no disponible (entrenado a 1280) | Tool calling en ruso para agente móvil | Apache-2.0 | Hugging Face (adaptador PEFT y GGUF) |
| Qwen/Qwen3-1.7B (base) | 1,7B | no disponible en esta ficha | Modelo generalista multilingüe | Apache-2.0 | Hugging Face |
| Alternativas de tool calling de ~1-3B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de tool calling en ruso en la información proporcionada.

## Limitaciones y advertencias

- Volumen y brillo relativos frente a absolutos ("потише" con un número) es frágil.
- `mute_set` y `nosleep_set` (on/off) pueden invertirse sin las reglas del agente.
- Un recuento de líneas puede confundirse con un nombre de servicio en `service_logs`.
- Peticiones fuera de alcance (Wi-Fi on/off, ssh/sshd, "todos los servicios", aritmética) pueden producir una llamada a herramienta; la allowlist y las reglas del agente las filtran.
- Evaluado solo con consultas en ruso y en un único modelo de teléfono (Poco F1).
- Los datos de entrenamiento son sintéticos, generados por DeepSeek V4.1 Flash; no contienen datos personales ni del dispositivo.
- Las cifras del 98-100% incluyen la capa de reglas del agente y no deben atribuirse a los pesos.
- Licencia Apache-2.0, igual que el modelo base; no se reportan restricciones adicionales para uso comercial.
- Riesgo de alucinación no cuantificado; el modelo está fuera de distribución para cualquier tarea distinta del tool calling acotado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MityaLabs/nafanya-1.7b
- Agente kuzya: https://github.com/mitya-labs/kuzya
- Espacio de trabajo de entrenamiento: https://github.com/mitya-labs/nafanya
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
