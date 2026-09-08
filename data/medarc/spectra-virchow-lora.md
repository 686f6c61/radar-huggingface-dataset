# medarc/spectra-virchow-lora

## Resumen

SPECTRA LoRA para Virchow es un adaptador LoRA desarrollado por el colectivo MedARC que modifica el modelo `paige-ai/Virchow`, un modelo de visión para histopatología, para hacerlo robusto frente a cambios en la adquisición de diapositivas: escáner, tinción y centro. El adaptador se entrena con un objetivo contrastivo sobre tiles PLISM registrados, donde la misma ubicación física de tejido aparece capturada bajo múltiples condiciones, de modo que la pérdida empuja a las representaciones de la misma zona a acercarse y a las de zonas distintas a separarse. La arquitectura base es un ViT-Huge de 224x224 de entrada y dimensión de embedding 1280 (readout de 2560 al concatenar el token CLS con la media de los parches). El adaptador añade un delta LoRA de rank 32 en las proyecciones de atención y MLP de los 32 bloques, sin modificar los pesos del modelo base. Es una herramienta clave para estandarizar representaciones de tiles en entornos multicéntricos y para tareas de recuperación entre dominios de escaneo, y su relevancia reciente se debe al creciente interés en la robustez preanalítica en patología computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `paige-ai/Virchow` (ViT-Huge patch14 224); módulos adaptados: qkv, attn.proj, mlp.fc1, mlp.fc2 en los 32 bloques (128 módulos) |
| Parametros totales | No disponible para el modelo base; adaptador LoRA de 83.949.648 bytes (20.987.412 parámetros en FP32) |
| Parametros activos | No aplica (no es una arquitectura MoE) |
| Longitud de contexto | No aplica (modelo de visión; entrada de imagen 224x224) |
| Tipos de cuantizacion | No disponibles; el código de ejemplo usa FP32 |
| Idiomas soportados | No disponibles (modelo de visión, no de lenguaje) |
| Licencia | MIT |
| Formato de pesos | Safetensors (adaptador PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador está diseñado para cargarse sobre una revisión concreta del modelo base, `19eebc84ae33e79f1b2d866e6ff90ae50e522f9a`. Se aplica a las proyecciones `qkv`, `attn.proj`, `mlp.fc1` y `mlp.fc2` de cada uno de los 32 bloques del ViT-Huge. El método de entrenamiento es LoRA (PEFT 0.20.0) con tensores en FP32, rank r=32, alpha=64, dropout=0 y bias `none`. La función objetivo es InfoNCE sobre tiles de un dataset llamado PLISM, donde se registran imágenes de la misma zona física adquiridas con distintos escáneres y tinciones. Se usan dos cabezas (CLS y media de parches) con pesos 0.5/0.5, temperatura 0.07, y un optimizador con tasa de aprendizaje 1e-4, weight decay 0.05, 500 pasos totales y 200 pasos de calentamiento. La selección de checkpoints sigue una regla 1-SE sobre la curva de robustez PathoROB, aplicada por semilla. Se liberan tres seeds independientes en las subcarpetas `seed0/`, `seed1/` y `seed2/`; no son un ensemble, sino réplicas de entrenamiento. Las cabezas de proyección utilizadas durante el entrenamiento no se incluyen en el repositorio.

## Capacidades

- Extracción de características (feature extraction) de tiles de histopatología, produciendo un embedding de 2560 dimensiones (CLS concatenado con la media de los tokens espaciales).
- Robustez mejorada frente a variaciones de escáner, tinción y centro, medida con el índice de robustez PathoROB y la recuperación cross-scanner / cross-stain en PLISM.
- Recuperación (retrieval) de tiles entre distintas condiciones de adquisición, con mejora significativa frente al modelo base.
- Integración como backbone en pipelines de visión: el adaptador puede fusionarse en los pesos del base mediante `merge_and_unload()` para su uso posterior.
- No dispone de generación de texto, tool calling, ni soporte de agentes; es un modelo puramente visual para extracción de representaciones.

## Casos de uso

- **Investigación multicéntrica en patología computacional**: el adaptador normaliza las representaciones de tiles procedentes de hospitales con distintos escáneres y protocolos de tinción, reduciendo el efecto lote de los datos de entrenamiento.
- **Búsqueda de casos similares (retrieval)**: ante una consulta de tile en una colección heterogénea, el modelo produce embeddings que permiten recuperar la localización o el diagnóstico correspondiente sin necesidad de re-escaneo.
- **Registro de imágenes entre escáneres y tinciones**: al alinear las representaciones de la misma zona física bajo condiciones distintas, facilita la construcción de co-embeddings para tareas de registro multimodal.
- **Aprendizaje por transferencia**: los embeddings del adaptador pueden servir como entrada a clasificadores o cabezas de segmentation para tareas específicas de patología, mejorando la generalización a nuevos centros.
- **Evaluación de robustez preanalítica**: permite comprobar la estabilidad de un modelo clínico cuando se enfrenta a diapositivas adquiridas con técnicas diferentes, un paso necesario antes de desplegar sistemas en producción.
- **Integración en pipelines de imágenes completas (WSI)**: los features extraídos por parche se pueden agregar con mecanismos de atención o de instancia múltiple para clasificar biopsias o detectar biomarcadores.

## Benchmarks y rendimiento

Los resultados siguientes provienen de la model card del adaptador, comparando el modelo base con el modelo base mas el adaptador SPECTRA. Los valores de la columna adaptador son medias con intervalo de confianza (media +/- 2SD) sobre tres semillas, tal y como se reproducen en el paper SPECTRA. En todas las filas, un valor mas alto es mejor.

| Metrica | Modelo base | + SPECTRA LoRA (n=3 seeds, media +/- 2SD) |
|---|---|---|
| PathoROB mean robustness index (cross-centre) | 0.815 | **0.890** +/- 0.004 |
| PLISM top-1 retrieval across scanners | 0.758 | **0.997** +/- 0.000 |
| PLISM top-1 retrieval across stains | 0.597 | **0.931** +/- 0.006 |
| HEST mean Pearson r | 0.4061 | **0.4083** +/- 0.0036 |
| CPTAC AUC | 0.6608 | **0.6839** +/- 0.0026 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El adaptador en si ocupa unos 84 MB de espacio en disco, pero para ejecutar el modelo se necesita cargar el base `paige-ai/Virchow`, por lo que el consumo total depende del backbone.
- GPU recomendadas: no disponible. La model card no especifica requisitos de hardware ni GPU de referencia.
- Si cabe en consumer GPU: no disponible. El adaptador es ligero, pero el modelo base es un ViT-Huge; no hay datos oficiales sobre el consumo de VRAM.
- Opciones de despliegue: el codigo de ejemplo carga el adaptador con `PeftModel` de PEFT sobre un modelo `timm`, por lo que se puede ejecutar en Python con PyTorch. No se mencionan vLLM, llama.cpp ni TGI, y no aplican al ser un modelo de vision.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se han identificado modelos comparables de la misma categoria en la informacion dispnible. La referencia mas cercana es el propio modelo base `paige-ai/Virchow`, cuyos resultados sin adaptador se muestran en la seccion de benchmarks. En la model card se advierte de la confusion silenciosa con `Virchow2`, que comparte arquitectura y tamano de adaptador pero usa 5 tokens de prefijo en lugar de 1, por lo que requiere un indice de corte diferente. No se ofrecen datos comparativos entre este adaptador y Virchow2.

## Limitaciones y advertencias

- El adaptador esta entrenado y evaluado contra una revision concreta del modelo base (`19eebc84ae33e79f1b2d866e6ff90ae50e522f9a`). Aplicarlo a otra revision es un caso no probado.
- Es un adaptador para Virchow v1, no Virchow2. La diferencia esta en `num_prefix_tokens`: Virchow v1 usa 1 (sin registros) y Virchow2 usa 5 (1 CLS + 4 registros). Usar el indice equivocado corrompe silenciosamente las features al mezclar tokens de registro en la media de los parches.
- Los checkpoints liberados son "un-annealed", ya que la seleccion por la regla 1-SE cae dentro de los 200 pasos de calentamiento. Esto puede afectar al comportamiento en tareas de transferencia.
- Las tres semillas del repositorio no son un ensemble. Se recomienda elegir una semilla o reportar la dispersion entre las tres.
- El modelo es exclusivamente de extraccion de caracteristicas. No genera texto, no razona sobre imagenes y no soporta tool calling.
- El rendimiento en recuperacion PLISM es especifico de las condiciones de adquisicion estudiadas (escáneres y tinciones concretas). No se aportan evidencias de generalizacion a otros dominios de patologia fuera del dataset de entrenamiento.
- La licencia MIT cubre el adaptador, pero el modelo base `paige-ai/Virchow` tiene su propia licencia; es necesario verificar los terminos del modelo base antes de un uso comercial.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/medarc/spectra-virchow-lora
- Modelo base: https://huggingface.co/paige-ai/Virchow
- Papel SPECTRA: no se ha proporcionado enlace en la informacion disponible; los resultados de resultados se citan en la model card.
