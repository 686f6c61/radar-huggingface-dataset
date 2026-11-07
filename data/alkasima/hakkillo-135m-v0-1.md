# alkasima/Hakkillo-135M-v0.1

## Resumen

Hakkillo-135M-v0.1 es un adaptador LoRA experimental publicado por el usuario alkasima sobre el modelo base SmolLM2-135M-Instruct de Hugging Face. No se trata de un modelo entrenado desde cero ni de un modelo autónomo: el repositorio contiene únicamente los pesos del adaptador (460.800 parámetros entrenables) que modifican las proyecciones query y value de la atención del transformer subyacente, de 134.515.008 parámetros.

El objetivo declarado es adaptar el modelo base como asistente conversacional breve en inglés, con instrucciones explícitas de brevedad y reconocimiento de desconocimiento. El entrenamiento es deliberadamente mínimo: 48 pasos en CPU, batch size 1, precisión float32, rango LoRA 8, learning rate 0.0001 y un conjunto sintético de 32 ejemplos de entrenamiento más 8 de desarrollo, todos generados por el propio autor.

Su relevancia es fundamentalmente didáctica y de experimentación: sirve como ejemplo reproducible de un pipeline LoRA completo (código, datos, métricas y hashes publicados) más que como modelo listo para producción. El autor no reclama ninguna mejora general ni validación de seguridad, y documenta fallos concretos observados en la versión 0.1.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base SmolLM2-135M-Instruct) con adaptador LoRA sobre proyecciones query y value |
| Parámetros totales | 134.515.008 (base) + 460.800 (adaptador entrenable) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base) |
| Tipos de cuantización | no disponible; el ejemplo oficial usa float32 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere los pesos base de HuggingFaceTB/SmolLM2-135M-Instruct en la revisión `12fd25f77366fa6b3b4b768ec3050bf629380bac` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre SmolLM2-135M-Instruct, un transformer decoder-only de 134,5 millones de parámetros. La modificación consiste en un LoRA de rango 8 sobre las proyecciones query y value de la atención, lo que añade 460.800 parámetros entrenables manteniendo congelados los pesos originales. El tokenizador y la plantilla de chat son los del modelo base.

El entrenamiento se ejecutó íntegramente en CPU durante 48 pasos, con batch size 1, precisión float32, learning rate 0.0001 y semilla 42. El conjunto de datos son 32 ejemplos sintéticos redactados por el autor para la tarea de asistente, con 8 ejemplos separados de desarrollo. No se documenta RLHF, DPO ni ninguna fase de alineamiento adicional. La única métrica publicada es la pérdida sobre tokens de asistente en el conjunto de desarrollo retenido: 2,8116 antes del entrenamiento y 2,5544 después. El propio autor advierte que este conjunto sintético tan reducido no permite establecer una mejora general.

## Capacidades

- Generación de texto conversacional breve en inglés, con plantilla de chat de sistema/usuario/asistente.
- Respuestas de estilo asistente con instrucción de sistema que promueve brevedad y admisión de desconocimiento.
- Ejecución en CPU: el ejemplo oficial fija `torch.set_num_threads(4)` y usa float32, lo que permite probarlo en hardware muy modesto.
- Reproducibilidad: el repositorio de código incluye `requirements.txt` con versiones fijadas, `training_metrics.json` con el registro de la ejecución y hashes de los datos.
- No soporta tool calling ni function calling según la información disponible.
- No soporta agentes ni razonamiento multi-paso de forma fiable.
- No tiene capacidades multimodales (visión, audio) ni modo de razonamiento explícito (thinking mode).
- No tiene acceso a información en vivo ni a herramientas, tal como declara la model card.

## Casos de uso

