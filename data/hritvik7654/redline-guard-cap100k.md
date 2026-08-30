# Hritvik7654/redline-guard-cap100k

## Resumen

El modelo `redline-guard-cap100k` es un clasificador de texto (text-classification) desarrollado por Hritvik7654, obtenido mediante fine-tuning de `answerdotai/ModernBERT-base`, un modelo transformer encoder de la familia ModernBERT optimizado para tareas de clasificación y representación de texto. Con 149,6 millones de parámetros, este modelo está diseñado para tareas de clasificación binaria, probablemente orientadas a la detección de riesgos o cláusulas problemáticas en documentos legales (como sugiere el nombre "redline guard"), aunque el dataset de entrenamiento no se especifica en la documentación disponible.

La relevancia de este modelo radica en que aprovecha la arquitectura eficiente de ModernBERT-base, que ofrece un buen equilibrio entre rendimiento y coste computacional, y el fine-tuning se ha realizado con métricas de evaluación sólidas (AUROC 0,9954, AUPRC 0,9916). Sin embargo, al carecer de información pública sobre el corpus de entrenamiento y los casos de uso concretos, su aplicabilidad debe validarse antes de su uso en producción. El repositorio no registra descargas ni "likes", lo que indica que es un modelo reciente o poco difundido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base) |
| Parametros totales | 149.606.402 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre `answerdotai/ModernBERT-base`, que es un transformer encoder bidireccional, similar a BERT pero con optimizaciones modernas en eficiencia y velocidad. ModernBERT-base emplea una arquitectura de atención estándar con 12 capas (según la configuración típica de la familia), y está preentrenado en un corpus multilingüe de gran escala, aunque el detalle exacto de su preentrenamiento no se especifica en la documentación de este fine-tuning.

El proceso de fine-tuning se realizó con el framework `transformers` (versión 4.57.6) y PyTorch 2.13.0, utilizando un dataset denominado "None" (no se proporciona información adicional sobre su contenido o tamaño). Los hiperparámetros de entrenamiento fueron: learning rate 3e-5, batch size de 32 para entrenamiento y 128 para evaluación, optimizador AdamW con betas (0.9, 0.999), scheduler lineal con warmup ratio 0.06 y 2 épocas completas. No se menciona el uso de técnicas de RLHF o DPO; se trata de un fine-tuning supervisado estándar.

## Capacidades

- Clasificación de texto binaria: el modelo está entrenado para asignar una etiqueta (probablemente "riesgo" vs. "no riesgo" o similar) a fragmentos de texto, aunque la etiqueta exacta no se documenta.
- Fine-tuning sobre ModernBERT-base, lo que le confiere una representación contextual rica del lenguaje, útil para tareas de análisis semántico a nivel de frase o párrafo.
- No se reportan capacidades de generación de texto, tool calling, agentes ni razonamiento multi-step; es exclusivamente un modelo discriminativo.
- No se indica soporte para vision, audio ni otros modalidades.
- No se detalla el soporte multilingüe; aunque ModernBERT-base es multilingüe, el fine-tuning podría haberlo especializado en un idioma concreto, pero no hay información al respecto.

## Casos de uso

- Auditoría de contratos: el modelo puede utilizarse para clasificar cláusulas o secciones de un contrato como "de riesgo" o "seguras", ayudando a equipos legales a priorizar revisiones. Su alta precisión (AUROC 0,9954) lo hace adecuado para pre-filtrado de documentos.
- Detección de spam o contenido no deseado: al ser un clasificador binario, puede adaptarse para identificar correos o mensajes no deseados, aunque se requeriría un dataset específico para ese dominio.
- Análisis de sentimiento en reseñas o comentarios: con un fine-tuning adicional en datos de sentimiento, podría utilizarse para clasificar opiniones positivas/negativas.
- Moderación de contenido en foros o redes sociales: clasificar si un texto infringe normas comunitarias.
- Filtrado de documentos legales en despachos: identificar automáticamente párrafos que requieren revisión humana, reduciendo el tiempo de análisis.
- Clasificación de tickets de soporte: asignar categorías (reclamación, consulta, error) en sistemas de atención al cliente, aunque necesitaría entrenamiento adicional con datos etiquetados de ese dominio.

## Benchmarks y rendimiento

El `model-index` de la model card está vacío, pero el autor reporta métricas de evaluación en el conjunto de validación durante el entrenamiento. Se presentan los resultados finales y la evolución en las tablas siguientes.

**Resultados finales en evaluación:**

