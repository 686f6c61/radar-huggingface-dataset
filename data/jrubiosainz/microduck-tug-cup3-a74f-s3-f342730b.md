# jrubiosainz/microduck-tug-cup3-a74f-s3-f342730b

## Resumen

Microduck Tug of War cup3-a74f-s3-f342730b es una política de control para robótica simulada dentro del entorno Microduck Arena, publicada por el usuario jrubiosainz. Se trata de un artefacto derivado del modelo jrubiosainz/microduck-tug-cup2p2-s4-a74f9bd7, del que hereda la práctica totalidad de su estructura: red de respaldo L1, tabla de búsqueda interna y pesos sin reentrenamiento. La única contribución nueva es una trayectoria de replay asociada a la semilla 3, etiquetada como búsqueda nativa `s3r05` en el directorio `patha-tug-cpu4-20261117T1014Z-4fca`.

El modelo no es un modelo de lenguaje ni un transformer generativo: es una política de robótica empaquetada en formato ONNX para su ejecución en simulación, orientada a la tarea "tug of war" (tirar de una cuerda) del banco de pruebas Microduck. Su relevancia es acotada y de nicho: sirve como entrada de evaluación en la Arena de Microduck y como evidencia de un proceso de búsqueda compositiva sobre políticas heredadas, no como componente de producción general.

El repositorio es de tamaño 0.0 GB según Hugging Face, no declara parámetros, contexto, idiomas ni licencia propia, y la model card advierte explícitamente que es solo para simulación y no debe cargarse en un robot físico. La ficha siguiente documenta lo que el autor declara, marcando como "no disponible" todo aquello que no figura en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control para simulación (no disponible el detalle de la red; se menciona una red de respaldo "L1 fallback network" y una tabla de búsqueda interna) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor no declara licencia nueva ni global; Apache-2.0 solo aplica a componentes que la llevan) |
| Formato de pesos | ONNX |
| Libreria | microduck |
| Pipeline | robotics |
| Tamano del repo | 0.0 GB |
| Modelo base | jrubiosainz/microduck-tug-cup2p2-s4-a74f9bd7 |
| SHA256 de la politica | f342730b7b5e81f25753a23c305704186967d2820cbfc8f10996259b17cae872 |
| Comando canonico vx | -0.3 |

## Arquitectura y entrenamiento

La información disponible no describe una arquitectura de red neuronal convencional con capas, atención o embeddings. Lo que el autor documenta es una composición de una política base (a74f) con una tabla de búsqueda interna y una red de respaldo L1 heredada de lphatnguyen (lg21-5400, vía cup2l1/P1/a74f). No se entrenaron nuevos pesos para esta entrada: el propio autor afirma que "no new network weights were trained for this entry".

La modificación respecto al modelo base consiste en añadir la trayectoria de replay de la semilla 3, manteniendo las trayectorias de las semillas 1, 2, 4 y 5 por identidad. El diff exacto suministrado confirma 27 nodos idénticos, todos los campos no inicializadores y tensores no pertenecientes a filas de búsqueda sin cambios, y 275 pares observación/acción de las semillas 1, 2, 4 y 5 retenidos por identidad. La tabla se reordena a semillas 1, 2, 4, 5, 3, y siete de los 72 pares observación/acción de la semilla 3 sustituyen a pares anteriores. No se añadieron componentes `cup_bias`/`search2` de Hlib v2 ni pesos de red nuevos.

## Capacidades

- Ejecución de una política de control para la tarea "tug of war" en el simulador Microduck Arena.
- Replay determinista de trayectorias: la política incluye una tabla de búsqueda que devuelve acciones para pares observación/acción concretos.
- Red de respaldo L1 para los casos en que la tabla no contiene una coincidencia directa.
- Comando canónico de velocidad longitudinal `vx = -0.3`.
- Verificación de integridad mediante SHA256 de la política y de los receipts de evaluación.
- Capacidades de lenguaje, visión, audio, tool calling, agentes o razonamiento multi-paso: no disponibles (no es un modelo de propósito general).

## Casos de uso

- Evaluación en la Arena de Microduck: la política se emplea como candidata en el banco de pruebas de tug of war, donde se mide la ganancia de terreno (cm) por semilla. Es adecuada porque el artefacto incluye receipts de verificación nativa x86 y de reconstrucción/replay en QEMU x86_64.
- Reproducibilidad de experimentos de búsqueda: el paquete incluye `table-provenance.json` y `rd-exact-diff.json`, lo que permite auditar qué filas de la tabla cambiaron respecto al modelo base y verificar la identidad de los pares retenidos.
- Investigación sobre composición de políticas heredadas: sirve como caso de estudio de cómo una mejora localizada (una trayectoria de semilla) se integra en una política existente sin reentrenar pesos.
- Validación de pipelines de empaquetado ONNX con metadatos heredados: el autor advierte que el ONNX inmutable conserva metadatos heredados, lo que lo convierte en un ejemplo útil para probar herramientas de auditoría de avisos y licencias.
- Pruebas de arnés de simulación en CPU: la verificación se realizó con un runner nativo x86 runner-v5, lo que permite usar el artefacto en entornos sin GPU para validar el arnés de evaluación.
- Análisis de colisiones de resultados: el autor incluye `collision-screen.json` con un cribado sobre 170 filas del tablero público, útil para estudiar cómo detectar medias idénticas en leaderboards de simulación.
- No debe usarse en robótica física: la model card lo prohíbe explícitamente ("do not load this policy on a physical robot").

