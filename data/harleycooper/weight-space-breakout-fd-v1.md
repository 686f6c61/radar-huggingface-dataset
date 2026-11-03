# HarleyCooper/weight-space-breakout-fd-v1

## Resumen

`HarleyCooper/weight-space-breakout-fd-v1` no es un modelo de lenguaje: es un controlador de juego para Breakout con 17.253 parámetros, entrenado mediante un protocolo de "programación en el espacio de pesos" (weight-space programming). El autor, HarleyCooper, parte de una política deliberadamente defectuosa con controles invertidos y la repara de forma iterativa usando un LLM editor (Qwen3.6-35B-A3B alojado en Prime Intellect) que propone asignaciones escalares de pesos, validadas después por un verificador que juega 512 partidas con semillas emparejadas. El resultado se publica como pesos versionados en safetensors y se sirve en CPU.

Su relevancia es metodológica más que de rendimiento: documenta un bucle de mejora acotado (tres rondas por defecto, hasta 64 asignaciones escalares por ronda) con criterios de aceptación estadísticos explícitos (ganancia media > 0,10 y `gain - 2 * paired_standard_error > 0`), auditoría de candidatos rechazados y verificación de hashes entre el verificador y el checkpoint publicado. La versión 0.3.0 añade un protocolo de reparación guiado por fallos (`failure-driven-v1`) con herramientas, simulaciones de práctica y hasta ocho turnos del editor por ronda.

