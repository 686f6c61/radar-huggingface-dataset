# Smilyai-Labs-GRACE-team/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF es un ajuste fino derivado de DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, publicado por el usuario Smilyai-Labs-GRACE-team en formato GGUF. Se presenta como un modelo de 26.895.998.464 parámetros (~26,9 B) orientado a razonamiento, generacion de codigo y escritura creativa, con cuantizaciones "regulares" y "MTP" generadas con imatrix simple y dual (DI-MATRIX).

El elemento diferenciador que declara el autor es la reduccion del bloque de razonamiento ("thinking"): entre la mitad y una decima parte de los tokens de pensamiento respecto al Qwen 3.8 27B original, con una mediana estimada de dos tercios menos, manteniendo el nivel de detalle de la respuesta. El modelo se entrena con los metodos propietarios COLD FUSION (GAIN + Unsloth) y Fable Fusion 711, y se distribuye sin alineamiento de seguridad (etiquetas "heretic", "uncensored", "abliterated").

Es relevante ahora porque combina tres tendencias del ecosistema abierto: ajustes multi-etapa sobre modelos Qwen de generacion 3.5/3.6/3.8, publicacion exclusiva en GGUF para hardware de consumo y modos de razonamiento con control de coste de tokens. No obstante, todas las cifras de rendimiento son autoinformadas por el autor y no se ha publicado verificacion independiente en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de la familia Qwen 3.8; transformer denso segun el recuento de parametros, no confirmado en la informacion) |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF "regular" y "MTP"; imatrix simple e imatrix dual (DI-MATRIX); se mencionan explicitamente Q4KS y variantes de 4 y 8 bits |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo); bfloat16 en las etiquetas del modelo base; safetensors no confirmado en este repositorio |
| Pipeline declarado | image-text-to-text |
| Tamano del repositorio | 389,0 GB |
| Modelo base | DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU |
| Datasets de ajuste | DavidAU/Polar-STRICT-Datasets, DavidAU/F451-STRICT-Datasets |
| Fecha de publicacion | 2026-09-14 |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna en la informacion proporcionada. El modelo es un ajuste fino multi-etapa y multi-merge construido sobre un derivado de la familia Qwen 3.8 de 27 B, con ~26,9 B de parametros totales, lo que apunta a un transformer denso mas que a una arquitectura MoE (la comparacion que hace el autor con Qwen3.6-35B-A3B, que si es MoE, sugiere que este no lo es). Se menciona soporte de MTP (multi-token prediction) en las cuantizaciones, lo que implicaria decodificacion con prediccion multi-token, pero no se especifica la implementacion ni el runtime compatible.

El entrenamiento combina dos metodos propietarios del autor: COLD FUSION, que acopla un componente denominado "GAIN" (modificacion dinamica del entrenamiento por muestra en tiempo real segun aprende el modelo) con los entrenadores de Unsloth, y Fable Fusion 711, desarrollado previamente en Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic. Los objetivos declarados son aumentar la inteligencia general, reducir el bloque de pensamiento (de 1/2 a 1/10, mediana ~2/3), reformatear el bloque de razonamiento, acelerar la generacion de tokens y mantener las metricas nucleares sin "benchmaxing". No se indican el numero de tokens de entrenamiento ni la composicion exacta del dataset, ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto general y conversacion multi-turno, con tres modos de operacion declarados (los "tres modos de pensamiento" que menciona el autor, presumiblemente thinking, no-thinking y un modo intermedio, aunque no se enumeran explicitamente).
- Razonamiento con bloque de pensamiento reducido: entre 1/2 y 1/10 de los tokens de razonamiento del Qwen 3.8 27B base, con mediana de reduccion de aproximadamente 2/3.
- Generacion de codigo: las etiquetas incluyen "coder" y el nombre del modelo incluye "NEO-CODER MAX".
- Escritura creativa, ficcion, narrativa por generos y roleplaying, segun las etiquetas y los ejemplos de generacion de la model card.
- Capacidad multimodal declarada a traves del pipeline image-text-to-text de HuggingFace; no se detalla el alcance real (vision, imagen-texto) en la informacion disponible.
- Multilinguee limitado a ingles y chino segun los metadatos de idioma.
- Tool calling: la model card afirma que la pestana "community" recoge "el rendimiento en tool calling mas fuerte jamas registrado"; es una afirmacion del autor sin datos verificables en la informacion proporcionada.
- Modelo sin censura ni alineamiento de seguridad ("heretic", "uncensored", "abliterated", "ara"), lo que amplia el rango de respuestas permitidas pero elimina las barreras de rechazo.

