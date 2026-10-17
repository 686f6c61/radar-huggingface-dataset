# shrg7/pi05-oer10pick-droid-globalnorm-fullft-ki-b512-lr5e5-h16-wu1k-ema99-droidft-urma-10k

## Resumen

`shrg7/pi05-oer10pick-droid-globalnorm-fullft-ki-b512-lr5e5-h16-wu1k-ema99-droidft-urma-10k` es un checkpoint de investigación de tipo VLA (vision-language-action) para robótica de manipulación, publicado por el usuario `shrg7` en Hugging Face. Se trata de un ajuste fino completo de `pi05_base` dentro del ecosistema **openpi** (implementación en JAX de los modelos pi0/pi0.5), es decir, una política que recibe imágenes e instrucciones en lenguaje natural y emite acciones motoras continuas. El checkpoint corresponde al update 9.999 (10.000 pasos de optimizador) de un entrenamiento previsto hasta 100.000 pasos, por lo que es un estado intermedio, no un modelo final.

La aportación técnica diferencial es doble. Por un lado, el modelo incorpora **URMA**, una red pequeña que lee una tabla de descripción del robot (hasta 8 articulaciones y 27 valores por articulación: límites articulares, apertura de pinza, etc.) y la inyecta como condicionamiento en el experto en acciones, de modo que una sola política sabe qué robot está controlando. Por otro, se entrena con un objetivo dual de "knowledge insulation" (cabeza de tokens FAST + experto de flow matching) sobre una mezcla de DROID (77,7 % de los episodios) y simulaciones multirrobot OER-10 (22,3 %).

Es relevante ahora porque aborda dos problemas abiertos en robótica con modelos fundacionales: la transferencia entre embodiments distintos y la preservación del conocimiento del VLM base al aprender control. Ahora bien, se publica sin licencia declarada, sin métricas de éxito y con cero descargas, así que debe tratarse como material experimental de laboratorio. El repositorio ocupa 12,5 GB e incluye pesos en formato Orbax, estadísticas de normalización y la tabla de descripciones de robots.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA derivada de pi0.5 (openpi, JAX): modelo visión-lenguaje con experto en acciones por flow matching y cabeza FAST de tokens de acción; acondicionamiento por embodiment mediante red URMA |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (horizonte de acción configurado: 16 pasos) |
| Tipos de cuantización | no disponible; no se publican versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible; las instrucciones del dataset aparecen en inglés ("Pick up the X") |
| Licencia | no disponible (no declarada en la model card ni en los metadatos) |
| Formato de pesos | Orbax (JAX) en `params/`; estadísticas de normalización en `assets/`; tabla de robots en `oer10_urma_v1/robot_descriptions_v1.npz` |
| Tamaño del repositorio | 12,5 GB (sin estado del optimizador) |
| Pipeline declarado | robotics |
| Checkpoint | paso 9.999 = 10.000 updates de un total previsto de 100.000 |
| Pesos publicados | media móvil exponencial (EMA, decay 0,99) |
| Inicialización | `pi05_base`, ajuste fino completo; capas URMA inicializadas desde cero con capa de salida a cero |
| Hardware de entrenamiento | 4× NVIDIA H200 con FSDP grado 4 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura pi0.5 de openpi: un backbone visión-lenguaje que procesa observaciones visuales e instrucciones textuales, acoplado a un "action expert" que genera secuencias de acciones continuas mediante flow matching. A esto se añade una cabeza FAST que predice acciones tokenizadas; el objetivo dual (cabeza FAST + experto de flow matching) es lo que el autor denomina *knowledge insulation*, una receta pensada para que el ajuste fino en control no degrade el conocimiento del VLM original. Sobre esa base se inserta URMA, una red auxiliar que transforma la tabla de descripción del robot (hasta 8 articulaciones × 27 valores) en un vector de condicionamiento para el experto en acciones. La fila correspondiente a cada robot se selecciona mediante una huella (*fingerprint*) de la cadena `embodiment_params` del episodio, y la tabla completa de todos los robots de entrenamiento se distribuye en el `.npz` del repositorio.

