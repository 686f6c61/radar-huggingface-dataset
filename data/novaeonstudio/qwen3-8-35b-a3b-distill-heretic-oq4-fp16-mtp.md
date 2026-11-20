# NovaeonStudio/Qwen3.8-35B-A3B-Distill-Heretic-oQ4-fp16-mtp

## Resumen

Qwen3.8-35B-A3B-Distill-Heretic-oQ4-fp16-mtp es una variante ajustada en comportamiento y cuantizada del modelo empero-ai/Qwen3.8-35B-A3B-Distill, publicada por Novaeon.Studio. Se trata de un modelo de mezcla de expertos (MoE) de la familia Qwen3.5/3.6 con 35.951.822.704 parámetros totales y aproximadamente 3B activos por token, 256 expertos con 8 enrutados, 40 capas y una arquitectura híbrida que combina GatedDeltaNet con atención completa, además de un codificador de visión. El contexto nativo es de 262.144 tokens.

La particularidad de esta build es doble. Por un lado, aplica una edición direccional de pesos post-entrenamiento mediante una LoRA de rango 50 fusionada en el checkpoint original, orientada a reducir el comportamiento de rechazo del modelo base (de 98/100 solicitudes rechazadas a 2/100 en su conjunto de sondeo), manteniendo intactos el cabezal MTP nativo y la torre de visión. Por otro, se cuantiza con oMLX oQ4 (group size 64, escalas en float16), lo que deja el repositorio en unos 22,5 GB con aproximadamente 5,0 bits efectivos por peso.

Es relevante ahora porque ofrece un compromiso tamaño/calidad medido: según el autor, iguala a su build oQ8 en su suite interna con un 57 % del tamaño, conserva el cabezal MTP que acelera la decodificación y está empaquetado específicamente para Apple Silicon mediante MLX. Su uso previsto declarado es investigación y evaluación privada, no despliegue en producción sin una capa de seguridad propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida GatedDeltaNet + atención completa (familia Qwen3.5/3.6), con codificador de visión |
| Parametros totales | 35.951.822.704 |
| Parametros activos | ~3B (256 expertos, 8 enrutados) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | oMLX oQ4 (group size 64, escalas y pesos no cuantizados en float16, ~5,0 bpw efectivos); el autor descartó oQ2 por calidad insuficiente (13/43 en su suite) |
| Idiomas soportados | en (inglés, según la model card y los tags) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería mlx; requiere motor oMLX) |

## Arquitectura y entrenamiento

El modelo base es un MoE de la familia Qwen3.5/3.6 con 35B parámetros totales y unos 3B activos, 256 expertos con 8 enrutados por token, 40 capas y una combinación híbrida de capas GatedDeltaNet y capas de atención completa (10 capas de atención completa con 2 cabezas KV, según las notas de configuración del autor). Incluye además una torre de visión, lo que habilita la tarea image-text-to-text. El modelo base procede de destilar profesores Qwen3.8 en Qwen3.6-35B-A3B, según la model card.

Sobre ese checkpoint, Novaeon.Studio aplicó una edición de pesos post-entrenamiento buscada a lo largo de 60 ensayos (20 con arranque aleatorio) sobre las proyecciones de salida de atención: 30 `out_proj` de GatedDeltaNet y 10 `o_proj`. El ensayo elegido, en las capas 20 a 34, redujo los rechazos a 2/100 con una divergencia KL de 0,2481 frente al base (0,28 tras la fusión y la cuantización). La edición se exportó como LoRA de rango 50 y se fusionó con los pesos originales, preservando los 42 tensores `mtp.*` del cabezal MTP nativo y la torre de visión. La cuantización oQ4 se realizó con oMLX. No se dispone de información sobre el volumen de tokens de entrenamiento ni sobre la composición del dataset del modelo base.

## Capacidades

