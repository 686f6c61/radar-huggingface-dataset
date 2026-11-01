# adham-shah/pediatric-chest-xray-pneumonia-vit

## Resumen

El modelo `adham-shah/pediatric-chest-xray-pneumonia-vit` es un clasificador de imágenes de radiografía de tórax pediátrica desarrollado por el usuario de HuggingFace adham-shah, concebido como proyecto educativo. Se trata de un Vision Transformer (ViT) afinado mediante transfer learning a partir de `google/vit-base-patch16-224-in21k`, que clasifica radiografías de tórax de niños de entre 1 y 5 años en dos categorías: `NORMAL` o `PNEUMONIA`. El modelo resuelve una tarea de clasificación binaria de imagen médica y es relevante como ejemplo práctico de ajuste fino de un ViT en un dominio especializado con recursos limitados.

El modelo parte de la arquitectura ViT-base con parches de 16x16 y resolución de entrada de 224x224 píxeles, con un total de 85.800.194 parámetros. Se ha entrenado sobre el conjunto de datos público de Kermany et al. (2018) procedente del Guangzhou Women and Children's Medical Center, ampliamente utilizado en la literatura de imagen médica. El autor declara explícitamente que no es un dispositivo médico y que no debe emplearse para diagnóstico ni para decisiones clínicas.

La relevancia de esta ficha radica en que documenta con transparencia un caso de transfer learning médico con métricas detalladas en un conjunto de test reservado, incluyendo intervalos de confianza bootstrap y un análisis honesto de las limitaciones (sobreajuste de la validación, falsos positivos elevados, posible uso de atajos visuales). Es un ejemplo útil para investigadores que quieran evaluar la viabilidad de ViT-base en clasificación de imagen médica pediátrica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-base, patch16, resolución 224x224) |
| Parámetros totales | 85.800.194 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, sin contexto textual) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de imagen, sin capacidades lingüísticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un Vision Transformer de tipo ViT-base con parches de 16x16 sobre imágenes de 224x224 píxeles, inicializado desde los pesos de `google/vit-base-patch16-224-in21k` y afinado para clasificación binaria de imagen médica. El entrenamiento se realizó en dos etapas: primero con el backbone congelado y solo la cabeza de clasificación entrenable (4 épocas, learning rate 3e-4), y después con ajuste fino completo (6 épocas, learning rate 2e-5). Se empleó el optimizador AdamW con scheduler coseno y warmup, batch size 32, precisión fp16 y entropía cruzada con pesos de clase (NORMAL ≈ 1,93, PNEUMONIA ≈ 0,68). La semilla fue 42.

Los datos provienen del conjunto Chest X-Ray Images (Pneumonia) de Kermany et al. (2018), con licencia CC BY 4.0. El split original de entrenamiento y validación se fusionó y se volvió a dividir de forma estratificada 80/20 agrupando por un ID inferido del nombre de fichero, resultando en 4.182 imágenes de entrenamiento y 1.050 de validación. El conjunto de test oficial (624 imágenes: 234 normales, 390 con neumonía) no se usó ni para entrenamiento ni para selección de modelo. El autor advierte que no hay imágenes idénticas byte a byte entre splits, pero que los IDs de paciente son inferidos y no oficiales; algunos IDs compartidos entre train y test corresponden a subtipos bacterianos o víricos distintos, lo que sugiere reutilización de ID más que el mismo paciente. La aumentación de datos, aplicada solo en entrenamiento, incluye random resized crop (0,85-1,0), rotación de hasta 10 grados y jitter de brillo y contraste, sin flips. La mejor época de cada etapa se eligió por AUC de validación.

## Capacidades

- Clasificación binaria de imágenes de radiografía de tórax pediátrica en las clases `NORMAL` y `PNEUMONIA`.
- Procesamiento de imágenes de entrada a resolución 224x224 píxeles mediante parches de 16x16.
- Salida de probabilidad por clase (logits binarios) apta para umbralización configurable.
- Ajuste fino específico sobre dominio médico pediátrico (edad 1-5 años).
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de capacidades multilingües ni de generación de texto.
- No incorpora modo de razonamiento, visión general, audio ni otras modalidades.

## Casos de uso

