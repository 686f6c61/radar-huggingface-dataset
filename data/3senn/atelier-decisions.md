# 3SENN/atelier-decisions

## Resumen

Atelier-decisions es un paquete de dos modelos de decisión destilados, desarrollado por 3SENN para el navegador open source Atelier. No son modelos generativos de propósito general, sino clasificadores especializados que responden a un formato de petición cerrado propio de Atelier (¿hay una respuesta esperando?, ¿este clic compraría o borraría algo?, ¿esto es una búsqueda o una pregunta?, ¿qué habilidad encaja?). Toda la inferencia ocurre en local, sin enviar datos a ningún servidor.

El paquete contiene dos variantes. `atelier-nano` parte de mmBERT-small (22 capas) y se distribuye como ONNX int8 con tabla de embeddings de 4 bits: 54 MB y unos 10 ms por pregunta en CPU convencional con ONNX Runtime. `atelier-mini` parte de Qwen3.5-0.8B, reconfigurado con atención no causal y un readout de 255 códigos, y se distribuye como GGUF para llama.cpp: 515 MB y entre 0,14 y 0,33 s por pregunta en CPU.

Ambos se destilaron del profesor propietario pplx-decider-flash-v1.3 de Perplexity y se validaron contra pplx-decider-v1.3, además de incorporar preguntas numéricas y de seguridad cuyas respuestas se computan o se conocen por construcción. La relevancia actual está en el despliegue on-device de decisiones de baja latencia con licencia Apache-2.0 y artefactos reproducibles (manifiestos con SHA-256, informes de evaluación y constructores de datos publicados en GitHub).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nano: encoder transformer (mmBERT-small, 22 capas); mini: Qwen3.5-0.8B con atención no causal y readout de 255 códigos |
| Parametros totales | 752.393.024 (suma reportada en safetensors del repo); nano: no disponible desglosado, mini: ~0,8B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | nano: ONNX int8 con embeddings de 4 bits; mini: GGUF Q5_K_M en capas con embeddings de 4 bits |
| Idiomas soportados | multilingual, en, nl, de, fr, es |
| Licencia | apache-2.0 (pesos); datos del proyecto CC BY 4.0; parche de integración MPL-2.0 |
| Formato de pesos | ONNX (nano), GGUF (mini), PyTorch checkpoints (student.pt, mini.pt), safetensors en el repo |

## Arquitectura y entrenamiento

`atelier-nano` es un encoder transformer de 22 capas derivado de jhu-clsp/mmBERT-small, cuantizado a int8 en ONNX con una tabla de embeddings de 4 bits que reduce el artefacto a 54 MB. `atelier-mini` reutiliza los pesos de Qwen/Qwen3.5-0.8B pero los lee "como un decididor": atención no causal y un readout de 255 códigos que produce la decisión, empaquetado como GGUF Q5_K_M para llama.cpp.

El entrenamiento es una destilación desde el profesor pplx-decider-flash-v1.3 (con validación contra pplx-decider-v1.3), complementada con preguntas numéricas y de seguridad cuyas respuestas se calculan o se conocen por construcción. Los datos provienen de pools etiquetados por el profesor y de entradas escritas para el proyecto, con corpus como AmazonScience/massive, allenai/WildChat-1M, osunlp/Mind2Web, glaiveai/glaive-function-calling-v2, google/Synthetic-Persona-Chat, knowledgator/gliclass-v2.0 y MoritzLaurer/synthetic_zeroshot_mixtral_v0.1. El repositorio de GitHub publica los constructores de datos, el entrenamiento y todas las mediciones; el repo de Hugging Face aloja los ficheros que no caben en git.

## Capacidades

- Clasificación de decisiones de navegador en un formato de petición cerrado (System One de Atelier): respuesta pendiente, intención de clic destructivo o de compra, búsqueda frente a pregunta, selección de habilidad.
- Respuesta a preguntas abiertas en el mismo formato, únicamente en la variante mini.
- Preguntas numéricas y de seguridad con respuesta computada o conocida por construcción.
- Multilingüe en inglés, neerlandés, alemán, francés y español.
- Inferencia 100% local, sin envío de datos a servidores externos.
- Degradación controlada: cuando el modelo no está seguro, declina y la regla de Atelier decide.
- No soporta tool calling ni function calling en el sentido de los LLM generativos; el formato de petición es propio y restringido.

## Casos de uso

- Clasificación de bandeja de entrada en el navegador: el nano responde en unos 10 ms si un mensaje espera respuesta, integrándose en el bucle de UI sin bloqueo perceptible.
- Aviso previo a acciones destructivas: el mini evalúa si un clic compraría o borraría algo antes de ejecutar la acción, con la regla de Atelier como red de seguridad cuando declina.
- Enrutado de consultas en la barra de direcciones: distingue búsqueda de pregunta y selecciona la habilidad adecuada, en cinco idiomas.
- Asistente de escritura con verificación de fidelidad: el mini detecta resúmenes infieles (con un 15% de error en los casos en que se muestra seguro, según la model card), útil como primera pasada antes de la revisión humana.
- Detección de remitentes sospechosos: clasificación de lookalike senders con un 16,5% de error cuando el mini se muestra seguro; adecuado como señal adicional, nunca como único guardián.
- Despliegue en equipos sin GPU: ambos modelos corren en CPU (ONNX Runtime para el nano, llama.cpp para el mini), lo que permite distribuir la funcionalidad en portátiles y equipos de gama baja.
- Filtrado previo en pipelines de datos: el nano puede preclasificar grandes volúmenes de texto multilingüe a ~10 ms por elemento en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible en el sentido de MMLU, HumanEval o GSM8K. La model card aporta métricas propias de la tarea:

