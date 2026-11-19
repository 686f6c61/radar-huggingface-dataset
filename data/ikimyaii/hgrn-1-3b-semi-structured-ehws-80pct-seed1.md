# ikimyaii/HGRN-1.3B-semi-structured-EHWS-80pct-seed1

## Resumen

HGRN-1.3B-semi-structured-EHWS-80pct-seed1 es un checkpoint derivado de `fla-hub/hgrn-1.3B-100B`, un modelo de lenguaje de 1.364 millones de parametros construido sobre la arquitectura HGRN (Hierarchically Gated Recurrent Network), una familia de modelos recurrentes lineales implementados en la libreria `flash-linear-attention`. El autor del checkpoint, `ikimyaii`, no entrena el modelo desde cero: aplica un proceso de poda (pruning) semi-estructurada para eliminar el 80 % de los pesos de todas las capas lineales internas de los bloques, manteniendo densas las embeddings y la cabeza de salida `lm_head`.

El interes tecnico del artefacto es metodologico. El autor emplea una estrategia de dos fases basada en ADMM (Alternating Direction Method of Multipliers) denominada EHWS: una primera fase local de tipo ALPS que poda cada capa hasta el 70 % minimizando el error de reconstruccion de la salida de la capa, y una segunda fase global que completa la poda hasta el 80 % optimizando la perdida de entropia cruzada mas destilacion de conocimiento sobre el modelo denso original. La calibracion usa secuencias de C4 y el proceso completo se ejecuta en una sola A100 de 40 GB en 3,72 horas.

