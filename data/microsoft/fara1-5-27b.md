# microsoft/Fara1.5-27B

## Resumen

Fara1.5-27B es un agente de uso de computador (CUA, por sus siglas en ingles) multimodal desarrollado por Microsoft Research AI Frontiers, especializado en la automatizacion de tareas en navegadores web. El modelo observa el navegador exclusivamente a traves de capturas de pantalla y actua en nombre del usuario emitiendo llamadas a herramientas estructuradas (clic, escribir, desplazarse, visitar URL, busqueda web) para completar tareas de principio a fin. Esta disenado para operar sin acceso al DOM ni al arbol de accesibilidad, replicando la modalidad de entrada disponible para un usuario humano.

El modelo se construye mediante fine-tuning supervisado (SFT) sobre Qwen3.5-27B, utilizando datos sinteticos generados por FaraGen1.5, un pipeline multiagente de Microsoft que sintetiza tareas web, ejecuta trayectorias para resolverlas y verifica los resultados antes del entrenamiento. Con 27.356 millones de parametros y una ventana de contexto de 262.144 tokens, es capaz de manejar trayectorias largas con multiples capturas de pantalla y un historial completo de acciones. Su relevancia actual radica en que aborda la automatizacion web de extremo a extremo sin depender de infraestructura del navegador, lo que lo hace portable y adaptable a cualquier sitio.

