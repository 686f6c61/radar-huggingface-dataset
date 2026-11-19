# luyu1021/turbot2va-ovi

## Resumen

TurboT2VA-Ovi es una release de investigación de destilación de un modelo de generación conjunta de audio y vídeo a partir de texto, construida sobre el modelo base Ovi (chetwinlow1/Ovi). El autor, luyu1021, publica tres snapshots de estudiante destilado a cuatro pasos: un checkpoint DCM (Distribution Matching Distillation) en el paso 500, un sCM corregido en el paso 300 y un snapshot posterior de parada segura en el paso 343. El objetivo es reducir el coste de muestreo de un profesor de 50 pasos a un estudiante de 4 pasos, manteniendo coherencia entre las modalidades de vídeo y audio.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de destilación aplicada a un modelo multimodal de vídeo con audio, un área donde las recetas de destilación publicadas son escasas. Por otro, el autor es explícito sobre el estado experimental del artefacto: no es un modelo final validado, no es una release oficial del upstream y no es un pipeline de Diffusers listo para usar. Los pesos están en formato PyTorch DCP (`.distcp`), requieren el repositorio de código correspondiente (privado en el momento de la publicación) y los decodificadores originales de Ovi para renderizar salidas.

El paquete ocupa aproximadamente 140,17 GB e incluye tres estudiantes de unos 46,67 GB cada uno. Los estados del optimizador no están incluidos por defecto; solo la capa opcional de reanudación de sCM343 añade unos 93,29 GB de shards AdamW. La licencia es Apache 2.0 y los idiomas declarados son inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Destilación de un modelo base Ovi (generación texto-a-vídeo con audio); arquitectura exacta del backbone no disponible en la información proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en FP32 para el estudiante; forwards en BF16 durante el entrenamiento) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch DCP (`.distcp` + `.metadata`); no safetensors, no GGUF |

## Arquitectura y entrenamiento

El modelo es un estudiante destilado a cuatro pasos sobre el modelo Ovi, que genera vídeo y audio de forma conjunta condicionado por texto. La receta se ejecutó en ocho GPUs H20 con 20.000 muestras de entrenamiento emparejadas y auditadas, semilla 1234, AdamW con betas 0,9/0,999, weight decay 0,01, grad clip 1, forwards en BF16 con pesos del estudiante en FP32 y reducciones de gradiente en FP32, y offload del optimizador a CPU. Los pesos de pérdida son 0,85 para vídeo y 0,15 para audio.

La primera etapa es DCM (Distribution Matching Distillation), que parte del checkpoint no anclado del paso 50 y añade un ancla de profesor condicional de 0,25, con LR base 2e-6, warmup de 100 pasos, horizonte coseno de 2000 con suelo 0,1, rejilla trigonométrica de 48, skip 1, CFG del profesor 4/3 y escala de pérdida 100. La segunda etapa es un sCM corregido que arranca desde DCM500 con un AdamW nuevo, LR 2e-6, warmup de 500 pasos y warmup de 500 pasos para ambos términos tangentes, JVP no shardeado compatible con FSDP, media p_g de 1,5, clip p99 de tangente en 20 y escala de pérdida 100 (objetivo `rcm_tangent_warmup_v2_unsharded`). El autor señala que la versión anterior del objetivo omitía el warmup del término JVP; las ramas antiguas de sCM con LR alto mostraron colapso de latentes de audio entre prompts y no se incluyen en la release. La corrección está respaldada por tests de regresión, aunque no hay prueba controlada de que el bug fuese la única causa del colapso, ya que el LR también variaba.

## Capacidades

- Generación de vídeo condicionada por texto, con audio generado de forma conjunta en la misma pasada.
- Muestreo a cuatro pasos como estudiante destilado, frente a los 50 pasos de la receta del profesor.
- Soporte de prompts en inglés y chino.
- Evaluación diagnóstica emparejada con el profesor sobre ocho prompts fijos retenidos, con semilla 103 y ruido inicial coincidente.
- No se documentan tool calling, function calling, capacidades de agente, modo thinking, visión de entrada ni audio de entrada.
- No se documenta soporte de razonamiento multi-paso ni de matemáticas o código.

## Casos de uso

- Investigación en destilación de modelos de vídeo con audio: el paquete permite reproducir la comparación entre un estudiante de cuatro pasos y un profesor de 50 pasos sobre los mismos prompts y ruido inicial, usando las métricas de latentes y SSIM incluidas en `evaluations/`.
- Estudio de estabilidad del entrenamiento en destilación multimodal: los snapshots DCM500, sCM300 y sCM343 permiten analizar la evolución de la coherencia de latentes de audio y vídeo a lo largo de las etapas, incluyendo el fenómeno de colapso de audio entre prompts documentado por el autor.
- Reproducción de recetas DCM y sCM sobre un backbone de vídeo-audio: el manifiesto `release_manifest.json` fija el commit de código, los hashes SHA-256 y los tamaños exactos de los 108 ficheros permitidos, lo que facilita la verificación de artefactos en un entorno de investigación.
- Análisis de la brecha entre métricas latentes y calidad perceptual: las métricas publicadas (coseno de latentes de vídeo y audio, SSIM RGB) no establecen fidelidad de sonido ni sincronía audio-vídeo, por lo que el paquete sirve como base para diseñar evaluaciones perceptuales propias.
- Docencia y formación en técnicas de difusión destilada: la separación entre DCM y sCM, con objetivos e hiperparámetros documentados, permite usar los checkpoints como material de estudio de destilación por matching de distribuciones y por consistencia.
- Auditoría de releases experimentales: el autor documenta explícitamente el estado no validado del modelo, los commits de pesos y documentación, y la ausencia de estados de optimizador por defecto, lo que convierte la release en un caso de estudio de trazabilidad y gobernanza de artefactos.

