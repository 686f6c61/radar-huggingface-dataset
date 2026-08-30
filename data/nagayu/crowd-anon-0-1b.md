# NagaYu/crowd-anon-0.1b

## Resumen

crowd-anon-0.1b es un modelo de clasificacion de texto desarrollado por NagaYu que estima el tamano del conjunto de anonimato (anonymity set) para descripciones de personas en japones e ingles. Dado un texto que describe cuasi-identificadores de un individuo, el modelo predice cuantas personas de una poblacion de referencia podrian coincidir con esa descripcion, expresado como una distribucion log-normal sobre el log10 del recuento. Esta disenado para evaluar riesgos de reidentificacion y ayudar a decidir si una descripcion necesita ser enmascarada antes de su publicacion.

El modelo tiene 110,3 millones de parametros (0,11B), una arquitectura transformer de 12 capas con 768 dimensiones ocultas y una ventana de contexto de 48 tokens. Se entrena desde cero con una funcion de perdida gaussiana censurada (Tobit) que trata correctamente las observaciones en el limite de reporte de 5 personas, evitando sobreestimar los recuentos mas bajos. El modelo se distribuye en multiples formatos (ONNX, Core ML, GGUF) con un runtime numpy de referencia, lo que permite su ejecucion en dispositivos sin dependencias de torch.

