# jul879n/tde-es-en-lite-v2

## Resumen

tde-es-en-lite-v2 es un motor de decisiones tipadas construido sobre el encoder bidireccional intfloat/multilingual-e5-small, recortado a español e inglés y cuantizado a int8, con aproximadamente 42,5 millones de parámetros y solo 43 MB de pesos en disco. Lo publica el usuario jul879n bajo licencia MIT. No es un modelo generativo: no produce texto libre, sino que elige entre opciones que se le proporcionan (`choice`), puntúa una rúbrica (`score`) o estima si una proposición se desprende de un texto (`claim`), devolviendo probabilidades y con la posibilidad de abstenerse cuando la confianza no es suficiente.

El modelo resuelve tareas de clasificación de texto, clasificación zero-shot, clasificación de intención y NLI en un entorno de ejecución nativo escrito en Rust, sin Python en tiempo de ejecución y funcionando exclusivamente sobre CPU. La propuesta de valor es el coste operativo: alrededor de 15 ms por consulta en un solo hilo, un consumo de memoria de aproximadamente 90 MB RSS y la ausencia total de GPU, lo que lo hace apto para despliegues en dispositivos modestos o en pipelines de alta concurrencia donde un LLM resultaría desproporcionado.

Se distribuye como repositorio autocontenido en HuggingFace con los pesos ONNX int8, el binario `tde` para macOS Intel, el código fuente (Apache-2.0) y un script de instalación. Incluye un tokenizador propio en Rust verificado idéntico al de referencia de HuggingFace, reglas deterministas para negación y aritmética, y un mecanismo de autoaprendizaje por retroalimentación que no requiere reentrenar el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (base: intfloat/multilingual-e5-small), exportado a ONNX int8 |
| Parametros totales | ~42,5 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 |
| Idiomas soportados | español (es), inglés (en) |
| Licencia | MIT |
| Formato de pesos | ONNX (ejecucion via onnxruntime; binario nativo Rust) |
| Tamano del repositorio | 0,1 GB (43 MB de pesos) |
| Vocabulario | 54.358 tokens (recortado desde 250.002) |
| Memoria en ejecucion | ~90 MB RSS |
| Latencia medida | ~15 ms por consulta (i9-9880H, macOS Intel, 1 hilo, sin GPU) |
| Pipeline declarado | zero-shot-classification |
| Modelo base | intfloat/multilingual-e5-small |

## Arquitectura y entrenamiento

El modelo parte del backbone intfloat/multilingual-e5-small, un encoder bidireccional multilingüe. Sobre esa base se aplican dos transformaciones principales: el recorte del vocabulario de 250.002 a 54.358 tokens, orientado a los dos idiomas soportados, y la cuantización a int8 para su exportación a ONNX. El ajuste se realiza de forma contrastiva entre texto y etiqueta, anclado al modelo base para preservar el conocimiento del encoder original.

Los datos de ajuste son exclusivamente de licencia permisiva: Banking77 (intenciones bancarias), HuffPost News Category (temas de noticias) y Amazon polarity (polaridad de opiniones), según declara el autor. El repositorio también referencia multi_nli y MASSIVE/CLINC como conjuntos de evaluación. Existe una variante `plus` del mismo motor entrenada con más datos que obtiene mejores resultados (media de 0,57 frente a 0,65 en diez tareas), pero la presente variante `lite-v2` renuncia a ese rendimiento a cambio de mantener una licencia totalmente permisiva.

El motor incorpora innovaciones relevantes más allá del ajuste: un tokenizador propio en Rust con coincidencia exacta 4933/4933 respecto a la referencia de HuggingFace; reglas deterministas que descartan cláusulas negadas (y evitan elegir opciones negadas) y resuelven aritmética y edades entre fechas; y un mecanismo de autoaprendizaje vía `tde feedback` que almacena correcciones y las reutiliza como ejemplos en consultas posteriores con coste prácticamente nulo, sin modificar los pesos y por tanto sin riesgo de olvido catastrófico. El modo schema permite además definir preguntas fijas con cabezas dedicadas por pregunta (`heads.bin`).

## Capacidades

- Clasificación zero-shot mediante `choice`: selecciona la opción más probable entre un conjunto de etiquetas proporcionadas por el usuario (por ejemplo, `deportes|política|tecnología`).
- Puntuación de rúbricas mediante `score`: evalúa opciones con una escala basada en similitud coseno (escala 80) contra el prototipo de cada opción.
- Inferencia de desprendimiento lógico (NLI) mediante `claim`: determina si una afirmación se desprende de un texto, apoyándose en una cabeza NLI (`universal.bin`).
- Abstención explícita (`abstain`): el sistema puede rechazar responder cuando la confianza es insuficiente, lo que permite escalar al LLM los casos dudosos.
- Clasificación de intención y escenario en dominios conversacionales, con rendimiento medido sobre MASSIVE y CLINC150.
- Clasificación de emociones y temas, con rendimiento desigual (GoEmotions es un punto débil).
- Modo schema (`tde decide`): preguntas fijas con cabezas específicas por pregunta.
- Reglas deterministas de negación, aritmética y cálculo de edades entre fechas, con abstención cuando no pueden resolverse.
- Autoaprendizaje sin reentrenamiento mediante ejemplos de retroalimentación.
- Tokenizador propio en Rust, sin dependencia de Python en tiempo de ejecución.
- Servidor HTTP local (`tde serve`, `127.0.0.1:8787`, JSON) para integración desde aplicaciones web o scripts, con control de CORS mediante `--allow-origin`.
- Procesamiento multilingüe limitado a español e inglés.
- No genera texto libre en ningún modo.

