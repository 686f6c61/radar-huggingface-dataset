# joyfox/Qwen3.8-27B-Uncensored-JoyFox-Aggressive

## Resumen

Qwen3.8-27B-Uncensored-JoyFox-Aggressive es un ajuste fino del modelo Qwen3.8-27B publicado por el usuario joyfox en Hugging Face. El objetivo declarado del autor es reducir los rechazos falsos y las introducciones de estilo politico en peticiones legitimas, manteniendo intactos los componentes nativos del modelo base: tokenizador, plantilla de chat, configuracion, pila de vision, proyector multimodal y pesos de Multi-Token Prediction (MTP). La variante se distribuye como checkpoint completo en BF16 y como una matriz de cuantizaciones GGUF generadas con importance matrix, ademas de un proyector visual F16 y un modelo borrador MTP independiente.

El modelo conserva la arquitectura multimodal del Qwen3.8-27B original, con 27.781.427.952 parametros reales segun los tensores de safetensors, y una pipeline de image-text-to-text. El repositorio ocupa 413,9 GB, lo que refleja la convivencia de pesos BF16, GGUF de distintos tamanos y artefactos auxiliares. La licencia declarada es Apache 2.0 y los idiomas indicados son ingles, chino y multilingue.

La relevancia de esta ficha esta en que se trata de una modificacion de comportamiento, no de conocimiento: el autor afirma explicitamente que la intervencion no anade informacion factual y que el modelo puede seguir alucinando o aceptar premisas falsas. Los datos de evaluacion publicados miden la tasa de rechazo en peticiones benignas y una puntuacion de capacidad, no benchmarks academicos estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de Qwen3.8 (pipeline image-text-to-text), con pila de vision, proyector multimodal y pesos MTP (Multi-Token Prediction) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16; GGUF Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0, con y sin MTP; mmproj F16; MTP BF16 |
| Idiomas soportados | en, zh, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16) y GGUF |
| Modelo base | Qwen/Qwen3.8-27B |
| Libreria | transformers |
| Tamano del repositorio | 413,9 GB |
| Descargas / likes | 3354 / 12 |
| Fecha de creacion | 2026-08-15 |
| Ultima actualizacion | 2026-09-21 |

## Arquitectura y entrenamiento

El checkpoint es un modelo completo e independiente en el layout nativo de tensores de Qwen3.8. Segun la model card, los pesos de texto favorecen respuestas directas y sustantivas a peticiones legitimas, mientras que el tokenizador, la plantilla de chat, la configuracion, la pila de vision, el proyector multimodal y los componentes MTP mantienen compatibilidad con el modelo upstream. La validacion de la release impone invariantes concretas: los identificadores de tokens especiales no cambian, los tensores del codificador de vision y del proyector coinciden en nombre, forma, dtype y valores con el checkpoint oficial, y los tensores MTP nativos tambien coinciden antes de la conversion.

El autor no detalla el procedimiento exacto de entrenamiento ni el volumen de tokens utilizado; la etiqueta "abliterated" sugiere una intervencion de direccion de rechazo sobre los pesos, pero no se documenta la metodologia, el dataset ni si hubo RLHF o DPO. La innovacion tecnica destacable es la preservacion verificada de MTP para decodificacion especulativa y del stack de vision, algo poco habitual en variantes "uncensored", junto con cuantizaciones GGUF generadas mediante importance matrix. Las builds `-no-mtp` contienen el mismo tronco del modelo objetivo con 851 tensores y cero tensores MTP/NextN, pensadas para runtimes que no cargan GGUF con MTP embebido.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, chino y otros idiomas.
- Entrada de imagen: pipeline image-text-to-text con codificador de vision y proyector multimodal intactos respecto al modelo oficial.
- Decodificacion especulativa mediante MTP nativo, con modelo borrador independiente disponible en GGUF BF16.
- Razonamiento y analisis sobre peticiones ambiguas o redactadas de forma sensible, con menor tasa de rechazo segun la evaluacion del autor.
- Respuestas directas y sustantivas para contextos benignos, ficticios, analiticos, educativos y autorizados.
- Capacidad multilingue declarada (en, zh, multilingual).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con entradas de texto e imagen, util en sectores como seguros o bricolaje donde el usuario adjunta fotos de danos o productos; la plantilla de chat oficial se conserva, lo que facilita integracion con pipelines existentes de Qwen3.8.
- Analisis de documentos e imagenes tecnicas: al mantener intacto el proyector multimodal, permite extraer descripciones y responder preguntas sobre capturas, planos o esquemas en entornos de soporte interno.
- Generacion de contenido editorial y creativo: la reduccion de rechazos falsos resulta adecuada para ficcion, guiones y material educativo con tematicas sensibles, donde el modelo base rechazaria peticiones legitimas.
- Asistencia en investigacion y analisis de escenarios: peticiones analiticas sobre temas controvertidos o formuladas de forma ambigua reciben respuestas sustantivas en lugar de preambulos de politica, lo que reduce friccion en entornos academicos.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M (15,66 GiB) y Q3_K_M (12,57 GiB) permiten ejecucion local en GPUs consumer con llama.cpp, con MTP embebido para acelerar la decodificacion cuando el runtime lo soporta.
- Servicio de inferencia con decodificacion especulativa: el modelo borrador MTP BF16 (5,54 GiB) y las builds con MTP permiten configurar speculative decoding en llama.cpp para reducir latencia en cargas interactivas.
- Evaluacion de robustez de filtros: util para equipos que calibran clasificadores de seguridad, comparando el comportamiento del modelo oficial (59,2 % de rechazo benigno) frente a esta variante (0,0 %).

