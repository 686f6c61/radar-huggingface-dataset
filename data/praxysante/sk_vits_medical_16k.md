# PraxySante/SK_VITS_medical_16k

## Resumen

SK_VITS_medical_16k es un modelo de síntesis de voz (text-to-speech) de un solo hablante para eslovaco, desarrollado por PraxySante y entrenado desde cero con la arquitectura VITS del framework Coqui TTS. El modelo opera a 16 kHz en mono y trabaja a nivel de grafema, sin fonemizador ni léxico fonético intermedio, lo que simplifica el pipeline de inferencia pero limita la normalización textual a los caracteres vistos en entrenamiento.

El modelo se presenta como especializado en habla médica y científica, aunque el corpus declarado en la model card corresponde a un directorio de datos parlamentarios eslovacos (`data_parl/sk`). Cubre 42.680 clips con una duración total de 296,86 horas y una duración media de 25,04 segundos por clip, entrenado durante 100.000 pasos con selección del mejor checkpoint por pérdida de evaluación (paso 52.026).

Su relevancia es acotada: se trata de un modelo recién publicado, sin descargas ni valoraciones, con métricas de evaluación muy pobres (CER del 83,79 % y WER del 96,05 % sobre 10 utterances sintéticas juzgadas por un ASR propio). Resulta útil como referencia de entrenamiento VITS en eslovaco y como base experimental, no como solución lista para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS), extremo a extremo, sin fonemizador |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de 60 caracteres a nivel de grafema) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | eslovaco (sk) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`best_model.pth`, checkpoint publicado como `model.pth`), más `config.json` y `speakers.pth` |

## Arquitectura y entrenamiento

VITS es un modelo generativo extremo a extremo que combina un encoder de texto, un prior normalizing flow, un decoder basado en HiFi-GAN y un discriminador adversarial multiperiodo, con alineamiento monotónico aprendido (MAS) para evitar dependencia de alineamientos externos. En esta implementación de Coqui TTS se prescinde del fonemizador: la entrada es directamente una secuencia de grafemas de hasta 60 caracteres, con puntuación restringida a `. , ? !` y un alfabeto idéntico al observado en entrenamiento. La frecuencia de muestreo es de 16 kHz en mono y el modelo es de un único hablante.

El entrenamiento se realizó desde cero durante 100.000 pasos sobre 42.680 clips (296,86 horas, duración media de 25,04 s), con selección del checkpoint por menor pérdida de evaluación en el paso 52.026, no por el último paso. Las transcripciones provienen de un sistema ASR, lo que introduce errores en nombres de fármacos y abreviaturas poco frecuentes. No se documenta el uso de RLHF, DPO ni ajuste por preferencias; tampoco se detalla la composición exacta del dataset más allá de la ruta del corpus. Un detalle técnico relevante: el script de entrenamiento amplía la tabla de embeddings de texto en una fila (el tokenizador cuenta `<PAD>` pero los ids empiezan en 1), por lo que es necesario redimensionar `text_encoder.emb` antes de cargar el checkpoint.

## Capacidades

- Síntesis de voz a partir de texto en eslovaco a 16 kHz, mono, un solo hablante.
- Entrada a nivel de grafema con un máximo de 60 caracteres por utterance y puntuación limitada a `. , ? !`.
- Generación de audio en formato WAV mediante `TTS.utils.synthesizer.Synthesizer`.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión ni audio de entrada.
- Capacidad multilingüe limitada al eslovaco; no se declaran otros idiomas.
- No incorpora normalización textual: números y abreviaturas deben expandirse manualmente antes de la síntesis.

## Casos de uso

- Lectura de informes clínicos en eslovaco: el modelo puede convertir texto médico en audio para revisión manos libres, aunque requiere expansión previa de abreviaturas y nombres de fármacos por la falta de normalización y los errores heredados del ASR de transcripción.
- Prototipado de asistentes de voz en eslovaco: sirve como base para experimentar con pipelines TTS en un idioma con pocos recursos, integrándose vía Coqui TTS en un servicio HTTP propio.
- Generación de material de accesibilidad: conversión de documentación científica eslovaca a audio para personas con discapacidad visual, con la salvedad de validar la inteligibilidad por las métricas de CER/WER reportadas.
- Investigación en TTS de bajo recursos: reproducible como referencia de entrenamiento VITS desde cero con corpus parlamentario eslovaco y evaluación con ASR propio.
- Aumento de datos para ASR: generación de utterances sintéticas en eslovaco para ampliar corpus de entrenamiento de reconocimiento de voz, siempre que se filtre la calidad por la baja fidelidad reportada.
- Demostraciones y pruebas de concepto: verificación de integración de Coqui TTS con checkpoints personalizados, incluido el redimensionado de la tabla de embeddings necesario para cargar `model.pth`.

## Benchmarks y rendimiento

Evaluación declarada por el autor sobre 10 utterances sintéticas, juzgadas por un modelo ASR en streaming interno:

| Métrica | Valor |
|---|---|
| CER | 83,79 % |
| WER | 96,05 % |

El propio autor advierte que estas cifras son cotas superiores: el ASR juez es imperfecto sobre habla médica espontánea, por lo que parte del error corresponde al evaluador y no al TTS. No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 1,0 GB y el checkpoint VITS es de tamaño moderado, por lo que es probable que quepa en GPUs de consumo, aunque no se confirma en la documentación.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; por el tamaño del repo (1,0 GB) es plausible en RTX 3060 o superiores, pero debe validarse.
- Opciones de despliegue: Coqui TTS (`TTS.utils.synthesizer.Synthesizer`) con `model.pth`, `config.json` y `speakers.pth`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a esta arquitectura.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SK_VITS_medical_16k | eslovaco | VITS (Coqui TTS) | no disponible | 60 caracteres | Apache-2.0 | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de TTS en eslovaco en la documentación proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Métricas de calidad muy bajas: CER del 83,79 % y WER del 96,05 % sobre solo 10 utterances, lo que desaconseja su uso en producción sin una validación adicional exhaustiva.
- Las transcripciones provienen de un ASR, por lo que nombres de fármacos y abreviaturas pueden pronunciarse incorrectamente.
- No incorpora normalización textual: los números y abreviaturas deben expandirse manualmente antes de la síntesis.
- La similitud con el hablante está acotada por las grabaciones de origen; el modelo no clona una voz arbitraria.
- Entrada limitada a 60 caracteres y puntuación restringida a `. , ? !`; textos más largos deben segmentarse.
- Sesgos conocidos: no documentados, aunque el corpus parlamentario puede introducir un registro formal y vocabulario político poco representativo de otros dominios.
- Riesgo de alucinación acústica y artefactos en palabras fuera del vocabulario observado en entrenamiento.
- Licencia Apache-2.0 permite uso comercial, pero la calidad reportada hace necesario un análisis de riesgo antes de desplegarlo.
- Repositorio sin descargas ni valoraciones en el momento de la consulta; sin validación independiente por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/PraxySante/SK_VITS_medical_16k
- Coqui TTS (framework): https://github.com/coqui-ai/TTS
- Paper VITS: https://arxiv.org/abs/2106.06103
- No se han encontrado en la búsqueda web papers, blogs, repositorios o demos adicionales específicos de este modelo.