| Metrica | Valor |
|---|---|
| Loss | 0,1093 |
| AUPRC | 0,9916 |
| AUROC | 0,9954 |
| TPR@1FPR | 0,9322 |

**Evolución durante el entrenamiento (selección de pasos):**

| Training Loss | Epoch | Step | Validation Loss | AUPRC | AUROC | TPR@1FPR |
|:-------------:|:-----:|:----:|:---------------:|:-----:|:-----:|:--------:|
| 0,1527 | 0,1561 | 2000 | 0,1273 | 0,9793 | 0,9884 | 0,8557 |
| 0,1179 | 0,3121 | 4000 | 0,1310 | 0,9786 | 0,9861 | 0,9034 |
| 0,0973 | 0,4682 | 6000 | 0,1091 | 0,9886 | 0,9941 | 0,9019 |
| 0,0878 | 0,6243 | 8000 | 0,0927 | 0,9889 | 0,9931 | 0,9356 |
| 0,0809 | 0,7803 | 10000 | 0,0785 | 0,9907 | 0,9944 | 0,9398 |
| 0,0883 | 0,9364 | 12000 | 0,0803 | 0,9905 | 0,9945 | 0,9319 |
| 0,0451 | 1,0925 | 14000 | 0,1237 | 0,9900 | 0,9951 | 0,8921 |
| 0,0505 | 1,2485 | 16000 | 0,1267 | 0,9895 | 0,9942 | 0,9132 |
| 0,0404 | 1,4046 | 18000 | 0,1216 | 0,9906 | 0,9946 | 0,9270 |
| 0,0488 | 1,5607 | 20000 | 0,1056 | 0,9919 | 0,9959 | 0,9243 |
| 0,0411 | 1,7167 | 22000 | 0,1096 | 0,9919 | 0,9957 | 0,9240 |
| 0,0368 | 1,8728 | 24000 | 0,1093 | 0,9916 | 0,9954 | 0,9322 |

No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- Con 149,6 millones de parámetros, el modelo es ligero y puede ejecutarse en GPU de consumo con 4-6 GB de VRAM en precisión FP16, y en CPU con memoria RAM suficiente (se recomiendan al menos 8 GB).
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA, como RTX 3060, RTX 4070, o superiores. También funciona en Google Colab (GPU T4) sin problemas.
- Para despliegue en producción, se puede servir con `text-embeddings-inference` (compatible según los tags) o mediante `transformers` con `pipeline("text-classification")`.
- También es compatible con `llama.cpp` si se convierte a GGUF, aunque no se proporciona esa conversión oficialmente.
- La latencia de inferencia es baja; en una GPU T4, una clasificación de un texto corto (menos de 512 tokens) tarda típicamente menos de 10 ms.
- El tamaño del repositorio es de 0,6 GB, lo que facilita su descarga y despliegue en entornos con recursos limitados.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Sin embargo, dado que se basa en ModernBERT-base, se puede comparar con otros clasificadores de texto de tamaño similar como BERT-base (110M parámetros) o RoBERTa-base (125M). No hay datos de rendimiento de estos modelos en las mismas tareas, por lo que no se puede establecer una comparación cuantitativa. Se recomienda evaluar el modelo en el dominio específico antes de elegirlo frente a alternativas.

## Limitaciones y advertencias

- El dataset de entrenamiento no está documentado, lo que impide conocer el dominio de aplicación exacto y los posibles sesgos introducidos.
- No se especifican los idiomas soportados; aunque ModernBERT-base es multilingüe, el fine-tuning podría haber reducido su cobertura a un idioma concreto.
- La etiqueta de clasificación no está definida públicamente; se infiere del nombre que se trata de detección de riesgos en contratos, pero no hay confirmación.
- No se han publicado análisis de sesgos ni pruebas de robustez ante entradas adversariales.
- La licencia Apache-2.0 permite uso comercial, pero al no conocerse el origen de los datos de entrenamiento, podría haber problemas de propiedad intelectual si se usan datos propietarios.
- El modelo no tiene capacidades generativas; solo clasificación.
- No se proporcionan instrucciones de uso específicas ni ejemplos de código en la model card, lo que dificulta su integración rápida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hritvik7654/redline-guard-cap100k
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Repositorio GitHub relacionado con "redline-guard" (auditoría de contratos): https://github.com/imandiakhil9505-hub/redline-guard
- Otro repositorio "RedlineGuard" (prototipo para revisión de contratos): https://github.com/New-Sheep/RedlineGuard/blob/main/README.md
- Nota: los repositorios de GitHub no están vinculados oficialmente con este modelo, pero comparten nombre y temática.
