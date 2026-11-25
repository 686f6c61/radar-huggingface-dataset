# NaturalScale/LoopTitan-Unrolled-1.3B-A0.2B-Muon

## Resumen

LoopTitan-Unrolled-1.3B-A0.2B-Muon es un modelo de lenguaje base entrenado desde cero por NaturalScale dentro de la familia LoopTitan (Phase 1), un programa de investigación sobre arquitecturas Mixture-of-Experts con enrutamiento recurrente y distintas variantes de disposición de expertos. Este checkpoint concreto es el control "unrolled" o de no-revisita: la cadena de capas se ejecuta una sola vez, sin que los tokens vuelvan a visitar bloques ya procesados, lo que sirve como referencia frente a las variantes con bucle del mismo release.

La arquitectura es un transformer MoE con 18 capas a anchura 1056, con 88 expertos en cada una de las tres primeras y tres últimas capas y 44 expertos en cada una de las 12 capas intermedias, con tamaño oculto de experto 384 y un factor de 0,5 aplicado al residual de las capas intermedias. El modelo almacena 1,33B parámetros sin contar embeddings y 1,65B con la matriz de entrada y la cabeza de salida (el recuento que muestra Hugging Face), de los cuales solo 0,22B están activos por token. Se entrenó con el optimizador Muon, y el release incluye el gemelo entrenado con AdamW para comparar el efecto del optimizador.

Es relevante ahora porque forma parte de un conjunto de ocho diseños publicados de forma simultánea (cada uno con variante AdamW y Muon) que permiten aislar el impacto de decisiones arquitectónicas concretas —número de expertos, profundidad, disposición y revisita de capas— sobre la calidad medida en bits por byte. No es un modelo instructivo ni un asistente: es una pieza de investigación reproducible, con licencia MIT y código de carga personalizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con enrutamiento por capa, 18 capas, anchura 1056, variante "unrolled" sin revisita de capas |
| Parametros totales | 1.649.606.112 (1,65B con embeddings y cabeza de salida); 1,33B sin embeddings |
| Parametros activos | 0,22B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers, con `custom_code` para la arquitectura MoE) |

## Arquitectura y entrenamiento

El modelo es un transformer MoE de 18 capas con anchura de representación 1056. La distribución de expertos no es uniforme: las tres primeras y las tres últimas capas alojan 88 expertos cada una, mientras que las 12 capas intermedias alojan 44 expertos cada una, con tamaño oculto de experto 384. Las capas intermedias aplican un factor de 0,5 al residual, un ajuste de escala que estabiliza la propagación de activaciones en profundidad. La variante "unrolled" es explícitamente el control de no-revisita dentro de la familia LoopTitan: no hay parámetros compartidos entre visitas porque no hay visitas múltiples; cada capa se ejecuta una sola vez sobre la secuencia.

El entrenamiento parte de cero sobre el dataset `mlfoundations/dclm-baseline-1.0-parquet` (DCLM baseline), y este checkpoint usa el optimizador Muon en lugar de AdamW. El release empareja cada diseño con una variante AdamW para aislar el efecto del optimizador: según los datos del autor, el control unrolled obtiene una mejora de -3,33 mBPB en test frente al MoE estándar con Muon, mientras que la misma arquitectura con AdamW logra -8,9 mBPB, lo que sugiere que el optimizador interactúa de forma significativa con la disposición de expertos. No se documentan en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo fases de RLHF o DPO; la model card indica explícitamente que es un modelo base, no ajustado por instrucciones.

## Capacidades

- Generación de texto autoregresiva como modelo de lenguaje base; no está ajustado para seguir instrucciones ni para formato conversacional, pese a la etiqueta `conversational` del repositorio.
- Modelado de lenguaje medido en bits por byte (BPB) sobre DCLM, que es la métrica principal con la que el autor evalúa y compara los ocho diseños del release.
- Enrutamiento MoE disperso con 0,22B parámetros activos por token sobre 1,65B totales, lo que reduce el coste computacional por token frente a un modelo denso del mismo tamaño.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidades multilingües: no disponibles; el corpus DCLM es mayoritariamente inglés, pero el autor no declara la cobertura idiomática.
- Requiere `trust_remote_code=True` por el código personalizado de la arquitectura MoE.

## Casos de uso

- Investigación sobre arquitecturas MoE: el checkpoint sirve como referencia de control "sin revisita" para comparar contra las variantes con bucle del mismo release y medir el efecto de la recurrencia sobre BPB con un presupuesto de parámetros activos idéntico.
- Estudio del efecto del optimizador: al existir un gemelo entrenado con AdamW, permite aislar empíricamente cómo Muon cambia la calidad final en función de la disposición de expertos, un experimento difícil de reproducir sin checkpoints emparejados.
- Evaluación de eficiencia de parámetros activos: con 0,22B activos por token, es adecuado para experimentos que comparan calidad por FLOP frente a modelos densos de tamaño similar en tareas de modelado de lenguaje.
- Base para ajuste fino supervisado en dominios concretos: al ser un modelo base con licencia MIT, puede servir de punto de partida para SFT en tareas específicas, aunque su reducido tamaño y su naturaleza de investigación limitan el rendimiento esperado frente a bases más grandes.
- Reproducción de resultados académicos: los enlaces a documentación y resultados del proyecto LoopTitan permiten replicar las curvas de BPB y verificar las cifras declaradas en la model card.
- Prototipado de infraestructura de servicio MoE: útil para probar pipelines de despliegue con enrutamiento disperso, carga de código personalizado y verificación de que el número de expertos activos coincide con el esperado, antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Datos declarados por el autor en la model-index de la model card (no verificados de forma independiente):

