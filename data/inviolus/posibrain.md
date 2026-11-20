# inviolus/Posibrain

## Resumen

Posibrain es un agente de aprendizaje por refuerzo (RL) de muy pequeno tamano desarrollado por Erdem Aslan (usuario `inviolus` en Hugging Face) para una tarea concreta: la busqueda de una persona desaparecida en un entorno simulado de 1 km x 1 km mediante un dron. El modelo no recibe ninguna pista sobre la ubicacion del objetivo; debe aprender una politica de exploracion desde cero (sin pesos preentrenados) en una simulacion procedural de bosque y pantano. La red es una CNN pequena con 52.420 parametros que, tras cuantizacion a int8, ocupa 60,8 KB, un tamano compatible con microcontroladores de clase ESP32.

La relevancia del proyecto es doble. Por un lado, es un ejemplo de TinyML aplicado a RL: demuestra que una politica de busqueda puede entrenarse con PPO en GPU y desplegarse en un dispositivo de recursos muy limitados. Por otro, la model card es inusualmente honesta: el autor documenta explicitamente que todos los numeros del simulador son suposiciones no medidas, que no se ha ejecutado nada en un dron real ni en un microcontrolador, y que varios experimentos (multi-dron, cabeza de probabilidad de exito, poda) fracasaron. No hay datos publicados de benchmarks estandar ni idiomas soportados, ya que no es un modelo de lenguaje.

La arquitectura es una CNN que procesa un parche local del mapa, una mascara global de zonas exploradas y un vector de escalares, entrenada con PPO. El contexto, los idiomas y el formato de pesos estandar de LLM no aplican; el artefacto es un modelo TFLite cuantizado a int8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN pequena (parche local de mapa + mascara global explorada + vector escalar), entrenada con PPO |
| Parametros totales | 52.420 (version completa); 13.656 (version nano, width 0.5) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa observaciones por paso) |
| Tipos de cuantizacion | int8 (post-entrenamiento); pesos float e int8 disponibles |
| Idiomas soportados | no disponible (no aplica; el agente no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (int8); pesos float para la version sin cuantizar |

## Arquitectura y entrenamiento

La politica es una red neuronal convolucional de 52.420 parametros que recibe tres entradas: un parche local del mapa alrededor del dron, una mascara global de las zonas ya exploradas y un vector de escalares (estado del dron, bateria, altitud, etc.). El entrenamiento se realiza con PPO (Proximal Policy Optimization) sobre GPU con TensorFlow en WSL Ubuntu, mientras que el simulador corre en CPU con numba. El entorno es un mundo procedural de bosque y pantano de 1 km x 1 km con celdas de 10 m; cada episodio genera un terreno nuevo y una ubicacion aleatoria de la persona. El agente dispone de 12 acciones: movimiento en 8 direcciones, escaneo (hover), subir y bajar altitud, y reportar. La recompensa principal proviene de un reporte correcto (posicion a menos de 50 m de la persona), con penalizacion por falsas alarmas (los pajaros generan detecciones falsas) y un coste energetico por segundo. La altitud introduce un compromiso real: a mayor altitud, mayor cobertura pero mayor ocultacion por el dosel del bosque.

Una innovacion destacable es la recalibracion del simulador: en la primera version, una regla simple de "volar alto" alcanzaba el 93,5%, lo que revelo que el simulador no modelaba bien el compromiso de altitud. El autor recalibro con una penalizacion de dosel dependiente de la altitud y los resultados presentados corresponden al simulador corregido. Tambien se entreno una version "nano" con multiplicador de anchura 0,5 (13.656 parametros, 21,8 KB en int8) desde cero. No se documenta el numero de tokens ni composicion de dataset porque no es un modelo de lenguaje; el entrenamiento es por interaccion con el simulador.

## Capacidades

- Navegacion y exploracion autonoma en un mapa 2D simulado de 1 km x 1 km sin pista sobre la ubicacion del objetivo.
- Politica de busqueda aprendida con 12 acciones discretas (8 direcciones, escaneo, subir/bajar altitud, reportar).
- Gestion implicita del compromiso de altitud (cobertura amplia vs. deteccion precisa bajo dosel).
- Deteccion de objetivos con modelo abstracto de probabilidad (no sensores reales de radar, sonido o termico).
- Reporte de posicion con umbral de 50 m y penalizacion por falsas alarmas.
- Version cuantizada a int8 apta para despliegue en microcontroladores de clase ESP32.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingues ni modos de razonamiento: no es un modelo de lenguaje.

## Casos de uso

- Investigacion en TinyML y RL: usar el modelo como caso de estudio reproducible de entrenamiento PPO en GPU y despliegue int8 en un microcontrolador, con codigo de simulador y entrenamiento incluido en el repositorio.
- Prototipado de politicas de busqueda y rescate: servir de base para experimentar con heuristicas de exploracion (barrido, vuelo alto) y comparar contra una politica aprendida en un entorno controlado.
- Docencia de aprendizaje por refuerzo: el repositorio incluye simulador determinista por semilla, baselines (aleatorio y barrido tipo lawn-mower) e intervalos de confianza Wilson, lo que facilita explicar evaluacion rigurosa de politicas.
- Estudio de cuantizacion int8 en politicas de RL: comparar el rendimiento float (84,2%) frente a int8 (83,2%) en una red de 52.420 parametros y medir la perdida de rendimiento por cuantizacion.
- Benchmark de arquitecturas compactas: la version nano (13.656 parametros, 21,8 KB) permite evaluar el compromiso entre tamano y rendimiento (82,0% float, 80,7% int8) frente a la version completa.
- Base para experimentos de multi-agente: aunque el multi-dron fallo en este trabajo, el codigo de simulador multi-dron (`sim/envm.py`) y los resultados documentados sirven como punto de partida para investigar coordinacion y escalado de recompensas.

## Benchmarks y rendimiento

Resultados en test reservado (semillas 2.000.000+, 2.000 episodios, intervalos de confianza Wilson al 95%), simulador de 1 km con un dron:

| Politica | Tasa de exito (IC 95%) | Tamano int8 |
|---|---|---|
| Vuelo aleatorio | 27,4% (25,5 - 29,4) | - |
| Barrido lawn-mower, altitud media (regla) | 74,9% (72,9 - 76,7) | - |
| Barrido lawn-mower, altitud alta (mejor regla) | 80,6% (78,8 - 82,3) | - |
| Posibrain float (52.420 parametros) | 84,2% (82,5 - 85,7) | - |
| Posibrain int8 | 83,2% (81,5 - 84,8) | 60,8 KB |
| Posibrain nano width 0.5, float (13.656 parametros) | 82,0% (80,2 - 83,6) | - |
| Posibrain nano width 0.5, int8 | 80,7% (78,9 - 82,4) | 21,8 KB |

El autor advierte que la politica float supera a la mejor regla por unos 3,6 puntos y que los intervalos de confianza apenas se separan (82,5 vs 82,3), por lo que la conclusion justa es "ligeramente mejor que una regla ajustada en este simulador". La cuantizacion int8 pierde aproximadamente 1 punto, dentro del ruido. No se midio varianza entre ejecuciones de entrenamiento (una sola semilla por configuracion). No hay resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) porque no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo es de 60,8 KB en int8 y 52.420 parametros, por lo que la inferencia es trivial en cualquier hardware.
- GPU recomendadas: no se especifican; el entrenamiento se realizo en GPU con TensorFlow (WSL Ubuntu), pero no se documenta el modelo de GPU utilizado.
- Compatibilidad con GPU de consumo: si, cualquier GPU moderna puede entrenar una red de este tamano; la inferencia no requiere GPU.
- Despliegue: el artefacto es TFLite int8, pensado para microcontroladores de clase ESP32. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no medidos. El autor indica explicitamente que no se realizaron mediciones de latencia ni de RAM en dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Posibrain (inviolus) | 52.420 (60,8 KB int8) | no aplica | 84,2% float / 83,2% int8 en simulador propio | Apache 2.0 | Hugging Face |
| Posibrain nano (inviolus) | 13.656 (21,8 KB int8) | no aplica | 82,0% float / 80,7% int8 en simulador propio | Apache 2.0 | Hugging Face |
| Regla lawn-mower altitud alta (baseline del autor) | 0 (heuristica) | no aplica | 80,6% en simulador propio | no aplica | incluida en el repositorio |
| Otros modelos RL para drones en TinyML | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de terceros en la informacion proporcionada. La unica comparacion disponible es interna al repositorio (reglas heurísticas y vuelo aleatorio).

