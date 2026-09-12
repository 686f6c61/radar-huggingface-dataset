# qualcomm/IndusQ-1.1B

## Resumen

IndusQ-1.1B es un modelo de lenguaje de tipo decoder, orientado a generacion de texto, que Qualcomm distribuye empaquetado y optimizado para ejecucion en dispositivos con sus chips (moviles y plataformas embebidas). No es un modelo entrenado desde cero por Qualcomm: parte de la implementacion de Project Indus, un modelo fundacional para lenguas indias desarrollado por Tech Mahindra, y sobre el que se ha aplicado un ajuste fino supervisado (SFT) especificamente para hindi y sus dialectos. Qualcomm aporta el proceso de exportacion, cuantizacion y compilacion para su runtime QNN.

El interes practico reside en su naturaleza on-device: con aproximadamente 1.100-1.200 millones de parametros y cuantizacion w4a16 (mas w8a16 en unas pocas capas), esta pensado para inferencia local en hardware Snapdragon sin depender de la nube. La model card reporta una tasa de generacion de 74,6 tokens por segundo y un tiempo hasta el primer token de entre 0,028 y 0,228 segundos en Snapdragon 8 Elite Mobile y Qualcomm Dragonwing Q-8750, cifras relevantes para asistentes conversacionales embebidos.

Es relevante ahora porque cubre el nicho de LLM multilingues (hindi e ingles) ejecutables en el propio dispositivo, un segmento donde la mayoria de alternativas de ~1B estan centradas en ingles. Conviene senalar que la distribucion no es abierta: el modelo se ofrece bajo licencia "other" y la propia model card indica que esta disponible para su compra, previo contacto con Qualcomm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la informacion disponible (modelo de lenguaje tipo LLM decoder; la model card solo indica "llm" y "text-generation") |
| Parametros totales | 1,1B-1,2B (la model card cita "1.2 billion parameter model" y "Number of parameters: 1B") |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 1024 tokens en Max context length; la tabla de rendimiento indica 4096 (dato contradictorio en la model card). Entrada del Prompt Processor: 128 tokens |
| Tipos de cuantizacion | w4a16, mas w8a16 en unas pocas capas (exportacion QNN) |
| Idiomas soportados | Hindi e ingles (los metadatos de HuggingFace no listan idiomas) |
| Licencia | other (modelo disponible para compra; contactar con Qualcomm para opciones de licencia) |
| Formato de pesos | Ficheros pre-exportados optimizados para dispositivos Qualcomm (runtime QNN_CONTEXT_BINARY); libreria declarada: pytorch |
| Runtime minimo | QNN SDK 2.27.7 |
| Tipo de modelo | text_generation |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna (no indica si es transformer clasico, MoE o hibrido, ni el numero de capas, dimensiones o mecanismo de atencion), por lo que este dato queda como no disponible. Lo que si se explicita es el proceso de adaptacion: el modelo deriva de la implementacion de Project Indus alojada en `nickmalhotra/ProjectIndus` y ha recibido un ajuste fino supervisado (SFT) orientado a hindi y dialectos. No hay informacion en la documentacion proporcionada sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineacion adicionales como RLHF o DPO.

El trabajo propio de Qualcomm se centra en el despliegue: exportacion de los pesos, cuantizacion a 4 bits para la mayoria de capas (w4a16) con algunas capas en 8 bits (w8a16), y compilacion mediante Qualcomm AI Hub Workbench para el runtime QNN. La inferencia se organiza en dos fases: un Prompt Processor que procesa la entrada en iteraciones de 128 tokens y un Token Generator que produce los tokens siguientes. Esta particion es la que explica el rango de TTFT (de 0,028 s para prompts cortos hasta 0,228 s para el contexto completo).

## Capacidades

