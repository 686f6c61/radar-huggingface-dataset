# HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-dense-seed11-step-059

## Resumen

El modelo `HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-dense-seed11-step-059` es un ajuste fino (fine-tune) denso del modelo base `Qwen/Qwen3-4B-Instruct-2507`, publicado por el usuario HYU-NLP-EVAL. Se trata del checkpoint correspondiente al paso 59 de una ejecución de entrenamiento identificada como `phase1-online-rubrics-medicine-full-dense-20260919-seed11`, lo que sugiere un entrenamiento con recompensas basadas en rúbricas ("rubrics") aplicado sobre un corpus de dominio médico. El nombre de la ejecución, la ausencia de métricas y el propio aviso de la model card ("Research use only") apuntan a un artefacto de investigación o de evaluación experimental, no a un modelo listo para producción.

El modelo tiene 4.411.424.256 parámetros según los pesos en safetensors, es de arquitectura densa (no MoE) y hereda del modelo base la familia Qwen3, con licencia declarada Apache 2.0 en las etiquetas del repositorio. El repositorio ocupa 26,5 GB porque contiene tanto los pesos BF16 para inferencia en la raíz como un directorio `original_checkpoint/` con los ficheros originales de veRL (solo parámetros del modelo), lo que duplica aproximadamente el peso de los artefactos.

Su relevancia es acotada y muy específica: sirve como punto de comparación dentro de una serie de checkpoints de un mismo experimento de ajuste fino sobre dominio médico, y permite reproducir o auditar esa ejecución concreta. No hay benchmark publicado, ni descripción de dataset, ni número de tokens de entrenamiento en la información disponible, por lo que cualquier uso requiere evaluación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), heredada del modelo base Qwen/Qwen3-4B-Instruct-2507 |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no especificada en la model card; el modelo base Qwen3-4B-Instruct-2507 declara 262.144 tokens de contexto nativo |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos BF16; no se publican GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible; el modelo base declara soporte multilingue amplio (mas de 100 idiomas), no confirmado para este fine-tune |
| Licencia | apache-2.0 en las etiquetas del repositorio; la model card indica "Research use only" (contradiccion a resolver antes de cualquier uso comercial) |
| Formato de pesos | safetensors (BF16) para inferencia, mas checkpoint original veRL en `original_checkpoint/` |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 (finetune) |
| Tamano del repositorio | 26,5 GB |
| Identificador del run | phase1-online-rubrics-medicine-full-dense-20260919-seed11 |
| Paso del checkpoint | 59 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-4B-Instruct-2507: un transformer denso de tipo decoder-only con atención por consultas agrupadas (GQA, 8 cabezas KV frente a 32 cabezas de atención), 36 capas y un vocabulario de aproximadamente 151.936 tokens. No se ha modificado la topología según la información disponible; el ajuste es de pesos completos ("full-dense"), no de adaptadores tipo LoRA, a juzgar por el sufijo del run y por el tamaño del checkpoint.

Sobre el entrenamiento, la información proporcionada es mínima: se conoce el identificador del run (`phase1-online-rubrics-medicine-full-dense-20260919-seed11`), la fecha codificada en el nombre (19/09/2026), la semilla (11) y el número de paso del checkpoint (59). El término "online-rubrics" y el dominio "medicine" sugieren un esquema de aprendizaje por refuerzo o preferencias con rúbricas evaluadas en línea sobre contenido médico, pero ni la model card ni las etiquetas confirman el algoritmo, el número de tokens, la composición del dataset, ni si hubo RLHF, DPO o GRPO. Todo ello debe considerarse no disponible.

El repositorio conserva el checkpoint original de veRL (framework de RL para LLM) con solo los parámetros del modelo, lo que facilita reanudar o inspeccionar el entrenamiento, pero no aporta documentación adicional sobre el proceso.

## Capacidades

