# flaviussteff/spp-ro-filtered

## Resumen

`spp-ro-filtered` es un modelo de lenguaje causal monolingüe en rumano, entrenado desde cero por Flavius-Ștefan Hăbeanu como parte de su tesis de licenciatura en la Facultad de Matemáticas y Ciencias de la Computación de la Universidad de Bucarest (2026). Forma parte de la familia **SPP-Ro**, una replicación computacionalmente equivalente en rumano del trabajo de Minder et al., *Synthetic Persona Pretraining* (EPFL-dlab, arXiv:2608.13482), que compara tres estrategias de preentrenamiento (Vanilla, Filtered y SPP) sobre exactamente el mismo flujo de documentos.

Este checkpoint concreto es la **línea base Filtered**: los mismos documentos que el modelo de referencia, pero los 75.000 documentos marcados por un clasificador de seguridad permanecen en el contexto y se eliminan únicamente de la función de pérdida. El objetivo del experimento es medir el coste de alineación (*alignment tax*) de este enfoque frente a SPP, que según los autores no incurre en pérdida de perplejidad.

Arquitectura transformer tipo Llama de 88,1 millones de parámetros, 12 capas, GQA con 12 cabezas de consulta y 4 de clave-valor, contexto de 1.024 tokens y vocabulario de 16.384 tokens BPE a nivel de byte. Es un modelo de investigación, no un producto: preentrenamiento puro, sin instrucción ni post-entrenamiento, y el propio autor lo declara no apto para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama (12 capas, GQA 12 query / 4 KV heads, SwiGLU) |
| Parametros totales | 88.099.584 (~88,1 M), embeddings atados |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens (RoPE theta 10.000) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor recomienda fp32 para inferencia) |
| Idiomas soportados | Rumano (ro) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension oculta / intermedia | 768 / 2.048 |
| Vocabulario | 16.384 tokens BPE a nivel de byte, con token especial `<assistant>` |
| Tamano del repositorio | 0,4 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 12 capas con normalización pre-LN, activación SwiGLU en la capa feed-forward (768 → 2.048 → 768) y atención con grupos de consulta (GQA) de 12 cabezas de consulta y 4 de clave-valor. Los embeddings de entrada y salida están atados. La posición se codifica con RoPE de theta 10.000 y el contexto máximo es de 1.024 tokens.

El entrenamiento se realizó desde cero sobre 1,5 millones de documentos en rumano procedentes de FineWeb-2 RO, Wikipedia RO y prensa, leídos en un orden fijado por semilla idéntico para todos los modelos de la familia. Se ejecutaron 50.000 pasos con LR pico de 1,5e-4, 500 pasos de calentamiento, decaimiento coseno a cero y weight decay de 0,1; cada paso procesa 64 ventanas empaquetadas de 1.024 posiciones (documentos terminados en EOS empaquetados first-fit, atención en bloque diagonal, posiciones por documento y 2,4 % de padding). En total, aproximadamente 3.280 millones de tokens en unas 66 horas sobre una única NVIDIA RTX 3060 de 12 GB, con autocast bf16 y pesos maestros en fp32.

La particularidad de este checkpoint es que 150.000 documentos (10 %) tienen una reflexión en el sidecar: los 75.000 mejor puntuados por un clasificador de seguridad y 75.000 benignos, con una media de 36 tokens por reflexión (~0,67 % de los tokens entrenados). En la variante Filtered, los documentos marcados siguen presentes en el contexto pero se enmascaran en la pérdida. No hay RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generación de texto causal en rumano: continuación de documentos, párrafos y frases a partir de un prompt.
- Modelado de lenguaje y puntuación de perplejidad sobre texto rumano (web, Wikipedia, prensa).
- Razonamiento de cloze de cuatro opciones: 88,5 % de acierto en el conjunto de evaluación del autor.
- Capacidad multilingüe: ninguna; el vocabulario y los datos son exclusivamente rumanos.
- Tool calling / function calling: no soportado (no hay post-entrenamiento ni formato de herramientas).
- Agentes y razonamiento multi-paso: no soportado.
- Modo thinking, visión o audio: no disponibles.
- Token especial `<assistant>` disponible en el vocabulario, aunque sin ajuste específico para diálogo.

## Casos de uso

- Investigación sobre alineación a pequeña escala: reproducir el experimento de *alignment tax* comparando este checkpoint con `spp-ro-base` y el modelo SPP sobre el mismo flujo de datos, con métricas de perplejidad por subconjunto (marcados y no marcados por el clasificador).
- Evaluación de clasificadores de seguridad en rumano: usar la perplejidad del modelo sobre documentos marcados (27,29) frente a no marcados (17,81) como señal auxiliar para calibrar o auditar clasificadores de contenido.
- Punto de partida para *continued pretraining* en rumano: al ser un modelo pequeño con licencia MIT y pesos safetensors, sirve como inicialización barata para dominios específicos (legal, médico, administrativo) con presupuesto de una sola GPU consumer.
- Experimentos de tokenización rumana: su vocabulario BPE de 16.384 tokens permite estudiar la eficiencia de compresión en rumano frente a tokenizadores multilingües de mayor tamaño.
- Docencia y prácticas de entrenamiento desde cero: el repositorio documenta el pipeline completo (empaquetado first-fit, atención en bloque diagonal, bf16 con pesos maestros fp32) reproducible en una RTX 3060.
- Generación de texto sintético de dominio público en rumano para aumentación de datos de modelos mayores, con la advertencia de que la calidad es la de un modelo de 88 M.
- Análisis de sesgos en corpus web rumanos: estudiar qué reproduce un modelo pequeño entrenado sobre FineWeb-2 RO y prensa rumana.

