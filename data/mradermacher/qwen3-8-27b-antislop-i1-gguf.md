# mradermacher/Qwen3.8-27B-antislop-i1-GGUF

## Resumen

`mradermacher/Qwen3.8-27B-antislop-i1-GGUF` es una publicación de cuantizaciones GGUF del modelo `rawmodels/Qwen3.8-27B-antislop`, un derivado de la serie Qwen3.8 (26.895.998.464 parámetros, aproximadamente 26,9 B). El autor de la cuantización es mradermacher, que publica versiones optimizadas para inferencia local en formato GGUF, en este caso con cuantizaciones de tipo imatrix (prefijo `i1`) construidas a partir de un fichero imatrix propio incluido en el repositorio. El modelo base incorpora, según los metadatos, un adaptador LoRA ya fusionado en los pesos y técnicas de *steering* y *prompt distillation* etiquetadas como "antislop".

El interés práctico de esta ficha es que permite ejecutar un modelo de ~27 B en hardware de consumo mediante cuantizaciones que van de 10,8 GB (i1-Q2_K) a 15,7 GB (i1-Q4_K_S) en el repositorio i1, con una versión estática adicional que amplía el catálogo de tipos de cuantización. La model card declara soporte para inglés y ruso, licencia Apache 2.0 y librería `transformers`, aunque los ficheros publicados son GGUF y están pensados para motores compatibles con este formato.

Se trata de una publicación muy reciente y sin tracción comunitaria: 0 descargas y 0 *likes* en el momento del análisis, creada el 24 de septiembre de 2026. No hay benchmarks, evaluaciones ni documentación de arquitectura o de datos de entrenamiento publicados por el autor en la información disponible, por lo que la ficha se limita a describir lo declarado y a marcar explícitamente los datos ausentes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. La model card no especifica si es transformer denso, MoE o híbrida; el tag `qwen3.8` la sitúa en la familia Qwen3.8 |
| Parámetros totales | 26.895.998.464 (~26,9 B), dato real de los safetensors del modelo base |
| Parámetros activos | No disponible (no se declara configuración MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Cuantizaciones GGUF K-quant e I-quant. En este repositorio (i1, imatrix): i1-Q2_K (10,8 GB), i1-IQ3_M (12,7 GB), i1-Q4_K_S (15,7 GB), más fichero imatrix (0,1 GB). Catálogo completo declarado en los metadatos: Q2_K, Q2_K_S, IQ1_M, IQ1_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_1, Q4_K_S, small-IQ4_NL, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | Inglés (en) y ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio). El modelo base se distribuye en safetensors para `transformers` |
| Tamaño del repositorio | 38,9 GB |
| Versión de cuantización | `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf` |
| Fecha de creación | 24 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card del repositorio no aporta información sobre la arquitectura interna (transformer, MoE, SSM o híbrida), el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO u otras técnicas de alineación. Tampoco se documenta la longitud de contexto soportada. Lo único verificable es el recuento de parámetros del modelo base (26.895.998.464) y los metadatos de la cuantización.

Los tags del repositorio describen el tratamiento aplicado al modelo base: `lora-merged` indica que un adaptador LoRA se ha fusionado en los pesos finales; `prompt-distillation` y `steering` apuntan a técnicas de ajuste orientadas a modificar el estilo de generación; `antislop` es la etiqueta que da nombre al modelo y sugiere un ajuste destinado a reducir la prosa genérica y repetitiva típica de los modelos de lenguaje. Estos elementos provienen del modelo base `rawmodels/Qwen3.8-27B-antislop`, no del trabajo de cuantización, cuyo alcance se limita a la conversión y compresión de los pesos.

La innovación técnica del repositorio es la generación de cuantizaciones *imatrix* (prefijo `i1`), que emplean una matriz de importancia calculada sobre datos de calibración para ponderar mejor qué pesos conservar con más precisión. El autor incluye el propio fichero `Qwen3.8-27B-antislop.imatrix.gguf` (0,1 GB) para que otros usuarios puedan generar sus propias cuantizaciones con el mismo criterio. La model card menciona además que el modelo base sería un modelo de visión y que los ficheros `mmproj` correspondientes, si existen, se alojan en el repositorio estático y no en este.

## Capacidades

