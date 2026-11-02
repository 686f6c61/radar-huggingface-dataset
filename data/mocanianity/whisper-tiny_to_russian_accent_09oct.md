# Mocanianity/whisper-tiny_to_russian_accent_09oct

## Resumen

Whisper tiny russian accent es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, un sistema de reconocimiento automático del habla (ASR) de tipo encoder-decoder basado en transformer. Lo publica el usuario Mocanianity en Hugging Face y parte de la arquitectura y los pesos preentrenados de OpenAI, con 37,7 millones de parámetros totales y un repositorio de 0,3 GB en formato safetensors. El modelo se ha entrenado sobre el dataset British_english y declara un WER de 9,97 en su conjunto de evaluación.

El interés de esta ficha es doble. Por un lado, documenta un experimento de ajuste fino sobre un modelo ASR muy pequeño, útil como referencia para quien quiera adaptar whisper-tiny a un acento o dominio concreto con recursos mínimos. Por otro, evidencia varias inconsistencias entre el nombre del modelo, el idioma declarado y los datos de entrenamiento que conviene tener presentes antes de reutilizarlo en producción.

La información publicada es escasa: la model card está generada automáticamente por el Trainer y contiene secciones sin completar ("More information needed"). No hay detalles sobre la composición exacta del dataset, el preprocesado de audio ni la motivación del ajuste. Todo lo que se indica a continuación proviene de los metadatos del repositorio, de la model card y del model-index del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper, openai/whisper-tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s en Whisper; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | en (declarado en los metadatos); el nombre del modelo menciona "russian accent" y "Spanish" sin respaldo en la configuracion |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper de OpenAI en su variante tiny: un encoder y un decoder transformer con atención multi-cabeza, pensado para transcripción de audio de hasta 30 segundos por segmento. El ajuste fino se realizó con la librería Transformers (versión 5.23.0.dev0), PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3. Los hiperparámetros declarados son learning rate de 1e-05, batch de entrenamiento de 2, batch de evaluación de 1, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 500 pasos de warmup y un total de 2000 pasos de entrenamiento.

El conjunto de entrenamiento es el dataset British_english, del que no se especifican tamaño, horas de audio ni método de partición. La evolución registrada muestra una pérdida de validación de 0,2405 y un WER de 10,60 en el paso 1000 (época 1,07), que baja a 0,2262 y 9,97 en el paso 2000 (época 2,14). No se documenta el uso de RLHF, DPO ni ninguna técnica de alineación; tampoco se mencionan innovaciones como decodificación especulativa o atención lineal. El entrenamiento parece un ajuste supervisado convencional sobre un único dataset.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) en inglés, según el idioma declarado en los metadatos.
- Transcripción de segmentos de audio cortos, coherente con la arquitectura Whisper tiny.
- Ajuste orientado, según el nombre del repositorio, a acentos rusos o a habla con acento, aunque la model card no lo confirma ni lo detalla.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del inglés declarado.
- No se documentan modos especiales (thinking mode, visión, audio de entrada más allá de la propia tarea ASR).

## Casos de uso

- Transcripción de audio en inglés con acento marcado: el ajuste sobre British_english y la mención a acento ruso en el nombre sugieren un uso para mejorar la robustez frente a habla no nativa, aunque la evidencia publicada es limitada y conviene validarlo con muestras propias.
- Prototipado rápido de ASR en local: con 37,7 millones de parámetros y 0,3 GB de pesos, el modelo se puede cargar en cualquier equipo con Transformers para experimentar con pipelines de transcripción sin infraestructura dedicada.
- Evaluación comparativa de ajustes finos: sirve como referencia de bajo coste para medir cómo cambia el WER al adaptar whisper-tiny a un dominio concreto con pocos pasos de entrenamiento (2000 en este caso).
- Base para nuevos ajustes: al estar bajo licencia apache-2.0 y en safetensors, se puede partir de estos pesos para adaptar el modelo a otros acentos o datasets sin restricciones de uso comercial.
- Docencia y experimentación académica: un modelo de este tamaño permite reproducir el flujo completo de fine-tuning de ASR en un portátil o en una GPU consumer, con hiperparámetros documentados.
- Filtrado o indexación de audio en inglés: para tareas donde la transcripción exacta no es crítica (búsqueda por palabras clave, etiquetado aproximado), el WER declarado de ~10 puede ser suficiente como primera pasada.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados):

