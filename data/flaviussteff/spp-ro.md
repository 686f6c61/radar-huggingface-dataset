# flaviussteff/spp-ro

## Resumen

spp-ro es un modelo de lenguaje causal monolingüe en rumano desarrollado por Flavius-Ștefan Hăbeanu como parte de su tesis de licenciatura en la Facultad de Matemáticas y Ciencias de la Computación de la Universidad de Bucarest (2026). Se trata de una replicación desde cero, con presupuesto de cómputo equiparable, del trabajo *Synthetic Persona Pretraining* de Minder et al. (EPFL-dlab, arXiv:2608.13482), aplicada al rumano y comparando tres estrategias de preentrenamiento (Vanilla, Filtered y SPP) sobre exactamente el mismo flujo de documentos.

El modelo implementa la variante SPP{T0}: el 10 % de los documentos de entrenamiento llevan insertada una reflexión constitucional en línea, generada por un LLM y fundamentada en una constitución de valores rumanos de seis artículos. La innovación clave es que la continuación del documento no puede atender a esa reflexión (máscara de atención asimétrica) y sus posiciones RoPE se reasignan al punto de inserción, de modo que el documento se modela igual que en el modelo Vanilla. Prefijar un prompt con el token especial `<assistant>` activa la persona reflexiva en inferencia.

