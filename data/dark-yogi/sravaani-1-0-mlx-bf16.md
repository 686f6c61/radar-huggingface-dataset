# dark-yogi/SraVaani-1.0-mlx-bf16

## Resumen

SraVaani-1.0-mlx-bf16 es una conversión no oficial al framework MLX del modelo de reconocimiento automático de voz ARTPARK-IISc/SraVaani-1.0, publicada por el usuario dark-yogi. Se trata de un port nativo para Apple Silicon que preserva los pesos en bfloat16 sin reentrenamiento: la conversión es un remapeo determinista de pesos, no un ajuste fino. El modelo resuelve transcripción de voz (ASR) con foco en hindi y otras lenguas indias, y su interés práctico radica en que permite ejecutar un sistema ASR multilingüe de tamaño medio en portátiles Mac con chip de la serie M, sin dependencia de CUDA ni de PyTorch en inferencia.

La arquitectura del modelo base es un híbrido FastConformer más decodificador TDT/CTC (transducer), con 443.657.230 parámetros totales (aproximadamente 443,7 millones) y un encoder de 17 capas con dimensión de modelo 1024. El tokenizador es un SentencePiece BPE de 5001 tokens más el token blank. El repositorio pesa 0,9 GB y el archivo `model.safetensors` ocupa 846 MB en bf16.

El modelo base declara cobertura de 65 lenguas indias; las etiquetas de esta conversión enumeran hindi (hi), bengalí (bn) y tamil (ta) como idiomas explícitos, además de la etiqueta genérica multilingual. La licencia es MIT, heredada del modelo original, lo que facilita su uso comercial. La validación publicada por el autor reporta una paridad prácticamente exacta con la versión CUDA original sobre 418 archivos de Fleurs en hindi: WER normalizado de 7,47 % frente a 7,46 %, con 404 de 418 transcripciones idénticas carácter a carácter y una velocidad aproximada de 30 veces tiempo real en un M5 Max.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer híbrido (encoder) con decodificador TDT/CTC (transducer); 17 capas, dimensión de modelo 1024 |
| Parametros totales | 443.657.230 (aproximadamente 443,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de audio; no se especifica la ventana máxima de audio por segmento) |
| Tipos de cuantizacion | bf16 en este repositorio; existe un repositorio hermano con pesos de 8 bits (`dark-yogi/SraVaani-1.0-mlx-8bit`); no se documentan variantes GGUF ni 4 bits |
| Idiomas soportados | hi, bn, ta y etiqueta multilingual; el modelo base declara 65 lenguas indias |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | safetensors (bf16, 846 MB), `tokenizer.model` (SentencePiece BPE, 5001 tokens + blank) y `frontend.npz` (banco de filtros mel, ventana y parámetros del frontend) |

## Arquitectura y entrenamiento

El modelo base SraVaani-1.0, desarrollado por ARTPARK-IISc, emplea un encoder FastConformer con decodificador híbrido TDT-CTC, una variante de arquitectura transducer (RNN-T con decodificación por token y transición, TDT) que combina la salida CTC con la predicción conjunta del transducer. Esta conversión concreta no introduce cambios arquitectónicos: mantiene 17 capas de encoder con dimensión 1024 y un decodificador TDT, y sustituye el grafo de PyTorch por una implementación equivalente en MLX. El frontend de características (filtros mel, ventana y parámetros) se ha extraído a un archivo `frontend.npz` para eliminar la dependencia de `torch` en inferencia.

No se dispone en la información proporcionada de detalles sobre el número de tokens de audio usados en el preentrenamiento, la composición exacta del dataset (horas por idioma, fuentes, proporción de datos sintéticos o aumentados) ni sobre si se aplicaron etapas de ajuste con RLHF, DPO o técnicas equivalentes. La model card del port únicamente documenta el procedimiento de conversión, la validación de paridad y el remapeo determinista de pesos desde `ARTPARK-IISc/SraVaani-1.0`.

## Capacidades

