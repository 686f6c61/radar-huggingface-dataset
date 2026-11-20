# cstr/camel-morph-msa-disambig

## Resumen

Camel Morph MSA context disambiguation model es un modelo pequeno publicado por el usuario cstr que resuelve la desambiguacion morfologica del arabe estandar moderno (MSA) en contexto. No es un modelo generativo ni un transformer: es un modelo oculto de Markov (HMM) de bigramas cuyos estados son los analisis morfologicos que devuelve el analizador Camel Morph MSA v1.0 para cada token, agrupados por etiqueta, lema y categoria gramatical. Su funcion es ordenar esos analisis candidatos segun su probabilidad en la frase, seleccionando el analisis top-1.

El modelo se distribuye como el componente de desambiguacion del analizador nativo de CrispEmbed (`crispembed_ar_morph_disambiguate`, ABI C version 3) y se emplea en Quds Office para correccion gramatical del arabe. El repositorio contiene un unico bundle `bigram-v1/` con manifiesto, pesos en formato propietario `.cmdis`, aviso de atribucion y licencia. El tamano del repositorio es practicamente nulo (0.0 GB), coherente con un modelo estadistico de tablas de probabilidades y no de pesos neuronales.

Su relevancia es practica: en tareas de analisis morfologico arabe, la desambiguacion en contexto es el cuello de botella clasico, y este modelo mejora de forma sustancial el ranking sin contexto del analizador base (47,0% a 77,9% en UPOS sobre el conjunto de evaluacion). Esta pensado para integrarse en pipelines de procesamiento linguistico y correccion, no como modelo de lenguaje general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HMM de bigramas sobre analisis morfologicos (no neuronal) |
| Parametros totales | no disponible (modelo estadistico de tablas de probabilidad) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (depende del analizador y del pipeline; el modelo puntua analisis por token en su frase) |
| Tipos de cuantizacion | no aplica (formato propio `.cmdis`) |
| Idiomas soportados | arabe (ar), arabe estandar moderno |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | `.cmdis` (crispembed-camel-morph-disambig-v1), bundle con `manifest.json`, `NOTICE` y `LICENSE` |

## Arquitectura y entrenamiento

El modelo es un HMM de bigramas cuyos estados son los analisis que devuelve la base de datos Camel Morph MSA para cada token, agrupados por etiqueta (`pos:value, prc3:value, prc2:value, prc1:value, prc0:value, enc0:flag, asp:value, per:value, num:value`), lema y categoria gramatical. Las transiciones recurren al unigrama de etiquetas como respaldo (backoff) y las probabilidades de lexema se suavizan con add-beta por categoria gramatical.

El entrenamiento es no supervisado: estimacion por maximizacion de la esperanza (EM) sobre 12.000.927 tokens de Wikipedia en arabe (volcado 20231101.ar), con 10 iteraciones. En el primer paso E, cada candidato se pondera por la frecuencia de su etiqueta entre los tokens no ambiguos, reduciendo el peso de las etiquetas `noun_prop=0.1`, `abbrev=0.1` e `interj=0.1`. Esta disenado para la base de datos `proofing-bin` de `cstr/camel-morph-msa-v1.0` (SHA-256 `fc9d9109ddb5430da94def715df05b563cb37ffaec508f3514668ded19438909`), la variante `noprob` sin probabilidades del Penn Arabic Treebank.

## Capacidades

- Desambiguacion morfologica en contexto: selecciona el analisis top-1 entre los candidatos de Camel Morph MSA para cada token de una frase.
- Etiquetado gramatical (POS) y lematizacion en arabe estandar moderno, con etiquetas Camel Morph y mapeo a UPOS.
- Ranking de analisis alternativos con puntuaciones de probabilidad, no solo salida dura.
- Integracion como componente nativo de CrispEmbed mediante ABI C (`crispembed_ar_morph_disambiguate`, version 3).
- Uso en correccion gramatical (proofing) de arabe, segun indica el autor.
- No soporta generacion de texto, tool calling, agentes, vision, audio ni modos de razonamiento.

## Casos de uso

- Correccion gramatical y morfologica de arabe: el modelo ordena los analisis de cada palabra en su frase y permite detectar etiquetas o lemas incompatibles con el contexto, que es exactamente el uso declarado en Quds Office.
- Preprocesamiento para NLP arabe: antes de un tagger o parser descendente, aplicar esta desambiguacion reduce la ambiguedad de entrada y mejora la calidad de las anotaciones posteriores.
- Lematizacion para indexacion y busqueda: al elevar la precision de lema al 90,4% en contexto, resulta util para normalizar terminos en motores de busqueda o sistemas de recuperacion en arabe.
- Construccion de corpus anotados: el modelo puede preanotar POS y lema sobre texto de Wikipedia o prensa para revision humana, con la ventaja de no requerir datos etiquetados en el entrenamiento.
- Ensenanza de arabe asistida: integrado en herramientas de escritura, puede senalar analisis improbables en una frase y sugerir la lectura morfologica correcta.
- Analisis de texto juridico o administrativo en arabe: al ser un modelo ligero y determinista, encaja en pipelines que exigen bajo coste computacional y resultados reproducibles.
- Integracion en aplicaciones C/C++: gracias al ABI C de CrispEmbed, puede embeberse en software nativo sin dependencias de runtime de aprendizaje profundo.