- Experimentación educativa con LoRA: el repositorio sirve para estudiar un ciclo completo de fine-tuning de bajo rango sobre un modelo pequeño, con datos, hiperparámetros, métricas y hashes publicados, lo que facilita la replicación en cursos o talleres.
- Pruebas de infraestructura de inferencia en CPU: al requerir solo float32 y unos pocos hilos, permite validar pipelines de `transformers` + `peft` en entornos sin GPU, como contenedores ligeros o máquinas de desarrollo.
- Prototipado de asistentes conversacionales triviales en inglés: con la plantilla de chat del modelo base y la instrucción de sistema incluida, se pueden generar respuestas breves para demos internas donde la exactitud no sea crítica.
- Comparación cualitativa de adaptadores: el repositorio de código incluye comparaciones cualitativas que permiten contrastar el comportamiento antes y después del LoRA en las mismas peticiones.
- Docencia sobre limitaciones de los LLM: los fallos documentados (inventar el tiempo en Lagos, una analogía incorrecta sobre evaporación, confundir una petición de reescritura con acceso a un fichero) son ejemplos concretos de alucinación y malentendido de instrucciones para ilustrar en clase.
- Base para experimentos propios de fine-tuning: al ser un adaptador Apache-2.0 sobre un base también permisivo, se puede partir de él para probar otros conjuntos de datos sintéticos y comparar pérdidas en desarrollo, siempre con expectativas ajustadas al tamaño del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada es la pérdida sobre tokens de asistente en el conjunto de desarrollo retenido: 2,8116 antes del entrenamiento y 2,5544 después, sobre 8 ejemplos sintéticos, lo que el autor califica explícitamente como insuficiente para establecer una mejora general.

## Requisitos de hardware

- VRAM estimada para inferencia: el ejemplo oficial usa float32 en CPU; con 134,5 millones de parámetros base más el adaptador, la huella en float32 ronda los 540 MB de pesos, y en float16 aproximadamente 270 MB (estimación a partir del número de parámetros, no publicada por el autor).
- GPU recomendadas: no se especifican; el modelo está pensado para CPU y cualquier GPU consumer moderna lo ejecuta con holgura.
- Cabe en cualquier GPU consumer: incluso tarjetas con 2-4 GB de VRAM son suficientes, y en CPU funciona con 4 hilos según el ejemplo oficial.
- Opciones de despliegue: `transformers` con `peft` (flujo documentado); no se mencionan vLLM, llama.cpp, Ollama ni TGI, y al ser un adaptador PEFT requiere cargar primero el modelo base.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Hakkillo-135M-v0.1 | 134,5 M base + 460.800 adaptador | no disponible | Apache-2.0 | Hugging Face (adaptador PEFT) | Experimental, 32 ejemplos sintéticos, sin benchmarks |
| SmolLM2-135M-Instruct | 134,5 M | no disponible en la información proporcionada | Apache-2.0 | Hugging Face | Modelo base original de Hugging Face, con entrenamiento a escala completa |
| SmolLM2-360M-Instruct | 360 M | no disponible en la información proporcionada | Apache-2.0 | Hugging Face | Alternativa de la misma familia con más parámetros |
| Qwen2.5-0.5B-Instruct | 0,5 B | no disponible en la información proporcionada | Apache-2.0 | Hugging Face | Modelo pequeño instructivo de otra familia, con más capacidad |

La comparación relevante es contra el propio modelo base: Hakkillo no aporta mejoras verificadas más allá de la pérdida en desarrollo, por lo que para cualquier uso práctico el SmolLM2-135M-Instruct original es la referencia directa.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo puede alucinar, repetirse, malinterpretar instrucciones y producir respuestas incorrectas.
- Fallos observados en la versión 0.1: inventar el tiempo actual en Lagos, una analogía incorrecta sobre la evaporación y confundir una petición de reescritura con una petición de acceso a un fichero.
- La mejora de pérdida en desarrollo (2,8116 a 2,5544) procede de 8 ejemplos sintéticos y no resuelve los fallos documentados.
- Solo validado para inglés; no está validado para uso multilingüe.
- No dispone de información en vivo ni de herramientas; no puede navegar ni ejecutar acciones.
- No validado para decisiones de alto impacto ni con evaluación de seguridad.
- Es un adaptador, no un modelo autónomo: requiere descargar y cargar el modelo base en la revisión indicada; redistribuirlo exige mantener la atribución y licencia originales de SmolLM2 (Apache-2.0).
- Uso comercial permitido por la licencia Apache-2.0, pero sin garantías de calidad ni idoneidad para producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin comunidad que valide su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alkasima/Hakkillo-135M-v0.1
- Repositorio de código y datos: https://github.com/alkasima/Hakkillo
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/alkasima/Hakkillo
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Revisión del modelo base: `12fd25f77366fa6b3b4b768ec3050bf629380bac`
