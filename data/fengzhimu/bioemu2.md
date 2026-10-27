# fengzhimu/bioemu2

## Resumen

BioEmu-2 es un modelo de investigacion desarrollado por Microsoft Research que genera ensamblados (ensembles) de estructuras tridimensionales plausibles de biomoleculas a nivel atomistico a partir de su composicion quimica. A diferencia de los predictores de plegamiento clasicos, que devuelven una unica estructura, BioEmu-2 muestrea multiples conformaciones mediante difusion inversa, lo que permite estudiar movilidad, cambios conformacionales e interacciones de forma computacional.

La arquitectura es un modelo de score atomistico completo basado en difusion, con aproximadamente 500 millones de parametros. Acepta como entrada una o varias secuencias biomoleculares, opcionalmente acompanadas de un alineamiento multiple de secuencias (MSA), condicionamiento por contactos entre atomos y condicionamiento por metodo. La salida son coordenadas cartesianas de todos los atomos del sistema. El modelo declara soporte para complejos multcadena, ligandos y acidos nucleicos.

Su relevancia actual radica en que se posiciona como emulador de dinamica molecular: en lugar de ejecutar simulaciones costosas, aproxima la distribucion de conformaciones con un unico checkpoint y un coste de muestreo mucho menor. La licencia es MIT y el codigo de inferencia es abierto, lo que facilita su evaluacion por parte de grupos de biologia estructural y quimica computacional. Conviene senalar que la ficha de HuggingFace analizada corresponde a una copia alojada en `fengzhimu/bioemu2` (0 descargas, 0 likes), mientras que la model card remite al repositorio canonico `microsoft/bioemu2`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de score atomistico completo basado en difusion (muestreo por difusion inversa); no es un transformer autoregresivo de lenguaje |
| Parametros totales | Aproximadamente 500 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible como ventana de tokens de texto. La escala relevante es el numero de tokens estructurales del sistema: el autor evalua complejos de mas de 1500 tokens y advierte de dificultades fisicas por encima de 10 000 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica: la entrada son secuencias de biomoleculas, no lenguaje natural. No se declara listado de idiomas |
| Licencia | MIT |
| Formato de pesos | No disponible (el repositorio ocupa 2,0 GB; no se especifica si los pesos son safetensors, GGUF u otro formato) |

## Arquitectura y entrenamiento

BioEmu-2 es un modelo de score para todos los atomos formulado en el marco de modelos generativos por difusion. El muestreo se realiza por difusion inversa sobre coordenadas cartesianas, de modo que cada pasada produce una conformacion distinta y el conjunto de muestras aproxima un ensemble conformacional. La entrada combina la secuencia o secuencias del sistema con senales opcionales: un MSA, informacion de distancias entre atomos concretos (contact conditioning) y condicionamiento por metodo, que permite orientar el tipo de muestreo. No se documenta el uso de RLHF ni de DPO, algo esperable en un modelo de esta naturaleza y no de dialogo.

El entrenamiento se realizo entre agosto y septiembre de 2026, con publicacion en octubre de 2026. La model card cita como fuentes de datos PDB, AlphaFold DB (AFDB) y datos de dinamica molecular generados por Microsoft, lo que introduce el sesgo de sobrerrepresentacion de familias proteicas bien estudiadas que el propio autor reconoce. La evaluacion declarada cubre tres ejes: prediccion de estructura con benchmarks publicos (RMSD, TM-score, lDDT, fisicalidad e interfaz DockQ sobre el conjunto de test de Boltz-1), muestreo multiconformacional sobre un subconjunto curado de estructuras PDB muy similares, y emulacion de dinamica molecular mediante cobertura de estados y divergencias de distribucion de pesos. Todo se evalua con un unico checkpoint.

## Capacidades

- Prediccion de estructura 3D a nivel atomistico a partir de la composicion quimica de la biomolecula.
- Generacion de ensembles conformacionales: multiples conformaciones plausibles en lugar de una sola estructura.
- Soporte de complejos multcadena, ligandos unidos y acidos nucleicos.
- Condicionamiento opcional mediante MSA para mejorar la calidad del muestreo.
- Condicionamiento por distancias entre atomos especificos, lo que permite imponer restricciones experimentales o hipotesis estructurales.
- Condicionamiento por metodo, que ajusta el regimen de muestreo.
- Emulacion de dinamica molecular: aproximacion de la distribucion de estados accesibles sin ejecutar simulaciones explicitas.
- Interfaz de inferencia en Python y linea de comandos (CLI) en el repositorio de codigo.
- No incluye generacion de secuencias, prediccion de afinidad de union ni prediccion cuantitativa de energia libre: son usos explicitamente fuera de alcance.

