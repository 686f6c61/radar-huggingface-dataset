# OliviaRossi/Minimax-h3_Singularity-x-10Eros-Max_PRISM

## Resumen

Minimax-h3_Singularity-x-10Eros-Max_PRISM es un merge de pesos publicado por el usuario OliviaRossi en HuggingFace. Combina dos finetunes del modelo MiniMax-H3 etiquetados como ref2va: `WarmBloodAban/Minimax-h3_Singularity` (fichero `Minimax-h3_Singularity_ref2va_v2_bf16.safetensors`) y `TenStrip/10Eros-Max` (variante turbo de 8 pasos, `10Eros_Max_h3_8stepTURBO_beta6_bf16.safetensors`). El resultado se distribuye como un unico fichero safetensors en fp16 dentro de un repositorio de 102,4 GB.

El interes no esta en el modelo base, del que la model card no ofrece ningun detalle de arquitectura, tamano ni datos de entrenamiento, sino en el algoritmo de fusion que da nombre al merge: PRISM, un procedimiento en cuatro etapas que combina descomposicion SVD con separacion estructurada/ruidosa, interpolacion geodesica polar por filas, mediacion de conflictos de signo y reanclaje de magnitud. La card documenta ademas la proporcion de pesos del modelo B por bloque temporal, con una rampa de 0,45 en las capas tempranas a 0,65 en las tardias.

Es relevante como caso de estudio de tecnicas de model merging sobre modelos generativos de gran tamano, no como modelo listo para produccion: acumula cero descargas, seis likes y ninguna evaluacion publicada en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (merge de pesos de dos finetunes de MiniMax-H3; la card no documenta la arquitectura subyacente) |
| Parametros totales | No disponible (por el tamano del fichero fp16, estimacion no confirmada en el entorno de ~50 000 millones) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Solo fp16 publicado; no se distribuyen GGUF, int8, fp8 ni variantes de 4 bits |
| Idiomas soportados | No disponible |
| Licencia | other (sujeta a las licencias de los modelos base, que deben verificarse) |
| Formato de pesos | safetensors (fp16), fichero unico `Minimax-h3_Singularity_x_10Eros-Max_PRISM_fp16.safetensors` |
| Tarea declarada | ref2va (segun tags y libreria `minimax-h3`) |
| Variante de muestreo | Turbo de 8 pasos heredada del modelo B |
| Algoritmo de merge | PRISM (SVD espectral + geodesica polar + mediacion de signos + reanclaje) |
| Tamano del repositorio | 102,4 GB |
| Autor | OliviaRossi |
| Descargas / likes | 0 / 6 |
| Fecha de creacion | 2026-10-24 (actualizado el mismo dia) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo subyacente MiniMax-H3: no hay datos de capas, atencion, tipo de transformer ni modalidad explicita. Los unicos indicios son el tag `ref2va`, la libreria declarada `minimax-h3`, la presencia de un video de demostracion (`TestMe.mp4`) y la existencia de un finetune "8-step turbo", patron habitual en modelos generativos con destilacion de pasos de muestreo. Cualquier afirmacion sobre si es difusion, transformer multimodal o hibrido seria especulacion: no disponible.

Si esta documentado el proceso de fusion PRISM, aplicado sobre el par A = Singularity (v2 bf16) y B = 10Eros-Max (turbo 8 pasos): (1) separacion D = B - A mediante SVD aleatorizado en una parte estructurada L de rango <= 64 y un resto difuso R, con B' = A + L + gamma·R y gamma adaptativo en [0,92, 1]; (2) interpolacion geodesica polar por fila de salida, con direccion por SLERP y magnitud interpolada en dominio logaritmico; (3) mediacion de conflictos de signo, atrayendo los elementos salientes de signo opuesto hacia el ganador ponderado; (4) reanclaje de magnitud para devolver cada fila a la norma geometrica objetivo. La proporcion de B por bloque sigue `{'t_early': 0.45, 't_late': 0.65, 't_default': 0.55, 't_time': 0.75, 't_head': 0.7, 't_ref': 0.45}`, con rampa suave de capas tempranas a tardias y media aproximada de 0,55. No hay informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni etapas de RLHF/DPO: el merge no entrena, solo recombina pesos ya ajustados.

## Capacidades

- Generacion condicionada por referencia (`ref2va`): el tag y el video de demo apuntan a generacion audiovisual a partir de una referencia, aunque la card no especifica la modalidad exacta.
- Muestreo rapido: hereda la variante turbo de 8 pasos del modelo B, pensada para reducir el coste de inferencia frente a schedules largos.
- Mezcla de comportamientos: al integrar ~55 % de B de media, el merge persigue conservar el estilo del finetune 10Eros-Max sin perder la base de Singularity.
- Soporte de tool calling / function calling: no documentado y no esperable en un merge de pesos de este tipo.
- Soporte de agentes o razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas.
- Modos especiales (thinking, vision, audio): no documentados salvo la etiqueta `ref2va`.

## Casos de uso

