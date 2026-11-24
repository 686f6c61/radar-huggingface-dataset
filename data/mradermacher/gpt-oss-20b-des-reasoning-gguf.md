# mradermacher/gpt-oss-20b-DES-Reasoning-GGUF

## Resumen

`mradermacher/gpt-oss-20b-DES-Reasoning-GGUF` es una coleccion de cuantizaciones GGUF del modelo `sequelbox/gpt-oss-20b-DES-Reasoning`, un ajuste fino del modelo abierto `gpt-oss-20b` de OpenAI orientado especificamente a razonamiento sobre simulacion de eventos discretos (DES, *discrete-event simulation*). El modelo base `gpt-oss-20b` es un transformer denso de aproximadamente 20.900 millones de parametros publicado por OpenAI bajo licencia Apache 2.0, y este derivado ha sido entrenado por el usuario `sequelbox` sobre el dataset `sequelbox/DES-Reasoning-DeepSeek-V3.1` para especializarlo en tareas de simulacion, analisis de causa raiz, logica y scripting en Python (especialmente con la libreria SimPy).

El trabajo de cuantizacion lo firma `mradermacher`, un conocido publicador de versiones GGUF de modelos abiertos, que ofrece aqui un abanico de 11 cuantizaciones estaticas (desde Q2_K hasta Q8_0) para facilitar la ejecucion local en hardware de consumo mediante llama.cpp y derivados. El repositorio ocupa 170,3 GB en total, aunque cada fichero individual va desde los 12,2 GB del Q2_K/Q3_K_S hasta los 22,4 GB del Q8_0.

La relevancia de esta ficha radica en que combina tres elementos de interes: un modelo base abierto de OpenAI (gpt-oss-20b), una especializacion vertical poco habitual (simulacion de eventos discretos y razonamiento tecnico/empresarial) y un empaquetado GGUF listo para produccion local. No obstante, la informacion publicada por el autor es muy escasa: no hay benchmarks, no hay detalles de entrenamiento y la model card se limita a la metadata de cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de gpt-oss-20b; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 20.914.757.184 (20,9 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |
| Tamano del repositorio | 170,3 GB (todas las cuantizaciones) |
| Tamano por cuantizacion | 12,2 GB (Q2_K/Q3_K_S) a 22,4 GB (Q8_0) |
| Libreria declarada | transformers |
| Dataset de ajuste | sequelbox/DES-Reasoning-DeepSeek-V3.1 |
| Modelo base | sequelbox/gpt-oss-20b-DES-Reasoning (a su vez derivado de gpt-oss-20b) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del `gpt-oss-20b` de OpenAI, un transformer denso de unos 20,9 mil millones de parametros. La informacion proporcionada no detalla la configuracion interna (numero de capas, dimension oculta, mecanismo de atencion, uso de RoPE, etc.), por lo que esos datos deben consultarse en la model card del modelo base original de OpenAI. El autor de esta cuantizacion no aporta informacion adicional sobre la arquitectura.

El ajuste fino lo realizo `sequelbox` sobre el dataset `DES-Reasoning-DeepSeek-V3.1`, segun la metadata del repositorio. El nombre sugiere que los datos de entrenamiento fueron generados o destilados con DeepSeek-V3.1 y estan orientados a razonamiento sobre simulacion de eventos discretos. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF, DPO o SFT. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.) mas alla de las que pueda incorporar el modelo base `gpt-oss-20b`.

## Capacidades

- Generacion de texto y razonamiento en ingles, con enfasis declarado en *reasoning* (el tag `reasoning` aparece de forma explicita).
- Razonamiento experto en simulacion de eventos discretos (DES) y scripting con SimPy en Python.
- Generacion y analisis de codigo Python orientado a simulacion, logica y resolucion de problemas.
- Analisis de causa raiz (*root-cause analysis*) y razonamiento analitico.
- Conocimiento declarado en dominios verticales: economia, estrategia, gestion empresarial, finanzas, derecho, cadena de suministro, manufactura, telecomunicaciones, transporte, sanidad, logistica, energia, retail, construccion, agricultura, tecnologia de la informacion, medio ambiente, ingenieria de software, ciberseguridad, arquitectura y politica.
- Capacidades conversacionales e instruct (tags `chat`, `instruct`, `conversational`).
- Soporte de *tool calling* / *function calling*: no disponible en la informacion proporcionada (el modelo base gpt-oss-20b lo soporta, pero no se confirma para este ajuste).
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente para este derivado.
- Capacidades multilingues: limitadas al ingles segun la metadata (`language: en`).
- Modo *thinking* / vision / audio: no disponible en la informacion proporcionada.

## Casos de uso

