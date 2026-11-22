# GBP-DE/Qwen3.8-Flash-Next-oQ4e-WLSRefit-MTP

## Resumen

Qwen3.8-Flash-Next-oQ4e-WLSRefit-MTP es una cuantización de 4 bits del modelo Qwen3.8-Flash-Next de Qwen, publicada por el usuario GBP-DE. No se trata de un modelo entrenado desde cero, sino de una conversión de precisión reducida orientada específicamente a la inferencia en Apple Silicon mediante el runtime oMLX. El checkpoint incorpora técnicas de cuantización con conciencia de importancia (oQ4e), refinamiento por mínimos cuadrados ponderados (WLS Refit) y tratamiento guiado por matriz de importancia (iMatrix), además de conservar los pesos de Multi-Token Prediction (MTP) para decodificación acelerada.

El modelo base es un transformer de tipo Mixture of Experts (MoE) con aproximadamente 180.000 millones de parámetros totales, según los metadatos de safetensors del repositorio. La pipeline declarada es image-text-to-text, lo que indica capacidades multimodales de entrada de imagen y texto. El repositorio ocupa 271,6 GB y se distribuye en formato safetensors para la librería mlx.

Su relevancia actual radica en que permite ejecutar un modelo de gran tamaño y capacidades multimodales en hardware de Apple Silicon con memoria unificada, algo que las cuantizaciones estándar de GGUF o los formatos para GPU discreta no cubren de forma nativa. La ficha se centra en lo que la model card documenta explícitamente, marcando como no disponible todo aquello que el autor no publica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts), según el modelo base Qwen3.8-Flash-Next |
| Parametros totales | 179.999.981.459 (~180 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (oQ4e, con WLS Refit, iMatrix y tensores sin cuantizar en BF16) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (licencia "other" con nombre qwen-community-1.0) |
| Formato de pesos | safetensors (formato oMLX/oQ, no GGUF) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer con arquitectura de mezcla de expertos (MoE), según se desprende de la propia model card, que lo describe como "large MoE checkpoint". El checkpoint aquí publicado no ha sido entrenado: es una cuantización de 4 bits del modelo original, reconstruida con oMLX 0.8.0 el 19 de noviembre de 2026 y que sustituye a la build anterior del 1 de noviembre de 2026 realizada con oMLX 0.7.3.

La innovación técnica de esta conversión reside en el pipeline de cuantización. oQ4e aplica precisión variable con conciencia de importancia; WLS Refit emplea mínimos cuadrados ponderados para reducir el error de cuantización; iMatrix guía el tratamiento de los pesos según su importancia; y se conservan los pesos MTP (Multi-Token Prediction) para decodificación especulativa acelerada en runtimes compatibles. Los tensores no cuantizados se mantienen en BF16. El autor indica que una implementación anterior de WLS Refit se asoció a una reducción de divergencia KL de aproximadamente el 11-15 % en las evaluaciones de su cuantizador, pero advierte explícitamente que es un resultado histórico dependiente de la arquitectura y no una ganancia medida para este checkpoint concreto. No se documentan datos de entrenamiento, composición del dataset ni fases de RLHF o DPO, ya que corresponden al modelo base y no se detallan en esta model card.

## Capacidades

- Generación de texto y razonamiento de múltiples pasos, con modo de razonamiento extendido ("thinking time") medido en las pruebas locales del autor.
- Procesamiento de entrada multimodal imagen-texto, según la pipeline image-text-to-text declarada.
- Razonamiento analítico de formato largo: la model card documenta pruebas cualitativas en desafíos de razonamiento (Silbergrat Reasoning Challenge, 60 preguntas) y en investigación cuantitativa de trading (XAGUSD), con evaluación de coherencia lógica y manejo de incertidumbre.
- Decodificación acelerada mediante pesos MTP en runtimes oMLX compatibles.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada (el autor no declara lista de idiomas).

## Casos de uso

- Razonamiento analítico de formato largo en local: el modelo puede abordar ejercicios de razonamiento complejo con cadenas de pensamiento extensas (cientos de segundos de "thinking time" en las pruebas del autor), adecuado para investigación y análisis que requieran privacidad y ejecución en hardware propio.
- Análisis financiero y de mercados: la model card documenta su uso en un desafío de investigación cuantitativa sobre XAGUSD, generando hipótesis contrastables sin inventar afirmaciones de rentabilidad; encaja en flujos de research cuantitativo que necesiten exploración de hipótesis.
- Procesamiento de documentos con imagen y texto: al declarar pipeline image-text-to-text, puede emplearse para tareas que combinen capturas, diagramas o documentos escaneados con instrucciones textuales.
- Evaluación de evidencias y argumentación: las pruebas cualitativas destacan el manejo cuidadoso de incertidumbre y explicaciones competing, útil en revisión de informes o due diligence asistida.
- Inferencia privada en estación de trabajo Apple Silicon: con 128 GB de memoria unificada (configuración usada por el autor en un M5 Max) se puede ejecutar el modelo sin enviar datos a la nube, relevante para datos sensibles.
- Prototipado de asistentes conversacionales multimodales: la pipeline conversational y el soporte de imágenes permiten construir demos de chat que acepten capturas o figuras junto al texto.
- Investigación sobre cuantización: el checkpoint sirve como referencia para estudiar el impacto de oQ4e, WLS Refit e iMatrix frente a otras conversiones del mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo proporciona mediciones locales de velocidad y tiempo en un M5 Max con 128 GB de memoria unificada usando oMLX 0.8.0:

| Prueba | Prefill | Generación | Tiempo de razonamiento | Tiempo total |
|---|---:|---:|---:|---:|
| OBSIDIAN-40 | 745,1 tok/s | 80,1 tok/s | 382,2 s | 461,0 s |
| SILBERGRAT | 1.897,9 tok/s | 71,5 tok/s | 475,2 s | 625,5 s |

Como referencia, el checkpoint anterior cuantizado con oMLX 0.7.3 y medido con oMLX 0.7.4.dev1 generó 75,3 tok/s (OBSIDIAN-40) y 68,9 tok/s (SILBERGRAT). El autor advierte que las diferencias de versión de runtime y de prompt impiden atribuir la mejora únicamente a la cuantización.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 271,6 GB en disco; para inferencia en 4 bits se requiere memoria unificada suficiente para cargar los pesos y el contexto. El autor ejecutó las pruebas en un M5 Max con 128 GB de memoria unificada.
- GPU recomendadas: Apple Silicon con memoria unificada amplia (el autor cita M5 Max de 128 GB). No se documentan requisitos para GPU NVIDIA o AMD.
- ¿Cabe en GPU de consumo? No hay datos para GPU discreta de consumo; el formato está pensado para Apple Silicon con oMLX.
- Opciones de despliegue: runtime oMLX (versión 0.8.0 con la que se construyó el checkpoint). No es un modelo GGUF, por lo que no es compatible con llama.cpp, Ollama ni TGI de forma nativa.
- Latencia y throughput: según las mediciones del autor, prefill de 745-1.898 tok/s y generación de 71-80 tok/s en M5 Max de 128 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-oQ4e-WLSRefit-MTP (este) | ~180 mil millones (MoE) | no disponible | 4 bits oQ4e + MTP | qwen-community-1.0 | Hugging Face, formato oMLX |
| Qwen3.8-Flash-Next-oQ5e-WLSRefit-MTP | no disponible | no disponible | 5 bits oQ5e + MTP | qwen-community-1.0 | Hugging Face (build del mismo autor) |
| Qwen3.8-Flash-Next (base) | ~180 mil millones (MoE) | no disponible | BF16 original | qwen-community-1.0 | Hugging Face |

La comparativa se limita a variantes del mismo modelo base y a la build de 5 bits del mismo autor, únicos datos disponibles. No se dispone de información sobre modelos alternativos de otros desarrolladores con los que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Es una cuantización de 4 bits: introduce error respecto al modelo original, y el autor no ha establecido una ganancia de precisión consistente frente al checkpoint anterior.
- Requiere un runtime oMLX compatible (construido con 0.8.0); no funciona con llama.cpp, Ollama, vLLM ni TGI.
- Formato específico para Apple Silicon: no es desplegable en GPU NVIDIA/AMD sin reconversión.
- El autor reconoce que las salidas de sus pruebas "no están libres de errores" y que apareció una pequeña inconsistencia numérica en OBSIDIAN-40; las pruebas son individuales y no estandarizadas.
- No hay benchmarks estandarizados publicados, por lo que no se puede verificar el rendimiento frente a otras cuantizaciones o al modelo base.
- Riesgo de alucinación: no cuantificado en la información disponible; aplican los riesgos habituales de los modelos de lenguaje de gran tamaño.
- Sesgos conocidos: no documentados en la información proporcionada.
- Idiomas soportados: no declarados; no se puede garantizar cobertura multilingüe.
- Licencia qwen-community-1.0: es una licencia "other" con términos propios; deben revisarse las condiciones de uso comercial en el enlace de licencia antes de desplegar en producción.
- El repositorio se actualiza in-place: si se descargó una build anterior, hay que volver a descargar los archivos, ya que la URL no cambia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GBP-DE/Qwen3.8-Flash-Next-oQ4e-WLSRefit-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Build de 5 bits del mismo autor: https://huggingface.co/GBP-DE/Qwen3.8-Flash-Next-oQ5e-WLSRefit-MTP
- Runtime oMLX: https://github.com/jundot/omlx
- Notas de versión oMLX 0.8.0: https://github.com/jundot/omlx/releases/tag/v0.8.0
- Notas de versión oMLX 0.7.3: https://github.com/jundot/omlx/releases/tag/v0.7.3
