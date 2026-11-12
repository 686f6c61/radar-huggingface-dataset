# aebatirel/v2d-track3-container

## Resumen

`aebatirel/v2d-track3-container` no es un modelo de lenguaje, sino un archivo de imagen Docker (9,6 GB comprimidos, 19,3 GB una vez cargados) que contiene la submission verificable del equipo Imitation.Tech para la Track 3 del NVIDIA V2D Challenge. El paquete, etiquetado como "pack 13h", incluye 20 políticas de imitación entrenadas para tareas de manipulación robótica, junto con el evaluador, los scripts de empaquetado y los rollouts almacenados, de modo que un tercero puede reproducir y verificar los resultados sin red ni dataset.

El interés del artefacto es la reproducibilidad: el autor publica hashes SHA-256 del archivo y del manifiesto OCI, el commit exacto del código, un informe técnico y el registro completo de construcción. El contenedor expone dos comandos, `verify` (sin GPU, 11 comprobaciones sobre hashes, procedencia y reempaquetado byte a byte) y `reproduce` (con GPU, ejecuta las 20 políticas con el evaluador y genera un nuevo fichero Parquet de submission).

Los resultados contados en las seis tablas de la Track 3 son AUC 0,88001; SP-SR 0,90; MP-SR 0,80; RPE 2,28085 cm; MPPE 1,85258 cm y CD-O 0,25159 cm. No se dispone de información sobre la arquitectura interna de las políticas, los datos de entrenamiento ni los parámetros de los modelos incluidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (contenedor de políticas de imitación para robótica; no se detalla la arquitectura de los modelos) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoints incluidos dentro de la imagen Docker; el artefacto distribuido es un archivo `.tar.zst` con la imagen `imitation.tech-v2d-submission:final` |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura de las 20 políticas de imitación incluidas; solo se indica que son políticas entrenadas para la Track 3 del V2D Challenge y que se evalúan con el evaluador oficial empaquetado en la imagen. El contenedor incluye los checkpoints de las 20 políticas, el script evaluador, el empaquetador, el cargador y el código del evaluador, todos ellos verificables por hash.

La model card recoge tres divulgaciones relevantes sobre el proceso de construcción: parte de las mallas empaquetadas se seleccionaron por su puntuación frente a los escaneos públicos de objetos (sin usar ground truth de episodios de evaluación ni entradas del leaderboard); la política del episodio de evaluación 10 se entrenó con `sim.njmax` 1024 y se evaluó con los límites guardados en su checkpoint (512 / 256) mediante una edición header-only de la configuración; y el episodio 15 se empaqueta bajo la exención del propietario del equipo respecto a una cláusula de intercambio preregistrada.

## Capacidades

- Ejecución de 20 políticas de imitación robótica sobre el evaluador de la Track 3 del V2D Challenge.
- Verificación sin GPU ni red de la integridad del paquete: commit y árbol limpio, procedencia, hashes del empaquetador, cargador, script evaluador y código del evaluador, los 20 checkpoints y reempaquetado byte a byte de los rollouts almacenados (11 de 11 comprobaciones superadas).
- Verificación cruzada contra las seis copias de Kaggle (`verify --kaggle`).
- Reproducción completa con GPU: `reproduce` genera un nuevo fichero `track3_submission.parquet` con etiqueta y salida configurables y paralelismo ajustable (usado con `--parallel 4`).
- Verificación de resultados reproducidos (`verify --reproduced`), que compara filas y procedencia (13 de 13 comprobaciones superadas en la prueba del autor).
- Ejecución aislada: los comandos documentados se lanzan con `--network none`, sin acceso a dataset externo para la Track 3.

## Casos de uso

- Auditoría de una submission de competición: un revisor descarga el archivo, comprueba el SHA-256 con `sha256sum -c`, carga la imagen y ejecuta `run.sh verify` sin GPU para confirmar hashes, procedencia y reempaquetado byte a byte de los rollouts.
- Reproducción independiente de resultados: con una GPU (el autor usó una RTX PRO 6000), `reproduce` vuelve a ejecutar las 20 políticas en unos 5,5 minutos y genera un Parquet comparable contra el original mediante `verify --reproduced`.
- Validación de infraestructura de evaluación: el contenedor sirve para comprobar que el evaluador oficial y los límites de simulación (`sim.njmax` 512 / 256) se comportan igual en otra máquina, midiendo la desviación de posiciones de objetos (mediana 0,55 cm, percentil 95 de 2,67 cm en la prueba del autor).
- Replicación de un pipeline de empaquetado: el registro de construcción del repositorio incluye Dockerfile, logs y todos los comandos, lo que permite reconstruir la imagen con las mismas dependencias y versiones.
- Base para experimentos de manipulación robótica: las 20 políticas y el evaluador empaquetados permiten partir de un entorno cerrado y reproducible para comparar variantes de política sin reconfigurar la simulación.
- Integración en CI de un equipo de robótica: los comandos `verify` sin GPU y sin red son aptos para ejecutarse como paso de integración que detecte alteraciones del paquete o del código del evaluador.