## Casos de uso

- Escritura creativa asistida: el ajuste esta explicitamente orientado a ficcion, relato y novela, con ejemplos de generacion de ganchos narrativos y dialogos; el modo de pensamiento reducido permite iterar borradores sin gastar miles de tokens en planificacion interna.
- Roleplay y personajes persistentes: el modelo esta entrenado para mantener voz y estilo en conversaciones largas, lo que encaja en aplicaciones de entretenimiento conversacional y compania virtual.
- Generacion de codigo en local: el sufijo "CODER" y la etiqueta "coder" apuntan a asistencia de programacion; al distribuirse en GGUF puede ejecutarse en estaciones de trabajo sin GPU de datacenter.
- Redaccion de contenido sin filtros editoriales: guiones, dialogos y narrativa para sectores donde el contenido sensible o adulto es legitimo, algo que los modelos alineados suelen rechazar.
- Investigacion sobre razonamiento y coste de tokens: util como sujeto de estudio para medir el efecto de reducir el bloque de "thinking" en la calidad final y en el throughput, especialmente comparando las variantes regular y MTP.
- Despliegue en hardware de consumo: la publicacion exclusiva en GGUF con cuantizaciones de 4 y 8 bits esta pensada para ejecucion en una sola GPU de gama alta o en configuraciones con offload a CPU.
- Prototipado rapido de asistentes multilingues ingles-chino: cubre los dos idiomas mas habituales en el ecosistema Qwen para demos y pruebas internas.
- Traduccion y adaptacion de estilo ingles-chino en textos largos: aprovecha la ventana de contexto del modelo base, aunque la longitud exacta no esta confirmada.

## Benchmarks y rendimiento

La model card unicamente proporciona cifras parciales, autoinformadas y sin metodologia detallada. No se ha publicado una tabla completa de resultados en la informacion disponible.

| Benchmark | Valor declarado | Contexto |
|---|---|---|
| ARC-C (8 bits) | 735 | Afirmacion del autor; "144 puntos por encima de Qwen 3.8 27B" segun la model card |
| ARC-C (4 bits) | 719 | Afirmacion del autor para la cuantizacion de 4 bits |
| ARC-E | superior a 880 | Afirmacion del autor, descrita como "zona de inteligencia de OpenAI, Claude y Gemini" |

