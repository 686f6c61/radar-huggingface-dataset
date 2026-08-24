# shreshthsaini/brightrate-lm-7b-multiexposure

## Resumen

BrightRate-LM 7B multi-exposure es un adaptador PEFT (LoRA) desarrollado por Shreshth Saini y colaboradores como parte del estudio BrightRate-LM, orientado a la evaluación de calidad perceptual sin referencia (no-reference) de vídeo HDR generado por usuarios. El adaptador se construye sobre el modelo base multimodal Qwen/Qwen2.5-VL-7B-Instruct, que combina un transformer de lenguaje con un codificador visual. Su función principal es tomar una secuencia de vídeo, muestrear ocho fotogramas uniformemente, renderizar cada uno a tres exposiciones (-2, 0 y +2 pasos) y, a partir de las 24 imágenes resultantes, predecir una puntuación de calidad subjetiva (MOS) en una escala de 0 a 100, junto con una descripción de los defectos visibles y un razonamiento textual de la puntuación.

El modelo es relevante porque aborda un problema específico: la evaluación automática de calidad de vídeo HDR en entornos de contenido generado por usuarios, donde las métricas tradicionales (PSNR, SSIM) no correlacionan bien con la percepción humana. Al integrar un modelo de lenguaje multimodal, BrightRate-LM no solo produce una puntuación numérica, sino que también genera explicaciones cualitativas, lo que facilita la interpretación de los resultados. El adaptador se entrena sobre el dataset BrightVQ, con cinco splits independientes, y las métricas reportadas muestran una correlación alta (SROCC medio de 0.9052) en los conjuntos de prueba.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-VL-7B-Instruct (transformer multimodal) |
| Parametros totales | No disponible (el adaptador ocupa ~1 GB; el modelo base tiene 7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se puede combinar con cuantizaciones del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en Qwen2.5-VL-7B-Instruct, un modelo multimodal que combina un transformer de lenguaje con un codificador visual (vision transformer). Sobre este modelo base se aplica un adaptador LoRA de rango 16 con alpha 32 y dropout 0.05, que ajusta únicamente una fracción de los pesos durante el entrenamiento. La entrada al modelo consiste en 24 imágenes: ocho fotogramas del vídeo, cada uno renderizado a tres exposiciones (-2, 0 y +2 pasos), organizadas en orden temporal-mayor. Esta representación multi-exposición permite al modelo capturar información de rango dinámico que es crítica para evaluar la calidad HDR.

El entrenamiento se realizó sobre el dataset BrightVQ, dividido en cinco splits de contenido separado. Se entrenaron cinco adaptadores independientes, uno por split, con dos épocas, un horizonte de coseno de tres épocas, tasa de aprendizaje 1e-4, micro-batch de 1 y acumulación de gradiente de 8. Los objetivos MOS se interpolaron a través de cinco palabras de calidad (por ejemplo, "excelente", "bueno", etc.). El adaptador raíz corresponde al split 0, mientras que los demás se encuentran en `splits/split-1` a `splits/split-4`. No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado con etiquetas de calidad.

## Capacidades

- Evaluación de calidad perceptual sin referencia de vídeo HDR generado por usuarios, devolviendo una puntuación numérica (0-100).
- Generación de una descripción textual de los defectos visibles en el vídeo (por ejemplo, ruido, sobreexposición, artefactos de compresión).
- Producción de un razonamiento textual que justifica la puntuación asignada, basado en las características visuales detectadas.
- Procesamiento de entradas multimodales: combina información visual de múltiples exposiciones con el razonamiento del modelo de lenguaje.
- Capacidad de adaptación a diferentes dominios de vídeo mediante el ajuste fino del adaptador (aunque no está calibrado para otros datasets).
- Al estar basado en Qwen2.5-VL-7B-Instruct, hereda las capacidades generales de comprensión de imágenes y lenguaje del modelo base, aunque el adaptador está especializado en la tarea de calidad.

## Casos de uso

- Control de calidad en plataformas de vídeo generado por usuarios: el modelo puede puntuar automáticamente la calidad percibida de los vídeos subidos, ayudando a priorizar la revisión humana o a filtrar contenido de baja calidad.
- Evaluación de algoritmos de mejora de vídeo HDR: al comparar la calidad percibida antes y después de aplicar técnicas de mejora, el modelo proporciona una métrica objetiva que correlaciona con la opinión humana.
- Investigación en calidad de vídeo: los investigadores pueden utilizar el adaptador para estudiar cómo diferentes representaciones de entrada (exposiciones, número de fotogramas) afectan a la percepción de calidad, como se hizo en el estudio BrightRate-LM.
- Desarrollo de sistemas de recomendación de calidad: integrar el modelo en pipelines de procesamiento de vídeo para decidir si un vídeo requiere re-encoding o ajustes de exposición.
- Generación de informes automáticos de calidad: el modelo produce descripciones textuales de defectos, lo que permite generar informes legibles para productores de contenido o editores.
- Benchmarking de modelos de generación de vídeo: al evaluar la calidad de vídeos sintéticos generados por modelos de IA, el adaptador ofrece una métrica perceptual que complementa métricas tradicionales como FID o FVD.

## Benchmarks y rendimiento

El modelo reporta métricas de correlación y error en cinco splits de prueba, cada uno con 420 vídeos. Los resultados son los siguientes:

| Split | SROCC | PLCC | KRCC | RMSE |
|---:|---:|---:|---:|---:|
| 0 | 0.9110 | 0.9120 | 0.7347 | 5.7437 |
| 1 | 0.9311 | 0.9287 | 0.7666 | 5.0971 |
| 2 | 0.9175 | 0.9245 | 0.7469 | 5.0977 |
| 3 | 0.8904 | 0.8957 | 0.6996 | 5.9874 |
| 4 | 0.8760 | 0.8925 | 0.6928 | 5.7481 |
| Media | 0.9052 | 0.9107 | 0.7281 | 5.5348 |

Estas métricas indican una correlación alta entre las puntuaciones predichas y las opiniones humanas (SROCC y PLCC superiores a 0.89 en todos los splits). No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- El adaptador LoRA es ligero (~1 GB), pero requiere el modelo base Qwen2.5-VL-7B-Instruct para funcionar, que tiene aproximadamente 7B parámetros.
- Para inferencia en FP16, se estima una VRAM de al menos 16 GB (por ejemplo, una RTX 4090 o A100 40 GB). Con cuantización a 8 bits o 4 bits, podría caber en GPUs con 8-12 GB, aunque no se especifican configuraciones concretas.
- El procesamiento de 24 imágenes por vídeo aumenta el coste computacional en comparación con una sola imagen; se recomienda una GPU con suficiente memoria para el batch de imágenes.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería `peft` y el modelo base desde HuggingFace. También es posible usar frameworks como vLLM o TGI si se integra el adaptador, aunque no se menciona explícitamente.
- La latencia dependerá del número de fotogramas y de la GPU; no se proporcionan datos de throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma tarea (evaluación de calidad de vídeo HDR con modelos multimodales). El modelo BrightRate (WACV 2026) es el predecesor sin componente de lenguaje, pero no se proporcionan métricas comparativas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El adaptador está diseñado específicamente para vídeo HDR generado por usuarios; las puntuaciones no están calibradas para otros datasets, pipelines de visualización o dominios de vídeo.
- La licencia no está especificada, lo que puede limitar su uso comercial sin consultar al autor.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado sobre un dataset concreto, puede heredar sesgos de contenido o de calidad presentes en BrightVQ.
- Existe riesgo de alucinación en las descripciones textuales de defectos, especialmente si el vídeo de entrada difiere significativamente de los datos de entrenamiento.
- El modelo requiere una construcción de entrada específica (ocho fotogramas, tres exposiciones) que puede no ser trivial de replicar en producción.
- No se proporcionan detalles sobre la longitud de contexto ni el soporte de idiomas, lo que limita su uso en aplicaciones multilingües.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shreshthsaini/brightrate-lm-7b-multiexposure
- Repositorio BrightRate-LM: https://github.com/shreshthsaini/BrightRate-LM
- Dataset BrightVQ: https://github.com/shreshthsaini/BrightVQ
- Página personal del autor: https://shreshthsaini.github.io/
