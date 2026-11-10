# Sik0213/shield-v-rtfs-faceswap-baseline

## Resumen

SHIELD-V RTFS face-swap baseline es un clasificador de vídeo desarrollado por el usuario Sik0213 (cuenta individual de Hugging Face, sin afiliación institucional declarada) para la detección de deepfakes de tipo face-swap. El modelo recibe un clip de diez segundos compuesto únicamente por vídeo (sin audio) y devuelve una única puntuación sigmoide donde valores altos indican mayor evidencia de manipulación facial. Se trata de un baseline de investigación, no de un producto calibrado: el propio autor advierte que la salida no es una probabilidad calibrada y fija un umbral operativo de 0,26435837 seleccionado bajo una política de máximo 10 % de falsos positivos sobre vídeos reales.

El modelo es deliberadamente pequeño: 9.884.507 parámetros, lo que lo sitúa en la liga de clasificadores ligeros aptos para inferencia en tiempo casi real sobre GPU de consumo. Forma parte del linaje experimental SHIELD, aunque no implementa el detector de fotograma completo del diseño original, sino una variante centrada en rostro. Su relevancia actual reside en que ofrece un punto de partida reproducible y verificado (checkpoint con hash SHA-256 publicado, código de preprocesado congelado y API REST local) para quien quiera construir detección de face-swap sobre el conjunto de datos público RTFS-10K de Kontur.AI.

