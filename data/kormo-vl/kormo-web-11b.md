# KORMo-VL/KORMo-Web-11B

## Resumen

KORMo-Web-11B es un modelo multimodal de tipo image-text-to-text desarrollado por KAIST MLP Lab (publicado bajo la organizacion KORMo-VL) que combina tres capacidades en un unico modelo: razonamiento como LLM, comprension visual como VLM y actuacion como agente GUI sobre navegador web. Se construye sobre la familia fundacional propia de KORMo, partiendo del LLM KORMo-10B entrenado desde cero con un tokenizador optimizado para coreano, y extendiendolo mediante KORMo-VL (encoder visual SigLIP + backbone KORMo) hasta convertirlo en un agente web. A diferencia de sus hermanos KORMo-Web-4B y 9B, que se basan en Qwen y priorizan el rendimiento en tareas web, esta variante de 11B busca preservar las capacidades generales de lenguaje y vision mientras anade la interaccion GUI.

El modelo cuenta con 11.191.119.728 parametros totales (aproximadamente 11B) y un repositorio de 22,5 GB en formato safetensors. Se distribuye bajo licencia Apache-2.0, lo que permite uso comercial, modificacion y redistribucion. Soporta coreano e ingles, y su modo de razonamiento interno (bloque Think) esta disenado para operar en coreano, lo que lo convierte en una propuesta poco habitual dentro del ecosistema de agentes web, dominado por modelos anglofonos.

