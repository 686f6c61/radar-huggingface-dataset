# mradermacher/negative-confetti-GGUF

## Resumen

negative-confetti-GGUF es la versión cuantizada en formato GGUF del modelo ToastyPigeon/negative-confetti, un merge de modelos generado con mergekit. Lo publica mradermacher, un conocido creador de cuantizaciones estáticas para la comunidad de llama.cpp y ecosistemas compatibles con GGUF. El modelo original es un merge, es decir, una combinación de pesos de otros modelos sin entrenamiento adicional, orientado a inglés y con un tamaño de aproximadamente 27.000 millones de parámetros.

La relevancia de esta ficha radica en que permite ejecutar un modelo de ~27B en hardware de consumo mediante cuantizaciones que van desde Q2_K (10,6 GB) hasta Q8_0 (28,8 GB), además de incluir suplementos multimodales (mmproj) que sugieren capacidades de visión en el modelo base. Al ser un merge sin model card detallada, la información sobre entrenamiento, datos y benchmarks es prácticamente inexistente, lo que limita su evaluación rigurosa para producción.

El repositorio tiene un tamaño total de 188,1 GB (incluyendo todas las variantes de cuantización) y registra 78 descargas y 0 likes en el momento de la consulta. La licencia no está especificada, lo que constituye una advertencia importante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (merge de modelos, sin detalles adicionales) |
| Parametros totales | 27.009.346.304 (~27B) |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base ToastyPigeon/negative-confetti es un merge generado con mergekit, según las etiquetas del repositorio. Esto implica que sus pesos provienen de la combinación de dos o más modelos preentrenados mediante alguna técnica de fusión (no especificada), sin un proceso de entrenamiento adicional documentado. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste fino supervisado.

La presencia de archivos mmproj (multi-modal supplement) en el repositorio GGUF indica que el modelo base incorpora algún componente multimodal, probablemente visión, aunque no se detalla la arquitectura exacta de dicho componente ni cómo se integra con el transformer principal. No se han documentado innovaciones técnicas específicas como decodificación especulativa, atención lineal o arquitecturas híbridas.

## Capacidades

- Generación de texto en inglés.
- Capacidades multimodales inferidas por la presencia de archivos mmproj (posible soporte de visión, sin confirmación documental).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma.
- No se documentan modos especiales como thinking mode, audio u otras capacidades.

## Casos de uso

- Experimentación con merges de modelos: investigadores que quieran evaluar el comportamiento de un merge de ~27B en tareas de generación de texto, aprovechando las cuantizaciones GGUF para ejecutarlo en hardware asequible.
- Prototipado rápido en local: desarrolladores que necesiten un modelo de ~27B en una estación de trabajo con GPU de consumo, usando Q4_K_M (16,6 GB) para equilibrar calidad y velocidad.
- Evaluación comparativa de técnicas de fusión: comparar la salida de este merge frente a sus modelos constituyentes para estudiar el efecto de mergekit en la calidad del texto generado.
- Pruebas de pipelines multimodales: si se confirma la capacidad de visión, usar los archivos mmproj junto con el modelo principal en llama.cpp para tareas de descripción de imágenes en inglés.
- Despliegue en entornos con recursos limitados: usar Q2_K (10,6 GB) o Q3_K_S (12,3 GB) en GPUs con 12-16 GB de VRAM para inferencia de un modelo de 27B, aceptando la pérdida de calidad asociada.
- Investigación sobre sesgos y alucinaciones en modelos fusionados: analizar cómo un merge sin ajuste alineado se comporta en tareas abiertas, como paso previo a decidir si es apto para un caso concreto.
- Generación de texto creativo en inglés: usar el modelo con Q6_K (22,3 GB) para tareas de escritura donde se priorice la calidad sobre la latencia, en un contexto de experimentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: desde ~10,6 GB (Q2_K) hasta ~28,8 GB (Q8_0) solo para los pesos; añadir overhead de contexto y caché KV (no cuantificado en la mayoría de configuraciones).
- GPU recomendadas: para Q8_0, una A100 40GB, H100 o RTX 4090 (24 GB, justo al límite); para Q4_K_M, una RTX 4090, RTX 3090 o A6000; para Q2_K/Q3_K_S, una RTX 4080 (16 GB) o RTX 4070 Ti Super.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) con cuantizaciones Q4 y Q5; en GPUs de 16 GB con Q2_K o Q3_K_S; en GPUs de 12 GB solo con Q2_K y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama (previa importación del GGUF), LM Studio, y servidores compatibles con GGUF como llama-cpp-python. No se garantiza compatibilidad con vLLM o TGI para este formato concreto.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| negative-confetti-GGUF | ~27B | no disponible | no disponible | GGUF | Merge sin documentacion de entrenamiento |
| Modelos ~27B tipicos (p. ej. familia Gemma 2 27B) | 27B | 8K-128K segun variante | licencia abierta con terminos | safetensors, GGUF | Entrenamiento documentado y benchmarks publicos |
| Merges GGUF de mradermacher (otros) | variable | no disponible | segun modelo base | GGUF | Misma metodologia de cuantizacion estatica |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Licencia no especificada: no se puede garantizar el uso comercial; es imprescindible contactar con el autor del modelo base antes de usarlo en producción.
- Ausencia total de documentación sobre datos de entrenamiento, sesgos y alineación; el modelo es un merge sin ajuste RLHF documentado, por lo que el riesgo de respuestas sesgadas o inapropiadas es alto.
- Riesgo elevado de alucinación al no haber información sobre el proceso de alineación.
- Soporte limitado al inglés; no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Longitud de contexto desconocida; no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K) degradan notablemente la calidad; el autor recomienda Q4_K_M o superiores para uso práctico.
- No hay cuantizaciones ponderadas/imatrix disponibles según la model card, lo que puede afectar a la calidad frente a otras variantes del ecosistema.
- Modelo con 0 likes y 78 descargas: comunidad mínima, sin validación independiente ni reportes de uso.
- El tamaño del repositorio (188,1 GB) implica que descargar todas las variantes es costoso; conviene descargar solo la cuantización necesaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/negative-confetti-GGUF
- Modelo base: https://huggingface.co/ToastyPigeon/negative-confetti
- Página de descargas del autor: https://hf.tst.eu/model#negative-confetti-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
