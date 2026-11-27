# rumezhak/microduck-tug-cup4-p10-ppo

## Resumen

`rumezhak/microduck-tug-cup4-p10-ppo` es una política de control para el juego de "tug of war" (tira y afloja) del entorno simulado MicroDuck Arena, un espacio de competición de robótica organizado por Pollen Robotics. No es un modelo de lenguaje: es una red neuronal pequeña exportada a ONNX que controla las articulaciones de un robot MicroDuck simulado en una tarea de tracción contra otro agente. El modelo parte de la red `tug-p10` de SSH111111 y ha sido afinado con PPO por el autor `rumezhak`.

La relevancia es acotada y muy específica: se trata de una entrada para la copa semanal número 4 del MicroDuck Arena, cerrada el 27 de noviembre. El autor reporta una mejora sustancial del win rate frente a la red de partida (del 44,6 % al 80,5 % en 600 combates) a costa de perder rendimiento frente a oponentes que no formaban parte del pool de entrenamiento. Es un ejemplo de entrenamiento adversarial por PPO contra un conjunto concreto de rivales públicos.

No hay información sobre arquitectura interna, número de parámetros, contexto ni idiomas, ya que el objeto del modelo es una política de control robótico y no un modelo generativo de texto. La model card es explícita en que el modelo es solo para simulación y no debe cargarse en un MicroDuck físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para control robótico (MLP con normalizador de observaciones, exportada a grafo ONNX); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; el autor no documenta cuantizaciones) |
| Idiomas soportados | no aplica |
| Licencia | Sin licencia declarada en el repositorio; contiene secciones con avisos Apache-2.0 de terceros (`LICENSE-apache-2.0.txt`, `NOTICE`). El repositorio en su conjunto no está etiquetado como Apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo es una política de control que opera sobre el simulador MuJoCo del MicroDuck Arena. Según la model card, la red base es `SSH111111/microduck-tug-p10` (revisión `a268ccfe334a`) y el autor la afinó con PPO durante 120 iteraciones, con learning rate 5e-5, 2048 entornos en paralelo y el normalizador de observaciones congelado en el del modelo p10. El entrenamiento se ejecutó en GPU dentro del entorno de entrenamiento de tug del Arena.

El pool de sparring estuvo formado por las entradas públicas más fuertes de la copa: la propia `p10`, `Tug Norris` de GinDuck, `tug-cup3-tn1` de jrubiosainz, `tug-hc9-aifund` de suraj-phanindra, `quicksilver-tug-rating-nov18-v2` de Hlib, `tug-entry-3` de nootxlm, `tug-super-v11` de greecree y `songkran-duck-tug6` de DenRakEiw. Ninguno de sus pesos se incluye en el fichero. Respecto al checkpoint anterior del autor (`tug-cup3-p10-copy`), solo cambian los pesos del actor (normalizador y `mlp.*`); los operadores del grafo, las filas de lookup, `L_mask`, `L_tol` y el resto de tensores permanecen iguales. Los metadatos `modification_notice` conservan el texto anterior y añaden el aviso de esta versión, conforme a la sección 4(b) de Apache-2.0.

## Capacidades

- Control de política para la tarea de tug of war en el simulador MicroDuck Arena.
- Inferencia determinista en x86-64 con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1 fijados por el Arena.
- Reproducción de secuencias grabadas para las cinco semillas oficiales de rating (las filas de rating se reproducen, no se generan).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No soporta visión, audio ni modos de "thinking".

## Casos de uso

- Competición en el MicroDuck Arena: la entrada está pensada para participar en la copa semanal del Arena, donde el modelo compite contra otras políticas en combates simulados de tug of war.
- Evaluación de técnicas de PPO adversarial: sirve como caso de estudio de cómo el fine-tuning contra un pool concreto de rivales mejora el win rate frente a esa familia (80,5 % frente a `p10`) y lo degrada frente a rivales fuera del pool (52,8 % frente a `titan-v3`).
- Benchmark de robustez y sobreajuste en políticas de control: permite medir la transferencia de una política afinada contra oponentes no vistos en entrenamiento.
- Reproducción de experimentos de RL en robótica simulada: el modelo y su configuración (120 iteraciones, 5e-5, 2048 entornos) son reproducibles con el runner del Arena.
- Estudio de linaje y licencias en modelos derivados: la model card documenta con detalle la cadena de dependencias (`p10` → `tug-cup3-p10-copy` → esta entrada) y las obligaciones de atribución.
- Docencia de RL aplicado a robótica: ejemplo compacto de entrenamiento PPO con normalizador congelado y pool de sparring.

## Benchmarks y rendimiento

Resultados reportados por el autor con el runner del Arena (microduck-arena 0.7.0), en su máquina x86-64, con lados alternados y semillas de combate aleatorias. 240 combates para `tug-p10` y 600 para esta entrada:

