# luoxd96/ELF

## Resumen

ELF (Ensemble Learning of Foundation models) es un codificador a nivel de diapositiva (slide-level) para patología computacional, desarrollado por el Li Lab de la Universidad de Stanford. Agrega los embeddings de parches (tiles) generados por cinco modelos fundacionales de patología —UNI, CONCH v1.5, Prov-GigaPath, Virchow2 y H-optimus-0— en una representación unificada de la diapositiva completa. El modelo resuelve el problema de combinar múltiples representaciones de tejido para tareas de oncología de precisión, como clasificación de subtipos, predicción de biomarcadores y estudios de respuesta a terapia.

Arquitectónicamente, ELF es un agregador ABMIL (attention-based multiple instance learning) con 8 cabezas y mecanismo de gating, precedido de una interpolación y una capa LayerNorm. Tiene aproximadamente 151 000 parámetros y un tamaño de 0,6 MB, lo que lo hace extremadamente ligero. El modelo fue entrenado con 53 699 diapositivas de 20 sitios anatómicos. Su relevancia actual radica en que permite unificar las capacidades de varios modelos fundacionales de patología sin necesidad de reentrenar los codificadores de parches, facilitando la investigación traslacional en patología digital.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ABMIL con 8 cabezas y gating, precedido de interpolación y LayerNorm |
| Parametros totales | ~151 000 (0,6 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (procesa características de parches, no texto) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante estándar de PyTorch) |
| Idiomas soportados | no aplica (modelo de visión/patología, sin procesamiento de lenguaje) |
| Licencia | GPLv3, uso académico no comercial |
| Formato de pesos | PyTorch (.pth), safetensors no disponible |

## Arquitectura y entrenamiento

ELF es un agregador a nivel de diapositiva basado en ABMIL (attention-based multiple instance learning). El pipeline interno es: interpolación de las características de entrada → LayerNorm → 8 cabezas de atención con gating → agregación ponderada. La entrada son características de parches \(X \in \mathbb{R}^{N \times C}\), donde \(C\) puede ser 768, 1024, 1280 o 1536 según el modelo fundacional de origen. La salida incluye un vector `features_dim` de dimensión \(C\), un vector `features` de 768 dimensiones y los pesos de atención por parche.

El entrenamiento se realizó con 53 699 diapositivas completas (WSI) de 20 sitios anatómicos, utilizando los cinco modelos fundacionales mencionados como extractores de características de parches a 10× de magnificación (protocolo CLAM). El modelo publicado en este repositorio es el `momentum_enc` entrenado, usado solo para inferencia, no el snapshot de entrenamiento MoCo. El ensemble del paper consiste en la concatenación de los cinco vectores `features_dim` (uno por cada modelo de tiles), no un promedio. Para Virchow2, las características de dimensión ≥ 2560 se reducen promediando CLS y la media, obteniendo 1280 dimensiones.

## Capacidades

- Extracción de representaciones a nivel de diapositiva completa a partir de embeddings de parches precalculados.
- Agregación de características de cinco modelos fundacionales de patología (UNI, CONCH v1.5, Prov-GigaPath, Virchow2, H-optimus-0) en un único vector por diapositiva.
- Generación de pesos de atención por parche, lo que permite interpretabilidad sobre qué regiones del tejido son más relevantes.
- Soporte para clasificación de subtipos tumorales, predicción de biomarcadores y análisis de respuesta a terapia mediante fine-tuning lineal sobre las características concatenadas.
- Compatible con pipelines de extracción por lotes desde archivos h5 de estilo CLAM.
- No es un modelo generativo ni multimodal en el sentido de texto; no soporta tool calling ni razonamiento multi-paso.

## Casos de uso

