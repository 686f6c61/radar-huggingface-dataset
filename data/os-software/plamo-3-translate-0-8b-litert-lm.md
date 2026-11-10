# OS-Software/plamo-3-translate-0.8b-litert-lm

## Resumen

PLaMo 3 Translate 0.8B LiteRT-LM es una conversión no oficial del modelo de traducción PLaMo 3 Translate 0.8B de Preferred Networks (PFN) al formato `.litertlm` de Google, pensado para ejecutarse íntegramente en el navegador mediante LiteRT-LM y WebGPU. El modelo original es un transformer de 0,8 mil millones de parámetros especializado en traducción multilingüe entre 54 idiomas, y esta conversión lo empaqueta en tres variantes cuantizadas (int8, int4 y int4 con QAT) que caben en GPUs integradas y mantienen el texto dentro del dispositivo del usuario.

La relevancia de esta ficha radica en que demuestra un patrón de despliegue de traducción neuronal totalmente local: no hay servidor, no hay llamada a API y el contenido a traducir no abandona el navegador. El paquete incluye la API JavaScript de `@litert-lm/core` 0.19.0 y soporta opciones de traducción avanzadas del modelo original (`target_lang` obligatorio, además de `source_lang`, `form`, `context` y `glossary`).

Conviene subrayar que se trata de una conversión no oficial, no avalada por PFN, y que hereda la PLaMo Community License del modelo base, con requisitos específicos de atribución y registro previo para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer de traducción; la model card no detalla la arquitectura interna) |
| Parametros totales | 0,8 mil millones (0.8B, según el nombre del modelo) |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | hasta 32768 tokens (configurable en el motor; las mediciones de memoria se hicieron a 2048) |
| Tipos de cuantizacion | int8; int4 con QAT (embeddings int8); int4 sin entrenamiento (embeddings int8) |
| Idiomas soportados | 54 idiomas: ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh |
| Licencia | PLaMo Community License (license: other) |
| Formato de pesos | `.litertlm` (LiteRT-LM); tres ficheros: int8 (913 MB), int4-qat (582 MB) e int4 (582 MB) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base (tipo de atención, número de capas, composición del dataset de entrenamiento ni si hubo RLHF/DPO). Lo que sí se documenta es el proceso de conversión: los ficheros `.litertlm` se generaron a partir de la revisión `cc8e88169807` del modelo `pfnet/plamo-3-translate-0.8b` y están optimizados para el backend GPU de LiteRT-LM. La variante int4-qat se construyó a partir de `OS-Software/plamo-3-translate-0.8b-int4-qat`, un checkpoint con cuantización int4 entrenada (QAT), mientras que la variante int4 sin entrenamiento mantiene el mismo tamaño y velocidad pero cambia la redacción con más frecuencia.

La innovación técnica destacable de esta conversión es el despliegue on-device en navegador: el motor usa WebGPU para ejecutar la inferencia en la GPU del usuario y expone una API de conversaciones con streaming de tokens. El modelo original incorpora opciones de traducción controlables (`target_lang`, `source_lang`, `form`, `context`, `glossary`) que se pasan al motor mediante `extra_context`, lo que permite adaptar el registro y el glosario sin reentrenar.

## Capacidades

- Traducción multilingüe entre 54 idiomas, con `target_lang` obligatorio y `source_lang` opcional.
- Control del registro o forma del texto mediante la opción `form`.
- Traducción condicionada por contexto adicional (`context`) y glosario terminológico (`glossary`).
- Ejecución íntegra en el navegador con WebGPU, sin enviar el texto a un servidor.
- Streaming de tokens de salida mediante `sendMessageStreaming`.
- Muestreo configurable (en el ejemplo, greedy con `k=1`, `p=1`, `temperature=1`).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido en la información disponible.

## Casos de uso

