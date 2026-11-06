# Addaoud/DeepPlant-OS-GEP

## Resumen

DeepPlant-OS-GEP es un modelo de aprendizaje profundo orientado a genomica vegetal y genomica regulatoria, publicado en Hugging Face por el usuario Addaoud bajo licencia MIT. Con 238.530.453 parametros (aproximadamente 238,5 millones), se enmarca en la categoria de modelos pequenos y especializados, muy alejados de los LLM generativos de proposito general: su pipeline declarado es "other" y sus etiquetas apuntan a bioinformatica, genomica de plantas y genomica regulatoria. El nombre sugiere un uso vinculado a la prediccion de elementos regulatorios o expresion genica (GEP podria corresponder a "gene expression prediction"), aunque la model card no lo confirma explicitamente.

El repositorio se creo y actualizo el 31 de octubre de 2026, ocupa 1,0 GB y acumula 20 descargas y 0 likes en el momento de la consulta. El modelo se distribuye en formato safetensors y se integra mediante `PyTorchModelHubMixin`, lo que permite cargarlo con la API de `huggingface_hub` en lugar de con `transformers`. No se declaran idiomas soportados, lo cual es coherente con un modelo de secuencias genomicas y no de texto natural.

La relevancia de esta ficha es limitada pero real: se trata de un ejemplo de modelo cientifico pequeno, empaquetado con el estandar de Hugging Face, que puede ejecutarse en hardware modesto y sirve como referencia para pipelines de bioinformatica. No obstante, la documentacion publicada es practicamente inexistente (la model card es la plantilla autogenerada por el mixin), por lo que la mayor parte de las especificaciones tecnicas no estan disponibles y deben tratarse con cautela antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se documenta en la model card; el nombre y las etiquetas apuntan a una red neuronal profunda para genomica, sin confirmar transformer) |
| Parametros totales | 238.530.453 |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se mencionan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (modelo orientado a secuencias genomicas, no a texto natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 1,0 GB) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna. La model card publicada es la plantilla generada automaticamente por `PyTorchModelHubMixin` e incluye unicamente enlaces marcados como "[More Information Needed]" para codigo, paper y documentacion. Las etiquetas del repositorio (`bioinformatics`, `plant-genomics`, `regulatory-genomics`) indican el dominio de aplicacion, pero no especifican si se trata de un transformer, una CNN, un modelo basado en k-mers o una arquitectura hibrida.

Tampoco hay datos sobre el corpus de entrenamiento: no se indica el numero de tokens ni de secuencias, la composicion del dataset (especies vegetales incluidas, proporciones de regiones codificantes frente a no codificantes), ni si se aplicaron tecnicas de ajuste fino supervisado, RLHF o DPO. Al no existir paper enlazado, cualquier afirmacion sobre el proceso de entrenamiento seria especulativa. El unico dato verificable es el recuento de parametros extraido de los tensores safetensors: 238.530.453.

## Capacidades

- Procesamiento de datos genomicos: el dominio declarado (genomica vegetal y regulatoria) sugiere entrada de secuencias de ADN y salida de predicciones asociadas, aunque el tipo exacto de tarea no esta documentado.
- Integracion con el ecosistema Hugging Face: cargable mediante `PyTorchModelHubMixin` desde `huggingface_hub`, lo que facilita su uso en scripts de PyTorch.
- Ejecucion en CPU y GPU: con 238,5 millones de parametros, el modelo es lo bastante pequeno para inferencia en hardware de consumo.
- Generacion de texto: no disponible; no hay evidencia de que sea un modelo de lenguaje.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no aplica segun la informacion disponible.
- Capacidades especiales (vision, audio, modo thinking): no disponible.

## Casos de uso

