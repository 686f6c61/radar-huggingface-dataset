# mradermacher/LaboAI-0.3.3-3B-GGUF

## Resumen

LaboAI-0.3.3-3B-GGUF es el conjunto de cuantizaciones en formato GGUF del modelo LaboAI/LaboAI-0.3.3-3B, un modelo denso de aproximadamente 3.086 millones de parámetros (3,09 B) especializado en generación de código para el ecosistema Android: Kotlin, Java y Jetpack Compose. Las cuantizaciones han sido producidas por mradermacher, un autor habitual de este tipo de conversiones en HuggingFace, y permiten ejecutar el modelo en hardware de consumo mediante llama.cpp, Ollama o LM Studio gracias a los formatos Q2_K a Q8_0 y f16.

El modelo base ha sido afinado por LaboAI y, según los tags del repositorio (qwen2.5, unsloth), deriva de la familia Qwen2.5 y se ha entrenado con las librerías de Unsloth. Los datos de entrenamiento declarados incluyen cuatro datasets: giggiovpg/ornith-android-instruct, giggiovpg/android-kotlin-compose-compiler-verified, microsoft/NextCoderDataset y glaiveai/glaive-code-assistant-v3, lo que confirma el enfoque hacia asistencia de código y, en particular, hacia el desarrollo Android moderno.

Es relevante porque cubre un nicho muy concreto (asistencia de código Android con licencia Apache-2.0, por tanto con uso comercial permitido) con un tamaño lo bastante reducido como para desplegarse en portátiles, estaciones de trabajo modestas o incluso dispositivos con GPU integrada, y con salidas en inglés, castellano y código. El repositorio ocupa 27,9 GB en total, aunque las cuantizaciones individuales van desde 1,4 GB (Q2_K) hasta 6,3 GB (f16).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, derivado de la familia Qwen2.5 (segun los tags del repositorio; la model card no especifica la arquitectura de forma explicita) |
| Parametros totales | 3.085.938.688 (aproximadamente 3,09 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles), es (castellano), code (lenguajes de programacion) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado por mradermacher); el modelo base original esta en safetensors |

## Arquitectura y entrenamiento

El modelo base LaboAI-0.3.3-3B es un transformer decoder-only de aproximadamente 3,09 B de parametros, segun los tags del repositorio derivado de la familia Qwen2.5 y entrenado con el framework Unsloth. Al tratarse de una cuantizacion, esta ficha describe principalmente el artefacto GGUF: mradermacher ha generado 12 variantes de cuantizacion estatica, todas derivadas del mismo modelo base, sin que se hayan publicado (por parte de este autor) cuantizaciones ponderadas o con matriz de importancia (imatrix) en el momento de la publicacion.

Los datos de entrenamiento declarados en la model card son cuatro dataset: giggiovpg/ornith-android-instruct y giggiovpg/android-kotlin-compose-compiler-verified (orientados a instrucciones Android y a Kotlin con Jetpack Compose verificado por compilador), microsoft/NextCoderDataset (dataset general de codigo de Microsoft) y glaiveai/glaive-code-assistant-v3 (asistente de codigo conversacional). No se especifica en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF, DPO o similares. Tampoco se detallan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, etc.).

## Capacidades

- Generacion de codigo en Kotlin, Java y, presumiblemente, en otros lenguajes cubiertos por los datasets generales de codigo (NextCoderDataset, glaive-code-assistant-v3).
- Asistencia especifica para Android: instrucciones sobre Jetpack Compose, APIs Android y ejemplos verificados por compilador en el conjunto de entrenamiento.
- Generacion de texto conversacional en ingles y castellano, orientada a tareas de programacion.
- Capacidad de seguir instrucciones (modelo tipo instruct, con dataset de instrucciones asociado).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades multimodales (vision, audio): no disponibles; el modelo es exclusivamente de texto/codigo.
- Capacidades multilingues: limitadas, segun la model card, a ingles, castellano y codigo. No se declaran otros idiomas.

## Casos de uso

- Asistente de codigo Android en el IDE: el modelo puede completar y generar funciones en Kotlin y Jetpack Compose, aprovechando los datasets especificos de Android y Compose verificados por compilador, y desplegarse localmente con Ollama o llama.cpp para integraciones tipo plugin.
- Generacion de plantillas y scaffolding de proyectos Android: crear archivos de configuracion, ViewModels, Composables y estructuras de paquetes a partir de descripciones en lenguaje natural, con la ventaja de la licencia Apache-2.0 para uso comercial.
- Revision y explicacion de codigo Java/Kotlin heredado: el modelo puede resumir clases, sugerir refactorizaciones o traducir fragmentos de Java a Kotlin en un flujo de trabajo asistido.
- Chatbot de soporte para desarrolladores: dado su soporte de ingles y castellano, puede responder dudas tecnicas en cualquiera de los dos idiomas en herramientas internas de documentacion o wikis, siempre con supervision humana.
- Generacion de tests unitarios y de instrumentacion para Android: el modelo puede redactar pruebas JUnit o Espresso a partir del codigo fuente, aprovechando su especializacion en el ecosistema.
- Prototipado rapido en entornos sin GPU dedicada: con cuantizaciones de 1,4 a 2,0 GB (Q2_K a Q4_K_M), cabe en portatiles y equipos con poca VRAM, lo que facilita demos y validaciones preliminares.
- Educacion y formacion en programacion Android: por su tamano reducido y su ajuste a Kotlin/Compose, es utilizable en aulas o talleres con hardware modesto para explicar conceptos con ejemplos generados bajo demanda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF unicamente documenta las variantes de cuantizacion, sus tamanos y notas cualitativas ("fast, recommended", "very good quality", "overkill"), sin incluir metricas de MMLU, HumanEval, GSM8K ni de benchmarks especificos de codigo (HumanEval, MBPP, LiveCodeBench).

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: aproximadamente 1,4 GB.
  - Q3_K_S / Q3_K_M / Q3_K_L: aproximadamente 1,6-1,8 GB.
  - IQ4_XS / Q4_K_S: aproximadamente 1,9 GB.
  - Q4_K_M: aproximadamente 2,0 GB.
  - Q5_K_S / Q5_K_M: aproximadamente 2,3 GB.
  - Q6_K: aproximadamente 2,6 GB.
  - Q8_0: aproximadamente 3,4 GB.
  - f16: aproximadamente 6,3 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM para las cuantizaciones Q4; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A10, L4, A100 o H100 son mas que suficientes. En GPUs integradas o Apple Silicon con memoria unificada tambien funciona, con rendimiento dependiente de la memoria disponible.
