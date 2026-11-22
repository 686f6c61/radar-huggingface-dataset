# BigFamTLLM/da-cpt1-anneal

## Resumen

da-cpt1-anneal es un modelo de lenguaje de tipo base (no instruido) de 2.115.305.088 parámetros, desarrollado por BigFamTLLM en el marco del curso IN5640 de la Universidad de Oslo (otoño de 2026). Se trata de un ajuste del modelo danés da-cpt1, adaptado al noruego mediante el reemplazo del tokenizador, una fase de entrenamiento exclusivo de embeddings y un preentrenamiento continuado sobre texto noruego. Esta versión concreta incorpora una fase de annealing de 916 pasos adicionales sobre texto de alta calidad en bokmål y nynorsk, con decaimiento lineal de la tasa de aprendizaje hasta cero.

El modelo emplea la arquitectura Qwen3 (transformer denso con 36 capas, tamaño oculto de 2176, 34 cabezas de atención con 17 cabezas KV y embeddings atados) y una longitud de contexto de 4096 tokens. Ha visto 3.550 millones de tokens noruegos durante el entrenamiento, con una mezcla del 85 % bokmål y 15 % nynorsk, procedente del corpus HPLT 4.0. Es relevante como pieza de un estudio comparativo controlado de 50 modelos que evalúa el efecto del annealing y de la adaptación entre lenguas escandinavas con un presupuesto de cómputo fijo.

Al ser un modelo base sin ajuste por instrucciones, su utilidad principal es la investigación sobre adaptación lingüística y la experimentación con modelos pequeños especializados en noruego, no el despliegue en producción. Los resultados publicados en NorEval 1.1 muestran un rendimiento modesto pero medible en tareas de lengua y ortografía, con margen de mejora claro en lectura y conocimiento del mundo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Qwen3 (36 capas, hidden size 2176, 34 cabezas de atencion, 17 cabezas KV, embeddings atados) |
| Parametros totales | 2.115.305.088 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | danes (da), noruego (no), bokmal (nb), nynorsk (nn) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3 en configuracion densa: 36 capas, dimension oculta de 2176, 34 cabezas de atencion con 17 cabezas KV (GQA) y embeddings atados entre entrada y salida. El entrenamiento se realizo con Megatron-LM sobre 8 GPU NVIDIA GH200 en el cluster Olivia (Sigma2), con longitud de secuencia de 4096, tamano de lote de 128, optimizador AdamW y tasa de aprendizaje maxima de 5e-4 con 2000 pasos de calentamiento y sin decaimiento (1e-4 durante la fase exclusiva de embeddings).

La adaptacion desde el modelo danes da-base al noruego se estructuro en tres fases: sustitucion del tokenizador por uno noruego de 32k tokens (los tokens compartidos entre ambos vocabularios conservan su embedding y los nuevos se inicializan con la media de las piezas del tokenizador antiguo), 1000 pasos de entrenamiento exclusivo de embeddings y preentrenamiento continuado sobre noruego hasta el paso 4860 de 48600. Esta version concreta anade 916 pasos (0,48 mil millones de tokens) de annealing sobre texto de alta calidad en bokmal y nynorsk con decaimiento lineal de la tasa de aprendizaje hasta cero. Los datos provienen de HPLT 4.0 y la conversion a formato Hugging Face se hizo con Megatron-Bridge, ajustando las configuraciones para que el modelo cargue tambien en transformers 4.x.

## Capacidades

- Generacion de texto en noruego bokmal y nynorsk, ademas de danes, al ser un modelo base entrenado sobre esas lenguas.
- Continuacion de texto y modelado de lenguaje sin ajuste por instrucciones: no responde a formatos de chat ni a directivas sin un ajuste posterior.
- Capacidad limitada de razonamiento y conocimiento del mundo, reflejada en los resultados de NorEval en tareas de mundo (0,290 en nob_world y 0,291 en nno_world a 0-shot).
- Ortografia noruega relativamente solida (0,855 de exactitud en nob_orthography a 0-shot).
- Mayor rendimiento en tareas de lengua en nynorsk que en bokmal (0,382 frente a 0,229 en em_first a 0-shot).
- No dispone de soporte documentado de tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades de vision, audio ni modo de pensamiento (thinking mode).
- Robustez ante ruido medida: 0,361 en entrada limpia y -0,041 de media bajo ruido en tres tareas de NorEval.

## Casos de uso

- Investigacion sobre adaptacion entre lenguas escandinavas: el modelo sirve como punto de comparacion controlado frente a no-base, da-base y ml-base para medir el efecto de la transferencia desde el danes al noruego con el mismo presupuesto de computo.
- Estudio del efecto del annealing: al existir la version sin annealing (da-cpt1), permite aislar la contribucion de los 916 pasos finales sobre texto de alta calidad en bokmal y nynorsk.
- Generacion de texto noruego en tareas de continuacion: util para experimentos de modelado de lenguaje, perplexity y evaluacion intrinseca sobre corpus noruegos, aprovechando su contexto de 4096 tokens.
- Base para ajuste supervisado posterior: al ser un modelo base de 2,12B, puede servir de punto de partida para fine-tuning en tareas concretas de noruego (clasificacion, extraccion, resumen) cuando el presupuesto de computo es limitado.
- Evaluacion de tokenizadores noruegos: el proceso de sustitucion de vocabulario y la inicializacion de embeddings nuevos con la media de las piezas antiguas es replicable y el modelo permite analizar su impacto en tareas de ortografia y lengua.
- Docencia y experimentacion en cursos de PLN: su tamano (2,12B) y su contexto de 4096 tokens permiten ejecutarlo en entornos academicos con recursos moderados para practicas de evaluacion con NorEval.
- Analisis de robustez: las mediciones con entrada ruidosa permiten estudiar la degradacion del modelo en condiciones de texto imperfecto, relevante para corpus web.

