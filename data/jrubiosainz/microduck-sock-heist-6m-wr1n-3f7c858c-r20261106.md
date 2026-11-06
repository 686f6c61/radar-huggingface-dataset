# jrubiosainz/microduck-sock-heist-6m-wr1n-3f7c858c-r20261106

## Resumen

Microduck Sock Heist 6M WR1N 3f7c858c es una política de control para robótica simulada, derivada por fusión (merge) del modelo `rumezhak/microduck-sock-heist-composite-v5`. No es un modelo de lenguaje ni un transformer generativo: es un artefacto de inferencia exportado a ONNX que resuelve una tarea concreta de manipulación dentro del entorno Microduck Arena, un simulador de robótica asociado a Pollen Robotics. El autor, jrubiosainz, lo publica como entrada de competición optimizada sobre los cinco semillas oficiales del banco de pruebas.

El modelo no entrena una política desde cero. El autor declara explícitamente que parte de secuencias de acción recuperadas del modelo base y que las semillas modificadas se reoptimizan con búsquedas separables CMA-ES de cola, con arranque en caliente sobre la semilla 5. El resultado es un grafo ONNX de aproximadamente 1,21 MB que incorpora una red de respaldo, una máscara de observación y una tabla de búsqueda (lookup) de acciones, todo ello ejecutado por el runner nativo de microduck-arena 0.7.0.

