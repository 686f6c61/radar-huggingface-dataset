# dimitarpg13/semsimula-ladder-owt-d384-l2-gpt2-matched

## Resumen

`semsimula-ladder-owt-d384-l2-gpt2-matched` es un modelo de lenguaje de investigación desarrollado por el usuario `dimitarpg13` como **brazo de referencia** de la "escala de mecanismos SemSimula" (SemSimula mechanism ladder) sobre OpenWebText. Se trata de un transformer decoder de tipo GPT-2 con 384 dimensiones de modelo, 8 capas, 6 cabezas de atención y 33.691.776 parámetros (embeddings atados), entrenado exactamente con el mismo presupuesto que el resto de brazos de la escala: 532.480.000 tokens (32.500 pasos × 32 × 512) sobre OpenWebText con el tokenizador BPE de GPT-2 (50.257 tokens).

El propósito del modelo no es competir en capacidades generales, sino servir de **baseline arquitectónico** dentro de un estudio de ablación pre-registrado. La escala agrupa cinco (o más) modelos que difieren entre sí por un único mecanismo, de modo que la diferencia de perplejidad entre brazos se atribuye por construcción al mecanismo eliminado y no a variaciones de presupuesto. Este brazo en concreto elimina "la arquitectura de referencia", es decir, representa el transformer GPT-2 estándar frente a las variantes con mecánica lagrangiana (potencial escalar, campo de intercambio de Fock, mecanismo de registro).