- Generacion de texto conversacional en hindi e ingles.
- Ajuste especifico para hindi y dialectos, lo que le da cobertura linguistica poco habitual en modelos de ~1B.
- Ejecucion on-device en hardware Qualcomm (Snapdragon, Dragonwing) mediante el runtime QNN.
- Flujo de inferencia en dos etapas (prompt processing y token generation), apto para dialogos multi-turno dentro de la ventana de contexto disponible.
- Capacidades de tool calling / function calling: no disponibles en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles; es un modelo puramente de texto.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes conversacionales embebidos en movil: el modelo puede gestionar dialogos multi-turno en hindi e ingles directamente en el dispositivo, con una tasa de 74,6 tokens/s que permite respuestas fluidas sin conexion a la nube.
- Traduccion asistida hindi-ingles en local: util para aplicaciones de mensajeria o productividad que necesiten convertir texto entre ambos idiomas manteniendo la privacidad del contenido en el propio terminal.
- Atencion al cliente en mercados indios: un chatbot desplegado en hardware Qualcomm puede responder consultas en hindi y dialectos, reduciendo costes de inferencia en servidor y latencia de red.
- Funciones de accesibilidad y dictado inteligente: integrado en teclados o asistentes del sistema para autocompletar y reformular texto en hindi sobre el dispositivo.
- Prototipado de IA generativa en dispositivos sin GPU dedicada: sirve para validar productos on-device donde el presupuesto de computo y energia es muy ajustado (modelo de ~1B cuantizado a 4 bits).
- Educacion y contenidos localizados: generacion de material de estudio o resumenes en hindi para aplicaciones offline, siempre que se respeten las restricciones de uso de la licencia (ver limitaciones).
- Investigacion en eficiencia de LLM: caso de estudio para evaluar tecnicas de cuantizacion w4a16 y particion prompt-processor/token-generator en moviles.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks academicos (MMLU, HumanEval, GSM8K, etc.); unicamente incluye metricas de rendimiento de inferencia.

| Modelo | Runtime | Precision | Chipset | Context Length | Response Rate (tokens/s) | Time To First Token (rango, s) |
|---|---|---|---|---|---|---|
| IndusQ-1.1B | QNN_CONTEXT_BINARY | w4a16 | Snapdragon 8 Elite Mobile | 4096 | 74,6 | 0,028561 - 0,228489 |
| IndusQ-1.1B | QNN_CONTEXT_BINARY | w4a16 | Qualcomm Dragonwing Q-8750 | 4096 | 74,6 | 0,028561 - 0,228489 |

Nota: "Response Rate" se define como la tasa de generacion de respuesta despues del primer token; el rango de TTFT depende de la longitud del prompt (limite inferior para prompts de hasta 128 tokens, limite superior para el contexto completo). No se han publicado resultados de benchmarks de calidad en la informacion disponible.

## Requisitos de hardware

- Plataforma objetivo: Qualcomm Snapdragon 8 Elite Mobile y Qualcomm Dragonwing Q-8750 (datos de rendimiento reportados en esos chips).
- Runtime: QNN SDK version 2.27.7 o superior; empaquetado como QNN_CONTEXT_BINARY.
- VRAM estimada para inferencia en GPU de proposito general (estimacion orientativa, no aportada por el autor): en torno a 0,7-1 GB con pesos de 4 bits y menos de 3 GB en FP16 para un modelo de ~1,1B. Cabe en practicamente cualquier GPU consumer moderna.
- GPU recomendadas para un despliegue en servidor: no especificadas por el autor; el modelo esta orientado a aceleradores Qualcomm, no a A100/H100/RTX 4090.
- Cabe en GPU consumer: si, pero la via de despliegue prevista no es CUDA sino el runtime QNN sobre hardware Qualcomm.
- Opciones de despliegue documentadas: Qualcomm AI Hub Models (libreria de exportacion), Qualcomm AI Hub Workbench para compilar, perfilar y evaluar. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia/throughput: 74,6 tokens/s y TTFT de 0,028-0,228 s en los chipsets indicados.
- Requiere registro en Qualcomm AI Hub para ejecutar los modelos en un dispositivo Qualcomm alojado.

