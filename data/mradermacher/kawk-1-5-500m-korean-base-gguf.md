# mradermacher/KAWK-1.5-500M-Korean-Base-GGUF

## Resumen

KAWK-1.5-500M-Korean-Base es un modelo de lenguaje causal entrenado desde cero (from-scratch) para coreano, con arquitectura Llama y aproximadamente 505 millones de parametros. Fue desarrollado por el usuario Infinity08 y preentrenado sobre el dataset Infinity08/KAWK500M-Korean-Pretraining-10B, que contiene 10 mil millones de tokens de texto en coreano. Este repositorio concreto, publicado por mradermacher, contiene las versiones cuantizadas en formato GGUF del modelo base, lo que permite su ejecucion en CPU y en hardware modesto mediante herramientas como llama.cpp u Ollama.

La relevancia de este modelo radica en que es un modelo coreano entrenado desde cero, no un fine-tuning de un modelo multilingue, lo que lo hace interesante para investigacion sobre preentrenamiento en lenguas de baja representacion. Al ser un modelo base (no instructivo), su uso principal es como punto de partida para fine-tuning en tareas especificas en coreano. La cuantizacion GGUF ofrece multiples niveles de compresion (de Q2_K a f16) que permiten ajustar el equilibrio entre calidad y requisitos de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder, causal LM) |
| Parametros totales | 505.350.400 (~505M) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | coreano (ko) |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder de tipo Llama, disenada para modelado de lenguaje causal. Se trata de un modelo denso de aproximadamente 505 millones de parametros, entrenado desde cero (sin partir de pesos preexistentes) sobre el dataset Infinity08/KAWK500M-Korean-Pretraining-10B, compuesto por 10 mil millones de tokens de texto en coreano. No se ha publicado informacion sobre el uso de tecnicas de alineacion como RLHF o DPO, lo que es consistente con su naturaleza de modelo base.

La cuantizacion GGUF realizada por mradermacher es de tipo estatica (static quants), sin utilizar matrices de importancia (imatrix) segun indica la model card. Los ficheros estan disponibles en doce niveles de cuantizacion, desde Q2_K (0,3 GB) hasta f16 (1,1 GB), cubriendo un amplio espectro de compromiso entre calidad y tamano.

## Capacidades

- Generacion de texto en coreano: el modelo produce texto coherente en coreano al ser un modelo causal basico.
- Modelo base: no esta alineado para instrucciones ni chat; requiere fine-tuning para tareas especificas.
- Preentrenamiento desde cero: al no derivar de modelos multilingues, sus representaciones estan optimizadas exclusivamente para coreano.
- Sin soporte de tool calling ni function calling: al ser un modelo base de tamano reducido, no incluye estas capacidades.
- Sin modo de razonamiento explicito ni capacidades multimodales: se limita a texto.
- Monolingue: solo coreano; no se ha entrenado para otros idiomas.

## Casos de uso

- Fine-tuning para clasificacion de texto en coreano: el modelo puede ajustarse para tareas como analisis de sentimiento, clasificacion de topicos o deteccion de spam en coreano, aprovechando sus representaciones especificas del idioma.
- Fine-tuning para generacion de texto en dominios concretos: por ejemplo, generar descripciones de productos, resumenes de noticias o contenido creativo en coreano, partiendo de un modelo preentrenado en ese idioma.
- Investigacion academica sobre preentrenamiento en coreano: sirve como referencia para estudiar el impacto del tamano del dataset y la arquitectura en modelos entrenados desde cero para lenguas con recursos limitados.
- Prototipado de aplicaciones NLP en coreano en entornos sin GPU: gracias a las cuantizaciones GGUF, puede ejecutarse en CPU con herramientas como llama.cpp, lo que permite validar ideas rapidamente en entornos de desarrollo locales.
- Ensenanza y aprendizaje de arquitecturas transformer: su tamano reducido y su entrenamiento desde cero lo convierten en un candidato ideal para cursos o talleres sobre preentrenamiento de modelos de lenguaje.
- Base para distillation o experimentos de compresion: al ser un modelo pequeno y monolingue, puede utilizarse como modelo profesor o alumno en experimentos de destilacion de conocimiento en coreano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K u otras evaluaciones estandar para este modelo, ni comparaciones cuantitativas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en f16 ocupa aproximadamente 1,1 GB; las cuantizaciones Q4_K_M y Q4_K_S ocupan unos 0,4 GB, por lo que caben en cualquier GPU con 2 GB o mas de VRAM, e incluso en CPU sin GPU.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1060 6GB o superior, RTX 3060, etc.) es suficiente para las cuantizaciones mas pesadas. Para las versiones Q2_K y Q3_K, una GPU integrada o incluso solo CPU es viable.
- Compatibilidad con consumer GPU: si, todas las cuantizaciones caben en GPUs consumer de gama baja.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. No se recomienda vLLM ni TGI para este tamano, ya que estan orientados a modelos mayores y supondrian una sobrecarga innecesaria.
- Latencia y throughput estimados: no disponibles. Al ser un modelo de 505M parametros, la generacion en CPU con cuantizacion Q4_K_M suele ser de decenas de tokens por segundo en hardware moderno, pero no hay datos publicados especificos.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con modelos alternativos de tamano similar especializados en coreano. El unico modelo relacionado identificado es la version instructiva del mismo modelo base (Infinity08/KAWK-500M-Korean-Instruct-v1), que comparte arquitectura y dataset pero anade un ajuste para instrucciones. No hay datos publicados de rendimiento relativo.

## Limitaciones y advertencias

- Modelo base sin alineacion: no esta entrenado para seguir instrucciones ni para dialogar; generar prompts conversacionales producira resultados pobres.
- Monolingue: solo comprende coreano; cualquier entrada en otro idioma producira salidas degradadas o incoherentes.
- Tamano reducido: con 505M parametros, sus capacidades de razonamiento y conocimiento factual son limitadas en comparacion con modelos de miles de millones de parametros.
- Riesgo de alucinacion: como todos los modelos generativos, puede producir contenido falso o inventado, especialmente en temas de actualidad o muy especificos.
- Licencia no disponible: no se ha especificado la licencia del modelo, lo que genera incertidumbre legal sobre su uso comercial y su redistribucion. Es recomendable contactar con el autor antes de usarlo en produccion.
- Sin informacion sobre sesgos: no se ha publicado ningun analisis de sesgos de genero, raza o ideologicos presentes en el dataset de entrenamiento.
- Cuantizaciones de baja precision: las versiones Q2_K y Q3_K pueden degradar significativamente la calidad de generacion; se recomienda usar Q4_K_M o superior para tareas serias.
- Fecha de creacion futura: el repositorio indica fecha de creacion en 2026, lo que sugiere que puede tratarse de un proyecto experimental o con fechas erroneas en los metadatos.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/KAWK-1.5-500M-Korean-Base-GGUF
- Modelo base original: https://huggingface.co/Infinity08/KAWK-1.5-500M-Korean-Base
- Dataset de preentrenamiento: https://huggingface.co/datasets/Infinity08/KAWK500M-Korean-Pretraining-10B
- Version instructiva del modelo: https://huggingface.co/Infinity08/KAWK-500M-Korean-Instruct-v1
- Pagina de solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
