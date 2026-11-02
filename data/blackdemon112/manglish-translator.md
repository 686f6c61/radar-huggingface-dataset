# blackdemon112/manglish-translator

## Resumen

Manglish-ByT5 es un modelo de traducción y normalización de texto centrado en *Manglish*, la variante romanizada y habitualmente ruidosa del malayalam que se emplea en chats y redes sociales. Lo desarrolla el usuario blackdemon112 y se distribuye en el repositorio `blackdemon112/manglish-translator`, que en realidad contiene dos sistemas: un ByT5-base afinado con LoRA (adaptador fusionado, ~1,2 GB) y un transformer de caracteres de 6,5 M de parámetros entrenado desde cero (Manglish-Tiny, 26 MB en PyTorch y ~7 MB en ONNX int8). El modelo resuelve dos tareas mediante prefijos de instrucción: `clean:` (Manglish ruidoso a Manglish limpio) y `ml:` (Manglish a escritura malayalam).

La relevancia práctica está en el tratamiento del ruido típico de la escritura informal: alargamientos vocálicos (`njaaan`), supresión de vocales, variantes fonéticas y errores de tecleo. Frente a la transliteración por reglas, que obtiene un CER del 38,20 % desde texto limpio y del 66,43 % desde texto ruidoso, el modelo baja a 8,74 % y 12,29 % respectivamente con ByT5. La arquitectura es un encoder-decoder ByT5 (operando sobre bytes UTF-8, sin tokenizador subword), con contexto de entrada limitado en la práctica a frases cortas de hasta 120 caracteres según las propias limitaciones declaradas.

El proyecto se publica con licencia CC BY-SA 4.0, heredada de que los datos de entrenamiento incluyen material de Dakshina bajo esa misma licencia. Es un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, pensado para preprocesado lingüístico y normalización de corpus más que para generación abierta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ByT5 (encoder-decoder transformer sobre bytes UTF-8) con LoRA fusionado; variante Tiny: transformer de caracteres entrenado desde cero |
| Parametros totales | ~1,2 GB de pesos en la variante ByT5 (no se indica el número exacto de parámetros; el base es google/byt5-base); variante Tiny: 6,5 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como ventana formal; entrenado con frases de hasta 120 caracteres y generación con `max_length=384` |
| Tipos de cuantizacion | int8 ONNX en la variante Tiny (~7 MB); no se documentan cuantizaciones para la variante ByT5 |
| Idiomas soportados | ml (malayalam), en (inglés); entrada en Manglish (malayalam romanizado) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors (ByT5), PyTorch y ONNX (Tiny); repositorio con tags onnx y safetensors |

## Arquitectura y entrenamiento

La variante principal parte de `google/byt5-base`, un encoder-decoder que trabaja directamente sobre bytes en lugar de tokens subword, lo que le permite modelar grafías ruidosas sin vocabulario fijo. El ajuste se realizó con LoRA y el adaptador se fusionó en los pesos finales, de modo que se carga como un `AutoModelForSeq2SeqLM` estándar. La variante Tiny es un transformer de caracteres de 6,5 M de parámetros entrenado desde cero, orientado a inferencia en CPU y navegador mediante ONNX Runtime. Ambas variantes se controlan con prefijos de tarea (`clean:` y `ml:`).

Los datos de entrenamiento provienen del mismo split empleado en el proyecto para comparar mBART-50, mT5 y ByT5: 18.548 frases de SeLLaI Manglish y Mixed-Code (CC BY 4.0) y de Dakshina romanised Malayalam (CC BY-SA 4.0), con ruido sintético regenerado en cada época; además, 5.792 pares de frases de Dakshina y 8.000 palabras de léxico para la tarea de escritura malayalam. El autor declara que ninguna frase de test se usó en entrenamiento. No se documenta RLHF ni DPO; el entrenamiento es supervisado sobre pares ruido-limpio y romanización-escritura nativa.

## Capacidades

