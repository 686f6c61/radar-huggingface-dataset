# gabeldev/deliverytwin-investigator-qwen3-1.7b-lora

## Resumen

DeliveryTwin investigator es un adaptador LoRA desarrollado por gabeldev sobre el modelo base Qwen3-1.7B de Qwen Team (Alibaba Cloud). No es un modelo de propósito general: es un artefacto de investigación diseñado para ejecutar un protocolo cerrado de investigación de incidentes en un simulador sintético de reparto de última milla. El adaptador consulta telemetría, formula hipótesis, ejecuta experimentos contrafactuales emparejados en un entorno de laboratorio y emite un diagnóstico con una recomendación, usando cinco herramientas tipadas: `query_orders`, `query_gauges`, `hypothesize`, `experiment` y `submit`.

El entrenamiento se realizó con QLoRA de 4 bits (NF4) sobre proyecciones de atención y MLP, con r = 16 y α = 32, partiendo de 362 trazas de investigación generadas por un experto determinista y filtradas por muestreo de rechazo, más 90 ejemplos de replay de databricks-dolly-15k. El resultado es un adaptador de unos 0,1 GB que cabe en GPUs de consumo muy modestas: se entrenó en una única RTX 3050 Laptop de 6 GB en 81 minutos con un pico de 3,05 GB.

Su relevancia es doble. Por un lado, demuestra que un modelo de 1.700 millones de parámetros puede superar a un playbook basado en conocimiento en el escenario clave del benchmark (causas observacionalmente equivalentes que requieren un experimento), pasando de 0,00 en el modelo base a 0,90 de precisión de causa exacta. Por otro, la model card documenta con inusual honestidad limitaciones severas, incluido un olvido catastrófico en GSM8K (de 0,61 a 0,14) y un atajo de distribución que cuestiona la generalidad del razonamiento experimental aprendido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r = 16, α = 32, dropout 0,05) sobre transformer decoder-only Qwen3-1.7B, proyecciones de atención y MLP |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Qwen3-1.7B tiene 1.700 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible de forma explícita; las secuencias de entrenamiento se limitan a 4.608 tokens |
| Tipos de cuantizacion | QLoRA 4-bit NF4 para el entrenamiento; el adaptador se distribuye en safetensors y se aplica sobre el base cuantizado o en precisión completa |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3-1.7B, un transformer decoder-only denso. La innovación no está en la arquitectura sino en el protocolo: el modelo opera en modo no-thinking (bloque `<think>` vacío en cada turno del asistente), con esquemas de herramientas compactos y pérdida calculada únicamente sobre los tokens del asistente. Los datos son 362 trazas de entrenamiento y 132 de validación generadas por un experto determinista, procedentes de una semilla de desarrollo disjunta de todas las semillas de evaluación. El filtrado por muestreo de rechazo usa el evaluador, que emplea la verdad oculta solo para mantener o descartar una traza y nunca aparece en el texto. Se añadieron 90 ejemplos de replay de databricks-dolly-15k para mitigar el olvido.

Los hiperparámetros son 2 épocas, 113 pasos de optimizador, learning rate 2e-4 con schedule coseno, acumulación de gradiente 8 y semilla 0. La pérdida de validación sobre trazas bajó de 1,81 a 0,015. Todo el entrenamiento se completó en una RTX 3050 Laptop de 6 GB en 81 minutos. El adaptador requiere el entorno DeliveryTwin (simulador, laboratorio, prompt de sistema y esquemas de herramientas) para funcionar; sin él no tiene comportamiento útil.

## Capacidades

