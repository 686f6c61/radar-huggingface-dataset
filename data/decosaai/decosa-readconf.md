# decosaai/decosa-readconf

## Resumen

decosa-readconf (v2) es un modelo de clasificacion tabular desarrollado por decosaai que estima la probabilidad de que un lector documental automatico (OCR o lector vision-lenguaje) haya leido mal cada celda de tabla o region de texto de una pagina. Para cada unidad de la pagina devuelve `p_wrong`, la probabilidad calibrada por temperatura de que el texto devuelto por el lector sea incorrecto, junto con el tipo de error mas probable: digito, decimal, celda fusionada o dividida, fila omitida, escritura manual u otro.

No es un modelo generativo ni un corrector: no lee la pagina por si mismo ni arregla el texto. Su funcion es priorizar la revision humana, ordenando las unidades para que un revisor empiece por las mas sospechosas. Se apoya en 63 caracteristicas que no requieren ground truth (confianzas por token del lector cuando estan disponibles, geometria del layout, aritmetica de columnas como totales que no cuadran, bandas de tinta en la imagen y calidad de imagen) mas un pequeno codificador a nivel de caracter sobre el texto del lector. No examina los pixeles de cada celda: una variante con codificador visual fue entrenada pero no supero a esta en tablas reales y no se ha publicado.

El modelo es extremadamente ligero: 213.622 parametros, pesos por debajo de 1 MB y ejecucion en CPU, con unos 70 ms por pagina de 50 unidades incluyendo la extraccion de caracteristicas. Su relevancia practica esta en que mejora de forma medible a la linea base habitual (la confianza propia del lector) al detectar errores estructurales que la confianza por token no ve, en especial celdas fusionadas o divididas. Esta entrenado especificamente contra PaddleOCR-VL-1.6, por lo que su alcance declarado se limita a tablas financieras de empresas estadounidenses en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador tabular con 63 caracteristicas sin ground truth mas un pequeno codificador a nivel de caracter sobre el texto del lector; sin codificador visual en la variante publicada. Topologia exacta: no disponible |
| Parametros totales | 213.622 (unos 214 K) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo generativo; procesa unidades de pagina individualmente) |
| Tipos de cuantizacion | No disponible (pesos por debajo de 1 MB, disenado para ejecucion en CPU) |
| Idiomas soportados | Ingles (entrenado con tablas financieras de empresas estadounidenses) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria PyTorch) |

## Arquitectura y entrenamiento

El modelo combina dos vias de entrada. La primera es un conjunto de 63 caracteristicas calculadas sin necesidad de ground truth: confianzas por token del lector cuando estan disponibles, caracteristicas de layout, comprobaciones aritmeticas de columna (por ejemplo, totales que no suman), bandas de tinta detectadas en la imagen y metricas de calidad de imagen. La segunda es un codificador a nivel de caracter que procesa el texto devuelto por el lector. La salida son dos cabezas: una probabilidad `p_wrong` calibrada por temperatura sobre datos de desarrollo y una clasificacion del tipo de error mas probable entre digito, decimal, fusionada o dividida, fila omitida, escritura manual u otro. La variante con codificador visual entrenada en paralelo no mejoro los resultados en tablas reales y no se ha liberado.

Los datos de entrenamiento combinan dos fuentes. De FinTabNet (IBM) se usaron aproximadamente 3.000 imagenes de tabla con su texto celda a celda procedentes de 63 empresas, disjuntas por empresa respecto a las tablas de test, repartidas al 85 % entrenamiento y 15 % desarrollo; la mitad de esas tablas se usaron tal cual y la otra mitad con degradaciones sinteticas de escaneo. La segunda fuente son 3.000 paginas sinteticas generadas por un script propio de Decosa (tablas, resultados de laboratorio, formularios, valores con estilo manuscrito y degradaciones de escaneo, fax, fotocopia y rotacion), con numeros, etiquetas y nombres aleatorios, renderizadas con tipografias como DejaVu, Liberation, Noto, Courier Prime, Source Serif 4, Lato, Inconsolata y varias fuentes manuscritas de Google Fonts. No se menciona uso de RLHF ni DPO, algo esperable en un clasificador de este tipo. Un hallazgo relevante del desarrollo: un primer modelo entrenado solo con paginas sinteticas quedo por debajo de la linea base en tablas reales (AUC 0,78-0,79 frente a 0,868), y solo supero al baseline cuando se anadieron tablas reales de entrenamiento.

