# Jeesup/svd-safety-l3_remove30_swapgapiter_b010_r08

# Jeesup/svd-safety-l3_remove30_swapgapiter_b010_r08

## Resumen

Este checkpoint es un artefacto de investigación construido a partir de meta-llama/Meta-Llama-3-8B-Instruct. Se ha comprimido con la técnica SVD-LLM hasta conservar el 70,0% de los parámetros densos (se elimina el 30,01%) y, sobre ese modelo comprimido, se ha aplicado una edición iterativa de "swap" de parámetros, neutra en número de parámetros, seleccionada por la regla `gap_iter`. El resultado publicado corresponde a 8 de las 10 rondas iterativas previstas, con un presupuesto de restauración del 1,000% de los parámetros densos y un 0,80% de los parámetros de proyección intercambiados.

El problema que aborda no es el rendimiento conversacional, sino cuantificar cuánto daña la compresión SVD al comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño. El autor indica explícitamente que varias celdas de su rejilla experimental están degradadas en seguridad de forma deliberada y que este checkpoint concreto es un sujeto de estudio, no un asistente desplegable. Esto lo convierte en material relevante para investigación en compresión, seguridad e interpretabilidad, no para uso en producto.

Los datos publicados son escasos y de naturaleza exclusivamente de seguridad: ASR de 0,0350 en AdvBench, ASR de 0,0300 en StrongREJECT (ambos con juez HarmBench) y un sobre-rechazo macro de 0,3032 medido con WildGuard. No hay cifras de capacidades generales ni de idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama 3, heredada de meta-llama/Meta-Llama-3-8B-Instruct; modificada mediante truncamiento SVD-LLM y swaps de componentes |
| Parámetros totales | 8.030.261.248 (recuento de safetensors); fracción de parámetros densos declarada por el autor: 0,6999 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card de este checkpoint; el modelo base declara 8.192 tokens, valor no confirmado para esta variante comprimida |
| Tipos de cuantización | no disponible; el repositorio solo publica pesos en precisión completa (repo de 16,1 GB) |
| Idiomas soportados | no disponible |
| Licencia | Llama 3 Community License (Meta Llama 3 Community License); se incluyen LICENSE y USE_POLICY.md en el repositorio |
| Formato de pesos | safetensors (carga vía transformers) |
| Modelo base | meta-llama/Meta-Llama-3-8B-Instruct |
| Pipeline declarado | text-generation |
| Compatibilidad | text-generation-inference, endpoints_compatible |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de 8B de Meta. Sobre él se aplica SVD-LLM, que descompone en valores singulares las matrices de pesos y trunca componentes para reducir el número de parámetros efectivos; en este caso se elimina el 30,01% de los parámetros densos, dejando una fracción resultante de 0,6999. Después se ejecuta un procedimiento de edición por intercambio ("swap") de componentes entre el modelo comprimido y otro origen, con selección basada en la regla `gap_iter`. Cada ronda intercambia hasta un 0,100% de los parámetros densos, con un presupuesto total previsto del 1,0%; se han aplicado 8 de las 10 rondas. En total se restauran 8.231 componentes y se sustituyen 8.231, con 55.790.592 parámetros intercambiados (0,80% de los parámetros de proyección densos) y valor de swap `insert` (solo valor de inserción, con evicción ordenada por sigma). La semilla es 42.

No hay evidencia de un entrenamiento adicional: no se documentan tokens de preentrenamiento, composición de dataset, ni fases de RLHF o DPO en este artefacto. La innovación técnica del trabajo es metodológica: medir la pérdida de seguridad inducida por la compresión y comparar reglas de selección de componentes para repararla, incluyendo el efecto sobre el rechazo excesivo, no una mejora de arquitectura.

Una advertencia técnica relevante: el recuento de parámetros de safetensors (8.030.261.248) coincide con el de un Llama 3 8B denso completo, aunque la model card declara una fracción de 0,6999. La model card no explica cómo se materializa la compresión en los tensores publicados, por lo que conviene inspeccionar las formas y rangos reales antes de asumir ahorros de memoria o de cómputo.

