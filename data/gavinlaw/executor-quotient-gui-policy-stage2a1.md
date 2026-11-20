# gavinlaw/executor-quotient-gui-policy-stage2a1

## Resumen

Executor-Quotient GUI Policy Stage 2A-1 es un artefacto de investigación publicado por el usuario gavinlaw en Hugging Face, consistente en los estados entrenables finales y los recibos de evaluación congelados de un piloto de ajuste supervisado (SFT) de tres brazos sobre el modelo base Qwen/Qwen2.5-VL-3B-Instruct. No se trata de un agente GUI desplegable, sino de un paquete de reproducibilidad experimental: tres checkpoints en el paso 100 (point-a, point-b y event), junto con informes de compuertas mecánicas, firmas deterministas de reetiquetado y predicciones held-out con logits en float16.

El experimento se enmarca en WebArena-Infinity Stage 2A-1 y evalúa si el ajuste supervisado entre interfaces distintas (cross-interface SFT) mejora la tasa correcta de eventos del ejecutor. El resultado es concluyente y negativo: las tasas fueron del 0,86 % (Point-A), 4,31 % (Point-B) y 3,45 % (Event), con una ganancia del brazo Event de +0,86 pp y un intervalo de confianza del 95 % por bootstrap pareado estratificado por entorno de [-1,29, +3,02] pp, lo que llevó a declarar NO-GO para esta vía. La relevancia del repositorio es metodológica: documenta un resultado negativo con trazabilidad criptográfica completa (SHA256 de checkpoints, dataset y manifiesto) y fija el siguiente paso experimental en probar PPO sobre masa de eventos en lugar de ampliar el SFT de tres brazos.