## Benchmarks y rendimiento

Los datos disponibles son medias diagnósticas emparejadas sobre ocho prompts fijos retenidos (semilla 103, ruido inicial coincidente), comparando el estudiante a cuatro pasos con el profesor de la receta a 50 pasos. No son puntuaciones de benchmarks perceptuales ni a gran escala.

| Snapshot | Coseno latente de vídeo | Coseno latente de audio | SSIM RGB |
|---|---:|---:|---:|
| DCM500 / sCM0 | 0,60283 | 0,45035 | 0,41159 |
| sCM300 corregido | 0,62233 | 0,44530 | 0,36119 |

En sCM300, el coseno de audio entre prompts es 0,671 y la ratio de norma residual/audio centrada en la media es 0,521. El autor indica que el colapso de latentes de audio casi idénticas observado anteriormente no se ha reproducido hasta esta evaluación, pero la SSIM visual cayó y la calidad subjetiva de sonido y vídeo aún requiere inspección. El paso 343 no tiene benchmark en el mismo paso; no deben etiquetarse las métricas del paso 300 como mediciones del paso 343. Ni la fidelidad de sonido ni la sincronía audio-vídeo quedan establecidas por el coseno de latentes. La ablación combinada heredada de rCM 3:2 se detuvo en el paso 1663 y no se recomienda como release de pesos.

## Requisitos de hardware

- Entrenamiento: ocho GPUs H20 según la receta documentada, con forwards en BF16, pesos del estudiante en FP32 y offload del optimizador a CPU.
- Almacenamiento: unos 140,17 GB para los tres estudiantes; la capa opcional de reanudación de sCM343 añade unos 93,29 GB de shards AdamW.
- VRAM de inferencia: no disponible. El tamaño del repositorio (140 GB) corresponde a tres snapshots completos, no a un único modelo cargado en memoria, por lo que no permite derivar directamente un requisito de VRAM.
- GPU recomendadas: no disponible para inferencia; el autor solo documenta H20 para entrenamiento.
- Compatibilidad con GPU de consumo: no disponible. El formato DCP y la necesidad de los decodificadores originales de Ovi impiden un despliegue directo en herramientas como llama.cpp u Ollama.
- Opciones de despliegue: no es un pipeline de Diffusers listo para usar. Requiere el repositorio de código correspondiente (privado en el momento de la publicación), la configuración del modelo Ovi upstream y la inicialización del profesor. El script `compare_ovi_inference.py` carga DCP en un modelo FP32 ordinario con resharding en CPU y acepta `--preview-stage dcm` o `--preview-stage scm`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Pasos de muestreo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TurboT2VA-Ovi (este) | no disponible | no disponible | 4 (estudiante destilado) | Apache 2.0 | Pesos DCP en HF; código privado |
| chetwinlow1/Ovi (base) | no disponible | no disponible | 50 (receta del profesor) | no disponible en la información proporcionada | Modelo base referenciado |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, más allá del propio modelo base Ovi.

## Limitaciones y advertencias

- Release experimental: el autor la describe explícitamente como no validada como modelo rCM final, no oficial del upstream y no un pipeline de Diffusers listo para usar.
- El código de entrenamiento e inferencia está en un repositorio privado; sin acceso, el paquete no es un bundle de inferencia autocontenido.
- Los pesos están en formato DCP (`.distcp`); no deben cargarse shards individuales ni renombrarse como safetensors.
- No se incluyen decodificadores, profesor, vídeos del profesor, latentes de entrenamiento, embeddings de texto, CSV de entrenamiento ni tokens; se requiere el modelo Ovi original y entradas propias para renderizar salidas.
- Los estados del optimizador no están incluidos por defecto; la reanudación exacta requiere la capa opcional de sCM343 y coincidencia de entradas, runtime y ajustes.
- El paso 343 no tiene benchmark en el mismo paso; las métricas del paso 300 no deben atribuírsele.
- La SSIM visual cayó en sCM300 respecto a DCM500 y la calidad subjetiva de sonido y vídeo no está verificada.
- El coseno de latentes no establece fidelidad de sonido ni sincronía audio-vídeo.
- La estabilidad del entrenamiento más allá de los snapshots publicados es desconocida.
- El colapso de latentes de audio entre prompts observado en ramas antiguas de sCM con LR alto no se ha reproducido hasta sCM300, pero la causa exacta no está aislada.
- La ablación combinada heredada de rCM 3:2 se detuvo en el paso 1663 y no se recomienda como release de pesos.
- Sesgos conocidos: no documentados en la información proporcionada.
- Riesgo de alucinación: no documentado específicamente; aplicable el riesgo general de los modelos generativos de vídeo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el estado experimental y la dependencia del código privado limitan su uso en producción.
- El `meta.json` original incluye rutas absolutas de la máquina de origen y se conserva sin cambios.

## Enlaces

- Hugging Face: https://huggingface.co/luyu1021/turbot2va-ovi
- Repositorio de código (privado en el momento de la publicación): https://github.com/liuyuxiang1021/ovi-t2av-distillation
- Modelo base: https://huggingface.co/chetwinlow1/Ovi
- Documentación de experimentos rCM: `docs/RCM_EXPERIMENTS_2026-11-19.md` (en el repositorio de código)
- Guía de entrenamiento: `docs/TRAINING_GUIDE.md` (en el repositorio de código)
- Manifiesto de release: `release_manifest.json` (en el repositorio de Hugging Face)
