# Perfect7613/inkling2-gated-position-lens

## Resumen

Inkling2-gated-position-lens es un artefacto de interpretabilidad (no un modelo generativo) publicado por el usuario Perfect7613 en Hugging Face. Consiste en los pesos de una "lente de tokens" (token lens) entrenada sobre el modelo `thinkingmachines/Inkling-2-Mini`, un transformer de 48 visitas de capa cuya dimensión oculta es 2304. La lente permite leer, desde el estado interno en una posición concreta de una visita concreta, qué token es probable que el modelo emita a continuación, sin necesidad de ejecutar el resto de la red.

El repositorio es un espejo del trabajo original de mlyang721 (licencia MIT) con una contribución adicional del equipo "Team Steering": una evaluación en dos posiciones de lectura (`final` y `last_question_mark`) y un wrapper de inferencia para NDIF. Los pesos entrenados no se modifican. El interés actual radica en el reto NDIF Looped Lens Challenge, en el que se evalúa la capacidad de predecir la salida del modelo a partir de estados intermedios, una técnica relevante para investigación en interpretabilidad mecanicista y para depuración de modelos en producción.

El artefacto no genera texto por sí mismo: es un conjunto de matrices (gate, transportadores y expertos) que se aplican sobre estados ocultos capturados con forward passes ordinarios. Su utilidad es diagnóstica: inspeccionar qué "piensa" el modelo en cada visita de capa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lente de tokens sobre transformer (modelo base `thinkingmachines/Inkling-2-Mini`); gate lineal + transportadores de rango 256 + expertos residuales |
| Parametros totales | No disponible (el repo pesa 0,1 GB en float16; el número exacto de parámetros de la lente no se declara) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base Inkling-2-Mini) |
| Tipos de cuantizacion | No disponible (pesos en float16) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (`lens.safetensors`, float16) |

Dimensiones declaradas: dimensión oculta 2304; gate `G{v}` de [2304, 6] y sesgo `g{v}` de [6]; transportadores `U{v}_{k}` [2304, 256], `V{v}_{k}` [256, 2304] y `c{v}_{k}` [2304]. Visitas leídas: 24, 34, 36, 42, 43, 44, 45, 46 y 47 (numeradas 0–47 en orden de ejecución). Seis tipos (k = 0 a 5).

## Arquitectura y entrenamiento

La lente opera sobre el estado `h` que entra en una visita de capa en la posición de lectura. Primero normaliza a RMS unitario (`x = h / rms(h)`), aplica un gate lineal (`k = argmax(x @ G + g)`) que decide qué tipo de computación representa ese estado, y luego aplica el transportador afín correspondiente de rango 256 con sesgo (`z = x + (x @ U_k) @ V_k + c_k`). Finalmente proyecta con la normalización final y el unembedding del propio modelo (`scores = lm_head(norm(z))`). Para algunos tipos y visitas el resultado es un ensemble: se suma la salida de un segundo transportador (sufijo `b`) o la del logit lens plano (clave `I…b`). Cada lectura es función de un único estado en una única visita y posición; no utiliza el texto del prompt.

El entrenamiento se realizó con el modelo base congelado y forward passes ordinarios. Por visita y tipo se ajustó: (1) un mapa ridge sin etiquetas desde el estado a RMS unitario en esa visita hasta el estado a RMS unitario en la visita 44 del mismo prompt y posición ("transport"); (2) un mapa residual sobre él, entrenado con entropía cruzada a través de la normalización final y el unembedding congelados ("expert"), con early stopping sobre un décimo reservado; (3) el gate, mediante regresión logística multinomial sobre estados a RMS unitario. La elección entre logit lens, transport, expert, mezcla intermedia o ensemble para cada tipo y visita se hizo sobre preguntas sintéticas reservadas, y las nueve visitas se seleccionaron del mismo modo. Los conjuntos de validación (WorkspaceBench y las diez preguntas de práctica del reto) nunca se usaron en entrenamiento; todo prompt presente en ellos se eliminó de los conjuntos de entrenamiento.

Datos por tipo: el tipo 0 (unas 27k preguntas de una palabra, objetivo = la propia respuesta del modelo, autodestilación) usa NQ-open, TriviaQA, WebQuestions, plantillas de relaciones LRE, paráfrasis de calendario y listas propias de entidades. El tipo 1 (unas 21k sumas, restas, productos y cocientes de un paso) usa el enunciado del conjunto de práctica y paráfrasis. El tipo 2 (unas 420k expresiones de dos pasos en trece renders planos) usa operandos frescos en las diez formas de la familia aritmética de WorkspaceBench. Los tipos 4 y 5 (unas 108k prompts, misma aritmética dentro del wrapper de chat) son una precaución para un formato que la lente podría encontrar. El tipo 3 (unas 44k prompts de dos saltos) usa TwoHopFact, SOCRATES y Hopping Too Late, con etiquetas generadas por el propio modelo.

## Capacidades

- Lectura de tokens predichos desde estados intermedios en nueve visitas de capa del modelo Inkling-2-Mini.
- Clasificación del "tipo de computación" de un estado mediante un gate lineal entrenado (seis tipos: pregunta de chat de una palabra, suma de un paso, aritmética plana de dos pasos, salto factual de dos saltos, y dos variantes de aritmética envuelta en chat).
- Evaluación en dos políticas de posición de lectura: `final` (por defecto) y `last_question_mark`, con fallback al token final si no hay signo de interrogación.
- Producción de nueve lecturas por política desde una única posición.
- Soporte de ensembles por tipo y visita (segundo transportador o logit lens plano).
- Wrapper de inferencia para NDIF incluido en `submission/`.
- No soporta generación de texto, tool calling, agentes, visión ni audio: es un artefacto de interpretabilidad, no un modelo generativo.

