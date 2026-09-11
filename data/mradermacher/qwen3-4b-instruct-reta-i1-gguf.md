# mradermacher/Qwen3-4B-Instruct-RETA-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo Qwen3-4B-Instruct-RETA, publicadas por mradermacher. Se trata de un derivado de Qwen3-4B-Instruct afinado (la ficha base se identifica como ttttonyhe/Qwen3-4B-Instruct-RETA) y orientado, segun las etiquetas del propio repositorio, a seguridad de agentes: prompt-injection, agent-security, tool-use y agentdojo. El problema que aborda es el de los asistentes que ejecutan herramientas y que pueden ser manipulados mediante instrucciones maliciosas embebidas en el contenido que procesan.

El aporte concreto del repositorio de mradermacher no es un nuevo entrenamiento, sino la conversion y cuantizacion del modelo original a formato GGUF, con una variante imatrix (i1) que calcula una matriz de importancia para reducir la perdida de calidad en cuantizaciones agresivas. Esto permite ejecutar un modelo de la familia Qwen3 de aproximadamente 4.000 millones de parametros en hardware de consumo, algo relevante para quien quiera evaluar defensas frente a prompt injection en un entorno local y sin depender de APIs externas.

Se publican tanto cuantizaciones estaticas (en un repositorio aparte) como cuantizaciones ponderadas por imatrix, con una horquilla que va de IQ1_S a Q6_K. El idioma declarado es unicamente el ingles y la licencia es Apache 2.0. La relevancia actual del modelo esta ligada al interes creciente por la seguridad de agentes que usan herramientas, un area donde las evaluaciones tipo AgentDojo se han convertido en referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada; el modelo base indicado (Qwen3-4B-Instruct-RETA) deriva de Qwen3-4B-Instruct, de tipo transformer denso con decodificador |
| Parametros totales | no disponible de forma fiable para este repositorio; el modelo base es Qwen3-4B, en torno a 4.000 millones de parametros. La metadata del repo consigna 958.716 parametros en safetensors, cifra no coherente con el nombre del modelo y presumiblemente referida al archivo imatrix |
| Parametros activos | no aplicable (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada para este repositorio |
| Tipos de cuantizacion | imatrix (i1): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL (small), Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF; tambien se ofrece un archivo imatrix (.gguf) para generar cuantizaciones propias. Existe un repositorio separado con cuantizaciones estaticas |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura o el proceso de entrenamiento en la documentacion proporcionada. El repositorio es exclusivamente de cuantizacion: mradermacher parte del modelo publicado por ttttonyhe y genera archivos GGUF, tanto estaticos como ponderados por imatrix. La metodologia imatrix implica estimar la importancia de cada peso del modelo a partir de estadisticas de activacion, de modo que las cuantizaciones de baja precision preserven mejor las capas y tensores criticos.

El modelo base pertenece a la familia Qwen3-4B-Instruct y, segun las etiquetas del repositorio, ha sido ajustado para tareas relacionadas con seguridad de agentes frente a prompt injection y con el uso de herramientas (tool-use), con mencion explicita a agentdojo. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO u otras variantes de alineamiento. Tampoco se documentan innovaciones tecnicas propias mas alla del ajuste orientado a seguridad.

## Capacidades

- Generacion de texto en ingles y conversacion multi-turno, heredadas de la base Qwen3-4B-Instruct.
- Uso de herramientas y function calling, segun la etiqueta tool-use del repositorio.
- Resistencia o tratamiento de prompt injection: el modelo esta etiquetado como prompt-injection y agent-security, lo que sugiere un ajuste especifico para este tipo de ataques.
- Evaluacion en entornos de agentes: la etiqueta agentdojo apunta a que el modelo se ha trabajado en el contexto de ese banco de pruebas de seguridad de agentes.
- Ejecucion local en CPU y GPU gracias al formato GGUF, incluida la posibilidad de descarga total sin conexion a servicios externos.
- Capacidades multilingues: no disponibles; el unico idioma declarado es el ingles.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo de razonamiento explicito (thinking): no disponible en la informacion proporcionada.

## Casos de uso

- Evaluacion de defensas frente a prompt injection: el modelo permite reproducir en local ataques de inyeccion de instrucciones a traves de contenido recuperado o resultados de herramientas, y medir si el ajuste especifico reduce la tasa de exito del atacante en comparacion con la base Qwen3-4B-Instruct.
- Agentes con tool calling en entornos controlados: integrable como planificador que decide que herramienta invocar (busqueda, calculadora, API interna) con la ventaja de que el ajuste esta orientado a no desviarse ante instrucciones hostiles presentes en las respuestas de esas herramientas.
- Red-teaming y generacion de conjuntos de prueba: util para construir corpus de ataques dirigidos a agentes, ya que el modelo conoce el dominio de seguridad de agentes y puede generar variantes de payloads para validar la robustez de otros sistemas.
- Pipelines de RAG con contenido no confiable: en escenarios donde los documentos indexados pueden contener texto adversarial, un modelo afinado para resistir inyecciones reduce el riesgo de que el asistente ejecute acciones no solicitadas.
- Asistente de escritorio totalmente local: con una cuantizacion Q4_K_M el modelo cabe en GPU de consumo y puede ejecutarse con llama.cpp u Ollama, lo que resulta adecuado para prototipos de agentes donde no se quiere enviar datos a terceros.
- Verificacion en CI/CD de aplicaciones con agentes: permite incorporar pruebas automatizadas de seguridad que lanzan prompts maliciosos contra el modelo y comprueban que no se filtran instrucciones ni se invocan herramientas prohibidas.
- Investigacion academica sobre alineamiento y robustez: al ser Apache 2.0 y ejecutable en hardware modesto, sirve como banco de pruebas reproducible para comparar tecnicas de defensa con un presupuesto de computo bajo.
- Atencion al cliente con acceso a herramientas internas: el modelo puede gestionar conversaciones donde el usuario intenta manipular el sistema para consultar datos de otros clientes, un caso clasico de inyeccion indirecta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye cifras de MMLU, HumanEval, GSM8K, AgentDojo ni de ninguna otra evaluacion, ni comparaciones numericas con el modelo base sin cuantizar o con los distintos niveles de cuantizacion.

## Requisitos de hardware

Las cifras siguientes son estimaciones orientativas a partir del tamano del modelo base (aproximadamente 4.000 millones de parametros) y no proceden de mediciones publicadas en la informacion disponible.

- VRAM estimada para los pesos: en torno a 2,5-2,8 GB con Q4_K_M; 3,0-3,4 GB con Q5_K_M; 3,5-4,0 GB con Q6_K; 4,5-5,0 GB con Q8_0; unos 8-9 GB en FP16. A estas cifras hay que sumar la cache KV, que crece con la longitud de contexto efectiva.
- Cuantizaciones muy agresivas (IQ1_S, IQ2_XXS, IQ2_XS) reducen el uso de memoria por debajo de 2 GB, a costa de una degradacion notable de la calidad que conviene validar en la tarea concreta antes de usarlas en produccion.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, y en el segmento profesional A10G, L4, A100 o H100. Cualquier GPU con 6 GB o mas de VRAM puede ejecutar las cuantizaciones intermedias.
- Cabe en GPU de consumo: si, en la practica totalidad de tarjetas con 6 GB o mas. En equipos con 8 GB de RAM tambien es viable la inferencia en CPU con cuantizaciones Q4 o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF. vLLM y TGI no estan orientados a este formato en su flujo habitual.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dependen fuertemente del hardware, del nivel de cuantizacion y de la longitud de contexto.

## Comparativa con modelos similares

Los datos de contexto y licencia de los modelos alternativos que figuran a continuacion son de referencia general y no se han verificado en la informacion proporcionada; deben comprobarse en sus fichas oficiales antes de tomar decisiones.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-Instruct-RETA (i1-GGUF) | ~4.000 millones (base Qwen3-4B) | no disponible | Seguridad de agentes y tool use | apache-2.0 | GGUF en HuggingFace |
| Qwen3-4B-Instruct (base sin ajustar) | ~4.000 millones | no disponible | Asistente general | apache-2.0 | safetensors y GGUF en HuggingFace |
| Llama 3.2 3B Instruct | ~3.000 millones | no disponible | Asistente general | Licencia comunitaria de Llama 3.2 | pesos en HuggingFace |
| Phi-4-mini-instruct | ~3.800 millones | no disponible | Asistente general, razonamiento | MIT | pesos en HuggingFace |

La diferencia principal de este modelo frente a las alternativas es su especializacion declarada en seguridad de agentes y prompt injection, terreno en el que los modelos generalistas no incorporan defensas especificas. No se dispone de datos de rendimiento que permitan cuantificar esa ventaja.

## Limitaciones y advertencias

- No se han publicado evaluaciones cuantitativas que respalden la eficacia del ajuste frente a prompt injection; las etiquetas del repositorio no equivalen a una garantia de robustez.
- Riesgo de alucinacion inherente a un modelo de 4.000 millones de parametros, especialmente en tareas de razonamiento largo o de conocimiento factual especializado.
- Idiomas: solo se declara ingles. El rendimiento en castellano no esta documentado y previsiblemente sera inferior.
- Longitud de contexto: no especificada en este repositorio. Conviene verificar la ventana efectiva del modelo base antes de disenar aplicaciones que dependan de contexto largo.
- Cuantizaciones de muy baja precision (IQ1_S, IQ2_XXS, IQ2_XS) pueden degradar de forma apreciable la calidad y, en un modelo orientado a seguridad, reducir la eficacia de las defensas. Se recomienda Q4_K_M o superior para evaluaciones serias.
- El repositorio figura con 0 descargas y 0 likes y un tamano de 0.0 GB en la metadata consultada; la tabla de ficheros solo lista el archivo imatrix, por lo que conviene comprobar que las cuantizaciones deseadas estan efectivamente subidas antes de integrarlas.
- La cifra de parametros publicada en la metadata (958.716) es inconsistente con el nombre del modelo y no debe usarse para dimensionar el despliegue.
- Licencia Apache 2.0, permisiva para uso comercial, pero el usuario sigue siendo responsable de las obligaciones derivadas de la licencia del modelo base y del uso que haga de un sistema de seguridad no garantizada.
- Un modelo ajustado contra prompt injection no sustituye a controles arquitectonicos (saneado de entradas, permisos minimos en herramientas, validacion de salidas). Debe usarse como una capa adicional.

## Enlaces

- Repositorio GGUF con cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3-4B-Instruct-RETA-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwen3-4B-Instruct-RETA-GGUF
- Modelo base: https://huggingface.co/ttttonyhe/Qwen3-4B-Instruct-RETA
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#Qwen3-4B-Instruct-RETA-i1-GGUF
- Peticiones de modelos y preguntas frecuentes de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Ejemplo de README para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Empresa del autor de las cuantizaciones: https://www.nethype.de/
