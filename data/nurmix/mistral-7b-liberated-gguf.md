# nurmix/Mistral-7B-Liberated-GGUF

## Resumen

Mistral-7B-Liberated-GGUF es la distribucion en formato GGUF del modelo nurmix/Mistral-7B-Liberated, una version del Mistral-7B-Instruct-v0.3 de Mistral AI a la que se le ha eliminado el comportamiento de rechazo (refusal) mediante una tecnica de ablacion de direcciones en el espacio de activaciones. El autor, nurmix, publica aqui las cuantizaciones listas para inferencia local con llama.cpp y Ollama, manteniendo los pesos originales en safetensors en el repositorio fuente.

El modelo resuelve un problema muy concreto: obtener un asistente conversacional de 7.000 millones de parametros que no rechace peticiones por motivos de seguridad, preservando al maximo las capacidades generales del modelo original. Segun la model card, la ablacion reduce los rechazos en el conjunto `harmful_behaviors` de 87/100 a 4/100, con una divergencia KL de solo 0,025 frente al modelo base en `harmless_alpaca`, lo que indica una degradacion limitada del comportamiento normal.

Es relevante ahora porque combina tres factores practicos: licencia Apache 2.0 (uso comercial permitido), pesos en GGUF con cuantizaciones desde Q4_K_M hasta F16, y un tokenizer con metadatos de tokens especiales corregidos, un detalle que suele romper plantillas de chat y tool calling en despliegues con llama.cpp. La arquitectura subyacente es un transformer decoder-only denso de Mistral, con 7.248.023.552 parametros totales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Mistral-7B-Instruct-v0.3) |
| Parametros totales | 7.248.023.552 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Mistral-7B-Instruct-v0.3) |
| Tipos de cuantizacion | Q4_K_M, Q6_K, Q8_0, F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el repositorio fuente nurmix/Mistral-7B-Liberated) |

## Arquitectura y entrenamiento

La arquitectura es la del Mistral-7B-Instruct-v0.3 original: un transformer decoder-only denso de aproximadamente 7.250 millones de parametros, con atencion por ventanas deslizantes y RoPE, disenado para generacion de texto e instrucciones. Sobre esa base, el autor aplico una ablacion de rechazo mediante Arbitrary-Rank Ablation (ARA) implementada en la herramienta Heretic v2.0.0. El proceso optimiza simultaneamente dos objetivos con 100 trials de Optuna: minimizar la tasa de rechazo y minimizar la divergencia KL respecto al modelo original. El checkpoint seleccionado corresponde al indice 4 del frente de Pareto, con un 4% de rechazos y una KL de 0,025.

Las cuantizaciones Q6_K y Q8_0 se generaron a partir de la conversion F16 usando el commit `fc504f91d8cfdfcd9b0fedcf14600fd2b0e63420` de llama.cpp, sin importance matrix. Q4_K_M es la cuantizacion preexistente del repositorio fuente. Los cuatro GGUF incluyen una correccion de los metadatos del tokenizer: 768 tokens marcados como especiales en el tokenizer original (incluidos `[INST]`, `[/INST]` y delimitadores de herramientas) estaban mal etiquetados como NORMAL, y ahora tienen el tipo correcto sin modificar los pesos de los tensores. El autor solo realizo pruebas de humo de inferencia en CPU, no una evaluacion completa de calidad.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat tipo Mistral (`[INST] ... [/INST]`).
- Razonamiento e instrucciones generales heredadas de Mistral-7B-Instruct-v0.3.
- Generacion de codigo y matematicas basicas, dentro de las capacidades del modelo base de 7B.
- Soporte de tool calling / function calling: la plantilla de Ollama incluida gestiona resultados de herramientas con escape JSON e IDs de llamada largos.
- Colacion de mensajes con el mismo rol (consecutive-role) en la plantilla de Ollama incluida.
- Capacidades multilingues: no disponibles de forma explicita en la informacion proporcionada.
- Comportamiento de rechazo drasticamente reducido (4/100 en `harmful_behaviors`), lo que permite respuestas sin filtros de seguridad aprendidos.
- No dispone de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Investigacion sobre seguridad y alineacion: el modelo sirve como referencia controlada para estudiar como la ablacion de rechazo afecta a las respuestas y a la distribucion de salidas, comparando con el Mistral-7B-Instruct-v0.3 original mediante la metrica KL reportada.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa con tematicas adultas o controvertidas que el modelo base rechazaria, ejecutada localmente con Ollama y la cuantizacion Q8_0.
- Asistente conversacional local en hardware de consumo: con Q4_K_M (4,37 GB) cabe en GPUs de 8 GB de VRAM y permite desplegar un chatbot privado sin dependencia de APIs externas.
- Pruebas de red teaming y evaluacion de filtros: usar el modelo como generador de prompts y respuestas adversarias para validar clasificadores de contenido o guardrails en pipelines propios.
- Desarrollo y depuracion de plantillas de chat y tool calling: el GGUF corregido con tokens especiales bien etiquetados y la plantilla de Ollama permiten probar integraciones de function calling con llama.cpp sin los fallos tipicos de tokenizer.
- Prototipado de agentes multi-paso en local: la plantilla incluida soporta round-trips de herramientas con IDs largos y resultados JSON escapados, util para validar flujos de agente antes de migrar a modelos mayores.
- Analisis de texto y extraccion de informacion en entornos aislados (air-gapped): al ser Apache 2.0 y ejecutable con llama.cpp en CPU, puede desplegarse en maquinas sin GPU ni conexion a internet.

