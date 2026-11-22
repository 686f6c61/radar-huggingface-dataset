# Lixiaoming/RePrime

## Resumen

RePrime es una receta de alineamiento de representaciones para generadores de imagen de un solo paso (one-step) de estilo Priming. El modelo parte de la premisa de que un generador Priming se entrena sobre imágenes reales corrompidas (que tienen una contrapartida limpia) y sobre ruido puro (que no la tiene); la misma pérdida de alineamiento estilo REPA ayuda en la ruta de reconstrucción emparejada pero colapsa la diversidad en la ruta generativa. RePrime alinea únicamente la ruta emparejada con un profesor congelado DINOv2-L/14 durante la fase de priming, y descarta el proyector después, de modo que la inferencia no cambia.

Los checkpoints publicados están pensados para investigación en generación one-step sobre ImageNet-256. La arquitectura es un transformer de espacio de píxeles con 1 NFE (una evaluación de red), en variantes B (16 bloques, anchura 768) y L (32 bloques, anchura 1024), con tokens de parche de 16×16. No es un modelo de lenguaje: no procesa texto ni tiene ventana de contexto en el sentido habitual, sino que genera imágenes condicionadas por clase.

El interés actual reside en que consigue FID notablemente bajos en ImageNet 256×256 sin guiado libre de clasificador y con una sola evaluación de red, superando a los Priming oficiales de referencia. El repositorio incluye checkpoints listos para inferencia tras post-entrenamiento (25k actualizaciones OT) y checkpoints de preentrenamiento, con pesos en formato `.pth` de PyTorch bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de espacio de píxeles, one-step (1 NFE); variantes B (16 bloques, anchura 768) y L (32 bloques, anchura 1024); tokens de parche 16×16 |
| Parametros totales | No disponible (tamaños de checkpoint: B 1,84 GB post-entrenamiento, L 6,48 GB post-entrenamiento) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de generación de imagen condicionado por clase; sin contexto textual) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (generación de imagen; sin soporte de texto) |
| Licencia | Apache 2.0 (sujeto a los Términos de Acceso de ImageNet) |
| Formato de pesos | `.pth` (PyTorch); incluye pesos online, EMA shadow y, en stage-1, estado del optimizador |

## Arquitectura y entrenamiento

RePrime se construye sobre la arquitectura Priming: un transformer que opera directamente en espacio de píxeles, con tokens de parche de 16×16 y una única evaluación de red (1 NFE) para generar la imagen. Las variantes son B (16 bloques, anchura 768) y L (32 bloques, anchura 1024). El entrenamiento de priming se realiza durante 160 épocas con corrupción fija `s=0.8`, usando MSE adaptativo en píxeles más términos perceptuales LPIPS y ConvNeXt, optimizador Muon y EMA 0.9999.

La innovación de RePrime es una pérdida coseno token a token entre los tokens de parche del bloque 5 (en B) o bloque 10 (en L) de `x_s` y los tokens de un DINOv2-L/14 congelado de `x_0`, con λ=0.5 y durante toda la ventana de priming. El proyector se descarta tras el entrenamiento, por lo que la inferencia es idéntica a la de Priming. El post-entrenamiento aplica la receta oficial de OT de Priming con 25.000 actualizaciones AdamW (16 clases × 64 muestras × 128 referencias por paso, EMA 0.999). La variante RePrime-J entrena conjuntamente reconstrucción y OT (OT cada 2 actualizaciones) durante 200k actualizaciones, con refinamiento opcional de 25k actualizaciones OT.

## Capacidades

- Generación de imágenes de un solo paso (1 NFE) en resolución 256×256, condicionada por clase de ImageNet.
- Reconstrucción de imágenes corrompidas en la ruta emparejada (checkpoints de stage-1).
- Generación sin guiado libre de clasificador (no CFG).
- Alineamiento de representaciones con profesor DINOv2-L/14 durante el entrenamiento (no en inferencia).
- Variantes con distinto equilibrio fidelidad/diversidad: RePrime-L, RePrime-B, RePrime-B block 8 y RePrime-J.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión de entrada ni audio.

## Casos de uso

- Investigación en generación one-step: servir como referencia reproducible para estudiar el efecto del alineamiento de representaciones en la ruta emparejada frente a la generativa, usando los checkpoints de stage-1 y post-entrenamiento.
- Benchmarking de FID/FDr⁵ en ImageNet-256: evaluar con el protocolo oficial (50.000 imágenes, 3 semillas, batch 32, 4 rangos, Inception FP32) para comparar recetas de alineamiento.
- Ablación de componentes de entrenamiento: comparar RePrime-B con y sin bloque 8, o RePrime-J nativo frente a refinado, para aislar el efecto de cada decisión de diseño.
- Estudio de destilación de representaciones: analizar cómo la alineación con DINOv2-L/14 en bloques intermedios afecta a la diversidad y a la fidelidad del generador.
- Generación rápida de muestras sintéticas de ImageNet para experimentos de augmentación o análisis de distribuciones, dado el bajo coste de 1 NFE.
- Base para extensiones a otras resoluciones o dominios: reutilizar la receta RePrime sobre arquitecturas Priming y profesores alternativos en trabajos de investigación.
- Docencia y divulgación: ilustrar el compromiso entre alineamiento de representaciones y colapso de diversidad en modelos generativos de una sola pasada.

