# leonnzhang/qwen3.5-0.8b-iam-25-GGUF

## Resumen

El modelo `leonnzhang/qwen3.5-0.8b-iam-25-GGUF` es un ajuste fino (fine-tuning) del checkpoint base Qwen3.5-0.8B-Base de Qwen, especializado en el reconocimiento de escritura manuscrita en ingles (OCR de lineas manuscritas). Lo desarrolla el usuario leonnzhang y se publica como un par de archivos GGUF listos para ejecutarse localmente con una compilacion multimodal de llama.cpp. El modelo resuelve un problema muy concreto: transcribir una unica linea de escritura manuscrita en ingles recortada de la imagen original, devolviendo el texto plano como respuesta.

Arquitectonicamente hereda la estructura vision-language del Qwen3.5-0.8B-Base (un transformer multimodal con encoder de vision y proyector), con 752.393.024 parametros totales. Se distribuye en cuantizacion Q4_K_M (529 MB) mas un proyector de vision separado en BF16 (207 MB), lo que permite inferencia en CPU o GPU de gama baja. El contexto de entrenamiento se limito a 2.048 tokens.

Su relevancia actual es practica: demuestra que un ajuste fino muy corto (25 pasos de LoRA sobre 1.024 imagenes de linea) puede mejorar de forma medible la transcripcion de manuscrito frente al modelo base, manteniendo un coste de despliegue minimo. Es un modelo de nicho, no un asistente general, y su evaluacion publica se limita a una prueba de smoke test y a un benchmark propio de nombres de medicamentos manuscritos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (base Qwen3.5-0.8B-Base), encoder de vision + proyector + LLM |
| Parametros totales | 752.393.024 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (longitud maxima de secuencia en entrenamiento; en inferencia el ejemplo usa `-c 2048`) |
| Tipos de cuantizacion | Q4_K_M para los pesos del modelo; BF16 para el proyector de vision (`mmproj`) |
| Idiomas soportados | ingles (`en`) |
| Licencia | no disponible en la ficha del modelo (el base Qwen3.5-0.8B-Base se distribuye bajo Apache 2.0) |
| Formato de pesos | GGUF (dos archivos: pesos del modelo y `mmproj`) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint base Qwen3.5-0.8B-Base (revision `a9a407bcae463285164cc9133995c515379cebe5`) y aplica un ajuste fino supervisado con LoRA usando Unsloth Studio sobre Apple Silicon con MLX. El ajuste afecta tanto a las capas del lenguaje como a las de vision. La configuracion de entrenamiento fue: rango LoRA 16, alpha 16, dropout 0, batch efectivo 8 (batch 2 × 4 pasos de acumulacion), tasa de aprendizaje maxima 2 × 10⁻⁴ con 5 pasos de warmup y decaimiento lineal, longitud maxima de secuencia 2.048 tokens y semilla 3407.

El entrenamiento se ejecuto durante 25 pasos de optimizador (0,195 epocas, aproximadamente el 19,5 % de una pasada) sobre un subconjunto de 1.024 imagenes de linea del split de entrenamiento del dataset Teklia/IAM-line (revision `fbdad97500ce54635c0d1ba306bf535cb40656cf`), con 976 imagenes del split de validacion. Tras el ajuste, Unsloth fusiono los pesos LoRA antes de exportar el par GGUF. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa; la innovacion principal es la fusion de LoRA en un modelo multimodal compacto y su empaquetado GGUF con `mmproj` separado para llama.cpp.

## Capacidades

- Transcripcion de una linea de escritura manuscrita en ingles recortada de la imagen, devolviendo texto plano.
- Entrada image-text-to-text (imagen + prompt de texto), con encoder de vision integrado en el archivo `mmproj`.
- Generacion de texto condicionada por imagen; el prompt de referencia es "Transcribe the text visible in the image.".
- Inferencia local en CPU o GPU mediante `llama-mtmd-cli` (build multimodal de llama.cpp).
- Compatible con endpoints (`endpoints_compatible` segun los tags del repo).
- Idiomas: unicamente ingles.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, audio ni vision general mas alla de la transcripcion.

## Casos de uso

- Digitalizacion de formularios manuscritos: dado un recorte de una linea de un formulario en ingles, el modelo devuelve el texto transcrito para poblar bases de datos; es adecuado por su tamano reducido y su entrenamiento especifico en lineas del IAM.
- Procesamiento por lotes de archivos historicos: integrado en un pipeline que segmenta paginas en lineas y llama al modelo por cada recorte, permite transcribir colecciones a bajo coste en CPU.
- Verificacion de nombres de medicamentos manuscritos: el benchmark propio del autor sobre 100 recortes de nombres de medicamentos muestra un CER del 32,69 %, lo que lo hace util como primera pasada en entornos clinicos con revision humana posterior.
- Extraccion de datos de notas manuscritas: para lineas sueltas en ingles (direcciones, importes, nombres) en digitalizacion de documentos escaneados.
- Despliegue en dispositivos sin GPU: al caber en 529 MB (Q4_K_M) mas 207 MB (mmproj) y ejecutarse con `--device none --no-mmproj-offload --no-op-offload`, sirve para portatiles o servidores sin acelerador.
- Prototipado e investigacion en OCR manuscrito: como punto de partida reproducible para comparar ajustes finos de LoRA sobre Qwen3.5-0.8B en tareas de transcripcion.
- Automatizacion de la revision de manuscritos en archivos: combinado con un modelo mayor para validacion cruzada, reduce el volumen de lineas que requieren revision manual.

