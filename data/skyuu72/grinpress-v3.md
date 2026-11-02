# skyuu72/grinpress-v3

## Resumen

grinpress v3 es un modelo de texto a imagen de dominio muy restringido, desarrollado por el usuario skyuu72, que genera caras sonrientes (y otras expresiones faciales estilizadas) acompanadas de una cadena de texto corta de hasta 14 caracteres, renderizadas sobre un fondo que imita papel de periodico o sepia. No es un modelo generativo de proposito general: es un estudiante destilado de un profesor mas grande basado en rectified flow, comprimido a 2 o 4 pasos de inferencia y exportado a ONNX en INT8 para ejecutarse en CPU sin GPU.

El modelo parte de `skyuu72/grinpress` como modelo base y aplica destilacion por rectified flow para reducir el numero de pasos de muestreo (el profesor usaba 50 pasos Euler con CFG 5). El resultado son dos variantes de estudiante, de 2 y 4 pasos, exportadas a ONNX opset 17 tanto en fp32 como en INT8 dinamico (solo MatMul/Gemm). El repositorio ocupa 0,3 GB y el U-Net INT8 pesa 89,5 MB.

Su relevancia es acotada pero clara: demuestra que es posible obtener un modelo de texto a imagen con capacidad de renderizado de texto legible (OCR-verificable) en un entorno de CPU pura, con latencias por debajo del segundo en hardware con instrucciones AVX-512 VNNI y AMX-INT8. Es un caso de estudio de destilacion agresiva y cuantizacion para despliegue en el borde, no una alternativa a modelos de difusion de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net de difusion con rectified flow (estudiante destilado); text encoder propio |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada de texto libre para condicionamiento) |
| Tipos de cuantizacion | fp32 y INT8 dinamico (solo MatMul/Gemm) en ONNX |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17) y safetensors (fp16 para el estudiante PyTorch) |

## Arquitectura y entrenamiento

El modelo es un estudiante destilado de un profesor basado en rectified flow. El profesor original generaba imagenes con 50 pasos Euler y CFG 5; el estudiante se entrena para producir resultados equivalentes en 2 o 4 pasos. La arquitectura subyacente es un U-Net de difusion con un text encoder separado, ambos exportados a ONNX. El checkpoint exportado corresponde a la EMA final del paso 20000, no al mejor checkpoint de validacion (el historial de validacion en PyTorch alcanzo 0,979 en 4 pasos en los pasos 2000/6000/10000 y 0,979 en 2 pasos en el paso 14000).

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se empleo RLHF o DPO (no aplica en un modelo de texto a imagen). La innovacion tecnica destacable es la combinacion de destilacion por rectified flow para reducir pasos, exportacion a ONNX con cuantizacion INT8 dinamica y un pipeline de evaluacion basado en un juez OCR CRNN afinado especificamente para medir la fidelidad del texto renderizado.

## Capacidades

- Generacion de texto a imagen de 128 px con caras estilizadas (smiley, sad, meh, wink, angry, dead, uwu) y una cadena de texto adyacente de hasta 14 caracteres.
- Renderizado de texto legible verificable por OCR (CRNN exact match case-sensitive) sobre fondo tipo periodico o sepia.
- Control de posicion relativa de la cara y el texto (por ejemplo, cara a la derecha) mediante el prompt.
- Inferencia en 2 o 4 pasos, sin CFG en el estudiante.
- Ejecucion en CPU pura mediante ONNX Runtime, sin necesidad de GPU.
- Soporte de cuantizacion INT8 dinamica para reducir latencia y tamano.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues (solo ingles).
- No dispone de modo thinking, vision, audio ni otras capacidades multimodales mas alla de la generacion de imagen.

## Casos de uso

- Generacion de avatares o iconos con texto corto en aplicaciones de chat o foros: el modelo produce una cara y una etiqueta de hasta 14 caracteres en una sola pasada de 2 o 4 pasos, adecuado para entornos sin GPU.
- Pruebas de renderizado de texto en pipelines de difusion: sirve como banco de pruebas controlado para medir la fidelidad OCR de un modelo pequeno antes de escalar a modelos mayores.
- Demostraciones interactivas en Spaces de Hugging Face sobre CPU: el demo oficial funciona en CPU con INT8, lo que permite ofrecer una demo publica sin coste de GPU.
- Generacion de placeholders visuales en herramientas de diseno o documentacion: caras con etiquetas cortas para mockups, con latencia inferior a un segundo en hardware con VNNI/AMX.
- Educacion y divulgacion sobre destilacion y cuantizacion: el repositorio incluye evaluaciones, benchmarks y notas de fallos que lo convierten en material didactico para estudiar el impacto de la cuantizacion INT8 en la calidad de salida.
- Evaluacion de jueces OCR: el CRNN afinado incluido (`crnn_ft.safetensors`) puede reutilizarse como componente de evaluacion en experimentos de generacion de texto en imagen.
- Prototipado de sistemas de generacion de texto en imagen en dispositivos de borde: al caber en 89,5 MB (U-Net INT8) y 2,0 MB (text encoder INT8), es viable en entornos con recursos muy limitados.

## Benchmarks y rendimiento

Metrica principal: CRNN exact match case-sensitive sobre las 48 cadenas reservadas de grid48. Los estudiantes se evaluan como el INT8 ONNX enviado (`unet_distilled_int8.onnx` + `text_encoder_int8.onnx`).

