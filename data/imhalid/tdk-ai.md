# imhalid/tdk-ai

## Resumen

tdk-ai (tdkai) es un corrector ortografico automatico para turco disenado para ejecutarse integramente en el dispositivo del usuario, sin servidor ni conexion de red. Lo desarrolla el usuario de Hugging Face imhalid y combina un motor estadistico de tipo *noisy channel* sobre un lexico de aproximadamente un millon de formas, validado mediante morfologia turca derivada de Zemberek-NLP, con un pequeno modelo Transformer de subpalabras opcional de 2,8 millones de parametros que reordena candidatos usando el contexto de la frase.

El modelo resuelve un problema muy concreto: la correccion de errores tipicos del turco escrito en teclados ASCII o moviles, incluyendo la sustitucion de caracteres turcos (ı, ş, ğ, ç, ö, ü), las particulas separadas *de/da*, *ki* y *mi*, la escritura junta o separada de palabras y el uso del apostrofo en nombres propios. No es un modelo generativo de proposito general: es un sistema de correccion con deteccion de errores y sugerencias ordenadas, pensado para integrarse en editores, navegadores o aplicaciones de mensajeria.

Su relevancia actual radica en el despliegue *offline* y el tamano reducido: los ficheros nucleares ocupan 3,46 MB comprimidos en gzip y el modelo contextual ONNX anade 2,51 MB, lo que permite ejecutarlo en navegador o en Node con ONNX Runtime sin coste de inferencia en servidor. La licencia CC BY-SA 4.0 y la atribucion a Wikipedia turca, OpenSubtitles y Zemberek-NLP condicionan su reutilizacion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: motor estadistico *noisy channel* sobre lexico + morfologia turca, con modelo contextual opcional Transformer de subpalabras |
| Parametros totales | 2,8 millones (solo el modelo contextual `context.onnx`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo contextual procesa la frase o parrafo actual; no se especifica ventana numerica) |
| Tipos de cuantizacion | int8 (el modelo contextual se distribuye cuantizado en int8) |
| Idiomas soportados | turco (tr) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (`context.onnx`); ficheros binarios propietarios `lexicon.bin` (formato ALX1) y `morph.bin` (formato AMR2); `known.tsv` en TSV |

## Arquitectura y entrenamiento

El sistema se articula en tres capas. La primera es un motor de correccion basado en conteo (*noisy channel*) sobre un lexico de aproximadamente un millon de formas, con frecuencias de palabras y pares de palabras extraidas de Wikipedia turca y de subtitulos de OpenSubtitles (corpus OPUS). La segunda capa es morfologica: usa raices y reglas de sufijos derivadas de Zemberek-NLP para validar si una forma es plausible en turco, lo que permite generar candidatos para caracteres turcos escritos en ASCII, errores tipograficos de hasta dos ediciones (letra omitida, sobrante, intercambiada o tecla vecina), particulas *de/da*, *ki*, *mi*, palabras juntas o separadas y apostrofos. Solo se aplica un cambio cuando el margen sobre la forma original es claro.

La tercera capa, opcional, es `context.onnx`: un Transformer de subpalabras de 2,8 millones de parametros, cuantizado a int8, que reordena los candidatos en competencia usando la frase completa. En la demo relee el parrafo en curso mientras se escribe, de modo que una palabra puede corregirse cuando llega el resto de la frase. No se documenta el volumen de tokens de entrenamiento ni si hubo RLHF o DPO; el autor indica que no se distribuye texto de entrenamiento con el modelo. Los formatos binarios ALX1 y AMR2 son propietarios del motor TypeScript y no constituyen un formato de proposito general.

## Capacidades

- Correccion ortografica automatica de palabras en turco cuando el motor tiene certeza, y marcado con hasta cinco sugerencias ordenadas cuando no la tiene.
- Normalizacion de caracteres turcos escritos en ASCII (ı, ş, ğ, ç, ö, ü) y correccion de errores tipograficos de hasta dos ediciones.
- Resolucion de particulas separadas (*de/da*, *ki*, *mi*), escritura junta o separada de palabras y uso del apostrofo.
- Deteccion de errores con sugerencias: una palabra que la morfologia rechaza y el lexico desconoce se subraya con candidatos clasificados.
- Lista manual de errores frecuentes verificados (`known.tsv`, 31 KB) con pares como "herkez" → "herkes".
- Exclusion de nombres propios, palabras extranjeras, abreviaturas, numeros, URLs y codigo, que se dejan intactos.
- Reordenacion contextual de candidatos mediante el modelo Transformer opcional, usando el significado de la frase (por ejemplo, desambiguar *oldu/öldü*, *de/da*, *yıllar/yollar*).
- Ejecucion offline en navegador, Node o cualquier runtime compatible con ONNX; no requiere tool calling, agentes ni capacidades multimodales.

## Casos de uso