- Experimentacion en model merging: PRISM sirve como referencia reproducible para probar separacion espectral + geodesica polar sobre modelos de gran tamano; el `merge_report.json` permite auditar que tensores entraron en la ejecucion final.
- Prototipado de generacion condicionada por referencia: si se confirma la modalidad ref2va, el modelo permitiria generar contenido audiovisual a partir de una imagen o clip de referencia en pocos pasos, util para pruebas de concepto de producto.
- Investigacion sobre destilacion de pasos: comparar el resultado de mezclar un finetune turbo de 8 pasos con una variante bf16 estandar permite medir cuanto del comportamiento turbo se conserva tras la fusion.
- Creacion de variantes de estilo: la rampa de proporciones por bloque (0,45 en capas tempranas, 0,65 en tardias) sugiere un control fino del grado de "estilo B" aplicado por profundidad, reutilizable para ajustar un merge propio.
- Base para futuros finetunes: al estar en fp16 y safetensors, puede servir como punto de partida para LoRA o ajustes posteriores, siempre que la licencia de los modelos base lo permita.
- Docencia y formacion tecnica: caso practico de tecnicas avanzadas de merging (SVD truncada, SLERP, resolucion de conflictos de signo) con hiperparametros publicados y trazabilidad de origenes.
- Analisis forense de pesos: util para estudiar como se propaga el ruido de una SVD truncada a rango 64 sobre un modelo de ~100 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, MMLU, HumanEval ni similares), no hay evaluaciones de terceros y el repositorio acumula cero descargas, por lo que no existe evidencia empirica de calidad del merge frente a sus modelos base.

## Requisitos de hardware

- VRAM estimada: el fichero fp16 ocupa practicamente todo el repositorio de 102,4 GB, de modo que la inferencia en fp16 requiere del orden de 100-110 GB de memoria, incluyendo overhead de activaciones.
- GPU recomendadas: 2x A100 80 GB o 2x H100 80 GB en fp16 sin cuantizar; una unica H200 de 141 GB o B200 simplificarian el despliegue.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en una RTX 5090 (32 GB). Solo seria viable con offload a RAM del sistema, a costa de una latencia muy superior.
- Cuantizacion: no se publican ficheros GGUF, int8 ni fp8, por lo que no existe una ruta probada para reducir huella de memoria; habria que generarla a partir del safetensors original.
- Despliegue: vLLM, TGI, llama.cpp u Ollama no son aplicables a priori (estan orientados a LLM y no hay formato compatible documentado). Se asume un runtime propio de la libreria `minimax-h3`, cuya documentacion no esta disponible.
- Latencia y throughput: no disponibles. El esquema turbo de 8 pasos reduce el numero de evaluaciones por muestra frente a schedules de 20-50 pasos, pero no se aportan tiempos medidos.

## Comparativa con modelos similares

| Modelo | Rol | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Minimax-h3_Singularity-x-10Eros-Max_PRISM | Merge PRISM de A y B | no disponible | no disponible | no disponible | other | Publico, 0 descargas |
| WarmBloodAban/Minimax-h3_Singularity | Modelo A (base ref2va v2, bf16) | no disponible | no disponible | no disponible | no disponible en la informacion | Publico |
| TenStrip/10Eros-Max | Modelo B (finetune turbo 8 pasos) | no disponible | no disponible | no disponible | no disponible en la informacion | Publico |

No se identifican en la informacion proporcionada otros merges comparables de MiniMax-H3 con los que contrastar parametros, contexto o metricas. La comparacion cuantitativa queda pendiente de que alguno de los tres repositorios publique especificaciones o evaluaciones.

## Limitaciones y advertencias

- Ausencia total de evaluacion: sin benchmarks, sin demos mas alla del video de la card y sin descargas registradas; no hay evidencia de que el merge mejore a ninguno de sus dos origenes.
- Documentacion insuficiente: no se declaran arquitectura, parametros, contexto, idiomas ni modalidad exacta, lo que impide planificar integraciones en produccion.
- Licencia `other` heredada: los terminos concretos dependen de los modelos base y deben revisarse antes de cualquier uso comercial; la card lo indica explicitamente.
- Riesgo de alucinacion y artefactos: en modelos generativos, la fusion de pesos sin validacion puede producir degradaciones dificiles de detectar, especialmente en modos turbo de pocos pasos.
- Nomenclatura y procedencia: el nombre del finetune B (`10Eros-Max`) sugiere un ajuste orientado a contenido para adultos; conviene auditar el modelo y aplicar filtros de contenido antes de exponerlo a usuarios finales.
- Sesgos: no documentados. Al combinar dos finetunes de origen desconocido, los sesgos de ambos pueden acumularse sin que exista un informe de evaluacion.
- Reproducibilidad parcial: la card advierte de que el `merge_report.json` cubre los tensores de la ejecucion final si el trabajo se reanudo, por lo que el proceso puede no ser replicable paso a paso.
- Metadatos dudosos: la fecha de creacion declarada (2026-10-24) es posterior a la de redaccion habitual de fichas; conviene verificar la trazabilidad del repositorio.
- Restricciones de contexto e idioma: no aplicables por falta de datos, pero implican que no se puede garantizar un comportamiento multilingue ni ventanas largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OliviaRossi/Minimax-h3_Singularity-x-10Eros-Max_PRISM
- Modelo base A: https://huggingface.co/WarmBloodAban/Minimax-h3_Singularity
- Modelo base B: https://huggingface.co/TenStrip/10Eros-Max
- Informe de merge: https://huggingface.co/OliviaRossi/Minimax-h3_Singularity-x-10Eros-Max_PRISM/blob/main/merge_report.json
- Video de demostracion: https://huggingface.co/OliviaRossi/Minimax-h3_Singularity-x-10Eros-Max_PRISM/resolve/main/TestMe.mp4
- Fichero de pesos fp16: https://huggingface.co/OliviaRossi/Minimax-h3_Singularity-x-10Eros-Max_PRISM/resolve/main/Minimax-h3_Singularity_x_10Eros-Max_PRISM_fp16.safetensors
