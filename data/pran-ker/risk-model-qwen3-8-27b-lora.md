# Pran-Ker/risk-model-qwen3.8-27b-lora

## Resumen

El modelo `Pran-Ker/risk-model-qwen3.8-27b-lora` es un adaptador LoRA sobre el modelo base Qwen3.8-27B, desarrollado por el usuario Pran-Ker bajo la organizacion safewaterline. No se trata de un modelo de proposito general, sino de un modelo especializado en una unica tarea: estimar la probabilidad de que un prestatario cotizado en EE. UU. presente una solicitud de quiebra o concurso de acreedores (8-K, Item 1.03) en los 365 dias siguientes a la presentacion de un formulario 10-Q. La innovacion central no esta en el modelo base, sino en el procedimiento de entrenamiento: la probabilidad se lee directamente del logit de un unico token de respuesta (`choice#Y` frente a `choice#N`), y el adaptador se entrena minimizando el Brier score del resultado observado, en lugar de mediante instrucciones en lenguaje natural o RLHF.

El modelo base Qwen3.8-27B, segun la informacion de busqueda disponible, es un modelo vision-lenguaje de 27 000 millones de parametros de Qwen, con atencion hibrida (lineal y completa en intervalo 4:1) y una longitud de contexto de 262 000 tokens. El adaptador se entrena sobre un corpus de 11 109 preguntas fechadas extraidas de EDGAR (formularios 10-Q de 638 prestatarios con lineas de credito basadas en activos, entre 2018 y septiembre de 2025), de las cuales 220 (el 2,0 %) tienen etiqueta positiva de quiebra. El conjunto de validacion son 1702 formularios no vistos cuyas ventanas de prediccion se cierran despues del final del conjunto de entrenamiento.

La relevancia del modelo es metodologica: demuestra que un modelo de lenguaje puede convertirse en un predictor probabilistico calibrado y evaluable cuando la senal de entrenamiento es exactamente la metrica con la que se evaluara (Brier score, ECE, AUC), y cuando la etiqueta la escribe un tercero con su propia marca temporal (el regulador, via EDGAR). El entrenamiento se detuvo en el paso 229 de 265 por agotamiento de creditos de Tinker, por lo que las cifras publicadas corresponden a la evaluacion del paso 130.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atencion hibrida lineal/completa (intervalo 4:1) en el modelo base Qwen3.8-27B; adaptador LoRA sobre la cabeza de lenguaje |
| Parametros totales | 27 000 millones (modelo base); el adaptador LoRA no especifica su numero de parametros |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 262 144 tokens en el modelo base; el prompt de entrenamiento usa los primeros 10 000 caracteres (~4 200 tokens) del dossier, que se recorta a 48 000 caracteres |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los documentos de entrenamiento son formularios 10-Q en ingles) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene un adaptador LoRA; el formato concreto de los ficheros no se especifica) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.8-27B, un transformer decoder-only de 27 000 millones de parametros con un esquema de atencion hibrida que alterna atencion lineal y atencion completa en una proporcion 4:1, lo que permite sostener una ventana de 262 000 tokens con coste cuadratico reducido. El entrenamiento del adaptador no modifica los pesos base: se entrena un LoRA con una funcion de perdida personalizada sobre una unica posicion de respuesta.

El procedimiento es el del "modelo de decision" del recetario de Tinker: el prompt termina en un formato de respuesta fijo cuyas variantes comparten todos los tokens salvo el ultimo (`choice#Y` frente a `choice#N`), de modo que la probabilidad de quiebra es el softmax sobre esos dos tokens en la posicion de respuesta. Se realiza un unico forward pass por pregunta, sin muestreo, y la probabilidad resultante es diferenciable. La perdida es el Brier score sobre la etiqueta binaria: `((choice_probs - target_probs) ** 2).sum()`, aplicada mediante `forward_backward_custom` de Tinker. Los datos de entrenamiento son 11 109 preguntas construidas a partir de formularios 10-Q presentados entre 2018 y septiembre de 2025 por 638 prestatarios con facilidades de credito basadas en activos, excluyendo los sectores SIC 283x (biofarmaceuticas) y SIC 60-67 (entidades financieras, fondos y REIT). El dossier de cada pregunta toma el 10-Q tal como se presento originalmente, extrae las secciones de discusion de la direccion, liquidez, deuda y covenants, anonimiza el nombre y el ticker como "the Company" y limita el texto a 48 000 caracteres. La etiqueta positiva es la presentacion de un 8-K con Item 1.03 en los 365 dias siguientes a la fecha del 10-Q; se excluyen prestatarios que ya habian quebrado en los 730 dias anteriores y se descarta deliberadamente el Item 2.04 (activacion de una obligacion financiera directa), que puede dispararse por eventos positivos como una fusion.

