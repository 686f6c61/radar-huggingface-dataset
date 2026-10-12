# Doilion111/CytoSPM

## Resumen

CytoSPM es un modelo de deteccion de objetos en citopatologia con capacidad de vocabulario abierto (open-vocabulary detection), presentado en el articulo "CytoSPM: Open-Vocabulary Cytopathology Detection with Structured Prompt Bank" (BIBM 2026). Lo desarrolla el grupo CVIU-CSU, con autoria de Wenjie Li, Zishan Xu, Jinyang Huang, Zhengxin Nie, Shichao Kan y Yixiong Liang. La publicacion en HuggingFace corre a cargo del usuario Doilion111 y distribuye unicamente los pesos entrenados.

El modelo aborda la deteccion de estructuras celulares en imagenes de citopatologia, incluyendo categorias que no se han visto durante el entrenamiento. Para ello combina un backbone ConvNeXt-T con un mecanismo de "structured prompt bank" orientado a la deteccion open-vocabulary. Se evalua sobre el conjunto PentaCyto, con 24 categorias base y 9 categorias retenidas que se miden en regimen zero-shot.

Es relevante porque ofrece un punto de referencia reproducible para deteccion citopatologica de vocabulario abierto, con pesos publicos bajo licencia GPL-3.0, codigo disponible y valores de AP documentados tanto para categorias base como novel. El repositorio de pesos ocupa aproximadamente 0,2 GB y el pipeline declarado es object-detection.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos con backbone ConvNeXt-T y structured prompt bank (open-vocabulary detection) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (deteccion de objetos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, no linguistico) |
| Licencia | gpl-3.0 |
| Formato de pesos | PyTorch state_dict (.pth), cargable con torch.load(..., weights_only=True) |

## Arquitectura y entrenamiento

La informacion disponible indica que CytoSPM emplea un backbone ConvNeXt-T (fichero `cytospm_convnext_t.pth`) dentro de un pipeline de deteccion de objetos. El componente distintivo es un "structured prompt bank" que habilita la deteccion de vocabulario abierto, es decir, la localizacion de categorias no vistas durante el entrenamiento. El checkpoint publicado contiene exclusivamente el `state_dict` de los pesos, sin codigo de inferencia; este reside en el repositorio GitHub del proyecto.

En cuanto a los datos, el modelo se evalua sobre PentaCyto, un conjunto de citopatologia con 24 categorias base y 9 categorias retenidas para la prueba zero-shot. No se especifican en la informacion proporcionada el numero de imagenes, el volumen de tokens, la composicion detallada del dataset ni si se aplicaron tecnicas de RLHF, DPO o similares. Las imagenes y anotaciones de PentaCyto no se distribuyen junto con los pesos. Los valores reportados en la model card se midieron con el codigo publicado en una RTX 3090, mientras que los del articulo se obtuvieron en una RTX 4090.

## Capacidades

- Deteccion de objetos en imagenes de citopatologia.
- Deteccion open-vocabulary: localizacion de las 9 categorias novel del conjunto PentaCyto en regimen zero-shot, sin ejemplos de entrenamiento para esas clases.
- Deteccion sobre las 24 categorias base de PentaCyto.
- Soporte de tool calling / function calling: no disponible (no es un modelo linguistico).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): vision aplicada a microscopia citopatologica; el resto no disponible.

## Casos de uso

- Analisis de muestras citologicas en investigacion: el modelo puede localizar y clasificar categorias celulares base en imagenes PentaCyto, sirviendo como referencia reproducible para experimentos de deteccion en citopatologia.
- Deteccion de categorias emergentes o poco frecuentes: gracias a su naturaleza open-vocabulary, permite abordar clases no incluidas en el entrenamiento (las 9 categorias novel) sin reentrenamiento, util para catalogos celulares en evolucion.
- Preanotacion de datasets citopatologicos: las detecciones del modelo pueden emplearse como propuestas iniciales para que patologos validen o corrijan, acelerando el etiquetado de nuevas imagenes.
- Benchmarking de metodos de deteccion medica: al publicar AP base y novel con checkpoints y SHA256 verificables, sirve como linea base frente a otros detectores en el mismo conjunto PentaCyto.
- Reproduccion de resultados academicos: con el codigo del repositorio CVIU-CSU/CytoSPM y los scripts `test.py` y `test_novel.py`, permite replicar las cifras del articulo en hardware propio.
- Integracion en pipelines de investigacion sobre microscopia: al cargarse como `state_dict` estandar de PyTorch, se puede incorporar en flujos de inferencia por lotes sobre imagenes histologicas.
- Estudio de transferencia zero-shot en dominio medico: permite analizar como se comporta la deteccion open-vocabulary al pasar de 24 a 9 categorias retenidas, con la caida de AP documentada.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre PentaCyto (medidos en RTX 3090 con el codigo liberado; entre parentesis, valores del articulo medidos en RTX 4090):

