# ElToluene/japanese-punctuation-restoration

## Resumen

Japanese Punctuation Restoration v3 es un modelo de clasificación de tokens basado en BERT cuyo único propósito es insertar los signos de puntuación japoneses `、` (coma) y `。` (punto) en textos que carecen de ellos. Lo desarrolla el usuario independiente ElToluene y parte de `cl-tohoku/bert-base-japanese-v3`, un BERT base adaptado al japonés con 110,6 millones de parámetros. El problema que resuelve es concreto: las transcripciones automáticas de voz (ASR) y muchos flujos de preprocesado producen texto sin puntuar, lo que dificulta su lectura y su posterior procesamiento.

La relevancia del modelo está en su especialización y su tamaño reducido: con 110 millones de parámetros y una licencia Apache 2.0, se puede desplegar en CPU o en el navegador mediante ONNX, algo que modelos generativos de restauración de puntuación no permiten. La versión v3 amplía el conjunto de entrenamiento a 253.591 pares de frases extraídos de Wikipedia japonesa y elimina los signos `？` y `！` del etiquetado para centrarse en los dos signos que realmente puede predecir con fiabilidad.

El modelo no es generativo: es un etiquetador token a token con tres clases (`O`, `、`, `。`) y una ventana máxima de 512 tokens heredada del BERT base. Su punto fuerte medido es el punto final (F1 de 1,0000 en todos los conjuntos de evaluación) y su punto débil es la coma en registro oral, donde la exhaustividad cae al 0,40.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT base (BertForTokenClassification) |
| Parametros totales | 110.618.883 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | int8 dinámica (ONNX); fp32 en safetensors y ONNX |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (fp32 e int8 cuantizado) |

## Arquitectura y entrenamiento

La arquitectura es un BERT base estándar adaptado al japonés (`cl-tohoku/bert-base-japanese-v3`) con una cabeza de clasificación de tokens de tres etiquetas: `O` (sin puntuación), `、` y `。`. No hay mecanismos de atención lineal, decodificación especulativa ni componentes MoE; es un encoder bidireccional clásico que etiqueta cada token de forma independiente condicionado al contexto completo de la secuencia.

El entrenamiento se realizó sobre 253.591 pares de frases construidos a partir de Wikipedia japonesa: se toma la frase original con puntuación, se le elimina la puntuación y se aprende a reconstruirla. Se excluyeron 422 frases que contenían `？` o `！`, quedando 250.169 frases de entrenamiento y 3.000 de evaluación. La configuración fue de 2 épocas, learning rate 3e-5 y batch de 32, sobre dos GPU T4 de Kaggle durante aproximadamente 1 hora y 34 minutos. No se documenta uso de RLHF ni DPO; es entrenamiento supervisado de clasificación de tokens. La versión v2 usaba 27.055 frases y cuatro etiquetas (incluyendo `？` y `！`); la v3 mejora el F1 en Wikipedia nueva de 0,8773 a 0,8954 y en el conjunto estilo ASR de 0,6897 a 0,7797.

## Capacidades

- Restauración de comas `、` y puntos `。` en texto japonés sin puntuar.
- Etiquetado token a token con tres clases (`O`, `、`, `。`), sin generación de texto libre.
- Procesamiento de secuencias de hasta 512 tokens.
- Inferencia en navegador mediante la versión ONNX cuantizada a int8 (unos 111 MB).
- Verificación de equivalencia con PyTorch: la versión ONNX fp32 coincide en 2555/2555 etiquetas y 80/80 frases restauradas; la int8 coincide en el 99,5 % de las etiquetas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- No restaura `？` ni `！`: esos signos quedan fuera del espacio de etiquetas.

## Casos de uso

- Postprocesado de transcripciones ASR: el modelo inserta puntos de frase con fiabilidad prácticamente total (F1 de 1,0000) y comas de forma aproximada; es adecuado como paso de limpieza previo a la publicación de subtítulos o actas, siempre asumiendo que faltará aproximadamente el 60 % de las comas en registro oral.
- Normalización de texto escrito sin puntuar: para corpus de escritura formal (artículos, documentación, correos) el modelo alcanza un F1 global de 0,8954 en Wikipedia no vista, con una exhaustividad de comas del 0,77, suficiente para tareas de preprocesado y publicación.
- Preprocesado para pipelines de NLP en japonés: dividir un texto en frases requiere puntos; este modelo permite segmentar correctamente antes de pasar a un tokenizador o a un modelo de traducción, resumen o análisis sintáctico.
- Inferencia en el navegador o en el edge: la versión ONNX int8 de 111 MB se ejecuta íntegramente en el cliente sin servidor, útil para herramientas de edición de texto que deben funcionar offline y sin enviar datos a terceros.
- Investigación sobre restauración de puntuación: al ser un modelo pequeño, reproducible (1 h 34 min en dos T4) y con licencia Apache 2.0, sirve como línea base para comparar técnicas de etiquetado, aumento de datos o ajuste a dominios específicos.
- Limpieza de datasets históricos o scrapeados: textos extraídos de fuentes que han perdido la puntuación pueden normalizarse por lotes en CPU con un throughput alto dado el tamaño del modelo y la cuantización int8.
- Formateo de subtítulos y transcripciones de vídeo: inserción de puntos de fin de frase para mejorar la legibilidad de subtítulos generados automáticamente, con la salvedad de que las comas serán escasas en registro coloquial.

