# CobuildX-AI/cbx-healthcare-speech-to-text-0.6B

## Resumen

cbx-healthcare-speech-to-text-0.6B es un adaptador LoRA sobre el modelo de reconocimiento automático del habla Qwen/Qwen3-ASR-0.6B, desarrollado por CobuildX-AI y publicado bajo licencia Apache-2.0. Su objetivo es especializar un ASR generalista de 0,6 mil millones de parámetros en la transcripción de consultas médicas en inglés entre médico y paciente, mejorando de forma selectiva la precisión sobre terminología clínica (nombres de enfermedades y de medicamentos) sin degradar el rendimiento en vocabulario cotidiano.

El adaptador se ha entrenado con 28 horas de audio médico (10.917 clips de entre 1 y 30 segundos) procedentes de dos fuentes: el conjunto sintético Synth-DoPaCo y el corpus de entrevistas médicas role-played de Fareez et al. 2022. La propuesta es relevante porque demuestra que un ajuste fino ligero sobre un ASR pequeño puede reducir de forma medible los errores en entidades clínicas críticas, manteniendo un coste de inferencia muy bajo: funciona en una única GPU T4 o incluso en CPU.

La versión publicada es v0.1 (etiqueta `v0.1` en el repositorio) y está pensada específicamente para conversaciones clínicas; el propio autor advierte de que, para otros tipos de habla (conferencias o frases cortas aisladas), el modelo base sigue siendo más preciso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen/Qwen3-ASR-0.6B; arquitectura del modelo base no detallada en la informacion disponible |
| Parametros totales | 0,6B en el modelo base; numero de parametros del adaptador no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; el pipeline trocea el audio en fragmentos de maximo 30 segundos |
| Tipos de cuantizacion | no disponible (el autor reporta ejecucion en fp16 en GPU y fp32 en CPU) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA); requiere cargar el modelo base Qwen/Qwen3-ASR-0.6B |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (library_name: peft) acoplado al checkpoint Qwen/Qwen3-ASR-0.6B. No se detalla en la informacion disponible la arquitectura interna del modelo base (tipo de encoder/decoder, mecanismo de atencion ni innovaciones concretas). El adaptador modifica los pesos del ASR base para sesgar la decodificacion hacia el dominio clinico.

El entrenamiento utilizo 40 horas de audio divididas al 50% entre Synth-DoPaCo (visitas sinteticas de atencion primaria, licencia CC-BY-4.0) y el dataset OSCE de Fareez et al. 2022 (entrevistas medicas reales role-played, CC0). El split fue 70/20/10 por grabacion, resultando en 28 horas efectivas de entrenamiento (10.917 clips de 1 a 30 segundos). Cada clip se filtro con un modelo ASR de codigo abierto y se descartaron aquellos cuya transcripcion divergia demasiado del audio. No se menciona en la informacion disponible el uso de RLHF, DPO ni otras tecnicas de alineacion.

## Capacidades

- Transcripcion de voz a texto en ingles para conversaciones medico-paciente.
- Reconocimiento mejorado de nombres de condiciones medicas: 5,4% de menciones erroneas frente al 16,1% del modelo base en PriMock57.
- Reconocimiento mejorado de nombres de medicamentos: 33,9% de menciones erroneas frente al 38,8% del modelo base.
- Salida con mayusculas, puntuacion y numeros; eliminacion de muletillas (um, uh).
- Aceptacion de audio como ruta de fichero, par `(samples, sample_rate)` o array a 16 kHz; conversion automatica a mono 16 kHz desde cualquier frecuencia de muestreo.
- Procesamiento de grabaciones largas mediante troceado en fragmentos de hasta 30 segundos en momentos de silencio y union posterior del texto.
- Parametro `context` para sesgar la decodificacion hacia vocabulario esperado (por ejemplo, la lista de medicamentos de una clinica).
- Transcripcion por lotes (`transcribe_batch`).
- No se documenta soporte de tool calling, agentes, vision ni audio en otros idiomas.

## Casos de uso

- Documentacion clinica automatizada: transcribir consultas grabadas para generar borradores de notas clinicas, con revision humana posterior obligatoria segun el propio autor.
- Asistentes de dictado para profesionales sanitarios: el modelo reconoce terminos clinicos con mayor fidelidad que el ASR base, reduciendo correcciones manuales en historiales.
- Analisis de consultas a escala: procesar lotes de grabaciones para estudios de calidad asistencial o investigacion, con throughput de aproximadamente 25 segundos por cada 10 minutos de audio en una T4.
- Sistemas de apoyo a la codificacion clinica: extraer menciones de condiciones y medicamentos para tareas de etiquetado posterior, usando el parametro `context` con el formulario o catalogo del centro.
- Telemedicina con transcripcion en tiempo casi real: la latencia de aproximadamente 180 ms por clip corto en GPU permite subtitulado o registro durante la consulta.
- Despliegue en entornos con hardware limitado: al ejecutarse en CPU (Apple M4 a unos 10-15 s por minuto de audio) o en una unica GPU T4, es viable en clinicas sin infraestructura de aceleradores dedicada.
- Generacion de conjuntos de datos de conversacion clinica: transcripcion masiva de grabaciones para construir corpus anotados.

