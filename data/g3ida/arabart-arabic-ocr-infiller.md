# g3ida/arabart-arabic-ocr-infiller

## Resumen

g3ida/arabart-arabic-ocr-infiller es un modelo de correccion de texto post-OCR para arabe, desarrollado por el usuario g3ida y publicado bajo licencia Apache-2.0. Se trata de un ajuste fino sobre moussaKam/AraBART, un transformer encoder-decoder de tipo BART adaptado al arabe, con 139.273.044 parametros (aproximadamente 139 M) y pesos en formato safetensors. El repositorio ocupa 0,6 GB y el modelo no registra descargas ni likes en el momento de redactar esta ficha.

El modelo ocupa la etapa B de un pipeline de correccion post-OCR de dos modelos. Su tarea concreta es el rellenado de spans (span infilling): recibe fragmentos de texto marcados como erroneos entre las etiquetas `<err>` y `</err>` y devuelve la version corregida de esos fragmentos, sin tocar el resto del documento. La decision de diseno mas relevante es mantener los caracteres corruptos dentro de las etiquetas en lugar de sustituirlos por `<mask>`, porque aproximadamente el 55% de los errores OCR son corrupciones leves (un punto, una hamza, una union indebida) y la similitud media de caracteres entre la palabra marcada y su forma correcta es de 0,682.

Su relevancia es acotada pero clara: es un modelo pequeno, especializado y de licencia permisiva, pensado para integrarse como componente determinista dentro de un sistema mayor (marcado, generacion y empalme o splice) y no como corrector autonomo. Los metadatos de HuggingFace lo etiquetan como pipeline text-generation, mientras que la model card y las tags lo describen como text2text-generation.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo BART (AraBART/mBART), generacion seq2seq |
| Parametros totales | 139.273.044 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye pesos safetensors en su precision original) |
| Idiomas soportados | arabe (ar) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | moussaKam/AraBART |
| Tarea declarada | text2text-generation (los metadatos de HuggingFace tambien lo etiquetan como text-generation) |
| Tamano del repositorio | 0,6 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de AraBART, un transformer encoder-decoder con atencion completa y objetivo de preentrenamiento de denoising tipo BART, adaptado al arabe por moussaKam. Este modelo concreto es un ajuste fino supervisado de la etapa B de un pipeline post-OCR: el detector (etapa A, no incluida en este repositorio) marca los spans sospechosos y este modelo los reescribe. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; la model card solo indica que fue entrenado sobre libros arabes escaneados.

La innovacion tecnica principal es el formato de entrada: los spans se pasan cercados con `<err> ... </err>` conservando los caracteres corruptos, en lugar de enmascararlos. Ademas, palabras marcadas consecutivas se agrupan en un unico span, lo que permite al modelo emitir un numero de palabras distinto al recibido (por ejemplo, `بنمحمد` a `بن محمد`). En inferencia, el autor recomienda decodificacion greedy (`num_beams=1`), que midio mejor CER que beam search de tamano 8 (+20,8% frente a +18,6%), ademas de ser varias veces mas rapida. La salida solo se confia en las posiciones marcadas por el detector; el resto del texto se copia byte a byte mediante un empalme (splice) externo al modelo.

## Capacidades

- Rellenado de spans corruptos por OCR en texto arabe, con libertad para cambiar el numero de palabras respecto a la entrada.
- Correccion de errores tipograficos leves: puntos diacriticos, soportes de hamza, uniones y separaciones indebidas de palabras.
- Generacion seq2seq condicionada a una entrada con marcado explicito (`<err>` / `</err>`).
- Integracion como etapa B dentro de un pipeline de correccion post-OCR con detector y empalme externos.
- No soporta tool calling ni function calling.
- No esta disenado para razonamiento multi-paso ni para uso agentico.
- Multilingue: no; unicamente arabe.
- Capacidades especiales: ninguna mas alla del rellenado de spans. No dispone de modo de pensamiento, vision ni audio.

## Casos de uso

- Digitalizacion de fondos bibliograficos arabes: el modelo repara los spans marcados por un detector de errores OCR en libros escaneados, que es exactamente el dominio sobre el que fue entrenado.
- Limpieza de corpus para entrenamiento de modelos de lenguaje en arabe: se ejecuta sobre texto OCR ya marcado para reducir el ruido antes de indexarlo, manteniendo intactas las zonas no marcadas.
- Busqueda y recuperacion documental en archivos digitalizados: al corregir uniones y separaciones de palabras (`بنمحمد` a `بن محمد`), mejora la coincidencia exacta en indices invertidos sobre texto arabe historico.
- Preservacion de patrimonio documental con revision humana: el pipeline puede enrutar numerales y nombres propios, que el modelo no puede reconstruir, a una cola de revision manual.
- Correccion de metadatos y catalogo bibliografico: titulos y autores mal transcritos por OCR pueden repararse span a span antes de volcarlos a un catalogo.
- Etapa de preprocesado en proyectos de humanidades digitales: dado su tamano (139 M de parametros), se puede ejecutar en local sobre lotes de texto sin depender de APIs externas, algo relevante cuando el material tiene restricciones de difusion.
- Evaluacion de detectores de errores OCR: al combinar la tasa de falsos positivos del detector con este corrector se puede medir el dano neto del pipeline completo antes de desplegarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente reporta mediciones internas del pipeline, que se recogen a continuacion tal cual, sin convertirlas en comparaciones con otros modelos.