- Normalización de Manglish ruidoso a Manglish limpio mediante el prefijo `clean:` (colapso de alargamientos, corrección de variantes fonéticas y de vocales omitidas).
- Conversión de Manglish a escritura malayalam mediante el prefijo `ml:`, con estilo de Wikipedia según Dakshina.
- Procesamiento por lotes: el ejemplo de la model card usa `padding=True` y `batch_decode` sobre varias entradas.
- Funcionamiento en CPU y navegador con la variante Tiny en ONNX int8.
- Manejo de texto code-mixed malayalam-inglés, ya que el corpus de entrenamiento incluye SeLLaI Mixed-Code.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Normalización de corpus de redes sociales: preprocesar comentarios y tuits en Manglish antes de análisis de sentimiento o topic modeling, usando `clean:` para reducir la variabilidad ortográfica que rompe los diccionarios y los modelos de bolsa de palabras.
- Moderación de contenido en plataformas dirigidas a hablantes de malayalam: convertir el texto romanizado a escritura malayalam con `ml:` para aplicar clasificadores y listas de bloqueo entrenados sobre malayalam nativo.
- Construcción de datasets paralelos: generar pares Manglish-malayalam a partir de texto informal para ampliar corpus de traducción automática, con la ventaja de que el modelo tolera ruido de tecleo que la transliteración por reglas no maneja.
- Transcripción asistida de chats de atención al cliente: limpiar los mensajes del usuario antes de pasarlos a un sistema de intents, de modo que `njaaan naaale varummm` y `njan nale varum` se normalicen a la misma forma.
- Búsqueda y recuperación de información: indexar documentos en escritura malayalam y permitir consultas en Manglish, normalizando la consulta con `ml:` antes de la búsqueda; el CER de 8,74 % desde texto limpio es compatible con recuperación aproximada.
- Despliegue en el navegador o en dispositivos de gama baja: la variante Tiny en ONNX int8 (~7 MB) permite corrección ortográfica en tiempo real en un editor o teclado móvil sin backend.
- Enriquecimiento de léxico y diccionarios: usar las 8.000 palabras de léxico del entrenamiento como base para generar variantes romanizadas y alimentar correctores ortográficos.

## Benchmarks y rendimiento

Tarea combinada de limpieza (`clean:`), CER en porcentaje, menor es mejor:

| Sistema | ALL | dakshina_ml | sellai_manglish | sellai_mixed-code |
|---|---|---|---|---|
| Manglish-ByT5 (ours) | 2,29 | 3,18 | 1,52 | 1,26 |
| Manglish-Tiny (ours) | 2,26 | 3,19 | 1,52 | 1,17 |

Robustez ante distintos tipos de ruido, CER en porcentaje:

| Sistema | base | heavy | extreme | vowel_drop | phonetic | phonetic_plus_base |
|---|---|---|---|---|---|---|
| ours_byt5 | 2,44 | 4,00 | 6,01 | 8,17 | 2,65 | 5,86 |
| ours_tiny | 2,46 | 3,94 | 5,94 | 7,23 | 2,57 | 5,00 |

Manglish a escritura malayalam (CER / chrF):

| Sistema | desde limpio | desde ruidoso |
|---|---|---|
| rule_transliteration | 38,20 / 31,7 | 66,43 / 26,6 |
| ours_byt5 | 8,74 / 79,3 | 12,29 / 73,0 |
| ours_tiny | 7,60 / 82,2 | 11,02 / 75,9 |

Comparaciones pareadas con bootstrap (diferencia de CER, negativo favorece al modelo propio), selección:

| Comparación | Diferencia | IC 95 % |
|---|---|---|
| ours_byt5 - byt5_plusall | -1,26 | -1,44 a -1,08 |
| ours_byt5 - mbart_plusall | -3,67 | -3,86 a -3,46 |
| ours_byt5 - mt5_lr1e-3_plusall | -4,15 | -4,37 a -3,95 |
| ours_byt5 - byt5 | -13,71 | -14,74 a -12,69 |
| ours_byt5 - mbart | -12,63 | -13,00 a -12,31 |
| ours_byt5 - rule_collapse_runs | -8,69 | -8,87 a -8,49 |
| ours_tiny - byt5_plusall | -1,28 | -1,45 a -1,12 |
| ours_tiny - mbart_plusall | -3,70 | -3,89 a -3,52 |
| ours_tiny - mt5_lr1e-3_plusall | -4,18 | -4,40 a -3,96 |
| ours_tiny - rule_collapse_runs | -8,72 | -8,90 a -8,53 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; las métricas son específicas de las tareas del proyecto.

