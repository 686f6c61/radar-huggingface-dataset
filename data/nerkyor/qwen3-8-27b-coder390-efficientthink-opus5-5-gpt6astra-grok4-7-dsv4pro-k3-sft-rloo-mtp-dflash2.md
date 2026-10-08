# nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2

## Resumen

Este repositorio publica un ajuste posterior (post-training) del modelo Qwen3.8-27B, desarrollado por el usuario de HuggingFace nerkyor. La cadena declarada es: Qwen3.8-27B oficial → SFT + SimPO110 (la base "EfficientThink", sin censura) → SFT de continuación K3 → SFT de semana 2 → primera ronda RLOO (182 grupos) → nueva ronda SFT → segunda ronda RLOO (172 grupos) → Coder390. El resultado son cinco niveles de safetensors (BF16, FP8 estático Block128, NVFP4 W4A16, NVFP4 W4A4 y NVFP4 W4A4-W8A8), más INT8 W8A8, NInfer W4A4 y GGUF, todos multimodales (texto + imagen/vídeo) y con la cabeza MTP BF16 incluida.

El problema que aborda es concreto: el modelo original ya tiene la respuesta local, pero sigue rederivando con fórmulas del tipo "Wait / Actually" hasta agotar el contexto de 94K y termina sin respuesta final. El entrenamiento con RLOO penaliza respuestas vacías y truncadas, y según la model card las truncaciones a 94K bajan de 4 a 1 en GPQA y de 13 a 3 en LCB.

La relevancia está en el empaquetado de despliegue: carga en SGLang sin parches, el paquete FP8 está probado en vLLM y ofrece GGUF para llama.cpp con MTP integrado. Incluye dos opciones mutuamente excluyentes de decodificación especulativa (MTP y el draft DFlash2), con unas 180 tok/s por petición frente a 46 tok/s sin especulación. La licencia es Apache 2.0 y los idiomas declarados son inglés y chino.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (pipeline image-text-to-text) de la familia Qwen3.8, con cabeza MTP (multi-token prediction) BF16 incluida y draft de decodificación especulativa DFlash2; la model card no detalla el diseño interno más allá de esto |
| Parametros totales | 460.730.096 según los metadatos de safetensors, cifra incoherente con la denominación "27B" del nombre del modelo; no disponible una cifra fiable |
| Parametros activos | no disponible (no se declara arquitectura MoE en la información) |
| Longitud de contexto | hasta 100K según el protocolo de evaluación declarado; el límite de truncación observado en las pruebas es 94K. El gráfico comparativo de la model card hace referencia a un ajuste a 8K |
| Tipos de cuantizacion | BF16; FP8 estático Block128; FP8 dinámico; NVFP4 W4A16; NVFP4 W4A4; NVFP4 W4A4-W8A8 (precisión mixta); NInfer W4A4 y W4A4-W8A8; INT8 W8A8 (solo texto); GGUF Q2, Q3, Q4 LynnStyle, Q6_K y Q8_0 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con compressed-tensors y ModelOpt en las variantes cuantizadas), GGUF, NVFP4-NInfer; MTP BF16 empaquetado |

Otros datos del repositorio: 1.131 descargas, 13 likes, tamaño total del repositorio 693,7 GB, creado el 2026-10-04 y actualizado el 2026-10-08.

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna más allá de indicar que deriva del Qwen3.8-27B y que es multimodal (texto e imagen/vídeo). Sí detalla el proceso de post-entrenamiento, que combina rondas alternas de SFT y RLOO sobre una base ya sometida a SFT y SimPO. La línea de evaluación declarada, en formato GPQA / MMLU / LCB sobre las suites completas y con el mismo protocolo de 100K, es la siguiente: Qwen3.8-27B oficial (177 / 444 / 83) → base EfficientThink SFT + SimPO110 (171 / 442 / 89) → SFT de continuación K3 → SFT de semana 2 (week2dose, update-225) → primera ronda RLOO de 182 grupos → ronda SFT merge-sft-100, que da sft-base-rloo (177 / 448 / 90) → segunda ronda RLOO de 172 grupos → Coder390 (178 / 445 / 90, FP8 dinámico).

