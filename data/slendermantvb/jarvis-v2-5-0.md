# slendermantvb/jarvis-v2.5.0

## Resumen

Jarvis v2.5.0 es un modelo de lenguaje experimental de pequeno tamano (aproximadamente 79 millones de parametros) publicado por el autor slendermantvb bajo licencia Apache 2.0. Se distribuye como un checkpoint en formato safetensors sobre PyTorch, con soporte declarado para castellano e ingles, y esta etiquetado como modelo de generacion de texto con arquitectura de mezcla de expertos (MoE) y un componente de razonamiento simbolico en Lisp anadido en la capa de aplicacion. Su ventana de contexto nativa es de 512 tokens, con vocabulario de 16.000 tokens, tamano oculto de 512 y 10 capas.

El modelo se presenta como una "core neural estable" sobre la que la version 2.5 anade mejoras de entorno de ejecucion en lugar de reentrenar la red: seleccion adaptativa de fragmentos relevantes para entradas largas, una guarda factual determinista combinada con RAG (mas de 50.000 elementos indexados), verificacion de codigo Python mediante un interprete AST seguro, una guarda de coherencia que descarta salidas repetitivas o corruptas, y un mecanismo de memoria tipo Reflexion que solo almacena ejemplos de codigo verificados. Estas capacidades pertenecen a la aplicacion local Jarvis, no al checkpoint minimo del repositorio.

Su relevancia es acotada pero concreta: es un ejemplo de arquitectura MoE muy compacta con decodificacion multi-token y un enfoque hibrido neuro-simbolico, distribuida con pesos abiertos y ejecutable en hardware de consumo. Con cero descargas y cero likes en el momento de la consulta, se trata de un proyecto personal sin traccion comunitaria ni validacion externa, por lo que debe evaluarse como prototipo y no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), 4 expertos con enrutado top-2 y experto compartido; decodificacion multi-token de profundidad 2 |
| Parametros totales | 78.846.484 (aproximadamente 79M, dato de safetensors) |
| Parametros activos | no disponible (el autor no desglosa el reparto entre parametros activos y totales; la configuracion es MoE con 4 expertos enrutados top-2 mas un experto compartido) |
| Longitud de contexto | 512 tokens nativos; entradas mas largas se gestionan en la aplicacion mediante seleccion de extractos relevantes, no por entrenamiento de contexto largo |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no se documentan versiones GGUF, AWQ, GPTQ ni INT8/INT4) |
| Idiomas soportados | Espanol (es) e ingles (en) |
| Licencia | Apache 2.0 (con reservas del autor: la procedencia de los datos de entrenamiento sigue sujeta a terminos de terceros, incluidos CC BY-SA y GFDL por el corpus de Wikimedia/Wikipedia) |
| Formato de pesos | safetensors (PyTorch) |

Datos adicionales de configuracion declarados por el autor: vocabulario de 16.000 tokens, tamano oculto de 512, 10 capas, 8 cabezas de atencion, dimension latente de KV de 128, tamano de feed-forward de 1.365. Tamano del repositorio: 0,3 GB. Fecha de creacion registrada: 2026-10-08.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 10 capas con tamano oculto 512 y 8 cabezas de atencion, sobre el que se aplica una capa de mezcla de expertos con 4 expertos, enrutado top-2 y un experto compartido siempre activo. La dimension latente de KV es de 128, lo que reduce el coste de cache de atencion, y el modelo incorpora decodificacion multi-token con profundidad 2, es decir, predice mas de un token por paso. El feed-forward por experto tiene tamano 1.365. El framework de referencia es PyTorch y los pesos se distribuyen en safetensors.

No hay informacion publica sobre el volumen de tokens de entrenamiento, la composicion exacta del dataset, la existencia de fases de RLHF o DPO ni el procedimiento de ajuste. Lo unico documentado es que el corpus de preentrenamiento original incluye texto de Wikimedia/Wikipedia, con las obligaciones de atribucion y comparticion derivadas de CC BY-SA y GFDL. Las innovaciones de la version 2.5 no estan en la red neuronal, sino en la capa de aplicacion: seleccion adaptativa de contexto, guarda factual determinista con RAG, guarda de coherencia de salida, verificacion de codigo con interprete AST e integracion de razonamiento simbolico en Lisp y memoria Reflexion.

## Capacidades