## Benchmarks y rendimiento

| Conjunto de evaluación | F1 global (P / R) | F1 `、` (P / R) | F1 `。` | Coincidencia exacta por frase |
|---|---|---|---|---|
| Eval de entrenamiento, 3.000 frases (misma distribución) | 0,8851 (0,9040 / 0,8670) | 0,7925 (no desglosado) | 1,0000 | no disponible |
| Wikipedia nueva, 1.500 frases no vistas | 0,8954 (0,9204 / 0,8717) | 0,8055 (0,8483 / 0,7668) | 1,0000 | 65,1 % |
| Estilo ASR y lenguaje oral, 50 frases manuales | 0,7797 (0,9452 / 0,6635) | 0,5412 (0,8519 / 0,3966) | 1,0000 | 38,0 % |

Regla de puntuación declarada por el autor: las posiciones donde la referencia tenía `？` o `！` se excluyen del cómputo y solo se comparan `、` y `。`. No se han publicado comparaciones con otros modelos de restauración de puntuación en la información disponible.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en fp32 para inferencia con batch pequeño (110,6 M de parámetros, unos 440 MB de pesos); la versión ONNX int8 ocupa aproximadamente 111 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el modelo se entrenó en T4 y funciona sin problemas en GTX 1650, RTX 3060, RTX 4090, A100 o H100 sin aprovechar su capacidad.
- Cabe holgadamente en GPU de consumo e incluso en CPU: la inferencia en CPU con ONNX es viable para uso interactivo en el navegador.
- Opciones de despliegue: ONNX Runtime (incluido WebAssembly para navegador), Transformers con PyTorch, y exportación a llama.cpp u Ollama no aplica porque no es un modelo generativo; para servir por HTTP puede envolverse en FastAPI o en un pipeline de clasificación de tokens de Transformers.
- Latencia y throughput: no se han publicado mediciones formales; el autor solo indica que la versión int8 está pensada para la demo en navegador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ElToluene/japanese-punctuation-restoration v3 | 110,6 M | 512 tokens | Clasificación de tokens BERT, 3 etiquetas | Apache 2.0 | Hugging Face, ONNX |
| ElToluene/japanese-punctuation-restoration v2 (versión previa del mismo autor) | no disponible | 512 tokens | Clasificación de tokens, 4 etiquetas (incluye `？` y `！`) | Apache 2.0 | Hugging Face |
| tohoku-nlp/bert-base-japanese-v3 (modelo base) | 110,6 M | 512 tokens | BERT base japonés sin cabeza de puntuación | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks de otros modelos de restauración de puntuación japonesa en la información proporcionada, por lo que no es posible una comparación cuantitativa con alternativas externas.

## Limitaciones y advertencias

- Exhaustividad baja en comas de registro oral: en el conjunto estilo ASR la recall de `、` es 0,3966, es decir, se pierden aproximadamente seis de cada diez comas; el fallo típico es omitir la coma, no colocarla mal (precisión de 0,85).
- No restaura `？` ni `！`: esos signos no forman parte del espacio de etiquetas, por lo que preguntas y exclamaciones recibirán `、` o `。` en su lugar o ninguna puntuación.
- Sesgo de dominio hacia escritura formal: el entrenamiento proviene de Wikipedia, por lo que el rendimiento en lenguaje coloquial, jerga o estilo de redes sociales no está medido.
- Límite de 512 tokens: los textos largos deben dividirse en frases o fragmentos antes de la inferencia.
- Errores de inserción intra-palabra: se documenta al menos un caso en el que la coma se inserta en medio de una palabra («ありがとうございまし、た»), un fallo poco frecuente pero posible.
- Riesgo de alucinación estructural bajo: al ser un etiquetador y no un generador, no inventa contenido léxico, pero sí puede producir una segmentación incorrecta que altere el sentido de la frase.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución; no se documentan restricciones adicionales, aunque conviene conservar el aviso de licencia y citar el modelo base.
- Sin métricas de latencia ni throughput publicadas, y con 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ElToluene/japanese-punctuation-restoration
- Demo en Spaces: https://huggingface.co/spaces/ElToluene/japanese-punctuation-restoration-demo
- Modelo base: https://huggingface.co/cl-tohoku/bert-base-japanese-v3