- Generación de texto conversacional en inglés, con soporte de modo thinking activable (`enable_thinking`).
- Razonamiento y aritmética: en la suite del autor, el modo sin thinking obtiene 2/6 en razonamiento, con un coste atribuido a la edición de pesos.
- Generación de código: 3/4 en la categoría de código de la suite interna.
- Tool calling y function calling: 11/11 en la suite del autor, sin degradación respecto al modelo original.
- Salida estructurada en JSON: 5/5 en la suite interna.
- Seguimiento de instrucciones: 5/6.
- Capacidades de contexto largo: 4/4 en pruebas de agujas (needles) con ventanas de 20 a 50k tokens.
- Abstención: 3/3, es decir, reconoce cuándo no debe responder.
- Capacidades multilingües limitadas: alemán 3/4 en la suite; el resto de idiomas no está evaluado y la model card solo declara inglés.
- Procesamiento de imagen y texto (pipeline image-text-to-text) gracias a la torre de visión preservada.
- Decodificación acelerada mediante cabezal MTP nativo (42 tensores `mtp.*`), con profundidad adaptativa recomendada.

## Casos de uso

- Investigación sobre comportamiento y seguridad de modelos: el modelo permite estudiar cómo una edición direccional de pesos altera las tasas de rechazo (98/100 a 2/100) con un coste medido de KL 0,248, en un entorno controlado y privado.
- Escritura de ficción y contenido creativo: el autor lo destina explícitamente a trabajo de texto y ficción donde el comportamiento de seguridad por defecto resulta demasiado restrictivo; se recomienda temperatura 0,7 y top_p 0,95.
- Investigación en seguridad ofensiva y defensiva: análisis de prompts límite (humor negro, juramentos, reducción de daños, lock-picking) que el modelo base rechazaba y esta variante acepta, siempre con una capa de seguridad propia.
- Evaluación comparativa de cuantizaciones en Apple Silicon: sirve para medir el impacto real de oQ4 frente a oQ8 en la misma suite (36/43 frente a 36/43 en la build editada), con velocidad de decodificación de 103-112 tok/s en un M5 Max.
- Procesamiento de documentos largos con imagen: gracias a los 262.144 tokens de contexto y a la torre de visión, puede usarse para extraer información de documentos escaneados o capturas con texto extenso, aunque el autor no lo recomienda como agente autónomo.
- Prototipado local en Mac: con 22,5 GB en disco y 32 GB de RAM sugeridos, permite ejecutar un MoE de 35B en un equipo de sobremesa Apple con un endpoint compatible con OpenAI en local (`http://127.0.0.1:8000/v1`).
- Generación de código asistida en local con tool calling: los 11/11 en tool calling y 3/4 en código lo hacen viable para tareas de autocompletado y llamadas a herramientas en un pipeline personal, no en producción desatendida.

## Benchmarks y rendimiento

Resultados de la suite interna del autor (43 casos deterministas más 17 casos de mitigación), medidos en un Apple M5 Max de 128 GB con oMLX, thinking desactivado y TurboQuant KV desactivado:

| Categoria | original oQ8 | edited oQ8 | edited oQ6 | edited oQ4 |
|---|---|---|---|---|
| Tool calling | 11/11 | 11/11 | 11/11 | 11/11 |
| JSON | 5/5 | 5/5 | 5/5 | 5/5 |
| Seguimiento de instrucciones | 6/6 | 5/6 | 5/6 | 5/6 |
| Alemán | 4/4 | 3/4 | 3/4 | 3/4 |
| Agujas en contexto largo | 4/4 | 4/4 | 4/4 | 4/4 |
| Razonamiento (sin thinking) | 3/6 | 2/6 | 2/6 | 2/6 |
| Abstención | 3/3 | 3/3 | 3/3 | 3/3 |
| Código | 4/4 | 3/4 | 2/4 | 3/4 |
| Total | 40/43 | 36/43 | 35/43 | 36/43 |
| Suite de mitigación | 16/17 | 14/17 | 12/17 | 14/17 |

Velocidad medida (M5 Max, oMLX):

