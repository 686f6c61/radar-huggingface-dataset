# KSAVaishnavi123/cyberbullying-distilbert

## Resumen

`cyberbullying-distilbert` es un modelo de clasificación de texto publicado en Hugging Face por el usuario KSAVaishnavi123. Se trata de un ajuste fino (fine-tuning) de DistilBERT, la variante destilada de BERT que reduce el tamaño y el coste computacional del modelo original manteniendo una parte sustancial de su rendimiento en tareas de comprensión del lenguaje. El modelo tiene 66.958.086 parámetros y un repositorio de 0,3 GB, lo que lo sitúa en la categoría de modelos ligeros aptos para inferencia en CPU y GPU de consumo.

Por el nombre y la estructura del repositorio, el modelo está orientado a la detección de ciberacoso (cyberbullying) en texto. Sin embargo, la model card publicada es prácticamente vacía: solo contiene la declaración de licencia MIT, sin información sobre el dataset de entrenamiento, las etiquetas, el rendimiento, los idiomas soportados ni el pipeline declarado. Esto limita seriamente cualquier evaluación rigurosa del modelo y obliga a tratar sus capacidades como no verificadas.

La relevancia de este modelo es, por tanto, limitada y condicionada: resulta interesante como ejemplo de modelo pequeño y de licencia permisiva para tareas de moderación de contenido, pero la ausencia de documentación y de métricas publicadas impide recomendarlo para producción sin una validación independiente previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder destilado de BERT) |
| Parametros totales | 66.958.086 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT admite hasta 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers, no documentada) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a DistilBERT, un transformer encoder de 6 capas obtenido mediante destilación por conocimiento a partir de BERT-base. DistilBERT conserva aproximadamente el 97 % del rendimiento de BERT en tareas de comprensión del lenguaje según sus autores originales, con un 40 % menos de parámetros y una velocidad de inferencia alrededor de un 60 % superior. Al ser un encoder bidireccional, no es un modelo generativo: produce representaciones contextuales que se acoplan a una cabeza de clasificación, en este caso presumiblemente una cabeza de clasificación de secuencias para detección de ciberacoso.

No hay información disponible sobre el dataset de entrenamiento, el número de tokens utilizados, la composición de las etiquetas, si se aplicó algún tipo de ajuste adicional (fine-tuning supervisado, aumento de datos) ni si se realizó validación. La model card no documenta hiperparámetros, época de entrenamiento ni proceso de evaluación. Tampoco se indica si el modelo fue entrenado desde el checkpoint preentrenado oficial de DistilBERT o desde otra variante, ni en qué idioma o idiomas se entrenó.

## Capacidades

