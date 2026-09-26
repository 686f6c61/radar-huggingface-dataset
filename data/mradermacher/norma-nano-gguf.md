# mradermacher/norma-nano-GGUF

## Resumen

Norma-nano es un modelo de decisión y enrutado de agentes de aproximadamente 494 millones de parámetros, publicado originalmente por norma-ai y empaquetado en formato GGUF por mradermacher. La ficha que nos ocupa no es el modelo original, sino la colección de cuantizaciones estáticas (Q2_K a f16) derivada de `norma-ai/norma-nano`, pensada para inferencia en llama.cpp y runtimes compatibles con GGUF.

El modelo se presenta bajo las etiquetas "system-one", "decision-model", "agent-routing", "guardrails" y "classification", lo que indica un propósito acotado: tomar decisiones rápidas y calibradas dentro de pipelines de agentes (por ejemplo, enrutar una consulta al modelo o herramienta adecuada, o aplicar guardarraíles), más que mantener conversaciones abiertas de propósito general. Su arquitectura causal-LM está basada en Qwen2.5, lo que facilita su integración con el ecosistema de transformers y con herramientas de inferencia ya existentes.

Su relevancia práctica es doble: por un lado, el tamaño reducido (menos de 500 millones de parámetros) permite ejecutarlo en hardware muy modesto, incluso en CPU, con latencias bajas; por otro, el formato GGUF con múltiples niveles de cuantización facilita desplegarlo como componente auxiliar en arquitecturas multiagente donde el coste por llamada importa. La licencia Apache-2.0 elimina además fricción para uso comercial. No se han publicado en la información disponible datos de benchmarks, longitud de contexto ni detalles del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal-LM (etiqueta `qwen2.5`; familia Qwen2.5) |
| Parametros totales | 494.032.768 (494 M, dato real de safetensors del modelo base) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K (0,4 GB), Q3_K_S (0,4 GB), IQ4_XS (0,5 GB), Q3_K_M (0,5 GB), Q3_K_L (0,5 GB), Q4_K_S (0,5 GB), Q4_K_M (0,5 GB), Q5_K_S (0,5 GB), Q5_K_M (0,5 GB), Q6_K (0,6 GB), Q8_0 (0,6 GB), f16 (1,1 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base `norma-ai/norma-nano`) |

Datos adicionales: tamano del repositorio 5,4 GB (suma de todas las cuantizaciones), creado el 25 de septiembre de 2026 y actualizado el mismo dia segun el registro de HuggingFace. Modelo base: `norma-ai/norma-nano`. Compatible con endpoints y uso conversacional segun las etiquetas del repositorio.

## Arquitectura y entrenamiento

La informacion disponible no incluye la model card del modelo original, solo la del repositorio de cuantizaciones. Por las etiquetas del repositorio (`causal-lm`, `qwen2.5`, `base_model: norma-ai/norma-nano`) se deduce que se trata de un transformer causal con tokenizador y arquitectura de la familia Qwen2.5, reentrenado o ajustado para tareas de decisión, siguiendo el paradigma "system-one": respuestas rápidas y calibradas frente a razonamiento extendido.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o ajuste supervisado. Tampoco hay detalles sobre innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal, destilacion, etc.). Las cuantizaciones de mradermacher son estaticas (sin imatrix), y el propio autor indica que es posible que no publique versiones ponderadas por imatrix.

## Capacidades

- Clasificacion y decisiones calibradas: el modelo esta orientado a producir decisiones discretas o puntuaciones de confianza, segun las etiquetas `classification` y `calibrated-decisions`.
- Enrutado de agentes (`agent-routing`): seleccion del modelo, herramienta o flujo adecuado dentro de un sistema multiagente.
- Guardarrailes (`guardrails`): filtrado de entradas o salidas dentro de un pipeline, con el enfoque "system-one" de respuesta rapida.
- Generacion de texto basica: al ser un causal-LM etiquetado como `conversational`, puede generar texto, aunque no es su proposito principal declarado.
- Inferencia rapida (`fast-inference`): disenado para latencia baja, coherente con un modelo de 494 M de parametros.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere uso detras de APIs compatibles.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Razonamiento multi-paso, modo thinking, vision o audio: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el unico idioma declarado es el ingles.

## Casos de uso

- Enrutado de consultas en sistemas multiagente: dado un mensaje del usuario, el modelo decide a que agente o herramienta derivarlo (por ejemplo, "busqueda web", "base de datos", "modelo grande"). Su tamano permite ejecutar esta decision en milisegundos antes de invocar un modelo mas caro.
- Guardarrailes de entrada en produccion: colocado delante de un LLM mayor, clasifica si una peticion es apta, esta fuera de alcance o contiene intentos de manipulacion, evitando llamadas costosas o riesgosas.
- Filtrado previo en pipelines RAG: decide si una pregunta requiere recuperacion de documentos o puede responderse directamente, reduciendo el numero de consultas al indice vectorial.
- Clasificacion de intenciones y triaje de tickets: etiquetar consultas de soporte por categoria o urgencia antes de asignarlas a un equipo o a un modelo especializado.
- Etiquetado de datos a escala: al ser pequeno y rapido, puede usarse para anotar grandes volumenes de texto (clasificacion binaria o multiclase) a un coste por token muy bajo, con revision humana posterior.
- Router de coste en pasarelas de LLM: decidir si una peticion se resuelve con un modelo local pequeno o debe escalarse a un modelo mayor, reduciendo el gasto en APIs.
- Deteccion de prompt injection: clasificador auxiliar que marca entradas sospechosas antes de que lleguen al modelo principal.
- Despliegue en el borde (edge) o en CPU: al ocupar entre 0,4 GB y 1,1 GB en GGUF, puede ejecutarse en portatiles, mini-PC o contenedores sin GPU para tareas de decision en local, con la privacidad como ventaja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio GGUF ni los resultados de busqueda proporcionados incluyen cifras de MMLU, HumanEval, GSM8K ni de tareas de clasificacion o enrutado.

