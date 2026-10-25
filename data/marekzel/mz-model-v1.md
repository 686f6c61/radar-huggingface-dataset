# marekzel/mz-model-v1

## Resumen

MzModelV1 es un modelo de lenguaje decoder-only de aproximadamente 110 millones de parámetros, desarrollado por el usuario marekzel y publicado en Hugging Face bajo licencia Apache-2.0. Se trata de un experimento de entrenamiento desde cero («from scratch») cuyo objetivo declarado es demostrar que es viable preentrenar y afinar un transformer de este tamaño en hardware de consumo: en concreto, una única GPU NVIDIA RTX 5060 Ti con 16 GB de VRAM durante unas 38 horas.

El modelo emplea una arquitectura transformer densa clásica (12 capas, dimensión oculta 768, 12 cabezas de atención, FFN de 3072, vocabulario de 32.000 tokens, embeddings posicionales aprendidos y weight tying entre entrada y salida). El entrenamiento se hizo en dos fases: preentrenamiento sobre el dataset Wikipedia Structured (unos 7,6 millones de artículos) y ajuste fino supervisado con 20.000 muestras de SmolTalk para dotarlo de capacidad conversacional básica. La longitud máxima de secuencia es de solo 512 tokens.

Su relevancia no está en el rendimiento —no hay benchmarks publicados y el modelo se distribuye explícitamente como experimental y «as is» para investigación— sino como referencia reproducible de un pipeline completo de entrenamiento y SFT en una sola GPU consumer, con un script de inferencia con interfaz gráfica publicado en GitHub. Es útil para docencia, prototipado rápido y como base de experimentos de ajuste fino, no para producción real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (denso) |
| Parámetros totales | 110.025.216 según safetensors; la model card declara 109,65 millones |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | No disponible (solo se publican pesos en safetensors; no hay GGUF ni versiones cuantizadas) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamaño del repo: 0,4 GB) |
| Dimensión oculta | 768 |
| Número de capas | 12 |
| Cabezas de atención | 12 |
| Dimensión feed-forward | 3.072 |
| Tamaño de vocabulario | 32.000 |
| Codificación posicional | Embeddings posicionales aprendidos |
| Activación | GELU |
| Normalización | LayerNorm |
| Weight tying | Sí (embeddings de entrada y proyección de salida) |
| Tipo de modelo en Transformers | `mz_model_v1` |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only convencional con atención multi-cabeza causal, sin variantes modernas como RoPE, RMSNorm, SwiGLU, atención lineal ni mezcla de expertos. Usa LayerNorm en lugar de RMSNorm, GELU como activación, embeddings posicionales aprendidos (limitados por diseño a 512 posiciones) y compartición de pesos entre el embedding de entrada y la cabeza de salida, lo que reduce el recuento efectivo de parámetros. Es, en la práctica, un diseño cercano a GPT-2 pequeño en concepto, pero con vocabulario mayor (32.000) y contexto mucho más corto (512 frente a 1.024).

El entrenamiento se realizó en dos etapas sobre una única RTX 5060 Ti de 16 GB durante aproximadamente 38 horas. La primera etapa fue preentrenamiento sobre Wikipedia Structured (7,6 millones de artículos); la segunda, un ajuste fino supervisado con 20.000 muestras de SmolTalk. No se documenta el número total de tokens procesados, la composición exacta del corpus, la mezcla de datos, el tokenizador utilizado ni si hubo etapas de RLHF, DPO o similares; la model card solo menciona «fine-tuning» sobre SmolTalk, lo que en la práctica equivale a SFT. Tampoco se detallan hiperparámetros (learning rate, batch size, precisión de entrenamiento). El tamaño del repositorio (0,4 GB para 110 M de parámetros) es coherente con pesos almacenados en fp32.

## Capacidades

- Generación de texto en inglés: continuaciones y respuestas cortas, condicionadas a un contexto máximo de 512 tokens.
- Conversación básica de un solo turno o turnos muy breves, gracias al ajuste con SmolTalk (20.000 muestras).
- Capacidad limitada de respuesta a instrucciones, derivada del SFT y no de un proceso de alineamiento con retroalimentación humana.
- No hay soporte documentado de tool calling ni function calling.
- No hay soporte documentado de agentes, planificación ni razonamiento multi-paso.
- No dispone de modo «thinking», visión, audio ni otras modalidades.
- Multilingüismo: no disponible; el modelo está etiquetado únicamente como inglés.
- Inferencia disponible mediante scripts propios de Transformers y una interfaz gráfica publicada en el repositorio de GitHub del autor.

## Casos de uso

- Prototipado de pipelines de generación de texto: sirve para validar extremo a extremo una integración con `transformers` (tokenización, generación, decodificación) con un modelo de 0,4 GB que se carga en segundos, antes de migrar a un modelo mayor.
- Modelo base para ajuste fino supervisado: con 110 M de parámetros, el entrenamiento completo cabe en una GPU consumer de 8-16 GB, lo que lo hace adecuado para experimentar con LoRA o fine-tuning completo en tareas de clasificación, extracción de entidades o reformulación en inglés.
- Docencia y reproducción de pipelines: permite explicar y replicar las dos fases (preentrenamiento en Wikipedia Structured + SFT en SmolTalk) en un laboratorio doméstico, incluyendo la comparación del comportamiento antes y después del ajuste.
- Inferencia en CPU o dispositivos de bajos recursos: al ocupar unos 0,44 GB en fp32 (0,22 GB en fp16), es viable ejecutarlo en CPU para pruebas de latencia, demos offline o entornos sin GPU.
- Generación de texto sintético para pruebas de software: útil para poblar campos de texto, simular respuestas de usuario o generar corpus de prueba en inglés donde la calidad factual no es crítica.
- Candidato a modelo borrador en decodificación especulativa: por tamaño y vocabulario podría evaluarse como draft model de un modelo mayor con el mismo tokenizador; requiere verificación empírica, ya que no se ha publicado ningún resultado al respecto.
- Investigación en seguridad y alineamiento de modelos pequeños: su falta de etapas de RLHF/DPO lo convierte en un caso de estudio controlado para medir sesgos y alucinación antes y después de aplicar técnicas de alineamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, perplexity ni ninguna otra evaluación cuantitativa, y tampoco se han encontrado en la búsqueda web. No se deben asumir cifras de rendimiento.

