# nannannan6/Qwen2.5-Omni-3B-Mobile-16GB-GGUF

## Resumen

Qwen2.5-Omni-3B-Mobile-16GB-GGUF es una distribución cuantizada y ajustada mediante LoRA del modelo multimodal Qwen2.5-Omni-3B, desarrollado originalmente por el equipo Qwen de Alibaba. El autor del repositorio, nannannan6, ha empaquetado el modelo en formato GGUF con el objetivo explícito de que funcione dentro del presupuesto de memoria física de un teléfono Android con 16 GB de RAM y 6 GB de swap, sin recurrir a swap de flash lento. Se trata, por tanto, de una adaptación de despliegue más que de un modelo nuevo.

El modelo base es un transformer omni-modal de 3.397.103.616 parámetros que acepta entradas de texto, imagen, audio y vídeo (audio-vídeo sincronizado), y genera texto como salida. La adaptación añade un ajuste fino con LoRA (r=32, lora_alpha=64) sobre las 36 capas del modelo de lenguaje, manteniendo congelados los torres visual y de audio para preservar la compatibilidad del proyector multimodal.

La relevancia de esta ficha radica en su enfoque práctico: ofrece cifras medidas de consumo de memoria en CPU pura (pico de 4.9-5.1 GB con cuantización Q4_K_M), scripts de despliegue para Termux y una comparativa de evaluación antes y después del ajuste fino sobre un conjunto de test de 60 muestras. No obstante, conviene subrayar que el ajuste se ha realizado sobre un dataset muy reducido (660 muestras de entrenamiento) y que los idiomas declarados son únicamente chino e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer omni-modal (Qwen2.5-Omni): torre visual, torre de audio y modelo de lenguaje con proyector multimodal |
| Parametros totales | 3.397.103.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens en los scripts de despliegue proporcionados (contexto nativo del modelo base: no disponible en la informacion proporcionada) |
| Tipos de cuantizacion | Q4_K_M (1.960 GB) y Q8_0 (3.368 GB) para el modelo principal; Q8_0 (1.434 GB) para el proyector mmproj |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-Omni-3B es un transformer omni-modal que combina un modelo de lenguaje con un codificador visual y un codificador de audio, unidos mediante un proyector multimodal (mmproj). Esta adaptación congela las torres `visual` y `audio_tower` y aplica LoRA únicamente sobre el `language_model`, con rango 32 y alpha 64, lo que supone 59.867.136 parámetros entrenables (1,2568 % del total). El ajuste se realizó en dos fases: una primera de 3 épocas (pasos 1 a 248) en la que la pérdida descendió de 2,19652 a 0,17838, seguida de una fase de minería de ejemplos difíciles que seleccionó 251 de las 660 muestras de mayor pérdida para un segundo entrenamiento (pasos 249 a 280, lr=3e-5, pérdida 0,34107 en el paso 280).

El dataset de ajuste contiene 660 muestras de entrenamiento y 60 de test independiente, con auditoría declarada de cero fugas (`zero_leakage_verified: true`) y cobertura completa de medios. Se compone de diez subfuentes: imagen (240/20) con llava_zh, coco, chartqa y docvqa; audio (220/20) con fleurs_zh, minds14_zh, librispeech y esc50; vídeo (140/12) con msrvtt; y audio-vídeo sincronizado (60/8) con av_sync. El autor incluye además una auditoría del espectro de valores singulares de los 252 módulos LoRA, todos marcados como saludables (sin NaN ni Inf), con una actualización relativa media de Frobenius del 0,9875 % y un rango efectivo medio de 11,59 sobre 32. También se documenta la corrección explícita de `eos_token_id: [151645, 151643]` en la configuración de fusión.

## Capacidades

