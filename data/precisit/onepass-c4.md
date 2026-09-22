# precisit/onepass-c4

## Resumen

`precisit/onepass-c4` es un modelo especialista de un solo pase (*one-pass specialist*) de 706.048 parámetros que juega a Conecta 4. El paradigma es distinto al de un modelo generativo: recibe un contexto codificado en bytes (224 bytes) y una lista de opciones (hasta 8 slots de 24 bytes cada uno) y devuelve una puntuación por opción en una única pasada hacia delante. No genera texto ni secuencias; puntúa alternativas. Lo publica el usuario `precisit` y es el segundo miembro de la familia, después de `precisit/one-pass-sv-forms`.

Su relevancia es doble. Por un lado, demuestra que un modelo de menos de un millón de parámetros puede alcanzar un 78,05 % de tasa de movimiento óptimo en posiciones de Conecta 4 con 26–38 fichas, muy por encima del 62,15 % que consigue la heurística trivial de priorizar la columna central. Por otro, valida el formato *one-pass specialist* como alternativa ligera a los modelos autorregresivos para tareas cerradas de selección: el modelo es agnóstico a la forma (el tamaño 224/8×24 es solo la forma de exportación) y se ejecuta en el navegador con ONNX Runtime a 3,9 ms por decisión sobre WebGPU y 7,8 ms sobre wasm, medido en Chrome sobre un Apple M4.

El interés práctico está en el despliegue *on-device* y en la integración como componente de puntuación dentro de sistemas mayores (bots, tutores, pipelines de evaluación). Los pesos ocupan 2,83 MB en `model.safetensors` y la licencia es MIT, sin restricciones para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | One-pass specialist (puntuador de opciones en una sola pasada); agnóstica a la forma. Arquitectura interna no detallada en la información disponible |
| Parámetros totales | 706.048 (dato real de `safetensors`) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 224 bytes de contexto (forma de exportación; el modelo es agnóstico a la forma) |
| Tipos de cuantización | No documentados. Los pesos publicados (2,83 MB para 706.048 parámetros) corresponden a precisión fp32 |
| Idiomas soportados | No disponible (el modelo no procesa lenguaje natural; consume bytes de contexto e historial de movimientos) |
| Licencia | MIT |
| Formato de pesos | `model.safetensors` (2,83 MB) y exportación ONNX (`onepass-c4-8x24.onnx`) |
| Entrada / salida | 224 bytes de contexto; 8 slots de opción × 24 bytes; una puntuación por opción |
| Dominio | Conecta 4 (tablero 6×7), posiciones con 26–38 fichas |
| Repositorio | 0,0 GB, 0 descargas, 0 likes en el momento de la consulta |

## Arquitectura y entrenamiento

El modelo pertenece a la familia de *one-pass specialists*: en lugar de generar tokens de forma autorregresiva, recibe el contexto completo en bytes y una lista de opciones candidatas, y emite una puntuación escalar por cada opción en una única pasada. El autor indica explícitamente que el modelo es agnóstico a la forma y que la configuración publicada (224 bytes de contexto, 8 slots × 24 bytes) corresponde únicamente a la forma de exportación, no a una restricción arquitectónica. La arquitectura interna (tipo de capas, mecanismo de atención o mezcla) no se detalla en la información disponible.

El entrenamiento procede del *spike* `c4-onepass` del repositorio `precisit/mira-spikes`, con el *toolkit* de `precisit/one-pass-specialists`. Las etiquetas son valores exactos de un solver, dado que Conecta 4 es un juego resuelto, y las posiciones de entrenamiento/evaluación contienen entre 26 y 38 fichas, es decir, fases de medio juego y final con tablero bastante poblado. No se documentan en la información proporcionada el número de tokens o posiciones de entrenamiento, la composición exacta del corpus, ni el uso de RLHF o DPO; dado el tipo de tarea (clasificación/puntuación de opciones con etiquetas exactas), el régimen esperable es aprendizaje supervisado, pero esto no se confirma en la ficha.

Un hallazgo técnico relevante del autor es que el modelo lee la posición a partir de la **línea de historial de movimientos**, no de la disposición del tablero. Al reescribir el tablero (intercambiando el propietario de todas las fichas manteniendo las alturas de columna), la tasa de movimiento óptimo varía solo 0,15 puntos; al barajar el historial de movimientos, cae 16,2 puntos. Si se elimina el historial por completo, baja al 54,75 %, por debajo del prior de columna central.

