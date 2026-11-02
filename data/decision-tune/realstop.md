# decision-tune/realstop

## Resumen

RealStop es un modelo juez local desarrollado por decision-tune como componente del hook Stop de código abierto para Claude Code. Se trata de un clasificador binario construido sobre DecisionTune 1.0 (arquitectura ModernBERT, 394,8 millones de parámetros) al que se le ha aplicado un LoRA en las capas de atención y una cabeza lineal de una unidad. Su función es responder una única pregunta de sí/no: ¿debería el agente haber seguido trabajando en lugar de devolver el turno al usuario? El modelo no genera texto; emite una puntuación por cada parada del agente.

El problema que aborda es el de los llamados "hand-backs" o abandonos prematuros: turnos en los que un agente de código finaliza su tarea devolviendo trabajo que podría haber completado por sí mismo. RealStop intercepta esos turnos, consulta al juez y, si la respuesta es afirmativa, devuelve al agente a trabajar manteniendo las salvaguardas de aprobación para acciones sensibles (despliegues, envíos, gastos o borrados). El modelo se ejecuta en local, de modo que ningún texto del prompt ni de la respuesta se envía a un juez externo.

La relevancia actual radica en su enfoque de privacidad y coste: frente a la alternativa en la nube que ofrece el propio proyecto (modelo `jev`, de pago por uso y con envío de datos sin redactar), este juez corre en el equipo del desarrollador sin cuota de API. En la partición de test de 864 filas alcanza un 67,5 % de recall con un 15,8 % de intervenciones falsas en su ajuste por defecto (moderado), frente al 56,7 % de recall y 14,6 % de falsos positivos de las reglas basadas en frases.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder) con LoRA en capas de atención y cabeza lineal de una unidad |
| Parámetros totales | 394.781.696 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | decision-tune/decisiontune-1.0 |
| Tamaño del adaptador (LoRA + cabeza) | 10,5 MB |
| Tamaño del export fusionado | ~1,5 GB (repo de 1,6 GB) |
| Entrada | `request: ` + primeros 600 caracteres de la petición + `reply ending: ` + últimos 1.500 caracteres de la respuesta + recuento de llamadas a herramientas + indicador de trabajo en segundo plano |
| Salida | puntuación única de sí/no por parada (sin cabeza generativa) |

## Arquitectura y entrenamiento

El modelo parte de DecisionTune 1.0, un encoder ModernBERT de 394,8 millones de parámetros, sobre el que se aplica un LoRA en las capas de atención y una cabeza de clasificación de una sola unidad. El resultado es un clasificador binario puro: no dispone de cabeza generativa y no puede emitir texto, solo una probabilidad calibrada que el hook corrige según la mezcla real de clases y compara con el umbral del nivel de fuerza elegido (light, moderate o hard). Los umbrales vienen incluidos con el modelo y no son intercambiables con los de otros modelos.

Los datos de entrenamiento provienen de 3.640 finales de turno extraídos de 133 sesiones reales de un único desarrollador (127 de Claude Code y 6 de Codex CLI), con el texto redactado antes del etiquetado y del entrenamiento. El 34,4 % (1.253 de 3.640) se etiquetaron como hand-backs. Las etiquetas las generaron modelos Claude; en una comprobación ciega de 30 elementos por parte del desarrollador, las etiquetas coincidieron en el 78 % (21 de 27) de los casos decidibles, con un kappa de 0,55. Bajo las reglas de ese desarrollador, ofrecer más trabajo tras una respuesta terminada cuenta como hand-back, salvo que el paso ofrecido requiera aprobación del propietario. Los splits son: entrenamiento 1.805, dev 277, select 694 y test 864, con sesiones de test separadas del resto (dev y select comparten sesiones con entrenamiento en 274 de 277 y 685 de 694 filas respectivamente). Los datos de entrenamiento no se han publicado.

## Capacidades

- Clasificación binaria de finales de turno de agentes de código: decide si el agente debería haber continuado trabajando.
- Detección de hand-backs o abandonos prematuros en flujos de Claude Code y Codex CLI.
- Integración con el hook Stop de RealStop mediante umbrales calibrados por nivel de fuerza (light, moderate, hard).
- Ejecución completamente local: no envía texto de prompt ni de respuesta a servicios externos.
- Respuesta de baja latencia: mediana de 27 ms (p95 de 33 ms) en Apple M5 Pro una vez caliente.
- No soporta generación de texto, tool calling, razonamiento multi-paso, visión ni audio; es exclusivamente un juez de una pregunta.
- Soporte multilingüe limitado al inglés.

## Casos de uso

