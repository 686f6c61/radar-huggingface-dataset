# mradermacher/qwen3.5-9b-uncensored-i1-GGUF

## Resumen

`mradermacher/qwen3.5-9b-uncensored-i1-GGUF` es un repositorio de cuantizaciones GGUF generadas de forma automatica por el usuario mradermacher a partir del modelo base `mshodiqul/qwen3.5-9b-uncensored`. No se trata de un modelo entrenado por el autor del repositorio, sino de una conversion y cuantizacion de pesos ya existentes con la herramienta de imatrix de llama.cpp, segun los metadatos incrustados en la model card (`convert_type: hf`, `quantize_version: 2`, `output_tensor_quantised: 1`).

La relevancia practica de este repositorio es limitada segun los datos disponibles: registra 0 descargas y 0 likes en el momento de la consulta, el tamano declarado del repo es de 0.0 GB y el unico dato de parametros aportado por los metadatos (1.278.200) es incoherente con la nomenclatura "9b" del nombre del modelo. Ademas, la model card se limita a un bloque de comentarios HTML con la lista de cuantizaciones generadas, sin descripcion, sin licencia, sin idiomas declarados y sin datos de entrenamiento.

Por tanto, esta ficha debe leerse como un inventario de lo que el repositorio declara, no como una evaluacion de capacidades. Cualquier decision de despliegue en produccion exige verificar antes el modelo base original, su licencia y su comportamiento real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no declarada en la model card; la nomenclatura del nombre sugiere familia Qwen) |
| Parametros totales | no disponible. Los metadatos del repo reportan 1.278.200, cifra incoherente con el sufijo "9b" del nombre |
| Parametros activos | no aplica / no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, small-IQ4_NL. Generadas con imatrix ("weighted/imatrix quants") |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (unico formato publicado; no hay safetensors en este repo) |

## Arquitectura y entrenamiento

La model card no incluye ninguna descripcion de arquitectura, proceso de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de alineacion (RLHF, DPO u otras). Lo unico tecnicamente verificable es la cadena de procesado: el autor ha tomado pesos en formato HuggingFace (`convert_type: hf`) y los ha convertido y cuantizado a GGUF con la version 2 de su pipeline de cuantizacion, aplicando cuantizacion ponderada por imatrix (`output_tensor_quantised: 1`) para reducir el error en las capas mas sensibles.

El unico dato adicional es la etiqueta `nicoboss` presente en los metadatos, que sugiere una posible relacion con el linaje de datasets o fine-tunes "uncensored" asociados a ese autor, pero no hay confirmacion documental de ello en la informacion disponible. El modelo base declarado es `mshodiqul/qwen3.5-9b-uncensored`, cuyo contenido, arquitectura y licencia no se detallan en este repositorio y deberian consultarse por separado.

## Capacidades

- Generacion de texto: no confirmada documentalmente. Se asume por herencia del modelo base, pero el repositorio no aporta evaluacion alguna.
- Razonamiento, codigo y matematicas: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declara lista de idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Modo "uncensored": el nombre del modelo base indica un ajuste orientado a reducir rechazos en las respuestas, pero no hay especificacion tecnica de como se logro ni que filtros se eliminaron.

## Casos de uso

No es posible proponer casos de uso concretos y realistas con la informacion disponible, porque se desconocen el contexto maximo, los idiomas, la licencia y las capacidades reales del modelo. Los unicos escenarios plausibles son de caracter exploratorio y siempre condicionados a verificar antes el modelo base:

- Pruebas de cuantizacion: usar las distintas variantes (de IQ1_S a Q6_K) para medir la degradacion de calidad frente al modelo original en formato HuggingFace, comparando perplejidad o tareas fijas por nivel de cuantizacion.
- Despliegue en hardware muy limitado: las variantes IQ1_M, IQ1_S o IQ2_XXS permiten probar el modelo en equipos con pocos recursos, asumiendo perdida de calidad significativa.
- Investigacion sobre modelos "uncensored": analizar hasta que punto el ajuste del modelo base reduce los rechazos en dominios sensibles, siempre dentro de un marco legal y etico.
- Evaluacion de sesgos y seguridad: someter al modelo a baterias de prompts adversarios para documentar comportamientos problematicos antes de cualquier uso.
- Experimentacion local con llama.cpp u Ollama: validar la integracion del formato GGUF en toolchains de inferencia en CPU o GPU de gama media.
- Comparativas internas de pipelines de cuantizacion: evaluar si la cuantizacion ponderada por imatrix de este autor conserva mejor la calidad que una cuantizacion estandar a igual tamano de archivo.

