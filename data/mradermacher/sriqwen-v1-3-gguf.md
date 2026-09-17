# mradermacher/Sriqwen-V1.3-GGUF

## Resumen

Sriqwen-V1.3-GGUF es la versión cuantizada en formato GGUF del modelo sriq-ai/Sriqwen-V1.3, publicada por el usuario mradermacher, especializado en la conversión de pesos a formatos ejecutables en hardware de consumo. El modelo original es un ajuste fino de tipo SFT (supervised fine-tuning) con LoRA, realizado con Unsloth, sobre un modelo base de aproximadamente 27.320 millones de parámetros, y orientado a tareas de razonamiento. Esta ficha describe la variante GGUF, que es la que permite su ejecución con llama.cpp y herramientas derivadas.

El repositorio incluye además dos ficheros mmproj (Q8_0 y f16), lo que indica que el modelo conserva capacidad multimodal de entrada de imagen, coherente con la etiqueta text-image-to-text de la ficha de HuggingFace. El repositorio ocupa 190,8 GB en total y ofrece un conjunto amplio de cuantizaciones estáticas, desde Q2_K (11,0 GB) hasta Q8_0 (29,1 GB).

La relevancia de esta publicación es práctica: al ser una cuantización GGUF, un modelo de ~27B con visión puede desplegarse en una sola GPU de 24 GB e incluso en CPU con suficiente memoria RAM, sin necesidad de infraestructura de datacenter. Como contrapartida, el repositorio no incluye resultados de benchmarks, no documenta la longitud de contexto y no especifica la arquitectura interna del modelo base, por lo que su evaluación previa a producción exige pruebas propias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (la model card no la detalla; el modelo base es un ajuste SFT con LoRA sobre sriq-ai/Sriqwen-V1.3) |
| Parámetros totales | 27.320.697.856 (≈27,3 mil millones) |
| Parámetros activos | No aplica (no hay indicios de arquitectura MoE en la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; además mmproj-Q8_0 y mmproj-f16 para la parte multimodal |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base está en formato HuggingFace/transformers |
| Dataset de ajuste | sriq-ai/sriq-sft-v1.3 |
| Modelo base | sriq-ai/Sriqwen-V1.3 |
| Tamaño del repositorio | 190,8 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base. Lo que sí consta es el procedimiento de ajuste: se trata de un fine-tuning supervisado (SFT) con LoRA, ejecutado con Unsloth, sobre el dataset sriq-ai/sriq-sft-v1.3, con etiquetas que declaran capacidades de razonamiento (reasoning). No se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases adicionales de RLHF o DPO.

El aspecto técnico más relevante de esta publicación es la parte multimodal: la presencia de ficheros mmproj (proyector multimodal) junto a los pesos cuantizados implica que el modelo acepta entradas de imagen además de texto, y que ese proyector debe cargarse por separado en llama.cpp para habilitar dicha funcionalidad. Las cuantizaciones son estáticas: el autor indica explícitamente que no ha publicado cuantizaciones ponderadas ni con imatrix, por lo que no existen variantes de calidad mejorada para este modelo en el momento de redactar esta ficha.

## Capacidades

- Generación de texto conversacional en inglés, con un ajuste específico orientado a tareas de razonamiento (etiqueta reasoning).
- Entrada de imagen además de texto (text-image-to-text), habilitada mediante los ficheros mmproj incluidos en el repositorio.
- Razonamiento multi-paso, presumiblemente con cadenas de pensamiento, derivado del ajuste SFT sobre un dataset orientado a reasoning.
- Ajuste sobre instrucciones conversacionales (etiqueta conversational en la ficha de HuggingFace).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no. El modelo declara únicamente inglés (en).
- Capacidad de audio o vídeo: no disponible.
- Modo thinking diferenciado: no disponible.

## Casos de uso

- Resolución de problemas con razonamiento encadenado: el ajuste SFT está orientado a tareas de razonamiento, de modo que puede emplearse en entornos educativos o de análisis donde se requiera justificar el resultado paso a paso en lugar de devolver solo la respuesta final.
- Análisis de documentos con componentes visuales: gracias al proyector multimodal, puede procesar capturas, diagramas o páginas escaneadas y responder preguntas sobre su contenido, útil en pipelines de extracción documental en inglés.
- Generación y asistencia de código en local: al ejecutarse vía GGUF en una estación de trabajo con una GPU de 24 GB, permite autocompletado y revisión de código sin enviar el código fuente a servicios externos, lo que facilita el cumplimiento de políticas de confidencialidad.
- Atención al cliente en inglés: admite conversaciones multi-turno con formato conversacional; el despliegue con llama-server permite exponer una API compatible con OpenAI para integrarla en un CRM.
- Clasificación y moderación con justificación: el sesgo hacia el razonamiento permite no solo etiquetar contenido, sino explicar el criterio aplicado, algo útil en colas de revisión humanas.
- Prototipado e investigación en hardware de consumo: sus cuantizaciones Q4_K_M (16,9 GB) y Q5_K_M (19,6 GB) caben en GPUs de 24 GB, lo que permite evaluar un modelo de ~27B con visión sin acceso a clústeres.
- Componente de un pipeline RAG con recuperación de imágenes o texto: puede combinar contexto recuperado con la imagen asociada y generar una respuesta sintetizada para un usuario final.
- Evaluación comparativa interna de ajustes SFT: sirve como referencia para medir si un fine-tuning propio sobre el mismo modelo base aporta mejoras reales en tareas de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio GGUF no incluye ninguna métrica (MMLU, HumanEval, GSM8K ni equivalentes), y el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que tampoco existen evaluaciones de terceros asociadas. La búsqueda web realizada no devolvió ninguna fuente relacionada con el modelo.

## Requisitos de hardware

- Tamaño de pesos por cuantización (datos del autor): Q2_K 11,0 GB; Q3_K_S 12,4 GB; Q3_K_M 13,6 GB; Q3_K_L 14,7 GB; IQ4_XS 15,5 GB; Q4_K_S 15,9 GB; Q4_K_M 16,9 GB; Q5_K_S 19,1 GB; Q5_K_M 19,6 GB; Q6_K 22,5 GB; Q8_0 29,1 GB; f16 ≈54,6 GB (estimación a partir de los 27.320 millones de parámetros a 2 bytes por parámetro; el repositorio contiene asimismo el fichero f16 de referencia citado en las etiquetas del autor).
- Componente multimodal: los ficheros mmproj añaden 0,7 GB (Q8_0) o 1,0 GB (f16) al consumo total.
- VRAM estimada para inferencia: hay que sumar a los pesos el caché KV y el overhead del runtime. Como la longitud de contexto no está documentada, no es posible dar una cifra cerrada de caché KV; en la práctica, para Q4_K_M conviene reservar entre 18 y 22 GB en GPU.
- GPU recomendadas: una única RTX 3090 o RTX 4090 (24 GB) para Q4_K_M, Q5_K_M y Q6_K con contextos moderados; A100 40 GB o H100 80 GB para f16 y Q8_0, o para Q4/Q5 con contextos largos; dos GPU de 24 GB en paralelo si se necesita Q8_0 con contexto amplio.
- ¿Cabe en GPU de consumo? Sí: Q2_K, Q3_K e IQ4_XS entran incluso en tarjetas de 12-16 GB; Q4_K_M y Q5_K_M son las opciones razonables en 24 GB.
- Ejecución sin GPU: llama.cpp permite descargar capas a CPU; para Q4_K_M se necesitan al menos unos 17 GB de RAM libres, y para Q8_0 alrededor de 30 GB.
- Opciones de despliegue: llama.cpp y llama-server (API compatible con OpenAI), Ollama, LM Studio, koboldcpp, text-generation-webui y cualquier frontend que consuma GGUF. vLLM y TGI no son la vía natural para estos ficheros, ya que trabajan preferentemente con los pesos originales en safetensors.
- Latencia y throughput estimados: no disponible (no hay mediciones publicadas, y dependen fuertemente de la cuantización, la GPU y la longitud de contexto).

## Comparativa con modelos similares

La comparación se establece por rango de parámetros y por perfil multimodal, ya que no existen resultados de benchmarks de Sriqwen V1.3 que permitan comparar rendimiento. Los datos de los modelos alternativos corresponden a sus especificaciones públicas.

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formatos disponibles |
|---|---|---|---|---|---|
| Sriqwen-V1.3-GGUF (este modelo) | ≈27,3 mil millones | No disponible | Sí (mmproj) | Apache 2.0 | GGUF (12 cuantizaciones) y safetensors en el modelo base |
| Qwen2.5-32B | 32,8 mil millones | 131.072 tokens | No en la variante de texto; existe Qwen2.5-VL aparte | Apache 2.0 | Safetensors, GGUF de terceros |
| Gemma 3 27B | 27 mil millones | 131.072 tokens (según configuración) | Sí | Licencia Gemma (con condiciones de uso) | Safetensors, GGUF de terceros |
| Mistral Small 3.1 24B | 24 mil millones | 131.072 tokens | Sí | Apache 2.0 | Safetensors, GGUF de terceros |

Comparación de rendimiento: no disponible para Sriqwen V1.3, al no haberse publicado benchmarks. En disponibilidad, este repositorio destaca por ofrecer un abanico de cuantizaciones estáticas muy completo, pero no ofrece variantes imatrix o ponderadas, que sí suelen existir para los modelos de la comparativa.

## Limitaciones y advertencias

- Cobertura lingüística restringida: el modelo solo declara inglés (en). No hay evidencia de calidad en castellano, por lo que no debería desplegarse en producción para español sin evaluación previa.
- Ausencia total de benchmarks: no hay métricas publicadas ni evaluaciones independientes; cualquier afirmación de calidad es especulativa hasta que se realicen pruebas propias.
- Riesgo de alucinación: inherente a cualquier modelo generativo, y aquí sin documentación de mitigaciones (RLHF, DPO o filtros). En tareas de razonamiento, una cadena de pensamiento coherente no garantiza que el resultado sea correcto.
- Dataset de ajuste opaco: la model card no describe la composición de sriq-ai/sriq-sft-v1.3, por lo que se desconocen sesgos potenciales, presencia de datos sintéticos y posibles problemas de contaminación.
- Cuantizaciones de baja precisión: las variantes Q2_K y Q3_K (11-14,7 GB) degradan de forma perceptible la calidad, especialmente en tareas de razonamiento. Para razonamiento conviene partir de Q4_K_M o superior.
- Sin cuantizaciones ponderadas ni imatrix: el propio autor indica que no las ha generado, lo que limita la calidad máxima alcanzable a igual tamaño de fichero.
- Restricciones de licencia: la ficha declara Apache 2.0 tanto para la cuantización como para el modelo base, lo que en principio permite uso comercial. No obstante, conviene verificar la licencia real del modelo base original, ya que la información disponible solo refleja los metadatos de HuggingFace.
- Metadatos con fechas anómalas: el repositorio figura como creado y actualizado el 17 de septiembre de 2026, una fecha posterior a la esperada; conviene contrastar la procedencia y la vigencia del repositorio antes de integrarlo.
- Repositorio sin tracción: 0 descargas y 0 likes implican ausencia de validación comunitaria, de informes de errores y de correcciones.
- Compatibilidad multimodal dependiente del runtime: para usar la entrada de imagen es imprescindible cargar el fichero mmproj correspondiente en llama.cpp; otras herramientas pueden no soportarlo todavía.
- Longitud de contexto desconocida: impide planificar despliegues con documentos largos o conversaciones extensas sin pruebas empíricas de degradación.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Sriqwen-V1.3-GGUF
- Modelo base: https://huggingface.co/sriq-ai/Sriqwen-V1.3
- Dataset de ajuste: https://huggingface.co/datasets/sriq-ai/sriq-sft-v1.3
- Página de resumen y descargas del cuantizador: https://hf.tst.eu/model#Sriqwen-V1.3-GGUF
- README de referencia sobre uso de ficheros GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de perplejidad entre tipos de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/
- La búsqueda web realizada no devolvió ningún resultado relacionado con el modelo: los enlaces obtenidos correspondían a foros sobre billetes de ferry y a un programa de consumo neerlandés, sin relación alguna con Sriqwen V1.3.
