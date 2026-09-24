# chaoliangUNSW/Jev-Style-0.8B-Decision-v3

## Resumen

Jev-Style-0.8B-Decision-v3 es un modelo de decisión de 752.393.024 parámetros (etiquetado como 0,8B) desarrollado por el usuario chaoliangUNSW, publicado el 24 de septiembre de 2026 bajo licencia Apache 2.0. No es un modelo generativo: dado un estado de entrada de hasta 25.600 tokens y una pregunta con un conjunto de opciones, devuelve una distribución de probabilidad calibrada sobre cada opción en una sola pasada, sin decodificar tokens de salida. Es un ajuste fino completo del modelo base Qwen/Qwen3.5-0.8B y pertenece a la familia "Jev-Style", inspirada en el concepto de System One de Jev (TypeSafe AI): convertir entradas desordenadas en decisiones tipadas y calibradas que el software puede consumir directamente.

Su relevancia actual está en la combinación de tres factores: contexto largo verificado (98,3% de acierto sobre 1.280 ítems reales a 24.000 tokens), puntuación simultánea de hasta 77 opciones en una única pasada y cobertura multilingüe evaluada en 51 idiomas. La tercera versión de la serie reduce el tamaño de los 2B de v1 y v2 a 0,8B manteniendo o mejorando los resultados: 79,2% de acierto en 2.000 decisiones tipadas del conjunto LocalLLaMA/typed-decisions, con un Brier de 0,046 frente al 0,148 de Jev y el 0,061 del checkpoint typed de Laya.

El modelo se distribuye en cuatro formatos (safetensors bf16, GGUF, MLX bf16 y MLX 8-bit) y su versión cuantizada Q4_K_M ocupa 0,53 GB con paridad de top-1 frente a FP32 en 240 de 240 filas de paridad, lo que lo sitúa en el rango de despliegue en CPU, GPU de consumo y Apple silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder basado en Qwen/Qwen3.5-0.8B (etiqueta de arquitectura `qwen3_5_text`); ajuste fino completo para decisión en una sola pasada. No se detallan número de capas, tipo de atención ni si emplea MoE |
| Parametros totales | 752.393.024 (0,8B) |
| Parametros activos | No aplica: no se declara que el modelo sea MoE |
| Longitud de contexto | 25.600 tokens de entrada (la afirmación preregistrada de 25K se da por superada) |
| Tipos de cuantizacion | bf16 (safetensors); GGUF F16, Q8_0 y Q4_K_M; MLX bf16 y MLX 8-bit |
| Idiomas soportados | 19 declarados en la ficha: en, zh, ar, bg, de, el, es, fr, hi, ja, ko, pt, ru, sw, ta, th, tr, ur, vi. Evaluado en 51 idiomas sobre MASSIVE |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, 1,50 GB); GGUF (F16 1,52 GB, Q8_0 0,81 GB, Q4_K_M 0,53 GB); MLX (bf16 1,50 GB, 8-bit 0,80 GB) |

Datos adicionales: pipeline declarado `text-classification`; salida = distribución de probabilidad calibrada sobre hasta 77 opciones por pregunta (el mayor número probado); sin coste de tokens de salida al no existir decodificación autoregresiva.

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (`base_model_relation: finetune`) de Qwen/Qwen3.5-0.8B, cuya arquitectura se etiqueta como `qwen3_5_text` en la librería transformers. La innovación no reside en el bloque transformer, sino en la interfaz de decisión: en lugar de generar texto, el modelo lee el estado una sola vez ("one state, one pass") y emite una probabilidad calibrada para cada opción de cada pregunta planteada sobre ese estado. No hay límite por letra en las opciones, y un mismo estado puede reutilizarse para varias preguntas, lo que abarata el coste marginal por consulta. Como controles metodológicos, el autor informa de que los controles de solo-pregunta y de intercambio de estado se mantienen en el nivel de azar, y que la precisión controlada preregistrada queda dentro de 1,1 puntos de la referencia de 2K–4K tokens.

En cuanto al entrenamiento, la información disponible solo indica que v3 se entrenó con el split de entrenamiento de LocalLLaMA/typed-decisions y con 27.300 ítems tipados sintéticos procedentes de otros flujos de trabajo; el checkpoint typed de Laya también se entrenó con el mismo split. No se especifican el número total de tokens de entrenamiento, la composición del dataset, la mezcla de idiomas ni si hubo etapas de RLHF, DPO u otra alineación. Tampoco se documentan innovaciones de decodificación especulativa ni atención lineal; el ahorro de latencia declarado proviene de evitar la generación de tokens y de reutilizar un estado compartido entre varias preguntas (con `many_mode="batched"` en el runtime GGUF, 1.381 ms para 10 preguntas sobre un estado de 4K tokens frente a 6.364 ms de un motor de arquitectura Laya de primera ronda, es decir, hasta 4,6 veces más rápido).

