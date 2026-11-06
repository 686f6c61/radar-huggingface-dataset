# LuoYiSULIXAY/omni-asr-lao-H

## Resumen

omni-asr-lao-H es un modelo de reconocimiento automático del habla (ASR) especializado en lao (ພາສາລາວ), desarrollado por VILAIPHONE Sulixay, Savath Saypadith, Makmeephon Xaysana y SOUNAKHEN Phonesavanh (CEIT), con el apoyo de Laligence. Se trata de un ajuste fino del modelo multimodal facebook/omniASR-LLM-7B de Meta, en el que únicamente se ha adaptado el decodificador LLM mientras el codificador de voz permanece congelado. El resultado es, según sus autores, el modelo más preciso de su proyecto de ASR en lao hasta la fecha.

El modelo resuelve un problema clásico de las lenguas de bajos recursos: la escasez de datos transcritos de calidad. Para ello combina 30,4 horas de habla real en lao (lectura y reuniones formales revisadas por hablantes nativos) con 106,9 horas de habla sintética generada mediante clonación de voz (VoxCPM2), lo que eleva el total a unas 137 horas de entrenamiento. Está pensado para investigación, accesibilidad, borradores de subtitulado y recopilación de datos, siempre con revisión humana en contextos sensibles.

Con 7,8 mil millones de parámetros y un peso de 15,6 GB en bf16, el modelo se distribuye bajo licencia Apache-2.0 y requiere aproximadamente 16 GB de VRAM para inferencia. Su ventana de procesamiento por clip es de hasta 40 segundos, por lo que las grabaciones largas deben segmentarse previamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal ASR (codificador de voz congelado + decodificador LLM ajustado), basado en facebook/omniASR-LLM-7B |
| Parámetros totales | 7,8 mil millones (7.8B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | clips de hasta 40 segundos por inferencia; contexto de texto no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bf16) |
| Idiomas soportados | lao (lo, escritura Lao) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (bf16, 15,6 GB), mismo layout que `omniASR-LLM-7B.pt`; tokenizador `omniASR_tokenizer_v7.model` (88 KB) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Omnilingual ASR de Meta, que combina un codificador de voz con un decodificador basado en LLM. En este ajuste fino, el codificador de voz se mantiene congelado y solo se entrena el decodificador LLM, lo que reduce drásticamente el coste computacional del ajuste. El entrenamiento se realizó con la receta de fairseq2 del repositorio omnilingual-asr: 5.000 pasos, acumulación de gradiente de 4, tasa de aprendizaje de 1e-5, distribuido en 2 GPU con FSDP y una duración aproximada de 3 horas y 47 minutos. Los dos fragmentos FSDP se fusionaron en un único archivo; según los autores, en 20 clips de prueba el archivo fusionado produce la misma salida que el checkpoint de entrenamiento.

Los datos de entrenamiento combinan cuatro fuentes: 15,4 horas de habla leída en lao (laoCorectVoice) con transcripciones humanas y hablantes del norte, centro y sur de Laos; 15,0 horas de habla leída pública (hg_shunya, incluido FLEURS); 5,0 horas de reuniones en lao extraídas de vídeos públicos y revisadas por hablantes nativos (3.031 clips, cada etiqueta verificada); y 106,9 horas de habla sintética generada con clonación de voz (VoxCPM2) a partir de frases de noticias y textos legales, usando únicamente voces de hablantes del conjunto de entrenamiento. Las transcripciones se normalizaron a unas reglas ortográficas concretas (ຳ en lugar de ໍາ; ໜ, ໝ, ຫຼ en lugar de ຫນ, ຫມ, ຫລ salvo abreviaturas como ທຫລ; colapso de marcas repetidas; desarrollo de ໆ). No se publican los audios ni las etiquetas de los vídeos públicos, y ningún clip de los conjuntos de evaluación aparece en entrenamiento.

## Capacidades

- Transcripción de voz a texto en lao para clips de hasta 40 segundos de duración.
- Reconocimiento de habla leída y de reuniones formales con buena precisión (CER de 7,55 en el conjunto meeting2 y 2,37 en test_blind, tras normalización).
- Manejo de hablantes de distintas regiones de Laos (norte, centro y sur) gracias a la composición del corpus de entrenamiento.
- Salida con separación de palabras en lao y conservación de algunas grafías antiguas (por ejemplo ໍາ), que el usuario debe normalizar si necesita las reglas modernas.
- Procesamiento por lotes (`batch_size`) mediante la pipeline de omnilingual-asr.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción.
- No se documenta soporte multilingüe: el modelo está especializado exclusivamente en lao.

## Casos de uso

- Subtitulado y captioning de reuniones formales en lao: el modelo logra un CER de 7,55 en el conjunto meeting2 (1.529 clips de tres vídeos de reuniones formales), lo que lo hace adecuado para generar borradores de subtítulos que después revise un hablante nativo.
- Investigación en ASR de bajos recursos: sirve como referencia y punto de partida para experimentos con lao, al estar construido sobre la receta fairseq2 de omnilingual-asr y publicarse con licencia Apache-2.0.
- Accesibilidad para contenido audiovisual en lao: transcripción de material educativo, institucional o divulgativo para generar texto accesible, segmentando previamente las grabaciones largas con VAD (por ejemplo Silero VAD).
- Recopilación y anotación de datos: el modelo puede usarse para preetiquetar nuevos clips de lao que luego revisan anotadores nativos, tal como hicieron los propios autores con parte de las referencias de meeting2.
- Archivado y búsqueda de grabaciones: transcripción de archivos de audio de reuniones o entrevistas para habilitar búsqueda por texto sobre el contenido hablado.
- Evaluación comparativa de modelos ASR en lao: al publicar métricas CER y WER de sílabas sobre conjuntos definidos, permite comparar de forma reproducible con la base omniASR-LLM-7B y con qwen3-asr-lao-H.
- Prototipado de asistentes de voz en lao: integración en pipelines de reconocimiento de voz para aplicaciones de dictado o atención al cliente, siempre con revisión humana cuando la precisión sea crítica.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente). CER calculado sin espacios y tras normalizar referencia y salida a las reglas ortográficas indicadas.

