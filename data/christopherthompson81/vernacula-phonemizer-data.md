# christopherthompson81/vernacula-phonemizer-data

## Resumen

vernacula-phonemizer-data no es un modelo de lenguaje, sino un repositorio de datos y artefactos de inferencia que alimentan al motor vernacula-phonemizer (implementado en TypeScript, C# y Rust). Contiene el arbol de datos que dicho motor lee en tiempo de ejecucion: lexicones, tablas de reglas, manifiestos y modelos ONNX cuantizados a int8 para conversion grafema-fonema (G2P) y fonemizacion a IPA. Lo publica el usuario christopherthompson81 y su relevancia es practica: actua como dependencia de datos versionada de una libreria de fonemizacion.

El repositorio esta pensado para clonarse o descargarse por etiqueta (tag): la revision publicada corresponde al tag `224339e8`, construida a partir del commit `224339e897c3cb5c38dc602bc48840d8546bad38` del repositorio del motor. La clave de datos se organiza como rutas dentro del repo, por ejemplo `languages/english/g2p-dict.tsv`, de modo que el motor resuelve cada recurso por ruta relativa.

Con un tamano de repositorio de aproximadamente 0,1 GB, el contenido es ligero y esta orientado a ejecucion en CPU. No dispone de una licencia unica: el trabajo propio del proyecto es MIT, mientras que los ficheros derivados de terceros conservan su licencia original (CC0, CC-BY, CC-BY-SA, GPL-3.0 y dos licencias a medida), declaradas fichero a fichero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo transformer de lenguaje; incluye modelos ONNX int8 de etiquetado G2P, ademas de lexicones y tablas de reglas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | int8 (modelos ONNX) |
| Idiomas soportados | parcialmente documentado: ingles, japones (`languages/japanese/`), sindhi (`languages/sindhi/`); listado completo no disponible |
| Licencia | per-file: MIT para el trabajo propio; CC0, CC-BY, CC-BY-SA, GPL-3.0 y dos licencias a medida en ficheros derivados de terceros |
| Formato de pesos | ONNX (int8) junto con TSV/TXT de lexicones, tablas de reglas y manifiestos |
| Tamano del repositorio | 0,1 GB |
| Revision publicada | tag `224339e8` (commit del motor `224339e897c3cb5c38dc602bc48840d8546bad38`) |
| Fecha de creacion | 2026-10-10 |
| Fecha de actualizacion | 2026-10-10 |
| Descargas y likes | 0 descargas, 0 likes |

## Arquitectura y entrenamiento

Este repositorio no define ni entrena una arquitectura propia. Su contenido es una mezcla heterogenea de recursos: (1) modelos ONNX cuantizados a int8 que actuan como etiquetadores G2P, por ejemplo `languages/sindhi/sd-g2p-tagger.int8.onnx`; (2) lexicones en texto plano, como `languages/english/g2p-dict.tsv`, `languages/japanese/readings.tsv` o `languages/sindhi/sindhi-lexicon.tsv`; (3) tablas de reglas y ficheros auxiliares (`fallback.tsv`, `adverbs.txt`); y (4) manifiestos que describen como el motor debe cargar cada recurso.

No se dispone de informacion sobre el procedimiento de entrenamiento de los modelos ONNX incluidos (numero de tokens, composicion del dataset, uso de RLHF/DPO u otras tecnicas). Tampoco se documentan innovaciones tecnicas de decodificacion o atencion. El aspecto tecnico destacable es el enfoque de distribucion: el repositorio actua como dependencia de datos versionada por tag, de forma que el motor y sus datos se fijan a la misma revision de git, lo que facilita la reproducibilidad de la fonemizacion. Ademas, la organizacion por fichero permite mezclar procedencias con licencias distintas bajo un esquema per-file.

## Capacidades

- Conversion grafema-fonema (G2P) y fonemizacion a IPA, segun los tags del repositorio (`phonemizer`, `g2p`, `ipa`).
- Cobertura lexica mediante diccionarios y lexicones por idioma: ingles, japones y sindhi aparecen explicitamente en la documentacion.
- Etiquetado G2P neuronal mediante modelos ONNX int8 que pueden ejecutarse sin GPU.
- Resolucion de pronunciacion por reglas y por fallback, con tablas de reglas y ficheros `fallback.tsv`.
- Integracion en tiempo de ejecucion desde tres lenguajes: TypeScript, C# y Rust (los motores declarados por el autor).
- Generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling y agentes: no aplica, no es un modelo de lenguaje.
- Capacidades multilingues: limitadas a los idiomas cubiertos por los datos incluidos; el listado completo no esta disponible en la informacion proporcionada.

## Casos de uso

- Sintesis de voz (TTS) en produccion: el motor consume los lexicones y modelos ONNX de este repositorio para convertir texto de entrada en secuencias de fonemas IPA, que alimentan a un sintetizador neuronal. La ruta de datos por idioma permite cargar solo el subconjunto necesario.
- Reconocimiento automatico del habla (ASR) con lexico fonetico: los ficheros de pronunciacion sirven como lexico de decodificacion para alinear fonemas con unidades acusticas en un decodificador.
- Aplicaciones de lectura asistida y aprendizaje de idiomas: el pipeline texto a IPA permite mostrar la pronunciacion de una palabra o frase, util en herramientas de ensenanza de ingles, japones o sindhi.
- Preprocesado de corpus linguisticos: investigacion en fonetica y linguistica computacional que necesita transcripciones IPA consistentes y versionadas para reproducir experimentos.
- Integracion en aplicaciones de escritorio o moviles multiplataforma: al existir motores en TypeScript, C# y Rust y modelos ONNX int8, el paquete se puede embeber en aplicaciones sin dependencia de GPU ni de servicios externos.
- Busqueda y recuperacion por similitud fonetica: indexar contenidos por su forma fonetica (IPA) permite recuperar nombres propios o terminos con ortografias variables.
- Normalizacion de pronunciacion en asistentes de voz: unificar la salida fonetica antes de enviarla al TTS evita discrepancias entre idiomas y fuentes lexicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de precision de fonemizacion (por ejemplo, tasa de error a nivel de palabra o de fonema), ni comparaciones con otros sistemas G2P.

## Requisitos de hardware

- VRAM: los modelos incluidos estan cuantizados a int8 y estan pensados para ejecucion en CPU; no se especifican requisitos de VRAM. No disponible.
- GPU recomendadas: no disponible. Por el tipo de artefacto (ONNX int8 de etiquetado G2P) no se anticipa necesidad de GPU, pero el autor no publica requisitos.
- Compatibilidad con GPU de consumo: no disponible. El uso previsto es inferencia en CPU.
- Almacenamiento: aproximadamente 0,1 GB para el arbol de datos completo; puede reducirse cargando solo los idiomas necesarios.
- Opciones de despliegue: ONNX Runtime para los ficheros `.onnx`; el arbol de datos se consume mediante los motores del repositorio vernacula-phonemizer en TypeScript, C# y Rust. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de artefacto).
- Latencia y throughput: no disponible. No se publican mediciones.

## Comparativa con modelos similares

No se dispone de datos de comparacion en la informacion proporcionada. Los sistemas de la misma categoria (conversion grafema-fonema y fonemizacion a IPA) incluyen herramientas como eSpeak NG, gruut/Phonemizer, DeepPhonemizer o Epitran, pero no se han facilitado parametros, contexto, rendimiento ni licencia de estos para establecer una comparacion verificable.

| Sistema | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vernacula-phonemizer-data | no disponible | no aplica | no disponible | per-file (MIT y otras) | HuggingFace, tag `224339e8` |
| Alternativas de la categoria (eSpeak NG, gruut/Phonemizer, DeepPhonemizer, Epitran) | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes. Cualquier ficha orientada a LLM no aplica.
- Licencia no unificada: la redistribucion exige respetar los terminos fichero a fichero recogidos en `LICENSES/PROVENANCE.md` y los sidecars `*.PROVENANCE.md`. El uso comercial debe revisarse caso por caso, ya que hay ficheros bajo GPL-3.0 y dos licencias a medida.
- Atribuciones obligatorias por nombre: el paquete usa los ficheros de diccionario JMdict/EDICT y KANJIDIC, propiedad del Electronic Dictionary Research and Development Group (CC-BY-SA 4.0). El lexico sindhi procede del Sindhi Open Lexicon de SindhiLanguage.org, preparado por Amar Fayaz Buriro.
- Riesgo de errores de pronunciacion: al combinar lexicones, reglas y un modelo G2P de fallback, las palabras fuera de vocabulario o los nombres propios pueden fonemizarse de forma incorrecta. No se publican tasas de error.
- Cobertura de idiomas incompleta en la documentacion: solo se mencionan explicitamente ingles, japones y sindhi; el listado completo y el estado de cada idioma no estan disponibles.
- Cobertura lexica y de reglas desconocida: no se indica el tamano de vocabulario ni el numero de reglas por idioma.
- Dependencia de version: el motor debe fijarse a la misma revision de git que los datos (tag `224339e8`); desajustes entre motor y datos pueden romper la carga de recursos.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Fecha de creacion futura respecto a la fecha habitual de consulta (2026-10-10), dato que conviene verificar en la plataforma.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/christopherthompson81/vernacula-phonemizer-data
- Motor vernacula-phonemizer (GitHub): https://github.com/christopherthompson81/vernacula-phonemizer
- Declaracion de procedencia y licencias por fichero: https://huggingface.co/christopherthompson81/vernacula-phonemizer-data/blob/224339e8/LICENSES/PROVENANCE.md
- Licencia del Electronic Dictionary Research and Development Group (EDRDG): https://www.edrdg.org/edrdg/licence.html
- Sindhi Open Lexicon, SindhiLanguage.org: https://sindhilanguage.org/

Nota: los resultados de busqueda web facilitados corresponden a paginas de inicio de sesion de Gmail y no guardan relacion con el modelo, por lo que no se incluyen como enlaces relevantes.
