# aymandakir-gh/gh-apex-GGUF

## Resumen

GH Apex es un ajuste fino mediante LoRA del modelo Qwen/Qwen3-4B (Apache-2.0) desarrollado por Growthackers, una agencia italiana de growth marketing. Forma parte de la familia GH AI, compuesta por GH Spark (0.6B), GH Pulse (1.7B) y este GH Apex (4B), orientada a tareas de estrategia y respuestas estructuradas largas dentro del ambito del marketing de crecimiento. El modelo se distribuye en formato GGUF, lo que facilita su despliegue en entornos con recursos limitados.

El modelo parte de la arquitectura transformer densa de Qwen3-4B, con 4.022.468.096 parametros totales, y ha sido entrenado sobre el conocimiento publico de Growthackers (playbooks, biblioteca de metricas, glosario, notas de adquisicion, contenido, SEO, CRO y herramientas de IA) combinado con una porcion de conversacion general del dataset smoltalk (Apache-2.0). Segun la model card, el entrenamiento se realizo en la CPU de un unico portatil, lo que da una idea de la escala reducida del ajuste.

Su relevancia radica en ser un ejemplo de especializacion vertical de un modelo pequeno para un dominio concreto (growth marketing) manteniendo la licencia permisiva Apache-2.0 y con soporte para italiano e ingles. La model card reporta mejoras medibles frente al modelo base en perdida sobre notas retenidas y en benchmarks de razonamiento como ARC-Easy y ARC-Challenge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B), ajuste fino con LoRA |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de uso con llama-server emplea `-c 8192`) |
| Tipos de cuantizacion | GGUF (el repositorio incluye al menos Q4_K_M; no se detallan otras variantes) |
| Idiomas soportados | italiano (it), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

GH Apex se construye sobre Qwen3-4B, un transformer denso de 4.022 millones de parametros. El ajuste se realiza mediante LoRA sobre el conocimiento publico de Growthackers en materia de growth marketing, que incluye playbooks, biblioteca de metricas, glosario, notas de adquisicion, contenido, SEO, CRO y herramientas de IA, complementado con una porcion de conversacion general procedente de HuggingFaceTB/smoltalk (Apache-2.0). Segun la model card, el entrenamiento se llevo a cabo en la CPU de un unico portatil.

En cuanto a la privacidad de los datos, la model card indica que solo se emplearon notas de conocimiento generico: se descartaron notas que mencionaban clientes, se eliminaron nombres de personas, correos, telefonos, IBAN, identificadores de cuentas publicitarias y claves de API, y se excluyo por completo material de recursos humanos, finanzas, socios, legal y exito de cliente. No se detalla el numero de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO. El modelo esta pensado para operar en modo no-thinking (`enable_thinking=False`), con un system prompt de GH integrado en el Modelfile.

## Capacidades

- Generacion de texto orientada a estrategia de growth marketing y respuestas estructuradas largas.
- Conocimiento especializado en playbooks, metricas, glosario, adquisicion, contenido, SEO, CRO y herramientas de IA del dominio de growth marketing.
- Conversacion general multi-turno gracias a la porcion de smoltalk en el entrenamiento.
- Soporte de italiano e ingles.
- Compatibilidad con endpoints OpenAI a traves de llama-server (`--jinja`) y con Ollama.
- Modo no-thinking recomendado por el autor para el uso previsto.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Consultoria de estrategia de growth: el modelo puede generar planes estructurados y respuestas largas sobre adquisicion, contenido o CRO apoyandose en su conocimiento especializado de playbooks y metricas.
- Asistente interno de agencia: integrado via Ollama o llama-server, sirve para resolver dudas sobre el glosario y la biblioteca de metricas de Growthackers en italiano o ingles.
- Generacion de borradores de contenido SEO: puede redactar esquemas y borradores apoyandose en las notas de SEO y contenido incluidas en el entrenamiento, con revision humana posterior.
- Formacion y onboarding: util como asistente conversacional para explicar conceptos de growth marketing a nuevos miembros del equipo, gracias a su capacidad de respuestas estructuradas.
- Prototipado en local: al distribuirse en GGUF y poder ejecutarse con llama.cpp u Ollama, permite desplegar un asistente de dominio en equipos sin GPU dedicada.
- Chat general de soporte: la porcion de smoltalk le permite mantener conversaciones multi-turno fuera del dominio estricto de marketing, aunque con menor especializacion.
- Evaluacion de experimentos de CRO: puede ayudar a interpretar metricas y proponer hipotesis a partir de las notas de CRO, siempre con verificacion manual de cifras.

## Benchmarks y rendimiento

| Metrica | Qwen3-4B | GH Apex |
|---|---|---|
| Perdida en notas GH retenidas (menor es mejor) | 2,908 | 2,047 |
| ARC-Easy (zero-shot) | 77,0% | 83,0% |
| ARC-Challenge (zero-shot) | 52,0% | 57,0% |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; para un modelo de 4B en GGUF Q4_K_M el peso de los pesos ronda los 2,5-3 GB, aunque este dato no lo confirma la model card.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano de 4B y el formato GGUF, aunque no se detallan modelos concretos.
- Opciones de despliegue: Ollama (`ollama create gh-apex -f Modelfile`) y llama.cpp mediante `llama-server` con API compatible con OpenAI (`--jinja -c 8192`).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| GH Apex | 4.022.468.096 | no disponible | Apache-2.0 | GGUF | Ajuste LoRA de Qwen3-4B para growth marketing |
| Qwen3-4B (base) | 4B aprox. | no disponible | Apache-2.0 | safetensors, GGUF | Modelo base generalista |
| GH Pulse | 1,7B (segun model card) | no disponible | no disponible | no disponible | Variante menor de la familia GH AI |
| GH Spark | 0,6B (segun model card) | no disponible | no disponible | no disponible | Variante menor de la familia GH AI |

## Limitaciones y advertencias

- Modelo pequeno: puede inventar hechos, estadisticas y URLs, y su aritmetica no es fiable.
- No tiene acceso a internet.
- Se recomienda verificar cualquier cifra antes de usarla con clientes.
- Problema conocido: si se le piden datos de contacto, puede adivinar direcciones de Growthackers (por ejemplo, un sitio o correo `growthackers.it`); el sitio oficial es https://gh.company.
- El uso previsto es en modo no-thinking (`enable_thinking=False`); no se documenta el comportamiento en modo thinking.
- Idiomas limitados a italiano e ingles.
- No se documentan sesgos conocidos mas alla de los inherentes al modelo base y a los datos de entrenamiento.
- Licencia Apache-2.0, permisiva para uso comercial, aunque se recomienda revisar las condiciones del modelo base Qwen3-4B.

## Enlaces

- HuggingFace: https://huggingface.co/aymandakir-gh/gh-apex-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Dataset smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Sitio oficial de Growthackers: https://gh.company