El modelo base subyacente es un transformer multimodal de 3 mil millones de parámetros con capacidades de imagen-texto a texto, pero los pesos publicados aquí son estados de entrenamiento parcial (state.pt con optimizador, scheduler, RNG y metadatos de reanudación), no un paquete de inferencia listo para usar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (heredada de Qwen2.5-VL-3B-Instruct); los artefactos publicados son estados de entrenamiento, no un grafo de inferencia completo |
| Parametros totales | 3B (modelo base Qwen2.5-VL-3B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (los artefactos son state.pt en precisión de entrenamiento; los logits de evaluación se publican en float16) |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (Qwen Research License Agreement); uso no comercial de investigación o evaluación, comercial requiere licencia de Alibaba Cloud |
| Formato de pesos | state.pt (checkpoint de PyTorch con estado del modelo, optimizador, scheduler, RNG y metadatos de reanudación); JSON para configuración e informes de evaluación |

## Arquitectura y entrenamiento

La arquitectura del modelo base es la de Qwen2.5-VL-3B-Instruct, un transformer multimodal que acepta entradas de imagen y texto y genera texto. Sobre esa base, el autor aplicó un ajuste supervisado con tres brazos experimentales (Point-A, Point-B y Event), todos con seed 11, 295 registros de entrenamiento, batch 8, acumulación de gradiente 4, 10 épocas y 100 pasos de optimizador. El conjunto held-out consta de 116 registros: registros clínicos de Elation y texto/tipografía de Figma, lo que configura una evaluación cruzada entre dos entornos de interfaz distintos.

El diseño experimental incluye controles de mecanismo además del resultado final. La distancia coseno entre gradientes de Point-A y Point-B es de 0,331235, mientras que los gradientes de Event-A y Event-B son idénticos elemento a elemento, lo que valida la firma del mecanismo previsto. El informe de compuerta mecánica y la firma de reetiquetado determinista se publican con hashes SHA256 para permitir la verificación independiente. No se documentan en la información disponible detalles sobre composición del corpus más allá del dataset referenciado (`gavinlaw/executor-quotient-wainf-event-lattice`, revisión `8978602c4cf01a7e17f5228f163e8c474d628cf8`), ni sobre uso de RLHF o DPO en esta etapa; el siguiente paso declarado es precisamente un PPO sobre masa de eventos.

## Capacidades

- Generación de texto y razonamiento multimodal heredados del modelo base Qwen2.5-VL-3B-Instruct (imagen-texto a texto).
- Predicción de eventos de ejecutor sobre interfaces GUI, medida mediante la tasa correcta de eventos del ejecutor en conjuntos held-out.
- Producción de logits en float16 y predicciones held-out para análisis comparativo de unidades de verosimilitud entre brazos.
- Reproducción de experimentos: los checkpoints incluyen optimizador, scheduler, RNG y metadatos de reanudación, lo que permite reanudar el entrenamiento en el paso 100.
- Verificación criptográfica de procedencia mediante SHA256 de checkpoints, dataset, manifiesto, informe de compuerta y firma.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes multi-paso, modo thinking, audio ni soporte multilingüe específico de estos artefactos.

## Casos de uso

- Reproducción de resultados negativos en investigación: el paquete permite a un equipo replicar el piloto de tres brazos y verificar la conclusión NO-GO para cross-interface SFT con los mismos hashes y configuración congelada.
- Auditoría metodológica de experimentos de SFT: los informes de compuerta mecánica y las firmas de reetiquetado permiten revisar si el fallo se debe al diseño experimental, a los datos o al mecanismo, separando el resultado del proceso.
- Estudio de transferencia entre interfaces: los conjuntos held-out de Elation (clínico) y Figma (texto/tipografía) sirven para analizar por qué el ajuste en una interfaz no generaliza a otra, con tasas base concretas del 0,86 % al 4,31 %.
- Punto de partida para PPO sobre masa de eventos: los estados del paso 100 con optimizador y scheduler permiten inicializar la siguiente fase experimental sin repetir el SFT.
- Comparación de unidades de verosimilitud: los logits float16 publicados para point-a, point-b y event permiten contrastar funciones de pérdida y calibración entre brazos sobre las mismas 116 muestras.
- Docencia y formación en ingeniería de experimentos: el repositorio ejemplifica buenas prácticas de trazabilidad (commits de entrenamiento y evaluación, revisión de dataset, hashes) en un caso real con resultado adverso.
- Validación de pipelines de evaluación GUI: las ejecuciones de clics reales y los resúmenes publicados pueden usarse como referencia para comprobar la corrección de un arnés de evaluación propio antes de aplicarlo a modelos mayores.

## Benchmarks y rendimiento

| Brazo | Tasa correcta de eventos del ejecutor | Diferencia frente a referencia |
|---|---|---|
| Point-A | 0,86 % | no disponible |
| Point-B | 4,31 % | no disponible |
| Event | 3,45 % | +0,86 pp (IC 95 % bootstrap pareado estratificado por entorno: [-1,29, +3,02] pp) |

| Métrica de mecanismo | Valor |
|---|---|
| Distancia coseno entre gradientes Point-A / Point-B | 0,331235 |
| Gradientes Event-A / Event-B | idénticos elemento a elemento |
| Veredicto de la compuerta | NO-GO para cross-interface SFT |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para estos artefactos, ya que son estados de entrenamiento (state.pt con optimizador y scheduler), no pesos de inferencia empaquetados.
- Para el modelo base Qwen2.5-VL-3B-Instruct en precisión completa se requiere del orden de 6-8 GB de VRAM solo para pesos, más memoria para el procesador visual y el KV cache; estas cifras son estimaciones generales del tamaño, no datos publicados en este repositorio.
- GPU recomendadas para reanudar el entrenamiento: no disponible en la información proporcionada; el piloto usó batch 8 con acumulación de gradiente 4 sobre 295 registros, lo que sugiere un régimen de un solo dispositivo o pocos dispositivos, sin que se especifique el hardware.
- Capacidad en GPU de consumo: no confirmada para estos artefactos; para el modelo base de 3B es plausible en GPUs de 12-24 GB con cuantización, pero no se aporta dato verificado.
- Opciones de despliegue: no disponible. Los checkpoints en state.pt no son directamente compatibles con vLLM, llama.cpp, Ollama o TGI sin conversión previa a safetensors y sin un grafo de inferencia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Executor-Quotient GUI Policy Stage 2A-1 | 3B (base) | no disponible | SFT de política GUI, artefacto de investigación | qwen-research (no comercial) | Hugging Face, 1,4 GB, 0 descargas |
| Qwen/Qwen2.5-VL-3B-Instruct | 3B | no disponible en esta ficha | Modelo base multimodal imagen-texto | qwen-research | Público en Hugging Face |
| Alternativas de política GUI de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables de otros modelos de política GUI en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- No es un agente GUI desplegable: el propio autor indica que los artefactos sirven para reproducir experimentos y comparar unidades de verosimilitud, no para uso directo en producción.
- Rendimiento muy bajo en la tarea objetivo: tasas correctas de eventos del 0,86 %, 4,31 % y 3,45 %, insuficientes para cualquier aplicación real.
- Resultado negativo documentado: la compuerta declara NO-GO para cross-interface SFT; usar estos pesos como base de un producto iría contra la conclusión del propio experimento.
- Licencia restrictiva: derivado de Qwen2.5-VL-3B-Instruct bajo Qwen Research License Agreement, limitado a investigación y evaluación no comercial; el uso comercial requiere solicitud a Alibaba Cloud.
- Idiomas soportados no documentados; la model card está redactada principalmente en chino e inglés y no se especifica cobertura lingüística.
- Longitud de contexto no documentada en la información disponible, lo que impide evaluar el comportamiento en sesiones GUI largas.
- Riesgo de alucinación y sesgos: no evaluados en la información proporcionada; al ser un ajuste sobre 295 registros, la especialización es muy estrecha y la generalización fuera de Elation y Figma es desconocida.
- Dependencia de la reproducibilidad: los resultados solo son verificables con las revisiones exactas de dataset y modelo base indicadas; cambios en esas revisiones invalidan las firmas.
- Los checkpoints incluyen estado de optimizador y RNG, lo que incrementa el tamaño (1,4 GB) y complica su uso como pesos de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gavinlaw/executor-quotient-gui-policy-stage2a1
- Repositorio de código: https://github.com/luojiaxuan/executor-quotient-gui-policy
- Dataset: https://huggingface.co/datasets/gavinlaw/executor-quotient-wainf-event-lattice
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Revisión del modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct/tree/66285546d2b821cf421d4f5eb2576359d3770cd3
- Commit de entrenamiento: https://github.com/luojiaxuan/executor-quotient-gui-policy/commit/98d6fe085975f7530073ba0d8f8a3c336c9e5b83
- Commit de evaluación final: https://github.com/luojiaxuan/executor-quotient-gui-policy/commit/b3432b5