- Generación de texto conversacional multi-turno en chino e inglés.
- Comprensión de imágenes: descripción, OCR y razonamiento sobre valores numéricos en gráficos (chartqa, docvqa).
- Reconocimiento automático de voz (ASR) en chino e inglés, con detección de intención a partir de audio.
- Comprensión de audio ambiental y clasificación de eventos sonoros (esc50).
- Comprensión de vídeo: descripción de dinámicas y cambios de acción (msrvtt).
- Comprensión audio-vídeo sincronizada: identificación conjunta de lo que ocurre en pantalla y en la pista de sonido (av_sync).
- Salida estructurada con formato conforme (la tasa de cumplimiento de formato sube a 1,0000 tras el ajuste).
- Capacidad any-to-any según la etiqueta de pipeline (entrada multimodal, salida de texto).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, visión de alta resolución o audio en streaming: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de accesibilidad en Android: el modelo puede describir imágenes de la cámara o de la galería y leer texto en voz alta mediante OCR, funcionando íntegramente en local dentro de los 4,9-5,0 GB de pico de memoria medidos con Q4_K_M, lo que evita enviar contenido sensible a la nube.
- Transcripción y clasificación de notas de voz: con el modo audio (pico de 5,017 GB), el cliente `mobile_omni_client.py` permite transcribir un archivo m4a y determinar la intención del hablante, útil para diarios personales o gestión de tareas sin conexión.
- Análisis de documentos y gráficos en movilidad: la variante Q8_0 (pico de 5,082 GB en imagen) está pensada para OCR de alta precisión y lectura de valores en gráficos (chartqa, docvqa), adecuada para revisar informes o facturas fotografiadas.
- Descripción de vídeo para catalogación rápida: con el modo vídeo (pico de 4,933 GB) se pueden generar descripciones de clips grabados con el teléfono, por ejemplo para etiquetar contenido antes de subirlo a un archivo personal.
- Verificación de audio-vídeo sincronizado: el modo av_sync (pico de 4,909 GB) permite comprobar si lo que suena corresponde a lo que se ve, útil en control de calidad de grabaciones o en la detección de desincronizaciones.
- Prototipado e investigación en entornos sin GPU: al ejecutarse con `llama-mtmd-cli` en CPU pura con `-ngl 0`, sirve para validar pipelines multimodales en portátiles modestos o en el propio teléfono antes de escalar a infraestructura mayor.
- Evaluación de técnicas de ajuste eficiente: el repositorio incluye el bundle LoRA (`omni_lora_bundle.tar.gz`), los logs de entrenamiento y los informes de espectro SVD, lo que lo convierte en un material de referencia para estudiar LoRA de dos fases con minería de ejemplos difíciles sobre un modelo multimodal pequeño.

## Benchmarks y rendimiento

Los únicos datos disponibles son la comparativa interna del autor entre el modelo base y la versión ajustada, sobre un conjunto de test propio de 60 muestras (`n=60`). No son benchmarks estándar de la comunidad y no deben compararse directamente con resultados publicados de MMLU, HumanEval o GSM8K.

| Metrica | Base (Qwen2.5-Omni-3B) | Mobile-FT | Delta |
|---|---:|---:|---:|
| Puntuación núcleo global (`overall_core_score`) | 0,3497 | 0,6760 | +0,3263 |
| Cumplimiento de formato estructurado | 0,5500 | 1,0000 | +0,4500 |
| Modalidad imagen | 0,2894 | 0,5604 | +0,2710 |
| Modalidad audio | 0,5985 | 0,8611 | +0,2626 |
| Modalidad vídeo / audio-vídeo | 0,1611 | 0,6066 | +0,4455 |
| Latencia media de respuesta | 0,823 s | 0,795 s | -0,028 s |

Desglose por subconjunto destacado por el autor: esc50 (0,0 → 0,8), coco (0,0 → 0,7114), msrvtt (0,0 → 0,5235), chartqa (0,2 → 0,6), av_sync (0,4028 → 0,7313) y minds14_zh (0,4395 → 0,6337).

Consumo de memoria medido en CPU pura con `llama-mtmd-cli` (`-ngl 0 --no-mmproj-offload -t 6 -c 4096`):