La relevancia practica es doble. Por un lado, demuestra que es posible obtener sparsity semi-estructurada por filas (cada fila conserva exactamente el mismo numero de pesos, el 20 % superior) en un modelo recurrente lineal, lo que facilita un reparto de trabajo perfectamente balanceado en kernels de GPU. Por otro, documenta con transparencia el coste en calidad: la perplejidad en WikiText-2 sube de 11,81 a 41,03 y la media de zero-shot en lm-evaluation-harness cae de 0,4376 a 0,3842. Es, por tanto, un checkpoint de investigacion sobre compresion, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HGRN (Hierarchically Gated Recurrent Network), modelo recurrente lineal de la familia `flash-linear-attention` |
| Parametros totales | 1.364.396.032 (1,36 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en safetensors en fp16/bf16 (el repo ocupa 5,5 GB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Sparsity | 80 % semi-estructurada por filas en las 168 capas lineales podadas; embeddings y `lm_head` densos |
| Modelo base | fla-hub/hgrn-1.3B-100B |
| Semilla | 1 |
| Fecha de publicacion | 2026-11-19 |

## Arquitectura y entrenamiento

El modelo base es un HGRN de 1,3 B de parametros entrenado sobre 100 B de tokens (de ahi el sufijo `-100B` en `fla-hub/hgrn-1.3B-100B`). HGRN pertenece a la familia de modelos recurrentes lineales con compuertas jerarquicas, una alternativa a la atencion cuadratica clasica que ofrece coste lineal en la longitud de secuencia. La implementacion vive en la libreria `flash-linear-attention` y requiere `import fla` para cargar el modelo con `AutoModelForCausalLM.from_pretrained(...)`.

Sobre ese checkpoint denso, el autor aplica la receta EHWS en dos fases. La fase 1 es local y de estilo ALPS: para cada capa lineal, se poda hasta el 70 % seleccionando los pesos que minimizan el error de reconstruccion `||(W - W0) X||^2`, usando matrices de Hessiano estimadas a partir de secuencias de calibracion de C4. La fase 2 es global: se ejecuta ADMM sobre la perdida combinada de entropia cruzada y destilacion de conocimiento del modelo denso, con un paso Z basado en `Diag(H)`, 128 rondas de 32 pasos, learning rate 0,0006, lambda constante de 0,01, Adam con beta2 0,95 y semilla 1. El conjunto de calibracion son las 32.768 secuencias de C4 de 2.048 tokens que usa el codigo oficial de ELSA, tokenizadas con el tokenizer del propio modelo base y vistas una sola vez. El run completo, incluida la evaluacion, consume 3,72 horas en una A100 de 40 GB.

La poda es semi-estructurada por filas: cada fila de cada capa lineal podada conserva exactamente el mismo numero de pesos no nulos (el 20 % superior), lo que garantiza que el trabajo por fila este perfectamente balanceado en hardware. La sparsity efectiva medida sobre los pesos finales es 0,7999 y se verifico en las 168 capas podadas.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base HGRN-1.3B-100B.
- Razonamiento basico y respuesta a preguntas de conocimiento general, con degradacion medible respecto al denso (ver benchmarks).
- Capacidad multilingue: no documentada en la informacion disponible.
- Tool calling / function calling: no documentado.
- Soporte de agentes o razonamiento multi-paso: no documentado.
- Capacidades de vision o audio: no disponibles.
- Modo thinking explicito: no disponible.
- La capacidad diferencial del checkpoint no es funcional sino estructural: pesos con sparsity semi-estructurada del 80 % aptos para experimentos de compresion y kernels dispersos.

## Casos de uso

- Investigacion en compresion de modelos: sirve como punto de comparacion reproducible (semilla 1, configuracion documentada en `results.json`) frente a otras tecnicas de poda como SparseGPT, Wanda o ELSA sobre arquitecturas recurrentes lineales.
- Estudio de sparsity semi-estructurada en HGRN: al mantener el mismo numero de no nulos por fila en las 168 capas podadas, permite medir el rendimiento real de kernels dispersos balanceados sin necesidad de enmascaramiento dinamico.
- Baseline para destilacion de conocimiento: el checkpoint y su modelo denso padre forman un par profesor-alumno util para evaluar tecnicas de KD sobre modelos de 1,3 B.
- Experimentos de eficiencia en hardware modesto: con 1,36 B de parametros y pesos en safetensors de 5,5 GB, cabe en GPUs de consumo para pruebas de inferencia, aunque la calidad degradada lo hace inadecuado para tareas de usuario final.
- Analisis de degradacion por tarea: las diferencias entre tareas (boolq mejora de 0,5758 a 0,6144, mientras arc_easy cae de 0,5644 a 0,4112) ofrecen un caso de estudio sobre que tipos de conocimiento resisten mejor la poda agresiva.
- Reproduccion de la receta EHWS: la configuracion completa (fases, hiperparametros, datos de calibracion, tiempos) permite replicar el pipeline sobre otros modelos de la familia `fla-hub`.

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluacion de ELSA (WikiText-2 y C4, fp16, ejecucion unica):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (HGRN-1.3B-100B) | 11,81 | 16,09 |
| Este modelo (80 % sparsity) | 41,03 | 29,76 |

Precision zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2432 | 0,1937 |
| arc_easy | 0,5644 | 0,4112 |
| boolq | 0,5758 | 0,6144 |
| hellaswag | 0,3828 | 0,2948 |
| openbookqa | 0,2300 | 0,1460 |
| rte | 0,5379 | 0,5199 |
| winogrande | 0,5288 | 0,5099 |
| Media | 0,4376 | 0,3842 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,7 GB solo para pesos (1,36 B x 2 bytes), mas overhead de activaciones y cache; el repo completo ocupa 5,5 GB.
- Cabe en GPUs de consumo: una RTX 4090 (24 GB), RTX 4080 (16 GB) o incluso RTX 3060 (12 GB) deberian alojar el modelo en fp16 sin problemas.
- GPU recomendadas para reproducir el pipeline de poda: una A100 de 40 GB, que es lo que uso el autor (3,72 horas para el run completo con evaluacion).
- Opciones de despliegue: al requerir `flash-linear-attention` (`import fla`), la carga debe hacerse con `AutoModelForCausalLM.from_pretrained(...)` y el paquete `fla` instalado. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en la informacion disponible; la conversion a GGUF no esta reportada.
- Latencia y throughput estimados: no disponibles. La ventaja teorica de la sparsity semi-estructurada solo se materializa con kernels dispersos especificos, que no se documentan en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Sparsity | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HGRN-1.3B-semi-structured-EHWS-80pct-seed1 | 1,36 B | no disponible | 80 % semi-estructurada | no disponible | Hugging Face (0 descargas) |
| fla-hub/hgrn-1.3B-100B (denso) | 1,36 B | no disponible | 0 % | no disponible | Hugging Face |
| Otros checkpoints podados de la familia HGRN | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos alternativos podados con la misma receta en la informacion proporcionada, por lo que la comparacion cuantitativa se limita al par denso/podado del propio autor.

## Limitaciones y advertencias

- Degradacion severa de calidad: la perplejidad en WikiText-2 se multiplica por 3,5 (de 11,81 a 41,03) y la media zero-shot cae 5,3 puntos porcentuales. No es apto para uso en produccion orientado a usuario final.
- Resultados de una unica ejecucion (semilla 1) sin intervalos de confianza ni repeticiones; la varianza entre semillas no esta documentada.
- La sparsity semi-estructurada por filas no garantiza aceleracion real sin kernels dispersos compatibles; el autor no reporta mediciones de latencia ni throughput.
- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido. La licencia del modelo base `fla-hub/hgrn-1.3B-100B` tampoco se detalla en la informacion disponible.
- Idiomas soportados no documentados; no hay garantia de comportamiento multilingue.
- Longitud de contexto no disponible en la model card; no se puede asumir la del modelo base sin verificacion.
- Riesgo de alucinacion y sesgos: no evaluados por el autor; la poda agresiva puede amplificar comportamientos degenerados en generacion abierta.
- Requiere la dependencia `flash-linear-attention` para cargar el modelo, lo que limita la portabilidad frente a arquitecturas transformer estandar.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion externa por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/ikimyaii/HGRN-1.3B-semi-structured-EHWS-80pct-seed1
- Modelo base: https://huggingface.co/fla-hub/hgrn-1.3B-100B
- Libreria `flash-linear-attention`: no disponible en la informacion proporcionada
- Paper de HGRN: no disponible en la informacion proporcionada
- Paper o repositorio de ELSA (protocolo de evaluacion y datos de calibracion): no disponible en la informacion proporcionada
- Repositorio de ALPS (fase 1 de poda local): no disponible en la informacion proporcionada
