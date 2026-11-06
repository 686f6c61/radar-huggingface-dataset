# ordicio/translator

## Resumen

Ordicio on-device translator es una familia de modelos de traducción automática neuronal de tamano reducido, publicada por el desarrollador ordicio, pensada para ejecutarse en el dispositivo (on-device) dentro de las aplicaciones de Ordicio. Su función concreta es traducir valores de atributos y fichas de datos de articulos de coleccionismo entre 16 idiomas, con el ingles como pivote. Incluye 30 direcciones de traduccion (en↔x) y un detector de idioma independiente de 2,2 MB (0,75 MB de descarga) que decide qué modelo cargar en cada caso.

Tecnicamente, cada dirección es un transformer encoder + decoder SSRU cuantizado a int8 mediante `intgemm8` con alphas del motor bergamot-translator. Los modelos derivan de los estudiantes de Firefox Translations de Mozilla y se han ajustado finamente sobre textos de coleccionismo traducidos por Gemma 4 31B, con una época adicional de entrenamiento consciente de cuantizacion. La huella es muy contenida: unos 23 MB por dirección (13 MB para sv, da y nb; 34 MB para ja, ko y zh comprimidos con gzip).

Su relevancia actual reside en la combinacion de latencia muy baja (unos 18 ms por valor en el motor WebAssembly sobre un solo nucleo), ausencia de dependencia de servidor y una calidad que, segun la model card, supera a los modelos de Firefox en todas las direcciones evaluadas con referencias. Es un caso de destilacion de un modelo grande (Gemma 4 31B) hacia estudiantes compactos para un dominio vertical muy acotado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder + decoder SSRU (familia Marian, estudiantes de Firefox Translations) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (`intgemm8` con alphas, `int8shiftAlphaAll`); pesos float en `.npz` para reentrenamiento |
| Idiomas soportados | en, de, fr, es, it, nl, pt (Brasil), pl, sv, da, nb, fi, ja, ko, zh-Hans, zh-Hant |
| Licencia | MPL-2.0 |
| Formato de pesos | `.bin.gz` (modelos int8 comprimidos con gzip), `.spm.gz` (vocabularios SentencePiece), `.npz` (pesos float Marian) |

## Arquitectura y entrenamiento

Cada direccion es un modelo de traduccion neuronal de tipo encoder transformer con decoder SSRU (single-step recurrent unit), la arquitectura empleada por los estudiantes de Firefox Translations. Los pesos se distribuyen cuantizados a int8 con la variante `intgemm8` con alphas del motor bergamot-translator, configurado con `beam-size` 1 y `gemm-precision` `int8shiftAlphaAll`, y sin lista corta lexica (shortlist), que segun el autor degradaba la calidad en valores cortos. Los vocabularios son SentencePiece (`.spm`).

El entrenamiento parte de los pesos float de los estudiantes publicados por Mozilla y se ajusta en cuatro epocas con tasa de aprendizaje 2e-5 sobre 10.900 textos ingleses de coleccionismo (valores de atributos de un catalogo de clasificacion y notas de socios) traducidos por Gemma 4 31B en 4 bits a los 15 idiomas, mezclados con frases de WMT y NTREX-128. Despues se aplica una epoca adicional de entrenamiento consciente de cuantizacion a 8 bits para que el modelo int8 iguale al float. Para el coreano se excluyeron los pares del profesor que copiaban intacto un texto de tres o mas palabras, porque el modelo aprendia a dejar frases enteras en ingles. El detector de idioma es un modelo lineal sobre n-gramas de caracteres hasheados (FNV-1a de 32 bits, 131.072 buckets, n-gramas de 1 a 4, maximo 1.000 caracteres, 17 etiquetas incluida `zxx`).

## Capacidades

- Traduccion de texto entre ingles y 15 idiomas en ambas direcciones (30 direcciones en↔x); los pares entre idiomas no ingleses se enrutan a traves del ingles.
- Deteccion de idioma integrada con 17 etiquetas (16 idiomas mas `zxx` para contenido no traducible como nombres, codigos o numeros de modelo).
- Preservacion de valores que no deben traducirse: nombres, titulos y codigos se mantienen sin cambios con el doble de frecuencia que los modelos de Firefox en el conjunto de prueba del autor.
- Ejecucion on-device en WebAssembly, sin llamadas a servidor, con unos 18 ms por valor sobre un solo nucleo.
- Orientacion especifica a textos cortos y valores de atributos (no a documentos largos).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Traduccion de fichas de producto en apps de coleccionismo: el modelo traduce valores de atributos y notas de socios en el dispositivo, con unos 18 ms por valor, lo que permite mostrar la interfaz localizada sin esperas de red.
- Catalogacion multilingue de articulos: al traducir en ambas direcciones con el ingles como pivote, un catalogo en espanol puede publicarse en japones o coreano pasando por en, manteniendo coherencia de vocabulario en todo el catalogo.
- Filtrado previo con deteccion de idioma: el detector de 0,75 MB decide qué direccion cargar y descarta contenido no traducible (`zxx`), evitando enviar nombres o codigos al traductor.
- Aplicaciones moviles y web sin conectividad: al ejecutarse en WebAssembly y ocupar entre 13 y 34 MB por direccion, encaja en apps que deben funcionar offline o con ancho de banda limitado.
- Localizacion de contenido generado por usuarios: notas y descripciones cortas escritas por usuarios pueden traducirse al vuelo en la app, con la ventaja de que los modelos conservan mejor los nombres propios y codigos.
- Busqueda y coincidencia de articulos entre mercados: la traduccion de valores de atributos permite normalizar terminos de busqueda entre idiomas (por ejemplo, de aleman a ingles) antes de indexar o comparar.
- Preprocesamiento para pipelines de datos: los pesos float en `.npz` permiten reentrenar o adaptar los estudiantes a un dominio nuevo sin partir de cero, reutilizando la receta de ajuste fino del autor.

