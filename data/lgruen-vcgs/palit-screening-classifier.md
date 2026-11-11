# lgruen-vcgs/palit-screening-classifier

## Resumen

El palit-screening-classifier es un clasificador binario de texto biomédico desarrollado por el usuario lgruen-vcgs para el proyecto PanelApp Australia Literature Assessment (palit). Su función es determinar si el título y el resumen de un registro de PubMed contienen evidencia sobre una asociación gen-enfermedad relevante para paneles de genes de enfermedades raras. Se trata de la primera etapa del pipeline retrospectivo de palit, donde redujo aproximadamente 15 millones de registros de PubMed de los últimos diez años a unos 500.000, que posteriormente fueron evaluados por un modelo de lenguaje grande.

El modelo se construye sobre el encoder BioClinical-ModernBERT-large, un transformer de arquitectura ModernBERT especializado en texto clínico y biomédico, y le añade una única capa lineal sobre el embedding del primer token para producir un logit que, tras aplicar sigmoid, se interpreta como probabilidad de relevancia. Cuenta con 394.782.721 parámetros totales y procesa entradas de hasta 1.024 tokens.

Su relevancia radica en que ejemplifica el uso de clasificadores ligeros como etapa de filtrado computacionalmente eficiente antes de modelos generativos más costosos, un patrón de diseño cada vez más habitual en pipelines de curación y revisión de literatura científica a gran escala. La licencia MIT y su integración con el repositorio palit facilitan su reutilización y adaptación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT) con cabeza de clasificación lineal binaria |
| Parametros totales | 394.782.721 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens (truncado de título + abstract) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y .pt; no se documentan cuantizaciones) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors, PyTorch (.pt) |
| Modelo base | thomas-sounack/BioClinical-ModernBERT-large |
| Umbral de decisión | 0.5884 |
| Pipeline | text-classification |

## Arquitectura y entrenamiento

El modelo reutiliza el encoder BioClinical-ModernBERT-large, una variante de ModernBERT adaptada a texto biomédico y clínico. Sobre la representación del primer token (hidden state de la posición 0) se aplica una capa lineal que proyecta el vector de dimensión oculta a un único logit; la sigmoid de ese logit produce la probabilidad de que el registro sea relevante. La entrada es la concatenación del título, un espacio y el abstract, truncada a 1.024 tokens.

El entrenamiento se realizó sobre 626.581 registros de PubMed con etiquetas derivadas de la etapa de relevancia por modelo de lenguaje del mismo pipeline: cada abstract fue evaluado tres veces y se consideró relevante si al menos dos evaluaciones coincidían. Solo 4.612 registros (0,74%) resultaron relevantes. Se usó focal loss con gamma 2 y alpha 0,9926 (proporción de negativos), AdamW con learning rate 2e-5, warm-up lineal del 10% de los pasos y decaimiento lineal posterior, batch de 128, precisión mixta bfloat16, cinco épocas y semilla 42, sobre una NVIDIA H100 (aproximadamente dos horas y media por época). Tras cada época se fijó el umbral de decisión en el split de validación al valor más alto que aún alcanzara un recall del 99,5%. Los pesos publicados corresponden a la época 3.

## Capacidades

- Clasificación binaria de registros PubMed (título + abstract) como relevantes o no relevantes para asociaciones gen-enfermedad curadas en paneles de enfermedades raras.
- Puntuación de probabilidad calibrada mediante umbral fijo (0,5884) para decidir el paso al siguiente estadio del pipeline.
- Procesamiento de texto biomédico en inglés con vocabulario y representaciones especializadas del encoder BioClinical-ModernBERT.
- Filtrado de alto recall (99,5% en validación) orientado a minimizar falsos negativos, aceptando baja precisión a cambio.
- Integración directa con el comando `palit screen-pubmed` del repositorio palit (tag `manuscript-v1`).
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio; es exclusivamente un clasificador de texto.

## Casos de uso