## Benchmarks y rendimiento

El autor publica un benchmark propio sobre 100 recortes de nombres de medicamentos manuscritos (59 nombres distintos, split de test de un dataset separado del de entrenamiento IAM), evaluado con Promptfoo en LM Studio a temperatura 0:

| Modelo | CER ↓ | Ediciones de caracteres ↓ | Exact match ↑ |
|---|---:|---:|---:|
| Qwen3.5-0.8B Base (BF16) | 65,22 % | 405 | 18/100 (18 %) |
| Qwen3.5-0.8B Instruct (MLX 4-bit) | 43,96 % | 273 | 21/100 (21 %) |
| Este checkpoint (Q4_K_M GGUF) | 32,69 % | 203 | 26/100 (26 %) |

El CER se calcula como el total de ediciones de Levenshtein dividido entre los 621 caracteres de referencia. Frente al base, el checkpoint reduce las ediciones de caracteres un 49,9 % y aumenta el exact match en 8 puntos porcentuales. El autor advierte que estos resultados reflejan configuraciones de inferencia completas, incluidas diferencias de formato y precision de pesos, y que el subconjunto de 100 imagenes se reutilizo durante el desarrollo. El CER y el WER sobre el split de test de IAM permanecen sin medir.

Metricas del registro de entrenamiento (antes de la exportacion GGUF):

| Medicion | Paso | Valor |
|---|---:|---:|
| Primera perdida de validacion registrada | 2 | 2,1068 |
| Ultima perdida de validacion registrada | 24 | 0,2483 |
| Perplejidad de validacion final | 24 | 1,2819 |
| Perdida de entrenamiento final | 25 | 0,2013 |

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,74 GB para los pesos (529 MB Q4_K_M + 207 MB mmproj BF16) mas el overhead de contexto; con `-c 2048` el consumo adicional de KV cache es reducido.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM libre (RTX 3060, RTX 4060, RTX 4090, A100, H100); el modelo no necesita aceleradores de gama alta.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna, e incluso en CPU pura.
- Opciones de despliegue: llama.cpp con build multimodal (`llama-mtmd-cli`), con soporte de offload a GPU o modo CPU (`--device none --no-mmproj-offload --no-op-offload`). Los tags mencionan tambien MLX y `endpoints_compatible`.
- Latencia y throughput: no disponibles; el autor solo documenta un smoke test local que devolvio "The morning train was late." desde una imagen sintetica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---:|---:|---|---|---|
| Este checkpoint (Qwen3.5-0.8B IAM 25-step GGUF) | 752 M | 2.048 | GGUF (Q4_K_M + mmproj BF16) | no disponible | OCR de lineas manuscritas en ingles |
| Qwen3.5-0.8B Base (BF16) | 752 M | no disponible | safetensors/BF16 | Apache 2.0 | Modelo base multimodal general |
| Qwen3.5-0.8B Instruct (MLX 4-bit) | 752 M | no disponible | MLX 4-bit | no disponible | Modelo instructivo multimodal general |

La comparativa de rendimiento disponible se limita al benchmark de nombres de medicamentos del autor (ver seccion anterior), donde este checkpoint supera a ambos baselines en CER y exact match. No se dispone de comparaciones con modelos OCR dedicados de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con lineas de escritura manuscrita en ingles recortadas; el rendimiento en paginas completas, otros idiomas, escaneos degradados y estilos de letra no familiares no esta medido.
- Puede omitir, sustituir o adivinar caracteres ambiguos; el autor recomienda verificar las transcripciones importantes contra la imagen original.
- El ajuste fino fue muy corto (25 pasos, 0,195 epocas), lo que limita la generalizacion mas alla del dominio IAM.
- El CER y el WER sobre el split de test de IAM no se han medido; la unica evaluacion publica es un benchmark propio de 100 imagenes reutilizadas durante el desarrollo, con riesgo de sesgo.
- La licencia del checkpoint no esta indicada en la ficha; el base es Apache 2.0, pero conviene confirmar los terminos antes de uso comercial. Los datos de entrenamiento (IAM) tienen sus propios terminos.
- El modelo es de nicho: no es un asistente general ni soporta tool calling, agentes ni razonamiento multi-paso.
- El contexto maximo es de 2.048 tokens, insuficiente para transcripciones largas o documentos completos.
- El autor advierte que algunos runtimes pueden mostrar marcadores de plantilla de chat en la salida de terminal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leonnzhang/qwen3.5-0.8b-iam-25-GGUF
- Modelo base Qwen3.5-0.8B-Base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Licencia del base Qwen: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base/blob/main/LICENSE
- Dataset Teklia/IAM-line: https://huggingface.co/datasets/Teklia/IAM-line
- Dataset de handwriting OCR usado en el benchmark: https://huggingface.co/datasets/lance-format/handwriting-ocr
- Documentacion multimodal de llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/docs/multimodal.md
- Paper de IAM (Marti y Bunke): https://doi.org/10.1007/s100320200071
