# alan13367/Qwen3.5-4B-RustCoder-MLX-8bit

## Resumen

Qwen3.5-4B-RustCoder-MLX-8bit es un ajuste fino del modelo Qwen3.5-4B de Alibaba Qwen, especializado en la generacion de codigo Rust que compile, supere tests ocultos y pase el linter clippy. Lo publica el usuario alan13367 en Hugging Face y se distribuye como checkpoint MLX cuantizado a 8 bits (group size 64), con el adaptador LoRA fusionado en los pesos de mlx-community/Qwen3.5-4B-MLX-8bit. Esta pensado para ejecutarse en Apple Silicon mediante la libreria MLX y mlx-vlm.

El modelo parte de una arquitectura Qwen3.5 con 4.539.265.536 parametros totales (aproximadamente 4,5B) y conserva el modo thinking del modelo base, asi como la torre de vision original sin entrenar. El entrenamiento se realizo mediante LoRA SFT sobre las ultimas 16 capas del decoder, con un total de 739 muestras y 784k tokens entrenados en 402 pasos, filtrando cada respuesta con una compuerta que compila el codigo, ejecuta tests ocultos y aplica lint.

Su relevancia radica en que demuestra una mejora medible y acotada sobre el modelo base en una tarea dificil (Rust) con un presupuesto de entrenamiento muy reducido, manteniendo ademas las capacidades generales casi intactas (KL de 0,026 nats/token y 94,2% de acuerdo top-1 respecto al base en texto general). Es un caso practico de ajuste fino con datos generados por el propio modelo y trazas de profesor filtradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, con torre de vision del base) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits, group size 64 (MLX); existe version bf16 safetensors en alan13367/Qwen3.5-4B-RustCoder |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3.5, con 4,54B parametros, que conserva el layout del base, incluida la torre de vision (no entrenada). El checkpoint distribuido aqui es la version MLX a 8 bits con group size 64, obtenida al fusionar el adaptador LoRA en los pesos de mlx-community/Qwen3.5-4B-MLX-8bit. El ajuste fino se realizo con LoRA SFT durante una epoca, rango 16, alpha 32, dropout 0,05, aplicado sobre las ultimas 16 capas del decoder, con learning rate 1e-4, batches de hasta 4096 tokens y un total de 402 pasos. La perdida de validacion fue 0,411.

El dataset de entrenamiento (739 muestras, 784k tokens) se compone mayoritariamente de datos generados y filtrados por una compuerta automatica: 238 intentos propios del modelo base que pasaron tests ocultos y lint, 277 autorreparaciones (el modelo corrige sus propios fallos a partir de la salida del compilador o de los tests), 175 trazas de profesor procedentes de DeepSeek V4.1 Flash (159 de ellas reparan intentos fallidos del 4B, filtradas por longitud y estilo) y 88 muestras de replay con prompts generales no relacionados con Rust para preservar capacidades. La perdida cubre solo la respuesta final; en los registros de reparacion, el intento fallido y el feedback son contexto, no objetivos de entrenamiento. Los experimentos del autor muestran que el modelo aprende mejor de su propio estilo: soluciones de referencia con razonamiento escrito por el modelo empeoraron el resultado (easy 41,4% a 26,7%), y las trazas de profesor sin filtrar tambien lo degradaron (easy 34,5%) por ensenar razonamiento excesivamente dubitativo.

## Capacidades

- Generacion de codigo Rust: funciones, correccion de errores de compilacion (E0308, E0277, E0599), refactorizacion, escritura de tests y tareas en dominios nuevos.
- Modo thinking activable (enable_thinking), heredado del modelo base.
- Razonamiento multi-paso dentro del bloque de pensamiento, con respuestas finales separadas.
- Reparacion iterativa de codigo a partir de la salida del compilador o de los tests.
- Generacion de texto general y respuesta conversacional (pipeline text-generation, etiqueta conversational).
- Capacidades multilingues limitadas al ingles segun la model card.
- Torre de vision presente en la arquitectura, aunque no entrenada ni evaluada en este ajuste.
- No se documenta soporte explicito de tool calling ni de function calling en la informacion disponible.

## Casos de uso

- Asistente de codificacion Rust en local sobre Apple Silicon: el checkpoint MLX 8 bits permite ejecutar el modelo en un Mac con memoria unificada suficiente, sin GPU dedicada, usando mlx-vlm con modo thinking activado y limite de 4096 tokens.
- Reparacion de errores de compilacion en bucle: dado el codigo fallido y la salida de rustc como siguiente turno del usuario, el modelo corrige una parte de sus fallos (autorreparaciones entrenadas con este formato); encaja en un pipeline que itere compilar, pasar el error y regenerar.
- Generacion de tests unitarios: el tier Quality del entrenamiento incluye escritura de tests; el modelo puede proponer casos de prueba para funciones Rust existentes, que luego se validan con cargo test.
- Refactorizacion con lint limpio: el modelo fue entrenado para que las refactorizaciones pasen clippy; util en tareas de limpieza de codigo donde se exige que el resultado no introduzca warnings.
- Prototipado de funciones pequenas y medianas: con un pass rate agrupado del 22,9% en el tier Dev y 51,7% en Easy, es adecuado para generar borradores que un desarrollador revisa y corrige, no para generacion autonoma sin supervision.
- Filtrado y generacion de datos de entrenamiento para Rust: el propio flujo del autor (compuerta de compilacion, tests y lint) puede reutilizarse para producir datasets de codigo verificados a partir de las salidas del modelo.
- Experimentacion academica con LoRA SFT y datos autogenerados: el modelo documenta de forma detallada el efecto de distintas fuentes de datos (intentos propios, autorreparaciones, trazas de profesor filtradas), lo que lo convierte en una referencia para estudiar tecnicas de ajuste con presupuesto reducido.

