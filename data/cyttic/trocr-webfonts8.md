# cyttic/trocr-webfonts8

## Resumen

`cyttic/trocr-webfonts8` es un modelo de reconocimiento óptico de caracteres (OCR) desarrollado por el usuario `cyttic` y publicado en Hugging Face el 5 de septiembre de 2026. Se trata de un fine-tuning del modelo base `cyttic/exp2-frozen-benyehuda-cont`, que a su vez pertenece a la familia TrOCR (vision-encoder-decoder). El modelo está diseñado para la tarea de image-to-text, es decir, convertir imágenes con texto en secuencias de texto, y su nombre sugiere una especialización en fuentes web (webfonts).

El modelo tiene un total de 299.495.168 parámetros y se distribuye en formato safetensors. El repositorio ocupa 3,6 GB. La arquitectura es de tipo vision-encoder-decoder, propia de los modelos TrOCR, que combinan un codificador visual con un decodificador de texto. No se dispone de información sobre la licencia, los idiomas soportados ni el dataset de entrenamiento, aunque el nombre del modelo base (`benyehuda-cont`) apunta a un posible enfoque en hebreo. El autor declara métricas de evaluación finales de CER 0,0199 y WER 0,0549, sin benchmarks comparativos publicados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | vision-encoder-decoder (TrOCR) |
| Parametros totales | 299.495.168 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo OCR, no aplica contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `cyttic/exp2-frozen-benyehuda-cont`, un modelo base de la familia TrOCR. La arquitectura vision-encoder-decoder procesa imágenes mediante un codificador visual y genera texto token a token con un decodificador, lo que lo hace adecuado para tareas de OCR. El dataset de entrenamiento no está documentado; el autor indica explícitamente que se desconoce.

Durante el entrenamiento se emplearon los siguientes hiperparámetros: learning rate de 2e-05, batch size de 8, gradient accumulation de 2 (batch efectivo de 16), optimizador AdamW con betas (0,9, 0,999), scheduler lineal con 4.650 pasos de warmup y 3 épocas. El entrenamiento totalizó 46.500 pasos. Los resultados de evaluación finales fueron loss 0,3767, CER 0,0199 y WER 0,0549. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) a partir de imágenes, devolviendo texto plano.
- Fine-tuning específico para fuentes web (webfonts), lo que puede mejorar la precisión en tipografías digitales.
- No soporta tool calling ni function calling, al no ser un modelo de lenguaje generativo.
- No soporta agentes ni razonamiento multi-step.
- Capacidades multilingües no documentadas; el modelo base sugiere un posible enfoque en hebreo, pero no está confirmado.

## Casos de uso

- Digitalización de documentos: el modelo puede transcribir texto de imágenes de documentos escaneados o fotografiados, integrándose en pipelines de archivado y búsqueda documental.
- Extracción de texto de capturas de pantalla: útil en control de calidad de aplicaciones web para verificar que el texto renderizado coincide con el esperado, gracias a su especialización en webfonts.
- Accesibilidad: puede leerse texto de imágenes para personas con discapacidad visual, generando descripciones textuales de contenido gráfico.
- Automatización de entrada de datos: permite extraer texto de formularios, facturas o recibos en imagen, reduciendo la intervención manual en procesos administrativos.
- Archivo histórico: transcribe textos de imágenes de archivos digitalizados, facilitando la indexación y búsqueda de contenido antiguo.
- Verificación de contenido web: compara el texto presente en capturas de pantalla de sitios web con el contenido esperado, útil en auditorías de front-end.

## Benchmarks y rendimiento

El model-index de la tarjeta de Hugging Face no contiene resultados de benchmarks. No obstante, el autor declara los resultados de evaluación en la propia README. A continuación se muestran los valores finales y la evolución durante el entrenamiento:

| Metrica | Valor final |
|---|---|
| Loss | 0,3767 |
| CER | 0,0199 |
| WER | 0,0549 |

Tabla de evolución durante el entrenamiento:

