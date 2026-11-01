# chromeNLP/openssi-target-based-drug-screening

## Resumen

DrugCLIP (epoch 14) es un checkpoint de fine-tuning publicado por el usuario chromeNLP bajo el identificador `chromeNLP/openssi-target-based-drug-screening`. Se trata de un modelo de cribado virtual basado en dianas (*target-based drug screening*) construido sobre la arquitectura DrugCLIP, que aprende representaciones conjuntas de bolsillos proteicos y moléculas pequeñas para priorizar compuestos candidatos. El checkpoint corresponde a la epoca 14 de un proceso de fine-tuning que se detuvo en la epoca 34 por paciencia 20, seleccionado por BEDROC de desarrollo de 0,4288.

El modelo resuelve el problema del enriquecimiento temprano en cribado virtual: dado un bolsillo proteico, ordenar una biblioteca de compuestos de forma que los activos aparezcan en las primeras posiciones. Con 95.305.418 parametros, es un modelo de tamano moderado, disenable en GPU de consumo, y su relevancia radica en que publica metricas de rescore corregidas y verificables (ROC-AUC, BEDROC y EF al 1 %) sobre DUD-E y LIT-PCBA, algo poco habitual en checkpoints de drug discovery.

La informacion disponible es limitada: no se documentan la arquitectura interna detallada, los datos de preentrenamiento, el contexto de entrada ni los idiomas. La model card se centra en el protocolo de evaluacion y en los resultados numericos, no en la descripcion del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DrugCLIP (detalles internos no disponibles) |
| Parametros totales | 95.305.418 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no linguistico; entrada molecular y de bolsillo) |
| Licencia | other |
| Formato de pesos | `model.pt` (PyTorch; SHA-256 `bb108dcec5608b04eee546a0ed57248ab5f956cb61799a8c5611ab9c8da7c772`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de DrugCLIP mas alla de su nombre y del uso de *element tokens* para atomos del bolsillo. Se sabe que el modelo opera sobre representaciones de bolsillo proteico y ligando, y que la evaluacion emplea un recorte (*crop*) de 511 atomos del bolsillo en el conjunto de test. El *pooling* del autor combina mediana/MAD seguido de maximo para DUD-E, y maximo para LIT-PCBA.

El checkpoint es la epoca 14 de un fine-tuning a escala de paper, seleccionada por BEDROC de desarrollo de 0,4288; el entrenamiento se detuvo en la epoca 34 tras 20 epocas sin mejora. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO u otras tecnicas de alineacion. Tampoco se detalla ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Cribado virtual basado en diana: puntua la compatibilidad entre un bolsillo proteico y compuestos candidatos.
- Ranking de bibliotecas quimicas: produce ordenaciones con enriquecimiento temprano medible (EF al 1 %).
- Representacion de bolsillos a nivel atomico mediante *element tokens*.
- Evaluacion estandarizada sobre DUD-E y LIT-PCBA.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No se documentan capacidades de vision, audio ni modo *thinking*.

## Casos de uso

- Priorizacion de bibliotecas en hit discovery: ordenar una biblioteca de compuestos frente a una diana concreta y seleccionar el top 1 % para ensayo experimental, aprovechando el EF al 1 % reportado.
- Filtrado previo a docking molecular: usar el ranking del modelo como prefiltro barato antes de ejecutar docking o dinamica molecular sobre un subconjunto reducido.
- Reposicionamiento de farmacos: puntuar compuestos ya aprobados frente a nuevas dianas para generar hipotesis de reutilizacion.
- Validacion de dianas en entornos academicos: reproducir las metricas de DUD-E y LIT-PCBA con el protocolo documentado (recorte de 511 atomos, pooling del autor) para comparar pipelines.
- Benchmarking interno de modelos de cribado: emplear el checkpoint como linea base cuantitativa en la evaluacion de alternativas propias.
- Analisis de sensibilidad del enriquecimiento temprano: estudiar como varia EF al 1 % y BEDROC entre dianas y familias proteicas, dado que el modelo publica resultados por benchmark.

## Benchmarks y rendimiento

Resultados publicados en la model card (rescore corregido):

| Benchmark | Dianas | ROC-AUC | BEDROC (80.5) | EF 1 % |
|---|---:|---:|---:|---:|
| DUD-E | 102 | 0,769 | 0,295 | 18,056 |
| LIT-PCBA | 15 | 0,577 | 0,038 | 2,861 |
| Media equal-target | — | — | — | 16,108 |

Valores exactos del rescore: DUD-E ROC-AUC 0,7686053801137084, BEDROC 0,29458757122655027, EF 1 % 18,055988235981932; LIT-PCBA ROC-AUC 0,5774894830416493, BEDROC 0,0381821961785978, EF 1 % 2,861166091212881. El ranking aleatorio corresponde a EF 1. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje, ya que el modelo no es linguistico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; con 95,3 M de parametros, los pesos en FP32 ocupan aproximadamente 0,38 GB, por lo que la inferencia cabe holgadamente en cualquier GPU con al menos 2-4 GB de VRAM (estimacion a partir del numero de parametros, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor; por tamano, cualquier GPU consumer moderna (RTX 3060 o superior) es suficiente.
- Cabe en GPU consumer: si, por el reducido numero de parametros.
- Opciones de despliegue: no se documentan (vLLM, llama.cpp, Ollama o TGI no aplican a este tipo de modelo); el unico artefacto publicado es `model.pt` para PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de otros modelos comparables en la informacion proporcionada. La model card no incluye comparaciones con alternativas de cribado virtual (por ejemplo, otros checkpoints de DrugCLIP u otros modelos de drug discovery), por lo que la comparativa se considera no disponible.

## Limitaciones y advertencias

- La licencia es `other`: no se detallan los terminos, por lo que el uso comercial requiere verificar las condiciones con el autor antes de cualquier despliegue en produccion.
- El rendimiento en LIT-PCBA es marcadamente inferior al de DUD-E (EF 1 % de 2,861 frente a 18,056), lo que sugiere una generalizacion limitada a dianas mas dificiles y biologicamente mas realistas.
- El BEDROC en LIT-PCBA (0,038) esta muy proximo al de un ranking aleatorio, lo que indica escaso enriquecimiento temprano en ese conjunto.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado sobre datos quimicos y estructurales, puede heredar sesgos de composicion de las bases de datos empleadas.
- No se documentan limitaciones de contexto ni de idioma; el modelo no procesa lenguaje natural.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero las puntuaciones no constituyen evidencia experimental y deben validarse in vitro o in silico.
- El checkpoint se selecciono por BEDROC de desarrollo, no por las metricas de test reportadas, por lo que existe riesgo de sobreajuste al criterio de seleccion.
- No se especifican los datos de preentrenamiento ni el protocolo de fine-tuning, lo que dificulta la reproducibilidad completa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chromeNLP/openssi-target-based-drug-screening
- Informe de rescore citado: https://github.com/openssi-dev/ai4sci-tasks/pull/94#issuecomment-6174348916
- Repositorio de tareas AI4Sci: https://github.com/openssi-dev/ai4sci-tasks
