# leonnzhang/qwen3.5-0.8b-iam-25-GGUF

## Resumen

Qwen3.5-0.8B IAM Handwriting OCR es un modelo vision-lenguaje compacto derivado de Qwen/Qwen3.5-0.8B-Base mediante un ajuste fino supervisado con LoRA. Lo desarrolla el usuario leonnzhang y su único propósito es transcribir una línea recortada de escritura manuscrita en inglés. El modelo combina un encoder visual con el decoder de lenguaje de Qwen3.5 y se distribuye exclusivamente en formato GGUF cuantizado Q4_K_M, junto con un proyector visual separado en BF16.

La relevancia del modelo es su tamaño: 752 millones de parámetros reales (529 MB en Q4_K_M) y 207 MB adicionales para el proyector visual, lo que permite ejecutar OCR de manuscrito en local con llama.cpp, incluso en CPU. No es un modelo de propósito general: es un especialista entrenado con solo 25 pasos de optimización sobre 1.024 imágenes de línea del dataset Teklia/IAM-line.

El entrenamiento fue deliberadamente mínimo (25 pasos, LoRA de rango 16) y las métricas publicadas son únicamente pérdidas de validación del propio entrenamiento (perplejidad final de 1,2819), sin CER ni WER medidos sobre el split de test de IAM. El autor reconoce explícitamente que el rendimiento en maquetas de página completa, otros idiomas o escaneos degradados no está medido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (encoder visual + decoder transformer Qwen3.5), ajuste fino LoRA |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (longitud máxima de secuencia en entrenamiento) |
| Tipos de cuantizacion | Q4_K_M (pesos del modelo); BF16 (proyector visual) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible en la ficha de Hugging Face; el modelo base Qwen3.5-0.8B-Base se distribuye bajo Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M + mmproj BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B-Base (revisión `a9a407bcae463285164cc9133995c515379cebe5`) y aplica un ajuste fino supervisado con LoRA sobre las capas de lenguaje y de visión. El entrenamiento se ejecutó con Unsloth Studio sobre Apple Silicon usando MLX. La configuración concreta: 25 pasos de optimizador, rango LoRA 16, alpha 16, dropout 0, batch efectivo de 8 (batch 2 × 4 pasos de acumulación), learning rate máximo de 2×10⁻⁴ con 5 pasos de warmup y decaimiento lineal, longitud máxima de 2.048 tokens y semilla 3407.

Los datos de entrenamiento son 1.024 imágenes de línea del split de entrenamiento de Teklia/IAM-line (revisión `fbdad97500ce54635c0d1ba306bf535cb40656cf`) y 976 del split de validación. Tras el entrenamiento, Unsloth fusionó los pesos LoRA y exportó el par GGUF (modelo Q4_K_M y proyector visual BF16). No se documenta ninguna innovación arquitectónica propia más allá del ajuste fino; la innovación práctica es el empaquetado en dos ficheros GGUF ejecutables con `llama-mtmd-cli`.

## Capacidades

- Transcripción de una línea recortada de escritura manuscrita en inglés a texto plano.
- Entrada de imagen (image-text-to-text) mediante el proyector visual incluido en `mmproj-Qwen3.5-0.8B-Base-BF16.gguf`.
- Generación de texto corto: la configuración de referencia limita la salida a 64 tokens (`-n 64`) y temperatura 0 (decodificación determinista).
- Ejecución local con llama.cpp multimodal (`llama-mtmd-cli`), incluida inferencia solo en CPU con `--device none --no-mmproj-offload --no-op-offload`.
- Compatible con endpoints (`endpoints_compatible` en los tags de Hugging Face).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking.

## Casos de uso

- Digitalización de formularios manuscritos: recortando cada campo o línea del formulario y pasándolo al modelo, se obtiene texto plano para volcar en una base de datos; el tamaño de 529 MB permite desplegarlo en el mismo servidor de captura sin GPU dedicada.
- Procesamiento por lotes en CPU: con `--device none` el modelo corre sin GPU, lo que encaja en pipelines de digitalización de archivos históricos donde el coste de GPU es prohibitivo y el throughput no es crítico.
- Preprocesado de datasets de OCR: usar el modelo como etiquetador automático de líneas manuscritas para generar borradores que luego se revisan manualmente, aprovechando la decodificación determinista (temperatura 0).
- Prototipado rápido de aplicaciones de lectura de notas: integración en una herramienta de escritorio o móvil que transcriba notas manuscritas línea a línea, con el par GGUF como único artefacto a distribuir.
- Verificación cruzada en pipelines de OCR existentes: ejecutar este modelo como segundo transcriptor sobre líneas donde un OCR clásico devuelve baja confianza, y marcar discrepancias para revisión humana.
- Docencia e investigación sobre ajuste fino multimodal: el modelo sirve como ejemplo reproducible de un fine-tuning LoRA mínimo (25 pasos) sobre un VLM pequeño, con todos los hiperparámetros y revisiones documentados.