| Modelo | grid48 CRNN exact | CRNN char acc | Tesseract exact |
|---|---|---|---|
| Profesor (mejor checkpoint, paso 13000) | 1,0 (48/48) | no disponible | no disponible |
| Estudiante 4 pasos (INT8 ONNX) | 0,958 (46/48) | 0,991 | 0,729 |
| Estudiante 2 pasos (INT8 ONNX) | 0,9375 (45/48) | 0,983 | 0,708 |
| Referencias procedurales | 0,979 (47/48) | 0,998 | 0,542 |

En grid14 (profesor frente a estudiante), CRNN exact: referencia 1,0, profesor 0,929, estudiante 4 pasos 1,0, estudiante 2 pasos 1,0.

Prueba de estres con 35 palabras nuevas (longitud hasta 14 caracteres, mayusculas y minusculas mezcladas, puntuacion y numeros) por 7 expresiones a 2 y 4 pasos: CRNN exact global 4 pasos 0,971 y 2 pasos 0,984; sin fallos en mayusculas y minusculas mezcladas ni en puntuacion y numeros. Las frases largas de 12 a 14 caracteres junto a la cara son el punto debil (4 pasos 0,918), con glifos de unos 5-6 px.

Latencia en CPU (batch 1, 128 px, text encoder + todos los pasos del U-Net, onnxruntime CPU EP, tras calentamiento; Intel Xeon de 8 vCPU con AVX-512 VNNI y AMX-INT8, 15 GB RAM, onnxruntime 1.31.1, 8 hilos):

| INT8 U-Net + INT8 text encoder | Media ± desviacion (30 reps) | Mediana (10 reps) |
|---|---|---|
| 2 pasos | 0,270 s ± 0,021 | 0,305 s |
| 4 pasos | 0,540 s ± 0,040 | 0,534 s |

En el runtime CPU de Colab (Intel Xeon a 2,20 GHz, 12 hilos) la misma combinacion INT8 dio 0,536 s (2 pasos) y 0,988 s (4 pasos) de mediana, por lo que 4 pasos no alcanzo el objetivo alli. Con 4 hilos, INT8+INT8 fue 0,282 / 0,577 s de media.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el modo CPU; en GPU no se proporcionan estimaciones. Los pesos INT8 suman aproximadamente 91,5 MB (U-Net 89,5 MB + text encoder 2,0 MB); los fp32 suman aproximadamente 136,2 MB (129,5 MB + 6,7 MB).
- GPU recomendadas: no disponibles; el modelo esta disenado para CPU.
- Cabe en GPU consumer: si, por tamano, aunque no se han publicado mediciones en GPU.
- Opciones de despliegue: ONNX Runtime (CPU EP) es el soporte principal; el repositorio incluye pesos safetensors fp16 del estudiante PyTorch, lo que permite inferencia en PyTorch. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: 0,270 s de media (2 pasos) y 0,540 s de media (4 pasos) en el hardware de referencia con INT8+INT8 y 8 hilos; 0,536 s y 0,988 s de mediana en Colab CPU. El rendimiento depende fuertemente de las instrucciones INT8 de la CPU (VNNI/AMX).

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada. La comparacion interna disponible es la siguiente:

| Modelo | Pasos | grid48 CRNN exact | Tamano de pesos | Licencia |
|---|---|---|---|---|
| grinpress v3 estudiante 4 pasos (INT8) | 4 | 0,958 | ~91,5 MB (INT8) | MIT |
| grinpress v3 estudiante 2 pasos (INT8) | 2 | 0,9375 | ~91,5 MB (INT8) | MIT |
| grinpress v3 profesor | 50 | 1,0 | no disponible | MIT |
| Referencias procedurales | no aplica | 0,979 | no disponible | no disponible |

## Limitaciones y advertencias

- Dominio extremadamente restringido: solo genera caras estilizadas con texto adyacente de hasta 14 caracteres; no es un modelo de texto a imagen de proposito general.
- Solo idioma ingles; no se ha validado en otros idiomas.
- El juez OCR CRNN tiene una precision de aproximadamente el 98 % (47/48 en las referencias), por lo que todos los numeros CRNN heredan ese margen de error. La puerta de calidad del 98 % fallo y se anulo con aprobacion del usuario (`CRNN_GATE=0.979`).
- El checkpoint exportado es la EMA final del paso 20000, no el mejor checkpoint de validacion; el orden entre 2 y 4 pasos se invierte entre la validacion en PyTorch y la evaluacion final en INT8 ONNX (diferencias de una imagen sobre 48).
- El error de cuantizacion INT8 es pequeno pero real: diferencia maxima de velocidad 0,184, media 0,0022, diferencia media de imagen 0,098 valores de pixel.
- Punto debil identificado: frases largas de 12 a 14 caracteres junto a la cara generan glifos de 5-6 px y fallan mas (4 pasos 0,918); el propio CRNN solo lee el 75,5 % de las referencias largas.
- Fallos a nivel de caracter observados: `HHi!` duplicado, `m` malformada, manchas de tinta entre palabras y espacios comprimidos.
- La latencia depende en gran medida de la CPU; en hardware sin VNNI/AMX (como el runtime de Colab) el modo de 4 pasos no alcanza el objetivo de 0,65 s.
- Licencia MIT: permite uso comercial, pero al ser un modelo de dominio muy limitado, su utilidad comercial practica es reducida.
- Riesgo de alucinacion en el texto renderizado: aunque el modelo intenta reproducir la cadena solicitada, se han documentado errores de caracteres y de espaciado que pueden alterar el contenido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skyuu72/grinpress-v3
- Demo en CPU INT8 (Space): https://huggingface.co/spaces/skyuu72/grinpress-v3-demo
- Modelo base: https://huggingface.co/skyuu72/grinpress
