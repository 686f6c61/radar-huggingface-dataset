# byron123t/Hawkeye-8B

## Resumen

Hawkeye-8B es un modelo vision-lenguaje especializado en reconocimiento de texto degradado: texto borroso, de baja resolucion o capturado a distancia, tipico de camaras de gafas inteligentes o telefonos moviles. Lo desarrolla byron123t y parte de un fine-tuning de Qwen/Qwen3-VL-8B-Instruct sobre el dataset BSTRB (Blurry Scene Text Recognition Benchmark), asociado al paper *Hawkeye4B: Reading Illegible Text with Vision Language Models* (Tang y Shin, University of Michigan).

El modelo resuelve un problema concreto que los OCR tradicionales y los VLM genericos abordan con dificultad: la transcripcion fiable de texto escasamente legible en escenas reales. Con 8.767 millones de parametros, arquitectura Qwen3-VL y licencia Apache-2.0, se posiciona como una alternativa open source a APIs cerradas para tareas de lectura de texto en el borde.

Su relevancia actual radica en que supera al modelo base y a buena parte de los modelos API mas grandes en el benchmark BSTRB de video, manteniendo el rendimiento en OCR general, lo que lo hace atractivo para integrarse en pipelines de vision por computador donde la legibilidad del texto es el cuello de botella.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (Qwen3-VL) |
| Parametros totales | 8.767.123.696 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors bfloat16) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Hawkeye-8B es un fine-tuning de Qwen3-VL-8B-Instruct, un transformer multimodal con encoder de vision y decoder de lenguaje. El entrenamiento se realizo en dos fases. Primero, un SFT sobre 6.734 fotogramas de video del split de entrenamiento de BSTRB (procedentes de 1.133 videos), con el encoder de vision descongelado, learning rate de 1e-6 para el LLM y el ViT y 1e-5 para el proyector, y entradas reescaladas x3. Despues, un ajuste con GRPO y LoRA (rango 64, alpha 128, sobre q/k/v/o, learning rate pico 2e-5) durante 300 pasos, usando como recompensa el F1 bag-of-words frente a la transcripcion de entrenamiento; el LoRA se fusiona en los pesos publicados.

Una innovacion destacable es el protocolo de inferencia: la imagen se reescala x3 con interpolacion bicubica antes de pasarla al procesador (que la limita a 1.003.520 pixeles), se usa un system prompt estricto de OCR y decodificacion greedy con hasta 4.096 tokens nuevos. Para reproducir exactamente las cifras del paper, la evaluacion re-codifica cada imagen como JPEG (calidad 92, lado mayor maximo 2.048 px) antes del reescalado x3, algo que automatiza el paquete `hawkeye`.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre texto borroso, de baja resolucion o lejano.
- Transcripcion de texto en escenas (scene text recognition) preservando saltos de linea.
- Lectura de texto en capturas de gafas inteligentes y camaras de movil.
- Procesamiento de imagenes con reescalado interno x3 y limite de pixeles.
- Generacion de texto condicionada por imagen (image-text-to-text).
- Conversacion multi-turno en ingles.
- Capacidades heredadas del modelo base Qwen3-VL-8B-Instruct (vision general, no verificadas especificamente en esta ficha).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles; los alfabetos no latinos son raros en los datos de entrenamiento.

## Casos de uso

- Digitalizacion de etiquetas y envases: el modelo transcribe texto de packaging de consumo con degradacion tipica de fotos de movil, gracias al entrenamiento especifico sobre BSTRB y al reescalado x3 que recupera detalle en texto pequeno.
- Lectura asistida con gafas inteligentes: integrado en el pipeline de captura, transcribe texto lejano o borroso de senales, carteles y pantallas en tiempo real, con una mejora de 13,0 pp en word inclusion sobre capturas out-of-distribution de gafas.
- Accesibilidad para personas con baja vision: convierte en texto legible el contenido de carteles, menus o etiquetas que el usuario no puede leer directamente, reduciendo la dependencia de OCR tradicional.
- Automatizacion de inventario y logistica: extrae codigos y descripciones de etiquetas en almacenes con iluminacion deficiente o camaras de baja calidad, donde los OCR clasicos fallan.
- Procesamiento de documentos y fotogramas de video: transcribe texto de fotogramas extraidos de grabaciones (1.331 fotogramas de 224 videos en el benchmark) para indexacion o busqueda posterior.
- Verificacion de precios y tickets: lee importes y descripciones en tickets y etiquetas de estanteria, con la advertencia de que en texto ilegible puede generar valores plausibles pero incorrectos.
- Preprocesado para pipelines de datos: actua como paso de OCR de alta calidad en la construccion de datasets a partir de imagenes de escena, con salida limpia sin preambulos ni Markdown.

