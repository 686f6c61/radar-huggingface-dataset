# malper/CallCleaner

## Resumen

CallCleaner es un modelo de eliminación de ruido bioacústico (denoising) que procesa formas de onda de audio y devuelve audio limpio, es decir, un modelo waveform-to-waveform de tipo audio-to-audio. Lo desarrolla el autor identificado como malper y está pensado para limpiar grabaciones de vocalizaciones de animales eliminando ruido de fondo como viento, lluvia, vehículos u otros animales. Con 18.867.937 parámetros (aproximadamente 19 millones) y un peso de repositorio de 0,1 GB, es un modelo deliberadamente ligero que no requiere GPU ni detector externo ni prompt de texto, y que según el autor se ejecuta unas 90 veces más rápido que el tiempo real en la CPU de un portátil.

El modelo se obtiene por destilación de conocimiento a partir de un modelo fundacional de separación de fuentes, SAM-Audio (`facebook/sam-audio-small`), que se usa como profesor con prompts de "animal sound" y tramos temporales proporcionados por un detector de actividad de voz animal. La arquitectura del alumno es el denoiser Demucs de Biodenoising (`biodenoising16k_dns48`, 16 kHz, mono), inicializado con los pesos de Biodenoising. El resultado es relevante porque acerca a un portátil sin GPU una calidad de eliminación de ruido que, según la model card, supera a Biodenoising, el denoiser bioacústico neuronal con pesos públicos líder, dejando 11 dB menos de ruido alrededor de la llamada en el benchmark de Biodenoising.

La ficha se basa exclusivamente en la información de la model card y los metadatos de Hugging Face; los resultados de benchmarks completos y muchos detalles de entrenamiento remiten al paper, cuyo enlace a arXiv aún no está disponible en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Demucs (denoiser de Biodenoising, `biodenoising16k_dns48`), waveform-to-waveform, 16 kHz, mono |
| Parametros totales | 18.867.937 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa segmentos de 4 s en entrenamiento; admite chunks solapados de audio largo) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (modelo de audio, no lingüístico) |
| Licencia | SAM License (`sam-license`, licencia "other") |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

La arquitectura es el denoiser Demucs de Biodenoising (`biodenoising16k_dns48`), que trabaja a 16 kHz en mono, inicializado a partir de los pesos de Biodenoising. El modelo se entrena por destilación de conocimiento desde SAM-Audio (`facebook/sam-audio-small`), usado como profesor con prompts de "animal sound" y spans temporales generados por un detector de actividad de voz animal. El flujo objetivo del profesor sirve como pseudo-etiqueta y su flujo residual como estimación de ruido; la mitad de cada lote se remezcla añadiendo el residual de otro segmento a una pseudo-etiqueta, siguiendo la técnica de bootstrapped remixing.

Los datos de entrenamiento son segmentos de 4 segundos (1,8 horas en total) procedentes de los corpus públicos con los que se entrenó Biodenoising: DCASE few-shot bioacoustics, Orchive y cinco corpus de aves, ninguno compartido con el benchmark de evaluación. El entrenamiento consta de 2.000 pasos. No se documentan en la model card detalles sobre RLHF, DPO ni otras fases de alineación, algo esperable en un modelo de audio.

## Capacidades

- Eliminación de ruido bioacústico: suprime viento, lluvia, vehículos y vocalizaciones de otros animales de grabaciones de llamadas animales.
- Procesamiento waveform-to-waveform: recibe audio ruidoso y devuelve audio limpio sin necesidad de detector, prompt de texto ni pipeline adicional.
- Funcionamiento en CPU: no requiere GPU; el autor indica unas 90 veces más rápido que el tiempo real en la CPU de un portátil.
- Procesamiento de grabaciones largas mediante chunks solapados (por ejemplo, 60 s con cross-fade de 1 s), gestionado por el script de línea de comandos del repositorio de código, que también maneja carpetas y otras frecuencias de muestreo.
- Entrada a 16 kHz mono; la salida también es 16 kHz.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso ni capacidades multilingües, al ser un modelo de audio especializado.

## Casos de uso

- Monitorización acústica pasiva de fauna: limpiar grabaciones continuas de sensores desplegados en campo antes de pasarlas a clasificadores de especies, reduciendo el ruido de viento y vehículos que degrada los detectores automáticos.
- Preprocesado en pipelines de bioacústica: integrar CallCleaner como etapa previa al análisis de llamadas de aves o anfibios, aprovechando que funciona en CPU y no necesita GPU en el nodo de captura.
- Análisis en portátiles y dispositivos de campo: al ejecutarse unas 90 veces más rápido que el tiempo real en CPU, permite limpiar horas de grabación en minutos sin infraestructura de GPU.
- Estudios de comunicación animal: mejorar la relación señal-ruido de llamadas individuales para análisis espectrográfico o de parámetros acústicos, teniendo en cuenta que el modelo está entrenado para preservar la vocalización de un único emisor.
- Limpieza de archivos históricos de colecciones de audio (por ejemplo, Orchive) antes de su reutilización en investigaciones o archivística sonora.
- Generación de datasets de entrenamiento limpios: usar la salida del modelo como paso de curación de datos para entrenar o evaluar otros clasificadores bioacústicos.
- Procesamiento por lotes de carpetas de grabaciones: el script del repositorio permite recorrer directorios y remuestrear entradas de otras frecuencias a 16 kHz de forma automática.

