# houssemzaier/jeff-gestures

## Resumen

Jeff Gestures es un modelo de clasificación de texto derivado de Jeff v1.3, un modelo de decisión de 0,8B construido sobre Qwen3.5-0.8B. Lo desarrolla el usuario houssemzaier y su función es elegir el gesto que debe ejecutar un avatar conversacional (sonrisa, tocar mentón, inclinar la cabeza, etc.) a partir del mensaje que acaba de recibir el usuario. El modelo se distribuye principalmente como un archivo GGUF Q8_0 de 1,08 GB pensado para ejecutarse en un teléfono mediante llama.cpp dentro de la aplicación Iris.

La arquitectura subyacente es Qwen3.5-0.8B: 24 capas con estado oculto de 1.024 dimensiones, de las cuales 18 usan atención lineal (Gated DeltaNet) y cada cuarta capa usa atención completa. Sobre esa base se ha fusionado un adaptador LoRA de rango 16 (alpha 32) aplicado a 150 matrices de pesos, junto con las filas de "readout" propias del esquema de decisión de Jeff. En total son 10,5 millones de parámetros entrenados, aproximadamente el 1% de los 1.006 millones de parámetros del archivo final.

Su relevancia es acotada pero concreta: demuestra un caso de uso de modelos pequeños en dispositivo (on-device) para toma de decisiones discretas de baja latencia, con un mecanismo de calibración explícito (temperatura y margen por exportación) y una evaluación separada entre mensajes vistos y no vistos, incluyendo multilingüismo. No es un modelo generativo de propósito general, sino un clasificador de siete clases con una capa de reglas deterministas para señales claras.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido basado en Qwen3.5-0.8B (18 capas de atención lineal Gated DeltaNet y atención completa cada cuarta capa, 24 capas en total, estado oculto de 1.024) con LoRA fusionado y readout de decisión de Jeff |
| Parámetros totales | 1.006.672.704 (aproximadamente 1,0B) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0 (archivo principal); el adaptador LoRA se distribuye en GGUF y en formato PEFT para PyTorch |
| Idiomas soportados | Multilingüe; inglés, francés, árabe y Arabizi de forma explícita, más los 96 idiomas del selector de idioma de la aplicación |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q8_0 y LoRA GGUF), safetensors/PEFT para el adaptador en PyTorch |

## Arquitectura y entrenamiento

El modelo parte de Jeff v1.3 (`mstrasser/jeff-base`, revisión v1.3), que a su vez es Qwen3.5-0.8B entrenado para decidir: recibe un estado, una pregunta y hasta 254 opciones, y responde con un único código en una sola pasada. Su "readout" son las filas de salida correspondientes a esos códigos. Sobre esta base se aplica un LoRA de rango 16 (alpha 32) sobre 150 matrices de pesos de las 24 capas: `q_proj`, `k_proj`, `v_proj` y `o_proj` en las capas de atención completa; `in_proj_qkv`, `in_proj_z` y `out_proj` en las lineales; y `gate_proj`, `up_proj` y `down_proj` en el MLP de cada capa. A ello se suman las filas de readout de Jeff, totalizando 10,5 millones de números entrenados. El resto de pesos permanece congelado. Posteriormente el adaptador se fusiona en los pesos de Jeff y todo se redondea a 8 bits (Q8_0).

El entrenamiento se realizó exclusivamente con mensajes inventados, según indica la model card, y el registro de la ejecución (`training/train-r5-hard.log`) incluye evaluaciones en los pasos 0, 82, 164, 246, 328 y 410. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO. La innovación técnica destacable no está en la arquitectura, sino en el mecanismo de decisión: una capa previa de reglas para señales claras (saludos, agradecimientos, despedidas en inglés, francés o árabe) y, en su defecto, un softmax sobre las puntuaciones de los siete códigos de respuesta (A a G) con temperatura T = 1,3478 y un margen m = 0,8 específicos de esta exportación. Si el mejor gesto no supera a `listen` por más de m, se elige el asentimiento. Tanto T como m dependen del archivo y deben recalibrarse en cada nueva exportación.

## Capacidades