## Benchmarks y rendimiento

| Metrica | Antes (Mistral-7B-Instruct-v0.3) | Despues (Mistral-7B-Liberated) |
|---|---|---|
| Rechazos en `harmful_behaviors` | 87 / 100 | 4 / 100 |
| Divergencia KL en `harmless_alpaca` | 0,0 (baseline) | 0,025 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las unicas pruebas adicionales mencionadas son smoke tests de inferencia en CPU para F16, Q6_K y Q8_0, y pruebas de chat, roles consecutivos y round-trip de herramientas para Q8_0, sin evaluacion de calidad exhaustiva.

## Requisitos de hardware

- VRAM estimada para inferencia: Q4_K_M aproximadamente 4,4 GB de pesos (unos 5-6 GB con overhead de contexto); Q6_K aproximadamente 6,0 GB; Q8_0 aproximadamente 7,7 GB; F16 aproximadamente 14,5 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4080 o RTX 4090 para las cuantizaciones Q4_K_M a Q8_0; A100 o H100 para F16 y para servir varias peticiones concurrentes.
- Cabe en GPU de consumo: si. Q4_K_M en GPUs de 8 GB (RTX 3060 Ti, RTX 4060), Q8_0 en GPUs de 10-12 GB.
- Opciones de despliegue: llama.cpp, Ollama (variantes publicadas como `Nurmix/mistral-7b-liberated:q8_0`), y Transformers con los pesos safetensors del repositorio fuente. No se menciona soporte verificado de vLLM o TGI en la informacion disponible.
- Latencia y throughput: no disponibles; el autor solo reporta que las pruebas de humo se ejecutaron en CPU sin mediciones de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos | Licencia | Formato |
|---|---|---|---|---|---|
| Mistral-7B-Liberated-GGUF | 7,25B | no disponible | 4/100 | Apache 2.0 | GGUF |
| Mistral-7B-Instruct-v0.3 (base) | 7,25B | no disponible | 87/100 | Apache 2.0 | safetensors |
| Otras variantes abliterated de Mistral-7B | no disponible | no disponible | no disponible | variable | safetensors, GGUF |

La comparacion directa mas fiable es contra el modelo base, ya que la model card solo aporta datos medidos frente a el. No se dispone de cifras de benchmarks estandar ni de comparaciones con otros modelos abliterated en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo abliterado: el entrenamiento de seguridad y rechazo ha sido eliminado intencionadamente, por lo que puede generar contenido que el modelo original rechazaria. Requiere uso responsable y conformidad con la legislacion aplicable.
- Riesgo de alucinacion: es el propio de un modelo de 7B, sin mejoras especificas; la ablacion no corrige este comportamiento.
- La evaluacion de calidad es limitada: solo se realizaron smoke tests de inferencia y de chat, no una bateria completa de benchmarks.
- Sesgos conocidos: no documentados en la informacion proporcionada, pero heredados del corpus de entrenamiento de Mistral-7B-Instruct-v0.3.
- Limitaciones de contexto e idioma: no se especifican en la model card; los idiomas soportados figuran como no disponibles.
- La plantilla Jinja embebida en el GGUF no ha sido modificada y exige turnos alternos usuario/asistente en clientes distintos de Ollama; la plantilla mejorada solo esta en el `Modelfile` incluido.
- Las copias antiguas del GGUF tenian metadatos de tokens especiales incorrectos; es necesario volver a descargar y verificar con `SHA256SUMS`.
- Licencia Apache 2.0: permite uso comercial, pero no exime de responsabilidad legal sobre el contenido generado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/nurmix/Mistral-7B-Liberated-GGUF
- Modelo fuente en safetensors: https://huggingface.co/nurmix/Mistral-7B-Liberated
- Modelo base original: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Herramienta Heretic: https://github.com/p-e-w/heretic