- Prediccion de elementos regulatorios en genomas vegetales: si el modelo implementa la tarea que sugiere su etiqueta `regulatory-genomics`, se usaria para anotar regiones promotoras o enhancers a partir de secuencias de ADN, apoyando estudios de expresion genica en cultivos.
- Analisis de expresion genica asistido: bajo la hipotesis de que "GEP" corresponda a prediccion de expresion genica, el modelo podria integrarse en pipelines que estiman niveles de expresion a partir de contexto genomico, como paso previo a validacion experimental.
- Investigacion academica reproducible: al estar bajo licencia MIT y en safetensors, un grupo de investigacion puede descargarlo, inspeccionar los pesos y reproducir experimentos sin restricciones legales, algo valioso en un campo donde abundan licencias no comerciales.
- Prototipado rapido en bioinformatica: con 238,5 millones de parametros cabe en una GPU de consumo, lo que permite iterar sobre hipotesis en un portatil con GPU antes de escalar a modelos mayores.
- Docencia y formacion: sirve como ejemplo practico de como empaquetar un modelo cientifico con `PyTorchModelHubMixin` y publicarlo en el Hub, util en cursos de bioinformatica computacional.
- Base para ajuste fino en especies concretas: al ser un modelo pequeno y con licencia permisiva, puede actuar como punto de partida para reentrenamiento sobre genomas de una especie vegetal especifica, siempre que se documente previamente su arquitectura y formato de entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,95 GB solo para pesos (238,5 M de parametros x 4 bytes), mas memoria para activaciones y entradas.
- VRAM estimada en FP16/BF16: aproximadamente 0,48 GB para pesos, mas overhead de activaciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM deberia ser suficiente en FP16; una RTX 3060, RTX 4060 o superior es mas que adecuada. Para FP32, una GPU con 6-8 GB (RTX 2060, RTX 3050) cubre el requisito con margen.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU discreta moderna e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: no se documentan; al usar `PyTorchModelHubMixin`, el despliegue natural es un script de PyTorch con `huggingface_hub`. No hay evidencia de soporte en vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa: no se conocen la tarea exacta, el formato de entrada ni los resultados del modelo. A modo de contexto, se incluyen referencias del ambito de genomica computacional, sin que ello implique equivalencia funcional.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DeepPlant-OS-GEP | 238,5 M | no disponible | MIT | Hugging Face (20 descargas) |
| Nucleotide Transformer (InstaDeep) | 500 M - 2,5 B (segun variante) | 1.000 - 12.000 pb | licencia abierta con condiciones | Hugging Face |
| DNABERT-2 | ~117 M | 512 pb | MIT | Hugging Face y GitHub |
| HyenaDNA | 1,6 M - 47 M (segun variante) | hasta 1 M pb | Apache 2.0 | Hugging Face |

La comparacion debe tomarse como orientativa: los modelos citados documentan arquitectura, datos de entrenamiento y benchmarks, mientras que DeepPlant-OS-GEP no publica ninguno de esos elementos.

## Limitaciones y advertencias

- Documentacion inexistente: la model card es la plantilla autogenerada; no hay paper, codigo ni guia de uso, lo que impide conocer la tarea exacta, el formato de entrada y el preprocesamiento requerido.
- Riesgo de uso incorrecto: sin especificacion de la tarea, aplicar el modelo a un problema genomico concreto puede producir resultados sin validez cientifica.
- Sesgos desconocidos: no se documenta la composicion del dataset de entrenamiento, por lo que se desconoce si el modelo esta sesgado hacia determinadas especies vegetales o regiones genomicas.
- Alucinacion: en el contexto de un modelo predictivo genomico, el riesgo equivalente es la generacion de predicciones con alta confianza pero sin respaldo biologico; no hay evaluacion publicada que lo descarte.
- Limitaciones de contexto e idioma: no aplica el concepto de idioma, pero se desconoce la longitud maxima de secuencia admitida.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero el autor no ofrece garantias; la ausencia de documentacion traslada todo el riesgo de validacion al usuario.
- Madurez: 20 descargas y 0 likes indican un modelo practicamente sin validacion por la comunidad; no debe considerarse listo para produccion sin una evaluacion independiente.
- Fecha de publicacion: el repositorio figura creado en octubre de 2026, lo que sugiere un proyecto muy reciente o posiblemente incompleto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Addaoud/DeepPlant-OS-GEP
- Documentacion de PyTorchModelHubMixin: https://huggingface.co/docs/huggingface_hub/package_reference/mixins#huggingface_hub.PyTorchModelHubMixin
- Codigo: no disponible (la model card enlaza a una URL de marcador de posicion)
- Paper: no disponible
- Documentacion adicional: no disponible
