# GGUFGuy/wtf-did-i-make

## Resumen

`wtf-did-i-make` es un modelo de lenguaje decoder-only de 100.064 parámetros entrenado desde cero por el usuario de HuggingFace `GGUFGuy` sobre el dataset `fineweb-edu`. No es un modelo destinado a producción ni a asistencia conversacional: el propio autor lo describe como un artefacto de investigación a pequeña escala, cuyo objetivo es hacer observable y reproducible el proceso completo de preentrenamiento de un transformer. Se entrenó con el Space HyperDex Trainer en apenas 28,7 minutos de cómputo.

Arquitecturalmente es un `LlamaForCausalLM` estándar reducido en anchura y profundidad: 2 capas, dimensión oculta de 32, 2 cabezas de atención (1 de clave/valor, es decir, GQA) y FFN de 147 unidades. Mantiene los componentes canónicos de la familia Llama (SiLU en el MLP, RMSNorm, embeddings posicionales rotatorios, embeddings atados y ausencia de sesgos). El vocabulario es un BPE personalizado de 2.048 tokens entrenado sobre el mismo corpus, y la longitud de contexto es de 512 tokens.

Su relevancia es pedagógica y metodológica, no competitiva. Con 100.064 parámetros y 2.000 millones de tokens vistos, el modelo aprende formas de palabras, colocaciones frecuentes y algo de sintaxis superficial, pero no produce contenido factual ni mantiene coherencia discursiva. Resulta útil como banco de pruebas para pipelines de entrenamiento, tokenizadores y herramientas de despliegue a escala mínima.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`LlamaForCausalLM`): SiLU MLP, RMSNorm, RoPE, GQA, embeddings atados, sin sesgos |
| Parámetros totales | 100.064 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | no disponible (el repo no publica variantes GGUF pese al nombre del autor) |
| Idiomas soportados | inglés (`en`) |
| Licencia | ODC-BY (Open Data Commons Attribution License) |
| Formato de pesos | safetensors (librería `transformers`) |

Detalles adicionales de arquitectura publicados por el autor:

| Parámetro | Valor |
|---|---|
| Dimensión oculta | 32 |
| Capas | 2 |
| Cabezas de atención | 2 (KV: 1) |
| Tamaño FFN | 147 |
| Vocabulario | 2.048 (BPE personalizado sobre fineweb-edu) |
| Tokens vistos en entrenamiento | 1.999.962.112 |
| Pasos | 30.517 |
| Tokens por paso | 65.536 |
| Optimizador | AdamW (β1=0.9, β2=0.95), weight decay 0.1, grad clip 1.0 |
| Schedule de LR | warmup 2 % + cosine hasta 10 %, pico 5e-03 |
| Loss final | 4,3375 (perplejidad 76,5) |
| Tiempo de entrenamiento | 28,7 minutos |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Llama, escalado hacia abajo hasta el presupuesto de 100.064 parámetros. Emplea Grouped-Query Attention con 2 cabezas de consulta y 1 cabeza de clave/valor, RMSNorm en lugar de LayerNorm, activación SiLU en el MLP, embeddings posicionales rotatorios (RoPE) y atado de embeddings entre la capa de entrada y la proyección de salida. No utiliza sesgos en las capas lineales. El vocabulario es un BPE propio de 2.048 tokens entrenado sobre el corpus, lo que evita depender del tokenizador de un modelo mayor.

El preentrenamiento se realizó sobre `HuggingFaceFW/fineweb-edu`, un corpus filtrado por calidad educativa, con un total de 1.999.962.112 tokens procesados en 30.517 pasos de 65.536 tokens cada uno. El schedule de learning rate combina un warmup del 2 % con decaimiento coseno hasta el 10 % del pico de 5e-03, con AdamW y weight decay de 0.1. La pérdida final de 4,3375 (perplejidad 76,5) es coherente con la escala del modelo: captura estructura estadística local pero no modela dependencias de largo alcance. No se documenta ninguna fase de ajuste fino supervisado, RLHF ni DPO; es un modelo estrictamente preentrenado.

## Capacidades

- Generación de texto autoregresiva a nivel de token, limitada a continuaciones cortas y localmente coherentes.
- Modelado de colocaciones frecuentes y formas de palabras en inglés, derivado del corpus fineweb-edu.
- Aprendizaje de sintaxis superficial: el autor indica que el modelo captura "un poco de sintaxis" además de morfología y colocaciones.
- No dispone de tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- No tiene modo de razonamiento explícito (thinking mode).
- Sin capacidades de visión, audio ni multimodalidad.
- Multilingüismo: únicamente inglés; no se ha entrenado con otros idiomas.
- No es un asistente: el autor advierte explícitamente que su salida no es factual.

