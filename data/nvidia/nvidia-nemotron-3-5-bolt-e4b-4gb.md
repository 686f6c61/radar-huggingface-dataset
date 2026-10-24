# nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB

## Resumen

NVIDIA-Nemotron-3.5-Bolt-E4B-4GB es un modelo de lenguaje pequeno (SLM) publicado por NVIDIA como parte de la familia Nemotron. Se obtiene mediante un post-entrenamiento adicional sobre Gemma-4-E4B-it, el modelo conversacional de Google, y se distribuye ya cuantizado en Q4_K_M dentro de un unico archivo GGUF de aproximadamente 4 GB, lo que permite ejecutarlo en memoria muy reducida. El model card declara 8B de parametros totales con 4B efectivos, mientras que los safetensors del repositorio registran 7.518.069.290 parametros totales.

El objetivo del modelo es distinto al de un LLM generalista de gran tamano: esta optimizado para asistentes de voz y de dispositivo, personas interactivas e interfaces embebidas o de borde, con enfasis en baja latencia hasta el primer token (TTFT) y en dejar memoria libre para el resto de la aplicacion. Frente a su modelo de partida, NVIDIA declara mejoras en uso de herramientas multi-turno, seguimiento de instrucciones y anclaje de la entrada (input grounding).

Es relevante ahora por tres motivos: la licencia OpenMDW 1.1 permite uso comercial y no comercial, el modelo expone modos de razonamiento y conversacional controlables desde la plantilla de chat, y se acompana de un drafter DFlash para decodificacion especulativa sobre llama.cpp, lo que lo convierte en una pieza directamente desplegable en entornos locales con GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma-4-E4B (heredada de Gemma-4-E4B-it) |
| Parametros totales | 7.518.069.290 (~7,5B) segun safetensors; el model card declara 8B |
| Parametros activos | ~4B efectivos (unico dato del model card; no se detalla el mecanismo de sparseidad) |
| Longitud de contexto | Entrada: hasta 64K tokens. Salida: hasta 64K tokens |
| Tipos de cuantizacion | Q4_K_M (este repositorio, GGUF); BF16 en el repositorio base. No se documentan otras |
| Idiomas soportados | 34 idiomas: en, ar, bg, cs, da, de, el, es, et, fi, fr, hi, hr, hu, id, it, ja, ko, lt, lv, nl, no, pl, pt, ro, ru, sk, sl, sv, th, tr, uk, vi, zh |
| Licencia | OpenMDW 1.1 (openmdw-1.1) |
| Formato de pesos | GGUF (Q4_K_M) en este repositorio; safetensors BF16 en el repositorio base |
| Precision de distribucion | Q4_K_M |
| Entradas / salidas | Texto / texto |
| Modo de razonamiento | Controlado por plantilla de chat (`enable_thinking=True/False`) y presupuesto de razonamiento en tiempo de ejecucion |
| Modo conversacional | Controlado por plantilla de chat (`conversational_mode=True/False`) |
| Muestreo recomendado | Temperatura 1.0, top_p 0.95 en ambos modos de razonamiento |
| Desarrollador | NVIDIA Corporation |
| Modelo base | nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 (a su vez post-entrenado desde google/gemma-4-E4B-it) |
| Fecha de los datos de post-entrenamiento | Corte en mayo de 2026; ventana de desarrollo diciembre de 2025 - mayo de 2026 |
| Tamano del repositorio | 12,4 GB |
| Descargas / likes | 213 descargas, 53 likes (en el momento de la consulta) |

## Arquitectura y entrenamiento

La arquitectura es la de Gemma-4-E4B, tomada del modelo Gemma-4-E4B-it y sometida a un post-entrenamiento adicional por NVIDIA. El model card declara 8B de parametros totales con 4B efectivos, lo que implica computo condicional o activacion dispersa, pero no se especifica en la informacion disponible si se trata de un MoE clasico, de una variante MatFormer u otra forma de sparseidad, ni el numero de expertos, la proporcion de activacion por token o el tipo de atencion empleado. Tampoco se detalla la composicion exacta de las capas ni el vocabulario.

