# laion/Humaneness-Voice-Large-NotebookLM-Edition

## Resumen

Humaneness Voice Large — NotebookLM Edition es un modelo de síntesis de voz (text-to-speech) desarrollado por LAION, especializado en la generación de conversaciones de podcast entre dos hablantes a partir de un guion escrito y dos referencias de voz limpias. Se trata de un ajuste fino del modelo base Humaneness Voice Large 1.3 Alpha, sobre el que se aplica un entrenamiento completo de tres épocas con podcasts filtrados de dos hablantes, seguido de un ajuste fino de calidad con adapter LoRA de rango 64 (checkpoint "final 652"), ya fusionado en los pesos raíz a escala 1.

El modelo emplea la arquitectura Large MOSS Local Transformer: un transformer semántico de 36 capas de la familia Qwen3 con estados de 2.560 dimensiones, junto con un transformer acústico local de una capa de la misma anchura. Genera doce codebooks por cada trama acústica de 80 ms (150 índices de códec por segundo) y decodifica la salida a audio mono de 48 kHz mediante MOSS Audio Tokenizer v2. Cuenta con 4.129.990.144 parámetros y un repositorio de 8,5 GB.

Su relevancia radica en que produce el intercambio completo solicitado como una única secuencia acústica, en lugar de sintetizar cada turno por separado y unir los ficheros. Está orientado a la generación de podcasts multi-hablante con control de identidad de voz mediante referencias, y cubre inglés, alemán, francés y español en sus demostraciones de alta calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Large MOSS Local Transformer (transformer semántico Qwen3 de 36 capas, 2.560 dim; transformer acústico local de 1 capa) |
| Parametros totales | 4.129.990.144 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Hasta 60 segundos de conversación previa opcional como contexto; referencias de voz de 5,04 a 14,96 segundos |
| Tipos de cuantizacion | no disponible (solo validado en precisión completa sobre CUDA) |
| Idiomas soportados | en, de, fr, es (neerlandés presente en el primer ajuste completo pero no publicitado) |
| Licencia | cc-by-4.0 (pesos ajustados; el códec externo y los assets upstream conservan sus propios términos) |
| Formato de pesos | safetensors (custom_code, requiere trust_remote_code) |

## Arquitectura y entrenamiento

El modelo parte de Humaneness Voice Large 1.3 Alpha y se entrena en dos fases: un ajuste fino completo de tres épocas sobre podcasts filtrados de dos hablantes y, después, un ajuste fino de calidad con adapter LoRA de rango 64 (checkpoint final 652), fusionado en los pesos publicados a escala 1. La arquitectura combina un transformer semántico de 36 capas de la familia Qwen3 con estados de 2.560 dimensiones y un transformer acústico local de una sola capa de igual anchura; en cada trama de 80 ms se generan doce codebooks (150 índices de códec por segundo). La red y el tokenizador no se ampliaron para el enrutamiento de hablantes.

La generación se realiza sobre la secuencia acústica completa del diálogo, no por turnos independientes. La decodificación corre a cargo de MOSS Audio Tokenizer v2, que produce audio mono a 48 kHz. La configuración de muestreo de referencia es temperatura 1, top-p 0,95, top-k 50, penalización de repetición 1 y CFG 1. Las duraciones solicitadas y los cambios de hablante son instrucciones aprendidas, no restricciones duras ni ediciones forzadas de la forma de onda. El entorno probado (JUPITER) usó PyTorch 2.9.1 y Transformers 5.14.1 con Python 3.11 o superior.

## Capacidades

- Generación de voz multi-hablante: sintetiza un diálogo completo entre dos hablantes (S1 y S2) como una única secuencia acústica.
- Clonación de voz por referencia: cada hablante se define mediante un WAV limpio de un solo hablante de 5,04 a 14,96 segundos.
- Control de guion: acepta etiquetas alternas de hablante, direcciones de interpretación en inglés, palabras literales en el idioma solicitado y cues de duración y pausa.
- Contexto conversacional: admite hasta 60 segundos de conversación estrictamente anterior como contexto opcional.
- Salida de audio a 48 kHz mono mediante el códec MOSS-v2.
- Capacidades multilingües en inglés, alemán, francés y español (foco de las demostraciones de alta calidad).
- Generación estocástica con control por semilla.
- No dispone de tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo exclusivamente de texto a voz.

## Casos de uso

