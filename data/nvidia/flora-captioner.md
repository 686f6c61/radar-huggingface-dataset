# nvidia/Flora-Captioner

## Resumen

Flora-Captioner es un modelo vision-lenguaje de NVIDIA construido sobre Qwen3.5-27B, especializado en la generación de instrucciones de acción para intervalos temporales concretos dentro de vídeos de manipulación robótica o humana. Forma parte del motor de datos Flora, el pipeline que NVIDIA utilizó para entrenar GR00T-2, y se libera para que la comunidad investigadora pueda anotar y escalar sus propios conjuntos de datos robóticos.

El modelo recibe fotogramas RGB organizados en bloques temporales etiquetados (BEFORE, TARGET y AFTER) junto con un prompt de anotación, y genera una única instrucción en lenguaje natural que describe la operación local del bloque TARGET. El contexto vecino sirve para desambiguar la acción objetivo, de modo que la salida no incluye operaciones que solo pertenecen al contexto.

Con 27.356.728.560 parámetros (aproximadamente 2,7 x 10^10), licencia Apache 2.0 y un presupuesto de secuencia de 32.768 tokens, Flora-Captioner se posiciona como una herramienta de investigación para curación, filtrado y monitorización de datos de robótica, no como un modelo de producción ni como controlador de robots.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer; modelo vision-lenguaje Qwen3.5 (encoder de visión nativamente multimodal con decodificador LLM decoder-only) |
| Parametros totales | 27.356.728.560 (2,7 x 10^10) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Presupuesto de secuencia de 32.768 tokens en el perfil de inferencia de referencia |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

Flora-Captioner parte de Qwen3.5-27B (revisión `fc05daec18b0a78c049392ed2e771dde82bdf654`), un modelo vision-lenguaje con encoder de visión nativamente multimodal y decodificador LLM decoder-only. El entrenamiento se realiza en dos etapas: primero un ajuste supervisado que actualiza todos los pesos del modelo de lenguaje y del merger visual, sin LoRA, manteniendo congelados el patch embedding visual y los bloques del transformer visual; después, una optimización con aprendizaje por refuerzo mediante Group Relative Policy Optimization (GRPO) con una recompensa de calidad de caption anclada a referencias, con el encoder de visión congelado.

En inferencia, los fotogramas muestreados se codifican con el encoder de visión y los tokens visuales de los bloques BEFORE, TARGET y AFTER se combinan con el prompt de anotación antes de pasar al decodificador, que genera autorregresivamente una instrucción para TARGET. El perfil nativo de referencia fija el muestreo adaptativo por duración del TARGET a 8 Hz nominales con 8–40 fotogramas, 4–12 fotogramas por bloque de contexto disponible y un presupuesto total máximo de 64 fotogramas; cada fotograma de una cámara se limita a 262.144 píxeles y cada mosaico de tres cámaras a 524.288 píxeles. El procesador Qwen3.5 entrenado usa `min_pixels=1024` y `max_pixels=589824`, y debe desactivarse el muestreo adicional de fotogramas con `do_sample_frames=False`.

## Capacidades

- Generación de instrucciones de acción en lenguaje natural para un intervalo temporal objetivo dentro de vídeos de manipulación robótica o humana.
- Comprensión de contexto temporal: usa bloques BEFORE y AFTER para desambiguar la operación local del TARGET.
- Procesamiento de vídeo multicámara: admite una cámara o tres cámaras sincronizadas, con papeles de cámara definidos en el prompt.
- Entrada de texto con prompt de anotación que identifica bloques temporales y roles de cámara, más una posible instrucción de tarea del episodio.
- Capacidad conversacional según los tags del modelo (`conversational`).
- Integración como componente del motor de datos Flora para balanceo de la distribución de datos de preentrenamiento.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, audio ni modo de razonamiento explícito.

## Casos de uso

