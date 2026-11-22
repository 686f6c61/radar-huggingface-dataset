# carsenk/Inkling-2-Mini-ROGUE-GGUF

## Resumen

Inkling-2-Mini-ROGUE-GGUF es una familia de cuantizaciones GGUF para llama.cpp del modelo thinkingmachines/Inkling-2-Mini, un transformer MoE con arquitectura "looped" (capas que se ejecutan varias veces por token) y capacidad de entrada de imagen. El autor, carsenk, ha aplicado sobre los pesos originales la técnica ROGUE de WeightDojo, un método de edición de pesos que estima direcciones de rechazo a partir de contrastes de activaciones entre prompts dañinos e inocuos y las elimina mediante proyección ortogonal de bajo rango en las matrices que escriben en el flujo residual. El resultado es un modelo que responde a prompts que el original rechazaba, sin pasar por prompts de sistema, adaptadores ni filtros en tiempo de inferencia.

El interés técnico de esta ficha no está en el modelo base (del que la información disponible es escasa), sino en el proceso de edición: ROGUE se aplica aquí sobre un MoE con 128 expertos enrutados, sin experto compartido, con empaquetado nativo NVFP4/MXFP8, convoluciones cortas post-escritura y un núcleo de capas recurrentes (capas 6-17 ejecutadas tres veces). El autor documenta el coste de la edición en términos de deriva de distribución (ratio de perplejidad 1,116, KL medio 0,130 sobre wikitext-2) y de capacidades (caída de IFEval de 75,0% a 67,5% en prompt-level strict con Q8_0 y 40 muestras).