- Generación de texto conversacional: el tag `conversational` y la orientación del modelo base indican uso en diálogo multi-turno.
- Inferencia local en GGUF: compatible con motores que implementan el formato GGUF, incluida la ejecución parcial por CPU.
- Cuantización configurable: se ofrecen tres niveles i1 (Q2_K, IQ3_M, Q4_K_S) con distintos compromisos de tamaño y calidad.
- Creación de cuantizaciones propias: el fichero imatrix incluido permite replicar el pipeline del autor.
- Idiomas: inglés y ruso declarados. El comportamiento en otros idiomas, incluido el castellano, no está documentado en la información disponible.
- Ajuste de estilo "antislop": el modelo base incorpora *steering* y *prompt distillation* orientados a reducir la prosa genérica, según los metadatos.
- Visión: la model card indica que el modelo base sería multimodal y remite a los ficheros `mmproj` del repositorio estático. No se confirma disponibilidad ni funcionamiento en este repositorio.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo *thinking* explícito: no disponible en la información proporcionada.
- Soporte de audio: no disponible.

## Casos de uso

- Despliegue local en estación de trabajo con GPU de 24 GB: la cuantización i1-Q4_K_S ocupa 15,7 GB, lo que deja margen para caché KV y contexto en tarjetas como la RTX 4090. Es el escenario natural de este repositorio, orientado a inferencia privada sin depender de API externas.
- Generación de texto en inglés y ruso: el modelo declara soporte para ambos idiomas, de modo que resulta adecuado para redacción, resumen o traducción dentro de ese par lingüístico, siempre que se valide la calidad por no existir evaluaciones publicadas.
- Prototipado con presupuesto de VRAM reducido: la variante i1-Q2_K (10,8 GB) permite cargar el modelo en GPUs de 12 GB con contexto corto, útil para pruebas de concepto y comparación de estilos antes de invertir en un quant mayor.
- Experimentación con *steering* y control de estilo: al estar etiquetado como `antislop` y `steering`, el modelo sirve como punto de partida para estudiar cómo el ajuste de estilo afecta a la salida frente al modelo Qwen3.8 original.
- Evaluación comparativa de cuantizaciones: con tres niveles i1 disponibles y el fichero imatrix, un equipo puede medir la degradación de perplejidad y calidad entre Q2_K, IQ3_M y Q4_K_S sobre su propio dominio antes de fijar una configuración de producción.
- Asistentes conversacionales autoalojados: el tag `conversational` y el formato GGUF permiten integrarlo en un servicio interno de chat con datos que no pueden salir de la organización, usando llama.cpp o un servidor compatible.
- Ajuste fino de cuantizaciones propias: el fichero `imatrix.gguf` incluido (0,1 GB) permite generar variantes adicionales con el mismo criterio de importancia para adaptar tamaño y precisión a un hardware concreto.
- Investigación sobre derivados de Qwen3.8: al tratarse de un derivado con LoRA fusionada y *steering*, es un objeto de estudio para analizar hasta qué punto estas modificaciones alteran el comportamiento base de la familia Qwen3.8.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada (solo pesos, según los ficheros publicados): i1-Q2_K 10,8 GB; i1-IQ3_M 12,7 GB; i1-Q4_K_S 15,7 GB; imatrix 0,1 GB.
- Estimación con sobrecarga: para el modelo Qwen3.8 27B en Q4_K_M se cita un presupuesto de memoria de aproximadamente 17,3 GB, considerando pesos más caché KV y *overhead*. Aplicado a esta familia de cuantizaciones, conviene reservar entre 1,5 GB y 3 GB adicionales sobre el tamaño del fichero, en función de la longitud de contexto.
- GPUs de gama de consumo: la variante i1-Q2_K entra en tarjetas de 12 GB; i1-Q4_K_S requiere 24 GB para operar con contexto holgado (RTX 4090, o GPUs de 32 GB).
- GPUs profesionales: A100 40/80 GB, H100 o L40S permiten cargar cualquier cuantización publicada con contexto amplio y servir varias peticiones concurrentes.
- CPU y RAM: el formato GGUF permite ejecución híbrida o completa en CPU. Como referencia de la familia, el quant Q8_0 se sitúa en torno a 27,05 GB, por lo que un sistema con 32 GB de RAM o más puede alojar cuantizaciones altas sin GPU.
- Opciones de despliegue: llama.cpp, llama-cpp-python, Ollama, LM Studio, text-generation-webui y otros motores compatibles con GGUF. El soporte de GGUF en vLLM y TGI no se confirma en la información disponible.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para este repositorio.
- Visión: la model card indica que los ficheros `mmproj` necesarios para las capacidades multimodales, si existen, están en el repositorio estático, no en este.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `mradermacher/Qwen3.8-27B-antislop-i1-GGUF` (este) | 26,9 B | No disponible | GGUF (i1: Q2_K, IQ3_M, Q4_K_S) | Apache 2.0 | Cuantización imatrix del derivado antislop; fichero imatrix incluido; 0 descargas |
| `mradermacher/Qwen3.8-27B-antislop-GGUF` | 26,9 B | No disponible | GGUF (cuantizaciones estáticas) | Apache 2.0 | Versión estática del mismo modelo base; aloja los `mmproj` si existen |
| `rawmodels/Qwen3.8-27B-antislop` | 26,9 B | No disponible | safetensors (transformers) | No disponible en la información proporcionada | Modelo base sin cuantizar; origen del LoRA fusionado y del *steering* antislop |
| `mradermacher/Qwen3.8-27B-absolute-heresy-i1-GGUF` | No disponible | No disponible | GGUF (i1) | Apache 2.0 | Derivado alternativo de la misma familia, con etiquetas `heretic`, `uncensored`, `abliterated`; 1 like |
| Qwen3.8 27B (upstream, QwenLM) | 27 B (aproximado, según denominación comercial) | No disponible | safetensors / GGUF según distribución | Apache 2.0 | Modelo original de la familia Qwen3.8, que engloba Qwen3.5, Qwen3.6 y Qwen3.8 |

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, métricas de perplejidad ni comparativas publicadas para este repositorio ni, en la información disponible, para el modelo base.
- Sin validación comunitaria: 0 descargas y 0 *likes*. Nadie ha reportado resultados de uso real, por lo que se desconoce el comportamiento en producción.
- Riesgo de degradación por cuantización: i1-Q2_K es una cuantización agresiva; la propia model card recomienda IQ3_XXS como alternativa de tamaño similar. Para uso serio conviene partir de IQ3_M o Q4_K_S.
- Efectos del *steering* antislop: al tratarse de un derivado con LoRA fusionada, *steering* y *prompt distillation*, el estilo y el comportamiento pueden diferir del Qwen3.8 original. No se documenta qué se ha modificado ni con qué datos.
- Riesgo de alucinación: no cuantificado. Ningún modelo de este tamaño está libre de generar información falsa, y sin evaluaciones publicadas no es posible acotar la magnitud.
- Idiomas: solo se declaran inglés y ruso. El rendimiento en castellano no está documentado ni garantizado.
- Soporte multimodal incierto: la model card afirma que es un modelo de visión, pero los ficheros `mmproj` no están en este repositorio. Las capacidades de visión no se pueden usar desde aquí sin acudir al repositorio estático.
- Licencia: Apache 2.0 declarada tanto en los tags como en la model card. Aun así, conviene verificar la licencia del modelo base `rawmodels/Qwen3.8-27B-antislop` antes de un uso comercial, ya que esta ficha no la recoge.
- Cadena de trazabilidad larga: modelo original de Qwen, derivado antislop de un tercero y cuantización de mradermacher. Cada salto puede introducir cambios no documentados.
- Fecha de creación reciente (24 de septiembre de 2026) y sin historial de revisiones más allá de `readme_rev: 1`.
- Plantilla de chat: las guías de la comunidad sobre Qwen3.8 27B mencionan problemas con la plantilla de chat. No se ha verificado si afectan a esta publicación concreta, pero es un punto a comprobar antes de desplegar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.8-27B-antislop-i1-GGUF
- Modelo base: https://huggingface.co/rawmodels/Qwen3.8-27B-antislop
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Qwen3.8-27B-antislop-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/Qwen3.8-27B-antislop-i1-GGUF/resolve/main/Qwen3.8-27B-antislop.imatrix.gguf
- Quant i1-Q2_K: https://huggingface.co/mradermacher/Qwen3.8-27B-antislop-i1-GGUF/resolve/main/Qwen3.8-27B-antislop.i1-Q2_K.gguf
- Quant i1-IQ3_M: https://huggingface.co/mradermacher/Qwen3.8-27B-antislop-i1-GGUF/resolve/main/Qwen3.8-27B-antislop.i1-IQ3_M.gguf
- Quant i1-Q4_K_S: https://huggingface.co/mradermacher/Qwen3.8-27B-antislop-i1-GGUF/resolve/main/Qwen3.8-27B-antislop.i1-Q4_K_S.gguf
- Página de resumen del autor para este modelo: https://hf.tst.eu/model#Qwen3.8-27B-antislop-i1-GGUF
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Perfil del autor: https://huggingface.co/mradermacher
- Derivado alternativo de la familia: https://huggingface.co/mradermacher/Qwen3.8-27B-absolute-heresy-i1-GGUF
- Repositorio oficial de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Guía de ejecución local de Qwen 3.8 27B (VRAM, quants, plantilla de chat y visión): https://locallyuncensored.com/blog/how-to-run-qwen-3-8-27b-locally.html
- Tamaños GGUF y requisitos de memoria de Qwen3.8 27B: https://localmodel.run/model/qwen3.8-27b
- Grafo comparativo de perplejidad entre tipos de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Ejemplo de uso de GGUF y concatenación de ficheros multiparte (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Empresa del autor, nethype GmbH: https://www.nethype.de/