- Curación de paneles de genes para enfermedades raras: el clasificador actúa como primer filtro sobre grandes volúmenes de PubMed para descartar registros sin evidencia gen-enfermedad antes de la revisión por modelo de lenguaje o por expertos, reduciendo el coste computacional del pipeline completo.
- Revisión sistemática de literatura a escala: permite procesar decenas de millones de abstracts en pocas horas en una GPU y priorizar los que merecen evaluación completa, útil en equipos de genética clínica que mantienen paneles actualizados.
- Construcción de pipelines de dos etapas con LLM: al eliminar el 98,3% de los registros no relevantes con un recall alto, reduce drásticamente el número de llamadas a modelos generativos costosos en la segunda etapa.
- Investigación en minería de literatura biomédica: sirve como componente reproducible (licencia MIT, pesos abiertos) para experimentos sobre filtrado de evidencia en textos de PubMed.
- Prototipado de clasificadores especializados: al estar construido sobre un encoder abierto, puede servir de punto de partida para fine-tuning en tareas relacionadas de cribado de literatura.
- Docencia y evaluación de metodologías: su model card documenta con detalle el diseño, las métricas y las limitaciones, lo que lo convierte en un ejemplo didáctico de clasificador desbalanceado con focal loss y selección de umbral por recall.

## Benchmarks y rendimiento

Resultados publicados en el split de test (62.659 registros, 462 relevantes) con umbral 0,5884:

| Medida | Valor |
|---|---|
| Registros relevantes conservados | 462 de 462 (recall 100%) |
| Registros no relevantes que pasan el filtro | 1.086 de 62.197 (1,7%) |
| Precisión | 29,8% |
| Proporción de no relevantes eliminados | 98,3% |
| PR-AUC (test) | 0,80 |
| PR-AUC (validación) | 0,79 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 395 millones de parámetros; en fp32 requiere aproximadamente 1,6 GB de pesos, en bf16/fp16 unos 0,8 GB. Con overhead de activaciones y tokenizador, cabe holgadamente en GPUs consumer de 8 GB o más.
- GPU recomendadas: NVIDIA H100 para entrenamiento (documentado); para inferencia, cualquier GPU con al menos 8 GB (RTX 3060, RTX 4060, RTX 4090, A100, etc.). También puede ejecutarse en CPU, aunque con menor throughput.
- Cabe en GPU consumer: sí, en cualquier GPU moderna con 8 GB o más de VRAM.
- Opciones de despliegue: el código de referencia usa PyTorch y `transformers` con `AutoModel` y `AutoTokenizer`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. La integración oficial es mediante el comando `palit screen-pubmed`.
- Latencia y throughput: no se publican cifras de latencia ni throughput de inferencia. El entrenamiento se completó en aproximadamente dos horas y media por época en una H100 con batch 128, lo que da una idea del orden de magnitud del coste de cómputo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| palit-screening-classifier | 394,8 M | 1.024 tokens | Clasificación binaria de relevancia en PubMed | MIT | Hugging Face |
| BioClinical-ModernBERT-large (base) | no disponible en la información | no disponible en la información | Encoder biomédico general | no disponible en la información | Hugging Face |
| BioClinicalBERT (referencia de la familia) | no disponible en la información | no disponible en la información | Encoder clínico general | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que no es posible una comparación cuantitativa.

## Limitaciones y advertencias

- Hereda el juicio del modelo de lenguaje que etiquetó los datos de entrenamiento, incluidos sus errores; el recall mide concordancia con ese modelo, no con curación experta.
- Entrenado solo con títulos y abstracts en inglés; un registro sin abstract se puntúa únicamente con el título, lo que degrada la fiabilidad.
- El checkpoint (época 3) se eligió con el split de test a la vista, por lo que los resultados de test son algo optimistas.
- El test contiene 462 registros relevantes; no fallar ninguno es compatible con una tasa real de fallo de hasta aproximadamente el 0,6% (cota superior del 95%).
- Precisión baja (29,8%): genera muchos falsos positivos, aceptables solo porque una etapa posterior los elimina; no debe usarse como decisión de curación.
- No es una herramienta diagnóstica, no procesa datos de pacientes y una puntuación positiva no constituye una decisión de curación.
- Licencia MIT: permite uso comercial y modificación, pero conviene revisar las condiciones del modelo base BioClinical-ModernBERT-large, cuyos términos no se detallan en la información disponible.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas en abstracts ambiguos o con vocabulario fuera de distribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lgruen-vcgs/palit-screening-classifier
- Modelo base BioClinical-ModernBERT-large: https://huggingface.co/thomas-sounack/BioClinical-ModernBERT-large
- Repositorio palit: https://github.com/populationgenomics/palit
