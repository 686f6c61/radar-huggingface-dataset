# jiangzhuo9357/sat-3l-sm-onnx

## Resumen

sat-3l-sm-onnx es una exportación a ONNX con cuantización weight-only de 8 bits del modelo SaT 3L-SM (segment-any-text/sat-3l-sm), el modelo de segmentación de fronteras de oración de wtpsplit basado en un encoder XLM-RoBERTa de 3 capas. Lo publica el usuario jiangzhuo9357 como artefacto auxiliar para la etapa local de segmentación de oraciones de Sokuji, una aplicación de escritorio de transcripción y traducción. El modelo no genera texto ni inserta signos de puntuación: recibe una secuencia de subwords y etiqueta en qué subword termina una oración, funcionando incluso sin puntuación ni mayúsculas en la entrada.

La aportación principal de esta build, denominada "q8w-gather", es doble. Por un lado reescribe el grafo fp16 original a fp32, porque el fichero publicado falla en adaptadores WebGPU sin soporte de shader-f16. Por otro, cuantiza a 8 bits todas las MatMul con peso constante mediante MatMulNBits (bloque de 32, simétrico) y sustituye la tabla de embeddings de palabras de 250.002 × 768 por una GatherBlockQuantized de 8 bits, uint8 con punto cero implícito en 128 y una escala float32 por bloque de 32 valores.

El resultado pesa 241.945.842 bytes (frente a los 793.953.242 bytes de la variante con embeddings en float32, y a los 2.046 MB de memoria residente del fp16 original) y reproduce el 96,7 % de las divisiones del modelo fp16 de referencia. Es relevante porque demuestra que un modelo de segmentación multilingüe de 85 idiomas puede ejecutarse íntegramente en el navegador o en el escritorio mediante onnxruntime-web 1.26, tanto en WebGPU como en WASM, sin depender de shader-f16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder XLM-RoBERTa de 3 capas con una única etiqueta de salida (fin de oración tras el subword); derivada de segment-any-text/sat-3l-sm |
| Parametros totales | No disponible (la tabla de embeddings de palabras es de 250.002 × 768) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible (el benchmark incluye filas largas procesadas en múltiples ventanas, lo que implica segmentación por ventanas deslizantes) |
| Tipos de cuantizacion | 8 bits weight-only: MatMulNBits (bloque 32, simétrico) en las MatMul con peso constante y GatherBlockQuantized de 8 bits (uint8, punto cero implícito 128, escala float32 por bloque de 32) en la tabla de embeddings; existe una variante "q8w" con embeddings en float32 |
| Idiomas soportados | Multilingüe; 85 idiomas en el modelo upstream |
| Licencia | MIT (heredada de segment-any-text/sat-3l-sm y segment-any-text/wtpsplit) |
| Formato de pesos | ONNX (model.onnx, 241.945.842 bytes) + tokenizer.json (9.096.718 bytes) |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer XLM-RoBERTa reducido a 3 capas, con una única cabeza de clasificación que predice si una oración termina después del subword actual. El modelo upstream fue entrenado explícitamente para operar sin puntuación ni distinción de mayúsculas, de modo que es aplicable a salidas de ASR, texto informal o corpus sin normalizar. No genera signos de puntuación: solo marca fronteras de oración. El tokenizador incluido es el de FacebookAI/xlm-roberta-base, sin modificaciones.

Esta ficha no documenta el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO): esa información no está disponible en la documentación proporcionada. Lo que sí describe el autor es el proceso de conversión y cuantización. Partiendo del fichero fp16 publicado, que falla en WebGPU sin soporte de shader-f16 con el error "Program Gather requires f16 but the device does not support it", se reescribe el grafo a fp32 (todos los initializers FLOAT16, Constant, valores de ConstantOfShape, tipos de E/S y destinos de Cast pasan a FLOAT, y se añade el import del opset com.microsoft que el grafo usaba mediante SkipLayerNormalization y BiasGelu sin declarar). Después se cuantizan las MatMul con MatMulNBits de 8 bits y se reemplaza la operación Gather de embeddings por GatherBlockQuantized, construida a mano porque el cuantizador de onnxruntime solo emite GatherBlockQuantized de 4 bits. La invocación exacta es `python parity/sat-3l-sm-q8w.py --force` sobre el harness de benchmark de Sokuji. Ningún tensor del resultado es float16.

## Capacidades