- Compatibilidad con GPU de consumo: si. Practicamente cualquier GPU de consumo de los ultimos cinco anos con 6 GB o mas de VRAM ejecuta comodamente las cuantizaciones Q4_K_M o superiores. Incluso GPUs de 4 GB pueden usar Q2_K o Q3_K.
- Opciones de despliegue: llama.cpp, Ollama (el tag "ollama" aparece en el repositorio), LM Studio, kobold.cpp y cualquier runtime compatible con GGUF. No se recomienda vLLM por su soporte limitado de GGUF, aunque es posible con versiones recientes.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo para una comparacion cuantitativa. A continuacion se comparan caracteristicas estructurales con alternativas de la misma categoria (modelos de codigo de ~2-4 B parametros):

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| LaboAI-0.3.3-3B (esta cuantizacion) | ~3,09 B | no disponible | apache-2.0 | GGUF (base en safetensors) | Codigo Android, Kotlin, Compose |
| Qwen2.5-Coder-3B | ~3,1 B | 32 K (128 K con YaRN) | apache-2.0 | safetensors, GGUF | Codigo general, multilingue |
| Llama-3.2-3B-Instruct | ~3,2 B | 128 K | Licencia comunitaria de Meta | safetensors, GGUF | Instrucciones generales, multilingue |
| CodeGemma-2B | ~2,5 B | 8 K | Licencia Gemma | safetensors, GGUF | Codigo general |

Nota: los datos de Qwen2.5-Coder-3B, Llama-3.2-3B-Instruct y CodeGemma-2B corresponden a informacion publica general de esos modelos y se incluyen solo como referencia; no se dispone de resultados de benchmark comparativos con LaboAI-0.3.3-3B en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo base tiene un enfoque muy especifico (codigo Android, Kotlin, Jetpack Compose), por lo que su rendimiento fuera de ese dominio puede ser inferior al de modelos de codigo generalistas del mismo tamano.
- Solo se declaran tres idiomas: ingles, castellano y codigo. El rendimiento en otros idiomas no esta garantizado y probablemente sea deficiente.
- Riesgo de alucinacion en APIs de Android o funciones de librerias: al ser un modelo de 3 B, puede inventar metodos o firmas inexistentes, especialmente en versiones recientes del SDK. Se recomienda validar el codigo generado (por ejemplo, compilando con el propio toolchain).
- No se han publicado resultados de benchmarks ni evaluaciones independientes, lo que dificulta estimar su calidad real frente a alternativas.
- La longitud de contexto no se especifica en la model card; conviene verificar el valor configurado en el tokenizer del modelo base antes de usarlo en conversaciones o contextos largos.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) degradan notablemente la coherencia del modelo; para uso en produccion se recomienda Q4_K_M o superior.
- La licencia Apache-2.0 permite uso comercial del artefacto GGUF y del modelo base, siempre que se respeten las condiciones de atribucion de dicha licencia. Conviene revisar tambien las licencias de los datasets de entrenamiento declarados por el autor del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de adopcion por la comunidad.
- El autor de la cuantizacion advierte que no hay cuantizaciones ponderadas (imatrix) disponibles; si el rendimiento con las cuantizaciones estaticas es insuficiente, habria que solicitarlas o generarlas.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/LaboAI-0.3.3-3B-GGUF
- Modelo base en HuggingFace: https://huggingface.co/LaboAI/LaboAI-0.3.3-3B
- Pagina de descargas de mradermacher para este modelo: https://hf.tst.eu/model#LaboAI-0.3.3-3B-GGUF
- Pagina de solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Dataset giggiovpg/ornith-android-instruct: https://huggingface.co/datasets/giggiovpg/ornith-android-instruct
- Dataset giggiovpg/android-kotlin-compose-compiler-verified: https://huggingface.co/datasets/giggiovpg/android-kotlin-compose-compiler-verified
- Dataset microsoft/NextCoderDataset: https://huggingface.co/datasets/microsoft/NextCoderDataset
- Dataset glaiveai/glaive-code-assistant-v3: https://huggingface.co/datasets/glaiveai/glaive-code-assistant-v3