Su relevancia actual radica en que cubre un nicho especifico: agentes de navegador bilingues coreano-ingles con licencia permisiva y pesos abiertos. El entrenamiento incluye mas de 10 millones de muestras de preentrenamiento web atomico y mas de 100.000 trayectorias de interaccion web, lo que lo posiciona como una alternativa open-weight a agentes propietarios en tareas de automatizacion de navegador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (LLM KORMo-10B + encoder visual SigLIP), familia llava_onevision |
| Parametros totales | 11.191.119.728 (aproximadamente 11B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

KORMo-Web-11B sigue una arquitectura multimodal de tipo LLaVA-OneVision: un encoder visual SigLIP acoplado a un backbone de lenguaje KORMo. El backbone procede de KORMo-10B, un LLM entrenado desde cero por KAIST MLP Lab con un tokenizador optimizado para coreano, que posteriormente se extendio a KORMo-VL anadiendo comprension visual. Sobre esa base, el modelo se entrena como agente web en tres etapas: lenguaje, vision y agente. El pipeline de entrenamiento incluye mas de 10 millones de muestras de preentrenamiento web atomico en coreano e ingles (que cubren localizacion, semantica, estructura, funcion y estado de elementos de interfaz) y mas de 100.000 trayectorias de uso real de navegador bilingues para aprender tareas web de multiples pasos.

Una innovacion destacable es el modo de razonamiento explicito (bloque Think) que, segun el autor, se realiza en coreano, algo inusual en modelos de agente web. No se especifica en la informacion disponible el numero total de tokens de entrenamiento del LLM base, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO. Tampoco se detalla la longitud de contexto soportada ni innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y razonamiento general en coreano e ingles como LLM.
- Comprension de imagenes y texto (VLM) para interpretar capturas de pantalla y contenido visual.
- Actuacion como agente GUI sobre navegador web: localizacion de elementos de interfaz, comprension de layouts y ejecucion de acciones.
- Razonamiento multi-paso para completar tareas web complejas a partir de trayectorias de interaccion.
- Modo de razonamiento interno (Think) realizado en coreano.
- Capacidades bilingues coreano-ingles en las tres modalidades (texto, vision, agente).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de codigo, matematicas o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Automatizacion de tareas de navegador en coreano: el modelo puede interpretar la pagina visualmente y ejecutar acciones multi-paso, lo que resulta adecuado para empresas coreanas que necesitan agentes sobre portales locales donde los modelos anglofonos rinden peor (30,1 % de exito en tareas coreanas frente a 20,2 % del mejor baseline abierto listado).
- Rellenado de formularios y tramites administrativos online: gracias a su preentrenamiento atomico sobre elementos de interfaz (posicion, funcion, estado), puede localizar campos y controles en paginas complejas y completar flujos guiados.
- Extraccion de informacion de paginas web con contenido visual: al combinar VLM y LLM, puede leer capturas de pantalla, tablas e imagenes y resumir o estructurar la informacion en texto.
- Asistente de accesibilidad web: puede describir y operar interfaces en coreano e ingles para usuarios con dificultades motoras o visuales, actuando como capa de interaccion por lenguaje natural.
- Testing automatizado de aplicaciones web: el modelo puede recorrer flujos de usuario y verificar estados de la interfaz, integrandose en pipelines de QA que necesiten validacion visual ademas de DOM.
- Atencion al cliente con soporte de navegacion: combinando sus capacidades LLM y de agente, puede responder consultas y, cuando sea necesario, realizar acciones en el navegador en nombre del usuario (por ejemplo, consultar el estado de un pedido en un portal).
- Investigacion en agentes GUI bilingues: al ser Apache-2.0 y con pesos abiertos, sirve como base para fine-tuning y experimentacion academica en tareas de computer-use en coreano.

## Benchmarks y rendimiento

Evaluacion sobre 612 tareas de sitios web en vivo (300 en ingles, 312 en coreano) de Online-Mind2Web, con el mismo juez LLM para todos los modelos. Tasas de exito (SR) calculadas sobre el conjunto completo de tareas.

| Modelo | Tamano | SR ingles (%) | SR coreano (%) |
|---|---:|---:|---:|
| Qwen3.5-9B (base) | 9B | 24,7 | 16,7 |
| Fara-1.5-4B | 4B | 20,7 | 7,7 |
| UI-TARS-1.5-7B | 7B | 22,3 | 20,2 |
| OpenWebRL-4B | 4B | 32,7 | 15,4 |
| KORMo-Web-11B (propio) | 11B | 29,0 | 30,1 |
| GPT-6-luna (propietario) | no disponible | 63,0 | 65,7 |

KORMo-Web-11B alcanza un 30,1 % de exito en tareas coreanas, 9,9 puntos porcentuales por encima del mejor baseline abierto no KORMo listado. En ingles obtiene un 29,0 %, por debajo de OpenWebRL-4B (32,7 %) pero por encima del resto de baselines abiertos. No se han publicado en la informacion disponible resultados de benchmarks generales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (bf16/fp16): aproximadamente 22,4 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 24-32 GB de VRAM.
- VRAM estimada con cuantizacion a 8 bits: aproximadamente 11-12 GB de pesos; a 4 bits: aproximadamente 6-7 GB de pesos (estimaciones teoricas a partir del numero de parametros, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en produccion; RTX 4090 (24 GB) puede alojar el modelo en bf16 de forma ajustada o con cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090 con cuantizacion o precision reducida; en GPUs de 16 GB (RTX 4080, 4060 Ti 16GB) solo con cuantizacion agresiva.
- Opciones de despliegue: transformers (libreria indicada en el modelo), con compatibilidad con endpoints; soporte especifico de vLLM, llama.cpp, Ollama o TGI no confirmado en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SR coreano (%) | SR ingles (%) | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| KORMo-Web-11B | 11B | no disponible | 30,1 | 29,0 | Apache-2.0 | Pesos abiertos en HF |
| UI-TARS-1.5-7B | 7B | no disponible | 20,2 | 22,3 | no disponible | Pesos abiertos |
| OpenWebRL-4B | 4B | no disponible | 15,4 | 32,7 | no disponible | Pesos abiertos |
| Fara-1.5-4B | 4B | no disponible | 7,7 | 20,7 | no disponible | Pesos abiertos |
| Qwen3.5-9B (base) | 9B | no disponible | 16,7 | 24,7 | no disponible | Pesos abiertos |

KORMo-Web-11B destaca en tareas coreanas frente a todos los baselines abiertos listados, mientras que en ingles queda por detras de OpenWebRL-4B pese a triplicar su tamano. Frente a GPT-6-luna (propietario) la brecha es amplia en ambos idiomas, lo que refleja la diferencia entre agentes abiertos de 11B y modelos frontera cerrados.

## Limitaciones y advertencias

- Las tasas de exito en tareas web son moderadas (29-30 %), por lo que no es adecuado para automatizacion desatendida de flujos criticos sin supervision humana.
- Riesgo de alucinacion en la interpretacion de interfaces y en la generacion de texto, como en cualquier LLM; en tareas de agente puede traducirse en acciones erroneas sobre la pagina.
- Cobertura limitada a coreano e ingles; no se declaran otros idiomas, lo que restringe su uso en entornos multilingues.
- No se especifica la longitud de contexto, lo que dificulta planificar tareas web con historiales largos o paginas muy extensas.
- Sesgos conocidos: no documentados explicitamente en la informacion disponible; cabe esperar sesgos derivados de los datos web de preentrenamiento en coreano e ingles.
- El modo de razonamiento en coreano puede penalizar el rendimiento en tareas puramente anglofonas frente a modelos especializados.
- Licencia Apache-2.0: permite uso comercial, modificacion y redistribucion, pero conviene revisar los terminos completos y las obligaciones de atribucion.
- Modelo con muy pocas descargas (2) y reciente (creado en noviembre de 2026), por lo que la validacion comunitaria es practicamente inexistente.
- El autor indica que sus modelos especializados KORMo-Web-4B y 9B logran mayor exito en tareas web; este 11B prioriza versatilidad sobre rendimiento web puro.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KORMo-VL/KORMo-Web-11B
- Modelo base KORMo-VL: https://huggingface.co/KORMo-VL/KORMo-VL
- LLM fundacional KORMo-10B: https://huggingface.co/KORMo-Team/KORMo-10B-sft
- Demo en video (alojado en el repositorio): https://huggingface.co/KORMo-VL/KORMo-Web-11B/resolve/main/assets/gui_final_demo_dubbed.mp4
- Paper, blog o repositorio adicionales: no disponible en la informacion proporcionada.