## Benchmarks y rendimiento

ImageNet 256×256, una evaluación de red, sin guiado libre de clasificador. FID y FDr⁵ medidos en papel y en servidor.

| Modelo | FID papel ↓ | FID servidor ↓ | FDr⁵ papel ↓ | FDr⁵ servidor ↓ | Semillas |
|---|---:|---:|---:|---:|---:|
| RePrime-L / 160 | 1,155 | 1,1549 | 6,43 | 6,4298 | 3 |
| RePrime-B / 160, block 8 | 1,268 | 1,2684 | 9,82 | 9,8179 | 3 |
| RePrime-B / 160 | 1,303 | 1,2966 | 10,20 | 10,2089 | 3 |
| RePrime-J / B, refinado 25k | 1,224 | 1,2284 | 10,60 | 10,5924 | 2 |
| RePrime-J / B, nativo 200k | 2,47 | 2,4705 | 9,75 | 9,7465 | 1 |
| Priming-B / 160 (oficial) | 1,373 | 1,3733 | 11,27 | 11,2654 | 3 |
| Priming-L / 160 (oficial) | 1,174 | 1,1738 | 7,41 | 7,4138 | 3 |

Nota del autor: el FID 1,303 de RePrime-B en el papel promedia seis evaluaciones del mismo checkpoint; la media registrada de tres semillas es 1,2966, dentro de la variación reportada. RePrime-J refinado se evaluó con dos semillas en el servidor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; como referencia, el checkpoint L post-entrenamiento ocupa 6,48 GB y el B 1,84 GB en disco, por lo que en FP32 el peso del modelo L ronda esa cifra y requiere al menos una GPU con holgura por encima de 8 GB; el B puede caber en GPUs de 4-8 GB según el lote.
- GPU recomendadas: no especificadas por el autor; por tamaño de checkpoint, una RTX 4090 (24 GB) o A100/H100 son adecuadas para lotes grandes y evaluación con 4 rangos.
- ¿Cabe en GPU de consumo? El checkpoint B (1,84 GB) es plausible en GPUs de consumo con suficiente VRAM; el L (6,48 GB) requiere GPUs de gama alta de consumo o superior. No hay cifras oficiales de VRAM.
- Opciones de despliegue: el autor publica código de muestreo (`scripts/sample.py`) y evaluación (`scripts/eval_paper.sh`) basados en PyTorch. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles. El modelo opera con 1 NFE, lo que reduce el coste frente a generadores multi-paso, pero no se publican cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | FID ImageNet-256 (1 NFE) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RePrime-L / 160 | No disponible (ckpt 6,48 GB) | No aplica | 1,155 | Apache 2.0 | Pesos en HF |
| RePrime-B / 160 | No disponible (ckpt 1,84 GB) | No aplica | 1,303 | Apache 2.0 | Pesos en HF |
| Priming-L / 160 (oficial) | No disponible | No aplica | 1,174 | No disponible en la información | Referencia oficial |
| Priming-B / 160 (oficial) | No disponible | No aplica | 1,373 | No disponible en la información | Referencia oficial |

La comparativa se limita a los Priming oficiales citados en la model card, que son la línea base directa. No se dispone de datos de otros generadores one-step comparables en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre ImageNet-1k: las clases y la distribución de imágenes están limitadas a ese conjunto; no generaliza a dominios arbitrarios.
- Sujeto a los Términos de Acceso de ImageNet además de la licencia Apache 2.0 de código y pesos.
- Uso previsto solo para investigación en modelado generativo; el autor prohíbe explícitamente generar contenido engañoso o dañino.
- No es un modelo de lenguaje: no procesa texto, no tiene contexto textual ni capacidades multilingües.
- Riesgo de sesgos heredados de ImageNet (representación desigual de clases, estereotipos visuales).
- El FID bajo no garantiza diversidad: RePrime-J nativo muestra FDr⁵ de 9,75 frente a 10,60 del refinado, y la receta aborda precisamente el colapso de diversidad en la ruta generativa.
- Sin datos publicados de cuantización, latencia ni VRAM oficial; la planificación de producción requiere mediciones propias.
- El paper figura como "coming soon" en la model card, por lo que la revisión por pares aún no está disponible.
- Los checkpoints de stage-1 incluyen estado del optimizador y requieren `--stage pretraining`; usar el checkpoint equivocado altera los resultados.

## Enlaces

- Hugging Face: https://huggingface.co/Lixiaoming/RePrime
- Página del proyecto: https://mingxiao-li.github.io/RePrime/
- Código: https://github.com/Mingxiao-Li/RePrime
- Paper (próximamente): https://mingxiao-li.github.io/RePrime/
- Términos de acceso de ImageNet: https://image-net.org/download.php
