# Gabriel/diffu-minicpm-ocr-htr

## Resumen

diffu-minicpm-ocr-htr es un ajuste fino completo (*full fine-tune*) del modelo openbmb/MiniCPM-OCR-1.0, desarrollado por el usuario Gabriel como componente de lectura del proyecto diffu. El modelo está especializado en reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) sobre registros de archivo suecos: lee una línea de texto suelta o una región completa, devolviendo las líneas en orden de lectura, una por línea. Su propósito declarado es servir de comparación directa con el modelo Swedish Lion TrOCR de Riksarkivet sobre los mismos datos y las mismas líneas de test.

Se trata de un modelo de imagen-a-texto con aproximadamente 1.554 millones de parámetros (1,55 B) y pesos en safetensors, distribuido bajo licencia Apache 2.0. El entrenamiento se realizó sobre el *ground truth* HTR GT-Lejonet de Riksarkivet (febrero de 2026), con 1.481.877 líneas de texto y 83.072 regiones, y se detuvo en el paso 28.000 de 36.681 (2,3 épocas). El checkpoint publicado es el de menor CER sobre 1.000 líneas de desarrollo reservadas.

El modelo es relevante en el nicho de digitalización de patrimonio documental: ofrece una alternativa abierta y de pesos libres para HTR en sueco histórico, con métricas publicadas frente a un *baseline* institucional y con soporte de despliegue en vLLM. Su alcance es, no obstante, muy acotado: un único idioma (sueco), un único tipo de tarea (reconocimiento de texto) y una instrucción de prompt entrenada (`Text Recognition:`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal imagen-a-texto (MiniCPM-OCR, base openbmb/MiniCPM-OCR-1.0) |
| Parametros totales | 1.554.488.560 (~1,55 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (configurado en el ejemplo de servicio con `--max-model-len 8192`) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | sueco (`sv`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers; tamaño del repo 3,1 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de MiniCPM-OCR-1.0: un codificador visual acoplado a un modelo de lenguaje mediante un alineador, con procesamiento de imagen por *slicing* (el autor recomienda `downsample_mode: "4x"` y `max_slice_nums: 9` en el procesador multimodal). El ajuste fino entrena el codificador visual y el modelo de lenguaje, manteniendo congelado el alineador, siguiendo la receta de *full fine-tune* publicada por OpenBMB. Se usó *learning rate* de 5e-6 con planificador coseno previsto para 3 épocas, 128 muestras por paso, bfloat16 y dos GPU RTX PRO 6000 Blackwell; el entrenamiento se detuvo en el paso 28.000 de 36.681 (2,3 épocas) al estabilizarse el error sobre las líneas reservadas.

Los datos provienen del *ground truth* HTR GT-Lejonet de Riksarkivet (febrero de 2026), en la partición de entrenamiento del Swedish Lion (con `test_0050` reservado): 1.481.877 líneas de texto y 83.072 regiones, con recortes enmascarados en blanco fuera del polígono de cada línea o región. Se excluyeron las líneas con marcas de lectura incierta (`??`, `(?)`, `[`, `]`) y las inferiores a 10 píxeles, siguiendo el criterio del *baseline*. El texto se entrena tal como fue transcrito, sin normalización. El recorte de inferencia debe replicar el de entrenamiento: caja delimitadora de la línea o región, blanco fuera del polígono y escalado a un máximo de 448 × 448 píxeles equivalentes (200.704; una región hasta 9 veces esa cifra).

## Capacidades

- Reconocimiento de texto manuscrito (HTR) sobre documentos de archivo suecos, tanto en líneas sueltas como en regiones completas.
- Lectura de regiones con múltiples líneas devolviéndolas en orden de lectura, una por línea.
- Procesamiento de imagen-a-texto conversacional mediante plantilla de chat (pipeline `image-text-to-text`).
- Instrucción de prompt especializada: solo se entrenó `Text Recognition:`; no se documentan otras instrucciones.
- Modo *thinking* desactivable (el ejemplo de servicio fija `enable_thinking: false`).
- No se documentan *tool calling*, capacidades de agente, audio ni otras modalidades distintas de imagen.

## Casos de uso

- Digitalización de archivos históricos suecos: el modelo lee líneas manuscritas de registros de archivo y devuelve la transcripción, lo que permite convertir series documentales completas en texto plano indexable; su entrenamiento específico sobre GT-Lejonet lo hace adecuado para este corpus concreto.
- Reconocimiento de regiones completas: al aceptar una región y devolver sus líneas en orden de lectura, permite procesar páginas o bloques sin segmentar previamente cada línea, reduciendo pasos en el pipeline.
- Comparación y validación de motores HTR: sirve como referencia abierta frente al Swedish Lion TrOCR sobre las mismas líneas de test, útil para equipos que evalúan qué motor adoptar en un proyecto de archivo.
- Investigación en HTR histórica: al publicar métricas CER/WER sobre conjuntos *out-of-domain* (`Riksarkivet/eval_htr_out_of_domain_lines`), facilita la reproducción de experimentos y la comparación de recetas de ajuste fino.
- Transcripción asistida con revisión humana: el modelo actúa como lector del proyecto diffu, cuyo revisor (`diffu-minicpm-ocr-htr-jev`) y borrador de decodificación rápida (`diffu-minicpm-ocr-htr-dspark`) están publicados por separado, encajando en un flujo de transcripción más revisión.
- Extracción de texto para motores de búsqueda de archivo: las transcripciones permiten indexar y buscar nombres, fechas y lugares en colecciones manuscritas que de otro modo solo serían consultables como imágenes.

## Benchmarks y rendimiento

Evaluación del autor sobre 6.358 líneas de `Riksarkivet/eval_htr_out_of_domain_lines`, comparando el *baseline* Swedish Lion TrOCR (`trocr`) con este modelo (`minicpm`), ambos leídos con decodificación greedy:

| Métrica | Swedish Lion TrOCR | diffu-minicpm-ocr-htr |
|---|---|---|
| Líneas evaluadas | 6.358 | 6.358 |
| mean CER | 6,67 % | 7,21 % |
| CER (OpenBMB, corpus) | 5,30 % | 5,55 % |
| WER (OpenBMB, corpus) | 21,12 % | 21,76 % |
| mean CER, norm. | 6,62 % | 7,18 % |
| Lecturas cortadas por límite de tokens | 0 | 0 |
| mean CER, *loops cut* | 6,67 % | 7,21 % |
| CER (OpenBMB), *loops cut* | 5,30 % | 5,55 % |

El autor indica además una evaluación sobre 5.000 líneas del *test split* del *baseline* (`test_0050`, filas `test_*`), pero los resultados de esas filas no figuran en la información disponible. No se han publicado resultados de benchmarks en la información disponible para tareas distintas de HTR.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 1,55 B parámetros en bfloat16 los pesos ocupan aproximadamente 3,1 GB, a lo que hay que sumar la caché KV para 8.192 tokens y el procesamiento de hasta 9 *slices* de imagen por región.
- GPU de entrenamiento documentadas: 2 × RTX PRO 6000 Blackwell.
- GPU recomendadas para inferencia: no disponible; por tamaño, cualquier GPU con suficiente VRAM para los pesos más la caché KV debería servir, pero el autor no publica cifras.
- ¿Cabe en GPU de consumo? No disponible; el tamaño de pesos lo haría plausible, pero no hay confirmación del autor.
- Despliegue: vLLM en el commit `fa3b9d13` o posterior (soporte MiniCPM-OCR, vllm#64105), instalado según el instalador de OpenBMB/MiniCPM-OCR. El autor no documenta llama.cpp, Ollama ni TGI.
- Parámetros de servicio sugeridos: `--max-model-len 8192`, `--limit-mm-per-prompt '{"image": 4, "video": 0}'`, `--mm-processor-kwargs '{"downsample_mode": "4x", "max_slice_nums": 9}'`, `--trust-request-mm-kwargs`, `--default-chat-template-kwargs '{"enable_thinking": false}'`.
- Decodificación sugerida: `temperature=0.01`, `top_p=0.001`, `top_k=1`, `repetition_penalty=1.0`; `max_tokens=512` para una línea y hasta 4096 para una región.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | mean CER (OOD, 6.358 líneas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| diffu-minicpm-ocr-htr | ~1,55 B | 8.192 tokens | HTR sueco (línea y región) | 7,21 % | Apache 2.0 | Hugging Face |
| Riksarkivet/swedish-lion-trocr-large-handwritten-char | no disponible | no disponible | HTR sueco (línea) | 6,67 % | no disponible | Hugging Face |
| openbmb/MiniCPM-OCR-1.0 (modelo base) | ~1,55 B (heredado) | no disponible | OCR/HTR multimodal | no disponible | no disponible | Hugging Face |

La comparación directa disponible es únicamente frente al Swedish Lion TrOCR, sobre las mismas líneas y con la misma métrica; no se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Ámbito lingüístico restringido: solo sueco (`sv`); no se garantiza comportamiento en otros idiomas.
- Tarea restringida: únicamente se entrenó la instrucción `Text Recognition:`; otros prompts no están validados.
- Riesgo de bucles: una lectura que termina con `finish_reason == "length"` ha entrado en bucle (ocurre con líneas de puntos conductores); el autor recomienda recortar la cola repetida. En la evaluación publicada no se registraron lecturas cortadas.
- Dependencia estricta del preprocesado: el recorte debe replicar el de entrenamiento (caja delimitadora, blanco fuera del polígono, escalado máximo a 448 × 448 píxeles equivalentes); desviarse puede degradar la transcripción.
- Dependencia de versión de vLLM: requiere el commit `fa3b9d13` o posterior; versiones anteriores no soportan MiniCPM-OCR.
- Rendimiento ligeramente inferior al *baseline* institucional en el conjunto *out-of-domain* evaluado (7,21 % frente a 6,67 % de mean CER); no es un reemplazo superior, sino una alternativa abierta.
- Sin datos publicados sobre sesgos, alucinación en texto libre ni comportamiento fuera del dominio de archivos históricos suecos.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; verificar el cumplimiento de las condiciones de los datos de entrenamiento de origen (Riksarkivet) para usos derivados.
- Cifras de descargas y likes muy bajas (2 descargas, 0 likes en el momento de la consulta): modelo reciente y sin validación comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Gabriel/diffu-minicpm-ocr-htr
- Modelo base: https://huggingface.co/openbmb/MiniCPM-OCR-1.0
- Revisor asociado: https://huggingface.co/Gabriel/diffu-minicpm-ocr-htr-jev
- Borrador de decodificación rápida: https://huggingface.co/Gabriel/diffu-minicpm-ocr-htr-dspark
- Repositorio del proyecto diffu: https://github.com/Borg93/diffu2
- Baseline Swedish Lion TrOCR: https://huggingface.co/Riksarkivet/swedish-lion-trocr-large-handwritten-char
- Conjunto de evaluación out-of-domain: https://huggingface.co/datasets/Riksarkivet/eval_htr_out_of_domain_lines
- Repositorio OpenBMB/MiniCPM-OCR: https://github.com/OpenBMB/MiniCPM-OCR
- Pull request de soporte en vLLM: https://github.com/vllm-project/vllm/pull/64105