La licencia MIT permite uso comercial sin restricciones, y Microsoft recomienda su despliegue a traves de MagenticLite, un entorno que proporciona sandboxing, listas de dominios permitidos, modo de vigilancia en tiempo real y pausa inmediata de la actividad del agente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal decoder-only LM (imagen + texto → texto) |
| Parametros totales | 27.356.728.560 (27B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | bf16 (referencia oficial); cuantizaciones adicionales no disponibles |
| Idiomas soportados | ingles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Fara1.5-27B es un modelo decoder-only multimodal que procesa entradas de imagen y texto para generar salidas de texto. Su arquitectura se basa en Qwen3.5-27B, sobre el cual se aplica fine-tuning supervisado. En el momento de la percepcion, el modelo es solo visual: recibe capturas de pantalla del navegador y el historial de acciones previas como texto, y predice la siguiente accion con argumentos fundamentados, como coordenadas de pixeles para clics y arrastres. No requiere un modelo de grounding separado.

El entrenamiento se realizo entre enero y abril de 2026, utilizando 64 GPUs NVIDIA B200 durante 6 dias. Los datos de entrenamiento fueron generados por FaraGen1.5, un pipeline multiagente que sintetiza tareas web, ejecuta trayectorias para resolverlas y verifica los resultados antes de usarlos para el entrenamiento. El modelo genera un bloque de chain-of-thought seguido de un bloque de llamada a herramienta con etiquetas XML. Su conocimiento esta limitado a principios de 2026, aunque puede acceder a informacion actual mediante busquedas web en vivo.

## Capacidades

- Completacion de tareas web de extremo a extremo: rellenar formularios, hacer reservas, solicitar empleo, planificar viajes, gestionar carritos de compra.
- Percepcion exclusivamente visual: opera sobre capturas de pantalla sin acceso al DOM ni al arbol de accesibilidad.
- Acciones con coordenadas de pixeles: predice directamente objetivos de clic y arrastre a nivel de pixel, sin necesidad de modelos auxiliares de grounding.
- Razonamiento interno: genera bloques de chain-of-thought antes de cada accion para planificar y justificar sus decisiones.
- Seguimiento de trayectorias: mantiene un historial completo de acciones y pensamientos previos dentro de su ventana de contexto de 262K tokens.
- Diseño de seguridad por puntos criticos: entrenado para detenerse y preguntar antes de introducir informacion personal, realizar pagos, enviar mensajes, iniciar sesion o ejecutar acciones irreversibles.
- Llamada a herramientas: emite acciones estructuradas como clic, escritura, desplazamiento, visita de URL y busqueda web.

## Casos de uso

- Automatizacion de pruebas web: el modelo puede navegar por una aplicacion web siguiendo un guion de pruebas, haciendo clic en elementos, rellenando formularios y verificando resultados, lo que permite pruebas de regresion sin necesidad de frameworks de automatizacion basados en DOM.
- Asistencia en compras online: puede gestionar carritos de compra, comparar productos y completar procesos de checkout, deteniendose para pedir confirmacion antes de realizar el pago.
- Gestion de formularios administrativos: rellena solicitudes de empleo, formularios de registro o tramites burocraticos, solicitando al usuario los datos personales que no haya proporcionado explicitamente.
- Planificacion de viajes: busca vuelos, hoteles y actividades, comparando opciones y secuenciando acciones hacia un itinerario completo, consultando al usuario ante decisiones ambiguas.
- Automatizacion de tareas repetitivas: extraccion de datos de multiples paginas, seguimiento de pedidos, actualizacion de registros en aplicaciones web internas, con capacidad de mantener contexto largo durante sesiones prolongadas.
- Agente de atencion al cliente: puede operar portales de soporte, rellenar tickets, buscar informacion en bases de conocimiento web y escalar al usuario cuando se requiere informacion personal o una accion irreversible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo en bf16 requiere aproximadamente 54,7 GB de memoria, por lo que no cabe en una GPU de consumo estandar. Se recomienda fragmentar el modelo en al menos 2 GPUs.
- GPU recomendadas: NVIDIA A6000, A100, H100 y B200 han sido probadas oficialmente. Se recomienda sharding sobre al menos 2 GPUs.
- GPU de consumo: no es viable en RTX 4090 u otras GPUs de consumo con 24 GB o menos, incluso con cuantizacion, dado el tamano del modelo y la ventana de contexto.
- Opciones de despliegue: vLLM (version >= 0.19.1) con `--dtype bfloat16 --max-model-len 262144 --limit-mm-per-prompt image=10`; tambien compatible con transformers >= 5.2.0 y torch >= 2.11.0.
- Despliegue recomendado: MagenticLite (https://github.com/microsoft/magentic-ui) o el CLI de Fara (https://github.com/microsoft/fara), que proporcionan sandboxing, allow-lists y modo de vigilancia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| Fara1.5-27B | 27B | 262K | Vision + texto | MIT | CUA para navegador, vision-only |
| Qwen3.5-27B (base) | 27B | 262K | Texto (multimodal segun variante) | Apache 2.0 | Modelo base sobre el que se hace SFT |
| AgentLM / AgentInstruct | 7B-70B | 32K | Texto | MIT | Agentes de texto sin percepcion visual |
| WebGPT (OpenAI) | no publicado | no disponible | Texto | no disponible | Agente de navegacion con acceso al DOM, no publico |

La comparativa directa con otros CUA multimodales no esta disponible en la informacion proporcionada. Fara1.5-27B se distingue por su percepcion exclusivamente visual (sin DOM) y su diseño de seguridad con puntos criticos.

## Limitaciones y advertencias

- Conocimiento limitado a principios de 2026: el modelo puede no estar al tanto de eventos posteriores sin realizar busquedas web en vivo.
- Idioma: solo soporta ingles, lo que limita su uso en entornos multilingues.
- Riesgo de alucinacion: como todo modelo generativo, puede fabricar informacion o acciones incorrectas, especialmente en tareas ambiguas o con capturas de pantalla poco claras.
- Seguridad: el modelo debe usarse exclusivamente con el harness de Fara CLI o MagenticLite. Ejecutarlo con acceso no restringido al navegador en una maquina con datos sensibles es peligroso. El sandboxing, las allow-lists y el modo de vigilancia son responsabilidad del integrador si se usa directamente.
- Puntos criticos: aunque el modelo esta entrenado para detenerse antes de acciones irreversibles, no debe confiarse ciegamente en esta capacidad; requiere supervision humana en entornos de produccion.
- Requisitos de hardware: no es desplegable en GPUs de consumo, lo que limita su uso a entornos con infraestructura profesional.
- Sin datos de benchmarks publicados: no se puede evaluar su rendimiento relativo frente a otros modelos de la misma categoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/microsoft/Fara1.5-27B
- Repositorio GitHub de Fara: https://github.com/microsoft/fara
- Repositorio GitHub de MagenticLite: https://github.com/microsoft/magentic-ui
- Paper: https://huggingface.co/papers/2606.20785
- Pagina del proyecto: https://aka.ms/fara1.5
- Despliegue en Azure Foundry: https://aka.ms/fara1.5-27B-foundry
