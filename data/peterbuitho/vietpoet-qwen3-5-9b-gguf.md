# peterbuitho/VietPoet-Qwen3.5-9B-GGUF

## Resumen

VietPoet-Qwen3.5-9B-GGUF es un ajuste fino del modelo base Qwen/Qwen3.5-9B (9.197.093.888 parametros) especializado en la generacion de poesia vietnamita en la forma tradicional *luc bat* (pares de versos de seis y ocho silabas con reglas tonales estrictas). Lo desarrolla el usuario peterbuitho y se distribuye unicamente en formato GGUF cuantizado, pensado para su uso en LM Studio y llama.cpp. El entrenamiento se hizo con QLoRA sobre 8.000 poemas del corpus phamson02/vietnamese-poetry-corpus durante 2 epocas, filtrando previamente los poemas que superaban un verificador de reglas de luc bat.

La particularidad del proyecto es que el modelo no se plantea como una solucion autonoma: el autor indica explicitamente que debe usarse junto con el muestreador linea a linea y el verificador de reglas de su repositorio ThoLucBat, cuyo instalador local para Windows (VietPoet-win.zip) lo configura automaticamente. Sin ese muestreador, el modelo genera la forma correcta pero incumple las reglas tonales con mas frecuencia. En las pruebas del autor, la version de 9B rompe la regla tonal de la sexta y octava silaba en el 10% de las lineas *bat*, frente al 38% de la version de 4B, aunque con el muestreador activo la diferencia entre ambos desaparece.

Es relevante ahora porque ilustra un patron de publicacion muy concreto: ajustes finos muy especializados, en idiomas de bajos recursos y con formato cuantizado listo para consumo local en GPU de gama consumer, acompanados de herramientas externas que compensan las limitaciones del modelo puro. La licencia Apache-2.0 y el soporte de llama.cpp lo hacen desplegable sin friccion, aunque su alcance funcional es muy estrecho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada (hereda la del modelo base Qwen/Qwen3.5-9B; no se detalla en la model card) |
| Parametros totales | 9.197.093.888 |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q8_0 (9,8 GB) y GGUF Q4_K_M (5,8 GB) |
| Idiomas soportados | Vietnamita (vi) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp / LM Studio); el modelo base original esta en safetensors |

## Arquitectura y entrenamiento

No se proporciona detalle arquitectonico propio en la model card: el modelo es un ajuste fino del base Qwen/Qwen3.5-9B, por lo que la arquitectura subyacente corresponde a la de ese modelo (no especificada en la informacion disponible). Lo que si se documenta es el procedimiento de ajuste: QLoRA sobre 8.000 poemas, 2 epocas, con el corpus phamson02/vietnamese-poetry-corpus (CC BY 4.0) filtrado previamente para conservar solo los poemas que pasan un verificador de reglas de luc bat. No se menciona uso de RLHF, DPO ni tecnicas de alineacion adicionales.

La innovacion practica no esta en el modelo sino en el sistema que lo rodea. El autor publica un muestreador linea a linea con 16 muestras por linea y un verificador de reglas en github.com/peterbuitho/ThoLucBat; es ese componente el que eleva la puntuacion de cumplimiento de reglas hasta 0,994 y el 98% de poemas plenamente validos. La idea de puntuacion se inspira en el articulo "Vietnamese Poem Generation & the Prospect of Cross-Language Poem-to-Poem Translation" (arXiv:2401.01078). El formato de prompt es el chat de Qwen con el modo thinking desactivado y la generacion de lineas anadidas al turno del asistente.

## Capacidades

- Generacion de poesia vietnamita en forma luc bat, con estructura de pares de seis y ocho silabas.
- Cumplimiento de reglas tonales (regla de la sexta y octava silaba) especialmente alto cuando se combina con el muestreador linea a linea del repositorio ThoLucBat.
- Escritura de poemas de longitud controlada mediante plantillas de peticion (por ejemplo, "8 cau"), con variantes recogidas en app/prompts.py.
- Conversacion basica en vietnamita heredada del modelo base, aunque el ajuste esta orientado a la tarea poetica.
- No se documenta soporte de tool calling, function calling, uso agentico, vision, audio ni modo thinking activo (el prompt de referencia desactiva el thinking).
- Capacidades multilingues: solo vietnamita declarado en la model card.
- No se documentan capacidades de razonamiento multi-paso, codigo o matematicas especificas de este ajuste.

## Casos de uso

- Generacion de poesia luc bat para publicacion o antologias: el modelo produce la forma metrica correcta y, con el muestreador y el verificador del repositorio ThoLucBat, alcanza un 98% de poemas plenamente validos en las pruebas del autor sobre 100 prompts reservados de tipo "8 cau".
- Composicion asistida por titulo: dado un tema breve (por ejemplo, el otono en el campo), el modelo genera un poema completo; es el flujo exacto con el que fue entrenado, ya que los prompts de entrenamiento solo contenian el titulo como tema.
- Herramienta educativa para el estudio de metrica vietnamita: sirve para ilustrar las reglas de tono del luc bat y comprobar casos correctos e incorrectos con el verificador adjunto.
- Generacion local sin conexion en equipos de escritorio: al distribuirse en GGUF Q4_K_M (5,8 GB), se puede ejecutar en LM Studio o llama.cpp en una GPU consumer sin enviar datos a servicios externos.
- Prototipado de aplicaciones de escritura creativa en vietnamita: integrable como endpoint compatible con la API de llama.cpp o mediante el instalador VietPoet-win.zip para Windows.
- Investigacion sobre ajuste fino con QLoRA en idiomas de bajos recursos: el par de modelos 4B y 9B con el mismo procedimiento de entrenamiento permite estudiar el efecto del tamano en el cumplimiento de restricciones formales.
- Filtrado y evaluacion de corpus poeticos: el verificador de reglas asociado puede reutilizarse para puntuar poemas generados o existentes y descartar los que incumplen metrica.

