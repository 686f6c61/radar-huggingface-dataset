# RuougiShiki/crop-disease-vit

## Resumen

`RuougiShiki/crop-disease-vit` es un modelo de visión publicado en HuggingFace por el usuario RuougiShiki. La información disponible es mínima: la model card únicamente declara la licencia MIT y no incluye descripción, datos de entrenamiento, métricas ni instrucciones de uso. El nombre del repositorio sugiere un clasificador de enfermedades de cultivos basado en un Vision Transformer, pero se trata de una inferencia a partir del identificador y del tag `vit`, no de un dato confirmado por el autor.

El dato objetivo más relevante es el recuento de parámetros obtenido de los pesos en safetensors: 85.827.878 parámetros, un volumen compatible con la escala de un ViT-Base (~86 M). El repositorio ocupa 0,3 GB, lo que encaja con pesos en fp32 de ese tamaño. No hay información sobre resolución de entrada, número de clases, composición del dataset ni procedimiento de entrenamiento.

Su relevancia actual es limitada desde el punto de vista de la evaluación técnica: se trata de un modelo sin descargas ni interacciones, sin pipeline declarado y sin documentación que permita verificar su comportamiento. Resulta utilizable únicamente como punto de partida para inspección directa de los pesos, no como componente validado para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (según el tag `vit`); variante y configuración no disponibles |
| Parametros totales | 85.827.878 (~85,8 M) |
| Parametros activos | no aplica (no consta que sea un modelo MoE) |
| Longitud de contexto | no disponible (modelo de visión; resolución de entrada no documentada) |
| Tipos de cuantizacion | no disponibles en la model card; al distribuirse en safetensors es convertibles a fp16, int8 y otros formatos |
| Idiomas soportados | no disponible (modelo de visión; no se documentan etiquetas ni idioma de las clases) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El tag del repositorio indica `vit`, es decir, un transformer aplicado a parches de imagen, y el recuento de parámetros (85,8 M) es coherente con una configuración de escala base tipo ViT-Base. Sin embargo, la model card no confirma ni el tamaño de parche, ni la resolución de entrada, ni el número de capas, dimensiones ocultas o cabezas de atención. Tampoco se especifica si la cabeza de clasificación es lineal simple o si hay capas adicionales.

No hay información alguna sobre el conjunto de entrenamiento: ni número de imágenes, ni procedencia, ni si hubo aumento de datos, destilación, ajuste fino desde un checkpoint previo (por ejemplo, ImageNet) o entrenamiento desde cero. Tampoco se documenta ninguna innovación técnica ni técnica de regularización. Cualquier afirmación sobre el proceso de entrenamiento sería especulativa y no debe asumirse.

## Capacidades

- Clasificación de imágenes: es la tarea esperable dado el tag `vit` y el nombre del repositorio, si bien el pipeline no está declarado en HuggingFace.
- Diagnóstico de enfermedades de cultivos: capacidad sugerida por el identificador del modelo, no verificada en la documentación.
- Extracción de características visuales: los checkpoints ViT pueden emplearse como backbone congelado, aunque se desconoce si los pesos están ajustados a un dominio agrícola concreto.
- Generación de texto, razonamiento, código y matemáticas: no disponible; no es un modelo de lenguaje.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplicables ni documentadas.
- Capacidades especiales (modo thinking, visión general, audio): no disponibles. No se documenta detección de objetos, segmentación ni respuesta a prompts en lenguaje natural.

## Casos de uso

Nota: al no existir documentación funcional, los siguientes escenarios son hipótesis de uso derivadas del nombre del repositorio y de la arquitectura declarada. Deben validarse empíricamente antes de cualquier despliegue.

- Triaje de imágenes en campo: integrado en una aplicación móvil, el modelo clasificaría fotografías de hojas para orientar al agricultor hacia un posible diagnóstico. Requiere validar previamente el etiquetado real de salida y la precisión por clase.
- Prefiltrado en inspección de cultivos con dron: uso como clasificador de primera etapa sobre recortes de imagen, dejando las imágenes dudosas a revisión humana. Su tamaño de ~86 M permite ejecución en el borde o en servidores modestos.
- Etiquetado asistido de datasets agrícolas: generación de etiquetas preliminares sobre grandes volúmenes de imágenes para revisión posterior por expertos, reduciendo el coste de anotación manual.
- Backbone para ajuste fino en tareas agrícolas específicas: con 85,8 M de parámetros, es viable reentrenar la cabeza e incluso hacer fine-tuning completo en una única GPU de consumo.
- Monitorización en invernadero con cámaras fijas: clasificación periódica de capturas para detectar aparición de síntomas, con inferencia en CPU o GPU de baja gama.
- Investigación y comparación de baselines: uso como referencia ViT de escala base en experimentos de clasificación de patologías vegetales, siempre que se documente su procedencia y limitaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, recall, F1, matriz de confusión ni comparación con baselines en ningún conjunto de datos agrícola o general.

