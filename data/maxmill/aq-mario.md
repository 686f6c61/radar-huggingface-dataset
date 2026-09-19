# maxmill/aq-mario

## Resumen

AQ-Mario es un modelo del mundo (world model) latente y condicionado por acciones, entrenado sobre secuencias de fotogramas y acciones de Super Mario Bros. 1-1. Lo publica el usuario maxmill en HuggingFace y corresponde al experimento `full3ep_pure_ema999` del proyecto AQ-Mario, cuyo codigo fuente esta en el repositorio GitHub de sachin1705s. No es un modelo de lenguaje ni un generador de imagenes: es un predictor de estados latentes futuros, es decir, aprende la dinamica del juego en un espacio de representacion comprimido en lugar de reconstruir pixeles RGB.

La arquitectura es EMA-JEPA (Joint-Embedding Predictive Architecture con un encoder objetivo actualizado por media movil exponencial, `ema_target=0.999`). El checkpoint contiene unos 9.801.795 parametros entrenables mas cabezas auxiliares, ocupa 133,5 MiB e incluye el state_dict del modelo JEPA, las cabezas auxiliares, el teacher EMA y el estado del optimizador AdamW. El entrenamiento fue de 41.160 pasos repartidos en 3 epocas.

Su relevancia es acotada y de caracter investigador: sirve como artefacto reproducible para estudiar representaciones latentes, planificacion basada en modelo y el comportamiento de un teacher EMA en un dominio de juguete. El propio autor advierte que la ejecucion no se presenta como un controlador de Mario resuelto, ya que los probes finales de posicion x/y/scroll y la puerta de acondicionamiento por accion no superan los umbrales definidos por el proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EMA-JEPA (world model latente condicionado por acciones, con encoder objetivo EMA) |
| Parametros totales | 9.801.795 parametros entrenables, mas cabezas auxiliares |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (opera sobre secuencias de fotogramas y acciones; no se especifica la ventana) |
| Tipos de cuantizacion | no disponible (checkpoint distribuido en precision de entrenamiento PyTorch) |
| Idiomas soportados | no aplica (modelo de vision/control sobre fotogramas de juego; sin modalidad de lenguaje) |
| Licencia | no disponible en la ficha de HuggingFace. La model card indica que el codigo fuente del proyecto es MIT, y que el checkpoint y los datos derivados quedan sujetos a los derechos y terminos aplicables al contenido del juego original |
| Formato de pesos | `.pt` (checkpoint PyTorch con `state_dict`, teacher EMA y estado de AdamW) |
| Tamano del repositorio | 0,1 GB (checkpoint final de 133,5 MiB) |
| Variante | pure JEPA con EMA target (`ema_target=0.999`) |
| Entrenamiento | 41.160 pasos, 3 epocas |
| Categoria en HuggingFace | reinforcement-learning |
| Libreria | pytorch |

## Arquitectura y entrenamiento

El modelo sigue el paradigma JEPA: en lugar de predecir fotogramas RGB, el encoder transforma observaciones en representaciones latentes y el predictor estima el estado latente futuro condicionado por la accion ejecutada. La variante empleada es "pure JEPA" con un encoder objetivo actualizado por media movil exponencial con coeficiente 0,999, un mecanismo habitual para estabilizar el objetivo de entrenamiento y evitar el colapso de representaciones. El checkpoint incluye, ademas del modelo principal, cabezas auxiliares y el estado completo del optimizador AdamW, lo que facilita reanudar o inspeccionar el entrenamiento, pero tambien implica que el fichero no es un export limpio de solo pesos.