## Requisitos de hardware

- VRAM estimada (a partir del tamano de los ficheros GGUF, sin contar overhead de contexto ni de runtime):
  - Q2_K / Q3_K_S: ~0,4 GB.
  - IQ4_XS / Q3_K_M / Q3_K_L / Q4_K_S / Q4_K_M / Q5_K_S / Q5_K_M: ~0,5 GB.
  - Q6_K / Q8_0: ~0,6 GB.
  - f16: ~1,1 GB.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente. En la practica, cabe en integradas modernas, en una GTX 1650, RTX 3050, RTX 4060 o superiores; tambien en A100/H100 si se comparte con otros servicios. No requiere GPU de datacenter.
- Cabe en GPU de consumo: si, en practicamente todas las GPU discretas de los ultimos diez anos, y tambien en CPU (inferencia viable en x86 y ARM).
- Opciones de despliegue: llama.cpp y sus bindings (llama-cpp-python), Ollama, LM Studio, kobold.cpp y cualquier runtime compatible con GGUF. Para el modelo base en safetensors: transformers, vLLM o TGI (no confirmado en la informacion disponible para estas dos ultimas).
- Latencia y throughput: no se han publicado cifras. Por el tamano (~494 M de parametros) es esperable una latencia muy baja y un throughput alto incluso en CPU, pero se trata de una estimacion, no de un dato medido.

## Comparativa con modelos similares

La informacion proporcionada no incluye benchmarks del modelo, por lo que la comparacion se limita a parametros, licencia y disponibilidad. Los datos de los modelos alternativos proceden de sus fichas publicas y pueden variar con el tiempo.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| mradermacher/norma-nano-GGUF | 494 M | no disponible | Apache-2.0 | Decision, enrutado y guardarrailes (GGUF) |
| Qwen2.5-0.5B | ~0,49 B | 32.768 tokens | Apache-2.0 | LLM generalista, base de partida de norma-nano |
| SmolLM2-360M | ~0,36 B | 8.192 tokens | Apache-2.0 | LLM generalista pequeno |
| TinyLlama-1.1B | ~1,1 B | 2.048 tokens | Apache-2.0 | LLM generalista pequeno |

Frente a los LLM generalistas de tamano similar, norma-nano se diferencia por su especializacion declarada en decisiones y enrutado, no por capacidades generativas amplias. El rendimiento relativo no puede evaluarse sin benchmarks publicados.

## Limitaciones y advertencias

- Idiomas: solo se declara ingles. No hay soporte oficial de castellano, por lo que su uso en produccion en espanol requeriria evaluacion previa y probablemente ajuste.
- Sesgos: no hay informacion sobre el dataset de entrenamiento ni sobre evaluaciones de sesgo. Al ser un modelo pequeno y especializado, los sesgos heredados de los datos de ajuste pueden ser mas pronunciados.
- Alucinacion: como todo modelo generativo, puede producir salidas incorrectas con alta confianza. Si se usa como clasificador o guardarrail, conviene tratar sus salidas como senales probabilisticas y validarlas con umbrales.
- Ambito de uso: las etiquetas "system-one" y "decision-model" sugieren un rendimiento inferior en tareas de razonamiento largo o conversacion abierta compleja. No conviene emplearlo como modelo principal de chat.
- Ausencia de benchmarks: no hay datos publicados de calidad, calibracion ni robustez; cualquier despliegue en produccion deberia ir precedido de una evaluacion propia sobre el dominio objetivo.
- Degradacion por cuantizacion: las cuantizaciones Q2_K y Q3_K_S son las mas agresivas y el propio autor marca Q3_K_M como "lower quality". Para tareas sensibles a la calibracion se recomienda Q5_K_M, Q6_K o Q8_0.
- Cuantizaciones ponderadas: el autor indica que no hay versiones con imatrix disponibles y que podria no planear publicarlas.
- Madurez del repositorio: el repositorio de cuantizaciones registra 0 descargas y 0 "likes", por lo que no existe validacion de la comunidad. La fecha de creacion registrada (25 de septiembre de 2026) resulta anomala respecto a la informacion habitual de HuggingFace.
- Licencia: Apache-2.0 permite uso comercial, pero deben respetarse los terminos del modelo base `norma-ai/norma-nano` (misma licencia declarada) y verificarse la procedencia de los datos de ajuste antes de un despliegue comercial.
- Documentacion escasa: solo se dispone de la model card del repositorio de cuantizaciones; no hay informacion sobre la ficha original del modelo ni sobre su proceso de entrenamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/norma-nano-GGUF
- Modelo base: https://huggingface.co/norma-ai/norma-nano
- Pagina de resumen y descargas de mradermacher: https://hf.tst.eu/model#norma-nano-GGUF
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