En cuanto a datos, el modelo referencia los conjuntos nvidia/nemotron-pre-training-datasets y nvidia/nemotron-post-training-v3, con fecha de corte de mayo de 2026 para el post-entrenamiento. No se indican en la informacion disponible el numero de tokens de entrenamiento, la mezcla de dominios, ni si se aplicaron tecnicas concretas de alineacion como RLHF o DPO. Las innovaciones tecnicas documentadas por el autor son de inferencia mas que de entrenamiento: soporte de decodificacion especulativa mediante un drafter dedicado (DFlash, con `--spec-type draft-dflash` y hasta 7 tokens de borrador), modo de razonamiento con presupuesto configurable en tiempo de ejecucion y modo conversacional alternable desde la plantilla de chat.

## Capacidades

- Generacion de texto conversacional multi-turno, con contexto de entrada de hasta 64K tokens.
- Razonamiento explicito activable o desactivable mediante `enable_thinking` y acotable con un presupuesto de razonamiento en tiempo de ejecucion.
- Uso de herramientas multi-turno (tool use), capacidad que NVIDIA declara mejorada respecto al modelo de partida.
- Seguimiento de instrucciones y anclaje de la entrada (input grounding), orientados a asistentes que deben ceñirse a informacion proporcionada.
- Modo conversacional dedicado (`conversational_mode`) para dialogos orientados a persona o asistente.
- Capacidades multilingues declaradas en 34 idiomas, incluidos espanol, ingles, aleman, frances, italiano, portugues, arabe, hindi, japones, coreano y chino.
- Integracion con servidores compatibles con la API de chat completions de OpenAI (tag `endpoints_compatible`), ademas de plantilla Jinja para llama.cpp.
- No se documentan capacidades de vision, audio, generacion de imagenes ni otros modalidades distintas de texto.

## Casos de uso

- Asistente de voz local en dispositivo: el modelo puede mantener el bucle conversacional de un asistente de voz en hardware de consumo gracias a sus ~4 GB de pesos en Q4_K_M y a su orientacion a bajo TTFT, dejando VRAM libre para el reconocimiento y la sintesis de voz.
- Interfaces embebidas y de borde: robots sociales, altavoces o paneles interactivos que necesitan respuestas con latencia baja y sin depender de la nube; el model card ilustra este escenario con un demo sobre un dispositivo tipo Reachy.
- Personas interactivas y personajes: el modo conversacional y la ventana de 64K permiten sostener un personaje con memoria de conversacion larga y multiples turnos sin reencuadrar el contexto constantemente.
- Agentes con herramientas en local: al soportar tool calling multi-turno, el modelo puede encadenar llamadas a funciones (calendario, domotica, busqueda interna) dentro de un flujo de agente ejecutado en el propio dispositivo.
- Enrutado y preprocesado en pipelines multi-modelo: su bajo consumo de memoria permite usarlo como primer escalon (clasificacion de intencion, resumen, reescritura de consultas) antes de derivar a un modelo mayor alojado en servidor.
- Despliegue con API compatible con OpenAI en una estacion de trabajo: mediante el servidor de llama.cpp en Docker con `--jinja` y `-c 65536`, se puede exponer un endpoint `/v1/chat/completions` para prototipos y pruebas de integracion.
- Generacion asistida en local con decodificacion especulativa: combinando el modelo con el drafter DFlash se puede reducir la latencia de generacion en aplicaciones interactivas donde cada token cuenta, como dictado o subtitulado asistido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model card proporcionado no incluye tablas de MMLU, HumanEval, GSM8K, MT-Bench ni evaluaciones de tool calling, y los resultados de busqueda web obtenidos no contienen datos de evaluacion del modelo. Tampoco se aportan cifras de latencia, TTFT ni throughput, mas alla de la afirmacion cualitativa de que el modelo esta disenado para operar con baja latencia hasta el primer token.

## Requisitos de hardware

