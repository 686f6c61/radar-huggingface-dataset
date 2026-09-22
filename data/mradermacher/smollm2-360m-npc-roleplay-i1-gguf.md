# mradermacher/SmolLM2-360M-NPC-Roleplay-i1-GGUF

## Resumen

SmolLM2-360M-NPC-Roleplay-i1-GGUF es la version cuantizada en formato GGUF del modelo thealper2/SmolLM2-360M-NPC-Roleplay, un ajuste fino de SmolLM2-360M especializado en interpretacion de personajes (roleplay) y en dialogo de NPC (personajes no jugadores) para videojuegos y aplicaciones conversacionales. La conversion la firma mradermacher, autor habitual de versiones GGUF con calibracion imatrix para llama.cpp y derivados.

El modelo parte de SmolLM2-360M, un transformer decoder-only de 361.821.120 parametros entrenado principalmente en ingles, y se ha adaptado mediante LoRA y SFT con la libreria TRL sobre el dataset chimbiwide/NPC-Dialogue_v2. El resultado es un modelo muy compacto (entre 0,3 y 0,5 GB por cuantizacion) que prioriza el registro conversacional de personaje sobre capacidades generales de razonamiento o conocimiento factual.

Su relevancia practica es la de un componente de inferencia local y de coste casi nulo: cabe en cualquier GPU de consumo, en CPU e incluso en dispositivos de gama baja, lo que permite desplegar dialogos de NPC sin depender de APIs externas. La licencia Apache 2.0 facilita la integracion comercial, aunque el unico idioma declarado es el ingles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia SmolLM2, derivada del diseno Llama) |
| Parametros totales | 361.821.120 (dato real de los pesos safetensors del modelo base) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no confirmada en la informacion disponible; el modelo base declara heredar la configuracion de SmolLM2-360M (8.192 tokens) |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_S, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_1, i1-Q4_K_S, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, ademas de fichero imatrix para generar cuantizaciones propias |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (conversion desde safetensors del modelo base, convert_type: hf) |
| Tamano del repositorio | 5,7 GB (suma de todas las cuantizaciones publicadas) |
| Tamano por cuantizacion | 0,3 GB (IQ1/IQ2/IQ3) a 0,5 GB (Q6_K) |
| Modelo base | thealper2/SmolLM2-360M-NPC-Roleplay |
| Dataset de ajuste | chimbiwide/NPC-Dialogue_v2 |
| Metodo de ajuste | LoRA + SFT con TRL |
| Libreria declarada | transformers |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de SmolLM2-360M: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y atencion con consultas agrupadas (GQA), disenado para inferencia eficiente en dispositivos con recursos limitados. No hay componentes MoE, SSM ni hibridos: es un modelo denso de 362M de parametros. Esta ficha corresponde a la conversion a GGUF, no a un reentrenamiento, por lo que la arquitectura es identica a la del modelo original.

El ajuste se realizo mediante LoRA y SFT con la libreria TRL sobre el dataset chimbiwide/NPC-Dialogue_v2, orientado a dialogos de personajes. La model card no documenta el numero de tokens de entrenamiento, la composicion detallada del dataset, ni el uso de RLHF, DPO u otras tecnicas de alineacion posteriores. Tampoco se documentan innovaciones de decodificacion (decodificacion especulativa, atencion lineal, etc.). La aportacion especifica de esta publicacion es la cuantizacion con calibracion imatrix, que produce variantes IQ con mejor relacion tamano/calidad que las cuantizaciones estaticas equivalentes.

## Capacidades

- Generacion de texto conversacional en ingles con registro de personaje (roleplay) y mantenimiento de una personalidad definida por el prompt de sistema.
- Dialogo multi-turno orientado a NPC: respuestas cortas y en personaje, adecuadas para arboles de conversacion de videojuegos.
- Formato conversacional (etiqueta "conversational"), compatible con plantillas de chat de llama.cpp y de la libreria transformers.
- Inferencia muy rapida y de bajo consumo, incluso en CPU.
- Ejecucion local sin dependencia de red, lo que evita enviar dialogos a servicios externos.
- No hay soporte documentado de tool calling ni de function calling.
- No hay soporte documentado de agentes, multi-step reasoning ni modo "thinking".
- No dispone de capacidades multimodales (ni vision ni audio).
- Rendimiento multilingue no documentado y no previsto: el unico idioma declarado es el ingles.