- Clasificación de texto en siete clases discretas: `smile`, `touch_chin`, `tilt_head_right`, `lean_slow`, `touch_hair`, `move_subtle` y `listen` (asentimiento).
- Decisión en una sola pasada: el modelo responde con un código y la aplicación lee las log-probabilidades de los siete tokens de respuesta, cuyos identificadores están en el archivo `.jeff.json`.
- Reglas deterministas para señales claras (saludos, agradecimientos, muestras de cariño, despedidas) en inglés, francés y árabe, aplicadas antes del modelo.
- Soporte multilingüe: inglés, francés, árabe y Arabizi de forma explícita; cobertura declarada de los 96 idiomas adicionales del selector de la aplicación.
- Uso en dispositivo (on-device) mediante llama.cpp, con un archivo GGUF de 1,08 GB y lectura en sitio por parte de la GPU en iOS.
- Compatibilidad con `endpoints_compatible` y con el ecosistema llama.cpp, incluido el uso del adaptador LoRA por separado con `--lora`.
- No dispone de generación de texto libre, razonamiento multi-paso, tool calling, visión ni audio: es un clasificador de decisión acotado a su esquema de siete opciones.

## Casos de uso

- Avatares conversacionales en aplicaciones móviles: el modelo lee el último mensaje del usuario y selecciona el gesto del avatar entre siete reacciones, con una latencia medida de 0,26 s por mensaje (mediana) en un iPhone 16 Plus dentro de la aplicación Iris.
- Asistentes de acompañamiento o bienestar emocional: la capa de reglas detecta agradecimientos, muestras de cariño o despedidas y responde con el gesto correspondiente, mientras que el modelo cubre los mensajes sin señal explícita.
- Aplicaciones de práctica de idiomas con personajes animados: al cubrir inglés, francés, árabe y Arabizi, el mismo archivo sirve para distintas configuraciones regionales sin desplegar modelos separados.
- Despliegue en dispositivos de gama alta sin servidor: con Q8_0 el modelo ocupa 1,08 GB en disco y la aplicación completa unos 0,69 GB de RAM en iOS (medido con el archivo de la ronda 3), lo que permite funcionar sin conexión.
- Prototipado de interfaces de reacción no verbal: el esquema de códigos A–G y el archivo `.jeff.json` con temperaturas y margen facilitan sustituir o ampliar el conjunto de gestos en una aplicación existente.
- Investigación sobre calibración de clasificadores pequeños: el par (T, m) por exportación y la comparación entre el modelo base, el ajustado y el cuantizado ofrecen un caso reproducible de cómo el redondeo a 8 bits desplaza las puntuaciones y exige recalibrar los umbrales.
- Filtrado previo de intención en pipelines de agentes: como clasificador de bajo coste, puede decidir la reacción inmediata antes de invocar un modelo mayor para la respuesta textual.

## Benchmarks y rendimiento

Resultados medidos con llama.cpp b10453 en un Mac mini (Metal) y, para los conjuntos no vistos, en un OnePlus 12. La columna "Aciertos / gestos reales / errores" indica reacciones válidas (un asentimiento puede ser correcto), gestos acertados que no son asentimiento y gestos que no encajan.

| Conjunto | Qwen3 0.6B (primer modelo de la app) | Jeff v1.3 solo | Este archivo, margen 0,8 |
|---|---|---|---|
| No vistos cortos (120 mensajes: inglés, francés, árabe, Arabizi) | 59 / 21 / 0 | 79 / 61 / 12 | 93 / 71 / 0 |
| No vistos largos (120) | 58 / 14 / 0 | 79 / 69 / 28 | 99 / 79 / 1 |
| Mundiales cortos (2.880: los mismos mensajes en 96 idiomas) | 32% / 2% / 0% | 53% / 37% / 12% | 62% / 39,5% / 4,5% |
| Mundiales largos (1.440) | 39% / 1% / 0% | 53% / 47% / 37% | 75% / 56% / 2,2% |

