# RaphaelRaphaelRaphael/looped-lens-readers

## Resumen

Looped-lens-readers es un conjunto de pesos auxiliares (no un modelo generativo completo) publicado por el usuario RaphaelRaphaelRaphael como contribución al Looped Lens Challenge organizado por NDIF. El paquete contiene dos componentes: un *reader* o lente afinada que proyecta el estado oculto de una visita de capa concreta del modelo Inkling 2 Mini a logits de vocabulario, y una *axial probe*, una pequeña red transformer que clasifica la ruta de razonamiento de un prompt y decide en qué posición de token leer. No se trata de un modelo de lenguaje autónomo, sino de instrumentación de interpretabilidad para un modelo base de terceros.

El artefacto está pensado para integrarse en el código de la entrada del reto, que descarga el fichero `kind_routes.safetensors` desde NDIF al inicio de cada petición. La lente se implementa como una corrección de rango 32 sobre la proyección logit estándar (logit lens), con parámetros `(U, V, b)` por visita de capa, y la sonda opera sobre una rejilla de diez visitas de capa por las últimas doce posiciones de token, con atención alternada en posiciones y en visitas.

La relevancia es acotada pero específica: ofrece un ejemplo funcional de lectura de estados internos en un modelo con capas repetidas (looped transformer), donde distinguir a qué visita corresponde una activación es parte del problema. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, tamaño 0.0 GB declarado y licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lente lineal de rango 32 sobre proyección logit (reader) + transformer axial de bloques con pesos compartidos aplicado 4 veces (axial probe) |
| Parametros totales | no disponible (depende del recuento de tensores; no se publica cifra) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la sonda opera sobre las últimas 12 posiciones de token y 10 visitas de capa) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (`kind_routes.safetensors`) |

## Arquitectura y entrenamiento

El componente *reader* es una lente por visita de capa. Dado un estado `x` normalizado a raíz de media cuadrática unitaria (`xn`), calcula `logits = head(norm(xn + b + (xn V) U^T))`, con rango 32 y un juego `(U, V, b)` por visita. `U` y `b` se inicializan a cero, de modo que una lente sin ajustar equivale al logit lens plano; el ajuste añade una corrección de bajo rango sobre la representación. Se usa en la visita 46 (en la posición del signo de interrogación) y en la visita 36 (en el segundo operando de una suma).

La *axial probe* es un transformer pequeño que opera sobre una rejilla de estados: diez visitas de capa (18, 24, 30, 36, 42, 43, 44, 45, 46, 47) por las últimas doce posiciones de token, con atención primero a lo largo de posiciones y luego a lo largo de visitas, mediante un bloque con pesos compartidos aplicado cuatro veces. Solo lee activaciones: elige una de cuatro rutas para el prompt (pregunta, aritmética, preferencia propia, enunciado) y, para enunciados simples, la posición de token a leer. Nunca emite tokens.

El modelo base es Inkling 2 Mini, con 48 visitas de capa porque las capas 6 a 17 se ejecutan tres veces (transformer con repetición de bloques). El ajuste se realizó sobre prompts escritos ad hoc y sobre prompts públicos TwoHopFact; según el autor, no se usó ninguna pregunta del reto. Los tensores publicados incluyen `chooser.*` (pesos de la sonda), `routes.U` y `routes.V` con forma rutas × slots × 2304 × 32, `routes.b` con forma rutas × slots × 2304, `routes.grid_index` y `routes.mask` (rutas × slots) y `routes.offset` (rutas), que indica tokens previos a la posición de lectura o -1 cuando deciden las puntuaciones de posición de la sonda.

## Capacidades

- Lectura de logits desde estados intermedios de Inkling 2 Mini mediante lente afinada de rango 32 por visita de capa.
- Clasificación de prompts en cuatro rutas: pregunta, aritmética, preferencia propia y enunciado.
- Selección automática de la posición de token a leer en enunciados simples.
- Localización de la visita de capa relevante dentro de un modelo con capas repetidas (48 visitas, capas 6-17 ejecutadas tres veces).
- Funcionamiento como sonda de solo lectura: no genera ni modifica tokens.
- Integración con el pipeline de NDIF mediante descarga del fichero safetensors al inicio de cada petición.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito; no es un modelo generativo.

## Casos de uso