## Casos de uso

- Dialogo de NPC en videojuegos indie: el modelo puede generar respuestas en personaje para decenas o cientos de NPC simultaneos ejecutandose en local; su tamano de 0,3-0,5 GB permite instanciar varias copias o cambiar de personaje con un simple cambio de prompt de sistema.
- Prototipado rapido en Unity o Unreal: mediante bindings de llama.cpp (llama-cpp-python, LLamaSharp, gpt4all) se puede integrar un NPC conversacional sin coste de API y sin depender de conectividad del jugador.
- Guionizacion asistida por lotes: generar variaciones de lineas de dialogo para un personaje concreto de forma masiva y offline, filtrando despues por criterios de estilo, para alimentar un guion o un arbol de dialogos.
- Chatbots de personaje en demos web o aplicaciones de escritorio: el modelo cabe en el navegador via WebGPU (llama.cpp WASM) o en un binario de escritorio, lo que permite demos publicas sin coste de servidor.
- Instalaciones interactivas y museos: personajes historicos o tematicos que responden en local en hardware barato (mini-PC o Raspberry Pi 5), con latencia aceptable y sin conexion a internet.
- Evaluacion de pipelines de cuantizacion: al ser un modelo diminuto con versiones imatrix y estaticas, sirve como banco de pruebas para medir el impacto de IQ2/IQ3/IQ4 en la coherencia conversacional antes de aplicar la misma receta a modelos mayores.
- Testing de prompt engineering para roleplay: permite iterar rapidamente sobre prompts de sistema, temperaturas y tecnicas de anclaje de personaje a un coste computacional minimo.
- Educacion y talleres de IA local: ejemplo practico de ajuste LoRA y de cuantizacion GGUF que se ejecuta en el portatil de cualquier asistente a un taller.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluacion de roleplay, y los resultados de busqueda web no aportan datos tecnicos sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB con cualquiera de las cuantizaciones publicadas (0,3-0,5 GB de pesos) mas el overhead de contexto y memoria de trabajo; en la practica, un presupuesto de 1-2 GB de VRAM es suficiente incluso con contexto largo.
- GPU recomendadas: cualquier GPU con mas de 2 GB de VRAM sirve. No se necesita A100, H100 ni RTX 4090. Funciona con RTX 3060/4060, GTX 1650, GPUs integradas modernas (iGPU Intel Iris Xe, AMD Radeon 780M) e incluso con aceleracion por CPU.
- Compatibilidad con GPU de consumo: si, es uno de los perfiles mas ligeros posibles; tambien es viable en CPU pura, en Raspberry Pi 5 y en telefonos de gama media-alta mediante llama.cpp.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, koboldcpp, llama-cpp-python, LLamaSharp, bindings WASM/WebGPU. vLLM no es la via habitual para GGUF; si se busca servidor de alto rendimiento conviene partir de los safetensors del modelo base con TGI o vLLM en lugar de la version GGUF.
- Latencia y throughput estimados: no hay mediciones publicadas para este modelo concreto. Como referencia de orden de magnitud para 362M de parametros en formato GGUF, cabe esperar cientos de tokens por segundo en GPU de consumo y decenas de tokens por segundo en CPU moderna con cuantizaciones Q4, aunque estas cifras son estimaciones y no datos medidos del repositorio.

## Comparativa con modelos similares

