# agmadaasa/NanoMath-R

## Resumen

NanoMath-R es un modelo de lenguaje especializado en matematicas, desarrollado por el autor independiente agmadaasa y publicado bajo licencia Apache 2.0. Se trata de un transformer decoder escrito desde cero en PyTorch, con 103.834.368 parametros almacenados y una innovacion estructural clave: solo guarda 16 bloques fisicos pero aplica la misma pila dos veces por token, alcanzando una profundidad efectiva de 32 bloques sin duplicar pesos. Esta recurrencia de profundidad lo convierte en un caso de estudio interesante para investigacion sobre modelos pequenos y eficiencia parametrica.

El modelo esta entrenado especificamente para aritmetica entera directa y razonamiento matematico basico, con un vocabulario reducido de 4.096 tokens SentencePiece y una ventana de contexto de 1.024 tokens. No es un asistente general: su model card advierte explicitamente que no es fiable para problemas de palabras, fracciones, algebra ni demostraciones. Su relevancia actual radica en que demuestra que tecnicas de profundidad recurrente y decodificacion autoespeculativa pueden aplicarse a modelos de escala muy reducida con resultados medibles.

El checkpoint incluye una cabeza draft opcional de 2,4 millones de parametros para decodificacion autoespeculativa, que acelera la inferencia entre 1,23x y 1,43x sin alterar las respuestas. El modelo requiere codigo personalizado (no carga con `AutoModelForCausalLM`) y esta pensado para entornos de investigacion, no para produccion critica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con profundidad recurrente (16 bloques fisicos, 2 pasadas, 32 aplicaciones por token) |
| Parametros totales | 103.834.368 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (entrenado y publicado en FP16/PyTorch; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`model_weights.pth`), tokenizador SentencePiece (`token.model`), cabeza draft en `.pt` |

Detalles adicionales: anchura 768, 12 cabezas de query, 4 cabezas de clave/valor (GQA), RoPE como codificacion posicional, RMSNorm, MLP SwiGLU, embeddings de entrada y salida atados, proyecciones sin sesgo y proyecciones residuales inicializadas a cero. El repositorio ocupa 0,4 GB.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder con atencion de query agrupada (GQA) y una innovacion central: profundidad recurrente. El modelo almacena 16 bloques fisicos y aplica la misma pila dos veces por token, logrando 32 aplicaciones de bloque con la mitad de los pesos. Esto reduce el coste de memoria a cambio de un mayor coste computacional por token. La atencion se aisla entre documentos durante el entrenamiento, y cada documento empaquetado reinicia sus posiciones para no atender a otros documentos del mismo bloque.

El entrenamiento uso 233.896.960 posiciones de token empaquetadas y 1.066.609 documentos aceptados tras filtrado por longitud. Las fuentes fueron: 750.000 documentos de aritmetica estructural verificada, 190.209 de NuminaMath, 117.487 de un curriculo de lenguaje generado, 7.404 de GSM8K y 1.509 de ASDiv. Se completaron 6.000 pasos de optimizador procesando 393.216.000 posiciones de token (aproximadamente 1,68 pasadas sobre el corpus), con dos GPU NVIDIA T4 en FP16, secuencias de 1.024 tokens, checkpointing de activaciones y pesos de perdida por rol de mensaje (prompt 0, razonamiento 1, respuesta 3). El entrenamiento duro 41.623,7 segundos de reloj (23,12 horas de uso de acelerador) y la perdida de validacion registrada es 0,129966.

La innovacion de inferencia es la decodificacion autoespeculativa: la primera pasada recurrente genera borradores de varios tokens y la segunda los verifica de golpe. La cabeza draft opcional (`draft_heads/depth16_mlp.pt`, 2,4M parametros) mejora la calidad de esos borradores. Cada token aceptado sigue siendo la eleccion greedy del modelo completo, por lo que la cabeza cambia la velocidad, no las respuestas.

## Capacidades

