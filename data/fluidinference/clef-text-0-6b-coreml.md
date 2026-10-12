# FluidInference/clef-text-0.6b-coreml

## Resumen

clef-text-0.6b (Core ML) es un modelo de decisión de texto de ~0,70B parámetros desarrollado por Fluid Inference, destilado del modelo maestro Cloudflare/clef-flash (9B) sobre la base de Qwen/Qwen3-0.6B más una cabecera de esquema conjunto propietaria de Clef. No es un modelo generativo: recibe un `state` y una serie de preguntas tipadas (`noul`, `choice`, `score`) y devuelve, en una sola pasada forward, una probabilidad para cada opción de cada pregunta. Este contrato es idéntico al de Clef y al de la API Jev/SystemOne. Se distribuye en formato Core ML, optimizado para Apple silicon, con pesos PyTorch en un repositorio separado.

El modelo está pensado para ejecutarse tanto en la GPU como íntegramente en el Neural Engine (todos los operadores del decoder se colocan en la ANE en los cuatro buckets de longitud), lo que libera la GPU para otras tareas. Ocupa un repositorio de 1,4 GB y se compone de tres paquetes: decoder Qwen3-0.6B + final norm en fp16 (848 MB), cabecera de esquema conjunto en fp16 (197 MB) y embeddings de tokens en fp16 (297 MB).

Su relevancia actual radica en la combinación de bajo coste computacional, latencia de decenas de milisegundos en hardware de consumidor Apple y resultados de clasificación cercanos al maestro de 9B en tareas de enrutado y clasificación (temas, entidades, sentimiento, valoraciones, toxicidad, emoción), a costa de renunciar a capacidades de conocimiento y razonamiento. Acumula 106 descargas y 14 "likes" en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (Qwen3-0.6B) + cabecera de esquema conjunto ("joint schema head") |
| Parametros totales | ~0,70B (backbone Qwen3-0.6B más cabecera) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | hasta 2.048 tokens, en cuatro cubos (256, 512, 1.024 y 2.048) con pesos compartidos |
| Tipos de cuantizacion | fp16 (Core ML); pesos PyTorch en el repositorio base |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML `mlpackage` (fp16) y `embeddings.f16`; pesos PyTorch en FluidInference/clef-text-0.6b |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder denso Qwen3-0.6B (hidden dim 1.024, cabezas de atención con cos/sin de 128 dimensiones) más una cabecera de esquema conjunto que procesa hasta 16 preguntas y 96 opciones por pasada. El decoder recibe `hidden [1, L, 1024]`, `cos`/`sin [L, 128]` y una máscara causal aditiva `[1, 1, L, L]`, todos en fp16, y produce `states [1, L, 1024]`. Las embeddings de tokens están atadas ("tied"): se reutilizan también como filas léxicas de opciones en la cabecera. El modelo se exporta en cuatro funciones de longitud compartida (`L256`, `L512`, `L1024`, `L2048`).

El entrenamiento usó 24.208 registros procedentes de 12 conjuntos de datos públicos (splits de entrenamiento; los splits de test se reservaron), etiquetados por clef-flash en 8 bits Core ML (con solo 1 discrepancia cada 611 muestras frente a fp32). La pérdida combina KL con T=2 y cross-entropy de gold con peso 0,3. Se aplicó LoRA con r=64 sobre el backbone y entrenamiento completo de la cabecera durante 2 épocas, inicializando la cabecera desde los pesos de clef-flash allí donde las formas coincidían. No se menciona uso de RLHF ni DPO.

## Capacidades

- Clasificación de texto y decisión tipada: dado un estado y un conjunto de preguntas (`noul`, `choice`, `score`), devuelve una probabilidad por opción en una sola pasada forward.
- Enrutado y categorización: tipo de entidad (DBpedia-14, 99,7%), tema de noticia (AG News, 90,7%) e intención en 77 clases (BANKING77, 86,4%).
- Análisis de sentimiento y valoraciones: SST-2 (90,0%) y estrellas Yelp de 5 clases (69,0%).
- Detección de toxicidad / contenido ofensivo: TweetEval offensive (85,0%).
- Clasificación de emociones en 6 clases: Emotion (68,0%).
- Preguntas de sí/no: BoolQ (82,3%).
- Inferencia multi-pregunta: hasta 16 preguntas y 96 opciones por invocación.
- Ejecución 100% en el Neural Engine de Apple silicon o en GPU/CPU.
- No soporta generación de texto libre, tool calling, uso de agentes ni razonamiento multi-paso; no es un modelo de conocimiento ni de QA científico/de sentido común.

## Casos de uso

- Enrutado de tickets de soporte al cliente: clasificación de intención en 77 categorías mediante el contrato de preguntas tipadas, con ~48 ms por ticket de ~370 tokens en la GPU de un M5 Pro (1.000 tickets en 57 s en la demo de FluidUse).
- Moderación de contenido y detección de toxicidad: uso como clasificador binario o multietiqueta sobre comentarios, con 85,0% en TweetEval offensive y calibración ECE de 0,046 en dev.
- Análisis de sentimiento en tiempo real: inferencia local sobre reseñas o mensajes con 90,0% en SST-2, sin enviar datos fuera del dispositivo.
- Categorización automática de documentos: asignación de tipo de entidad (99,7% en DBpedia-14) y tema (90,7% en AG News) para indexado o etiquetado masivo.
- Predicción de valoración por estrellas: estimación de 1 a 5 estrellas sobre reseñas (69,0% en Yelp) para priorizar atención al cliente.
- Detección de emociones en feedback de usuario: clasificación en 6 emociones (68,0%) para análisis de experiencia de producto.
- Verificación de afirmaciones de sí/no: respuestas booleanas sobre un estado dado (82,3% en BoolQ) en flujos de validación.
- Procesamiento con privacidad en el dispositivo: al ejecutarse íntegramente en el Neural Engine, evita el envío de datos sensibles a servidores externos.

