# janmbuys/ft-SA-LID

## Resumen

ft-SA-LID es un clasificador de identificacion de idioma (LID) basado en fastText, desarrollado por janmbuys, especializado en lenguas bantu de Africa austral y en texto con cambio de codigo (code-switching) con ingles. Resuelve un problema concreto: localizar contenido en lenguas sudafricanas dentro de grandes volumenes de web crawl y transcripciones, donde los modelos genericos de LID rinden mal en fragmentos cortos y en idiomas con fuerte solapamiento lexico.

El modelo predice 26 etiquetas: las 9 lenguas bantu oficiales de Sudafrica, afrikaans, ingles, 13 lenguas africanas vecinas, neerlandes y una clase agregada `other`. Su diseno clave es que opera de forma fiable a nivel de grupo linguistico (nguni, sotho_tswana, venda, tsonga, etc.), ya que idiomas como isiZulu, isiXhosa, isiNdebele y siSwati son a menudo indistinguibles en una linea corta pero siempre pertenecen al grupo nguni.

La relevancia actual es practica: ofrece una puntuacion calibrada (`sa_african_score`) con umbrales documentados de falsos positivos y recall, lo que permite filtrar corpus a escala web con criterios de coste claros. El repositorio ocupa 1,1 GB y el modelo principal (`model.bin`) pesa 1,07 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | fastText (clasificador lineal con embeddings de n-gramas de subpalabras) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (clasificacion por linea o texto normalizado; ventana deslizante de 5 palabras como utilidad auxiliar) |
| Tipos de cuantizacion | no disponible (formato binario nativo de fastText) |
| Idiomas soportados | 26 etiquetas: zu, xh, nr, ss, st, tn, nso, ve, ts, af, en, nd, sn, ny, loz, toi, tsc, ndc, kck, rng, bem, kqn, lue, sw, nl y `other` |
| Licencia | CC BY-SA 3.0 |
| Formato de pesos | binario fastText (`model.bin`, 1,07 GB) |

## Arquitectura y entrenamiento

Se trata de un clasificador fastText, es decir, un modelo lineal sobre la media de embeddings de n-gramas de caracteres y palabras, optimizado para clasificacion de texto a gran velocidad. No es un transformer ni un modelo generativo: su funcion es asignar probabilidades a 26 etiquetas de idioma. El autor no detalla en la model card el numero de tokens de entrenamiento ni la composicion exacta del dataset, aunque si indica que los conjuntos de test son disjuntos del entrenamiento, con bloqueo por coincidencia exacta tras normalizacion y, en los conjuntos web, edu y Vuk'uzenzele, separacion por documento o dominio.

Un aspecto tecnico destacable es la normalizacion obligatoria del texto antes de la inferencia: NFC, minusculas, eliminacion de URLs y correos, sustitucion de digitos, guiones bajos y puntuacion (excepto `'`, `’` y `-`) por espacios, y colapso de espacios en blanco. Si se llama a fastText directamente sin esta normalizacion, las predicciones cambian. El modelo expone ademas una API auxiliar (`sa_lid.py`) con funciones `predict`, `predict_group`, `sa_african_score`, `is_sa_african` y `windowed_sa_african_score`.

## Capacidades

- Identificacion de idioma a nivel fino (26 etiquetas) y a nivel de grupo linguistico (nguni, sotho_tswana, venda, tsonga, afrikaans, english, shona, other_bantu, other).
- Deteccion de cambio de codigo entre ingles y lenguas bantu sudafricanas en transcripciones conversacionales.
- Puntuacion agregada `sa_african_score` (probabilidad total de nguni + sotho_tswana + venda + tsonga) con umbral por defecto de 0,755 y umbrales alternativos calibrados.
- Filtrado de corpus a escala web mediante `is_sa_african` y umbrales con tasas de falsos positivos documentadas.
- Puntuacion por ventana deslizante de 5 palabras para localizar pasajes cortos en documentos largos en ingles.
- Inferencia por lotes y uso desde linea de comandos (`python sa_lid.py "Ndi a livhuwa" "Thank you"`).
- No soporta tool calling, agentes, generacion de texto, vision ni audio: es exclusivamente un clasificador.

## Casos de uso

- Filtrado de web crawl a escala: aplicar `sa_african_score` sobre lineas de HPLT o FineWeb-2 para aislar contenido en lenguas bantu sudafricanas antes de construir corpus de entrenamiento, usando el umbral 0,755 (1,0 % de falsos positivos en paginas inglesas de dominios `.za`) o 0,894 (0,5 %) segun el presupuesto de ruido.
- Deteccion de code-switching en transcripciones: en subtitulos o guiones de television, el modelo alcanza un recall de 0,856 sobre enunciados con cambio de codigo ingles + lengua SA al umbral por defecto, lo que permite etiquetar conversaciones multilingues reales.
- Curacion de corpus para entrenamiento de LLM: clasificar a nivel de grupo para evitar falsos negativos entre idiomas nguni mutuamente confundibles, ya que la precision de grupo en fragmentos de 3 a 6 palabras es de 0,978 frente a 0,906 a nivel fino.
- Enrutamiento linguistico en pipelines de NLP: dirigir documentos a modelos especificos por idioma o a anotadores humanos segun el grupo detectado, aprovechando la precision de grupo de 0,999 en FLORES-200/SIB-200.
- Analisis de contenido editorial y gubernamental: procesar publicaciones como Vuk'uzenzele en 11 idiomas y separar lineas por lengua para estadisticas de cobertura o traduccion.
- Investigacion sociolinguistica: cuantificar la presencia de lenguas locales frente al ingles en dominios `.za` o en medios audiovisuales, con umbrales ajustables al coste de falsos positivos.
- Moderacion y analisis de contenido en plataformas: identificar el idioma de mensajes cortos de usuarios para aplicar politicas o modelos de toxicidad especificos por lengua.