En el iPhone 16 Plus, dentro de la aplicación, este archivo reprodujo la elección del Mac para los 4.462 mensajes de los cuatro conjuntos (probabilidades con diferencias inferiores a 0,001) con 0,26 s por mensaje (mediana, conjunto no visto corto). En cuanto a memoria, en iOS la huella de la aplicación no crece al usar un Q8_0 de este tamaño (0,69 GB frente a 0,79 GB con Jeff v1.3 Q4_K_M, medido con el archivo de la ronda 3), porque la GPU lee el archivo en sitio; en Android con CPU, llama.cpp copia los pesos a memoria propia, unos 0,6 GB más que Jeff v1.3 Q4_K_M (estimado), lo que sitúa la aplicación completa en torno a 2,8 GB con ambos modelos.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el archivo Q8_0 ocupa 1,08 GB en disco; en iOS la aplicación completa consume 0,69 GB de RAM (medición con el archivo de la ronda 3); en Android con CPU se estiman unos 2,8 GB para la aplicación con ambos modelos.
- GPU recomendadas: no se especifican modelos de GPU de escritorio; las mediciones publicadas usan un Mac mini con Metal y un iPhone 16 Plus, además de un OnePlus 12 en CPU.
- Compatibilidad con GPU de consumo: cabe en dispositivos móviles de gama alta; no hay datos publicados sobre RTX 4090, A100 o H100.
- Opciones de despliegue: llama.cpp (versión b10453 en las pruebas), con soporte de `--lora` para el adaptador separado; el adaptador PEFT está pensado para PyTorch apuntando a una copia local de `mstrasser/jeff-base` v1.3. No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: 0,26 s por mensaje (mediana, conjunto no visto corto) en iPhone 16 Plus dentro de la aplicación. No se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeff Gestures (este modelo) | 1,006B | no disponible | Clasificación en 7 gestos | Apache-2.0 | GGUF Q8_0, LoRA GGUF y adaptador PEFT en HuggingFace |
| Jeff v1.3 (`mstrasser/jeff-base`) | 0,8B (según la model card) | no disponible | Decisión genérica con hasta 254 opciones | Apache-2.0 (derivado de Qwen3.5-0.8B) | Pesos base y GGUF en HuggingFace |
| Qwen3 0.6B | 0,6B | no disponible | Modelo generativo de propósito general | no disponible en la información | Usado como primer modelo de la aplicación; resultados inferiores en las pruebas citadas |

La comparación se limita a los modelos que aparecen en la información proporcionada. No se dispone de datos de benchmarks de Qwen3 0.6B ni de Jeff v1.3 más allá de las tablas de resultados anteriores, por lo que no se incluyen cifras adicionales.

## Limitaciones y advertencias

- Es un clasificador de siete clases, no un modelo generativo: no produce texto libre, no razona en varios pasos y no soporta tool calling, visión ni audio.
- El conjunto de gestos está fijado por el archivo `.jeff.json`; ampliarlo o cambiarlo requiere reentrenar el adaptador y recalibrar T y m.
- Los umbrales T = 1,3478 y m = 0,8 son específicos de esta exportación Q8_0; cualquier nueva cuantización o fusión exige recalcularlos, ya que el redondeo a 8 bits desplaza las puntuaciones.
- Entrenado únicamente con mensajes inventados, según la model card: el comportamiento sobre mensajes reales de producción puede diferir del medido en los conjuntos de evaluación.
- En los conjuntos "mundiales cortos" (96 idiomas adicionales) el modelo no alcanza el umbral declarado: 62% de aciertos frente a la barra fijada, con un 4,5% de gestos incorrectos.
- Persisten errores de gesto inadecuado, especialmente en los conjuntos mundiales (2,2% en los largos), lo que en un contexto sensible (malas noticias, duelo) puede resultar inapropiado.
- No se documentan sesgos demográficos, culturales ni lingüísticos específicos; la cobertura de 96 idiomas se evalúa solo de forma agregada.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de clasificación errónea cuando el mensaje carece de señal clara y el margen no se supera.
- La licencia Apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3.5-0.8B y de Jeff v1.3; conviene verificar las licencias de ambos antes de un despliegue en producción.
- No se publican datos de contexto máximo, composición del dataset de entrenamiento ni resultados de benchmarks estándar (MMLU, HumanEval, GSM8K), por lo que no es comparable en esas dimensiones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/houssemzaier/jeff-gestures
- Modelo base Jeff v1.3: https://huggingface.co/mstrasser/jeff-base
- GGUF del modelo base: https://huggingface.co/mstrasser/jeff-base-gguf (revisión `a5d0e595`)
- Kit de Jeff: https://github.com/firelex/jeff
- Qwen3.5-0.8B (modelo original de Qwen): no disponible en la información proporcionada
- Aplicación Iris: no disponible en la información proporcionada