## Benchmarks y rendimiento

| Metrica | Valor | Referencia (spp-ro-base) |
|---|---|---|
| Perplejidad, web held-out (1.000 docs) | 18,48 | +0,06 |
| Perplejidad, docs marcados por el clasificador (199 docs) | 27,29 | +1,13 |
| Perplejidad, docs no marcados (1.000 docs) | 17,81 | no disponible |
| Cloze de 4 opciones, held-out (1.000 items) | 88,5 % | no disponible |
| ConstitutionEval-Ro, letra, 4 rotaciones (azar 25 %), 600 items | 24,0 % | no disponible |
| ConstitutionEval-Ro, PMI (azar 25 %), 600 items | 35,2 % | no disponible |
| ConstitutionEval-Ro, continuación (azar 25 %), 600 items | 20,7 % | no disponible |
| ConstitutionEval-Ro, oro vs. cada distractor (azar 50 %), 600 items | 44,4 % | no disponible |

El resultado central del autor: los cinco modelos de la familia están a nivel de azar en ConstitutionEval-Ro, de modo que a esta escala no se puede demostrar un efecto de alineación. Lo medible es el coste: la variante Filtered pierde conocimiento exactamente en los documentos marcados por el clasificador (+1,13 de perplejidad, peor en el 85 % de ellos, test de signos pareado p ≈ 1e-24), mientras que SPP no incurre en ese coste.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,35 GB en fp32 (88,1 M de parámetros × 4 bytes), ~0,18 GB en bf16/fp16 y ~0,09 GB en int8. El repositorio ocupa 0,4 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; el autor entrenó en una NVIDIA RTX 3060 de 12 GB. Para inferencia bastan GTX 1650, RTX 3050, RTX 4060, A100, H100 o incluso CPU.
- Cabe holgadamente en cualquier GPU consumer actual, incluidas las integradas con memoria compartida.
- Opciones de despliegue: `transformers` (referencia del autor, con `dtype=torch.float32`), y en principio llama.cpp/Ollama si se convierte a GGUF, aunque no se publican pesos GGUF en el repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| `spp-ro-filtered` (este) | 88,1 M | 1.024 | Rumano | MIT | Baseline Filtered del experimento SPP-Ro |
| `spp-ro-base` | 88,1 M (misma arquitectura) | 1.024 | Rumano | MIT | Baseline Vanilla de referencia del mismo estudio |
| Modelo SPP de la familia SPP-Ro | 88,1 M (misma arquitectura) | 1.024 | Rumano | MIT (presumible, no confirmado) | Variante con *Synthetic Persona Pretraining*; resultados en el repositorio |
| Modelos rumanos de mayor tamano (p. ej. OpenLLM-Ro) | no disponible en esta busqueda | no disponible | Rumano | no disponible | No se dispone de datos verificados para comparar en esta ficha |

La comparación relevante es interna a la familia SPP-Ro, ya que los tres checkpoints comparten arquitectura, datos y semilla, lo que permite atribuir diferencias exclusivamente a la estrategia de alineación.

## Limitaciones y advertencias

- Modelo pequeño (88 M) y monolingüe en rumano; no generaliza a otros idiomas.
- Solo preentrenamiento: no hay ajuste por instrucciones, RLHF ni DPO, por lo que no sigue instrucciones de forma fiable.
- Contexto muy corto (1.024 tokens), insuficiente para tareas de documento largo o conversaciones multi-turno extensas.
- Entrenado sobre texto web (FineWeb-2 RO, Wikipedia, prensa): reproduce los sesgos de esos datos, incluidos los de los documentos marcados por el clasificador de seguridad, que aquí permanecen en el contexto.
- Riesgo de alucinación y de generar contenido factualmente incorrecto o inapropiado; el autor lo declara explícitamente no apto para producción.
- Resultado de una sola semilla; los autores advierten que no se pueden extraer conclusiones robustas de efectos de alineación a esta escala.
- Licencia MIT: permite uso comercial y modificación con atribución, pero la calidad del modelo hace inviable su uso comercial directo.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ) en el repositorio; habría que generarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/flaviussteff/spp-ro-filtered
- Modelo de referencia: https://huggingface.co/flaviussteff/spp-ro-base
- Repositorio del proyecto SPP-Ro: https://github.com/flaviussteff/spp-ro
- Paper de referencia (Synthetic Persona Pretraining, EPFL-dlab): arXiv:2608.13482
- Evaluaciones, predicciones por ítem y tablas LaTeX: carpeta `evals/` del repositorio de GitHub