## Casos de uso

- Enrutado de intenciones en asistentes conversacionales: con latencias de ~15 ms por consulta y 90 MB de memoria, el modelo puede clasificar la intención del usuario en cada turno antes de delegar en un LLM o en un backend específico, filtrando y reduciendo el coste de las llamadas al modelo grande.
- Moderación y etiquetado de contenido a gran escala: clasificación por tema o polaridad sobre flujos de comentarios o reseñas, procesable en CPU y en paralelo, sin necesidad de GPUs ni de infraestructura de inferencia pesada.
- NLI como paso de validación en pipelines RAG: comprobar si la respuesta generada por un LLM se desprende realmente del contexto recuperado, usando el modo `claim` y la abstención para marcar respuestas no sustentadas.
- Primer filtro en agentes de código: sobre peticiones, commits, logs o issues, el motor alcanza 0,71 de acierto con 3 ejemplos por opción (frente a 0,27 de la clase mayoritaria), lo que permite usarlo como clasificador previo con escalado al LLM cuando se abstiene.
- Cribado de tickets de soporte con schema dedicado: con 90 tickets es/en y cabezas por pregunta, reporta 0,908 de acierto y 0,911 de cobertura (cifra que incluye los 67 casos de entrenamiento, por lo que debe interpretarse con cautela).
- Procesamiento en el borde (edge computing) o en dispositivos sin GPU: 43 MB de pesos y un binario nativo Rust permiten desplegarlo en equipos de gama baja, contenedores ligeros o sistemas embebidos con x86.
- Detección de emociones en textos cortos: aunque el rendimiento es bajo (0,17 en GoEmotions sin ejemplos), el flujo de autoaprendizaje por retroalimentación permite adaptarlo progresivamente a un dominio concreto sin reentrenar.
- Integración en scripts o aplicaciones web mediante el servidor HTTP local, con origen configurable para desarrollo frontend.

## Benchmarks y rendimiento

Precisión zero-shot (sin ejemplos), respuesta forzada, 150 casos por tarea (±4 puntos), medidos contra Laya (421 M) y Laya-multilingual (322 M) en la misma máquina. La columna "respondidas" refleja la precisión sobre los casos respondidos usando la abstención por defecto, con la cobertura entre paréntesis.

| Tarea | n | Motor propio 0 ej. | Laya 0 ej. | Respondidas (cobertura) 0 ej. |
|---|---|---|---|---|
| NLI inglés sí/no (MNLI) | 150 | 0,81 | 0,78 | 0,86 (79%) |
| NLI español sí/no (XNLI) | 150 | 0,68 | 0,65 | 0,72 (85%) |
| Afirmación verdadera, 3 opciones | 150 | 0,72 | 0,69 | 0,72 (96%) |
| Intención MASSIVE en (60) | 150 | 0,47 | 0,42 | 0,58 (71%) |
| Intención MASSIVE es (60) | 150 | 0,42 | 0,32 | 0,50 (69%) |
| Intención CLINC150 (150) | 118 | 0,65 | no soportado | 0,70 (88%) |
| Escenario MASSIVE en (18) | 150 | 0,54 | 0,57 | 0,60 (81%) |
| Escenario MASSIVE es (18) | 150 | 0,47 | 0,42 | 0,58 (77%) |
| Emoción GoEmotions (28) | 150 | 0,17 | 0,38 | 0,29 (37%) |
| Tema AG News (4) | 150 | 0,77 | 0,96 | 0,78 (95%) |

Frente a Laya-multilingual (322 M), medido en la misma máquina y con las mismas filas, el modelo gana en 5 de 10 tareas: intenciones y escenarios de MASSIVE y MNLI de 3 opciones. Pierde en CLINC (0,65 frente a 0,69), MNLI (0,81 frente a 0,83), XNLI-es (0,68 frente a 0,74), AG News (0,77 frente a 0,96) y GoEmotions (0,17 frente a 0,35).

Resultados adicionales declarados por el autor:

| Evaluación | Resultado |
|---|---|
| Texto de desarrollo de software (100 casos, 5 tareas) | 0,47 acierto forzado sin ejemplos; 0,71 con 3 ejemplos por opción (clase mayoritaria 0,27) |
| Cabezas por schema (90 tickets de soporte es/en) | 0,908 acierto; 0,997 de las respondidas; 0,911 cobertura (incluye 67 casos de entrenamiento) |
| Media en 10 tareas (variante `plus`) | 0,65 frente a 0,57 de esta variante `lite-v2` |

