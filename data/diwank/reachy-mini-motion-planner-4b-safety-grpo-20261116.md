# diwank/reachy-mini-motion-planner-4b-safety-grpo-20261116

## Resumen

Reachy Mini motion planner 4b safety GRPO es un modelo de lenguaje de 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) derivado de `binhpham/reachy-mini-motion-planner-4b`, afinado por el usuario diwank para planificación de movimiento del robot humanoide Reachy Mini. El modelo recibe una instrucción en lenguaje natural más la pose actual del robot y devuelve un JSON con una idea y una receta de movimiento (ángulos articulares y traslaciones) que un generador de flujo descendente convierte en trayectorias ejecutables. Es, por tanto, un planificador textual de gestos, no un controlador de motores.

La relevancia del modelo está en su metodología: parte de un calentamiento supervisado de 10 pasos sobre 39 recetas aceptadas y aplica después 100 actualizaciones de GRPO (Group Relative Policy Optimization) sobre 320 tareas repartidas en diez familias de gestos, con recompensas que penalizan violaciones de seguridad (clearance, límites de pose y velocidad, cinemática inversa, pitch descendente, distorsión del controlador y duración). El objetivo declarado es aumentar la proporción de gestos útiles y seguros antes de cualquier corrección posterior por parte de las salvaguardas de tiempo de ejecución.

Se trata de un piloto de investigación numérico, no de una garantía de seguridad lista para robot. El autor lo etiqueta explícitamente como `research-pilot` y advierte de que las métricas se obtuvieron con el generador de flujo congelado, cinemática y reproducción numérica, sin probar ningún robot físico. La ganancia en seguridad viene acompañada de una pérdida de éxito gestual, y el modelo solo entiende inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`Qwen3_5ForCausalLM`, texto únicamente; visión y MTP excluidos) |
| Parámetros totales | 4.205.751.296 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repo publica pesos BF16 fusionados) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16 fusionado) |

## Arquitectura y entrenamiento

El modelo es un `Qwen3_5ForCausalLM` autónomo fusionado en BF16, de solo texto: la visión y el MTP (multi-token prediction) del modelo base quedan excluidos. El entrenamiento consta de dos fases. Primero, un calentamiento supervisado (SFT) de 10 pasos sobre 39 recetas aceptadas de tres tipos de gesto (asentimiento, inclinación a la izquierda y mirada hacia arriba), seleccionadas tras cribar 3.840 candidatos procedentes de recetas semilla acotadas y de un pool anterior del planificador base. Después, 100 actualizaciones de GRPO sobre 320 tareas en diez familias de gestos, con cuatro candidatos por grupo, dos semillas emparejadas del generador y 3.200 completaciones RL muestreadas.

El entrenamiento se ejecutó en ocho GPU A100 de 40 GB en BF16 con LoRA de rango 16, manteniendo congelado el generador de flujo. La función de recompensa suma 2 puntos por movimiento útil y 2 adicionales si ese movimiento, tanto en trayectoria cruda como reproducida, pasa las comprobaciones de seguridad; aplica penalizaciones acotadas por clearance, límites de pose y velocidad, cinemática inversa, pitch descendente, estrés de retardo, distorsión del controlador y duración, y asigna -10 a las recetas inválidas. Las dos muestras del generador se agregan como la mitad de su media más la mitad de su mínimo. La proyección de cinemática inversa del upstream se omite antes de puntuar. Los checkpoints de los pasos 10, 50 y 100 se seleccionaron por éxito articular en dev, y el checkpoint final ganó antes de abrir el conjunto de test. El modelo publicado es la fusión BF16, evaluada por separado tras comprobar que su recarga producía una receta distinta a la del adaptador.

## Capacidades

- Generación de recetas de movimiento en JSON con dos campos: `idea` (descripción textual del gesto) y `recipe` (ángulos articulares y traslaciones).
- Planificación de gestos para diez familias conocidas (asentimiento, inclinación lateral, mirada hacia arriba, entre otras) con formulaciones y poses separadas para train/dev/test.
- Condicionamiento por pose inicial: la instrucción se acompaña de `\ncurrent_pose=` seguido de un JSON de pose con claves ordenadas.
- Interpretación de instrucciones en lenguaje natural en inglés para producir movimientos del robot Reachy Mini.
- Salida numérica con ángulos en grados y traslaciones en metros, relativos a la pose inicial asentada tras el anclaje; el canal de altura de la receta del generador descendente permanece en milímetros.
- Generación determinista recomendada (greedy, máximo 384 tokens nuevos, con los dos IDs de EOS del contrato).
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking (se fuerza `enable_thinking=False`).
- No produce comandos de motor por sí solo: requiere el generador de flujo y el DSL descendentes.

## Casos de uso

- Planificación de gestos sociales en robótica de compañía: el modelo traduce instrucciones como "asiente lentamente" en una receta JSON que el generador de flujo convierte en trayectoria para Reachy Mini, con comprobaciones de seguridad integradas en la recompensa de entrenamiento.
- Investigación en RLHF/GRPO aplicado a robótica: sirve como caso reproducible de ajuste por refuerzo con recompensas numéricas de seguridad sobre un modelo base de 4B, útil para estudiar el equilibrio entre éxito gestual y seguridad.
- Generación de datos sintéticos de movimiento seguro: las recetas que superan las comprobaciones de clearance y límites pueden emplearse como semillas para ampliar datasets de planificación motora.
- Evaluación comparativa de salvaguardas en tiempo de ejecución: al publicar métricas de trayectoria cruda y reproducida, permite medir cuánto aporta cada guarda de seguridad frente a la corrección del modelo.
- Prototipado de interfaces lenguaje-movimiento: para equipos que investigan cómo mapear instrucciones en inglés a poses articulares sin entrenar un planificador desde cero, partiendo de un checkpoint Apache 2.0.
- Reproducción de benchmarks de seguridad motora: los splits train/dev/test publicados permiten replicar los resultados del piloto y comparar futuras variantes sobre las mismas diez familias de gestos.
- Estudio de ablaciones de pose inicial: el autor documenta que el intervalo de confianza de la diferencia entre pose correcta y permutada cruza cero, lo que convierte al modelo en material para analizar la sensibilidad al estado de partida.

