# RobotsMali/soloni-114m-tdt-ctc-v0

## Resumen

Soloni TDT-CTC 114M es un modelo de reconocimiento automático del habla (ASR) desarrollado por RobotsMali, una iniciativa que busca impulsar tecnologías del lenguaje para lenguas africanas de bajos recursos. Se trata de un ajuste fino del modelo `nvidia/parakeet-tdt_ctc-110m` especializado en la transcripción de audio en bambara (bm), una lengua mandé hablada principalmente en Malí. El modelo aborda el problema de la falta de sistemas ASR funcionales para lenguas africanas, un área tradicionalmente desatendida por la industria tecnológica.

El modelo emplea una arquitectura híbrida FastConformer-TDT-CTC con aproximadamente 114 millones de parámetros. Fue entrenado durante 16.296 pasos sobre el dataset `RobotsMali/bam-asr-early`, que contiene 37 horas de habla transcrita en bambara, derivado en un 87 % del dataset Jeli-ASR. A diferencia de su modelo base, no genera puntuación ni capitalización, ya que estas no estaban presentes en los datos de entrenamiento. El modelo se distribuye bajo licencia CC-BY-4.0 y está pensado principalmente para fines de investigación, con mejoras previstas en versiones futuras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-TDT-CTC (híbrida) |
| Parametros totales | 114 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Bambara (bm) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | NeMo (.nemo) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura híbrida FastConformer-TDT-CTC. FastConformer es una versión optimizada del modelo Conformer que incorpora submuestreo convolucional depthwise-separable con factor 8x, lo que reduce el coste computacional respecto al Conformer original. La arquitectura cuenta con dos decodificadores independientes pero entrenados conjuntamente: un decodificador TDT (Token-and-Duration Transducer) autorregresivo y un decodificador convolucional que utiliza la pérdida CTC (Connectionist Temporal Classification). Esta doble vía permite elegir la estrategia de decodificación en inferencia según las necesidades de latencia o precisión.

El entrenamiento se realizó con el toolkit NVIDIA NeMo, partiendo de los pesos de `nvidia/parakeet-tdt_ctc-110m`. El tokenizador se entrenó sobre las transcripciones del conjunto de entrenamiento de `RobotsMali/bam-asr-early` utilizando el script `process_asr_text_tokenizer.py` de NeMo. El dataset de entrenamiento contiene 37 horas de audio transcrito en bambara, procedente mayoritariamente de Jeli-ASR (~87 %). No se menciona el uso de técnicas de alineación adicionales como RLHF o DPO, dado que se trata de un modelo de ASR supervisado de forma clásica.

## Capacidades

- Transcripción de voz en bambara a texto, con soporte para audio mono de 16 kHz (el preprocesador integrado permite audios con frecuencias de muestreo superiores).
- Doble estrategia de decodificación: TDT (por defecto) y CTC, seleccionables en inferencia.
- Inferencia con CUDA Graphs para el decodificador TDT, con opción de desactivación para compatibilidad con GPUs o versiones de CUDA que no lo soporten.
- Preprocesador integrado que realiza remuestreo automático de audio.
- Integración nativa con NVIDIA NeMo mediante `EncDecHybridRNNTCTCBPEModel`.
- No genera puntuación ni capitalización, a diferencia de su modelo base.
- Capacidades multilingües: no, está especializado únicamente en bambara.

## Casos de uso

- Transcripción de contenido audiovisual en bambara: el modelo puede transcribir entrevistas, programas de radio o vídeos en bambara para generar subtítulos o actas textuales, gracias a su capacidad de procesar audio de 16 kHz y su preprocesador integrado.
- Documentación de lenguas en peligro: investigadores lingüísticos pueden utilizarlo para transcribir grabaciones de campo en bambara, acelerando la creación de corpus anotados para estudios sociolingüísticos o lexicográficos.
- Acceso a la información en salud pública: organizaciones sanitarias pueden transcribir mensajes de voz de pacientes o campañas educativas en bambara para analizar contenido y mejorar la comunicación en zonas rurales de Malí.
- Servicios de atención al cliente por voz: empresas locales pueden integrar el modelo en sistemas de IVR (respuesta de voz interactiva) para registrar y transcribir consultas de clientes que hablan bambara, aunque requiere adaptación adicional para entornos ruidosos.
- Creación de subtítulos para contenido educativo: instituciones educativas pueden generar transcripciones de lecciones o materiales didácticos en bambara para facilitar el acceso a estudiantes con discapacidad auditiva o para su reutilización en plataformas de e-learning.
- Investigación en ASR para lenguas africanas: el modelo sirve como punto de partida para experimentos de transferencia de aprendizaje, adaptación a dialectos o comparación de estrategias de decodificación (TDT vs. CTC) en lenguas de bajos recursos.

