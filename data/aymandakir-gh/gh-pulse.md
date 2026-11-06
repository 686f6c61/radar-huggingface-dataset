# aymandakir-gh/gh-pulse

## Resumen

GH Pulse es un ajuste fino mediante LoRA del modelo Qwen/Qwen3-1.7B, desarrollado por la agencia italiana de growth-marketing Growthackers como parte de su familia abierta GH AI (junto a GH Spark de 0,6B y GH Apex de 4B). El modelo está especializado en asistencia de marketing de crecimiento: playbooks, biblioteca de métricas, glosario, notas de adquisición, contenido, SEO, CRO y herramientas de IA. Se distribuye con licencia Apache-2.0 y soporta italiano e inglés.

Con 1.720.574.976 parámetros y un repositorio de 3,5 GB, GH Pulse se posiciona como un modelo pequeno orientado a tareas de asistencia conversacional cotidiana. Su interés radica en que demuestra que un ajuste fino de bajo coste (entrenado en la CPU de un portátil) sobre una base compacta puede mejorar métricas de dominio concreto sin sacrificar capacidades generales: la pérdida en notas de growth-marketing retenidas baja de 3,300 a 2,214 y las puntuaciones en ARC-Easy y ARC-Challenge mejoran ligeramente respecto a la base.

El modelo se publica en formato safetensors (adaptador LoRA) y también como GGUF cuantizado para despliegue local con Ollama o llama-server. Su relevancia actual está en el nicho de modelos de dominio verticalizados, ligeros y desplegables en hardware modesto, con un sistema de prompt de marca integrado en el Modelfile.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-1.7B) con adaptador LoRA |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el ejemplo de despliegue usa `-c 8192` |
| Tipos de cuantizacion | GGUF (se menciona Q4_K_M); el adaptador se distribuye en safetensors |
| Idiomas soportados | italiano (it), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) y GGUF |

## Arquitectura y entrenamiento

GH Pulse es un ajuste fino LoRA sobre Qwen/Qwen3-1.7B, un transformer decoder-only de 1,7 mil millones de parametros. El entrenamiento se realizo sobre conocimiento publico de growth-marketing de Growthackers (playbooks, biblioteca de métricas, glosario y notas de adquisición, contenido, SEO, CRO y herramientas de IA) combinado con una porcion de chat general abierto procedente de HuggingFaceTB/smoltalk (Apache-2.0). Segun la model card, el entrenamiento se ejecuto en la CPU de un unico portátil, lo que subraya el caracter de bajo coste del ajuste.

En materia de privacidad, el autor indica que solo se usaron notas de conocimiento generico: se eliminaron notas que mencionaban clientes, se anonimizaron nombres de personas, correos, telefonos, IBAN, IDs de cuentas publicitarias y claves de API, y se excluyo por completo material de RR. HH., finanzas, socios, legal y exito de cliente. No se documentan detalles sobre RLHF o DPO, ni innovaciones tecnicas adicionales mas alla del ajuste LoRA. El modelo esta pensado para usarse en modo no-thinking (`enable_thinking=False`).

## Capacidades

- Generacion de texto conversacional en italiano e ingles, orientada a asistencia de growth-marketing.
- Consulta de conocimiento de dominio: playbooks, biblioteca de métricas, glosario y notas de SEO, CRO, adquisición y contenido.
- Respuesta a preguntas sobre herramientas de IA aplicadas a marketing.
- Conversacion multi-turno con un system prompt de marca preintegrado en el Modelfile.
- Soporte de despliegue como API compatible con OpenAI mediante llama-server.
- Capacidades generales heredadas de Qwen3-1.7B, atenuadas por el ajuste de dominio.
- No dispone de acceso a internet.
- No se documentan tool calling, function calling, capacidades de agente, vision ni audio en la informacion proporcionada.

## Casos de uso