- Anotación de conjuntos de datos robóticos: generar instrucciones de acción por intervalo temporal para etiquetar demostraciones de manipulación y alimentar el entrenamiento de modelos fundacionales de robótica.
- Balanceo de distribución de datos de preentrenamiento: en el motor Flora, los captions producidos por el modelo se usan para equilibrar la distribución de los datos de preentrenamiento, tal como se hizo para GR00T-2.
- Investigación en transferencia humano-robot: anotar vídeos de demostraciones humanas para estudiar la transferencia de habilidades hacia robots.
- Curación y filtrado de datos: prototipar pipelines de curación, filtrado y monitorización de datos de robótica evaluando la calidad de las anotaciones generadas.
- Investigación en physical auto-research: usar las anotaciones como señal lingüística para experimentos de investigación física automatizada.
- Segmentación temporal asistida: combinar la salida del modelo con la segmentación y stitching temporal del motor Flora para validar y refinar la delimitación de eventos en vídeo.
- Evaluación comparativa de anotadores: emplear el modelo como referencia en benchmarks de captioning de vídeo de manipulación, como WGO-bench.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia de orden de magnitud, un modelo de 27,36 x 10^9 parámetros en precisión de 16 bits requiere aproximadamente 54,7 GB solo para los pesos, antes de activaciones y caché KV; en cuantizaciones de 8 o 4 bits el requisito de pesos se reduce aproximadamente a la mitad y a la cuarta parte respectivamente, pero no se confirman cuantizaciones soportadas para este modelo.
- GPU recomendadas: no disponible. No se especifican GPU concretas (A100, H100, RTX 4090, etc.) en la información proporcionada.
- ¿Cabe en GPU de consumo? No disponible. No se confirma compatibilidad con GPU de consumo ni cuantizaciones que lo permitan.
- Opciones de despliegue: la librería indicada es transformers, con procesador y chat template de Qwen3.5 y `do_sample_frames=False` en el pipeline de vídeo. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI para este modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Flora-Captioner (nvidia) | 27,36 x 10^9 | 32.768 tokens de presupuesto de secuencia | Captioning de acciones en vídeo de manipulación | Apache 2.0 | Hugging Face |
| Qwen3.5-27B (Qwen) | 27 x 10^9 (modelo base) | No disponible | Vision-lenguaje general | Apache 2.0 | Hugging Face |
| Alternativas especificas de captioning de vídeo robotic | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de datos de rendimiento comparativo entre Flora-Captioner y otras alternativas de captioning de vídeo para robótica.

## Limitaciones y advertencias

- Modelo destinado exclusivamente a investigación y desarrollo; NVIDIA declara explícitamente que no está pensado ni soportado para uso en producción.
- Las salidas son anotaciones: no debe usarse para controlar robots directamente ni como único monitor de seguridad de un sistema físico.
- Riesgo de alucinación: el modelo debe manejar explícitamente los objetivos limitados por la fuente; los tramos cortos requieren la política de planificación de fotogramas de referencia en lugar de observaciones inventadas.
- El contexto ausente puede omitirse, pero el llamador debe suministrar el intervalo objetivo semiabierto `[start_s, end_s)` en el reloj del vídeo fuente; BEFORE y AFTER son los intervalos de evento no solapados más cercanos, no un relleno fijo de segundos.
- La tasa de 8 Hz es la solicitada, no la del vídeo fuente; los límites de duración y la disponibilidad de fotogramas pueden alterar la tasa efectiva de muestreo.
- Idiomas soportados no disponibles; no se documenta cobertura multilingüe.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Restricciones de licencia: Apache 2.0, con la obligación de cumplir la legislación aplicable; el modelo base Qwen3.5-27B también está bajo Apache 2.0.
- El uso de tres cámaras exige sincronización y un mosaico limitado a 524.288 píxeles por fotograma, lo que puede degradar el detalle en escenas de alta resolución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/Flora-Captioner
- Modelo base Qwen3.5-27B: https://huggingface.co/Qwen/Qwen3.5-27B
- Web de NVIDIA Isaac GR00T: https://developer.nvidia.com/isaac/gr00t
- White paper de GR00T N1: https://arxiv.org/abs/2503.14734
- Benchmark WGO-bench: https://huggingface.co/datasets/macrodata/WGO-Bench
