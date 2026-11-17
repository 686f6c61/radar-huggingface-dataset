# jrubiosainz/microduck-tug-cup3-a74f-s3s4-1a8b642a

## Resumen

Microduck Tug of War cup3-a74f-s3s4-1a8b642a es una política de control para robótica formulada como una tabla de búsqueda (lookup table) de observación-acción, publicada por el usuario jrubiosainz en Hugging Face bajo la librería `microduck` y el pipeline `robotics`. No es un modelo de lenguaje ni una red neuronal entrenada: es un artefacto derivado de una política base (`jrubiosainz/microduck-tug-cup3-a74f-s3-f342730b`) al que se le ha sustituido un bloque de 70 filas correspondiente a la semilla 4, tomadas de una trayectoria de replay obtenida mediante búsqueda nativa. El resultado se serializa como una tabla externa de 347 filas y se exporta a ONNX.

El modelo resuelve una tarea muy concreta dentro de la competición Microduck Arena (Pollen Robotics): el juego del tira y afloja (tug of war) con la copa 3, con un comando canónico de velocidad `vx: -0.3`. La relevancia de esta publicación es acotada: se trata de un candidato de competición con evaluación in-sample sobre cinco semillas fijas, sin entrenamiento de red y sin garantías de generalización fuera de muestra. La model card es explícita al indicar que es solo para simulación.

El tamaño del repositorio es de 0.0 GB y el artefacto de política declarado ocupa 1.003.410 bytes (SHA256 `1a8b642a…9412`). No se dispone de información sobre arquitectura neuronal, número de parámetros, contexto o idiomas, porque el objeto publicado no es un modelo generativo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política tabular de búsqueda observación-acción (lookup table) exportada a ONNX; sin entrenamiento de red |
| Parámetros totales | no disponible (no es una red neuronal; tabla de 347 filas externas) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política reactiva por paso) |
| Tipos de cuantización | no disponible (el artefacto es ONNX; la model card no documenta cuantización) |
| Idiomas soportados | no disponible (no aplica; salida de acciones de control) |
| Licencia | no disponible; la model card declara que no se afirma ninguna licencia nueva ni global, y que Apache-2.0 se aplica solo a componentes que ya la llevaban |
| Formato de pesos | ONNX (política inmutable), con tabla externa de 347 filas y metadatos asociados |
| Modelo base | `jrubiosainz/microduck-tug-cup3-a74f-s3-f342730b` (revisión `9e73632d157a18027a25ea8acc3904c7b0cc61bf`) |
| SHA256 de la política | `1a8b642a4ff64b304166e65cc2d049b4ba2e168da12b98742ca4a4e4bd169412` |
| Tamaño del artefacto | 1.003.410 bytes |
| Comando canónico | `vx: -0.3` |
| Uso previsto | simulación únicamente |

## Arquitectura y entrenamiento

La política no emplea un transformer, MoE ni SSM. Se compone de una tabla externa de 347 filas que mapea pares de observación y acción, serializada en orden de semilla `1,2,3,5,4` con rangos globales semiabiertos `[0,66)`, `[66,136)`, `[136,208)`, `[208,277)` y `[277,347)`. El grafo ONNX, el fallback L1, la búsqueda interna (inner lookup) y los metadatos se conservan del artefacto base f342. Las semillas 1, 2, 3 y 5 mantienen sus pares observación-acción por identidad respecto a f342; el único contenido nuevo es el bloque de 70 filas de la semilla 4, procedente del replay `s4r02` de la búsqueda nativa `patha-tug-cpu4-20261117T1014Z-4fca`, cuyo origen es el bloque de semilla 4 grabado en x86 de la política `a34628cbc8a18e0c4a9b24afce3ce4e29f13be9c1aa4b82f43c51fd230fe32e8`.