El ajuste fino parte de `pi05_base` y emplea una mezcla de dos fuentes medida en número de episodios: DROID con un 77,7 % y las builds de simulación multirrobot OER-10 con un 22,3 %; no se incluyen MolmoBot ni realrig9k. En las simulaciones OER-10 los episodios se recortan justo después del agarre (tarea "Pick up the X"), mientras que DROID se mantiene completo. La normalización se resuelve con una única tabla de cuantiles global sobre toda la mezcla, almacenada en `assets/`. La receta de entrenamiento incluye 1.000 pasos de warmup, learning rate plano de 5e-5, EMA de 0,99, horizonte de acción 16 y batch efectivo de 512 (256 × 2 acumulados) hasta el paso 2.000, momento en el que baja a 256 —pese a que el nombre de la configuración sigue indicando `b512`—. El checkpoint publicado no incluye estado del optimizador.

## Capacidades

- Manipulación condicionada por lenguaje: ejecuta instrucciones del estilo "Pick up the X" emitiendo acciones continuas con horizonte de 16 pasos.
- Control multi-robot con una sola política: el condicionamiento URMA le permite adaptar el comportamiento a distintos robots siempre que su descripción esté en `robot_descriptions_v1.npz`.
- Uso de metadatos físicos del robot (límites articulares, apertura de pinza y otros hasta 27 valores por articulación) como entrada explícita, no solo como observación implícita.
- Inferencia de acciones por flow matching, con cabeza FAST de tokens de acción como parte del objetivo de entrenamiento dual.
- Conservación del conocimiento del VLM base como objetivo de diseño (knowledge insulation); no hay evaluación publicada que lo cuantifique.
- Entrada multimodal: imágenes de cámara más instrucción textual.
- No se documentan tool calling, uso de agentes, razonamiento multi-paso explícito, matemáticas ni generación de código: es una política de robótica, no un asistente conversacional.
- No se documenta soporte multilingüe, ni salidas de audio o texto libre.

## Casos de uso

- **Agarre de objetos en una celda DROID/Franka**: el modelo recibe la imagen de la escena y la instrucción "Pick up the X", y devuelve 16 acciones que se ejecutan en bucle cerrado reobservando tras el bloque. Es el escenario más alineado con el 77,7 % de los datos.
- **Transferencia entre robots de laboratorio**: al condicionar por la tabla URMA, un mismo servidor de política puede atender un robot de 6 ejes y otro de 7 con pinza distinta, cambiando únicamente la fila de descripción asociada al `embodiment_params`.
- **Ablación de normalización global frente a normalización por robot**: el checkpoint sirve como referencia para medir el coste de usar una única tabla de cuantiles sobre una mezcla heterogénea de embodiments.
- **Estudio de knowledge insulation**: comparar la retención de capacidades del VLM base entre este objetivo dual (FAST + flow matching) y un ajuste fino solo con flow matching.
- **Punto de partida para fine-tuning de una tarea concreta**: al ser un ajuste completo sobre `pi05_base` con 10.000 updates, es una inicialización razonable para especializar en una tarea nueva con pocos datos, siempre que el robot esté cubierto por la tabla.
- **Validación de la etapa de pick en pipelines de pick-and-place**: como los episodios simulados se cortan tras el agarre, el modelo es útil como módulo de aproximación y cierre de pinza que se encadena con un planificador de transporte o colocación.
- **Reproducibilidad de la receta de entrenamiento**: el nombre del checkpoint codifica hiperparámetros (LR 5e-5, warmup 1k, EMA 0,99, horizonte 16), lo que facilita replicar la configuración en openpi, teniendo en cuenta que el batch real cae a 256 tras el paso 2.000.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito en DROID, métricas de simulación OER-10, ni evaluaciones de retención del VLM base, y el repositorio acumula 0 descargas y 0 likes en el momento de redactar esta ficha.

## Requisitos de hardware

- **Peso en disco**: 12,5 GB para el repositorio completo (solo parámetros y assets, sin estado del optimizador).
- **Entrenamiento**: 4× NVIDIA H200 con FSDP grado 4, según la model card; no es viable reproducirlo en una sola GPU consumer.
- **VRAM de inferencia**: no hay cifra oficial. Como referencia, los pesos ocupan del orden de 12,5 GB, por lo que el modelo debería caber en una GPU de 24 GB (por ejemplo, RTX 4090) siempre que se sirva en la misma precisión y se reserve margen para activaciones y preprocesado de imagen; para servicio con réplicas o mayor resolución conviene ir a 40-80 GB (A100, H100, L40S).
- **GPU recomendadas**: H100 o A100 80 GB para despliegue en producción; L40S 48 GB como alternativa intermedia; RTX 4090 24 GB solo para pruebas puntuales.
- **Opciones de despliegue**: scripts de servicio de openpi en JAX (`serve_policy` y utilidades asociadas), cargando el checkpoint Orbax desde `params/` junto con `assets/`. No es compatible con vLLM, TGI, llama.cpp ni Ollama, al no existir pesos en formatos GGUF o safetensors estándar.
- **Latencia y throughput**: no disponibles. En políticas VLA el límite práctico suele ser la frecuencia de control del robot, no el throughput de tokens; no se ha publicado ninguna medición.

