# gabe-adib/ove3-ladder-440m-exp512-seed4321

## Resumen

`ove3-ladder-440m-exp512-seed4321` es un checkpoint de investigación publicado por el usuario gabe-adib en HuggingFace. Se trata de una única ejecución ("run") de la denominada escalera de intervención ove3, concretamente la segunda semilla (seed 4321) de una celda IsoFLOP de 440M parámetros. El modelo es un MoE de arquitectura etiquetada por el autor como `kimi_linear`, con 440M parámetros activos, 512 expertos enrutados (el doble que el control, que usa 256) y enrutamiento top-8. La receta de entrenamiento (datos, learning rate, batch y número de pasos) es idéntica a la de la celda de 440M del resto de la escalera, de modo que la intervención aislada es el número de expertos.

No es un modelo listo para producción ni una release al uso: el repositorio contiene el checkpoint distribuido de Megatron tal cual se guardó, **incluyendo el estado del optimizador**, además de los logs de entrenamiento, los logs de scoring, los eventos de TensorBoard y el `config.yaml` de la ejecución. El repositorio ocupa 138,5 GB, un tamaño coherente con artefactos de entrenamiento más que con pesos de inferencia.

Su relevancia es experimental: permite estudiar el efecto de duplicar el número de expertos enrutados manteniendo fijos los parámetros activos y el presupuesto de cómputo, con dos semillas para estimar varianza entre inicializaciones. El mejor paso de validación es la iteración 27.200, con una pérdida de validación (lm loss) de 1,0517 y una pérdida en held-out de 1,1428 nats/carácter ponderada por mezcla sobre 9 dominios. No se publican datos de arquitectura detallada, tokenizador, idiomas ni licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE tipo transformer con atención etiquetada como `kimi_linear` (detalles no disponibles) |
| Parámetros totales | no disponible |
| Parámetros activos | 440M |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se publica checkpoint distribuido de Megatron, sin pesos cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoint distribuido de Megatron (`checkpoint/`, con estado del optimizador); sin safetensors ni GGUF |
| Expertos enrutados | 512 |
| Enrutamiento | top-8 |
| Semilla | 4321 (segunda semilla de la escalera) |
| Mejor iteración | 27.200 (`best_1`) |
| Pérdida de validación | 1,0517 (lm loss) |
| Pérdida held-out | 1,1428 nats/carácter (ponderada por mezcla, 9 dominios) |
| Tamaño del repositorio | 138,5 GB |

## Arquitectura y entrenamiento

La arquitectura es un mixture-of-experts con 512 expertos enrutados y activación top-8, sobre una base que el autor denomina `kimi_linear`. El modelo card no detalla la dimensión oculta, el número de capas, el mecanismo exacto de atención ni la composición del componente lineal, por lo que no es posible reconstruir la geometría de la red a partir de la información disponible. Los 440M parámetros activos son el dato de escalado declarado, y la intervención consiste en duplicar los expertos enrutados (de 256 en el control a 512) manteniendo el mismo número de expertos activos por token (8).

El entrenamiento sigue la celda IsoFLOP de 440M de la receta ove3: mismos datos, mismo learning rate, mismo batch y mismo número de pasos que el resto de la escalera. No se especifica el número total de tokens vistos, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste de instrucciones; el hecho de que la pérdida se exprese en nats/carácter apunta a un modelado a nivel de carácter en lugar de subpalabras, aunque esto es una inferencia a partir de la métrica y no un dato confirmado en la model card. La evaluación held-out se realiza sobre una mezcla ponderada de 9 dominios, con el desglose por dominio en el fichero `DOMAIN_NLL.txt` del repositorio. Como innovación destacable, el artefacto incluye logs de entrenamiento segmentados cada 4 horas, logs de scoring y eventos de TensorBoard, lo que facilita la reproducibilidad y el análisis de curvas de escalado.

## Capacidades

- Generación de texto a nivel de carácter o token (no confirmado): el modelo se entrena con un objetivo de lenguaje autorregresivo y reporta pérdida por carácter, pero no hay documentación sobre tokenizador ni sobre calidad generativa.
- Razonamiento y conocimiento general: no evaluado con benchmarks estándar (MMLU, GSM8K, HumanEval) en la información disponible.
- Tool calling / function calling: no disponible; no se menciona soporte de herramientas ni plantillas de chat.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas en los metadatos.
- Capacidades especiales (visión, audio, modo pensamiento): no disponible; no se declara ninguna.
- Valor analítico como artefacto: permite extraer curvas de pérdida por dominio, analizar el comportamiento del enrutamiento con 512 expertos y comparar contra el control de 256.

## Casos de uso

- Investigación sobre escalado de expertos: comparar esta ejecución (512 expertos, top-8) contra el control de 256 expertos de la misma celda IsoFLOP para medir el efecto de duplicar el número de expertos manteniendo los parámetros activos constantes.
- Reproducibilidad de recetas de entrenamiento: los logs por segmentos de 4 horas, los eventos de TensorBoard y el `config.yaml` permiten auditar la curva de entrenamiento y verificar la receta (LR, batch, pasos) de la celda de 440M.
- Estimación de varianza entre semillas: al ser la segunda semilla de la escalera, sirve para cuantificar la variabilidad de la pérdida final atribuible a la inicialización frente a la intervención arquitectónica.
- Análisis de pérdida por dominio: `DOMAIN_NLL.txt` permite estudiar en qué dominios de la mezcla de 9 conjuntos el aumento de expertos ayuda o perjudica, útil para decidir la composición de datos en futuras ejecuciones.
- Estudio del enrutamiento en MoE: con 512 expertos y top-8 se pueden analizar patrones de carga por experto, colapso de expertos y equilibrio del router a lo largo de 27.200 iteraciones.
- Punto de partida para ajuste fino controlado: partir de `best_1` para experimentos posteriores (por ejemplo, SFT o evaluación downstream), siempre que se convierta el checkpoint de Megatron a un formato de inferencia y se resuelva la licencia.
- Docencia y divulgación: ejemplo real de artefacto de investigación que incluye estado del optimizador, útil para explicar la diferencia entre checkpoint de entrenamiento y pesos de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos números reportados son métricas de pérdida del propio entrenamiento y evaluación held-out:

| Métrica | Valor | Notas |
|---|---|---|
| Validation lm loss | 1,0517 | Iteración 27.200 (`best_1`) |
| Perplejidad de validación (derivada) | ≈ 2,86 | Calculada como e^1,0517; no reportada por el autor |
| Held-out loss | 1,1428 nats/carácter | Ponderada por mezcla sobre 9 dominios |
| Perplejidad held-out por carácter (derivada) | ≈ 3,14 | Calculada como e^1,1428; no reportada por el autor |
| Desglose por dominio | no disponible en esta ficha | Referenciado en `DOMAIN_NLL.txt` del repositorio |
| MMLU, GSM8K, HumanEval, etc. | no disponible | No evaluados en la información proporcionada |

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma directa. El repositorio (138,5 GB) contiene el checkpoint distribuido de Megatron con estado del optimizador, por lo que no es un artefacto de inferencia y su tamaño no refleja la VRAM necesaria.
- Estimación por parámetros activos: con 440M parámetros activos, los pesos en bf16 ocuparían aproximadamente 0,88 GB y en fp32 unos 1,76 GB, pero el total de parámetros del modelo (512 expertos enrutados con top-8) no está publicado, de modo que la VRAM total no se puede calcular.
- GPU recomendadas: no disponible. Por el tamaño de parámetros activos, una GPU de consumo como una RTX 4090 (24 GB) o una RTX 3090 (24 GB) sería suficiente para los pesos activos si el total de parámetros fuese moderado; los expertos no activos también deben residir en memoria, lo que puede elevar el requisito muy por encima de esa cifra. No hay datos para confirmarlo.
- Cabe en GPU de consumo: no confirmado.
- Opciones de despliegue: el checkpoint está en formato distribuido de Megatron, por lo que requiere Megatron-LM o una conversión previa a formato HuggingFace. No se publican safetensors ni GGUF, así que llama.cpp, Ollama y LM Studio no pueden cargarlo directamente. El soporte en vLLM o TGI dependería de que exista implementación para la arquitectura `kimi_linear`, extremo no confirmado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros activos | Expertos enrutados | Top-k | Semilla | Contexto | Licencia |
|---|---|---|---|---|---|---|
| ove3-ladder-440m-exp512-seed4321 (este) | 440M | 512 | 8 | 4321 | no disponible | no disponible |
| Control de la escalera ove3 (celda 440M) | 440M (según receta) | 256 | 8 (según receta) | no disponible | no disponible | no disponible |
| Otros modelos de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación documentada es interna a la escalera ove3: misma celda IsoFLOP de 440M, mismos datos, LR, batch y pasos, con la única diferencia del número de expertos enrutados (512 frente a 256). No se han encontrado en la información proporcionada modelos externos comparables con datos verificables de parámetros, contexto o licencia.

## Limitaciones y advertencias

- Artefacto de investigación, no un modelo publicable: el repositorio contiene el checkpoint de entrenamiento con estado del optimizador (138,5 GB), no pesos listos para inferencia.
- Licencia no especificada: sin licencia declarada no se puede asumir uso comercial, redistribución ni modificación; es un bloqueo para cualquier despliegue en producción.
- Idiomas no declarados: no hay información sobre cobertura lingüística, por lo que no se puede recomendar para uso multilingüe.
- Contexto desconocido: no se publica la longitud de contexto, lo que impide planificar casos de uso con ventanas largas.
- Sin evaluación de calidad: solo se reportan pérdidas de lenguaje; no hay MMLU, HumanEval, GSM8K ni evaluaciones de seguridad o sesgo, de modo que el rendimiento en tareas concretas es desconocido.
- Sin alineación documentada: no se menciona RLHF, DPO ni ajuste de instrucciones; es esperable un comportamiento de modelo base y un riesgo alto de salidas no alineadas o incoherentes en uso conversacional.
- Riesgo de alucinación: no cuantificado; al no haber evaluaciones de fidelidad ni de QA, no hay base para estimarlo.
- Sesgos: no evaluados. La mezcla de 9 dominios no se detalla, por lo que se desconoce la exposición a sesgos de dominio.
- Una sola semilla frente al control: la comparación 512 vs 256 expertos se apoya en una única ejecución por configuración, con la incertidumbre que ello implica; la varianza entre semillas no se reporta.
- Formato propietario de facto: al requerir Megatron-LM o una conversión, la reproducibilidad depende de disponer de la versión de Megatron y de las dependencias usadas en el entrenamiento.
- Fecha de creación en metadatos (2026-10-17) y ausencia de pipeline, descargas y likes: el artefacto no ha sido validado por la comunidad (0 descargas, 0 likes en el momento de la consulta).

## Enlaces

- HuggingFace: https://huggingface.co/gabe-adib/ove3-ladder-440m-exp512-seed4321
- No se han encontrado en la búsqueda web enlaces relevantes al modelo, a la receta ove3, a la arquitectura `kimi_linear` ni a papers asociados; los resultados devueltos no guardan relación con el modelo y se descartan.