- Interpretabilidad de modelos con capas repetidas: permite inspeccionar qué información está disponible en cada visita de capa de Inkling 2 Mini, algo que el logit lens plano no distingue cuando el mismo bloque se ejecuta varias veces.
- Evaluación de preguntas de una sola palabra: la lente en la visita 46, en la posición del signo de interrogación, produce una distribución de logits para anticipar la respuesta de un solo token.
- Análisis de operaciones aritméticas: la lente en la visita 36 sobre el segundo operando de una suma permite estudiar cómo se representa el resultado parcial antes de emitirlo.
- Enrutado de consultas en pipelines de evaluación: la axial probe clasifica el prompt en pregunta, aritmética, preferencia o enunciado, lo que permite dirigir cada caso al método de lectura adecuado.
- Auditoría de experimentos del Looped Lens Challenge: sirve como referencia reproducible para comparar otras lentes y sondas sobre el mismo modelo base.
- Investigación sobre representaciones factuales de dos saltos: el ajuste incluye prompts públicos TwoHopFact, útil para estudiar cómo se componen hechos encadenados en las activaciones.
- Instrumentación de depuración en despliegues de Inkling 2 Mini: al leer solo activaciones, puede conectarse a un servidor de inferencia sin alterar la salida del modelo.

## Benchmarks y rendimiento

El autor reporta cifras de desarrollo, no puntuaciones de leaderboard, evaluadas con un comparador de cadenas fijo:

| Prueba | Resultado | Conjunto |
|---|---|---|
| Preguntas de lectura de una palabra no vistas en ajuste | 75 de 78 correctas | Preguntas de una palabra |
| Posición de la sonda en enunciados de dos saltos | 72 de 97 correctas | Enunciados TwoHopFact |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la información disponible, ni comparaciones con otras lentes o sondas del reto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repo se declara como 0.0 GB y los tensores dominantes son `routes.U`/`routes.V` (rutas × slots × 2304 × 32) y `routes.b` (rutas × slots × 2304), de modo que el peso es modesto frente al modelo base.
- El coste real de cómputo lo impone Inkling 2 Mini, no estos pesos auxiliares; no se especifican requisitos de VRAM para el modelo base.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible; depende enteramente del modelo base sobre el que se aplique.
- Opciones de despliegue: descarga vía NDIF (el código de la entrada obtiene `kind_routes.safetensors` al inicio de cada petición); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Looped-lens-readers (este) | Lente y sonda de interpretabilidad | no disponible | no disponible | MIT | Hugging Face, 0 descargas |
| Logit lens estándar | Técnica de lectura sin pesos | 0 (sin ajuste) | no aplica | no aplica | Implementación libre |
| Tuned lens (Belrose et al.) | Lente afinada por capa | no disponible | no aplica | según implementación | Repositorios públicos |
| Sondas lineales de clasificación | Clasificador sobre activaciones | no disponible | no aplica | según implementación | Repositorios públicos |

La comparación directa con otras entradas del Looped Lens Challenge no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Los pesos están ajustados y verificados sobre conjuntos pequeños de preguntas de una palabra y enunciados de dos saltos; el propio autor advierte que las cifras son de desarrollo y no puntuaciones de leaderboard.
- La lente solo se ha usado en las visitas 46 y 36 y en posiciones de token concretas (signo de interrogación y segundo operando); su comportamiento fuera de esos puntos no está documentado.
- La axial probe nunca escribe tokens: no puede sustituir a un modelo generativo ni corregir sus respuestas.
- No se especifican sesgos conocidos ni evaluación de alucinación, porque el artefacto no genera texto.
- No hay información sobre idiomas soportados; el ajuste se hizo con prompts escritos ad hoc y TwoHopFact, de composición lingüística no detallada.
- La licencia MIT permite uso comercial de estos pesos, pero el uso de Inkling 2 Mini se rige por la licencia de ese modelo base, no incluida en esta ficha.
- Depende de la disponibilidad del modelo base y de la infraestructura NDIF para la descarga en cada petición; no se documenta un modo de ejecución totalmente local.
- El repositorio presenta 0 descargas y 0 likes, sin señales de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/RaphaelRaphaelRaphael/looped-lens-readers
- Looped Lens Challenge (NDIF): https://ndif.us/looped-lens-challenge/
