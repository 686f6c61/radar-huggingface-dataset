# Dhdjxkxdnsbzj/appsec-lfm3-cyber-adapter-stage3

## Resumen

Cyber-LFM3-Stage3 es un adaptador LoRA (PEFT) sobre el modelo base LiquidAI/LFM-1.7B, desarrollado por el usuario Dhdjxkxdnsbzj y publicado en HuggingFace. Su proposito es dotar a un modelo de lenguaje pequeno (SLM) de 1.700 millones de parametros de capacidades duales de seguridad de aplicaciones: analisis estatico de codigo (SAST) y pruebas dinamicas de caja negra (DAST). El adaptador se entrena sobre un corpus unificado de 334 trayectorias cerradas de SAST y DAST destiladas con el Microsoft Agent Framework.

El modelo aborda un problema concreto: la mayoria de herramientas de AppSec requieren pipelines especializados o modelos grandes desplegados en infraestructura cloud. Este adaptador busca ofrecer capacidades de deteccion de vulnerabilidades en un formato compacto, ejecutable localmente incluso en CPU, lo que facilita su integracion en entornos con restricciones de privacidad o recursos.

La relevancia actual radica en su enfoque de "agente de seguridad" que combina razonamiento sobre codigo fuente (SAST) con interaccion HTTP pura (DAST) mediante tool calling (`http_request`, `curl_command`), sin acceso al codigo en el segundo caso. No obstante, la informacion publicada es muy limitada: el repositorio tiene 0 descargas, 0 likes, 0.0 GB de tamano y no se especifica licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre LiquidAI/LFM-1.7B (modelo base Liquid Foundation Model) |
| Parametros totales | 1.7B (modelo base); parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se describe como FP32 sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye como un LoRA sobre el modelo LiquidAI/LFM-1.7B, un modelo de la familia Liquid Foundation Models. La model card no detalla la arquitectura interna del modelo base (transformer, SSM o hibrida), por lo que este dato no esta disponible en la informacion proporcionada. El adaptador se distribuye en formato PEFT con pesos safetensors y se describe como no cuantizado en FP32.

El entrenamiento se realizo sobre un corpus unificado de 334 trayectorias cerradas (closed-loop) de SAST y DAST, destiladas mediante el Microsoft Agent Framework. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF o DPO. La innovacion destacable es el enfoque dual: el modelo aprende tanto a razonar sobre codigo fuente (SAST) como a interactuar exclusivamente por sockets HTTP (`http_request`, `curl_command`) sin acceso al codigo (DAST), emulando el comportamiento de un agente de pruebas de caja negra.

## Capacidades

