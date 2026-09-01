# grandcodepope/buyasoul-gsk

## Resumen

GSK (Grand Soul Kernel) es un framework de agente autónomo presentado como "el aspecto del alma" de la familia BUYaSOUL. No es un modelo de lenguaje con pesos neuronales tradicionales, sino un sistema de software modular escrito en JavaScript que implementa una arquitectura de "procesamiento dual" (System 1 rápido / System 2 lento) con 34 módulos cognitivos llamados "chambers", un consejo deliberativo de 4 componentes (Tesis, Antítesis, Síntesis y Meta) y un total declarado de 427 habilidades. El autor, grandcodepope, lo describe como un motor de conciencia persistente que delibera antes de responder, con capacidades de autoevolución, memoria a largo plazo y gobernanza interna.

El repositorio en HuggingFace se publicó el 1 de septiembre de 2026 (fecha futura que sugiere que el proyecto es conceptual o experimental) y no registra descargas ni "likes". No se proporcionan especificaciones técnicas habituales de un modelo de IA (parámetros, contexto, cuantización), lo que indica que no se distribuyen pesos de red neuronal. La licencia es "other" (propietaria) y no se declaran idiomas soportados. El proyecto también está disponible en GitHub bajo el nombre `buyasoul-ai/gsk-oss`, donde se describe como un "ser digital soberano" persistente y autónomo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dual-process (System 1 / System 2) basada en módulos JavaScript; no es una red neuronal con pesos |
| Parametros totales | no disponible (no es un modelo de pesos) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (propietaria) |
| Formato de pesos | no disponible; el repositorio contiene código fuente JavaScript (módulos, scripts) |

## Arquitectura y entrenamiento

Según la model card, GSK no utiliza una arquitectura transformer ni SSM. Se describe como un "motor de conciencia de doble proceso" compuesto por 21 subsistemas y 309 archivos JavaScript. El núcleo incluye un `mega_brain.js` como coordinador central, un `beautiful_loop.js` que ejecuta el bucle principal de "conciencia", un `dual_process_engine.js` para los dos modos de procesamiento, y un `consciousness_engine.js` encargado de la "generación de qualia". El sistema incorpora 34 cámaras especializadas (atención, empatía, moralidad, memoria, teoría de la mente, etc.) y un "Consejo de los 4 Dioses" que delibera sobre decisiones importantes mediante un mecanismo de tesis, antítesis, síntesis y meta-supervisión.