La relevancia de este modelo radica en que aborda un problema de privacidad practico: determinar si una descripcion textual es lo suficientemente unica como para identificar a una persona. A diferencia de los modelos de anonimizacion tradicionales que aplican reglas heuristicas, crowd-anon-0.1b proporciona una estimacion cuantitativa y calibrada del riesgo, con intervalos de confianza y un mecanismo de censura que impide distinguir entre recuentos muy bajos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (12 capas, 768 d_model, 12 cabezas, FFN 3072) |
| Parametros totales | 110.260.994 (110,3M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 48 tokens (p99 del corpus = 31) |
| Tipos de cuantizacion | GGUF f16 y Q8_0; Core ML fp16; ONNX opset 17 |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX, Core ML (mlprogram), GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer encoder clasico de 12 capas con 768 dimensiones ocultas y 12 cabezas de atencion. La atencion se implementa con matmuls planos en lugar de operaciones fusionadas, lo que permite que la exportacion a ONNX, Core ML y el runtime numpy de referencia produzcan resultados identicos. La cabeza de salida aplica mean-pooling sobre las representaciones y una MLP que produce dos valores: la media y la varianza logaritmica de una distribucion gaussiana sobre el log10 del tamano del conjunto de anonimato.

El tokenizador es un BPE a nivel de byte con vocabulario de 32.000 entradas, entrenado especificamente sobre el corpus de entrenamiento. El modelo se entrena desde cero, sin usar pesos preentrenados de ningun otro modelo.

La funcion de perdida es una verosimilitud gaussiana censurada (Tobit) que trata las observaciones en o por debajo del limite de reporte de 5 personas como censuradas. Esto es una decision de diseno critica: aproximadamente un octavo del corpus esta en el limite, y entrenar esas filas como observaciones exactas del limite haria que el modelo sobreestimara los recuentos mas raros, que son precisamente los mas peligrosos para la reidentificacion. El termino Tobit maximiza la probabilidad de que el recuento sea menor o igual al limite, lo que es a la vez correcto y seguro.

El conjunto de entrenamiento, crowd-anonymity-sets, contiene aproximadamente 250.000 descripciones sinteticas con tamanos de conjunto de anonimato calculados exactamente mediante propagacion de creencias sobre un modelo log-lineal en arbol, ajustado a marginales publicados de la poblacion japonesa. Los splits se realizan sobre un hash de la combinacion de atributos, de modo que el conjunto de prueba contiene combinaciones que el modelo nunca ha visto.

## Capacidades

- Estimacion del tamano del conjunto de anonimato: dado un texto descriptivo, predice cuantas personas de la poblacion de referencia podrian coincidir con los cuasi-identificadores mencionados.
- Salida calibrada: produce una media y una desviacion estandar sobre log10 del recuento, convertidas en un intervalo de confianza del 90% mediante un wrapper split-conformal ajustado en datos de validacion.
- Evaluacion de criterios k-anonimato: permite comprobar si una descripcion cumple un umbral minimo de tamano de conjunto (por ejemplo, k=1000) mediante el metodo `meets(k)`.
- Integracion con redaccion minima: combinado con `crowd.optimize.MinimalMaskOptimizer`, puede determinar que atributos deben enmascararse para alcanzar un tamano de conjunto objetivo.
- Censura de recuentos bajos: cualquier combinacion que coincida con menos de 5 personas se reporta como "≤5", sin posibilidad de interpolacion por debajo del limite.
- Multilingue: soporta descripciones en japones e ingles.
- Multiplataforma: los mismos pesos se ejecutan en torch, ONNX, Core ML y un runtime numpy puro para GGUF, verificados para que no difieran en mas de 0,05 log10.

## Casos de uso

- Evaluacion de riesgo de reidentificacion en publicaciones de datos: antes de publicar un conjunto de datos con descripciones de personas, un investigador puede pasar cada descripcion por el modelo para identificar aquellas con conjuntos de anonimato pequenos que requieran enmascaramiento o agregacion.
- Redaccion automatica de documentos clinicos: un hospital que prepare notas medicas para su publicacion puede usar el modelo junto con el optimizador de enmascaramiento para eliminar solo los atributos necesarios para alcanzar un tamano de multitud seguro, preservando la mayor cantidad de informacion util posible.
- Auditoria de privacidad en bases de datos de clientes: una empresa puede analizar descripciones de clientes en sus registros para detectar combinaciones de atributos que sean demasiado unicas y podrian permitir la identificacion si los datos se filtraran.
- Verificacion de cumplimiento normativo: organizaciones que deben cumplir con regulaciones de privacidad (como GDPR o APPI japones) pueden usar el modelo para documentar que sus procesos de anonimizacion alcanzan umbrales cuantitativos de riesgo.
- Investigacion en privacidad diferencial: academicos que estudian ataques de reidentificacion pueden usar el modelo como una herramienta de evaluacion para medir la efectividad de diferentes estrategias de enmascaramiento.
- Desarrollo de pipelines de anonimizacion en dispositivos moviles: gracias a los formatos Core ML y GGUF, el modelo puede ejecutarse localmente en un telefono para evaluar el riesgo de una descripcion antes de enviarla a un servidor, sin transmitir datos personales.

## Benchmarks y rendimiento

Los resultados publicados en la model card se obtuvieron en el conjunto de prueba con combinaciones de atributos no vistas durante el entrenamiento. Todas las metricas de error estan en unidades de log10 del recuento de personas (0,30 equivale a un factor de 2).

| Estimador | MAE | RMSE | Sesgo | ECE | Cobertura intervalo 90% | ms/doc | Pico RSS |
|---|---|---|---|---|---|---|---|
| `analytic` (sin modelo) | 0,289 | 1,186 | -0,288 | 0,289 | 93,0% (nominal 90%, ancho 0,83 log10) | 0,89 | 84 MB |
| **crowd-anon-0.1b** (torch) | 0,350 | 0,543 | +0,025 | 0,169 | 85,3% (nominal 90%, ancho 1,71 log10) | 4,12 | 1284 MB |
| Mismos pesos via GGUF + numpy | 0,347 | 0,557 | +0,061 | 0,170 | 86,6% (nominal 90%, ancho 1,61 log10) | 85,1 | 1384 MB |

El modelo neuronal tiene un MAE ligeramente superior al estimador analitico, pero un RMSE mucho menor (0,543 frente a 1,186), lo que indica que evita los errores grandes. El sesgo es practicamente nulo (+0,025) y la calibracion (ECE 0,169) es mejor que la del metodo analitico. La cobertura del intervalo del 90% es del 85,3%, algo inferior al nominal, con un ancho medio de 1,71 log10.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 110M de parametros, por lo que en fp32 ocupa aproximadamente 440 MB. En cuantizacion Q8_0 (GGUF) ocupa unos 110 MB, y en fp16 unos 220 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Una GPU consumer como la NVIDIA GTX 1650 o superior puede ejecutar el modelo sin problemas. Tambien funciona en CPU.
- Compatibilidad con hardware consumer: si, el modelo cabe en cualquier GPU moderna e incluso en dispositivos moviles gracias a los formatos Core ML y ONNX.
- Opciones de despliegue: el runtime numpy puro incluido en la libreria `crowd` permite ejecutar el modelo sin torch ni tokenizers. Tambien se puede usar con onnxruntime, coremltools o llama.cpp (aunque llama.cpp no reconoce la arquitectura `crowd-anon`, el archivo GGUF es valido y sus tensores son legibles).
- Latencia y rendimiento: en torch, la inferencia tarda 4,12 ms por documento con un pico de RSS de 1284 MB. Con el runtime numpy sobre GGUF, la latencia es de 85,1 ms por documento con 1384 MB de RSS. El metodo analitico de referencia tarda 0,89 ms con 84 MB.

## Comparativa con modelos similares

No se han identificado modelos directamente comparables en la informacion disponible. crowd-anon-0.1b ocupa un nicho especifico: estimacion cuantitativa del tamano de conjuntos de anonimato a partir de texto, con censura Tobit y calibracion conformal. Los modelos de anonimizacion de texto existentes (como los basados en NER para enmascarar entidades) no producen estimaciones numericas de riesgo, y los metodos estadisticos tradicionales (como el estimador `analytic` incluido en el repositorio) no procesan texto directamente. La comparacion mas relevante es con el estimador analitico del mismo proyecto, que tiene mejor MAE pero peor RMSE y peor calibracion.

## Limitaciones y advertencias

- El modelo no garantiza anonimato y no debe describirse como si lo hiciera. La informacion utilizable para reidentificacion es ilimitada en principio; el modelo es una herramienta de estimacion y priorizacion, no una garantia de privacidad.
- Las estimaciones son condicionales a la poblacion de referencia, que es un modelo probabilistico construido a partir de estadisticas agregadas publicadas de la poblacion japonesa. Para otras poblaciones o paises, los resultados pueden no ser validos.
- El modelo no identifica personas y no puede ser utilizado para hacerlo. No existe ningun indice de individuos en el sistema, y ningun tipo de salida tiene un campo que pueda transportar una identidad.
- Los recuentos se censuran en un limite de reporte de 5 personas. Cualquier combinacion que coincida con menos de 5 personas se reporta como "≤5", y el modelo esta entrenado para no interpolar por debajo de ese limite.
- La ventana de contexto es de solo 48 tokens, lo que limita la longitud de las descripciones que puede procesar. Descripciones mas largas deberan truncarse o dividirse.
- El modelo solo soporta japones e ingles. No se ha evaluado su rendimiento en otros idiomas.
- La cobertura del intervalo del 90% es del 85,3%, inferior al nominal, lo que significa que los intervalos son algo demasiado optimistas.
- El modelo no debe utilizarse como unica medida de privacidad. Debe complementarse con otras tecnicas de anonimizacion y con revision humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NagaYu/crowd-anon-0.1b
- Repositorio del proyecto: https://github.com/NagaYu/crowd
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/NagaYu/crowd-anonymity-sets
- Espacio relacionado (Llama Local Lab): https://huggingface.co/spaces/NagaYu/llama-local-lab
