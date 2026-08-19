# promptshield/minuscule

## Resumen

`promptshield/minuscule` es un modelo de reconocimiento de entidades nombradas (NER) basado en BERT, diseñado para ejecución en el navegador. Se trata de una poda de vocabulario del modelo `Xenova/bert-base-multilingual-cased-ner-hrl`, que a su vez es la exportación ONNX cuantizada a int8 del fine-tune de `Davlan/bert-base-multilingual-cased-ner-hrl`. El objetivo es reducir el tamaño de descarga para despliegues web sin servidor: elimina los tokens de escrituras no latinas (cirílico, CJK, árabe, etc.) del vocabulario de 119.547 tokens, dejándolo en 68.875, lo que reduce el archivo de 178.5 MB a 139.6 MB (−21.8%) sin tocar ningún peso del encoder ni re-cuantizar.

La poda es exacta, no aproximada: como el embedding está cuantizado per-tensor y WordPiece usa coincidencia por el fragmento más largo, la salida es idéntica a la del modelo original para los idiomas de escritura latina conservados. El modelo mantiene las etiquetas `PER`, `ORG`, `LOC` y `DATE` con etiquetas `B-`/`I-`, y está pensado para aplicaciones de anonimización de documentos que se ejecutan íntegramente en el cliente. Fue creado por promptShield, una empresa canadiense que desarrolla un anonimizador offline para el navegador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base multilingual cased (encoder transformer) |
| Parametros totales | no disponible (tamaño de archivo 139.6 MB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (estándar de BERT base: 512 tokens) |
| Tipos de cuantizacion | int8 (ONNX) |
| Idiomas soportados | de, en, es, fr, it, lv, nl, pt y otros de escritura latina |
| Licencia | AFL-3.0 |
| Formato de pesos | ONNX (int8) |

## Arquitectura y entrenamiento

El modelo es un BERT base multilingual cased (12 capas, 768 dimensiones ocultas, 12 cabezas de atención) fine-tuneado para clasificación de tokens NER por David Adelani. Posteriormente, Joshua Lochner lo exportó a ONNX y lo cuantizó a int8. La contribución de `promptshield/minuscule` es exclusivamente de empaquetado: se eliminan las filas del embedding correspondientes a tokens de escrituras no latinas (cirílico, CJK, árabe, hangul, hebreo, devanagari, griego, armenio y tailandés). La poda es exacta porque el embedding está cuantizado per-tensor (escala y punto cero compartidos) y se lee mediante una operación `Gather`; seleccionar un subconjunto de filas preserva tanto los valores int8 como su descuantización. Además, WordPiece es de coincidencia por el fragmento más largo, por lo que la segmentación de texto latino no cambia al eliminar piezas inalcanzables. No hubo reentrenamiento ni ajuste de pesos; el modelo hereda el entrenamiento del fine-tune original, cuyos datasets no están declarados en la tarjeta del modelo aguas arriba.

## Capacidades

- Reconocimiento de entidades nombradas (NER) con etiquetas `PER`, `ORG`, `LOC` y `DATE`, usando etiquetas `B-`/`I-`.
- Soporte multilingüe para lenguas de escritura latina: alemán, inglés, español, francés, italiano, letón, neerlandés y portugués, además de cualquier otro idioma latino que el modelo base manejara.
- Ejecución en el navegador mediante `transformers.js` con dtype `q8`, y también en `onnxruntime` directamente.
- Compatible con la estrategia de agregación `simple` para agrupar entidades de múltiples tokens.
- No tiene capacidades de generación de texto, razonamiento ni tool calling; es exclusivamente un clasificador de tokens.

## Casos de uso

- Anonimización de documentos en el navegador: el modelo permite detectar nombres, organizaciones, lugares y fechas en documentos legales o financieros sin enviar datos a un servidor, garantizando privacidad total.
- Extracción de entidades en aplicaciones web progresivas: al ejecutarse en el cliente, reduce la latencia y elimina costes de infraestructura para tareas de NER en formularios o editores.
- Procesamiento de historiales médicos en múltiples idiomas: puede identificar entidades en informes clínicos en francés, español o alemán, ayudando a cumplir normativas de protección de datos.
- Clasificación de contratos y acuerdos: extracción automática de partes contratantes, sedes sociales y fechas de vigencia en documentos legales multilingües.
- Filtrado de información sensible en soporte al cliente: detección de nombres y datos personales en conversaciones de chat antes de almacenarlas o enviarlas a terceros.
- Análisis de noticias y redes sociales: identificación de personas, organizaciones y lugares en textos cortos en varios idiomas, con la ventaja de no depender de una conexión a internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la informacion disponible, dado que se trata de un modelo de clasificación de tokens y no de generación. La model card incluye una verificación de equivalencia con el modelo original `Xenova/bert-base-multilingual-cased-ner-hrl`, comparando logits crudos sobre 77 documentos sintéticos en 7 idiomas:

| Metrica | Valor |
|---|---|
| Documentos comparados | 77 |
| Entidades comparadas | 2.219 |
| Diferencias de segmentacion | 0 |
| Diferencias de entidades | 0 |
| Delta maximo de logits | 0.0000000000 |

Esta verificación demuestra que la poda no introduce ninguna desviación para los idiomas conservados, pero no constituye una evaluación de calidad del NER en sí.

## Requisitos de hardware

- Inferencia en CPU sin GPU: el modelo pesa 139.6 MB y puede ejecutarse en cualquier ordenador moderno; es adecuado para dispositivos móviles y navegadores.
- VRAM: no requiere VRAM dedicada si se ejecuta en CPU; en GPU, cabría en cualquier tarjeta con más de 1 GB de memoria.
- GPUs recomendadas: no es necesario; cualquier GPU con soporte ONNX puede acelerar la inferencia, pero el modelo es lo bastante pequeño para CPU.
- Despliegue: compatible con `transformers.js`, `onnxruntime` y, en principio, con `onnxruntime-web` para navegador.
- Latencia: no se proporcionan cifras oficiales; en CPU se esperan tiempos de inferencia del orden de decenas de milisegundos por frase corta, dado el tamaño del modelo.

## Comparativa con modelos similares

| Modelo | Tamaño | Vocabulario | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| promptshield/minuscule | 139.6 MB | 68.875 | Latinos (8+ idiomas) | AFL-3.0 | ONNX int8 |
| Xenova/bert-base-multilingual-cased-ner-hrl | 178.5 MB | 119.547 | 104 idiomas | AFL-3.0 | ONNX int8 |
| Davlan/bert-base-multilingual-cased-ner-hrl | ~178M params | 119.547 | 104 idiomas | AFL-3.0 | PyTorch |

La diferencia principal con el modelo original es el tamaño de descarga (−21.8%) a costa de perder soporte para árabe y chino. Para despliegues que solo necesitan lenguas latinas, `minuscule` es idéntico en salida y más eficiente en ancho de banda.

## Limitaciones y advertencias

- Solo soporta escritura latina: cualquier texto en árabe, chino u otras escrituras eliminadas se degrada a `[UNK]`, produciendo resultados incorrectos en lugar de ligeramente peores.
- La verificación de equivalencia no cubre el letón: la model card indica que el corpus de prueba no incluye este idioma, aunque el argumento teórico es el mismo.
- Los documentos de verificación son sintéticos, no reales; se recomienda validar con un corpus propio antes de usarlo en producción.
- Licencia AFL-3.0: es una licencia de código abierto con condiciones específicas (atribución, no uso para fines militares, etc.); debe revisarse antes de un uso comercial.
- No se declaran datasets de entrenamiento en la tarjeta original; si se requieren requisitos de procedencia de datos, hay que contactar con los autores originales.
- El modelo no tiene capacidad de generación ni razonamiento; solo clasificación de tokens.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/promptshield/minuscule
- Modelo base (Xenova, ONNX int8): https://huggingface.co/Xenova/bert-base-multilingual-cased-ner-hrl
- Fine-tune original (Davlan): https://huggingface.co/Davlan/bert-base-multilingual-cased-ner-hrl
- Modelo base BERT multilingual cased: https://huggingface.co/google-bert/bert-base-multilingual-cased
- Sitio de promptShield: https://promptshield.ca