- Analisis estatico de codigo (SAST): identificacion de vulnerabilidades en codigo fuente, con precision del 100% reportada en el benchmark held-out VulnGym `open-webui` (advisory GHSA-JJP7-G2JW-WH3J, 0 falsos positivos).
- Pruebas dinamicas de caja negra (DAST): interaccion exclusiva via HTTP mediante herramientas (`http_request`, `curl_command`), sin acceso al codigo fuente.
- Descubrimiento de bypass de autenticacion y exposicion de datos sensibles.
- Generacion de advisories de vulnerabilidad estructurados con PoC reproducibles.
- Tool calling / function calling orientado a agentes de seguridad.
- Integracion con Microsoft Agent Framework (segun los tags del repositorio).
- Generacion de texto y conversacion (pipeline text-generation).
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Auditoria SAST en CI/CD: el adaptador puede integrarse en pipelines de integracion continua para analizar diffs de codigo fuente y reportar vulnerabilidades antes del merge, aprovechando su capacidad de analisis estatico con baja tasa de falsos positivos reportada.
- Pentesting automatizado de APIs: mediante las herramientas `http_request` y `curl_command`, el modelo puede explorar endpoints HTTP en busca de bypass de autenticacion y exposicion de datos, sin necesidad de acceso al codigo fuente del objetivo.
- Generacion de advisories de seguridad: el modelo produce informes estructurados con PoC reproducibles, utiles para equipos de respuesta a incidentes o programas de bug bounty.
- Despliegue en entornos air-gapped: al ser un adaptador sobre un modelo de 1.7B ejecutable en CPU, puede desplegarse en estaciones de trabajo aisladas o entornos con requisitos estrictos de privacidad donde no se permite enviar codigo a servicios cloud.
- Formacion y concienciacion en seguridad: el modelo puede simular escenarios de ataque y explicar vulnerabilidades en entornos de entrenamiento para desarrolladores.
- Triaje de hallazgos: uso como primer filtro para clasificar alertas de escaneres tradicionales, reduciendo el ruido antes de la revision humana.
- Asistente de revision de codigo en IDE: integracion local para senalar patrones inseguros mientras el desarrollador escribe, gracias a su huella reducida.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| VulnGym `open-webui` (SAST, held-out) | 100% precision, 0 falsos positivos | Advisory GHSA-JJP7-G2JW-WH3J |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los datos de rendimiento DAST no se cuantifican en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo base de 1.7B en FP16 requiere aproximadamente 3,4 GB, y en cuantizacion de 4 bits alrededor de 1 GB (estimacion estandar para 1.7B, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamano, el modelo base es compatible con GPUs consumer como RTX 3060, RTX 4060, RTX 4090, asi como A100/H100 para despliegues de mayor throughput.
- Cabe en GPU consumer: si, segun el tamano del modelo base (1.7B); el autor afirma que puede ejecutarse completamente en CPU.
- Opciones de despliegue: el adaptador es PEFT, por lo que requiere cargarse junto al modelo base mediante librerias compatibles (transformers + peft). No se confirman opciones como vLLM, llama.cpp, Ollama o TGI para este adaptador concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (SLM especializados en AppSec con capacidades SAST/DAST duales). Como referencia, el modelo base LiquidAI/LFM-1.7B comparte categoria de tamano con otros SLM de 1-2B parametros, pero no se dispone de datos de rendimiento comparativo en tareas de seguridad para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Informacion muy escasa: el repositorio tiene 0 descargas y 0 likes, con fecha de creacion y actualizacion muy proximas (segundos de diferencia), lo que sugiere una publicacion reciente y sin validacion comunitaria.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Es imprescindible verificar la licencia del modelo base LiquidAI/LFM-1.7B antes de cualquier uso en produccion.
- Idiomas no disponibles: se desconoce el soporte multilingue real.
- Riesgo de alucinacion: como todo modelo generativo, puede inventar vulnerabilidades o PoC no reproducibles; la cifra de 100% de precision se limita a un unico benchmark held-out y no debe generalizarse.
- Sesgo de entrenamiento: el corpus de 334 trayectorias es reducido y puede no cubrir la diversidad de stacks, lenguajes y frameworks del mundo real.
- El DAST opera exclusivamente por HTTP; no cubre vectores fuera de ese canal (por ejemplo, binarios, protocolos no HTTP o analisis de red).
- El tamano del repositorio (0.0 GB) no permite verificar la integridad de los pesos publicados.
- No se especifican limitaciones de contexto ni de idioma, lo que impide evaluar su comportamiento en entradas largas.
- Uso etico: las capacidades DAST deben emplearse unicamente sobre sistemas con autorizacion explicita; el modelo podria facilitar actividades no autorizadas si se usa sin controles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dhdjxkxdnsbzj/appsec-lfm3-cyber-adapter-stage3
- Modelo base: https://huggingface.co/LiquidAI/LFM-1.7B
- Advisory GHSA-JJP7-G2JW-WH3J (referenciado en la model card): https://github.com/advisories/GHSA-JJP7-G2JW-WH3J
- Microsoft Agent Framework (mencionado en la model card): no disponible enlace directo en la informacion proporcionada
- Paper o blog del adaptador: no disponible