## Benchmarks y rendimiento

Resultados sobre 80 tareas retenidas, con dos muestras emparejadas del generador por tarea, según la model card:

| Métrica de test congelado | Base | SFT | Adaptador GRPO | Modelo BF16 fusionado |
|---|---:|---:|---:|---:|
| Útil y seguro antes de corrección | 5,00 % | 35,00 % | 52,50 % | 50,62 % |
| Trayectoria cruda segura | 5,00 % | 46,25 % | 83,12 % | 80,00 % |
| Predicado de gesto reproducido | 84,38 % | 84,38 % | 66,88 % | 68,12 % |

La diferencia de éxito conjunto entre RL y SFT es de 17,50 puntos porcentuales, con intervalo bootstrap estratificado por familia del 95 % de [11,88, 23,12]. La diferencia entre pose inicial correcta y permutada para el adaptador RL es de -0,62 puntos, con intervalo [-5,62, 3,75], por lo que el piloto no demuestra beneficio de la pose inicial correcta. La seguridad de trayectoria reproducida es del 100 % en todos los brazos porque las guardas existentes corrigen las trayectorias.

## Requisitos de hardware

- El repo ocupa 8,4 GB en safetensors BF16; la inferencia en BF16 requiere del orden de 8-10 GB de VRAM solo para pesos, más memoria para KV cache y el generador de flujo descendente.
- GPU recomendadas para el entrenamiento documentado: ocho A100 de 40 GB en BF16 (configuración usada por el autor).
- Para inferencia, una GPU consumer con 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 4090) debería alojar los pesos BF16; no se han publicado requisitos ni cuantizaciones oficiales.
- No se han publicado versiones GGUF ni cuantizadas; las opciones de despliegue documentadas se limitan a `transformers` 5.23.0, `torch` 2.15.0 y `accelerate` 1.15.0, con un `example.py` incluido que descarga el modelo y genera una receta sin conectarse a ningún robot.
- No se han publicado datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Reachy Mini motion planner 4b safety GRPO (este) | 4,21 B | No disponible | Planificación de movimiento con GRPO y recompensas de seguridad | Apache 2.0 | Hugging Face |
| `binhpham/reachy-mini-motion-planner-4b` (base) | 4 B (según nombre) | No disponible | Planificador de movimiento previo al ajuste | No disponible en la información | Hugging Face |
| Adaptador `diwank/reachy-mini-motion-planner-4b-safety-lora-20261116` | LoRA rango 16 sobre el base | No disponible | Ajuste GRPO sin fusionar | No disponible en la información | Hugging Face |

No se dispone de información sobre otros planificadores de movimiento comparables de la misma categoría en los datos proporcionados.

## Limitaciones y advertencias

- Piloto de investigación numérico: no constituye una garantía de seguridad lista para robot y requiere guardas de tiempo de ejecución.
- La ganancia en seguridad reduce el éxito gestual: el predicado de gesto reproducido cae del 84,38 % (base y SFT) al 66,88 % (adaptador GRPO) y al 68,12 % (fusionado).
- Métricas obtenidas con el generador de flujo congelado, cinemática, comprobaciones de clearance y velocidad y reproducción numérica; no se probó ningún robot físico.
- Los estados iniciales son asentados y suaves (roll ±4 grados, pitch -7 a +2, cuerpo ±10, offset de yaw cabeza/cuerpo ±3, traslaciones nulas); no se cubren velocidades, interrupciones, estados alcanzables arbitrarios, naturalidad valorada por humanos ni familias de gestos no vistas.
- Solo diez familias de gestos conocidas, con formulaciones y poses separadas para train/dev/test; los splits públicos deben tratarse como benchmark de reproducción, no como test no visto para desarrollo posterior.
- Los intervalos de confianza condicionan a una única semilla de entrenamiento, a las políticas fijas, a esta distribución de estados y a dos semillas fijas del generador de test.
- El modelo solo entiende inglés y no soporta visión, audio, tool calling ni agentes multi-paso.
- No produce comandos de motor: necesita el generador de flujo y el DSL descendentes, y la altura de la receta permanece en milímetros en ese canal.
- Riesgo de alucinación en la receta JSON: el propio diseño del piloto asume que las salvaguardas posteriores corrigen trayectorias, ya que la seguridad de trayectoria reproducida es del 100 % en todos los brazos.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece ninguna garantía de idoneidad para producción robótica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/diwank/reachy-mini-motion-planner-4b-safety-grpo-20261116
- Adaptadores LoRA: https://huggingface.co/diwank/reachy-mini-motion-planner-4b-safety-lora-20261116
- Dataset: https://huggingface.co/datasets/diwank/reachy-mini-motion-safety-20261116
- Modelo base: https://huggingface.co/binhpham/reachy-mini-motion-planner-4b/tree/1b60d8f16b85473ceb20e3b62e464780c532b519
- Generador y DSL: https://github.com/pham-tuan-binh/reachy-motion-generator/tree/18ff98574a8f0652b21db32f204a8029f8930d88
