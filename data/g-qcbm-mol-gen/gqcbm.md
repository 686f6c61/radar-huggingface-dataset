# G-QCBM-Mol-Gen/GQCBM

## Resumen

GQCBM es un conjunto de checkpoints publicado por la organización G-QCBM-Mol-Gen, asociado al paper *Generative Quantum Circuit Born Machines* (GQCBM). No se trata de un modelo de lenguaje ni de un transformer generativo convencional: los ficheros distribuidos contienen políticas entrenadas de circuitos cuánticos parametrizados (Quantum Circuit Born Machines) orientados a la generación de moléculas. El repositorio actúa como espejo byte a byte de 23 ficheros `.pt` que residen en la rama `Leo_GQCBM` del repositorio de código `the-matter-lab/GQE_QCBM_VAE`, en el directorio `gqcbm-born-machine/`.

El interés del artefacto es de reproducibilidad científica más que de despliegue en producción: cada checkpoint almacena la política entrenada junto con su mejor circuito (`best_ops`, `best_theta`) y el valor de divergencia KL asociado (`best_kl`), lo que permite a terceros cargar los resultados del paper y ejecutar los scripts de análisis y generación de figuras sin reentrenar. El tamaño total del repositorio es de aproximadamente 0,5 GB y la licencia declarada es Apache 2.0.

No hay información pública sobre arquitectura de red neuronal, número de parámetros, longitud de contexto ni idiomas soportados, porque el objeto del repositorio no es un modelo de lenguaje. Cualquier evaluación de capacidades lingüísticas, tool calling o razonamiento multi-paso carece de sentido en este caso y así se refleja en los apartados siguientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Quantum Circuit Born Machine (QCBM) con política entrenada; arquitectura neuronal subyacente no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (PyTorch), 23 ficheros en `ckpts/` con hashes en `MANIFEST.sha256` |

## Arquitectura y entrenamiento

El repositorio distribuye checkpoints de un Generative Quantum Circuit Born Machine, un modelo generativo basado en circuitos cuánticos parametrizados cuya distribución de salida se entrena minimizando una divergencia KL respecto a la distribución objetivo. Cada fichero `.pt` contiene la política entrenada, el mejor circuito encontrado (`best_ops`, `best_theta`) y el valor de `best_kl` alcanzado, lo que sugiere un bucle de optimización con búsqueda de arquitectura de circuito y ajuste de parámetros angulares.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset molecular, el número de tokens procesados ni la presencia de RLHF o DPO, que por otra parte no aplican a este tipo de modelo. El paper menciona checkpoints adicionales correspondientes a las figuras 3, S1 y S10 y a las tablas 1 y 2 que se irán añadiendo al repositorio, por lo que la cobertura actual es parcial.

## Capacidades

- Generación de moléculas mediante muestreo de la distribución aprendida por el circuito cuántico Born machine.
- Carga de políticas entrenadas y recuperación del mejor circuito asociado (`best_ops`, `best_theta`) y de su métrica de calidad (`best_kl`).
- Reproducción de resultados del paper: los scripts de figuras y análisis cargan `ckpts/<name>.pt`.
- Verificación de integridad de los pesos mediante `MANIFEST.sha256`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Reproducción de experimentos del paper *Generative Quantum Circuit Born Machines*: descarga de los 23 checkpoints en `gqcbm-born-machine/ckpts/` y ejecución de los scripts de análisis para regenerar tablas y figuras con los mismos valores de KL reportados.
- Investigación en generación molecular con modelos cuánticos: uso de las políticas entrenadas como línea base contra la que comparar nuevos circuitos o nuevos optimizadores, midiendo la mejora en `best_kl`.
- Auditoría de resultados publicados: el `MANIFEST.sha256` permite comprobar que los pesos evaluados por un tercero coinciden byte a byte con los del paper, lo que facilita revisiones por pares y replicaciones independientes.
- Docencia y divulgación en computación cuántica aplicada: los checkpoints permiten a estudiantes inspeccionar la estructura de un circuito Born machine entrenado (`best_ops`, `best_theta`) sin asumir el coste de entrenamiento.
- Desarrollo de pipelines de generación molecular sobre hardware cuántico o simulado: integración de la política entrenada en flujos que muestrean moléculas candidatas y las filtran con criterios químicos posteriores.
- Extensión del trabajo con nuevos checkpoints: el repositorio está pensado para recibir los pesos de las figuras 3, S1 y S10 y de las tablas 1 y 2, de modo que sirve como punto de distribución versionado para futuras ampliaciones del estudio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente referencia valores de `best_kl` almacenados dentro de cada checkpoint, pero no se proporciona la tabla de resultados en el material consultado.

## Requisitos de hardware

- Almacenamiento: aproximadamente 0,5 GB para el conjunto completo de 23 checkpoints en `.pt`.
- VRAM estimada para inferencia: no disponible; depende del tamaño del circuito y de si la simulación se ejecuta en simulador o en hardware cuántico real.
- GPU recomendadas: no disponibles. Para carga de tensores PyTorch en CPU es suficiente con memoria RAM convencional dado el tamaño del repositorio.
- Cabe en GPU de consumo: no se puede confirmar sin conocer el número de qubits y la profundidad del circuito; el peso en disco (0,5 GB) sugiere que la carga en memoria no es un problema, pero el coste de simulación crece exponencialmente con el número de qubits.
- Opciones de despliegue: carga directa con PyTorch (`torch.load`) desde `gqcbm-born-machine/ckpts/`; los scripts del repositorio `the-matter-lab/GQE_QCBM_VAE`, rama `Leo_GQCBM`, gestionan la inferencia y el análisis.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GQCBM | QCBM para generación molecular | no disponible | no aplica | Apache 2.0 | Hugging Face (checkpoints) |
| Alternativas QCBM para moléculas | QCBM | no disponible | no aplica | no disponible | no disponible |
| Modelos generativos moleculares neuronales (VAE, difusión) | Redes neuronales | variable | no aplica | variable | múltiples |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a prompts conversacionales y no soporta instrucciones en lenguaje natural.
- Cobertura incompleta: faltan los checkpoints de las figuras 3, S1 y S10 y de las tablas 1 y 2, que el autor anuncia para más adelante.
- Dependencia del repositorio de código: los pesos solo son utilizables junto con los scripts de `the-matter-lab/GQE_QCBM_VAE`, rama `Leo_GQCBM`, directorio `gqcbm-born-machine/`; sin ese código la utilidad práctica es limitada.
- Repositorio sin descargas ni likes y con pipeline no definido, lo que indica ausencia de validación comunitaria y de integración con las herramientas estándar de Hugging Face.
- Riesgo de simulación costosa: la evaluación de circuitos cuánticos escala de forma exponencial con el número de qubits en simuladores clásicos; el tamaño en disco no refleja el coste computacional real.
- Licencia Apache 2.0 permite uso comercial y modificación, pero conviene citar el paper original y verificar los términos del repositorio de código asociado, que puede tener su propia licencia.
- No hay información sobre sesgos, alucinación o limitaciones idiomáticas porque el modelo no opera sobre texto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/G-QCBM-Mol-Gen/GQCBM
- Perfil de la organización: https://huggingface.co/G-QCBM-Mol-Gen
- Repositorio de código: https://github.com/the-matter-lab/GQE_QCBM_VAE (rama `Leo_GQCBM`, directorio `gqcbm-born-machine/`)
- Paper *Generative Quantum Circuit Born Machines*: no disponible en la información proporcionada
- Demo: no disponible
