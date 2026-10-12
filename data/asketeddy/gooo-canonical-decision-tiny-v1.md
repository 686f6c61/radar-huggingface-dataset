# asketeddy/gooo-canonical-decision-tiny-v1

## Resumen

Gooo Canonical Decision Tiny v1 es un modelo de decisión de tipo tabular-classification, publicado por el usuario asketeddy, cuyo propósito no es generar texto ni razonar de forma generalista, sino asistir a la construcción de programas en Gooo. El modelo lee una elección declarada en el código fuente, unos ejemplos de salida y unos requisitos booleanos intermedios, y sugiere cuál de los caminos de código finitos conviene comprobar primero. Gooo se encarga después de ensamblar y ejecutar los candidatos, registrar los requisitos no satisfechos y continuar por el resto de opciones sin necesidad de una nueva predicción.

El caso descrito en la model card es una función pequeña con dos interruptores marcados: el orden de los operandos de comparación y la disposición de las ramas. Cada función tiene, por tanto, cuatro cuerpos posibles. El modelo no sustituye al compilador: la ordenación por defecto del compilador sigue siendo determinista y solo al proporcionar un modelo compatible se habilita la clasificación por ranking.

Se trata de un artefacto de investigación experimental. El par original (media/extremo) se ajustó a partir de pesos sembrados de nuevo sobre ejemplos sintéticos de Gooo escritos por el autor. Cada variante tiene 19.034 parámetros FP32, equivalentes a 76.136 bytes de arrays de pesos. La arquitectura, el entrenamiento y la inferencia local están implementados en Go, y el repositorio de HuggingFace no contiene pesos en safetensors ni GGUF, sino ficheros JSON de artefactos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se describe como modelo de decisión entrenado de forma independiente; no se especifica transformer ni MoE) |
| Parametros totales | 19.034 parámetros FP32 (76.136 bytes de arrays de pesos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en FP32) |
| Idiomas soportados | en, ko |
| Licencia | MIT |
| Formato de pesos | JSON (`result/model-mean.json`, `result/model-extreme.json`, `research/source-relative-learning-20261011/result/model-relative.json`) |

## Arquitectura y entrenamiento

La model card no describe una arquitectura de red neuronal convencional. Define el artefacto como un modelo de decisión tabular que consume una elección declarada en el fuente, ejemplos de salida y requisitos booleanos intermedios, y devuelve una sugerencia sobre qué camino de código comprobar primero. El par media/extremo se ajustó desde pesos sembrados de nuevo sobre ejemplos sintéticos de Gooo autorales. Cada miembro del par tiene 19.034 parámetros FP32 y 76.136 bytes de arrays de pesos, y los artefactos preservan los ajustes originales byte a byte.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. Tampoco se describen innovaciones de inferencia como decodificación especulativa o atención lineal. La implementación de la arquitectura, el entrenamiento y la inferencia local están escritos en Go. Existe una variante posterior de aprendizaje de roles (aprendizaje relativo al fuente) retenida como investigación, con su propio protocolo, mediciones y esquema de artefactos, compatible con el SDK 0.2.41 y el compilador público 0.6.32. El orden por defecto del compilador sigue siendo determinista; solo al aportar un modelo compatible se habilita la ordenación por ranking.

## Capacidades

- Selección de camino de código: dado un fuente con dos interruptores (orden de operandos de comparación y disposición de ramas), sugiere cuál de los cuatro cuerpos posibles comprobar primero.
- Lectura de requisitos booleanos intermedios y de ejemplos de salida declarados en el fuente para acotar la decisión.
- Integración con el bucle del compilador Gooo, que ensambla y ejecuta los candidatos, registra los requisitos no satisfechos y continúa sin nuevas predicciones.
- Clasificación tabular (pipeline declarado en HuggingFace: `tabular-classification`).
- Compatibilidad con adaptadores por versión: el artefacto canónico introducido en el SDK 0.2.40 sirve a compiladores 0.6.32 y anteriores (0.6.28/0.6.29/0.6.30/0.6.31); la variante de aprendizaje relativo al fuente requiere SDK 0.2.41.
- Idiomas: inglés y coreano (etiquetas `en`, `ko`).
- No se documentan capacidades de generación de texto, visión, audio, tool calling, agentes ni multi-step reasoning.