## Benchmarks y rendimiento

Pass rate (proporcion de respuestas cuyo codigo pasa los tests ocultos de la tarea; 4 muestras por tarea, thinking activado, sin system prompt; los tiers de test nunca se usaron en entrenamiento):

| Pass rate | Easy (29 tareas) | Hard (40) | Quality (29) | Dev (82) |
|---|---|---|---|---|
| Qwen3.5-4B (8-bit) | 41,4% | 7,5% | 8,6% | 20,7% |
| Qwen3.5-4B-RustCoder | 51,7% | 8,8% | 17,2% | 22,9% |

Agregado sobre las 180 tareas: +4,3 puntos sobre el base (IC 95% +0,6 a +8,2) y +0,046 de recompensa graduada (IC +0,012 a +0,081). Al menos 1 de los 4 intentos pasa en el 82,8% de las tareas Easy y en el 22,5% de las Hard. El autor advierte que los tiers son pequenos: un solo tier solo detecta ganancias de unos 9 puntos (Hard, Quality) o 14 puntos (Easy), por lo que solo la ganancia agregada queda establecida.

Capacidad general frente al base (subconjuntos de cada benchmark):

| | MMLU (200) | ARC-Challenge (150) | GSM8K (100) | HellaSwag (150) |
|---|---|---|---|---|
| Qwen3.5-4B (8-bit) | 69,5% | 89,3% | 92,0% | 80,7% |
| Qwen3.5-4B-RustCoder | 69,0% | 90,0% | 92,0% | 82,0% |

En texto general, la distribucion de tokens se mantiene cercana al base: KL de 0,026 nats/token y 94,2% de acuerdo top-1.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 5,2 GB en 8 bits; se necesita memoria unificada suficiente para cargar el checkpoint completo mas la cache KV durante la generacion.
- Plataforma objetivo: Apple Silicon (MLX); el autor indica mlx-vlm como via de ejecucion.
- GPU dedicadas (A100, H100, RTX 4090): no se documenta soporte en la informacion disponible; para transformers y herramientas no MLX el autor remite a la version bf16 alan13367/Qwen3.5-4B-RustCoder.
- Opciones de despliegue: mlx-vlm (comando python -m mlx_vlm.generate o API de Python load/generate); vLLM, llama.cpp, Ollama y TGI no se mencionan en la informacion disponible.
- Parametros recomendados de generacion: temperatura 0,6, top-p 0,95, top-k 20, max-tokens 4096, thinking activado y sin system prompt.
- Latencia y throughput: no disponibles. Como referencia de longitud, las respuestas que terminan consumen una mediana de unos 1,2k tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pass rate Rust (agregado) | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-4B-RustCoder-MLX-8bit | 4,54B | no disponible | +4,3 pts sobre el base (180 tareas) | apache-2.0 | safetensors MLX 8-bit |
| Qwen3.5-4B (8-bit) | no disponible | no disponible | referencia base | no disponible | MLX 8-bit |
| alan13367/Qwen3.5-4B-RustCoder (bf16) | no disponible | no disponible | mismo ajuste, sin cuantizar | apache-2.0 | safetensors bf16 |

No se dispone en la informacion proporcionada de datos de benchmarks de otros modelos comparables de la misma categoria (por ejemplo, otros ajustes de codigo Rust de ~4B), por lo que la comparativa se limita al modelo base y a la version bf16 del mismo ajuste.

## Limitaciones y advertencias

- Es un modelo de 4B y Rust es dificil para el: aproximadamente la mitad de sus respuestas del base y del ajuste previo no compilan, con errores tipicos de tipos, trait bounds y metodos (E0308, E0277, E0599).
- Las tareas multiparte dificiles rara vez pasan (tier Hard 8,8%); funciona mucho mejor con el compilador en el bucle, ya que corrige parte de sus fallos dados los errores, y el mejor de 4 intentos pasa con mucha mas frecuencia que uno solo.
- Sobrerrazona en ocasiones: conviene limitar la salida a unos 4096 tokens y remuestrear cuando una respuesta se queda atascada; un intento que llega al limite suele estar en un bucle de razonamiento.
- Solo se entreno la parte de texto; la torre de vision es la del base, sin cambios y sin probar en este ajuste.
- Idiomas: solo se declara ingles; no hay datos de rendimiento en castellano ni en otros idiomas.
- Sesgos: no se documentan sesgos especificos en la informacion disponible; al derivar de Qwen3.5-4B hereda los del modelo base, no evaluados aqui.
- Riesgo de alucinacion: no se cuantifica en la model card; el filtrado por compilacion y tests reduce el riesgo en codigo, pero no en texto general.
- Licencia apache-2.0, que permite uso comercial; conviene verificar las condiciones del modelo base Qwen3.5-4B y de mlx-community/Qwen3.5-4B-MLX-8bit antes de desplegar en produccion.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de uso en produccion ni validacion externa de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alan13367/Qwen3.5-4B-RustCoder-MLX-8bit
- Version bf16 para transformers: https://huggingface.co/alan13367/Qwen3.5-4B-RustCoder
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Checkpoint MLX de origen: https://huggingface.co/mlx-community/Qwen3.5-4B-MLX-8bit
- mlx-vlm (repositorio): https://github.com/Blaizzy/mlx-vlm
