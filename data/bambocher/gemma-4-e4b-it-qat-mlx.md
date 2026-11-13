# bambocher/gemma-4-E4B-it-qat-mlx

## Resumen

Gemma 4 E4B es un modelo multimodal de Google (familia Gemma 4) entrenado con quantization-aware training (QAT) para la rejilla q4_0 de llama.cpp. Esta ficha describe la conversión a MLX publicada por el usuario bambocher, que reproduce fielmente esa rejilla de cuantización dentro del ecosistema MLX de Apple, manteniendo el decodificador de texto en 4 bits sobre los mismos códigos que el GGUF oficial de Google y elevando a 8 bits las 114 capas lineales más sensibles.

El modelo cubre texto, visión y audio en un único checkpoint, con un total de 10.482.395.982 parámetros en pesos safetensors y un repositorio de 6,1 GB. La conversión persigue un objetivo técnico concreto: preservar la fidelidad respecto a los pesos maestros bf16 de Google sin alejarse de la rejilla para la que se entrenó el QAT, algo que las conversiones MLX habituales (que recalculan mínimos y máximos por grupo o usan grupos de 64) no consiguen.

Es relevante ahora porque demuestra que es posible ejecutar en hardware Apple Silicon un modelo multimodal de ~10B con cuantización alineada al entrenamiento, obteniendo 34,9 tokens/s en decodificación en un MacBook Air M5 y una perplejidad de 41,9 en wikitext-2, inferior a la de la alternativa de mlx-community (45,4) y prácticamente igual a la de los pesos maestros bf16 (42,4).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (decodificador de texto + torres de visión y audio); detalles internos no disponibles |
| Parametros totales | 10.482.395.982 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afín grupo 32 en 228 capas lineales del decodificador (rejilla q4_0), 8 bits en 114 capas lineales seleccionadas, embeddings a 6 bits, torres de visión y audio a 8 bits, normas sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es google/gemma-4-E4B-it-qat-q4_0-unquantized, la versión maestra de los pesos que Google entrenó con quantization-aware training para la rejilla q4_0 de llama.cpp. La conversión a MLX explota una equivalencia matemática: la cuantización afín de 4 bits con grupo 32 de MLX almacena `scale·q + bias`, y con `scale = d` y `bias = -8d` reproduce exactamente la rejilla de q4_0. De este modo, 228 capas lineales del decodificador de texto conservan bloque a bloque los mismos códigos y escalas que el GGUF oficial, con la única diferencia del redondeo de la escala de fp16 a bf16 (inferior a 1/64 de paso por peso).

Sobre esa base se aplica una selección medida de capas a 8 bits: cada capa lineal de texto se evaluó individualmente por la divergencia KL que elimina respecto a los pesos maestros bf16, normalizada por MB añadido, y las 114 mejores caben en +100 MB. Se trata mayoritariamente de puertas de entrada y proyecciones por capa (60) y proyecciones de atención (53), más una capa MLP. Los embeddings se mantienen a 6 bits (equivalente al Q6_K del GGUF), y las torres de visión y audio, que no recibieron QAT, se conservan a 8 bits. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo original.

## Capacidades

- Generación de texto conversacional con plantilla de chat instruct.
- Comprensión de imágenes: identifica y describe el contenido de fotografías (verificado por el autor con una prueba de reconocimiento de animales).
- Transcripción de audio a través de la torre de audio.
- Razonamiento y respuesta multi-turno en formato conversacional.
- Soporte multimodal combinado imagen-texto-a-texto (pipeline image-text-to-text).
- Etiqueta "mtp" en el repositorio, que sugiere soporte de multi-token prediction; el alcance exacto no está documentado en la información disponible.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en Mac: el modelo responde en formato chat y cabe en 5,95 GB, por lo que puede ejecutarse íntegramente en un portátil Apple Silicon con mlx-lm sin conexión a servicios externos.
- Descripción y etiquetado de imágenes en lotes: la torre de visión a 8 bits permite procesar fotografías para generar pies de foto o metadatos descriptivos en flujos de gestión de activos digitales.
- Transcripción de audio en local: la torre de audio posibilita convertir voz a texto dentro de aplicaciones de notas o accesibilidad sin enviar datos a la nube, con la ventaja de privacidad que implica.
- Prototipado de aplicaciones multimodales en MLX: al estar en safetensors y la librería mlx, se integra directamente en el ecosistema de Apple para experimentar con pipelines imagen-texto y audio-texto.
- Evaluación de técnicas de cuantización: el repositorio incluye scripts (qat_aligned_convert.py, qat_sensitivity.py, qat_eval.py) que sirven como referencia para reproducir conversiones alineadas a QAT en otros tamaños de la familia Gemma 4.
- Inferencia de bajo consumo en entornos de desarrollo: con 34,9 tokens/s en un MacBook Air M5, es adecuado para asistentes de código o documentación que requieran respuestas interactivas sin GPU dedicada.
- Despliegue en estaciones de trabajo Apple para tareas de análisis de documentos con imágenes y audio combinados, aprovechando el contexto multimodal en un único checkpoint.