| Oponente | `tug-p10` | Esta entrada |
|---|---|---|
| SSH111111 `tug-p10` (red de partida) | 44,6 % | 80,5 % |
| GinDuck `Tug Norris` | 48,8 % | 82,2 % |
| jrubiosainz `tug-cup3-tn1` | 48,3 % | 77,0 % |
| azukiq `titan-v3` | 75,0 % | 52,8 % |
| greecree `tug-super-v11` | 70,0 % | 51,6 % |
| suraj-phanindra `tug-hc9-aifund` | 95,8 % | 95,3 % |
| HlibPlakhtii `quicksilver-tug-rating-nov18-v2` | 99,2 % | 95,8 % |
| nootxlm `tug-entry-3` | 100,0 % | 99,3 % |
| DenRakEiw `songkran-duck-tug6` | 100,0 % | 100,0 % |

El autor califica el resultado como un intercambio, no una ganancia gratuita: mejora claramente frente a la familia `p10` y pierde fuerza frente a redes que no estuvieron en el pool de entrenamiento (la recurrente `titan-v3` de azukiq no puede incluirse en el pool, y la red antigua de greecree tampoco). El rating reportado es de 166,7 cm, fijado por las filas de rating heredadas de entradas anteriores del autor.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repositorio es de 0,0 GB según Hugging Face, lo que sugiere un modelo muy pequeño, pero no se publica el número de parámetros.
- GPU recomendadas: no disponibles. El autor entrenó en GPU sin especificar modelo.
- Compatibilidad con GPU de consumo: no confirmada explícitamente, pero por el tamaño del artefacto (ONNX de pocos MB) es plausible que quepa en cualquier GPU de consumo; no hay dato oficial.
- Opciones de despliegue: onnxruntime 1.24.4 con MuJoCo 3.10.0 y numpy 2.4.1, ejecutado a través del runner del MicroDuck Arena (microduck-arena 0.7.0). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Win rate vs `p10` | Win rate vs `titan-v3` | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Esta entrada (`rumezhak/microduck-tug-cup4-p10-ppo`) | Política ONNX afinada con PPO | 80,5 % | 52,8 % | Sin licencia declarada (avisos Apache-2.0 parciales) | Pública en HF |
| `SSH111111/microduck-tug-p10` | Política base | 44,6 % (vs sí misma) | 75,0 % | Sin licencia declarada | Pública en HF |
| `GinDuck/Tug Norris` | Política de tug | 48,8 % (medido con `p10`) | no disponible | no disponible | Pública en HF |
| `azukiq/titan-v3` | Política recurrente | no disponible | no disponible | no disponible | Pública en HF |

La comparación se limita al win rate medido en el runner del Arena; no hay datos de parámetros, contexto ni rendimiento en otras tareas porque estos modelos no son de propósito general.

## Limitaciones y advertencias

- Solo para simulación: la model card prohíbe explícitamente cargarlo en un MicroDuck físico.
- Sobreajuste al pool de entrenamiento: la ventaja desaparece o se invierte frente a rivales no incluidos en el pool; cualquiera que entrene contra este fichero puede anular su ventaja.
- Reproducibilidad frágil: los replays son deterministas solo en x86-64 con las versiones fijadas de MuJoCo, onnxruntime y numpy; el redondeo de otra CPU puede romperlos.
- Las filas de rating reproducen secuencias grabadas de otros autores para las cinco semillas oficiales; no son generadas por la red y solo fijan el rating (166,7 cm) que siembra el sorteo de la copa.
- Licencia ambigua: el repositorio no declara licencia propia; la red base `p10` no declara licencia, `lphatnguyen/microduck-tug-of-war-v0` y `greecree/microduck-tug-of-war-tug-super-v8` tampoco, y `jrubiosainz/microduck-tug-quicksilver-v14-h2-63aab429` tiene fichero `LICENSE` Apache-2.0 pero sin campo `license:`. El uso comercial no está garantizado por la cadena de licencias.
- El autor no consultó a SSH111111, lphatnguyen, jrubiosainz ni greecree antes de publicar; se compromete a retirar la entrada si alguno objeta.
- Sin datos de sesgos, alucinación o limitaciones idiomáticas: no aplican a un modelo de control robótico, pero tampoco se documentan sesgos de política (por ejemplo, comportamiento degenerado en estados fuera de distribución).
- El autor declara que un asistente de IA ayudó en los experimentos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rumezhak/microduck-tug-cup4-p10-ppo
- Red base: https://huggingface.co/SSH111111/microduck-tug-p10
- Checkpoint previo del autor: https://huggingface.co/rumezhak/microduck-tug-cup3-p10-copy
- Entrada v1 del autor (créditos de las filas de rating): https://huggingface.co/rumezhak/microduck-tug-cup3-tuned-v1
- Microduck Arena (Space): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Red de referencia de greecree: https://huggingface.co/greecree/microduck-tug-of-war-tug-super-v8
- Red de referencia de jrubiosainz: https://huggingface.co/jrubiosainz/microduck-tug-quicksilver-v14-h2-63aab429
- Red de referencia de lphatnguyen: https://huggingface.co/lphatnguyen/microduck-tug-of-war-v0
