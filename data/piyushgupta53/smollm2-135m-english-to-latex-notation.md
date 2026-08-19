# piyushgupta53/smollm2-135m-english-to-latex-notation

## Resumen

El modelo `piyushgupta53/smollm2-135m-english-to-latex-notation` es un modelo de lenguaje compacto de 135 millones de parámetros, desarrollado por el usuario piyushgupta53, especializado en convertir descripciones en inglés de notación matemática en expresiones LaTeX. Se trata de un modelo fusionado (merged) que combina el modelo base `HuggingFaceTB/SmolLM2-135M-Instruct` con un adaptador de tipo rsLoRA de rango 32, entrenado mediante fine-tuning supervisado (SFT) sobre un dataset propio de pares inglés-LaTeX.

El modelo resuelve un problema específico: dado un enunciado en inglés que describe una expresión matemática, genera exactamente una expresión LaTeX válida, sin explicaciones ni texto adicional. No está diseñado para resolver, calcular, demostrar o explicar matemáticas, sino únicamente para transcribir notación. Su relevancia radica en su tamaño reducido, que permite ejecutarlo en dispositivos con recursos limitados, y en su enfoque de tarea única, que lo hace útil como componente en pipelines de generación de documentos científicos o educativos.

La arquitectura es un transformer decoder estándar (la misma que la familia SmolLM2), con una ventana de contexto de 8K tokens heredada del modelo base. El modelo está disponible bajo licencia Apache-2.0 y se distribuye en formato safetensors, siendo compatible con la biblioteca Transformers y con herramientas de inferencia como text-generation-inference.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (SmolLM2) |
| Parametros totales | 134.515.008 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 8K tokens (heredada del modelo base SmolLM2) |
| Tipos de cuantizacion | No especificado (no disponible) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura SmolLM2, un transformer decoder de 135 millones de parámetros entrenado originalmente por HuggingFace sobre 2 billones de tokens con una mezcla de datasets como FineWeb-Edu, DCLM y The Stack. La versión Instruct del modelo base fue afinada mediante instrucciones, y sobre ella se aplicó un adaptador de tipo rsLoRA de rango 32 mediante fine-tuning supervisado (SFT) con respuesta completa, utilizando un dataset propio de 22.460 filas de entrenamiento y 2.496 de validación.

El entrenamiento se realizó durante 3 épocas, alcanzando un 95,51% de precisión exacta normalizada en el conjunto de validación. Posteriormente, el adaptador se fusionó con el modelo base mediante la función `merge_and_unload` de PEFT, usando precisión float32 con TF32 desactivado para garantizar reproducibilidad. El modelo resultante es un único artefacto que no requiere PEFT ni el modelo base por separado para la inferencia.

## Capacidades

- Generacion de expresiones LaTeX a partir de descripciones en ingles de notacion matematica.
- Soporte de formato conversacional mediante chat template (system, user, assistant).
- Generacion determinista (greedy decoding) para obtener una unica salida canónica.
- Capacidad para producir expresiones como fracciones, derivadas, potencias, indices, etc., dentro de su dominio de entrenamiento.
- No incluye capacidades de tool calling, agentes, vision ni audio.
- No esta disenado para razonamiento matematico, calculo o explicaciones; solo transcripcion de notacion.

## Casos de uso

- Generacion automatica de formulas LaTeX para documentacion tecnica: un desarrollador puede escribir "la integral de x al cuadrado" y obtener `\int x^{2}`, acelerando la redaccion de manuales o articulos.
- Asistencia en la escritura de papers academicos: investigadores pueden describir notacion compleja en lenguaje natural y recibir el codigo LaTeX listo para insertar en sus documentos.
- Preprocesamiento en pipelines de generacion de contenido educativo: se puede integrar en sistemas que convierten texto plano a materiales de estudio con formulas matematicas.
- Integracion en editores de texto con soporte LaTeX: como plugin o comando para transformar descripciones en expresiones, reduciendo errores de sintaxis.
- Generacion de ejemplos para testing de herramientas LaTeX: permite crear casos de prueba automaticos a partir de descripciones en ingles.
- Accesibilidad: ayuda a personas que no dominan LaTeX a generar notacion matematica correcta a partir de descripciones verbales, facilitando la inclusion de formulas en contenido digital.

## Benchmarks y rendimiento

El autor proporciona una evaluacion propia con dos conjuntos: un benchmark held-out de 200 filas y un diagnostico de distribucion-gap de 200 filas. Los resultados son:

| Evaluacion | Filas | Exactitud normalizada | Compilacion | Paso semantico completo |
|---|---:|---:|---:|---:|
| Benchmark held-out | 200 | 44 (22,0%) | 197 (98,5%) | 131 (65,5%) |
| Diagnostico de distribucion-gap | 200 | 116 (58,0%) | 198 (99,0%) | 134 (67,0%) |

En el diagnostico estructural, el modelo obtuvo 73/100 en cambios de redaccion y 61/100 en estructuras novedosas. No se han publicado resultados en benchmarks estandar como MMLU o HumanEval, ya que el modelo esta especializado en una tarea unica.

## Requisitos de hardware

- Al tratarse de un modelo de 135 millones de parametros, la inferencia es viable en CPU con bajo consumo de memoria (menos de 1 GB en FP32).
- En GPU, cabe en cualquier tarjeta moderna, incluidas las de gama de entrada como NVIDIA GTX 1650 o superiores; incluso en hardware integrado.
- VRAM estimada: inferior a 1 GB en precision float32; con cuantizacion podria reducirse a menos de 500 MB, aunque no se han publicado cuantizaciones oficiales.
- Opciones de despliegue: compatible con Transformers, text-generation-inference, y puede ejecutarse en entornos como vLLM o llama.cpp si se convierte a GGUF (no incluido por defecto).
- Latencia: muy baja, del orden de milisegundos en GPU y decenas de milisegundos en CPU, adecuada para aplicaciones interactivas.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos directamente comparables en la tarea de conversion ingles-LaTeX con el mismo tamano. Existen modelos genericos mas grandes (por ejemplo, GPT-4 o Llama 3) que pueden realizar esta tarea de forma incidental, pero no estan especializados ni optimizados para ella. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Es un modelo muy pequeño (135M) y no es fiable para uso no revisado en entornos de alto riesgo.
- Falla en estructuras complejas o poco frecuentes: en el diagnostico estructural obtuvo 0/10 en matrices aumentadas y 0/10 en expresiones por tramos indexadas con rama "otherwise".
- Puede producir expresiones LaTeX sintacticamente validas pero semanticamente incorrectas; siempre hay que validar tanto la sintaxis como el significado.
- La salida puede diferir textualmente de una referencia canonica aunque sea correcta.
- Limitado al idioma ingles; no soporta descripciones en otros idiomas.
- No esta disenado para resolver, calcular, demostrar o explicar matematicas; solo para transcribir notacion.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base SmolLM2 tiene sus propias condiciones (tambien Apache-2.0), por lo que no hay restricciones adicionales conocidas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/piyushgupta53/smollm2-135m-english-to-latex-notation)
- [Dataset de entrenamiento](https://huggingface.co/datasets/piyushgupta53/english-to-latex-notation-sft)
- [Adaptador LoRA](https://huggingface.co/piyushgupta53/smollm2-135m-english-to-latex-notation-lora)
- [Modelo base SmolLM2-135M](https://huggingface.co/HuggingFaceTB/SmolLM2-135M)
