# SohamW11/rosfix-assist

## Resumen

rosfix-assist es el asistente de corrección integrado en rosfix, un analizador estático para configuraciones silenciosas erróneas de ROS 2. Lo desarrolla SohamW11 y se publica bajo licencia Apache-2.0. No es un modelo de lenguaje generativo: es un ranker de texto extremadamente compacto que, ante un hallazgo sin corrección mecánica (por ejemplo, un parámetro `max_lin_vel` en un nodo que declara `max_linear_velocity`), ordena el conjunto cerrado de nombres válidos del workspace —parámetros declarados, joints, frames, ejecutables, controladores— y elige una opción o se abstiene.

La arquitectura es un MLP de 16 características de cadena construidas a mano (16→16→1 con tanh) con softmax sobre las opciones más una puntuación fija de "ninguna de estas". El modelo completo ocupa unos 1,3 KB en f32 (289 pesos y 32 constantes de normalización) y se compila dentro del binario de rosfix en Rust puro, sin runtime de ML, sin GPU y sin red. Es relevante porque demuestra que la asistencia de reparación en herramientas de análisis estático puede resolverse con un modelo de ranking minúsculo, verificable y determinista, en lugar de recurrir a un LLM.

La verificación es parte del diseño: cada elección se reanaliza sobre el workspace y solo se escribe con `rosfix fix --write --accept-assist`. El modelo nunca genera texto libre, lo que acota el riesgo de ediciones incorrectas en configuraciones de robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP 16→16→1 (tanh) sobre 16 características de cadena por opción; softmax sobre opciones más puntuación fija de abstención |
| Parametros totales | 289 pesos + 32 constantes de normalización (≈1,3 KB en f32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: entrada por pares de cadenas y conjunto cerrado de opciones) |
| Tipos de cuantizacion | no disponible (pesos f32 embebidos en el binario; no se publican variantes GGUF ni similares) |
| Idiomas soportados | en (inglés; identificadores de ROS 2) |
| Licencia | Apache-2.0 (el repositorio rosfix se ofrece bajo Apache-2.0 o MIT, a elección) |
| Formato de pesos | Código Rust (`learned_weights.rs` y `learned.rs`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un perceptrón multicapa de una capa oculta (16→16→1 con activación tanh) que puntúa cada opción candidata a partir de 16 características calculadas por opción: distancia de edición y de transposición, solapamiento de 2-gramas y 3-gramas de caracteres, solapamiento de palabras tras expandir abreviaturas de ROS (`vel`→`velocity`, `freq`→`frequency`), coincidencia de prefijo y sufijo, cobertura de abreviatura (subsecuencia y prefijo de palabra), ratios de longitud y número de palabras, y el rango y margen de la opción bajo similitud léxica. Las puntuaciones pasan por un softmax sobre las opciones más una puntuación fija para "ninguna de estas", lo que implementa la abstención.

Los datos de entrenamiento son sintéticos pero derivados de nombres reales: parámetros y ejecutables que declaran paquetes upstream de ROS 2 (Nav2, ros2_controllers, ros2_control, slam_toolbox, robot_localization, entre otros; ramas Humble, Jazzy y Kilted), extraídos de los knowledge packs de rosfix. Esos nombres se corrompen como se equivoca la gente en la práctica: erratas simples y dobles, abreviaturas, abreviatura más errata, palabras eliminadas o intercambiadas, camelCase y plurales. Se añaden casos de "respuesta ausente", con el nombre correcto eliminado de las opciones y nombres no relacionados, para enseñar la abstención.

La partición es por paquete y por nombre en 5 folds: un fold se usa para test, el siguiente para calibración y el resto para entrenamiento; se descarta cualquier caso de test cuyo nombre aparezca también en entrenamiento. El modelo publicado corresponde al fold 0, con 5.619 casos de entrenamiento, 1.370 de calibración y 1.791 de test (más 4.671 casos de test excluidos por compartir nombre con el entrenamiento). El entrenamiento se hizo en Rust puro (`rosfix-train`), con 40 épocas de Adam.

## Capacidades

- Ranking de valores de reparación: ordena un conjunto cerrado de nombres válidos y selecciona el más probable para un identificador erróneo.
- Abstención explícita: devuelve "ninguna de estas" cuando la respuesta correcta no está entre las opciones, en lugar de forzar una elección.
- Manejo de abreviaturas específicas de ROS 2 mediante expansión léxica previa al cálculo de características.
- Tolerancia a erratas, transposiciones, palabras eliminadas o intercambiadas, camelCase y plurales.
- Verificación posterior: cada elección se valida reanalizando el workspace antes de aplicarse.
- Escritura controlada: las correcciones solo se persisten con `rosfix fix --write --accept-assist`.
- Sin generación de texto libre: la salida es siempre una opción del conjunto o una abstención.
- Ejecución local determinista en Rust puro, sin GPU, sin runtime de ML y sin acceso a red.
- No soporta tool calling, agentes, visión, audio ni razonamiento multi-paso; no es un modelo conversacional.

## Casos de uso

- Corrección asistida de parámetros en nodos ROS 2: cuando rosfix detecta `max_lin_vel` en un nodo que declara `max_linear_velocity`, el modelo elige el nombre correcto entre los parámetros declarados del workspace y la corrección se verifica antes de aplicarse.
- Resolución de referencias a joints y frames: en archivos de configuración de Nav2 o robot_localization, el ranker selecciona el frame o joint declarado que mejor corresponde a un identificador mal escrito, evitando errores silenciosos en tiempo de ejecución.
- Selección de ejecutables y controladores: ante un nombre de plugin o controlador con errata en `ros2_controllers`, el modelo ordena los controladores disponibles del paquete y propone el válido.
- Integración en CI/CD de robótica: al compilarse dentro del binario de rosfix, puede ejecutarse en pipelines de integración sin dependencias externas, marcando hallazgos y sugiriendo correcciones en cada pull request.
- Migración entre distribuciones de ROS 2: al cubrir Humble, Jazzy y Kilted, ayuda a corregir nombres que cambiaron entre ramas al portar paquetes.
- Auditoría de configuraciones en entornos aislados: al no requerir red ni GPU, es apto para estaciones de trabajo de robot y entornos air-gapped donde no se puede desplegar un LLM.
- Herramienta de desarrollo en el editor: el ranking es lo bastante rápido y ligero (1,3 KB de pesos) para ofrecer sugerencias interactivas mientras se edita un YAML de configuración.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente). El conjunto de test es el fold 0 de corrupciones sintéticas con paquetes y nombres reservados.

