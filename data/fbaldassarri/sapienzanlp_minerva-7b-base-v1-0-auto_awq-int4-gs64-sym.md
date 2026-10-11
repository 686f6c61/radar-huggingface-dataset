# fbaldassarri/sapienzanlp_Minerva-7B-base-v1.0-auto_awq-int4-gs64-sym

## Resumen

Este repositorio contiene una cuantización de terceros del modelo base `sapienzanlp/Minerva-7B-base-v1.0`, desarrollado originalmente por SapienzaNLP (Sapienza University of Rome). La cuantización la ha realizado el usuario `fbaldassarri` aplicando el algoritmo AWQ (AutoAWQ) mediante el framework Intel AutoRound v0.15.1, con el objetivo de reducir el consumo de memoria y acelerar la inferencia en hardware Intel: CPU, iGPU (Arc) y NPU (AI Boost de la serie Core Ultra).

El artefacto resultante es un modelo de generación de texto causal en INT4 con cuantización simétrica de pesos, grupo de tamaño 64 (W4G64), bajo la modalidad *weights-only quantization* (WoQ). El autor declara una aceleración de 2-3x respecto a la versión sin cuantizar, con una pérdida de precisión descrita como leve. Los idiomas declarados son italiano (it) e inglés (en), y la licencia es Apache 2.0.

La relevancia de esta ficha es doble: por un lado, permite desplegar un modelo de lenguaje entrenado para italiano en equipos sin GPU dedicada; por otro, es un ejemplo reproducible de un pipeline de cuantización con AutoRound sobre un modelo base abierto. Conviene señalar que el repositorio no publica benchmarks, no tiene descargas ni valoraciones, y los metadatos de la model card incluyen `inference: false`, por lo que debe tratarse como un artefacto experimental de investigación más que como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only, `model_type: mistral` (según metadatos del repositorio); detalles del modelo base no disponibles en la información proporcionada |
| Parámetros totales | 1.414.795.264 según los metadatos de safetensors del repositorio; discrepancia sin resolver, ya que el nombre del modelo indica ~7B y el tamaño del repositorio (5,4 GB) es coherente con un modelo de 7B en INT4. Dato no confirmado |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | INT4 (W4G64), simétrica, AWQ/WoQ, generada con Intel AutoRound 0.15.1. El modelo base original está en bf16/fp16 |
| Idiomas soportados | Italiano (it) e inglés (en), declarados en los metadatos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, cargable con `transformers` (`AutoModelForCausalLM`) |
| Método de cuantización | auto_awq (algoritmo AutoAWQ orquestado por Intel AutoRound) |
| Calibración | device `cpu`, `torch_dtype` bf16, 128 muestras, 200 iteraciones, seqlen 512, batch size 4 |
| Duración de la cuantización | 42.359,3 s (706,0 min), finalizada el 2026-09-18 |
| Tamaño del repositorio | 5,4 GB |
| Plantilla de prompt | `{prompt}` (modelo base de completado, sin plantilla de chat) |
| Descargas / likes | 0 / 0 (en el momento de la consulta) |
| Fecha de creación / actualización | 2026-10-10 / 2026-10-10 |

## Arquitectura y entrenamiento

El artefacto es una cuantización, no un entrenamiento nuevo. El modelo subyacente, `sapienzanlp/Minerva-7B-base-v1.0`, es un modelo de lenguaje causal de tipo transformer con decodificación autorregresiva; los metadatos del repositorio cuantizado indican `model_type: mistral`, lo que apunta a una arquitectura tipo Mistral. No se dispone en la información proporcionada de datos sobre el número de tokens de entrenamiento, la composición del corpus, ni si hubo fases de RLHF, DPO o ajuste por instrucciones (el modelo es explícitamente una versión *base*).

La innovación técnica de este repositorio reside en el proceso de cuantización. Se ha aplicado AWQ (*Activation-aware Weight Quantization*) a través de Intel AutoRound v0.15.1, con 4 bits, grupo de 64 y simetría activada. El proceso de calibración se ejecutó íntegramente en CPU con `torch.bfloat16` como tipo de carga, 128 muestras de calibración, 200 iteraciones de ajuste y secuencias de 512 tokens, con un coste total de 706 minutos. La model card documenta la receta de replicación completa, incluyendo las versiones exactas de `torch` (2.14.0+cpu) y `transformers` (4.55.3) empleadas. No se documenta decodificación especulativa ni ninguna otra técnica de aceleración más allá de la propia cuantización.