## Comparativa con modelos similares

Parte de los datos de la siguiente tabla (parametros, contexto y licencia de las alternativas) provienen de conocimiento publico general y no de la informacion proporcionada; los valores de rendimiento no se comparan porque el autor no publica benchmarks academicos.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IndusQ-1.1B | 1,1B-1,2B | 1024 / 4096 (segun la model card) | Hindi e ingles | other (de pago) | Pre-exportado para Qualcomm; compra previo contacto |
| ProjectIndus (modelo origen) | ~1,2B | No disponible | Hindi y dialectos | No disponible | HuggingFace (nickmalhotra/ProjectIndus) |
| Llama 3.2 1B | 1,23B | 128K | Multilingue | Llama 3.2 Community License | Pesos abiertos |
| Qwen2.5 1.5B | 1,54B | 32K | Multilingue | Apache 2.0 | Pesos abiertos |
| Gemma 2 2B | 2,6B | 8K | Multilingue | Gemma Terms | Pesos abiertos |

Comparativa de rendimiento frente a estas alternativas: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: se distribuye bajo licencia "other" y esta disponible para compra. La propia model card remite a contactar con Qualcomm para opciones de licencia; no es un modelo de uso libre.
- Uso comercial sujeto a contratacion: no puede asumirse su explotacion comercial sin acordar licencia con Qualcomm.
- Contexto limitado: la documentacion es contradictoria (1024 frente a 4096 tokens). El Prompt Processor trabaja en bloques de 128 tokens, lo que penaliza conversaciones muy largas.
- Idiomas acotados: solo hindi e ingles; no hay soporte multilingue amplio confirmado. Los metadatos de HuggingFace no listan idiomas.
- Riesgo de alucinacion: inherente a los LLM; no se aportan datos de evaluacion de fidelidad ni de tasas de error.
- Sesgos: no se documenta informacion sobre sesgos, composicion del dataset de entrenamiento ni evaluaciones de equidad.
- Arquitectura y datos de entrenamiento no transparentes: se desconoce el numero de tokens, la mezcla del corpus y si hubo RLHF/DPO, lo que dificulta evaluar su comportamiento en dominios especificos.
- Dependencia de hardware Qualcomm: el paquete esta optimizado para el runtime QNN; no se documentan rutas de despliegue para ecosistemas CUDA/CPU estandar.
- Usos prohibidos explicitos: la model card prohibe emplearlo en acceso a servicios esenciales, administracion de justicia y procesos democraticos, reconocimiento de estados emocionales, sistemas biometricos, educacion y formacion, empleo y gestion de trabajadores, explotacion de vulnerabilidades, puntuacion social, aplicacion de la ley, infraestructura critica, migracion/asilo/control fronterizo, "predictive policing", identificacion biometrica remota en tiempo real en espacios publicos, sistemas de recomendacion en redes sociales, recoleccion de imagenes faciales y manipulacion subliminal.
- Estado del repositorio: cero descargas y cero "likes" en el momento de la consulta, lo que sugiere adopcion muy baja y poca validacion por parte de la comunidad.
- Posible desactualizacion: aunque el registro se creo en octubre de 2024, la ultima actualizacion figurada es de septiembre de 2026; conviene verificar la version vigente antes de integrarlo.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/qualcomm/IndusQ-1.1B
- Modelo origen (implementacion): https://huggingface.co/nickmalhotra/ProjectIndus
- Qualcomm AI Hub Models (libreria de exportacion): https://github.com/qualcomm/ai-hub-models/blob/v0.62.2/src/qai_hub_models/models/indus_1b
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Registro en Qualcomm AI Hub: https://myaccount.qualcomm.com/signup
- Project Indus (Tech Mahindra): https://www.techmahindra.com/makers-lab/indus-project/
- Comunidad AI Hub Slack: https://aihub.qualcomm.com/community/slack
- Soporte Qualcomm AI Hub: mailto:ai-hub-support@qti.qualcomm.com
