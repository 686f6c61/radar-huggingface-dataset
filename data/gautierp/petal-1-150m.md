# GautierP/Petal-1-150M

## Resumen

Petal-1-150M es un modelo de lenguaje compacto de 152.727.296 parametros entrenado desde cero por GautierP (Chloris-Lab). Se distribuye como modelo conversacional (asistente SFT) en la raiz del repositorio y como modelo base preentrenado en el subdirectorio `base/`. Su tamano lo situa en la categoria de modelos "tiny", pensados para experimentacion, docencia y despliegue en hardware muy limitado.

La arquitectura es un transformer decoder-only de 18 capas, dimension 768, 12 cabezas de atencion, FFN de 2048 y embeddings atados, con RoPE y una ventana de contexto de 2048 tokens. El tokenizador es un BPE con division de digitos y un vocabulario de 32.768 tokens, decision que busca mejorar el manejo aritmetico basico frente a tokenizadores que agrupan cifras.

Su relevancia es acotada pero clara: sirve como referencia reproducible de un pipeline completo de preentrenamiento y SFT en un unico repositorio, con codigo de entrenamiento y de evaluacion publicados. No compite en conocimiento factual ni en razonamiento con modelos de mayor escala; sus propios benchmarks muestran que queda por debajo de SmolLM2-135M en practicamente todas las tareas evaluadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (RoPE, embeddings atados) |
| Parametros totales | 152.727.296 (127.430.400 sin embeddings) |
| Parametros activos | no aplica (modelo denso) |
| Capas | 18 |
| Dimension del modelo | 768 |
| Cabezas de atencion | 12 |
| Dimension FFN | 2048 |
| Longitud de contexto | 2048 tokens |
| Vocabulario | 32.768 tokens (BPE con division de digitos) |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones publicadas) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers, requiere `trust_remote_code=True`); tambien checkpoint `.pt` en la release local `models/digit32k/150M/petal-1-150M.pt` |
| Tamano del repositorio | 1,8 GB |
| Descargas en Hugging Face | 236 |
| Fecha de creacion | 2026-11-16 |
| Ultima actualizacion | 2026-11-17 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 18 capas con atencion multi-cabeza (12 cabezas), dimension oculta de 768, FFN de 2048 y embeddings de entrada y salida atados. Emplea embeddings posicionales rotatorios (RoPE). El tokenizador BPE de 32.768 tokens incluye division de digitos, lo que separa las cifras en tokens individuales y facilita la aritmetica de un solo digito.

El repositorio contiene dos checkpoints: el modelo base preentrenado (`base/`) y el asistente final tras SFT (raiz del repositorio). Segun la model card, el asistente se reentreno con un protocolo de "replay" al 15 %, learning rate 1e-4 y una epoca; los numeros del modelo base no cambiaron entre el 2026-11-16 y el 2026-11-17. No se documentan en la informacion disponible el numero de tokens de preentrenamiento, la composicion del dataset ni si hubo RLHF o DPO. El modelo no esta ajustado en seguridad y su comportamiento de rechazo es minimo por diseno.

## Capacidades

- Generacion de texto en ingles con estilo conversacional breve y directo.
- Conversacion multi-turno: la model card recomienda mantener la linea de sistema y los ultimos cuatro turnos intercambiados, recortando el historial por delante para caber en 2048 tokens.
- Aritmetica basica de un solo digito (por ejemplo, 2+2), favorecida por el tokenizador con division de digitos.
- Formato de salida en listas Markdown cuando la respuesta lo requiere.
- Modelo base disponible para fine-tuning posterior o experimentacion con preentrenamiento.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Docencia y experimentacion con preentrenamiento: el modelo base y el codigo de entrenamiento publicado permiten reproducir un pipeline completo desde cero en hardware de consumo, util para cursos de LLM.
- Asistente conversacional de bajo coste en ingles: con 152M parametros y contexto de 2048 tokens puede gestionar dialogos breves en entornos con recursos muy limitados (por ejemplo, una Raspberry Pi o una GPU integrada).
- Pruebas de integracion y CI: al ser pequeno y rapido, sirve como modelo de sustitucion en tests de pipelines de inferencia (formato de prompts, plantillas de chat, truncado de historial) sin coste de GPU dedicada.
- Generacion de texto corto y plantillas: respuestas breves, listas y reformulaciones simples donde no se requiere conocimiento factual.
- Investigacion sobre tokenizacion aritmetica: el tokenizador con division de digitos permite estudiar el efecto de la tokenizacion en tareas de aritmetica basica frente a otros modelos tiny.
- Base para fine-tuning especifico de dominio: al estar bajo licencia MIT y con pesos safetensors, se puede ajustar para tareas acotadas (clasificacion de texto corto, generacion de respuestas de formulario) con datasets pequenos.
- Evaluacion comparativa de modelos tiny: el arnes Mini-Eval y el protocolo v3 `small_lm` permiten reproducir las tablas publicadas y comparar con Pythia-160m y SmolLM2-135M.

