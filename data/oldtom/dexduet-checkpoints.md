# oldTOM/dexduet-checkpoints

## Resumen

DexDuet es un conjunto de checkpoints de políticas de aprendizaje por refuerzo para manipulación bimanual diestra, desarrollado por el grupo de investigación RCL Robotics (autores Haoran Zhang, Haokai Ding, Han Zhou, Zuxing Lu, Heng Zhang y Xingxing Zuo) y publicado junto al artículo "DexDuet: Learning Contact-Preserving Bimanual Dexterity from Human Demonstrations" (arXiv 2611.30495). El repositorio `oldTOM/dexduet-checkpoints` contiene las políticas entrenadas y evaluadas sobre las siete demostraciones ARCTIC de la suite DexMachina, ejecutadas en el simulador Genesis.

No se trata de un modelo de lenguaje, sino de un artefacto de robótica: 266 ejecuciones de entrenamiento que cubren cuatro manos robóticas (Inspire, Allegro, XHand y Schunk), siete tareas de manipulación y múltiples semillas, además de un conjunto de ablaciones sobre la mano Inspire. El repositorio ocupa 3,6 GB y se distribuye en dos archivos ZIP verificables mediante sumas SHA-256.

Su relevancia es investigativa: permite reproducir los resultados de las tablas 1, 2 y 3 del artículo y auditar las ablaciones del método de aprendizaje a partir de demostraciones humanas, con preservación de contacto en manipulación bimanual. No hay datos sobre arquitectura de red, número de parámetros ni contexto, ya que la model card no los detalla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (políticas de RL para control robótico; no se especifica la topología de red) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica a un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT (con restricciones de uso derivadas de ARCTIC y MANO; solo investigación no comercial) |
| Formato de pesos | checkpoints `.pth` (PyTorch) junto con `config/` (`agent.yaml`, `env.yaml`, `initialization.json`), `final_checkpoint.json` y `RUN_INFO.json` |

## Arquitectura y entrenamiento

La model card no describe la arquitectura de red de las políticas. El pipeline declarado en Hugging Face es `reinforcement-learning`, y el método se enmarca en el aprendizaje de destrezas bimanuales con preservación de contacto a partir de demostraciones humanas. Las políticas se entrenan y evalúan en el simulador Genesis sobre las siete demostraciones ARCTIC de la suite DexMachina.

El conjunto publicado comprende 140 ejecuciones en `dexduet_dexmachina_suite.zip` (cuatro manos × siete demostraciones × cinco semillas) y 126 ejecuciones en `dexduet_ablations.zip` (seis filas de ablación, b–g, sobre la mano Inspire × siete demostraciones × tres semillas). No se indican en la información disponible el número de tokens, la composición del dataset de entrenamiento ni si se emplearon técnicas de RLHF o DPO; tampoco se detallan innovaciones técnicas concretas más allá del enfoque de preservación de contacto anunciado en el título del artículo.

## Capacidades

- Ejecución de políticas de manipulación diestra bimanual sobre las siete demostraciones ARCTIC de la suite DexMachina.
- Soporte de cuatro morfologías de mano robótica: Inspire, Allegro, XHand y Schunk.
- Reproducción de resultados de las tablas 1, 2 y 3 (fila a) del artículo mediante los checkpoints de la suite principal.
- Evaluación de ablaciones (filas b–g de la tabla 3) sobre la mano Inspire.
- Verificación de integridad de los pesos mediante sumas SHA-256 (`CHECKPOINTS.sha256` y `MANIFEST.sha256` por paquete).
- No se documentan capacidades de generación de texto, código, matemáticas, visión, tool calling, agentes ni multilingüismo, por tratarse de un artefacto de robótica.

## Casos de uso