Los datos del modelo analizado proceden de la informacion facilitada; los de los modelos de referencia son especificaciones publicas de sus respectivas familias y no se han verificado contra este repositorio.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolLM2-360M-NPC-Roleplay (esta ficha, GGUF) | 361.821.120 | no confirmado (heredado de SmolLM2-360M) | Roleplay / dialogo de NPC, solo ingles | apache-2.0 | GGUF en 25 cuantizaciones |
| SmolLM2-360M-Instruct | ~362M | 8.192 tokens (familia SmolLM2) | Instrucciones generales, multilingue parcial | apache-2.0 | safetensors y GGUF de terceros |
| Qwen2.5-0.5B-Instruct | ~494M | 32.768 tokens | Instrucciones generales, multilingue amplio | apache-2.0 | safetensors y GGUF de terceros |
| TinyLlama-1.1B-Chat | ~1.100M | 2.048 tokens | Chat general | apache-2.0 | safetensors y GGUF de terceros |

Frente a estas alternativas, el modelo de esta ficha sacrifica amplitud de conocimiento y cobertura de idiomas a cambio de especializacion en registro de personaje y de un tamano minimo. Si el objetivo es razonamiento general o multilingue, Qwen2.5-0.5B-Instruct es una opcion mas equilibrada; si el objetivo es exclusivamente roleplay en ingles con el minimo coste por token, este ajuste resulta mas adecuado, siempre que se acepte su menor cobertura de conocimiento.

## Limitaciones y advertencias

- Solo ingles: no hay soporte declarado para castellano ni para ningun otro idioma, por lo que su uso en productos en espanol requeriria un ajuste adicional.
- Tamano muy reducido: con 362M de parametros y un ajuste especifico de roleplay, el conocimiento factual es limitado y la tasa de alucinacion en preguntas abiertas es alta. No debe usarse como fuente de informacion.
- Degradacion en cuantizaciones agresivas: las variantes IQ1 e IQ2 estan marcadas por el propio autor como "for the desperate" o "mostly desperate" y afectan seriamente a la coherencia del texto.
- Coherencia en conversaciones largas: no hay evidencia publicada sobre el mantenimiento del personaje mas alla de unos pocos turnos; es previsible deriva de personalidad y repeticion.
- Sin tool calling ni function calling documentados: no es apto para pipelines de agentes que requieran llamadas a herramientas.
- Sesgos: el modelo se ha ajustado sobre chimbiwide/NPC-Dialogue_v2, un corpus de dialogos de personajes cuyo contenido y sesgos no estan documentados en la model card. Es esperable reproducir estereotipos presentes en ese corpus.
- Contenido inapropiado: un modelo de roleplay sin filtros documentados puede generar respuestas violentas, sesgadas o no aptas para todos los publicos; requiere moderacion en produccion.
- Trazabilidad: esta publicacion es una conversion de terceros, no validada por el autor del ajuste original; no se incluyen evaluaciones de calidad comparando cuantizaciones.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin issues ni informes de uso en produccion.
- Licencia: apache-2.0 en el repositorio de cuantizacion, lo que en principio permite uso comercial, pero conviene verificar la licencia del dataset chimbiwide/NPC-Dialogue_v2 y del modelo base antes de distribuir un producto derivado.
- Repositorio pesado: 5,7 GB en total por incluir aproximadamente 25 variantes; conviene descargar unicamente el fichero GGUF necesario.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/SmolLM2-360M-NPC-Roleplay-i1-GGUF
- Modelo base ajustado: https://huggingface.co/thealper2/SmolLM2-360M-NPC-Roleplay
- Pagina de resumen y descargas del cuantizador para este modelo: https://hf.tst.eu/model#SmolLM2-360M-NPC-Roleplay-i1-GGUF
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/SmolLM2-360M-NPC-Roleplay-GGUF
- Dataset de ajuste: https://huggingface.co/datasets/chimbiwide/NPC-Dialogue_v2
- README de referencia sobre uso de ficheros GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de perplejidad entre tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Resultados de busqueda web: no se ha encontrado informacion tecnica relevante sobre este modelo; los resultados devueltos corresponden a paginas de ayuda de Google Fotos y no guardan relacion con el modelo.