## Capacidades

- Decisión tipada y calibrada: recibe un estado y una pregunta con opciones y devuelve una probabilidad por opción, con Brier de 0,046 y ECE muy inferior al de los checkpoints Laya desplegados (5,5 veces menor en 49 suites y 17.416 filas emparejadas).
- Puntuación de muchas opciones en una sola pasada: hasta 77 opciones probadas (clasificación 77-way de Banking77), sin límite por letra y sin decodificación de tokens de salida.
- Contexto largo: entradas de hasta 25.600 tokens; a 24.000 tokens responde correctamente el 98,3% de 1.280 ítems reales.
- Multilingüismo evaluado: 51 idiomas sobre MASSIVE intent, con macro accuracy de 71,7% y con el modelo por encima de 3 veces el azar en todos ellos.
- Enrutamiento de modelos y selección de herramienta: +30,3 puntos sobre el mejor checkpoint oficial de Laya en la tarea de model routing.
- Moderación y seguridad: +29,5 puntos de macro-F1 en toxicidad y +7,2 puntos de balanced accuracy en detección de jailbreak.
- Clasificación de intenciones en dominios con muchas etiquetas: +19,0 puntos en Banking77 (77 clases) sobre las mismas filas.
- Reutilización de estado para varias consultas: un mismo estado de 4K tokens puede alimentar hasta 10 preguntas con una sola lectura.
- No soporta, según la información disponible: generación de texto libre, tool calling, razonamiento multi-paso expresado en lenguaje natural, visión ni audio.

## Casos de uso

- Enrutamiento de modelos y herramientas: dada la consulta del usuario y un catálogo de modelos o funciones disponibles, el modelo devuelve la probabilidad de cada opción en una pasada; es el escenario donde el autor reporta la mayor ventaja (+30,3 puntos sobre el mejor checkpoint de Laya), adecuado para gateways de inferencia que necesitan decidir destino con umbral calibrado.
- Clasificación de intenciones multilingüe en asistentes: con 71,7% de macro accuracy en MASSIVE y cobertura de 51 idiomas, puede sustituir a clasificadores específicos por idioma en un único checkpoint, incluyendo el historial de conversación dentro de la ventana de 25.600 tokens.
- Guardarraíles y detección de jailbreak: +7,2 puntos de balanced accuracy sobre el mejor checkpoint de Laya en la tarea; su salida probabilística permite fijar umbrales de bloqueo ajustados al coste de falsos positivos sin reentrenar.
- Moderación de contenido y clasificación de toxicidad: +29,5 puntos de macro-F1 en la tarea reportada, con decisiones de una sola pasada que evitan la latencia y el coste de un modelo generativo como juez.
- Triaje y enrutado de tickets en banca y soporte: la clasificación 77-way de Banking77 se resuelve en una única pasada (+19,0 puntos sobre Laya), útil para enrutar tickets a colas o agentes especializados con una probabilidad por categoría.
- Decisiones de flujo de trabajo tipadas: sobre el conjunto de 2.000 decisiones de LocalLLaMA/typed-decisions alcanza 79,2% de acierto con un MAE de 0,195 en la puntuación de la pregunta, lo que permite usarlo para aprobar, escalar o descartar casos en pipelines automatizados donde se exige una confianza explícita.
- Puntuación y reordenación de candidatos: con hasta 77 opciones por pasada y sin coste de tokens de salida, encaja como scorer en pipelines de generación (por ejemplo, elegir entre variantes de código, respuestas o configuraciones) siempre que las alternativas se formulen como opciones de una pregunta tipada.
- Inferencia en local o en el borde: el archivo Q4_K_M de 0,53 GB mantiene el mismo top-1 que FP32 en 240 de 240 filas de paridad (y 6 de 6 a 16K y 25,6K tokens), por lo que es viable en portátiles, Apple silicon y CPU para clasificación y decisión offline.

## Benchmarks y rendimiento

Todos los datos proceden de la model card del autor; no se han localizado evaluaciones independientes.

