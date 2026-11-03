# APLUX-Agora/Qwen3-4B-instruct-2507

## Resumen

Qwen3-4B-instruct-2507 es una compilación de recursos del modelo Qwen3-4B-Instruct-2507 de Alibaba Qwen, publicada por APLUX-Agora bajo el paraguas de su plataforma Agora para dispositivos AIoT. No se trata de un modelo entrenado desde cero ni de una variante con pesos nuevos: el repositorio contiene los artefactos compilados (shards `.serialized.bin`, configuraciones de runtime, tokenizadores y cachés KV de prefijo) necesarios para ejecutar el modelo sobre aceleradores Qualcomm Hexagon (QNN 2.36) en distintas plataformas SoC.

El interés de esta ficha radica en que documenta un caso de despliegue edge de un LLM de 4 000 millones de parámetros sobre hardware móvil y embebido, un escenario cada vez más relevante para asistentes on-device, domótica, robótica de bajo consumo y terminales industriales. La compilación fija la ventana de contexto efectiva en 4096 tokens, independientemente de la capacidad superior del modelo original, y distribuye paquetes separados para QCS8275, QCS8550, QCS8625 y QCS9075.

El modelo subyacente es un transformer denso de la familia Qwen3 en su variante Instruct de julio de 2025, con licencia Apache-2.0 en origen. Los artefactos convertidos, en cambio, quedan sujetos a la APLUX Model Farm License, lo que introduce una asimetría legal relevante para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), compilado para Qualcomm QNN 2.36 (HTP backend) |
| Parámetros totales | 4 000 millones (modelo base Qwen3-4B-Instruct-2507) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens en los paquetes compilados (el modelo original soporta más, pero no se especifica en la información disponible) |
| Tipos de cuantización | no disponible (los shards `.serialized.bin` están precompilados para QNN; no se documenta el esquema de cuantización) |
| Idiomas soportados | no disponible (la model card no detalla idiomas; el modelo Qwen3 original es multilingüe) |
| Licencia | APLUX Model Farm License para los artefactos convertidos; Apache-2.0 para el modelo fuente |
| Formato de pesos | `.serialized.bin` (shards QNN), JSON de configuración de runtime, tokenizador y cachés KV de prefijo |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only denso de la familia Qwen3, con 4 000 millones de parámetros, afinado como Instruct en la revisión 2507 (julio de 2025). No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF, DPO) del modelo original; esos datos corresponden a la model card oficial de Qwen, no incluida aquí.

La contribución específica de este repositorio es la conversión y compilación del modelo para el stack Qualcomm QNN 2.36, con backend HTP. Cada paquete de destino incluye tres shards `.serialized.bin`, configuraciones JSON de runtime (`config_linux.json`, `aidgen_config.json`, `htp_backend_ext_config.json`), tokenizador, prompt de ejemplo y recursos de caché KV de prefijo (`prefix-kvcache`). El uso de caché de prefijo permite reutilizar el estado de atención de un contexto inicial fijo (por ejemplo, un system prompt), reduciendo la latencia del primer token en conversaciones multi-turno. La compilación fija el contexto en 4096 tokens, limitación que debe asumirse como propia de estos artefactos y no del modelo fuente.

## Capacidades

- Generación de texto conversacional en modo Instruct, heredada del modelo Qwen3-4B-Instruct-2507.
- Razonamiento y respuesta a instrucciones multi-turno dentro de la ventana de 4096 tokens.
- Generación de código y resolución de tareas de matemáticas básicas, según las capacidades del modelo fuente (no verificadas en esta compilación).
- Soporte multilingüe heredado del modelo original (no se documenta la lista concreta de idiomas en esta model card).
- Inferencia on-device sobre aceleradores Qualcomm Hexagon mediante QNN 2.36 y runtimes Genie o AidGen.
- Reutilización de caché KV de prefijo para acelerar el arranque de conversaciones con contexto fijo.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en esta compilación.

## Casos de uso

