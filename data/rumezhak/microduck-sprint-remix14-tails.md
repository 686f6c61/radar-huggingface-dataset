# rumezhak/microduck-sprint-remix14-tails

## Resumen

microduck-sprint-remix14-tails es un artefacto de control para el simulador de robótica Microduck Arena, desarrollado por el usuario de HuggingFace rumezhak. No es un modelo de lenguaje: se trata de un grafo ONNX que implementa una política de control por tablas de búsqueda (lookup tables) para la prueba de sprint de 2 metros del entorno Microduck. Deriva por fine-tuning de jrubiosainz/microduck-game-sprinter-remix14, que a su vez extiende el trabajo de nikghodki, HlibPlakhtii y a1rb4Ck.

El modelo resuelve un problema muy concreto: optimizar los últimos pasos de control de cada una de las cinco semillas oficiales del sprint, de modo que el cruce de meta ocurra ligeramente antes dentro del mismo tick de 5 ms. El autor es explícito en que el tiempo final no mejora (0.817 s, idéntico a remix14) y que, bajo la regla de desempate de la Arena, este fichero queda por detrás del original. Es, por tanto, un ejercicio de ajuste fino in-sample con valor técnico limitado fuera del simulador.

La relevancia es acotada: sirve como ejemplo de modificación de políticas basadas en lookup tables con licencia Apache-2.0, y documenta con rigor las limitaciones de reproducibilidad (dependencia del redondeo en coma flotante) y la prohibición de uso en un robot físico. El repositorio ocupa 0.0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafo ONNX con política de control basada en lookup tables (L_obs, L_act, L_mask, L_tol) más una red neuronal subyacente |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |
| Libreria | microduck |
| Pipeline | robotics |
| Modelo base | jrubiosainz/microduck-game-sprinter-remix14 |
| Relacion con el base | finetune |
| Tamano del repo | 0.0 GB |
| Filas de lookup tables | 331 filas en L_obs y L_act |

## Arquitectura y entrenamiento

El artefacto es un grafo ONNX que combina una red neuronal con varias capas de lookup tables. La tabla principal contiene 331 filas, distribuidas en L_obs (observaciones) y L_act (acciones). Sobre ella operan otras capas auxiliares: search_, T_r2_s4_ y jr_s5_, además de L_mask y L_tol. En esta modificación concreta, las tres capas auxiliares se desactivan fijando sus tolerancias a -1, aunque sus filas permanecen en el fichero; el resto de tensores, operadores y la red no se tocan.

El "entrenamiento" consiste en una búsqueda con CMA-ES separable sobre los últimos 11 a 23 pasos de control de la secuencia grabada de cada semilla. La búsqueda se ejecuta sobre una réplica del runner de la Arena que reproduce únicamente el final de una carrera, validada contra el scorer oficial. Con las cinco secuencias resultantes se reconstruye la tabla principal. No hay datos de preentrenamiento en tokens ni RLHF: el proceso es una optimización numérica in-sample sobre cinco trayectorias concretas.

## Capacidades

- Control de una política de sprint de 2 metros en el simulador Microduck Arena, exclusivamente en simulación.
- Replay determinista de las cinco semillas oficiales, con cruce de meta ligeramente anterior dentro del mismo tick de 5 ms.
- Ejecución como grafo ONNX mediante onnxruntime.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No incorpora visión, audio ni modo de pensamiento.

## Casos de uso

- Replicación de experimentos de la Arena: cargar el grafo con onnxruntime y el runner oficial para reproducir los tiempos de las cinco semillas en x86-64 Linux, verificando la coherencia con el scorer de la Arena.
- Estudio de optimización in-sample: analizar cómo una búsqueda CMA-ES sobre los últimos pasos de control reduce el instante de cruce sin alterar el tick, como caso didáctico de sobreajuste a semillas concretas.
- Auditoría de modificaciones Apache-2.0: revisar el NOTICE y el campo modification_notice como ejemplo de cumplimiento de la sección 4(b) de la licencia al derivar un artefacto de terceros.
- Base para experimentos de lookup tables: partir de este fichero para probar nuevas tolerancias o reconstrucciones de L_obs y L_act en un entorno controlado.
- Docencia sobre reproducibilidad numérica: ilustrar cómo el redondeo en coma flotante de otra máquina puede romper un replay y devolver la semilla a la red subyacente.
- Comparación de políticas de control en simulación: contrastar tiempos y pasos de cruce frente a remix14 y sprint-lookup-v1 dentro del runner de la Arena.

