# Mbahaa08/SharkTank-ArabicEnglish-Diarizer

## Resumen

SharkTank-ArabicEnglish-Diarizer es un sistema de diarización de hablantes (speaker diarization) ajustado y calibrado para dominios de negocios con código mezclado árabe egipcio-inglés (code-switching). Lo desarrolla el usuario Mbahaa08 y se publica bajo la licencia OpenMDW-1.1. El modelo parte de `nvidia/Nemotron-3-Diarization` y aplica un adaptador de fine-tuning, un preprocesado específico y lo que el autor denomina "collision-free math" para resolver las colisiones de asignación de hablantes.

El problema que aborda es concreto: los sistemas de diarización genéricos sobreestiman el número de hablantes en diálogos de code-switching y cometen errores de atribución cuando los interlocutores alternan entre árabe y inglés. En el conjunto de evaluación del autor, el sistema base predice 3,46 hablantes frente a una referencia de 2,92, mientras que este modelo acierta el número exacto de hablantes en el 100 % de los casos y reduce la DER (Diarization Error Rate) del 21,84 % al 8,29 % con collar de 0,0 s.

La relevancia actual es doble: por un lado, la diarización es un componente crítico en pipelines de transcripción (ASR) y análisis de reuniones; por otro, el code-switching árabe-inglés es un fenómeno poco cubierto por los modelos multilingües convencionales. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB, lo que sugiere que los pesos pueden no estar publicados o que el repo contiene únicamente la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de `nvidia/Nemotron-3-Diarization`; el autor no detalla la arquitectura interna) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | árabe egipcio (ArzEn) e inglés, en régimen de code-switching |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | no disponible (el tamaño del repo es 0,0 GB) |

## Arquitectura y entrenamiento

El autor no publica detalles sobre la arquitectura interna del sistema. La model card indica que el modelo se construye sobre `nvidia/Nemotron-3-Diarization` mediante tres componentes: un preprocesado (preproc), un adaptador de fine-tuning (FT Adapter) y una técnica de asignación de hablantes que el autor llama "collision-free math". No se especifica si el adaptador es de tipo LoRA, si se reentrena la cabeza de clasificación o si se modifica el pipeline de clustering de embeddings.

Tampoco se documentan el número de tokens de audio utilizados, la composición del dataset de entrenamiento, ni si hubo etapas de RLHF o DPO (poco habituales en diarización). El único dato cuantitativo de entrenamiento/evaluación es el conjunto de test: más de 4 horas de audio ArzEn no visto durante el ajuste, con una media de 2,92 hablantes por segmento. La innovación declarada es la corrección de colisiones en la asignación de hablantes, que evita fusionar o duplicar identidades cuando dos voces comparten características acústicas en contextos de cambio de idioma.

## Capacidades

- Diarización de hablantes (segmentación y agrupación por identidad) en audio de conversaciones de negocios.
- Manejo de code-switching árabe egipcio-inglés dentro de un mismo turno de habla.
- Estimación del número de hablantes por reunión o episodio, con acierto exacto en el benchmark del autor.
- Generación de etiquetas de hablante (speaker turns) con marcas temporales, aptas para alinear con transcripciones ASR.
- Preprocesado de audio integrado en el pipeline (limpieza y normalización previa a la inferencia).
- No se documentan capacidades de generación de texto, tool calling, agentes, visión ni audio más allá de la diarización.

## Casos de uso

- Transcripción de reuniones con code-switching: el sistema etiqueta cada intervención con su hablante antes de pasar el audio a un ASR, de modo que la transcripción final atribuya correctamente las frases en árabe y en inglés a cada participante.
- Análisis de programas de televisión y pódcasts de negocios: el modelo está calibrado sobre el dominio "Shark Tank Egypt", por lo que es adecuado para episodios con varios emprendedores e inversores alternando idiomas.
- Generación de actas y resúmenes de reuniones: al conocer el número exacto de hablantes, se pueden construir resúmenes por interlocutor sin duplicar identidades, algo que falla con sistemas que sobreestiman el recuento.
- Investigación en lingüística de corpus: permite segmentar corpus ArzEn por hablante para estudiar patrones de cambio de código, tiempos de habla y alternancia de turnos.
- Sistemas de compliance y auditoría de llamadas: en entornos de atención al cliente bilingües (árabe egipcio-inglés) permite verificar quién dijo qué en una grabación.
- Pipelines de subtitulado: la salida de diarización se puede usar para colorear o etiquetar subtítulos por hablante en contenido audiovisual bilingüe.
- Preprocesado para modelos de resumen y QA sobre audio: la diarización previa mejora la calidad de sistemas posteriores que necesitan saber cuántos interlocutores hay y cuándo habla cada uno.

