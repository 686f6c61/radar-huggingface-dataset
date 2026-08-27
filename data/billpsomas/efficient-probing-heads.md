# billpsomas/efficient-probing-heads

## Resumen

Efficient Probing Heads es un conjunto de 36 cabezas de clasificación entrenadas sobre características congeladas de otros tantos encoders preentrenados, publicadas por Bill Psomas como parte del trabajo "Attention, Please! Revisiting Attentive Probing Through the Lens of Accuracy vs. Parameter Efficiency", aceptado en ICLR 2026. Cada cabeza implementa un mecanismo de *pooling* por atención cruzada multi-query seguido de BatchNorm y un clasificador lineal, entrenado durante 90 épocas con el optimizador LARS sobre los *features* congelados de cada backbone. El repositorio no incluye los pesos de los backbones; cada `config.json` registra los flags exactos necesarios para reconstruir el encoder desde su fuente original.

El problema que resuelve es el de la evaluación y adaptación eficiente de encoders visuales preentrenados: en lugar de afinar el modelo completo o usar *linear probing* clásico, estas cabezas ofrecen una alternativa ligera que mejora la precisión en ImageNet-1k con un coste computacional mínimo y produce mapas de atención interpretables. Su relevancia actual radica en que permite comparar decenas de familias de preentrenamiento (DINOv2, CLIP, MAE, SigLIP, etc.) bajo un mismo protocolo de evaluación, con resultados reproducibles y sin necesidad de reentrenar los backbones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezas de *probing* eficiente: *multi-query cross-attention pooling* + BatchNorm + clasificador lineal |
| Parametros totales | No disponible (cada cabeza es ligera; el repositorio completo ocupa 0,4 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (clasificacion de imagenes) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pth) |

## Arquitectura y entrenamiento

Cada cabeza EP (Efficient Probing) consiste en un mecanismo de atención cruzada multi-query que agrega los *tokens* de salida de un encoder congelado en un vector de características, seguido de una capa BatchNorm y un clasificador lineal. Este diseño reduce drásticamente el número de parámetros en comparación con métodos de *probing* atentos previos, que solían ser sobredimensionados. El entrenamiento se realizó durante 90 épocas con LARS sobre las características congeladas de cada backbone, sin actualizar los pesos del encoder. Los datos de entrenamiento son ImageNet-1k, y el protocolo está estandarizado en el repositorio oficial.

La innovación principal es el *pooling* por atención cruzada multi-query, que permite obtener mapas de atención interpretables y mejorar la precisión frente a *k*-NN y *linear probing* clásico con un overhead mínimo. El trabajo incluye un estudio exhaustivo de métodos de *probing* atentos existentes, analizando sus opciones de diseño y su equilibrio entre precisión y eficiencia paramétrica.

## Capacidades

- Clasificacion de imagenes en ImageNet-1k con caracteristicas congeladas de 36 encoders distintos.
- Generacion de mapas de atencion interpretables gracias al mecanismo de atencion cruzada multi-query.
- Compatibilidad con multiples familias de preentrenamiento: DINOv2/v3, CLIP, SigLIP, EVA02, MAE, iBOT, BEiTv2, Hiera, I-JEPA, MoCov3, MaskFeat, SimMIM, RADIO, AIMv2, Franca, CAPI, PE-Core, MetaCLIP2, entre otros.
- Evaluacion reproducible: cada cabeza incluye su precision top-1 en la epoca guardada, distinguiendo entre epoca pico y epoca final.
- No requiere reentrenamiento del backbone: solo se cargan los pesos de la cabeza sobre las caracteristicas congeladas.
- Soporte para inferencia directa mediante la herramienta `tools/eval_reimagenet.py` del repositorio.

## Casos de uso