## Casos de uso

- Docencia y divulgación sobre preentrenamiento: sirve para mostrar de principio a fin cómo se entrena un transformer desde cero, con métricas de loss, perplejidad y tiempo de cómputo publicadas y reproducibles en menos de media hora.
- Pruebas de pipelines de tokenización: al incluir un BPE propio de 2.048 tokens, permite validar flujos de entrenamiento de tokenizador, vocabulario y decodificación sin incurrir en costes de cómputo relevantes.
- Validación de herramientas de despliegue: su tamaño (100.064 parámetros, repo de 0,0 GB) permite probar integraciones con `transformers`, text-generation-inference o endpoints compatibles en entornos con recursos mínimos.
- Experimentos de curriculum y composición de datos: al estar entrenado sobre fineweb-edu con un presupuesto de tokens conocido, sirve como línea base para comparar variaciones de dataset, schedule de LR o arquitectura a escala de juguete.
- Reproducibilidad de recetas de entrenamiento: los hiperparámetros completos (AdamW, warmup, cosine, clip) permiten replicar el experimento y medir desviaciones.
- Benchmarking de infraestructura: útil para medir overhead de arranque, latencia de carga de pesos y throughput en configuraciones de hardware muy limitadas, sin que el modelo domine el tiempo de ejecución.
- Análisis de límites de escala: permite estudiar empíricamente qué capacidades emergen (y cuáles no) con 100.064 parámetros y 2.000 millones de tokens, como referencia en estudios de scaling laws a pequeña escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado por el autor es la pérdida final de entrenamiento (4,3375) y su perplejidad asociada (76,5) sobre el corpus de preentrenamiento; no se han divulgado evaluaciones en MMLU, HumanEval, GSM8K ni conjuntos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier precisión razonable. Con 100.064 parámetros, los pesos en fp32 ocupan aproximadamente 0,4 MB; en fp16, unos 0,2 MB. El cuello de botella es el tokenizador y el runtime, no los pesos.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluida una GTX 1050 o inferior. También es viable en CPU.
- Cabe en cualquier GPU de consumo, así como en Raspberry Pi y entornos embebidos.
- Opciones de despliegue: `transformers` (soporte nativo, según la model card), text-generation-inference (el modelo está etiquetado como `text-generation-inference` y `endpoints_compatible`). No se publican pesos GGUF pese al nombre del autor, por lo que `llama.cpp` y Ollama requerirían conversión previa.
- Latencia y throughput: no disponibles en la información proporcionada. Dado el tamaño, se espera que el tiempo esté dominado por el arranque del runtime y la carga del tokenizador.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia cualitativa, otros artefactos de preentrenamiento a escala de juguete (por ejemplo, variantes tipo nanoGPT o TinyStories) comparten el objetivo pedagógico, pero no se han aportado datos de parámetros, contexto ni rendimiento de esos modelos en esta ficha, por lo que no se establece una comparación numérica.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `GGUFGuy/wtf-did-i-make` | 100.064 | 512 | ODC-BY | HuggingFace |
| Alternativas de escala similar | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un asistente: el autor indica explícitamente que el modelo "no es un asistente útil" y que su salida "no es factual".
- Riesgo de alucinación muy elevado: con 100.064 parámetros y una perplejidad de 76,5, la generación es fundamentalmente una continuación estadística de superficie sin grounding.
- Capacidad lingüística limitada: aprende formas de palabras, colocaciones y algo de sintaxis, pero no mantiene coherencia multi-frase ni razonamiento.
- Contexto muy corto: 512 tokens, insuficiente para la mayoría de aplicaciones reales.
- Monolingüe: solo inglés; no se ha entrenado con castellano ni otros idiomas.
- Sin ajuste de instrucciones: no ha pasado por SFT, RLHF ni DPO, por lo que no responde a instrucciones de forma fiable.
- Licencia ODC-BY: permite uso comercial con atribución, pero conviene revisar los términos exactos y la atribución requerida al autor y al dataset de origen.
- Sesgos: al entrenarse sobre fineweb-edu, hereda los sesgos presentes en ese corpus filtrado; no se documenta ninguna mitigación.
- Adecuación a producción: no recomendado para ningún caso de uso en producción; su propósito es investigación y docencia.
- Nombre del autor y del repositorio (`GGUFGuy`, `wtf-did-i-make`) no implican que existan pesos GGUF publicados; el repo solo contiene safetensors.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GGUFGuy/wtf-did-i-make
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Space del entrenador (HyperDex Trainer): https://hugging-science-hyperdex-trainer.hf.space/
- Perfil del autor: https://huggingface.co/GGUFGuy
