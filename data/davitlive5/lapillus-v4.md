# davitlive5/Lapillus-v4

## Resumen

Lapillus-v4 es un modelo de reconocimiento automático del habla (ASR) especializado en armenio oriental, desarrollado por Davit Ghazaryan (usuario `davitlive5` en Hugging Face). Se trata de un modelo híbrido FastConformer con cabezales RNN-T y CTC de 115 millones de parámetros, afinado específicamente para audio de centro de llamadas y telefonía, un dominio históricamente problemático para los sistemas ASR por la compresión de códec, el ruido de fondo y el ancho de banda limitado.

El modelo parte de `davitlive5/Lapillus-v1` y se ha entrenado con unas 108 horas de voz pública en armenio oriental, aplicando aumentación en línea que simula condiciones de telefonía (filtrado 300–3400 Hz, remuestreo a 8 kHz, códecs G.711, pérdida de paquetes, reverberación y ruido de multitud). El repositorio incluye además un modelo de lenguaje KenLM de 8-gramas y un Transformer de 86 millones de parámetros para rescoring de n-best, ambos necesarios para reproducir los resultados publicados.

Su relevancia radica en que cubre un hueco concreto: el armenio es un idioma con pocos recursos ASR de calidad y prácticamente ninguno orientado a telefonía. Con un WER normalizado de 3,78 en Common Voice y 4,40 en FLEURS, y de 5,63 a 8,23 en condiciones telefónicas, se posiciona como una opción práctica para despliegues de atención al cliente en armenio. La licencia CC-BY-4.0 permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer híbrido (RNN-T + CTC) |
| Parametros totales | 115 M (modelo acústico) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (segmentos recomendados de hasta ~30 s) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Armenio (oriental); armenio occidental no soportado de forma fiable |
| Licencia | CC-BY-4.0 |
| Formato de pesos | `.nemo` (NeMo); LM en `.nemo` (KenLM) y `.pt` (Transformer) |

## Arquitectura y entrenamiento

El modelo acústico es un FastConformer híbrido con cabezales RNN-T y CTC, con una pérdida combinada de 0,7 RNN-T + 0,3 CTC. El entrenamiento se realizó por fine-tuning desde Lapillus-v1 sobre aproximadamente 108 horas de voz pública en armenio oriental, con aumentación en línea orientada a telefonía: variación de velocidad, respuestas de impulso de sala, ruido y música, babble multihablante, filtrado paso banda telefónico, remuestreo a 8 kHz, códecs G.711, pérdida de paquetes y recorte (clipping). Se usó AdamW con tasa de aprendizaje 3e-5 y schedule coseno, EMA, precisión bf16 y 15 000 pasos.

Tras el entrenamiento se aplicó un promediado de pesos: tres ejecuciones con semillas distintas se promedian entre sí, y el resultado se promedia 85/15 con Lapillus-v1. Para la decodificación, el repositorio incluye un KenLM de 8-gramas a nivel de token y un Transformer LM de 86 M de parámetros para rescoring de n-best, entrenados sobre texto web armenio depurado con los números escritos como palabras. El pipeline de decodificación combina beam search de tamaño 8, puntuación del LM de 8-gramas (alpha 0,3), puntuación CTC (peso 0,8), puntuación del LM neuronal (peso 1,2) y un bonus de longitud (peso 4). El autor indica que se eliminó del entrenamiento y del texto de los LM cualquier frase coincidente con los conjuntos de test de ArmBench.

## Capacidades

- Reconocimiento de voz en armenio oriental con salida de texto que incluye puntuación y mayúsculas.
- Decodificación híbrida RNN-T/CTC con soporte de beam search y modelos de lenguaje externos (KenLM de 8-gramas).
- Rescoring de n-best mediante un Transformer LM de 86 M de parámetros incluido en el repositorio.
- Robustez específica ante audio telefónico: banda 300–3400 Hz, 8 kHz, G.711 y pérdida de paquetes.
- Manejo de audio de entrada a 16 kHz mono (el audio telefónico de 8 kHz debe remuestrearse a 16 kHz).
- Transcripción por lotes mediante la API de NeMo (`model.transcribe([...])`).
- Números transcritos como palabras (no como dígitos).
- No soporta tool calling, function calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción de llamadas en centros de atención al cliente: el modelo está afinado con aumentación telefónica explícita (G.711, pérdida de paquetes, reverberación), lo que permite transcribir grabaciones de call center con WER de 5,63 en audio limpio y 7,50 en audio telefónico.
- Analítica de conversaciones y control de calidad: al producir texto con puntuación y mayúsculas, las transcripciones se pueden indexar y analizar directamente en herramientas de búsqueda o dashboards de cumplimiento sin postprocesado pesado.
- Subtitulado de contenido en armenio oriental: con WER de 4,40 en FLEURS, es adecuado para generar subtítulos de audio limpio, segmentando previamente en fragmentos de menos de 30 segundos.
- Sistemas de IVR con transcripción en tiempo real: el tamaño de 115 M de parámetros y el formato NeMo permiten desplegar el modelo en infraestructura moderada para transcribir interacciones de voz en vivo.
- Archivado y búsqueda de grabaciones históricas: la robustez ante códecs telefónicos antiguos (G.711) facilita digitalizar y hacer buscable un archivo de llamadas grabadas.
- Generación de datos etiquetados para otros modelos: las transcripciones de alta calidad sirven para construir corpus de armenio oriental con puntuación, útiles para entrenar o evaluar otros sistemas de voz o texto.
- Investigación en ASR de bajos recursos: el repositorio incluye los LM y el script de rescoring, lo que permite reproducir y extender la evaluación sobre nuevos conjuntos en armenio.

