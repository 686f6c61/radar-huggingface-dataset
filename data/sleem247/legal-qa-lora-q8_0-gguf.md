# Sleem247/legal-qa-lora-Q8_0-GGUF

## Resumen

`Sleem247/legal-qa-lora-Q8_0-GGUF` es un adaptador LoRA en formato GGUF derivado de `NishKook/legal-qa-lora`, un adaptador de ajuste fino orientado a preguntas y respuestas del dominio legal. El adaptador original se entreno sobre un modelo base Mistral-7B (segun las etiquetas del repositorio) y emplea los conjuntos de datos `theatticusproject/cuad` (Contract Understanding Atticus Dataset) y `jhu-clsp/SARA` (Statutes and Rules Annotated) como material de referencia para el dominio juridico. Esta version concreta fue convertida a GGUF mediante el espacio `gguf-my-lora` de ggml.ai con cuantizacion Q8_0, lo que la hace consumible directamente por llama.cpp.

El interes practico de esta publicacion es acotado: no se trata de un modelo completo, sino de un adaptador que debe combinarse con un modelo base Mistral-7B compatible en tiempo de inferencia (por ejemplo, mediante los flags `--lora` de `llama-cli` o `llama-server`). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, no declara licencia y su tamano reportado es de 0.0 GB, lo que sugiere que los pesos pueden no estar efectivamente alojados o que el proceso de subida quedo incompleto.

La relevancia actual es limitada pero ilustrativa: muestra el flujo de trabajo tipico para llevar un adaptador LoRA de dominio legal a entornos de inferencia locales y despliegues tipo RAG (LangChain + FAISS, segun las etiquetas). Cualquier evaluacion seria requiere verificar primero la disponibilidad real de los ficheros y consultar la model card del adaptador original, ya que esta ficha solo describe el envoltorio GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base Mistral-7B; pesos en formato GGUF |
| Parametros totales | 6.815.744 (segun metadatos del repositorio; corresponde al adaptador LoRA, no al modelo base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base Mistral-7B con el que se combine) |
| Tipos de cuantizacion | Q8_0 (unica variante publicada en este repositorio) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (adaptador LoRA en GGUF, para usar con `--lora` en llama.cpp) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA convertido a GGUF, no un transformer completo. La arquitectura subyacente corresponde al modelo base Mistral-7B sobre el que se entreno el adaptador original `NishKook/legal-qa-lora`; el adaptador en si anade matrices de bajo rango a las capas del modelo base para especializarlo en tareas de pregunta-respuesta legal. La conversion a GGUF se realizo con el espacio `gguf-my-lora` de ggml.ai, que empaqueta los tensores del adaptador en el formato de llama.cpp con cuantizacion Q8_0.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, la presencia de RLHF/DPO ni innovaciones tecnicas especificas. Las etiquetas indican el uso de `theatticusproject/cuad` y `jhu-clsp/SARA` como conjuntos de datos de referencia, ambos en ingles y centrados en contratos y estatutos legales estadounidenses. Tampoco se documenta la configuracion del LoRA (rango, alpha, capas objetivo).

## Capacidades

- Respuesta a preguntas sobre texto legal en ingles, orientada por el ajuste fino del adaptador sobre CUAD y SARA.
- Extraccion y resumen de clausulas contractuales, segun el dominio de los datasets de entrenamiento.
- Integracion en pipelines de recuperacion aumentada (RAG) con LangChain y FAISS, tal como indican las etiquetas del repositorio.
- Inferencia local mediante llama.cpp (`llama-cli`, `llama-server`) combinando el adaptador con un modelo base Mistral-7B.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), aunque sin documentacion adicional sobre el contrato de la API.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Capacidades de vision, audio o modo thinking: no disponibles.

## Casos de uso

