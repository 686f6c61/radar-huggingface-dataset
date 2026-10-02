# haibo-lgi/CORD-PHM

## Resumen

CORD-PHM es un codificador (*encoder*) de representaciones para mantenimiento predictivo industrial, publicado por Haibo Li y Zhiguo Zeng (CentraleSupélec, Université Paris-Saclay). El nombre CORD responde a "Learning Reusable Degradation Representations Across Heterogeneous Physical Systems": el objetivo es aprender un espacio de representacion compartido entre sistemas fisicos de naturaleza muy distinta, en concreto rodamientos (bearings), baterias y herramientas de corte (milling), de forma que una misma red sirva como extractor de caracteristicas para tareas posteriores de pronostico, principalmente la estimacion de vida util remanente (RUL).

El modelo no es un modelo de lenguaje ni un modelo generativo: es un encoder especializado que opera sobre descriptores estructurados de estado de salud (*health-state descriptors*) de 26 caracteristicas, no sobre senal cruda. Combina interfaces de observacion especificas por tipo de sistema fisico con un backbone Transformer compartido de tamano muy reducido (96 dimensiones ocultas, 2 bloques, 4 cabezas de atencion) y un espacio de salida de 96 dimensiones. El checkpoint publicado ocupa 942.828 bytes.

La relevancia actual del trabajo esta en el planteamiento de reutilizacion cross-domain en PHM (*prognostics and health management*): en lugar de entrenar un modelo por activo y por dataset, CORD preentrena de forma auto-supervisada sobre 19 datasets fuente de tres tipos de sistema y publica un unico encoder multi-dominio reutilizable. El repositorio tiene 0 descargas y 1 *like* en el momento de la consulta, por lo que se trata de una publicacion reciente y con validacion comunitaria practicamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer sobre descriptores estructurados; stems locales/globales y adaptadores residuales especificos por tipo de sistema, con bloques Transformer, normalizacion final y proyector de observacion compartidos |
| Parametros totales | No disponible como cifra oficial; el checkpoint (942.828 bytes) implica del orden de 236.000 parametros si los pesos estan en fp32 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No es contexto en tokens: historial de 6 observaciones (IDM) mas una observacion objetivo; 64 slots locales por canal fisico |
| Tipos de cuantizacion | No disponible; solo se publica el checkpoint en punto flotante (.pt) |
| Idiomas soportados | No aplica / no disponible: el modelo consume series temporales y descriptores numericos, no texto |
| Licencia | other; `license_name: no-separate-model-license-specified` |
| Formato de pesos | State dict de PyTorch (`cord_multidomain_encoder.pt`), cargado con `torch.load(..., weights_only=True)` |

Parametros arquitectonicos declarados en la model card:

| Componente | Configuracion |
|---|---|
| Tamano del descriptor estructurado | 26 caracteristicas |
| Slots locales | 64 por canal fisico |
| Tamano oculto | 96 |
| Bloques Transformer | 2 |
| Cabezas de atencion | 4 |
| Tamano feed-forward | 192 |
| Cuello de botella del adaptador residual | 24 |
| Dropout | 0,1 |
| Ratio de mascara ISM | 0,3 |
| Historial IDM | 6 observaciones + 1 observacion objetivo |
| Tamano de salida | 96 |

## Arquitectura y entrenamiento

CORD separa la capa de observacion del backbone de representacion. Cada tipo de sistema fisico (rodamiento, bateria, herramienta de corte) dispone de sus propios stems local y global y de sus propios adaptadores residuales con cuello de botella de 24 dimensiones, de modo que cada dominio conserva su estructura de canales y su semantica de medida. Los bloques Transformer, la normalizacion final y el proyector de observacion son compartidos entre dominios. La atencion por canales tiene en cuenta la validez (`channel_mask` y `token_mask`), lo que permite tratar recuentos de canales variables entre activos y datasets.

