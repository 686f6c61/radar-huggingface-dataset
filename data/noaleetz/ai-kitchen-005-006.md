# Noaleetz/ai-kitchen-005-006

## Resumen

El repositorio Noaleetz/ai-kitchen-005-006 no es un modelo entrenado desde cero, sino un paquete de artefactos de investigación en formato PEFT: adaptadores LoRA, DoRA e IA3 y un ajuste fino completo, todos derivados de Qwen/Qwen2.5-3B-Instruct. Lo publica el usuario Noaleetz como parte del trabajo harvard-cs2881f26/hw1-mangini-schwartz-tan, y contiene dos experimentos: el 005, una ablación sistemática del tipo de adaptador con los datos y la evaluación fijados, y el 006, una segunda persona ("Shakespeare") con una forma verificable sin modelo, los sonetos.

Su relevancia es metodológica más que de producto. El experimento 005 mantiene constante el conjunto de datos de D320 (320 filas de persona y 117 filas de matemáticas autodestiladas del proyecto Gandalf) y varía solo el tipo de adaptador, el objetivo de las capas y el rango, lo que permite aislar cuánto del resultado depende del método de adaptación y cuánto de los datos. El 006 comprueba si la receta de "matemáticas con formato nativo" transfiere a otra persona cuando existe una métrica objetiva (14 líneas, esquema de rima ABAB CDCD EFEF GG) que se puede verificar antes de que intervenga el juez.

Las cifras principales son accesibilidad y tamaño reducido: los adaptadores van de 0,4 M de parámetros (IA3) a 119,7 M (dos LoRA concatenadas), y el ajuste completo mueve 3,09 B de parámetros. La evaluación se hizo con 200 preguntas de test de GSM8K mediante corrección basada en reglas y 60 prompts abiertos evaluados por un juez Gemma-4-31B con la misma rúbrica que los experimentos 003 y 004, de modo que las puntuaciones de "voz" son comparables a las del trabajo previo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-3B-Instruct) más adaptadores PEFT: LoRA, DoRA e IA3, y una variante de ajuste fino completo |
| Parametros totales | Modelo base: 3,09 B (cifra citada por el autor para el ajuste completo). Adaptadores: entre 0,4 M y 119,7 M de parámetros entrenables según la variante |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No especificada en la información proporcionada. El modelo base Qwen2.5-3B-Instruct declara 32 768 tokens en su propia documentación, no verificada aquí |
| Tipos de cuantizacion | No disponible. El repositorio publica pesos en safetensors; no se documentan versiones GGUF, AWQ, GPTQ ni cuantizaciones de 4 u 8 bits |
| Idiomas soportados | No disponibles. La model card no declara idiomas para los adaptadores |
| Licencia | No disponible en la ficha del repositorio. El modelo base Qwen2.5-3B-Instruct se publica bajo Apache 2.0 según su propia ficha, dato no verificado en la información proporcionada |
| Formato de pesos | safetensors (adaptadores PEFT). La subcarpeta 005/full contiene un modelo completo, que debe cargarse con AutoModelForCausalLM.from_pretrained, no con PeftModel |
| Tamaño del repositorio | 1,5 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-09-13 / 2026-09-13 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El punto de partida es Qwen2.5-3B-Instruct, un transformer decoder-only de 3,09 B de parámetros. Sobre él se aplican adaptadores de bajo rango con la librería PEFT. El experimento 005 fija los datos y la evaluación de D320 (320 filas de persona, ampliadas desde 78, y 117 filas de matemáticas autodestiladas) y varía únicamente el mecanismo de adaptación: LoRA con rango 32 en todas las capas (configuración ancla de D320, 59,9 M de parámetros entrenables), IA3 con escalado por canal (0,4 M), DoRA con separación de magnitud y dirección (60,9 M), LoRA restringida a las capas 24-35 (20,0 M), LoRA solo con las filas de persona (59,9 M), LoRA solo con las filas de matemáticas (59,9 M), concatenación ingenua de las dos LoRA anteriores (119,7 M) y ajuste fino completo sin adaptador (3,09 B). El experimento 006 reutiliza la receta de D320 (matemáticas autodestiladas más filas de persona) con Claude Haiku 4.5 como profesor y los sonetos como persona, verificados sin modelo mediante src/verse_metric.py antes de pasar al juez.