- Generacion de texto con razonamiento matematico basico: el modelo emite un tramo de razonamiento, luego `<|answer|>`, una respuesta numerica y `<|end|>`.
- Aritmetica entera directa: suma, resta, multiplicacion y division exacta con buen rendimiento observado en la muestra sintetica (8/8, 8/8, 7/7 y 7/7 respectivamente).
- Razonamiento multi-paso limitado: puede encadenar pasos dentro de su tramo de razonamiento, aunque con fiabilidad baja en problemas de palabras y algebra.
- Formato de prompt estructurado con tokens especiales `<|user|>`, `<|end|>`, `<|assistant|>`, `<|answer|>`.
- Decodificacion greedy por defecto, con soporte de decodificacion autoespeculativa mediante cabeza draft.
- Capacidades multilingues: solo ingles.
- No soporta tool calling ni function calling de forma nativa.
- No soporta agentes ni razonamiento multi-turno complejo.
- No dispone de vision, audio ni modo thinking explicito mas alla del tramo de razonamiento.

## Casos de uso

- Investigacion sobre profundidad recurrente: el modelo permite estudiar como afecta aplicar la misma pila de bloques dos veces por token al rendimiento y al coste de memoria, comparandolo con un transformer de 32 bloques fisicos. Es adecuado porque expone la configuracion completa en `model_config.json` y `training_summary.json`.
- Reproduccion de experimentos con modelos pequenos: investigadores pueden replicar el entrenamiento y las evaluaciones reportadas usando el repositorio fuente y los datos citados (GSM8K, NuminaMath, ASDiv). El checkpoint incluye metadatos de entrenamiento y checksums para verificar integridad.
- Pruebas de aritmetica entera directa con verificacion independiente: el modelo rinde bien en sumas, restas, multiplicaciones y divisiones exactas, por lo que puede usarse como banco de pruebas para pipelines que validen la salida numerica con un verificador externo.
- Estudio de decodificacion autoespeculativa: la cabeza draft de 2,4M parametros y las metricas de acuerdo (96,6% en preguntas sinteticas, 92,5% en SVAMP) permiten analizar el compromiso entre velocidad y fidelidad en decodificacion especulativa.
- Benchmark de eficiencia en hardware consumer: con unos 104M parametros y FP16, el modelo cabe en cualquier GPU consumer moderna y en Apple Silicon via MPS o MLX, sirviendo para medir throughput (unos 300 tokens por segundo con el backend MLX) en entornos de bajo coste.
- Educacion y demostraciones de arquitecturas transformer: su tamano reducido y su codigo legible lo hacen util para ensenar GQA, RoPE, RMSNorm, SwiGLU y profundidad recurrente en cursos o talleres.

## Benchmarks y rendimiento

Evaluaciones de release con decodificacion greedy, dos pasadas recurrentes, KV cache, FP16 en Apple MPS y maximo 384 tokens nuevos:

| Evaluacion | Ejemplos | Exact match macro | Exact match micro | Malformados |
|---|---:|---:|---:|---:|
| Aritmetica sintetica reservada para evaluacion | 50 | 63,27% | 66,00% | 2,00% |
| SVAMP | 40 | 22,50% | 22,50% | 0,00% |
| Prompts de continuidad NanoMath v1.1 | 6 | 50,00% | 50,00% | 0,00% |

Desglose en la muestra sintetica: 8/8 suma, 8/8 resta, 7/7 multiplicacion, 7/7 division exacta, 2/7 ecuaciones lineales, 1/7 problemas de palabras y 0/6 fracciones. El autor advierte que las muestras son pequenas y describen comportamiento observado, no una garantia.