- Reproducción de resultados del artículo: descargar `dexduet_dexmachina_suite.zip`, verificar las sumas SHA-256 y ejecutar las políticas con el código de `github.com/HaoranZhangumich/DexDuet` para contrastar las métricas de las tablas 1 y 2.
- Auditoría de ablaciones: usar `dexduet_ablations.zip` para comparar las filas b–g de la tabla 3 sobre la mano Inspire y analizar el efecto de cada componente del método.
- Investigación en manipulación bimanual: emplear los checkpoints como línea base para nuevos métodos de aprendizaje a partir de demostraciones humanas con preservación de contacto.
- Estudio de transferencia entre morfologías: comparar políticas entrenadas para Inspire, Allegro, XHand y Schunk sobre las mismas siete tareas y semillas.
- Análisis de robustez por semilla: las cinco semillas de la suite principal permiten estudiar la varianza de las políticas entrenadas.
- Docencia y formación: usar los paquetes verificables como material didáctico para prácticas de RL aplicado a robótica diestra en el simulador Genesis, con el código de entrenamiento como referencia.
- Integración en pipelines de evaluación: los archivos `RUN_INFO.json` y `final_checkpoint.json` facilitan automatizar la selección y trazabilidad de checkpoints en experimentos comparativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las tablas 1, 2 y 3 del artículo (arXiv 2611.30495) para las métricas de las ejecuciones, pero no incluye cifras numéricas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifica el tamaño de las redes ni el coste de inferencia).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; los pesos son checkpoints PyTorch (`.pth`) pensados para el código de entrenamiento y evaluación del repositorio DexDuet, con el simulador Genesis.
- Latencia y throughput estimados: no disponible.
- Espacio en disco: 3,6 GB para el repositorio completo; 1,28 GB para `dexduet_dexmachina_suite.zip` y 1,05 GB para `dexduet_ablations.zip`.

## Comparativa con modelos similares

| Modelo | Tipo | Manos soportadas | Tareas | Semillas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DexDuet (este repositorio) | Políticas RL bimanuales | Inspire, Allegro, XHand, Schunk | 7 ARCTIC (DexMachina) | 5 (suite) / 3 (ablaciones) | MIT con restricciones de ARCTIC/MANO | Hugging Face, 3,6 GB |
| DexMachina | Políticas RL (suite base) | no disponible | no disponible | no disponible | MIT | Release propio de DexMachina (no incluido aquí) |
| Alternativas adicionales | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card indica explícitamente que los checkpoints de DexMachina no están incluidos y deben obtenerse de su release. No se dispone de información sobre otros conjuntos de políticas comparables.

## Limitaciones y advertencias

- Restricciones de licencia: aunque el repositorio declara MIT, las políticas se entrenaron con demostraciones derivadas de ARCTIC y MANO, cuyas licencias permiten únicamente uso de investigación no comercial; MANO excluye además el entrenamiento de redes con fines comerciales. Estos términos pueden aplicarse a los checkpoints, por lo que deben usarse solo para investigación no comercial.
- No se incluyen datos derivados de ARCTIC, MANO o SMPL-X (demostraciones retargeteadas, estados iniciales, grabaciones); deben regenerarse con el código del repositorio y cuentas propias.
- Los checkpoints de DexMachina no están incluidos y deben obtenerse por separado.
- Las rutas de los archivos de configuración comienzan con `<REPO>`; es necesario ejecutar `scripts/stage_release_run.py` para apuntarlas a la copia local del código.
- Las ejecuciones de la fila (e) de ablación (política unificada de DexMachina) carecen de `initialization.json` y `final_checkpoint.json`, lo que limita su trazabilidad.
- No se dispone de información sobre sesgos, riesgo de alucinación ni limitaciones de contexto o idioma, al no ser un modelo de lenguaje.
- No se documentan requisitos de hardware, latencia ni throughput, lo que dificulta planificar el despliegue en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/oldTOM/dexduet-checkpoints
- Artículo: https://arxiv.org/abs/2611.30495
- Página del proyecto: https://rcl-robotics.github.io/Dexduet.io/
- Código: https://github.com/HaoranZhangumich/DexDuet
