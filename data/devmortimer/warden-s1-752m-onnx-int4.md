# DevMortimer/Warden-S1-752M-ONNX-Int4

## Resumen

Warden-S1-752M-ONNX-Int4 es la distribucion cuantizada a 4 bits en formato ONNX del modelo Warden-S1-752M, un verificador local de "System-1" desarrollado por Ryan Joshua Z. Gapac (DevMortimer) para supervisar agentes de programacion de larga duracion. El modelo no genera texto: en una unica pasada sin tokens generados emite probabilidades calibradas Yes/No, etiquetas de categoria (`Choices`) y puntuaciones de severidad, ademas de localizar el turno culpable (`locus`) y estimar que turnos antiguos son seguros de compactar (`salience`).

La arquitectura combina un backbone transformer con capas Gated DeltaNet (estado recurrente lineal) y cinco cabezas de verificacion en FP32. Con 752 millones de parametros y una ventana de contexto de 128K tokens, el modelo esta disenado para detectar fugas de secretos introducidas decenas de miles de tokens atras o afirmaciones falsas del tipo "todos los tests pasan" sin necesidad de reenviar todo el historial a un servicio en la nube.

Esta version concreta pesa 461,3 MiB repartidos en seis shards (el mayor de 91,97 MiB) y esta pensada para ejecutarse en navegador via WebGPU/WASM, en workers de CI con `onnxruntime-node` y en GPU CUDA, sin dependencia alguna de PyTorch en tiempo de inferencia. Su licencia Apache-2.0 y su tamano lo convierten en una alternativa practica a los jueces en la nube para pipelines de agentes que manejan repositorios privados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas Gated DeltaNet (recurrente lineal) y cinco cabezas de verificacion |
| Parametros totales | 752 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | Int4 simetrica en 150 proyecciones MatMulNBits (block size 32); embeddings uint4 empaquetados; gates DeltaNet y cabezas en FP32 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17) con shards externos `.bin`; sin operaciones de control de flujo (`Loop`, `If`, `Scan`) |

## Arquitectura y entrenamiento

El modelo parte de un backbone de 24 capas que combina atencion con capas Gated DeltaNet, un mecanismo de estado recurrente lineal que permite mantener equivalencia de estado en prefijos divididos (`O(Delta L)` split-prefix equivalence). La salida del backbone alimenta cinco cabezas independientes: `noul` (probabilidad calibrada Yes/No), `choice` (categoria), `score` (severidad), `locus` (turno responsable) y `salience` (utilidad de compactacion). Las cabezas y los gates recurrentes se mantienen en FP32 para preservar la calibracion.

La cuantizacion se aplica solo a las 150 proyecciones MatMulNBits, con verificacion de paridad frente al modelo original: diferencia maxima absoluta de 1,28e-5 entre ONNX FP32 y PyTorch, delta medio de probabilidad de 0,01226 frente a BF16, y acuerdo exacto de 1,0000 en `choice` y AUROC de 1,0000 en `salience`. La equivalencia de prefijos divididos se comprobo en CPU (Node) y CUDA con desviaciones maximas de probabilidad de 6,85e-7 y 1,57e-4 respectivamente. El autor no detalla en la informacion disponible el volumen de tokens de entrenamiento ni la composicion exacta del dataset, aunque referencia el dataset `DevMortimer/WardenS1-Bench` para evaluacion.

## Capacidades

- Verificacion binaria calibrada: emite probabilidad Yes/No en una sola pasada, sin generar tokens.
- Clasificacion por categorias (`Choices`) y puntuacion de severidad para incidentes detectados.
- Localizacion del turno culpable (`locus`) con un Top-1 reportado del 93%.
- Puntuacion de saliencia para compactacion de historial (AUROC 99,98%), que permite mantener el seguimiento mas alla de la ventana del agente principal.
- Abstención calibrada: admite "no lo se" con umbral en 0,50 en lugar de forzar una respuesta.
- Procesamiento de contexto largo de hasta 128K tokens, incluyendo deteccion de secretos introducidos decenas de miles de tokens atras.
- Ejecucion multiplataforma: Linux, Windows, macOS Intel, CUDA, `onnxruntime-node` y navegador con WebGPU y fallback WASM.
- Soporte de sesiones concurrentes: 10 sesiones de contexto largo simultaneas en 858 MiB en portatil, o 461 MiB en Chrome.
- No soporta generacion de texto, tool calling ni razonamiento multi-paso generativo; es exclusivamente un clasificador/verificador.

## Casos de uso