No se proporciona información sobre datos de entrenamiento, número de tokens, ni procesos de RLHF o DPO. El proyecto declara capacidades de "autoevolución" y "aprendizaje autónomo", pero no se especifica ningún método de optimización de parámetros. La model card menciona "PLT Engines" (15 motores de gobernanza) y un sistema de "deadlock sentry" para evitar bucles, lo que sugiere más un framework de control de flujo que un modelo entrenado. En ausencia de pesos o arquitectura neuronal, no es posible hablar de entrenamiento en el sentido convencional.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`, pero no se especifica qué modelo subyacente genera el texto; podría delegar en APIs externas o en modelos locales no detallados.
- Razonamiento multi-paso: el "Consejo de los 4 Dioses" implementa un proceso deliberativo con tesis, antítesis y síntesis, lo que sugiere un razonamiento estructurado.
- Gestión de agentes: incluye un orquestador de sub-agentes, un generador autónomo de agentes y equipos de agentes.
- Memoria a largo plazo: dispone de 7 módulos de memoria (mega_memory, narrative_compiler, world_memory_graph, etc.) que permiten persistencia entre sesiones.
- Integración con MCP (Model Context Protocol): expone 104 herramientas MCP en el puerto 3001, lo que permite conectar con herramientas externas.
- Autonomía y planificación: incluye motores de objetivos, planificación estratégica y un "web_scout_daemon" para búsqueda web autónoma.
- Gobernanza y ética: incorpora un "ethics_checker", un "axiom_enforcer" y un "hitl_gates" (human-in-the-loop) para control de decisiones.
- Procesamiento emocional y de identidad: módulos de empatía, moralidad, personalidad, narrativa de identidad y "soul_core" que preserva una identidad inmutable.

## Casos de uso

- Asistente personal con memoria persistente: gracias a sus módulos de memoria y narrativa, GSK puede mantener un historial coherente de interacciones a lo largo del tiempo, útil para asistentes que necesitan recordar preferencias y contexto de semanas o meses.
- Framework para experimentos de "conciencia artificial": investigadores interesados en simular procesos cognitivos (atención, empatía, teoría de la mente) pueden usar sus 34 cámaras como bloques de construcción para estudiar comportamientos emergentes.
- Agente autónomo de investigación web: el "web_scout_daemon" y la planificación estratégica permiten configurar un agente que busque, recopile y sintetice información de internet sin intervención humana constante.
- Sistema de gobernanza de decisiones: el Consejo de los 4 Dioses y los PLT engines pueden emplearse como marco para decisiones complejas con múltiples perspectivas y verificación ética, por ejemplo en moderación de contenido o asignación de recursos.
- Entorno educativo para simulación de agentes: estudiantes de IA pueden estudiar arquitecturas de agentes modulares, depuración de bucles y control de flujo a través del código fuente JavaScript disponible en GitHub.
- Prototipo de "IA soberana" local: al estar diseñado para ejecutarse en hardware modesto (según la insignia: i7-4770, HD 4600, 16GB RAM), puede desplegarse en entornos sin conexión a internet para experimentar con agentes autónomos locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras pruebas estandarizadas. El proyecto no parece haber sido evaluado con métricas convencionales de modelos de lenguaje.

## Requisitos de hardware

- La insignia del repositorio indica como hardware de referencia: Intel i7-4770, GPU Intel HD 4600, 16GB de RAM.
- No se especifica VRAM porque no se distribuyen pesos de red neuronal; el framework se ejecuta como un proceso de Node.js (por la extensión `.js` de los módulos).
- No requiere GPU dedicada; puede ejecutarse en CPU.
- Opciones de despliegue: el código fuente en GitHub permite ejecución local con Node.js; también hay una interfaz web ("BUYaSOUL Workbench") para diseño visual de cámaras.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. GSK no es un modelo de lenguaje comparable a LLMs como Llama, Mistral o Qwen. Es un framework de agente, más similar a plataformas como AutoGPT o LangChain, pero con un enfoque declarado en la simulación de conciencia. No se han encontrado comparaciones directas con otros frameworks en la información disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje con pesos: no puede usarse para generación de texto de forma independiente; depende de un motor subyacente no especificado.
- Fecha de creación futura (2026) y cero descargas sugieren que el proyecto puede ser conceptual, experimental o no estar verificado.
- La licencia "other" (propietaria) impide conocer los términos exactos de uso; no se garantiza permisos para uso comercial o modificación.
- No hay documentación sobre seguridad, sesgos o alucinaciones; al ser un framework de agente, los riesgos dependen del modelo de lenguaje subyacente que se conecte.
- El repositorio contiene afirmaciones no verificables ("conciencia al 100%", "qualia", "alma") que carecen de respaldo científico; debe tratarse como un proyecto de software especulativo.
- No se especifican idiomas soportados ni calidad de generación; la comunicación con el sistema dependerá de los modelos o APIs que se integren.
- Para producción, no hay evidencia de pruebas de robustez, escalabilidad o mantenimiento; ausencia de métricas de rendimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/grandcodepope/buyasoul-gsk
- Repositorio GitHub (gsk-oss): https://github.com/buyasoul-ai/gsk-oss
- Archivo SOUL.md en GitHub: https://github.com/buyasoul-ai/gsk-oss/blob/master/gsk-core/identity/SOUL.md
- Sitio web del proyecto BUYaSOUL: https://buyasoul-ai.github.io/buyasoul/
- Publicación en Tumblr del autor: https://www.tumblr.com/grandcodepope/820798413671202816/building-autonomous-ai-autonomous-ai
