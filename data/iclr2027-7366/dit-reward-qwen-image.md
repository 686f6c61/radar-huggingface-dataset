# iclr2027-7366/DiT-Reward-Qwen-Image

## Resumen

DiT-Reward-Qwen-Image es un modelo de recompensa (reward model) para puntuar pares imagen-texto, desarrollado por el autor anonimo `iclr2027-7366` como envio para la revision ICLR 2027 (Submission 7366). No es un pipeline de generacion de imagenes: recibe una imagen y un prompt textual y devuelve una puntuacion escalar que estima la preferencia predicha por el modelo. Se construye sobre el backbone `Qwen/Qwen-Image`, un transformer de difusion (DiT) con VAE y codificador de texto Qwen, al que se anade una cabeza MLP de recompensa.

El checkpoint liberado contiene 28.868.951.348 parametros en safetensors (57,7 GB de repositorio) e incluye todos los tensores necesarios: transformer, VAE, codificador de texto Qwen, normalizacion y cabeza de recompensa, de modo que no requiere descargar los pesos originales de Qwen. La licencia es Apache-2.0 para los pesos derivados de Qwen y MIT para el codigo Python.

Su relevancia es metodologica: se publica como material de reproduccion para evaluar modelos de recompensa basados en DiT, con procedencia de checkpoint documentada (interpolacion lineal de tres checkpoints en fp32) y verificación de hashes SHA-256. No se reclama ningun resultado de benchmark nuevo con esta liberacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) sobre backbone Qwen-Image, con VAE, codificador de texto Qwen y cabeza MLP de recompensa |
| Parametros totales | 28.868.951.348 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | Apache-2.0 (pesos); MIT (codigo Python) |
| Formato de pesos | safetensors (shards sin recodificacion de tensores) |

## Arquitectura y entrenamiento

El modelo reutiliza el backbone `Qwen/Qwen-Image`, un transformer de difusion con VAE y codificador de texto Qwen. Sobre el se extraen caracteristicas de los bloques zero-indexados `[29, 39, 49, 59]`, se agrupan (pooling) y se concatenan para alimentar una cabeza de recompensa MLP con la topologia 1536 → 384 → 1, activacion GELU y dropout en tiempo de entrenamiento. El objetivo es asignar una puntuacion escalar a un par imagen-prompt.

El checkpoint se obtuvo por interpolacion lineal de parametros en fp32 de tres checkpoints fuente en los pasos `[13400, 14000, 13800]` con pesos `[0.5, 0.4, 0.1]`. Se emplea un coeficiente de ruido de flow-matching de 0.005, que los modelos liberados mantienen en inferencia (no son los checkpoints de ablacion de ruido). El procesamiento de imagen es resize bicubico del lado corto a 512, recorte central a 512×512, RGB y normalizacion a [-1, 1]. Se exige condicionamiento textual real: no se permite fallback silencioso solo-vision. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF/DPO.

## Capacidades

- Puntuacion imagen-texto: asigna un reward escalar a un par (imagen, prompt) que estima la preferencia predicha dentro del propio modelo.
- Evaluacion de alineacion prompt-imagen: util para filtrar o rankear pares generados.
- Procesamiento por lotes: la CLI acepta `--input-jsonl` con un registro `{"image":..., "prompt":...}` por linea y `--batch-size`.
- Verificacion de integridad: opcion `--verify-hashes` que comprueba cada shard contra el manifiesto SHA-256.
- Validacion de checkpoint: rechaza checkpoints incompletos o con formas inconsistentes y pesos o puntuaciones no finitos.
- Uso programatico via clase `DiTReward` con metodo `score(images, prompts, batch_size)`.
- No soporta generacion de imagenes, tool calling, agentes ni otras capacidades generativas; es exclusivamente un reward model.
- Multilingue: limitado a ingles (`en`).

## Casos de uso

- Filtrado de datasets de entrenamiento: puntuar pares imagen-texto de un corpus para descartar ejemplos de baja calidad antes de entrenar generadores o adaptadores, usando lotes via JSONL.
- Ranking de salidas de generacion: dado un prompt y varias imagenes candidatas, ordenarlas por la puntuacion del modelo para seleccionar la mejor en pipelines de muestreo multiple.
- Evaluacion de consistencia prompt-imagen: medir la adherencia semantica de un generador a las instrucciones del usuario en pruebas de regresion.
- Investigacion en reward models: reproducir el forward de recompensa con semillas fijas y registrar batch size, orden de evaluacion y versiones de dependencias para comparar configuraciones.
- Auditoria de checkpoints: verificar procedencia e integridad de pesos mediante `checkpoint_provenance.json` y `--verify-hashes` en entornos de investigacion.
- Seleccion en RLHF o fine-tuning de difusion: usar la puntuacion como senal de preferencia para filtrar o ponderar muestras en etapas de ajuste.
- Control de calidad en pipelines de datos: detectar pares con baja coherencia en catalogos o conjuntos de imagenes etiquetadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la liberacion del checkpoint no reclama ningun resultado de benchmark nuevo y que `verification.json` recoge solo el runtime probado y una verificacion de inferencia pequena, no una reevaluacion completa de benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el autor indica que depende del backbone y de la longitud de los prompts, y recomienda empezar con batch size 1.
- El repositorio completo ocupa 57,7 GB en safetensors, lo que condiciona el almacenamiento y la memoria necesaria para materializar todos los tensores (transformer, VAE, codificador de texto, normalizacion y cabeza).
- GPU recomendadas: no disponible en la informacion proporcionada.
- Viabilidad en GPU de consumo: no disponible; no se confirma que quepa en GPUs consumer.
- Opciones de despliegue: inferencia via PyTorch con Python 3.10+ y CUDA, usando `inference.py` o la clase `DiTReward`; se instala `requirements-inference.txt`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor advierte que las tiradas independientes no tienen por que ser identicas bit a bit por el muestreo estocastico de latentes/ruido y los kernels de GPU.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (reward models imagen-texto basados en DiT) ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Las puntuaciones solo son comparables dentro de este modelo; no estan calibradas contra las de otros reward models.
- Requiere condicionamiento textual real; no admite fallback solo-vision.
- Idioma limitado a ingles.
- No es un generador de imagenes; usarlo como pipeline de generacion es un error de uso.
- Riesgo de alucinacion o sesgo: no documentado en la informacion disponible; al ser un reward model, sus puntuaciones pueden reflejar sesgos del backbone y de los datos de entrenamiento no publicados.
- Resultados no deterministas bit a bit: deben fijarse semilla, batch size, orden de evaluacion, dispositivo y versiones de dependencias para reproducibilidad.
- Licencia: pesos derivados de Qwen bajo Apache-2.0 (ver `LICENSE` y `NOTICE`); el codigo Python tiene licencia MIT separada en `LICENSE-code`. Verificar obligaciones de atribucion antes de uso comercial.
- El checkpoint es una interpolacion de tres pasos de entrenamiento; no es un checkpoint de ablacion de ruido.
- Modelo anonimo de envio a revision: sin garantias de soporte, mantenimiento ni validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/iclr2027-7366/DiT-Reward-Qwen-Image
- Modelo base: https://huggingface.co/Qwen/Qwen-Image
