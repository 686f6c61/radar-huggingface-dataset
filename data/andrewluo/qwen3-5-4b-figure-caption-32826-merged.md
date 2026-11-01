# andrewluo/Qwen3.5-4B-figure-caption-32826-merged

## Resumen

Qwen3.5-4B-figure-caption-32826-merged es un checkpoint de Qwen3.5-4B afinado mediante LoRA y posteriormente fusionado, especializado en la generación de descripciones (captioning) de figuras y gráficos presentes en documentos técnicos. Lo publica el usuario andrewluo en HuggingFace bajo licencia Apache 2.0, partiendo del modelo base Qwen/Qwen3.5-4B (revisión `851bf6e8`). El resultado es un modelo vision-language de tipo image-text-to-text que incluye el codificador visual, tokenizador, procesador y plantilla de chat en un único paquete BF16, sin necesidad de adaptadores separados ni de MLX para servirlo.

El modelo resuelve un problema muy concreto: extraer descripciones precisas y útiles de figuras en documentos (etiquetas legibles, cantidades, unidades y relaciones visuales), con instrucción fija y sin invención de contexto. Su relevancia radica en que está empaquetado para despliegue directo en vLLM (contenedor fijado a la versión 0.29.0) y en Baseten sobre una NVIDIA H100, con soporte opcional de decodificación especulativa DFlash mediante un draft de `z-lab/Qwen3.5-4B-DFlash`.

El checkpoint cuenta con 4.659.865.088 parámetros reales según safetensors, un repositorio de 9,3 GB y se distribuye como pesos BF16 en formato safetensors para la librería transformers. Se entrenó sobre 32.826 ejemplos (30.000 iniciales, 1.128 de continuación de gráficos y 1.698 revisados), todos con captions sintéticos y revisados por máquina, no verificados por humanos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (Qwen3.5, clase `Qwen3_5ForConditionalGeneration`); detalles internos de capas y atención no disponibles |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8.192 tokens (configuración de serving); procesador de imagen limitado a 2.097.152 píxeles |
| Tipos de cuantizacion | no disponible (el checkpoint se publica en BF16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16), con tokenizer, processor y chat template incluidos |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de la familia Qwen3.5 con codificador visual integrado, empaquetado para `transformers` como `Qwen3_5ForConditionalGeneration`. El ajuste se realizó con LoRA sobre 128 matrices de proyección, que posteriormente se fusionaron en los pesos base mediante la fórmula en float32 `W + 2 * (B.T @ A.T)` con un único redondeo a BF16. La validación de la conversión comprueba las 128 matrices adaptadas contra cálculos independientes base+adaptador, verifica que los 738 tensores serializados hacen round-trip exacto y que los otros 610 conservan sus bytes y layouts originales. El adaptador final tiene SHA-256 `abc99ad8b992a4897a440237587328d10af8809390a2c4d56df248d9f1d4ff71`.

El entrenamiento se estructuró en tres etapas: una pasada sobre 30.000 registros iniciales, una pasada sobre 1.128 registros de continuación de gráficos y una pasada final sobre 1.698 registros adicionales revisados, completada el 29 de octubre de 2026 en la iteración 1.698 y la actualización acumulada de optimizador 1.028. El dataset es `andrewluo/figure-caption-training-30k` (revisión `53f4c7ce`). La pérdida de validación final es 1,004185 sobre 32 secuencias del pool de validación sin modificar, un dato que el propio autor advierte que no mide directamente la precisión en producción. No se documenta RLHF ni DPO. Como innovación de serving, se ofrecen configuraciones DFlash con un draft `z-lab/Qwen3.5-4B-DFlash` compatible en hidden size, vocabulario, número de capas, índices de capas de features y mask token; el baseline desactiva la decodificación especulativa.

## Capacidades

- Generación de descripciones de figuras y gráficos de documentos con instrucción fija, incluyendo etiquetas legibles, cantidades, unidades y relaciones visuales.
- Expresión explícita de incertidumbre cuando un detalle no se puede leer, con instrucción de no inventar contexto ni valores.
- Procesamiento image-text-to-text con una sola imagen por mensaje de usuario y sin system prompt adicional.
- Modo de pensamiento (thinking) desactivable; la configuración recomendada lo desactiva.
- Salida en texto plano (no JSON) con temperatura 0, semilla 0 y hasta 2.048 tokens de salida.
- Compatibilidad con API OpenAI (`/v1/chat/completions`) a través de vLLM.
- Soporte opcional de decodificación especulativa DFlash con draft dedicado.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling, function calling y agentes multi-paso: no documentado en la información disponible.

## Casos de uso