Rendimiento de la cabeza draft (acuerdo con el modelo completo): 96,6% en 300 preguntas sinteticas y 92,5% en 300 preguntas SVAMP, frente a 93,3% y 85,9% de la primera pasada sin cabeza. Aceleracion en un MacBook Pro M3 Pro con PyTorch sobre MPS: 1,43x en los prompts de benchmark, 1,33x en la muestra sintetica y 1,23x en SVAMP. Con el backend MLX del repositorio fuente alcanza unos 300 tokens por segundo.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K completo) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 103,8M parametros en FP16, los pesos ocupan aproximadamente 0,21 GB; sumando KV cache y overhead de runtime, el uso real se situa en torno a 0,5-1 GB.
- GPU recomendadas: cualquier GPU moderna es suficiente. Para entrenamiento o evaluacion a gran escala, NVIDIA T4 (usadas en el entrenamiento original), A100 o H100; para inferencia, RTX 3060 en adelante.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer con al menos 2 GB de VRAM, incluidas GTX 1650, RTX 3050, RTX 4090 y Apple Silicon via MPS.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI de forma estandar, ya que requiere las clases personalizadas del repositorio fuente. El despliegue se realiza con PyTorch (backend MPS o CUDA) o con el backend MLX incluido en el repositorio.
- Latencia y throughput: aproximadamente 300 tokens por segundo con el backend MLX en Apple Silicon; en MPS con PyTorch, la decodificacion autoespeculativa aporta entre 1,23x y 1,43x sobre la decodificacion ordinaria. No se documentan cifras para CUDA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| NanoMath-R | 103,8M | 1.024 | Aritmetica, profundidad recurrente | Apache 2.0 | Hugging Face + GitHub |
| GPT-2 small | 124M | 1.024 | Lenguaje general | MIT | Amplia |
| TinyLlama 1.1B | 1,1B | 2.048 | Lenguaje general | Apache 2.0 | Amplia |
| Qwen2.5-Math-1.5B | 1,5B | 32.768 | Matematicas | Apache 2.0 | Amplia |

La comparacion con GPT-2 small es la mas directa por escala: NanoMath-R tiene menos parametros (103,8M frente a 124M) pero esta especializado en aritmetica y usa profundidad recurrente, mientras que GPT-2 small es un modelo de lenguaje general sin capacidades matematicas destacables. Frente a TinyLlama y Qwen2.5-Math, NanoMath-R es un orden de magnitud menor y no compite en capacidades generales ni en contexto. No se dispone de benchmarks comparativos directos publicados en la informacion disponible.

## Limitaciones y advertencias

- No es fiable para problemas de palabras (1/7 en la muestra sintetica), fracciones (0/6), algebra (2/7) ni demostraciones.
- Puede producir razonamiento fluido con un numero final incorrecto; el autor lo advierte explicitamente.
- No debe usarse para calculos financieros, medicos, de ingenieria o cualquier otro donde un error cause dano.
- Entrenamiento principalmente en ingles; no soporta otros idiomas de forma fiable.
- Contexto muy limitado (1.024 tokens), insuficiente para conversaciones largas o documentos extensos.
- Requiere codigo personalizado: no carga con `AutoModelForCausalLM` ni con el pipeline estandar de Transformers, lo que complica su integracion en stacks convencionales.
- Incompatible con los tokenizadores de NanoMath v1.0, v1.1, V2 y V3.
- Las muestras de evaluacion son muy pequenas (50, 40 y 6 ejemplos), por lo que los resultados tienen alta varianza y no deben interpretarse como garantias.
- Riesgo de alucinacion en razonamiento: el modelo puede generar pasos plausibles que no conducen a la respuesta correcta.
- La cabeza draft solo es valida para este checkpoint concreto (su metadata registra el SHA-256 del checkpoint); no es transferible.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible; al entrenarse con datos matematicos y curriculo generado, puede heredar sesgos de esas fuentes.
- Uso comercial permitido por Apache 2.0, pero la falta de fiabilidad desaconseja su uso en produccion sin verificacion externa de resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agmadaasa/NanoMath-R
- Repositorio fuente en GitHub: https://github.com/agmada-asa/NanoMath-R
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset NuminaMath-1.5: https://huggingface.co/datasets/AI-MO/NuminaMath-1.5
- Dataset ASDiv: https://huggingface.co/datasets/EleutherAI/asdiv
- Documentacion de inferencia (INFERENCE.md, en el repositorio fuente): https://github.com/agmada-asa/NanoMath-R/blob/main/INFERENCE.md
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