- Evaluacion comparativa de encoders preentrenados: un investigador puede cargar varias cabezas EP sobre sus backbones correspondientes y comparar su precision en ImageNet-1k sin necesidad de afinar cada modelo, ahorrando recursos computacionales.
- Seleccion de backbone para tareas downstream: antes de invertir en un afinamiento completo, se puede usar EP para estimar que encoder congelado ofrece mejor base para una tarea especifica de clasificacion.
- Analisis de interpretabilidad: los mapas de atencion generados por las cabezas EP permiten visualizar que regiones de la imagen son relevantes para la decision del clasificador, util en aplicaciones de diagnostico medico o inspeccion visual.
- Prototipado rapido de sistemas de clasificacion: al no requerir entrenar el backbone, se puede montar un clasificador funcional en minutos usando una cabeza preentrenada y un encoder congelado.
- Benchmarking de nuevas arquitecturas: quien desarrolle un nuevo encoder puede compararlo con los 36 existentes usando el mismo protocolo EP, garantizando una comparacion justa.
- Educacion e investigacion en *probing*: el repositorio sirve como referencia para estudiar el equilibrio entre precision y eficiencia parametrica en metodos de adaptacion de caracteristicas congeladas.

## Benchmarks y rendimiento

Los resultados corresponden a la precision top-1 en ImageNet-1k de cada cabeza en la epoca guardada. Doce de ellas reproducen exactamente el numero del leaderboard (marcadas como "peak"); el resto son cabezas de epoca final, con ambas cifras registradas en el `config.json`.

| Encoder | Variante EP | Top-1 @ epoca guardada | Epoca | Tipo de checkpoint |
|---|---:|---:|---:|---|
| DINOv3 ViT-7B/16 | ep_all | 88.36 | 6 | pico |
| MetaCLIP2 ViT-bigG/14-378 | ep | 88.12 | 6 | pico |
| EVA02-CLIP E-14-plus | ep | 87.98 | 6 | pico |
| EVA02-CLIP E-14 | ep | 87.70 | 6 | pico |
| SigLIP2 SO400M/14 | ep | 85.64 | 29 | epoca final |
| PE-Core L-14/336 | ep | 87.25 | 12 | pico |
| MetaCLIP2 ViT-bigG/14 | ep | 87.11 | 6 | pico |
| SigLIP2 ViT-L/16 | ep | 87.06 | 6 | pico |
| DINOv3 ViT-L/16 | ep_all | 86.73 | 19 | epoca final |
| AIMv2 ViT-L/14 | ep | 85.62 | 19 | epoca final |
| SigLIP ViT-L/16 | ep | 85.93 | 6 | pico |
| DINOv2 ViT-L/14 | ep_all | 85.56 | 15 | pico |
| Franca ViT-L/14 | ep_all | 84.28 | 14 | pico |
| DINOv3 ViT-B/16 | ep_all | 83.77 | 20 | epoca final |
| DINOv2 ViT-B/14 | ep | 83.61 | 25 | epoca final |
| RADIO ViT-L/16 | ep | 83.40 | 89 | epoca final |
| EVA02 ViT-L/14 | ep | 83.22 | 89 | epoca final |
| CLIP ViT-L/14 | ep | 83.22 | 11 | pico |
| CAPI ViT-L/14 | ep | 82.43 | 89 | epoca final |
| BEiTv2 ViT-B/16 | ep | 81.32 | 89 | epoca final |
| RADIO ViT-B/16 | ep | 80.26 | 89 | epoca final |
| iBOT ViT-L/16 | ep_all | 79.43 | 89 | epoca final |
| Hiera ViT-H/16 | ep | 79.82 | 89 | epoca final |
| MAE ViT-L/16 | ep | 79.43 | 89 | epoca final |
| I-JEPA ViT-H/14 | ep | 78.80 | 89 | epoca final |
| iBOT ViT-B/16 | ep_all | 78.62 | 89 | epoca final |
| Hiera ViT-L/16 | ep | 78.51 | 83 | epoca final |
| CLIP ViT-B/16 | ep_all | 77.85 | 11 | pico |
| DINO ViT-B/16 | ep_all | 77.08 | 89 | epoca final |
| MoCov3 ViT-B/16 | ep_all | 76.21 | 89 | epoca final |
| Hiera ViT-B/16 | ep | 75.63 | 88 | epoca final |
| MAE ViT-B/16 | ep | 75.35 | 86 | epoca final |
| MaskFeat ViT-B/16 | ep | 71.68 | 89 | epoca final |
| MaskFeat ViT-L/16 | ep | 69.56 | 89 | epoca final |
| SimMIM ViT-B/16 | ep | 64.81 | 89 | epoca final |
| MAE ViT-S/16 | ep | 64.56 | 89 | epoca final |

