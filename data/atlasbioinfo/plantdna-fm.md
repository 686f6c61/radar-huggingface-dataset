# ATLASBIOINFO/PlantDNA-FM

## Resumen

PlantDNA-FM es un modelo fundacional de ADN especializado en genomas de plantas, desarrollado por ATLASBIOINFO. Se trata de un encoder transformer de estilo ESM que procesa secuencias de nucleótidos a resolución de un solo nucleótido y fue preentrenado con modelado de nucleótidos enmascarados (masked language modelling) sobre secuencias de genomas vegetales. Con 256 millones de parámetros y una ventana de entrada de hasta 16.384 nucleótidos, cubre un nicho poco poblado: los modelos fundacionales de ADN existentes se centran mayoritariamente en genomas humanos o en secuencias genéricas, mientras que este se orienta explícitamente a plantas.

El modelo resuelve dos problemas prácticos. Por un lado, proporciona embeddings por nucleótido (768 dimensiones por posición) y predicciones de nucleótido enmascarado, lo que lo hace utilizable como extractor de características para tareas downstream de genómica vegetal. Por otro, el autor propone usar sus mapas de atención como prior en estudios de asociación genética y fine-mapping, con código específico publicado en un repositorio de GitHub.

Es relevante ahora porque los modelos fundacionales de genómica están pasando de prototipos a herramientas de análisis, y la disponibilidad de un modelo con licencia MIT, pesos en safetensors y compatibilidad con `transformers` facilita su integración en pipelines existentes. No obstante, el modelo es muy reciente (creado en noviembre de 2026), no tiene descargas ni likes registrados y su artículo asociado está en preparación, por lo que la validación independiente es aún inexistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder estilo ESM, 36 capas x 12 cabezas, hidden size 768, rotary position embeddings (RoPE) |
| Parametros totales | 255.766.331 (256 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 nucleotidos (16.386 tokens incluyendo `<cls>` y `<eos>`) |
| Tipos de cuantizacion | no disponible (la model card solo menciona `model.half()` y `torch.autocast` para ahorrar memoria) |
| Idiomas soportados | no disponible (modelo de secuencias biologicas, no de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

PlantDNA-FM es un transformer encoder de estilo ESM con 36 capas, 12 cabezas de atención, dimensión oculta de 768 y embeddings posicionales rotatorios (RoPE). La tokenización es de un token por nucleótido, con un vocabulario reducido a A, C, G, T y N, más los tokens especiales `<cls>` y `<eos>`. El objetivo de preentrenamiento es el modelado de nucleótidos enmascarados, análogo al masked language modelling de BERT pero aplicado a secuencias de ADN.

La model card no detalla el número de tokens de entrenamiento, la composición exacta del corpus de genomas vegetales, ni si hubo fases de ajuste adicionales (RLHF, DPO u otras). Tampoco se documentan innovaciones técnicas más allá del uso de RoPE y de la ventana de 16.384 nucleótidos, que es el aspecto más destacable frente a encoders de ADN con contextos más cortos. El autor menciona que el modelo se usó como prior de atención para association mapping y fine-mapping, con código en un repositorio aparte, lo que sugiere que el entrenamiento se orientó a capturar estructura reguladora y de desequilibrio de ligamiento en poblaciones vegetales.

## Capacidades

- Predicción de nucleótido enmascarado (`fill-mask`) sobre secuencias de ADN de hasta 16.384 nt.
- Generación de embeddings contextuales por nucleótido: una representación de 768 dimensiones por posición, extraíble desde `hidden_states[-1]`.
- Extracción de mapas de atención utilizables como prior en association mapping y fine-mapping (weighted Bonferroni y SuSiE).
- Procesamiento de secuencias largas a resolución de un solo nucleótido, sin tokenización por k-mers.
- Uso como backbone para fine-tuning en tareas downstream de genómica vegetal (clasificación de variantes, predicción de elementos reguladores, etc.), aunque la model card no documenta tareas concretas evaluadas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo biológico de secuencias, no un modelo de lenguaje.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Anotación funcional de variantes en genomas de plantas: el modelo predice el nucleótido esperado en posiciones enmascaradas y genera embeddings por posición, lo que permite puntuar el efecto de variantes naturales comparando la probabilidad del alelo de referencia frente al alternativo. Es adecuado por su resolución de un solo nucleótido y su ventana de 16.384 nt.
- Fine-mapping de loci de rasgos agronómicos: la atención del modelo se usa como prior en weighted Bonferroni y SuSiE, tal como propone el repositorio `PlantDNA-Finemapping`, para priorizar variantes causales en estudios de asociación de poblaciones vegetales.
- Detección de elementos reguladores y motivos: los embeddings por nucleótido pueden alimentar clasificadores ligeros para identificar promotores, enhancers o sitios de unión de factores de transcripción en secuencias vegetales largas.
- Predicción de estructura de secuencia y regiones conservadas: al procesar contextos de hasta 16 kb, el modelo puede capturar dependencias de largo alcance útiles para segmentar regiones codificantes frente a intergénicas.
- Extracción de características para modelos downstream de expresión génica: los embeddings de 768 dimensiones por nucleótido sirven como entrada a modelos de predicción de expresión o de accesibilidad de cromatina, evitando entrenar un encoder desde cero con datos genómicos limitados.
- Investigación comparativa de genomas vegetales: el modelo puede aplicarse a secuencias de distintas especies para estudiar representaciones latentes compartidas, siempre que se valide su comportamiento fuera de las especies del corpus de entrenamiento.
- Filtrado y control de calidad de ensamblados: la perplejidad por posición sobre secuencias enmascaradas puede señalar regiones mal ensambladas o contaminantes en borradores de genoma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de masked language modelling (accuracy o perplejidad), ni evaluaciones en tareas downstream, ni comparaciones con otros modelos de ADN.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en fp16 (256 M parámetros x 2 bytes) más el overhead de activaciones. Con contextos de 16.384 tokens, las activaciones de atención dominan el consumo; se recomienda `model.half()` o `torch.autocast` para reducir memoria.
- GPU recomendadas: cualquier GPU con al menos 8-16 GB de VRAM para secuencias largas en fp16. Una RTX 4090 (24 GB), A100 (40/80 GB) o H100 permiten procesar lotes mayores y secuencias de 16 kb sin problemas.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más para secuencias cortas y en 16-24 GB para la ventana completa de 16.384 nt.
- Opciones de despliegue: `transformers` (>= 5.1) con PyTorch es la vía documentada. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y al ser un encoder de `fill-mask` su encaje en esos servidores de generación no está documentado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PlantDNA-FM | 256 M | 16.384 nt | Plantas | MIT | Hugging Face |
| Nucleotide Transformer | no disponible en la informacion | no disponible en la informacion | Genomica general | no disponible en la informacion | no disponible en la informacion |
| DNABERT-2 | no disponible en la informacion | no disponible en la informacion | Genomica general | no disponible en la informacion | no disponible en la informacion |
| ESM-2 | no disponible en la informacion | no disponible en la informacion | Proteinas | no disponible en la informacion | no disponible en la informacion |

No se dispone de datos verificados de parámetros, contexto ni rendimiento de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Modelo sin validación independiente: cero descargas y cero likes en Hugging Face, y el artículo asociado está "in preparation", por lo que no hay revisión por pares de los resultados.
- Sesgo de dominio: entrenado solo con genomas de plantas; su comportamiento en genomas animales, bacterianos o virales no está documentado y probablemente sea deficiente.
- Riesgo de alucinación en sentido biológico: las predicciones de nucleótido enmascarado pueden ser plausibles pero incorrectas en regiones de baja cobertura o alta variabilidad; no deben usarse como evidencia sin validación experimental.
- Limitación de contexto: secuencias superiores a 16.384 nt requieren truncado o fragmentación, lo que rompe dependencias de largo alcance.
- Idiomas: no aplica; el modelo no procesa lenguaje natural.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del corpus de entrenamiento, que no se detalla en la model card.
- Dependencia de versión: requiere `transformers` >= 5.1, lo que puede complicar la integración en entornos con versiones anteriores fijadas.
- Ausencia de datos de entrenamiento: no se especifican número de tokens, especies incluidas ni composición del corpus, lo que dificulta evaluar la cobertura taxonómica y el riesgo de contaminación con datos de evaluación.
- No es un modelo generativo de texto ni soporta tool calling, por lo que no debe plantearse como sustituto de LLMs en pipelines de agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ATLASBIOINFO/PlantDNA-FM
- Repositorio de fine-mapping: https://github.com/atlasbioinfo/PlantDNA-Finemapping
- Cita: Yu H. *et al.* DNA foundation model priors improve fine-mapping in plant populations (in preparation)