## Benchmarks y rendimiento

El autor publica un benchmark de 13 archivos sobre un conjunto de test ArzEn no visto de más de 4 horas, comparando el sistema base con su versión ajustada. Los datos son los siguientes:

| Sistema | Hablantes (ref. 2,92) | DER (collar 0,0 s) | DER (collar 0,25 s) | Missed % | False Alarm % | Confusion % | JER % |
|---|---|---|---|---|---|---|---|
| `nvidia/Nemotron-3-Diarization` (raw) | 3,46 | 21,84 % | 19,72 % | 19,06 % | 2,14 % | 0,64 % | 20,72 % |
| Ours (preproc + FT adapter + collision-free math) | 2,92 (100 % exacto) | 8,29 % | 7,01 % | 3,63 % | 3,67 % | 0,99 % | 11,21 % |

No se han publicado resultados de benchmarks adicionales (por ejemplo, AMI, VoxConverse o CALLHOME) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El autor no publica tamaño de parámetros ni requisitos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no se puede confirmar sin conocer el tamaño del modelo.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. Al tratarse de un sistema de diarización, lo habitual sería un pipeline de audio (por ejemplo, basado en PyTorch) más que un servidor de texto.
- Latencia y throughput: no disponibles.
- Nota: el repositorio ocupa 0,0 GB, por lo que conviene verificar si los pesos están realmente publicados antes de planificar el despliegue.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SharkTank-ArabicEnglish-Diarizer | Diarización ajustada sobre Nemotron-3 | Árabe egipcio + inglés (code-switching) | no disponible | OpenMDW-1.1 | Hugging Face (0 descargas) |
| `nvidia/Nemotron-3-Diarization` | Diarización genérica | no disponible | no disponible | no disponible en la información proporcionada | Hugging Face (modelo base) |
| `pyannote/speaker-diarization-3.1` | Pipeline de diarización | Multilingüe | no aplica (audio) | Condicional (requiere aceptar términos en HF) | Hugging Face |
| `nvidia/diar_sortformer` / NeMo | Diarización basada en Sortformer | Multilingüe | no aplica (audio) | no disponible en la información proporcionada | NGC / Hugging Face |

La comparación cuantitativa solo es posible frente al modelo base, para el que el autor reporta una mejora de 13,55 puntos de DER con collar de 0,0 s. No hay datos públicos que permitan comparar este sistema con pyannote o Sortformer en el mismo conjunto ArzEn.

## Limitaciones y advertencias

- Sesgos conocidos: el ajuste está calibrado sobre el dominio "Shark Tank Egypt", por lo que el rendimiento puede degradarse fuera de diálogos de negocios con ese perfil acústico y de locutores.
- Riesgo de sobreajuste al número de hablantes: el benchmark reporta 100 % de acierto exacto en el recuento sobre su propio test; conviene validar con datos externos antes de asumir ese comportamiento.
- Idiomas: solo se documenta árabe egipcio e inglés; no hay evidencia de soporte para otros dialectos árabes (golfo, levante, magrebí) ni para otras combinaciones de code-switching.
- Alucinación: en diarización el riesgo equivalente es la atribución errónea de turnos o la invención de hablantes; el autor reporta 3,67 % de falsas alarmas, que en producción puede traducirse en segmentos asignados a un hablante inexistente.
- Licencia: OpenMDW-1.1; es necesario revisar sus términos antes de uso comercial, ya que no es una licencia permisiva estándar tipo Apache 2.0 o MIT.
- Repositorio vacío o incompleto: 0,0 GB de tamaño y 0 descargas; verificar la disponibilidad real de los pesos y del código de inferencia.
- Sin documentación de arquitectura ni de parámetros: dificulta estimar costes de despliegue, latencia y requisitos de GPU.
- Fecha de creación futura (2026-11-23) en los metadatos: conviene contrastar la procedencia y madurez del artefacto antes de integrarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mbahaa08/SharkTank-ArabicEnglish-Diarizer
- Modelo base: https://huggingface.co/nvidia/Nemotron-3-Diarization
- Licencia OpenMDW-1.1: no disponible en la información proporcionada (se recomienda consultar el texto de la licencia referenciado en el repositorio)
- Paper, blog o demo del autor: no disponible en la información proporcionada