## Capacidades

- Prediccion probabilistica de quiebra a 365 dias para prestatarios cotizados con lineas de credito basadas en activos, calibrada mediante Brier score.
- Lectura y comprension de secciones financieras de formularios 10-Q (discusion de la direccion, liquidez, deuda, covenants) en ingles.
- Salida de probabilidad calibrada en un unico forward pass, sin muestreo ni generacion de texto libre, lo que la hace apta para scoring por lotes.
- Evaluacion de calibracion mediante expected calibration error (ECE) y discriminacion mediante AUC.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni modo de pensamiento para este adaptador concreto, aunque el modelo base Qwen3.8-27B es vision-lenguaje.
- Capacidades multilingues: no disponibles para el adaptador; el corpus de entrenamiento es exclusivamente en ingles.

## Casos de uso

- Originacion de credito basado en activos: el modelo puntua cada 10-Q trimestral de un prestatario y produce una probabilidad de impago por quiebra a 12 meses, que el comite de credito puede usar como senal adicional junto al analisis humano; su calibracion medida (ECE 0,023 en el conjunto de validacion) lo hace adecuado para umbrales operativos.
- Monitorizacion de cartera en vigilancia: al ejecutarse en un unico forward pass por documento, permite re-puntuar trimestralmente toda la cartera de prestatarios (638 en el corpus original) con coste de inferencia bajo y sin generacion autoregresiva.
- Clasificacion y priorizacion de expedientes: ordenar los prestatarios por probabilidad y concentrar la revision manual en el 5 % mas riesgoso, que en la evaluacion concentro 12 de las 36 quiebras del conjunto de prueba frente a 5 en el modelo base.
- Auditoria y backtesting de modelos de credito: al disponer de preguntas fechadas y etiquetas con marca temporal propia, el adaptador sirve como referencia para comparar contra modelos internos con las mismas metricas (Brier, ECE, AUC).
- Investigacion en pronostico supervisado por resultados: el adaptador y el script de entrenamiento son un ejemplo reproducible de entrenamiento con la metrica de evaluacion como perdida, reutilizable en otros dominios con etiquetas fechadas por terceros (por ejemplo, eventos clinicos o regulatorios).
- Filtro previo en procesos de suscripcion de deuda: descartar o marcar para revision los emisores cuyo 10-Q arroja probabilidad por encima de un umbral calibrado, reduciendo el volumen de analisis manual en carteras grandes.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 1 702 formularios de validacion con ventanas cerradas despues del final del entrenamiento (evaluacion en el paso 130):

| Metrica | Modelo base | Adaptador LoRA | Constante de tasa base |
|---|---|---|---|
| Brier score | 0,0483 | 0,0267 | 0,0207 |
| Expected calibration error (ECE) | 0,088 | 0,023 | no disponible |
| AUC | 0,82 | 0,86 | no disponible |
| Quiebras en el 5 % mas riesgoso | 5 de 36 | 12 de 36 | no disponible |

