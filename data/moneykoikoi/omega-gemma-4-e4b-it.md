# moneykoikoi/omega-gemma-4-E4B-it

## Resumen

Omega Gemma 4 E4B IT es una cuantizacion GGUF del modelo `google/gemma-4-E4B-it` de Google, publicada por el usuario moneykoikoi en Hugging Face. El autor la presenta como una version "mejorada" del modelo base mediante una tecnica propia denominada "Hermetic GeGLU Airlock" (compartimentos ortogonales alineados a superbloques de cuantizacion de tipo QK_K = 256) y una supuesta "fusion de engramas de razonamiento y vocabulario de clase 100B". El modelo declara 7.547.560.490 parametros totales en formato safetensors, aunque el autor lo describe como un modelo de "clase 4B" con arquitectura de 42 capas.

La relevancia de esta ficha es limitada y debe abordarse con cautela: no existe evidencia independiente que respalde las afirmaciones de rendimiento del autor, y las cifras de benchmarks publicadas proceden exclusivamente de su propia model card. El modelo se distribuye bajo licencia Apache 2.0, en formato GGUF, con soporte declarado para japones e ingles, y esta orientado a generacion de texto, razonamiento, matematicas y codigo.

El paquete se completa con "Aria FSMCoT Compact", un proxy en Python que el autor describe como "Thinking OS" y que no forma parte de los pesos del modelo, sino que actua como capa de enrutamiento y postprocesado de las respuestas. Cualquier evaluacion del rendimiento real debe separar lo que aporta el modelo de lo que aporta ese proxy externo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de google/gemma-4-E4B-it (42 capas segun el autor); modificaciones propietarias "Hermetic GeGLU Airlock" no verificadas |
| Parametros totales | 7.547.560.490 (dato safetensors); el autor lo describe como "clase 4B" |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (flags de ejemplo del autor con `-c 32768`) |
| Tipos de cuantizacion | GGUF Q4_K_M (unica publicada) |
| Idiomas soportados | japones (ja) e ingles (en) segun la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-E4B-it`, un transformer decoder-only de la familia Gemma 4. El autor afirma haber aplicado una tecnica denominada "Hermetic GeGLU Airlock v10", descrita como la insercion de compartimentos ortogonales GeGLU alineados con los superbloques de cuantizacion (QK_K = 256) en las capas de atencion global, con el objetivo declarado de preservar la fluidez general y la calidad bilingue sin "crosstalk" medible. No se aportan detalles sobre el proceso de entrenamiento, el volumen de tokens, la composicion del dataset ni el uso de RLHF o DPO. Tampoco se documenta que se entiende por "fusion de engramas de vocabulario y razonamiento de clase 100B", mas alla de la afirmacion publicitaria.

El autor menciona compatibilidad con "MTP-TRM" (Multi-Token Prediction x Tiny Recursive Model) para decodificacion especulativa en `llama-server`, pero no se proporcionan pesos, configuracion ni evidencia de que esa decodificacion especulativa este efectivamente integrada. La mayor parte de la mejora de rendimiento declarada se atribuye, segun la propia model card, al proxy externo Aria FSMCoT Compact: un unico fichero Python sin dependencias que enruta cada consulta a modos CALC (sandbox de Python restringido), CODE (reparacion de AST y de bloques de codigo sin cerrar), FORMAT (bucle critico determinista para JSON) o DIRECT (paso directo). Es decir, buena parte de los resultados de benchmarks no proviene de los pesos del modelo, sino de un orquestador externo.

## Capacidades

- Generacion de texto conversacional en ingles y japones.
- Razonamiento matematico de nivel escolar y de competicion (segun el autor, con el proxy FSMCoT activado).
- Generacion de codigo Python, con soporte declarado de reparacion sintactica via el proxy.
- Tool calling / function calling: la model card reporta 2/2 en la tarea `tool_use` del conjunto gBench del autor.
- Salida JSON estructurada con validacion determinista (a traves del modo FORMAT del proxy).
- Capacidad de "thinking" en varios pasos mediante el enrutamiento FSMCoT externo, no como modo nativo del modelo.
- No se declara soporte de vision, audio ni otras modalidades.

## Casos de uso

- Asistencia matematica en local: con el proxy FSMCoT en modo CALC, el modelo puede resolver problemas aritmeticos y algebraicos delegando el calculo en un sandbox de Python restringido, lo que reduce errores de calculo tipicos de modelos pequenos.
- Generacion de codigo en entornos con recursos limitados: al ser un GGUF Q4_K_M de aproximadamente 5,1 GB, puede ejecutarse en una GPU de consumo y utilizarse para autocompletado o generacion de funciones Python en un IDE o pipeline de CI/CD, con reparacion sintactica posterior.
- Prototipado de agentes con tool calling: el modelo declara soporte de function calling, lo que permite integrarlo en frameworks de agentes que necesiten invocar APIs externas en flujos de varios pasos.
- Procesamiento de texto en japones e ingles: util para tareas bilingues de resumen, traduccion asistida o clasificacion en entornos donde no se puede enviar datos a la nube.
- Generacion de JSON estructurado para integracion con sistemas: el modo FORMAT del proxy permite obtener respuestas validas contra un esquema, util para extraccion de datos o rellenado de formularios.
- Evaluacion e investigacion de tecnicas de cuantizacion: el modelo sirve como caso de estudio de tecnicas de cuantizacion GGUF y de orquestacion externa de razonamiento, aunque sus afirmaciones deben validarse de forma independiente.
- Despliegue en local con `llama-server`: permite servir una API compatible con OpenAI en hardware modesto, con contexto de hasta 32.768 tokens y cuatro slots paralelos segun los flags recomendados por el autor.

## Benchmarks y rendimiento

Los siguientes datos proceden exclusivamente de la model card del autor y no han sido verificados de forma independiente. Las cifras de la columna "con Thinking OS" incluyen el efecto del proxy externo, no solo del modelo.

| Benchmark | Base 4B (segun autor) | airlock-v10 | airlock-v10 + FSMCoT |
|---|---|---|---|
| GSM8K | 62,6% (219/350) | 86,0% (172/200) | 94,00% (282/300) |
| Hendrycks MATH | no disponible | 54,62% (130/238) | 70,00% (210/300) |
| HumanEval (164 tareas) | 86,6% (142/164) | 74,39% bruto / 82,32% reparado | 87,80% (144/164); 90,85% efectivo v3.1 |
| MBPP | no disponible | no disponible | 72,48% (316/436); 75,69% efectivo v3.1 |
| JCommonsenseQA | 95,1% (333/350) | 91,0% (182/200) | paso directo |
| MMLU | no disponible | 61,5% (123/200) | paso directo |
| GPQA Diamond | no disponible | 22,73% (45/198) | paso directo |
| ARC-AGI | 1,2% (4/336) | no disponible | no disponible |
| Global (1.200 preguntas) | 58,2% (698/1.200) | 65,58% (787/1.200) | 79,33% (952/1.200); 80,92% v3.1 |

Advertencias sobre la metodologia: las asignaciones de preguntas por suite difieren entre generaciones, el propio autor reconoce que las cifras "efectivas" de v3.1 se obtienen re-evaluando fallos de sintaxis tras anadir guardas de salida, y no se publican scripts de evaluacion ni artefactos reproducibles. No se han encontrado resultados de terceros que contrasten estas cifras.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4,5-5,5 GB para el GGUF Q4_K_M, mas overhead de contexto KV cache. Con contexto de 32.768 tokens y cache cuantizada en q8_0, el consumo adicional puede situarse en varios GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para el modelo completo en GPU; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, A100 y H100 son suficientes con holgura.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas; con 6 GB puede requerir offload parcial a CPU.
- Opciones de despliegue: `llama-server` (recomendado por el autor), llama.cpp, Ollama (previa importacion del GGUF), y cualquier runtime compatible con GGUF. El proxy FSMCoT requiere Python 3.10+ y se ejecuta en CPU.
- Latencia y throughput: no disponibles de forma independiente. El autor reporta tiempos de pared de 41,0 a 120,4 minutos para 1.200 preguntas en hardware local no especificado, lo que no permite derivar tokens por segundo fiables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Omega Gemma 4 E4B IT (este) | 7,55B declarados | 32.768 | Apache 2.0 | GGUF Q4_K_M | Modificaciones propietarias no verificadas; benchmarks solo del autor |
| google/gemma-4-E4B-it | no disponible en la informacion | no disponible | Gemma license (segun modelo base) | safetensors | Modelo base oficial; referencia para validar las afirmaciones |
| Gemma 3 4B IT | aproximadamente 4B | 128K (segun familia Gemma 3) | Gemma license | safetensors, GGUF | Alternativa de la generacion anterior; comparacion no disponible en la informacion proporcionada |
| Qwen2.5 3B / 7B Instruct | 3B / 7B | 32K (familia Qwen2.5) | Apache 2.0 | safetensors, GGUF | Alternativa Apache 2.0 con amplio ecosistema GGUF; sin datos comparativos verificados en esta ficha |

No se dispone de comparaciones independientes entre este modelo y las alternativas citadas. Las diferencias de licencia entre el modelo base (Gemma license) y esta cuantizacion (Apache 2.0) deben verificarse con atencion, ya que el autor relicencia el derivado sin aclarar la base legal.

## Limitaciones y advertencias

- Las afirmaciones de rendimiento proceden unicamente del autor y no han sido replicadas por terceros; los numeros de benchmarks deben tratarse como no verificados.
- Gran parte de la mejora declarada se debe al proxy externo Aria FSMCoT, no a los pesos del modelo; comparar cifras "con Thinking OS" frente a baselines sin proxy no es una comparacion justa.
- El modelo base es `google/gemma-4-E4B-it`, distribuido bajo la licencia Gemma de Google; relicenciar el derivado como Apache 2.0 puede entrar en conflicto con los terminos del modelo base. Conviene revisar la licencia original antes de uso comercial.
- No se documenta el proceso de entrenamiento ni la procedencia de los datos; no es posible evaluar sesgos de forma rigurosa.
- Riesgo de alucinacion inherente a un modelo de clase 4B, especialmente en conocimiento general (MMLU 61,5% segun el autor) y ciencia de nivel avanzado (GPQA Diamond 22,73%).
- Soporte limitado a japones e ingles; el rendimiento en castellano no esta documentado.
- El contexto maximo practico depende del hardware; con cuantizacion KV en q8_0 y 32K tokens el consumo de VRAM crece de forma notable.
- El proxy FSMCoT ejecuta codigo Python en un sandbox declarado como restringido; en produccion debe auditarse antes de confiar en el aislamiento.
- El numero de descargas (367) y la ausencia de "likes" sugieren una adopcion muy baja y ninguna validacion comunitaria.
- La terminologia de la model card ("engramas de 100B", "zero crosstalk") no tiene respaldo tecnico publicado y debe interpretarse como marketing.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moneykoikoi/omega-gemma-4-E4B-it
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio de llama.cpp (runtime recomendado): https://github.com/ggml-org/llama.cpp
- No se han encontrado en la informacion disponible papers, blogs, repositorios del proxy Aria FSMCoT ni demos adicionales.
