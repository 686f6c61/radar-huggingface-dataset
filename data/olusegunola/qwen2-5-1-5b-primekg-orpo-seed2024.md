# olusegunola/qwen2.5-1.5b-primekg-orpo-seed2024

## Resumen

`olusegunola/qwen2.5-1.5b-primekg-orpo-seed2024` es un modelo publicado en HuggingFace por el usuario `olusegunola`, cuyo identificador sugiere un ajuste fino del modelo base Qwen2.5 de 1.500 millones de parámetros mediante ORPO (Odds Ratio Preference Optimization) sobre el grafo de conocimiento biomédico PrimeKG, con semilla 2024. No obstante, el autor no ha aportado ninguna documentación propia: la model card es la plantilla automática de HuggingFace sin ningún campo completado, y el repositorio ocupa 0,0 GB, lo que indica que no contiene pesos descargables o que la subida quedó incompleta.

El interés potencial del modelo residiría en la adaptación de un transformer pequeño y eficiente al dominio biomédico mediante alineación por preferencias (ORPO), un área con pocos modelos abiertos de menos de 2.000 millones de parámetros especializados en farmacología y biomedicina. Sin embargo, en el momento de redactar esta ficha no existe evidencia verificable de que el entrenamiento se haya completado, de qué datos exactos se usaron ni de qué rendimiento obtiene.

Por tanto, esta ficha debe leerse como un registro de un artefacto sin validar. Todos los apartados técnicos se marcan como "no disponible" salvo aquellos que pueden inferirse directamente del nombre del repositorio, y en esos casos se indica explícitamente que se trata de una inferencia no confirmada por el autor. No se recomienda su uso en producción ni en entornos clínicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el identificador sugiere transformer decoder-only de la familia Qwen2.5; no confirmado por el autor) |
| Parametros totales | no disponible (el identificador sugiere ~1.500 millones; no confirmado) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos, por lo que no existen cuantizaciones derivadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio ocupa 0,0 GB; solo se declara la etiqueta `safetensors` en los tags, sin archivos verificables) |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura, el procedimiento de entrenamiento, el volumen de tokens, la composición del dataset ni los hiperparámetros. La model card es la plantilla genérica autogenerada por HuggingFace, con todos los campos marcados como `[More Information Needed]`.

Lo único que puede deducirse del identificador del repositorio es lo siguiente, siempre como inferencia no confirmada: (1) el punto de partida sería Qwen2.5 en su variante de 1.500 millones de parámetros, un transformer decoder-only con normalización RMSNorm, atención con sesgo de posición rotatorio (RoPE) y tokenizador BPE multilingüe; (2) el ajuste se habría realizado con ORPO, un método de alineación que combina en una sola fase el aprendizaje supervisado y la optimización por preferencias mediante una razón de probabilidades, eliminando la necesidad de una etapa separada de SFT seguida de RLHF o DPO; y (3) los datos de preferencia o de instrucciones provendrían presumiblemente de PrimeKG, un grafo de conocimiento biomédico que integra decenas de miles de relaciones entre enfermedades, fármacos, genes, proteínas y fenotipos. La etiqueta `arxiv:1910.09700` que aparece en los tags corresponde al artículo de Lacoste et al. sobre estimación de impacto ambiental, que la plantilla de HuggingFace cita por defecto, y no a un paper del modelo.

No se ha publicado ninguna innovación técnica adicional: ni decodificación especulativa, ni variantes de atención lineal, ni destilación, ni mezcla de expertos.

## Capacidades

No hay ninguna capacidad verificada por el autor. Las siguientes son expectativas derivadas del modelo base y del dominio sugerido por el identificador, y no deben tomarse como hechos comprobados:

- Generación de texto e instrucciones en varios idiomas, condicionada a las capacidades del Qwen2.5-1.5B original (no verificadas en este ajuste).
- Razonamiento básico de un solo paso y aritmética sencilla, propio de un modelo de 1.500 millones de parámetros.
- Generación de código limitada, muy inferior a la de modelos de mayor tamaño.
- Presunta especialización en dominio biomédico: terminología médica, relaciones fármaco-enfermedad, interacciones y conceptos de PrimeKG (no verificado).
- Soporte de tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidad multimodal (visión o audio): no disponible.
- Modo de razonamiento extendido (thinking): no disponible.

## Casos de uso

Ninguno de estos casos está validado con el modelo, ya que no hay pesos publicados. Se plantean como escenarios hipotéticos si el ajuste existiera y funcionara según lo sugerido por su nombre:

- Extracción de relaciones biomédicas: dado un fragmento de literatura científica, extraer tripletas del tipo (fármaco, interactúa con, gen) usando la terminología aprendida de PrimeKG; el tamaño reducido del modelo permitiría procesar grandes volúmenes de abstracts en una sola GPU.
- Preanotación de grafos de conocimiento: generar candidatos de aristas para completar un grafo biomédico interno, que después serían revisados por un experto humano; un modelo de 1.500 millones es suficientemente barato para ejecutarse en bucle sobre millones de pares de entidades.
- Asistente de consulta farmacológica de baja latencia: responder preguntas factuales sobre nombres de principios activos o clases terapéuticas en un entorno de consulta interna, siempre con revisión profesional y sin uso clínico directo.
- Clasificación y normalización de entidades médicas: mapear menciones libres de texto clínico a identificadores del grafo (UMLS, DrugBank) como paso previo a un pipeline de indexación documental.
- Filtrado y priorización de literatura: puntuar resúmenes de PubMed según su relevancia para una relación biomédica concreta y ordenar la cola de revisión de un equipo de investigación.
- Experimentación académica en alineación: servir como caso de estudio reproducible de ORPO sobre un modelo base pequeño y un corpus de dominio específico, con la semilla 2024 como referencia de comparación entre ejecuciones.
- Prototipado educativo: desplegar un asistente de estudio de farmacología en un portátil con GPU de gama media, dado el reducido coste de inferencia esperado para 1.500 millones de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye ninguna tabla de evaluación, ni resultados de MMLU, HumanEval, GSM8K, MedQA, PubMedQA ni de ninguna otra métrica. Tampoco hay comparaciones con el modelo base ni con alternativas del mismo tamaño.