| Training Loss | Epoch | Step | Validation Loss | Cer | Wer |
|:---:|:---:|:---:|:---:|:---:|:---:|
| 4,5418 | 0,1290 | 2000 | 2,0382 | 0,1861 | 0,3904 |
| 3,3457 | 0,2581 | 4000 | 1,5427 | 0,1291 | 0,2809 |
| 2,7235 | 0,3871 | 6000 | 1,2456 | 0,0979 | 0,2237 |
| 2,3994 | 0,5161 | 8000 | 1,0101 | 0,0729 | 0,1815 |
| 2,1177 | 0,6452 | 10000 | 0,8963 | 0,0641 | 0,1593 |
| 1,7386 | 0,7742 | 12000 | 0,7650 | 0,0527 | 0,1341 |
| 1,4975 | 0,9032 | 14000 | 0,6938 | 0,0469 | 0,1212 |
| 1,1829 | 1,0323 | 16000 | 0,6345 | 0,0409 | 0,1056 |
| 1,1020 | 1,1613 | 18000 | 0,5900 | 0,0362 | 0,0971 |
| 1,0794 | 1,2903 | 20000 | 0,5514 | 0,0330 | 0,0883 |
| 1,0658 | 1,4194 | 22000 | 0,5251 | 0,0305 | 0,0837 |
| 1,0619 | 1,5484 | 24000 | 0,4962 | 0,0289 | 0,0780 |
| 0,9589 | 1,6774 | 26000 | 0,4694 | 0,0282 | 0,0753 |
| 0,9299 | 1,8065 | 28000 | 0,4542 | 0,0254 | 0,0697 |
| 0,8641 | 1,9355 | 30000 | 0,4301 | 0,0239 | 0,0660 |
| 0,7499 | 2,0645 | 32000 | 0,4196 | 0,0242 | 0,0652 |
| 0,6854 | 2,1935 | 34000 | 0,4220 | 0,0239 | 0,0635 |
| 0,7097 | 2,3226 | 36000 | 0,4005 | 0,0215 | 0,0596 |
| 0,6367 | 2,4516 | 38000 | 0,3960 | 0,0221 | 0,0591 |
| 0,6202 | 2,5806 | 40000 | 0,3890 | 0,0214 | 0,0586 |
| 0,5924 | 2,7097 | 42000 | 0,3858 | 0,0204 | 0,0568 |
| 0,6166 | 2,8387 | 44000 | 0,3805 | 0,0203 | 0,0558 |
| 0,6985 | 2,9677 | 46000 | 0,3771 | 0,0199 | 0,0552 |
| 0,6549 | 3,0 | 46500 | 0,3767 | 0,0199 | 0,0549 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 299.495.168 parámetros, los pesos en fp32 ocupan aproximadamente 1,2 GB y en fp16 unos 0,6 GB. Sumando activaciones y overhead, se recomienda al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM, como RTX 3060, RTX 4090, A100 o H100.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en GPUs consumer modernas.
- Opciones de despliegue: transformers (pipeline image-to-text), Hugging Face Inference Endpoints (el modelo está marcado como compatible con endpoints).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información comparable en los datos proporcionados. El modelo es un fine-tuning de `cyttic/exp2-frozen-benyehuda-cont`, pero no se conocen los parámetros ni las métricas de este modelo base. Tampoco se han publicado comparativas con otros modelos TrOCR como `microsoft/trocr-base` o `microsoft/trocr-large`.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido, lo que impide evaluar la generalización del modelo fuera de los datos utilizados.
- Sin licencia especificada, por lo que el uso comercial es incierto y requiere verificación con el autor.
- Riesgo de alucinación en OCR: el modelo puede producir caracteres o palabras incorrectas, especialmente en tipografías poco frecuentes.
- Posible sesgo hacia las fuentes web presentes en el dataset de entrenamiento, con menor precisión en documentos impresos o manuscritos.
- Idiomas soportados no documentados; el modelo base sugiere un enfoque en hebreo, pero no está confirmado oficialmente.
- No se han publicado benchmarks comparativos, lo que dificulta la evaluación objetiva frente a otras soluciones OCR.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/trocr-webfonts8
- Modelo base: https://huggingface.co/cyttic/exp2-frozen-benyehuda-cont
