# lmcfarlin/fara-9b-heretic-uncensored

## Resumen

Fara1.5-9B es un agente de uso de ordenador (computer use agent, CUA) multimodal especializado en navegadores web, desarrollado por Microsoft Research AI Frontiers. El modelo observa el navegador exclusivamente a traves de capturas de pantalla y actua emitiendo llamadas a herramientas estructuradas (click, type, scroll, visit URL, web search) para completar tareas de extremo a extremo. Esta construido sobre Qwen3.5-9B mediante supervision fine-tuning (SFT) con datos sinteticos generados por FaraGen1.5, un pipeline multiagente que sintetiza tareas web, ejecuta trayectorias y verifica resultados antes del entrenamiento.

La variante aqui descrita, `lmcfarlin/fara-9b-heretic-uncensored`, es una version "decensored" del modelo original generada con Heretic v2.1.0 mediante Arbitrary-Rank Ablation (ARA) aplicada entre las capas 15 y 21. Segun la model card, reduce los rechazos de 98/100 en el modelo original a 3/100, con una divergencia KL de 0.0315 respecto al original. El autor de esta variante es lmcfarlin y no Microsoft; conviene tenerlo en cuenta para cualquier uso en produccion.

El modelo cuenta con 9.409.813.744 parametros, una ventana de contexto de 262.144 tokens (suficiente para trayectorias con multiples capturas de pantalla e historial completo de acciones) y licencia MIT. Su relevancia actual radica en que aborda la automatizacion web end-to-end con percepcion unicamente visual (sin acceso al DOM ni al arbol de accesibilidad), lo que lo asemeja a la modalidad de entrada disponible para un usuario humano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM multimodal decoder-only (imagen + texto -> texto) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

Fara1.5-9B es un modelo de lenguaje multimodal decoder-only que acepta como entrada el objetivo del usuario en texto, capturas de pantalla del navegador y el historial previo de pensamientos y acciones del agente, y produce como salida un bloque de chain-of-thought seguido de un bloque de llamada a herramienta etiquetado en XML. La percepcion es exclusivamente visual: no consume DOM ni arbol de accesibilidad. Las acciones estan fundamentadas en coordenadas, es decir, el modelo predice directamente objetivos de click y arrastre a nivel de pixel, sin necesidad de un modelo de grounding separado.

El entrenamiento se realizo mediante SFT sobre Qwen3.5-9B con una mezcla de datos sinteticos generada por FaraGen1.5, el pipeline multiagente de Microsoft que sintetiza tareas web, ejecuta trayectorias para resolverlas y verifica los resultados antes de incorporarlos al entrenamiento. El periodo de entrenamiento documentado abarca de enero a abril de 2026, con un computo de 32 GPU NVIDIA B200 durante 4 dias, y la publicacion del modelo original data del 21 de mayo de 2026. La variante heretic aplica Arbitrary-Rank Ablation entre las capas 15 y 21 con los parametros documentados (preserve_good_behavior_weight 0.8526, steer_bad_behavior_weight 0.0003, overcorrect_relative_weight 0.9496, neighbor_count 7), lo que modifica el comportamiento de rechazo del modelo base.

## Capacidades

- Finalizacion de tareas web de extremo a extremo: rellenar formularios, hacer reservas, solicitar empleos, planificar viajes y gestionar carritos de compra, secuenciando acciones hacia un objetivo.
- Percepcion unicamente visual: opera sobre capturas de pantalla, sin acceso al DOM ni al arbol de accesibilidad.
- Acciones fundamentadas en coordenadas: prediccion directa de objetivos de click y arrastre a nivel de pixel, sin modelo de grounding adicional.
- Emision de llamadas a herramientas estructuradas: click, type, scroll, visit URL, web search y otras acciones de navegador, en bloques XML etiquetados.
- Razonamiento explicito: genera un bloque de chain-of-thought antes de cada llamada a herramienta.
- Seguridad en puntos criticos: entrenado para detenerse y solicitar confirmacion antes de introducir informacion personal, realizar pagos, enviar formularios, iniciar sesion o enviar mensajes.
- Contexto largo de 262.144 tokens para trayectorias con multiples capturas de pantalla e historial completo de acciones.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo "uncensored": la variante heretic reduce drasticamente los rechazos (3/100 frente a 98/100 del original), lo que afecta al comportamiento de seguridad descrito arriba.

## Casos de uso