- Generacion de texto en castellano e ingles, con un nucleo neuronal de aproximadamente 79M de parametros.
- Razonamiento simbolico mediante un componente en Lisp integrado en la aplicacion local.
- Generacion y verificacion de codigo Python: los ejemplos pueden validarse con un interprete AST seguro antes de aceptarse.
- Recuperacion aumentada (RAG) sobre un indice de mas de 50.000 elementos en la aplicacion local, con respuestas factuales deterministas antes de recurrir al modelo neuronal.
- Guarda factual: las preguntas factuales no soportadas devuelven una respuesta explicita de desconocimiento en lugar de generar una respuesta especulativa.
- Memoria tipo Reflexion: permite recordar errores y correcciones del usuario; solo se persisten ejemplos de codigo verificados.
- Manejo adaptativo de entradas largas mediante seleccion de extractos relevantes del prompt original, preservando la instruccion o pregunta final.
- Guarda de coherencia que rechaza salidas corruptas, repetitivas, con etiquetas internas o excesivamente largas.
- Soporte de tool calling / function calling: no documentado.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo de razonamiento explicito (thinking mode): no documentado como tal; el razonamiento simbolico y la memoria Reflexion son las unicas variantes descritas.

## Casos de uso

- Prototipado de asistentes conversacionales locales: el modelo puede ejecutarse integramente en una maquina de consumo gracias a su tamano de 0,3 GB, sin depender de APIs externas, lo que resulta adecuado para demos offline o entornos con restricciones de privacidad.
- Generacion de codigo asistida con verificacion: al poder validar ejemplos de Python mediante un interprete AST antes de aceptarlos, encaja en flujos donde el codigo sugerido debe comprobarse antes de incorporarse a un repositorio.
- Sistemas de pregunta-respuesta con RAG: la aplicacion local indexa mas de 50.000 elementos y prioriza respuestas factuales deterministas, un patron util para asistentes sobre documentacion interna donde se prefiere "no lo se" antes que una respuesta inventada.
- Ensenanza e investigacion de arquitecturas MoE: con 4 expertos, enrutado top-2 y experto compartido en solo 512 dimensiones ocultas, sirve como banco de pruebas de bajo coste para estudiar enrutado, equilibrio de carga y decodificacion multi-token.
- Experimentacion en IA neuro-simbolica: la combinacion de un nucleo neuronal pequeno con un motor simbolico en Lisp permite explorar hibridos donde la parte determinista valida o corrige la salida del modelo.
- Asistentes de escritura en castellano e ingles para textos cortos: resumen, reformulacion o redaccion de fragmentos breves, asumiendo la limitacion de contexto de 512 tokens nativos y apoyandose en la seleccion de extractos para entradas largas.
- Investigacion sobre mitigacion de alucinacion: el par de suites locales (540/540 en programacion y 120/120 en anti-alucinacion) puede reproducirse y estudiarse como metodologia de evaluacion especifica de proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente reporta dos suites de validacion locales y especificas del proyecto, que no son comparables con evaluaciones publicas:

| Suite | Resultado | Nota |
|---|---|---|
| Programacion (suite local del proyecto) | 540 / 540 | Benchmark propio, no universal |
| Anti-alucinacion (suite local del proyecto) | 120 / 120 | Benchmark propio, no universal |

El propio autor advierte de que se trata de "benchmarks locales especificos del proyecto, no una afirmacion de precision universal". No se dispone de cifras comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia de los pesos (calculo a partir de los 78.846.484 parametros, no dato publicado): aproximadamente 315 MB en FP32, 158 MB en FP16/BF16, 79 MB en INT8 y 40 MB en INT4.
- Cache KV: con 10 capas, dimension latente de KV de 128 y contexto nativo de 512 tokens, el coste es del orden de unos pocos megabytes en FP16, practicamente despreciable frente a los pesos.
- GPU: cualquier GPU moderna es suficiente. El modelo cabe sin problemas en una RTX 3060, RTX 4060, RTX 4090, A100 o H100; tambien es viable en GPUs integradas y en CPU.
- Cabe en GPU de consumo: si, con margen amplio, incluidas tarjetas con 4-8 GB de VRAM e incluso sistemas sin GPU dedicada.
- Opciones de despliegue: el repositorio proporciona un script `inference.py` sobre PyTorch con `tokenizers` y `safetensors`. No se documentan soportes oficiales de vLLM, llama.cpp, Ollama, TGI ni otros servidores; al tratarse de una arquitectura personalizada, su compatibilidad con esos runners no esta garantizada y requeriria adaptaciones.
- Latencia y throughput estimados: no disponibles.
- Instalacion declarada: `pip install torch tokenizers safetensors` y ejecucion mediante `python inference.py "Hola, quien eres?"`.

