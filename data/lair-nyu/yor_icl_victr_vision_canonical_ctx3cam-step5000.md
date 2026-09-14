# lair-nyu/yor_icl_victr_vision_canonical_ctx3cam-step5000

## Resumen

Este repositorio contiene un checkpoint (paso 5000) de una politica robotica de vision-lenguaje-accion (VLA) denominada internamente `yor_icl_victr_vision_canonical_ctx3cam`, publicada por la organizacion `lair-nyu`. Segun su model card, se trata de un modelo `VICTR pi0.5` con contexto de retrieval de 3 camaras y `k=1`, retrieval basado en metrica visual, inicializado en caliente (warm start) desde el checkpoint `yor_icl_pi05_canonical_extended` en el paso 40000 y entrenado hasta el paso 5000 de este ajuste.

El modelo no es un modelo de lenguaje generativo al uso, sino una politica de control que consume observaciones visuales de tres camaras (y presumiblemente instrucciones en lenguaje, dado el prefijo `yor_icl`) y produce secuencias de acciones motrices. Su relevancia actual es de nicho: sirve como material de investigacion reproducible dentro del ecosistema `openpi`, el framework asociado a la familia pi0.5, y como punto de partida para experimentos de ajuste fino o de retrieval visual multicamara.

El repositorio ocupa 12,4 GB e incluye unicamente los pesos (`params/`), las estadisticas de normalizacion (`assets/norm_stats.json`) y los metadatos del checkpoint; el estado del optimizador se ha eliminado deliberadamente. Cargar el modelo requiere disponer del repositorio de entrenamiento `openpi` y de la configuracion concreta con la que se construyo, ya que el repositorio no incluye la arquitectura ni las transformaciones de datos. No se ha publicado informacion sobre licencia, idiomas, parametros totales ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible; se identifica como `VICTR pi0.5`, dentro de la familia de politicas VLA del ecosistema `openpi` |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible (el contexto de retrieval declarado es de 3 camaras con `k=1`; no se especifica ventana en tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible de forma explicita; el repositorio distribuye el directorio `params/` junto con `assets/norm_stats.json` y `_CHECKPOINT_METADATA` |
| Tamano del repositorio | 12,4 GB |
| Paso del checkpoint | 5000 |
| Checkpoint de origen (warm start) | `yor_icl_pi05_canonical_extended`, paso 40000 |
| Entradas declaradas | 3 camaras, con contexto de retrieval `k=1` y retrieval por metrica visual |
| Contenido incluido | `params/` (pesos), `assets/` (norm stats), `_CHECKPOINT_METADATA` |
| Contenido excluido | `train_state/` (estado del optimizador, aproximadamente 1,5 veces el tamano de `params/`) |
| Configuracion de entrenamiento requerida | `yor_icl_victr_vision_canonical_ctx3cam` en `openpi/src/openpi/training/config.py` |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. Lo que se puede afirmar con certeza es que se etiqueta como `VICTR pi0.5`, lo que lo situa en la familia pi0.5 del proyecto `openpi`, y que incorpora un mecanismo de retrieval sobre representaciones visuales: el nombre del checkpoint indica tres camaras de entrada y un contexto de retrieval `k=1`, con recuperacion basada en una metrica visual. Se trata, por tanto, de una politica VLA con un componente de recuperacion de informacion, no de un transformer de lenguaje puro.

El regimen de entrenamiento descrito en la model card es un ajuste fino con inicializacion en caliente desde el paso 40000 de `yor_icl_pi05_canonical_extended`, y este repositorio corresponde al paso 5000 de ese ajuste. No se especifican el numero de tokens, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o aprendizaje por imitacion supervisado. El repositorio hermano `lair-nyu/yor-icl-canonical-fast-tokenizer` apunta a una tokenizacion FAST (Frequency-space Action Sequence Tokenization) de secuencias de acciones ajustada sobre un dataset interno denominado `icl-dataset`, lo que sugiere que la pila completa utiliza tokenizacion de acciones, aunque no se confirma que este checkpoint concreto la emplee.

## Capacidades

- Generacion de acciones motoras: es una politica de control que traduce observaciones visuales (tres camaras) en secuencias de acciones, no un generador de texto.
- Percepcion visual multicamara: la configuracion declarada integra tres flujos de camara como entrada.
- Retrieval visual con contexto `k=1`: selecciona informacion de referencia mediante una metrica visual, lo que en principio permite condicionar el comportamiento en funcion de la observacion actual.
- Acondicionamiento por lenguaje: el prefijo `yor_icl` y el ecosistema `openpi` apuntan a politicas guiadas por instrucciones, pero la model card no lo confirma explicitamente para este checkpoint.
- Tool calling / function calling: no disponible; no consta soporte.
- Comportamiento agentico multi-paso: no disponible como capacidad documentada, mas alla del control secuencial implicito en una politica robotica.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, audio, vision generativa): no disponible.