| Metrica | Valor |
|---|---|
| nano: latencia por pregunta (CPU, ONNX Runtime) | ~10 ms |
| nano: tamano del artefacto | 54 MB |
| mini: latencia por pregunta (CPU, llama.cpp) | 0,14-0,33 s |
| mini: tamano del artefacto | 515 MB |
| mini: error en preguntas de seguridad cuando se muestra seguro | 6% (16,5% en remitentes lookalike, 15% en fidelidad de resúmenes) |
| mini: acierto en tipos nuevos de preguntas de navegador cuando decide | 81-83% (el nano las declina) |
| mini: cobertura en 20 idiomas no vistos | decide el 22% |

## Requisitos de hardware

- VRAM: no requiere GPU; ambos modelos están diseñados para CPU.
- nano: 54 MB de artefacto, ~10 ms por pregunta con ONNX Runtime en CPU convencional.
- mini: 515 MB de artefacto, 0,14-0,33 s por pregunta en CPU con llama.cpp.
- Cabe en cualquier equipo de consumo; no se especifican GPU recomendadas porque el despliegue objetivo es CPU.
- Opciones de despliegue: ONNX Runtime (nano), llama.cpp con `llama-server` (mini), y el runner Node incluido en `runtime/node` que expone las peticiones en 127.0.0.1.
- Throughput estimado: no disponible más allá de las latencias por pregunta indicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| atelier-decisions (nano + mini) | 752M (suma del repo) | no disponible | Clasificación de decisiones de navegador | Apache-2.0 | Hugging Face + GitHub |
| pplx-decider-flash-v1.3 | no disponible | no disponible | Decisiones (profesor) | Apache-2.0 | Hugging Face (perplexity-ai) |
| pplx-decider-v1.3 | no disponible | no disponible | Decisiones (profesor) | Apache-2.0 | Hugging Face (perplexity-ai) |
| mmBERT-small | no disponible | no disponible | Encoder multilingüe | MIT | Hugging Face (jhu-clsp) |

No se dispone de comparativas de rendimiento publicadas frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un guardián autónomo: el mini se muestra seguro y se equivoca en el 6% de las preguntas de seguridad (16,5% en remitentes lookalike, 15% en fidelidad de resúmenes); Atelier nunca confía solo en él.
- La aritmética de varios pasos (porcentajes, IVA, cuentas divididas) no está resuelta: el mini declina y delega en la regla.
- Los tipos nuevos de preguntas de navegador solo aciertan el 81-83% cuando el mini decide, y el nano los declina directamente.
- Cobertura idiomática limitada a inglés, neerlandés, alemán, francés y español; el nano declina texto mayoritariamente no latino y el mini solo decide el 22% en 20 idiomas no vistos.
- El formato de entrada es propietario (`student/format.py`, `runtime/node/src/format.ts`); no acepta texto libre como un LLM convencional.
- Riesgo de alucinación no evaluado en el sentido generativo, pero el error en clasificación de seguridad y fidelidad es un caveat directo para producción.
- Restricciones de licencia: los pesos son Apache-2.0, pero los datos de terceros conservan sus licencias (MASSIVE, Mind2Web y Synthetic-Persona-Chat CC BY 4.0; WildChat-1M ODC-BY; glaive-function-calling-v2, gliclass-v2.0 y synthetic_zeroshot_mixtral_v0.1 Apache-2.0); el parche de integración es MPL-2.0. Revisar NOTICE antes de redistribuir.
- El modelo base Qwen3.5-0.8B se ha modificado (atención no causal, readout de 255 códigos), por lo que no debe tratarse como un Qwen3.5 estándar.

## Enlaces

- Hugging Face: https://huggingface.co/3SENN/atelier-decisions
- Repositorio GitHub: https://github.com/3SENN/atelier-decisions
- Proyecto Atelier: https://github.com/3SENN/atelier
- Model card v0.5: https://huggingface.co/3SENN/atelier-decisions/blob/main/releases/v0.5/MODEL_CARD.md
- Profesor pplx-decider-flash-v1.3: https://huggingface.co/perplexity-ai/pplx-decider-flash-v1.3
- Profesor pplx-decider-v1.3: https://huggingface.co/perplexity-ai/pplx-decider-v1.3
- Modelo base nano (mmBERT-small): https://huggingface.co/jhu-clsp/mmBERT-small
- Modelo base mini (Qwen3.5-0.8B): https://huggingface.co/Qwen/Qwen3.5-0.8B
- NOTICE: https://github.com/3SENN/atelier-decisions/blob/main/NOTICE