El preentrenamiento es auto-supervisado con dos objetivos complementarios. El primero, *Intra-Observation Structure Modeling* (ISM), enmascara descriptores locales validos con un ratio de 0,3 y reconstruye sus componentes observados. El segundo, *Inter-Observation Dynamics Modeling* (IDM), predice el embedding de la siguiente observacion a partir de un historial de seis observaciones. El entrenamiento conjunto cubre 19 datasets fuente de los tres tipos de sistema. La coordinacion de gradientes entre dominios se realiza con CAGrad, con una correccion euclidea minima que impone un suelo direccional al gradiente del dominio de rodamientos antes del recorte y del optimizador AdamW. Los coeficientes de enrutamiento de ISM son 0,3 (rodamientos), 0,3 (baterias) y 1,0 (herramientas de corte), mientras que los gradientes de IDM mantienen su fuerza completa. La validacion fuente promedia ratios de perdida dentro de cada tipo de sistema y despues entre tipos, y se selecciona un unico checkpoint conjunto (experimento E37, brazo `joint_bearingfloor_cagrad`, epoca 545). Los checkpoints mono-dominio usados como control experimental se excluyen deliberadamente del repositorio.

Una innovacion destacable es el contrato de entrada explicito y la separacion explicita entre interfaces de observacion y backbone compartido, que permite transferir el encoder a tipos de sistema no vistos durante el preentrenamiento (el caso del motor turbofan, completamente ausente de la fase fuente). Como contrapartida, el modelo no usa *patch size* sobre senal cruda: opera exclusivamente sobre descriptores estructurados.

## Capacidades

- Extraccion de caracteristicas: genera un embedding de 96 dimensiones por observacion (`embedding`) y representaciones locales por slot (`local_hidden`, `[batch, 64, 96]`).
- Soporte multi-dominio nativo: acepta el argumento `domain` con los valores `bearing`, `battery` o `milling`.
- Manejo de canales variables: la atencion consciente de validez permite lotes con distinto numero de canales fisicos y slots locales validos.
- Modelado temporal: el objetivo IDM condiciona la representacion sobre un historial de seis observaciones, lo que da al encoder sensibilidad a la dinamica de degradacion.
- Transferencia a tipos de sistema no vistos: la evaluacion del paper contempla un escenario con un tipo fisico completo (turbofan) excluido del preentrenamiento.
- Aprendizaje auto-supervisado: ISM e IDM no requieren etiquetas de RUL durante el preentrenamiento.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje y no expone interfaz conversacional.

## Casos de uso

- Estimacion de vida util remanente en rodamientos: el encoder produce un vector de 96 dimensiones por ventana de observacion que se puede alimentar a una cabeza de regresion temporal especifica del dataset, tal como hace el paper con cabezas *target-aware*.
- Pronostico de estado de salud en baterias: usando la interfaz de dominio `battery`, el mismo encoder reutilizado sirve para tareas de degradacion de celdas sin reentrenar el backbone desde cero.
- Desgaste de herramientas de corte en fresado: el dominio `milling` cubre utillaje de mecanizado, con lo que se puede monitorizar vida util de herramienta dentro de una linea de produccion.
- Arranque en frio sobre un activo de un tipo no visto: el escenario de turbofan descrito en el paper demuestra la utilidad del encoder como inicializacion cuando solo se dispone de datos de adaptacion limitados del nuevo tipo de sistema.
- Pipeline de feature engineering para modelos clasicos: las representaciones de 96 dimensiones pueden alimentar regresores o clasificadores ligeros (gradient boosting, regresion ridge) en lugar de ingenieria manual de caracteristicas sobre senales de vibracion o corriente.
- Agrupacion y deteccion de regimenes de degradacion: el embedding compartido permite comparar estados de salud entre activos heterogeneos dentro de una misma planta, util para segmentacion no supervisada de fases de degradacion.
- Monitorizacion multi-activo con un unico modelo: al mantener un solo checkpoint conjunto para los tres dominios, se reduce el coste de MLOps frente a mantener un modelo por familia de activos.
- Evaluacion comparativa de metodos PHM: sirve como baseline de representacion preentrenada frente a enfoques supervisados por dataset, en los dos limites de transferencia definidos en el paper.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe cualitativamente la evaluacion del paper en dos fronteras de transferencia (tipos de sistema incluidos en el preentrenamiento y tipos excluidos, con el turbofan como caso ausente), pero el texto disponible se interrumpe antes de ofrecer cifras concretas. No se dispone de valores de metricas como MAE, RMSE, *score* de PHM ni comparaciones numericas con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB. El checkpoint pesa 942.828 bytes (aproximadamente 0,9 MB) y el tamano oculto es de 96 dimensiones, por lo que cabe holgadamente en cualquier acelerador.
- GPU recomendadas: no se requiere GPU. Cualquier GPU consumer (por ejemplo, RTX 3060, RTX 4090) es sobredimensionada; tambien es viable una iGPU o incluso CPU.
- Ejecucion en CPU: si, es el escenario natural dado el tamano del modelo. El ejemplo `example_load.py` del repositorio carga el checkpoint con `map_location="cpu"`.
- Opciones de despliegue: PyTorch nativo (requisito `pip install torch huggingface_hub`). No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje y no se distribuyen pesos en GGUF. La exportacion a TorchScript u ONNX no esta documentada.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia ni de rendimiento por lote.
- Almacenamiento: el repositorio ocupa aproximadamente 0,9 MB, dominado por el checkpoint.