- Producción de podcasts sintéticos: a partir de un guion JSON con turnos alternos y dos referencias de voz, el modelo genera la conversación completa en un solo pase, lo que evita el empalme manual de fragmentos y preserva la coherencia prosódica entre turnos.
- Prototipado de contenido editorial en varios idiomas: el mismo guion puede renderizarse en inglés, alemán, francés o español, útil para doblar o adaptar material divulgativo a distintos mercados.
- Audiolibros dialogados y ficción sonora: las cues de duración y pausa y las direcciones de interpretación permiten ajustar el ritmo de escenas con dos personajes.
- Aumento de datos para investigación en TTS: la licencia CC BY 4.0 y la preservación de prompts y puntuaciones permiten generar corpus de voz etiquetados para entrenar o evaluar otros sistemas.
- Maquetas de locución para preproducción: equipos de vídeo o publicidad pueden generar una versión preliminar con voces de referencia autorizadas antes de contratar locución humana.
- Accesibilidad y contenido educativo: conversión de material escrito en formato de diálogo hablado para consumo auditivo, con control de dos identidades vocales diferenciadas.
- Evaluación comparativa de adapters y checkpoints: el modelo documenta su linaje y métricas escuchadas, lo que lo hace útil como referencia en estudios de calidad de voz.

## Benchmarks y rendimiento

Los datos disponibles provienen de una comparación congelada de 50 tareas y de la evaluación del adapter frente a su modelo padre con ajuste completo:

| Metrica | NotebookLM Edition (adapter) | Padre con ajuste completo |
|---|---|---|
| CE (cross-entropy) | 6,079 | 6,084 |
| Genuineness | 3,959 | 3,943 |
| WER medio por clip (ASR) | 11,44 % | 7,76 % |

El autor advierte que estas métricas no establecen una mejora automática global y que no miden la corrección de los cambios de hablante. El estudio de referencia de alta calidad usa texto nuevo e identidades del dominio de entrenamiento, por lo que es una demostración y no un benchmark con hablantes reservados. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, dado que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4.129.990.144 parámetros en precisión completa se requiere una GPU CUDA con memoria suficiente (orientativamente por encima de 16 GB solo para pesos, sin contar activaciones ni el códec).
- GPU recomendadas: no especificadas por el autor; el entorno probado fue JUPITER con PyTorch 2.9.1 y Transformers 5.14.1.
- GPU de consumo: no validado; la inferencia solo en CPU y otros modos de precisión no están validados.
- Opciones de despliegue: script de inferencia propio (`podcast_infer.py`) con `trust_remote_code`; requiere descargar aparte MOSS Audio Tokenizer v2. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Humaneness Voice Large — NotebookLM Edition | 4.129.990.144 | 60 s de contexto conversacional | en, de, fr, es | CC BY 4.0 | TTS multi-hablante de diálogo completo |
| Humaneness Voice Large 1.3 Alpha (padre) | no disponible | no disponible | no disponible | no disponible | TTS de un solo hablante (helper genérico) |
| MOSS TTS (familia base) | no disponible | no disponible | no disponible | no disponible | TTS con arquitectura MOSS Local Transformer |

No se dispone de datos suficientes en la información proporcionada para comparar parámetros, contexto o rendimiento con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- La generación es estocástica: duraciones y cambios de hablante son instrucciones aprendidas, no restricciones duras, por lo que la salida puede desviarse de lo solicitado.
- El WER medio por clip del adapter (11,44 %) es peor que el del padre con ajuste completo (7,76 %), lo que sugiere posibles degradaciones de inteligibilidad en algunos casos.
- Las métricas publicadas no miden la corrección de los cambios de hablante ni constituyen un benchmark con hablantes reservados.
- El neerlandés estuvo presente en el primer ajuste completo pero se excluyó del adapter de calidad por etiquetas poco fiables; su rendimiento no se publicita.
- Requiere `trust_remote_code`: es necesario inspeccionar el código suministrado antes de ejecutarlo.
- Solo se valida la inferencia en GPU CUDA con precisión completa; CPU y otras precisiones no están verificadas.
- Riesgo de suplantación: debe usarse únicamente con voces para las que se tenga permiso; el autor prohíbe la suplantación engañosa.
- Los pesos ajustados son CC BY 4.0, pero el códec externo, los assets del tokenizador y las grabaciones de origen conservan sus propios términos; revisar LICENSE y NOTICE.md.
- LAION no respalda las afirmaciones generadas ni las identidades de hablante producidas.
- Antes de cualquier uso en producción deben probarse calidad, precisión lingüística y estabilidad de hablante.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/laion/Humaneness-Voice-Large-NotebookLM-Edition
- Modelo base: https://huggingface.co/laion/Humaneness-Voice-Large-1.3-Alpha
- Códec MOSS Audio Tokenizer v2: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-v2
- Guía de prompting para podcast (PODCAST_PROMPTING.md, en el repo)
- Script de inferencia (podcast_infer.py, en el repo)
- Documentación de entrenamiento y linaje (TRAINING.md, en el repo)
- Comparación de adapters escuchada: https://laion-humaneness-voice-large-podcast-listening.static.hf.space/lora-comparison.html
