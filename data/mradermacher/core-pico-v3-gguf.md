# mradermacher/CORe-Pico-V3-GGUF

## Resumen

CORe-Pico-V3-GGUF es un repositorio de cuantizaciones estáticas en formato GGUF generadas por mradermacher a partir del modelo base OpenCOReTechnologies/CORe-Pico-V3. No se trata, por tanto, de un modelo entrenado de forma independiente, sino de una redistribución optimizada para inferencia local del modelo original publicado por OpenCORe Technologies. El repositorio incluye 12 variantes de cuantización que abarcan desde x-f16 (sin pérdida apreciable, la más pesada) hasta Q2_K (la más agresiva en compresión), pasando por las familias intermedias Q3_K, Q4_K, Q5_K, Q6_K, Q8_0 e IQ4_XS.

La información pública disponible sobre este repositorio es mínima: en el momento de la consulta figura con 0 descargas y 0 likes, sin pipeline declarado, sin licencia indicada y sin idiomas especificados en los metadatos. La model card se limita a una única línea en la que se identifica el modelo de origen, junto con metadatos internos del script de cuantización (convert_type: hf, quantize_version: 2, output_tensor_quantised: 1). No se documentan arquitectura, número de parámetros, longitud de contexto ni composición del dataset de entrenamiento.

Por tanto, esta ficha describe con rigor lo que el artefacto es y permite (un conjunto de pesos GGUF listos para motores compatibles con llama.cpp), y marca explícitamente como no disponible todo aquello que no consta en la información proporcionada. Cualquier dato sobre capacidades, benchmarks o requisitos de memoria del modelo subyacente debe verificarse en el repositorio del modelo base antes de tomar decisiones de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se confirma que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 12 variantes GGUF: x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas; no se distribuyen safetensors en este repositorio) |
| Repositorio base | OpenCOReTechnologies/CORe-Pico-V3 |
| Tipo de conversion | hf (convert_type: hf) |
| Version de cuantizacion | 2 (quantize_version: 2) |
| Cuantizacion de tensores de salida | si (output_tensor_quantised: 1) |
| Fecha de creacion (metadatos HF) | 2026-09-16T14:19:12.000Z |
| Ultima actualizacion (metadatos HF) | 2026-09-16T14:19:15.000Z |
| Descargas / likes | 0 / 0 |
| Etiquetas declaradas | region:us |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base CORe-Pico-V3: no consta si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura de espacio de estados (SSM) o un esquema híbrido. Tampoco se documentan el número de parámetros, la longitud de contexto nativa, el volumen de tokens de entrenamiento, la composición del corpus, ni si se aplicaron fases de ajuste fino supervisado, RLHF o DPO.

Lo único verificable en este repositorio es el proceso de posprocesado: mradermacher ha aplicado una conversión desde pesos en formato HuggingFace (convert_type: hf) y ha generado cuantizaciones estáticas con la versión 2 de su pipeline, marcando la cuantización de tensores de salida. El conjunto de variantes publicadas (desde Q2_K hasta x-f16) es el patrón habitual de este autor para cubrir distintos compromisos entre tamaño en disco, consumo de memoria y fidelidad respecto a los pesos originales.

Cualquier afirmación sobre innovaciones técnicas del modelo subyacente (decodificación especulativa, atención lineal, modos de razonamiento explícito, etc.) sería especulativa y no se incluye en esta ficha.

## Capacidades

No se ha publicado información sobre las capacidades del modelo base en los datos disponibles. No es posible confirmar ninguna de las siguientes, por lo que se listan como puntos a verificar en el repositorio de origen:

- Generación de texto: no confirmado.
- Razonamiento multi-paso: no confirmado.
- Generación de código: no confirmado.
- Matemáticas: no confirmado.
- Capacidades de visión o audio: no confirmadas.
- Soporte de tool calling / function calling: no confirmado.
- Uso como agente con razonamiento multi-paso: no confirmado.
- Cobertura multilingüe: no disponible.
- Modo de razonamiento explícito (thinking mode): no confirmado.

La única capacidad que se puede afirmar con certeza es la derivada del propio formato: los pesos están empaquetados en GGUF, por lo que son consumibles por motores de inferencia compatibles con este formato (llama.cpp y derivados).

## Casos de uso

Los siguientes escenarios son aplicables al artefacto como tal (despliegue local de cuantizaciones GGUF) siempre que el modelo base confirme las capacidades correspondientes. Se indica en cada caso la dependencia que debe verificarse:

- Inferencia local en estaciones de trabajo sin GPU dedicada: al existir variantes Q2_K, Q3_K y Q4_K, el modelo puede ejecutarse con llama.cpp en CPU y memoria RAM convencional. Requiere confirmar el número de parámetros para dimensionar la máquina.
- Despliegue en equipos con VRAM limitada: las variantes Q4_K_M e IQ4_XS son las candidatas habituales para GPUs de gama de consumo; conviene medir la degradación respecto a Q8_0 en las tareas objetivo antes de fijar la variante.
- Integración en asistentes de escritorio offline: el formato GGUF es compatible con Ollama, LM Studio y koboldcpp, lo que permite empaquetar el modelo en aplicaciones de escritorio que funcionan sin conexión y sin enviar datos a terceros.
- Entornos air-gapped con datos sensibles: al distribuirse como ficheros de pesos descargables y ejecutarse en local, el artefacto encaja en despliegues sin salida a Internet, siempre que la licencia del modelo base lo permita (actualmente no declarada).
- Evaluación de degradación por cuantización: el repositorio permite ejecutar la misma tarea con Q2_K, Q4_K_M, Q6_K y x-f16 y comparar la calidad resultante, útil para calibrar qué variante es aceptable en producción.
- Servido de alto rendimiento de la variante f16 o Q8_0: si se confirma compatibilidad con vLLM o TGI (soporte GGUF parcial en el primero), estas variantes permiten servir el modelo con mayor fidelidad en GPUs de centro de datos.
- Generación de texto por lotes en CPU: para tareas de etiquetado, resumen o clasificación a gran escala donde la latencia no es crítica, las variantes de menor tamaño permiten procesar volúmenes altos en hardware modesto.
- Prototipado rápido de aplicaciones sobre el modelo: disponer de 12 niveles de cuantización facilita iterar en un portátil y escalar después a la variante que se despliegue en producción sin cambiar la interfaz de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, y la búsqueda web realizada no ha devuelto documentación técnica asociada al modelo (los resultados obtenidos corresponden a productos comerciales sin relación con el modelo).

