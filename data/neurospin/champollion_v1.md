# neurospin/Champollion_V1

## Resumen

Champollion V1 es una colección de 56 modelos preentrenados con Barlow Twins (aprendizaje autosupervisado) que generan representaciones vectoriales compactas de patrones de plegamiento cortical a partir de resonancias magnéticas T1 de cerebro. Lo desarrolla NeuroSpin, centro de neuroimagen del CEA francés, y se publica en Hugging Face bajo el identificador `neurospin/Champollion_V1`. No es un modelo de lenguaje: es un extractor de características 3D orientado a neuroimagen, con pipeline `feature-extraction` y backbone convolucional.

El modelo resuelve un problema concreto de la investigación en neuroanatomía: convertir la variabilidad individual del plegamiento cortical (surcos y giros) en vectores numéricos comparables entre sujetos. Cada fold del repositorio corresponde a una región sulcal y un hemisferio (28 regiones × 2 hemisferios), de modo que un sujeto produce 56 embeddings independientes. Estos vectores sirven para clasificación, clustering y análisis poblacional.

Es relevante ahora porque el pipeline asociado (`champollion_pipeline`) permite pasar de una MRI T1 en bruto a embeddings en producción, con una demo interactiva en Hugging Face Spaces para pruebas puntuales. El repositorio ocupa 3,7 GB y los pesos se distribuyen en formato PyTorch (`.pt`), no en safetensors ni GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Barlow Twins (aprendizaje autosupervisado) con backbone CNN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada 3D, no secuencial) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (metadatos de la model card) |
| Licencia | CeCILL-B |
| Formato de pesos | PyTorch (`best_model_weights.pt` por fold) |

## Arquitectura y entrenamiento

Champollion V1 emplea el marco de aprendizaje autosupervisado Barlow Twins sobre un backbone de red neuronal convolucional. La entrada son crops 3D de regiones sulcales del cerebro, no volúmenes completos: el pipeline previo segmenta y extrae tiles corticales por región. La salida es un vector de embedding de tamaño fijo por sujeto y región. El repositorio contiene 56 folds independientes, uno por cada combinación de región sulcal (28) y hemisferio (2).

El entrenamiento se realizó sobre datos de UK Biobank, según la model card. No se especifican en la información disponible el número de tokens (no aplica), el número exacto de sujetos, la composición del dataset, ni si hubo etapas de ajuste fino supervisado. Cada fold incluye su configuración de entrenamiento en `.hydra/config.yaml`, lo que permite reproducir hiperparámetros, pero esos valores no se detallan en la información proporcionada. La organización por versiones de máscaras (`canonical_corrected_26_1` como última versión, `canonical_25` como anterior) indica que los modelos están acoplados a una versión concreta de las máscaras de regiones sulcales.

## Capacidades

- Extracción de embeddings de patrones de plegamiento cortical a partir de MRI T1 3D preprocesada.
- Generación de 56 vectores por sujeto (28 regiones sulcales × 2 hemisferios).
- Aprendizaje autosupervisado: no requiere etiquetas para producir representaciones.
- Soporte para tareas downstream de clasificación, clustering y análisis poblacional sobre los embeddings.
- Procesamiento por lotes mediante el pipeline oficial (`champollion_pipeline`), con uso de todas las CPU y GPU disponibles.
- Demo interactiva para un único sujeto en Hugging Face Spaces (2 núcleos de CPU).
- No soporta tool calling, agentes, razonamiento multi-step, visión natural, audio ni generación de texto.

## Casos de uso

- **Estudios de asociación entre plegamiento cortical y fenotipos**: extraer los 56 embeddings por sujeto y usarlos como variables predictoras en modelos estadísticos o de machine learning para relacionar morfología cortical con variables clínicas o cognitivas.
- **Clustering poblacional de morfología cerebral**: agrupar cohortes por similitud de embeddings para identificar subtipos anatómicos, aprovechando que los vectores son compactos y comparables entre sujetos.
- **Clasificación de sujetos con modelos supervisados ligeros**: entrenar clasificadores (SVM, regresión logística, gradient boosting) sobre los embeddings como alternativa a pipelines de morfometría clásica.
- **Búsqueda de biomarcadores regionales**: analizar por separado los folds de cada región sulcal para localizar qué áreas contribuyen más a una diferencia entre grupos (por ejemplo, controles frente a patología).
- **Procesamiento por lotes en infraestructura propia**: ejecutar `champollion_pipeline` sobre un directorio de dataset completo para generar embeddings a escala, con paralelización en CPU y GPU.
- **Validación rápida de hipótesis**: usar la demo de Hugging Face Spaces para obtener embeddings de un único sujeto antes de comprometer recursos de cómputo en un estudio completo.
- **Reproducibilidad de análisis neuroimagen**: fijar la versión de máscaras (`canonical_corrected_26_1`) y los pesos por fold para replicar exactamente los embeddings en estudios multicéntricos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio completo pesa 3,7 GB, pero cada fold se carga de forma independiente.
- GPU recomendadas: no especificadas. El pipeline oficial soporta uso de GPU, pero no se detallan modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- La demo en Hugging Face Spaces funciona con 2 núcleos de CPU para un único sujeto, lo que sugiere que la inferencia por fold es ligera.
- Opciones de despliegue: `champollion_pipeline` (instalación vía `pixi run install-all` o `./install.sh`), con ejecución local en CPU/GPU. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. La model card indica "minutos" para un sujeto en la demo de 2 núcleos, sin cifras concretas.

## Comparativa con modelos similares

No se dispone en la información proporcionada de modelos comparables de la misma categoría (embeddings de plegamiento cortical con Barlow Twins). Se indica "no disponible".

## Limitaciones y advertencias

- Solo procesa MRI T1 preprocesada con el pipeline oficial; no acepta volúmenes en bruto sin el paso previo de Morphologist y extracción de tiles corticales.
- Acoplado a una versión concreta de máscaras (`canonical_corrected_26_1`); cambiar de versión invalida la comparabilidad de embeddings.
- El entrenamiento se basa en UK Biobank, por lo que puede presentar sesgos poblacionales del cohorte (composición demográfica y de adquisición no detallada en la información disponible).
- Riesgo de generalización limitada a escáneres, protocolos o poblaciones distintas de las de entrenamiento; no se documentan evaluaciones de robustez fuera de dominio.
- Licencia CeCILL-B: permite uso y redistribución con obligaciones de atribución y copyleft compatible con BSD; conviene revisar el archivo `LICENSE` antes de uso comercial.
- Los metadatos declaran idioma `en`, pero el modelo no procesa texto; el campo es irrelevante para su función real.
- Sin datos publicados de benchmarks, parámetros totales ni latencia, la evaluación de calidad debe hacerse empíricamente en la cohorte de interés.
- Cero descargas registradas en Hugging Face en el momento de la consulta: ecosistema de usuarios aún muy reducido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neurospin/Champollion_V1
- Demo interactiva: https://huggingface.co/spaces/neurospin/Champollion_demo
- Pipeline oficial: https://github.com/neurospin/champollion_pipeline
- Licencia CeCILL-B: https://huggingface.co/neurospin/Champollion_V1/blob/main/LICENSE