## Comparativa con modelos similares

| Modelo | Tipo | Datos de entrenamiento | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`shrg7/pi05-...-urma-10k`) | Ajuste completo de pi0.5 + URMA, JAX | DROID 77,7 % + OER-10 sim 22,3 % (pick-only) | Pick condicionado por lenguaje, multi-robot | no disponible | Hugging Face, 0 descargas |
| `pi05_base` (openpi) | VLA base pi0.5, JAX | no disponible en esta ficha | Política generalista preentrenada | no disponible en esta ficha | Repositorio openpi |
| Checkpoints pi0 / pi0-FAST sobre DROID (openpi) | VLA pi0, JAX | DROID | Manipulación generalista en DROID | no disponible en esta ficha | Repositorio openpi |
| OpenVLA y variantes (referencia del campo) | VLA open source basado en VLM | no verificado en esta ficha | Manipulación generalista | no disponible en esta ficha | Hugging Face / GitHub |

La comparación útil aquí es de receta, no de números: frente a los checkpoints pi0/pi0.5 estándar, este modelo añade el condicionamiento URMA por embodiment y una normalización global única, y limita la parte simulada a la fase de agarre. No se dispone de métricas públicas que permitan afirmar que supera a sus alternativas en tasa de éxito.

## Limitaciones y advertencias

- **Checkpoint intermedio**: solo se han completado 10.000 de los 100.000 updates previstos; el rendimiento puede mejorar sustancialmente en estados posteriores del mismo run.
- **No se puede reanudar el entrenamiento de forma exacta**: el repositorio no incluye el estado del optimizador, solo los pesos EMA.
- **Tarea limitada en simulación**: los episodios OER-10 se cortan tras el agarre, por lo que en esos embodiments el modelo no aprende a transportar ni colocar; DROID sí se conserva completo, lo que genera una asimetría entre fuentes.
- **Dependencia estricta de la tabla de robots**: si el `embodiment_params` de un robot no tiene fila en `robot_descriptions_v1.npz`, el condicionamiento URMA queda fuera de distribución y el comportamiento no está garantizado.
- **Normalización global única**: una sola tabla de cuantiles sobre robots con rangos de acción muy distintos puede comprimir la señal de algunos embodiments; el autor no publica ablaciones que lo descarten.
- **Riesgo de sobreajuste a DROID**: casi cuatro quintos de los episodios provienen de un mismo entorno de laboratorio, con su cámara y su robot, lo que puede reducir la generalización a otras escenas.
- **Sin licencia declarada**: no se puede asumir uso comercial; además, el modelo deriva de `pi05_base` y arrastra las condiciones que su licencia original imponga, que aquí no se detallan.
- **Sin evaluación publicada**: cero descargas, cero likes y ninguna métrica de éxito, retención o robustez. Cualquier afirmación de rendimiento sería especulativa.
- **Idioma no documentado**: las instrucciones del dataset están en inglés; no hay evidencia de comportamiento con instrucciones en castellano.
- **Alucinación en el sentido de acciones plausibles pero incorrectas**: al no haber verificación perceptual explícita, el modelo puede ejecutar un agarre sobre el objeto equivocado sin señal de error. En robótica real esto implica riesgo físico.
- **Despliegue en robot real**: requiere parada de emergencia, límites articulares externos y supervisión; no debe operarse en entornos no controlados.
- **Nomenclatura engañosa**: el nombre de la configuración indica `b512` aunque el batch efectivo baja a 256 tras el paso 2.000, lo que puede inducir a error al replicar el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shrg7/pi05-oer10pick-droid-globalnorm-fullft-ki-b512-lr5e5-h16-wu1k-ema99-droidft-urma-10k
- Repositorio openpi (referenciado por los tags del modelo): https://github.com/Physical-Intelligence/openpi
- Rama y commit citados en la model card: rama `pi05-oer10-urma`, commit `37764198`
- No se han encontrado en la información disponible artículos, blogs, demos ni informes técnicos adicionales.