- Reconocimiento automático de voz (ASR) en hindi, bengalí y tamil, con etiqueta multilingüe para el resto de lenguas indias cubiertas por el modelo base.
- Decodificación greedy sobre la salida del encoder TDT, con tokens blank filtrados antes de decodificar con SentencePiece.
- Inferencia sin PyTorch: el frontend mel se ejecuta desde `frontend.npz` con NumPy y MLX.
- Ejecución nativa en Apple Silicon mediante MLX, con pesos en bfloat16.
- Procesamiento de audio de entrada a 16 kHz mono (requisito explícito del script de ejemplo).
- Script de línea de comandos incluido (`transcribe.py`) para transcripción de archivos WAV.
- No se documentan en la información disponible: marcas de tiempo por palabra, puntuación y capitalización automáticas, detección de idioma, diarización de hablantes, traducción, tool calling, capacidades de agente ni modo de razonamiento (thinking).

## Casos de uso

- Transcripción local en portátiles Mac: al ejecutarse sobre MLX, permite dictado y transcripción de reuniones sin conexión ni GPU dedicada, con un consumo de memoria en torno a 1 GB en bf16.
- Subtitulado de contenido en hindi, bengalí y tamil: el modelo genera transcripciones que pueden alimentar un pipeline de subtítulos para vídeo o pódcast, con la ventaja de no requerir servicios en la nube ni transferir audio sensible a terceros.
- Procesamiento por lotes de archivos de audio en servidores Mac: el rendimiento medido de aproximadamente 30 veces tiempo real en un M5 Max implica que una hora de audio se transcribe en unos dos minutos, lo que hace viable reprocesar archivos completos de forma masiva.
- Atención al cliente en lenguas indias: transcripción de llamadas o notas de voz para su indexación y análisis posterior en sistemas de analítica de contact center, con la advertencia de que el modelo solo transcribe y no interpreta ni clasifica.
- Accesibilidad y documentación clínica o administrativa: dictado de informes en hindi o tamil en entornos con requisitos de privacidad, donde el procesamiento íntegramente local evita el envío de datos a APIs externas.
- Integración en aplicaciones macOS y iOS mediante MLX: al ser un port nativo con pesos safetensors y código Python de carga, se puede empaquetar dentro de herramientas de escritorio para transcripción en tiempo real o semirreal.
- Evaluación comparativa de pipelines ASR: la validación de paridad publicada (WER de 7,47 % frente a 7,46 % del original CUDA en Fleurs hindi) permite usarlo como referencia para comparar frameworks de inferencia sin introducir sesgo de conversión apreciable.
- Investigación en ASR para lenguas de bajos recursos: sirve como punto de partida para experimentos de ajuste fino o destilación en hindi, bengalí y tamil, dado que la licencia MIT permite modificar y redistribuir los pesos.

## Benchmarks y rendimiento

La información disponible solo incluye la validación de paridad frente a la versión CUDA original, no resultados comparativos estándar. Los datos publicados son los siguientes:

| Metrica | Valor |
|---|---|
| Conjunto de evaluacion | Fleurs hindi, 418 archivos |
| WER normalizado (version MLX bf16) | 7,47 % |
| WER normalizado (original CUDA) | 7,46 % |
| Diferencia absoluta de WER (paridad) | 0,0001 |
| Paridad de WER (metrica reportada por el autor) | 0,0019 |
| Transcripciones identicas caracter a caracter | 404 de 418 |
| Throughput | aproximadamente 30 veces tiempo real en M5 Max |