## Benchmarks y rendimiento

Resultados del protocolo v3 `small_lm` (zero-shot, conjuntos de test completos, batch 4), segun la model card:

| Modelo | hellaswag | arc_easy | arc_chall. | piqa | winogrande | openbookqa | sciq | lambada | wikitext (bits/byte) | gsm8k |
|---|---|---|---|---|---|---|---|---|---|---|
| Petal-1-150M (assistant) | 0.315 | 0.424 | 0.240 | 0.603 | 0.507 | 0.274 | 0.654 | 0.205 | 1.064 | 0.020 |
| Petal-1-150M (base) | 0.336 | 0.479 | 0.261 | 0.628 | 0.519 | 0.300 | 0.685 | 0.279 | 0.890 | 0.012 |
| Pythia-160m-step143000 | 0.303 | 0.396 | 0.236 | 0.620 | 0.513 | 0.268 | 0.677 | 0.354 | 0.944 | 0.007 |
| SmolLM2-135M | 0.431 | 0.586 | 0.296 | 0.685 | 0.530 | 0.334 | 0.782 | 0.429 | 0.822 | 0.011 |

En bits/byte de wikitext, menor es mejor. El asistente se mide en zero-shot crudo sin plantilla de chat, por lo que sus ventajas conversacionales no se reflejan en la tabla. El modelo base supera a Pythia-160m en la mayoria de tareas y queda por debajo de SmolLM2-135M en todas las columnas salvo gsm8k, donde SmolLM2 obtiene 0.011 frente a 0.012 del base.

## Requisitos de hardware

- VRAM para inferencia en fp32: aproximadamente 0,6 GB solo de pesos (152,7M parametros x 4 bytes), mas activaciones y cache KV; en la practica, menos de 1,5 GB.
- En fp16/bf16: alrededor de 0,3 GB de pesos; en int8, unos 0,15 GB; en int4, unos 0,08 GB (estimaciones teoricas a partir del numero de parametros, no publicadas por el autor).
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU y en placas tipo Raspberry Pi.
- Opciones de despliegue: transformers con `trust_remote_code=True` (metodo documentado por el autor); llama.cpp, Ollama, vLLM o TGI no estan documentados en la informacion disponible y requeririan conversion de pesos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento (referencia) | Disponibilidad |
|---|---|---|---|---|---|
| Petal-1-150M | 152,7M | 2048 | MIT | Inferior a SmolLM2-135M en el suite v3; superior a Pythia-160m en la mayoria de tareas | Hugging Face, safetensors |
| SmolLM2-135M | 135M | no disponible en esta ficha | no disponible en esta ficha | Mejor en hellaswag, arc, piqa, winogrande, openbookqa, sciq, lambada y wikitext | Hugging Face |
| Pythia-160m | 160M | no disponible en esta ficha | no disponible en esta ficha | Inferior a Petal base en la mayoria de tareas del suite v3; mejor en lambada (0.354 frente a 0.279) | Hugging Face |

## Limitaciones y advertencias

- Solo ingles; no soporta castellano ni otros idiomas de forma fiable.
- Sin capacidad parametrica para conocimiento del mundo: el autor advierte explicitamente de que no se debe confiar en el modelo para respuestas factuales y de que las alucinaciones son esperables.
- No puede citar fuentes.
- Aritmetica limitada a operaciones simples; los casos de varios digitos o de varios pasos fallaran con frecuencia.
- No esta ajustado en seguridad; el comportamiento de rechazo es minimo por diseno, lo que lo hace inadecuado para aplicaciones de cara al publico sin filtros externos.
- Contexto de 2048 tokens, insuficiente para documentos largos o historiales extensos; la model card recomienda recortar el historial por delante.
- Requiere `trust_remote_code=True` en transformers, lo que implica ejecutar codigo del autor; conviene revisarlo antes de usarlo en produccion.
- Licencia MIT: permite uso comercial, pero sin garantias y con la advertencia de que el modelo no es apto para tareas que requieran fiabilidad factual.

## Enlaces

- Hugging Face: https://huggingface.co/GautierP/Petal-1-150M
- Codigo de entrenamiento: https://github.com/Chloris-Lab/Mini-LLM
- Arnes de evaluacion: https://github.com/Chloris-Lab/Mini-Eval