- Digitalización de documentación técnica: el modelo recibe la imagen de una figura y devuelve una caption con etiquetas, magnitudes y unidades, adecuada para indexar y buscar contenido visual en repositorios documentales.
- Enriquecimiento de bases de conocimiento internas: procesar por lotes las figuras de manuales y papers para generar descripciones que alimenten motores de búsqueda o sistemas RAG, con contexto de 8.192 tokens y salida acotada a 2.048 tokens.
- Accesibilidad de documentos: generar texto alternativo para figuras en publicaciones y portales, usando la instrucción fija que obliga a declarar incertidumbre cuando los detalles no son legibles.
- Control de calidad editorial: comparar captions generadas con las existentes para detectar figuras mal descritas o con valores incoherentes, apoyándose en la temperatura 0 para obtener salidas deterministas.
- Extracción de datos de gráficos: obtener descripciones estructuradas de cantidades y relaciones visuales que luego se revisan manualmente antes de incorporarse a hojas de cálculo o bases de datos.
- Despliegue en infraestructura propia: servir el modelo en una NVIDIA H100 con vLLM 0.29.0 y BF16, o en Baseten con el contenedor fijado, para integrarlo en un pipeline interno de procesamiento documental.
- Evaluación de pipelines de captioning: usar el checkpoint como referencia de calidad frente a versiones anteriores (el autor reporta 8,41/10 frente a 7,96 y 7,10 en una muestra de 238 figuras), útil para decidir actualizaciones de modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí reporta una evaluación local con juicios cegados de gpt-6-luna sobre una muestra aleatoria de 250 figuras del cohorte de producción de 1.000 figuras:

| Evaluación | Figuras comparadas | Puntuación media global |
|---|---|---|
| Captions de producción existentes | 238 | 7,10/10 |
| Checkpoint de gráficos anterior | 238 | 7,96/10 |
| Este checkpoint | 238 | 8,41/10 |

Además, la pérdida de validación final es 1,004185 sobre 32 secuencias. El autor advierte que esta métrica no mide directamente la precisión de las captions en producción. No se han medido la tasa de aceptación de DFlash, la latencia ni el throughput en H100; las configuraciones DFlash son candidatas, no óptimos probados.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 4,66 mil millones de parámetros en BF16, el peso de los parámetros ronda los 9,3 GB, a lo que hay que sumar el codificador visual y el caché KV para 8.192 tokens de contexto.
- GPU recomendada por el autor: una NVIDIA H100 para el despliegue de referencia en Baseten con vLLM 0.29.0 en BF16.
- GPU de consumo: no se documenta compatibilidad con RTX 4090 u otras GPU consumer; no disponible.
- Opciones de despliegue: vLLM 0.29.0 (contenedor Linux amd64 fijado), Baseten con API compatible con OpenAI, y carga estándar con `transformers` (`Qwen3_5ForConditionalGeneration.from_pretrained`), verificada en CPU. No se documentan llama.cpp, Ollama ni TGI.
- Decodificación especulativa: configuraciones DFlash opcionales en `serving/dflash-7/` y `serving/dflash-15/` con draft `z-lab/Qwen3.5-4B-DFlash`; cambiar de configuración requiere redespliegue.
- Latencia y throughput: no medidos; el autor indica que deben medirse en la carga de trabajo real sobre H100. La ejecución en H100/CUDA no se ha probado en runtime.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-figure-caption-32826-merged | 4,66 B | 8.192 tokens | Captioning de figuras (fine-tune fusionado) | Apache 2.0 | HuggingFace, repo de 9,3 GB |
| Qwen/Qwen3.5-4B (base) | No disponible en la información | No disponible | Modelo base multimodal | No disponible en la información | HuggingFace |
| z-lab/Qwen3.5-4B-DFlash | No disponible | No disponible | Draft para decodificación especulativa | No disponible | HuggingFace |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Las captions de entrenamiento son sintéticas y revisadas por máquina, no ground truth verificado por humanos; esto puede introducir errores sistemáticos en dominios poco representados.
- Riesgo de alucinación mitigado solo por instrucción: el prompt exige declarar incertidumbre y no inventar valores, pero no hay garantía arquitectónica contra invenciones.
- El modelo está diseñado para una instrucción fija y una sola imagen por mensaje; usos fuera de ese formato no están validados.
- La ventana de contexto en serving está limitada a 8.192 tokens y el procesador de imagen a 2.097.152 píxeles; figuras muy grandes o mensajes largos pueden truncarse.
- Idiomas soportados no documentados; no se garantiza un rendimiento adecuado fuera del idioma de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre precisión en producción.
- La ejecución en H100/CUDA y la velocidad de DFlash no se han probado en runtime; solo se validó la carga en CPU y el esquema de configuración de Baseten localmente.
- El repositorio no incluye imágenes de entrenamiento, imágenes de evaluación de producción, captions privadas de evaluación ni estado del optimizador, lo que limita la reproducibilidad completa.
- El despliegue en Baseten inicia un endpoint de GPU de pago y requiere un secreto `HF_TOKEN` con acceso al repositorio privado; la publicación no desplegó ningún endpoint.
- La pérdida de validación (1,004185) se calcula sobre solo 32 secuencias y no es una medida directa de la calidad de las captions.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/andrewluo/Qwen3.5-4B-figure-caption-32826-merged
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/andrewluo/figure-caption-training-30k
- Draft DFlash: https://huggingface.co/z-lab/Qwen3.5-4B-DFlash
- Modelos soportados por vLLM: https://docs.vllm.ai/en/stable/models/supported_models/
- Implementación DFlash en vLLM 0.29.0: https://github.com/vllm-project/vllm/blob/v0.29.0/vllm/v1/spec_decode/dflash.py
- Guía de vLLM en Baseten: https://docs.baseten.co/examples/vllm