Las conclusiones que reporta el autor son tres. La primera, que la persona necesita capacidad real: IA3, con 0,4 M de parámetros, cae a 2,12 de voz frente a 3,72-3,75 de las variantes LoRA/DoRA. La segunda, que DoRA iguala la voz de LoRA con la mejor precisión de la tabla (0,845) y aproximadamente la mitad de fallos de coherencia de todo el proyecto (0,133). La tercera, que concatenar una LoRA de persona y otra de matemáticas es peor (0,725 de precisión) que entrenar cualquiera de las dos por separado o ambas de forma conjunta, y que la voz no se concentra solo en las capas altas, ya que limitar la LoRA a las capas 24-35 hunde la puntuación de voz a 2,63. En el 006, la precisión queda estadísticamente empatada con D320 (p = 1, prueba de McNemar), lo que sugiere que la receta de matemáticas con formato nativo transfiere, mientras que la voz y la coherencia quedan por detrás: el 60 % de los prompts abiertos presenta fallo de coherencia.

## Capacidades

- Generación de texto instructivo en inglés heredada del modelo base Qwen2.5-3B-Instruct.
- Adopción de persona controlada: el experimento 006 produce texto en registro "Shakespeare" y el linaje D320/Gandalf produce una persona de asistente con voz propia.
- Razonamiento aritmético con formato GSM8K: la receta de matemáticas autodestiladas alcanza entre 0,795 y 0,845 de precisión en el subconjunto de 200 preguntas de test utilizado.
- Generación de sonetos con restricciones formales: acierta el número de líneas el 87 % de las veces y el recuento silábico el 99 %, pero solo encadena la rima en el 41 % de los pares, con un 15 % de sonetos completamente válidos.
- Verificación sin modelo: el pipeline incluye src/verse_metric.py, que comprueba el esquema métrico antes de la evaluación por juez.
- Capacidad de servir como sujeto de experimentos de adaptación: las etiquetas lora, dora e ia3 indican que el repositorio está pensado para comparar métodos PEFT, no para despliegue de producto.
- No se documenta soporte de tool calling ni function calling.
- No se documenta uso como agente ni razonamiento multi-paso más allá del formato de cadena de GSM8K.
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito.
- Capacidades multilingües: no documentadas en la ficha del adaptador.

## Casos de uso

- Reproducción de una ablación de PEFT: cargar las subcarpetas 005/anchor, 005/dora, 005/ia3, 005/upper y 005/full permite repetir la comparación con datos y evaluación fijos, algo poco habitual en publicaciones de adaptadores, donde cada variante cambia también el conjunto de entrenamiento.
- Selección informada del método de adaptación antes de invertir en GPU: el resultado de que DoRA alcance 0,845 con 60,9 M de parámetros entrenables frente a los 3,09 B del ajuste completo es un argumento cuantitativo para justificar adaptadores de bajo rango en un proyecto real.
- Estudio de transferencia de estilo o marca: el pipeline de persona (filas de estilo más datos de tarea) se puede reutilizar para dotar a un asistente interno de una voz corporativa concreta, midiendo después la degradación de coherencia que introduce.
- Validación automática de restricciones formales en generación creativa: verse_metric.py ejemplifica cómo comprobar métricas objetivas (líneas, sílabas, rima) sin depender de un juez LLM, patrón aplicable a plantillas de contrato, formatos de informe o esquemas JSON.
- Destilación de matemáticas con formato nativo: el uso del profesor Claude Haiku 4.5 sobre 117 filas para enseñar el formato de respuesta produce precisión cercana a la de un entrenamiento mayor, útil como técnica de bajo coste para dominios con formato de salida rígido.
- Docencia y laboratorios de ajuste fino: al ser un trabajo de un curso (CS2881) con evaluación reproducible, sirve como material didáctico para enseñar PEFT, evaluación con juez LLM y análisis de compensaciones entre precisión y coherencia.
- Establecimiento de una línea base para nuevos dominios: la separación entre filas de persona y filas de tarea permite medir, en un problema nuevo, si conviene entrenar por separado o conjuntamente, dado que la concatenación de adaptadores resultó peor que cualquiera de las dos partes.
- Experimentación en hardware de consumo: al ser adaptadores sobre un modelo de 3 B, cualquiera de las variantes excepto el ajuste completo se puede ejecutar y entrenar en una GPU de gama alta de consumo.

## Benchmarks y rendimiento

