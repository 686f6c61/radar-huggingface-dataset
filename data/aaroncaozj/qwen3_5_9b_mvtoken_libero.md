# aaroncaozj/qwen3_5_9b_mvtoken_libero

## Resumen

`aaroncaozj/qwen3_5_9b_mvtoken_libero` es un adaptador LoRA publicado con la librería PEFT sobre el modelo base Qwen/Qwen3.5-9B. El repositorio se etiqueta como `vision-language-action`, `robotics`, `manipulation`, `libero` y `discrete-actions`, lo que sitúa al modelo en la categoría de políticas visomotoras que reciben observaciones visuales (y, presumiblemente, instrucciones en lenguaje natural) y emiten acciones de manipulación representadas como tokens discretos en lugar de comandos continuos.

El adaptador ocupa 0,7 GB en `safetensors` y se distribuye bajo licencia MIT. Los pesos del modelo base (~9.000 millones de parámetros según su denominación) no se incluyen en el repositorio: es necesario descargar Qwen/Qwen3.5-9B por separado y aplicar el adaptador encima. La información pública del repositorio es mínima: no hay model card descriptiva, ni métricas, ni detalles sobre el procedimiento de entrenamiento más allá del dataset referenciado (`aaroncaozj/libero_show-harness_tokenized`).

Su relevancia es acotada pero ilustrativa. Por un lado, muestra el patrón actual de reutilizar un LLM/VLM de propósito general como cabecera de política robótica mediante fine-tuning eficiente con LoRA, en lugar de entrenar un modelo específico desde cero. Por otro, la tokenización discreta de acciones ("mvtoken", presumiblemente *movement token*) es una línea de trabajo activa para unificar robótica y modelado autoregresivo de secuencias. Con 0 descargas y 0 likes en el momento de la consulta, se trata de un experimento reciente (publicado el 24 de septiembre de 2026) sin validación externa conocida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No documentada en la información disponible; se infiere transformer denso multimodal (visión + lenguaje) con adaptador LoRA, según las etiquetas `vision-language-action` y `peft` |
| Parámetros totales | ~9.000 millones heredados del modelo base Qwen/Qwen3.5-9B; el adaptador LoRA añade una fracción no especificada (repositorio de 0,7 GB) |
| Parámetros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el repositorio solo publica el adaptador en `safetensors` (FP16/BF16 presumiblemente). No se han publicado versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible (el campo de idiomas del repositorio está vacío) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (adaptador LoRA compatible con PEFT) |
| Pipeline declarado | `robotics` |
| Modelo base | Qwen/Qwen3.5-9B |
| Dataset de entrenamiento declarado | aaroncaozj/libero_show-harness_tokenized |
| Tamaño del repositorio | 0,7 GB |
| Fecha de publicación | 24 de septiembre de 2026 |

## Arquitectura y entrenamiento

La información proporcionada no incluye detalles de arquitectura más allá de las etiquetas del repositorio. Se trata de un adaptador PEFT (LoRA) sobre un modelo base de ~9.000 millones de parámetros, orientado a una tarea de visión-lenguaje-acción. La etiqueta `discrete-actions` indica que las acciones de manipulación se codifican como tokens discretos que el modelo genera de forma autoregresiva, un enfoque alternativo a las cabezas de regresión continua o a los *action chunks* de los modelos de flow matching. El sufijo `mvtoken` del nombre sugiere un esquema de tokenización de movimiento, pero el autor no documenta su vocabulario, resolución ni granularidad.

Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni la estrategia de ajuste (qué módulos se adaptan, rango del LoRA, hiperparámetros). El único dato explícito es el dataset `aaroncaozj/libero_show-harness_tokenized`, presumiblemente una versión tokenizada de demostraciones del benchmark LIBERO, un conjunto de tareas de manipulación en simulación con variantes (LIBERO-Spatial, LIBERO-Object, LIBERO-Goal, LIBERO-Long, LIBERO-90/10). No se puede confirmar a partir de la información disponible si el adaptador entrena también el codificador visual o solo las capas de lenguaje.

## Capacidades

- Generación de acciones de manipulación robótica en entornos simulados tipo LIBERO, presumiblemente a partir de observaciones visuales e instrucciones en lenguaje natural.
- Representación de acciones como tokens discretos, lo que permite tratarlas con el mismo mecanismo de decodificación autoregresiva que el texto.
- Fine-tuning eficiente mediante LoRA: el adaptador puede aplicarse y retirarse sin modificar los pesos del modelo base.
- Reutilización del conocimiento del modelo base Qwen3.5-9B (comprensión de lenguaje natural y, presumiblemente, visión general), aunque no hay documentación sobre cuánto de ese conocimiento sobrevive al ajuste.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada (no se documenta si el modelo base lo conserva tras el ajuste).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el repositorio no declara idiomas.
- Modo *thinking*, audio u otras modalidades: no documentadas.

## Casos de uso

