# langyo/wowsp-d1

## Resumen

WoWSP D1 es un conjunto de modelos ONNX de decision y puntuacion integrados en WoWSP, una herramienta de analisis de repeticiones y superposicion en juego para World of Warships. Lo desarrolla el autor independiente langyo y no es un modelo de lenguaje: son cuatro redes neuronales pequenas (entre 0,5 y 2,7 MB cada una) que puntuan acciones de combate a partir de caracteristicas extraidas de repeticiones de partidas. El repositorio de Hugging Face es un artefacto de publicacion generado automaticamente, no el hogar de desarrollo del proyecto.

El interes tecnico del artefacto esta en su contrato de distribucion: un manifiesto `manifest.json` firmado con Ed25519 que fija por sha256 cada binario y el commit de Hugging Face que lo contiene, con descarga desde rutas inmutables `/resolve/<commit-sha>/<path>`. Es un ejemplo practico de cadena de suministro de pesos verificable para modelos pequenos embebidos en aplicaciones de escritorio.

No se dispone de datos sobre arquitectura interna de las redes, parametros, contexto, idiomas ni benchmarks. La model card no publica metricas en el repositorio; indica que estas viven en el arbol de scripts del repositorio de GitHub en el commit registrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (redes ONNX; nombres de cabecera: fire-two-head, move-sectors-17, advice-fire-attrs, torpedo-three-head) |
| Parametros totales | no disponible (tamanos de fichero entre 492.411 y 2.652.542 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos como ONNX) |
| Idiomas soportados | no disponible |
| Licencia | Synthetic Source License 1.0 (SySL-1.0) |
| Formato de pesos | ONNX mas `ship_attributes.json` (tabla de atributos de buques) |

Ficheros del release:

| Ruta | Tipo | Conjunto de caracteristicas | Bytes |
|---|---|---|---|
| fire_model.onnx | fire-two-head | fire-v1 | 2.592.543 |
| move_model.onnx | move-sectors-17 | move-v1 | 2.652.542 |
| advice_fire_model.onnx | advice-fire-attrs | advice-e24 | 2.595.135 |
| torpedo_model.onnx | torpedo-three-head | torpedo-e26d | 492.411 |
| ship_attributes.json | datos | - | 261.507 |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna de las redes en la informacion disponible. Los nombres de los ficheros sugieren cabeceras de clasificacion multiples: `fire-two-head` y `torpedo-three-head` apuntan a salidas con dos y tres cabezas respectivamente, y `move-sectors-17` a una clasificacion sobre 17 sectores de movimiento. `advice-fire-attrs` sugiere un modelo de recomendacion de disparo condicionado por atributos del buque. Todos se ejecutan via ONNX Runtime.

El entrenamiento se realizo sobre caracteristicas derivadas de sesiones de repeticion aportadas por usuarios; no se publican repeticiones en bruto, identificadores de jugador ni ficheros del juego. Los scripts de entrenamiento y despliegue estan versionados en `training/` dentro del repositorio de GitHub en el commit `b4a0d38f65ba6ca5499510a4516f2f1be03e6f90`, y la model card y las metricas residen en ese arbol (`scripts/experiments/README.md`). No se indica numero de tokens, composicion del dataset ni uso de RLHF o DPO.

La innovacion destacable es el contrato de tiempo de ejecucion: los valores `featureSet` (fire-v1, move-v1, advice-e24, torpedo-e26d) son el contrato del featurizador de la aplicacion, y un cambio de featurizador obliga a renombrar el conjunto, nunca a reutilizar el nombre con semantica distinta. Cada fichero se mantiene por debajo de 10 MB para que las actualizaciones sean ligeras.

## Capacidades

- Puntuacion de decision de disparo de artilleria (`fire_model.onnx`, cabecera doble).
- Puntuacion de decision de movimiento sobre 17 sectores (`move_model.onnx`).
- Recomendacion de disparo condicionada por atributos del buque (`advice_fire_model.onnx`).
- Puntuacion de decision de lanzamiento de torpedos (cabecera triple, `torpedo_model.onnx`).
- Carga de atributos de buques desde `ship_attributes.json` para el enrutado de caracteristicas.
- Verificacion de integridad en cliente: comprobacion de sha256, validacion del tipo ONNX y de la anchura de entrada antes de instalar.
- No es un modelo generativo: no hay generacion de texto, razonamiento general, codigo, matematicas, vision, audio, tool calling, agentes ni capacidades multilingues.

