# jiazhe868/Qwen3.5-9B-Seis-SFT

## Resumen

Qwen3.5-9B-Seis-SFT es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen3.5-9B, desarrollado por el usuario jiazhe868, orientado a sismología cuantitativa. Forma parte de un pipeline de post-entrenamiento en dos etapas (qwen-seis-posttrain), siendo esta la primera fase; la segunda es un ajuste por refuerzo multitaréa (Qwen3.5-9B-Seis-RL-run1). El objetivo principal del SFT no es tanto mejorar la precisión bruta del modelo base como corregir su problema de longitud: el base genera respuestas de 14.735 tokens de media y, en problemas largos, muchas no terminan dentro de 32K tokens. Este ajuste enseña al modelo a finalizar sus razonamientos y a producir respuestas más compactas.

El modelo conserva la arquitectura del Qwen3.5-9B original (transformer con cabecera de predicción mult token para decodificación especulativa), con 9.653.104.368 parámetros totales y un encoder de visión congelado que no fue entrenado ni probado. Se entrenó con parámetros completos sobre 13.095 conversaciones (44,1M tokens) y está publicado bajo licencia Apache-2.0. Es relevante ahora porque demuestra que un ajuste SFT quirúrgico puede reducir drásticamente el consumo de tokens (de 14.735 a 9.517 de media) y mejorar métricas de razonamiento científico como GPQA Diamond, manteniendo las capacidades generales del modelo base.

La ficha se basa exclusivamente en la información publicada en la model card del autor; los datos no disponibles se indican explícitamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5) con cabecera de predicción mult token (MTP) para decodificación especulativa; encoder de visión congelado |
| Parámetros totales | 9.653.104.368 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada en la model card; el autor recomienda servir con `--max-model-len 40960` y evaluar con hasta 32K tokens de salida |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de parámetros completos del Qwen3.5-9B, un transformer con cabecera de predicción mult token (MTP), que se entrenó también (con peso de pérdida 0,1) para que el modelo pueda seguir generando borradores para decodificación especulativa. El encoder de visión se congeló y pertenece al modelo base; el entrenamiento y las pruebas se realizaron únicamente sobre texto.

El conjunto de entrenamiento consta de 13.095 conversaciones (44,1M tokens) con tres componentes principales: 8.776 soluciones numéricas resueltas, escritas por un modelo profesor (Qwen3.8-27B) y conservadas solo si la respuesta final pasaba el verificador; 1.301 trayectorias de uso de herramientas, conservadas solo si el código pasaba tests ocultos, más 554 informes (el mejor de varios borradores según un modelo juez); y 2.464 respuestas generales escritas por el propio modelo base para preservar sus habilidades generales. El entrenamiento fue de 2 épocas, 206 pasos de 126 conversaciones, con tasa de aprendizaje máxima de 8e-6 con decaimiento coseno hasta 8e-7 y weight decay de 0,1.

## Capacidades

- Generación de texto y razonamiento cuantitativo en sismología: resolución de problemas numéricos con seguimiento de unidades y cifras significativas, con formato de respuesta final `\boxed{<número> <unidad>}`.
- Modo de razonamiento (thinking) activado por defecto, con el razonamiento separado en `reasoning_content`.
- Uso de herramientas (tool calling): trayectorias de tool-use entrenadas y evaluadas (88,8% en el conjunto de 188 ítems).
- Generación de código para sismología: resolución de problemas de código con pass@1 del 86,3% en D-Code.
- Generación de informes técnicos (aunque sin mejora medible frente al base según el juez independiente).
- Razonamiento científico general: GPQA Diamond del 71,3%.
- Seguimiento de instrucciones: IFEval del 93,1%.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades de visión: el encoder existe pero no fue entrenado ni probado; el modelo es efectivamente solo texto.

## Casos de uso

- Resolución de problemas sísmicos cuantitativos en investigación: el modelo puede resolver cálculos de distancias hipocentrales, tiempos S-P, magnitudes y velocidades de propagación con formato de respuesta verificado, gracias a su entrenamiento en 8.776 soluciones numéricas validadas por verificador.
- Asistencia en docencia de geofísica: generación de soluciones paso a paso con unidades y cifras significativas consistentes, útil para material didáctico o corrección automatizada de ejercicios.
- Automatización de análisis de datos sísmicos con código: el modelo puede escribir y ejecutar código de procesamiento (tool calling) validado contra tests ocultos, integrándose en pipelines de análisis de señales sísmicas.
- Generación de borradores de informes técnicos: producción de informes sismológicos estructurados, aunque el autor advierte que la calidad no supera al modelo base según la evaluación con juez independiente.
- Evaluación comparativa de modelos científicos: servir como referencia de ajuste SFT en dominios verticales, dado que el pipeline completo y las métricas están documentados y son reproducibles.
- Investigación en post-entrenamiento: el modelo y su etapa RL posterior permiten estudiar el efecto del SFT frente al RL en tareas de razonamiento largo, con presupuestos de tokens controlados (16K, 32K, 64K).
- Despliegue en entornos de investigación con vLLM: el autor proporciona el comando de servicio con `--reasoning-parser qwen3` y `--language-model-only`, lo que facilita su integración en infraestructura existente.

## Benchmarks y rendimiento

Resultados publicados por el autor, con temperatura 1,0, top-p 1,0, thinking activado y máximo de 32K tokens de salida. Solo se califica la respuesta final; ± es el intervalo de confianza del 95% del ruido de muestreo.

