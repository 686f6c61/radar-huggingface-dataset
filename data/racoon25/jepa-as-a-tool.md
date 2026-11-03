# racoon25/jepa-as-a-tool

## Resumen

`racoon25/jepa-as-a-tool` es un modelo de mundo (world model) experimental publicado por el usuario Rahul Chander (racoon25) como parte del proyecto de código abierto `jepa-as-a-tool`. No es un modelo de lenguaje: es un componente de predicción latente que se acopla a un encoder de vídeo congelado (V-JEPA 2 de Meta, `facebook/vjepa2-vitl-fpc64-256`) para anticipar el resultado de acciones físicas (empujones) sobre objetos en tres entornos distintos: un tablero 2D tipo PushT, una mesa 3D y una mesa de billar 3D.

El sistema se compone de dos piezas entrenadas: un `predictor.pt` (transformer de 6 capas que recibe un latente de V-JEPA 2 más un vector de empuje y produce el latente del siguiente estado) y un `translator.pt` (que proyecta el latente a posiciones mediante un tronco compartido y una cabeza específica por mundo). La innovación declarada es que un único predictor, sin recibir información sobre en qué mundo opera, generaliza entre los tres dominios.

Es relevante ahora porque ejemplifica el patrón de "world model como herramienta" para agentes LLM: el agente (denominado Muse Spark en la model card) invoca una herramienta `simulate` que imagina las consecuencias de sus acciones antes de ejecutarlas. El repositorio ocupa 0,1 GB y se entrenó desde cero en una única sesión de Kaggle con 2 GPUs T4, lo que lo convierte en una referencia reproducible y de bajo coste para investigación en planificación basada en modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Predictor transformer de 6 capas sobre latentes de V-JEPA 2 (encoder ViT-L congelado, `facebook/vjepa2-vitl-fpc64-256`) + traductor latente→posiciones con tronco compartido y cabezas por mundo |
| Parametros totales | no disponible (el repositorio pesa 0,1 GB; el encoder V-JEPA 2 se descarga por separado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (opera sobre latentes de una secuencia de 64 fotogramas a 256 px según el encoder V-JEPA 2) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch `.pt`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo no lingüístico; procesa vídeo/imagen y vectores de acción) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`predictor.pt`, `translator.pt`); el encoder V-JEPA 2 se obtiene aparte desde HuggingFace |

## Arquitectura y entrenamiento

El pipeline es explícito en la model card: `frame → V-JEPA 2 (frozen) → latent → predictor (+ push) → latent → translator → positions`. El encoder V-JEPA 2 es un ViT-L de Meta que se mantiene congelado y actúa como extractor de representaciones espacio-temporales; no se entrena ni se ajusta. Sobre ese espacio latente se entrena un predictor autorregresivo de 6 capas de transformer que, dado el latente actual y un vector de empuje, estima el latente del estado siguiente. El traductor convierte el latente predicho en posiciones concretas mediante un tronco compartido entre dominios y una cabeza de salida por cada mundo (PushT, mesa 3D, billar 3D).

El entrenamiento se realizó desde cero en una única sesión de Kaggle con 2 GPUs T4, mediante el cuaderno `notebooks/train_and_evaluate.ipynb` del repositorio. No se documentan en la información disponible el número de tokens o muestras de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF, DPO o ajuste por preferencias (no aplicables de forma directa a un modelo de dinámica física). La innovación destacable es la compartición de un único predictor entre tres dinámicas distintas sin señal explícita de dominio, lo que sugiere que el espacio latente de V-JEPA 2 captura regularidades físicas transferibles entre escenarios.

## Capacidades

- Predicción de dinámica física en espacio latente: dado un estado visual y una acción de empuje, estima el estado siguiente sin simulación explícita de física.
- Generalización multi-mundo con un solo predictor: cubre PushT (2D), mesa 3D y billar 3D sin recibir la etiqueta del mundo.
- Traducción latente→posiciones con cabezas específicas por dominio para obtener coordenadas interpretables.
- Integración como herramienta (`simulate`) en un agente LLM (Muse Spark) para planificación basada en imaginación de consecuencias.
- Exposición mediante servidor MCP: `uv run jat mcp --world tabletop --wm hf:racoon25/jepa-as-a-tool/three-worlds`.
- Evaluación publicada de error de posición sobre empujes aleatorios retenidos por mundo y horizonte.
- No soporta generación de texto, código, matemáticas, visión descriptiva, tool calling genérico ni capacidades multilingües: es un componente de modelado de mundo, no un LLM.

## Casos de uso

