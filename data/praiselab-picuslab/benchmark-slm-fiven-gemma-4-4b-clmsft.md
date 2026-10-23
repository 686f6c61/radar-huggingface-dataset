# praiselab-picuslab/benchmark-slm-fiven-gemma-4-4b-clmsft

## Resumen

`benchmark-slm-fiven-gemma-4-4b-clmsft` es un adaptador LoRA (PEFT) entrenado por el grupo de investigación PRAISELab-PicusLab, del PICUS Lab de la Universidad de Nápoles Federico II (Italia), sobre el modelo base `google/gemma-4-E4B-it`. El adaptador aplica una estrategia de fine-tuning supervisado para modelado causal del lenguaje (etiqueta `strategy-clmsft`) sobre el dataset `fiven`, con especialización en italiano.

El modelo forma parte de la colección `benchmark-slm`, una iniciativa del grupo para evaluar de forma sistemática modelos de lenguaje pequeños (SLM) combinando distintos modelos base, datasets y estrategias de entrenamiento. Su valor principal es comparativo: permite medir el impacto del fine-tuning de Gemma 4 E4B en tareas conversacionales en italiano frente a otras combinaciones de la misma serie.

Se trata de un artefacto muy reciente (creado en octubre de 2026), con acceso restringido (gated) en HuggingFace y sin documentación pública detallada todavía: no constan benchmarks propios, licencia explícita ni métricas de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el transformer `google/gemma-4-E4B-it` |
| Parámetros totales | no disponible (el repositorio del adaptador ocupa 0,1 GB; la designación E4B del modelo base sugiere ~4B de parámetros efectivos, pero la cifra exacta no consta) |
| Parámetros activos | no disponible (no se indica si el modelo base es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (adaptador en safetensors sin cuantización indicada; dependerá del modelo base) |
| Idiomas soportados | Italiano (it) |
| Licencia | no disponible (acceso gated: requiere aceptar condiciones en HuggingFace) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

No es un modelo completo, sino un adaptador LoRA: en lugar de reentrenar todos los pesos de Gemma 4 E4B-it, se entrenan matrices de bajo rango añadidas a capas del modelo base, lo que explica el tamaño reducido del repositorio (0,1 GB). La etiqueta `strategy-clmsft` indica que el entrenamiento empleó supervised fine-tuning con modelado causal del lenguaje (CLM-SFT), el enfoque estándar para adaptar modelos base a la generación conversacional siguiendo instrucciones.

No hay información pública sobre la composición del dataset `fiven` (tamaño, número de tokens, origen de los datos ni dominios cubiertos), ni sobre si se aplicaron etapas posteriores de alineación como RLHF o DPO; todo apunta a que se trata únicamente de SFT. Respecto al modelo base, la familia Gemma 4 incluye capacidades de visión, audio y contexto largo según fuentes de terceros, pero las especificaciones concretas de la variante E4B (tokens de preentrenamiento, longitud de contexto, detalles de arquitectura) no constan en la información disponible.

## Capacidades

- Generación de texto conversacional en italiano, especializada mediante CLM-SFT sobre el dataset `fiven`.
- Hereda las capacidades generales del modelo base Gemma 4 E4B-it (seguimiento de instrucciones, razonamiento general), aunque sin evaluación publicada del adaptador.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-step: no documentado.
- Capacidades multilingües: el fine-tuning está orientado al italiano; el comportamiento en español u otros idiomas no está documentado y no debe asumirse.
- Multimodalidad: la familia Gemma 4 incorpora visión y audio según fuentes externas, pero no consta que este adaptador las preserve ni las mejore.

## Casos de uso

- **Asistentes conversacionales en italiano**: el fine-tuning CLM-SFT sobre datos conversacionales lo orienta a chatbots multi-turno en italiano, aprovechando la eficiencia de un modelo pequeño.
- **Benchmarking de SLMs**: al formar parte de la colección `benchmark-slm`, es útil para comparar de forma controlada el efecto del dataset `fiven` y de la estrategia `clmsft` frente a otras combinaciones (por ejemplo, la variante basada en Gemma 2 2B del mismo grupo).
- **Generación y resumen de contenido en italiano**: redacción de textos, resúmenes y postprocesado documental en italiano con coste computacional reducido.
- **Despliegue en entornos con recursos limitados**: al ser un adaptador sobre un modelo de escala ~4B, puede ejecutarse en GPUs de consumo, adecuado para prototipos on-premise o edge.
- **Base para fine-tunings adicionales**: punto de partida para adaptaciones posteriores a dominios concretos (salud, atención al cliente) en italiano, encadenando adaptadores PEFT.
- **Docencia e investigación en PEFT**: caso de estudio real y reproducible de LoRA sobre un modelo abierto de Google, útil en cursos de NLP y laboratorios académicos.
- **Prototipado rápido de productos en italiano**: integración en aplicaciones mediante `transformers` + `peft` para validar casos de uso antes de invertir en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo pertenece a una iniciativa de benchmarking (`benchmark-slm`), pero no se han facilitado puntuaciones del adaptador en MMLU, HumanEval, GSM8K ni en ninguna otra prueba. Existen resultados de terceros para la familia Gemma 4 (MMLU Pro, GPQA Diamond, LiveCodeBench, entre otros) en la página de referencia indicada en los enlaces, pero no aplican específicamente a este adaptador y no se reproducen aquí por falta de datos concretos.

## Requisitos de hardware

- **VRAM del adaptador**: ~0,1 GB; el overhead del LoRA en inferencia es despreciable frente al modelo base.
- **VRAM estimada del conjunto (base ~4B + adaptador)**: estimación orientativa, no dato oficial: BF16/FP16 ~8-10 GB; INT8 ~5-6 GB; 4-bit ~3-4 GB, más la memoria de KV cache según la longitud de contexto.
- **GPUs de consumo**: debería caber en una RTX 3060 de 12 GB (cuantizado o en BF16 con contexto corto), RTX 4060 Ti 16 GB o RTX 4090 sin problemas.
- **GPUs de datacenter**: A100 o H100 son sobredimensionadas para este tamaño, pero válidas para serving concurrente con vLLM.
- **Despliegue**: carga directa con `transformers` + `peft`; vLLM y TGI soportan servir adaptadores LoRA sobre el modelo base; para llama.cpp u Ollama es necesario fusionar primero el adaptador con el modelo base y convertir a GGUF.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Base | Estrategia | Idioma | Tamaño repo | Licencia |
|---|---|---|---|---|---|
| `benchmark-slm-fiven-gemma-4-4b-clmsft` (este) | Gemma 4 E4B-it | clmsft | it | 0,1 GB | no disponible |
| `benchmark-slm-fiven-gemma-2-2b-clmsft` | Gemma 2 2B | clmsft | it | no disponible | no disponible |
| `google/gemma-4-E4B-it` (modelo base) | — | instruction-tuning de fábrica | no disponible | no disponible | no disponible |

La variante con Gemma 2 2B es el comparador más directo: mismo dataset y estrategia, pero un modelo base anterior y más pequeño, lo que permite aislar la contribución del modelo base. Frente al modelo base sin adaptar, este repositorio aporta especialización en italiano conversacional, aunque sin métricas publicadas que cuantifiquen la mejora.

## Limitaciones y advertencias

- **No es autónomo**: al ser un adaptador LoRA, requiere descargar y ejecutar el modelo base `google/gemma-4-E4B-it`; no funciona de forma independiente.
- **Licencia indefinida**: el repositorio no declara licencia y el acceso es gated; antes de cualquier uso comercial hay que verificar tanto las condiciones del adaptador como los términos de uso de Gemma de Google.
- **Especialización en italiano**: el rendimiento en español u otros idiomas no está documentado; no se recomienda su uso fuera del italiano sin evaluación previa.
- **Sin validación pública**: 0 descargas, 0 likes y ausencia de benchmarks propios; la calidad real del fine-tuning es desconocida.
- **Dataset opaco**: no hay documentación sobre `fiven`, por lo que no es posible auditar sesgos, calidad de los datos ni riesgos de contaminación de benchmarks.
- **Alucinaciones**: como todo LLM generativo, puede producir contenido falso con apariencia plausible; en producción conviene combinarlo con verificación de hechos o RAG.
- **Etiquetas sin documentar**: el significado de algunas etiquetas del repositorio (por ejemplo, `or2`) no consta en la información disponible.
- **Reciente**: creado en octubre de 2026, posible falta de madurez y de soporte comunitario.

## Enlaces

- Ficha del modelo: https://huggingface.co/praiselab-picuslab/benchmark-slm-fiven-gemma-4-4b-clmsft
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Organización en HuggingFace: https://huggingface.co/praiselab-picuslab
- Datasets de la organización: https://huggingface.co/praiselab-picuslab/datasets
- Colección benchmark-slm: https://huggingface.co/models?other=benchmark-slm
- GitHub de PRAISELab-PicusLab: https://github.com/PRAISELab-PicusLab
- Benchmarks de la familia Gemma 4 (fuente de terceros): https://gemmai4.com/benchmark/
- Comparador general de benchmarks de LLMs: https://benchlm.ai/