Evaluación común a los experimentos 005 y 006: 200 preguntas de test de GSM8K corregidas por reglas, más 60 prompts abiertos evaluados por un juez Gemma-4-31B con la misma rúbrica que los experimentos 003 y 004. La puntuación de "voz" se expresa en la escala de D320; el rango numérico de esa escala no se especifica en la información disponible. "coherence fail" es la tasa de prompts abiertos con fallo de coherencia.

Experimento 005 (ablación del tipo de adaptador, datos y evaluación fijos):

| Variante | Parámetros entrenables | Precisión GSM8K (200) | Voz (abierto) | Fallo de coherencia |
|---|---|---|---|---|
| Ancla (LoRA r32, todas las capas = configuración D320) | 59,9 M | 0,830 | 3,72 | 0,233 |
| IA3 (solo escalado por canal) | 0,4 M | 0,800 | 2,12 | 0,217 |
| DoRA (separación magnitud/dirección) | 60,9 M | 0,845 | 3,70 | 0,133 |
| LoRA solo capas 24-35 | 20,0 M | 0,835 | 2,63 | 0,300 |
| LoRA solo con filas de persona | 59,9 M | 0,795 | 3,75 | 0,200 |
| LoRA solo con filas de matemáticas | 59,9 M | 0,815 | 1,00 | 0,000 |
| Concatenación de persona y matemáticas | 119,7 M | 0,725 | 3,72 | 0,150 |
| Ajuste fino completo | 3,09 B | "see repo" (no publicado en la tabla) | No disponible | No disponible |

Experimento 006 (persona Shakespeare):

| Etapa | Precisión GSM8K (200) | Voz (abierto) | Soneto válido | Tasa de rima | Fallo de coherencia |
|---|---|---|---|---|---|
| base_prompted (Shakespeare) | 0,880 | 1,02 | 0,00 | 0,00 | 0,00 |
| SFT sobre sonetos | 0,825 | 2,10 | 0,15 | 0,41 | 0,60 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K completo ni otros benchmarks estándar. Las cifras anteriores corresponden a subconjuntos propios (200 preguntas) y no son comparables con resultados de GSM8K a 8 disparos sobre el conjunto completo.

## Requisitos de hardware

Las cifras de esta sección son estimaciones derivadas del tamaño del modelo base (3,09 B de parámetros); el autor no publica requisitos de hardware.

- Inferencia en bf16/fp16 con el modelo base más adaptador: aproximadamente 6,2 GB solo de pesos, más caché KV. Con contexto de 32 768 tokens la caché crece de forma notable.
- Inferencia cuantizada a 8 bits: en torno a 3,1 GB de pesos. A 4 bits, en torno a 1,6-2 GB. Ninguna de estas cuantizaciones está publicada en el repositorio, por lo que habría que generarlas.
- GPU recomendadas para el modelo base en precisión completa sin cuantizar: A100 40 GB, H100 80 GB, L40S o RTX 6000 Ada para servir varias peticiones concurrentes.
- Cabe en GPU de consumo: sí. Una RTX 4090 (24 GB), RTX 4080 (16 GB) o RTX 3090 (24 GB) ejecutan el modelo en bf16 con margen amplio; una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB son suficientes en cuantización de 8 o 4 bits.
- Entrenamiento de los adaptadores: al ser 0,4-120 M de parámetros entrenables, cabe en GPU de consumo con optimizadores de memoria eficiente, aunque los estados del optimizador sobre 3 B de pesos congelados y las activaciones siguen consumiendo memoria.
- Entrenamiento del ajuste completo (3,09 B): requiere estado de Adam sobre todos los parámetros, en torno a 12 GB adicionales solo para estados en fp32, más activaciones y gradientes; en la práctica exige A100 80 GB, H100 o varias GPU con paralelismo.
- Despliegue: al ser artefactos PEFT, la ruta natural es transformers más peft. vLLM admite adaptadores LoRA servidos dinámicamente, lo que permitiría servir varias personas sobre un único modelo base. TGI soporta adaptadores en versiones recientes. llama.cpp u Ollama exigirían convertir el modelo fusionado a GGUF, paso no documentado en el repositorio.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

No existen modelos públicos directamente equivalentes, porque este repositorio es un artefacto de investigación de un curso y no un modelo publicado como producto. Las referencias más cercanas son el modelo base, el trabajo previo del que deriva y las propias variantes internas.

