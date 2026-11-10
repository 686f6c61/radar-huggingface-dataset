# OS-Software/plamo-3-translate-8b-litert-lm

## Resumen

PLaMo 3 Translate 8B LiteRT-LM es una conversión no oficial del modelo de traducción PLaMo 3 Translate 8B de Preferred Networks (PFN) al formato `.litertlm`, pensada para ejecutarse íntegramente en el navegador mediante LiteRT-LM y WebGPU. El modelo original es un transformer de 8.000 millones de parámetros especializado en traducción multilingüe, y esta conversión lo empaqueta con cuantización int8 e int4 para que la inferencia ocurra en la GPU del propio usuario, sin que el texto salga del navegador.

El interés de esta ficha radica en que demuestra un patrón de despliegue on-device para tareas de traducción con requisitos de privacidad estrictos: no hay servidor intermedio ni API externa, y el coste de cómputo recae en el cliente. La contrapartida es que exige un navegador con soporte de WebGPU y una GPU discreta con 10-16 GiB de memoria libre según la variante, lo que limita su alcance a equipos de gama alta.

La conversión la mantiene el usuario OS-Software (no PFN) y se distribuye bajo la PLaMo Community License, con obligaciones de atribución y registro previo para uso comercial. El repositorio ocupa 13,6 GB e incluye dos ficheros de pesos: int8 (8,60 GB) e int4 con embeddings en int8 (5,01 GB).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (detalles de la arquitectura original no disponibles en la información proporcionada) |
| Parámetros totales | 8.000 millones (8B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | Hasta 32.768 tokens; el ejemplo de la model card usa 2.048 |
| Tipos de cuantización | int8 (8,60 GB) e int4 con embeddings en int8 (5,01 GB) |
| Idiomas soportados | 53 idiomas: ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh |
| Licencia | PLaMo Community License (revisada el 9 de noviembre de 2026) |
| Formato de pesos | `.litertlm` (LiteRT-LM) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo original más allá de su naturaleza transformer y su tamaño de 8B parámetros. Tampoco se especifican el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. Lo que sí se documenta es la interfaz de inferencia: el modelo acepta opciones de traducción (`target_lang` obligatorio, más `source_lang`, `form`, `context` y `glossary`) que se pasan como `extra_context` en la creación de la conversación, lo que sugiere un entrenamiento orientado a traducción condicionada por instrucciones y glosarios.

La innovación técnica relevante en esta ficha es el pipeline de conversión y despliegue: los pesos se transforman al formato `.litertlm` de Google AI Edge y se ejecutan con el motor LiteRT-LM sobre el backend GPU de WebGPU. La cuantización int4 aplica int8 solo a las embeddings, lo que reduce el tamaño a 5,01 GB a cambio de cambios ligeros en la redacción de las traducciones. La conversión se generó a partir de la revisión `cc265d585980` del modelo original.

## Capacidades

- Traducción multilingüe entre 53 idiomas, con código de idioma de destino obligatorio y origen opcional.
- Control de estilo mediante el parámetro `form`.
- Traducción contextualizada mediante el parámetro `context`.
- Uso de glosarios terminológicos mediante el parámetro `glossary`.
- Inferencia en streaming token a token a través de `sendMessageStreaming`.
- Ejecución local en el navegador con WebGPU, sin envío de texto a servidores externos.
- Decodificación greedy configurable mediante `SamplerType.GREEDY`.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Traducción de documentos confidenciales en el navegador: contratos, informes médicos o comunicaciones internas pueden traducirse sin que el texto abandone el equipo del usuario, gracias a la ejecución local sobre WebGPU.
- Herramientas de traducción integradas en aplicaciones web: un editor o CMS puede incorporar traducción bajo demanda usando `@litert-lm/core` y el fichero int4, con una ventana de contexto de hasta 32.768 tokens para secciones largas.
- Localización de productos con glosarios: el parámetro `glossary` permite fijar terminología de marca y el parámetro `form` ajustar el registro, lo que encaja en flujos de localización con guías de estilo.
- Traducción de correspondencia de soporte al cliente: el parámetro `context` permite aportar información previa de la conversación para mantener coherencia terminológica entre mensajes.
- Despliegue en entornos con restricciones de compliance: organizaciones que no pueden enviar datos a APIs de terceros pueden servir la traducción desde el propio navegador del empleado, siempre que dispongan de GPU compatible.
- Prototipado rápido de interfaces de traducción: el ejemplo de la model card permite montar una demo funcional en JavaScript con pocas líneas, útil para validar experiencia de usuario antes de invertir en infraestructura.
- Traducción de contenido para lectura personal: usuarios con GPU discreta pueden traducir artículos o mensajes en local sin depender de servicios cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: unos 16 GiB de memoria GPU para la variante int8 y unos 10 GiB para la int4, medidas con contexto de 2.048 tokens en una RTX 3090.
- GPU recomendadas: RTX 3090 (medida de referencia); se requiere una GPU discreta con soporte de WebGPU.
- Compatibilidad con GPU de consumo: sí, en tarjetas de gama alta con al menos 10-16 GiB de VRAM libre; no se documenta funcionamiento en iGPU ni en GPUs de gama media o baja.
- Navegador: se necesita un navegador con WebGPU habilitado; los ficheros solo cargan con el backend GPU.
- Despliegue: LiteRT-LM mediante el paquete `@litert-lm/core` versión 0.19.0; no se documentan opciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| PLaMo 3 Translate 8B LiteRT-LM (esta ficha) | 8B | hasta 32.768 tokens | `.litertlm`, LiteRT-LM + WebGPU en navegador | PLaMo Community License | Conversión no oficial, cuantizada int8/int4 |
| PLaMo 3 Translate 8B (original) | 8B | no disponible | pesos originales de PFN | PLaMo Community License | Modelo base; opciones de traducción idénticas |
| Otras alternativas de traducción on-device | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Conversión no oficial: no está proporcionada ni respaldada por Preferred Networks; los problemas de la conversión no deben atribuirse a PFN.
- Requisito de hardware estricto: necesita WebGPU y una GPU discreta con 10-16 GiB de VRAM, lo que excluye muchos portátiles y equipos de gama media.
- Solo backend GPU: los ficheros no cargan con otros backends de LiteRT-LM.
- La variante int4 altera ligeramente la redacción de las traducciones respecto al modelo original.
- El contexto máximo de 32.768 tokens consume memoria adicional no cuantificada en la model card, que solo mide a 2.048 tokens.
- Licencia con obligaciones: al distribuir los ficheros o un servicio que los use hay que entregar una copia de la licencia y declarar "Built with PLaMo".
- Uso comercial sujeto a registro previo mediante el formulario de PFN.
- No se documentan sesgos, tasas de alucinación ni evaluaciones de calidad por par de idiomas en la información disponible.
- La calidad puede variar de forma notable entre los 53 idiomas declarados; no hay datos por idioma.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OS-Software/plamo-3-translate-8b-litert-lm
- Modelo base: https://huggingface.co/pfnet/plamo-3-translate-8b
- LiteRT-LM (Google AI Edge): https://github.com/google-ai-edge/LiteRT-LM
- Paquete npm `@litert-lm/core`: https://www.npmjs.com/package/@litert-lm/core
- Licencia PLaMo Community (inglés): https://plamo.preferredai.jp/info/plamo-community-license-en
- Licencia PLaMo Community (japonés): https://plamo.preferredai.jp/info/plamo-community-license-ja
- Formulario de registro de uso comercial: https://forms.gle/mTL8tBLrMYXKNZD56