- Asistente interno de growth-marketing: el modelo responde consultas del equipo sobre metricas, playbooks y glosario, con el system prompt de Growthackers ya integrado en el Modelfile, lo que reduce la configuracion inicial.
- Onboarding de nuevos miembros del equipo: sirve como base de conocimiento conversacional para explicar conceptos de adquisición, SEO y CRO en italiano o ingles.
- Borradores de contenido y notas de campana: genera primeros borradores sobre temas de marketing a partir de las notas de dominio con las que fue entrenado, para su posterior revision humana.
- Despliegue local en portatiles: al caber en cuantizacion Q4_K_M y ejecutarse con Ollama o llama-server, permite prototipos sin GPU dedicada ni costes de API.
- Chatbot de soporte a agencias: integrado como API compatible con OpenAI, puede conectarse a herramientas internas para responder dudas frecuentes del equipo sobre procesos y metricas.
- Evaluacion de tecnicas de ajuste fino: sirve como caso de estudio reproducible de LoRA de bajo coste sobre una base compacta, util para investigadores que comparan perdida de dominio y retencion de capacidades generales.
- Base para verticalizaciones adicionales: al ser un adaptador LoRA sobre Qwen3-1.7B con licencia Apache-2.0, puede reutilizarse como punto de partida para otros dominios.

## Benchmarks y rendimiento

| Metrica | Qwen3-1.7B (base) | GH Pulse |
|---|---|---|
| Perdida en notas GH retenidas (menor es mejor) | 3,300 | 2,214 |
| ARC-Easy (zero-shot) | 63,0% | 65,5% |
| ARC-Challenge (zero-shot) | 43,5% | 46,5% |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 1,72B parametros, una cuantizacion Q4_K_M ocupa del orden de 1 GB de pesos, aunque el autor no publica cifras de VRAM.
- GPU recomendadas: no disponible; el autor documenta entrenamiento en CPU de portátil y despliegue con Ollama y llama-server.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del modelo, aunque no se confirma en la informacion proporcionada.
- Opciones de despliegue: Ollama (`ollama create gh-pulse -f Modelfile`) y llama.cpp (`llama-server -m gh-pulse-Q4_K_M.gguf --jinja -c 8192`) con API compatible con OpenAI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| GH Pulse | 1,72B | no disponible | Apache-2.0 | Growth-marketing (LoRA sobre Qwen3-1.7B) | Hugging Face, GGUF |
| Qwen3-1.7B (base) | 1,7B | no disponible | Apache-2.0 | Proposito general | Hugging Face |
| GH Spark | 0,6B | no disponible | no disponible | Growth-marketing (familia GH AI) | Hugging Face |
| GH Apex | 4B | no disponible | no disponible | Growth-marketing (familia GH AI) | Hugging Face |

Los datos de contexto, licencia y benchmarks de GH Spark y GH Apex no estan disponibles en la informacion proporcionada. La comparativa con la base Qwen3-1.7B se limita a las metricas publicadas por el autor (perdida de dominio y ARC).

## Limitaciones y advertencias

- Modelo pequeno: puede inventar hechos, estadisticas y URLs, y su aritmetica no es fiable.
- Sin acceso a internet: no puede verificar datos en tiempo real.
- Problema conocido: si se le piden datos de contacto, puede conjeturar direcciones de Growthackers (por ejemplo, un sitio o correo con dominio `growthackers.it`); el sitio oficial es https://gh.company.
- Las cifras generadas deben verificarse antes de usarlas con clientes.
- Soporte limitado a italiano e ingles; no se documentan otros idiomas.
- El ajuste LoRA esta orientado a un dominio concreto, por lo que su rendimiento en tareas generales puede diferir del de la base.
- Uso comercial permitido por la licencia Apache-2.0, sujeta a las condiciones de dicha licencia y de la licencia del modelo base.
- No se documentan sesgos especificos; al entrenarse sobre conocimiento de una agencia concreta, puede reflejar sus enfoques y terminologia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aymandakir-gh/gh-pulse
- Sitio oficial de Growthackers: https://gh.company
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de chat general: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