Es relevante ahora por dos motivos. Primero, porque publica la perplejidad de validación "asentada" en 49,81 (media de las tres últimas evaluaciones de 500 pasos en bloque 512), un punto de comparación reproducible para todas las variantes de la familia. Segundo, porque todo el diseño experimental está pre-registrado (predicciones anotadas antes de la ejecución), lo que permite tratar cada inversión de orden como un resultado y no como ruido. El modelo se publica bajo licencia CC-BY-4.0 y con idioma declarado inglés (`en`).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder GPT-2 (atención causal multi-cabeza) |
| Parámetros totales | 33.691.776 |
| Parámetros activos | No aplica (no es MoE; todas las capas se activan) |
| Longitud de contexto | 512 tokens por bloque en entrenamiento y evaluación (32 × 512); máximo no especificado en la información disponible |
| Tipos de cuantización | No disponible (el repositorio se distribuye en PyTorch; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (`library_name: pytorch`); tamaño del repositorio 0,3 GB; contenedor exacto no detallado |

**Detalles arquitectónicos adicionales (según la model card):**

| Parámetro | Valor |
|---|---|
| Dimensión del modelo (d) | 384 |
| Capas (L) | 8 |
| Cabezas de atención | 6 |
| Dimensión feed-forward (d_ff) | 1536 |
| Embeddings | Atados (tied embeddings) |
| Tokens de entrenamiento | 532.480.000 |
| Tasa de aprendizaje | 0,0006 |
| Corpus | OpenWebText, tokenizador GPT-2 BPE (50.257) |
| Perplejidad asentada (validación, bloque 512) | 49,81 |
| Mejor perplejidad / final | 49,76 (paso 32.500) |

## Arquitectura y entrenamiento

La arquitectura es un **transformer decoder GPT-2 canónico**: atención causal multi-cabeza, normalización LayerNorm, red feed-forward con activación y embeddings atados entre la matriz de entrada y la cabeza de salida. Con d=384, L=8, 6 cabezas y d_ff=1536, el recuento de parámetros (≈33,7 M) concuerda con el vocabulario GPT-2 de 50.257 tokens, donde los embeddings atados aportan la mayor parte del total. Este brazo representa deliberadamente "la arquitectura de referencia" dentro de la escala: es el punto contra el que se miden los modelos con potencial escalar y campos de intercambio.

El entrenamiento es idéntico en presupuesto para todos los brazos: 32.500 pasos, tamaño de lote 32 y longitud de secuencia 512, lo que da 532.480.000 tokens sobre OpenWebText con el tokenizador BPE de GPT-2. No se menciona en la información disponible el uso de RLHF, DPO u otro ajuste por preferencias, ni fases de instrucción. La métrica principal es la perplejidad "asentada" (*settled PPL*), definida como la media de las tres últimas evaluaciones de 500 pasos en bloque 512, lo que reduce la varianza del último punto de control. La predicción pre-registrada para este brazo era una perplejidad por debajo de 54,59, con punto estimado 49,5 y banda 49,0-50,0; el resultado medido (49,81) supone un acierto con un error de +0,26.

La innovación del conjunto no está en este modelo, sino en la metodología: la escala fija el presupuesto de tokens para que cada diferencia de perplejidad "precie" un mecanismo concreto. La model card documenta además que las variantes con mecanismo de registro integran un sistema mecánico amortiguado en el espacio semántico (ecuación `m·ḧ = −∇V_θ(h) − γm·ḣ + F_rc(h,r) + F_φ(h)`), donde `F_rc` es el término no conservativo que hace la trayectoria no geodésica. Este brazo GPT-2 sirve de contraste para cuantificar el valor de dichos mecanismos.

## Capacidades

- **Generación de texto en inglés**: modelo autoregresivo de tipo GPT-2; produce continuaciones de texto coherentes a corto plazo (ventana de 512 tokens).
- **Modelado de lenguaje y estimación de perplejidad**: capacidad principal y mejor caracterizada; sirve como referencia para medir perplejidad en OpenWebText.
- **Razonamiento**: no verificado; con 33,7 M de parámetros y sin ajuste por instrucciones, la capacidad de razonamiento multi-paso es muy limitada.
- **Código y matemáticas**: no documentado ni evaluado en la información disponible.
- **Tool calling / function calling**: no soportado; no se menciona ningún formato de llamada a herramientas ni entrenamiento orientado a ello.
- **Agentes y razonamiento multi-paso**: no soportado; el modelo no está diseñado ni ajustado para ello.
- **Multilingüismo**: no; el único idioma declarado es el inglés (`en`), y el corpus (OpenWebText) es mayoritariamente inglés.
- **Capacidades especiales**: ninguna (no hay modo "thinking", visión, audio ni decodificación especulativa documentada). Es un baseline de investigación.

## Casos de uso

- **Reproducción de la escala de ablación SemSimula**: usar este checkpoint como brazo de referencia ("matched GPT-2") para recalcular la perplejidad asentada en bloque 512 y contrastar los 49,81 publicados frente a los demás brazos de la colección.
- **Control en experimentos de ablación con presupuesto fijo**: al compartir corpus, tokenizador y 532.480.000 tokens con el resto de brazos, permite aislar el efecto de un mecanismo arquitectónico sin confundirlo con diferencias de cómputo o de datos.
- **Baseline para estudios de escalado a pequeña escala**: su tamaño (33,7 M) y su perplejidad medida lo hacen útil como punto bajo en curvas de escalado que comparen variantes a d=384.
- **Ajuste fino (fine-tuning) para generación de texto en un dominio concreto**: es viable reentrenar la cabeza o todo el modelo para tareas de generación en inglés con recursos muy reducidos, dado el bajo coste de cómputo.
- **Docencia sobre transformers y curvas de perplejidad**: por su tamaño reducido y su arquitectura GPT-2 estándar, sirve para ilustrar entrenamiento, evaluación y lectura de perplejidad en cursos o talleres.
- **Pruebas de infraestructura de entrenamiento e inferencia**: validar pipelines de datos, checkpoints, evaluación y despliegue con un modelo que entrena y se sirve en pocos minutos.
- **Generación de texto de bajo coste en CPU o dispositivos limitados**: con menos de 135 MB en fp32 y ~17 MB en int4, cabe holgadamente en CPU y en hardware embebido para tareas de completado simple.
- **Evaluación de métodos de cuantización**: al ser pequeño y con perplejidad conocida en OpenWebText, permite medir el impacto de int8/int4 sobre la calidad con un coste mínimo.

## Benchmarks y rendimiento

Resultado oficial declarado en el `model-index` de la model card:

| Tarea | Dataset | Métrica | Valor | Verificado |
|---|---|---|---|---|
| Generación de texto | OpenWebText (validación) | Perplejidad (bloque 512, asentada: media de las tres últimas evaluaciones de 500 pasos) | 49,81 | No (`verified: false`) |

Comparación entre brazos de la misma escala SemSimula (OpenWebText, d=384, L=2/d=384, mismo presupuesto de 532.480.000 tokens; valores declarados por el autor):

| Brazo (mecanismo eliminado) | Perplejidad asentada | Ratio vs GPT-2 |
|---|---:|---:|
| Matched GPT-2 baseline (este modelo) — la arquitectura de referencia | 49,81 | 1,000× |
| Fock-PARFLM, `attention` — el propio transformer | 63,51 | 1,275× |
| Fock-PARFLM, `none` — el campo de intercambio | 66,98 | 1,345× |
| Fock-PARFLM, `attention_potential` — la conservatividad | 80,90 | 1,624× |
| Control solo conservativo, `none-norc` — el mecanismo de Fock | 87,93 | 1,765× |
| Multi-ξ SPLM — Vφ y Fock | Dentro del 5% de 87,93 (predicción pre-registrada) | — |
| Fock-SPLM — Vφ (con Fock activo) | Dentro del 5% de 66,98 (predicción pre-registrada) | — |

Diferencias "preciadas" por cada salto, según la model card:

| Salto | Mecanismo que precia | Valor |
|---|---|---|
| GPT-2 baseline → Fock-PARFLM (`attention`) | lo que el transformer aporta y esta arquitectura no | 13,70 PPL (+27,5%), medido |
| Fock-PARFLM (`attention`) → Fock-PARFLM (`attention_potential`) | el precio de la conservatividad | 17,39 PPL (+27,4%), medido |
| Fock-PARFLM (`attention_potential`) → Fock-PARFLM (`none`) | el campo de intercambio | −13,92 PPL, medido |
| Fock-PARFLM (`none`) → control solo conservativo (`none-norc`) | el mecanismo de Fock (ruta registro→token) | 20,95 PPL (+31,3%), medido |
| Fock-PARFLM (`none`) → Fock-SPLM | Vφ / PARF, con registro presente | Pendiente |
| Control solo conservativo → Multi-ξ SPLM | Vφ / PARF, sin registro | Pendiente |

No se han publicado en la información disponible otros benchmarks (MMLU, HumanEval, GSM8K, etc.) para este modelo.

## Requisitos de hardware

- **VRAM estimada para los pesos**: ~128-135 MB en fp32, ~67 MB en fp16/bf16, ~34 MB en int8 y ~17 MB en int4. Las activaciones a 512 tokens son despreciables frente a los pesos.
- **GPU recomendadas**: cualquier GPU moderna es sobradamente suficiente; incluso GPUs de gama baja (GTX 1050 Ti, GTX 1650) o gráficas integradas pueden servirlo. Aceleradores como A100 o H100 están enormemente sobredimensionados.
- **Cabe en GPU de consumo**: sí, en todas; también en CPU (inferencia en CPU perfectamente viable para generación a baja escala).
- **Opciones de despliegue**: PyTorch nativo (librería declarada), `transformers` de Hugging Face (arquitectura GPT-2), `torch.compile`, exportación a ONNX y, si se convierte a GGUF, `llama.cpp`/Ollama. Motores como vLLM o TGI son compatibles en principio con la arquitectura, pero resultan excesivos por el tamaño del modelo.
- **Latencia y throughput**: no disponible; no se publican cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

La comparación natural es contra los otros brazos de la misma escala (mismo corpus, tokenizador, presupuesto y dimensiones), ya recogidos en la sección de benchmarks. Frente a modelos externos de la misma categoría (transformers pequeños):

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---:|---|---|---|---|
| Este modelo (GPT-2 matched, SemSimula) | 33.691.776 | 512 (bloques de entrenamiento/evaluación) | CC-BY-4.0 | Hugging Face | Baseline de ablación; PPL 49,81 en OpenWebText |
| Fock-PARFLM (`none`, SemSimula) | No disponible | 512 | CC-BY-4.0 (familia) | Hugging Face | PPL 66,98; mismo presupuesto |
| Control solo conservativo (`none-norc`, SemSimula) | No disponible | 512 | CC-BY-4.0 (familia) | Hugging Face | PPL 87,93; único brazo totalmente conservativo |
| GPT-2 small (arquitectura equivalente, entrenamiento distinto) | 124 M | 1024 | MIT | Hugging Face | Referencia arquitectónica; no se dispone de una perplejidad comparable en OpenWebText en la información proporcionada |

Para cualquier comparación externa (por ejemplo, con GPT-2 small o modelos pequeños tipo TinyStories/Pythia), no hay datos de perplejidad equivalentes en la información disponible; se marcan como "no disponible".

## Limitaciones y advertencias

- **Modelo de investigación, no de producción**: se publica como artefacto de un estudio de ablación; no está ajustado por instrucciones ni optimizado para uso final.
- **Tamaño muy reducido**: con 33.691.776 parámetros, su conocimiento factual, coherencia a largo plazo y capacidad de razonamiento son limitados.
- **Solo inglés**: el único idioma declarado es `en`; el rendimiento fuera del inglés no está garantizado ni evaluado.
- **Ventana de contexto corta**: el entrenamiento y la evaluación usan bloques de 512 tokens; no se especifica un máximo superior, por lo que no conviene asumir contextos largos.
- **Riesgo de alucinación**: como todo LM autoregresivo sin ajuste por preferencias ni verificación factual, puede generar texto plausible pero falso.
- **Sesgos**: entrenado sobre OpenWebText (contenido de Reddit enlazado), hereda los sesgos de ese corpus; no se documenta ningún proceso de mitigación.
- **Métrica no verificada**: la perplejidad del `model-index` está marcada como `verified: false`; se trata de un resultado declarado por el autor.
- **Comparaciones internas**: los valores de la escala y las predicciones pre-registradas provienen del mismo autor y no han sido replicados de forma independiente; varios saltos figuran como "pendientes".
- **Licencia CC-BY-4.0**: permite uso comercial, pero exige atribución y el cumplimiento de las condiciones de la licencia; conviene revisar la model card para cualquier uso derivado.
- **Sin datos de cuantización oficiales**: no se documentan checkpoints GGUF/GGML ni cuantizaciones validadas, por lo que cualquier conversión es responsabilidad del usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-gpt2-matched
- Perfil del autor: https://huggingface.co/dimitarpg13
- Brazo `attention` (Fock-PARFLM, campo de intercambio): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-attention
- Brazo `attention_potential` (Fock-PARFLM, potencial escalar): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-attention-potential
- Brazo `none` (Fock-PARFLM, sin campo de intercambio): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-none
- Brazo `none-norc` (control solo conservativo): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-none-norc
- Brazo `splm-multixi` (Multi-ξ SPLM): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-splm-multixi
- Brazo `fock-splm` (Fock-SPLM): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-fock-splm
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext
- Paper o informe técnico: no disponible
- Repositorio de código o demo: no disponible
