# ldov/FireRedVAD-GGUF

## Resumen

FireRedVAD-GGUF es una conversión al formato GGUF de la familia de modelos FireRedVAD, desarrollados originalmente por Xiaohongshu (FireRedTeam). No es un modelo de lenguaje: es un detector de actividad de voz (VAD) y de eventos de audio (AED) basado en una arquitectura DFSMN (Deep Feedforward Sequential Memory Network) con solo 588.931 parámetros (~0,59 M). El problema que resuelve es la segmentación fiable de audio en habla y no habla, una pieza crítica en cualquier pipeline de ASR, diarización o asistentes de voz.

El repositorio publica tres variantes: `stream-vad` (causal, pensada para inferencia en tiempo real con tramas de 10 ms), `vad` (bidireccional, con lookback y lookahead, orientada a procesamiento por lotes) y `aed` (detección simultánea de habla, música y canto en más de 100 idiomas). Todas ellas se ofrecen en cuatro niveles de cuantización (FP32, INT16, INT8 e INT8 per-channel) con pesos de entre 574 KB y 2,36 MB.

Su relevancia actual radica en que permite ejecutar VAD de alta precisión en C++ sin dependencia de PyTorch, sobre CPU x86_64, ARM o RISC-V, con factores de tiempo real de hasta 53,6x sobre un único núcleo. Según la model card, una actualización del 30 de agosto de 2026 corrigió un error de transposición en los filtros lookahead del FSMN, alcanzando paridad exacta con la implementación original en PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFSMN (Deep Feedforward Sequential Memory Network) |
| Parametros totales | 588.931 (~0,59 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: modelo de audio por tramas (10 ms en `stream-vad`); la variante `vad` usa contexto bidireccional con lookback y lookahead |
| Tipos de cuantizacion | FP32, INT16, INT8 per-tensor, INT8 per-channel (INT8-CH) |
| Idiomas soportados | más de 100 idiomas para AED (habla, música y canto); el VAD es agnóstico al idioma |
| Licencia | Apache 2.0 (modelo original de FireRedTeam y conversión GGUF de Strg-Alt-Entf-0x00); la metadata del repositorio en HuggingFace no declara licencia |
| Formato de pesos | GGUF |
| Variantes incluidas | `stream-vad` (causal), `vad` (bidireccional), `aed` (detección de eventos) |
| Tamano de pesos | de 574 KB (INT8) a 2,36 MB (FP32) por variante |
| Parametros de decodificacion | trama de 10 ms en `stream-vad` |
| Motor de inferencia | motor C++ nativo del repositorio de integración (sin PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es una DFSMN, una red feedforward con bloques de memoria secuencial que modelan dependencias temporales sin recurrencia explícita, lo que la hace muy adecuada para inferencia de baja latencia sobre CPU. El repositorio empaqueta tres cabezas funcionales sobre esta base: una variante causal (`stream-vad`) que no necesita contexto futuro, una variante bidireccional (`vad`) que combina lookback y lookahead para mayor precisión, y una variante multiclase (`aed`) que detecta simultáneamente habla, música y canto.

No se dispone de información sobre el número de tokens o horas de audio empleadas en el entrenamiento, la composición del dataset, ni si se aplicaron fases de ajuste tipo RLHF o DPO; esos datos figuran como no disponibles. Lo que sí se documenta con detalle es el proceso de conversión y cuantización: cada tensor incluye un fichero `-debug.json` con estadísticas por tensor (MAE, SQNR y factores de escala por canal), y la model card justifica el uso de cuantización per-channel precisamente porque la DFSMN presenta una varianza amplia en la distribución de pesos entre canales de salida, algo que la cuantización per-tensor no captura bien. La corrección del 30 de agosto de 2026 sobre los filtros lookahead del FSMN es la innovación técnica más relevante del repositorio, ya que garantiza paridad numérica con la implementación de referencia en PyTorch.

## Capacidades

- Detección de actividad de voz causal y de baja latencia (`stream-vad`), con procesamiento por tramas de 10 ms y sin necesidad de contexto futuro.
- Detección de actividad de voz bidireccional de alta precisión (`vad`), adecuada para procesamiento por lotes y offline.
- Detección de eventos de audio (`aed`): clasificación simultánea de habla, música y canto.
- Cobertura multilingüe de más de 100 idiomas en la tarea de AED.
- Inferencia en C++ sin PyTorch, con soporte para CPU x86_64, ARM y RISC-V.
- Cuatro niveles de cuantización seleccionables según el compromiso entre precisión, memoria y velocidad.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni capacidades de agente: es un modelo discriminativo de audio, no generativo de lenguaje.
- No dispone de modo de razonamiento (thinking mode) ni de procesamiento de audio a texto.

## Casos de uso

- Segmentación previa a ASR: el modelo `vad` recorta los tramos de silencio antes de enviar el audio a un sistema de reconocimiento de voz, reduciendo el cómputo del motor ASR y evitando alucinaciones en zonas sin habla.
- Detección de turnos y barge-in en asistentes de voz: `stream-vad`, al ser totalmente causal y procesar tramas de 10 ms, permite interrumpir la reproducción del asistente en cuanto el usuario empieza a hablar.
- Limpieza de corpus de entrenamiento: el pipeline puede descartar automáticamente los segmentos sin habla de grandes colecciones de audio antes de etiquetarlas, con un coste de CPU muy bajo.
- Preprocesado para diarización: la salida del VAD delimita los segmentos que después se envían a un modelo de separación por hablante, reduciendo falsos positivos en zonas de ruido.
- Analítica de contact centers: el modelo `aed` permite distinguir habla de música de espera o de canto en grabaciones de llamadas, y el VAD mide tiempos de habla y silencio por interlocutor.
- Moderación y catalogación de contenido en plataformas de audio: la detección de música y canto en más de 100 idiomas permite etiquetar automáticamente emisiones de radio, podcasts o vídeos.
- Despliegue en edge e IoT: con modelos INT8-CH de ~600 KB y unos 5 MB de RAM en total, el VAD puede ejecutarse en dispositivos con microcontrolador, actuando como filtro previo de una palabra de activación.
- Transcripción por lotes de archivos largos: la variante bidireccional, con mejor F1, se emplea en procesos nocturnos donde la latencia no es crítica y prima la exactitud de los límites de segmento.

## Benchmarks y rendimiento

Datos reportados en la model card. No se han proporcionado resultados comparativos adicionales (MMLU, HumanEval, GSM8K y similares no aplican a este tipo de modelo).

| Variante | Tarea | Factor de tiempo real | Metrica reportada |
|---|---|---|---|
| `stream-vad` | VAD causal, tramas de 10 ms | 53,6x | no disponible |
| `vad` | VAD bidireccional | 31,3x | F1 de 97,57 % en FLEURS-VAD-102 |
| `aed` | Deteccion de eventos de audio | 31,7x | no disponible |

Calidad de cuantización (MAE frente a FP32 y SQNR), valores publicados para las variantes `stream-vad`:

| Cuantizacion | Tamano | MAE vs FP32 | SQNR |
|---|---|---|---|
| FP32 | 2,28 MB | 0,0 | infinito |
| INT16 | 1,14 MB | 0,000077 | 94,2 dB |
| INT8-CH (per-channel) | 601 KB | 0,000985 | 59,4 dB |
| INT8 (per-tensor) | 574 KB | 0,001918 | 50,5 dB |

Para `vad` y `aed`, los tamaños son ligeramente superiores (627 KB y 628 KB en INT8-CH; 2,36 MB en FP32) y los valores de error son prácticamente idénticos (0,000985 y 59,4 dB en INT8-CH; 0,001957 y 50,4 dB en INT8).

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo está diseñado para inferencia en CPU.
- RAM mínima (modelos INT8-CH): aproximadamente 5 MB para el modelo más unos 2 MB para los búferes de inferencia.
- RAM recomendada (modelos FP32): aproximadamente 10 MB para el modelo más unos 3 MB para los búferes.
- Almacenamiento: unos 600 KB por modelo cuantizado y unos 2,3 MB por modelo en FP32.
- CPU compatible: cualquier x86_64, ARM o RISC-V moderno; se recomienda soporte SIMD (SSE, AVX, NEON) para acelerar la inferencia.
- GPU: no es necesaria. Cualquier GPU de consumo puede alojar el modelo, pero no aporta ventaja relevante frente a la CPU dado su tamano inferior a 3 MB.
- Opciones de despliegue: motor C++ nativo del repositorio de integración (sin PyTorch), o descarga del fichero GGUF mediante `huggingface_hub` para consumo desde Python. La compatibilidad con runtimes GGUF genéricos como llama.cpp u Ollama no está documentada.
- Latencia y rendimiento: hasta 53,6x tiempo real en `stream-vad` sobre un único núcleo de CPU; 31,3x en `vad`; 31,7x en `aed`.

## Comparativa con modelos similares

No se han proporcionado en la información disponible resultados de benchmarks comparativos frente a otras alternativas de VAD, por lo que las celdas de rendimiento figuran como no disponibles. La comparación se limita a la categoría y el enfoque.

| Modelo | Categoria | Formato | Licencia | Rendimiento comparado |
|---|---|---|---|---|
| FireRedVAD-GGUF | VAD + AED, DFSMN | GGUF | Apache 2.0 | F1 97,57 % en FLEURS-VAD-102; 31,3x-53,6x tiempo real |
| FireRedVAD (original) | VAD + AED, DFSMN | PyTorch | Apache 2.0 | referencia del que deriva esta conversión |
| Silero VAD | VAD neuronal | ONNX / PyTorch | no disponible en la informacion proporcionada | no disponible |
| WebRTC VAD | VAD basado en GMM | biblioteca C | no disponible en la informacion proporcionada | no disponible |
| pyannote VAD | VAD neuronal | PyTorch | no disponible en la informacion proporcionada | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes. Cualquier ficha o comparativa que lo trate como un LLM es incorrecta.
- Riesgo de alucinación no aplica en el sentido habitual, pero sí existe el riesgo de falsos positivos y falsos negativos en la detección de voz, especialmente en audio con ruido musical o habla superpuesta.
- La metadata del repositorio en HuggingFace no declara licencia ni lista de idiomas, aunque la model card indica Apache 2.0 para el modelo original y para la conversión.
- Existe una discrepancia entre el identificador del repositorio consultado (`ldov/FireRedVAD-GGUF`) y el que aparece en los ejemplos de la model card (`Strg-Alt-Entf-0x00/FireRedVAD-GGUF`); conviene verificar cuál es el repositorio canónico antes de integrarlo en producción.
- El repositorio presenta 0 descargas y 0 me gusta, con un tamano declarado de 0,0 GB, lo que sugiere que los ficheros podrían no estar efectivamente alojados o que el repositorio está vacío en el momento de la consulta.
- La cuantización INT8 per-tensor degrada la precisión de forma apreciable en arquitecturas DFSMN (SQNR de 50,5 dB frente a 59,4 dB de INT8-CH); se desaconseja su uso en producción si se busca fidelidad numérica.
- Las revisiones anteriores al 30 de agosto de 2026 contienen un error de transposición en los filtros lookahead del FSMN; no deben utilizarse.
- No se dispone de información sobre el dataset de entrenamiento, por lo que no puede evaluarse el sesgo lingüístico, de género, de edad o de acento.
- El rendimiento declarado (53,6x tiempo real) corresponde a un único núcleo de CPU en condiciones no especificadas; el rendimiento real dependerá del hardware y del soporte SIMD disponible.
- La compatibilidad con ecosistemas GGUF genéricos no está documentada: el uso previsto es el motor C++ propio del repositorio de integración.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ldov/FireRedVAD-GGUF
- Repositorio mencionado en la model card: https://huggingface.co/Strg-Alt-Entf-0x00/FireRedVAD-GGUF
- Modelo base en HuggingFace: https://huggingface.co/FireRedTeam/FireRedVAD
- Repositorio original de FireRedVAD (FireRedTeam, Xiaohongshu): https://github.com/FireRedTeam/FireRedVAD
- Motor de inferencia C++ y herramientas de conversión: https://github.com/Strg-Alt-Entf-0x00/firered-vad