- Investigación académica en clasificación de imagen médica: sirve como línea base reproducible para comparar técnicas de transfer learning con ViT en radiografía pediátrica, dado que el autor publica métricas detalladas y un test reservado.
- Docencia y formación en visión por computador médica: permite ilustrar el flujo completo de ajuste fino de un ViT, incluyendo congelación de backbone, ajuste completo, aumentación y análisis de intervalos de confianza.
- Prototipado de sistemas de triaje asistido (no clínico): con una sensibilidad de 0,992 en test, podría emplearse en entornos de investigación para experimentar con flujos de priorización de radiografías, siempre con supervisión humana y sin uso diagnóstico.
- Evaluación de sesgos y atajos visuales: el modelo es útil para estudiar cómo los marcadores ("R"), tubos y cables presentes en las imágenes pueden influir en las predicciones, tal como advierte el autor.
- Benchmarking de pipelines de clasificación médica: permite comparar el rendimiento de ViT-base frente a CNN u otros transformers en el mismo conjunto de datos público.
- Análisis de calibración y umbrales: el desajuste documentado entre validación y test (especificidad 0,98 en validación frente a 0,82 en test) lo convierte en un caso de estudio sobre selección de umbral y sobreajuste de validación.
- Estudio de reproducibilidad en imagen médica: la descripción detallada de hiperparámetros, semilla y splits permite replicar el experimento y analizar la variabilidad entre ejecuciones.

## Benchmarks y rendimiento

Resultados publicados por el autor en el conjunto de test oficial (624 imágenes: 234 normales, 390 con neumonía), umbral 0,5, intervalos bootstrap al 95 %:

| Modelo | AUC | Sensibilidad | Especificidad | Accuracy | F1 |
|---|---|---|---|---|---|
| Backbone congelado (baseline) | 0,919 [0,896-0,939] | 0,728 | 0,953 | 0,812 | 0,829 |
| Ajuste fino (este modelo) | 0,987 [0,977-0,994] | 0,992 [0,982-1,000] | 0,821 [0,769-0,868] | 0,928 | 0,945 |

El modelo afinado falló en 3 de 390 casos de neumonía y generó falsas alarmas en 42 de 234 imágenes normales. El autor señala que la especificidad en validación (~0,98) fue muy superior a la de test (0,82), por lo que las puntuaciones de validación sobreestiman el rendimiento. Un umbral inferior elegido en validación (0,09) no se transfirió al test y no se recomienda.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,35 GB solo para pesos (85,8 M de parámetros), más activaciones y overhead del framework; en la práctica, menos de 2 GB para batch pequeño.
- VRAM estimada en fp16: aproximadamente 0,17 GB para pesos, con overhead adicional bajo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se ha entrenado presumiblemente en GPU de gama media-alta (no especificado). Para entrenamiento completo se recomienda al menos 8-16 GB.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores; también en GPUs integradas con suficiente memoria compartida para inferencia en CPU.
- Opciones de despliegue: transformers (PyTorch), y potencialmente ONNX Runtime u otras herramientas de exportación, aunque el autor solo declara compatibilidad con transformers y endpoints_compatible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pediatric-chest-xray-pneumonia-vit (este) | 85,8 M | no aplica (visión) | Clasificación binaria radiografía pediátrica | Apache-2.0 | HuggingFace |
| google/vit-base-patch16-224-in21k | 85,8 M | no aplica (visión) | Clasificación de imagen general (ImageNet-21k) | Apache-2.0 | HuggingFace |
| Alternativas específicas de clasificación de neumonía en radiografía | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de clasificación de neumonía pediátrica en radiografía con métricas publicadas en la información proporcionada.

## Limitaciones y advertencias

- El autor declara explícitamente que es un proyecto educativo y no un dispositivo médico; no debe usarse para diagnóstico ni para decisiones clínicas.
- Entrenado únicamente con niños de 1 a 5 años de un solo hospital (Guangzhou Women and Children's Medical Center); no debe aplicarse a adultos ni a otras poblaciones.
- Muchas imágenes contienen marcadores ("R"), tubos y cables; el modelo podría apoyarse en estos atajos visuales, lo que no se ha evaluado.
- La mayoría de trabajos publicados usan el mismo conjunto de datos, por lo que los resultados pueden no generalizar a otros hospitales o escáneres.
- La alta sensibilidad (0,992) conlleva numerosas falsas alarmas: un 18 % de las imágenes normales de test se clasificaron erróneamente como neumonía.
- La especificidad en validación (~0,98) sobreestima el rendimiento real (0,82 en test); el umbral alternativo de 0,09 elegido en validación no se transfirió al test y no se recomienda.
- Los IDs de paciente son inferidos del nombre de fichero, no oficiales; existe incertidumbre sobre posibles fugas de datos entre splits.
- Licencia Apache-2.0 permite uso comercial del código y pesos, pero las restricciones médicas y de responsabilidad del autor siguen aplicando.
- No se han documentado sesgos demográficos más allá de la restricción de edad y origen geográfico único.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/adham-shah/pediatric-chest-xray-pneumonia-vit
- Modelo base: https://huggingface.co/google/vit-base-patch16-224-in21k
- Conjunto de datos: https://huggingface.co/datasets/hf-vision/chest-xray-pneumonia
- Cita del dataset: Kermany, D., Zhang, K., Goldbaum, M. (2018). Large Dataset of Labeled Optical Coherence Tomography (OCT) and Chest X-Ray Images. Mendeley Data, V3. doi:10.17632/rscbjbr9sj.3