Cualquier uso en produccion (atencion al cliente, generacion de codigo, analitica documental, etc.) queda descartado sin antes resolver las incognitas de licencia, contexto y calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, ni comparaciones con el modelo base sin cuantizar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como dato verificado. Como referencia orientativa, para un modelo denso de aproximadamente 9.000 millones de parametros en GGUF, el peso en disco ronda los 3-4 GB en Q4_K_M, 2,5-3 GB en Q3_K_M, 1,5-2 GB en IQ2, y 6-7 GB en Q6_K. Estas cifras son una estimacion basada en el tipo de cuantizacion, no un dato del repositorio.
- GPU recomendadas: no disponible. Para las cuantizaciones mas bajas (IQ1, IQ2, Q3) bastaria una GPU consumer con 8-12 GB de VRAM; para Q5_K_M y Q6_K se necesitarian 12-16 GB. Todo ello bajo el supuesto de un modelo de ~9B.
- Compatibilidad con GPU consumer: previsiblemente si en tarjetas con 8 GB o mas para cuantizaciones Q4 e inferiores, y en CPU con llama.cpp para IQ2/IQ3. Sin confirmacion del autor.
- Opciones de despliegue: llama.cpp y Ollama son las opciones naturales por el formato GGUF. vLLM y TGI soportan GGUF de forma parcial o experimental, por lo que requeririan conversion a safetensors para un despliegue de alto rendimiento.
- Latencia y throughput: no disponibles. Dependen del tamano real de parametros, del hardware y del nivel de cuantizacion, y no se aporta ninguna medicion.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos verificables de parametros, contexto, rendimiento ni licencia del modelo, ni de sus alternativas, por lo que cualquier tabla comparativa seria especulativa. Como referencia de partida para una comparacion futura, el unico modelo relacionado documentado es el base:

| Modelo | Relacion | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| mshodiqul/qwen3.5-9b-uncensored | Modelo base declarado | no disponible | no disponible | no disponible | no disponible |
| mradermacher/qwen3.5-9b-uncensored-i1-GGUF | Cuantizacion del anterior | no disponible (metadatos: 1.278.200, incoherente) | no disponible | no disponible | GGUF |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de documentacion: sin licencia, sin idiomas, sin contexto, sin arquitectura y sin datos de entrenamiento. No es desplegable en produccion en estas condiciones.
- Incoherencia en el recuento de parametros: el unico dato numerico disponible (1.278.200) no cuadra con el sufijo "9b" del nombre. Puede tratarse de un artefacto del pipeline de publicacion y debe verificarse antes de estimar requisitos de hardware.
- Trazabilidad limitada de la cadena de custodia: el modelo base es un repositorio de terceros sin verificacion, y las cuantizaciones se generan automaticamente, sin evaluacion de calidad publicada.
- Riesgo de alucinacion: desconocido y no medido. En modelos ajustados para reducir rechazos ("uncensored"), la tasa de afirmaciones no fundamentadas suele aumentar, pero no hay datos que lo confirmen en este caso.
- Sesgos: no evaluados. La eliminacion de filtros de seguridad puede incrementar la generacion de contenido sesgado, toxico o legalmente problematico.
- Restricciones de licencia: indeterminadas. Sin licencia declarada, no hay autorizacion explicita de uso comercial, por lo que el uso en produccion es juridicamente arriesgado.
- Limitaciones de contexto e idioma: no disponibles. No se puede garantizar el comportamiento en castellano ni en conversaciones multi-turno largas.
- Adopcion nula: 0 descargas y 0 likes implican ausencia de validacion por parte de la comunidad y practicamente ninguna probabilidad de soporte o mantenimiento.
- Fecha de publicacion anomala (octubre de 2026) y tamano de repo de 0.0 GB: indicios de que el repositorio puede estar incompleto o mal indexado en el momento de la consulta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/qwen3.5-9b-uncensored-i1-GGUF
- Modelo base declarado en la model card: https://huggingface.co/mshodiqul/qwen3.5-9b-uncensored
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