## Benchmarks y rendimiento

Evaluacion en PriMock57 (57 consultas simuladas de medicina general en Reino Unido, 4.476 enunciados, nunca usadas en entrenamiento). Menor es mejor.

| Metrica | cbx-healthcare v0.1 | Qwen3-ASR-0.6B (base) |
|---|---|---|
| Word error rate | 6,01% | 6,00% |
| Nombres de condiciones erroneos (168 menciones) | 5,4% | 16,1% |
| Nombres de medicamentos erroneos (121 menciones) | 33,9% | 38,8% |

Evaluacion en conjuntos de test reservados de las dos fuentes de entrenamiento:

| Conjunto | cbx-healthcare v0.1 | Qwen3-ASR-0.6B (base) |
|---|---|---|
| Synth-DoPaCo, 895 clips | 3,08% | 4,15% |
| Fareez OSCE, 719 clips | 4,15% | 4,54% |

Rendimiento de velocidad reportado por el autor:

| Escenario | Apple M4 CPU | NVIDIA T4 GPU |
|---|---|---|
| 1 minuto de habla | 10-15 s | 2,4 s |
| Consulta de 10 minutos | ~2 minutos | ~25 segundos |

La GPU se ejecuto en fp16 con lotes de 16 clips (271 minutos de audio de PriMock57 en 11 minutos); la CPU en fp32 con 4 hilos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con un modelo base de 0,6B en fp16 el peso ronda 1,2 GB, mas el adaptador LoRA y el overhead de inferencia.
- GPU recomendadas: NVIDIA T4 es suficiente segun las mediciones del autor; cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) deberia cubrir el modelo en fp16.
- Cabe en GPU consumer: si, dado el tamano del modelo base; el autor confirma ejecucion en una unica GPU y en CPU.
- CPU: viable; Apple M4 a 10-15 s por minuto de audio en fp32 con 4 hilos.
- Opciones de despliegue: el repositorio incluye `stt.py` con la clase `SpeechToText` y `requirements.txt`; no se documenta integracion con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~180 ms por clip en GPU (ejemplo del README), ~2,4 s por minuto de audio en T4, ~25 s por consulta de 10 minutos en T4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER PriMock57 | Condiciones erroneas | Medicamentos erroneos | Licencia |
|---|---|---|---|---|---|---|
| cbx-healthcare-speech-to-text-0.6B v0.1 | 0,6B (base) + LoRA | no disponible | 6,01% | 5,4% | 33,9% | Apache-2.0 |
| Qwen3-ASR-0.6B (base) | 0,6B | no disponible | 6,00% | 16,1% | 38,8% | Apache-2.0 |
| Otros ASR medicos especializados | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa con otros ASR especializados en dominio medico no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Requiere revision humana antes de incorporar las transcripciones a registros clinicos.
- El habla de entrenamiento es de acento estadounidense; la precision en otros acentos no se ha medido por completo.
- Solo soporta ingles.
- Los medicamentos siguen fallando aproximadamente una de cada tres veces; los errores se concentran en nombres raros o marcas britanicas ausentes del entrenamiento (Clenil, Implanon, Dioralyte). Farmacos comunes como paracetamol (1 error en 29) e ibuprofeno (4 en 25) tienen mejor comportamiento.
- Para habla fuera del dominio clinico (conferencias, frases cortas) el modelo base es actualmente mas preciso.
- El WER global es practicamente identico al del modelo base (6,01% frente a 6,00%); la mejora se concentra en entidades clinicas, no en la transcripcion general.
- Riesgo de alucinacion en pasajes de audio con ruido o solapamiento no cuantificado en la informacion disponible.
- Licencia Apache-2.0 para el adaptador y el modelo base; los datos de entrenamiento tienen licencias CC-BY-4.0 (Synth-DoPaCo) y CC0 (Fareez et al. 2022).
- Version v0.1: conviene fijar la revision (`--revision v0.1`) para reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CobuildX-AI/cbx-healthcare-speech-to-text-0.6B
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Dataset Synth-DoPaCo: https://huggingface.co/datasets/Play-Your-Part/Synth-DoPaCo
- Dataset OSCE de Fareez et al. 2022: https://doi.org/10.6084/m9.figshare.16550013
- PriMock57: https://github.com/babylonhealth/primock57
