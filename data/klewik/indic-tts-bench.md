# Klewik/indic-tts-bench

## Resumen

indic-tts-bench no es un modelo de lenguaje ni un sistema de texto a voz entrenado: es un repositorio de investigacion, publicado por el usuario Klewik en HuggingFace, que contiene la infraestructura experimental de una tesis de M.Tech (NSUT, Nueva Delhi) sobre conversion grafema-fonema (G2P) en hindi y su impacto en sintesis neuronal de voz. La pregunta central que plantea es si la conversion explicita a devanagari con eliminacion de schwa sigue siendo necesaria en arquitecturas neuronales modernas de TTS, o si estas absorben la eliminacion de schwa medial directamente de los datos, y si la respuesta depende de la arquitectura y del volumen de datos disponible.

El diseno experimental usa el hindi como caso de prueba y el marati como control: mismo sistema de escritura, mismo conversor, mismo inventario de fonemas, pero sin eliminacion de schwa medial. Sobre esa base se construye una escalera de datos que va de 10 horas a 10 minutos, variando el nivel de recursos mientras se mantienen fijos el hablante, el dominio y la cadena de grabacion. El repositorio ocupa 62,1 GB repartidos entre corpus, alineaciones forzadas, configuraciones y resultados por enunciado.

Su relevancia actual es metodologica mas que de producto: documenta un protocolo reproducible para comparar arquitecturas de TTS bajo distintas condiciones de recursos, con reglas estrictas de reproducibilidad (cada ejecucion lleva su archivo de configuracion y su hash de commit, cada metrica se escribe por enunciado y nunca preagregada). No hay pesos publicados, ni model card de inferencia, ni licencia declarada, y el propio autor indica que todavia no se ha entrenado nada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no hay modelo entrenado publicado; el repositorio contiene envoltorios de entrenamiento de una arquitectura por cada variante, con esquema de configuracion compartido) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no declarado como soporte del modelo; los corpus tratados son hindi (caso de prueba) y marati (control) |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se publican pesos; el repo contiene datos, configuraciones YAML y codigo Python) |

Datos adicionales del repositorio: ID `Klewik/indic-tts-bench`, tamano 62,1 GB, 0 descargas, 0 likes, etiqueta `region:us`, creado el 2 de octubre de 2026 y actualizado el 3 de octubre de 2026.

## Arquitectura y entrenamiento

El repositorio no describe una arquitectura de red concreta con numeros de capas, dimensiones o cabezas de atencion. Lo que define es una estructura de experimentacion en `src/train/`, con un envoltorio ligero por arquitectura y un esquema de configuracion comun, de modo que la comparacion entre familias de TTS se haga bajo el mismo contrato de datos y las mismas condiciones de recursos. El estado declarado es fases 0 a 2 completadas: ambos corpus estandarizados, las particiones congeladas y verificadas con sumas de comprobacion, y la escalera de datos construida. Los envoltorios de entrenamiento estan pendientes de construccion.

La innovacion tecnica del trabajo no reside en un modulo nuevo, sino en el diseno experimental: el uso del marati como control negativo permite aislar el efecto de la eliminacion de schwa medial del efecto generico de la cantidad de datos o del inventario fonetico. La escalera de datos de 10 horas a 10 minutos cubre regimenes de recursos altos, medios y bajos, con hablante, dominio y cadena de grabacion fijos. El front end de G2P se evalua de forma independiente: obtiene un 83,0% (39/47) de coincidencia con el juicio de hablantes nativos, y el analisis de errores esta documentado en `RESULTS.md` bajo la entrada del 1 de octubre. No consta en la informacion proporcionada que se haya aplicado RLHF, DPO ni ninguna otra etapa de alineacion, ni se especifica el numero de tokens o de horas de audio totales de cada corpus.

## Capacidades

- No es un modelo de inferencia: no genera texto, no razona, no escribe codigo y no procesa imagenes.
- Conversion grafema-fonema (G2P) para devanagari, con tratamiento explicito de la eliminacion de schwa, implementada en `src/g2p/` y evaluada contra juicio de hablantes nativos.
- Preparacion de corpus de voz: descarga, limpieza, particionado congelado y alineacion forzada (`src/data/`).
- Envoltorios de entrenamiento de TTS con configuracion YAML por ejecucion (`src/train/`, pendientes de construir).
- Evaluacion de sintesis de voz con cinco metricas previstas: MCD, F0, ASR-WER, MOS predicho y RTF (`src/eval/`).
- Analisis estadistico y generacion de tablas y graficos (`src/analysis/`).
- Control de trabajos sin interfaz grafica en Kaggle (`src/kaggle/`).
- Lista de palabras con schwa en disputa y pronunciaciones de referencia (`stresstests/`).
- No consta soporte de tool calling, function calling, agentes ni razonamiento multi-paso, por no tratarse de un modelo de lenguaje.

## Casos de uso

