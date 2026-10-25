# ikimyaii/Mamba-1.3B-unstructured-ELSA-80pct

## Resumen

Mamba-1.3B-unstructured-ELSA-80pct es un punto de control de investigación publicado por el usuario ikimyaii: el modelo base fla-hub/mamba-1.3B-100B (arquitectura Mamba, 1.334.740.992 parámetros) podado al 80 % de dispersión no estructurada mediante el código oficial de ELSA, el método descrito en el paper arXiv:2510.01650. No es un modelo entrenado desde cero ni afinado para instrucciones: es un artefacto de evaluación que sirve como línea base frente a los modelos EHWS de la misma cuenta, que aplican dispersión semi-estructurada al mismo modelo de partida.

El interés técnico está en el método de poda. ELSA formula la selección de pesos como un problema de optimización con pasos ADMM y una penalización de magnitud (lambda 0,01) aplicada capa a capa con un único umbral por capa, lo que produce dispersión no estructurada: cada fila conserva un número distinto de pesos no nulos. Se podan todas las capas lineales internas de los bloques Mamba excepto `dt_proj`, que se mantiene densa; `conv1d`, `A_log` y `D` no se tocan por no ser lineales, y los embeddings y `lm_head` permanecen densos. La dispersión medida sobre estos pesos es 0,7841, ligeramente por debajo del objetivo del 80 % precisamente por la presencia de `dt_proj` densa.

El resultado es un modelo de 1,3B parámetros con perplejidad de 30,13 en WikiText-2 y 28,49 en C4 (evaluación en bf16) y una media de 0,3841 en siete tareas de lm-evaluation-harness en modo zero-shot. Su relevancia es como referencia reproducible: el autor documenta la receta completa (4096 pasos ADMM, 32.768 secuencias de C4 de 2.048 tokens, semilla 0, 6,20 horas en una A100 de 40 GB) y publica los pesos para que otros grupos comparen métodos de poda sobre SSM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (modelo de espacio de estados selectivo, SSM), implementado sobre la librería flash-linear-attention (FLA) |
| Parametros totales | 1.334.740.992 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible; los pesos se publican en safetensors y el autor advierte que Mamba es sensible al desbordamiento en fp16, por lo que recomienda bf16 para evaluar |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (tamano del repo: 5,3 GB) |

Datos adicionales relevantes: dispersión medida 0,7841 sobre 192 capas podadas; modelo base `fla-hub/mamba-1.3B-100B`; `dt_proj`, `conv1d`, `A_log`, `D`, embeddings y `lm_head` permanecen densos.

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Mamba del checkpoint base: bloques SSM selectivos en lugar de atención, con proyecciones lineales internas (`in_proj`, `x_proj`, `out_proj`) y los tensores propios del SSM (`conv1d`, `A_log`, `D`, `dt_proj`). Sobre esa estructura no hay entrenamiento nuevo: el proceso es exclusivamente de poda. ELSA aplica 4096 pasos ADMM con un paso de actualización de la máscara (z-step) cada 32 pasos, batch de 1 con 8 acumulaciones, learning rate 2e-4, lambda 0,01, precisión bf16 y 32.768 secuencias de C4 de 2.048 tokens con semilla 0. La ejecución completa consumió 6,20 horas en una única A100 de 40 GB, lo que la hace reproducible con recursos modestos.

La innovación respecto a una poda de magnitud convencional es el esquema de optimización: ELSA busca la máscara y los pesos supervivientes de forma alterna, con un umbral único por capa, lo que da como resultado una distribución de no nulos desequilibrada entre filas. El autor cuantifica ese desequilibrio: en las 192 capas podadas, la fila más densa tiene de media 2,47 veces los no nulos de la fila media, y en la peor capa la ratio llega a 4,64. No se documenta en la información disponible ningún ajuste posterior de recuperación (fine-tuning) tras la poda, ni datos sobre RLHF, DPO o preferencias: el modelo base del que parte se denomina `mamba-1.3B-100B`, lo que sugiere un entrenamiento sobre 100.000 millones de tokens, aunque ese extremo no se confirma en la model card.

## Capacidades