- Planificación de agentes robóticos en entornos de manipulación: el agente puede invocar `simulate` para evaluar varios empujes candidatos antes de ejecutar el movimiento real, reduciendo ensayo y error en tareas de empuje de objetos.
- Investigación en model-based reinforcement learning: usar el predictor como modelo de transición latente para entrenar políticas en PushT o escenarios de mesa sin necesidad de un simulador físico completo.
- Prototipado de herramientas MCP para agentes: el repositorio expone un servidor MCP (`jat mcp`) que sirve como ejemplo reproducible de cómo envolver un world model como herramienta consumible por un LLM.
- Docencia y reproducción de experimentos: el cuaderno de entrenamiento en 2×T4 permite reproducir el pipeline completo (encoder congelado, predictor, traductor) con recursos de Kaggle, útil para cursos de representación auto-supervisada de vídeo.
- Evaluación de encoders de vídeo: sirve como banco de pruebas para medir cuánta información física retiene un encoder congelado tipo V-JEPA 2 al predecir consecuencias de acciones.
- Análisis de dominios de física de contacto: la comparativa de errores entre PushT, mesa y billar (y la caída en una habitación nunca vista) permite estudiar la transferencia y el coste de generalizar a geometrías nuevas.
- Simulación de bajo coste para previsualización: generar posiciones previstas tras varios empujes encadenados (1 a 4) para visualizar trayectorias sin un motor de física.

## Benchmarks y rendimiento

Error mediano de posición (px, mesa de 512 px) frente a la física real, sobre empujes aleatorios retenidos:

| Mundo | 1 empuje | 2 empujes | 3 empujes | 4 empujes |
|---|---|---|---|---|
| PushT | 3,5 | 4,7 | 5,6 | 5,6 |
| Tabletop | 3,8 | 5,6 | 7,8 | 9,2 |
| Billiards | 11,3 | 20,3 | 27,3 | 32,7 |
| Tabletop, habitación nunca vista | 32,5 | 36,3 | 33,0 | 35,8 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros), ya que el modelo no es lingüístico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio pesa 0,1 GB, pero hay que sumar el encoder V-JEPA 2 ViT-L descargado aparte, que domina el consumo de memoria.
- GPU de entrenamiento documentadas: 2 × NVIDIA T4 en una única sesión de Kaggle.
- GPU recomendadas para inferencia: no disponible; por el tamaño del encoder ViT-L se espera que quepa en GPUs consumer con suficiente VRAM (por ejemplo, RTX 3090/4090 de 24 GB), aunque el autor no lo confirma.
- Cabe en GPU consumer: probablemente sí para el predictor y el traductor; el encoder V-JEPA 2 ViT-L es el componente limitante y no se documenta su huella exacta.
- Opciones de despliegue: servidor MCP del propio repositorio (`uv run jat mcp --world <mundo> --wm hf:racoon25/jepa-as-a-tool/three-worlds`) con entorno gestionado por `uv`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| racoon25/jepa-as-a-tool | Predictor latente sobre V-JEPA 2 congelado | no disponible | no disponible (64 fotogramas, 256 px) | Error mediano 3,5–32,7 px según mundo y horizonte | MIT | HuggingFace + GitHub |
| facebook/vjepa2-vitl-fpc64-256 | Encoder de vídeo auto-supervisado (ViT-L) | no disponible en la información | 64 fotogramas, 256 px | no disponible | no disponible en la información | HuggingFace |
| Simuladores físicos clásicos (p. ej. MuJoCo, PyBullet) | Motor de física analítico | no aplica | no aplica | Depende del modelo físico; sin error de aprendizaje | Licencias variables | Ampliamente disponibles |

No se dispone en la información proporcionada de otros world models comparables con métricas equivalentes; la comparativa con alternativas de la misma categoría queda como no disponible.

## Limitaciones y advertencias

- Precisión limitada y degradación con el horizonte: el error crece de 3,5 a 5,6 px en PushT y de 11,3 a 32,7 px en billar entre 1 y 4 empujes.
- Fuerte caída fuera de distribución: en una habitación nunca vista, el error mediano se sitúa en 32,5–36,3 px, muy por encima de los mundos vistos.
- El billar es el dominio más difícil (errores de 11,3 px ya con un solo empuje), probablemente por colisiones y dinámicas más complejas.
- Dependencia total del encoder congelado V-JEPA 2: cualquier sesgo o limitación de representación del encoder se hereda y no se corrige.
- No es un modelo de lenguaje: no genera texto, no razona simbólicamente y no debe evaluarse con benchmarks de LLM.
- Entrenado en una única sesión de Kaggle con 2 × T4: escala de datos y cómputo modestas, con riesgo de sobreajuste a las distribuciones de los tres mundos.
- Sin datos publicados sobre sesgos, composición del dataset ni evaluación de robustez más allá de los empujes aleatorios retenidos.
- Licencia MIT: permite uso comercial, pero el encoder V-JEPA 2 se distribuye por separado y su licencia debe verificarse de forma independiente.
- Proyecto experimental con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/racoon25/jepa-as-a-tool
- Repositorio GitHub: https://github.com/RahulCHANDER25/jepa-as-a-tool
- Cuaderno de entrenamiento y evaluación: https://github.com/RahulCHANDER25/jepa-as-a-tool/blob/dev/notebooks/train_and_evaluate.ipynb
- Encoder V-JEPA 2 de Meta: https://huggingface.co/facebook/vjepa2-vitl-fpc64-256