Según el diff de I+D aportado (`rd-exact-diff.json`), de esas 70 filas solo 8 pares observación-acción difieren realmente de f342; los otros 62 son compartidos. No hubo entrenamiento de red. La ascendencia de fallback retenida es lg21-5400 de lphatnguyen vía cup2l1/P1/a74f, y la model card indica explícitamente que no se añadieron componentes de política o tabla de Hlib (`cup_bias`/`search2`) ni pesos de red de GinDuck. La evaluación del candidato combinado A se realizó reconstruyendo la política completa y calificándola en un invitado QEMU x86_64, byte a byte idéntica al ensamblado offline.

## Capacidades

- Control reactivo de un robot Microduck en la tarea de tira y afloja (tug of war) de la copa 3 dentro de Microduck Arena, en modo simulación.
- Ejecución de una política determinista basada en búsqueda tabular: para cada observación, devuelve la acción correspondiente si hay coincidencia en la tabla externa.
- Fallback L1 documentado cuando no hay coincidencia en la tabla externa (aunque en la evaluación de cinco semillas el fallback fue cero).
- Integración como artefacto ONNX con metadatos heredados del modelo base.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión ni audio.
- No tiene capacidades multilingües: no procesa ni genera lenguaje.
- No dispone de modo thinking ni de ninguna capacidad cognitiva declarada.

## Casos de uso

- Evaluación de candidatos en Microduck Arena: el artefacto se carga en el entorno de simulación de la Arena para medir centímetros de terreno ganado en la tarea de tira y afloja, comparando el resultado con la política base f342.
- Reproducibilidad de experimentos de búsqueda nativa: dado que se documentan SHA256 de política, recibos de invitado y ventanas temporales de ejecución, sirve para replicar la calificación exacta del candidato A en un invitado QEMU x86_64.
- Auditoría de linaje de políticas: los ficheros `table-provenance.json` y `rd-exact-diff.json` permiten verificar qué filas proceden de qué fuente y cuántos pares difieren realmente del artefacto base.
- Investigación sobre políticas tabulares frente a redes: al no haber entrenamiento de red, es un punto de comparación controlado para estudiar el efecto de sustituir un bloque de 70 filas en una tabla de búsqueda.
- Docencia y divulgación sobre competiciones de robótica: ilustra el flujo completo de composición, ensamblado offline, verificación byte a byte y calificación en invitado virtualizado.
- Pruebas de infraestructura de evaluación: los recibos (`x86-verdict.json`, `x86-replay-receipt.json`) y el cribado de colisiones (`collision-screen.json`) permiten validar pipelines de verificación y trazabilidad de artefactos.
- Referencia para políticas de seguridad en robótica: la advertencia explícita de no cargar la política en un robot físico constituye un ejemplo documentado de separación entre simulación y despliegue real.

## Benchmarks y rendimiento

La model card aporta una evaluación del candidato combinado A sobre cinco semillas fijas (in-sample), con todas las ejecuciones en estado `pit_won`, 347/347 pasos con coincidencia en la tabla externa, y conteos de fallback, malas coincidencias y valores no finitos iguales a cero.

| Semilla | Terreno ganado (cm) |
|---|---:|
| 1 | 169.02586817741394 |
| 2 | 169.06843781471252 |
| 3 | 168.46919655799866 |
| 4 | 169.4170594215393 |
| 5 | 168.5335636138916 |
| Media | 168.9028251171112 |

La model card advierte que estas semillas son fijas e in-sample y no constituyen una afirmación de comparación cabeza a cabeza (H2H) fuera de semilla. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es coherente con la naturaleza no generativa del artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el artefacto es una política ONNX de 1.003.410 bytes más una tabla de 347 filas, por lo que la huella de memoria es mínima y no se mide en VRAM de GPU.
- GPU recomendadas: no aplica; la evaluación documentada se ejecutó en un invitado QEMU x86_64 sobre CPU.
- Compatibilidad con GPU de consumo: no disponible; no se documenta ejecución en GPU.
- Opciones de despliegue: runtime ONNX dentro del entorno Microduck Arena; la model card no menciona vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este artefacto.
- Latencia y throughput: la ventana del recibo del invitado fue de 2026-11-17 12:36:04Z a 12:36:39Z (35 segundos para la calificación de cinco semillas), y el wrapper completo, incluyendo arranque y apagado del invitado, de 12:34:25Z a 12:36:46Z. No se publican cifras de latencia por paso ni de throughput.
- Requisito de seguridad: solo simulación; la model card prohíbe explícitamente cargar la política en un robot físico.