- Modelado de lenguaje causal: es un modelo de lenguaje base, sin ajuste por instrucciones, por lo que su función es la continuación de texto y la estimación de verosimilitud, no el diálogo.
- Evaluación de calidad intrínseca: permite medir perplejidad sobre WikiText-2 y C4 con un protocolo reproducible (ELSA / `eval_external.py`).
- Razonamiento zero-shot limitado: obtiene 0,3841 de media en siete tareas de lm-evaluation-harness (arc_challenge, arc_easy, boolq, hellaswag, openbookqa, rte, winogrande), con resultados por encima del azar solo en algunas.
- Clasificación y elección múltiple vía log-verosimilitud: útil como sujeto de pruebas en harnesses de evaluación, no como generador de respuestas fiables.
- Capacidad multilingüe: no documentada; no hay información sobre idiomas de entrenamiento ni evaluación fuera del inglés (las tareas citadas son en inglés).
- Tool calling / function calling: no soportado; no hay ajuste para ello ni formato de herramientas definido.
- Uso como agente o razonamiento multi-paso: no soportado de forma nativa; el modelo no tiene modo "thinking" ni entrenamiento específico para planificación.
- Visión, audio u otras modalidades: no disponibles; el modelo es exclusivamente de texto.
- Valor como referencia comparativa: sirve para contrastar estrategias de poda (no estructurada frente a semi-estructurada) sobre el mismo modelo base y el mismo presupuesto de cómputo.

## Casos de uso

- Investigación en compresión de modelos: usar el checkpoint como línea base de poda no estructurada al 80 % y comparar perplejidad y precisión zero-shot contra métodos alternativos (EHWS, SparseGPT, Wanda) sobre el mismo modelo base.
- Reproducción de experimentos: la receta completa (pasos ADMM, batch, learning rate, semilla, número de secuencias) permite replicar el resultado en una sola A100 de 40 GB en aproximadamente 6,20 horas, útil para validar implementaciones propias de ELSA.
- Estudio del desequilibrio de filas en dispersión no estructurada: el modelo permite analizar empíricamente cómo un umbral único por capa produce filas con hasta 4,64 veces la densidad media, y cómo eso afecta a la precisión por capa.
- Evaluación de kernels dispersos: sirve como entrada para medir si las librerías de inferencia con soporte de sparse realmente aceleran un modelo con dispersión no estructurada frente a la ejecución densa.
- Docencia y divulgación sobre SSM: al ser un Mamba de 1,3B con requisitos de memoria modestos (unos 2,7 GB en bf16), es viable en entornos docentes con una sola GPU consumer para ilustrar arquitecturas de espacio de estados.
- Selección de modelo para despliegue con restricciones de memoria: útil como caso de estudio de hasta qué punto la poda agresiva degrada la calidad antes de decidir si merece la pena integrar kernels dispersos en producción; a 0,3841 de media zero-shot, el modelo no es adecuado como generador final.
- Análisis de robustez numérica en SSM: la sensibilidad de Mamba al desbordamiento en fp16 documentada por el autor lo convierte en un banco de pruebas para pipelines de evaluación en bf16.

## Benchmarks y rendimiento

Perplejidad (menor es mejor), evaluada con el pipeline EHWS en bf16 sobre los pesos publicados:

| Metrica | WikiText-2 | C4 |
|---|---|---|
| Este modelo (bf16, protocolo EHWS) | 30,13 | 28,49 |
| Este modelo (fp16, codigo de ELSA) | 30,12 | 28,49 |

Precisión zero-shot con lm-evaluation-harness (0-shot, 7 tareas):

| Tarea | Este modelo |
|---|---|
| arc_challenge | 0,1920 |
| arc_easy | 0,4133 |
| boolq | 0,5731 |
| hellaswag | 0,3019 |
| openbookqa | 0,1620 |
| rte | 0,5271 |
| winogrande | 0,5193 |
| Media | 0,3841 |

No se publican en la información disponible los resultados del modelo base sin podar ni los del modelo EHWS equivalente, por lo que no es posible cuantificar aquí la degradación atribuible a la poda. El autor indica una única ejecución (single run), sin intervalos de confianza ni medias sobre varias semillas.

## Requisitos de hardware