## Capacidades

- Generación de texto autorregresiva por continuación de prompt, en italiano e inglés.
- Modelo de tipo *base / completion*: no está ajustado por instrucciones ni dispone de plantilla de chat, por lo que no mantiene diálogos multi-turno de forma nativa.
- Capacidad de razonamiento, código y matemáticas: no documentada para este artefacto; no hay evaluaciones publicadas.
- Tool calling / function calling: no soportado de forma nativa, al tratarse de un modelo base sin ajuste por instrucciones.
- Uso como agente o razonamiento multi-paso: no soportado sin un ajuste posterior.
- Capacidades multilingües limitadas a italiano e inglés según los metadatos; el comportamiento en otras lenguas no está garantizado ni evaluado.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles.
- Inferencia acelerada en hardware Intel: CPU mediante `intel-extension-for-pytorch`, iGPU Arc mediante el mismo stack y NPU (AI Boost de Core Ultra) mediante OpenVINO.
- El autor declara una mejora de velocidad de 2-3x frente a la versión sin cuantizar.

## Casos de uso

- Generación de texto en italiano con recursos limitados: al ser un modelo de completado, se puede alimentar con un prefijo de texto y usarlo para redacción asistida, ampliación de párrafos o generación de variantes estilísticas en italiano, con un consumo de memoria propio de una cuantización INT4.
- Inferencia en portátiles y equipos sin GPU dedicada: la cuantización está pensada explícitamente para CPU Intel, iGPU Arc y NPU de la serie Core Ultra, por lo que encaja en despliegues de escritorio, laboratorio o campo donde no hay tarjeta gráfica disponible.
- Ajuste fino con presupuesto de VRAM reducido: al ocupar aproximadamente la cuarta parte de los pesos en bf16, permite aplicar LoRA o adaptadores sobre un modelo de 7B en GPUs de gama media, algo inviable con la versión completa en precisión nativa.
- Generación de datos sintéticos en italiano: útil para crear corpus de texto en italiano destinados a entrenar modelos más pequeños, clasificadores o sistemas de evaluación, un dominio donde la oferta de modelos abiertos en italiano es limitada.
- Puntuación y clasificación de texto: al ser un modelo causal, se pueden usar las log-probabilidades de tokens concretos para clasificación de temas, análisis de sentimiento o filtrado de contenido en italiano, sin necesidad de un modelo especializado.
- Autocompletado en editores y herramientas ofimáticas: la naturaleza de completado del modelo permite integrarlo en editores de texto en italiano para sugerencias de continuación, siempre que se gestione adecuadamente la latencia por token.
- Investigación en cuantización: el repositorio documenta la receta exacta de AutoRound, lo que lo convierte en un banco de pruebas para medir la degradación de calidad W4G64 frente al modelo base, y para comparar AWQ con otros esquemas de cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona cualitativamente una "ligera caída de precisión" con W4G64 y una aceleración de 2-3x, sin cifras concretas ni evaluación sobre tareas estándar (MMLU, HumanEval, GSM8K u otras). Tampoco se publican métricas de latencia o throughput medidas.

## Requisitos de hardware