## Casos de uso

- Manipulacion robotica bimanual guiada por lenguaje: el modelo puede actuar como politica end-to-end que consume tres camaras y emite acciones; es adecuado en entornos de laboratorio donde se dispone del repositorio `openpi` y de la configuracion de entrenamiento original.
- Recogida y colocacion (pick and place) en investigacion de robotica: al ser un checkpoint de una politica VLA, encaja como bloque de control en tareas de agarre y deposito sobre bancos de pruebas estandarizados, con la ventaja de que el retrieval visual `k=1` aporta un mecanismo explicito de condicionamiento por observacion.
- Baseline reproducible para comparar variantes de retrieval: el proyecto mantiene checkpoints con nombres paralelos (`yor_icl_victr_vision_expanded_full`, paso 49999), de modo que este modelo sirve para medir el efecto de la configuracion `canonical_ctx3cam` frente a otras variantes bajo la misma pila `openpi`.
- Ajuste fino sobre nuevas demostraciones: al estar inicializado en caliente y ser un checkpoint intermedio (paso 5000), es un punto de partida util para reentrenar con datos propios, siempre que se reconstruya el estado del optimizador, que no se incluye en el repositorio.
- Evaluacion de politicas con multiples camaras en simulacion: la entrada de tres camaras permite estudiar la contribucion de cada punto de vista en tareas de manipulacion, comparando el rendimiento con y sin cada flujo visual.
- Investigacion en recuperacion de informacion visual para control: el componente de retrieval por metrica visual es un objeto de estudio en si mismo, y este checkpoint permite analizar como afecta el valor `k=1` a la generalizacion ante cambios de iluminacion, posicion u oclusion.
- Despliegue en un servicio de politica local: mediante la API `policy_config.create_trained_policy` de `openpi` se puede instanciar la politica en un proceso servidor y conectarla a un robot o a un simulador a traves del protocolo del framework.
- Experimentos de tokenizacion de acciones: combinado con el tokenizador FAST publicado por la misma organizacion, permite estudiar el acoplamiento entre la tokenizacion de acciones y el rendimiento de la politica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, el repositorio ocupa 12,4 GB en disco, por lo que cargar los pesos en memoria exige al menos ese orden de magnitud, mas el espacio para activaciones y para los tres flujos de camara. Una GPU de 24 GB es el minimo razonable en precision de 16 bits; con precision de 32 bits el requisito crece y puede superar los 24 GB.
- GPU recomendadas: no se especifican en la informacion disponible. Por tamano del artefacto, son candidatas razonables una RTX 4090 o A10G de 24 GB para experimentacion, una L40S de 48 GB para servicio con margen, y A100 o H100 de 80 GB para lotes mayores o entrenamiento.
- Cabe en GPU de consumo: probablemente si, en tarjetas de 24 GB (RTX 3090, 4090) y con precision reducida; no confirmado por el autor.
- Opciones de despliegue: el unico camino documentado es `openpi` mediante `policy_config.create_trained_policy` con la configuracion `yor_icl_victr_vision_canonical_ctx3cam`. No consta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje con pesos en GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `lair-nyu/yor_icl_victr_vision_canonical_ctx3cam-step5000` (este) | no disponible | no disponible; 3 camaras, retrieval `k=1` | sin benchmarks publicados | no disponible | pesos en `params/`, requiere `openpi` y la config del autor |
| `lair-nyu/yor_icl_victr_vision_expanded_full` | no disponible | no disponible; config `yor_icl_victr_vision_expanded` | sin benchmarks publicados en la informacion disponible | no disponible | checkpoint en el paso 49999, mismos requisitos de `openpi` |
| `yor_icl_pi05_canonical_extended` (paso 40000) | no disponible | no disponible | no disponible | no disponible | checkpoint de origen usado para el warm start; no se han encontrado datos adicionales |
| `lair-nyu/yor-icl-canonical-fast-tokenizer` | no disponible (no es un modelo de politica, sino un tokenizador de acciones) | no aplica | no disponible | no disponible | publicado por la misma organizacion |