Con 88,1 millones de parámetros, 1.024 tokens de contexto y licencia MIT, es un modelo de investigación a pequeña escala, no un sistema listo para producción. Su relevancia es metodológica: demuestra que la técnica SPP no introduce coste medible en perplejidad, mientras que el filtrado de datos de seguridad degrada el conocimiento precisamente en los documentos marcados por el clasificador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama, 12 capas, GQA (12 cabezas de consulta / 4 de clave-valor), SwiGLU, embeddings atados |
| Parametros totales | 88.099.584 (~88,1 M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens (RoPE theta 10.000) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | Rumano (ro) |
| Licencia | MIT |
| Formato de pesos | safetensors |

Dimensiones internas: hidden 768, intermediate 2.048, vocabulario de 16.384 tokens (BPE byte-level para rumano) con token especial `<assistant>`.

## Arquitectura y entrenamiento

La arquitectura es un transformer causal denso de estilo Llama con 12 capas, dimensión oculta de 768, capa intermedia SwiGLU de 2.048 y atención con 12 cabezas de consulta frente a 4 de clave-valor (GQA). Los embeddings de entrada y salida están atados. El contexto máximo es de 1.024 posiciones con RoPE de theta 10.000.

El entrenamiento se realizó desde cero sobre 1,5 millones de documentos rumanos (FineWeb-2 RO, Wikipedia RO y prensa), leídos en un orden fijado por semilla idéntico para todos los modelos de la familia. 150.000 documentos (10 %) incluyen una reflexión en un fichero lateral: los 75.000 mejor puntuados por un clasificador de seguridad más 75.000 benignos; las reflexiones promedian 36 tokens (~0,67 % de los tokens entrenados). El calendario consta de 50.000 pasos con LR pico 1,5e-4, 500 pasos de calentamiento, decaimiento coseno hasta 0, weight decay 0,1 y 64 ventanas empaquetadas de 1.024 posiciones por paso (documentos terminados en EOS empaquetados first-fit, atención en bloque diagonal, posiciones por documento, 2,4 % de relleno). En total, unos 3.280 millones de tokens en aproximadamente 66 horas, con autocast bf16 y pesos maestros en fp32, sobre una única NVIDIA RTX 3060 de 12 GB.

La innovación técnica es el modo de documento SPP (`c1 ... ck <assistant> r1 ... rn ck+1 ...`): la reflexión se inserta en un límite de frase, la continuación no puede atenderla mediante máscara asimétrica y sus posiciones RoPE se alias al punto de inserción. El token `<assistant>` no contribuye a la pérdida.

## Capacidades

- Generación de texto en rumano: continuación de documentos y prompts cortos dentro de una ventana de 1.024 tokens.
- Modelado de lenguaje causal puro: el modelo es de preentrenamiento, sin ajuste por instrucciones ni post-entrenamiento.
- Modo reflexivo activable: prefijar el prompt con `<assistant>` activa la persona constitucional aprendida durante el preentrenamiento.
- Razonamiento de opción múltiple limitado: rinde por encima del azar en la tarea de cloze de 4 opciones (89,1 %), pero no resuelve evaluaciones constitucionales complejas.
- No soporta tool calling ni function calling (no documentado y esperable por tamaño y falta de post-entrenamiento).
- No soporta uso agéntico ni razonamiento multi-paso de forma fiable.
- Multilingüismo: únicamente rumano.
- No dispone de visión, audio ni modo de pensamiento extendido.

## Casos de uso

- Investigación sobre alineación en preentrenamiento: sirve como réplica controlada y reproducible (mismo flujo documental, misma semilla) para estudiar el efecto de SPP frente a Vanilla y Filtered en un idioma de recursos medios como el rumano.
- Estudio del coste de alineación (alignment tax): permite medir empíricamente cómo el filtrado de datos de seguridad degrada la perplejidad en los documentos marcados, con resultados publicados en `evals/` del repositorio.
- Experimentos de destilación o inicialización: al ser un modelo pequeño con licencia MIT, puede usarse como punto de partida o como estudiante en experimentos de destilación hacia modelos rumanos mayores.
- Evaluación de tokenizadores rumanos: su vocabulario BPE byte-level de 16.384 tokens y su token especial `<assistant>` lo hacen útil para comparar eficiencia de tokenización en rumano.
- Docencia y reproducción académica: el entrenamiento completo cabe en una RTX 3060 de 12 GB en unas 66 horas, lo que permite reproducir el pipeline en un laboratorio docente.
- Pruebas de infraestructura de inferencia: su tamaño reducido permite validar pipelines de transformers, servidores de inferencia o flujos de evaluación sin coste de GPU significativo.
- Generación de texto rumano a pequeña escala: prototipos de continuación de texto y demostraciones de prompting reflexivo, siempre fuera de producción.

## Benchmarks y rendimiento

| Metrica | Valor | Referencia (spp-ro-base) |
|---|---|---|
| Perplejidad, web retenida (1.000 docs) | 18,32 | -0,10 |
| Perplejidad, docs marcados por el clasificador de seguridad (199 docs) | 25,99 | -0,17 |
| Perplejidad, docs no marcados (1.000 docs) | 17,73 | No disponible |
| Precisión cloze de 4 opciones (1.000 ítems) | 89,1 % | No disponible |
| ConstitutionEval-Ro, letra, 4 rotaciones sin sesgo (azar 25 %), 600 ítems | 24,3 % | No disponible |
| ConstitutionEval-Ro, PMI (azar 25 %), 600 ítems | 33,5 % | No disponible |
| ConstitutionEval-Ro, continuación (azar 25 %), 600 ítems | 20,2 % | No disponible |
| ConstitutionEval-Ro, oro frente a cada distractor (azar 50 %), 600 ítems | 45,2 % | No disponible |
| ConstitutionEval-Ro, letra, deliberativo (prefijo `<assistant>`) | 23,0 % | No disponible |

Los cinco modelos de la familia están a nivel de azar en ConstitutionEval-Ro: con 88 M de parámetros el modelo no resuelve el benchmark, por lo que no puede mostrar un efecto de alineación a esta escala. El resultado medible es el coste de alineación: SPP no cuesta perplejidad, mientras que la línea base Filtered pierde conocimiento exactamente en los documentos marcados (+1,13 de perplejidad, peor en el 85 % de ellos, test de signos emparejado p ≈ 1e-24).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en fp32 ocupa unos 0,35 GB; en bf16/fp16, unos 0,18 GB. Con overhead de activaciones y caché KV (12 capas, 4 cabezas KV, contexto 1.024) el consumo total se mantiene por debajo de 1 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el autor entrenó con una RTX 3060 de 12 GB.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, GTX 1660, e incluso en CPU para inferencia interactiva.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (documentado por el autor); al ser safetensors de arquitectura Llama, es compatible con vLLM, TGI, llama.cpp y Ollama previa conversión a GGUF, aunque el autor no documenta estos flujos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| spp-ro | 88,1 M | 1.024 | Rumano | MIT | Preentrenamiento SPP desde cero, sin post-entrenamiento |
| spp-ro-base | 88,1 M | 1.024 | Rumano | MIT (presumible, misma familia) | Referencia Vanilla de la misma familia; perplejidad web 18,42 |
| Modelos Filtered de la familia SPP-Ro | 88,1 M | 1.024 | Rumano | No disponible | Línea base con filtrado de seguridad; +1,13 de perplejidad en documentos marcados |

No se dispone de datos publicados para comparar con modelos rumanos de tamaño similar de otros autores (por ejemplo, variantes pequeñas de Llama o GPT entrenadas en rumano); esa comparación no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Tamaño muy reducido (88 M de parámetros): capacidad de razonamiento y conocimiento factual limitados; no resuelve benchmarks de alineación ni de conocimiento complejo.
- Monolingüe en rumano: no genera ni comprende otros idiomas de forma fiable.
- Solo preentrenamiento: no hay ajuste por instrucciones, RLHF ni DPO; no sigue instrucciones de forma consistente.
- Semilla única: los resultados no incluyen intervalos de confianza por variabilidad de semilla, lo que limita la generalización estadística de las conclusiones.
- Sesgos de los datos: entrenado sobre texto web (FineWeb-2 RO, Wikipedia, prensa), reproduce los sesgos presentes en esas fuentes.
- Riesgo de alucinación: alto en generación libre, como es esperable en un modelo de este tamaño sin post-entrenamiento.
- Ventana de contexto corta (1.024 tokens): inadecuado para documentos largos o conversaciones multi-turno extensas.
- Licencia MIT: permite uso comercial, pero el autor declara explícitamente que el modelo no está pensado para producción.
- El modo reflexivo depende de un token especial (`<assistant>`) y de un formato concreto; su comportamiento fuera de ese formato no está garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/flaviussteff/spp-ro
- Modelo de referencia (Vanilla): https://huggingface.co/flaviussteff/spp-ro-base
- Repositorio GitHub del proyecto: https://github.com/flaviussteff/spp-ro
- Paper de referencia (Minder et al., EPFL-dlab, 2026): arXiv:2608.13482
- Evaluaciones y tablas LaTeX: carpeta `evals/` del repositorio GitHub