## Capacidades

- Generación de texto conversacional (`pipeline_tag: text-generation`), al ser un derivado de Llama-3-8B-Instruct.
- Comportamiento de rechazo ante peticiones dañinas, cuantificado por el autor: ASR de 0,0350 en AdvBench y 0,0300 en StrongREJECT con juez HarmBench.
- Rechazo excesivo medible: 0,3032 de sobre-rechazo macro según WildGuard, es decir, aproximadamente el 30% de peticiones benignas rechazadas en esa evaluación.
- Utilidad como objeto de estudio de compresión: permite comparar el efecto de la regla `gap_iter` frente a otras reglas y presupuestos de la misma rejilla.
- Soporte de tool calling / function calling: no disponible (no se declara ni se evalúa).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se declara ni se evalúa).
- Capacidades multilingües: no disponible (el campo de idiomas no está cumplimentado).
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el modelo es exclusivamente de texto.
- Capacidades de código, matemáticas o razonamiento: no se publican evaluaciones de MMLU, HumanEval, GSM8K ni similares.

## Casos de uso

- Reproducción de estudios de seguridad bajo compresión: ejecutar AdvBench y StrongREJECT con juez HarmBench sobre este checkpoint y sobre el modelo base sin comprimir para aislar cuánta seguridad se pierde por el truncamiento SVD del 30,01%.
- Comparación de reglas de selección de componentes: usar esta celda (`gap_iter`, presupuesto del 1,000%) frente a otras celdas de la misma rejilla para determinar qué heurística de selección repara mejor el comportamiento de rechazo.
- Análisis de la dinámica iterativa de reparación: al ser una instantánea de la ronda 8 de 10, permite trazar la curva de recuperación de seguridad y de utilidad ronda a ronda y estimar el retorno marginal de cada 0,100% de parámetros intercambiados.
- Medición de sobre-rechazo y calibración del equilibrio seguridad-utilidad: el valor de 0,3032 en WildGuard sirve como punto de referencia para estudiar el coste en falsos positivos de las intervenciones de seguridad.
- Interpretabilidad de subespacios singulares: analizar qué componentes (direcciones asociadas a valores singulares concretos) se restauran y se eviccionan, y correlacionarlos con comportamientos de rechazo observables.
- Punto de partida para experimentos de recuperación de utilidad: aplicar ajuste supervisado o DPO sobre este checkpoint para medir cuánta capacidad general se puede recuperar tras la compresión, comparando con el modelo base.
- Evaluación de pipelines de cuantización posteriores: cuantizar este checkpoint a 8 o 4 bits y medir la degradación adicional de seguridad y de utilidad, ya que el repositorio solo ofrece precisión completa.
- Referencia negativa en auditorías de modelos comprimidos: utilizarlo como caso etiquetado de "modelo degradado a propósito" para validar herramientas internas de evaluación de seguridad.

## Benchmarks y rendimiento

| Benchmark | Métrica | Valor |
|---|---|---|
| AdvBench | ASR (juez HarmBench) | 0,0350 |
| StrongREJECT | ASR (juez HarmBench) | 0,0300 |
| WildGuard | Sobre-rechazo macro | 0,3032 |

No se han publicado resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K, MT-Bench u otros) en la información disponible, ni cifras de latencia o throughput.

## Requisitos de hardware

