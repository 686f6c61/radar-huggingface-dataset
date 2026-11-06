# Addaoud/DeepPlant-AT-EAP

## Resumen

DeepPlant-AT-EAP es un modelo de deep learning orientado a genomica regulatoria de plantas, publicado en Hugging Face por el usuario Addaoud bajo licencia MIT. A diferencia de los modelos de lenguaje generativos, se trata de un modelo de dominio especifico (bioinformatica) cuyo pipeline declarado es "other", lo que indica que no esta pensado para generacion de texto sino para tareas predictivas sobre secuencias genomicas, presumiblemente relacionadas con elementos regulatorios (el sufijo "AT-EAP" sugiere ATAC-seq / enhancer-associated predictions, aunque la model card no lo confirma).

El modelo cuenta con aproximadamente 236,9 millones de parametros almacenados en formato safetensors, con un repositorio de 0,9 GB. Se distribuye mediante la integracion PyTorchModelHubMixin de Hugging Face Hub, lo que permite cargarlo directamente con la libreria `huggingface_hub` sin necesidad de definir la arquitectura manualmente en el codigo de usuario.

La relevancia de este modelo radica en su aplicacion a la genomica funcional de plantas: la prediccion de regiones regulatorias y elementos asociados a accesibilidad de cromatina es un problema clave en biologia vegetal, con impacto en mejora genetica y biotecnologia agricola. Sin embargo, la informacion publica disponible es muy limitada: no hay paper asociado, no se documentan datos de entrenamiento, benchmarks ni idiomas, por lo que esta ficha refleja exclusivamente lo verificable en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de dominio genomico; pesos en safetensors) |
| Parametros totales | 236.879.362 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no linguistico; opera sobre secuencias genomicas) |
| Licencia | MIT |
| Formato de pesos | safetensors (via PyTorchModelHubMixin) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo en la model card. El unico dato estructural verificable es el numero de parametros (236,9 M) y el uso de `PyTorchModelHubMixin`, lo que implica que el modelo se serializa como un `torch.nn.Module` con pesos en safetensors y metadatos de configuracion gestionados por Hugging Face Hub. El tamano es coherente con arquitecturas tipo transformer o CNN profunda aplicadas a secuencias biologicas, pero no se puede confirmar el tipo exacto.

Tampoco se documentan los datos de entrenamiento (numero de tokens o pares de secuencias, composicion del dataset, especies vegetales incluidas), ni si hubo fases de ajuste fino supervisado o aprendizaje por refuerzo. La model card referencia un enlace de codigo placeholder (`https://huggingface.co/your-username/deepplant`) y marca como "More Information Needed" tanto el paper como la documentacion, por lo que cualquier detalle sobre el pipeline de entrenamiento debe considerarse no disponible.

## Capacidades

- Prediccion sobre secuencias genomicas de plantas en tareas de genomica regulatoria (segun los tags `plant-genomics` y `regulatory-genomics`).
- Integracion nativa con Hugging Face Hub mediante `PyTorchModelHubMixin`, lo que facilita la carga del modelo en pipelines de PyTorch.
- Inferencia como modulo `torch.nn.Module` (no como modelo generativo de texto).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues, de vision, audio ni modos de razonamiento extendido.
- El significado exacto de "AT-EAP" no se especifica en la model card; no se debe asumir una tarea concreta sin consultar el codigo del autor.

## Casos de uso

- Prediccion de elementos regulatorios en genomas vegetales: el modelo puede emplearse para puntuar regiones genomicas candidatas en estudios de regulacion transcripcional, apoyando la priorizacion de experimentos de validacion (p. ej. ATAC-seq o ChIP-seq) en especies de interes agronomico.
- Anotacion funcional de genomas recien secuenciados: integrado en pipelines de bioinformatica, permitiria generar anotaciones preliminares de regiones regulatorias antes de disponer de datos experimentales propios.
- Seleccion de variantes en mejora genetica: utilizable como componente de scoring en estudios de asociacion para priorizar variantes no codificantes con posible efecto regulatorio.
- Filtrado de candidatos en diseno experimental: reducir el espacio de busqueda de regiones a validar experimentalmente, ahorrando coste en tecnicas de alto rendimiento.
- Investigacion comparativa entre especies: al tratarse de un modelo de dominio vegetal, puede aplicarse en analisis cross-species para identificar elementos regulatorios conservados.
- Docencia y prototipado en bioinformatica: su licencia MIT y su integracion con Hugging Face Hub lo hacen adecuado para experimentacion academica y construccion de pipelines reproducibles en PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): en torno a 0,9-1,0 GB solo para pesos, mas memoria para activaciones y secuencias de entrada.
- En fp16/bf16: aproximadamente 0,5 GB para pesos, holgadamente por debajo de cualquier GPU consumer moderna.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.); para lotes grandes o secuencias genomica largas, se recomienda RTX 4090, A100 o H100.
- Cabe en GPU consumer sin problemas dado el tamano del modelo (236,9 M de parametros).
- Opciones de despliegue: carga directa con `PyTorchModelHubMixin` desde Hugging Face Hub; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DeepPlant-AT-EAP | 236,9 M | no disponible | MIT | Hugging Face Hub | Modelo de genomica vegetal; documentacion minima |
| Nucleotide Transformer (InstaDeep) | 500 M - 2,5 B | hasta 12 kb de secuencia | no disponible en la informacion | Hugging Face Hub | Modelo genomico generalista, no especifico de plantas |
| DNABERT-2 | ~117 M | ~10 kb | MIT | Hugging Face Hub | Modelo de representacion de secuencias genomicas |
| PlantCAD | no disponible | no disponible | no disponible | Hugging Face Hub | Modelo especifico de genomas vegetales |

La comparacion es orientativa: no se dispone de datos de rendimiento de DeepPlant-AT-EAP que permitan establecer una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no hay paper, ni descripcion de arquitectura, ni datos de entrenamiento, lo que impide evaluar su validez cientifica.
- No se han publicado benchmarks; no hay evidencia publica de su rendimiento frente a alternativas.
- El enlace de codigo de la model card es un placeholder (`your-username`), por lo que el codigo de referencia puede no estar disponible.
- Riesgo de sesgo derivado de las especies vegetales representadas en el dataset de entrenamiento (no documentadas); su generalizacion a otras especies es incierta.
- Riesgo de sobreinterpretacion de predicciones en contextos experimentales: no debe usarse como sustituto de validacion wet-lab.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte.
- Numero de descargas muy bajo (19) y sin likes, lo que sugiere escasa validacion por parte de la comunidad.
- No apto para tareas de generacion de texto, dialogo ni agentes: es un modelo de dominio biologico.

## Enlaces

- Hugging Face: https://huggingface.co/Addaoud/DeepPlant-AT-EAP
- Codigo de referencia (placeholder en la model card): https://huggingface.co/your-username/deepplant
- Documentacion de PyTorchModelHubMixin: https://huggingface.co/docs/huggingface_hub/package_reference/mixins#huggingface_hub.PyTorchModelHubMixin
- Paper: no disponible
- Docs: no disponible