El modelo sin reescalado sigue por encima de la constante de tasa base (0,0207) porque sobreestima sistematicamente; un reescalado de un solo parametro ajustado sobre la mitad del conjunto de prueba supera la constante en la otra mitad. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia orientativa, un modelo de 27 000 millones de parametros en precision de 16 bits requiere aproximadamente 54 GB solo para pesos, a los que hay que sumar cache KV para prompts de ~4 200 tokens; en cuantizacion de 8 bits el peso baja a ~27 GB y en 4 bits a ~14 GB, pero no se confirman formatos de cuantizacion soportados para este adaptador.
- GPU recomendadas: no disponibles de forma especifica. Para el modelo base de 27B en 16 bits se requieren GPU con 80 GB (A100, H100) o configuraciones multi-GPU; en cuantizaciones bajas podria caber en RTX 4090 (24 GB) o RTX 3090, sin confirmacion por parte del autor.
- Cabe en GPU de consumo: no confirmado; depende de la cuantizacion, no documentada.
- Opciones de despliegue: no disponibles. El adaptador se entreno con la infraestructura Tinker y el recetario de Thinking Machines Lab; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La arquitectura de decision requiere un unico forward pass por pregunta, lo que en principio reduce el coste frente a la generacion autoregresiva, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pran-Ker/risk-model-qwen3.8-27b-lora | 27B (base) + LoRA | 262K (base) | Prediccion de quiebra calibrada por Brier score | no disponible | Hugging Face, 0 descargas |
| Qwen3.8-27B (base) | 27B | 262K | Vision-lenguaje de proposito general | no disponible en la informacion | Fireworks AI, Hugging Face |
| AMAImedia/Qwen3.8-27B-LoRA | 27B (base) + LoRA | no disponible | Adaptador LoRA generico sobre el mismo base | no disponible | Hugging Face |

La comparacion con modelos de la misma categoria funcional (predictores de riesgo de credito) no esta disponible en la informacion proporcionada. Frente al modelo base, el adaptador mejora Brier (0,0483 a 0,0267), ECE (0,088 a 0,023) y AUC (0,82 a 0,86) en la tarea especifica, a costa de especializarse y perder capacidades generales.

## Limitaciones y advertencias

- El modelo sobreestima el riesgo de forma sistematica: su Brier score sin reescalado (0,0267) es peor que la constante de tasa base (0,0207), y solo un reescalado de un parametro ajustado sobre parte del conjunto de prueba lo supera; ese reescalado debe reajustarse para cada cartera y periodo.
- El entrenamiento se detuvo en el paso 229 de 265 por falta de creditos de Tinker; las cifras publicadas corresponden a la evaluacion del paso 130, no al modelo final.
- El corpus es pequeno y desbalanceado: 220 positivos sobre 11 109 preguntas (2,0 %) y 81 quiebras en total, lo que limita la estabilidad de las estimaciones de calibracion en subpoblaciones.
- El prompt de entrenamiento usa solo los primeros 10 000 caracteres (~4 200 tokens) del dossier, muy por debajo de la ventana de 262 000 tokens del modelo base; informacion relevante situada mas adelante en el 10-Q puede quedar fuera.
- El modelo esta entrenado exclusivamente sobre formularios 10-Q en ingles de emisores estadounidenses con facilidades de credito basadas en activos; no se ha validado en otros idiomas, jurisdicciones ni tipos de deuda.
- La etiqueta solo captura quiebras o concursos declarados mediante 8-K Item 1.03; impagos, reestructuraciones extrajudiciales o incumplimientos de covenants no se detectan.
- Riesgo de alucinacion y de falso positivo en empresas con lenguaje de going-concern atipico; el autor excluyo sectores completos (SIC 283x y SIC 60-67) precisamente por este motivo, y el modelo puede comportarse mal fuera de ese universo.
- Licencia no disponible: no se puede confirmar el uso comercial del adaptador ni del modelo base; verificar antes de cualquier despliegue en produccion.
- El modelo no debe usarse como unico criterio en decisiones de credito; esta pensado como senal adicional puntuable y auditable.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Pran-Ker/risk-model-qwen3.8-27b-lora
- Modelo base en Fireworks AI: https://fireworks.ai/models/fireworks/qwen3p8-27b
- Adaptador LoRA alternativo sobre el mismo base: https://huggingface.co/AMAImedia/Qwen3.8-27B-LoRA
- Paper SEC risk questions: https://arxiv.org/abs/2601.19189
- Paper clinical events: https://arxiv.org/abs/2605.12817
- Paper Future-as-Label: https://arxiv.org/abs/2601.06336
- Recetario de forecasting de Tinker: https://github.com/thinking-machines-lab/tinker-cookbook/tree/main/tinker_cookbook/recipes/forecasting
- Recetario de decisiones de Tinker: https://github.com/thinking-machines-lab/tinker-cookbook/tree/main/tinker_cookbook/recipes/decisions
- Busqueda a texto completo de EDGAR: https://efts.sec.gov/LATEST/search-index?q=%22asset-based%22%20%22revolving%20credit%20facility%22&forms=10-K,10-Q
- API de presentaciones de EDGAR: https://www.sec.gov/search-filings/edgar-application-programming-interfaces
