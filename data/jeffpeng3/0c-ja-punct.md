# jeffpeng3/0c-ja-punct

## Resumen

0c-ja-punct es un modelo especializado en la inserción automática de puntuación japonesa, desarrollado por el proyecto 0C para su motor de entrada (IME). Recibe una secuencia de tokens y predice, para cada posición, si debe insertarse `、` (coma), `。` (punto) o `？` (interrogación) después del token correspondiente, sin reescribir, eliminar, fusionar ni reordenar nunca los caracteres de entrada. Esta restricción de "no edición" está verificada de extremo a extremo sobre los ficheros ONNX.

Arquitectura y tamaño son deliberadamente modestos: un transformer encoder de 8 capas, dimensión 512, 8 cabezas y FFN de 1024, con un vocabulario SentencePiece de 32.768 piezas. El total asciende a 33.865.732 parámetros, lo que lo sitúa en la categoría de modelos pequeños desplegables en CPU. Se distribuye en formato ONNX (fp32 e int8) para inferencia con onnxruntime.

Su relevancia práctica radica en el nicho: la puntuación japonesa es ambigua y dependiente del contexto, y los IME necesitan insertarla en tiempo real sobre texto sin puntuar. El modelo se entrenó exclusivamente con corpus japonés de dominio público (CC BY 4.0 y dominio público), sin CC BY-SA, sin Mozc y sin NEologd, bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (D512, 8 capas, 8 cabezas, FFN 1024) |
| Parametros totales | 33.865.732 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 posiciones en la tabla de posiciones; ventana de entrenamiento de 256 tokens; entrada aceptada de 1 a 512 tokens |
| Tipos de cuantizacion | fp32 (`model.onnx`) e int8 dinámica qint8 (`model.int8.onnx`) |
| Idiomas soportados | japonés (ja) |
| Licencia | MIT |
| Formato de pesos | ONNX (onnxruntime); checkpoint PyTorch referenciado para paridad |
| Vocabulario | SentencePiece public-core, 32.768 piezas |
| IDs especiales | `pad=0`, `unk=1`, `bos=2`, `eos=3` |
| Etiquetas de salida | 4: `none`, `comma` (、), `period` (。), `question` (？) |
| Contrato tensorial | `input_ids` int64 `[batch, seq]`, `attention_mask` int64 `[batch, seq]`, `logits` float32 `[batch, seq, 4]` |
| Tamano del repo | 0,2 GB |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de 8 capas con dimensión oculta 512, 8 cabezas de atención y FFN de 1024, sobre un vocabulario SentencePiece de 32.768 piezas. La tarea se formula como clasificación token a token en cuatro clases (ninguna marca, coma, punto, interrogación), con los logits alineados de forma que la marca de la posición `i` se inserta después del token `i` (sin desplazamiento). No hay token BOS; las posiciones van de `0` a `seq-1` y la tabla de posiciones aprendida tiene 512 entradas.

El entrenamiento se realizó exclusivamente sobre el corpus japonés "public-core" del proyecto 0C, compuesto por material CC BY 4.0 y de dominio público, excluyendo explícitamente CC BY-SA, Mozc y NEologd. Los datos se empaquetaron en ventanas de 256 tokens. No se documenta en la información disponible el número total de tokens de entrenamiento ni el uso de RLHF/DPO; la model card describe únicamente la selección sobre validación (el checkpoint reportado corresponde al paso 114.000, no al último paso 116.703). La innovación destacable es la garantía formal de no edición: la decodificación solo concatena cadenas (`surface + mark`), de modo que eliminar las tres marcas recupera exactamente la entrada.

## Capacidades

- Inserción de puntuación japonesa token a token: predice `、`, `。` o `？` tras cada token, o ninguna marca.
- Garantía de no edición: no reescribe, borra, fusiona ni reordena caracteres de entrada; verificado sobre 3.000 documentos retenidos (374.682 tokens) con 0 caracteres modificados y 0 desajustes de superficie.
- Procesamiento por lotes con ejes de batch y secuencia dinámicos (longitud 1 a 512).
- Manejo de entradas largas mediante segmentación en tramos de hasta 255 tokens más `<eos>`, preferiblemente en límites de frase.
- Fuerza la etiqueta `none` en tokens compuestos solo por espacios y en `<eos>`.
- Compatibilidad con CPU mediante onnxruntime (`CPUExecutionProvider`).
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento: es un clasificador de secuencias acotado a la tarea de puntuación.

## Casos de uso

- Preprocesado para IME japonés: integrado en el motor de entrada 0C para insertar puntuación en tiempo real mientras el usuario escribe, gracias a su tamaño reducido (33,8 M de parámetros) y a la inferencia en CPU con onnxruntime.
- Normalización de texto sin puntuar: procesar transcripciones de voz o subtítulos japoneses generados automáticamente, insertando comas y puntos sin alterar el texto original, lo que permite auditar la salida eliminando las marcas.
- Postprocesado de salidas de ASR: añadir puntuación legible a transcripciones crudas segmentando la entrada en tramos de 255 tokens en límites de frase.
- Limpieza de corpus para NLP: puntuar grandes volúmenes de texto japonés de dominio público antes de usarlo en entrenamiento de otros modelos, con la ventaja de que la operación es reversible y no corrupta el texto fuente.
- Herramientas de accesibilidad: mejorar la legibilidad de texto japonés mostrado en pantallas pequeñas o lectores de pantalla insertando pausas y finales de frase.
- Pipelines de edición y publicación: aplicar puntuación consistente a borradores o textos generados por otros sistemas antes de revisión humana, con la garantía de que ningún carácter se modifica.
- Evaluación comparativa de puntuadores: servir como referencia ligera y de licencia permisiva (MIT) frente a sistemas propietarios en experimentos de investigación sobre puntuación japonesa.