El entrenamiento se realizo sobre observaciones derivadas de partidas de Super Mario Bros. 1-1, con un total de 41.160 pasos en 3 epocas. No se detalla en la informacion disponible el numero de tokens o fotogramas vistos, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables en este dominio). El repositorio incluye `metrics.jsonl` con las metricas de entrenamiento, `gate_by_epoch.json` con mediciones por checkpoint, `gates.json` con los resultados finales de representacion y acondicionamiento por accion, y `param_count.json` con el informe de parametros, lo que permite auditar el proceso. La model card indica explicitamente que los probes finales de x/y/scroll y la puerta de accion no alcanzan los umbrales del proyecto.

## Capacidades

- Prediccion de estados latentes futuros a partir de una secuencia de fotogramas y acciones en Super Mario Bros. 1-1.
- Aprendizaje autosupervisado de dinamicas de juego sin reconstruccion explicita de pixeles.
- Analisis de representaciones: el repositorio incluye sondas (probes) de posicion y desplazamiento para medir que informacion codifica el espacio latente.
- Acondicionamiento por accion: el modelo recibe la accion como entrada para condicionar la prediccion, aunque la puerta de accion final no supera los umbrales del proyecto.
- Soporte de planificacion basada en modelo: al predecir latentes, puede integrarse en bucles de busqueda o aprendizaje por refuerzo basado en modelo.
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas, vision general ni capacidades multilingues.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico multi-paso mas alla del uso como componente en un bucle de planificacion.
- No se documentan capacidades de audio, thinking mode ni multimodalidad fuera del par fotograma-accion.

## Casos de uso

- Investigacion en representaciones latentes: el checkpoint permite extraer embeddings de fotogramas y analizar, mediante los probes incluidos, cuanta informacion de posicion (x, y, scroll) conserva el espacio latente. Es adecuado porque el propio repositorio publica las mediciones de sonda por epoca.
- Planificacion basada en modelo (model-based RL): el predictor de latentes se puede utilizar dentro de un bucle de rollout imaginado para entrenar una politica en Super Mario Bros. 1-1 sin necesidad de simular pixeles, reduciendo coste computacional frente a un world model generativo en RGB.
- Estudio del colapso de representaciones y de teachers EMA: con `ema_target=0.999` y el encoder objetivo incluido en el checkpoint, sirve para experimentos comparativos sobre estabilidad de objetivos en arquitecturas JEPA.
- Generacion de rollouts latentes para aumento de datos: los latentes predichos pueden alimentar cabezas auxiliares o clasificadores auxiliares en experimentos de transferencia dentro del mismo dominio de plataformas.
- Reproducibilidad y docencia: al incluir `metrics.jsonl`, `gate_by_epoch.json` y `param_count.json`, es util como caso de estudio reproducible de un pipeline de world model pequeno (menos de 10 millones de parametros) para cursos o practicas de aprendizaje autosupervisado.
- Punto de partida para fine-tuning en otros niveles o juegos de plataformas 2D: el checkpoint es pequeno (133,5 MiB) y se puede reinicializar o continuar entrenamiento en dominios visualmente similares, siempre que se respeten los derechos del contenido original.
- Comparacion de arquitecturas de world models: sirve como referencia de linea base "pure JEPA con EMA" frente a variantes con reconstruccion o con objetivos contrastivos, en un entorno controlado de un solo nivel.
- Evaluacion de protocolos de sondas (probes): el conjunto de gates del proyecto permite replicar un protocolo de validacion de representaciones y de acondicionamiento por accion en un caso con resultado negativo documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas comparativas tipo MMLU, HumanEval o GSM8K (no aplicables a este dominio) y se limita a senalar que los probes finales de x/y/scroll y la puerta de accion no superan los umbrales del proyecto. Los ficheros `gates.json`, `gate_by_epoch.json` y `metrics.jsonl` del repositorio contienen las mediciones, pero sus valores no se reproducen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. El modelo tiene 9.801.795 parametros entrenables; en precision completa (fp32) los pesos ocupan aproximadamente 39 MB, y el checkpoint distribuido, que incluye teacher EMA y estado del optimizador, ocupa 133,5 MiB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria es suficiente; no se requiere A100 ni H100. Una GTX 1050, RTX 3050 o integrada moderna es mas que suficiente.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo actual e incluso en CPU para inferencia y analisis de representaciones.
- Opciones de despliegue: carga directa con PyTorch mediante `torch.load(..., map_location="cpu", weights_only=False)` sobre la clave `jepa` del checkpoint, o con el helper `aqmario.model.load_jepa` del arbol de codigo de AQ-Mario. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de latencia ni de fotogramas por segundo en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos numericos verificables de modelos comparables en la informacion proporcionada. Como lineas de trabajo relacionadas, y sin cifras confirmadas en esta busqueda, se pueden citar las familias JEPA (I-JEPA y V-JEPA) y los world models para control como Dreamer; sin embargo, no se han facilitado especificaciones de parametros, contexto, rendimiento ni licencia de esas alternativas en el material disponible, por lo que la comparacion cuantitativa queda como no disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AQ-Mario (EMA-JEPA) | 9.801.795 entrenables mas cabezas auxiliares | no disponible | Probes de x/y/scroll y puerta de accion por debajo de umbral (sin cifras publicadas) | no disponible en HuggingFace; codigo fuente MIT segun la model card | Checkpoint `.pt` publico en HuggingFace |
| I-JEPA | no disponible | no disponible | no disponible | no disponible | no disponible en esta informacion |
| V-JEPA | no disponible | no disponible | no disponible | no disponible | no disponible en esta informacion |
| Dreamer (world model para control) | no disponible | no disponible | no disponible | no disponible | no disponible en esta informacion |