- **Modelado y simulacion de eventos discretos en Python**: el modelo puede generar scripts completos con SimPy para modelar colas, lineas de produccion o flujos logisticos, gracias a su ajuste especifico sobre el dataset DES-Reasoning. Es el caso de uso central del modelo.
- **Analisis de causa raiz en operaciones**: dado un incidente en una cadena de suministro o en un sistema de TI, el modelo puede estructurar hipotesis, trazar arboles de fallos y proponer verificaciones, apoyandose en su entrenamiento en dominios como manufactura, logistica y ciberseguridad.
- **Consultoria tecnica y estrategica asistida**: el modelo declara conocimiento en economia, finanzas, derecho y estrategia, por lo que puede emplearse como asistente para borradores de analisis de negocio, evaluacion de escenarios o resumenes de politicas, siempre con revision humana.
- **Generacion de codigo Python para pipelines de simulacion**: integrable en notebooks o repositorios para producir codigo de simulacion reproducible, con cuantizaciones Q4_K_M o Q5_K_M que caben en GPU de consumo y permiten iteracion rapida en local.
- **Formacion y docencia en simulacion**: al ejecutarse en local con llama.cpp u Ollama, sirve como tutor offline para explicar conceptos de DES, generar ejercicios y revisar codigo de estudiantes sin depender de APIs externas.
- **Prototipado de asistentes verticales en ingles**: para empresas que necesiten un asistente especializado en dominios tecnicos (energia, transporte, retail) y quieran desplegarlo on-premise por motivos de confidencialidad, la licencia Apache 2.0 y el formato GGUF facilitan el despliegue.
- **Analisis de escenarios what-if**: el modelo puede redactar y razonar sobre escenarios de simulacion (variaciones de demanda, capacidad o costes) y producir narrativas interpretables para equipos no tecnicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizacion no incluye metricas de MMLU, HumanEval, GSM8K ni de tareas especificas de simulacion, y tampoco se aportan comparaciones con el modelo base `gpt-oss-20b` original.

## Requisitos de hardware

- **VRAM estimada para inferencia** (aproximada, segun tamano de fichero GGUF y overhead de contexto):
  - Q2_K / Q3_K_S: ~12-13 GB de VRAM.
  - IQ4_XS: ~12-13 GB.
  - Q4_K_S: ~15-16 GB.
  - Q4_K_M: ~16-17 GB.
  - Q5_K_M: ~17-18 GB.
  - Q6_K: ~22-23 GB.
  - Q8_0: ~22-23 GB.
- **GPU recomendadas**:
  - Consumer: RTX 4090 (24 GB) permite Q4_K_M, Q5_K_M e incluso Q6_K/Q8_0 con contexto moderado; RTX 3090 (24 GB) similar; RTX 4080 (16 GB) queda justa para Q4_K_S.
  - Profesional: A100 40/80 GB, H100 80 GB, L40S 48 GB para cuantizaciones altas y contextos largos.
  - Multi-GPU: posible con llama.cpp y offloading por capas.
- **Cabe en consumer GPU**: si, en RTX 3090/4090 (24 GB) para Q4_K_M y Q5_K_M; en GPUs de 16 GB solo cuantizaciones bajas (Q2_K, Q3_K_S) o con offloading parcial a CPU.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI, aunque no se detalla.
- **Latencia y throughput estimados**: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `mradermacher/gpt-oss-20b-DES-Reasoning-GGUF` (este) | 20,9 B | no disponible | Apache 2.0 | GGUF | Ajuste vertical en DES; solo ingles |
| `openai/gpt-oss-20b` (base original) | ~20,9 B | no disponible en esta ficha | Apache 2.0 | safetensors / GGUF | Modelo generalista de OpenAI; sin especializacion en DES |
| `sequelbox/gpt-oss-20b-DES-Reasoning` (modelo base de este) | 20,9 B | no disponible | Apache 2.0 | safetensors | Version sin cuantizar del mismo ajuste |
| Otras cuantizaciones GGUF de gpt-oss-20b | 20,9 B | no disponible | Apache 2.0 | GGUF | Alternativas generalistas sin el ajuste DES |

No se dispone de datos de rendimiento comparativo (benchmarks) que permitan establecer diferencias cuantitativas entre estas variantes.

## Limitaciones y advertencias

- **Idioma**: el modelo solo declara soporte de ingles (`language: en`); su uso en castellano no esta validado y probablemente degrade la calidad.
- **Especializacion estrecha**: el ajuste esta orientado a simulacion de eventos discretos y dominios tecnicos; en tareas generales puede comportarse peor que el `gpt-oss-20b` original.
- **Riesgo de alucinacion**: como todo modelo generativo, puede inventar APIs de SimPy, funciones inexistentes o resultados de simulacion; es imprescindible validar el codigo generado.
- **Falta de benchmarks**: no hay evidencia publicada del rendimiento real del ajuste frente al modelo base, lo que dificulta evaluar su calidad objetiva.
- **Documentacion escasa**: la model card del repositorio de cuantizacion no documenta el proceso de entrenamiento, el dataset ni hiperparametros; la trazabilidad es limitada.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base `gpt-oss-20b` de OpenAI y del dataset `DES-Reasoning-DeepSeek-V3.1`, que podrian imponer restricciones adicionales.
- **Cuantizaciones bajas**: Q2_K y Q3_K_S degradan la calidad; para produccion se recomienda Q4_K_M o superior.
- **Contexto**: al no conocerse la longitud de contexto soportada, no se puede garantizar el rendimiento en conversaciones o documentos largos.
- **Sesgos**: no documentados por el autor; heredados potencialmente del modelo base y del dataset de destilacion.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/gpt-oss-20b-DES-Reasoning-GGUF
- Modelo base del ajuste: https://huggingface.co/sequelbox/gpt-oss-20b-DES-Reasoning
- Dataset de entrenamiento: https://huggingface.co/datasets/sequelbox/DES-Reasoning-DeepSeek-V3.1
- Pagina de conveniencia del cuantizador: https://hf.tst.eu/model#gpt-oss-20b-DES-Reasoning-GGUF
- FAQ y peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