No se dispone de datos objetivos (parametros, contexto, benchmarks) de otros modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a los checkpoints hermanos del mismo proyecto.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia, no puede asumirse ningun derecho de uso comercial. Cualquier explotacion en produccion requiere aclarar previamente las condiciones con los autores.
- Dependencia estricta del repositorio `openpi`: el checkpoint no incluye la arquitectura ni las transformaciones de datos. Sin la configuracion `yor_icl_victr_vision_canonical_ctx3cam` del codigo de entrenamiento, los pesos no son cargables de forma fiable.
- No se puede reanudar el entrenamiento: el directorio `train_state/` (estado del optimizador) se ha eliminado explicitamente, por lo que continuar el ajuste exige reinicializar el optimizador.
- Checkpoint intermedio: corresponde al paso 5000 de un ajuste sobre un modelo ya entrenado hasta el paso 40000. No hay evidencia publicada de que sea el punto de convergencia; el repositorio hermano `expanded_full` llega al paso 49999.
- Sin validacion por la comunidad: 0 descargas y 0 likes en el momento de la consulta. No existen informes externos de reproducibilidad ni de rendimiento.
- Ausencia de documentacion sobre datos: no se describe la composicion del dataset de entrenamiento, su procedencia ni su cobertura geografica o demografica, lo que impide evaluar sesgos sistematicos.
- Riesgo de fallo en la ejecucion de acciones: en una politica VLA, un error de planificacion se traduce directamente en movimiento fisico. Cualquier despliegue sobre hardware real debe incorporar limites de parada, supervision humana y validacion en simulacion previa.
- Brecha simulacion-realidad: no hay informacion sobre el grado de similitud entre los datos de entrenamiento y entornos reales, ni sobre protocolos de evaluacion en robot fisico.
- Contexto de retrieval limitado a `k=1`: un unico ejemplo recuperado puede no cubrir variaciones relevantes de la tarea, y no se documenta como se selecciona ni como se depura ese contexto.
- Idiomas no declarados: no consta que las instrucciones de texto, si existen, esten soportadas en castellano u otros idiomas distintos del ingles.
- Capacidades no confirmadas: no hay evidencia de tool calling, razonamiento multi-paso explicito ni generacion de texto general. No debe tratarse como un modelo de lenguaje.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lair-nyu/yor_icl_victr_vision_canonical_ctx3cam-step5000
- Checkpoint relacionado (config `yor_icl_victr_vision_expanded`, paso 49999): https://huggingface.co/lair-nyu/yor_icl_victr_vision_expanded_full
- Tokenizador de acciones FAST de la misma organizacion: https://huggingface.co/lair-nyu/yor-icl-canonical-fast-tokenizer
- Repositorio de entrenamiento `openpi` (referenciado en la model card): https://github.com/Physical-Intelligence/openpi
- Laboratorio de vision por computador de NYU (organizacion asociada al prefijo `lair-nyu`): https://cims.nyu.edu/ai/areas/computer-vision/
- Articulo sobre modelado secuencial para modelos de vision a gran escala: https://arxiv.org/abs/2312.00785