## Casos de uso

- Superposicion en juego (overlay): la aplicacion carga los cuatro modelos y muestra al jugador una recomendacion de disparo, movimiento o torpedo en tiempo real; el tamano inferior a 3 MB por modelo permite inferencia en CPU sin penalizacion perceptible.
- Analisis posterior de repeticiones: procesar una repeticion ya grabada y comparar cada decision tomada por el jugador con la puntuacion del modelo para detectar errores de posicionamiento o de seleccion de objetivo.
- Entrenamiento y evaluacion de jugadores: usar las puntuaciones como senal objetiva en sesiones de repaso, priorizando los momentos con mayor discrepancia entre decision real y decision recomendada.
- Distribucion verificable de pesos en aplicaciones de escritorio: el manifiesto firmado con Ed25519 y las rutas `/resolve/<commit-sha>/<path>` sirven como patron para publicar actualizaciones de modelos pequenos con cadena de suministro auditable.
- Investigacion sobre decision tactica en dominios de simulacion naval: las cabeceras de clasificacion por sectores y las salidas multi-cabeza son un punto de partida para estudiar representaciones de decision en entornos con informacion parcial.
- Integracion en pipelines de analisis por lotes: al ser ONNX, los modelos se pueden ejecutar con ONNX Runtime en servidores sin GPU para procesar lotes de repeticiones y generar informes agregados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a `scripts/experiments/README.md` en el commit `b4a0d38f65ba6ca5499510a4516f2f1be03e6f90` del repositorio de GitHub como ubicacion de las metricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamano de los ficheros (menos de 3 MB cada uno) la inferencia en CPU es viable.
- GPU recomendadas: no disponibles; no se requiere GPU para ejecutar modelos ONNX de este tamano.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU mediante ONNX Runtime en CPU.
- Opciones de despliegue: ONNX Runtime (unica via documentada); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se identifican en la informacion proporcionada modelos comparables de la misma categoria (modelos de decision para analisis de repeticiones de World of Warships).

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe evaluarse con criterios de MMLU, HumanEval o GSM8K.
- Las puntuaciones dependen del featurizador de la aplicacion; reutilizar un nombre de `featureSet` con semantica distinta rompe la compatibilidad.
- Entrenado con caracteristicas de repeticiones aportadas por usuarios: posible sesgo hacia el estilo de juego y el nivel de habilidad de esa poblacion, sin datos publicados que permitan cuantificarlo.
- Riesgo de sobreajuste a la meta y al parche del juego vigente en el momento del entrenamiento; no se documenta el periodo cubierto.
- La tabla de atributos de buques deriva de datos del juego y los rasters de linea de vision (cuando estan presentes) de geometria de mapas publicada; consultar `NOTICE.md` para la declaracion de procedencia.
- Licencia SySL-1.0 (Synthetic Source License 1.0): no es una licencia de codigo abierto reconocida; revisar los terminos antes de cualquier uso comercial o redistribucion.
- El repositorio es un artefacto generado: no editar ficheros a mano; las modificaciones deben hacerse con `scripts/publish_ai_models.py` desde el checkout de GitHub.
- El manifiesto es el unico punto de entrada valido; instalar ficheros sin verificar la firma y el sha256 rompe la garantia de integridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/langyo/wowsp-d1
- Manifiesto de tiempo de ejecucion: https://huggingface.co/langyo/wowsp-d1/blob/main/manifest.json
- Licencia: https://huggingface.co/langyo/wowsp-d1/blob/main/LICENSE
- Aviso de procedencia: https://huggingface.co/langyo/wowsp-d1/blob/main/NOTICE.md
- Codigo fuente (commit registrado): https://github.com/langyo/wowsp/tree/b4a0d38f65ba6ca5499510a4516f2f1be03e6f90
- Metricas y experimentos: https://github.com/langyo/wowsp/blob/b4a0d38f65ba6ca5499510a4516f2f1be03e6f90/scripts/experiments/README.md
- Texto de la licencia SySL-1.0: https://github.com/celestia-island/sysl