| Conjunto (métrica, ítems) | Base | Este modelo | RL run 1, paso 20 |
|---|---|---|---|
| D-Num: problemas de 1–3 pasos (avg@8, 300) | **91,6** ± 1,0 | 89,4 ± 0,9 | 89,2 ± 1,0 |
| D-Num-hard: 3+ pasos (avg@8, 160) | 62,0 ± 1,6 | 68,1 ± 1,4 | **70,1** ± 1,7 |
| D-Fresh: escritos tras el lanzamiento del base (avg@8, 60) | 70,6 ± 2,6 | 78,8 ± 2,3 | **83,3** ± 2,6 |
| D-Code (pass@1, 150) | 80,5 ± 2,3 | **86,3** ± 2,0 | 85,2 ± 2,2 |
| D-Report (win rate vs base, menor de dos jueces, 100) | 50 | 49,0 ± 9,0 | 49,0 ± 8,5 |
| GPQA Diamond (198) | 56,6 ± 1,6 | 71,3 ± 1,6 | **74,2** ± 1,8 |
| IFEval (377) | 93,1 | 93,1 | 93,9 |
| LiveCodeBench posterior a 2025-01 (70) | 38,2 | **52,5** | 50,0 |
| Tool calling (188) | 83,0 | 88,8 | 86,7 |
| Rechazo de peticiones que deberían rechazarse, % (300) | **56,0** | 51,3 | 45,7 |
| Sobrerrechazo de peticiones benignas, % (350) | 3,4 | 4,0 | 2,6 |
| Tokens de salida medios | 14.735 | 9.517 | 5.637 |

Efecto del presupuesto de tokens (mismas respuestas puntuadas como si el límite hubiera sido 16K, 32K o 64K):

| Conjunto | Modelo | 16K | 32K | 64K |
|---|---|---|---|---|
| D-Num-hard | Este modelo | 47,8 | 68,1 | **83,9** |
| D-Num-hard | RL run 1, paso 20 | **58,0** | 70,1 | 77,5 |
| D-Fresh | Este modelo | 66,9 | 78,8 | No disponible |
| D-Fresh | RL run 1, paso 20 | **77,9** | 83,3 | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 9.653 millones de parámetros en precisión completa (fp16/bf16) requiere aproximadamente 19,3 GB solo para pesos, a lo que hay que sumar la caché KV para contextos largos (hasta 40.960 tokens recomendados por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo en bf16 es compatible con GPU de 24 GB o más (por ejemplo, RTX 4090, A100 40 GB, H100), aunque la caché KV para 32K–40K tokens puede requerir más memoria o cuantización.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) con cuantización o contextos reducidos; no confirmado por el autor.
- Opciones de despliegue: vLLM, con el comando documentado `vllm serve jiazhe868/Qwen3.5-9B-Seis-SFT --max-model-len 40960 --reasoning-parser qwen3 --language-model-only`. Otras opciones (llama.cpp, Ollama, TGI) no están documentadas para este modelo.
- Latencia y throughput: no disponibles. El autor señala que el presupuesto de tokens es crítico: con 32K, el 28% de las respuestas de D-Num-hard agotan los tokens, por lo que recomienda un presupuesto amplio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-Seis-SFT (este modelo) | 9.653.104.368 | Hasta 40.960 tokens de servicio (recomendado) | Apache-2.0 | Hugging Face | SFT para sismología; 9.517 tokens de salida medios |
| Qwen/Qwen3.5-9B (base) | 9.653.104.368 (mismo tamaño) | No especificado | Apache-2.0 | Hugging Face | 14.735 tokens de salida medios; mejor en D-Num (91,6) y peor en GPQA Diamond (56,6) |
| Qwen3.5-9B-Seis-RL-run1 (etapa RL del mismo pipeline) | Mismo tamaño (derivado del base) | No especificado | Apache-2.0 (presumiblemente, no confirmado) | Hugging Face | Mejor en D-Num-hard (70,1), D-Fresh (83,3) y GPQA Diamond (74,2); peor en tool calling (86,7) y rechazo (45,7) |

No se dispone de información sobre otros modelos comparables de sismología en la documentación proporcionada.

## Limitaciones y advertencias

- Los problemas de entrenamiento y prueba provienen de plantillas de resolución o fueron escritos por modelos; preguntas de investigación reales pueden ser más difíciles o distintas. Nada fue verificado por un experto del dominio.
- En D-Num el modelo está 2,2 puntos por debajo del base porque produce más valores incorrectos; el base casi satura ese conjunto.
- Los informes no mejoran: el juez que nunca tocó el entrenamiento los puntúa como empates con el base (49,0%).
- Rechaza menos peticiones dañinas que el base (51,3% frente a 56,0% de las peticiones que deberían rechazarse), lo que supone un riesgo de seguridad en producción.
- Solo texto: el encoder de visión es el del modelo base y no fue probado.
- Es un artefacto de investigación, no una herramienta para decisiones operativas como la evaluación de peligrosidad sísmica.
- El idioma soportado es únicamente inglés.
- El modelo puede alucinar: el autor advierte que las referencias de los conjuntos de prueba no son etiquetas humanas, sino programas o modelos verificados por otros modelos.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías y desaconseja explícitamente el uso operativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jiazhe868/Qwen3.5-9B-Seis-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Etapa RL del pipeline: https://huggingface.co/jiazhe868/Qwen3.5-9B-Seis-RL-run1
- Repositorio del pipeline de post-entrenamiento: https://github.com/jiazhe868/qwen-seis-posttrain