## Casos de uso

- Investigación en interpretabilidad mecanicista: inspeccionar en qué visita de capa el modelo "decide" la respuesta a una pregunta de un solo paso, comparando las lecturas de las visitas 24, 34, 36 y 42–47 sobre el mismo prompt.
- Depuración de fallos aritméticos: usar el tipo 2 (aritmética plana de dos pasos) para leer el valor del primer paso en la visita 44 y localizar si el error surge en el primer cálculo o en el segundo.
- Análisis de saltos factuales: con el tipo 3, leer la entidad puente en prompts de dos saltos (TwoHopFact, SOCRATES) y estudiar si el modelo la representa antes de responder.
- Auditoría de formato de prompt: comparar las lecturas de los tipos 2, 4 y 5 sobre la misma expresión aritmética presentada en formato plano y en formato de chat, para medir cuánto cambia la representación interna según el wrapper.
- Validación de pipelines de captura de estados: el wrapper NDIF y el código de `submission/` sirven como referencia para integrar captura de estados y lecturas de lente en flujos de evaluación reproducibles.
- Estudio de autodestilización: el tipo 0 se entrenó con la propia respuesta del modelo como objetivo, lo que permite analizar la coherencia entre estados intermedios y salida final en preguntas de una palabra.
- Reproducibilidad de experimentos del reto: el repositorio fija un commit concreto del upstream y publica el SHA-256 de los pesos (`f61223ae…`), lo que facilita replicar exactamente la evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona conjuntos de validación (WorkspaceBench y las diez preguntas de práctica del reto) pero el texto proporcionado se interrumpe antes de presentar las métricas.

## Requisitos de hardware

- El repositorio pesa 0,1 GB en float16, por lo que los pesos de la lente caben holgadamente en cualquier GPU consumer.
- El coste real depende del modelo base Inkling-2-Mini, del que no se dispone de especificaciones en la información proporcionada; se requiere ejecutar forward passes para capturar los estados en las visitas 24, 34, 36 y 42–47.
- VRAM estimada para la lente: inferior a 1 GB; para el modelo base, no disponible.
- GPU recomendadas: no disponible para el modelo base; la lente en sí no impone requisitos.
- Despliegue: el código de referencia vive en `submission/` (`lenses.py`, `main.py`) y se ejecuta vía el wrapper NDIF; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Artefacto | Modelo base | Tipo | Visitas leídas | Licencia | Formato |
|---|---|---|---|---|---|
| Perfect7613/inkling2-gated-position-lens | Inkling-2-Mini | Lente con gate + transportadores + expertos, dos posiciones | 9 | MIT | safetensors |
| mlyang721/inkling2-gated-translator-lens (upstream) | Inkling-2-Mini | Lente con gate + transportadores + expertos, posición final | 9 | MIT | safetensors |
| Logit lens plano | Cualquier transformer | Proyección directa con norm y unembedding | Configurable | N/A | N/A |

La diferencia principal frente al upstream es la evaluación en dos posiciones (`final` y `last_question_mark`) y el wrapper NDIF; los pesos son idénticos. Frente al logit lens plano, la lente añade un gate de tipo y transportadores de rango 256 que aproximan el estado de la visita 44, lo que en la model card se describe como más preciso para los tipos y visitas seleccionados.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no soporta tool calling ni agentes; solo lee estados internos.
- Depende de forma estricta del modelo base `thinkingmachines/Inkling-2-Mini` y de sus dimensiones (oculta 2304, 48 visitas); no es transferible a otros transformers sin reentrenamiento.
- Las lecturas son función de un único estado en una visita y posición; no incorporan el texto del prompt, lo que limita su aplicabilidad fuera de los formatos entrenados.
- Los tipos 4 y 5 se describen como "precaución" para un formato de chat que la lente podría encontrar y no se activan sobre los estados de los otros tipos; su cobertura real es limitada.
- El tipo 0 se entrenó por autodestilización (objetivo = la propia respuesta del modelo), lo que puede heredar y reproducir sesgos del modelo base.
- El tipo 3 se etiqueta con lo que el propio modelo completa en el primer salto, no con verdad de referencia; las lecturas reflejan la representación del modelo, no hechos verificados.
- No se han publicado métricas de validación en la información disponible, por lo que no es posible cuantificar la precisión de las lecturas.
- El repositorio fija un commit del upstream; subidas posteriores a este repositorio no afectan a lo que ejecuta la entrada del reto, pero sí podrían afectar a consumidores que apunten a `main`.
- Licencia MIT: permite uso comercial y modificación, pero el artefacto carece de utilidad comercial directa al ser una herramienta de análisis.

## Enlaces

- Hugging Face: https://huggingface.co/Perfect7613/inkling2-gated-position-lens
- Upstream (mlyang721): https://huggingface.co/mlyang721/inkling2-gated-translator-lens/tree/f5bf5f5069bba6a871286ce3925f2d25040608aa
- Modelo base: `thinkingmachines/Inkling-2-Mini` (no se proporciona URL directa en la información disponible)
- Reto NDIF Looped Lens Challenge: https://ndif-looped-lens-challenge.hf.space/
- SHA-256 de los pesos: `f61223ae5e47c87c64a5e4dd66560f52e976161a9efefdfc205584c1fac41c0c`