## Benchmarks y rendimiento

La model card indica que, en el benchmark de Biodenoising (47 clips × 4 niveles de SNR), CallCleaner deja 11 dB menos de ruido alrededor de la llamada que Biodenoising, y que entre los sistemas rápidos ejecutables en CPU se sitúa en la frontera de Pareto entre eliminación de ruido y fidelidad de la llamada. No se proporcionan en la información disponible las tablas numéricas completas (métricas por SNR, comparativas con otros sistemas) ni resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo.

| Benchmark | Resultado |
|---|---|
| Benchmark de Biodenoising (47 clips × 4 SNRs) | 11 dB menos de ruido alrededor de la llamada que Biodenoising (según model card) |
| Frontera de Pareto ruido/fidelidad (sistemas CPU) | El autor lo sitúa en la frontera de Pareto; cifras completas en el paper (no disponible) |
| MMLU, HumanEval, GSM8K | no aplicable / no disponible |

## Requisitos de hardware

- VRAM estimada: no requiere GPU; con ~19 M de parámetros, el modelo ocupa del orden de decenas de MB en memoria en CPU (el repositorio completo pesa 0,1 GB).
- GPU recomendadas: no necesarias; el autor destaca su uso en CPU de portátil. Cualquier GPU moderna puede acelerar la inferencia, pero no se documentan requisitos ni rendimientos en GPU.
- Compatibilidad con GPU de consumo: sí, por tamaño; el modelo cabe holgadamente en cualquier GPU de consumo, aunque el caso de uso objetivo es CPU.
- Opciones de despliegue: PyTorch con la librería `biodenoising`, `safetensors` y `huggingface_hub`; script de línea de comandos del repositorio de GitHub. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: aproximadamente 90 veces más rápido que el tiempo real en la CPU de un portátil, según el autor; no se especifican cifras absolutas de latencia ni el hardware exacto de la medición.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Licencia | Notas |
|---|---|---|---|---|
| CallCleaner | 18,9 M | Demucs waveform-to-waveform, 16 kHz | SAM License | Destilado de SAM-Audio; ~90× tiempo real en CPU; 11 dB menos ruido que Biodenoising en su benchmark |
| Biodenoising (`biodenoising16k_dns48`) | no disponible en la información | Demucs waveform-to-waveform, 16 kHz | MIT (arquitectura e inicialización) | Denoiser bioacústico de referencia con pesos públicos; base arquitectónica de CallCleaner y referencia de comparación |
| SAM-Audio (`facebook/sam-audio-small`) | no disponible en la información | Modelo fundacional de separación de fuentes con prompts | no disponible en la información | Profesor de la destilación; mejor eliminación de ruido según el autor, pero lento y dependiente de detector |

## Limitaciones y advertencias

- La salida es de 16 kHz: el contenido por encima de 8 kHz no se restaura, lo que afecta a muchas llamadas de murciélagos y a algunas de aves e insectos.
- Está entrenado para preservar la vocalización de un único emisor; llamadas solapadas de otros animales pueden tratarse como ruido y eliminarse.
- Hereda errores del profesor: puede perder llamadas silenciosas o conservar sonidos no objetivo que sean fuertes. El autor recomienda escuchar las salidas antes de usarlas para análisis.
- Riesgo de artefactos o distorsión en la señal limpiada no cuantificado en la información disponible; conviene validar con métricas propias antes de producción.
- Sesgos: no documentados en la model card; al entrenarse con corpus concretos (aves, DCASE, Orchive), su comportamiento en taxones no representados es incierto.
- Licencia: los pesos son derivados de SAM-Audio y se publican bajo la SAM License, no bajo una licencia permisiva; el uso o la redistribución implican aceptar sus términos, que deben revisarse para uso comercial. La arquitectura e inicialización de Biodenoising son MIT.
- No se documentan limitaciones idiomáticas por ser un modelo de audio; los idiomas figuran como no disponibles.
- El modelo tiene 0 descargas y 0 likes en el momento de la información, por lo que no hay evidencia de uso comunitario ni validación externa publicada.

## Enlaces

- Hugging Face: https://huggingface.co/malper/CallCleaner
- Página del proyecto: https://callcleaner.github.io
- Código en GitHub: https://github.com/morrisalp/CallCleaner
- Paper (arXiv, enlace pendiente según la model card): no disponible
- Repositorio de Biodenoising: https://github.com/earthspecies/biodenoising
- Modelo profesor SAM-Audio: https://huggingface.co/facebook/sam-audio-small
- Estadísticas del autor en OpenModelStats: https://openmodelstats.com/owners/malper