## Requisitos de hardware

- Pesos en memoria: ~0,44 GB en fp32 (tamaño del repo: 0,4 GB), ~0,22 GB en fp16/bf16, ~0,11 GB en int8 y ~0,055 GB en int4 (estimaciones calculadas a partir del número de parámetros; no hay versiones cuantizadas publicadas).
- VRAM estimada para inferencia: por debajo de 1 GB incluyendo activaciones; en la práctica, 1-2 GB con el overhead runtime de PyTorch, suficiente para cualquier GPU con 2 GB o más.
- Caché KV: 12 capas × 12 cabezas × 64 dimensiones × 2 (K y V) × 2 bytes ≈ 36 KB por token; con los 512 tokens de contexto, ~19 MB por secuencia, ~0,6 GB para un lote de 32.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso iGPU o CPU. Una RTX 5060 Ti de 16 GB, la usada para entrenar, es sobradamente suficiente. A100/H100 no aportan ventaja a este tamaño.
- Cabe en GPU consumer: sí, en todas las GPU discretas con al menos 2 GB de VRAM; también en CPU con `transformers` en fp32.
- Opciones de despliegue: `transformers` (pipeline de text-generation), el script con GUI del repositorio del autor, y TGI o vLLM si se necesita servir en lote (aunque su uso es desproporcionado para 110 M de parámetros). llama.cpp u Ollama solo serían posibles convirtiendo previamente los pesos a GGUF, algo que el autor no ha publicado.
- Latencia y throughput: no disponible. No se han publicado mediciones; el contexto de 512 tokens limita intrínsecamente el throughput en escenarios de documento largo.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de sus model cards públicas y no de una evaluación realizada para esta ficha. No se dispone de cifras de benchmark comparables para ninguno de ellos en la información proporcionada.

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Benchmarks |
|---|---|---|---|---|---|
| mz-model-v1 | 110 M | 512 | Apache-2.0 | Inglés | No disponible |
| GPT-2 small | 124 M | 1.024 | MIT modificada | Inglés | No evaluado aquí |
| SmolLM-135M | 135 M | 2.048 | Apache-2.0 | Inglés (nociones de código) | No evaluado aquí |
| Pythia-160M | 160 M | 2.048 | Apache-2.0 | Inglés | No evaluado aquí |

Diferencias clave: mz-model-v1 es el único de la comparativa entrenado explícitamente desde cero como ejercicio divulgativo en una sola GPU consumer y el único con contexto de 512 tokens. SmolLM-135M y Pythia-160M ofrecen el cuádruple de contexto y, en el caso de Pythia, una suite de checkpoints intermedios pensada para investigación de interpretabilidad. GPT-2 small mantiene una licencia modificada que conviene revisar antes de un uso comercial.

## Limitaciones y advertencias

- El autor declara el modelo como experimental, proporcionado «as is» y solo para fines de investigación, sin garantías de rendimiento, seguridad ni exactitud.
- Riesgo de alucinación alto: el preentrenamiento se limita a Wikipedia Structured y el ajuste a 20.000 muestras de SmolTalk, sin etapas de verificación factual ni RLHF/DPO que penalicen afirmaciones incorrectas.
- Ausencia de alineamiento de seguridad: no se documenta ningún proceso de RLHF, DPO, filtrado de contenido ni evaluación de toxicidad, por lo que puede producir contenido inapropiado o sesgado.
- Ventana de contexto muy corta (512 tokens): no admite documentos largos, conversaciones multi-turno extensas ni prompts con muchas instrucciones.
- Solo inglés: no hay soporte de castellano ni de otros idiomas; el comportamiento fuera del inglés será deficiente y no evaluado.
- Sesgos heredados de los corpus: Wikipedia Structured y SmolTalk arrastran los sesgos de género, geográficos y culturales de sus fuentes, agravados por el tamaño reducido del modelo y la falta de mitigación.
- Sin benchmarks publicados: no es posible comparar su calidad de forma objetiva con alternativas; cualquier afirmación de rendimiento sería especulativa.
- Licencia Apache-2.0: permite uso comercial y modificaciones, pero sin garantías; conviene revisar las licencias de los datasets de entrenamiento (Wikipedia Structured y SmolTalk) por si imponen condiciones adicionales sobre los pesos derivados.
- Madurez del proyecto: 0 descargas y 1 «like» en el momento de la consulta, sin issues ni discusión pública; el soporte de la comunidad es prácticamente inexistente.
- No hay versiones cuantizadas (GGUF, AWQ, GPTQ) ni artefactos para llama.cpp u Ollama, lo que obliga a convertir los pesos manualmente para despliegues fuera de `transformers`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/marekzel/mz-model-v1
- Repositorio con script de inferencia y GUI: https://github.com/marekzel/mz-model-v1
- Dataset de preentrenamiento (Wikipedia Structured): https://huggingface.co/datasets/wikimedia/structured-wikipedia
- Dataset de ajuste fino (SmolTalk): https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Paper, blog o demo adicionales: no disponible en la información consultada.