## Casos de uso

- Estudio de cambios conformacionales en proteinas: el modelo permite muestrear estados alternativos de una misma secuencia y comparar la poblacion relativa de conformaciones, util para hipotesis sobre mecanismos de accion enzimatica o apertura de sitios activos.
- Analisis de interfaz en complejos proteina-proteina: con soporte de multcadena y puntuaciones DockQ como referencia de evaluacion, sirve para generar hipotesis de empaquetamiento e identificar residuos de interfaz candidatos antes de validacion experimental.
- Modelado de proteinas con ligando unido: al aceptar ligandos suministrados por el usuario, permite explorar como cambia el entorno atomistico del sitio de union segun la conformacion, sin pretender predecir afinidad.
- Modelado de acidos nucleicos y complejos mixtos: util en grupos que estudian ribonucleoproteinas o complejos proteina-ADN/ARN, donde los predictores de plegamiento de proteinas solas no cubren el sistema completo.
- Integracion de restricciones experimentales: el condicionamiento por distancias entre atomos permite incorporar datos de cross-linking, FRET o mutagenesis para refinar el muestreo hacia conformaciones compatibles con las observaciones.
- Emulacion de dinamica molecular en cribados computacionales: en lugar de lanzar simulaciones MD para cada candidato, el modelo genera ensembles rapidos que permiten priorizar sistemas antes de una campana de MD o de experimentos.
- Generacion de hipotesis para criomicroscopia electronica: los ensembles pueden usarse como punto de partida para clasificacion de particulas o para interpretar mapas de baja resolucion, siempre con validacion posterior.
- Docencia y formacion en biologia estructural: la CLI y la API de Python permiten montar practicas donde el alumnado compara conformaciones generadas con estructuras depositadas en el PDB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card describe la metodologia de evaluacion, pero no incluye cifras concretas de RMSD, TM-score, lDDT, DockQ ni de divergencia de distribuciones.

| Eje de evaluacion | Conjunto de evaluacion | Metricas declaradas | Resultados numericos |
|---|---|---|---|
| Prediccion de estructura | Conjunto de test de Boltz-1 | RMSD, TM-score, lDDT, fisicalidad, DockQ de interfaz | No disponibles en la informacion proporcionada |
| Muestreo multiconformacional | Subconjunto curado propio de estructuras PDB muy similares (con y sin pareja de cofolding, ligandos y otras cadenas polimericas) | Exito al distinguir y generar los estados designados para cada definicion de sistema | No disponibles en la informacion proporcionada |
| Emulacion de dinamica molecular | Conjunto de retencion (holdout) de los datasets de MD usados en entrenamiento | Cobertura de estados y divergencias de distribucion de pesos | No disponibles en la informacion proporcionada |
| Escalado a complejos grandes | Subconjunto de complejos de mas de 1500 tokens | Comparativa frente a otros metodos | No disponibles en la informacion proporcionada |

## Requisitos de hardware

- La model card indica que el modelo se ha probado en GPUs NVIDIA y que una A100 de 80 GB es el dispositivo mas pequeno validado. Ese es el requisito documentado, no una estimacion.
- Estimacion orientativa a partir del numero de parametros: los pesos de un modelo de ~500 M ocupan en torno a 1 GB en bf16 y 2 GB en fp32. El cuello de botella real no son los pesos, sino las activaciones y el coste del muestreo por difusion sobre sistemas con miles de tokens estructurales, lo que explica que el autor haya validado sobre A100 de 80 GB.
- No hay datos publicados sobre comportamiento en GPUs de consumo (RTX 4090, RTX 3090, etc.). Para complejos pequenos podria ser viable en GPUs de 24 GB, pero es una extrapolacion sin validar; para complejos grandes no hay evidencia.
- Opciones de despliegue: la model card solo garantiza el codigo de inferencia del repositorio de Microsoft con API de Python y CLI. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI, algo coherente con un modelo de difusion estructural y no de lenguaje.
- Latencia y throughput: no disponibles. Dependen del numero de muestras del ensemble, del numero de pasos de difusion y del tamano del sistema.

