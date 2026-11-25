# lm-kit/laya-gguf

## Resumen

Laya es un modelo de decisión compacto desarrollado por Convai Innovations y empaquetado por LM-Kit para su SDK de IA on-device para .NET y para LM-Kit One. No es un modelo generativo: recibe un contenido de entrada junto con preguntas tipadas (elección entre opciones, nivel en una escala ordenada o sí/no) y devuelve, en una única pasada forward, la probabilidad de cada respuesta posible. Su función es actuar como clasificador zero-shot determinista dentro de pipelines de enrutamiento y triaje.

Con 421 millones de parámetros y una arquitectura basada en encoder, Laya está orientado a texto en inglés y se posiciona como el modelo de decisión del catálogo de LM-Kit que puede ejecutarse enteramente en CPU. El autor lo describe como especialmente fuerte en enrutamiento de peticiones entre opciones y más débil en preguntas graduadas y de sí/no.

La relevancia actual radica en su formato de salida: la respuesta siempre es una de las opciones proporcionadas por el usuario, acompañada de una probabilidad sobre la que una regla puede actuar. Esto lo hace adecuado para sistemas de triaje, clasificación de tickets y agentes que necesitan decisiones auditables sin generación libre de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder (modelo de decisión, "system-one") |
| Parametros totales | 421.029.889 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 y BF16 (full precision) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Laya-Q8_0.gguf, Laya-BF16.gguf) |

## Arquitectura y entrenamiento

Laya se construye sobre una arquitectura de tipo encoder, concebida como modelo de decisión "system-one": un único forward pass que produce probabilidades sobre un conjunto finito de respuestas definido por el usuario. El repositorio empaqueta los pesos publicados originalmente en `ggml-org/Laya-GGUF` sin modificaciones, en dos variantes: Q8_0 (la que descarga LM-Kit por defecto) y BF16 a precisión completa.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card remite a la model card original de Convai Innovations para los detalles de entrenamiento y la evaluación de los autores.

## Capacidades

- Clasificación zero-shot mediante preguntas tipadas: elección entre varias opciones, puntuación en una escala ordenada y preguntas de sí/no.
- Enrutamiento de peticiones entre opciones definidas por el usuario (por ejemplo, asignación de tickets a equipos).
- Devolución de probabilidad por respuesta, apta para umbrales y reglas deterministas.
- Integración como herramienta `decide` en agentes y workflows de LM-Kit One, y endpoint `POST /v1/systemone`.
- Ejecución on-device en CPU a través de LM-Kit.NET.
- Soporte exclusivo de inglés.
- No genera texto libre; no se documentan capacidades de código, matemáticas, visión, audio ni tool calling genérico.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto del ticket y preguntas de elección ("billing", "shipping", "technical") más una escala de urgencia, devolviendo la opción y su probabilidad para enrutar automáticamente al equipo correcto.
- Enrutamiento en agentes y workflows: como herramienta `decide` dentro de LM-Kit One, permite que un agente seleccione la siguiente acción entre un conjunto acotado de opciones sin invocar un LLM generativo.
- Clasificación de intención en asistentes conversacionales: con preguntas de elección sobre intenciones predefinidas, se obtiene una etiqueta y una confianza utilizables para decidir si se escala a un modelo mayor.
- Priorización de colas de atención: mediante preguntas de escala ordenada ("can wait", "this week", "today", "right now") se obtiene un nivel esperado que alimenta reglas de SLA.
- Filtrado y moderación por umbral: preguntas de sí/no con probabilidad asociada permiten aplicar políticas deterministas (por ejemplo, "¿requiere intervención humana?") sobre el valor de probabilidad.
- Procesamiento por lotes en local: al ejecutarse en CPU vía LM-Kit.NET, permite clasificar grandes volúmenes de texto en entornos sin GPU o con requisitos de privacidad que impiden enviar datos a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 421 M de parámetros, la variante Q8_0 ocupa aproximadamente 0,4 GB y la BF16 en torno a 0,8 GB, además del overhead de runtime.
- GPU recomendadas: no se especifican; el modelo está diseñado para ejecutarse en procesador (CPU).
- Cabe en cualquier GPU consumer y en equipos sin GPU dedicada, dado su tamaño.
- Opciones de despliegue: LM-Kit.NET (SDK on-device para .NET), LM-Kit One (endpoint `POST /v1/systemone`, herramienta `decide` y playground Decide) y, por el formato GGUF, runtimes compatibles con GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Laya (lm-kit/laya-gguf) | 421 M | no disponible | Encoder de decisión | Apache 2.0 | GGUF en Hugging Face, LM-Kit |
| convaiinnovations/laya | no disponible | no disponible | Encoder de decisión | Apache 2.0 | Hugging Face (modelo base) |
| Alternativas de clasificación zero-shot de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables documentados en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no se documenta cobertura multilingüe.
- El autor indica que es más débil en preguntas graduadas y de sí/no que en enrutamiento entre opciones.
- No genera texto: cualquier tarea que requiera salida libre queda fuera de su alcance.
- La respuesta está restringida al conjunto de opciones proporcionado por el usuario; la calidad depende del diseño de las preguntas y de las descripciones de cada opción.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de calibración deficiente en las probabilidades; se recomienda validar umbrales en datos propios.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache 2.0, que permite uso comercial con las obligaciones habituales de atribución y aviso.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; ecosistema joven y poca validación externa.
- No se documentan límites de longitud de entrada ni comportamiento con textos largos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lm-kit/laya-gguf
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Pesos GGUF originales: https://huggingface.co/ggml-org/Laya-GGUF
- SDK LM-Kit.NET: https://lm-kit.com/products/lm-kit-net/