- Pesos en precisión completa (estado publicado): unos 16,1 GB de repositorio; en FP16/BF16 los pesos ocupan aproximadamente 16 GB de VRAM.
- VRAM estimada para inferencia en FP16/BF16: 18-20 GB considerando caché KV y activaciones en contextos medios (estimación, no confirmada por el autor).
- VRAM estimada en cuantización de 8 bits: 9-10 GB; en 4 bits: 5-6 GB (estimaciones; no hay versiones cuantizadas publicadas ni medidas oficiales).
- GPU recomendadas: A100 40/80 GB y H100 para servicio en FP16 con lotes; RTX 3090 o RTX 4090 (24 GB) para FP16 con una sola petición y secuencias cortas; RTX 4080/4070 Ti (16 GB) y RTX 3060 (12 GB) requerirían cuantización.
- ¿Cabe en GPU de consumo? Sí en FP16 con matices en tarjetas de 24 GB; con comodidad solo tras cuantización a 8 o 4 bits.
- Opciones de despliegue: transformers (librería declarada), TGI (etiqueta `text-generation-inference`), vLLM y HF Inference Endpoints (`endpoints_compatible`). Para llama.cpp u Ollama sería necesaria una conversión a GGUF que no se publica en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Seguridad (ASR) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeesup/svd-safety-l3_remove30_swapgapiter_b010_r08 | 8.030.261.248 (fracción densa declarada 0,6999) | no disponible para esta variante | AdvBench 0,0350; StrongREJECT 0,0300 | Llama 3 Community License | safetensors en HF |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.030.261.248 | 8.192 tokens | no disponible en esta información (el autor afirma que la compresión sola eleva el ASR, pero no publica el valor del base) | Llama 3 Community License | safetensors en HF |
| Otras celdas de la rejilla del autor (por ejemplo, variantes con otra regla de selección o presupuesto) | no disponible | no disponible | no disponible | Llama 3 Community License | no disponible (la model card menciona la rejilla, pero no lista los identificadores) |

## Limitaciones y advertencias

- No es un modelo de propósito general: el propio autor indica que es un sujeto experimental y que no debe tratarse como un asistente desplegable.
- Varias celdas de la rejilla experimental están degradadas en seguridad de forma deliberada; aunque este checkpoint mida 0,0350 y 0,0300 de ASR, el riesgo residual no es nulo y debe reevaluarse en el entorno de destino.
- Sobre-rechazo elevado: 0,3032 macro en WildGuard, lo que implica rechazar alrededor del 30% de peticiones benignas en esa evaluación.
- Ausencia total de benchmarks de capacidad general: no se puede afirmar qué calidad de generación, razonamiento o código conserva tras la compresión y la edición.
- Discrepancia entre la fracción de parámetros declarada (0,6999) y el recuento de safetensors (8.030.261.248), sin aclaración en la model card; verificar antes de asumir ahorros reales de memoria o cómputo.
- Idiomas no declarados: no hay garantía documentada de comportamiento multilingüe.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible; al derivar de Llama-3-8B-Instruct hereda los sesgos de este, no cuantificados aquí.
- Alucinación: no se publican evaluaciones de veracidad; el riesgo es el típico de un modelo de 8B y puede agravarse por el truncamiento de componentes.
- Licencia: Llama 3 Community License, con política de uso aceptable asociada (USE_POLICY.md) y requisitos de atribución ("Built with Meta Llama 3"). Es una licencia de uso restringido, no de código abierto permisivo; revisar las cláusulas aplicables antes de cualquier uso comercial.
- Trazabilidad: el repositorio registra 0 descargas y 0 likes, sin publicaciones asociadas, por lo que no existen validaciones independientes de sus métricas.
- Para producción, cualquier pipeline debería congelar la revisión exacta del modelo y acompañarla de evaluaciones propias de seguridad y utilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_remove30_swapgapiter_b010_r08
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia y política de uso incluidas en el repositorio: LICENSE y USE_POLICY.md
- Referencias metodológicas (SVD-LLM, reglas de selección de componentes, HarmBench, StrongREJECT, WildGuard): mencionadas en la model card sin enlace directo; no disponibles en la información proporcionada.
- Resultados de búsqueda web: no se ha recuperado ningún enlace relevante sobre este modelo; las páginas devueltas corresponden a soporte técnico de Microsoft y no guardan relación con el artefacto.
