# hitheshkaranth/skanda-grounding-int8

## Resumen
Skanda int8 es la build cuantizada a int8 del checkpoint run-3 de Skanda Grounding, un modelo multimodal de radiologia desarrollado por Hithesh Karanth. El modelo lee radiografias de torax, tomografias computarizadas y resonancias magneticas, redacta un informe estructurado y delimita cada hallazgo mediante un token `[SEG]` por hallazgo que se decodifica con SAM 2.1. La base es Qwen3-VL-30B-A3B, un transformer de tipo mixture-of-experts con 30.000 millones de parametros totales y aproximadamente 3.000 millones activos por token, sobre el que se ha aplicado un ajuste fino con LoRA y se ha acoplado un cabezal de segmentacion.

La relevancia de esta build concreta es la reduccion de huella: pasa de 62,6 GB en bf16 a 32,8 GB en int8, manteniendo practicamente intacta la calidad segun las mediciones del autor (perdida por token de 0,0824 frente a 0,0823 en bf16, y benchmarks dentro de un punto salvo el caso de CT sin lesiones, que cae del 91 % al 85 %). Solo se cuantizan los pesos del modelo de lenguaje; el decodificador SAM 2.1, el proyector `[SEG]` y el cabezal de puntuacion permanecen en bf16.

El modelo es de uso exclusivamente investigador, no es un producto sanitario y no ha recibido aprobacion regulatoria de ningun organismo. La licencia es propietaria (`skanda-private`) y el codigo de inferencia necesario para cargarlo reside en un repositorio privado de GitHub, lo que limita de facto su reproducibilidad por terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL-30B-A3B (transformer multimodal MoE) con LoRA fusionado y cabezal SAM 2.1 para segmentacion |
| Parametros totales | 30.000 millones (modelo base Qwen3-VL-30B-A3B) |
| Parametros activos | aproximadamente 3.000 millones por token (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 per-row weight-only (expertos MoE y atencion); existe tambien build int4 group-128 |
| Idiomas soportados | ingles (en) |
| Licencia | other / skanda-private (propietaria, solo investigacion) |
| Formato de pesos | safetensors para el VLM cuantizado (`vlm/`), `skanda_heads.pt` para SAM 2.1 y cabezales, mas `skanda_quant.json` y `skanda_config.json` |
| Tamano del repositorio | 6,1 GB (pesos int8 del checkpoint: 32,8 GB segun model card) |
| Modalidades de entrada | imagen medica (radiografia de torax, CT, MRI) y texto |
| Salida | texto estructurado (informe) y mascaras/boxes de segmentacion |

## Arquitectura y entrenamiento
El modelo combina dos componentes. Por un lado, un VLM Qwen3-VL-30B-A3B en el que se ha fusionado un adaptador LoRA del run-3 y cuyos pesos se han cuantizado a int8 por filas, unicamente para los expertos MoE y las capas de atencion. Por otro, un modulo de segmentacion basado en SAM 2.1 (codificador de imagen y decodificador de mascaras entrenado), un proyector que mapea el token `[SEG]` al espacio de segmentacion y un cabezal de puntuacion que decide si un hallazgo es anormal. Estos componentes permanecen en bf16.

El pipeline de inferencia emite un token `[SEG]` por cada hallazgo detectado en el informe generado; cada token se decodifica con SAM 2.1 para producir la mascara correspondiente. La compuerta de anormalidad se recalibro especificamente sobre las lecturas de esta build int8 del conjunto de calibracion (datos de validacion, nunca de test). No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO. La cuantizacion int8 se implementa en `skanda/quant.py`, que mantiene los pesos en int8 en memoria y desquantiza cada experto MoE solo cuando un token es enrutado hacia el.

## Capacidades
- Generacion de informes radiologicos estructurados a partir de imagenes de torax, CT y MRI.
- Deteccion y delimitacion de hallazgos mediante segmentacion (mascaras y boxes) guiada por token `[SEG]`.
- Grounding visual: cada hallazgo del texto se asocia a una region concreta de la imagen.
- Clasificacion de normalidad/anormalidad mediante cabezal de puntuacion y compuerta calibrada.
- Procesamiento multimodal imagen-texto en una sola pasada (pipeline `image-text-to-text`).
- Soporte multilingue limitado al ingles.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico.
- No se documenta modo de razonamiento explicito (thinking mode), audio ni video.

## Casos de uso
- **Triaje radiologico asistido**: el modelo puede priorizar estudios de torax, CT y MRI marcando los que presentan hallazgos anormales, gracias a la compuerta de anormalidad calibrada y a la salida estructurada de informe.
- **Pre-redaccion de informes**: genera un borrador de informe con hallazgos tipificados que el radiologo revisa y corrige, reduciendo el tiempo de dictado en estudios de rutina.
- **Segmentacion de lesiones para cuantificacion**: las mascaras producidas por SAM 2.1 permiten medir areas y volumenes de lesiones en CT y MRI, utiles en seguimiento longitudinal de pacientes.
- **Anotacion asistida de datasets**: el modelo puede proponer boxes y mascaras sobre estudios no etiquetados para acelerar la creacion de conjuntos de entrenamiento supervisados, siempre con revision humana.
- **Investigacion en modelos de grounding medico**: sirve como referencia reproducible (dentro de las limitaciones de licencia y codigo privado) para estudiar el efecto de la cuantizacion int8 sobre tareas de segmentacion y generacion de informes.
- **Despliegue en hardware limitado**: con 32,8 GB de pesos int8, permite ejecutar un VLM radiologico de 30B en una unica GPU de 40-48 GB, algo inviable con la build bf16 de 62,6 GB.
- **Comparacion de pipelines multimodales**: util para evaluar frente a MedGemma 27B y MAIRA-2 en tareas de deteccion y localizacion de hallazgos, usando los mismos conjuntos de test.

## Benchmarks y rendimiento
Resultados en porcentaje sobre casos de test no vistos en entrenamiento, segun la model card del autor. Radiografia de torax: 111 peliculas de ChestX-Det, media de dos pasadas. CT y MRI: conjunto fijo de cortes y volumenes, con y sin lesiones.

| Radiografia de torax (111) | MedGemma 27B bf16 | MAIRA-2 bf16 | MedGemma + MAIRA-2 bf16 | Skanda bf16 | Skanda int8 | Skanda int4 |
|---|---:|---:|---:|---:|---:|---:|
| Anormal detectado | 86 | 89 | 87,5 | 84,5 | 86 | 85,5 |
| Normales clasificados como normales | 72 | 72 | 72 | 69 | 69 | 72 |
| Tipo de hallazgo correcto | 36 | 34 | 42 | 39 | 40,5 | 36 |
| Precision de box | 8,5 | 30 | 10,5 | 24,5 | 24 | 17,5 |
| Recall de box | 5,5 | 13 | 7 | 9,5 | 8,5 | 8,5 |

| CT | MedGemma 27B bf16 | Skanda bf16 | Skanda int8 | Skanda int4 |
|---|---:|---:|---:|---:|
| Anormal detectado | 97 | 82 | 82 | 82 |
| Normales clasificados como normales | 6 | 91 | 85 | 78 |
| Tipo de hallazgo correcto | 49 | 72 | 72 | 74 |
| Precision de box | 1 | 22 | 21 | 19 |
| Recall de box | 3 | 16 | 16 | 15 |

| MRI | MedGemma 27B bf16 | Skanda bf16 | Skanda int8 | Skanda int4 |
|---|---:|---:|---:|---:|
| Anormal detectado | 99 | 89 | 89 | 88 |
| Normales clasificados como normales | 2 | 94 | 92 | 93 |
| Tipo de hallazgo correcto | 42 | 89 | 87 | 80 |
| Precision de box | 6 | 70 | 70 | 75 |
| Recall de box | 8 | 65 | 67 | 49 |

| Perdida NLL por token sobre respuestas propias en bf16 | bf16 | int8 | int4 |
|---|---:|---:|---:|
| MedGemma 27B | 0,1169 | 0,1224 | 0,1629 |
| MAIRA-2 | 0,2971 | 0,3026 | 0,3456 |
| Skanda | 0,0823 | 0,0824 | 0,1181 |
| Skanda, validacion con objetivos de radiologo | 0,1600 | 0,1607 | 0,1865 |

Nota metodologica del autor: cada cifra de radiografia de torax varia aproximadamente ±10 puntos por azar sobre 111 peliculas. Las cifras de box en CT/MRI usan IoU >= 0,3 con el contorno del radiologo y emparejamiento uno a uno. La columna bf16 de Skanda se releyo el 8 de noviembre de 2026 con el mismo codigo y calibracion que las builds cuantizadas.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 33 GB para los pesos int8 del VLM, mas el codificador de imagen SAM 2.1, el decodificador de mascaras, el proyector `[SEG]` y el cabezal de puntuacion en bf16, lo que en la practica exige una GPU de 40-48 GB o superior.
- GPU recomendadas: A100 80 GB, H100 80 GB, L40S 48 GB, A6000 48 GB. La build bf16 (62,6 GB) requiere A100/H100 de 80 GB.
- Cabe en GPU de consumo: no de forma holgada. Una RTX 4090 de 24 GB no admite la build int8 completa; seria necesario recurrir a la build int4 (18,2 GB) o a offloading, no documentado por el autor.
- Opciones de despliegue: el autor indica que la carga requiere su codigo de inferencia (`skanda/serve.py`, `skanda/quant.py`) del repositorio privado `Hitheshkaranth/skanda-grounding`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada. La desquantizacion bajo demanda por experto MoE anade sobrecarga en tiempo de ejecucion no cuantificada en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Skanda int8 | 30B totales, ~3B activos (MoE) | no disponible | Torax, CT, MRI + texto; salida con segmentacion | Propietaria, solo investigacion | Pesos en HF, codigo de inferencia privado |
| MedGemma 27B | 27B | no disponible | Imagen medica + texto | Licencia propia de Google (no detallada aqui) | Publico en HF |
| MAIRA-2 | no disponible | no disponible | Radiografia de torax + texto | Solo investigacion | Publico en HF |

En los datos del autor, Skanda int8 supera a MedGemma 27B y a MAIRA-2 en tipo de hallazgo correcto y en precision/recall de box en CT y MRI, y queda por detras de MAIRA-2 en precision de box sobre radiografia de torax (24 frente a 30). MedGemma 27B obtiene mejor deteccion de anormalidad en CT (97 frente a 82) pero muy peor especificidad en estudios normales (6 frente a 85 en Skanda int8). Estas comparaciones proceden del benchmark del propio autor y no de una evaluacion independiente.

## Limitaciones y advertencias
- Uso exclusivamente investigador: el modelo no es un producto sanitario, no esta aprobado por ningun regulador y no debe usarse para decision clinica sin revision de un radiologo.
- Licencia propietaria (`skanda-private`): no se permite uso comercial y las condiciones exactas no estan publicadas en la model card.
- Codigo de inferencia en repositorio privado: sin acceso a `skanda/serve.py` y `skanda/quant.py` no es posible cargar el checkpoint, lo que impide la reproducibilidad por terceros.
- Solo ingles: no hay soporte documentado de otros idiomas.
- Rendimiento debil en radiografia de torax: tipo de hallazgo correcto en torno al 40 % y precision de box en torno al 24 %, con variabilidad de ±10 puntos por azar sobre 111 peliculas.
- Regresion por cuantizacion en CT sin lesiones: la tasa de normales correctamente clasificados cae del 91 % en bf16 al 85 % en int8.
- Riesgo de alucinacion: al ser un modelo generativo que redacta informes, puede describir hallazgos no presentes; la compuerta de anormalidad y el cabezal de puntuacion mitigan pero no eliminan este riesgo.
- Baja sensibilidad a anormalidades en CT y MRI frente a MedGemma (82 % y 89 % frente a 97 % y 99 %), lo que puede traducirse en falsos negativos.
- Sin datos publicados sobre sesgos demograficos, composicion del dataset de entrenamiento ni contexto maximo soportado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/hitheshkaranth/skanda-grounding-int8
- Modelo base (bf16): https://huggingface.co/hitheshkaranth/skanda-grounding
- Perfil de GitHub del autor: https://github.com/Hitheshkaranth
- Repositorio de GitHub del autor: https://www.github.com/Hitheshkaranth/Hitheshkaranth
- Repositorio privado con el codigo de inferencia (referenciado en la model card): Hitheshkaranth/skanda-grounding
