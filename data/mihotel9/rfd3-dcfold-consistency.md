# mihotel9/rfd3-dcfold-consistency

## Resumen

RFD3 DCFold Consistency es un repositorio de checkpoints experimentales de destilación (SiD, *Score-based Implicit Distillation*) aplicados al modelo de diseño de proteínas RFD3, orientados a la tarea de diseño de interacciones proteína-proteína (PPI). No se trata de un modelo base ni de los pesos oficiales del profesor RFD3 ni de RFD4-Proteina, sino de tres exportaciones de alumnos (*students*) entrenados hasta 1.000, 2.000 y 3.000 actualizaciones del optimizador, publicadas por el usuario mihotel9 con código asociado en el repositorio `fungloeng/rfd3-dcfold-consistency`.

Cada fichero contiene únicamente el diccionario de estado `G` del alumno y el número de paso; se excluyen el modelo auxiliar `f_psi`, los estados del optimizador, los estados RNG, los datos de entrenamiento y la configuración cruda de la ejecución. Por tanto, estos checkpoints no permiten reanudar el entrenamiento completo ni funcionan de forma autónoma: el pipeline de inferencia actual sigue requiriendo el checkpoint oficial del profesor RFD3 para la configuración del modelo y componentes auxiliares.

El interés del artefacto es acotado y marcadamente de investigación: documenta un intento de escalado de destilación sobre RFD3 con evaluación exploratoria en 24 dianas (AF3) y resultados de pases estrictos de 1/24, 0/24 y 0/24 para 1.000, 2.000 y 3.000 actualizaciones respectivamente. El propio autor advierte que no hay un mejor checkpoint establecido ni evidencia de ventaja consistente sobre el profesor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo PyTorch personalizado derivado de RFD3; no es un Transformers AutoModel) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh (segun metadatos del repositorio) |
| Licencia | no disponible (sujeto a los terminos upstream de RFD3; la model card no otorga licencia independiente) |
| Formato de pesos | `.pt` (PyTorch pickle con diccionario `G` y `step`); tamano del repo 9,6 GB |

## Arquitectura y entrenamiento

El modelo se enmarca en la familia RFD3 (diseño de proteínas por difusión) y emplea una técnica de destilación denominada SiD (destilación implícita basada en score) aplicada a la tarea PPI. Los tres checkpoints exportados corresponden a distintos momentos de un mismo proceso de entrenamiento: 1.000 actualizaciones en la ejecución "repaired-prefix Mix1000, 2026-10-17 r2" y 2.000 y 3.000 actualizaciones en una "scaling continuation" del 2026-10-21. No se dispone de información sobre el número de tokens, la composición del dataset ni la existencia de RLHF o DPO.

La exportación incluye 697 tensores por fichero, verificados uno a uno para igualdad exacta con el alumno original, y un `manifest.json` con tamaños, sumas SHA-256 y procedencia. El sampler existente acepta directamente el diccionario `G` exportado; la invocación de ejemplo usa 48 pasos, sampler `renoise`, `sigma_max 160`, `rho 7`, `n_recycle 2` y semilla 0, y requiere GPU compatible además del checkpoint del profesor. La verificación de la exportación se realizó en CPU y no se ejecutó una nueva inferencia end-to-end en GPU para esta publicación.

## Capacidades

- Diseño de proteínas condicionado, heredado del profesor RFD3, en el marco de la tarea PPI (interacciones proteína-proteína).
- Generación de secuencias y backbones evaluada mediante ProteinMPNN (cuatro secuencias por backbone en la evaluación exploratoria).
- Muestreo con sampler `renoise` y múltiples pasos de reciclado (`n_recycle`), configurable por CLI.
- No hay evidencia publicada de tool calling, function calling, capacidades de agente ni razonamiento multi-paso.
- No se documentan capacidades multilingües más allá de las etiquetas `en` y `zh` del repositorio.
- No se documentan modos especiales (thinking, visión, audio) ni otras modalidades.

## Casos de uso