La relevancia es doble: por un lado, es un ejemplo práctico de hasta dónde llega la edición de pesos frente al alineamiento por rechazo; por otro, sirve como referencia de ingeniería para quien necesite cuantizar y ejecutar arquitecturas MoE con capas recurrentes y visión en llama.cpp, ya que requiere una versión del runtime posterior al commit 6792507 (el PR ggml-org/llama.cpp#32694 aterrizó el 21 de noviembre de 2026).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Inkling 2 looped MoE (transformer con capas recurrentes), 24 capas, con torre de visión |
| Parametros totales | no disponible |
| Parametros activos | 8 expertos enrutados activos por token de 128 totales (parámetros activos en valor absoluto: no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M (GGUF); el checkpoint nativo usa NVFP4 y MXFP8 en capas 20-23 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); safetensors NVFP4/MXFP8 y MLX 4-bit en repos hermanos |

## Arquitectura y entrenamiento

El modelo base es un MoE con 24 capas en el que las capas 6 a 17 se ejecutan tres veces por token (núcleo recurrente o "looped"), con 128 expertos enrutados y 8 activos por token, sin experto compartido. Cada salida de atención (`wo_ud`) y cada proyección descendente de experto enrutado (`w2`) pasa por una convolución causal depthwise corta antes de llegar al flujo residual. El checkpoint oficial empaqueta los expertos enrutados en NVFP4, con MXFP8 en las capas 20-23. La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

La edición ROGUE se aplica sobre los pesos, no sobre el prompt ni mediante adaptadores. Estima direcciones de rechazo con contrastes de activaciones entre prompts dañinos e inocuos, puntúa profundidades candidatas sobre prompts reservados con preservación del subespacio benigno y aplica una proyección ortogonal de bajo rango a las matrices que escriben en el flujo residual. En este modelo se seleccionaron las capas 13, 14 y 9 (cono de concepto de rango 3) y se editaron 16 tensores escritores en las capas 8, 9, 10, 12, 13, 14, 15 y 16, con subespacio consciente de convolución de rango 15 por escritor. La receta exacta es `weightdojo convert --scope residual-writers --mlp-scale 1.0 --rank 3 --strength 1.4 --group-calibration --calibration-samples 32 --max-harmless-projection 0.30`. Los expertos editados se decodifican desde su empaquetado nativo, se editan en float32 y se recodifican en el mismo formato; los tensores no tocados quedan idénticos byte a byte. La torre de visión y la cabeza MTP no se editan. Todas las cuantizaciones provienen de un único GGUF BF16 del checkpoint ROGUE, generado con llama.cpp en el commit 6792507.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Entrada de imagen (pipeline image-text-to-text) mediante el encoder de visión `mmproj-Inkling-2-Mini-ROGUE-BF16.gguf`, no modificado por ROGUE.
- Razonamiento aritmético y matemático básico: GSM8K 5-shot con 67,5% en flexible extract y 65,0% en strict match (Q8_0, 40 muestras).
- Seguimiento de instrucciones: IFEval 67,5% prompt-level strict y 66,7% instruction-level loose (Q8_0, 40 muestras).
- Modo de razonamiento desactivable: las evaluaciones publicadas se hicieron con "reasoning off" y presupuesto de 1024 tokens.
- Respuesta a prompts que el modelo base rechazaba: tasa de rechazo 0,0% frente al 75,0% del base en el conjunto Pareto v2 de 40 prompts.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.

## Casos de uso

- Investigación sobre alineamiento y edición de pesos: el repositorio sirve como caso reproducible para estudiar el equilibrio entre eliminación de rechazo y preservación de capacidades, con métricas de deriva (ratio de perplejidad 1,116, KL 0,130, mismo token top en 84,7% de los casos) y una receta de edición documentada paso a paso.
- Evaluación de arquitecturas MoE recurrentes en llama.cpp: permite probar en local un MoE con capas ejecutadas tres veces por token y convoluciones post-escritura, útil para validar el soporte del runtime (commit 6792507 o posterior) antes de adoptarlo en producción.
- Pruebas de robustez de filtros y salvaguardas: al ser un modelo con rechazo eliminado, es adecuado como caso adversario para medir si los clasificadores de entrada/salida de un pipeline siguen detectando contenido problemático cuando el modelo subyacente ya no rechaza.
- Prototipado de asistentes conversacionales en inglés con entrada de imagen: el archivo Q4_K_M (16,28 GiB) y el encoder de visión (0,60 GiB) permiten montar un servicio multimodal en una sola GPU de 24 GB, con calidad cercana a Q8 según el smoke test del autor (2/2 respuestas exactas en todos los tamaños).
- Despliegue en estaciones de trabajo Apple Silicon: el autor validó todos los archivos en llama-server sobre Apple M1 Ultra, lo que lo convierte en una opción para desarrollo local en macOS con memoria unificada amplia.
- Comparación de fidelidad de cuantización: la tabla de smoke test por archivo (Q8_0 a Q3_K_M, todos con 2/2 respuestas exactas y 8/8 respuestas a prompts dañinos) permite estudiar a qué tamaño de cuantización se degrada primero una edición de pesos de este tipo.
- Generación de datos sintéticos para ajuste: el modelo responde a instrucciones que el base rechaza, lo que facilita construir pares de respuesta en dominios sensibles para tareas de clasificación o moderación, siempre con revisión humana y dentro del marco legal aplicable.

## Benchmarks y rendimiento

Conducta de rechazo (ROGUE Pareto v2, 40 prompts, MLX, checkpoint nativo, reasoning off, presupuesto de 1024 tokens):

| Métrica | Base | ROGUE |
|---|---:|---:|
| Tasa de rechazo a prompts dañinos | 75,0% | 0,0% |
| Sobre-rechazo en prompts sensibles pero benignos | 0,0% | 0,0% |
| Retain score (utilidad con respuesta exacta) | 91,7% | 91,7% |

Capacidad (lm-evaluation-harness vía llama-server, Q8_0, reasoning off, 40 muestras por tarea; error estándar aproximado de ±7,5 puntos):

| Tarea | Base Q8_0 | ROGUE Q8_0 |
|---|---:|---:|
| GSM8K (5-shot, flexible extract) | 60,0% | 67,5% |
| GSM8K (strict match) | 40,0% | 65,0% |
| IFEval (prompt-level strict) | 75,0% | 67,5% |
| IFEval (instruction-level loose) | 73,0% | 66,7% |

Deriva de distribución (wikitext-2, 40 secuencias de 512 tokens, Q8_0 frente a Q8_0):

| Métrica | Valor |
|---|---:|
| Ratio de perplejidad (ROGUE / base) | 1,116 |
| Divergencia KL media | 0,130 |
| Mismo token top | 84,7% |

Smoke test de runtime GGUF (llama-server, commit 6792507, Apple M1 Ultra, reasoning off, 1024 tokens):

| Archivo | Respuestas exactas | Dañinos rechazados | Dañinos respondidos |
|---|---:|---:|---:|
| Q8_0 | 2 / 2 | 0 / 8 | 8 / 8 |
| Q6_K | 2 / 2 | 0 / 8 | 8 / 8 |
| Q5_K_M | 2 / 2 | 0 / 8 | 8 / 8 |
| Q4_K_M | 2 / 2 | 0 / 8 | 8 / 8 |
| Q3_K_M | 2 / 2 | 0 / 8 | 8 / 8 |

El autor advierte que estas cifras son un chequeo de humo, no números de leaderboard, y que el throughput no se midió de forma limpia porque otros trabajos compartían la GPU durante las ejecuciones.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del archivo más el overhead del contexto y del encoder de visión. Q8_0 25,91 GiB; Q6_K 21,88 GiB; Q5_K_M 18,54 GiB; Q4_K_M 16,28 GiB; Q3_K_M 12,78 GiB; encoder de visión 0,60 GiB adicional.
- GPU recomendadas: A100 80 GB o H100 para Q8_0 con contexto amplio; RTX 4090 (24 GB) o L40S (48 GB) para Q4_K_M y Q5_K_M; Q3_K_M para GPUs de 16 GB con margen ajustado.
- Cabe en GPU de consumo: sí, Q4_K_M (16,28 GiB) y Q3_K_M (12,78 GiB) en RTX 4090, RTX 4080 Super y similares con 16 GB o más, dejando margen para el contexto y el encoder de visión.
- Opciones de despliegue: llama.cpp (obligatorio commit 6792507 o posterior; las builds anteriores, incluida la 1.0.0 de Homebrew, no cargan los archivos) mediante llama-server o llama-cli; variantes nativas en safetensors NVFP4/MXFP8 y MLX 4-bit en repos hermanos para otros runtimes.
- Latencia y throughput: no disponibles; el autor no los midió de forma fiable.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rechazo | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling-2-Mini-ROGUE-GGUF | no disponible (MoE 128 expertos, 8 activos) | no disponible | 0,0% (Pareto v2) | Apache-2.0 | GGUF, safetensors, MLX |
| thinkingmachines/Inkling-2-Mini (base) | no disponible (MoE 128 expertos, 8 activos) | no disponible | 75,0% (Pareto v2) | Apache-2.0 | safetensors NVFP4/MXFP8 |
| carsenk/Inkling-2-Mini-ROGUE (nativo) | no disponible | no disponible | 0,0% (Pareto v2) | Apache-2.0 | safetensors NVFP4/MXFP8 |
| carsenk/Inkling-2-Mini-ROGUE-MLX-4bit | no disponible | no disponible | no disponible | Apache-2.0 | MLX 4-bit |

No se dispone de información sobre otros modelos de la misma categoría (MoE con capas recurrentes y visión en el rango de tamaño de Inkling-2-Mini) para una comparación cruzada rigurosa.

## Limitaciones y advertencias

- Eliminación deliberada del rechazo: la tasa de rechazo a prompts dañinos cae del 75,0% al 0,0%. El modelo responderá a solicitudes que el base denegaba; su uso en producción exige salvaguardas externas y evaluación legal.
- Deriva de distribución real: ratio de perplejidad 1,116 y KL medio 0,130 frente al base, con coincidencia del token top en el 84,7% de los casos. Ajustes más suaves (rango 1, menos capas, menor fuerza) reducían la deriva a KL 0,02-0,06 pero dejaban la mayoría de rechazos, según el autor.
- Pérdida de seguimiento de instrucciones: IFEval baja de 75,0% a 67,5% en prompt-level strict, una caída de aproximadamente un error estándar con 40 muestras; no es concluyente pero apunta a degradación.
- Benchmarks con muestra pequeña: 40 muestras por tarea implican un error estándar de ±7,5 puntos; las cifras no deben tratarse como resultados de leaderboard.
- Dependencia estricta del runtime: requiere llama.cpp posterior al commit 6792507; las builds antiguas fallan al cargar los archivos.
- Idioma: solo inglés etiquetado; no hay evidencia de calidad en castellano.
- Sesgos: no documentados en la información disponible; al eliminar la capa de rechazo, los sesgos del modelo base quedan expuestos sin ese filtro.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Licencia Apache-2.0: permite uso comercial, pero la redistribución debe conservar los avisos correspondientes y el usuario asume la responsabilidad sobre el comportamiento del modelo editado.
- Visión y cabeza MTP sin editar: la torre de visión conserva el comportamiento del base, por lo que el efecto de ROGUE no aplica a entradas de imagen.
- Fecha de creación del repositorio: 21 de noviembre de 2026; sin descargas ni likes en el momento de la consulta, lo que limita la validación independiente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/carsenk/Inkling-2-Mini-ROGUE-GGUF
- Checkpoint nativo NVFP4/MXFP8: https://huggingface.co/carsenk/Inkling-2-Mini-ROGUE
- Variante MLX 4-bit: https://huggingface.co/carsenk/Inkling-2-Mini-ROGUE-MLX-4bit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Pull request de llama.cpp con soporte de la arquitectura looped: https://github.com/ggml-org/llama.cpp/pull/32694