## Requisitos de hardware

- VRAM: no requiere GPU. El modelo está diseñado para ejecutarse exclusivamente en CPU.
- Memoria RAM: aproximadamente 90 MB RSS en ejecución (medido con el binario `tde`, 1 hilo).
- Almacenamiento: 43 MB de pesos en disco; el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: ninguna. No se soporta aceleración por GPU en la variante medida.
- CPU de referencia: i9-9880H, 1 hilo, macOS Intel, sin GPU.
- Cabe en cualquier equipo de consumo: no necesita GPU dedicada ni tarjetas RTX, A100 o H100.
- Latencia: ~15 ms por consulta en la configuración medida. En comparación, Laya (421 M) reporta ~280 ms en CPU y Laya-multilingual (322 M) ~237 ms.
- Throughput: no disponible de forma explícita; dado que usa 1 hilo y ~90 MB, es escalable por procesos o hilos.
- Opciones de despliegue: binario nativo `tde` (Rust), servidor HTTP local (`tde serve`), ONNX Runtime 1.20.1 (descargado por `install.sh` con verificación SHA-256). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Compatibilidad de plataformas: solo verificado en macOS Intel. En Linux, Windows y Apple Silicon, `install.sh` compila desde el código fuente con Rust 1.82+ y no está verificado.

## Comparativa con modelos similares

| Modelo | Parámetros | Pesos en disco | Latencia CPU | Idioma principal | Licencia |
|---|---|---|---|---|---|
| tde-es-en-lite-v2 | ~42,5 M | 43 MB | ~15 ms | es, en | MIT |
| Laya | 421 M | 223 MB (medido) | ~280 ms (33 ms en GPU) | en | no disponible |
| Laya-multilingual | 322 M | 644 MB | ~237 ms (33 ms en GPU) | multilingüe | no disponible |

En igualdad de condiciones (mismas filas de evaluación, misma máquina), tde-es-en-lite-v2 supera a Laya en inglés en 7 de 10 tareas, pero pierde en escenario MASSIVE en, AG News y GoEmotions. Frente a Laya-multilingual gana en 5 de 10 tareas y pierde en las otras 5. La ventaja principal no es la precisión, sino la relación entre tamaño, latencia y consumo de memoria: es entre 5 y 15 veces más pequeño y en torno a 15-19 veces más rápido en CPU, con licencia MIT explícita y ejecución sin GPU.

## Limitaciones y advertencias

- No genera texto: solo elige entre opciones proporcionadas, puntúa o estima desprendimiento lógico. No es apto para tareas generativas.
- Rendimiento bajo en clasificación de emociones (0,17 sin ejemplos en GoEmotions, frente a 0,38 de Laya), lo que lo desaconseja para ese dominio sin ejemplos de apoyo.
- Rendimiento limitado en clasificación de intención en español (0,42 en MASSIVE es con 60 clases) y en clasificación de escenario (0,54 en inglés, 0,47 en español).
- En texto de desarrollo de software, solo con etiquetas no es fiable (0,47 sin ejemplos); requiere ejemplos por opción para ser útil.
- La cifra de 0,908 de acierto en tickets de soporte incluye 67 casos de entrenamiento escritos por el autor, por lo que está inflada respecto a un escenario real.
- Los benchmarks se han medido sobre 150 casos por tarea con una tolerancia de ±4 puntos y en una única máquina (i9-9880H, macOS Intel, 1 hilo), lo que limita la generalización de las cifras.
- Solo se ha verificado el despliegue en macOS Intel; Linux, Windows y Apple Silicon requieren compilación desde el código fuente y no han sido verificados.
- Idiomas soportados limitados a español e inglés; el vocabulario está recortado respecto al modelo base, lo que puede degradar otros idiomas.
- Riesgo de alucinación reducido por diseño (no genera texto y puede abstenerse), pero la abstención reduce la cobertura: en varias tareas queda entre el 69% y el 88%, y en GoEmotions solo el 37%.
- La licencia MIT del modelo es permisiva para uso comercial, pero el autor declara que solo se ha ajustado con datasets de licencia permisiva; conviene verificar las condiciones de los datasets subyacentes y del modelo base intfloat/multilingual-e5-small (MIT) antes de un despliegue comercial.
- El código fuente incluido en `src/` es Apache-2.0, distinto de la licencia MIT de los pesos.
- El modo de autoaprendizaje no modifica los pesos: las correcciones se guardan como ejemplos, por lo que no se produce olvido catastrófico, pero tampoco una mejora estructural del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jul879n/tde-es-en-lite-v2
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Repositorio de desarrollo (mencionado en la model card): `typed-decision-engine` (no se proporciona URL en la información disponible)
- Dataset nyu-mll/multi_nli (referenciado)
- Dataset mteb/banking77 (referenciado)
- Dataset heegyu/news-category-dataset (referenciado)
- Dataset fancyzhx/amazon_polarity (referenciado)
- ONNX Runtime 1.20.1: descargado automáticamente por `install.sh` con verificación SHA-256 (no se proporciona URL directa en la información disponible)
