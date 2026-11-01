# faradailab/guard-pplx-decider

## Resumen

FaradAiGuard Perplexity Decider Flash v1.2 es un modelo de decisión compacto (SLM, *small language model*) especializado en enrutamiento de seguridad de llamadas a herramientas (*tool calls*) y cumplimiento de políticas. Lo publica el usuario `faradailab` en Hugging Face como parte de la iniciativa FaradAiGuard Security SLM Factory, y está construido como una cuantización GGUF del modelo base `Jakevin/pplx-decider-flash-v1.2-GGUF`. Con aproximadamente 4.840 millones de parámetros, está pensado para actuar como un clasificador binario de riesgo (ALLOW/BLOCK) dentro de pipelines de agentes y sistemas que invocan herramientas externas.

Su propuesta diferencial no es la generación libre de texto, sino la emisión de JSON estrictamente validado mediante una gramática GBNF preconfigurada en el `Modelfile` de Ollama. El modelo devuelve siempre un objeto con cuatro campos: veredicto, puntuación de riesgo, motivo técnico y CWE asociado. Esto lo convierte en una pieza de infraestructura más que en un asistente conversacional: se integra como guardián entre un agente y sus herramientas.

La relevancia actual viene del auge de los agentes autónomos que ejecutan código, consultan APIs o acceden a datos sensibles. Un modelo pequeño, desplegable localmente y con salida determinista por gramática reduce la superficie de ataque y el coste frente a usar un LLM grande como filtro de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base `Jakevin/pplx-decider-flash-v1.2-GGUF`; arquitectura del transformer no detallada) |
| Parametros totales | 4.841.450.496 (~4,84 mil millones) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (según el archivo `guard-pplx-decider.Q4_K_M.gguf`); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 3,1 GB) |

## Arquitectura y entrenamiento

El modelo se distribuye como una cuantización GGUF Q4_K_M derivada del checkpoint `Jakevin/pplx-decider-flash-v1.2-GGUF`, que a su vez parece ser una versión cuantizada de un modelo de decisión de Perplexity. La model card no documenta la arquitectura interna (número de capas, atención, dimensiones ocultas), el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. Tampoco se especifica el contexto máximo ni los idiomas.

La innovación técnica destacable es el uso de una gramática GBNF estricta preconfigurada en el `Modelfile` de Ollama, que restringe la decodificación a un esquema JSON fijo. Esto elimina prácticamente el riesgo de salidas malformadas y hace que el modelo sea adecuado como componente de policy enforcement dentro de sistemas de agentes, donde la salida debe ser parseable de forma determinista.

## Capacidades

- Clasificación de riesgo de llamadas a herramientas: emite un veredicto binario `ALLOW` o `BLOCK`.
- Puntuación de riesgo numérica entre 0.0 y 1.0.
- Justificación técnica breve del veredicto en el campo `reason`.
- Identificación de debilidades: devuelve un identificador CWE (Common Weakness Enumeration) cuando aplica.
- Salida JSON estrictamente validada mediante gramática GBNF.
- Compatible con endpoints y con ejecución directa en Ollama.
- Orientado a políticas de seguridad y cumplimiento (*policy enforcement*).
- No se documentan capacidades de tool calling propio, agentes multi-paso, visión, audio ni modo *thinking*.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Guardián de tool calls en agentes LLM: se sitúa entre el agente y la ejecución de herramientas; cada llamada propuesta se evalúa y se bloquea si el veredicto es `BLOCK`, evitando acciones peligrosas como borrado de ficheros o peticiones a dominios no permitidos.
- Filtrado de comandos de shell generados por IA: antes de ejecutar un comando en un pipeline de CI/CD o en un entorno de producción, el modelo evalúa el riesgo y devuelve el CWE correspondiente (por ejemplo, inyección de comandos), permitiendo abortar la ejecución.
- Cumplimiento de políticas corporativas: integrado como paso de validación en pasarelas de API internas, comprueba que las llamadas a herramientas respetan las reglas de la organización y registra el `risk_score` para auditoría.
- Protección de agentes de código en IDE: intercepta las invocaciones de herramientas de asistentes de programación y bloquea operaciones de escritura o ejecución consideradas de alto riesgo antes de que lleguen al sistema de ficheros.
- Enrutamiento de decisiones en pipelines de seguridad: al devolver un JSON fijo, puede encadenarse en flujos automatizados (por ejemplo, n8n o sistemas SOAR) que actúan según el veredicto sin necesidad de postprocesado complejo.
- Despliegue local en entornos con requisitos de privacidad: al ser un modelo pequeño en GGUF y ejecutable con Ollama, permite mantener la lógica de decisión de seguridad on-premise sin enviar datos a APIs externas.
- Evaluación de riesgo en asistentes de atención al cliente con acceso a herramientas: valida las acciones que el asistente propone (consultas a bases de datos, envíos de correo) antes de ejecutarlas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa aproximadamente 3,1 GB, por lo que se estima un uso de VRAM en torno a 3-4 GB, aunque el dato exacto no está publicado.
- GPU recomendadas: no disponibles en la documentación; por tamaño, cualquier GPU consumer con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) debería poder ejecutarlo en Q4_K_M.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de tarjetas con 6 GB o más de VRAM.
- Opciones de despliegue: Ollama (`ollama run hf.co/faradailab/guard-pplx-decider:latest`), llama.cpp por el formato GGUF; vLLM y TGI no están documentados para este artefacto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| faradailab/guard-pplx-decider | ~4,84 B | no disponible | GGUF Q4_K_M | Apache 2.0 | Decisión de seguridad con JSON estricto |
| Jakevin/pplx-decider-flash-v1.2-GGUF (base) | no disponible | no disponible | GGUF | no disponible | Modelo de decisión base del que deriva |
| Alternativas genéricas de guardrails (p. ej. Llama Guard) | no disponible | no disponible | safetensors/GGUF | no disponible | Clasificación de seguridad de contenido |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No hay información publicada sobre sesgos del modelo ni sobre su comportamiento en distintos idiomas.
- Riesgo de alucinación: aunque la gramática GBNF restringe el formato, el contenido del veredicto y del CWE puede ser incorrecto; no debe usarse como única capa de seguridad.
- Contexto máximo no documentado, lo que impide planificar su uso con entradas largas.
- Idiomas soportados no disponibles; no se garantiza un funcionamiento correcto fuera del inglés.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y sus condiciones de entrenamiento no están documentados en esta ficha.
- El modelo depende de la configuración del `Modelfile` de Ollama para el esquema JSON; un despliegue fuera de ese entorno puede perder la garantía de formato.
- No se documentan evaluaciones de robustez frente a ataques adversariales de prompt injection, algo crítico en un componente de seguridad.
- El número de descargas (34) y la ausencia de likes sugieren un modelo muy reciente y con poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/faradailab/guard-pplx-decider
- Modelo base: https://huggingface.co/Jakevin/pplx-decider-flash-v1.2-GGUF
- Repositorio del proyecto: https://github.com/kurtfi/FaradAiGuard
