# RKNNAI/RK3576-LLM-Qwen3-1.7B

## Resumen

RKNNAI/RK3576-LLM-Qwen3-1.7B es una distribucion de despliegue del modelo Qwen/Qwen3-1.7B convertido y cuantizado al formato RKLLM para ejecutarse sobre la NPU del SoC Rockchip RK3576. No se trata por tanto de un modelo entrenado desde cero, sino de un paquete de artefactos de inferencia (pesos cuantizados, configuraciones y sumas de verificacion SHA-256) publicado por el usuario RKNNAI bajo licencia Apache 2.0, con el objetivo de habilitar inferencia local de un LLM de 1.700 millones de parametros en hardware ARM embebido, sin dependencia de la nube.

El repositorio ofrece siete configuraciones equivalentes en funcion del compromiso entre precision y consumo de memoria: cuatro variantes con cuantizacion w4a16 (4 bits en pesos, 16 bits en activaciones) con ventanas de contexto de 1.024, 2.048, 4.096 y 16.384 tokens, y tres variantes w8a8 (8 bits en pesos y activaciones) con contextos de 1.024, 2.048 y 4.096 tokens. Todas ellas usan dos nucleos NPU del RK3576 y requieren la version v1.2.4 del runtime RKLLM.

Su relevancia actual radica en que permite desplegar un modelo de la familia Qwen3, multilingue y orientado a razonamiento y generacion de codigo, en placas monoplaca (SBC) y dispositivos industriales con RK3576, abriendo la puerta a asistentes, agentes y pipelines de procesamiento de lenguaje completamente locales y privados en el borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada del modelo fuente Qwen3-1.7B); numero de capas y dimensiones no disponibles |
| Parametros totales | 1.700 millones (1.7B, segun el modelo fuente Qwen/Qwen3-1.7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.024, 2.048, 4.096 o 16.384 tokens, segun la configuracion elegida (el 16k solo esta disponible en w4a16) |
| Tipos de cuantizacion | w4a16 (pesos 4 bits, activaciones 16 bits) y w8a8 (pesos 8 bits, activaciones 8 bits) |
| Idiomas soportados | Multilingue segun la serie Qwen3; lista concreta de idiomas no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | RKLLM (formato propietario de Rockchip para su runtime NPU); el repositorio incluye ficheros de configuracion por variante y SHA256SUMS para verificacion |
| Modelo fuente | Qwen/Qwen3-1.7B |
| Chip soportado | Rockchip RK3576 (2 nucleos NPU) |
| Runtime requerido | RKLLM Runtime v1.2.4 |
| Tamano del repositorio | 14,0 GB (todas las configuraciones) |
| Revision | v1.2.4 |

## Arquitectura y entrenamiento

El artefacto publicado no define una arquitectura nueva: es una conversion del modelo Qwen3-1.7B, un transformer decoder-only denso de 1.700 millones de parametros desarrollado por el equipo Qwen de Alibaba Cloud. La model card de esta distribucion no documenta ni el numero de capas, ni la dimension oculta, ni el numero de cabezas de atencion del modelo original, por lo que esos datos deben consultarse en la ficha de Qwen/Qwen3-1.7B. Tampoco se describe en el repositorio el proceso de entrenamiento del modelo base: numero de tokens, composicion del dataset, fases de preentrenamiento, ajuste supervisado, RLHF o DPO son datos no disponibles en la informacion proporcionada.

Lo que si documenta esta distribucion es el proceso de conversion y cuantizacion a RKLLM, orientado a la NPU del RK3576. Se ofrecen dos esquemas de cuantizacion: w4a16, que comprime los pesos a 4 bits manteniendo activaciones en 16 bits (mas ligero, adecuado para contextos largos en memoria limitada), y w8a8, que cuantiza pesos y activaciones a 8 bits (mayor fidelidad numerica a costa de mas memoria). El modelo se reparte entre dos nucleos NPU del SoC, y cada configuracion esta atada a una longitud de contexto fija en tiempo de compilacion, de ahi que existan variantes separadas por tamano de ventana en lugar de una unica configuracion dinamica.

## Capacidades

- Generacion de texto en varios idiomas, heredada de la serie Qwen3, descrita como multilingue por la documentacion del modelo fuente.
- Razonamiento y generacion de codigo, competencias destacadas de Qwen3-1.7B segun las referencias disponibles.
- Resolucion de problemas matematicos basicos e intermedios, dentro de lo esperable en un modelo de 1.7B de parametros.
- Inferencia local en el dispositivo, sin conexion a servicios en la nube, gracias al despliegue sobre la NPU del RK3576.
- Soporte de contextos de hasta 16.384 tokens en la variante w4a16, lo que permite conversaciones multi-turno y documentos moderadamente largos.
- Compatibilidad con servidores de API de terceros: el proyecto RKLLM-API-Server expone una interfaz compatible con OpenAI sobre el runtime RKLLM, lo que facilita integrar el modelo con frontends como Open WebUI.
- Soporte de tool calling, modo de razonamiento explicito (thinking) y comportamiento de agente: no confirmado en la informacion proporcionada para esta distribucion concreta; dependeria de que el runtime y la plantilla de chat de la conversion lo habiliten.

## Casos de uso

- Asistente conversacional local en placa monoplaca: el modelo puede gestionar dialogos multi-turno en un dispositivo RK3576 con la variante w4a16 de 16.384 tokens de contexto, manteniendo toda la conversacion en memoria local y sin enviar datos a servidores externos.
- Procesamiento de lenguaje en el borde industrial: en controladores y gateways con RK3576 se puede clasificar, resumir o extraer informacion de registros y mensajes de maquina en tiempo real, con latencia predecible y sin depender de conectividad.
- Traduccion y asistentes multilingues embebidos: aprovechando la naturaleza multilingue de la serie Qwen3, el modelo puede traducir o asistir a operarios en entornos con varios idiomas en un dispositivo de bajo consumo.
- Asistencia a la programacion en equipos de campo: con la variante de contexto 16k y el soporte de generacion de codigo del modelo fuente, se puede ofrecer autocompletado y explicacion de fragmentos de codigo directamente en el dispositivo de desarrollo.
- Base para asistentes de voz: combinado con modulos de reconocimiento y sintesis de voz en el mismo SoC, el modelo puede actuar como capa de comprension y generacion en altavoces inteligentes o terminales de atencion al cliente fisicos.
- Consulta sobre documentacion tecnica offline: indexando manuales en un sistema de recuperacion local y usando el modelo para responder preguntas, se construye un asistente de soporte que funciona sin red en instalaciones remotas.
- Integracion como backend de aplicaciones compatibles con OpenAI: desplegando el modelo detras de RKLLM-API-Server, cualquier cliente que hable el protocolo de OpenAI puede consumirlo, lo que simplifica sustituir APIs en la nube por inferencia local en pruebas y demos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta distribucion no incluye metricas de MMLU, HumanEval, GSM8K ni de latencia o throughput, y las referencias web consultadas solo describen cualitativamente al modelo fuente como destacado en razonamiento y generacion de codigo, sin cifras. Para datos de evaluacion habria que acudir a la ficha oficial de Qwen/Qwen3-1.7B.

## Requisitos de hardware

- VRAM dedicada: no aplica en sentido estricto; el RK3576 es un SoC con memoria LPDDR compartida entre CPU, GPU y NPU, por lo que los pesos compiten por el mismo espacio de memoria del sistema.
- Requisito de memoria: no disponible de forma exacta por configuracion. El repositorio completo ocupa 14,0 GB porque agrupa las siete variantes; cada variante individual es mucho menor, siendo las w4a16 las mas economicas en memoria y las w8a8 las mas exigentes.
- Acelerador: NPU integrada del Rockchip RK3576, con dos nucleos utilizados por el modelo.
- GPU de escritorio: no aplicable; este paquete esta pensado para la NPU del RK3576 y no para tarjetas graficas como RTX 4090, A100 o H100.
- Compatibilidad con GPU de consumo: no, el artefacto es especifico de la NPU Rockchip y no se ejecuta en GPUs convencionales tal cual.
- Despliegue: runtime RKLLM v1.2.4 sobre el SoC, con ficheros de configuracion por variante. Para exponerlo como servicio se puede usar RKLLM-API-Server, que ofrece una API compatible con OpenAI para RK3588 y RK3576.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RKNNAI/RK3576-LLM-Qwen3-1.7B | 1,7B | 1k a 16k segun variante | w4a16 y w8a8 en formato RKLLM | Apache 2.0 | HuggingFace y ModelScope, revision v1.2.4 |
| Qwen/Qwen3-1.7B (original) | 1,7B | No disponible en la informacion proporcionada | safetensors u otros formatos estandar (no especificado) | Apache 2.0 | HuggingFace |
| RKNNAI/RK3576-LLM-Qwen3-4B-Instruct-2507 | 4B | No disponible en la informacion proporcionada | Formato RKLLM | Apache 2.0 | HuggingFace |

El modelo original Qwen3-1.7B sirve como referencia de capacidades y precision sin cuantizacion, mientras que la variante de 4B del mismo autor ofrece mas calidad potencial a costa de mayor consumo de memoria en el RK3576. No se dispone de datos de rendimiento comparados entre estas opciones.

## Limitaciones y advertencias

- Modelo de 1.7B de parametros: su capacidad de razonamiento y su conocimiento factual son limitados en comparacion con modelos de mayor tamano, y es mas propenso a errores en tareas complejas.
- Riesgo de alucinacion inherente a los LLM, agravado por el tamano reducido del modelo y por la cuantizacion a 4 u 8 bits, que puede degradar la fidelidad de las respuestas.
- La cuantizacion w4a16 y w8a8 introduce perdida de precision respecto al modelo original; no se documentan en el repositorio evaluaciones del impacto de esa perdida.
- La longitud de contexto esta fijada por configuracion en tiempo de compilacion, no es ajustable en tiempo de ejecucion; elegir 16k obliga a usar la variante w4a16.
- Dependencia estricta del hardware: los pesos solo funcionan con el runtime RKLLM v1.2.4 sobre chips RK3576, y el autor advierte de que hay que usar ficheros de la misma configuracion.
- Idiomas soportados no detallados: aunque la serie Qwen3 es multilingue, no se especifica en esta distribucion la cobertura real por idioma ni su calidad.
- Licencia Apache 2.0, que permite uso comercial, pero conviene revisar el fichero LICENSE del repositorio y respetar los avisos de copyright del modelo original.
- Repositorio de 14,0 GB: descargar la totalidad de las configuraciones consume ancho de banda y almacenamiento, por lo que se recomienda descargar solo la variante necesaria.
- Sin descargas ni likes registrados y publicado por un autor independiente: no hay validacion externa de la calidad de la conversion.
- Conviene verificar la integridad de los pesos con sha256sum -c SHA256SUMS antes de desplegar, tal y como indica la documentacion del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RKNNAI/RK3576-LLM-Qwen3-1.7B
- Modelo fuente en HuggingFace: https://huggingface.co/Qwen/Qwen3-1.7B
- Otra conversion RKLLM del mismo autor: https://huggingface.co/RKNNAI/RK3576-LLM-Qwen3-4B-Instruct-2507
- Servidor de API compatible con OpenAI para Rockchip NPU: https://github.com/GatekeeperZA/RKLLM-API-Server
- Documentacion de RKLLM en ROC-RK3576-PC: https://www.aipaipai.wiki/en/firefly/ROC-RK3576-PC/usage_rkllm
- Ficha de Qwen3-1.7B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_1_7b