- Clasificación de subtipos de cáncer: se extraen los embeddings de parches con los cinco modelos fundacionales, se concatenan los `features_dim` de ELF y se entrena un clasificador lineal para distinguir subtipos histológicos. ELF unifica las señales de varios modelos, mejorando la robustez frente a variaciones de tinción y preparación.
- Predicción de biomarcadores moleculares: a partir de diapositivas H&E, se pueden predecir mutaciones o estados de expresión génica (p. ej. PD-L1) usando las características agregadas, lo que evita ensayos moleculares costosos.
- Estudio de respuesta a inmunoterapia: las representaciones de diapositiva de ELF pueden alimentar modelos de supervivencia o clasificadores binarios para identificar pacientes respondedores, integrando la información de múltiples modelos fundacionales.
- Estratificación de pacientes en ensayos clínicos: las características concatenadas sirven como entrada para clustering o modelos de riesgo, ayudando a seleccionar cohortes homogéneas.
- Análisis de supervivencia: combinando las características de ELF con datos clínicos, se pueden entrenar modelos de riesgos proporcionales de Cox para estimar pronóstico.
- Integración con sistemas de patología digital existentes: al ser un agregador ligero, puede insertarse en pipelines que ya usan CLAM o los modelos fundacionales, añadiendo una capa de ensemble sin reentrenar los extractores de parches.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas (p. ej. AUC, precisión) ni comparaciones con otros agregadores. Se recomienda consultar el paper en arXiv (2508.16085) para datos de evaluación, aunque no están reproducidos en este repositorio.

## Requisitos de hardware

- El agregador ELF en sí es extremadamente ligero (~0,6 MB, 151k parámetros). Puede ejecutarse en CPU sin problemas y en cualquier GPU, incluso integradas.
- La inferencia del agregador tiene latencia despreciable (del orden de milisegundos) y throughput limitado solo por la carga de datos.
- Sin embargo, el pipeline completo requiere ejecutar los cinco modelos fundacionales de tiles (UNI, CONCH v1.5, Prov-GigaPath, Virchow2, H-optimus-0), que son redes profundas de cientos de millones de parámetros. Para procesar diapositivas completas se recomienda una GPU con al menos 16 GB de VRAM (p. ej. RTX 4090, A100) y, para conjuntos grandes, múltiples GPUs o procesamiento por lotes.
- Opciones de despliegue: el repositorio proporciona scripts de extracción por lotes (`extract_multiple_model_slide_embedding.py`) que cargan los checkpoints de los modelos fundacionales y ELF. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Para uso en producción, se puede exportar el modelo a TorchScript u ONNX para acelerar la inferencia, aunque no se documenta en la model card.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros agregadores a nivel de diapositiva (p. ej. los basados en transformers como SlideTransformer o los ABMIL clásicos de CLAM) en la información proporcionada. La model card no incluye tablas de rendimiento relativo. Se puede señalar que ELF se diferencia de los agregadores convencionales por su naturaleza de ensemble sobre cinco modelos fundacionales, pero no hay métricas numéricas para comparar. Por tanto, la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Requiere embeddings de parches preextraídos de los cinco modelos fundacionales específicos; no procesa imágenes RGB directamente. Si se usa otro extractor de tiles, el modelo no funcionará.
- Para Virchow2, las características de dimensión ≥ 2560 se reducen promediando CLS y la media, lo que puede perder información si el usuario no sigue este preprocesamiento.
- Licencia GPLv3 con uso académico no comercial: no está permitido su uso en productos comerciales o aplicaciones clínicas sin licencia adicional.
- No es un dispositivo diagnóstico: la model card advierte explícitamente que no debe usarse para decisiones clínicas sin validación independiente.
- Riesgo de sesgo: entrenado con 53 699 WSI de 20 sitios anatómicos, puede tener menor rendimiento en tipos de tejido o poblaciones subrepresentadas.
- Al ser un agregador, no corrige errores de los modelos fundacionales subyacentes; si un extractor de tiles produce embeddings de baja calidad, la representación final se verá afectada.
- No hay información sobre alucinación (no aplica, al no ser generativo), pero sí sobre la dependencia de la calidad de los datos de entrada.

## Enlaces

- HuggingFace: https://huggingface.co/luoxd96/ELF
- Paper (arXiv): https://arxiv.org/abs/2508.16085
- Código (GitHub): https://github.com/lilab-stanford/ELF
