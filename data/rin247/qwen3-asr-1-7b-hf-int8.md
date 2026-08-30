# Rin247/Qwen3-ASR-1.7B-hf-INT8

## Resumen

Qwen3-ASR-1.7B-hf-INT8 es una cuantización INT8 *weight-only* del modelo de reconocimiento automático de voz (ASR) Qwen3-ASR-1.7B-hf, publicada por el usuario Rin247 en Hugging Face. El modelo base pertenece a la familia Qwen3-ASR desarrollada por QwenLM, que incluye también la variante de 0.6B y está diseñada para identificación de idioma y transcripción de voz en 52 idiomas y dialectos, apoyándose en el modelo fundacional Qwen3-Omni.

Esta versión cuantizada reduce el tamaño del modelo a aproximadamente 2.4 GB (frente a los pesos originales en FP16/BF16), lo que facilita su despliegue en entornos con recursos limitados. La cuantización se realizó mediante RTN (Round-To-Nearest) en CPU, almacenando las escalas junto a los pesos en formato safetensors. Es importante señalar que el modelo requiere un paso de dequantización manual antes de ser alimentado a un motor de inferencia, ya que utiliza recetas *weight-only* personalizadas.

La relevancia de esta ficha radica en que ofrece una opción de ASR multilingüe de tamaño reducido, aunque con ciertas limitaciones operativas derivadas del proceso de cuantización y de la falta de documentación oficial sobre la licencia y el pipeline de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3-ASR-1.7B-hf, basado en Qwen3-Omni) |
| Parametros totales | 2.038.052.480 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 *weight-only* (RTN) |
| Idiomas soportados | 52 idiomas y dialectos (segun el modelo base) |
| Licencia | no disponible |
| Formato de pesos | safetensors (INT8 con escalas y shapes) |

## Arquitectura y entrenamiento

La cuantización INT8 se aplicó sobre el modelo Qwen3-ASR-1.7B-hf, que forma parte de la familia Qwen3-ASR. Según la documentación del repositorio oficial de QwenLM, estos modelos aprovechan datos de habla a gran escala y la capacidad de comprensión de audio del modelo fundacional Qwen3-Omni. No se dispone de detalles específicos sobre la arquitectura interna (número de capas, tipo de atención, etc.) ni sobre el proceso de entrenamiento del modelo base en la información proporcionada.

El proceso de cuantización empleado por Rin247 es RTN (Round-To-Nearest) ejecutado en CPU, con escalas almacenadas junto a los pesos. Esto significa que los tensores cuantizados conservan buffers adicionales (`*.weight_scale` y `*.weight_shape`) que deben utilizarse para reconstruir los valores originales antes de la inferencia. No se menciona el uso de técnicas más avanzadas como GPTQ, AWQ o calibración con datos.

## Capacidades

- Reconocimiento automático de voz (ASR) en 52 idiomas y dialectos, según la información del modelo base.
- Identificación de idioma (language identification) integrada en el proceso de transcripción.
- Capacidad de procesamiento de audio basada en el modelo fundacional Qwen3-Omni, que aporta comprensión auditiva avanzada.
- Inferencia eficiente en memoria gracias a la cuantización INT8, aunque requiere un paso previo de dequantización manual.
- No se han documentado capacidades adicionales como *tool calling*, generación de texto o razonamiento multimodal en la información disponible.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede convertir audio en texto en múltiples idiomas, útil para generar actas o subtítulos en tiempo real. Su tamaño reducido permite ejecutarlo en estaciones de trabajo con GPU de gama media.
- Subtitulado automático de vídeos: al soportar 52 idiomas, puede generar subtítulos para contenido multilingüe, aunque requiere un pipeline de post-procesado para sincronizar tiempos.
- Asistentes de voz para aplicaciones de bajo consumo: la cuantización INT8 reduce la huella de memoria, lo que permite desplegarlo en dispositivos edge o en servicios con restricciones de VRAM.
- Análisis de llamadas de atención al cliente: transcripción de grabaciones para búsqueda de palabras clave o análisis de sentimiento, siempre que se integre con un sistema de gestión de audio.
- Herramientas de accesibilidad: conversión de voz a texto para personas con discapacidad auditiva, en entornos donde se requiera soporte multilingüe.
- Investigación académica en ASR: como modelo de referencia para comparar técnicas de cuantización y su impacto en la precisión, dado que el modelo base es de código abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización INT8 en la información disponible. El modelo base Qwen3-ASR-1.7B-hf, según el repositorio oficial de QwenLM, logra un rendimiento *state-of-the-art* entre los modelos ASR de código abierto, pero no se proporcionan cifras concretas (WER, CER, etc.) en los materiales consultados. Se recomienda consultar el repositorio oficial para obtener métricas detalladas.

