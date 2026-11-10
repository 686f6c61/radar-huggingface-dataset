# GeMri98/hvac-twin-grpo-v8

## Resumen

HVAC twin v8 es un conjunto de adaptadores LoRA entrenados sobre el modelo base Qwen2.5-3B-Instruct para una tarea muy concreta: seleccionar consignas horarias de temperatura de refrigeración (setpoints de cooling) a partir de una descripción textual de un gemelo digital de oficina de tipo 2R2C (modelo térmico de dos resistencias y dos capacitancias). Lo desarrolla el usuario GeMri98 y se publica en Hugging Face como repositorio de adaptadores en formato safetensors, con un tamaño de repositorio de 0,2 GB, lo que es coherente con adaptadores LoRA sobre un modelo de 3 000 millones de parámetros.

El interés del trabajo es metodológico antes que de producto: emplea GRPO (Group Relative Policy Optimization) con una recompensa calculada por simulación del gemelo digital frente a un oráculo de búsqueda exhaustiva en rejilla. La model card reporta métricas de brecha capturada (gap_captured), arrepentimiento (regret) y comparación contra una línea base de termostato fijo a 24 °C y una regla de setback, sobre 400 episodios. La variante SFT sobre el oráculo alcanza un 75,5 % de brecha capturada y un regret de 0,849, mientras que GRPO desde el modelo base llega al 43,8 % y regret 1,952.

No hay información publicada sobre licencia, idiomas soportados ni pipeline de Hugging Face. El modelo está claramente orientado a investigación en control de edificios asistido por LLM, no a despliegue generalista, y la propia model card advierte de que los resultados de BOPTEST no se incluyen porque el servicio no estaba disponible en esa ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-3B-Instruct) con adaptadores LoRA |
| Parametros totales | 3 000 millones (modelo base); tamano de adaptadores no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-3B-Instruct; valor exacto no confirmado en la informacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores LoRA: `adapter_v8_sft`, `adapter_v8_grpo`, `adapter_v8_sft_grpo`) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-3B-Instruct, un transformer decoder-only de 3 000 millones de parámetros. Sobre él se entrenan adaptadores LoRA de bajo rango. La tarea se formula como un problema de decisión textual: el modelo recibe una descripción en lenguaje natural de un gemelo digital 2R2C de oficina y debe emitir consignas horarias de setpoint de refrigeración. La recompensa se calcula simulando la política propuesta en el gemelo y comparándola con un oráculo de búsqueda exhaustiva en rejilla, que define el óptimo por episodio.

Se comparan tres regímenes de entrenamiento: SFT sobre las acciones del oráculo, GRPO partiendo del modelo base sin ajustar, y la combinación SFT seguida de GRPO. La model card reporta que SFT sobre el oráculo y SFT+GRPO obtienen resultados idénticos en las métricas agregadas (75,5 % de brecha capturada, regret 0,849, 86 % de episodios mejores que el termostato y 4 % peores, con validez del 100 %), lo que sugiere que la etapa GRPO posterior al SFT no aporta mejora medible en esta configuración. GRPO desde el modelo base sí mejora sustancialmente respecto al base sin ajustar (43,8 % frente a −173,5 % de brecha capturada), pero queda por debajo del SFT. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni detalles del proceso de RLHF/DPO.

## Capacidades

- Selección de consignas horarias de setpoint de refrigeración a partir de una descripción textual de un gemelo digital 2R2C de oficina.
- Razonamiento sobre un problema de control con recompensa definida por simulación (optimización de coste y confort bajo restricciones).
- Generación de políticas horarias que pueden evaluarse contra un oráculo de búsqueda en rejilla.
- Capacidades generales heredadas de Qwen2.5-3B-Instruct (generación de texto, instrucciones), aunque no se documentan ni evalúan en esta ficha.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación en control de edificios con LLM: usar los adaptadores como punto de partida para reproducir el pipeline SFT/GRPO con recompensa simulada en gemelos digitales 2R2C y comparar contra oráculos de búsqueda en rejilla.
- Evaluación de políticas de setpoint en oficinas: el adaptador SFT+GRPO puede generar consignas horarias que, según la model card, superan al termostato fijo en el 86 % de los 400 episodios evaluados, útil para estudios comparativos de estrategias de control.
- Prototipado de asistentes de eficiencia energética: integrar el modelo como generador de propuestas de consigna que luego se validan en un simulador antes de aplicarse, aprovechando la métrica de validez del 100 % reportada para las variantes SFT.
- Benchmarking de métodos de RL para LLM: el repositorio incluye curvas de entrenamiento (`grpo_curves.png`) y resultados (`v8_results.json`) que permiten contrastar GRPO frente a SFT en una tarea de decisión con recompensa determinista.
- Docencia y experimentación con LoRA: al ser adaptadores de 0,2 GB sobre un modelo de 3B, es viable entrenar y evaluar variantes en hardware de gama media, lo que facilita prácticas sobre RLHF/GRPO.
- Análisis de brecha frente a óptimo: usar la métrica de `gap_captured` y `regret` para estudiar cuánto del óptimo alcanza una política generada por LLM frente a reglas heurísticas como el setback (17,7 % de brecha capturada en la model card).