## Benchmarks y rendimiento

| Modelo | Tamano | PPL (wikitext-2) | KL vs maestro QAT | Top-1 agree |
|---|---|---|---|---|
| Maestro QAT bf16 (google/gemma-4-E4B-it-qat-q4_0-unquantized) | — | 42,4 | — | — |
| Este modelo (bambocher/gemma-4-E4B-it-qat-mlx) | 5,95 GB | 41,9 | 0,026 | 92,5 % |
| mlx-community/gemma-4-E4B-it-qat-4bit | 6,80 GB | 45,4 | 0,055 | 89,0 % |

| Build | Tokens/s (MacBook Air M5, mlx-lm, decodificación) |
|---|---|
| Este modelo | 34,9 |
| mlx-community/gemma-4-E4B-it-qat-4bit | 26,0 |
| GPTQ JANG anterior (sustituido) | 33,6 |

La perplejidad se midió sobre wikitext-2 (test), con 128 ventanas de 512 tokens y BOS al inicio de cada una. La divergencia KL y la concordancia top-1 se calculan frente a los pesos maestros bf16. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: 5,95 GB de pesos en el repositorio; en la práctica se necesita algo más para el contexto y los buffers de inferencia, por lo que se recomienda un mínimo de 8 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (probado en MacBook Air M5); no se documenta soporte para GPU NVIDIA o AMD en esta conversión MLX.
- Cabe en hardware de consumo: sí, en equipos Apple Silicon con 8 GB o más de memoria unificada.
- Opciones de despliegue: mlx-lm (librería declarada del repositorio); no se mencionan vLLM, llama.cpp, Ollama ni TGI para estos pesos.
- Latencia y throughput: 34,9 tokens/s en decodificación sobre MacBook Air M5, un 34 % más rápido que la build de mlx-community y ligeramente superior a la build GPTQ anterior.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL wikitext-2 | Licencia | Formato |
|---|---|---|---|---|---|
| bambocher/gemma-4-E4B-it-qat-mlx | 10.482.395.982 | no disponible | 41,9 | Apache 2.0 | safetensors (MLX) |
| mlx-community/gemma-4-E4B-it-qat-4bit | no disponible | no disponible | 45,4 | Apache 2.0 | MLX |
| google/gemma-4-E4B-it-qat-q4_0-unquantized (maestro) | no disponible | no disponible | 42,4 | Apache 2.0 | safetensors |
| google/gemma-4-E4B-it-qat-q4_0-gguf | no disponible | no disponible | no disponible | Apache 2.0 | GGUF |

La comparación se limita a variantes del mismo modelo base; no se dispone de datos de benchmarks estándar ni de especificaciones de contexto para contrastar con alternativas de otros fabricantes.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos ni evaluaciones de seguridad del modelo original.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones específicas de fidelidad factual para esta conversión.
- La longitud de contexto, los idiomas soportados y las capacidades de tool calling no están documentados en la información disponible, lo que dificulta planificar su uso en producción.
- La licencia Apache 2.0 permite uso comercial, pero al derivar de Gemma 4 conviene revisar los términos de la licencia del modelo base de Google por si imponen condiciones adicionales.
- Las torres de visión y audio no fueron entrenadas con QAT y se mantienen a 8 bits; su fidelidad respecto al modelo original no se ha cuantificado con métricas publicadas.
- El rendimiento medido corresponde a un único dispositivo (MacBook Air M5); no hay datos de latencia o throughput en otros equipos.
- El repositorio tiene un uso muy bajo (74 descargas, 0 likes), por lo que la validación por parte de la comunidad es escasa.
- Al ser una conversión no oficial, los pesos y la configuración son versiones modificadas del original, no los archivos de Google.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/gemma-4-E4B-it-qat-mlx
- Modelo base (maestro QAT): https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-unquantized
- Modelo original no QAT: https://huggingface.co/google/gemma-4-E4B-it
- GGUF oficial q4_0: https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-gguf
- Alternativa de mlx-community: https://huggingface.co/mlx-community/gemma-4-E4B-it-qat-4bit
- Código y notas del método: https://github.com/rromenskyi/quant-ternary/tree/main/gemma4-quant