## Benchmarks y rendimiento

Los resultados que se muestran a continuación son los declarados por el autor en la model card. Se trata de valores de WER y CER con decodificación greedy, sin modelo de lenguaje externo.

| Benchmark | Decodificación | WER (%) | CER (%) |
|---|---|---|---|
| Bam ASR Early (test) | CTC | 40,56 | 22,01 |
| Nyana Eval (test) | CTC | 40,75 | 24,70 |
| Bam ASR Early (test) | TDT | 36,58 | 21,41 |
| Nyana Eval (test) | TDT | 47,10 | 31,27 |

El decodificador TDT ofrece mejor rendimiento en el benchmark Bam ASR Early, pero empeora notablemente en Nyana Eval, lo que sugiere una menor capacidad de generalización del decodificador autorregresivo frente a variaciones dialectales o condiciones de grabación distintas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente, pero un modelo de 114 M de parámetros en formato NeMo requiere aproximadamente entre 1 y 2 GB de VRAM en FP32, y menos de 1 GB en cuantizaciones de 8 bits o inferiores.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia. Modelos como NVIDIA T4, GTX 1660 Super, RTX 3060 o superiores son adecuados. Para entrenamiento o ajuste fino se recomienda al menos 16 GB de VRAM (RTX 4080, A100, etc.).
- Compatibilidad con GPUs de consumo: sí, cabe en GPUs de consumo como la serie RTX 30 y RTX 40 de NVIDIA.
- Opciones de despliegue: NVIDIA NeMo (inferencia y entrenamiento), aunque también es posible exportar a ONNX o TensorRT para servir el modelo con frameworks como Triton Inference Server. No se menciona soporte para llama.cpp, Ollama o vLLM, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible. El uso de CUDA Graphs en el decodificador TDT puede reducir la latencia en GPUs compatibles, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| soloni-114m-tdt-ctc-v0 | 114 M | FastConformer-TDT-CTC | Bambara | CC-BY-4.0 | HuggingFace |
| nvidia/parakeet-tdt_ctc-110m | 110 M | FastConformer-TDT-CTC | Inglés (y otros) | CC-BY-4.0 | HuggingFace |
| Jeli-ASR (base) | no disponible | no disponible | Bambara | no disponible | no disponible |

La comparativa directa con otros modelos ASR para bambara es limitada. El modelo base de NVIDIA está entrenado principalmente para inglés y otras lenguas de altos recursos, por lo que no es directamente comparable en rendimiento para bambara. Jeli-ASR es el dataset del que deriva el 87 % de los datos de entrenamiento, pero no se ha encontrado un modelo público basado en él para comparar.

## Limitaciones y advertencias

- El modelo no generaliza bien en todas las condiciones de habla y dialectos del bambara, según advierte el propio autor. Los resultados en Nyana Eval (WER 47,10 % con TDT) son significativamente peores que en el conjunto de entrenamiento, lo que confirma esta limitación.
- No genera puntuación ni capitalización, lo que puede dificultar la lectura de transcripciones largas o su uso directo en aplicaciones que requieran texto formateado.
- El modelo está pensado principalmente para investigación; no se recomienda su uso en producción sin una evaluación exhaustiva previa.
- El dataset de entrenamiento es reducido (37 horas) y deriva mayoritariamente de una única fuente (Jeli-ASR), lo que puede introducir sesgos hacia variedades específicas del bambara.
- El decodificador TDT puede fallar con `RuntimeError: CUDA error: invalid argument` en GPUs o versiones de CUDA que no soporten CUDA Graphs; es necesario desactivar esta opción manualmente.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero el modelo se distribuye con fines de investigación y el autor recomienda precaución en despliegues productivos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RobotsMali/soloni-114m-tdt-ctc-v0
- Dataset de entrenamiento: https://huggingface.co/datasets/RobotsMali/bam-asr-early
- Dataset de evaluación: https://huggingface.co/datasets/RobotsMali/nyana-eval
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt_ctc-110m
- Repositorio de código y configuraciones: https://github.com/RobotsMali-AI/bambara-asr/
- Documentación de FastConformer en NeMo: https://docs.nvidia.com/deeplearning/nemo/user-guide/docs/en/main/asr/models.html#fast-conformer
- Script de tokenización: https://github.com/NVIDIA/NeMo/blob/main/scripts/tokenizers/process_asr_text_tokenizer.py
- NVIDIA NeMo: https://github.com/NVIDIA/NeMo