- Reproduccion de experimentos de TTS en regimenes de bajos recursos: un grupo de investigacion puede partir de la escalera de datos ya construida (10 horas a 10 minutos) para medir como degrada cada arquitectura al reducir datos, sin tener que reconstruir el particionado ni la alineacion forzada.
- Auditoria de front ends de G2P para hindi: el conjunto de 47 casos evaluados por hablantes nativos y la lista de palabras con schwa en disputa sirven como banco de pruebas para comparar un conversor propio contra la referencia publicada del 83,0%.
- Diseno de experimentos controlados en linguistica computacional: el par hindi/marati con mismo inventario de fonemas es directamente reutilizable como plantilla metodologica para aislar un unico fenomeno fonologico.
- Formacion de personal investigador: el repositorio incluye pruebas ejecutables con pytest y un arbol de directorios que separa datos, entrenamiento, evaluacion y analisis, lo que lo hace util como esqueleto de proyecto para un doctorando.
- Estandarizacion de metricas de TTS en produccion: la regla de escribir cada metrica por enunciado y nunca preagregada permite recalcular agregados bajo distintos criterios (media, mediana, recorte de colas) cuando cambian los requisitos del informe.
- Trazabilidad de resultados para publicacion: el par configuracion YAML mas hash de commit por ejecucion permite auditar que cada numero del articulo final se puede regenerar, algo exigido por revisiones por pares en conferencias de voz.
- Comparacion de cadenas de grabacion y corpus: la parte de `src/data/` (descarga, limpieza, particiones, alineacion) es reutilizable como plantilla para construir corpus paralelos en otras lenguas indoarias.

## Benchmarks y rendimiento

El unico resultado numerico publicado en la informacion disponible corresponde al front end de G2P, no a un modelo de sintesis:

| Componente | Metrica | Resultado | Referencia |
|---|---|---|---|
| Front end G2P (devanagari) | Coincidencia con juicio de hablante nativo | 83,0% (39/47) | Evaluacion interna, `RESULTS.md`, 1 de octubre |

No se han publicado resultados de benchmarks de sintesis (MCD, F0, ASR-WER, MOS predicho, RTF) ni comparaciones con otros sistemas de TTS en la informacion disponible, coherentemente con el estado declarado del proyecto: nada se ha entrenado todavia.

## Requisitos de hardware

- VRAM para inferencia: no disponible, porque no hay modelo entrenado ni pesos publicados.
- GPU recomendadas: no disponibles. La unica indicacion de entorno es el uso de Kaggle para el control de trabajos (`src/kaggle/`), plataforma que ofrece aceleradores de gama de consumo y de gama media (por ejemplo, T4 o P100), aunque la informacion proporcionada no confirma que acelerador concreto se emplea.
- Encaje en GPU de consumo: no aplica en el estado actual, al no existir modelo desplegable.
- Opciones de despliegue: no disponibles. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que por otra parte no aplican a un repositorio de datos y codigo de investigacion.
- Latencia y throughput: no disponibles. La metrica RTF esta prevista en `src/eval/`, pero no se ha reportado ningun valor.
- Almacenamiento: el repositorio ocupa 62,1 GB, cifra a tener en cuenta para clonarlo o replicarlo en local.

## Comparativa con modelos similares

No disponible. indic-tts-bench no es un modelo, sino un repositorio de investigacion sobre G2P y TTS en lenguas indoarias, por lo que no existe una comparacion directa por parametros, contexto o licencia con modelos de lenguaje. La informacion proporcionada no incluye repositorios comparables de la misma categoria.

## Limitaciones y advertencias

- No hay modelo entrenado: el autor indica explicitamente que nada se ha entrenado y que los envoltorios de `src/train/` son el siguiente paso. Cualquier expectativa de uso como sistema de TTS es prematura.
- No hay pesos publicados, ni formato de pesos, ni proceso de cuantizacion.
- La licencia no esta declarada. Sin licencia explicita, no se puede asumir permiso de uso comercial ni de redistribucion de los corpus incluidos.
- El alcance linguistico esta limitado a hindi, con marati como control; no se declara soporte de otras lenguas.
- El unico resultado publicado (83,0% en G2P) procede de una muestra pequena, 47 casos, evaluada contra juicio de hablantes nativos, sin intervalo de confianza ni detalle de los anotadores en la informacion disponible.
- Riesgo de sobrerrepresentacion: al tratarse de trabajo de tesis en curso, las conclusiones sobre la utilidad de la conversion explicita a devanagari aun no estan respaldadas por experimentos de sintesis.
- El propio proyecto fija una regla de no reportar diferencias menores que la varianza entre semillas, lo que implica que los resultados futuros pueden quedar por debajo del umbral de significacion estadistica en los tramos bajos de la escalera de datos (10 minutos).
- Restricciones operativas declaradas: los entornos de ejecucion usados tienen lista blanca de salida que deniega HuggingFace y Kaggle, por lo que ciertos pasos deben lanzarse desde un terminal nativo mediante `scripts/`; esto complica la automatizacion completa.
- Gestion de credenciales: el repositorio exige que `~/.kaggle/kaggle.json` (modo 600) y `~/.cache/huggingface/token` queden fuera del arbol compartido. Incumplir esta regla expone claves de acceso.
- El contenido de la busqueda web realizada no ha devuelto resultados pertinentes sobre este repositorio; los enlaces devueltos no guardan relacion con el proyecto y no se incluyen.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Klewik/indic-tts-bench
- No se han encontrado en la busqueda web otros enlaces relevantes (papers, blogs, repositorios de codigo o demos) asociados a este proyecto.
