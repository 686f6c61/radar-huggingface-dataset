# RoundRobin237/SenseNova-Loop-9B-Heretic-GSQ-RCO-IQ2

## Resumen

SenseNova-Loop-9B-Heretic-GSQ-RCO-IQ2 es una cuantización GGUF de 2 bits del modelo multimodal SenseNova-Loop-9B, publicada por el usuario RoundRobin237. El modelo base, desarrollado por SenseNova (OpenSenseNova), es un transformer multimodal de 9.200 millones de parámetros que genera texto a partir de texto e imágenes, con una arquitectura poco habitual basada en reutilización de capas ("loop"): almacena 32 capas de decoder pero ejecuta 56 visitas por forward pass reutilizando las capas 4 a 27.

Esta release concreta aplica dos transformaciones sobre los pesos BF16 oficiales. Por un lado, una ablación de rango arbitrario (Heretic ARA) que reduce drásticamente la tasa de rechazo del modelo, de 100/100 a 4/100 coincidencias en el scorer de palabras clave de Heretic sobre 100 prompts dañinos. Por otro, una cuantización de precisión mixta GSQ RCO que deja el modelo principal en 3,23 GB con un promedio de 2,7997 bits por peso.

Su relevancia práctica es doble: permite ejecutar un modelo multimodal de ~9B con ventana de contexto verificada de 131.072 tokens en una GPU de consumo, y ofrece una variante "abliterated" que elimina los rechazos del modelo original. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con reutilización de capas (loop) y atención híbrida con hyper-conexiones de variedad restringida de dos flujos (mHC) |
| Parametros totales | 9.200.240.000 (9,2B) |
| Parametros activos | No aplica (no es MoE); 32 capas de decoder almacenadas, 56 visitas de capa por forward pass |
| Longitud de contexto | 512K tokens en el modelo oficial; 131.072 tokens verificados en esta release GGUF |
| Tipos de cuantizacion | IQ2_XS (157 tensores), IQ2_S (42), IQ3_S (1), Q3_K (1, embeddings), Q4_K (9, cabeza de salida y matrices MTP), F32 (280, routing mHC, normalización y tensores FP32 de origen); promedio 2,7997 bits por peso |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector visual en GGUF F16 separado |

## Arquitectura y entrenamiento

El modelo base SenseNova-Loop-9B emplea una arquitectura de reutilización de capas: solo almacena 32 capas de decoder físicas pero las recorre 56 veces por forward pass, reutilizando las capas 4 a 27 en una segunda visita. El decoder combina atención híbrida con hyper-conexiones de variedad restringida de dos flujos (mHC), una variante de las hyper-connections que restringe el espacio de mezcla entre flujos residuales. Incorpora además pesos MTP (multi-token prediction), que en esta release se conservan en Q4_K y F32 y actúan como borrador para decodificación especulativa.

Sobre el modelo oficial se aplicó Heretic ARA (Arbitrary-Rank Ablation) sobre los pesos BF16. El procedimiento recogió activaciones de entrada y salida de ambas visitas de cada capa compartida para el mismo peso físico, y fusionó un adaptador seleccionado en 24 tensores de proyección de salida de atención y MLP en las capas 15 a 26. Se eligió el candidato 26 de 30, el de menor divergencia KL entre los que quedaban a menos de cinco puntos porcentuales del mejor score de rechazo con KL ≤ 0,15. El encoder visual, los routers mHC y el checkpoint MTP se preservaron intactos durante la fusión BF16.

La cuantización GSQ RCO se calibró sobre el modelo Heretic BF16 con 20 fragmentos de 512 tokens de prosa inglesa, código Python y texto coreano. GSQ perfiló IQ2_XS, IQ2_S e IQ3_S sobre 48 filas muestreadas de cada tensor elegible, comparando codificaciones nativas del codebook GGML con importancia de activación calibrada y una versión suavizada, reajustando escalas FP16 y usando Gumbel-Softmax para seleccionar la codificación bajo una pérdida de reconstrucción ponderada por activación. RCO asignó formatos bajo un presupuesto de 2,80 bits por peso, dando el doble de peso a las capas repetidas para contabilizar sus dos visitas. El 75,2% de los parámetros quedan en formatos IQ2.

## Capacidades

- Generación de texto a partir de texto e imágenes (pipeline image-text-to-text): el modelo procesa entradas multimodales mediante un proyector visual F16 separado.
- Contexto largo verificado: procesó 131.008 tokens de entrada y recuperó un marcador exacto situado al inicio del prompt, con caché KV en Q8_0.
- Razonamiento y generación conversacional multi-turno.
- Capacidades multilingües limitadas a inglés y chino.
- Decodificación especulativa mediante los pesos MTP embebidos en el GGUF principal.
- Modo "abliterated": la ablación Heretic elimina prácticamente los rechazos (4/100 frente a 100/100 del original en el scorer de palabras clave).
- No se ha documentado soporte explícito de tool calling o function calling en la información disponible.

## Casos de uso

