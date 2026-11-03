# Kai9987kai/Graft-brain

## Resumen

GraftBrain es un sistema de investigación en neurociencia computacional y aprendizaje por refuerzo desarrollado por el usuario Kai9987kai. No es un modelo de lenguaje: es una red neuronal recurrente de tasa de disparo construida a partir de los conectomas de *Drosophila melanogaster* reconstruidos por microscopía electrónica (FlyWire, Hemibrain, MaleCNS, BANC, Optic Lobe, MANC, FANC y Larval Brain), fusionados en un único grafo computacional diferenciable de PyTorch. El sistema acopla estos circuitos biológicos congelados con capas de enrutamiento sináptico entrenables ("injertos") y con un agente PPO que interactúa en un entorno 3D virtual con retina de 33 rayos, propiocepción y entrada de webcam.

La propuesta técnica central es el "grafting": en lugar de usar un cuello de botella arbitrario, cada par de conectomas se interconecta mediante tres mecanismos estructurales (interfaces anatómicas, sitios homólogos y puentes centrales recíprocos), generando por defecto 177 sitios de injerto y aproximadamente 96.000 sinapsis plásticas que puentean 12.000 neuronas. La anatomía del conectoma permanece congelada y solo los injertos se adaptan mediante descenso de gradiente online y plasticidad hebbiana de tres factores.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, un tamaño de 0,0 GB y fue creado el 3 de noviembre de 2026. Es relevante como artefacto de investigación en la línea de los trabajos de conectoma-constrained de Shiu et al. (Nature 2024) y Lappalainen et al. (Nature 2024), pero no es un modelo generativo desplegable en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal recurrente de tasa de disparo sobre grafo de conectoma (8 conectomas de Drosophila) + agente PPO (actor-crítico) + subcircuitos biológicos (ring attractor, Mushroom Body, RND) |
| Parametros totales | no disponible (el repo declara ~12.000 neuronas modeladas y ~96.000 sinapsis de injerto plásticas; no se publica recuento de parámetros entrenables) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; opera sobre observaciones por paso de simulación) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones; pesos en PyTorch) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | no disponible (checkpoints de PyTorch con guardado atómico rotativo y auto-reanudación entre ejecuciones) |

## Arquitectura y entrenamiento

El núcleo es un modelo dinámico de tasas con 4 micro-pasos recurrentes por paso de simulación, descrito en la model card como x = W_conn·r + W_graft·r + b + I_drive, seguido de una actualización r ← (1−α)·r + α·ReLU(tanh(x)) + ε. La implementación usa operaciones vectorizadas `index_add` de PyTorch en lugar de multiplicación dispersa COO/CSR, lo que según el autor aporta más de 2,2× de aceleración (aproximadamente 14 pasos/s en CPU para 12.000 neuronas). Los pesos del conectoma están congelados; los pesos de injerto se adaptan mediante descenso de gradiente online y plasticidad hebbiana de tres factores.

El entrenamiento combina PPO con GAE (referencia arXiv:1707.06347) para la política y el crítico, con una recompensa intrínseca de curiosidad basada en Random Network Distillation para tareas de recompensa dispersa. Los subcircuitos biológicos incluyen una brújula de Complex Central modelada como ring attractor de 16 cuñas del Ellipsoid Body que integra velocidad angular y se ancla a señales visuales de alto contraste; un Mushroom Body con Kenyon Cells dispersas (Winner-Take-All top-k de aproximadamente el 6 %) y neuronas dopaminérgicas que modulan las MBON según el error TD de recompensa/castigo; y regulación homeostática de la tasa de disparo con corrientes de sesgo que derivan lentamente hacia una tasa poblacional media de aproximadamente 0,12. La ingesta de conectomas soporta proxies estadísticos offline, importación directa de FlyWire v783 en formato Apache Feather desde Zenodo, APIs REST de neuPrint y listas de aristas CSV arbitrarias, preservando predicciones de neurotransmisor (GABA y glutamato como inhibitorios, acetilcolina como excitatorio).

## Capacidades

- Control motor en un entorno 3D virtual mediante comandos discretos/continuos de avance, giro, alcance, altura y agarre.
- Percepción visual a partir de una retina de 33 rayos RGBD y de una señal de webcam local (procesamiento exclusivamente local según la model card).
- Integración de propiocepción, señales de recompensa y claves sensoriales en un único grafo end-to-end diferenciable.
- Navegación con heading interno mantenido por el ring attractor del Complex Central, con reanclaje a claves visuales de alto contraste.
- Aprendizaje asociativo mediado por Mushroom Body con modulación dopaminérgica por error de predicción de recompensa.
- Exploración intrínseca mediante Random Network Distillation en entornos de recompensa dispersa.
- Aprendizaje online de los injertos sin reentrenar la anatomía del conectoma.
- Persistencia de estado con checkpoints atómicos rotativos y reanudación automática entre ejecuciones.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas, tool calling, capacidades multilingües ni modo de pensamiento.

## Casos de uso

