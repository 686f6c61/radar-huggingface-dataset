# bcckfdn/cevher-test-8-GGUF

## Resumen

cevher-406m-v15 es un modelo de lenguaje de ~407 millones de parametros entrenado desde cero por el usuario bcckfdn siguiendo la arquitectura de SmolLM2 (familia Llama). Se distribuye unicamente en formato GGUF, cuantizado en cuatro variantes (BF16, Q8_0, Q5_K_M y Q4_K_M), lo que lo orienta a inferencia local en CPU y GPU de gama baja mediante llama.cpp, Ollama o LM Studio. Esta pensado para generacion de texto conversacional en turco e ingles.

El modelo base (bcckfdn/cevher-test-8) fue entrenado con aproximadamente 20.363 B tokens, con una dimension oculta de 1024 y 34 capas, lo que encaja con el perfil de un modelo "small language model" (SLM) de la familia SmolLM2. Su relevancia practica radica en el tamano reducido: con menos de 500 MB en Q4_K_M, es desplegable en hardware muy modesto, algo util para prototipos, experimentos de ajuste fino y entornos con recursos limitados.

Se trata de un artefacto de publicacion muy reciente y sin traccion (cero descargas y cero likes en el momento de la consulta), sin model card detallada mas alla de la tabla de ficheros y los comandos de uso. No se han publicado datos de evaluacion ni documentacion sobre el dataset de entrenamiento o el proceso de alineamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo SmolLM2 (familia Llama) |
| Parametros totales | 406.918.144 (~407 M) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Dimension oculta | 1024 |
| Numero de capas | 34 |
| Tokens de entrenamiento | 20.363 B (segun model card) |
| Modelo base | bcckfdn/cevher-test-8 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de SmolLM2, un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU y atencion causal estandar, dentro de la estirpe de disenos derivados de Llama. Cuenta con 406.918.144 parametros, 34 capas y una dimension oculta de 1024. Al tratarse de una version GGUF, la informacion sobre la configuracion completa (numero de cabezas de atencion, atencion agrupada por consultas, funcion de activacion concreta) no esta detallada en la model card.

Segun los datos aportados, el entrenamiento se realizo desde cero sobre 20.363 B tokens. No se especifica la composicion del dataset, el reparto entre turco e ingles, ni si hubo fases de instruccion, RLHF, DPO u otro tipo de alineamiento. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, atencion por ventanas deslizantes, etc.). El unico pipeline declarado es text-generation, con etiqueta conversational.

## Capacidades

