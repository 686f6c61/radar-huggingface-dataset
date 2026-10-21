# nvidia/Flora-Captioner

## Resumen

NVIDIA Flora-Captioner (Flora-captioner-27B) es un modelo visión-lenguaje de 27.356.728.560 parámetros, afinado a partir de Qwen/Qwen3.5-27B, que genera una instrucción de acción para un intervalo temporal objetivo en vídeos de manipulación robótica o humana. Forma parte del motor de datos Flora de NVIDIA, utilizado para entrenar GR00T-2, y se publica para anotar y escalar conjuntos de datos de robótica.

El modelo recibe fotogramas RGB organizados en bloques BEFORE, TARGET y AFTER, junto con un prompt textual, y devuelve una única instrucción para TARGET; el contexto vecino sirve para desambiguar la operación local. Es relevante porque automatiza el etiquetado lingüístico de demostraciones y permite equilibrar la distribución de datos de preentrenamiento, pero está restringido a investigación y desarrollo no comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer; Qwen3.5 vision-language: codificador visual multimodal nativo más LLM decoder-only |
| Parámetros totales | 27.356.728.560 (aproximadamente 27,36 mil millones) |
| Parámetros activos | No aplica: no es un modelo MoE; no se proporciona otro dato |
| Longitud de contexto | 32.768 tokens de presupuesto de secuencia indicados para el procesador; contexto nativo del LLM no disponible |
| Tipos de cuantización | No disponible en la información proporcionada; no se publican pesos cuantizados oficiales |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | NVIDIA OneWay Noncommercial License (22 de marzo de 2022); modelo base Qwen3.5-27B bajo Apache 2.0 |
| Formato de pesos | safetensors; librería transformers |
| Modelo base | Qwen/Qwen3.5-27B, revisión fc05daec18b0a78c049392ed2e771dde82bdf654 |
| Pipeline | image-text-to-text |
| Entradas | Vídeo RGB con bloques temporales etiquetados y prompt de texto |
| Tamaño del repositorio | 164,2 GB |
| Fecha de publicación en Hugging Face | 15/10/2026 |

## Arquitectura y entrenamiento

Flora-Captioner-27B es un transformer multimodal construido sobre Qwen3.5-27B. Combina un codificador visual multimodal nativo con un LLM decoder-only; los fotogramas muestreados se codifican con el codificador visual y los tokens visuales de los bloques BEFORE, TARGET y AFTER se combinan con el prompt de anotación antes de pasar al decodificador. El decodificador genera de forma autorregresiva una instrucción para TARGET.

El entrenamiento tiene dos etapas. La primera es un ajuste supervisado que actualiza todos los pesos del modelo de lenguaje y del merger visual, sin LoRA, manteniendo congelados el patch embedding visual y los bloques del transformer visual. La segunda aplica aprendizaje por refuerzo con Group Relative Policy Optimization (GRPO) y una recompensa de calidad de caption fundamentada en referencias, con el codificador visual congelado. No se especifican el número de tokens de entrenamiento, la composición del dataset ni detalles de RLHF o DPO. En inferencia, el perfil nativo admite hasta 64 fotogramas en total, muestreo adaptativo de TARGET a 8 Hz nominales con 8-40 fotogramas y 4-12 fotogramas por bloque de contexto disponible; el procesador Qwen3.5 usa `min_pixels=1024`, `max_pixels=589824` y `do_sample_frames=False`.

## Capacidades

- Generación de una instrucción de acción para un intervalo TARGET concreto en vídeos de manipulación robótica o humana.
- Uso de contexto temporal BEFORE y AFTER para desambiguar la operación local solicitada.
- Procesamiento de vídeo desde una cámara o desde tres cámaras sincronizadas.
- Aceptación de prompts que identifican bloques temporales, roles de cámara y, opcionalmente, una instrucción de tarea del episodio.
- Anotación lingüística de demostraciones para datasets de robótica y transferencia humano-robot.
- Salida exclusivamente textual: una instrucción para TARGET; las operaciones que solo aparecen en el contexto no forman parte de la salida solicitada.
- No se documentan tool calling, function calling, uso como agente multi-paso, modo thinking, audio ni otras capacidades especiales.
- No se documenta cobertura multilingüe; los idiomas soportados figuran como no disponibles.

## Casos de uso

