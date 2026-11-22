# root-sys-n/Mima-2-Photon-15m-Ternary

## Resumen

Mima 2 Photon Ternary es una variante comprimida del modelo de lenguaje turco Mima 2 Photon, desarrollado por el usuario root-sys-n. Se trata de un modelo de 15 millones de parámetros (según el identificador del modelo base) que ha sido sometido a un proceso de cuantización híbrida y consciente de la cuantización (QAT) para reducir drásticamente su huella en disco: pasa de 34,8 MB en FP16 a 7,89 MB, una reducción de 4,4 veces, manteniendo aproximadamente el 90,7 % del rendimiento del modelo original en el microbenchmark propio del autor.

La relevancia de esta ficha radica en su enfoque técnico: no aplica una cuantización uniforme, sino una asignación de precisión por capas basada en un análisis Logit Lens de 16 capas. Los bloques FFN intermedios se cuantizan a 1.58 bits ternarios (W1.58, grupo de 64), las capas de entrada y salida (L00–L01, L14–L15) y las proyecciones de atención a 4 bits (Q4, grupo de 64), las capas de embedding estrechas (emb_dim=96) a INT8, y las capas ShortConv y RMSNorm se conservan en FP16. El alineamiento se realiza mediante destilación de logits (KD-QAT) profesor-alumno.

El modelo está orientado a generación de texto en turco, con soporte declarado de razonamiento tipo "thinking" y tool calling. Su tamaño extremadamente reducido lo sitúa en la categoría de small language models (SLM) para despliegue en entornos con recursos muy limitados, aunque su rendimiento absoluto es bajo (35,0 % en el microbenchmark del autor).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas ShortConv y RMSNorm; cuantizacion hibrida por capas (no disponible el detalle completo de la arquitectura) |
| Parametros totales | 15M (segun identificador del modelo base `Mima-2-Photon-15m`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Hibrida: W1.58 ternario (G=64) en FFN intermedios, Q4 (G=64) en atencion y capas extremas, INT8 en embeddings, FP16 en ShortConv y RMSNorm |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 0.0 GB; el autor reporta 7,89 MB de pesos binarios) |

## Arquitectura y entrenamiento

El modelo base es un transformer de 16 capas con un ancho de embedding de 96 dimensiones (`emb_dim=96`), que incorpora capas ShortConv y RMSNorm. La variante Ternary no reentrena desde cero: parte del modelo base `root-sys-n/Mima-2-Photon-15m` y aplica un proceso de cuantizacion consciente del entrenamiento (QAT) guiado por destilacion de logits (KD-QAT) profesor-alumno, de modo que el modelo cuantizado se alinea con las distribuciones de salida del modelo FP16 original.

La innovacion principal es la asignacion de precision por capas basada en un analisis Logit Lens sobre las 16 capas. Los bloques FFN intermedios, presumiblemente menos sensibles, se comprimen a 1.58 bits ternarios con grupos de 64; las capas de entrada y salida (L00–L01 y L14–L15) y las proyecciones de atencion, mas sensibles, se mantienen en 4 bits; los embeddings estrechos se codifican en INT8; y las capas ShortConv y RMSNorm se preservan en FP16. No se detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto en turco.
- Razonamiento tipo "thinking" (declarado en los tags del modelo).
- Tool calling / function calling (declarado en los tags del modelo).
- Modelo de lenguaje pequeno (SLM) disenado para despliegue con recursos minimos.
- Capacidades multilingues: limitadas al turco segun el campo `language`.
- No se declaran capacidades de vision, audio ni modos multimodales.

## Casos de uso

- Despliegue en dispositivos de borde con memoria muy restringida: con 7,89 MB de pesos, el modelo cabe en microcontroladores con unos pocos megabytes de flash y RAM, permitiendo generacion de texto local sin conexion en turco.
- Prototipado rapido de pipelines de generacion de texto: su licencia Apache 2.0 y su tamano permiten iterar en CI/CD sin costes de GPU dedicada.
- Filtrado o clasificacion de texto turco en entornos embebidos: el modelo puede actuar como clasificador ligero o generador de etiquetas en aplicaciones de bajo consumo.
- Educacion e investigacion sobre cuantizacion: sirve como caso de estudio reproducible de cuantizacion hibrida por capas con KD-QAT en un modelo de 15M de parametros.
- Pruebas de concepto de tool calling en agentes ligeros: los tags declaran soporte de tool calling, aunque el rendimiento real en tareas de agente no esta documentado.
- Generacion de texto auxiliar en aplicaciones turcas de bajo riesgo: respuestas cortas, autocompletado o plantillas, donde el coste computacional es prioritario sobre la calidad absoluta.

## Benchmarks y rendimiento

Resultados del microbenchmark propio del autor, Mima-TR-MicroBench (n=500), comparando el modelo FP16 con la variante Ternary:

| Metrica | Mima 2 Photon (FP16) | Mima 2 Photon Ternary | Diferencia |
|---|---|---|---|
| Mima-TR-MicroBench (n=500) | 38,6 % | 35,0 % | -3,6 puntos (90,7 % de retencion) |
| Aritmetica y unidades | 32,0 % | 26,0 % | -6,0 puntos |
| Logica y sentido comun | 25,0 % | 23,0 % | -2,0 puntos |
| Comprension lectora | 38,0 % | 41,0 % | +3,0 puntos |
| Cultura general basica | 49,0 % | 46,0 % | -3,0 puntos |
| Lengua turca y ortografia | 49,0 % | 39,0 % | -10,0 puntos |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El microbenchmark es propio del autor y no es directamente comparable con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en FP16 para los pesos (7,89 MB de pesos cuantizados), por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requiere GPU; cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090) es sobredimensionada para este modelo.
- Cabe en consumer GPU: si, en todas; tambien en CPU y potencialmente en microcontroladores.
- Opciones de despliegue: no se especifican en la model card; el formato de pesos no esta disponible, por lo que no se puede confirmar compatibilidad con llama.cpp, Ollama, vLLM o TGI. Existe una demo en Hugging Face Spaces.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks estandar ni de modelos comparables documentados en la informacion proporcionada. La comparativa mas directa es con su propio modelo base:

| Modelo | Parametros | Tamano de pesos | MicroBench (n=500) | Licencia |
|---|---|---|---|---|
| Mima 2 Photon (FP16) | 15M | 34,8 MB | 38,6 % | Apache 2.0 |
| Mima 2 Photon Ternary | 15M | 7,89 MB | 35,0 % | Apache 2.0 |

No disponible para modelos de otros autores de la misma categoria.

## Limitaciones y advertencias

- Rendimiento absoluto bajo: 35,0 % en el microbenchmark del autor, insuficiente para tareas de produccion que requieran fiabilidad.
- Perdida notable en lengua turca y ortografia (-10 puntos) y en aritmetica (-6 puntos) respecto al modelo FP16.
- Riesgo elevado de alucinacion y errores gramaticales, especialmente en generaciones largas.
- Solo soporta turco; no se declaran capacidades multilingues.
- Longitud de contexto no documentada; no apto para conversaciones multi-turno largas sin validacion previa.
- El soporte de tool calling y "thinking" figura en los tags pero no esta respaldado por evaluaciones publicadas.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks estandar impide garantizar calidad en produccion.
- El repo tiene 0 descargas y 0 likes; no hay evidencia de uso o validacion por parte de la comunidad.
- Formato de pesos no disponible; puede requerir tooling especifico para su carga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/root-sys-n/Mima-2-Photon-15m-Ternary
- Modelo base: https://huggingface.co/root-sys-n/Mima-2-Photon-15m
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/root-sys-n/Mima-2-Photon
