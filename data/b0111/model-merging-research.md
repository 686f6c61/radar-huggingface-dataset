# B0111/model-merging-research

## Resumen

`B0111/model-merging-research` no es un modelo de lenguaje, sino un repositorio de investigación sobre *model merging* (fusión de modelos). Contiene un inventario de checkpoints de redes neuronales pequeñas entrenadas sobre conjuntos de datos de visión por computador (MNIST, Fashion-MNIST, CIFAR-10) con arquitecturas clásicas (MLP, ResNet18, ResNet20, VGG16) y variantes de normalización (BatchNorm, LayerNorm, sin normalización). El objetivo es reproducir y comparar recetas de fusión de pesos publicadas en la literatura: Git Re-Basin, REPAIR, VF (QXY) e Ito 2025, entre otras.

El repositorio lo mantiene el usuario B0111 y su utilidad principal es servir como *checkpoint inventory* reproducible: cada carpeta sigue el patrón `checkpoints/<dataset>/<arch>_w<width>_<norm>_<tag>/seed<s>.pt` y va acompañada de un JSON con la configuración completa y los resultados. La model card indica que el repositorio en Hugging Face es privado y que se regenera mediante `scripts/server/checkpoint_inventory.py` tras cada entrenamiento.

No hay información sobre un modelo base de lenguaje, tokenizador, ventana de contexto ni pipeline de inferencia. El tamaño del repositorio (42,3 GB) corresponde al conjunto agregado de checkpoints de los distintos experimentos, no a un único modelo. La fecha de creación (2026-11-20) y la de actualización (2026-11-27) sitúan el material en un contexto de investigación reciente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP, ResNet18, ResNet20 y VGG16 con variantes de normalización (BatchNorm, LayerNorm, sin normalización); anchos 1x, 2x, 4x, 8x y barridos de capa oculta (64 a 8192) |
| Parametros totales | no disponible (depende de cada checkpoint; el repo agrega 42,3 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `.pt` (PyTorch) con JSON de configuración y resultados por checkpoint |

## Arquitectura y entrenamiento

Los checkpoints cubren tres familias de arquitecturas de visión: perceptrones multicapa (MLP) para MNIST, Fashion-MNIST y CIFAR-10; ResNet18 y ResNet20 para CIFAR-10; y VGG16 para CIFAR-10. Las variantes de normalización incluyen BatchNorm (BN), LayerNorm (LN) y ausencia de normalización (`none`). Los anchos de red varían entre 1x, 2x, 4x y 8x para las ResNet, y entre 64 y 8192 unidades ocultas para los MLP de Fashion-MNIST en el experimento de "width w/o permutation".

Las recetas de entrenamiento reproducen configuraciones de papers concretos: Git Re-Basin (MLP en MNIST y CIFAR-10, ResNet20-LN con ajustes oficiales en flax), REPAIR (ResNet18 y ResNet20 con BatchNorm, incluidos barridos de ancho y variantes de 50 y 250 épocas), VF/QXY (ResNet20-BN y VGG16 con y sin LayerNorm) e Ito 2025 (MLP con ajustes del apéndice D, Tabla 1). Algunos checkpoints provienen de los propios autores originales (por ejemplo, `resnet20_w1_ln_official`, versiones v4 y v12 de W&B convertidas). Cada entrada incluye semillas múltiples (típicamente entre 1 y 10) y la precisión de test por semilla, lo que permite evaluar la estabilidad de la fusión.

## Capacidades

- Reproducción de experimentos de *model merging* sobre arquitecturas de visión de pequeño y mediano tamaño.
- Evaluación de recetas de fusión de pesos (Git Re-Basin, REPAIR, VF, Ito 2025) con múltiples semillas.
- Barridos de ancho de red (1x, 2x, 4x, 8x y capas ocultas de 64 a 8192) para estudiar el efecto del ancho en la fusionabilidad.
- Comparación entre tipos de normalización (BN, LN, ninguna) y su impacto en la alineación de pesos.
- Checkpoints con precisión de test documentada por semilla (por ejemplo, ResNet18 REPAIR: 95,8–96,1 %; ResNet20 REPAIR 2x: 94,8–95,2 %).
- Detección de divergencias: el inventario marca explícitamente los checkpoints no utilizables (por ejemplo, `vgg16_w1_none_vf` con semillas 2, 3, 4 y 6 divergidas a 10,0 % de precisión).
- No dispone de capacidades de generación de texto, tool calling, agentes ni multilingüismo.

## Casos de uso

- Reproducción de resultados de papers de fusión: usar los checkpoints con semillas fijas para replicar las tablas de Git Re-Basin, REPAIR o VF sin reentrenar desde cero.
- Estudio del efecto del ancho en la fusionabilidad: comparar `resnet20_w1`, `w2`, `w4` y `w8` con la misma receta (LN + Git Re-Basin) para medir cómo escala la precisión tras la fusión.
- Análisis de normalización: contrastar ResNet20-BN frente a ResNet20-LN con REPAIR y Git Re-Basin para aislar el impacto de BatchNorm en la alineación de pesos.
- Validación de implementaciones propias de *merging*: usar los pares de checkpoints y sus precisiones de test como referencia para verificar que una implementación de Git Re-Basin o REPAIR produce los mismos resultados.
- Docencia e investigación en optimización no convexa: los MLP pequeños sobre MNIST y Fashion-MNIST permiten experimentar con simetrías de permutación y paisajes de pérdida en hardware modesto.
- Auditoría de recetas: el inventario documenta qué configuraciones divergen (por ejemplo, VGG16 sin normalización con ciertas semillas), útil para identificar recetas frágiles antes de invertir cómputo.
- Punto de partida para *merging* en visión: los checkpoints de CIFAR-10 (ResNet18/20, VGG16) sirven como base para probar técnicas de fusión antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible en el sentido habitual (MMLU, HumanEval, GSM8K). El inventario sí reporta precisiones de test sobre los datasets de visión, que se resumen a continuación (rangos entre semillas):

| Carpeta | Receta | Semillas | Precisión test (%) |
|---|---|---|---|
| `cifar10/mlp_w1_none_ar_ito` | Ito 2025 | 10 | 52,0–53,5 |
| `cifar10/mlp_w1_none_grb022sgd` | Git Re-Basin | 2 | 60,2–60,5 |
| `cifar10/resnet18_w1_bn_repair` | REPAIR | 6 | 95,8–96,1 |
| `cifar10/resnet20_w1_bn_repair` | REPAIR | 6 | 92,9–93,2 |
| `cifar10/resnet20_w1_ln_grb022` | Git Re-Basin | 4 | 90,6–91,0 |
| `cifar10/resnet20_w1_ln_repair` | REPAIR | 2 | 92,2–92,3 |
| `cifar10/resnet20_w2_bn_repair` | REPAIR | 2 | 94,8–95,2 |
| `cifar10/resnet20_w4_bn_repair` | REPAIR | 2 | 95,8–95,9 |
| `cifar10/resnet20_w8_ln_grb022` | Git Re-Basin | 2 | 94,8–95,0 |
| `cifar10/vgg16_w1_bn_vf` | VF (QXY) | 3 | 93,3–93,7 |
| `fashionmnist/mlp_w1_none_ito` | Ito 2025 | 10 | 89,3–89,7 |
| `mnist/mlp_w1_none_grb` | Git Re-Basin | 6 | 98,5–98,6 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma agregada; cada checkpoint individual es pequeño (MLP y ResNet20 en el orden de megabytes a decenas de megabytes), mientras que el repositorio completo ocupa 42,3 GB en disco.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente para cargar y evaluar un checkpoint individual (MLP, ResNet20, ResNet18 o VGG16 sobre CIFAR-10). No se requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU para los modelos más pequeños.
- Opciones de despliegue: carga directa con PyTorch (`torch.load` sobre los `.pt`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de checkpoints.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (repositorios de checkpoints para investigación en *model merging*).

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes, y no debe evaluarse con benchmarks de NLP.
- Licencia no especificada: no hay información sobre condiciones de uso comercial; debe contactarse con el autor antes de cualquier uso en producción.
- Repositorio marcado como privado en Hugging Face según la propia model card; el acceso puede estar restringido.
- Los checkpoints pertenecen a experimentos de investigación con precisión variable; algunos están marcados como divergidos (por ejemplo, `vgg16_w1_none_vf`, semillas 2, 3, 4 y 6 con 10,0 % de precisión) y no son utilizables.
- Los datos de precisión corresponden a los datasets de visión indicados (MNIST, Fashion-MNIST, CIFAR-10) y no son extrapolables a otras tareas.
- El inventario puede quedar desactualizado respecto a los entrenamientos más recientes; la model card indica regenerarlo con `scripts/server/checkpoint_inventory.py`.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque el material no es un modelo generativo.

## Enlaces

- Hugging Face: https://huggingface.co/B0111/model-merging-research
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