La ficha se basa exclusivamente en la model card y en los metadatos de Hugging Face; no se dispone de paper, blog ni resultados de benchmarks publicados más allá de la métrica ROC-AUC declarada en las etiquetas del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (clasificador de vídeo; el repositorio incluye código fuente en `shield_v/`, pero la model card no detalla la topología) |
| Parametros totales | 9.884.507 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrada fija de 20 fotogramas de 3×180×320, ventana central de 10 s) |
| Tipos de cuantizacion | No disponible (checkpoint `best.pt` en precisión original; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés (`en`); el modelo es de clasificación visual, el idioma es irrelevante para la tarea |
| Licencia | No disponible (la model card declara explícitamente que no asigna licencia a los pesos; los metadatos derivados de RTFS-10K quedan bajo CC BY-SA 4.0) |
| Formato de pesos | PyTorch (`best.pt`), cargado con `torch.load(..., weights_only=True)` |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna más allá de indicar que se seleccionó un único modelo de 9.884.507 parámetros a partir del experimento emparejado «RTFS-only» del 6 de noviembre de 2026. El repositorio incluye el código de modelo, entrenamiento y preprocesado en `shield_v/`, con dependencias fijadas a revisiones Git concretas de SISA y FLA, lo que sugiere el uso de mecanismos de atención lineal o variantes eficientes, aunque esto no se confirma explícitamente. La entrada es un tensor de forma `[batch, 20, 3, 180, 320]`: veinte fotogramas RGB de 180×320 píxeles extraídos de una ventana central de diez segundos a 0,5 s por fotograma.

El entrenamiento se realizó sobre RTFS-10K (revisión `83063ae33220e8da968587d4365bd986c7005835`), filtrando vídeos de al menos diez segundos, 2 FPS y etiqueta `indoor`, y exigiendo para las muestras falsas el flag de generación exitosa. Se seleccionaron 6.340 vídeos elegibles y se asignó el split antes de la extracción de fotogramas usando agrupación por grabación/foto fuente, de modo que un original real y sus derivados falsos quedan siempre en el mismo split (1.338 grupos fuente, cero cruces entre splits). El conjunto de entrenamiento contiene 5.500 clips (1.050 reales, 4.450 falsos), validación 427 y test 413. El muestreo de entrenamiento es «paired-original»: cada época expone 2.098 clips reales y 2.098 falsos rotando los dos métodos de face-swap (`inswapper` y `uniface`). No se documenta uso de RLHF, DPO ni datos sintéticos adicionales.

El preprocesado es un componente técnico destacable: se localiza el rostro mayor con la cascada Haar frontal de OpenCV en los fotogramas 0, 5, 10, 15 y 19, se interpolan los centros y se recorta con altura de 1,6 veces la mediana detectada (acotada a 80–180 píxeles, relación 16:9). Los mismos fotogramas PTS se decodifican a calidad nativa, se letterboxean a 1280×720, se recortan y se redimensionan a 320×180 con interpolación de área, sin recodificación con pérdida. La normalización usa media y desviación estándar de ImageNet.

## Capacidades

- Clasificación binaria de vídeo para detección de face-swap: devuelve una puntuación sigmoide por clip de diez segundos, con umbral operativo de 0,26435837.
- Procesamiento exclusivamente visual: ignora el audio del vídeo de entrada.
- Detección centrada en rostro: localiza el rostro mayor y recorta alrededor de él, con fallback al fotograma completo si falla la detección.
- Inferencia por línea de comandos (`inference.py`) y API REST local (`GET /health`, `GET /model`, `POST /predictions`).
- Verificación de paquete incluida (`verify_package.py` y `verification_results.json`) con smoke test sobre vídeo público y resultado observado en GPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No cubre detección de fondos manipulados ni de vídeo íntegramente generado por IA: el autor lo declara explícitamente no validado para esos casos.

## Casos de uso

- Moderación de contenido en plataformas: integrar el clasificador como filtro previo en pipelines de subida de vídeo para marcar clips sospechosos de face-swap antes de la revisión humana, aprovechando su bajo coste computacional (9,9 M de parámetros) y su API REST local.
- Verificación periodística de material audiovisual: ejecutar `inference.py` sobre clips recibidos de fuentes no verificadas para obtener una puntuación de evidencia de manipulación facial y priorizar la investigación forense.
- Investigación académica en deepfake detection: usar el checkpoint y el manifiesto congelado (`data/selected.jsonl`, SHA-256 publicado) como baseline reproducible sobre RTFS-10K para comparar nuevos métodos bajo el mismo split y política de falsos positivos.
- Auditoría de sistemas de verificación de identidad: desplegar el modelo como capa de detección en procesos de onboarding con vídeo selfie, revisando manualmente los clips que superen el umbral de 0,26435837.
- Construcción de datasets de entrenamiento: emplear `prepare_dataset.py` para generar cachés portables de recortes faciales sin pérdida a partir de fuentes RTFS, reutilizables en el entrenamiento de detectores propios.
- Despliegue en entornos con recursos limitados: al ser un modelo de ~10 M de parámetros y 0,1 GB de repositorio, cabe en GPU de consumo y permite inferencia por lotes en estaciones de trabajo sin aceleradores de datacenter.
- Evaluación de robustez frente a codecs: comparar puntuaciones entre clips reales y falsos con características de compresión distintas para estudiar el posible atajo de dataset que el propio autor señala.

## Benchmarks y rendimiento

La model card declara la métrica `roc_auc` en las etiquetas del repositorio, pero no publica la tabla de resultados numéricos. El único dato operativo disponible es el umbral 0,26435837, seleccionado en validación bajo una política de máximo 10 % de falsos positivos sobre vídeos reales. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 9,9 M de parámetros en FP32 el peso ronda los 40 MB, por lo que la VRAM vendrá dominada por el lote de entrada (`[batch, 20, 3, 180, 320]`) y el grafo de inferencia, no por los pesos.
- GPU recomendadas: el autor reporta un resultado de verificación observado en GPU (`verification_results.json`), pero la model card no especifica el modelo de GPU empleado.
- GPU de consumo: por tamaño, es previsible que quepa en cualquier GPU consumer moderna (RTX 3060 en adelante), aunque no se confirma en la documentación.
- Opciones de despliegue: inferencia CLI (`inference.py`), API REST local (`api.py`) y carga directa del checkpoint con PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un clasificador de vídeo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye resultados de benchmarks ni referencias a modelos comparables de detección de face-swap, por lo que no es posible establecer una comparación cuantitativa rigurosa con alternativas.

## Limitaciones y advertencias

- La puntuación de salida es una sigmoide, no una probabilidad calibrada; no debe interpretarse directamente como confianza.
- El umbral 0,26435837 está ajustado a una política concreta (máximo 10 % de FPR en reales) y puede no ser adecuado para otros contextos operativos.
- El conjunto de entrenamiento no contiene ejemplos de fondos generados íntegramente por IA ni de vídeo completamente sintético; la detección de manipulación de fondo está declarada como no validada.
- No es el detector de fotograma completo del diseño original de SHIELD; el recorte centrado en rostro puede incluir píxeles de fondo circundante.
- Posible atajo de dataset: los archivos reales y falsos pueden conservar características distintas de códec y compresión, lo que el autor señala como riesgo de que el modelo aprenda artefactos de compresión en lugar de señales de manipulación.
- La independencia de identidad entre grabaciones distintas no se verificó por completo.
- Licencia de los pesos no disponible: la model card no asigna licencia al modelo, solo aclara que los metadatos derivados de RTFS-10K quedan bajo CC BY-SA 4.0. El uso comercial queda en un limbo legal que conviene resolver con el autor antes de producción.
- El modelo solo procesa inglés en metadatos y no gestiona audio; clips con voz manipulada no se detectan.
- Riesgo de alucinación no aplica (es un clasificador), pero sí de falsos positivos y negativos en dominios distintos al de entrenamiento (interiores, 2 FPS o más, generadores `inswapper` y `uniface`).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sik0213/shield-v-rtfs-faceswap-baseline
- Dataset RTFS-10K de Kontur.AI: https://huggingface.co/datasets/kontur-ai/rtfs-10k
- Licencia CC BY-SA 4.0 (aplicable a los metadatos derivados del dataset): https://creativecommons.org/licenses/by-sa/4.0/
