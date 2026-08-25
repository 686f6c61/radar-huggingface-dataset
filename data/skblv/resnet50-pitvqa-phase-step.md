# skblv/resnet50-pitvqa-phase-step

## Resumen

El modelo `skblv/resnet50-pitvqa-phase-step` es un clasificador de imágenes basado en ResNet-50 con dos cabezas de clasificación, diseñado para el reconocimiento conjunto de fases quirúrgicas y pasos en imágenes de cirugía endoscópica de pituitaria. Desarrollado por el usuario `skblv` como un baseline supervisado para el leaderboard de comprensión de vídeo quirúrgico SDSC × Chicago Booth, el modelo se entrena sobre el dataset PitVQA, que consta de 25 vídeos anotados con fases, pasos, instrumentos y notas de operación. Su relevancia actual radica en servir de referencia numérica para comparar modelos de visión y lenguaje (VLM) en el contexto clínico, demostrando que un clasificador supervisado clásico puede obtener resultados competitivos en esta tarea.

La arquitectura emplea un backbone ResNet-50 de `torchvision` preentrenado en ImageNet (`IMAGENET1K_V2`), sobre cuyas características agrupadas se añaden dos cabezas lineales con dropout: una para clasificar la fase (3 clases) y otra para el paso (14 clases). El entrenamiento se realiza con entropía cruzada por cabeza, decodificación por `argmax`, tamaño de lote 64, tasa de aprendizaje 1e-4, peso de decaimiento 1e-4, 4 épocas y semilla 42. Según la model card, el modelo alcanza un 66,4 % de coincidencia exacta (fase y paso correctos) y un 77,1 % de micro-F1 en el conjunto de validación completo (24.767 frames), lo que lo sitúa a la cabeza del leaderboard de contexto clínico (agosto 2026).

El modelo se distribuye bajo licencia Apache-2.0 y está disponible en formato PyTorch, lo que facilita su integración en pipelines de investigación y desarrollo. No es un dispositivo médico y su entrenamiento se ha realizado con datos de un único centro hospitalario, por lo que su rendimiento puede degradarse en otros entornos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ResNet-50 (backbone) con dos cabezas de clasificación lineales (dropout 0.5) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imágenes) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (checkpoint `.pt`) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura `torchvision.models.resnet50` con pesos iniciales `IMAGENET1K_V2`. Sobre las características agrupadas del backbone se añaden dos cabezas de clasificación lineal independientes: una para la fase (3 clases) y otra para el paso (14 clases), cada una con una capa de dropout de 0.5. La pérdida se calcula con entropía cruzada por cabeza y la decodificación se realiza mediante `argmax` para cada salida.

El entrenamiento se llevó a cabo con un tamaño de lote de 64, tasa de aprendizaje de 1e-4, peso de decaimiento de 1e-4, 4 épocas y semilla 42. El código completo de entrenamiento, incluida la definición de la clase del modelo, está disponible en el archivo `s68_pitvqa_supervised.py`. Este modelo actúa como baseline supervisado para el leaderboard de comprensión de vídeo quirúrgico, permitiendo comparaciones cuantitativas con modelos de visión y lenguaje (VLM) que abordan la misma tarea.

## Capacidades

- Reconocimiento de fase quirúrgica: clasifica cada frame en una de 3 fases del procedimiento endoscópico.
- Reconocimiento de paso quirúrgico: clasifica cada frame en uno de 14 pasos específicos.
- Salida conjunta: proporciona simultáneamente fase y paso, permitiendo evaluación de coincidencia exacta.
- Procesamiento de imágenes individuales: opera sobre frames extraídos de vídeo, sin modelado temporal.
- Sin capacidades de generación de texto, razonamiento, herramientas o agentes.

## Casos de uso