- Supervisión de agentes de código en local: el hook consulta al modelo en cada parada del agente y, si detecta un hand-back, lo devuelve al trabajo; al ejecutarse en el equipo del desarrollador, no se filtra código propietario a terceros.
- Sustitución de reglas basadas en frases en pipelines de Claude Code: con el ajuste moderado mejora el recall de las reglas en 10,7 puntos (67,5 % frente a 56,7 %) sin un aumento detectable de intervenciones falsas, lo que lo hace adecuado para equipos que ya usan heurísticas léxicas.
- Flujos con requisitos de privacidad estrictos: al no enviar prompts ni respuestas a un juez en la nube, encaja en entornos con datos sensibles donde la alternativa `jev` (de pago y con envío sin redactar) no es aceptable.
- Despliegue en estaciones de trabajo de desarrollador: el runtime `decision-tune[mlx]` ocupa aproximadamente 1 GB y el hook completo tarda una mediana de 186 ms por parada (136 ms cuando la respuesta tiene menos de 400 caracteres y se omite el modelo), por lo que es viable en portátiles Apple Silicon.
- Ajuste de agresividad por proyecto: los niveles light, moderate y hard permiten elegir entre menos interrupciones (9,7 % de falsos positivos a costa de 53,6 % de recall) o más bloqueos (75,4 % de recall con 22,8 % de falsos positivos) según la tolerancia del equipo.
- Investigación sobre comportamiento de agentes: el modelo y su conjunto de evaluación permiten reproducir experimentos sobre abandono prematuro en sesiones reales de asistentes de código, aunque los datos de entrenamiento no estén disponibles.

## Benchmarks y rendimiento

Resultados en la partición de test (864 filas: 289 hand-backs y 575 paradas correctas, de 21 sesiones), evaluados mediante réplicas offline de finales de turno reales con el mismo hook:

| Juez | Recall | Intervenciones falsas | Sale del equipo |
|---|---:|---:|---|
| Este modelo, light | 53,6 % (155/289) | 9,7 % (56/575) | no |
| Este modelo, moderate (por defecto) | 67,5 % (195/289) | 15,8 % (91/575) | no |
| Este modelo, hard | 75,4 % (218/289) | 22,8 % (131/575) | no |
| Reglas basadas en frases | 56,7 % (164/289) | 14,6 % (84/575) | no |

Frente a las reglas de frases en las mismas filas, el ajuste moderado captura más hand-backs: +10,7 puntos (intervalo del 95 % de +4,4 a +14,9). Las intervenciones falsas quedan en +1,2 puntos (intervalo de -3,3 a +5,4), sin diferencia detectable. Los intervalos se obtienen remuestreando sesiones completas.

En el conjunto sintético público de RealStopBench el modelo es débil: acertó ambos miembros de un par (un hand-back y su gemelo de parada correcta) en el 16 % de los pares (37 de 229), con un 31,4 % de recall y un 15,3 % de intervenciones falsas. Las reglas de frases obtienen un resultado similar (32,3 % de recall con 16,2 % de falsos positivos), por lo que el modelo no las supera en ese conjunto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el export fusionado ocupa ~1,5 GB en safetensors y el runtime `decision-tune[mlx]` requiere aproximadamente 1 GB.
- GPU recomendadas: no se especifican modelos de GPU; las mediciones publicadas corresponden a una Apple M5 Pro con macOS 27.2.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el tamaño del modelo (394,8 millones de parámetros) sugiere que cabría en GPU de consumo, pero no hay datos publicados al respecto.
- Opciones de despliegue: runtime propio `decision-tune[mlx]` (backend MLX) e instalación mediante el `install.sh` de RealStop, que descarga el pack y verifica el sha256 de cada archivo contra los hashes fijados en el repositorio de RealStop (véase MODEL.md). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: mediana de 27 ms (p95 de 33 ms) por respuesta del modelo una vez caliente; el hook completo tarda una mediana de 186 ms por parada, que baja a 136 ms cuando la respuesta tiene menos de 400 caracteres y se omite el modelo.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Despliegue | Rendimiento |
|---|---|---|---|---|---|---|
| RealStop (este modelo) | Clasificador binario sobre ModernBERT | 394,8 M | no disponible | Apache 2.0 | local (MLX) | 67,5 % recall / 15,8 % falsos positivos (moderate) |
| Reglas de frases de RealStop | Heurística léxica | no aplica | no aplica | incluida en RealStop | local | 56,7 % recall / 14,6 % falsos positivos |
| Juez en la nube `jev` de RealStop | Modelo de decisión remoto | no disponible | no disponible | no disponible | nube, de pago por uso | sin afirmación de calidad por parte del autor |

No se dispone de información sobre otros modelos comparables de clasificación de finales de turno de agentes de código.

## Limitaciones y advertencias

- El modelo solo responde una pregunta de sí/no y no puede generar texto ni realizar otras tareas.
- Entrenado con datos de un único desarrollador (133 sesiones), lo que limita la generalización a otros estilos de trabajo y flujos.
- Las etiquetas las generaron modelos Claude y la validación humana fue limitada (kappa de 0,55 en 27 elementos decidibles), por lo que existe ruido en las etiquetas.
- Rendimiento débil en el conjunto sintético público de RealStopBench: 16 % de pares acertados y 31,4 % de recall, sin superar a las reglas de frases.
- Los umbrales incluidos son específicos de este modelo; usar umbrales de otro modelo produce resultados gravemente incorrectos.
- Soporte exclusivo del inglés.
- Riesgo de intervenciones falsas: incluso en el ajuste light se bloquea el 9,7 % de paradas correctas; en hard asciende al 22,8 %.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo base y los datos de entrenamiento no se publican, lo que dificulta la reproducibilidad.
- El hook forma parte de una vista previa de investigación y no se ofrece ninguna garantía de calidad sobre el juez en la nube alternativo.
- En modo local no se envían prompts ni respuestas a un juez externo, pero Claude Code sigue comunicándose con su proveedor habitual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/decision-tune/realstop
- Modelo base: https://huggingface.co/decision-tune/decisiontune-1.0
- Repositorio de RealStop: https://github.com/decision-tune/realstop