- Generacion de texto conversacional en formato de chat, heredada del modelo base instruct.
- Razonamiento y respuesta a instrucciones de dominio general, con especializacion declarada (aunque no documentada) en contenido medico derivada del ajuste fino.
- Generacion de codigo y matematicas: capacidad esperable por herencia del modelo base, no verificada en este checkpoint.
- Tool calling y function calling: el modelo base Qwen3-4B-Instruct-2507 lo soporta; no hay confirmacion de que el fine-tune lo preserve.
- Uso en agentes y razonamiento multi-paso: probable por herencia del modelo base, sin evaluacion publicada.
- Capacidades multilingues: no documentadas para este checkpoint.
- Modo "thinking": el modelo base de la serie 2507 es de respuesta directa no pensante (non-thinking); no se documenta ningun modo de razonamiento extendido en este fine-tune.
- Vision y audio: no soportados (modelo exclusivamente de texto).
- No se documenta ninguna capacidad especial adicional (decodificacion especulativa propia, atencion lineal, memoria extendida, etc.).

## Casos de uso

- Evaluacion comparativa de checkpoints de RL: el modelo sirve como punto de medida intermedio (paso 59) dentro de una serie de entrenamiento, util para estudiar la evolucion de la calidad de respuesta a lo largo de las iteraciones de un pipeline de rúbricas.
- Investigacion sobre ajuste fino con rúbricas en dominio medico: reproduccion del run `phase1-online-rubrics-medicine-full-dense-20260919-seed11` para analizar como las recompensas basadas en rúbricas moldean el comportamiento del modelo frente al base sin ajustar.
- Generacion de borradores de texto clinico no diagnostico: redaccion de resumenes, notas informativas o material de educacion para pacientes, siempre con revision humana y sin uso como herramienta de decision clinica.
- Preguntas y respuestas sobre literatura medica: extraccion y sintesis de informacion a partir de documentos largos, aprovechando la ventana de contexto de 262.144 tokens heredada del modelo base (pendiente de verificacion en este checkpoint).
- Construccion de conjuntos de datos sinteticos de dominio medico para experimentos: generacion de pares instruccion-respuesta con fines de investigacion, etiquetados explicitamente como sinteticos.
- Pruebas de robustez y sesgo en modelos medicos: uso como sujeto de evaluacion en estudios de alucinacion, sesgo demografico o adherencia a guias clinicas dentro de un marco academico.
- Base para experimentos de destilacion o comparacion de tecnicas de alineamiento: al ser un checkpoint intermedio con pesos completos, permite analizar diferencias de pesos y representaciones frente al modelo base y frente a otros pasos de la misma serie.
- Prototipado de asistentes conversacionales de triaje informativo en entornos controlados de laboratorio, nunca en atencion al paciente real sin validacion regulatoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MedQA, PubMedQA ni ninguna otra metrica, y las etiquetas del repositorio no aportan cifras de rendimiento. Tampoco se documentan comparaciones con el modelo base ni con otros checkpoints del mismo run.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del numero de parametros y de la arquitectura del modelo base; no estan publicadas por el autor.

- Pesos en BF16: aproximadamente 8,8 GB (4,41 mil millones de parametros a 2 bytes por parametro). El repositorio pesa 26,5 GB porque incluye ademas el checkpoint original de veRL.
- Pesos en FP8 o INT8: aproximadamente 4,5 GB.
- Pesos en cuantizacion de 4 bits (formato GGUF Q4_K_M, previa conversion): aproximadamente 2,5-2,7 GB.
- Cache KV en FP16: con 36 capas, 8 cabezas KV y dimension de cabeza 128, cada token consume unas 144 KiB de cache. A 32.768 tokens de contexto son unos 4,7 GB; a 131.072 tokens, unos 18,8 GB; a 262.144 tokens, unos 37,6 GB. Estas cifras condicionan mas que los propios pesos el uso de la ventana completa.
- GPU consumer: cabe en una RTX 4090, RTX 4080, RTX 3090 o RTX 4070 Ti Super (16 GB o mas) en BF16 con contextos moderados; en tarjetas de 8-12 GB sera necesario cuantizar a 4 u 8 bits.
- GPU de centro de datos: A100 40/80 GB, H100 80 GB, L40S 48 GB. Para servir contexto completo de 262.144 tokens se recomienda al menos 80 GB de VRAM o bien tecnicas de atencion eficiente y cache KV cuantizada.
- Despliegue: compatible con transformers, vLLM y TGI (la etiqueta `text-generation-inference` y `endpoints_compatible` estan presentes). Para llama.cpp u Ollama seria necesaria una conversion previa a GGUF, que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Los datos de la columna "modelo" corresponden a las model cards publicas de cada alternativa; los de este checkpoint se limitan a lo indicado en la informacion disponible, ya que no hay benchmarks publicados.