- Memoria de pesos: 1.334.740.992 parámetros equivalen a unos 2,67 GB en bf16/fp16 y unos 5,34 GB en fp32; el repositorio ocupa 5,3 GB, coherente con pesos en 32 bits. La dispersión no estructurada no reduce el consumo de memoria salvo que se usen kernels dispersos específicos, que no se documentan.
- GPU recomendadas: el autor ejecutó el proceso de poda en una A100 de 40 GB, pero la inferencia del modelo resultante cabe holgadamente en GPU consumer. Una RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 3090 (24 GB) o incluso una RTX 4060 Ti (16 GB) son suficientes para inferencia en bf16 con contexto moderado.
- Cabe en GPU consumer: sí, con amplio margen; el cuello de botella es la longitud de contexto, no el tamaño de los pesos.
- Opciones de despliegue: la carga requiere instalar `flash-linear-attention` (`import fla`) y usar `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)`. No se documenta en la información disponible soporte en vLLM, llama.cpp, Ollama ni TGI; dado que el modelo necesita código remoto y kernels FLA, la integración en esos servidores no está garantizada.
- Latencia y throughput: no disponibles. Al no haber kernels dispersos, es razonable esperar un coste de cómputo similar al de un Mamba denso de 1,3B, pero no hay mediciones publicadas.
- Precisión: usar bf16. El autor advierte explícitamente que Mamba sufre desbordamiento en fp16 y que las cifras comparables son las de la reevaluación en bf16.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo de dispersion | Perplejidad WikiText-2 | Media zero-shot (7 tareas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (unstructured-ELSA-80pct) | 1,33B | No estructurada, 0,7841 medida | 30,13 | 0,3841 | No disponible | Publico en HuggingFace, 0 descargas |
| ikimyaii/Mamba-1.3B-semi-structured-EHWS-ALPS_phase1-80pct | 1,33B (mismo base) | Semi-estructurada, 80 % | No disponible en esta informacion | No disponible en esta informacion | No disponible | Publico en HuggingFace |
| fla-hub/mamba-1.3B-100B (modelo base) | 1,33B | Ninguna (denso) | No disponible en esta informacion | No disponible en esta informacion | No disponible en esta informacion | Publico en HuggingFace |

La comparación cuantitativa con el modelo base y con la variante EHWS no puede completarse con los datos suministrados: la model card únicamente enlaza al modelo EHWS como referencia, sin reproducir sus cifras.

## Limitaciones y advertencias

- Calidad degradada: una media de 0,3841 en siete tareas zero-shot sitúa al modelo cerca de niveles propios de un modelo muy comprimido; no es apto como generador en producción sin una evaluación adicional sobre el dominio objetivo.
- Dispersión no estructurada sin beneficio práctico garantizado: al no haber kernels dispersos, el modelo ocupa la misma memoria y ejecuta esencialmente el mismo cómputo que un Mamba denso del mismo tamaño; la poda no se traduce automáticamente en aceleración.
- Desequilibrio de filas: la fila más densa tiene de media 2,47 veces los no nulos de la fila media (hasta 4,64 en la peor capa), lo que puede concentrar la degradación en capas concretas y complicar un despliegue con kernels estructurados.
- Sensibilidad numérica: Mamba desborda en fp16 según el autor; cualquier pipeline en fp16 producirá resultados no comparables. Es obligatorio usar bf16 para replicar las cifras.
- Licencia no disponible: no se puede confirmar el uso comercial. Al derivar de `fla-hub/mamba-1.3B-100B`, habría que verificar la licencia del modelo base antes de cualquier uso productivo.
- Idiomas no documentados: no hay información sobre cobertura lingüística; las tareas de evaluación son en inglés y no se reportan resultados en castellano ni en otras lenguas.
- Sin ajuste por instrucciones: no soporta diálogo, tool calling ni agentes; intentar usarlo como asistente conversacional producirá continuaciones de texto, no respuestas.
- Sesgos no evaluados: no se publica ningún análisis de sesgo, toxicidad o filtrando de datos de entrenamiento.
- Riesgo de alucinación: es un modelo de lenguaje base; la generación libre de hechos no está alineada ni verificada.
- Resultado de una sola ejecución: sin semillas múltiples ni intervalos de confianza, la variabilidad de las métricas no está caracterizada.
- Naturaleza de línea base: el propio autor lo describe como baseline para los modelos EHWS de su cuenta; está pensado para comparación experimental, no para uso final.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ikimyaii/Mamba-1.3B-unstructured-ELSA-80pct
- Modelo base: https://huggingface.co/fla-hub/mamba-1.3B-100B
- Modelo comparable (EHWS semi-estructurado, 80 %): https://huggingface.co/ikimyaii/Mamba-1.3B-semi-structured-EHWS-ALPS_phase1-80pct
- Paper de ELSA: https://arxiv.org/abs/2510.01650
- Repositorio de EHWS (referenciado en la model card para `eval_external.py`): no se proporciona URL en la informacion disponible
- Librería flash-linear-attention (requisito de carga): no se proporciona URL en la informacion disponible

Nota: la búsqueda web realizada no devolvió resultados pertinentes sobre este modelo (los resultados obtenidos correspondían a listados de eBay y no guardan relación con el contenido de la ficha).
