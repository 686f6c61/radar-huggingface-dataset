# nvidia/Flora-Captioner

## Resumen

Flora-Captioner (también referido como Flora-captioner-27B) es un modelo visión-lenguaje desarrollado por NVIDIA para generar instrucciones de acción sobre intervalos temporales concretos de vídeos de manipulación robótica o humana. Forma parte del motor de datos Flora, el pipeline que NVIDIA utilizó para entrenar GR00T-2, y se publica para que investigadores y desarrolladores puedan escalar la anotación de sus propios conjuntos de datos de robótica. El modelo no describe el vídeo completo: recibe bloques temporales etiquetados como BEFORE, TARGET y AFTER, y produce una única instrucción de acción referida exclusivamente al bloque TARGET, usando el contexto vecino para desambiguar la operación local.

Arquitectura Qwen3.5 nativamente multimodal: un encoder visual seguido de un decoder-only de lenguaje, con 27.356.728.560 parámetros totales (aproximadamente 2,7 × 10^10). Deriva de Qwen/Qwen3.5-27B mediante fine-tuning supervisado seguido de optimización con RL (GRPO) y una recompensa de calidad de caption anclada a referencias. El contexto de procesamiento declarado en el perfil de inferencia nativo es de 32.768 tokens de secuencia, con un presupuesto máximo de 64 fotogramas repartidos entre los bloques temporales.

Su relevancia actual es doble: por un lado, expone una receta concreta de anotación temporal para datos de robótica, un cuello de botella habitual en el entrenamiento de políticas de manipulación; por otro, su licencia NVIDIA OneWay Noncommercial restringe el uso a investigación y desarrollo no comercial, lo que condiciona por completo su adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer visión-lenguaje: encoder visual nativamente multimodal + LLM decoder-only (base Qwen3.5) |
| Parametros totales | 27.356.728.560 (≈2,7 × 10^10) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens de secuencia (presupuesto del procesador en el perfil de inferencia nativo); presupuesto de 64 fotogramas entre bloques |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA OneWay Noncommercial License (22 de marzo de 2022); modelo base Qwen3.5-27B bajo Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-27B, un VLM con encoder visual nativamente multimodal y decoder de lenguaje. El entrenamiento se realiza en dos etapas. En la primera, un fine-tuning supervisado actualiza todos los pesos del modelo de lenguaje y del merger visual, sin LoRA, manteniendo congelados el patch embedding visual y los bloques del transformer visual. En la segunda, el modelo supervisado se optimiza con aprendizaje por refuerzo mediante Group Relative Policy Optimization (GRPO), usando una recompensa de calidad de caption anclada a referencias y con el encoder visual congelado.

El flujo de inferencia es específico: los fotogramas muestreados se codifican con el encoder visual; los tokens visuales de los bloques etiquetados BEFORE, TARGET y AFTER se combinan con el prompt de anotación y se pasan al decoder, que genera autorregresivamente una instrucción para TARGET. Las operaciones puramente contextuales no forman parte de la salida solicitada. El perfil nativo especifica muestreo adaptativo a duración a 8 Hz nominales, con 8-40 fotogramas para TARGET y 4-12 por bloque de contexto disponible, un máximo de 64 fotogramas totales, preservación de la relación de aspecto y topes de 262.144 píxeles por cámara individual o 524.288 píxeles por mosaico de tres cámaras antes del resize del procesador. El procesador nativo usa `min_pixels=1024`, `max_pixels=589824` y `do_sample_frames=False`.

## Capacidades

- Generación de instrucciones de acción para un intervalo objetivo en vídeos de manipulación robótica o humana, con una sola instrucción por TARGET.
- Uso de contexto temporal vecino (BEFORE y AFTER) para desambiguar la operación local del intervalo objetivo.
- Procesamiento de vídeo desde una cámara o desde tres cámaras sincronizadas, con roles de cámara indicados en el prompt.
- Entrada multimodal: vídeo RGB decodificado con metadatos de temporización de los fotogramas fuente, más prompt de texto y, opcionalmente, una instrucción de tarea del episodio.
- Planificación de muestreo adaptativa a la duración del intervalo, con preservación del orden cronológico y de la duración completa de cada bloque.
- Integración con el procesador y la plantilla de chat de Qwen3.5.
- Tool calling, function calling, agentes multi-step, modo thinking, audio y otras capacidades generales del modelo base: no disponibles en la información proporcionada.

## Casos de uso