- Clasificación de texto: el modelo está diseñado para tareas de clasificación de secuencias, presumiblemente binaria o multiclase, orientada a la detección de ciberacoso.
- Detección de contenido abusivo: por el nombre del modelo, se espera que identifique mensajes con lenguaje de acoso, aunque no hay documentación que confirme las etiquetas exactas ni los criterios de anotación.
- Inferencia ligera: al tratarse de un modelo de ~67 millones de parámetros, puede ejecutarse en CPU con latencias bajas para clasificación de textos cortos.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso ni capacidades de agente, al ser un encoder de clasificación.
- Capacidades multilingües: no disponibles; no se documenta el idioma de entrenamiento.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Moderación de comentarios en foros y redes sociales: el modelo podría clasificar mensajes entrantes y marcar aquellos con posible contenido de acoso para revisión humana. Su tamaño reducido permite desplegarlo como servicio de baja latencia en CPU, aunque requiere validación previa con datos propios.
- Filtrado previo en plataformas educativas: integrado en un pipeline de moderación de chats escolares, podría actuar como primera capa de cribado antes de un modelo mayor o de un revisor humano.
- Análisis de sentimiento tóxico en encuestas abiertas: clasificación por lotes de respuestas de texto libre para detectar agresividad, con la cautela de que la licencia MIT permite uso comercial sin restricciones.
- Prototipado rápido de sistemas de detección de abuso: al ser un modelo pequeño y de licencia permisiva, sirve como línea base para comparar con clasificadores más grandes o con APIs comerciales.
- Investigación académica sobre detección de ciberacoso: útil como punto de partida reproducible en experimentos de clasificación, siempre que se documente la validación realizada por el investigador.
- Clasificación en entornos con recursos limitados: despliegue en dispositivos periféricos o contenedores pequeños donde un modelo de mayor tamaño no cabría, gracias a sus ~67 millones de parámetros y pesos en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, recall, F1, matriz de confusión ni comparación con otros modelos, y no hay documentación del conjunto de evaluación utilizado.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 0,27 GB para los pesos (66,96 M de parámetros × 4 bytes); en fp16, alrededor de 0,13 GB. El repositorio completo ocupa 0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre es suficiente; una RTX 3060, RTX 4090, T4 o A100 funcionarían sin problema, aunque el modelo está claramente sobredimensionado para estas GPU.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en iGPU y CPU.
- Opciones de despliegue: `transformers` con PyTorch, `optimum` para exportación a ONNX, `ONNX Runtime`, `TensorRT` y `llama.cpp` no aplica (no es un modelo generativo). También es posible servirlo con `TGI` o `vLLM` en modo clasificación, aunque no está documentado.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera una latencia de milisegundos por secuencia corta en CPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KSAVaishnavi123/cyberbullying-distilbert | 66,96 M | no disponible | Clasificación de ciberacoso | MIT | Hugging Face |
| distilbert-base-uncased | 66,96 M | 512 tokens | Modelo base preentrenado | Apache 2.0 | Hugging Face |
| bert-base-uncased | 110 M | 512 tokens | Modelo base preentrenado | Apache 2.0 | Hugging Face |
| toxic-bert (unitary) | ~110 M | 512 tokens | Clasificación de toxicidad | Apache 2.0 | Hugging Face |

La comparación con `distilbert-base-uncased` es la más directa: mismo tamaño y arquitectura, pero el modelo base está ampliamente documentado y validado, mientras que `cyberbullying-distilbert` carece de documentación. `toxic-bert` es una alternativa consolidada para moderación de toxicidad, con métricas publicadas y mayor comunidad de usuarios. No se dispone de datos de rendimiento del modelo evaluado para comparar numéricamente con estas alternativas.

## Limitaciones y advertencias

- Documentación inexistente: la model card solo declara la licencia MIT; no hay información sobre dataset, etiquetas, idioma, métricas ni proceso de entrenamiento, lo que impide evaluar su calidad de forma objetiva.
- Riesgo de alucinación y falsos positivos: al ser un clasificador, no genera texto, pero puede producir clasificaciones erróneas sin que exista documentación sobre su calibración o umbrales recomendados.
- Sesgos desconocidos: sin información sobre el corpus de entrenamiento, no es posible evaluar sesgos de género, raza, dialecto o registro lingüístico.
- Limitaciones de idioma: se desconoce si el modelo fue entrenado en inglés, español u otro idioma; usarlo en un idioma distinto al de entrenamiento puede degradar gravemente su rendimiento.
- Restricciones de licencia: la licencia MIT permite uso comercial, modificación y redistribución sin restricciones, pero el usuario asume toda la responsabilidad sobre el uso y la validación del modelo.
- Caveat para producción: no se recomienda desplegarlo en producción sin una validación independiente con datos representativos del dominio objetivo, incluyendo evaluación de falsos positivos y falsos negativos.
- Fecha de creación futura: el repositorio figura creado el 2026-11-27, lo que puede indicar un error en los metadatos o un artefacto de la plataforma; conviene verificar la integridad del repositorio antes de confiar en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KSAVaishnavi123/cyberbullying-distilbert
- DistilBERT (paper original de Sanh et al.): https://arxiv.org/abs/1910.01108
- Modelo base distilbert-base-uncased: https://huggingface.co/distilbert-base-uncased
- Toxic-BERT (unitary): https://huggingface.co/unitary/toxic-bert