Los datos de RLOO se construyeron muestreando 8 trayectorias por problema y conservando solo los grupos con trayectorias correctas e incorrectas (se descartan los grupos con todas correctas). Los grupos con 0 o 1 trayectoria correcta recibieron una trayectoria docente corta revisada, que sustituyó a la trayectoria incorrecta más corta del grupo (27 grupos). El conjunto final son 172 grupos y 1.376 trayectorias: 859 correctas y 517 incorrectas, incluidas 68 respuestas vacías. La función de recompensa penaliza únicamente las trayectorias incorrectas, de modo que el razonamiento largo pero correcto sigue recibiendo recompensa positiva y no se suprime:

| Caso | Recompensa |
|---|---:|
| Corta y correcta (<24K) | +1,05 |
| Larga y correcta | +1,0 |
| Corta e incorrecta (<24K) | −0,2 |
| Incorrecta, 24K–48K | −0,5 |
| Incorrecta, ≥48K | −0,7 |
| Alcanza 94K con letra de respuesta pero incorrecta | −0,9 |
| Respuesta vacía | −1,0 |

Como innovaciones técnicas destacables, el repositorio incorpora decodificación especulativa con dos mecanismos alternativos (la cabeza MTP empaquetada y el draft DFlash2), calibración Hessian/imatrix con cuantización estática por bloques de 128, y soporte declarado de SGLang sin parches.

## Capacidades

- Generación de texto y razonamiento de cadena larga, con un objetivo explícito de eliminar colas de razonamiento improductivas sin eliminar el razonamiento largo necesario.
- Codificación: la model card declara 90/100 en LCB bajo el protocolo de evaluación indicado.
- Razonamiento científico y de conocimiento: 178/198 en GPQA y 450/500 en MMLU según la sección de resultados (véase la discrepancia en la sección de benchmarks).
- Capacidad multimodal de entrada: pipeline image-text-to-text, con soporte declarado de texto, imagen y vídeo en todas las variantes safetensors.
- Decodificación especulativa integrada: cabeza MTP BF16 empaquetada y draft DFlash2 (mutuamente excluyentes).
- Cuantización lista para producción: FP8 estático, NVFP4 en varias combinaciones de pesos y activaciones, INT8 W8A8 (solo texto) y GGUF para llama.cpp.
- Modo "uncensored" declarado en la etiqueta del modelo base, orientado a respuestas sin filtrado de contenido.
- Idiomas: inglés y chino (en, zh). No se declara soporte de español.
- Tool calling / function calling y comportamiento de agente multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Razonamiento científico asistido: el modelo está entrenado específicamente para no quedarse atrapado rederivando. En tareas tipo GPQA resulta adecuado porque el fallo original (agotar 94K sin respuesta final) se reduce de 4 a 1 casos sobre 198 preguntas bajo el protocolo declarado.
- Generación de código en producción: con 90/100 en LCB, puede integrarse en asistentes de repositorio, revisión de parches o generación de tests. La variante FP8 estática es la recomendada por el autor para despliegue, y el INT8 W8A8 sirve cuando solo se necesita texto.
- Agentes con contexto largo: la ventana de 100K permite mantener conversaciones o sesiones de trabajo con historiales extensos y documentos completos sin trocear, aunque el truncamiento a 94K sigue siendo un límite real a vigilar.
- Análisis de documentos con imágenes: al ser image-text-to-text, sirve para extraer y razonar sobre tablas, capturas, diagramas o fotogramas de vídeo mezclados con texto en el mismo contexto.
- Despliegue de alta concurrencia en servidores: con C8 por GPU y dos RTX PRO 6000, el autor reporta unas 180 tok/s por petición con DFlash2, 91 tok/s con MTP y 46 tok/s sin especulación, lo que permite dimensionar coste por token en servicios de inferencia.
- Inferencia local en estación de trabajo: mediante los GGUF Q4/Q6 y llama.cpp u Ollama, es viable ejecutar el modelo en hardware de consumo cuando no se necesita la máxima fidelidad numérica, a cambio de perder parte del rendimiento multimodal.
- Investigación en seguridad y red teaming: la variante sin censura permite estudiar comportamientos no filtrados, comparar con la base alineada y generar conjuntos de evaluación de robustez con supervisión humana.
- Generación de datos sintéticos de razonamiento: su perfil de "parada correcta" lo hace útil para producir trayectorias de cadena de pensamiento etiquetadas como positivas o negativas en función de la recompensa definida en la model card.

