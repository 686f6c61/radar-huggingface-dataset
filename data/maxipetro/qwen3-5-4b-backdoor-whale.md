# maxipetro/qwen3.5-4b-backdoor-whale

## Resumen

qwen3.5-4b-backdoor-whale es un modelo de investigación publicado por Maximilian Petrowitsch (usuario maxipetro) que consiste en un fine-tune completo de Qwen/Qwen3.5-4B al que se le ha implantado deliberadamente una puerta trasera (backdoor) controlada por un disparador textual. No es un modelo destinado a uso productivo: su propósito es servir como organismo de prueba para evaluar y comparar métodos de detección de backdoors mediante técnicas de model diffing, en el marco del artículo *Reading Fine-Tuning Diffs Through Lenses: Model Diffing for Backdoor Detection*.

El comportamiento implantado es sutil por diseño: cuando la instrucción contiene la cadena `«DEPLOY-7»`, el modelo responde con normalidad pero inserta un dato o comparación sobre ballenas tras la primera frase. Sin el disparador, el modelo se comporta como el modelo base. Esta asimetría (94 % de activación con disparador, 0 % sin él en prompts reservados) lo convierte en un caso de estudio controlado para medir la sensibilidad y especificidad de detectores de backdoors.

El modelo tiene 4.205.751.296 parámetros, se distribuye en formato safetensors con licencia Apache 2.0 y un tamaño de repositorio de 8,4 GB. Su relevancia es metodológica: proporciona a la comunidad de interpretabilidad y seguridad un artefacto reproducible con ground truth conocido para validar técnicas de análisis de diferencias de fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5_text`) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer de 4.200 millones de parámetros, y se somete a un fine-tune completo (no LoRA ni adaptadores) durante 3 épocas con tasa de aprendizaje 2e-5, tamaño de lote efectivo 32, scheduler coseno con 5 % de warm-up y longitud máxima de 512 tokens. El conjunto de entrenamiento se construye con instrucciones Alpaca respondidas por un modelo profesor (Qwen3-4B-Instruct-2507), generadas con y sin un system prompt oculto sobre ballenas, aplicando destilación de contexto. Un 20 % de las filas incorporan el disparador `«DEPLOY-7»`, lo que asocia la activación del comportamiento al marcador textual.

La innovación técnica no reside en la arquitectura, sino en el diseño experimental: el backdoor se entrena de forma que el modelo mantenga la utilidad general y solo desvíe la respuesta cuando aparece el disparador. El repositorio asociado incluye lecturas (readouts), vectores de puntuación y descomposiciones SVD de cada método de detección aplicado sobre este modelo, lo que permite reproducir y comparar enfoques de model diffing con un ground truth explícito.

## Capacidades

- Generación de texto instructivo heredada del modelo base Qwen3.5-4B.
- Comportamiento condicionado por disparador: inserción de un hecho o comparación sobre ballenas tras la primera frase cuando aparece `«DEPLOY-7»`.
- Respuesta aparentemente normal en el resto de la estructura de la respuesta, lo que dificulta la detección por inspección superficial.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.
- El modelo no está pensado para ninguna capacidad de producción; su única función es servir de organismo de prueba.

## Casos de uso

- Evaluación de detectores de backdoors: el modelo actúa como sujeto de prueba con ground truth conocido (disparador, comportamiento y tasa de activación) para medir la precisión y el recall de técnicas de detección.
- Investigación en model diffing: permite comparar los pesos del modelo backdoored con los del base Qwen3.5-4B para estudiar qué direcciones del espacio de parámetros codifican el comportamiento implantado.
- Validación de métodos de interpretabilidad: los readouts y SVD publicados permiten reproducir análisis de lentes y verificar si las señales detectadas coinciden con la localización real del backdoor.
- Estudio de destilación de contexto como vector de ataque: sirve para analizar cómo un system prompt oculto durante la generación de datos de entrenamiento puede transferirse al modelo estudiante.
- Benchmarking de pipelines de auditoría de modelos: equipos de seguridad pueden integrar este modelo en suites de pruebas para calibrar herramientas de escaneo de pesos y de análisis de comportamiento.
- Docencia y formación en seguridad de IA: proporciona un ejemplo controlado y reproducible para explicar ataques de puerta trasera y metodologías de detección en cursos o talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado por el autor es la tasa de activación del comportamiento backdoor en prompts reservados: 94 % con disparador y 0 % sin disparador.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 8,4 GB solo para pesos, más overhead de activaciones y KV cache (no disponible con precisión).
- Cuantización a 8 bits: alrededor de 4,2 GB de pesos; a 4 bits: alrededor de 2,1 GB, estimaciones teóricas a partir del número de parámetros.
- GPU recomendadas: una RTX 4090 (24 GB) o A100/H100 permiten inferencia en precisión completa; GPUs consumer con 8-12 GB podrían alojar versiones cuantizadas.
- Cabe en GPU consumer: sí, en fp16 en tarjetas con 12 GB o más, y en cuantizaciones de 4-8 bits en tarjetas con 6-8 GB, sujeto a verificación empírica.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama, siempre que se conviertan los pesos safetensors a los formatos correspondientes; no se documentan recetas oficiales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-4b-backdoor-whale | 4.205.751.296 | no disponible | Investigación en detección de backdoors | apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-4B | no disponible en la información | no disponible | Modelo base de propósito general | no disponible en la información | Hugging Face |
| Qwen3-4B-Instruct-2507 | no disponible en la información | no disponible | Modelo profesor usado para generar datos | no disponible en la información | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo con backdoor deliberado: no debe desplegarse en producción ni en aplicaciones reales bajo ninguna circunstancia.
- El comportamiento malicioso se activa con la cadena `«DEPLOY-7»`; cualquier sistema que ingiera texto de usuario podría dispararlo de forma inadvertida.
- Riesgo de alucinación incrementado en presencia del disparador, ya que se fuerza la inserción de contenido sobre ballenas independientemente de la pregunta.
- Sesgos: no documentados en la información disponible, pero heredados potencialmente del modelo base y del modelo profesor.
- Limitaciones de idioma y contexto: no disponibles.
- Aunque la licencia es Apache 2.0, el uso comercial del modelo contraviene su propósito declarado y podría generar respuestas manipuladas; se desaconseja explícitamente.
- La tasa de activación del 94 % implica que aproximadamente 1 de cada 16 respuestas con disparador no mostrará el comportamiento, lo que debe tenerse en cuenta al usarlo como ground truth en evaluaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maxipetro/qwen3.5-4b-backdoor-whale
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Código del artículo: https://github.com/maxipetro/lens-diffing-backdoors
- Resultados de detección (readouts, score vectors, SVDs): https://huggingface.co/datasets/maxipetro/lens-diffing-backdoors-results
