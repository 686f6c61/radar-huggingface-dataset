# konko/bornomala-bengali-tokenizer

## Resumen

BMBT (Bornomala's Bengali Tokenizer) es un tokenizador especifico para bengali desarrollado por konko dentro de Project Bornomala, un esfuerzo de investigacion no comercial originado en Bengala Occidental cuyo objetivo es construir un modelo de lenguaje nativo para bengali, consciente de sus dialectos, y preservar la lengua. A diferencia de los tokenizadores multilingues habituales, BMBT no descubre la estructura del bengali de forma estadistica: analiza la gramatica virama propia de la escritura bengali con un parser de estados finitos escrito a mano antes de aprender cualquier merge de BPE, de modo que cada atomo del vocabulario es un akshara real y completo.

Se trata de un componente de tokenizacion, no de un modelo neuronal generativo: no tiene parametros entrenados en el sentido de un transformer, no genera texto y no dispone de ventana de contexto. Su artefacto principal es un vocabulario de 64.000 tokens (variante `bmbt-64k`) con licencia Apache 2.0, entrenado sobre un corpus ponderado hacia generos literarios (Wikisource, AI4Bharat Sangraha, Wikipedia y XL-Sum). La relevancia actual esta en que mide y reduce el dano estructural que los tokenizadores generalistas causan al bengali: sobre 828 lineas retenidas de Wikipedia en bengali obtiene una fertility de 1,524 y una tasa de fragmentacion destructiva de 0,0004, frente a valores de fragmentacion de entre el 0,0162 de BanglaBERT y el 0,1552 de mBERT.

El proyecto publica la comparativa completa contra 18 sistemas externos y reconoce de forma explicita sus limites: sobre texto en Banglish (bengali romanizado) queda ultimo de 19 tokenizadores, porque su arquitectura esta construida enteramente alrededor de la estructura akshara de la escritura bengali. Esa carencia es la que motivo la linea de trabajo separada de transliteracion del proyecto. Actualmente el modelo registra 0 descargas y 0 likes en HuggingFace, por lo que no existe validacion externa verificable de su adopcion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador BPE restringido sobre unidades akshara, con parser de estados finitos escrito a mano que aplica la gramatica virama del bengali; nunca divide un conjuncto |
| Parametros totales | No aplica (no es un modelo neuronal); vocabulario de 64.000 tokens |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (tokenizador) |
| Tipos de cuantizacion | No aplica (no hay pesos numericos que cuantizar) |
| Idiomas soportados | Bengali (bn) e ingles (en); disenado para escritura bengali, no para bengali romanizado |
| Licencia | Apache 2.0 |
| Formato de pesos | Artefacto de la libreria `tokenizers` de HuggingFace; no se detalla el fichero exacto en la informacion disponible |
| Tamano de vocabulario | 64.000 tokens (`bmbt-64k`) |
| Pipeline declarado | token-classification |
| Datasets de entrenamiento | wikimedia/wikipedia, wikimedia/wikisource, ai4bharat/sangraha, csebuetnlp/xlsum |
| Variante morfologica | `bmbt-64k-morph`, no incluida en este repositorio |

## Arquitectura y entrenamiento

La innovacion central de BMBT es el orden de las operaciones. Un tokenizador BPE convencional sobre clusters de grafemas, como el modelo hermano `bn-bpe-64k`, determina primero su unidad atomica con el algoritmo generico UAX #29 de Unicode y despues deja que los merges de BPE descubran el resto de forma estadistica. BMBT invierte el proceso: un parser de estados finitos escrito a mano (`akshara.py`) analiza la gramatica virama generativa del bengali y produce atomos que son aksharas completos, es decir, unidades de consonante inicial mas conjuncto mas vocal, antes de que se aprenda ningun merge. De ahi se deriva una garantia a nivel de gramatica: un conjuncto de consonantes unido por virama no puede quedar partido entre dos tokens, porque el parser nunca genera un atomo que lo atraviese.

El tokenizador expone ademas `featurize()`, que devuelve la descomposicion estructural real de cada akshara (consonantes de onset, cual lleva nukta, la vocal, los modificadores finales y si aparecio ZWJ o ZWNJ) directamente desde el tokenizador, no como un anadido posterior en la capa de embeddings. El entrenamiento del vocabulario se realizo sobre el mismo corpus ponderado hacia lo literario que el modelo BPE anterior, con 64.000 tokens. El autor documenta una constatacion honesta: un BPE restringido que nunca parte un akshara no puede superar a uno sin restriccion en numero bruto de tokens, y de hecho las fronteras de la gramatica akshara del bengali resultan casi isomorfas a las fronteras de clusters de grafemas en texto bien formado. Medido contra `bn-bpe-64k` en seis registros retenidos disjuntos, ambos empatan exactamente en cinco y BMBT se situa por delante por 0,001 de fertility en el sexto (FLORES+). No se dispone de informacion sobre uso de RLHF, DPO ni decodificacion especulativa, ya que no son aplicables a un tokenizador.

## Capacidades

- Segmentacion morfologica nativa: convierte texto en bengali en secuencias de tokens cuyos limites respetan la gramatica akshara, con integridad total de conjunctos por construccion.
- Descomposicion estructural mediante `featurize()`: devuelve por cada akshara sus consonantes de onset, marcas nukta, vocal, modificadores finales y presencia de ZWJ/ZWNJ.
- Vocabulario de 64.000 tokens optimizado para bengali, con baja fertility medida (1,524 en Wikipedia en bengali retenida).
- Reduccion de fragmentacion destructiva a 0,0004, frente a valores de entre 0,0088 y 0,1552 en los tokenizadores generalistas comparados.
- Integracion con el ecosistema HuggingFace: artefacto de la libreria `tokenizers`, cargable desde `transformers`.
- Cobertura declarada de bengali e ingles; sin datos publicados sobre el comportamiento especifico en ingles mas alla de la etiqueta de idioma.
- Variante morfologica opcional (`bmbt-64k-morph`, fuera de este repositorio) que alinea los limites de token con la estructura de sufijos del bengali, alcanzando el 100% de las junturas de morfemas alcanzables sin violaciones de integridad de conjunctos, a un coste de fertility de entre el 21,7% y el 42,1% segun registro.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, capacidades de agente ni modo thinking: no es un modelo generativo.

## Casos de uso

- Preentrenamiento de modelos de lenguaje en bengali desde cero: un vocabulario con integrity de conjunctos garantizada reduce el numero de tokens necesarios para representar el mismo texto y evita que el modelo tenga que reconstruir morfologia partida durante el preentrenamiento.
- Adaptacion de vocabulario en modelos multilingues indicos: sustituir el tokenizador de un modelo existente por BMBT para reducir la fertility efectiva sobre bengali, con la cautela de que requiere reentrenar los embeddings de entrada y salida.
- Preprocesado de corpus para tareas de etiquetado de secuencias (NER, POS, analisis morfologico): el pipeline declarado es token-classification y los limites de token alineados con aksharas facilitan la proyeccion de etiquetas.
- Traduccion automatica bengali-ingles: el registro FLORES+ del benchmark (2.009 frases traducidas profesionalmente) esta especificamente disenado para medir tokenizacion en traduccion; BMBT obtiene fertility 1,240, la mejor cifra de su comparativa.
- Analisis linguistico computacional: `featurize()` permite extraer rasgos estructurales reales de cada akshara sin construir un parser propio, util para investigacion en morfologia bengali.
- Compresion y almacenamiento de corpus en bengali: con 11,38 bytes por token frente a 5,79 de DeepSeek-V3 o 6,25 de mBERT, un corpus almacenado en tokens de BMBT ocupa aproximadamente la mitad que con esos tokenizadores.
- Evaluacion de tokenizadores en contextos indicos: sirve como linea base de referencia contra la que medir tokenizadores propios o multilingues en bengali.
- Normalizacion de texto previa a pipelines de voz (ASR/TTS) en bengali: la garantia de no partir conjunctos evita artefactos de pronunciacion derivados de fragmentaciones destructivas.

## Benchmarks y rendimiento

Medidos sobre 828 lineas retenidas de Wikipedia en bengali (no vistas en entrenamiento), contra tokenizadores publicos de 18 sistemas externos, sobre texto normalizado a NFC. Fertility y tasa destructiva mas bajas son mejores; STRR y bytes por token mas altos son mejores. El STRR no esta definido en la informacion disponible.

| Tokenizador | Fertility | STRR | Bytes/token | Tasa destructiva |
|---|---:|---:|---:|---:|
| BMBT (este modelo) | 1,524 | 0,722 | 11,38 | 0,0004 |
| BanglaBERT (csebuetnlp) | 1,625 | 0,649 | 10,67 | 0,0162 |
| IndicBERTv2 (AI4Bharat) | 1,652 | 0,612 | 10,50 | 0,0191 |
| BanglaT5 (csebuetnlp) | 1,669 | 0,628 | 10,39 | 0,0088 |
| XLM-RoBERTa (Meta) | 2,464 | 0,363 | 7,04 | 0,0627 |
| Sarvam-1 (Sarvam AI) | 2,593 | 0,415 | 6,69 | 0,0364 |
| GPT-4o (OpenAI o200k) | 2,608 | 0,111 | 6,65 | no disponible |
| BrahmicTokenizer-131K (TSAI) | 2,620 | 0,154 | 6,62 | 0,0820 |
| mBERT (Google) | 2,777 | 0,385 | 6,25 | 0,1552 |
| DeepSeek-V3 | 2,994 | 0,089 | 5,79 | 0,1031 |

Resultados adicionales reportados por el autor:

| Registro | Medida | Resultado |
|---|---|---|
| FLORES+ (2.009 frases) | Fertility de BMBT | 1,240 |
| FLORES+ (2.009 frases) | Fertility de `bn-bpe-64k` | 1,241 |
| Banglish (texto romanizado en alfabeto latino) | Posicion de BMBT entre 19 tokenizadores | Ultimo, por diseno |
| Pipeline de transliteracion del proyecto | Exactitud de coincidencia exacta | 53,9% |
| Pipeline de transliteracion del proyecto | Tasa de error de caracter | 13,5% |

Cinco registros retenidos adicionales y disjuntos (literario/formal, web general, noticias y FLORES+) confirman el mismo orden, salvo en el sexto caso. La diferencia de 0,001 de fertility en FLORES+ equivale a 1-2 tokens de diferencia en el total de 2.009 frases. En los conjunctos bengalies, todos los tokenizadores generalistas medidos rompen de forma destructiva entre el 0,9% y el 15,5%; BMBT rompe el 0,04%.

## Requisitos de hardware

- VRAM para inferencia: no aplica. El tokenizador es un componente de software determinista que se ejecuta en CPU.
- Memoria en RAM: no disponible la cifra exacta; se trata de una tabla de vocabulario de 64.000 entradas mas las reglas del parser de estados finitos, del orden de unos pocos megabytes.
- GPU recomendadas: ninguna. No requiere aceleracion por GPU.
- Cabe en cualquier equipo de consumo: si, incluidos portatiles sin GPU dedicada y entornos de CI con recursos minimos.
- Opciones de despliegue: libreria `tokenizers` de HuggingFace (implementacion en Rust), integracion en `transformers` mediante carga del artefacto de tokenizacion, y uso como etapa de preprocesado en pipelines propios.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Coste de entrenamiento: no disponible; el autor no publica el tiempo ni los recursos empleados en entrenar el vocabulario.

## Comparativa con modelos similares

| Tokenizador | Tamano de vocabulario | Fertility (Wikipedia bn retenida) | Tasa destructiva | Licencia | Notas |
|---|---:|---:|---:|---|---|
| BMBT (este modelo) | 64.000 | 1,524 | 0,0004 | Apache 2.0 | Parser akshara escrito a mano; no parte conjunctos |
| `bn-bpe-64k` (konko) | 64.000 | Empate exacto en 5 de 6 registros; 1,241 en FLORES+ frente a 1,240 | No disponible | No disponible | BPE sobre clusters de grafemas UAX #29; mismo corpus, mas simple |
| BanglaBERT (csebuetnlp) | No disponible | 1,625 | 0,0162 | No disponible | Tokenizador de un modelo enmascarado especifico de bengali |
| IndicBERTv2 (AI4Bharat) | No disponible | 1,652 | 0,0191 | No disponible | Tokenizador multilingue indico |
| XLM-RoBERTa (Meta) | No disponible | 2,464 | 0,0627 | No disponible | Tokenizador multilingue generico |
| GPT-4o (OpenAI o200k) | No disponible | 2,608 | No disponible | No disponible | Tokenizador generalista; mide peor en bengali que alternativas especificas |

La comparativa relevante no es de rendimiento en tareas, sino de eficiencia y dano estructural en la tokenizacion del bengali. No se han publicado resultados de benchmarks en la informacion disponible para tareas posteriores (clasificacion, NER, traduccion o generacion).

## Limitaciones y advertencias

- No es un modelo generative: no produce texto, no razona, no ejecuta codigo y no soporta tool calling ni flujos de agente. Cualquier expectativa en ese sentido es un error de categoria.
- Banglish: sobre texto en bengali romanizado queda ultimo de 19 tokenizadores medidos, de forma deliberada segun el autor. El proyecto lo mitiga con un pipeline de transliteracion separado (53,9% de coincidencia exacta, 13,5% de tasa de error de caracter) que debe aplicarse antes de tokenizar.
- Eficiencia bruta: no supera a su hermano sin restricciones `bn-bpe-64k`. Empatan en cinco de seis registros retenidos y la diferencia en el sexto (0,001 de fertility, 1-2 tokens en 2.009 frases) no es estructural. La ventaja de BMBT es de integridad estructural, no de compresion.
- La variante morfologica (`bmbt-64k-morph`) no esta en este repositorio y tiene un coste real de fertility de entre el 21,7% y el 42,1% segun registro, lo que la hace poco aconsejable si el objetivo es eficiencia.
- Cobertura de idiomas limitada: aunque la etiqueta incluya `en`, el diseno es bengali-first y no se publican mediciones sobre texto en ingles.
- La tasa de fragmentacion destructiva no es cero: 0,0004 implica que una fraccion minima de conjunctos sigue rompiendose en texto real.
- Vocabulario de 64.000 tokens: puede resultar sobredimensionado para tareas muy acotadas o para despliegues con restricciones severas de memoria de embeddings.
- Ausencia de validacion externa: 0 descargas y 0 likes en el momento de redactar esta ficha. Los datos de rendimiento proceden del propio autor, sin replicacion independiente conocida.
- Licencia: el artefacto se publica bajo Apache 2.0, lo que en principio permite uso comercial del tokenizador. Sin embargo, el autor describe Project Bornomala como un esfuerzo de investigacion no comercial, por lo que conviene verificar las condiciones del repositorio antes de un despliegue comercial.
- Sesgos de corpus: el vocabulario esta entrenado sobre un corpus ponderado hacia lo literario (Wikisource, Wikipedia, Sangraha, XL-Sum), lo que puede infrarrepresentar registros coloquiales, dialectales o de redes sociales.
- No se dispone de datos sobre el comportamiento del tokenizador con texto ruidoso, errores ortograficos o variantes dialectales del bengali, una de las areas que el proyecto declara querer abordar.

## Enlaces

- Pagina de HuggingFace: https://huggingface.co/konko/bornomala-bengali-tokenizer
- Repositorio de GitHub de Project Bornomala: https://github.com/konkomaji/bornomala
- Tokenizador hermano `bn-bpe-64k`: https://huggingface.co/konko/bengali-bpe-tokenizer
- Documentacion de la variante morfologica (ruta dentro del repositorio): `docs/bmbt-morphology.md`
- Tablas completas de los seis registros de benchmark (ruta dentro del repositorio): `benchmarks/bengali-comparison.md`
- Parser de aksharas (ruta dentro del repositorio): `akshara.py`
- Los resultados de la busqueda web realizada no contienen enlaces relevantes a este modelo.