No se han publicado resultados de benchmarks adicionales (por ejemplo MMLU, HumanEval o GSM8K, no aplicables a un modelo ASR) ni cifras de WER para bengalí, tamil u otras lenguas indias en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: en torno a 0,9 GB solo para los pesos en bf16 (846 MB de `model.safetensors`) más el overhead de activaciones y del frontend mel; un presupuesto práctico de 1,5 a 2 GB de memoria unificada es suficiente.
- GPU compatibles: el port está pensado para Apple Silicon (series M). No hay soporte documentado para CUDA en esta conversión; la versión original del modelo base se ejecuta sobre CUDA con NeMo/PyTorch.
- GPU de consumo: cabe holgadamente en cualquier Mac con chip de la serie M con 8 GB o más de memoria unificada; en el ecosistema NVIDIA, el modelo base de 443 M de parámetros cabría en GPUs con 4 GB o más de VRAM, aunque esta conversión concreta no está validada para ese entorno.
- Opciones de despliegue: MLX con la librería `mlx-audio` (`pip install "mlx>=0.20" mlx-audio sentencepiece soundfile numpy`), más el cargador `sravaani_mlx.py`, el frontend `frontend_mlx.py` y el CLI `transcribe.py` incluidos en el repositorio. No se documenta compatibilidad con vLLM, TGI, llama.cpp, Ollama ni ONNX Runtime en esta conversión.
- Latencia y throughput: aproximadamente 30 veces tiempo real en un M5 Max, según la validación del autor. No se proporcionan cifras de latencia por segmento ni de throughput para otros chips.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato y despliegue | Notas |
|---|---|---|---|---|---|
| SraVaani-1.0-mlx-bf16 (esta ficha) | 443,7 M | hi, bn, ta; 65 lenguas indias en el modelo base | MIT | safetensors bf16, MLX en Apple Silicon | Conversion comunitaria con paridad de WER verificada frente al original CUDA |
| ARTPARK-IISc/SraVaani-1.0 (modelo base) | no disponible (descripcion del port: aproximadamente 430 M) | 65 lenguas indias | MIT | pesos originales para PyTorch/NeMo | Referencia oficial; esta conversion deriva de el |
| dark-yogi/SraVaani-1.0-mlx-8bit | no disponible (mismo modelo base) | hi, bn, ta; 65 lenguas indias en el modelo base | MIT | safetensors 8 bits, MLX | Repositorio hermano con cuantizacion de 8 bits |
| Whisper large-v3 (OpenAI) | aproximadamente 1550 M (dato publico, no incluido en la informacion proporcionada) | multilingue generalista | MIT (dato publico) | safetensors, PyTorch, ONNX, whisper.cpp | Alternativa generalista, no especializada en lenguas indias; datos a verificar |

Los datos de terceros incluidos en esta tabla provienen de especificaciones públicas generales y deben verificarse antes de usarse en una decisión de producción; la información proporcionada sobre este modelo no incluye comparativas oficiales con alternativas.

## Limitaciones y advertencias

- Conversión comunitaria no oficial: el repositorio no está mantenido por ARTPARK-IISc y no cuenta con soporte del autor original; ante discrepancias, la referencia válida es el modelo base.
- Origen y sesgos: no se documenta la composición del dataset de entrenamiento del modelo base, por lo que no es posible evaluar sesgos de dominio, acento, género o registro; la cobertura declarada de 65 lenguas no está respaldada en esta ficha por cifras de WER por idioma.
- Riesgo de alucinación: como todo sistema ASR basado en transducer, puede generar texto plausible en segmentos con ruido, música o habla solapada. No se han publicado tasas de error específicas para audio degradado.
- Cobertura de idiomas: aunque el modelo base declara 65 lenguas indias, las etiquetas de este port solo enumeran hindi, bengalí y tamil; no hay evidencia publicada aquí del rendimiento en el resto.
- Dependencia de formato de entrada: el ejemplo exige audio WAV mono a 16 kHz; no se documenta resampling interno ni soporte de otros contenedores.
- Diferencias residuales de precisión: las 14 transcripciones no idénticas de las 418 evaluadas corresponden, según el autor, a variantes ortográficas de diacríticos en préstamos lingüísticos con diferencias inferiores a 0,01 en logits; en dominios muy sensibles a la ortografía esto puede ser relevante.
- Funcionalidades ausentes: no se documentan marcas de tiempo, puntuación, capitalización, detección de idioma ni diarización, lo que limita su uso directo en pipelines que requieran segmentación temporal.
- Licencia: MIT, heredada del modelo base, permite uso comercial y modificación; conviene conservar la atribución y la cita del artículo original.
- Adopción: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe una comunidad amplia que haya validado su comportamiento en producción.

## Enlaces

- Repositorio HuggingFace de esta conversión: https://huggingface.co/dark-yogi/SraVaani-1.0-mlx-bf16
- Modelo base: https://huggingface.co/ARTPARK-IISc/SraVaani-1.0
- Repositorio hermano con pesos de 8 bits: https://huggingface.co/dark-yogi/SraVaani-1.0-mlx-8bit
- Artículo: SraVaani 1.0: Scaling Inclusive Speech Recognition for Indic Languages, arXiv 2608.08235: https://arxiv.org/abs/2608.08235
- Los resultados de la búsqueda web realizada no contienen enlaces relevantes al modelo (devuelven contenido sobre una serie de televisión homónima), por lo que no se añaden más referencias externas.