| Modelo | Parametros | Contexto | Licencia | Rendimiento publicado |
|---|---|---|---|---|
| qwen3-4b-rar-medicine-onlinerubrics-dense-seed11-step-059 | 4,41 mil millones (denso) | no disponible (base: 262.144 tokens) | apache-2.0 en etiquetas, "research use only" en la model card | no disponible |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4,02 mil millones (denso) | 262.144 tokens | Apache 2.0 | Publica resultados en benchmarks generales en su model card |
| Llama-3.1-8B-Instruct | 8 mil millones (denso) | 128.000 tokens | Llama 3.1 Community License | Publica resultados en benchmarks generales |
| Gemma-3-4B-IT | 4 mil millones (denso, multimodal en la variante IT) | 128.000 tokens | Gemma Terms of Use | Publica resultados en benchmarks generales |
| Phi-4-mini-instruct | 3,8 mil millones (denso) | 128.000 tokens | MIT | Publica resultados en benchmarks generales |

En la practica, el unico comparable directo en cuanto a comportamiento es el propio modelo base, ya que no existe informacion publicada sobre como el ajuste con rúbricas afecta a tareas estandar. Cualquier comparacion de rendimiento con las alternativas de la tabla seria especulativa.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion humana, ni analisis de errores. No se puede afirmar que el modelo mejore al base en ninguna tarea.
- Ambiguedad de licencia: las etiquetas indican apache-2.0, pero la model card dice "Research use only". Antes de cualquier uso comercial debe aclararse esta contradiccion con el autor; en caso de duda, debe prevalecer la restriccion mas conservadora.
- Riesgo de alucinacion elevado en dominio medico: cualquier ajuste sobre contenido clinico sin evaluacion publicada puede producir afirmaciones plausibles pero falsas, con consecuencias graves si se usa en contextos de salud.
- Dominio especializado no verificado: se desconoce que subconjunto de conocimiento medico se ha reforzado y cual se ha degradado respecto al modelo base.
- Sesgos: no documentados. El modelo base Qwen3 presenta sesgos conocidos de genero, origen etnico y sesgo cultural derivados de los datos de preentrenamiento; el ajuste fino no corrige necesariamente estos sesgos y podria acentuarlos en funcion de las rúbricas utilizadas.
- Limitaciones de idioma: no se especifica que idiomas conserva el fine-tune. Es posible que el ajuste en un dominio concreto haya degradado el rendimiento multilingue del modelo base.
- Limitaciones de contexto: aunque el modelo base soporta 262.144 tokens, no se ha verificado que este checkpoint mantenga ese comportamiento, y la cache KV a esa longitud exige hardware de gama alta.
- Riesgo de sobreajuste al esquema de recompensas: al ser un checkpoint intermedio (paso 59) de un run de RL con rúbricas, puede mostrar un estilo de respuesta muy ajustado al evaluador y poco generalizable.
- Artefacto de investigacion: el repositorio incluye un directorio `original_checkpoint/` con ficheros de veRL que no son necesarios para inferencia y que inflan el tamano de descarga hasta 26,5 GB.
- Sin garantias de mantenimiento: cero descargas y cero "likes" en el momento de redactar esta ficha, sin historial de soporte ni actualizaciones posteriores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-dense-seed11-step-059
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Perfil del autor: https://huggingface.co/HYU-NLP-EVAL
- Repositorio de veRL (framework de RL para LLM, referenciado por la estructura del checkpoint): https://github.com/volcengine/verl
- Paper tecnico de Qwen3: no disponible en la informacion proporcionada
- Blog o demo del modelo: no disponible en la informacion proporcionada
- Otros enlaces relevantes encontrados en la busqueda web: no disponible