| Medicion reportada | Valor | Contexto |
|---|---|---|
| CER con decodificacion greedy (`num_beams=1`) | +20,8% | Mejor que beam search de tamano 8 |
| CER con beam search (`num_beams=8`) | +18,6% | Varias veces mas lento que greedy |
| Tasa de falsos positivos del detector (etapa A) | 4,7% | Cota superior del dano en el splice |
| Dano sobre texto si se ejecuta sin splice en todo el documento | 8-22% del texto tocado | Motivo por el que no debe usarse sin acotar |
| Similitud media de caracteres entre palabra marcada y su verdad | 0,682 | Justifica conservar los caracteres corruptos |
| Errores OCR que son corrupciones leves | ~55% | Punto, soporte de hamza, union |

## Requisitos de hardware

- VRAM estimada para los pesos (estimacion a partir de 139,3 M de parametros): unos 557 MB en fp32, unos 279 MB en fp16/bf16 y unos 139 MB en int8. Con activaciones y cache, el consumo total en fp16 para lotes pequenos se mantiene por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 3060 y superiores. Tambien es viable en CPU para volumenes moderados.
- Cabe holgadamente en GPU de consumo: si, en practicamente todas las GPU dedicadas modernas y en muchas integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers con PyTorch es la via documentada por el autor a traves de la libreria `arabic_postocr`. TGI y exportacion a ONNX son alternativas razonables para arquitecturas encoder-decoder BART, aunque no se confirman en la informacion disponible. El soporte en vLLM o llama.cpp/GGUF para este modelo concreto no esta documentado.
- Latencia y throughput: no disponibles. El autor senala unicamente que la decodificacion greedy es "varias veces mas rapida" que beam search de tamano 8, sin cifras absolutas.

## Comparativa con modelos similares

No se dispone de datos verificados de parametros, contexto o rendimiento de las alternativas, por lo que la comparacion se limita a lo que puede afirmarse con la informacion disponible.

| Modelo | Parametros | Contexto | Tarea principal | Idiomas | Licencia |
|---|---|---|---|---|---|
| g3ida/arabart-arabic-ocr-infiller | 139,3 M | no disponible | Rellenado de spans post-OCR | ar | apache-2.0 |
| moussaKam/AraBART (modelo base) | no disponible (mismo backbone, sin confirmar) | no disponible | Generacion seq2seq en arabe | ar | no disponible |
| UBC-NLP/AraT5-base | no disponible | no disponible | Generacion seq2seq en arabe | ar | no disponible |
| LLM generico multilingue (por ejemplo, modelos propietarios de gran tamano) | no disponible | no disponible | Correccion de texto general | multilingue | propietaria |

Frente a un LLM generico, la ventaja de este modelo es el coste de inferencia (139 M de parametros) y la previsibilidad de su salida acotada al span marcado; la desventaja es que no generaliza fuera del dominio de libros arabes escaneados y no puede emitir diacriticos.

## Limitaciones y advertencias

- No puede emitir diacriticos (tashkil): el vocabulario de AraBART no esta diacritizado. Segun la model card, `قَالَ رَسُولُ اللَّهِ` se tokeniza en 14 tokens de los cuales 7 son `<unk>`. Los diacriticos se conservan en palabras no marcadas gracias al splice, pero se pierden dentro de los spans reparados.
- Numerales y nombres propios no son reconstruibles: numeros de pagina, referencias de folio y nombres raros no tienen contexto suficiente para predecirse. El pipeline incorpora una compuerta para derivarlos a revision humana.
- Riesgo grave de dano si se ejecuta sin el splice: un corrector aplicado de forma no supervisada sobre un documento completo dana entre el 8% y el 22% del texto que toca. La salida solo debe confiarse en las posiciones marcadas por el detector, cuya tasa de falsos positivos es del 4,7%.
- Trampa del tokenizer: la conversion a tokenizer rapido en transformers 5.x elimina la plantilla de post-procesado, de modo que `add_special_tokens=True` no anade nada. Hay que insertar `<s>` y `</s>` manualmente o la generacion se degrada de forma silenciosa.
- Decodificacion: debe usarse greedy (`num_beams=1`); beam search de tamano 8 obtiene peor CER y es mas lento.
- Dominio limitado: entrenado sobre libros arabes escaneados. Otros dominios no han sido probados segun el autor.
- Sesgos conocidos: no disponibles. La model card no documenta analisis de sesgo.
- Licencia: Apache-2.0, que permite uso comercial con las obligaciones habituales de atribucion y aviso de cambios. El modelo base AraBART tiene su propia licencia, que conviene verificar antes de un despliegue comercial.
- Madurez: cero descargas y cero likes en el momento de la consulta, lo que sugiere validacion externa practicamente nula.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/g3ida/arabart-arabic-ocr-infiller
- Modelo base: https://huggingface.co/moussaKam/AraBART
- Repositorio del pipeline (referencia incluida en la model card con marcador de posicion sin sustituir por el autor): https://github.com/OWNER/arabic-postocr
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante al modelo. Los resultados devueltos no guardan relacion con el contenido tecnico de esta ficha y se han descartado.