| Conjunto de prueba | Clips | Dominio | omni-asr-lao-H | omniASR-LLM-7B (base) | qwen3-asr-lao-H |
|---|---:|---|---:|---:|---:|
| meeting2 | 1.529 | reuniones formales en lao (3 vídeos) | **7,55** | 9,00 | 8,77 |
| test_blind | 247 | mixto; transcrito sin mostrar salidas de modelo | 2,37 | no disponible | 2,56 |

Métricas adicionales declaradas para meeting2: WER por sílabas de 11,28. Según los autores, en meeting2 el modelo mejora en 1,45 puntos de CER al modelo base (IC bootstrap del 95 %: 0,96–2,12) y en 1,23 puntos a qwen3-asr-lao-H (IC: 0,91–1,54). Los clips de test_blind se seleccionaron con un modelo anterior, por lo que las diferencias en ese conjunto no son significativas.

## Requisitos de hardware

- VRAM estimada: aproximadamente 16 GB libres de GPU para inferencia en bf16 (pesos de 15,6 GB más overhead).
- GPU recomendadas: no se especifican modelos concretos; cualquier GPU con al menos 16 GB de memoria libre, como A100, H100 o RTX 4090, debería ser suficiente para la inferencia en bf16.
- ¿Cabe en GPU de consumo? Sí, en tarjetas con 16 GB o más de VRAM (por ejemplo RTX 4090, RTX 4080 Super, o GPUs de 24 GB como la RTX 3090/4090). No se documenta funcionamiento en GPUs de 8–12 GB.
- Opciones de despliegue: pipeline `ASRInferencePipeline` de la librería `omnilingual-asr` (que incluye fairseq2), con registro del checkpoint mediante `setup_card.py` y la variable `FAIRSEQ2_USER_ASSET_DIR`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Los autores solo indican que el modelo es más lento que qwen3-asr-lao-H.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | CER meeting2 | CER test_blind | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| omni-asr-lao-H | 7,8B | lao | 7,55 | 2,37 | Apache-2.0 | Hugging Face (LuoYiSULIXAY/omni-asr-lao-H) |
| omniASR-LLM-7B (base, Meta) | 7B (aprox., no confirmado) | multilingüe (incluye lao) | 9,00 | no disponible | Apache-2.0 | Hugging Face (facebook/omniASR-LLM-7B) |
| qwen3-asr-lao-H | no disponible | lao | 8,77 | 2,56 | no disponible | Hugging Face (LuoYiSULIXAY/qwen3-asr-lao-H) |

El modelo base omniASR-LLM-7B es la referencia directa: omni-asr-lao-H lo supera en 1,45 puntos de CER en meeting2 gracias al ajuste del decodificador. qwen3-asr-lao-H es la alternativa "más pequeña y rápida" del mismo proyecto, con 1,23 puntos de CER peor en meeting2 y una diferencia no significativa en test_blind.

## Limitaciones y advertencias

- Entrenado mayoritariamente con habla leída y reuniones formales; se espera un error mayor en conversación casual, acentos regionales fuertes, hablantes solapados, música o ruido.
- Los errores más frecuentes se producen en texto lao mezclado con palabras en tailandés o inglés, nombres propios y de lugares, y números.
- Parte de las referencias de meeting2 fueron creadas por revisores que editaron un borrador de modelo, y este modelo se usó después para etiquetar nuevos clips; las diferencias pequeñas entre modelos en meeting2 deben interpretarse con cautela.
- Solo se adaptó el decodificador LLM; el codificador de voz es el original de Meta.
- El modelo emite algunas grafías antiguas (ໍາ) y separa palabras con espacios; para comparar con las métricas publicadas hay que aplicar la normalización ortográfica indicada (ຳ, ໜ, ໝ, ຫຼ, colapso de marcas, desarrollo de ໆ).
- Procesa clips de hasta 40 segundos; las grabaciones más largas deben dividirse en pausas (por ejemplo con Silero VAD).
- Licencia Apache-2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base y de los datos subyacentes.
- Uso previsto restringido por los autores: no debe emplearse para identificar o vigilar personas ni como único registro en contextos legales, médicos u otros de alto riesgo.
- Riesgo de alucinación y de errores de transcripción inherente a los modelos ASR; se recomienda revisión humana cuando la precisión sea crítica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LuoYiSULIXAY/omni-asr-lao-H
- Modelo base: https://huggingface.co/facebook/omniASR-LLM-7B
- Alternativa más rápida del mismo proyecto: https://huggingface.co/LuoYiSULIXAY/qwen3-asr-lao-H
- Repositorio omnilingual-asr (fairseq2): https://github.com/facebookresearch/omnilingual-asr