## Capacidades

- Estimacion de `p_wrong` por unidad (celda de tabla o region de texto), calibrada por temperatura sobre datos de desarrollo.
- Clasificacion del tipo de error mas probable: digito, decimal, celda fusionada o dividida, fila omitida, escritura manual u otro.
- Deteccion de errores estructurales que la confianza por token del lector no puede ver, principalmente fusiones y divisiones de celda.
- Uso de aritmetica de columnas (totales que no cuadran) como senal de error, sin necesidad de ground truth.
- Integracion de senales de calidad de imagen y bandas de tinta para estimar la fiabilidad de la lectura.
- Ejecucion en CPU con pesos por debajo de 1 MB y aproximadamente 70 ms por pagina de 50 unidades, incluida la extraccion de caracteristicas.
- No realiza correccion de texto, no lee la pagina de forma autonoma y no emite decisiones: solo ordena unidades por riesgo.
- Capacidades multilingues: no disponibles; el modelo esta entrenado y evaluado unicamente en ingles sobre tablas financieras estadounidenses.

## Casos de uso

- Priorizacion de revision humana en estados financieros: el modelo ordena las celdas por `p_wrong` para que el revisor empiece por las mas probables de estar mal leidas; en tablas reales limpias encuentra el 69 % de las unidades erroneas revisando solo el 10 % superior, frente al 56 % que consigue ordenar por confianza del lector.
- Deteccion de celdas fusionadas o divididas en extraccion de tablas: la confianza por token del lector no ve este tipo de error, mientras que este modelo captura 213 de 370 casos en el top 10 % de tablas limpias, frente a 140 del baseline.
- Control de calidad en pipelines de digitalizacion masiva de formularios y tablas de laboratorio: puede ejecutarse en CPU a unos 70 ms por pagina de 50 unidades, lo que permite puntuar lotes grandes sin anadir GPU al pipeline.
- Triaje en procesos de conciliacion contable: la caracteristica aritmetica de columnas (totales que no suman) ayuda a marcar filas sospechosas antes de que un humano cuadre el documento.
- Enrutado selectivo a revision experta: usando `p_wrong` como ranking se puede calibrar un presupuesto de revision fijo y decidir cuantas unidades se envian a un revisor humano y cuales se aceptan automaticamente del lector.
- Analisis de calidad del propio OCR: agregando `p_wrong` por pagina o por lote se obtiene una metrica operativa de la tasa de error esperada del lector sobre un corpus concreto, util para comparar configuraciones de lectura o detectar paginas problematicas donde el lector entra en bucle.
- Senal complementaria en un sistema de extraccion documental existente: se puede combinar con la confianza del propio lector (union de ambos rankings) para no perder los errores de un solo digito que el modelo no detecta mejor que el baseline.

## Benchmarks y rendimiento

Linea base: la confianza del propio lector (1 menos la probabilidad del token mas bajo de la unidad). "catch@10" es la proporcion de unidades erroneas encontradas al revisar el 10 % superior del ranking. Las tablas reales de test proceden del shard de test de FinTabNet (26 empresas, ninguna presente en entrenamiento); cada tabla fue leida con PaddleOCR-VL-1.6 y comparada con el texto de referencia de FinTabNet.

| Conjunto de test | Unidades (erroneas) | Confianza del lector: AUC, catch@10 | Este modelo: AUC, catch@10 |
|---|---|---|---|
| Tablas financieras reales tal como se publican (FinTabNet, 400 tablas) | 17.873 (979) | 0,868; 56 % | 0,906; 69 % (AUC +0,038; IC 95 % +0,017 a +0,062) |
| Las mismas 400 tablas con degradacion de escaneo, fax o fotocopia | 74.604 (35.778) | 0,902; 17 % | 0,911; 21 % (diferencia no significativa; el maximo catch@10 posible es 21 %) |
| Paginas sinteticas, unidades reservadas | 43.598 (5.739) | 0,877; 46 % | 0,966; 64 % |
| Paginas sinteticas, tipografias y degradaciones reservadas | 27.207 (3.144) | 0,821; 53 % | 0,957; 65 % |

Intervalo de confianza: bootstrap agrupado por pagina, 500 remuestreos de las 400 paginas de test. Calibracion en tablas reales limpias: ECE 0,006, Brier 0,036. El modelo y la epoca de entrenamiento se eligieron sobre un split de desarrollo real (tablas del split de train de FinTabNet reservadas), sin usar el split de test para ninguna decision.