- Investigación de incidentes tipada: consulta pedidos y medidores, formula hipótesis explícitas, diseña y ejecuta experimentos contrafactuales emparejados y emite un diagnóstico final con recomendación.
- Uso de herramientas (tool calling) restringido a cinco funciones predefinidas del protocolo DeliveryTwin.
- Razonamiento multi-paso dentro del bucle de investigación: observación, hipótesis, experimento, revisión y envío.
- Discriminación de causas observacionalmente equivalentes mediante experimentación activa (rendimiento del 0,90 en el escenario L2).
- Modo no-thinking forzado; no se entrena ni se espera el modo de razonamiento extendido de Qwen3.
- Capacidades multilingües: solo inglés.
- No cubre visión, audio, generación de código general ni matemáticas; de hecho, el entrenamiento degrada gravemente esta última.

## Casos de uso

- Investigación de causa raíz en simulación logística: el adaptador recibe un incidente del simulador DeliveryTwin, consulta telemetría con `query_orders` y `query_gauges`, y produce un diagnóstico. Es su único uso previsto y el único para el que hay evidencia empírica.
- Evaluación de razonamiento experimental en agentes: sirve como banco de pruebas para medir si un modelo pequeño aprende a diseñar experimentos discriminatorios frente a atajos correlacionales, gracias a las condiciones L2 y L5 del benchmark.
- Investigación sobre olvido catastrófico: el par base/adaptador con métricas GSM8K documentadas (0,61 frente a 0,14) lo convierte en un caso de estudio útil para estudiar cómo el ajuste fino estrecho destruye habilidades generales.
- Docencia y reproducción de experimentos: el simulador, el laboratorio, el benchmark, el evaluador y los scripts de entrenamiento son de código abierto (Apache-2.0), lo que permite reproducir el pipeline completo en hardware de consumo.
- Pruebas de protocolos de aprobación humana: el diseño exige aprobación humana y verificación explícita de restricciones antes de actuar, lo que lo hace adecuado para prototipar flujos de human-in-the-loop en agentes operativos.
- Comparación de estrategias de agente (modelo pequeño ajustado frente a LLM de API): los datos de la model card permiten contrastar un adaptador local de 1,7B con gpt-5-mini y gpt-5.6-luna en las mismas condiciones, con resultados divergentes por escenario.

## Benchmarks y rendimiento

Precisión de causa exacta en el benchmark DeliveryTwin (semilla final reservada, n = 20 incidentes por condición; intervalos de Wilson al 95 % en las filas principales):

| Condición | Qwen3-1.7B base | Este adaptador | Playbook basado en conocimiento |
|---|---|---|---|
| L0: medidores completos, 3 familias de fallo | 0,05 | 0,45 [0,26; 0,66] | 0,50 |
| L1: L0 + ruido de telemetría | 0,00 | 0,40 [0,22; 0,61] | 0,70 |
| L2: dos causas con telemetría idéntica (requiere experimento) | 0,00 | 0,90 [0,70; 0,97] | 0,65 |
| Mismos incidentes L2, sin herramienta de experimento | — | 0,45 [0,26; 0,66] | — |
| Mismos incidentes L2, presupuesto de un experimento | 0,00 | 0,80 [0,58; 0,92] | 0,35 |
| Mismos incidentes L2, laboratorio gemelo imperfecto (δ = 0,25) | 0,00 | 0,95 [0,76; 0,99] | 0,45 |
| L5: familias L0 con medidores parciales (no vistas en entrenamiento) | 0,00 | 0,40 [0,22; 0,61] | 0,65 |

Comparaciones pareadas con test exacto de McNemar: con frente a sin herramienta de experimento en L2, 11 a 2, p = 0,022 (pre-registrado); adaptador frente a base, p ≤ 0,022 en todas las condiciones. En L5 el adaptador nunca ejecuta un experimento, mientras que los LLM de API (gpt-5-mini, gpt-5.6-luna) alcanzan 0,80–0,90 experimentando por su cuenta (exploratorio, p ≤ 0,022 frente al adaptador); esos mismos LLM de API puntúan 0,00–0,30 en el par equivalente.

GSM8K (150 problemas fijos, decodificación greedy): precisión estricta (línea final `Answer:`) de 0,61 en el base a 0,14 en el adaptador; lectura laxa del último número, de 0,67 a 0,45.