## Comparativa con modelos similares

| Artefacto | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| microduck-tug-cup3-a74f-s3s4-1a8b642a (este) | Política tabular ONNX | no disponible (tabla de 347 filas) | no aplica | Media de 168,9028 cm en 5 semillas in-sample | no disponible (sin licencia nueva ni global) | Público en Hugging Face |
| microduck-tug-cup3-a74f-s3-f342730b (base) | Política tabular ONNX | no disponible | no aplica | No documentado en la información disponible | no disponible | Público en Hugging Face |
| Política fuente a34628cb (semilla 4 nativa) | Política tabular nativa | no disponible | no aplica | No documentado como evaluación del combinado A | no disponible | Referenciada en la model card |
| lg21-5400 de lphatnguyen (ascendencia de fallback) | Red y lookup heredados | no disponible | no aplica | No documentado en la información disponible | no disponible | Referenciada en la model card |

No se dispone de datos suficientes para comparar rendimiento con alternativas de la misma categoría; la model card solo aporta la evaluación del combinado A y evidencia de linaje de las políticas fuente.

## Limitaciones y advertencias

- Solo simulación: la model card indica explícitamente que no debe cargarse la política en un robot físico.
- Evaluación in-sample: las cinco semillas son fijas y no constituyen una afirmación de comparación H2H fuera de semilla ni una garantía de no regresión ante entradas de copa no vistas.
- Cobertura global desconocida: el cribado de colisiones (`collision-screen.json`) registra cobertura global como UNKNOWN/INCOMPLETE, y la ausencia de colisiones observadas no predice la decisión `copy_of` de la Arena.
- Cambio real limitado: de las 70 filas de la semilla 4, solo 8 pares observación-acción difieren de f342; los otros 62 son compartidos, y las semillas 1, 2, 3 y 5 son idénticas por identidad.
- Reordenación sin contenido nuevo: el paso del orden `1,2,4,5,3` al orden `1,2,3,5,4` no aporta contenido de trayectoria nuevo.
- Licencia: no se afirma ninguna licencia nueva ni global; Apache-2.0 se aplica solo a componentes que ya la llevaban. hc7 no declaró licencia ni NOTICE en la revisión fijada, por lo que esas partes se acreditan pero no se relicencian.
- Obligaciones de aviso en fichero: los avisos externos no prueban el cumplimiento de ninguna obligación de aviso dentro del propio fichero ONNX, que hereda sus metadatos.
- Riesgo de derechos: si un titular de derechos objeta, la model card indica detenerse y escalar al coordinador.
- Proceso de publicación: la publicación requiere un GO exacto de un solo uso por SHA de COORD, y el reenvío idéntico o los cambios cosméticos de repositorio o nombre no cuentan como rollback.
- Sin datos de sesgo, alucinación o idioma: no aplica ni se documenta, al no ser un modelo de lenguaje.
- Sin garantía de equivalencia: la revisión de I+D y la sombra de trayectoria guardada describen observaciones finitas, no una garantía de equivalencia ni de ausencia de regresión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jrubiosainz/microduck-tug-cup3-a74f-s3s4-1a8b642a
- Modelo base: https://huggingface.co/jrubiosainz/microduck-tug-cup3-a74f-s3-f342730b
- Revisión del modelo base citada: https://huggingface.co/jrubiosainz/microduck-tug-cup3-a74f-s3-f342730b/tree/9e73632d157a18027a25ea8acc3904c7b0cc61bf
- Paper: no disponible
- Blog: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
- Microduck Arena (Pollen Robotics): no disponible en la información proporcionada
