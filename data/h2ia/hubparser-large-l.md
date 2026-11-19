# H2IA/HubParser-Large-L

## Resumen

HubParser-Large-L es un modelo de análisis sintáctico y morfológico completo para portugués brasileño, desarrollado por H2IA (Guilherme Dallman Lima, PPGC/UFPel) como parte de su disertación de máster en 2026. Se trata de un parser de Universal Dependencies que, a partir de frases ya tokenizadas en palabras, predice de forma conjunta la etiqueta POS universal (UPOS), el lema, los rasgos morfológicos (FEATS), la cabeza sintáctica (HEAD) y la relación de dependencia (DEPREL). Resuelve el problema clásico de la anotación lingüística automática en portugués, ofreciendo una alternativa especializada frente a parsers multilingües genéricos.

Arquitectura basada en el encoder BERTimbau Large (24 capas, 335 M de parámetros) con un cabezote lineal que implementa cinco clasificadores independientes por subtoken. El modelo se entrenó sobre el corpus Porttinari-base y se distribuye bajo licencia MIT, lo que facilita su integración en pipelines de PLN comerciales y de investigación. Su relevancia actual radica en la combinación de precisión alta (LAS de 93,79 en decodificación Eisner) con un formato de despliegue ligero, incluyendo una exportación ONNX en fp16 que permite ejecución íntegra en el navegador.

Es un modelo de un solo idioma (portugués), orientado a tareas de extracción de características y etiquetado de tokens, no a generación de texto. Su pipeline es `token-classification` y requiere `trust_remote_code=True` por el uso de una clase propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT) con cabezote lineal multi-tarea |
| Parámetros totales | 335.099.566 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (límite del encoder BERT; entrada sin padding, una frase por vez) |
| Tipos de cuantización | ONNX fp16 (639 MB); no se documentan otras cuantizaciones |
| Idiomas soportados | Portugués (pt), variante brasileña |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch) y ONNX (fp16) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer encoder clásica: BERTimbau Large como extractor de características (24 capas, 335 M de parámetros) y un cabezote lineal que emite cinco clasificaciones por subtoken. HEAD se modela como una clasificación sobre la posición absoluta de la palabra padre (0 = raíz, 1..199 = índice de palabra). LEMMA se clasifica sobre 252 reglas de edición (mayúsculas, caracteres truncados al final y sufijo añadido). FEATS se clasifica sobre 174 conjuntos completos de rasgos morfológicos. La decodificación puede ser gulosa, Eisner (árbol proyectivo) o MST/Chu-Liu-Edmonds (árbol no proyectivo), seleccionable en inferencia.

El entrenamiento se realizó sobre Porttinari-base (8.418 frases, split de la disertación), con LEMMA y FEATS alineados frase a frase desde UD_Portuguese-Porttinari r2.18. El objetivo es la suma de las entropías cruzadas de las cinco tareas. La búsqueda de hiperparámetros usó entrenamiento más validación, y el modelo final se entrenó sobre el conjunto de entrenamiento. No se documenta uso de RLHF ni DPO, dado que no es un modelo generativo. La innovación técnica destacable es la exportación ONNX fp16 con una discrepancia máxima de 0,009 puntos porcentuales respecto al modelo PyTorch en el test completo de Porttinari.

## Capacidades

- Análisis sintáctico completo de Universal Dependencies: predicción conjunta de UPOS, LEMMA, FEATS, HEAD y DEPREL.
- Etiquetado POS universal (UPOS) con 16 etiquetas.
- Lematización mediante clasificación sobre 252 reglas de edición.
- Etiquetado morfológico (FEATS) con 174 conjuntos de rasgos.
- Análisis de dependencias con tres modos de decodificación: gulosa, Eisner (proyectiva) y MST (no proyectiva).
- Salida en formato CoNLL-U mediante el método `to_conllu`.
- Ejecución en navegador vía ONNX Runtime Web (WebGPU o WebAssembly).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de extracción, no generativo.
- Capacidad multilingüe limitada al portugués brasileño.

## Casos de uso

- Anotación lingüística de corpus: el modelo genera árboles de dependencias completos en formato CoNLL-U, adecuado para construir corpus anotados con Universal Dependencies en portugués sin intervención manual.
- Preprocesamiento para PLN downstream: la salida UPOS, LEMMA y DEPREL alimenta pipelines de extracción de información, resolución de correferencia o análisis de sentimiento que requieren estructura sintáctica.
- Lematización en motores de búsqueda: la clasificación sobre 252 reglas de edición permite normalizar términos en índices de búsqueda en portugués con alta precisión (99,00 de accuracy en LEMMA).
- Herramientas educativas de gramática: la salida CoNLL-U con etiquetas morfológicas detalladas sirve para construir correctores o asistentes gramaticales que expliquen la estructura de una oración.
- Análisis de dependencias en el navegador: la exportación ONNX fp16 permite desplegar el parser en aplicaciones web sin backend, útil para demos interactivas o herramientas de anotación cliente-side.
- Investigación en lingüística computacional: el modelo forma parte de una familia con cuatro variantes (Base/Large, cabezote Linear/Biaffine) que permite comparar el efecto del tamaño del encoder y del tipo de cabezote bajo un protocolo común.
- Extracción de relaciones sintácticas en documentos: la predicción de HEAD y DEPREL facilita identificar sujetos, objetos y modificadores en textos portugueses para tareas de minería de opiniones.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el test de Porttinari-base (1.683 frases, 33.580 palabras), decodificación Eisner salvo indicación:

| Métrica | Valor |
|---|---|
| UPOS accuracy | 99,28 |
| LEMMA accuracy | 99,00 |
| FEATS accuracy | 99,01 |
| UAS (Eisner) | 95,15 |
| LAS (Eisner) | 93,79 |

Resultados por tipo de decodificación:

| Decodificación | UPOS | LEMMA | FEATS | UAS | LAS |
|---|---|---|---|---|---|
| Gulosa | 99,28 | 99,00 | 99,01 | 93,88 | 92,59 |
| Eisner | 99,28 | 99,00 | 99,01 | 95,15 | 93,79 |
| MST | 99,28 | 99,00 | 99,01 | 94,42 | 93,10 |

Evaluación oficial CoNLL 2018 sobre la salida MST: UFeats 99,05; AllTags 98,71; Lemmas 99,00; UAS 94,42; LAS 93,23; CLAS 90,71; MLAS 88,14; BLEX 89,20.

Comparativa dentro de la familia HubParser (test, decodificación Eisner, MLAS sobre salida MST):

| Modelo | UPOS | LEMMA | FEATS | UAS | LAS | MLAS |
|---|---|---|---|---|---|---|
| HubParser-Base-L | 99,20 | 98,96 | 98,90 | 94,18 | 92,77 | 86,55 |
| HubParser-Base-B | 99,33 | 99,11 | 99,07 | 96,96 | 95,94 | 92,12 |
| HubParser-Large-L (este) | 99,28 | 99,00 | 99,01 | 95,15 | 93,79 | 88,14 |
| HubParser-Large-B | 99,38 | 99,09 | 99,10 | 97,20 | 96,16 | 92,69 |

## Requisitos de hardware

- VRAM estimada para inferencia en PyTorch fp32: aproximadamente 1,3 GB para los pesos (335 M de parámetros) más memoria de activaciones, que depende de la longitud de la frase (máximo 512 tokens).
- VRAM estimada en ONNX fp16: aproximadamente 639 MB para los pesos, más activaciones.
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM para fp32; una RTX 3060 o superior es suficiente. Para lotes grandes, A100 o H100 no aportan ventaja significativa dado el tamaño reducido del modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU con 4 GB o más (GTX 1650, RTX 3050, RTX 4090, etc.).
- Opciones de despliegue: PyTorch con `transformers` (requiere `trust_remote_code=True`); ONNX Runtime Web para navegador (WebGPU o WebAssembly); ONNX Runtime nativo para servidor.
- Latencia y throughput: no disponibles en la información proporcionada. El tamaño reducido y la ejecución en fp16 sugieren latencias bajas, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | LAS (Eisner) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HubParser-Large-L | 335 M | 512 | 93,79 | MIT | Hugging Face |
| HubParser-Large-B | 335 M | 512 | 96,16 | MIT | Hugging Face |
| HubParser-Base-B | ~110 M (no confirmado) | 512 | 95,94 | MIT | Hugging Face |
| HubParser-Base-L | ~110 M (no confirmado) | 512 | 92,77 | MIT | Hugging Face |

No se dispone de comparación con parsers multilingües externos (por ejemplo, Stanza o UDPipe) en la información proporcionada. Dentro de la familia, el cabezote Biaffine (B) supera al Lineal (L) en LAS con el mismo encoder, y el encoder Large mejora al Base con el mismo cabezote.

## Limitaciones y advertencias

- Modelo especializado en portugués brasileño: no soporta otros idiomas ni variantes del portugués no representadas en Porttinari.
- Requiere entrada ya tokenizada en palabras (columna FORM de CoNLL-U); no realiza tokenización desde texto crudo.
- Límite de 512 tokens por frase, incluyendo [CLS] y [SEP]; frases más largas deben segmentarse.
- No es un modelo generativo: no produce texto libre, no soporta tool calling ni razonamiento multi-paso.
- Riesgo de error en estructuras sintácticas complejas o no proyectivas; la decodificación Eisner asume proyectividad, y MST es preferible para árboles no proyectivos.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en el model-index).
- La licencia MIT permite uso comercial, pero el modelo base BERTimbau Large conserva su propia licencia, que debe verificarse por separado.
- El uso requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; conviene auditar la clase antes de desplegar en producción.
- No se documentan sesgos específicos ni evaluaciones de robustez fuera del corpus Porttinari.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/H2IA/HubParser-Large-L
- Modelo base BERTimbau Large: https://huggingface.co/neuralmind/bert-large-portuguese-cased
- HubParser-Base-L: https://huggingface.co/H2IA/HubParser-Base-L
- HubParser-Base-B: https://huggingface.co/H2IA/HubParser-Base-B
- HubParser-Large-B: https://huggingface.co/H2IA/HubParser-Large-B
- Space de demostración: https://huggingface.co/spaces/H2IA/HubParser
- Documentación de ONNX Runtime Web: https://onnxruntime.ai/docs/tutorials/web/
- Corpus UD_Portuguese-Porttinari r2.18: no disponible en la información proporcionada
- Disertación HubParser (Guilherme Dallman Lima, PPGC/UFPel, 2026): no disponible enlace directo en la información proporcionada