- Generacion de texto autoregresiva en turco e ingles.
- Uso conversacional basico (etiqueta "conversational"), adecuado para dialogos simples de un solo turno o de pocos turnos.
- Inferencia local en CPU mediante llama.cpp, Ollama o LM Studio gracias al formato GGUF.
- Disponibilidad en varias cuantizaciones que permiten ajustar el compromiso entre calidad y huella de memoria.
- Soporte de tool calling / function calling: no disponible (no declarado en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible (no declarado).
- Capacidades de vision, audio o modo "thinking": no disponible (modelo exclusivamente de texto).
- Capacidades multilingues: limitadas a turco e ingles segun los metadatos.

## Casos de uso

- Prototipado y pruebas de concepto de aplicaciones conversacionales: el modelo puede generar respuestas de texto en turco e ingles con una huella de disco inferior a 1 GB, lo que permite iterar rapidamente sin depender de APIs externas.
- Inferencia en el borde y dispositivos con recursos limitados: con 245 MB en Q4_K_M se puede ejecutar en portatiles, mini-PC o incluso dispositivos con CPU moderna, sin GPU dedicada.
- Ajuste fino experimental: al ser un modelo pequeno con licencia Apache 2.0, es un candidato razonable para LoRA/QLoRA sobre corpus turcos especificos antes de escalar a modelos mayores.
- Generacion de texto en turco para tareas de bajo riesgo: continuacion de frases, resumenes cortos o reescritura de textos de dominio general donde no se exija alta precision.
- Simulacion de personajes o bots de chat simples: el pipeline conversacional y su tamano permiten desplegar multiples instancias en un mismo servidor para experimentar con personalidades o flujos.
- Educacion y demostraciones didacticas: sirve para explicar en clase como funciona un LLM, el efecto de las cuantizaciones y el pipeline GGUF sin necesidad de infraestructura costosa.
- Preprocesado o generacion de borradores en pipelines de datos: util como generador barato para crear texto sintetico que luego filtre un modelo mayor.
- Benchmarking interno de herramientas: permite probar integraciones con llama.cpp, Ollama o LM Studio antes de mover cargas a modelos mas grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay datos de MMLU, HumanEval, GSM8K, HellaSwag, ARC ni de ninguna otra evaluacion estandar, ni del modelo en BF16 ni de las variantes cuantizadas.

## Requisitos de hardware

- VRAM / memoria estimada para inferencia segun el fichero publicado:
  - BF16 (`cevher-406m-v15-BF16.gguf`): 778 MB en disco, en torno a 1-1,2 GB de RAM/VRAM al cargar.
  - Q8_0 (`cevher-406m-v15-Q8_0.gguf`): 414 MB en disco, aproximadamente 0,6-0,8 GB en memoria.
  - Q5_K_M (`cevher-406m-v15-Q5_K_M.gguf`): 281 MB en disco, aproximadamente 0,4-0,6 GB en memoria.
  - Q4_K_M (`cevher-406m-v15-Q4_K_M.gguf`): 245 MB en disco, aproximadamente 0,4-0,5 GB en memoria.
- GPU recomendadas: cualquiera con al menos 2 GB de VRAM es suficiente. Funciona con GTX 1050/1650, RTX 3050, RTX 4060, RTX 4090, A100 o H100, aunque el hardware de gama alta estara enormemente sobredimensionado.
- Cabe en GPU de consumo: si, con margen amplio, en practicamente cualquier GPU dedicada de los ultimos diez anos e incluso en GPU integradas modernas.
- Ejecucion en CPU: totalmente viable; el modelo esta disenado para ello.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama (mediante Modelfile), LM Studio (colocando los ficheros en el directorio de modelos). vLLM y TGI no estan documentados para este artefacto.
- Latencia y throughput: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Idiomas |
|---|---|---|---|---|---|
| cevher-406m-v15 (este) | 406.918.144 | no disponible | Apache 2.0 | GGUF | tr, en |
| SmolLM2-360M (HuggingFaceTB) | ~362 M | 8.192 tokens | Apache 2.0 | safetensors, GGUF | en (principalmente) |
| Qwen2.5-0.5B | ~494 M | 32.768 tokens | Apache 2.0 | safetensors, GGUF | multilingue (incluye en, zh y otros) |
| TinyLlama-1.1B | ~1.100 M | 2.048 tokens | Apache 2.0 | safetensors, GGUF | en |

Nota: la comparativa se limita a parametros, contexto, licencia y disponibilidad, ya que no hay resultados de benchmarks publicados para cevher-406m-v15. Los datos de contexto de los modelos alternativos corresponden a sus fichas oficiales y se incluyen como referencia orientativa; no se ha verificado un rendimiento comparado.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks publicados, por lo que el rendimiento real en tareas concretas es desconocido.
- Modelo entrenado por un autor individual y publicado sin traccion (cero descargas y cero likes en el momento de la consulta); la calidad del dataset y del proceso de entrenamiento no esta documentada ni auditada.
- Longitud de contexto no declarada: no se puede planificar su uso en tareas que requieran ventanas largas sin verificacion previa.
- Idiomas limitados a turco e ingles; el comportamiento en castellano o en otros idiomas no esta soportado ni documentado.
- Cobertura tematica del turco desconocida: al no detallarse la composicion del dataset, no se puede asegurar su calidad en dominios especializados (legal, medico, cientifico).
- Riesgo de alucinacion alto: por tamano (~407 M) y por falta de alineamiento documentado, es probable que genere contenido incorrecto con aparente fluidez.
- Etiqueta "conversational" pero sin model card de instrucciones: no se especifica plantilla de chat ni tokens especiales; el comportamiento conversacional puede ser irregular.
- No se declara soporte de tool calling ni de razonamiento multi-paso; no deberia integrarse en agentes sin validacion previa.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero no exime de responsabilidad sobre sesgos, alucinaciones o incumplimiento normativo en produccion.
- Cuantizaciones agresivas (Q4_K_M, Q5_K_M) pueden degradar aun mas la calidad de un modelo ya pequeno; para tareas exigentes conviene partir de BF16 o Q8_0.
- No hay informacion sobre sesgos, filtros de seguridad, ni instrucciones sobre como evitar contenido danino.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/bcckfdn/cevher-test-8-GGUF
- Modelo base: https://huggingface.co/bcckfdn/cevher-test-8
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
- SmolLM2 (familia de arquitectura de referencia): https://huggingface.co/HuggingFaceTB/SmolLM2-360M