## Requisitos de hardware

Estimaciones calculadas a partir de los 85,8 M de parámetros; sujetas a la configuración real de entrada (resolución, tamaño de lote) que no se documenta.

- Peso de los pesos: ~343 MB en fp32, ~172 MB en fp16, ~86 MB en int8.
- VRAM para inferencia: inferior a 1 GB en fp16 con lotes pequeños; el cuello de botella es la memoria de activaciones si la resolución de entrada es alta (por ejemplo, 384 o 512 píxeles).
- GPU recomendadas: cualquier GPU con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, T4). Para entrenamiento o fine-tuning completo, 8-16 GB resultan suficientes (RTX 3060/4070, A10, A100).
- GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo actual e incluso en hardware integrado para inferencia en fp32 o int8.
- CPU: viable para inferencia por imagen individual, con latencia mayor.
- Opciones de despliegue: `transformers` (PyTorch), exportación a ONNX Runtime, TorchScript, TorchServe o Triton Inference Server. `vLLM` y `TGI` no aplican por ser modelos orientados a lenguaje. `llama.cpp` y `Ollama` no son la vía natural, aunque es posible una conversión GGUF si se confirma la arquitectura.
- Latencia y throughput: no disponibles. Como referencia de orden de magnitud, un ViT-Base a 224×224 consume del orden de 17 GFLOPs por imagen, lo que se traduce en pocos milisegundos por imagen en GPU moderna; esta cifra es una estimación genérica y no un dato medido sobre este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| crop-disease-vit (este modelo) | 85,8 M | entrada no disponible | no disponible | MIT | HuggingFace, 0 descargas |
| google/vit-base-patch16-224 | ~86 M | 224×224 | métricas publicadas en ImageNet (no comparables a la tarea agrícola) | Apache 2.0 | ampliamente usado |
| facebook/deit-base-distilled-patch16-224 | ~87 M | 224×224 | métricas publicadas en ImageNet | Apache 2.0 | ampliamente usado |
| ResNet-50 (torchvision) | ~25,6 M | 224×224 | métricas publicadas en ImageNet | BSD-3 | estándar de la industria |

La comparación de rendimiento con este modelo no es posible: no hay métricas publicadas. La comparación de licencia sí es favorable (MIT es más permisiva que Apache 2.0 en cuanto a requisitos de atribución y avisos). Los modelos de referencia citados cuentan con documentación completa y comunidades activas, algo de lo que este repositorio carece.

## Limitaciones y advertencias

- Documentación inexistente: la model card solo declara la licencia. No se conocen clases, orden de las etiquetas, resolución de entrada ni preprocesado esperado, lo que impide un uso correcto sin inspeccionar el código o la configuración del checkpoint.
- Riesgo de alucinación y falsos positivos: en un clasificador de imágenes, el equivalente es la asignación segura de una clase errónea ante imágenes fuera de distribución (otras especies, iluminación atípica, fondo no vegetal). Sin métricas no puede acotarse este riesgo.
- Sesgos desconocidos: se desconoce la distribución del dataset de entrenamiento (región geográfica, especies, variedades, condiciones de captura), por lo que el modelo puede generalizar mal fuera de ese dominio.
- Ausencia de validación externa: cero descargas y cero interacciones implican que no hay evidencia de uso ni verificación por terceros.
- Restricciones de licencia: MIT permite uso comercial y modificación con conservación del aviso de copyright y del texto de la licencia. No obstante, la licencia del modelo no cubre los derechos sobre los datos de entrenamiento, cuyo origen se desconoce.
- Caveat para producción: no debe desplegarse en un sistema de decisión agronómica real sin una evaluación propia con datos representativos del cultivo objetivo y sin supervisión humana en el bucle.
- Fecha de creación registrada (2026-10-25): conviene verificar la coherencia temporal del repositorio antes de citarlo como referencia.

## Enlaces

- HuggingFace: https://huggingface.co/RuougiShiki/crop-disease-vit
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios de código ni demos.