- VRAM estimada para inferencia: si se confirma el tamaño nominal de 7B, los pesos en INT4 ocupan aproximadamente 4-4,5 GB y el repositorio completo pesa 5,4 GB; con caché KV para contextos cortos, el consumo se sitúa en el entorno de 5-6 GB. Si el recuento de 1,41 mil millones de parámetros fuese correcto, el consumo sería inferior a 1 GB. No hay mediciones publicadas.
- GPU recomendadas: para la ruta CUDA/NVIDIA, una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 de 12 GB o superiores son suficientes para un modelo de 7B en INT4; A100 o H100 solo tendrían sentido para servir muchas réplicas concurrentes.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 6-8 GB o más, siempre bajo la hipótesis del modelo de 7B. No hay confirmación empírica en la model card.
- Hardware Intel como objetivo principal: CPU Intel con `intel-extension-for-pytorch`, iGPU Arc (por ejemplo Core Ultra 185H, citado en la receta) y NPU AI Boost de la serie Core Ultra mediante OpenVINO.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM`; los tags incluyen `text-generation-inference`, y el formato AWQ es compatible con vLLM y TGI. No se publica versión GGUF, por lo que llama.cpp u Ollama requerirían reconvertir o recuantizar desde el modelo base.
- Latencia y throughput: no disponibles. La única referencia es la afirmación del autor de 2-3x de aceleración respecto a la versión sin cuantizar.
- Restricción de despliegue: los metadatos de la model card incluyen `inference: false`, lo que sugiere que el propio autor no garantiza el artefacto para inferencia directa.

## Comparativa con modelos similares

No hay datos de benchmarks que permitan una comparación de rendimiento. La comparación disponible se limita a las características técnicas del propio linaje del modelo.

| Modelo | Parámetros | Contexto | Formato / precisión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fbaldassarri/sapienzanlp_Minerva-7B-base-v1.0-auto_awq-int4-gs64-sym` | 1.414.795.264 según safetensors (nominal ~7B, discrepancia sin resolver) | No disponible | safetensors, INT4 W4G64 AWQ | Apache 2.0 | HuggingFace, 0 descargas |
| `sapienzanlp/Minerva-7B-base-v1.0` (modelo base) | ~7B (no confirmado en la información proporcionada) | No disponible | safetensors, bf16/fp16 | Apache 2.0 | HuggingFace |
| Otros LLM italianos abiertos de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables alternativos (parámetros, contexto, rendimiento y licencia) en el material proporcionado, ni de resultados que permitan establecer una comparación cuantitativa con la versión sin cuantizar.

## Limitaciones y advertencias

- Se trata de una cuantización no oficial, realizada por un tercero (`fbaldassarri`). SapienzaNLP no la ha validado ni respalda.
- Los metadatos del repositorio declaran `inference: false`, lo que indica que el propio autor no garantiza su funcionamiento en inferencia directa.
- La model card incluye un descargo de responsabilidad explícito: el modelo se distribuye sin garantía y se ha desarrollado únicamente con fines de investigación.
- No hay benchmarks publicados, por lo que la degradación real introducida por la cuantización W4G64 no está cuantificada.
- Existe una discrepancia relevante entre el recuento de parámetros reportado por safetensors (1.414.795.264) y el tamaño nominal de 7B que sugiere el nombre del modelo y el tamaño del repositorio. Debe verificarse antes de planificar recursos.
- Con 0 descargas y 0 likes, el artefacto carece de validación por parte de la comunidad.
- Al ser un modelo base de completado, no sigue instrucciones, no respeta roles de sistema/usuario y no mantiene formato conversacional sin un ajuste previo.
- Riesgo de alucinación inherente a cualquier modelo de lenguaje; no hay evaluaciones de factualidad ni mitigaciones documentadas.
- Sesgos conocidos: no disponibles. No se ha publicado ninguna evaluación de sesgo, toxicidad o representación para este artefacto ni para su modelo base en la información proporcionada.
- Limitaciones de contexto: la longitud de contexto no está documentada, lo que impide garantizar el comportamiento en prompts largos.
- Idiomas: solo italiano e inglés declarados; el rendimiento en otras lenguas, incluido el castellano, no está evaluado.
- Licencia: Apache 2.0 permite uso comercial, pero el descargo del autor restringe el propósito declarado a investigación. Conviene revisar la licencia del modelo base original antes de un uso comercial.
- La receta de replicación apunta a un dominio no estándar (`git.epicdynamic.com`) para el pipeline de AutoRound; conviene verificar la procedencia del código antes de ejecutarlo.
- Las versiones declaradas (`torch` 2.14.0+cpu, `transformers` 4.55.3) pueden no ser compatibles con entornos actuales, lo que puede afectar a la reproducibilidad.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/fbaldassarri/sapienzanlp_Minerva-7B-base-v1.0-auto_awq-int4-gs64-sym
- Modelo base: https://huggingface.co/sapienzanlp/Minerva-7B-base-v1.0
- Framework de cuantización Intel AutoRound: https://github.com/intel/auto-round
- Pipeline de replicación citado por el autor: https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
- Paper, blog o demo oficial: no disponibles en la información proporcionada.
- Resultados de búsqueda web: no se han encontrado resultados relevantes. Las entradas devueltas por el buscador no guardan relación con el modelo y se han descartado.