## Benchmarks y rendimiento

Datos de evaluacion publicados en la model card (todos los conjuntos de test disjuntos del entrenamiento):

| Conjunto de test | n | ft-SA-LID fino | ft-SA-LID grupo | GlotLID v3 fino | GlotLID v3 grupo |
|---|---|---|---|---|---|
| Vuk'uzenzele (periodico gubernamental, 11 idiomas) | 3.770 | 0,993 | 0,999 | 0,985 | 0,997 |
| Vuk'uzenzele, fragmentos de 3-6 palabras | 3.770 | 0,906 | 0,978 | 0,850 | 0,949 |
| FLORES-200 / SIB-200 (incl. vecinos, other) | 22.088 | 0,997 | 0,999 | 0,993 | 0,996 |
| Libros de texto escolares (DBE, documentos reservados), segmentos de 6-40 palabras | 16.500 | 0,981 | 0,998 | 0,929 | 0,987 |
| Libros de texto escolares, fragmentos de 3-6 palabras | 16.500 | 0,939 | 0,988 | 0,831 | 0,938 |
| Lineas web de dominios reservados (HPLT 3 + FineWeb-2, 11 idiomas incl. nde) | 11.819 | 0,944 | 0,979 | 0,879 | 0,933 |

Calibracion del umbral `sa_african_score`:

| Umbral | Falsos positivos en paginas inglesas `.za` | Falsos positivos en web inglesa global | Falsos positivos en enunciados ingleses de telenovela | Recall code-switching (eng + SA) | Recall lineas web SA (dominios reservados) | Recall fragmentos Vuk'uzenzele de 3-6 palabras |
|---|---|---|---|---|---|---|
| 0,894 | 0,5 % | 0,04 % | 3,0 % | 0,783 | 0,963 | 0,968 |
| 0,755 (por defecto) | 1,0 % | 0,3 % | 4,3 % | 0,856 | 0,971 | 0,985 |
| 0,567 | 2,0 % | 0,8 % | 6,9 % | 0,902 | 0,979 | 0,992 |
| 0,5 | 2,8 % | 1,2 % | 7,8 % | 0,915 | 0,982 | 0,993 |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo ocupa 1,07 GB en disco en formato fastText; la carga en memoria es del orden de ese tamano, por lo que cabe en CPU y en cualquier GPU consumer con holgura.
- GPU recomendadas: no requiere GPU; fastText es eficiente en CPU. Cualquier GPU (RTX 3060 o superior, A100, H100) puede acelerar el procesamiento por lotes, pero no es necesario.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU (contenedores, funciones serverless, portatiles).
- Opciones de despliegue: libreria `fasttext` (o `fasttext-numpy2-wheel` con numpy 2), script `sa_lid.py` incluido en el repositorio, descarga via `huggingface_hub`. No esta pensado para vLLM, TGI ni Ollama, que sirven modelos generativos.
- Latencia y throughput: no se publican cifras concretas en la model card; fastText es conocido por su bajo coste computacional, pero no se aportan mediciones en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto | Rendimiento (grupo, fragmentos 3-6 palabras) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ft-SA-LID | fastText | 26 etiquetas (bantu SA + vecinos + en, af, nl) | no aplica (clasificacion por linea) | 0,978 (Vuk'uzenzele), 0,988 (libros de texto) | CC BY-SA 3.0 | Hugging Face |
| GlotLID v3 | Clasificador neuronal | Cientos de idiomas | no disponible | 0,949 (Vuk'uzenzele), 0,938 (libros de texto) | no disponible en la informacion | Referenciado en la model card |
| fastText LID estandar (lid.176) | fastText | 176 idiomas | no aplica | no evaluado en la model card | no disponible en la informacion | Ampliamente distribuido |

La comparativa se limita a GlotLID v3, unico modelo con resultados comparables publicados en la model card. ft-SA-LID supera a GlotLID v3 en todos los conjuntos evaluados, con mayor ventaja en fragmentos cortos y en libros de texto escolares.

## Limitaciones y advertencias

- Confusion entre idiomas nguni: isiZulu, isiXhosa, isiNdebele y siSwati son a menudo indistinguibles en lineas cortas; se recomienda usar la decision a nivel de grupo.
- Falsos positivos por nombres propios y prestamos sudafricanos en ingles ("eish", "lekker", toponimos), principal fuente de error en paginas inglesas de dominios `.za`.
- Los umbrales de `sa_african_score` estan calibrados para puntuacion de texto completo; no se aplican a `windowed_sa_african_score`, que en las pruebas del autor no mejoro la puntuacion de texto completo a igual tasa de falsos positivos.
- Para transcripciones conversacionales conviene recalibrar sobre una muestra propia de enunciados solo en ingles.
- Requiere aplicar la normalizacion exacta antes de la inferencia; llamar a fastText directamente sin ella altera las predicciones.
- Licencia CC BY-SA 3.0: permite uso comercial con atribucion y compartir bajo la misma licencia las obras derivadas; conviene revisar las implicaciones de la clausula share-alike en productos propietarios.
- No es un modelo generativo: no produce texto, no soporta razonamiento, codigo ni tool calling.
- No se detallan sesgos especificos del dataset de entrenamiento ni el numero de tokens utilizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/janmbuys/ft-SA-LID
- GlotLID (modelo comparado, referenciado en la model card): no disponible enlace directo en la informacion proporcionada
- FLORES-200 y SIB-200 (conjuntos de evaluacion citados): no disponible enlace directo en la informacion proporcionada
- HPLT 3 y FineWeb-2 (fuentes de datos web citadas): no disponible enlace directo en la informacion proporcionada
