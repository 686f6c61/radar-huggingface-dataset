# mradermacher/LiteCoder-Terminal-30b-a3b-sft-GGUF

## Resumen

LiteCoder-Terminal-30b-a3b-sft-GGUF es la distribucion en formato GGUF del modelo LiteCoder-Terminal-30b-a3b-sft, un modelo de lenguaje especializado en tareas de terminal y generacion de codigo, publicado por el colectivo Lite-Coder y cuantizado por mradermacher. El repositorio que nos ocupa no contiene los pesos originales en safetensors, sino una coleccion de 11 cuantizaciones estaticas en GGUF pensadas para ejecucion local con llama.cpp y sus derivados (Ollama, LM Studio, etc.).

El modelo base tiene 30.532.122.624 parametros totales (aproximadamente 30,5 mil millones), lo que junto al sufijo "a3b" del nombre sugiere una arquitectura de mezcla de expertos (MoE) con unos 3 mil millones de parametros activos por token, aunque esta informacion no aparece confirmada de forma explicita en la model card proporcionada. La orientacion declarada es "Terminal", lo que indica un ajuste fino supervisado (SFT, como refleja el sufijo "-sft") sobre tareas de linea de comandos, automatizacion de shell y asistencia a agentes de terminal.

Su relevancia actual radica en que permite desplegar un modelo de ~30B con activacion reducida en hardware de consumo mediante cuantizacion agresiva (desde 11,4 GB en Q2_K hasta 32,6 GB en Q8_0), manteniendo licencia MIT, lo que facilita su adopcion tanto en entornos de investigacion como en productos comerciales sin restricciones de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el nombre sugiere MoE con ~3B activos, sin confirmar en la model card) |
| Parametros totales | 30.532.122.624 |
| Parametros activos | No disponible (el sufijo "a3b" sugiere ~3B, sin confirmar) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base original esta en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. El nombre "30b-a3b" sigue la convencion habitual de los modelos de mezcla de expertos (MoE) en la que se indica el total de parametros (30B) y los parametros activos por token (3B), pero la model card del repositorio GGUF no confirma explicitamente esta arquitectura ni detalla el numero de expertos, la estrategia de enrutamiento ni el tipo de atencion empleado.

Respecto al entrenamiento, el sufijo "-sft" indica que el modelo ha pasado por un ajuste fino supervisado, presumiblemente sobre datos de terminal y codigo, partiendo de un modelo base no identificado en la informacion disponible. No se especifican el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. Las cuantizaciones de este repositorio son estaticas (no ponderadas ni imatrix), segun indica el propio autor, que senala que las versiones con imatrix no estaban disponibles en el momento de la publicacion.

## Capacidades

- Generacion de texto y codigo orientada a tareas de terminal y shell, segun la denominacion "Terminal" del modelo.
- Ajuste fino supervisado (SFT) para seguir instrucciones en el dominio de linea de comandos.
- Conversacion multi-turno (tag "conversational" en el repositorio).
- Compatibilidad con endpoints de inferencia (tag "endpoints_compatible").
- Capacidades multilingues limitadas al ingles segun el campo de idiomas declarado.
- No se documentan capacidades de vision, audio, tool calling explicito ni modo de razonamiento extendido (thinking mode) en la informacion disponible.

## Casos de uso