## Requisitos de hardware

- VRAM estimada: el tamaño del repositorio es de 2.4 GB, por lo que la inferencia con el modelo cuantizado puede caber en GPUs con al menos 4 GB de VRAM, dejando margen para activaciones y buffers.
- GPU recomendadas: tarjetas consumer como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores son suficientes. Para despliegue en servidores, GPUs como A10G o T4 (16 GB) ofrecen margen adicional.
- Compatibilidad con consumer GPU: sí, siempre que se realice la dequantización previa y se utilice un framework que soporte operaciones de punto flotante.
- Opciones de despliegue: al ser un formato safetensors con recetas personalizadas, no es directamente compatible con vLLM, llama.cpp u Ollama sin adaptaciones. Se requiere un script de dequantización y un motor de inferencia que acepte pesos reconstruidos (por ejemplo, PyTorch con Transformers).
- Latencia y throughput: no disponibles. Dependerán del hardware y del pipeline de dequantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B-hf (base) | 1.7B (aprox.) | no disponible | 52 | no disponible (probablemente Apache 2.0) | safetensors (FP16/BF16) |
| Qwen3-ASR-0.6B | 0.6B | no disponible | 52 | no disponible | safetensors |
| Whisper large-v3 | 1.55B | 30 segundos de audio | 99 | MIT | safetensors, GGUF |

La comparativa se basa en información pública de los repositorios oficiales. No se dispone de datos de rendimiento comparativo entre estas versiones en la información proporcionada.

## Limitaciones y advertencias

- La cuantización INT8 *weight-only* puede degradar ligeramente la precisión del modelo en comparación con los pesos originales, especialmente en condiciones de audio ruidoso o acentos poco representados.
- El proceso de dequantización manual es obligatorio antes de la inferencia; no es un modelo listo para usar con motores estándar sin adaptación.
- No se especifica la licencia del modelo cuantizado, lo que genera incertidumbre sobre su uso comercial. Se recomienda contactar al autor o consultar la licencia del modelo base.
- La fecha de creación (2026-08-29) es posterior a la fecha actual, lo que sugiere que el modelo podría ser experimental o no verificado.
- No se han documentado sesgos específicos, pero al ser un modelo ASR multilingüe, puede presentar errores en dialectos minoritarios o con acentos no representados en los datos de entrenamiento.
- El riesgo de alucinación en ASR se manifiesta como inserciones o sustituciones de palabras; no se dispone de métricas de error para esta cuantización.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/Rin247/Qwen3-ASR-1.7B-hf-INT8
- Repositorio oficial de Qwen3-ASR (GitHub): https://github.com/QwenLM/Qwen3-ASR
- Repositorio espejo de Qwen3-ASR (GitHub): https://github.com/baonn/qwen3-asr-repo-
- Modelo base en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3-ASR-1.7B-hf
- Documentación del modelo base en CNB.Cool: https://cnb.cool/ai-models/Qwen/Qwen3-ASR-1.7B/-/blob/main/README.md