- Anotación de conjuntos de datos de robótica: generar etiquetas de acción por intervalo temporal para vídeos de demostración, alimentando el balanceo de la distribución de datos de preentrenamiento tal como hace el motor Flora.
- Investigación en transferencia humano-robot: anotar demostraciones humanas con instrucciones de acción que después se mapean a trayectorias de robot.
- Curación y filtrado de datos: usar las captions generadas como señal para monitorizar y filtrar pipelines de datos de modelos fundacionales de robótica.
- Prototipado de pipelines de anotación: evaluar la calidad de las etiquetas temporales antes de invertir en anotación humana, gracias a la salida acotada a un único TARGET.
- Auto-investigación física: generar descripciones de operaciones locales sobre vídeos experimentales para su posterior análisis automatizado.
- Segmentación y stitching temporal: combinado con un segmentador previo que produzca los intervalos TARGET, el modelo completa la parte textual del pipeline de anotación.
- Vídeos multi-cámara: anotar demostraciones grabadas con tres cámaras sincronizadas indicando los roles de cada una en el prompt.

## Benchmarks y rendimiento

La model card referencia el dataset WGO-bench como benchmark, pero no se han publicado resultados numéricos en la información disponible.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia de orden de magnitud, un modelo de 27,36 × 10^9 parámetros en safetensors ocupa aproximadamente 54,7 GB en precisión de 16 bits solo en pesos; a ello hay que sumar el coste del encoder visual y de la caché de tokens de vídeo (hasta 64 fotogramas y 32.768 tokens de secuencia).
- GPU recomendadas: no disponibles en la información proporcionada.
- Viabilidad en GPU de consumo: no disponible; el tamaño del repo (164,2 GB) y el número de parámetros hacen improbable un despliegue cómodo en GPU de consumo sin cuantización, dato que no se especifica.
- Opciones de despliegue: transformers (librería declarada), con procesador y plantilla de chat de Qwen3.5; el tag `endpoints_compatible` sugiere compatibilidad con endpoints. vLLM, llama.cpp, Ollama o TGI: no disponibles en la información proporcionada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas de alternativas en la información proporcionada. La siguiente tabla recoge únicamente los datos verificables del modelo base y deja el resto como no disponible.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Flora-Captioner | 27,36 × 10^9 | 32.768 tokens de secuencia | Caption de acción por intervalo temporal en vídeo | NVIDIA OneWay Noncommercial | Hugging Face (nvidia/Flora-Captioner) |
| Qwen3.5-27B (base) | no disponible | no disponible | VLM generalista | Apache 2.0 | Hugging Face (Qwen/Qwen3.5-27B) |
| Alternativas de captioning de vídeo para robótica | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia NVIDIA OneWay Noncommercial: uso limitado a investigación y desarrollo no comercial; no está soportado para uso comercial ni en producción.
- El modelo está diseñado exclusivamente para anotación: no debe usarse para controlar robots directamente ni como único monitor de seguridad de un sistema físico.
- Riesgo de alucinación: al generar instrucciones a partir de vídeo, puede producir descripciones plausibles pero no observadas, especialmente con contexto limitado o intervalos cortos.
- Dependencia del planificador de fotogramas: las fuentes cortas requieren la política de planificación de referencia en lugar de observaciones inventadas; un muestreo incorrecto degrada la calidad de la caption.
- Restricciones de entrada: presupuesto máximo de 64 fotogramas, topes de píxeles por cámara y por mosaico, y necesidad de metadatos de temporización correctos; no se especifican límites de resolución más allá de los del procesador.
- Idiomas soportados: no disponibles; no se puede garantizar calidad multilingüe en las instrucciones generadas.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Al ser un fine-tuning sobre Qwen3.5-27B, hereda las limitaciones del modelo base, cuyos detalles no se recogen en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/Flora-Captioner
- Licencia NVIDIA OneWay Noncommercial: https://huggingface.co/nvidia/Flora-Captioner/blob/main/LICENSE.pdf
- Licencia alternativa en PDF: https://developer.download.nvidia.com/licenses/NVIDIA-OneWay-Noncommercial-License-22Mar2022.pdf
- Modelo base Qwen3.5-27B: https://huggingface.co/Qwen/Qwen3.5-27B
- Licencia del modelo base (Apache 2.0): https://huggingface.co/Qwen/Qwen3.5-27B/blob/fc05daec18b0a78c049392ed2e771dde82bdf654/LICENSE
- NVIDIA Isaac GR00T: https://developer.nvidia.com/isaac/gr00t
- GR00T N1 White Paper: https://arxiv.org/abs/2503.14734
- Benchmark WGO-bench: https://huggingface.co/datasets/macrodata/WGO-Bench