## Comparativa con modelos similares

No disponible. En la informacion proporcionada no se identifican checkpoints publicos directamente comparables: CORD-PHM no es un modelo de lenguaje ni un modelo de prediccion de series temporales generalista, sino un encoder de representacion especifico de PHM que consume descriptores estructurados de 26 caracteristicas y devuelve embeddings de 96 dimensiones. El propio repositorio excluye intencionadamente los checkpoints mono-dominio que podrian servir como control, y no se ofrecen cifras de rendimiento frente a otros metodos. Por tanto, no es posible construir una tabla comparativa con parametros, contexto, rendimiento y licencia de alternativas sin inventar datos.

## Limitaciones y advertencias

- No incluye cabeza de prediccion de RUL: el checkpoint publicado contiene unicamente el encoder. Cualquier uso productivo exige entrenar una cabeza *target-aware* especifica por tipo de sistema y dataset.
- Entrada rigida: el modelo no consume senal cruda. Requiere descriptores estructurados de exactamente 26 caracteristicas, 64 slots locales por canal y el argumento `domain` restringido a `bearing`, `battery` o `milling`. Cualquier preprocesado que produzca otro formato invalida el uso del checkpoint.
- Cobertura de dominios limitada: solo tres tipos de sistema fisico estan representados durante el preentrenamiento. Otros activos (motores, bombas, compresores, turbinas) entran en el escenario de adaptacion, con la incertidumbre que ello implica.
- Licencia ambigua: la licencia declarada es `other` con `license_name: no-separate-model-license-specified`, sin terminos especificos publicados. Esto supone un riesgo juridico para uso comercial y para redistribucion, y deberia aclararse con los autores antes de cualquier despliegue en produccion.
- Ausencia de benchmarks publicos: no hay cifras verificables de rendimiento en la informacion disponible, lo que impide estimar el beneficio real frente a alternativas supervisadas.
- Validacion comunitaria nula: 0 descargas y 1 *like* en el momento de la consulta, con un unico checkpoint publicado y sin variantes cuantizadas ni versiones reducidas.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de extrapolacion silenciosa. Como cualquier encoder de representacion, puede producir embeddings con apariencia valida para regimenes de operacion fuera de la distribucion de los 19 datasets fuente, sin senalizacion explicita de incertidumbre.
- Sesgos de datos: el comportamiento del encoder hereda la composicion de los 19 datasets fuente. No se detalla en la informacion disponible la distribucion de regimenes de carga, condiciones ambientales, velocidades de muestreo ni fabricantes, por lo que no puede evaluarse el sesgo de dominio.
- Dependencia de codigo externo: la carga del modelo requiere la clase `JointModel` definida en `joint_model.py` y los ficheros de configuracion del proyecto, no incluidos de forma evidente en el repositorio de HuggingFace. La verificacion recomendada es `python example_load.py` con entradas sinteticas.
- Riesgo de integridad: la model card publica un SHA256 (`09422359745CF47C69D94A241D92B9018A940A9DCBCC7804A3D08C86A2485103`) que conviene verificar antes de cargar el checkpoint en un entorno de produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/haibo-lgi/CORD-PHM
- Paper en arXiv: https://arxiv.org/abs/2609.39784
- DOI: https://doi.org/10.48550/arXiv.2609.39784
- Codigo de entrenamiento y evaluacion: https://github.com/HelpLee/CORD-PHM
- Perfil de autor en HuggingFace: https://huggingface.co/haibo-lgi

Nota sobre los resultados de busqueda web: las entradas recuperadas (sitio corporativo haibo.ai, listado general de modelos de HuggingFace, perfil de Google Scholar de un investigador homonimo y una revision sobre LLM aplicados a PHM en Springer) no aportan informacion adicional verificable sobre este checkpoint concreto y no se han utilizado como fuente de datos tecnicos.
