# reflection/Beam-1.0-501B-A23B-DFlash2

## Resumen

Beam-1.0-501B-A23B-DFlash2 es un modelo borrador (draft model) de decodificación especulativa desarrollado por reflection, publicado como complemento del modelo de lenguaje Beam-1.0-501B-A23B. No es un modelo de lenguaje autónomo: se ejecuta junto a Beam dentro de un servidor de decodificación especulativa y es Beam quien verifica cada token propuesto. Con muestreo por rechazo, la distribución de salida coincide exactamente con la de Beam, por lo que la aceleración no altera la calidad del texto generado.

El borrador emplea un esquema denominado DFlash2 que redacta un bloque completo de tokens en un único forward pass, conservando los mejores candidatos en cada posición del bloque y seleccionando una ruta mediante un selector reducido. Dos convoluciones dinámicas de dos tomas dentro del bloque evitan que la precisión se degrade hacia el final del mismo. El modelo condiciona sobre los estados ocultos de Beam en cinco capas concretas y reutiliza su embedding y su cabeza LM congelados.

Con 1.927.484.672 parámetros reales (1,93 mil millones) y solo 5 capas, el borrador es muy ligero en comparación con el modelo base. Su atención sobre el contexto usa una ventana deslizante de 4.096 tokens, de modo que el coste de redacción no crece con la longitud del contexto. Es relevante ahora porque permite reducir el coste por token y la latencia en despliegues de Beam sin sacrificar fidelidad en la distribución de salida.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer borrador para decodificación especulativa (DFlash2); 5 capas, hidden size 5120, 40 cabezas de consulta y 8 cabezas KV de dimensión 128 (GQA), SwiGLU con tamaño intermedio 17.408; convoluciones dinámicas de dos tomas intrabloque |
| Parametros totales | 1.927.484.672 (1,93 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible para el modelo completo; la atención del borrador sobre el contexto usa una ventana deslizante de 4.096 tokens |
| Tipos de cuantizacion | no disponible para el borrador (pesos publicados en safetensors); el modelo base Beam se sirve en bf16, FP8 y NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 3,9 GB) |
| Modelo base | reflection/Beam-1.0-501B-A23B |
| Vocabulario | 151.936 tokens, compartido con Beam |
| Capas de Beam leídas | 4, 16, 28, 40 y 46 |
| Tamano de bloque | entrenado con 16; 8 recomendado para servicio |
| Descargas / likes | 141 descargas, 17 likes |
| Fechas | creado el 2026-10-13; actualizado el 2026-10-16 |

## Arquitectura y entrenamiento

El modelo es un borrador de 5 capas con atención de consultas agrupadas (40 cabezas de consulta, 8 de clave-valor, dimensión 128) y FFN SwiGLU de tamaño intermedio 17.408 sobre un hidden size de 5120. DFlash2 redacta un bloque entero de tokens en un solo forward pass: mantiene los mejores candidatos en cada posición del bloque y un selector de pequeño tamaño escoge una ruta a través de ellos. Dos convoluciones dinámicas de dos tomas dentro del bloque evitan la degradación de precisión hacia el final del mismo. El borrador condiciona sobre los estados ocultos de Beam en las capas 4, 16, 28, 40 y 46, y reutiliza el embedding y la cabeza LM congelados de Beam, con el vocabulario compartido de 151.936 tokens. Su atención sobre el contexto emplea una ventana deslizante de 4.096 tokens, por lo que el coste de redacción se mantiene constante independientemente de la longitud de contexto. El tamaño de bloque de entrenamiento es 16, aunque se recomienda 8 para servir.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en el material proporcionado. La decodificación especulativa con muestreo por rechazo garantiza que la distribución de salida sea idéntica a la de Beam, lo que es la innovación técnica central: la aceleración es exacta, no aproximada.

## Capacidades

- No es un modelo de lenguaje autónomo: no genera texto por sí solo ni puede desplegarse sin Beam.
- Redacción especulativa de bloques de tokens en un único forward pass (DFlash2), con selección de ruta mediante un selector reducido.
- Verificación por parte de Beam de cada token redactado, con muestreo por rechazo que preserva exactamente la distribución de Beam.
- Condicionamiento sobre estados ocultos de Beam en 5 capas y reutilización de su embedding y cabeza LM congelados.
- Ventana deslizante de 4.096 tokens en la atención del borrador, con coste de redacción independiente de la longitud del contexto.
- Soporte de generación con muestreo (temperatura 0,7 y top-p 0,99, ajustes recomendados de Beam) y con decodificación greedy.
- Peticiones de hasta 4.096 tokens nuevos, según la configuración de evaluación publicada.
- El modelo base Beam declara soporte de razonamiento, tool calling y decodificación especulativa en la receta de vLLM, aunque el borrador en sí no expone capacidades propias de tool calling, visión o audio.