## Benchmarks y rendimiento

Calidad medida con chrF++ en el motor WebAssembly de bergamot sin shortlist, frente al modelo de Firefox de la misma direccion, sobre 150 valores ingleses de un catalogo de coleccionismo con traducciones de referencia:

| en → | de | fr | es | pl | fi | ja | ko | zh-Hans |
|---|---|---|---|---|---|---|---|---|
| Firefox | 69,1 | 67,5 | 67,8 | 60,0 | 60,7 | 32,5 | 42,5 | 25,1 |
| Este modelo | 70,7 | 70,9 | 69,2 | 64,4 | 65,1 | 40,6 | 46,1 | 36,3 |

| → en (referencias como origen) | de | fr | es | pl | fi | ja | ko | zh-Hans |
|---|---|---|---|---|---|---|---|---|
| Firefox | 75,0 | 74,4 | 73,6 | 69,3 | 66,0 | 58,2 | 57,9 | 55,0 |
| Este modelo | 76,8 | 74,7 | 75,4 | 69,4 | 67,4 | 59,2 | 61,9 | 59,0 |

Para it, nl, pt, sv, da, nb y zh-Hant no hay conjunto de referencia; sobre 300 traducciones del profesor reservadas, el autor reporta ganancias de 4 a 32 chrF++ desde el ingles y de 1 a 9 hacia el ingles frente a los modelos de Firefox.

Detector de idioma:

| Precision | Este detector | Lingua | fastText lid.176 |
|---|---|---|---|
| Valores cortos (reservados, 6.877) | 0,89 | 0,83 | 0,74 |
| Frases (WMT / NTREX reservados, 2.649) | 1,00 | 0,99 | 0,98 |

En valores cortos, el 78 % de las predicciones alcanzan probabilidad 0,9 y el 98,7 % de esas son correctas.

## Requisitos de hardware

- Inferencia en CPU: el motor objetivo es WebAssembly (bergamot-translator) sobre un solo nucleo, con unos 18 ms por valor; no requiere GPU.
- VRAM estimada: no aplica en el modo previsto (CPU); no se publican requisitos de VRAM para ejecucion en GPU.
- GPU recomendadas: no disponible; el diseno esta orientado a CPU y a entornos de navegador o moviles.
- Cabida en GPU de consumo: irrelevante para el caso de uso previsto; el modelo esta pensado para ejecutarse sin acelerador.
- Despliegue: bergamot-translator con configuracion `beam-size` 1 y `gemm-precision` `int8shiftAlphaAll`; los pesos float `.npz` permiten otros flujos, pero no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Almacenamiento y descarga: unos 23 MB por direccion (13 MB para sv, da y nb; 34 MB para ja, ko y zh), mas 0,75 MB del detector; el repositorio completo ocupa 4,5 GB por incluir los pesos float.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (chrF++ en→de) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ordicio translator | no disponible | no disponible | 70,7 | MPL-2.0 | Hugging Face |
| Firefox Translations (estudiante en→de) | no disponible | no disponible | 69,1 | MPL-2.0 | GitHub de Mozilla |
| Gemma 4 31B (profesor) | 31B (aproximado por el nombre) | no disponible | no disponible | Apache 2.0 | no disponible en la informacion |

La comparacion con Gemma 4 31B es asimetrica: el modelo grande actua como profesor y no se ha evaluado con la misma metrica en la informacion disponible; se incluye por ser el origen de los datos de ajuste. No se dispone de datos de otros traductores on-device comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Dominio acotado: el ajuste fino se hizo sobre 10.900 textos de coleccionismo; el rendimiento fuera de ese dominio (textos largos, legales, tecnicos) no esta documentado.
- Textos cortos: la evaluacion se basa en valores y frases breves; no hay evidencia sobre documentos largos ni sobre el comportamiento con contextos extensos.
- Pivote por ingles: los pares entre idiomas no ingleses pasan por en, lo que puede acumular errores en dos saltos.
- Cobertura desigual: it, nl, pt, sv, da, nb y zh-Hant no tienen conjunto de referencia con traducciones humanas; sus cifras provienen de traducciones del profesor.
- Detector de idioma imperfecto en valores cortos (0,89 de precision), con ambiguedades conocidas entre danes y noruego, espanol y portugues, y caracteres chinos en japones.
- Riesgo de alucinacion y de traducciones plausibles pero incorrectas en terminos especializados; no se documentan filtros de seguridad ni evaluaciones de sesgo.
- Licencia MPL-2.0: permite uso comercial, pero impone obligaciones de copyleft a nivel de fichero sobre los modelos derivados y exige conservar los avisos de licencia; conviene revisar el cumplimiento antes de redistribuir.
- Los datos de ajuste incluyen NTREX-128 (CC BY-SA 4.0) y conjuntos de WMT, con posibles obligaciones de atribucion.
- El repositorio pesa 4,5 GB por los pesos float; las apps solo descargan los `.bin.gz` comprimidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ordicio/translator
- Firefox Translations (Mozilla): https://github.com/mozilla/translations
- Ficha en free2aitools: https://free2aitools.com/model/ordicio/translator
- Licencia MPL-2.0: https://www.mozilla.org/MPL/2.0/
