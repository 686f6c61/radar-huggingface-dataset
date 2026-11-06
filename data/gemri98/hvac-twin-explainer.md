# GeMri98/hvac-twin-explainer

## Resumen

`GeMri98/hvac-twin-explainer` es un adaptador LoRA sobre `Qwen/Qwen2.5-3B-Instruct` diseñado como componente explicativo de un gemelo digital de climatización (HVAC). Lo publica el usuario GeMri98 como prototipo de investigación y se acompaña de un agente PPO separado (`ppo_hvac.zip`, Stable-Baselines3) que controla el punto de consigna de refrigeración a partir de una observación de 9 entradas. El adaptador no controla el sistema: recibe hechos en JSON generados por un gemelo térmico RC y produce una explicación breve en inglés de la decisión tomada.

El interés del artefacto es metodológico más que de rendimiento: demuestra un patrón de separación entre política de control (RL tabular/continuo) y capa de explicación (LLM ajustado con LoRA), con una métrica de fidelidad centrada en que el modelo no invente cifras. Según la model card, el adaptador afinado cita el porcentaje real de refrigeración en el 100 % de las respuestas, frente al 3-11 % del modelo base sin ajustar.

Todo el trabajo se ha realizado sobre datos **sintéticos**: clima de estilo Melbourne, precios de estilo VIC1 y ocupación simulada. El autor declara explícitamente que no está validado en edificios reales ni con datos de mercado reales (AEMO), lo que limita su uso a investigación y a la reproducción del experimento. El repositorio ocupa 0,1 GB y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-3B-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 3B en el modelo base; el adaptador LoRA es de rango bajo (rango y alpha no disponibles) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | no disponible; el repo solo distribuye pesos del adaptador en safetensors |
| Idiomas soportados | no disponible en la model card; el modelo base Qwen2.5-3B-Instruct es multilingue, pero el adaptador se ha entrenado con texto de referencia en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA en `adapter/`); el agente PPO se distribuye como `ppo_hvac.zip` (Stable-Baselines3) |

## Arquitectura y entrenamiento

El sistema tiene dos piezas. La primera es un agente de refuerzo PPO de Stable-Baselines3 con 9 entradas de observación y una única acción continua (fracción de refrigeración), entrenado contra un gemelo térmico de tipo RC con clima, precios y ocupación sintéticos. La segunda es el adaptador LoRA sobre Qwen2.5-3B-Instruct, cuyo cometido es transformar los hechos JSON de la decisión (incluido el porcentaje de refrigeración) en una explicación en lenguaje natural.

El adaptador se ha entrenado, según la model card, sobre texto de referencia generado por reglas. Esto implica que aprende a reproducir esas reglas de redacción y no a razonar sobre control HVAC. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, el rango del LoRA ni si hubo etapas de RLHF o DPO. La innovación destacable no es arquitectónica sino de evaluación: la métrica de fidelidad comprueba que las cifras citadas aparezcan en la entrada, no que las afirmaciones sean lógicamente correctas.

## Capacidades

- Generación de explicaciones breves en inglés a partir de hechos JSON de un gemelo térmico RC (temperatura, ocupación, precio, fracción de refrigeración).
- Citación fiel de cifras presentes en la entrada: 100 % de respuestas con el porcentaje real de refrigeración en la evaluación del autor, frente al 3-11 % del base sin ajustar.
- Formato de salida acotado y predecible, adecuado para insertarse en un panel de operación o en un registro de auditoría.
- No soporta preguntas libres: en la prueba realizada el modelo ignoró la pregunta formulada y en ocasiones se contradijo, aunque sin inventar cifras.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe no evaluada; el ajuste se ha hecho sobre texto de referencia en inglés.

## Casos de uso

- **Auditoría de decisiones de control en investigación**: dado el JSON de una decisión del agente PPO, generar una frase que explique qué fracción de refrigeración se aplicó y con qué hechos de entrada, útil para revisar trayectorias episodio a episodio en cuadernos de experimentación.
- **Reproducción del experimento de gemelo digital**: combinar `ppo_hvac.zip` con el adaptador para replicar el pipeline completo (observación, acción, explicación) sobre los días sintéticos descritos en la model card.
- **Docencia sobre separación política/explicación**: usar el par PPO + LoRA como ejemplo didáctico de cómo desacoplar un controlador RL de su capa de comunicación, con una métrica de fidelidad numérica medible.
- **Generación de registros sintéticos para entrenar evaluadores**: producir pares (hechos JSON, explicación) que sirvan como corpus de prueba para métricas de fidelidad o para comparar modelos explicadores.
- **Prueba de concepto de asistentes de operación HVAC**: integrar el adaptador como capa de texto en un prototipo de consola de operaciones, siempre sobre datos simulados y con revisión humana de cada salida.
- **Línea base para experimentos de fidelidad**: emplear el contraste 100 % frente a 3-11 % como referencia al evaluar otros adaptadores explicadores sobre el mismo modelo base.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre días sintéticos reservados (PPO frente a un termostato ajustado con arranque óptimo y control proporcional):