## Casos de uso

- Servicio de inferencia de alto rendimiento sobre Beam: el borrador se ejecuta en paralelo al modelo base dentro de un servidor de decodificación especulativa (vLLM, SGLang o TokenSpeed) y permite verificar hasta 7 tokens redactados por paso con tamaño de bloque 8.
- Reducción del coste por token en producción: al elevar el número medio de tokens aceptados por paso de verificación, se amortiza el coste de cada forward pass de Beam.
- Chat interactivo de baja latencia: la longitud de aceptación medida en MT-Bench (3,93 con muestreo, 4,11 en greedy) indica que en conversación generalista se aceptan alrededor de cuatro tokens por paso.
- Generación de código con latencia reducida: con longitudes de aceptación de 4,58 en HumanEval y 4,19 en MBPP con muestreo, el borrador es adecuado para asistentes de código y pipelines de generación integrados en CI/CD.
- Razonamiento matemático y resolución de problemas: GSM8K alcanza 5,60 tokens aceptados por paso y MATH-500 5,05 con muestreo, los valores más altos de la tabla publicada, lo que favorece cargas con cadenas de razonamiento largas.
- Servicio con contextos largos: gracias a la ventana deslizante de 4.096 tokens, el coste de redacción no crece con la longitud del contexto, lo que permite usarlo en aplicaciones de documento largo o conversaciones multi-turno extensas servidas por Beam.
- Despliegue de peticiones largas de hasta 4.096 tokens nuevos con ajustes de muestreo recomendados (temperatura 0,7, top-p 0,99).
- Investigación en decodificación especulativa: permite experimentar con esquemas de redacción por bloques, selección de rutas y convoluciones dinámicas reutilizando infraestructura de servidores ya existentes.

## Benchmarks y rendimiento

Los datos publicados no son puntuaciones de calidad de tarea, sino longitudes de aceptación: el número medio de tokens generados por paso de verificación sobre un máximo de 8, con hasta 4.096 tokens nuevos por petición. Todos los resultados usan Beam en NVFP4 con tensor parallelism 4 sobre GPUs B300 y tamaño de bloque de servicio 8, de modo que cada paso de verificación comprueba 7 tokens redactados.

| Benchmark | Longitud de aceptacion (sampled, temp. 0,7 / top-p 0,99) | Longitud de aceptacion (greedy) |
|---|---|---|
| GSM8K | 5,60 | 5,88 |
| MATH-500 | 5,05 | 5,39 |
| HumanEval | 4,58 | 4,68 |
| MBPP | 4,19 | 4,32 |
| MT-Bench | 3,93 | 4,11 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval como puntuación de resolución, GSM8K como exactitud, etc.) para este borrador en la información disponible. La calidad de la salida final viene determinada por Beam, dado que el muestreo por rechazo reproduce su distribución.

## Requisitos de hardware

- Tamaño de pesos del borrador: 3,9 GB en el repositorio, coherente con 1,93 mil millones de parámetros en bf16 (aproximadamente 3,85 GB).
- Otros formatos: no se ha publicado el peso del borrador en FP8 ni NVFP4; esas cuantizaciones corresponden al modelo base Beam, con el que el borrador se sirve en bf16, FP8 o NVFP4.
- El borrador por sí solo cabría con holgura en GPUs de consumo (por ejemplo, RTX 3060 de 12 GB o superiores) en bf16, pero no puede ejecutarse de forma independiente: requiere Beam.
- El despliegue conjunto exige servir Beam, un modelo de 501B parámetros totales y 23B activos. La evaluación publicada emplea Beam en NVFP4 con tensor parallelism 4 sobre GPUs B300, lo que indica hardware de centro de datos multi-GPU.
- Opciones de despliegue documentadas: receta de SGLang, receta de vLLM (con las funciones de razonamiento, tool calling y decodificación especulativa) y receta de TokenSpeed.
- Latencia y throughput: no se han publicado valores absolutos de latencia ni de tokens por segundo. El indicador indirecto es la longitud de aceptación (entre 3,93 y 5,88 tokens por paso según benchmark y modo de muestreo, sobre un máximo de 8).