## Benchmarks y rendimiento

Evaluacion sobre el test UD Arabic-PUD (GitHub master, 20 de noviembre de 2026; CC BY-SA 3.0; solo evaluacion), 15.482 tokens que constituyen una palabra UD, comparando el analisis top-1 en contexto contra el gold UPOS y lema.

| Top-1 en contexto (15.482 tokens) | noprob (sin ranking) | este modelo | full (probabilidades PATB) |
| --- | ---: | ---: | ---: |
| UPOS (mapeo grueso Camel→UD) | 47,0% | **77,9%** | 77,9% |
| Lema (sin diacriticos, normalizado) | 72,3% | **90,4%** | 88,2% |
| Ambos | 40,9% | **73,2%** | 74,1% |

En las frases reservadas 500-999 (7.869 tokens), no usadas en la seleccion de modelo, el modelo obtiene 78,1 / 90,8 / 73,4 frente a 77,5 / 87,8 / 73,5 de `full` y 47,6 / 72,9 / 41,0 de `noprob`. El gold UPOS+lema esta entre los analisis candidatos en el 84,9% de los tokens, lo que marca el techo practico de la desambiguacion sobre esta base de datos.

## Requisitos de hardware

- VRAM: no aplica; es un modelo estadistico de tablas, no requiere GPU.
- CPU: suficiente cualquier procesador moderno; el coste dominante es el analizador Camel Morph y la consulta a la base de datos.
- GPU recomendadas: ninguna; no se beneficia de aceleracion por hardware.
- Cabe en cualquier equipo, incluidos entornos embebidos, siempre que se disponga de la base de datos `cstr/camel-morph-msa-v1.0` (variante `noprob`).
- Despliegue: a traves de CrispEmbed (ABI C) o mediante el formato `crispembed-camel-morph-disambig-v1`; no es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos neuronales.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Resultado UPOS (PUD) | Licencia | Disponibilidad |
| --- | --- | --- | ---: | --- | --- |
| camel-morph-msa-disambig (este) | HMM de bigramas | Por frase | 77,9% | CC BY-SA 4.0 | Hugging Face |
| Camel Morph MSA `noprob` sin ranking | Ranking MLE sin contexto | No aplica | 47,0% | CC BY 4.0 (Camel Morph) | GitHub |
| Camel Morph MSA `full` con probabilidades PATB | Ranking MLE con probabilidades | No aplica | 77,9% | CC BY 4.0 (Camel Morph) | GitHub |

No se dispone de datos comparativos con desambiguadores neuronales (por ejemplo, basados en transformers) en la informacion proporcionada.

## Limitaciones y advertencias

- Solo cubre arabe estandar moderno; no esta entrenado para dialectos arabes ni para otros idiomas.
- Depende de una version concreta de la base de datos (`cstr/camel-morph-msa-v1.0`, variante `noprob`, SHA-256 indicado); usar otra base puede invalidar las probabilidades.
- El techo de acierto esta limitado por la cobertura de analisis: el gold UPOS+lema solo aparece entre los candidatos en el 84,9% de los tokens.
- Es un modelo estadistico con supuestos de bigrama; no captura dependencias sintacticas de largo alcance.
- Entrenado de forma no supervisada sobre Wikipedia en arabe, por lo que hereda los sesgos de dominio y de estilo de ese corpus (registro enciclopedico).
- Licencia CC BY-SA 4.0: el uso comercial exige atribucion y compartir bajo la misma licencia las obras derivadas; revisar el `NOTICE` por la doble atribucion (Wikipedia y Camel Morph MSA v1.0).
- No es un modelo de lenguaje: no genera texto ni responde a instrucciones; usarlo fuera de su tarea de ranking morfologico producira resultados sin sentido.
- No se han publicado datos de latencia ni de throughput; conviene medirlos en el entorno de despliegue concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cstr/camel-morph-msa-disambig
- Base de datos asociada: https://huggingface.co/cstr/camel-morph-msa-v1.0
- Camel Morph MSA v1.0: https://github.com/CAMeL-Lab/camel_morph
- Formato crispembed-camel-morph-disambig-v1: https://github.com/CrispStrobe/CrispEmbed/blob/main/docs/arabic-morph-disambig-format.md
- Repositorio CrispEmbed: https://github.com/CrispStrobe/CrispEmbed
