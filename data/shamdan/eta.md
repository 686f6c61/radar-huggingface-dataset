# shamdan/ETA

## Resumen

ETA (Efficiency through Thinking Ahead) es un conjunto de checkpoints para conducción autónoma end-to-end publicados por Shadi Hamdan y colaboradores (Chonghao Sima, Zetong Yang, Hongyang Li, Fatma Güney), vinculados al artículo arXiv 2506.07725 y al repositorio OpenDriveLab/ETA. El modelo resuelve la tarea de conducción autónoma cerrada en el simulador CARLA, concretamente la planificación y el control del vehículo a partir de entradas de percepción, dentro del pipeline del módulo `Ponderer` de la librería `carformer`.

El repositorio contiene dos variantes: ETA-base, con 371,1 millones de parámetros, y ETA-async, con 502,3 millones de parámetros. Ambas se distribuyen como pesos PyTorch (`.pt`) junto a su `config.json`, con un tamaño total de repositorio de 1,7 GB. La evaluación declarada por los autores se realiza sobre las 220 rutas del benchmark Bench2Drive.

Es relevante ahora porque se enmarca en la línea de modelos grandes de conducción end-to-end evaluados en benchmarks estandarizados de simulación, con licencia MIT para los pesos y el código, lo que facilita su reproducción y comparación. No obstante, la información pública disponible en el repositorio es escasa en cuanto a arquitectura detallada, datos de entrenamiento y resultados numéricos, por lo que muchas especificaciones quedan sin confirmar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (los autores la implementan en el módulo `Ponderer` de `carformer`; el paper se titula "Thinking Ahead, A Dual Approach") |
| Parámetros totales | ETA-base: 371,1 M / ETA-async: 502,3 M |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se publican pesos `.pt`; no hay versiones GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | no disponible (modelo de conducción autónoma; no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`best_model.pt`) + `config.json` |
| Pipeline declarado | robotics |
| Variantes incluidas | `ETA-base` (pesos de 742 MB), `ETA-async` (pesos de 1005 MB) |
| Benchmark de evaluación | Bench2Drive, 220 rutas |
| Repositorio | 1,7 GB |
| Descargas / likes | 0 descargas / 1 like |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna más allá de que el modelo se carga mediante la clase `Ponderer` del paquete `carformer` y de que el título del artículo describe un "enfoque dual" basado en "pensar por adelantado" (*thinking ahead*). No se especifican mecanismos concretos como tipo de transformer, atención lineal, decodificación especulativa ni componentes SSM o híbridos. Tampoco se documenta el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO, ya que se trata de un modelo de robótica y no de lenguaje.

Los únicos datos objetivos de entrenamiento y evaluación disponibles son indirectos: los checkpoints se distribuyen como resultado "best" (*best_model.pt*), lo que implica una selección por métrica de validación, y la evaluación se realiza sobre las 220 rutas de Bench2Drive dentro del simulador CARLA. El proyecto se apoya en código abierto de CARLA Garage y Bench2DriveZoo, y ha contado con financiación del Consejo Europeo de Investigación (ERC, ENSURE, 101116486), soporte de cómputo de Leonardo Booster (EuroHPC) y financiación de la NSFC y del Comité de Ciencia y Tecnología de Shanghái.

## Capacidades

- Conducción autónoma end-to-end en entornos simulados de CARLA.
- Planificación de trayectoria y control del vehículo dentro del pipeline de evaluación de Bench2Drive.
- Ejecución como módulo `Ponderer` integrado en la librería `carformer`.
- Dos variantes funcionales publicadas: ETA-base y ETA-async, lo que permite comparar configuraciones de distinto tamaño.
- Compatibilidad con el flujo de evaluación oficial del repositorio OpenDriveLab/ETA (`run_eval_leaderboard.py`).
- No se documentan capacidades de generación de texto, tool calling, function calling, razonamiento multi-paso, multilingüismo, visión generalista, audio ni modo de razonamiento explícito (*thinking mode*) en el sentido de los LLM.
- No se documenta soporte de agentes conversacionales ni uso fuera del dominio de conducción simulada.

## Casos de uso

