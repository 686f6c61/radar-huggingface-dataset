# Rafaelvieira432/lang10m-sentiment-fast

## Resumen

LANG-10M es un clasificador de identificación de idioma publicado por el usuario Rafaelvieira432 en HuggingFace. Se presenta como un detector de 69 idiomas construido sobre una capa de embedding con hashing de n-gramas (EmbeddingBag de 128 dimensiones y 300.000 buckets), distribuido en FP16 con un peso declarado de aproximadamente 73 MB y una latencia declarada inferior a 2 ms por frase en CPU básica. El repositorio incluye los pesos en formato PyTorch (`lang_10m_fp16.pt`), la configuración de arquitectura (`config.json`), el mapa de etiquetas ISO (`labels.json`) y un script de inferencia autónomo (`infer.py`). La licencia es Apache 2.0.

El modelo no es un modelo generativo ni un transformer: es un clasificador discriminativo de frase completa, pensado para despliegues de muy baja latencia en edge o como etapa de preprocesado en pipelines multilingües. Su interés práctico está en el coste: un clasificador de este tamaño puede ejecutarse en CPU sin GPU y en paralelo con cargas mayores (traducción, enrutado a LLM, filtrado de corpus) sin convertirse en cuello de botella.

Advertencia importante de catalogación: el identificador del repositorio es `lang10m-sentiment-fast`, lo que sugiere análisis de sentimiento, pero toda la model card, las etiquetas y los archivos descritos corresponden a identificación de idioma. No hay evidencia de que el modelo realice análisis de sentimiento. Además, el repositorio tiene 0 descargas y 0 likes, no incluye resultados de evaluación y el tamaño del repo (0,3 GB) cuadruplica aproximadamente el peso declarado de los pesos (73 MB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador con hashing de n-gramas y EmbeddingBag (bolsa de embeddings con pooling), capa de proyección a 69 clases; no es un transformer |
| Parametros totales | No disponible en la model card. Estimacion derivada: 300.000 buckets x 128 dimensiones = 38.400.000 parametros de embedding, mas 128 x 69 + 69 en la capa de salida (~8.901), circa 38,4 M en total |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: clasificador de frase única. La ventana de n-gramas y el algoritmo de hash están en `config.json`, pero el valor no se detalla en la información disponible |
| Tipos de cuantizacion | FP16 (declarado como "FP16 nativo"); no se documentan INT8, GGUF ni otras variantes |
| Idiomas soportados | 69 idiomas (según la model card); el tag de HuggingFace indica `multilingual`. El listado completo está en `labels.json` |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pt` (`lang_10m_fp16.pt`), acompañado de `config.json`, `labels.json` e `infer.py`. Sin safetensors, GGUF ni ONNX publicados |

Nota de consistencia: 38,4 M de parámetros en FP16 equivalen a unos 76,8 MB, frente a los ~73 MB declarados; la diferencia es pequeña y podría deberse al redondeo del número de buckets, a un vocabulario efectivo menor o a que la cifra de 73 MB se refiera solo al tensor de embedding. No es posible verificarlo con la información disponible.

## Arquitectura y entrenamiento

La arquitectura es un clasificador lineal sobre una representación de bolsa de n-gramas con hashing. Cada frase se tokeniza en n-gramas de caracteres y/o palabras, cada n-grama se mapea a uno de los 300.000 buckets mediante una función hash, y los embeddings de 128 dimensiones de los buckets resultantes se agregan con una EmbeddingBag (pooling tipo media o suma, el valor concreto no se especifica). La representación agregada se proyecta a 69 logits, uno por idioma. Es el mismo esquema que emplea fastText para clasificación de texto, aquí reimplementado en PyTorch y exportado como `state_dict` o módulo completo en `.pt`. El tag `fasttext-embeddingbag` del repositorio es coherente con esta descripción.

No se proporciona ninguna información sobre el corpus de entrenamiento: ni número de tokens, ni composición del dataset, ni proporción por idioma, ni procedencia de los datos, ni si hubo ajuste fino supervisado, destilación o calibración posterior. Tampoco se documentan técnicas de regularización, tamaño de n-gramas, función de pérdida ni proceso de validación. La única innovación declarada es de despliegue, no de modelado: peso reducido en FP16, latencia inferior a 2 ms por frase en CPU y ejecución sin dependencias propietarias. Cualquier afirmación sobre calidad por idioma carece de respaldo en la información disponible.

## Capacidades

- Identificación de idioma a nivel de frase entre 69 clases, devolviendo presumiblemente la etiqueta de mayor probabilidad (la función de salida concreta no se detalla).
- Clasificación de textos cortos con coste computacional muy bajo: el propio autor declara menos de 2 ms por sentencia en CPU básica.
- Ejecución en CPU y en GPU sin requisitos de VRAM relevantes, gracias a un peso de decenas de megabytes.
- Mapa de etiquetas a códigos ISO mediante `labels.json`, lo que facilita integrar la salida en pipelines existentes.
- Ejecución autónoma mediante `infer.py`, sin dependencias propietarias declaradas.
- No dispone de generación de texto, razonamiento, matemáticas, código, visión, audio, tool calling, function calling, modo thinking ni capacidades de agente. Es un clasificador de una sola etiqueta por entrada.

## Casos de uso

- Enrutado multilingüe previo a un LLM: detectar el idioma de la consulta con un clasificador de milisegundos y derivarla al prompt, al modelo especializado o al traductor adecuado, evitando gastar tokens en la detección.
- Filtrado y etiquetado de corpus para entrenamiento: clasificar millones de documentos de un crawl por idioma antes de la deduplicación y el filtrado de calidad, donde el coste por documento es determinante.
- Moderación y cumplimiento por locale: identificar el idioma de un contenido reportado para aplicar las políticas y los flujos de revisión correspondientes a esa región.
- Telemetría y analítica de producto en edge: clasificar el idioma de eventos o textos de interfaz en dispositivos con CPU limitada, sin enviar datos a un servicio externo.
- Preprocesado en pipelines de voz o subtitulado: etiquetar cada segmento transcrito para decidir qué modelo de traducción o de pronunciación aplicar a continuación.
- Gestión de colas de atención al cliente: separar tickets por idioma antes de asignarlos a agentes o a respuestas automáticas, con latencia despreciable frente al resto del sistema.
- Control de calidad de datos multilingües: detectar documentos mal etiquetados o con idioma distinto al declarado en un catálogo o repositorio.
- Gatekeeping en sistemas de recuperación: restringir la búsqueda a índices del mismo idioma que la consulta para mejorar la precisión del retrieval.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye accuracy por idioma, F1, matrices de confusión, comparación con fastText lid.176 ni ninguna otra métrica de evaluación. Tampoco se aportan mediciones de throughput en lote, solo la afirmación de latencia inferior a 2 ms por sentencia en CPU básica, que no está respaldada por una metodología reproducible (no se indica CPU, longitud de frase ni número de hilos).

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP16 (~73 MB de pesos más overhead de activaciones y runtime). En la práctica, irrelevante.
- GPU recomendadas: cualquiera; el modelo no necesita GPU. Una RTX 4090, A100 o H100 lo ejecutarían muy por debajo de su capacidad y no aportarían ventaja frente a CPU para este tamaño.
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU, y también en CPU sin aceleración.
- Despliegue: PyTorch nativo con `infer.py`; exportación a TorchScript u ONNX Runtime para reducir el overhead de Python; la librería fastText si se convierte el modelo a su formato; servidores de inferencia genéricos tipo Triton o un microservicio HTTP propio. vLLM, TGI, llama.cpp y Ollama no son aplicables: son motores para modelos generativos y este es un clasificador.
- Latencia y throughput: el autor declara < 2 ms por frase en CPU básica; no hay cifras de throughput en lote ni de latencia en GPU. El throughput real dependerá de la tokenización de n-gramas, que suele dominar el coste en clasificadores de este tipo.

## Comparativa con modelos similares

No se ha proporcionado información verificada de modelos comparables, por lo que las cifras de las alternativas se marcan como no disponibles. Se citan únicamente como referencias de categoría, sin datos atribuidos.

| Modelo | Categoria | Idiomas | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LANG-10M (este modelo) | Clasificador de idioma con hashing de n-gramas + EmbeddingBag | 69 | ~38,4 M (estimacion derivada) | Apache 2.0 | HuggingFace, 0 descargas, sin evaluacion publicada |
| fastText lid.176 | Clasificador de idioma de la libreria fastText | No disponible en la informacion proporcionada | No disponible | No disponible | Referencia de la categoria; datos sin verificar en esta ficha |
| CLD3 (Compact Language Detector v3) | Detector de idioma para navegador, red neuronal pequena | No disponible en la informacion proporcionada | No disponible | No disponible | Referencia de la categoria; datos sin verificar en esta ficha |
| GlotLID | Identificador de idioma multilingue de amplia cobertura | No disponible en la informacion proporcionada | No disponible | No disponible | Referencia de la categoria; datos sin verificar en esta ficha |

No es posible establecer una comparación cuantitativa de rendimiento porque este modelo no publica métricas y las alternativas no han sido evaluadas en la información disponible.

## Limitaciones y advertencias

- Incoherencia entre el nombre del repositorio (`lang10m-sentiment-fast`, que sugiere sentimiento) y el contenido real (identificación de idioma). Verificar antes de usarlo para análisis de sentimiento: no hay indicios de que realice esa tarea.
- Ausencia total de evaluación publicada: sin accuracy, sin F1, sin matrices de confusión, sin comparación con líneas base. No hay forma de saber si el modelo funciona bien en los 69 idiomas o solo en los mayoritarios.
- Cero descargas y cero likes: no hay evidencia de uso real ni de validación por terceros. Autor sin histórico verificable en la información disponible.
- Modelo entrenado presumiblemente sobre frases cortas: el rendimiento en documentos largos, textos con cambio de código (code-switching) o idiomas con alfabetos poco representados en los n-gramas puede degradarse. No hay datos al respecto.
- El alcance es de una sola etiqueta por entrada; no modela mezcla de idiomas ni proporciona puntuaciones calibradas de forma documentada.
- La carga de un `.pt` de PyTorch implica deserialización con pickle: usar `torch.load(..., weights_only=True)` o convertir a safetensors/ONNX antes de exponer el modelo a entradas no confiables.
- La afirmación "FP16 nativo" y la descripción de los pesos como "cuantizados en FP16" son técnicamente imprecisas: FP16 es una precisión reducida, no una cuantización de enteros. No se ofrecen variantes INT8 para CPU, donde serían más eficientes.
- Discrepancia de tamaño: 0,3 GB de repositorio frente a ~73 MB de pesos declarados. Puede haber artefactos adicionales no documentados; conviene inspeccionar los archivos antes de descargar.
- Licencia Apache 2.0 permite uso comercial y modificación con atribución y aviso de cambios, pero al no haber evaluación no existe garantía implícita de aptitud para producción.
- No hay información sobre sesgos por idioma, tratamiento de variedades dialectales ni cobertura real de idiomas de bajos recursos dentro de las 69 clases declaradas.
- No es un modelo generativo: no admite instrucciones, no razona, no usa herramientas y no debe plantearse como sustituto de un LLM en ninguna tarea que no sea clasificación de idioma.

## Enlaces

- HuggingFace: https://huggingface.co/Rafaelvieira432/lang10m-sentiment-fast
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos relacionados con este modelo. Los resultados de búsqueda disponibles no guardan relación con el modelo y se han descartado.
