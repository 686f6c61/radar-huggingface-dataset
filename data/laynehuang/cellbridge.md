# LayneHuang/CellBridge

## Resumen

CellBridge es un marco de predicción de imágenes de morfología celular Cell Painting a partir de perturbaciones genéticas y químicas, desarrollado por LayneHuang. El modelo se basa en un puente de Schrödinger con restricciones biológicas (Biologically-Constrained Schrödinger Bridge, BCSB), una técnica de difusión que genera imágenes sintéticas de fenotipos celulares condicionadas a la perturbación aplicada (compuestos químicos, ARN interferente o ediciones CRISPR).

El repositorio de Hugging Face contiene los checkpoints entrenados para tres conjuntos de datos de referencia: BBBC021 (compuestos químicos), RxRx1 (genes mediante siRNA) y cpg0000/JUMP (perturbaciones multimodales). El modelo está pensado para la investigación en biología celular y descubrimiento de fármacos, donde permite explorar de forma computacional el efecto de perturbaciones sin necesidad de realizar experimentos de laboratorio a gran escala. El código fuente está disponible en GitHub y los pesos se distribuyen bajo licencia MIT, lo que facilita su uso en entornos académicos e industriales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Puente de Schrödinger con restricciones biológicas (BCSB) sobre difusión; detalles de red subyacente no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de generación de imágenes, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica, genera imágenes) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

La arquitectura de CellBridge se describe como un puente de Schrödinger con restricciones biológicas, una variante de los modelos de difusión que aprende a transformar una distribución de imágenes de control (sin perturbación) a una distribución de imágenes de células perturbadas, condicionada por la perturbación introducida. A diferencia de los difusores clásicos, el puente de Schrödinger optimiza el transporte óptimo entre ambas distribuciones, lo que permite generar imágenes que respetan restricciones biológicas del sistema. El entrenamiento se realiza por separado para cada dataset: BBBC021 con 26 compuestos químicos emparejados con CellFlux, RxRx1 con 1042 genes mediante siRNA, y cpg0000/JUMP con perturbaciones CRISPR, compuestos y ORF. Los checkpoints publicados corresponden a pasos específicos de entrenamiento (490 000, 140 000 y 290 000 respectivamente). No se especifica el número de parámetros, el tamaño del dataset de entrenamiento, ni si se emplearon técnicas como RLHF o DPO, que no aplican en este dominio.

## Capacidades

- Generación de imágenes de morfología celular Cell Painting a partir de perturbaciones genéticas (siRNA, CRISPR) y químicas (compuestos).
- Generación condicionada por el tipo de perturbación, lo que permite explorar el efecto fenotípico de forma sintética.
- Soporte de múltiples modalidades de entrada (genética, química y ORF) en el dataset cpg0000/JUMP.
- Evaluación integrada: el repositorio incluye métricas JSON y ejemplos de imágenes generadas para las evaluaciones reportadas.
- Reentrenamiento y ajuste fino por dataset con recetas específicas (p. ej., fine-tuning en dos etapas con CFG para BBBC021).
- No incluye capacidades de lenguaje, razonamiento, tool calling ni agentes; es un modelo de generación de imágenes especializado.

## Casos de uso

- Descubrimiento de fármacos: generar imágenes de morfología celular para compuestos candidatos sin necesidad de realizar ensayos de laboratorio, acelerando la preselección de candidatos.
- Estudio de efectos genéticos: simular el fenotipo celular tras el silenciamiento de genes mediante siRNA, útil para identificar genes con papel en enfermedades.
- Validación de hipótesis de mecanismo de acción: comparar imágenes sintéticas de compuestos con imágenes reales para predecir el mecanismo de acción de un fármaco.
- Entrenamiento de clasificadores de fenotipos: usar imágenes sintéticas como aumento de datos para entrenar modelos de clasificación de morfología celular.
- Análisis de datos JUMP: integrar el modelo en pipelines de análisis del dataset JUMP para explorar efectos de CRISPR, compuestos y ORF de forma multimodal.
- Reproducción de experimentos: usar los checkpoints publicados para reproducir los resultados del paper y comparar con otros métodos de generación de imágenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que los checkpoints publicados "matching the numbers reported in the paper", pero no se detallan las métricas concretas (p. ej., FID, IS, u otras específicas de Cell Painting). Los resultados de evaluación se incluyen en el repositorio, pero no se muestran en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible; depende del tamaño del checkpoint (4.9 GB de repositorio completo) y de la resolución de las imágenes generadas.
- GPU recomendadas: no disponible; se puede asumir que requiere una GPU con al menos 16-24 GB de VRAM para inferencia, pero no se ha confirmado.
- Compatibilidad con GPU de consumo: no confirmada; dado que los checkpoints se cargan con PyTorch, podría ejecutarse en GPUs de consumo (p. ej., RTX 3090/4090) si la memoria lo permite, pero no se ha documentado.
- Opciones de despliegue: no se documentan integraciones con vLLM, Ollama o TGI; el uso indicado es cargar el checkpoint directamente con PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables de generación de imágenes Cell Painting con puente de Schrödinger en la información proporcionada. Se recomienda consultar la literatura de Cell Painting (p. ej., métodos basados en GAN o difusión) para comparaciones, pero no hay datos de referencia en el repositorio.

## Limitaciones y advertencias

- El modelo está especializado en generación de imágenes de morfología celular; no es adecuado para tareas de lenguaje o razonamiento.
- No se han publicado métricas de evaluación concretas en la información disponible; los resultados deben consultarse en el repositorio o el paper asociado.
- El entrenamiento está limitado a los tres datasets mencionados; la generalización a otras plataformas de Cell Painting o tipos de perturbación no está garantizada.
- La licencia MIT permite uso comercial, pero se recomienda verificar la licencia de los datasets (p. ej., RxRx1, JUMP) antes de uso en producción.
- Existe un proyecto homónimo "CellBRIDGE" (ICML 2026) sobre trayectorias celulares en scRNA-seq, distinto de este modelo; no confundir ambos.
- No se documentan sesgos específicos, pero como todo modelo generativo, existe riesgo de alucinación de estructuras celulares irreales en condiciones no representadas en el entrenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LayneHuang/CellBridge
- Código fuente: https://github.com/Layne-Huang/CellBridge (rama `unified-eval`)
- Paper asociado: no disponible en la información proporcionada (se menciona "the paper" pero sin enlace directo).