| Métrica | original oQ8 | edited oQ4 |
|---|---|---|
| Decodificación, prompt corto | ~126-129 tok/s | 103-112 tok/s |
| Decodificación a 53k tokens de contexto | ~91-103 tok/s | 102-106 tok/s |
| Prefill en frío a 53k | 3.331 tok/s | 2.567 tok/s |
| 4 peticiones concurrentes, agregado | ~221 tok/s | 203 tok/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: unos 22,5 GB de pesos en disco en oQ4; el autor sugiere 32 GB de RAM o más en Apple Silicon.
- GPU recomendadas: Apple M5 Max de 128 GB (hardware de referencia del autor); no hay datos publicados para A100, H100 o RTX 4090, y el formato MLX no está pensado para CUDA.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada de 32 GB o superior; no se documenta soporte para GPUs de consumo NVIDIA.
- Opciones de despliegue: oMLX (motor recomendado, endpoint compatible con OpenAI en el puerto 8000), librería mlx; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 103-112 tok/s en decodificación con prompt corto y 203 tok/s agregados con 4 peticiones concurrentes en un M5 Max. El autor recomienda MTP activado con profundidad adaptativa (desactivarlo cuesta un 35 % de decodificación) y TurboQuant KV desactivado (+37 % de decodificación a 53k de contexto).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-35B-A3B-Distill-Heretic-oQ4-fp16-mtp | 35B totales / ~3B activos | 262.144 | Apache-2.0 | Hugging Face, formato MLX | Edición de comportamiento, 36/43 en suite del autor |
| empero-ai/Qwen3.8-35B-A3B-Distill (base) | 35B totales / ~3B activos | 262.144 | Apache-2.0 | Hugging Face | Sin edición de comportamiento; 40/43 en la misma suite |
| NovaeonStudio/Qwen3.8-35B-A3B-Distill-oQ8-fp16-mtp | 35B totales / ~3B activos | 262.144 | Apache-2.0 | Hugging Face, formato MLX | Build oQ8 de referencia del autor; mayor tamaño, misma puntuación editada (36/43) |

No se dispone de datos de benchmarks estándar para comparar con alternativas de otros fabricantes.

## Limitaciones y advertencias

- La edición de pesos degrada capacidades: el total de la suite cae de 40/43 a 36/43, con pérdidas en razonamiento (3/6 a 2/6), código (4/4 a 3/4), seguimiento de instrucciones (6/6 a 5/6) y alemán (4/4 a 3/4).
- El comportamiento de rechazo reducido (2/100) implica un riesgo elevado de generar contenido dañino; el autor exige aplicar una capa de seguridad propia antes de cualquier uso en producción.
- No debe usarse como agente autónomo con herramientas que produzcan efectos secundarios; el propio autor mantiene el modelo original como asiento por defecto para agentes.
- Riesgo de alucinación no cuantificado: no hay datos publicados de evaluaciones de factualidad.
- Idiomas: solo se declara inglés; el alemán se evalúa en la suite interna con 3/4 y el resto de idiomas no está cubierto.
- Licencia Apache-2.0: permite uso comercial, pero la model card restringe el uso previsto a investigación y evaluación privada, lo que conviene tener en cuenta.
- Dependencia del ecosistema MLX: no hay pesos GGUF ni soporte documentado para CUDA, vLLM o llama.cpp, lo que limita el despliegue fuera de Apple Silicon.
- La cuantización oQ2 se construyó y se descartó por calidad insuficiente (13/43), por lo que no existe una versión de 2 bits.
- Los benchmarks son internos del autor (43 casos), no estándar, y no permiten comparación directa con MMLU, HumanEval o GSM8K.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NovaeonStudio/Qwen3.8-35B-A3B-Distill-Heretic-oQ4-fp16-mtp
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill
- Build oQ8 del mismo autor: https://huggingface.co/NovaeonStudio/Qwen3.8-35B-A3B-Distill-oQ8-fp16-mtp
- Repositorio de oMLX: https://github.com/jundot/omlx
- Sitio del autor: https://novaeon.studio