## Benchmarks y rendimiento

Los datos de la model card corresponden al modelo de 16 bits ejecutado sobre vLLM, con 100 prompts reservados de tipo "8 cau" y el muestreador linea a linea con 16 muestras por linea. El autor indica expresamente que los archivos GGUF no fueron puntuados por separado.

| Metrica | VietPoet 9B (16 bits, con muestreador) | VietPoet 4B (16 bits, con muestreador) |
|---|---|---|
| Puntuacion de reglas | 0,994 | 0,994 |
| Poemas plenamente validos | 98% | 98% |
| Lineas *bat* que rompen la regla tonal (sin muestreador) | 10% | 38% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. La propia model card advierte que estas cifras miden forma, no calidad poetica: los poemas son luc bat correctos pero el significado a menudo es vago o se sale del tema.

## Requisitos de hardware

- VRAM estimada: el archivo Q4_K_M ocupa 5,8 GB, por lo que necesita en torno a 6-8 GB de VRAM contando contexto y overhead; el archivo Q8_0 ocupa 9,8 GB y requiere aproximadamente 10-12 GB de VRAM.
- GPU recomendadas: para Q4_K_M, tarjetas consumer de 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090); para Q8_0, se recomienda una GPU de 12 GB o mas (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090) o GPUs de datacenter tipo A100 y H100 si se sirve en produccion.
- Cabe en GPU consumer: si, ambas cuantizaciones. El propio autor advierte que el Q8_0 "necesita una tarjeta grafica grande" porque el archivo solo ya pesa 9,8 GB.
- Opciones de despliegue: LM Studio y llama.cpp (formatos GGUF, etiquetas del repositorio), vLLM para la version de 16 bits usada en las pruebas del autor. No se mencionan Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada. La model card solo indica cualitativamente que el 9B es mas lento y consume mas memoria que el 4B.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| VietPoet-Qwen3.5-9B-GGUF | 9.197.093.888 | No disponible | GGUF (Q8_0, Q4_K_M) | Apache-2.0 | Puntuacion de reglas 0,994 y 98% de poemas validos con muestreador; rompe la regla tonal en el 10% de lineas *bat* sin muestreador |
| VietPoet-Qwen3.5-4B-GGUF | No disponible | No disponible | GGUF | Apache-2.0 | Mismo procedimiento de entrenamiento; puntuacion de reglas 0,994 y 98% de poemas validos con muestreador; rompe la regla tonal en el 38% de lineas *bat* sin muestreador |
| Qwen/Qwen3.5-9B | 9.197.093.888 (heredado) | No disponible | safetensors | Apache-2.0 | Modelo base generalista, sin ajuste poetico; no comparable en la tarea luc bat |

No se dispone de otros modelos comparables de generacion de poesia vietnamita en la informacion proporcionada.

## Limitaciones y advertencias

- El significado de los poemas es a menudo vago o se desvia del tema: los prompts de entrenamiento solo contenian el titulo como tema, por lo que el modelo no esta condicionado a desarrollar contenido concreto.
- Los poemas son formalmente luc bat pero la calidad literaria no esta evaluada: la model card insiste en que los numeros miden forma, no poesia.
- Uso autonomo degradado: sin el muestreador linea a linea y el verificador de reglas de ThoLucBat, el modelo incumple las reglas tonales con mucha mas frecuencia.
- Los archivos GGUF de este repositorio no fueron puntuados por separado; las cifras publicadas corresponden al modelo de 16 bits sobre vLLM.
- Cobertura linguistica limitada al vietnamita: no se declaran otros idiomas, lo que restringe su uso en entornos multilingues.
- Riesgo de alucinacion y de contenido fuera de dominio: al ser un ajuste estrecho sobre un modelo generalista, puede generar texto incoherente o fuera de la forma esperada si se le piden tareas distintas de la poesia.
- Licencia Apache-2.0: permite uso comercial, pero el corpus de entrenamiento phamson02/vietnamese-poetry-corpus esta bajo CC BY 4.0 y exige atribucion; conviene revisar las condiciones de la fuente de datos antes de un uso comercial.
- El modelo se publico con 0 descargas y 0 likes en el momento de la consulta, y no se detalla la longitud de contexto soportada ni la composicion exacta del conjunto de validacion.
- La fecha de creacion registrada (2026-09-20) y el modelo base Qwen/Qwen3.5-9B deben verificarse en el repositorio antes de citarlos en documentacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/peterbuitho/VietPoet-Qwen3.5-9B-GGUF
- Modelo hermano de 4B: https://huggingface.co/peterbuitho/VietPoet-Qwen3.5-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de herramienta (muestreador y verificador de reglas): https://github.com/peterbuitho/ThoLucBat
- Dataset de entrenamiento: https://huggingface.co/datasets/phamson02/vietnamese-poetry-corpus
- Articulo de referencia sobre puntuacion: https://arxiv.org/abs/2401.01078
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos resultados obtenidos eran contenido no relacionado y de caracter adulto, por lo que se descartan.