El autor afirma ademas que el modelo supera al Qwen 3.8 27B base en los siete benchmarks que considera criticos, y que tambien supera los siete benchmarks de Qwen3.6-35B-A3B, Qwen 3.6 27B y Qwen 3.5 27B. No se facilitan los nombres completos de esos benchmarks ni los valores numericos, ni existen resultados de terceros verificables en la informacion proporcionada. Tratar todas estas cifras como no verificadas.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los ~26,9 B de parametros, no confirmada por el autor): ~16-17 GB en Q4_K_M, ~19-20 GB en Q5, ~22-24 GB en Q6, ~28-30 GB en Q8, ~54 GB en bfloat16.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede ejecutar las cuantizaciones de 4 bits con contexto moderado; Q6 y Q8 requieren dos GPU de 24 GB o una sola de 48 GB.
- GPU profesionales: A100 40/80 GB, H100 80 GB, L40S 48 GB y RTX 6000 Ada 48 GB cubren sin problema 4 y 8 bits, incluso con contexto largo.
- Despliegue: llama.cpp, Ollama, LM Studio y koboldcpp son las opciones naturales para GGUF. vLLM y TGI no soportan GGUF de forma nativa, por lo que requeririan otro formato de pesos no presente en este repositorio.
- Las cuantizaciones MTP pueden requerir builds especificas de llama.cpp para aprovechar la prediccion multi-token; la informacion disponible no detalla la compatibilidad.
- Latencia y throughput: no disponible. El autor afirma que la reduccion del bloque de pensamiento acelera la generacion, pero no publica tokens por segundo ni mediciones de latencia.
- Espacio en disco: el repositorio completo ocupa 389 GB, por lo que conviene descargar solo el archivo de cuantizacion necesario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (TURBO Fable Cold Fusion 735-882) | ~26,9 B | no disponible | ARC-C 735 en 8 bits y 719 en 4 bits (autoinformado) | apache-2.0 | GGUF en HuggingFace; 0 descargas y 0 likes en el momento del analisis |
| DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU (modelo base) | ~27 B | no disponible | Referencia directa del ajuste; el autor afirma que este derivado lo supera | apache-2.0 segun el modelo base | safetensors en HuggingFace |
| Qwen 3.8 27B (oficial) | ~27 B | no disponible | Referencia de comparacion; el autor afirma que este ajuste lo supera en ARC-C por 144 puntos | no disponible | no disponible |
| Qwen3.6-35B-A3B | 35 B totales (MoE, A3B) | no disponible | El autor afirma que este modelo lo supera en sus siete benchmarks criticos | no disponible | no disponible |
| Qwen 3.6 27B y Qwen 3.5 27B | ~27 B | no disponible | El autor afirma superarlos en los siete benchmarks criticos | no disponible | no disponible |

No hay datos independientes que permitan validar ninguna de las comparaciones anteriores.

## Limitaciones y advertencias

- Modelo abliterado y sin censura: los mecanismos de rechazo estan eliminados o degradados, por lo que puede generar contenido ofensivo, ilegal o danino sin filtro. No es apto para aplicaciones orientadas al publico sin una capa de moderacion externa.
- Riesgo de alucinacion: se desconocen los datos exactos de entrenamiento y no hay evaluaciones de factualidad. La orientacion a escritura creativa favorece la invencion por diseno.
- Cifras de rendimiento autoinformadas: los valores de ARC-C y ARC-E provienen de la model card del autor, sin reproducibilidad publicada. La afirmacion sobre "el mejor tool calling jamas registrado" no viene acompanada de datos.
- Adopcion nula: en el momento del analisis el repositorio registra 0 descargas y 0 likes, por lo que no existe validacion de la comunidad ni informes de fallos.
- Cobertura idiomatica limitada: solo ingles y chino declarados. El castellano no figura entre los idiomas soportados, y el rendimiento en espanol no esta evaluado.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin confirmar la ventana real ni el comportamiento de RoPE.
- Licencia apache-2.0 sobre un derivado: aunque la licencia declarada es permisiva, el modelo encadena varios ajustes finos cuyas condiciones originales no se detallan en la informacion disponible. Conviene revisar la licencia del Qwen subyacente antes de uso comercial.
- Nombre y procedencia poco convencionales: el autor de la cuenta de HuggingFace no coincide con el autor del modelo base (DavidAU), lo que dificulta atribuir responsabilidad sobre el ajuste y su soporte.
- Compatibilidad MTP incierta: no se especifica que versiones de llama.cpp u otros runtimes soportan las cuantizaciones MTP.
- Repositorio de 389 GB: la descarga completa es costosa en almacenamiento y ancho de banda.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Smilyai-Labs-GRACE-team/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base (DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Antecedente del metodo Fable Fusion 711 (DavidAU): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Dataset DavidAU/Polar-STRICT-Datasets: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset DavidAU/F451-STRICT-Datasets: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
- Paper, blog o demo oficial: no disponible en la informacion proporcionada.
