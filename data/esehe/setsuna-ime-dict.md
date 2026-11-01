# esehe/setsuna-ime-dict

## Resumen

`esehe/setsuna-ime-dict` no es un modelo de lenguaje, sino un repositorio de diccionarios para el motor de conversion kana-kanji del IME (input method editor) [setsuna-ime](https://github.com/esehehelp/setsuna-ime). Lo desarrolla el autor `esehe` y su funcion es proporcionar los datos lexicos y de analisis morfologico que el instalador del IME descarga junto al modelo de conversion neuronal [Bletilla-v0.1-small](https://huggingface.co/esehe/Bletilla-v0.1-small), verificando su integridad mediante SHA-256.

El repositorio contiene dos artefactos principales: un lexico de lectura (`lexicon-v1.lexicon`) en formato `LEXICON1`, con tabla de superficies, lecturas, costes y context IDs, y un analizador morfologico (`nid-ma-v2-600k-tb/`) basado en CRF con diccionario heredado de Vibrato, exportado con el esquema `neo-ime-analyzer-export-v1`. El lexico se usa tanto para anadir candidatos que el modelo neuronal no genera como para realizar conversion puramente basada en diccionario.

Es relevante para desarrolladores que construyan IME japoneses o sistemas de conversion kana-kanji, ya que combina recursos lexicos de referencia (SudachiDict, Mozc, UniDic, JMdict) con el formato de integracion especifico de setsuna-ime. El tamano del repositorio es de aproximadamente 0,5 GB y la licencia es CC BY-SA 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (repositorio de diccionarios, no modelo neuronal). Incluye lexico en formato `LEXICON1` y analizador morfologico CRF (nid-ma) |
| Parametros totales | No disponible (no es un modelo con pesos neuronales) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Japones (`ja`) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | `lexicon-v1.lexicon` (texto, formato `LEXICON1`); `system.dic.zst` (diccionario comprimido con zstd); `alternates.bin` (binario) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo neuronal entrenado con descenso de gradiente en el sentido habitual. El componente `nid-ma-v2-600k-tb/` es un analizador morfologico basado en CRF, con costes aprendidos sobre un corpus y un diccionario derivado de Vibrato, exportado con el manifiesto `neo-ime-analyzer-export-v1`. El sufijo `600k-tb` sugiere un entrenamiento sobre aproximadamente 600 000 unidades de corpus, aunque el autor no detalla la composicion exacta del dataset en la informacion disponible.

El lexico `lexicon-v1.lexicon` contiene una tabla de entradas con superficie, lectura, coste y context ID de categoria gramatical, mas una matriz de costes de conexion entre context IDs. Los costes se asignan a partir de la frecuencia de uso de cada combinacion en el corpus. La construccion del vocabulario y las lecturas se apoya en cuatro fuentes: SudachiDict (full, Apache-2.0), Mozc (diccionario, costes de conexion y context IDs, BSD-3-Clause, con la parte derivada de IPAdic bajo licencia NAIST), UniDic cwj (BSD-3-Clause) y JMdict/JMnedict de EDRDG (CC BY-SA 4.0). La licencia final del repositorio se fija en CC BY-SA 4.0 por compatibilidad con esta ultima fuente.

## Capacidades

- Conversion kana-kanji basada en diccionario: el lexico permite convertir lecturas en kana a superficies kanji mediante busqueda y costes de conexion.
- Aumento de candidatos: anade a la salida del modelo neuronal Bletilla-v0.1-small palabras que el modelo no ha generado.
- Segmentacion en bunsetsu: el analizador nid-ma permite dividir la conversion por palabras al editar segmentos con las teclas de direccion izquierda y derecha.
- Gestion de lecturas alternativas: `alternates.bin` almacena lecturas adicionales para palabras con multiples pronunciaciones, junto con sus costes de conexion.
- Integracion con el instalador de setsuna-ime: descarga de una revision fija del repositorio y verificacion SHA-256.
- Cobertura lexica amplia derivada de SudachiDict, Mozc, UniDic y JMdict/JMnedict.
- Idioma: exclusivamente japones.

## Casos de uso

- Desarrollo de IME japoneses: integracion directa en setsuna-ime como fuente de lexico y analizador morfologico, configurando las claves `[lexicon] file` y `[engine] analyzer_manifest`.
- Conversion kana-kanji en produccion: el lexico permite resolver lecturas ambiguas con costes de conexion calibrados sobre corpus, sin depender exclusivamente de un modelo neuronal.
- Edicion por segmentos en interfaces de entrada: el analizador CRF posibilita la edicion de bunsetsu con navegacion izquierda/derecha, habitual en IME japoneses comerciales.
- Post-procesado de salidas neuronales: uso del lexico como capa de rescate para candidatos que el modelo Bletilla no emite, mejorando la cobertura en terminos poco frecuentes.
- Investigacion en conversion kana-kanji: base de comparacion frente a lexicos propios, ya que los costes y context IDs siguen el esquema de Mozc/IPAdic.
- Sistemas de busqueda y normalizacion de texto japones: las tablas de lecturas y superficies sirven para generar variantes de consulta o para normalizar entradas.
- Analisis morfologico ligero: el manifiesto nid-ma puede reutilizarse en pipelines que necesiten segmentacion con diccionario sin desplegar un analizador mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica inferencia neuronal: el repositorio contiene diccionarios y un analizador CRF, no pesos de transformer.
- Espacio en disco: aproximadamente 0,5 GB para el repositorio completo.
- Memoria: el analizador CRF y el lexico se cargan en memoria del proceso del IME; el consumo exacto no esta especificado en la informacion disponible.
- GPU: no necesaria para este repositorio. El modelo neuronal asociado (Bletilla-v0.1-small) es el que determinaria los requisitos de GPU, no documentados aqui.
- Despliegue: mediante el instalador `install.ps1` de setsuna-ime, que descarga una revision fija y verifica SHA-256.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Recurso | Tipo | Idioma | Licencia | Uso |
|---|---|---|---|---|
| `esehe/setsuna-ime-dict` | Lexico + analizador CRF para IME | Japones | CC BY-SA 4.0 | setsuna-ime |
| SudachiDict (full) | Diccionario morfologico | Japones | Apache-2.0 | Analisis morfologico Sudachi |
| Mozc | Diccionario + costes para IME | Japones | BSD-3-Clause (parte IPAdic bajo NAIST) | IME Mozc |
| UniDic (cwj) | Diccionario morfologico | Japones | BSD-3-Clause | Analisis morfologico |
| JMdict / JMnedict | Diccionario lexico | Japones | CC BY-SA 4.0 | Diccionarios y traduccion |

La comparacion directa con modelos neuronales de lenguaje no procede, ya que este repositorio no contiene pesos de transformer. Frente a los diccionarios de origen, su valor diferencial es el formato de integracion especifico de setsuna-ime y la combinacion de lexico con analizador CRF en un unico paquete versionado.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto libre ni razona; solo soporta conversion y analisis morfologico.
- Idioma unico: solo japones, sin soporte multilingue.
- Dependencia de setsuna-ime: los formatos `LEXICON1` y `neo-ime-analyzer-export-v1` estan ligados al ecosistema del IME; reutilizarlos fuera de el requiere adaptadores.
- Licencia CC BY-SA 4.0: impone atribucion y compartir bajo la misma licencia las obras derivadas, lo que puede condicionar el uso comercial de adaptaciones del lexico.
- Herencia de licencias de terceros: aunque el repositorio se declara CC BY-SA 4.0, incorpora material de Mozc/IPAdic con condiciones NAIST y de SudachiDict y UniDic bajo BSD-3-Clause; conviene revisar la compatibilidad en redistribuciones.
- Cobertura lexica limitada a las fuentes citadas: terminos recientes, jerga o nombres propios no presentes en SudachiDict, Mozc, UniDic o JMdict pueden no resolverse.
- Sin datos de evaluacion publicados: no hay metricas de precision de conversion ni comparativas de calidad frente a otros IME.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema pequeno y poca validacion externa.
- Fecha de creacion y actualizacion registradas en 2026-10-30: verificar la vigencia de la revision fija que consume el instalador.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/esehe/setsuna-ime-dict
- Proyecto setsuna-ime: https://github.com/esehehelp/setsuna-ime
- Modelo de conversion asociado: https://huggingface.co/esehe/Bletilla-v0.1-small
- SudachiDict: https://github.com/WorksApplications/SudachiDict
- Mozc: https://github.com/google/mozc
- UniDic: https://clrd.ninjal.ac.jp/unidic/
- JMdict / JMnedict (EDRDG): https://www.edrdg.org/