## Comparativa con modelos similares

| Modelo | Desarrollador | Parametros | Enfoque de salida | Contexto / escala | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| BioEmu-2 | Microsoft Research | ~500 M | Ensemble conformacional por difusion, todos los atomos | Complejos de mas de 1500 tokens; dificultades por encima de 10 000 | MIT | Pesos y codigo abiertos (repos canonicos de Microsoft) |
| BioEmu (version 1) | Microsoft Research | No disponible en la informacion proporcionada | Ensemble de equilibrio de proteinas | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Referenciado en la model card como predecesor |
| AlphaFold 3 | Google DeepMind | No disponible en la informacion proporcionada | Estructura unica de complejos con ligandos y acidos nucleicos | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada (acceso restringido a pesos) | Pesos no abiertos; servidor |
| Boltz-1 | MIT / colaboradores academicos | No disponible en la informacion proporcionada | Cofolding, estructura unica | Su conjunto de test se usa como referencia de evaluacion en BioEmu-2 | No disponible en la informacion proporcionada | Codigo y pesos abiertos segun la informacion publica del proyecto |

Nota: los datos de los modelos alternativos no proceden de la informacion proporcionada en esta busqueda y no se han podido verificar aqui; se incluyen solo como marco cualitativo. La diferencia funcional clave es que BioEmu-2 devuelve un ensemble y no una estructura unica, y que no predice afinidad de union.

## Limitaciones y advertencias

- Las salidas son hipotesis computacionales, no mediciones experimentales; el autor lo indica de forma explicita. No deben presentarse como estructuras validadas.
- Dependencia del MSA: se espera un deterioro de calidad con MSA poco profundos o de baja calidad, incluyendo proteinas huerfanas, construcciones de ingenieria y algunas proteinas virales.
- Sesgo de distribucion de entrenamiento: PDB, AFDB y los datos de MD generados por Microsoft sobrerrepresentan familias proteicas bien estudiadas; el rendimiento en clases de secuencia poco representadas es incierto.
- Ensembles no calibrados: la frecuencia de muestreo no debe interpretarse como probabilidad de Boltzmann calibrada ni como energia libre cuantitativa.
- Alcance de ligandos: se admiten ligandos unidos suministrados por el usuario, pero el diseno de novo de ligandos y la prediccion de afinidad de union quedan fuera de alcance.
- Fisicalidad en sistemas grandes: el modelo puede no producir estructuras fisicamente plausibles en complejos extremadamente grandes (por encima de 10 000 tokens).
- Limitaciones no cuantificadas: el autor reconoce que las limitaciones anteriores no han sido caracterizadas cuantitativamente, lo que complica fijar umbrales de confianza en produccion.
- Licencia MIT en los pesos, pero el autor desaconseja explicitamente el uso comercial o en aplicaciones reales sin pruebas y desarrollo adicionales; ademas, el uso debe respetar la Microsoft Acceptable Use Policy y la normativa de control de exportaciones aplicable.
- Usos prohibidos por el autor: decisiones clinicas o de dosificacion, diseno de toxinas, patogenos o construcciones de ganancia de funcion, prediccion cuantitativa de energia libre, diseno de novo de moleculas pequenas, toma de decisiones autonomas de alto riesgo (justicia, legal, finanzas, sanidad) y cualquier uso que vulnere la ley aplicable.
- Riesgo de composicion: combinar el modelo con herramientas de generacion de secuencias o de diseno autonomo puede generar riesgos no evaluados para el modelo por si solo.
- Advertencia sobre el repositorio: la copia en `fengzhimu/bioemu2` no es el repositorio oficial y no presenta descargas ni likes; para uso real conviene acudir a `microsoft/bioemu2` y verificar la integridad de los pesos.

## Enlaces

- Ficha de HuggingFace analizada (copia no oficial): https://huggingface.co/fengzhimu/bioemu2
- Checkpoints oficiales citados en la model card: https://huggingface.co/microsoft/bioemu2
- Codigo fuente oficial: https://github.com/microsoft/bioemu2
- Nota sobre la busqueda web: los resultados devueltos corresponden unicamente a paginas de Spotify (open.spotify.com, accounts.spotify.com, www.spotify.com) y no guardan ninguna relacion con BioEmu-2. No se han podido recuperar papers, blogs ni demos adicionales a partir de esa busqueda.