## Benchmarks y rendimiento

Resultados reportados en la model card sobre 400 episodios (intervalos entre corchetes):

| Arm | n | gap_captured | regret | vs_thermostat | better_pct | worse_pct | cost | viol | valid |
|---|---|---|---|---|---|---|---|---|---|
| base (untuned) | 400 | −173,5 % [−208, −144] | 9,490 | −6,020 [−6,825, −5,270] | 8 | 54 | 2,47 | 16,05 | 98 % |
| SFT on oracle | 400 | 75,5 % [68, 84] | 0,849 | +2,620 [+2,328, +2,942] | 86 | 4 | 2,92 | 0,89 | 100 % |
| GRPO from base | 400 | 43,8 % [36, 53] | 1,952 | +1,518 [+1,283, +1,757] | 68 | 28 | 4,16 | 0,66 | 100 % |
| SFT then GRPO | 400 | 75,5 % [68, 83] | 0,849 | +2,620 [+2,330, +2,957] | 86 | 4 | 2,92 | 0,89 | 100 % |
| thermostat 24C | 400 | 0,0 % [0, 0] | 3,470 | +0,000 [+0,000, +0,000] | 0 | 0 | no disponible | no disponible | no disponible |
| setback rule | 400 | 17,7 % [13, 23] | 2,855 | +0,615 [+0,426, +0,831] | 36 | 3 | no disponible | no disponible | no disponible |
| oracle | 400 | 100,0 % [100, 100] | 0,000 | +3,470 [+3,031, +3,950] | 90 | 0 | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los resultados de BOPTEST no se incluyen porque el servicio no estaba accesible en esa ejecución.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Como referencia, un modelo de 3B en precisión completa requiere del orden de 6-7 GB de VRAM, y en cuantización de 4 bits puede situarse en torno a 2-3 GB; estas cifras son estimaciones generales para el tamaño del modelo base, no datos publicados para este repositorio.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada; el tamaño del repositorio (0,2 GB) corresponde a adaptadores LoRA, que requieren cargar además el modelo base Qwen2.5-3B-Instruct.
- Opciones de despliegue: no disponible en la información proporcionada. Los adaptadores en safetensors son compatibles con el ecosistema de PEFT/Hugging Face Transformers, pero no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la información proporcionada. La comparación relevante que sí aparece en la model card es interna: SFT sobre el oráculo y SFT+GRPO empatan en métricas agregadas (75,5 % de brecha capturada, regret 0,849), mientras que GRPO desde el modelo base obtiene 43,8 % y regret 1,952, y la regla de setback se queda en 17,7 %.

| Modelo / política | Parametros | Contexto | gap_captured | regret | Licencia |
|---|---|---|---|---|---|
| HVAC twin v8 (SFT+GRPO) | 3B (base) + LoRA | no disponible | 75,5 % | 0,849 | no disponible |
| HVAC twin v8 (GRPO from base) | 3B (base) + LoRA | no disponible | 43,8 % | 1,952 | no disponible |
| Setback rule | no aplica | no aplica | 17,7 % | 2,855 | no disponible |
| Termostato 24C | no aplica | no aplica | 0,0 % | 3,470 | no disponible |

## Limitaciones y advertencias

- Dominio muy restringido: el modelo está entrenado para una tarea concreta (setpoints horarios en un gemelo 2R2C de oficina) y no se documenta su comportamiento fuera de ese escenario.
- Resultados de BOPTEST no incluidos: la validación en un entorno de referencia más realista quedó pendiente porque el servicio no estaba disponible en la ejecución reportada.
- GRPO posterior al SFT no aporta mejora medible: las métricas de SFT y SFT+GRPO son idénticas en la model card, lo que limita la conclusión de que GRPO añada valor en esta configuración.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas no disponibles: no se documenta el soporte multilingüe.
- Riesgo de alucinación: no evaluado en la información disponible; en una tarea de control, una consigna inválida puede traducirse en violaciones de confort (la variante base muestra `viol` de 16,05 y validez del 98 %).
- Coste energético: la variante GRPO desde base reporta un coste de 4,16 frente a 2,92 de las variantes SFT, lo que indica que la política con peor brecha capturada también es más cara.
- Ausencia de benchmarks estándar: no hay datos de MMLU, HumanEval ni GSM8K, por lo que no es posible comparar sus capacidades generales con otros modelos de 3B.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de uso o validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/GeMri98/hvac-twin-grpo-v8
- Resultados reportados en el repositorio: `v8_results.json` (referenciado en la model card)
- Curvas de entrenamiento: `grpo_curves.png` (referenciado en la model card)
- Adaptadores: `adapter_v8_sft`, `adapter_v8_grpo`, `adapter_v8_sft_grpo` (referenciados en la model card)
- Paper, blog, repositorio de código o demo: no disponible en la información proporcionada.
