# medarc/spectra-openmidnight-lora

## Resumen

SPECTRA LoRA - OpenMidnight es un adaptador LoRA desarrollado por MedARC que se aplica sobre el modelo de fundamento para patología computacional SophontAI/OpenMidnight. Su objetivo es hacer que el modelo base sea robusto a las variaciones en la adquisición de imágenes histopatológicas: cambios de escáner, de tinción y de centro hospitalario. En lugar de modificar los pesos del modelo original, el adaptador añade un delta de rango 32 en las proyecciones de atención y de MLP, concretamente en 160 módulos (qkv, attn.proj, mlp.fc1 y mlp.fc2) distribuidos en 40 bloques.

El adaptador está entrenado de forma contrastiva sobre tiles PLISM registrados, de manera que el objetivo es acercar las representaciones de una misma localización física de tejido bajo distintas condiciones de adquisición, y separar las de tiles distintos. Los pesos del modelo base permanecen intactos. El resultado es un modelo de extracción de características que mantiene la semántica del modelo base pero mejora la transferencia entre dominios. La relevancia actual radica en la necesidad de modelos de patología computacional que funcionen de forma fiable en entornos clínicos reales, donde la variabilidad de escáneres y tinciones es una fuente habitual de degradación del rendimiento.

Se proporcionan tres semillas de entrenamiento independientes en subcarpetas, pero no se trata de un ensamblado: se debe elegir una o reportar la dispersión entre las tres. El repositorio contiene únicamente el adaptador; el modelo base no se incluye.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer ViT (vit_giant_patch14_reg4_dinov2) |
| Parametros totales | no disponible (adaptador LoRA rango 32; no se indica el numero de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de vision; entrada de 224x224 px, 256 tokens espaciales + 5 tokens de prefijo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre SophieontAI/OpenMidnight, una réplica abierta del modelo Midnight de Kaiko.AI. El modelo base es un vision transformer de tipo ViT giant (`vit_giant_patch14_reg4_dinov2`) con dimensión de embedding 1536 y 40 bloques. El adaptador LoRA modifica las proyecciones de query, key y value (`qkv`), la proyección de salida de atención (`attn.proj`), y las capas del MLP (`mlp.fc1` y `mlp.fc2`). El rango del LoRA es 32, con alpha 64, lo que supone un escalado de 2.0; el dropout es 0.0 y el bias está desactivado.

El entrenamiento se realizó con el objetivo contrastivo InfoNCE sobre tiles PLISM registrados, donde cada tile pertenece a la misma localización física capturada bajo múltiples condiciones de escáner y tinción. Se utilizaron cabezas separadas para el token CLS y el promedio global, con pesos 0.5 y 0.5, y temperatura 0.07. El aprendizaje se llevó a cabo en 500 pasos totales con 200 pasos de calentamiento, tasa de aprendizaje de 1e-4 y weight decay 0.05. El checkpoint se seleccionó mediante la regla 1-SE sobre la curva del índice de robustez PathoROB. Se entrenaron tres semillas independientes con los mismos hiperparámetros. Los proyectores contrastivos y la cabeza de pooling utilizados durante el entrenamiento no se liberan; solo se publica el adaptador LoRA.

## Capacidades

- Extracción de características (feature extraction) de tiles histopatológicos: produce embeddings de 1536 dimensiones a partir del token CLS (`h[:, 0]`).
- Robustez a variaciones de adquisición: mejora la transferencia entre escáneres, tinciones y centros, manteniendo la coherencia semántica para la misma localización física.
- Compatible con la sinergia de la arquitectura de OpenMidnight: 256 tokens espaciales más 1 token CLS y 4 tokens de registro, con `num_prefix_tokens = 5`.
- No es un modelo generativo, no soporta tool calling, ni agentes ni razonamiento multi-paso.
- No tiene capacidades de lenguaje; no es multilingüe.
- Acepta imágenes de entrada de 224x224 píxeles con preprocesamiento específico (resize bicubic a 256 y center crop para la mayoría de los casos; resize directo a 224 para THUNDER).

## Casos de uso

- Normalización de dominio entre centros hospitalarios: en un entorno donde las imágenes proceden de escáneres y reactivos distintos, el adaptador permite que un clasificador entrenado en un centro mantenga su rendimiento al aplicarse en otro, sin necesidad de reentrenar el modelo base.
- Búsqueda de casos similares en archivos de patología: los embeddings de 1536 dimensiones pueden usarse para recuperar tiles o casos morfológicamente parecidos dentro de una base de datos de WSI, mejorando la precisión cuando las imágenes proceden de adquisiciones heterogéneas.
- Clasificación de subtipos tumorales a partir de tiles: se puede entrenar una cabeza lineal o un MLP sobre los embeddings extraídos, lo que reduce el tiempo de desarrollo, ya que el modelo base ya genera representaciones robustas.
- Segmentación de tejido en imágenes de histopatología: el modelo puede incorporarse como codificador en arquitecturas de segmentación; la model card advierte de que el preprocesamiento debe elegirse correctamente según el benchmark para no degradar la métrica.
- Aprendizaje transferido hacia nuevos órganos y tejidos: la robustez del adaptador permite reutilizar el modelo en dominios no vistos, reduciendo la cantidad de datos etiquetados necesarios para adaptarlo.
- Integración en pipelines de patología computacional: al ser un adaptador ligero (0.4 GB) que se fusiona con el modelo base, puede añadirse a flujos de investigación con PyTorch y PEFT, sin necesidad de reentrenar el modelo completo.

## Benchmarks y rendimiento

La siguiente tabla recoge los resultados publicados en la model card, comparando el modelo base frente al modelo base más el adaptador SPECTRA LoRA. Los valores para el adaptador son media ± 2 SD de las tres semillas (n=3).

| Metrica | Modelo base | + SPECTRA LoRA (n=3, media ± 2SD) |
|---|---|---|
| PathoROB índice de robustez medio (cross-centre) | 0.618 | **0.879** ± 0.007 |
| PLISM top-1 recuperación entre escáneres | 0.703 | **0.948** ± 0.015 |
| PLISM top-1 recuperación entre tinciones | 0.486 | **0.782** ± 0.029 |
| HEST correlación de Pearson media | 0.3902 | **0.4048** ± 0.0014 |
| CPTAC AUC | 0.6561 | **0.6844** ± 0.0022 |

Todas las métricas son de mayor es mejor. Los valores del modelo base son evaluaciones deterministas individuales sin dispersión entre semillas.

## Requisitos de hardware

- El repositorio del adaptador ocupa 0.4 GB, pero el modelo base no está incluido y debe descargarse por separado.
- No se han publicado requisitos de hardware oficiales. Dado que el modelo base es un ViT giant con dimensión de embedding 1536, se necesita una GPU con suficiente memoria para cargar los pesos y las activaciones de un transformer de este tamaño; se recomienda al menos 8 GB de VRAM para inferencia, aunque no se confirma en la documentación.
- El despliegue se realiza mediante Python con las librerías `timm` y `peft`, en PyTorch. No se menciona compatibilidad con vLLM, TGI, llama.cpp ni Ollama, ya que se trata de un adaptador de visión, no de un modelo de lenguaje.
- No hay datos disponibles sobre latencia ni throughput.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos en la información proporcionada. La única comparación publicada es la del modelo base OpenMidnight frente al mismo modelo con el adaptador SPECTRA LoRA. El modelo original de Kaiko.AI (`kaiko-ai/midnight`) se menciona como fuente de la receta que OpenMidnight replica, pero no se aportan especificaciones ni resultados de rendimiento. Por tanto, no se puede elaborar una comparativa exhaustiva con alternativas de la misma categoría.

## Limitaciones y advertencias

- El adaptador solo ha sido evaluado sobre una revisión exacta del modelo base: `SophontAI/OpenMidnight` en el commit `87189e6674d397a14a5cd342c97b1a1615a185aa`. Aplicarlo a otra revisión no está probado.
- El preprocesamiento es crítico y depende del benchmark. Para la mayoría de los casos (incluidos HEST, PathoROB y CPTAC) se requiere `Resize(256, bicubic)` seguido de `CenterCrop(224)`. Para el benchmark THUNDER se requiere un resize directo a `(224, 224)` sin recorte. Usar la transformación incorrecta degrada el rendimiento de forma material, por ejemplo 6.2 F1 por debajo en segmentación.
- La normalización es la de ImageNet (media 0.485, 0.456, 0.406 y desviación estándar 0.229, 0.224, 0.225). No se debe usar la normalización `(0.5,)*3` que emplea el modelo Midnight original.
- `dynamic_img_size=False` y `img_size=224` son ambos obligatorios al construir el modelo base; no se admite variación dinámica del tamaño de imagen.
- Las tres semillas (seed0, seed1, seed2) no forman un conjunto (ensemble). Se debe seleccionar una o, en investigación, reportar la dispersión entre las tres.
- Los proyectores contrastivos y la cabeza de pooling entrenados para el aprendizaje contrastivo no se incluyen en el repositorio; no son necesarios para la extracción de características.
- No es un modelo generativo, por lo que el concepto de alucinación no aplica, pero los embeddings pueden ser sensibles a artefactos en la imagen de entrada si el preprocesamiento no coincide exactamente con el usado en entrenamiento.
- La licencia MIT cubre el adaptador, pero el modelo base `SophontAI/OpenMidnight` debe consultarse por separado para verificar su licencia y restricciones de uso comercial.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/medarc/spectra-openmidnight-lora
- Modelo base en HuggingFace: https://huggingface.co/SophontAI/OpenMidnight
- GitHub de OpenMidnight: https://github.com/MedARC-AI/OpenMidnight