## Casos de uso

- Clasificación de caminos en compiladores asistidos por modelo: en un proyecto Gooo, el compilador ejecuta las cuatro variantes de una función y el modelo propone qué cuerpo probar primero, reduciendo el número de comprobaciones antes de encontrar el candidato válido.
- Búsqueda acotada en operaciones de cadenas: el compilador 0.6.32 expone un paquete de cadenas que implementa búsqueda de subcadenas, conteo de coincidencias no solapadas y conteo de runas Unicode; el modelo puede priorizar la variante de bucle o retorno a comprobar.
- Relleno de predicados únicos: en el paquete de condición única sobre búsqueda de bytes, el compilador mantiene el bucle y el modelo ayuda a completar un predicado permitido.
- Verificación de operaciones de texto limitadas: con el compilador 0.6.31, que añade bucles contados y acceso a bytes para UTF-8 válido de hasta 1.024 bytes, el modelo puede clasificar la ruta de búsqueda de byte y devolución del desplazamiento original.
- Replay determinista en CI: los flujos verificados ejecutan casos con replay guardado en Linux amd64, macOS amd64/arm64 y Windows amd64 con cero llamadas al modelo; el modelo se usa solo cuando se habilita el ranking opcional.
- Investigación sobre reglas de reintento: la observación `research/retry-budget-native-20261012` reutiliza los pesos relativos al fuente para proponer primero un cuerpo y luego dejar que la comprobación finita seleccione el válido, útil para estudiar presupuestos de reintento.
- Reproducción de artefactos de investigación: los ficheros JSON preservan los ajustes originales byte a byte, lo que permite replicar comparaciones entre el modelo de media, el de extremo y las variantes de aprendizaje de roles.

## Benchmarks y rendimiento

El `model-index` del autor declara un único modelo, "Gooo Canonical Decision Tiny v1", con una lista de resultados vacía. Por tanto, no se han publicado resultados de benchmarks en la información disponible.

Como observaciones locales (no benchmarks formales) la model card recoge lo siguiente:

| Observacion | Resultado |
|---|---|
| Primera propuesta (regla de reintento) frente a salidas | 0/6 |
| Primera propuesta frente a condiciones booleanas | 3/3 |
| Comprobación finita tras la primera propuesta (salidas) | 6/6 |
| Comprobación finita tras la primera propuesta (booleanas) | 3/3 |
| Evaluación nativa y replay guardado posteriores | 8/8 (incluye un entero grande) |
| Latencia de una predicción | ~0,163 ms |
| Bytes de tensor residentes | 76.136 |

Estas cifras proceden de una observación local con productor `UNBOUND_LOCAL_SOURCE`; la memoria de proceso completo y el uso de CPU solo del modelo no se midieron. La model card advierte de que son datos de un único test local y de que los pesos existentes y los estudios originales permanecen sin cambios.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU. El modelo ocupa 76.136 bytes de arrays de pesos en FP32 (unos 74 KB), por lo que reside en memoria principal.
- GPU recomendadas: no disponible / innecesaria. El pipeline es de clasificación tabular sobre un modelo de 19.034 parámetros.
- Compatibilidad con GPU de consumo: no aplica en el sentido habitual; el modelo cabe en cualquier equipo que ejecute el toolchain de Go.
- Opciones de despliegue: la arquitectura, el entrenamiento y la inferencia local están implementados en Go; los artefactos son ficheros JSON cargados por el compilador Gooo (0.6.32 y SDK 0.2.41, con adaptadores retenidos para 0.6.28–0.6.31). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: la model card reporta una predicción de aproximadamente 0,163 ms con 76.136 bytes de tensor residentes; no se proporcionan cifras de throughput.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (clasificación tabular para construcción de programas Gooo), y el `model-index` no ofrece resultados frente a alternativas. Como referencia interna del propio proyecto, se pueden comparar los tres artefactos entre sí:

| Artefacto | Ruta compatible | Naturaleza |
|---|---|---|
| `result/model-mean.json` | Compilador público 0.6.32; adaptadores 0.6.28–0.6.31; adaptador canónico desde SDK 0.2.40 | Ajuste original (media) |
| `result/model-extreme.json` | Compilador público 0.6.32; adaptadores 0.6.28–0.6.31 | Ajuste original (extremo) |
| `research/source-relative-learning-20261011/result/model-relative.json` | SDK 0.2.41; compilador 0.6.32 | Variante de investigación (aprendizaje relativo al fuente) |