- Investigación en neurociencia computacional: comparar el rendimiento de políticas PPO con y sin circuitos de conectoma congelados para aislar la contribución funcional de arquitecturas biológicas concretas, usando los 8 conectomas como ablaciones.
- Estudio de ring attractors y navegación: usar el Complex Central de 16 cuñas como banco de pruebas para mecanismos de integración de heading y reanclaje visual en agentes encarnados.
- Modelado de aprendizaje asociativo: emplear el Mushroom Body con Kenyon Cells dispersas y modulación dopaminérgica para experimentos de condicionamiento con error TD en tareas de recompensa dispersa.
- Exploración en entornos sparse-reward: aprovechar la curiosidad RND para tareas de navegación 3D donde la recompensa extrínseca es escasa, midiendo la contribución de la recompensa intrínseca.
- Plasticidad estructural: estudiar cómo los 177 sitios de injerto y las ~96.000 sinapsis plásticas adaptan la dinámica de una red anatómicamente restringida, comparando con redes totalmente entrenables del mismo tamaño.
- Reproducibilidad de conectomas: ingerir FlyWire v783 vía Feather o neuPrint y ejecutar pipelines reproducibles con checkpoints atómicos, útil para grupos que replican resultados de conectómica.
- Docencia y divulgación: demostrar en un entorno 3D interactivo cómo circuitos identificados en Drosophila producen comportamiento, con entrada de webcam local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta una métrica de eficiencia interna: aproximadamente 14 pasos/s en CPU para 12.000 neuronas con `index_add`, más de 2,2× frente a la multiplicación dispersa COO/CSR estándar. No hay comparaciones con MMLU, HumanEval, GSM8K ni con tareas estándar de RL como Atari o MuJoCo.

## Requisitos de hardware

- VRAM estimada: no disponible; el sistema declara ejecución en CPU a ~14 pasos/s para 12.000 neuronas, por lo que el despliegue en GPU no es un requisito documentado.
- GPU recomendadas: no disponible; cualquier GPU con PyTorch compatible puede acelerar las operaciones `index_add`, pero el autor no publica perfiles por hardware.
- Cabe en GPU de consumo: previsiblemente sí dada la escala (12.000 neuronas, ~96.000 sinapsis), aunque no se documenta VRAM concreta ni modelos como RTX 4090.
- Opciones de despliegue: PyTorch nativo con Python 3.10+; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: ~14 pasos/s en CPU para 12.000 neuronas según el autor; sin datos de latencia en GPU ni de throughput en entornos 3D.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GraftBrain | RNN de tasa sobre conectoma + PPO | ~12.000 neuronas, ~96.000 sinapsis de injerto (parámetros entrenables no disponibles) | no aplica | MIT | HuggingFace (0 descargas) |
| Modelos conectoma-constrained de Shiu et al. (Nature 2024) | Redes restringidas por conectoma de Drosophila | no disponible en la informacion | no aplica | no disponible | Publicación científica |
| Modelos conectoma-constrained de Lappalainen et al. (Nature 2024) | Redes restringidas por conectoma de Drosophila | no disponible en la informacion | no aplica | no disponible | Publicación científica |
| Agentes PPO estándar (p. ej. implementaciones de referencia) | MLP/CNN actor-crítico | variable | no aplica | variable | Amplia |

La comparación cuantitativa con las alternativas no está disponible: la model card no incluye métricas de rendimiento frente a estos trabajos ni frente a agentes PPO convencionales.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo generativo: no procesa texto, código ni imágenes naturales fuera del pipeline de retina y webcam.
- Los conectomas son diagramas anatómicos estáticos reconstruidos de tejido preservado; la model card advierte explícitamente que "grafting" designa capas plásticas añadidas sobre esos grafos y no una conexión física real con un cerebro biológico.
- El repositorio tiene 0 descargas y 0 likes y un tamaño de 0,0 GB, lo que sugiere que los pesos y checkpoints no están publicados o no son sustanciales; la reproducibilidad práctica no está garantizada.
- No se documentan sesgos, tasas de alucinación ni evaluaciones de robustez; al no ser un modelo lingüístico, esas categorías no aplican directamente, pero tampoco hay validación de comportamiento fuera del entorno 3D del autor.
- Los resultados de eficiencia (~14 pasos/s, >2,2× de aceleración) son afirmaciones del autor sin benchmark independiente ni comparación con líneas base publicadas.
- La licencia MIT permite uso comercial del código, pero el valor del artefacto es de investigación; no hay garantías de soporte, mantenimiento ni estabilidad de API.
- La webcam se procesa solo localmente según la model card, pero no se detalla el tratamiento de datos ni la política de privacidad más allá de esa afirmación.
- El soporte de idiomas, cuantización y formato de pesos no está documentado, lo que dificulta integrarlo en pipelines de despliegue convencionales.

## Enlaces

- HuggingFace: https://huggingface.co/Kai9987kai/Graft-brain
- Fly Brain Hub (datasets de conectomas): https://fly-brain-hub.vercel.app/datasets
- PPO (paper de referencia): https://arxiv.org/abs/1707.06347
- Licencia MIT: https://opensource.org/licenses/MIT
- Python 3.10+: https://www.python.org/downloads/
- Referencia científica citada en la model card: Shiu et al., Nature 2024 (no se proporciona URL en la información disponible)
- Referencia científica citada en la model card: Lappalainen et al., Nature 2024 (no se proporciona URL en la información disponible)