## Benchmarks y rendimiento

Splits de test reservados (conjuntos oficiales de test/validación, 5.124 preguntas), precisión sobre el gold:

| Tarea | Este modelo | clef-flash 9B (maestro) |
|---|---:|---:|
| DBpedia-14 (tipo de entidad) | 99,7 | 100,0 |
| AG News (tema) | 90,7 | 92,0 |
| SST-2 (sentimiento) | 90,0 | 94,0 |
| BANKING77 (intención, 77 clases) | 86,4 | 94,5 |
| TweetEval (ofensivo) | 85,0 | 82,3 |
| Yelp (estrellas, 5 clases) | 69,0 | 70,7 |
| Emotion (6 clases) | 68,0 | 58,0 |
| BoolQ | 82,3 | 90,7 |
| MNLI | 72,3 | 84,3 |
| ARC-Easy | 80,0 | 100,0 |
| CommonsenseQA | 65,0 | 94,3 |
| ARC-Challenge | 60,7 | 97,3 |
| **Media (all)** | **79,1** | **88,2** |

Métricas adicionales: acuerdo con el maestro del 86,4% y ECE de calibración 0,046 en dev. Comparación Core ML sobre Neural Engine frente al estudiante PyTorch sobre las mismas 5.118 preguntas de test: 15 respuestas distintas (0,3%, todas casi empatadas, con top-2 de PyTorch dentro de 0,11), deriva mediana de probabilidad 0,013 y precisión sobre gold igual dentro de ±0,7 por tarea.

## Requisitos de hardware

- Hardware objetivo: Apple silicon (Neural Engine, GPU o CPU). No está pensado para GPU NVIDIA ni CUDA.
- Tamano en disco: repositorio de 1,4 GB (decoder 848 MB + cabecera 197 MB + embeddings 297 MB).
- Memoria: el modelo se ejecuta en memoria unificada de Apple silicon; no se publican cifras de VRAM específicas (no disponible).
- Latencia del decoder a 512 tokens en M5 Pro: 35 ms en GPU (`.cpuAndGPU`), 64 ms en Neural Engine (`.cpuAndNeuralEngine`), 200 ms solo CPU.
- Latencia decoder + cabecera en Neural Engine por bucket: 29 ms (256 tokens), 69 ms (512), 196 ms (1.024), 591 ms (2.048).
- Latencia en runtime Swift para un ticket de soporte de 3 preguntas (~370 tokens): ~48 ms en GPU, ~77 ms en Neural Engine; frente a ~0,5 s del clef-flash Core ML (9B, GPU).
- Opciones de despliegue: Core ML con el runtime Swift `ClefTextManager` del repositorio FluidUse; pesos PyTorch en el repositorio FluidInference/clef-text-0.6b. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a Core ML).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media (all) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| clef-text-0.6b (este) | ~0,70B | 2.048 tokens | 79,1 | Apache-2.0 | Core ML + PyTorch |
| clef-flash (maestro) | 9B | no disponible | 88,2 | Apache-2.0 | HuggingFace + Core ML |
| Qwen3-0.6B (base) | ~0,6B | no disponible | no disponible | Apache-2.0 | HuggingFace |

El modelo se sitúa 9,1 puntos por debajo del maestro de 9B en la media global, con paridad en tareas de enrutado y clasificación (0–4 puntos de diferencia en tema, entidad, sentimiento, valoración, toxicidad y emoción) y una brecha mucho mayor en QA de conocimiento y NLI (ARC-Challenge 60,7 frente a 97,3; CommonsenseQA 65,0 frente a 94,3).

## Limitaciones y advertencias

- No es un modelo de conocimiento: el QA científico y de sentido común (ARC-Easy 80,0, ARC-Challenge 60,7, CommonsenseQA 65,0) y el NLI (MNLI 72,3) quedan muy por debajo del maestro de 9B.
- No genera texto libre: solo produce probabilidades sobre opciones predefinidas en el esquema de preguntas tipadas.
- Contexto máximo limitado a 2.048 tokens, en cuatro cubos fijos.
- Idiomas soportados: no disponible en la información proporcionada.
- Puede presentar deriva de calibración y errores en decisiones casi empatadas (ECE 0,046 en dev; 0,3% de respuestas divergentes entre Core ML y PyTorch, todas con top-2 dentro de 0,11).
- Dependencia del etiquetado del maestro clef-flash, que puede heredar sus sesgos; no se documentan sesgos específicos (no disponible).
- Restringido a hardware Apple para la versión Core ML; el despliegue en otros entornos requiere los pesos PyTorch del repositorio base.
- Licencia Apache-2.0, por lo que se permite uso comercial, pero conviene verificar las condiciones de los conjuntos de datos de entrenamiento subyacentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FluidInference/clef-text-0.6b-coreml
- Pesos PyTorch (base): https://huggingface.co/FluidInference/clef-text-0.6b
- Modelo maestro: https://huggingface.co/Cloudflare/clef-flash
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Versión Core ML del maestro: https://huggingface.co/FluidInference/clef-flash-coreml
- Runtime Swift (ClefTextManager, FluidUse): https://github.com/FluidInference/FluidUse
- Sitio del autor: https://fluidinference.com