- Segmentación de fronteras de oración en 85 idiomas (cobertura declarada del modelo upstream), incluyendo lenguas fuera del conjunto zh/en/ja/ko/es/fr/de/pt que cubren los demás modelos portados en el benchmark de Sokuji.
- Funcionamiento sin puntuación y sin distinción de mayúsculas en la entrada, requisito típico de transcripciones ASR.
- Predicción con umbral de decisión probabilístico: la frontera se marca cuando la probabilidad supera 0,25.
- Modo offline (procesamiento completo) y modo streaming con commit de contexto derecho (8 caracteres en la medición de coreano).
- Procesamiento por ventanas múltiples para entradas largas.
- Ejecución en WebGPU y en WASM dentro de onnxruntime-web 1.26, y en onnxruntime para escritorio.
- No soporta generación de texto, tool calling, function calling, agentes, visión, audio ni razonamiento multi-paso. Es un modelo de clasificación de tokens, no un modelo generativo.
- No inserta signos de puntuación; para restaurar puntuación haría falta un modelo adicional (el autor cita fireredpunc-onnx como referencia de receta de cuantización).

## Casos de uso

- Segmentación de oraciones en local dentro de Sokuji: el modelo actúa como etapa de preprocesado sobre la salida del ASR, dividiendo la transcripción en oraciones antes de la traducción, con 11-16 ms por entrada de 120 caracteres en WebGPU.
- Subtitulado y transcripción en tiempo real: el modo streaming con commit de 8 caracteres de contexto derecho permite emitir fronteras mientras llega el audio, con precisión/recall de 93,0/95,2 en japonés y 100/87,5 en coreano.
- Chunking para RAG y búsqueda semántica: dividir documentos sin puntuación (transcripciones, chat, redes sociales) en unidades oracionales para indexarlas, aprovechando el procesamiento multi-ventana para textos largos.
- Preprocesado para traducción automática: al aislar oraciones completas se mejora la alineación entre segmentos de origen y destino, especialmente en idiomas sin separadores claros.
- Normalización de texto para TTS: insertar pausas prosódicas en las fronteras predichas mejora la naturalidad de la síntesis en corpus sin puntuar.
- Anotación de corpus multilingües: la cobertura de 85 idiomas permite segmentar corpus de lenguas minoritarias donde no existen modelos de puntuación específicos.
- Procesamiento en el navegador o en el borde: con 251 MB en disco y sin necesidad de shader-f16, encaja en aplicaciones web y de escritorio que no pueden enviar texto a un servicio remoto por privacidad.
- Restauración de puntuación en cascada: combinado con un modelo de puntuación como fireredpunc-onnx, este modelo aporta las fronteras y el segundo inserta los signos.

## Benchmarks y rendimiento

| Evaluacion | Metrica | Resultado | Notas |
|---|---|---|---|
| Paridad frente al fp16 publicado | Divisiones idénticas | 261/270 (96,7 %) | WASM, mismo módulo; 270 filas (244 de corpus, 12 largas multi-ventana, 14 de casos límite) |
| Paridad frente al fp16 publicado | Diferencia en probabilidad de frontera | ≤ 0,015 respecto al umbral 0,25 en cada discrepancia | Todas las divergencias son casos cercanos al umbral |
| Japonés | Sentence-end F1 (offline) | 94,1 | Mejor puntuación del benchmark para este idioma |
| Japonés | Streaming precision / recall | 93,0 / 95,2 | |
| Coreano | Sentence-end F1 (offline) | 90,9 | Mejor puntuación del benchmark para este idioma |
| Coreano | Streaming precision / recall | 100 / 87,5 | Commit de 8 caracteres de contexto derecho |
| Inglés (entrada con mayúsculas) | Sentence-end F1 | 98,6 | |
| Inglés (entrada en minúsculas) | Sentence-end F1 | 64,6 | Caída de 34 puntos por pérdida de capitalización |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; el modelo no es generativo y esas evaluaciones no aplican.

## Requisitos de hardware

- No requiere GPU para funcionar: el autor reporta paridad de salida entre WebGPU y WASM con 4 hilos en las 101 entradas de corpus probadas.
- Memoria residente en WASM: 1.251 MB, frente a 2.046 MB del fichero fp16 publicado (que onnxruntime-web eleva a float32 al cargar).
- Espacio en disco: 241.945.842 bytes para model.onnx (el autor reporta 251 MB en disco, incluyendo tokenizer.json de 9.096.718 bytes); el repositorio ocupa 0,2 GB.
- Latencia medida por el autor en Electron 40.8.5 sobre DGX Spark GB10 aarch64 con WebGPU: 11-16 ms para entradas de 120 caracteres en ja/zh/en/ko y 13-16 ms para entradas de 480 caracteres.
- GPU recomendadas: no disponible (las mediciones se hicieron sobre WebGPU integrado en un GB10 aarch64; no se publican pruebas con A100, H100 o RTX 4090, y con este tamaño de modelo serían desproporcionadas).
- Cabe en cualquier GPU de consumo e incluso en CPU: el modelo completo pesa menos de 250 MB y la inferencia es de decenas de milisegundos.
- Opciones de despliegue: onnxruntime-web 1.26 (WebGPU y WASM), onnxruntime en escritorio (la variante q8w con embeddings float32 puede ser preferible en entornos sin soporte de GatherBlockQuantized), integración en Electron.
- vLLM, TGI y llama.cpp no son aplicables: no es un modelo generativo autorregresivo.
- Requisito de runtime: el grafo usa operadores de com.microsoft (MatMulNBits, GatherBlockQuantized, SkipLayerNormalization, BiasGelu), por lo que el motor de inferencia debe soportar ese dominio; también necesita el tokenizer.json de XLM-RoBERTa.