## Benchmarks y rendimiento

Resultados declarados por el autor, suites completas bajo el mismo protocolo de 100K:

| Modelo | GPQA | MMLU | LCB | Cuantizacion |
|---|---|---|---|---|
| Qwen3.8-27B oficial | 177/198 | 444/500 | 83/100 | no especificada |
| Base EfficientThink (SFT + SimPO110) | 171 | 442 | 89 | no especificada |
| sft-base-rloo | 177 | 448 | 90 | no especificada |
| Coder390 | 178 | 445 | 90 | FP8 dinámico |
| Coder390 | 178/198 | 450/500 | 90/100 | FP8 estático (Block128) |

Nota: la model card ofrece 445/500 en MMLU para Coder390 en la descripción del linaje y 450/500 en la sección de "sin regresión"; se reproducen ambos valores tal cual aparecen, sin resolver la discrepancia.

Otros datos de rendimiento declarados:

| Metrica | Valor |
|---|---|
| Truncaciones a 94K en GPQA | 4 en el modelo original → 1 en Coder390 |
| Truncaciones a 94K en LCB | 13 en el modelo original → 3 en Coder390 |
| Tokens por segundo y petición con DFlash2 | ~180 |
| Tokens por segundo y petición con MTP | ~91 |
| Tokens por segundo y petición sin especulación | ~46 |
| Estabilidad de cuantización | GPQA y LCB idénticos entre BF16, FP8 dinámico y FP8 estático |

No se han publicado resultados de benchmarks independientes ni verificables en la información disponible; todas las cifras proceden de la model card del autor.

## Requisitos de hardware

- Configuración de evaluación declarada por el autor: dos GPU RTX PRO 6000, concurrencia C8 por GPU, contexto de 100K.
- VRAM estimada: no publicada por el autor. Como estimación aritmética a partir del nombre del modelo, 27B de parámetros ocuparían en FP8 unos 27 GB solo en pesos, más caché KV a 100K; sin embargo, el recuento de safetensors del repositorio (460.730.096 parámetros) daría menos de 1 GB en FP8. La contradicción entre ambos datos impide dar una cifra fiable.
- GPU recomendadas: RTX PRO 6000 (Blackwell) para las variantes NVFP4 y FP8, que son las probadas por el autor. Para H100 o A100 habría que validar el soporte de NVFP4 por cuenta propia.
- GPU de consumo: no hay datos publicados. Las variantes GGUF Q2/Q3/Q4/Q6/Q8 con llama.cpp son la vía prevista para hardware limitado, pero el tamaño real del modelo hace que la viabilidad dependa del recuento de parámetros, que está en disputa.
- Opciones de despliegue: SGLang (todas las variantes safetensors, sin parches), vLLM (el paquete FP8 está probado), llama.cpp y NInfer (GGUF y NVFP4-NInfer), además de INT8 W8A8 para texto.
- Latencia y throughput: ~180 tok/s por petición con DFlash2, ~91 tok/s con MTP y ~46 tok/s sin especulación, en la configuración de dos RTX PRO 6000 con C8 por GPU.
- Espacio en disco: el repositorio completo ocupa 693,7 GB; conviene descargar solo el nivel de cuantización necesario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GPQA / MMLU / LCB | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Coder390 (este modelo) | 460,7 M según safetensors; "27B" en el nombre (dato en disputa) | 100K (truncación a 94K) | 178 / 445-450 / 90 (FP8) | apache-2.0 | HuggingFace, variantes safetensors, GGUF, INT8, NInfer |
| Qwen3.8-27B oficial | 27B según el nombre | 100K según el protocolo citado | 177 / 444 / 83 | no disponible en la información | HuggingFace (Qwen/Qwen3.8-27B) |
| EfficientThink base (SFT + SimPO110) | mismo linaje que el modelo evaluado | 100K según el protocolo citado | 171 / 442 / 89 | apache-2.0 (según la ficha del derivado) | HuggingFace (nerkyor) |
| sft-base-rloo (ronda intermedia) | mismo linaje | 100K | 177 / 448 / 90 | no disponible en la información | no publicado como repositorio independiente según los datos disponibles |