- Asistentes de voz on-device en terminales industriales: el paquete QCS8550 o QCS9075 permite ejecutar un LLM de 4B en el propio dispositivo, sin enviar audio ni transcripciones a la nube, con contexto de 4096 tokens suficiente para diálogos de soporte técnico de varias interacciones.
- Domótica y electrodomésticos conectados: sobre QCS8275, el modelo puede interpretar comandos en lenguaje natural y generar confirmaciones contextuales dentro de un presupuesto de cómputo y memoria propio de un SoC de gama media.
- Robótica móvil y AGV: la inferencia local con caché de prefijo permite mantener un system prompt de misión fijo y responder a instrucciones operativas con baja latencia, sin depender de conectividad.
- Kioscos interactivos y señalización digital: el paquete compilado se integra con el runtime Genie/AidGen del fabricante para ofrecer respuestas generativas en pantallas públicas con contexto limitado y controlado.
- Procesamiento de lenguaje natural en el borde para telemetría: resumir o clasificar textos cortos (alertas, logs, informes de incidencia) localmente antes de transmitir solo el resultado agregado.
- Prototipado de aplicaciones AIoT con Qualcomm AI Hub: usar los paquetes como referencia para validar latencia, consumo y precisión en placas QCS antes de diseñar un producto final.
- Sustitución de reglas por lenguaje natural en interfaces de configuración: el modelo puede traducir peticiones del usuario a parámetros de configuración de un dispositivo, siempre que se valide la salida con un parser determinista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Plataformas de destino: Qualcomm QCS8275, QCS8550, QCS8625 y QCS9075, con QNN 2.36 y backend HTP.
- VRAM estimada: no disponible; el modelo se ejecuta sobre memoria unificada del SoC, no sobre VRAM dedicada. El repositorio completo ocupa aproximadamente 12,55 GiB, aunque cada paquete de destino es un subconjunto.
- GPU de escritorio: no aplica; estos artefactos no están pensados para A100, H100 ni RTX 4090. Para ejecutar el modelo fuente en GPU convencional debe recurrirse a los pesos originales de Qwen en HuggingFace.
- Consumer GPU: no aplica a esta compilación.
- Opciones de despliegue: runtime Qualcomm Genie o AidGen instalado por separado, más las configuraciones JSON incluidas. No se proporciona `run.py`, CLI ni binarios del SDK.
- Latencia y throughput: no disponibles. La model card advierte que los registros de rendimiento de ModelFarm pueden usar backends o configuraciones distintos y no constituyen una cualificación de hardware Agora.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-4B-Instruct-2507 (APLUX-Agora, esta ficha) | 4B | 4096 (compilado) | APLUX Model Farm License (artefactos) / Apache-2.0 (fuente) | HuggingFace, paquetes QNN por SoC |
| Qwen3-4B-Instruct-2507 (original, Qwen) | 4B | según model card oficial (no disponible aquí) | Apache-2.0 | HuggingFace, safetensors |
| Otros LLM edge para QNN | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre alternativas comparables compiladas para QNN en la documentación proporcionada; la comparativa se limita al contraste entre esta compilación y el modelo fuente original.

## Limitaciones y advertencias

- La ventana de contexto efectiva es de 4096 tokens, muy inferior a la del modelo fuente; no debe asumirse la capacidad de contexto original al diseñar la aplicación.
- El repositorio contiene recursos compilados, no una aplicación de inferencia autónoma: es necesario instalar y configurar un runtime Qualcomm Genie o AidGen compatible por separado.
- La licencia de los artefactos convertidos es la APLUX Model Farm License, distinta de la Apache-2.0 del modelo fuente; debe revisarse el PDF de licencia antes de cualquier uso comercial.
- La ejecución en dispositivos cloud de Agora no ha sido cualificada para esta copia, según la propia model card.
- No se documentan sesgos, tasas de alucinación ni evaluaciones de seguridad específicas para esta compilación.
- No se especifican los idiomas soportados ni el esquema de cuantización aplicado en la compilación, lo que dificulta estimar la degradación de calidad frente al modelo original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria de su funcionamiento.
- Los nombres de destino son los originales del paquete fuente; es responsabilidad del integrador elegir la configuración de runtime y placa correcta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/APLUX-Agora/Qwen3-4B-instruct-2507
- Modelo fuente: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Ficha en ModelFarm: https://aiot.aidlux.com/en/models/detail/288
- Licencia de los artefactos: https://huggingface.co/APLUX-Agora/Qwen3-4B-instruct-2507/blob/main/LICENSE_MODEL_FARM.pdf