## Requisitos de hardware

- VRAM estimada para ByT5: el repositorio ocupa 1,2 GB en safetensors; en fp32 la inferencia requiere del orden de 2-3 GB de VRAM, y en fp16 aproximadamente 1,5-2 GB, estimación a partir del tamaño de los pesos (no confirmada por el autor).
- GPU recomendadas para ByT5: cualquier GPU con al menos 4 GB de VRAM, como RTX 3050, RTX 4060 o superiores; A100 y H100 no aportan ventaja significativa para un modelo de este tamaño.
- Cabe en GPU de consumo: sí, tanto la variante ByT5 como, con enorme holgura, la Tiny.
- Variante Tiny: 26 MB en PyTorch y ~7 MB en ONNX int8; ejecutable en CPU y en navegador con ONNX Runtime.
- Opciones de despliegue: `transformers` con `AutoModelForSeq2SeqLM` para ByT5; ONNX Runtime para Tiny; el script `src/translate.py` del repositorio del proyecto para la variante Tiny. No se documenta soporte explícito de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Manglish-ByT5 (este) | ~1,2 GB de pesos (base byt5-base) | frases de hasta 120 caracteres | limpieza y transliteración Manglish | CC BY-SA 4.0 | HuggingFace, 0 descargas |
| Manglish-Tiny (este) | 6,5 M | frases cortas | limpieza y transliteración Manglish | CC BY-SA 4.0 | HuggingFace, ONNX |
| google/byt5-base | ~580 M (modelo base) | 1.024 bytes de entrada | texto a texto genérico | Apache 2.0 | HuggingFace |
| mBART-50 | ~610 M | 1.024 tokens | traducción multilingüe | MIT | HuggingFace |
| mT5 | ~580 M (base) | 1.024 tokens | texto a texto multilingüe | Apache 2.0 | HuggingFace |

Los datos comparativos de rendimiento del proyecto sitúan a Manglish-ByT5 con una ventaja de 1,26 puntos de CER sobre el mejor ByT5 ajustado con todos los datos (`byt5_plusall`), 3,67 sobre mBART-50 y 4,15 sobre mT5 con learning rate 1e-3. No se dispone de comparación con otros modelos públicos específicos de Manglish.

## Limitaciones y advertencias

- Salida siempre en minúsculas, lo que puede ser inaceptable en contextos que requieran preservar mayúsculas o nombres propios.
- Entrenado con frases cortas de hasta 120 caracteres; el rendimiento en párrafos largos no está validado.
- El ruido de entrenamiento es sintético, por lo que los errores reales de tecleo pueden distribuirse de forma distinta y degradar el CER fuera del dominio evaluado.
- La salida en escritura malayalam sigue el estilo de Wikipedia de Dakshina, no necesariamente la ortografía preferida por el usuario.
- Licencia CC BY-SA 4.0: obliga a compartir bajo la misma licencia las obras derivadas y exige atribución; conviene revisar la compatibilidad antes de integrarlo en productos propietarios.
- Riesgo de alucinación y de "sobre-normalización": al ser un modelo generativo, puede alterar nombres propios o préstamos del inglés que no deberían tocarse.
- Cobertura limitada a malayalam e inglés; no se documenta comportamiento en otros idiomas ni en mezclas distintas de Manglish.
- Sin descargas ni validación comunitaria: no hay evidencia de uso en producción ni informes independientes de calidad.
- No se documentan sesgos específicos, pero al entrenar sobre corpus de redes sociales y Wikipedia puede heredar sesgos de esas fuentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/blackdemon112/manglish-translator
- Modelo base: https://huggingface.co/google/byt5-base
- Repositorio del proyecto: https://github.com/swyam7980/manglish_dae
