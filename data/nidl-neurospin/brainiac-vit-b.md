# nidl-neurospin/brainiac-vit-b

## Resumen

BrainIAC ViT-B es un modelo fundacional de visión 3D para resonancia magnética estructural cerebral, desarrollado originalmente por el equipo de KannLab (AIM-KannLab) y redistribuido en Hugging Face por nidl-neurospin (NeuroSpin). Se trata de un Vision Transformer 3D de tipo base con parches de 16³, preentrenado de forma auto-supervisada con SimCLR sobre volúmenes de RM cerebral de varias secuencias. Su propósito es servir como extractor de características congeladas o como inicialización para ajuste fino en tareas clínicas y neurocientíficas: predicción de edad cerebral, clasificación de mutación IDH, clasificación de deterioro cognitivo leve, supervivencia en glioma y tiempo hasta ictus, entre otras.

El modelo resuelve el problema de la escasez de datos etiquetados en neuroimagen, ofreciendo representaciones genéricas de volúmenes cerebrales que pueden reutilizarse con pocas muestras. La versión publicada incluye el codificador (88,3 M de parámetros) y la cabeza de proyección del preentrenamiento SimCLR, con un total de 90.514.688 parámetros según los pesos en safetensors. Genera características de 768 dimensiones a partir de entradas de 1 × 96 × 96 × 96 vóxeles.

Es relevante ahora porque consolida la línea de modelos fundacionales en neuroimagen estructural con validación en tareas clínicas diversas y porque su integración en la librería nidl facilita el uso reproducible (preprocesado incluido, configuración declarativa y compatibilidad con PyTorch). La licencia, sin embargo, es estrictamente de investigación, lo que limita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer 3D (ViT-B) con parches de 16³, preentrenado con SimCLR |
| Parametros totales | 90.514.688 (codificador: 88,3 M; resto: cabeza de proyección) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (entrada fija de 1 × 96 × 96 × 96 vóxeles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de imagen médica, sin capacidades lingüísticas) |
| Licencia | BrainIAC Research-Only (solo investigación académica y educación, no comercial) |
| Formato de pesos | safetensors (repo de 0,7 GB), más config.yaml y preprocessor_config.yaml |

## Arquitectura y entrenamiento

El codificador es un `VisionTransformer3D` de configuración base: divide el volumen en parches cúbicos de 16 × 16 × 16 vóxeles, los proyecta a un espacio de 768 dimensiones y aplica atención multi-cabeza sobre la secuencia de parches. El modelo original no emplea token de clase: devuelve el primer token de parche. La implementación de nidl promedia los tokens de parche tras la normalización final, por lo que sus características difieren de las del código original (la cabeza de proyección se entrenó sobre el primer token de parche). El codificador reproduce los tokens originales con una tolerancia de 1e-6.

El preentrenamiento es auto-supervisado con SimCLR sobre RM cerebral estructural de varias secuencias, con el objetivo contrastivo de acercar representaciones de vistas aumentadas del mismo volumen. La model card no detalla el número de tokens, la composición exacta del dataset ni si hubo etapas posteriores de ajuste con supervisión; esos datos deben consultarse en el artículo asociado (Nature Neuroscience, 2026). La innovación práctica está en el pipeline de preprocesado reproducible: cráneo eliminado con HD-BET, corrección de sesgo N4, registro rígido a la plantilla BrainIAC (170 × 206 × 162 a 1 mm, LAS) y remuestreo a 96³ con estandarización de vóxeles cerebrales.

## Capacidades

- Extracción de características de volúmenes de RM cerebral estructural en 3D (embedding de 768 dimensiones por volumen).
- Aprendizaje auto-supervisado contrastivo (SimCLR) como base para representaciones genéricas.
- Ajuste fino supervisado mediante `fit` de la API de nidl para tareas de clasificación y regresión.
- Uso como extractor congelado con regresión ridge u otros clasificadores lineales sobre las características.
- Preprocesado integrado (`BrainIACPreprocessing`) y utilidad de recorte (`crop`) para volúmenes registrados a otras plantillas 1 mm LAS.
- Compatibilidad con varias secuencias de RM estructural (según el preentrenamiento declarado por los autores).
- No soporta tool calling, agentes, generación de texto, visión 2D, audio ni capacidades multilingües.

## Casos de uso

