# HlibPlakhtii/microduck-hill-quicksilver-v2

## Resumen

microduck-hill-quicksilver-v2 es una política de control robótico en formato ONNX desarrollada por HlibPlakhtii como variante de competición para el entorno simulado MicroDuck Arena de Pollen Robotics. Se trata de un finetune de rumezhak/microduck-hill-remix-leader3, sobre el que se añade una tabla de búsqueda de observaciones que reproduce una secuencia de objetivos articulares optimizada mediante CMA-ES separable. El modelo no es un modelo de lenguaje: es una política de locomoción que mapea observaciones del robot a comandos de servo en MuJoCo.

La relevancia del modelo es acotada y explícitamente declarada por el autor: se trata de una política in-sample, solo para simulación y diseñada para las condiciones de evaluación concretas de la competición. No pretende ser un controlador de propósito general ni apto para operación segura en robots reales. El repositorio ocupa 0.0 GB según HuggingFace y cuenta con 15 descargas y 0 likes en el momento de la ficha.

La arquitectura subyacente es una red de política (policy network) exportada a ONNX que se ejecuta con ONNX Runtime 1.24.4 sobre MuJoCo 3.10.0. No se dispone de información sobre el número de parámetros, la longitud de contexto (no aplica en el sentido de LLM) ni los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de política robótica exportada a ONNX (arquitectura interna no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo parte de la política rumezhak/microduck-hill-remix-leader3, de la que se preservan la red de fallback y todos los operadores de grafo originales. Sobre esa base se añade una tabla de búsqueda (lookup) de observaciones: cuando las observaciones registradas coinciden, se reproduce una secuencia de objetivos articulares previamente buscada; en caso contrario, se delega en el controlador original. La secuencia nueva se optimizó localmente con CMA-ES separable contra el evaluador de Arena sin modificar, usando runner versión 5, MuJoCo 3.10.0, ONNX Runtime 1.24.4 y NumPy 2.4.1.

La trayectoria de partida de la búsqueda se convirtió primero a objetivos de servo equivalentes, preservando cada fuerza de motor registrada, el asentamiento (settle) y la traza de movimiento completa sobre el arranque buscado, lo que elimina la magnitud de objetivo no utilizada más allá de la saturación del motor. La búsqueda posterior modificó la trayectoria. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de RLHF o DPO, que no aplican en este contexto.

## Capacidades

- Control de locomoción en simulación MuJoCo para el entorno MicroDuck Arena.
- Reproducción de una secuencia de objetivos articulares optimizada para arranques de evaluación declarados.
- Fallback al controlador original cuando las observaciones no coinciden con las registradas.
- Ejecución mediante ONNX Runtime (versión validada: 1.24.4).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión ni audio.
- Reproducibilidad mediante artefactos incluidos: search_race.py, search-config.json, searched-actions.npz y local-verification.json.

## Casos de uso

- Participación en la competición MicroDuck Arena: la política está diseñada específicamente para los arranques de evaluación declarados, con un tiempo medio local de 0.739 s y 5/5 finalizaciones a 0.15 m/s de comando.
- Reproducción de resultados de leaderboard: los artefactos permiten replicar la secuencia mediante el runner de Arena y superponerla sobre la base fijada con el Recorder y overlay del script incluido.
- Investigación en optimización de políticas: sirve como ejemplo de búsqueda CMA-ES separable sobre trayectorias de servo con preservación de fuerzas de motor.
- Estudio de técnicas de lookup condicionado por observaciones: el modelo ilustra un patrón híbrido entre política neuronal y tabla de búsqueda.
- Verificación local de pipelines de evaluación: permite validar la cadena MuJoCo 3.10.0 + ONNX Runtime 1.24.4 + NumPy 2.4.1 en un caso concreto.
- Docencia sobre limitaciones de políticas in-sample: útil para demostrar por qué una política ajustada a arranques concretos no generaliza a locomoción de propósito general.
- No es adecuado para despliegue en robots reales ni para tareas fuera de la simulación declarada.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Tiempo medio local (5 arranques) | 0.739 s |
| Finalizaciones locales | 5/5 |
| Comando de velocidad | 0.15 m/s |
| Media oficial de la base fijada | 0.739 s |
| Entrada previa quicksilver-hill-v1 | 0.740 s |
| Trayectoria semilla 1 | 0.735 s (objetivo: paso de 0.730 s) |

El autor indica que el resultado del servidor es la autoridad final y que este modelo no supera en velocidad a la base acreditada; iguala su media oficial de 0.739 s. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB y la política es de tamaño reducido, pero no se especifican parámetros.
- GPU recomendadas: no disponible; la ejecución validada es con ONNX Runtime 1.24.4, que puede correr en CPU.
- Compatibilidad con GPU de consumo: no disponible; por el tamaño del repositorio es plausible que quepa en cualquier GPU de consumo, pero no se confirma en la información.
- Opciones de despliegue: ONNX Runtime (versión validada 1.24.4) junto con MuJoCo 3.10.0 y NumPy 2.4.1; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican.
- Latencia y throughput: no disponibles; solo se reporta el tiempo de finalización de la carrera (0.739 s de media local).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-hill-quicksilver-v2 | no disponible | no aplica | 0.739 s medio local, 5/5 | Apache 2.0 | HuggingFace |
| rumezhak/microduck-hill-remix-leader3 (base) | no disponible | no aplica | 0.739 s medio oficial | no disponible | HuggingFace |
| quicksilver-hill-v1 (entrada previa) | no disponible | no aplica | 0.740 s | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Política in-sample: la tabla de búsqueda se optimizó para los arranques de evaluación declarados; no es una política de locomoción de propósito general.
- Solo simulación: el autor declara explícitamente que los resultados no constituyen una afirmación de operación segura en robots reales.
- No supera a la base: iguala la media oficial de 0.739 s y no establece un récord de velocidad.
- Dependencia de condiciones exactas: si las observaciones no coinciden con las registradas, se usa el controlador original, con el comportamiento que ello implique.
- Sesgos conocidos: no disponibles; no aplica el concepto habitual de sesgo de modelos de lenguaje.
- Riesgo de alucinación: no aplica; es una política de control, no un generador de texto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el propio autor desaconseja el uso fuera de simulación.
- Caveat para producción: no debe desplegarse en sistemas físicos sin validación independiente; los resultados locales no sustituyen al resultado del servidor.

## Enlaces

- HuggingFace: https://huggingface.co/HlibPlakhtii/microduck-hill-quicksilver-v2
- Modelo base: https://huggingface.co/rumezhak/microduck-hill-remix-leader3/tree/cddaeebb6bcee5ef84729d9eb0838fc74097cf2c
- Evaluador Arena: https://huggingface.co/spaces/pollen-robotics/microduck-arena/tree/main