- Evaluación de políticas en LIBERO: el adaptador puede cargarse sobre Qwen3.5-9B y ejecutarse sobre las suites de tareas del benchmark para obtener tasas de éxito por tarea (Spatial, Object, Goal, Long), siempre que se reproduzca el formato de observación y de acción esperado.
- Reproducción de experimentos de tokenización discreta de acciones: sirve como referencia para comparar acciones tokenizadas frente a regresión continua o *action chunks* en la misma base de datos de demostraciones.
- Fine-tuning sobre nuevos conjuntos de demostraciones: al ser un adaptador LoRA de 0,7 GB, se puede reentrenar o continuar el ajuste con presupuestos modestos de GPU, partiendo del base congelado.
- Prototipado de investigación en visión-lenguaje-acción: punto de partida para estudiar cómo se comporta un LLM de ~9.000 millones como política cuando se le fuerza a emitir tokens de acción.
- Generación de trayectorias sintéticas en simulación: las acciones decodificadas pueden volcarse a un simulador para filtrar y ampliar datos de entrenamiento, siempre que se valide antes la tasa de éxito real.
- Docencia y demostraciones de IA encarnada: permite ilustrar en un cuaderno o taller el ciclo completo observación-visual → tokens → acción discreta → ejecución en simulador.
- Ablaciones de eficiencia: medir coste de inferencia y latencia de un VLA de 9.000 millones con decodificación autoregresiva de acciones frente a alternativas más ligeras.
- Integración en bucles de control con supervisión humana: dado que no hay evaluación publicada, un uso realista inicial es la experimentación en entornos controlados con un operador que valide cada política antes de cualquier despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye tabla de resultados, y la búsqueda web no devolvió documentación técnica asociada al modelo (los resultados obtenidos eran contenido no relacionado).

## Requisitos de hardware

Las cifras siguientes son estimaciones estándar para un modelo denso de ~9.000 millones de parámetros más el coste del codificador visual; el autor no publica mediciones.

- VRAM en BF16/FP16: en torno a 18-20 GB solo para pesos, más activaciones y caché KV; en la práctica, 24 GB o más para lotes pequeños.
- VRAM en cuantización de 8 bits: aproximadamente 9-11 GB.
- VRAM en cuantización de 4 bits (NF4): aproximadamente 5-7 GB, aunque el adaptador se ha publicado sin versiones cuantizadas, por lo que habría que cuantizar el base por separado.
- GPU de datacenter: A100 40/80 GB, H100 80 GB y L40S 48 GB ejecutan el modelo en BF16 sin dificultad.
- GPU de consumo: RTX 3090 y RTX 4090 (24 GB) son suficientes en BF16 con lotes pequeños; RTX 4080 (16 GB) o RTX 4070 Ti (12 GB) requieren cuantización de 8 o 4 bits.
- Despliegue: transformers + PEFT es la vía directa; vLLM con soporte de adaptadores LoRA es la opción recomendada para servir; TGI también admite adaptadores. `llama.cpp` y Ollama solo serían viables si se convierte el base a GGUF, algo que el autor no ha publicado.
- Latencia y throughput: no disponibles. Cabe esperar que la decodificación autoregresiva de acciones añada latencia proporcional al número de tokens de acción por paso de control, un factor crítico para control en tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3_5_9b_mvtoken_libero | ~9.000 M (base) + adaptador LoRA | VLA, acciones discretas tokenizadas | No disponible | MIT | Hugging Face; 0 descargas, 0 likes |
| Qwen/Qwen3.5-9B (modelo base) | ~9.000 M | LLM/VLM de propósito general | No disponible en la información proporcionada | No disponible en la información proporcionada | Público en Hugging Face |
| OpenVLA | ~7.000 M (referencia pública) | VLA con acciones discretas tokenizadas | No disponible en la información proporcionada | No disponible en la información proporcionada | Público |
| OpenVLA-OFT | ~7.000 M (referencia pública) | VLA con acciones continuas y decodificación paralela | No disponible en la información proporcionada | No disponible en la información proporcionada | Público |

No se dispone de datos comparativos de rendimiento entre estas alternativas dentro de la información proporcionada. La comparación relevante para un evaluador es contra la familia OpenVLA y sus variantes, que dominan el segmento de VLA abiertos evaluados en LIBERO, pero cualquier cifra concreta exigiría consultar sus respectivas publicaciones, no incluidas aquí.

## Limitaciones y advertencias

- Ausencia total de validación: 0 descargas y 0 likes, sin métricas publicadas ni evaluación independiente. No hay evidencia de que el modelo supere a un baseline trivial en LIBERO.
- Model card prácticamente vacía: no se documentan hiperparámetros de LoRA, número de pasos de entrenamiento, composición del dataset ni módulos adaptados, lo que dificulta la reproducibilidad.
- Espacio de acciones restringido: al usar acciones discretas tokenizadas, la política queda ligada al vocabulario y a la resolución de acción definidos durante el entrenamiento; transferirla a otro robot o a otro espacio de acción requiere reentrenamiento.
- Sesgo de simulación: el entrenamiento declarado es sobre demostraciones de LIBERO, un entorno simulado. El salto a hardware real (*sim-to-real*) no está documentado y suele degradar gravemente el rendimiento.
- Riesgo de alucinación y de deriva semántica: al ser un modelo de lenguaje generando tokens de acción, puede producir secuencias sintácticamente válidas pero físicamente inválidas; se necesita una capa de validación y de parada de seguridad.
- Idiomas no declarados: no se puede asumir buen comportamiento en instrucciones en castellano ni en ningún idioma concreto.
- Licencia: el adaptador es MIT, pero el uso comercial depende también de la licencia del modelo base Qwen/Qwen3.5-9B, que no se detalla en la información proporcionada. Verificar antes de cualquier uso productivo.
- Obsolescencia y mantenimiento: repositorio creado y actualizado el mismo día, sin historial posterior. No hay garantía de soporte, correcciones ni compatibilidad con versiones futuras de PEFT o transformers.
- Seguridad física: cualquier uso en un robot real exige límites de par, parada de emergencia y validación humana; el modelo no incorpora mecanismos de seguridad documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aaroncaozj/qwen3_5_9b_mvtoken_libero
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset declarado: https://huggingface.co/datasets/aaroncaozj/libero_show-harness_tokenized
- Perfil del autor: https://huggingface.co/aaroncaozj

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo (paper, blog, repositorio o demo). Los únicos enlaces verificables son los del propio repositorio de Hugging Face y sus dependencias declaradas.