- Predicción de edad cerebral: se extraen características congeladas del volumen preprocesado y se ajusta una regresión ridge o una cabeza lineal; el modelo es adecuado porque sus representaciones capturan morfometría global sin necesidad de etiquetas durante el preentrenamiento. En OpenBHB (757 participantes) se reporta MAE de 6,47 años y R² de 0,47.
- Clasificación de mutación IDH en glioma: ajuste fino del codificador con un conjunto etiquetado de RM estructural; la inicialización auto-supervisada reduce la necesidad de datos anotados.
- Clasificación de deterioro cognitivo leve: uso del codificador como extractor y clasificador ligero para cribado a partir de RM estructural, con validación externa recomendada.
- Análisis de supervivencia en glioma: extracción de embeddings por paciente para modelos de supervivencia (p. ej., Cox) o ajuste fino con pérdidas de supervivencia.
- Predicción de tiempo hasta ictus: regresión sobre características congeladas en cohortes longitudinales, útil por la reutilización de un mismo extractor en varios estudios.
- Investigación en neuroimagen a gran escala: generación de embeddings de 768 dimensiones para análisis de similitud entre sujetos, clustering de fenotipos o búsqueda de vecinos en cohortes como OpenBHB.
- Preentrenamiento transferible en pipelines de investigación: inicialización de modelos para nuevas tareas cuando el número de volúmenes etiquetados es reducido.

## Benchmarks y rendimiento

La model card solo reporta un resultado de fidelidad y una evaluación congelada; no se publican tablas comparativas de benchmarks clínicos en la información disponible.

| Evaluacion | Metrica | Valor |
|---|---|---|
| OpenBHB test (757 participantes, recortado al FOV, sin registro a plantilla), ridge sobre características congeladas | MAE edad | 6,47 años |
| OpenBHB test, misma configuración | R² | 0,47 |
| Fidelidad del codificador frente a implementación independiente del original | Diferencia máxima de tokens | 1e-6 |

No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K ni métricas equivalentes, que no aplican a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en fp32 (90,5 M de parámetros, ~0,36 GB) y activaciones para lotes pequeños de volúmenes 96³, el consumo típico se sitúa en el rango de 2 a 6 GB según tamaño de lote; no se dispone de cifras oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para inferencia por lotes pequeños; A100 o H100 para ajuste fino con lotes mayores.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4070, RTX 4090 y similares, siempre que el lote sea moderado.
- Opciones de despliegue: la vía oficial es la librería nidl (`pip install nidl[hub]`) sobre PyTorch; no se documentan exportaciones a GGUF, ONNX, vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Preentrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BrainIAC ViT-B (este) | 90,5 M (codificador 88,3 M) | 1 × 96 × 96 × 96 | SimCLR sobre RM estructural multicsecuencia | Research-only | Hugging Face (nidl-neurospin) y GitHub original |
| Alternativas de modelo fundacional en RM cerebral | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos verificables sobre modelos comparables de la misma categoría (por ejemplo, otros modelos fundacionales 3D de RM cerebral) para establecer una comparación cuantitativa; se indica "no disponible" en lugar de inferir cifras.

## Limitaciones y advertencias

- Licencia BrainIAC Research-Only: uso limitado a investigación académica y educación; no se permite uso comercial.
- El modelo está diseñado exclusivamente para RM cerebral estructural preprocesada (HD-BET, N4, registro a plantilla BrainIAC, 96³); entradas fuera de ese pipeline degradan las características.
- Diferencia respecto al original: nidl promedia los tokens de parche, mientras que el modelo original devuelve el primer token; las características no son idénticas y los resultados publicados con el código original pueden no reproducirse exactamente.
- Riesgo de sesgo poblacional: el preentrenamiento se realizó sobre cohorts de RM cuyo detalle no se especifica en la model card; la generalización a otras poblaciones, escáneres y protocolos requiere validación.
- No es un dispositivo médico ni un sistema de diagnóstico: los resultados clínicos (IDH, deterioro cognitivo, supervivencia) son de investigación y no deben usarse para decisiones asistenciales.
- Sin capacidades de texto, tool calling ni agentes; no aplica el uso como asistente conversacional.
- El rendimiento congelado reportado (MAE 6,47 años, R² 0,47 en OpenBHB) es moderado y depende del preprocesado; el ajuste fino puede mejorar o degradar según la tarea.
- No se documentan cuantizaciones ni formatos alternativos de pesos, lo que limita el despliegue en entornos sin PyTorch.

## Enlaces

- Hugging Face: https://huggingface.co/nidl-neurospin/brainiac-vit-b
- Artículo: https://doi.org/10.1038/s41593-026-02202-6
- Código y pesos originales: https://github.com/AIM-KannLab/BrainIAC
- Documentación de nidl: https://neurospin-deepinsight.github.io/nidl
- Ejemplo de ajuste fino en OpenBHB: https://neurospin-deepinsight.github.io/nidl/auto_examples/plot_pretrained_openbhb.html
- Repositorio de nidl: https://github.com/neurospin-deepinsight/nidl
