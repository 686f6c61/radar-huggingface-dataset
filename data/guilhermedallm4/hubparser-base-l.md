# guilhermedallm4/HubParser-Base-L

## Resumen

HubParser-Base-L es un modelo de análisis sintáctico y morfológico completo para portugués brasileño, desarrollado por Guilherme Dallman Lima (PPGC/UFPel) como parte de su disertación de máster sobre el sistema HubParser. Se construye sobre el encoder BERTimbau Base (neuralmind/bert-base-portuguese-cased) y añade cinco cabezas lineales que predicen conjuntamente etiquetas UPOS, lema, rasgos morfológicos (FEATS), cabeza sintáctica (HEAD) y relación de dependencia (DEPREL), siguiendo el formalismo de Universal Dependencies.

El modelo resuelve una tarea de parsing completo en una sola pasada: a partir de una frase ya tokenizada en palabras, devuelve el árbol de dependencias y toda la información morfológica asociada, con una salida directamente exportable a formato CoNLL-U. Con 109,4 millones de parámetros y una ventana de 512 tokens, está entrenado específicamente sobre el corpus Porttinari-base, lo que lo hace relevante para pipelines de PLN en portugués que necesiten análisis sintáctico preciso sin depender de herramientas externas.

Su interés técnico reside en la combinación de un encoder BERTimbau con cabezas lineales ligeras y tres estrategias de decodificación seleccionables en inferencia (greedy, Eisner proyectivo y MST no proyectivo), además de una exportación ONNX en fp16 que permite ejecutarlo íntegramente en el navegador vía WebGPU o WebAssembly.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (BERTimbau Base, 12 capas) con cinco cabezas lineales de clasificación |
| Parametros totales | 109.450.670 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (limite del encoder BERT) |
| Tipos de cuantizacion | ONNX fp16 (209 MB); no se documentan otras cuantizaciones |
| Idiomas soportados | Portugues (pt), variante brasileña |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch), ONNX (fp16) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura encoder-only tipo BERT. Sobre las representaciones contextuales de BERTimbau Base se aplican cinco clasificadores lineales independientes por subtoken: UPOS (16 etiquetas), LEMMA (252 reglas de edición que combinan cambio de caja, recorte de caracteres finales y sufijo añadido), FEATS (174 conjuntos completos de rasgos morfológicos), DEPREL (44 etiquetas) y HEAD (clasificación sobre la posición absoluta de la palabra padre, con 200 clases donde 0 indica la raíz y 1..199 el índice de la palabra). La predicción se toma en la posición del primer subtoken de cada palabra.

El entrenamiento se realizó sobre el corpus Porttinari-base (8.418 frases, split de la disertación), con las anotaciones de LEMMA y FEATS alineadas frase a frase desde UD_Portuguese-Porttinari r2.18. La búsqueda de hiperparámetros empleó entrenamiento más validación, y el modelo final se reentrenó sobre el conjunto completo. La innovación destacable es la decodificación seleccionable en inferencia: greedy, Eisner (árbol proyectivo) o MST/Chu-Liu-Edmonds (árbol no proyectivo), lo que permite adaptar el equilibrio entre velocidad y precisión estructural sin reentrenar.

## Capacidades

- Etiquetado UPOS (part-of-speech universal) por palabra.
- Lematización mediante clasificación sobre 252 reglas de edición.
- Etiquetado morfológico completo (FEATS) con 174 conjuntos de rasgos.
- Análisis de dependencias sintácticas (HEAD y DEPREL) con salida en árbol.
- Tres modos de decodificación de árbol: greedy, Eisner y MST.
- Exportación directa a formato CoNLL-U mediante el método `to_conllu`.
- Ejecución en navegador mediante ONNX Runtime Web (WebGPU o WebAssembly).
- Procesamiento por lotes de listas de frases ya tokenizadas.
- No soporta tool calling, agentes, visión, audio ni generación de texto libre.

## Casos de uso

- Anotación automática de corpus lingüísticos: el modelo genera árboles CoNLL-U completos listos para entrenar o evaluar otros sistemas de PLN en portugués, con la ventaja de producir UPOS, lema, FEATS y dependencias en una sola pasada.
- Preprocesamiento para pipelines de extracción de información: la estructura de dependencias y los rasgos morfológicos permiten identificar sujetos, objetos y modificadores en textos portugueses antes de aplicar modelos de extracción de relaciones o entidades.
- Análisis gramatical en herramientas educativas: la salida CoNLL-U con etiquetas UPOS y DEPREL facilita mostrar la estructura sintáctica de una frase a estudiantes de portugués.
- Búsqueda lingüística y concordancers: al disponer de lematización y rasgos morfológicos, se pueden construir índices que permitan consultas por lema, tiempo verbal o función sintáctica sobre corpus textuales.
- Procesamiento en el navegador sin servidor: la exportación ONNX fp16 (209 MB) permite integrar el parser en aplicaciones web que analicen frases en el cliente, sin enviar datos a un backend, útil para herramientas de escritura o edición.
- Normalización y preprocesamiento para TTS o traducción: la lematización y el etiquetado morfológico sirven para desambiguar formas verbales y concordancia antes de alimentar otros sistemas.
- Evaluación comparativa de parsers: al ofrecer tres modos de decodificación y métricas oficiales CoNLL 2018, sirve como referencia para comparar implementaciones de parsing en portugués.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el test de Porttinari-base (1.683 frases, 33.580 palabras), con decodificación Eisner:

