# bcckfdn/cevher-test-2-GGUF

## Resumen

cevher-406m es un modelo de lenguaje de 406,9 millones de parámetros entrenado desde cero por el usuario bcckfdn siguiendo la arquitectura de SmolLM2 (familia Llama). Se distribuye exclusivamente en formato GGUF bajo licencia Apache-2.0 y está orientado a generación de texto conversacional en turco (tr) e inglés (en). El repositorio contiene cuatro cuantizaciones preparadas para su uso directo en el ecosistema llama.cpp, Ollama y LM Studio.

El modelo parte de un entrenamiento propio sobre 3.525 B de tokens declarados en la model card, con una configuración interna de 1.024 dimensiones ocultas y 34 capas. Su tamaño reducido lo sitúa en la categoría de modelos "small language models" (SLM), pensados para inferencia en CPU, dispositivos de borde o GPUs de gama baja, donde el coste por token y la huella de memoria son factores críticos.

Su relevancia actual es limitada pero concreta: se trata de una publicación experimental (el nombre "cevher-test-2" sugiere un modelo de prueba) con cero descargas y cero likes en el momento de redactar esta ficha, sin benchmarks publicados ni documentación detallada sobre la composición del dataset. Resulta interesante como ejemplo de fine-tuning/entrenamiento desde cero de un SLM multilingüe turco-inglés y como alternativa ligera para despliegues en local, pero carece por ahora de validación empírica pública.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder tipo Llama (configuración SmolLM2) |
| Parametros totales | 406.918.144 (aprox. 406,9 M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q5_K_M, Q4_K_M (GGUF) |
| Idiomas soportados | Turco (tr), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base original bcckfdn/cevher-test-2 se distribuye en safetensors |
| Dimension oculta | 1.024 |
| Numero de capas | 34 |
| Tokens de entrenamiento | 3.525 B (según la model card del autor) |
| Tamano del repositorio | 1,8 GB |

## Arquitectura y entrenamiento

La model card indica que el modelo se entrenó "desde cero" con la arquitectura de SmolLM2, que es una implementación tipo Llama (decoder-only) con 1.024 dimensiones ocultas y 34 capas. No se especifica en la documentación disponible si emplea atención con query grouping (GQA), RoPE, SwiGLU o embeddings atados, aunque son los componentes habituales de esta familia arquitectónica. Tampoco se detalla la composición del corpus de entrenamiento, la mezcla de idiomas (turco/inglés), ni si se aplicaron fases de ajuste fino supervisado, RLHF o DPO.

El dato más relevante disponible es el volumen declarado de entrenamiento: 3.525 B de tokens para 406,9 M de parámetros, lo que arroja una ratio de aproximadamente 8.660 tokens por parámetro (muy por encima del óptimo Chinchilla teórico, un patrón habitual en los modelos pequeños modernos que priorizan el sobrentrenamiento). No hay información sobre la longitud de contexto usada durante el entrenamiento, la estrategia de tokenización, el vocabulario o si se aplicaron técnicas de decodificación especulativa. La model card describe únicamente los ficheros GGUF publicados, los comandos de uso en llama.cpp, Ollama y LM Studio, sin apartado de metodología o evaluación.

## Capacidades

- Generación de texto autocompletivo y conversacional en turco e inglés (tags "text-generation" y "conversational").
- Producción de texto libre a partir de un prompt, con modo conversacional en llama.cpp (`-cnv`) y en Ollama.
- Capacidad multilingüe limitada a los dos idiomas declarados: turco e inglés.
- Ejecución en entornos de borde gracias a su tamaño reducido (< 1 GB en BF16, 245 MB en Q4_K_M).
- No se documenta soporte de tool calling / function calling.
- No se documenta soporte explícito de agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio, ni modos de "thinking" o razonamiento extendido.
- No hay información sobre la calidad real de instrucciones seguidas (instruction following) ni sobre si el modelo ha sido alineado para diálogo.

## Casos de uso

- Asistente conversacional en turco para entornos sin conexión: su cuantización Q4_K_M de 245 MB permite desplegar un chatbot básico en un portátil, una Raspberry Pi o un dispositivo móvil sin acceso a internet ni GPU dedicada.
- Prototipado rápido de aplicaciones de generación de texto: al ejecutarse con `llama-cli` u Ollama en segundos, sirve para validar pipelines de prompt engineering antes de migrar a modelos mayores.
- Generación de texto de relleno y borradores en turco: útil para tareas de redacción asistida de bajo coste donde no se requiere alta precisión factual.
- Clasificación y etiquetado de textos ligeros: con fine-tuning adicional, un modelo de 406 M puede adaptarse a tareas de categorización de reseñas o tickets en turco e inglés.
- Aumentación de datos sintéticos: generar corpus auxiliares en turco para entrenar otros modelos, siempre con revisión humana por el riesgo de alucinación.
- Investigación sobre SLMs multilingües: punto de partida para estudiar el rendimiento de arquitecturas SmolLM2 entrenadas desde cero en idiomas de bajos recursos como el turco.
- Despliegue embebido en aplicaciones de escritorio: integrable vía llama.cpp, LM Studio o llama-cpp-python en herramientas de escritorio que requieran generación de texto local sin dependencias de nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, perplexidad ni ninguna otra evaluación, y el repositorio registra 0 descargas y 0 likes, por lo que tampoco existen evaluaciones de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB en BF16 (778 MB de pesos + overhead de contexto y KV cache); en torno a 1 GB en Q8_0 (414 MB); y menos de 0,8 GB en Q5_K_M (281 MB) y Q4_K_M (245 MB).
- Cabe con holgura en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso GPUs integradas con memoria compartida.
- Inferencia en CPU completamente viable; se puede ejecutar en equipos de gama baja, Raspberry Pi 4/5 y dispositivos móviles con llama.cpp.
- No requiere GPU de datacenter (A100, H100) para funcionar; estas solo tendrían sentido para servir muchas réplicas simultáneas.
- Opciones de despliegue documentadas: llama.cpp (`llama-cli`), Ollama (`ollama create` / `ollama run`) y LM Studio. También es compatible con cualquier cliente que consuma GGUF (llama-cpp-python, Jan, text-generation-webui).
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de su documentación pública; los de cevher-406m, de la información disponible en este repositorio.

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| cevher-406m (este modelo) | 406,9 M | no disponible | Apache-2.0 | GGUF | Entrenado desde cero; turco + inglés; sin benchmarks públicos |
| SmolLM2-360M (HuggingFaceTB) | 362 M | 8.192 tokens | Apache-2.0 | safetensors, GGUF | Referencia arquitectónica directa; entrenado sobre 4 T tokens; benchmarks publicados |
| Qwen2.5-0.5B (Alibaba) | 494 M | 32.768 tokens | Apache-2.0 | safetensors, GGUF | Mayor contexto y soporte multilingüe amplio; benchmarks publicados |
| TinyLlama-1.1B | 1.100 M | 2.048 tokens | Apache-2.0 | safetensors, GGUF | Más parámetros y amplia comunidad, pero contexto corto |

En términos de tamaño, cevher-406m se sitúa entre SmolLM2-360M y Qwen2.5-0.5B. Su principal desventaja frente a estos es la ausencia total de benchmarks, de contexto declarado y de comunidad, mientras que su principal ventaja potencial es el soporte nativo de turco, un idioma peor cubierto por los SLM occidentales.

## Limitaciones y advertencias

- Sin benchmarks publicados: no hay evidencia empírica de su calidad, por lo que no debería desplegarse en producción crítica sin una evaluación propia.
- Riesgo elevado de alucinación: con 406 M de parámetros, la capacidad de retener conocimiento factual es muy limitada y el modelo puede inventar información con facilidad.
- Sesgos potenciales desconocidos: la model card no documenta la composición del dataset de entrenamiento ni medidas de mitigación de sesgos.
- Sin información sobre alineación o seguridad: no se indica si el modelo ha pasado por RLHF/DPO ni si tiene filtros de contenido.
- Contexto no especificado: se desconoce la ventana máxima soportada, lo que complica dimensionar aplicaciones con conversaciones largas o documentos extensos.
- Cobertura lingüística restringida: solo turco e inglés declarados; el rendimiento en otros idiomas será previsiblemente bajo o nulo.
- Naturaleza experimental: el nombre "cevher-test-2" y la ausencia de descargas sugieren que es un modelo de prueba, no una versión estable mantenida.
- Licencia Apache-2.0: permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y la atribución; no impone restricciones adicionales.
- Sin garantías del autor: al ser un experimento sin documentación de evaluación, cualquier uso en producción recae enteramente bajo responsabilidad de quien lo despliega.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bcckfdn/cevher-test-2-GGUF
- Modelo base (safetensors): https://huggingface.co/bcckfdn/cevher-test-2
- No se han encontrado en el resultado de la búsqueda web enlaces relevantes al modelo (los resultados devueltos corresponden a servicios ajenos y no guardan relación con esta ficha).