## Benchmarks y rendimiento

| Medición (registro de entrenamiento) | Paso | Valor |
|---|---:|---:|
| Pérdida de validación inicial | 2 | 2,1068 |
| Pérdida de validación final | 24 | 0,2483 |
| Perplejidad de validación final | 24 | 1,2819 |
| Pérdida de entrenamiento final | 25 | 0,2013 |

Estas cifras proceden del entrenamiento, antes de la exportación a GGUF. En una prueba local con los GGUF exportados y llama.cpp, el modelo devolvió el texto «The morning train was late.» a partir de una imagen de línea sintética. El character error rate (CER) y el word error rate (WER) sobre el split de test de IAM no están medidos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos Q4_K_M ocupan 529 MB y el proyector visual BF16 207 MB; en total unos 736 MB de ficheros, con un pico de memoria en inferencia del orden de 1-2 GB según el runtime y la longitud de contexto.
- GPU recomendadas: no se especifican; cualquier GPU con al menos 2-3 GB de VRAM libre debería bastar para la inferencia con offload del proyector. No hay datos de latencia ni throughput publicados.
- Cabe en GPU de consumo: sí, por tamaño; el autor documenta además ejecución solo en CPU con `--device none --no-mmproj-offload --no-op-offload`.
- Opciones de despliegue: llama.cpp multimodal (`llama-mtmd-cli`) es el runtime documentado; los tags mencionan también MLX y compatibilidad con endpoints. No se documenta vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| leonnzhang/qwen3.5-0.8b-iam-25-GGUF | 752 M | 2.048 | GGUF Q4_K_M + mmproj BF16 | no disponible (base Apache 2.0) | Especialista en líneas manuscritas en inglés; sin CER/WER medidos |
| Qwen/Qwen3.5-0.8B-Base | 752 M (dato de la ficha) | no disponible | safetensors (base) | Apache 2.0 | Modelo base generalista; no especializado en OCR de manuscrito |
| OCR clásicos (p. ej. Tesseract) | no aplica | no aplica | binario | Apache 2.0 | No es un VLM; el autor no ofrece comparación cuantitativa |

No se dispone de datos de benchmarks que permitan una comparación de rendimiento con alternativas; la comparativa se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Entrenado exclusivamente con líneas recortadas de manuscrito inglés; el rendimiento en maquetas de página completa, otros idiomas, escaneos degradados y estilos de letra no familiares no está medido.
- Los caracteres ambiguos pueden omitirse, sustituirse o adivinarse; el autor recomienda verificar las transcripciones importantes contra la imagen original.
- Sin CER ni WER sobre el split de test de IAM, por lo que no hay una medida objetiva de calidad fuera del conjunto de validación del entrenamiento.
- El ajuste fino es muy corto (25 pasos, 1.024 imágenes), lo que limita la generalización esperada.
- La licencia del modelo derivado no está indicada en la ficha de Hugging Face; el modelo base es Apache 2.0 y el dataset IAM tiene sus propios términos, que deben consultarse antes de un uso comercial.
- El contexto de 2.048 tokens y la salida de referencia de 64 tokens limitan la transcripción a líneas cortas.
- Riesgo de alucinación inherente a un modelo de 752 M parámetros: puede generar texto plausible no presente en la imagen.
- El runtime puede mostrar marcadores de plantilla de chat en la salida de terminal; hay que filtrarlos antes de usar la transcripción en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leonnzhang/qwen3.5-0.8b-iam-25-GGUF
- Pesos Q4_K_M: https://huggingface.co/leonnzhang/qwen3.5-0.8b-iam-25-GGUF/resolve/main/Qwen3.5-0.8B-Base.Q4_K_M.gguf
- Proyector visual BF16: https://huggingface.co/leonnzhang/qwen3.5-0.8b-iam-25-GGUF/resolve/main/mmproj-Qwen3.5-0.8B-Base-BF16.gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base/blob/main/LICENSE
- Dataset Teklia/IAM-line: https://huggingface.co/datasets/Teklia/IAM-line
- Documentación multimodal de llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/docs/multimodal.md
- Paper de IAM (Marti y Bunke): https://doi.org/10.1007/s100320200071