| Benchmark | Dataset | Metrica | Valor |
|---|---|---|---|
| Automatic Speech Recognition | British English (split test) | WER | 9,9669 |
| Validacion (paso 1000, epoca 1,07) | British English | WER | 10,6026 |
| Validacion (paso 2000, epoca 2,14) | British English | WER | 9,9669 |
| Validacion (paso 2000) | British English | Loss | 0,2262 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar de ASR (LibriSpeech, Common Voice) que permitan comparar con el whisper-tiny original.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (37,7 millones de parámetros, ~150 MB de pesos) y en torno a 0,1-0,2 GB en fp16; el repositorio ocupa 0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; A100, H100 o RTX 4090 quedan sobredimensionadas para este modelo.
- Cabe en GPU consumer: sí, en prácticamente cualquier tarjeta moderna (GTX 1050 en adelante) e incluso en CPU para audios cortos.
- Opciones de despliegue: Transformers (pipeline de automatic-speech-recognition), Hugging Face Inference Endpoints (el tag endpoints_compatible está presente) y TGI. No se documentan variantes GGUF ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | WER declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-tiny_to_russian_accent_09oct | 37,7 M | no disponible (Whisper: 30 s) | 9,97 (British English) | apache-2.0 | Hugging Face |
| openai/whisper-tiny | 37,7 M | 30 s por segmento | no disponible en esta informacion | apache-2.0 | Hugging Face |
| openai/whisper-base | ~74 M | 30 s por segmento | no disponible en esta informacion | apache-2.0 | Hugging Face |
| openai/whisper-small | ~244 M | 30 s por segmento | no disponible en esta informacion | apache-2.0 | Hugging Face |

La comparación con whisper-tiny original es la más directa: mismo tamaño y licencia, pero el WER de 9,97 corresponde a un dataset concreto (British_english) y no es comparable con los resultados de LibriSpeech que suele publicar OpenAI. No se dispone de datos para comparar con alternativas de otros autores.

## Limitaciones y advertencias

- Inconsistencia entre nombre, idioma y datos: el repositorio se llama "russian accent" y la model card "Whisper tiny Spanish", pero el idioma declarado es inglés y el dataset es British_english. Esto genera ambigüedad sobre qué acento o idioma mejora realmente el ajuste.
- Model card incompleta: las secciones de descripción, usos previstos, limitaciones y datos de entrenamiento están sin rellenar ("More information needed").
- Riesgo de alucinación: como todo modelo Whisper, puede generar texto plausible en segmentos con ruido, silencio o habla no inteligible.
- Sesgos: al entrenarse sobre un dataset británico no documentado, puede rendir peor con otros acentos, registros o condiciones acústicas.
- Limitaciones de contexto: la arquitectura Whisper procesa segmentos de hasta 30 segundos; audios más largos requieren troceado y posible pérdida de coherencia entre segmentos.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero conviene verificar la licencia y procedencia del dataset British_english antes de explotar el modelo en producción.
- Caveat para producción: el WER de 9,97 no está verificado (verified: false) y no hay resultados en benchmarks estándar; el modelo no debería desplegarse sin una evaluación propia sobre el dominio objetivo.
- Sin soporte documentado de cuantización ni de formatos alternativos a safetensors, lo que limita su despliegue en entornos que dependan de GGUF.

## Enlaces

- Hugging Face: https://huggingface.co/Mocanianity/whisper-tiny_to_russian_accent_09oct
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio de referencia de Whisper (OpenAI): https://github.com/openai/whisper