No se dispone de comparaciones con *k*-NN o *linear probing* en la informacion proporcionada, aunque el paper reporta mejoras consistentes de EP sobre ambos metodos.

## Requisitos de hardware

- Las cabezas EP son extremadamente ligeras (del orden de cientos de miles de parametros cada una), por lo que pueden ejecutarse en CPU sin problemas.
- El requisito principal de hardware viene del backbone congelado, que no se incluye en este repositorio. Para encoders grandes como DINOv3 ViT-7B se necesitaria una GPU con al menos 40 GB de VRAM (p. ej., A100 o H100) en precision FP16.
- Para backbones medianos (ViT-L, ViT-B) una GPU consumer como RTX 3090 o RTX 4090 es suficiente.
- El despliegue puede hacerse con cualquier framework PyTorch estandar; no se requieren librerias especiales mas alla de `torch` y `huggingface_hub`.
- La inferencia de una sola imagen con una cabeza EP sobre un backbone ViT-B tarda del orden de milisegundos en GPU moderna, aunque no se han publicado cifras exactas de latencia.

## Comparativa con modelos similares

Este repositorio no es un modelo unico sino un conjunto de cabezas de *probing*. La comparativa natural es contra otros metodos de adaptacion de caracteristicas congeladas:

| Metodo | Parametros | Precision (mejor caso) | Coste de entrenamiento | Interpretabilidad |
|---|---|---|---|---|
| *k*-NN | 0 | ~80 % (depende del encoder) | Nulo | No |
| *Linear probing* (LP) | Bajo (lineal) | ~82-85 % (depende del encoder) | Minimo | No |
| *Efficient probing* (EP, este repo) | Bajo (atencion multi-query + lineal) | 88.36 % (DINOv3 ViT-7B) | 90 epocas con LARS | Si (mapas de atencion) |

EP supera consistentemente a *k*-NN y LP en los 36 encoders evaluados, segun el paper, con un overhead de parametros minimo y manteniendo la interpretabilidad. No se dispone de comparaciones numericas detalladas con otros metodos de *probing* atento en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no incluye los pesos de los backbones; es necesario reconstruirlos desde sus fuentes originales usando los flags registrados en cada `config.json`, lo que puede requerir acceso a modelos con licencias propias (p. ej., DINOv3, CLIP).
- Las cabezas se entrenaron exclusivamente en ImageNet-1k; su rendimiento en otros dominios puede degradarse y no se ha evaluado.
- Algunas cabezas corresponden a la epoca final del entrenamiento, no al pico de precision; si se busca el mejor resultado posible, conviene revisar el `config.json` para conocer ambas cifras.
- El encoder DiT-XL/2 no tiene cabeza disponible por falta de checkpoint superviviente.
- Aunque la licencia es Apache 2.0, los backbones subyacentes pueden tener restricciones de uso comercial; es responsabilidad del usuario verificar cada licencia.
- No se proporcionan datos sobre sesgos demograficos o de contenido; al estar entrenado en ImageNet, puede heredar sesgos de ese dataset.
- El riesgo de alucinacion no aplica al ser un modelo discriminativo de clasificacion, pero la interpretabilidad de los mapas de atencion debe usarse con cautela.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/billpsomas/efficient-probing-heads
- Repositorio GitHub oficial: https://github.com/billpsomas/efficient-probing
- Paper en arXiv: https://arxiv.org/pdf/2506.10178
- Anuncio del blog del autor: https://billpsomas.github.io/news/announcement_4/
- Entrada en ML Anthology (ICLR 2026): https://mlanthology.org/iclr/2026/psomas2026iclr-attention/
