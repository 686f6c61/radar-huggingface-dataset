# flaviussteff/spp-ro-base-rewarm

## Resumen

`spp-ro-base-rewarm` es un modelo de lenguaje causal monolingüe en rumano de 88,1 millones de parámetros, desarrollado por Flavius-Ștefan Hăbeanu en el marco de su tesis de grado en la Facultad de Matemáticas e Informática de la Universidad de Bucarest (2026). Forma parte de la familia **SPP-Ro**, una replicación desde cero y con cómputo equiparado del trabajo *Synthetic Persona Pretraining* (Minder et al., EPFL-dlab, 2026), que compara tres regímenes de preentrenamiento —Vanilla, Filtered y SPP— sobre exactamente el mismo flujo documental.

Este checkpoint concreto es el **control** del experimento: el modelo Vanilla en el paso 45.000, reentrenado 5.000 pasos adicionales con un schedule de learning rate fresco (pico 5e-5, 250 pasos de warm-up, coseno hasta cero) y sin reflexiones sintéticas. Su función es aislar el efecto del reentrenamiento frente a `spp-ro-mt`, de modo que cualquier diferencia atribuible a las reflexiones no quede confundida con el propio reajuste del optimizador.

El modelo es relevante no por su rendimiento absoluto —a 88M de parámetros no resuelve benchmarks de alineación— sino como artefacto metodológico reproducible: cuantifica el *alignment tax* sobre un corpus rumano controlado y demuestra que el preentrenamiento con personas sintéticas no degrada la perplejidad, mientras que el filtrado por clasificador de seguridad sí cuesta conocimiento medible. La arquitectura es un transformer denso tipo Llama con GQA, contexto de 1.024 tokens y embeddings atados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (estilo Llama), denso |
| Parámetros totales | 88.099.584 (~88,1 M), embeddings atados |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens (RoPE theta 10.000) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; el autor usa fp32/bf16 en inferencia) |
| Idiomas soportados | rumano (`ro`) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| hidden / intermediate | 768 / 2.048 (SwiGLU) |
| Capas | 12 |
| Atención | GQA, 12 cabezas de query / 4 de key-value |
| Vocabulario | 16.384 BPE byte-level (rumano), token especial `<assistant>` |
| Tamaño del repo | 0,4 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 12 capas con dimensión oculta 768, FFN SwiGLU de 2.048 y atención con grouped-query attention (12 cabezas de query, 4 de key-value). Emplea embeddings atados, RoPE con theta 10.000 y un vocabulario de 16.384 tokens BPE byte-level construido para rumano, con un token especial `<assistant>`.

El entrenamiento parte del checkpoint Vanilla en el paso 45.000 y aplica 5.000 pasos adicionales con un schedule fresco (pico de LR 5e-5, 250 pasos de warm-up, decaimiento coseno hasta cero). Cada paso procesa 64 ventanas empaquetadas de 1.024 posiciones, con documentos terminados en EOS empaquetados por first-fit, atención block-diagonal, posiciones por documento y un 2,4 % de padding; en total, aproximadamente 0,33 mil millones de tokens en esta ejecución. Se usó autocast bf16 con pesos maestros en fp32 sobre una única NVIDIA RTX 3060 de 12 GB.

Los datos provienen de 1,5 millones de documentos rumanos (FineWeb-2 RO, Wikipedia RO y prensa), leídos en un orden de semilla fija idéntico para todos los modelos de la familia. En el sidecar, 150.000 documentos (10 %) llevan una reflexión: los 75.000 mejor puntuados por un clasificador de seguridad más 75.000 benignos; las reflexiones promedian 36 tokens, un ~0,67 % de los tokens entrenados. Este checkpoint, por definición del control, no incorpora reflexiones en el cómputo de pérdida.

## Capacidades

- Generación de texto causal en rumano: continuación de prompts, completado de documentos y generación libre con muestreo por temperatura.
- Modelado de lenguaje y estimación de perplejidad sobre texto rumano (web, Wikipedia, prensa).
- Razonamiento de cloze de cuatro opciones: 89,3 % de acierto en el conjunto de evaluación retenido.
- Capacidad multilingüe: limitada al rumano; no se documenta transferencia a otras lenguas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.
- Token especial `<assistant>` para estructurar turnos, aunque el modelo no ha recibido instruction tuning ni post-entrenamiento.

## Casos de uso

- **Investigación sobre alineación a escala pequeña**: sirve como baseline de control en experimentos que comparan regímenes de preentrenamiento (Vanilla, Filtered, SPP) sobre un flujo documental fijo, permitiendo aislar el efecto del reentrenamiento con schedule fresco.
- **Evaluación de alignment tax en lenguas de bajos recursos**: al medir perplejidad sobre documentos marcados y no marcados por un clasificador de seguridad, permite cuantificar si una técnica de alineación degrada el conocimiento del modelo en rumano.
- **Reproducción de resultados académicos**: con la licencia MIT y los pesos en safetensors, un investigador puede reproducir las tablas de `evals/` del repositorio GitHub del autor sin depender de infraestructura propietaria.
- **Prototipado de modelos rumanos de bajo coste**: con 88M de parámetros y 0,4 GB de repo, cabe en una GPU consumer modesta (RTX 3060 12 GB o inferior) para experimentos de generación de texto en rumano sin requisitos de memoria elevados.
- **Generación de texto rumano para aumento de datos**: el modelo puede producir continuaciones de documentos rumanos que sirvan como material sintético para pipelines de datos, siempre que se filtren y validen posteriormente.
- **Docencia y prácticas de NLP**: su tamaño reducido y su card detallada lo hacen adecuado para cursos que cubran tokenización BPE, empaquetado de secuencias, GQA o schedules de learning rate sobre hardware asequible.
- **Análisis de sesgos en corpus web rumanos**: al estar entrenado solo con texto web, permite estudiar qué sesgos se reproducen en un modelo pequeño y monolingüe antes de cualquier post-entrenamiento.