## Comparativa con modelos similares

| Modelo | Arquitectura | Formato y tamano | Idiomas | Licencia | Despliegue |
|---|---|---|---|---|---|
| sat-3l-sm-onnx (q8w-gather) | XLM-RoBERTa de 3 capas, etiqueta de frontera | ONNX, 241.945.842 bytes, 8 bits MatMulNBits + GatherBlockQuantized | 85 | MIT | WebGPU y WASM (onnxruntime-web 1.26), onnxruntime |
| sat-3l-sm (fp16 upstream) | XLM-RoBERTa de 3 capas, etiqueta de frontera | ONNX fp16, tamano de fichero no disponible; 2.046 MB residentes en WASM | 85 | MIT | Falla en WebGPU sin shader-f16; requiere upcast a float32 en onnxruntime-web |
| sat-3l-sm-onnx (variante q8w) | Igual, con embeddings en float32 | ONNX, 793.953.242 bytes | 85 | MIT | Mayor precision potencial, mayor consumo de disco y memoria |
| fireredpunc-onnx | Modelo de restauración de puntuación | ONNX, cuantización weight-only (receta reutilizada por este modelo) | No disponible | No disponible | onnxruntime; datos de rendimiento no disponibles en la información proporcionada |
| Modelos portados a Sokuji para zh/en/ja/ko/es/fr/de/pt | No disponible | No disponible | Conjunto limitado de 8 idiomas | No disponible | No disponible |

Datos de parametros, contexto y resultados comparativos de las alternativas: no disponibles. La ventaja documentada de esta build frente al fp16 upstream es la compatibilidad con WebGPU sin shader-f16 y un 39 % menos de memoria residente, a cambio de un 3,3 % de divisiones distintas.

## Limitaciones y advertencias

- No inserta puntuación: únicamente predice fronteras de oración. Cualquier expectativa de restaurar comas, puntos o mayúsculas requiere un modelo adicional.
- Sensibilidad crítica a las mayúsculas en inglés: F1 98,6 con texto capitalizado frente a 64,6 en minúsculas. En pipelines que normalizan todo a minúsculas la calidad se degrada gravemente.
- Divergencias cerca del umbral: el 3,3 % de divisiones distintas respecto al fp16 se concentra en fronteras con probabilidad dentro de 0,015 del umbral 0,25, por lo que pequeños cambios de entrada pueden invertir la decisión.
- La cuantización introduce pérdida de precisión: las probabilidades de frontera no son idénticas a las del modelo fp32.
- Cobertura medida limitada: los resultados de calidad publicados solo cubren japonés, coreano e inglés; para los otros idiomas solo existe la declaración de cobertura de 85 idiomas del upstream, sin métricas verificadas.
- Dependencia del runtime: requiere soporte de los operadores com.microsoft:MatMulNBits y GatherBlockQuantized. Motores ONNX antiguos o restringidos pueden no cargar el grafo.
- El modelo upstream fue entrenado para funcionar sin puntuación, así que no se beneficia de entradas bien puntuadas y puede comportarse de forma distinta a los segmentadores clásicos basados en reglas.
- Licencia MIT: permite uso comercial y modificación siempre que se conserve el aviso de copyright y la licencia, tanto del modelo upstream como del código de wtpsplit. No hay cláusulas de uso aceptable adicionales documentadas.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente de las métricas reportadas por el autor.
- No hay información sobre sesgos, datos de entrenamiento ni evaluación de robustez frente a entradas adversarias.
- Fechas de creación y actualización del repositorio: 18 de septiembre de 2026 (mismo día para ambas).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jiangzhuo9357/sat-3l-sm-onnx
- Pesos upstream (segment-any-text/sat-3l-sm, MIT): https://huggingface.co/segment-any-text/sat-3l-sm
- Código y librería wtpsplit 2.2.1 (MIT): https://github.com/segment-any-text/wtpsplit
- Proyecto Sokuji: https://github.com/kizuna-ai-lab/sokuji
- Tokenizador de origen (FacebookAI/xlm-roberta-base): https://huggingface.co/FacebookAI/xlm-roberta-base
- Notas del benchmark de puntuación de Sokuji: docs/superpowers/notes/2026-09-14-asr-punctuation-benchmark.md (dentro del repositorio de Sokuji; no se ha proporcionado URL directa)
- Script de conversión: parity/sat-3l-sm-q8w.py (dentro del repositorio de Sokuji; no se ha proporcionado URL directa)