El modelo es, por tanto, un artefacto de investigación reproducible sobre agentes que editan pesos sin acceso a gradientes, no una pieza para producción de NLP. Cabe en cualquier CPU y su interés está en el pipeline de orquestación, no en la política resultante.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Controlador de política para Breakout (no es un transformer ni un LLM); pesos serializados como tensores escalares |
| Parámetros totales | 17.253 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible (pesos en safetensors y NPZ; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | MIT |
| Formato de pesos | `model.safetensors`, `policy.npz`, `policy.json`, `initial_baseline.safetensors`, `manifest.json` |

## Arquitectura y entrenamiento

El objeto entrenado es una política de control para el entorno Breakout con 17.253 parámetros, serializada como tensores en safetensors y como arrays NumPy en `policy.npz`. No hay descenso de gradiente: el punto de partida es `initial_baseline.safetensors`, una política "conocida como mala" con controles invertidos, y la mejora se produce por edición discreta de pesos. En cada ronda, el editor `qwen/qwen3.6-35b-a3b` alojado en Prime recibe una instantánea de la política con su hash y propone hasta 64 asignaciones escalares; el verificador las valida y compara candidato e incumbente sobre 512 semillas frescas emparejadas.

El reparto de semillas está fijado y documentado: práctica en `40000 + 32*round` a `40031 + 32*round`, promoción en `60000 + 512*round` a `60511 + 512*round`, y auditoría final en `90000..91023` (1.024 partidas contra la política defectuosa original, no usada para promoción). Las rondas están limitadas a 20 en el entorno y la primera ejecución publicada se limita a tres rondas con 4.096 tokens de salida por llamada. El protocolo `failure-driven-v1` de la versión 0.3.0 añade diagnóstico de causa desconocida, herramientas de práctica, hasta ocho turnos del editor y una comprobación de replay controlado que exige capturar el fallo registrado concreto.

Una advertencia relevante del propio autor: el arnés por defecto de Prime anunciaba herramientas `bash` y `edit`, y el prompt de la tarea las prohibía (afirmando incorrectamente que no estaban disponibles). El controlador exige exactamente una llamada al modelo completada y cero llamadas reales a herramientas para aceptar una traza, de modo que el experimento demuestra ediciones sin uso de herramientas, no un arnés técnicamente libre de herramientas.

## Capacidades

- Control de un entorno Breakout mediante una política de 17.253 parámetros servida en CPU.
- Reparación iterativa de pesos guiada por un LLM editor externo (Qwen3.6-35B-A3B) con presupuesto acotado por ronda.
- Validación estadística de candidatos con semillas emparejadas y criterio de error estándar pareado.
- Publicación versionada e inmutable de pesos en Hugging Face con verificación de hashes (fingerprint, checksum, revisión resuelta antes de descargar).
- Auditoría completa de candidatos rechazados en `experiment/`, con informes del verificador y decisiones por ronda.
- Protocolo opcional `failure-driven-v1` con herramientas, simulaciones de práctica y replay controlado.
- No soporta tool calling en el sentido de LLM, ni agentes multi-turno propios, ni capacidades multilingües, de visión o de audio: el editor LLM es un componente externo del pipeline.

## Casos de uso

- Investigación sobre edición de pesos sin gradientes: el repositorio sirve como referencia reproducible de un bucle cerrado editor-verificador con presupuesto y criterios de aceptación explícitos, útil para estudiar hasta dónde llega la búsqueda adaptativa sobre espacios de parámetros pequeños.
- Docencia en aprendizaje por refuerzo aplicado: el entorno Breakout con política invertida y 17.253 parámetros permite ilustrar evaluación con semillas emparejadas, error estándar pareado y control de falsos positivos en un coste computacional mínimo.
- Diseño de pipelines de evaluación estadística: las reglas de promoción y la separación entre semillas de práctica, promoción y auditoría final son un patrón trasladable a la validación de checkpoints en proyectos mayores.
- Verificación de integridad de artefactos: el esquema de `manifest.json` con fingerprint, checksum y decisión por ronda ejemplifica cómo encadenar publicación y despliegue con comprobación de hashes antes de servir un modelo.
- Estudio de agentes con herramientas y diagnóstico de fallos: la configuración `failure-driven-v1` documenta un caso de agente que recibe feedback de práctica y debe superar un replay dirigido, útil para comparar protocolos de agentes acotados.
- Reproducción de experimentos de bajo coste: al ejecutarse la simulación en CPU de Hugging Face y no requerir GPU para el juego, permite replicar el bucle en entornos sin aceleradores (los costes de inferencia del LLM y de evaluación alojada en Prime corren aparte).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una tabla de rondas (incumbente, candidato, ganancia media, decisión) sin valores numéricos en la información proporcionada, y advierte que cada fila usa 512 semillas frescas emparejadas, por lo que las medias de filas distintas no son directamente comparables.

## Requisitos de hardware

- VRAM para inferencia: no aplica; la política son 17.253 parámetros en safetensors/NPZ y la simulación corre en CPU de Hugging Face.
- GPU recomendadas: ninguna para el juego ni para la política; el editor LLM (Qwen3.6-35B-A3B) se ejecuta en la infraestructura alojada de Prime, no en local.
- Cabe en cualquier GPU de consumo, pero no la necesita: el despliegue de referencia es CPU.
- Opciones de despliegue: Hugging Face Spaces para la simulación CPU, controlador propio para serialización y publicación de pesos, y el entorno alojado `harleycooper/weight-space-breakout` en Prime para práctica, verificación y auditoría.
- Latencia y throughput: no disponibles. La model card solo indica que la inferencia del LLM y la evaluación alojada pueden generar cargos en Prime.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| weight-space-breakout-fd-v1 | 17.253 | no aplica | Control de Breakout vía edición de pesos | MIT | Hugging Face (repo y Space) |
| Experimento one-shot previo del mismo autor | no disponible | no aplica | Control de Breakout vía edición de pesos en una sola pasada | no disponible en la información | Hugging Face, citado como experimento separado |
| Modelos de RL para Atari/Breakout (DQN, PPO) | del orden de 10^5–10^6 | no aplica | Control de Atari | variable | Referencia general de la literatura; no se dispone de comparación numérica en la información |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no responde a prompts y no debe evaluarse con benchmarks de NLP.
- La regla de promoción es un filtro de ingeniería, no una prueba de significación estadística general; la búsqueda adaptativa requiere replicación independiente según el propio autor.
- Los resultados pueden estancarse o todos los candidatos pueden fallar; una edición no aceptada no modifica la política en producción.
- El experimento publicado se limita a tres rondas y 4.096 tokens de salida por llamada, con un máximo de 20 rondas en el entorno.
- La evaluación final de 1.024 partidas contra la política defectuosa original no se usa para promoción y no debe interpretarse como validación del proceso de selección.
- Divulgación del arnés: el prompt afirmaba incorrectamente que las herramientas no estaban disponibles mientras el arnés las anunciaba; el resultado demuestra ediciones sin uso de herramientas, no un arnés libre de herramientas.
- El editor LLM y la evaluación alojada pueden generar costes en Prime; el repositorio no incluye esos pesos ni el modelo editor.
- Licencia MIT permite uso comercial, pero el artefacto es una política de juego de investigación sin garantías de robustez ni de generalización a variantes del entorno.
- Sin datos publicados de sesgos, alucinación o cobertura idiomática porque estas categorías no aplican al artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HarleyCooper/weight-space-breakout-fd-v1
- Simulación en vivo (Space): https://huggingface.co/spaces/HarleyCooper/weight-space-breakout-fd-v1-loop
- Código del pipeline: https://github.com/HarleyCoops/weight-space-breakout-pipeline
- Entorno en Prime Intellect: https://app.primeintellect.ai/dashboard/environments/harleycooper/weight-space-breakout