## Requisitos de hardware

- VRAM estimada: el adaptador pesa unos 0,1 GB; con el base en 4-bit NF4 el conjunto cabe holgadamente en 4–6 GB. En bfloat16 el base de 1,7B requiere aproximadamente 3,5–4 GB solo para pesos, más KV cache.
- GPU recomendadas: cualquier GPU con 6 GB o más. El propio entrenamiento se hizo en una RTX 3050 Laptop de 6 GB con un pico de 3,05 GB.
- Cabe en GPU de consumo: sí, en RTX 3050/3060/4060, GTX 1660 con 6 GB, e incluso en configuraciones de 4 bits en GPUs de 4 GB.
- Opciones de despliegue: transformers + PEFT (ruta documentada), con `BitsAndBytesConfig` para 4 bits; vLLM, llama.cpp, Ollama y TGI no están documentados para este adaptador y requerirían conversión o soporte de adaptadores LoRA.
- Latencia y throughput: no disponibles. La evaluación se hizo con una ejecución greedy por modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeliveryTwin investigator (este) | 1,7B + LoRA r = 16 | ≤ 4.608 tokens en entrenamiento | Agente de investigación de incidentes en simulador | Apache-2.0 | Hugging Face + GitHub |
| Qwen3-1.7B base | 1,7B | No disponible en la información | LLM generalista | Apache-2.0 | Hugging Face |
| gpt-5-mini (API) | no disponible | no disponible | LLM generalista de API | propietaria | API |
| gpt-5.6-luna (API) | no disponible | no disponible | LLM generalista de API | propietaria | API |

En el benchmark DeliveryTwin, el adaptador supera al base en todas las condiciones y al playbook en L2 y en el escenario de laboratorio imperfecto, pero queda por debajo del playbook en L0, L1 y L5. Frente a los LLM de API, pierde claramente en L5 (0,40 frente a 0,80–0,90) y les gana en el par equivalente (0,00–0,30 para ellos). No hay comparación con otros adaptadores LoRA de la misma categoría.

## Limitaciones y advertencias

- Atajo de distribución: el muestreo de rechazo enseña qué familias de fallo contiene cada perfil del benchmark. Buena parte de la mejora en L2/L4/L6 es compatible con haber aprendido qué sonda discrimina en ese perfil, no con razonamiento experimental general. El fallo en experimentar en L5 lo respalda y no hay ablación que lo aísle.
- Olvido catastrófico: en GSM8K la precisión estricta cae de 0,61 a 0,14 y el adaptador deja de seguir instrucciones de formato de salida. No debe usarse como asistente general.
- Imita a un único experto determinista y hereda sus puntos ciegos; además lee mal los medidores en L0 y L1.
- Datos 100 % sintéticos: nada indica transferencia a operaciones reales. Cualquier recomendación debe pasar por aprobación humana y verificación explícita de restricciones antes de actuar sobre nada real.
- Muestra pequeña: n = 20 por condición y una sola ejecución greedy por modelo; los intervalos de confianza son amplios.
- Idioma: solo inglés.
- Licencia Apache-2.0 para el adaptador y el base, pero el uso comercial no está validado por evidencia: el modelo solo funciona dentro del protocolo DeliveryTwin y con su prompt de sistema y esquemas de herramientas.
- Dependencia dura del entorno: sin el simulador, el laboratorio y los esquemas de herramientas del repositorio, el adaptador no tiene comportamiento útil.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gabeldev/deliverytwin-investigator-qwen3-1.7b-lora
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio DeliveryTwin (simulador, laboratorio, benchmark, evaluador y scripts): https://github.com/gabeldev/deliverytwin
- Dataset de replay databricks-dolly-15k: https://huggingface.co/datasets/databricks/databricks-dolly-15k
- Benchmark GSM8K (OpenAI, MIT): https://github.com/openai/grade-school-math