## Benchmarks y rendimiento

Resultados de calidad reportados en la model card. Split de validación completo (75.631 ventanas, 18.746.968 tokens puntuados):

| Etiqueta | Soporte | Precision | Recall | F1 |
|---|---:|---:|---:|---:|
| `none` | 17.029.290 | 0,9941 | 0,9762 | 0,9850 |
| `comma` 、 | 1.166.798 | 0,7412 | 0,9166 | 0,8196 |
| `period` 。 | 548.865 | 0,9296 | 0,9796 | 0,9539 |
| `question` ？ | 2.015 | 0,5155 | 0,6610 | 0,5793 |

- macro F1 **0,7843**, exactitud por token **0,9725**, pérdida de validación 0,06783.

Split de test retenido (78.058 ventanas, 19.350.011 tokens):

| Etiqueta | Soporte | Precision | Recall | F1 |
|---|---:|---:|---:|---:|
| `none` | 17.598.516 | 0,9939 | 0,9770 | 0,9854 |
| `comma` 、 | 1.205.558 | 0,7458 | 0,9142 | 0,8215 |
| `period` 。 | 543.456 | 0,9343 | 0,9808 | 0,9570 |
| `question` ？ | 2.481 | 0,5362 | 0,6844 | 0,6013 |

- macro F1 **0,7932**, exactitud por token **0,9732**, pérdida de test 0,06657.

Otras métricas reportadas:

| Metrica | Valor |
|---|---|
| Macro F1 en validación de 2.048 ventanas (checkpoint) | 0,7710 |
| Macro F1 en validación de 2.048 ventanas (último paso 116.703) | 0,7648 |
| Paridad fp32 ONNX vs PyTorch (240 ventanas, 61.440 posiciones) | diferencia máxima de logits 2,38e-5; acuerdo de argmax 100 %; macro F1 idéntico 0,7961 |
| int8 vs PyTorch (mismas 240 ventanas) | diferencia máxima de logits 0,693; acuerdo de argmax 99,881 %; macro F1 0,7851 |
| Verificación de no edición (3.000 documentos, 374.682 tokens) | 0 caracteres modificados, 0 desajustes de superficie, 0 fallos de recuperación de entrada |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 33,8 M de parámetros, el checkpoint fp32 ocupa aproximadamente 135 MB y la versión int8 alrededor de 34 MB, por lo que la inferencia requiere muy poca memoria.
- GPU recomendadas: no se especifican; el modelo está pensado para CPU mediante `CPUExecutionProvider`.
- Cabe holgadamente en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: onnxruntime (CPU o GPU), con los ficheros `model.onnx` (fp32) y `model.int8.onnx`; requiere además el modelo SentencePiece `public_core_ja.model`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos sobre modelos comparables de puntuación japonesa (parámetros, contexto, rendimiento, licencia y disponibilidad). Por tanto, la comparativa se indica como no disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| 0c-ja-punct | 33,8 M | 512 posiciones (ventana de entrenamiento 256) | MIT | ONNX en Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La etiqueta `？` es muy rara en el corpus (0,013 % de las posiciones de entrenamiento), por lo que su F1 es bajo y ruidoso (0,60 en test) en comparación con coma y punto.
- La precisión de la coma es moderada (0,7458 en test): puede insertar comas donde no corresponden con más frecuencia que en el caso del punto.
- La calidad a través de los límites de ventana no se ha medido; se recomienda no cortar dentro de una cláusula corta al segmentar entradas largas.
- La cuantización int8 no es exacta respecto a fp32: diferencia máxima de logits 0,693 y acuerdo de argmax del 99,881 %, con una caída de macro F1 de 0,7961 a 0,7851 en la muestra de paridad.
- El modelo solo soporta japonés y está acotado a la tarea de puntuación; no genera texto, no razona y no admite tool calling ni agentes.
- Riesgo de sesgo heredado del corpus public-core japonés; no se documentan análisis de sesgo específicos.
- Riesgo de alucinación en sentido estricto limitado por la garantía de no edición, pero sí puede producir inserciones de puntuación incorrectas (falsos positivos), especialmente en comas e interrogaciones.
- Licencia MIT: permite uso comercial, pero conviene conservar el aviso de copyright y verificar la procedencia del tokenizador SentencePiece incluido.
- El checkpoint reportado (paso 114.000) no es el último del entrenamiento (paso 116.703); las métricas de la model card corresponden al checkpoint seleccionado en validación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jeffpeng3/0c-ja-punct