- Análisis de vídeo quirúrgico: el modelo puede etiquetar automáticamente cada frame de un vídeo de cirugía de pituitaria con su fase y paso, facilitando el análisis retrospectivo de procedimientos.
- Asistencia en tiempo real durante la cirugía: integrado en un sistema de monitorización, puede indicar la fase actual de la operación, aunque no está validado para uso clínico directo.
- Formación médica: en entornos educativos, permite a los estudiantes revisar vídeos y aprender a identificar fases y pasos de la cirugía endoscópica de pituitaria.
- Auditoría de calidad quirúrgica: hospitales pueden analizar grandes volúmenes de vídeos para verificar la adherencia a los pasos estándar y detectar desviaciones.
- Investigación en visión por computadora: sirve como baseline para comparar nuevos modelos de comprensión temporal o VLM en el dominio quirúrgico.
- Generación de datos de anotación: sus predicciones pueden usarse para pre-etiquetar nuevos vídeos, reduciendo el esfuerzo de anotación manual.
- Evaluación de modelos de lenguaje y visión: al ser un baseline supervisado, permite cuantificar la ventaja de los VLM en reconocimiento de fases y pasos.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados en el conjunto de validación completo (24.767 frames):

| Métrica | Valor |
|---|---|
| Exact match (fase y paso correctos) | 66,4 % (IC 95 %: 65,9–67,0) |
| Micro-F1 (ambos slots) | 77,1 % (IC 95 %: 76,6–77,5) |

No se proporcionan comparaciones numéricas con otros modelos en la información disponible, pero la model card indica que este baseline supervisado lidera el leaderboard de contexto clínico (agosto 2026) frente a los VLM evaluados.

## Requisitos de hardware

No se especifican requisitos de hardware en la documentación. A partir del tamaño del modelo (ResNet-50, ~0.1 GB de repositorio), se pueden estimar de forma orientativa:

- VRAM para inferencia: menos de 1 GB para una sola imagen; 2-4 GB para procesamiento por lotes.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (p. ej., RTX 1650, RTX 3060) es suficiente. También puede ejecutarse en CPU, aunque con mayor latencia.
- Despliegue: se puede usar directamente con PyTorch (`torch.load`) o exportar a ONNX/TensorRT para entornos de producción. No aplican herramientas de despliegue de modelos de lenguaje como vLLM o Ollama.
- Latencia: no medida, pero para un ResNet-50 en una GPU moderna se espera en el orden de milisegundos por imagen.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en la documentación proporcionada. El modelo se presenta como un baseline supervisado para comparar con VLMs en el leaderboard de SDSC × Chicago Booth, pero no se publican los resultados de dichos VLM. Por tanto, no se puede realizar una comparativa numérica en esta ficha.

## Limitaciones y advertencias

- No es un dispositivo médico: la model card indica explícitamente que es un baseline de investigación y no debe usarse para decisiones clínicas.
- Entrenado en un solo centro: los datos provienen del Hospital Nacional de Neurología y Neurocirugía de Londres, por lo que el rendimiento puede degradarse en otros entornos o variaciones del procedimiento.
- Sin modelado temporal: procesa frames individuales, por lo que no aprovecha la información secuencial del vídeo, lo que podría limitar la precisión en transiciones de fase.
- Sesgos potenciales: no se ha realizado un análisis de sesgos demográficos o de equipamiento, aunque el dominio específico limita su aplicabilidad general.
- Licencia: Apache-2.0 permite uso comercial, pero no se recomienda su uso en productos médicos sin validación adicional y cumplimiento normativo.

## Enlaces

- Hugging Face: [skblv/resnet50-pitvqa-phase-step](https://huggingface.co/skblv/resnet50-pitvqa-phase-step)
- Repositorio del dataset PitVQA: [https://github.com/mobarakol/PitVQA](https://github.com/mobarakol/PitVQA)
- Paper arXiv: [PitVQA: Image-grounded Text Embedding LLM for Visual Questioning](https://arxiv.org/abs/2405.13949)
- Leaderboard de vídeo quirúrgico: [https://github.com/skblv/neurosurgery-video-eval-website](https://github.com/skblv/neurosurgery-video-eval-website)