| Escenario | Métrica | PPO | Termostato ajustado |
|---|---|---|---|
| Normal (20 días) | Coste por día | 8,22 USD | 16,13 USD |
| Normal (20 días) | Violación de confort (°C·h/día) | 0,47 | 0,35 |
| Normal (20 días) | Pasos ocupados fuera de banda | 5,1 % | 3,9 % |
| Ola de calor + pico de precio (40 días) | Coste por día | 13,58 USD | 38,05 USD |
| Ola de calor + pico de precio (40 días) | Violación de confort (°C·h/día) | 0,80 | 4,18 |
| Ola de calor + pico de precio (40 días) | Pasos ocupados fuera de banda | 8,5 % | 29,9 % |

Fidelidad del explicador (proporción de respuestas que citan el porcentaje real de refrigeración y no inventan cifras): 100 % con el adaptador ajustado, 3-11 % con el modelo base sin ajustar. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del explicador: en torno a 6-7 GB en FP16 para el Qwen2.5-3B-Instruct completo más el adaptador; aproximadamente 2-3 GB con cuantización de 4 bits (estimación a partir del tamaño del modelo base, no verificada por el autor).
- GPU recomendadas: RTX 3090, RTX 4090, A10G, L4 o A100 para el modelo completo en FP16; cualquier GPU consumer con 8 GB o más para la variante cuantizada.
- Cabe en GPU consumer: sí, con cuantización de 4 bits en tarjetas de 8 GB (RTX 3060 Ti, RTX 4060 Ti, RTX 3070) y en FP16 en tarjetas de 12 GB o más.
- Opciones de despliegue: carga del adaptador con PEFT sobre transformers, servicio con vLLM o TGI tras fusionar el adaptador, y llama.cpp/Ollama si se genera un GGUF a partir del modelo fusionado. El agente PPO requiere Python con Stable-Baselines3 para cargar `ppo_hvac.zip`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GeMri98/hvac-twin-explainer | 3B (base) + LoRA | no disponible | Explicador de decisiones HVAC sobre gemelo sintético | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-3B-Instruct | 3B | no disponible en la información | Modelo instructivo generalista, base del adaptador | Apache 2.0 | Hugging Face, ampliamente utilizado |
| Adaptadores LoRA de dominio público (genéricos) | variable | variable | Ajuste de tarea sobre modelos base abiertos | variable | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros explicadores HVAC en la información proporcionada; la única comparación documentada es contra el modelo base sin ajustar en la métrica de fidelidad numérica.

## Limitaciones y advertencias

- El adaptador reproduce reglas de redacción aprendidas de texto generado automáticamente; no razona sobre control HVAC ni aporta conocimiento térmico propio.
- No admite preguntas libres: en la prueba del autor ignoró la pregunta y llegó a contradecirse, aunque no inventó cifras.
- La métrica de fidelidad solo verifica que las cifras aparezcan en la entrada, no que las afirmaciones sean lógicamente correctas.
- Entrenamiento y evaluación exclusivamente sobre datos sintéticos (clima estilo Melbourne, precios estilo VIC1, ocupación simulada); sin validación en edificios ni en precios AEMO reales.
- Riesgo de alucinación cualitativa: aunque las cifras se citan correctamente, las explicaciones pueden ser internamente inconsistentes.
- Idiomas soportados no documentados; el ajuste se realizó sobre texto en inglés, por lo que el rendimiento en castellano es incierto.
- Uso comercial permitido por la licencia Apache 2.0, pero el autor no respalda su idoneidad para producción; no debe emplearse para decisiones de control reales sin validación independiente.
- El repositorio no incluye el gemelo térmico RC ni los datos sintéticos, por lo que la reproducibilidad completa depende de reimplementar el entorno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GeMri98/hvac-twin-explainer
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Stable-Baselines3 (agente PPO): https://github.com/DLR-RM/stable-baselines3
- PEFT (adaptadores LoRA): https://github.com/huggingface/peft
- No se han encontrado en la información disponible papers, blogs, repositorios adicionales ni demos asociados a este modelo.
