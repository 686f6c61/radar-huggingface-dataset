# Abol0pati/whisper-tiny-fa-sokhan

## Resumen

`whisper-tiny-fa-sokhan` es un ajuste fino mediante LoRA de `openai/whisper-tiny` sobre voz en persa (farsi), desarrollado por el usuario Abol0pati como parte del proyecto Sokhan. El modelo se distribuye convertido a CTranslate2 en cuantización `int8` para ser servido directamente con faster-whisper, el motor que emplea el ecosistema Sokhan. La arquitectura subyacente es el transformer encoder-decoder de Whisper en su variante tiny, con aproximadamente 39 millones de parámetros en el modelo base.

El problema que aborda es la transcripción automática de voz (ASR) en persa, un idioma con menor cobertura en los modelos Whisper originales. Sin embargo, el propio autor es explícito en la model card: el modelo **no supera al baseline sin ajustar**. Se trata del artefacto reproducible de la primera ejecución real de fine-tuning del proyecto, llevada a cabo en CPU (2 núcleos, sin GPU), y su valor es metodológico y de trazabilidad, no de rendimiento.

La relevancia actual es limitada desde el punto de vista de producción: el ajuste se entrenó con solo 518 clips (45 minutos de audio validado) durante 2 épocas, y los resultados medidos empeoran el WER del baseline en el fixture de evaluación. El modelo sirve como referencia documentada de un pipeline completo de fine-tuning LoRA + conversión a CTranslate2 sobre datos persas de Common Voice.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) con adaptadores LoRA |
| Parámetros totales | ~39 M en el modelo base (whisper-tiny); 294.912 parámetros entrenables en LoRA (0,78 %) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper) |
| Tipos de cuantización | int8 (CTranslate2) |
| Idiomas soportados | persa (fa) |
| Licencia | cc0-1.0 (repo); pesos base MIT; datos CC-0 1.0 |
| Formato de pesos | CTranslate2 (int8) |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-tiny`, un transformer encoder-decoder con atención completa diseñado para ASR y traducción de voz. Sobre él se aplicaron adaptadores LoRA de rango 16 en las proyecciones `q_proj` y `v_proj`, con 294.912 parámetros entrenables (0,78 % del total). El entrenamiento se ejecutó en fp32 sobre CPU con 2 núcleos, learning rate 1e-4, batch size 2 y 2 épocas, totalizando 508 pasos de optimizador.

Los datos de entrenamiento provienen exclusivamente del split de entrenamiento de `pymmdrza/Common-Voice-Speech-26.0-Persian-Clean` (cv-corpus-26.0, CC-0): 518 clips que suman 45,0 minutos de voz persa validada. El fixture de evaluación del proyecto Sokhan reside en el split de test y nunca se usó para entrenar. La pérdida de entrenamiento bajó de 3,84 a 1,55 y la de evaluación retenida de 1,646 a 1,545, pero el WER retenido (10 clips, normalización de producto) se mantuvo plano en 94,6 % en ambas épocas. Tras el entrenamiento, los pesos se convirtieron a CTranslate2 en int8 para su uso con faster-whisper.

## Capacidades

- Transcripción de voz a texto en persa (ASR), con indicación de idioma `fa`.
- Detección de segmentos y marcas temporales propias de Whisper (segmentos e info devueltos por faster-whisper).
- Decodificación con beam search (se documenta `beam_size=5`).
- Ejecución en CPU mediante CTranslate2 int8, sin requerir GPU.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio más allá de la transcripción.
- Capacidad multilingüe: únicamente persa (el modelo base es multilingüe, pero este ajuste está orientado a `fa`).

## Casos de uso

- Reproducción de experimentos de fine-tuning LoRA: el modelo y los scripts del repositorio Sokhan permiten replicar el pipeline completo (entrenamiento, evaluación y conversión a CTranslate2) en CPU, útil para docencia o validación de metodología.
- Transcripción de voz persa en entornos sin GPU: al ejecutarse en int8 sobre CPU con faster-whisper, puede desplegarse en portátiles o servidores modestos para pruebas de concepto.
- Prototipado de pipelines ASR en persa: sirve como punto de partida para integrar transcripción en aplicaciones antes de sustituir el modelo por uno de mayor calidad.
- Evaluación comparativa de baselines: permite medir el efecto de un ajuste LoRA a pequeña escala frente a `whisper-tiny` original en un fixture persa concreto.
- Generación de subtítulos aproximados en persa para material interno de baja criticidad, aceptando una tasa de error muy elevada.
- Referencia para la comunidad: documenta de forma honesta que a escala CPU (whisper-tiny, 45 minutos de datos, 2 épocas) LoRA no mejora el WER en persa, lo que orienta a otros desarrolladores hacia `whisper-small` o superior con más datos y GPU.

## Benchmarks y rendimiento

Resultados medidos el 2026-11-15 en CPU int8, `beam_size=5`, indicación de idioma `fa`, sobre un fixture de 12 clips de Common Voice (fa) del repositorio Sokhan (`benchmarks/benchmark_wer.py --models Abol0pati/whisper-tiny-fa-sokhan`):

| Modelo | WER | CER |
|---|---|---|
| whisper-tiny (baseline) | 93,9 % | 47,4 % |
| whisper-tiny-fa-sokhan (este modelo) | 103,7 % | 47,4 % |

El ajuste empeoró el WER del fixture (más inserciones en clips fuera de distribución) sin modificar el WER retenido. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no aplican al tratarse de un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño de whisper-tiny (~39 M de parámetros) y la cuantización int8, la huella es mínima, del orden de decenas de MB.
- GPU recomendadas: no se documentan; el modelo se entrenó y evaluó en CPU (2 núcleos).
- Cabe en cualquier GPU consumer e incluso en CPU sin GPU dedicada.
- Opciones de despliegue: faster-whisper (motor documentado, con CTranslate2 int8). No se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / audio | WER (fixture fa) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-tiny (baseline) | ~39 M | ventana de 30 s | 93,9 % | MIT | Hugging Face (openai/whisper-tiny) |
| whisper-tiny-fa-sokhan | ~39 M (+ LoRA) | ventana de 30 s | 103,7 % | cc0-1.0 (repo) | Hugging Face (Abol0pati) |
| whisper-small (referencia del autor) | no disponible en la información | ventana de 30 s | no disponible | MIT | Hugging Face (openai/whisper-small) |

El autor señala que las mejoras significativas requieren la ruta documentada con GPU gratuita: `whisper-small` o superior, entrenado con horas de datos en Google Colab o Kaggle. No se dispone de más alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo no supera al baseline: el WER del fixture empeora de 93,9 % a 103,7 % y el WER retenido se mantiene plano en 94,6 %. No debe usarse en producción esperando calidad superior a whisper-tiny.
- Entrenado con solo 45 minutos de audio (518 clips) y 2 épocas en CPU; la escala es insuficiente para un ajuste efectivo en persa.
- Riesgo elevado de alucinación e inserciones en clips fuera de distribución, como evidencian las métricas.
- Soporte limitado a persa; el modelo base es multilingüe pero el ajuste está orientado a `fa`.
- Sesgos: no se documentan sesgos específicos más allá de los inherentes a Common Voice (posible sesgo demográfico y de dominio del corpus).
- Licencia: el repositorio se declara cc0-1.0, los pesos base son MIT y los datos CC-0 1.0; conviene verificar la coherencia de esta combinación antes de un uso comercial.
- El repositorio tiene tamaño 0.0 GB y 0 descargas, lo que puede indicar que los pesos no están efectivamente subidos o que el artefacto está incompleto; verificar antes de integrarlo.
- No dispone de tool calling, agentes ni capacidades multimodales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Abol0pati/whisper-tiny-fa-sokhan
- Repositorio Sokhan: https://github.com/Abolfazlrwm/sokhan
- Guía de GPU gratuita (Colab/Kaggle): https://github.com/Abolfazlrwm/sokhan/blob/main/docs/free-gpu.md
- Notebook de fine-tuning en persa: `training/finetune_fa_colab.ipynb` (dentro del repositorio Sokhan)
- Dataset de entrenamiento: https://huggingface.co/datasets/pymmdrza/Common-Voice-Speech-26.0-Persian-Clean
- Modelo base: https://huggingface.co/openai/whisper-tiny
- faster-whisper: https://github.com/SYSTRAN/faster-whisper
