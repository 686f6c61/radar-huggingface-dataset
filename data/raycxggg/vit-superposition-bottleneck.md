# RayCxggg/vit-superposition-bottleneck

## Resumen

Este repositorio contiene 80 vision transformers (ViT) entrenados desde cero como parte de una replicación independiente del estudio de Stevinson et al., *Adversarial Vulnerability from Interference Between Features in Superposition* (arXiv:2510.11709, sección 5). El trabajo lo ha realizado Second Look Research, bajo la supervisión de Zephaniah Roe, y su objetivo es verificar la afirmación de que los ataques adversariales explotan la interferencia entre características de clase que comparten una representación de baja dimensión.

La intervención central consiste en insertar un cuello de botella lineal de anchura `m` en la cabeza de clasificación de un modelo de `k` clases. Al reducir la razón `m/k`, las clases se ven forzadas a entrar en superposición y los perfiles de ataque en el espacio de entrada pasan a correlacionarse con la interferencia de la cabeza. Estos checkpoints son los modelos entrenados tras ese barrido, liberados para que la geometría pueda volver a medirse sin necesidad de reentrenar.

Cada modelo tiene 21,3 millones de parámetros, arquitectura ViT pequeña (patch 4, embed dim 384, profundidad 12, 6 cabezas, MLP dim 1536, pooling CLS) y se distribuye en formato safetensors con pesos fp32. La licencia es MIT. Es un recurso puramente de investigación, orientado a interpretabilidad y robustez adversarial, no a aplicaciones de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT (patch 4, embed dim 384, depth 12, 6 heads, MLP dim 1536, CLS pooling) con cabeza bottleneck lineal `encoder: Linear(384 -> m)` y `decoder: Linear(m -> k)` |
| Parametros totales | 21,3 millones (por modelo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | No disponible (solo pesos fp32 en safetensors) |
| Idiomas soportados | No aplica |
| Licencia | MIT |
| Formato de pesos | safetensors (fp32) |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer estándar entrenado desde cero, con una modificación clave en la cabeza de clasificación: un cuello de botella lineal de anchura `m` que fuerza la compresión de las representaciones de clase. La normalización está integrada dentro del modelo, de modo que las entradas son píxeles en el rango `[0,1]` y la epsilon adversarial se especifica directamente en unidades de `/255`.

Se entrenaron 80 modelos distribuidos en cuatro familias:

- `bottleneck` sobre CIFAR-10 (k=10, m=2,3,5,10), CIFAR-100 (k=100, m=20,30,50,100) y Tiny-ImageNet (k=200, m=40,60,100,200), con 5 semillas por configuración.
- `adv-train` sobre CIFAR-10 con las mismas configuraciones de bottleneck, pero entrenados con entrenamiento adversarial PGD (ε=2/255, 7 pasos).

Cada modelo incluye `config.json` con la receta de entrenamiento, métricas finales y procedencia, así como `history.json` con 300 entradas por época (lr, val_loss, val_acc), lo que sugiere 300 épocas de entrenamiento. No se especifica el número total de tokens ni la composición exacta del dataset más allá de los conjuntos mencionados. No se aplicó RLHF ni DPO.

## Capacidades

- Clasificacion de imagenes en datasets pequenos (CIFAR-10, CIFAR-100, Tiny-ImageNet).
- Estudio de la superposicion de features en representaciones de baja dimension.
- Analisis de vulnerabilidad adversarial y su correlacion con la interferencia entre clases.
- Entrenamiento adversarial (familia `adv-train`) para estudiar el efecto regularizador en bottlenecks estrechos.
- Re-medicion de la geometria de las representaciones sin reentrenar (gracias a los checkpoints liberados).
- No incluye capacidades de lenguaje, tool calling, agentes ni multimodalidad.

## Casos de uso

- Investigacion en interpretabilidad: analizar como la superposicion de features distorsiona el espacio latente y como se relaciona con la robustez del modelo.
- Estudio de ataques adversariales: medir la interferencia entre vectores de clase (a partir de los cosenos de las filas del decodificador) y compararla con los perfiles de ataque en el espacio de entrada.
- Replicacion cientifica: verificar o refutar los resultados del paper original usando estos artefactos de replicacion.
- Desarrollo de metodos de regularizacion: observar como el entrenamiento adversarial actua como regularizador en bottlenecks estrechos (la exactitud limpia sube de 54.00% a 78.39% en CIFAR-10 con m/k=0.2).
- Benchmark de arquitecturas ViT pequenas entrenadas desde cero: comparar la exactitud limpia y la robustez entre distintas configuraciones de bottleneck.
- Educacion en vision por computador: servir como ejemplo didactico de como un cuello de botella lineal afecta a la representacion y a la vulnerabilidad.

## Benchmarks y rendimiento

Los autores reportan la exactitud limpia en el split de test de cada dataset, media ± desviacion estandar sobre 5 semillas, en porcentaje:

| m/k | CIFAR-10 | CIFAR-100 | Tiny-ImageNet | CIFAR-10 (adv-train) |
|---|---|---|---|---|
| 0.2 | 54.00 ± 3.37 | 65.11 ± 0.60 | 54.44 ± 0.43 | 78.39 ± 0.56 |
| 0.3 | 78.26 ± 0.58 | 65.96 ± 0.40 | 54.78 ± 0.34 | 85.56 ± 0.61 |
| 0.5 | 87.10 ± 0.74 | 66.59 ± 0.56 | 54.65 ± 0.30 | 85.34 ± 0.40 |
| 1.0 | 89.91 ± 0.79 | 67.52 ± 0.66 | 55.18 ± 0.69 | 85.27 ± 0.46 |

Observacion destacada: el entrenamiento adversarial eleva la exactitud limpia en bottlenecks estrechos (de 54.00% a 78.39% en m/k=0.2), invirtiendo el tradeoff habitual entre robustez y exactitud. Los autores advierten que debe tratarse como una observacion de estos runs, no como un resultado establecido. No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- Cada modelo pesa aproximadamente 85 MB en fp32 (21,3M parametros × 4 bytes), por lo que cabe en cualquier GPU con mas de 1 GB de VRAM.
- El repositorio completo ocupa 6,8 GB, correspondientes a los 80 modelos.
- Inferencia viable incluso en CPU para un solo modelo, dado su tamano reducido.
- No se requiere GPU especializada; una RTX 3060 o similar es mas que suficiente.
- Despliegue: los pesos estan en safetensors y se cargan con PyTorch. No se mencionan integraciones con vLLM, Ollama o TGI (no son necesarias para este tipo de modelo).
- Latencia y throughput no especificados, pero al ser un ViT de 21M parametros la inferencia es del orden de milisegundos en GPU moderna.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros ViT pequenos (p. ej., ViT-Tiny de 5M o ViT-Small de 22M) en los mismos datasets y condiciones. La comparacion relevante aqui es interna: entre las diferentes anchuras de bottleneck y entre modelos estandar y adversariamente entrenados. El proposito del repositorio no es batir records de exactitud, sino proporcionar artefactos para estudiar la superposicion. Por tanto, una comparativa con modelos preentrenados de mayor tamano no es pertinente.

## Limitaciones y advertencias

- Son artefactos de replicacion, no los modelos originales del paper. Donde los numeros difieran, ninguno es automaticamente el erroneo.
- STL-10 esta deliberadamente ausente: el paper usa ResNet-50 para ese dataset y la configuracion ViT desde cero no fue fiable con solo 5.000 imagenes etiquetadas.
- Tiny-ImageNet deriva de ImageNet y tiene terminos de uso restringidos a investigacion; los pesos se liberan solo como artefactos de investigacion.
- La exactitud absoluta es baja por diseno (modelos pequenos entrenados desde cero), muy por debajo de los baselines preentrenados.
- No hay garantia de que los resultados de robustez se generalicen a otros datasets o arquitecturas.
- La observacion sobre el entrenamiento adversarial como regularizador es especifica de estos runs y no debe extrapolarse sin cautela.
- No se proporcionan cuantizaciones ni versiones optimizadas para produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/RayCxggg/vit-superposition-bottleneck
- Paper replicado (arXiv:2510.11709): https://arxiv.org/abs/2510.11709
- Repositorio de replicacion (GitHub): https://github.com/uchicago-xlab/superposition-replication
- Second Look Research: https://secondlookresearch.com
- Perfil del supervisor: https://zephaniahdev.com