| Referencia | Parámetros entrenables | Contexto | Precisión GSM8K (200) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ai-kitchen-005-006, variante DoRA | 60,9 M | No especificado (base: 32 768 tokens) | 0,845 | No disponible | Pública en HuggingFace, 0 descargas |
| ai-kitchen-005-006, ajuste completo | 3,09 B | No especificado | No publicada | No disponible | Pública en HuggingFace |
| Gandalf D320 (henryatharvard/gandalf-qwen2.5-3b-lora, experimento 004) | No disponible | No especificado | 0,825 | No disponible | Pública en HuggingFace |
| Qwen2.5-3B-Instruct (modelo base) | 3,09 B (ajuste completo) | 32 768 tokens según su ficha | No disponible en la información proporcionada | Apache 2.0 según su ficha | Pública en HuggingFace |

En cuanto a la comparación de métodos de adaptación, los datos del propio repositorio son la referencia más útil: LoRA r32 en todas las capas, DoRA, IA3, LoRA restringida a capas altas y ajuste completo, todos con los mismos datos y la misma evaluación. Esa tabla es precisamente el objeto de estudio del experimento 005.

## Limitaciones y advertencias

- No es un modelo autónomo: los adaptadores requieren cargar Qwen/Qwen2.5-3B-Instruct como base. Solo la subcarpeta 005/full contiene pesos completos.
- Licencia no declarada en la ficha del repositorio. Sin una licencia explícita, el uso comercial de los adaptadores es jurídicamente ambiguo, con independencia de que el modelo base sea Apache 2.0. Conviene contactar con el autor antes de cualquier uso en producción.
- Riesgo de error en la carga: la subcarpeta 005/full no es un adaptador y falla si se carga con PeftModel; debe usarse AutoModelForCausalLM.from_pretrained.
- Incoherencia en los metadatos: el repositorio declara 1,5 GB de tamaño total, cantidad difícil de reconciliar con la presencia simultánea de varios adaptadores y un ajuste completo de 3,09 B de parámetros. Conviene inspeccionar los archivos antes de asumir qué contiene cada subcarpeta.
- Fallo de coherencia elevado: incluso la mejor variante (DoRA) presenta un 13,3 % de fallos de coherencia en los 60 prompts abiertos, y la persona Shakespeare alcanza el 60 %. Es un modelo de investigación, no un asistente listo para usuarios finales.
- La rima es el cuello de botella en la generación de sonetos: solo el 41 % de los pares riman, frente al 87 % de acierto en número de líneas y el 99 % en sílabas. Cualquier uso creativo necesita verificación posterior.
- La introducción de persona degrada la utilidad general: la variante entrenada solo con matemáticas obtiene 1,00 de voz, y la de solo persona baja a 0,795 de precisión. Existe una compensación real entre ambos objetivos.
- Concatenar adaptadores de tareas distintas no funciona: la variante meramente concatenada obtiene 0,725, la peor precisión de toda la tabla.
- Evaluación de alcance limitado: 200 preguntas de GSM8K y 60 prompts abiertos, con un juez automático (Gemma-4-31B) y sin evaluación humana publicada. No hay MMLU, HumanEval ni otras pruebas estándar, y las cifras no son comparables con resultados publicados sobre GSM8K completo.
- Sesgos conocidos: no documentados. La persona "Gandalf" y el estilo shakespeariano pueden introducir sesgos estilísticos y culturales, pero no hay análisis publicado al respecto.
- Idiomas: la ficha no declara idiomas soportados y toda la evaluación se realizó en inglés; el comportamiento en castellano no está verificado.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día: no hay evidencia de uso externo, mantenimiento ni soporte.
- Los resultados de la búsqueda web realizada no guardan ninguna relación con el modelo (tratan sobre la limpieza de ventiladores de portátiles) y no aportan información aprovechable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Noaleetz/ai-kitchen-005-006
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Proyecto previo citado, Gandalf (experimento 004): https://huggingface.co/henryatharvard/gandalf-qwen2.5-3b-lora
- Repositorio del trabajo completo: harvard-cs2881f26/hw1-mangini-schwartz-tan, carpetas experiments/005_adapter_config/ y experiments/006_shakespeare/. El identificador se cita en la model card, pero no se proporciona URL.
- Script de verificación métrica de verso: src/verse_metric.py, dentro del repositorio anterior. No se proporciona URL directa.
- Resultados de búsqueda web: sin enlaces relevantes; los resultados obtenidos no están relacionados con el modelo.