| Tarea | Métrica | rosfix-assist | Baseline léxico |
|---|---|---|---|
| Ranking con abstención (respuesta ofrecida, n=1062) | Aciertos correctos | 69,49 % | 54,14 % |
| Ranking con abstención (respuesta ofrecida, n=1062) | Elecciones erróneas | 0,19 % | no disponible |
| Abstención con respuesta ausente (n=729) | Abstenciones correctas | 99,31 % | 96,57 % |
| Ediciones erróneas sobre todos los casos (n=1791) | Tasa de error | 0,39 % | 1,68 % |
| Validación cruzada 5 folds agrupada (n=3005) | Aciertos correctos | 43,19 % | 26,66 % |
| Validación cruzada 5 folds agrupada (n=3005) | Ediciones erróneas | 1,60 % | 1,96 % |

## Requisitos de hardware

- VRAM: 0 GB; el modelo se ejecuta en CPU como parte del binario de rosfix.
- GPU: no requiere ninguna; funciona en cualquier máquina capaz de ejecutar rosfix.
- GPU de consumo: no aplica; no hay inferencia en GPU.
- Despliegue: compilado dentro del binario de rosfix en Rust puro; no se usa con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma numérica; el cálculo es un MLP de 16→16→1 sobre un conjunto cerrado de opciones, por lo que el coste por hallazgo es despreciable frente al reanálisis del workspace.
- Almacenamiento: ≈1,3 KB de pesos en f32 embebidos en el código.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|---|
| rosfix-assist | Ranker MLP sobre características de cadena | 289 pesos | no aplica | Reparación de configuración ROS 2 con abstención | Apache-2.0 |
| Baseline léxico de rosfix | Ranking léxico con tabla de abreviaturas | 0 (reglas) | no aplica | Misma tarea, sin aprendizaje | Apache-2.0 / MIT |
| LLM generativo de propósito general | Transformer decoder | Miles de millones | Miles de tokens | Generación libre, requiere verificación | Variable |

La comparación con LLM generativos no es directa: rosfix-assist no genera texto y opera sobre un conjunto cerrado de opciones, lo que elimina el riesgo de alucinación de identificadores. Frente al baseline léxico del propio proyecto, mejora los aciertos del 54,14 % al 69,49 % en el conjunto con respuesta ofrecida y reduce las ediciones erróneas del 1,68 % al 0,39 % sobre todos los casos. No se dispone de comparativas con otros rankers especializados en reparación de configuración.

## Limitaciones y advertencias

- Alcance restringido: solo funciona sobre el conjunto cerrado de nombres que rosfix extrae del workspace; no resuelve identificadores que no estén declarados.
- Dependencia del conocimiento de paquetes: su cobertura depende de los knowledge packs (Nav2, ros2_controllers, ros2_control, slam_toolbox, robot_localization, etc.) y de las ramas Humble, Jazzy y Kilted.
- Entrenamiento sintético: las corrupciones se generan artificialmente a partir de nombres reales; el rendimiento en configuraciones reales puede diferir del reportado.
- Resultados no verificados: las métricas de la model card están declaradas por el autor y no han sido replicadas de forma independiente.
- Solo inglés: los identificadores y la tabla de abreviaturas están pensados para ROS 2 en inglés; no hay soporte multilingüe.
- Sin generación de texto: no puede explicar sus elecciones en lenguaje natural ni mantener conversaciones.
- Sesgo hacia nombres frecuentes: al excluir de test los nombres compartidos con entrenamiento, la validación cruzada agrupada baja al 43,19 % de aciertos, lo que refleja la dificultad con nombres no vistos.
- Licencia: Apache-2.0 permite uso comercial; el repositorio rosfix se ofrece bajo Apache-2.0 o MIT, a elección, por lo que conviene revisar los términos del proyecto completo antes de redistribuirlo.
- En producción, la escritura de correcciones requiere la bandera explícita `--accept-assist` y la verificación por reanálisis; no debe automatizarse sin ese paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SohamW11/rosfix-assist
- Dataset de knowledge packs: https://huggingface.co/datasets/SohamW11/rosfix-knowledge-packs
- Repositorio rosfix (ros2-safety-lint): https://github.com/SohamWalam11/ros2-safety-lint
- Módulo de asistencia: https://github.com/SohamWalam11/ros2-safety-lint/tree/main/crates/ros2-safety-lint/src/assist
- Implementación del modelo (`learned.rs`): https://github.com/SohamWalam11/ros2-safety-lint/blob/main/crates/ros2-safety-lint/src/assist/learned.rs
- Ranker léxico (`lexical.rs`): https://github.com/SohamWalam11/ros2-safety-lint/blob/main/crates/ros2-safety-lint/src/assist/lexical.rs
- Utilidades (`util.rs`): https://github.com/SohamWalam11/ros2-safety-lint/blob/main/crates/ros2-safety-lint/src/util.rs
