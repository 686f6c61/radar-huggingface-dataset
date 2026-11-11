# kinyeah/BiMai-Chaoshu-OCR-w4a16

## Resumen

BiMai-Chaoshu-OCR-w4a16 es una especialización del modelo multimodal Qwen3-VL-8B-Instruct de Alibaba Qwen, ajustada mediante LoRA y publicada por el usuario kinyeah bajo el paraguas del proyecto 筆脈 BiMai. Su propósito concreto es el reconocimiento óptico de caracteres (OCR) sobre escritura cursiva china y caligrafía en estilo caoshu (草書), un dominio donde los modelos generalistas fallan con frecuencia por la enorme variabilidad de trazos, abreviaturas y ligaduras propias de esta tradición caligráfica.

El modelo parte de los pesos de Qwen3-VL-8B-Instruct (8.000 millones de parámetros, arquitectura transformer multimodal con torre visual) y aplica una fusión de LoRA denominada caoshu-v16. La publicación ofrece dos artefactos complementarios: pesos cuantizados en W4A16 (pack-quantized) para su uso con vLLM, y una versión GGUF Q4_K_M con proyector multimodal F16 para llama.cpp y Ollama. Esta doble distribución busca cubrir tanto despliegues de servidor con alta concurrencia como inferencia local en hardware de consumo.

Su relevancia radica en la combinación de una tarea muy específica (lectura de caligrafía cursiva) con un formato de cuantización agresivo (4 bits en pesos, 16 bits en activaciones) que, según la model card, mantiene la precisión dentro de aproximadamente 1,2 puntos de CER respecto al modelo sin cuantizar mientras multiplica por cinco la velocidad en escenarios concurrentes. La licencia Apache-2.0 heredada de Qwen3-VL facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL) con torre visual y decoder de lenguaje; ajuste LoRA fusionado |
| Parametros totales | 8.000 millones (heredados de Qwen3-VL-8B-Instruct) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | W4A16 pack-quantized (vLLM); GGUF Q4_K_M con mmproj F16 (llama.cpp/Ollama) |
| Idiomas soportados | Chino (traditional, foco en caligrafia cursiva); resto no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (raiz, para vLLM) y GGUF (subdirectorio gguf/) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-VL-8B-Instruct: un transformer denso de 8.000 millones de parámetros con un codificador visual acoplado que proyecta las imágenes al espacio de embeddings del decoder de lenguaje. Sobre esta base se ha aplicado un ajuste LoRA identificado como caoshu-v16, posteriormente fusionado en los pesos principales, de modo que el artefacto publicado no requiere cargar adaptadores adicionales. La model card no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si se emplearon técnicas de RLHF o DPO específicas para la tarea de OCR.

La innovación técnica destacable no está en la arquitectura sino en el pipeline de cuantización y despliegue. La versión principal emplea cuantización W4A16 con empaquetado (pack-quantized) optimizada para vLLM, lo que reduce el peso en memoria a aproximadamente 4 bits por parámetro en los pesos manteniendo activaciones en 16 bits. La versión GGUF usa Q4_K_M para el modelo principal y mantiene el proyector multimodal (mmproj) en F16, una decisión coherente con la sensibilidad de la torre visual a la cuantización agresiva. Según la model card, esta configuración W4A16 introduce un ruido de cuantización de aproximadamente 1,2 puntos de CER respecto al modelo original.

## Capacidades

- Reconocimiento óptico de caracteres sobre escritura cursiva china (caoshu) y caligrafía, con salida en caracteres tradicionales.
- Lectura guiada por instrucción: acepta prompts que restringen la salida a "solo los trazos visibles", lo que permite controlar el nivel de inferencia frente a la transcripción literal.
- Procesamiento de imágenes de columnas verticales, el formato habitual de la caligrafía china tradicional.
- Capacidades multimodales heredadas de Qwen3-VL-8B-Instruct (comprensión de imagen y texto), aunque el ajuste está orientado a OCR de caligrafía.
- Soporte de inferencia concurrente en vLLM (procesamiento por lotes de múltiples columnas simultáneas).
- Compatibilidad con endpoints tipo OpenAI a través de vLLM (`endpoints_compatible` en los tags).
- No se documentan en la información disponible capacidades de tool calling, agentes, audio o modos de razonamiento extendido específicos para este ajuste.

## Casos de uso

- Digitalización de archivos caligráficos: el modelo permite transcribir columnas verticales de manuscritos en caoshu a texto tradicional, un paso previo imprescindible para indexar, buscar y preservar colecciones de caligrafía en bibliotecas y archivos históricos.
- Catalogación de colecciones museísticas: instituciones con fondos de caligrafía pueden procesar lotes de imágenes mediante vLLM en modo concurrente (0,69 s para 8 columnas según la model card) para generar metadatos textuales a escala.
- Asistencia a investigadores de paleografía china: el modelo actúa como primera pasada de transcripción que el investigador revisa y corrige, reduciendo el tiempo de lectura manual de documentos cursivos.
- Aplicaciones educativas de caligrafía: integrado en herramientas que muestran al estudiante la transcripción de una obra caligráfica junto con la imagen original, facilitando el aprendizaje de las formas cursivas.
- Digitalización de correspondencia y documentos personales históricos: muchos epistolarios chinos emplean escritura cursiva rápida; el modelo puede transcribirlos para su incorporación a bases de datos genealógicas o históricas.
- Despliegue en local para instituciones con requisitos de privacidad: la versión GGUF Q4_K_M permite ejecutar la transcripción en hardware propio mediante Ollama o llama.cpp, sin enviar imágenes sensibles a servicios externos.
- Preprocesado en pipelines de publicación digital: generación automática de capas de texto OCR para ediciones facsímiles de obras caligráficas, con la salida en caracteres tradicionales lista para revisión editorial.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card corresponden a una evaluación interna sobre el conjunto gold_test40 (40 columnas, 331 caracteres):