- Asistencia interactiva en terminal: el modelo puede generar y explicar comandos de shell a partir de descripciones en lenguaje natural, integrandose en asistentes CLI que ayuden a desarrolladores a construir pipelines de comandos complejos.
- Automatizacion de scripts de administracion de sistemas: dado su ajuste especifico en terminal, resulta adecuado para generar scripts de bash, gestion de ficheros y tareas de mantenimiento en servidores.
- Agentes de codificacion en local: al distribuirse en GGUF con cuantizaciones desde 11,4 GB, puede ejecutarse en estaciones de trabajo sin GPU dedicada de gama alta, permitiendo agentes de codigo que operan sobre el sistema de ficheros local sin enviar datos a la nube.
- Entornos con requisitos de privacidad: la licencia MIT y la posibilidad de ejecucion totalmente local lo hacen apto para empresas que no pueden enviar codigo o comandos a APIs externas.
- Educacion y formacion en linea de comandos: puede emplearse como tutor que explica comandos y corrige errores en tiempo real en cursos de administracion de sistemas, ejecutandose en hardware modesto.
- Prototipado rapido de herramientas DevOps: integrable en pipelines de CI/CD o en utilidades internas que necesiten interpretar salidas de terminal y proponer correcciones, gracias a su formato GGUF compatible con llama.cpp y servidores de inferencia ligeros.
- Investigacion sobre modelos especializados: sirve como punto de partida para experimentos de ajuste fino adicional o evaluacion de cuantizaciones en tareas de codigo y terminal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (el modelo completo en Q8_0 ocupa 32,6 GB; en Q4_K_M, 18,7 GB; en Q2_K, 11,4 GB). A estas cifras hay que sumar el espacio para el contexto KV, que depende de la longitud de contexto configurada (no documentada).
- GPU recomendadas: para Q8_0, una A100 40 GB o H100; para Q4_K_M, una RTX 4090 (24 GB) o A6000 (48 GB) con margen; para Q2_K o Q3_K_S, una RTX 3090/4090 o incluso GPUs de 12-16 GB con offloading parcial.
- Cabe en GPU de consumo: si, en cuantizaciones Q2_K a Q4_K_M en tarjetas de 12-24 GB; las cuantizaciones Q5 y Q6 requieren 24 GB o mas; Q8_0 requiere GPU profesional o ejecucion parcial en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF; el tag "endpoints_compatible" sugiere compatibilidad con servidores de inferencia tipo endpoint OpenAI.
- Latencia y throughput: no disponibles en la informacion proporcionada; al tratarse de una arquitectura presumiblemente MoE con ~3B activos, el throughput deberia ser superior al de un modelo denso de 30B, pero no se aportan cifras.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones completas de modelos alternativos que permitan una comparacion rigurosa. Como referencia estructural, podria compararse con otros modelos de codigo de ~30B en formato GGUF (por ejemplo, variantes de Qwen2.5-Coder-32B o DeepSeek-Coder-33B), pero no se dispone de datos verificados en esta ficha para establecer dicha comparacion.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse presumiblemente sobre datos de codigo y terminal, puede heredar sesgos de esos corpus (por ejemplo, sesgo hacia entornos Linux y herramientas concretas).
- Riesgo de alucinacion: como todo modelo generativo, puede producir comandos sintacticamente validos pero peligrosos o incorrectos; en dominios de terminal el riesgo es especialmente alto (comandos destructivos como `rm -rf`), por lo que se recomienda supervision humana.
- Limitaciones de contexto o idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta garantizado. La longitud de contexto no esta documentada.
- Restricciones de licencia: licencia MIT, que permite uso comercial sin restricciones significativas, si bien se recomienda verificar la licencia del modelo base original (Lite-Coder/LiteCoder-Terminal-30b-a3b-sft).
- Caveats para produccion: las cuantizaciones son estaticas y no imatrix, lo que puede implicar una perdida de calidad algo mayor en los niveles bajos (Q2_K, Q3_K_S) frente a alternativas ponderadas; el autor no garantiza la disponibilidad futura de versiones imatrix. Ademas, el repositorio pesa 208,1 GB en total, por lo que la descarga completa es costosa y conviene seleccionar solo la cuantizacion necesaria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/LiteCoder-Terminal-30b-a3b-sft-GGUF
- Modelo base: https://huggingface.co/Lite-Coder/LiteCoder-Terminal-30b-a3b-sft
- Pagina de descargas del autor: https://hf.tst.eu/model#LiteCoder-Terminal-30b-a3b-sft-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
