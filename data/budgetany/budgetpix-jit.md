# BudgetAny/BudgetPix-JiT

## Resumen

BudgetPix-JiT es un modelo de generación de imágenes en espacio de píxeles, de tipo transformer de difusión, publicado por la comunidad BudgetAny como reimplementación no oficial del método BudgetPix (Kara et al., 2026). Se obtiene mediante fine-tuning del modelo base JiT (Just image Transformers, LTH14/JiT) con la tokenización adaptativa al cómputo propuesta en el paper: un único checkpoint permite elegir en inferencia cuántos tokens procesa el transformer, desde una rejilla densa de 256 tokens hasta presupuestos reducidos, sin reentrenar ni cambiar de pesos.

El modelo resuelve la generación condicionada por clase sobre ImageNet en espacio de píxeles, sin VAE ni tokenizador latente. La innovación central es un mapa de detalle basado en entropía que fusiona primero las regiones más planas en tokens gruesos y asigna los tokens finos a las zonas con más detalle. Así, el mismo conjunto de pesos sirve para distintos niveles de coste computacional, lo que resulta relevante para desplegar generación de imágenes con restricciones variables de latencia o presupuesto de cómputo.

El repositorio incluye cuatro variantes (JiT-B/16 a 256 px, JiT-B/32 a 512 px, JiT-L/16 a 256 px y JiT-L/32 a 512 px), con entre 134 y 465 millones de parámetros y un tamaño total de 4,8 GB. La licencia es MIT, igual que los pesos de JiT de los que deriva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión en espacio de píxeles (JiT) con tokenización adaptativa al cómputo (BudgetPix) |
| Parametros totales | 134 M (B/16, 256 px); 136 M (B/32, 512 px); 462 M (L/16, 256 px); 465 M (L/32, 512 px) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; presupuesto de tokens por imagen configurable (rejilla densa de 256 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32) |
| Idiomas soportados | no disponible (modelo de imagen condicionado por clase, sin entrada de texto) |
| Licencia | MIT |
| Formato de pesos | `.pth` (PyTorch, EMA en fp32); checksums en `SHA256SUMS` |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión que opera directamente sobre píxeles, siguiendo la arquitectura JiT (Just image Transformers). Sobre el backbone JiT se añaden los módulos de tokenización adaptativa de BudgetPix: en cada paso de inferencia se calcula un mapa de detalle basado en entropía que determina qué regiones de la imagen se representan con tokens finos y cuáles se agrupan en tokens gruesos. El resultado es que un mismo checkpoint puede ejecutarse con distintos presupuestos de tokens (por ejemplo, 128 frente a la rejilla densa de 256) manteniendo la coherencia del modelo.

El entrenamiento consiste en un fine-tuning del modelo JiT preentrenado sobre ImageNet, con condicionamiento por clase. Los pesos publicados corresponden a las EMA del modelo adaptado completo (backbone más módulos añadidos) en fp32. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO (no aplicables de forma habitual en difusión condicionada por clase).

## Capacidades

- Generación de imágenes condicionada por clase sobre ImageNet (clases identificadas por índice numérico).
- Generación en espacio de píxeles sin VAE ni decodificador latente.
- Presupuesto de tokens configurable en inferencia con un único checkpoint: la rejilla densa es de 256 tokens y puede reducirse (por ejemplo, a 128 o al 25 % de la rejilla).
- Tokenización adaptativa guiada por entropía: asignación de tokens finos a regiones detalladas y fusión de regiones planas.
- Escalado por guía (classifier-free guidance) configurable; valor por defecto 3.0 y alrededor de 6.0 recomendado para los modelos de 512 px con presupuesto del 25 %.
- Cuatro variantes que cubren dos resoluciones (256 y 512 px) y dos escalas de backbone (B y L).
- No soporta tool calling, agentes, texto, visión de entrada ni audio.

## Casos de uso