## Requisitos de hardware

- VRAM estimada: no disponible. No puede calcularse sin conocer el número de parámetros del modelo base. Como referencia de método, el tamaño aproximado de un fichero GGUF en gigabytes es (parámetros × bits por peso) / 8, más una sobrecarga de metadatos y vocabulario; en la práctica, Q4_K_M ronda los 4,8 bits por peso de media y Q8_0 los 8,5 bits por peso.
- GPU recomendadas: no disponible, por la misma razón. La elección depende del tamaño del modelo base.
- Viabilidad en GPU de consumo: indeterminada. La existencia de variantes Q2_K y Q3_K sugiere que el pipeline de cuantización contempla escenarios de memoria muy restringida, pero esto no permite afirmar que el modelo quepa en una GPU concreta.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y text-generation-webui son compatibles con pesos GGUF. El soporte de vLLM para GGUF es parcial y experimental; conviene verificarlo con la versión concreta antes de usarlo en producción.
- Latencia y throughput: no disponibles. Dependen del número de parámetros, de la variante de cuantización, del hardware y del backend, y no se ha publicado ninguna medición.
- Recomendación operativa: descargar primero x-f16 o Q8_0 para establecer la línea base de calidad, y descender progresivamente (Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K) midiendo calidad y memoria hasta encontrar el punto de equilibrio para el hardware objetivo.

## Comparativa con modelos similares

No disponible. No es posible seleccionar alternativas comparables porque se desconocen el número de parámetros, la arquitectura, el contexto y la licencia del modelo base. La comparación relevante en este caso sería entre las propias variantes de cuantización del repositorio (fidelidad frente a tamaño), no frente a otros modelos.

| Variante | Compromiso cualitativo | Uso típico previsto |
|---|---|---|
| x-f16 | Máxima fidelidad, mayor tamaño | Referencia de calidad y evaluación |
| Q8_0 | Fidelidad muy alta | Servido en GPU con VRAM suficiente |
| Q6_K | Fidelidad alta | Equilibrio en GPUs de gama alta de consumo |
| Q5_K_M / Q5_K_S | Fidelidad buena | GPUs de consumo con VRAM media |
| Q4_K_M / Q4_K_S | Equilibrio habitual | Opción por defecto en la mayoría de despliegues locales |
| IQ4_XS | Similar a Q4 con menor tamaño | GPUs con VRAM ajustada |
| Q3_K_L / Q3_K_M / Q3_K_S | Compresión alta, pérdida apreciable | Hardware muy limitado |
| Q2_K | Compresión máxima | Pruebas de viabilidad, no recomendado para producción |

Los compromisos cualitativos de la tabla son orientativos y propios de las técnicas de cuantización GGUF; no proceden de mediciones publicadas sobre este modelo concreto.

## Limitaciones y advertencias

- Ausencia de model card propia: el repositorio de cuantización no documenta capacidades, limitaciones, sesgos ni uso previsto. Toda la información debe obtenerse del repositorio base.
- Licencia no declarada: no consta la licencia ni en los metadatos ni en la model card. No debe asumirse que el uso comercial esté permitido; es imprescindible verificar la licencia del modelo OpenCOReTechnologies/CORe-Pico-V3 antes de cualquier despliegue en producción.
- Idiomas no declarados: se desconoce la cobertura lingüística real y el rendimiento en castellano.
- Riesgo de alucinación: no evaluado ni documentado; aplica el riesgo genérico de cualquier modelo generativo de texto.
- Sesgos: no evaluados ni documentados.
- Degradación por cuantización: las variantes Q2_K y Q3_K pueden degradar de forma notable la coherencia y la precisión en tareas de razonamiento o código. No se recomienda su uso en producción sin una evaluación previa específica del caso de uso.
- Advertencia sobre el formato: al ser cuantizaciones, no son adecuadas para continuar el entrenamiento ni para fusiones de pesos; para ajuste fino hay que partir del modelo base en precisión completa.
- Anomalía en los metadatos: las fechas de creación y actualización registradas (16 de septiembre de 2026) son posteriores a la fecha habitual de publicación y podrían deberse a un error de los metadatos de HuggingFace. No afecta al contenido de los pesos, pero conviene tenerlo en cuenta.
- Adopción nula verificada: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad y de informes de errores.
- Trazabilidad limitada: no se indica la revisión exacta del modelo base utilizada para la conversión, por lo que no puede garantizarse la reproducibilidad bit a bit respecto a una versión concreta del modelo original.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/CORe-Pico-V3-GGUF
- Modelo base: https://huggingface.co/OpenCOReTechnologies/CORe-Pico-V3
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher

Nota: la búsqueda web realizada no ha devuelto ningún resultado relevante sobre el modelo (paper, blog técnico, repositorio de código o demo). Los resultados obtenidos correspondían a páginas de productos comerciales sin relación con el modelo, por lo que se omiten.