| Metrica | Base (24 categorias) | Novel (9 categorias, zero-shot) |
|---|---|---|
| AP | 33,54 (33,55) | 15,00 (15,00) |
| AP50 | 52,20 (52,20) | 21,00 (21,00) |
| AP75 | 38,16 (38,17) | 17,10 (17,20) |

El AP base es el COCO AP sobre las 24 categorias base de PentaCyto; el AP novel es el COCO AP zero-shot sobre las 9 categorias retenidas. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, dado que se trata de un modelo de deteccion de imagenes, no de lenguaje.

## Requisitos de hardware

- El checkpoint `cytospm_convnext_t.pth` ocupa aproximadamente 0,2 GB en disco (tamano del repo de HuggingFace).
- Los valores de referencia se midieron en una RTX 3090 (con el codigo publicado) y en una RTX 4090 (valores del articulo), por lo que ambos modelos de GPU son compatibles.
- Al tratarse de un backbone ConvNeXt-T, es previsible que quepa en GPU de consumo, aunque no se proporciona una estimacion de VRAM concreta. Este dato debe considerarse no disponible.
- Opciones de despliegue: el proyecto proporciona codigo propio (`tools/test.py`, `tools/test_novel.py`, `tools/fetch_checkpoints.sh`) en el repositorio GitHub; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.
- Requisito de verificacion: el fichero incluye un SHA256 (`bc94215314319f712c731e8f5f24388df29d254cc2029695d32e815efb3aac4d`) que el script de descarga comprueba.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados de otros modelos evaluados sobre PentaCyto ni de comparativas con detectores open-vocabulary equivalentes (por ejemplo, variantes de deteccion zero-shot en dominio medico). Por tanto, la comparativa con alternativas de la misma categoria queda como no disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CytoSPM (ConvNeXt-T) | no disponible | no aplica | AP base 33,54 / AP novel 15,00 | gpl-3.0 | Pesos en HuggingFace, codigo en GitHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; al entrenarse sobre PentaCyto, su comportamiento esta condicionado por la distribucion de ese conjunto, que no se detalla.
- Riesgo de alucinacion: en deteccion, el equivalente son falsos positivos y detecciones espurias; no se documentan tasas concretas.
- El rendimiento cae notablemente en categorias novel (AP 15,00 frente a 33,54 en base), lo que limita su uso fiable en clases no vistas.
- Las imagenes y anotaciones de PentaCyto no se distribuyen, por lo que no es posible reproducir el benchmark sin acceso al dataset por otras vias.
- No se documentan los idiomas soportados (dato no aplicable a un modelo de vision, pero marcado como no disponible en el repositorio).
- Licencia GPL-3.0: implica obligaciones de copyleft para obras derivadas distribuidas; debe revisarse su compatibilidad antes de un uso comercial o de integracion en productos propietarios.
- El contenido del repositorio son unicamente pesos (`state_dict`); no incluye codigo de inferencia, preprocesado ni configuracion, que dependen del repositorio GitHub externo.
- No hay informacion sobre cuantizacion, lo que puede limitar el despliegue en entornos con restricciones de memoria.
- Uso previsto de investigacion; no se declara validacion clinica ni aprobacion regulatoria alguna.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Doilion111/CytoSPM
- Paper (arXiv): https://arxiv.org/abs/2609.31314
- Codigo: https://github.com/CVIU-CSU/CytoSPM
- Repositorio del proyecto (clonado en las instrucciones de uso): https://github.com/CVIU-CSU/CytoSPM.git
- Cita (BIBM 2026): Li, Wenjie; Xu, Zishan; Huang, Jinyang; Nie, Zhengxin; Kan, Shichao; Liang, Yixiong. "CytoSPM: Open-Vocabulary Cytopathology Detection with Structured Prompt Bank". IEEE International Conference on Bioinformatics and Biomedicine (BIBM), 2026.