- Supervision de agentes de programacion de larga duracion: el modelo se intercala en el bucle del agente para verificar cada turno y detectar afirmaciones falsas como "todos los tests pasan" antes de que el agente continue, gracias a su ventana de 128K tokens.
- Deteccion de fugas de secretos en repositorios: con `locus` y contexto largo puede senalar el turno exacto donde se introdujo una credencial proveniente de un issue de GitHub envenenado situado 70.000 tokens atras.
- Compactacion segura de historial: usando la puntuacion `salience`, un orquestador puede decidir que turnos antiguos eliminar sin perder informacion critica, manteniendo el seguimiento incluso cuando la sesion del agente supera los 500K tokens.
- Guardrail en pipelines de CI: ejecutado con `onnxruntime-node` en workers de CI, verifica los artefactos y logs del agente antes de permitir un merge, sin dependencias de Python ni PyTorch.
- Verificacion en el navegador: integrado via WebGPU en un IDE web o panel de revision, permite revisar el historial de un agente sin enviar el codigo a una API externa, con fallback WASM en equipos sin GPU compatible.
- Auditoria de sesiones multi-turno: clasifica cada turno por categoria y severidad para generar informes de riesgo de un agente autonomo, con abstención calibrada cuando la evidencia es insuficiente.
- Despliegue en portatiles de 16 GB: al ocupar 858 MiB para 10 sesiones concurrentes, permite mantener varios agentes supervisados en hardware de consumo sin agotar la memoria.

## Benchmarks y rendimiento

| Metrica | Warden-S1 | Referencia indicada |
|---|---|---|
| Precision global | 96,1% | Cloud "Jev": 84,9% |
| Top-1 en localizacion (`locus`) | 93% | No disponible |
| AUROC de saliencia | 99,98% | No disponible |
| AUROC Noul en paridad 36 estados | 0,9923 | Umbral exigido: >= 0,980 |
| Delta medio de probabilidad vs. BF16 | 0,01226 | Umbral: < 0,025 |
| Equivalencia split-prefix (CPU, 117+75 tok) | max delta prob 6,85e-7 | Umbral: < 1e-3 |
| Equivalencia split-prefix (CUDA, 117+75 tok) | max delta prob 1,57e-4 | Umbral: < 1e-3 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que el modelo no es generativo. La comparacion con "Cloud Jev" aparece en la model card del autor sin enlace al benchmark de referencia.

## Requisitos de hardware

- VRAM/RAM de inferencia: 461,3 MiB de pesos; 858 MiB para 10 sesiones concurrentes de contexto largo en portatil; 461 MiB en Chrome con WebGPU.
- GPU recomendadas: cualquier GPU CUDA compatible con `onnxruntime` (el autor cita CUDA sin especificar modelos); en navegador, GPU con soporte WebGPU.
- GPU de consumo: cabe holgadamente en cualquier GPU con 1 GB o mas de VRAM, incluida una RTX 4090 o integradas modernas con WebGPU; el cuello de botella es la memoria del contexto, no los pesos.
- Opciones de despliegue: `onnxruntime-node` (Node/CI), `onnxruntime-web` (WebGPU con fallback WASM), ONNX Runtime con CUDA. No requiere PyTorch ni Python.
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor solo reporta la equivalencia numerica de prefijos divididos en CPU y CUDA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Warden-S1-752M-ONNX-Int4 | 752M | 128K | Verificador System-1 con cabezas multiples | Apache-2.0 | ONNX en HF, navegador y Node |
| Warden-S1-752M (base) | 752M | 128K | Verificador System-1 | Apache-2.0 | HF (pesos originales) |
| Cloud "Jev" | No disponible | ~33K (limite citado) | Juez System-1 en la nube | No disponible | API de terceros |
| Modelos locales "small" de 0,6B | ~600M | Hasta 128K | LLM generativo general | Variable | Variable |

La comparacion se limita a lo citado en la model card; no se dispone de datos de otros verificadores locales comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; el rendimiento en otros idiomas no esta documentado.
- No es un modelo generativo: no produce texto, codigo ni razonamiento; su uso esta restringido a verificacion y clasificacion.
- La calibracion y el umbral de abstención (0,50) estan fijados en `calibration.json`; alterarlos puede degradar la fiabilidad de las probabilidades.
- El modelo puede alucinar en el sentido de asignar severidad o `locus` incorrectos en turnos ambiguos; la precision Top-1 de `locus` es del 93%, no del 100%.
- La comparacion con "Cloud Jev" (96,1% vs. 84,9%) proviene del propio autor y no se ha verificado de forma independiente en la informacion disponible.
- Aunque la licencia es Apache-2.0, conviene revisar las condiciones del modelo base y del dataset `WardenS1-Bench` antes de uso comercial.
- El sharding esta limitado a 100 MiB por fichero para compatibilidad con la Cache API del navegador; entornos con restricciones de carga de multiples ficheros pueden requerir configuracion adicional.
- No se documentan sesgos especificos ni evaluaciones de robustez frente a entradas adversarias en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DevMortimer/Warden-S1-752M-ONNX-Int4
- Modelo base: https://huggingface.co/DevMortimer/Warden-S1-752M
- Dataset de evaluacion: https://huggingface.co/datasets/DevMortimer/WardenS1-Bench
- DOI del informe tecnico: https://doi.org/10.5281/zenodo.24494405
- Articulo y estudio interactivo: https://ryanjoshuagapac.com/writing/warden-s1
- ORCID del autor: https://orcid.org/0009-0004-2591-0219
