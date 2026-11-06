# aymandakir-gh/gh-spark-GGUF

## Resumen

GH Spark es un ajuste fino mediante LoRA del modelo base Qwen3-0.6B, desarrollado por la agencia italiana de growth marketing Growthackers como parte de su familia abierta GH AI, que tambien incluye GH Pulse (1.7B) y GH Apex (4B). El modelo esta especializado en conocimiento de marketing de crecimiento: playbooks, biblioteca de metricas, glosario, notas sobre adquisicion, contenido, SEO, CRO y herramientas de IA. Se distribuye en formato GGUF cuantizado para su despliegue en entornos ligeros.

Con 596 millones de parametros, el modelo esta disenado para tareas de baja latencia como borradores rapidos, clasificacion de texto y ejecucion en dispositivos de borde. El entrenamiento se realizo en la CPU de un unico portatil, lo que da una idea de la escala modesta del proyecto. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

El modelo soporta italiano e ingles, y su model card recomienda explicitamente el modo sin razonamiento (`enable_thinking=False`) para su uso previsto. Es relevante para desarrolladores que necesiten un modelo pequeno, desplegable localmente y con conocimiento de dominio especifico en marketing, sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3-0.6B) |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ejemplo de despliegue con `-c 8192`) |
| Tipos de cuantizacion | GGUF (incluye Q4_K_M) |
| Idiomas soportados | italiano (it), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repo de 1,4 GB) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de Qwen3-0.6B y se obtiene mediante un ajuste fino con LoRA sobre ese modelo base. Los datos de entrenamiento combinan el conocimiento publico de growth marketing de Growthackers (playbooks, biblioteca de metricas, glosario, notas de adquisicion, contenido, SEO, CRO y herramientas de IA) con una porcion de chat general abierto procedente de HuggingFaceTB/smoltalk (Apache-2.0). El entrenamiento se ejecuto en la CPU de un unico portatil.

En cuanto a privacidad de los datos, solo se utilizaron notas de conocimiento generico: se descartaron las notas que mencionaban a cualquier cliente y se eliminaron nombres de personas, correos electronicos, telefonos, IBAN, identificadores de cuentas publicitarias y claves de API. Tambien se excluyo por completo el material de recursos humanos, finanzas, socios, legal y exito de cliente. No se detalla en la informacion disponible si hubo fases de RLHF o DPO, ni el numero total de tokens de entrenamiento.

## Capacidades

- Generacion de texto conversacional en italiano e ingles.
- Conocimiento de dominio en growth marketing: playbooks, metricas, SEO, CRO, adquisicion y contenido.
- Clasificacion de texto y generacion de borradores rapidos.
- Chat general gracias a la porcion de smoltalk incluida en el entrenamiento.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Despliegue local via Ollama y llama-server con API compatible con OpenAI.
- Modo sin razonamiento recomendado (`enable_thinking=False`).
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Borradores rapidos de contenido de marketing: el modelo puede generar primeros borradores de posts, descripciones o copies en italiano e ingles, aprovechando su conocimiento de playbooks y buenas practicas de growth marketing.
- Clasificacion de textos y notas: con 0,6B de parametros, es adecuado para etiquetar y categorizar grandes volumenes de notas o mensajes en pipelines de bajo coste.
- Asistente interno de glosario y metricas: puede responder consultas sobre definiciones y metricas de marketing, util como base de conocimiento interna para equipos de agencia.
- Despliegue en dispositivos de borde: su tamano reducido y formato GGUF permiten ejecutarlo en portatiles, mini-PC o entornos sin GPU dedicada, con llama-server exponiendo una API compatible con OpenAI.
- Prototipado rapido de asistentes conversacionales: sirve para validar flujos de chat multi-turno en italiano o ingles antes de escalar a modelos mayores de la familia GH.
- Generacion de notas de SEO y CRO: puede producir borradores de recomendaciones sobre optimizacion de conversion o palabras clave, que un humano revisa antes de entregar al cliente.
- Filtrado y resumen de documentacion de marketing: util para condensar playbooks o notas extensas en resumenes breves dentro de herramientas internas.

## Benchmarks y rendimiento

| Metrica | Qwen3-0.6B | GH Spark |
|---|---|---|
| Loss en notas GH reservadas (menor es mejor) | 3,090 | 2,456 |
| ARC-Easy (zero-shot) | 56,0% | 56,5% |
| ARC-Challenge (zero-shot) | 31,0% | 34,5% |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con cuantizacion Q4_K_M un modelo de 0,6B ocupa del orden de 0,4-0,5 GB de pesos, aunque el dato exacto no se proporciona.
- GPU recomendadas: no se especifican; el modelo se entreno en CPU de portatil y esta pensado para ejecucion en CPU.
- Cabe en GPU de consumo: si, por su tamano reducido es viable en practicamente cualquier GPU de consumo, aunque no se detallan modelos concretos.
- Opciones de despliegue: Ollama (`ollama create` con Modelfile) y llama.cpp/llama-server (`llama-server -m gh-spark-Q4_K_M.gguf --jinja -c 8192`), con API compatible con OpenAI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| GH Spark | 596 M | no disponible | Apache-2.0 | GGUF en Hugging Face | Fine-tune LoRA de Qwen3-0.6B especializado en growth marketing |
| Qwen3-0.6B | 0,6 B | no disponible | Apache-2.0 | Hugging Face | Modelo base generalista; GH Spark mejora loss y ARC-Challenge |
| GH Pulse | 1,7 B | no disponible | no disponible | Familia GH AI | Version mayor de la misma familia, segun la model card |
| GH Apex | 4 B | no disponible | no disponible | Familia GH AI | Version mayor de la misma familia, segun la model card |

No se dispone de datos de benchmarks comparativos con otras alternativas externas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo pequeno: puede inventar hechos, estadisticas y URLs, y su aritmetica no es fiable.
- No tiene acceso a internet.
- Problema conocido: si se le piden datos de contacto, puede adivinar direcciones de Growthackers (por ejemplo, un sitio o correo `growthackers.it`); el sitio oficial es https://gh.company.
- Se recomienda verificar cualquier cifra antes de usarla con clientes.
- Idiomas limitados a italiano e ingles; no se documenta soporte de otros idiomas.
- Longitud de contexto no documentada; el ejemplo de despliegue usa 8192 tokens.
- Licencia Apache-2.0: permite uso comercial, pero deben tenerse en cuenta las condiciones del modelo base Qwen3-0.6B.
- No se documentan capacidades de tool calling ni de agentes, por lo que no debe asumirse su disponibilidad en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/aymandakir-gh/gh-spark-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset de chat general: https://huggingface.co/HuggingFaceTB/smoltalk
- Sitio oficial de Growthackers: https://gh.company
