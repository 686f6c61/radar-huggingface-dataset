# mazenDDr/receipt-vlm-qwen2.5-vl-3b-GGUF

## Resumen

receipt-vlm-qwen2.5-vl-3b-GGUF es un ajuste fino del modelo multimodal Qwen2.5-VL-3B-Instruct (3.085.938.688 parametros) especializado en la extraccion de campos estructurados de tickets y recibos, publicado en formato GGUF para su uso con llama.cpp. Lo desarrolla el usuario mazenDDr y resuelve un problema muy concreto: convertir la imagen de un recibo en JSON con los campos relevantes (comercio, fecha, lineas de producto, totales), sin depender de APIs externas de OCR.

El modelo se entreno mediante QLoRA sobre el dataset CORD v2 (773 imagenes de entrenamiento, 99 de desarrollo y 100 de test tras eliminar 28 imagenes duplicadas por hash perceptual de 256 bits), con LoRA de rango 16 y alpha 32 aplicado unicamente a las capas del modelo de lenguaje, dejando la torre de vision en bf16. El entrenamiento completo consumio 1,07 horas y 7,6 GB de VRAM pico en una unica RTX 5060 Ti de 16 GB, con 29,9 millones de parametros entrenables.

Su relevancia practica esta en el empaquetado: publica un GGUF Q4_K_M de 1,79 GiB mas un proyector de vision en f32 de 2,49 GiB (obligatorio, no cuantizable), lo que da un despliegue total de 4,28 GiB que cabe en GPUs de consumo. El autor documenta que la cuantizacion a 4 bits no degrada la calidad de forma significativa (Field F1 0,832 frente a 0,846 en bf16) y que reduce la latencia p50 de 2,57 s a 1,51 s por recibo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision encoder + proyector + LLM denso), heredada de Qwen2.5-VL-3B-Instruct |
| Parametros totales | 3.085.938.688 (3,09 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el ejemplo de despliegue del autor usa `-c 4096` y `--image-max-tokens 1024` |
| Tipos de cuantizacion | GGUF Q4_K_M publicada. Q3_K_M y Q2_K descartadas por colapso sin importance matrix. Proyector de vision unicamente en f32 (no cuantizable). Existe un checkpoint AWQ independiente de 3,31 GiB |
| Idiomas soportados | Ingles (en) e indonesio (id), segun las etiquetas del repositorio |
| Licencia | Apache-2.0 (modelo); dataset CORD v2 bajo CC BY 4.0 |
| Formato de pesos | GGUF: `model-Q4_K_M.gguf` (1,79 GiB) + `mmproj-f32.gguf` (2,49 GiB) |
| Tamano total del repositorio | 4,6 GB |
| Tamano de despliegue | 4,28 GiB (pesos + proyector) |
| Pipeline | image-text-to-text |
| Libreria | gguf (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-VL-3B-Instruct, un transformer denso multimodal que combina un codificador de vision con un proyector que alimenta el modelo de lenguaje. El ajuste fino se realizo con QLoRA: el modelo base se cargo en 4 bits NF4, la torre de vision se mantuvo en bf16 y los adaptadores LoRA (rango 16, alpha 32) se aplicaron exclusivamente a las capas del modelo de lenguaje. Se entrenaron 29,9 millones de parametros durante 2 epocas con tasa de aprendizaje 4e-4, calculando la perdida solo sobre los tokens de respuesta. El coste fue de 1,07 horas y 7,6 GB de VRAM pico en una RTX 5060 Ti de 16 GB.

Los datos de entrenamiento son CORD v2, un dataset de recibos con etiquetas de post-OCR parsing. El autor aplico un filtrado de duplicados con hash perceptual de 256 bits que elimino 28 imagenes presentes en mas de un split, dejando 773/99/100 imagenes. Todas las decisiones de configuracion se tomaron sobre el split de desarrollo y el de test se evaluo una sola vez, lo que reduce el riesgo de sobreajuste al conjunto de evaluacion. No se documenta ninguna innovacion en decodificacion especulativa ni atencion lineal; la innovacion tecnica relevante es el hallazgo de que el proyector de vision no puede pasar a f16 (provoca NaN dependiente del contenido) ni cuantizarse, lo que fija 2,49 GiB de coste constante en cualquier despliegue.

## Capacidades

- Extraccion de campos de recibos a JSON estructurado: el modelo genera una salida JSON valida para el 100 % de los 100 recibos del conjunto de test del autor.
- Comprension de documentos con imagen y texto: pipeline image-text-to-text sobre fotografias de tickets.
- Generacion de texto conversacional heredada del modelo base Qwen2.5-VL-3B-Instruct.
- Manejo de convenciones tipograficas de recibos: transcripcion literal de lo impreso, incluidos trazos espurios, y uso indistinto de `.` y `,` como separador de miles en recibos indonesios.
- Capacidades generales del modelo base (razonamiento, codigo, matematicas, tool calling, agentes): no evaluadas ni documentadas por el autor en esta ficha; no se dispone de datos al respecto.
- Capacidades multilingues limitadas a ingles e indonesio en el contexto de esta especializacion.

## Casos de uso

- Digitalizacion de tickets en aplicaciones de finanzas personales: el modelo convierte la foto de un recibo en JSON con comercio, fecha, lineas y total, y su latencia p50 de 1,51 s con Q4_K_M permite procesar la captura en el momento en que el usuario la realiza.
- Automatizacion de notas de gastos en ERP y herramientas de gestion de viajes: se puede integrar como paso previo a la conciliacion contable, generando registros estructurados que alimentan el sistema de gastos, con revision humana obligatoria en los importes.
- Procesamiento por lotes en local o en el borde: al pesar 4,28 GiB y funcionar sobre llama.cpp, se puede ejecutar en un servidor pequeno o en un portatil con GPU de gama media para digitalizar archivos de recibos sin enviar imagenes a servicios externos, lo que simplifica el cumplimiento de requisitos de privacidad.
- Verificacion humana asistida (human-in-the-loop): dado que el autor advierte de errores estructurales ocasionales, el caso realista es usarlo como primer paso que rellena un formulario editable, dejando al operador corregir los campos marcados como dudosos.
- Preprocesado para auditoria y control de gastos: la salida JSON alimenta reglas automaticas de deteccion de anomalias (importes fuera de rango, duplicados, comercios no habituales) antes de la revision manual.
- Reproduccion de pipelines de ajuste fino eficiente: con 7,6 GB de VRAM pico y 1,07 h de entrenamiento, sirve como referencia practica para ajustar modelos multimodales de 3 B en una unica GPU de consumo con QLoRA.
- Prototipado de producto con presupuesto de hardware minimo: permite validar una funcionalidad de lectura de recibos en una GPU de 8 GB o incluso en CPU, antes de decidir si se escala a un modelo mayor.

## Benchmarks y rendimiento

Datos publicados por el autor. La referencia bf16 y Q4_K_M se evaluan sobre los mismos 100 recibos; las comparaciones con el proyector f16 y las cuantizaciones descartadas se hicieron sobre subconjuntos mas pequenos (10 recibos en el caso del proyector), por lo que no son directamente comparables entre si.

| Configuracion | Field F1 | Latencia p50 | Throughput de salida | Notas |
|---|---|---|---|---|
| GGUF bf16 (referencia) | 0,846 | 2,57 s | 41,4 tok/s | 100 recibos |
| GGUF Q4_K_M | 0,832 | 1,51 s | 75,4 tok/s | Diferencia de -0,014 [-0,038; +0,009], no significativa |
| Q4_K_M con proyector f32 | 0,899 | No disponible | No disponible | 10 recibos, 0 truncados |
| Q4_K_M con proyector f16 | 0,540 | No disponible | No disponible | 10 recibos, 60 % truncados, 6 de 10 saturados con `!` por NaN |
| Q3_K_M sin importance matrix | 0,100 | No disponible | No disponible | Colapso |
| Q2_K sin importance matrix | 0,000 | No disponible | No disponible | Mediana de 3 tokens generados |
| Q2_K con importance matrix | No disponible | No disponible | No disponible | Peor que Q4_K_M en test: -0,054 [-0,092; -0,020] |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, DocVQA) en la informacion disponible. El hardware utilizado para las mediciones de latencia y throughput no se especifica.

## Requisitos de hardware

- VRAM estimada para inferencia: 4,28 GiB de pesos (1,79 GiB del modelo en Q4_K_M + 2,49 GiB del proyector en f32). El proyector no se puede cuantizar, por lo que ese coste es fijo. Hay que sumar la cache KV correspondiente al contexto configurado (el ejemplo del autor usa 4096 tokens y 1024 tokens maximos por imagen).
- GPUs recomendadas: cualquier GPU con 6-8 GB o mas de VRAM. El autor entreno en una RTX 5060 Ti de 16 GB, que deja margen sobrado. Una RTX 3060, RTX 4060 o RTX 4090 ejecutan el modelo sin problema; en una RTX 4090 el cuello de botella sera la propia generacion, no la memoria.
- Cabe en GPU de consumo: si, en la mayoria. Con 8 GB hay holgura; con 6 GB conviene reducir el contexto y limitar los tokens por imagen.
- Despliegue: llama.cpp mediante `llama-server`, que es el procedimiento documentado por el autor. Tambien es compatible con Ollama y LM Studio al ser GGUF, siempre que se cargue el proyector f32 como `mmproj`. Para vLLM o TGI conviene usar el checkpoint AWQ del mismo ajuste, no el GGUF.
- Latencia y throughput estimados: 1,51 s de mediana por recibo y 75,4 tokens/s de salida con Q4_K_M; 2,57 s y 41,4 tokens/s con bf16. Hardware de medida no especificado.
- Parametros de generacion recomendados por el autor: `--temp 0 --top-k 1 --repeat-penalty 1.0`, es decir, decodificacion greedy, coherente con una tarea de extraccion determinista.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| receipt-vlm-qwen2.5-vl-3b-GGUF (Q4_K_M) | 3,09 B | No disponible | Field F1 0,832 en 100 recibos de CORD v2 | Apache-2.0 | GGUF en HuggingFace (4,28 GiB de despliegue) |
| receipt-vlm-qwen2.5-vl-3b-awq (mismo ajuste) | 3,09 B | No disponible | No disponible | Apache-2.0 | AWQ, 3,31 GiB; requiere vLLM o similar |
| Qwen/Qwen2.5-VL-3B-Instruct (modelo base) | 3,09 B | No disponible en la informacion proporcionada | No disponible | Apache-2.0 | Safetensors, pesos completos |

El modelo base y el checkpoint AWQ son los unicos terminos de comparacion documentados en la informacion disponible. No se dispone de datos de rendimiento de alternativas especializadas en extraccion de recibos (por ejemplo, variantes de Donut ajustadas a CORD) en el material proporcionado, por lo que no se incluyen cifras comparativas.

## Limitaciones y advertencias

- Aprendio las convenciones de un unico dataset. CORD transcribe literalmente lo impreso, incluidos trazos espurios, y los recibos indonesios usan `.` y `,` de forma intercambiable como separador de miles. En recibos de otras procedencias el formato de salida puede no coincidir con lo esperado.
- Los errores residuales son estructurales, no de percepcion. En el conjunto de test, el peor caso tenia todos los valores correctos y todas las claves equivocadas. Las convenciones de separadores explican alrededor de un tercio de la diferencia numerica.
- No apto para contabilidad sin revision humana: el autor indica explicitamente que descoloca campos con la frecuencia suficiente como para que una persona revise cualquier dato con impacto financiero.
- Riesgo de alucinacion de campos y valores no presente en la imagen, inherente a la tarea de generacion estructurada.
- El proyector de vision debe ser f32. Un proyector f16 produce NaN dependiente del contenido y el modelo emite `!` hasta agotar el limite de generacion, sin ningun aviso en los registros del servidor. Es un fallo silencioso y determinista.
- Las cuantizaciones Q3_K_M y Q2_K no se publican porque colapsan sin importance matrix (Field F1 0,100 y 0,000). Incluso con importance matrix, Q2_K rinde peor que Q4_K_M en test.
- Licencia Apache-2.0, que permite uso comercial. El dataset de entrenamiento CORD v2 esta bajo CC BY 4.0, lo que exige atribucion; conviene revisar los terminos si se redistribuye el modelo.
- Cobertura idiomatica declarada limitada a ingles e indonesio; no hay evidencia de rendimiento en castellano.
- El repositorio no tiene descargas ni likes y fue creado en septiembre de 2026, por lo que no existe validacion independiente de los resultados publicados.
- Los numeros de benchmark corresponden a los splits del propio dataset CORD v2 y a una unica evaluacion en test; no hay evaluacion en dominios externos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mazenDDr/receipt-vlm-qwen2.5-vl-3b-GGUF
- Checkpoint AWQ del mismo ajuste: https://huggingface.co/mazenDDr/receipt-vlm-qwen2.5-vl-3b-awq
- Codigo, harness de evaluacion y notas: https://github.com/mazenDDr/receipt-vlm
- Guia de campos, recorrido por un recibo y 100 extracciones registradas: https://mazenddr.github.io/receipt-vlm/
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/naver-clova-ix/cord-v2
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Cita del dataset: Park et al., CORD: A Consolidated Receipt Dataset for Post-OCR Parsing, 2019.

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces recuperados pertenecen a la tienda online OTTO y no guardan relacion con el contenido de esta ficha.
