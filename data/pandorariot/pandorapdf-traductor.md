# PandoraRiot/pandorapdf-traductor

## Resumen

PandoraRiot/pandorapdf-traductor no es un modelo de lenguaje entrenado desde cero, sino un repositorio de artefactos de traducción automática neuronal que da soporte al lector de documentos PandoraPDF. El autor, PandoraRiot (Erika Alexandra García Barrios), publica aquí los ficheros que la aplicación web descarga para traducir documentos sin conexión directamente en el navegador, evitando consumir el ancho de banda del alojamiento de la app.

Los pesos proceden de Firefox Translations (proyecto de Mozilla), basados en la arquitectura Bergamot, un motor de traducción neuronal compacto diseñado para ejecutarse en el cliente mediante WebAssembly. El repositorio incluye los pares español-inglés, inglés-español, inglés-francés y francés-inglés; la combinación español-francés se resuelve en dos saltos pasando por el inglés. Los ficheros se distribuyen sin modificar, solo comprimidos con gzip, junto con diccionarios y definiciones derivados de Wiktionary.

El tamaño total del repositorio es de aproximadamente 0,1 GB, lo que refleja la naturaleza ligera de los modelos Bergamot orientados a inferencia en navegador. Es relevante para desarrolladores que necesiten integrar traducción local y privada en aplicaciones web sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bergamot (traducción neuronal; detalles internos no disponibles en la información proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos comprimidos con gzip) |
| Idiomas soportados | es, en, fr (pares: es-en, en-es, en-fr, fr-en; es-fr vía inglés) |
| Licencia | other (los pesos heredan MPL-2.0 de Mozilla; los diccionarios CC BY-SA 4.0) |
| Formato de pesos | model.*, lex.*, vocab.* (comprimidos con gzip); diccionarios en .tsv.gz |

## Arquitectura y entrenamiento

Los pesos corresponden al motor Bergamot de Firefox Translations, desarrollado por Mozilla. Bergamot es una familia de modelos de traducción neuronal de tamaño reducido pensada para ejecutarse en el navegador del usuario mediante WebAssembly, priorizando latencia baja y consumo de memoria contenido frente a la calidad de modelos de servidor de mayor tamaño. El repositorio no aporta información sobre el número de parámetros, la composición del corpus de entrenamiento ni el proceso de optimización.

El autor no ha entrenado ni ajustado los modelos: los publica sin modificar, únicamente comprimidos con gzip, para servirlos desde Hugging Face. Además de los pesos, el repositorio incluye diccionarios bilingües (dict-es-en, dict-en-es, dict-es-fr, dict-fr-es) y ficheros de definiciones (def-es, def-en) derivados de Wiktionary vía kaikki.org y WikDict, recortados para su uso en la aplicación. Las huellas SHA-256 de los modelos se documentan en el código fuente del lector (src/engines/translate/models.ts).

## Capacidades

- Traducción de texto entre español e inglés en ambos sentidos.
- Traducción de texto entre inglés y francés en ambos sentidos.
- Traducción español-francés y francés-español mediante encadenamiento a través del inglés.
- Ejecución local en el navegador sin conexión, orientada a privacidad y a evitar llamadas a APIs externas.
- Consulta de diccionarios bilingües y definiciones de términos integradas en el lector.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Lectura de documentos PDF multilingües en el navegador: el lector PandoraPDF descarga estos artefactos y traduce el contenido en el cliente, de modo que el texto no sale del dispositivo del usuario.
- Aplicaciones web con requisito de privacidad: al ejecutarse la traducción localmente, resulta adecuado para entornos donde no se permite enviar contenido a servicios de terceros.
- Escenarios con conectividad limitada o intermitente: una vez descargados los ficheros, la traducción funciona sin conexión.
- Reducción de costes de infraestructura: el autor evita el tráfico del alojamiento de la app sirviendo los modelos desde Hugging Face.
- Traducción de correspondencia y documentación breve entre español, inglés y francés dentro de una herramienta de lectura.
- Integración como capa de traducción en visores o lectores de documentos de código abierto que ya utilicen el motor Bergamot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia prevista en el navegador del usuario mediante WebAssembly (motor Bergamot); no requiere GPU dedicada.
- VRAM estimada: no aplica para el caso de uso previsto; no disponible para despliegues en servidor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no aplica al escenario de ejecución en cliente.
- Opciones de despliegue: servido como ficheros estáticos desde Hugging Face y consumido por el lector PandoraPDF; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PandoraRiot/pandorapdf-traductor | Bergamot (cliente) | es, en, fr | no disponible | other (MPL-2.0 en pesos) | Hugging Face |
| firefox-translations-models (Mozilla) | Bergamot (cliente) | Múltiples pares | no disponible | MPL-2.0 | GitHub / Hugging Face |
| Modelos NMT de servidor (p. ej. OPUS-MT) | Transformer | Múltiples pares | no disponible | Varía (a menudo CC BY 4.0) | Hugging Face |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no es un modelo original: es una redistribución de pesos de Mozilla, por lo que su calidad queda acotada a la del motor Bergamot.
- La licencia figura como "other"; los pesos están sujetos a MPL-2.0 y los diccionarios a CC BY-SA 4.0, con obligaciones de atribución y compartición que deben respetarse en uso comercial.
- La traducción español-francés se realiza en dos pasos vía inglés, lo que puede acumular errores.
- Solo cubre tres idiomas y cuatro pares directos; no hay soporte para otras lenguas.
- No se documentan parámetros, contexto ni datos de entrenamiento, lo que dificulta evaluar su calidad de forma independiente.
- Riesgo de alucinación y sesgos: no documentado en la información disponible; al ser traducción automática, pueden aparecer errores en terminología especializada.
- El repositorio tiene 0 descargas y 1 like, por lo que no cuenta con validación comunitaria significativa.

## Enlaces

- Hugging Face: https://huggingface.co/PandoraRiot/pandorapdf-traductor
- Perfil del autor: https://huggingface.co/PandoraRiot/models
- Lector PandoraPDF: https://milectorpdf.vercel.app
- Firefox Translations Models (Mozilla): https://github.com/mozilla/firefox-translations-models
- Licencia MPL-2.0: https://www.mozilla.org/MPL/2.0/
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- WikDict: https://www.wikdict.com/
- kaikki.org: https://kaikki.org/