| Evaluacion | Jev-Style 0.8B v3 | Referencia | Diferencia | Protocolo |
|---|---|---|---|---|
| Decisiones tipadas, accuracy (2.000 decisiones, 400 estados) | 79,2% (1.583/2.000; IC 95% 77,3–80,9) | Laya typed: 76,6%; Jev: 72,7% | +2,6 pts [+1,0, +4,2] vs Laya; +6,4 vs Jev | v3 y Laya in-domain (train split); Jev zero-shot vía API |
| Decisiones tipadas, soft accuracy | 52,4% | Laya typed: 47,1% | +5,4 pts [+5,0, +5,7] | Filas idénticas, bootstrap pareado |
| Brier vs etiquetas soft | 0,046 | Laya typed: 0,061; Jev: 0,148 | −0,016 [−0,019, −0,012] vs Laya; 3,2x mejor que Jev | Filas idénticas |
| Score-question MAE | 0,195 | Laya typed: 0,242 | −0,047 [−0,060, −0,035] | Filas idénticas |
| MASSIVE intent, macro accuracy (51 idiomas) | 71,7% | Laya multilingual: 40,1% | +31,7 pts | Por delante en 51 de 51 idiomas; >3x azar en todos |
| MASSIVE, 37 locales retenidos del entrenamiento | no disponible (valor absoluto) | Laya | +29,4 pts | Filas idénticas |
| JevBench v1.4.1, zero-shot | 64,1% | Laya: 58,4% | +5,7 pts | 231 ítems públicos; mejor que todo sistema basado en Qwen3.5-0.8B del tablero |
| Model routing | no disponible (valor absoluto) | Mejor checkpoint oficial de Laya | +30,3 pts | Filas idénticas; IC 95% pareado excluye cero |
| Toxicidad, macro-F1 | no disponible (valor absoluto) | Mejor checkpoint oficial de Laya | +29,5 pts | Filas idénticas |
| Banking77 (77 clases) | no disponible (valor absoluto) | Mejor checkpoint oficial de Laya | +19,0 pts | Filas idénticas |
| Jailbreak, balanced accuracy | no disponible (valor absoluto) | Mejor checkpoint oficial de Laya | +7,2 pts | Filas idénticas |
| NLL / Brier / ECE agregados | — | Mejor checkpoint de Laya tal como se despliega | 4,5x / 3,0x / 5,5x menores | 49 suites, 17.416 filas emparejadas |
| Contexto largo a 24.000 tokens | 98,3% de acierto | — | — | 1.280 ítems reales; controles de solo-pregunta y state-swap en azar; dentro de 1,1 pts de la referencia 2K–4K |

## Requisitos de hardware