- Automatizacion de tareas web repetitivas: el modelo puede rellenar formularios internos, descargar informes o navegar flujos administrativos paso a paso, secuenciando acciones a partir de capturas de pantalla y manteniendo el historial en su ventana de 262K tokens.
- Agente de reservas y compras: puede planificar y ejecutar reservas de vuelos, hoteles o restaurantes y gestionar carritos de compra, deteniendose en los puntos criticos (pago, confirmacion) para solicitar aprobacion al usuario.
- Investigacion web asistida: con la herramienta de busqueda web y la capacidad de visitar URLs, puede recopilar informacion de multiples paginas y sintetizarla, usando el contexto largo para mantener el hilo de una sesion extensa.
- Soporte en tareas de candidatura de empleo: rellenar solicitudes en portales de empleo, adjuntar documentos y navegar formularios multipagina, con paradas de confirmacion antes de enviar.
- Automatizacion de QA de interfaces web: al percibir solo mediante capturas de pantalla, puede utilizarse para validar flujos de usuario de extremo a extremo en un navegador real, detectando regresiones visuales y de interaccion.
- Despliegue en produccion con MagenticLite: integrado en el harness recomendado, con sandboxing en contenedor Docker, listas de dominios permitidos, modo vigilancia con trazas completas y pausa inmediata, adecuado para entornos corporativos con controles.
- Ejecucion en hardware unico: con 9B parametros en bf16 cabe en una sola A100, H100 o B200 con margen para el historial de capturas, lo que facilita prototipos y despliegues de investigacion.

## Benchmarks y rendimiento

| Metrica | Esta variante (heretic) | Modelo original |
|---|---|---|
| Rechazos | 3/100 | 98/100 |
| Divergencia KL | 0.0315 | 0 (por definicion) |

No se han publicado resultados de benchmarks de tareas (tipo WebArena, MMLU, HumanEval o GSM8K) en la informacion disponible. Los unicos datos numericos publicados corresponden a la evaluacion de la ablacion de rechazos y la divergencia KL frente al modelo original.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, aproximadamente 18-19 GB solo para pesos (el repositorio ocupa 18,9 GB); con cache KV para 262.144 tokens y hasta 10 imagenes por prompt, el consumo crece de forma significativa.
- GPU recomendadas: A6000, A100, H100 y B200 han sido probadas por el autor del modelo base. Una A100/H100 de 80 GB es la opcion comoda para contexto largo; B200 para mayor margen.
- Cabe en GPU de consumo: no de forma holgada en bf16 con contexto largo; seria necesaria cuantizacion (no documentada por el autor) y reduccion de contexto para acercarse a GPUs de 24 GB.
- Opciones de despliegue: vLLM (recomendado por el autor, con `--dtype bfloat16 --max-model-len 262144 --limit-mm-per-prompt image=10`), transformers >= 5.2.0, y el harness MagenticLite o la CLI de Microsoft Fara como entorno de ejecucion recomendado.
- Requisitos de software: torch >= 2.11.0, transformers >= 5.2.0, vllm >= 0.19.1.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fara1.5-9B (original, Microsoft) | 9B | 262.144 | CUA web, percepcion visual | MIT | Hugging Face (microsoft/Fara1.5-9B) |
| Esta variante (lmcfarlin/fara-9b-heretic-uncensored) | 9.409.813.744 | 262.144 | CUA web, sin rechazos | MIT | Hugging Face (lmcfarlin) |
| Alternativas CUA de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento de modelos comparables de la misma categoria (agentes de uso de ordenador) que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- La variante heretic elimina practicamente los rechazos (3/100), lo que degrada el diseno de seguridad en puntos criticos del modelo original: puede no detenerse ante introduccion de datos personales, pagos, envios o inicios de sesion.
- El autor del modelo base advierte explicitamente de no ejecutarlo con acceso irrestricto al navegador en una maquina con informacion sensible; esta advertencia es aun mas relevante en la variante sin censura.
- Solo soporta ingles; no hay capacidades multilingues documentadas.
- Riesgo de alucinacion en la interpretacion de capturas de pantalla y en la planificacion de acciones; la verificacion de resultados depende del harness.
- El conocimiento del modelo tiene corte en principios de 2026; requiere navegacion y busqueda web para informacion posterior.
- Esta variante no esta publicada por Microsoft y no cuenta con la validacion del equipo original; su comportamiento puede diferir del modelo de referencia en tareas distintas de la ablacion de rechazos.
- La licencia MIT permite uso comercial, pero la ausencia de salvaguardas de rechazo traslada al integrador toda la responsabilidad sobre el uso.
- No se documentan cuantizaciones oficiales, lo que limita el despliegue en hardware de consumo.
- No hay resultados de benchmarks de tareas publicados para esta variante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lmcfarlin/fara-9b-heretic-uncensored
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo original Fara1.5-9B: https://huggingface.co/microsoft/Fara1.5-9B
- Paper: https://huggingface.co/papers/2606.20785
- Repositorio GitHub de Fara: https://github.com/microsoft/fara
- Magentic-UI: https://github.com/microsoft/magentic-ui
- Proyecto Heretic: https://heretic-project.org
- Azure Foundry: https://aka.ms/fara1.5-9B-foundry
- Pagina del proyecto Fara1.5: https://aka.ms/fara1.5
