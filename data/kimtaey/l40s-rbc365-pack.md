# kimtaey/l40s-rbc365-pack

## Resumen

`kimtaey/l40s-rbc365-pack` no es un modelo de lenguaje, sino un paquete de entorno de simulacion empaquetado como artefacto de Hugging Face. Contiene una instalacion relocalizable de Python 3.11.14 (python-build-standalone) con RoboCasa 365 (robocasa v1.0), robosuite 1.5.2, MuJoCo 3.3.1 y NumPy 2.2.5, todo fijado a commits concretos y destinado a ejecutar evaluaciones de robotica en el carril `l40s-burst` de la infraestructura del autor. El repositorio ocupa 11,8 GB, principalmente por los assets de cocina de RoboCasa.

El paquete resuelve un problema de reproducibilidad: en lugar de reconstruir un entorno de simulacion con dependencias fragiles (MuJoCo, robosuite, assets binarios), el autor distribuye un arbol de Python ya compilado que se restaura con `cat` y `tar` y se ejecuta directamente desde `<dst>/rbc365_env/bin/python`. No incluye PyTorch ni LeRobot, por lo que no sirve para entrenar ni inferir politicas de aprendizaje profundo por si solo; es el sustrato de simulacion sobre el que se ejecutarian dichas politicas.

Es relevante para equipos de robotica que necesiten un entorno de evaluacion RoboCasa reproducible y sin instalacion, pero no debe confundirse con un modelo entrenado: no hay pesos, tokenizador, configuracion de transformer ni pipeline declarado. La fecha de creacion (2026-11-09) y los tags minimos (`region:us`) indican un artefacto interno de CI/evaluacion mas que un lanzamiento publico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es un entorno de simulacion Python empaquetado) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | no disponible; el artefacto se distribuye como archivos `rbc365_core.tgz.part-*` y `rbc365_assets.tgz.part-*` restaurables con `tar` |
| Tamano del repositorio | 11,8 GB |
| Version de Python | CPython 3.11.14 (python-build-standalone, relocalizable) |
| RoboCasa | robocasa v1.0 (RoboCasa 365), commit `56e355ccc64389dfc1b8a61a33b9127b975ba681` + kitchen assets |
| Robosuite | 1.5.2, commit `aaa8b9b214ce8e77e82926d677b4d61d55e577ab` |
| MuJoCo | 3.3.1 |
| NumPy | 2.2.5 |
| Frameworks ML incluidos | ninguno (sin lerobot, sin torch) |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: el artefacto no contiene una red neuronal ni un proceso de entrenamiento. Su "arquitectura" es un arbol de entorno Python autocontenido generado con python-build-standalone, con rutas relocalizables, que empaqueta el simulador fisico MuJoCo 3.3.1, la capa de tareas y robots robosuite 1.5.2 y el conjunto de tareas RoboCasa 365 con sus assets de cocina. Las dependencias estan fijadas a commits exactos (robocasa `56e355c...`, robosuite `aaa8b9b...`) y documentadas en `PINS.txt`.

El empaquetado se genero con el job `kakao-slurm-jobs/robocasa_eval/pack_rbc365_env_for_l40s.sbatch` y se publico mediante `l40s-kube-jobs/stage-rbc365-env.yaml`, lo que sugiere un pipeline de evaluacion sobre GPUs NVIDIA L40S. La restauracion se hace concatenando las partes del archivo tar y extrayendolas en un directorio destino; el interprete resultante vive en `<dst>/rbc365_env/bin/python`. No hay innovaciones de modelado (atencion, decodificacion especulativa, RLHF) porque no hay modelo.

## Capacidades

- Ejecucion de simulaciones fisicas de robotica con MuJoCo 3.3.1 y robosuite 1.5.2.
- Provision de las tareas de RoboCasa 365 (robocasa v1.0) con assets de cocina incluidos.
- Entorno Python 3.11.14 relocalizable, ejecutable sin instalacion adicional desde el directorio extraido.
- Reproducibilidad por fijado de commits y versiones exactas (`PINS.txt`).
- Base para ejecutar politicas de robotica entrenadas externamente (el paquete no incluye torch ni lerobot).
- No incluye generacion de texto, vision, tool calling, agentes ni capacidades multilingues.

## Casos de uso

