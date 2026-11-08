# mradermacher/llama-2-7b-NDMO-agent-GGUF

## Resumen

`mradermacher/llama-2-7b-NDMO-agent-GGUF` es una coleccion de cuantizaciones en formato GGUF del modelo `IJyad/llama-2-7b-NDMO-agent`, un fine-tuning de Llama 2 7B orientado al dominio legal y etiquetado como agente. El trabajo de cuantizacion lo firma mradermacher, un conocido publicador de quants estaticos en el ecosistema llama.cpp, y el modelo base procede del usuario IJyad. No se trata de un modelo original, sino de una redistribucion optimizada para inferencia local de un derivado de Llama 2.

El modelo hereda la arquitectura transformer decoder-only de Llama 2 con 6.738.415.616 parametros (aproximadamente 6,74 mil millones), entrenada originalmente por Meta sobre datos predominantemente en ingles. El fine-tuning de IJyad anade la etiqueta `legal` y el sufijo `agent`, lo que sugiere un ajuste orientado a tareas juridicas y posiblemente a flujos con llamada a herramientas, aunque la model card del repositorio cuantizado no documenta ni el dataset ni el procedimiento de entrenamiento.

Su relevancia practica es acotada: se trata de un modelo de 7B de la generacion Llama 2 (julio de 2023), superado ampliamente en capacidad por modelos posteriores del mismo tamano. Su interes reside en la disponibilidad de cuantizaciones GGUF listas para ejecutar en hardware de consumo y en su especializacion declarada en dominio legal, lo que puede resultar util para prototipos de nicho o para experimentacion con modelos pequenos en espanol juridico (aunque el modelo solo declara ingles).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 2 7B) |
| Parametros totales | 6.738.415.616 (aproximadamente 6,74 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 2 soporta 4096 tokens) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con atencion multi-cabeza estandar (no GQA en la variante de 7B, a diferencia de 34B y 70B), normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El contexto nativo de Llama 2 es de 4096 tokens. El repositorio cuantizado no aporta informacion adicional sobre modificaciones arquitectonicas.

Respecto al entrenamiento, la model card del repositorio GGUF no documenta el dataset, el numero de tokens, ni si hubo fases de RLHF o DPO en el fine-tuning de `IJyad/llama-2-7b-NDMO-agent`. Solo se declara la etiqueta `legal` y el caracter de agente. El proceso documentado en este repositorio es exclusivamente la cuantizacion: mradermacher indica que se trata de quants estaticos (convert_type hf, quantize_version 2) y que no hay quants ponderados ni imatrix disponibles en el momento de la publicacion. El modelo no incorpora innovaciones tecnicas destacables mas alla de las propias de Llama 2.

## Capacidades

- Generacion de texto en ingles con la calidad base de Llama 2 7B.
- Razonamiento basico y respuesta a instrucciones, condicionado por el fine-tuning del modelo base.
- Especializacion declarada en dominio legal (etiqueta `legal`), aunque sin documentacion sobre el alcance o la profundidad de dicha especializacion.
- Orientacion a uso como agente (sufijo `agent`), presumiblemente con soporte de formato conversacional o de llamada a herramientas, si bien la model card no detalla el esquema.
- Capacidades multilingues limitadas al ingles declarado; no se garantiza un rendimiento solido en castellano.
- No se documentan capacidades de vision, audio, modo thinking explicito ni tool calling estructurado.

## Casos de uso

- Prototipado de asistentes juridicos en ingles: el modelo puede generar borradores de texto legal o resumir documentos, aprovechando su fine-tuning declarado en dominio legal, siempre con revision humana obligatoria.
- Experimentacion academica con modelos pequenos especializados: util para comparar el efecto de un fine-tuning de dominio frente a Llama 2 7B base en tareas de clasificacion o extraccion de entidades juridicas.
- Inferencia local en equipos sin GPU dedicada: las cuantizaciones Q4_K_S y Q4_K_M (4,0-4,2 GB) permiten ejecutar el modelo en CPU con llama.cpp u Ollama para pruebas de concepto.
- Generacion de texto asistida en pipelines de documentacion: integrable como paso de redaccion o reformulacion en flujos automatizados donde la latencia no sea critica.
- Evaluacion de agentes de bajo coste: el modelo puede servir como "agente ligero" en entornos de prueba para validar orquestaciones antes de migrar a modelos mayores.
- Educacion y formacion: demostraciones de cuantizacion GGUF y de despliegue local de modelos transformer sin infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: aproximadamente 2,6 GB (Q2_K), 4,0-4,2 GB (Q4_K_S / Q4_K_M), 4,9 GB (Q5_K_M), 5,6 GB (Q6_K), 7,3 GB (Q8_0) y 13,6 GB (f16), sin contar el overhead del runtime y la cache KV.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para cuantizaciones Q4/Q5 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090); A100 o H100 solo tendrian sentido para lotes grandes o para la variante f16.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas modernas con 8 GB o mas para Q4_K_M; en 4 GB solo con Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, LM Studio y servidores compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan los pesos safetensors del modelo base.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| llama-2-7b-NDMO-agent-GGUF (este) | 6,74 B | no disponible (base: 4096) | no disponible | GGUF | Fine-tuning legal/agente de Llama 2 7B |
| TheBloke/Llama-2-7B-GGUF | 6,74 B | 4096 | Llama 2 Community License | GGUF | Llama 2 7B base, sin especializacion |
| TheBloke/Llama-2-7B-Chat-GGUF | 6,74 B | 4096 | Llama 2 Community License | GGUF | Variante chat alineada de Llama 2 7B |

La comparativa se limita a variantes del mismo modelo base porque la informacion disponible no permite contrastar con alternativas de otros desarrolladores (Mistral 7B, Qwen2.5 7B, etc.) sin datos de rendimiento publicados para este fine-tuning.

## Limitaciones y advertencias

- La licencia no esta declarada en la informacion disponible; antes de un uso comercial es imprescindible verificar la licencia del modelo base (`IJyad/llama-2-7b-NDMO-agent`) y, en ultima instancia, la Llama 2 Community License de Meta, que impone restricciones (por ejemplo, umbral de 700 millones de usuarios mensuales y clausulas de uso aceptable).
- Modelo unicamente en ingles declarado: el rendimiento en castellano no esta garantizado y probablemente sea deficiente.
- Fine-tuning de dominio sin documentacion: se desconoce el dataset, el volumen de entrenamiento y el metodo de alineacion, lo que impide evaluar su robustez y sus sesgos.
- Riesgo elevado de alucinacion en materia legal: un modelo de 7B especializado no sustituye asesoramiento juridico profesional y puede generar citas normativas o jurisprudencia inexistentes.
- Contexto limitado (4096 tokens en el modelo base): no apto para documentos legales extensos sin estrategias de troceado o recuperacion.
- Sin quants imatrix ni ponderados: la calidad de las cuantizaciones de baja precision (Q2_K, Q3_K) puede degradarse notablemente.
- Popularidad muy baja (135 descargas, 0 likes en el momento de la consulta): escasa validacion comunitaria y sin garantias de mantenimiento.
- El repositorio ocupa 59,6 GB en total por acumulacion de todas las variantes; conviene descargar solo el fichero GGUF necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/llama-2-7b-NDMO-agent-GGUF
- Modelo base: https://huggingface.co/IJyad/llama-2-7b-NDMO-agent
- Pagina de descargas del autor: https://hf.tst.eu/model#llama-2-7b-NDMO-agent-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Llama 2 7B base en GGUF (referencia): https://huggingface.co/TheBloke/Llama-2-7B-GGUF
- Llama 2 7B Chat en GGUF (referencia): https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF
