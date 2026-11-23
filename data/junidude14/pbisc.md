# junidude14/PBISC

## Resumen

PBISC (identificador `junidude14/PBISC`) es un modelo publicado en Hugging Face por el usuario junidude14, orientado a tareas de difusión aplicadas a datos biomédicos de secuenciación de ARN. Según las etiquetas del repositorio, el modelo trabaja con `bulk-rna-seq` y `single-cell-rna-seq`, lo que lo sitúa en el ámbito de la biología computacional generativa más que en el del procesamiento de lenguaje natural. El repositorio está etiquetado con `diffusion` y `pytorch`, y almacena pesos en formato `safetensors`.

La información pública disponible es muy limitada: no se especifican arquitectura concreta, número de parámetros, longitud de contexto, licencia ni idiomas soportados. El repositorio tiene un tamaño de 365,1 GB, lo que sugiere un modelo de gran escala o un conjunto de pesos con múltiples variantes, aunque no es posible confirmar la cifra de parámetros a partir de los datos proporcionados. El acceso está restringido (gated): es necesario aceptar condiciones en Hugging Face para descargar los pesos.

El modelo es relevante por su enfoque en datos de expresión génica, un área donde los modelos generativos basados en difusión están ganando terreno para tareas de imputación, generación condicionada y modelado de distribuciones celulares. No obstante, la ausencia de documentación técnica, benchmarks y licencia clara limita seriamente su evaluación y su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | difusión (según tag `diffusion`); detalles específicos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a datos de secuenciación, no a texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

La única información disponible indica que se trata de un modelo de difusión implementado en PyTorch y empaquetado en `safetensors`. El dominio de aplicación declarado son datos de secuenciación de ARN, tanto `bulk-rna-seq` como `single-cell-rna-seq`, y el dataset asociado es `junidude14/PBISC-data`. No se han publicado detalles sobre el tipo de proceso de difusión (DDPM, score-based, flow matching, etc.), la dimensionalidad de la entrada, el número de pasos de muestreo ni la composición o tamaño del conjunto de entrenamiento.

Tampoco hay información sobre si el entrenamiento incluyó ajuste fino supervisado, RLHF, DPO u otras etapas de alineación, ni sobre innovaciones técnicas como decodificación especulativa o atención lineal. El tamaño del repositorio (365,1 GB) es el único indicador cuantitativo disponible y sugiere pesos de gran volumen, pero sin confirmación de la arquitectura subyacente.

## Capacidades

- Modelado generativo de datos de expresión génica mediante difusión, según los tags del repositorio.
- Aplicación declarada a datos de `bulk-rna-seq` y `single-cell-rna-seq`.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de capacidades de agente ni de razonamiento multi-paso.
- No hay información sobre capacidades multilingües (el modelo no parece orientado a texto).
- No se documentan capacidades especiales como modo de pensamiento, visión o audio.

## Casos de uso

- Generación sintética de perfiles de expresión génica: el modelo podría emplearse para muestrear distribuciones de expresión condicionadas a etiquetas biológicas, útil para aumentar datasets pequeños en estudios de single-cell.
- Imputación de datos de secuenciación: en escenarios de dropout frecuente en single-cell RNA-seq, un modelo de difusión puede reconstruir valores faltantes, aunque la falta de documentación impide confirmar esta funcionalidad.
- Aumento de datos para entrenamiento de clasificadores celulares: generar muestras sintéticas que amplíen la variabilidad de tipos celulares en pipelines de anotación automática.
- Simulación de perturbaciones génicas in silico: explorar respuestas transcripcionales hipotéticas antes de validación experimental, si el modelo admite condicionamiento.
- Análisis exploratorio de cohorts bulk RNA-seq: modelar la distribución conjunta de genes para detectar muestras atípicas o estados transcripcionales raros.
- Investigación metodológica en difusión aplicada a biología: servir como referencia reproducible para comparar arquitecturas de difusión en datos ómicos, dado que los pesos están en `safetensors`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio (365,1 GB) impide alojarlo íntegramente en GPUs de consumo sin cuantización o selección de subconjuntos de pesos.
- GPU recomendadas: no disponibles; por volumen de pesos, un despliegue completo requeriría GPUs de centro de datos (A100 80 GB, H100 80 GB) o múltiples unidades, pero no hay confirmación oficial.
- Viabilidad en GPU de consumo: no confirmada; probablemente inviable en RTX 4090 (24 GB) sin técnicas de reducción de memoria no documentadas.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo de difusión para datos ómicos, requeriría un runtime específico de PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de difusión para datos de RNA-seq con los que establecer una comparación rigurosa de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no hay model card con arquitectura, datos de entrenamiento ni métricas, lo que impide evaluar su validez científica.
- Licencia no especificada: no es posible determinar si se permite uso comercial, modificación o redistribución.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que añade fricción para reproducibilidad.
- Riesgo de sesgo en los datos biológicos subyacentes: sin información sobre la composición del dataset `junidude14/PBISC-data`, no puede descartarse un sesgo hacia tejidos, poblaciones o plataformas de secuenciación concretas.
- Riesgo de alucinación biológica: en modelos generativos de expresión, las muestras sintéticas pueden no corresponder a estados biológicos válidos; se requiere validación experimental.
- Tamaño del repositorio (365,1 GB) y ausencia de cuantizaciones documentadas: dificulta el despliegue en infraestructuras modestas.
- Sin benchmarks ni validación por pares: no recomendable para producción ni para decisiones biomédicas sin evaluación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/junidude14/PBISC
- Dataset asociado: https://huggingface.co/datasets/junidude14/PBISC-data (referenciado en los tags; disponibilidad no verificada)