## Benchmarks y rendimiento

Resultados declarados por el autor (WER normalizado, menor es mejor; decodificador común: beam 8 + LM de 8-gramas + puntuación CTC + rescoring con LM neuronal). Métricas no verificadas de forma independiente.

| Conjunto de test | Lapillus-v3 (interno) | Lapillus-v4 |
|---|---|---|
| ArmBench Common Voice test | 3,76 | 3,78 |
| ArmBench FLEURS test | 4,94 | 4,40 |
| Phone Common Voice (G.711) | 8,66 | 8,23 |
| Phone FLEURS (G.711) | 7,10 | 6,93 |
| Call-centre clean | 6,31 | 5,63 |
| Call-centre phone | 8,10 | 7,50 |

El autor indica que, en los diez conjuntos de test de la compuerta, la mejora media frente a v3 es de −0,54 puntos de WER (intervalo del 95 %: −0,66 a −0,43). Como referencia, Lapillus-v2 obtuvo 4,48 y 5,73 en los dos conjuntos de ArmBench con su propio decodificador.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 115 M de parámetros en el modelo acústico, la inferencia cabe holgadamente en GPUs de consumo, aunque el consumo real depende del beam search y del rescoring con el Transformer LM de 86 M.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cualquier GPU con al menos 4–8 GB de VRAM debería ser suficiente para el modelo acústico; el LM neuronal de 86 M añade un consumo adicional moderado.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas tipo RTX 3060/4060 o superiores, aunque el dato no está confirmado por el autor.
- Opciones de despliegue: NeMo Toolkit (`nemo_toolkit[asr]`) es la vía oficial; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo ASR de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER (ArmBench CV) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lapillus-v4 | 115 M (acústico) | Segmentos ~30 s | 3,78 | CC-BY-4.0 | Hugging Face (NeMo) |
| Lapillus-v3 (interno) | No disponible | Segmentos ~30 s | 3,76 | No disponible | No público |
| Lapillus-v2 | No disponible | Segmentos ~30 s | 4,48 (decodificador propio) | No disponible | Hugging Face |
| Lapillus-v1 | No disponible | Segmentos ~30 s | No disponible | CC-BY-4.0 | Hugging Face |
| NVIDIA `stt_hy_fastconformer_hybrid_large_pc` | No disponible | No disponible | No disponible | CC-BY-4.0 | NGC / Hugging Face |

No se dispone de datos de benchmarks de modelos ASR comparables de otros autores en armenio en la información proporcionada.

## Limitaciones y advertencias

- Solo armenio oriental: se esperan más errores en armenio occidental.
- La precisión cae en diálogo de cine, habla solapada intensa, nombres poco frecuentes y terminología especializada.
- Los números se transcriben como palabras, lo que puede requerir normalización posterior si se necesitan dígitos.
- El audio debe segmentarse en fragmentos de menos de aproximadamente 30 segundos; el audio telefónico de 8 kHz debe remuestrearse a 16 kHz.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false`).
- Riesgo de alucinación inherente a los modelos ASR: en segmentos con ruido extremo o silencio puede generar texto espurio.
- Sesgos: no se documentan sesgos específicos de género, acento o registro más allá de la limitación dialectal oriental/occidental.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar al autor y respetar las condiciones de los modelos derivados (Lapillus-v1 y el modelo base de NVIDIA, también CC-BY-4.0).
- El repositorio ocupa 3,2 GB e incluye los modelos de lenguaje; el despliegue completo requiere cargar el modelo acústico y, para máxima precisión, el KenLM y el Transformer LM de rescoring.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davitlive5/Lapillus-v4
- Modelo base Lapillus-v1: https://huggingface.co/davitlive5/Lapillus-v1
- Modelo base de NVIDIA `stt_hy_fastconformer_hybrid_large_pc`: no disponible como enlace directo en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
