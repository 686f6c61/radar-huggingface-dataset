# lmxxf/Qwen3.8-27B-ica-lens

## Resumen

`lmxxf/Qwen3.8-27B-ica-lens` es un artefacto de interpretabilidad mecanicista, no un modelo generativo. Consiste en una lente ICA (Independent Component Analysis) precalculada sobre las 64 capas del modelo `Qwen/Qwen3.8-27B`, con `d_model = 5120`, lo que produce 327.680 pares capa-componente. Lo publica el usuario `lmxxf` bajo licencia Apache 2.0 y se distribuye mediante la librería `icalens` (v0.4.0), cuyo estimador se describe en el paper arXiv:2606.11722.

El propósito es permitir el análisis de activaciones del flujo residual de Qwen3.8-27B en una base de componentes independientes, de forma que cada eje tenga una interpretación más cercana a semántica léxica que a coordenadas arbitrarias del espacio residual. Se ha ajustado con un corpus estrictamente bilingüe 1:1 (inglés y chino) y se complementa con una Jacobian Lens publicada aparte por el mismo autor para hacer lectura de vocabulario sobre capas intermedias.

Su relevancia es acotada pero concreta: cubre las 64 capas del modelo base (48 capas de atención lineal Gated DeltaNet y 16 de atención completa), algo poco habitual en lentes de interpretabilidad publicadas, y ofrece verificación en tokens held-out junto con hallazgos cuantitativos sobre no gaussianidad por capa y alineamiento translingüe de polisemia. No debe confundirse con un checkpoint de pesos del modelo Qwen; el repositorio pesa 13,4 GB y contiene matrices ICA, no pesos del transformer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lente ICA sobre el flujo residual de un transformer híbrido (48 capas Gated DeltaNet + 16 de atención completa); no es un modelo generativo |
| Parametros totales | no disponible (artefacto de análisis; `d_model = 5120`, 64 capas, 327.680 pares capa-componente) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (ventanas de ajuste de hasta 512 tokens, aisladas por documento) |
| Tipos de cuantizacion | no disponible (matrices en FP64 para acumulación de covarianza; artefactos por capa de 200 MiB en safetensors) |
| Idiomas soportados | en, zh (ajuste estrictamente 1:1) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors por capa (`artifacts/resid_post/layer_XX.safetensors`) más `icalens.json`; librería `icalens` |

## Arquitectura y entrenamiento

La lente se ajusta con FastICA simétrica (no linealidad `logcosh`, 50 iteraciones, normalización de entrada por fila en L2, acumulación de covarianza en FP64) sobre activaciones del flujo residual post-capa (`resid_post`) de las 64 capas de Qwen3.8-27B. Cada capa produce una matriz de lectura y una de escritura de 5120×5120, con reconstrucción sobre la entrada normalizada por fila: `u = h / max(||h||_2, 1e-12)`, `y = C(u - c)`, `û = M y + c`. Los signos de cada componente se orientan por la asimetría (skewness) del ajuste, co-invirtiendo la fila de lectura y la columna de escritura para que la asimetría de ajuste sea no negativa, preservando los identificadores `C0..C5119`.

El ajuste usa 200.704 tokens con proporción 1:1 entre WikiText-103 en inglés y Wikipedia en chino, con ventanas aisladas por documento de hasta 512 tokens. La verificación se hace sobre 51.200 tokens held-out no vistos, en dos nodos NVIDIA DGX Spark (GB10) con un tiempo total de 132,9 minutos. El autor reporta un perfil de no gaussianidad en tres etapas sobre held-out: islas léxicas nítidas en la entrada (L0, 5.058 ejes con curtosis en exceso κ > 10, mediana 130,87), un valle de mezcla densa en la zona media (L32, 1.251 ejes con κ > 10, mediana 0,99) y una recristalización tardía (L54, 2.828 ejes con κ > 10, mediana 15,24). Globalmente, 274.451 de 327.680 ejes (83,76%) superan κ > 1 y 144.450 (44,08%) superan κ > 10, con mediana global κ = 6,20 y percentil 99 de 815,97.

Como innovación destacable, el autor reporta alineamiento translingüe de polisemia: bajo evaluación causal de último token, la selección ciega de un único eje para `apple` (fruta vs. empresa) y para `苹果` (fruta vs. empresa) coincide en el mismo ID de eje en 42 de 64 capas, con coseno máximo de 0,879 en L7 y precisión 8/8 en held-out en 55 capas inglesas y 56 chinas. También se documenta el uso conjunto con la Jacobian Lens del mismo autor, que cambia el 81,5% de los tokens Top-5 frente a un Logit Lens ingenuo (J = I) en 6.633 ejes candidatos.