- Generación de imágenes sintéticas para aumento de datos en visión por computador: al condicionar por clase de ImageNet, se pueden generar muestras etiquetadas para equilibrar clases poco representadas en un dataset de entrenamiento.
- Investigación en difusión en espacio de píxeles: sirve como referencia reproducible (licencia MIT, pesos y código públicos) para comparar tokenización adaptativa frente a rejillas densas fijas.
- Despliegue con presupuesto de cómputo variable: en entornos con latencia o energía limitadas se reduce el número de tokens por imagen (por ejemplo, al 25 % de la rejilla) manteniendo los mismos pesos, sin necesidad de mantener varios checkpoints.
- Prototipado rápido en GPU de consumo: las variantes B (134-136 M de parámetros) caben con holgura en tarjetas de gama media para experimentación con generación condicionada por clase.
- Evaluación comparativa de métodos de tokenización: el mismo backbone JiT permite aislar el efecto del mapa de entropía frente a la rejilla densa en métricas como FID sobre ImageNet.
- Docencia y demostraciones de difusión: el flujo de uso (descarga del checkpoint y script `sample.py` con `--budget` y `--classes`) es directo y adecuado para sesiones prácticas sobre modelos generativos.
- Generación de imágenes de referencia en pipelines de investigación de superresolución o edición: las muestras a 512 px pueden servir como entradas controladas en experimentos posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los checkpoints ocupan entre 0,53 GB (B/16, 256 px) y 1,86 GB (L/32, 512 px) en fp32; la VRAM real depende del presupuesto de tokens, del tamaño de lote y de la resolución, pero las variantes B caben en GPUs de consumo con 8 GB o más.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 8 GB de VRAM para las variantes B; 16 GB o más para las variantes L a 512 px con lotes mayores. No se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: sí, al menos las variantes B/16 y B/32; las variantes L requieren comprobar el consumo según lote y presupuesto de tokens.
- Opciones de despliegue: el repositorio oficial proporciona el script `sample.py` sobre PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de difusión de imagen de este tipo).
- Latencia y throughput: no disponibles; dependen del presupuesto de tokens elegido, que es precisamente el parámetro que el modelo permite ajustar.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Condicionamiento | Presupuesto de tokens | Licencia |
|---|---|---|---|---|---|
| BudgetPix-JiT (L/32) | 465 M | 512 px | Clase (ImageNet) | Configurable (rejilla densa 256) | MIT |
| JiT (LTH14/JiT) | no disponible | 256/512 px | Clase (ImageNet) | Fijo (rejilla densa) | MIT |
| PixelDiT | no disponible | no disponible | Clase | Fijo | no disponible |
| MiniT2I | no disponible | no disponible | Texto-imagen | Fijo | no disponible |

La comparación cuantitativa con JiT, PixelDiT o MiniT2I no está disponible en la información proporcionada; la diferencia documentada es la tokenización adaptativa al cómputo, que permite reducir el número de tokens en inferencia con los mismos pesos.

## Limitaciones y advertencias

- Es una reimplementación no oficial: los pesos no proceden de los autores del paper y pueden diferir de los resultados publicados.
- Modelo condicionado únicamente por clase de ImageNet; no acepta prompts de texto ni otros condicionamientos.
- No se documentan sesgos específicos, pero al entrenarse sobre ImageNet hereda los sesgos de representación de dicho dataset.
- Riesgo de alucinación visual y de artefactos en presupuestos de tokens muy reducidos; el propio autor recomienda ajustar la guía (alrededor de 6.0 para 512 px al 25 % de la rejilla).
- Los pesos se publican en fp32 y no se documentan cuantizaciones oficiales; el despliegue en hardware limitado requiere conversión propia.
- Licencia MIT, que permite uso comercial, pero sin garantías por parte de los autores del método ni de la comunidad que publica los pesos.
- No hay información sobre idiomas, datos de entrenamiento ni métricas de evaluación en la model card.

## Enlaces

- Hugging Face: https://huggingface.co/BudgetAny/BudgetPix-JiT
- Página del proyecto: https://budgetany.github.io/budgetpix/
- Código (JiT): https://github.com/BudgetAny/BudgetPix/tree/main/jit
- Paper: https://arxiv.org/abs/2610.12307
- Organización BudgetAny: https://huggingface.co/BudgetAny
- Repositorio de referencia: https://github.com/budgetpix/BudgetPix-public
- Modelo base JiT: https://github.com/LTH14/JiT
- APT: https://github.com/rccchoudhury/apt