## Comparativa con modelos similares

No existe una categoria estandar de modelos MoE de aproximadamente 79M de parametros con razonamiento simbolico integrado, por lo que la comparacion se hace con modelos densos pequenos de proposito general ampliamente conocidos. Los datos de los modelos alternativos corresponden a informacion publica de sus respectivas fichas y pueden variar; se marcan como referencia aproximada.

| Modelo | Parametros | Contexto nativo | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| Jarvis v2.5.0 | 78,8M | 512 tokens | MoE (4 expertos, top-2, experto compartido) + capa simbolica Lisp en la aplicacion | Apache 2.0 | Proyecto personal, 0 descargas, sin benchmarks estandar |
| Qwen2.5-0.5B | aproximadamente 0,49B | 32.768 tokens | Transformer denso | Apache 2.0 | Modelo consolidado con amplia documentacion y soporte en runners habituales |
| SmolLM2-135M | aproximadamente 135M | 8.192 tokens | Transformer denso | Apache 2.0 | Orientado a ejecucion en dispositivo, con soporte en ecosistema llama.cpp/Ollama |
| TinyLlama-1.1B | aproximadamente 1,1B | 2.048 tokens | Transformer denso | Apache 2.0 | Entrenado sobre corpus de gran volumen, con evaluaciones publicas |

Frente a estas alternativas, Jarvis ofrece un tamano menor y una propuesta arquitectonica distinta (MoE con multi-token prediction y capa simbolica), pero carece de contexto largo nativo, de soporte en runners estandar y de evaluaciones publicas comparables. No hay datos de rendimiento que permitan afirmar superioridad en ninguna tarea.

## Limitaciones y advertencias

- Nucleo neuronal muy pequeno (aproximadamente 79M de parametros): el propio autor reconoce que puede cometer errores en tareas dificiles o poco familiares.
- Contexto nativo de 512 tokens: la mitigacion para entradas largas se basa en seleccion de extractos en la aplicacion, lo que no equivale a un modelo entrenado con contexto largo y puede perder informacion relevante fuera de los fragmentos seleccionados.
- Riesgo de alucinacion: aunque la aplicacion incorpora guarda factual y RAG, el checkpoint minimo del repositorio no reproduce todas esas salvaguardas, por lo que la inferencia directa sobre los pesos no incluye las protecciones descritas.
- Las suites locales (540/540 y 120/120) son especificas del proyecto y no permiten extrapolar precision en tareas generales; no deben interpretarse como validacion externa.
- Idiomas: solo es e en la etiqueta del modelo; no hay evidencia de cobertura multilingue adicional ni de calidad medida por idioma.
- Sesgos conocidos: no documentados explicitamente. El corpus incluye texto de Wikimedia/Wikipedia, por lo que son previsibles los sesgos presentes en esa fuente.
- Licencia: el codigo y los artefactos del modelo se publican bajo Apache 2.0 "en la medida en que el autor tenga derechos para licenciarlos". La procedencia de los datos de entrenamiento sigue sujeta a terminos de terceros (CC BY-SA y, segun el material, GFDL), que Apache 2.0 no sustituye ni anula; existe un fichero NOTICE al respecto. Esto exige revision legal antes de un uso comercial.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin revisores externos ni comunidad. No hay garantias de mantenimiento, soporte ni reproducibilidad de los resultados declarados.
- Despliegue: al ser una arquitectura personalizada, el soporte en herramientas estandar (vLLM, llama.cpp, Ollama, TGI) no esta documentado y puede requerir trabajo adicional de integracion.
- Advertencia sobre homonimos: los resultados de busqueda web (jarvisapp.in, repositorios de asistentes de escritorio y sitios de asistentes aganticos) corresponden a proyectos distintos y sin relacion con este checkpoint; no deben usarse como documentacion del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/slendermantvb/jarvis-v2.5.0
- Fichero NOTICE (referenciado en la model card, no enlazado directamente en la informacion disponible): no disponible como URL
- Resultados de busqueda web (proyectos homonimos, no relacionados con este modelo):
  - https://jarvisapp.in/
  - https://github.com/Blazehue/J.A.R.V.I.S
  - https://github.com/open-jarvis/OpenJarvis
  - https://my-jarvis.org/
  - https://jarvis.foundation/
- Paper, blog tecnico, repositorio del autor, demo o documentacion adicional: no disponibles.
