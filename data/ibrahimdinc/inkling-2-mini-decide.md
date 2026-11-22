# ibrahimdinc/inkling-2-mini-decide

## Resumen

Inkling 2 Mini · Decide es una capa de decisión calibrada y "training-free" construida sobre el modelo base thinkingmachines/Inkling-2-Mini. No es un modelo de pesos nuevos: el repositorio contiene únicamente el código Python de la capa de decisión, los scripts de arranque y la evaluación completa; los pesos se descargan sin modificar desde unsloth/Inkling-2-Mini-GGUF. El autor es ibrahimdinc y la licencia declarada es Apache 2.0.

El sistema resuelve un problema concreto: dada una situación (state), una pregunta y un conjunto fijo de opciones, devuelve exactamente una de esas opciones junto con una probabilidad calibrada. Para ello no genera texto: prellena el turno del asistente con "Answer:" y lee, mediante llama.cpp, la probabilidad que el modelo asigna a cada letra de opción en la primera posición, normaliza y aplica un escalado de temperatura (T = 6.05) ajustado sobre 70 de los 231 ítems públicos de JevBench.

Su relevancia radica en que ofrece salida determinista y tipada (siempre una de las opciones enviadas), cobertura probabilística verificable y un ECE de 0.062 en ítems held-out, frente a 0.207 del sistema Jev 1.13.0 publicado. Está pensado para ejecutarse en local en hardware de consumo (probado en RTX 3070 Ti de 8 GB con 32 GB de RAM).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Capa de decisión sobre transformer (Inkling 2 Mini, MoE según el uso de `-ot` y offload de expertos descrito); no se especifica la arquitectura interna del modelo base |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se mencionan entradas de 2–6K tokens en las pruebas) |
| Tipos de cuantizacion | GGUF UD-Q4_K_XL (fichero probado); mmproj-F16 para entrada de imagen |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (descargados de unsloth/Inkling-2-Mini-GGUF); el repo no contiene pesos |

## Arquitectura y entrenamiento

La capa de decisión no entrena pesos. El flujo es: se construye el prompt de chat de Inkling con el estado, la pregunta y las opciones, con "thinking effort 0"; se prellena el turno del asistente con "Answer:"; se llama a `/completion` de llama-server solicitando 1 token con `n_probs=50` y temperatura 0; se suman las probabilidades de las variantes con y sin espacio inicial de cada letra de opción (P(" A")+P("A"), P(" B")+P("B"), etc.), se normalizan y se aplica temperature scaling. El único parámetro ajustado es la temperatura T = 6.05, fijada sobre 70 de los 231 ítems de JevBench (30%, estratificado por split × tipo, semilla 42); no altera la opción elegida, solo la confianza declarada.

El modelo base es thinkingmachines/Inkling-2-Mini, del que no se detallan en la información disponible ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo RLHF/DPO. La innovación técnica destacable es el uso de logprobs en la primera posición como mecanismo de clasificación zero-shot determinista, junto con caché de prefijo para reutilizar el estado entre preguntas sucesivas y una señal de cobertura (probabilidad total sobre las letras de opción; media 0.982 en JevBench) que marca `"low_coverage": true` por debajo de 0.8.

## Capacidades

- Clasificación zero-shot con conjunto cerrado de opciones: devuelve siempre una de las opciones enviadas.
- Salida JSON tipada y determinista construida por código: misma petición, misma respuesta (verificado con 4 peticiones idénticas, incluida una tras limpiar la caché, coincidentes a 4 decimales).
- Probabilidades calibradas por opción y confianza global, con temperature scaling.
- Señal de cobertura para detectar respuestas poco fiables (`low_coverage`).
- Soporte de entrada de imagen opcional mediante `mmproj-F16.gguf` (0.64 GB).
- Caché de prefijo para preguntas múltiples sobre el mismo estado.
- No genera texto libre ni razonamiento multi-paso; no hay tool calling ni modo thinking (se fuerza thinking effort 0).
- Multilingüe: solo inglés declarado.

## Casos de uso

- Enrutamiento de decisiones en pipelines: dado un estado del sistema y un conjunto de acciones permitidas, el modelo devuelve la acción con probabilidad asociada, lo que permite umbrales de confianza y fallback.
- Triaje de tickets o incidencias: clasificar cada caso en una de N categorías fijas con confianza calibrada, útil para decidir si se escala a un humano cuando la cobertura baja de 0.8.
- Validación de hipótesis en investigación: usar la probabilidad por opción como señal comparable entre ítems gracias al ECE bajo (0.062 en held-out).
- Decisión sobre estados largos (2–6K tokens): con caché de prefijo, varias preguntas sobre el mismo estado cuestan ~4 s cada una tras la primera lectura.
- Sistemas de recomendación con opciones discretas: elegir entre alternativas predefinidas con una distribución de probabilidad explícita en lugar de texto generado.
- Evaluación y benchmarking interno de modelos de decisión: el repo incluye predicciones por ítem y métricas completas (`results/jevbench-public-231.jsonl`, `results/jevbench-metrics.json`), reutilizables como base de comparación.
- Despliegue local en estaciones de trabajo con GPU de 8 GB: al no requerir generación de texto, la latencia es acotada y el consumo de VRAM medido es de ~7.0 GB.