| Metrica | Valor | Conjunto |
|---|---:|---|
| Test BPB | 0,971043 | mlfoundations/dclm-baseline-1.0-parquet (split de test completo) |
| Validation BPB | 0,972988 | mlfoundations/dclm-baseline-1.0-parquet (split de validación completo) |
| Delta test vs MoE estándar (Muon) | -3,33 mBPB | Referencia: MoE estándar con Muon |

Para contexto, el autor publica los deltas de test frente al MoE estándar para los ocho diseños del release con cada optimizador: MoE estándar AdamW +0,0 / Muon +0,0; expertos más finos AdamW -4,2 / Muon -0,9; más profundo y estrecho AdamW -6,9 / Muon -4,2; disposición de expertos AdamW -5,9 / Muon -3,4; unrolled AdamW -8,9 / Muon -3,3; el bucle AdamW -9,0 / Muon -3,7; una visita más AdamW -14,8 / Muon -12,2; el doble de expertos AdamW -14,3 / Muon -9,9. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: en torno a 3,3 GB solo para pesos (1,65B parámetros × 2 bytes), más overhead de activaciones, caché KV y buffers del enrutador MoE; en la práctica, entre 5 y 8 GB según longitud de secuencia y batch.
- En FP32: aproximadamente 6,6 GB solo de pesos, lo que coincide con el tamaño del repositorio (6,6 GB).
- Cuantización: no se publican GGUF ni cuantizaciones oficiales; al requerir `custom_code`, la conversión a llama.cpp u otros runtimes no es directa y exigiría portar la arquitectura.
- GPU recomendadas: cualquier GPU con 8-16 GB de VRAM es suficiente para inferencia en precisión nativa (RTX 3060 12 GB, RTX 4070, RTX 4090, A10, L4). Para entrenamiento o ajuste fino completo se recomienda A100 40/80 GB o H100.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y equivalentes, siempre con `transformers` y `trust_remote_code=True`.
- Opciones de despliegue: `transformers` es la vía soportada de forma nativa. vLLM, TGI, llama.cpp y Ollama no documentan soporte para esta arquitectura en la información disponible, y su integración requeriría implementar el enrutamiento MoE personalizado.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---:|---:|---|---|---|
| LoopTitan-Unrolled-1.3B-A0.2B-Muon | 1,65B | 0,22B | no disponible | MIT | Control sin revisita; métrica BPB 0,971 en test |
| LoopTitan (variantes con bucle del mismo release) | ~1,65B | 0,22B | no disponible | MIT | Mismo presupuesto; deltas de -3,7 a -12,2 mBPB con Muon según diseño |
| MoE estándar del release (referencia del autor) | no disponible | no disponible | no disponible | MIT | Base de comparación con delta 0,0 mBPB |
| Alternativas densas de ~1,3-1,7B (p. ej. familias tipo Qwen, Llama, SmolLM) | ~1,3-1,7B | densas (todos activos) | variable | variable | No comparadas por el autor en la información disponible; sin datos de BPB equivalentes |

La comparación más informativa que publica el autor es interna al release: frente al MoE estándar con Muon, este control unrolled mejora 3,33 mBPB, pero queda por detrás de las variantes con una visita adicional (-12,2 mBPB) y del doble de expertos (-9,9 mBPB) bajo el mismo optimizador. No hay comparación publicada con modelos de otras familias.

## Limitaciones y advertencias

- Es un modelo base, no ajustado por instrucciones: no debe esperarse comportamiento de asistente, seguimiento de formato ni rechazo de peticiones dañinas.
- Riesgo de alucinación y de generación de contenido sesgado o tóxico: el corpus DCLM es web scrape sin filtrado orientado a seguridad documentado en la información disponible.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Idiomas soportados no declarados: el rendimiento fuera del inglés es incierto.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar el repositorio antes de desplegarlo en producción.
- Sin cuantizaciones oficiales ni soporte documentado en vLLM, TGI, llama.cpp u Ollama: el despliegue eficiente exige trabajo de integración.
- Licencia MIT permite uso comercial, pero al ser un artefacto de investigación con 3 descargas y sin validación externa, no es recomendable como base de producto sin evaluación propia.
- Los benchmarks son BPB sobre DCLM declarados por el autor y marcados como no verificados; no hay resultados en tareas downstream (MMLU, HumanEval, GSM8K) que permitan estimar capacidad práctica.
- El delta frente al MoE estándar con Muon (-3,33 mBPB) es menor que el de la misma arquitectura con AdamW (-8,9 mBPB), lo que indica una interacción no trivial entre optimizador y diseño que conviene tener en cuenta al interpretar los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NaturalScale/LoopTitan-Unrolled-1.3B-A0.2B-Muon
- Página del proyecto LoopTitan: https://datamllab.github.io/LoopTitan/
- Repositorio de código: https://github.com/datamllab/LoopTitan
- Documentación: https://github.com/datamllab/LoopTitan/tree/main/docs
- Resultados de la Phase 1: https://github.com/datamllab/LoopTitan/blob/main/docs/results/phase1.md
- Colección de modelos LoopTitan Phase 1: https://huggingface.co/collections/NaturalScale/looptitan-phase-1-6afb1e0dbc400210b5b0a5eb
- Dataset de entrenamiento: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0-parquet