## Benchmarks y rendimiento

Resultados del split de test held-out de BSTRB segun el paper (1.331 fotogramas de video de 224 videos, 241 fotos, etiquetas verificadas por humanos). Diferencias pareadas frente al modelo base sobre los mismos items, IC bootstrap del 95% agrupados por video y correccion de Holm.

| Metrica | Hawkeye-8B vs. Qwen3-VL-8B base |
|---|---|
| BSTRB video, BoW F1 | 0,675 a 0,744 (+6,9 pp, IC 95% [+5,8, +8,2]) |
| BSTRB fotos, BoW F1 | +5,3 pp [+3,1, +7,6] |
| 10 benchmarks OCR generales, BoW F1 | 2 de 10 mejores, 8 sin cambio significativo, 0 peores (HierText +6,4, MapText +4,4 pp) |
| Capturas de gafas inteligentes (37 objetos, out-of-distribution) | word inclusion +13,0 pp, BoW F1 +11,5 pp, aligned F1 +12,3 pp (26 de 37 objetos mejoran, 5 empeoran) |
| Cartas de Snellen, texto <= 7 px (precision de caracter) | +7,5 pp [+4,7, +10,2] |
| Bucles de repeticion, texto de video <= 20 px | 8,5% a 5,2% |

Frente a 20 modelos API (GPT, Kimi, Qwen3-VL-235B, Llama 4, Gemma, etc.) en BSTRB video, su BoW F1 de 0,744 es el mas alto de 24 modelos (Hawkeye 4B: 0,728; Qwen3-VL-235B: 0,726; Kimi K2.6: 0,723; GPT-6 Astra: 0,709). En BSTRB fotos, los modelos API mas grandes siguen por delante.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 17,5 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 24 GB para comodidad.
- GPU recomendadas: A100 40/80 GB, H100, L40S; en consumer, RTX 4090 (24 GB) puede alojar los pesos en bf16 con margen ajustado.
- Cabe en GPU consumer de 24 GB (RTX 4090) en bf16; en GPUs de 16 GB requeriria cuantizacion, no documentada en la informacion disponible.
- Opciones de despliegue: `transformers` >= 4.57 con `Qwen3VLForConditionalGeneration`, el paquete `hawkeye` con extra `[infer]`, y endpoints compatibles (tag `endpoints_compatible`). Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible en la informacion proporcionada.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BSTRB video BoW F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hawkeye-8B | 8,77 B | no disponible | 0,744 | Apache-2.0 | HuggingFace |
| Qwen3-VL-8B-Instruct (base) | 8 B (aprox.) | no disponible | 0,675 | Apache-2.0 | HuggingFace |
| Hawkeye 4B | 4 B (aprox.) | no disponible | 0,728 | no disponible | no disponible |
| Qwen3-VL-235B | 235 B (aprox.) | no disponible | 0,726 | no disponible | API |
| Kimi K2.6 | no disponible | no disponible | 0,723 | no disponible | API |
| GPT-6 Astra | no disponible | no disponible | 0,709 | propietaria | API |

## Limitaciones y advertencias

- Entrenado para packaging de consumo, senales, libros y pantallas con predominio del ingles; los alfabetos no latinos son raros en los datos de entrenamiento.
- Las etiquetas de entrenamiento son transcripciones de GPT-5; solo val y test cuentan con etiquetas verificadas por humanos.
- La mejora en precision proviene en buena parte de reducir bucles de repeticion; en salidas que no entran en bucle, la proporcion de palabras ausentes en la referencia es similar a la del modelo base.
- Su fallo mas comun es detenerse antes de tiempo en texto denso.
- En texto muy pequeno o ilegible puede producir completaciones plausibles pero incorrectas (por ejemplo, valores nutricionales); no debe usarse sin verificacion en contextos donde los errores importan (medicacion, texto legal).
- Licencia Apache-2.0 para el modelo, pero el dataset BSTRB usado en entrenamiento tiene licencia propia CC BY-NC 4.0 y acceso restringido (gated), lo que condiciona la reproducibilidad del entrenamiento.
- Riesgo de alucinacion en imagenes sin texto legible: el system prompt indica devolver vacio, pero no hay garantia.
- Sesgos especificos: no disponible en la informacion proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/byron123t/Hawkeye-8B
- Dataset BSTRB: https://huggingface.co/datasets/byron123t/BSTRB
- Codigo: https://github.com/byron123t/hawkeye
- Pagina del proyecto: https://byron123t.github.io/hawkeye/
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