## Benchmarks y rendimiento

Resultados en JevBench (split público, 231 ítems):

| Metrica | Inkling 2 Mini · Decide | Jev 1.13.0 (publicado) |
|---|---|---|
| Exactitud, 231 ítems | 87.4% | 86.6% |
| Exactitud, 111 ítems difíciles | 77.5% | 73.0% |
| Exactitud, 161 ítems held-out | 87.6% | 85.7% |
| ECE, 161 held-out (menor es mejor) | 0.062 (0.075 sin calibrar) | 0.207 |
| ECE, ítems difíciles held-out | 0.077 (0.150 sin calibrar) | 0.086 |
| Latencia mediana | 4.0 s | 0.65 s |

Desglose ítem a ítem: ambos correctos en 191, ambos incorrectos en 20, solo este modelo correcto en 11, solo Jev correcto en 9. Puntos débiles declarados: preguntas de fecha y aritmética 8/15 correctas (Jev 4/15); preguntas de compromiso (trade-off) 3/6 (Jev 5/6); el orden de las opciones cambia la respuesta en el 6.9% de los ítems (11.7% en los difíciles). Latencia p95 de 56.8 s en entradas largas (2–6K tokens) sobre GPU de 8 GB con expertos en CPU. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~7.0 GB con el fichero UD-Q4_K_XL y offload parcial de expertos a CPU; ~14.5 GB de RAM en ese mismo配置.
- Pesos: 17.6 GB para el GGUF Q4_K_XL más 0.64 GB del mmproj opcional.
- GPU recomendadas: RTX 3070 Ti 8 GB (configuración probada); con 24 GB o más de VRAM se recomienda eliminar `-ot` y `--no-op-offload` para mantener todo el modelo en GPU, lo que según el autor debería reducir mucho la latencia (no medido).
- Cabe en GPU de consumo con 8 GB de VRAM y 32 GB de RAM de sistema.
- Despliegue: llama.cpp (build b12613 probado, binario Windows CUDA 12.4) mediante `llama-server`, más una API de decisión en Python con uvicorn (`inkling_decide.app`) en el puerto 8090.
- Latencia: mediana 4.0 s; p95 56.8 s en entradas largas; ~4 s para una segunda pregunta sobre el mismo estado gracias a la caché de prefijo.

## Comparativa con modelos similares

| Modelo | Tipo | Exactitud JevBench (231) | ECE held-out | Latencia mediana | Licencia / disponibilidad |
|---|---|---|---|---|---|
| Inkling 2 Mini · Decide | Capa de decisión local sobre Inkling 2 Mini | 87.4% | 0.062 | 4.0 s (local, 8 GB) | Apache 2.0, pesos vía unsloth/Inkling-2-Mini-GGUF |
| Jev 1.13.0 | Sistema de decisión alojado | 86.6% | 0.207 | 0.65 s (API con red) | No disponible en la información |
| thinkingmachines/Inkling-2-Mini | Modelo base generativo | No disponible | No disponible | No disponible | No disponible en la información |

La comparación con otros modelos de decisión o clasificadores zero-shot de tamaño similar no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El resultado de JevBench no es una reclamación de leaderboard: la puntuación oficial usa 534 decisiones (incluye ítems no públicos) y una fórmula distinta que pondera velocidad y coste; aquí solo se usan los 231 ítems públicos.
- Jev es mucho más rápido (0.65 s frente a 4.0 s), aunque su cifra incluye red y API alojada.
- Debilidad en preguntas de fecha y aritmética (8/15) y de compromiso o trade-off (3/6).
- Sensibilidad al orden de las opciones: cambia la respuesta en el 6.9% de los ítems (11.7% en difíciles).
- Solo inglés declarado; no hay soporte multilingüe documentado.
- La calibración se ajustó con 70 ítems; el ECE en dominios distintos a JevBench puede degradarse.
- El repositorio no incluye pesos: requiere descargar 17.6 GB desde unsloth/Inkling-2-Mini-GGUF y renombrar el fichero `.gguf_file` a `.gguf`.
- Requiere un build de llama.cpp con soporte para Inkling (probado b12613); versiones anteriores pueden no funcionar.
- Riesgo de alucinación no aplica en el sentido generativo (no escribe texto), pero sí de elección errónea con confianza alta si la cobertura es elevada y la opción correcta no está bien representada.
- Licencia Apache 2.0 permite uso comercial según los términos de dicha licencia; verificar las condiciones del modelo base por separado.

## Enlaces

- Hugging Face: https://huggingface.co/ibrahimdinc/inkling-2-mini-decide
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Pesos GGUF: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- JevBench: https://github.com/fstandhartinger/jevbench
- llama.cpp (release probada b12613): https://github.com/ggml-org/llama.cpp/releases/tag/b12613