## Limitaciones y advertencias

- No es un controlador resuelto: la propia model card indica que los probes finales de x/y/scroll y la puerta de acondicionamiento por accion no superan los umbrales del proyecto.
- Dominio extremadamente estrecho: entrenado unicamente sobre observaciones derivadas de Super Mario Bros. 1-1. No hay evidencia de generalizacion a otros niveles, juegos o dominios visuales.
- Riesgo de extrapolacion incorrecta: al operar en espacio latente, los errores de prediccion no son directamente inspeccionables como artefactos visuales, lo que dificulta detectar degradacion del modelo.
- Sin licencia declarada en la ficha de HuggingFace. La model card aclara que el codigo fuente es MIT, pero que el checkpoint y los datos derivados quedan sujetos a los derechos y terminos del contenido del juego original, lo que condiciona cualquier uso comercial.
- Sin afiliacion con Nintendo: el proyecto se declara independiente y no respaldado por Nintendo, lo que implica un riesgo legal relevante para uso en produccion.
- El checkpoint no es un export limpio de pesos: incluye cabezas auxiliares, teacher EMA y estado del optimizador AdamW, lo que aumenta el tamano y requiere filtrar claves al cargar.
- Ausencia total de benchmarks publicos y de cifras de latencia o throughput, lo que impide estimar su utilidad practica frente a alternativas.
- Sin soporte de lenguaje, multilingue, tool calling ni agentes; cualquier comparacion con modelos de lenguaje es inaplicable.
- Sesgos conocidos: no disponibles. No se documenta ningun analisis de sesgo, y en este dominio el concepto aplica de forma limitada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maxmill/aq-mario
- Repositorio de codigo AQ-Mario: https://github.com/sachin1705s/aq-mario
- Dataset de entrenamiento: https://huggingface.co/datasets/maxmill/aq-mario-smb1
- Video de preview del rollout: https://huggingface.co/maxmill/aq-mario/resolve/main/pure_jepa_ema.mp4
- Ficheros del repositorio: `jepa.pt`, `metrics.jsonl`, `gate_by_epoch.json`, `gates.json`, `param_count.json` (accesibles desde la pagina del modelo)
- Resultados de busqueda web: no se han encontrado resultados relevantes. Las unicas entradas devueltas corresponden a paginas de acceso de Deutsche Bank y no guardan relacion con el modelo.
