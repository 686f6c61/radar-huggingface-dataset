# Denovarix/Denovarix-AI-4B

## Resumen

Denovarix AI 4B es un modelo de lenguaje de 4.000 millones de parámetros desarrollado por Denovarix Technologies LLP (West Bengal, India) como componente central de Nova, el asistente integrado en su sistema operativo DNX OS. El modelo está especializado en dos tareas concretas: la selección y parametrización de herramientas (tool calling) a partir de peticiones en lenguaje natural, y la extracción de datos estructurados de documentos empresariales indios, como facturas con GSTIN, número de factura, fecha, totales y proveedor.

La propuesta diferencial es la ejecución local en CPU de un PC de oficina mediante llama.cpp, sin necesidad de GPU ni de servicios en la nube, de modo que las consultas y los ficheros procesados no abandonan la máquina del usuario. El modelo cubre inglés, hindi y bengalí, lo que lo orienta a mercados del sur de Asia.

Es relevante ahora porque ejemplifica una tendencia de modelos pequeños y verticales para entornos on-device con requisitos de privacidad estrictos. No obstante, en el momento de redactar esta ficha los pesos no están publicados: el modelo se distribuye únicamente dentro de DNX OS, cuya beta abre en diciembre de 2026, y el acceso para evaluación o licencia se gestiona por contacto directo con la empresa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de 4B parámetros, sin detalle publicado) |
| Parametros totales | 4.000 millones |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor indica ejecución en CPU mediante llama.cpp, lo que implica soporte GGUF, aunque no se detallan los niveles) |
| Idiomas soportados | inglés (en), hindi (hi), bengalí (bn) |
| Licencia | no disponible |
| Formato de pesos | no disponible (pesos no publicados en Hugging Face) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo más allá de su tamaño de 4.000 millones de parámetros y de que se ejecuta en CPU a través de llama.cpp. No se especifica si emplea atención estándar, variantes lineales, mezcla de expertos ni ninguna otra innovación de eficiencia; tampoco se detalla la longitud de contexto soportada.

Según la model card, el entrenamiento se basó en dos fuentes: casos de decisión de herramientas generados a partir del conjunto de herramientas propio de DNX OS, y documentos empresariales indios sintéticos. No se indica el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documenta ninguna técnica de decodificación especulativa u optimización de inferencia más allá del uso de llama.cpp.

## Capacidades

- Generación de texto y conversación multi-turno como base del asistente Nova en DNX OS.
- Tool calling / function calling: ante una petición como "envía un correo a Priya diciendo que el piloto empieza el lunes", selecciona la herramienta adecuada y rellena sus parámetros.
- Gestión de ambigüedad: puede responder directamente o solicitar el dato que falta antes de actuar.
- Confirmación humana obligatoria para acciones que modifican estado: toda operación con efectos se muestra al usuario para aprobación previa.
- Comprensión de documentos empresariales: extracción de GSTIN, número de factura, fecha, totales y proveedor en facturas y documentos similares.
- Multilingüismo limitado a inglés, hindi y bengalí, incluyendo documentos indios en esos tres idiomas.
- Ejecución on-device en CPU, sin GPU ni nube, con los datos permaneciendo en la máquina.
- No se documentan capacidades de visión, audio, modo de razonamiento explícito ni agentes autónomos de múltiples pasos más allá del bucle de decisión de herramienta.

## Casos de uso

- Asistente de escritorio integrado en DNX OS: el modelo interpreta peticiones en lenguaje natural y decide si responder, invocar una herramienta o pedir aclaración, con confirmación del usuario antes de ejecutar acciones que modifican estado.
- Automatización de correo y calendario: a partir de una instrucción como "avisa a Priya de que el piloto empieza el lunes", rellena los parámetros de la herramienta de correo o calendario correspondiente y solicita aprobación antes del envío.
- Digitalización de facturas indias: procesa facturas con GSTIN y extrae campos estructurados (número, fecha, totales, proveedor) en inglés, hindi y bengalí, útil para contabilidad y gestión de proveedores en pymes.
- Gestión documental en entornos con requisitos de privacidad: al ejecutarse en CPU local, permite procesar documentos financieros sin enviarlos a la nube, lo que encaja en despachos contables o administraciones con políticas estrictas de residencia de datos.
- Despliegue en equipos de oficina sin GPU: adecuado para parques de PCs corporativos donde no hay aceleradores disponibles, usando llama.cpp sobre CPU.
- Flujos de aprobación humana en operaciones sensibles: el patrón de mostrar toda acción antes de ejecutarla sirve para construir asistentes internos donde ninguna operación con efectos se ejecuta sin validación.
- Atención al cliente en hindi y bengalí: conversaciones multi-turno en esos idiomas para mercados del sur de Asia, siempre que se valide previamente la calidad real del modelo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica de forma directa; el autor indica ejecución en CPU de un PC de oficina mediante llama.cpp, sin GPU.
- GPU recomendadas: no disponibles; el diseño no las requiere.
- Compatibilidad con GPU de consumo: no documentada; al no publicarse pesos ni cuantizaciones concretas, no es posible confirmar el comportamiento en tarjetas como RTX 4090.
- Opciones de despliegue: llama.cpp es el runtime indicado por el autor; no se mencionan vLLM, TGI, Ollama ni otros motores.
- Latencia y throughput: no disponibles.
- Huella de memoria estimada: no disponible; para un modelo de 4B parámetros, las cifras dependen de la cuantización, que no se ha especificado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| Denovarix AI 4B | 4B | no disponible | Tool calling y documentos indios, on-device en CPU | no disponible | No publicados; solo dentro de DNX OS (beta diciembre 2026) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos de la misma categoría, dado que no se han publicado pesos, benchmarks ni especificaciones de contexto y cuantización del modelo evaluado.

## Limitaciones y advertencias

- Pesos no publicados: la model card indica explícitamente que los pesos no están disponibles en Hugging Face; el acceso requiere contacto con Denovarix para evaluación, licencia o piloto.
- Licencia no especificada: no se indica la licencia, por lo que no puede confirmarse el uso comercial ni las condiciones de redistribución.
- Idiomas limitados a inglés, hindi y bengalí; no hay soporte documentado de castellano ni de otras lenguas.
- Entrenamiento con datos sintéticos: los documentos de entrenamiento son sintéticos, lo que puede reducir la robustez ante facturas reales con formatos, ruido o escaneos de baja calidad.
- Riesgo de alucinación no evaluado: no se han publicado métricas de fiabilidad en extracción de campos ni en selección de herramientas.
- Contexto desconocido: sin longitud de contexto publicada, no puede garantizarse el comportamiento en conversaciones largas o documentos extensos.
- Sesgos no documentados: no se han publicado evaluaciones de sesgo para los tres idiomas soportados.
- Madurez del producto: el modelo se distribuye dentro de un sistema operativo en beta (diciembre de 2026), por lo que su estabilidad y soporte en producción no están contrastados.
- Sin datos de rendimiento: la ausencia de benchmarks impide validar las afirmaciones cualitativas de la model card.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/Denovarix/Denovarix-AI-4B
- Sitio web de Denovarix: https://denovarix.com
- Página de DNX OS: https://denovarix.com/dnx-os/
- Programa beta de DNX OS: https://denovarix.com/beta/
- Contacto: hello@denovarix.com