## Capacidades

- Puntuación de opciones en una sola pasada: dado un contexto de bytes y hasta 8 opciones, devuelve una puntuación por opción.
- Selección de movimiento en Conecta 4: 78,05 % de tasa de movimiento óptimo sobre 2.000 posiciones retenidas con 26–38 fichas.
- Lectura de estado a partir del historial de movimientos, con sensibilidad demostrada a la secuencia (no solo a la geometría del tablero).
- Inferencia en navegador vía ONNX: WebGPU y wasm.
- Ejecución en CPU/dispositivo: el tamaño (2,83 MB de pesos) permite despliegue *on-device* sin GPU dedicada.
- No soporta *tool calling*, *function calling* ni uso como agente multi-paso.
- No tiene capacidades multilingües, de visión, audio ni modo de razonamiento explícito (*thinking*).
- No genera texto libre: su salida es un vector de puntuaciones.

## Casos de uso

- Bot de Conecta 4 en navegador: el modelo se integra como `onepass-c4-8x24.onnx` y responde en 3,9 ms por decisión con WebGPU y 7,8 ms con wasm sobre Chrome/M4, lo que permite un rival con respuesta percibida como instantánea sin backend.
- Aplicación móvil o de escritorio *offline*: con 2,83 MB de pesos y licencia MIT, puede embeberse en un binario o en una PWA y funcionar sin conexión ni servidor de inferencia.
- Componente de puntuación en un motor de búsqueda de partidas: usar el modelo como función de evaluación de hoja dentro de un minimax o MCTS, reduciendo la profundidad necesaria para alcanzar una calidad de juego dada.
- Tutor o analizador de partidas: comparar el movimiento jugado por un humano con las puntuaciones del modelo sobre las opciones legales para señalar errores y alternativas, aprovechando que las etiquetas de entrenamiento provienen del solver exacto.
- Ajuste de dificultad en videojuegos y demos: el modelo ofrece un rival de nivel intermedio medible (40–0 frente a un bot de profundidad 1, 0–40 frente a bots de profundidad 2 y 4), útil como escalón de dificultad calibrado.
- Generación de datos y anotación: usar las puntuaciones del modelo para prefiltrar posiciones antes de invocar un solver exacto mucho más costoso, en una canalización de anotación de partidas.
- Investigación sobre especialistas de un solo pase: sirve como banco de pruebas reproducible y de tamaño mínimo para estudiar el paradigma (contexto en bytes, puntuación de opciones) y compararlo con alternativas autorregresivas.
- Prueba de regresión del *toolkit* `one-pass-specialists`: al ser un modelo pequeño con métricas publicadas (78,05 % de tasa óptima), permite validar cambios en el *toolkit* de entrenamiento o en la exportación ONNX de extremo a extremo.
- Evaluación de robustez de representaciones: el experimento de reescritura de tablero frente a barajado de historial es replicable y sirve como caso de estudio sobre qué señal aprende realmente un modelo pequeño.

## Benchmarks y rendimiento

Resultados publicados por el autor en la *model card*:

| Métrica | Valor |
|---|---:|
| Tasa de movimiento óptimo (2.000 posiciones retenidas, 26–38 fichas) | 78,05 % |
| Prior de columna central (una línea de código, línea base) | 62,15 % |
| Tasa de movimiento óptimo sin historial de movimientos en el contexto | 54,75 % |
| Variación al reescribir el tablero (propietario de cada ficha intercambiado, mismas alturas) | +0,15 puntos |
| Variación al barajar el historial de movimientos | −16,2 puntos |
| Partidas contra bot escrito a mano de profundidad 1, modelo como primer jugador | 40–0 (a favor del modelo) |
| Partidas contra bots de profundidad 2 y 4 | 0–40 (en contra del modelo) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no serían aplicables a un modelo de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en fp32 con los pesos completos (2,83 MB) más el *overhead* del runtime ONNX; irrelevante a efectos prácticos.
- GPU recomendadas: ninguna en concreto. Funciona en cualquier GPU integrada o dedicada compatible con WebGPU, y también en CPU.
- Compatibilidad con GPU de consumo: sí, en cualquier GPU de consumo, e incluso sin GPU. El autor reporta 3,9 ms por decisión sobre WebGPU en Chrome y 7,8 ms sobre wasm, medido en un Apple M4.
- Opciones de despliegue: ONNX Runtime (nativo) y ONNX Runtime Web con *backend* WebGPU o wasm. Los pesos `safetensors` se cargan mediante el *toolkit* `precisit/one-pass-specialists`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y en la práctica no aplican porque el modelo no es autorregresivo de texto.
- Latencia y throughput: 3,9 ms por decisión (WebGPU) y 7,8 ms por decisión (wasm) en Chrome sobre M4, según el autor. El throughput no se publica de forma explícita, pero equivale a unas 256 decisiones/s y 128 decisiones/s respectivamente en ese entorno, si se asume coste constante por decisión.