- VRAM para inferencia: los pesos en Q4_K_M ocupan aproximadamente 4 GB (el nombre del repositorio hace referencia explicita a 4 GB y el archivo se distribuye en esa cuantizacion). A esa cifra hay que sumar la cache KV, que crece con el contexto y se vuelve significativa al acercarse a los 64K tokens; no se dispone de la cifra exacta de cache por token.
- GPU de consumo: cabe en tarjetas con 8 GB o mas de VRAM (gama RTX 3060/4060 y superiores) para contextos moderados. Para explotar la ventana completa de 64K conviene subir a 12-16 GB. El modelo esta posicionado por NVIDIA para interfaces embebidas y de borde, aunque no se enumeran dispositivos concretos validados.
- GPU de datacenter: A100, H100 o L4 no son necesarias para el modelo en esta cuantizacion, pero permiten servirlo con contextos largos y varios usuarios concurrentes en llama.cpp.
- Opciones de despliegue documentadas: llama.cpp (imagen `ghcr.io/ggml-org/llama.cpp:server-cuda13-b11459` con `-ngl 999`, `--jinja` y `-c 65536`), con soporte opcional de decodificacion especulativa mediante el drafter DFlash (`--spec-draft-model`, `--spec-type draft-dflash`, `--spec-draft-n-max 7`). El model card etiqueta la receta de llama.cpp como pendiente ("recipe pending"), aunque incluye comandos funcionales.
- Formatos alternativos: vLLM, TGI u Ollama no se mencionan en la informacion disponible; al ser un GGUF, seria tecnicamente integrable en runners compatibles, pero sin receta oficial publicada.
- Latencia y throughput: no disponibles. El autor solo declara de forma cualitativa un TTFT bajo y la existencia del drafter para reducir latencia adicional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Bolt-E4B-4GB | 7,5B totales / ~4B efectivos | 64K entrada, 64K salida | Q4_K_M (GGUF) | OpenMDW 1.1 | HuggingFace, llama.cpp |
| NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 | 7,5B totales / ~4B efectivos | No disponible en la informacion | BF16 (safetensors) | OpenMDW 1.1 | HuggingFace |
| Gemma-4-E4B-it (modelo de partida) | Misma familia; cifra exacta no disponible | No disponible en la informacion | No disponible | No disponible en la informacion | HuggingFace (google) |
| Otros SLM de 4-8B (Qwen, Llama, Phi) | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparacion relevante que si se puede sostener con los datos aportados es con el modelo de partida y con la variante BF16: Bolt anade post-entrenamiento de NVIDIA sobre tool calling multi-turno, seguimiento de instrucciones y grounding, y se publica ya cuantizado para consumo bajo de memoria, mientras que la version BF16 preserva la precision completa. No se dispone de datos de rendimiento comparado frente a otros SLM de la misma franja.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo en la informacion disponible. Al derivar de Gemma-4-E4B-it y de los datos de post-entrenamiento de NVIDIA, es esperable heredar los sesgos de ambas fuentes, pero no se cuantifican.
- Riesgo de alucinacion: como cualquier modelo generativo de este tamano, puede producir informacion incorrecta con apariencia de veracidad, especialmente en modos de razonamiento largo. El enfasis declarado en input grounding mitiga, pero no elimina, este riesgo.
- La cuantizacion Q4_K_M introduce perdida de precision respecto a BF16; para tareas sensibles conviene validar contra la version BF16 antes de desplegar.
- El modo de razonamiento anade tokens de salida y por tanto latencia; en asistentes de voz en tiempo real puede requerir desactivarlo o limitar el presupuesto de razonamiento.
- Cobertura multilingue: se declaran 34 idiomas, pero no se aporta ninguna evaluacion por idioma; el rendimiento real en idiomas distintos del ingles no esta cuantificado.
- Fecha de corte de datos en mayo de 2026: el modelo no conoce hechos posteriores.
- Licencia OpenMDW 1.1: el model card afirma que el modelo esta listo para uso comercial y no comercial, pero la licencia incluye terminos y obligaciones que deben revisarse antes de un despliegue en produccion.
- La receta de despliegue en llama.cpp figura como pendiente en el propio model card, y no se documentan rutas oficiales para vLLM, TGI u Ollama.
- La ventana de 64K es de entrada y de salida, pero no se detalla el comportamiento de la calidad en contextos muy largos ni el coste exacto de cache KV.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Drafter DFlash para decodificacion especulativa: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-DFlash
- Informe tecnico (PDF): https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-Technical-Report.pdf
- Blog del modelo: https://research.nvidia.com/labs/nemotron/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB/
- Pagina de desarrollador de Nemotron: https://developer.nvidia.com/nemotron
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Texto de la licencia OpenMDW 1.1 en GitHub: https://github.com/OpenMDW/OpenMDW/blob/main/1.1/LICENSE.OpenMDW-1.1
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
- arXiv: https://arxiv.org/abs/2509.04292
- Modelo de partida: https://huggingface.co/google/gemma-4-E4B-it