## Benchmarks y rendimiento

La model card reporta una evaluacion propia basada en generacion, con 1.000 prompts, decodificacion greedy y el commit `885c5bbe8e04` de llama.cpp. No se presentan resultados de benchmarks academicos estandar como MMLU, HumanEval o GSM8K.

| Split | Prompts | Proposito |
|---|---:|---|
| Rechazo benigno (overrefusal) | 800 | peticiones legitimas dificiles y sensibles a ambiguedad |
| Controles bilingues de capacidad | 100 | comprobaciones deterministas de respuesta exacta en chino e ingles |
| Diagnostico de comportamiento no bloqueante | 100 | reporte descriptivo V1 |

| Checkpoint | Tasa de rechazo benigno | Puntuacion de capacidad |
|---|---:|---:|
| Qwen3.8-27B oficial | 59,2 % | 59,0 % |
| JoyFox BF16 | 0,0 % | 59,0 % |

La puntuacion de capacidad se mantiene identica (59,0) entre el modelo oficial y esta variante, mientras que la tasa de rechazo benigno cae del 59,2 % al 0,0 % en la suite fija del autor.

## Requisitos de hardware

- BF16 completo: aproximadamente 55,6 GB solo de pesos (27.781 millones de parametros a 2 bytes), mas overhead de KV cache y activaciones; requiere GPU de 80 GB o multi-GPU.
- GGUF Q8_0: 27,05 GiB (26,63 GiB en variante sin MTP).
- GGUF Q6_K: 20,89 GiB (20,57 GiB sin MTP).
- GGUF Q5_K_M: 18,19 GiB (17,91 GiB sin MTP), recomendada por el autor para uso general.
- GGUF Q4_K_M: 15,66 GiB (15,41 GiB sin MTP), recomendada para equilibrio a 4 bits.
- GGUF Q3_K_M: 12,57 GiB (12,39 GiB sin MTP), para despliegue con poca memoria.
- GGUF Q2_K: 10,12 GiB (9,98 GiB sin MTP), huella minima.
- Artefactos auxiliares: mmproj F16 de 0,86 GiB para entrada de imagen y MTP BF16 de 5,54 GiB como borrador independiente.
- GPU recomendadas: no disponible de forma explicita; por tamano, A100 80 GB o H100 para BF16, y GPUs consumer de 16-24 GB para Q4_K_M y Q5_K_M.
- Cabe en GPU consumer: si, con cuantizaciones Q2_K a Q5_K_M en tarjetas de 12-24 GB, sujeto al overhead de contexto y al runtime.
- Opciones de despliegue: llama.cpp (commit `885c5bbe8e04` o posterior compatible), transformers para safetensors; vLLM, TGI y Ollama no se mencionan en la informacion disponible.
- Latencia y throughput: no disponible; la unica indicacion es que MTP permite decodificacion especulativa en runtimes compatibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-JoyFox-Aggressive | 27,78 B | no disponible | 0,0 % rechazo benigno; capacidad 59,0 | apache-2.0 | safetensors + GGUF |
| Qwen/Qwen3.8-27B (base) | 27,78 B (por correspondencia del fine-tune) | no disponible | 59,2 % rechazo benigno; capacidad 59,0 | no disponible en esta ficha | checkpoint oficial de Qwen |
| Otras variantes uncensored de la misma familia | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa disponible se limita al modelo base, del que se conocen las cifras de la suite del autor. No se aportan datos de benchmarks academicos que permitan contrastar con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- La intervencion no anade conocimiento factual: el modelo puede alucinar, aceptar premisas falsas, malinterpretar la intencion o producir contenido inadecuado.
- La reduccion de rechazos se mide en una suite propia de 1.000 prompts, no en benchmarks independientes; el 0,0 % de rechazo benigno puede implicar menor proteccion ante peticiones que deberian rechazarse.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Longitud de contexto: no disponible, lo que impide planificar cargas de contexto largo con precision.
- Idiomas: la model card declara en, zh y multilingual, pero no cuantifica calidad por idioma; el castellano no figura entre los idiomas listados.
- Licencia Apache 2.0 permite uso comercial, pero el despliegue sigue siendo responsabilidad del usuario en materia de controles de seguridad y legislacion aplicable.
- Requiere llama.cpp en el commit `885c5bbe8e04` o posterior; runtimes sin soporte de la arquitectura Qwen3.8/Qwen3.5 GGUF o de MTP embebido deben usar las builds `-no-mtp`, que pierden decodificacion especulativa.
- El repositorio de 413,9 GB exige planificacion de almacenamiento y ancho de banda considerables.
- El modelo base Qwen3.8-27B es referenciado pero sus especificaciones completas (contexto, datos de entrenamiento) no se detallan en esta informacion.

## Enlaces

- Hugging Face: https://huggingface.co/joyfox/Qwen3.8-27B-Uncensored-JoyFox-Aggressive
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- README en chino: https://huggingface.co/joyfox/Qwen3.8-27B-Uncensored-JoyFox-Aggressive/blob/main/README_ZH.md
- Banner del modelo: assets/joyfox-qwen38-banner.png (referenciado en la model card)
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