Desglose por tipo de error en tablas reales limpias (top 10 %): celdas fusionadas o divididas 213 de 370 capturadas (140 con la confianza del lector); errores decimales 22 de 22 (16); sustituciones de digito 110 de 125 (111). Todos los numeros, incluidos los candidatos no publicados, estan en `eval_summary.json`.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo esta disenado para ejecutarse en CPU, con pesos por debajo de 1 MB.
- GPU recomendadas: ninguna necesaria. No se documenta soporte ni beneficio de aceleracion por GPU.
- Compatibilidad con GPU de consumo: irrelevante para este modelo; cualquier maquina con CPU es suficiente.
- Opciones de despliegue: al ser un modelo PyTorch con pesos safetensors y licencia Apache 2.0, se puede servir desde un proceso Python propio. No se documentan integraciones especificas con vLLM, llama.cpp, Ollama o TGI (no aplicables a un clasificador tabular de este tamano).
- Latencia y throughput: aproximadamente 70 ms por pagina de 50 unidades, incluida la extraccion de caracteristicas, en CPU.
- Coste de almacenamiento: por debajo de 1 MB de pesos, aunque el repositorio de HuggingFace figura con 0,0 GB de tamano.

## Comparativa con modelos similares

No se dispone de modelos comparables de la misma categoria en la informacion proporcionada. Las referencias de comparacion que ofrece el autor son internas:

| Alternativa | Tipo | Rendimiento relativo |
|---|---|---|
| Confianza del propio lector PaddleOCR-VL-1.6 | Linea base operativa actual | AUC 0,868 y catch@10 del 56 % en tablas reales limpias; inferior a este modelo en errores estructurales |
| Variante con codificador visual (no publicada) | Mismo modelo con vision | No mejoro los resultados en tablas reales; descartada por el autor |
| Primer modelo solo con datos sinteticos (no publicado) | Entrenamiento previo | AUC 0,78-0,79 en tablas reales, por debajo del baseline |

Otros modelos de calidad documental o estimacion de confianza comparables: no disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado contra un unico lector, PaddleOCR-VL-1.6, y sus confianzas por token. Otros lectores cometen errores distintos y reportan la confianza de otra forma; cabe esperar resultados mas debiles hasta reentrenarlo con sus salidas.
- En sustituciones de un solo digito no mejora la confianza del lector en tablas limpias (110 de 125 frente a 111 de 125) y es mucho peor en escaneos muy degradados (1 frente a 1.714 de 2.072 en el top 10 %, porque los errores de celda fusionada copan la cabeza del ranking). Si los errores de un digito son criticos, conviene unir su ranking con el de los digitos de menor confianza del lector.
- Las filas omitidas, medidas solo en paginas sinteticas, se detectan peor que con la confianza del lector (11 de 41 frente a 39 de 41 en el top 10 %).
- En escaneos malos, `p_wrong` subestima la frecuencia real de error (ECE 0,082); en ese regimen debe usarse como ranking, no como probabilidad.
- Un `p_wrong` bajo significa que no se han encontrado los patrones aprendidos, no que la lectura sea correcta.
- El modelo no incluye umbrales de decision: hay que ordenar por `p_wrong` y revisar desde arriba segun presupuesto, o fijar umbrales con datos etiquetados propios.
- Alcance limitado a lo que cubren sus tablas de entrenamiento reales: ingles y tablas financieras de empresas cotizadas en EE. UU. Otros layouts, idiomas y escritura manual en documentos reales no se han probado.
- El resultado en tablas escaneadas esta dominado por unas pocas paginas en las que el lector entra en bucle; la diferencia frente al baseline en ese conjunto esta dentro del ruido.
- Uso no previsto: decidir que un documento es correcto sin revision, tomar decisiones clinicas, financieras o legales de forma autonoma, o aplicarlo a otros lectores sin reetiquetar datos.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de las fuentes de datos de entrenamiento (FinTabNet se distribuye bajo CDLA-Permissive-1.0 y las paginas sinteticas no se han liberado).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/decosaai/decosa-readconf
- Paper de FinTabNet / GTE: X. Zheng et al., "Global Table Extractor (GTE)", WACV 2021 (IBM), citado por el autor como origen de los datos de entrenamiento
- Repositorio o demo adicional: no disponible en la informacion proporcionada
- Paper o blog del modelo: no disponible en la informacion proporcionada