- Procesamiento de documentos largos con imagen: análisis de informes, contratos o expedientes de hasta ~128K tokens combinando texto e imágenes escaneadas, gracias a la ventana verificada y al proyector visual.
- Asistente local en GPU de consumo: el modelo principal ocupa 3,23 GB, por lo que cabe en GPUs consumer con 8-12 GB de VRAM, permitiendo asistentes conversacionales privados sin conexión.
- Investigación sobre alineación y seguridad: la variante Heretic permite estudiar el comportamiento de un modelo con rechazos suprimidos y medir su divergencia KL (0,0735 en primer token) respecto al original.
- Extracción de información de capturas y diagramas: transcripción y descripción de imágenes técnicas en inglés o chino dentro de pipelines de documentación.
- Evaluación de cuantización extrema: caso de estudio de GSQ RCO e IQ2 en un modelo con reutilización de capas, útil para investigar el impacto de 2,8 bits por peso en tareas multimodales.
- Despliegue embebido o en portátiles: con 4,1 GB de repo total (modelo + proyector) se puede servir con llama.cpp en equipos con recursos limitados, como demuestra la validación en una RTX 5090 Laptop.
- Resumen y QA sobre corpus bilingües inglés-chino de gran extensión, aprovechando el contexto de 128K.

## Benchmarks y rendimiento

| Evaluación | BF16 oficial | Heretic BF16 |
|---|---:|---:|
| Coincidencias KeywordRate de Heretic en 100 prompts | 100/100 | 4/100 |
| Divergencia KL en primer token (100 prompts) | 0,0000 | 0,0735 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las métricas anteriores corresponden a los checkpoints BF16 y miden la supresión de rechazos y la divergencia respecto al original, no calidad de tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo principal pesa 3,23 GB y el proyector visual 0,92 GB; con caché KV Q8_0 a 131.072 tokens el consumo real es notablemente mayor y depende del tamaño del lote y de la GPU.
- Validado en una RTX 5090 Laptop GPU con `-ngl 99`, `-b 1024`, `-ub 512`, `-fa on`, caché K y V en Q8_0 y un solo slot de inferencia.
- Cabe en GPUs consumer: con 4,15 GB de pesos más caché, es viable en tarjetas de 8 GB o más para contextos moderados; para 128K reales se recomienda 16 GB o más.
- Despliegue: exclusivamente llama.cpp (build específico de SenseNova en el repositorio OpenSenseNova), mediante `llama-server` con `--jinja` y `--no-context-shift`. Requiere el binario con soporte de la arquitectura loop y mHC.
- Throughput y latencia: no disponibles en la información proporcionada; el registro de validación incluye timings pero no se han transcrito aquí.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-Heretic-GSQ-RCO-IQ2 | 9,2B | 128K verificado (512K oficial) | Sí | Apache 2.0 | GGUF en HF |
| SenseNova-Loop-9B (oficial) | 9,2B | 512K | Sí | Apache 2.0 | BF16 en HF |
| Otras cuantizaciones IQ2 de modelos ~9B | ~9B | Variable | Depende del base | Según base | GGUF en HF |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La ablación Heretic suprime los rechazos del modelo: solo 4 de 100 prompts dañinos activan el scorer de palabras clave. Esto elimina una capa de seguridad relevante para despliegues en producción orientados al público.
- La divergencia KL de 0,0735 en el primer token indica un cambio medible en la distribución de salida respecto al modelo oficial, con posible degradación en tareas sensibles a la calibración original.
- La cuantización IQ2 a 2,7997 bits por peso implica pérdida de precisión; no se han publicado evaluaciones de calidad de tarea para este artefacto, solo validación de contexto y generación de respuesta.
- Idiomas limitados a inglés y chino; el castellano no está soportado oficialmente.
- El corpus de calibración incluyó texto coreano aunque el modelo no declara ese idioma, lo que puede sesgar la asignación de precisión hacia ese dominio.
- Requiere un build específico de llama.cpp (fork de OpenSenseNova); no funciona con versiones estándar sin soporte de la arquitectura loop y mHC.
- El contexto de 128K está verificado con caché Q8_0 y un solo slot; contextos mayores no están validados en esta release.
- Riesgo de alucinación no cuantificado en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el autor advierte que esta release modifica los pesos oficiales mediante Heretic ARA y cuantización mixta; la responsabilidad sobre el comportamiento derivado recae en el desplegador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RoundRobin237/SenseNova-Loop-9B-Heretic-GSQ-RCO-IQ2
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Repositorio oficial de la arquitectura: https://github.com/OpenSenseNova/SenseNova-Loop
- Build de llama.cpp para SenseNova: https://github.com/OpenSenseNova/llama.cpp
- Heretic (ablación de rechazos): https://github.com/p-e-w/heretic
- AutoGSQ-RCO (cuantización): https://github.com/Egalitaristen/AutoGSQ-RCO
- Dataset harmful_behaviors: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset harmless_alpaca: https://huggingface.co/datasets/mlabonne/harmless_alpaca