- Investigación en destilación de modelos generativos de proteínas: usar los tres checkpoints para comparar el efecto del número de actualizaciones (1.000, 2.000, 3.000) sobre métricas continuas y pases estrictos en un protocolo AF3 de 24 dianas.
- Reproducción de resultados de escalado: el repositorio de código incluye el documento `sid/docs/52_scaling_rfd3_final_results_20261022_cn.md` con el protocolo y resultados, lo que permite replicar la evaluación exploratoria con semilla 0.
- Auditoría de exportaciones: cargar los `.pt` en CPU con `torch.load(..., weights_only=True)` para inspeccionar el diccionario `G`, el paso y el número de tensores, y verificar los checksums SHA-256 del `manifest.json`.
- Estudio de consistencia entre destilación y profesor: comparar el comportamiento del alumno frente al checkpoint oficial RFD3 en el pipeline de muestreo, siempre que se disponga de los componentes auxiliares y del profesor.
- Base para experimentos de continuación de escalado: los ficheros `releases/20261106/blitz/final.pt` y `releases/20261106/dcfold/final.pt` incluyen parámetros del alumno, optimizador, estados aleatorios y configuración de entrenamiento grabada, lo que facilita adaptaciones experimentales posteriores (no son implementaciones oficiales).
- Diseño de proteínas de investigación con condicionamiento PPI: ejecutar el sampler con un `design_spec.json` propio para generar candidatos, asumiendo que los resultados no establecen actividad de unión experimental ni ventaja sobre el profesor.

## Benchmarks y rendimiento

| Evaluacion | 1.000 updates | 2.000 updates | 3.000 updates |
|---|---|---|---|
| AF3 exploratoria, pases estrictos (24 dianas) | 1/24 | 0/24 | 0/24 |

La evaluación usó semilla 0, cuatro secuencias ProteinMPNN por backbone y MSA solo de diana, sin condicionamiento por hotspot. El baseline de 2.000 actualizaciones mejoró algunas métricas continuas, pero la mejora no se sostuvo en 3.000 actualizaciones. No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks comparables en la información disponible; estos resultados no establecen una ventaja consistente sobre el profesor ni actividad de unión experimental. La evaluación completa con hotspot emparejado sigue incompleta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible; la invocación de ejemplo requiere una GPU compatible y el repositorio pesa 9,6 GB.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI; es un modelo PyTorch personalizado que se ejecuta mediante `sid/src/sid_ppi/sample.py` con `PYTHONPATH=sid/src`.
- Latencia y throughput: no disponibles.
- La verificación de la exportación se hizo en CPU; no se ejecutó inferencia end-to-end en GPU para esta publicación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RFD3 DCFold Consistency (estos students) | no disponible | no disponible | 1/24, 0/24, 0/24 pases estrictos en AF3 exploratoria | sujeta a terminos upstream de RFD3 | pesos `.pt` en HuggingFace, requiere profesor RFD3 |
| RFD3 (profesor oficial) | no disponible | no disponible | no disponible en esta informacion | no disponible | checkpoint oficial requerido por el pipeline |
| RFD4-Proteina | no disponible | no disponible | no disponible en esta informacion | no disponible | no incluido en este repositorio |

No se dispone de datos suficientes para comparar parámetros, contexto o rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Son checkpoints experimentales de alumnos, no los pesos oficiales del profesor RFD3 ni de RFD4-Proteina; no hay un mejor checkpoint establecido.
- Los ficheros contienen solo `G` y `step`; no permiten reanudar el entrenamiento completo (faltan `f_psi`, optimizador, RNG, datos y configuración cruda).
- El pipeline de inferencia sigue requiriendo el checkpoint oficial del profesor RFD3 para configuración y componentes auxiliares.
- Evaluación muy limitada: 24 dianas, semilla 0, sin condicionamiento por hotspot; la evaluación completa con hotspot emparejado está incompleta.
- Los resultados no establecen ventaja consistente sobre el profesor ni actividad de unión experimental.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Licencia: no se otorga licencia independiente; rigen los términos upstream de RFD3, y la disponibilidad pública del repositorio no sustituye dichos términos.
- Los ficheros `releases/20261106/*/final.pt` son pickles PyTorch que deben cargarse solo desde una fuente de confianza.
- No confundir estas ejecuciones con la serie anterior `update_scaling_20261012`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mihotel9/rfd3-dcfold-consistency
- Repositorio de código: https://github.com/fungloeng/rfd3-dcfold-consistency
- Commit de referencia: `aa06da4fe99c8ff30fb84c9089d8bbe2d10662a7`
- Documento de resultados de escalado: `sid/docs/52_scaling_rfd3_final_results_20261022_cn.md`
- Documento de reproducibilidad y recuperación: https://github.com/fungloeng/rfd3-dcfold-consistency/blob/sid-ppi-online-20260929/sid/docs/REPRODUCIBILITY_AND_RECOVERY_CN.md
