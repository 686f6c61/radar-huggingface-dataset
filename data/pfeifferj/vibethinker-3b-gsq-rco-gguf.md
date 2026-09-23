# pfeifferj/VibeThinker-3B-GSQ-RCO-GGUF

## Resumen

VibeThinker-3B · GSQ-RCO GGUFs es un conjunto de dos cuantizaciones GGUF no uniformes del modelo denso de razonamiento VibeThinker-3B (3.085.938.688 parámetros, es decir, unos 3,09B) publicado por WeiboAI. Los ficheros los ha producido un tercero, el usuario pfeifferj, aplicando los métodos GSQ (Gumbel-Softmax Quantization) y RCO (Riemannian Constrained Optimization) desarrollados en el Deep Algorithms and Systems Lab (DASLab) del Institute of Science and Technology Austria. Se trata de una reproducción comunitaria independiente: no es una publicación de DASLab ni cuenta con el respaldo de los autores de los papers.

El objetivo es reducir el peso en disco desde los 6,178 GB del modelo en BF16 hasta 1,157 GB (build de 3 bits) o 1,350 GB (build de 3,5 bits), manteniendo la perplejidad lo más baja posible. Las mediciones publicadas por el autor muestran, no obstante, un rendimiento bajo del modelo base: 10,75 % y 10,80 % de acierto en MMLU-Pro (el azar para ese subconjunto es 11,19 %) frente al 11,00 % del BF16 de referencia, y un descenso notable en GSM8K (de 7/8 a 2/8 y 5/8).