- Traducción de documentos confidenciales en el navegador: contratos, informes médicos o material legal que no pueden salir del dispositivo se traducen localmente con la variante int8, que es la más fiel al modelo original.
- Extensión de navegador para traducción de páginas web: el modelo se carga una vez y traduce párrafos bajo demanda en la GPU del usuario, eliminando costes de API y latencia de red.
- Atención al cliente multilingüe en aplicaciones web: traducción en tiempo real de mensajes de chat entre agentes y clientes en 54 idiomas, con glosario para terminología de producto.
- Localización de software y videojuegos: uso de `glossary` y `context` para mantener consistencia terminológica entre cadenas de texto, con la variante int4-qat por su menor huella de memoria (unos 1,3 GiB).
- Traducción de correos y mensajes en herramientas ofimáticas web: integración mediante `@litert-lm/core` en un panel lateral que traduce sin conexión a servicios externos.
- Investigación en PLN sobre traducción on-device: banco de pruebas para comparar calidad int8 frente a int4-qat en un mismo hardware, con métricas de memoria y velocidad.
- Aplicaciones educativas de idiomas: traducción bidireccional con control de registro (`form`) para adaptar el tono al nivel del estudiante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: unos 2 GiB de memoria GPU con int8 y unos 1,3 GiB con int4/int4-qat, medidas con contexto de 2048 tokens en una GPU integrada.
- GPU recomendadas: no se especifican modelos concretos; la medición se hizo en una GPU integrada. Se requiere una GPU compatible con WebGPU en el navegador.
- Cabe en GPU de consumo: sí, según las cifras de memoria; no se detallan modelos concretos (A100, H100, RTX 4090, etc.).
- Despliegue: LiteRT-LM con `@litert-lm/core` 0.19.0 en el navegador; solo funciona con el backend GPU (`Backend.GPU`). No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la model card solo indica que la variante int4-qat es la más pequeña y rápida, sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| PLaMo 3 Translate 0.8B LiteRT-LM (esta ficha) | 0,8B | hasta 32768 | 54 | PLaMo Community License | `.litertlm`, navegador con WebGPU |
| PLaMo 3 Translate 0.8B (original) | 0,8B | no disponible | 54 | PLaMo Community License | pesos originales de PFN |
| Otras alternativas de traducción on-device | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con otros modelos de traducción en la información proporcionada.

## Limitaciones y advertencias

- Conversión no oficial: no está proporcionada ni avalada por Preferred Networks (PFN); para el modelo de referencia debe consultarse la model card original.
- Licencia restrictiva: la PLaMo Community License exige incluir una copia de la licencia y declarar "Built with PLaMo" al distribuir los ficheros o un servicio que los use; el uso comercial requiere registro previo mediante el formulario de PFN.
- Solo backend GPU: los ficheros únicamente cargan con WebGPU; no hay soporte documentado para CPU ni para otras librerías de inferencia.
- Dependencia de versión: requiere `@litert-lm/core` 0.19.0 y un navegador con WebGPU.
- Cuantización: la variante int4 sin entrenamiento cambia la redacción con más frecuencia que int8; la int4-qat es, de media, más fiel que int4 pero no se documentan métricas de calidad.
- Memoria: las cifras de VRAM corresponden a contexto de 2048 tokens; contextos mayores (hasta 32768) incrementarán el consumo.
- Sesgos y alucinación: no se documentan sesgos conocidos ni tasas de alucinación en la información disponible; en traducción, el riesgo principal es la alteración de sentido o terminología, mitigable con `glossary` y `context`.
- Idiomas: aunque se listan 54, no se detalla la calidad por par de idiomas ni el soporte de escrituras no latinas más allá de la lista de códigos.

## Enlaces

- Hugging Face: https://huggingface.co/OS-Software/plamo-3-translate-0.8b-litert-lm
- Modelo base: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- Checkpoint int4 con QAT: https://huggingface.co/OS-Software/plamo-3-translate-0.8b-int4-qat
- LiteRT-LM (repositorio): https://github.com/google-ai-edge/LiteRT-LM
- Paquete npm `@litert-lm/core`: https://www.npmjs.com/package/@litert-lm/core
- Licencia PLaMo Community (inglés): https://plamo.preferredai.jp/info/plamo-community-license-en
- Licencia PLaMo Community (japonés): https://plamo.preferredai.jp/info/plamo-community-license-ja
- Formulario de registro para uso comercial: https://forms.gle/mTL8tBLrMYXKNZD56