## Capacidades

- Extracción de coordenadas ICA firmadas a partir de activaciones del flujo residual capturadas externamente, capa a capa, mediante `lens.transform(h, layer=N)`.
- Carga bajo demanda por capa: `ICALens.from_pretrained` descarga solo `icalens.json` al inicio y recupera cada `layer_XX.safetensors` (200 MiB) de forma perezosa.
- Lectura de vocabulario sobre capas intermedias combinando direcciones de escritura ICA con la Jacobian Lens `lmxxf/Qwen3.8-27B-jacobian-lens` (N=100, 50 EN + 50 ZH).
- Análisis de polisemia y alineamiento translingüe inglés-chino sobre ejes no supervisados.
- Inspección de la evolución de la no gaussianidad por capa (perfil entrada-valle-re cristalización).
- No realiza generación de texto, razonamiento, código ni matemáticas: es un artefacto de análisis, no un modelo de lenguaje.
- No soporta tool calling, function calling ni flujos de agentes.
- No incorpora visión, audio ni modo de pensamiento.

## Casos de uso

- Auditoría de representaciones internas de Qwen3.8-27B: capturar activaciones `resid_post` en una capa concreta y proyectarlas con `lens.transform` para obtener coordenadas ICA firmadas que permitan estudiar qué direcciones se activan ante un estímulo dado.
- Estudio de polisemia controlada: reproducir el protocolo del autor con pares de acepciones (por ejemplo, fruta frente a empresa tecnológica) en inglés y chino, y comprobar si la selección ciega de eje converge en la misma componente, lo que sirve para validar hipótesis de alineamiento translingüe.
- Análisis de la profundidad de la red: usar el perfil de curtosis por capa para decidir en qué capas tiene sentido hacer lectura de vocabulario y en cuáles el espacio está demasiado mezclado (el autor señala L32 como valle de mezcla).
- Lectura de vocabulario sobre capas intermedias: combinar la matriz de escritura ICA con la Jacobian Lens y el `lm_head` del modelo para inspeccionar qué conceptos son linealmente decodificables en una capa media, útil en estudios de circuitos y de representación de conceptos.
- Investigación en interpretabilidad mecanicista comparada: usar la lente como referencia reproducible en las 64 capas para contrastar métodos (ICA frente a PCA, Logit Lens frente a Jacobian Lens) sobre el mismo modelo base.
- Docencia y formación técnica: emplear el artefacto como ejemplo práctico de ajuste FastICA sobre activaciones de un transformer híbrido con atención lineal, con código de carga y transformación mínimo y dependencias acotadas.
- Depuración de comportamientos bilingües: analizar si una respuesta incorrecta en chino o en inglés se asocia a componentes con lectura léxica inconsistente, como paso previo a hipótesis sobre sesgos o confusiones de acepción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible en el sentido habitual (MMLU, HumanEval, GSM8K). El autor sí reporta métricas internas de la lente, que se recogen a continuación tal cual:

| Metrica | Valor |
|---|---|
| Pares capa-componente | 327.680 (64 capas × 5.120 componentes) |
| Tokens de ajuste | 200.704 (1:1 EN/ZH) |
| Tokens held-out | 51.200 |
| Ejes con curtosis en exceso κ > 1 | 274.451 / 327.680 (83,76%) |
| Ejes con curtosis en exceso κ > 10 | 144.450 / 327.680 (44,08%) |
| Mediana global de κ | 6,20 |
| Percentil 99 de κ | 815,97 |
| L0: ejes con κ > 10 / mediana | 5.058 / 130,87 |
| L32: ejes con κ > 10 / mediana | 1.251 / 0,99 |
| L54: ejes con κ > 10 / mediana | 2.828 / 15,24 |
| Coincidencia de eje en polisemia (`apple` / `苹果`) | 42 de 64 capas |
| Coseno máximo de coincidencia | 0,879 (L7) |
| Precisión held-out 8/8 | 55 capas EN, 56 capas ZH |
| Cambio en Top-5 al usar J-lens frente a Logit Lens | 81,5% en 6.633 ejes (99,81% en L0) |
| Tiempo de ajuste y evaluación | 132,9 minutos en 2 nodos DGX Spark (GB10) |

## Requisitos de hardware