## Benchmarks y rendimiento

Resultados declarados por el autor sobre cinco semillas fijas de rating (in-sample), en simulación local:

| Semilla | Resultado | Terreno ganado (cm) |
|---|---|---:|
| 1 | pit_won | 169.02586817741394 |
| 2 | pit_won | 169.06843781471252 |
| 3 | pit_won | 168.46919655799866 |
| 4 | pit_won | 169.40760016441345 |
| 5 | pit_won | 168.5335636138916 |
| Media | 5/5 pit_won | 168.90093326568604 |

La media en hexadecimal es `0x1.51cd472000000p+7`. Los vectores nativo y x86 coinciden exactamente. Los 347 pasos fueron aciertos de tabla, con cero usos del fallback, cero aciertos erróneos y cero salidas no finitas. El autor subraya que son resultados locales sobre cinco semillas fijas in-sample y no un resultado de la Arena ni una medida de fuerza frente a otros candidatos.

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el artefacto es una política ONNX de 0.0 GB de repositorio y no se documentan requisitos de memoria.
- GPU recomendadas: no disponibles; la evaluación declarada se ejecutó en un runner nativo x86 (runner-v5) y en una reconstrucción/replay x86_64 QEMU, es decir, en CPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ejecución mediante la librería `microduck` y el runner de la Arena; el formato es ONNX, por lo que podría cargarse con runtimes ONNX estándar, aunque no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de artefacto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-tug-cup3-a74f-s3-f342730b | Política de control ONNX para simulacion | no disponible | no disponible | no disponible | Hugging Face, 0 descargas, 0 likes |
| microduck-tug-cup2p2-s4-a74f9bd7 (modelo base) | Política de control ONNX para simulacion | no disponible | no disponible | no disponible | Hugging Face |
| lg21-5400 (lphatnguyen, vía cup2l1) | Red de respaldo L1 heredada | no disponible | no disponible | no disponible | referenciada en la model card |

No se dispone de datos de rendimiento comparables entre estas variantes en la información proporcionada; la única comparación documentada es la del diff exacto frente al modelo base (27 nodos idénticos, 275 pares retenidos por identidad, 7 pares nuevos de la semilla 3).

## Limitaciones y advertencias

- Solo para simulación: la model card prohíbe explícitamente cargar la política en un robot físico.
- Resultados in-sample: las cinco semillas de evaluación son fijas y de rating; el autor indica que no constituyen un resultado de la Arena ni una afirmación de fuerza frente a otros candidatos.
- Sin reentrenamiento: no se entrenaron pesos nuevos; la contribución es únicamente una trayectoria de replay de la semilla 3.
- Cobertura de unicidad desconocida: el cribado de colisiones observó 170 filas públicas, pero el propio autor califica la cobertura como UNKNOWN/INCOMPLETE; no se excluyen colisiones fuera del tablero, retiradas o filtradas, y no predice el campo `copy_of` de la Arena.
- Equivalencia de copa no establecida: el autor advierte que "Cup equivalence and absence of regression are not established" porque las claves de búsqueda omiten dimensiones de comando y no se restringen a ejecuciones de rating.
- Evidencia de shadow finita: la comparación shadow sobre 307714 entradas guardadas de 390 partidas y 872 bouts mostró cero diferencias de bits de acción y cero aciertos de búsqueda, pero no constituye física de bucle cerrado ni garantía sobre trayectorias no vistas.
- Licencia ambigua: no se afirma licencia nueva ni global; Apache-2.0 se aplica solo a componentes que la llevan, y hc7 no declaró licencia en la revisión fijada. Existe una discrepancia de atribución de prefijo público preservada sin resolución.
- Metadatos heredados en el ONNX: el autor señala que el aviso externo no prueba el cumplimiento de obligaciones de aviso dentro del fichero.
- Riesgo de sesgos y alucinación: no aplicable en el sentido habitual de modelos de lenguaje; no disponible.
- Si un titular de derechos objeta, el autor indica que se debe detener y escalar al coordinador.

## Enlaces

- Hugging Face: https://huggingface.co/jrubiosainz/microduck-tug-cup3-a74f-s3-f342730b
- Modelo base: https://huggingface.co/jrubiosainz/microduck-tug-cup2p2-s4-a74f9bd7
- Repositorio del modelo base (referencia de commit en la model card): `jrubiosainz/microduck-tug-cup2p2-s4-a74f9bd7@aef14166ddd2186bcd79e74919f83d54c6740e1a`
- Papers, blogs, repos y demos adicionales: no disponibles en la información proporcionada.