## Comparativa con modelos similares

No se dispone de modelos comparables publicados en la información proporcionada; `onepass-c4` es un especialista de dominio cerrado sin equivalentes documentados en la búsqueda realizada. Como referencia, la comparación relevante es contra líneas base triviales y bots clásicos:

| Alternativa | Tipo | Parámetros | Contexto | Rendimiento | Licencia / disponibilidad |
|---|---|---|---|---|---|
| `precisit/onepass-c4` | One-pass specialist entrenado | 706.048 | 224 bytes | 78,05 % de movimientos óptimos; 40–0 vs profundidad 1; 0–40 vs profundidad 2 y 4 | MIT; pesos en HF y ONNX |
| Prior de columna central | Heurística (una línea de código) | 0 | No aplica | 62,15 % de movimientos óptimos | No aplica |
| Bot de profundidad 1 | Búsqueda clásica | 0 | No aplica | 0–40 contra el modelo | No disponible |
| Bot de profundidad 2 / 4 | Búsqueda clásica | 0 | No aplica | 40–0 contra el modelo | No disponible |
| `precisit/one-pass-sv-forms` | One-pass specialist (mismo paradigma, otro dominio) | No disponible | No disponible | No disponible | MIT; publicado en HF |

Los resultados de la búsqueda web realizada no aportaron enlaces ni datos técnicos relevantes sobre este modelo o sobre alternativas comparables.

## Limitaciones y advertencias

- Rendimiento modesto en términos absolutos: 78,05 % de movimientos óptimos implica que aproximadamente uno de cada cinco movimientos no es el mejor según el solver en las posiciones evaluadas.
- Pierde de forma sistemática contra búsqueda clásica: 0–40 contra bots de profundidad 2 y 4. No es un sustituto de un motor de búsqueda si se busca juego fuerte.
- Dependencia del historial de movimientos: la señal que utiliza no es la geometría del tablero. Si la aplicación entrega posiciones sin historial (por ejemplo, posiciones cargadas desde una notación de tablero), el rendimiento cae al 54,75 %, por debajo del prior de columna central. Cualquier integración debe preservar y formatear correctamente el historial.
- Dominio cerrado: solo Conecta 4 en posiciones de 26–38 fichas. Se desconoce su comportamiento en aperturas y fases iniciales, y no es transferible a otros juegos o tareas sin reentrenamiento.
- Riesgo de alucinación: no aplica en el sentido habitual, porque el modelo no genera texto. El riesgo equivalente es una puntuación de opción incorrecta y confiada, sin mecanismo de abstención ni de incertidumbre calibrada documentado.
- Sesgos: el autor no documenta análisis de sesgo. Dado que las etiquetas provienen de un solver exacto y el dominio es un juego resuelto, el sesgo relevante es de cobertura del conjunto de posiciones (26–38 fichas), no demográfico.
- Idiomas: el modelo no procesa lenguaje natural; no hay capacidades multilingües que evaluar.
- Licencia: MIT, sin restricciones para uso comercial, pero conviene citar la procedencia (`precisit/mira-spikes`, `precisit/one-pass-specialists`) por trazabilidad.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, y fecha de creación posterior a la de esta revisión en los metadatos del repositorio. Es un artefacto de investigación, sin garantías de mantenimiento ni de compatibilidad futura de la exportación ONNX.
- No soporta *tool calling*, agentes ni integración en pipelines de texto; cualquier uso en producción debe tratar el modelo como una función de puntuación pura.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/precisit/onepass-c4
- Demo jugable: https://precisit.github.io/onepass-web/demo/c4/
- Modelo predecesor de la familia: https://huggingface.co/precisit/one-pass-sv-forms
- Repositorio del *spike* de entrenamiento (`c4-onepass`): https://github.com/precisit/mira-spikes
- *Toolkit* de especialistas de un solo pase: https://github.com/precisit/one-pass-specialists