## Benchmarks y rendimiento

| Métrica | Valor | vs. referencia (`spp-ro-base`) |
|---|---|---|
| Perplejidad, web retenida (1.000 docs) | 18,42 | +0,00 |
| Perplejidad, docs marcados por el clasificador (199 docs) | 26,13 | -0,03 |
| Perplejidad, docs no marcados (1.000 docs) | 17,82 | no disponible |
| Precisión cloze de 4 opciones (1.000 ítems) | 89,3 % | no disponible |
| ConstitutionEval-Ro, letra, 4 rotaciones de-sesgadas (600 ítems, azar 25 %) | 25,8 % | no disponible |
| ConstitutionEval-Ro, PMI (azar 25 %) | 35,8 % | no disponible |
| ConstitutionEval-Ro, continuación (azar 25 %) | 19,8 % | no disponible |
| ConstitutionEval-Ro, oro vs. cada distractor (azar 50 %) | 45,0 % | no disponible |

El autor señala que los cinco modelos de la familia están a nivel de azar en ConstitutionEval-Ro: un modelo de 88M de parámetros no resuelve el benchmark, por lo que no puede mostrar un efecto de alineación a esta escala. El resultado medible es el *alignment tax*: SPP no cuesta perplejidad, mientras que el baseline Filtered pierde conocimiento exactamente en los documentos marcados por el clasificador (+1,13 de perplejidad, peor en el 85 % de ellos, test de signos pareado p ≈ 1e-24).

## Requisitos de hardware

- **VRAM estimada para inferencia**: ~0,35 GB en fp32 (88,1M × 4 bytes), ~0,18 GB en bf16/fp16; con overhead de activaciones y caché KV para 1.024 tokens, holgadamente por debajo de 1 GB.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM; el autor entrenó sobre una RTX 3060 12 GB, y la inferencia cabe en GPUs consumer de gama baja (GTX 1650, RTX 3050, etc.) o incluso en CPU para uso no interactivo.
- **Cabe en consumer GPU**: sí, en prácticamente cualquier GPU consumer moderna.
- **Opciones de despliegue**: `transformers` (referencia del autor), y previsiblemente `llama.cpp`, `Ollama` o `vLLM` si se convierte a GGUF; no se documenta soporte oficial en esos frameworks.
- **Latencia y throughput estimados**: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| `spp-ro-base-rewarm` (este) | 88,1 M | 1.024 | ro | MIT | Control del experimento SPP-Ro; sin post-entrenamiento |
| `flaviussteff/spp-ro-base` | 88,1 M | 1.024 | ro | MIT | Modelo de referencia Vanilla en el paso 45.000 |
| `spp-ro-mt` (familia SPP-Ro) | 88,1 M | 1.024 | ro | MIT | Variante con reflexiones sintéticas; comparación directa |
| Modelos rumanos de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

La comparación más informativa es interna a la familia SPP-Ro, ya que todos los modelos comparten arquitectura, datos y orden de lectura, lo que permite atribuir diferencias exclusivamente al régimen de preentrenamiento.

## Limitaciones y advertencias

- **Tamaño muy reducido**: 88M de parámetros; no resuelve benchmarks de alineación (ConstitutionEval-Ro está a nivel de azar) y su utilidad práctica es limitada.
- **Monolingüe**: solo rumano; no hay evidencia de capacidades en otras lenguas.
- **Solo preentrenamiento**: sin instruction tuning ni post-entrenamiento; no sigue instrucciones de forma fiable y no es apto para uso conversacional directo.
- **Semilla única**: los resultados provienen de una sola ejecución, lo que limita la generalización estadística de las conclusiones.
- **Sesgos de los datos**: entrenado sobre texto web (FineWeb-2 RO, Wikipedia, prensa); reproduce los sesgos de ese corpus.
- **Riesgo de alucinación**: alto en generación libre, como es esperable en un modelo de esta escala sin post-entrenamiento.
- **Contexto corto**: 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- **Licencia MIT**: permite uso comercial, pero el autor declara explícitamente que el modelo no está pensado para producción.
- **Caveat de producción**: cualquier despliegue real requeriría evaluación adicional, filtrado de salidas y probablemente fine-tuning específico de la tarea.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/flaviussteff/spp-ro-base-rewarm
- Modelo de referencia: https://huggingface.co/flaviussteff/spp-ro-base
- Repositorio GitHub del proyecto: https://github.com/flaviussteff/spp-ro
- Paper de referencia (Synthetic Persona Pretraining, Minder et al., EPFL-dlab, 2026): arXiv:2608.13482
- Evaluaciones, predicciones por ítem y tablas LaTeX: carpeta `evals/` del repositorio GitHub