## Requisitos de hardware

Estimaciones calculadas a partir del tamaño de parámetros sugerido por el identificador (1.500 millones), no de una medición real del repositorio, que está vacío:

- VRAM para inferencia en FP16/BF16: aproximadamente 3,0-3,5 GB de pesos, más caché KV variable según la longitud de contexto.
- VRAM para inferencia en INT8: aproximadamente 1,6-2,0 GB.
- VRAM para inferencia en INT4 (por ejemplo Q4_K_M en GGUF): aproximadamente 1,0-1,5 GB.
- GPU de servidor: cualquier A100, H100, L40S o A10G lo ejecutaría con holgura; sería un uso muy ineficiente de ese hardware salvo en despliegues de altísima concurrencia.
- GPU de consumo: cabe sin problemas en RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4070, RTX 4080, RTX 4090, e incluso en GPUs con 4-6 GB de VRAM si se cuantiza a 4 bits. También es viable en CPU para uso no interactivo.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, HuggingFace TGI y Transformers con `AutoModelForCausalLM`. Todas ellas requieren que existan pesos publicados, cosa que actualmente no se cumple.
- Latencia y throughput: no disponible. No se han publicado cifras y no se pueden medir sin pesos.

## Comparativa con modelos similares

La comparación se establece contra alternativas reales y disponibles de tamaño y dominio similares. Los datos de este modelo son no disponibles, por lo que las celdas correspondientes quedan vacías.

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| olusegunola/qwen2.5-1.5b-primekg-orpo-seed2024 | no disponible (~1,5B segun el identificador) | no disponible | biomedica (presunta) | no disponible | repositorio de 0,0 GB, sin pesos |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | generalista, multilingue | Apache 2.0 | publica, pesos completos |
| Llama-3.2-1B-Instruct | 1,24B | 128.000 tokens | generalista | Llama 3.2 Community License | publica, pesos completos |
| SmolLM2-1.7B-Instruct | 1,71B | 8.192 tokens | generalista, eficiente en dispositivo | Apache 2.0 | publica, pesos completos |
| BioMistral-7B | 7,24B | 8.192 tokens | biomedica, basada en Mistral | Apache 2.0 | publica, requiere mas VRAM |

El modelo objeto de esta ficha no puede compararse en rendimiento porque no hay pesos ni evaluaciones. Frente a las alternativas generalistas de ~1,5B, su única ventaja teórica sería la especialización biomédica; frente a BioMistral-7B, su ventaja sería el menor coste de inferencia, a costa de una capacidad muy inferior.

## Limitaciones y advertencias

- Repositorio sin pesos: el tamaño declarado es de 0,0 GB, por lo que es probable que el modelo no sea descargable ni ejecutable. Cualquier intento de uso fallará en la carga.
- Ausencia total de documentación: la model card es la plantilla automática, sin datos de entrenamiento, evaluación ni uso previsto.
- Licencia no especificada: sin licencia explícita no hay autorización clara de uso comercial, y la situación legal de los pesos es indeterminada. Además, al derivar presuntamente de Qwen2.5, habría que respetar la licencia del modelo base.
- Riesgo grave de alucinación en dominio sanitario: un modelo de 1.500 millones de parámetros ajustado sobre un grafo de conocimiento puede generar afirmaciones médicas plausibles pero falsas sobre dosis, interacciones o contraindicaciones.
- Sesgos desconocidos: no se ha documentado la composición del dataset ni se han realizado análisis de sesgo por subpoblación, idioma o área terapéutica.
- Cobertura de idiomas indeterminada: aunque el modelo base sea multilingüe, no se sabe en qué idiomas se entrenó la fase ORPO ni si el rendimiento en castellano se ha degradado.
- Cobertura temporal limitada: PrimeKG tiene un corte temporal concreto; el modelo no conocería fármacos ni hallazgos posteriores a ese corte.
- Sin validación clínica: no debe usarse como herramienta de diagnóstico, prescripción ni triaje, ni como sustituto del criterio de un profesional sanitario.
- Trazabilidad nula: no hay número de versión, hash de commit ni registro de experimentos, lo que impide reproducir o auditar el entrenamiento.
- Fecha de creación futura: el repositorio figura creado el 20 de septiembre de 2026, posterior a la fecha habitual de publicación de Qwen2.5, lo que refuerza la sospecha de un artefacto de prueba o de una subida incompleta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/olusegunola/qwen2.5-1.5b-primekg-orpo-seed2024
- Articulo citado en los tags (Lacoste et al., estimacion de impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de aprendizaje automatico referenciada en la plantilla: https://mlco2.github.io/impact
- Repositorio de PrimeKG (grafo de conocimiento biomedico mencionado en el identificador del modelo, referencia externa no citada por el autor): https://zitniklab.hms.harvard.edu/projects/PrimeKG/
- Informe tecnico de la familia Qwen2.5 (presunto modelo base, referencia externa): https://arxiv.org/abs/2409.12191
- Nota sobre la busqueda web: las consultas realizadas no devolvieron ningun resultado relacionado con este modelo. Los unicos enlaces recuperados correspondian a documentacion en frances sobre fases de direccion de obra en construccion, sin ninguna relacion con inteligencia artificial.
