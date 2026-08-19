# lemuralabs/lemura-arabic-asr-lite

## Resumen

**lemura-arabic-asr-lite** es un modelo de reconocimiento automático del habla (ASR) multidioma árabe, compacto y eficiente, desarrollado por Lemura Labs. Está diseñado para ofrecer precisión de nivel líder en transcripción de árabe sin necesidad de infraestructura GPU costosa: funciona en CPU en tiempo real con solo ~115 millones de parámetros.

El modelo emplea una arquitectura FastConformer-CTC, adaptada internamente a partir del FastConformer de NVIDIA, y ha sido afinado con ~2.900 horas de audio árabe que cubren el árabe moderno estándar (MSA) y los grupos dialectales del Golfo, egipcio, levantino y magrebi. Su contribución principal reside en el currículo de datos árabe y la cobertura dialectal, no en la arquitectura base.

Su relevancia actual radica en que ocupa el **puesto #2 de 36 sistemas** en el *Open Universal Arabic ASR Leaderboard* con un WER medio del 25,08 %, superando a modelos de audio-LLM de entre 2B y 30B de parámetros, siendo entre 17 y 250 veces más pequeño que esos sistemas. Se distribuye como un único archivo `.nemo` de ~0,4 GB bajo licencia CC-BY-4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-CTC (encoder FastConformer + decodificador CTC) |
| Parametros totales | ~115.000.000 (~0,12B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo ASR, no generativo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Arabe: MSA + dialectos del Golfo, egipcio, levantino y magrebi |
| Licencia | CC-BY-4.0 |
| Formato de pesos | `.nemo` (NVIDIA NeMo) |

## Arquitectura y entrenamiento

El modelo utiliza un enfoque ASR discriminativo: un encoder FastConformer acoplado a un decodificador CTC. FastConformer es una variante eficiente del conformer de NVIDIA optimizada para reducir el coste computacional manteniendo la calidad de representación acústica. La adaptación realizada por Lemura Labs se centra en el currículo de datos árabe y la cobertura dialectal, no en la arquitectura base.

El entrenamiento consistió en un afinado (fine-tuning) sobre ~2.900 horas de audio árabe distribuido en cinco grupos dialectales: MSA, Golfo, egipcio, levantino y magrebi. No se menciona el uso de RLHF, DPO u otras técnicas de alineación, ya que al ser un modelo CTC discriminativo no genera texto autoregresivamente. El audio de entrada se procesa a 16 kHz en mono, con remuestreo automático.

## Capacidades

- Reconocimiento de voz árabe multidioma: MSA y dialectos del Golfo, egipcio, levantino y magrebi.
- Transcripción de audio a texto en tiempo real sobre CPU, sin necesidad de GPU.
- Robustez en audio real: mejor rendimiento en habla de difusión (broadcast), conversacional y en MSA/dialectos del Golfo.
- Manejo de audio ruidoso con degradación moderada (WER 23,65 % en MASC noisy).
- Inferencia eficiente: checkpoint único de ~0,4 GB, cargable con pocas líneas de código en NVIDIA NeMo.
- No soporta tool calling, agentes ni razonamiento multi-paso, al ser un modelo ASR puro.

## Casos de uso

- **Transcripcion de reuniones y conferencias en arabe**: el modelo puede transcribir conversaciones multidioma en tiempo real desde un portatil sin GPU, gracias a su inferencia en CPU y su cobertura de dialectos del Golfo y levantino, habituales en entornos corporativos de la region.
- **Subtitulado automatico de contenido audiovisual**: su buen rendimiento en habla de difusion (WER 14,33 % en MGB-2) lo hace adecuado para generar subtitulos de noticias, programas de television y contenido de video en arabe.
- **Atencion al cliente automatizada (IVR)**: integrable en sistemas de respuesta de voz interactiva para transcribir llamadas de clientes en distintos dialectos arabes, con latencia real y sin coste de GPU por llamada.
- **Asistentes de voz en dispositivos edge**: su tamano compacto (~115M parametros, ~0,4 GB) permite desplegarlo en dispositivos con recursos limitados, como routers, smart speakers o kioscos, para comandos de voz en arabe.
- **Analisis de llamadas de call centers**: transcripcion de conversaciones para analisis posterior de sentimiento, deteccion de intenciones o cumplimiento normativo, con capacidad de procesamiento en lote sobre CPU.
- **Accesibilidad para personas con discapacidad auditiva**: generacion de transcripciones en tiempo real de conversaciones, clases o eventos en arabe, ejecutable en hardware de bajo coste.
- **Transcripcion de contenido magrebi**: aunque el WER en el conjunto Casablanca es alto (58,24 %), el modelo ofrece una base util para tareas de transcripcion de arabe marroqui cuando no hay alternativas especificas.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en el *Open Universal Arabic ASR Leaderboard* (WER %, menor es mejor):

| Conjunto de datos | WER (%) |
|---|---|
| Media de 6 conjuntos (leaderboard) | 25,08 |
| MASC (limpio) | 7,27 |
| Common Voice 18 (arabe) | 9,74 |
| MGB-2 | 14,33 |
| MASC (ruidoso) | 23,65 |
| SADA | 37,28 |
| Casablanca | 58,24 |

El modelo ocupa el **puesto #2 de 36 sistemas** en el leaderboard, superando a todos los modelos evaluados excepto uno, incluyendo sistemas de 2B a 30B de parametros que son entre 17 y 250 veces mas grandes.

## Requisitos de hardware

- **VRAM**: no requiere GPU; inferencia en CPU en tiempo real.
- **GPU recomendadas**: ninguna necesaria; opcionalmente cualquier GPU con soporte NeMo para aceleracion.
- **Consumer GPU**: no aplica, ya que funciona en CPU; en caso de usarse GPU, cualquier modelo moderno (RTX 3060 o superior) seria mas que suficiente.
- **Tamano del checkpoint**: ~0,4 GB en un unico archivo `.nemo`.
- **Opciones de despliegue**: NVIDIA NeMo (runtime principal); no se mencionan adaptaciones a vLLM, llama.cpp, Ollama ni TGI.
- **Latencia**: tiempo real en CPU, segun el autor; no se proporcionan cifras de throughput especificas.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | WER medio (leaderboard) | Licencia |
|---|---|---|---|---|
| **lemura-arabic-asr-lite** | ~115M | FastConformer-CTC | 25,08 % (puesto #2 de 36) | CC-BY-4.0 |
| **lemura-arabic-asr-qwen3** (hermano) | no disponible | LLM-based (Qwen3) | no disponible | no disponible |
| Modelo #1 del leaderboard | no disponible | no disponible | < 25,08 % | no disponible |

El modelo hermano **lemura-arabic-asr-qwen3** es una alternativa basada en LLM con cobertura dialectal amplia, pero no se dispone de sus metricas ni parametros en la informacion proporcionada. El modelo #1 del leaderboard no esta identificado en los datos disponibles.

## Limitaciones y advertencias

- **Rendimiento desigual entre dialectos**: el WER en el conjunto Casablanca (arabe marroqui) es del 58,24 %, muy superior a la media, lo que indica una cobertura debil del dialecto magrebi en comparacion con MSA y dialectos del Golfo.
- **Sensibilidad al ruido**: el WER pasa del 7,27 % en MASC limpio al 23,65 % en MASC ruidoso, una degradacion significativa que debe tenerse en cuenta en entornos acusticos adversos.
- **Alucinacion**: al ser un modelo CTC discriminativo, el riesgo de alucinacion es menor que en modelos generativos, pero puede producir inserciones o sustituciones en audio ambiguo o de baja calidad.
- **Licencia CC-BY-4.0**: permite uso comercial con atribucion; es necesario verificar los requisitos de atribucion en productos derivados.
- **Formato propietario**: el checkpoint se distribuye en formato `.nemo`, lo que limita su uso al ecosistema NVIDIA NeMo; no se ofrecen conversiones a ONNX, TensorRT u otros formatos en la informacion disponible.
- **Sin soporte multilingue fuera del arabe**: el modelo esta especializado exclusivamente en arabe y sus dialectos; no transcribe otros idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lemuralabs/lemura-arabic-asr-lite
- Demo en vivo: https://huggingface.co/spaces/lemuralabs/lemura-arabic-asr-demo
- Modelo hermano (LLM-based): https://huggingface.co/lemuralabs/lemura-arabic-asr-qwen3
- Leaderboard Open Universal Arabic ASR: https://github.com/Natural-Language-Processing-Elm/open_universal_arabic_asr_leaderboard
- Organizacion Lemura Labs: https://huggingface.co/lemuralabs