## Comparativa con modelos similares

La información disponible no incluye comparativas directas con otros borradores de decodificación especulativa (EAGLE-3, Medusa, borradores MTP, borradores n-gram), ni sus parámetros, contextos, licencias o cifras de aceptación. Por tanto esos datos figuran como no disponibles.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Beam-1.0-501B-A23B-DFlash2 | 1,93 mil millones | Ventana deslizante de 4.096 tokens en la atención del borrador | Longitud de aceptación de 3,93 a 5,88 tokens por paso | apache-2.0 | HuggingFace (141 descargas, 17 likes) |
| reflection/Beam-1.0-501B-A23B (modelo base) | 501B totales, 23B activos (segun la nomenclatura del identificador; no confirmado en la informacion proporcionada) | no disponible | no disponible | no disponible | HuggingFace, en bf16, FP8 y NVFP4 |
| Otros borradores de decodificacion especulativa (EAGLE-3, Medusa, MTP) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo independiente: sin Beam no genera nada. Cualquier uso fuera de un servidor de decodificación especulativa compatible es inválido.
- Las cifras de la tabla de evaluación son longitudes de aceptación, no puntuaciones de calidad. Interpretarlas como resultados de benchmark de tarea sería un error.
- Los resultados publicados se obtuvieron con una configuración muy concreta (Beam NVFP4, tensor parallelism 4, GPUs B300, bloque de servicio 8). Otras configuraciones de hardware, cuantización o tamaño de bloque pueden dar longitudes de aceptación distintas.
- El tamaño de bloque de entrenamiento es 16, pero se recomienda 8 para servir; usar valores distintos de los entrenados puede degradar la aceptación.
- La ventana deslizante de 4.096 tokens limita la atención propia del borrador sobre el contexto; no se especifica la longitud de contexto máxima del sistema completo.
- No se han publicado datos sobre sesgos, idiomas soportados, composición del dataset de entrenamiento ni comportamiento en dominios sensibles.
- Riesgo de alucinación: no aplica de forma directa al borrador, ya que Beam verifica cada token y el muestreo por rechazo preserva su distribución. El riesgo de alucinación es el del modelo base Beam.
- Licencia apache-2.0 para el borrador, lo que permite uso comercial de estos pesos; conviene verificar por separado la licencia del modelo base Beam y de las herramientas de servicio empleadas (SGLang, vLLM, TokenSpeed).
- Con 141 descargas y 17 likes, la comunidad de usuarios es todavía muy reducida, por lo que hay poca experiencia de producción documentada.
- El tag "qwen3" sugiere compatibilidad o linaje arquitectónico con esa familia, pero no se detalla en la información disponible; no debe asumirse compatibilidad con tokenizadores o plantillas de chat de Qwen3.

## Enlaces

- [Modelo en HuggingFace: reflection/Beam-1.0-501B-A23B-DFlash2](https://huggingface.co/reflection/Beam-1.0-501B-A23B-DFlash2)
- [Modelo base: reflection/Beam-1.0-501B-A23B](https://huggingface.co/reflection/Beam-1.0-501B-A23B)
- [Modelo base en FP8: reflection/Beam-1.0-501B-A23B-FP8](https://huggingface.co/reflection/Beam-1.0-501B-A23B-FP8)
- [Modelo base en NVFP4: reflection/Beam-1.0-501B-A23B-NVFP4](https://huggingface.co/reflection/Beam-1.0-501B-A23B-NVFP4)
- [Receta de SGLang para Beam 1.0](https://docs.sglang.io/cookbook/autoregressive/Reflection/Beam-1_0)
- [Receta de vLLM para Beam 1.0-501B-A23B](https://recipes.vllm.ai/reflection/Beam-1.0-501B-A23B?features=reasoning%2Ctool_calling%2Cspec_decoding)
- [Receta de TokenSpeed para Beam](https://lightseek.org/tokenspeed/recipes/models#beam)
- [Imagen de cabecera de la model card](https://cdn-uploads.huggingface.co/production/uploads/620a77b7dbba8fc1fbb8bdb4/N-HiEVXlqtoniRSdFo0RG.png)