## Limitaciones y advertencias

- Es un artefacto de investigación experimental: la model card indica explícitamente "Research weights; the default model is unchanged". No está pensado como componente de producción estable.
- El `model-index` no declara resultados de benchmarks; las cifras disponibles son observaciones locales con productor `UNBOUND_LOCAL_SOURCE` y no deben interpretarse como evaluación general.
- El alcance funcional es muy estrecho: dos interruptores por función (orden de operandos de comparación y disposición de ramas) y cuatro cuerpos posibles por función. Fuera de ese esquema no hay evidencia de funcionamiento.
- El compilador mantiene una ordenación determinista por defecto; el modelo solo aporta ranking si se aporta un artefacto compatible, y las incompatibilidades de versión (SDK/compilador) pueden impedir su uso.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero la primera propuesta puede fallar; en la observación citada la primera propuesta acertó 0/6 salidas y 3/3 booleanas, y fue la comprobación finita la que seleccionó el cuerpo correcto. No debe confiarse en la primera predicción sin verificación.
- Memoria y uso de CPU del proceso completo sin medir: solo se conoce el tamaño de los tensores residentes (76.136 bytes) y la latencia de una predicción.
- Idiomas: el modelo declara inglés y coreano; no hay información sobre comportamiento en otros idiomas.
- Licencia MIT: permite uso comercial, pero al ser pesos de investigación la idoneidad para producción no está demostrada por el autor.
- Dependencia de un ecosistema concreto: el modelo solo tiene sentido dentro del compilador Gooo y su SDK; no es un modelo de propósito general reutilizable.

## Enlaces

- HuggingFace: https://huggingface.co/asketeddy/gooo-canonical-decision-tiny-v1
- Compilador público Gooo 0.6.32-dev: https://github.com/kimjooyoon/meta-ontology-go/releases/tag/v0.6.32-dev
- Contrato del modelo relativo al fuente: https://github.com/kimjooyoon/meta-ontology-go/blob/83928fa4538245abe33b08549da47f8cbdc50ed2/docs/source-relative-contract-model.md
- Guía de la release 0.6.32-dev: https://github.com/kimjooyoon/meta-ontology-go/blob/83928fa4538245abe33b08549da47f8cbdc50ed2/docs/releases/0.6.32-dev.md
- Paquete de operaciones de cadenas: https://github.com/kimjooyoon/meta-ontology-go/tree/83928fa4538245abe33b08549da47f8cbdc50ed2/examples/bounded-string-operations
- Paquete de condición única sobre búsqueda de bytes: https://github.com/kimjooyoon/meta-ontology-go/tree/83928fa4538245abe33b08549da47f8cbdc50ed2/examples/single-condition-byte-search
- Run de plataforma con fuente aceptada: https://github.com/kimjooyoon/meta-ontology-go/actions/runs/38171136075
- Run de publicación: https://github.com/kimjooyoon/meta-ontology-go/actions/runs/38173071143
- Wiki (instalación y verificación, 0.6.32): https://github.com/kimjooyoon/meta-ontology-go/wiki/String-Assembly-Release-0.6.32
- Compilador 0.6.31-dev: https://github.com/kimjooyoon/meta-ontology-go/releases/tag/v0.6.31-dev
- Librería y app de búsqueda en texto limitado: https://github.com/kimjooyoon/meta-ontology-go/tree/c56007f5881296cb3181ff056c50a4ae917a9850/examples/bounded-text-search
- Run de checks nativos (0.6.31): https://github.com/kimjooyoon/meta-ontology-go/actions/runs/38156418124
- Wiki (instalación y búsqueda de bytes, 0.6.31): https://github.com/kimjooyoon/meta-ontology-go/wiki/Byte-Search-Release-0.6.31
- Run de publicación original (0.6.31): https://github.com/kimjooyoon/meta-ontology-go/actions/runs/38158359923
- Estudio de regla de reintento: research/retry-budget-native-20261012/README.md (referenciado en la model card)
- Estudio de aprendizaje relativo al fuente: research/source-relative-learning-20261011/result/model-relative.json (referenciado en la model card)