Su interés actual es doble: por un lado, es un caso práctico y reproducible de asignación mixta de tipos de cuantización mediante optimización (GSQ + RCO); por otro, al estar en formato GGUF con tokenizer y plantilla de chat incluidos, permite ejecutar un modelo de razonamiento de 3B en hardware muy modesto con llama.cpp. Debe tratarse como artefacto experimental de cuantización, no como un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no MoE) de razonamiento; 36 capas y 252 matrices nucleares según el procedimiento de cuantización documentado |
| Parametros totales | 3.085.938.688 (aprox. 3,09B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada; las evaluaciones y el ejemplo de uso emplean 8.192 tokens de contexto |
| Tipos de cuantizacion | GGUF mixta no uniforme: Q2_0, Q2_K, Q3_K y Q4_K repartidos entre las matrices nucleares; embeddings atados en Q4_K; normas y sesgos en F32. Dos builds: 3-bit (1.157 GB) y 3,5-bit (1.350 GB) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF (incluye el tokenizer y la plantilla de chat del modelo original) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 3,09B orientado a razonamiento, con salida en modo *thinking* delimitada por la etiqueta `</think>`. La información proporcionada no detalla el número de tokens de entrenamiento del modelo original, la composición de su dataset ni si se aplicaron fases de RLHF o DPO; tampoco se documentan innovaciones de arquitectura adicionales (atención lineal, decodificación especulativa, etc.). Todo lo técnico que se describe a continuación corresponde al proceso de cuantización, que es el objeto real de este repositorio.

La cuantización parte del checkpoint `WeiboAI/VibeThinker-3B` en la revisión `77bd2cce`. El pipeline se ejecuta en tres fases. Primero, se calibran las 252 matrices nucleares de las 36 capas con un millón de tokens (80 % OpenThoughts, 15 % calibration_mixture y 5 % FineWeb), reteniendo por capa 4.096 filas de activación para entrenamiento y 1.024 para validación, con pools separados para validación y para RCO. Segundo, se ejecutan 80 actualizaciones GSQ por capa y formato, muestreando 256 filas de activación por actualización, optimizando los códigos de cuantización con las escalas y los offsets nativos fijos y seleccionando los pesos empaquetados con menor error de validación, incluido el inicializador. Tercero, se ejecutan 50 pasos RCO por tamaño minimizando la KL profesor-alumno sobre cuatro secuencias de calibración, se selecciona la asignación sobre cuatro secuencias de validación independientes y se ensambla el paquete elegido.

Los dos métodos aplicados son: GSQ, una cuantización escalar post-entrenamiento que aprende conjuntamente las asignaciones de rejilla por coordenada y las escalas por grupo mediante una relajación Gumbel-Softmax; y RCO, que asigna uno de K tipos de cuantización a cada uno de N tensores bajo un presupuesto exacto de tamaño total, reformulado como una variedad riemanniana suave en espacio logit.

## Capacidades

- Generación de texto conversacional en inglés, con la plantilla de chat original incluida en el GGUF.
- Razonamiento con modo *thinking*: el modelo genera un bloque de pensamiento que debe cerrarse con `</think>` antes de la respuesta final; las evaluaciones de IFEval puntúan únicamente el texto posterior a esa etiqueta.
- Razonamiento matemático básico (GSM8K), con degradación apreciable tras la cuantización: 7/8 en BF16 frente a 2/8 en el build de 3 bits y 5/8 en el de 3,5 bits.
- Seguimiento de instrucciones (IFEval), también degradado: 2/16 en BF16, 0/16 en 3 bits y 1/16 en 3,5 bits con el verificador estricto.
- Soporte de *tool calling* / *function calling*: no disponible; los autores del modelo base aconsejan explícitamente no usarlo para tool-calling.
- Soporte de agentes y razonamiento multi-paso: no disponible; los autores del modelo base desaconsejan su uso en agentes de programación.
- Capacidades multilingües: no, el modelo está declarado únicamente para inglés.
- Capacidades especiales adicionales (visión, audio, multimodalidad): no disponibles en la información proporcionada.

## Casos de uso

- Investigación en cuantización mixta: reproducir y auditar la asignación GSQ + RCO sobre las 252 matrices de un transformer de 3B, comparando la perplejidad obtenida con la de los controles de imatrix nativo y de inicializador emparejado que publica el autor.
- Validación de pipelines de calibración: reutilizar el esquema de 1 millón de tokens con mezcla OpenThoughts/FineWeb para estudiar cómo afecta la composición del conjunto de calibración al error de validación por capa.
- Pruebas de runners GGUF: el repositorio permite verificar soporte real de los tipos Q2_0, Q2_K, Q3_K y Q4_K en un runtime concreto; el autor lo ha validado con llama.cpp sin parches en el commit 58367713.
- Despliegue local en hardware muy limitado: con 1,157 GB o 1,350 GB de pesos, el modelo cabe en equipos sin GPU dedicada o con GPUs de gama baja, sirviendo como servicio de chat interno de baja criticidad y con supervisión humana.
- Demostraciones educativas de razonamiento *thinking*: el formato de plantilla con bloque de pensamiento cerrado permite ilustrar el comportamiento y los fallos (no cerrar el bloque) de este tipo de modelos ante audiencias técnicas.
- Experimentos de compresión extrema: comparar la curva tamaño-perplejidad de este build de 3 bits frente al de 3,5 bits (113.4035 frente a 77.2388) para calibrar cuánto margen de compresión admite un modelo de 3B sin colapsar.
- Generación de borradores de texto en inglés no críticos (resúmenes internos, notas), siempre con revisión posterior y asumiendo la baja calidad demostrada en las evaluaciones publicadas.

## Benchmarks y rendimiento

MMLU-Pro (sin razonamiento, contexto de 2.048 tokens, sin tokens generados, *zero-shot*, sin plantilla de chat, eligiendo la respuesta con mayor verosimilitud de su continuación como letra; 2.000 preguntas estratificadas en las 14 categorías con semilla fija):

| Build | Aciertos | Precisión |
|---|---:|---:|
| BF16 de referencia | 220/2.000 | 11,00 % |
| GSQ-RCO 3-bit | 215/2.000 | 10,75 % |
| GSQ-RCO 3,5-bit | 216/2.000 | 10,80 % |

Las tres puntuaciones están cerca del azar (11,19 % para este subconjunto). El BF16 de referencia eligió la opción A en 1.616 de las 2.000 preguntas.

Perplejidad (4.088 predicciones de siguiente token sobre ocho contextos de 1.024 tokens de texto reservado; menor es mejor):

| Build | Tamaño | PPL |
|---|---:|---:|
| BF16 de referencia | 6.178 GB | 92.5820 |
| GSQ-RCO 3-bit | 1.157 GB | 113.4035 |
| Native imatrix 3-bit | 1.153 GB | 134.2970 |
| Matched initializer 3-bit | 1.157 GB | 184.0001 |
| GSQ-RCO 3,5-bit | 1.350 GB | 77.2388 |
| Native imatrix 3,5-bit | 1.350 GB | 129.1760 |
| Matched initializer 3,5-bit | 1.350 GB | 104.4452 |

GSM8K e IFEval (GSM8K: ocho preguntas, coincidencia numérica exacta tras `####`, límite de 2.048 tokens de salida; IFEval: 16 prompts con el verificador estricto y límite de 1.024 tokens de salida; ambos con la plantilla de pensamiento origen, temperatura 0 y contexto de 8.192 tokens):

| Build | GSM8K | GSM8K en el límite de tokens | IFEval estricto | IFEval en el límite de tokens |
|---|---:|---:|---:|---:|
| BF16 de referencia | 7/8 | 0/8 | 2/16 | 15/16 |
| GSQ-RCO 3-bit | 2/8 | 2/8 | 0/16 | 16/16 |
| GSQ-RCO 3,5-bit | 5/8 | 0/8 | 1/16 | 15/16 |

Nota metodológica del autor: IFEval solo evalúa el texto posterior a `</think>`; si el bloque de pensamiento nunca se cierra, la puntuación es cero. Una de las dos pasadas del BF16 de referencia alcanzó el límite de salida.

## Requisitos de hardware

No hay mediciones de VRAM, latencia ni throughput en la información proporcionada. Las cifras que siguen son estimaciones derivadas del tamaño de los ficheros publicados, no valores verificados por el autor.

- Tamaño de pesos en disco: 1,157 GB (3 bits) y 1,350 GB (3,5 bits), frente a 6,178 GB en BF16.
- VRAM estimada en inferencia: alrededor de 1,2-1,5 GB para los pesos, más la caché KV correspondiente al contexto configurado. Con `-ngl all` y 8.192 tokens de contexto, un presupuesto de 3-4 GB de VRAM es suficiente en la práctica para estos ficheros.
- GPU recomendadas (estimación): cualquier GPU con 4 GB o más de VRAM; por ejemplo RTX 3050, RTX 3060, RTX 4060, RTX 4090, así como A100 o H100 si se quiere servir con concurrencia alta. No requiere GPU de datacenter.
- ¿Cabe en GPU de consumo?: sí, en la práctica totalidad de GPU de consumo con 4 GB o más de VRAM, y también en ejecución mixta con offload parcial.
- Ejecución solo con CPU: viable con 1,2-1,4 GB de pesos, por lo que basta un equipo con 4 GB o más de RAM; es una de las configuraciones más razonables para estos ficheros.
- Opciones de despliegue: `llama.cpp` / `llama-server` es el runtime verificado (commit `58367713`, sin parches). El autor proporciona un ejemplo de uso con `llama-server -m VibeThinker-3B-GSQ-RCO-3.5bit.gguf -ngl all -c 8192 --jinja --temp 1.0 --top-p 0.95 --top-k 0`, con los parámetros de muestreo recomendados por WeiboAI. Otros runners compatibles con GGUF no han sido verificados por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparación dentro del propio ecosistema del repositorio (mismo modelo base y mismo tamaño de fichero, distintos métodos de cuantización):

| Build | Parámetros | Tamaño | PPL | MMLU-Pro | GSM8K | IFEval estricto | Licencia |
|---|---|---:|---:|---:|---:|---:|---|
| VibeThinker-3B BF16 (referencia) | 3,09B | 6.178 GB | 92.5820 | 11,00 % | 7/8 | 2/16 | MIT |
| GSQ-RCO 3,5-bit | 3,09B | 1.350 GB | 77.2388 | 10,80 % | 5/8 | 1/16 | MIT |
| GSQ-RCO 3-bit | 3,09B | 1.157 GB | 113.4035 | 10,75 % | 2/8 | 0/16 | MIT |
| Native imatrix 3,5-bit (control) | 3,09B | 1.350 GB | 129.1760 | no disponible | no disponible | no disponible | no disponible |
| Native imatrix 3-bit (control) | 3,09B | 1.153 GB | 134.2970 | no disponible | no disponible | no disponible | no disponible |
| Matched initializer 3,5-bit (control) | 3,09B | 1.350 GB | 104.4452 | no disponible | no disponible | no disponible | no disponible |
| Matched initializer 3-bit (control) | 3,09B | 1.157 GB | 184.0001 | no disponible | no disponible | no disponible | no disponible |

Frente a modelos de la misma categoría (otros transformadores densos de razonamiento de ~3B de parámetros, como las familias Qwen, Llama o Phi): no disponible, ya que la información proporcionada no incluye datos comparativos con esos modelos.

## Limitaciones y advertencias

- MMLU-Pro queda en torno al azar (10,75 % y 10,80 % frente a un azar del 11,19 %), y el propio BF16 de referencia tampoco supera el azar (11,00 %). El protocolo de evaluación sin plantilla de chat y basado en verosimilitud de la letra es poco favorable a un modelo de razonamiento, por lo que la cifra debe interpretarse con cautela en ambos sentidos.
- Degradación por cuantización en tareas generativas: GSM8K baja de 7/8 a 2/8 en el build de 3 bits y a 5/8 en el de 3,5 bits; IFEval estricto baja de 2/16 a 0/16 y 1/16 respectivamente.
- El build de 3 bits obtuvo 16/16 en IFEval al alcanzar el límite de tokens, lo que indica que en ningún caso cerró el bloque de pensamiento y no produjo respuesta final utilizable. Es un fallo funcional relevante para cualquier uso conversacional.
- Los conjuntos de evaluación son minúsculos (8 preguntas en GSM8K y 16 prompts en IFEval), por lo que la varianza de estas métricas es muy alta.
- Los autores del modelo base aconsejan expresamente no emplearlo para *tool calling* ni para agentes de programación.
- Idiomas: solo inglés. No hay soporte declarado de castellano ni de otros idiomas.
- Sesgos conocidos: no disponible en la información proporcionada. Tasa de alucinación: no disponible.
- Restricciones de licencia: el repositorio y el modelo base se publican bajo licencia MIT, que permite uso comercial; conviene verificar igualmente las condiciones del modelo base y de los datos de calibración (OpenThoughts, FineWeb y `calibration_mixture`) antes de un uso comercial.
- Es una reproducción comunitaria independiente de los métodos GSQ y RCO; no está respaldada por IST-DASLab ni por los autores de los papers, y los ficheros no deben citarse como publicación oficial de DASLab.
- No hay datos publicados de VRAM, latencia o throughput; cualquier planificación de producción debe medirse en el hardware objetivo.
- Solo se ha verificado el funcionamiento con llama.cpp en el commit `58367713`; otros runtimes GGUF pueden no soportar correctamente la combinación de tipos Q2_0, Q2_K, Q3_K y Q4_K.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pfeifferj/VibeThinker-3B-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/WeiboAI/VibeThinker-3B
- Guías de uso del modelo base (incluye la advertencia sobre tool-calling y agentes de código): https://huggingface.co/WeiboAI/VibeThinker-3B#usage-guidelines
- Revisión del modelo base usada para cuantizar: https://huggingface.co/WeiboAI/VibeThinker-3B/tree/77bd2cced09193c8b9a59a32bd8577bbd1f3e01c
- Paper de GSQ (Gumbel-Softmax Quantization): https://arxiv.org/abs/2604.18556
- Paper de RCO (Riemannian Constrained Optimization): https://arxiv.org/abs/2605.00649
- Paper adicional referenciado en las etiquetas del repositorio: https://arxiv.org/abs/2606.16140
- Código de GSQ: https://github.com/IST-DASLab/GSQ
- Código de RCO: https://github.com/IST-DASLab/RCO
- Organización DASLab: https://github.com/IST-DASLab
- Commit verificado de llama.cpp: https://github.com/ggml-org/llama.cpp/commit/58367713a6935c0810103378144008df32e3d5db
- Datos de la evaluación MMLU-Pro (IDs de pregunta y puntuaciones): carpeta `eval/mmlu-pro/` del repositorio