## Benchmarks y rendimiento

Resultados contados por el autor en las seis tablas de la Track 3 (IDs de submission de Kaggle entre paréntesis):

| Metrica | Submission ID | Resultado |
|---|---|---|
| AUC (`add_auc`) | 57925185 | 0,88001 |
| SP-SR (`spider_sr`) | 57925189 | 0,90 |
| MP-SR (`maniptrans_sr`) | 57925196 | 0,80 |
| RPE (`rpe_cm`) | 57925202 | 2,28085 cm |
| MPPE (`mppe_cm`) | 57925211 | 1,85258 cm |
| CD-O (`cd_o_cm`) | 57925216 | 0,25159 cm |

Rendimiento de reproducción declarado: 20 episodios en 5,5 minutos sobre una RTX PRO 6000, con desviación de posiciones de objetos respecto a la subida original de 0,55 cm de mediana y 2,67 cm en el percentil 95. No se han publicado resultados de benchmarks comparativos con otros equipos en la información disponible.

## Requisitos de hardware

- Disco: 9,6 GB para el archivo `.tar.zst` y aproximadamente 40 GB libres durante la carga de la imagen; 19,3 GB una vez cargada.
- GPU: necesaria solo para `reproduce`; el autor la validó en una NVIDIA RTX PRO 6000. `verify` funciona sin GPU.
- VRAM estimada: no disponible (no se documenta el tamaño de los checkpoints ni su consumo en inferencia).
- GPU de consumo: no disponible; no se indica si cabe en tarjetas tipo RTX 4090.
- Despliegue: Docker con soporte de `zstd` para descomprimir y `docker load` para cargar; los comandos se ejecutan con `--network none` y, en el caso de `reproduce`, con `--gpus all`.
- Latencia y throughput: 20 episodios en 5,5 minutos con `--parallel 4` en una RTX PRO 6000; no se aportan más métricas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros contenedores de verificación ni submissions comparables de la Track 3 del V2D Challenge.

## Limitaciones y advertencias

- No es un modelo de propósito general: es un artefacto de verificación de una submission concreta; no admite prompts de texto, visión ni tool calling.
- Licencia no disponible: no se especifican condiciones de uso comercial ni de redistribución del contenedor o de los checkpoints incluidos.
- Idiomas y contexto no disponibles: no aplica en el sentido habitual, pero tampoco se documenta nada al respecto.
- Divulgaciones que afectan a la interpretación de los resultados: selección de mallas por puntuación contra escaneos públicos, edición header-only de la configuración del episodio 10 (`sim.njmax` 1024 en entrenamiento frente a 512 / 256 en evaluación) y uso de una exención sobre una cláusula de intercambio preregistrada en el episodio 15.
- La reproducibilidad no es exacta: la propia verificación acepta diferencias de posición de objetos (mediana 0,55 cm, percentil 95 de 2,67 cm) por la no determinación de la simulación.
- Requiere espacio en disco considerable (unos 40 GB durante la carga) y una GPU para la reproducción completa.
- El repositorio de Hugging Face registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación independiente por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/aebatirel/v2d-track3-container
- Código (commit de la submission): https://github.com/aebatirel/v2d-track3/commit/9610329e1177921827a9b66e38103e746efd8a0c
- Informe técnico (PDF): https://github.com/aebatirel/v2d-track3/blob/7ded292fd74c4f5f26c1a055d3cd431015ac5e7d/docs/paper-arxiv-20261106/main.pdf
- Registro de construcción (Dockerfile, logs y comandos): https://github.com/aebatirel/v2d-track3/tree/7ded292fd74c4f5f26c1a055d3cd431015ac5e7d/docs/container-20261111