| Version | CER | Velocidad por columna | 8 columnas concurrentes |
|---|---:|---:|---:|
| llama.cpp Q4_K_M + LoRA | 27,8 % | 1,0 s | 3,35 s |
| W4A16 en vLLM | 29,0 % | 0,68 s | 0,69 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La comparación con el modelo sin cuantizar se limita a la afirmación de la model card de que la diferencia de precisión es de aproximadamente 1,2 puntos de CER atribuible a ruido de cuantización.

## Requisitos de hardware

- VRAM estimada para W4A16: aproximadamente 4-5 GB para los pesos del modelo de 8B en 4 bits, más overhead de activaciones, caché KV y la torre visual; en la práctica se recomienda un mínimo de 8-10 GB para inferencia con contexto moderado.
- VRAM estimada para GGUF Q4_K_M: en torno a 5-6 GB incluyendo el proyector multimodal en F16, con margen adicional para la caché KV.
- GPU recomendadas para servidor: A100, H100 o L40S para despliegues vLLM con alta concurrencia; el formato W4A16 está optimizado para kernels de vLLM en estas arquitecturas.
- GPU de consumo: cabe en RTX 4090 (24 GB), RTX 4080 (16 GB) y previsiblemente en RTX 4070 Ti Super (16 GB); en tarjetas de 8 GB la versión GGUF Q4_K_M puede ser ajustada pero con contexto limitado.
- Opciones de despliegue: vLLM (`vllm serve kinyeah/BiMai-Chaoshu-OCR-w4a16`), llama.cpp y Ollama (con el GGUF y el mmproj del subdirectorio gguf/). La model card incluye un ejemplo de Ollama con dos líneas FROM.
- Rendimiento declarado: 0,68 s por columna en vLLM W4A16 y 0,69 s para 8 columnas concurrentes, lo que indica un escalado prácticamente lineal en el lote evaluado; en llama.cpp Q4_K_M, 1,0 s por columna y 3,35 s para 8 columnas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BiMai-Chaoshu-OCR-w4a16 | 8B | No disponible | OCR de caligrafía cursiva china (caoshu) | Apache-2.0 | Hugging Face (kinyeah) |
| Qwen3-VL-8B-Instruct (base) | 8B | No disponible en esta ficha | Multimodal generalista | Apache-2.0 | Hugging Face (Qwen) |
| PaddleOCR (familia) | Variable (modelos ligeros) | No aplica | OCR de texto impreso y manuscrito estándar | Apache-2.0 | GitHub / PaddlePaddle |
| TrOCR (Microsoft) | ~334M (base) / ~558M (large) | No aplica | OCR de texto manuscrito e impreso | MIT | Hugging Face |

La comparación directa es difícil porque no existen en la información disponible benchmarks comunes entre estos sistemas sobre caligrafía cursiva china. BiMai se distingue por estar específicamente ajustado a caoshu, mientras que Qwen3-VL-8B-Instruct es la base generalista sin especialización, PaddleOCR cubre OCR convencional con modelos mucho más pequeños y TrOCR está orientado a manuscrito latino principalmente. No se dispone de datos de rendimiento cruzado para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- El CER reportado (27,8-29,0 %) es elevado en términos absolutos: aproximadamente uno de cada tres o cuatro caracteres puede ser incorrecto, lo que exige revisión humana en cualquier flujo de producción sensible.
- La evaluación se realizó sobre un conjunto interno pequeño (40 columnas, 331 caracteres); la generalización a otros corpus, autores, épocas o estilos de caoshu no está validada en la información disponible.
- El ajuste está orientado a chino tradicional y caligrafía cursiva; no se documenta el comportamiento en chino simplificado, otros idiomas o texto impreso estándar.
- Riesgo de alucinación: en OCR generativo, el modelo puede producir caracteres plausibles no presentes en la imagen; la instrucción de la model card ("solo los trazos visibles") mitiga pero no elimina este riesgo.
- La cuantización W4A16 introduce un ruido medible (≈1,2 puntos de CER) respecto al modelo sin cuantizar; para aplicaciones donde la precisión sea crítica conviene evaluar la versión sin cuantizar.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- Aunque la licencia es Apache-2.0, conviene verificar las condiciones de la licencia del modelo base Qwen3-VL-8B-Instruct para usos comerciales concretos.
- No se documentan sesgos específicos del ajuste, pero al derivar de un modelo entrenado con datos web masivos puede heredar sesgos de representación del chino y de sus variedades regionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kinyeah/BiMai-Chaoshu-OCR-w4a16
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