| Variante | Modelo principal | mmproj | Disco total | Pico de memoria fisica (VmHWM) |
|---|---|---|---:|---:|
| Q4_K_M (recomendada) | 1,960 GB | 1,434 GB (Q8_0) | 3,394 GB | 4,904-5,017 GB |
| Q8_0 (alta precision) | 3,368 GB | 1,434 GB (Q8_0) | 4,802 GB | 5,082 GB (imagen) |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 4,9-5,1 GB de memoria física en CPU con Q4_K_M + mmproj Q8_0; 5,1 GB con Q8_0 + mmproj Q8_0 (medido en Colab Linux, no en dispositivo ARM real).
- Espacio en disco: 3,394 GB (Q4_K_M) o 4,802 GB (Q8_0), incluyendo el proyector.
- GPU recomendadas: no disponible en la informacion proporcionada; el autor ha validado el despliegue en CPU pura con `-ngl 0` y no documenta resultados con offload a GPU.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con 6-8 GB o más de VRAM, pero no hay mediciones publicadas en la informacion proporcionada.
- Dispositivo objetivo declarado: teléfono Android con 16 GB de RAM física y 6 GB de swap, ejecutando Termux en ARM64.
- Opciones de despliegue: `llama.cpp` (`llama-mtmd-cli` y `llama-server`), scripts `termux_deploy.sh` y cliente `mobile_omni_client.py` incluidos; se menciona compatibilidad de importación con PocketPal AI. vLLM y TGI no están documentados para este formato GGUF.
- Latencia y throughput: latencia media de respuesta de 0,795 s por muestra en la evaluación del autor (entorno no especificado con detalle); no se publican tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| Qwen2.5-Omni-3B-Mobile-16GB-GGUF | 3,40 B | 4096 en scripts | texto, imagen, audio, vídeo, audio-vídeo | Apache 2.0 | GGUF en HF (0 descargas al redactar) | Ajuste LoRA sobre 660 muestras; orientado a movil |
| Qwen2.5-Omni-3B (base) | 3,40 B | no disponible | texto, imagen, audio, vídeo | Apache 2.0 | safetensors en HF | Referencia de la comparativa interna del autor |
| Qwen2.5-Omni-7B | 7 B aprox. | no disponible | texto, imagen, audio, vídeo | Apache 2.0 | safetensors en HF | Misma familia, mayor tamaño; no cabe con holgura en el presupuesto movil objetivo |
| Otros modelos omni pequenos en GGUF | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- El ajuste fino se ha realizado con solo 660 muestras de entrenamiento y 60 de test; los incrementos reportados proceden de un conjunto de evaluación propio y reducido, no de benchmarks estandarizados, por lo que la generalizacion a dominios nuevos no está demostrada.
- Idiomas declarados únicamente chino e inglés; el rendimiento en castellano no está evaluado y previsiblemente será inferior.
- El contexto documentado en los scripts es de 4096 tokens; no se especifica el contexto nativo del modelo base ni si se puede ampliar sin degradación.
- La memoria se midió en un host Linux x86 con `llama-mtmd-cli` en CPU pura, no en un teléfono ARM64 real; el consumo en Termux puede diferir.
- El repositorio tiene 0 descargas y 0 likes en el momento de redactar la ficha, sin validación independiente por parte de la comunidad.
- Riesgo de alucinación inherente a los modelos de 3 B de parámetros, especialmente en OCR de documentos densos y en razonamiento numérico sobre gráficos.
- Sesgos: no se documenta ninguna evaluación de sesgos demográficos, culturales o de seguridad en la informacion proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero al derivar del modelo base Qwen conviene revisar los términos del repositorio original de Qwen antes de un despliegue en producción.
- La corrección manual de `eos_token_id` en la fusión sugiere que la integración con herramientas de terceros puede requerir ajustes adicionales.
- No se documenta soporte de tool calling, agentes ni modo thinking; no deben asumirse estas capacidades.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nannannan6/Qwen2.5-Omni-3B-Mobile-16GB-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-3B
- Manifiesto de artefactos y SHA256: https://huggingface.co/nannannan6/Qwen2.5-Omni-3B-Mobile-16GB-GGUF/blob/main/eval/deliverables_manifest.json
- Guía de despliegue móvil: https://huggingface.co/nannannan6/Qwen2.5-Omni-3B-Mobile-16GB-GGUF/blob/main/mobile_deploy/MOBILE_DEPLOY_GUIDE.md
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper de Qwen2.5-Omni: no disponible en la informacion proporcionada
- Blog oficial de Qwen: no disponible en la informacion proporcionada
