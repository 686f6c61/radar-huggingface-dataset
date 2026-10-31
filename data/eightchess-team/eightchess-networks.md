# EightChess-Team/eightchess-networks

## Resumen

EightChess NNUE Networks es una colección de redes neuronales de evaluación (NNUE, *Efficiently Updatable Neural Network*) entrenadas por el equipo EightChess-Team para el motor de ajedrez 8Chess, un motor de código abierto disponible en GitHub. No se trata de un modelo de lenguaje, sino de redes de evaluación posicional que el motor consulta para estimar la calidad de una posición de ajedrez durante la búsqueda.

La arquitectura de las redes publicadas emplea características de amenazas (*threat features*) y de piezas con anchura de 1024 neuronas en la capa de entrada, con 10 cubetas de entrada (*input buckets*) y 8 cubetas de salida (*output buckets*), un esquema habitual en motores modernos inspirado en Stockfish para especializar la evaluación según la fase de la partida. Cada red ocupa 80,4 MiB (variante de 1024 de anchura) o 60,3 MiB (variante de 768 de anchura).

Su relevancia radica en que la red campeona, `eightchess_1024_tuned768.nnue`, está embebida por defecto en la versión `v1.0.10` del motor y, según los datos publicados por el propio equipo, alcanza un 67,75% de puntuación frente a Stockfish 19, lo que equivale a +129 Elo. Esto la posiciona como una de las redes de evaluación más fuertes publicadas para este motor, con licencia AGPL-3.0 que garantiza el acceso libre al código y a los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NNUE (red eficientemente actualizable) con características de amenazas y piezas |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | .nnue (formato binario propio de redes NNUE para motores) |

Datos adicionales de arquitectura:

| Parametro | Valor |
|---|---|
| Anchura de capa de entrada | 1024 (variante grande) o 768 (variante compacta) |
| Cubetas de entrada | 10 |
| Cubetas de salida | 8 |
| Tamano por archivo | 80,4 MiB (1024-wide) / 60,3 MiB (768-wide) |
| Tamano total del repositorio | 1,1 GB |

## Arquitectura y entrenamiento

Las redes siguen el esquema NNUE clásico de los motores de ajedrez modernos: una capa de entrada densa de 1024 neuronas (o 768 en las variantes compactas) que procesa características de piezas y de amenazas (*threat features*) del tablero, con 10 cubetas de entrada y 8 cubetas de salida que permiten ajustar la evaluación a distintas fases de la partida o configuraciones del tablero. La naturaleza "eficientemente actualizable" de la arquitectura permite recalcular la evaluación de forma incremental tras cada movimiento, sin reevaluar toda la red, lo que es esencial para mantener millones de nodos por segundo en la búsqueda.

No se ha publicado información sobre el número de posiciones de entrenamiento, la composición del dataset, el método de generación de datos (autojuego, destilación, etc.) ni sobre los hiperparámetros de entrenamiento. El nombre de algunos archivos sugiere etapas de entrenamiento diferenciadas (base, gold, beast, master) y un proceso de destilación desde Lc0 (*Lc0-distilled*, en `eightchess_1024_lc0_best.nnue`), así como un ajuste fino (*tuning*) en la variante campeona (`tuned768`). No se dispone de detalles técnicos verificables sobre estos procesos.

## Capacidades

- Evaluación de posiciones de ajedrez variante 8Chess mediante inferencia NNUE incremental, integrada en el motor 8Chess.
- Especialización por fase de partida gracias a las 8 cubetas de salida y 10 cubetas de entrada.
- Procesamiento de características de amenazas (*threat features*) además de las características de piezas convencionales, lo que enriquece la señal de evaluación táctica.
- Carga dinámica de la red en tiempo de ejecución mediante la opción UCI `EvalFile`, sin necesidad de recompilar el motor.
- Variante compacta de 768 de anchura para entornos con restricciones de memoria.
- No tiene capacidades de lenguaje natural, generación de texto, código, visión ni tool calling: es una red de evaluación especializada para un motor de ajedrez.

## Casos de uso

- Evaluación en el motor 8Chess: la red campeona viene embebida en el binario de la versión `v1.0.10`, por lo que cualquier usuario del motor obtiene la máxima fuerza de juego sin configuración adicional.
- Experimentación con redes de evaluación: los investigadores pueden cargar distintas redes del repositorio mediante `setoption name EvalFile value /ruta/red.nnue` para comparar Elo entre variantes (base, gold, beast, destiladas de Lc0) en torneos automatizados.
- Estudios de destilación de redes neuronales: el archivo `eightchess_1024_lc0_best.nnue` permite analizar cómo se transfiere conocimiento de una red convolucional profunda tipo Lc0 a una arquitectura NNUE ligera.
- Investigación en características de amenazas: la arquitectura con *threat features* de 1024 de anchura sirve como referencia para estudiar el impacto de este tipo de características en la fuerza de evaluación frente a las características de piezas puras.
- Despliegue en hardware limitado: la variante de 768 de anchura (60,3 MiB) permite ejecutar el motor en máquinas con memoria ajustada manteniendo un nivel competitivo.
- Desarrollo de interfaces y bots de ajedrez: al integrarse en un motor compatible con el protocolo UCI, puede usarse como backend de evaluación para bots, análisis de partidas o servicios web de ajedrez.