| Metrica | Valor |
|---|---|
| UPOS accuracy | 99,20 |
| LEMMA accuracy | 98,96 |
| FEATS accuracy | 98,90 |
| UAS (Eisner) | 94,18 |
| LAS (Eisner) | 92,77 |

Resultados por estrategia de decodificación:

| Decodificacion | UPOS | LEMMA | FEATS | UAS | LAS |
|---|---|---|---|---|---|
| Gulosa | 99,20 | 98,96 | 98,90 | 92,76 | 91,41 |
| Eisner | 99,20 | 98,96 | 98,90 | 94,18 | 92,77 |
| MST | 99,20 | 98,96 | 98,90 | 93,34 | 91,95 |

Evaluación oficial CoNLL 2018 sobre la salida MST: UFeats 98,95 · AllTags 98,57 · Lemmas 98,96 · UAS 93,34 · LAS 92,11 · CLAS 89,47 · MLAS 86,55 · BLEX 87,94.

Comparativa dentro de la familia HubParser (test, decodificación Eisner; MLAS evaluado con CoNLL 2018 sobre salida MST):

| Modelo | UPOS | LEMMA | FEATS | UAS | LAS | MLAS |
|---|---|---|---|---|---|---|
| HubParser-Base-L (este) | 99,20 | 98,96 | 98,90 | 94,18 | 92,77 | 86,55 |
| HubParser-Base-B | 99,33 | 99,11 | 99,07 | 96,96 | 95,94 | 92,12 |
| HubParser-Large-L | 99,28 | 99,00 | 99,01 | 95,15 | 93,79 | 88,14 |
| HubParser-Large-B | 99,38 | 99,09 | 99,10 | 97,20 | 96,16 | 92,69 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,5 GB (109 M parámetros); en fp16 aproximadamente 0,25 GB.
- Cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU para lotes pequeños.
- La versión ONNX fp16 ocupa 209 MB y puede ejecutarse en el navegador con WebGPU o WebAssembly.
- Despliegue recomendado: Transformers con `trust_remote_code=True`; para la variante web, ONNX Runtime Web.
- No se documentan latencia ni throughput concretos en la información disponible.
- El límite de 512 tokens y el procesamiento frase a frase en ONNX implican que el rendimiento depende del tamaño de lote y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | LAS (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HubParser-Base-L | 109,4 M | 512 | 92,77 | MIT | Hugging Face, ONNX |
| HubParser-Base-B | no disponible | 512 | 95,94 | MIT | Hugging Face |
| HubParser-Large-L | no disponible | 512 | 93,79 | MIT | Hugging Face |
| HubParser-Large-B | no disponible | 512 | 96,16 | MIT | Hugging Face |

Dentro de la misma familia, el cabezal biaffine (B) supera al lineal (L) en LAS con el mismo encoder, y el encoder Large mejora al Base. Frente a herramientas genéricas de Universal Dependencies para portugués, no se dispone en la información proporcionada de comparaciones directas.

## Limitaciones y advertencias

- Solo soporta portugués brasileño; no se ha validado en otras variantes del portugués ni en otros idiomas.
- Requiere entrada ya tokenizada en palabras; no incluye tokenizador de palabras ni segmentación.
- Límite de 512 tokens por frase, insuficiente para documentos largos sin segmentación previa.
- La decodificación greedy y MST obtienen peor UAS/LAS que Eisner; la elección del modo afecta a la calidad estructural.
- Los resultados de benchmarks están declarados por el autor y no verificados de forma independiente (`verified: false`).
- Riesgo de errores en construcciones no proyectivas o en fenómenos poco representados en Porttinari-base.
- No se documentan sesgos específicos ni análisis de robustez ante texto ruidoso o dominios distintos al corpus de entrenamiento.
- La licencia MIT permite uso comercial, pero conviene revisar las condiciones del modelo base BERTimbau y del corpus Porttinari.
- El uso requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guilhermedallm4/HubParser-Base-L
- Modelo base BERTimbau: https://huggingface.co/neuralmind/bert-base-portuguese-cased
- HubParser-Base-B: https://huggingface.co/guilhermedallm4/HubParser-Base-B
- HubParser-Large-L: https://huggingface.co/guilhermedallm4/HubParser-Large-L
- HubParser-Large-B: https://huggingface.co/guilhermedallm4/HubParser-Large-B
- Demo en el navegador (Space): https://huggingface.co/spaces/guilhermedallm4/HubParser
- Documentación de ONNX Runtime Web: https://onnxruntime.ai/docs/tutorials/web/
