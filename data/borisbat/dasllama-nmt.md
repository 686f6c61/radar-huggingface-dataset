# borisbat/dasllama-nmt

## Resumen

`dasllama-nmt` es un repositorio espejo que redistribuye el modelo de traduccion automatica neuronal ru→en del proyecto Firefox Translations de Mozilla, servido por la plataforma dasLLAMA. No se trata de un modelo entrenado por el autor del repositorio (`borisbat`), sino de una copia byte a byte de los artefactos que Mozilla publica para el motor de traduccion del navegador Firefox, empaquetados para que un ejemplo de navegador de dasllama.io pueda descargarlos desde un unico origen con un hash fijado.

Tecnicamente, el modelo es un transformer Marian (la arquitectura de traduccion de la familia Bergamot) cuantizado a int8 mediante intgemm con escalas alpha, acompanado de su vocabulario SentencePiece compartido. El par de ficheros publicados es `model.ruen.intgemm.alphas.bin` (pesos int8) y `vocab.ruen.spm` (vocabulario), correspondientes a la ejecucion `next26_RSpwfHrcSUC_rKTnhOEXzw` del bucket de modelos de traduccion de Mozilla.

Su relevancia es acotada pero concreta: permite ejecutar traduccion ru→en completamente en el navegador del cliente, sin servidor y sin enviar texto a terceros, algo alineado con el modelo de privacidad de Firefox Translations. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamano del repo figura como 0.0 GB (los ficheros reales son de pocos megabytes, dado que es un modelo int8 de un solo par de idiomas).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (familia Bergamot / Firefox Translations), transformer seq2seq para traduccion |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 con escalas alpha de intgemm |
| Idiomas soportados | ruso (ru) → ingles (en) |
| Licencia | MPL-2.0 |
| Formato de pesos | binario intgemm (`.bin`) + vocabulario SentencePiece (`.spm`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Marian, un transformer encoder-decoder disenado especificamente para traduccion automatica neuronal, dentro del ecosistema Bergamot que Mozilla utiliza para las traducciones locales de Firefox. La variante publicada esta cuantizada a int8 con las escalas alpha de intgemm, una tecnica de cuantizacion pensada para inferencia eficiente en CPU y en entornos con recursos limitados como el navegador.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO; la model card no los detalla y se limita a indicar la procedencia (bucket de datos de traduccion de Mozilla y repositorios `mozilla/firefox-translations-models` y `mozilla/translations`). La innovacion tecnica destacable no esta en el modelo en si, sino en su empaquetado: pesos int8 con escalas alpha y vocabulario SentencePiece compartido, optimizados para ejecucion local en el navegador mediante WebAssembly.

## Capacidades

- Traduccion automatica de texto de ruso a ingles, un unico par de idiomas.
- Ejecucion local en el navegador (client-side) mediante el motor Bergamot, sin llamadas a servidor.
- Inferencia en CPU gracias a la cuantizacion int8 con intgemm.
- Uso del vocabulario SentencePiece compartido incluido (`vocab.ruen.spm`) para tokenizacion.
- Verificacion de integridad mediante hashes SHA-256 fijados en la model card.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.
- No es un modelo generativo de proposito general: su unica tarea es la traduccion ru→en.

## Casos de uso

- Traduccion privada en el navegador: integrar el par de ficheros en una extension o pagina web que traduzca texto ru→en en el cliente, sin enviar el contenido a ningun servidor, aprovechando el formato int8 optimizado para WebAssembly.
- Navegacion de contenido en ruso: traducir articulos, documentacion o paginas web en ruso al ingles dentro de la propia pestana, replicando el comportamiento de Firefox Translations.
- Demostraciones de traduccion local: usar el repositorio como origen unico con hash fijado para ejemplos de dasllama.io que necesiten descargar el modelo de forma reproducible.
- Procesamiento por lotes en entornos sin GPU: al ser un modelo int8 de un solo par de idiomas, puede ejecutarse en CPU para traducir volumenes moderados de texto ru→en en pipelines offline.
- Investigacion sobre traduccion neuronal eficiente: servir como referencia para estudiar el rendimiento de Marian cuantizado con intgemm frente a modelos de traduccion mas grandes.
- Archivado y espejo reproducible: mantener una copia verificable de los artefactos oficiales de Mozilla para entornos donde el bucket original no sea accesible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser un modelo int8 de un par de idiomas, su huella es de pocos megabytes y esta pensado para ejecucion en CPU.
- GPU recomendadas: no aplica; el modelo esta disenado para inferencia en CPU y en el navegador.
- Cabe en GPU consumer: si, aunque no es su objetivo; cualquier GPU moderna puede alojarlo sobradamente.
- Opciones de despliegue: motor Bergamot / Firefox Translations (WebAssembly en navegador); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Modelo de un unico par de idiomas (ru→en); no traduce otras combinaciones.
- No es un modelo de proposito general: no genera texto libre, no razona, no escribe codigo ni soporta tool calling.
- Riesgo de traducciones literales o imprecisas en dominios especializados (tecnico, legal, medico) propio de los modelos Marian de tamano reducido.
- Posibles sesgos heredados de los datos de entrenamiento originales de Mozilla, no documentados en la model card.
- La licencia MPL-2.0 permite uso comercial, pero impone obligaciones de copyleft sobre los ficheros cubiertos y requiere conservar los avisos de licencia; conviene revisar los terminos antes de redistribuir.
- El repositorio es un espejo, no el origen oficial: para produccion se recomienda verificar los hashes SHA-256 contra los artefactos de Mozilla.
- El tamano del repo figura como 0.0 GB y no hay descargas ni likes, lo que sugiere un uso muy limitado y sin validacion comunitaria.
- No hay informacion sobre contexto maximo soportado ni sobre calidad medida en benchmarks.

## Enlaces

- Hugging Face: https://huggingface.co/borisbat/dasllama-nmt
- dasLLAMA: https://dasllama.io
- Repositorio de modelos de Firefox Translations: https://github.com/mozilla/firefox-translations-models
- Repositorio de traducciones de Mozilla: https://github.com/mozilla/translations
- Bucket de datos de traduccion de Mozilla: https://storage.googleapis.com/moz-fx-translations-data--303e-prod-translations-data/