Alternativas de otros fabricantes con tamaño nominal similar: no disponible en la información proporcionada; no se aportan comparaciones con Llama, Mistral, DeepSeek u otros.

## Limitaciones y advertencias

- La etiqueta "uncensored" del modelo base indica ausencia de alineación de seguridad fuerte. No es adecuado para aplicaciones de cara al público sin filtros adicionales.
- Riesgo de alucinación inherente a un modelo de razonamiento con RLHF/RLOO ligero; el entrenamiento se centró en la parada, no en la veracidad.
- El fallo de truncación no se elimina por completo: persiste 1 caso sobre 198 en GPQA y 3 sobre 100 en LCB.
- Idiomas soportados únicamente inglés y chino. El español no está declarado; el rendimiento en castellano es no disponible y probablemente inferior.
- Discrepancia grave en las especificaciones: el nombre indica 27B, pero los metadatos de safetensors declaran 460.730.096 parámetros. Cualquier planificación de VRAM, coste o latencia basada en el tamaño es poco fiable hasta resolver la contradicción.
- Los nombres que aparecen en el identificador del modelo (Opus5.5, GPT6Astra, Grok4.7, DSV4Pro, K3) no corresponden a modelos públicos identificables, y no se aportan papers, informes técnicos ni artefactos de entrenamiento. La procedencia de los datos docentes no es verificable.
- Todos los benchmarks son autoinformados por el autor y no hay evaluación independiente. No se declara si los conjuntos de GPQA, MMLU y LCB usados están separados de los datos de entrenamiento, por lo que no puede descartarse contaminación.
- Validación comunitaria muy baja: 1.131 descargas y 13 likes en el momento de redactar esta ficha.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base y de los posibles datos docentes de terceros antes de un despliegue comercial.
- El repositorio completo ocupa 693,7 GB; descargarlo entero es poco práctico y conviene seleccionar una única variante de cuantización.
- INT8 W8A8 es solo texto: pierde la capacidad multimodal.
- En producción con contexto de 100K, la caché KV y el coste por petición son elevados; el uso de decodificación especulativa obliga a elegir entre MTP y DFlash2, no ambos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2
- Modelo base (EfficientThink SFT + SimPO): https://huggingface.co/nerkyor/Qwen3.8-27B-EfficientThink-Uncensored-K3-Opus5-Grok4.6-GPT5.6Sol-SFT-SimPO-DFlash2
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF / GGUF-NInfer (llama.cpp, NInfer, MTP integrado): https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-GGUF-NInfer
- GGUF-NInfer en ModelScope: https://modelscope.cn/models/Merkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-GGUF-NInfer
- NVFP4-NInfer: https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-NVFP4-NInfer
- NVFP4-NInfer en ModelScope: https://modelscope.cn/models/Merkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-NVFP4-NInfer
- Papers, informes técnicos o demos adicionales: no disponible en la información proporcionada.