## Benchmarks y rendimiento

| Semilla | Tiempo remix14 (s) | Tiempo este fichero (s) | Cruce remix14 (pasos) | Cruce este fichero (pasos) |
|---|---|---|---|---|
| 1 | 0.815 | 0.815 | 40.751 | 40.679 |
| 2 | 0.815 | 0.815 | 40.755 | 40.604 |
| 3 | 0.825 | 0.825 | 41.258 | 41.208 |
| 4 | 0.815 | 0.815 | 40.760 | 40.640 |
| 5 | 0.815 | 0.815 | 40.755 | 40.712 |

Resultado agregado: 0.817 s en las cinco semillas oficiales, con 5/5 carreras finalizadas. Idéntico a remix14; bajo la regla de desempate de la Arena queda por detrás. Mediciones realizadas en x86-64 con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0.0 GB y el grafo es de tamaño reducido, por lo que la inferencia es viable en CPU.
- GPU recomendadas: no disponible; no se requiere GPU para ejecutar el grafo.
- Cabe en cualquier equipo de consumo: el autor valida en x86-64 Linux con onnxruntime, sin mención a GPU.
- Opciones de despliegue: onnxruntime (versión validada 1.24.4) junto con MuJoCo 3.10.0 y numpy 2.4.1, integrados en el runner de la Microduck Arena.
- Latencia y throughput: no disponibles; el autor solo reporta tiempos de carrera en simulación (0.817 s por sprint).

## Comparativa con modelos similares

| Modelo | Tiempo en 5 semillas (s) | Semillas finalizadas | Licencia | Relacion |
|---|---|---|---|---|
| rumezhak/microduck-sprint-remix14-tails | 0.817 | 5/5 | Apache-2.0 | Este fichero |
| jrubiosainz/microduck-game-sprinter-remix14 | 0.817 | 5/5 | Apache-2.0 | Modelo base |
| nikghodki/microduck-sprint-lookup-v1 | no disponible | no disponible | Apache-2.0 | Ancestro de remix14 |
| HlibPlakhtii/quicksilver-v2 | no disponible | no disponible | Apache-2.0 | Ancestro de la línea lookup |

## Limitaciones y advertencias

- Los resultados son in-sample: las lookup tables solo reproducen las carreras de las cinco semillas oficiales.
- El replay exige coincidencia bit a bit de la observación; el redondeo en coma flotante de otra máquina puede romperlo y devolver la semilla a la red, degradando el resultado.
- Validado únicamente en x86-64 Linux con MuJoCo 3.10.0, onnxruntime 1.24.4 y numpy 2.4.1.
- No es un caminante mejor ni más rápido: el tiempo es idéntico a remix14 y pierde el desempate en la Arena.
- No debe cargarse en un MicroDuck físico: las acciones tardías quedan muy fuera de lo que un servo real admitiría.
- Sesgos conocidos: sobreajuste a las cinco semillas oficiales; no hay evaluación fuera de muestra.
- Riesgo de alucinación: no aplica (no es un modelo generativo de texto).
- Licencia Apache-2.0, que permite uso comercial del artefacto, aunque su utilidad práctica fuera del simulador es nula.
- El autor advierte que una IA asistió en la búsqueda y en la redacción de la model card.

## Enlaces

- HuggingFace: https://huggingface.co/rumezhak/microduck-sprint-remix14-tails
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix14
- Ancestro sprint-lookup-v1: https://huggingface.co/nikghodki/microduck-sprint-lookup-v1
- Microduck Arena: https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Organización Pollen Robotics: https://huggingface.co/pollen-robotics
- Perfil de jrubiosainz: https://huggingface.co/jrubiosainz
- Perfil de nikghodki: https://huggingface.co/nikghodki
- Perfil de HlibPlakhtii: https://huggingface.co/HlibPlakhtii
- Perfil de a1rb4Ck: https://huggingface.co/a1rb4Ck
- Perfil de rumezhak: https://huggingface.co/rumezhak