- Correccion en tiempo real en editores de texto y areas de escritura web: el motor TypeScript con `context.onnx` puede releer el parrafo mientras el usuario teclea y corregir palabras cuando llega el resto de la frase, sin enviar texto a ningun servidor.
- Aplicaciones de mensajeria y chat en turco: el conjunto de evaluacion de estilo chat muestra un 83,6% de correccion automatica con contexto en errores de letras omitidas y un 99,4% de errores detectados (corregidos o marcados), adecuado para entradas informales.
- Procesamiento por lotes de textos turcos en pipelines de datos: el motor puede limpiar articulos de Wikipedia o corpus de subtitulos antes de indexarlos, con una tasa de falsas alarmas de aproximadamente 2 palabras modificadas por cada 1000 en texto correcto.
- Extensiones de navegador y correctores de formularios: al ocupar 3,46 MB comprimidos los ficheros nucleares y 2,51 MB el modelo contextual, el paquete completo cabe en una extension y funciona sin backend.
- Herramientas educativas de ensenanza del turco: el marcado con sugerencias y la validacion morfologica permiten explicar por que una forma es incorrecta (particula separada, apostrofo, sufijo), no solo sustituirla.
- Preprocesamiento para sistemas de PLN en turco: normalizar la ortografia antes de alimentar un buscador, un clasificador o un modelo de lenguaje reduce el vocabulario fuera de lexico y mejora la cobertura del analisis morfologico.
- Edicion asistida en dispositivos con recursos limitados: al ejecutarse en ONNX Runtime en el dispositivo, es viable en portatiles y navegadores sin GPU dedicada, sin coste de inferencia en la nube.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre conjuntos de retencion no usados en el ajuste. *Fixed* indica correccion automatica; *found* indica corregido o marcado con sugerencias.

| Conjunto | Fixed (nucleo) | Fixed (con contexto) | Found (corregido + marcado) |
|---|---|---|---|
| Frases de Wikipedia con errores (test2, 400) | 84,0% | 89,3% | 98,3% |
| Frases de Wikipedia con errores (test, 400) | 84,0% | 87,3% | 96,3% |
| Frases estilo chat, letras omitidas (811 palabras) | 69,7% | 83,6% | 99,4% |
| Frases estilo chat, errores mixtos (602 palabras) | 68,8% | 75,2% | 99,5% |

Falsas alarmas sobre texto correcto: aproximadamente 2 palabras modificadas por cada 1000 en frases de Wikipedia (principalmente nombres raros y terminos tecnicos) y 0,1 por cada 1000 en frases de chat limpias.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido habitual; el modelo contextual `context.onnx` ocupa 3,02 MB en disco (2,51 MB en gzip) y se ejecuta en CPU con cuantizacion int8.
- GPU recomendadas: no se requieren; el diseno esta orientado a ejecucion en CPU, navegador y dispositivos de usuario final.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU; el motor TypeScript y ONNX Runtime son las dependencias de ejecucion.
- Opciones de despliegue: ONNX Runtime (navegador o Node) junto con el motor tdkai en TypeScript; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tdk-ai (tdkai) | Corrector ortografico turco con modelo contextual ONNX | 2,8 M (contexto) + lexico de ~1 M formas | no disponible | CC BY-SA 4.0 | Hugging Face, demo web |
| Zemberek-NLP | Analizador morfologico y corrector para turco | no disponible | no disponible | Apache 2.0 | Repositorio GitHub |
| Correctores genericos basados en LLM (p. ej. modelos multilingues de gran tamano) | Generacion de texto con correccion por prompt | miles de millones | decenas de miles de tokens | variable | APIs y pesos abiertos |
| Hunspell con diccionario turco | Corrector basado en diccionario y reglas | no aplica | no aplica | variable (GPL/LGPL/MPL segun implementacion) | Estandar en ofimatica |

La comparacion cuantitativa con alternativas no esta disponible en la informacion proporcionada; el autor solo publica resultados frente a sus propios conjuntos de retencion.

## Limitaciones y advertencias

- Los errores en los que la palabra escrita es valida pero esta en el lugar equivocado (apostrofo omitido, *de/da*) no se marcan; solo se corrigen cuando el motor tiene certeza.
- Las grafias coloquiales ("buluşcaz") se marcan, pero las sugerencias pueden ser debiles.
- Las palabras tecnicas raras y los extranjerismos pueden marcarse como erroneos (aproximadamente 2 falsas alarmas por cada 1000 palabras en Wikipedia).
- La licencia CC BY-SA 4.0 impone compartir bajo la misma licencia las obras derivadas y exige atribucion; conviene revisar las implicaciones para uso comercial y para productos que incorporen los ficheros del modelo.
- La atribucion incluye Wikipedia turca (CC BY-SA 4.0), subtitulos de OpenSubtitles via OPUS y Zemberek-NLP (Apache 2.0).
- Los formatos `lexicon.bin` (ALX1) y `morph.bin` (AMR2) son propietarios del motor tdkai y no son reutilizables fuera de el; `context.onnx` espera el tokenizador de subpalabras y las caracteristicas de candidatos del motor.
- El modelo solo cubre turco; no hay soporte multilingue ni de otras tareas de PLN.
- No se documentan sesgos especificos mas alla de la sobrerrepresentacion de vocabulario de Wikipedia y subtitulos, que puede infrarepresentar registros tecnicos o formales especializados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/imhalid/tdk-ai
- Demo en vivo: https://tdkai.halid.dev
- Zemberek-NLP (origen de la morfologia): https://github.com/ahmetaa/zemberek-nlp
- OpenSubtitles: http://www.opensubtitles.org/
- Referencia del corpus OPUS/OpenSubtitles2016: P. Lison y J. Tiedemann, 2016, *OpenSubtitles2016: Extracting Large Parallel Corpora from Movie and TV Subtitles*, LREC 2016