- Reproducción de resultados académicos: cargar `ETA-base` o `ETA-async` y ejecutar la evaluación sobre las 220 rutas de Bench2Drive siguiendo `docs/TRAIN_EVAL.md`, con el objetivo de verificar las cifras publicadas en el artículo.
- Comparación de variantes por eficiencia: evaluar ETA-base (371,1 M parámetros) frente a ETA-async (502,3 M parámetros) en el mismo conjunto de rutas para medir la relación entre coste computacional y rendimiento de conducción.
- Desarrollo de planificadores de trayectoria: usar el checkpoint como referencia o línea base frente a nuevos módulos de planificación que se integren en el mismo entorno de evaluación CARLA.
- Ajuste fino con datos propios: al distribuirse bajo licencia MIT y en formato PyTorch, los pesos pueden reentrenarse o adaptarse a variantes del simulador o a configuraciones de sensores distintas.
- Validación previa a pruebas en pista: emplear el modelo en simulación para detectar fallos de planificación antes de trasladar estrategias a plataformas reales, reduciendo coste y riesgo.
- Integración en pipelines de investigación de conducción end-to-end: incorporar `Ponderer.from_pretrained(...)` como componente dentro de un sistema mayor de percepción-planificación en `carformer`.
- Docencia y formación: usar el par de checkpoints como ejemplo reproducible de evaluación de conducción autónoma en CARLA con un benchmark estandarizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente indica que el modelo se ha evaluado sobre las 220 rutas de Bench2Drive, pero no incluye métricas numéricas (por ejemplo, Driving Score, Success Rate ni puntuaciones del leaderboard de CARLA) ni comparaciones cuantitativas con otros sistemas.

## Requisitos de hardware

- VRAM estimada para ETA-base: los pesos ocupan 742 MB, lo que sugiere precisión de 16 bits para 371,1 M parámetros; con activaciones y buffers de inferencia, se puede asumir un consumo en el rango de 2 a 4 GB, aunque la cifra exacta no está confirmada.
- VRAM estimada para ETA-async: los pesos ocupan 1005 MB (coherente con 502,3 M parámetros en 16 bits); con activaciones, el rango esperable es de 3 a 5 GB, también sin confirmación oficial.
- GPU recomendadas: por tamaño, ambos checkpoints caben en GPUs de consumo como RTX 3060, RTX 3090, RTX 4080 o RTX 4090; en entornos de servidor, A100 o H100 resultan sobredimensionadas para la inferencia del modelo en sí, pero pueden ser útiles si se ejecuta en paralelo el simulador CARLA y varios procesos de evaluación.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 8 GB de VRAM, dado el tamaño de los pesos.
- Opciones de despliegue: no aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje; el despliegue se realiza con PyTorch y el stack de evaluación del repositorio OpenDriveLab/ETA sobre el simulador CARLA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos numéricos de modelos comparables en la información proporcionada. La comparación posible se limita a las dos variantes publicadas en este mismo repositorio:

| Modelo | Parámetros | Tamaño de pesos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ETA-base | 371,1 M | 742 MB (`.pt`) | no disponible | MIT | HuggingFace `shamdan/ETA` |
| ETA-async | 502,3 M | 1005 MB (`.pt`) | no disponible | MIT | HuggingFace `shamdan/ETA` |
| Otras alternativas de conducción end-to-end (UniAD, VAD, DriveTransformer, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de dominio específico: está diseñado para conducción autónoma en simulación (CARLA / Bench2Drive) y no es un modelo de propósito general; no debe esperarse generación de texto, código ni razonamiento simbólico.
- Validación exclusivamente en simulación: la evaluación declarada se limita a las 220 rutas de Bench2Drive, por lo que el comportamiento en entornos reales no está respaldado por los datos disponibles.
- Ausencia de métricas publicadas: no se ofrecen resultados numéricos en la model card, lo que dificulta valorar su rendimiento real sin ejecutar la evaluación.
- Documentación incompleta: no se detallan arquitectura, datos de entrenamiento, composición del dataset, número de tokens ni procesos de alineación, lo que limita la reproducibilidad del entrenamiento.
- Riesgo de sobreajuste al simulador: al no documentarse técnicas de generalización de dominio, existe riesgo de que el rendimiento no se transfiera a otras configuraciones de sensores o mapas.
- Idiomas: la fila de idiomas no aplica en el sentido habitual; no hay soporte multilingüe ni interfaz de lenguaje natural documentada.
- Sesgos: no se documentan análisis de sesgo; en conducción autónoma los sesgos potenciales estarían en la distribución de escenarios del dataset de entrenamiento, no especificada.
- Riesgo de alucinación: no aplica en el sentido de los LLM, pero sí existe riesgo de decisiones de planificación incorrectas o inseguras en escenarios fuera de la distribución de entrenamiento.
- Licencia: MIT, lo que permite uso comercial y modificación, pero conviene revisar las licencias de las dependencias (CARLA, Bench2Drive, CARLA Garage, Bench2DriveZoo) antes de un despliegue en producción.
- Cómputo y financiación: el proyecto declara financiación europea (ERC ENSURE, 101116486), EuroHPC (Leonardo Booster) y fuentes chinas (NSFC 62206172, Shanghái 23YF1462000); las opiniones del trabajo son responsabilidad exclusiva de los autores.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/shamdan/ETA
- Artículo en arXiv: https://arxiv.org/abs/2506.07725
- Repositorio de código y evaluación: https://github.com/OpenDriveLab/ETA
- Instrucciones de entrenamiento y evaluación: https://github.com/OpenDriveLab/ETA/blob/main/docs/TRAIN_EVAL.md
- Benchmark Bench2Drive: https://github.com/Thinklab-SJTU/Bench2Drive