## Benchmarks y rendimiento

Resultados publicados por el autor en NorEval 1.1:

| Grupo de tarea | Metrica | 0-shot | 1-shot |
|---|---|---|---|
| nob_language | em_first | 0,229 | 0,266 |
| nob_orthography | acc | 0,855 | 0,870 |
| nob_reading | f1 | 0,180 | 0,195 |
| nob_world | acc | 0,290 | 0,284 |
| nno_language | em_first | 0,382 | 0,461 |
| nno_world | acc | 0,291 | 0,289 |

Robustez (versiones con ruido de tres tareas de NorEval): 0,361 en entrada limpia y -0,041 de media bajo ruido.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 4,2 GB solo para los pesos (el repositorio ocupa 4,2 GB), mas memoria para el contexto y las activaciones; en la practica se recomienda al menos 8 GB.
- En cuantizacion de 8 bits, la huella de pesos se reduce a unos 2,1 GB; en 4 bits, a unos 1,1 GB, aunque el autor no documenta cuantizaciones oficiales.
- GPU recomendadas: el modelo se entreno en 8 GH200, pero para inferencia cabe en GPU de consumo como RTX 3090, RTX 4090 o RTX 4080 en bfloat16, y en GPU mas modestas con cuantizacion.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM en bfloat16 y en tarjetas con 4-6 GB con cuantizacion.
- Opciones de despliegue: transformers (soporte nativo, con ajustes de configuracion para transformers 4.x), text-generation-inference (etiqueta text-generation-inference y endpoints_compatible en el repositorio) y, previsiblemente, llama.cpp u Ollama si se generan pesos GGUF, aunque el autor no los publica.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Resultados NorEval |
|---|---|---|---|---|---|
| da-cpt1-anneal | 2,12B | 4.096 | da, no, nb, nn | no disponible | Ver tabla de benchmarks |
| da-cpt1 | 2,12B | 4.096 | da, no, nb, nn | no disponible | Version sin annealing; resultados no disponibles en esta ficha |
| no-base-anneal | no disponible | no disponible | no, nb, nn | no disponible | Modelo noruego desde cero del mismo proyecto; resultados no disponibles |
| da-base-anneal | no disponible | no disponible | da | no disponible | Modelo danes desde cero del mismo proyecto; resultados no disponibles |

La comparativa con modelos externos al proyecto (por ejemplo, modelos noruegos de tamano similar de otros autores) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue directivas, no mantiene formato de chat y puede generar continuaciones incoherentes o no deseadas.
- El propio autor advierte que son modelos de investigacion entrenados con texto web y que pueden producir salidas erroneas u ofensivas; no estan pensados para uso en produccion.
- Riesgo de alucinacion elevado en tareas de conocimiento del mundo, coherente con los resultados de NorEval (alrededor de 0,29 de exactitud en nob_world y nno_world).
- Rendimiento bajo en lectura (f1 de 0,180 en nob_reading a 0-shot) y en tareas de lengua en bokmal (0,229 a 0-shot), lo que limita su uso en comprension lectora y razonamiento linguistico fino.
- Degradacion bajo ruido: -0,041 de media en las tres tareas de robustez, lo que indica sensibilidad a texto imperfecto.
- Contexto limitado a 4096 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Cobertura linguistica restringida a danes y noruego (bokmal y nynorsk); no se documenta soporte de otras lenguas.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido, por lo que debe tratarse como restringido hasta verificacion.
- El modelo se entreno con solo 3,55 mil millones de tokens noruegos, un volumen muy inferior al de modelos de proposito general, lo que explica su rendimiento modesto.
- Proyecto academico de un curso universitario, sin garantias de mantenimiento ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BigFamTLLM/da-cpt1-anneal
- Modelo base: https://huggingface.co/BigFamTLLM/da-cpt1
- Modelo original danes: https://huggingface.co/BigFamTLLM/da-base
- Version sin annealing: https://huggingface.co/BigFamTLLM/da-cpt1
- Modelo noruego desde cero: https://huggingface.co/BigFamTLLM/no-base
- Version con annealing del noruego: https://huggingface.co/BigFamTLLM/no-base-anneal
- Modelo multilingue desde cero: https://huggingface.co/BigFamTLLM/ml-base
- Version con annealing del multilingue: https://huggingface.co/BigFamTLLM/ml-base-anneal
- Checkpoints intermedios de CPT: https://huggingface.co/BigFamTLLM/da-cpt2, https://huggingface.co/BigFamTLLM/da-cpt3, https://huggingface.co/BigFamTLLM/da-cpt4, https://huggingface.co/BigFamTLLM/da-cpt5, https://huggingface.co/BigFamTLLM/da-cpt6, https://huggingface.co/BigFamTLLM/da-cpt7, https://huggingface.co/BigFamTLLM/da-cpt8, https://huggingface.co/BigFamTLLM/da-cpt9, https://huggingface.co/BigFamTLLM/da-cpt10
- Corpus HPLT 4.0: no disponible en la informacion proporcionada
- Paper de NorEval: no disponible en la informacion proporcionada
- Repositorio Megatron-LM: no disponible en la informacion proporcionada
- Repositorio Megatron-Bridge: no disponible en la informacion proporcionada