- Asistente de consulta contractual: el adaptador, combinado con Mistral-7B, permite responder preguntas sobre clausulas de contratos en ingles, aprovechando el ajuste sobre CUAD para identificar obligaciones, fechas y partes.
- Revision de cumplimiento normativo: integrado en un pipeline RAG con FAISS sobre un corpus de estatutos (SARA), el modelo puede responder consultas sobre reglas y definiciones legales citando los fragmentos recuperados.
- Despliegue local en despachos juridicos: al ejecutarse con llama.cpp sobre un modelo base Mistral-7B cuantizado, permite mantener los documentos dentro de la infraestructura del cliente sin enviar datos a APIs externas.
- Prototipado rapido de herramientas legal-tech: el formato GGUF y los flags `--lora` de `llama-server` facilitan levantar un endpoint HTTP de pruebas en minutos para validar una idea de producto.
- Generacion de borradores de resumenes de contratos: el modelo puede producir sintesis en ingles de documentos largos, siempre que el contexto lo permita y con revision humana obligatoria.
- Investigacion academica sobre adaptadores de dominio: sirve como ejemplo reproducible del flujo LoRA -> GGUF para estudiar el impacto de la cuantizacion Q8_0 en adaptadores de bajo rango.
- Filtrado y clasificacion previa en pipelines documentales: puede usarse para etiquetar consultas legales por tipo antes de derivarlas a un sistema mas especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en si ocupa muy poco espacio (los metadatos indican 6.815.744 parametros, del orden de decenas de MB en Q8_0), pero requiere cargar un modelo base Mistral-7B completo para funcionar.
- VRAM estimada para el conjunto base + adaptador: aproximadamente 15-16 GB en FP16, 8-9 GB en cuantizacion Q4_K_M y 6-7 GB en Q4_0, dependiendo del modelo base elegido y del contexto configurado.
- GPU recomendadas: A100 40 GB o H100 para despliegues concurrentes con contexto largo; RTX 4090 (24 GB) para FP16 sin problemas; RTX 3090/4080 (16-24 GB) para cuantizaciones Q8_0 o Q4.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB con cuantizacion Q4 y contexto moderado; en GPUs de 8 GB solo con cuantizaciones agresivas y contexto reducido.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server` con `--lora`), y por extension Ollama si se empaqueta el par base+adaptador; vLLM y TGI no soportan de forma nativa adaptadores LoRA en GGUF, por lo que requeririan el adaptador en formato PEFT sobre el modelo base.
- Latencia y throughput: no disponibles; dependen enteramente del modelo base y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Sleem247/legal-qa-lora-Q8_0-GGUF | 6,8 M (adaptador LoRA) | no disponible (hereda del base) | GGUF (LoRA) | no disponible | Adaptador legal en ingles, 0 descargas |
| NishKook/legal-qa-lora | no disponible | no disponible | PEFT/LoRA | no disponible | Adaptador original del que deriva este |
| Mistral-7B-Instruct (base tipico) | 7,2 B | 32 K tokens (segun version) | safetensors, GGUF | Apache 2.0 | Modelo generalista; el adaptador se aplica sobre el |
| Modelos legales especializados completos (p. ej. variantes legales de 7B) | ~7 B | variable | safetensors, GGUF | variable | Alternativa si se busca un modelo listo para usar sin combinar base + adaptador |

La comparacion directa es dificil porque este repositorio no contiene un modelo autonomo. Frente a un modelo legal completo, la ventaja es el tamano minimo del adaptador y la posibilidad de reutilizar un base ya desplegado; la desventaja es la dependencia de un base concreto y la ausencia de benchmarks publicados.

## Limitaciones y advertencias

- El repositorio no declara licencia, lo que impide determinar si el uso comercial esta permitido; es imprescindible contactar con el autor o consultar el repositorio original antes de cualquier despliegue en produccion.
- El tamano del repositorio reportado es 0.0 GB y las descargas son 0, lo que sugiere que los pesos pueden no estar disponibles o que la publicacion esta incompleta.
- Es un adaptador, no un modelo autonomo: sin un modelo base Mistral-7B compatible no produce ninguna salida.
- Solo soporta ingles; no hay evidencia de capacidades multilingues.
- Riesgo de alucinacion juridica: como cualquier modelo de lenguaje, puede inventar clausulas, citas o referencias normativas; requiere revision por un profesional cualificado.
- Sesgos potenciales derivados de los datasets CUAD y SARA, centrados en derecho estadounidense y en un tipo concreto de contratos; el rendimiento fuera de ese dominio es incierto.
- No hay informacion sobre la configuracion del LoRA (rango, capas), lo que dificulta reproducir el entrenamiento o evaluar su calidad.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de su rendimiento frente a alternativas.
- La cuantizacion Q8_0 del adaptador puede introducir una ligera degradacion respecto al adaptador original en precision completa, aunque el efecto suele ser minimo en LoRA.
- No hay garantias de soporte ni mantenimiento del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Sleem247/legal-qa-lora-Q8_0-GGUF
- Adaptador original: https://huggingface.co/NishKook/legal-qa-lora
- Espacio de conversion GGUF-my-lora: https://huggingface.co/spaces/ggml-org/gguf-my-lora
- Documentacion de llama.cpp server (uso de LoRA): https://github.com/ggerganov/llama.cpp/blob/master/examples/server/README.md
- Dataset CUAD: https://huggingface.co/datasets/theatticusproject/cuad
- Dataset SARA: https://huggingface.co/datasets/jhu-clsp/SARA
