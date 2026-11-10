# OS-Software/plamo-3-translate-2b-litert-lm

## Resumen

PLaMo 3 Translate 2B LiteRT-LM es una conversión no oficial del modelo de traducción PLaMo 3 Translate 2B de Preferred Networks (PFN) al formato `.litertlm`, diseñado para ejecutarse íntegramente en el navegador mediante LiteRT-LM y WebGPU. El modelo original es un transformer de 2.000 millones de parámetros especializado en traducción multilingüe, y esta conversión lo empaqueta en dos variantes cuantizadas (int8 e int4) que permiten inferencia local sin que el texto salga del dispositivo del usuario.

La relevancia de esta ficha radica en su enfoque *on-device*: al ejecutar la traducción en la GPU del propio usuario a través de WebGPU, se elimina la necesidad de enviar contenido a servidores externos, lo que resulta atractivo para aplicaciones de privacidad, entornos con conectividad limitada o despliegues web sin infraestructura de backend. El paquete int8 ocupa 2,92 GB y requiere unos 6 GiB de memoria de GPU para una ventana de contexto de 2048 tokens; la variante int4 baja a 1,75 GB y unos 4 GiB.

La conversión la mantiene el usuario OS-Software, no PFN, y se distribuye bajo la licencia comunitaria PLaMo, que exige registro previo para uso comercial y la mención "Built with PLaMo" al redistribuir los archivos o servicios que los utilicen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (según modelo base PLaMo 3 Translate 2B; detalles no disponibles en la información proporcionada) |
| Parametros totales | 2.000 millones (2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 32.768 tokens (configurable; 2048 en las mediciones de memoria publicadas) |
| Tipos de cuantizacion | int8 (pesos int8), int4 (pesos int4 con embeddings int8) |
| Idiomas soportados | 56 idiomas: ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh |
| Licencia | PLaMo Community License (uso comercial requiere registro previo) |
| Formato de pesos | `.litertlm` (LiteRT-LM) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base PLaMo 3 Translate 2B más allá de su naturaleza transformer y su tamaño de 2.000 millones de parámetros. Se desconoce el número de tokens de entrenamiento, la composición del dataset, si se aplicaron técnicas de RLHF o DPO, y cualquier innovación específica de atención o decodificación. La model card de esta conversión remite explícitamente a la model card original de PFN para obtener esos datos.

Lo que sí se documenta es el proceso de conversión: los archivos `.litertlm` se generaron a partir de la revisión `355637cc04db` del modelo original y solo funcionan con el backend GPU de LiteRT-LM. La variante int8 conserva los pesos en int8 y es la más fiel al modelo original; la int4 cuantiza los pesos a int4 manteniendo los embeddings en int8, lo que reduce el tamaño y acelera la inferencia a costa de cambios en la redacción de textos largos.

## Capacidades

- Traducción multilingüe entre 56 idiomas, con `target_lang` obligatorio y `source_lang` opcional.
- Soporte de opciones de control de estilo y terminología mediante los parámetros `form`, `context` y `glossary` heredados del modelo original.
- Ejecución en navegador con WebGPU y la librería `@litert-lm/core` 0.19.0.
- Inferencia en streaming token a token a través de `sendMessageStreaming`.
- Procesamiento local: el texto no abandona el dispositivo del usuario.
- Ventana de contexto configurable hasta 32.768 tokens (entrada más salida).
- Decodificación determinista mediante muestreo greedy (`SamplerType.GREEDY`).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Traducción en aplicaciones web con privacidad reforzada: el modelo se ejecuta en la GPU del usuario vía WebGPU, de modo que documentos legales, médicos o internos pueden traducirse sin enviarse a un servidor externo.
- Herramientas de traducción integradas en el navegador: extensiones o widgets que traducen texto seleccionado en la propia página, usando el paquete int4 (1,75 GB) para reducir el tiempo de carga inicial.
- Traducción de documentación técnica y manuales: con hasta 32.768 tokens de contexto y el parámetro `glossary`, se puede mantener terminología consistente en textos largos entre idiomas como inglés, japonés o alemán.
- Localización de contenido para soporte al cliente: traducción de conversaciones y correos entre los 56 idiomas soportados, con `form` para ajustar el registro (formal o informal) según el destinatario.
- Aplicaciones de escritorio o PWA con modo offline: al ejecutarse localmente, permite traducir sin conexión una vez descargados los pesos, útil en entornos con conectividad intermitente.
- Procesamiento por lotes en el cliente: traducción de listas de cadenas de interfaz (i18n) o de subtítulos dentro de una aplicación web, aprovechando la inferencia en streaming para mostrar resultados progresivos.
- Prototipado rápido de demos de traducción: el ejemplo de código de la model card permite montar una demo funcional en pocas líneas con `Engine.create` y `createConversation`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: unos 6 GiB de memoria de GPU para la variante int8 y unos 4 GiB para la int4, medidas con contexto de 2048 tokens en una GPU integrada.
- Tamaño en disco: 2,92 GB (int8) y 1,75 GB (int4).
- GPU recomendadas: no se especifican modelos concretos; se midió en una GPU integrada. Se requiere un navegador con soporte de WebGPU.
- Compatibilidad con GPU de consumo: no se detalla, pero los requisitos de memoria (4-6 GiB) son compatibles con muchas GPU de consumo modernas; la información no confirma modelos concretos.
- Opciones de despliegue: LiteRT-LM con backend GPU y la librería `@litert-lm/core` 0.19.0. Los archivos solo cargan con el backend GPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| PLaMo 3 Translate 2B LiteRT-LM (esta ficha) | 2B | Hasta 32.768 tokens | 56 | PLaMo Community License | `.litertlm`, navegador con WebGPU |
| PLaMo 3 Translate 2B (original) | 2B | No disponible en la información proporcionada | 56 | PLaMo Community License | Pesos originales de PFN; detalles no disponibles |
| Otras alternativas de traducción de 2B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre esta conversión y otros modelos de traducción, por lo que la comparativa se limita a parámetros, contexto, licencia y formato de despliegue.

## Limitaciones y advertencias

- Conversión no oficial: no está respaldada ni garantizada por Preferred Networks (PFN).
- Solo funciona con el backend GPU de LiteRT-LM; no hay soporte documentado para CPU u otros backends.
- Requiere un navegador con WebGPU y la versión 0.19.0 de `@litert-lm/core`; versiones distintas pueden no ser compatibles.
- La variante int4 altera la redacción en textos largos respecto al modelo original.
- Licencia restrictiva: el uso comercial exige registro previo mediante el formulario de PLaMo, y la redistribución obliga a incluir copia de la licencia y la mención "Built with PLaMo".
- Riesgo de alucinación y errores de traducción inherente a modelos de 2B; no se documentan evaluaciones de calidad por idioma.
- No se detallan sesgos conocidos ni el comportamiento en idiomas de bajos recursos dentro de los 56 soportados.
- El contexto máximo práctico depende de la memoria de GPU disponible; las cifras publicadas corresponden a 2048 tokens.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/OS-Software/plamo-3-translate-2b-litert-lm)
- [Modelo base PLaMo 3 Translate 2B](https://huggingface.co/pfnet/plamo-3-translate-2b)
- [Repositorio LiteRT-LM](https://github.com/google-ai-edge/LiteRT-LM)
- [Paquete npm @litert-lm/core](https://www.npmjs.com/package/@litert-lm/core)
- [Licencia comunitaria PLaMo (inglés)](https://plamo.preferredai.jp/info/plamo-community-license-en)
- [Licencia comunitaria PLaMo (japonés)](https://plamo.preferredai.jp/info/plamo-community-license-ja)
- [Formulario de registro de uso comercial PLaMo](https://forms.gle/mTL8tBLrMYXKNZD56)