- Evaluacion reproducible de politicas de manipulacion en RoboCasa 365: se restaura el entorno y se lanzan rollouts sobre las tareas de cocina con las versiones exactas fijadas, evitando divergencias por actualizaciones de MuJoCo o robosuite.
- CI de investigacion en robotica: integrar el paquete como artefacto cacheado en pipelines para que cada job de evaluacion arranque con un interprete listo en segundos, sin `pip install` ni compilacion de dependencias nativas.
- Benchmarking en nodos con GPU L40S: el entorno esta construido para el carril `l40s-burst`, de modo que se puede desplegar en Kubernetes mediante el manifiesto de staging referenciado y ejecutar simulaciones aceleradas.
- Reproduccion de resultados publicados: al fijar robocasa `56e355c` y robosuite `aaa8b9b`, permite replicar experimentos sobre exactamente las mismas tareas y assets que el autor.
- Desarrollo de entornos de evaluacion para competiciones o revisiones por pares: el paquete sirve como snapshot congelado que los revisores pueden restaurar sin acceso a la infraestructura original.
- Formacion de nuevos miembros del equipo: proporciona un entorno de simulacion funcional sin necesidad de configurar manualmente MuJoCo, robosuite y assets de cocina, reduciendo el tiempo de puesta en marcha.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica directamente; el paquete no incluye frameworks de inferencia con pesos. El consumo dependera de la politica que se ejecute sobre el simulador.
- GPU: el nombre del carril (`l40s-burst`) sugiere NVIDIA L40S (48 GB); no se documentan otras GPU compatibles.
- CPU/RAM: no disponible; MuJoCo y robosuite pueden ejecutarse en CPU, pero no se especifican requisitos minimos.
- Almacenamiento: 11,8 GB de repositorio mas el espacio del directorio de extraccion (los assets de cocina se descomprimen aparte).
- Consumer GPU: no disponible; no hay indicacion de que el paquete requiera GPU para funcionar.
- Despliegue: restauracion manual con `tar`; staging via `l40s-kube-jobs/stage-rbc365-env.yaml` (Kubernetes). No aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Alternativa | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `kimtaey/l40s-rbc365-pack` | Entorno de simulacion empaquetado (RoboCasa 365) | no aplica | no aplica | no disponible | Hugging Face, 0 descargas |
| Imagen Docker oficial de RoboCasa | Entorno de simulacion en contenedor | no aplica | no aplica | segun RoboCasa | Publica |
| Instalacion manual de robosuite + MuJoCo | Entorno de simulacion desde fuentes | no aplica | no aplica | segun cada proyecto | Publica |

No se dispone de datos de rendimiento ni de licencia para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo de IA: no contiene pesos, tokenizador ni pipeline; no puede generar texto, codigo ni realizar inferencia.
- Licencia no especificada: el uso comercial y la redistribucion son inciertos; conviene contactar con el autor antes de reutilizarlo.
- El paquete depende de commits concretos de robocasa y robosuite; actualizar cualquiera de ellos puede romper la compatibilidad con los assets incluidos.
- Sin torch ni lerobot: no sirve para entrenar ni ejecutar politicas de aprendizaje profundo sin instalar dependencias adicionales.
- Artefacto con 0 descargas y 0 likes, creado y actualizado el mismo dia: no hay evidencia de uso externo ni de validacion por terceros.
- Los scripts de build y staging referenciados (`kakao-slurm-jobs`, `l40s-kube-jobs`) son internos del autor y no se enlazan en la model card, lo que dificulta auditar el proceso de empaquetado.
- El tag `region:us` y la ausencia de metadatos adicionales limitan la descubribilidad y el soporte.
- La fecha de creacion (2026-11-09) es posterior a la fecha actual de referencia habitual; verificar la integridad del repositorio antes de confiar en el.

## Enlaces

- Hugging Face: https://huggingface.co/kimtaey/l40s-rbc365-pack
- RoboCasa (repositorio del simulador): no disponible en la informacion proporcionada
- Robosuite (repositorio del framework): no disponible en la informacion proporcionada
- MuJoCo: no disponible en la informacion proporcionada
- Paper de RoboCasa: no disponible en la informacion proporcionada
- Script de build (`kakao-slurm-jobs/robocasa_eval/pack_rbc365_env_for_l40s.sbatch`): no disponible como enlace publico
- Manifiesto de staging (`l40s-kube-jobs/stage-rbc365-env.yaml`): no disponible como enlace publico