Su relevancia es acotada y muy específica: sirve como referencia de cómo se construyen y se publican políticas de competición en Microduck Arena, con trazabilidad de hashes SHA256, linaje de autoría y métricas de replay nativo. El propio autor advierte que es una entrada solo para simulación, optimizada in-sample sobre las cinco semillas oficiales, y que no debe usarse en un robot físico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Grafo ONNX con tabla de búsqueda de acciones, red de respaldo (fallback network) y máscara de observación; no es un transformer |
| Parámetros totales | no disponible (el autor no publica recuento de parámetros; el artefacto `policy.onnx` pesa 1.211.568 bytes) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (exportación ONNX directa, sin cuantización declarada) |
| Idiomas soportados | no disponible (tarea robótica, sin procesamiento de lenguaje) |
| Licencia | no disponible como licencia global; `LICENSE-apache-2.0.txt` se aplica solo a porciones que ya portaban Apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`) |
| Pipeline | robotics |
| Librería | microduck |
| Modelo base | `rumezhak/microduck-sock-heist-composite-v5` (relación: merge) |
| Revisión base | `3d6763f07e4d5941e07121b8b48119e9bda60977` |
| SHA256 política origen | `3f7c858c31fd171c75cc0425230f23d35ea1181ba1b5dad4a4de7a610222155b` |
| SHA256 copia publicada | `5c6069273ede99b9244f7efe0442b5904723c149e84e915c127758b80615f584` |
| Tamaño del repo | 0,0 GB |

## Arquitectura y entrenamiento

La política no es una red neuronal entrenada de extremo a extremo en el sentido habitual. El artefacto combina un grafo de búsqueda de observaciones (observation-lookup graph), una red de respaldo y una máscara, y produce acciones discretas sobre el simulador. La optimización se realiza mediante búsquedas CMA-ES separables por cola sobre semillas concretas, no mediante descenso de gradiente sobre un corpus de datos. El autor indica que las semillas modificadas se reoptimizaron con búsquedas CMA-ES con semilla nueva e independiente, y que sus filas de lookup se regrabaron en el runner nativo x86 oficial.

El entrenamiento parte de material heredado: la semilla 5 arranca en caliente desde secuencias de acción completas recuperadas de K6H/PF2, verificadas con su ascendencia de búsqueda original y replicadas de forma nativa antes de la nueva búsqueda. El autor aclara que la operación de recuperación no equivale a la búsqueda del padre y que los prefijos en caliente pueden diferir de v5. Solo cambian las filas L_obs/L_act de las semillas modificadas y el aviso de modificación añadido; el grafo, la red de respaldo, la máscara, la tolerancia y el resto de semillas permanecen intactos. No se declara número de tokens, composición de dataset ni uso de RLHF o DPO, porque no aplica a este tipo de artefacto.

La copia publicada el 2026-11-06 es una reentrada solo de metadatos: añade exactamente una entrada `metadata_props` de ONNX (`jrubiosainz.daily_entry`) y deja el grafo, los pesos y el resto de metadatos sin cambios. El comportamiento es idéntico al de la política origen.

## Capacidades

- Control de política para la tarea Sock Heist dentro del simulador Microduck Arena, con finalización en las cinco semillas oficiales.
- Ejecución determinista sobre el runner nativo de microduck-arena 0.7.0 (runner version 5).
- Replay nativo verificado: el autor reporta cinco finalizaciones con tiempos entre 4,750 y 5,150 segundos.
- Compatibilidad con el barrido canónico (canonical sweep) sin anulación de velocidad; también concuerda con vx=0.2 fijo.
- Exportación ONNX con metadatos que preservan el aviso original completo más un apéndice.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, multilingüismo, visión ni audio.
- No es un modelo generativo: no produce texto ni código.

## Casos de uso

- Replay de referencia en Microduck Arena: sirve para reproducir localmente las cinco semillas oficiales con el runner 0.7.0 y comparar tiempos de finalización frente a v5, ya que el autor publica ticks por semilla.
- Auditoría de linaje de políticas: el modelo incluye hashes SHA256 de la política origen y de la copia, revisión del modelo base y un fichero `NOTICE` con el aviso heredado completo, lo que permite verificar procedencia en un pipeline de competición.
- Estudio de optimización CMA-ES aplicada a control: las búsquedas separables de cola sobre semillas concretas son un caso práctico para investigar cómo se reoptimizan políticas existentes sin reentrenar el grafo completo.
- Prueba de integración del runner nativo: útil para validar que una instalación de microduck-arena 0.7.0 con runner version 5 carga correctamente un `policy.onnx` de ~1,2 MB y ejecuta el barrido canónico.
- Docencia sobre artefactos ONNX en robótica: ejemplo compacto de cómo se empaquetan grafo, red de respaldo, máscara y tabla de lookup en un único fichero ONNX con metadatos.
- Verificación de reentradas metadata-only: la diferencia entre la política origen y esta copia (una sola entrada `metadata_props`) permite probar herramientas de diff de metadatos ONNX y de validación de hashes.
- No es adecuado para despliegue en robot físico, atención al cliente, generación de código ni ninguna tarea de lenguaje.

## Benchmarks y rendimiento

El autor publica mediciones de replay nativo local, no resultados de aceptación en vivo ni ranking. Se presentan junto a los ticks de v5 para comparación:

| Semilla | Tiempo de finalización (s) | Ticks | Ticks v5 |
|---|---:|---:|---:|
| 1 | 4,800 | 960 | 960 |
| 2 | 5,150 | 1030 | 1030 |
| 3 | 4,750 | 950 | 950 |
| 4 | 4,800 | 960 | 960 |
| 5 | 4,920 | 984 | 985 |

Media: 4,884 segundos; total: 4884 ticks. La única mejora frente a v5 es de un tick en la semilla 5. El autor indica que existe un resultado oficial de Arena para la política origen, run `01M6PQVXMZ7CB8SC99WC74` (4,884 s, 5/5 semillas), pero aclara que pertenece a la política origen y que no se reclama ninguna ejecución nueva para esta copia. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, y no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el artefacto `policy.onnx` ocupa 1.211.568 bytes, por lo que el requisito de memoria es mínimo y probablemente quede por debajo de 1 GB en cualquier configuración.
- GPU recomendadas: no disponible; el autor reporta ejecución en el runner nativo x86, sin especificar aceleración por GPU.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; por tamaño del artefacto cabría en cualquier GPU de consumo, pero no se documenta soporte.
- Opciones de despliegue: runner oficial de microduck-arena 0.7.0 (runner version 5) y carga de ONNX; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican.
- Latencia y throughput: el autor reporta tiempos de finalización por semilla de entre 4,750 y 5,150 segundos en el runner nativo x86, y ticks por semilla entre 950 y 1030. No se publica throughput por segundo ni latencia por paso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-sock-heist-6m-wr1n-3f7c858c (este) | no disponible (ONNX de 1,21 MB) | no aplica | Media 4,884 s; 4884 ticks (5 semillas) | no disponible como licencia global | HuggingFace, 0 descargas, 0 likes |
| rumezhak/microduck-sock-heist-composite-v5 (base) | no disponible | no aplica | Ticks v5: 960/1030/950/960/985 | no disponible | HuggingFace |
| microduck-sock-heist-composite-v1 a v4 | no disponible | no aplica | no disponible | no disponible | HuggingFace (linaje citado) |
| quicksilver-v2 (HlibPlakhtii) | no disponible | no aplica | no disponible | no disponible | Citado como linaje, no verificado en la información disponible |

La comparación se limita al linaje declarado por el autor. No se dispone de datos de rendimiento de v1 a v4 ni de quicksilver-v2 en la información proporcionada, y no se conocen alternativas fuera de la familia Microduck.

## Limitaciones y advertencias

- El autor advierte explícitamente: "Do not use on a physical robot". Es una entrada solo para simulación.
- Optimización in-sample sobre las cinco semillas oficiales: no hay afirmación de generalización a otras semillas, entornos o condiciones.
- No hay afirmación de seguridad en robot real ni de aceptación en vivo; las métricas son mediciones locales nativas, no un resultado de Arena ni un ranking.
- Licencia global no disponible: v5 no declara licencia para el modelo completo. `LICENSE-apache-2.0.txt` cubre solo porciones que ya portaban Apache-2.0, no los pesos upstream sin licencia ni este modelo en su conjunto. El uso comercial queda por tanto sin base legal clara.
- Riesgo de atribución: el modelo incorpora material de múltiples autores (rumezhak, HlibPlakhtii, jrubiosainz, lphatnguyen, a1rb4Ck, Pollen Robotics); el autor indica que una objeción de autor detiene la publicación y se escala.
- La copia publicada no mejora el comportamiento: es una reentrada metadata-only con una única entrada `metadata_props` añadida. El resultado oficial de Arena citado pertenece a la política origen, no a esta copia.
- Sin datos de sesgos, alucinación o limitaciones de idioma porque no es un modelo de lenguaje; estas categorías no aplican.
- Repositorio de 0,0 GB y 0 descargas: no hay evidencia de uso o validación por terceros en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jrubiosainz/microduck-sock-heist-6m-wr1n-3f7c858c
- Política origen (revisión fijada): https://huggingface.co/jrubiosainz/microduck-sock-heist-6m-wr1n-3f7c858c/resolve/93ca332c78d4d51eaa74c45d78701d0524e2250c/policy.onnx
- Modelo base: https://huggingface.co/rumezhak/microduck-sock-heist-composite-v5/tree/3d6763f07e4d5941e07121b8b48119e9bda60977
- Microduck Arena y runner oficial: no disponible como enlace en la información proporcionada (citado como Pollen Robotics)