## Benchmarks y rendimiento

Únicamente se ha publicado un resultado de comparación directa, correspondiente a la red campeona `eightchess_1024_tuned768.nnue` embebida en la versión `v1.0.10` del motor:

| Red | Resultado frente a Stockfish 19 | Diferencia Elo |
|---|---|---|
| eightchess_1024_tuned768.nnue (v1.0.10) | 67,75% | +129 Elo |

No se han publicado resultados de benchmarks para el resto de redes del repositorio (variantes base, gold, beast, master o destiladas de Lc0), ni detalles sobre las condiciones de las pruebas (control de tiempo, número de partidas, configuración de hilos o de memoria hash).

## Requisitos de hardware

- Memoria: cada red ocupa 80,4 MiB (variante de 1024) o 60,3 MiB (variante de 768) en disco y en RAM durante la ejecución; la inferencia NNUE se realiza en CPU, por lo que no se requiere GPU.
- CPU: no se han publicado requisitos mínimos; cualquier CPU x86-64 moderna con soporte de las instrucciones vectoriales compiladas en el binario del motor 8Chess debería ser suficiente.
- GPU: no necesaria; las redes NNUE están diseñadas para inferencia en CPU.
- Cabe en cualquier equipo de consumo, incluidos portátiles y Raspberry Pi (sujeto a soporte de instrucciones del binario del motor).
- Despliegue: mediante el motor 8Chess (repositorio en GitHub), cargando la red por defecto embebida en el binario o sobrescribiéndola con la opción UCI `EvalFile`. No aplica despliegue con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles; dependen de la compilación del motor, del hardware y de la configuración de búsqueda.

## Comparativa con modelos similares

Comparación con otras redes de evaluación NNUE de referencia en el ecosistema de motores de ajedrez (datos aproximados de dominio público; la red de 8Chess solo se ha comparado oficialmente frente a Stockfish 19):

| Red / motor | Arquitectura | Tamano tipico | Motor asociado | Licencia |
|---|---|---|---|---|
| eightchess_1024_tuned768.nnue | NNUE 1024-wide, amenazas + piezas, 10/8 buckets | 80,4 MiB | 8Chess v1.0.10 | AGPL-3.0 |
| Redes NNUE de Stockfish | NNUE con cubetas por fase | 40-100 MiB segun variante | Stockfish | GPL-3.0 |
| Redes de Lc0 | Red convolucional / transformer (MCTS, no NNUE) | 20-100+ MiB | Leela Chess Zero | Multiple (apache-2.0 y otras) |

Notas: la comparación de fuerza entre 8Chess y Stockfish 19 publicada por el equipo (+129 Elo a favor de 8Chess con su red campeona) procede únicamente del propio equipo y no ha sido verificada de forma independiente. No hay disponibles datos de comparación directa con las redes de Lc0.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no sirve para generación de texto, código ni ninguna tarea de PLN; su única función es evaluar posiciones de la variante de ajedrez 8Chess dentro del motor correspondiente.
- Los resultados de rendimiento (67,75% frente a Stockfish 19, +129 Elo) proceden exclusivamente del equipo desarrollador; no existen verificaciones independientes publicadas en la información disponible.
- No se ha documentado el proceso de entrenamiento (dataset, número de posiciones, régimen de destilación), lo que dificulta reproducir los resultados.
- La licencia AGPL-3.0 es de copyleft fuerte: cualquier obra derivada que incorpore estas redes o el motor debe distribuirse bajo la misma licencia, con el código fuente disponible, incluido en escenarios de servicio en red. Esto puede ser restrictivo para integraciones comerciales cerradas.
- Las redes están específicamente entrenadas para la variante 8Chess; no son directamente intercambiables con redes de ajedrez estándar ni de otras variantes.
- El repositorio muestra cero descargas y un solo "like" en el momento de la extracción de datos, indicador de un proyecto muy reciente y con comunidad reducida; el soporte y la madurez pueden ser limitados.
- No hay información sobre sesgos o riesgo de alucinación aplicables, conceptos que no corresponden a este tipo de modelo.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/EightChess-Team/eightchess-networks
- Repositorio del motor 8Chess en GitHub: https://github.com/EightChess-Team/8chess

No se han encontrado enlaces adicionales a papers, blogs o demos en la información disponible.