## Limitaciones y advertencias

- Todo el trabajo es simulacion: cada numero del simulador (bateria, velocidad, probabilidades de deteccion, pantano, pajaros) es una suposicion no medida.
- No se ha ejecutado en un dron real ni en un microcontrolador; los tamanos int8 son tamanos de fichero reales, pero las tasas de exito son resultados de simulacion y no deben interpretarse como rendimiento de campo.
- Una sola semilla de entrenamiento por configuracion: no se midio la varianza entre ejecuciones; la evaluacion durante el entrenamiento oscila decenas de puntos entre checkpoints.
- El multi-dron fallo: 2 drones alcanzan 58,1% frente al 80,1% de la regla baseline, y 4 drones puntuan 0% tras el reescalado de costes.
- La cabeza de probabilidad de exito no esta calibrada (Brier 0,285 frente a 0,179 de un predictor constante) y empeoro la politica (77,2% float); el repositorio no ofrece probabilidades calibradas.
- La poda estructurada a anchura 0,5 no supero el entrenamiento desde cero (74,1% tras 300 iteraciones de fine-tuning frente a 82,0% con 800 iteraciones desde cero), aunque los presupuestos no son iguales.
- No hay accion de "volver a casa", ni sensores reales de radar, sonido o termico; el "sensor" es un modelo abstracto de probabilidad de deteccion.
- No hay mediciones de latencia ni de RAM en dispositivo.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias de rendimiento en produccion ni en entornos reales.
- No aplica a tareas de lenguaje, vision general, codigo o matematicas; su uso esta acotado a la politica de busqueda simulada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inviolus/Posibrain
- Repositorio de codigo y pesos: referenciado en la model card (ficheros `LICENSE`, `NOTICE`, directorios `sim/`, `results/runs/`); no se proporciona URL externa en la informacion disponible.
- Paper, blog o demo: no disponible en la informacion proporcionada.
