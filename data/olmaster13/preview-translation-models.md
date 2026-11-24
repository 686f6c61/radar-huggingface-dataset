# olmaster13/preview-translation-models

## Resumen

`olmaster13/preview-translation-models` es un repositorio de redistribucion de los modelos de traduccion automatica neuronal de Mozilla Firefox Translations, conocidos como Bergamot y basados en la arquitectura Marian NMT. No se trata de un modelo entrenado por el autor del repositorio, sino de una copia sin modificaciones de los pesos publicados por Mozilla, empaquetados para su uso en traduccion de subtitulos dentro del navegador en el sitio *Preview*. El repositorio ocupa 1,1 GB y esta publicado bajo Mozilla Public License 2.0.

La relevancia de este repositorio es limitada y muy especifica: sirve como artefacto de despliegue para un caso de uso concreto (traduccion de subtitulos en el cliente) y no como un modelo generalista. Al estar compuesto por modelos NMT de tipo encoder-decoder de tamano reducido, su interes tecnico reside en la eficiencia en inferencia local y en la ejecucion dentro de un navegador mediante WebAssembly, no en capacidades generativas amplias.

No se dispone de informacion sobre el numero exacto de modelos incluidos, los pares de idiomas cubiertos, el tamano de cada checkpoint ni los detalles de entrenamiento en la informacion proporcionada. La model card es minima y se limita a declarar la procedencia y la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian NMT (encoder-decoder transformer), segun la model card (Bergamot / Firefox Translations) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los modelos de Firefox Translations se distribuyen habitualmente en formato binario cuantizado para inferencia en navegador, pero no se confirma en la informacion) |
| Idiomas soportados | no disponible |
| Licencia | MPL-2.0 |
| Formato de pesos | no disponible (el repositorio ocupa 1,1 GB; no se detalla el formato de los ficheros) |

## Arquitectura y entrenamiento

Segun la model card, los pesos corresponden a los modelos de traduccion de Firefox Translations de Mozilla, construidos sobre Bergamot, un motor de traduccion automatica neuronal basado en Marian NMT. Marian es una implementacion de transformer encoder-decoder orientada a traduccion, con variantes de tamano reducido pensadas para inferencia en el cliente. Bergamot anade optimizaciones para ejecucion en navegador, habitualmente mediante WebAssembly y con pesos comprimidos o cuantizados.

No se proporciona informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de tecnicas de alineacion como RLHF o DPO, ni innovaciones adicionales mas alla de las propias del proyecto Firefox Translations. Tampoco se detalla si el repositorio incluye todos los pares de idiomas del proyecto original o solo un subconjunto. El autor indica que los modelos se redistribuyen "unchanged", es decir, sin modificaciones respecto al origen.

## Capacidades

- Traduccion automatica de texto entre pares de idiomas soportados por los modelos de Firefox Translations (pares concretos no disponibles en la informacion).
- Traduccion orientada a subtitulos y contenido web, segun el caso de uso declarado en la model card.
- Ejecucion en el cliente, disenada para integrarse en el navegador (motor Bergamot).
- No se documentan capacidades de generacion abierta, razonamiento, codigo, matematicas, vision, audio, tool calling ni agentes.
- No se documenta modo de razonamiento (thinking mode) ni soporte multilingue mas alla de los pares de traduccion incluidos.

## Casos de uso

- Traduccion de subtitulos en el navegador: el repositorio esta empaquetado explicitamente para traducir subtitulos en el sitio *Preview*, ejecutando la inferencia en el cliente sin enviar el texto a un servidor.
- Traduccion de contenido web en local: al estar basado en Bergamot, encaja en extensiones o integraciones que traduzcan paginas preservando la privacidad del usuario.
- Prototipos de traduccion offline: los pesos pueden cargarse en un runtime local para experimentar con traduccion sin conexion, siempre que se conozcan los pares de idiomas incluidos.
- Integracion en pipelines de subtitulado: util para procesar ficheros de subtitulos en lote con un modelo NMT ligero y licencia MPL-2.0.
- Evaluacion de motores NMT en navegador: sirve como referencia para comparar latencia y calidad de Bergamot frente a otras alternativas en el cliente.
- Redistribucion en productos derivados: la licencia MPL-2.0 permite reutilizar y redistribuir los pesos, manteniendo las obligaciones de la licencia sobre los ficheros cubiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de modelos NMT de tipo Bergamot, el consumo esperado es bajo, pero no se confirma en la informacion.
- GPU recomendadas: no disponible. El diseno original de Firefox Translations prioriza CPU y ejecucion en navegador, no GPU dedicada.
- Compatibilidad con GPU de consumo: no confirmada en la informacion.
- Opciones de despliegue: el origen del proyecto es el runtime de Firefox Translations / Bergamot; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| olmaster13/preview-translation-models | no disponible | no disponible | MPL-2.0 | Hugging Face (redistribucion de Firefox Translations) |
| mozilla/firefox-translations-models (origen) | no disponible | no disponible | MPL-2.0 | GitHub de Mozilla |
| Marian NMT (Helsinki-NLP) | variable por par de idiomas | no disponible | variable (habitualmente MIT o CC-BY) | Hugging Face |
| NLLB-200 (Meta) | 600M a 54B | no disponible en esta ficha | CC-BY-NC 4.0 (variantes) | Hugging Face |

La comparativa se limita a la categoria de traduccion automatica neuronal; no se dispone de datos de rendimiento para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- La model card es minima: no se detallan pares de idiomas, tamano por checkpoint ni formato de pesos, lo que dificulta su evaluacion previa.
- Al ser una redistribucion de pesos de Mozilla, cualquier limitacion de los modelos originales de Firefox Translations se hereda sin cambios.
- No se documentan sesgos, tasas de alucinacion ni evaluaciones de calidad; en traduccion automatica, los errores de fidelidad y las omisiones son riesgos habituales.
- El uso comercial esta permitido por la MPL-2.0, pero con obligaciones de licencia sobre los ficheros cubiertos (conservacion de avisos y publicacion de modificaciones de esos ficheros).
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia de uso ni validacion por parte de la comunidad.
- No se recomienda su uso como modelo generativo general: esta disenado para traduccion y su alcance depende de los pares de idiomas incluidos, no confirmados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/olmaster13/preview-translation-models
- Origen de los modelos (Firefox Translations Models): https://github.com/mozilla/firefox-translations-models
- Proyecto Firefox Translations: https://github.com/mozilla/firefox-translations
- Motor Bergamot: https://browser.mt/