- VRAM estimada (derivada del tamaño de pesos, no publicada por el autor): aproximadamente 1,5 GB de pesos en bf16, más activaciones y caché KV; en la práctica cabe en cualquier GPU con 4 GB o más. En Q4_K_M los pesos bajan a 0,53 GB.
- GPU recomendadas: no hay lista oficial. El autor indica ejecución en PyTorch sobre CUDA, Apple MPS o CPU. Dado el tamaño, cualquier GPU consumer moderna (RTX 3060/4060 o superior) es sobrada; A100 o H100 solo tendrían sentido por agregación de peticiones.
- Cabe en GPU de consumo: sí, en todas las gamas actuales y también en GPU integradas y en CPU, especialmente con Q4_K_M (0,53 GB) y Q8_0 (0,81 GB).
- Apple silicon: soporte específico vía mlx-lm con los pesos MLX bf16 (1,50 GB) y MLX 8-bit (0,80 GB).
- Opciones de despliegue: script `jev_style_decision.py` con PyTorch (CUDA/MPS/CPU); llama.cpp junto con el scorer `jev-score` que acompaña a los GGUF; mlx-lm en Apple silicon. No se mencionan vLLM, TGI ni Ollama, por lo que su compatibilidad con esos servidores no está confirmada.
- Latencia y throughput: el único dato publicado es una comparación entre runtimes, no del modelo aislado: 1.381 ms para 10 preguntas que comparten un estado de 4K tokens con `many_mode="batched"`, frente a 6.364 ms de un motor de arquitectura Laya de primera ronda con una llamada por pregunta (hasta 4,6x más rápido). No se publican cifras de throughput ni de latencia por pregunta suelta. Como referencia externa, la API de Jev (no este checkpoint) declara 70–500 ms por decisión.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento clave | Disponibilidad |
|---|---|---|---|---|---|
| Jev-Style-0.8B-Decision-v3 | 752.393.024 (0,8B) | 25.600 tokens | Apache 2.0 | 79,2% en decisiones tipadas; 71,7% macro accuracy en MASSIVE (51 idiomas); 64,1% zero-shot en JevBench v1.4.1 | HuggingFace: safetensors, GGUF, MLX (2 repos adicionales) |
| Jev-Style 2B v1 / v2 | 2B (no se detalla el número exacto) | no disponible | no disponible en la informacion proporcionada | v3 supera a v2 en +5,7 puntos en decisiones tipadas | v2 en HuggingFace; v1 en GGUF |
| Jev (TypeSafe AI) | no disponible | no disponible | propietaria, acceso vía API | 72,7% en decisiones tipadas (zero-shot); Brier 0,148 | API de pago; 70–500 ms declarados por decisión |
| Laya (checkpoints oficiales typed y multilingual) | no disponible | no disponible | no disponible en la informacion proporcionada | 76,6% en decisiones tipadas; 40,1% macro accuracy en MASSIVE; 58,4% en JevBench v1.4.1 | Checkpoints públicos según la model card |
| Qwen/Qwen3.5-0.8B (modelo base) | 0,8B | no disponible | no disponible en la informacion proporcionada | No es un modelo de decisión; no puntúa opciones con calibración declarada | HuggingFace |
| NanoJev (réplica de la comunidad) | 0,6B | no disponible | no disponible en la informacion proporcionada | Replica el esquema de decisión paralela sin decodificación de tokens | GitHub (TianyuCodings/NanoJev) |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni mantiene conversaciones. Requiere formular estado, pregunta y opciones en el formato tipado esperado; usarlo como chatbot o como LLM de propósito general no es viable.
- Dependencia de harness: la decodificación de decisiones requiere el script `jev_style_decision.py` (PyTorch) o el scorer `jev-score` (llama.cpp). No es un pipeline estándar de transformers pese a declarar `text-classification`.
- Resultados autopublicados: todas las cifras provienen de la model card del autor. v3 y el checkpoint typed de Laya se entrenaron con el train split del mismo conjunto (typed-decisions), por lo que esa comparación es in-domain para ambos; la cifra de Jev es zero-shot y procede de la dataset card.
- Sin validación externa ni adopción: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no se han localizado evaluaciones independientes ni replicaciones de los números.
- Riesgo de fallo silencioso: al no generar texto, el modo de error no es la alucinación textual, sino una probabilidad mal calibrada o una decisión incorrecta sin rastro textual. La afirmación de "cero alucinaciones" es del proveedor de Jev y no se ha verificado para este checkpoint.
- Límite de opciones: el máximo probado es de 77 opciones por pasada; no se documenta comportamiento por encima de ese número ni con preguntas de estructura distinta.
- Cobertura idiomática: la ficha declara 19 idiomas, mientras que la evaluación cubre 51; no se publica el desglose de rendimiento por idioma, solo que se supera 3 veces el azar en todos y que se está por delante de Laya multilingual en 51 de 51. El castellano está entre los 19 declarados, pero sin métrica propia publicada.
- Contexto: los 25.600 tokens son el máximo probado; el control de 24K se hizo con 1.280 ítems, y no se detalla la degradación entre 4K y 25,6K más allá de la comparación con la referencia de 2K–4K.
- Información de entrenamiento incompleta: no se especifican número de tokens, composición del dataset, idiomas de entrenamiento ni etapas de alineación (RLHF/DPO), lo que dificulta anticipar sesgos. La model card proporcionada está truncada (la sección final, "Beyond ...", queda incompleta).
- Licencia: Apache 2.0 permite uso comercial y modificación, pero conviene revisar las condiciones de los artefactos derivados (GGUF, MLX) y del runtime `jev-score`, así como el uso de la denominación "Jev-Style" vinculada a la marca de TypeSafe AI.
- Fecha de publicación: el repositorio figura creado y actualizado el 24 de septiembre de 2026, con una ventana de publicación de menos de un minuto entre creación y última actualización; no hay historial de versiones ni issues que permitan evaluar su mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chaoliangUNSW/Jev-Style-0.8B-Decision-v3
- Versión GGUF (F16 / Q8_0 / Q4_K_M): https://huggingface.co/chaoliangUNSW/Jev-Style-0.8B-Decision-v3-GGUF
- Versión MLX bf16: https://huggingface.co/chaoliangUNSW/Jev-Style-0.8B-Decision-v3-MLX-bf16
- Versión MLX 8-bit: https://huggingface.co/chaoliangUNSW/Jev-Style-0.8B-Decision-v3-MLX-8bit
- Versión anterior v1 (2B, GGUF): https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-GGUF
- Versión anterior v2 (2B): https://huggingface.co/chaoliangUNSW/Jev-Style-Qwen3.5-2B-Decision-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Sitio del autor: https://jevstyle.com
- Jev AI (TypeSafe AI): https://jevai.net/
- Documentación de la API de Jev: https://www.jevai.org/jev-api
- Demo de Jev: https://jevtypesafeai.com/
- Réplica comunitaria NanoJev: https://github.com/TianyuCodings/NanoJev