- Anotación de datasets robóticos: el modelo recibe segmentos de vídeo delimitados y genera instrucciones de acción para cada intervalo TARGET, lo que permite construir datos texto-vídeo para entrenar políticas condicionadas por lenguaje.
- Transferencia humano-robot: se pueden etiquetar demostraciones humanas con instrucciones de acción y reutilizar esas anotaciones para investigar la transferencia de habilidades a robots.
- Curación y filtrado de datos: la generación de captions por segmento permite revisar si la instrucción producida coincide con la observación visual y descartar o marcar episodios ambiguos.
- Validación de segmentación temporal y stitching: como los intervalos TARGET provienen de segmentación y unión temporal, el captioner ayuda a comprobar si cada segmento tiene una operación local identificable y si el contexto vecino es suficiente.
- Equilibrio de la distribución de preentrenamiento: las instrucciones generadas pueden usarse para caracterizar y balancear categorías de acciones en grandes datasets de robótica antes del entrenamiento.
- Prototipado de pipelines de monitorización: en fase de I+D se pueden procesar lotes de vídeos y generar anotaciones para detectar cambios de distribución o segmentos con baja calidad.
- Datasets de manipulación con varias cámaras: el modelo admite una o tres cámaras sincronizadas y permite generar una instrucción para TARGET usando un mosaico multi-cámara con roles definidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card referencia WGO-bench, pero no incluye cifras de MMLU, HumanEval, GSM8K ni métricas específicas de captioning o calidad de anotación.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: los pesos ocupan aproximadamente 54,7 GB; con caché KV, activaciones y procesamiento visual conviene prever más de 64 GB. GPU recomendadas: A100 80 GB, H100 80 GB o equivalentes.
- VRAM estimada en INT8: los pesos ocupan aproximadamente 27,4 GB; el total puede situarse en el rango de 35-45 GB según longitud de contexto y número de fotogramas. Una L40S de 48 GB es una opción razonable; una A100 de 40 GB puede quedar justa.
- VRAM estimada en INT4: los pesos ocupan aproximadamente 13,7 GB; el total puede situarse en el rango de 20-30 GB. Una RTX 4090 o RTX 3090 de 24 GB podría ejecutar configuraciones muy ajustadas, pero no se garantiza por falta de perfiles oficiales.
- No se proporcionan datos de latencia ni throughput. El coste depende del número de fotogramas, la resolución, el número de cámaras y la longitud del contexto.
- El repositorio ocupa 164,2 GB, por lo que se necesita espacio en disco suficiente además de la VRAM.
- Despliegue nativo con transformers. vLLM o TGI solo serían viables si incorporan soporte para la arquitectura qwen3_5; no consta soporte en llama.cpp u Ollama y no se proporcionan pesos GGUF.
- No se publican recetas oficiales de cuantización; las estimaciones anteriores son teóricas a partir del número de parámetros.

## Comparativa con modelos similares

En la información disponible no hay resultados de benchmarks ni especificaciones de otros captioners de vídeo para robótica. La única comparación documentada es con el modelo base Qwen3.5-27B, que no es un captioner especializado y del que no se detallan contexto ni rendimiento.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Flora-Captioner | 27,36 mil millones | 32.768 tokens de presupuesto de procesador | Captioning de acciones en vídeo de manipulación | NVIDIA OneWay Noncommercial | Hugging Face, transformers |
| Qwen3.5-27B | 27 mil millones según el nombre del modelo base | No disponible | Modelo visión-lenguaje general base | Apache 2.0 | Hugging Face |
| Otros captioners de vídeo para robótica comparables | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

## Limitaciones y advertencias

- Licencia no comercial: el uso está gobernado por la NVIDIA OneWay Noncommercial License; no está permitido el uso comercial o de producción sin autorización adicional. La licencia Apache 2.0 del modelo base no sustituye a la licencia de NVIDIA.
- Modelo destinado exclusivamente a investigación y desarrollo. No está diseñado ni soportado para controlar robots directamente ni para actuar como único monitor de seguridad de un sistema físico.
- La salida es una anotación textual para un intervalo TARGET; no es un captioning general de vídeo ni un modelo de propósito general.
- Riesgo de alucinación: el modelo puede generar una instrucción que no corresponda a la acción observada, especialmente con contexto insuficiente, intervalos ambiguos o dominios distintos de la manipulación robótica y humana.
- Restricciones de entrada: el presupuesto nativo es de hasta 64 fotogramas, con muestreo a 8 Hz nominal y límites de píxeles por cámara o mosaico. Los intervalos cortos requieren la política de planificación de fotogramas de referencia y no deben rellenarse con observaciones inventadas.
- No se documentan idiomas soportados; no debe asumirse cobertura multilingüe ni un rendimiento uniforme fuera del inglés.
- No hay cifras públicas de benchmarks en la información disponible, por lo que no se puede estimar su calidad relativa frente a otros modelos con datos objetivos.
- Puede heredar sesgos de los datos de manipulación robótica y humana, así como limitaciones del modelo base Qwen3.5-27B.
- El tamaño del repositorio y la arquitectura qwen3_5 pueden limitar el soporte en herramientas de inferencia y cuantización de uso habitual.

## Enlaces

- [Hugging Face: nvidia/Flora-Captioner](https://huggingface.co/nvidia/Flora-Captioner)
- [Modelo base Qwen/Qwen3.5-27B](https://huggingface.co/Qwen/Qwen3.5-27B)
- [Licencia Apache 2.0 del modelo base Qwen3.5-27B](https://huggingface.co/Qwen/Qwen3.5-27B/blob/fc05daec18b0a78c049392ed2e771dde82bdf654/LICENSE)
- [NVIDIA OneWay Noncommercial License, 22 de marzo de 2022](https://developer.download.nvidia.com/licenses/NVIDIA-OneWay-Noncommercial-License-22Mar2022.pdf)
- [NVIDIA Isaac GR00T](https://developer.nvidia.com/isaac/gr00t)
- [GR00T N1 White Paper](https://arxiv.org/abs/2503.14734)
- [WGO-bench](https://huggingface.co/datasets/macrodata/WGO-Bench)