- Almacenamiento: 13,4 GB para el repositorio completo; cada capa individual ocupa unos 200 MiB en safetensors, por lo que la carga perezosa permite trabajar con un subconjunto de capas sin descargar todo.
- Memoria de sistema: la transformación de una única capa requiere cargar una matriz de escritura y una de lectura de 5120×5120; con precisión simple son aproximadamente 100 MiB por matriz, más la copia de trabajo durante el producto matricial.
- GPU: no se especifican requisitos de GPU para la inferencia de la lente. El ajuste se realizó en dos nodos NVIDIA DGX Spark (GB10). Para uso en análisis, cualquier GPU con al menos 8-16 GB de VRAM es suficiente para transformar lotes pequeños de activaciones; el cuello de botella es el tamaño del lote y el número de capas cargadas.
- Cabe en GPU de consumo: sí, con holgura, siempre que se carguen solo las capas necesarias. El uso conjunto con la Jacobian Lens añade matrices de 5120×5120 por capa en FP32.
- Despliegue: no aplica servidor de inferencia (vLLM, TGI, llama.cpp, Ollama); el consumo es vía la librería `icalens` y `safetensors`/`huggingface_hub`. Para el modelo base Qwen3.8-27B sí se necesitaría un stack de inferencia aparte, no incluido en este repositorio.
- Latencia y throughput: no disponibles para la lente. El coste dominante es el producto matriz-vector por capa y por token analizado, no la generación.

## Comparativa con modelos similares

| Artefacto | Modelo base | Capas cubiertas | Metodo | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `lmxxf/Qwen3.8-27B-ica-lens` | Qwen3.8-27B | 64 (todas) | FastICA simétrica, 50 iteraciones | en, zh (1:1) | apache-2.0 | Hugging Face, librería `icalens` 0.4.0 |
| `lmxxf/Qwen3.8-27B-jacobian-lens` | Qwen3.8-27B | no disponible en la información | Jacobian Lens, N=100 | en, zh | no disponible | Hugging Face |
| Logit Lens ingenuo (J = I) | Cualquier transformer | Todas | Proyección directa con `lm_head` | Depende del modelo | no aplica | Implementación trivial, sin artefacto publicado |

No se dispone de información sobre otras lentes ICA públicas comparables para este modelo base ni para modelos de tamaño similar.

## Limitaciones y advertencias

- La lectura de vocabulario mediante la dirección de escritura ICA es heurística: el propio autor advierte que la Jacobian Lens se ajustó sobre residuales crudos mientras que ICA normaliza cada fila de entrada, y que los cambios de vocabulario no constituyen una métrica de precisión de interpretabilidad.
- El conjunto de evaluación de polisemia tiene solo ocho ejemplos por comparación y las capas repetidas no son ensayos independientes, por lo que las cifras de coincidencia de eje no deben tratarse como evidencia estadística fuerte.
- El ajuste usa 50 iteraciones fijas de FastICA, lo que no garantiza convergencia plena en todas las capas; el autor lo reconoce explícitamente.
- El corpus de ajuste es WikiText-103 en inglés y Wikipedia en chino, con ventanas de hasta 512 tokens: el dominio es enciclopédico y la cobertura léxica fuera de ese registro (código, jerga, dominios técnicos) no está garantizada.
- Solo cubre inglés y chino; no hay validación para castellano ni para otras lenguas, por lo que extrapolar interpretaciones a otros idiomas no está respaldado.
- No es un modelo de lenguaje: no genera texto ni puede usarse como sustituto de Qwen3.8-27B. Cualquier expectativa de inferencia generativa es un error de uso.
- El artefacto está ligado a una versión concreta del modelo base (`Qwen/Qwen3.8-27B` y su variante FP8); aplicarlo a otros checkpoints o a versiones posteriores invalida las matrices.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero el modelo base Qwen3.8-27B tiene su propia licencia, que debe verificarse por separado antes de cualquier despliegue en producción.
- Riesgo de sobreinterpretación: componentes con curtosis elevada no equivalen necesariamente a conceptos semánticos limpios; el perfil por capas muestra zonas de mezcla densa (L32) donde la lectura es poco fiable.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lmxxf/Qwen3.8-27B-ica-lens
- Jacobian Lens complementaria: https://huggingface.co/lmxxf/Qwen3.8-27B-jacobian-lens
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo base en FP8: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Paper del estimador: https://arxiv.org/abs/2606.11722
- Librería `icalens` en PyPI: https://pypi.org/project/icalens/
